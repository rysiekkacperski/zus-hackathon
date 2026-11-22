import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPrzyjeciaZaproszenia } from './widok';

export const metadata: Metadata = { title: teksty.ViewInviteAccept.tytulStrony };

export default function Strona({ params }: PageProps<'/zaproszenie/[token]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPrzyjeciaZaproszenia params={params} />
    </Suspense>
  );
}
