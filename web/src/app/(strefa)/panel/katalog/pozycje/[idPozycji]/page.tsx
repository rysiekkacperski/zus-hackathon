import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokZmianyPozycjiKatalogu } from './widok';

export const metadata: Metadata = { title: teksty.ViewCatalogItemEdit.tytulStrony };

export default function Strona({ params }: PageProps<'/panel/katalog/pozycje/[idPozycji]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokZmianyPozycjiKatalogu params={params} />
    </Suspense>
  );
}
