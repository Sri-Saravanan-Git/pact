import { Suspense } from "react";
import { CheckIn } from "./check-in";

export const metadata = { title: "Start a pact · Pact" };

export default function NewPact() {
  return (
    <Suspense>
      <CheckIn />
    </Suspense>
  );
}
