"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CoinToggle } from "./coin-toggle";

export function Mark({ size = 30 }: { size?: number }) {
  return <Image src="/logo.png" alt="" width={size} height={size} priority className="shrink-0 rounded-[26%] shadow-[0_4px_14px_-4px_rgb(59_91_255/0.6)]" />;
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark />
      <span className={`text-[1.2rem] font-semibold tracking-[-0.02em] transition-colors duration-300 ${light ? "text-white" : "text-navy"}`}>Pact</span>
    </span>
  );
}

const LINKS = [
  { href: "/#how", label: "How it works", hideSm: true },
  { href: "/board", label: "Board" },
];

/** Glass nav. Over the dark hero it turns to dark glass; anywhere else it is light glass. */
export function Nav() {
  const path = usePathname();
  const [overHero, setOverHero] = useState(false);

  useEffect(() => {
    if (path !== "/") return;
    const onScroll = () => setOverHero(window.scrollY < window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [path]);

  return <NavBar dark={path === "/" && overHero} path={path} />;
}

/** Static shell used while the URL streams in (and as the Suspense fallback). */
export function NavBar({ dark = false, path = "" }: { dark?: boolean; path?: string }) {
  return (
    <header
      className={`glass sticky top-0 z-40 border-b backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color] duration-300 ${
        dark ? "border-white/10 bg-[#050f33]/35" : "border-line/70 bg-surface/72"
      }`}
    >
      <nav aria-label="Main" className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Pact home" className="rounded-xl">
          <Wordmark light={dark} />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => {
            const on = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={on ? "page" : undefined}
                className={`t-small rounded-full px-3 py-2 font-medium transition-colors duration-200 ${l.hideSm ? "hidden sm:inline" : ""} ${
                  dark ? "text-white/75 hover:text-white" : on ? "text-navy" : "text-ink-2 hover:text-navy"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <CoinToggle onDark={dark} />
          <Link href="/new" className={`btn btn-sm ml-1 ${dark ? "btn-white" : "btn-primary"}`}>
            Start a pact
          </Link>
        </div>
      </nav>
    </header>
  );
}
