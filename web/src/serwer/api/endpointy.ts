// Rejestr punktów końcowych REST API w wersji 1: metoda, adres, grupa, kody błędów i przykłady. Z rejestru powstaje
// opis OpenAPI 3.1 (GET /api/v1/openapi.json) i strona /api-docs; tytuły i opisy pochodzą z teksty.ViewApiDocs.
// Przykłady korzystają z kont demonstracyjnych symulowanego ZUS (src/dane/konta-zus) i spraw wzorcowych przewodnika.
import type { KodKomunikatu } from '@/domena/typy';
import type { RodzajWalidacjiApi } from '@/domena/typy/api-v1';
import { teksty } from '@/teksty';

export const RODZAJE_WALIDACJI: readonly RodzajWalidacjiApi[] = ['pesel', 'imie', 'nazwisko', 'email', 'telefon', 'rachunek', 'kod-pocztowy',
  'kwota', 'data', 'tresc-pytania', 'plik', 'dane-wejsciowe-kalkulatora', 'dane-sprawy', 'dane-zam'];

export type GrupaEndpointu = keyof typeof teksty.ViewApiDocs.grupy;
export type KluczEndpointu = keyof typeof teksty.ViewApiDocs.endpointy;
export type ParametrAdresu = 'pesel' | 'rodzaj' | 'dzien' | 'zgodaNaDaneZdrowia' | 'postac' | 'kanal' | 'dzis' | 'dataDemo' | 'teraz'
  | 'symulacje';

export interface Endpoint {
  klucz: KluczEndpointu;
  metoda: 'GET' | 'POST';
  /** Adres w zapisie OpenAPI, na przykład '/api/v1/walidacje/{rodzaj}'. */
  sciezka: string;
  grupa: GrupaEndpointu;
  /** Typ TypeScript żądania i odpowiedzi z web/src/domena/typy/api-v1.ts. */
  typZadania?: string;
  typOdpowiedzi: string;
  statusSukcesu: 200 | 201;
  parametry: ParametrAdresu[];
  bledy: KodKomunikatu[];
  /** Adres przykładowego wywołania (z parametrami) i treść przykładowego żądania POST. */
  przykladAdresu: string;
  /** Nagłówki przykładowego wywołania, na przykład X-Pesel z PESEL konta, który nie trafia do adresu. */
  przykladNaglowkow?: Record<string, string>;
  przykladZadania?: Record<string, unknown>;
  przykladOdpowiedzi: Record<string, unknown>;
}

const PESEL_JDG = '93041231085';
const PESEL_ROZLICZEN = '95082103460';
const PESEL_BEZ_ZADLUZENIA = '91113040407';
const CZAS = ['dzis', 'dataDemo', 'teraz'] as const satisfies ParametrAdresu[];
const ZRODLO_RODZICA = 'odpowiedz-rodzica';

const profilRodziny = {
  rodzicKonta: 'matka',
  sytuacja: { wartosc: 'oczekiwanie', zrodlo: ZRODLO_RODZICA },
  matka: {
    formaZatrudnienia: { wartosc: 'jdg', zrodlo: 'konto-zus' },
    dobrowolneChorobowe: { wartosc: true, zrodlo: 'konto-zus' },
    platnikZasilku: { wartosc: 'zus', zrodlo: ZRODLO_RODZICA },
  },
  drugiRodzic: { formaZatrudnienia: { wartosc: 'umowa-o-prace', zrodlo: ZRODLO_RODZICA } },
  stanCywilny: { wartosc: 'malzenstwo', zrodlo: ZRODLO_RODZICA },
  dochodNaOsobe: { wartosc: 250000, zrodlo: ZRODLO_RODZICA },
};
const daneCiazy = { przewidywanyTerminPorodu: '2027-03-20', liczbaDzieciZCiazy: 1, dataPoroduPotwierdzona: false };

export const endpointy: readonly Endpoint[] = [
  {
    klucz: 'zasilekMacierzynski', metoda: 'POST', sciezka: '/api/v1/kalkulator/zasilek-macierzynski', grupa: 'kalkulatory',
    typZadania: 'ZadanieZasilkuMacierzynskiegoApi', typOdpowiedzi: 'OdpowiedzZasilkuMacierzynskiegoApi', statusSukcesu: 200, parametry: [],
    bledy: ['0006', '0010', '0016', '0018', '0019', '0042', '0061', '0093', '0094', '0173', '0335'],
    przykladAdresu: '/api/v1/kalkulator/zasilek-macierzynski',
    przykladZadania: {
      dzis: '2026-11-22',
      daneWejsciowe: {
        zdarzenie: 'porod', dataPorodu: '2026-11-10', liczbaDzieci: 1,
        formaMatki: { forma: 'umowa-o-prace' }, formaDrugiegoRodzica: { forma: 'umowa-o-prace' },
      },
      podstawy: { matka: { kwota: 650000 }, 'drugi-rodzic': { kwota: 500000 } },
    },
    przykladOdpowiedzi: {
      dzis: '2026-11-22', wersjaKatalogu: 1,
      wynik: {
        okresy: [{ rodzic: 'matka', rodzaj: 'macierzynski', od: '2026-11-10', do: '2027-03-29', dni: 140, stawka: 100, miesiecznie: 650000, zaOkres: 3033380 }],
        sumy: { razem: 7399147 },
      },
      wariant815: { dostepny: true, termin: '2026-12-01' },
    },
  },
  {
    klucz: 'wariant', metoda: 'POST', sciezka: '/api/v1/kalkulator/wariant', grupa: 'kalkulatory',
    typZadania: 'ZadanieWariantuApi', typOdpowiedzi: 'WynikPorownaniaWariantow', statusSukcesu: 200, parametry: [],
    bledy: ['0006', '0010', '0016', '0018', '0061', '0093', '0094', '0173', '0335'],
    przykladAdresu: '/api/v1/kalkulator/wariant',
    przykladZadania: { dzis: '2026-11-22', dataPorodu: '2026-11-10', liczbaDzieci: 1, podstawa: { kwota: 650000 }, tygodniePrzedPowrotem: 32 },
    przykladOdpowiedzi: {
      tygodniePrzedPowrotem: 32,
      wynik: { wariant81: { miesiecznie: [529750, 529750], suma: 6427876 }, wariant100i70: { miesiecznie: [650000, 455000], suma: 6430788 }, roznica: 2912, dataPowrotu: '2027-11-09' },
    },
  },
  {
    klucz: 'podzialUrlopu', metoda: 'POST', sciezka: '/api/v1/kalkulator/podzial-urlopu', grupa: 'kalkulatory',
    typZadania: 'ZadaniePodzialuUrlopuApi', typOdpowiedzi: 'WynikPodzialu', statusSukcesu: 200, parametry: [],
    bledy: ['0006', '0010', '0016', '0061', '0093', '0094', '0173', '0335'],
    przykladAdresu: '/api/v1/kalkulator/podzial-urlopu',
    przykladZadania: {
      dzis: '2026-11-22', dataPorodu: '2026-11-10', liczbaDzieci: 1, wariantMatki: '100-70', tygodnieMatki: 32, tygodnieDrugiegoRodzica: 9,
      podstawy: { matka: { kwota: 650000 }, 'drugi-rodzic': { peselKontaZus: '90011555532' } },
    },
    przykladOdpowiedzi: {
      zasady: { wymiar: 41, maks: 32, nieprzenoszalne: 9 }, tygodnieMatki: 32, tygodnieDrugiegoRodzica: 9,
      wynik: { miesiecznie: { matka: 455000, 'drugi-rodzic': 573829 }, sumy: { matka: 3397408, 'drugi-rodzic': 1205064 }, przepadajace: 0 },
    },
  },
  {
    klucz: 'plan', metoda: 'POST', sciezka: '/api/v1/plan', grupa: 'plan',
    typZadania: 'ZadaniePlanuApi', typOdpowiedzi: 'OdpowiedzPlanuApi', statusSukcesu: 200, parametry: [],
    bledy: ['0006', '0010', '0024', '0025', '0026', '0335'],
    przykladAdresu: '/api/v1/plan',
    przykladZadania: { dzis: '2026-11-22', zgoda: true, daneRodziny: profilRodziny, daneCiazy, peselMatki: PESEL_JDG },
    przykladOdpowiedzi: {
      plan: { biezacyEtap: 'ciaza', pozycje: [{ idSprawy: 'K05', etap: 'pierwsze-tygodnie', status: 'do-zrobienia' }] },
      kalendarz: { terminy: [{ idSprawy: 'K05', termin: '2027-03-27', szacowany: true, dniDoTerminu: 125 }] },
    },
  },
  {
    klucz: 'swiadczeniaWCiazy', metoda: 'POST', sciezka: '/api/v1/swiadczenia-w-ciazy', grupa: 'plan',
    typZadania: 'ZadanieSwiadczenWCiazyApi', typOdpowiedzi: 'SwiadczeniaWCiazy', statusSukcesu: 200, parametry: [],
    bledy: ['0006', '0010', '0024', '0025', '0026', '0335'],
    przykladAdresu: '/api/v1/swiadczenia-w-ciazy',
    przykladZadania: { dzis: '2026-11-22', daneRodziny: profilRodziny, daneCiazy, peselKontaZus: PESEL_JDG },
    przykladOdpowiedzi: {
      swiadczenia: {
        tryb: 'konto-zus', forma: 'jdg', liczbaEzla: 2,
        zasilekChorobowy: { wynik: { postac: 'przysluguje', od: '2026-11-02' } }, macierzynski: { wynik: { postac: 'przysluguje', od: '2027-03-20' } },
      },
    },
  },
  {
    klucz: 'weryfikacjaSprawy', metoda: 'POST', sciezka: '/api/v1/przykladowe-sprawy/weryfikacja', grupa: 'sprawy',
    typZadania: 'ZadanieWeryfikacjiSprawyApi', typOdpowiedzi: 'OdpowiedzWeryfikacjiSprawyApi', statusSukcesu: 200, parametry: [],
    bledy: ['0006', '0010', '0109', '0335'],
    przykladAdresu: '/api/v1/przykladowe-sprawy/weryfikacja',
    przykladZadania: { idSprawyWzorcowej: 'S01' },
    przykladOdpowiedzi: {
      weryfikacja: { dataZdarzenia: { data: '2026-09-02', rodzaj: 'porod' }, wyniki: [{ swiadczenie: 'zasilek-macierzynski', prawo: 'przysluguje' }], komunikaty: ['0177'] },
      podstawa: { kwota: 604030 }, wyliczenie: { sumy: { razem: 2818760 } }, porownanieWyliczenia: { wynik: 'zgodne', kod: '0111' },
      wyliczeniaSwiadczen: { swiadczenia: [{ swiadczenie: 'zasilek-macierzynski', suma: 2818760 }] }, porownanieSwiadczen: { wynik: 'zgodne', kod: '0111' },
    },
  },
  {
    klucz: 'kontoZus', metoda: 'GET', sciezka: '/api/v1/zus/konto', grupa: 'zus',
    typOdpowiedzi: 'OdpowiedzKontaZusApi', statusSukcesu: 200,
    parametry: ['pesel', 'zgodaNaDaneZdrowia', 'postac', 'kanal', ...CZAS, 'symulacje'],
    bledy: ['0001', '0133', '0024', '0025', '0026', '0010'],
    przykladAdresu: '/api/v1/zus/konto',
    przykladNaglowkow: { 'X-Pesel': PESEL_JDG },
    przykladOdpowiedzi: { dane: { pesel: PESEL_JDG, imie: 'Anna', nazwisko: 'Nowak', tytuly: [{ rodzaj: 'dzialalnosc', od: '2024-03-01' }] } },
  },
  {
    klucz: 'stanRozliczen', metoda: 'GET', sciezka: '/api/v1/zus/konto/stan-rozliczen', grupa: 'zus',
    typOdpowiedzi: 'OdpowiedzStanuRozliczenApi', statusSukcesu: 200, parametry: ['pesel', 'dzien', ...CZAS, 'symulacje'],
    bledy: ['0010', '0024', '0025', '0026', '0133'],
    przykladAdresu: '/api/v1/zus/konto/stan-rozliczen?dzien=2026-11-22',
    przykladNaglowkow: { 'X-Pesel': PESEL_ROZLICZEN },
    przykladOdpowiedzi: {
      pesel: PESEL_ROZLICZEN, dzien: '2026-11-22', stan: { dzien: '2026-11-22', kwotaZadluzenia: 2540, zadluzenieOd: '2026-11-21' },
      rodzajZaswiadczenia: 'o-wysokosci-zadluzenia',
      komunikaty: [{ kod: '0116', parametry: { data: '22.11.2026', kwota: '25,40 zł' } }, { kod: '0183', parametry: { prog: '48,06 zł' } }],
    },
  },
  {
    klucz: 'zaswiadczenie', metoda: 'POST', sciezka: '/api/v1/zus/zaswiadczenia-o-niezaleganiu', grupa: 'zus',
    typZadania: 'ZadanieZaswiadczeniaApi', typOdpowiedzi: 'OdpowiedzZaswiadczeniaApi', statusSukcesu: 201, parametry: [],
    bledy: ['0010', '0024', '0025', '0026', '0133'],
    przykladAdresu: '/api/v1/zus/zaswiadczenia-o-niezaleganiu',
    przykladZadania: { pesel: PESEL_BEZ_ZADLUZENIA, dzien: '2026-10-01' },
    przykladOdpowiedzi: { zaswiadczenie: { rodzaj: 'o-niezaleganiu', dzienStanu: '2026-10-01', kwotaZadluzenia: 0, imie: 'Joanna', nazwisko: 'Mazur' } },
  },
  {
    klucz: 'ezla', metoda: 'GET', sciezka: '/api/v1/zus/konto/e-zla', grupa: 'zus',
    typOdpowiedzi: 'OdpowiedzEzlaApi', statusSukcesu: 200, parametry: ['pesel', 'zgodaNaDaneZdrowia', ...CZAS, 'symulacje'],
    bledy: ['0001', '0004', '0024', '0025', '0026'],
    przykladAdresu: '/api/v1/zus/konto/e-zla?zgodaNaDaneZdrowia=tak',
    przykladNaglowkow: { 'X-Pesel': PESEL_JDG },
    przykladOdpowiedzi: { pesel: PESEL_JDG, poczatekOkna: '2025-11-22', zaswiadczenia: [{ seriaINumer: 'ZY 2611207', od: '2026-11-21', do: '2026-12-04' }] },
  },
  {
    klucz: 'wnioski', metoda: 'POST', sciezka: '/api/v1/zus/wnioski', grupa: 'zus',
    typZadania: 'ZadanieWnioskuDoZusApi', typOdpowiedzi: 'OdpowiedzWnioskuDoZusApi', statusSukcesu: 201, parametry: [],
    bledy: ['0006', '0010', '0024', '0025', '0026', '0038', '0040', '0041', '0043', '0044', '0124', '0149'],
    przykladAdresu: '/api/v1/zus/wnioski',
    przykladZadania: {
      dzis: '2026-11-22',
      wniosek: { rodzaj: 'zas-53', idSprawy: 'K24', konto: PESEL_JDG, stan: 'szkic', zalaczniki: [], oswiadczeniePotwierdzone: true },
    },
    przykladOdpowiedzi: { rodzaj: 'zas-53', stan: 'wyslany', adresat: 'zus', dataZlozenia: '2026-11-22', potwierdzenie: 'ZAS53-DEMO-20261122-0001' },
  },
  {
    klucz: 'pytania', metoda: 'POST', sciezka: '/api/v1/zus/pytania', grupa: 'zus',
    typZadania: 'ZadaniePytaniaDoZusApi', typOdpowiedzi: 'OdpowiedzPytaniaDoZusApi', statusSukcesu: 201, parametry: [],
    bledy: ['0024', '0025', '0026', '0129', '0130', '0133'],
    przykladAdresu: '/api/v1/zus/pytania',
    przykladZadania: { teraz: '2026-11-22T10:00:00', pesel: PESEL_JDG, idSprawy: 'K12', tresc: 'Od kiedy ZUS wypłaci mi zasiłek macierzyński?' },
    przykladOdpowiedzi: { pytanie: { idSprawy: 'K12', status: 'wyslane', wyslano: '2026-11-22T10:00:00' }, przewidywanaOdpowiedz: '2026-11-26T10:00:00' },
  },
  {
    klucz: 'walidacje', metoda: 'POST', sciezka: '/api/v1/walidacje/{rodzaj}', grupa: 'walidacje',
    typZadania: 'ZadanieWalidacjiApi', typOdpowiedzi: 'OdpowiedzWalidacjiApi', statusSukcesu: 200, parametry: ['rodzaj'],
    bledy: ['0006', '0010', '0016', '0024', '0025', '0026', '0028', '0029', '0030', '0039', '0040', '0041', '0059', '0060', '0093', '0103', '0104', '0124', '0129', '0130', '0196', '0213'],
    przykladAdresu: '/api/v1/walidacje/rachunek',
    przykladZadania: { wartosc: '61 1090 1014 0000 0712 1981 2874' },
    przykladOdpowiedzi: { poprawne: true, wartosc: '61109010140000071219812874' },
  },
  {
    klucz: 'openApi', metoda: 'GET', sciezka: '/api/v1/openapi.json', grupa: 'opis',
    typOdpowiedzi: 'OpenAPI 3.1', statusSukcesu: 200, parametry: [], bledy: [],
    przykladAdresu: '/api/v1/openapi.json',
    przykladOdpowiedzi: { openapi: '3.1.0', info: { version: '1.0.0' } },
  },
];
