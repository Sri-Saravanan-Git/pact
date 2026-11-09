"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

// the theme lives on <html data-theme>; read it as an external store
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

function apply(t: Theme) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem("pact-theme", t);
  } catch {}
}

/**
 * Theme switch as a coin toss. Gold sun face = light, silver moon face = dark.
 * Click: the coin is tossed (lifts, spins on its edge, lands with a small settle),
 * sparks burst where it lands, and the new theme spreads from the coin as a circle.
 */
export function CoinToggle({ onDark = false }: { onDark?: boolean }) {
  const still = useReducedMotion();
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light" as Theme);
  const [sparks, setSparks] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const spin = useMotionValue(0);
  const lift = useMotionValue(0);
  const shadow = useTransform(lift, [0, -14], [1, 0.45]);
  const busy = useRef(false);

  useEffect(() => {
    spin.set(currentTheme() === "dark" ? 180 : 0);
  }, [spin]);

  async function toss() {
    if (busy.current) return;
    busy.current = true;
    const next: Theme = theme === "dark" ? "light" : "dark";
    const target = spin.get() + 540; // one and a half turns: lands showing the other face

    const r = btn.current!.getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${r.left + r.width / 2}px`);
    root.style.setProperty("--vt-y", `${r.top + r.height / 2}px`);
    root.style.setProperty("--vt-r", `${Math.hypot(Math.max(r.left, innerWidth - r.left), Math.max(r.top, innerHeight - r.top))}px`);

    const swap = () => apply(next);

    if (still) {
      spin.set(next === "dark" ? 180 : 0);
      swap();
      busy.current = false;
      return;
    }

    // toss: up and spinning, then down with a little settle
    animate(lift, [0, -16, 0], { duration: 0.62, times: [0, 0.45, 1], ease: ["easeOut", [0.5, 0, 0.75, 0]] });
    await animate(spin, target, { type: "spring", stiffness: 70, damping: 12, mass: 0.9, restDelta: 0.5 }).then(() => undefined);
    spin.set(next === "dark" ? 180 : 0);
    setSparks((n) => n + 1);

    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition) doc.startViewTransition(swap);
    else swap();
    busy.current = false;
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      ref={btn}
      type="button"
      onClick={toss}
      aria-label={label}
      title={label}
      className={`group relative grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors duration-200 ${onDark ? "hover:bg-white/10" : "hover:bg-mist"}`}
    >
      {/* ground shadow shrinks as the coin rises */}
      <motion.span aria-hidden style={{ scaleX: shadow, opacity: shadow }} className="absolute bottom-[3px] h-1 w-5 rounded-full bg-black/25 blur-[1.5px]" />
      <motion.span aria-hidden style={{ y: lift }} className="relative block h-[26px] w-[26px] [perspective:300px]">
        <motion.span style={{ rotateY: spin }} className="relative block h-full w-full [transform-style:preserve-3d]">
          {/* SUN face (light) */}
          <span className="coin-face coin-gold absolute inset-0 grid place-items-center rounded-full [backface-visibility:hidden]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a4a00" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="12" cy="12" r="4.2" fill="#7a4a00" stroke="none" />
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
            </svg>
          </span>
          {/* MOON face (dark) */}
          <span className="coin-face coin-silver absolute inset-0 grid place-items-center rounded-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
              <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="#1d2f6b" />
              <path d="M17.5 3.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="#1d2f6b" />
            </svg>
          </span>
        </motion.span>
      </motion.span>
      {/* sparks on landing */}
      {sparks > 0 && (
        <span key={sparks} aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="coin-spark absolute top-1/2 left-1/2 h-1 w-1 rounded-full" style={{ "--a": `${(i * 360) / 7}deg` } as React.CSSProperties} />
          ))}
        </span>
      )}
    </button>
  );
}
