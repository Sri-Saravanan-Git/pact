import "server-only";
import { createHash } from "node:crypto";
import { GoogleGenAI, type Part } from "@google/genai";
import { cacheGet, cachePut } from "./db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Free-tier quotas are per model, so a chain of models multiplies headroom.
// Lite first: fastest and the largest daily quota; full Flash models back it up.
export const MODELS = (process.env.GEMINI_MODELS || "gemini-3.5-flash-lite,gemini-3.5-flash,gemini-3.6-flash").split(",").map((m) => m.trim());

export class AIBusy extends Error {}

// busy, out of quota, or not offered to this key: move on to the next model
const busyErr = (msg: string) => /429|RESOURCE_EXHAUSTED|timeout|aborted|503|UNAVAILABLE|overloaded|quota|404|NOT_FOUND/i.test(msg);

function keyOf(system: string, parts: (string | Part)[], schema: object) {
  const h = createHash("sha256");
  h.update(system);
  h.update(JSON.stringify(schema));
  for (const p of parts) h.update(typeof p === "string" ? p : (p.inlineData?.data ?? JSON.stringify(p)));
  return h.digest("hex");
}

/**
 * Ask Gemini for JSON matching `schema`.
 * Identical questions are answered from a cache (the sample pact costs no quota after its first run).
 * On rate limits the next model in the chain is tried; only when all are busy does it throw AIBusy.
 */
export async function askJSON<T>(system: string, parts: (string | Part)[], schema: object): Promise<T> {
  const key = keyOf(system, parts, schema);
  const hit = await cacheGet(key).catch(() => null);
  if (hit) return hit as T;

  for (const model of MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: parts.map((p) => (typeof p === "string" ? { text: p } : p)) }],
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
          responseJsonSchema: schema,
          temperature: 0.2,
          httpOptions: { timeout: 30_000 },
        },
      });
      const out = JSON.parse(res.text ?? "") as T;
      await cachePut(key, out).catch(() => {});
      return out;
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      console.error(`[ai] ${model}:`, msg.slice(0, 300));
      if (!busyErr(msg)) throw e;
    }
  }
  throw new AIBusy("The AI is busy right now. Try again in a minute.");
}
