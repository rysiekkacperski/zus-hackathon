// Parametry systemu, przełączniki symulacji, katalog początkowy i scenariusze demonstracyjne
// (kontrakt, sekcje 6.5 i 6.6). Właściciel: u00. Zmienia je ViewDemoSettings (u01).
// Zapisy są systemowe, więc działają także przy włączonej symulacji błędu zapisu.
import { scenariusze } from '@/dane/scenariusze';
import { utworzParametryPoczatkowe } from '@/dane/parametry-systemu';
import { czyPoprawnaDataISO } from '@/domena/daty';
import { czySesjaWygasla } from '@/domena/konto';
import type {
  DataISO,
  KontekstOperacji,
  ParametrySystemu,
  Pesel,
  ScenariuszDemo,
  StanKonta,
  WynikOperacji,
} from '@/domena/typy';
import {
  posprzatajPoPrzywroceniu,
  przywrocStanPoczatkowyWTransakcji,
} from '@/dane/magazyn/operacje/konto';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  kontoDemo,
  odczytajSesje,
  wykonajOperacje,
  wykonajOperacjeZWynikiem,
  zapiszSesje,
  zapiszStanKonta,
  zapiszStanRodziny,
  zmienGlobalne,
  zmienStanZus,
} from '@/dane/magazyn/stan';
import {
  edycjeKataloguPoczatkowe,
  kontoPrzewodnikaZKontaDemo,
  stanKontaPoczatkowy,
} from '@/dane/magazyn/stan-poczatkowy';
import { obowiazujacaDataDemo, pobierzKontekstOperacji } from '@/dane/magazyn/zegar';

export type ZmianaParametrow = Partial<Omit<ParametrySystemu, 'symulacje'>>;
export type ZmianaSymulacji = Partial<ParametrySystemu['symulacje']>;

function scalParametry(
  obecne: ParametrySystemu,
  zmiana: ZmianaParametrow & { symulacje?: ZmianaSymulacji },
): ParametrySystemu {
  return { ...obecne, ...zmiana, symulacje: { ...obecne.symulacje, ...zmiana.symulacje } };
}

/**
 * Zmiana obowiązującej daty demonstracyjnej (dataDemo albo tryb demonstracyjny) przesuwa „teraz”
 * przewodnika. Aktywna sesja liczy wtedy bezczynność od chwili zmiany w nowym czasie, więc ani nie
 * wygasa od razu po przesunięciu daty w przód, ani nie trwa bez końca po przesunięciu jej wstecz.
 * Wywołuj w transakcji operacji, po zapisie parametrów.
 */
function przeniesSesjePoZmianieDaty(dataDemoPrzed: DataISO | null, ctx: KontekstOperacji): void {
  if (obowiazujacaDataDemo() === dataDemoPrzed) return;
  const sesja = odczytajSesje();
  if (sesja === null || czySesjaWygasla(sesja.ostatnieDzialanie, ctx.teraz)) return;
  zapiszSesje({ ...sesja, ostatnieDzialanie: pobierzKontekstOperacji().teraz });
}

/** Zapis parametrów w bieżącej transakcji z przeniesieniem sesji po zmianie daty demonstracyjnej. */
function zapiszParametry(
  fn: (obecne: ParametrySystemu) => ParametrySystemu,
  ctx: KontekstOperacji,
): ParametrySystemu {
  const dataDemoPrzed = obowiazujacaDataDemo();
  const parametry = zmienGlobalne((g) => ({ ...g, parametry: fn(g.parametry) }), 'systemowe').parametry;
  przeniesSesjePoZmianieDaty(dataDemoPrzed, ctx);
  return parametry;
}

/** Zmiana parametrów systemu; data demonstracyjna musi być istniejącym dniem 'RRRR-MM-DD' albo null (0010). */
export function ustawParametry(zmiana: ZmianaParametrow, ctx: KontekstOperacji): WynikOperacji<ParametrySystemu> {
  if (zmiana.dataDemo !== undefined && zmiana.dataDemo !== null && !czyPoprawnaDataISO(zmiana.dataDemo)) {
    return { ok: false, kod: '0010', bledyPol: { dataDemo: '0010' } };
  }
  return wykonajOperacje(() => zapiszParametry((obecne) => scalParametry(obecne, zmiana), ctx));
}

/** Zmiana przełączników symulacji (sekcja 6.6). */
export function ustawSymulacje(zmiana: ZmianaSymulacji, ctx: KontekstOperacji): WynikOperacji<ParametrySystemu> {
  void ctx;
  return wykonajOperacje(
    () =>
      zmienGlobalne((g) => ({ ...g, parametry: scalParametry(g.parametry, { symulacje: zmiana }) }), 'systemowe')
        .parametry,
  );
}

/** Przywrócenie wartości początkowych parametrów i przełączników symulacji. */
export function przywrocParametryPoczatkowe(ctx: KontekstOperacji): WynikOperacji<ParametrySystemu> {
  return wykonajOperacje(() => zapiszParametry(() => utworzParametryPoczatkowe(), ctx));
}

/**
 * Usuwa edycje katalogu Administratora. Wersja katalogu rośnie, więc rodziny przeliczą plan
 * przy najbliższej synchronizacji.
 */
export function przywrocKatalogPoczatkowy(ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  return wykonajOperacje(() => {
    zmienGlobalne((g) => ({ ...g, edycjeKatalogu: edycjeKataloguPoczatkowe(g.edycjeKatalogu.wersja + 1) }), 'systemowe');
  });
}

/** Scenariusze demonstracyjne z rejestru dane/scenariusze w kolejności jednostek. */
export function listaScenariuszy(): readonly ScenariuszDemo[] {
  return scenariusze;
}

/**
 * Wczytuje scenariusz demonstracyjny: przywraca stan początkowy konta scenariusza i zapisuje stan
 * z `zastosuj(ctx)` (konto, rodzina, symulowany ZUS, parametry), a potem przelicza rodzinę.
 */
export function wczytajScenariusz(id: string, ctx: KontekstOperacji): WynikOperacji<{ pesel: Pesel }> {
  const scenariusz = scenariusze.find((s) => s.id === id);
  if (scenariusz === undefined) return { ok: false, kod: '0003' };
  const stan = scenariusz.zastosuj(ctx);
  const pesel = scenariusz.pesel;

  const wynik = wykonajOperacjeZWynikiem(() => {
    const skutki = przywrocStanPoczatkowyWTransakcji(pesel, ctx, { zachowajWRejestrze: true });

    if (stan.parametry) {
      const zmiana = stan.parametry;
      zapiszParametry((obecne) => scalParametry(obecne, zmiana), ctx);
    }

    if (stan.konto) {
      const demo = kontoDemo(pesel);
      const bazowe: StanKonta | null =
        stan.konto.konto !== undefined
          ? stanKontaPoczatkowy(stan.konto.konto)
          : demo === null
            ? null
            : stanKontaPoczatkowy(kontoPrzewodnikaZKontaDemo(demo, ctx.teraz));
      if (bazowe === null) return { ok: false, kod: '0003' };
      zapiszStanKonta({ ...bazowe, ...stan.konto, konto: stan.konto.konto ?? bazowe.konto }, 'systemowe');
    }

    if (stan.rodzina) zapiszStanRodziny(stan.rodzina, 'systemowe');

    if (stan.zus) {
      const zus = stan.zus;
      zmienStanZus(pesel, (s) => ({ ...s, ...zus, pesel }), 'systemowe');
    }

    return { ok: true, wartosc: skutki };
  });
  if (!wynik.ok) return wynik;

  // Parametry scenariusza mogą zmienić datę demonstracyjną, więc przeliczenie dostaje kontekst po zmianie.
  const ctxPo = stan.parametry ? pobierzKontekstOperacji() : ctx;
  posprzatajPoPrzywroceniu(wynik.wartosc, ctxPo);
  if (stan.rodzina) przeliczRodzine(stan.rodzina.idRodziny, ctxPo);
  return { ok: true, wartosc: { pesel } };
}
