// Koszt spóźnienia sprawy (kontrakt, sekcja 7.2; Story 3.7.1.2.1). Właściciel: u13 (Kalendarz terminów).
// Przed terminem liczymy koszt w dniu następującym po terminie, po terminie koszt na dzień dzisiejszy.
// Kwoty w groszach pochodzą ze słownika kwot i progów i obowiązują w każdym miesiącu, którego dotyczy strata.
import { dataZMiesiaca, dodajDni, dodajMiesiaceDoMiesiaca, miesiacZDaty, ostatniDzienMiesiaca } from '@/domena/daty';
import { kwotaWpisuSlownika, kwotaZeSlownika, type KluczWpisuKalendarza } from '@/domena/terminy/slowniki';
import type {
  DataISO,
  Grosze,
  IdPozycji,
  IdWpisuSlownika,
  Katalog,
  KosztSpoznienia,
  KosztSpoznieniaPozycji,
  MiesiacISO,
  PozycjaKatalogu,
} from '@/domena/typy';
import { teksty } from '@/teksty';

type RegulaMiesieczna = { wpis: KluczWpisuKalendarza; naDziecko: boolean; przesuniecieStartu: number };
type RegulaJednorazowa = { wpis: KluczWpisuKalendarza; naDziecko: boolean };

// Świadczenia miesięczne: miesiąc początkowy straty = miesiąc terminu przesunięty o `przesuniecieStartu`.
const MIESIECZNE: Partial<Record<IdPozycji, RegulaMiesieczna>> = {
  K12: { wpis: 'swiadczenieWychowawcze', naDziecko: true, przesuniecieStartu: -3 },
  K13: { wpis: 'swiadczenieWychowawcze', naDziecko: true, przesuniecieStartu: 0 },
  K16: { wpis: 'swiadczenieRodzicielskie', naDziecko: false, przesuniecieStartu: -3 },
  K18: { wpis: 'aktywnieWDomu', naDziecko: true, przesuniecieStartu: 0 },
};

const JEDNORAZOWE: Partial<Record<IdPozycji, RegulaJednorazowa>> = {
  K14: { wpis: 'becikowe', naDziecko: true },
  K15: { wpis: 'dodatek', naDziecko: true },
  K17: { wpis: 'zaZyciem', naDziecko: false },
};

const skutkiWbudowane: Readonly<Record<string, string>> = teksty.ViewDeadlines.skutki;

/** Dane profilu do kosztu: data kotwicząca (dzień urodzenia dla K12 i K16) i zaświadczenie „Za życiem” dla K01. */
export interface OpcjeKosztu {
  dataKotwicy?: DataISO;
  zaZyciem?: boolean;
}

/** Rodzaj prezentacji kosztu sprawy: świadczenie miesięczne, jednorazowe albo inne. */
export function rodzajKosztu(idPozycji: IdPozycji | null): 'miesieczny' | 'jednorazowy' | 'inny' {
  if (idPozycji === null) return 'inny';
  if (MIESIECZNE[idPozycji]) return 'miesieczny';
  if (JEDNORAZOWE[idPozycji] || idPozycji === 'K01') return 'jednorazowy';
  return 'inny';
}

/** Koszt spóźnienia przy sprawie Aktywny Rodzic jest kwotą najmniejszą („co najmniej”). */
export function czyKosztMinimalny(idPozycji: IdPozycji | null): boolean {
  return idPozycji === 'K18';
}

/** Dzień złożenia wniosku przyjęty do kosztu: dzień po terminie albo dzisiaj po terminie. */
export function dzienZlozeniaDoKosztu(termin: DataISO, dzis: DataISO): { dzien: DataISO; moment: 'dzien-po-terminie' | 'na-dzis' } {
  return dzis <= termin ? { dzien: dodajDni(termin, 1), moment: 'dzien-po-terminie' } : { dzien: dzis, moment: 'na-dzis' };
}

function normalizujSkutek(tekst: string): string {
  let t = tekst.trim().replace(/^skutek(\s+bez\s+kwoty)?\s*:\s*/i, '');
  if (t.length > 1 && t.charAt(1) === t.charAt(1).toLowerCase()) t = t.charAt(0).toLowerCase() + t.slice(1);
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function skutekSprawy(idPozycji: IdPozycji, koszt: KosztSpoznieniaPozycji | undefined): KosztSpoznienia {
  if (koszt?.typ === 'skutek' && koszt.tekst.trim() !== '') return { rodzaj: 'skutek', tekst: normalizujSkutek(koszt.tekst) };
  const wbudowany = skutkiWbudowane[idPozycji];
  if (wbudowany) return { rodzaj: 'skutek', tekst: wbudowany };
  return { rodzaj: 'brak' };
}

function kosztMiesieczny(
  regula: RegulaMiesieczna,
  termin: DataISO,
  dzis: DataISO,
  katalog: Katalog,
  liczbaDzieci: number,
  idWpisu?: IdWpisuSlownika,
  dataKotwicy?: DataISO,
): KosztSpoznienia {
  const { dzien, moment } = dzienZlozeniaDoKosztu(termin, dzis);
  // K12 i K16 (Story 3.7.1.2.2): strata od miesiąca urodzenia, a za miesiąc urodzenia część kwoty proporcjonalna
  // do liczby dni od dnia urodzenia, zaokrąglona do 10 groszy w górę.
  const czescMiesiacaUrodzenia = regula.przesuniecieStartu < 0 && dataKotwicy !== undefined;
  const start = czescMiesiacaUrodzenia ? miesiacZDaty(dataKotwicy) : dodajMiesiaceDoMiesiaca(miesiacZDaty(termin), regula.przesuniecieStartu);
  const koniec = dodajMiesiaceDoMiesiaca(miesiacZDaty(dzien), -1);
  const rozbicie: { miesiac: MiesiacISO; kwotaNaDziecko: Grosze }[] = [];
  for (let m = start; m <= koniec && rozbicie.length < 240; m = dodajMiesiaceDoMiesiaca(m, 1)) {
    const kwotaMiesiaca = kwotaZeSlownika(katalog, regula.wpis, dataZMiesiaca(m), idWpisu);
    if (czescMiesiacaUrodzenia && m === start) {
      const dniMiesiaca = Number(ostatniDzienMiesiaca(dataKotwicy).slice(8, 10));
      const dniOdUrodzenia = dniMiesiaca - Number(dataKotwicy.slice(8, 10)) + 1;
      rozbicie.push({ miesiac: m, kwotaNaDziecko: Math.ceil((kwotaMiesiaca * dniOdUrodzenia) / dniMiesiaca / 10) * 10 });
    } else {
      rozbicie.push({ miesiac: m, kwotaNaDziecko: kwotaMiesiaca });
    }
  }
  const mnoznik = regula.naDziecko ? Math.max(liczbaDzieci, 1) : 1;
  const kwota = rozbicie.reduce((suma, r) => suma + r.kwotaNaDziecko, 0) * mnoznik;
  return { rodzaj: 'kwota', kwota, moment, rozbicie, liczbaDzieci: mnoznik };
}

/** Koszt spóźnienia sprawy z pozycji katalogu (identyfikator i koszt z katalogu, gdy pozycja w nim jest). */
export function kosztSprawy(
  idPozycji: IdPozycji,
  kosztKatalogu: KosztSpoznieniaPozycji | undefined,
  termin: DataISO | null,
  dzis: DataISO,
  katalog: Katalog,
  liczbaDzieci: number,
  dochod: Grosze | 'nieznany' | null,
  opcje: OpcjeKosztu = {},
): KosztSpoznienia {
  if (termin === null) return skutekSprawy(idPozycji, kosztKatalogu);
  const idWpisuKatalogu = kosztKatalogu?.typ === 'kwota' ? kosztKatalogu.idWpisuKwoty : undefined;
  const n = Math.max(liczbaDzieci, 1);

  const miesieczna = MIESIECZNE[idPozycji];
  if (miesieczna) return kosztMiesieczny(miesieczna, termin, dzis, katalog, n, idWpisuKatalogu, opcje.dataKotwicy);

  const { moment } = dzienZlozeniaDoKosztu(termin, dzis);
  const jednorazowa = JEDNORAZOWE[idPozycji];
  if (jednorazowa) {
    const mnoznik = jednorazowa.naDziecko ? n : 1;
    return { rodzaj: 'kwota', kwota: kwotaZeSlownika(katalog, jednorazowa.wpis, termin, idWpisuKatalogu) * mnoznik, moment, rozbicie: [], liczbaDzieci: mnoznik };
  }

  if (idPozycji === 'K01') {
    const nieznany = dochod === null || dochod === 'nieznany';
    const becikowe = nieznany || dochod <= kwotaZeSlownika(katalog, 'progBecikowego', termin);
    const dodatek = nieznany || dochod <= kwotaZeSlownika(katalog, 'progZasilkuRodzinnego', termin);
    const zaZyciem = opcje.zaZyciem === true;
    const kwota =
      ((becikowe ? kwotaZeSlownika(katalog, 'becikowe', termin) : 0) + (dodatek ? kwotaZeSlownika(katalog, 'dodatek', termin) : 0)) * n +
      (zaZyciem ? kwotaZeSlownika(katalog, 'zaZyciem', termin) : 0);
    if (kwota === 0) return { rodzaj: 'skutek', tekst: teksty.ViewDeadlines.skutki.K01 };
    const opis = teksty.ViewDeadlines.opisKosztu;
    const czesci = [becikowe ? opis.becikowe : null, dodatek ? opis.dodatek : null, zaZyciem ? opis.zaZyciem : null].filter((c) => c !== null);
    const tekst = becikowe && dodatek && !zaZyciem ? opis.becikoweIDodatek : opis.lista({ czesci });
    return { rodzaj: 'kwota', kwota, moment, rozbicie: [], liczbaDzieci: n, tekst };
  }

  // Pozycje dodane w panelu z kwotą ze słownika kwot i progów (w groszach).
  if (kosztKatalogu?.typ === 'kwota') {
    const mnoznik = kosztKatalogu.naDziecko ? n : 1;
    if (kosztKatalogu.sposob === 'za-miesiace') {
      const { dzien } = dzienZlozeniaDoKosztu(termin, dzis);
      const rozbicie: { miesiac: MiesiacISO; kwotaNaDziecko: Grosze }[] = [];
      const koniec = dodajMiesiaceDoMiesiaca(miesiacZDaty(dzien), -1);
      for (let m = miesiacZDaty(termin); m <= koniec && rozbicie.length < 240; m = dodajMiesiaceDoMiesiaca(m, 1)) {
        const kwotaMiesiaca = kwotaWpisuSlownika(katalog, kosztKatalogu.idWpisuKwoty, dataZMiesiaca(m));
        rozbicie.push({ miesiac: m, kwotaNaDziecko: kwotaMiesiaca ?? 0 });
      }
      const kwota = Math.max(rozbicie.reduce((s, r) => s + r.kwotaNaDziecko, 0) * mnoznik, kosztKatalogu.minimum ?? 0);
      return { rodzaj: 'kwota', kwota, moment, rozbicie, liczbaDzieci: mnoznik, tekst: kosztKatalogu.tekst };
    }
    const kwotaWpisu = kwotaWpisuSlownika(katalog, kosztKatalogu.idWpisuKwoty, termin);
    const kwota = kwotaWpisu !== null ? kwotaWpisu * mnoznik : (kosztKatalogu.minimum ?? 0);
    return { rodzaj: 'kwota', kwota, moment, rozbicie: [], liczbaDzieci: mnoznik, tekst: kosztKatalogu.tekst };
  }

  return skutekSprawy(idPozycji, kosztKatalogu);
}

/** Koszt spóźnienia ze sprawy katalogu, terminu i dochodu na osobę. */
export function wyliczKosztSpoznienia(
  pozycja: PozycjaKatalogu,
  termin: DataISO | null,
  dzis: DataISO,
  katalog: Katalog,
  liczbaDzieci: number,
  dochod: Grosze | 'nieznany' | null,
): KosztSpoznienia {
  return kosztSprawy(pozycja.id, pozycja.kosztSpoznienia, termin, dzis, katalog, liczbaDzieci, dochod);
}
