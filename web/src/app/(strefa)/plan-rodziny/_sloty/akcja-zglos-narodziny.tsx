'use client';

// Slot ViewFamilyPlan „akcja-zglos-narodziny” w liście slotyNaglowka (kontrakt, sekcja 12.4). Właściciel: u19.
// Akcja „Zgłoś narodziny” (3.3.2.1.1 KA-01, KA-12) dla Rodzica bez potwierdzonej daty porodu. Po zamknięciu okna
// nowego dziecka akcję pokazuje karta przypomnienia w slocie okno-nowego-dziecka (wzór cz1/P10-01).
// Teksty: teksty.ViewFamilyPlan.akcjaZglosNarodziny.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

/** Czy Rodzic może zgłosić narodziny: brak potwierdzonej daty porodu i sytuacja inna niż przyjęcie dziecka. */
export function czyZgloszenieNarodzinDostepne(kontekst: KontekstRodziny): boolean {
  if (kontekst.rola !== 'rodzic') return false;
  if (kontekst.rodzina.daneRodziny.sytuacja?.wartosc === 'przyjecie') return false;
  return kontekst.rodzina.daneCiazy?.dataPoroduPotwierdzona !== true;
}

/** Czy plan pokazuje kartę przypomnienia o nowym dziecku (okno zamknięte bez potwierdzenia). */
export function czyPrzypomnienieONowymDziecku(kontekst: KontekstRodziny): boolean {
  const oczekujace = kontekst.rodzina.daneCiazy?.noweDzieckoOczekujace;
  return czyZgloszenieNarodzinDostepne(kontekst) && oczekujace !== undefined && oczekujace.zamknieto !== undefined;
}

export function SlotAkcjaZglosNarodziny({ kontekst }: PropsSlotu<'naglowek'>) {
  if (!czyZgloszenieNarodzinDostepne(kontekst) || czyPrzypomnienieONowymDziecku(kontekst)) return null;
  return (
    <PrzyciskLink wariant="glowny" href={sciezkaWidoku('ViewBirthDate', { tryb: 'pakiet' })}>
      {teksty.ViewFamilyPlan.akcjaZglosNarodziny.zglos}
    </PrzyciskLink>
  );
}
