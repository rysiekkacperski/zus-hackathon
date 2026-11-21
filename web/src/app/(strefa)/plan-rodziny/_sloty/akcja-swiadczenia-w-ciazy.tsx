'use client';

// Slot ViewFamilyPlan „akcja-swiadczenia-w-ciazy” w liście slotyNaglowka (kontrakt, sekcja 12.4). Właściciel: u16.
// Akcja otwarcia ViewPregnancyBenefits w etapie Ciąża (wzór cz1/Plan-rodziny, kafelek „Świadczenia z ubezpieczenia
// chorobowego w ciąży”). Teksty: teksty.ViewFamilyPlan.akcjaSwiadczeniaWCiazy.
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

export function SlotAkcjaSwiadczeniaWCiazy({ kontekst }: PropsSlotu<'naglowek'>) {
  const { rola, rodzina } = kontekst;
  if (rola !== 'rodzic' && rola !== 'drugi-rodzic') return null;
  const etapCiaza = rodzina.plan ? rodzina.plan.biezacyEtap === 'ciaza' : !rodzina.daneCiazy?.dataPorodu;
  if (!etapCiaza) return null;
  return (
    <PrzyciskLink href={trasy.ViewPregnancyBenefits()} wariant="drugorzedny" ikona="serce">
      {teksty.ViewFamilyPlan.akcjaSwiadczeniaWCiazy.etykieta}
    </PrzyciskLink>
  );
}
