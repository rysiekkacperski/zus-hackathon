'use client';

import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { teksty } from '@/teksty';

export function WidokDanychDziecka({ tryb }: { tryb: TrybWidoku<'ViewBirthDetails'> }) {
  return <EkranZastepczy idWidoku="ViewBirthDetails" jednostka="u19" opis={teksty.ViewBirthDetails.tytulyTrybow[tryb]} />;
}
