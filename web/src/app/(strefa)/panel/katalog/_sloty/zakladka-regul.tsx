'use client';

// Slot ViewCatalogList „zakladka-regul” w liście slotyKatalogu (kontrakt, sekcja 12.4). Właściciel: u16.
// Reguły świadczeń z ubezpieczenia chorobowego z treścią i wpisami słowników, z których reguła odczytuje wartość
// obowiązującą (wzór cz1/P05-15). Teksty: teksty.ViewCatalogList.zakladkaRegul.
import { ListaAkordeonowa } from '@/komponenty/akordeon';
import { Karta } from '@/komponenty/karta';
import { formatujDate, porownajDaty } from '@/domena/daty';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const T = teksty.ViewCatalogList.zakladkaRegul;

export function SlotZakladkaRegul({ katalog, dzis }: PropsSlotu<'zakladka'>) {
  const elementy = katalog.reguly.map((r) => ({
    id: `regula-${r.id}`,
    naglowek: r.nazwa,
    tresc: (
      <div className="flex flex-col gap-4">
        <p className="m-0 text-body">{r.tresc}</p>
        <div>
          <p className="m-0 mb-2 text-small-strong">{T.wpisy}</p>
          {r.wpisy.length === 0 ? (
            <p className="m-0 text-small">{T.bezWartosci}</p>
          ) : (
            <ul className="m-0 flex flex-col gap-1 pl-5 text-small">
              {r.wpisy.map((idWpisu) => {
                const wpis = katalog.slowniki.find((w) => w.id === idWpisu);
                const wersja = wpis?.wersje.find(
                  (v) => porownajDaty(v.od, dzis) <= 0 && (v.do === undefined || porownajDaty(dzis, v.do) <= 0),
                );
                return (
                  <li key={idWpisu}>
                    {wpis ? wpis.nazwa : idWpisu}
                    {wersja ? `, ${T.obowiazujeOd({ data: formatujDate(wersja.od) })}` : wpis ? null : `, ${T.wpisPoza}`}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    ),
  }));
  return (
    <Karta tytul={T.naglowek}>
      <p className="m-0 mb-6 text-body">{T.opis}</p>
      <p className="m-0 mb-3 text-body-strong">{T.liczba({ liczba: String(katalog.reguly.length) })}</p>
      <ListaAkordeonowa elementy={elementy} />
    </Karta>
  );
}
