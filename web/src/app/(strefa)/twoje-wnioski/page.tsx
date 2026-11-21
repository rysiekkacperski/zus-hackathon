import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokListyWnioskow } from './widok';

export const metadata: Metadata = { title: teksty.ViewApplicationList.tytulStrony };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokListyWnioskow />
    </Suspense>
  );
}
