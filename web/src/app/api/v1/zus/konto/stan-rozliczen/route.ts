// GET /api/v1/zus/konto/stan-rozliczen?dzien=RRRR-MM-DD z PESEL w nagłówku X-Pesel: stan rozliczeń składek osoby prowadzącej
// pozarolniczą działalność na wskazany dzień (epik 3.4.5), domyślnie na dzień `dzis`. → 200 OdpowiedzStanuRozliczenApi
// ze stanem, rodzajem dokumentu, który ZUS wyda w tym dniu, i komunikatami karty dnia (0083, 0116, 0117, 0182–0187);
// konto z działalnością bez dostępnego stanu albo z symulacją stanRozliczenNiedostepny: 200 ze `stan: null` i komunikatem 0150,
// konto bez działalności: 200 ze `stan: null` i pustą listą komunikatów.
// 400 { kod: '0024' | '0025' | '0026' | '0010' }, 503 { kod: '0133' } przy symulacji pueEzusNiedostepne.
// Próg zadłużenia i okres spłaty pochodzą z katalogu świadczeń (reguła świadczeń 'zadluzenie' i jej wpisy słownika),
// a komunikaty liczy ta sama funkcja domeny co karta dnia powstania prawa w przeglądarce.
import type { OdpowiedzStanuRozliczenApi } from '@/domena/typy/api-v1';
import { komunikatyStanu, okresSplatyZKatalogu, progZadluzenia, rodzajZaswiadczenia, stanNaDzien } from '@/domena/zasilki/stan-rozliczen';
import '@/domena/zasilki/rozszerzenia-typow';
import { peselZNaglowka, zrodloKontaZus } from '@/serwer/api/konta-zus';
import { przygotujGet } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';
import { czyDataISO } from '@/serwer/api/walidacja';

export function GET(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0133', async () => {
    const pesel = peselZNaglowka(zadanie);
    if (!pesel.ok) return odpowiedzBledu(pesel.kod, { pola: { pesel: pesel.kod } });
    const k = await przygotujGet(zadanie);
    if (k instanceof Response) return k;
    const zadanyDzien = new URL(zadanie.url).searchParams.get('dzien');
    if (zadanyDzien !== null && zadanyDzien !== '' && !czyDataISO(zadanyDzien)) return odpowiedzBledu('0010', { pola: { dzien: '0010' } });
    const dzien = zadanyDzien || k.czas.dzis;
    const symulacje = symulacjeZadania(zadanie);
    if (symulacje.has('pueEzusNiedostepne')) return odpowiedzBledu('0133');

    const zrodlo = zrodloKontaZus(pesel.pesel);
    const dzialalnosc = zrodlo?.tytuly.filter((t) => t.rodzaj === 'dzialalnosc') ?? [];
    const os = zrodlo?.osZadluzenia;
    const bezStanu = (komunikaty: OdpowiedzStanuRozliczenApi['komunikaty']): Response => {
      const odpowiedz: OdpowiedzStanuRozliczenApi = { pesel: pesel.pesel, dzien, stan: null, rodzajZaswiadczenia: null, komunikaty };
      return odpowiedzDanych(odpowiedz);
    };
    // Stan rozliczeń dotyczy osoby prowadzącej pozarolniczą działalność; inne konto dostaje odpowiedź bez stanu.
    if (zrodlo === null || dzialalnosc.length === 0) return bezStanu([]);
    if (!os || zrodlo.stanRozliczenNiedostepny || symulacje.has('stanRozliczenNiedostepny')) return bezStanu([{ kod: '0150' }]);
    const stan = stanNaDzien(os, dzien, k.czas.teraz);
    const maChorobowe = dzialalnosc.some((t) => t.ubezpieczenieChorobowe.rodzaj === 'dobrowolne');
    const odpowiedz: OdpowiedzStanuRozliczenApi = {
      pesel: pesel.pesel,
      dzien,
      stan,
      rodzajZaswiadczenia: rodzajZaswiadczenia(stan),
      komunikaty: komunikatyStanu(stan, dzien, progZadluzenia(k.katalog, dzien).prog, okresSplatyZKatalogu(k.katalog, dzien), k.czas.dzis, maChorobowe),
    };
    return odpowiedzDanych(odpowiedz);
  });
}
