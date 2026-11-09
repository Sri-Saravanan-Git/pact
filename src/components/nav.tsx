import Link from "next/link";

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden>
      <rect width="28" height="28" rx="8" fill="var(--color-blue)" />
      <path d="M8.5 14.5l3.6 3.6L19.8 10" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2">
      <Mark />
      <span className="text-[1.15rem] font-semibold tracking-[-0.02em] text-navy">Pact</span>
    </span>
  );
}

export function Nav() {
  return (
    <header className="glass sticky top-0 z-40 border-b border-line/70 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Pact home" className="rounded-lg">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/#how" className="t-small hidden rounded-full px-3 py-2 font-medium text-ink-2 transition-colors hover:text-navy sm:inline">
            How it works
          </Link>
          <Link href="/board" className="t-small rounded-full px-3 py-2 font-medium text-ink-2 transition-colors hover:text-navy">
            Board
          </Link>
          <Link href="/new" className="btn btn-primary btn-sm ml-1">
            Start a pact
          </Link>
        </div>
      </nav>
    </header>
  );
}
