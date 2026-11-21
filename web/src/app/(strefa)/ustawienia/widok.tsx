'use client';

// ViewGuideSettings (kontrakt, tabela 2.2 i sekcja 12.4). Właściciel: u02. Wzory: cz1/Ustawienia.dc.html,
// cz1/P01-18, P01-21, P01-22. Układ strony renderuje sloty ustawień w kolejności rejestru:
// sekcja zgody (u02), sekcja przypomnień (u18), karta pliku kalendarza (u18), sekcja danych rodziny (u02).
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { Stos } from '@/komponenty/uklad';
import { useDzis, useKonto } from '@/dane/magazyn/hooki';
import { teksty } from '@/teksty';
import { slotyUstawien } from './_sloty';

const t = teksty.ViewGuideSettings;

export function WidokUstawien() {
  const konto = useKonto();
  const dzis = useDzis();

  // Strażnik dostępu wpuszcza na trasę wyłącznie zalogowane konto; bez konta widok czeka na przekierowanie.
  if (konto === null) return <SzkieletWidoku />;

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} stanNa={dzis} powrot={false} />
      <Stos odstep={7.5} className="max-w-tresc">
        {slotyUstawien.map(({ id, Komponent }) => (
          <Komponent key={id} konto={konto} />
        ))}
      </Stos>
    </>
  );
}
