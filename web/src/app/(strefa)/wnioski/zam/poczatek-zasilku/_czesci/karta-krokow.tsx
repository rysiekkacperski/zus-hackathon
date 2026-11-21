import Link from 'next/link';
import { Ikona } from '@/komponenty/ikona';
import { Postep } from '@/komponenty/postep';
import { teksty } from '@/teksty';

export interface KrokKreatoraZam {
  nazwa: string;
  href?: string;
}

export interface KartaKrokowZamProps {
  kroki: KrokKreatoraZam[];
  /** Numer bieżącego kroku od 1. */
  biezacy: number;
  id: string;
}

const t = teksty.ViewZamPrebirth.kroki;

// Karta kroków kreatora ZAM ze wzoru P11-04: „Krok N z M: nazwa”, pasek postępu i lista kroków
// z odnośnikami do kroków zakończonych.
export function KartaKrokowZam({ kroki, biezacy, id }: KartaKrokowZamProps) {
  const nazwa = kroki[biezacy - 1]?.nazwa ?? '';
  const idTytulu = `${id}-tytul`;
  return (
    <section aria-labelledby={idTytulu} className="min-w-0 rounded-sm bg-surface-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={idTytulu} className="m-0 text-body-strong text-ink">
          {teksty.wspolne.zlozone.krokZNazwa({ krok: biezacy, liczbaKrokow: kroki.length, nazwa })}
        </h2>
        <p className="m-0 text-small">{t.zapisujemy}</p>
      </div>
      <Postep
        wartosc={biezacy}
        min={0}
        maks={kroki.length}
        etykieta={teksty.wspolne.zlozone.krokZ({ krok: biezacy, liczbaKrokow: kroki.length })}
        idEtykiety={idTytulu}
        className="mt-3"
      />
      <ol aria-label={t.etykietaListy} className="m-0 mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small">
        {kroki.map((krok, i) => {
          const numer = i + 1;
          const tekst = t.pozycja({ numer, nazwa: krok.nazwa });
          if (numer === biezacy) {
            return (
              <li key={krok.nazwa} aria-current="step" className="font-semibold text-ink-strong">
                {tekst}
              </li>
            );
          }
          if (numer < biezacy && krok.href) {
            return (
              <li key={krok.nazwa}>
                <Link href={krok.href} className="inline-flex items-center gap-1 text-brand underline hover:text-brand-deep">
                  <Ikona nazwa="zaznaczenie" rozmiar={16} />
                  {tekst}
                  <span className="sr-only">{`, ${t.zakonczony}`}</span>
                </Link>
              </li>
            );
          }
          return <li key={krok.nazwa}>{tekst}</li>;
        })}
      </ol>
    </section>
  );
}
