'use client';

// Sekcja ViewCaseGuide „akcja-podzialu-urlopu” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u26.
// Karta „Podział urlopu rodzicielskiego” z akcją planowania podziału przy sprawie K10 (3.10.2, zadanie 4).
// Teksty: teksty.ViewCaseGuide.sekcjaAkcjaPodzialuUrlopu.
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { daneDzieckaDoKalkulatora, maPrawoDoZasilku } from '@/domena/kalkulatory/wariant';
import { tygodniePrzepadajace, wartosciStartowe, zasadyPodzialu } from '@/domena/kalkulatory/podzial';
import { ostatniPodzial } from '@/app/(strefa)/kalkulatory/_czesci/dane-kalkulatorow';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaPodzialuUrlopu;

function Wiersz({ etykieta, wartosc }: { etykieta: string; wartosc: string }) {
  return (
    <div>
      <p className="m-0 text-body">{etykieta}</p>
      <p className="m-0 text-body-strong">{wartosc}</p>
    </div>
  );
}

export function SekcjaAkcjaPodzialuUrlopu({ sprawa, kontekst }: PropsSlotu<'akcja'>) {
  if (sprawa.idPozycji !== 'K10') return null;
  const { rodzina, katalog, dzis, konto } = kontekst;
  const dane = rodzina.daneRodziny;
  const dziecko = daneDzieckaDoKalkulatora(rodzina.daneCiazy);
  const z = zasadyPodzialu(dziecko.liczbaDzieci, dziecko.zaZyciem, katalog, dziecko.dataPorodu ?? dzis);
  const forma = dane.drugiRodzic.formaZatrudnienia?.wartosc ?? null;
  const bezPrawa = forma !== null && !maPrawoDoZasilku(forma, dane.drugiRodzic.dobrowolneChorobowe?.wartosc);
  const wybrany = sprawa.wybranyWariant && 'tygodnieMatki' in sprawa.wybranyWariant ? sprawa.wybranyWariant : undefined;
  const zapis = ostatniPodzial(rodzina.wynikiKalkulacji);
  const domyslny = wartosciStartowe(z, bezPrawa);
  const imie = dane.drugiRodzic.imie ?? t.drugiRodzic;
  const jestemDrugimRodzicem = konto.rola === 'drugi-rodzic';
  const dzieci = `${dziecko.liczbaDzieci === 1 ? t.przyJednymDziecku : t.przyWiecejDzieciach}${dziecko.zaZyciem ? t.zZaZyciem : ''}`;

  const zapisal = (() => {
    if (!wybrany) return '';
    if (wybrany.zapisal === konto.pesel) return `${konto.imie} ${konto.nazwisko}`;
    if (wybrany.zapisal === dane.drugiRodzic.pesel) return [dane.drugiRodzic.imie, dane.drugiRodzic.nazwisko].filter(Boolean).join(' ');
    return '';
  })();

  let opis: React.ReactNode;
  if (wybrany) {
    const przepada = tygodniePrzepadajace(wybrany.tygodnieMatki, wybrany.tygodnieDrugiegoRodzica, z.nieprzenoszalne);
    const miesiecznie = zapis?.wynik.miesiecznie['drugi-rodzic'];
    const suma = zapis?.wynik.sumy['drugi-rodzic'];
    const podzial = { matki: t.tygodnie(wybrany.tygodnieMatki), drugiego: t.tygodnie(wybrany.tygodnieDrugiegoRodzica) };
    opis = (
      <>
        <p className="m-0 flex items-start gap-2 text-body">
          <Ikona nazwa="sukces" rozmiar={20} className="mt-0.5 shrink-0 text-success-text" />
          <span>
            {t.wybrany}
            <strong>{jestemDrugimRodzicem ? t.wybranyPodzialTwoje(podzial) : t.wybranyPodzial(podzial)}</strong>
            {przepada === 0 ? t.nicNiePrzepada : t.przepada({ tygodnie: t.tygodnie(przepada) })}
          </span>
        </p>
        {miesiecznie !== undefined && suma !== undefined ? (
          <p className="m-0 text-body">
            {(jestemDrugimRodzicem ? t.szacunkowoTwoje : t.szacunkowo)({
              kwota: formatujKwote(miesiecznie),
              suma: formatujKwote(suma),
              tygodnie: t.tygodnie(wybrany.tygodnieDrugiegoRodzica),
            })}
          </p>
        ) : null}
      </>
    );
  } else {
    opis = (
      <>
        <p className="m-0 text-body">{t.opisWymiaru({ dzieci, wymiar: t.tygodnie(z.wymiar), imie })}</p>
        <p className="m-0 text-body">{t.opisPlanu}</p>
      </>
    );
  }

  return (
    <Karta tytul={t.tytul} bezLinii>
      <div className="flex flex-wrap items-start gap-7.5">
        <div className="flex min-w-0 grow basis-105 flex-col gap-4">
          {opis}
          <div className="flex flex-wrap items-center gap-4">
            <PrzyciskLink href={trasy.ViewCalcParentalSplit({ sprawa: 'K10' })} wariant={wybrany ? 'drugorzedny' : 'glowny'}>
              {wybrany ? t.zmien : t.zaplanuj}
            </PrzyciskLink>
          </div>
        </div>
        <div className="flex min-w-0 grow basis-84 flex-col gap-4 rounded-md bg-surface-page p-5">
          <p className="m-0 text-body-strong">{t.stanNa({ data: formatujDate(dzis) })}</p>
          <Wiersz
            etykieta={t.zapisanyPlan}
            wartosc={wybrany ? t.wybranyPodzial({ matki: t.tygodnie(wybrany.tygodnieMatki), drugiego: t.tygodnie(wybrany.tygodnieDrugiegoRodzica) }) : t.nieZapisano}
          />
          {wybrany ? (
            <>
              <Wiersz etykieta={t.zapisanoEtykieta} wartosc={t.zapisanoPrzez({ data: formatujDate(wybrany.zapisano), osoba: zapisal })} />
              <Wiersz
                etykieta={t.przepadaEtykieta}
                wartosc={t.tygodnie(tygodniePrzepadajace(wybrany.tygodnieMatki, wybrany.tygodnieDrugiegoRodzica, z.nieprzenoszalne))}
              />
            </>
          ) : (
            <>
              <Wiersz
                etykieta={t.podzialDomyslny}
                wartosc={t.wybranyPodzial({ matki: t.tygodnie(domyslny.tygodnieMatki), drugiego: t.tygodnie(domyslny.tygodnieDrugiegoRodzica) })}
              />
              <Wiersz etykieta={t.tygodnieTylkoDla({ imie: dane.drugiRodzic.imieINazwiskoDopelniacz ?? imie })} wartosc={t.tygodnie(z.nieprzenoszalne)} />
            </>
          )}
        </div>
      </div>
    </Karta>
  );
}
