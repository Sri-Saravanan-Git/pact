import type { Mandate, Offer, OfferReview } from "./types";

// Deterministic rules. The model never gets to decide these.
const INJECTION = [
  /ignore (all |your |any )?(previous |prior )?instructions[^.]*\.?/i,
  /(budget|limit) (has )?changed[^.]*\.?/i,
  /note to (ai|agents?|assistants?)[^.]*\.?/i,
  /(system|developer) (prompt|message)\s*:[^.]*\.?/i,
  /you (must|are required to) (select|choose|pay|buy)[^.]*\.?/i,
];
const OFF_RULES = /\b(upfront|up-front|wire transfer|gift card|crypto|outside paypal)\b/i;

export function review(m: Mandate, o: Offer): OfferReview {
  // Quote every sentence that carries an instruction, so the person sees exactly what was removed.
  const sentences = o.listing.match(/[^.!?]+[.!?]?/g) ?? [o.listing];
  const first = sentences.findIndex((s) => INJECTION.some((re) => re.test(s)));
  if (first >= 0) {
    const hits = sentences.slice(first).filter((s, i) => i === 0 || INJECTION.some((re) => re.test(s)) || OFF_RULES.test(s) || /\b(select|choose) this offer\b/i.test(s));
    return {
      offerId: o.id,
      verdict: "quarantined",
      reasons: ["Listing contains instructions aimed at AI agents (prompt injection)", "Removed before the agent could read it"],
      injection: hits.join("").trim(),
    };
  }
  const reasons: string[] = [];
  if (o.price > m.budget) reasons.push(`$${o.price} is over the $${m.budget} limit`);
  if (o.deliveryDays > m.deadlineDays) reasons.push(`${o.deliveryDays}-day delivery misses the ${m.deadlineDays}-day deadline`);
  if (m.category !== "other" && o.category !== m.category) reasons.push(`Category "${o.category}" is outside the mandate`);
  if (OFF_RULES.test(o.listing)) reasons.push("Asks for payment terms outside the mandate");
  return { offerId: o.id, verdict: reasons.length ? "rejected" : "eligible", reasons: reasons.length ? reasons : ["Within budget, deadline and category"] };
}
