// Arytmetyka i formaty dat (kontrakt, sekcja 1.2 i 7.1).
// Funkcje są czyste: dzień i czas dostają jako argument i liczą na liczbach całkowitych,
// bez obiektu Date, więc wynik nie zależy od strefy czasowej urządzenia.
// Okresy mają obie daty włącznie, a ZnacznikCzasu to czas lokalny Europe/Warsaw.
import type { DataISO, MiesiacISO, Okres, ZnacznikCzasu } from '@/domena/typy';

export interface CzesciDaty { rok: number; miesiac: number; dzien: number }
export interface CzesciZnacznika extends CzesciDaty { godzina: number; minuta: number; sekunda: number }

const WZOR_DATY_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const WZOR_MIESIACA_ISO = /^(\d{4})-(\d{2})$/;
const WZOR_ZNACZNIKA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;
const WZOR_DATY_WPISANEJ = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const SEKUNDY_DOBY = 86400;

function dwieCyfry(n: number): string {
  return String(n).padStart(2, '0');
}

// Liczba dni, miesięcy albo lat do dodania musi być całkowita; inna wartość to błąd programisty.
function wymagajCalkowitej(n: number, co: string): void {
  if (!Number.isSafeInteger(n)) throw new Error(`Oczekiwano całkowitej liczby ${co}: ${n}`);
}

function czteryCyfry(n: number): string {
  return String(n).padStart(4, '0');
}

export function czyRokPrzestepny(rok: number): boolean {
  return (rok % 4 === 0 && rok % 100 !== 0) || rok % 400 === 0;
}

export function dniWMiesiacu(rok: number, miesiac: number): number {
  if (miesiac === 2) return czyRokPrzestepny(rok) ? 29 : 28;
  return [4, 6, 9, 11].includes(miesiac) ? 30 : 31;
}

function czyIstniejeDzien(rok: number, miesiac: number, dzien: number): boolean {
  return rok >= 1 && miesiac >= 1 && miesiac <= 12 && dzien >= 1 && dzien <= dniWMiesiacu(rok, miesiac);
}

function zlozDate(rok: number, miesiac: number, dzien: number): DataISO {
  return `${czteryCyfry(rok)}-${dwieCyfry(miesiac)}-${dwieCyfry(dzien)}`;
}

// Numer dnia liczony od 1970-01-01 (algorytm days_from_civil, kalendarz gregoriański).
function numerDnia({ rok, miesiac, dzien }: CzesciDaty): number {
  const r = miesiac <= 2 ? rok - 1 : rok;
  const era = Math.floor(r / 400);
  const rokEry = r - era * 400;
  const miesiacOdMarca = (miesiac + 9) % 12;
  const dzienRoku = Math.floor((153 * miesiacOdMarca + 2) / 5) + dzien - 1;
  const dzienEry = rokEry * 365 + Math.floor(rokEry / 4) - Math.floor(rokEry / 100) + dzienRoku;
  return era * 146097 + dzienEry - 719468;
}

function dataZNumeruDnia(numer: number): CzesciDaty {
  const z = numer + 719468;
  const era = Math.floor(z / 146097);
  const dzienEry = z - era * 146097;
  const rokEry = Math.floor(
    (dzienEry - Math.floor(dzienEry / 1460) + Math.floor(dzienEry / 36524) - Math.floor(dzienEry / 146096)) / 365,
  );
  const dzienRoku = dzienEry - (365 * rokEry + Math.floor(rokEry / 4) - Math.floor(rokEry / 100));
  const miesiacOdMarca = Math.floor((5 * dzienRoku + 2) / 153);
  const dzien = dzienRoku - Math.floor((153 * miesiacOdMarca + 2) / 5) + 1;
  const miesiac = miesiacOdMarca < 10 ? miesiacOdMarca + 3 : miesiacOdMarca - 9;
  const rok = rokEry + era * 400 + (miesiac <= 2 ? 1 : 0);
  return { rok, miesiac, dzien };
}

// Rozkłada 'RRRR-MM-DD' na liczby; inny zapis to błąd programisty.
export function czesciDaty(d: DataISO): CzesciDaty {
  const m = WZOR_DATY_ISO.exec(d);
  if (!m) throw new Error(`Nieprawidłowa data ISO: ${d}`);
  const czesci = { rok: Number(m[1]), miesiac: Number(m[2]), dzien: Number(m[3]) };
  if (!czyIstniejeDzien(czesci.rok, czesci.miesiac, czesci.dzien)) throw new Error(`Nieistniejący dzień: ${d}`);
  return czesci;
}

export function czyPoprawnaDataISO(tekst: string): boolean {
  const m = WZOR_DATY_ISO.exec(tekst);
  return m !== null && czyIstniejeDzien(Number(m[1]), Number(m[2]), Number(m[3]));
}

// Rozkłada 'RRRR-MM-DDTHH:MM:SS' (sekundy opcjonalne) na liczby.
export function czesciZnacznika(t: ZnacznikCzasu): CzesciZnacznika {
  const m = WZOR_ZNACZNIKA.exec(t);
  if (!m) throw new Error(`Nieprawidłowy znacznik czasu: ${t}`);
  const czesci = {
    rok: Number(m[1]), miesiac: Number(m[2]), dzien: Number(m[3]),
    godzina: Number(m[4]), minuta: Number(m[5]), sekunda: m[6] === undefined ? 0 : Number(m[6]),
  };
  if (!czyIstniejeDzien(czesci.rok, czesci.miesiac, czesci.dzien) || czesci.godzina > 23 || czesci.minuta > 59 || czesci.sekunda > 59) {
    throw new Error(`Nieprawidłowy znacznik czasu: ${t}`);
  }
  return czesci;
}

export function zbudujZnacznik(d: DataISO, godzina: number, minuta: number, sekunda = 0): ZnacznikCzasu {
  czesciDaty(d);
  return `${d}T${dwieCyfry(godzina)}:${dwieCyfry(minuta)}:${dwieCyfry(sekunda)}`;
}

function sekundyZnacznika(t: ZnacznikCzasu): number {
  const c = czesciZnacznika(t);
  return numerDnia(c) * SEKUNDY_DOBY + c.godzina * 3600 + c.minuta * 60 + c.sekunda;
}

function znacznikZSekund(sekundy: number): ZnacznikCzasu {
  const dzien = Math.floor(sekundy / SEKUNDY_DOBY);
  const reszta = sekundy - dzien * SEKUNDY_DOBY;
  const { rok, miesiac, dzien: d } = dataZNumeruDnia(dzien);
  return zbudujZnacznik(zlozDate(rok, miesiac, d), Math.floor(reszta / 3600), Math.floor((reszta % 3600) / 60), reszta % 60);
}

// Zegar: przeliczenie chwili (ms od epoki) na czas Europe/Warsaw.
// Wywołuje wyłącznie dane/magazyn/zegar.ts, który jako jedyny czyta Date.now().
const formatWarszawa = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function czasWarszawski(msOdEpoki: number): { data: DataISO; godzina: string } {
  const czesci: Record<string, string> = {};
  for (const c of formatWarszawa.formatToParts(new Date(msOdEpoki))) czesci[c.type] = c.value;
  return { data: `${czesci.year}-${czesci.month}-${czesci.day}`, godzina: `${czesci.hour}:${czesci.minute}:${czesci.second}` };
}

// Dzień „dzisiaj”: data demo, gdy parametr systemu dataDemo jest ustawiony, w przeciwnym razie data w Warszawie.
export function dzisZZegara(msOdEpoki: number, dataDemo: DataISO | null): DataISO {
  return dataDemo ?? czasWarszawski(msOdEpoki).data;
}

// Chwila „teraz”: data demo z bieżącą godziną w Warszawie albo bieżąca data i godzina w Warszawie.
export function terazZZegara(msOdEpoki: number, dataDemo: DataISO | null): ZnacznikCzasu {
  const { data, godzina } = czasWarszawski(msOdEpoki);
  return `${dataDemo ?? data}T${godzina}`;
}

// Wpis daty w polu: dokładnie 'DD.MM.RRRR' po przycięciu spacji i istniejący dzień kalendarza.
export function parsujDate(tekst: string): DataISO | null {
  const m = WZOR_DATY_WPISANEJ.exec(tekst.trim());
  if (!m) return null;
  const dzien = Number(m[1]);
  const miesiac = Number(m[2]);
  const rok = Number(m[3]);
  return czyIstniejeDzien(rok, miesiac, dzien) ? zlozDate(rok, miesiac, dzien) : null;
}

// '2026-11-21' → '21.11.2026'. Przyjmuje także znacznik czasu i pokazuje jego datę.
export function formatujDate(d: DataISO | ZnacznikCzasu): string {
  const { rok, miesiac, dzien } = czesciDaty(d.slice(0, 10));
  return `${dwieCyfry(dzien)}.${dwieCyfry(miesiac)}.${czteryCyfry(rok)}`;
}

// '2026-11-21T14:05:00' → '21.11.2026, 14:05'.
export function formatujDateICzas(t: ZnacznikCzasu): string {
  const c = czesciZnacznika(t);
  return `${formatujDate(t.slice(0, 10))}, ${dwieCyfry(c.godzina)}:${dwieCyfry(c.minuta)}`;
}

export function dodajDni(d: DataISO, n: number): DataISO {
  wymagajCalkowitej(n, 'dni');
  const { rok, miesiac, dzien } = dataZNumeruDnia(numerDnia(czesciDaty(d)) + n);
  return zlozDate(rok, miesiac, dzien);
}

// Ten sam numer dnia po N miesiącach albo ostatni dzień miesiąca, gdy takiego dnia brak (31.01 + 1 → 28.02 albo 29.02).
export function dodajMiesiace(d: DataISO, n: number): DataISO {
  wymagajCalkowitej(n, 'miesięcy');
  const { rok, miesiac, dzien } = czesciDaty(d);
  const indeks = rok * 12 + (miesiac - 1) + n;
  const nowyRok = Math.floor(indeks / 12);
  const nowyMiesiac = indeks - nowyRok * 12 + 1;
  return zlozDate(nowyRok, nowyMiesiac, Math.min(dzien, dniWMiesiacu(nowyRok, nowyMiesiac)));
}

// 29.02 + 1 rok → 28.02 w roku nieprzestępnym.
export function dodajLata(d: DataISO, n: number): DataISO {
  wymagajCalkowitej(n, 'lat');
  return dodajMiesiace(d, n * 12);
}

// Liczba dni od daty `od` do daty `do_` (do − od); wynik ujemny, gdy `do_` jest wcześniej.
export function roznicaDni(od: DataISO, do_: DataISO): number {
  return numerDnia(czesciDaty(do_)) - numerDnia(czesciDaty(od));
}

// Liczba dni okresu z obiema datami włącznie (do − od + 1).
export function liczbaDniWlacznie(o: Okres): number {
  return roznicaDni(o.od, o.do) + 1;
}

export function porownajDaty(a: DataISO, b: DataISO): -1 | 0 | 1 {
  const roznica = roznicaDni(b, a);
  if (roznica < 0) return -1;
  return roznica > 0 ? 1 : 0;
}

export function maxData(...d: DataISO[]): DataISO {
  if (d.length === 0) throw new Error('maxData wymaga co najmniej jednej daty');
  return d.reduce((wynik, data) => (porownajDaty(data, wynik) > 0 ? data : wynik));
}

export function minData(...d: DataISO[]): DataISO {
  if (d.length === 0) throw new Error('minData wymaga co najmniej jednej daty');
  return d.reduce((wynik, data) => (porownajDaty(data, wynik) < 0 ? data : wynik));
}

export function ostatniDzienMiesiaca(d: DataISO): DataISO {
  const { rok, miesiac } = czesciDaty(d);
  return zlozDate(rok, miesiac, dniWMiesiacu(rok, miesiac));
}

export function pierwszyDzienMiesiaca(d: DataISO): DataISO {
  const { rok, miesiac } = czesciDaty(d);
  return zlozDate(rok, miesiac, 1);
}

export function miesiacZDaty(d: DataISO): MiesiacISO {
  const { rok, miesiac } = czesciDaty(d);
  return `${czteryCyfry(rok)}-${dwieCyfry(miesiac)}`;
}

// Pierwszy dzień miesiąca, np. '2026-11' → '2026-11-01'.
export function dataZMiesiaca(m: MiesiacISO): DataISO {
  const wynik = WZOR_MIESIACA_ISO.exec(m);
  if (!wynik || Number(wynik[2]) < 1 || Number(wynik[2]) > 12) throw new Error(`Nieprawidłowy miesiąc ISO: ${m}`);
  return `${m}-01`;
}

export function dodajMiesiaceDoMiesiaca(m: MiesiacISO, n: number): MiesiacISO {
  return miesiacZDaty(dodajMiesiace(dataZMiesiaca(m), n));
}

// Wiek w pełnych latach w dniu `dzien`. Urodzeni 29.02 kończą kolejny rok życia 28.02 w roku nieprzestępnym (jak dodajLata).
export function wiekWLatach(dataUrodzenia: DataISO, dzien: DataISO): number {
  const wiek = czesciDaty(dzien).rok - czesciDaty(dataUrodzenia).rok;
  return porownajDaty(dodajLata(dataUrodzenia, wiek), dzien) > 0 ? wiek - 1 : wiek;
}

// od ≤ d ≤ do.
export function czyWOkresie(d: DataISO, o: Okres): boolean {
  return porownajDaty(d, o.od) >= 0 && porownajDaty(d, o.do) <= 0;
}

export function dataZeZnacznika(t: ZnacznikCzasu): DataISO {
  const { rok, miesiac, dzien } = czesciZnacznika(t);
  return zlozDate(rok, miesiac, dzien);
}

// Dodaje N minut (także ułamek minuty z dokładnością do sekundy) do znacznika czasu lokalnego.
export function dodajMinuty(t: ZnacznikCzasu, n: number): ZnacznikCzasu {
  if (!Number.isFinite(n)) throw new Error(`Oczekiwano skończonej liczby minut: ${n}`);
  return znacznikZSekund(sekundyZnacznika(t) + Math.round(n * 60));
}

// Liczba sekund od chwili `a` do chwili `b` (b − a).
export function roznicaSekund(a: ZnacznikCzasu, b: ZnacznikCzasu): number {
  return sekundyZnacznika(b) - sekundyZnacznika(a);
}

// Liczba minut od chwili `a` do chwili `b` (b − a), z częścią ułamkową z sekund: 10:00:00 → 10:14:59 daje 14,98.
export function roznicaMinut(a: ZnacznikCzasu, b: ZnacznikCzasu): number {
  return roznicaSekund(a, b) / 60;
}

export function porownajZnaczniki(a: ZnacznikCzasu, b: ZnacznikCzasu): -1 | 0 | 1 {
  const roznica = roznicaSekund(b, a);
  if (roznica < 0) return -1;
  return roznica > 0 ? 1 : 0;
}
