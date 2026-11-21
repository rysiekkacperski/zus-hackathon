'use client';

// Karta „Historia wartości / wymiaru / stawki” na ViewCatalogValueEdit: wersje malejąco po dacie początku ze stanem.
import { opisWersji } from '@/app/(strefa)/panel/katalog/_czesci/opis-wartosci';
import { historiaWersji, rodzajWpisu } from '@/domena/katalog/edycja';
import type { DataISO, Katalog, WpisSlownika } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';

type KolumnaHistorii = 'wartosc' | 'od' | 'do' | 'stan';

export function HistoriaWartosci({ wpis, katalog, dzis }: { wpis: WpisSlownika; katalog: Katalog; dzis: DataISO }) {
  const t = teksty.ViewCatalogValueEdit;
  const rodzaj = rodzajWpisu(wpis);
  const historia = historiaWersji(wpis, dzis);
  return (
    <Karta tytul={t.historia[rodzaj]} bezLinii>
      <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
      <Tabela<KolumnaHistorii>
        podpis={t.historia[rodzaj]}
        etykietaPrzewijania={t.przewijanieHistorii}
        kolumny={[
          { klucz: 'wartosc', naglowek: t.kolumnaWartosci[rodzaj] },
          { klucz: 'od', naglowek: t.kolumnaOd },
          { klucz: 'do', naglowek: t.kolumnaDo },
          { klucz: 'stan', naglowek: t.kolumnaStanu },
        ]}
        wiersze={historia.map((wersja) => ({
          id: wersja.od,
          wartosc: <span className="text-ink-strong">{opisWersji(katalog, wpis, wersja, dzis)}</span>,
          od: <span className="text-ink-strong">{formatujDate(wersja.od)}</span>,
          do:
            wersja.do === undefined ? (
              t.bezDatyKonca
            ) : (
              <span className="text-ink-strong">{formatujDate(wersja.do)}</span>
            ),
          stan:
            wersja.stan === 'obowiazuje' ? (
              <strong className="font-semibold">{t.stany.obowiazuje}</strong>
            ) : (
              t.stany[wersja.stan]
            ),
        }))}
      />
      <Notatka className="mt-6">
        <p>{t.notatkaHistorii[rodzaj]}</p>
      </Notatka>
    </Karta>
  );
}
