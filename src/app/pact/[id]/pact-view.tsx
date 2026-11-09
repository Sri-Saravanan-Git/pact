"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SplitFlap } from "@/components/split-flap";
import { GATES, STATUS, gateOf, money, pactCode } from "@/lib/ui";
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
    if (next !== role) {
      setRole(next);
      if (!first) setRoleNote(next === "freelancer" ? `Money is held. Now viewing as ${pact.offer?.seller ?? "the freelancer"} to deliver the work.` : "Delivery inspected. Back to Priya to decide.");
    }
  }

  const gate = pact ? gateOf(pact) : 0;
  const current = useRef<HTMLElement>(null);
  const stageKey = pact ? `${gate}-${pact.status}-${pact.criteria?.length ?? 0}` : "";
  useEffect(() => {
    if (stageKey) current.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stageKey]);

  if (!pact) {
    return (
      <div className="wrap py-24">
        {error ? (
          <div role="alert">
            <h1 className="text-[2.4rem] font-extrabold uppercase">Pact not found</h1>
            <p className="mt-2 text-ink-2">{error.msg}</p>
            <Link href="/new" className="btn btn-ink mt-6">
              Start a pact
            </Link>
          </div>
        ) : (
          <p className="sign-label animate-pulse">Loading pact…</p>
        )}
      </div>
    );
  }

  const s = STATUS[pact.status];
  const amount = pact.offer?.price ?? pact.mandate?.budget ?? 0;
  const stages = [MandateStage, SecurityStage, PromisesStage, HoldStage, InspectionStage, ReleaseStage];
  // a failed inspection still lets the client decide, so the release gate opens too
  const shown = pact.status === "needs_fix" ? 5 : Math.min(gate, 5);
  const props = { pact, role, act, submit, busy };

  return (
    <div>
      {/* the pact's own board row + gate rail stay pinned together */}
      <div className="sticky top-16 z-30">
      <div className="bg-board text-flap-ink">
        <div className="wrap flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-[clamp(12px,1.35vw,18px)]">
          <SplitFlap text={pactCode(pact.id)} length={8} className="text-sign" />
          <SplitFlap text={(pact.mandate?.task ?? "").replace(/[^\w $&.,:/-]/g, "")} length={22} className="hidden md:inline" />
          <SplitFlap text={money(amount)} length={8} />
          <span style={{ color: s.color }}>
            <SplitFlap text={s.flap} length={8} />
          </span>
          <div role="group" aria-label="View as" className="ml-auto flex border border-white/25 text-[0.8rem]">
            {(["client", "freelancer"] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setRoleNote("");
                }}
                aria-pressed={role === r}
                className={`sign-label px-3 py-2 transition-colors ${role === r ? "bg-sign text-sign-ink" : "text-flap-dim hover:text-flap-ink"}`}
              >
                {r === "client" ? "Priya · client" : `${pact.offer?.seller ?? "Freelancer"}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* gate rail with the NOW light */}
      <nav aria-label="Gates" className="border-b border-ink bg-slab">
        <ol className="wrap grid grid-cols-6">
          {GATES.map((g, i) => {
            const here = i === gate;
            const done = i < gate;
            return (
              <li key={g.key} aria-current={here ? "step" : undefined} className={`relative border-l border-hair py-2 pl-2 first:border-l-0 sm:py-3 sm:pl-3 ${here ? "bg-sign" : ""}`}>
                <span className={`num text-[0.75rem] ${done ? "text-ink" : here ? "text-sign-ink" : "text-ink-2"}`}>{done ? <svg width="12" height="12" viewBox="0 0 12 12" aria-label="passed" className="inline"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="2"/></svg> : `G${i + 1}`}</span>
                <span className={`font-sign text-[0.82rem] font-bold uppercase sm:block sm:text-[1rem] ${here ? "absolute top-full left-0 z-10 bg-sign px-2 pb-1 sm:static sm:bg-transparent sm:p-0" : "hidden"} ${!done && !here ? "text-ink-2" : ""}`}>{g.name}</span>
                {here && <span aria-hidden className="now-light absolute top-3 right-2 h-2.5 w-2.5 rounded-full bg-paid ring-2 ring-ink" />}
              </li>
            );
          })}
        </ol>
      </nav>
      </div>

      <div className="wrap grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-8">
          {roleNote && (
            <div role="status" className="flex items-start justify-between gap-4 border-[3px] border-ink bg-sign px-5 py-3 font-medium text-sign-ink">
              <span>{roleNote}</span>
              <button className="sign-label underline" onClick={() => setRoleNote("")}>
                Dismiss
              </button>
            </div>
          )}
          {stages.slice(0, shown + 1).map((Stage, i) => (
            <section key={i} ref={i === shown ? current : undefined} className="scroll-mt-[13rem]" aria-labelledby={`g${i}`}>
              <header className="mb-3 flex items-baseline gap-3">
                <span className={`num px-1.5 text-[0.8rem] ${i < shown || pact.status === "paid" ? "bg-ink text-sign" : "bg-sign text-sign-ink"}`}>G{i + 1}</span>
                <h2 id={`g${i}`} className="text-[1.7rem] font-extrabold uppercase">
                  {GATES[i].name}
                </h2>
                <span className="sign-label ml-auto hidden text-ink-2 sm:inline">{GATES[i].by}</span>
              </header>
              <Stage {...props} />
            </section>
          ))}

          {busy && (
            <div role="status" aria-live="polite" className="relative overflow-hidden bg-board px-5 py-4 text-flap-ink">
              <span className="relative z-10 flex items-center gap-3">
                <span className="now-light h-2.5 w-2.5 rounded-full bg-sign" aria-hidden />
                {busy}…
              </span>
              <span aria-hidden className="absolute inset-y-0 w-1 bg-sign" style={{ animation: "belt 1.6s linear infinite" }} />
            </div>
          )}
          {error && !busy && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-[3px] border-stop bg-white px-5 py-4">
              <span className="font-medium">{error.msg}</span>
              {error.retry && (
                <button
                  className="btn btn-ink btn-sm"
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
