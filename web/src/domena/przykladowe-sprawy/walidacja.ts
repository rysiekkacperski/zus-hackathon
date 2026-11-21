// Walidacja danych przykładowej sprawy i model formularza ViewSampleCaseData (kontrakt, sekcja 7.2).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Kolejność kontroli: format i wartości pól, potem kompletność danych do weryfikacji (0109).
// Klucze błędów są identyfikatorami pól formularza, więc widok pokazuje błąd przy właściwym polu.
import { formatujDate, parsujDate, porownajDaty } from '@/domena/daty';
import { parsujKwote } from '@/domena/kwoty';
import { walidujPesel } from '@/domena/pesel';
import { wartoscPola, zWartoscia } from '@/domena/przykladowe-sprawy/scalanie';
import type {
  BledyPol,
  DaneSprawy,
  DataISO,
  Grosze,
  KodKomunikatu,
  LiczbaDzieci,
  MiesiacISO,
  Okres,
  OkresOtwarty,
  RodzajUrlopu,
  RozstrzygniecieSprawy,
  SprawaPrzykladowa,
} from '@/domena/typy';

export const POLA_PROSTE = [
  'imie', 'nazwisko', 'pesel', 'rola', 'tytulRodzaj', 'tytulOd', 'tytulDo', 'etat', 'liczbaUb', 'rodzajCh',
  'przyczyna', 'inneZatrudnienie', 'pracaPoUstaniu', 'zdarzenie', 'porod', 'termin', 'dzieci', 'martwe',
  'niezdolnoscOd', 'niezdolnoscDo', 'niezdolnoscKod', 'tydzien', 'masa', 'pobytOd', 'pobytDo', 'zaZyciem',
  'zlozenie', 'oswiadczenie', 'matkaOd', 'matkaDo', 'popPodstawa', 'popKoniec', 'dlug',
] as const;

export type PoleProste = (typeof POLA_PROSTE)[number];

export interface OkresFormularza { od: string; do: string }
export interface OkresWnioskuFormularza { rodzajUrlopu: string; od: string; do: string }
export interface KwotaFormularza { miesiac: MiesiacISO; kwota: string }
export interface RozstrzygniecieFormularza { swiadczenie: string; prawo: string; platnik: string; od: string; do: string; stawka: string; kwota: string }

/** Teksty wpisane w polach ekranu ViewSampleCaseData. */
export interface FormularzSprawy {
  pola: Record<PoleProste, string>;
  okresyChorobowe: OkresFormularza[];
  okresyWniosku: OkresWnioskuFormularza[];
  swiadczeniaWniosku: string[];
  kwoty: KwotaFormularza[];
  rozstrzygniecie: RozstrzygniecieFormularza[];
}

/** Identyfikator pola błędu braku okresu podlegania (0109 przy okresach). */
export const POLE_OKRESOW_CHOROBOWYCH = 'okresy-chorobowe';

export function idOkresuChorobowego(i: number, koniec: 'od' | 'do'): string { return `ok-${i}-${koniec}`; }
export function idOkresuWniosku(i: number, pole: 'rodzaj' | 'od' | 'do'): string { return `url-${i}-${pole}`; }
export function idKwoty(i: number): string { return `m-${i}`; }
export function idSwiadczeniaWniosku(i: number): string { return `swiadczenie-${i}`; }
export function idRozstrzygniecia(i: number, pole: 'sw' | 'prawo' | 'platnik' | 'od' | 'do' | 'stawka' | 'kwota'): string { return `r-${i}-${pole}`; }

// --- Formatowanie wartości do pól ---------------------------------------------------------------

/** Data DD.MM.RRRR albo pusty tekst. */
export function dataDoPola(d: DataISO | null | undefined): string {
  return d ? formatujDate(d) : '';
}

/** Kwota w polu bez separatora tysięcy: 700000 → „7000,00”. */
export function kwotaDoPola(g: Grosze | null | undefined): string {
  if (g === null || g === undefined) return '';
  return (g / 100).toFixed(2).replace('.', ',');
}

function tekst(w: unknown): string {
  return w === null || w === undefined ? '' : String(w);
}

function takNie(w: unknown): string {
  return w === true ? 'tak' : w === false ? 'nie' : '';
}

/** Formularz z wartościami bieżącej sprawy. */
export function formularzZeSprawy(sprawa: SprawaPrzykladowa): FormularzSprawy {
  const d = sprawa.dane;
  const niezdolnosc = d.zdarzenie.niezdolnosc.wartosc;
  return {
    pola: {
      imie: tekst(d.ubezpieczony.imie.wartosc),
      nazwisko: tekst(d.ubezpieczony.nazwisko.wartosc),
      pesel: tekst(d.ubezpieczony.pesel.wartosc),
      rola: tekst(d.ubezpieczony.rola.wartosc),
      tytulRodzaj: tekst(d.tytul.rodzaj.wartosc),
      tytulOd: dataDoPola(d.tytul.od.wartosc),
      tytulDo: dataDoPola(d.tytul.dataUstania.wartosc),
      etat: tekst(d.wymiarCzasuPracy.wartosc),
      liczbaUb: tekst(d.liczbaUbezpieczonychPlatnika.wartosc),
      rodzajCh: tekst(d.ubezpieczenieChorobowe.rodzaj.wartosc),
      przyczyna: tekst(d.ustanieZatrudnienia.przyczyna.wartosc),
      inneZatrudnienie: takNie(d.ustanieZatrudnienia.inneZatrudnienie.wartosc),
      pracaPoUstaniu: takNie(d.pracaPoUstaniu.wartosc),
      zdarzenie: tekst(d.zdarzenie.rodzaj.wartosc),
      porod: dataDoPola(d.zdarzenie.dataPorodu.wartosc),
      termin: dataDoPola(d.zdarzenie.przewidywanyTermin.wartosc),
      dzieci: tekst(d.zdarzenie.liczbaDzieci.wartosc),
      martwe: tekst(d.zdarzenie.liczbaMartwych.wartosc),
      niezdolnoscOd: dataDoPola(niezdolnosc?.od),
      niezdolnoscDo: dataDoPola(niezdolnosc?.do),
      niezdolnoscKod: niezdolnosc?.kod ?? '',
      tydzien: tekst(d.dziecko.tydzienCiazy.wartosc),
      masa: tekst(d.dziecko.masaG.wartosc),
      pobytOd: dataDoPola(d.dziecko.pobyt.wartosc?.od),
      pobytDo: dataDoPola(d.dziecko.pobyt.wartosc?.do),
      zaZyciem: dataDoPola(d.dziecko.zaZyciem.wartosc),
      zlozenie: dataDoPola(d.wniosek.dataZlozenia.wartosc),
      oswiadczenie: takNie(d.wniosek.oswiadczeniePelnyWymiar.wartosc),
      matkaOd: dataDoPola(d.wniosek.okresMatki.wartosc?.od),
      matkaDo: dataDoPola(d.wniosek.okresMatki.wartosc?.do),
      popPodstawa: kwotaDoPola(d.poprzedniZasilek.wartosc?.podstawa),
      popKoniec: dataDoPola(d.poprzedniZasilek.wartosc?.dataKonca),
      dlug: kwotaDoPola(d.zadluzenieJdg.wartosc?.kwota),
    },
    okresyChorobowe: (d.ubezpieczenieChorobowe.okresy.wartosc ?? []).map((o) => ({ od: dataDoPola(o.od), do: dataDoPola(o.do) })),
    okresyWniosku: (d.wniosek.okresy.wartosc ?? []).map((o) => ({ rodzajUrlopu: o.rodzajUrlopu, od: dataDoPola(o.od), do: dataDoPola(o.do) })),
    swiadczeniaWniosku: [...(d.wniosek.swiadczenia.wartosc ?? [])],
    kwoty: (d.kwotyMiesieczne.wartosc ?? []).map((k) => ({ miesiac: k.miesiac, kwota: kwotaDoPola(k.kwota) })),
    rozstrzygniecie: sprawa.rozstrzygniecie.map((r) => ({
      swiadczenie: r.swiadczenie,
      prawo: r.prawo,
      platnik: r.platnik ?? '',
      od: dataDoPola(r.okres?.od),
      do: dataDoPola(r.okres?.do),
      stawka: r.stawka === undefined ? '' : String(r.stawka),
      kwota: kwotaDoPola(r.miesiecznaKwota),
    })),
  };
}

// --- Walidacja tekstów ----------------------------------------------------------------------------

function sprawdzDate(t: string, pole: string, bledy: BledyPol<string>): DataISO | null {
  if (t.trim() === '') return null;
  const data = parsujDate(t);
  if (data === null) bledy[pole] = '0010';
  return data;
}

function sprawdzKwote(t: string, pole: string, bledy: BledyPol<string>, wymagana: boolean): Grosze | null {
  if (t.trim() === '') {
    if (wymagana) bledy[pole] = '0048';
    return null;
  }
  const kwota = parsujKwote(t);
  if (kwota === null) bledy[pole] = '0016';
  return kwota;
}

function liczbaCalkowita(t: string): number | null {
  const zapis = t.trim();
  return /^\d+$/.test(zapis) ? Number(zapis) : null;
}

function sprawdzKoniec(od: DataISO | null, do_: DataISO | null, pole: string, bledy: BledyPol<string>): void {
  if (od !== null && do_ !== null && porownajDaty(do_, od) < 0 && bledy[pole] === undefined) bledy[pole] = '0110';
}

function wymagajWyboru(wartosc: string, pole: string, bledy: BledyPol<string>): void {
  if (wartosc === '' && bledy[pole] === undefined) bledy[pole] = '0006';
}

/** Czy sprawa zawiera dokument danego rodzaju. */
function maDokument(sprawa: SprawaPrzykladowa, rodzaj: string): boolean {
  return sprawa.dokumenty.some((d) => d.rodzaj === rodzaj);
}

/**
 * Błędy pól formularza: PESEL (0024–0026), pola wyboru (0006), daty (0010, 0110), kwoty (0016, 0048),
 * dane dziecka (0021, 0022), a przy poprawnych polach kompletność danych do weryfikacji (0109).
 */
export function walidujFormularzSprawy(f: FormularzSprawy, sprawa: SprawaPrzykladowa): BledyPol<string> {
  const bledy: BledyPol<string> = {};
  const p = f.pola;

  const pesel = walidujPesel(p.pesel);
  if (!pesel.ok) bledy.pesel = pesel.kod;
  wymagajWyboru(p.rola, 'rola', bledy);
  wymagajWyboru(p.tytulRodzaj, 'tytulRodzaj', bledy);
  wymagajWyboru(p.rodzajCh, 'rodzajCh', bledy);
  wymagajWyboru(p.zdarzenie, 'zdarzenie', bledy);

  const tytulOd = sprawdzDate(p.tytulOd, 'tytulOd', bledy);
  const tytulDo = sprawdzDate(p.tytulDo, 'tytulDo', bledy);
  sprawdzKoniec(tytulOd, tytulDo, 'tytulDo', bledy);

  f.okresyChorobowe.forEach((o, i) => {
    const od = sprawdzDate(o.od, idOkresuChorobowego(i, 'od'), bledy);
    const do_ = sprawdzDate(o.do, idOkresuChorobowego(i, 'do'), bledy);
    sprawdzKoniec(od, do_, idOkresuChorobowego(i, 'do'), bledy);
  });

  sprawdzDate(p.porod, 'porod', bledy);
  sprawdzDate(p.termin, 'termin', bledy);
  const nzOd = sprawdzDate(p.niezdolnoscOd, 'niezdolnoscOd', bledy);
  const nzDo = sprawdzDate(p.niezdolnoscDo, 'niezdolnoscDo', bledy);
  sprawdzKoniec(nzOd, nzDo, 'niezdolnoscDo', bledy);

  const szpital = maDokument(sprawa, 'zaswiadczenie-szpitala');
  if (p.tydzien.trim() !== '' || szpital) {
    const tydzien = liczbaCalkowita(p.tydzien);
    if (tydzien === null || tydzien < 22 || tydzien > 44) bledy.tydzien = '0021';
  }
  if (p.masa.trim() !== '' || szpital) {
    const masa = liczbaCalkowita(p.masa);
    if (masa === null || masa < 300 || masa > 7000) bledy.masa = '0022';
  }
  const pobytOd = sprawdzDate(p.pobytOd, 'pobytOd', bledy);
  const pobytDo = sprawdzDate(p.pobytDo, 'pobytDo', bledy);
  sprawdzKoniec(pobytOd, pobytDo, 'pobytDo', bledy);
  sprawdzDate(p.zaZyciem, 'zaZyciem', bledy);

  sprawdzDate(p.zlozenie, 'zlozenie', bledy);
  const matkaOd = sprawdzDate(p.matkaOd, 'matkaOd', bledy);
  const matkaDo = sprawdzDate(p.matkaDo, 'matkaDo', bledy);
  sprawdzKoniec(matkaOd, matkaDo, 'matkaDo', bledy);
  f.okresyWniosku.forEach((o, i) => {
    wymagajWyboru(o.rodzajUrlopu, idOkresuWniosku(i, 'rodzaj'), bledy);
    const od = sprawdzDate(o.od, idOkresuWniosku(i, 'od'), bledy);
    const do_ = sprawdzDate(o.do, idOkresuWniosku(i, 'do'), bledy);
    sprawdzKoniec(od, do_, idOkresuWniosku(i, 'do'), bledy);
  });
  f.swiadczeniaWniosku.forEach((s, i) => wymagajWyboru(s, idSwiadczeniaWniosku(i), bledy));

  f.kwoty.forEach((k, i) => sprawdzKwote(k.kwota, idKwoty(i), bledy, true));
  sprawdzKwote(p.popPodstawa, 'popPodstawa', bledy, false);
  sprawdzDate(p.popKoniec, 'popKoniec', bledy);
  sprawdzKwote(p.dlug, 'dlug', bledy, false);

  f.rozstrzygniecie.forEach((r, i) => {
    wymagajWyboru(r.swiadczenie, idRozstrzygniecia(i, 'sw'), bledy);
    if (r.swiadczenie !== '') wymagajWyboru(r.prawo, idRozstrzygniecia(i, 'prawo'), bledy);
    const od = sprawdzDate(r.od, idRozstrzygniecia(i, 'od'), bledy);
    const do_ = sprawdzDate(r.do, idRozstrzygniecia(i, 'do'), bledy);
    sprawdzKoniec(od, do_, idRozstrzygniecia(i, 'do'), bledy);
    sprawdzKwote(r.kwota, idRozstrzygniecia(i, 'kwota'), bledy, false);
  });

  if (Object.keys(bledy).length > 0) return bledy;
  return walidujDaneSprawy(daneZFormularza(f, sprawa.dane));
}

/** Błędy pól danych sprawy (0109 i walidatory pól). */
export function walidujDaneSprawy(d: DaneSprawy): BledyPol<string> {
  const bledy: BledyPol<string> = {};
  const pesel = walidujPesel(d.ubezpieczony.pesel.wartosc ?? '');
  if (!pesel.ok) bledy.pesel = pesel.kod;
  if (d.ubezpieczony.rola.wartosc === null) bledy.rola = '0006';
  if (d.tytul.rodzaj.wartosc === null) bledy.tytulRodzaj = '0006';
  if (d.ubezpieczenieChorobowe.rodzaj.wartosc === null) bledy.rodzajCh = '0006';
  if (d.zdarzenie.rodzaj.wartosc === null) bledy.zdarzenie = '0006';
  const tydzien = d.dziecko.tydzienCiazy.wartosc;
  if (tydzien !== null && (tydzien < 22 || tydzien > 44)) bledy.tydzien = '0021';
  const masa = d.dziecko.masaG.wartosc;
  if (masa !== null && (masa < 300 || masa > 7000)) bledy.masa = '0022';
  if (Object.keys(bledy).length > 0) return bledy;

  const rodzajCh = d.ubezpieczenieChorobowe.rodzaj.wartosc;
  const okresy = d.ubezpieczenieChorobowe.okresy.wartosc ?? [];
  if ((rodzajCh === 'obowiazkowe' || rodzajCh === 'dobrowolne') && okresy.length === 0) bledy[POLE_OKRESOW_CHOROBOWYCH] = '0109';
  const rodzaj = d.zdarzenie.rodzaj.wartosc;
  const dataZdarzenia = rodzaj === 'niezdolnosc'
    ? d.zdarzenie.niezdolnosc.wartosc?.od ?? null
    : d.zdarzenie.dataPorodu.wartosc ?? d.zdarzenie.przewidywanyTermin.wartosc ?? null;
  if (dataZdarzenia === null) bledy[rodzaj === 'niezdolnosc' ? 'niezdolnoscOd' : 'porod'] = '0109';
  return bledy;
}

// --- Dane z formularza ---------------------------------------------------------------------------

function dataLubNull(t: string): DataISO | null {
  return t.trim() === '' ? null : parsujDate(t);
}

function wartoscTakNie(t: string): boolean | null {
  return t === 'tak' ? true : t === 'nie' ? false : null;
}

function okres(od: string, do_: string): Okres | null {
  const a = dataLubNull(od);
  const b = dataLubNull(do_);
  return a !== null && b !== null ? { od: a, do: b } : null;
}

/** Wartości pól formularza pod ścieżkami Danych sprawy (bez wartości pustych w polach dodanych przez użytkownika). */
export function wartosciZFormularza(f: FormularzSprawy, dane: DaneSprawy): { pole: string; wartosc: unknown }[] {
  const p = f.pola;
  const liczba = (t: string): number | null => (t.trim() === '' ? null : liczbaCalkowita(t));
  const kwota = (t: string): Grosze | null => (t.trim() === '' ? null : parsujKwote(t));
  const poprzednieKwoty = dane.kwotyMiesieczne.wartosc ?? [];
  const rodzajKwot = poprzednieKwoty[0]?.rodzaj ?? 'wynagrodzenie';
  const kwoty = f.kwoty
    .map((k) => {
      const wartosc = kwota(k.kwota);
      if (wartosc === null) return null;
      const poprzednia = poprzednieKwoty.find((q) => q.miesiac === k.miesiac);
      return { ...(poprzednia ?? { rodzaj: rodzajKwot }), miesiac: k.miesiac, kwota: wartosc };
    })
    .filter((k) => k !== null);
  const niezdolnoscOd = dataLubNull(p.niezdolnoscOd);
  const niezdolnoscDo = dataLubNull(p.niezdolnoscDo);
  const poprzedniKoniec = dataLubNull(p.popKoniec);
  const poprzedniaPodstawa = kwota(p.popPodstawa);
  const dlug = kwota(p.dlug);
  const okresyCh: OkresOtwarty[] = f.okresyChorobowe
    .map((o) => {
      const od = dataLubNull(o.od);
      if (od === null) return null;
      const do_ = dataLubNull(o.do);
      return do_ === null ? { od } : { od, do: do_ };
    })
    .filter((o) => o !== null);
  const okresyWniosku = f.okresyWniosku
    .map((o) => {
      const zakres = okres(o.od, o.do);
      return zakres && o.rodzajUrlopu !== '' ? { rodzajUrlopu: o.rodzajUrlopu as RodzajUrlopu, ...zakres } : null;
    })
    .filter((o) => o !== null);
  return [
    { pole: 'ubezpieczony.pesel', wartosc: p.pesel.trim() === '' ? null : p.pesel.trim() },
    { pole: 'ubezpieczony.rola', wartosc: p.rola === '' ? null : p.rola },
    { pole: 'tytul.rodzaj', wartosc: p.tytulRodzaj === '' ? null : p.tytulRodzaj },
    { pole: 'tytul.od', wartosc: dataLubNull(p.tytulOd) },
    { pole: 'tytul.dataUstania', wartosc: dataLubNull(p.tytulDo) },
    { pole: 'wymiarCzasuPracy', wartosc: p.etat === '' ? null : p.etat },
    { pole: 'liczbaUbezpieczonychPlatnika', wartosc: p.liczbaUb === '' ? null : p.liczbaUb },
    { pole: 'ubezpieczenieChorobowe.rodzaj', wartosc: p.rodzajCh === '' ? null : p.rodzajCh },
    { pole: 'ubezpieczenieChorobowe.okresy', wartosc: okresyCh.length > 0 ? okresyCh : null },
    { pole: 'ustanieZatrudnienia.przyczyna', wartosc: p.przyczyna === '' ? null : p.przyczyna },
    { pole: 'ustanieZatrudnienia.inneZatrudnienie', wartosc: wartoscTakNie(p.inneZatrudnienie) },
    { pole: 'pracaPoUstaniu', wartosc: wartoscTakNie(p.pracaPoUstaniu) },
    { pole: 'zdarzenie.rodzaj', wartosc: p.zdarzenie === '' ? null : p.zdarzenie },
    { pole: 'zdarzenie.dataPorodu', wartosc: dataLubNull(p.porod) },
    { pole: 'zdarzenie.przewidywanyTermin', wartosc: dataLubNull(p.termin) },
    { pole: 'zdarzenie.liczbaDzieci', wartosc: p.dzieci === '' ? null : (Number(p.dzieci) as LiczbaDzieci) },
    { pole: 'zdarzenie.liczbaMartwych', wartosc: liczba(p.martwe) },
    {
      pole: 'zdarzenie.niezdolnosc',
      wartosc: niezdolnoscOd !== null && niezdolnoscDo !== null
        ? { od: niezdolnoscOd, do: niezdolnoscDo, ...(p.niezdolnoscKod.trim() ? { kod: p.niezdolnoscKod.trim() } : {}) }
        : null,
    },
    { pole: 'dziecko.tydzienCiazy', wartosc: liczba(p.tydzien) },
    { pole: 'dziecko.masaG', wartosc: liczba(p.masa) },
    { pole: 'dziecko.pobyt', wartosc: okres(p.pobytOd, p.pobytDo) },
    { pole: 'dziecko.zaZyciem', wartosc: dataLubNull(p.zaZyciem) },
    { pole: 'wniosek.swiadczenia', wartosc: f.swiadczeniaWniosku.length > 0 ? f.swiadczeniaWniosku.filter((s) => s !== '') : null },
    { pole: 'wniosek.okresy', wartosc: okresyWniosku.length > 0 ? okresyWniosku : null },
    { pole: 'wniosek.oswiadczeniePelnyWymiar', wartosc: wartoscTakNie(p.oswiadczenie) },
    { pole: 'wniosek.dataZlozenia', wartosc: dataLubNull(p.zlozenie) },
    { pole: 'wniosek.okresMatki', wartosc: okres(p.matkaOd, p.matkaDo) },
    { pole: 'kwotyMiesieczne', wartosc: kwoty.length > 0 ? kwoty : null },
    {
      pole: 'poprzedniZasilek',
      wartosc: poprzedniaPodstawa !== null && poprzedniKoniec !== null ? { podstawa: poprzedniaPodstawa, dataKonca: poprzedniKoniec } : null,
    },
    {
      pole: 'zadluzenieJdg',
      wartosc: dlug === null ? null : { kwota: dlug, dzien: dane.zadluzenieJdg.wartosc?.dzien ?? dataLubNull(p.porod) ?? dataLubNull(p.termin) ?? '' },
    },
  ];
}

function uporzadkowane(w: unknown): unknown {
  if (Array.isArray(w)) return w.map(uporzadkowane);
  if (w !== null && typeof w === 'object') {
    return Object.fromEntries(
      Object.entries(w as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([k, v]) => [k, uporzadkowane(v)]),
    );
  }
  return w ?? null;
}

/** Porównanie wartości niezależne od kolejności kluczy. */
export function rowne(a: unknown, b: unknown): boolean {
  return JSON.stringify(uporzadkowane(a)) === JSON.stringify(uporzadkowane(b));
}

/** Wartości formularza różne od bieżących danych sprawy, czyli korekty użytkownika. */
export function zmianyZFormularza(f: FormularzSprawy, dane: DaneSprawy): { pole: string; wartosc: unknown }[] {
  return wartosciZFormularza(f, dane).filter((z) => !rowne(wartoscPola(dane, z.pole).wartosc, z.wartosc));
}

/** Dane sprawy po naniesieniu wartości z formularza (do walidacji typowanej). */
export function daneZFormularza(f: FormularzSprawy, dane: DaneSprawy): DaneSprawy {
  let wynik = dane;
  for (const z of wartosciZFormularza(f, dane)) {
    wynik = zWartoscia(wynik, z.pole, { ...wartoscPola(wynik, z.pole), wartosc: z.wartosc });
  }
  return wynik;
}

/** Rozstrzygnięcie z formularza; wpis zmieniony przez użytkownika dostaje źródło korekta użytkownika. */
export function rozstrzygniecieZFormularza(f: FormularzSprawy, obecne: readonly RozstrzygniecieSprawy[]): RozstrzygniecieSprawy[] {
  return f.rozstrzygniecie
    .filter((r) => r.swiadczenie !== '')
    .map((r, i) => {
      const zakres = okres(r.od, r.do);
      const kwota = r.kwota.trim() === '' ? null : parsujKwote(r.kwota);
      const wpis: Omit<RozstrzygniecieSprawy, 'zrodlo'> = {
        swiadczenie: r.swiadczenie as RozstrzygniecieSprawy['swiadczenie'],
        prawo: (r.prawo || 'przysluguje') as RozstrzygniecieSprawy['prawo'],
        ...(r.platnik ? { platnik: r.platnik as 'zus' | 'platnik-skladek' } : {}),
        ...(zakres ? { okres: zakres } : {}),
        ...(r.stawka ? { stawka: Number(r.stawka) } : {}),
        ...(kwota !== null ? { miesiecznaKwota: kwota } : {}),
      };
      const poprzedni = obecne[i];
      if (poprzedni) {
        const { zrodlo: zrodloPoprzednie, ...bezZrodla } = poprzedni;
        if (rowne(bezZrodla, wpis)) return poprzedni;
        const wartoscPierwotna = zrodloPoprzednie.rodzaj === 'korekta-uzytkownika' ? zrodloPoprzednie.wartoscPierwotna : bezZrodla;
        return { ...wpis, zrodlo: { rodzaj: 'korekta-uzytkownika' as const, wartoscPierwotna } };
      }
      return { ...wpis, zrodlo: { rodzaj: 'korekta-uzytkownika' as const, wartoscPierwotna: null } };
    });
}

/** Kod pierwszego błędu w kolejności pól formularza (do przeniesienia fokusu). */
export function pierwszeBledne(bledy: BledyPol<string>, kolejnosc: readonly string[]): string | null {
  return kolejnosc.find((id) => bledy[id] !== undefined) ?? Object.keys(bledy)[0] ?? null;
}

export type { KodKomunikatu };
