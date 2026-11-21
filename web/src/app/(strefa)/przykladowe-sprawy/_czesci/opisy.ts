// Opisy przykładowej sprawy wspólne dla widoków listy, wgrania i danych sprawy (u05).
import type { DokumentSprawy, SprawaPrzykladowa } from '@/domena/typy';
import { teksty } from '@/teksty';

const tL = teksty.ViewSampleCaseList;
const tD = teksty.ViewSampleCaseData;

export function malaLitera(tekst: string): string {
  return tekst.length === 0 ? tekst : tekst[0].toLocaleLowerCase('pl-PL') + tekst.slice(1);
}

/** Nazwa dokumentu w sprawie: „Zaświadczenie Z-3 nr 1”. */
export function nazwaDokumentu(d: Pick<DokumentSprawy, 'rodzaj' | 'numer'>): string {
  return tD.nazwaDokumentu({ nazwa: tD.nazwyDokumentow[d.rodzaj], numer: String(d.numer) });
}

/** Rodzaje dokumentów sprawy do kolumny Dokumenty: „Zaświadczenie Z-3a, wniosek ZAM”. */
export function listaDokumentow(sprawa: SprawaPrzykladowa): string {
  return sprawa.dokumenty
    .map((d, i) => (i === 0 ? tD.nazwyDokumentow[d.rodzaj] : malaLitera(tD.nazwyDokumentow[d.rodzaj])))
    .join(', ');
}

/** Forma zatrudnienia z tytułu ubezpieczenia w danych sprawy. */
export function formaZatrudnienia(sprawa: SprawaPrzykladowa): string {
  const tytul = sprawa.dane.tytul.rodzaj.wartosc;
  return tytul ? tL.formy[tytul] : '';
}

/** Oczekiwane prawo do świadczeń: jedna linia na świadczenie rozstrzygnięcia. */
export function prawoSprawy(sprawa: SprawaPrzykladowa): string[] {
  const zadluzenie = sprawa.dane.zadluzenieJdg.wartosc?.kwota ?? 0;
  return sprawa.rozstrzygniecie.map((r) => {
    const prawo = r.prawo === 'nie-przysluguje' && zadluzenie > 0 ? tL.prawo.doSplaty : tL.prawo[r.prawo];
    return `${tD.opcje.swiadczenie[r.swiadczenie]}: ${prawo}`;
  });
}
