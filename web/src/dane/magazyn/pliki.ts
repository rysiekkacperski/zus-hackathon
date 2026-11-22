// Pliki w IndexedDB (kontrakt, sekcje 6.2 i 6.3): baza `ppm-pliki`, magazyn `pliki`.
// Baza przechowuje wyłącznie pliki wgrane przez użytkownika i wygenerowane przez przewodnik.
// Odwołania do plików (identyfikator, nazwa, rozmiar, typ) zapisują grupy danych w localStorage.
import type { IdPliku, Pesel, RekordPliku, ZnacznikCzasu } from '@/domena/typy';
import { MAGAZYN_PLIKOW, NAZWA_BAZY_PLIKOW, WERSJA_BAZY_PLIKOW } from '@/dane/magazyn/klucze';
import { losowyUuid } from '@/dane/magazyn/losowanie';
import { BladZapisu } from '@/dane/magazyn/rdzen';
import { czySymulacja } from '@/dane/magazyn/stan';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';

const INDEKS_WLASCICIELA = 'wlasciciel';
const INDEKS_SESJI = 'idSesji';

export type MetadanePliku = Omit<RekordPliku, 'blob'>;

let otwieranie: Promise<IDBDatabase> | null = null;

function zadanie<T>(prosba: IDBRequest<T>): Promise<T> {
  return new Promise((rozwiaz, odrzuc) => {
    prosba.onsuccess = () => rozwiaz(prosba.result);
    prosba.onerror = () => odrzuc(prosba.error);
  });
}

function otworzBaze(): Promise<IDBDatabase> {
  if (otwieranie) return otwieranie;
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('Przeglądarka nie udostępnia IndexedDB.'));
  }
  otwieranie = new Promise<IDBDatabase>((rozwiaz, odrzuc) => {
    const prosba = indexedDB.open(NAZWA_BAZY_PLIKOW, WERSJA_BAZY_PLIKOW);
    prosba.onupgradeneeded = () => {
      const baza = prosba.result;
      if (!baza.objectStoreNames.contains(MAGAZYN_PLIKOW)) {
        const magazyn = baza.createObjectStore(MAGAZYN_PLIKOW, { keyPath: 'id' });
        magazyn.createIndex(INDEKS_WLASCICIELA, 'wlasciciel', { unique: false });
        magazyn.createIndex(INDEKS_SESJI, 'idSesji', { unique: false });
      }
    };
    prosba.onsuccess = () => {
      const baza = prosba.result;
      // Inna karta usuwa albo podnosi wersję bazy: zamykamy połączenie i otworzymy je od nowa.
      baza.onversionchange = () => {
        baza.close();
        otwieranie = null;
      };
      rozwiaz(baza);
    };
    prosba.onerror = () => {
      otwieranie = null;
      odrzuc(prosba.error);
    };
    prosba.onblocked = () => {
      otwieranie = null;
      odrzuc(new Error('Otwarcie bazy plików zablokowała inna karta przewodnika.'));
    };
  });
  return otwieranie;
}

async function wTransakcjiPlikow<T>(
  tryb: IDBTransactionMode,
  fn: (magazyn: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const baza = await otworzBaze();
  const transakcja = baza.transaction(MAGAZYN_PLIKOW, tryb);
  const zakonczenie = new Promise<void>((rozwiaz, odrzuc) => {
    transakcja.oncomplete = () => rozwiaz();
    transakcja.onerror = () => odrzuc(transakcja.error);
    transakcja.onabort = () => odrzuc(transakcja.error ?? new Error('Transakcja bazy plików przerwana.'));
  });
  let wynik: T;
  try {
    wynik = await fn(transakcja.objectStore(MAGAZYN_PLIKOW));
  } catch (blad) {
    zakonczenie.catch(() => undefined);
    try {
      transakcja.abort();
    } catch {
      // Transakcja mogła się już zakończyć.
    }
    throw blad;
  }
  await zakonczenie;
  return wynik;
}

function bezZawartosci(rekord: RekordPliku): MetadanePliku {
  const { blob, ...metadane } = rekord;
  void blob;
  return metadane;
}

/**
 * Zapisuje plik i zwraca jego identyfikator. Rzuca BladZapisu przy symulacji błędu zapisu albo gdy
 * przeglądarka odrzuci zapis (brak miejsca, zablokowana baza); operacja zamienia go na 0003.
 */
export async function zapiszPlik(
  plik: File | Blob,
  o: { nazwa: string; wlasciciel: Pesel; idSesji?: string; wygasa?: ZnacznikCzasu },
): Promise<IdPliku> {
  if (czySymulacja('bladZapisu')) throw new BladZapisu('symulacja');
  const rekord: RekordPliku = {
    id: `PLIK-${losowyUuid()}`,
    blob: plik,
    nazwa: o.nazwa,
    typ: plik.type,
    rozmiar: plik.size,
    wgrano: pobierzKontekstOperacji().teraz,
    wlasciciel: o.wlasciciel,
    ...(o.idSesji === undefined ? {} : { idSesji: o.idSesji }),
    ...(o.wygasa === undefined ? {} : { wygasa: o.wygasa }),
  };
  try {
    await wTransakcjiPlikow('readwrite', (magazyn) => zadanie(magazyn.put(rekord)));
  } catch (blad) {
    throw new BladZapisu('magazyn', { cause: blad });
  }
  return rekord.id;
}

/** Zawartość pliku albo null, gdy pliku nie ma (usunięty, wygasły, niedostępna baza). */
export async function pobierzPlik(id: IdPliku): Promise<{ blob: Blob; nazwa: string; typ: string } | null> {
  try {
    const rekord = await wTransakcjiPlikow('readonly', (magazyn) =>
      zadanie(magazyn.get(id) as IDBRequest<RekordPliku | undefined>),
    );
    return rekord ? { blob: rekord.blob, nazwa: rekord.nazwa, typ: rekord.typ } : null;
  } catch {
    return null;
  }
}

export async function pobierzMetadanePliku(id: IdPliku): Promise<MetadanePliku | null> {
  try {
    const rekord = await wTransakcjiPlikow('readonly', (magazyn) =>
      zadanie(magazyn.get(id) as IDBRequest<RekordPliku | undefined>),
    );
    return rekord ? bezZawartosci(rekord) : null;
  } catch {
    return null;
  }
}

export async function usunPlik(id: IdPliku): Promise<void> {
  try {
    await wTransakcjiPlikow('readwrite', (magazyn) => zadanie(magazyn.delete(id)));
  } catch {
    // Brak bazy oznacza brak pliku.
  }
}

async function usunPasujace(
  wybierz: (magazyn: IDBObjectStore) => IDBRequest<RekordPliku[]>,
  warunek: (rekord: RekordPliku) => boolean = () => true,
): Promise<number> {
  try {
    return await wTransakcjiPlikow('readwrite', async (magazyn) => {
      const rekordy = (await zadanie(wybierz(magazyn))).filter(warunek);
      await Promise.all(rekordy.map((r) => zadanie(magazyn.delete(r.id))));
      return rekordy.length;
    });
  } catch {
    return 0;
  }
}

/** Usuwa pliki sesji (dokumenty przykładowej sprawy) przy końcu sesji. */
export function usunPlikiSesji(idSesji: string): Promise<number> {
  return usunPasujace((magazyn) => magazyn.index(INDEKS_SESJI).getAll(idSesji) as IDBRequest<RekordPliku[]>);
}

/** Usuwa pliki z terminem ważności `wygasa` nie późniejszym niż `teraz`. */
export function usunPlikiWygasle(teraz: ZnacznikCzasu): Promise<number> {
  return usunPasujace(
    (magazyn) => magazyn.getAll() as IDBRequest<RekordPliku[]>,
    (rekord) => rekord.wygasa !== undefined && rekord.wygasa <= teraz,
  );
}

/** Usuwa wszystkie pliki konta (przywrócenie stanu początkowego). */
export function usunPlikiWlasciciela(pesel: Pesel): Promise<number> {
  return usunPasujace((magazyn) => magazyn.index(INDEKS_WLASCICIELA).getAll(pesel) as IDBRequest<RekordPliku[]>);
}

/**
 * Przenosi pliki sesji do innego właściciela i sesji: dokumenty przykładowej sprawy gościa po zalogowaniu
 * trafiają do konta i jego sesji, więc znikają razem z końcem sesji konta. Termin `wygasa` zostaje bez zmian.
 */
export async function przeniesPlikiSesji(zSesji: string, cel: { wlasciciel: Pesel; idSesji: string }): Promise<number> {
  try {
    return await wTransakcjiPlikow('readwrite', async (magazyn) => {
      const rekordy = await zadanie(magazyn.index(INDEKS_SESJI).getAll(zSesji) as IDBRequest<RekordPliku[]>);
      await Promise.all(
        rekordy.map((r) => zadanie(magazyn.put({ ...r, wlasciciel: cel.wlasciciel, idSesji: cel.idSesji }))),
      );
      return rekordy.length;
    });
  } catch {
    return 0;
  }
}
