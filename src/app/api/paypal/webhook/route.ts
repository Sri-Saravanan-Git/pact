import { findPactByPaypal, savePact } from "@/lib/db";
import { log } from "@/lib/flow";
import { verifyWebhook } from "@/lib/paypal";

const NAMES: Record<string, string> = {
  "PAYMENT.AUTHORIZATION.CREATED": "PayPal confirmed the hold",
  "PAYMENT.CAPTURE.COMPLETED": "PayPal confirmed the payment landed",
  "PAYMENT.AUTHORIZATION.VOIDED": "PayPal confirmed the hold was voided",
};

/** PayPal tells us independently what happened to the money; we only log events we can verify. */
export async function POST(req: Request) {
  const event = await req.json().catch(() => null);
  if (!event?.event_type || !process.env.PAYPAL_WEBHOOK_ID) return new Response("ignored", { status: 200 });
  if (!(await verifyWebhook(req.headers, event).catch(() => false))) return new Response("bad signature", { status: 400 });

  const title = NAMES[event.event_type];
  if (!title) return new Response("ok");
  const r = event.resource ?? {};
  const rel = r.supplementary_data?.related_ids ?? {};
  const p = await findPactByPaypal([r.id, rel.order_id, rel.authorization_id]);
  if (!p || p.events.some((e) => e.kind === "webhook" && e.detail?.includes(event.id))) return new Response("ok");

  log(p, { kind: "webhook", title, detail: `${event.event_type} · event ${event.id}`, ref: r.id });
  await savePact(p);
  return new Response("ok");
}
