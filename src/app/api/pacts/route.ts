import { listPacts, pactsCreatedToday, savePact } from "@/lib/db";
import { makeMandate, log } from "@/lib/flow";
import { fail } from "@/lib/http";
import type { Pact } from "@/lib/types";

export const maxDuration = 60;

export async function GET() {
  return Response.json(await listPacts());
}

export async function POST(req: Request) {
  try {
    const { request } = await req.json();
    const text = String(request ?? "").trim().slice(0, 600);
    if (text.length < 10) return Response.json({ error: "Describe what you need in a sentence or two." }, { status: 400 });
    // Known limit: global daily cap protects the free AI quota; per-IP limits if abuse shows up
    if ((await pactsCreatedToday()) > 300) return Response.json({ error: "Demo limit reached for today. Try the sample pact instead." }, { status: 429 });

    const p: Pact = { id: crypto.randomUUID().slice(0, 8), createdAt: new Date().toISOString(), request: text, status: "drafting", paypal: {}, submissions: [], events: [] };
    p.mandate = await makeMandate(text);
    log(p, { kind: "mandate", title: `Mandate set — max $${p.mandate.budget}, ${p.mandate.deadlineDays} days`, detail: p.mandate.deliverables.join(" · ") });
    return Response.json(await savePact(p));
  } catch (e) {
    return fail(e);
  }
}
