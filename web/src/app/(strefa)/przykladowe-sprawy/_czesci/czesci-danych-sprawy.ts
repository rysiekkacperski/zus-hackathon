// Podział ekranu ViewSampleCaseData na części według grup Danych sprawy (parametr adresu ?czesc=N).
// Każda część mieści się w oknie 1440×800 bez przewijania. Część danych dziecka i część świadczeń przyznanych
// zależą od danych i dokumentów sprawy, które zmieniają się wyłącznie przy dodaniu dokumentu, czyli przy nowym
// formularzu, więc liczba części jest stała w trakcie edycji.
import { trasy } from '@/komponenty/rama/trasy';
import type { SprawaPrzykladowa } from '@/domena/typy';

export type CzescDanychSprawy =
  | 'dokumenty'
  | 'osoba'
  | 'tytul'
  | 'chorobowe'
  | 'zdarzenie'
  | 'wniosek'
  | 'okresy'
  | 'dziecko'
  | 'kwoty'
  | 'poprzedni'
  | 'przyznane'
  | 'rozstrzygniecie';

/** Sprawa ma dane dziecka albo dokument szpitala lub „Za życiem”. */
export function czyCzescDziecka(sprawa: SprawaPrzykladowa): boolean {
  const d = sprawa.dane.dziecko;
  return (
    d.tydzienCiazy.wartosc !== null ||
    d.masaG.wartosc !== null ||
    d.pobyt.wartosc !== null ||
    d.zaZyciem.wartosc !== null ||
    sprawa.dokumenty.some((x) => x.rodzaj === 'zaswiadczenie-szpitala' || x.rodzaj === 'zaswiadczenie-za-zyciem')
  );
}

/** Sprawa ma świadczenia przyznane przez ZUS ze zrzutu z systemu. */
export function czyCzescPrzyznanych(sprawa: SprawaPrzykladowa): boolean {
  return (sprawa.dane.swiadczeniaPrzyznane.wartosc ?? []).length > 0;
}

/** Części ekranu danych sprawy w kolejności; ostatnia część ma oczekiwane rozstrzygnięcie i zatwierdzenie danych. */
export function czesciDanychSprawy(sprawa: SprawaPrzykladowa): CzescDanychSprawy[] {
  const czesci: CzescDanychSprawy[] = ['dokumenty', 'osoba', 'tytul', 'chorobowe', 'zdarzenie', 'wniosek', 'okresy'];
  if (czyCzescDziecka(sprawa)) czesci.push('dziecko');
  czesci.push('kwoty', 'poprzedni');
  if (czyCzescPrzyznanych(sprawa)) czesci.push('przyznane');
  czesci.push('rozstrzygniecie');
  return czesci;
}

/** Adres części ekranu danych sprawy, np. części oczekiwanego rozstrzygnięcia z ekranu weryfikacji. */
export function adresCzesciDanychSprawy(sprawa: SprawaPrzykladowa, czesc: CzescDanychSprawy): string {
  const numer = czesciDanychSprawy(sprawa).indexOf(czesc) + 1;
  const adres = trasy.ViewSampleCaseData();
  return numer > 1 ? `${adres}?czesc=${numer}` : adres;
}
