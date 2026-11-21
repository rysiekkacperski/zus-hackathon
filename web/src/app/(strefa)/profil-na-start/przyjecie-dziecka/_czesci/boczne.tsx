'use client';

// Postęp i kolumna boczna ViewProfileChildAdoption (wzory P21-02 i P21-07). Właściciel: u24.
import { Karta } from '@/komponenty/karta';
import { KrokiKreatora, PostepKreatora, type KrokiKreatoraProps } from '@/komponenty/kroki';
import { Notatka } from '@/komponenty/notatka';
import { krokiProfilu } from '@/domena/profil/nawigacja';
import type { SzkicProfilu } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewProfileChildAdoption;

// Ścieżka przyjęcia dziecka ma 6 kroków: bez zmiany zatrudnienia w ciąży.
const NUMER_KROKU = 3;
const LICZBA_KROKOW = 6;

const KROKI_SCIEZKI_PRZYJECIA: KrokiKreatoraProps['kroki'] = [
  { etykieta: t.krokiProfilu.daneZKontaZus, stan: 'gotowe' },
  { etykieta: t.krokiProfilu.sytuacja, stan: 'gotowe' },
  { etykieta: t.krokiProfilu.przyjecie, stan: 'biezacy' },
  { etykieta: t.krokiProfilu.rodzina, stan: 'oczekuje' },
  { etykieta: t.krokiProfilu.drugiRodzic, stan: 'oczekuje' },
  { etykieta: t.krokiProfilu.podsumowanie, stan: 'oczekuje' },
];

export function PostepPrzyjecia() {
  return (
    <Karta>
      <PostepKreatora id="przyjecie-postep" krok={NUMER_KROKU} liczbaKrokow={LICZBA_KROKOW} nazwaKroku={t.nazwaKroku} />
    </Karta>
  );
}

export function BocznaKrokow({ szkic }: { szkic: SzkicProfilu | null }) {
  // Lista kroków z nawigacji profilu (u07), a bez niej lista ścieżki przyjęcia ze wzoru P21-02.
  const zNawigacji = szkic ? krokiProfilu(szkic, true, 'ViewProfileChildAdoption') : [];
  const kroki = zNawigacji.length > 0 ? zNawigacji : KROKI_SCIEZKI_PRZYJECIA;
  return <KrokiKreatora tytul={t.krokiProfilu.tytul} kroki={kroki} notatka={<Notatka>{t.krokiProfilu.notatka}</Notatka>} />;
}

export function BocznaZmiany() {
  return (
    <Karta tytul={t.poZapisie.tytul} bezLinii>
      <ul className="m-0 flex list-disc flex-col gap-3 pl-5">
        {t.poZapisie.punkty.map((punkt) => (
          <li key={punkt}>{punkt}</li>
        ))}
      </ul>
    </Karta>
  );
}
