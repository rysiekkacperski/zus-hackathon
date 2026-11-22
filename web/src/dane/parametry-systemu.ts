// Wartości początkowe parametrów systemu i przełączników symulacji (kontrakt, sekcje 5.15, 6.6 i 13.2 pkt 7).
// Magazyn zapisuje je w `StanGlobalny.parametry` przy stanie początkowym, a ViewDemoSettings zmienia je
// operacjami `ustawParametry` i `ustawSymulacje`.
import type { ParametrySystemu } from '@/domena/typy';

/** Początkowy czas symulowanego odczytu danych z konta ZUS w milisekundach. */
export const OPOZNIENIE_ODCZYTU_ZUS_MS = 4000;

/** Dawne wartości początkowe czasu odczytu, które migracja magazynu zamienia na bieżącą. */
export const DAWNE_OPOZNIENIA_ODCZYTU_ZUS_MS: readonly number[] = [2400];

/** Tworzy nową, niezależną kopię wartości początkowych parametrów systemu. */
export function utworzParametryPoczatkowe(): ParametrySystemu {
  return {
    trybDemonstracyjny: true,
    dataDemo: null,
    progPodwyzszeniaPodstawyProcent: 50,
    progOstrzezeniaOkresuZasilkowegoDni: 30,
    tolerancjaPorownaniaKwotyGrosze: 1,
    opoznienieOdpowiedziZusDni: 4,
    symulacje: {
      bladZapisu: false,
      daneZusNiedostepne: false,
      stanRozliczenNiedostepny: false,
      kanalNiedostepny: false,
      mobywatelZainstalowany: false,
      wysylkaDoZusNiedostepna: false,
      pueEzusNiedostepne: false,
      rejestrStanuCywilnegoNiedostepny: false,
      uslugaEmailNiedostepna: false,
      asystentNiedostepny: false,
      odczytDokumentu: 'model',
      opoznienieOdczytuZusMs: OPOZNIENIE_ODCZYTU_ZUS_MS,
      kodSmsStaly: '482913',
    },
  };
}
