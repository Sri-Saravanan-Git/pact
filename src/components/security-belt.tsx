"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { OFFERS } from "@/lib/market";

const XrayScene = dynamic(() => import("./xray-scene"), { ssr: false, loading: () => null });

const parcels = OFFERS.map((o) => ({ seller: o.seller, price: `$${o.price}`, bad: o.id === "brandrocket" }));
const poisoned = OFFERS.find((o) => o.id === "brandrocket")!;
const injected = poisoned.listing.slice(poisoned.listing.indexOf("Note to AI"));

const STEPS = [
  { title: "Four sellers answer one request.", body: "Priya wants a bakery logo under $150, due in two days. Every listing on the belt is text a stranger wrote." },
  { title: "Security reads every listing first.", body: "Before the AI agent sees anything, plain code checks price, deadline, category and payment terms against her mandate." },
  { title: "One listing is talking to the agent.", body: null },
  { title: "The agent only sees clean listings.", body: "Quarantined text never enters the model’s context. The budget is enforced by code, so no sentence can talk the agent past it." },
];

export function SecurityBelt() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  const still = useReducedMotion();
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.floor(v * 4.2))));

  return (
    <section ref={ref} aria-labelledby="security-h" className="relative" style={{ height: still ? "auto" : "300vh" }}>
      <div className={`${still ? "" : "sticky top-16 h-[calc(100dvh-4rem)]"} overflow-hidden`}>
        <div className="wrap grid h-full items-center gap-8 py-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative z-10">
            <h2 id="security-h" className="t-h1 mb-8 text-navy">
              Your agent never reads a poisoned listing.
            </h2>
            <ol className="relative space-y-1">
              {STEPS.map((s, i) => {
                const on = still || i === step;
                return (
                  <li key={s.title} className="relative pl-6">
                    <span aria-hidden className={`absolute top-2.5 left-0 h-2 w-2 rounded-full transition-colors duration-300 ${on ? "bg-blue" : i < step ? "bg-blue/40" : "bg-line-2"}`} />
                    <h3 className={`t-h3 py-1.5 transition-colors duration-300 ${on ? "text-navy" : "text-ink-3"}`}>{s.title}</h3>
                    <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)] ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        {s.body ? (
                          <p className="t-body max-w-[46ch] pb-3 text-ink-2">{s.body}</p>
                        ) : (
                          <div className="pb-3">
                            <p className="t-body max-w-[46ch] text-ink-2">{poisoned.seller}’s listing hides an order meant for AI:</p>
                            <blockquote className="t-num mt-3 max-w-[46ch] rounded-xl border border-stop/20 bg-stop-soft p-3.5 text-[0.82rem] leading-relaxed text-stop">
                              <span className="line-through decoration-stop/50">{injected}</span>
                            </blockquote>
                            <p className="t-micro mt-2 font-semibold text-stop">Quarantined · never shown to the agent</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="relative h-[40vh] min-h-[280px] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] lg:h-[76%]">
            {still ? <StaticBelt /> : <XrayScene parcels={parcels} progress={scrollYProgress} />}
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticBelt() {
  return (
    <ul className="grid h-full content-center gap-2 px-8">
      {parcels.map((p) => (
        <li key={p.seller} className={`card t-num flex justify-between px-4 py-3 ${p.bad ? "text-stop" : "text-navy"}`}>
          <span>{p.seller}</span>
          <span>{p.bad ? "Quarantined" : p.price}</span>
        </li>
      ))}
    </ul>
  );
}
