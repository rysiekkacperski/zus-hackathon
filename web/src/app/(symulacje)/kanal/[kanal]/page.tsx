import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokKanalu } from './widok';

export const metadata: Metadata = { title: teksty.ViewSimulatedChannel.tytulStrony };

export default function Strona({ params }: PageProps<'/kanal/[kanal]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokKanalu params={params} />
    </Suspense>
  );
}
