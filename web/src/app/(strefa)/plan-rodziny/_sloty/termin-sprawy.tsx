'use client';

// Slot ViewFamilyPlan „termin-sprawy” w liście slotyPrzySprawie (kontrakt, sekcja 12.4). Właściciel: u13.
// Termin, liczba dni, oznaczenie po terminie i koszt albo skutek spóźnienia przy sprawie do zrobienia (wzory P07-07, P07-08).
// Teksty: teksty.ViewFamilyPlan.terminSprawy.
import { wyjasnienieKosztu } from '@/app/(strefa)/terminy/_czesci/prezentacja';
import { formatujDate, roznicaDni } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { czyKosztMinimalny } from '@/domena/terminy/koszt';
import { statusDlaKalendarza } from '@/domena/terminy/wylicz-terminy';
import { formatujLiczbe } from '@/komponenty/format';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewFamilyPlan.terminSprawy;

function Dni({ data, dzis }: { data: string; dzis: string }) {
  const dni = roznicaDni(dzis, data);
  if (dni < 0) {
    return (
      <>
        <span className="block font-semibold text-ink-strong">{t.poTerminie}</span>
        <span className="block">{t.minal({ liczba: formatujLiczbe(-dni) })}</span>
      </>
    );
  }
  return <span className="block">{dni === 0 ? t.dzisTermin : t.dniDoTerminu({ liczba: formatujLiczbe(dni) })}</span>;
}

export function SlotTerminSprawy({ sprawa, termin, kontekst }: PropsSlotu<'przySprawie'>) {
  if (!termin || statusDlaKalendarza(sprawa, kontekst.dzis) !== 'do-zrobienia') return null;
  if (termin.termin === null && termin.koszt.rodzaj === 'brak') return null;
  const koszt = termin.koszt;
  const daty = [termin.termin, termin.drugiTermin?.data].filter((d): d is string => !!d).sort();
  return (
    <div className="flex flex-wrap gap-x-7.5 gap-y-2 text-body">
      <div className="min-w-0">
        <span className="sr-only">{t.etykietaTerminu}: </span>
        {daty.length === 0 ? (
          <span>{t.brakTerminu}</span>
        ) : (
          daty.map((d) => (
            <span key={d} className="block">
              <span className="block font-semibold text-ink-strong">{formatujDate(d)}</span>
              <Dni data={d} dzis={kontekst.dzis} />
            </span>
          ))
        )}
        {termin.szacowany ? <span className="block font-semibold text-ink-strong">{t.szacowany}</span> : null}
      </div>
      <div className="min-w-0 flex-[1_1_240px]">
        <span className="sr-only">{t.etykietaKosztu}: </span>
        {koszt.rodzaj === 'brak' ? (
          <span>{t.brakTerminu}</span>
        ) : koszt.rodzaj === 'skutek' ? (
          <span>
            {t.skutek} {koszt.tekst}
          </span>
        ) : (
          <span>
            {t.koszt} {czyKosztMinimalny(sprawa.idPozycji) ? `${t.coNajmniej} ` : null}
            <span className="font-semibold text-ink-strong">{formatujKwote(koszt.kwota)}</span>{' '}
            {koszt.moment === 'na-dzis' ? t.naDzis : t.wDniuPoTerminie}
            {(() => {
              const w = koszt.moment === 'na-dzis' ? wyjasnienieKosztu(koszt, sprawa.idPozycji) : null;
              return w ? ` – ${w}` : null;
            })()}
          </span>
        )}
      </div>
    </div>
  );
}
