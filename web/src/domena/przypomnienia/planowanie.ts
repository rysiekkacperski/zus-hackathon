// Zaślepka fundamentu: przypomnienia puste. Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
// Docelowo planuje przypomnienia T − W, T − 7 przy W < 7 i T o 9:00, a zaległe od razu w oknie 8:00–21:00
// (kontrakt, sekcja 7.2).
import type { DaneRodziny, KalendarzTerminow, Pesel, PlanRodziny, Powiadomienie, Ustawienia, ZnacznikCzasu } from '@/domena/typy';

export interface WejsciePrzypomnien {
  plan: PlanRodziny;
  kalendarz: KalendarzTerminow;
  daneRodziny: DaneRodziny;
  ustawienia: Record<Pesel, Ustawienia | null>;
  poprzednie: Record<Pesel, Powiadomienie[]>;
  teraz: ZnacznikCzasu;
}

export function zaplanujPrzypomnienia(w: WejsciePrzypomnien): Record<Pesel, Powiadomienie[]> {
  void w;
  return {};
}
