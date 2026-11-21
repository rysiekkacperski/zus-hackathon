// Krok planu `przyjecieDziecka` (kontrakt, sekcja 7.2). Właściciel: u24 (Przyjęcie dziecka na wychowanie).
// Przy danych przyjęcia dziecka krok usuwa sprawy ciąży i porodu (bez złożonych i załatwionych),
// wylicza sprawy K31, K32, K33, K09, K10, K05 i K12–K18 według formy przyjęcia, wieku dziecka
// i ubezpieczenia chorobowego rodziców oraz przyjmuje liczbę dzieci z liczby przyjętych dzieci.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import type { WejsciePlanu } from '@/domena/przeliczenie';
import {
  czyWWiekuUprawniajacym,
  przedUkonczeniemLat,
  przedUkonczeniemMiesiecy,
} from '@/domena/rodzina/przyjecie';
import type {
  DaneRodzica,
  DrugiRodzic,
  Etap,
  FormaZatrudnienia,
  IdPozycji,
  Katalog,
  PozycjaPlanu,
  PrzyjecieDziecka,
  RodzajPozycji,
  RodzicSprawy,
} from '@/domena/typy';

/** Sprawy ciąży i porodu usuwane po przyjęciu dziecka, chyba że są złożone albo załatwione. */
export const SPRAWY_CIAZY_I_PORODU: readonly IdPozycji[] = [
  'K01', 'K02', 'K03', 'K04', 'K06', 'K07', 'K08', 'K11', 'K24', 'K25', 'K26', 'K27', 'K28', 'K29', 'K34',
];

/** Sprawy, których obecność w planie po przyjęciu dziecka rozstrzyga ten krok. */
export const SPRAWY_PO_PRZYJECIU: readonly IdPozycji[] = [
  'K05', 'K09', 'K10', 'K12', 'K14', 'K15', 'K16', 'K17', 'K18', 'K31', 'K32', 'K33',
];

// Rodzaj i etap pozycji, gdy katalog nie ma jeszcze pozycji (tabela 3.5.1.1.1).
const POZYCJE_ZAPASOWE: Record<string, { rodzaj: RodzajPozycji; etap: Etap }> = {
  K05: { rodzaj: 'obowiazek', etap: 'pierwsze-tygodnie' },
  K09: { rodzaj: 'uprawnienie', etap: 'urlopy-i-zasilek' },
  K10: { rodzaj: 'uprawnienie', etap: 'urlopy-i-zasilek' },
  K12: { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko' },
  K14: { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko' },
  K15: { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko' },
  K16: { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko' },
  K17: { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko' },
  K18: { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko' },
  K31: { rodzaj: 'obowiazek', etap: 'urlopy-i-zasilek' },
  K32: { rodzaj: 'swiadczenie', etap: 'urlopy-i-zasilek' },
  K33: { rodzaj: 'informacja', etap: 'urlopy-i-zasilek' },
};

// Progi dochodowe obowiązujące przy uruchomieniu katalogu (grosze), gdy katalog nie ma wpisu.
const PROG_BECIKOWEGO_DOMYSLNY = 192200;
const PROG_ZASILKU_RODZINNEGO_DOMYSLNY = 67400;

type Osoba = Pick<DaneRodzica, 'formaZatrudnienia' | 'dobrowolneChorobowe'> | Pick<DrugiRodzic, 'formaZatrudnienia' | 'dobrowolneChorobowe'>;

function formaOsoby(o: Osoba | undefined): FormaZatrudnienia | null {
  const forma = o?.formaZatrudnienia?.wartosc;
  return forma === undefined || forma === 'brak-drugiego-rodzica' ? null : forma;
}

/** Pracownik albo osoba na umowie zlecenia lub z działalnością z dobrowolnym ubezpieczeniem chorobowym. */
function podlegaChorobowemu(o: Osoba | undefined): boolean {
  const forma = formaOsoby(o);
  if (forma === 'umowa-o-prace') return true;
  if (forma === 'umowa-zlecenia' || forma === 'jdg') return o?.dobrowolneChorobowe?.wartosc === true;
  return false;
}

function maTytul(o: Osoba | undefined): boolean {
  const forma = formaOsoby(o);
  return forma !== null && forma !== 'brak-tytulu';
}

function czyZlozonaAlboZalatwiona(p: PozycjaPlanu | undefined): boolean {
  return p !== undefined && (p.status === 'zlozona' || p.status === 'zalatwiona');
}

// Wartość progu ze słownika kwot i progów odnajdywana po nazwie wpisu; katalog może trzymać złote albo grosze.
function progZKatalogu(katalog: Katalog, wzorzec: RegExp, domyslny: number): number {
  const wpis = katalog.slowniki.find((s) => s.slownik === 'kwoty-i-progi' && wzorzec.test(s.nazwa));
  const wersja = wpis?.wersje[wpis.wersje.length - 1];
  const pierwszy = wpis?.warianty[0];
  const wartosc = wersja && pierwszy ? wersja.wartosci[pierwszy.klucz] : undefined;
  if (typeof wartosc !== 'number' || wartosc <= 0) return domyslny;
  return wartosc < 100000 ? Math.round(wartosc * 100) : wartosc;
}

function dochodWProgu(w: WejsciePlanu, prog: number): boolean {
  const dochod = w.daneRodziny.dochodNaOsobe?.wartosc;
  return dochod === undefined || dochod === 'nieznany' || dochod <= prog;
}

interface Wyliczona {
  id: IdPozycji;
  rodzic: RodzicSprawy;
  zalezyOdDochodu?: boolean;
}

/** Sprawy po przyjęciu dziecka z rodzicem, któremu je przypisujemy. */
export function sprawyPoPrzyjeciu(p: PrzyjecieDziecka, w: WejsciePlanu): Wyliczona[] {
  const rodzina = w.daneRodziny;
  // Rodzic przyjmujący to rodzic konta, które tworzy profil; drugi rodzic to osoba z drugiej sekcji profilu.
  const kontoWDrugimRodzicu = rodzina.rodzicKonta === 'drugi-rodzic';
  const przyjmujacy: Osoba = kontoWDrugimRodzicu ? rodzina.drugiRodzic : rodzina.matka;
  const drugi: Osoba = kontoWDrugimRodzicu ? rodzina.matka : rodzina.drugiRodzic;
  const rodzicDrugiego: RodzicSprawy = kontoWDrugimRodzicu ? 'matka' : 'drugi-rodzic';
  const ojciec = p.rolaRodzicaPrzyjmujacego === 'ojciec' ? przyjmujacy : drugi;
  const rodzicOjca: RodzicSprawy = p.rolaRodzicaPrzyjmujacego === 'ojciec' ? 'rodzic-przyjmujacy' : rodzicDrugiego;

  const przysposobienie = p.forma === 'przysposobienie';
  const niezawodowa = p.forma === 'rodzina-zastepcza-niezawodowa';
  const zawodowa = p.forma === 'rodzina-zastepcza-zawodowa';
  const wWieku = (przysposobienie || niezawodowa) && czyWWiekuUprawniajacym(p, w.katalog);
  const formaPrzyjmujacego = formaOsoby(przyjmujacy);

  const wynik: Wyliczona[] = [];
  const dodaj = (id: IdPozycji, rodzic: RodzicSprawy, zalezyOdDochodu?: boolean) =>
    wynik.push(zalezyOdDochodu ? { id, rodzic, zalezyOdDochodu } : { id, rodzic });

  if (maTytul(przyjmujacy) || maTytul(drugi)) dodaj('K05', 'rodzic-przyjmujacy');
  if (przysposobienie && przedUkonczeniemLat(p, 14) && podlegaChorobowemu(ojciec)) dodaj('K09', rodzicOjca);
  if (wWieku && podlegaChorobowemu(drugi)) dodaj('K10', rodzicDrugiego);
  dodaj('K12', 'rodzic-przyjmujacy');
  if (przysposobienie && dochodWProgu(w, progZKatalogu(w.katalog, /próg becikowego/i, PROG_BECIKOWEGO_DOMYSLNY))) {
    dodaj('K14', 'rodzic-przyjmujacy', true);
  }
  if (
    przysposobienie &&
    przedUkonczeniemLat(p, 1) &&
    dochodWProgu(w, progZKatalogu(w.katalog, /próg zasiłku rodzinnego/i, PROG_ZASILKU_RODZINNEGO_DOMYSLNY))
  ) {
    dodaj('K15', 'rodzic-przyjmujacy', true);
  }
  const k31 = wWieku && formaPrzyjmujacego === 'umowa-o-prace';
  const k32 = wWieku && (formaPrzyjmujacego === 'umowa-zlecenia' || formaPrzyjmujacego === 'jdg') && podlegaChorobowemu(przyjmujacy);
  // Świadczenie rodzicielskie przysługuje, gdy żaden z rodziców nie pobiera zasiłku macierzyńskiego.
  const zasilekMacierzynski = k31 || k32 || (wWieku && podlegaChorobowemu(drugi));
  if (wWieku && !zasilekMacierzynski) dodaj('K16', 'rodzic-przyjmujacy');
  if (przysposobienie && w.daneCiazy?.zaswiadczenieZaZyciem === true) dodaj('K17', 'rodzic-przyjmujacy');
  if (przedUkonczeniemMiesiecy(p, 36) && (przysposobienie || maTytul(przyjmujacy))) dodaj('K18', 'rodzic-przyjmujacy');
  if (k31) dodaj('K31', 'rodzic-przyjmujacy');
  if (k32) dodaj('K32', 'rodzic-przyjmujacy');
  if (zawodowa) dodaj('K33', 'rodzic-przyjmujacy');
  return wynik;
}

function nowaPozycja(id: IdPozycji, w: WejsciePlanu): PozycjaPlanu {
  const zKatalogu = w.katalog.pozycje.find((p) => p.id === id);
  const zapasowa = POZYCJE_ZAPASOWE[id] ?? { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko' };
  return {
    idSprawy: id,
    idPozycji: id,
    rodzaj: zKatalogu?.rodzaj ?? zapasowa.rodzaj,
    etap: zKatalogu?.etap ?? zapasowa.etap,
    rodzic: 'rodzic-przyjmujacy',
    status: 'do-zrobienia',
    zrodloStatusu: 'wyliczenie-planu',
    liczbaDzieci: 1,
    ostrzezenia: [],
    oznaczenia: [],
  };
}

export const przyjecieDziecka: KrokPlanu = (pozycje, w) => {
  const p = w.zgoda ? w.daneCiazy?.przyjecie : undefined;
  if (p === undefined) return pozycje;

  const poprzednie = new Map((w.poprzedniPlan?.pozycje ?? []).map((poz) => [poz.idSprawy, poz]));
  const biezace = new Map(pozycje.map((poz) => [poz.idSprawy, poz]));
  const statusZachowany = (poz: PozycjaPlanu) =>
    czyZlozonaAlboZalatwiona(poz) || czyZlozonaAlboZalatwiona(poprzednie.get(poz.idSprawy));

  // Sprawy ciąży i porodu znikają, a sprawy po przyjęciu liczymy na nowo; złożone i załatwione zostają.
  const pozostale = pozycje.filter((poz) => {
    const id = poz.idPozycji;
    if (id === null) return true;
    if (SPRAWY_CIAZY_I_PORODU.includes(id) || SPRAWY_PO_PRZYJECIU.includes(id)) return statusZachowany(poz);
    return true;
  });
  const obecne = new Set(pozostale.map((poz) => poz.idSprawy));

  // Sprawy ciąży i porodu złożone albo załatwione w poprzednim planie, których nie ma w bieżących pozycjach.
  for (const poz of w.poprzedniPlan?.pozycje ?? []) {
    if (poz.idPozycji !== null && SPRAWY_CIAZY_I_PORODU.includes(poz.idPozycji) && czyZlozonaAlboZalatwiona(poz) && !obecne.has(poz.idSprawy)) {
      pozostale.push(poz);
      obecne.add(poz.idSprawy);
    }
  }

  const liczbaDzieci = p.liczbaPrzyjetychDzieci;
  const dodane: PozycjaPlanu[] = [];
  for (const s of sprawyPoPrzyjeciu(p, w)) {
    if (obecne.has(s.id)) continue;
    const baza = biezace.get(s.id) ?? poprzednie.get(s.id) ?? nowaPozycja(s.id, w);
    const pozycja: PozycjaPlanu = { ...baza, idSprawy: s.id, idPozycji: s.id, rodzic: s.rodzic, liczbaDzieci };
    if (s.zalezyOdDochodu) pozycja.zalezyOdDochodu = true;
    else delete pozycja.zalezyOdDochodu;
    dodane.push(pozycja);
  }

  const wynik = [...pozostale, ...dodane].map((poz) => {
    if (poz.idPozycji === null || czyZlozonaAlboZalatwiona(poz)) return poz;
    // Pozycje rodzica, który przyjął dziecko, i liczba dzieci z liczby jednocześnie przyjętych dzieci.
    const zmiana: Partial<PozycjaPlanu> = { liczbaDzieci };
    if (poz.idPozycji === 'K13') zmiana.rodzic = 'rodzic-przyjmujacy';
    return { ...poz, ...zmiana };
  });
  return wynik;
};
