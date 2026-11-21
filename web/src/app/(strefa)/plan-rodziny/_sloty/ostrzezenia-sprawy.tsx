'use client';

// Slot ViewFamilyPlan „ostrzezenia-sprawy” w liście slotyPrzySprawie (kontrakt, sekcja 12.4). Właściciel: u22.
// Ostrzeżenie przy sprawie K28 (0119) albo K29 (0120) w etapie Ciąża z odnośnikiem do arkusza SheetRiskDetails
// (wzory cz2/P18-01, P18-04, P18-05). Po potwierdzeniu daty porodu slot nic nie pokazuje (cz2/P18-07).
import { useState } from 'react';
import { ArkuszRyzyka, KomunikatRyzyka, ostrzezenieDoPokazania } from '@/app/(strefa)/sprawy/[idSprawy]/_czesci/arkusz-ryzyka';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const tekst = teksty.ViewFamilyPlan.ostrzezeniaSprawy;

export function SlotOstrzezeniaSprawy({ sprawa, kontekst, pochodzenie }: PropsSlotu<'przySprawie'>) {
  const [otwarte, setOtwarte] = useState(false);
  const ostrzezenie = ostrzezenieDoPokazania(sprawa, kontekst);
  if (ostrzezenie === undefined) return null;

  return (
    <>
      <KomunikatRyzyka
        ostrzezenie={ostrzezenie}
        className="mt-3"
        akcje={
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOtwarte(true)}
            className="m-0 inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-body-strong text-brand no-underline hover:underline"
          >
            {tekst.zobaczSzczegoly}
          </button>
        }
      />
      <ArkuszRyzyka
        otwarte={otwarte}
        onZamknij={() => setOtwarte(false)}
        sprawa={sprawa}
        ostrzezenie={ostrzezenie}
        kontekst={kontekst}
        pochodzenie={pochodzenie ?? 'plan'}
      />
    </>
  );
}
