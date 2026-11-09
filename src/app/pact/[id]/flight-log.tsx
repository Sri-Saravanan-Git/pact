"use client";
import { useEffect, useRef } from "react";
import type { Pact, PactEvent } from "@/lib/types";

const KIND: Record<PactEvent["kind"], { label: string; color: string }> = {
  mandate: { label: "MANDATE", color: "var(--color-sign)" },
  guard: { label: "SECURITY", color: "var(--color-stop)" },
  agent: { label: "AGENT", color: "var(--color-check)" },
  promise: { label: "PROMISE", color: "var(--color-check)" },
  human: { label: "PRIYA", color: "var(--color-flap-ink)" },
  paypal: { label: "PAYPAL", color: "var(--color-held)" },
  evidence: { label: "DELIVERY", color: "var(--color-flap-ink)" },
  verdict: { label: "VERDICT", color: "var(--color-paid)" },
  webhook: { label: "WEBHOOK", color: "var(--color-held)" },
};

/** Every step the pact took, in order, with the ID that proves it. */
export function FlightLog({ pact }: { pact: Pact }) {
  const list = useRef<HTMLOListElement>(null);
  const n = pact.events.length;
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [n]);
  return (
    <aside aria-labelledby="log-h" className="self-start bg-board text-flap-ink lg:sticky lg:top-[13.5rem]">
      <div className="flex items-baseline justify-between border-b border-white/10 px-5 py-4">
        <h2 id="log-h" className="font-sign text-[1.25rem] font-extrabold uppercase text-sign">
          Flight log
        </h2>
        <span className="num text-[0.75rem] text-flap-dim">{pact.events.length} entries</span>
      </div>
      <ol ref={list} className="max-h-[calc(100dvh-18.5rem)] overflow-y-auto px-5 py-3" aria-live="polite">
        {pact.events.map((e, i) => {
          const k = KIND[e.kind];
          return (
            <li key={i} className="relative border-l border-white/15 pb-4 pl-4 last:pb-1">
              <span aria-hidden className="absolute top-1.5 -left-[4px] h-[7px] w-[7px]" style={{ background: k.color }} />
              <p className="num flex gap-2 text-[0.7rem] text-flap-dim">
                <span>{new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
                <span style={{ color: k.color }}>{k.label}</span>
              </p>
              <p className="mt-0.5 text-[0.95rem] leading-snug">{e.title}</p>
              {e.detail && <p className="mt-0.5 line-clamp-3 text-[0.82rem] text-flap-dim">{e.detail}</p>}
              {e.ref && <p className="num mt-1 inline-block bg-white/8 px-1.5 text-[0.75rem] break-all text-held">{e.ref}</p>}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
