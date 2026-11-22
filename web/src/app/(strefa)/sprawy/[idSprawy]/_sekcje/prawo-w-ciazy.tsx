'use client';

// Sekcja ViewCaseDetails „prawo-w-ciazy” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u16.
// Na sprawach K24, K25, K26 i K27 pokazuje wynik ustalenia prawa i akcję otwarcia ViewPregnancyBenefits, a matce
// na umowie zlecenia albo z jednoosobową działalnością gospodarczą informację o zakresie szczególnej ochrony.
// Wynik ustalenia prawa liczy serwer (POST /api/v1/swiadczenia-w-ciazy), to samo żądanie co ViewPregnancyBenefits.
// Teksty: teksty.ViewCaseDetails.sekcjaPrawoWCiazy.
import { etykietaWyniku } from '@/app/(strefa)/plan-rodziny/swiadczenia-w-ciazy/_czesci/elementy';
import { czyKontoMatki, useSwiadczeniaWCiazyApi } from '@/app/(strefa)/plan-rodziny/swiadczenia-w-ciazy/widok';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { BladWyliczenia, SzkieletWyliczenia } from '@/komponenty/stan-wyliczenia';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujDate } from '@/domena/daty';
import type { KodKomunikatu, WynikUstaleniaPrawa } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const T = teksty.ViewCaseDetails.sekcjaPrawoWCiazy;
const TR = teksty.ViewPregnancyBenefits.ryzyka;
const SPRAWY = ['K24', 'K25', 'K26', 'K27'];

export function SekcjaPrawoWCiazy({ sprawa, kontekst }: PropsSlotu<'sekcja'>) {
  const dotyczy = sprawa.idPozycji !== null && SPRAWY.includes(sprawa.idPozycji);
  const wyliczenie = useSwiadczeniaWCiazyApi(dotyczy ? kontekst : null);
  const swiadczenia = wyliczenie.wartosc?.swiadczenia ?? null;
  if (!dotyczy) return null;
  if (swiadczenia === null) {
    return (
      <Karta tytul={T.tytul}>
        {wyliczenie.blad ? (
          <BladWyliczenia kod={wyliczenie.blad.kod} parametry={wyliczenie.blad.parametry as never} onPonow={wyliczenie.ponow} />
        ) : (
          <SzkieletWyliczenia wysokosc="niski" />
        )}
      </Karta>
    );
  }
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
      {/* Szczególna ochrona z Kodeksu pracy obejmuje wyłącznie pracownicę; matce na umowie zlecenia i z JDG system
          mówi to wprost, bo jej plan nie zawiera sprawy K30 (art. 177 Kodeksu pracy, Dz.U. 2026 poz. 1245). */}
      {swiadczenia.forma === 'umowa-zlecenia' || swiadczenia.forma === 'jdg' ? (
        <div className="mt-4 rounded-sm bg-surface-page px-4 py-3">
          <p className="m-0 text-body-strong text-ink-strong">{T.ochronaTytul}</p>
          <p className="m-0 mt-1 text-body">{TR.ochrona.bezUmowyOPrace}</p>
        </div>
      ) : null}
      <div className="mt-4">
        <PrzyciskLink href={trasy.ViewPregnancyBenefits()} wariant="drugorzedny">{T.otworz}</PrzyciskLink>
      </div>
    </Karta>
  );
}
