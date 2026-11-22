// Odczyt i walidacja profilu rodziny, danych ciąży i dziecka oraz kopii Danych z konta ZUS w REST API.
// Moduł sprawdza strukturę i format pól (0006, 0010) oraz uzupełnia listy, których brak w żądaniu, listą pustą.
// Pola z wartością i źródłem mają postać DanaZeZrodla { wartosc, zrodlo } jak w magazynie przewodnika.
import type {
  DaneCiazyIDziecka,
  DaneDrugiegoRodzicaZKonta,
  DaneRodzica,
  DaneRodziny,
  DaneZKontaZus,
  DrugiRodzic,
  Pesel,
  ZnacznikCzasu,
} from '@/domena/typy';
import { odczytajKontoZus, sprawdzPesel } from '@/serwer/api/konta-zus';
import { FORMY_ZATRUDNIENIA } from '@/serwer/api/wejscia-kalkulatora';
import {
  czyDataISO,
  czyObiekt,
  czytajDate,
  czytajListe,
  czytajObiekt,
  czytajZWyliczenia,
  sciezka,
  type BledyWejscia,
  type Obiekt,
} from '@/serwer/api/walidacja';

const ZRODLA_DANYCH = ['konto-zus', 'pelnomocnictwo-pel', 'odpowiedz-rodzica'] as const;

/** Pole DanaZeZrodla: obiekt z wartością i źródłem; wartość sprawdza `sprawdzWartosc`. */
function sprawdzDana(w: unknown, pole: string, bledy: BledyWejscia, sprawdzWartosc?: (wartosc: unknown) => boolean): void {
  if (w === undefined || w === null) return;
  if (!czyObiekt(w) || !('wartosc' in w)) {
    bledy[pole] = '0006';
    return;
  }
  czytajZWyliczenia(w.zrodlo, ZRODLA_DANYCH, sciezka(pole, 'zrodlo'), bledy);
  if (sprawdzWartosc && !sprawdzWartosc(w.wartosc)) bledy[sciezka(pole, 'wartosc')] = '0006';
}

function czyZListy(dozwolone: readonly string[]): (w: unknown) => boolean {
  return (w) => typeof w === 'string' && dozwolone.includes(w);
}

function rodzic(w: unknown, pole: string, bledy: BledyWejscia, drugi: boolean): Obiekt {
  const o = czytajObiekt(w, pole, bledy) ?? {};
  const formy = drugi ? [...FORMY_ZATRUDNIENIA, 'brak-drugiego-rodzica'] : FORMY_ZATRUDNIENIA;
  sprawdzDana(o.formaZatrudnienia, sciezka(pole, 'formaZatrudnienia'), bledy, czyZListy(formy));
  sprawdzDana(o.dobrowolneChorobowe, sciezka(pole, 'dobrowolneChorobowe'), bledy, (v) => typeof v === 'boolean');
  sprawdzDana(o.platnikZasilku, sciezka(pole, 'platnikZasilku'), bledy, czyZListy(['zus', 'platnik-skladek', 'nieustalony', 'brak-platnika']));
  sprawdzDana(o.dataPoczatkuZatrudnienia, sciezka(pole, 'dataPoczatkuZatrudnienia'), bledy, czyDataISO);
  const zmiana = czytajObiekt(o.zmianaZatrudnienia, sciezka(pole, 'zmianaZatrudnienia'), bledy);
  if (zmiana !== undefined) {
    sprawdzDana(zmiana.rodzaj, sciezka(pole, 'zmianaZatrudnienia', 'rodzaj'), bledy, czyZListy(['bez-zmian', 'rozpoczecie', 'ustanie']));
    sprawdzDana(zmiana.data, sciezka(pole, 'zmianaZatrudnienia', 'data'), bledy, czyDataISO);
  }
  return {
    ...o,
    formaZatrudnienia: o.formaZatrudnienia ?? null,
    dobrowolneChorobowe: o.dobrowolneChorobowe ?? null,
    platnikZasilku: o.platnikZasilku ?? null,
    potwierdzeniaSkladek: czytajListe(o.potwierdzeniaSkladek, sciezka(pole, 'potwierdzeniaSkladek'), bledy),
  };
}

/** Profil rodziny z żądania; brak profilu daje 0006 w polu `pole`. */
export function czytajDaneRodziny(w: unknown, bledy: BledyWejscia, teraz: ZnacznikCzasu, pole = 'daneRodziny'): DaneRodziny | undefined {
  const o = czytajObiekt(w, pole, bledy, { wymagane: true });
  if (o === undefined) return undefined;
  const rodzicKonta = czytajZWyliczenia(o.rodzicKonta ?? 'matka', ['matka', 'drugi-rodzic'] as const, sciezka(pole, 'rodzicKonta'), bledy);
  sprawdzDana(o.sytuacja, sciezka(pole, 'sytuacja'), bledy, czyZListy(['oczekiwanie', 'narodziny', 'przyjecie', 'planowanie']));
  sprawdzDana(o.stanCywilny, sciezka(pole, 'stanCywilny'), bledy, czyZListy(['malzenstwo', 'nie-malzenstwo']));
  sprawdzDana(o.dochodNaOsobe, sciezka(pole, 'dochodNaOsobe'), bledy, (v) => v === 'nieznany' || (typeof v === 'number' && Number.isSafeInteger(v) && v >= 0));
  sprawdzDana(o.gmina, sciezka(pole, 'gmina'), bledy, czyObiekt);
  const matka = rodzic(o.matka, sciezka(pole, 'matka'), bledy, false) as unknown as DaneRodzica;
  const drugiRodzic = rodzic(o.drugiRodzic, sciezka(pole, 'drugiRodzic'), bledy, true) as unknown as DrugiRodzic;
  return {
    ...(o as Partial<DaneRodziny>),
    idRodziny: typeof o.idRodziny === 'string' ? o.idRodziny : '',
    sytuacja: (o.sytuacja ?? null) as DaneRodziny['sytuacja'],
    rodzicKonta: rodzicKonta ?? 'matka',
    matka,
    drugiRodzic,
    stanCywilny: (o.stanCywilny ?? null) as DaneRodziny['stanCywilny'],
    gmina: (o.gmina ?? null) as DaneRodziny['gmina'],
    dochodNaOsobe: (o.dochodNaOsobe ?? null) as DaneRodziny['dochodNaOsobe'],
    dostepKont: czytajListe(o.dostepKont, sciezka(pole, 'dostepKont'), bledy) as DaneRodziny['dostepKont'],
    zapisano: typeof o.zapisano === 'string' ? o.zapisano : teraz,
  };
}

const POLA_DAT_CIAZY = ['przewidywanyTerminPorodu', 'dataPorodu'] as const;

/** Dane ciąży i dziecka z żądania albo null. */
export function czytajDaneCiazy(w: unknown, bledy: BledyWejscia, pole = 'daneCiazy'): DaneCiazyIDziecka | null {
  const o = czytajObiekt(w, pole, bledy);
  if (o === undefined) return null;
  for (const p of POLA_DAT_CIAZY) czytajDate(o[p], sciezka(pole, p), bledy);
  if (o.dataPierwszejWizyty !== undefined && o.dataPierwszejWizyty !== 'brak-wizyty') czytajDate(o.dataPierwszejWizyty, sciezka(pole, 'dataPierwszejWizyty'), bledy);
  const przyjecie = czytajObiekt(o.przyjecie, sciezka(pole, 'przyjecie'), bledy);
  if (przyjecie !== undefined) {
    czytajZWyliczenia(przyjecie.forma, ['przysposobienie', 'rodzina-zastepcza-niezawodowa', 'rodzina-zastepcza-zawodowa'] as const, sciezka(pole, 'przyjecie', 'forma'), bledy, { wymagane: true });
    czytajDate(przyjecie.dataPrzyjecia, sciezka(pole, 'przyjecie', 'dataPrzyjecia'), bledy, { wymagane: true });
    czytajDate(przyjecie.dataUrodzeniaDziecka, sciezka(pole, 'przyjecie', 'dataUrodzeniaDziecka'), bledy, { wymagane: true });
  }
  const spokojny = czytajObiekt(o.spokojnyTryb, sciezka(pole, 'spokojnyTryb'), bledy);
  return {
    ...(o as Partial<DaneCiazyIDziecka>),
    dataPoroduPotwierdzona: o.dataPoroduPotwierdzona === true,
    dzieci: czytajListe(o.dzieci, sciezka(pole, 'dzieci'), bledy) as DaneCiazyIDziecka['dzieci'],
    sytuacjeSzczegolne: czytajListe(o.sytuacjeSzczegolne, sciezka(pole, 'sytuacjeSzczegolne'), bledy) as DaneCiazyIDziecka['sytuacjeSzczegolne'],
    spokojnyTryb: (spokojny ?? { wlaczony: false }) as DaneCiazyIDziecka['spokojnyTryb'],
  };
}

const LISTY_KOPII = ['tytuly', 'czlonkowieRodziny', 'zasilki', 'swiadczeniaRodzinne', 'wnioski', 'zaswiadczeniaEzla', 'stanyRozliczen',
  'zaswiadczeniaORozliczeniach', 'korespondencja', 'pelnomocnictwa'] as const;

/** Kopia Danych z konta ZUS z żądania z listami uzupełnionymi listą pustą albo null. */
export function czytajKopieZus(w: unknown, bledy: BledyWejscia, pole: string, teraz: ZnacznikCzasu): DaneZKontaZus | null {
  const o = czytajObiekt(w, pole, bledy);
  if (o === undefined) return null;
  const listy: Record<string, unknown[]> = {};
  for (const lista of LISTY_KOPII) listy[lista] = czytajListe(o[lista], sciezka(pole, lista), bledy);
  return {
    ...(o as Partial<DaneZKontaZus>),
    ...(listy as unknown as Pick<DaneZKontaZus, (typeof LISTY_KOPII)[number]>),
    odczytano: typeof o.odczytano === 'string' ? o.odczytano : teraz,
    pesel: typeof o.pesel === 'string' ? o.pesel : '',
    imie: typeof o.imie === 'string' ? o.imie : '',
    nazwisko: typeof o.nazwisko === 'string' ? o.nazwisko : '',
  };
}

/** Dane drugiego rodzica z konta ZUS: pełna kopia albo dane po dołączeniu (tytuły i zasiłki). */
export function czytajDaneZusDrugiego(w: unknown, bledy: BledyWejscia, pole: string, teraz: ZnacznikCzasu): DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null {
  const o = czytajObiekt(w, pole, bledy);
  if (o === undefined) return null;
  if ('pesel' in o) return czytajKopieZus(o, bledy, pole, teraz);
  return {
    zrodlo: o.zrodlo === 'pelnomocnictwo-pel' ? 'pelnomocnictwo-pel' : 'konto-zus',
    tytuly: czytajListe(o.tytuly, sciezka(pole, 'tytuly'), bledy) as DaneDrugiegoRodzicaZKonta['tytuly'],
    zasilki: czytajListe(o.zasilki, sciezka(pole, 'zasilki'), bledy) as DaneDrugiegoRodzicaZKonta['zasilki'],
    odczytano: typeof o.odczytano === 'string' ? o.odczytano : teraz,
  };
}

/**
 * Kopia z żądania albo, przy podanym numerze PESEL, symulowany odczyt danych konta ZUS na chwilę `teraz`.
 * Błędny PESEL daje kod 0024, 0025 albo 0026 w polu `polePeselu`.
 */
export function kopiaZZadania(
  kopia: unknown,
  pesel: unknown,
  bledy: BledyWejscia,
  pola: { kopia: string; pesel: string },
  teraz: ZnacznikCzasu,
  zgodaNaDaneZdrowia = true,
): DaneZKontaZus | null {
  if (kopia !== undefined && kopia !== null) return czytajKopieZus(kopia, bledy, pola.kopia, teraz);
  if (pesel === undefined || pesel === null) return null;
  const wynik = sprawdzPesel(pesel);
  if (!wynik.ok) {
    bledy[pola.pesel] = wynik.kod;
    return null;
  }
  return odczytajKontoZus(wynik.pesel as Pesel, teraz, zgodaNaDaneZdrowia);
}
