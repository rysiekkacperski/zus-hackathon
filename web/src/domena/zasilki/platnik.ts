// Płatnik świadczenia z ubezpieczenia chorobowego (kontrakt, sekcja 7.2). Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
// Zaślepka fundamentu: implementuje u16. Kontrakt nie podaje parametrów ustalPlatnikaSwiadczenia; ustala je właściciel.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */

export interface PlatnikSwiadczenia {
  platnik: 'zus' | 'platnik-skladek';
  wyplaca: string;
}

/** Kto wypłaca świadczenie; null, gdy nie da się ustalić. */
export function ustalPlatnikaSwiadczenia(...argumenty: unknown[]): PlatnikSwiadczenia | null {
  return null;
}
