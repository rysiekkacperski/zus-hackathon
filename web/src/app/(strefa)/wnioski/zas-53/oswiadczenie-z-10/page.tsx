import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokOswiadczeniaZ10 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZas53AfterInsurance.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokOswiadczeniaZ10 />
    </Suspense>
  );
}
