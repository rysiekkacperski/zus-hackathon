import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { etapZeSlugu } from '@/app/(strefa)/plan-rodziny/_czesci/sciezka-etapu';
import { nazwaEtapu, numerEtapu } from '@/app/(strefa)/plan-rodziny/_czesci/sprawy';
import { WidokEtapuPlanu } from './widok';

// Tytuł karty „Etap N: <nazwa>” odróżnia strony etapów w kartach i historii przeglądarki.
export async function generateMetadata({ params }: PageProps<'/plan-rodziny/etap/[etap]'>): Promise<Metadata> {
  const t = teksty.ViewFamilyPlanStage;
  const etap = etapZeSlugu((await params).etap);
  if (etap === null) return { title: t.nieznanyEtap.naglowek };
  return { title: t.naglowek({ numer: String(numerEtapu(etap)), nazwa: nazwaEtapu(etap) }) };
}

export default function Strona({ params }: PageProps<'/plan-rodziny/etap/[etap]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokEtapuPlanu params={params} />
    </Suspense>
  );
}
