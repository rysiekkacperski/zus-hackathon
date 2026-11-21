'use client';

import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { teksty } from '@/teksty';

export function WidokDatyPorodu({ tryb }: { tryb: TrybWidoku<'ViewBirthDate'> }) {
  return <EkranZastepczy idWidoku="ViewBirthDate" jednostka="u19" opis={teksty.ViewBirthDate.tytulyTrybow[tryb]} />;
}
