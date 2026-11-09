import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect width="30" height="30" fill="var(--color-sign)" />
        {/* pictogram: a seal ring with a check, drawn like a wayfinding glyph */}
        <circle cx="15" cy="15" r="8.5" fill="none" stroke="var(--color-ink)" strokeWidth="2.6" />
        <path d="M11 15.2l2.8 2.8 5.4-5.6" fill="none" stroke="var(--color-ink)" strokeWidth="2.6" strokeLinecap="square" />
      </svg>
      <span className="font-sign text-[1.55rem] leading-none font-extrabold tracking-[0.02em] uppercase">Pact</span>
    </span>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-concrete/95 backdrop-blur-[2px]">
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" className="no-underline" aria-label="Pact home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 sm:gap-5">
          <Link href="/#gates" className="sign-label hidden px-2 py-2 no-underline hover:underline sm:inline">
            How it works
          </Link>
          <Link href="/board" className="sign-label px-2 py-2 no-underline hover:underline">
            Board
          </Link>
          <Link href="/new" className="btn btn-ink btn-sm">
            Start a pact
          </Link>
        </div>
      </nav>
    </header>
  );
}
