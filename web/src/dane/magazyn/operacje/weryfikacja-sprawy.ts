// Weryfikacja przykładowej sprawy i zapis wyniku kalkulacji (kontrakt, sekcja 6.5).
// Właściciel: u21 (Przykładowe sprawy: weryfikacja i sprawdzenie wyliczeń).
// Przykładowa sprawa żyje w danych sesji (StanSesji.przykladowaSprawa); wynik kalkulatora trafia do Wyników
// kalkulacji konta, więc profil rodziny, plan rodziny i terminy pozostają bez zmian. Gość (tryb gościa) ma sprawę
// w stanie sesji gościa, a wynik kalkulatora w wynikach kalkulacji gościa (wlasciciel.ts).
import { roznicaDni } from '@/domena/daty';
import { komunikatyPorownaniaWeryfikacji, porownajWeryfikacje } from '@/domena/przykladowe-sprawy/porownanie';
import { walidujDaneSprawy } from '@/domena/przykladowe-sprawy/walidacja';
import {
  brakiDoWeryfikacji,
  daneWejscioweZeSprawy,
  ustalPodstaweZeSprawy,
  weryfikujUbezpieczenieChorobowe,
} from '@/domena/przykladowe-sprawy/weryfikacja';
import type {
  KodKomunikatu,
  KontekstOperacji,
  ParametryScenariusza,
  RodzicWRodzinie,
  ScenariuszKalkulatora,
  SprawaPrzykladowa,
  WynikOperacji,
  WynikScenariusza,
} from '@/domena/typy';
import { odczytajKatalog, wykonajOperacjeZWynikiem } from '@/dane/magazyn/stan';
import {
  odczytajStanSesjiDla,
  odczytajWlasciciela,
  odczytajWynikiKalkulacjiKonta,
  zmienStanSesjiDla,
  zmienWynikiKalkulacjiKonta,
  type WlascicielDanych,
} from '@/dane/magazyn/wlasciciel';

function biezacaSprawa(): { wlasciciel: WlascicielDanych; sprawa: SprawaPrzykladowa } | null {
  const wlasciciel = odczytajWlasciciela();
  if (wlasciciel === null) return null;
  const sprawa = odczytajStanSesjiDla(wlasciciel)?.przykladowaSprawa;
  if (sprawa === undefined) return null;
  return { wlasciciel, sprawa };
}

/** Walidacja danych sprawy i zapis wyniku weryfikacji. */
export function zatwierdzDaneSprawy(ctx: KontekstOperacji): WynikOperacji {
  const biezaca = biezacaSprawa();
  if (biezaca === null) return { ok: false, kod: '0109' };
  const { sprawa, wlasciciel } = biezaca;

  // Kolejność kontroli: format i wartości pól, potem kompletność danych do weryfikacji.
  const bledyPol: Record<string, KodKomunikatu> = {};
  for (const [pole, kod] of Object.entries(walidujDaneSprawy(sprawa.dane))) if (kod !== undefined) bledyPol[pole] = kod;
  const pierwszyBlad = Object.values(bledyPol)[0];
  if (pierwszyBlad !== undefined) return { ok: false, kod: pierwszyBlad, bledyPol };
  const braki = brakiDoWeryfikacji(sprawa.dane);
  if (Object.keys(braki).length > 0) return { ok: false, kod: '0109', bledyPol: braki };

  const wynik = weryfikujUbezpieczenieChorobowe(sprawa.dane, odczytajKatalog(), sprawa.dokumenty);
  const porownanie = porownajWeryfikacje(wynik, sprawa.rozstrzygniecie);
  const komunikaty = [...wynik.komunikaty, ...komunikatyPorownaniaWeryfikacji(porownanie)];
  return wykonajOperacjeZWynikiem(() => {
    const zmieniony = zmienStanSesjiDla(wlasciciel, (stan) =>
      stan.przykladowaSprawa === undefined
        ? stan
        : { ...stan, przykladowaSprawa: { ...stan.przykladowaSprawa, weryfikacja: { ...wynik, porownanie, komunikaty, czas: ctx.teraz } } },
    );
    return zmieniony === null ? { ok: false, kod: '0003' } : { ok: true, wartosc: undefined };
  });
}

function parametryZeSprawy(sprawa: SprawaPrzykladowa, wynik: WynikScenariusza): ParametryScenariusza {
  const macierzynski = wynik.okresy.find((o) => o.rodzaj === 'macierzynski' || o.rodzaj === 'przejety-macierzynski');
  const porod = sprawa.dane.zdarzenie.dataPorodu.wartosc ?? sprawa.dane.zdarzenie.przewidywanyTermin.wartosc;
  const dniPrzed = macierzynski !== undefined && porod !== null && macierzynski.od < porod
    ? Math.ceil(roznicaDni(macierzynski.od, porod) / 7)
    : 0;
  return {
    wariant: wynik.okresy.some((o) => o.stawka === 81.5) ? '81-5' : '100-70',
    tygodniePrzedPorodem: Math.min(6, dniPrzed),
    czesciRodzicielskiego: wynik.okresy
      .filter((o) => o.rodzaj === 'rodzicielski')
      .map((o) => ({ rodzic: o.rodzic, od: o.od, tygodnie: Math.round(o.dni / 7) })),
    ojcowski: { wymiar: 'brak', czesci: [] },
    datyPowrotu: {},
  };
}

/** Zapis wyniku kalkulatora wyliczonego w trybie przykładowej sprawy. */
export function zapiszWynikKalkulacjiSprawy(wynik: WynikScenariusza, ctx: KontekstOperacji): WynikOperacji {
  const biezaca = biezacaSprawa();
  if (biezaca === null) return { ok: false, kod: '0003' };
  const { sprawa, wlasciciel } = biezaca;
  const pesel = wlasciciel.id;
  const podstawa = ustalPodstaweZeSprawy(sprawa.dane, odczytajKatalog());
  if ('kod' in podstawa) return { ok: false, kod: podstawa.kod };
  const rodzic: RodzicWRodzinie = sprawa.dane.ubezpieczony.rola.wartosc === 'ojciec-przejmujacy' ? 'drugi-rodzic' : 'matka';
  const daneWejsciowe = daneWejscioweZeSprawy(sprawa.dane);
  const parametry = parametryZeSprawy(sprawa, wynik);

  const wynikiKonta = odczytajWynikiKalkulacjiKonta(wlasciciel);
  if (wynikiKonta === null) return { ok: false, kod: '0003' };
  const podstawy = { [rodzic]: podstawa };
  const poprzedni = wynikiKonta.scenariusze.find((s) => s.przykladowaSprawa && s.konto === pesel);
  if (
    poprzedni !== undefined &&
    JSON.stringify([poprzedni.wynik, poprzedni.podstawy, poprzedni.daneWejsciowe]) === JSON.stringify([wynik, podstawy, daneWejsciowe])
  ) {
    return { ok: true, wartosc: undefined };
  }

  return wykonajOperacjeZWynikiem(() => {
    const zmienione = zmienWynikiKalkulacjiKonta(wlasciciel, (wyniki) => {
      const dotychczasowy = wyniki.scenariusze.find((s) => s.przykladowaSprawa && s.konto === pesel);
      const scenariusz: ScenariuszKalkulatora = {
        numer: dotychczasowy?.numer ?? wyniki.nastepnyNumer,
        zapisano: ctx.dzis,
        konto: pesel,
        zakres: 'konto',
        przykladowaSprawa: true,
        wybranyWPlanie: false,
        daneWejsciowe,
        podstawy,
        parametry,
        wynik,
      };
      return {
        ...wyniki,
        scenariusze: [...wyniki.scenariusze.filter((s) => s !== dotychczasowy), scenariusz],
        nastepnyNumer: dotychczasowy === undefined ? wyniki.nastepnyNumer + 1 : wyniki.nastepnyNumer,
      };
    });
    return zmienione === null ? { ok: false, kod: '0003' } : { ok: true, wartosc: undefined };
  });
}
