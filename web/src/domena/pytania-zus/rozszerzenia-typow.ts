// Rozszerzenia typów wspólnych dla pytań do ZUS (kontrakt, sekcja 12.3). Właściciel: u29.
declare module '@/domena/typy/dane-zus' {
  interface KontekstPytaniaDoZus {
    /** Nazwa płatnika zasiłku z profilu, gdy zasiłek wypłaca płatnik składek (wzór P23-05). */
    nazwaPlatnikaZasilku?: string;
    /** Rodzaj ubezpieczenia chorobowego wysyłającego rodzica w chwili wysłania. */
    rodzajUbezpieczeniaChorobowego?: 'obowiazkowe' | 'dobrowolne' | 'brak';
  }
}

export {};
