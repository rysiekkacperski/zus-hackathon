'use client';

// SheetHealthDataConsent (kontrakt, tabela 2.3): arkusz na ViewGuideWelcome i ViewGuideSettings. Właściciel: u02.
// Wzory: cz1/P01-14 (nad ekranem powitalnym), cz1/P01-16 (błąd zapisu 0003), cz1/P01-19 (z ustawień).
// Historyjki 3.1.1.1.1 (KA-06 do KA-12, KA-15) i 3.1.1.2.1 (KA-02, KA-03).
import { useState } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import type { RodzajDecyzjiOZgodzie } from '@/domena/typy';
import { zapiszDecyzjeOZgodzie } from '@/dane/magazyn/operacje/zgoda';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';
import { OknoTresciZgody } from './okno-tresci-zgody';

const t = teksty.SheetHealthDataConsent;

export interface ArkuszZgodyProps {
  otwarte: boolean;
  onZamknij: () => void;
  // powitanie: „Kontynuuj bez zgody” zapisuje odmowę; ustawienia: zamyka arkusz bez nowej decyzji (wzór P01-19)
  kontekst?: 'powitanie' | 'ustawienia';
  // wywołane po zapisaniu decyzji; gospodarz wybiera kolejny ekran
  onZapisano?: (rodzaj: RodzajDecyzjiOZgodzie) => void;
}

export function ArkuszZgody({ otwarte, onZamknij, kontekst = 'powitanie', onZapisano }: ArkuszZgodyProps) {
  const [bladZapisu, ustawBladZapisu] = useState(false);
  const [trescOtwarta, ustawTrescOtwarta] = useState(false);

  function zamknij() {
    ustawBladZapisu(false);
    ustawTrescOtwarta(false);
    onZamknij();
  }

  function zapisz(rodzaj: RodzajDecyzjiOZgodzie) {
    const wynik = zapiszDecyzjeOZgodzie(rodzaj, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawBladZapisu(true);
      return;
    }
    ustawBladZapisu(false);
    ustawTrescOtwarta(false);
    onZapisano?.(rodzaj);
  }

  function kontynuujBezZgody() {
    if (kontekst === 'ustawienia') zamknij();
    else zapisz('odmowa');
  }

  return (
    <>
      <Arkusz
        otwarte={otwarte}
        onZamknij={zamknij}
        tytul={t.tytul}
        opis={t.wstep}
        komunikat={bladZapisu ? <Komunikat kod="0003" /> : undefined}
        stopka={
          <>
            <Przycisk wariant="glowny" onClick={() => zapisz('udzielenie')}>
              {t.udziel}
            </Przycisk>
            <Przycisk wariant="drugorzedny" onClick={kontynuujBezZgody}>
              {t.kontynuujBezZgody}
            </Przycisk>
          </>
        }
      >
        <div className="rounded-sm bg-surface-page px-5 py-4">
          <h3 className="m-0 mb-2 text-body-strong text-ink">{t.zakresTytul}</h3>
          <ul className="m-0 pl-6 text-body">
            {t.zakres.map((pozycja) => (
              <li key={pozycja}>{pozycja}</li>
            ))}
          </ul>
        </div>
        <p className="m-0 text-body">{t.cel}</p>
        <p className="m-0 text-body">{t.bezZgody}</p>
        <p className="m-0 text-body">{t.wycofanie}</p>
        <div>
          <button
            type="button"
            onClick={() => ustawTrescOtwarta(true)}
            className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-body font-semibold text-brand no-underline hover:underline"
          >
            {t.pelnaTresc({ wersja: WERSJA_TRESCI_ZGODY })}
          </button>
        </div>
      </Arkusz>
      <OknoTresciZgody otwarte={otwarte && trescOtwarta} onZamknij={() => ustawTrescOtwarta(false)} />
    </>
  );
}
