"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SplitFlap } from "./split-flap";
import { STATUS, hhmm, pactCode } from "@/lib/ui";
import type { Pact, Status } from "@/lib/types";

type Row = { id?: string; time: string; code: string; what: string; amount: string; status: Status; sample?: boolean };

// Labeled sample rows fill the board until real pacts exist.
const SAMPLE: Row[] = [
  { time: "09:40", code: "PCT-S01", what: "LOGO SAFFRON CRUMB", amount: "$140.00", status: "paid", sample: true },
  { time: "10:05", code: "PCT-S02", what: "MENU ILLUSTRATION", amount: "$90.00", status: "held", sample: true },
  { time: "10:20", code: "PCT-S03", what: "SHOP BANNER SET", amount: "$60.00", status: "needs_fix", sample: true },
  { time: "10:45", code: "PCT-S04", what: "BRAND COLOUR KIT", amount: "$120.00", status: "verified", sample: true },
  { time: "11:10", code: "PCT-S05", what: "LABEL FOR JAM JARS", amount: "$75.00", status: "voided", sample: true },
  { time: "11:30", code: "PCT-S06", what: "LOYALTY CARD DESIGN", amount: "$55.00", status: "awaiting_agreement", sample: true },
];

const toRow = (p: Pact): Row => ({
  id: p.id,
  time: hhmm(p.createdAt),
  code: pactCode(p.id),
  what: (p.mandate?.task ?? p.request).replace(/[^\w $&.,:/-]/g, ""),
  amount: p.offer ? `$${p.offer.price.toFixed(2)}` : p.mandate ? `$${p.mandate.budget.toFixed(2)}` : "",
  status: p.status,
});

export function DepartureBoard({ rows = 6 }: { rows?: number }) {
  const [live, setLive] = useState<Row[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/pacts")
        .then((r) => (r.ok ? r.json() : []))
        .then((ps: Pact[]) => alive && setLive(ps.slice(0, rows).map(toRow)))
        .catch(() => {});
    load();
    const t = setInterval(load, 10_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [rows]);

  const shown = [...live, ...SAMPLE].slice(0, rows);
  const hasSample = shown.some((r) => r.sample);

  return (
    <div className="bg-board text-flap-ink">
      <div className="wrap pt-6 pb-20 sm:pt-8 sm:pb-24">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <p className="sign-label text-sign">Departures · money waiting for proof</p>
          <p className="sign-label text-flap-dim">{hasSample ? "Dim rows are sample data" : "Live from the sandbox"}</p>
        </div>
        <div role="table" aria-label="Pact departures" className="text-[clamp(11px,1.5vw,20px)]">
          <div role="row" className="sign-label mb-2 flex gap-[1.1em] text-[0.62em] text-flap-dim">
            <span role="columnheader" className="w-[4.6em]">Time</span>
            <span role="columnheader" className="w-[7.4em]">Pact</span>
            <span role="columnheader" className="hidden w-[20.2em] sm:inline-block">For</span>
            <span role="columnheader" className="w-[8.3em]">Amount</span>
            <span role="columnheader">Status</span>
          </div>
          {shown.map((r, i) => {
            const s = STATUS[r.status];
            const cells = (
              <>
                <span role="cell" className="w-[4.6em]">
                  <SplitFlap text={r.time} length={5} delay={i * 90} />
                </span>
                <span role="cell" className="w-[7.4em]">
                  <SplitFlap text={r.code} length={7} delay={i * 90 + 120} />
                </span>
                <span role="cell" className="hidden w-[20.2em] sm:inline-block">
                  <SplitFlap text={r.what} length={20} delay={i * 90 + 200} />
                </span>
                <span role="cell" className="w-[8.3em]">
                  <SplitFlap text={r.amount} length={8} delay={i * 90 + 320} />
                </span>
                <span role="cell" style={{ color: s.color }}>
                  <SplitFlap text={s.flap} length={8} delay={i * 90 + 400} style={{ color: s.color }} />
                </span>
              </>
            );
            const cls = `flex gap-[1.1em] py-[0.18em] ${r.sample ? "opacity-55" : ""}`;
            return r.id ? (
              <Link key={r.id} href={`/pact/${r.id}`} role="row" className={`${cls} no-underline hover:bg-white/5`} aria-label={`${r.code} ${r.what} ${s.flap}`}>
                {cells}
              </Link>
            ) : (
              <div key={r.code} role="row" className={cls}>
                {cells}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
