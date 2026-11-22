'use client';

// Sekcja ViewCaseDetails „straznik-oplacenie-skladek” (historyjka 3.6.1.3.1, kontrakt 12.4). Właściciel: u12.
// Sprawa Opłacenie składek: miesiąc i termin, zasada opłacania do 20. dnia, zadłużenie ponad próg i 0150.
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { czySprawaOplacenia, miesiacZIdSprawyOplacenia, progZadluzenia, terminOplaceniaSkladek } from '@/domena/plan/straznik';
import { formatujMiesiac } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { teksty } from '@/teksty';
import { wielkaLitera } from '@/app/(strefa)/plan-rodziny/_czesci/sprawy';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaStraznikOplacenieSkladek;

export function SekcjaStraznikOplacenieSkladek({ sprawa, kontekst }: PropsSlotu<'sekcja'>) {
  if (!czySprawaOplacenia(sprawa.idSprawy)) return null;
  const miesiac = sprawa.miesiacSkladek ?? miesiacZIdSprawyOplacenia(sprawa.idSprawy);
  if (!miesiac) return null;
  const prog = formatujKwote(progZadluzenia(kontekst.katalog, kontekst.dzis));
  const zadluzenie = sprawa.ostrzezenia.find((o) => o.rodzaj === 'zadluzenie-ponad-prog');
  const niedostepny = sprawa.ostrzezenia.some((o) => o.rodzaj === 'stan-rozliczen-niedostepny');
  return (
    <Karta tytul={t.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        <ListaDefinicji
          pozycje={[
            { etykieta: t.miesiac, wartosc: wielkaLitera(formatujMiesiac(miesiac)) },
            { etykieta: t.termin, wartosc: formatujDate(terminOplaceniaSkladek(miesiac)) },
          ]}
        />
        <p className="m-0 text-body">{t.opis}</p>
        {zadluzenie && zadluzenie.rodzaj === 'zadluzenie-ponad-prog' ? (
          <Komunikat
            typ="WARNING"
            tresc={teksty.ViewFamilyPlan.straznik.zadluzeniePonadProg({
              data: formatujDate(zadluzenie.dzien),
              kwota: formatujKwote(zadluzenie.kwota),
              prog,
            })}
          />
        ) : null}
        {niedostepny ? <Komunikat kod="0150" /> : null}
      </div>
    </Karta>
  );
}
