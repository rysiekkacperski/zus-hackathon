// Treść przypomnień e-mail i SMS (kontrakt, sekcja 7.2). Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
// Zaślepka fundamentu: implementuje u18. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */

/** Tekst SMS bez polskich znaków. Zaślepka zwraca tekst bez zmian. */
export function transliterujSms(t: string): string {
  return t;
}

/** Tytuł skrócony do `maks` znaków (w SMS 40). Zaślepka zwraca tytuł bez zmian. */
export function skrocTytul(t: string, maks: number): string {
  return t;
}
