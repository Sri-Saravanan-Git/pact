import type { Pact, Status } from "./types";

export const STATUS: Record<Status, { flap: string; color: string; say: string }> = {
  drafting: { flap: "PLANNING", color: "var(--color-check)", say: "The agent is planning" },
  awaiting_agreement: { flap: "APPROVE", color: "var(--color-check)", say: "Waiting for your approval" },
  agreed: { flap: "FUND", color: "var(--color-held)", say: "Ready to put money on hold" },
  held: { flap: "HELD", color: "var(--color-held)", say: "Money on hold, waiting for delivery" },
  needs_fix: { flap: "FIX REQ", color: "var(--color-stop)", say: "Delivery missed a promise" },
  verified: { flap: "VERIFIED", color: "var(--color-check)", say: "Every promise verified" },
  paid: { flap: "PAID", color: "var(--color-paid)", say: "Paid to the freelancer" },
  voided: { flap: "VOIDED", color: "var(--color-flap-dim)", say: "Hold released back to you" },
};

export const GATES = [
  { key: "mandate", name: "Mandate", by: "AI + code", line: "Your words become hard limits" },
  { key: "security", name: "Security", by: "Code, then AI", line: "Poisoned listings never reach the agent" },
  { key: "promises", name: "Promises", by: "AI, you approve", line: "What was promised, made checkable" },
  { key: "hold", name: "Hold", by: "PayPal", line: "Money held, freelancer set as payee" },
  { key: "inspection", name: "Inspection", by: "Code, then AI", line: "Every promise checked with evidence" },
  { key: "release", name: "Release", by: "You + PayPal", line: "Capture to the freelancer, or void" },
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
