export type Status =
  | "drafting" // mandate made, agent still shopping / writing promises
  | "awaiting_agreement" // promises ready, client must approve
  | "agreed" // approved, waiting for PayPal hold
  | "held" // PayPal authorization in place, waiting for work
  | "needs_fix" // last submission failed at least one promise
  | "verified" // all promises passed, waiting for client release
  | "paid" // captured
  | "voided"; // hold released back to client

export type Mandate = {
  task: string;
  category: "logo design" | "other";
  budget: number;
  currency: "USD";
  deadlineDays: number;
  deliverables: string[];
};

export type Offer = {
  id: string;
  seller: string;
  title: string;
  price: number;
  deliveryDays: number;
  category: string;
  rating: number;
  listing: string; // untrusted seller text
};

export type OfferReview = {
  offerId: string;
  verdict: "eligible" | "rejected" | "quarantined";
  reasons: string[];
  injection?: string; // exact suspicious sentence
};

export type CheckKind = "file_format" | "png_transparent" | "min_size" | "variant_count" | "vision";

export type Criterion = {
  id: string;
  text: string;
  check: CheckKind;
  format?: "svg" | "png";
  minPx?: number;
  count?: number;
  question?: string;
};

export type CriterionResult = {
  id: string;
  pass: boolean;
  evidence: string;
  method: "code" | "ai";
};

export type Submission = {
  at: string;
  files: { id: string; name: string; mime: string }[];
  results: CriterionResult[];
  pass: boolean;
  fixRequest?: string;
};

export type PactEvent = {
  at: string;
  kind: "mandate" | "guard" | "agent" | "promise" | "human" | "paypal" | "evidence" | "verdict" | "webhook";
  title: string;
  detail?: string;
  ref?: string; // PayPal id or similar
};

export type Pact = {
  id: string;
  createdAt: string;
  request: string;
  status: Status;
  mandate?: Mandate;
  reviews?: OfferReview[];
  offer?: Offer;
  agentReason?: string;
  criteria?: Criterion[];
  deadline?: string;
  paypal: {
    orderId?: string;
    authorizationId?: string;
    authExpires?: string;
    captureId?: string;
  };
  submissions: Submission[];
  events: PactEvent[];
};
