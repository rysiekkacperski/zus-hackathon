// Właściciel danych sesji i wyników kalkulacji: zalogowane konto albo gość (tryb gościa).
//
// Kalkulator zasiłku i przykładowe sprawy działają także bez logowania. Operacje tych elementów systemu czytają
// i zapisują stan sesji (StanSesji) oraz wyniki kalkulacji przez funkcje z tego pliku, więc ten sam kod obsługuje
// konto i gościa. Gościem jest karta bez zalogowanego konta; sesję gościa zakłada pierwszy zapis.
import type { KontekstOperacji, Pesel, Rola, StanSesji, WynikiKalkulacji } from '@/domena/typy';
import {
  odczytajSesjeGoscia,
  odczytajStanSesjiGoscia,
  odczytajWynikiKalkulacjiGoscia,
  zapewnijSesjeGoscia,
  zmienStanSesjiGoscia,
  zmienWynikiKalkulacjiGoscia,
} from '@/dane/magazyn/gosc';
import { KLUCZ_PRZENIESIENIE_GOSCIA, wlascicielGoscia } from '@/dane/magazyn/klucze';
import { odczytaj } from '@/dane/magazyn/rdzen';
import {
  odczytajStanKonta,
  odczytajStanSesji,
  odczytajZalogowanego,
  rodzinaKonta,
  zmienStanKonta,
  zmienStanSesji,
} from '@/dane/magazyn/stan';
import { wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';

/**
 * Właściciel danych. `id` trafia do pól `konto` przykładowej sprawy, dokumentów i scenariuszy oraz do właściciela
 * plików w IndexedDB: PESEL konta albo 'gosc:<idSesjiGoscia>'. `idSesji` to identyfikator sesji konta albo sesji
 * gościa (idSesji plików sesji). `zGoscia` podaje identyfikator gościa, którego stan przeniosło logowanie w tej karcie.
 */
export type WlascicielDanych =
  | { rodzaj: 'konto'; id: Pesel; pesel: Pesel; idSesji: string; rola: Rola; zGoscia?: string }
  | { rodzaj: 'gosc'; id: string; idSesji: string };

/** Znacznik przeniesienia stanu gościa do sesji konta (sessionStorage ppm:v1:gosc-przeniesiony). */
export interface PrzeniesienieGoscia {
  zGoscia: string;
  idSesji: string;
}

/** Karta bez zalogowanego konta, czyli gość. */
export function czyGosc(): boolean {
  return odczytajZalogowanego() === null;
}

let ostatni: { klucz: string; wlasciciel: WlascicielDanych | null } = { klucz: '', wlasciciel: null };

/** Ta sama referencja dla tego samego właściciela (stabilna migawka hooka useWlascicielDanych). */
function zapamietaj(wlasciciel: WlascicielDanych | null): WlascicielDanych | null {
  const klucz = wlasciciel === null ? '' : JSON.stringify(wlasciciel);
  if (klucz !== ostatni.klucz) ostatni = { klucz, wlasciciel };
  return ostatni.wlasciciel;
}

/** Właściciel danych: zalogowane konto, gość z sesją gościa albo null (gość przed pierwszym zapisem). */
export function odczytajWlasciciela(): WlascicielDanych | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany !== null) {
    const { sesja, stanKonta } = zalogowany;
    const przeniesienie = odczytaj<PrzeniesienieGoscia>(KLUCZ_PRZENIESIENIE_GOSCIA, 'sessionStorage');
    return zapamietaj({
      rodzaj: 'konto',
      id: sesja.pesel,
      pesel: sesja.pesel,
      idSesji: sesja.idSesji,
      rola: stanKonta.konto.rola,
      ...(przeniesienie?.idSesji === sesja.idSesji ? { zGoscia: przeniesienie.zGoscia } : {}),
    });
  }
  const gosc = odczytajSesjeGoscia();
  if (gosc === null) return zapamietaj(null);
  return zapamietaj({ rodzaj: 'gosc', id: wlascicielGoscia(gosc.idSesjiGoscia), idSesji: gosc.idSesjiGoscia });
}

/** Właściciel do zapisu: zalogowane konto albo gość; gość bez sesji gościa dostaje nową sesję. Wywołuj w operacji. */
export function zapewnijWlasciciela(ctx: KontekstOperacji): WlascicielDanych {
  const wlasciciel = odczytajWlasciciela();
  if (wlasciciel !== null) return wlasciciel;
  const sesja = zapewnijSesjeGoscia(ctx);
  return { rodzaj: 'gosc', id: wlascicielGoscia(sesja.idSesjiGoscia), idSesji: sesja.idSesjiGoscia };
}

/** Czy właściciel nadal jest bieżącym właścicielem (operacja asynchroniczna kończy zapis po odczycie przez API). */
export function czyBiezacyWlasciciel(wlasciciel: WlascicielDanych): boolean {
  const biezacy = odczytajWlasciciela();
  return biezacy !== null && biezacy.rodzaj === wlasciciel.rodzaj && biezacy.idSesji === wlasciciel.idSesji;
}

// --- Stan sesji ---------------------------------------------------------------------------------

export function odczytajStanSesjiDla(wlasciciel: WlascicielDanych): StanSesji | null {
  return wlasciciel.rodzaj === 'konto'
    ? odczytajStanSesji(wlasciciel.idSesji)
    : odczytajStanSesjiGoscia(wlasciciel.idSesji);
}

/** Stan sesji bieżącego właściciela: dane sesji konta albo stan sesji gościa; null bez sesji. */
export function odczytajStanSesjiWlasciciela(): StanSesji | null {
  const wlasciciel = odczytajWlasciciela();
  return wlasciciel === null ? null : odczytajStanSesjiDla(wlasciciel);
}

/**
 * Zmienia stan sesji podanego właściciela (zapis systemowy). Zwraca null, gdy sesja właściciela już się skończyła
 * (wylogowanie, zalogowanie gościa), i niczego wtedy nie zapisuje.
 */
export function zmienStanSesjiDla(wlasciciel: WlascicielDanych, fn: (stan: StanSesji) => StanSesji): StanSesji | null {
  if (!czyBiezacyWlasciciel(wlasciciel)) return null;
  return wlasciciel.rodzaj === 'konto'
    ? zmienStanSesji(wlasciciel.idSesji, fn)
    : zmienStanSesjiGoscia(wlasciciel.idSesji, fn);
}

/** Zmienia stan sesji bieżącego właściciela; gość bez sesji gościa dostaje nową. Wywołuj w operacji. */
export function zmienStanSesjiWlasciciela(fn: (stan: StanSesji) => StanSesji, ctx: KontekstOperacji): StanSesji {
  const wlasciciel = zapewnijWlasciciela(ctx);
  return wlasciciel.rodzaj === 'konto'
    ? zmienStanSesji(wlasciciel.idSesji, fn)
    : zmienStanSesjiGoscia(wlasciciel.idSesji, fn);
}

// --- Wyniki kalkulacji --------------------------------------------------------------------------

const WYNIKI_PUSTE: WynikiKalkulacji = Object.freeze({
  ...wynikiKalkulacjiPuste(),
  scenariusze: Object.freeze([]) as unknown as WynikiKalkulacji['scenariusze'],
  porownaniaWariantow: Object.freeze([]) as unknown as WynikiKalkulacji['porownaniaWariantow'],
  podzialyUrlopu: Object.freeze([]) as unknown as WynikiKalkulacji['podzialyUrlopu'],
});

/** Puste wyniki kalkulacji (ta sama referencja przy każdym odczycie). */
export function wynikiKalkulacjiBrak(): WynikiKalkulacji {
  return WYNIKI_PUSTE;
}

/** Zakres wyników kalkulacji bieżącego właściciela. */
export type ZakresWynikowKalkulacji = 'rodzina' | 'konto' | 'gosc';

/**
 * Wyniki kalkulacji, które pokazuje kalkulator: rodziny (Rodzic i Drugi rodzic z widoczną rodziną), konta (pozostałe
 * konta) albo gościa. Bez zapisanych wyników zwraca puste wyniki.
 */
export function odczytajWynikiKalkulacjiWlasciciela(): WynikiKalkulacji {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany !== null) {
    const { stanKonta } = zalogowany;
    const rola = stanKonta.konto.rola;
    const rodzina = rola === 'rodzic' || rola === 'drugi-rodzic' ? rodzinaKonta(stanKonta.konto) : null;
    return rodzina?.wynikiKalkulacji ?? stanKonta.wynikiKalkulacji;
  }
  const gosc = odczytajSesjeGoscia();
  return (gosc === null ? null : odczytajWynikiKalkulacjiGoscia(gosc.idSesjiGoscia)) ?? WYNIKI_PUSTE;
}

export function odczytajZakresWynikowKalkulacji(): ZakresWynikowKalkulacji {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return 'gosc';
  const { konto } = zalogowany.stanKonta;
  const zRodzina = (konto.rola === 'rodzic' || konto.rola === 'drugi-rodzic') && rodzinaKonta(konto) !== null;
  return zRodzina ? 'rodzina' : 'konto';
}

/**
 * Własne wyniki kalkulacji właściciela: Wyniki kalkulacji konta (StanKonta.wynikiKalkulacji) albo wyniki gościa.
 * Null, gdy konto nie istnieje.
 */
export function odczytajWynikiKalkulacjiKonta(wlasciciel: WlascicielDanych): WynikiKalkulacji | null {
  if (wlasciciel.rodzaj === 'konto') return odczytajStanKonta(wlasciciel.pesel)?.wynikiKalkulacji ?? null;
  return odczytajWynikiKalkulacjiGoscia(wlasciciel.idSesji) ?? WYNIKI_PUSTE;
}

/** Zmienia własne wyniki kalkulacji właściciela (zapis domenowy); null, gdy konto nie istnieje. */
export function zmienWynikiKalkulacjiKonta(
  wlasciciel: WlascicielDanych,
  fn: (wyniki: WynikiKalkulacji) => WynikiKalkulacji,
): WynikiKalkulacji | null {
  if (wlasciciel.rodzaj === 'konto') {
    return (
      zmienStanKonta(wlasciciel.pesel, (stan) => ({ ...stan, wynikiKalkulacji: fn(stan.wynikiKalkulacji) }))
        ?.wynikiKalkulacji ?? null
    );
  }
  return zmienWynikiKalkulacjiGoscia(wlasciciel.idSesji, fn);
}
