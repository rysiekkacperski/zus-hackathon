import Link from "next/link";
import { FlagaDemo } from "@/komponenty/flaga-demo";
import { Ikona } from "@/komponenty/ikona";
import { LinkDoTresci } from "@/komponenty/rama/link-do-tresci";
import { Logo } from "@/komponenty/rama/naglowek";
import { teksty } from "@/teksty";

// Symulowane serwisy zewnętrzne otwierane w nowej karcie: nagłówek z logo,
// flaga trybu demonstracyjnego i link powrotu do przewodnika.
export default function UkladSymulacji({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <LinkDoTresci />
      <header className="relative z-20 flex min-h-header flex-wrap items-center gap-x-4 gap-y-2 bg-surface-card px-3 py-2 shadow-header md:px-7.5">
        <Logo href="/" />
        <FlagaDemo />
        <Link
          href="/"
          className="ml-auto inline-flex items-center gap-2 text-body-strong text-brand hover:text-brand-deep"
        >
          <Ikona nazwa="w-lewo" rozmiar={20} />
          {teksty.rama.powrotDoPrzewodnika}
        </Link>
      </header>
      <main id="tresc" className="w-full min-w-0 flex-1 px-4 pt-6 pb-16 lg:px-16">
        <div className="max-w-tresc min-w-0">{children}</div>
      </main>
    </div>
  );
}
