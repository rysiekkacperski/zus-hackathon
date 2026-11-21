// Scenariusze demonstracyjne jednostki u05 (kontrakt, sekcja 6.6). Właściciel: u05.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: data 21.11.2026 i odczyt dokumentów
// z plików demonstracyjnych (dane/przykladowe-sprawy/fikstury-odczytu.ts) bez klucza modelu.
import type { ScenariuszDemo } from '@/domena/typy';
import { teksty } from '@/teksty';

export const scenariuszeU05: readonly ScenariuszDemo[] = [
  {
    id: 'u05-odczyt-fikstur',
    nazwa: teksty.ViewSampleCaseList.scenariusz.nazwa,
    opis: teksty.ViewSampleCaseList.scenariusz.opis,
    pesel: '93041231085',
    zastosuj: () => ({
      parametry: { dataDemo: '2026-11-21', symulacje: { odczytDokumentu: 'fikstura' } as ScenariuszDemoSymulacje },
    }),
  },
];

type ScenariuszDemoSymulacje = NonNullable<ReturnType<ScenariuszDemo['zastosuj']>['parametry']>['symulacje'] & object;
