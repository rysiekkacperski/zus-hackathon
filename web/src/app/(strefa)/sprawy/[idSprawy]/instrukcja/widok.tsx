'use client';

import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';

export function WidokInstrukcjiSprawy({ params }: { params: PageProps<'/sprawy/[idSprawy]/instrukcja'>['params'] }) {
  const { idSprawy } = use(params);
  return <EkranZastepczy idWidoku="ViewCaseGuide" jednostka="u17" opis={idSprawy} />;
}
