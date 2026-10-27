import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";

import { SmoothScroll } from "@/components/smooth-scroll";

import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Saraya Estates | Luxury homes in Dubai",
  description: "Villas, penthouses and apartments in Dubai's most sought-after addresses.",
};

/**
 * The hero opens zoomed right into its window, by an amount that depends on the
 * screen. Measured here, before the first paint, so CSS can draw that first frame
 * instead of the window at rest (see globals.css). Same sum as startScale in window-hero.
 */
const heroStart = `(function(){var w=innerWidth,h=innerHeight,wide=matchMedia("(min-width: 48rem) and (orientation: landscape)").matches,wh=h*(wide?0.66:0.4),ww=wh*0.62;document.documentElement.style.setProperty("--hero-start",String(Math.max(w/ww,h/(wh*0.38))*1.12))})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The script above sets a style on <html> before React loads, hence suppressHydrationWarning.
    <html lang="en" className={`${manrope.variable} ${bodoni.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: heroStart }} />
      </head>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
