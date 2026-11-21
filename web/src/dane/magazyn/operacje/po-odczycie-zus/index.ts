// Rejestr akcji po odczycie Danych z konta ZUS (kontrakt, sekcje 6.5 i 12.3). Właściciel rejestru: u00.
// Odczyt przy zalogowaniu i przy otwarciu karty uruchamia akcje w tej kolejności po udanym odczycie kopii;
// każdy plik akcji należy do jednostki podanej w komentarzu.
import { obsluzNoweDzieci } from '@/dane/magazyn/operacje/po-odczycie-zus/obsluz-nowe-dzieci';
import { odswiezPelnomocnictwo } from '@/dane/magazyn/operacje/po-odczycie-zus/odswiez-pelnomocnictwo';
import { sprawdzOdpowiedziZus } from '@/dane/magazyn/operacje/po-odczycie-zus/sprawdz-odpowiedzi-zus';
import type { AkcjaPoOdczycieDanychZus } from '@/dane/magazyn/operacje/po-odczycie-zus/typ';
import type { KontekstOperacji, Pesel } from '@/domena/typy';

export type { AkcjaPoOdczycieDanychZus } from '@/dane/magazyn/operacje/po-odczycie-zus/typ';

export const poOdczycieDanychZus: AkcjaPoOdczycieDanychZus[] = [
  obsluzNoweDzieci,       // u19
  odswiezPelnomocnictwo,  // u23
  sprawdzOdpowiedziZus,   // u29
];

// Uruchamia wszystkie akcje w kolejności; błąd jednej akcji nie zatrzymuje kolejnych i trafia wyżej po ostatniej.
export function uruchomPoOdczycieDanychZus(pesel: Pesel, ctx: KontekstOperacji): void {
  const bledy: unknown[] = [];
  for (const akcja of poOdczycieDanychZus) {
    try {
      akcja(pesel, ctx);
    } catch (blad) {
      bledy.push(blad);
    }
  }
  if (bledy.length === 1) throw bledy[0];
  if (bledy.length > 1) throw new AggregateError(bledy, 'Akcje po odczycie Danych z konta ZUS zakończyły się błędem.');
}
