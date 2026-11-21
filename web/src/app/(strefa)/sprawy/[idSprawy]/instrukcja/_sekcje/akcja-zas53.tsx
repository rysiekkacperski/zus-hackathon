'use client';

// Sekcja ViewCaseGuide „akcja-zas53” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u30.
// Przejście z instrukcji sprawy K24 do kreatora wniosku ZAS-53 na koncie matki.
// Teksty: teksty.ViewCaseGuide.sekcjaAkcjaZas53.
import { czyKontoMatki } from '@/domena/wnioski/zas53';
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaZas53;

export function SekcjaAkcjaZas53({ sprawa, kontekst }: PropsSlotu<'akcja'>) {
  if (sprawa.idPozycji !== 'K24') return null;
  if (!czyKontoMatki(kontekst.konto, kontekst.rodzina.daneRodziny)) return null;
  return (
    <Karta tytul={t.tytul} bezLinii as="section">
      <p className="m-0 mb-6">{t.opis}</p>
      <PrzyciskLink href={trasy.ViewZas53Start({ sprawa: sprawa.idSprawy })} wariant="glowny">
        {t.akcja}
      </PrzyciskLink>
    </Karta>
  );
}
