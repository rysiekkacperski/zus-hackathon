'use client';

// SheetContributionPaidConfirm (historyjka 3.6.1.3.1, wzór P06-07). Właściciel: u12.
// Rodzic potwierdza opłacenie składek za miesiąc; potwierdzenie trafia do profilu rodziny ze źródłem
// odpowiedź rodzica, a sprawa Opłacenie składek dostaje status załatwiona. Zrezygnuj zostawia status do zrobienia.
import { useState } from 'react';
import { potwierdzOplacenieSkladek } from '@/dane/magazyn/operacje/straznik';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import { terminOplaceniaSkladek } from '@/domena/plan/straznik';
import type { KodKomunikatu, MiesiacISO } from '@/domena/typy';
import { formatujMiesiac } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const t = teksty.SheetContributionPaidConfirm;

export interface ArkuszPotwierdzeniaSkladekProps {
  otwarte: boolean;
  onZamknij: () => void;
  /** Miesiąc składek sprawy Opłacenie składek. */
  miesiac?: MiesiacISO | null;
  /** Wywoływane po zapisaniu potwierdzenia. */
  onPotwierdzono?: () => void;
}

export function ArkuszPotwierdzeniaSkladek({ otwarte, onZamknij, miesiac, onPotwierdzono }: ArkuszPotwierdzeniaSkladekProps) {
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const [zajety, setZajety] = useState(false);
  if (!miesiac) return null;
  const nazwaMiesiaca = formatujMiesiac(miesiac);
  const nazwaWielka = nazwaMiesiaca.charAt(0).toUpperCase() + nazwaMiesiaca.slice(1);

  const zamknij = () => {
    setBlad(null);
    onZamknij();
  };

  const potwierdz = () => {
    setZajety(true);
    const wynik = potwierdzOplacenieSkladek(miesiac, pobierzKontekstOperacji());
    setZajety(false);
    if (!wynik.ok) {
      setBlad(wynik.kod);
      return;
    }
    setBlad(null);
    onPotwierdzono?.();
    onZamknij();
  };

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={zamknij}
      tytul={t.tytulMiesiaca({ miesiac: nazwaMiesiaca })}
      opis={t.opis({ miesiac: nazwaMiesiaca })}
      etykietaZamkniecia={t.zamknij}
      komunikat={blad ? <Komunikat kod={blad} /> : undefined}
      stopka={
        <>
          <Przycisk wariant="glowny" onClick={potwierdz} zajety={zajety}>
            {t.potwierdz}
          </Przycisk>
          <Przycisk wariant="drugorzedny" onClick={zamknij}>
            {t.zrezygnuj}
          </Przycisk>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <ListaDefinicji
          pozycje={[
            { etykieta: t.miesiac, wartosc: nazwaWielka },
            { etykieta: t.termin, wartosc: formatujDate(terminOplaceniaSkladek(miesiac)) },
            { etykieta: t.tytulUbezpieczenia, wartosc: t.tytulJdg },
          ]}
        />
        <Notatka>
          <p className="m-0">{t.nota({ miesiac: nazwaMiesiaca })}</p>
        </Notatka>
        <p className="m-0 text-body">{t.rezygnacja}</p>
      </div>
    </Arkusz>
  );
}
