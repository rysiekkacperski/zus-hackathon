'use client';

import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';

export function WidokSprawy({ params }: { params: PageProps<'/sprawy/[idSprawy]'>['params'] }) {
  const { idSprawy } = use(params);
  return <EkranZastepczy idWidoku="ViewCaseDetails" jednostka="u12" opis={idSprawy} />;
}
