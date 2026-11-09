import Link from "next/link";
import { DepartureBoard } from "@/components/departure-board";
import { SecurityBelt } from "@/components/security-belt";
import { GatesRoute } from "@/components/gates-route";

const CALLS = [
  { verb: "POST", path: "/v2/checkout/orders", note: "intent AUTHORIZE · payee = freelancer", out: "HELD", color: "var(--color-held)" },
  { verb: "POST", path: "/v2/payments/authorizations/{id}/capture", note: "only after inspection + your OK", out: "PAID", color: "var(--color-paid)" },
  { verb: "POST", path: "/v2/payments/authorizations/{id}/void", note: "deadline missed, or you cancel", out: "VOIDED", color: "var(--color-flap-dim)" },
];

const LADDER = [
  { who: "Code", does: "Budget, deadline, category, file format, transparency, size, file count. Anything a rule can decide, a rule decides." },
  { who: "AI", does: "Reads your request, picks the offer that fits, writes the promises, judges what only eyes can judge. It advises." },
  { who: "You", does: "Approve the promises. Release the money or void the hold. A failed check never moves money on its own." },
];

export default function Home() {
  return (
    <>
      <section aria-labelledby="hero-h" className="relative">
        <DepartureBoard />
        <div className="wrap relative">
          <div className="on-sign relative z-10 -mt-12 grid gap-6 bg-sign px-6 py-8 text-sign-ink sm:-mt-16 sm:px-10 sm:py-10 lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-12">
            <h1 id="hero-h" className="text-[clamp(2.6rem,5.2vw,4.7rem)] font-extrabold uppercase">
              Money that moves only when the promise is proven.
            </h1>
            <div>
            <p className="max-w-[46ch] text-[1.1rem] leading-relaxed">
              Tell Pact what you need. An AI agent buys it within limits it cannot break, PayPal holds the money, and the freelancer is paid the moment every promise checks out.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/new" className="btn btn-ink">
                Start a pact
              </Link>
              <Link href="/new?sample=1" className="btn btn-line">
                Run the sample flight
              </Link>
            </div>
            </div>
          </div>
        </div>
        <div className="wrap grid gap-6 py-14 sm:grid-cols-3">
          {[
            ["Who", "Small businesses hiring freelancers, and anyone letting an AI agent spend for them."],
            ["Problem", "You pay and hope, they deliver and hope, and an AI agent believes whatever a listing tells it."],
            ["Pact", "Hard limits, held money, checked promises. Every step leaves a receipt with a real PayPal ID."],
          ].map(([k, v]) => (
            <div key={k} className="border-t-[3px] border-ink pt-3">
              <h2 className="text-[1.5rem] font-extrabold uppercase">{k}</h2>
              <p className="mt-1 max-w-[38ch] text-ink-2">{v}</p>
            </div>
          ))}
        </div>
      </section>

      <SecurityBelt />

      <section id="gates" aria-labelledby="gates-h" className="scroll-mt-16 border-t border-ink bg-slab py-24">
        <div className="wrap">
          <h2 id="gates-h" className="mb-3 max-w-[18ch] text-[clamp(2.4rem,5vw,4.4rem)] font-extrabold uppercase">
            Six gates between your money and their work.
          </h2>
          <p className="mb-14 max-w-[56ch] text-[1.1rem] text-ink-2">Every pact passes the same gates in the same order. The board shows where each one stands, and nothing skips a gate.</p>
          <GatesRoute />
        </div>
      </section>

      <section aria-labelledby="pp-h" className="bg-board py-24 text-flap-ink">
        <div className="wrap grid gap-12 lg:grid-cols-[5fr_7fr]">
          <div>
            <h2 id="pp-h" className="text-[clamp(2.2rem,4.4vw,3.8rem)] font-extrabold uppercase">
              The money never touches Pact.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[1.08rem] text-flap-dim">
              PayPal holds the authorization with the freelancer already named as payee. Pact only decides <strong className="font-semibold text-flap-ink">when</strong> to ask PayPal to capture or void. Three calls, every one recorded on the pact’s log.
            </p>
          </div>
          <ul className="num divide-y divide-white/10 border-y border-white/10 text-[0.9rem]">
            {CALLS.map((c) => (
              <li key={c.path} className="grid gap-1 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
                <div>
                  <span className="text-sign">{c.verb}</span> <span className="break-all">{c.path}</span>
                  <p className="mt-1 text-flap-dim">{c.note}</p>
                </div>
                <span className="font-bold tracking-[0.12em]" style={{ color: c.color }}>
                  {c.out}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="ladder-h" className="py-24">
        <div className="wrap">
          <h2 id="ladder-h" className="mb-12 max-w-[20ch] text-[clamp(2.2rem,4.4vw,3.8rem)] font-extrabold uppercase">
            Code first. AI second. You decide.
          </h2>
          <div className="grid border-t-[3px] border-ink md:grid-cols-3">
            {LADDER.map((l, i) => (
              <div key={l.who} className={`py-6 md:px-6 ${i ? "border-t border-ink md:border-t-0 md:border-l" : "md:pl-0"}`}>
                <h3 className="text-[2.6rem] font-extrabold uppercase">{l.who}</h3>
                <p className="mt-2 max-w-[34ch] text-ink-2">{l.does}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="go-h" className="on-sign bg-sign py-20 text-sign-ink">
        <div className="wrap flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 id="go-h" className="max-w-[16ch] text-[clamp(2.4rem,5.2vw,4.6rem)] font-extrabold uppercase">
            Board the sample flight. Three minutes, sandbox money.
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/new?sample=1" className="btn btn-ink">
              Run the sample flight
            </Link>
            <Link href="/board" className="btn btn-line">
              See the board
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-board py-10 text-flap-dim">
        <div className="wrap flex flex-col justify-between gap-3 text-[0.9rem] sm:flex-row">
          <p>PayPal sandbox demo. No real money moves.</p>
          <p>PayPal Orders v2 · Gemini · Next.js</p>
        </div>
      </footer>
    </>
  );
}
