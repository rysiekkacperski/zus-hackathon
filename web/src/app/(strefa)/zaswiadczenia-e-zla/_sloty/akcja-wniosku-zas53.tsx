'use client';

// Slot ModalSickLeaveDetails „akcja-wniosku-zas53” w liście slotyOknaZaswiadczenia (kontrakt, sekcja 12.4). Właściciel: u30.
// Akcja złożenia wniosku ZAS-53 z wybranym zaświadczeniem na koncie matki.
// Teksty: teksty.ModalSickLeaveDetails.akcjaWnioskuZas53.
import { czyKontoMatki, kluczZaswiadczenia } from '@/domena/wnioski/zas53';
import { useRodzina } from '@/dane/magazyn/hooki';
import { Notatka } from '@/komponenty/notatka';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ModalSickLeaveDetails.akcjaWnioskuZas53;

export function SlotAkcjaWnioskuZas53({ zaswiadczenie, konto }: PropsSlotu<'akcja'>) {
  const rodzina = useRodzina();
  if (zaswiadczenie.rodzaj !== 'choroba' || !rodzina) return null;
  if (!czyKontoMatki(konto, rodzina.daneRodziny)) return null;
  return (
    <div className="flex flex-col gap-4">
      <Notatka>{t.notatka}</Notatka>
      <div>
        <PrzyciskLink
          href={trasy.ViewZas53Start({ sprawa: 'K24', zaswiadczenie: kluczZaswiadczenia(zaswiadczenie.seriaINumer) })}
          wariant="glowny"
        >
          {t.akcja}
        </PrzyciskLink>
      </div>
    </div>
  );
}
