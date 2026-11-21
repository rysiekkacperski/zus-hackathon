// Operacje konta przewodnika (kontrakt, sekcje 3.5, 3.6 i 6.5; analiza 3.1.1, reguły R1–R5, R17, R20).
// Właściciel: u00. Logowanie, wylogowanie, zmiana roli, przywrócenie stanu początkowego konta,
// rejestr nowych kont demonstracyjnych, logowanie w toku i numery potwierdzeń.
import { stanZgody, wyznaczEkranStartowy, czySesjaWygasla } from '@/domena/konto';
import { kluczLicznikaPotwierdzen, numerPotwierdzenia, type PrefiksPotwierdzenia } from '@/domena/numery';
import type {
  DataISO,
  IdRodziny,
  KontekstOperacji,
  KontoDemo,
  LogowanieWToku,
  Pesel,
  Plec,
  Rola,
  Sesja,
  SposobZalogowania,
  StanKonta,
  StanRodziny,
  WynikOperacji,
} from '@/domena/typy';
import { bezpiecznyPowrot, dopasujTrase, sciezkaWidoku } from '@/komponenty/rama/trasy';
import { KLUCZ_LOGOWANIE, kluczDanychSesji, kluczOdczytano } from '@/dane/magazyn/klucze';
import { sprzatnijPoGosciach } from '@/dane/magazyn/gosc';
import { losowyUuid } from '@/dane/magazyn/losowanie';
import {
  odczytajStanGoscia,
  posprzatajPoPrzeniesieniuGoscia,
  przeniesStanGosciaWTransakcji,
  type SkutkiPrzeniesieniaGoscia,
} from '@/dane/magazyn/operacje/gosc';
import { czyPrzypomnienieRodziny, przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajIObsluzDaneZus,
  posprzatajPoSesji,
  zakonczSesjeWTransakcji,
  zakonczSesje,
} from '@/dane/magazyn/operacje/sesja';
import { usunPlikiWlasciciela } from '@/dane/magazyn/pliki';
import { odczytaj, usunSystemowe, zapiszSystemowe } from '@/dane/magazyn/rdzen';
import {
  kontoDemo,
  odczytajGlobalne,
  odczytajSesje,
  odczytajStanKonta,
  odczytajStanRodziny,
  osobyRodziny,
  usunStanKonta,
  usunStanRodziny,
  usunStanZus,
  wszystkieKontaDemo,
  wykonajOperacje,
  wykonajOperacjeZWynikiem,
  zajetePesele,
  zapiszSesje,
  zapiszStanKonta,
  zapiszStanRodziny,
  zmienGlobalne,
  zmienKonto,
  zmienStanKonta,
} from '@/dane/magazyn/stan';
import {
  kontoPrzewodnikaZKontaDemo,
  stanKontaPoczatkowy,
  stanSesjiPoczatkowy,
} from '@/dane/magazyn/stan-poczatkowy';

// --- Kierowanie ------------------------------------------------------------------------------

/** Ścieżka z mapy tras dostępna dla roli po zalogowaniu (parametr `powrot`, ekran sprzed wygaśnięcia). */
export function czySciezkaDozwolonaDlaRoli(rola: Rola): (sciezka: string) => boolean {
  return (sciezka) => {
    const bezpieczna = bezpiecznyPowrot(sciezka);
    if (bezpieczna === null) return false;
    const trasa = dopasujTrase(bezpieczna);
    return trasa !== null && trasa.dostep === 'zalogowany' && trasa.role.includes(rola);
  };
}

/** Ekran startowy konta według reguł kierowania z sekcji 3.6, jako ścieżka adresu. */
export function ekranStartowyKonta(stanKonta: StanKonta, powrot?: string): string {
  const konto = stanKonta.konto;
  const cel = wyznaczEkranStartowy({
    rola: konto.rola,
    stanZgody: stanZgody(konto.decyzjeOZgodzie),
    ekranSprzedWygasniecia: konto.ekranSprzedWygasniecia,
    powrot,
    czyPowrotDozwolony: czySciezkaDozwolonaDlaRoli(konto.rola),
    ostatniEkranSzkicu: stanKonta.szkicProfilu?.ostatniEkran,
  });
  return cel.rodzaj === 'sciezka' ? cel.sciezka : sciezkaWidoku(cel.idWidoku);
}

// --- Logowanie -------------------------------------------------------------------------------

export interface DaneLogowania {
  pesel: Pesel;
  sposob: SposobZalogowania;
  powrot?: string;
}

/**
 * Zalogowanie kontem (sekcje 3.5 i 6.5): przy pierwszym logowaniu tworzy konto przewodnika z rolą
 * Nowy użytkownik albo Administrator, zapisuje sposób zalogowania i wpis historii sesji, kończy
 * wcześniejszą sesję w tej przeglądarce, startuje sesję, wyznacza cel przez wyznaczEkranStartowy
 * (ekran sprzed wygaśnięcia zużywa się przy tym logowaniu) i uruchamia odczyt Danych z konta ZUS.
 * Stan gościa tej karty (przykładowa sprawa, ostatni scenariusz kalkulatora, pliki) przechodzi do konta.
 * Zapisy logowania są systemowe, więc logowanie działa także przy symulacji błędu zapisu.
 */
export function zalogujKontem(dane: DaneLogowania, ctx: KontekstOperacji): WynikOperacji<{ cel: string }> {
  // Identyfikator sesji zakończonej przy tym logowaniu, do sprzątnięcia plików po zatwierdzeniu.
  const skutki: { zakonczonaSesja: string | null; gosc: SkutkiPrzeniesieniaGoscia | null } = {
    zakonczonaSesja: null,
    gosc: null,
  };

  const wynik = wykonajOperacjeZWynikiem<{ cel: string }>(() => {
    const demo = kontoDemo(dane.pesel);
    if (odczytajStanKonta(dane.pesel) === null && demo === null) return { ok: false, kod: '0003' };
    // Stan gościa czytamy przed zamknięciem poprzedniej sesji, które czyści sessionStorage tej karty.
    const gosc = odczytajStanGoscia();

    const poprzednia = odczytajSesje();
    if (poprzednia !== null) {
      const przyczyna = czySesjaWygasla(poprzednia.ostatnieDzialanie, ctx.teraz) ? 'wygasniecie' : 'wylogowanie';
      zakonczSesjeWTransakcji(poprzednia, przyczyna, ctx);
      skutki.zakonczonaSesja = poprzednia.idSesji;
    }

    // Odczyt po zamknięciu poprzedniej sesji, która mogła zmienić historię sesji tego samego konta.
    const istniejacy = odczytajStanKonta(dane.pesel);
    const stanKonta = istniejacy ?? stanKontaPoczatkowy(kontoPrzewodnikaZKontaDemo(demo as KontoDemo, ctx.teraz));
    const cel = ekranStartowyKonta(stanKonta, dane.powrot);
    const sesja: Sesja = {
      idSesji: losowyUuid(),
      pesel: dane.pesel,
      sposob: dane.sposob,
      poczatek: ctx.teraz,
      ostatnieDzialanie: ctx.teraz,
    };
    const { ekranSprzedWygasniecia, ...konto } = stanKonta.konto;
    void ekranSprzedWygasniecia;

    const zapisanyStanKonta: StanKonta = {
      ...stanKonta,
      konto: {
        ...konto,
        sposobZalogowania: dane.sposob,
        historiaSesji: [...konto.historiaSesji, { idSesji: sesja.idSesji, poczatek: ctx.teraz, sposob: dane.sposob }],
      },
    };
    zapiszStanKonta(zapisanyStanKonta, 'systemowe');
    zapiszSesje(sesja);
    zapiszSystemowe(kluczDanychSesji(sesja.idSesji), stanSesjiPoczatkowy());
    if (gosc !== null) {
      skutki.gosc = przeniesStanGosciaWTransakcji(gosc, { stanKonta: zapisanyStanKonta, idSesji: sesja.idSesji });
    }
    usunSystemowe(KLUCZ_LOGOWANIE, 'sessionStorage');
    // Odczyt przy zalogowaniu zastępuje odczyt przy otwarciu tej karty.
    zapiszSystemowe(kluczOdczytano(sesja.idSesji), '1', 'sessionStorage');
    return { ok: true, wartosc: { cel } };
  });

  if (wynik.ok) {
    if (skutki.zakonczonaSesja !== null) posprzatajPoSesji(skutki.zakonczonaSesja);
    if (skutki.gosc !== null) posprzatajPoPrzeniesieniuGoscia(skutki.gosc, ctx);
    void sprzatnijPoGosciach(ctx);
    const rola = odczytajStanKonta(dane.pesel)?.konto.rola;
    if (rola !== undefined && rola !== 'administrator') void odczytajIObsluzDaneZus(dane.pesel, ctx);
  }
  return wynik;
}

/**
 * Wylogowanie (sekcja 3.4): kończy sesję z przyczyną `wylogowanie`, usuwa dane sesji, pliki sesji
 * i klucze przewodnika w sessionStorage. Nawigację na `/` wykonuje wywołujący.
 */
export function wyloguj(ctx: KontekstOperacji): WynikOperacji {
  return zakonczSesje('wylogowanie', ctx);
}

/** Zapis sposobu logowania i celu powrotu przed makietą logowania (ViewGuideStart, sekcja 3.5). */
export function rozpocznijLogowanie(logowanie: LogowanieWToku): void {
  zapiszSystemowe(KLUCZ_LOGOWANIE, logowanie, 'sessionStorage');
}

export function odczytajLogowanieWToku(): LogowanieWToku | null {
  return odczytaj<LogowanieWToku>(KLUCZ_LOGOWANIE, 'sessionStorage');
}

/** Przerwanie logowania w makiecie albo jego zakończenie bez zalogowania. */
export function zakonczLogowanieWToku(): void {
  usunSystemowe(KLUCZ_LOGOWANIE, 'sessionStorage');
}

// --- Rola ------------------------------------------------------------------------------------

/** Trwała zmiana roli konta (Nowy użytkownik → Rodzic przy zapisie profilu, Drugi rodzic przy dołączeniu). */
export function zmienRole(pesel: Pesel, rola: Rola, ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  return wykonajOperacjeZWynikiem(() => {
    const zmieniony = zmienKonto(pesel, (konto) => ({ ...konto, rola }));
    return zmieniony === null ? { ok: false, kod: '0003' } : { ok: true, wartosc: undefined };
  });
}

// --- Konta demonstracyjne --------------------------------------------------------------------

export interface DaneNowegoKontaDemo {
  pesel: Pesel;
  imie: string;
  nazwisko: string;
  imieINazwiskoDopelniacz?: string;
  dataUrodzenia: DataISO;
  plec: Plec;
}

/**
 * Wpis nowego konta demonstracyjnego w rejestrze (StanGlobalny.noweKontaDemo) z kolejnym numerem
 * kolejności. Numer PESEL musi być wolny (zajetePesele); zajęty numer daje 0003 bez zmiany rejestru.
 * Walidację pól i wygenerowanie numeru PESEL wykonuje operacja zalozNoweKonto (u01).
 */
export function utworzNoweKontoDemo(dane: DaneNowegoKontaDemo, ctx: KontekstOperacji): WynikOperacji<KontoDemo> {
  void ctx;
  return wykonajOperacjeZWynikiem<KontoDemo>(() => {
    if (zajetePesele().includes(dane.pesel)) return { ok: false, kod: '0003' };
    const kolejnosc = Math.max(0, ...wszystkieKontaDemo().map((k) => k.kolejnosc)) + 1;
    const konto: KontoDemo = {
      pesel: dane.pesel,
      imie: dane.imie,
      nazwisko: dane.nazwisko,
      imieINazwiskoDopelniacz: dane.imieINazwiskoDopelniacz ?? `${dane.imie} ${dane.nazwisko}`,
      dataUrodzenia: dane.dataUrodzenia,
      plec: dane.plec,
      rodzaj: 'nowe-konto',
      kolejnosc,
    };
    zmienGlobalne((g) => ({ ...g, noweKontaDemo: [...g.noweKontaDemo, konto] }), 'systemowe');
    return { ok: true, wartosc: konto };
  });
}

/** Skutki przywrócenia do wykonania po zatwierdzeniu transakcji (posprzatajPoPrzywroceniu). */
export interface SkutkiPrzywrocenia {
  pesel: Pesel;
  zakonczonaSesja: string | null;
  doPrzeliczenia: IdRodziny[];
}

function odlaczKontoOdRodziny(rodzina: StanRodziny, pesel: Pesel, dzis: DataISO): void {
  zapiszStanRodziny(
    {
      ...rodzina,
      daneRodziny: {
        ...rodzina.daneRodziny,
        dostepKont: rodzina.daneRodziny.dostepKont.map((d) =>
          d.pesel === pesel && d.stan === 'aktywny' ? { ...d, stan: 'odlaczony', odlaczono: dzis } : d,
        ),
      },
    },
    'systemowe',
  );
}

/**
 * Przywrócenie stanu początkowego konta w bieżącej transakcji (wspólne dla przywrocStanPoczatkowy
 * i wczytajScenariusz). `zachowajWRejestrze` zostawia nowe konto demonstracyjne na liście kont.
 */
export function przywrocStanPoczatkowyWTransakcji(
  pesel: Pesel,
  ctx: KontekstOperacji,
  opcje: { zachowajWRejestrze?: boolean } = {},
): SkutkiPrzywrocenia {
  const skutki: SkutkiPrzywrocenia = { pesel, zakonczonaSesja: null, doPrzeliczenia: [] };

  const sesja = odczytajSesje();
  if (sesja !== null && sesja.pesel === pesel) {
    zakonczSesjeWTransakcji(sesja, 'wylogowanie', ctx);
    skutki.zakonczonaSesja = sesja.idSesji;
  }

  // Rodziny, w których konto jest Rodzicem: zapisana przez konto (IdRodziny = PESEL) i wskazana w koncie.
  const usuwane = new Map<IdRodziny, StanRodziny>();
  const wlasna = odczytajStanRodziny(pesel);
  if (wlasna !== null) usuwane.set(wlasna.idRodziny, wlasna);
  const idRodzinyKonta = odczytajStanKonta(pesel)?.konto.idRodziny ?? null;
  if (idRodzinyKonta !== null && !usuwane.has(idRodzinyKonta)) {
    const rodzina = odczytajStanRodziny(idRodzinyKonta);
    if (rodzina !== null && osobyRodziny(rodzina.daneRodziny).peselRodzica === pesel) {
      usuwane.set(rodzina.idRodziny, rodzina);
    } else if (rodzina !== null) {
      // Konto dołączone do cudzej rodziny jako Drugi rodzic: rodzina zostaje, konto traci dostęp.
      odlaczKontoOdRodziny(rodzina, pesel, ctx.dzis);
      skutki.doPrzeliczenia.push(rodzina.idRodziny);
    }
  }

  for (const rodzina of usuwane.values()) {
    // Kontom dołączonym do usuwanej rodziny przywracamy rolę Nowy użytkownik bez rodziny i usuwamy
    // przypomnienia o terminach tej rodziny, które czekały na doręczenie.
    for (const dostep of rodzina.daneRodziny.dostepKont) {
      if (dostep.pesel === pesel) continue;
      zmienStanKonta(
        dostep.pesel,
        (stan) => ({
          ...stan,
          konto:
            stan.konto.idRodziny === rodzina.idRodziny
              ? { ...stan.konto, rola: 'nowy-uzytkownik', idRodziny: null }
              : stan.konto,
          powiadomienia: stan.powiadomienia.filter((p) => !czyPrzypomnienieRodziny(p, rodzina.idRodziny)),
        }),
        'systemowe',
      );
    }
    usunStanRodziny(rodzina.idRodziny, 'systemowe');
  }

  const usunZRejestru = kontoDemo(pesel)?.rodzaj === 'nowe-konto' && !opcje.zachowajWRejestrze;
  zmienGlobalne(
    (g) => ({
      ...g,
      noweKontaDemo: usunZRejestru ? g.noweKontaDemo.filter((k) => k.pesel !== pesel) : g.noweKontaDemo,
      zaproszenia: Object.fromEntries(Object.entries(g.zaproszenia).filter(([, id]) => !usuwane.has(id))),
    }),
    'systemowe',
  );
  usunStanKonta(pesel, 'systemowe');
  // Stan symulowanego ZUS zawiera dziecko dodane symulacją zgłoszenia, więc znika razem z kontem.
  usunStanZus(pesel, 'systemowe');
  return skutki;
}

/**
 * Przywrócenie stanu początkowego konta (analiza 3.1.1, R20; kontrakt 6.5): usuwa konto przewodnika,
 * stan symulowanego ZUS konta, rodzinę, w której konto jest Rodzicem (kontom dołączonym przywraca rolę
 * Nowy użytkownik i idRodziny = null), pliki konta, a nowe konto także z rejestru. Konto dołączone do cudzej
 * rodziny traci w niej dostęp. Konto Administrator ZUS zostaje bez zmian. Zapisy są systemowe.
 */
export function przywrocStanPoczatkowy(pesel: Pesel, ctx: KontekstOperacji): WynikOperacji {
  if (kontoDemo(pesel)?.rodzaj === 'konto-administratora') return { ok: true, wartosc: undefined };
  const wynik = wykonajOperacje(() => przywrocStanPoczatkowyWTransakcji(pesel, ctx));
  if (!wynik.ok) return wynik;
  posprzatajPoPrzywroceniu(wynik.wartosc, ctx);
  return { ok: true, wartosc: undefined };
}

/** Sprzątanie po zatwierdzonym przywróceniu: pliki sesji i konta, przeliczenie rodziny bez odłączonego konta. */
export function posprzatajPoPrzywroceniu(skutki: SkutkiPrzywrocenia, ctx: KontekstOperacji): void {
  if (skutki.zakonczonaSesja !== null) posprzatajPoSesji(skutki.zakonczonaSesja);
  void usunPlikiWlasciciela(skutki.pesel);
  // Błąd zapisu przeliczenia (symulacja) nie cofa przywrócenia; rodzina przeliczy się przy synchronizacji.
  for (const idRodziny of skutki.doPrzeliczenia) przeliczRodzine(idRodziny, ctx);
}

// --- Numery potwierdzeń ----------------------------------------------------------------------

/**
 * Kolejny numer potwierdzenia na dziś dla prefiksu, np. 'ZAM-DEMO-20261121-0001' (sekcja 6.5).
 * Zwiększa licznik dzienny w StanGlobalny.licznikiPotwierdzen zapisem domenowym, więc wywołuj ją
 * wewnątrz operacji (wykonajOperacje), która obsłuży BladZapisu.
 */
export function nastepnyNumerPotwierdzenia(prefiks: PrefiksPotwierdzenia, dzis: DataISO): string {
  const klucz = kluczLicznikaPotwierdzen(prefiks, dzis);
  const kolejny = (odczytajGlobalne().licznikiPotwierdzen[klucz] ?? 0) + 1;
  zmienGlobalne((g) => ({ ...g, licznikiPotwierdzen: { ...g.licznikiPotwierdzen, [klucz]: kolejny } }), 'domenowe');
  return numerPotwierdzenia(prefiks, dzis, kolejny);
}
