"use client";
import { useEffect, useRef } from "react";
import type { Pact, PactEvent } from "@/lib/types";

const KIND: Record<PactEvent["kind"], { label: string; dot: string }> = {
  mandate: { label: "Mandate", dot: "bg-blue" },
  guard: { label: "Security", dot: "bg-stop" },
  agent: { label: "Agent", dot: "bg-sky" },
  promise: { label: "Promises", dot: "bg-sky" },
  human: { label: "Priya", dot: "bg-navy" },
  paypal: { label: "PayPal", dot: "bg-held" },
  evidence: { label: "Delivery", dot: "bg-ink-3" },
  verdict: { label: "Verdict", dot: "bg-paid" },
  webhook: { label: "PayPal webhook", dot: "bg-held" },
};

/** Every step the pact took, in order, with the ID that proves it. */
export function FlightLog({ pact }: { pact: Pact }) {
  const list = useRef<HTMLOListElement>(null);
  const n = pact.events.length;
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [n]);

  return (
    <aside aria-labelledby="log-h" className="card self-start overflow-hidden lg:sticky lg:top-[12.5rem]">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
        <h2 id="log-h" className="text-[1rem] font-semibold text-navy">
          Activity
        </h2>
        <span className="t-micro text-ink-3">every step, with its receipt</span>
      </div>
      <ol ref={list} className="max-h-[calc(100dvh-17rem)] overflow-y-auto px-5 py-4" aria-live="polite">
        {pact.events.map((e, i) => {
          const k = KIND[e.kind];
          return (
            <li key={i} className="swap relative pb-4 pl-5 last:pb-0">
              {i < n - 1 && <span aria-hidden className="absolute top-3 bottom-0 left-[3px] w-px bg-line" />}
              <span aria-hidden className={`absolute top-[7px] left-0 h-[7px] w-[7px] rounded-full ${k.dot}`} />
              <p className="t-micro flex gap-2 text-ink-3">
                <span className="font-semibold text-ink-2">{k.label}</span>
                <span className="t-num">{new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</span>
              </p>
              <p className="t-small mt-0.5 leading-snug font-medium text-ink">{e.title}</p>
              {e.detail && <p className="t-micro mt-0.5 line-clamp-3 font-normal text-ink-3">{e.detail}</p>}
              {e.ref && <p className="t-num mt-1.5 inline-block rounded-md bg-held-soft px-1.5 py-0.5 text-[0.72rem] break-all text-held">{e.ref}</p>}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
