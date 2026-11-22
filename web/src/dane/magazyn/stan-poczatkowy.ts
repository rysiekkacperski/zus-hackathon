// Wartości początkowe układu stanu w przeglądarce (kontrakt, sekcje 5.15 i 6.6).
// Parametry systemu pochodzą z dane/parametry-systemu.ts.
// Funkcje zwracają nowe obiekty, więc wywołujący może je bezpiecznie rozszerzać.
import type {
  EdycjeKatalogu,
  InterakcjeAsystenta,
  KontoDemo,
  KontoPrzewodnika,
  Pesel,
  Rola,
  StanGlobalny,
  StanInterfejsu,
  StanKonta,
  StanSesji,
  StanSymulowanegoZus,
  WynikiKalkulacji,
  ZnacznikCzasu,
} from '@/domena/typy';
import { WERSJA_SCHEMATU } from '@/dane/magazyn/klucze';
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';

/** Wersja katalogu bez edycji Administratora. Każda edycja i przywrócenie katalogu ją zwiększa. */
export const WERSJA_KATALOGU_POCZATKOWA = 1;

export function edycjeKataloguPoczatkowe(wersja: number = WERSJA_KATALOGU_POCZATKOWA): EdycjeKatalogu {
  return { wersja, noweWersje: [], nowePozycje: [], podmioty: { dodane: [], zmienione: [] } };
}

export function stanGlobalnyPoczatkowy(): StanGlobalny {
  return {
    wersjaSchematu: WERSJA_SCHEMATU,
    noweKontaDemo: [],
    parametry: utworzParametryPoczatkowe(),
    edycjeKatalogu: edycjeKataloguPoczatkowe(),
    licznikiPotwierdzen: {},
    zaproszenia: {},
  };
}

export function wynikiKalkulacjiPuste(): WynikiKalkulacji {
  return { scenariusze: [], porownaniaWariantow: [], podzialyUrlopu: [], nastepnyNumer: 1 };
}

export function interakcjeAsystentaPuste(): InterakcjeAsystenta {
  return { rozmowy: [], audyt: [] };
}

/** Rola nadawana kontu przewodnika przy pierwszym zalogowaniu (analiza 01, R2 i R3). */
export function rolaPoczatkowa(konto: Pick<KontoDemo, 'rodzaj'>): Rola {
  return konto.rodzaj === 'konto-administratora' ? 'administrator' : 'nowy-uzytkownik';
}

export function kontoPrzewodnikaZKontaDemo(konto: KontoDemo, utworzono: ZnacznikCzasu): KontoPrzewodnika {
  return {
    pesel: konto.pesel,
    imie: konto.imie,
    nazwisko: konto.nazwisko,
    imieINazwiskoDopelniacz: konto.imieINazwiskoDopelniacz,
    dataUrodzenia: konto.dataUrodzenia,
    plec: konto.plec,
    rola: rolaPoczatkowa(konto),
    rodzajKonta: konto.rodzaj,
    idRodziny: null,
    historiaSesji: [],
    decyzjeOZgodzie: [],
    utworzono,
  };
}

export function stanKontaPoczatkowy(konto: KontoPrzewodnika): StanKonta {
  return {
    konto,
    ustawienia: null,
    powiadomienia: [],
    kopiaDanychZus: null,
    stanOdczytuZus: { stan: 'brak' },
    szkicProfilu: null,
    wynikiKalkulacji: wynikiKalkulacjiPuste(),
    interakcjeAsystenta: interakcjeAsystentaPuste(),
  };
}

export function stanSymulowanegoZusPoczatkowy(pesel: Pesel): StanSymulowanegoZus {
  return { pesel, korespondencja: [], wnioskiZPrzewodnika: [], zaswiadczeniaORozliczeniach: [] };
}

export function stanSesjiPoczatkowy(): StanSesji {
  return { powiazaniaZastepcze: [], panelAsystenta: { otwarty: false, szkic: '' }, plikiSesji: [] };
}

export function stanInterfejsuPoczatkowy(): StanInterfejsu {
  return { menuZwiniete: false };
}
