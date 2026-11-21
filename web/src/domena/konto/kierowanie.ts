// Kierowanie po otwarciu przewodnika (kontrakt, sekcja 3.6; analiza 3.1.1, reguła R3; analiza 3.3.1, reguła R6).
// Kolejność reguł:
// 1. ponowne zalogowanie po wygaśnięciu sesji tym samym kontem: ekran sprzed wygaśnięcia;
// 2. parametr `powrot` dozwolony dla roli: ten adres;
// 3. Administrator: ViewCatalogList;
// 4. Rodzic i Drugi rodzic: ViewFamilyPlan;
// 5. Nowy użytkownik z zapisaną decyzją o zgodzie: ostatni wyświetlony ekran szkicu profilu albo ViewProfileZusData;
// 6. Nowy użytkownik bez decyzji o zgodzie: ViewGuideWelcome.
import type { IdWidoku, Rola, StanZgody } from '@/domena/typy';

export { czyMaZgode, ostatniaDecyzja, stanZgody } from '@/domena/konto/zgoda';
export { czyOdnowicSesje, czySesjaWygasla } from '@/domena/konto/sesja';

export interface WejscieKierowania {
  rola: Rola;
  stanZgody: StanZgody;
  ekranSprzedWygasniecia?: string;              // ścieżka z zapytaniem zapisana przy wygaśnięciu sesji tego konta
  powrot?: string;                              // parametr ?powrot= z ViewGuideStart
  czyPowrotDozwolony: (sciezka: string) => boolean; // ścieżka z mapy tras dostępna dla roli
  ostatniEkranSzkicu?: IdWidoku;                // SzkicProfilu.ostatniEkran konta Nowy użytkownik
}

export type EkranStartowy = { rodzaj: 'sciezka'; sciezka: string } | { rodzaj: 'widok'; idWidoku: IdWidoku };

export function wyznaczEkranStartowy(w: WejscieKierowania): EkranStartowy {
  // Ekran sprzed wygaśnięcia i parametr powrotu prowadzą wyłącznie na ścieżkę dostępną dla bieżącej roli.
  if (w.ekranSprzedWygasniecia && w.czyPowrotDozwolony(w.ekranSprzedWygasniecia)) {
    return { rodzaj: 'sciezka', sciezka: w.ekranSprzedWygasniecia };
  }
  if (w.powrot && w.czyPowrotDozwolony(w.powrot)) {
    return { rodzaj: 'sciezka', sciezka: w.powrot };
  }
  switch (w.rola) {
    case 'administrator':
      return { rodzaj: 'widok', idWidoku: 'ViewCatalogList' };
    case 'rodzic':
    case 'drugi-rodzic':
      return { rodzaj: 'widok', idWidoku: 'ViewFamilyPlan' };
    case 'nowy-uzytkownik':
      if (w.stanZgody === 'brak-decyzji') return { rodzaj: 'widok', idWidoku: 'ViewGuideWelcome' };
      return { rodzaj: 'widok', idWidoku: w.ostatniEkranSzkicu ?? 'ViewProfileZusData' };
  }
}
