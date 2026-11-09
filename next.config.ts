import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // The client id is public by design (it is in every PayPal button); the secret never leaves the server.
  // Sandbox buyer login is shown on the hold step so judges can approve in the PayPal popup. Sandbox only.
  env: {
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    NEXT_PUBLIC_SANDBOX_BUYER_EMAIL: process.env.PAYPAL_BUYER_EMAIL,
    NEXT_PUBLIC_SANDBOX_BUYER_PASSWORD: process.env.PAYPAL_BUYER_PASSWORD,
  },
  serverExternalPackages: ["sharp"],
  // sample deliveries are read from disk by the submit route
  outputFileTracingIncludes: { "/api/pacts/[id]/submit": ["./public/samples/**/*"] },
  // baseline hardening headers on every response
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
