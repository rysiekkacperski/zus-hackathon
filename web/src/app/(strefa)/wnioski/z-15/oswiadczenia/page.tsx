import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokOswiadczenZ15 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZ15Statements.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokOswiadczenZ15 />
    </Suspense>
  );
}
