import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokZmianyDokumentuKatalogu } from './widok';

export const metadata: Metadata = { title: teksty.ViewCatalogDocumentEdit.tytulStrony };

export default function Strona({ params }: PageProps<'/panel/katalog/dokumenty/[idDokumentu]'>) {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokZmianyDokumentuKatalogu params={params} />
    </Suspense>
  );
}
