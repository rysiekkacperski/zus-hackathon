import 'server-only';
// Graf LangGraph asystenta AI (kontrakt, sekcja 10.3). Właściciel: u31 (Asystent AI).
// START → klasyfikuj (model, wysiłek low; przy błędzie słowa kluczowe)
//   → odpowiedzPozaZakresem (0070 i akcje kanałów, bez modelu) → END
//   → zbierzFakty (deterministycznie) → sformuluj (model, wysiłek medium) → sprawdz → zbudujOdpowiedz → END
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import { analizujPytanie, type AnalizaPytania } from '@/domena/asystent/fakty';
import { czyIntencjaAsystenta, czyPozaZakresem, klasyfikujSlowamiKluczowymi, uzgodnijIntencje } from '@/domena/asystent/intencje';
import { czyTekstZgodnyZFaktami, zbudujOdpowiedz } from '@/domena/asystent/odpowiedz';
import type { IdSprawy, IntencjaAsystenta, OdpowiedzAsystenta, ZapytanieAsystenta } from '@/domena/typy';
import { utworzModel, wywolajModel, wywolajZeSchematem } from '@/serwer/model';
import {
  PROMPT_KLASYFIKACJI,
  PROMPT_SFORMULOWANIA,
  SCHEMAT_KLASYFIKACJI,
  wiadomoscKlasyfikacji,
  wiadomoscSformulowania,
} from '@/serwer/asystent/prompty';

/** Limit czasu całego grafu asystenta (kontrakt, sekcja 10.3). */
export const LIMIT_CZASU_ASYSTENTA_MS = 20_000;

const StanGrafu = Annotation.Root({
  zapytanie: Annotation<ZapytanieAsystenta>(),
  intencja: Annotation<IntencjaAsystenta>(),
  sprawy: Annotation<IdSprawy[]>(),
  fakty: Annotation<AnalizaPytania | null>(),
  tekst: Annotation<string | null>(),
  odpowiedz: Annotation<OdpowiedzAsystenta | null>(),
});

type Stan = typeof StanGrafu.State;

interface WynikKlasyfikacji {
  intencja: IntencjaAsystenta;
  idSprawy: string[];
}

function czyWynikKlasyfikacji(w: unknown): w is WynikKlasyfikacji {
  if (typeof w !== 'object' || w === null) return false;
  const { intencja, idSprawy } = w as Record<string, unknown>;
  return czyIntencjaAsystenta(intencja) && Array.isArray(idSprawy) && idSprawy.every((x) => typeof x === 'string');
}

async function klasyfikuj(stan: Stan, config?: { signal?: AbortSignal }): Promise<Partial<Stan>> {
  const { wiadomosc, kontekst } = stan.zapytanie;
  const zSlow = klasyfikujSlowamiKluczowymi(wiadomosc);
  try {
    const model = utworzModel({ wysilek: 'low', maksTokenow: 1024 });
    const wynik = await wywolajZeSchematem(
      model,
      [
        { role: 'system', content: PROMPT_KLASYFIKACJI },
        { role: 'user', content: wiadomoscKlasyfikacji(wiadomosc, kontekst) },
      ],
      { schemat: SCHEMAT_KLASYFIKACJI, czyPoprawny: czyWynikKlasyfikacji, signal: config?.signal },
    );
    const znane = new Set(kontekst.sprawy.map((s) => s.idSprawy));
    const sprawy = wynik.idSprawy.filter((id) => znane.has(id));
    return { intencja: uzgodnijIntencje(wynik.intencja, zSlow, sprawy, wiadomosc), sprawy };
  } catch (blad) {
    if (config?.signal?.aborted) throw blad;
    return { intencja: zSlow, sprawy: [] };
  }
}

function odpowiedzPozaZakresem(stan: Stan): Partial<Stan> {
  const analiza = analizujPytanie(stan.intencja, stan.zapytanie.kontekst);
  return { fakty: analiza, odpowiedz: zbudujOdpowiedz(stan.intencja, analiza) };
}

function zbierzFakty(stan: Stan): Partial<Stan> {
  return {
    fakty: analizujPytanie(stan.intencja, stan.zapytanie.kontekst, { wiadomosc: stan.zapytanie.wiadomosc, sprawy: stan.sprawy }),
  };
}

async function sformuluj(stan: Stan, config?: { signal?: AbortSignal }): Promise<Partial<Stan>> {
  const fakty = stan.fakty?.fakty ?? [];
  try {
    const model = utworzModel({ wysilek: 'medium', maksTokenow: 2048 });
    const tekst = await wywolajModel(
      model,
      [
        { role: 'system', content: PROMPT_SFORMULOWANIA },
        { role: 'user', content: wiadomoscSformulowania(stan.zapytanie.wiadomosc, fakty) },
      ],
      { signal: config?.signal },
    );
    return { tekst };
  } catch (blad) {
    if (config?.signal?.aborted) throw blad;
    return { tekst: null };
  }
}

function sprawdz(stan: Stan): Partial<Stan> {
  const fakty = stan.fakty?.fakty ?? [];
  const wymagane = stan.fakty?.wymaganeLiczby ?? [];
  return { tekst: stan.tekst && czyTekstZgodnyZFaktami(stan.tekst, fakty, wymagane) ? stan.tekst : null };
}

function zbuduj(stan: Stan): Partial<Stan> {
  if (stan.fakty === null) return { odpowiedz: null };
  return { odpowiedz: zbudujOdpowiedz(stan.intencja, stan.fakty, stan.tekst) };
}

const graf = new StateGraph(StanGrafu)
  .addNode('klasyfikuj', klasyfikuj)
  .addNode('odpowiedzPozaZakresem', odpowiedzPozaZakresem)
  .addNode('zbierzFakty', zbierzFakty)
  .addNode('sformuluj', sformuluj)
  .addNode('sprawdz', sprawdz)
  .addNode('zbudujOdpowiedz', zbuduj)
  .addEdge(START, 'klasyfikuj')
  .addConditionalEdges('klasyfikuj', (stan: Stan) => (czyPozaZakresem(stan.intencja) ? 'odpowiedzPozaZakresem' : 'zbierzFakty'), [
    'odpowiedzPozaZakresem',
    'zbierzFakty',
  ])
  .addEdge('odpowiedzPozaZakresem', END)
  .addEdge('zbierzFakty', 'sformuluj')
  .addEdge('sformuluj', 'sprawdz')
  .addEdge('sprawdz', 'zbudujOdpowiedz')
  .addEdge('zbudujOdpowiedz', END)
  .compile();

/** Odpowiedź asystenta na zapytanie; przerwanie sygnałem albo brak odpowiedzi kończy się błędem. */
export async function odpowiedzAsystenta(zapytanie: ZapytanieAsystenta, signal: AbortSignal): Promise<OdpowiedzAsystenta> {
  const wynik = await graf.invoke(
    { zapytanie, intencja: 'poza-zakresem-spoza-katalogu', sprawy: [], fakty: null, tekst: null, odpowiedz: null },
    { signal },
  );
  if (wynik.odpowiedz === null) throw new Error('Graf asystenta nie zbudował odpowiedzi.');
  return wynik.odpowiedz;
}
