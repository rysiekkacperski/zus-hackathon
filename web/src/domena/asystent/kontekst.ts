// Kontekst asystenta AI wysyłany do API (kontrakt, sekcje 7.2 i 10.2). Właściciel: u31 (Asystent AI).
// Zaślepka fundamentu: implementuje u31. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import type {
  DaneZKontaZus,
  DataISO,
  Katalog,
  KontekstAsystenta,
  KontoPrzewodnika,
  WynikiKalkulacji,
} from '@/domena/typy';

/** Dane konta bez rodziny (Nowy użytkownik albo Administrator). */
export interface KontekstKontaBezRodziny {
  konto: KontoPrzewodnika;
  katalog: Katalog;
  kopia: DaneZKontaZus | null;
  wyniki: WynikiKalkulacji;
}

/** Kontekst z profilu, planu, wniosków, wyników i katalogu. Zaślepka zwraca pusty kontekst roli. */
export function zbudujKontekstAsystenta(k: KontekstRodziny | KontekstKontaBezRodziny, dzis: DataISO): KontekstAsystenta {
  return {
    rola: k.konto.rola,
    dzis,
    zgoda: false,
    profil: null,
    sprawy: [],
    wnioski: [],
    wyniki: [],
    daneZus: null,
    katalog: { kwoty: [], pozycje: [] },
  };
}
