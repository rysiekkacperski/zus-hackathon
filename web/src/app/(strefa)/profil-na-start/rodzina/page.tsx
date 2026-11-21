import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokDanychRodziny } from './widok';

export const metadata: Metadata = { title: teksty.ViewProfileFamily.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokDanychRodziny />
    </Suspense>
  );
}
