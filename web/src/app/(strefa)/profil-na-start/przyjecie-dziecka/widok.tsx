'use client';

// ViewProfileChildAdoption (historyjka 3.3.4.1.1, wzory P21-02..P21-07). Właściciel: u24.
// Tryb profilu na start: krok 3 z 6, „Dalej” zapisuje dane w szkicu i prowadzi do ViewProfileFamily.
// Tryb zmiany z podsumowania (?powrot=podsumowanie albo konto Rodzic): „Dalej” wraca na ViewProfileSummary.
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { trasy } from '@/komponenty/rama/trasy';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useDzis, useKonto, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { czyMaZgode } from '@/domena/konto/zgoda';
import { formatujDate } from '@/domena/daty';
import { formularzZPrzyjecia } from '@/domena/rodzina/przyjecie';
import { teksty } from '@/teksty';
import { BocznaKrokow, BocznaZmiany, PostepPrzyjecia } from './_czesci/boczne';
import { FormularzDanychPrzyjecia } from './_czesci/formularz';

const t = teksty.ViewProfileChildAdoption;

export function WidokPrzyjeciaDziecka() {
  const router = useRouter();
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
  const zgoda = czyMaZgode(konto.decyzjeOZgodzie);

  const naglowek = trybZmiany ? (
    <NaglowekStrony tytul={t.naglowekZmiany} powrot={{ href: adresPodsumowania, etykieta: t.powrotDoProfilu }} />
  ) : (
    <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={false} />
  );

  if (!zgoda) {
    return (
      <>
        {naglowek}
        <Stos odstep={7.5} className="max-w-tresc">
          <Komunikat kod="0004" />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PrzyciskLink href={adresWstecz} wariant="drugorzedny">
              {t.wstecz}
            </PrzyciskLink>
            <PrzyciskLink href={adresDalej} wariant="glowny">
              {trybZmiany ? t.bezZgody.wrocDoProfilu : t.bezZgody.przejdzDalej}
            </PrzyciskLink>
          </div>
        </Stos>
      </>
    );
  }

  const tresc = (
    <Stos odstep={7.5}>
      {trybZmiany ? null : <PostepPrzyjecia />}
      <FormularzDanychPrzyjecia
        poczatkowy={poczatkowy}
        dzis={dzis}
        trybZmiany={trybZmiany}
        zapisanaDataPrzyjecia={trybZmiany && zapisane ? formatujDate(zapisane.dataPrzyjecia) : undefined}
        adresWstecz={adresWstecz}
        onZapisano={() => router.push(adresDalej)}
      />
    </Stos>
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
