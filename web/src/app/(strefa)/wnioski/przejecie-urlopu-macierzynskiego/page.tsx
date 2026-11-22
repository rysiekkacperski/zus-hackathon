import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPrzejeciaUrlopu } from './widok';

export const metadata: Metadata = { title: teksty.ViewFatherTakeover.tytulyTrybow.wniosek };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPrzejeciaUrlopu tryb="wniosek" />
    </Suspense>
  );
}
