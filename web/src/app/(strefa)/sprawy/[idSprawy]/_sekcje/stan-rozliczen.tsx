'use client';

// Sekcja ViewCaseDetails „stan-rozliczen” w liście sekcjeSprawy (kontrakt, sekcja 12.4; wzór P15-07 „Składki a zasiłek”).
// Właściciel: u14. Teksty: teksty.ViewCaseDetails.sekcjaStanRozliczen. Sekcja dotyczy spraw K24 Zasiłek chorobowy
// w ciąży, K08 Wniosek o zasiłek macierzyński i Opłacenie składek, wyłącznie dla konta z tytułem osoby
// prowadzącej pozarolniczą działalność w Danych z konta ZUS.
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { kwotaDlaStraznika } from '@/domena/zasilki/stan-rozliczen';
import { teksty } from '@/teksty';
import { useStanRozliczenKonta } from '../../../stan-rozliczen-skladek/_czesci/wyliczenia';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaStanRozliczen;

export function SekcjaStanRozliczen({ sprawa }: PropsSlotu<'sekcja'>) {
  const wynik = useStanRozliczenKonta();
  const id = sprawa.idPozycji ?? sprawa.idSprawy;
  const oplacenieSkladek = sprawa.idPozycji === null || sprawa.miesiacSkladek !== undefined;
  if (!wynik?.dzialalnosc || !(id === 'K24' || id === 'K08' || oplacenieSkladek)) return null;
  const stan = wynik.stanNaDzienOdczytu;
  const opis = id === 'K24' ? t.opisChorobowy : id === 'K08' ? t.opis : t.opisSkladek;

  return (
    <Karta tytul={t.tytul}>
      <div className="flex flex-col gap-4">
        <p className="m-0">{opis}</p>
        {stan && !wynik.niedostepny ? (
          <p className="m-0">{t.naDzien({ data: formatujDate(stan.dzien), kwota: formatujKwote(kwotaDlaStraznika(stan)) })}</p>
        ) : null}
        <PrzyciskLink href={trasy.ViewContributionBalance()} wariant="drugorzedny" szerokosc="pelna">
          {t.zobacz}
        </PrzyciskLink>
      </div>
    </Karta>
  );
}
