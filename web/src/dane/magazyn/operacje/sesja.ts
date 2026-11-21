// Operacje sesji (kontrakt, sekcje 3.4 i 6.5). Właściciel: u00.
// Sesja żyje w ppm:v1:sesja (wspólna dla kart), dane sesji w ppm:v1:sesja-dane:<idSesji>.
// Sesja wygasa po 15 minutach od ostatniego działania; działanie odnawia ją najwyżej raz na 30 sekund.
import { porownajZnaczniki, dodajMinuty } from '@/domena/daty';
import {
  CZAS_BEZCZYNNOSCI_SESJI_MINUTY,
  czyOdnowicSesje,
  czySesjaWygasla,
} from '@/domena/konto';
import type {
  KontekstOperacji,
  Pesel,
  Sesja,
  StanSesji,
  WpisHistoriiSesji,
  WynikOperacji,
} from '@/domena/typy';
import { bezpiecznyPowrot } from '@/komponenty/rama/trasy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { PRZEDROSTEK, kluczOdczytano } from '@/dane/magazyn/klucze';
import { odczytajDaneKontaZus } from '@/dane/magazyn/operacje/odczyt-zus';
import { uruchomPoOdczycieDanychZus } from '@/dane/magazyn/operacje/po-odczycie-zus';
import { usunPlikiSesji } from '@/dane/magazyn/pliki';
import { kluczeZPrzedrostkiem, odczytaj, usunSystemowe, zapiszSystemowe } from '@/dane/magazyn/rdzen';
import {
  odczytajSesje,
  odczytajStanKonta,
  odczytajZalogowanego,
  usunStanSesji,
  wykonajOperacje,
  zapiszSesje,
  zmienKonto,
  zmienStanSesji,
} from '@/dane/magazyn/stan';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';

export type PrzyczynaKoncaSesji = NonNullable<WpisHistoriiSesji['przyczynaKonca']>;

/** Stan sesji względem bieżącej chwili. */
export type StanAktywnosciSesji = 'brak-sesji' | 'aktywna' | 'wygasla';

/** Chwila końca sesji do historii: przy wygaśnięciu ostatnie działanie + 15 minut, najpóźniej teraz. */
function chwilaKonca(sesja: Sesja, przyczyna: PrzyczynaKoncaSesji, ctx: KontekstOperacji): string {
  if (przyczyna === 'wylogowanie') return ctx.teraz;
  const wygasniecie = dodajMinuty(sesja.ostatnieDzialanie, CZAS_BEZCZYNNOSCI_SESJI_MINUTY);
  return porownajZnaczniki(wygasniecie, ctx.teraz) <= 0 ? wygasniecie : ctx.teraz;
}

/**
 * Kończy podaną sesję w bieżącej transakcji: zamyka wpis w historii konta, usuwa sesję, dane sesji
 * i klucze przewodnika w sessionStorage tej karty. Pliki sesji w IndexedDB usuwa wywołujący po
 * zatwierdzeniu transakcji (posprzatajPoSesji).
 */
export function zakonczSesjeWTransakcji(sesja: Sesja, przyczyna: PrzyczynaKoncaSesji, ctx: KontekstOperacji): void {
  const koniec = chwilaKonca(sesja, przyczyna, ctx);
  zmienKonto(
    sesja.pesel,
    (konto) => ({
      ...konto,
      historiaSesji: konto.historiaSesji.map((wpis) =>
        wpis.idSesji === sesja.idSesji && wpis.koniec === undefined ? { ...wpis, koniec, przyczynaKonca: przyczyna } : wpis,
      ),
    }),
    'systemowe',
  );
  if (odczytajSesje()?.idSesji === sesja.idSesji) zapiszSesje(null);
  usunStanSesji(sesja.idSesji);
  for (const klucz of kluczeZPrzedrostkiem(PRZEDROSTEK, 'sessionStorage')) usunSystemowe(klucz, 'sessionStorage');
}

/** Sprzątanie po zatwierdzonym końcu sesji: pliki sesji w IndexedDB (dokumenty przykładowej sprawy). */
export function posprzatajPoSesji(idSesji: string): void {
  void usunPlikiSesji(idSesji);
}

/** Kończy aktywną sesję z podaną przyczyną (wylogowanie albo wygaśnięcie). */
export function zakonczSesje(przyczyna: PrzyczynaKoncaSesji, ctx: KontekstOperacji): WynikOperacji {
  const sesja = odczytajSesje();
  if (sesja === null) return { ok: true, wartosc: undefined };
  const wynik = wykonajOperacje(() => zakonczSesjeWTransakcji(sesja, przyczyna, ctx));
  if (wynik.ok) posprzatajPoSesji(sesja.idSesji);
  return wynik;
}

/** Stan sesji w chwili z kontekstu: brak sesji, sesja aktywna albo wygasła (15 minut bezczynności). */
export function sprawdzSesje(ctx: KontekstOperacji): StanAktywnosciSesji {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return 'brak-sesji';
  return czySesjaWygasla(zalogowany.sesja.ostatnieDzialanie, ctx.teraz) ? 'wygasla' : 'aktywna';
}

/**
 * Odnawia ostatnie działanie aktywnej sesji, najwyżej raz na 30 sekund. Chwila wcześniejsza niż ostatnie
 * działanie (cofnięcie zegara, zmiana czasu z letniego na zimowy) też odnawia sesję, więc odliczanie
 * 15 minut biegnie dalej od bieżącej chwili.
 */
export function odnowSesje(ctx: KontekstOperacji): WynikOperacji<{ odnowiono: boolean }> {
  const sesja = odczytajSesje();
  if (sesja === null || czySesjaWygasla(sesja.ostatnieDzialanie, ctx.teraz)) {
    return { ok: true, wartosc: { odnowiono: false } };
  }
  const zegarCofniety = porownajZnaczniki(ctx.teraz, sesja.ostatnieDzialanie) < 0;
  if (!zegarCofniety && !czyOdnowicSesje(sesja.ostatnieDzialanie, ctx.teraz)) {
    return { ok: true, wartosc: { odnowiono: false } };
  }
  return wykonajOperacje(() => {
    zapiszSesje({ ...sesja, ostatnieDzialanie: ctx.teraz });
    return { odnowiono: true };
  });
}

/**
 * Kończy wygasłą sesję (sekcja 3.4): zapisuje w koncie ekran sprzed wygaśnięcia (bieżąca ścieżka
 * z zapytaniem), kończy sesję z przyczyną `wygasniecie` i ustawia komunikat 0212 dla ViewGuideStart.
 * Wywołujący blokuje działanie, które ujawniło wygaśnięcie, i przechodzi na `/`.
 */
export function wygasSesje(sciezka: string, ctx: KontekstOperacji): WynikOperacji {
  const sesja = odczytajSesje();
  if (sesja === null) return { ok: true, wartosc: undefined };
  const ekran = bezpiecznyPowrot(sciezka);
  const wynik = wykonajOperacje(() => {
    zmienKonto(
      sesja.pesel,
      (konto) => (ekran === null ? konto : { ...konto, ekranSprzedWygasniecia: ekran }),
      'systemowe',
    );
    zakonczSesjeWTransakcji(sesja, 'wygasniecie', ctx);
    ustawKomunikatPoPrzejsciu({ kod: '0212', dlaWidoku: 'ViewGuideStart' });
  });
  if (wynik.ok) posprzatajPoSesji(sesja.idSesji);
  return wynik;
}

/**
 * Obsługa działania użytkownika (pointerdown, keydown, submit) dla AktywnoscSesji: przy wygasłej
 * sesji wykonuje wygasSesje(sciezka) i zwraca 'wygasla' (komponent blokuje zdarzenie i przechodzi
 * na `/`), przy aktywnej odnawia sesję i zwraca 'aktywna'.
 */
export function zarejestrujDzialanie(sciezka: string, ctx: KontekstOperacji): StanAktywnosciSesji {
  const stan = sprawdzSesje(ctx);
  if (stan === 'wygasla') wygasSesje(sciezka, ctx);
  else if (stan === 'aktywna') odnowSesje(ctx);
  return stan;
}

/** Zmienia dane bieżącej sesji (przykładowa sprawa, panel asystenta, oczekujący powrót z kanału). */
export function zapiszStanSesji(zmiana: Partial<StanSesji>, ctx: KontekstOperacji): WynikOperacji<StanSesji> {
  void ctx;
  const sesja = odczytajSesje();
  if (sesja === null) return { ok: false, kod: '0003' };
  return wykonajOperacje(() => zmienStanSesji(sesja.idSesji, (stan) => ({ ...stan, ...zmiana })));
}

/**
 * Odczyt Danych z konta ZUS raz na kartę i sesję (OdczytPrzyOtwarciu, sekcje 3.1 i 6.5): przy pierwszym
 * wywołaniu w karcie zapisuje znacznik ppm:v1:odczytano:<idSesji>, odczytuje kopię i uruchamia rejestr
 * poOdczycieDanychZus. Zwraca null, gdy odczyt w tej karcie już się odbył albo nie dotyczy konta.
 */
export async function odczytajDaneZusPrzyOtwarciu(ctx: KontekstOperacji): Promise<WynikOperacji | null> {
  const sesja = odczytajSesje();
  if (sesja === null) return null;
  const znacznik = kluczOdczytano(sesja.idSesji);
  if (odczytaj<string>(znacznik, 'sessionStorage') !== null) return null;
  const stanKonta = odczytajStanKonta(sesja.pesel);
  if (stanKonta === null || stanKonta.konto.rola === 'administrator') return null;
  zapiszSystemowe(znacznik, '1', 'sessionStorage');
  return odczytajIObsluzDaneZus(sesja.pesel, ctx);
}

/**
 * Odczyt Danych z konta ZUS konta i akcje rejestru poOdczycieDanychZus po udanym odczycie.
 * Odczyt bywa opóźniony (symulacja u03), więc akcje dostają kontekst z chwili zakończenia odczytu.
 */
export async function odczytajIObsluzDaneZus(pesel: Pesel, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const wynik = await odczytajDaneKontaZus(pesel, ctx);
  if (wynik.ok) uruchomPoOdczycieDanychZus(pesel, pobierzKontekstOperacji());
  return wynik;
}
