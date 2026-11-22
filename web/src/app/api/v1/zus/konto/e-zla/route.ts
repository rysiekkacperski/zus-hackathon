// POST /api/v1/zus/konto/e-zla z treścią ZadanieEzlaApi { pesel, zgodaNaDaneZdrowia }: zaświadczenia lekarskie e-ZLA
// wystawione w ostatnich 12 miesiącach (epik 3.4.4), od najnowszych, według filtra odczytu `ezla`. PESEL jedzie wyłącznie
// w treści żądania, którą szyfruje połączenie HTTPS. Zaświadczenia są danymi o zdrowiu, więc żądanie potwierdza zgodę
// polem `zgodaNaDaneZdrowia: true`. → 200 OdpowiedzEzlaApi; 403 { kod: '0004' } bez zgody, 400 przy błędnym PESEL,
// 503 { kod: '0001' } przy symulacji daneZusNiedostepne i dla konta bez danych konta ZUS.
import { dataZeZnacznika } from '@/domena/daty';
import { poczatekOknaEzla } from '@/domena/dane-zus/filtry/ezla';
import type { OdpowiedzEzlaApi } from '@/domena/typy/api-v1';
import { odczytajKontoZus, peselZTresci } from '@/serwer/api/konta-zus';
import { przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0001', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const pesel = peselZTresci(k.tresc);
    if (!pesel.ok) return odpowiedzBledu(pesel.kod, { pola: { pesel: pesel.kod } });
    if (k.tresc.zgodaNaDaneZdrowia !== true) return odpowiedzBledu('0004', { pola: { zgodaNaDaneZdrowia: '0004' } });
    if (symulacjeZadania(zadanie, k.tresc).has('daneZusNiedostepne')) return odpowiedzBledu('0001');
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
