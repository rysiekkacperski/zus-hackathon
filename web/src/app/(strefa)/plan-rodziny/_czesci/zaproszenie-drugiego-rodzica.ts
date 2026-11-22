// Część ViewFamilyPlan: akcja „Dodaj drugiego rodzica” w nagłówku pulpitu obok „Zgłoś narodziny” (3.3.3.1.1).
// Akcję widzi Rodzic, którego profil rodziny ma drugiego rodzica bez dołączonego konta i bez aktywnego zaproszenia.
// Akcja prowadzi do zakładki Drugi rodzic w Profilu rodziny, gdzie Rodzic tworzy zaproszenie.
// Teksty: teksty.ViewFamilyPlan.dodajDrugiegoRodzica.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { czyProfilMaDrugiegoRodzica, dolaczonyDrugiRodzic, stanZaproszenia } from '@/domena/rodzina/zaproszenia';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';

/** Adres zakładki Drugi rodzic w Profilu rodziny, do której prowadzi akcja „Dodaj drugiego rodzica”. */
export const adresDodaniaDrugiegoRodzica = sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina', zakladka: 'drugi-rodzic' });

/**
 * Czy Rodzic może dodać drugiego rodzica z pulpitu: konto zapisało profil rodziny, profil ma drugiego rodzica,
 * drugi rodzic nie dołączył do planu, a rodzina nie ma aktywnego zaproszenia.
 */
export function czyDodanieDrugiegoRodzicaDostepne(kontekst: KontekstRodziny): boolean {
  if (kontekst.rola !== 'rodzic') return false;
  const daneRodziny = kontekst.rodzina.daneRodziny;
  if (osobyRodziny(daneRodziny).peselRodzica !== kontekst.konto.pesel) return false;
  if (!czyProfilMaDrugiegoRodzica(daneRodziny) || dolaczonyDrugiRodzic(daneRodziny) !== null) return false;
  const zaproszenie = daneRodziny.zaproszenie;
  return zaproszenie === undefined || stanZaproszenia(zaproszenie, kontekst.dzis) !== 'aktywne';
}
