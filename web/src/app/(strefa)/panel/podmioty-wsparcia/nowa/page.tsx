import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPodmiotowWsparciaWPanelu } from '@/app/(strefa)/panel/podmioty-wsparcia/widok';

export const metadata: Metadata = { title: teksty.ViewCatalogSupportOrganizations.tytulyTrybow.nowa };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPodmiotowWsparciaWPanelu tryb="nowa" />
    </Suspense>
  );
}
