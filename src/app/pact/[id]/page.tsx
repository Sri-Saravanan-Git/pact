import { Suspense } from "react";
import { PactView } from "./pact-view";

export const metadata = { title: "Pact · flight" };

export default function PactPage() {
  return (
    <Suspense>
      <PactView />
    </Suspense>
  );
}
