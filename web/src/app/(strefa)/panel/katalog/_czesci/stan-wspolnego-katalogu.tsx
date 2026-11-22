'use client';

// Informacja na ViewCatalogList, gdzie trafiają zmiany Administratora: wspólny katalog usługi /api/katalog (na dysku
// albo w pamięci serwera) albo wyłącznie ta przeglądarka, gdy usługa jest niedostępna albo odrzuciła zmianę.
// Panel pobiera wspólny katalog przy otwarciu, najwyżej co 60 s, żeby Administrator widział zmiany innych Administratorów.
import { useEffect } from 'react';
import { pobierzKatalogZSerwera, useStanKataloguSerwera } from '@/dane/magazyn/katalog-serwer';
import { Notatka } from '@/komponenty/notatka';
import { teksty } from '@/teksty';

export function StanWspolnegoKatalogu() {
  const t = teksty.ViewCatalogList.wspolnyKatalog;
  const stan = useStanKataloguSerwera();

  useEffect(() => {
    void pobierzKatalogZSerwera('panel');
  }, []);

  if (stan.stan === 'nieznany') return null;
  const tekst =
    stan.stan === 'wspolny' ? (stan.trwaly ? t.wspolny : t.wspolnyWPamieci) : stan.stan === 'lokalny' ? t.lokalny : t.odrzucona;
  return (
    <Notatka>
      <p>{tekst}</p>
    </Notatka>
  );
}
