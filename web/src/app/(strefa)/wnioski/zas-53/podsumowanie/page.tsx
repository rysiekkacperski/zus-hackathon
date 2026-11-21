import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPodsumowaniaZas53 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZas53Summary.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPodsumowaniaZas53 />
    </Suspense>
  );
}
