// Wyliczenie Terminów rodziny (kontrakt, sekcja 7.2; Story 3.7.1.1.1, 3.7.1.1.2, 3.7.1.2.1, 3.3.4.1.2). Właściciel: u13.
// Dla każdej sprawy planu: termin z reguły pozycji i daty kotwiczącej, oznaczenie szacowany, liczba dni,
// oznaczenie po terminie, terminy powtarzalne i koszt albo skutek spóźnienia.
import { dodajDni, dodajLata, dodajMiesiace, formatujDate, minData, ostatniDzienMiesiaca, pierwszyDzienMiesiaca, roznicaDni } from '@/domena/daty';
import { kosztSprawy } from '@/domena/terminy/koszt';
import {
  nastepnyTerminPowtarzalny,
  powrotDoZrobieniaPowtarzalnej,
  REGULY_POZYCJI,
  regulaPozycji,
  terminCorocznyNaDzien,
  terminZReguly,
  type KotwiceTerminow,
} from '@/domena/terminy/reguly';
import { wymiarUrlopuMacierzynskiego } from '@/domena/terminy/slowniki';
import type {
  DaneCiazyIDziecka,
  DaneRodziny,
  DataISO,
  KalendarzTerminow,
  Katalog,
  Kotwica,
  PlanRodziny,
  PozycjaPlanu,
  RegulaTerminu,
  TerminSprawy,
  ZnacznikCzasu,
} from '@/domena/typy';
import { teksty } from '@/teksty';

export interface WejscieTerminow {
  plan: PlanRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
  daneRodziny: DaneRodziny;
  katalog: Katalog;
  dzis: DataISO;
  teraz: ZnacznikCzasu;
}

const tk = teksty.ViewDeadlines.kotwice;

function formatujMiesiac(m: string): string {
  return `${teksty.wspolne.miesiace[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
}

interface DatyRodziny {
  ptp?: DataISO;
  dataPorodu?: DataISO; // potwierdzona
  urodzenie?: DataISO; // data porodu albo przed porodem przewidywany termin porodu; przy przyjęciu data urodzenia dziecka
  szacowane: boolean; // urodzenie liczone od przewidywanego terminu porodu
  przyjecie?: DaneCiazyIDziecka['przyjecie'];
}

function datyRodziny(daneCiazy: DaneCiazyIDziecka | null): DatyRodziny {
  if (!daneCiazy) return { szacowane: false };
  const ptp = daneCiazy.przewidywanyTerminPorodu;
  const dataPorodu = daneCiazy.dataPoroduPotwierdzona ? daneCiazy.dataPorodu : undefined;
  if (daneCiazy.przyjecie) {
    return { ptp, dataPorodu, urodzenie: daneCiazy.przyjecie.dataUrodzeniaDziecka, szacowane: false, przyjecie: daneCiazy.przyjecie };
  }
  return { ptp, dataPorodu, urodzenie: dataPorodu ?? ptp, szacowane: dataPorodu === undefined && ptp !== undefined };
}

function kotwiceRodziny(d: DatyRodziny): KotwiceTerminow {
  return {
    'przewidywany-termin-porodu': d.ptp,
    'koniec-10-tygodnia': d.ptp ? dodajDni(d.ptp, -211) : undefined,
    'data-porodu': d.przyjecie ? undefined : d.urodzenie,
    'data-urodzenia-dziecka': d.urodzenie,
    'data-przyjecia': d.przyjecie?.dataPrzyjecia,
    'data-uprawomocnienia': d.przyjecie?.dataUprawomocnienia,
  };
}

type Kotwa = NonNullable<TerminSprawy['kotwica']>;
interface WynikReguly {
  termin: DataISO | null;
  kotwica: Kotwa | null;
  szacowany: boolean;
  drugiTermin?: TerminSprawy['drugiTermin'];
  powtarzalny?: TerminSprawy['powtarzalny'];
  kodBrakuTerminu?: TerminSprawy['kodBrakuTerminu'];
}

const BRAK: WynikReguly = { termin: null, kotwica: null, szacowany: false };

function nazwaKotwicyPorodu(d: DatyRodziny): string {
  return d.szacowane ? tk.nazwy.ptpZamiastPorodu : tk.nazwy.dataPorodu;
}

function kotwa(rodzaj: Kotwica | 'rok-kalendarzowy', data: DataISO, opis: string): Kotwa {
  return { rodzaj, data, opis };
}

/** Opis wyliczenia terminu z reguły przesunięcia. */
function opisPrzesuniecia(r: Extract<RegulaTerminu, { typ: 'przesuniecie' }>, baza: DataISO, nazwa: string): string {
  if (r.korekta && r.jednostka === 'miesiace' && r.przesuniecie === 12 && r.korekta.przesuniecie === -14) {
    return tk.plus12MinusDni({ nazwa, data: formatujDate(baza) });
  }
  const liczba = String(r.przesuniecie);
  return r.jednostka === 'dni' ? tk.plusDni({ nazwa, data: formatujDate(baza), liczba }) : tk.plusMiesiace({ nazwa, data: formatujDate(baza), liczba });
}

/** Termin sprawy po przyjęciu dziecka na wychowanie (reguły 3.3.4.1.2). */
function terminPoPrzyjeciu(id: string, d: DatyRodziny, sprawa: PozycjaPlanu, katalog: Katalog): WynikReguly | null {
  const p = d.przyjecie;
  if (!p) return null;
  const przyjecie = p.dataPrzyjecia;
  const urodzenie = p.dataUrodzeniaDziecka;
  const nazwaP = tk.nazwy.dataPrzyjecia;
  const nazwaU = tk.nazwy.dataUprawomocnienia;
  const zPrzyjecia = (n: number, jednostka: 'dni' | 'miesiace'): WynikReguly => ({
    termin: jednostka === 'dni' ? dodajDni(przyjecie, n) : dodajMiesiace(przyjecie, n),
    kotwica: kotwa('data-przyjecia', przyjecie,
      jednostka === 'dni'
        ? tk.plusDni({ nazwa: nazwaP, data: formatujDate(przyjecie), liczba: String(n) })
        : tk.plusMiesiace({ nazwa: nazwaP, data: formatujDate(przyjecie), liczba: String(n) })),
    szacowany: false,
  });
  switch (id) {
    case 'K05':
      if (p.forma === 'przysposobienie') {
        if (!p.dataUprawomocnienia) return { ...BRAK, kodBrakuTerminu: '0259' };
        return {
          termin: dodajDni(p.dataUprawomocnienia, 7),
          kotwica: kotwa('data-uprawomocnienia', p.dataUprawomocnienia, tk.plusDni({ nazwa: nazwaU, data: formatujDate(p.dataUprawomocnienia), liczba: '7' })),
          szacowany: false,
        };
      }
      return zPrzyjecia(7, 'dni');
    case 'K09': {
      if (p.forma !== 'przysposobienie') return BRAK;
      if (!p.dataUprawomocnienia) return { ...BRAK, kodBrakuTerminu: '0192' };
      const limit = dodajDni(dodajLata(urodzenie, 14), -14);
      return {
        termin: minData(dodajDni(dodajMiesiace(p.dataUprawomocnienia, 12), -14), limit),
        kotwica: kotwa('data-uprawomocnienia', p.dataUprawomocnienia, tk.k09Przysposobienie({ data: formatujDate(p.dataUprawomocnienia), limit: formatujDate(limit) })),
        szacowany: false,
      };
    }
    case 'K10': {
      if (p.forma === 'rodzina-zastepcza-zawodowa') return BRAK;
      const lata = p.forma === 'przysposobienie' ? 14 : p.odroczenieObowiazkuSzkolnego ? 10 : 7;
      return {
        termin: dodajDni(dodajLata(urodzenie, lata), -1),
        kotwica: kotwa('data-urodzenia-dziecka', urodzenie, tk.dzienPrzedUrodzinami({ data: formatujDate(urodzenie), lata: String(lata) })),
        szacowany: false,
      };
    }
    case 'K12':
    case 'K16':
      return zPrzyjecia(3, 'miesiace');
    case 'K14':
    case 'K17': {
      const wynik = zPrzyjecia(12, 'miesiace');
      const limit = dodajDni(dodajLata(urodzenie, 18), -1);
      return wynik.termin ? { ...wynik, termin: minData(wynik.termin, limit) } : wynik;
    }
    case 'K15':
      return {
        termin: dodajDni(dodajLata(urodzenie, 1), -1),
        kotwica: kotwa('data-urodzenia-dziecka', urodzenie, tk.dzienPrzedPierwszymiUrodzinami({ data: formatujDate(urodzenie) })),
        szacowany: false,
      };
    case 'K18': {
      const dwunastyMiesiac = dodajMiesiace(urodzenie, 12);
      if (dwunastyMiesiac <= przyjecie) {
        return { termin: ostatniDzienMiesiaca(przyjecie), kotwica: kotwa('data-przyjecia', przyjecie, tk.koniecMiesiacaPrzyjecia({ data: formatujDate(przyjecie) })), szacowany: false, powtarzalny: { poczatekSkladania: pierwszyDzienMiesiaca(przyjecie) } };
      }
      return null;
    }
    case 'K31':
    case 'K32':
      return null; // reguła ogólna od daty przyjęcia
    default:
      void sprawa;
      void katalog;
      return null;
  }
}

/** Termin sprawy z reguły pozycji, z opisem daty kotwiczącej. */
function terminRegulyPozycji(id: string, sprawa: PozycjaPlanu, d: DatyRodziny, w: WejscieTerminow): WynikReguly {
  const poPrzyjeciu = terminPoPrzyjeciu(id, d, sprawa, w.katalog);
  if (poPrzyjeciu) return poPrzyjeciu;

  const r = regulaPozycji(id, w.katalog);
  const kotwice = kotwiceRodziny(d);
  const liczbaDzieci = w.daneCiazy?.liczbaUrodzonychDzieci ?? w.daneCiazy?.liczbaDzieciZCiazy ?? sprawa.liczbaDzieci;
  const termin = terminZReguly(r, kotwice, w.katalog, liczbaDzieci, w.dzis);
  if (termin === null) return BRAK;
  const urodzenie = d.urodzenie ?? termin;
  const nazwaPorodu = nazwaKotwicyPorodu(d);

  switch (r.typ) {
    case 'przesuniecie': {
      const baza = kotwice[r.kotwica] as DataISO;
      if (r.kotwica === 'koniec-10-tygodnia') {
        return { termin, kotwica: kotwa('koniec-10-tygodnia', baza, tk.koniec10Tygodnia({ data: formatujDate(baza), ptp: formatujDate(d.ptp ?? baza) })), szacowany: false };
      }
      if (r.kotwica === 'przewidywany-termin-porodu') {
        const opis = r.przesuniecie === -1 ? tk.ptpMinus1({ data: formatujDate(baza) }) : tk.ptp({ data: formatujDate(baza) });
        return { termin, kotwica: kotwa('przewidywany-termin-porodu', baza, opis), szacowany: false };
      }
      if (r.kotwica === 'data-porodu') {
        const opis = id === 'K15' ? tk.dzienPrzedPierwszymiUrodzinami({ data: formatujDate(baza) }) : opisPrzesuniecia(r, baza, nazwaPorodu);
        return { termin, kotwica: kotwa(d.szacowane ? 'przewidywany-termin-porodu' : 'data-porodu', baza, opis), szacowany: d.szacowane };
      }
      const nazwa = r.kotwica === 'data-przyjecia' ? tk.nazwy.dataPrzyjecia : r.kotwica === 'data-uprawomocnienia' ? tk.nazwy.dataUprawomocnienia : tk.nazwy.kotwica;
      const wynik: WynikReguly = { termin, kotwica: kotwa(r.kotwica, baza, opisPrzesuniecia(r, baza, nazwa)), szacowany: false };
      return wynik;
    }
    case 'dwa-terminy': {
      const pierwszy = terminRegulyZListy(r.pierwszy, kotwice, w, liczbaDzieci, d);
      const drugi = terminZReguly(r.drugi, kotwice, w.katalog, liczbaDzieci, w.dzis);
      return {
        ...pierwszy,
        drugiTermin: drugi ? { data: drugi, kluczEtykiety: r.kluczEtykietyDrugiego } : undefined,
      };
    }
    case 'plus-wymiar': {
      const baza = kotwice[r.kotwica] as DataISO;
      const tygodnie = wymiarUrlopuMacierzynskiego(w.katalog, liczbaDzieci, baza, r.idWpisu);
      return { termin, kotwica: kotwa(d.szacowane ? 'przewidywany-termin-porodu' : 'data-porodu', baza, tk.plusTygodnie({ nazwa: nazwaPorodu, data: formatujDate(baza), liczba: String(tygodnie) })), szacowany: d.szacowane };
    }
    case 'koniec-roku-urodzin':
      return { termin, kotwica: kotwa('data-urodzenia-dziecka', urodzenie, tk.koniecRokuUrodzin({ data: formatujDate(urodzenie), rok: termin.slice(0, 4) })), szacowany: d.szacowane };
    case 'dzien-przed-urodzinami':
      return { termin, kotwica: kotwa('data-urodzenia-dziecka', urodzenie, tk.dzienPrzedUrodzinami({ data: formatujDate(urodzenie), lata: String(r.lata) })), szacowany: d.szacowane };
    case 'koniec-miesiaca-wieku':
      return {
        termin,
        kotwica: kotwa('data-urodzenia-dziecka', urodzenie, tk.koniecMiesiaca12({ data: formatujDate(urodzenie) })),
        szacowany: d.szacowane,
        powtarzalny: { poczatekSkladania: pierwszyDzienMiesiaca(termin) },
      };
    case 'coroczny': {
      const biezacy = terminCorocznyNaDzien(r, urodzenie, w.dzis);
      const opis = r.poczatekSkladania
        ? tk.k13({ data: formatujDate(urodzenie) })
        : tk.k21({ od: urodzenie.slice(0, 4), doRoku: String(Number(urodzenie.slice(0, 4)) + (r.doRokuUrodzin ?? 0)) });
      return {
        termin,
        kotwica: kotwa('rok-kalendarzowy', urodzenie, opis),
        szacowany: d.szacowane,
        powtarzalny: { poczatekSkladania: biezacy?.poczatekSkladania, zalecanyTermin: biezacy?.zalecany },
      };
    }
    default:
      return { termin, kotwica: null, szacowany: false };
  }
}

function terminRegulyZListy(r: RegulaTerminu, kotwice: KotwiceTerminow, w: WejscieTerminow, liczbaDzieci: number, d: DatyRodziny): WynikReguly {
  const termin = terminZReguly(r, kotwice, w.katalog, liczbaDzieci, w.dzis);
  if (termin === null || r.typ !== 'przesuniecie') return { ...BRAK, termin };
  const baza = kotwice[r.kotwica] as DataISO;
  const nazwa = r.kotwica === 'data-przyjecia' ? tk.nazwy.dataPrzyjecia : nazwaKotwicyPorodu(d);
  return { termin, kotwica: kotwa(r.kotwica, baza, opisPrzesuniecia(r, baza, nazwa)), szacowany: false };
}

/** Termin sprawy Opłacenie składek: 20. dzień miesiąca następującego po miesiącu składek. */
function terminOplaceniaSkladek(sprawa: PozycjaPlanu): WynikReguly {
  if (!sprawa.miesiacSkladek) return BRAK;
  const pierwszyDzien = `${sprawa.miesiacSkladek}-01`;
  const termin = dodajDni(dodajMiesiace(pierwszyDzien, 1), 19);
  return { termin, kotwica: kotwa('rok-kalendarzowy', pierwszyDzien, tk.oplacenieSkladek({ miesiac: formatujMiesiac(sprawa.miesiacSkladek) })), szacowany: false };
}

/** Czy sprawa powtarzalna załatwiona w poprzednim cyklu wraca dzisiaj do statusu do zrobienia. */
export function czyWracaDoZrobienia(sprawa: PozycjaPlanu, dzis: DataISO): boolean {
  if (sprawa.status !== 'zalatwiona' || !sprawa.dataOznaczenia || sprawa.idPozycji === null) return false;
  if (REGULY_POZYCJI[sprawa.idPozycji]?.typ !== 'coroczny') return false;
  const powrot = powrotDoZrobieniaPowtarzalnej(sprawa.idSprawy, sprawa.dataOznaczenia);
  return powrot !== null && dzis >= powrot;
}

/** Status sprawy, według którego kalendarz pokazuje termin (z powrotem spraw powtarzalnych). */
export function statusDlaKalendarza(sprawa: PozycjaPlanu, dzis: DataISO): PozycjaPlanu['status'] {
  return czyWracaDoZrobienia(sprawa, dzis) ? 'do-zrobienia' : sprawa.status;
}

function terminSprawy(sprawa: PozycjaPlanu, w: WejscieTerminow, d: DatyRodziny): TerminSprawy {
  const dochod = w.daneRodziny.dochodNaOsobe?.wartosc ?? null;
  const pozycjaKatalogu = sprawa.idPozycji ? w.katalog.pozycje.find((p) => p.id === sprawa.idPozycji) : undefined;
  const status = statusDlaKalendarza(sprawa, w.dzis);

  // Sprawa powtarzalna załatwiona w bieżącym cyklu: bez terminu, z następnym terminem i datą powrotu.
  if (status === 'zalatwiona' && sprawa.idPozycji && REGULY_POZYCJI[sprawa.idPozycji]?.typ === 'coroczny' && sprawa.dataOznaczenia) {
    const nastepny = nastepnyTerminPowtarzalny(sprawa.idSprawy, sprawa.dataOznaczenia);
    const regula = REGULY_POZYCJI[sprawa.idPozycji];
    const limitRoku = regula.typ === 'coroczny' && regula.doRokuUrodzin !== undefined && d.urodzenie ? Number(d.urodzenie.slice(0, 4)) + regula.doRokuUrodzin : null;
    const nastepnyWLimicie = nastepny && (limitRoku === null || Number(nastepny.slice(0, 4)) <= limitRoku) ? nastepny : undefined;
    return {
      idSprawy: sprawa.idSprawy,
      termin: null,
      kotwica: null,
      szacowany: false,
      dniDoTerminu: null,
      poTerminie: false,
      powtarzalny: {
        nastepnyTermin: nastepnyWLimicie,
        powrotDoZrobienia: nastepnyWLimicie ? (powrotDoZrobieniaPowtarzalnej(sprawa.idSprawy, sprawa.dataOznaczenia) ?? undefined) : undefined,
      },
      koszt: { rodzaj: 'brak' },
    };
  }

  if (status === 'zlozona' || status === 'zalatwiona') {
    return { idSprawy: sprawa.idSprawy, termin: null, kotwica: null, szacowany: false, dniDoTerminu: null, poTerminie: false, koszt: { rodzaj: 'brak' } };
  }

  let wynik = sprawa.idPozycji === null ? terminOplaceniaSkladek(sprawa) : terminRegulyPozycji(sprawa.idPozycji, sprawa, d, w);

  // Sprawa powtarzalna, która wróciła do statusu do zrobienia, ma termin następnego cyklu.
  if (czyWracaDoZrobienia(sprawa, w.dzis) && sprawa.dataOznaczenia) {
    const nastepny = nastepnyTerminPowtarzalny(sprawa.idSprawy, sprawa.dataOznaczenia);
    if (nastepny && (wynik.termin === null || wynik.termin < nastepny)) wynik = { ...wynik, termin: nastepny };
  }

  const termin = wynik.termin;
  const koszt =
    sprawa.idPozycji === null
      ? ({ rodzaj: 'brak' } as const)
      : kosztSprawy(sprawa.idPozycji, pozycjaKatalogu?.kosztSpoznienia, termin, w.dzis, w.katalog, sprawa.liczbaDzieci, dochod);
  return {
    idSprawy: sprawa.idSprawy,
    termin,
    drugiTermin: wynik.drugiTermin,
    kotwica: wynik.kotwica,
    szacowany: termin !== null && wynik.szacowany,
    dniDoTerminu: termin === null ? null : roznicaDni(w.dzis, termin),
    poTerminie: termin !== null && termin < w.dzis,
    powtarzalny: wynik.powtarzalny,
    koszt,
    kodBrakuTerminu: wynik.kodBrakuTerminu,
  };
}

/** Terminy wszystkich spraw planu rodziny z datą ostatniego wyliczenia. */
export function wyliczTerminy(w: WejscieTerminow): KalendarzTerminow {
  const d = datyRodziny(w.daneCiazy);
  return { terminy: w.plan.pozycje.map((sprawa) => terminSprawy(sprawa, w, d)), wyliczono: w.teraz };
}
