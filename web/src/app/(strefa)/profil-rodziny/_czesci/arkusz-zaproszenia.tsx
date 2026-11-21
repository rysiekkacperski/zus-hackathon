'use client';

// SheetInviteSecondParent (kontrakt, tabela 2.3): arkusz na ViewProfileSummary (slot drugiego rodzica). Właściciel: u23.
// Teksty: teksty.SheetInviteSecondParent. Wzór: cz2/P19-02-Zaproszenie-link.
// Arkusz pokazuje gotowy link zaproszenia utworzonego przez slot (operacja utworzZaproszenie), datę ważności,
// kopiowanie do schowka i udostępnienie systemowe z kopiowaniem jako wariantem zastępczym.
import { useRef } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { formatujDate } from '@/komponenty/format';
import { Notatka } from '@/komponenty/notatka';
import { Arkusz } from '@/komponenty/okno';
import { klasyOdstepuPolaWpisu, klasyPolaWpisu, klasySzerokosciPola } from '@/komponenty/pole';
import { Przycisk } from '@/komponenty/przycisk';
import type { DataISO } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.SheetInviteSecondParent;

export interface ArkuszZaproszeniaProps {
  otwarte: boolean;
  onZamknij: () => void;
  /** Pełny adres linku zaproszenia. */
  link?: string;
  /** Ostatni dzień ważności linku. */
  wazneDo?: DataISO;
}

export function ArkuszZaproszenia({ otwarte, onZamknij, link = '', wazneDo }: ArkuszZaproszeniaProps) {
  const pole = useRef<HTMLInputElement>(null);
  const { pokaz } = useKomunikatChwilowy();

  function zaznaczLink() {
    pole.current?.focus();
    pole.current?.select();
    pokaz(t.zaznaczono);
  }

  async function kopiuj() {
    try {
      await navigator.clipboard.writeText(link);
      pokaz(t.skopiowano);
    } catch {
      zaznaczLink();
    }
  }

  async function udostepnij() {
    if (typeof navigator.share !== 'function') {
      await kopiuj();
      return;
    }
    try {
      await navigator.share({ title: t.tytulUdostepnienia, text: t.trescUdostepnienia, url: link });
    } catch (blad) {
      // Rezygnacja z okna udostępniania nie wymaga reakcji; inny błąd prowadzi do kopiowania.
      if (!(blad instanceof DOMException && blad.name === 'AbortError')) await kopiuj();
    }
  }

  return (
    <Arkusz otwarte={otwarte} onZamknij={onZamknij} tytul={t.tytul} opis={t.opis} komunikat={<Komunikat kod="0065" />}>
      <div className="flex min-w-0 flex-col">
        <label htmlFor="link-zaproszenia" className="mb-2 text-body-strong text-ink">
          {t.etykietaLinku}
        </label>
        <input
          ref={pole}
          id="link-zaproszenia"
          type="text"
          readOnly
          value={link}
          aria-describedby="link-zaproszenia-waznosc"
          onFocus={(e) => e.currentTarget.select()}
          className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu} ${klasySzerokosciPola.pelna}`}
        />
        {wazneDo ? (
          <p id="link-zaproszenia-waznosc" className="m-0 mt-2 text-body">
            {t.waznyDo} <strong className="font-semibold text-ink-strong">{formatujDate(wazneDo)}</strong>
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-4">
        <Przycisk wariant="glowny" ikona="kopiuj" onClick={() => void kopiuj()}>
          {t.kopiuj}
        </Przycisk>
        <Przycisk wariant="drugorzedny" ikona="udostepnij" onClick={() => void udostepnij()}>
          {t.udostepnij}
        </Przycisk>
      </div>
      <Notatka>{t.notatka}</Notatka>
    </Arkusz>
  );
}
