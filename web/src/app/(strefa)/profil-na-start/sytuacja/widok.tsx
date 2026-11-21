'use client';

// ViewProfileSituation (historyjka 3.3.1.4.1; wzory cz1/P03-09, cz1/P03-10). Właściciel: u07.
// Krok 2 kreatora „Twoja sytuacja”: cztery sytuacje rodzica. Wybór trafia do szkicu profilu ze źródłem
// odpowiedź rodzica i wyznacza kolejny ekran: dane ciąży, datę porodu, dane przyjęcia dziecka albo kalkulator
// zasiłku. Bez zgody na dane dotyczące zdrowia kreator pomija ekrany ciąży, porodu, przyjęcia i zmiany
// zatrudnienia i prowadzi do ViewProfileFamily (komunikat 0004 pokazuje ten ekran). Planowanie rodzicielstwa
// zostawia ostatnim ekranem szkicu ViewProfileSituation, więc rodzic wraca tu po ponownym otwarciu przewodnika.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszSzkic } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czyMaZgode } from '@/domena/konto';
import { nastepnyEkran, poprzedniEkran, sytuacjaSzkicu } from '@/domena/profil/nawigacja';
import type { KodKomunikatu, SytuacjaRodzica, SzkicProfilu } from '@/domena/typy';
import { GrupaOpcji, idOpcjiGrupy, type OpcjaGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { NaglowekKreatoraProfilu, SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { sciezkaEkranuProfilu } from '../_czesci/trasy-profilu';

const tekst = teksty.ViewProfileSituation;
const NAZWA_GRUPY = 'sytuacja-rodzica';
const SYTUACJE: SytuacjaRodzica[] = ['oczekiwanie', 'narodziny', 'przyjecie', 'planowanie'];

const OPCJE: OpcjaGrupy<SytuacjaRodzica>[] = SYTUACJE.map((s) => ({
  wartosc: s,
  etykieta: tekst.sytuacje[s].etykieta,
  opis: tekst.sytuacje[s].opis,
}));

export function WidokSytuacjiRodzica() {
  const router = useRouter();
  const stanKonta = useStanKonta();
  const szkic = stanKonta?.szkicProfilu ?? null;
  const zgoda = stanKonta ? czyMaZgode(stanKonta.konto.decyzjeOZgodzie) : false;

  const [wybor, ustawWybor] = useState<SytuacjaRodzica | null>(null);
  const wybrana = wybor ?? sytuacjaSzkicu(szkic);
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  const wroc = () => {
    const s: SzkicProfilu | null = szkic === null ? null : { ...szkic, ostatniEkran: 'ViewProfileSituation' };
    router.push(sciezkaEkranuProfilu(s ? poprzedniEkran(s, zgoda) : 'ViewProfileZusData', s));
  };

  const dalej = () => {
    if (wybrana === null) {
      ustawBlad('0006');
      document.getElementById(idOpcjiGrupy(NAZWA_GRUPY, SYTUACJE[0]))?.focus();
      return;
    }
    ustawZajety(true);
    const wynik = zapiszSzkic(
      { daneRodziny: { sytuacja: { wartosc: wybrana, zrodlo: 'odpowiedz-rodzica' } } },
      'ViewProfileSituation',
      pobierzKontekstOperacji(),
    );
    if (!wynik.ok) {
      ustawZajety(false);
      ustawBladZapisu(wynik.kod);
      return;
    }
    router.push(sciezkaEkranuProfilu(nastepnyEkran(wynik.wartosc, zgoda), wynik.wartosc));
  };

  return (
    <>
      <NaglowekKreatoraProfilu />
      <SzkieletKreatoraProfilu biezacy="ViewProfileSituation" onWroc={wroc} onDalej={dalej} zajety={zajety}>
        <Karta tytul={tekst.tytulKarty} bezLinii as="section">
          <p className="m-0 mb-4">{tekst.opisKarty}</p>
          <GrupaOpcji
            nazwa={NAZWA_GRUPY}
            legenda={tekst.legenda}
            opcje={OPCJE}
            wartosc={wybrana}
            onZmiana={(s) => {
              ustawWybor(s);
              ustawBlad(null);
            }}
            blad={blad}
          />
          <Notatka className="mt-6">
            <p className="m-0">
              {tekst.notatkaZgodyPrzed}
              <Odnosnik href={sciezkaWidoku('ViewGuideSettings')} wTekscie>
                {tekst.notatkaZgodyLink}
              </Odnosnik>
              {tekst.notatkaZgodyPo}
            </p>
          </Notatka>
        </Karta>
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
      </SzkieletKreatoraProfilu>
    </>
  );
}
