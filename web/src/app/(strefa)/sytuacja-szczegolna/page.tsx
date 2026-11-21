import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokSytuacjiSzczegolnej } from './widok';

export const metadata: Metadata = { title: teksty.ViewSpecialSituation.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokSytuacjiSzczegolnej />
    </Suspense>
  );
}
