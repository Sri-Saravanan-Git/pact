"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { OFFERS } from "@/lib/market";
import { money } from "@/lib/ui";
import type { Pact } from "@/lib/types";
import type { Act, Role } from "./pact-view";
import { PayPalButtons } from "./paypal-buttons";

type P = { pact: Pact; role: Role; act: Act; submit: (f: FormData) => Promise<void>; busy: string | null };

function Tag({ tone, children }: { tone: "ok" | "stop" | "hold" | "check" | "ink" | "dim"; children: React.ReactNode }) {
  const map = {
    ok: "bg-paid text-ink",
    stop: "bg-stop text-white",
    hold: "bg-held text-ink",
    check: "bg-check text-ink",
    ink: "bg-ink text-sign",
    dim: "bg-concrete-2 text-ink-2",
  };
  return <span className={`num inline-block px-1.5 py-0.5 text-[0.72rem] font-bold tracking-[0.08em] whitespace-nowrap ${map[tone]}`}>{children}</span>;
}

function Waiting({ children }: { children: React.ReactNode }) {
  return <p className="border-l-[3px] border-hair py-1 pl-4 text-ink-2">{children}</p>;
}

/* G1 — the mandate, laid out like a boarding pass */
export function MandateStage({ pact }: P) {
  const m = pact.mandate;
  if (!m) return null;
  return (
    <div className="grid border-[3px] border-ink bg-slab md:grid-cols-[1fr_220px]">
      <div className="p-5">
        <p className="sign-label text-ink-2">Your words</p>
        <blockquote className="mt-1 max-w-[60ch] text-[1.08rem]">“{pact.request}”</blockquote>
        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <div>
            <dt className="sign-label text-ink-2">Max spend</dt>
            <dd className="num text-[1.6rem] font-bold">{money(m.budget)}</dd>
          </div>
          <div>
            <dt className="sign-label text-ink-2">Deadline</dt>
            <dd className="num text-[1.6rem] font-bold">{m.deadlineDays} days</dd>
          </div>
          <div>
            <dt className="sign-label text-ink-2">Category</dt>
            <dd className="font-sign text-[1.3rem] font-bold uppercase">{m.category}</dd>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <dt className="sign-label text-ink-2">Deliverables</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {m.deliverables.map((d) => (
                <span key={d} className="border border-ink px-2 py-0.5 text-[0.95rem]">
                  {d}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
      {/* tear-off stub */}
      <div className="flex flex-col justify-between border-t-[3px] border-dashed border-ink bg-ink p-5 text-flap-ink md:border-t-0 md:border-l-[3px]">
        <p className="sign-label text-sign">Hard limits</p>
        <p className="mt-3 text-[0.95rem] text-flap-dim">Enforced by code on every offer. The AI wrote them down; it cannot change them.</p>
      </div>
    </div>
  );
}

/* G2 — security screening + the agent's choice */
export function SecurityStage({ pact, busy }: P) {
  if (!pact.reviews) {
    return busy ? (
      <ul className="space-y-1.5" aria-label="Screening listings">
        {OFFERS.map((o, i) => (
          <li key={o.id} className="relative overflow-hidden bg-board px-4 py-3 text-flap-ink">
            <span className="num">{o.seller.toUpperCase()}</span>
            <span aria-hidden className="absolute inset-y-0 w-1 bg-check" style={{ animation: `belt 1.8s ${i * 0.25}s linear infinite` }} />
          </li>
        ))}
      </ul>
    ) : (
      <Waiting>Security has not screened the listings yet.</Waiting>
    );
  }
  const order = { quarantined: 0, rejected: 2, eligible: 1 } as const;
  const rows = [...pact.reviews].sort((a, b) => (a.offerId === pact.offer?.id ? -1 : b.offerId === pact.offer?.id ? 1 : order[a.verdict] - order[b.verdict]));
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-hair border-[3px] border-ink bg-slab">
        {rows.map((r) => {
          const o = OFFERS.find((x) => x.id === r.offerId)!;
          const chosen = o.id === pact.offer?.id;
          return (
            <li key={o.id} className={`grid gap-2 p-4 sm:grid-cols-[1fr_auto] ${chosen ? "bg-white" : ""} ${r.verdict === "quarantined" ? "bg-stop/8" : ""}`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="font-sign text-[1.3rem] font-bold uppercase">{o.seller}</h3>
                  <span className="num text-[0.9rem] text-ink-2">
                    ${o.price} · {o.deliveryDays} day{o.deliveryDays === 1 ? "" : "s"} · rated {o.rating}
                  </span>
                </div>
                {r.verdict === "quarantined" ? (
                  <>
                    <p className="num mt-2 bg-board p-2.5 text-[0.8rem] leading-relaxed text-flap-ink">
                      <span className="text-[#ff8a8d] line-through decoration-stop">{r.injection}</span>
                    </p>
                    <p className="mt-2 text-[0.95rem] text-ink-2">Instructions aimed at AI agents. Removed before the agent could read the listing.</p>
                  </>
                ) : (
                  <p className="mt-1 text-[0.95rem] text-ink-2">{r.reasons.join(" · ")}</p>
                )}
              </div>
              <div className="sm:text-right">
                {chosen ? <Tag tone="ink">CHOSEN</Tag> : r.verdict === "quarantined" ? <Tag tone="stop">QUARANTINED</Tag> : r.verdict === "rejected" ? <Tag tone="dim">REJECTED</Tag> : <Tag tone="check">CLEARED</Tag>}
              </div>
            </li>
          );
        })}
      </ul>
      {pact.offer && (
        <div className="bg-board p-5 text-flap-ink">
          <p className="sign-label text-sign">Agent’s choice · {pact.offer.seller}</p>
          <p className="mt-1 max-w-[62ch]">{pact.agentReason}</p>
          <p className="mt-3 text-[0.9rem] text-flap-dim">The agent only saw listings that cleared security, and only offers it chose from them can be paid.</p>
        </div>
      )}
    </div>
  );
}

/* G3 — promises, each with its method */
export function PromisesStage({ pact, role, act, busy }: P) {
  if (!pact.criteria) return busy ? null : <Waiting>The agent is writing promises from the seller’s listing.</Waiting>;
  const sub = pact.submissions.at(-1);
  return (
    <div className="border-[3px] border-ink bg-slab">
      <p className="border-b border-hair px-5 py-3 text-[0.95rem] text-ink-2">
        From what you asked and what <strong className="font-semibold text-ink">{pact.offer?.seller}</strong> promised. Code checks what code can; AI looks at the rest.
      </p>
      <ol className="divide-y divide-hair">
        {pact.criteria.map((c, i) => {
          const res = sub?.results.find((r) => r.id === c.id);
          return (
            <li key={c.id} className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 px-5 py-3">
              <span className="num pt-0.5 text-ink-2">{String(i + 1).padStart(2, "0")}</span>
              <span>{c.text}</span>
              <span className="flex gap-1.5">
                <Tag tone={c.check === "vision" ? "check" : "ink"}>{c.check === "vision" ? "AI" : "CODE"}</Tag>
                {res && <Tag tone={res.pass ? "ok" : "stop"}>{res.pass ? "PASS" : "FAIL"}</Tag>}
              </span>
            </li>
          );
        })}
      </ol>
      {pact.status === "awaiting_agreement" && (
        <div className="flex flex-wrap items-center gap-4 border-t-[3px] border-ink bg-sign px-5 py-4 text-sign-ink">
          {role === "client" ? (
            <>
              <button className="btn btn-ink" disabled={!!busy} onClick={() => act("agree")}>
                Approve these promises
              </button>
              <span className="text-[0.95rem]">Nothing is paid yet. Next, PayPal holds {money(pact.offer!.price)}.</span>
            </>
          ) : (
            <span>Waiting for Priya to approve the promises.</span>
          )}
        </div>
      )}
    </div>
  );
}

/* G4 — PayPal hold */
export function HoldStage({ pact, role, act, busy }: P) {
  const [err, setErr] = useState("");
  if (pact.status === "agreed") {
    if (role !== "client") return <Waiting>Waiting for Priya to put the money on hold.</Waiting>;
    return (
      <div className="border-[3px] border-ink bg-slab">
        <div className="grid gap-6 p-5 md:grid-cols-2">
          <div>
            <p className="sign-label text-ink-2">Hold with PayPal</p>
            <p className="num mt-1 text-[2rem] font-bold">{money(pact.offer!.price)}</p>
            <p className="mt-1 text-[0.95rem] text-ink-2">
              Payee: <strong className="font-semibold text-ink">{pact.offer!.seller}</strong>. PayPal authorizes now and captures only when you release.
            </p>
          </div>
          <div className="space-y-3">
            <PayPalButtons
              createOrder={async () => {
                const r = await act("paypal-create", {}, "Creating the PayPal order");
                if (!r || !(r as unknown as { orderId?: string }).orderId) throw new Error("no order");
                return (r as unknown as { orderId: string }).orderId;
              }}
              onApproved={async (orderId) => {
                await act("paypal-authorize", { orderId });
              }}
              onError={setErr}
            />
            <button className="btn btn-line w-full max-w-[360px]" disabled={!!busy} onClick={() => act("card-hold")}>
              One click: sandbox test card
            </button>
          </div>
        </div>
        <details className="border-t border-hair px-5 py-3 text-[0.92rem]">
          <summary className="sign-label cursor-pointer">Sandbox buyer login for the PayPal button</summary>
          <p className="num mt-2 break-all">
            {process.env.NEXT_PUBLIC_SANDBOX_BUYER_EMAIL}
            <br />
            {process.env.NEXT_PUBLIC_SANDBOX_BUYER_PASSWORD}
          </p>
          <p className="mt-1 text-ink-2">Sandbox only. No real money moves.</p>
        </details>
        {err && (
          <p role="alert" className="border-t border-stop px-5 py-3 text-stop">
            {err}
          </p>
        )}
      </div>
    );
  }
  if (!pact.paypal.authorizationId) return null;
  return (
    <div className="grid gap-px border-[3px] border-ink bg-ink text-flap-ink sm:grid-cols-4">
      {[
        ["Held", money(pact.offer!.price)],
        ["Authorization", pact.paypal.authorizationId],
        ["Payee", pact.offer!.seller],
        ["Work due", pact.deadline ? new Date(pact.deadline).toLocaleDateString([], { day: "numeric", month: "short" }) : "—"],
      ].map(([k, v]) => (
        <div key={k} className="bg-board p-4">
          <p className="sign-label text-flap-dim">{k}</p>
          <p className="num mt-1 break-all text-[1.05rem] text-held">{v}</p>
        </div>
      ))}
    </div>
  );
}

/* G5 — delivery + inspection */
export function InspectionStage({ pact, role, submit, busy }: P) {
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const canDeliver = (pact.status === "held" || pact.status === "needs_fix") && role === "freelancer";
  const send = (f: FormData) => submit(f).then(() => setFiles([]));

  return (
    <div className="space-y-5">
      {[...pact.submissions].reverse().map((s, idx) => {
        const n = pact.submissions.length - idx;
        return (
          <article key={s.at} className={`border-[3px] border-ink bg-slab ${idx ? "opacity-70" : ""}`}>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-hair px-5 py-3">
              <h3 className="font-sign text-[1.2rem] font-bold uppercase">Delivery {n}</h3>
              <Tag tone={s.pass ? "ok" : "stop"}>{s.pass ? "ALL PROMISES MET" : `${s.results.filter((r) => !r.pass).length} NOT MET`}</Tag>
            </header>
            <div className="flex gap-2 overflow-x-auto border-b border-hair px-5 py-3">
              {s.files.map((f) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={f.id} src={`/api/files/${f.id}`} alt={f.name} title={f.name} className="h-20 w-20 shrink-0 border border-hair bg-[repeating-conic-gradient(#d6d8d1_0_25%,#eff0ec_0_50%)] bg-[length:12px_12px] object-contain" />
              ))}
            </div>
            <ul className="divide-y divide-hair">
              {s.results.map((r) => {
                const c = pact.criteria!.find((x) => x.id === r.id)!;
                return (
                  <li key={r.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[auto_1fr] sm:gap-4">
                    <span className="flex items-start gap-1.5 pt-0.5 sm:w-[7.5rem]">
                      <Tag tone={r.pass ? "ok" : "stop"}>{r.pass ? "PASS" : "FAIL"}</Tag>
                      <Tag tone={r.method === "ai" ? "check" : "ink"}>{r.method === "ai" ? "AI" : "CODE"}</Tag>
                    </span>
                    <span>
                      <span className="block font-medium">{c.text}</span>
                      <span className="num block text-[0.82rem] text-ink-2">{r.evidence}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {s.fixRequest && (
              <div className="border-t-[3px] border-stop bg-white px-5 py-4">
                <p className="sign-label text-stop">Fix request · written by AI for the freelancer</p>
                <p className="mt-1 max-w-[64ch] whitespace-pre-line">{s.fixRequest}</p>
              </div>
            )}
          </article>
        );
      })}

      {canDeliver ? (
        <div className="border-[3px] border-ink bg-sign p-5 text-sign-ink">
          <h3 className="font-sign text-[1.3rem] font-bold uppercase">{pact.submissions.length ? "Deliver the fix" : "Deliver the work"}</h3>
          <p className="mt-1 max-w-[60ch]">Use a sample delivery, or upload your own PNG / SVG files (up to 6, 1.5 MB each).</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pact.submissions.length === 0 && (
              <button
                className={`btn ${pact.submissions.length ? "btn-line" : "btn-ink"}`}
                disabled={!!busy}
                onClick={() => {
                  const f = new FormData();
                  f.set("sample", "round-1");
                  send(f);
                }}
              >
                Sample 1 · has a flaw
              </button>
            )}
            <button
              className={`btn ${pact.submissions.length ? "btn-ink" : "btn-line"}`}
              disabled={!!busy}
              onClick={() => {
                const f = new FormData();
                f.set("sample", "round-2");
                send(f);
              }}
            >
              Sample 2 · fixed
            </button>
          </div>
          <div
            className="mt-4 border-2 border-dashed border-sign-ink/60 p-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setFiles([...e.dataTransfer.files].slice(0, 6));
            }}
          >
            <input ref={input} type="file" multiple accept="image/png,image/svg+xml,image/jpeg,image/webp" className="sr-only" id="up" onChange={(e) => setFiles([...(e.target.files ?? [])].slice(0, 6))} />
            <label htmlFor="up" className="cursor-pointer underline">
              Choose files
            </label>{" "}
            or drop them here.
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="num text-[0.85rem]">{files.map((f) => f.name).join(", ")}</span>
                <button
                  className="btn btn-ink btn-sm"
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
        </div>
      ) : (
        (pact.status === "held" || pact.status === "needs_fix") && <Waiting>Waiting for {pact.offer?.seller} to deliver. Switch the view at the top to deliver as the freelancer.</Waiting>
      )}
    </div>
  );
}

/* G6 — the human decides; PayPal moves the money */
export function ReleaseStage({ pact, role, act, busy }: P) {
  const price = money(pact.offer?.price ?? 0);
  if (pact.status === "paid") {
    return (
      <div className="bg-board p-6 text-flap-ink">
        <p className="sign-label text-paid">Captured by PayPal</p>
        <p className="mt-2 font-sign text-[clamp(2rem,4vw,3rem)] font-extrabold uppercase">
          {price} paid to {pact.offer?.seller}
        </p>
        <p className="num mt-2 break-all text-flap-dim">Capture ID {pact.paypal.captureId}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/new" className="btn btn-sign">
            Start another pact
          </Link>
          <Link href="/board" className="btn border-flap-ink text-flap-ink hover:bg-flap-ink hover:text-ink">
            See the board
          </Link>
        </div>
      </div>
    );
  }
  if (pact.status === "voided") {
    return (
      <div className="border-[3px] border-ink bg-slab p-6">
        <p className="sign-label text-ink-2">Hold voided</p>
        <p className="mt-1 font-sign text-[2rem] font-extrabold uppercase">{price} released back to Priya</p>
        <Link href="/new" className="btn btn-ink mt-5">
          Start another pact
        </Link>
      </div>
    );
  }
  if (pact.status !== "verified" && pact.status !== "needs_fix") return null;
  if (role !== "client") return <Waiting>Waiting for Priya to release the payment.</Waiting>;
  const ok = pact.status === "verified";
  return (
    <div className={`border-[3px] border-ink p-5 ${ok ? "bg-sign text-sign-ink" : "bg-slab"}`}>
      <p className="max-w-[60ch] text-[1.05rem]">
        {ok
          ? `Every promise checked out. Release ${price} to ${pact.offer?.seller}? PayPal captures the held money straight to them.`
          : "Some promises were not met. The freelancer can deliver a fix, or you can decide yourself — the AI only advises."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="btn btn-ink" disabled={!!busy} onClick={() => act("release")}>
          {ok ? `Release ${price}` : `Release ${price} anyway`}
        </button>
        <button className="btn btn-line" disabled={!!busy} onClick={() => act("void")}>
          Void the hold
        </button>
      </div>
    </div>
  );
}
