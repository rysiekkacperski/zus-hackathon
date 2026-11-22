import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokSytuacjiZ15 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZ15Situation.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokSytuacjiZ15 />
    </Suspense>
  );
}
