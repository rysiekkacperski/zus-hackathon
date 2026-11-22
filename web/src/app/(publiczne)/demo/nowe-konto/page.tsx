import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokNowegoKonta } from './widok';

export const metadata: Metadata = { title: teksty.ViewDemoNewAccount.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokNowegoKonta />
    </Suspense>
  );
}
