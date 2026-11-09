import Link from "next/link";
import { BoardGrid } from "./board-grid";

export const metadata = { title: "Board · Pact" };

export default function Board() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] pb-20">
      <div className="wrap py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="t-h1 text-navy">Board</h1>
            <p className="t-lead mt-3 max-w-[56ch] text-ink-2">Every pact in the sandbox, with the PayPal IDs that prove where its money is. Select a row to open it.</p>
          </div>
          <Link href="/new" className="btn btn-primary">
            Start a pact
          </Link>
        </div>
        <BoardGrid />
      </div>
    </div>
  );
}
