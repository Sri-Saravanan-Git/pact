"use client";
import { useState } from "react";
import Link from "next/link";
import { OFFERS } from "@/lib/market";
import { money } from "@/lib/ui";
import type { Pact } from "@/lib/types";
import type { Act, Role } from "./pact-view";
import { PayPalButtons } from "./paypal-buttons";
import CountUp from "@/components/CountUp";
import HoldButton from "@/components/HoldButton";

type P = { pact: Pact; role: Role; act: Act; submit: (f: FormData) => Promise<void>; busy: string | null };
type Tone = "ok" | "stop" | "hold" | "blue" | "ink" | "muted";

const TONES: Record<Tone, string> = {
  ok: "bg-paid-soft text-paid",
  stop: "bg-stop-soft text-stop",
  hold: "bg-held-soft text-held",
  blue: "bg-check-soft text-blue",
  ink: "bg-deep text-white",
  muted: "bg-canvas text-ink-3",
};
const Tag = ({ tone, children }: { tone: Tone; children: React.ReactNode }) => <span className={`chip ${TONES[tone]}`}>{children}</span>;

const Check = ({ ok }: { ok: boolean }) => (
  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${ok ? "bg-paid text-white" : "bg-stop text-white"}`}>
    <svg width="10" height="10" viewBox="0 0 10 10" aria-label={ok ? "pass" : "fail"}>
      {ok ? <path d="M2 5.2l2 2 4-4.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M3 3l4 4M7 3L3 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
    </svg>
  </span>
);

function Waiting({ children }: { children: React.ReactNode }) {
  return (
    <p className="t-small flex items-center gap-2.5 rounded-2xl border border-dashed border-line-2 px-5 py-4 text-ink-3">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-line-2" />
      {children}
    </p>
  );
}

/* 1 — the mandate */
export function MandateStage({ pact }: P) {
  const m = pact.mandate;
  if (!m) return null;
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line bg-canvas/60 px-6 py-4">
        <p className="t-micro text-ink-3">Your words</p>
        <p className="t-body mt-1 max-w-[64ch] text-ink">“{pact.request}”</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 px-6 py-5 sm:grid-cols-4">
        <div>
          <dt className="t-micro text-ink-3">Max spend</dt>
          <dd className="t-num mt-1 text-[1.5rem] font-medium tracking-[-0.03em] text-navy">{money(m.budget)}</dd>
        </div>
        <div>
          <dt className="t-micro text-ink-3">Deadline</dt>
          <dd className="t-num mt-1 text-[1.5rem] font-medium tracking-[-0.03em] text-navy">{m.deadlineDays} days</dd>
        </div>
        <div className="col-span-2">
          <dt className="t-micro text-ink-3">Deliverables</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {m.deliverables.map((d) => (
              <span key={d} className="chip bg-mist text-navy">
                {d}
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <p className="t-small flex items-center gap-2 border-t border-line px-6 py-3 text-ink-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 11V8a7 7 0 0114 0v3M4 11h16v9H4z" />
        </svg>
        Enforced by code on every offer. The AI wrote these limits down; it cannot change them.
      </p>
    </div>
  );
}

/* 2 — security screening + the agent's choice */
export function SecurityStage({ pact, busy }: P) {
  if (!pact.reviews) {
    return busy ? (
      <ul className="card divide-y divide-line overflow-hidden" aria-label="Screening listings">
        {OFFERS.map((o, i) => (
          <li key={o.id} className="relative flex items-center justify-between overflow-hidden px-5 py-3.5">
            <span className="t-small font-medium text-ink">{o.seller}</span>
            <span className="t-micro text-ink-3">Screening…</span>
            <span aria-hidden className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-mist to-transparent" style={{ animation: `belt 1.6s ${i * 0.2}s var(--ease-in-out) infinite` }} />
          </li>
        ))}
      </ul>
    ) : (
      <Waiting>Security has not screened the listings yet.</Waiting>
    );
  }
  const rank = { quarantined: 1, eligible: 2, rejected: 3 } as const;
  const rows = [...pact.reviews].sort((a, b) => (a.offerId === pact.offer?.id ? -1 : b.offerId === pact.offer?.id ? 1 : rank[a.verdict] - rank[b.verdict]));
  return (
    <div className="space-y-3">
      <ul className="card divide-y divide-line overflow-hidden">
        {rows.map((r) => {
          const o = OFFERS.find((x) => x.id === r.offerId)!;
          const chosen = o.id === pact.offer?.id;
          return (
            <li key={o.id} className={`grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] ${chosen ? "bg-mist/50" : ""}`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="text-[1rem] font-semibold text-navy">{o.seller}</h3>
                  <span className="t-num t-micro text-ink-3">
                    ${o.price} · {o.deliveryDays} day{o.deliveryDays === 1 ? "" : "s"} · rated {o.rating}
                  </span>
                </div>
                {r.verdict === "quarantined" ? (
                  <>
                    <p className="t-num mt-2 rounded-xl border border-stop/20 bg-stop-soft px-3 py-2.5 text-[0.78rem] leading-relaxed text-stop">
                      <span className="line-through decoration-stop/50">{r.injection}</span>
                    </p>
                    <p className="t-small mt-2 text-ink-2">Instructions aimed at AI agents. Removed before the agent could read the listing.</p>
                  </>
                ) : (
                  <p className="t-small mt-1 text-ink-2">{r.reasons.join(" · ")}</p>
                )}
              </div>
              <div className="sm:pt-0.5 sm:text-right">
                {chosen ? <Tag tone="ink">Chosen</Tag> : r.verdict === "quarantined" ? <Tag tone="stop">Quarantined</Tag> : r.verdict === "rejected" ? <Tag tone="muted">Rejected</Tag> : <Tag tone="blue">Cleared</Tag>}
              </div>
            </li>
          );
        })}
      </ul>
      {pact.offer && (
        <div className="rounded-[20px] bg-deep px-6 py-5 text-white ring-1 ring-white/10">
          <p className="t-micro text-sky">Agent’s choice · {pact.offer.seller}</p>
          <p className="t-body mt-1.5 max-w-[62ch]">{pact.agentReason}</p>
          <p className="t-small mt-3 text-white/60">The agent only saw listings that cleared security, and can only pay an offer it chose from them.</p>
        </div>
      )}
    </div>
  );
}

/* 3 — promises, each with how it will be checked */
export function PromisesStage({ pact, role, act, busy }: P) {
  if (!pact.criteria) return busy ? null : <Waiting>The agent is writing promises from the seller’s listing.</Waiting>;
  const sub = pact.submissions.at(-1);
  return (
    <div className="card overflow-hidden">
      <p className="t-small border-b border-line px-6 py-3.5 text-ink-2">
        From what you asked and what <strong className="font-semibold text-navy">{pact.offer?.seller}</strong> promised. Code checks what code can; AI looks at the rest.
      </p>
      <ol className="divide-y divide-line">
        {pact.criteria.map((c, i) => {
          const res = sub?.results.find((r) => r.id === c.id);
          return (
            <li key={c.id} className="grid grid-cols-[1.75rem_1fr_auto] items-start gap-3 px-6 py-3.5">
              <span className="t-num t-micro pt-0.5 text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <span className="t-small text-ink">{c.text}</span>
              <span className="flex items-center gap-1.5">
                <Tag tone={c.check === "vision" ? "blue" : "muted"}>{c.check === "vision" ? "AI" : "Code"}</Tag>
                {res && <Check ok={res.pass} />}
              </span>
            </li>
          );
        })}
      </ol>
      {pact.status === "awaiting_agreement" && (
        <div className="flex flex-wrap items-center gap-4 border-t border-line bg-mist/50 px-6 py-4">
          {role === "client" ? (
            <>
              <button className="btn btn-primary" disabled={!!busy} onClick={() => act("agree")}>
                Approve these promises
              </button>
              <span className="t-small text-ink-2">Nothing is paid yet. Next, PayPal holds {money(pact.offer!.price)}.</span>
            </>
          ) : (
            <span className="t-small text-ink-2">Waiting for Priya to approve the promises.</span>
          )}
        </div>
      )}
    </div>
  );
}

/* 4 — PayPal hold */
export function HoldStage({ pact, role, act, busy }: P) {
  const [err, setErr] = useState("");
  if (pact.status === "agreed") {
    if (role !== "client") return <Waiting>Waiting for Priya to put the money on hold.</Waiting>;
    return (
      <div className="card overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_minmax(0,320px)] md:items-center">
          <div>
            <p className="t-micro text-ink-3">Hold with PayPal</p>
            <p className="t-num mt-1 text-[2.25rem] leading-none font-medium tracking-[-0.04em] text-navy">{money(pact.offer!.price)}</p>
            <p className="t-small mt-3 max-w-[40ch] text-ink-2">
              Payee: <strong className="font-semibold text-navy">{pact.offer!.seller}</strong>. PayPal authorizes now and captures only when you release.
            </p>
          </div>
          <div className="space-y-2.5">
            <PayPalButtons
              createOrder={async () => {
                const r = (await act("paypal-create", {}, "Creating the PayPal order")) as unknown as { orderId?: string } | null;
                if (!r?.orderId) throw new Error("no order");
                return r.orderId;
              }}
              onApproved={async (orderId) => {
                await act("paypal-authorize", { orderId });
              }}
              onError={setErr}
            />
            <button className="btn btn-ghost w-full" disabled={!!busy} onClick={() => act("card-hold")}>
              One click: sandbox test card
            </button>
          </div>
        </div>
        <details className="group border-t border-line px-6 py-3.5">
          <summary className="t-small cursor-pointer list-none font-medium text-blue">
            Sandbox buyer login for the PayPal button
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="ml-1 inline-block transition-transform duration-200 group-open:rotate-90">
              <path d="M4.5 2.5L8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <p className="t-num t-small mt-2 break-all text-ink">
            {process.env.NEXT_PUBLIC_SANDBOX_BUYER_EMAIL}
            <br />
            {process.env.NEXT_PUBLIC_SANDBOX_BUYER_PASSWORD}
          </p>
          <p className="t-micro mt-1 text-ink-3">Sandbox only. No real money moves.</p>
        </details>
        {err && (
          <p role="alert" className="t-small border-t border-stop/20 bg-stop-soft px-6 py-3 text-stop">
            {err}
          </p>
        )}
      </div>
    );
  }
  if (!pact.paypal.authorizationId) return null;
  return (
    <div className="card grid grid-cols-2 divide-line overflow-hidden sm:grid-cols-4 sm:divide-x">
      {[
        ["Held by PayPal", money(pact.offer!.price)],
        ["Authorization", pact.paypal.authorizationId],
        ["Payee", pact.offer!.seller],
        ["Work due", pact.deadline ? new Date(pact.deadline).toLocaleDateString([], { day: "numeric", month: "short" }) : "—"],
      ].map(([k, v]) => (
        <div key={k} className="px-5 py-4">
          <p className="t-micro text-ink-3">{k}</p>
          <p className="t-num mt-1 text-[0.95rem] break-all text-navy">{v}</p>
        </div>
      ))}
    </div>
  );
}

/* 5 — delivery + inspection */
export function InspectionStage({ pact, role, submit, busy }: P) {
  const [files, setFiles] = useState<File[]>([]);
  const [over, setOver] = useState(false);
  const canDeliver = (pact.status === "held" || pact.status === "needs_fix") && role === "freelancer";
  const send = (f: FormData) => submit(f).then(() => setFiles([]));
  const sample = (name: string) => {
    const f = new FormData();
    f.set("sample", name);
    send(f);
  };

  return (
    <div className="space-y-4">
      {[...pact.submissions].reverse().map((s, idx) => {
        const n = pact.submissions.length - idx;
        const failed = s.results.filter((r) => !r.pass).length;
        return (
          <article key={s.at} className={`card overflow-hidden transition-opacity ${idx ? "opacity-60 hover:opacity-100" : ""}`}>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-3.5">
              <h3 className="text-[1rem] font-semibold text-navy">Delivery {n}</h3>
              <Tag tone={s.pass ? "ok" : "stop"}>{s.pass ? "All promises met" : `${failed} not met`}</Tag>
            </header>
            <div className="flex gap-2.5 overflow-x-auto border-b border-line px-6 py-4">
              {s.files.map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={f.id}
                  src={`/api/files/${f.id}`}
                  alt={f.name}
                  title={f.name}
                  className="h-20 w-20 shrink-0 rounded-xl border border-line bg-[repeating-conic-gradient(#eef2f8_0_25%,#ffffff_0_50%)] bg-[length:12px_12px] object-contain"
                />
              ))}
            </div>
            <ul className="divide-y divide-line">
              {s.results.map((r) => {
                const c = pact.criteria!.find((x) => x.id === r.id)!;
                return (
                  <li key={r.id} className="grid grid-cols-[auto_1fr_auto] items-start gap-3 px-6 py-3.5">
                    <span className="pt-0.5">
                      <Check ok={r.pass} />
                    </span>
                    <span className="min-w-0">
                      <span className="t-small block font-medium text-ink">{c.text}</span>
                      <span className="t-num block text-[0.78rem] break-words text-ink-3">{r.evidence}</span>
                    </span>
                    <Tag tone={r.method === "ai" ? "blue" : "muted"}>{r.method === "ai" ? "AI" : "Code"}</Tag>
                  </li>
                );
              })}
            </ul>
            {s.fixRequest && (
              <div className="border-t border-line bg-stop-soft/60 px-6 py-4">
                <p className="t-micro font-semibold text-stop">Fix request · written by AI for the freelancer</p>
                <p className="t-small mt-1 max-w-[64ch] whitespace-pre-line text-ink">{s.fixRequest}</p>
              </div>
            )}
          </article>
        );
      })}

      {canDeliver ? (
        <div className="card overflow-hidden ring-2 ring-blue/15">
          <div className="px-6 pt-5">
            <h3 className="text-[1.05rem] font-semibold text-navy">{pact.submissions.length ? "Deliver the fix" : "Deliver the work"}</h3>
            <p className="t-small mt-1 text-ink-2">Use a sample delivery, or upload your own PNG / SVG files (up to 6, 1.5 MB each).</p>
          </div>
          <div className="flex flex-wrap gap-2 px-6 pt-4">
            {pact.submissions.length === 0 && (
              <button className="btn btn-primary" disabled={!!busy} onClick={() => sample("round-1")}>
                Sample 1 · has a flaw
              </button>
            )}
            <button className={`btn ${pact.submissions.length ? "btn-primary" : "btn-ghost"}`} disabled={!!busy} onClick={() => sample("round-2")}>
              Sample 2 · fixed
            </button>
          </div>
          <label
            htmlFor="up"
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              setFiles([...e.dataTransfer.files].slice(0, 6));
            }}
            className={`m-6 mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors duration-200 ${over ? "border-blue bg-mist" : "border-line-2 hover:border-blue/50"}`}
          >
            <input type="file" multiple accept="image/png,image/svg+xml,image/jpeg,image/webp" className="sr-only" id="up" onChange={(e) => setFiles([...(e.target.files ?? [])].slice(0, 6))} />
            <span className="t-small font-medium text-navy">Drop files here, or click to choose</span>
            <span className="t-micro text-ink-3">PNG, SVG, JPG or WEBP</span>
          </label>
          {files.length > 0 && (
            <div className="-mt-2 flex flex-wrap items-center gap-3 px-6 pb-5">
              <span className="t-num t-micro min-w-0 flex-1 truncate text-ink-2">{files.map((f) => f.name).join(", ")}</span>
              <button
                className="btn btn-primary btn-sm"
                disabled={!!busy}
                onClick={() => {
                  const f = new FormData();
                  files.forEach((x) => f.append("files", x));
                  send(f);
                }}
              >
                Send for inspection
              </button>
            </div>
          )}
        </div>
      ) : (
        (pact.status === "held" || pact.status === "needs_fix") && <Waiting>Waiting for {pact.offer?.seller} to deliver. Switch the view at the top to deliver as the freelancer.</Waiting>
      )}
    </div>
  );
}

/* 6 — the person decides; PayPal moves the money */
export function ReleaseStage({ pact, role, act, busy }: P) {
  const price = money(pact.offer?.price ?? 0);
  if (pact.status === "paid") {
    return (
      <div className="on-blue swap relative overflow-hidden rounded-[24px] bg-blue px-7 py-8 text-white shadow-[var(--shadow-blue)]">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" />
        <p className="t-small flex items-center gap-2 font-medium text-white/80">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-blue">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d="M2 5.2l2 2 4-4.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Captured by PayPal
        </p>
        <p className="t-h1 relative mt-3">
          <CountUp to={pact.offer?.price ?? 0} prefix="$" decimals={2} duration={1.1} trigger="load" className="t-num" /> paid to {pact.offer?.seller}
        </p>
        <p className="t-num t-small mt-2 break-all text-white/70">Capture ID {pact.paypal.captureId}</p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link href="/new" className="btn btn-white">
            Start another pact
          </Link>
          <Link href="/board" className="btn btn-on-blue">
            Open the board
          </Link>
        </div>
      </div>
    );
  }
  if (pact.status === "voided") {
    return (
      <div className="card px-7 py-7">
        <p className="t-small text-ink-3">Hold voided</p>
        <p className="t-h2 mt-1 text-navy">{price} released back to Priya</p>
        <Link href="/new" className="btn btn-primary mt-6">
          Start another pact
        </Link>
      </div>
    );
  }
  if (pact.status !== "verified" && pact.status !== "needs_fix") return null;
  if (role !== "client") return <Waiting>Waiting for Priya to release the payment.</Waiting>;
  const ok = pact.status === "verified";
  return (
    <div className={`card px-6 py-5 ${ok ? "ring-2 ring-blue/20" : ""}`}>
      <p className="t-body max-w-[60ch] text-ink">
        {ok
          ? `Every promise checked out. Release ${price} to ${pact.offer?.seller}? PayPal captures the held money straight to them.`
          : "Some promises were not met. The freelancer can deliver a fix, or you can decide yourself. The AI only advises."}
      </p>
      <p className="t-micro mt-2 text-ink-3">Moving money can’t be undone, so release asks you to press and hold for a second.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <HoldButton
          size="lg"
          radius={999}
          holdTime={1100}
          backgroundColor="#0b63f6"
          fillColor="#071d49"
          textColor="#ffffff"
          fillTextColor="#ffffff"
          glow
          disabled={!!busy}
          doneLabel="Releasing…"
          onHold={() => act("release")}
        >
          {ok ? `Hold to release ${price}` : `Hold to release ${price} anyway`}
        </HoldButton>
        <button className="btn btn-ghost" disabled={!!busy} onClick={() => act("void")}>
          Void the hold
        </button>
      </div>
    </div>
  );
}
