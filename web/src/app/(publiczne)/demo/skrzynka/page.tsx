import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokSkrzynkiDemo } from './widok';

export const metadata: Metadata = { title: teksty.ViewDemoInbox.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokSkrzynkiDemo />
    </Suspense>
  );
}
