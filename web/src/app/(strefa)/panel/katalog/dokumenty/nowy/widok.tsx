'use client';

// ViewCatalogDocumentAdd: nowy wpis słownika dokumentów i adresatów wniosków. Parametr ?grupa= wybiera grupę słownika.
// Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047).
import { useSearchParams } from 'next/navigation';
import { FormularzDokumentuKatalogu } from '@/app/(strefa)/panel/katalog/dokumenty/_czesci/formularz-dokumentu';
import { GRUPY_DOKUMENTOW, formularzDokumentuPoczatkowy } from '@/domena/katalog/edycja-panelu';

export function WidokNowegoDokumentuKatalogu() {
  const grupa = useSearchParams().get('grupa');
  const wybrana = GRUPY_DOKUMENTOW.find((g) => g === grupa) ?? '';
  return <FormularzDokumentuKatalogu poczatkowy={{ ...formularzDokumentuPoczatkowy(), grupa: wybrana }} />;
}
