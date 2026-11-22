'use client';

// ModalBenefitRules (kontrakt, tabela 2.3; wzór cz1/P05-03-Zastosowane-reguly): okno modalne na ViewPregnancyBenefits.
// Pokazuje zdanie wyniku, reguły zastosowane do wyniku, wartości słowników z datą początku obowiązywania, dane
// ze źródłem i warunki, których system nie sprawdza w danych. Właściciel: u16. Teksty: teksty.ModalBenefitRules.
import { regulySwiadczen } from '@/dane/katalog/reguly-swiadczen';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { Tabela } from '@/komponenty/tabela';
import { formatujDate } from '@/domena/daty';
import type { Katalog } from '@/domena/typy';
import type { UstalenieSwiadczenia } from '@/domena/zasilki/prawo-w-ciazy';
import { teksty } from '@/teksty';

const T = teksty.ModalBenefitRules;

export interface OknoZastosowanychRegulProps {
  otwarte: boolean;
  onZamknij: () => void;
  nazwaSwiadczenia?: string;
  etykietaWyniku?: string;
  ustalenie?: UstalenieSwiadczenia | null;
  katalog?: Katalog;
}

export function OknoZastosowanychRegul({ otwarte, onZamknij, nazwaSwiadczenia, etykietaWyniku, ustalenie, katalog }: OknoZastosowanychRegulProps) {
  const wynik = ustalenie?.wynik;
  const regulyKatalogu = katalog && katalog.reguly.length > 0 ? katalog.reguly : regulySwiadczen;
  const reguly = (wynik?.zastosowaneReguly ?? [])
    .map((z) => regulyKatalogu.find((r) => r.id === z.idReguly))
    .filter((r) => r !== undefined);
  const tytul = nazwaSwiadczenia ? T.tytulSwiadczenia({ nazwa: nazwaSwiadczenia }) : T.tytul;
  const zrodla = teksty.ViewPregnancyBenefits.zrodla;

  return (
    <OknoModalne
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={tytul}
      szerokosc="szeroka"
      opis={
        wynik && etykietaWyniku
          ? wynik.postac === 'przysluguje' && wynik.od
            ? T.wynikOd({ wynik: etykietaWyniku, data: formatujDate(wynik.od) })
            : T.wynik({ wynik: etykietaWyniku })
          : undefined
      }
      stopka={
        <Przycisk wariant="glowny" onClick={onZamknij}>
          {teksty.wspolne.przyciski.zamknij}
        </Przycisk>
      }
    >
      <div className="flex flex-col gap-6">
        <section aria-labelledby="okno-reguly-t">
          <h3 id="okno-reguly-t" className="m-0 mb-3 text-body-strong">{T.reguly}</h3>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {reguly.map((r) => (
              <li key={r.id} className="rounded-sm bg-surface-page px-4 py-3">
                <p className="m-0 text-small-strong">{r.nazwa}</p>
                <p className="m-0 mt-1 text-small">{r.tresc}</p>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="okno-wartosci-t">
          <h3 id="okno-wartosci-t" className="m-0 mb-3 text-body-strong">{T.wartosci}</h3>
          <Tabela
            podpis={T.wartosci}
            etykietaPrzewijania={T.wartosciPrzewijanie}
            kolumny={[
              { klucz: 'wpis', naglowek: T.kolumnyWartosci.wpis, tytulowa: true },
              { klucz: 'wartosc', naglowek: T.kolumnyWartosci.wartosc },
              { klucz: 'od', naglowek: T.kolumnyWartosci.od },
            ]}
            wiersze={(ustalenie?.wartosci ?? []).map((w, i) => ({ id: `w${i}`, wpis: w.wpis, wartosc: w.wartosc, od: formatujDate(w.od) }))}
            pustaTresc={T.brakDanych}
          />
        </section>
        <section aria-labelledby="okno-dane-t">
          <h3 id="okno-dane-t" className="m-0 mb-3 text-body-strong">{T.dane}</h3>
          <Tabela
            podpis={T.dane}
            etykietaPrzewijania={T.danePrzewijanie}
            kolumny={[
              { klucz: 'dana', naglowek: T.kolumnyDanych.dana, tytulowa: true },
              { klucz: 'wartosc', naglowek: T.kolumnyDanych.wartosc },
              { klucz: 'zrodlo', naglowek: T.kolumnyDanych.zrodlo },
            ]}
            wiersze={(wynik?.daneZeZrodlem ?? []).map((d, i) => ({
              id: `d${i}`,
              dana: d.pole,
              wartosc: d.wartosc,
              zrodlo: zrodla[d.zrodlo],
            }))}
            pustaTresc={T.brakDanych}
          />
        </section>
        {wynik && wynik.warunkiBezSprawdzenia.length > 0 ? (
          <section aria-labelledby="okno-warunki-t">
            <h3 id="okno-warunki-t" className="m-0 mb-3 text-body-strong">{T.warunki}</h3>
            <ul className="m-0 flex flex-col gap-2 pl-5">
              {wynik.warunkiBezSprawdzenia.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </OknoModalne>
  );
}
