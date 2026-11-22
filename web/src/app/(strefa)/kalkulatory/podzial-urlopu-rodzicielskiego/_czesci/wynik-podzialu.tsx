'use client';

import type { CSSProperties } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { Tabela } from '@/komponenty/tabela';
import { dodajDni, formatujDate } from '@/domena/daty';
import { formatujKwote, formatujProcent } from '@/domena/kwoty';
import type { WynikPodzialu } from '@/domena/kalkulatory/podzial';
import { teksty } from '@/teksty';

const t = teksty.ViewCalcParentalSplit;
const tyg = teksty.ViewCalcMaternityVariant.tygodnie;

function Segment({ szerokosc, klasa, children }: { szerokosc: number; klasa: string; children?: React.ReactNode }) {
  if (szerokosc <= 0) return null;
  const styl = { '--szerokosc-segmentu': `${szerokosc.toFixed(2)}%` } as CSSProperties;
  return (
    <div style={styl} className={`flex min-w-0 shrink-0 grow-0 basis-(--szerokosc-segmentu) flex-col gap-1 ${klasa}`}>
      {children}
    </div>
  );
}

export interface WynikPodzialuProps {
  wynik: WynikPodzialu;
  tygodnieMatki: number;
  tygodnieDrugiego: number;
  wariantMatki: '81-5' | '100-70';
  zaZyciem: boolean;
  bezPrawa: boolean;
  imieMatki: string;
  imieDrugiego: string;
}

/** Kafle, pasek podziału, tygodnie nieprzenoszalne i tabela „Szacunkowe miesięczne wypłaty” (wzory P20-02..P20-05, P20-11). */
export function WynikPodzialuUrlopu({ wynik, tygodnieMatki: M, tygodnieDrugiego: D, wariantMatki, zaZyciem, bezPrawa, imieMatki, imieDrugiego }: WynikPodzialuProps) {
  const L = wynik.wymiar;
  const N = wynik.nieprzenoszalne;
  const P = wynik.przepadajace;
  const pula = L - 2 * N;
  const procent = (n: number) => (n / L) * 100;
  const w815 = wariantMatki === '81-5';
  const stawkaDopisek = w815 ? `, ${formatujProcent(81.5)}` : '';
  const drugiPonad = Math.max(0, D - N);
  const nazwaWariantu = t.nazwaWariantu[wariantMatki];

  const kafle = [
    { id: 'matka', etykieta: t.kafelMatka, wartosc: tyg(M), klasa: 'bg-brand-chart' },
    { id: 'drugi', etykieta: t.kafelDrugi, wartosc: tyg(D), klasa: 'bg-brand' },
    { id: 'przepada', etykieta: t.kafelPrzepada, wartosc: tyg(P), klasa: 'bg-line-strong' },
  ];

  const wiersze = wynik.wiersze.map((w, i) => {
    const kto = w.rodzic === 'matka' ? t.matkaNaglowek({ imie: imieMatki }) : t.drugiNaglowek({ imie: imieDrugiego });
    const opis =
      w.rodzaj === 'matka'
        ? t.wierszMatkaOpis({ wariant: nazwaWariantu })
        : w.rodzaj === 'bez-prawa'
          ? t.wierszBezPrawa
          : w.rodzaj === 'ponad-nieprzenoszalne'
            ? t.wierszPonad({ tygodnie: tyg(w.tygodnie) })
            : w.tygodnie > N
              ? t.wierszDrugiRazem
              : t.wierszTylkoJego({ tygodnie: tyg(w.tygodnie) });
    const brak = t.brakWartosci;
    return {
      id: `w${i}`,
      rodzic: (
        <>
          <span className="block font-semibold text-ink-strong">{kto}</span>
          {opis}
        </>
      ),
      tygodnie: String(w.tygodnie),
      podstawa: w.podstawa === null ? brak : w.zmiana ? (
        <>
          <span className="block">{t.podstawaPrzedZmiana({ data: formatujDate(dodajDni(w.zmiana.od, -1)) })}{formatujKwote(w.podstawa)}</span>
          <span className="block">{t.podstawaOdZmiany({ data: formatujDate(w.zmiana.od), kwota: formatujKwote(w.zmiana.podstawa) })}</span>
        </>
      ) : formatujKwote(w.podstawa),
      stawka: w.stawka === null ? brak : formatujProcent(w.stawka),
      miesiecznie: w.miesiecznie === null ? brak : w.zmiana ? (
        <>
          <span className="block">{t.podstawaPrzedZmiana({ data: formatujDate(dodajDni(w.zmiana.od, -1)) })}{formatujKwote(w.miesiecznie)}</span>
          <span className="block">{t.podstawaOdZmiany({ data: formatujDate(w.zmiana.od), kwota: formatujKwote(w.zmiana.miesiecznie) })}</span>
        </>
      ) : formatujKwote(w.miesiecznie),
      suma: w.suma === null ? brak : formatujKwote(w.suma),
    };
  });

  const opisPaska = t.pasekOpis({ wymiar: tyg(L), pula: tyg(pula), matka: tyg(M), drugi: tyg(D), przepada: tyg(P) });

  return (
    <>
      <div className="mb-7.5 flex flex-wrap gap-6">
        {kafle.map((k) => (
          <div key={k.id} className="min-w-0 grow basis-40 rounded-md bg-surface-page p-5">
            <p className="m-0 flex items-center gap-2 text-body">
              <span aria-hidden="true" className={`inline-block size-4 rounded-xs ${k.klasa}`} />
              {k.etykieta}
            </p>
            <p className="m-0 mt-1 text-amount text-ink-strong">{k.wartosc}</p>
          </div>
        ))}
        {zaZyciem ? (
          <div className="min-w-0 grow basis-40 rounded-md bg-surface-page p-5">
            <p className="m-0 text-body">{t.kafelRazem}</p>
            <p className="m-0 mt-1 text-amount text-ink-strong">{tyg(M + D)}</p>
          </div>
        ) : null}
      </div>

      <h3 className="m-0 mb-3 text-body-strong">{t.pasekTytul({ wymiar: tyg(L) })}</h3>
      <div role="img" aria-label={opisPaska} className="mb-7.5 flex flex-col gap-3">
        <div className="flex w-full gap-0.5">
          <Segment szerokosc={procent(N)} klasa="">
            <span className="text-small-strong">{t.tylkoMatki}</span>
            <span className="h-2 rounded-xs bg-brand-chart" />
          </Segment>
          <Segment szerokosc={procent(pula)} klasa="">
            <span className="text-small-strong">{t.doPodzialu({ pula: tyg(pula) })}</span>
            <span className="h-2 rounded-xs bg-line" />
          </Segment>
          <Segment szerokosc={procent(N)} klasa="">
            <span className="text-small-strong">{t.tylkoDrugiego}</span>
            <span className="h-2 rounded-xs bg-brand" />
          </Segment>
        </div>
        <div className="flex h-6 w-full gap-0.5">
          <Segment szerokosc={procent(M)} klasa="rounded-l-sm bg-brand-chart" />
          <Segment szerokosc={procent(Math.max(0, L - M - D - P))} klasa="bg-surface-page" />
          <Segment szerokosc={procent(P)} klasa="bg-line-strong" />
          <Segment szerokosc={procent(D)} klasa="rounded-r-sm bg-brand" />
        </div>
        <div className="flex flex-wrap gap-6">
          <span className="text-body">
            <strong>{t.kafelMatka}</strong>
            {t.legendaMatka({ tygodnie: tyg(M), stawka: stawkaDopisek })}
          </span>
          {w815 && !wynik.ponadPoUrodzinach && drugiPonad > 0 ? (
            <>
              <span className="text-body">
                <strong>{t.kafelDrugi}</strong>
                {t.legendaDrugi({ tygodnie: String(drugiPonad), stawka: stawkaDopisek })}
              </span>
              <span className="text-body">
                <strong>{t.kafelDrugi}</strong>
                {t.legendaDrugi({ tygodnie: String(Math.min(D, N)), stawka: `, ${formatujProcent(70)}` })}
              </span>
            </>
          ) : (
            <span className="text-body">
              <strong>{t.kafelDrugi}</strong>
              {t.legendaDrugi({ tygodnie: String(D), stawka: '' })}
            </span>
          )}
          {P > 0 ? (
            <span className="text-body">
              <strong>{t.kafelPrzepada}</strong>
              {t.legendaPrzepada({ tygodnie: P })}
            </span>
          ) : null}
        </div>
      </div>

      <h3 className="m-0 mb-3 text-body-strong">{t.nieprzekazywalneTytul}</h3>
      <ul className="m-0 mb-7.5 flex list-none flex-col gap-2 p-0 text-body">
        <li className="flex items-start gap-2">
          <Ikona nazwa={M >= N ? 'sukces' : 'uwaga'} rozmiar={20} className="mt-0.5 shrink-0 text-brand" />
          <span>{t.matkaWykorzystuje({ uzyte: Math.min(M, N) })}</span>
        </li>
        <li className="flex items-start gap-2">
          <Ikona nazwa={!bezPrawa && D >= N ? 'sukces' : 'uwaga'} rozmiar={20} className="mt-0.5 shrink-0 text-brand" />
          <span>
            {bezPrawa ? <strong>{t.drugiBezPrawa}</strong> : D > N ? t.drugiWykorzystujePula({ pula: tyg(D - N) }) : t.drugiWykorzystuje({ uzyte: Math.min(D, N) })}
          </span>
        </li>
      </ul>

      <Tabela
        podpis={t.tabelaPodpis}
        podpisWidoczny
        etykietaPrzewijania={t.przewijanieTabeli}
        kolumny={[
          { klucz: 'rodzic', naglowek: t.kolumnaRodzic, tytulowa: true },
          { klucz: 'tygodnie', naglowek: t.kolumnaTygodnie, liczbowa: true },
          { klucz: 'podstawa', naglowek: t.kolumnaPodstawa, liczbowa: true },
          { klucz: 'stawka', naglowek: t.kolumnaStawka, liczbowa: true },
          { klucz: 'miesiecznie', naglowek: t.kolumnaMiesiecznie, liczbowa: true },
          { klucz: 'suma', naglowek: t.kolumnaSuma, liczbowa: true },
        ]}
        wiersze={wiersze}
      />
    </>
  );
}
