// POST /api/v1/zus/pytania: symulowane wysłanie pytania do ZUS przez PUE/eZUS (epik 3.8.2). Wejście
// ZadaniePytaniaDoZusApi → 201 OdpowiedzPytaniaDoZusApi z pytaniem w stanie wysłanym i chwilą symulowanej odpowiedzi
// ZUS (po opoznienieOdpowiedziZusDni dniach z parametrów systemu); 400 { kod: '0129' | '0130' } przy treści pustej albo
// dłuższej niż 2000 znaków, 400 przy błędnym PESEL, 503 { kod: '0133' } przy symulacji pueEzusNiedostepne.
// Serwer niczego nie zapisuje: pytanie z kontekstem z żądania wraca do korespondencji konta w przeglądarce.
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';
import { chwilaSymulowanejOdpowiedzi, przytnijTrescPytania, walidujTrescPytania } from '@/domena/pytania-zus';
import type { KontekstPytaniaDoZus, PytanieDoZus } from '@/domena/typy';
import type { OdpowiedzPytaniaDoZusApi } from '@/domena/typy/api-v1';
import { sprawdzPesel } from '@/serwer/api/konta-zus';
import { identyfikator } from '@/serwer/api/numeracja';
import { przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';
import { czytajObiekt, czytajTekst, type BledyWejscia } from '@/serwer/api/walidacja';

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0133', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas } = k;
    const bledy: BledyWejscia = {};
    const pesel = sprawdzPesel(tresc.pesel);
    if (!pesel.ok) bledy.pesel = pesel.kod;
    const tekst = czytajTekst(tresc.tresc, 'tresc', bledy, { wymagane: true, kodBraku: '0129' });
    const kodTresci = tekst === undefined ? null : walidujTrescPytania(tekst);
    if (kodTresci) bledy.tresc = kodTresci;
    const idSprawy = czytajTekst(tresc.idSprawy, 'idSprawy', bledy);
    const kontekst = czytajObiekt(tresc.kontekst, 'kontekst', bledy);
    const blad = odpowiedzBledowPol(bledy);
    if (blad || !pesel.ok || tekst === undefined) return blad ?? odpowiedzBledu('0129');
    if (symulacjeZadania(zadanie, tresc).has('pueEzusNiedostepne')) return odpowiedzBledu('0133');

    const pytanie: PytanieDoZus = {
      idPytania: identyfikator('PYT', czas.teraz),
      ...(idSprawy ? { idSprawy } : {}),
      tresc: przytnijTrescPytania(tekst),
      kontekst: (kontekst ?? { profil: {} }) as unknown as KontekstPytaniaDoZus,
      wyslano: czas.teraz,
      status: 'wyslane',
      peselNadawcy: pesel.pesel,
    };
    const opoznienie = utworzParametryPoczatkowe().opoznienieOdpowiedziZusDni;
    const odpowiedz: OdpowiedzPytaniaDoZusApi = { pytanie, przewidywanaOdpowiedz: chwilaSymulowanejOdpowiedzi(pytanie, opoznienie) };
    return odpowiedzDanych(odpowiedz, 201);
  });
}
