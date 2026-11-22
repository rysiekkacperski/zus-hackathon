// GET /api/v1/zus/konto z PESEL w nagłówku X-Pesel: symulowany odczyt Danych z konta ZUS (epik 3.4.1) z danych startowych kont
// w src/dane/konta-zus. Parametry adresu: `zgodaNaDaneZdrowia=nie` pomija zaświadczenia e-ZLA, `postac=zrodlowe` zwraca dane
// źródłowe konta przed filtrami odczytu (odczyt w przeglądarce nakłada na nie stan symulacji i sam przygotowuje kopię),
// `kanal=pue-ezus` oznacza odczyt przez PUE/eZUS (ViewZusAccountData), `dzis`, `teraz`, `dataDemo`,
// `symulacje=daneZusNiedostepne,pueEzusNiedostepne`. → 200 OdpowiedzKontaZusApi albo OdpowiedzZrodlowychDanychKontaZusApi;
// 400 { kod: '0024' | '0025' | '0026' } przy błędnym PESEL, 503 { kod: '0133' } przy odczycie przez PUE/eZUS z symulacją
// pueEzusNiedostepne, 503 { kod: '0001' } przy symulacji niedostępnych danych ZUS i dla konta bez danych konta ZUS
// (Administrator ZUS).
import type { OdpowiedzKontaZusApi, OdpowiedzZrodlowychDanychKontaZusApi } from '@/domena/typy/api-v1';
import { odczytajKontoZus, peselZNaglowka, zrodloKontaZus } from '@/serwer/api/konta-zus';
import { przygotujGet } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';

export function GET(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0001', async () => {
    const pesel = peselZNaglowka(zadanie);
    if (!pesel.ok) return odpowiedzBledu(pesel.kod, { pola: { pesel: pesel.kod } });
    const k = await przygotujGet(zadanie);
    if (k instanceof Response) return k;
    const adres = new URL(zadanie.url).searchParams;
    const symulacje = symulacjeZadania(zadanie);
    if (adres.get('kanal') === 'pue-ezus' && symulacje.has('pueEzusNiedostepne')) return odpowiedzBledu('0133');
    if (symulacje.has('daneZusNiedostepne')) return odpowiedzBledu('0001');
    const zgoda = adres.get('zgodaNaDaneZdrowia') !== 'nie';
    if (adres.get('postac') === 'zrodlowe') {
      const zrodlo = zrodloKontaZus(pesel.pesel);
      if (zrodlo === null) return odpowiedzBledu('0001');
      // Zaświadczenia e-ZLA są danymi o zdrowiu: bez zgody odpowiedź ich nie zawiera.
      const odpowiedz: OdpowiedzZrodlowychDanychKontaZusApi = { zrodlo: zgoda ? zrodlo : { ...zrodlo, zaswiadczeniaEzla: [] } };
      return odpowiedzDanych(odpowiedz);
    }
    const dane = odczytajKontoZus(pesel.pesel, k.czas.teraz, zgoda);
    if (dane === null) return odpowiedzBledu('0001');
    const odpowiedz: OdpowiedzKontaZusApi = { dane };
    return odpowiedzDanych(odpowiedz);
  });
}
