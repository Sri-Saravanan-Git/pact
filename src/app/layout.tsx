import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Nav, NavBar } from "@/components/nav";
import "./globals.css";

const sans = Geist({ variable: "--nf-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--nf-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pact — money that moves only when the promise is proven",
  description:
    "Pact turns a plain-English request into a hard spending mandate, lets an AI agent buy under it, holds the money with PayPal, and releases it only when the work is proven.",
};

const THEME_BOOT = `try{var t=localStorage.getItem("pact-theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* set the theme before first paint so there is no flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>
        <div aria-hidden className="ambient" />
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Suspense fallback={<NavBar />}>
          <Nav />
        </Suspense>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
