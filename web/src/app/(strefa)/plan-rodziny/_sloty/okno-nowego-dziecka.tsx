'use client';

// Slot ViewFamilyPlan „okno-nowego-dziecka” w liście slotyNadPlanem (kontrakt, sekcja 12.4). Właściciel: u19.
// ModalNewChildDetected (tabela 2.3), otwierane automatycznie, gdy daneCiazy.noweDzieckoOczekujace istnieje i nie jest zamknięte; teksty okna: teksty.ModalNewChildDetected.
// Zaślepka fundamentu: właściciel zastępuje treść z zachowaniem nazwy eksportu i podpisu.
// Teksty: teksty.ViewFamilyPlan.oknoNowegoDziecka.
import type { PropsSlotu } from './typy';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- zaślepka: propsy wykorzystuje właściciel
export function SlotOknoNowegoDziecka(props: PropsSlotu<'nadPlanem'>) {
  return null;
}
