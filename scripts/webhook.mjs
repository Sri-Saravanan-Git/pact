// Registers the PayPal sandbox webhook for a deployed URL and prints its id.
// Usage: node --env-file=.env.local scripts/webhook.mjs https://your-app.vercel.app
const site = process.argv[2];
if (!site?.startsWith("https://")) throw new Error("Pass the deployed https URL");
const B = "https://api-m.sandbox.paypal.com";
const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
const { access_token } = await fetch(`${B}/v1/oauth2/token`, {
  method: "POST",
  headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
  body: "grant_type=client_credentials",
}).then((r) => r.json());
const res = await fetch(`${B}/v1/notifications/webhooks`, {
  method: "POST",
  headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    url: `${site.replace(/\/$/, "")}/api/paypal/webhook`,
    event_types: ["PAYMENT.AUTHORIZATION.CREATED", "PAYMENT.CAPTURE.COMPLETED", "PAYMENT.AUTHORIZATION.VOIDED"].map((name) => ({ name })),
  }),
}).then((r) => r.json());
console.log(res.id ? `PAYPAL_WEBHOOK_ID=${res.id}` : res);
