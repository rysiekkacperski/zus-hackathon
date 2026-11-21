'use client';

import { notFound } from 'next/navigation';
import { use } from 'react';
import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';

export function WidokEzus({ params }: { params: PageProps<'/ezus/[[...sciezka]]'>['params'] }) {
  const { sciezka } = use(params);
  const trasa = dopasujTrase(['', 'ezus', ...(sciezka ?? []).map(encodeURIComponent)].join('/'));
  if (trasa === null || trasa.grupa !== 'symulacje') notFound();
  return <EkranZastepczy idWidoku={trasa.widok} jednostka={trasa.jednostka} opis={trasa.parametry.idWniosku} />;
}
