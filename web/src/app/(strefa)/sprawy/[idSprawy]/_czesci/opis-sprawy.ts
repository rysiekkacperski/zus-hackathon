// Treści ViewCaseDetails wyliczane z profilu rodziny i katalogu: spełniony warunek, kanał, dane profilu
// (historyjka 3.6.1.2.1, wzory Sprawa, P06-14, P06-15). Właściciel: u12.
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { czySprawaOplacenia } from '@/domena/plan/straznik';
import type {
  DanaZeZrodla,
  DaneCiazyIDziecka,
  DaneRodziny,
  FormaZatrudnienia,
  KanalPozycji,
  PozycjaKatalogu,
  PozycjaPlanu,
} from '@/domena/typy';
import { teksty } from '@/teksty';
import { nazwaFormy } from '@/app/(strefa)/plan-rodziny/_czesci/sprawy';

const t = teksty.ViewCaseDetails;

const SPRAWY_MATKI_NA_UMOWIE = ['K04', 'K07', 'K20'];
const SPRAWY_DRUGIEGO_RODZICA = ['K09', 'K10'];
const SPRAWY_KAZDEGO_NA_UMOWIE = ['K21', 'K23', 'K30', 'K37'];
const SPRAWY_PO_URODZENIU = ['K06', 'K12', 'K18', 'K36'];
const SPRAWY_FORMY_MATKI = ['K08', 'K19', 'K24'];

function warunekMatki(daneRodziny: DaneRodziny): string | null {
  const forma = daneRodziny.matka.formaZatrudnienia?.wartosc;
  const duch = daneRodziny.matka.dobrowolneChorobowe?.wartosc === true;
  if (forma === 'jdg' && duch) return t.warunki.matkaJdgDuch;
  if (forma === 'umowa-zlecenia' && duch) return t.warunki.matkaUzDuch;
  if (forma === 'umowa-o-prace') return t.warunki.matkaUop;
  if (daneRodziny.matka.zmianaZatrudnienia?.rodzaj.wartosc === 'ustanie') return t.warunki.matkaUstanie;
  return null;
}

function warunekDrugiegoRodzica(daneRodziny: DaneRodziny): string | null {
  const forma = daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc;
  const duch = daneRodziny.drugiRodzic.dobrowolneChorobowe?.wartosc === true;
  if (forma === 'umowa-o-prace') return t.warunki.drUop;
  if (forma === 'umowa-zlecenia' && duch) return t.warunki.drUzDuch;
  if (forma === 'jdg' && duch) return t.warunki.drJdgDuch;
  return null;
}

/** Warunek, który rodzina spełnia, zapisany dla tej rodziny; bez dopasowania warunek z katalogu. */
export function spelnionyWarunek(sprawa: PozycjaPlanu, pozycja: PozycjaKatalogu | null, daneRodziny: DaneRodziny): string {
  const id = sprawa.idPozycji;
  if (czySprawaOplacenia(sprawa.idSprawy)) return t.warunki.matkaJdgDuch;
  if (id && SPRAWY_FORMY_MATKI.includes(id)) return warunekMatki(daneRodziny) ?? pozycja?.warunekOpis ?? '';
  if (id && SPRAWY_MATKI_NA_UMOWIE.includes(id)) return t.warunki.matkaUop;
  if (id && SPRAWY_DRUGIEGO_RODZICA.includes(id)) return warunekDrugiegoRodzica(daneRodziny) ?? pozycja?.warunekOpis ?? '';
  if (id && SPRAWY_KAZDEGO_NA_UMOWIE.includes(id)) {
    if (sprawa.rodzic === 'matka') return t.warunki.matkaUop;
    if (sprawa.rodzic === 'drugi-rodzic') return t.warunki.drUop;
  }
  if (id && SPRAWY_PO_URODZENIU.includes(id)) return t.warunki.urodzone;
  return pozycja?.warunekOpis ?? '';
}

/** Forma zatrudnienia rodzica, którego dotyczy sprawa (dla kanału pozycji katalogu). */
export function formaRodzicaSprawy(sprawa: PozycjaPlanu, daneRodziny: DaneRodziny): FormaZatrudnienia | null {
  const formaDrugiego = daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc;
  if (sprawa.rodzic === 'drugi-rodzic') return formaDrugiego && formaDrugiego !== 'brak-drugiego-rodzica' ? formaDrugiego : null;
  return daneRodziny.matka.formaZatrudnienia?.wartosc ?? null;
}

function tekstKanalu(kanal: KanalPozycji): string {
  switch (kanal.typ) {
    case 'kreator':
      return t.kanaly.kreatory[kanal.idWidoku] ?? t.kanaly.kreator;
    case 'zewnetrzny':
      return t.kanaly.zewnetrzne[kanal.kanal];
    case 'u-pracodawcy':
      return t.kanaly.uPracodawcy;
    case 'informacja':
      return t.kanaly.informacja;
  }
}

export function kanalSprawy(sprawa: PozycjaPlanu, pozycja: PozycjaKatalogu | null, daneRodziny: DaneRodziny): string | null {
  if (czySprawaOplacenia(sprawa.idSprawy)) return t.szczegoly.kanalOplacenia;
  if (!pozycja) return null;
  const forma = formaRodzicaSprawy(sprawa, daneRodziny);
  const kanal = (forma ? pozycja.kanaly[forma] : undefined) ?? pozycja.kanaly.kazda ?? Object.values(pozycja.kanaly)[0];
  return kanal ? tekstKanalu(kanal) : null;
}

export interface WierszDanychProfilu {
  id: string;
  dane: string;
  wartosc: string;
  zrodlo: string;
}

function zrodlo(dana: DanaZeZrodla<unknown> | null | undefined): string {
  return dana ? t.daneProfilu.zrodla[dana.zrodlo] : '';
}

/** Dane profilu rodziny, z których wynika sprawa, ze źródłem. */
export function daneProfiluSprawy(
  sprawa: PozycjaPlanu,
  daneRodziny: DaneRodziny,
  daneCiazy: DaneCiazyIDziecka | null,
): WierszDanychProfilu[] {
  const wiersze: WierszDanychProfilu[] = [];
  const dp = teksty.ViewFamilyPlan.daneProfilu;
  const drugi = sprawa.rodzic === 'drugi-rodzic';
  if (drugi) {
    const forma = daneRodziny.drugiRodzic.formaZatrudnienia;
    if (forma) wiersze.push({ id: 'forma', dane: t.daneProfilu.formaDrugiego, wartosc: nazwaFormy(forma.wartosc), zrodlo: zrodlo(forma) });
    const duch = daneRodziny.drugiRodzic.dobrowolneChorobowe;
    if (duch && (forma?.wartosc === 'jdg' || forma?.wartosc === 'umowa-zlecenia')) {
      wiersze.push({ id: 'duch', dane: t.daneProfilu.duchDrugiego, wartosc: duch.wartosc ? dp.tak : dp.nie, zrodlo: zrodlo(duch) });
    }
  } else {
    const forma = daneRodziny.matka.formaZatrudnienia;
    if (forma) wiersze.push({ id: 'forma', dane: t.daneProfilu.formaMatki, wartosc: nazwaFormy(forma.wartosc), zrodlo: zrodlo(forma) });
    const duch = daneRodziny.matka.dobrowolneChorobowe;
    if (duch && (forma?.wartosc === 'jdg' || forma?.wartosc === 'umowa-zlecenia')) {
      wiersze.push({ id: 'duch', dane: t.daneProfilu.duchMatki, wartosc: duch.wartosc ? dp.tak : dp.nie, zrodlo: zrodlo(duch) });
    }
  }
  if (sprawa.idPozycji === 'K02' && daneRodziny.stanCywilny) {
    wiersze.push({
      id: 'stan-cywilny',
      dane: t.daneProfilu.stanCywilny,
      wartosc: dp.stanyCywilne[daneRodziny.stanCywilny.wartosc],
      zrodlo: zrodlo(daneRodziny.stanCywilny),
    });
  }
  if ((sprawa.idPozycji === 'K14' || sprawa.idPozycji === 'K15') && daneRodziny.dochodNaOsobe) {
    const dochod = daneRodziny.dochodNaOsobe.wartosc;
    wiersze.push({
      id: 'dochod',
      dane: t.daneProfilu.dochod,
      wartosc: dochod === 'nieznany' ? dp.dochodNieznany : formatujKwote(dochod),
      zrodlo: zrodlo(daneRodziny.dochodNaOsobe),
    });
  }
  if (daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu) {
    wiersze.push({
      id: 'data-porodu',
      dane: t.daneProfilu.dataPorodu,
      wartosc: formatujDate(daneCiazy.dataPorodu),
      zrodlo: t.daneProfilu.zrodla[daneCiazy.zrodloDatyPorodu ?? 'odpowiedz-rodzica'],
    });
  } else if (daneCiazy?.przewidywanyTerminPorodu) {
    wiersze.push({
      id: 'ptp',
      dane: t.daneProfilu.ptp,
      wartosc: formatujDate(daneCiazy.przewidywanyTerminPorodu),
      zrodlo: t.daneProfilu.zrodla['odpowiedz-rodzica'],
    });
  }
  return wiersze;
}
