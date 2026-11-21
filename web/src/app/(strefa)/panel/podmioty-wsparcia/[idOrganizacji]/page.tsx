import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPodmiotowWsparciaWPanelu } from '@/app/(strefa)/panel/podmioty-wsparcia/widok';

export const metadata: Metadata = { title: teksty.ViewCatalogSupportOrganizations.tytulyTrybow.edycja };

export default function Strona({ params }: PageProps<'/panel/podmioty-wsparcia/[idOrganizacji]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPodmiotowWsparciaWPanelu tryb="edycja" params={params} />
    </Suspense>
  );
}
