// Dokumenty przykładowe do pobrania i wgrania na stronie „Przykładowe sprawy”. Właściciel: u05.
// Pliki leżą w web/public/przyklady/ i powstają skryptem web/skrypty/generuj-dokumenty-przykladowe.mjs.
// Dokumenty zmyślił zespół: osoby, numery PESEL, płatnicy i kwoty nie pochodzą z zestawów spraw ZUS.
// Każdy plik ma fiksturę odczytu (fikstury-odczytu.ts) do trybu demonstracyjnego i do odczytu bez klucza modelu.

/** Adres folderu dokumentów przykładowych w aplikacji. */
export const ADRES_DOKUMENTOW_PRZYKLADOWYCH = '/przyklady/';

/** Archiwum ZIP wszystkich dokumentów przykładowych. */
export const ARCHIWUM_DOKUMENTOW_PRZYKLADOWYCH = '/przyklady/dokumenty-przykladowe.zip';

export type IdZestawuDokumentowPrzykladowych =
  | 'kowalczyk'
  | 'sadowska'
  | 'pawlak'
  | 'zajac'
  | 'krawczyk'
  | 'mazur'
  | 'gorska'
  | 'inne';

/** Rodzaj dokumentu przykładowego do etykiety na liście (teksty.ViewSampleCaseUpload.dokumentyPrzykladowe.rodzaje). */
export type RodzajDokumentuPrzykladowego = 'zam' | 'z3' | 'z3a' | 'poswiadczenie' | 'zrzut' | 'ezla' | 'zas12' | 'umowa';

export interface DokumentPrzykladowy {
  plik: string;
  rodzaj: RodzajDokumentuPrzykladowego;
  typ: 'application/pdf' | 'image/png';
}

export interface ZestawDokumentowPrzykladowych {
  id: IdZestawuDokumentowPrzykladowych;
  dokumenty: readonly DokumentPrzykladowy[];
}

/** Dokument z nazwą pliku `<rodzaj>-<nazwisko>.<rozszerzenie>`. */
function dokument(plik: string): DokumentPrzykladowy {
  const rodzaj = (plik.startsWith('umowa') ? 'umowa' : plik.split('-')[0]) as RodzajDokumentuPrzykladowego;
  return { plik, rodzaj, typ: plik.endsWith('.png') ? 'image/png' : 'application/pdf' };
}
const pdf = dokument;
const png = dokument;

/** Zestawy dokumentów przykładowych w kolejności na ekranie; dokumenty zestawu wgrywa się w podanej kolejności. */
export const zestawyDokumentowPrzykladowych: readonly ZestawDokumentowPrzykladowych[] = [
  { id: 'kowalczyk', dokumenty: [pdf('zam-kowalczyk.pdf'), pdf('z3-kowalczyk.pdf'), png('zrzut-kowalczyk.png')] },
  { id: 'sadowska', dokumenty: [pdf('zam-sadowska.pdf'), pdf('z3a-sadowska.pdf')] },
  { id: 'pawlak', dokumenty: [pdf('zam-pawlak.pdf'), pdf('poswiadczenie-pawlak.pdf'), png('zrzut-pawlak.png')] },
  { id: 'zajac', dokumenty: [pdf('zam-zajac.pdf'), pdf('z3-zajac.pdf')] },
  { id: 'krawczyk', dokumenty: [pdf('zam-krawczyk.pdf'), png('zrzut-krawczyk.png')] },
  { id: 'mazur', dokumenty: [pdf('z3a-mazur.pdf'), pdf('ezla-mazur.pdf'), png('zrzut-mazur.png')] },
  { id: 'gorska', dokumenty: [pdf('z3a-gorska.pdf'), pdf('ezla-gorska.pdf'), pdf('zas12-gorska.pdf')] },
  { id: 'inne', dokumenty: [pdf('umowa-najmu.pdf')] },
];

/** Adres pliku dokumentu przykładowego. */
export function adresDokumentuPrzykladowego(plik: string): string {
  return `${ADRES_DOKUMENTOW_PRZYKLADOWYCH}${plik}`;
}

/** Czy plik o tej nazwie jest dokumentem przykładowym z public/przyklady. */
export function czyDokumentPrzykladowy(plik: string): boolean {
  return zestawyDokumentowPrzykladowych.some((z) => z.dokumenty.some((d) => d.plik === plik));
}
