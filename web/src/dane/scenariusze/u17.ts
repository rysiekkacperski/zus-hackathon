// Scenariusze demonstracyjne jednostki u17 (kontrakt, sekcja 6.6). Właściciel: u17.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: przełączniki symulacji kanałów
// dla przejścia do kanału z ekranu ViewCaseGuide (3.8.1.1.1 KA-08, KA-09, KA-11) i błąd zapisu oznaczenia (3.8.1.2.1 KA-08).
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';
import type { ParametrySystemu, ScenariuszDemo } from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

const PESEL_ANNY = '93041231085';

type Symulacje = ParametrySystemu['symulacje'];

/** Parametry scenariusza: przełączniki symulacji z wartości początkowych z podaną zmianą. */
function parametryScenariusza(zmiana: Partial<Symulacje>): Partial<ParametrySystemu> {
  const { symulacje } = utworzParametryPoczatkowe();
  return { symulacje: { ...symulacje, ...zmiana } };
}

export const scenariuszeU17: readonly ScenariuszDemo[] = [
  {
    id: 'u17-kanal-niedostepny',
    nazwa: tekst['u17-kanal-niedostepny'].nazwa,
    opis: tekst['u17-kanal-niedostepny'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ parametry: parametryScenariusza({ kanalNiedostepny: true }) }),
  },
  {
    id: 'u17-mobywatel-zainstalowany',
    nazwa: tekst['u17-mobywatel-zainstalowany'].nazwa,
    opis: tekst['u17-mobywatel-zainstalowany'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ parametry: parametryScenariusza({ mobywatelZainstalowany: true }) }),
  },
  {
    id: 'u17-blad-zapisu-oznaczenia',
    nazwa: tekst['u17-blad-zapisu-oznaczenia'].nazwa,
    opis: tekst['u17-blad-zapisu-oznaczenia'].opis,
    pesel: PESEL_ANNY,
    zastosuj: () => ({ parametry: parametryScenariusza({ bladZapisu: true }) }),
  },
];
