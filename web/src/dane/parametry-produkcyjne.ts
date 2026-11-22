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

// Adresy pochodzą ze zmiennych środowiskowych NEXT_PUBLIC_ADRES_* (web/.env.example), które Next.js wpisuje w kod
// przeglądarki przy budowie aplikacji, więc wdrożenie ustawia je przed `pnpm build`. Każdą zmienną zapisujemy dosłownie,
// bo Next.js podstawia wyłącznie pełną nazwę `process.env.NEXT_PUBLIC_…`. Brak zmiennej daje `null`.
export const adresyProdukcyjne: AdresyProdukcyjne = {
  logowanie: {
    mobywatel: process.env.NEXT_PUBLIC_ADRES_LOGOWANIA_MOBYWATEL ?? null,
    ezus: process.env.NEXT_PUBLIC_ADRES_LOGOWANIA_EZUS ?? null,
    mzus: process.env.NEXT_PUBLIC_ADRES_LOGOWANIA_MZUS ?? null,
  },
  kanaly: {
    ezus: process.env.NEXT_PUBLIC_ADRES_KANALU_EZUS ?? null,
    empatia: process.env.NEXT_PUBLIC_ADRES_KANALU_EMPATIA ?? null,
    mobywatel: process.env.NEXT_PUBLIC_ADRES_KANALU_MOBYWATEL ?? null,
    'gov-zgloszenie-urodzenia': process.env.NEXT_PUBLIC_ADRES_KANALU_GOV_ZGLOSZENIE_URODZENIA ?? null,
    'gov-rejestr-stanu-cywilnego': process.env.NEXT_PUBLIC_ADRES_KANALU_GOV_REJESTR_STANU_CYWILNEGO ?? null,
    'pue-ezus': process.env.NEXT_PUBLIC_ADRES_KANALU_PUE_EZUS ?? null,
    'e-wizyta': process.env.NEXT_PUBLIC_ADRES_KANALU_E_WIZYTA ?? null,
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
