// GET /api/v1/zus/konto/e-zla z PESEL w nagłówku X-Pesel: zaświadczenia lekarskie e-ZLA wystawione w ostatnich 12 miesiącach (epik 3.4.4),
// od najnowszych, według filtra odczytu `ezla`. Zaświadczenia są danymi o zdrowiu, więc żądanie potwierdza zgodę
// parametrem `zgodaNaDaneZdrowia=tak`. → 200 OdpowiedzEzlaApi; 403 { kod: '0004' } bez zgody, 400 przy błędnym PESEL,
// 503 { kod: '0001' } przy symulacji daneZusNiedostepne i dla konta bez danych konta ZUS.
import { dataZeZnacznika } from '@/domena/daty';
import { poczatekOknaEzla } from '@/domena/dane-zus/filtry/ezla';
import type { OdpowiedzEzlaApi } from '@/domena/typy/api-v1';
import { odczytajKontoZus, peselZNaglowka } from '@/serwer/api/konta-zus';
import { przygotujGet } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';

export function GET(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0001', async () => {
    const pesel = peselZNaglowka(zadanie);
    if (!pesel.ok) return odpowiedzBledu(pesel.kod, { pola: { pesel: pesel.kod } });
    if (new URL(zadanie.url).searchParams.get('zgodaNaDaneZdrowia') !== 'tak') {
      return odpowiedzBledu('0004', { pola: { zgodaNaDaneZdrowia: '0004' } });
    }
    const k = await przygotujGet(zadanie);
    if (k instanceof Response) return k;
    if (symulacjeZadania(zadanie).has('daneZusNiedostepne')) return odpowiedzBledu('0001');
    const dane = odczytajKontoZus(pesel.pesel, k.czas.teraz, true);
    if (dane === null) return odpowiedzBledu('0001');
    const odpowiedz: OdpowiedzEzlaApi = {
      pesel: pesel.pesel,
      poczatekOkna: poczatekOknaEzla(dataZeZnacznika(k.czas.teraz)),
      zaswiadczenia: dane.zaswiadczeniaEzla,
    };
    return odpowiedzDanych(odpowiedz);
  });
}
