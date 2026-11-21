import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokEtapuPlanu } from './widok';

export const metadata: Metadata = { title: teksty.ViewFamilyPlanStage.tytulStrony };

export default function Strona({ params }: PageProps<'/plan-rodziny/etap/[etap]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokEtapuPlanu params={params} />
    </Suspense>
  );
}
