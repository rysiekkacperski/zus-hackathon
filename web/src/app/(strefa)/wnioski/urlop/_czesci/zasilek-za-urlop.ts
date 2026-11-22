// Kto wypłaci zasiłek za okres urlopu z wniosku do pracodawcy (u32, wymaganie Dokumenty i adresat wniosku 3.8.1.1.1).
// Płatnik składek, który według stanu na 30 listopada poprzedniego roku zgłaszał do ubezpieczenia chorobowego
// więcej niż 20 osób, sam wypłaca zasiłek (art. 61 ust. 1 ustawy zasiłkowej), a przy mniejszej liczbie zasiłek
// wypłaca ZUS na podstawie zaświadczenia płatnika składek Z-3 (słownik dokumentów, wpisy zm-uop-platnik i zm-uop-zus).
import type { DaneRodziny, PodrodzajWnioskuOUrlop, RodzicWRodzinie } from '@/domena/typy';
import { daneRodzicaWRodzinie } from '@/domena/wnioski/urlopy';
import { teksty } from '@/teksty';

const t = teksty.ViewLeaveRequestSummary.zasilek;

/** Wnioski o urlop, za który przysługuje zasiłek macierzyński; urlop wychowawczy i obniżenie wymiaru są bezpłatne. */
const PODRODZAJE_Z_ZASILKIEM: readonly PodrodzajWnioskuOUrlop[] = [
  'czesc-przed-porodem',
  'macierzynski-z-rodzicielskim',
  'rodzicielski',
  'ojcowski',
  'uzupelniajacy',
  'na-warunkach-macierzynskiego',
  'laczenie-z-praca',
  'pozostala-czesc-macierzynskiego',
];

/** Zdanie o płatniku zasiłku za okres urlopu według płatnika zasiłku rodzica wniosku; null przy urlopie bez zasiłku. */
export function opisZasilkuZaUrlop(w: {
  podrodzaj: PodrodzajWnioskuOUrlop;
  daneRodziny: DaneRodziny;
  rodzic: RodzicWRodzinie;
  pracodawca?: string;
}): string | null {
  if (w.podrodzaj === 'rezygnacja-matki') return t.rezygnacja;
  if (!PODRODZAJE_Z_ZASILKIEM.includes(w.podrodzaj)) return null;
  const platnik = daneRodzicaWRodzinie(w.daneRodziny, w.rodzic).platnikZasilku?.wartosc;
  if (platnik === 'platnik-skladek') {
    return w.pracodawca ? t.platnikSkladekZNazwa({ pracodawca: w.pracodawca }) : t.platnikSkladek;
  }
  if (platnik === 'zus') return t.zus;
  return t.nieustalony;
}
