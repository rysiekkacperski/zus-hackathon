import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokWyslanegoZas53 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZas53Sent.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokWyslanegoZas53 />
    </Suspense>
  );
}
