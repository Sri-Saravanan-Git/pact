import Link from "next/link";

/** Glass pill for dark backgrounds: frosted fill, bright rim, a light sheen that glides across on hover. */
export function GlassLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn btn-glass">
      <span className="relative">{children}</span>
    </Link>
  );
}
