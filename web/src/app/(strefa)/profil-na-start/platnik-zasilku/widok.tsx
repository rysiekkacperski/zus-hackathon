'use client';

// ViewProfilePayer (historyjka 3.3.1.1.2; wzory cz1/P03-07, cz1/P03-08). Właściciel: u07.
// Pytanie, czy płatnik składek zgłasza do ubezpieczenia chorobowego więcej niż 20 osób, gdy dane konta ZUS
// nie wskazują płatnika zasiłku. Odpowiedź tak oznacza płatnika składek, nie oznacza ZUS, a nie wiem
// płatnika nieustalonego. W kreatorze profilu ekran prowadzi do ViewProfileSituation, a z `?powrot=<ścieżka>`
// (kreator wniosku, świadczenia w ciąży) wraca pod bezpieczny adres powrotu.
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszOdpowiedzPlatnika } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czyMaZgode } from '@/domena/konto';
import { tytulDlaFormy } from '@/domena/profil/forma-zatrudnienia';
import { daneRodzicaKonta, nastepnyEkran, poprzedniEkran } from '@/domena/profil/nawigacja';
import { odpowiedzZPlatnika, type OdpowiedzOPlatniku } from '@/domena/profil/platnik';
import type { KodKomunikatu, RodzicWRodzinie, SzkicProfilu } from '@/domena/typy';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { bezpiecznyPowrot } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import { NaglowekKreatoraProfilu, SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { sciezkaEkranuProfilu, sciezkaPowrotuProfilu } from '../_czesci/trasy-profilu';

const tekst = teksty.ViewProfilePayer;
const NAZWA_GRUPY = 'platnik-zasilku';

function walidujOdpowiedz(w: { odpowiedz: OdpowiedzOPlatniku | null }): { odpowiedz?: KodKomunikatu } {
  return w.odpowiedz === null ? { odpowiedz: '0006' } : {};
}

export function WidokPlatnikaZasilku() {
  const parametry = useSearchParams();
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const szkic = stanKonta?.szkicProfilu ?? null;
  const zgoda = stanKonta ? czyMaZgode(stanKonta.konto.decyzjeOZgodzie) : false;
  const parametrPowrotu = parametry.get('powrot');
  const adresPowrotu = parametrPowrotu === 'podsumowanie' ? null : bezpiecznyPowrot(parametrPowrotu);

  // Dane rodzica konta: ze szkicu profilu, a bez szkicu z zapisanych Danych rodziny.
  const rola = stanKonta?.konto.rola;
  const wRodzinie = szkic === null && rodzina !== null;
  const rodzic: RodzicWRodzinie = wRodzinie
    ? rola === 'drugi-rodzic' || rodzina.daneRodziny.rodzicKonta === 'drugi-rodzic'
      ? 'drugi-rodzic'
      : 'matka'
    : szkic?.daneRodziny.rodzicKonta === 'drugi-rodzic'
      ? 'drugi-rodzic'
      : 'matka';
  const dane = wRodzinie
    ? rodzic === 'drugi-rodzic'
      ? rodzina.daneRodziny.drugiRodzic
      : rodzina.daneRodziny.matka
    : daneRodzicaKonta(szkic);
  const formaWartosc = dane.formaZatrudnienia?.wartosc;
  const forma = formaWartosc && formaWartosc !== 'brak-drugiego-rodzica' ? formaWartosc : undefined;
  const nazwa = tytulDlaFormy(stanKonta?.kopiaDanychZus ?? null, forma)?.platnik.nazwa;

  const zapisana =
    dane.platnikZasilku?.zrodlo === 'odpowiedz-rodzica' ? odpowiedzZPlatnika(dane.platnikZasilku.wartosc) : null;
  const [odpowiedz, ustawOdpowiedz] = useState<OdpowiedzOPlatniku | null>(null);
  const wybrana = odpowiedz ?? zapisana;
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { odpowiedz: wybrana },
    waliduj: walidujOdpowiedz,
    pola: { odpowiedz: NAZWA_GRUPY },
  });
  const zDanymiZus = (stanKonta?.kopiaDanychZus ?? null) !== null;

  const formaMiejscownik = forma ? teksty.ViewProfileZusData.formyMiejscownik[forma] : null;
  const wstep = nazwa && formaMiejscownik
    ? tekst.wstepZNazwa({ forma: formaMiejscownik, nazwa })
    : formaMiejscownik
      ? tekst.wstepBezNazwy({ forma: formaMiejscownik })
      : tekst.wstepOgolny;

  const naEkranie = (s: SzkicProfilu | null): SzkicProfilu | null =>
    s === null ? null : { ...s, ostatniEkran: 'ViewProfilePayer' };

  const wroc = () => {
    if (adresPowrotu) {
      przejdz(adresPowrotu);
      return;
    }
    const s = naEkranie(szkic);
    przejdz(sciezkaPowrotuProfilu(s ? poprzedniEkran(s, zgoda) : 'ViewProfileZusData', s, zDanymiZus));
  };

  const dalej = () => {
    if (!walidacja.sprobujWyslac() || wybrana === null) return;
    ustawZajety(true);
    const wynik = zapiszOdpowiedzPlatnika(rodzic, wybrana, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      ustawBladZapisu(wynik.kod);
      return;
    }
    if (adresPowrotu) {
      przejdz(adresPowrotu);
      return;
    }
    const s = naEkranie(szkic);
    przejdz(sciezkaEkranuProfilu(s ? nastepnyEkran(s, zgoda) : 'ViewProfileSituation', s));
  };

  return (
    <>
      <NaglowekKreatoraProfilu />
      <SzkieletKreatoraProfilu
        biezacy="ViewProfilePayer"
        onWroc={wroc}
        onDalej={dalej}
        zajety={zajety}
        bezZapisuEkranu={wRodzinie}
      >
        <Karta tytul={tekst.tytulKarty} bezLinii as="section">
          <p className="m-0 mb-4">{wstep}</p>
          <GrupaOpcji
            nazwa={NAZWA_GRUPY}
            legenda={nazwa ? tekst.pytanieZNazwa({ nazwa }) : tekst.pytanieBezNazwy}
            podpowiedz={<p className="m-0">{tekst.podpowiedz}</p>}
            opcje={[
              {
                wartosc: 'tak',
                etykieta: tekst.odpowiedzi.tak,
                opis: nazwa ? tekst.opisTakZNazwa({ nazwa }) : tekst.opisTakBezNazwy,
              },
              { wartosc: 'nie', etykieta: tekst.odpowiedzi.nie, opis: tekst.opisNie },
              { wartosc: 'nie-wiem', etykieta: tekst.odpowiedzi['nie-wiem'], opis: tekst.opisNieWiem },
            ]}
            wartosc={wybrana}
            onZmiana={ustawOdpowiedz}
            {...walidacja.pole('odpowiedz')}
          />
          <Notatka className="mt-6">
            <p className="m-0">{tekst.notatka}</p>
          </Notatka>
        </Karta>
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
      </SzkieletKreatoraProfilu>
    </>
  );
}
