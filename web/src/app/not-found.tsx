import type { Metadata } from "next";
import { LinkDoTresci } from "@/komponenty/rama/link-do-tresci";
import { NaglowekPubliczny } from "@/komponenty/rama/naglowek";
import { TrescNieZnaleziono } from "@/komponenty/rama/tresc-nie-znaleziono";
import { teksty } from "@/teksty";

export const metadata: Metadata = { title: teksty.rama.nieZnaleziono.tytulStrony };

// Strona dla adresu spoza mapy tras i dla notFound() w trasie. Root not-found trafia do każdej trasy,
// więc zostaje komponentem serwerowym z samymi linkami. Grupa (symulacje) ma własny not-found bez ramy.
export default function NieZnaleziono() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LinkDoTresci />
      <NaglowekPubliczny />
      <main id="tresc" className="w-full min-w-0 flex-1 px-4 pt-6 pb-16 lg:px-16">
        <TrescNieZnaleziono />
      </main>
    </div>
  );
}
