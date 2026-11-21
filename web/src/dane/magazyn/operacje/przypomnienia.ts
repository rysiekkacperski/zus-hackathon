// Ustawienia przypomnień, kod SMS i doręczenie zaplanowanych przypomnień (kontrakt, sekcja 6.5).
// Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
// Zaślepka fundamentu: implementuje u18. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Pola sekcji przypomnień na ViewGuideSettings przed walidacją; kształt ustala właściciel (u18). */
export interface FormularzPrzypomnien {
  przypomnieniaWlaczone: boolean;
  wyprzedzenieDni: string;
  kanalEmail: boolean;
  adresEmail: string;
  kanalSms: boolean;
  numerTelefonu: string;
}

export function zapiszUstawieniaPrzypomnien(formularz: FormularzPrzypomnien, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Kod weryfikacyjny SMS ważny 10 minut (stały przy symulacji kodSmsStaly). */
export function wyslijKodSms(numer: string, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function sprawdzKodSms(kod: string, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Doręczenie przypomnień zaplanowanych do chwili ctx.teraz do skrzynki demonstracyjnej. */
export function doreczZaplanowane(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
