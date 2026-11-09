"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusPill } from "./status-pill";
import { hhmm, money, pactCode } from "@/lib/ui";
import type { Pact } from "@/lib/types";

/** Real pacts from the sandbox, refreshed every 10s. */
export function LiveActivity({ limit = 5 }: { limit?: number }) {
  const [rows, setRows] = useState<Pact[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/pacts")
        .then((r) => (r.ok ? r.json() : []))
        .then((ps: Pact[]) => alive && setRows(ps.slice(0, limit)))
        .catch(() => alive && setRows([]));
    load();
    const t = setInterval(load, 10_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [limit]);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <p className="t-small flex items-center gap-2 font-medium text-navy">
          <span aria-hidden className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-paid opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-paid" />
          </span>
          Live from the PayPal sandbox
        </p>
        <Link href="/board" className="t-small font-medium text-blue hover:underline">
          Open board
        </Link>
      </div>
      {rows === null ? (
        <ul aria-label="Loading" className="divide-y divide-line">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="h-14 animate-pulse bg-canvas/60" />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="t-small px-5 py-6 text-ink-3">No pacts yet. Start the first one.</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((p) => (
            <li key={p.id}>
              <Link href={`/pact/${p.id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-canvas sm:grid-cols-[4.5rem_auto_1fr_auto_auto]">
                <span className="t-num t-micro hidden text-ink-3 sm:block">{hhmm(p.createdAt)}</span>
                <span className="t-num text-[0.8rem] text-ink-3">{pactCode(p.id)}</span>
                <span className="t-small truncate font-medium text-ink">{p.mandate?.task ?? p.request}</span>
                <span className="t-num t-small hidden text-navy sm:block">{money(p.offer?.price ?? p.mandate?.budget ?? 0)}</span>
                <StatusPill status={p.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
