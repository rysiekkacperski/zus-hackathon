import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokTerminow } from './widok';

export const metadata: Metadata = { title: teksty.ViewDeadlines.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokTerminow />
    </Suspense>
  );
}
