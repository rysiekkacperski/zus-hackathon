'use client';

// Ocena strażnika ubezpieczenia chorobowego dla pulpitu ViewFamilyPlan i strony etapu ViewFamilyPlanStage.
// Właściciel: u12.
import { useMemo } from 'react';
import { useParametry, type KontekstRodziny } from '@/dane/magazyn/hooki';
import { ocenStraznika, type OcenaStraznika } from '@/domena/plan/straznik';

export function useOcenaStraznika(kontekst: KontekstRodziny | null): OcenaStraznika | null {
  const parametry = useParametry();
  return useMemo(
    () =>
      kontekst
        ? ocenStraznika({
            daneRodziny: kontekst.rodzina.daneRodziny,
            daneCiazy: kontekst.rodzina.daneCiazy,
            kopia: kontekst.daneZusMatki,
            katalog: kontekst.katalog,
            progPodwyzszeniaProcent: parametry.progPodwyzszeniaPodstawyProcent,
            dzis: kontekst.dzis,
          })
        : null,
    [kontekst, parametry.progPodwyzszeniaPodstawyProcent],
  );
}
