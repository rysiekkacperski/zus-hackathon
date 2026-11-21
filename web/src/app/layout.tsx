import type { Metadata } from "next";
import { preload } from "react-dom";
import { teksty } from "@/teksty";
import "./globals.css";

// Pliki kroju Open Sans z public/fonty/, zadeklarowane w globals.css jako jedna rodzina z unicode-range.
// Interfejs po polsku korzysta z obu podzbiorów, więc przeglądarka wczytuje oba z wyprzedzeniem.
const plikiFontow = [
  "/fonty/open-sans-latin-wght-normal.woff2",
  "/fonty/open-sans-latin-ext-wght-normal.woff2",
] as const;

export const metadata: Metadata = {
  title: teksty.wspolne.nazwaAplikacji,
  description: teksty.wspolne.opisAplikacji,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  for (const plik of plikiFontow) {
    preload(plik, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    <html lang="pl">
      <body className="min-h-dvh bg-surface-page font-sans text-ink">{children}</body>
    </html>
  );
}
