import type { Metadata } from "next";
import Link from "next/link";
import { LinkDoTresci } from "@/komponenty/rama/link-do-tresci";
import { NaglowekPubliczny } from "@/komponenty/rama/naglowek";
import { teksty } from "@/teksty";

export const metadata: Metadata = { title: teksty.rama.nieZnaleziono.tytulStrony };

// Strona dla adresu spoza mapy tras i dla notFound() w trasie. Root not-found trafia do każdej trasy,
// więc zostaje komponentem serwerowym z samymi linkami.
export default function NieZnaleziono() {
  const tekst = teksty.rama.nieZnaleziono;
  return (
    <div className="flex min-h-dvh flex-col">
      <LinkDoTresci />
      <NaglowekPubliczny />
      <main id="tresc" className="w-full min-w-0 flex-1 px-4 pt-6 pb-16 lg:px-16">
        <div className="box-border flex max-w-tresc min-w-0 flex-col gap-6 pt-4 md:pt-10">
          <h1 className="m-0 min-w-0 break-words text-page-title text-ink">{tekst.naglowek}</h1>
          <p className="m-0 text-body">{tekst.opis}</p>
          <p className="m-0">
            <Link
              href="/"
              className="inline-flex min-h-control items-center justify-center rounded-xs border-2 border-brand bg-brand px-5 py-2 text-center text-body-strong text-on-brand no-underline transition-colors duration-150 hover:border-brand-deep hover:bg-brand-deep hover:text-on-brand motion-reduce:transition-none"
            >
              {tekst.akcja}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
