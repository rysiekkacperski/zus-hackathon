// Adresy produkcyjnych sposobów logowania i kanałów zewnętrznych (kontrakt, sekcje 3.5, 8 i 13.2 pkt 4).
// Adresy dostarcza zespół. Wartość `null` oznacza adres do ustalenia: akcja prowadzi wtedy do makiety
// albo do symulowanego serwisu także przy wyłączonym trybie demonstracyjnym.
import type { KanalPozycji, SposobZalogowania } from '@/domena/typy';

/** Adres produkcyjny albo `null`, gdy zespół go jeszcze nie ustalił. */
export type AdresProdukcyjny = string | null;

/** Kanały zewnętrzne pozycji katalogu oraz serwisy PUE/eZUS i e-wizyty, otwierane przez symulowane strony `/kanal/*`. */
export type KanalProdukcyjny =
  | Extract<KanalPozycji, { typ: 'zewnetrzny' }>['kanal']
  | 'pue-ezus'
  | 'e-wizyta';

export interface AdresyProdukcyjne {
  logowanie: Record<SposobZalogowania, AdresProdukcyjny>;
  kanaly: Record<KanalProdukcyjny, AdresProdukcyjny>;
}

export const adresyProdukcyjne: AdresyProdukcyjne = {
  logowanie: {
    mobywatel: null,
    ezus: null,
    mzus: null,
  },
  kanaly: {
    ezus: null,
    empatia: null,
    mobywatel: null,
    'gov-zgloszenie-urodzenia': null,
    'gov-rejestr-stanu-cywilnego': null,
    'pue-ezus': null,
    'e-wizyta': null,
  },
};

function adresUstalony(adres: AdresProdukcyjny): string | null {
  const przyciety = adres?.trim() ?? '';
  return przyciety.length > 0 ? przyciety : null;
}

/** Adres produkcyjny sposobu logowania albo `null`, gdy akcja logowania prowadzi do makiety. */
export function adresProdukcyjnyLogowania(sposob: SposobZalogowania): string | null {
  return adresUstalony(adresyProdukcyjne.logowanie[sposob]);
}

/** Adres produkcyjny kanału zewnętrznego albo `null`, gdy przejście prowadzi do symulowanego serwisu. */
export function adresProdukcyjnyKanalu(kanal: KanalProdukcyjny): string | null {
  return adresUstalony(adresyProdukcyjne.kanaly[kanal]);
}
