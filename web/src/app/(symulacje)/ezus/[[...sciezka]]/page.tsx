import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokEzus } from './widok';

export const metadata: Metadata = { title: teksty.ViewEzusHome.tytulStrony };

export default function Strona({ params }: PageProps<'/ezus/[[...sciezka]]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokEzus params={params} />
    </Suspense>
  );
}
