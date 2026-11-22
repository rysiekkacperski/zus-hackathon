// Adresy stron etapów planu rodziny (ViewFamilyPlanStage, /plan-rodziny/etap/[etap]). Slug etapu jest
// identyfikatorem etapu z typu Etap.
import type { Etap } from '@/domena/typy';
import { trasy } from '@/komponenty/rama/trasy';
import { ETAPY } from './sprawy';

/** Parametr zapytania, którym link do ViewCaseDetails przekazuje etap, z którego wszedł rodzic. */
export const PARAMETR_ETAPU = 'etap';

/** Ścieżka strony etapu planu rodziny. */
export function sciezkaEtapu(etap: Etap): string {
  return trasy.ViewFamilyPlanStage({ etap });
}

/** Etap ze slugu w adresie albo null, gdy slug nie wskazuje etapu planu. */
export function etapZeSlugu(slug: string | null | undefined): Etap | null {
  if (!slug) return null;
  return ETAPY.find((etap) => etap === slug) ?? null;
}
