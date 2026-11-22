// Odczyt Danych z konta ZUS (kontrakt, sekcje 6.5, 6.6 i 6.7). Właściciel: u03.
//
// Przebieg odczytu konta z rolą Nowy użytkownik, Rodzic albo Drugi rodzic:
// 1. stan odczytu `trwa`; przeglądarka pobiera dane źródłowe konta z REST API symulowanego ZUS
//    (GET /api/v1/zus/konto?postac=zrodlowe z nagłówkiem X-Pesel). W trybie demonstracyjnym odczyt trwa co najmniej czas
//    `opoznienieOdczytuZusMs`, a interfejs pokazuje przez cały ten czas jedną kartę odczytu w toku z paskiem
//    postępu liczonym od chwili rozpoczęcia odczytu (przebiegOdczytuDanychZus);
// 2. włączone przełączniki symulacji ZUS idą do API w nagłówku X-Symulacje. Przy `daneZusNiedostepne` (0001),
//    przy odczycie przez PUE/eZUS z `pueEzusNiedostepne` (0133) i przy błędzie sieci odczyt kończy się po tym samym
//    czasie niepowodzeniem: konto z kopią zostaje przy niej (stan `nieudany-z-kopia`, komunikat 0002), konto bez kopii
//    dostaje stan `nieudany-bez-kopii` (0001, przy PUE/eZUS 0133);
// 3. udany odczyt nakłada na dane źródłowe stan symulowanego ZUS z magazynu (nadpisania scenariuszy, wnioski
//    z przewodnika, korespondencja), zapisuje kopię z datą i godziną odczytu (przygotujKopie: filtry odczytu
//    i oznaczenie nowych dzieci względem kopii sprzed odczytu), stan `udany` i przelicza rodzinę konta.
// Odczyt tylko czyta dane ZUS i nie zmienia roli konta. Zapisy odczytu są systemowe.
import { odczytajZrodloweDaneKontaZus } from '@/dane/api/klient';
import { opcjeSymulowanegoZus } from '@/dane/api/symulowany-zus';
import { kontoPrzykladowe } from '@/dane/konta-demo';
import { nalozStanSymulowany } from '@/dane/konta-zus';
import { postepOdczytu, przygotujKopie } from '@/domena/dane-zus/odczyt';
import { czyMaZgode } from '@/domena/konto/zgoda';
import type {
  DaneZKontaZus,
  KontekstOperacji,
  ParametrySystemu,
  Pesel,
  StanOdczytuZus,
  WynikOperacji,
  ZrodloweDaneKontaZus,
} from '@/domena/typy';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { powiadomOZmianachStatusowWnioskow } from '@/dane/magazyn/operacje/rozliczenia';
import {
  odczytajParametry,
  odczytajStanKonta,
  odczytajStanRodziny,
  odczytajStanZus,
  wykonajOperacje,
  zmienStanKonta,
} from '@/dane/magazyn/stan';

/** Odczyty w toku w tej karcie według numeru PESEL; kolejne wywołanie dla tego samego konta dołącza do odczytu. */
const odczytyWToku = new Map<Pesel, Promise<WynikOperacji>>();

/** Chwila rozpoczęcia odczytu w toku (`performance.now()`) i zaplanowany czas odczytu w milisekundach. */
export interface PrzebiegOdczytuDanychZus {
  rozpoczeto: number;
  czasMs: number;
}

/** Przebiegi odczytów w toku w tej karcie według numeru PESEL. */
const przebiegiOdczytow = new Map<Pesel, PrzebiegOdczytuDanychZus>();

/** Czy w tej karcie trwa odczyt Danych z konta ZUS konta. */
export function czyOdczytDanychZusWToku(pesel: Pesel): boolean {
  return odczytyWToku.has(pesel);
}

/**
 * Przebieg odczytu w toku w tej karcie: karta odczytu liczy z niego wypełnienie paska postępu, także gdy
 * pojawia się na ekranie w trakcie odczytu (na przykład po przejściu z logowania).
 */
export function przebiegOdczytuDanychZus(pesel: Pesel): PrzebiegOdczytuDanychZus | null {
  return przebiegiOdczytow.get(pesel) ?? null;
}

/**
 * Czas symulowanego odczytu Danych z konta ZUS w milisekundach: w trybie demonstracyjnym parametr
 * `opoznienieOdczytuZusMs` (ViewDemoSettings), poza nim 0.
 */
export function czasOdczytuDanychZusMs(parametry: ParametrySystemu = odczytajParametry()): number {
  if (!parametry.trybDemonstracyjny) return 0;
  const calosc = parametry.symulacje.opoznienieOdczytuZusMs;
  return Number.isFinite(calosc) && calosc > 0 ? Math.round(calosc) : 0;
}

function poczekaj(ms: number): Promise<void> {
  return ms > 0 ? new Promise((rozwiaz) => setTimeout(rozwiaz, ms)) : Promise.resolve();
}

function ustawStanOdczytu(pesel: Pesel, stan: StanOdczytuZus): void {
  wykonajOperacje(() => {
    zmienStanKonta(pesel, (s) => ({ ...s, stanOdczytuZus: stan }), 'systemowe');
  });
}

/** Opcje odczytu: `kanal: 'pue-ezus'` oznacza odczyt przez PUE/eZUS z ekranu ViewZusAccountData. */
export interface OpcjeOdczytuDanychZus {
  kanal?: 'pue-ezus';
}

/**
 * Dane źródłowe ostatniego udanego odczytu w tej karcie według numeru PESEL, po nałożeniu stanu symulowanego ZUS.
 * ViewZusAccountData sprawdza w nich, czy konto ma zaświadczenia e-ZLA starsze niż 12 miesięcy (0114).
 */
const zrodlaOdczytow = new Map<Pesel, ZrodloweDaneKontaZus>();

/** Dane źródłowe z ostatniego udanego odczytu konta w tej karcie albo null przed pierwszym odczytem. */
export function zrodloOstatniegoOdczytuZus(pesel: Pesel): ZrodloweDaneKontaZus | null {
  return zrodlaOdczytow.get(pesel) ?? null;
}

/**
 * Dane konta ubezpieczonego w ZUS z REST API symulowanego ZUS z nałożonym stanem symulowanego ZUS z magazynu: nadpisaniami
 * scenariuszy, dzieckiem z symulacji, wnioskami z przewodnika, zaświadczeniami i korespondencją. Poza trybem
 * demonstracyjnym odczyt korzysta z usług PUE/eZUS; do czasu podłączenia adaptera PUE/eZUS (adres
 * w dane/parametry-produkcyjne.ts) dane dostarcza symulowany ZUS. Bez zgody na dane dotyczące zdrowia dane źródłowe
 * nie zawierają zaświadczeń e-ZLA, także z nadpisań scenariuszy.
 */
async function pobierzDaneZrodlowe(
  pesel: Pesel,
  zgodaNaDaneZdrowia: boolean,
  ctx: KontekstOperacji,
  opcje: OpcjeOdczytuDanychZus,
): Promise<WynikOperacji<ZrodloweDaneKontaZus>> {
  const wynik = await odczytajZrodloweDaneKontaZus(
    pesel,
    { zgodaNaDaneZdrowia, teraz: ctx.teraz, ...(opcje.kanal ? { kanal: opcje.kanal } : {}) },
    opcjeSymulowanegoZus(),
  );
  return wynik.ok ? { ok: true, wartosc: wynik.wartosc.zrodlo } : { ok: false, kod: wynik.kod };
}

async function wykonajOdczyt(pesel: Pesel, ctx: KontekstOperacji, opcje: OpcjeOdczytuDanychZus): Promise<WynikOperacji> {
  const stanKonta = odczytajStanKonta(pesel);
  if (stanKonta === null) return { ok: false, kod: '0001' };
  if (stanKonta.konto.rola === 'administrator') return { ok: true, wartosc: undefined };

  // Kopia sprzed odczytu: z nią system porównuje członków rodziny (nowe dziecko).
  const poprzednia: DaneZKontaZus | null = stanKonta.kopiaDanychZus;
  const czasMs = czasOdczytuDanychZusMs();

  // Jeden stan odczytu w toku przez cały czas odczytu: karta odczytu wypełnia pasek postępu płynnie
  // od chwili rozpoczęcia, więc stan nie zmienia się w trakcie oczekiwania. Żądanie do API biegnie
  // równolegle z oczekiwaniem, więc odczyt trwa tyle co dłuższe z nich.
  przebiegiOdczytow.set(pesel, { rozpoczeto: performance.now(), czasMs });
  ustawStanOdczytu(pesel, { stan: 'trwa', pobrano: 0, zKolei: postepOdczytu() });
  const [pobrane] = await Promise.all([
    pobierzDaneZrodlowe(pesel, czyMaZgode(stanKonta.konto.decyzjeOZgodzie), ctx, opcje),
    poczekaj(czasMs),
  ]);

  if (!pobrane.ok) {
    // Konto Administrator ZUS z listy kont demonstracyjnych nie ma danych konta ZUS: odczyt kończy się bez kopii.
    if (kontoPrzykladowe(pesel)?.rodzaj === 'konto-administratora') {
      ustawStanOdczytu(pesel, { stan: 'brak' });
      return { ok: true, wartosc: undefined };
    }
    const zKopia = odczytajStanKonta(pesel)?.kopiaDanychZus ?? null;
    ustawStanOdczytu(
      pesel,
      zKopia === null ? { stan: 'nieudany-bez-kopii', czas: ctx.teraz } : { stan: 'nieudany-z-kopia', czas: ctx.teraz },
    );
    if (zKopia !== null) return { ok: false, kod: '0002' };
    return { ok: false, kod: pobrane.kod === '0133' ? '0133' : '0001' };
  }

  const biezacy = odczytajStanKonta(pesel);
  if (biezacy === null) return { ok: false, kod: '0001' };
  const zgodaNaDaneZdrowia = czyMaZgode(biezacy.konto.decyzjeOZgodzie);
  const nalozone = nalozStanSymulowany(pobrane.wartosc, odczytajStanZus(pesel), {
    imie: biezacy.konto.imie,
    nazwisko: biezacy.konto.nazwisko,
  });
  const zrodlo: ZrodloweDaneKontaZus = zgodaNaDaneZdrowia ? nalozone : { ...nalozone, zaswiadczeniaEzla: [] };

  const kopia = przygotujKopie({
    zrodlo,
    poprzednia,
    teraz: ctx.teraz,
    zgodaNaDaneZdrowia,
  });
  const zapis = wykonajOperacje(() => {
    zmienStanKonta(
      pesel,
      (s) => ({ ...s, kopiaDanychZus: kopia, stanOdczytuZus: { stan: 'udany', czas: ctx.teraz } }),
      'systemowe',
    );
  });
  if (!zapis.ok) return zapis;
  zrodlaOdczytow.set(pesel, zrodlo);

  // Przeliczenie po zapisaniu kopii (sekcja 6.7); jego błąd zapisu nie unieważnia odczytu.
  const idRodziny = odczytajStanKonta(pesel)?.konto.idRodziny ?? null;
  if (idRodziny !== null) {
    // Plan sprzed przeliczenia: z nim system porównuje statusy spraw ZUS i wysyła powiadomienie o zmianie statusu wniosku.
    const poprzedniPlan = odczytajStanRodziny(idRodziny)?.plan ?? null;
    const przeliczenie = przeliczRodzine(idRodziny, ctx);
    if (przeliczenie.ok) powiadomOZmianachStatusowWnioskow(idRodziny, poprzedniPlan, ctx);
  }
  return { ok: true, wartosc: undefined };
}

/**
 * Odczytuje Dane z konta ZUS konta przewodnika przez REST API symulowanego ZUS i zapisuje kopię z datą odczytu
 * (kontrakt, sekcja 6.5). Wynik `0002` oznacza nieudany odczyt z zachowaną kopią, `0001` nieudany odczyt bez kopii,
 * a `0133` nieudany odczyt bez kopii przez niedostępne PUE/eZUS. Konto Administrator ZUS nie ma danych konta ZUS
 * i kończy odczyt bez kopii. Kolejne wywołanie dla konta z odczytem w toku dołącza do tego odczytu.
 */
export function odczytajDaneKontaZus(
  pesel: Pesel,
  ctx: KontekstOperacji,
  opcje: OpcjeOdczytuDanychZus = {},
): Promise<WynikOperacji> {
  const wToku = odczytyWToku.get(pesel);
  if (wToku !== undefined) return wToku;
  // Odczyt startuje w mikrozadaniu, więc znacznik odczytu w toku istnieje przed pierwszym zapisem stanu `trwa`.
  const odczyt = Promise.resolve()
    .then(() => wykonajOdczyt(pesel, ctx, opcje))
    .finally(() => {
      odczytyWToku.delete(pesel);
      przebiegiOdczytow.delete(pesel);
    });
  odczytyWToku.set(pesel, odczyt);
  return odczyt;
}
