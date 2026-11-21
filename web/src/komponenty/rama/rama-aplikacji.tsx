'use client';

// ez-shell ramy strefy (kontrakt, sekcja 3.1). Na trasach gościa (kalkulator zasiłku i przykładowe sprawy) rama
// bez zalogowanego konta pokazuje nagłówek z przyciskiem „Zaloguj się”, menu gościa, bez asystenta AI, bez odczytu
// danych ZUS i bez synchronizacji rodziny.
// Treść strony (children) przechodzi wyłącznie przez komponenty bez use(browser()), więc segment strony
// renderuje się podczas prerenderu i walidacji natychmiastowej nawigacji. Części ramy, które czytają
// magazyn hookami z use(browser()), leżą w osobnych granicach <Suspense> obok treści.
import { usePathname } from 'next/navigation';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { PanelAsystenta } from '@/app/(strefa)/_asystent/panel';
import { sprzatnijPoGosciach } from '@/dane/magazyn/gosc';
import { useCzyGosc, useKonto, useStanSesji } from '@/dane/magazyn/hooki';
import { zapiszStanSesji } from '@/dane/magazyn/operacje/sesja';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Ikona } from '@/komponenty/ikona';
import { DostawcaKomunikatowChwilowych } from '@/komponenty/komunikat-chwilowy';
import { AktywnoscSesji } from '@/komponenty/rama/aktywnosc-sesji';
import { DostawcaKomunikatowPoPrzejsciu } from '@/komponenty/rama/komunikaty-po-przejsciu';
import { LinkDoTresci } from '@/komponenty/rama/link-do-tresci';
import { MenuBoczne } from '@/komponenty/rama/menu-boczne';
import { Logo, Naglowek } from '@/komponenty/rama/naglowek';
import { OdczytPrzyOtwarciu } from '@/komponenty/rama/odczyt-przy-otwarciu';
import { StrazDostepu, useEkranStartowy } from '@/komponenty/rama/straz-dostepu';
import { SynchronizacjaRodziny } from '@/komponenty/rama/synchronizacja-rodziny';
import { teksty } from '@/teksty';

const ID_MENU_MOBILNEGO = 'menu-mobilne';
const ID_PANELU_ASYSTENTA = 'panel-asystenta';

export interface PrzyciskAsystentaProps {
  otwarty: boolean;
  onPrzelacz: () => void;
}

// pr-assistant-fab: prawy dolny róg każdego ekranu strefy dla ról NU, R i DR.
export function PrzyciskAsystenta({ otwarty, onPrzelacz }: PrzyciskAsystentaProps) {
  return (
    <button
      type="button"
      aria-label={teksty.rama.asystent}
      aria-expanded={otwarty}
      aria-controls={ID_PANELU_ASYSTENTA}
      onClick={onPrzelacz}
      className="fixed right-6 bottom-6 z-20 grid size-15 cursor-pointer place-items-center rounded-full border-3 border-surface-card bg-brand p-0 text-on-brand transition-colors duration-150 hover:bg-brand-deep active:bg-brand-deep motion-reduce:transition-none print:hidden"
    >
      <Ikona nazwa="asystent" className="size-7" />
    </button>
  );
}

// Logo prowadzi do ekranu startowego roli zalogowanego konta.
function LogoStrefy() {
  return <Logo href={useEkranStartowy()} />;
}

// Przycisk i panel asystenta dla ról NU, R i DR (sekcja 3.3). Stan panelu trwa do końca sesji
// (StanSesji.panelAsystenta).
function AsystentRamy() {
  const konto = useKonto();
  const panelAsystenta = useStanSesji()?.panelAsystenta;
  if (konto === null || konto.rola === 'administrator') return null;

  const otwarty = panelAsystenta?.otwarty ?? false;
  const ustawOtwarcie = (wartosc: boolean) => {
    zapiszStanSesji({ panelAsystenta: { szkic: '', ...panelAsystenta, otwarty: wartosc } }, pobierzKontekstOperacji());
  };

  return (
    <>
      <PrzyciskAsystenta otwarty={otwarty} onPrzelacz={() => ustawOtwarcie(!otwarty)} />
      <PanelAsystenta id={ID_PANELU_ASYSTENTA} otwarty={otwarty} onZamknij={() => ustawOtwarcie(false)} />
    </>
  );
}

// Odczyt danych ZUS przy otwarciu i synchronizacja rodziny dotyczą wyłącznie zalogowanego konta.
function UslugiKonta() {
  if (useCzyGosc()) return null;
  return (
    <>
      <OdczytPrzyOtwarciu />
      <SynchronizacjaRodziny />
    </>
  );
}

// Zastępstwo menu bocznego od lg na czas odczytu magazynu.
function SzkieletMenu() {
  return <div aria-hidden="true" className="hidden w-sidebar bg-brand lg:block" />;
}

export function RamaAplikacji({ children }: { children: React.ReactNode }) {
  const sciezka = usePathname();
  const [menuMobilne, setMenuMobilne] = useState({ otwarte: false, sciezka });
  const kontenerPrzyciskuMenu = useRef<HTMLDivElement>(null);

  // Zmiana ścieżki zamyka menu mobilne.
  if (menuMobilne.sciezka !== sciezka) setMenuMobilne({ otwarte: false, sciezka });

  // Pliki gości z zamkniętych kart i pliki po 24 godzinach znikają po otwarciu ramy.
  useEffect(() => {
    void sprzatnijPoGosciach(pobierzKontekstOperacji());
  }, []);

  const zamknijMenuMobilne = useCallback(
    (zwrocFokus: boolean) => {
      setMenuMobilne({ otwarte: false, sciezka });
      if (zwrocFokus) kontenerPrzyciskuMenu.current?.querySelector<HTMLElement>(`[aria-controls="${ID_MENU_MOBILNEGO}"]`)?.focus();
    },
    [sciezka],
  );

  return (
    <DostawcaKomunikatowChwilowych>
      <DostawcaKomunikatowPoPrzejsciu>
        <AktywnoscSesji />
        <Suspense fallback={null}>
          <UslugiKonta />
        </Suspense>
        <div
          ref={kontenerPrzyciskuMenu}
          className="relative grid min-h-dvh grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] lg:grid-cols-[auto_minmax(0,1fr)]"
        >
          <LinkDoTresci />
          <Naglowek
            className="col-span-full"
            logo={
              <Suspense fallback={<Logo href="/" />}>
                <LogoStrefy />
              </Suspense>
            }
            menuOtwarte={menuMobilne.otwarte}
            onPrzelaczMenu={() => setMenuMobilne((m) => ({ ...m, otwarte: !m.otwarte }))}
            idMenu={ID_MENU_MOBILNEGO}
          />
          <Suspense fallback={<SzkieletMenu />}>
            <MenuBoczne
              idMobilne={ID_MENU_MOBILNEGO}
              mobilneOtwarte={menuMobilne.otwarte}
              onZamknijMobilne={zamknijMenuMobilne}
            />
          </Suspense>
          <main id="tresc" className="min-w-0 px-4 pt-6 pb-16 lg:px-16">
            <div className="max-w-tresc min-w-0">
              <StrazDostepu>{children}</StrazDostepu>
            </div>
          </main>
        </div>
        <Suspense fallback={null}>
          <AsystentRamy />
        </Suspense>
      </DostawcaKomunikatowPoPrzejsciu>
    </DostawcaKomunikatowChwilowych>
  );
}
