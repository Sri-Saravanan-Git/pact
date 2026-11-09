"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { GATES } from "@/lib/ui";

const ICONS: Record<string, React.ReactNode> = {
  mandate: <path d="M6 4h9l3 3v13H6zM9 10h6M9 14h6M9 18h3" />,
  security: <path d="M12 3l7 2.5v5c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5v-5zM9 12l2 2 4-4" />,
  promises: <path d="M5 7h2M5 12h2M5 17h2M10 7h9M10 12h9M10 17h6" />,
  hold: <path d="M5 11V8a7 7 0 0114 0v3M4 11h16v9H4zM12 15v2" />,
  inspection: <path d="M11 4a7 7 0 105 12l4 4M8 11l2 2 4-4" />,
  release: <path d="M4 12h12M12 6l6 6-6 6M20 5v14" />,
};

/** A vertical route; the blue line fills as you scroll, each gate lights as it is reached. */
export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  return (
    <ol ref={ref} className="relative">
      <div aria-hidden className="absolute top-3 bottom-3 left-[23px] w-[2px] bg-line" />
      <motion.div aria-hidden style={{ scaleY: fill }} className="absolute top-3 bottom-3 left-[23px] w-[2px] origin-top bg-blue" />
      {GATES.map((g, i) => (
        <motion.li
          key={g.key}
          initial={{ opacity: 0.35 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "0px 0px -35% 0px" }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="relative grid grid-cols-[48px_1fr] gap-5 pb-10 last:pb-0"
        >
          <span className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl border border-line bg-surface text-blue shadow-[var(--shadow-card)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ICONS[g.key]}
            </svg>
          </span>
          <div className="pt-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="t-h3 text-navy">
                <span className="t-num mr-2 text-[0.85rem] font-normal text-ink-3">{i + 1}</span>
                {g.name}
              </h3>
              <span className="chip bg-canvas text-ink-2">{g.by}</span>
            </div>
            <p className="t-body mt-1 max-w-[52ch] text-ink-2">{g.line}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
