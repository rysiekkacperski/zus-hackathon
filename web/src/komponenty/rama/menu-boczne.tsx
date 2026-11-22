'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { Pochodzenie, Rola } from '@/domena/typy';
import { useCzyGosc, useKonto, useStanInterfejsu } from '@/dane/magazyn/hooki';
import { ustawStanInterfejsu } from '@/dane/magazyn/stan';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { useSciezkaLogowania } from '@/komponenty/rama/konto-w-naglowku';
import { dopasujTrase, widokMenuDlaPochodzenia, type WidokMenu } from '@/komponenty/rama/mapa-tras';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

interface PozycjaMenu {
  idWidoku: WidokMenu;
  href: string;
  ikona: NazwaIkony;
  etykieta: string;
}

function pozycja(idWidoku: WidokMenu, ikona: NazwaIkony, etykieta: string, href = sciezkaWidoku(idWidoku)): PozycjaMenu {
  return { idWidoku, href, ikona, etykieta };
}

const m = teksty.rama.menu;
const planRodziny = pozycja('ViewFamilyPlan', 'plan', m.planRodziny);
const profilRodziny = pozycja('ViewProfileSummary', 'profil', m.profilRodziny, sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' }));
const sytuacjeSzczegolne = pozycja('ViewSpecialSituation', 'serce', m.sytuacjeSzczegolne);
const terminy = pozycja('ViewDeadlines', 'kalendarz', m.terminy);
const twojeWnioski = pozycja('ViewApplicationList', 'wnioski', m.twojeWnioski);
const kalkulator = pozycja('ViewCalcMaternityInput', 'kalkulator', m.kalkulator);
const przykladoweSprawy = pozycja('ViewSampleCaseList', 'folder', m.przykladoweSprawy);
const profilNaStart = pozycja('ViewProfileZusData', 'profil', m.profilNaStart);
const katalog = pozycja('ViewCatalogList', 'katalog', m.katalog);
const podmiotyWsparcia = pozycja('ViewCatalogSupportOrganizations', 'serce', m.podmiotyWsparcia);

// Sekcja 3.2 kontraktu. Decyzja właściciela produktu: menu rodzica nie zawiera kalkulatora zasiłku
// ani przykładowych spraw ZUS; rodzic otwiera je z ekranu startowego, z planu i ze spraw.
const pozycjeRoli: Record<Rola, PozycjaMenu[]> = {
  rodzic: [planRodziny, profilRodziny, sytuacjeSzczegolne, terminy, twojeWnioski],
  'drugi-rodzic': [planRodziny, profilRodziny, sytuacjeSzczegolne, terminy, twojeWnioski],
  'nowy-uzytkownik': [profilNaStart],
  administrator: [katalog, podmiotyWsparcia],
};

// Tryb gościa: kalkulator zasiłku i przykładowe sprawy, a pod nimi pozycja „Zaloguj się”.
const pozycjeGoscia: PozycjaMenu[] = [kalkulator, przykladoweSprawy];

interface Biezace {
  /** Wyróżniona pozycja menu. */
  pozycja: WidokMenu | undefined;
  /** Bieżąca trasa jest stroną wyróżnionej pozycji. */
  naStroniePozycji: boolean;
}

// Parametr ?z= nadpisuje wyróżnienie na ViewCaseDetails i ViewCaseGuide (sekcja 3.2).
function useBiezace(pozycje: PozycjaMenu[]): Biezace {
  const sciezka = usePathname();
  const zapytanie = useSearchParams();
  const z = zapytanie.get('z');
  const wpis = dopasujTrase(sciezka);
  const naStronie = pozycje.find((p) => sciezka === p.href)?.idWidoku;
  if (wpis) {
    const zPochodzenia = z === null ? undefined : widokMenuDlaPochodzenia[z as Pochodzenie];
    const sprawa = wpis.idWidoku === 'ViewCaseDetails' || wpis.idWidoku === 'ViewCaseGuide';
    const pozycja = sprawa && zPochodzenia ? zPochodzenia : wpis.pozycjaMenu;
    return { pozycja, naStroniePozycji: pozycja !== undefined && naStronie === pozycja };
  }
  return { pozycja: naStronie, naStroniePozycji: naStronie !== undefined };
}

// biezaca: strona pozycji; wyrozniona: pozycja nadrzędna bieżącej strony z tłem, np. „Plan rodziny” na stronie etapu.
type StanPozycji = 'biezaca' | 'wyrozniona' | 'zwykla';

const klasyPozycji: Record<StanPozycji, string> = {
  biezaca: 'bg-surface-card text-brand hover:text-brand cursor-default',
  wyrozniona: 'bg-surface-card text-brand hover:text-brand',
  zwykla: 'text-on-brand hover:bg-brand-raised hover:text-on-brand active:bg-brand-deep active:text-on-brand',
};

const ariaCurrent: Record<StanPozycji, 'page' | 'true' | undefined> = {
  biezaca: 'page',
  wyrozniona: 'true',
  zwykla: undefined,
};

function klasyLinku(zwiniete: boolean, stan: StanPozycji): string {
  return `relative flex min-h-nav-item items-center gap-3 rounded-sm text-body no-underline transition-colors duration-150 focus-visible:outline-on-brand motion-reduce:transition-none ${zwiniete ? 'group/link justify-center px-0' : 'px-4'} ${klasyPozycji[stan]}`;
}

// Podpowiedź z nazwą pozycji w menu zwiniętym: widoczna po najechaniu i po fokusie z klawiatury.
// Nazwę dostępną daje aria-label linku albo przycisku, więc podpowiedź jest ukryta przed czytnikiem.
function Podpowiedz({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none invisible absolute top-1/2 left-full z-40 ml-4 -translate-y-1/2 whitespace-nowrap rounded-sm bg-ink-strong px-3 py-1.5 text-small text-on-brand opacity-0 shadow-header transition-opacity duration-150 group-hover/link:visible group-hover/link:opacity-100 group-focus-visible/link:visible group-focus-visible/link:opacity-100 motion-reduce:transition-none"
    >
      {children}
    </span>
  );
}

function ListaPozycji({
  pozycje,
  biezaca,
  zwiniete,
  onWybor,
  logowanie,
}: {
  pozycje: PozycjaMenu[];
  biezaca: Biezace;
  zwiniete: boolean;
  onWybor?: () => void;
  // Tryb gościa: adres logowania z powrotem na bieżący ekran, pokazany jako ostatnia pozycja.
  logowanie?: string;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {pozycje.map((p) => {
        const stan: StanPozycji =
          p.idWidoku !== biezaca.pozycja ? 'zwykla' : biezaca.naStroniePozycji ? 'biezaca' : 'wyrozniona';
        return (
          <li key={p.idWidoku}>
            <Link
              href={p.href}
              aria-current={ariaCurrent[stan]}
              aria-label={zwiniete ? p.etykieta : undefined}
              onClick={onWybor}
              className={klasyLinku(zwiniete, stan)}
            >
              <Ikona nazwa={p.ikona} rozmiar={24} />
              {zwiniete ? <Podpowiedz>{p.etykieta}</Podpowiedz> : <span className="min-w-0">{p.etykieta}</span>}
            </Link>
          </li>
        );
      })}
      {logowanie === undefined ? null : (
        <li>
          <Link
            href={logowanie}
            aria-label={zwiniete ? teksty.rama.zalogujSie : undefined}
            onClick={onWybor}
            className={klasyLinku(zwiniete, 'zwykla')}
          >
            <Ikona nazwa="konto" rozmiar={24} />
            {zwiniete ? (
              <Podpowiedz>{teksty.rama.zalogujSie}</Podpowiedz>
            ) : (
              <span className="min-w-0">{teksty.rama.zalogujSie}</span>
            )}
          </Link>
        </li>
      )}
    </ul>
  );
}

export interface MenuBoczneProps {
  idMobilne: string;
  mobilneOtwarte: boolean;
  onZamknijMobilne: (zwrocFokus: boolean) => void;
}

// ez-sidenav: stałe menu od lg (z przyciskiem zwijania) i panel pod nagłówkiem poniżej lg.
export function MenuBoczne({ idMobilne, mobilneOtwarte, onZamknijMobilne }: MenuBoczneProps) {
  const konto = useKonto();
  const gosc = useCzyGosc();
  const sciezkaLogowania = useSciezkaLogowania();
  // Stan zwinięcia menu na lg zapisuje ppm:v1:ui (sekcja 6.2).
  const { menuZwiniete } = useStanInterfejsu();
  const przelaczZwiniecieMenu = () => ustawStanInterfejsu({ menuZwiniete: !menuZwiniete });
  const pozycje = gosc ? pozycjeGoscia : konto ? pozycjeRoli[konto.rola] : [];
  const logowanie = gosc ? sciezkaLogowania : undefined;
  const biezaca = useBiezace(pozycje);

  useEffect(() => {
    if (!mobilneOtwarte) return;
    const naKlawisz = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onZamknijMobilne(true);
    };
    document.addEventListener('keydown', naKlawisz);
    return () => document.removeEventListener('keydown', naKlawisz);
  }, [mobilneOtwarte, onZamknijMobilne]);

  return (
    <>
      <nav
        aria-label={teksty.rama.menuPrzewodnika}
        data-menu-zwiniete={menuZwiniete ? '' : undefined}
        className={`hidden flex-col bg-brand px-3 pt-3 text-on-brand lg:flex ${menuZwiniete ? 'w-sidebar-zwiniety' : 'w-sidebar'}`}
      >
        <ListaPozycji pozycje={pozycje} biezaca={biezaca} zwiniete={menuZwiniete} logowanie={logowanie} />
        {/* Przycisk zwijania: ostatni element menu, przyklejony do dołu widocznego obszaru menu. */}
        <div className="sticky bottom-0 z-10 mt-auto border-t border-brand-muted bg-brand pt-3 pb-3">
          <button
            type="button"
            aria-expanded={!menuZwiniete}
            aria-label={menuZwiniete ? teksty.rama.rozwinMenu : undefined}
            onClick={przelaczZwiniecieMenu}
            className={`relative flex min-h-nav-item w-full cursor-pointer items-center gap-3 rounded-sm border-0 bg-transparent text-body text-on-brand transition-colors duration-150 hover:bg-brand-raised active:bg-brand-deep focus-visible:outline-on-brand motion-reduce:transition-none ${menuZwiniete ? 'group/link justify-center px-0' : 'px-4'}`}
          >
            <Ikona nazwa={menuZwiniete ? 'w-prawo' : 'w-lewo'} rozmiar={24} />
            {menuZwiniete ? (
              <Podpowiedz>{teksty.rama.rozwinMenu}</Podpowiedz>
            ) : (
              <span className="min-w-0">{teksty.rama.zwinMenu}</span>
            )}
          </button>
        </div>
      </nav>

      <div hidden={!mobilneOtwarte} className="contents lg:hidden">
        <nav
          id={idMobilne}
          aria-label={teksty.rama.menuPrzewodnika}
          className="absolute inset-x-0 top-header z-31 max-h-[calc(100dvh-var(--spacing-header))] overflow-y-auto bg-brand p-3 text-on-brand"
        >
          <ListaPozycji
            pozycje={pozycje}
            biezaca={biezaca}
            zwiniete={false}
            onWybor={() => onZamknijMobilne(false)}
            logowanie={logowanie}
          />
        </nav>
        <div
          aria-hidden="true"
          onClick={() => onZamknijMobilne(false)}
          className="absolute inset-x-0 top-header bottom-0 z-30 bg-overlay"
        />
      </div>
    </>
  );
}
