import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokUstawien } from './widok';

export const metadata: Metadata = { title: teksty.ViewGuideSettings.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokUstawien />
    </Suspense>
  );
}
