"use client";
import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { GATES } from "@/lib/ui";

/** One route line governs the section; gates hang from it and a NOW light follows the scroll. */
export function GatesRoute() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 45%"] });
  const [now, setNow] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setNow(Math.min(GATES.length - 1, Math.max(0, Math.floor(v * GATES.length)))));

  return (
    <ol ref={ref} className="relative grid gap-0 md:grid-cols-6">
      {/* the route */}
      <div aria-hidden className="absolute top-[26px] right-0 left-0 hidden h-[3px] bg-ink md:block" />
      <div aria-hidden className="absolute top-0 bottom-0 left-[25px] w-[3px] bg-ink md:hidden" />
      {GATES.map((g, i) => {
        const passed = i < now;
        const here = i === now;
        return (
          <li key={g.key} className="relative grid grid-cols-[54px_1fr] gap-4 pb-8 md:block md:pr-5 md:pb-0">
            <div
              className={`relative z-10 flex h-[54px] w-[54px] items-center justify-center border-[3px] border-ink font-sign text-[1.35rem] font-extrabold transition-colors duration-500 ${
                here ? "bg-sign text-sign-ink" : passed ? "bg-ink text-sign" : "bg-concrete text-ink"
              }`}
            >
              G{i + 1}
              {here && <span aria-hidden className="now-light absolute -top-2 -right-2 h-3.5 w-3.5 rounded-full border-2 border-ink bg-paid" />}
            </div>
            <div className="md:mt-5">
              <h3 className="text-[1.6rem] font-extrabold uppercase">{g.name}</h3>
              <p className="mt-1 max-w-[24ch] text-ink-2">{g.line}</p>
              <p className="sign-label mt-3 inline-block border border-ink px-2 py-0.5">{g.by}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
