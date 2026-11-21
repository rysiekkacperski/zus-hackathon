import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokZmianyWartosciKatalogu } from './widok';

export const metadata: Metadata = { title: teksty.ViewCatalogValueEdit.tytulStrony };

export default function Strona({ params }: PageProps<'/panel/katalog/wartosci/[idWpisu]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokZmianyWartosciKatalogu params={params} />
    </Suspense>
  );
}
