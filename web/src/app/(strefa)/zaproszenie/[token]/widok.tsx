'use client';

import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';

export function WidokPrzyjeciaZaproszenia({ params }: { params: PageProps<'/zaproszenie/[token]'>['params'] }) {
  const { token } = use(params);
  return <EkranZastepczy idWidoku="ViewInviteAccept" jednostka="u23" opis={token} />;
}
