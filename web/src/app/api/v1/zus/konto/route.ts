// POST /api/v1/zus/konto z treścią ZadanieKontaZusApi: symulowany odczyt Danych z konta ZUS (epik 3.4.1) z danych startowych
// kont w src/dane/konta-zus. PESEL konta jedzie wyłącznie w treści żądania, którą szyfruje połączenie HTTPS, więc nie trafia
// do adresu, nagłówków, logów serwera ani historii przeglądarki. Pola treści: `pesel`, `zgodaNaDaneZdrowia: false` pomija
// zaświadczenia e-ZLA, `postac: 'zrodlowe'` zwraca dane źródłowe konta przed filtrami odczytu (odczyt w przeglądarce nakłada
// na nie stan symulacji i sam przygotowuje kopię), `kanal: 'pue-ezus'` oznacza odczyt przez PUE/eZUS (ViewZusAccountData),
// `dzis`, `teraz`, `dataDemo` i `symulacje` (daneZusNiedostepne, pueEzusNiedostepne).
// → 200 OdpowiedzKontaZusApi albo OdpowiedzZrodlowychDanychKontaZusApi; 400 { kod: '0024' | '0025' | '0026' } przy błędnym
// PESEL, 400 { kod: '0006' } przy błędnym polu treści, 503 { kod: '0133' } przy odczycie przez PUE/eZUS z symulacją
// pueEzusNiedostepne, 503 { kod: '0001' } przy symulacji niedostępnych danych ZUS i dla konta bez danych konta ZUS
// (Administrator ZUS).
import type { OdpowiedzKontaZusApi, OdpowiedzZrodlowychDanychKontaZusApi } from '@/domena/typy/api-v1';
import { odczytajKontoZus, peselZTresci, zrodloKontaZus } from '@/serwer/api/konta-zus';
import { przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledu, odpowiedzBledowPol, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';
import type { BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0001', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const pesel = peselZTresci(k.tresc);
    if (!pesel.ok) return odpowiedzBledu(pesel.kod, { pola: { pesel: pesel.kod } });
    const { zgodaNaDaneZdrowia, postac, kanal } = k.tresc;
    const bledy: BledyWejscia = {};
    if (zgodaNaDaneZdrowia !== undefined && typeof zgodaNaDaneZdrowia !== 'boolean') bledy.zgodaNaDaneZdrowia = '0006';
    if (postac !== undefined && postac !== 'zrodlowe') bledy.postac = '0006';
    if (kanal !== undefined && kanal !== 'pue-ezus') bledy.kanal = '0006';
    const bladPol = odpowiedzBledowPol(bledy);
    if (bladPol) return bladPol;

    const symulacje = symulacjeZadania(zadanie, k.tresc);
    if (kanal === 'pue-ezus' && symulacje.has('pueEzusNiedostepne')) return odpowiedzBledu('0133');
    if (symulacje.has('daneZusNiedostepne')) return odpowiedzBledu('0001');
    const zgoda = zgodaNaDaneZdrowia !== false;
    if (postac === 'zrodlowe') {
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
