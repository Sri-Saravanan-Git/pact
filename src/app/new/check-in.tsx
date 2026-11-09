"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GATES } from "@/lib/ui";

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
    <div className="min-h-[calc(100dvh-4rem)]">
      <div className="wrap grid gap-10 py-14 lg:grid-cols-[1.35fr_1fr] lg:py-20">
        <form
          className="rise"
          onSubmit={(e) => {
            e.preventDefault();
            submit(text);
          }}
        >
          <h1 className="t-h1 text-navy">What should your agent get done?</h1>
          <p className="t-lead mt-4 max-w-[50ch] text-ink-2">Describe it the way you’d tell a person, with a budget and a deadline. Pact turns your words into limits the agent can’t cross.</p>

          <div className="card mt-8 overflow-hidden focus-within:ring-2 focus-within:ring-blue/30">
            <label htmlFor="req" className="sr-only">
              Your request
            </label>
            <textarea
              id="req"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={600}
              disabled={busy}
              className="block w-full resize-none bg-transparent px-6 pt-5 pb-2 text-[1.125rem] leading-relaxed text-ink outline-none placeholder:text-ink-3 disabled:opacity-60"
              placeholder="e.g. A logo for my bakery, under $150, in 2 days…"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Example requests">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    disabled={busy}
                    onClick={() => setText(p.text)}
                    aria-pressed={text === p.text}
                    className={`chip h-8 cursor-pointer px-3 transition-colors duration-200 ${text === p.text ? "bg-navy text-white" : "bg-canvas text-ink-2 hover:bg-mist hover:text-navy"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button type="submit" disabled={busy || text.trim().length < 10} className="btn btn-primary">
                {busy ? (
                  <>
                    <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Writing your mandate
                  </>
                ) : (
                  "Start the pact"
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="swap t-small mt-4 rounded-xl border border-stop/20 bg-stop-soft px-4 py-3 font-medium text-stop">
              {error}
            </p>
          )}
          <p className="t-small mt-4 text-ink-3">{busy ? "The AI is reading your request. About 5 seconds." : "The demo marketplace sells logo design. Everything runs in the PayPal sandbox."}</p>
        </form>

        <aside className="rise self-start [animation-delay:100ms]">
          <div className="card p-6">
            <h2 className="text-[1rem] font-semibold text-navy">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {GATES.map((g, i) => (
                <li key={g.key} className="grid grid-cols-[1.75rem_1fr] gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-mist text-[0.72rem] font-semibold text-blue">{i + 1}</span>
                  <span>
                    <span className="t-small block font-semibold text-navy">{g.name}</span>
                    <span className="t-small block text-ink-2">{g.line}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
