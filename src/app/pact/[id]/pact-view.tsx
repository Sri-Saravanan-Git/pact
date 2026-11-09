"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { StatusPill } from "@/components/status-pill";
import { GATES, gateOf, money, pactCode } from "@/lib/ui";
import type { Pact } from "@/lib/types";
import { FlightLog } from "./flight-log";
import { MandateStage, SecurityStage, PromisesStage, HoldStage, InspectionStage, ReleaseStage } from "./stages";

export type Role = "client" | "freelancer";
export type Act = (action: string, extra?: object, label?: string) => Promise<Pact | null>;
type Retry = { action: string; extra?: object; label?: string } | { form: FormData };

const LABELS: Record<string, string> = {
  shop: "Agent at security — screening every listing",
  promise: "Writing promises that can be checked",
  agree: "Locking the promises",
  "card-hold": "Asking PayPal to hold the money",
  "paypal-authorize": "Asking PayPal to authorize the hold",
  release: "Asking PayPal to capture the payment",
  void: "Asking PayPal to void the hold",
  submit: "Inspecting the delivery — code checks first, then AI vision",
};

export function PactView() {
  const { id } = useParams<{ id: string }>();
  const [pact, setPact] = useState<Pact | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ msg: string; retry?: Retry } | null>(null);
  const [role, setRole] = useState<Role>("client");
  const [roleNote, setRoleNote] = useState("");
  const [seenStatus, setSeenStatus] = useState<string | null>(null);
  const driving = useRef(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/pacts/${id}`)
      .then(async (r) => ({ ok: r.ok, j: await r.json() }))
      .then(({ ok, j }) => {
        if (!alive) return;
        if (ok) setPact(j);
        else setError({ msg: j.error ?? "Could not load this pact." });
      })
      .catch(() => alive && setError({ msg: "Could not reach the server." }));
    return () => {
      alive = false;
    };
  }, [id]);

  const act: Act = useCallback(
    async (action, extra = {}, label) => {
      setBusy(label ?? LABELS[action] ?? "Working");
      setError(null);
      try {
        const r = await fetch(`/api/pacts/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Something went wrong.");
        if (j.id) setPact(j);
        return j;
      } catch (e) {
        setError({ msg: (e as Error).message, retry: { action, extra, label } });
        return null;
      } finally {
        setBusy(null);
      }
    },
    [id],
  );

  const submit = useCallback(
    async (form: FormData) => {
      setBusy(LABELS.submit);
      setError(null);
      try {
        const r = await fetch(`/api/pacts/${id}/submit`, { method: "POST", body: form });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "Inspection failed.");
        setPact(j);
      } catch (e) {
        setError({ msg: (e as Error).message, retry: { form } });
      } finally {
        setBusy(null);
      }
    },
    [id],
  );

  // The agent drives the planning gates on its own.
  useEffect(() => {
    if (!pact || pact.status !== "drafting" || driving.current || error) return;
    driving.current = true;
    (async () => {
      let p: Pact | null = pact;
      if (!p.offer) p = await act("shop");
      if (p && p.status === "drafting" && p.offer && !p.criteria) await act("promise");
      driving.current = false;
    })();
  }, [pact, act, error]);

  // Hand the screen to whoever has the next move (state adjusted during render, React's recommended pattern).
  if (pact && pact.status !== seenStatus) {
    const first = seenStatus === null;
    setSeenStatus(pact.status);
    const next: Role = pact.status === "held" || pact.status === "needs_fix" ? "freelancer" : "client";
    if (pact.status === "paid" || pact.status === "voided") setRoleNote("");
    if (next !== role) {
      setRole(next);
      if (!first) setRoleNote(next === "freelancer" ? `Money is held. Now viewing as ${pact.offer?.seller ?? "the freelancer"} to deliver the work.` : "Delivery inspected. Back to Priya to decide.");
    }
  }

  const gate = pact ? gateOf(pact) : 0;
  const current = useRef<HTMLElement>(null);
  const stageKey = pact ? `${gate}-${pact.status}-${pact.criteria?.length ?? 0}` : "";
  useEffect(() => {
    // wait a frame so the new stage has laid out before scrolling to it
    if (stageKey) requestAnimationFrame(() => current.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, [stageKey]);

  if (!pact) {
    return (
      <div className="wrap py-24">
        {error ? (
          <div role="alert">
            <h1 className="t-h1 text-navy">Pact not found</h1>
            <p className="mt-2 text-ink-2">{error.msg}</p>
            <Link href="/new" className="btn btn-primary mt-6">
              Start a pact
            </Link>
          </div>
        ) : (
          <p className="t-small animate-pulse text-ink-3">Loading pact…</p>
        )}
      </div>
    );
  }

  const amount = pact.offer?.price ?? pact.mandate?.budget ?? 0;
  const stages = [MandateStage, SecurityStage, PromisesStage, HoldStage, InspectionStage, ReleaseStage];
  // a failed inspection still lets the client decide, so the release gate opens too
  const shown = pact.status === "needs_fix" ? 5 : Math.min(gate, 5);
  const props = { pact, role, act, submit, busy };
  const roles: [Role, string][] = [
    ["client", "Priya · client"],
    ["freelancer", pact.offer?.seller ?? "Freelancer"],
  ];

  return (
    <div className="pb-24">
      {/* pinned: what this pact is, where it stands, whose turn it is */}
      <div className="glass sticky top-16 z-30 border-b border-line bg-surface/85 backdrop-blur-xl backdrop-saturate-150">
        <div className="wrap flex flex-wrap items-center gap-x-5 gap-y-3 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="t-num t-micro text-ink-3">{pactCode(pact.id)}</p>
            <h1 className="truncate text-[1.05rem] font-semibold tracking-[-0.015em] text-navy sm:text-[1.2rem]">{pact.mandate?.task ?? pact.request}</h1>
          </div>
          <p className="t-num text-[1.15rem] font-medium tracking-[-0.02em] text-navy">{money(amount)}</p>
          <StatusPill status={pact.status} />
          <div role="group" aria-label="View as" className="relative flex rounded-full bg-canvas p-1 ring-1 ring-line">
            {roles.map(([r, label]) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setRoleNote("");
                }}
                aria-pressed={role === r}
                className={`relative rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium transition-colors duration-200 ${role === r ? "text-navy" : "text-ink-3 hover:text-ink"}`}
              >
                {role === r && <motion.span layoutId="role-thumb" transition={{ type: "spring", bounce: 0, duration: 0.35 }} className="absolute inset-0 rounded-full bg-surface shadow-[var(--shadow-card)]" />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <nav aria-label="Progress" className="wrap pb-3.5">
          <ol className="relative grid grid-cols-6">
            <div aria-hidden className="absolute top-[13px] right-[calc(100%/12)] left-[calc(100%/12)] h-[2px] bg-line">
              <div className="h-full origin-left bg-blue transition-transform duration-700 ease-[var(--ease-out)]" style={{ transform: `scaleX(${Math.min(gate, 5) / 5})` }} />
            </div>
            {GATES.map((g, i) => {
              const here = i === gate;
              const done = i < gate;
              return (
                <li key={g.key} aria-current={here ? "step" : undefined} className="relative flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-[0.75rem] font-semibold transition-colors duration-300 ${
                      done ? "bg-blue text-white" : here ? "pulse bg-surface text-blue ring-2 ring-blue" : "bg-surface text-ink-3 ring-1 ring-line-2"
                    }`}
                  >
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" aria-label="done">
                        <path d="M2.5 6.3l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className={`text-[0.72rem] font-medium sm:text-[0.8rem] ${here ? "text-navy" : done ? "text-ink-2" : "text-ink-3"} ${here ? "" : "hidden sm:block"}`}>{g.name}</span>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="wrap grid gap-8 pt-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-7">
          {roleNote && (
            <div role="status" className="swap flex items-start justify-between gap-4 rounded-2xl bg-blue px-5 py-3.5 text-white shadow-[var(--shadow-blue)]">
              <span className="t-small font-medium">{roleNote}</span>
              <button className="t-small font-semibold text-white/80 hover:text-white" onClick={() => setRoleNote("")}>
                Dismiss
              </button>
            </div>
          )}
          {stages.slice(0, shown + 1).map((Stage, i) => {
            const done = i < shown || pact.status === "paid" || pact.status === "voided";
            return (
              <section key={i} ref={i === shown ? current : undefined} className="rise scroll-mt-[11.5rem]" aria-labelledby={`g${i}`}>
                <header className="mb-3 flex items-center gap-3">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-[0.72rem] font-semibold ${done ? "bg-mist text-blue" : "bg-blue text-white"}`}>{i + 1}</span>
                  <h2 id={`g${i}`} className="t-h3 text-navy">
                    {GATES[i].name}
                  </h2>
                  <span className="chip ml-auto hidden bg-surface text-ink-3 ring-1 ring-line sm:inline-flex">{GATES[i].by}</span>
                </header>
                <Stage {...props} />
              </section>
            );
          })}

          {busy && (
            <div role="status" aria-live="polite" className="card swap overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4">
                <span aria-hidden className="pulse h-2.5 w-2.5 rounded-full bg-blue" />
                <span className="t-small font-medium text-navy">{busy}…</span>
              </div>
              <div aria-hidden className="h-[2px] overflow-hidden bg-mist">
                <div className="h-full w-1/4 bg-blue" style={{ animation: "belt 1.4s var(--ease-in-out) infinite" }} />
              </div>
            </div>
          )}
          {error && !busy && (
            <div role="alert" className="swap flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stop/20 bg-stop-soft px-5 py-4">
              <span className="t-small font-medium text-stop">{error.msg}</span>
              {error.retry && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const r = error.retry!;
                    if ("form" in r) submit(r.form);
                    else act(r.action, r.extra, r.label);
                  }}
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </div>

        <FlightLog pact={pact} />
      </div>
    </div>
  );
}
