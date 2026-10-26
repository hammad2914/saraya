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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${bodoni.variable} antialiased`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
