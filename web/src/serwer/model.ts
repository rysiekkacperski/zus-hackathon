import 'server-only';

import { ChatAnthropic } from '@langchain/anthropic';
import { ModelRefusalError } from '@langchain/core/errors';
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import type { BaseMessage } from '@langchain/core/messages';
import { ChatDeepSeek } from '@langchain/deepseek';

// Fabryka modelu językowego dla asystenta AI i odczytu dokumentów (kontrakt, sekcja 10.1).
//
// Dostawcę wybiera zmienna `MODEL_DOSTAWCA`: `deepseek` (domyślnie) albo `anthropic`.
// Klucze `DEEPSEEK_API_KEY` i `ANTHROPIC_API_KEY` czyta wyłącznie kod serwera z `process.env`.
//
// Zasady wywołań:
// - asystent AI i odczyt dokumentów PDF i obrazów (`zPlikami: true`) korzystają z dostawcy z `MODEL_DOSTAWCA`;
// - DeepSeek `deepseek-flash` przyjmuje tekst, obrazy (część `image_url` z adresem data URL base64)
//   i dokumenty PDF (część `{ type: 'file', file_id }` po wgraniu pliku funkcją `wgrajDokumentDeepSeek`);
//   wejście z plikami trafia do `deepseek-flash` także wtedy, gdy `DEEPSEEK_MODEL` wskazuje model tekstowy;
// - fabryka pomija `temperature`, `topK` i `topP`; Anthropic dostaje domyślne myślenie adaptacyjne
//   z głębokością z `outputConfig.effort`, a DeepSeek działa w trybie bez myślenia (`thinking: { type: 'disabled' }`),
//   bo w trybie myślenia API odrzuca nazwany `tool_choice` wyniku strukturalnego kodem 400; tryb bez myślenia
//   mieści też odczyt dokumentu w limicie 30 s i limity tokenów odpowiedzi;
// - wynik strukturalny daje `wywolajZeSchematem`: Anthropic dostaje JSON Schema w `outputConfig.format`,
//   a DeepSeek wywołanie funkcji `wynik` z tym samym schematem;
// - odmowa modelu (`stop_reason: 'refusal'`, `finish_reason: 'content_filter'`), ucięta odpowiedź,
//   błąd API i przekroczenie limitu czasu kończą się błędem `BladModelu`, który punkt końcowy zamienia
//   na odpowiedź o niedostępności (0071 dla asystenta, `{ status: 'niedostepny' }` dla odczytu dokumentu).

export type DostawcaModelu = 'deepseek' | 'anthropic';

/** Dostawca używany, gdy zmienna `MODEL_DOSTAWCA` jest pusta, nieustawiona albo ma nieznaną wartość. */
export const DOSTAWCA_DOMYSLNY: DostawcaModelu = 'deepseek';

/** Modele używane, gdy zmienna `DEEPSEEK_MODEL` albo `ANTHROPIC_MODEL` jest pusta albo nieustawiona. */
export const MODEL_DOMYSLNY: Record<DostawcaModelu, string> = {
  deepseek: 'deepseek-flash',
  anthropic: 'claude-opus-5-5',
};

/** Limit tokenów odpowiedzi bez strumieniowania, mieszczący wywołanie w limicie czasu żądania HTTP. */
const MAKS_TOKENOW_DOMYSLNIE = 16_000;

/**
 * Najwyższy `max_tokens`, który `@anthropic-ai/sdk` przyjmuje bez strumieniowania
 * (szacowany czas 60 min × max_tokens / 128 000 nie przekracza 10 min). Wyższa wartość kończy się
 * błędem „Streaming is required” przed wysłaniem żądania.
 */
const MAKS_TOKENOW_BEZ_STRUMIENIA = 21_333;

/**
 * Najwyższy `max_tokens` odpowiedzi DeepSeek w aplikacji. Model `deepseek-flash` przyjmuje do 393 216 tokenów
 * odpowiedzi, a aplikacja ogranicza odpowiedź do 8 192 tokenów, które mieszczą wynik w limicie czasu żądania HTTP.
 */
const MAKS_TOKENOW_DEEPSEEK = 8_192;

/** Model DeepSeek dla wejścia z obrazami i dokumentami PDF. */
const MODEL_DEEPSEEK_Z_PLIKAMI = 'deepseek-flash';

/** Modele DeepSeek, które przyjmują obrazy i pliki; pozostałe modele dostają wyłącznie tekst. */
const MODELE_DEEPSEEK_Z_PLIKAMI: readonly string[] = [MODEL_DEEPSEEK_Z_PLIKAMI];

/**
 * Parametry żądania DeepSeek wyłączające tryb myślenia, który model `deepseek-flash` włącza domyślnie z wysiłkiem `high`.
 * Wynik strukturalny wymaga trybu bez myślenia, bo w trybie myślenia API odrzuca nazwany `tool_choice` kodem 400.
 */
const PARAMETRY_DEEPSEEK = { thinking: { type: 'disabled' } };

/** Adres API DeepSeek, ten sam, którego używa `ChatDeepSeek`. */
const ADRES_API_DEEPSEEK = 'https://api.deepseek.com';

/** Najkrótsza ważność pliku w Files API DeepSeek (1 godzina), bo aplikacja nie przechowuje dokumentów. */
const WAZNOSC_PLIKU_DEEPSEEK_S = 3_600;

/** Nazwa funkcji, którą DeepSeek wywołuje w trybie wyniku strukturalnego. */
const NAZWA_FUNKCJI_WYNIKU = 'wynik';

/** Ponowienia przy błędach przejściowych (429, 5xx, sieć). Sygnał przerwania grafu kończy ponowienia. */
const LICZBA_PONOWIEN = 2;

/** Model czatu zwracany przez `utworzModel`. */
export type ModelCzatu = ChatAnthropic | ChatDeepSeek;

export type WysilekModelu = 'low' | 'medium' | 'high';

export interface OpcjeModelu {
  wysilek: WysilekModelu;
  /** Liczba całkowita od 1 do 21 333 (limit wywołania bez strumieniowania); domyślnie 16 000. DeepSeek przycina ją do 8 192. */
  maksTokenow?: number;
  /** `true`, gdy wejście zawiera pliki PDF albo obrazy; wtedy DeepSeek używa modelu `deepseek-flash`. */
  zPlikami?: boolean;
}

export type PowodNiedostepnosciModelu =
  | 'brak-klucza' // klucz wybranego dostawcy (DEEPSEEK_API_KEY albo ANTHROPIC_API_KEY) jest pusty albo nieustawiony
  | 'odmowa' // model zakończył odpowiedź z `stop_reason: 'refusal'`
  | 'przekroczony-czas' // sygnał z `AbortSignal.timeout` przerwał wywołanie
  | 'przerwano' // inny sygnał przerwał wywołanie, na przykład zamknięcie żądania przez klienta
  | 'blad-wywolania' // błąd API, sieci albo biblioteki
  | 'nieprawidlowy-wynik'; // ucięta albo pusta odpowiedź, JSON niezgodny ze schematem

/** Błąd, który punkt końcowy zamienia na odpowiedź o niedostępności modelu. */
export class BladModelu extends Error {
  readonly powod: PowodNiedostepnosciModelu;

  constructor(powod: PowodNiedostepnosciModelu, opis?: string, opcje?: { cause?: unknown }) {
    super(opis ?? `Model językowy niedostępny: ${powod}.`, opcje);
    this.name = 'BladModelu';
    this.powod = powod;
  }
}

export interface OpcjeWywolania {
  /** Sygnał przerwania, zwykle `config.signal` węzła grafu z `AbortSignal.timeout`. */
  signal?: AbortSignal;
}

export interface OpcjeWywolaniaZeSchematem<T> extends OpcjeWywolania {
  /** JSON Schema wyniku z `type: 'object'` w korzeniu. */
  schemat: Record<string, unknown>;
  /** Walidacja wyniku, bo parser LangChain dla zwykłego JSON Schema niczego nie sprawdza. */
  czyPoprawny: (wartosc: unknown) => wartosc is T;
}

type ZmiennaModelu =
  | 'MODEL_DOSTAWCA'
  | 'DEEPSEEK_API_KEY'
  | 'DEEPSEEK_MODEL'
  | 'ANTHROPIC_API_KEY'
  | 'ANTHROPIC_MODEL';

function odczytajZmienna(nazwa: ZmiennaModelu): string | undefined {
  const wartosc = process.env[nazwa]?.trim();
  return wartosc ? wartosc : undefined;
}

const ZMIENNE_DOSTAWCY: Record<DostawcaModelu, { klucz: ZmiennaModelu; model: ZmiennaModelu }> = {
  deepseek: { klucz: 'DEEPSEEK_API_KEY', model: 'DEEPSEEK_MODEL' },
  anthropic: { klucz: 'ANTHROPIC_API_KEY', model: 'ANTHROPIC_MODEL' },
};

/** Dostawca z `MODEL_DOSTAWCA` albo `deepseek`. */
export function dostawcaModelu(): DostawcaModelu {
  return odczytajZmienna('MODEL_DOSTAWCA')?.toLowerCase() === 'anthropic' ? 'anthropic' : DOSTAWCA_DOMYSLNY;
}

function kluczDostawcy(dostawca: DostawcaModelu): string | undefined {
  return odczytajZmienna(ZMIENNE_DOSTAWCY[dostawca].klucz);
}

/** Dostawca z `MODEL_DOSTAWCA`, gdy serwer ma jego klucz; w przeciwnym razie `undefined`. */
function dostawcaZKluczem(): DostawcaModelu | undefined {
  const wybrany = dostawcaModelu();
  return kluczDostawcy(wybrany) === undefined ? undefined : wybrany;
}

/** Identyfikator modelu dostawcy z `DEEPSEEK_MODEL` albo `ANTHROPIC_MODEL`, domyślnie z `MODEL_DOMYSLNY`. */
export function nazwaModelu(dostawca: DostawcaModelu = dostawcaModelu()): string {
  return odczytajZmienna(ZMIENNE_DOSTAWCY[dostawca].model) ?? MODEL_DOMYSLNY[dostawca];
}

/** Model DeepSeek dla wejścia: `DEEPSEEK_MODEL`, a dla plików `deepseek-flash`, gdy ten model przyjmuje wyłącznie tekst. */
function modelDeepSeek(zPlikami: boolean): string {
  const nazwa = nazwaModelu('deepseek');
  return zPlikami && !MODELE_DEEPSEEK_Z_PLIKAMI.includes(nazwa) ? MODEL_DEEPSEEK_Z_PLIKAMI : nazwa;
}

/** `true`, gdy serwer ma niepusty klucz dostawcy z `MODEL_DOSTAWCA`. Obaj dostawcy przyjmują tekst, obrazy i pliki PDF. */
export function czyModelDostepny(): boolean {
  return dostawcaZKluczem() !== undefined;
}

/**
 * Tworzy model czatu dostawcy z `MODEL_DOSTAWCA`, z kluczem ze zmiennej środowiskowej serwera.
 * Wywołujący sprawdza wcześniej `czyModelDostepny()`; bez klucza funkcja rzuca `BladModelu('brak-klucza')`.
 * Dla Anthropic wysiłek z konstruktora łączy się z `outputConfig` z opcji wywołania, więc `outputConfig.format`
 * dodany przez `wywolajZeSchematem` zachowuje wybrany wysiłek.
 */
export function utworzModel({ wysilek, maksTokenow, zPlikami = false }: OpcjeModelu): ModelCzatu {
  const dostawca = dostawcaZKluczem();
  const klucz = dostawca === undefined ? undefined : kluczDostawcy(dostawca);
  if (dostawca === undefined || klucz === undefined) {
    throw new BladModelu('brak-klucza', 'Serwer nie ma klucza API dostawcy modelu.');
  }
  if (
    maksTokenow !== undefined &&
    !(Number.isInteger(maksTokenow) && maksTokenow > 0 && maksTokenow <= MAKS_TOKENOW_BEZ_STRUMIENIA)
  ) {
    throw new RangeError(
      `maksTokenow musi być liczbą całkowitą od 1 do ${MAKS_TOKENOW_BEZ_STRUMIENIA}, otrzymano ${maksTokenow}.`,
    );
  }
  const tokeny = maksTokenow ?? MAKS_TOKENOW_DOMYSLNIE;
  if (dostawca === 'deepseek') {
    return new ChatDeepSeek({
      apiKey: klucz,
      model: modelDeepSeek(zPlikami),
      maxTokens: Math.min(tokeny, MAKS_TOKENOW_DEEPSEEK),
      maxRetries: LICZBA_PONOWIEN,
      modelKwargs: PARAMETRY_DEEPSEEK,
    });
  }
  return new ChatAnthropic({
    apiKey: klucz,
    model: nazwaModelu('anthropic'),
    maxTokens: tokeny,
    maxRetries: LICZBA_PONOWIEN,
    outputConfig: { effort: wysilek },
  });
}

/** Powód zakończenia odpowiedzi z metadanych (`stop_reason` Anthropic, `finish_reason` DeepSeek i strumienia). */
function powodZakonczenia(wiadomosc: BaseMessage): unknown {
  const metadane: unknown = wiadomosc.response_metadata;
  if (typeof metadane !== 'object' || metadane === null) {
    return undefined;
  }
  const { stop_reason: powod, finish_reason: powodWStrumieniu } = metadane as Record<string, unknown>;
  return powod ?? powodWStrumieniu;
}

/** `true`, gdy model odmówił odpowiedzi (`refusal`, `content_filter` albo blok odmowy w treści). */
export function czyOdmowa(wiadomosc: BaseMessage): boolean {
  const powod = powodZakonczenia(wiadomosc);
  if (powod === 'refusal' || powod === 'content_filter') {
    return true;
  }
  try {
    return wiadomosc.contentBlocks.some((blok) => blok.type === 'refusal');
  } catch {
    return false;
  }
}

function czyUcieta(wiadomosc: BaseMessage): boolean {
  const powod = powodZakonczenia(wiadomosc);
  return powod === 'max_tokens' || powod === 'length';
}

function czyPrzekroczonyCzas(powod: unknown): boolean {
  return typeof powod === 'object' && powod !== null && 'name' in powod && powod.name === 'TimeoutError';
}

/** Zamienia dowolny błąd wywołania modelu na `BladModelu` z powodem niedostępności. */
export function jakoBladModelu(blad: unknown, signal?: AbortSignal): BladModelu {
  if (blad instanceof BladModelu) {
    return blad;
  }
  if (signal?.aborted) {
    return new BladModelu(czyPrzekroczonyCzas(signal.reason) ? 'przekroczony-czas' : 'przerwano', undefined, {
      cause: blad,
    });
  }
  if (czyPrzekroczonyCzas(blad)) {
    return new BladModelu('przekroczony-czas', undefined, { cause: blad });
  }
  if (ModelRefusalError.isInstance(blad)) {
    return new BladModelu('odmowa', undefined, { cause: blad });
  }
  return new BladModelu('blad-wywolania', undefined, { cause: blad });
}

function sprawdzZakonczenie(wiadomosc: BaseMessage): void {
  if (czyOdmowa(wiadomosc)) {
    throw new BladModelu('odmowa', 'Model odmówił odpowiedzi.');
  }
  if (czyUcieta(wiadomosc)) {
    throw new BladModelu('nieprawidlowy-wynik', 'Odpowiedź modelu przekroczyła limit tokenów.');
  }
}

/** Wywołuje model i zwraca przycięty tekst odpowiedzi bez bloków myślenia. */
export async function wywolajModel(
  model: ModelCzatu,
  wejscie: BaseLanguageModelInput,
  { signal }: OpcjeWywolania = {},
): Promise<string> {
  let odpowiedz: BaseMessage;
  try {
    odpowiedz = await model.invoke(wejscie, { signal });
  } catch (blad) {
    throw jakoBladModelu(blad, signal);
  }
  sprawdzZakonczenie(odpowiedz);
  const tekst = odpowiedz.text.trim();
  if (tekst === '') {
    throw new BladModelu('nieprawidlowy-wynik', 'Model zwrócił pustą odpowiedź.');
  }
  return tekst;
}

/**
 * Wywołuje model w trybie wyjścia strukturalnego i zwraca wynik po walidacji `czyPoprawny`.
 * Anthropic dostaje JSON Schema w `outputConfig.format` bez wymuszonego narzędzia,
 * a DeepSeek wywołuje funkcję `wynik` z parametrami opisanymi tym schematem.
 */
export async function wywolajZeSchematem<T>(
  model: ModelCzatu,
  wejscie: BaseLanguageModelInput,
  { schemat, czyPoprawny, signal }: OpcjeWywolaniaZeSchematem<T>,
): Promise<T> {
  const modelZeSchematem =
    model instanceof ChatDeepSeek
      ? model.withStructuredOutput(schemat, { method: 'functionCalling', name: NAZWA_FUNKCJI_WYNIKU, includeRaw: true })
      : model.withStructuredOutput(schemat, { method: 'jsonSchema', includeRaw: true });
  let wynik: { raw: BaseMessage; parsed: unknown };
  try {
    wynik = await modelZeSchematem.invoke(wejscie, { signal });
  } catch (blad) {
    throw jakoBladModelu(blad, signal);
  }
  sprawdzZakonczenie(wynik.raw);
  if (wynik.parsed === null || wynik.parsed === undefined || !czyPoprawny(wynik.parsed)) {
    throw new BladModelu('nieprawidlowy-wynik', 'Wynik modelu jest niezgodny ze schematem.');
  }
  return wynik.parsed;
}

/** Dokument PDF do wgrania w Files API DeepSeek. */
export interface DokumentDeepSeek {
  /** Zawartość pliku. */
  dane: Uint8Array<ArrayBuffer>;
  /** Nazwa pliku w części multipart. */
  nazwa: string;
}

function identyfikatorPliku(tresc: unknown): string | undefined {
  if (typeof tresc !== 'object' || tresc === null) {
    return undefined;
  }
  const { id, object: obiekt } = tresc as Record<string, unknown>;
  return typeof id === 'string' && id !== '' && obiekt === 'file' ? id : undefined;
}

/**
 * Wgrywa dokument PDF do Files API DeepSeek (`POST /files`, cel `text_recognition`, ważność 1 godzina)
 * i zwraca `file_id` do części `{ type: 'file', file_id }` wiadomości użytkownika dla modelu `deepseek-flash`.
 * Files API zwraca obiekt pliku po zakończeniu parsowania dokumentu. Brak klucza, błąd API, błąd sieci,
 * przerwanie sygnałem i odpowiedź bez identyfikatora pliku kończą się błędem `BladModelu`.
 */
export async function wgrajDokumentDeepSeek(
  dokument: DokumentDeepSeek,
  { signal }: OpcjeWywolania = {},
): Promise<string> {
  const klucz = kluczDostawcy('deepseek');
  if (klucz === undefined) {
    throw new BladModelu('brak-klucza', 'Serwer nie ma klucza API dostawcy modelu.');
  }
  // Files API wymaga pola `purpose` przed polem `file`.
  const formularz = new FormData();
  formularz.append('purpose', 'text_recognition');
  formularz.append('expires_after[anchor]', 'created_at');
  formularz.append('expires_after[seconds]', String(WAZNOSC_PLIKU_DEEPSEEK_S));
  formularz.append('file', new Blob([dokument.dane], { type: 'application/pdf' }), dokument.nazwa);
  let tresc: unknown;
  try {
    const odpowiedz = await fetch(`${ADRES_API_DEEPSEEK}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${klucz}` },
      body: formularz,
      signal,
    });
    if (!odpowiedz.ok) {
      throw new BladModelu('blad-wywolania', `Files API DeepSeek zwróciło status ${odpowiedz.status}.`);
    }
    tresc = await odpowiedz.json();
  } catch (blad) {
    throw jakoBladModelu(blad, signal);
  }
  const id = identyfikatorPliku(tresc);
  if (id === undefined) {
    throw new BladModelu('nieprawidlowy-wynik', 'Files API DeepSeek zwróciło odpowiedź bez identyfikatora pliku.');
  }
  return id;
}
