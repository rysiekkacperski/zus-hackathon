import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPodsumowaniaZ15 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZ15Summary.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPodsumowaniaZ15 />
    </Suspense>
  );
}
