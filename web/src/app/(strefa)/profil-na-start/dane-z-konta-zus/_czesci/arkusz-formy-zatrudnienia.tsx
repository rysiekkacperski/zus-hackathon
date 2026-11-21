'use client';

// SheetEmploymentChoice (kontrakt, tabela 2.3): arkusz na ViewProfileZusData. Właściciel: u07.
// Wzór cz1/P03-04: lista czterech form zatrudnienia z oznaczeniem „Z konta ZUS” przy formie odczytanej
// z konta ZUS, zaznaczona bieżąca forma (KA-07 3.3.1.1.1), akcje Anuluj i Wybierz, zamknięcie ikoną.
import { useState } from 'react';
import type { FormaZatrudnienia } from '@/domena/typy';
import { GrupaOpcji, idOpcjiGrupy, type OpcjaGrupy } from '@/komponenty/grupa-opcji';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const tekst = teksty.SheetEmploymentChoice;
const formy = teksty.ViewProfileZusData.kreator.formy;

const FORMY: FormaZatrudnienia[] = ['umowa-o-prace', 'umowa-zlecenia', 'jdg', 'brak-tytulu'];
const NAZWA_GRUPY = 'arkusz-forma-zatrudnienia';

export interface ArkuszFormyZatrudnieniaProps {
  otwarte: boolean;
  onZamknij: () => void;
  /** Forma zaznaczona przy otwarciu (bieżąca forma na ekranie). */
  wybrana?: FormaZatrudnienia | null;
  /** Forma odczytana z konta ZUS, oznaczona „Z konta ZUS”; null bez danych z konta ZUS. */
  zKontaZus?: FormaZatrudnienia | null;
  /** Wybór formy akcją Wybierz. */
  onWybor?: (forma: FormaZatrudnienia) => void;
}

function TrescArkusza({ wybrana, zKontaZus, onWybor, onZamknij }: Omit<ArkuszFormyZatrudnieniaProps, 'otwarte'>) {
  const [forma, ustawForme] = useState<FormaZatrudnienia | null>(wybrana ?? null);
  const [blad, ustawBlad] = useState<'0006' | null>(null);

  const opcje: OpcjaGrupy<FormaZatrudnienia>[] = FORMY.map((f) => ({
    wartosc: f,
    etykieta: formy[f],
    znacznik: zKontaZus === f ? tekst.znacznikZKonta : undefined,
  }));

  const wybierz = () => {
    if (forma === null) {
      ustawBlad('0006');
      document.getElementById(idOpcjiGrupy(NAZWA_GRUPY, FORMY[0]))?.focus();
      return;
    }
    onWybor?.(forma);
    onZamknij();
  };

  return (
    <Arkusz
      otwarte
      onZamknij={onZamknij}
      tytul={tekst.tytul}
      opis={<p className="m-0">{zKontaZus ? tekst.opis : tekst.opisBezDanych}</p>}
      stopka={
        <div className="flex w-full flex-wrap justify-between gap-4">
          <Przycisk wariant="drugorzedny" onClick={onZamknij}>
            {teksty.wspolne.przyciski.anuluj}
          </Przycisk>
          <Przycisk wariant="glowny" onClick={wybierz}>
            {teksty.wspolne.przyciski.wybierz}
          </Przycisk>
        </div>
      }
    >
      <GrupaOpcji
        nazwa={NAZWA_GRUPY}
        legenda={tekst.legenda}
        opcje={opcje}
        wartosc={forma}
        onZmiana={(f) => {
          ustawForme(f);
          ustawBlad(null);
        }}
        blad={blad}
      />
    </Arkusz>
  );
}

export function ArkuszFormyZatrudnienia({ otwarte, ...props }: ArkuszFormyZatrudnieniaProps) {
  // Treść montuje się przy każdym otwarciu, więc zaznaczenie wraca do bieżącej formy.
  return otwarte ? <TrescArkusza {...props} /> : null;
}
