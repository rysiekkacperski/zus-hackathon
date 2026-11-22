'use client';

// SheetConsentWithdrawConfirm (kontrakt, tabela 2.3): arkusz na ViewGuideSettings. Właściciel: u02.
// Wzór: cz1/P01-20 (termin porodu 15.03.2027). Historyjka 3.1.1.2.1 (zadania 3 i 4; KA-04 do KA-07, KA-13).
import { formatujDate } from '@/komponenty/format';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import type { DataISO } from '@/domena/typy';
import { zapiszDecyzjeOZgodzie } from '@/dane/magazyn/operacje/zgoda';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';

const t = teksty.SheetConsentWithdrawConfirm;

export interface ArkuszWycofaniaZgodyProps {
  otwarte: boolean;
  onZamknij: () => void;
  // przewidywany termin porodu z profilu rodziny; bez niego arkusz pomija tę wartość w liście skutków
  terminPorodu?: DataISO;
  // wynik zapisu wycofania: gospodarz zamyka arkusz i pokazuje 0005 albo 0003 na ViewGuideSettings
  onPotwierdzono?: (ok: boolean) => void;
}

export function ArkuszWycofaniaZgody({ otwarte, onZamknij, terminPorodu, onPotwierdzono }: ArkuszWycofaniaZgodyProps) {
  function potwierdz() {
    const wynik = zapiszDecyzjeOZgodzie('wycofanie', pobierzKontekstOperacji());
    if (onPotwierdzono) onPotwierdzono(wynik.ok);
    else onZamknij();
  }

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={t.tytul}
      stopka={
        <>
          <Przycisk wariant="drugorzedny" onClick={onZamknij}>
            {t.anuluj}
          </Przycisk>
          <Przycisk wariant="glowny" onClick={potwierdz} className="ml-auto">
            {t.potwierdz}
          </Przycisk>
        </>
      }
    >
      <div className="rounded-sm bg-surface-page px-5 py-4">
        <h3 className="m-0 mb-2 text-body-strong text-ink">{t.skutkiTytul}</h3>
        <ul className="m-0 list-disc pl-6 text-body">
          <li>
            {terminPorodu
              ? t.skutekDaneZTerminemPorodu({ terminPorodu: formatujDate(terminPorodu) })
              : t.skutekDane}
          </li>
          <li>{t.skutekUsuniecie}</li>
          <li>{t.skutekPlan}</li>
        </ul>
      </div>
      <p className="m-0 text-body">{t.ponownaZgoda}</p>
    </Arkusz>
  );
}
