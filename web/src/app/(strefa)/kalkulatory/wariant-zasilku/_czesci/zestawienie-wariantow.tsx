'use client';

import type { CSSProperties } from 'react';
import { Tabela } from '@/komponenty/tabela';
import { formatujDate } from '@/domena/daty';
import { formatujKwote, formatujProcent } from '@/domena/kwoty';
import type { SzczegolyPorownania } from '@/domena/kalkulatory/wariant';
import { teksty } from '@/teksty';

const t = teksty.ViewCalcMaternityVariant;

function okresDni(o: { od: string; do: string }, dni: number): string {
  return t.okresDni({ okres: t.okres({ od: formatujDate(o.od), do: formatujDate(o.do) }), dni: t.dni(dni) });
}

function Opis({ tytul, opis }: { tytul: string; opis: string }) {
  return (
    <>
      <span className="block font-semibold text-ink-strong">{tytul}</span>
      {opis}
    </>
  );
}

function Pasek({ kolor, procent, etykieta, kwota }: { kolor: 'jasny' | 'ciemny'; procent: number; etykieta: string; kwota: number }) {
  const styl = { '--szerokosc-paska': `${procent.toFixed(2)}%` } as CSSProperties;
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        style={styl}
        className={`h-6 shrink-0 grow-0 basis-(--szerokosc-paska) rounded-r-sm ${kolor === 'jasny' ? 'bg-brand-chart' : 'bg-brand'}`}
      />
      <span className="text-body whitespace-nowrap">
        {etykieta}
        <strong className="text-ink-strong">{formatujKwote(kwota)}</strong>
      </span>
    </div>
  );
}

/** Wykres miesięcznych wypłat (pełny urlop) i tabela „Zestawienie wypłat po okresach”. */
export function ZestawienieWariantow({ s, dataPowrotu }: { s: SzczegolyPorownania; dataPowrotu: string }) {
  const [m81, r81] = s.wariant81.okresy;
  const [m100, r70] = s.wariant100i70.okresy;
  // Stawki z odpowiedzi silnika, czyli z katalogu w dniu zdarzenia.
  const st = { s815: formatujProcent(m81.stawka), s100: formatujProcent(m100.stawka), s70: formatujProcent(r70.stawka) };
  const pelny = s.tygodnieRodzicielskiego === s.tygodnieRodzicielskiegoMaks;
  const zero = s.tygodnieRodzicielskiego === 0;
  const tylko100 = !s.wariant81Dostepny;
  const skala = (Math.ceil(Math.max(m81.miesiecznie, m100.miesiecznie) / 100000) + 1) * 100000;
  const procent = (kwota: number) => (kwota / skala) * 100;

  const podpis = zero
    ? t.zestawienieZero({ data: formatujDate(dataPowrotu) })
    : pelny
      ? t.zestawienie
      : t.zestawieniePowrot({ data: formatujDate(dataPowrotu) });

  const wiersze = [
    {
      id: 'macierzynski',
      okres: <Opis tytul={t.urlopMacierzynski} opis={okresDni(m81.okres!, m81.dni)} />,
      m81: formatujKwote(m81.miesiecznie),
      s81: formatujKwote(m81.suma),
      m100: formatujKwote(m100.miesiecznie),
      s100: formatujKwote(m100.suma),
      stawka: formatujProcent(m100.stawka),
    },
  ];
  if (!zero && r81.okres && r70.okres) {
    wiersze.push({
      id: 'rodzicielski',
      okres: <Opis tytul={t.urlopRodzicielski} opis={okresDni(r81.okres, r81.dni)} />,
      m81: formatujKwote(r81.miesiecznie),
      s81: formatujKwote(r81.suma),
      m100: formatujKwote(r70.miesiecznie),
      s100: formatujKwote(r70.suma),
      stawka: formatujProcent(r70.stawka),
    });
  }
  if (zero && !tylko100) {
    wiersze.push({
      id: 'wyrownanie',
      okres: <Opis tytul={t.wyrownanieWiersz(st)} opis={t.wyrownanieWierszOpis} />,
      m81: t.brakWartosci,
      s81: formatujKwote(s.wariant81.wyrownanie),
      m100: t.brakWartosci,
      s100: t.brakWartosci,
      stawka: t.brakWartosci,
    });
  }
  const razem = <Opis tytul={t.razem} opis={okresDni(s.okresCaly, s.dniRazem)} />;
  const sumaWiersz = tylko100
    ? { okres: razem, stawka: t.brakWartosci, m100: t.brakWartosci, s100: <strong>{formatujKwote(s.wariant100i70.suma)}</strong> }
    : {
        okres: razem,
        m81: t.brakWartosci,
        s81: <strong>{formatujKwote(s.wariant81.suma)}</strong>,
        m100: t.brakWartosci,
        s100: <strong>{formatujKwote(s.wariant100i70.suma)}</strong>,
      };

  return (
    <>
      {pelny && !tylko100 ? (
        <figure className="m-0 mb-7.5 max-w-220">
          <figcaption className="mb-3 text-body-strong">{t.wykresPodpis}</figcaption>
          <div className="mb-6 flex flex-wrap gap-6">
            <span className="inline-flex items-center gap-2 text-body">
              <span aria-hidden="true" className="inline-block size-4 rounded-xs bg-brand-chart" />
              {t.wariant81(st)}
            </span>
            <span className="inline-flex items-center gap-2 text-body">
              <span aria-hidden="true" className="inline-block size-4 rounded-xs bg-brand" />
              {t.wariant100(st)}
            </span>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <p className="m-0 mb-2 text-body-strong">{t.wykresMacierzynski({ tygodnie: t.tygodnie(s.tygodnieMacierzynskiego) })}</p>
              <div className="flex flex-col gap-2 border-l border-ink py-1">
                <Pasek kolor="jasny" procent={procent(m81.miesiecznie)} etykieta={t.stawka81(st)} kwota={m81.miesiecznie} />
                <Pasek kolor="ciemny" procent={procent(m100.miesiecznie)} etykieta={t.stawka100(st)} kwota={m100.miesiecznie} />
              </div>
            </div>
            <div>
              <p className="m-0 mb-2 text-body-strong">{t.wykresRodzicielski({ tygodnie: t.tygodnie(s.tygodnieRodzicielskiego) })}</p>
              <div className="flex flex-col gap-2 border-l border-ink py-1">
                <Pasek kolor="jasny" procent={procent(r81.miesiecznie)} etykieta={t.stawka81(st)} kwota={r81.miesiecznie} />
                <Pasek kolor="ciemny" procent={procent(r70.miesiecznie)} etykieta={t.stawka70(st)} kwota={r70.miesiecznie} />
              </div>
            </div>
          </div>
        </figure>
      ) : null}
      {tylko100 ? (
        <Tabela
          podpis={podpis}
          podpisWidoczny
          etykietaPrzewijania={t.przewijanieTabeli}
          kolumny={[
            { klucz: 'okres', naglowek: t.kolumnaOkres, tytulowa: true },
            { klucz: 'stawka', naglowek: t.kolumnaStawka, liczbowa: true },
            { klucz: 'm100', naglowek: t.kolumnaMiesiecznie, liczbowa: true },
            { klucz: 's100', naglowek: t.kolumnaSuma, liczbowa: true },
          ]}
          wiersze={wiersze}
          suma={sumaWiersz}
        />
      ) : (
        <Tabela
          podpis={podpis}
          podpisWidoczny
          etykietaPrzewijania={t.przewijanieTabeli}
          kolumny={[
            { klucz: 'okres', naglowek: t.kolumnaOkres, tytulowa: true },
            { klucz: 'm81', naglowek: t.kolumna81Miesiecznie(st), liczbowa: true },
            { klucz: 's81', naglowek: t.kolumna81Suma(st), liczbowa: true },
            { klucz: 'm100', naglowek: t.kolumna100Miesiecznie(st), liczbowa: true },
            { klucz: 's100', naglowek: t.kolumna100Suma(st), liczbowa: true },
          ]}
          wiersze={wiersze}
          suma={sumaWiersz}
        />
      )}
    </>
  );
}
