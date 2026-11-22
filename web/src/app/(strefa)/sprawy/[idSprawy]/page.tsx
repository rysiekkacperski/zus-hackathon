import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokSprawy } from './widok';

export const metadata: Metadata = { title: teksty.ViewCaseDetails.tytulStrony };

export default function Strona({ params }: PageProps<'/sprawy/[idSprawy]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokSprawy params={params} />
    </Suspense>
  );
}
