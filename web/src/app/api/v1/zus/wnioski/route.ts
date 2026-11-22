// POST /api/v1/zus/wnioski: symulowane przyjęcie wniosku przez ZUS: ZAM (epik 3.9.1), ZAS-53 (epik 3.9.9) i Z-15
// (epik 3.9.3). Wejście ZadanieWnioskuDoZusApi → 201 OdpowiedzWnioskuDoZusApi z numerem potwierdzenia
// 'ZAM-DEMO-RRRRMMDD-NNNN', 'ZAS53-DEMO-…' albo 'Z15-DEMO-…'. Kontrole przed wysłaniem są te same co w kreatorach:
// 400 { kod: '0043' } bez potwierdzonych oświadczeń, 422 { kod: '0149' } bez wymaganego pliku załącznika,
// 422 { kod: '0038' } po terminie 21 dni na wariant 81,5% we wniosku ZAM (przy podanych danych ciąży i planie),
// 400 z kodami pól struktury (0006, 0010, 0024–0026, 0040, 0041, 0124), 503 { kod: '0044' } przy symulacji
// wysylkaDoZusNiedostepna i po awarii obsługi. Serwer niczego nie zapisuje: wniosek wraca w stanie wysłanym.
// Pole ostatniNumerPotwierdzenia (NNNN ostatniego numeru dnia z przeglądarki) podnosi numer kolejnego potwierdzenia.
import { normalizujRachunek, walidujRachunek, walidujTelefon } from '@/domena/walidacje';
import { czyMinalTerminWariantu } from '@/domena/wnioski/zam-okresy';
import type { PlanRodziny, Zalacznik } from '@/domena/typy';
import type { OdpowiedzWnioskuDoZusApi, WniosekDoZusApi } from '@/domena/typy/api-v1';
import { sprawdzPesel } from '@/serwer/api/konta-zus';
import { identyfikator, nastepnyNumerPotwierdzenia } from '@/serwer/api/numeracja';
import { przygotujPost } from '@/serwer/api/obsluga';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { symulacjeZadania } from '@/serwer/api/symulacje';
import { czytajDaneCiazy } from '@/serwer/api/wejscia-rodziny';
import {
  czytajDate,
  czytajListe,
  czytajObiekt,
  czytajTekst,
  czytajZWyliczenia,
  type BledyWejscia,
} from '@/serwer/api/walidacja';

const PREFIKSY = { zam: 'ZAM-DEMO', 'zas-53': 'ZAS53-DEMO', 'z-15': 'Z15-DEMO' } as const;

function nazwaZalacznika(z: Zalacznik): string {
  return z.opis ?? z.plik?.nazwa ?? z.rodzaj;
}

export function POST(zadanie: Request): Promise<Response> {
  return obsluzZadanie('0044', async () => {
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;
    const bledy: BledyWejscia = {};
    const o = czytajObiekt(tresc.wniosek, 'wniosek', bledy, { wymagane: true });
    if (o === undefined) return odpowiedzBledowPol(bledy) as Response;

    const rodzaj = czytajZWyliczenia(o.rodzaj, ['zam', 'zas-53', 'z-15'] as const, 'wniosek.rodzaj', bledy, { wymagane: true });
    czytajZWyliczenia(o.stan ?? 'szkic', ['szkic', 'przygotowany'] as const, 'wniosek.stan', bledy);
    czytajTekst(o.idSprawy, 'wniosek.idSprawy', bledy, { wymagane: true });
    const pesel = sprawdzPesel(o.konto);
    if (!pesel.ok) bledy['wniosek.konto'] = pesel.kod;
    const zalaczniki = czytajListe(o.zalaczniki, 'wniosek.zalaczniki', bledy) as Zalacznik[];
    if (typeof o.numerRachunku === 'string') {
      const kod = walidujRachunek(o.numerRachunku, false);
      if (kod) bledy['wniosek.numerRachunku'] = kod;
    }
    if (typeof o.numerTelefonu === 'string' && o.numerTelefonu.trim() !== '') {
      const kod = walidujTelefon(o.numerTelefonu);
      if (kod) bledy['wniosek.numerTelefonu'] = kod;
    }
    if (rodzaj === 'zam') czytajListe(o.okresy, 'wniosek.okresy', bledy).forEach((okres, i) => {
      const ok = czytajObiekt(okres, `wniosek.okresy[${i}]`, bledy, { wymagane: true });
      czytajDate(ok?.od, `wniosek.okresy[${i}].od`, bledy, { wymagane: true });
      czytajDate(ok?.do, `wniosek.okresy[${i}].do`, bledy, { wymagane: true });
    });
    const wymagane = czytajListe(tresc.wymaganeZalaczniki, 'wymaganeZalaczniki', bledy).filter((id): id is string => typeof id === 'string');
    const daneCiazy = czytajDaneCiazy(tresc.daneCiazy, bledy);
    const plan = czytajObiekt(tresc.plan, 'plan', bledy);
    const blad = odpowiedzBledowPol(bledy);
    if (blad || rodzaj === undefined) return blad ?? odpowiedzBledu('0006', { pola: { 'wniosek.rodzaj': '0006' } });

    const wniosek = { ...o, zalaczniki } as unknown as WniosekDoZusApi;
    const potwierdzone = wniosek.rodzaj === 'zam' ? wniosek.oswiadczeniaPotwierdzone : wniosek.oswiadczeniePotwierdzone;
    if (potwierdzone !== true) {
      const pole = wniosek.rodzaj === 'zam' ? 'wniosek.oswiadczeniaPotwierdzone' : 'wniosek.oswiadczeniePotwierdzone';
      return odpowiedzBledu('0043', { pola: { [pole]: '0043' } });
    }
    const bezPliku = zalaczniki.filter((z) => !z.plik && !z.nazwaPoWyslaniu && (z.wymagany || wymagane.includes(z.id)));
    const brakujaceId = wymagane.filter((id) => !zalaczniki.some((z) => z.id === id));
    if (bezPliku.length > 0 || brakujaceId.length > 0) {
      return odpowiedzBledu('0149', {
        pola: Object.fromEntries([...bezPliku.map((z) => z.id), ...brakujaceId].map((id) => [`wniosek.zalaczniki.${id}`, '0149' as const])),
        parametry: { listaDokumentow: [...bezPliku.map(nazwaZalacznika), ...brakujaceId].join(', ') },
      });
    }
    if (wniosek.rodzaj === 'zam' && daneCiazy !== null && plan !== undefined
      && czyMinalTerminWariantu({ wniosek, daneCiazy, plan: plan as unknown as PlanRodziny, katalog }, czas.dzis)) {
      return odpowiedzBledu('0038', { pola: { 'wniosek.wariant': '0038' } });
    }
    if (symulacjeZadania(zadanie, tresc).has('wysylkaDoZusNiedostepna')) return odpowiedzBledu('0044');

    const ostatni = tresc.ostatniNumerPotwierdzenia;
    const ostatniZnany = typeof ostatni === 'number' && Number.isInteger(ostatni) && ostatni >= 0 && ostatni <= 9999 ? ostatni : 0;
    const potwierdzenie = nastepnyNumerPotwierdzenia(PREFIKSY[wniosek.rodzaj], czas.dzis, ostatniZnany);
    const idWniosku = typeof o.idWniosku === 'string' && o.idWniosku !== '' ? o.idWniosku : identyfikator('W', czas.teraz);
    const wyslany = {
      ...wniosek,
      idWniosku,
      stan: 'wyslany',
      adresat: 'zus',
      dataZlozenia: czas.dzis,
      potwierdzenie,
      zaktualizowano: czas.teraz,
      ...(typeof o.numerRachunku === 'string' ? { numerRachunku: normalizujRachunek(o.numerRachunku) } : {}),
      zalaczniki: zalaczniki.map(({ plik, ...z }) => (plik ? { ...z, nazwaPoWyslaniu: plik.nazwa } : z)),
    } as WniosekDoZusApi;
    const odpowiedz: OdpowiedzWnioskuDoZusApi = {
      idWniosku, rodzaj: wniosek.rodzaj, stan: 'wyslany', adresat: 'zus', dataZlozenia: czas.dzis, potwierdzenie, przyjeto: czas.teraz, wniosek: wyslany,
    };
    return odpowiedzDanych(odpowiedz, 201);
  });
}
