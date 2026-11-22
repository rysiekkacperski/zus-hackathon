'use client';

// ViewZ15Sent: potwierdzenie wysłania wniosku Z-15 do ZUS z numerem Z15-DEMO-RRRRMMDD-NNNN.
import { formatujDate } from '@/domena/daty';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { BrakWnioskuZ15, NaglowekKreatoraZ15, useWniosekZ15 } from '../_czesci/kreator';

const t = teksty.ViewZ15Sent;

export function WidokWyslanegoZ15() {
  const k = useWniosekZ15();
  if (!k || !k.wniosek.potwierdzenie || !k.wniosek.dataZlozenia) return <BrakWnioskuZ15 />;
  const { wniosek } = k;
  return (
    <>
      <NaglowekKreatoraZ15 />
      <Karta tytul={t.naglowek} bezLinii as="section">
        <Stos odstep={4} className="max-w-3xl">
          <Komunikat tresc={t.potwierdzenie({ numer: wniosek.potwierdzenie!, data: formatujDate(wniosek.dataZlozenia!) })} typ="SUCCESS" />
          <p className="m-0">{t.opis}</p>
          <div>
            <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
              {t.doPlanu}
            </PrzyciskLink>
          </div>
        </Stos>
      </Karta>
    </>
  );
}
