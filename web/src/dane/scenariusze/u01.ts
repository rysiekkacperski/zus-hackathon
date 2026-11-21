// Scenariusze demonstracyjne jednostki u01 (kontrakt, sekcja 6.6). Właściciel: u01.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki.
import { dzieckoZSymulacji } from '@/domena/dane-zus/symulacja-dziecka';
import type { ScenariuszDemo } from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze;

export const scenariuszeU01: readonly ScenariuszDemo[] = [
  {
    // KA-03 i KA-04 Story 3.4.1.2.1: Anna Nowak z dzieckiem dodanym symulacją zgłoszenia.
    id: 'u01-anna-nowak-dziecko-z-symulacji',
    nazwa: tekst.u01AnnaDziecko.nazwa,
    opis: tekst.u01AnnaDziecko.opis,
    pesel: '93041231085',
    zastosuj: (ctx) => ({ zus: { dzieckoZSymulacji: dzieckoZSymulacji({ nazwisko: 'Nowak' }, ctx.dzis) } }),
  },
];
