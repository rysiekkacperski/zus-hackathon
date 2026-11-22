// Rodzaj umowy o pracę i podmioty wsparcia (kontrakt, sekcja 6.5). Właściciel: u22 (Ryzyka, szczególna ochrona i podmioty wsparcia).
import {
  podmiotZFormularza,
  ustalPrzedluzenieUmowy,
  walidujPodmiot,
  POLA_PODMIOTU,
  type FormularzPodmiotu,
} from '@/domena/przewodnik/ryzyka';
import type {
  DaneRodzica,
  KodKomunikatu,
  KontekstOperacji,
  PodmiotWsparcia,
  RodzajUmowyOPrace,
  RodzicWRodzinie,
  StanRodziny,
  WynikOperacji,
} from '@/domena/typy';
import { zapiszZmianeKatalogu, zaplanujWysylkeKatalogu } from '@/dane/magazyn/katalog-serwer';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajKatalog,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';

/** Dane rodzica z rodzajem umowy ze źródłem odpowiedź rodzica i wynikiem reguły przedłużenia do dnia porodu. */
function zRodzajemUmowy<R extends Pick<DaneRodzica, 'zmianaZatrudnienia' | 'rodzajUmowy'>>(
  dane: R,
  rodzaj: RodzajUmowyOPrace,
  rodzina: StanRodziny,
): R {
  const zmiana = dane.zmianaZatrudnienia;
  const ptp = rodzina.daneCiazy?.przewidywanyTerminPorodu;
  const nowaZmiana =
    zmiana?.rodzaj.wartosc === 'ustanie' && zmiana.data !== undefined && zmiana.przyczyna !== undefined && ptp !== undefined
      ? {
          ...zmiana,
          umowaPrzedluzonaDoPorodu: ustalPrzedluzenieUmowy(ptp, zmiana.data.wartosc, zmiana.przyczyna.wartosc, rodzaj)
            .przedluzonaDoPorodu,
        }
      : zmiana;
  return {
    ...dane,
    rodzajUmowy: { wartosc: rodzaj, zrodlo: 'odpowiedz-rodzica' },
    ...(nowaZmiana === undefined ? {} : { zmianaZatrudnienia: nowaZmiana }),
  };
}

/**
 * Zapis rodzaju umowy o pracę rodzica w Danych rodziny ze źródłem odpowiedź rodzica i ponowne wyliczenie planu
 * rodziny. Brak wyboru daje 0006, nieudany zapis 0003.
 */
export function zapiszRodzajUmowy(
  rodzic: RodzicWRodzinie,
  rodzaj: RodzajUmowyOPrace | null,
  ctx: KontekstOperacji,
): WynikOperacji {
  if (rodzaj === null) return { ok: false, kod: '0006', bledyPol: { rodzajUmowy: '0006' } };
  return wykonajOperacjeZWynikiem<void>(() => {
    const zalogowany = odczytajZalogowanego();
    const rodzina = rodzinaKonta(zalogowany?.stanKonta.konto ?? null);
    if (rodzina === null) return { ok: false, kod: '0003' };
    zmienStanRodziny(rodzina.idRodziny, (s) => ({
      ...s,
      daneRodziny: {
        ...s.daneRodziny,
        ...(rodzic === 'matka'
          ? { matka: zRodzajemUmowy(s.daneRodziny.matka, rodzaj, s) }
          : { drugiRodzic: zRodzajemUmowy(s.daneRodziny.drugiRodzic, rodzaj, s) }),
        zapisano: ctx.teraz,
      },
    }));
    return przeliczRodzine(rodzina.idRodziny, ctx);
  });
}

function kolejnyIdentyfikator(podmioty: readonly PodmiotWsparcia[]): { id: string; kolejnosc: number } {
  const kolejnosc = podmioty.reduce((maks, p) => Math.max(maks, p.kolejnosc), 0) + 1;
  let id = `podmiot-${kolejnosc}`;
  for (let n = kolejnosc; podmioty.some((p) => p.id === id); n += 1) id = `podmiot-${n + 1}`;
  return { id, kolejnosc };
}

/**
 * Nowy albo zmieniony podmiot wsparcia w edycjach katalogu (zwiększa edycjeKatalogu.wersja). Zapisuje wyłącznie konto
 * z rolą Administrator (0047); błędy pól zwraca w `bledyPol`, nieudany zapis daje 0003.
 */
export function zapiszPodmiotWsparcia(dane: FormularzPodmiotu, ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  const zalogowany = odczytajZalogowanego();
  if (zalogowany?.stanKonta.konto.rola !== 'administrator') return { ok: false, kod: '0047' };

  const katalog = odczytajKatalog();
  const bledy = walidujPodmiot(dane, katalog);
  const pierwszy = POLA_PODMIOTU.find((p) => bledy[p] !== undefined);
  if (pierwszy !== undefined) {
    return { ok: false, kod: bledy[pierwszy] as KodKomunikatu, bledyPol: bledy as Record<string, KodKomunikatu> };
  }

  const istniejacy = dane.id === undefined ? undefined : katalog.podmiotyWsparcia.find((p) => p.id === dane.id);
  if (dane.id !== undefined && istniejacy === undefined) return { ok: false, kod: '0003' };

  // Zmiana trafia do kopii lokalnej i do kolejki wspólnego katalogu (usługa /api/katalog, dane/magazyn/katalog-serwer.ts).
  const wynik = wykonajOperacjeZWynikiem<void>(() => {
    if (istniejacy === undefined) {
      const { id, kolejnosc } = kolejnyIdentyfikator(katalog.podmiotyWsparcia);
      zapiszZmianeKatalogu({ rodzaj: 'podmiot', podmiot: podmiotZFormularza(dane, id, kolejnosc), nowy: true });
    } else {
      const podmiot = podmiotZFormularza(dane, istniejacy.id, istniejacy.kolejnosc);
      zapiszZmianeKatalogu({ rodzaj: 'podmiot', podmiot, nowy: false });
    }
    return { ok: true, wartosc: undefined };
  });
  if (wynik.ok) zaplanujWysylkeKatalogu();
  return wynik;
}
