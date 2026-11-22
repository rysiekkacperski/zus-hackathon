// Scalanie odczytu dokumentu z danymi przykładowej sprawy (kontrakt, sekcja 7.2).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Reguły: sprawa ma najwyżej jeden dokument danego rodzaju (nowy zastępuje poprzedni, 0181), wartość
// z dokumentu o wyższym pierwszeństwie wygrywa, korekta użytkownika ma pierwszeństwo przed dokumentami,
// dalszy okres niezdolności z ZAS-12 dopisujemy do sprawy, a świadczenia przyznane i odmówione ze zrzutu uzupełniają
// puste pola rozstrzygnięcia (0225). Odczyt oznaczamy 0107, a dane zastąpione 0255.
import type {
  DaneSprawy,
  DokumentSprawy,
  KodKomunikatu,
  Okres,
  OkresOtwarty,
  RodzajDokumentuSprawy,
  RozstrzygniecieSprawy,
  SprawaPrzykladowa,
  WartoscOdczytana,
  WartoscSprawy,
  WynikOdczytuDokumentu,
  ZrodloWartosciSprawy,
} from '@/domena/typy';
import type { SwiadczenieOdmowione } from './rozszerzenia-typow';

/** Ścieżki wszystkich wartości Danych sprawy; odczyt zapisuje wyłącznie te dane. */
export const SCIEZKI_DANYCH_SPRAWY = [
  'ubezpieczony.imie', 'ubezpieczony.nazwisko', 'ubezpieczony.pesel', 'ubezpieczony.rola',
  'tytul.rodzaj', 'tytul.od', 'tytul.dataUstania',
  'wymiarCzasuPracy', 'wymiarEtatu',
  'ubezpieczenieChorobowe.rodzaj', 'ubezpieczenieChorobowe.okresy', 'ubezpieczenieChorobowe.dataUstaniaPrzyTrwajacymTytule',
  'liczbaUbezpieczonychPlatnika',
  'ustanieZatrudnienia.przyczyna', 'ustanieZatrudnienia.inneZatrudnienie',
  'pracaPoUstaniu',
  'zdarzenie.rodzaj', 'zdarzenie.dataPorodu', 'zdarzenie.przewidywanyTermin', 'zdarzenie.liczbaDzieci',
  'zdarzenie.liczbaMartwych', 'zdarzenie.niezdolnosc', 'zdarzenie.dalszeOkresy',
  'dziecko.tydzienCiazy', 'dziecko.masaG', 'dziecko.pobyt', 'dziecko.zaZyciem',
  'wniosek.swiadczenia', 'wniosek.okresy', 'wniosek.oswiadczeniePelnyWymiar', 'wniosek.dataZlozenia', 'wniosek.okresMatki',
  'kwotyMiesieczne', 'poprzedniZasilek', 'zadluzenieJdg', 'swiadczeniaPrzyznane', 'swiadczeniaOdmowione',
] as const;

export type SciezkaDanychSprawy = (typeof SCIEZKI_DANYCH_SPRAWY)[number];

/** Ścieżki, których wartość jest obiektem albo listą i w odczycie przychodzi jako tekst JSON. */
export const SCIEZKI_ZLOZONE: ReadonlySet<string> = new Set([
  'ubezpieczenieChorobowe.okresy', 'zdarzenie.niezdolnosc', 'zdarzenie.dalszeOkresy', 'dziecko.pobyt',
  'wniosek.swiadczenia', 'wniosek.okresy', 'wniosek.okresMatki', 'kwotyMiesieczne', 'poprzedniZasilek',
  'zadluzenieJdg', 'swiadczeniaPrzyznane', 'swiadczeniaOdmowione',
]);

export const SCIEZKI_DANYCH_OSOBOWYCH: ReadonlySet<string> = new Set(['ubezpieczony.imie', 'ubezpieczony.nazwisko', 'ubezpieczony.pesel']);

export function czySciezkaDanychSprawy(pole: string): pole is SciezkaDanychSprawy {
  return (SCIEZKI_DANYCH_SPRAWY as readonly string[]).includes(pole);
}

/** Pierwszeństwo dokumentów: mniejsza liczba oznacza wyższe pierwszeństwo. */
export const PIERWSZENSTWO_DOKUMENTOW: Readonly<Record<RodzajDokumentuSprawy, number>> = {
  poswiadczenie: 1,
  'zrzut-zus': 2,
  'zas-12': 3,
  'z-3': 4,
  'z-3a': 4,
  'z-3b': 4,
  'e-zla': 5,
  'zaswiadczenie-o-terminie-porodu': 5,
  'zaswiadczenie-szpitala': 5,
  'zaswiadczenie-o-martwym-urodzeniu': 5,
  'zaswiadczenie-za-zyciem': 5,
  zam: 6,
};

const BRAK: ZrodloWartosciSprawy = { rodzaj: 'brak' };

function pusta<T>(): WartoscSprawy<T> {
  return { wartosc: null, zrodlo: BRAK };
}

/** Dane sprawy bez wartości; praca po ustaniu ubezpieczenia ma wartość domyślną „nie”. */
export function pusteDaneSprawy(): DaneSprawy {
  return {
    ubezpieczony: { imie: pusta(), nazwisko: pusta(), pesel: pusta(), rola: pusta() },
    tytul: { rodzaj: pusta(), od: pusta(), dataUstania: pusta() },
    wymiarCzasuPracy: pusta(),
    wymiarEtatu: pusta(),
    ubezpieczenieChorobowe: { rodzaj: pusta(), okresy: pusta(), dataUstaniaPrzyTrwajacymTytule: pusta() },
    liczbaUbezpieczonychPlatnika: pusta(),
    ustanieZatrudnienia: { przyczyna: pusta(), inneZatrudnienie: pusta() },
    pracaPoUstaniu: { wartosc: false, zrodlo: { rodzaj: 'wartosc-domyslna' } },
    zdarzenie: { rodzaj: pusta(), dataPorodu: pusta(), przewidywanyTermin: pusta(), liczbaDzieci: pusta(), liczbaMartwych: pusta(), niezdolnosc: pusta(), dalszeOkresy: pusta() },
    dziecko: { tydzienCiazy: pusta(), masaG: pusta(), pobyt: pusta(), zaZyciem: pusta() },
    wniosek: { swiadczenia: pusta(), okresy: pusta(), oswiadczeniePelnyWymiar: pusta(), dataZlozenia: pusta(), okresMatki: pusta() },
    kwotyMiesieczne: pusta(),
    poprzedniZasilek: pusta(),
    zadluzenieJdg: pusta(),
    swiadczeniaPrzyznane: pusta(),
    swiadczeniaOdmowione: pusta(),
  };
}

type Drzewo = Record<string, unknown>;

/** Wartość sprawy pod ścieżką, np. 'tytul.od'. */
export function wartoscPola(dane: DaneSprawy, sciezka: string): WartoscSprawy<unknown> {
  const [a, b] = sciezka.split('.');
  const grupa = (dane as unknown as Drzewo)[a];
  const wynik = b === undefined ? grupa : (grupa as Drzewo | undefined)?.[b];
  return (wynik as WartoscSprawy<unknown> | undefined) ?? pusta();
}

/** Dane sprawy z nową wartością pod ścieżką (bez zmiany wejścia). */
export function zWartoscia(dane: DaneSprawy, sciezka: string, wartosc: WartoscSprawy<unknown>): DaneSprawy {
  const [a, b] = sciezka.split('.');
  const kopia = { ...(dane as unknown as Drzewo) };
  if (b === undefined) kopia[a] = wartosc;
  else kopia[a] = { ...(kopia[a] as Drzewo), [b]: wartosc };
  return kopia as unknown as DaneSprawy;
}

/** Wartość z odczytu w typie Danych sprawy: tekst JSON dla wartości złożonych. */
export function wartoscZOdczytu(sciezka: string, wartosc: WartoscOdczytana['wartosc']): unknown {
  if (wartosc === null) return null;
  if (SCIEZKI_ZLOZONE.has(sciezka) && typeof wartosc === 'string') {
    try {
      return JSON.parse(wartosc) as unknown;
    } catch {
      return null;
    }
  }
  return wartosc;
}

/** Wartość Danych sprawy w postaci odczytu (tekst JSON dla wartości złożonych). */
export function wartoscDoOdczytu(sciezka: string, wartosc: unknown): WartoscOdczytana['wartosc'] {
  if (wartosc === null || wartosc === undefined) return null;
  if (SCIEZKI_ZLOZONE.has(sciezka)) return JSON.stringify(wartosc);
  if (typeof wartosc === 'string' || typeof wartosc === 'number' || typeof wartosc === 'boolean') return wartosc;
  return JSON.stringify(wartosc);
}

/** Wynik scalenia z komunikatami dla ekranu ViewSampleCaseData. */
export interface WynikScalenia {
  sprawa: SprawaPrzykladowa;
  komunikaty: KodKomunikatu[];
}

function pierwszenstwoZrodla(zrodlo: ZrodloWartosciSprawy, dokumenty: readonly DokumentSprawy[]): number {
  if (zrodlo.rodzaj === 'korekta-uzytkownika') return 0;
  if (zrodlo.rodzaj !== 'dokument') return 99;
  const dokument = dokumenty.find((d) => d.id === zrodlo.idDokumentu);
  return dokument ? PIERWSZENSTWO_DOKUMENTOW[dokument.rodzaj] : 99;
}

function czyPusta(w: WartoscSprawy<unknown>): boolean {
  return w.wartosc === null || (Array.isArray(w.wartosc) && w.wartosc.length === 0);
}

function wyczyscZrodlo(dane: DaneSprawy, idDokumentu: string): DaneSprawy {
  let wynik = dane;
  for (const sciezka of SCIEZKI_DANYCH_SPRAWY) {
    const w = wartoscPola(wynik, sciezka);
    if (w.zrodlo.rodzaj === 'dokument' && w.zrodlo.idDokumentu === idDokumentu) {
      wynik = zWartoscia(wynik, sciezka, sciezka === 'pracaPoUstaniu' ? { wartosc: false, zrodlo: { rodzaj: 'wartosc-domyslna' } } : pusta());
    }
  }
  return wynik;
}

const SWIADCZENIA_ZE_ZRZUTU: Readonly<Record<string, RozstrzygniecieSprawy['swiadczenie']>> = {
  'zasilek-macierzynski': 'zasilek-macierzynski',
  zwzm: 'zwzm',
  'zasilek-chorobowy': 'zasilek-chorobowy',
};

/** Świadczenie rozstrzygnięcia z rodzaju świadczenia przyznanego w zrzucie (kod albo nazwa). */
export function swiadczenieZeZrzutu(rodzaj: string): RozstrzygniecieSprawy['swiadczenie'] | null {
  const kod = SWIADCZENIA_ZE_ZRZUTU[rodzaj];
  if (kod) return kod;
  const tekst = rodzaj.toLocaleLowerCase('pl-PL');
  if (tekst.includes('w wysokości zasiłku macierzyńskiego')) return 'zwzm';
  if (tekst.includes('macierzy')) return 'zasilek-macierzynski';
  if (tekst.includes('chorob')) return 'zasilek-chorobowy';
  return null;
}

function uzupelnijRozstrzygniecie(
  rozstrzygniecie: RozstrzygniecieSprawy[],
  przyznane: { rodzaj: string; od: string; do: string; kwota: number }[],
  zrodlo: ZrodloWartosciSprawy,
  odmowione: SwiadczenieOdmowione[] = [],
): { lista: RozstrzygniecieSprawy[]; zmieniono: boolean } {
  let zmieniono = false;
  const lista = rozstrzygniecie.map((r) => ({ ...r }));
  // Odmowa ze zrzutu daje wpis „nie przysługuje”, gdy rozstrzygnięcie nie ma jeszcze wpisu tego świadczenia.
  for (const o of odmowione) {
    const swiadczenie = swiadczenieZeZrzutu(o.rodzaj);
    if (swiadczenie === null || lista.some((r) => r.swiadczenie === swiadczenie)) continue;
    lista.push({ swiadczenie, prawo: 'nie-przysluguje', zrodlo });
    zmieniono = true;
  }
  for (const p of przyznane) {
    const swiadczenie = swiadczenieZeZrzutu(p.rodzaj);
    if (swiadczenie === null) continue;
    const istniejace = lista.find((r) => r.swiadczenie === swiadczenie);
    if (!istniejace) {
      lista.push({ swiadczenie, prawo: 'przysluguje', okres: { od: p.od, do: p.do }, miesiecznaKwota: p.kwota, zrodlo });
      zmieniono = true;
      continue;
    }
    if (istniejace.okres === undefined) {
      istniejace.okres = { od: p.od, do: p.do };
      zmieniono = true;
    }
    if (istniejace.miesiecznaKwota === undefined) {
      istniejace.miesiecznaKwota = p.kwota;
      zmieniono = true;
    }
  }
  return { lista, zmieniono };
}

/** Sprawa po scaleniu odczytu z komunikatami 0107, 0255, 0181 i 0225. */
export function scalOdczytZKomunikatami(
  sprawa: SprawaPrzykladowa,
  wynik: WynikOdczytuDokumentu,
  dokument: DokumentSprawy,
): WynikScalenia {
  const komunikaty: KodKomunikatu[] = [];
  const poprzedni = sprawa.dokumenty.find((d) => d.rodzaj === dokument.rodzaj && d.id !== dokument.id);
  let dane = sprawa.dane;
  let dokumenty = sprawa.dokumenty.filter((d) => d.id !== dokument.id);
  if (poprzedni) {
    dane = wyczyscZrodlo(dane, poprzedni.id);
    dokumenty = dokumenty.filter((d) => d.id !== poprzedni.id);
    komunikaty.push('0181');
  }
  dokumenty = [...dokumenty, dokument];

  const zrodlo: ZrodloWartosciSprawy = { rodzaj: 'dokument', idDokumentu: dokument.id };
  const pierwszenstwoNowego = PIERWSZENSTWO_DOKUMENTOW[dokument.rodzaj];
  let odczytano = false;
  let zastapiono = false;
  let przyznane: { rodzaj: string; od: string; do: string; kwota: number }[] = [];
  let odmowione: SwiadczenieOdmowione[] = [];

  for (const odczyt of wynik.wartosci) {
    let sciezka = odczyt.pole;
    if (!czySciezkaDanychSprawy(sciezka)) continue;
    let wartosc = wartoscZOdczytu(sciezka, odczyt.wartosc);
    if (wartosc === null) continue;
    if (dokument.rodzaj === 'zas-12' && sciezka === 'zdarzenie.niezdolnosc') {
      const okres = wartosc as Okres;
      sciezka = 'zdarzenie.dalszeOkresy';
      const obecne = (wartoscPola(dane, sciezka).wartosc as Okres[] | null) ?? [];
      wartosc = [...obecne.filter((o) => o.od !== okres.od), { od: okres.od, do: okres.do }];
    }
    if (sciezka === 'swiadczeniaPrzyznane' && Array.isArray(wartosc)) {
      przyznane = wartosc as typeof przyznane;
    }
    if (sciezka === 'swiadczeniaOdmowione' && Array.isArray(wartosc)) {
      odmowione = wartosc as SwiadczenieOdmowione[];
    }
    const obecna = wartoscPola(dane, sciezka);
    const pierwszenstwoObecnej = czyPusta(obecna) ? 99 : pierwszenstwoZrodla(obecna.zrodlo, dokumenty);
    if (pierwszenstwoObecnej < pierwszenstwoNowego) continue;
    const daneZastapione = odczyt.daneZastapione === true || undefined;
    dane = zWartoscia(dane, sciezka, { wartosc, zrodlo, odczytaneAI: true, ...(daneZastapione ? { daneZastapione } : {}) });
    odczytano = true;
    if (daneZastapione) zastapiono = true;

    if (dokument.rodzaj === 'zas-12' && sciezka === 'ubezpieczenieChorobowe.dataUstaniaPrzyTrwajacymTytule') {
      const okresy = wartoscPola(dane, 'ubezpieczenieChorobowe.okresy');
      const lista = (okresy.wartosc as OkresOtwarty[] | null) ?? [];
      const ostatni = lista.length - 1;
      if (ostatni >= 0 && lista[ostatni].do === undefined && okresy.zrodlo.rodzaj !== 'korekta-uzytkownika') {
        const nowe = lista.map((o, i) => (i === ostatni ? { ...o, do: wartosc as string } : o));
        dane = zWartoscia(dane, 'ubezpieczenieChorobowe.okresy', { ...okresy, wartosc: nowe });
      }
    }
  }

  let rozstrzygniecie = sprawa.rozstrzygniecie;
  if (przyznane.length > 0 || odmowione.length > 0) {
    const uzupelnione = uzupelnijRozstrzygniecie(rozstrzygniecie, przyznane, zrodlo, odmowione);
    rozstrzygniecie = uzupelnione.lista;
    if (uzupelnione.zmieniono) komunikaty.push('0225');
  }
  if (odczytano) komunikaty.unshift('0107');
  if (zastapiono) komunikaty.splice(odczytano ? 1 : 0, 0, '0255');

  return {
    sprawa: { ...sprawa, dokumenty, dane, rozstrzygniecie, weryfikacja: undefined },
    komunikaty,
  };
}

/** Sprawa z wartościami odczytanymi z dokumentu (0181, 0225, 0107, 0255). */
export function scalOdczyt(sprawa: SprawaPrzykladowa, wynik: WynikOdczytuDokumentu, dokument: DokumentSprawy): SprawaPrzykladowa {
  return scalOdczytZKomunikatami(sprawa, wynik, dokument).sprawa;
}

/** Korekta użytkownika z zachowaniem wartości pierwotnej (odczytanej albo ze sprawy zespołu). */
export function zKorekta(dane: DaneSprawy, sciezka: string, wartosc: unknown, daneZastapione = false): DaneSprawy {
  const obecna = wartoscPola(dane, sciezka);
  const wartoscPierwotna = obecna.zrodlo.rodzaj === 'korekta-uzytkownika' ? obecna.zrodlo.wartoscPierwotna : obecna.wartosc;
  return zWartoscia(dane, sciezka, {
    wartosc,
    zrodlo: { rodzaj: 'korekta-uzytkownika', wartoscPierwotna },
    ...(daneZastapione ? { daneZastapione: true } : {}),
  });
}
