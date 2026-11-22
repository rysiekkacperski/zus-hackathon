// Część ViewProfileSummary: zakładki sekcji podsumowania profilu. Właściciel: u11.
// Każda sekcja profilu ma jedną zakładkę w kolejności sekcji. Sekcja danych ciąży wyższa niż budżet panelu
// zakładki oddaje wiersze zmiany zatrudnienia w ciąży do osobnej zakładki z akcją „Zmień” tego ekranu.
// Sekcja z wierszem bez odpowiedzi rodzica ma wskaźnik błędu na zakładce.
import { teksty } from '@/teksty';
import type { IdSekcjiProfilu, SekcjaProfilu } from './sekcje-profilu';

const t = teksty.ViewProfileSummary;

export type IdZakladkiSekcji = 'zatrudnienie' | 'dane-ciazy' | 'zmiana-zatrudnienia' | 'dane-rodziny' | 'drugi-rodzic';

export interface ZakladkaSekcji {
  id: IdZakladkiSekcji;
  etykieta: string;
  sekcja: SekcjaProfilu;
  blad: boolean;
}

const ZAKLADKI: Record<IdSekcjiProfilu, { id: IdZakladkiSekcji; etykieta: string }> = {
  formaIPlatnik: { id: 'zatrudnienie', etykieta: t.zakladki.zatrudnienie },
  daneCiazy: { id: 'dane-ciazy', etykieta: t.zakladki.daneCiazy },
  daneRodziny: { id: 'dane-rodziny', etykieta: t.zakladki.daneRodziny },
  drugiRodzic: { id: 'drugi-rodzic', etykieta: t.zakladki.drugiRodzic },
};

/**
 * Najwyższa wysokość karty sekcji w panelu zakładki (rem, 1rem = 12 px), przy której strona mieści się w oknie
 * 1440×800 z miejscem na komunikat błędu: tryb startu ma nad zakładkami postęp kreatora i dwie notatki, tryb
 * rodziny link powrotu i „Stan na”, a notatki w kolumnie bocznej.
 */
export const BUDZET_PANELU = { start: 22, rodzina: 30 } as const;

/** Wysokość karty sekcji (rem): odstęp karty, nagłówek, wiersze listy definicji z dopiskami i notatka. */
export function wysokoscKartySekcji(sekcja: SekcjaProfilu, zNaglowkiemTresci: boolean): number {
  const wiersze = sekcja.wiersze.reduce(
    (suma, w) => suma + 3 + (w.zrodlo ? 1.58 : 0) + (w.opis ? 1.5 : 0) + (w.akcja ? 1.75 : 0),
    0,
  );
  return 5.5 + (zNaglowkiemTresci ? 2 : 0) + wiersze + (sekcja.notatka ? 4 : 0);
}

function czyBrak(sekcja: SekcjaProfilu): boolean {
  return sekcja.wiersze.some((w) => w.brak === true);
}

/** Sekcja danych ciąży bez wierszy zmiany zatrudnienia i sekcja zmiany zatrudnienia z akcją „Zmień” jej ekranu. */
function podzielDaneCiazy(sekcja: SekcjaProfilu): [SekcjaProfilu, SekcjaProfilu] | null {
  const zatrudnienie = sekcja.wiersze.filter((w) => w.czesc === 'zmianaZatrudnienia');
  if (zatrudnienie.length === 0 || zatrudnienie.length === sekcja.wiersze.length) return null;
  return [
    { ...sekcja, wiersze: sekcja.wiersze.filter((w) => w.czesc !== 'zmianaZatrudnienia') },
    {
      ...sekcja,
      tytul: t.sekcje.zmianaZatrudnienia,
      etykietaZmiany: t.zmienZmianeZatrudnienia,
      ekran: 'ViewProfileEmploymentChange',
      wiersze: zatrudnienie.map((w) => ({ ...w, akcja: undefined })),
      notatka: undefined,
    },
  ];
}

/** Zakładki sekcji profilu: po jednej na sekcję, z podziałem sekcji danych ciąży wyższej niż budżet panelu. */
export function zakladkiSekcji(
  sekcje: SekcjaProfilu[],
  budzet: number,
  zNaglowkiemTresci: (sekcja: SekcjaProfilu) => boolean,
): ZakladkaSekcji[] {
  return sekcje.flatMap((sekcja): ZakladkaSekcji[] => {
    const { id, etykieta } = ZAKLADKI[sekcja.id];
    const czesci =
      sekcja.id === 'daneCiazy' && wysokoscKartySekcji(sekcja, zNaglowkiemTresci(sekcja)) > budzet
        ? podzielDaneCiazy(sekcja)
        : null;
    if (czesci === null) return [{ id, etykieta, sekcja, blad: czyBrak(sekcja) }];
    const [ciaza, zatrudnienie] = czesci;
    return [
      { id, etykieta, sekcja: ciaza, blad: czyBrak(ciaza) },
      { id: 'zmiana-zatrudnienia', etykieta: t.zakladki.zmianaZatrudnienia, sekcja: zatrudnienie, blad: czyBrak(zatrudnienie) },
    ];
  });
}
