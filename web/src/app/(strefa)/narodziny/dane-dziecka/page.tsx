import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokDanychDziecka } from './widok';

export const metadata: Metadata = { title: teksty.ViewBirthDetails.tytulyTrybow.pakiet };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokDanychDziecka tryb="pakiet" />
    </Suspense>
  );
}
