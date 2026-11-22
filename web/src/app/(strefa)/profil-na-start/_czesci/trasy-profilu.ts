// Część Profilu na start: adres ekranu kreatora wyznaczonego przez domena/profil/nawigacja.ts.
// ViewBirthDate prowadzi do trybu profilu, a ViewProfileSummary do trybu startu albo rodziny.
// Powrót na poprzedni ekran prowadzi do jego ostatniej części (?czesc=N, komponenty/czesci-formularza).
import { czesciEkranuProfilu } from '@/domena/profil/nawigacja';
import type { IdWidoku, SzkicProfilu } from '@/domena/typy';
import { adresCzesci } from '@/komponenty/czesci-formularza';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';

export function sciezkaEkranuProfilu(
  id: IdWidoku,
  szkic: Pick<SzkicProfilu, 'kontekst'> | null,
  czesc = 1,
): string {
  let sciezka: string;
  if (id === 'ViewBirthDate') sciezka = sciezkaWidoku(id, { tryb: 'profil' });
  else if (id === 'ViewProfileSummary') {
    sciezka = sciezkaWidoku(id, { tryb: szkic?.kontekst === 'zmiana-profilu' ? 'rodzina' : 'start' });
  } else sciezka = sciezkaWidoku(id);
  return czesc > 1 ? adresCzesci(sciezka, czesc) : sciezka;
}

/** Adres powrotu na ekran kreatora: ostatnia część ekranu według odpowiedzi zapisanych w szkicu. */
export function sciezkaPowrotuProfilu(
  id: IdWidoku,
  szkic: Pick<SzkicProfilu, 'kontekst' | 'daneRodziny'> | null,
  zDanymiZus: boolean,
): string {
  return sciezkaEkranuProfilu(id, szkic, czesciEkranuProfilu(id, { szkic, zDanymiZus }));
}
