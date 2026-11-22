import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokStartuZas53 } from './widok';

export const metadata: Metadata = { title: teksty.ViewZas53Start.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokStartuZas53 />
    </Suspense>
  );
}
