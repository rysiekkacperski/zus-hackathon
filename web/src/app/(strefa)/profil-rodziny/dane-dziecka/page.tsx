import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokDanychDziecka } from '@/app/(strefa)/narodziny/dane-dziecka/widok';

export const metadata: Metadata = { title: teksty.ViewBirthDetails.tytulyTrybow.zmiana };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokDanychDziecka tryb="zmiana" />
    </Suspense>
  );
}
