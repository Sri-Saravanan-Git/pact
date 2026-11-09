import type { Pact, Status } from "./types";

export type Tone = "blue" | "held" | "paid" | "stop" | "muted";

export const STATUS: Record<Status, { label: string; tone: Tone; say: string }> = {
  drafting: { label: "Planning", tone: "blue", say: "The agent is planning" },
  awaiting_agreement: { label: "Needs approval", tone: "blue", say: "Waiting for your approval" },
  agreed: { label: "Ready to fund", tone: "held", say: "Ready to put money on hold" },
  held: { label: "On hold", tone: "held", say: "Money on hold, waiting for delivery" },
  needs_fix: { label: "Fix requested", tone: "stop", say: "Delivery missed a promise" },
  verified: { label: "Verified", tone: "blue", say: "Every promise verified" },
  paid: { label: "Paid", tone: "paid", say: "Paid to the freelancer" },
  voided: { label: "Voided", tone: "muted", say: "Hold released back to you" },
};

export const TONE: Record<Tone, string> = {
  blue: "bg-check-soft text-blue",
  held: "bg-held-soft text-held",
  paid: "bg-paid-soft text-paid",
  stop: "bg-stop-soft text-stop",
  muted: "bg-canvas text-ink-3",
};

export const GATES = [
  { key: "mandate", name: "Mandate", by: "AI + code", line: "Your words become hard limits the agent cannot cross." },
  { key: "security", name: "Security", by: "Code, then AI", line: "Every listing is screened. Poisoned ones never reach the agent." },
  { key: "promises", name: "Promises", by: "AI writes, you approve", line: "What was promised, turned into checks a machine can run." },
  { key: "hold", name: "Hold", by: "PayPal", line: "PayPal authorizes the money with the freelancer as payee." },
  { key: "inspection", name: "Inspection", by: "Code, then AI", line: "Each promise is checked against the delivered files, with evidence." },
  { key: "release", name: "Release", by: "You + PayPal", line: "You capture to the freelancer, or void the hold." },
] as const;

/** Index of the gate the pact is standing at (6 = journey finished). */
export function gateOf(p: Pick<Pact, "status" | "offer" | "mandate">) {
  switch (p.status) {
    case "drafting":
      return p.offer ? 2 : p.mandate ? 1 : 0;
    case "awaiting_agreement":
      return 2;
    case "agreed":
      return 3;
    case "held":
    case "needs_fix":
      return 4;
    case "verified":
      return 5;
    default:
      return 6;
  }
}

export const money = (n: number) => `$${n.toFixed(2)}`;
export const pactCode = (id: string) => `PCT-${id.slice(0, 4).toUpperCase()}`;
export const hhmm = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
