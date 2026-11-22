import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPrzykladowychSpraw } from './widok';

export const metadata: Metadata = { title: teksty.ViewSampleCaseList.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPrzykladowychSpraw />
    </Suspense>
  );
}
