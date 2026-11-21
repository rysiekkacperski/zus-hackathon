'use client';

import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';

export function WidokZmianyWartosciKatalogu({ params }: { params: PageProps<'/panel/katalog/wartosci/[idWpisu]'>['params'] }) {
  const { idWpisu } = use(params);
  return <EkranZastepczy idWidoku="ViewCatalogValueEdit" jednostka="u06" opis={idWpisu} />;
}
