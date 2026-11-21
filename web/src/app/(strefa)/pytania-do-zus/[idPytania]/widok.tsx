'use client';

import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';

export function WidokWyslanegoPytania({ params }: { params: PageProps<'/pytania-do-zus/[idPytania]'>['params'] }) {
  const { idPytania } = use(params);
  return <EkranZastepczy idWidoku="ViewZusQuestionSent" jednostka="u29" opis={idPytania} />;
}
