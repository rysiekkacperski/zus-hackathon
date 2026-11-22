import 'server-only';
// Graf LangGraph odczytu dokumentów: rozpoznajRodzaj, odczytajPola, zastapDaneOsobowe (kontrakt, sekcja 10.3).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// START → rozpoznajRodzaj → (nierozpoznany albo nieczytelny: END) → odczytajPola → zastapDaneOsobowe → END.
// Przed grafem `odczytajDokumentModelem` przygotowuje część wiadomości z plikiem dla dostawcy z `MODEL_DOSTAWCA`:
// Anthropic dostaje blok `document` albo `image` z base64, a DeepSeek część `image_url` z adresem data URL
// albo, dla PDF, część `{ type: 'file', file_id }` po wgraniu pliku do Files API. Wgranie mieści się w limicie
// czasu z sygnału przerwania całego odczytu.
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RODZAJE_DOKUMENTOW, schematPol, schematRozpoznania } from '@/domena/przykladowe-sprawy/schematy';
import type { PowiazanieZastepcze, RodzajDokumentuSprawy, WartoscOdczytana, WynikOdczytuDokumentu } from '@/domena/typy';
import { dostawcaModelu, utworzModel, wgrajDokumentDeepSeek, wywolajZeSchematem } from '@/serwer/model';
import { PROMPT_ROZPOZNANIA, promptOdczytu } from '@/serwer/odczyt-dokumentow/prompty';
import { zastapDaneOsobowe } from '@/serwer/odczyt-dokumentow/zastapienie';

/** Typy obrazów, które obaj dostawcy przyjmują w wiadomości. */
const TYPY_OBRAZOW = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

/** Plik przekazany do odczytu: zawartość w base64 i typ MIME. */
export interface PlikDoOdczytu { dane: string; typ: 'application/pdf' | (typeof TYPY_OBRAZOW)[number] }

/** Nazwa pliku PDF w Files API DeepSeek; nazwa pliku od użytkownika zostaje na serwerze. */
const NAZWA_DOKUMENTU_DEEPSEEK = 'dokument.pdf';

/** Część treści wiadomości użytkownika z plikiem, w formacie dostawcy modelu. */
type CzescPliku = Record<string, unknown>;

const StanOdczytu = Annotation.Root({
  czescPliku: Annotation<CzescPliku>(),
  rodzaj: Annotation<RodzajDokumentuSprawy | 'nierozpoznany' | null>({ reducer: (_, b) => b, default: () => null }),
  czytelny: Annotation<boolean>({ reducer: (_, b) => b, default: () => true }),
  wartosci: Annotation<WartoscOdczytana[]>({ reducer: (_, b) => b, default: () => [] }),
  powiazania: Annotation<PowiazanieZastepcze[]>({ reducer: (_, b) => b, default: () => [] }),
  wynik: Annotation<WynikOdczytuDokumentu | null>({ reducer: (_, b) => b, default: () => null }),
});

type Stan = typeof StanOdczytu.State;

function czyObslugiwanyTyp(typ: string): boolean {
  return typ === 'application/pdf' || (TYPY_OBRAZOW as readonly string[]).includes(typ);
}

function blokAnthropic(plik: PlikDoOdczytu): CzescPliku {
  return plik.typ === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: plik.typ, data: plik.dane } }
    : { type: 'image', source: { type: 'base64', media_type: plik.typ, data: plik.dane } };
}

/** Część wiadomości z plikiem dla dostawcy z `MODEL_DOSTAWCA`; dla DeepSeek i PDF wgrywa plik do Files API. */
async function przygotujCzescPliku(plik: PlikDoOdczytu, signal: AbortSignal): Promise<CzescPliku> {
  if (dostawcaModelu() === 'anthropic') return blokAnthropic(plik);
  if (plik.typ === 'application/pdf') {
    const dane = Uint8Array.from(Buffer.from(plik.dane, 'base64'));
    const fileId = await wgrajDokumentDeepSeek({ dane, nazwa: NAZWA_DOKUMENTU_DEEPSEEK }, { signal });
    return { type: 'file', file_id: fileId };
  }
  return { type: 'image_url', image_url: { url: `data:${plik.typ};base64,${plik.dane}` } };
}

function wiadomosc(czescPliku: CzescPliku, polecenie: string): HumanMessage {
  return new HumanMessage({ content: [czescPliku, { type: 'text', text: polecenie }] as never });
}

interface Rozpoznanie { rodzaj: RodzajDokumentuSprawy | 'nierozpoznany'; czytelny: boolean }
function czyRozpoznanie(w: unknown): w is Rozpoznanie {
  const r = w as Partial<Rozpoznanie> | null;
  return r !== null && typeof r === 'object' && typeof r.czytelny === 'boolean'
    && (r.rodzaj === 'nierozpoznany' || RODZAJE_DOKUMENTOW.includes(r.rodzaj as RodzajDokumentuSprawy));
}

function czyOdczyt(w: unknown): w is { wartosci: WartoscOdczytana[] } {
  const r = w as { wartosci?: unknown } | null;
  return r !== null && typeof r === 'object' && Array.isArray(r.wartosci)
    && r.wartosci.every((x) => x !== null && typeof x === 'object' && typeof (x as WartoscOdczytana).pole === 'string');
}

async function rozpoznajRodzaj(stan: Stan, config?: { signal?: AbortSignal }): Promise<Partial<Stan>> {
  const model = utworzModel({ wysilek: 'low', maksTokenow: 2000, zPlikami: true });
  const wynik = await wywolajZeSchematem(model, [new SystemMessage(PROMPT_ROZPOZNANIA), wiadomosc(stan.czescPliku, 'Rozpoznaj rodzaj dokumentu.')], {
    schemat: schematRozpoznania(),
    czyPoprawny: czyRozpoznanie,
    signal: config?.signal,
  });
  return { rodzaj: wynik.rodzaj, czytelny: wynik.czytelny };
}

async function odczytajPola(stan: Stan, config?: { signal?: AbortSignal }): Promise<Partial<Stan>> {
  const rodzaj = stan.rodzaj as RodzajDokumentuSprawy;
  const model = utworzModel({ wysilek: 'medium', maksTokenow: 8000, zPlikami: true });
  const wynik = await wywolajZeSchematem(model, [new SystemMessage(promptOdczytu(rodzaj)), wiadomosc(stan.czescPliku, 'Odczytaj dane sprawy.')], {
    schemat: schematPol(rodzaj),
    czyPoprawny: czyOdczyt,
    signal: config?.signal,
  });
  return { wartosci: wynik.wartosci };
}

function zastapDane(stan: Stan): Partial<Stan> {
  const { wartosci, nowePowiazania } = zastapDaneOsobowe(stan.wartosci, stan.powiazania);
  return {
    wynik: { status: 'odczytany', rodzajDokumentu: stan.rodzaj as RodzajDokumentuSprawy, wartosci, nowePowiazania, czasMs: 0 },
  };
}

const graf = new StateGraph(StanOdczytu)
  .addNode('rozpoznajRodzaj', rozpoznajRodzaj)
  .addNode('odczytajPola', odczytajPola)
  .addNode('zastapDaneOsobowe', zastapDane)
  .addEdge(START, 'rozpoznajRodzaj')
  .addConditionalEdges('rozpoznajRodzaj', (stan: Stan) => (stan.rodzaj === 'nierozpoznany' || !stan.czytelny ? END : 'odczytajPola'), [
    'odczytajPola',
    END,
  ])
  .addEdge('odczytajPola', 'zastapDaneOsobowe')
  .addEdge('zastapDaneOsobowe', END)
  .compile();

/**
 * Odczyt dokumentu modelem; błąd modelu (BladModelu) obsługuje punkt końcowy jako niedostępność.
 * Plik innego typu niż PDF albo obraz JPEG, PNG, WebP i GIF daje status `nierozpoznany` bez wywołania modelu.
 */
export async function odczytajDokumentModelem(
  plik: PlikDoOdczytu,
  powiazania: PowiazanieZastepcze[],
  signal: AbortSignal,
): Promise<WynikOdczytuDokumentu> {
  if (!czyObslugiwanyTyp(plik.typ)) return { status: 'nierozpoznany', wartosci: [], nowePowiazania: [], czasMs: 0 };
  const poczatek = Date.now();
  const czescPliku = await przygotujCzescPliku(plik, signal);
  const stan = await graf.invoke({ czescPliku, powiazania }, { signal });
  const czasMs = Date.now() - poczatek;
  if (stan.rodzaj === 'nierozpoznany') return { status: 'nierozpoznany', wartosci: [], nowePowiazania: [], czasMs };
  if (!stan.czytelny || stan.wynik === null) return { status: 'nieczytelny', wartosci: [], nowePowiazania: [], czasMs };
  return { ...stan.wynik, czasMs };
}
