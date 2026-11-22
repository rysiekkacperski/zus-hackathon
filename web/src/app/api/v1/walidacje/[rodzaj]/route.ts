// POST /api/v1/walidacje/{rodzaj}: walidacja pola albo danych tymi samymi funkcjami domeny co formularze przewodnika.
// Rodzaje: pesel, imie, nazwisko, email, telefon, rachunek, kod-pocztowy, kwota, data, tresc-pytania, plik,
// dane-wejsciowe-kalkulatora, dane-sprawy, dane-zam. Wejście ZadanieWalidacjiApi → 200 OdpowiedzWalidacjiApi z wartością
// po normalizacji, 400 { kod, pola } z kodem z tablicy komunikatów przy wartości błędnej (status z tablicy, na przykład
// 415 dla 0103 i 413 dla 0104), 400 { kod: '0006' } przy nieznanym rodzaju walidacji.
import { parsujDate } from '@/domena/daty';
import { parsujKwote } from '@/domena/kwoty';
import { walidujDaneSprawy } from '@/domena/przykladowe-sprawy/walidacja';
import { walidujTrescPytania } from '@/domena/pytania-zus';
import type { KodKomunikatu } from '@/domena/typy';
import type { OdpowiedzWalidacjiApi, RodzajWalidacjiApi } from '@/domena/typy/api-v1';
import {
  normalizujRachunek,
  normalizujTelefon,
  walidujEmail,
  walidujImieNazwisko,
  walidujKodPocztowy,
  walidujPlik,
  walidujRachunek,
  walidujTelefon,
} from '@/domena/walidacje';
import { walidujPesel } from '@/domena/pesel';
import { walidujDaneZam, type FormularzDanychZam } from '@/domena/wnioski/zam';
import { MAKS_PODSTAWY_GROSZE, czytajDaneWejsciowe, walidujRegulyDanych } from '@/serwer/api/wejscia-kalkulatora';
import { RODZAJE_WALIDACJI } from '@/serwer/api/endpointy';
import { przygotujPost } from '@/serwer/api/obsluga';
import { daneSprawyZZadania } from '@/serwer/api/wejscia-sprawy';
import { obsluzZadanie, odpowiedzBledowPol, odpowiedzBledu, odpowiedzDanych } from '@/serwer/api/odpowiedzi';
import { czyObiekt, czytajLogiczna, czytajObiekt, sciezka, type BledyWejscia, type Obiekt } from '@/serwer/api/walidacja';

function poprawne(wartosc?: OdpowiedzWalidacjiApi['wartosc']): Response {
  const odpowiedz: OdpowiedzWalidacjiApi = wartosc === undefined ? { poprawne: true } : { poprawne: true, wartosc };
  return odpowiedzDanych(odpowiedz);
}

function bladPola(pole: string, kod: KodKomunikatu): Response {
  return odpowiedzBledu(kod, { pola: { [pole]: kod } });
}

function tekst(tresc: Obiekt): string | null {
  return typeof tresc.wartosc === 'string' ? tresc.wartosc : null;
}

function formularzZam(o: Obiekt): FormularzDanychZam {
  const t = (w: unknown) => (typeof w === 'string' ? w : '');
  return {
    zDanymiDziecka: o.zDanymiDziecka === true,
    imieDziecka: t(o.imieDziecka),
    nazwiskoDziecka: t(o.nazwiskoDziecka),
    peselDziecka: t(o.peselDziecka),
    miejsceUrodzenia: t(o.miejsceUrodzenia),
    numerRachunku: t(o.numerRachunku),
    ...(typeof o.numerTelefonu === 'string' ? { numerTelefonu: o.numerTelefonu } : {}),
    ...(typeof o.dataPorodu === 'string' ? { dataPorodu: o.dataPorodu } : {}),
  };
}

export function POST(zadanie: Request, { params }: { params: Promise<{ rodzaj: string }> }): Promise<Response> {
  return obsluzZadanie('0335', async () => {
    const rodzaj = decodeURIComponent((await params).rodzaj);
    if (!(RODZAJE_WALIDACJI as readonly string[]).includes(rodzaj)) return bladPola('rodzaj', '0006');
    const k = await przygotujPost(zadanie);
    if (k instanceof Response) return k;
    const { tresc, czas, katalog } = k;
    const bledy: BledyWejscia = {};
    const wymagany = czytajLogiczna(tresc.wymagany, 'wymagany', bledy, true);
    const w = tekst(tresc);
    const r = rodzaj as RodzajWalidacjiApi;

    if (['pesel', 'imie', 'nazwisko', 'email', 'telefon', 'rachunek', 'kod-pocztowy', 'kwota', 'data', 'tresc-pytania'].includes(r) && w === null) {
      return bladPola('wartosc', '0006');
    }
    switch (r) {
      case 'pesel': {
        const p = walidujPesel(w as string);
        return p.ok ? poprawne(p.pesel) : bladPola('wartosc', p.kod);
      }
      case 'imie':
      case 'nazwisko': {
        const kod = walidujImieNazwisko(w as string, r);
        return kod ? bladPola('wartosc', kod) : poprawne((w as string).trim().normalize('NFC'));
      }
      case 'email': {
        const kod = walidujEmail(w as string, wymagany);
        return kod ? bladPola('wartosc', kod) : poprawne((w as string).trim());
      }
      case 'telefon': {
        const kod = walidujTelefon(w as string);
        return kod ? bladPola('wartosc', kod) : poprawne(normalizujTelefon(w as string));
      }
      case 'rachunek': {
        const kod = walidujRachunek(w as string, wymagany);
        return kod ? bladPola('wartosc', kod) : poprawne(normalizujRachunek(w as string));
      }
      case 'kod-pocztowy':
        // Adres z kodem pocztowym w zapisie 00-000, ta sama reguła i kod 0196 co adres doręczenia odpisu aktu urodzenia.
        return walidujKodPocztowy(w as string) ? poprawne((w as string).trim()) : bladPola('wartosc', '0196');
      case 'kwota': {
        if ((w as string).trim() === '') return bladPola('wartosc', '0093');
        const kwota = parsujKwote(w as string);
        return kwota === null || kwota <= 0 || kwota > MAKS_PODSTAWY_GROSZE ? bladPola('wartosc', '0016') : poprawne(kwota);
      }
      case 'data': {
        const data = parsujDate(w as string);
        return data === null ? bladPola('wartosc', '0010') : poprawne(data);
      }
      case 'tresc-pytania': {
        const kod = walidujTrescPytania(w as string);
        return kod ? bladPola('wartosc', kod) : poprawne();
      }
      case 'plik': {
        const plik = czytajObiekt(tresc.plik, 'plik', bledy, { wymagane: true });
        if (!plik || typeof plik.typ !== 'string' || typeof plik.rozmiar !== 'number') return bladPola('plik', '0103');
        const kod = walidujPlik({ typ: plik.typ, rozmiar: plik.rozmiar });
        return kod ? bladPola('plik', kod) : poprawne();
      }
      case 'dane-wejsciowe-kalkulatora': {
        const dane = czytajDaneWejsciowe(tresc.dane, bledy, 'dane');
        const blad = odpowiedzBledowPol(bledy) ?? (dane ? odpowiedzBledowPol(walidujRegulyDanych(dane, czas.dzis, katalog, 'dane')) : null);
        if (blad) return blad;
        return dane ? poprawne(dane as unknown as Record<string, unknown>) : bladPola('dane', '0006');
      }
      case 'dane-sprawy': {
        if (!czyObiekt(tresc.dane)) return bladPola('dane', '0006');
        const dane = daneSprawyZZadania(tresc.dane, bledy);
        const bladStruktury = odpowiedzBledowPol(bledy);
        if (bladStruktury) return bladStruktury;
        const kody = walidujDaneSprawy(dane);
        return odpowiedzBledowPol(Object.fromEntries(Object.entries(kody).map(([pole, kod]) => [sciezka('dane', pole), kod]))) ?? poprawne();
      }
      case 'dane-zam': {
        if (!czyObiekt(tresc.dane)) return bladPola('dane', '0006');
        const kody = walidujDaneZam(formularzZam(tresc.dane));
        return odpowiedzBledowPol(Object.fromEntries(Object.entries(kody).map(([pole, kod]) => [sciezka('dane', pole), kod]))) ?? poprawne();
      }
    }
    return bladPola('rodzaj', '0006');
  });
}
