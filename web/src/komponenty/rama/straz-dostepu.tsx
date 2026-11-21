'use client';

// Strażnik dostępu (kontrakt, sekcje 2.2 i 3.6). StrazDostepu sprawdza sesję i rolę na trasach grupy
// (strefa), a StrazPubliczna kieruje zalogowane konto ze strony startowej i makiet logowania na ekran
// startowy roli. Do chwili rozstrzygnięcia obaj strażnicy renderują SzkieletWidoku.
//
// Strażnicy owijają treść strony (children układu), więc czytają magazyn przez useSyncExternalStore
// z migawką serwera „nieznany stan”, bez use(browser()) i bez useSearchParams. Dzięki temu segment strony
// renderuje się podczas prerenderu i walidacji natychmiastowej nawigacji, a decyzję strażnik podejmuje
// w przeglądarce, przed pierwszym renderem treści przy nawigacji w aplikacji.
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type { IdWidoku, Rola, StanKonta } from '@/domena/typy';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { KLUCZ_LOGOWANIE } from '@/dane/magazyn/klucze';
import { ekranStartowyKonta } from '@/dane/magazyn/operacje/konto';
import { sprawdzSesje, wygasSesje } from '@/dane/magazyn/operacje/sesja';
import { odczytaj, subskrybuj } from '@/dane/magazyn/rdzen';
import { czyTrybDemonstracyjny, odczytajZalogowanego } from '@/dane/magazyn/stan';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { BrakUprawnien } from '@/komponenty/brak-uprawnien';
import { dopasujTrase, type DopasowanieTrasy, type WarunekTrasy } from '@/komponenty/rama/mapa-tras';
import { bezpiecznyPowrot, sciezkaWidoku } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';

/** Ekran startowy roli zalogowanego konta jako ścieżka (logo, przyciski powrotu); bez konta `/`. */
export function useEkranStartowy(powrot?: string): string {
  const stanKonta = useStanKonta();
  return useMemo(() => (stanKonta ? ekranStartowyKonta(stanKonta, powrot) : '/'), [stanKonta, powrot]);
}

// --- Odczyt magazynu bez zawieszania -----------------------------------------------------------

/** undefined: stan nieznany (prerender, hydratacja); null: brak sesji albo konta. */
type Zalogowanie = StanKonta | null | undefined;

function migawkaZalogowania(): Zalogowanie {
  return odczytajZalogowanego()?.stanKonta ?? null;
}

function migawkaNieznana(): undefined {
  return undefined;
}

function useZalogowanie(): Zalogowanie {
  return useSyncExternalStore(subskrybuj, migawkaZalogowania, migawkaNieznana);
}

function czySpelnionyWarunek(warunek: WarunekTrasy | undefined): boolean {
  if (warunek === undefined || czyTrybDemonstracyjny()) return true;
  return warunek === 'potwierdzonaMakieta' && odczytaj(KLUCZ_LOGOWANIE, 'sessionStorage') !== null;
}

function useSpelnionyWarunek(warunek: WarunekTrasy | undefined): boolean {
  const migawka = useCallback(() => czySpelnionyWarunek(warunek), [warunek]);
  return useSyncExternalStore(subskrybuj, migawka, () => true);
}

function sciezkaZZapytaniem(): string {
  return `${window.location.pathname}${window.location.search}`;
}

// --- Strefa po zalogowaniu ---------------------------------------------------------------------

type DecyzjaStrefy =
  | { rodzaj: 'nieznana' }
  | { rodzaj: 'tresc' }
  | { rodzaj: 'brak-uprawnien'; obszar: 'katalog' | 'podmioty-wsparcia' }
  | { rodzaj: 'bez-sesji' }
  | { rodzaj: 'ekran-startowy' };

function rozstrzygnijStrefe(
  trasa: DopasowanieTrasy | null,
  zalogowanie: Zalogowanie,
  sciezka: string,
  ekranStartowy: string,
): DecyzjaStrefy {
  if (zalogowanie === undefined) return { rodzaj: 'nieznana' };
  if (zalogowanie === null) return { rodzaj: 'bez-sesji' };
  const rola: Rola = zalogowanie.konto.rola;
  if (trasa === null) return { rodzaj: 'tresc' };
  if (trasa.wzorzec.startsWith('/panel/') && rola !== 'administrator') {
    return {
      rodzaj: 'brak-uprawnien',
      obszar: trasa.wzorzec.startsWith('/panel/podmioty-wsparcia') ? 'podmioty-wsparcia' : 'katalog',
    };
  }
  if (!trasa.role.includes(rola) && ekranStartowy.split('?', 1)[0] !== sciezka) return { rodzaj: 'ekran-startowy' };
  return { rodzaj: 'tresc' };
}

/** Adres strony startowej z parametrem powrotu do trasy otwartej bez sesji. */
function startZPowrotem(sciezka: string): string {
  const powrot = bezpiecznyPowrot(sciezka);
  return powrot === null || powrot === '/' ? '/' : `/?powrot=${encodeURIComponent(powrot)}`;
}

/**
 * Strażnik tras (strefa) przy każdej zmianie ścieżki: brak sesji prowadzi na `/?powrot=<ścieżka>`
 * (a po zakończeniu sesji w tej karcie na `/`), rola spoza listy ról trasy prowadzi na ekran startowy
 * roli, a `/panel/*` przy roli innej niż Administrator pokazuje BrakUprawnien w miejscu treści.
 */
export function StrazDostepu({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sciezka = usePathname();
  const zalogowanie = useZalogowanie();
  const ekranStartowy = useMemo(() => (zalogowanie ? ekranStartowyKonta(zalogowanie) : '/'), [zalogowanie]);
  // Czy ta rama widziała aktywną sesję: koniec sesji (wylogowanie, wygaśnięcie, inna karta) prowadzi na `/`.
  const bylaSesja = useRef(false);

  const decyzja = rozstrzygnijStrefe(dopasujTrase(sciezka), zalogowanie, sciezka, ekranStartowy);

  useEffect(() => {
    if (decyzja.rodzaj === 'nieznana') return;
    if (decyzja.rodzaj === 'bez-sesji') {
      router.replace(bylaSesja.current ? '/' : startZPowrotem(sciezkaZZapytaniem()));
      return;
    }
    bylaSesja.current = true;
    if (decyzja.rodzaj === 'ekran-startowy') router.replace(ekranStartowy);
  }, [decyzja.rodzaj, ekranStartowy, router, sciezka]);

  if (decyzja.rodzaj === 'tresc' || decyzja.rodzaj === 'nieznana') return children;
  if (decyzja.rodzaj === 'brak-uprawnien') return <BrakUprawnien obszar={decyzja.obszar} href={ekranStartowy} />;
  return <SzkieletWidoku />;
}

// --- Ekrany przed zalogowaniem -----------------------------------------------------------------

// Strona startowa i makiety logowania: przy aktywnej sesji kierujemy na ekran startowy roli.
const widokiPrzedZalogowaniem: readonly IdWidoku[] = ['ViewGuideStart', 'ViewMobywatelLogin', 'ViewEzusLogin', 'ViewMzusCodeLogin'];

/**
 * Strażnik tras (publiczne): strona `/` i makiety logowania przy aktywnej sesji prowadzą na ekran
 * startowy roli (z dozwolonym parametrem `powrot`), a sesja wygasła na tych ekranach kończy się
 * komunikatem 0212. Trasa z warunkiem (tryb demonstracyjny, potwierdzona makieta) bez spełnionego
 * warunku prowadzi na `/`.
 */
export function StrazPubliczna({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sciezka = usePathname();
  const trasa = dopasujTrase(sciezka);
  const zalogowanie = useZalogowanie();
  const warunekSpelniony = useSpelnionyWarunek(trasa?.warunek);

  const ekranPrzedZalogowaniem = trasa !== null && widokiPrzedZalogowaniem.includes(trasa.idWidoku);
  const sprawdzaSesje = ekranPrzedZalogowaniem && zalogowanie !== undefined && zalogowanie !== null;
  const doStartu = !warunekSpelniony && sciezka !== '/';

  useEffect(() => {
    if (doStartu) {
      router.replace(sciezkaWidoku('ViewGuideStart'));
      return;
    }
    if (!sprawdzaSesje || zalogowanie === null || zalogowanie === undefined) return;
    const ctx = pobierzKontekstOperacji();
    const stan = sprawdzSesje(ctx);
    if (stan === 'wygasla') {
      wygasSesje(sciezkaZZapytaniem(), ctx);
      return;
    }
    if (stan !== 'aktywna') return;
    const powrot = bezpiecznyPowrot(new URLSearchParams(window.location.search).get('powrot')) ?? undefined;
    router.replace(ekranStartowyKonta(zalogowanie, powrot));
  }, [doStartu, sprawdzaSesje, zalogowanie, router]);

  return sprawdzaSesje || doStartu ? <SzkieletWidoku /> : children;
}
