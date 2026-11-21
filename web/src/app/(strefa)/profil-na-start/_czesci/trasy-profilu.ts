// Część Profilu na start: adres ekranu kreatora wyznaczonego przez domena/profil/nawigacja.ts.
// ViewBirthDate prowadzi do trybu profilu, a ViewProfileSummary do trybu startu albo rodziny.
import type { IdWidoku, SzkicProfilu } from '@/domena/typy';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';

export function sciezkaEkranuProfilu(id: IdWidoku, szkic: Pick<SzkicProfilu, 'kontekst'> | null): string {
  if (id === 'ViewBirthDate') return sciezkaWidoku(id, { tryb: 'profil' });
  if (id === 'ViewProfileSummary') {
    return sciezkaWidoku(id, { tryb: szkic?.kontekst === 'zmiana-profilu' ? 'rodzina' : 'start' });
  }
  return sciezkaWidoku(id);
}
