import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokWyboruKonta } from './widok';

export const metadata: Metadata = { title: teksty.ViewDemoAccountPicker.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokWyboruKonta />
    </Suspense>
  );
}
