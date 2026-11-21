import Link from 'next/link';
import { Ikona } from '@/komponenty/ikona';
import { liczbaKrokow, numerKroku } from '@/komponenty/kroki';
import { Postep } from '@/komponenty/postep';
import { teksty } from '@/teksty';

export interface PozycjaKartyKrokowZam {
  nazwa: string;
  href?: string;
  /** Liczba części ekranu kroku; każda część liczy się w „Krok N z M”. */
  czesci?: number;
}

export interface KartaKrokowZamProps {
  kroki: PozycjaKartyKrokowZam[];
  /** Numer bieżącego ekranu na liście, od 1. */
  biezacy: number;
  /** Bieżąca część ekranu, od 1. */
  czesc?: number;
  id: string;
}

const t = teksty.ViewZamPrebirth.kroki;

// Karta kroków kreatora ZAM ze wzoru P11-04: „Krok N z M: nazwa”, pasek postępu i lista kroków
// z odnośnikami do kroków zakończonych. Ekran z częściami zajmuje na liście zakres numerów, np. „2–4. Początek zasiłku”.
export function KartaKrokowZam({ kroki, biezacy, czesc = 1, id }: KartaKrokowZamProps) {
  const zCzesciami = kroki.map((k, i) => ({ id: String(i + 1), czesci: k.czesci }));
  const nazwa = kroki[biezacy - 1]?.nazwa ?? '';
  const krok = numerKroku(zCzesciami, String(biezacy), czesc);
  const liczba = liczbaKrokow(zCzesciami);
  const idTytulu = `${id}-tytul`;
  return (
    <section aria-labelledby={idTytulu} className="min-w-0 rounded-sm bg-surface-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={idTytulu} className="m-0 text-body-strong text-ink">
          {teksty.wspolne.zlozone.krokZNazwa({ krok, liczbaKrokow: liczba, nazwa })}
        </h2>
        <p className="m-0 text-small">{t.zapisujemy}</p>
      </div>
      <Postep
        wartosc={krok}
        min={0}
        maks={liczba}
        etykieta={teksty.wspolne.zlozone.krokZ({ krok, liczbaKrokow: liczba })}
        idEtykiety={idTytulu}
        className="mt-3"
      />
      <ol aria-label={t.etykietaListy} className="m-0 mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small">
        {kroki.map((pozycja, i) => {
          const numer = i + 1;
          const od = numerKroku(zCzesciami, String(numer), 1);
          const czesci = Math.max(1, pozycja.czesci ?? 1);
          const tekst = czesci > 1 ? t.pozycjaZakres({ od, do_: od + czesci - 1, nazwa: pozycja.nazwa }) : t.pozycja({ numer: od, nazwa: pozycja.nazwa });
          if (numer === biezacy) {
            return (
              <li key={pozycja.nazwa} aria-current="step" className="font-semibold text-ink-strong">
                {tekst}
              </li>
            );
          }
          if (numer < biezacy && pozycja.href) {
            return (
              <li key={pozycja.nazwa}>
                <Link href={pozycja.href} className="inline-flex items-center gap-1 text-brand underline hover:text-brand-deep">
                  <Ikona nazwa="zaznaczenie" rozmiar={16} />
                  {tekst}
                  <span className="sr-only">{`, ${t.zakonczony}`}</span>
                </Link>
              </li>
            );
          }
          return <li key={pozycja.nazwa}>{tekst}</li>;
        })}
      </ol>
    </section>
  );
}
