"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,:-/#&";
const STEP_MS = 70;

function Cell({ target, delay }: { target: string; delay: number }) {
  const still = useReducedMotion();
  const [cur, setCur] = useState(" ");
  const [prev, setPrev] = useState(" ");
  const [tick, setTick] = useState(0);
  const at = useRef(" ");

  useEffect(() => {
    if (still) return;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const c = at.current;
      if (c === target) return;
      const i = CHARS.indexOf(c);
      const goal = CHARS.indexOf(target);
      // walk the drum like a real flap unit, but never more than ~7 flips
      let next: string;
      if (i < 0 || goal < 0) next = target;
      else {
        const dist = (goal - i + CHARS.length) % CHARS.length;
        next = dist > 7 ? CHARS[(goal - 6 + CHARS.length) % CHARS.length] : CHARS[(i + 1) % CHARS.length];
      }
      setPrev(c);
      setCur(next);
      setTick((k) => k + 1);
      at.current = next;
      timer = setTimeout(step, STEP_MS);
    };
    timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [target, delay, still]);

  if (still)
    return (
      <span className="flap" aria-hidden>
        <span className="t">
          <i>{target}</i>
        </span>
        <span className="b">
          <i>{target}</i>
        </span>
      </span>
    );

  return (
    <span className="flap" aria-hidden>
      <span className="t">
        <i>{cur}</i>
      </span>
      <span className="b">
        <i>{prev}</i>
      </span>
      {tick > 0 && (
        <span key={`t${tick}`} className="t ft">
          <i>{prev}</i>
        </span>
      )}
      {tick > 0 && (
        <span key={`b${tick}`} className="b fb">
          <i>{cur}</i>
        </span>
      )}
    </span>
  );
}

/** A row of split-flap cells. Flips only when `text` changes. */
export function SplitFlap({
  text,
  length,
  delay = 0,
  className,
  style,
}: {
  text: string;
  length: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const target = text.toUpperCase().padEnd(length, " ").slice(0, length);
  return (
    <span className={className} style={{ whiteSpace: "nowrap", ...style }}>
      <span className="sr-only">{text}</span>
      {[...target].map((c, i) => (
        <Cell key={i} target={c} delay={delay + i * 28} />
      ))}
    </span>
  );
}
