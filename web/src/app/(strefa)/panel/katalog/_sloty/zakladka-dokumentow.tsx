'use client';

// Slot ViewCatalogList „zakladka-dokumentow” w liście slotyKatalogu (kontrakt, sekcja 12.4). Właściciel: u16.
// Słownik dokumentów i adresatów wniosków w grupach (wzór cz1/P05-16): forma zatrudnienia i płatnik, dokumenty
// i załączniki, adresat i termin. Każdy wpis ma odnośnik do zmiany (ViewCatalogDocumentEdit), a każda grupa
// odnośnik do nowego wpisu (ViewCatalogDocumentAdd). Teksty: teksty.ViewCatalogList.zakladkaDokumentow.
import { SYTUACJA_ROWNIEZ_PO_USTANIU } from '@/dane/katalog/slownik-dokumentow';
import { kotwicaDokumentu } from '@/dane/magazyn/operacje/katalog';
import { GRUPY_DOKUMENTOW } from '@/domena/katalog/edycja-panelu';
import { ListaAkordeonowa } from '@/komponenty/akordeon';
import { Karta } from '@/komponenty/karta';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import type { WpisSlownikaDokumentow } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const T = teksty.ViewCatalogList.zakladkaDokumentow;
const E = teksty.ViewCatalogList.edycja;

function opisKlucza(w: WpisSlownikaDokumentow): string {
  const formy = w.klucz.formy === 'kazda' ? T.kazdaForma : w.klucz.formy.map((f) => T.formy[f]).join(', ');
  const czesci = [formy];
  if (w.klucz.poUstaniu) czesci.push(T.poUstaniu);
  if (w.klucz.sytuacja === SYTUACJA_ROWNIEZ_PO_USTANIU) czesci.push(T.rowniezPoUstaniu);
  if (w.klucz.platnik) czesci.push(T.platnicy[w.klucz.platnik]);
  return czesci.join(', ');
}

export function SlotZakladkaDokumentow({ katalog }: PropsSlotu<'zakladka'>) {
  const elementy = GRUPY_DOKUMENTOW.map((grupa) => {
    const wpisy = katalog.dokumenty.filter((d) => d.grupa === grupa).sort((a, b) => a.kolejnosc - b.kolejnosc);
    const nazwa = T.grupy[grupa];
    return {
      id: `dokumenty-${grupa}`,
      naglowek: T.grupaZLiczba({ nazwa, liczba: String(wpisy.length) }),
      tresc: (
        <div className="flex flex-col gap-4">
          <Tabela
            podpis={nazwa}
            etykietaPrzewijania={T.przewijanie({ nazwa })}
            kolumny={[
              { klucz: 'klucz', naglowek: T.kolumny.klucz, tytulowa: true },
              { klucz: 'dokumenty', naglowek: T.kolumny.dokumenty },
              { klucz: 'adresat', naglowek: T.kolumny.adresat },
              { klucz: 'termin', naglowek: T.kolumny.termin },
              { klucz: 'akcja', naglowek: E.kolumnaAkcji, ukryjNaglowek: true },
            ]}
            wiersze={wpisy.map((w) => ({
              id: w.id,
              klucz: (
                <span id={kotwicaDokumentu(w.id)} className="scroll-mt-28">
                  <span className="block text-small-strong">{w.swiadczenieAlboWniosek}</span>
                  <span className="block text-small">{opisKlucza(w)}</span>
                </span>
              ),
              dokumenty: (
                <ul className="m-0 flex flex-col gap-1 pl-5 text-small">
                  {w.dokumenty.map((d) => <li key={d}>{d}</li>)}
                </ul>
              ),
              adresat: w.adresat,
              termin: w.termin,
              akcja: (
                <Odnosnik
                  href={trasy.ViewCatalogDocumentEdit({ idDokumentu: w.id })}
                  aria-label={E.zmienDokument({ nazwa: w.swiadczenieAlboWniosek })}
                >
                  {teksty.ViewCatalogList.zmien}
                </Odnosnik>
              ),
            }))}
          />
          <div>
            <PrzyciskLink href={trasy.ViewCatalogDocumentAdd({ grupa })} wariant="drugorzedny" ikona="plus">
              {E.dodajDokument}
            </PrzyciskLink>
          </div>
        </div>
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
