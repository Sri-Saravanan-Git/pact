import Link from "next/link";
import BlurText from "@/components/BlurText";
import { PactCard } from "@/components/pact-card";
import { LiveActivity } from "@/components/live-activity";
import { SecurityBelt } from "@/components/security-belt";
import { HowItWorks } from "@/components/how-it-works";
import { Wordmark } from "@/components/nav";
import { LivingBackground } from "@/components/living-background";
import { GlassLink } from "@/components/glass-link";
import AnimatedContent from "@/components/AnimatedContent";

const CALLS = [
  { path: "/v2/checkout/orders", note: "intent AUTHORIZE, freelancer set as payee", out: "On hold", tone: "bg-held-soft text-held" },
  { path: "/v2/payments/authorizations/{id}/capture", note: "only after inspection and your approval", out: "Paid", tone: "bg-paid-soft text-paid" },
  { path: "/v2/payments/authorizations/{id}/void", note: "if the deadline passes, or you cancel", out: "Voided", tone: "bg-white/10 text-white/80" },
];

const LADDER = [
  { who: "Code", tag: "Checks first", does: "Budget, deadline, category, file format, real transparency, pixel size, file count. If a rule can decide it, a rule decides it." },
  { who: "AI", tag: "Advises", does: "Understands your request, picks the offer that fits, writes the promises, and judges only what needs a pair of eyes." },
  { who: "You", tag: "Decide", does: "Approve the promises, then release the payment or void the hold. A failed check never moves money on its own." },
];

const HEADLINE = "Money that moves only when the promise is";

export default function Home() {
  return (
    <>
      {/* HERO: brand-world dark, with living light ribbons */}
      <section aria-labelledby="hero-h" className="on-blue relative -mt-16 overflow-x-clip pt-16 text-white">
        <LivingBackground />
        <div className="wrap relative grid items-center gap-14 pt-16 pb-24 lg:grid-cols-[1.2fr_1fr] lg:pt-24 lg:pb-36">
          <div>
            <h1 id="hero-h" className="sr-only">
              {HEADLINE} proven.
            </h1>
            <div aria-hidden className="t-display text-white">
              <BlurText text={HEADLINE} className="inline" animateBy="words" delay={70} trigger="load" />{" "}
              <BlurText text="proven." className="inline text-[#8ccaff]" animateBy="words" delay={70} trigger="load" stepDuration={0.5} />
            </div>
            <p className="t-lead rise mt-6 max-w-[46ch] text-white/75 [animation-delay:350ms]">
              Describe the job in plain words. An AI agent hires within limits it can’t break, PayPal holds the payment, and it’s released only when every promise checks out.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:450ms]">
              <Link href="/new?sample=1" className="btn btn-primary">
                Watch a pact run
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <GlassLink href="/new">Start your own</GlassLink>
            </div>
            <p className="t-small rise mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/55 [animation-delay:550ms]">
              <span>PayPal Orders v2</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-white/30" />
              <span>Gemini AI</span>
              <span aria-hidden className="h-1 w-1 rounded-full bg-white/30" />
              <span>Sandbox demo · 3 minutes</span>
            </p>
          </div>
          <div className="rise [animation-delay:200ms]">
            <PactCard />
          </div>
        </div>
      </section>

      {/* WHY + live proof */}
      <section aria-labelledby="why-h" className="py-20">
        <AnimatedContent distance={40} blur={6} stagger={0.15} duration={0.8} className="wrap grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          <div>
            <h2 id="why-h" className="t-h2 text-navy">
              Paying a stranger takes trust. Letting an AI pay one takes more.
            </h2>
            <dl className="mt-8 space-y-5">
              {[
                ["Who", "Small businesses that hire freelancers, and anyone who lets an AI agent spend on their behalf."],
                ["The gap", "Clients pay and hope. Freelancers deliver and hope. AI agents trust whatever a listing tells them."],
                ["Pact", "Hard limits, payment held by PayPal, every promise checked with evidence, and a receipt for each step."],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[5.5rem_1fr] gap-4">
                  <dt className="t-small pt-0.5 font-semibold text-blue">{k}</dt>
                  <dd className="t-body text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <LiveActivity />
        </AnimatedContent>
      </section>

      <SecurityBelt />

      <section id="how" aria-labelledby="how-h" className="scroll-mt-16 py-24">
        <div className="wrap grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 id="how-h" className="t-h1 text-navy">
              Six checkpoints between your money and the work.
            </h2>
            <p className="t-lead mt-5 max-w-[42ch] text-ink-2">Every pact clears the same six checkpoints, in order. None can be skipped, and each one shows who made the call.</p>
            <Link href="/new?sample=1" className="btn btn-primary mt-8">
              See them in action
            </Link>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* PAYPAL: the money path, as API calls */}
      <section aria-labelledby="pp-h" className="on-blue relative overflow-hidden bg-deep py-24 text-white">
        <div aria-hidden className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full bg-blue/40 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-[-12rem] left-[-8%] h-[28rem] w-[28rem] rounded-full bg-sky/25 blur-[120px]" />
        <div className="wrap relative grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:items-center">
          <div>
            <h2 id="pp-h" className="t-h1">
              Pact never touches the money.
            </h2>
            <p className="t-lead mt-5 max-w-[44ch] text-white/70">
              PayPal holds the authorization with the freelancer already set as payee. Pact only decides <strong className="font-semibold text-white">when</strong> to capture or void, and records every call.
            </p>
          </div>
          <AnimatedContent distance={30} blur={6} duration={0.8}>
          <ul className="card-dark overflow-hidden rounded-[20px]">
            {CALLS.map((c, i) => (
              <li key={c.path} className={`grid gap-2 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 ${i ? "border-t border-white/10" : ""}`}>
                <div className="min-w-0">
                  <p className="t-num text-[0.88rem] break-all">
                    <span className="mr-2 text-sky">POST</span>
                    {c.path}
                  </p>
                  <p className="t-small mt-1 text-white/60">{c.note}</p>
                </div>
                <span className={`chip justify-self-start ${c.tone}`}>{c.out}</span>
              </li>
            ))}
          </ul>
          </AnimatedContent>
        </div>
      </section>

      <section aria-labelledby="ladder-h" className="py-24">
        <div className="wrap">
          <h2 id="ladder-h" className="t-h1 max-w-[18ch] text-navy">
            Code checks. AI advises. You decide.
          </h2>
          <AnimatedContent distance={36} blur={6} stagger={0.12} duration={0.8} className="mt-12 grid gap-4 md:grid-cols-3">
            {LADDER.map((l, i) => (
              <div key={l.who} className="card relative p-7">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[2.25rem] leading-none font-semibold tracking-[-0.03em] text-navy">{l.who}</h3>
                  <span className="t-num text-[0.8rem] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="t-small mt-2 font-semibold text-blue">{l.tag}</p>
                <p className="t-body mt-3 text-ink-2">{l.does}</p>
              </div>
            ))}
          </AnimatedContent>
        </div>
      </section>

      <section aria-labelledby="go-h" className="on-blue relative overflow-hidden py-28 text-white">
        <LivingBackground />
        <AnimatedContent distance={40} blur={8} duration={0.9} className="wrap relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 id="go-h" className="t-h1 max-w-[16ch]">
            Watch a promise get proven in three minutes.
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/new?sample=1" className="btn btn-white">
              Watch a pact run
            </Link>
            <GlassLink href="/board">Open the board</GlassLink>
          </div>
        </AnimatedContent>
      </section>

      <footer className="py-10">
        <div className="wrap flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Wordmark />
          <p className="t-small text-ink-3">A PayPal sandbox demo. No real money moves. Built with PayPal Orders v2 and Gemini.</p>
        </div>
      </footer>
    </>
  );
}
