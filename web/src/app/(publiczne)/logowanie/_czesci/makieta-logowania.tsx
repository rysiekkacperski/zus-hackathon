'use client';

// Wspólne części makiet logowania (analiza 3.1.1, reguły R12–R15; kontrakt 3.5). Właściciel: u01.
// Potwierdzenie zapisuje sposób logowania w logowaniu w toku (z zachowaniem `powrot` z ViewGuideStart)
// i prowadzi do wyboru konta. Przerwanie usuwa logowanie w toku, ustawia komunikat 0072, 0250 albo 0251
// dla ViewGuideStart i wraca na stronę startową.
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type React from 'react';
import { useLogowanieWToku } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { rozpocznijLogowanie, zakonczLogowanieWToku } from '@/dane/magazyn/operacje/konto';
import type { KodKomunikatu, LogowanieWToku, SposobZalogowania } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { KodQrZastepczy } from '@/komponenty/kod-qr-zastepczy';
import { ListaKrokow } from '@/komponenty/kroki';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';

const komunikatPrzerwania: Record<SposobZalogowania, KodKomunikatu> = {
  mobywatel: '0072',
  ezus: '0250',
  mzus: '0251',
};

/** Adres strony startowej z zachowanym celem powrotu logowania w toku. */
function adresStartu(logowanie: LogowanieWToku | null): string {
  const start = sciezkaWidoku('ViewGuideStart');
  return logowanie?.powrot ? `${start}?powrot=${encodeURIComponent(logowanie.powrot)}` : start;
}

/** Akcje makiety: potwierdzenie logowania i przerwanie logowania. */
export function useAkcjeMakiety(sposob: SposobZalogowania) {
  const router = useRouter();
  const logowanie = useLogowanieWToku();

  const potwierdz = useCallback(() => {
    rozpocznijLogowanie({ ...logowanie, sposob });
    router.push(sciezkaWidoku('ViewDemoAccountPicker'));
  }, [logowanie, router, sposob]);

  const przerwij = useCallback(() => {
    const cel = adresStartu(logowanie);
    zakonczLogowanieWToku();
    // Kod mObywatel z tego otwarcia zostaje, żeby następne otwarcie makiety pokazało inny kod (R12).
    if (logowanie?.poprzedniKodMobywatel) {
      rozpocznijLogowanie({ sposob: 'mobywatel', poprzedniKodMobywatel: logowanie.poprzedniKodMobywatel });
    }
    ustawKomunikatPoPrzejsciu({ kod: komunikatPrzerwania[sposob], dlaWidoku: 'ViewGuideStart' });
    router.push(cel);
  }, [logowanie, router, sposob]);

  return { logowanie, potwierdz, przerwij };
}

export interface KartaKoduMakietyProps {
  tytulKarty: string;
  opisKoduQr: string;
  tytulKodu: string;
  kod: string;
  opisKodu: string;
  kroki: React.ReactNode[];
  notatka: string;
  etykietaPotwierdzenia: string;
  etykietaPrzerwania: string;
  onPotwierdz: () => void;
  onPrzerwij: () => void;
  // Odliczanie ważności kodu pod kodem QR (makieta mZUS)
  pozostaloSekund?: number;
  waznoscSekund?: number;
}

/** Karta makiety z kodem QR, kodem do porównania, krokami i akcjami (wzory P01-03 i P01-08). */
export function KartaKoduMakiety({
  tytulKarty,
  opisKoduQr,
  tytulKodu,
  kod,
  opisKodu,
  kroki,
  notatka,
  etykietaPotwierdzenia,
  etykietaPrzerwania,
  onPotwierdz,
  onPrzerwij,
  pozostaloSekund,
  waznoscSekund,
}: KartaKoduMakietyProps) {
  return (
    <Karta tytul={tytulKarty} bezLinii className="max-w-okno-szerokie">
      <div className="flex flex-wrap items-start gap-7.5">
        <KodQrZastepczy opis={opisKoduQr} pozostaloSekund={pozostaloSekund} waznoscSekund={waznoscSekund} />
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-6">
          <div className="rounded-sm bg-surface-page px-5 py-4">
            <p className="m-0 text-body-strong">{tytulKodu}</p>
            <p className="mt-1 mb-0 text-page-title tracking-[0.2em] break-all text-ink-strong">{kod}</p>
            <p className="mt-1 mb-0">{opisKodu}</p>
          </div>
          <ListaKrokow kroki={kroki} />
        </div>
      </div>
      <Notatka className="mt-7.5">
        <p>{notatka}</p>
      </Notatka>
      <div className="mt-6 flex flex-wrap gap-4">
        <Przycisk wariant="glowny" onClick={onPotwierdz}>
          {etykietaPotwierdzenia}
        </Przycisk>
        <Przycisk wariant="drugorzedny" onClick={onPrzerwij}>
          {etykietaPrzerwania}
        </Przycisk>
      </div>
    </Karta>
  );
}
