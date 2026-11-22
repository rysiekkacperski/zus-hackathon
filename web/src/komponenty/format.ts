import type { DataISO, Grosze, MiesiacISO, Procent, ZnacznikCzasu } from '@/domena/typy/wspolne';
import { teksty } from '@/teksty';

// Twarda spacja U+00A0 rozdziela grupy tysięcy oraz kwotę i walutę.
const TWARDA_SPACJA = ' ';

function grupujTysiace(cyfry: string): string {
  return cyfry.replace(/\B(?=(\d{3})+(?!\d))/g, TWARDA_SPACJA);
}

function zapiszDziesietnie(wartosc: number, maksMiejsc: number): string {
  const znak = wartosc < 0 ? '-' : '';
  const [calkowite, ulamkowe] = Math.abs(wartosc)
    .toFixed(maksMiejsc)
    .replace(/\.?0+$/, '')
    .split('.');
  const czescCalkowita = grupujTysiace(calkowite === '' ? '0' : calkowite);
  return ulamkowe ? `${znak}${czescCalkowita},${ulamkowe}` : `${znak}${czescCalkowita}`;
}

// 123456 → '1 234,56' (grupy rozdziela twarda spacja).
export function formatujKwoteBezWaluty(grosze: Grosze): string {
  const calkowite = Math.round(grosze);
  const znak = calkowite < 0 ? '-' : '';
  const bezZnaku = Math.abs(calkowite);
  const zlote = Math.floor(bezZnaku / 100);
  const reszta = bezZnaku % 100;
  return `${znak}${grupujTysiace(String(zlote))},${String(reszta).padStart(2, '0')}`;
}

// 123456 → '1 234,56 zł'.
export function formatujKwote(grosze: Grosze): string {
  return `${formatujKwoteBezWaluty(grosze)}${TWARDA_SPACJA}${teksty.wspolne.zl}`;
}

// 81.5 → '81,5%', 100 → '100%'.
export function formatujProcent(procent: Procent): string {
  return `${zapiszDziesietnie(procent, 2)}%`;
}

// 12500 → '12 500', 2.5 → '2,5'.
export function formatujLiczbe(liczba: number): string {
  return zapiszDziesietnie(liczba, 2);
}

// Rozmiar pliku: 512 → '512 B', 2048 → '2 KB', 1572864 → '1,5 MB' (kilobajty w całości, megabajty z jednym miejscem).
export function formatujRozmiarPliku(bajty: number): string {
  const t = teksty.wspolne.rozmiarPliku;
  const b = Math.max(0, bajty);
  if (b < 1024) return t.b({ liczba: String(Math.round(b)) });
  if (b < 1048576) return t.kb({ liczba: zapiszDziesietnie(Math.round(b / 1024), 0) });
  return t.mb({ liczba: zapiszDziesietnie(b / 1048576, 1) });
}

// '2026-11-21' albo '2026-11-21T14:05:00' → '21.11.2026'.
export function formatujDate(data: DataISO | ZnacznikCzasu): string {
  const [rok, miesiac, dzien] = data.slice(0, 10).split('-');
  return `${dzien}.${miesiac}.${rok}`;
}

// '2026-11-21T14:05:00' → '21.11.2026, 14:05'.
export function formatujDateICzas(znacznik: ZnacznikCzasu): string {
  const godzina = znacznik.slice(11, 16);
  return godzina ? `${formatujDate(znacznik)}, ${godzina}` : formatujDate(znacznik);
}

// '2026-10' albo '2026-10-15' → 'październik 2026'.
export function formatujMiesiac(miesiac: MiesiacISO | DataISO): string {
  const [rok, numer] = miesiac.split('-');
  const nazwa = teksty.wspolne.miesiace[Number(numer) - 1];
  return nazwa ? `${nazwa} ${rok}` : miesiac;
}

// Etykieta wartości ze słownika tekstów, na przykład etykieta(teksty.wspolne.etykiety.statusySpraw, 'zlozona').
export function etykieta<W extends string>(slownik: Readonly<Partial<Record<W, string>>>, wartosc: W): string {
  return slownik[wartosc] ?? wartosc;
}
