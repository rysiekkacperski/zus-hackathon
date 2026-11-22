import 'server-only';
// Wynik odczytu dokumentu przykładowego bez modelu językowego (tryb demonstracyjny odczytu). Właściciel: u05.
// Dokumenty przykładowe z web/public/przyklady/ niosą w treści identyfikator „PPM-<nazwa pliku>”: w tekście strony
// i metadanych PDF, w bloku tEXt pliku PNG i w komentarzu pliku JPEG. Serwer rozpoznaje dokument po tym
// identyfikatorze, więc zmiana nazwy pliku przez użytkownika nie zmienia wyniku. Plik bez identyfikatora
// rozpoznajemy po nazwie pliku z kryteriów akceptacji (dane/przykladowe-sprawy/fikstury-odczytu.ts).
import { fiksturaOdczytu } from '@/dane/przykladowe-sprawy/fikstury-odczytu';
import type { WynikOdczytuDokumentu } from '@/domena/typy';

const IDENTYFIKATOR = /PPM-([a-z0-9-]{1,60}\.(?:pdf|png|jpe?g))/;

/** Identyfikator dokumentu przykładowego z treści pliku albo null. */
export function identyfikatorDokumentuPrzykladowego(bajty: Uint8Array): string | null {
  return IDENTYFIKATOR.exec(Buffer.from(bajty).toString('latin1'))?.[1] ?? null;
}

/** Fikstura odczytu dla treści pliku (identyfikator PPM), a bez identyfikatora dla nazwy pliku; null, gdy brak fikstury. */
export function fiksturaDokumentu({ nazwa, bajty }: { nazwa: string; bajty: Uint8Array }): WynikOdczytuDokumentu | null {
  const identyfikator = identyfikatorDokumentuPrzykladowego(bajty);
  return (identyfikator === null ? null : fiksturaOdczytu(identyfikator)) ?? fiksturaOdczytu(nazwa);
}
