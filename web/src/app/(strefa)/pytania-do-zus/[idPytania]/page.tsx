import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokWyslanegoPytania } from './widok';

export const metadata: Metadata = { title: teksty.ViewZusQuestionSent.tytulStrony };

export default function Strona({ params }: PageProps<'/pytania-do-zus/[idPytania]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokWyslanegoPytania params={params} />
    </Suspense>
  );
}
