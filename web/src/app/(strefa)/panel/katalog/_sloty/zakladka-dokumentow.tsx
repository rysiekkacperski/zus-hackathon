'use client';

// Slot ViewCatalogList „zakladka-dokumentow” w liście slotyKatalogu (kontrakt, sekcja 12.4). Właściciel: u16.
// Słownik dokumentów i adresatów wniosków w grupach (wzór cz1/P05-16): forma zatrudnienia i płatnik, dokumenty
// i załączniki, adresat i termin. Teksty: teksty.ViewCatalogList.zakladkaDokumentow.
import { SYTUACJA_ROWNIEZ_PO_USTANIU } from '@/dane/katalog/slownik-dokumentow';
import { ListaAkordeonowa } from '@/komponenty/akordeon';
import { Karta } from '@/komponenty/karta';
import { Tabela } from '@/komponenty/tabela';
import type { WpisSlownikaDokumentow } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const T = teksty.ViewCatalogList.zakladkaDokumentow;
const GRUPY: WpisSlownikaDokumentow['grupa'][] = [
  'zasilek-chorobowy', 'swiadczenie-rehabilitacyjne', 'zwzm', 'zasilek-macierzynski', 'zalaczniki', 'wnioski-pracownika',
];

function opisKlucza(w: WpisSlownikaDokumentow): string {
  const formy = w.klucz.formy === 'kazda' ? T.kazdaForma : w.klucz.formy.map((f) => T.formy[f]).join(', ');
  const czesci = [formy];
  if (w.klucz.poUstaniu) czesci.push(T.poUstaniu);
  if (w.klucz.sytuacja === SYTUACJA_ROWNIEZ_PO_USTANIU) czesci.push(T.rowniezPoUstaniu);
  if (w.klucz.platnik) czesci.push(T.platnicy[w.klucz.platnik]);
  return czesci.join(', ');
}

export function SlotZakladkaDokumentow({ katalog }: PropsSlotu<'zakladka'>) {
  const elementy = GRUPY.map((grupa) => {
    const wpisy = katalog.dokumenty.filter((d) => d.grupa === grupa).sort((a, b) => a.kolejnosc - b.kolejnosc);
    const nazwa = T.grupy[grupa];
    return {
      id: `dokumenty-${grupa}`,
      naglowek: T.grupaZLiczba({ nazwa, liczba: String(wpisy.length) }),
      tresc: (
        <Tabela
          podpis={nazwa}
          etykietaPrzewijania={T.przewijanie({ nazwa })}
          kolumny={[
            { klucz: 'klucz', naglowek: T.kolumny.klucz, tytulowa: true },
            { klucz: 'dokumenty', naglowek: T.kolumny.dokumenty },
            { klucz: 'adresat', naglowek: T.kolumny.adresat },
            { klucz: 'termin', naglowek: T.kolumny.termin },
          ]}
          wiersze={wpisy.map((w) => ({
            id: w.id,
            klucz: (
              <>
                <span className="block text-small-strong">{w.swiadczenieAlboWniosek}</span>
                <span className="block text-small">{opisKlucza(w)}</span>
              </>
            ),
            dokumenty: (
              <ul className="m-0 flex flex-col gap-1 pl-5 text-small">
                {w.dokumenty.map((d) => <li key={d}>{d}</li>)}
              </ul>
            ),
            adresat: w.adresat,
            termin: w.termin,
          }))}
        />
      ),
    };
  });
  return (
    <Karta tytul={T.naglowek}>
      <p className="m-0 mb-6 text-body">{T.opis}</p>
      <p className="m-0 mb-3 text-body-strong">{T.liczba({ liczba: String(katalog.dokumenty.length) })}</p>
      <ListaAkordeonowa elementy={elementy} />
    </Karta>
  );
}
