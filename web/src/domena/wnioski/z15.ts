// Kreator wniosku o zasiłek opiekuńczy Z-15 (epik 3.9.3). Właściciel: u30.
// Czyste reguły: dostęp do kreatora, osoby pod opieką, sytuacje opieki, kategorie i limity dni w roku kalendarzowym,
// wyłączenia dni, podstawa wymiaru i szacunkowa kwota, przedawnienie, płatnik zasiłku i załączniki.
import { dodajDni, dodajLata, dodajMiesiace, liczbaDniWlacznie, porownajDaty, wiekWLatach } from '@/domena/daty';
import type {
  DaneZKontaZus,
  DataISO,
  DniWRokuZ15,
  Grosze,
  IdWidoku,
  KategoriaLimituZ15,
  KontoPrzewodnika,
  OkresOpiekiZ15,
  OsobaPodOpiekaZ15,
  StanRodziny,
  StanZgody,
  SytuacjaOpiekiZ15,
  TytulUbezpieczenia,
  Wniosek,
  WniosekZ15,
  Zalacznik,
  ZaswiadczenieEzla,
} from '@/domena/typy';
import { czyKontoMatki } from '@/domena/wnioski/zas53';

export const PARAMETRY_Z15 = {
  limitLaczny: 60,
  limitLacznyBezKategorii60: 30,
  maksOkresow: 10,
  miesiaceBezChorobowego: 6,
  dniPowiadomieniaOZamknieciu: 7,
  dniOsmiuTygodni: 56,
  miesiacePrzedawnienia: 6,
  potracenieSkladek: 0.1371,
  stawka: 0.8,
  minimalnaPodstawa2026: 414710 as Grosze,
  minimalnaPodstawa2027: 427136 as Grosze,
  dataZmianyMinimalnejPodstawy: '2027-01-01' as DataISO,
} as const;

// --- Dostęp ---------------------------------------------------------------------------------------

function maChoroboweWDniu(t: TytulUbezpieczenia, dzien: DataISO): boolean {
  const ch = t.ubezpieczenieChorobowe;
  if (ch.rodzaj === 'brak') return false;
  const od = ch.od ?? t.od;
  const doDnia = [t.do, ch.do].filter((d): d is DataISO => d !== undefined).sort()[0];
  return porownajDaty(od, dzien) <= 0 && (doDnia === undefined || porownajDaty(dzien, doDnia) <= 0);
}

function maChoroboweWOkresie(t: TytulUbezpieczenia, od: DataISO, do_: DataISO): boolean {
  const ch = t.ubezpieczenieChorobowe;
  if (ch.rodzaj === 'brak') return false;
  const poczatek = ch.od ?? t.od;
  const koniec = [t.do, ch.do].filter((d): d is DataISO => d !== undefined).sort()[0];
  return porownajDaty(poczatek, do_) <= 0 && (koniec === undefined || porownajDaty(koniec, od) >= 0);
}

/** Tytuł z ubezpieczeniem chorobowym w dniu albo w 6 miesiącach przed nim. */
export function tytulZChorobowymZ15(kopia: DaneZKontaZus | null, dzis: DataISO): TytulUbezpieczenia | undefined {
  const tytuly = kopia?.tytuly ?? [];
  return (
    tytuly.find((t) => maChoroboweWDniu(t, dzis)) ??
    tytuly.find((t) => maChoroboweWOkresie(t, dodajMiesiace(dzis, -PARAMETRY_Z15.miesiaceBezChorobowego), dzis))
  );
}

export type DostepZ15 =
  | { dozwolony: true; tytul: TytulUbezpieczenia }
  | { dozwolony: false; kod: '0004' | '0298' };

export function sprawdzDostepZ15(w: { stanZgody: StanZgody; kopia: DaneZKontaZus | null; dzis: DataISO }): DostepZ15 {
  if (w.stanZgody !== 'udzielona') return { dozwolony: false, kod: '0004' };
  const tytul = tytulZChorobowymZ15(w.kopia, w.dzis);
  return tytul ? { dozwolony: true, tytul } : { dozwolony: false, kod: '0298' };
}

/** Dni okresów opieki bez ubezpieczenia chorobowego według danych konta ZUS (komunikat 0301). */
export function dniBezChorobowego(kopia: DaneZKontaZus | null, okresy: OkresOpiekiZ15[]): DataISO[] {
  const tytuly = kopia?.tytuly ?? [];
  return dniOkresow(okresy).filter((d) => !tytuly.some((t) => maChoroboweWDniu(t, d)));
}

// --- Osoby pod opieką -----------------------------------------------------------------------------

/** Dzieci z profilu i z członków rodziny w danych konta ZUS (bez powtórzeń) oraz drugi rodzic. */
export function osobyPodOpieka(
  rodzina: StanRodziny,
  konto: KontoPrzewodnika,
  kopia: DaneZKontaZus | null,
  drugiRodzicKonta?: { imie: string; nazwisko: string; pesel?: string },
): OsobaPodOpiekaZ15[] {
  const osoby: OsobaPodOpiekaZ15[] = [];
  const pesele = new Set<string>();
  for (const d of rodzina.daneCiazy?.dzieci ?? []) {
    if (!d.imie || !d.dataUrodzenia) continue;
    if (d.pesel) pesele.add(d.pesel);
    osoby.push({ imie: d.imie, nazwisko: d.nazwisko ?? '', pesel: d.pesel, dataUrodzenia: d.dataUrodzenia, pokrewienstwo: 'dziecko' });
  }
  for (const c of kopia?.czlonkowieRodziny ?? []) {
    if (pesele.has(c.pesel)) continue;
    if (wiekWLatach(c.dataUrodzenia, kopia?.odczytano.slice(0, 10) ?? c.dataUrodzenia) >= 18) continue;
    pesele.add(c.pesel);
    osoby.push({ imie: c.imie, nazwisko: c.nazwisko, pesel: c.pesel, dataUrodzenia: c.dataUrodzenia, pokrewienstwo: 'dziecko' });
  }
  const malzenstwo = rodzina.daneRodziny.stanCywilny?.wartosc === 'malzenstwo';
  const drugi = czyKontoMatki(konto, rodzina.daneRodziny)
    ? rodzina.daneRodziny.drugiRodzic.imie
      ? { imie: rodzina.daneRodziny.drugiRodzic.imie, nazwisko: rodzina.daneRodziny.drugiRodzic.nazwisko ?? '', pesel: rodzina.daneRodziny.drugiRodzic.pesel }
      : undefined
    : drugiRodzicKonta;
  if (drugi) {
    osoby.push({ imie: drugi.imie, nazwisko: drugi.nazwisko, pesel: drugi.pesel, pokrewienstwo: malzenstwo ? 'malzonek' : 'rodzic-dziecka' });
  }
  return osoby;
}

export function kluczOsoby(o: { imie: string; nazwisko: string; pesel?: string }): string {
  return o.pesel ?? `${o.imie} ${o.nazwisko}`;
}

// --- Sytuacje opieki ------------------------------------------------------------------------------

export const SYTUACJE_DZIECKA: readonly SytuacjaOpiekiZ15[] = [
  'chore-dziecko',
  'zamkniecie-placowki',
  'choroba-niani',
  'choroba-opiekuna-dziennego',
  'porod-choroba-drugiego-rodzica',
  'szpital-drugiego-rodzica',
  'izolacja-dziecka',
];

/** Maksymalny wiek dziecka (ukończone lata, wyłącznie) w sytuacji opieki; brak = bez ograniczenia. */
export function wiekGranicznySytuacji(s: SytuacjaOpiekiZ15, orzeczenie: boolean): number | null {
  switch (s) {
    case 'chore-dziecko':
      return orzeczenie ? 18 : null;
    case 'porod-choroba-drugiego-rodzica':
    case 'szpital-drugiego-rodzica':
      return orzeczenie ? 18 : 8;
    case 'zamkniecie-placowki':
    case 'choroba-niani':
    case 'choroba-opiekuna-dziennego':
    case 'izolacja-dziecka':
      return 8;
    default:
      return null;
  }
}

export function czyOjciecDziecka(konto: KontoPrzewodnika, rodzina: StanRodziny): boolean {
  return !czyKontoMatki(konto, rodzina.daneRodziny);
}

/** Sytuacje, których warunek osoba pod opieką spełnia w dniu otwarcia ekranu. */
export function sytuacjeDostepne(w: {
  osoba: OsobaPodOpiekaZ15 | undefined;
  orzeczenie: boolean;
  dzis: DataISO;
  ojciec: boolean;
  dataPorodu?: DataISO;
  dataPoroduPotwierdzona?: boolean;
}): SytuacjaOpiekiZ15[] {
  if (!w.osoba) return [];
  if (w.osoba.pokrewienstwo !== 'dziecko') return ['chory-malzonek'];
  const wiek = w.osoba.dataUrodzenia ? wiekWLatach(w.osoba.dataUrodzenia, w.dzis) : 0;
  const lista = SYTUACJE_DZIECKA.filter((s) => {
    const granica = wiekGranicznySytuacji(s, w.orzeczenie);
    return granica === null || wiek < granica;
  });
  if (w.ojciec && w.dataPoroduPotwierdzona && w.dataPorodu && w.osoba.dataUrodzenia === w.dataPorodu) {
    if (porownajDaty(w.dzis, ostatniDzienOsmegoTygodnia(w.dataPorodu)) <= 0) lista.push('dodatkowy-nowo-narodzone');
  }
  return lista;
}

export function czySytuacjaZZaswiadczeniem(s: SytuacjaOpiekiZ15 | undefined): boolean {
  return s === 'chore-dziecko' || s === 'chory-malzonek';
}

export function ostatniDzienOsmegoTygodnia(dataPorodu: DataISO): DataISO {
  return dodajDni(dataPorodu, PARAMETRY_Z15.dniOsmiuTygodni - 1);
}

/** Zakres dodatkowego zasiłku: od daty zdarzenia (nie wcześniej niż poród) do 8. tygodnia życia albo do wypisu. */
export function zakresDodatkowego(dataPorodu: DataISO, dataZdarzenia: DataISO, dataWypisu?: DataISO): { od: DataISO; do: DataISO } {
  const od = porownajDaty(dataZdarzenia, dataPorodu) < 0 ? dataPorodu : dataZdarzenia;
  const koniec = ostatniDzienOsmegoTygodnia(dataPorodu);
  const doDnia = dataWypisu && porownajDaty(dataWypisu, koniec) < 0 ? dataWypisu : koniec;
  return { od, do: doDnia };
}

/** Pierwszy dzień okresu, w którym dziecko przekracza wiek z warunku sytuacji (komunikat 0303). */
export function przekroczenieWieku(
  osoba: OsobaPodOpiekaZ15 | undefined,
  sytuacja: SytuacjaOpiekiZ15 | undefined,
  orzeczenie: boolean,
  okresy: OkresOpiekiZ15[],
): { wiek: number; urodziny: DataISO } | null {
  if (!osoba?.dataUrodzenia || !sytuacja) return null;
  const granica = wiekGranicznySytuacji(sytuacja, orzeczenie);
  if (granica === null) return null;
  const urodziny = dodajLata(osoba.dataUrodzenia, granica);
  return okresy.some((o) => porownajDaty(o.do, urodziny) >= 0) ? { wiek: granica, urodziny } : null;
}

// --- Zaświadczenia e-ZLA na opiekę ----------------------------------------------------------------

export function kluczZaswiadczeniaZ15(s: string | undefined): string {
  return (s ?? '').replace(/\s+/g, '').toUpperCase();
}

export function wyslaneWnioskiZ15(wnioski: Wniosek[]): WniosekZ15[] {
  return wnioski.filter((w): w is WniosekZ15 => w.rodzaj === 'z-15' && w.stan !== 'szkic');
}

/** Zaświadczenia na opiekę nad osobą: zgodna data urodzenia i stopień pokrewieństwa, bez objętych wcześniejszym wnioskiem. */
export function zaswiadczeniaNaOpieke(
  kopia: DaneZKontaZus | null,
  osoba: OsobaPodOpiekaZ15 | undefined,
  wnioski: Wniosek[],
  dzis: DataISO,
): ZaswiadczenieEzla[] {
  if (!osoba) return [];
  const objete = new Set(
    wyslaneWnioskiZ15(wnioski).flatMap((w) => w.okresy.map((o) => kluczZaswiadczeniaZ15(o.seriaINumer))).filter(Boolean),
  );
  const stopien = osoba.pokrewienstwo === 'dziecko' ? 'dziecko' : 'malzonek';
  return (kopia?.zaswiadczeniaEzla ?? [])
    .filter((z) => z.rodzaj === 'opieka' && porownajDaty(z.dataWystawienia, dzis) <= 0)
    .filter((z) => !z.czlonekRodziny || (z.czlonekRodziny.stopien === stopien && (!osoba.dataUrodzenia || z.czlonekRodziny.dataUrodzenia === osoba.dataUrodzenia)))
    .filter((z) => z.czlonekRodziny !== undefined || osoba.pokrewienstwo !== 'dziecko' || osoba.dataUrodzenia === undefined)
    .filter((z) => !objete.has(kluczZaswiadczeniaZ15(z.seriaINumer)))
    .sort((a, b) => porownajDaty(b.od, a.od));
}

/** Kolejny okres opieki nad tą samą osobą po wcześniejszym wniosku (komunikat 0300). */
export function czyKolejnyOkres(wniosek: WniosekZ15, wnioski: Wniosek[]): boolean {
  if (!wniosek.osoba || wniosek.okresy.length === 0) return false;
  const klucz = kluczOsoby(wniosek.osoba);
  const pierwszy = [...wniosek.okresy].sort((a, b) => porownajDaty(a.od, b.od))[0];
  return wyslaneWnioskiZ15(wnioski)
    .filter((w) => w.konto === wniosek.konto && w.osoba && kluczOsoby(w.osoba) === klucz)
    .some((w) => w.okresy.some((o) => dodajDni(o.do, 1) === pierwszy.od));
}

// --- Dni i limity ---------------------------------------------------------------------------------

/** Dni kalendarzowe okresów (każdy dzień raz), rosnąco. */
export function dniOkresow(okresy: OkresOpiekiZ15[]): DataISO[] {
  const dni = new Set<DataISO>();
  for (const o of okresy) {
    if (porownajDaty(o.od, o.do) > 0) continue;
    const n = liczbaDniWlacznie(o);
    for (let i = 0; i < n && i < 400; i++) dni.add(dodajDni(o.od, i));
  }
  return [...dni].sort();
}

/** Kategoria limitu dnia według sytuacji, wieku dziecka w tym dniu i orzeczenia. */
export function kategoriaDnia(
  sytuacja: SytuacjaOpiekiZ15,
  osoba: OsobaPodOpiekaZ15,
  orzeczenie: boolean,
  dzien: DataISO,
): KategoriaLimituZ15 {
  if (sytuacja === 'dodatkowy-nowo-narodzone') return 'poza-limitem';
  if (sytuacja === 'chory-malzonek') return 14;
  const wiek = osoba.dataUrodzenia ? wiekWLatach(osoba.dataUrodzenia, dzien) : 0;
  if (sytuacja === 'chore-dziecko') {
    if (wiek < 14) return 60;
    return orzeczenie && wiek < 18 ? 30 : 14;
  }
  if (sytuacja === 'porod-choroba-drugiego-rodzica' || sytuacja === 'szpital-drugiego-rodzica') return wiek < 8 ? 60 : 30;
  return 60;
}

function limitKategorii(k: KategoriaLimituZ15): number {
  return k === 'poza-limitem' ? 0 : k;
}

/** Dni wniosku po wyłączeniach: domownik (poza chorym dzieckiem do 2 lat), zwolnienia od pracy, dni drugiego rodzica. */
export function dniWnioskuPoWylaczeniach(wniosek: WniosekZ15, wnioski: Wniosek[]): { dni: DataISO[]; drugiegoRodzica: DataISO[] } {
  const wszystkie = dniOkresow(wniosek.okresy);
  const o = wniosek.oswiadczenia;
  const wylaczone = new Set<DataISO>(o.zwolnienieZWynagrodzeniem ? (o.dniZwolnienia ?? []) : []);
  if (o.domownik && wniosek.osoba && wniosek.sytuacja) {
    const doDwochLat = (d: DataISO) =>
      wniosek.sytuacja === 'chore-dziecko' && wniosek.osoba?.dataUrodzenia !== undefined && wiekWLatach(wniosek.osoba.dataUrodzenia, d) < 2;
    for (const d of o.dniDomownika ?? []) if (!doDwochLat(d)) wylaczone.add(d);
  }
  const drugiegoRodzica = new Set<DataISO>();
  if (wniosek.osoba) {
    const klucz = kluczOsoby(wniosek.osoba);
    for (const w of wyslaneWnioskiZ15(wnioski)) {
      if (w.konto === wniosek.konto || !w.osoba || kluczOsoby(w.osoba) !== klucz) continue;
      for (const d of dniOkresow(w.okresy)) if (wszystkie.includes(d)) drugiegoRodzica.add(d);
    }
  }
  return { dni: wszystkie.filter((d) => !wylaczone.has(d) && !drugiegoRodzica.has(d)), drugiegoRodzica: [...drugiegoRodzica] };
}

/** Dni wykorzystane w roku z wniosków Z-15 obojga rodziców (wysłanych i przygotowanych), bez dodatkowego zasiłku. */
function dniWykorzystaneZWnioskow(wnioski: Wniosek[], biezacy: WniosekZ15, rok: number): { kategoria: KategoriaLimituZ15; dzien: DataISO }[] {
  const wynik = new Map<string, { kategoria: KategoriaLimituZ15; dzien: DataISO }>();
  for (const w of wyslaneWnioskiZ15(wnioski)) {
    if (w.idWniosku === biezacy.idWniosku || w.sytuacja === 'dodatkowy-nowo-narodzone' || !w.osoba || !w.sytuacja) continue;
    for (const d of dniOkresow(w.okresy)) {
      if (Number(d.slice(0, 4)) !== rok) continue;
      wynik.set(`${w.konto}-${d}`, { kategoria: kategoriaDnia(w.sytuacja, w.osoba, w.orzeczenie ?? false, d), dzien: d });
    }
  }
  return [...wynik.values()];
}

/** Licznik dni w każdym roku kalendarzowym okresów wniosku. */
export function limityWRoku(wniosek: WniosekZ15, wnioski: Wniosek[]): DniWRokuZ15[] {
  if (!wniosek.osoba || !wniosek.sytuacja || wniosek.sytuacja === 'dodatkowy-nowo-narodzone') return [];
  const { dni } = dniWnioskuPoWylaczeniach(wniosek, wnioski);
  const lata = [...new Set(dniOkresow(wniosek.okresy).map((d) => Number(d.slice(0, 4))))].sort();
  const o = wniosek.oswiadczenia;
  return lata.map((rok) => {
    const dniRoku = dni.filter((d) => Number(d.slice(0, 4)) === rok);
    const kategoria = kategoriaDnia(wniosek.sytuacja!, wniosek.osoba!, wniosek.orzeczenie ?? false, dniRoku[0] ?? `${rok}-12-31`);
    const zWnioskow = dniWykorzystaneZWnioskow(wnioski, wniosek, rok);
    const dodatkowe =
      (o.poprzedniPlatnik === 'tak' ? (o.dniUPoprzedniegoPlatnika ?? 0) : 0) +
      (o.drugiRodzicZasilek ? Math.max(0, (o.dniDrugiegoRodzica ?? 0) - zWnioskow.filter((d) => d.dzien).length) : 0) +
      (o.innyCzlonekZasilek ? (o.dniInnegoCzlonka ?? 0) : 0);
    const wykorzystaneKategorii = zWnioskow.filter((d) => d.kategoria === kategoria).length + dodatkowe;
    const wykorzystaneWszystkie = zWnioskow.length + dodatkowe;
    const tylkoMniejsze = kategoria !== 60 && zWnioskow.every((d) => d.kategoria !== 60);
    const limitLaczny = tylkoMniejsze ? PARAMETRY_Z15.limitLacznyBezKategorii60 : PARAMETRY_Z15.limitLaczny;
    const limit = limitKategorii(kategoria);
    const dniPozostale = Math.max(0, Math.min(limit - wykorzystaneKategorii, limitLaczny - wykorzystaneWszystkie));
    return { rok, kategoria, limitKategorii: limit, limitLaczny, dniWniosku: dniRoku.length, dniWykorzystane: wykorzystaneWszystkie, dniPozostale };
  });
}

// --- Kwota ----------------------------------------------------------------------------------------

/** Podstawa wymiaru: średnia podstaw składek z 12 miesięcy przed miesiącem prawa, minus 13,71%, z minimalną podstawą pracownika. */
export function podstawaWymiaruZ15(tytul: TytulUbezpieczenia | undefined, pierwszyDzien: DataISO): Grosze | null {
  if (!tytul) return null;
  const miesiacPrawa = pierwszyDzien.slice(0, 7);
  const podstawy = tytul.podstawySkladek.filter((p) => p.miesiac < miesiacPrawa).slice(-12);
  if (podstawy.length === 0) return null;
  const srednia = podstawy.reduce((s, p) => s + p.kwota, 0) / podstawy.length;
  const podstawa = Math.round(srednia * (1 - PARAMETRY_Z15.potracenieSkladek));
  if (tytul.rodzaj !== 'pracownik') return podstawa;
  const minimalna =
    porownajDaty(pierwszyDzien, PARAMETRY_Z15.dataZmianyMinimalnejPodstawy) >= 0
      ? PARAMETRY_Z15.minimalnaPodstawa2027
      : PARAMETRY_Z15.minimalnaPodstawa2026;
  return Math.max(podstawa, minimalna);
}

export function stawkaDziennaZ15(podstawa: Grosze): Grosze {
  return Math.round((podstawa * PARAMETRY_Z15.stawka) / 30);
}

// --- Przedawnienie, płatnik, ekrany, załączniki ---------------------------------------------------

export function terminPrzedawnieniaZ15(okres: OkresOpiekiZ15): DataISO {
  return dodajMiesiace(okres.do, PARAMETRY_Z15.miesiacePrzedawnienia);
}

export function platnikZasilkuZ15(rodzina: StanRodziny, konto: KontoPrzewodnika, tytul: TytulUbezpieczenia | undefined): 'zus' | 'platnik-skladek' | 'nieustalony' {
  if (tytul?.rodzaj === 'dzialalnosc') return 'zus';
  const dane = czyKontoMatki(konto, rodzina.daneRodziny) ? rodzina.daneRodziny.matka : rodzina.daneRodziny.drugiRodzic;
  const p = dane.platnikZasilku?.wartosc;
  if (p === 'zus' || p === 'platnik-skladek') return p;
  if (tytul?.platnik.wyplacaZasilki === 'tak') return 'platnik-skladek';
  if (tytul?.platnik.wyplacaZasilki === 'nie') return 'zus';
  return 'nieustalony';
}

export const EKRANY_Z15: readonly IdWidoku[] = ['ViewZ15Situation', 'ViewZ15Statements', 'ViewZ15Data', 'ViewZ15Summary'];

/** Dokumenty wymagane dla sytuacji opieki (oświadczenia kreatora dołącza sam). */
export function zalacznikiZ15(w: WniosekZ15): Zalacznik[] {
  const lista: Zalacznik[] = [];
  w.okresy
    .filter((o) => o.trybAlternatywny)
    .forEach((o, i) => lista.push({ id: `alternatywne-${i + 1}`, rodzaj: 'zaswiadczenie-alternatywne', opis: o.seriaINumer, wymagany: true }));
  const wiek = w.osoba?.dataUrodzenia && w.okresy[0] ? wiekWLatach(w.osoba.dataUrodzenia, w.okresy[0].od) : 0;
  if (w.orzeczenie && ((w.sytuacja === 'chore-dziecko' && wiek >= 14) || ((w.sytuacja === 'porod-choroba-drugiego-rodzica' || w.sytuacja === 'szpital-drugiego-rodzica') && wiek >= 8))) {
    lista.push({ id: 'orzeczenie', rodzaj: 'orzeczenie', wymagany: true });
  }
  if (w.sytuacja === 'porod-choroba-drugiego-rodzica' || w.sytuacja === 'szpital-drugiego-rodzica') {
    lista.push({ id: 'zaswiadczenie-drugiego-rodzica', rodzaj: 'zaswiadczenie-drugiego-rodzica', wymagany: true });
  }
  if (w.sytuacja === 'izolacja-dziecka') lista.push({ id: 'decyzja-izolacji', rodzaj: 'decyzja-izolacji', wymagany: true });
  if (w.sytuacja === 'dodatkowy-nowo-narodzone' && w.sytuacjaMatki) {
    if (w.sytuacjaMatki.rodzaj === 'szpital') lista.push({ id: 'pobyt-matki', rodzaj: 'pobyt-matki', wymagany: true });
    if (w.sytuacjaMatki.rodzaj === 'niezdolnosc' || w.sytuacjaMatki.rodzaj === 'niepelnosprawnosc') {
      lista.push({ id: 'orzeczenie-matki', rodzaj: 'orzeczenie-matki', wymagany: true });
    }
  }
  return lista.map((z) => ({ ...z, plik: w.zalaczniki.find((p) => p.id === z.id)?.plik }));
}
