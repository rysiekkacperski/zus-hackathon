// Scenariusze kalkulatora zasiłku macierzyńskiego (kontrakt, sekcja 6.5; historyjka 3.10.4.5.1).
// Właściciel: u20 (Kalkulator: urlopy obojga rodziców, łączenie z pracą, powrót, scenariusze).
// Rodzic i Drugi rodzic zapisują scenariusz w Wynikach kalkulacji rodziny i jako wybrany wariant spraw w planie (0100),
// Nowy użytkownik w Wynikach kalkulacji konta (0101), scenariusz przykładowej sprawy bez zmiany planu (0171).
// Gość (tryb gościa) zapisuje scenariusz w wynikach kalkulacji gościa (0101 albo 0171); logowanie przenosi ostatni
// scenariusz gościa do konta. Pozostałe operacje wymagają konta.
import { maxData } from '@/domena/daty';
import type {
  DaneRodziny,
  DaneWejscioweKalkulatora,
  IdPozycji,
  IdSprawy,
  IdWniosku,
  KodKomunikatu,
  KontekstOperacji,
  KontoPrzewodnika,
  Okres,
  OkresScenariusza,
  OkresWniosku,
  RodzicWRodzinie,
  ScenariuszKalkulatora,
  StanKonta,
  StanRodziny,
  WniosekZam,
  WybranyWariant,
  WynikiKalkulacji,
  WynikOperacji,
} from '@/domena/typy';
import { zapiszWybranyWariant } from '@/dane/magazyn/operacje/plan';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { rozpocznijLubWznowWniosekOUrlop } from '@/dane/magazyn/operacje/wnioski-urlop';
import { rozpocznijLubWznowZam, zapiszKrokZam } from '@/dane/magazyn/operacje/wnioski-zam';
import {
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanKonta,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';
import {
  czyGosc,
  odczytajWynikiKalkulacjiKonta,
  zapewnijWlasciciela,
  zmienWynikiKalkulacjiKonta,
} from '@/dane/magazyn/wlasciciel';

/** Scenariusz przed nadaniem numeru, daty zapisu i konta. */
export type NowyScenariuszKalkulatora = Omit<ScenariuszKalkulatora, 'numer' | 'zapisano' | 'konto' | 'wybranyWPlanie'>;

/** Wynik zapisu: numer scenariusza i komunikat do pokazania na wyniku. */
export interface WynikZapisuScenariusza {
  numer: number;
  kod: Extract<KodKomunikatu, '0100' | '0101' | '0171'>;
}

const RODZAJE_MACIERZYNSKIEGO: readonly OkresScenariusza['rodzaj'][] = [
  'macierzynski',
  'czesc-przed-porodem',
  'uzupelniajacy',
  'na-warunkach-macierzynskiego',
];

interface KontekstZapisu {
  stanKonta: StanKonta;
  rodzina: StanRodziny | null;
}

function kontekstZapisu(): KontekstZapisu | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const { stanKonta } = zalogowany;
  const rola = stanKonta.konto.rola;
  const rodzina = rola === 'rodzic' || rola === 'drugi-rodzic' ? rodzinaKonta(stanKonta.konto) : null;
  return { stanKonta, rodzina };
}

function dopiszScenariusz(wyniki: WynikiKalkulacji, s: ScenariuszKalkulatora): WynikiKalkulacji {
  return {
    ...wyniki,
    scenariusze: [...wyniki.scenariusze, s],
    nastepnyNumer: Math.max(wyniki.nastepnyNumer, s.numer + 1),
  };
}

function nastepnyNumer(wyniki: WynikiKalkulacji): number {
  const najwiekszy = wyniki.scenariusze.reduce((m, s) => Math.max(m, s.numer), 0);
  return Math.max(wyniki.nastepnyNumer, najwiekszy + 1, 1);
}

function okresy(s: ScenariuszKalkulatora, rodzic: RodzicWRodzinie, rodzaje: readonly OkresScenariusza['rodzaj'][]): Okres[] {
  return s.wynik.okresy
    .filter((o) => o.rodzic === rodzic && rodzaje.includes(o.rodzaj))
    .map((o) => ({ od: o.od, do: o.do }))
    .sort((a, b) => (a.od < b.od ? -1 : a.od > b.od ? 1 : 0));
}

function zakres(o: Okres[]): Okres | undefined {
  if (o.length === 0) return undefined;
  return { od: o[0].od, do: maxData(...o.map((x) => x.do)) };
}

/** Wybrane warianty spraw planu ze scenariusza (pozycje K07, K08, K09, K10, K11, K31, K32, K37 będące w planie). */
export function wariantyZeScenariusza(
  s: ScenariuszKalkulatora,
  sprawyWPlanie: ReadonlySet<IdPozycji>,
  zapisal: string,
  dzis: string,
): WybranyWariant[] {
  const warianty: WybranyWariant[] = [];
  const przyjecie = s.daneWejsciowe.zdarzenie.wartosc === 'przyjecie';
  const okresMacierzynski = zakres(okresy(s, 'matka', RODZAJE_MACIERZYNSKIEGO));
  const okresyRodzicielskie = okresy(s, 'matka', ['rodzicielski', 'laczenie-z-praca', 'wydluzenie-rodzicielskiego']);
  const kandydaci: ('K07' | 'K08' | 'K31' | 'K32')[] = przyjecie ? ['K31', 'K32'] : ['K07', 'K08'];
  for (const sprawa of kandydaci) {
    if (!sprawyWPlanie.has(sprawa)) continue;
    warianty.push({
      sprawa,
      wariant: s.parametry.wariant,
      ...(okresMacierzynski ? { okresMacierzynski } : {}),
      ...(okresyRodzicielskie.length > 0 ? { okresyRodzicielskie } : {}),
      zapisano: dzis,
      zrodlo: 'kalkulator-zintegrowany',
      numerScenariusza: s.numer,
    });
  }
  const ojcowskie = okresy(s, 'drugi-rodzic', ['ojcowski']);
  if (sprawyWPlanie.has('K09') && ojcowskie.length > 0) {
    warianty.push({ sprawa: 'K09', okresyOjcowskiego: ojcowskie, zapisano: dzis, numerScenariusza: s.numer });
  }
  const czesci = s.parametry.czesciRodzicielskiego;
  const czesciDrugiego = czesci.filter((c) => c.rodzic === 'drugi-rodzic').sort((a, b) => (a.od < b.od ? -1 : 1));
  if (sprawyWPlanie.has('K10')) {
    warianty.push({
      sprawa: 'K10',
      tygodnieMatki: czesci.filter((c) => c.rodzic === 'matka').reduce((x, c) => x + c.tygodnie, 0),
      tygodnieDrugiegoRodzica: czesciDrugiego.reduce((x, c) => x + c.tygodnie, 0),
      ...(czesciDrugiego[0] ? { dataPoczatku: czesciDrugiego[0].od } : {}),
      zapisal,
      zapisano: dzis,
    });
  }
  const uzupelniajacy = s.wynik.okresy.filter((o) => o.rodzaj === 'uzupelniajacy');
  if (sprawyWPlanie.has('K11') && uzupelniajacy.length > 0) {
    const dni = uzupelniajacy.reduce((x, o) => x + o.dni, 0);
    warianty.push({ sprawa: 'K11', wymiarTygodni: Math.ceil(dni / 7), zapisano: dzis });
  }
  const laczenie = s.wynik.okresy.filter((o) => o.rodzaj === 'laczenie-z-praca');
  const okresLaczenia = zakres(laczenie.map((o) => ({ od: o.od, do: o.do })));
  if (sprawyWPlanie.has('K37') && s.parametry.laczenie && okresLaczenia) {
    warianty.push({ sprawa: 'K37', okres: okresLaczenia, wymiarPracy: s.parametry.laczenie.wymiarPracy, zapisano: dzis });
  }
  return warianty;
}

function sprawyPlanu(rodzina: StanRodziny): Set<IdPozycji> {
  return new Set(
    (rodzina.plan?.pozycje ?? []).map((p) => p.idPozycji).filter((id): id is IdPozycji => id !== null),
  );
}

/** Zapis wybranego wariantu spraw planu przez operację Planu rodzica i znacznik „wybrany w planie”. */
function zapiszWPlanie(
  rodzina: StanRodziny,
  s: ScenariuszKalkulatora,
  pesel: string,
  ctx: KontekstOperacji,
): WynikOperacji {
  for (const wariant of wariantyZeScenariusza(s, sprawyPlanu(rodzina), pesel, ctx.dzis)) {
    const wynik = zapiszWybranyWariant(wariant, ctx);
    if (!wynik.ok) return wynik;
  }
  const zmieniona = zmienStanRodziny(rodzina.idRodziny, (stan) => ({
    ...stan,
    wynikiKalkulacji: {
      ...stan.wynikiKalkulacji,
      scenariusze: stan.wynikiKalkulacji.scenariusze.map((x) => ({ ...x, wybranyWPlanie: x.numer === s.numer })),
    },
  }));
  if (zmieniona === null) return { ok: false, kod: '0003' };
  return przeliczRodzine(rodzina.idRodziny, ctx);
}

export function zapiszScenariusz(
  scenariusz: NowyScenariuszKalkulatora,
  ctx: KontekstOperacji,
): WynikOperacji<WynikZapisuScenariusza> {
  return wykonajOperacjeZWynikiem<WynikZapisuScenariusza>(() => {
    const k = kontekstZapisu();
    if (k === null) return czyGosc() ? zapiszScenariuszGoscia(scenariusz, ctx) : { ok: false, kod: '0003' };
    const pesel = k.stanKonta.konto.pesel;
    if (k.rodzina !== null) {
      const numer = nastepnyNumer(k.rodzina.wynikiKalkulacji);
      const zapisany: ScenariuszKalkulatora = {
        ...scenariusz,
        zakres: 'rodzina',
        numer,
        zapisano: ctx.dzis,
        konto: pesel,
        wybranyWPlanie: false,
      };
      const rodzina = zmienStanRodziny(k.rodzina.idRodziny, (stan) => ({
        ...stan,
        wynikiKalkulacji: dopiszScenariusz(stan.wynikiKalkulacji, zapisany),
      }));
      if (rodzina === null) return { ok: false, kod: '0003' };
      if (scenariusz.przykladowaSprawa) {
        const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
        if (!przeliczenie.ok) return przeliczenie;
        return { ok: true, wartosc: { numer, kod: '0171' } };
      }
      const wPlanie = zapiszWPlanie(rodzina, zapisany, pesel, ctx);
      if (!wPlanie.ok) return wPlanie;
      return { ok: true, wartosc: { numer, kod: '0100' } };
    }
    const numer = nastepnyNumer(k.stanKonta.wynikiKalkulacji);
    const zapisany: ScenariuszKalkulatora = {
      ...scenariusz,
      zakres: 'konto',
      numer,
      zapisano: ctx.dzis,
      konto: pesel,
      wybranyWPlanie: false,
    };
    const konto = zmienStanKonta(pesel, (stan) => ({
      ...stan,
      wynikiKalkulacji: dopiszScenariusz(stan.wynikiKalkulacji, zapisany),
    }));
    if (konto === null) return { ok: false, kod: '0003' };
    return { ok: true, wartosc: { numer, kod: scenariusz.przykladowaSprawa ? '0171' : '0101' } };
  });
}

/** Scenariusz gościa w wynikach kalkulacji gościa; gość bez sesji gościa dostaje nową sesję. */
function zapiszScenariuszGoscia(
  scenariusz: NowyScenariuszKalkulatora,
  ctx: KontekstOperacji,
): WynikOperacji<WynikZapisuScenariusza> {
  const wlasciciel = zapewnijWlasciciela(ctx);
  const wyniki = odczytajWynikiKalkulacjiKonta(wlasciciel);
  if (wyniki === null) return { ok: false, kod: '0003' };
  const numer = nastepnyNumer(wyniki);
  const zapisany: ScenariuszKalkulatora = {
    ...scenariusz,
    zakres: 'konto',
    numer,
    zapisano: ctx.dzis,
    konto: wlasciciel.id,
    wybranyWPlanie: false,
  };
  if (zmienWynikiKalkulacjiKonta(wlasciciel, (x) => dopiszScenariusz(x, zapisany)) === null) {
    return { ok: false, kod: '0003' };
  }
  return { ok: true, wartosc: { numer, kod: scenariusz.przykladowaSprawa ? '0171' : '0101' } };
}

/** Wybór scenariusza w planie rodziny (wybrany wariant spraw przez zapiszWybranyWariant). */
export function zapiszScenariuszWPlanie(numer: number, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstZapisu();
    if (k === null) return { ok: false, kod: '0003' };
    if (k.rodzina === null) return { ok: false, kod: '0101' };
    const s = k.rodzina.wynikiKalkulacji.scenariusze.find((x) => x.numer === numer);
    if (s === undefined) return { ok: false, kod: '0003' };
    if (s.przykladowaSprawa) return { ok: false, kod: '0171' };
    return zapiszWPlanie(k.rodzina, s, k.stanKonta.konto.pesel, ctx);
  });
}

function znajdzScenariusz(k: KontekstZapisu, numer: number): ScenariuszKalkulatora | undefined {
  const wyniki = k.rodzina?.wynikiKalkulacji ?? k.stanKonta.wynikiKalkulacji;
  return wyniki.scenariusze.find((x) => x.numer === numer);
}

/** Rodzic scenariusza, któremu przysługuje wniosek ZAM (umowa zlecenia albo JDG z dobrowolnym ubezpieczeniem). */
export function rodzicWnioskuZam(d: DaneWejscioweKalkulatora, rodzicKonta: RodzicWRodzinie | null): RodzicWRodzinie | null {
  const matka = d.formaMatki.wartosc;
  const drugi = d.formaDrugiegoRodzica.wartosc;
  const zZam = (forma: string, dobrowolne: boolean) => (forma === 'umowa-zlecenia' || forma === 'jdg') && dobrowolne;
  const uprawnieni: RodzicWRodzinie[] = [];
  if (zZam(matka.forma, matka.dobrowolne)) uprawnieni.push('matka');
  if (zZam(drugi.forma, drugi.dobrowolne)) uprawnieni.push('drugi-rodzic');
  if (rodzicKonta !== null && uprawnieni.includes(rodzicKonta)) return rodzicKonta;
  return uprawnieni[0] ?? null;
}

/** Rodzic scenariusza na umowie o pracę, który składa wniosek o urlop do pracodawcy. */
export function rodzicWnioskuOUrlop(d: DaneWejscioweKalkulatora, rodzicKonta: RodzicWRodzinie | null): RodzicWRodzinie | null {
  const uprawnieni: RodzicWRodzinie[] = [];
  if (d.formaMatki.wartosc.forma === 'umowa-o-prace') uprawnieni.push('matka');
  if (d.formaDrugiegoRodzica.wartosc.forma === 'umowa-o-prace') uprawnieni.push('drugi-rodzic');
  if (rodzicKonta !== null && uprawnieni.includes(rodzicKonta)) return rodzicKonta;
  return uprawnieni[0] ?? null;
}

/** Kim w rodzinie jest konto: konto zakładające ma rolę z Danych rodziny, dołączone przeciwną; bez rodziny decyduje płeć. */
export function rodzicKontaWRodzinie(konto: Pick<KontoPrzewodnika, 'pesel' | 'plec'>, daneRodziny: DaneRodziny | null): RodzicWRodzinie {
  if (daneRodziny === null) return konto.plec === 'kobieta' ? 'matka' : 'drugi-rodzic';
  if (daneRodziny.idRodziny === konto.pesel) return daneRodziny.rodzicKonta;
  return daneRodziny.rodzicKonta === 'matka' ? 'drugi-rodzic' : 'matka';
}

function rodzicKonta(k: KontekstZapisu): RodzicWRodzinie {
  return rodzicKontaWRodzinie(k.stanKonta.konto, k.rodzina?.daneRodziny ?? null);
}

function okresyWniosku(s: ScenariuszKalkulatora, rodzic: RodzicWRodzinie): OkresWniosku[] {
  return s.wynik.okresy
    .filter((o) => o.rodzic === rodzic)
    .map((o) => ({
      rodzajUrlopu: o.rodzaj === 'wydluzenie-rodzicielskiego' ? 'rodzicielski' : o.rodzaj,
      od: o.od,
      do: o.do,
      dni: o.dni,
      stawka: o.stawka,
      rodzic,
    }));
}

/** Przeniesienie okresów scenariusza do wniosku ZAM. */
export function przeniesDoZam(numer: number, ctx: KontekstOperacji): WynikOperacji<{ idWniosku: IdWniosku }> {
  return wykonajOperacjeZWynikiem<{ idWniosku: IdWniosku }>(() => {
    const k = kontekstZapisu();
    if (k === null) return { ok: false, kod: '0003' };
    if (k.rodzina === null) return { ok: false, kod: '0101' };
    const s = znajdzScenariusz(k, numer);
    if (s === undefined) return { ok: false, kod: '0003' };
    const daneCiazy = k.rodzina.daneCiazy;
    const przyjecie = s.daneWejsciowe.zdarzenie.wartosc === 'przyjecie';
    const potwierdzone = przyjecie ? daneCiazy?.przyjecie !== undefined : daneCiazy?.dataPoroduPotwierdzona === true;
    if (!potwierdzone) return { ok: false, kod: '0037' };
    const rodzic = rodzicWnioskuZam(s.daneWejsciowe, rodzicKonta(k));
    if (rodzic === null) return { ok: false, kod: '0064' };
    const idSprawy: IdSprawy = przyjecie ? 'K32' : 'K08';
    const szkic = rozpocznijLubWznowZam(rodzic === 'matka' ? idSprawy : `${idSprawy}-drugi-rodzic`, ctx);
    if (!szkic.ok) return szkic;
    const wszystkie = okresyWniosku(s, rodzic);
    const macierzynski = wszystkie.find((o) => o.rodzajUrlopu !== 'rodzicielski' && o.rodzajUrlopu !== 'ojcowski');
    const rodzicielskie = wszystkie.filter((o) => o.rodzajUrlopu === 'rodzicielski');
    const zmiana: Partial<WniosekZam> = {
      ...(macierzynski ? { rodzajUrlopu: macierzynski.rodzajUrlopu } : {}),
      okresy: wszystkie.filter((o) => o.rodzajUrlopu !== 'ojcowski'),
      wariant: s.parametry.wariant === '81-5' ? 'caly-rodzicielski' : 'tylko-macierzynski',
      ...(rodzicielskie[0]
        ? {
            rodzicielski: {
              tryb: 'bezposrednio' as const,
              dataPoczatku: rodzicielskie[0].od,
              tygodnie: s.parametry.czesciRodzicielskiego
                .filter((c) => c.rodzic === rodzic)
                .reduce((x, c) => x + c.tygodnie, 0),
            },
          }
        : {}),
    };
    const zapis = zapiszKrokZam(szkic.wartosc.idWniosku, zmiana, 'ViewZamPeriod', ctx);
    if (!zapis.ok) return zapis;
    return { ok: true, wartosc: { idWniosku: zapis.wartosc.idWniosku } };
  });
}

/** Przeniesienie okresów scenariusza do wniosku o urlop do pracodawcy. */
export function przeniesDoWnioskuOUrlop(numer: number, ctx: KontekstOperacji): WynikOperacji<{ idWniosku: IdWniosku }> {
  return wykonajOperacjeZWynikiem<{ idWniosku: IdWniosku }>(() => {
    const k = kontekstZapisu();
    if (k === null) return { ok: false, kod: '0003' };
    if (k.rodzina === null) return { ok: false, kod: '0101' };
    const s = znajdzScenariusz(k, numer);
    if (s === undefined) return { ok: false, kod: '0003' };
    const rodzic = rodzicWnioskuOUrlop(s.daneWejsciowe, rodzicKonta(k));
    if (rodzic === null) return { ok: false, kod: '0099' };
    const przyjecie = s.daneWejsciowe.zdarzenie.wartosc === 'przyjecie';
    const idSprawy: IdSprawy =
      rodzic === 'matka' ? (przyjecie ? 'K31' : 'K07') : s.parametry.czesciRodzicielskiego.some((c) => c.rodzic === 'drugi-rodzic') ? 'K10' : 'K09';
    const szkic = rozpocznijLubWznowWniosekOUrlop(idSprawy, numer, ctx);
    if (!szkic.ok) return szkic;
    return { ok: true, wartosc: { idWniosku: szkic.wartosc.idWniosku } };
  });
}
