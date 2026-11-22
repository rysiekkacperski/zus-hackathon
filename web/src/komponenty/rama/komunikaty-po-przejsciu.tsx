'use client';

// Dostawca komunikatów po przejściu (kontrakt, sekcja 6.8). Po wejściu na trasę odbiera z magazynu
// komunikaty dla widoku tej trasy i przekazuje je NaglowekStrony przez KontekstKomunikatowPoPrzejsciu.
// Odebrane komunikaty trzyma lokalny magazyn ekranu, więc podwójne uruchomienie efektu w trybie
// deweloperskim ich nie gubi, a komunikaty innej ścieżki znikają po nawigacji.
import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { odbierzKomunikatyPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { KontekstKomunikatowPoPrzejsciu, type KomunikatDoPokazania } from '@/komponenty/naglowek-strony';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';

interface OdebraneKomunikaty {
  sciezka: string;
  lista: readonly KomunikatDoPokazania[];
}

const BRAK: readonly KomunikatDoPokazania[] = [];
const POCZATEK: OdebraneKomunikaty = { sciezka: '', lista: BRAK };

let odebrane: OdebraneKomunikaty = POCZATEK;
const sluchacze = new Set<() => void>();

function subskrybuj(sluchacz: () => void): () => void {
  sluchacze.add(sluchacz);
  return () => {
    sluchacze.delete(sluchacz);
  };
}

function migawka(): OdebraneKomunikaty {
  return odebrane;
}

function migawkaSerwera(): OdebraneKomunikaty {
  return POCZATEK;
}

/** Wejście na ścieżkę: nowa ścieżka zaczyna od odebranych komunikatów, ta sama dopisuje nowe kody. */
function przyjmij(sciezka: string, nowe: readonly KomunikatDoPokazania[]): void {
  const dotychczasowe = odebrane.sciezka === sciezka ? odebrane.lista : BRAK;
  const kody = new Set(dotychczasowe.map((k) => k.kod));
  const dodane = nowe.filter((k) => !kody.has(k.kod));
  if (dodane.length === 0 && odebrane.sciezka === sciezka) return;
  odebrane = { sciezka, lista: dodane.length === 0 ? dotychczasowe : [...dotychczasowe, ...dodane] };
  for (const sluchacz of [...sluchacze]) sluchacz();
}

export function DostawcaKomunikatowPoPrzejsciu({ children }: { children: React.ReactNode }) {
  const sciezka = usePathname();
  const stan = useSyncExternalStore(subskrybuj, migawka, migawkaSerwera);

  useEffect(() => {
    const idWidoku = dopasujTrase(sciezka)?.idWidoku;
    const nowe = idWidoku === undefined ? [] : odbierzKomunikatyPoPrzejsciu(idWidoku);
    przyjmij(sciezka, nowe.map(({ kod, parametry }) => ({ kod, parametry })));
  }, [sciezka]);

  const lista = stan.sciezka === sciezka ? stan.lista : BRAK;
  return <KontekstKomunikatowPoPrzejsciu value={lista}>{children}</KontekstKomunikatowPoPrzejsciu>;
}
