// Przeniesienie stanu gościa do konta przy zalogowaniu (tryb gościa). Właściciel: infrastruktura magazynu.
// Gość korzysta z kalkulatora zasiłku i przykładowych spraw bez logowania (dane/magazyn/gosc.ts). Logowanie w tej
// karcie przenosi do sesji konta przykładową sprawę z dokumentami i ostatni scenariusz kalkulatora, a sesję gościa
// usuwa. Pliki gościa w IndexedDB przechodzą do konta i sesji konta po zatwierdzeniu logowania.
import type {
  IdRodziny,
  KontekstOperacji,
  Pesel,
  ScenariuszKalkulatora,
  SprawaPrzykladowa,
  StanKonta,
  StanSesji,
  WynikiKalkulacji,
  WynikOperacji,
} from '@/domena/typy';
import { odczytajStanGoscia, usunSesjeGoscia, type StanGoscia } from '@/dane/magazyn/gosc';
import { KLUCZ_PRZENIESIENIE_GOSCIA, kluczDanychSesji, wlascicielGoscia } from '@/dane/magazyn/klucze';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { przeniesPlikiSesji, usunPlikiSesji } from '@/dane/magazyn/pliki';
import { zapiszSystemowe } from '@/dane/magazyn/rdzen';
import { rodzinaKonta, wykonajOperacje, zmienStanKonta, zmienStanRodziny } from '@/dane/magazyn/stan';
import { stanSesjiPoczatkowy } from '@/dane/magazyn/stan-poczatkowy';
import { zapewnijWlasciciela, type PrzeniesienieGoscia, type WlascicielDanych } from '@/dane/magazyn/wlasciciel';

export { odczytajStanGoscia } from '@/dane/magazyn/gosc';

/** Skutki przeniesienia do wykonania po zatwierdzeniu transakcji logowania (posprzatajPoPrzeniesieniuGoscia). */
export interface SkutkiPrzeniesieniaGoscia {
  idSesjiGoscia: string;
  pliki: 'przenies' | 'usun';
  pesel: Pesel;
  idSesji: string;
  doPrzeliczenia: IdRodziny | null;
}

function nastepnyNumer(wyniki: WynikiKalkulacji): number {
  const najwiekszy = wyniki.scenariusze.reduce((m, s) => Math.max(m, s.numer), 0);
  return Math.max(wyniki.nastepnyNumer, najwiekszy + 1, 1);
}

function ostatniScenariusz(wyniki: WynikiKalkulacji | null): ScenariuszKalkulatora | undefined {
  return wyniki?.scenariusze.reduce<ScenariuszKalkulatora | undefined>(
    (ostatni, s) => (ostatni === undefined || s.numer > ostatni.numer ? s : ostatni),
    undefined,
  );
}

function dopiszPrzeniesiony(
  wyniki: WynikiKalkulacji,
  scenariusz: ScenariuszKalkulatora,
  pesel: Pesel,
  zakres: ScenariuszKalkulatora['zakres'],
): WynikiKalkulacji {
  const numer = nastepnyNumer(wyniki);
  return {
    ...wyniki,
    scenariusze: [...wyniki.scenariusze, { ...scenariusz, numer, konto: pesel, zakres, wybranyWPlanie: false }],
    nastepnyNumer: numer + 1,
  };
}

function sprawaKonta(sprawa: SprawaPrzykladowa, pesel: Pesel): SprawaPrzykladowa {
  return { ...sprawa, konto: pesel, dokumenty: sprawa.dokumenty.map((d) => ({ ...d, konto: pesel })) };
}

/**
 * Przenosi stan gościa do nowej sesji konta w bieżącej transakcji logowania: przykładową sprawę z dokumentami,
 * powiązaniami danych zastępczych i plikami sesji do danych sesji konta, a ostatni scenariusz kalkulatora do Wyników
 * kalkulacji rodziny (Rodzic i Drugi rodzic z widoczną rodziną) albo konta. Usuwa sesję gościa i zapisuje znacznik
 * przeniesienia (WlascicielDanych.zGoscia). Konto Administrator ZUS niczego nie przejmuje. Zapisy są systemowe,
 * więc logowanie działa także przy symulacji błędu zapisu.
 */
export function przeniesStanGosciaWTransakcji(
  gosc: StanGoscia,
  cel: { stanKonta: StanKonta; idSesji: string },
): SkutkiPrzeniesieniaGoscia {
  const { konto } = cel.stanKonta;
  const pesel = konto.pesel;
  const skutki: SkutkiPrzeniesieniaGoscia = {
    idSesjiGoscia: gosc.sesja.idSesjiGoscia,
    pliki: 'usun',
    pesel,
    idSesji: cel.idSesji,
    doPrzeliczenia: null,
  };
  usunSesjeGoscia();
  if (konto.rola === 'administrator') return skutki;
  skutki.pliki = 'przenies';

  const sprawa = gosc.stanSesji?.przykladowaSprawa;
  if (gosc.stanSesji !== null && sprawa !== undefined) {
    const stanSesji: StanSesji = {
      ...stanSesjiPoczatkowy(),
      przykladowaSprawa: sprawaKonta(sprawa, pesel),
      powiazaniaZastepcze: gosc.stanSesji.powiazaniaZastepcze,
      plikiSesji: gosc.stanSesji.plikiSesji,
    };
    zapiszSystemowe(kluczDanychSesji(cel.idSesji), stanSesji);
  }

  const scenariusz = ostatniScenariusz(gosc.wynikiKalkulacji);
  if (scenariusz !== undefined) {
    const rodzina = konto.rola === 'rodzic' || konto.rola === 'drugi-rodzic' ? rodzinaKonta(konto) : null;
    if (rodzina !== null) {
      zmienStanRodziny(
        rodzina.idRodziny,
        (stan) => ({ ...stan, wynikiKalkulacji: dopiszPrzeniesiony(stan.wynikiKalkulacji, scenariusz, pesel, 'rodzina') }),
        'systemowe',
      );
      skutki.doPrzeliczenia = rodzina.idRodziny;
    } else {
      zmienStanKonta(
        pesel,
        (stan) => ({ ...stan, wynikiKalkulacji: dopiszPrzeniesiony(stan.wynikiKalkulacji, scenariusz, pesel, 'konto') }),
        'systemowe',
      );
    }
  }

  const przeniesienie: PrzeniesienieGoscia = { zGoscia: wlascicielGoscia(gosc.sesja.idSesjiGoscia), idSesji: cel.idSesji };
  zapiszSystemowe(KLUCZ_PRZENIESIENIE_GOSCIA, przeniesienie, 'sessionStorage');
  return skutki;
}

/**
 * Sprzątanie po zatwierdzonym przeniesieniu: pliki gościa przechodzą do konta i sesji konta (Administrator ZUS:
 * usunięcie), a rodzina z przeniesionym scenariuszem się przelicza.
 */
export function posprzatajPoPrzeniesieniuGoscia(skutki: SkutkiPrzeniesieniaGoscia, ctx: KontekstOperacji): void {
  if (skutki.pliki === 'przenies') {
    void przeniesPlikiSesji(skutki.idSesjiGoscia, { wlasciciel: skutki.pesel, idSesji: skutki.idSesji });
  } else {
    void usunPlikiSesji(skutki.idSesjiGoscia);
  }
  // Błąd zapisu przeliczenia (symulacja) nie cofa logowania; rodzina przeliczy się przy synchronizacji.
  if (skutki.doPrzeliczenia !== null) przeliczRodzine(skutki.doPrzeliczenia, ctx);
}

/**
 * Właściciel danych do zapisu: zalogowane konto albo gość. Gość bez sesji gościa dostaje nową sesję, więc widok
 * dostaje stały identyfikator (np. dla stanu roboczego kalkulatora) przed pierwszym zapisem. Wywołuj w obsłudze zdarzenia.
 */
export function zapewnijWlascicielaDanych(ctx: KontekstOperacji): WynikOperacji<WlascicielDanych> {
  return wykonajOperacje(() => zapewnijWlasciciela(ctx));
}

/** Zakończenie sesji gościa tej karty bez logowania: usuwa stan gościa i jego pliki. */
export function zakonczSesjeGoscia(): void {
  const gosc = odczytajStanGoscia();
  if (gosc === null) return;
  const wynik = wykonajOperacje(() => usunSesjeGoscia());
  if (wynik.ok) void usunPlikiSesji(gosc.sesja.idSesjiGoscia);
}
