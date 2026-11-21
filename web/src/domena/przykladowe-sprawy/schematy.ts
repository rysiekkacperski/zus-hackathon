// JSON Schema pól dokumentu dla modelu odczytu (kontrakt, sekcje 7.2 i 10.3).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { RodzajDokumentuSprawy } from '@/domena/typy';

/** Schemat JSON pól dokumentu danego rodzaju (typ zgodny z OpcjeWywolaniaZeSchematem.schemat w serwer/model.ts). */
export function schematPol(rodzaj: RodzajDokumentuSprawy): Record<string, unknown> {
  return { type: 'object', properties: {} };
}
