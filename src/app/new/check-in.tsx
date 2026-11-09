"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SplitFlap } from "@/components/split-flap";

const SAMPLE = "Get me a logo for my bakery, Saffron Crumb. Budget $150. I need SVG files in 3 colour variants and a transparent PNG, done in 2 days.";
const PRESETS = [
  { label: "Bakery logo · $150", text: SAMPLE },
  { label: "Café logo · $120", text: "I run a small café called Night Owl. Find me a logo designer, max $120, SVG plus a transparent PNG, within 3 days." },
  { label: "Tight budget · $80", text: "Logo for my flower shop Petal & Stem, budget $80, SVG and transparent PNG, 2 days." },
];

export function CheckIn() {
  const router = useRouter();
  const sample = useSearchParams().get("sample") === "1";
  const [text, setText] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const started = useRef(false);

  async function submit(request: string) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/pacts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Could not start the pact.");
      router.push(`/pact/${j.id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  useEffect(() => {
    if (sample && !started.current) {
      started.current = true;
      submit(SAMPLE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sample]);

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-concrete">
      <div className="bg-board py-6 text-flap-ink">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 text-[clamp(13px,1.6vw,20px)]">
          <SplitFlap text="CHECK-IN" length={8} className="text-sign" />
          <SplitFlap text={busy ? "WRITING MANDATE" : "DESK OPEN"} length={15} />
        </div>
      </div>

      <div className="wrap grid gap-12 py-14 lg:grid-cols-[7fr_5fr]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(text);
          }}
        >
          <h1 className="mb-3 text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold uppercase">What should your agent get done?</h1>
          <p className="mb-8 max-w-[52ch] text-[1.08rem] text-ink-2">
            Say it the way you would to a person. Include a budget and a deadline. Pact turns it into limits the agent cannot cross.
          </p>
          <label htmlFor="req" className="sign-label mb-2 block">
            Your request
          </label>
          <textarea
            id="req"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={600}
            disabled={busy}
            className="block w-full resize-y border-[3px] border-ink bg-slab p-4 text-[1.15rem] leading-relaxed outline-none focus:bg-white"
          />
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Example requests">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" disabled={busy} onClick={() => setText(p.text)} className={`btn btn-sm ${text === p.text ? "btn-ink" : "btn-line"}`}>
                {p.label}
              </button>
            ))}
          </div>
          {error && (
            <p role="alert" className="mt-5 border-[3px] border-stop bg-white px-4 py-3 font-medium">
              {error}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="submit" disabled={busy || text.trim().length < 10} className="btn btn-ink">
              {busy ? "Writing your mandate…" : "Check in and start"}
            </button>
            <p className="text-[0.95rem] text-ink-2">{busy ? "The AI is reading your request. About 5 seconds." : "Demo marketplace stocks logo design."}</p>
          </div>
        </form>

        <aside className="self-start bg-board p-6 text-flap-ink">
          <h2 className="mb-4 text-[1.5rem] font-extrabold uppercase text-sign">What happens next</h2>
          <ol className="space-y-4">
            {[
              ["Mandate", "Budget, deadline and deliverables become hard limits."],
              ["Security", "Every seller listing is screened before the agent reads it."],
              ["Promises", "You approve exactly what will be checked."],
              ["Hold", "PayPal holds the money. Nothing is paid yet."],
              ["Inspection", "Delivered files are checked promise by promise."],
              ["Release", "You release the payment, or void the hold."],
            ].map(([k, v], i) => (
              <li key={k} className="grid grid-cols-[2.4rem_1fr] gap-2">
                <span className="num text-sign">G{i + 1}</span>
                <span>
                  <strong className="font-sign text-[1.1rem] font-bold uppercase">{k}</strong>
                  <span className="block text-[0.95rem] text-flap-dim">{v}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
