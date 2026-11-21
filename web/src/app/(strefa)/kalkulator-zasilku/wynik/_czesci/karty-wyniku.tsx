'use client';

// Karty ViewCalcMaternityResult (u15): dane do wyliczenia, okresy urlopów i wypłaty, harmonogram wypłat.
import type { ReactNode } from 'react';
import { formatujDate } from '@/domena/daty';
import type {
  DaneWejscioweKalkulatora,
  OkresScenariusza,
  RodzicWRodzinie,
  WynikScenariusza,
  ZrodloWartosciKalkulatora,
} from '@/domena/typy';
import { formatujKwote, formatujMiesiac, formatujProcent } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';
import { opcjaFormy } from '../../_czesci/formularz';

const t = teksty.ViewCalcMaternityResult;
const ti = teksty.ViewCalcMaternityInput;

function zrodlo(z: ZrodloWartosciKalkulatora) {
  return ti.zrodlo({ zrodlo: ti.zrodla[z] });
}

function takNie(w: boolean) {
  return w ? ti.tak : ti.nie;
}

export function KartaDanych({
  dane,
  etykiety,
  akcja,
}: {
  dane: DaneWejscioweKalkulatora;
  etykiety: Record<RodzicWRodzinie, string>;
  akcja: ReactNode;
}) {
  const e = t.etykietyDanych;
  const pozycje: { etykieta: string; wartosc: string; zrodlo: ZrodloWartosciKalkulatora }[] = [
    { etykieta: e.zdarzenie, wartosc: ti.zdarzenia[dane.zdarzenie.wartosc], zrodlo: dane.zdarzenie.zrodlo },
  ];
  if (dane.dataPorodu)
    pozycje.push({ etykieta: e.dataPorodu, wartosc: formatujDate(dane.dataPorodu.wartosc), zrodlo: dane.dataPorodu.zrodlo });
  if (dane.przewidywanyTerminPorodu)
    pozycje.push({
      etykieta: e.przewidywanyTermin,
      wartosc: formatujDate(dane.przewidywanyTerminPorodu.wartosc),
      zrodlo: dane.przewidywanyTerminPorodu.zrodlo,
    });
  if (dane.przyjecie) {
    const p = dane.przyjecie.wartosc;
    pozycje.push({ etykieta: e.formaPrzyjecia, wartosc: ti.formyPrzyjecia[p.forma], zrodlo: dane.przyjecie.zrodlo });
    pozycje.push({ etykieta: e.dataPrzyjecia, wartosc: formatujDate(p.dataPrzyjecia), zrodlo: dane.przyjecie.zrodlo });
    pozycje.push({ etykieta: e.dataUrodzeniaDziecka, wartosc: formatujDate(p.dataUrodzeniaDziecka), zrodlo: dane.przyjecie.zrodlo });
    if (p.forma === 'rodzina-zastepcza-niezawodowa')
      pozycje.push({ etykieta: e.odroczenie, wartosc: takNie(p.odroczenie), zrodlo: dane.przyjecie.zrodlo });
  }
  pozycje.push({ etykieta: e.liczbaDzieci, wartosc: ti.liczbyDzieci[String(dane.liczbaDzieci.wartosc) as '1'], zrodlo: dane.liczbaDzieci.zrodlo });
  pozycje.push({ etykieta: e.zaZyciem, wartosc: takNie(dane.zaZyciem.wartosc), zrodlo: dane.zaZyciem.zrodlo });
  if (dane.zdarzenie.wartosc === 'porod') {
    const w = dane.wczesniactwo;
    pozycje.push({
      etykieta: e.wczesniactwo,
      wartosc: w
        ? t.wczesniactwoOpis({
            tydzien: String(w.wartosc.tydzienCiazy),
            masa: String(w.wartosc.masaG),
            dni: String(w.wartosc.dniPobytu),
          })
        : ti.nie,
      zrodlo: w?.zrodlo ?? dane.dataPorodu?.zrodlo ?? 'wartosc-domyslna',
    });
    const s = dane.strata;
    pozycje.push({
      etykieta: e.strata,
      wartosc: s
        ? t.strataOpis({
            rodzaj: ti.rodzajeStraty[s.wartosc.rodzaj],
            data: s.wartosc.dataZgonu ? formatujDate(s.wartosc.dataZgonu) : '',
          })
        : ti.nie,
      zrodlo: s?.zrodlo ?? dane.dataPorodu?.zrodlo ?? 'wartosc-domyslna',
    });
  }
  const fm = dane.formaMatki.wartosc;
  pozycje.push({ etykieta: etykiety.matka, wartosc: ti.formy[opcjaFormy(fm.forma, fm.dobrowolne)], zrodlo: dane.formaMatki.zrodlo });
  const fd = dane.formaDrugiegoRodzica.wartosc;
  pozycje.push({
    etykieta: etykiety['drugi-rodzic'],
    wartosc: fd.forma === 'brak-drugiego-rodzica' ? ti.formy['brak-drugiego-rodzica'] : ti.formy[opcjaFormy(fd.forma, fd.dobrowolne)],
    zrodlo: dane.formaDrugiegoRodzica.zrodlo,
  });

  return (
    <Karta tytul={t.kartaDanych} bezLinii akcje={akcja}>
      <dl className="m-0 flex flex-col gap-4">
        {pozycje.map((p) => (
          <div key={p.etykieta} className="flex flex-col gap-0.5 md:flex-row md:gap-6">
            <dt className="text-body-strong md:w-60 md:shrink-0">{p.etykieta}</dt>
            <dd className="m-0 min-w-0 grow">{p.wartosc}</dd>
            <dd className="m-0 text-small md:w-70 md:shrink-0">{zrodlo(p.zrodlo)}</dd>
          </div>
        ))}
      </dl>
    </Karta>
  );
}

const RODZAJE_Z_TYGODNIAMI: readonly OkresScenariusza['rodzaj'][] = [
  'rodzicielski',
  'uzupelniajacy',
  'na-warunkach-macierzynskiego',
  'laczenie-z-praca',
];

export function etykietaOkresu(o: OkresScenariusza): string {
  const rodzaj = t.rodzajeUrlopu[o.rodzaj];
  if (RODZAJE_Z_TYGODNIAMI.includes(o.rodzaj) && o.dni % 7 === 0) {
    return t.zTygodniami({ rodzaj, tygodnie: t.tygodnie({ liczba: o.dni / 7 }) });
  }
  return rodzaj;
}

export function sumaPola(
  wynik: WynikScenariusza,
  rodzic: RodzicWRodzinie,
  pole: 'podwyzszenie' | 'wyrownanie',
): number {
  return wynik.harmonogram.filter((h) => h.rodzic === rodzic).reduce((s, h) => s + h[pole], 0);
}

type KolumnaOkresu = 'rodzaj' | 'od' | 'do' | 'dni' | 'stawka' | 'miesiecznie' | 'zaOkres';

export function TabelaOkresow({
  wynik,
  rodzic,
  etykieta,
}: {
  wynik: WynikScenariusza;
  rodzic: RodzicWRodzinie;
  etykieta: string;
}) {
  const okresy = wynik.okresy.filter((o) => o.rodzic === rodzic);
  const podwyzszenie = sumaPola(wynik, rodzic, 'podwyzszenie');
  const wyrownanie = sumaPola(wynik, rodzic, 'wyrownanie');
  const wiersze: ({ id: string } & Partial<Record<KolumnaOkresu, ReactNode>>)[] = okresy.map((o, i) => ({
    id: `${o.rodzaj}-${o.od}-${i}`,
    rodzaj: etykietaOkresu(o),
    od: formatujDate(o.od),
    do: formatujDate(o.do),
    dni: String(o.dni),
    stawka: formatujProcent(o.stawka),
    miesiecznie: formatujKwote(o.miesiecznie),
    zaOkres: formatujKwote(o.zaOkres),
  }));
  if (podwyzszenie > 0)
    wiersze.push({ id: 'podwyzszenie', rodzaj: t.podwyzszenie, od: t.brak, do: t.brak, dni: t.brak, stawka: t.brak, miesiecznie: t.brak, zaOkres: formatujKwote(podwyzszenie) });
  if (wyrownanie > 0)
    wiersze.push({ id: 'wyrownanie', rodzaj: t.wyrownanie, od: t.brak, do: t.brak, dni: t.brak, stawka: t.brak, miesiecznie: t.brak, zaOkres: formatujKwote(wyrownanie) });
  const k = t.kolumny;
  return (
    <Tabela<KolumnaOkresu>
      podpis={etykieta}
      podpisWidoczny
      etykietaPrzewijania={t.przewijanieOkresow({ rodzic: etykieta })}
      kolumny={[
        { klucz: 'rodzaj', naglowek: k.rodzaj },
        { klucz: 'od', naglowek: k.od },
        { klucz: 'do', naglowek: k.do },
        { klucz: 'dni', naglowek: k.dni, liczbowa: true },
        { klucz: 'stawka', naglowek: k.stawka, liczbowa: true },
        { klucz: 'miesiecznie', naglowek: k.miesiecznie, liczbowa: true },
        { klucz: 'zaOkres', naglowek: k.zaOkres, liczbowa: true },
      ]}
      wiersze={wiersze}
      pustaTresc={t.brakOkresow}
      suma={
        okresy.length > 0
          ? { rodzaj: rodzic === 'matka' ? t.sumaMatki : t.sumaDrugiego, zaOkres: formatujKwote(wynik.sumy[rodzic] ?? 0) }
          : undefined
      }
    />
  );
}

function miesiacWielka(m: string): string {
  const s = formatujMiesiac(m);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function KartaHarmonogramu({
  wynik,
  etykiety,
}: {
  wynik: WynikScenariusza;
  etykiety: Record<RodzicWRodzinie, string>;
}) {
  const miesiace = [...new Set(wynik.harmonogram.map((h) => h.miesiac))].sort();
  const kwota = (m: string, r: RodzicWRodzinie) =>
    wynik.harmonogram.filter((h) => h.miesiac === m && h.rodzic === r).reduce((s, h) => s + h.kwota + h.podwyzszenie, 0);
  const maPodwyzszenie = wynik.harmonogram.some((h) => h.podwyzszenie > 0);
  const wyrownanieMatki = sumaPola(wynik, 'matka', 'wyrownanie');
  const wyrownanieDrugiego = sumaPola(wynik, 'drugi-rodzic', 'wyrownanie');
  const pokaz = (g: number) => (g > 0 ? formatujKwote(g) : t.brak);
  const wiersze: ({ id: string } & Partial<Record<'miesiac' | 'matka' | 'drugi' | 'razem', ReactNode>>)[] = miesiace.map((m) => {
    const a = kwota(m, 'matka');
    const b = kwota(m, 'drugi-rodzic');
    return { id: m, miesiac: miesiacWielka(m), matka: pokaz(a), drugi: pokaz(b), razem: pokaz(a + b) };
  });
  if (wyrownanieMatki + wyrownanieDrugiego > 0)
    wiersze.push({
      id: 'wyrownanie',
      miesiac: t.wyrownanieWiersz,
      matka: pokaz(wyrownanieMatki),
      drugi: pokaz(wyrownanieDrugiego),
      razem: pokaz(wyrownanieMatki + wyrownanieDrugiego),
    });
  if (miesiace.length === 0) return null;
  return (
    <Karta tytul={t.kartaHarmonogramu} bezLinii>
      <p className="m-0 mb-6 text-body">{maPodwyzszenie ? t.harmonogramOpisPodwyzszenie : t.harmonogramOpis}</p>
      <Tabela<'miesiac' | 'matka' | 'drugi' | 'razem'>
        podpis={t.harmonogramPodpis}
        etykietaPrzewijania={t.harmonogramPrzewijanie}
        kolumny={[
          { klucz: 'miesiac', naglowek: t.miesiac, tytulowa: true },
          { klucz: 'matka', naglowek: etykiety.matka, liczbowa: true },
          { klucz: 'drugi', naglowek: etykiety['drugi-rodzic'], liczbowa: true },
          { klucz: 'razem', naglowek: t.razem, liczbowa: true },
        ]}
        wiersze={wiersze}
        suma={{
          miesiac: t.suma,
          matka: pokaz(wynik.sumy.matka ?? 0),
          drugi: pokaz(wynik.sumy['drugi-rodzic'] ?? 0),
          razem: pokaz(wynik.sumy.razem),
        }}
      />
    </Karta>
  );
}
