'use client';

// Sekcja ViewCaseDetails „ostrzezenia-ryzyk” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u22.
// Ostrzeżenie sprawy K28 (0119) albo K29 (0120) z akcją otwarcia arkusza SheetRiskDetails (wzory cz2/P18-02, P18-06).
// Parametr ?arkusz=ryzyko otwiera arkusz przy wejściu na ekran.
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArkuszRyzyka, KomunikatRyzyka, ostrzezenieDoPokazania } from '@/app/(strefa)/sprawy/[idSprawy]/_czesci/arkusz-ryzyka';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const tekst = teksty.ViewCaseDetails.sekcjaOstrzezeniaRyzyk;

export function SekcjaOstrzezeniaRyzyk({ sprawa, kontekst, pochodzenie }: PropsSlotu<'sekcja'>) {
  const parametry = useSearchParams();
  const [otwarte, setOtwarte] = useState(() => parametry.get('arkusz') === 'ryzyko');
  const ostrzezenie = ostrzezenieDoPokazania(sprawa, kontekst);
  if (ostrzezenie === undefined) return null;

  function zamknij() {
    setOtwarte(false);
    const adres = new URL(window.location.href);
    if (adres.searchParams.has('arkusz')) {
      adres.searchParams.delete('arkusz');
      window.history.replaceState(null, '', `${adres.pathname}${adres.search}${adres.hash}`);
    }
  }

  return (
    <>
      <KomunikatRyzyka
        ostrzezenie={ostrzezenie}
        className="max-w-tresc"
        akcje={
          <Przycisk type="button" wariant="drugorzedny" aria-haspopup="dialog" onClick={() => setOtwarte(true)}>
            {tekst.zobaczSzczegoly}
          </Przycisk>
        }
      />
      <ArkuszRyzyka
        otwarte={otwarte}
        onZamknij={zamknij}
        sprawa={sprawa}
        ostrzezenie={ostrzezenie}
        kontekst={kontekst}
        pochodzenie={pochodzenie}
      />
    </>
  );
}
