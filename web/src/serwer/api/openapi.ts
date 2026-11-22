// Opis OpenAPI 3.1 REST API w wersji 1 złożony z rejestru punktów końcowych (src/serwer/api/endpointy.ts).
// Schematy danych domeny opisują typy TypeScript z web/src/domena/typy; schemat błędu BladApi i lista kodów komunikatów
// pochodzą z tablicy komunikatów.
import { endpointy, RODZAJE_WALIDACJI, type Endpoint, type ParametrAdresu } from '@/serwer/api/endpointy';
import { statusBledu } from '@/serwer/api/odpowiedzi';
import { statusyHttpKomunikatow } from '@/serwer/api/statusy-http';
import { SYMULACJE_API } from '@/serwer/api/symulacje';
import type { KodKomunikatu } from '@/domena/typy';
import { teksty } from '@/teksty';

const T = teksty.ViewApiDocs;
const I = T.openApiInfo;
type Schemat = Record<string, unknown>;

const DATA: Schemat = { type: 'string', format: 'date', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
const ZNACZNIK: Schemat = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$' };
const GROSZE: Schemat = { type: 'integer', minimum: 0 };
const PESEL: Schemat = { type: 'string', pattern: '^\\d{11}$' };

function ref(nazwa: string): Schemat {
  return { $ref: `#/components/schemas/${nazwa}` };
}

function obiektDomeny(): Schemat {
  return { type: 'object', additionalProperties: true, description: I.opisDanych };
}

const PARAMETRY: Record<ParametrAdresu, Schemat> = {
  pesel: { name: 'X-Pesel', in: 'header', required: true, description: I.opisPeselu, schema: PESEL },
  rodzaj: { name: 'rodzaj', in: 'path', required: true, description: I.opisRodzajuWalidacji, schema: { type: 'string', enum: RODZAJE_WALIDACJI } },
  dzien: { name: 'dzien', in: 'query', description: I.opisDnia, schema: DATA },
  zgodaNaDaneZdrowia: { name: 'zgodaNaDaneZdrowia', in: 'query', description: I.opisZgody, schema: { type: 'string', enum: ['tak', 'nie'] } },
  postac: { name: 'postac', in: 'query', description: I.opisPostaci, schema: { type: 'string', enum: ['zrodlowe'] } },
  kanal: { name: 'kanal', in: 'query', description: I.opisKanalu, schema: { type: 'string', enum: ['pue-ezus'] } },
  dzis: { name: 'dzis', in: 'query', description: I.opisDzis, schema: DATA },
  dataDemo: { name: 'dataDemo', in: 'query', description: I.opisDatyDemo, schema: DATA },
  teraz: { name: 'teraz', in: 'query', description: I.opisTeraz, schema: ZNACZNIK },
  symulacje: { name: 'symulacje', in: 'query', description: I.opisSymulacji, schema: { type: 'string' } },
};

const NAGLOWKI: Schemat[] = [
  { name: 'X-Data-Demo', in: 'header', description: I.opisDatyDemo, schema: DATA },
  { name: 'X-Symulacje', in: 'header', description: I.opisSymulacji, schema: { type: 'string' } },
];

const SCHEMATY: Record<string, Schemat> = {
  KodKomunikatu: { type: 'string', enum: Object.keys(statusyHttpKomunikatow), description: 'docs/03-user-stories/tablica-komunikatow.md' },
  BladApi: {
    type: 'object', required: ['kod'], description: I.opisBledu,
    properties: {
      kod: ref('KodKomunikatu'),
      pola: { type: 'object', additionalProperties: ref('KodKomunikatu') },
      parametry: { type: 'object', additionalProperties: { type: 'string' } },
    },
  },
  KomunikatApi: { type: 'object', required: ['kod'], properties: { kod: ref('KodKomunikatu'), parametry: { type: 'object', additionalProperties: { type: 'string' } } } },
  CzasZadaniaApi: { type: 'object', properties: { dzis: DATA, dataDemo: DATA, teraz: ZNACZNIK } },
  SymulacjeZadaniaApi: {
    type: 'object',
    properties: {
      symulacje: {
        oneOf: [
          { type: 'array', items: { type: 'string', enum: SYMULACJE_API } },
          { type: 'object', properties: Object.fromEntries(SYMULACJE_API.map((s) => [s, { type: 'boolean' }])) },
        ],
      },
    },
  },
  CzasOdpowiedziApi: { type: 'object', required: ['dzis', 'teraz', 'wersjaKatalogu'], properties: { dzis: DATA, teraz: ZNACZNIK, wersjaKatalogu: { type: 'integer' } } },
  PodstawaWZadaniuApi: {
    oneOf: [
      { type: 'object', required: ['kwota'], properties: { kwota: { ...GROSZE, maximum: 9_999_999 }, pelnyEtat: { type: 'boolean' } } },
      {
        type: 'object', required: ['podstawySkladek'],
        properties: {
          podstawySkladek: { type: 'array', items: { type: 'object', properties: { miesiac: { type: 'string', pattern: '^\\d{4}-\\d{2}$' }, kwota: GROSZE } } },
          forma: ref('FormaZatrudnienia'), pelnyEtat: { type: 'boolean' }, poczatekUbezpieczenia: DATA,
        },
      },
      { type: 'object', required: ['peselKontaZus'], properties: { peselKontaZus: PESEL, forma: ref('FormaZatrudnienia'), pelnyEtat: { type: 'boolean' } } },
    ],
  },
  FormaZatrudnienia: { type: 'string', enum: ['umowa-o-prace', 'umowa-zlecenia', 'jdg', 'brak-tytulu'] },
  ZadanieZasilkuMacierzynskiegoApi: {
    allOf: [ref('CzasZadaniaApi'), {
      type: 'object', required: ['daneWejsciowe'],
      properties: {
        daneWejsciowe: ref('DaneWejscioweKalkulatora'),
        podstawy: { type: 'object', properties: { matka: ref('PodstawaWZadaniuApi'), 'drugi-rodzic': ref('PodstawaWZadaniuApi') } },
        parametry: ref('ParametryScenariusza'),
      },
    }],
  },
  ZadanieWariantuApi: {
    allOf: [ref('CzasZadaniaApi'), {
      type: 'object', required: ['podstawa', 'dataPorodu', 'liczbaDzieci'],
      properties: {
        podstawa: ref('PodstawaWZadaniuApi'), dataPorodu: DATA, liczbaDzieci: { type: 'integer', minimum: 1, maximum: 5 },
        zaZyciem: { type: 'boolean' }, tygodniePrzedPowrotem: { type: 'integer', minimum: 0 },
      },
    }],
  },
  ZadaniePodzialuUrlopuApi: {
    allOf: [ref('CzasZadaniaApi'), {
      type: 'object', required: ['podstawy', 'liczbaDzieci'],
      properties: {
        podstawy: { type: 'object', properties: { matka: ref('PodstawaWZadaniuApi'), 'drugi-rodzic': ref('PodstawaWZadaniuApi') } },
        wariantMatki: { type: 'string', enum: ['81-5', '100-70'] }, dataPorodu: DATA, liczbaDzieci: { type: 'integer', minimum: 1, maximum: 5 },
        zaZyciem: { type: 'boolean' }, tygodnieMatki: { type: 'integer', minimum: 0 }, tygodnieDrugiegoRodzica: { type: 'integer', minimum: 0 },
        drugiRodzicBezPrawa: { type: 'boolean' },
      },
    }],
  },
  ZadaniePlanuApi: {
    allOf: [ref('CzasZadaniaApi'), {
      type: 'object', required: ['daneRodziny'],
      properties: {
        daneRodziny: ref('DaneRodziny'), daneCiazy: ref('DaneCiazyIDziecka'), zgoda: { type: 'boolean' },
        daneZusMatki: ref('DaneZKontaZus'), peselMatki: PESEL, daneZusDrugiegoRodzica: ref('DaneZKontaZus'), peselDrugiegoRodzica: PESEL,
        wnioski: { type: 'array', items: ref('Wniosek') }, wynikiKalkulacji: obiektDomeny(), poprzedniPlan: ref('PlanRodziny'),
        parametry: { type: 'object', properties: { progPodwyzszeniaPodstawyProcent: { type: 'number' }, progOstrzezeniaOkresuZasilkowegoDni: { type: 'number' } } },
      },
    }],
  },
  ZadanieSwiadczenWCiazyApi: {
    allOf: [ref('CzasZadaniaApi'), {
      type: 'object', required: ['daneRodziny'],
      properties: {
        daneRodziny: ref('DaneRodziny'), daneCiazy: ref('DaneCiazyIDziecka'), osoba: { type: 'string', enum: ['matka', 'drugi-rodzic'] },
        kopia: ref('DaneZKontaZus'), peselKontaZus: PESEL, zgoda: { type: 'boolean' },
      },
    }],
  },
  ZadanieWeryfikacjiSprawyApi: {
    allOf: [ref('CzasZadaniaApi'), {
      type: 'object',
      properties: {
        idSprawyWzorcowej: { type: 'string', pattern: '^S\\d{2}$' }, dane: ref('DaneSprawy'),
        dokumenty: { type: 'array', items: obiektDomeny() }, rozstrzygniecie: { type: 'array', items: obiektDomeny() },
        tolerancjaPorownaniaKwotyGrosze: { type: 'integer', minimum: 0 },
      },
    }],
  },
  ZadanieZaswiadczeniaApi: { allOf: [ref('CzasZadaniaApi'), ref('SymulacjeZadaniaApi'), { type: 'object', required: ['pesel'], properties: { pesel: PESEL, dzien: DATA } }] },
  ZadanieWnioskuDoZusApi: {
    allOf: [ref('CzasZadaniaApi'), ref('SymulacjeZadaniaApi'), {
      type: 'object', required: ['wniosek'],
      properties: { wniosek: ref('Wniosek'), wymaganeZalaczniki: { type: 'array', items: { type: 'string' } }, daneCiazy: ref('DaneCiazyIDziecka'), plan: ref('PlanRodziny') },
    }],
  },
  ZadaniePytaniaDoZusApi: {
    allOf: [ref('CzasZadaniaApi'), ref('SymulacjeZadaniaApi'), {
      type: 'object', required: ['pesel', 'tresc'],
      properties: { pesel: PESEL, tresc: { type: 'string', maxLength: 2000 }, idSprawy: { type: 'string' }, kontekst: obiektDomeny() },
    }],
  },
  ZadanieWalidacjiApi: {
    allOf: [ref('CzasZadaniaApi'), {
      type: 'object',
      properties: {
        wartosc: { type: 'string' }, wymagany: { type: 'boolean' },
        plik: { type: 'object', properties: { typ: { type: 'string' }, rozmiar: { type: 'integer' } } }, dane: obiektDomeny(),
      },
    }],
  },
  OdpowiedzWalidacjiApi: { type: 'object', required: ['poprawne'], properties: { poprawne: { const: true }, wartosc: {} } },
};

const TYPY_DOMENY = ['DaneWejscioweKalkulatora', 'ParametryScenariusza', 'DaneRodziny', 'DaneCiazyIDziecka', 'DaneZKontaZus', 'PlanRodziny',
  'DaneSprawy', 'Wniosek', 'OdpowiedzZasilkuMacierzynskiegoApi', 'WynikPorownaniaWariantow', 'WynikPodzialu', 'OdpowiedzPlanuApi',
  'SwiadczeniaWCiazy', 'OdpowiedzWeryfikacjiSprawyApi', 'OdpowiedzKontaZusApi', 'OdpowiedzStanuRozliczenApi', 'OdpowiedzZaswiadczeniaApi',
  'OdpowiedzEzlaApi', 'OdpowiedzWnioskuDoZusApi', 'OdpowiedzPytaniaDoZusApi'];

function odpowiedzBledu(kody: readonly KodKomunikatu[]): Record<string, Schemat> {
  const wedlugStatusu = new Map<number, KodKomunikatu[]>();
  for (const kod of kody) wedlugStatusu.set(statusBledu(kod), [...(wedlugStatusu.get(statusBledu(kod)) ?? []), kod]);
  return Object.fromEntries([...wedlugStatusu.entries()].sort(([a], [b]) => a - b).map(([status, lista]) => [
    String(status),
    { description: lista.join(', '), content: { 'application/json': { schema: ref('BladApi'), example: { kod: lista[0] } } } },
  ]));
}

function operacja(e: Endpoint): Schemat {
  const opis = T.endpointy[e.klucz];
  const schematOdpowiedzi = e.klucz === 'openApi' ? { type: 'object' } : ref(e.typOdpowiedzi);
  return {
    operationId: e.klucz,
    tags: [T.grupy[e.grupa]],
    summary: opis.tytul,
    description: opis.opis,
    parameters: [
      ...e.parametry.map((p) => (p === 'pesel' && e.przykladNaglowkow?.['X-Pesel'] ? { ...PARAMETRY.pesel, example: e.przykladNaglowkow['X-Pesel'] } : PARAMETRY[p])),
      ...(e.klucz === 'openApi' ? [] : NAGLOWKI),
    ],
    ...(e.metoda === 'POST' && e.typZadania
      ? { requestBody: { required: true, content: { 'application/json': { schema: ref(e.typZadania), example: e.przykladZadania } } } }
      : {}),
    responses: {
      [String(e.statusSukcesu)]: { description: I.odpowiedzPoprawna, content: { 'application/json': { schema: schematOdpowiedzi, example: e.przykladOdpowiedzi } } },
      ...odpowiedzBledu(e.bledy),
    },
  };
}

/** Dokument OpenAPI 3.1; adresy punktów końcowych są względne wobec adresu aplikacji. */
export function dokumentOpenApi(): Schemat {
  const paths: Record<string, Schemat> = {};
  for (const e of endpointy) paths[e.sciezka] = { ...(paths[e.sciezka] ?? {}), [e.metoda.toLowerCase()]: operacja(e) };
  return {
    openapi: '3.1.0',
    info: { title: I.tytul, version: '1.0.0', description: I.opis },
    tags: Object.values(T.grupy).map((name) => ({ name })),
    paths,
    components: {
      schemas: { ...SCHEMATY, ...Object.fromEntries(TYPY_DOMENY.map((typ) => [typ, { ...obiektDomeny(), title: typ }])) },
    },
  };
}
