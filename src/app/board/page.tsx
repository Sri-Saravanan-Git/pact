import { BoardGrid } from "./board-grid";

export const metadata = { title: "Board · Pact" };

export default function Board() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-board text-flap-ink">
      <div className="wrap py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-sign text-[clamp(2.4rem,5vw,4rem)] font-extrabold uppercase text-sign">Departures</h1>
            <p className="mt-2 max-w-[60ch] text-flap-dim">Every pact in the sandbox, with the PayPal IDs that prove where its money is. Select a row to open its flight.</p>
          </div>
          <a href="/new" className="btn btn-sign">
            Start a pact
          </a>
        </div>
        <BoardGrid />
      </div>
    </div>
  );
}
