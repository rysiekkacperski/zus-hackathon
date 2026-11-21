'use client';

// Sekcja ViewCaseDetails „prawo-w-ciazy” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u16.
// Na sprawach K24, K25, K26 i K27 pokazuje wynik ustalenia prawa i akcję otwarcia ViewPregnancyBenefits.
// Teksty: teksty.ViewCaseDetails.sekcjaPrawoWCiazy.
import { useMemo } from 'react';
import { etykietaWyniku } from '@/app/(strefa)/plan-rodziny/swiadczenia-w-ciazy/_czesci/elementy';
import { czyKontoMatki, swiadczeniaDlaKontekstu } from '@/app/(strefa)/plan-rodziny/swiadczenia-w-ciazy/widok';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujDate } from '@/domena/daty';
import type { KodKomunikatu, WynikUstaleniaPrawa } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const T = teksty.ViewCaseDetails.sekcjaPrawoWCiazy;
const SPRAWY = ['K24', 'K25', 'K26', 'K27'];

export function SekcjaPrawoWCiazy({ sprawa, kontekst }: PropsSlotu<'sekcja'>) {
  const dotyczy = sprawa.idPozycji !== null && SPRAWY.includes(sprawa.idPozycji);
  const swiadczenia = useMemo(() => (dotyczy ? swiadczeniaDlaKontekstu(kontekst) : null), [dotyczy, kontekst]);
  if (!dotyczy || swiadczenia === null) return null;
  const wynik: WynikUstaleniaPrawa | undefined =
    sprawa.idPozycji === 'K24' ? swiadczenia.zasilekChorobowy.wynik
      : sprawa.idPozycji === 'K25' ? swiadczenia.rehabilitacyjne.wynik
        : sprawa.idPozycji === 'K26' ? swiadczenia.zwzm.wynik
          : undefined;
  const etykieta = wynik
    ? etykietaWyniku(wynik, {
        bezZgody: !swiadczenia.zgoda,
        drugiRodzic: !czyKontoMatki(kontekst),
        warunekSkladek: wynik.swiadczenie === 'zasilek-chorobowy' && swiadczenia.zasilekChorobowy.warunekZadluzenia !== undefined,
      })
    : null;
  return (
    <Karta tytul={T.tytul}>
      {etykieta ? <p className="m-0 text-body-strong text-ink-strong">{etykieta}</p> : null}
      {wynik?.postac === 'przysluguje' && wynik.od ? <p className="m-0 mt-2 text-body">{T.od({ data: formatujDate(wynik.od) })}</p> : null}
      {wynik?.kodKomunikatu ? (
        <Komunikat kod={wynik.kodKomunikatu as KodKomunikatu} parametry={wynik.parametryKomunikatu as never} className="mt-4" />
      ) : null}
      <p className="m-0 mt-4 text-body">{T.opis}</p>
      <div className="mt-4">
        <PrzyciskLink href={trasy.ViewPregnancyBenefits()} wariant="drugorzedny">{T.otworz}</PrzyciskLink>
      </div>
    </Karta>
  );
}
