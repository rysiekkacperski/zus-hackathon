'use client';

import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { teksty } from '@/teksty';

export function WidokPodsumowaniaProfilu({ tryb }: { tryb: TrybWidoku<'ViewProfileSummary'> }) {
  return <EkranZastepczy idWidoku="ViewProfileSummary" jednostka="u11" opis={teksty.ViewProfileSummary.tytulyTrybow[tryb]} />;
}
