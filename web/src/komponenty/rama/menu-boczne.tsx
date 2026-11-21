'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import type { IdWidoku, Pochodzenie, Rola } from '@/domena/typy';
import { useKonto, useStanInterfejsu } from '@/dane/magazyn/hooki';
import { ustawStanInterfejsu } from '@/dane/magazyn/stan';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { dopasujTrase, widokMenuDlaPochodzenia } from '@/komponenty/rama/mapa-tras';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
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

// Parametr ?z= nadpisuje wyróżnienie na ViewCaseDetails i ViewCaseGuide (sekcja 3.2).
function useBiezacaPozycja(pozycje: PozycjaMenu[]): IdWidoku | undefined {
  const sciezka = usePathname();
  const z = useSearchParams().get('z');
  const wpis = dopasujTrase(sciezka);
  if (wpis) {
    const zPochodzenia = z === null ? undefined : widokMenuDlaPochodzenia[z as Pochodzenie];
    if ((wpis.idWidoku === 'ViewCaseDetails' || wpis.idWidoku === 'ViewCaseGuide') && zPochodzenia) return zPochodzenia;
    return wpis.pozycjaMenu;
  }
  return pozycje.find((p) => sciezka === sciezkaWidoku(p.idWidoku))?.idWidoku;
}

const klasyPozycji = {
  biezaca: 'bg-surface-card text-brand hover:text-brand cursor-default',
  zwykla: 'text-on-brand hover:bg-brand-raised hover:text-on-brand active:bg-brand-deep active:text-on-brand',
} as const;

function ListaPozycji({
  pozycje,
  biezaca,
  zwiniete,
  onWybor,
}: {
  pozycje: PozycjaMenu[];
  biezaca: IdWidoku | undefined;
  zwiniete: boolean;
  onWybor?: () => void;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {pozycje.map((p) => {
        const jestBiezaca = p.idWidoku === biezaca;
        return (
          <li key={p.idWidoku}>
            <Link
              href={sciezkaWidoku(p.idWidoku)}
              aria-current={jestBiezaca ? 'page' : undefined}
              onClick={onWybor}
              className={`flex min-h-nav-item items-center gap-3 rounded-sm text-body no-underline transition-colors duration-150 focus-visible:outline-on-brand motion-reduce:transition-none ${zwiniete ? 'justify-center px-0' : 'px-4'} ${jestBiezaca ? klasyPozycji.biezaca : klasyPozycji.zwykla}`}
            >
              <Ikona nazwa={p.ikona} rozmiar={24} />
              <span className={zwiniete ? 'sr-only' : 'min-w-0'}>{p.etykieta}</span>
            </Link>
          </li>
        );
      })}
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
  // Stan zwinięcia menu na lg zapisuje ppm:v1:ui (sekcja 6.2).
  const { menuZwiniete } = useStanInterfejsu();
  const przelaczZwiniecieMenu = () => ustawStanInterfejsu({ menuZwiniete: !menuZwiniete });
  const pozycje = konto ? pozycjeRoli[konto.rola] : [];
  const biezaca = useBiezacaPozycja(pozycje);

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
        <ListaPozycji pozycje={pozycje} biezaca={biezaca} zwiniete={menuZwiniete} />
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
          className="absolute inset-x-0 top-header z-31 bg-brand p-3 text-on-brand"
        >
          <ListaPozycji pozycje={pozycje} biezaca={biezaca} zwiniete={false} onWybor={() => onZamknijMobilne(false)} />
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
