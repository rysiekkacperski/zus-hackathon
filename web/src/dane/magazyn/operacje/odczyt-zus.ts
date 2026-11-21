// Odczyt Danych z konta ZUS (kontrakt, sekcje 6.5, 6.6 i 6.7). Właściciel: u03.
//
// Przebieg odczytu konta z rolą Nowy użytkownik, Rodzic albo Drugi rodzic:
// 1. stan odczytu `trwa` z postępem 0 z 6 części; w trybie demonstracyjnym kolejne części kończą się po
//    `opoznienieOdczytuZusMs / 6` milisekund;
// 2. przy włączonej symulacji `daneZusNiedostepne` odczyt się nie udaje: konto z kopią zostaje przy niej
//    (stan `nieudany-z-kopia`, komunikat 0002), konto bez kopii dostaje stan `nieudany-bez-kopii` (0001);
// 3. udany odczyt zapisuje kopię z datą i godziną odczytu (przygotujKopie: filtry odczytu i oznaczenie
//    nowych dzieci względem kopii sprzed odczytu), stan `udany` i przelicza rodzinę konta.
// Odczyt tylko czyta dane ZUS i nie zmienia roli konta. Zapisy odczytu są systemowe.
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { postepOdczytu, przygotujKopie } from '@/domena/dane-zus/odczyt';
import type {
  DaneZKontaZus,
  KontekstOperacji,
  Pesel,
  StanOdczytuZus,
  WynikOperacji,
  ZrodloweDaneKontaZus,
} from '@/domena/typy';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  czySymulacja,
  czyTrybDemonstracyjny,
  odczytajParametry,
  odczytajStanKonta,
  odczytajStanZus,
  wykonajOperacje,
  zmienStanKonta,
} from '@/dane/magazyn/stan';

/** Odczyty w toku w tej karcie według numeru PESEL; kolejne wywołanie dla tego samego konta dołącza do odczytu. */
const odczytyWToku = new Map<Pesel, Promise<WynikOperacji>>();

/** Czy w tej karcie trwa odczyt Danych z konta ZUS konta. */
export function czyOdczytDanychZusWToku(pesel: Pesel): boolean {
  return odczytyWToku.has(pesel);
}

function poczekaj(ms: number): Promise<void> {
  return ms > 0 ? new Promise((rozwiaz) => setTimeout(rozwiaz, ms)) : Promise.resolve();
}

/** Opóźnienie jednej części odczytu: w trybie demonstracyjnym część parametru `opoznienieOdczytuZusMs`. */
function opoznienieCzesci(): number {
  if (!czyTrybDemonstracyjny()) return 0;
  const calosc = odczytajParametry().symulacje.opoznienieOdczytuZusMs;
  return Number.isFinite(calosc) && calosc > 0 ? Math.round(calosc / postepOdczytu()) : 0;
}

function ustawStanOdczytu(pesel: Pesel, stan: StanOdczytuZus): void {
  wykonajOperacje(() => {
    zmienStanKonta(pesel, (s) => ({ ...s, stanOdczytuZus: stan }), 'systemowe');
  });
}

/**
 * Dane konta ubezpieczonego w ZUS. W trybie demonstracyjnym pochodzą z danych przykładowych kont z dzieckiem
 * z symulacji i nadpisaniami scenariuszy. Poza trybem demonstracyjnym odczyt korzysta z usług PUE/eZUS; do czasu
 * podłączenia adaptera PUE/eZUS (adres w dane/parametry-produkcyjne.ts) dane dostarcza symulowany ZUS.
 */
function pobierzDaneZrodlowe(pesel: Pesel, osoba: { imie: string; nazwisko: string }): ZrodloweDaneKontaZus | null {
  return zrodloweDaneKonta(pesel, odczytajStanZus(pesel), osoba);
}

async function wykonajOdczyt(pesel: Pesel, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const stanKonta = odczytajStanKonta(pesel);
  if (stanKonta === null) return { ok: false, kod: '0001' };
  if (stanKonta.konto.rola === 'administrator') return { ok: true, wartosc: undefined };

  // Kopia sprzed odczytu: z nią system porównuje członków rodziny (nowe dziecko).
  const poprzednia: DaneZKontaZus | null = stanKonta.kopiaDanychZus;
  const liczbaCzesci = postepOdczytu();
  const opoznienie = opoznienieCzesci();

  ustawStanOdczytu(pesel, { stan: 'trwa', pobrano: 0, zKolei: liczbaCzesci });
  await poczekaj(opoznienie);

  if (czySymulacja('daneZusNiedostepne')) {
    const zKopia = odczytajStanKonta(pesel)?.kopiaDanychZus ?? null;
    ustawStanOdczytu(
      pesel,
      zKopia === null ? { stan: 'nieudany-bez-kopii', czas: ctx.teraz } : { stan: 'nieudany-z-kopia', czas: ctx.teraz },
    );
    return { ok: false, kod: zKopia === null ? '0001' : '0002' };
  }

  for (let pobrano = 1; pobrano < liczbaCzesci; pobrano += 1) {
    ustawStanOdczytu(pesel, { stan: 'trwa', pobrano, zKolei: liczbaCzesci });
    await poczekaj(opoznienie);
  }

  const biezacy = odczytajStanKonta(pesel);
  if (biezacy === null) return { ok: false, kod: '0001' };
  const zrodlo = pobierzDaneZrodlowe(pesel, { imie: biezacy.konto.imie, nazwisko: biezacy.konto.nazwisko });
  if (zrodlo === null) {
    ustawStanOdczytu(pesel, { stan: 'brak' });
    return { ok: true, wartosc: undefined };
  }

  const kopia = przygotujKopie({ zrodlo, poprzednia, teraz: ctx.teraz });
  const zapis = wykonajOperacje(() => {
    zmienStanKonta(
      pesel,
      (s) => ({ ...s, kopiaDanychZus: kopia, stanOdczytuZus: { stan: 'udany', czas: ctx.teraz } }),
      'systemowe',
    );
  });
  if (!zapis.ok) return zapis;

  // Przeliczenie po zapisaniu kopii (sekcja 6.7); jego błąd zapisu nie unieważnia odczytu.
  const idRodziny = odczytajStanKonta(pesel)?.konto.idRodziny ?? null;
  if (idRodziny !== null) przeliczRodzine(idRodziny, ctx);
  return { ok: true, wartosc: undefined };
}

/**
 * Odczytuje Dane z konta ZUS konta przewodnika i zapisuje kopię z datą odczytu (kontrakt, sekcja 6.5).
 * Wynik `0002` oznacza nieudany odczyt z zachowaną kopią, `0001` nieudany odczyt bez kopii.
 * Konto Administrator ZUS nie ma danych konta ZUS i kończy odczyt bez kopii.
 */
export function odczytajDaneKontaZus(pesel: Pesel, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const wToku = odczytyWToku.get(pesel);
  if (wToku !== undefined) return wToku;
  // Odczyt startuje w mikrozadaniu, więc znacznik odczytu w toku istnieje przed pierwszym zapisem stanu `trwa`.
  const odczyt = Promise.resolve()
    .then(() => wykonajOdczyt(pesel, ctx))
    .finally(() => {
      odczytyWToku.delete(pesel);
    });
  odczytyWToku.set(pesel, odczyt);
  return odczyt;
}
