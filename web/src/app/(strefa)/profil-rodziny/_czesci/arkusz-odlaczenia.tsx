'use client';

// SheetSecondParentRemoveConfirm (kontrakt, tabela 2.3): arkusz na ViewProfileSummary (slot drugiego rodzica). Właściciel: u23.
// Teksty: teksty.SheetSecondParentRemoveConfirm. Wzór: cz2/P19-10-Odlaczenie-potwierdzenie.
// Potwierdzenie wywołuje odlaczDrugiegoRodzica; rezygnacja zamyka arkusz bez zmiany roli drugiego rodzica.
import { useState } from 'react';
import { odlaczDrugiegoRodzica } from '@/dane/magazyn/operacje/drugi-rodzic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Komunikat } from '@/komponenty/komunikat';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const t = teksty.SheetSecondParentRemoveConfirm;

export interface ArkuszOdlaczeniaProps {
  otwarte: boolean;
  onZamknij: () => void;
  /** Imię i nazwisko dołączonego drugiego rodzica. */
  imieINazwisko?: string;
  /** Wywoływane po udanym odłączeniu, przed zamknięciem arkusza. */
  onOdlaczono?: () => void;
}

export function ArkuszOdlaczenia({ otwarte, onZamknij, imieINazwisko = '', onOdlaczono }: ArkuszOdlaczeniaProps) {
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  function zamknij() {
    ustawBlad(null);
    onZamknij();
  }

  function potwierdz() {
    ustawZajety(true);
    const wynik = odlaczDrugiegoRodzica(pobierzKontekstOperacji());
    ustawZajety(false);
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return;
    }
    ustawBlad(null);
    onOdlaczono?.();
    onZamknij();
  }

  const skutki = [t.skutki.rola({ imieINazwisko }), t.skutki.przypomnienia, t.skutki.dane];

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={zamknij}
      tytul={t.tytul}
      opis={t.opis({ imieINazwisko })}
      komunikat={blad ? <Komunikat kod={blad} /> : undefined}
      stopka={
        <>
          <Przycisk wariant="glowny" zajety={zajety} onClick={potwierdz}>
            {t.potwierdz}
          </Przycisk>
          <Przycisk wariant="drugorzedny" onClick={zamknij}>
            {t.anuluj}
          </Przycisk>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <h3 className="m-0 text-body-strong text-ink">{t.poOdlaczeniu}</h3>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {skutki.map((skutek) => (
            <li key={skutek} className="flex items-start gap-3">
              <Ikona nazwa="info" className="mt-0.5 shrink-0 text-brand" />
              <span className="min-w-0">{skutek}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="m-0 text-body">{t.ponownie}</p>
    </Arkusz>
  );
}
