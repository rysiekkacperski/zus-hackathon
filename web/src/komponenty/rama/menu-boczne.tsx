'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { ETAPY } from '@/domena/plan/etap';
import type { Etap, IdWidoku, Pochodzenie, Rola } from '@/domena/typy';
import { useCzyGosc, useKonto, useStanInterfejsu } from '@/dane/magazyn/hooki';
import { ustawStanInterfejsu } from '@/dane/magazyn/stan';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { useSciezkaLogowania } from '@/komponenty/rama/konto-w-naglowku';
import { dopasujTrase, widokMenuDlaPochodzenia } from '@/komponenty/rama/mapa-tras';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

interface PozycjaMenu {
  idWidoku: IdWidoku;
  ikona: NazwaIkony;
  etykieta: string;
}

const planRodziny: PozycjaMenu = { idWidoku: 'ViewFamilyPlan', ikona: 'plan', etykieta: teksty.rama.menu.planRodziny };
const terminy: PozycjaMenu = { idWidoku: 'ViewDeadlines', ikona: 'kalendarz', etykieta: teksty.rama.menu.terminy };
const twojeWnioski: PozycjaMenu = { idWidoku: 'ViewApplicationList', ikona: 'wnioski', etykieta: teksty.rama.menu.twojeWnioski };
const kalkulator: PozycjaMenu = { idWidoku: 'ViewCalcMaternityInput', ikona: 'kalkulator', etykieta: teksty.rama.menu.kalkulator };
const przykladoweSprawy: PozycjaMenu = { idWidoku: 'ViewSampleCaseList', ikona: 'folder', etykieta: teksty.rama.menu.przykladoweSprawy };
const profilNaStart: PozycjaMenu = { idWidoku: 'ViewProfileZusData', ikona: 'profil', etykieta: teksty.rama.menu.profilNaStart };
const katalog: PozycjaMenu = { idWidoku: 'ViewCatalogList', ikona: 'katalog', etykieta: teksty.rama.menu.katalog };
const podmiotyWsparcia: PozycjaMenu = { idWidoku: 'ViewCatalogSupportOrganizations', ikona: 'serce', etykieta: teksty.rama.menu.podmiotyWsparcia };

// Sekcja 3.2 kontraktu.
const pozycjeRoli: Record<Rola, PozycjaMenu[]> = {
  rodzic: [planRodziny, terminy, twojeWnioski, kalkulator, przykladoweSprawy],
  'drugi-rodzic': [planRodziny, terminy, twojeWnioski, kalkulator, przykladoweSprawy],
  'nowy-uzytkownik': [profilNaStart, kalkulator, przykladoweSprawy],
  administrator: [katalog, podmiotyWsparcia],
};

// Tryb gościa: kalkulator zasiłku i przykładowe sprawy, a pod nimi pozycja „Zaloguj się”.
const pozycjeGoscia: PozycjaMenu[] = [kalkulator, przykladoweSprawy];

// Podsekcje pozycji „Plan rodziny”: pięć etapów planu, a pod nimi strony z danymi z konta ZUS.
interface PodsekcjaMenu {
  klucz: Etap | IdWidoku;
  href: string;
  etykieta: string;
}

const etykietyPodsekcji = teksty.rama.menu.podsekcjePlanu;
const podsekcjePlanu: readonly PodsekcjaMenu[] = [
  ...ETAPY.map((etap) => ({ klucz: etap, href: trasy.ViewFamilyPlanStage({ etap }), etykieta: etykietyPodsekcji[etap] })),
  { klucz: 'ViewPregnancyBenefits', href: trasy.ViewPregnancyBenefits(), etykieta: etykietyPodsekcji.swiadczeniaWCiazy },
  { klucz: 'ViewSickLeaveList', href: trasy.ViewSickLeaveList(), etykieta: etykietyPodsekcji.zaswiadczeniaEzla },
  { klucz: 'ViewContributionBalance', href: trasy.ViewContributionBalance(), etykieta: etykietyPodsekcji.stanRozliczenSkladek },
];
const widokiPodsekcji: readonly IdWidoku[] = ['ViewPregnancyBenefits', 'ViewSickLeaveList', 'ViewContributionBalance'];

function czyEtap(wartosc: string | null | undefined): wartosc is Etap {
  return ETAPY.includes(wartosc as Etap);
}

interface Biezace {
  /** Wyróżniona pozycja menu. */
  pozycja: IdWidoku | undefined;
  /** Widok bieżącej trasy. */
  widok: IdWidoku | undefined;
  /** Wyróżniona podsekcja „Plan rodziny”: etap albo widok. */
  podsekcja: Etap | IdWidoku | undefined;
}

// Parametr ?z= nadpisuje wyróżnienie na ViewCaseDetails i ViewCaseGuide (sekcja 3.2), a parametr ?etap=
// wyróżnia etap, z którego rodzic wszedł do sprawy.
function useBiezace(pozycje: PozycjaMenu[]): Biezace {
  const sciezka = usePathname();
  const zapytanie = useSearchParams();
  const z = zapytanie.get('z');
  const wpis = dopasujTrase(sciezka);
  if (wpis) {
    const zPochodzenia = z === null ? undefined : widokMenuDlaPochodzenia[z as Pochodzenie];
    const sprawa = wpis.idWidoku === 'ViewCaseDetails' || wpis.idWidoku === 'ViewCaseGuide';
    const pozycja = sprawa && zPochodzenia ? zPochodzenia : wpis.pozycjaMenu;
    const etap = wpis.idWidoku === 'ViewFamilyPlanStage' ? wpis.parametry.etap : sprawa && pozycja === 'ViewFamilyPlan' ? zapytanie.get('etap') : null;
    const podsekcja = widokiPodsekcji.includes(wpis.idWidoku) ? wpis.idWidoku : czyEtap(etap) ? etap : undefined;
    return { pozycja, widok: wpis.idWidoku, podsekcja };
  }
  const pozycja = pozycje.find((p) => sciezka === sciezkaWidoku(p.idWidoku))?.idWidoku;
  return { pozycja, widok: pozycja, podsekcja: undefined };
}

type StanPozycji = 'biezaca' | 'rodzic' | 'zwykla';

const klasyPozycji: Record<StanPozycji, string> = {
  biezaca: 'bg-surface-card text-brand hover:text-brand cursor-default',
  // Pozycja „Plan rodziny” na stronie podsekcji: pogrubiona, bez tła.
  rodzic: 'font-semibold text-on-brand hover:bg-brand-raised hover:text-on-brand active:bg-brand-deep active:text-on-brand',
  zwykla: 'text-on-brand hover:bg-brand-raised hover:text-on-brand active:bg-brand-deep active:text-on-brand',
};

const ariaCurrent: Record<StanPozycji, 'page' | 'true' | undefined> = { biezaca: 'page', rodzic: 'true', zwykla: undefined };

function klasyLinku(zwiniete: boolean, stan: StanPozycji): string {
  return `flex min-h-nav-item items-center gap-3 rounded-sm text-body no-underline transition-colors duration-150 focus-visible:outline-on-brand motion-reduce:transition-none ${zwiniete ? 'justify-center px-0' : 'px-4'} ${klasyPozycji[stan]}`;
}

function klasyPodsekcji(jestBiezaca: boolean): string {
  return `flex min-h-9 items-center rounded-sm py-1 pr-3 pl-15 text-small no-underline transition-colors duration-150 focus-visible:outline-on-brand motion-reduce:transition-none ${jestBiezaca ? klasyPozycji.biezaca : klasyPozycji.zwykla}`;
}

function ListaPodsekcji({ biezaca, onWybor }: { biezaca: Biezace['podsekcja']; onWybor?: () => void }) {
  return (
    <ul className="m-0 mt-1 flex list-none flex-col gap-0.5 p-0">
      {podsekcjePlanu.map((p) => {
        const jestBiezaca = p.klucz === biezaca;
        return (
          <li key={p.klucz}>
            <Link
              href={p.href}
              aria-current={jestBiezaca ? 'page' : undefined}
              onClick={onWybor}
              className={klasyPodsekcji(jestBiezaca)}
            >
              <span className="min-w-0">{p.etykieta}</span>
            </Link>
          </li>
        );
      })}
    </ul>
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
        // Podsekcje „Plan rodziny” widać w menu rozwiniętym i mobilnym; w menu zwiniętym są ukryte.
        const zPodsekcjami = p.idWidoku === 'ViewFamilyPlan' && !zwiniete;
        const stan: StanPozycji =
          p.idWidoku !== biezaca.pozycja ? 'zwykla' : zPodsekcjami && biezaca.widok !== p.idWidoku ? 'rodzic' : 'biezaca';
        return (
          <li key={p.idWidoku}>
            <Link
              href={sciezkaWidoku(p.idWidoku)}
              aria-current={ariaCurrent[stan]}
              onClick={onWybor}
              className={klasyLinku(zwiniete, stan)}
            >
              <Ikona nazwa={p.ikona} rozmiar={24} />
              <span className={zwiniete ? 'sr-only' : 'min-w-0'}>{p.etykieta}</span>
            </Link>
            {zPodsekcjami ? <ListaPodsekcji biezaca={biezaca.podsekcja} onWybor={onWybor} /> : null}
          </li>
        );
      })}
      {logowanie === undefined ? null : (
        <li>
          <Link href={logowanie} onClick={onWybor} className={klasyLinku(zwiniete, 'zwykla')}>
            <Ikona nazwa="konto" rozmiar={24} />
            <span className={zwiniete ? 'sr-only' : 'min-w-0'}>{teksty.rama.zalogujSie}</span>
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
        className={`hidden flex-col bg-brand px-3 pt-3 text-on-brand lg:flex ${menuZwiniete ? 'w-sidebar-zwiniety' : 'w-sidebar'}`}
      >
        <ListaPozycji pozycje={pozycje} biezaca={biezaca} zwiniete={menuZwiniete} logowanie={logowanie} />
        {/* Przycisk zwijania: ostatni element menu, przyklejony do dołu widocznego obszaru menu. */}
        <div className="sticky bottom-0 mt-auto border-t border-brand-muted bg-brand pt-3 pb-3">
          <button
            type="button"
            aria-expanded={!menuZwiniete}
            onClick={przelaczZwiniecieMenu}
            className={`flex min-h-nav-item w-full cursor-pointer items-center gap-3 rounded-sm border-0 bg-transparent text-body text-on-brand transition-colors duration-150 hover:bg-brand-raised active:bg-brand-deep focus-visible:outline-on-brand motion-reduce:transition-none ${menuZwiniete ? 'justify-center px-0' : 'px-4'}`}
          >
            <Ikona nazwa={menuZwiniete ? 'w-prawo' : 'w-lewo'} rozmiar={24} />
            <span className={menuZwiniete ? 'sr-only' : 'min-w-0'}>
              {menuZwiniete ? teksty.rama.rozwinMenu : teksty.rama.zwinMenu}
            </span>
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
