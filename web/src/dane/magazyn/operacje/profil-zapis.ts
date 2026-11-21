// Zapis Profilu rodziny (kontrakt, sekcja 6.5). Właściciel: u11 (Profil na start: drugi rodzic, podsumowanie i zapis).
// Zaślepka fundamentu: implementuje u11. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Szkic → Dane rodziny i Dane ciąży z filtrem zgody, rola NU → R, przeliczenie, komunikat 0017. */
export function zapiszProfil(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Zapis zmian profilu z trybu zmiany profilu. */
export function zapiszZmianyProfilu(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
