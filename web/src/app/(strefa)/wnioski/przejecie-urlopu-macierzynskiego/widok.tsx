'use client';

import { EkranZastepczy } from '@/komponenty/ekran-zastepczy';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { teksty } from '@/teksty';

export function WidokPrzejeciaUrlopu({ tryb }: { tryb: TrybWidoku<'ViewFatherTakeover'> }) {
  return <EkranZastepczy idWidoku="ViewFatherTakeover" jednostka="u34" opis={teksty.ViewFatherTakeover.tytulyTrybow[tryb]} />;
}
