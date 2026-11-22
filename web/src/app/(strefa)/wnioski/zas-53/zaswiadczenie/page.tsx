import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokZaswiadczeniaZas53 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZas53Certificate.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokZaswiadczeniaZas53 />
    </Suspense>
  );
}
