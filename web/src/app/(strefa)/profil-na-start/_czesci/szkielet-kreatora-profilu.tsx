'use client';

// Część Profilu na start: wspólny szkielet kreatora (kontrakt 11.2, u07: postęp, lista kroków, przyciski).
// Gospodarze: ekrany kreatora profilu u07, u10, u11, u19 (tryb profilu) i u24. Widok kroku renderuje w nim
// swoje pola, a walidację i zapis szkicu wykonuje w onDalej.
// Zaślepka fundamentu: implementuje u07. Właściciel zastępuje treść z zachowaniem nazwy eksportu i propsów
// i może dodać propsy opcjonalne. Zaślepka renderuje treść kroku i przyciski Wróć i Przejdź dalej.
import type { ReactNode } from 'react';
import type { IdWidoku } from '@/domena/typy';
import { Przycisk } from '@/komponenty/przycisk';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

export interface SzkieletKreatoraProfiluProps {
  /** Bieżący ekran kreatora, jeden z `EKRANY_PROFILU`. */
  biezacy: IdWidoku;
  /** Treść kroku: pola formularza i komunikaty kroku. */
  children: ReactNode;
  /** Przejście dalej po walidacji i zapisie szkicu; bez propsa przycisk nie występuje. */
  onDalej?: () => void;
  /** Powrót do poprzedniego ekranu; bez propsa przycisk nie występuje. */
  onWroc?: () => void;
  /** Etykieta przycisku dalej, domyślnie `teksty.wspolne.przyciski.dalej`. */
  etykietaDalej?: string;
  /** Blokada przycisków w trakcie zapisu. */
  zajety?: boolean;
}

export function SzkieletKreatoraProfilu({ biezacy, children, onDalej, onWroc, etykietaDalej, zajety }: SzkieletKreatoraProfiluProps) {
  return (
    <Stos odstep={7.5} id={`kreator-${biezacy}`}>
      {children}
      {onDalej || onWroc ? (
        <Wiersz odstep={4} className="flex-wrap">
          {onWroc ? (
            <Przycisk wariant="drugorzedny" ikona="w-lewo" onClick={onWroc} disabled={zajety}>
              {teksty.wspolne.przyciski.wroc}
            </Przycisk>
          ) : null}
          {onDalej ? (
            <Przycisk wariant="glowny" ikonaPo="w-prawo" onClick={onDalej} zajety={zajety}>
              {etykietaDalej ?? teksty.wspolne.przyciski.dalej}
            </Przycisk>
          ) : null}
        </Wiersz>
      ) : null}
    </Stos>
  );
}
