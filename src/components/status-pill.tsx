import { STATUS, TONE } from "@/lib/ui";
import type { Status } from "@/lib/types";

/** Keyed on status so a change re-mounts and crossfades through a short blur. */
export function StatusPill({ status, className = "" }: { status: Status; className?: string }) {
  const s = STATUS[status];
  return (
    <span key={status} className={`chip swap ${TONE[s.tone]} ${className}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
