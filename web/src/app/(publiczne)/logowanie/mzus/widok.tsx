'use client';

// ViewMzusCodeLogin: makieta logowania kodem z aplikacji mZUS (Story 3.1.1.1.2, KA-11, KA-13–KA-15;
// wzory P01-08 i P01-09). Kod ma 8 znaków A-Z0-9 i jest ważny 2 minuty; po upływie ważności makieta
// sama pokazuje nowy kod i komunikat 0252 (R14). Kolejne kody wynikają z ziarna wylosowanego przy
// otwarciu ekranu, więc wymiana kodu nie wymaga osobnego zapisu stanu. Właściciel: u01.
import { useMemo, useState } from 'react';
import { NaglowekDemo } from '@/app/(publiczne)/_czesci/naglowek-demo';
import { useTeraz } from '@/dane/magazyn/hooki';
import { losuj } from '@/dane/magazyn/losowanie';
import { roznicaSekund } from '@/domena/daty';
import { losujZZiarna } from '@/domena/losowanie';
import { nowyKodMzus, stanKoduMzus, WAZNOSC_KODU_MZUS_SEKUNDY } from '@/domena/konto/nowe-konto';
import { Komunikat } from '@/komponenty/komunikat';
import { teksty } from '@/teksty';
import { KartaKoduMakiety, useAkcjeMakiety } from '../_czesci/makieta-logowania';

const tekst = teksty.ViewMzusCodeLogin;
const ZAKRES_ZIARNA = 0x1_0000_0000;

export function WidokLogowaniaKodemMzus() {
  const { potwierdz, przerwij, zajety } = useAkcjeMakiety('mzus');
  const teraz = useTeraz('sekunda');
  // Chwila pokazania pierwszego kodu i ziarno kodów tego otwarcia ekranu.
  const [otwarcie] = useState(() => ({ pokazano: teraz, ziarno: Math.floor(losuj() * ZAKRES_ZIARNA) }));

  const { numerKodu, pozostalo } = stanKoduMzus(Math.max(0, roznicaSekund(otwarcie.pokazano, teraz)));
  const kod = useMemo(() => nowyKodMzus(losujZZiarna(otwarcie.ziarno + numerKodu)), [otwarcie.ziarno, numerKodu]);
  const nowyKod = numerKodu > 0;

  return (
    <>
      <NaglowekDemo flaga={tekst.flaga} tytul={tekst.naglowek} wstep={tekst.wstep} />
      {nowyKod ? <Komunikat kod="0252" className="mb-7.5 max-w-okno-szerokie" /> : null}
      <KartaKoduMakiety
        tytulKarty={tekst.karta}
        opisKoduQr={nowyKod ? tekst.kodQrNowy : tekst.kodQr}
        tytulKodu={nowyKod ? tekst.nowyKodTytul : tekst.kodTytul}
        kod={kod}
        opisKodu={tekst.kodOpis}
        kroki={[
          tekst.kroki.otworz,
          tekst.kroki.zeskanuj,
          <>
            {tekst.kroki.sprawdzPrzed} <strong>{kod}</strong>
            {tekst.kroki.sprawdzPo}
          </>,
          tekst.kroki.potwierdz,
        ]}
        notatka={tekst.notatka}
        etykietaPotwierdzenia={tekst.potwierdz}
        etykietaPrzerwania={tekst.przerwij}
        onPotwierdz={potwierdz}
        onPrzerwij={przerwij}
        zajety={zajety}
        pozostaloSekund={pozostalo}
        waznoscSekund={WAZNOSC_KODU_MZUS_SEKUNDY}
      />
    </>
  );
}
