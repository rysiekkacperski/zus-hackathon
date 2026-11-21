'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';

export function WidokKanalu({ params }: { params: PageProps<'/kanal/[kanal]'>['params'] }) {
  const { kanal } = use(params);
  const trasa = dopasujTrase(`/kanal/${encodeURIComponent(kanal)}`);
  if (trasa === null || trasa.grupa !== 'symulacje') notFound();
  return <EkranZastepczy idWidoku={trasa.widok} jednostka={trasa.jednostka} opis={trasa.parametry.kanal} />;
}
