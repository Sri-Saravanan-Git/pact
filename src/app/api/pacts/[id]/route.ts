import { getPact, savePact } from "@/lib/db";
import { log, shop, writePromises, UserError } from "@/lib/flow";
import { fail } from "@/lib/http";
import * as paypal from "@/lib/paypal";
import type { Pact, Status } from "@/lib/types";

export const maxDuration = 60;

async function load(id: string) {
  const p = await getPact(id);
  if (!p) throw new UserError("Pact not found.");
  // Deadline passed with money still on hold: release it back to the client.
  if (p.deadline && Date.parse(p.deadline) < Date.now() && ["held", "needs_fix"].includes(p.status) && p.paypal.authorizationId) {
    try {
      await paypal.voidHold(p.paypal.authorizationId);
    } catch (e) {
      console.error("auto-void failed", e); // keep the page usable; the client can still void by hand
      return p;
    }
    p.status = "voided";
    log(p, { kind: "paypal", title: "Deadline missed — hold voided", detail: "Funds released back to the client", ref: p.paypal.authorizationId });
    await savePact(p);
  }
  return p;
}

export async function GET(_: Request, ctx: RouteContext<"/api/pacts/[id]">) {
  try {
    return Response.json(await load((await ctx.params).id));
  } catch (e) {
    return fail(e);
  }
}

function need(p: Pact, ...s: Status[]) {
  if (!s.includes(p.status)) throw new UserError(`This step is not available while the pact is "${p.status.replace("_", " ")}".`);
}

export async function POST(req: Request, ctx: RouteContext<"/api/pacts/[id]">) {
  try {
    const p = await load((await ctx.params).id);
    const { action, orderId } = await req.json();
    const desc = `Pact ${p.id}: ${p.mandate?.task ?? "work"}`;

    switch (action) {
      case "shop":
        need(p, "drafting");
        if (!p.offer) await shop(p);
        break;
      case "promise":
        need(p, "drafting");
        if (!p.offer) throw new UserError("The agent has not chosen an offer yet.");
        await writePromises(p);
        p.status = "awaiting_agreement";
        break;
      case "agree":
        need(p, "awaiting_agreement");
        p.status = "agreed";
        log(p, { kind: "human", title: "Client approved the promises", detail: `${p.criteria!.length} promises locked in` });
        break;
      case "paypal-create": {
        need(p, "agreed");
        const id = await paypal.createOrder(p.id, p.offer!.price, desc);
        p.paypal.orderId = id;
        log(p, { kind: "paypal", title: "PayPal order created (intent AUTHORIZE)", ref: id });
        await savePact(p);
        return Response.json({ orderId: id });
      }
      case "paypal-authorize": {
        need(p, "agreed");
        if (!orderId || orderId !== p.paypal.orderId) throw new UserError("Order does not match this pact.");
        const a = await paypal.authorizeOrder(orderId);
        hold(p, a.authorizationId, a.expires, "PayPal buyer approval");
        break;
      }
      case "card-hold": {
        need(p, "agreed");
        const a = await paypal.holdWithTestCard(p.id, p.offer!.price, desc);
        p.paypal.orderId = a.orderId;
        hold(p, a.authorizationId, a.expires, "PayPal sandbox test card");
        break;
      }
      case "release": {
        need(p, "verified", "needs_fix");
        if (p.status === "needs_fix") log(p, { kind: "human", title: "Client released payment despite failed checks", detail: "Human override — the AI only advises" });
        else log(p, { kind: "human", title: "Client confirmed the verdict" });
        const c = await paypal.capture(p.paypal.authorizationId!);
        p.paypal.captureId = c.captureId;
        p.status = "paid";
        log(p, { kind: "paypal", title: `Captured $${p.offer!.price} to ${p.offer!.seller}`, detail: `Capture ${c.status}`, ref: c.captureId });
        break;
      }
      case "void": {
        need(p, "held", "needs_fix", "verified");
        await paypal.voidHold(p.paypal.authorizationId!);
        p.status = "voided";
        log(p, { kind: "paypal", title: "Hold voided by client", detail: "Funds released back to the client", ref: p.paypal.authorizationId });
        break;
      }
      default:
        throw new UserError("Unknown action.");
    }
    return Response.json(await savePact(p));
  } catch (e) {
    return fail(e);
  }
}

function hold(p: Pact, authorizationId: string, expires: string, via: string) {
  p.paypal.authorizationId = authorizationId;
  p.paypal.authExpires = expires;
  p.status = "held";
  p.deadline = new Date(Date.now() + p.mandate!.deadlineDays * 86_400_000).toISOString();
  log(p, { kind: "paypal", title: `$${p.offer!.price} held by PayPal`, detail: `Authorized via ${via}. Payee: ${p.offer!.seller}`, ref: authorizationId });
}
