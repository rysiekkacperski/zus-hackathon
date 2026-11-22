import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokDatyPorodu } from '@/app/(strefa)/narodziny/data-porodu/widok';

export const metadata: Metadata = { title: teksty.ViewBirthDate.tytulyTrybow.profil };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokDatyPorodu tryb="profil" />
    </Suspense>
  );
}
