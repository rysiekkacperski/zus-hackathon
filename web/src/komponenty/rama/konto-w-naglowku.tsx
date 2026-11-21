'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { useCzyGosc, useKonto } from '@/dane/magazyn/hooki';
import { wyloguj } from '@/dane/magazyn/operacje/konto';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Ikona } from '@/komponenty/ikona';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaLogowaniaZPowrotem, sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

/** Adres logowania z powrotem na bieżący ekran z zapytaniem (tryb gościa). */
export function useSciezkaLogowania(): string {
  const sciezka = usePathname();
  const zapytanie = useSearchParams().toString();
  return sciezkaLogowaniaZPowrotem(zapytanie ? `${sciezka}?${zapytanie}` : sciezka);
}

// Tryb gościa: przycisk „Zaloguj się” w miejscu konta prowadzi do strony startowej z powrotem na bieżący ekran.
function ZalogujWNaglowku() {
  const href = useSciezkaLogowania();
  return (
    <div className="flex items-center px-3 md:border-l md:border-line md:pr-7.5 md:pl-6">
      <PrzyciskLink href={href} wariant="glowny" ikona="konto">
        {teksty.rama.zalogujSie}
      </PrzyciskLink>
    </div>
  );
}

/** Obszar konta w nagłówku: menu zalogowanego konta albo przycisk logowania gościa. */
export function KontoLubLogowanie() {
  return useCzyGosc() ? <ZalogujWNaglowku /> : <KontoWNaglowku />;
}

const klasyPozycji =
  'flex w-full items-center gap-3 px-5 py-3 text-left text-body-strong text-brand no-underline hover:bg-brand-tint hover:text-brand-deep focus-visible:-outline-offset-2';

// ez-account z menu konta pr-account-menu (role="menu").
export function KontoWNaglowku() {
  const router = useRouter();
  const konto = useKonto();
  const [otwarte, setOtwarte] = useState(false);
  const idMenu = useId();
  const kontener = useRef<HTMLDivElement>(null);
  const przycisk = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!otwarte) return;
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const poKliknieciu = (e: PointerEvent) => {
      if (!kontener.current?.contains(e.target as Node)) setOtwarte(false);
    };
    document.addEventListener('pointerdown', poKliknieciu);
    return () => document.removeEventListener('pointerdown', poKliknieciu);
  }, [otwarte]);

  if (!konto) return null;

  const imieINazwisko = `${konto.imie} ${konto.nazwisko}`;
  const pokazUstawienia = konto.rola !== 'administrator';

  // Wylogowanie kończy sesję, usuwa dane sesji i przechodzi na stronę startową (sekcja 3.4).
  const wylogujSie = () => {
    wyloguj(pobierzKontekstOperacji());
    router.replace(sciezkaWidoku('ViewGuideStart'));
  };

  const zamknij = (zwrocFokus: boolean) => {
    setOtwarte(false);
    if (zwrocFokus) przycisk.current?.focus();
  };

  const naKlawiszMenu = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const pozycje = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const biezaca = pozycje.indexOf(document.activeElement as HTMLElement);
    const przejdz = (indeks: number) => {
      e.preventDefault();
      pozycje[(indeks + pozycje.length) % pozycje.length]?.focus();
    };
    if (e.key === 'ArrowDown') przejdz(biezaca + 1);
    else if (e.key === 'ArrowUp') przejdz(biezaca - 1);
    else if (e.key === 'Home') przejdz(0);
    else if (e.key === 'End') przejdz(pozycje.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      zamknij(true);
    } else if (e.key === 'Tab') zamknij(false);
  };

  return (
    <div ref={kontener} className="relative flex items-stretch">
      <button
        ref={przycisk}
        type="button"
        aria-haspopup="menu"
        aria-expanded={otwarte}
        aria-controls={idMenu}
        aria-label={
          otwarte
            ? teksty.rama.kontoZamknijMenu({ imieINazwisko })
            : teksty.rama.kontoOtworzMenu({ imieINazwisko })
        }
        onClick={() => setOtwarte((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && otwarte) {
            e.preventDefault();
            zamknij(true);
          }
        }}
        className="flex cursor-pointer items-center gap-0 border-0 bg-transparent px-3 text-left text-brand md:gap-4 md:border-l md:border-line md:pr-5 md:pl-6"
      >
        <span className="grid size-10 flex-none place-items-center rounded-full bg-brand-muted text-on-brand md:size-avatar">
          <Ikona nazwa="konto" rozmiar={24} />
        </span>
        <span className="hidden min-w-0 md:block">
          <span className="block text-body-strong leading-[1.375rem]">{imieINazwisko}</span>
          <span className="block text-small">{teksty.rama.kontoPodpis}</span>
        </span>
        <Ikona nazwa="w-dol" rozmiar={24} className="hidden md:block" />
      </button>
      <div
        ref={menu}
        id={idMenu}
        role="menu"
        aria-label={teksty.rama.menuKonta}
        hidden={!otwarte}
        onKeyDown={naKlawiszMenu}
        className="absolute top-[calc(100%-0.25rem)] right-3 z-30 box-border max-w-[calc(100vw-1.5rem)] min-w-70 rounded-sm border border-line bg-surface-card py-2 md:right-7.5"
      >
        <div className="border-b border-line-row px-5 py-3">
          <p className="m-0 text-body-strong text-ink-strong">{imieINazwisko}</p>
          <p className="m-0 text-body">{teksty.rama.etykietyRol[konto.rola]}</p>
        </div>
        {pokazUstawienia ? (
          <Link
            role="menuitem"
            href={sciezkaWidoku('ViewGuideSettings')}
            onClick={() => zamknij(false)}
            className={klasyPozycji}
          >
            <Ikona nazwa="ustawienia" rozmiar={24} />
            {teksty.rama.ustawienia}
          </Link>
        ) : null}
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            zamknij(false);
            wylogujSie();
          }}
          className={`${klasyPozycji} cursor-pointer border-0 bg-transparent`}
        >
          <Ikona nazwa="wyloguj" rozmiar={24} />
          {teksty.rama.wyloguj}
        </button>
      </div>
    </div>
  );
}
