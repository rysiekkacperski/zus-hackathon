// Zmiany planu między przeliczeniami (kontrakt, sekcja 11.2, pole PlanRodziny.ostatnieZmiany;
// historyjka 3.6.1.1.2, wymaganie Ponowne wyliczenie). Właściciel: u08 (Silnik planu rodziny).
//
// Lista zmian zasila tabelę „Co się zmieniło w planie” na ViewFamilyPlan. Pole `opis` niesie klucz
// maszynowy, który widok tłumaczy na tekst z teksty.ts: przy usunięciu i zmianie statusu poprzedni status,
// przy zmianie kwoty poprzednią kwotę w groszach, a przy sprawach zachowanych i zdjętym oznaczeniu po
// porodzie klucze z OPIS_ZMIANY.
import type { Etap, IdSprawy, PlanRodziny, PozycjaPlanu, StatusSprawy, ZmianaPlanu, ZrodloStatusu, DataISO } from '@/domena/typy';

// Pola opcjonalne grup Pozycje planu (kontrakt, sekcja 12.3).
declare module '@/domena/typy/plan' {
  interface PozycjaPlanu {
    /** Status sprzed ostatniej zmiany przez operację planu; przywraca go cofnijStatus. */
    poprzedniStatus?: { status: StatusSprawy; zrodloStatusu: ZrodloStatusu; dataOznaczenia?: DataISO };
    /** Sprawa złożona albo załatwiona zachowana w planie, choć jej warunek przestał być spełniony. */
    zachowanaBezWarunku?: boolean;
  }
  interface PlanRodziny {
    /** Zmiana bieżącego etapu w ostatnim przeliczeniu. */
    zmianaEtapu?: { z: Etap; na: Etap };
  }
}

/** Klucze pola `opis` zmian bez poprzedniej wartości. */
export const OPIS_ZMIANY = {
  /** Sprawa złożona albo załatwiona zachowała status, choć jej warunek przestał być spełniony. */
  statusZachowany: 'status-zachowany',
  /** Po potwierdzeniu daty porodu sprawa straciła oznaczenie po porodzie. */
  bezOznaczeniaPoPorodzie: 'bez-oznaczenia-po-porodzie',
} as const;

function kluczKwoty(p: PozycjaPlanu): string {
  return p.kwota ? `${p.kwota.kwota}/${p.kwota.okres}` : '';
}

/**
 * Zmiany między poprzednim planem a nowymi pozycjami: dodane, usunięte, zmiana statusu (także zachowanie
 * statusu sprawy bez spełnionego warunku), zmiana kwoty i zdjęte oznaczenie po porodzie. Bez poprzedniego
 * planu (pierwsze wyliczenie) lista jest pusta.
 */
export function porownajPlany(poprzedni: PlanRodziny | null, pozycje: readonly PozycjaPlanu[]): ZmianaPlanu[] {
  if (poprzedni === null) return [];
  const zmiany: ZmianaPlanu[] = [];
  const poprzednie = new Map<IdSprawy, PozycjaPlanu>(poprzedni.pozycje.map((p) => [p.idSprawy, p]));
  const biezace = new Set<IdSprawy>(pozycje.map((p) => p.idSprawy));

  for (const p of pozycje) {
    const przed = poprzednie.get(p.idSprawy);
    if (!przed) {
      zmiany.push({ idSprawy: p.idSprawy, rodzaj: 'dodana' });
      continue;
    }
    if (przed.status !== p.status) {
      zmiany.push({ idSprawy: p.idSprawy, rodzaj: 'zmieniony-status', opis: przed.status });
    } else if (p.zachowanaBezWarunku && !przed.zachowanaBezWarunku) {
      zmiany.push({ idSprawy: p.idSprawy, rodzaj: 'zmieniony-status', opis: OPIS_ZMIANY.statusZachowany });
    }
    if (kluczKwoty(przed) !== kluczKwoty(p) && przed.kwota && p.kwota) {
      zmiany.push({ idSprawy: p.idSprawy, rodzaj: 'zmieniona-kwota', opis: String(przed.kwota.kwota) });
    }
    if (przed.poPorodzie && !p.poPorodzie) {
      zmiany.push({ idSprawy: p.idSprawy, rodzaj: 'zmieniony-termin', opis: OPIS_ZMIANY.bezOznaczeniaPoPorodzie });
    }
  }
  for (const przed of poprzedni.pozycje) {
    if (!biezace.has(przed.idSprawy)) zmiany.push({ idSprawy: przed.idSprawy, rodzaj: 'usunieta', opis: przed.status });
  }
  return zmiany;
}

/** Identyfikatory spraw dodanych w zmianach. */
export function dodaneSprawy(zmiany: readonly ZmianaPlanu[]): Set<IdSprawy> {
  return new Set(zmiany.filter((z) => z.rodzaj === 'dodana').map((z) => z.idSprawy));
}
