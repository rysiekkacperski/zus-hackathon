'use client';

// Wspólna treść trzech zastępczych makiet logowania (kontrakt 2.4 i 3.5). Właściciel: u01.
// Potwierdzenie zapisuje sposób logowania w sessionStorage (z zachowaniem `powrot` z ViewGuideStart)
// i prowadzi do wyboru konta; przerwanie usuwa logowanie w toku i wraca na stronę startową.
import { useRouter } from 'next/navigation';
import { useLogowanieWToku } from '@/dane/magazyn/hooki';
import { rozpocznijLogowanie, zakonczLogowanieWToku } from '@/dane/magazyn/operacje/konto';
import type { SposobZalogowania } from '@/domena/typy';
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tekst = teksty.wspolne.ekranZastepczy;

export interface MakietaLogowaniaProps {
  sposob: SposobZalogowania;
  tytul: string;
}

export function MakietaLogowania({ sposob, tytul }: MakietaLogowaniaProps) {
  const router = useRouter();
  const logowanie = useLogowanieWToku();

  const potwierdz = () => {
    rozpocznijLogowanie({ ...logowanie, sposob });
    router.push(sciezkaWidoku('ViewDemoAccountPicker'));
  };

  const przerwij = () => {
    zakonczLogowanieWToku();
    router.push(sciezkaWidoku('ViewGuideStart'));
  };

  return (
    <>
      <NaglowekStrony tytul={tytul} wstep={tekst.makieta.opis} akcje={<FlagaDemo />} />
      <Stos odstep={6} className="max-w-190">
        <Notatka>
          <p>{tekst.dzialajacy({ jednostka: 'u01' })}</p>
        </Notatka>
        <Wiersz odstep={4} className="flex-wrap">
          <Przycisk wariant="glowny" onClick={potwierdz}>
            {tekst.makieta.potwierdz}
          </Przycisk>
          <Przycisk wariant="drugorzedny" onClick={przerwij}>
            {tekst.makieta.przerwij}
          </Przycisk>
        </Wiersz>
      </Stos>
    </>
  );
}
