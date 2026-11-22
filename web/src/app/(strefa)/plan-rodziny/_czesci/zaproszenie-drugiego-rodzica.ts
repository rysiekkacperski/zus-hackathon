// Część ViewFamilyPlan: akcja „Dodaj drugiego rodzica” w nagłówku pulpitu obok „Zgłoś narodziny” (3.3.3.1.1).
// Akcję widzi Rodzic, którego profil rodziny ma drugiego rodzica bez dołączonego konta i bez aktywnego zaproszenia.
// Zaproszenie tworzy operacja utworzZaproszenie, a link pokazuje arkusz SheetInviteSecondParent.
// Teksty: teksty.ViewFamilyPlan.dodajDrugiegoRodzica.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { losuj } from '@/dane/magazyn/losowanie';
import { utworzZaproszenie } from '@/dane/magazyn/operacje/drugi-rodzic';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czyProfilMaDrugiegoRodzica, dolaczonyDrugiRodzic, stanZaproszenia } from '@/domena/rodzina/zaproszenia';
import type { DataISO, WynikOperacji } from '@/domena/typy';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';

/** Link zaproszenia do pokazania w arkuszu SheetInviteSecondParent. */
export interface LinkZaproszenia {
  link: string;
  wazneDo: DataISO;
}

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

/** Nowe zaproszenie drugiego rodzica i pełny adres jego linku; wywołuj w obsłudze kliknięcia. */
export function zaprosDrugiegoRodzica(): WynikOperacji<LinkZaproszenia> {
  const wynik = utworzZaproszenie(losuj, pobierzKontekstOperacji());
  if (!wynik.ok) return wynik;
  const sciezka = sciezkaWidoku('ViewInviteAccept', { token: wynik.wartosc.token });
  return { ok: true, wartosc: { link: new URL(sciezka, window.location.origin).href, wazneDo: wynik.wartosc.wazneDo } };
}
