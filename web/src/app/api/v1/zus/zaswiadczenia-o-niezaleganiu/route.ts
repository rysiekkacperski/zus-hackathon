// POST /api/v1/zus/zaswiadczenia-o-niezaleganiu: symulowany wniosek o zaświadczenie o niezaleganiu w opłacaniu składek
// (historyjka 3.4.5.1.4). ZUS wydaje dokument według stanu rozliczeń w dniu `dzien` (domyślnie w dniu wniosku):
// zaświadczenie o niezaleganiu albo, przy zadłużeniu nieobjętym umową spłacaną terminowo, decyzję o odmowie wydania
// zaświadczenia z kwotą zadłużenia (rodzaj 'o-wysokosci-zadluzenia'). Wejście ZadanieZaswiadczeniaApi → 201
// OdpowiedzZaswiadczeniaApi; 400 { kod: '0024' | '0025' | '0026' | '0010' }, 503 { kod: '0133' } dla konta bez stanu
// rozliczeń w PUE/eZUS i przy symulacji pueEzusNiedostepne. Pole `stanSymulowany` przekazuje stan symulowanego ZUS z ustawień
// demo (na przykład oś zadłużenia ze scenariusza), a `wnioskodawca` imię i nazwisko konta spoza danych startowych.
// Serwer niczego nie zapisuje.
import type { ZaswiadczenieOStanieRozliczen } from '@/domena/typy';
import type { OdpowiedzZaswiadczeniaApi } from '@/domena/typy/api-v1';
import { rodzajZaswiadczenia, stanNaDzien } from '@/domena/zasilki/stan-rozliczen';
import '@/domena/zasilki/rozszerzenia-typow';
import { czytajOsobe, czytajStanSymulowany, sprawdzPesel, zrodloKontaZus } from '@/serwer/api/konta-zus';
import { identyfikator } from '@/serwer/api/numeracja';
import { przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';
import { czytajDate, type BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0133', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas } = k;
    const bledy: BledyWejscia = {};
    const pesel = sprawdzPesel(tresc.pesel);
    if (!pesel.ok) bledy.pesel = pesel.kod;
    const dzien = czytajDate(tresc.dzien, 'dzien', bledy) ?? czas.dzis;
    const stanSymulowany = czytajStanSymulowany(tresc.stanSymulowany, bledy);
    const wnioskodawca = czytajOsobe(tresc.wnioskodawca, 'wnioskodawca', bledy);
    const blad = odpowiedzBledowPol(bledy);
    if (blad || !pesel.ok) return blad ?? odpowiedzBledu('0024');
    if (symulacjeZadania(zadanie, tresc).has('pueEzusNiedostepne')) return odpowiedzBledu('0133');

    const zrodlo = zrodloKontaZus(pesel.pesel, stanSymulowany, wnioskodawca);
    const os = zrodlo?.osZadluzenia;
    if (!zrodlo || !os || zrodlo.stanRozliczenNiedostepny) return odpowiedzBledu('0133');
    const stan = stanNaDzien(os, dzien, czas.teraz);
    const zaswiadczenie: ZaswiadczenieOStanieRozliczen = {
      id: identyfikator('ZSR', czas.teraz),
      rodzaj: rodzajZaswiadczenia(stan),
      dzienStanu: dzien,
      kwotaZadluzenia: stan.kwotaZadluzenia,
      ...(stan.umowa ? { umowa: stan.umowa } : {}),
      wystawiono: czas.teraz,
      imie: zrodlo.imie,
      nazwisko: zrodlo.nazwisko,
      pesel: pesel.pesel,
    };
    const odpowiedz: OdpowiedzZaswiadczeniaApi = { zaswiadczenie };
    return odpowiedzDanych(odpowiedz, 201);
  });
}
