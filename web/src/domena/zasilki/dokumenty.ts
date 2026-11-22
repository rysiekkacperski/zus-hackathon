// Dokumenty i adresaci wniosków ze słownika dokumentów (kontrakt, sekcja 7.2; ANALIZY/05 sekcja 5.16).
// Właściciel: u16 (Świadczenia w ciąży i dokumenty wniosków).
// Wybór: świadczenie albo wniosek, forma zatrudnienia matki, płatnik zasiłku z danych rodziny, a dla matki,
// której ubezpieczenie ustało, wpisy po ustaniu ubezpieczenia. Ten sam wybór czyta instrukcja sprawy.
import { SYTUACJA_ROWNIEZ_PO_USTANIU } from '@/dane/katalog/slownik-dokumentow';
import type { FormaZatrudnienia, Katalog, PlatnikZasilku, WpisSlownikaDokumentow } from '@/domena/typy';

export interface KluczDokumentow {
  swiadczenieAlboWniosek: string;
  forma: FormaZatrudnienia;
  platnik: WpisSlownikaDokumentow['klucz']['platnik'];
  poUstaniu: boolean;
  sytuacja?: string;
}

/** Klucz płatnika słownika z płatnika zasiłku w danych rodziny; undefined przy płatniku nieustalonym. */
export function platnikDokumentow(p: PlatnikZasilku | null): WpisSlownikaDokumentow['klucz']['platnik'] {
  if (p === 'zus') return 'zus';
  if (p === 'platnik-skladek') return 'platnik-uprawniony';
  return undefined;
}

function pasujeForma(wpis: WpisSlownikaDokumentow, forma: FormaZatrudnienia): boolean {
  return wpis.klucz.formy === 'kazda' || wpis.klucz.formy.includes(forma);
}

function obejmujeUstanie(wpis: WpisSlownikaDokumentow): boolean {
  return wpis.klucz.poUstaniu === true || wpis.klucz.sytuacja === SYTUACJA_ROWNIEZ_PO_USTANIU;
}

/**
 * Wpisy słownika dokumentów pasujące do klucza. Przy płatniku nieustalonym u pracownicy i zleceniobiorczyni,
 * gdy wpisy różnią się płatnikiem, zwraca kod 0087. Pusta lista oznacza świadczenie bez wpisu dla tej formy.
 */
export function wybierzDokumenty(w: KluczDokumentow, katalog: Katalog): WpisSlownikaDokumentow[] | { kod: '0087' } {
  const wpisy = katalog.dokumenty
    .filter((d) => d.swiadczenieAlboWniosek === w.swiadczenieAlboWniosek)
    .sort((a, b) => a.kolejnosc - b.kolejnosc);
  if (w.sytuacja !== undefined) {
    return wpisy.filter((d) => d.klucz.sytuacja === w.sytuacja && pasujeForma(d, w.forma));
  }
  if (w.poUstaniu) {
    const poUstaniu = wpisy.filter((d) => obejmujeUstanie(d) && (d.klucz.formy === 'kazda' || d.klucz.poUstaniu !== true || pasujeForma(d, w.forma)));
    if (poUstaniu.length > 0) return poUstaniu;
  }
  const zForma = wpisy.filter((d) => d.klucz.poUstaniu !== true && pasujeForma(d, w.forma));
  const zaleznePlatnika = zForma.filter((d) => d.klucz.platnik !== undefined);
  const bezPlatnika = zForma.filter((d) => d.klucz.platnik === undefined);
  if (zaleznePlatnika.length === 0) return bezPlatnika;
  if (w.platnik === undefined) {
    const rozne = new Set(zaleznePlatnika.map((d) => d.klucz.platnik));
    if (rozne.size > 1 && (w.forma === 'umowa-o-prace' || w.forma === 'umowa-zlecenia')) return { kod: '0087' };
    return [...bezPlatnika, ...zaleznePlatnika];
  }
  return [...bezPlatnika, ...zaleznePlatnika.filter((d) => d.klucz.platnik === w.platnik)];
}
