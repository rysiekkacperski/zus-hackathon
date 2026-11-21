'use client';

// Postęp i kolumna boczna ViewProfileChildAdoption (wzory P21-02 i P21-07). Właściciel: u24.
// Postęp liczy kroki ścieżki przyjęcia dziecka z nawigacji profilu (bez zmiany zatrudnienia w ciąży), a każda
// część formularza przyjęcia liczy się jako krok.
import { useStanKonta } from '@/dane/magazyn/hooki';
import { Karta } from '@/komponenty/karta';
import { KrokiKreatora, PostepKreatora, type KrokiKreatoraProps } from '@/komponenty/kroki';
import { Notatka } from '@/komponenty/notatka';
import { CZESCI_PRZYJECIA_DZIECKA, krokEkranu, krokiProfilu } from '@/domena/profil/nawigacja';
import type { SzkicProfilu } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewProfileChildAdoption;

const KROKI_SCIEZKI_PRZYJECIA: KrokiKreatoraProps['kroki'] = [
  { etykieta: t.krokiProfilu.daneZKontaZus, stan: 'gotowe' },
  { etykieta: t.krokiProfilu.sytuacja, stan: 'gotowe' },
  { etykieta: t.krokiProfilu.przyjecie, stan: 'biezacy' },
  { etykieta: t.krokiProfilu.rodzina, stan: 'oczekuje' },
  { etykieta: t.krokiProfilu.drugiRodzic, stan: 'oczekuje' },
  { etykieta: t.krokiProfilu.podsumowanie, stan: 'oczekuje' },
];

export function PostepPrzyjecia({ czesc }: { czesc: number }) {
  const stanKonta = useStanKonta();
  const krok = krokEkranu(stanKonta?.szkicProfilu ?? null, 'ViewProfileChildAdoption', {
    zgoda: true,
    zDanymiZus: (stanKonta?.kopiaDanychZus ?? null) !== null,
    czesc,
    liczbaCzesci: CZESCI_PRZYJECIA_DZIECKA,
  });
  return (
    <Karta>
      <PostepKreatora id="przyjecie-postep" krok={krok.numer} liczbaKrokow={krok.liczba} nazwaKroku={t.nazwaKroku} />
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
