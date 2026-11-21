import 'server-only';

import { ChatAnthropic } from '@langchain/anthropic';
import { ModelRefusalError } from '@langchain/core/errors';
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import type { BaseMessage } from '@langchain/core/messages';

// Fabryka modelu językowego dla asystenta AI i odczytu dokumentów (kontrakt, sekcja 10.1).
//
// Zasady wywołań dla modelu claude-opus-5-5:
// - fabryka pomija `temperature`, `topK`, `topP` i `thinking`, więc model myśli adaptacyjnie,
//   a głębokość odpowiedzi ustala `outputConfig.effort`;
// - wynik strukturalny daje `wywolajZeSchematem` (JSON Schema w `outputConfig.format`),
//   a narzędzia wiąże się wyłącznie z `tool_choice: 'auto'` i walidacją argumentów;
// - odmowa modelu (`stop_reason: 'refusal'`), ucięta odpowiedź, błąd API i przekroczenie
//   limitu czasu kończą się błędem `BladModelu`, który punkt końcowy zamienia na odpowiedź
//   o niedostępności (0071 dla asystenta, `{ status: 'niedostepny' }` dla odczytu dokumentu).

/** Model używany, gdy zmienna `ANTHROPIC_MODEL` jest pusta albo nieustawiona. */
export const MODEL_DOMYSLNY = 'claude-opus-5-5';

/** Limit tokenów odpowiedzi bez strumieniowania, mieszczący wywołanie w limicie czasu żądania HTTP. */
const MAKS_TOKENOW_DOMYSLNIE = 16_000;

/**
 * Najwyższy `max_tokens`, który `@anthropic-ai/sdk` przyjmuje bez strumieniowania
 * (szacowany czas 60 min × max_tokens / 128 000 nie przekracza 10 min). Wyższa wartość kończy się
 * błędem „Streaming is required” przed wysłaniem żądania.
 */
const MAKS_TOKENOW_BEZ_STRUMIENIA = 21_333;

/** Ponowienia przy błędach przejściowych (429, 5xx, sieć). Sygnał przerwania grafu kończy ponowienia. */
const LICZBA_PONOWIEN = 2;

export type WysilekModelu = 'low' | 'medium' | 'high';

export interface OpcjeModelu {
  wysilek: WysilekModelu;
  /** Liczba całkowita od 1 do 21 333 (limit wywołania bez strumieniowania); domyślnie 16 000. */
  maksTokenow?: number;
}

export type PowodNiedostepnosciModelu =
  | 'brak-klucza' // zmienna ANTHROPIC_API_KEY jest pusta albo nieustawiona
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

function odczytajZmienna(nazwa: 'ANTHROPIC_API_KEY' | 'ANTHROPIC_MODEL'): string | undefined {
  const wartosc = process.env[nazwa]?.trim();
  return wartosc ? wartosc : undefined;
}

/** Identyfikator modelu z `ANTHROPIC_MODEL` albo `claude-opus-5-5`. */
export function nazwaModelu(): string {
  return odczytajZmienna('ANTHROPIC_MODEL') ?? MODEL_DOMYSLNY;
}

/** `true`, gdy serwer ma niepusty klucz `ANTHROPIC_API_KEY`. */
export function czyModelDostepny(): boolean {
  return odczytajZmienna('ANTHROPIC_API_KEY') !== undefined;
}

/**
 * Tworzy model czatu z kluczem z `ANTHROPIC_API_KEY` i wysiłkiem w `outputConfig.effort`.
 * Wywołujący sprawdza wcześniej `czyModelDostepny()`; bez klucza funkcja rzuca `BladModelu('brak-klucza')`.
 * Wysiłek z konstruktora łączy się z `outputConfig` z opcji wywołania, więc `outputConfig.format`
 * dodany przez `wywolajZeSchematem` zachowuje wybrany wysiłek.
 */
export function utworzModel({ wysilek, maksTokenow }: OpcjeModelu): ChatAnthropic {
  const klucz = odczytajZmienna('ANTHROPIC_API_KEY');
  if (klucz === undefined) {
    throw new BladModelu('brak-klucza', 'Serwer nie ma klucza ANTHROPIC_API_KEY.');
  }
  if (
    maksTokenow !== undefined &&
    !(Number.isInteger(maksTokenow) && maksTokenow > 0 && maksTokenow <= MAKS_TOKENOW_BEZ_STRUMIENIA)
  ) {
    throw new RangeError(
      `maksTokenow musi być liczbą całkowitą od 1 do ${MAKS_TOKENOW_BEZ_STRUMIENIA}, otrzymano ${maksTokenow}.`,
    );
  }
  return new ChatAnthropic({
    apiKey: klucz,
    model: nazwaModelu(),
    maxTokens: maksTokenow ?? MAKS_TOKENOW_DOMYSLNIE,
    maxRetries: LICZBA_PONOWIEN,
    outputConfig: { effort: wysilek },
  });
}

/** Powód zakończenia odpowiedzi z metadanych Anthropic (`stop_reason`, w strumieniu `finish_reason`). */
function powodZakonczenia(wiadomosc: BaseMessage): unknown {
  const metadane: unknown = wiadomosc.response_metadata;
  if (typeof metadane !== 'object' || metadane === null) {
    return undefined;
  }
  const { stop_reason: powod, finish_reason: powodWStrumieniu } = metadane as Record<string, unknown>;
  return powod ?? powodWStrumieniu;
}

/** `true`, gdy model odmówił odpowiedzi (`stop_reason: 'refusal'` albo blok odmowy w treści). */
export function czyOdmowa(wiadomosc: BaseMessage): boolean {
  if (powodZakonczenia(wiadomosc) === 'refusal') {
    return true;
  }
  try {
    return wiadomosc.contentBlocks.some((blok) => blok.type === 'refusal');
  } catch {
    return false;
  }
}

function czyUcieta(wiadomosc: BaseMessage): boolean {
  return powodZakonczenia(wiadomosc) === 'max_tokens';
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
  model: ChatAnthropic,
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
 * Wywołuje model w trybie wyjścia strukturalnego (`outputConfig.format` z JSON Schema),
 * bez wymuszonego narzędzia, i zwraca wynik po walidacji `czyPoprawny`.
 */
export async function wywolajZeSchematem<T>(
  model: ChatAnthropic,
  wejscie: BaseLanguageModelInput,
  { schemat, czyPoprawny, signal }: OpcjeWywolaniaZeSchematem<T>,
): Promise<T> {
  const modelZeSchematem = model.withStructuredOutput(schemat, { method: 'jsonSchema', includeRaw: true });
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
