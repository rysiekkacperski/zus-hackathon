import Link from 'next/link';
import { teksty } from '@/teksty';

// Treść strony „Nie znaleźliśmy strony” bez ramy: root not-found dokłada do niej nagłówek publiczny,
// a not-found grupy (symulacje) wstawia ją w układ symulacji.
export function TrescNieZnaleziono() {
  const tekst = teksty.rama.nieZnaleziono;
  return (
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
  );
}
