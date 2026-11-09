import type { Metadata, Viewport } from "next";
import { B612_Mono, Barlow, Barlow_Semi_Condensed } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const body = Barlow({ variable: "--nf-body", subsets: ["latin"], weight: ["400", "500", "600"] });
const sign = Barlow_Semi_Condensed({ variable: "--nf-sign", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const flap = B612_Mono({ variable: "--nf-flap", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Pact — money that moves only when the promise is proven",
  description:
    "Pact turns a plain-English request into a hard spending mandate, lets an AI agent buy under it, holds the money with PayPal, and releases it only when the work is proven.",
};

export const viewport: Viewport = { themeColor: "#E3E4DF" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${sign.variable} ${flap.variable}`}>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
