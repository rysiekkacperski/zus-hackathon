import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { WidokPodsumowaniaProfilu } from '@/app/(strefa)/profil-na-start/podsumowanie/widok';

export const metadata: Metadata = { title: teksty.ViewProfileSummary.tytulyTrybow.rodzina };

export default function Strona() {
  return (
    <Suspense fallback={<SzkieletWidoku />}>
      <WidokPodsumowaniaProfilu tryb="rodzina" />
    </Suspense>
  );
}
