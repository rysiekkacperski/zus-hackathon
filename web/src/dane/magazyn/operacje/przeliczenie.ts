// Przeliczenie rodziny (kontrakt, sekcje 6.5 i 6.7). Właściciel: u00.
// przeliczRodzine składa WejsciePlanu, woła przeliczStanRodziny (wyliczPlan → wyliczTerminy →
// zaplanujPrzypomnienia) i zapisuje plan, kalendarz, przypomnienia obu rodziców i znacznik `wyliczono`.
// Przed wyliczeniem leniwie usuwa dane po terminie 30 dni (ukryta rodzina, dane ciąży po wycofaniu zgody).
import { czyMaZgode } from '@/domena/konto';
import { przeliczStanRodziny, type WejsciePlanu } from '@/domena/przeliczenie';
import type {
  IdRodziny,
  KontekstOperacji,
  Pesel,
  Powiadomienie,
  StanKonta,
  StanRodziny,
  Ustawienia,
  WynikOperacji,
  ZnacznikCzasu,
} from '@/domena/typy';
import {
  czyKontoMaDostep,
  daneZusDrugiegoRodzica,
  odczytajKatalog,
  odczytajParametry,
  odczytajStanKonta,
  odczytajStanRodziny,
  odczytajZalogowanego,
  osobyRodziny,
  usunStanRodziny,
  wykonajOperacje,
  zapiszStanRodziny,
  zmienGlobalne,
  zmienStanKonta,
} from '@/dane/magazyn/stan';

const RODZAJE_PRZYPOMNIEN: readonly Powiadomienie['rodzaj'][] = [
  'przypomnienie-przed-terminem',
  'przypomnienie-w-dniu-terminu',
];

/** Przypomnienie o terminie sprawy rodziny, którym zarządza planowanie przypomnień (u18). */
export function czyPrzypomnienieRodziny(p: Powiadomienie, idRodziny: IdRodziny): boolean {
  return RODZAJE_PRZYPOMNIEN.includes(p.rodzaj) && p.idRodziny === idRodziny;
}

/** Konta przewodnika związane z rodziną: konto zakładające i wszystkie wpisy dostępu (także odłączone). */
function peseleKontRodziny(stan: StanRodziny): Pesel[] {
  return [...new Set([stan.idRodziny, ...stan.daneRodziny.dostepKont.map((d) => d.pesel)])];
}

function czyMinalTermin(termin: string | undefined, dzis: string): boolean {
  return termin !== undefined && dzis >= termin;
}

/**
 * Usunięcie ukrytej rodziny po terminie: dane rodziny, przypomnienia i powiązania kont. Konto powiązane
 * z usuwaną rodziną zostaje bez rodziny z rolą Nowy użytkownik (rola Rodzic i Drugi rodzic wymagają rodziny).
 */
function usunRodzinePoTerminie(stan: StanRodziny): void {
  for (const pesel of peseleKontRodziny(stan)) {
    zmienStanKonta(pesel, (s) => {
      const { terminUsunieciaDanychRodziny, ...konto } = s.konto;
      void terminUsunieciaDanychRodziny;
      const powiazane = konto.idRodziny === stan.idRodziny;
      const rolaBezRodziny = konto.rola === 'rodzic' || konto.rola === 'drugi-rodzic' ? 'nowy-uzytkownik' : konto.rola;
      return {
        ...s,
        konto: powiazane ? { ...konto, idRodziny: null, rola: rolaBezRodziny } : konto,
        powiadomienia: s.powiadomienia.filter((p) => !czyPrzypomnienieRodziny(p, stan.idRodziny)),
      };
    });
  }
  zmienGlobalne(
    (g) => ({
      ...g,
      zaproszenia: Object.fromEntries(Object.entries(g.zaproszenia).filter(([, id]) => id !== stan.idRodziny)),
    }),
    'domenowe',
  );
  usunStanRodziny(stan.idRodziny);
}

/**
 * Usunięcie Danych ciąży i dziecka po terminie 30 dni od wycofania zgody wraz z sytuacją rodzica
 * zapisywaną wyłącznie przy zgodzie (oczekiwanie, narodziny).
 */
function bezDanychCiazyPoTerminie(stan: StanRodziny, dzis: string): StanRodziny {
  const wylaczone = stan.daneCiazy?.wylaczoneZUzycia;
  if (!wylaczone || !czyMinalTermin(wylaczone.terminUsuniecia, dzis)) return stan;
  const sytuacja = stan.daneRodziny.sytuacja;
  const sytuacjaZeZgody = sytuacja?.wartosc === 'oczekiwanie' || sytuacja?.wartosc === 'narodziny';
  for (const pesel of peseleKontRodziny(stan)) {
    zmienStanKonta(pesel, (s) => {
      if (!czyMinalTermin(s.konto.terminUsunieciaDanychZdrowotnych, dzis)) return s;
      const { terminUsunieciaDanychZdrowotnych, ...konto } = s.konto;
      void terminUsunieciaDanychZdrowotnych;
      return { ...s, konto };
    });
  }
  return {
    ...stan,
    daneCiazy: null,
    daneRodziny: sytuacjaZeZgody ? { ...stan.daneRodziny, sytuacja: null } : stan.daneRodziny,
  };
}

/** Daty odczytu kopii Danych z konta ZUS rodziców, porównywane przez SynchronizacjaRodziny. */
function odczytyZusRodzicow(konta: readonly StanKonta[]): Record<Pesel, ZnacznikCzasu> {
  const odczyty: Record<Pesel, ZnacznikCzasu> = {};
  for (const s of konta) {
    if (s.kopiaDanychZus) odczyty[s.konto.pesel] = s.kopiaDanychZus.odczytano;
  }
  return odczyty;
}

function kontaRodzicow(stan: StanRodziny): { matka: StanKonta | null; drugiRodzic: StanKonta | null; rodzic: StanKonta | null } {
  const osoby = osobyRodziny(stan.daneRodziny);
  return {
    matka: osoby.peselMatki ? odczytajStanKonta(osoby.peselMatki) : null,
    drugiRodzic: osoby.peselDrugiegoRodzica ? odczytajStanKonta(osoby.peselDrugiegoRodzica) : null,
    rodzic: odczytajStanKonta(osoby.peselRodzica),
  };
}

function rozneOdczyty(a: Record<Pesel, ZnacznikCzasu>, b: Record<Pesel, ZnacznikCzasu>): boolean {
  const kluczeA = Object.keys(a);
  if (kluczeA.length !== Object.keys(b).length) return true;
  return kluczeA.some((pesel) => a[pesel] !== b[pesel]);
}

function przeliczWTransakcji(idRodziny: IdRodziny, ctx: KontekstOperacji): void {
  const zapisany = odczytajStanRodziny(idRodziny);
  if (zapisany === null) return;
  if (zapisany.ukryte) {
    // Ukryta rodzina (usunięcie danych rodziny) nie bierze udziału w wyliczeniach do chwili usunięcia.
    if (czyMinalTermin(zapisany.ukryte.terminUsuniecia, ctx.dzis)) usunRodzinePoTerminie(zapisany);
    return;
  }
  const stan = bezDanychCiazyPoTerminie(zapisany, ctx.dzis);
  const { matka, drugiRodzic, rodzic } = kontaRodzicow(stan);
  const katalog = odczytajKatalog();
  const parametry = odczytajParametry();

  const wejscie: WejsciePlanu = {
    daneRodziny: stan.daneRodziny,
    daneCiazy: stan.daneCiazy,
    // Dane rodziny zapisuje konto zakładające, więc o użyciu danych dotyczących zdrowia decyduje jego zgoda.
    zgoda: rodzic !== null && czyMaZgode(rodzic.konto.decyzjeOZgodzie),
    katalog,
    daneZusMatki: matka?.kopiaDanychZus ?? null,
    daneZusDrugiegoRodzica: daneZusDrugiegoRodzica(stan, drugiRodzic, matka),
    wnioski: stan.wnioski,
    wynikiKalkulacji: stan.wynikiKalkulacji,
    poprzedniPlan: stan.plan,
    dzis: ctx.dzis,
    teraz: ctx.teraz,
    parametry: {
      progPodwyzszeniaPodstawyProcent: parametry.progPodwyzszeniaPodstawyProcent,
      progOstrzezeniaOkresuZasilkowegoDni: parametry.progOstrzezeniaOkresuZasilkowegoDni,
    },
  };

  const konta = [matka, drugiRodzic].filter((s): s is StanKonta => s !== null);
  const ustawienia: Record<Pesel, Ustawienia | null> = {};
  const poprzednie: Record<Pesel, Powiadomienie[]> = {};
  for (const s of konta) {
    ustawienia[s.konto.pesel] = s.ustawienia;
    poprzednie[s.konto.pesel] = s.powiadomienia.filter((p) => czyPrzypomnienieRodziny(p, idRodziny));
  }

  const wynik = przeliczStanRodziny(wejscie, ustawienia, poprzednie);

  zapiszStanRodziny({
    ...stan,
    plan: wynik.plan,
    kalendarz: wynik.kalendarz,
    wyliczono: { dzis: ctx.dzis, katalogWersja: katalog.wersja, odczytyZus: odczytyZusRodzicow(konta) },
  });

  // Wynik planowania dla konta zastępuje przypomnienia tej rodziny na koncie; konto bez wpisu w wyniku
  // zachowuje dotychczasowe przypomnienia, a pozostałe powiadomienia konta zostają bez zmian.
  for (const s of konta) {
    const nowe = wynik.przypomnienia[s.konto.pesel];
    if (nowe === undefined) continue;
    zmienStanKonta(s.konto.pesel, (biezacy) => ({
      ...biezacy,
      powiadomienia: [...biezacy.powiadomienia.filter((p) => !czyPrzypomnienieRodziny(p, idRodziny)), ...nowe],
    }));
  }
}

/**
 * Przelicza plan, kalendarz i przypomnienia rodziny. Wywołana wewnątrz innej operacji dołącza do jej
 * transakcji; samodzielnie zwraca 0003 przy błędzie zapisu bez zmiany stanu.
 */
export function przeliczRodzine(idRodziny: IdRodziny, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacje(() => przeliczWTransakcji(idRodziny, ctx));
}

/**
 * Czy rodzina wymaga przeliczenia (sekcja 6.7): zmiana dnia, wersji katalogu albo daty odczytu kopii ZUS
 * któregoś rodzica, brak wyliczenia albo upływ terminu usunięcia danych.
 */
export function czyRodzinaWymagaPrzeliczenia(stan: StanRodziny, ctx: KontekstOperacji): boolean {
  if (stan.ukryte) return czyMinalTermin(stan.ukryte.terminUsuniecia, ctx.dzis);
  if (czyMinalTermin(stan.daneCiazy?.wylaczoneZUzycia?.terminUsuniecia, ctx.dzis)) return true;
  const wyliczono = stan.wyliczono;
  if (!wyliczono || stan.plan === null || stan.kalendarz === null) return true;
  if (wyliczono.dzis !== ctx.dzis) return true;
  if (wyliczono.katalogWersja !== odczytajKatalog().wersja) return true;
  const { matka, drugiRodzic } = kontaRodzicow(stan);
  const konta = [matka, drugiRodzic].filter((s): s is StanKonta => s !== null);
  return rozneOdczyty(odczytyZusRodzicow(konta), wyliczono.odczytyZus);
}

/**
 * Synchronizacja rodziny zalogowanego konta dla SynchronizacjaRodziny w ramie: przelicza rodzinę,
 * gdy wymaga tego czyRodzinaWymagaPrzeliczenia, i leniwie usuwa dane po terminie 30 dni.
 */
export function synchronizujRodzine(ctx: KontekstOperacji): WynikOperacji<{ przeliczono: boolean }> {
  const konto = odczytajZalogowanego()?.stanKonta.konto ?? null;
  const idRodziny = konto?.idRodziny ?? null;
  if (konto === null || idRodziny === null) return { ok: true, wartosc: { przeliczono: false } };
  const stan = odczytajStanRodziny(idRodziny);
  // Izolacja (sekcja 6.2): konto przelicza wyłącznie rodzinę, do której ma aktywny dostęp.
  if (stan === null || !czyKontoMaDostep(stan.daneRodziny, konto.pesel) || !czyRodzinaWymagaPrzeliczenia(stan, ctx)) {
    return { ok: true, wartosc: { przeliczono: false } };
  }
  const wynik = przeliczRodzine(idRodziny, ctx);
  return wynik.ok ? { ok: true, wartosc: { przeliczono: true } } : wynik;
}
