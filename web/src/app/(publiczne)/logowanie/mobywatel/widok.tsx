'use client';

// ViewMobywatelLogin: makieta logowania przez mObywatela (Story 3.1.1.1.2, KA-01, KA-03, KA-04, KA-16;
// wzór P01-03). Każde otwarcie losuje 6-cyfrowy kod weryfikacyjny różny od kodu z poprzedniego
// otwarcia w tej karcie (R12). Właściciel: u01.
import { useEffect, useState } from 'react';
import { NaglowekDemo } from '@/app/(publiczne)/_czesci/naglowek-demo';
import { losuj } from '@/dane/magazyn/losowanie';
import { rozpocznijLogowanie } from '@/dane/magazyn/operacje/konto';
import { nowyKodMobywatel } from '@/domena/konto/nowe-konto';
import { teksty } from '@/teksty';
import { KartaKoduMakiety, useAkcjeMakiety } from '../_czesci/makieta-logowania';

const tekst = teksty.ViewMobywatelLogin;

export function WidokLogowaniaMobywatel() {
  const { logowanie, potwierdz, przerwij } = useAkcjeMakiety('mobywatel');
  // Kod losuje się raz na otwarcie ekranu; magazyn zapamiętuje go jako poprzedni kod tej karty.
  const [kod] = useState(() => nowyKodMobywatel(logowanie?.poprzedniKodMobywatel, losuj));

  useEffect(() => {
    if (logowanie?.poprzedniKodMobywatel === kod) return;
    rozpocznijLogowanie({ ...logowanie, sposob: logowanie?.sposob ?? 'mobywatel', poprzedniKodMobywatel: kod });
  }, [kod, logowanie]);

  return (
    <>
      <NaglowekDemo flaga={tekst.flaga} tytul={tekst.naglowek} wstep={tekst.wstep} />
      <KartaKoduMakiety
        tytulKarty={tekst.karta}
        opisKoduQr={tekst.kodQr}
        tytulKodu={tekst.kodTytul}
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
      />
    </>
  );
}
