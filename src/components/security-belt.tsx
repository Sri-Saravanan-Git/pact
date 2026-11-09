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
  {
    title: "Four sellers answer one request.",
    body: "Priya asked for a bakery logo under $150, due in two days. Every listing on the belt is text a stranger wrote.",
  },
  {
    title: "Security reads every listing first.",
    body: "Before the AI agent sees anything, plain code checks price, deadline, category and payment terms against Priya’s mandate.",
  },
  {
    title: "One listing is talking to the agent.",
    body: null,
  },
  {
    title: "The agent only ever sees clean listings.",
    body: "Quarantined text never enters the model’s context. The budget is enforced by code, so no sentence can talk the agent past it.",
  },
];

export function SecurityBelt() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  const still = useReducedMotion();
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.floor(v * 4.2))));

  return (
    <section ref={ref} aria-labelledby="security-h" className="relative bg-concrete" style={{ height: still ? "auto" : "320vh" }}>
      <div className={`${still ? "" : "sticky top-16 h-[calc(100dvh-4rem)]"} overflow-hidden`}>
        <div className="wrap grid h-full items-center gap-6 py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative z-10">
            <p className="sign-label mb-5 inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-sign">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M8 1.5l5.5 2v4.2c0 3.3-2.3 5.8-5.5 6.8-3.2-1-5.5-3.5-5.5-6.8V3.5z" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              Security · Gate 2
            </p>
            <h2 id="security-h" className="mb-6 text-[clamp(2.4rem,5vw,4.4rem)] font-extrabold uppercase">
              No listing gets to whisper to your agent.
            </h2>
            <ol className="relative space-y-1 border-l border-ink/25">
              {STEPS.map((s, i) => {
                const on = still || i === step;
                return (
                  <li key={s.title} className={`-ml-px border-l-[3px] py-2 pl-5 transition-[border-color,opacity] duration-500 ${on ? "border-ink opacity-100" : "border-transparent opacity-40"}`}>
                    <h3 className="text-[1.35rem] font-bold">{s.title}</h3>
                    <div className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                      <div className="overflow-hidden">
                        {s.body ? (
                          <p className="max-w-[46ch] pt-1 text-ink-2">{s.body}</p>
                        ) : (
                          <div className="pt-2">
                            <p className="max-w-[46ch] text-ink-2">{poisoned.seller}’s listing hides an order meant for AI:</p>
                            <blockquote className="num mt-2 max-w-[46ch] bg-board p-3 text-[0.82rem] leading-relaxed text-flap-ink">
                              <span className="bg-stop/25 text-[#ff8a8d] line-through decoration-stop">{injected}</span>
                            </blockquote>
                            <p className="sign-label mt-2 text-stop">Quarantined · never shown to the agent</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="relative h-[42vh] min-h-[280px] [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] lg:h-[78%]">
            {still ? (
              <StaticBelt />
            ) : (
              <XrayScene parcels={parcels} progress={scrollYProgress} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StaticBelt() {
  return (
    <ul className="grid h-full content-center gap-2">
      {parcels.map((p) => (
        <li key={p.seller} className={`num flex justify-between px-4 py-3 ${p.bad ? "bg-stop text-white" : "bg-board text-flap-ink"}`}>
          <span>{p.seller.toUpperCase()}</span>
          <span>{p.bad ? "QUARANTINED" : p.price}</span>
        </li>
      ))}
    </ul>
  );
}
