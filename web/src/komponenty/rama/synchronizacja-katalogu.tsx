'use client';

// Synchronizacja wspólnego Katalogu świadczeń z usługą /api/katalog (dane/magazyn/katalog-serwer.ts).
// Przeglądarka pobiera edycje Administratora raz przy otwarciu aplikacji, potem najwyżej co 60 s, gdy karta jest
// widoczna, po powrocie do karty i po odzyskaniu sieci, a zmiany czekające w kolejce wysyła przy pierwszej okazji.
// Nawigacja między stronami nie pobiera katalogu. Komponent nic nie renderuje.
import { useEffect } from 'react';
import { ODSTEP_POBIERANIA_MS, pobierzKatalogZSerwera } from '@/dane/magazyn/katalog-serwer';

export function SynchronizacjaKatalogu() {
  useEffect(() => {
    void pobierzKatalogZSerwera('start');
    const poPowrocie = () => {
      if (document.visibilityState === 'visible') void pobierzKatalogZSerwera('powrot');
    };
    const poOdzyskaniuSieci = () => void pobierzKatalogZSerwera('siec');
    const odswiezanie = window.setInterval(() => {
      if (document.visibilityState === 'visible') void pobierzKatalogZSerwera('okresowe');
    }, ODSTEP_POBIERANIA_MS);
    document.addEventListener('visibilitychange', poPowrocie);
    window.addEventListener('online', poOdzyskaniuSieci);
    return () => {
      window.clearInterval(odswiezanie);
      document.removeEventListener('visibilitychange', poPowrocie);
      window.removeEventListener('online', poOdzyskaniuSieci);
    };
  }, []);
  return null;
}
