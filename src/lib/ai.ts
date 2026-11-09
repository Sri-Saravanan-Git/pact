import "server-only";
import { GoogleGenAI, type Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export class AIBusy extends Error {}

/** Ask Gemini for JSON matching `schema`. Throws AIBusy on rate limit / timeout so the UI can say "try again". */
export async function askJSON<T>(system: string, parts: (string | Part)[], schema: object, retry = true): Promise<T> {
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: parts.map((p) => (typeof p === "string" ? { text: p } : p)) }],
      config: {
        systemInstruction: system,
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        temperature: 0.2,
        httpOptions: { timeout: 45_000 },
      },
    });
    return JSON.parse(res.text ?? "") as T;
  } catch (e) {
    const msg = String((e as Error)?.message ?? e);
    console.error("[ai]", msg.slice(0, 500));
    if (/429|RESOURCE_EXHAUSTED|timeout|aborted|503|UNAVAILABLE|overloaded/i.test(msg)) {
      // Free tier rate limits are per minute: wait what Google asks (max 20s) and try once more.
      const wait = Math.min(Number(msg.match(/retry(?:Delay)?\D{0,12}(\d+(?:\.\d+)?)s/i)?.[1] ?? 8), 20);
      if (retry) return new Promise((ok) => setTimeout(ok, wait * 1000)).then(() => askJSON<T>(system, parts, schema, false));
      throw new AIBusy("The AI is busy right now. Try again in a minute.");
    }
    throw e;
  }
}
