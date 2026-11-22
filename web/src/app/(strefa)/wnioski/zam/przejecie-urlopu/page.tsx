import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPrzejeciaUrlopu } from '@/app/(strefa)/wnioski/przejecie-urlopu-macierzynskiego/widok';

export const metadata: Metadata = { title: teksty.ViewFatherTakeover.tytulyTrybow.zam };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPrzejeciaUrlopu tryb="zam" />
    </Suspense>
  );
}
