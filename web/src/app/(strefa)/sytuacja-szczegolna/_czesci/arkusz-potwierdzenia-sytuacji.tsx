'use client';

// SheetSpecialSituationConfirm (kontrakt, tabela 2.3; wzór P22-03): arkusz „Sprawdź i zapisz” na ViewSpecialSituation
// z rodzajem sytuacji, datą zdarzenia i liczbą dzieci, akcjami Wróć i Zapisz. Właściciel: u25.
import type { ReactNode } from 'react';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { formatujDate } from '@/domena/daty';
import type { ZgloszenieSytuacji } from '@/domena/rodzina/sytuacje';
import { teksty } from '@/teksty';

const t = teksty.SheetSpecialSituationConfirm;

export interface ArkuszPotwierdzeniaSytuacjiProps {
  otwarte: boolean;
  onZamknij: () => void;
  zgloszenie?: ZgloszenieSytuacji | null;
  onZapisz?: () => void;
  zajety?: boolean;
  komunikat?: ReactNode;
}

export function ArkuszPotwierdzeniaSytuacji({
  otwarte,
  onZamknij,
  zgloszenie = null,
  onZapisz,
  zajety = false,
  komunikat,
}: ArkuszPotwierdzeniaSytuacjiProps) {
  return (
    <Arkusz
      otwarte={otwarte && zgloszenie !== null}
      onZamknij={onZamknij}
      tytul={t.tytul}
      komunikat={komunikat}
      zamykanieZablokowane={zajety}
      stopka={
        <div className="flex flex-wrap justify-between gap-4">
          <Przycisk type="button" wariant="drugorzedny" onClick={onZamknij} disabled={zajety}>
            {teksty.wspolne.przyciski.wroc}
          </Przycisk>
          <Przycisk type="button" wariant="glowny" onClick={onZapisz} zajety={zajety}>
            {teksty.wspolne.przyciski.zapisz}
          </Przycisk>
        </div>
      }
    >
      {zgloszenie ? (
        <div className="flex min-w-0 flex-col gap-6">
          <ListaDefinicji
            szerokoscEtykiety="waska"
            pozycje={[
              { etykieta: t.rodzaj, wartosc: teksty.ViewSpecialSituation.rodzaje[zgloszenie.rodzaj] },
              { etykieta: t.data, wartosc: formatujDate(zgloszenie.dataZdarzenia) },
              { etykieta: t.liczba, wartosc: String(zgloszenie.liczbaDzieci) },
            ]}
          />
          <p className="m-0">{t.opis}</p>
        </div>
      ) : null}
    </Arkusz>
  );
}
