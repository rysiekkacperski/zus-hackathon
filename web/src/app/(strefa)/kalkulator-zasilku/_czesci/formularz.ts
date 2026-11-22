// Formularz danych wejściowych kalkulatora zasiłku macierzyńskiego (ViewCalcMaternityInput, u15).
// Czyste funkcje: uzupełnienie z profilu rodziny i konta ZUS, walidacja pól, budowa danych wejściowych silnika.
import { dodajDni, dodajLata, dodajMiesiace, formatujDate, parsujDate, porownajDaty } from '@/domena/daty';
import { walidujDaneWejsciowe } from '@/domena/kalkulatory';
import { plecZPesel } from '@/domena/pesel';
import { proponujFormeZatrudnienia } from '@/domena/profil/forma-zatrudnienia';
import { wiekGraniczny } from '@/domena/rodzina/przyjecie';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneDrugiegoRodzicaZKonta,
  DaneRodziny,
  DaneWejscioweKalkulatora,
  DaneZKontaZus,
  DataISO,
  FormaPrzyjecia,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  Katalog,
  KodKomunikatu,
  KontoPrzewodnika,
  LiczbaDzieci,
  TytulUbezpieczenia,
  ZrodloWartosciKalkulatora,
} from '@/domena/typy';

export type Zdarzenie = 'porod' | 'przewidywany-porod' | 'przyjecie';
export type RodzajStraty = 'martwe-urodzenie' | 'poronienie' | 'zgon-dziecka';
export type OpcjaFormyMatki =
  | 'umowa-o-prace'
  | 'umowa-zlecenia-z-dobrowolnym'
  | 'umowa-zlecenia-bez-dobrowolnego'
  | 'jdg-z-dobrowolnym'
  | 'jdg-bez-dobrowolnego'
  | 'umowa-o-prace-ustala-w-ciazy'
  | 'brak-tytulu';
export type OpcjaFormyDrugiego = Exclude<OpcjaFormyMatki, 'umowa-o-prace-ustala-w-ciazy'> | 'brak-drugiego-rodzica';

export const OPCJE_FORMY_MATKI: readonly OpcjaFormyMatki[] = [
  'umowa-o-prace',
  'umowa-zlecenia-z-dobrowolnym',
  'umowa-zlecenia-bez-dobrowolnego',
  'jdg-z-dobrowolnym',
  'jdg-bez-dobrowolnego',
  'umowa-o-prace-ustala-w-ciazy',
  'brak-tytulu',
];
export const OPCJE_FORMY_DRUGIEGO: readonly OpcjaFormyDrugiego[] = [
  'umowa-o-prace',
  'umowa-zlecenia-z-dobrowolnym',
  'umowa-zlecenia-bez-dobrowolnego',
  'jdg-z-dobrowolnym',
  'jdg-bez-dobrowolnego',
  'brak-tytulu',
  'brak-drugiego-rodzica',
];

export interface PoleF<T> {
  wartosc: T;
  zrodlo: ZrodloWartosciKalkulatora;
}

export interface FormularzKalkulatora {
  zdarzenie: PoleF<Zdarzenie | null>;
  dataPorodu: PoleF<string>;
  przewidywanyTermin: PoleF<string>;
  liczbaDzieci: PoleF<LiczbaDzieci>;
  zaZyciem: PoleF<boolean>;
  formaPrzyjecia: PoleF<FormaPrzyjecia | null>;
  dataPrzyjecia: PoleF<string>;
  dataUrodzeniaDziecka: PoleF<string>;
  odroczenie: PoleF<boolean>;
  wczesniactwo: PoleF<boolean>;
  tydzienCiazy: PoleF<string>;
  masaG: PoleF<string>;
  dniPobytu: PoleF<string>;
  strata: PoleF<boolean>;
  rodzajStraty: PoleF<RodzajStraty | null>;
  dataZgonu: PoleF<string>;
  liczbaDzieciStraty: PoleF<string>;
  formaMatki: PoleF<OpcjaFormyMatki | ''>;
  formaDrugiego: PoleF<OpcjaFormyDrugiego | ''>;
}

export type PoleFormularza = keyof FormularzKalkulatora;

// Kolejność pól na ekranie; pierwszy błąd w tej kolejności dostaje fokus.
export const KOLEJNOSC_POL: readonly PoleFormularza[] = [
  'zdarzenie',
  'dataPorodu',
  'przewidywanyTermin',
  'formaPrzyjecia',
  'dataPrzyjecia',
  'dataUrodzeniaDziecka',
  'liczbaDzieci',
  'tydzienCiazy',
  'masaG',
  'dniPobytu',
  'rodzajStraty',
  'dataZgonu',
  'liczbaDzieciStraty',
  'formaMatki',
  'formaDrugiego',
];

function pole<T>(wartosc: T, zrodlo: ZrodloWartosciKalkulatora): PoleF<T> {
  return { wartosc, zrodlo };
}

export function pustyFormularz(): FormularzKalkulatora {
  const d = 'wartosc-domyslna' as const;
  return {
    zdarzenie: pole(null, d),
    dataPorodu: pole('', d),
    przewidywanyTermin: pole('', d),
    liczbaDzieci: pole(1, d),
    zaZyciem: pole(false, d),
    formaPrzyjecia: pole(null, d),
    dataPrzyjecia: pole('', d),
    dataUrodzeniaDziecka: pole('', d),
    odroczenie: pole(false, d),
    wczesniactwo: pole(false, d),
    tydzienCiazy: pole('', d),
    masaG: pole('', d),
    dniPobytu: pole('', d),
    strata: pole(false, d),
    rodzajStraty: pole(null, d),
    dataZgonu: pole('', d),
    liczbaDzieciStraty: pole('1', d),
    formaMatki: pole('', d),
    formaDrugiego: pole('', d),
  };
}

/** Zmiana wartości w kalkulatorze: źródło „wartość wpisana w kalkulatorze”, profil rodziny bez zmian. */
export function zmienPole<P extends PoleFormularza>(
  f: FormularzKalkulatora,
  nazwa: P,
  wartosc: FormularzKalkulatora[P]['wartosc'],
): FormularzKalkulatora {
  // Wpisanie tej samej wartości zostawia dotychczasowe źródło, na przykład profil rodziny.
  if (JSON.stringify(f[nazwa].wartosc) === JSON.stringify(wartosc)) return f;
  return { ...f, [nazwa]: { wartosc, zrodlo: 'wartosc-w-kalkulatorze' } };
}

// --- Formy zatrudnienia -----------------------------------------------------------------------

export function opcjaFormy(
  forma: FormaZatrudnienia,
  dobrowolne: boolean | null | undefined,
): Exclude<OpcjaFormyMatki, 'umowa-o-prace-ustala-w-ciazy'> {
  switch (forma) {
    case 'umowa-o-prace':
      return 'umowa-o-prace';
    case 'umowa-zlecenia':
      return dobrowolne ? 'umowa-zlecenia-z-dobrowolnym' : 'umowa-zlecenia-bez-dobrowolnego';
    case 'jdg':
      return dobrowolne ? 'jdg-z-dobrowolnym' : 'jdg-bez-dobrowolnego';
    default:
      return 'brak-tytulu';
  }
}

export function formaZOpcji(o: OpcjaFormyMatki | OpcjaFormyDrugiego): {
  forma: FormaZatrudnieniaDrugiegoRodzica;
  dobrowolne: boolean;
} {
  switch (o) {
    case 'umowa-o-prace':
    case 'umowa-o-prace-ustala-w-ciazy':
      return { forma: 'umowa-o-prace', dobrowolne: false };
    case 'umowa-zlecenia-z-dobrowolnym':
      return { forma: 'umowa-zlecenia', dobrowolne: true };
    case 'umowa-zlecenia-bez-dobrowolnego':
      return { forma: 'umowa-zlecenia', dobrowolne: false };
    case 'jdg-z-dobrowolnym':
      return { forma: 'jdg', dobrowolne: true };
    case 'jdg-bez-dobrowolnego':
      return { forma: 'jdg', dobrowolne: false };
    case 'brak-drugiego-rodzica':
      return { forma: 'brak-drugiego-rodzica', dobrowolne: false };
    default:
      return { forma: 'brak-tytulu', dobrowolne: false };
  }
}

function czyTytulAktywny(t: TytulUbezpieczenia, dzien: DataISO): boolean {
  return porownajDaty(t.od, dzien) <= 0 && (!t.do || porownajDaty(t.do, dzien) >= 0);
}

const PIERWSZENSTWO_TYTULOW: Record<TytulUbezpieczenia['rodzaj'], number> = { pracownik: 0, dzialalnosc: 1, zleceniobiorca: 2 };

/** Tytuł z konta ZUS, który daje formę zatrudnienia: aktywny w dniu, pierwszeństwo UoP, JDG, umowa zlecenia. */
export function tytulGlowny(tytuly: readonly TytulUbezpieczenia[], dzien: DataISO): TytulUbezpieczenia | null {
  const aktywne = tytuly.filter((t) => czyTytulAktywny(t, dzien));
  const kandydaci = aktywne.length > 0 ? aktywne : [...tytuly];
  return [...kandydaci].sort((a, b) => PIERWSZENSTWO_TYTULOW[a.rodzaj] - PIERWSZENSTWO_TYTULOW[b.rodzaj])[0] ?? null;
}

export function formaZTytulu(t: TytulUbezpieczenia | null): { forma: FormaZatrudnienia; dobrowolne: boolean } {
  if (t === null) return { forma: 'brak-tytulu', dobrowolne: false };
  const dobrowolne = t.ubezpieczenieChorobowe.rodzaj === 'dobrowolne';
  if (t.rodzaj === 'pracownik') return { forma: 'umowa-o-prace', dobrowolne: false };
  if (t.rodzaj === 'dzialalnosc') return { forma: 'jdg', dobrowolne };
  return { forma: 'umowa-zlecenia', dobrowolne };
}

/** Forma zatrudnienia z konta ZUS: propozycja Profilu na start, a gdy jej brak, tytuł główny konta. */
export function formaZKontaZus(kopia: DaneZKontaZus, dzien: DataISO): OpcjaFormyMatki {
  const propozycja = proponujFormeZatrudnienia(kopia);
  if (propozycja) return opcjaFormy(propozycja.forma, propozycja.dobrowolne);
  if (kopia.tytuly.length === 0) return 'brak-tytulu';
  const f = formaZTytulu(tytulGlowny(kopia.tytuly, dzien));
  return opcjaFormy(f.forma, f.dobrowolne);
}

// --- Uzupełnienie danych wejściowych -----------------------------------------------------------

export interface WejscieUzupelnienia {
  // Null w trybie gościa: formularz startuje z wartości domyślnych.
  konto: KontoPrzewodnika | null;
  rodzina: { daneRodziny: DaneRodziny; daneCiazy: DaneCiazyIDziecka | null } | null;
  kopiaKonta: DaneZKontaZus | null;
  dzis: DataISO;
}

/**
 * Wartości pól ViewCalcMaternityInput ze źródłami: profil rodziny dla Rodzica i Drugiego rodzica, konto ZUS dla Nowego
 * użytkownika, wartości domyślne dla gościa.
 */
export function uzupelnijFormularz(w: WejscieUzupelnienia): FormularzKalkulatora {
  const f = pustyFormularz();
  if (w.konto === null) return f;
  if (w.rodzina === null || w.konto.rola === 'nowy-uzytkownik') {
    if (w.kopiaKonta !== null) {
      const opcja = formaZKontaZus(w.kopiaKonta, w.dzis);
      if (plecZPesel(w.konto.pesel) === 'kobieta') {
        f.formaMatki = pole(opcja, 'konto-zus');
      } else {
        f.formaDrugiego = pole(opcja === 'umowa-o-prace-ustala-w-ciazy' ? 'umowa-o-prace' : opcja, 'konto-zus');
      }
    }
    return f;
  }

  const p = 'profil-rodziny' as const;
  const { daneRodziny, daneCiazy } = w.rodzina;
  const matka = daneRodziny.matka;
  if (matka.formaZatrudnienia) {
    const ustala =
      matka.zmianaZatrudnienia?.rodzaj.wartosc === 'ustanie' &&
      ['upadlosc', 'likwidacja', 'smierc-pracodawcy', 'naruszenie-z-wyrokiem'].includes(
        matka.zmianaZatrudnienia.przyczyna?.wartosc ?? '',
      );
    f.formaMatki = pole(
      ustala ? 'umowa-o-prace-ustala-w-ciazy' : opcjaFormy(matka.formaZatrudnienia.wartosc, matka.dobrowolneChorobowe?.wartosc),
      p,
    );
  }
  const drugi = daneRodziny.drugiRodzic;
  if (drugi.formaZatrudnienia) {
    const forma = drugi.formaZatrudnienia.wartosc;
    f.formaDrugiego = pole(
      forma === 'brak-drugiego-rodzica' ? 'brak-drugiego-rodzica' : opcjaFormy(forma, drugi.dobrowolneChorobowe?.wartosc),
      p,
    );
  }

  if (daneCiazy === null) return f;
  if (daneCiazy.przyjecie) {
    const pr = daneCiazy.przyjecie;
    f.zdarzenie = pole('przyjecie', p);
    f.formaPrzyjecia = pole(pr.forma, p);
    f.dataPrzyjecia = pole(formatujDate(pr.dataPrzyjecia), p);
    f.dataUrodzeniaDziecka = pole(formatujDate(pr.dataUrodzeniaDziecka), p);
    f.odroczenie = pole(Boolean(pr.odroczenieObowiazkuSzkolnego), p);
    f.liczbaDzieci = pole(pr.liczbaPrzyjetychDzieci, p);
  } else if (daneCiazy.dataPorodu) {
    f.zdarzenie = pole('porod', p);
    f.dataPorodu = pole(formatujDate(daneCiazy.dataPorodu), p);
    f.liczbaDzieci = pole(daneCiazy.liczbaUrodzonychDzieci ?? daneCiazy.liczbaDzieciZCiazy ?? 1, p);
    const tydzien = daneCiazy.tydzienCiazyWDniuPorodu;
    const masa = daneCiazy.masaUrodzeniowaG;
    const wczesniactwo = (tydzien !== undefined && tydzien < 37) || (daneCiazy.dniHospitalizacji5do28 ?? 0) > 0;
    f.wczesniactwo = pole(wczesniactwo, p);
    if (tydzien !== undefined) f.tydzienCiazy = pole(String(tydzien), p);
    if (masa !== undefined) f.masaG = pole(String(masa), p);
    if (daneCiazy.dniHospitalizacji5do28 !== undefined) f.dniPobytu = pole(String(daneCiazy.dniHospitalizacji5do28), p);
  } else if (daneCiazy.przewidywanyTerminPorodu) {
    f.zdarzenie = pole('przewidywany-porod', p);
    f.przewidywanyTermin = pole(formatujDate(daneCiazy.przewidywanyTerminPorodu), p);
    f.liczbaDzieci = pole(daneCiazy.liczbaDzieciZCiazy ?? 1, p);
  }
  f.zaZyciem = pole(Boolean(daneCiazy.zaswiadczenieZaZyciem), p);

  const strata = [...daneCiazy.sytuacjeSzczegolne]
    .reverse()
    .find((s) => s.rodzaj === 'martwe-urodzenie' || s.rodzaj === 'poronienie' || s.rodzaj === 'zgon-dziecka');
  if (strata && f.zdarzenie.wartosc === 'porod') {
    f.strata = pole(true, p);
    f.rodzajStraty = pole(strata.rodzaj as RodzajStraty, p);
    if (strata.rodzaj === 'zgon-dziecka') f.dataZgonu = pole(formatujDate(strata.dataZdarzenia), p);
    f.liczbaDzieciStraty = pole(String(strata.liczbaDzieci ?? 1), p);
  }
  return f;
}

/** Formularz odtworzony z danych wejściowych zapisanych w stanie roboczym (powrót z wyniku przez „Zmień dane”). */
export function formularzZDanych(d: DaneWejscioweKalkulatora): FormularzKalkulatora {
  const f = pustyFormularz();
  f.zdarzenie = pole(d.zdarzenie.wartosc, d.zdarzenie.zrodlo);
  if (d.dataPorodu) f.dataPorodu = pole(formatujDate(d.dataPorodu.wartosc), d.dataPorodu.zrodlo);
  if (d.przewidywanyTerminPorodu)
    f.przewidywanyTermin = pole(formatujDate(d.przewidywanyTerminPorodu.wartosc), d.przewidywanyTerminPorodu.zrodlo);
  if (d.przyjecie) {
    const z = d.przyjecie.zrodlo;
    f.formaPrzyjecia = pole(d.przyjecie.wartosc.forma, z);
    f.dataPrzyjecia = pole(formatujDate(d.przyjecie.wartosc.dataPrzyjecia), z);
    f.dataUrodzeniaDziecka = pole(formatujDate(d.przyjecie.wartosc.dataUrodzeniaDziecka), z);
    f.odroczenie = pole(d.przyjecie.wartosc.odroczenie, z);
  }
  f.liczbaDzieci = pole(d.liczbaDzieci.wartosc, d.liczbaDzieci.zrodlo);
  f.zaZyciem = pole(d.zaZyciem.wartosc, d.zaZyciem.zrodlo);
  if (d.wczesniactwo) {
    const z = d.wczesniactwo.zrodlo;
    f.wczesniactwo = pole(true, z);
    f.tydzienCiazy = pole(String(d.wczesniactwo.wartosc.tydzienCiazy), z);
    f.masaG = pole(String(d.wczesniactwo.wartosc.masaG), z);
    f.dniPobytu = pole(String(d.wczesniactwo.wartosc.dniPobytu), z);
  }
  if (d.strata) {
    const z = d.strata.zrodlo;
    f.strata = pole(true, z);
    f.rodzajStraty = pole(d.strata.wartosc.rodzaj, z);
    if (d.strata.wartosc.dataZgonu) f.dataZgonu = pole(formatujDate(d.strata.wartosc.dataZgonu), z);
    f.liczbaDzieciStraty = pole(String(d.strata.wartosc.liczbaDzieci), z);
  }
  f.formaMatki = pole(opcjaFormy(d.formaMatki.wartosc.forma, d.formaMatki.wartosc.dobrowolne), d.formaMatki.zrodlo);
  const fd = d.formaDrugiegoRodzica.wartosc;
  f.formaDrugiego = pole(
    fd.forma === 'brak-drugiego-rodzica' ? 'brak-drugiego-rodzica' : opcjaFormy(fd.forma, fd.dobrowolne),
    d.formaDrugiegoRodzica.zrodlo,
  );
  return f;
}

// --- Walidacja -----------------------------------------------------------------------------------

export type KategoriaWczesniactwa = 'a' | 'b' | 'c';

function liczbaCalkowita(tekst: string): number | null {
  const t = tekst.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

/** Kategoria uzupełniającego urlopu: A do 27. tygodnia albo do 1000 g, B od 28. do 36. tygodnia, C od 37. tygodnia. */
export function kategoriaWczesniactwa(tydzien: number | null, masa: number | null): KategoriaWczesniactwa | null {
  if (tydzien === null || masa === null || tydzien < 22 || tydzien > 44 || masa < 300 || masa > 7000) return null;
  if (tydzien <= 27 || masa <= 1000) return 'a';
  if (tydzien <= 36) return 'b';
  return 'c';
}

export const MAKS_DNI_POBYTU: Record<KategoriaWczesniactwa, number> = { a: 105, b: 56, c: 52 };

/** Wiek graniczny przy przyjęciu dziecka: wartość z katalogu, a do czasu jej wpięcia 7, 10 albo 14 lat. */
export function wiekGranicznyPrzyjecia(forma: FormaPrzyjecia, odroczenie: boolean, katalog: Katalog): number {
  try {
    const wiek = wiekGraniczny(forma, odroczenie, katalog);
    if (Number.isFinite(wiek) && wiek > 0) return wiek;
  } catch {
    // Moduł Profilu rodziny bez wpiętego wieku granicznego: wartości ze słownika wymiarów i okresów.
  }
  if (forma === 'przysposobienie') return 14;
  return odroczenie ? 10 : 7;
}

export interface WynikWalidacji {
  bledy: BledyPol<PoleFormularza>;
  parametry: Partial<Record<PoleFormularza, Record<string, string>>>;
  // Komunikaty INFO, które zatrzymują wyliczenie (0091, 0092).
  informacje: Partial<Record<PoleFormularza, { kod: KodKomunikatu; parametry?: Record<string, string> }>>;
}

function walidujDate(
  tekst: string,
  kody: { pusta: KodKomunikatu },
): { data: DataISO } | { kod: KodKomunikatu } {
  if (tekst.trim() === '') return { kod: kody.pusta };
  const data = parsujDate(tekst);
  return data === null ? { kod: '0010' } : { data };
}

/** Walidacja pól ViewCalcMaternityInput z tabeli walidacji historyjki 3.10.4.1.1. */
export function walidujFormularz(f: FormularzKalkulatora, dzis: DataISO, katalog: Katalog): WynikWalidacji {
  const w: WynikWalidacji = { bledy: {}, parametry: {}, informacje: {} };
  const zdarzenie = f.zdarzenie.wartosc;
  if (zdarzenie === null) w.bledy.zdarzenie = '0006';

  let dataPorodu: DataISO | null = null;
  if (zdarzenie === 'przewidywany-porod') {
    const r = walidujDate(f.przewidywanyTermin.wartosc, { pusta: '0007' });
    if ('kod' in r) w.bledy.przewidywanyTermin = r.kod;
    else if (porownajDaty(r.data, dzis) < 0) w.bledy.przewidywanyTermin = '0008';
  }
  if (zdarzenie === 'porod') {
    const r = walidujDate(f.dataPorodu.wartosc, { pusta: '0018' });
    if ('kod' in r) w.bledy.dataPorodu = r.kod;
    else if (porownajDaty(r.data, dzis) > 0) w.bledy.dataPorodu = '0019';
    else dataPorodu = r.data;
  }
  if (zdarzenie === 'przyjecie') {
    const forma = f.formaPrzyjecia.wartosc;
    if (forma === null) w.bledy.formaPrzyjecia = '0006';
    else if (forma === 'rodzina-zastepcza-zawodowa') w.informacje.formaPrzyjecia = { kod: '0092' };
    let dataPrzyjecia: DataISO | null = null;
    const rp = walidujDate(f.dataPrzyjecia.wartosc, { pusta: '0088' });
    if ('kod' in rp) w.bledy.dataPrzyjecia = rp.kod;
    else if (porownajDaty(rp.data, dodajMiesiace(dzis, 12)) > 0) w.bledy.dataPrzyjecia = '0089';
    else dataPrzyjecia = rp.data;
    const ru = walidujDate(f.dataUrodzeniaDziecka.wartosc, { pusta: '0163' });
    if ('kod' in ru) w.bledy.dataUrodzeniaDziecka = ru.kod;
    else if (dataPrzyjecia !== null && porownajDaty(ru.data, dataPrzyjecia) > 0) w.bledy.dataUrodzeniaDziecka = '0090';
    else if (dataPrzyjecia !== null && forma !== null && forma !== 'rodzina-zastepcza-zawodowa') {
      const wiek = wiekGranicznyPrzyjecia(forma, f.odroczenie.wartosc, katalog);
      if (porownajDaty(dataPrzyjecia, dodajLata(ru.data, wiek)) >= 0) {
        w.informacje.dataUrodzeniaDziecka = { kod: '0091', parametry: { wiek: `${wiek} lat` } };
      }
    }
  }

  if (zdarzenie === 'porod' && f.wczesniactwo.wartosc) {
    const tydzien = liczbaCalkowita(f.tydzienCiazy.wartosc);
    const masa = liczbaCalkowita(f.masaG.wartosc);
    if (tydzien === null || tydzien < 22 || tydzien > 44) w.bledy.tydzienCiazy = '0021';
    if (masa === null || masa < 300 || masa > 7000) w.bledy.masaG = '0022';
    const kat = kategoriaWczesniactwa(tydzien, masa);
    const maks = MAKS_DNI_POBYTU[kat ?? 'a'];
    const dni = liczbaCalkowita(f.dniPobytu.wartosc);
    if (dni === null || dni > maks) {
      w.bledy.dniPobytu = '0164';
      w.parametry.dniPobytu = { liczbaDni: String(maks) };
    }
  }

  if (zdarzenie === 'porod' && f.strata.wartosc) {
    const rodzaj = f.rodzajStraty.wartosc;
    if (rodzaj === null) w.bledy.rodzajStraty = '0006';
    if (rodzaj === 'zgon-dziecka') {
      const rz = walidujDate(f.dataZgonu.wartosc, { pusta: '0167' });
      if ('kod' in rz) w.bledy.dataZgonu = rz.kod;
      else if (dataPorodu !== null && porownajDaty(rz.data, dataPorodu) < 0) w.bledy.dataZgonu = '0102';
      else if (porownajDaty(rz.data, dzis) > 0) w.bledy.dataZgonu = '0127';
    }
    const liczba = f.liczbaDzieci.wartosc;
    if (liczba > 1) {
      const n = liczbaCalkowita(f.liczbaDzieciStraty.wartosc);
      if (n === null || n < 1 || n > liczba) {
        w.bledy.liczbaDzieciStraty = '0168';
        w.parametry.liczbaDzieciStraty = { liczbaDzieci: String(liczba) };
      }
    }
  }

  if (f.formaMatki.wartosc === '') w.bledy.formaMatki = '0006';
  if (f.formaDrugiego.wartosc === '') w.bledy.formaDrugiego = '0006';
  return w;
}

export function czyPoprawny(w: WynikWalidacji): boolean {
  return Object.keys(w.bledy).length === 0 && Object.keys(w.informacje).length === 0;
}

/**
 * Kody pól do walidacji na bieżąco: błędy z walidacji formularza, komunikaty INFO, które zatrzymują wyliczenie
 * (0091, 0092), a przy poprawnym formularzu błędy silnika kalkulatora. Widok pokazuje kod INFO komunikatem pod polem.
 */
export function bledyFormularza(f: FormularzKalkulatora, dzis: DataISO, katalog: Katalog): BledyPol<PoleFormularza> {
  const w = walidujFormularz(f, dzis, katalog);
  const bledy: BledyPol<PoleFormularza> = { ...w.bledy };
  for (const p of KOLEJNOSC_POL) {
    const informacja = w.informacje[p];
    if (informacja && !bledy[p]) bledy[p] = informacja.kod;
  }
  if (!czyPoprawny(w)) return bledy;
  const dane = zbudujDaneWejsciowe(f);
  if (dane === null) return bledy;
  for (const [klucz, kod] of Object.entries(walidujDaneWejsciowe(dane, dzis))) {
    if (kod && (KOLEJNOSC_POL as readonly string[]).includes(klucz)) bledy[klucz as PoleFormularza] = kod;
  }
  return bledy;
}

/** Dane wejściowe silnika kalkulatora z poprawnego formularza. */
export function zbudujDaneWejsciowe(f: FormularzKalkulatora): DaneWejscioweKalkulatora | null {
  const zdarzenie = f.zdarzenie.wartosc;
  if (zdarzenie === null || f.formaMatki.wartosc === '' || f.formaDrugiego.wartosc === '') return null;
  const fm = formaZOpcji(f.formaMatki.wartosc);
  const d: DaneWejscioweKalkulatora = {
    zdarzenie: { wartosc: zdarzenie, zrodlo: f.zdarzenie.zrodlo },
    liczbaDzieci: { ...f.liczbaDzieci },
    zaZyciem: { ...f.zaZyciem },
    formaMatki: {
      wartosc: { forma: fm.forma === 'brak-drugiego-rodzica' ? 'brak-tytulu' : fm.forma, dobrowolne: fm.dobrowolne },
      zrodlo: f.formaMatki.zrodlo,
    },
    formaDrugiegoRodzica: { wartosc: formaZOpcji(f.formaDrugiego.wartosc), zrodlo: f.formaDrugiego.zrodlo },
  };
  if (zdarzenie === 'porod') {
    const data = parsujDate(f.dataPorodu.wartosc);
    if (data === null) return null;
    d.dataPorodu = { wartosc: data, zrodlo: f.dataPorodu.zrodlo };
    if (f.wczesniactwo.wartosc) {
      d.wczesniactwo = {
        wartosc: {
          tydzienCiazy: Number(f.tydzienCiazy.wartosc.trim()),
          masaG: Number(f.masaG.wartosc.trim()),
          dniPobytu: Number(f.dniPobytu.wartosc.trim()),
        },
        zrodlo: najnowszeZrodlo([f.wczesniactwo, f.tydzienCiazy, f.masaG, f.dniPobytu]),
      };
    }
    if (f.strata.wartosc && f.rodzajStraty.wartosc !== null) {
      const dataZgonu = f.rodzajStraty.wartosc === 'zgon-dziecka' ? parsujDate(f.dataZgonu.wartosc) : null;
      d.strata = {
        wartosc: {
          rodzaj: f.rodzajStraty.wartosc,
          ...(dataZgonu ? { dataZgonu } : {}),
          liczbaDzieci: f.liczbaDzieci.wartosc > 1 ? Number(f.liczbaDzieciStraty.wartosc.trim()) : 1,
        },
        zrodlo: najnowszeZrodlo([f.strata, f.rodzajStraty, f.dataZgonu, f.liczbaDzieciStraty]),
      };
    }
  }
  if (zdarzenie === 'przewidywany-porod') {
    const data = parsujDate(f.przewidywanyTermin.wartosc);
    if (data === null) return null;
    d.przewidywanyTerminPorodu = { wartosc: data, zrodlo: f.przewidywanyTermin.zrodlo };
  }
  if (zdarzenie === 'przyjecie') {
    const dataPrzyjecia = parsujDate(f.dataPrzyjecia.wartosc);
    const dataUrodzeniaDziecka = parsujDate(f.dataUrodzeniaDziecka.wartosc);
    if (dataPrzyjecia === null || dataUrodzeniaDziecka === null || f.formaPrzyjecia.wartosc === null) return null;
    d.przyjecie = {
      wartosc: {
        forma: f.formaPrzyjecia.wartosc,
        dataPrzyjecia,
        dataUrodzeniaDziecka,
        odroczenie: f.formaPrzyjecia.wartosc === 'rodzina-zastepcza-niezawodowa' && f.odroczenie.wartosc,
      },
      zrodlo: najnowszeZrodlo([f.formaPrzyjecia, f.dataPrzyjecia, f.dataUrodzeniaDziecka, f.odroczenie]),
    };
  }
  return d;
}

// Grupa pól ma jedno źródło: wartość wpisana w kalkulatorze, gdy którekolwiek pole zmieniono.
function najnowszeZrodlo(pola: PoleF<unknown>[]): ZrodloWartosciKalkulatora {
  return pola.some((p) => p.zrodlo === 'wartosc-w-kalkulatorze') ? 'wartosc-w-kalkulatorze' : (pola[0]?.zrodlo ?? 'wartosc-domyslna');
}

/** Data zdarzenia: poród, przewidywany termin porodu albo przyjęcie dziecka. */
export function dataZdarzenia(d: DaneWejscioweKalkulatora): DataISO | null {
  if (d.zdarzenie.wartosc === 'porod') return d.dataPorodu?.wartosc ?? null;
  if (d.zdarzenie.wartosc === 'przewidywany-porod') return d.przewidywanyTerminPorodu?.wartosc ?? null;
  return d.przyjecie?.wartosc.dataPrzyjecia ?? null;
}

/** Ostatni dzień wyboru wariantu 81,5%: 21. dzień po dniu porodu, przewidywanego terminu albo przyjęcia. */
export function terminWariantu81(d: DaneWejscioweKalkulatora): DataISO | null {
  const data = dataZdarzenia(d);
  return data === null ? null : dodajDni(data, 21);
}

/** Wariant 81,5% jest dostępny przy przewidywanym porodzie zawsze, po porodzie i przyjęciu do 21. dnia po zdarzeniu. */
export function czyWariant81Dostepny(d: DaneWejscioweKalkulatora, dzis: DataISO): boolean {
  if (d.zdarzenie.wartosc === 'przewidywany-porod') return true;
  const termin = terminWariantu81(d);
  return termin !== null && porownajDaty(dzis, termin) <= 0;
}

export type DaneZusRodzica = DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null;
