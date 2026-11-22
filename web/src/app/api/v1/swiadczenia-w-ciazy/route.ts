// POST /api/v1/swiadczenia-w-ciazy: prawo do świadczeń z ubezpieczenia chorobowego w ciąży (epik 3.5.2): zasiłek
// chorobowy, świadczenie rehabilitacyjne, zasiłek wyrównawczy i zasiłek macierzyński, okres zasiłkowy i wynagrodzenie
// chorobowe. Wejście ZadanieSwiadczenWCiazyApi → 200 { ...CzasOdpowiedziApi, swiadczenia: SwiadczeniaWCiazy };
// 400 z kodami pól struktury, 503 { kod: '0335' } po awarii wyliczenia. Wyliczenie wykonuje czysta funkcja domeny
// ustalSwiadczeniaWCiazy z katalogiem świadczeń serwera.
import { ustalSwiadczeniaWCiazy } from '@/domena/zasilki/prawo-w-ciazy';
import type { OdpowiedzSwiadczenWCiazyApi } from '@/domena/typy/api-v1';
import { czasOdpowiedzi, przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { czytajDaneCiazy, czytajDaneRodziny, czytajDaneZusDrugiego, kopiaZZadania } from '@/serwer/api/wejscia-rodziny';
import { czytajLogiczna, czytajZWyliczenia, type BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0335', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;
    const bledy: BledyWejscia = {};
    const daneRodziny = czytajDaneRodziny(tresc.daneRodziny, bledy, czas.teraz);
    const daneCiazy = czytajDaneCiazy(tresc.daneCiazy, bledy);
    const osoba = czytajZWyliczenia(tresc.osoba, ['matka', 'drugi-rodzic'] as const, 'osoba', bledy) ?? 'matka';
    const zgoda = czytajLogiczna(tresc.zgoda, 'zgoda', bledy, true);
    const kopia = kopiaZZadania(tresc.kopia, tresc.peselKontaZus, bledy, { kopia: 'kopia', pesel: 'peselKontaZus' }, czas.teraz, zgoda);
    const tytulyMatki = tresc.tytulyMatkiDlaProfilu !== undefined
      ? czytajDaneZusDrugiego(tresc.tytulyMatkiDlaProfilu, bledy, 'tytulyMatkiDlaProfilu', czas.teraz)
      : null;
    const blad = odpowiedzBledowPol(bledy);
    if (blad) return blad;
    if (daneRodziny === undefined) return odpowiedzBledu('0006', { pola: { daneRodziny: '0006' } });

    const swiadczenia = ustalSwiadczeniaWCiazy({
      osoba, daneRodziny, daneCiazy, kopia, katalog, dzis: czas.dzis, zgoda,
      ...(tytulyMatki ? { tytulyMatkiDlaProfilu: tytulyMatki } : {}),
    });
    const odpowiedz: OdpowiedzSwiadczenWCiazyApi = { ...czasOdpowiedzi(k), swiadczenia };
    return odpowiedzDanych(odpowiedz);
  });
}
