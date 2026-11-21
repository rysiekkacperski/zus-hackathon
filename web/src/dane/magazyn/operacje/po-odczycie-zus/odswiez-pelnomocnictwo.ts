// Akcja po odczycie Danych z konta ZUS `odswiezPelnomocnictwo` (kontrakt, sekcja 6.5).
// Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL).
// Przy każdym otwarciu przewodnika przez konto z rolą Rodzic, gdy drugi rodzic nie dołączył, akcja sprawdza
// pełnomocnictwo PEL: obowiązujące daje ponowny odczyt z nową datą, a wygasłe albo odwołane usuwa dane ze
// źródłem pełnomocnictwo PEL, przywraca odpowiedzi rodzica i ustawia komunikat 0220 albo 0221 (R-PEL-ODSWIEZENIE).
// Plik zawiera też odczyt danych mocodawcy wspólny z operacjami w operacje/drugi-rodzic.ts.
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import type { AkcjaPoOdczycieDanychZus } from '@/dane/magazyn/operacje/po-odczycie-zus/typ';
import {
  czySymulacja,
  odczytajStanKonta,
  odczytajStanRodziny,
  odczytajStanZus,
  osobyRodziny,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';
import { formatujDate } from '@/domena/daty';
import {
  daneZPelnomocnictwa,
  decyzjaOdswiezenia,
  przywrocOdpowiedziRodzica,
  wybierzPelnomocnictwo,
  zasilkiZOstatnichMiesiecy,
  zastosujDaneZPelnomocnictwa,
} from '@/domena/rodzina/pelnomocnictwo';
import { czyProfilMaDrugiegoRodzica, dolaczonyDrugiRodzic } from '@/domena/rodzina/zaproszenia';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneZKontaZus,
  DrugiRodzic,
  IdRodziny,
  KontekstOperacji,
  PelnomocnictwoPel,
  Pesel,
  StanRodziny,
  StanSymulowanegoZus,
} from '@/domena/typy';

/** Pełnomocnictwa PEL widoczne w symulowanym ZUS na koncie `pesel`, z nadpisaniami scenariuszy. */
export function pelnomocnictwaKonta(pesel: Pesel, stanZus: StanSymulowanegoZus | null): PelnomocnictwoPel[] {
  return zrodloweDaneKonta(pesel, stanZus)?.pelnomocnictwa ?? [];
}

/** Pełnomocnictwo PEL drugiego rodzica udzielone kontu Rodzica, według bieżącego stanu symulowanego ZUS. */
export function pelnomocnictwoDrugiegoRodzica(peselRodzica: Pesel, drugi: DrugiRodzic, dzis: string): PelnomocnictwoPel | null {
  return wybierzPelnomocnictwo(
    pelnomocnictwaKonta(peselRodzica, odczytajStanZus(peselRodzica)),
    { peselPelnomocnika: peselRodzica, ...(drugi.pesel ? { peselMocodawcy: drugi.pesel } : {}) },
    dzis,
  );
}

/**
 * Odczyt danych mocodawcy z jego konta ZUS na podstawie pełnomocnictwa: wyłącznie zakres R-PEL-ZAKRES
 * z datą odczytu `ctx.teraz`. Zwraca null, gdy symulowany ZUS nie ma danych konta.
 */
export function odczytajDaneMocodawcy(p: PelnomocnictwoPel, ctx: KontekstOperacji): DaneDrugiegoRodzicaZKonta | null {
  const zrodlo = zrodloweDaneKonta(p.mocodawca.pesel, odczytajStanZus(p.mocodawca.pesel), {
    imie: p.mocodawca.imie,
    nazwisko: p.mocodawca.nazwisko,
  });
  if (zrodlo === null) return null;
  const kopia: DaneZKontaZus = {
    odczytano: ctx.teraz,
    pesel: zrodlo.pesel,
    imie: zrodlo.imie,
    nazwisko: zrodlo.nazwisko,
    tytuly: zrodlo.tytuly,
    czlonkowieRodziny: [],
    zasilki: zasilkiZOstatnichMiesiecy(zrodlo.zasilki, ctx.dzis),
    swiadczeniaRodzinne: [],
    wnioski: [],
    zaswiadczeniaEzla: [],
    stanyRozliczen: [],
    zaswiadczeniaORozliczeniach: [],
    korespondencja: [],
    pelnomocnictwa: [],
  };
  return daneZPelnomocnictwa(kopia);
}

/** Zapis nowych danych drugiego rodzica w Danych rodziny. */
export function zapiszDrugiegoRodzica(idRodziny: IdRodziny, drugi: DrugiRodzic): StanRodziny | null {
  return zmienStanRodziny(idRodziny, (s) => ({ ...s, daneRodziny: { ...s.daneRodziny, drugiRodzic: drugi } }));
}

/** Rodzina, w której konto `pesel` ma rolę Rodzic, a drugi rodzic jest w profilu i nie dołączył do planu. */
export function rodzinaRodzicaBezDolaczonego(pesel: Pesel): StanRodziny | null {
  const stanKonta = odczytajStanKonta(pesel);
  if (stanKonta === null || stanKonta.konto.rola !== 'rodzic' || stanKonta.konto.idRodziny === null) return null;
  const rodzina = odczytajStanRodziny(stanKonta.konto.idRodziny);
  if (rodzina === null || rodzina.ukryte) return null;
  if (osobyRodziny(rodzina.daneRodziny).peselRodzica !== pesel) return null;
  if (dolaczonyDrugiRodzic(rodzina.daneRodziny) !== null) return null;
  return czyProfilMaDrugiegoRodzica(rodzina.daneRodziny) ? rodzina : null;
}

export const odswiezPelnomocnictwo: AkcjaPoOdczycieDanychZus = (pesel, ctx) => {
  const rodzina = rodzinaRodzicaBezDolaczonego(pesel);
  if (rodzina === null) return;
  const drugi = rodzina.daneRodziny.drugiRodzic;
  const p = pelnomocnictwoDrugiegoRodzica(pesel, drugi, ctx.dzis);
  const decyzja = decyzjaOdswiezenia(drugi, p, ctx.dzis, formatujDate);
  if (decyzja.rodzaj === 'bez-zmian') return;

  if (decyzja.rodzaj === 'odczytaj') {
    // Bez połączenia z kontem ZUS zostają dane z poprzedniego odczytu.
    if (p === null || czySymulacja('daneZusNiedostepne')) return;
    const dane = odczytajDaneMocodawcy(p, ctx);
    if (dane === null) return;
    wykonajOperacjeZWynikiem(() => {
      zapiszDrugiegoRodzica(rodzina.idRodziny, zastosujDaneZPelnomocnictwa(drugi, dane, p.mocodawca));
      return przeliczRodzine(rodzina.idRodziny, ctx);
    });
    return;
  }

  const wynik = wykonajOperacjeZWynikiem(() => {
    zapiszDrugiegoRodzica(rodzina.idRodziny, przywrocOdpowiedziRodzica(drugi));
    return przeliczRodzine(rodzina.idRodziny, ctx);
  });
  if (wynik.ok) ustawKomunikatPoPrzejsciu({ kod: decyzja.komunikat.kod, parametry: decyzja.komunikat.parametry });
};
