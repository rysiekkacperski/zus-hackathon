'use client';

// Slot ViewProfileSummary „sekcja-danych-dziecka” w liście slotyPodsumowania (kontrakt, sekcja 12.4). Właściciel: u19.
// Karta „Dziecko” profilu rodziny z akcją „Zmień dane dziecka” i sekcją „Co z tego wynika” (wzór cz1/P10-16).
// Teksty: teksty.ViewProfileSummary.sekcjaDanychDziecka.
import { formatujDate } from '@/domena/daty';
import type { DaneCiazyIDziecka } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { ListaDefinicji, type PozycjaListyDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewProfileSummary.sekcjaDanychDziecka;

function takNie(wartosc: boolean | undefined): string {
  return wartosc ? t.tak : t.nie;
}

function pozycjeDziecka(dane: DaneCiazyIDziecka, zgoda: boolean): PozycjaListyDefinicji[] {
  const dzieci = dane.dzieci.filter((d) => d.imie !== undefined || d.pesel !== undefined);
  const pozycje: PozycjaListyDefinicji[] = [];
  if (dzieci.length > 0) {
    pozycje.push({
      etykieta: t.imieINazwisko,
      wartosc: dzieci.map((d) => [d.imie, d.nazwisko].filter(Boolean).join(' ')).join(', '),
      zrodlo: dzieci.every((d) => d.zrodlo === 'konto-zus') ? 'konto-zus' : undefined,
    });
    const pesele = dzieci.map((d) => d.pesel).filter((p): p is string => p !== undefined);
    if (pesele.length > 0) pozycje.push({ etykieta: t.pesel, wartosc: pesele.join(', ') });
  }
  if (dane.dataPorodu) pozycje.push({ etykieta: t.dataPorodu, wartosc: formatujDate(dane.dataPorodu) });
  pozycje.push({ etykieta: t.liczbaDzieci, wartosc: String(dane.liczbaUrodzonychDzieci ?? 1) });
  if (!zgoda || dane.tydzienCiazyWDniuPorodu === undefined) return pozycje;
  return [
    ...pozycje,
    { etykieta: t.tydzien, wartosc: String(dane.tydzienCiazyWDniuPorodu) },
    { etykieta: t.masa, wartosc: t.masaWGramach({ masa: String(dane.masaUrodzeniowaG ?? '') }) },
    { etykieta: t.dni, wartosc: String(dane.dniHospitalizacji5do28 ?? 0) },
    { etykieta: t.ciezkaChoroba, wartosc: takNie(dane.ciezkaChorobaDziecka) },
    { etykieta: t.zaZyciem, wartosc: takNie(dane.zaswiadczenieZaZyciem) },
  ];
}

export function SlotSekcjaDanychDziecka({ tryb, kontekst }: PropsSlotu<'sekcja'>) {
  const dane = kontekst?.rodzina.daneCiazy ?? null;
  if (tryb !== 'rodzina' || kontekst === null || dane === null || !dane.dataPoroduPotwierdzona) return null;
  const zgoda = kontekst.stanZgody === 'udzielona';
  const mozeZmienic = zgoda && kontekst.rola === 'rodzic';
  const wynik: PozycjaListyDefinicji[] = [];
  if (zgoda && dane.wymiarUzupelniajacegoUrlopu) {
    wynik.push({ etykieta: t.uzupelniajacy, wartosc: t.wymiaryUzupelniajacego[dane.wymiarUzupelniajacegoUrlopu] });
  }
  if (zgoda && dane.wymiarUrlopuRodzicielskiegoTygodni !== undefined) {
    wynik.push({
      etykieta: t.rodzicielski,
      wartosc: t.wymiarRodzicielskiego({ tygodnie: String(dane.wymiarUrlopuRodzicielskiegoTygodni) }),
    });
  }

  return (
    <Karta
      tytul={t.tytul}
      akcje={
        mozeZmienic ? (
          <PrzyciskLink wariant="drugorzedny" href={sciezkaWidoku('ViewBirthDetails', { tryb: 'zmiana' })}>
            {t.zmien}
          </PrzyciskLink>
        ) : undefined
      }
    >
      <Stos odstep={6}>
        <ListaDefinicji pozycje={pozycjeDziecka(dane, zgoda)} />
        {wynik.length > 0 ? (
          <Stos odstep={3}>
            <h3 className="m-0 text-body-strong text-ink">{t.coZTegoWynika}</h3>
            <ListaDefinicji pozycje={wynik} />
          </Stos>
        ) : null}
        {mozeZmienic ? (
          <Notatka>
            <p>{t.notka}</p>
          </Notatka>
        ) : null}
      </Stos>
    </Karta>
  );
}
