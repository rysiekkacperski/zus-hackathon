'use client';

// ModalConsentText (kontrakt, tabela 2.3): okno modalne na SheetHealthDataConsent (okno nad arkuszem). Właściciel: u02.
// Wzór: cz1/P01-15 (wersja 1.0). Historyjka 3.1.1.1.1 (zadanie 5, KA-07, KA-08).
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import { teksty } from '@/teksty';

const t = teksty.ModalConsentText;

export interface OknoTresciZgodyProps {
  otwarte: boolean;
  onZamknij: () => void;
}

export function OknoTresciZgody({ otwarte, onZamknij }: OknoTresciZgodyProps) {
  return (
    <OknoModalne
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={t.tytul}
      opis={t.opis({ wersja: WERSJA_TRESCI_ZGODY })}
      stopka={
        <Przycisk wariant="glowny" szerokosc="szeroka" onClick={onZamknij}>
          {t.zamknij}
        </Przycisk>
      }
    >
      <div
        role="region"
        aria-label={t.etykietaTresci({ wersja: WERSJA_TRESCI_ZGODY })}
        tabIndex={0}
        className="max-h-100 overflow-y-auto rounded-sm border border-line px-5 py-4"
      >
        <div className="flex flex-col gap-5">
          {t.punkty.map((punkt) => (
            <div key={punkt.tytul}>
              <h3 className="m-0 mb-1 text-body-strong text-ink">{punkt.tytul}</h3>
              <p className="m-0 text-body">{punkt.tresc}</p>
            </div>
          ))}
        </div>
      </div>
    </OknoModalne>
  );
}
