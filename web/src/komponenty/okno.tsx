'use client';

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode, type SyntheticEvent } from 'react';
import { PrzyciskIkona } from '@/komponenty/przycisk-ikona';
import { teksty } from '@/teksty';

interface WspolneOkna {
  otwarte: boolean;
  onZamknij: () => void;
  tytul: string;
  opis?: ReactNode;
  children: ReactNode;
  stopka?: ReactNode;
  zamykanieZablokowane?: boolean;
  szerokosc?: 'standard' | 'szeroka';
  etykietaZamkniecia?: string;
  komunikat?: ReactNode;
  id?: string;
  className?: string;
}

export type ArkuszProps = WspolneOkna;
export type OknoModalneProps = WspolneOkna;

const klasySzerokosci = {
  standard: 'max-w-okno',
  szeroka: 'max-w-okno-szerokie',
} as const;

const SELEKTOR_FOKUSU = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function elementyFokusu(kontener: HTMLElement): HTMLElement[] {
  return Array.from(kontener.querySelectorAll<HTMLElement>(SELEKTOR_FOKUSU)).filter(
    (el) => !el.closest('[hidden]') && !el.closest('[inert]') && el.getClientRects().length > 0,
  );
}

function Okno({
  rodzaj,
  otwarte,
  onZamknij,
  tytul,
  opis,
  children,
  stopka,
  zamykanieZablokowane = false,
  szerokosc = 'standard',
  etykietaZamkniecia,
  komunikat,
  id,
  className,
}: WspolneOkna & { rodzaj: 'arkusz' | 'okno' }) {
  const auto = useId();
  const baza = id ?? auto;
  const idTytulu = `${baza}-tytul`;
  const idOpisu = `${baza}-opis`;
  const dialog = useRef<HTMLDialogElement>(null);
  const naglowek = useRef<HTMLHeadingElement>(null);
  const poprzedniFokus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (otwarte && !el.open) {
      poprzedniFokus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      el.showModal();
      naglowek.current?.focus();
    } else if (!otwarte && el.open) {
      el.close();
      poprzedniFokus.current?.focus();
      poprzedniFokus.current = null;
    }
  }, [otwarte]);

  useEffect(() => {
    const el = dialog.current;
    return () => {
      if (el?.open) {
        el.close();
        poprzedniFokus.current?.focus();
      }
    };
  }, []);

  function obsluzAnulowanie(e: SyntheticEvent<HTMLDialogElement>) {
    e.preventDefault();
    if (!zamykanieZablokowane) onZamknij();
  }

  function obsluzKlawisz(e: KeyboardEvent<HTMLDialogElement>) {
    if (e.key !== 'Tab' || !dialog.current) return;
    const elementy = elementyFokusu(dialog.current);
    if (elementy.length === 0) {
      e.preventDefault();
      naglowek.current?.focus();
      return;
    }
    const pierwszy = elementy[0];
    const ostatni = elementy[elementy.length - 1];
    const aktywny = document.activeElement;
    if (e.shiftKey && (aktywny === pierwszy || aktywny === naglowek.current || aktywny === dialog.current)) {
      e.preventDefault();
      ostatni.focus();
    } else if (!e.shiftKey && aktywny === ostatni) {
      e.preventDefault();
      pierwszy.focus();
    }
  }

  return (
    <dialog
      ref={dialog}
      id={id}
      data-rodzaj={rodzaj}
      aria-modal="true"
      aria-labelledby={idTytulu}
      aria-describedby={opis ? idOpisu : undefined}
      onCancel={obsluzAnulowanie}
      onKeyDown={obsluzKlawisz}
      className={[
        'm-auto box-border max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] overflow-y-auto rounded-sm border-0 bg-surface-card p-5 text-ink',
        klasySzerokosci[szerokosc],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 ref={naglowek} id={idTytulu} tabIndex={-1} className="m-0 min-w-0 text-section-title text-ink outline-none">
          {tytul}
        </h2>
        <PrzyciskIkona
          ksztalt="okragly"
          ikona="zamknij"
          etykieta={etykietaZamkniecia ?? teksty.wspolne.przyciski.zamknij}
          onClick={onZamknij}
          disabled={zamykanieZablokowane}
          className="flex-none"
        />
      </div>
      {komunikat ? <div className="mt-6">{komunikat}</div> : null}
      <div className="mt-6 flex flex-col gap-4">
        {opis ? (
          <div id={idOpisu} className="text-body">
            {opis}
          </div>
        ) : null}
        {children}
      </div>
      {stopka ? (
        // Stopka przykleja się do dołu przewijanego okna, więc akcje są widoczne przy długiej treści.
        <div className="sticky bottom-0 -mx-5 -mb-5 mt-3.5 flex flex-wrap gap-4 bg-surface-card px-5 pt-4 pb-5">{stopka}</div>
      ) : null}
    </dialog>
  );
}

// Arkusz zbiera decyzję albo dane.
export function Arkusz(props: ArkuszProps) {
  return <Okno rodzaj="arkusz" {...props} />;
}

// Okno modalne pokazuje treść.
export function OknoModalne(props: OknoModalneProps) {
  return <Okno rodzaj="okno" {...props} />;
}
