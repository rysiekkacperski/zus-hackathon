import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPodmiotowWsparciaWPanelu } from './widok';

export const metadata: Metadata = { title: teksty.ViewCatalogSupportOrganizations.tytulyTrybow.lista };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPodmiotowWsparciaWPanelu tryb="lista" />
    </Suspense>
  );
}
