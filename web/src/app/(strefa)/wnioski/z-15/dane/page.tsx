import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokDanychZ15 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZ15Data.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokDanychZ15 />
    </Suspense>
  );
}
