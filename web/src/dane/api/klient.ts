// Klient REST API w wersji 1 dla przeglądarki: jedna funkcja typowana na każdy punkt końcowy z src/app/api/v1/**.
// Funkcje zwracają WynikOperacji: dane odpowiedzi albo kod komunikatu z tablicy komunikatów z kodami pól.
// Błąd sieci, przekroczenie limitu czasu i odpowiedź w nieznanym formacie dają kod zastępczy punktu końcowego:
// 0335 dla wyliczeń i walidacji, 0001 dla danych konta ZUS, 0133 dla PUE/eZUS i 0044 dla wysyłki wniosku.
// Wywołuj funkcje w obsłudze zdarzeń albo efektach; dzień „dzisiaj” i datę demo przekaż w polu `dzis` albo `dataDemo`.
import type {
  BladApi,
  CzasZadaniaApi,
  OdpowiedzEzlaApi,
  OdpowiedzKontaZusApi,
  OdpowiedzPlanuApi,
  OdpowiedzPodzialuUrlopuApi,
  OdpowiedzPytaniaDoZusApi,
  OdpowiedzStanuRozliczenApi,
  OdpowiedzSwiadczenWCiazyApi,
  OdpowiedzWalidacjiApi,
  OdpowiedzWariantuApi,
  OdpowiedzWeryfikacjiSprawyApi,
  OdpowiedzWnioskuDoZusApi,
  OdpowiedzZasilkuMacierzynskiegoApi,
  OdpowiedzZaswiadczeniaApi,
  OdpowiedzZrodlowychDanychKontaZusApi,
  RodzajWalidacjiApi,
  SymulacjaApi,
  ZadanieEzlaApi,
  ZadanieKontaZusApi,
  ZadaniePlanuApi,
  ZadaniePodzialuUrlopuApi,
  ZadaniePytaniaDoZusApi,
  ZadanieStanuRozliczenApi,
  ZadanieSwiadczenWCiazyApi,
  ZadanieWalidacjiApi,
  ZadanieWariantuApi,
  ZadanieWeryfikacjiSprawyApi,
  ZadanieWnioskuDoZusApi,
  ZadanieZasilkuMacierzynskiegoApi,
  ZadanieZaswiadczeniaApi,
} from '@/domena/typy/api-v1';
import type { DataISO, KodKomunikatu, Pesel, WynikOperacji } from '@/domena/typy';

const ADRES_API = '/api/v1';
/** Limit czasu żądania w milisekundach; wyliczenie planu rodziny jest najdłuższą operacją API. */
export const LIMIT_CZASU_API_MS = 15_000;

/** Opcje wywołania: limit czasu, sygnał przerwania z komponentu i włączone przełączniki symulacji z ustawień demo. */
export interface OpcjeWywolania {
  limitCzasuMs?: number;
  sygnal?: AbortSignal;
  symulacje?: readonly SymulacjaApi[];
  /** Data demonstracyjna z ustawień demo, wysyłana w nagłówku X-Data-Demo. */
  dataDemo?: DataISO | null;
}

function czyBladApi(w: unknown): w is BladApi {
  return typeof w === 'object' && w !== null && typeof (w as { kod?: unknown }).kod === 'string' && /^\d{4}$/.test((w as { kod: string }).kod);
}

function sygnalWywolania(o: OpcjeWywolania): AbortSignal {
  const limit = AbortSignal.timeout(o.limitCzasuMs ?? LIMIT_CZASU_API_MS);
  return o.sygnal ? AbortSignal.any([o.sygnal, limit]) : limit;
}

async function wywolaj<T>(
  metoda: 'GET' | 'POST',
  sciezka: string,
  kodZastepczy: KodKomunikatu,
  tresc: object | undefined,
  o: OpcjeWywolania = {},
): Promise<WynikOperacji<T>> {
  // PESEL i inne dane osobowe jadą wyłącznie w treści żądania POST, którą szyfruje połączenie HTTPS;
  // adres i nagłówki żądania nie zawierają danych osobowych.
  const naglowki: Record<string, string> = { Accept: 'application/json' };
  if (tresc !== undefined) naglowki['Content-Type'] = 'application/json';
  if (o.symulacje && o.symulacje.length > 0) naglowki['X-Symulacje'] = o.symulacje.join(',');
  if (o.dataDemo) naglowki['X-Data-Demo'] = o.dataDemo;
  let odpowiedz: Response;
  try {
    odpowiedz = await fetch(`${ADRES_API}${sciezka}`, {
      method: metoda,
      headers: naglowki,
      ...(tresc !== undefined ? { body: JSON.stringify(tresc) } : {}),
      signal: sygnalWywolania(o),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, kod: kodZastepczy };
  }
  let dane: unknown;
  try {
    dane = await odpowiedz.json();
  } catch {
    return { ok: false, kod: kodZastepczy };
  }
  if (!odpowiedz.ok) {
    if (!czyBladApi(dane)) return { ok: false, kod: kodZastepczy };
    return {
      ok: false,
      kod: dane.kod,
      ...(dane.pola ? { bledyPol: dane.pola } : {}),
      ...(dane.parametry ? { parametry: dane.parametry } : {}),
    };
  }
  return { ok: true, wartosc: dane as T };
}

/** Pola czasu żądania (`dzis`, `dataDemo`, `teraz`) bez pustych wartości. */
function czasZadania(p: CzasZadaniaApi): CzasZadaniaApi {
  return {
    ...(p.dzis ? { dzis: p.dzis } : {}),
    ...(p.dataDemo ? { dataDemo: p.dataDemo } : {}),
    ...(p.teraz ? { teraz: p.teraz } : {}),
  };
}

// --- Kalkulatory decyzji ----------------------------------------------------------------------------

export function wyliczZasilekMacierzynski(z: ZadanieZasilkuMacierzynskiegoApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzZasilkuMacierzynskiegoApi>('POST', '/kalkulator/zasilek-macierzynski', '0335', z, o);
}

export function porownajWariantyZasilku(z: ZadanieWariantuApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzWariantuApi>('POST', '/kalkulator/wariant', '0335', z, o);
}

export function wyliczPodzialUrlopu(z: ZadaniePodzialuUrlopuApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzPodzialuUrlopuApi>('POST', '/kalkulator/podzial-urlopu', '0335', z, o);
}

// --- Plan rodziny i świadczenia -----------------------------------------------------------------------

export function wyliczPlanRodziny(z: ZadaniePlanuApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzPlanuApi>('POST', '/plan', '0335', z, o);
}

export function ustalSwiadczeniaWCiazy(z: ZadanieSwiadczenWCiazyApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzSwiadczenWCiazyApi>('POST', '/swiadczenia-w-ciazy', '0335', z, o);
}

// --- Przykładowe sprawy ---------------------------------------------------------------------------------

export function zweryfikujPrzykladowaSprawe(z: ZadanieWeryfikacjiSprawyApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzWeryfikacjiSprawyApi>('POST', '/przykladowe-sprawy/weryfikacja', '0335', z, o);
}

// --- Symulowany ZUS -------------------------------------------------------------------------------------

export interface ParametryOdczytuKonta extends CzasZadaniaApi { zgodaNaDaneZdrowia?: boolean }

export function odczytajDaneKontaZus(pesel: Pesel, p: ParametryOdczytuKonta = {}, o?: OpcjeWywolania) {
  const z: ZadanieKontaZusApi = { pesel, ...czasZadania(p), ...(p.zgodaNaDaneZdrowia === false ? { zgodaNaDaneZdrowia: false } : {}) };
  return wywolaj<OdpowiedzKontaZusApi>('POST', '/zus/konto', '0001', z, o);
}

/** Parametry odczytu danych źródłowych konta; `kanal: 'pue-ezus'` oznacza odczyt przez PUE/eZUS (0133 przy niedostępnym PUE/eZUS). */
export interface ParametryOdczytuZrodla extends CzasZadaniaApi { zgodaNaDaneZdrowia: boolean; kanal?: 'pue-ezus' }

/** Dane źródłowe konta przed filtrami odczytu; bez zgody na dane dotyczące zdrowia odpowiedź nie zawiera zaświadczeń e-ZLA. */
export function odczytajZrodloweDaneKontaZus(pesel: Pesel, p: ParametryOdczytuZrodla, o?: OpcjeWywolania) {
  const z: ZadanieKontaZusApi = {
    pesel,
    postac: 'zrodlowe',
    ...czasZadania(p),
    ...(p.zgodaNaDaneZdrowia ? {} : { zgodaNaDaneZdrowia: false }),
    ...(p.kanal ? { kanal: p.kanal } : {}),
  };
  return wywolaj<OdpowiedzZrodlowychDanychKontaZusApi>('POST', '/zus/konto', '0001', z, o);
}

export function odczytajStanRozliczen(pesel: Pesel, p: CzasZadaniaApi & { dzien?: DataISO } = {}, o?: OpcjeWywolania) {
  const z: ZadanieStanuRozliczenApi = { pesel, ...czasZadania(p), ...(p.dzien ? { dzien: p.dzien } : {}) };
  return wywolaj<OdpowiedzStanuRozliczenApi>('POST', '/zus/konto/stan-rozliczen', '0133', z, o);
}

/** Zaświadczenia e-ZLA wymagają zgody na dane dotyczące zdrowia; bez zgody API odpowiada kodem 0004. */
export function odczytajZaswiadczeniaEzla(pesel: Pesel, p: CzasZadaniaApi & { zgodaNaDaneZdrowia: boolean }, o?: OpcjeWywolania) {
  const z: ZadanieEzlaApi = { pesel, zgodaNaDaneZdrowia: p.zgodaNaDaneZdrowia, ...czasZadania(p) };
  return wywolaj<OdpowiedzEzlaApi>('POST', '/zus/konto/e-zla', '0001', z, o);
}

export function zawnioskujOZaswiadczenieONiezaleganiu(z: ZadanieZaswiadczeniaApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzZaswiadczeniaApi>('POST', '/zus/zaswiadczenia-o-niezaleganiu', '0133', z, o);
}

export function wyslijWniosekDoZus(z: ZadanieWnioskuDoZusApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzWnioskuDoZusApi>('POST', '/zus/wnioski', '0044', z, o);
}

export function wyslijPytanieDoZus(z: ZadaniePytaniaDoZusApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzPytaniaDoZusApi>('POST', '/zus/pytania', '0133', z, o);
}

// --- Walidacje ----------------------------------------------------------------------------------------------

export function walidujNaSerwerze(rodzaj: RodzajWalidacjiApi, z: ZadanieWalidacjiApi, o?: OpcjeWywolania) {
  return wywolaj<OdpowiedzWalidacjiApi>('POST', `/walidacje/${encodeURIComponent(rodzaj)}`, '0335', z, o);
}
