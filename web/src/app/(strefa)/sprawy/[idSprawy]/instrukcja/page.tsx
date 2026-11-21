import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokInstrukcjiSprawy } from './widok';

export const metadata: Metadata = { title: teksty.ViewCaseGuide.tytulStrony };

export default function Strona({ params }: PageProps<'/sprawy/[idSprawy]/instrukcja'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokInstrukcjiSprawy params={params} />
    </Suspense>
  );
}
