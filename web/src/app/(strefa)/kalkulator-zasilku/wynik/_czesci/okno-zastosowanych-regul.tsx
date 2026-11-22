'use client';

// ModalCalcAppliedRules (kontrakt, tabela 2.3): okno modalne na ViewCalcMaternityResult. Właściciel: u15.
// Reguły ze słowników katalogu, które wpłynęły na wynik: nazwa, słownik, wartość i data początku obowiązywania.
import { formatujDate } from '@/domena/daty';
import { formatujKwote, formatujLiczbe, formatujProcent } from '@/komponenty/format';
import type { DataISO, JednostkaWariantu, Katalog, WpisSlownika, WynikScenariusza } from '@/domena/typy';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';

const t = teksty.ModalCalcAppliedRules;

export interface OknoZastosowanychRegulProps {
  otwarte: boolean;
  onZamknij: () => void;
  reguly?: WynikScenariusza['zastosowaneReguly'];
  katalog?: Katalog;
  zdarzenie?: 'porod' | 'przewidywany-porod' | 'przyjecie';
  dataZdarzenia?: DataISO | null;
}

/** Jednostka wspólna dla wszystkich wariantów wpisu; undefined, gdy warianty mają różne jednostki. */
function jednostkaWpisu(wpis: WpisSlownika | undefined): JednostkaWariantu | undefined {
  const jednostka = wpis?.warianty[0]?.jednostka;
  return wpis?.warianty.every((w) => w.jednostka === jednostka) ? jednostka : undefined;
}

function wartoscReguly(
  r: WynikScenariusza['zastosowaneReguly'][number],
  katalog: Katalog | undefined,
): { wartosc: string; slownik?: string } {
  const wpis = r.idWpisu ? katalog?.slowniki.find((w) => w.id === r.idWpisu) : undefined;
  const slownik = wpis ? t.slowniki[wpis.slownik] : undefined;
  if (r.wartosc === undefined) return { wartosc: teksty.ViewCalcMaternityResult.brak, slownik };
  const jednostka = r.jednostka ?? jednostkaWpisu(wpis);
  if (jednostka === 'zl') return { wartosc: formatujKwote(r.wartosc), slownik };
  if (jednostka === 'procent') return { wartosc: formatujProcent(r.wartosc), slownik };
  if (jednostka) return { wartosc: `${formatujLiczbe(r.wartosc)} ${t.jednostki[jednostka]}`, slownik };
  return { wartosc: formatujLiczbe(r.wartosc), slownik };
}

export function OknoZastosowanychRegul({
  otwarte,
  onZamknij,
  reguly = [],
  katalog,
  zdarzenie,
  dataZdarzenia,
}: OknoZastosowanychRegulProps) {
  const wiersze = reguly.map((r, i) => {
    const { wartosc, slownik } = wartoscReguly(r, katalog);
    return {
      id: `${i}-${r.opis}`,
      regula: (
        <span className="flex flex-col">
          <span>{r.opis}</span>
          {slownik ? <span className="text-small text-ink-muted">{slownik}</span> : null}
        </span>
      ),
      wartosc,
      od: r.od ? formatujDate(r.od) : teksty.ViewCalcMaternityResult.brak,
    };
  });
  return (
    <OknoModalne
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={t.tytul}
      opis={
        zdarzenie && dataZdarzenia
          ? t.opis({ zdarzenie: t.zdarzenia[zdarzenie], data: formatujDate(dataZdarzenia) })
          : undefined
      }
      stopka={
        <div className="flex justify-end">
          <Przycisk type="button" wariant="drugorzedny" onClick={onZamknij}>
            {t.zamknij}
          </Przycisk>
        </div>
      }
    >
      <Tabela<'regula' | 'wartosc' | 'od'>
        podpis={t.podpis}
        etykietaPrzewijania={t.przewijanie}
        kolumny={[
          { klucz: 'regula', naglowek: t.kolumny.regula },
          { klucz: 'wartosc', naglowek: t.kolumny.wartosc },
          { klucz: 'od', naglowek: t.kolumny.od },
        ]}
        wiersze={wiersze}
        pustaTresc={t.brakRegul}
      />
    </OknoModalne>
  );
}
