'use client';

// Tabela słownika kwot i progów albo słownika wymiarów i okresów na ViewCatalogList (wzór Katalog, P04-05, P04-08, P04-11).
import { Fragment } from 'react';
import { opisWersji, okresWersji } from '@/app/(strefa)/panel/katalog/_czesci/opis-wartosci';
import { kotwicaWpisu } from '@/dane/magazyn/operacje/katalog';
import { czyWpisEdytowalny, wersjaObowiazujacaWpisu, wersjeZaplanowane } from '@/domena/katalog/edycja';
import type { DataISO, Katalog, WpisSlownika } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { trasy } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';

type KolumnaSlownika = 'nazwa' | 'wartosc' | 'okres' | 'akcja';

export interface TabelaSlownikaProps {
  rodzaj: 'kwoty' | 'wymiary';
  wpisy: WpisSlownika[];
  katalog: Katalog;
  dzis: DataISO;
}

function KomorkaWartosci({ wpis, katalog, dzis }: { wpis: WpisSlownika; katalog: Katalog; dzis: DataISO }) {
  const t = teksty.ViewCatalogList;
  const obowiazujaca = wersjaObowiazujacaWpisu(wpis, dzis);
  const zaplanowane = wersjeZaplanowane(wpis, dzis);
  return (
    <span className="text-ink-strong">
      {obowiazujaca ? opisWersji(katalog, wpis, obowiazujaca, dzis) : t.brakObowiazujacej}
      {zaplanowane.map((wersja) => (
        <Fragment key={wersja.od}>
          <br />
          <strong className="font-semibold">{t.zaplanowanaOd({ data: formatujDate(wersja.od) })}</strong>{' '}
          {opisWersji(katalog, wpis, wersja, dzis)}
        </Fragment>
      ))}
    </span>
  );
}

function KomorkaOkresu({ wpis, dzis }: { wpis: WpisSlownika; dzis: DataISO }) {
  const obowiazujaca = wersjaObowiazujacaWpisu(wpis, dzis) ?? wersjeZaplanowane(wpis, dzis)[0];
  if (!obowiazujaca) return null;
  const okres = okresWersji(obowiazujaca);
  return (
    <span className="text-ink-strong">
      {okres.od}
      {okres.do ? (
        <>
          <br />
          {okres.do}
        </>
      ) : null}
    </span>
  );
}

export function TabelaSlownika({ rodzaj, wpisy, katalog, dzis }: TabelaSlownikaProps) {
  const t = teksty.ViewCatalogList;
  const ts = t[rodzaj];
  return (
    <Karta tytul={ts.naglowek} bezLinii>
      <p className="m-0 mb-4">{ts.opis}</p>
      <p className="m-0 mb-4">
        {t.liczbaWartosci} <strong className="font-semibold">{wpisy.length}</strong>
      </p>
      <Tabela<KolumnaSlownika>
        podpis={ts.naglowek}
        etykietaPrzewijania={ts.przewijanie}
        kolumny={[
          { klucz: 'nazwa', naglowek: ts.kolumnaNazwy, tytulowa: true },
          { klucz: 'wartosc', naglowek: ts.kolumnaWartosci },
          { klucz: 'okres', naglowek: t.kolumnaOkresu },
          { klucz: 'akcja', naglowek: t.kolumnaAkcji, ukryjNaglowek: true },
        ]}
        wiersze={wpisy.map((wpis) => ({
          id: wpis.id,
          nazwa: (
            <span id={kotwicaWpisu(wpis.id)} className="scroll-mt-28">
              {wpis.nazwa}
            </span>
          ),
          wartosc: <KomorkaWartosci wpis={wpis} katalog={katalog} dzis={dzis} />,
          okres: <KomorkaOkresu wpis={wpis} dzis={dzis} />,
          akcja: czyWpisEdytowalny(wpis) ? (
            <Odnosnik
              href={trasy.ViewCatalogValueEdit({ idWpisu: wpis.id })}
              aria-label={t.zmienWartosc({ nazwa: wpis.nazwa })}
            >
              {t.zmien}
            </Odnosnik>
          ) : null,
        }))}
      />
      <Notatka className="mt-6">
        <p>{ts.notatka}</p>
      </Notatka>
    </Karta>
  );
}
