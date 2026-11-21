// Dołączenie drugiego rodzica i pełnomocnictwo PEL (kontrakt, sekcja 6.5). Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL).
// Zaślepka fundamentu: implementuje u23. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
// odswiezPelnomocnictwo leży w rejestrze po-odczycie-zus (plik u23) i jest tu reeksportowana.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { Losuj } from '@/domena/losowanie';
import type { KontekstOperacji, WynikOperacji, Zaproszenie } from '@/domena/typy';

export { odswiezPelnomocnictwo } from '@/dane/magazyn/operacje/po-odczycie-zus/odswiez-pelnomocnictwo';

export function utworzZaproszenie(losuj: Losuj, ctx: KontekstOperacji): WynikOperacji<Zaproszenie> {
  return { ok: false, kod: '0003' };
}

export function przyjmijZaproszenie(token: string, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function odrzucZaproszenie(token: string, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function odlaczDrugiegoRodzica(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Dane drugiego rodzica z pełnomocnictwa PEL zapisane w Danych rodziny. */
export function odczytajDaneZPelnomocnictwa(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
