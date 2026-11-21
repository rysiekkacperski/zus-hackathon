import type { Metadata } from "next";
import localFont from "next/font/local";
import { teksty } from "@/teksty";
import "./globals.css";

const openSansLatin = localFont({
  src: "./_fonty/open-sans-latin-wght-normal.woff2",
  weight: "300 800",
  display: "swap",
  variable: "--font-open-sans-latin",
});

const openSansLatinExt = localFont({
  src: "./_fonty/open-sans-latin-ext-wght-normal.woff2",
  weight: "300 800",
  display: "swap",
  variable: "--font-open-sans-latin-ext",
});

export const metadata: Metadata = {
  title: teksty.wspolne.nazwaAplikacji,
  description: teksty.wspolne.opisAplikacji,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className={`${openSansLatin.variable} ${openSansLatinExt.variable}`}>
      <body className="min-h-dvh bg-surface-page text-ink">{children}</body>
    </html>
  );
}
