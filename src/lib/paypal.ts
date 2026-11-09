import "server-only";

const BASE = "https://api-m.sandbox.paypal.com";

let cached: { token: string; until: number } | undefined;
async function token() {
  if (cached && cached.until > Date.now()) return cached.token;
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status})`);
  const j = await res.json();
  cached = { token: j.access_token, until: Date.now() + (j.expires_in - 60) * 1000 };
  return cached.token;
}

async function call(path: string, body: unknown, requestId?: string) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await token()}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const issue = j.details?.[0]?.issue ?? j.name ?? res.status;
    throw new Error(`PayPal ${path.split("/").slice(-1)[0]} failed: ${issue}`);
  }
  return j;
}

function order(pactId: string, amount: number, description: string, extra: object = {}) {
  return {
    intent: "AUTHORIZE",
    purchase_units: [
      {
        reference_id: pactId,
        description: description.slice(0, 127),
        amount: { currency_code: "USD", value: amount.toFixed(2) },
        // Money goes straight to the freelancer on capture. Pact never holds funds.
        payee: { email_address: process.env.PAYPAL_FREELANCER_EMAIL },
      },
    ],
    ...extra,
  };
}

/** Buyer-approved flow: create order, buyer approves in PayPal popup, then authorizeOrder. */
export async function createOrder(pactId: string, amount: number, description: string) {
  const j = await call("/v2/checkout/orders", order(pactId, amount, description), `create-${pactId}-${Date.now()}`);
  return j.id as string;
}

export async function authorizeOrder(orderId: string) {
  const j = await call(`/v2/checkout/orders/${orderId}/authorize`, {}, `auth-${orderId}`);
  const a = j.purchase_units[0].payments.authorizations[0];
  return { authorizationId: a.id as string, status: a.status as string, expires: a.expiration_time as string };
}

/** One-click sandbox path for judges: PayPal's public test card, authorized server-side. */
export async function holdWithTestCard(pactId: string, amount: number, description: string) {
  const j = await call(
    "/v2/checkout/orders",
    order(pactId, amount, description, {
      payment_source: { card: { number: "4111111111111111", expiry: "2030-12", security_code: "123", name: "Sandbox Tester" } },
    }),
    `card-${pactId}`,
  );
  const a = j.purchase_units[0].payments.authorizations[0];
  return { orderId: j.id as string, authorizationId: a.id as string, status: a.status as string, expires: a.expiration_time as string };
}

export async function capture(authorizationId: string) {
  const j = await call(`/v2/payments/authorizations/${authorizationId}/capture`, { final_capture: true }, `cap-${authorizationId}`);
  return { captureId: j.id as string, status: j.status as string };
}

export async function voidHold(authorizationId: string) {
  // void returns 204 on success with no body; call() tolerates that
  await call(`/v2/payments/authorizations/${authorizationId}/void`, {}, `void-${authorizationId}`);
}

export async function verifyWebhook(headers: Headers, event: unknown) {
  const j = await call("/v1/notifications/verify-webhook-signature", {
    auth_algo: headers.get("paypal-auth-algo"),
    cert_url: headers.get("paypal-cert-url"),
    transmission_id: headers.get("paypal-transmission-id"),
    transmission_sig: headers.get("paypal-transmission-sig"),
    transmission_time: headers.get("paypal-transmission-time"),
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    webhook_event: event,
  });
  return j.verification_status === "SUCCESS";
}
