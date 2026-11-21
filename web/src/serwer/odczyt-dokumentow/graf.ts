import 'server-only';
// Graf LangGraph odczytu dokumentów: rozpoznajRodzaj, odczytajPola, zastapDaneOsobowe (kontrakt, sekcja 10.3).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// START → rozpoznajRodzaj → (nierozpoznany albo nieczytelny: END) → odczytajPola → zastapDaneOsobowe → END.
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RODZAJE_DOKUMENTOW, schematPol, schematRozpoznania } from '@/domena/przykladowe-sprawy/schematy';
import type { PowiazanieZastepcze, RodzajDokumentuSprawy, WartoscOdczytana, WynikOdczytuDokumentu } from '@/domena/typy';
import { utworzModel, wywolajZeSchematem } from '@/serwer/model';
import { PROMPT_ROZPOZNANIA, promptOdczytu } from '@/serwer/odczyt-dokumentow/prompty';
import { zastapDaneOsobowe } from '@/serwer/odczyt-dokumentow/zastapienie';

/** Plik przekazany do grafu: zawartość w base64 i typ MIME. */
export interface PlikDoOdczytu { dane: string; typ: 'application/pdf' | 'image/jpeg' | 'image/png' }

const StanOdczytu = Annotation.Root({
  plik: Annotation<PlikDoOdczytu>(),
  rodzaj: Annotation<RodzajDokumentuSprawy | 'nierozpoznany' | null>({ reducer: (_, b) => b, default: () => null }),
  czytelny: Annotation<boolean>({ reducer: (_, b) => b, default: () => true }),
  wartosci: Annotation<WartoscOdczytana[]>({ reducer: (_, b) => b, default: () => [] }),
  powiazania: Annotation<PowiazanieZastepcze[]>({ reducer: (_, b) => b, default: () => [] }),
  wynik: Annotation<WynikOdczytuDokumentu | null>({ reducer: (_, b) => b, default: () => null }),
});

type Stan = typeof StanOdczytu.State;

function blokPliku(plik: PlikDoOdczytu): Record<string, unknown> {
  return plik.typ === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: plik.typ, data: plik.dane } }
    : { type: 'image', source: { type: 'base64', media_type: plik.typ, data: plik.dane } };
}

function wiadomosc(plik: PlikDoOdczytu, polecenie: string): HumanMessage {
  return new HumanMessage({ content: [blokPliku(plik), { type: 'text', text: polecenie }] as never });
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
  const model = utworzModel({ wysilek: 'low', maksTokenow: 2000 });
  const wynik = await wywolajZeSchematem(model, [new SystemMessage(PROMPT_ROZPOZNANIA), wiadomosc(stan.plik, 'Rozpoznaj rodzaj dokumentu.')], {
    schemat: schematRozpoznania(),
    czyPoprawny: czyRozpoznanie,
    signal: config?.signal,
  });
  return { rodzaj: wynik.rodzaj, czytelny: wynik.czytelny };
}

async function odczytajPola(stan: Stan, config?: { signal?: AbortSignal }): Promise<Partial<Stan>> {
  const rodzaj = stan.rodzaj as RodzajDokumentuSprawy;
  const model = utworzModel({ wysilek: 'medium', maksTokenow: 8000 });
  const wynik = await wywolajZeSchematem(model, [new SystemMessage(promptOdczytu(rodzaj)), wiadomosc(stan.plik, 'Odczytaj dane sprawy.')], {
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

/** Odczyt dokumentu modelem; błąd modelu (BladModelu) obsługuje punkt końcowy jako niedostępność. */
export async function odczytajDokumentModelem(
  plik: PlikDoOdczytu,
  powiazania: PowiazanieZastepcze[],
  signal: AbortSignal,
): Promise<WynikOdczytuDokumentu> {
  const poczatek = Date.now();
  const stan = await graf.invoke({ plik, powiazania }, { signal });
  const czasMs = Date.now() - poczatek;
  if (stan.rodzaj === 'nierozpoznany') return { status: 'nierozpoznany', wartosci: [], nowePowiazania: [], czasMs };
  if (!stan.czytelny || stan.wynik === null) return { status: 'nieczytelny', wartosci: [], nowePowiazania: [], czasMs };
  return { ...stan.wynik, czasMs };
}
