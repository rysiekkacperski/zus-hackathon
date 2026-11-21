// Warianty formularza wniosku o urlop: walidacja pól, okresy, ostrzeżenia, łączenie z pracą i wydłużenie
// (kontrakt, sekcje 7.2 i 11.2). Właściciel: u32. Epik 3.9.6, analiza 24, reguły R-4 do R-12, R-14 i sekcja 7.
import { dodajDni, dodajMiesiace, liczbaDniWlacznie, maxData, minData, parsujDate, porownajDaty } from '@/domena/daty';
import type {
  BledyPol,
  DataISO,
  KodKomunikatu,
  Okres,
  OkresWniosku,
  PodrodzajWnioskuOUrlop,
  WniosekOUrlop,
} from '@/domena/typy';
import {
  DNI_OJCOWSKIEGO,
  DNI_TERMINU_81_5,
  MAKS_CZESCI_RODZICIELSKIEGO,
  MIN_DNI_CZESCI_OJCOWSKIEGO,
  MIN_TYGODNI_NA_WARUNKACH,
  WYMIAR_MACIERZYNSKIEGO_TYGODNI,
  granicaRodzicielskiego,
  granicaWiekuPrzyjecia,
  koniecPoDniach,
  koniecPoTygodniach,
  koniecUrlopuPrzedRodzicielskim,
  okresUrlopuMacierzynskiego,
  ostrzezenieTerminu,
  stawkaOkresu,
  stawkaZasilku,
  wykorzystanieRodzicielskiego,
  wymiarRodzicielskiego,
  wyliczOkresyUrlopu,
  zakresPrzedPorodem,
  type DaneKreatora,
  type WykorzystanieRodzicielskiego,
} from '@/domena/wnioski/urlopy';

/** Odpowiedzi z formularza ViewLeaveRequestForm jako tekst wpisany przez użytkownika. */
export interface OdpowiedziFormularza {
  dataPoczatku: string;
  dataKonca: string;
  tygodnie: string;
  dni: string;
  zakres: NonNullable<WniosekOUrlop['zakres']> | null;
  zamiarDrugiegoRodzica: boolean | null;
  wczesniejszyOjcowski: 'nie' | '7-dni' | null;
  drugiRodzicBezUzupelniajacego: boolean;
  wymiarPracy: string;
  laczenieCzesciZWydluzenia: boolean | null;
  wymiarWCzesciZWydluzenia: string;
}

export type PoleFormularza =
  | 'dataPoczatku' | 'dataKonca' | 'tygodnie' | 'dni' | 'zakres' | 'zamiar' | 'ojcowskiWczesniej'
  | 'oswiadczenieUzupelniajacy' | 'wymiarPracy' | 'oswiadczenieLaczenia' | 'wymiarWydluzenia' | 'numerCzesci' | 'okres';

export interface WynikFormularza {
  bledy: BledyPol<PoleFormularza>;
  ostrzezenia: Partial<Record<PoleFormularza, KodKomunikatu>>;
  /** Informacja 0038 albo 0165 przy zakresie po terminie 81,5%. */
  informacjaZakresu?: KodKomunikatu;
  /** Zakres dat pola daty początku do podpowiedzi. */
  zakresDaty?: Okres;
  zakresDatyKonca?: Okres;
  zakresTygodni?: { min: number; max: number };
  zakresDni?: { min: number; max: number };
  okresy: OkresWniosku[];
  wariant?: '81-5' | '100-70';
  termin815?: { termin: DataISO; zostaloDni: number };
  rodzicielski?: WykorzystanieRodzicielskiego;
  wydluzenie?: NonNullable<WniosekOUrlop['laczenie']>;
  okresMacierzynskiego?: Okres | null;
  /** Zmiana szkicu po poprawnej walidacji. */
  zmiana?: Partial<WniosekOUrlop>;
}

export function pusteOdpowiedzi(): OdpowiedziFormularza {
  return {
    dataPoczatku: '', dataKonca: '', tygodnie: '', dni: '', zakres: null, zamiarDrugiegoRodzica: null,
    wczesniejszyOjcowski: null, drugiRodzicBezUzupelniajacego: false, wymiarPracy: '', laczenieCzesciZWydluzenia: null,
    wymiarWCzesciZWydluzenia: '',
  };
}

const CALKOWITA = /^\d{1,4}$/;

function liczba(tekst: string): number | null {
  const t = tekst.trim();
  return CALKOWITA.test(t) ? Number(t) : null;
}

/** Walidacja pola daty w kolejności: puste (0201), format (0010), zakres (0042). */
export function walidujDateUrlopu(tekst: string, zakres: Okres | null): { data: DataISO } | { kod: KodKomunikatu } {
  if (tekst.trim() === '') return { kod: '0201' };
  const data = parsujDate(tekst);
  if (data === null) return { kod: '0010' };
  if (zakres && (porownajDaty(data, zakres.od) < 0 || porownajDaty(data, zakres.do) > 0)) return { kod: '0042' };
  return { data };
}

function wLiczbie(tekst: string, min: number, max: number): number | null {
  const n = liczba(tekst);
  return n !== null && n >= min && n <= max ? n : null;
}

// --- R-14 Wydłużenie urlopu rodzicielskiego przy łączeniu z pracą -----------------------------------

/**
 * Wydłużenie urlopu rodzicielskiego przy łączeniu z pracą; null, gdy dane są niepełne.
 * Bez pracy w części z wydłużenia E = floor(d × w / 100); z pracą E = floor(floor(d × w / 100) × 100 / (100 − w2)).
 */
export function wyliczWydluzenie(w: {
  okres: Okres;
  wymiarPracy: number;
  koniecRodzicielskiego: DataISO;
  laczenieCzesciZWydluzenia: boolean;
  wymiarWCzesciZWydluzenia?: number;
}): NonNullable<WniosekOUrlop['laczenie']> | null {
  if (porownajDaty(w.okres.do, w.okres.od) < 0) return null;
  const dni = liczbaDniWlacznie(w.okres);
  const e1 = Math.floor((dni * w.wymiarPracy) / 100);
  let wydluzenie = e1;
  if (w.laczenieCzesciZWydluzenia) {
    const w2 = w.wymiarWCzesciZWydluzenia ?? w.wymiarPracy;
    if (w2 >= 100) return null;
    wydluzenie = Math.floor((e1 * 100) / (100 - w2));
  }
  const ostatniDzienUrlopu = dodajDni(w.koniecRodzicielskiego, wydluzenie);
  const okres = w.laczenieCzesciZWydluzenia ? { od: w.okres.od, do: ostatniDzienUrlopu } : w.okres;
  return { wymiarPracy: w.wymiarPracy, okres, dniLaczenia: dni, dniWydluzenia: wydluzenie, ostatniDzienUrlopu };
}

/** Okres wysłanego wniosku o urlop rodzicielski rodzica (do łączenia z pracą). */
export function okresWyslanegoRodzicielskiego(dane: DaneKreatora): Okres | null {
  const okresy = dane.wyslane
    .filter((w) => w.rodzic === dane.rodzic)
    .flatMap((w) => w.wniosek.okresy.filter((o) => o.rodzajUrlopu === 'rodzicielski'));
  if (okresy.length === 0) return null;
  return { od: minData(...okresy.map((o) => o.od)), do: maxData(...okresy.map((o) => o.do)) };
}

// --- Ocena formularza ---------------------------------------------------------------------------

/** Walidacja, okresy, ostrzeżenia i podpowiedzi formularza wybranego rodzaju wniosku. */
export function ocenFormularz(
  podrodzaj: PodrodzajWnioskuOUrlop,
  odp: OdpowiedziFormularza,
  dane: DaneKreatora,
  dzis: DataISO,
): WynikFormularza {
  const bledy: BledyPol<PoleFormularza> = {};
  const ostrzezenia: Partial<Record<PoleFormularza, KodKomunikatu>> = {};
  const wynik: WynikFormularza = { bledy, ostrzezenia, okresy: [] };

  switch (podrodzaj) {
    case 'czesc-przed-porodem': {
      if (!dane.przewidywanyTerminPorodu) break;
      const zakres = zakresPrzedPorodem(dane.przewidywanyTerminPorodu);
      wynik.zakresDaty = zakres;
      const d = walidujDateUrlopu(odp.dataPoczatku, zakres);
      if ('kod' in d) bledy.dataPoczatku = d.kod;
      else {
        wynik.okresy = wyliczOkresyUrlopu(podrodzaj, { od: d.data }, dane);
        wynik.zmiana = { okresy: wynik.okresy };
      }
      break;
    }
    case 'macierzynski-z-rodzicielskim': {
      wynik.okresMacierzynskiego = okresUrlopuMacierzynskiego(dane);
      const stawka = stawkaZasilku({ zakres: odp.zakres, dzis, dataPorodu: dane.dataPorodu });
      if (stawka.termin !== undefined && stawka.zostaloDni !== undefined) wynik.termin815 = { termin: stawka.termin, zostaloDni: stawka.zostaloDni };
      wynik.informacjaZakresu = stawka.kod;
      if (odp.zakres === null) bledy.zakres = '0006';
      if (odp.zakres === 'z-calym-rodzicielskim' && odp.zamiarDrugiegoRodzica === null) bledy.zamiar = '0006';
      wynik.wariant = stawka.stawka ?? undefined;
      if (odp.zakres !== null) {
        wynik.okresy = wyliczOkresyUrlopu(podrodzaj, { od: dane.dataPorodu ?? dzis, zakres: odp.zakres, wariant: wynik.wariant }, dane);
        wynik.zmiana = {
          okresy: wynik.okresy, zakres: odp.zakres, wariant: wynik.wariant, stawkaWSzkicu: wynik.wariant,
          oswiadczenia: { zamiarDrugiegoRodzica: odp.zakres === 'z-calym-rodzicielskim' ? odp.zamiarDrugiegoRodzica ?? undefined : undefined },
        };
      }
      break;
    }
    case 'rodzicielski': {
      const wyk = wykorzystanieRodzicielskiego(dane);
      wynik.rodzicielski = wyk;
      const poprzedni = koniecUrlopuPrzedRodzicielskim(dane);
      const urodzenie = dane.przyjecie?.dataUrodzeniaDziecka ?? dane.dziecko?.dataUrodzenia ?? dane.dataPorodu;
      if (poprzedni && urodzenie) {
        let granica = granicaRodzicielskiego(urodzenie);
        if (dane.przyjecie) granica = minData(granica, granicaWiekuPrzyjecia(dane.przyjecie));
        wynik.zakresDaty = { od: dodajDni(poprzedni, 1), do: granica };
      }
      wynik.zakresTygodni = { min: 1, max: Math.max(1, wyk.pozostalo) };
      if (wyk.numerCzesci > MAKS_CZESCI_RODZICIELSKIEGO) bledy.numerCzesci = '0096';
      const d = walidujDateUrlopu(odp.dataPoczatku, wynik.zakresDaty ?? null);
      if ('kod' in d) bledy.dataPoczatku = d.kod;
      const t = wLiczbie(odp.tygodnie, 1, wyk.pozostalo);
      if (t === null) bledy.tygodnie = '0061';
      if (odp.zamiarDrugiegoRodzica === null) bledy.zamiar = '0006';
      if ('data' in d) {
        const ostrz = ostrzezenieTerminu({ podrodzaj, dzis, poczatek: d.data });
        if (ostrz) ostrzezenia.dataPoczatku = ostrz.kod;
        if (t !== null && wynik.zakresDaty && porownajDaty(koniecPoTygodniach(d.data, t), wynik.zakresDaty.do) > 0) bledy.tygodnie = '0061';
      }
      if ('data' in d && t !== null) {
        wynik.okresy = wyliczOkresyUrlopu(podrodzaj, { od: d.data, tygodnie: t }, dane);
        wynik.zmiana = {
          okresy: wynik.okresy, numerCzesci: wyk.numerCzesci,
          oswiadczenia: { zamiarDrugiegoRodzica: odp.zamiarDrugiegoRodzica ?? undefined },
        };
      }
      break;
    }
    case 'ojcowski': {
      const urodzenie = dane.przyjecie?.dataUrodzeniaDziecka ?? dane.dataPorodu;
      if (!urodzenie) break;
      if (odp.wczesniejszyOjcowski === null) bledy.ojcowskiWczesniej = '0006';
      const minDni = odp.wczesniejszyOjcowski === '7-dni' ? 7 : MIN_DNI_CZESCI_OJCOWSKIEGO;
      const maxDni = odp.wczesniejszyOjcowski === '7-dni' ? 7 : DNI_OJCOWSKIEGO;
      wynik.zakresDni = { min: minDni, max: maxDni };
      let najwczesniej = dane.przyjecie ? dane.przyjecie.dataPrzyjecia : urodzenie;
      if (dane.dataPoczatkuZatrudnienia && porownajDaty(dane.dataPoczatkuZatrudnienia, najwczesniej) > 0) najwczesniej = dane.dataPoczatkuZatrudnienia;
      let granicaKonca = dodajDni(dodajMiesiace(urodzenie, 12), -1);
      if (dane.przyjecie?.dataUprawomocnienia) {
        granicaKonca = minData(dodajDni(dodajMiesiace(dane.przyjecie.dataUprawomocnienia, 12), -1), granicaWiekuPrzyjecia(dane.przyjecie));
      }
      const n = wLiczbie(odp.dni, minDni, maxDni);
      if (n === null) bledy.dni = '0202';
      const dniDoPodpowiedzi = n ?? maxDni;
      wynik.zakresDaty = { od: najwczesniej, do: dodajDni(granicaKonca, -(dniDoPodpowiedzi - 1)) };
      const d = walidujDateUrlopu(odp.dataPoczatku, wynik.zakresDaty);
      if ('kod' in d) bledy.dataPoczatku = d.kod;
      else {
        const ostrz = ostrzezenieTerminu({ podrodzaj, dzis, poczatek: d.data });
        if (ostrz) ostrzezenia.dataPoczatku = ostrz.kod;
      }
      if ('data' in d && n !== null) {
        wynik.okresy = [{ rodzajUrlopu: 'ojcowski', od: d.data, do: koniecPoDniach(d.data, n), dni: n, stawka: 100, rodzic: dane.rodzic }];
        wynik.zmiana = { okresy: wynik.okresy, oswiadczenia: { wczesniejszyOjcowski: odp.wczesniejszyOjcowski ?? undefined } };
      }
      break;
    }
    case 'uzupelniajacy': {
      const mac = okresUrlopuMacierzynskiego(dane);
      wynik.okresMacierzynskiego = mac;
      const maks = dane.wymiarK11 ?? 8;
      wynik.zakresTygodni = { min: 1, max: maks };
      const t = wLiczbie(odp.tygodnie, 1, maks);
      if (t === null) bledy.tygodnie = '0061';
      if (!odp.drugiRodzicBezUzupelniajacego) bledy.oswiadczenieUzupelniajacy = '0043';
      const ostrz = ostrzezenieTerminu({ podrodzaj, dzis, koniecMacierzynskiego: mac?.do ?? null });
      if (ostrz) ostrzezenia.okres = ostrz.kod;
      if (mac && t !== null) {
        const od = dodajDni(mac.do, 1);
        wynik.okresy = [{ rodzajUrlopu: 'uzupelniajacy', od, do: koniecPoTygodniach(od, t), tygodnie: t, stawka: 100, rodzic: dane.rodzic }];
        wynik.zmiana = { okresy: wynik.okresy, oswiadczenia: { drugiRodzicBezUzupelniajacego: odp.drugiRodzicBezUzupelniajacego } };
      }
      break;
    }
    case 'na-warunkach-macierzynskiego': {
      const p = dane.przyjecie;
      if (!p) break;
      wynik.zakresDaty = { od: p.dataPrzyjecia, do: dodajDni(p.dataPrzyjecia, DNI_TERMINU_81_5) };
      const stawka = stawkaZasilku({ zakres: odp.zakres, dzis, przyjecie: p });
      if (stawka.termin !== undefined && stawka.zostaloDni !== undefined) wynik.termin815 = { termin: stawka.termin, zostaloDni: stawka.zostaloDni };
      wynik.informacjaZakresu = stawka.kod;
      wynik.wariant = stawka.stawka ?? undefined;
      if (odp.zakres === null) bledy.zakres = '0006';
      const d = walidujDateUrlopu(odp.dataPoczatku, wynik.zakresDaty);
      if ('kod' in d) bledy.dataPoczatku = d.kod;
      const ostrz = ostrzezenieTerminu({ podrodzaj, dzis, dataPrzyjecia: p.dataPrzyjecia });
      if (ostrz) ostrzezenia.dataPoczatku = ostrz.kod;
      if ('data' in d && odp.zakres !== null) {
        const wymiar = WYMIAR_MACIERZYNSKIEGO_TYGODNI[p.liczbaPrzyjetychDzieci];
        const granica = granicaWiekuPrzyjecia(p);
        const koniec = maxData(minData(koniecPoTygodniach(d.data, wymiar), granica), koniecPoTygodniach(d.data, MIN_TYGODNI_NA_WARUNKACH));
        const okresy: OkresWniosku[] = [{
          rodzajUrlopu: 'na-warunkach-macierzynskiego', od: d.data, do: koniec, tygodnie: wymiar,
          stawka: stawkaOkresu('na-warunkach-macierzynskiego', wynik.wariant), rodzic: dane.rodzic,
        }];
        if (odp.zakres === 'z-calym-rodzicielskim') {
          const { naRodzica } = wymiarRodzicielskiego(p.liczbaPrzyjetychDzieci, dane.zaZyciem);
          const od = dodajDni(koniec, 1);
          okresy.push({ rodzajUrlopu: 'rodzicielski', od, do: koniecPoTygodniach(od, naRodzica), tygodnie: naRodzica, stawka: stawkaOkresu('rodzicielski', wynik.wariant), rodzic: dane.rodzic });
        }
        wynik.okresy = okresy;
        wynik.zmiana = { okresy, zakres: odp.zakres, wariant: wynik.wariant, stawkaWSzkicu: wynik.wariant };
      }
      break;
    }
    case 'laczenie-z-praca': {
      const okresRodz = okresWyslanegoRodzicielskiego(dane);
      if (!okresRodz) break;
      wynik.zakresDaty = okresRodz;
      wynik.zakresDatyKonca = okresRodz;
      const w = wLiczbie(odp.wymiarPracy, 1, 50);
      if (w === null) bledy.wymiarPracy = '0098';
      const od = walidujDateUrlopu(odp.dataPoczatku, okresRodz);
      if ('kod' in od) bledy.dataPoczatku = od.kod;
      else {
        const ostrz = ostrzezenieTerminu({ podrodzaj, dzis, poczatek: od.data });
        if (ostrz) ostrzezenia.dataPoczatku = ostrz.kod;
      }
      let doDnia = walidujDateUrlopu(odp.dataKonca, okresRodz);
      if ('data' in doDnia && 'data' in od && porownajDaty(doDnia.data, od.data) < 0) doDnia = { kod: '0110' };
      if ('kod' in doDnia) bledy.dataKonca = doDnia.kod;
      if (odp.laczenieCzesciZWydluzenia === null) bledy.oswiadczenieLaczenia = '0006';
      let w2: number | undefined;
      if (odp.laczenieCzesciZWydluzenia === true) {
        const n = wLiczbie(odp.wymiarWCzesciZWydluzenia, 1, 50);
        if (n === null) bledy.wymiarWydluzenia = '0098';
        else w2 = n;
      }
      if (w !== null && 'data' in od && 'data' in doDnia && odp.laczenieCzesciZWydluzenia !== null) {
        const wyd = wyliczWydluzenie({
          okres: { od: od.data, do: doDnia.data }, wymiarPracy: w, koniecRodzicielskiego: okresRodz.do,
          laczenieCzesciZWydluzenia: odp.laczenieCzesciZWydluzenia, wymiarWCzesciZWydluzenia: w2,
        });
        if (wyd) {
          wynik.wydluzenie = wyd;
          wynik.okresy = [{ rodzajUrlopu: 'laczenie-z-praca', od: wyd.okres.od, do: wyd.okres.do, dni: wyd.dniLaczenia, rodzic: dane.rodzic }];
          wynik.zmiana = {
            okresy: wynik.okresy, laczenie: wyd,
            oswiadczenia: { laczenieCzesciZWydluzenia: odp.laczenieCzesciZWydluzenia, wymiarWCzesciZWydluzenia: w2 },
          };
        }
      }
      break;
    }
    default:
      break;
  }
  return wynik;
}

/** Czy formularz nie ma błędów. */
export function czyPoprawny(w: WynikFormularza): boolean {
  return Object.keys(w.bledy).length === 0 && w.zmiana !== undefined;
}

/** Odpowiedzi formularza odtworzone z zapisanego szkicu. */
export function odpowiedziZeSzkicu(wniosek: WniosekOUrlop, formatuj: (d: DataISO) => string): OdpowiedziFormularza {
  const odp = pusteOdpowiedzi();
  const pierwszy = wniosek.okresy[0];
  odp.zakres = wniosek.zakres ?? null;
  odp.zamiarDrugiegoRodzica = wniosek.oswiadczenia.zamiarDrugiegoRodzica ?? null;
  odp.wczesniejszyOjcowski = wniosek.oswiadczenia.wczesniejszyOjcowski ?? null;
  odp.drugiRodzicBezUzupelniajacego = wniosek.oswiadczenia.drugiRodzicBezUzupelniajacego ?? false;
  odp.laczenieCzesciZWydluzenia = wniosek.oswiadczenia.laczenieCzesciZWydluzenia ?? null;
  if (wniosek.oswiadczenia.wymiarWCzesciZWydluzenia !== undefined) odp.wymiarWCzesciZWydluzenia = String(wniosek.oswiadczenia.wymiarWCzesciZWydluzenia);
  if (wniosek.laczenie) {
    odp.wymiarPracy = String(wniosek.laczenie.wymiarPracy);
    odp.dataPoczatku = formatuj(wniosek.laczenie.okres.od);
    const koniec = dodajDni(wniosek.laczenie.okres.od, wniosek.laczenie.dniLaczenia - 1);
    odp.dataKonca = formatuj(koniec);
    return odp;
  }
  if (pierwszy && wniosek.podrodzaj !== 'macierzynski-z-rodzicielskim' && wniosek.podrodzaj !== 'uzupelniajacy') {
    odp.dataPoczatku = formatuj(pierwszy.od);
  }
  if (pierwszy?.tygodnie !== undefined && (wniosek.podrodzaj === 'rodzicielski' || wniosek.podrodzaj === 'uzupelniajacy')) odp.tygodnie = String(pierwszy.tygodnie);
  if (pierwszy?.dni !== undefined && wniosek.podrodzaj === 'ojcowski') odp.dni = String(pierwszy.dni);
  return odp;
}

/** Odpowiedzi proponowane przy pierwszym otwarciu formularza (R-7, R-8, R-14, R-18). */
export function odpowiedziProponowane(
  podrodzaj: PodrodzajWnioskuOUrlop,
  dane: DaneKreatora,
  propozycja: Partial<WniosekOUrlop>,
  formatuj: (d: DataISO) => string,
): OdpowiedziFormularza {
  const odp = pusteOdpowiedzi();
  if (propozycja.oswiadczenia?.wczesniejszyOjcowski) odp.wczesniejszyOjcowski = propozycja.oswiadczenia.wczesniejszyOjcowski;
  if (podrodzaj === 'uzupelniajacy' && dane.wymiarK11) odp.tygodnie = String(dane.wymiarK11);
  if (podrodzaj === 'ojcowski' && odp.wczesniejszyOjcowski === '7-dni') odp.dni = '7';
  if (podrodzaj === 'rodzicielski') {
    const poprzedni = koniecUrlopuPrzedRodzicielskim(dane);
    if (poprzedni && wykorzystanieRodzicielskiego(dane).numerCzesci === 1) odp.dataPoczatku = formatuj(dodajDni(poprzedni, 1));
  }
  return odp;
}
