import { AIBusy } from "./ai";
import { UserError } from "./flow";

export function fail(e: unknown) {
  if (e instanceof UserError) return Response.json({ error: e.message }, { status: 400 });
  if (e instanceof AIBusy) return Response.json({ error: e.message }, { status: 503 });
  console.error(e);
  const msg = e instanceof Error && e.message.startsWith("PayPal") ? e.message : "Something went wrong. Please try again.";
  return Response.json({ error: msg }, { status: 500 });
}
