import Link from "next/link";
import { PactCard } from "@/components/pact-card";
import { LiveActivity } from "@/components/live-activity";
import { SecurityBelt } from "@/components/security-belt";
import { HowItWorks } from "@/components/how-it-works";
import { Wordmark } from "@/components/nav";

const CALLS = [
  { path: "/v2/checkout/orders", note: "intent AUTHORIZE · payee = freelancer", out: "On hold", tone: "bg-held-soft text-held" },
  { path: "/v2/payments/authorizations/{id}/capture", note: "only after inspection and your OK", out: "Paid", tone: "bg-paid-soft text-paid" },
  { path: "/v2/payments/authorizations/{id}/void", note: "deadline missed, or you cancel", out: "Voided", tone: "bg-white/10 text-white/80" },
];

const LADDER = [
  { who: "Code", tag: "Decides first", does: "Budget, deadline, category, file format, real transparency, pixel size, file count. Anything a rule can decide, a rule decides." },
  { who: "AI", tag: "Advises", does: "Reads your request, picks the offer that fits, writes the promises, and judges only what needs eyes." },
  { who: "You", tag: "Decide last", does: "Approve the promises. Release the money, or void the hold. A failed check never moves money on its own." },
];

export default function Home() {
  return (
    <>
      {/* HERO: the mechanism, shown, not described */}
      <section aria-labelledby="hero-h" className="relative overflow-hidden bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_78%_35%,#e6f0ff_0%,transparent_70%)]" />
        <div className="wrap relative grid items-center gap-14 pt-14 pb-20 lg:grid-cols-[1.2fr_1fr] lg:pt-20 lg:pb-28">
          <div className="rise">
            <h1 id="hero-h" className="t-display text-navy">
              Money that moves only when the promise is <span className="text-blue">proven.</span>
            </h1>
            <p className="t-lead mt-6 max-w-[48ch] text-ink-2">
              Tell Pact what you need. An AI agent buys it within limits it cannot break, PayPal holds the money, and the freelancer is paid the moment every promise checks out.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/new?sample=1" className="btn btn-primary">
                Run the sample pact
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/new" className="btn btn-ghost">
                Write your own
              </Link>
            </div>
            <p className="t-small mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-3">
              <span>Built on PayPal Orders v2</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-line-2" />
              <span>AI by Gemini</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-line-2" />
              <span>Sandbox, about 3 minutes</span>
            </p>
          </div>
          <div className="rise [animation-delay:120ms]">
            <PactCard />
          </div>
        </div>
      </section>

      {/* WHO / PROBLEM, plus proof that it is live */}
      <section aria-labelledby="why-h" className="border-y border-line bg-canvas py-20">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div>
            <h2 id="why-h" className="t-h2 text-navy">
              Paying for work is still a leap of faith. Letting an AI pay is a bigger one.
            </h2>
            <dl className="mt-8 space-y-5">
              {[
                ["For", "Small businesses hiring freelancers, and anyone letting an AI agent spend for them."],
                ["The gap", "You pay and hope. They deliver and hope. And an AI agent believes whatever a listing tells it."],
                ["Pact", "Hard limits, money held by PayPal, promises checked with evidence. Every step leaves a receipt."],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-4">
                  <dt className="t-small pt-0.5 font-semibold text-blue">{k}</dt>
                  <dd className="t-body text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <LiveActivity />
        </div>
      </section>

      <SecurityBelt />

      <section id="how" aria-labelledby="how-h" className="scroll-mt-16 border-t border-line bg-canvas py-24">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="how-h" className="t-h1 text-navy">
              Six gates between your money and their work.
            </h2>
            <p className="t-lead mt-5 max-w-[42ch] text-ink-2">Every pact passes the same gates, in the same order. Nothing skips one, and each gate shows who decided.</p>
            <Link href="/new?sample=1" className="btn btn-primary mt-8">
              Walk through them
            </Link>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* PAYPAL: the money path, as API calls */}
      <section aria-labelledby="pp-h" className="on-blue bg-navy py-24 text-white">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:items-center">
          <div>
            <h2 id="pp-h" className="t-h1">
              The money never touches Pact.
            </h2>
            <p className="t-lead mt-5 max-w-[44ch] text-white/70">
              PayPal holds the authorization with the freelancer already named as payee. Pact only decides <strong className="font-semibold text-white">when</strong> to ask PayPal to capture or void, and logs every call.
            </p>
          </div>
          <ul className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04]">
            {CALLS.map((c, i) => (
              <li key={c.path} className={`grid gap-2 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 ${i ? "border-t border-white/10" : ""}`}>
                <div className="min-w-0">
                  <p className="t-num text-[0.88rem] break-all">
                    <span className="mr-2 text-sky">POST</span>
                    {c.path}
                  </p>
                  <p className="t-small mt-1 text-white/55">{c.note}</p>
                </div>
                <span className={`chip justify-self-start ${c.tone}`}>{c.out}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="ladder-h" className="bg-white py-24">
        <div className="wrap">
          <h2 id="ladder-h" className="t-h1 max-w-[18ch] text-navy">
            Code first. AI second. You decide.
          </h2>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {LADDER.map((l, i) => (
              <li key={l.who} className="relative rounded-[20px] border border-line bg-canvas p-7">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[2.25rem] leading-none font-semibold tracking-[-0.03em] text-navy">{l.who}</h3>
                  <span className="t-num text-[0.8rem] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="t-small mt-2 font-semibold text-blue">{l.tag}</p>
                <p className="t-body mt-3 text-ink-2">{l.does}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="go-h" className="on-blue bg-blue py-20 text-white">
        <div className="wrap flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 id="go-h" className="t-h1 max-w-[16ch]">
            See a promise proven in three minutes.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/new?sample=1" className="btn btn-white">
              Run the sample pact
            </Link>
            <Link href="/board" className="btn btn-on-blue">
              Open the board
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white py-10">
        <div className="wrap flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Wordmark />
          <p className="t-small text-ink-3">PayPal sandbox demo. No real money moves. Built with PayPal Orders v2 and Gemini.</p>
        </div>
      </footer>
    </>
  );
}
