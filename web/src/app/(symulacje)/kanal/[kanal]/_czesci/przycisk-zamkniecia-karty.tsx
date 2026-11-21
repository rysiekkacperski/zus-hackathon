'use client';

import { useRouter } from 'next/navigation';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

// Zamyka kartę symulowanego serwisu otwartą przez przewodnik; karta otwarta inaczej przechodzi na stronę startową przewodnika.
export function PrzyciskZamknieciaKarty() {
  const router = useRouter();
  function zamknij() {
    window.close();
    if (!window.closed) router.push('/');
  }
  return (
    <Przycisk wariant="glowny" onClick={zamknij}>
      {teksty.ViewSimulatedChannel.zamknij}
    </Przycisk>
  );
}
