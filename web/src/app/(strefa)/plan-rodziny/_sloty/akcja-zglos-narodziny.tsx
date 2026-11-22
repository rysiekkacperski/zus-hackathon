'use client';

// Slot ViewFamilyPlan „akcja-zglos-narodziny” (kontrakt, sekcja 12.4). Właściciel: u19.
// Warunek akcji „Zgłoś narodziny” (3.3.2.1.1 KA-01, KA-12) w nagłówku pulpitu i karta „Dziecko już się urodziło?”
// dla Rodzica bez potwierdzonej daty porodu. Po zamknięciu okna
// nowego dziecka akcję pokazuje karta przypomnienia w slocie okno-nowego-dziecka (wzór cz1/P10-01).
// Teksty: teksty.ViewFamilyPlan.akcjaZglosNarodziny.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { Karta } from '@/komponenty/karta';
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

const t = teksty.ViewFamilyPlan.akcjaZglosNarodziny;

export function SlotAkcjaZglosNarodziny({ kontekst }: PropsSlotu<'akcje'>) {
  if (!czyZgloszenieNarodzinDostepne(kontekst) || czyPrzypomnienieONowymDziecku(kontekst)) return null;
  return (
    <Karta tytul={t.tytul} poziomTytulu={3} bezLinii className="flex flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="m-0">{t.opis}</p>
        <div className="mt-auto">
          <PrzyciskLink wariant="glowny" szerokosc="pelna" href={sciezkaWidoku('ViewBirthDate', { tryb: 'pakiet' })}>
            {t.zglos}
          </PrzyciskLink>
        </div>
      </div>
    </Karta>
  );
}
