'use client';

// ViewProfileChildAdoption (historyjka 3.3.4.1.1, wzory P21-02..P21-07). Właściciel: u24.
// Tryb profilu na start: formularz w trzech częściach, „Dalej” na ostatniej części zapisuje dane w szkicu
// i prowadzi do ViewProfileFamily.
// Tryb zmiany z podsumowania (?powrot=podsumowanie albo konto Rodzic): „Dalej” wraca na ViewProfileSummary.
// Formularz działa z udzieloną zgodą na dane dotyczące zdrowia i bez niej (KA-01 3.3.1.4.2).
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useDzis, useKonto, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import { formularzZPrzyjecia } from '@/domena/rodzina/przyjecie';
import { teksty } from '@/teksty';
import { BocznaKrokow, BocznaZmiany } from './_czesci/boczne';
import { FormularzDanychPrzyjecia } from './_czesci/formularz';

const t = teksty.ViewProfileChildAdoption;

export function WidokPrzyjeciaDziecka() {
  const parametry = useSearchParams();
  const konto = useKonto();
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const dzis = useDzis();

  const szkic = stanKonta?.szkicProfilu ?? null;
  const zapisane = rodzina?.daneCiazy?.przyjecie;
  const wSzkicu = szkic?.daneCiazy.przyjecie;
  const [poczatkowy] = useState(() =>
    konto ? formularzZPrzyjecia(wSzkicu ?? zapisane, konto.pesel, formatujDate) : null,
  );

  if (konto === null || poczatkowy === null) return null;

  const nowyUzytkownik = konto.rola === 'nowy-uzytkownik';
  const trybZmiany = parametry.get('powrot') === 'podsumowanie' || !nowyUzytkownik || szkic?.kontekst === 'zmiana-profilu';
  const adresPodsumowania = nowyUzytkownik ? trasy.ViewProfileSummary() : trasy.ViewProfileSummary({ tryb: 'rodzina' });
  const adresDalej = trybZmiany ? adresPodsumowania : trasy.ViewProfileFamily();
  const adresWstecz = trybZmiany ? adresPodsumowania : trasy.ViewProfileSituation();

  const naglowek = trybZmiany ? (
    <NaglowekStrony tytul={t.naglowekZmiany} powrot={{ href: adresPodsumowania, etykieta: t.powrotDoProfilu }} />
  ) : (
    <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={false} />
  );

  const tresc = (
    <FormularzDanychPrzyjecia
      poczatkowy={poczatkowy}
      dzis={dzis}
      trybZmiany={trybZmiany}
      zapisanaDataPrzyjecia={trybZmiany && zapisane ? formatujDate(zapisane.dataPrzyjecia) : undefined}
      adresWstecz={adresWstecz}
      adresDalej={adresDalej}
      pokazPostep={!trybZmiany}
    />
  );

  return (
    <>
      {naglowek}
      <UkladDwuKolumnowy
        tresc={tresc}
        boczna={trybZmiany ? <BocznaZmiany /> : <BocznaKrokow szkic={szkic} />}
        etykietaBocznej={trybZmiany ? t.poZapisie.etykietaBocznej : t.krokiProfilu.etykietaBocznej}
      />
    </>
  );
}
