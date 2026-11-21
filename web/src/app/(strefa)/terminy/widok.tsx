'use client';

// ViewDeadlines: terminy rodziny od najbliższego w sekcjach po terminie, najbliższe 30 dni i później (Story 3.7.1.3.1).
// Wzory: cz1/Terminy, P07-02..P07-06. Właściciel: u13.
import { useMemo, useState } from 'react';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { dodajDni, formatujDate, miesiacZDaty } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import {
  licznikiFiltrow,
  sekcjeTerminow,
  type KogoDotyczyFiltr,
  type RodzajFiltruTerminow,
  type TerminNaLiscie,
} from '@/domena/terminy/lista';
import type { PozycjaPlanu } from '@/domena/typy';
import { Chipy } from '@/komponenty/chipy';
import { etykieta } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { miesiacNaglowka, osobyRodziny } from './_czesci/prezentacja';
import { PozycjaTerminu } from './_czesci/pozycja-terminu';
import { slotyTerminow } from './_sloty';

const t = teksty.ViewDeadlines;

function grupyMiesiecy(terminy: TerminNaLiscie[]): { miesiac: string; terminy: TerminNaLiscie[] }[] {
  const grupy: { miesiac: string; terminy: TerminNaLiscie[] }[] = [];
  for (const termin of terminy) {
    const m = miesiacZDaty(termin.termin);
    const ostatnia = grupy[grupy.length - 1];
    if (ostatnia && ostatnia.miesiac === m) ostatnia.terminy.push(termin);
    else grupy.push({ miesiac: m, terminy: [termin] });
  }
  return grupy;
}

function ListaSekcji({
  terminy,
  plan,
  kontekst,
  grupuj,
}: {
  terminy: TerminNaLiscie[];
  plan: PozycjaPlanu[];
  kontekst: NonNullable<ReturnType<typeof useKontekstRodziny>>;
  grupuj: boolean;
}) {
  const elementy = (lista: TerminNaLiscie[]) => (
    <ul className="m-0 list-none p-0">
      {lista.map((termin, i) => {
        const sprawa = plan.find((p) => p.idSprawy === termin.idSprawy);
        if (!sprawa) return null;
        return (
          <PozycjaTerminu
            key={`${termin.idSprawy}-${termin.drugi ? 'drugi' : 'pierwszy'}`}
            termin={termin}
            sprawa={sprawa}
            kontekst={kontekst}
            ostatnia={i === lista.length - 1}
          />
        );
      })}
    </ul>
  );
  if (!grupuj) return elementy(terminy);
  return (
    <>
      {grupyMiesiecy(terminy).map((g, i) => (
        <div key={g.miesiac}>
          <h3 className={['m-0 rounded-sm bg-surface-page px-4 py-2 text-body font-semibold', i === 0 ? 'mt-4' : 'mt-2'].join(' ')}>
            {miesiacNaglowka(g.miesiac)}
          </h3>
          {elementy(g.terminy)}
        </div>
      ))}
    </>
  );
}

export function WidokTerminow() {
  const kontekst = useKontekstRodziny();
  const [rodzaj, ustawRodzaj] = useState<RodzajFiltruTerminow>('wszystkie');
  const [kogo, ustawKogo] = useState<KogoDotyczyFiltr>('wszyscy');

  const dzis = kontekst?.dzis ?? '';
  const plan = kontekst?.rodzina.plan ?? null;
  const kalendarz = kontekst?.rodzina.kalendarz ?? null;
  const rolaPrzyjmujacego = kontekst?.rodzina.daneCiazy?.przyjecie?.rolaRodzicaPrzyjmujacego;

  const dane = useMemo(() => {
    if (!plan || !kalendarz || !dzis) return null;
    const filtry = { rodzaj, kogo, rolaRodzicaPrzyjmujacego: rolaPrzyjmujacego };
    const sekcje = sekcjeTerminow(kalendarz, plan, dzis, filtry);
    const wszystkie = sekcjeTerminow(kalendarz, plan, dzis, {});
    const liczniki = licznikiFiltrow(kalendarz, plan, dzis, { kogo, rolaRodzicaPrzyjmujacego: rolaPrzyjmujacego });
    const razem = wszystkie.poTerminie.length + wszystkie.najblizsze30Dni.length + wszystkie.pozniej.length;
    const widoczne = sekcje.poTerminie.length + sekcje.najblizsze30Dni.length + sekcje.pozniej.length;
    const listaWszystkich = [...wszystkie.poTerminie, ...wszystkie.najblizsze30Dni, ...wszystkie.pozniej];
    return {
      sekcje,
      liczniki,
      razem,
      widoczne,
      poTerminie: wszystkie.poTerminie.length,
      szacowane: listaWszystkich.filter((x) => x.szacowany).length,
    };
  }, [plan, kalendarz, dzis, rodzaj, kogo, rolaPrzyjmujacego]);

  const akcje = kontekst ? (
    <>
      {slotyTerminow.map(({ id, Komponent }) => (
        <Komponent key={id} kontekst={kontekst} />
      ))}
    </>
  ) : undefined;

  const naglowek = <NaglowekStrony tytul={t.naglowek} stanNa={dzis || undefined} wstep={t.wstep} akcje={akcje} />;

  if (!kontekst || !dane || !plan) {
    return (
      <>
        {naglowek}
        <PustyStan />
      </>
    );
  }

  if (dane.razem === 0) {
    return (
      <>
        {naglowek}
        <PustyStan />
      </>
    );
  }

  const osoby = osobyRodziny(kontekst);
  const opcjeKogo: { wartosc: KogoDotyczyFiltr; etykieta: string }[] = [
    { wartosc: 'wszyscy', etykieta: t.filtry.wszyscy },
    { wartosc: 'matka', etykieta: osoby.matka ? t.rodzic.matka({ imieINazwisko: osoby.matka }) : t.rodzic.matkaBezImienia },
    { wartosc: 'drugi-rodzic', etykieta: osoby.drugiRodzic ? t.rodzic.drugiRodzic({ imieINazwisko: osoby.drugiRodzic }) : t.rodzic.drugiRodzicBezImienia },
  ];
  const aktywneFiltry = [
    rodzaj === 'z-kosztem' ? t.filtry.nazwaZKosztem : null,
    rodzaj === 'powtarzalne' ? t.filtry.nazwaPowtarzalne : null,
    kogo !== 'wszyscy' ? (opcjeKogo.find((o) => o.wartosc === kogo)?.etykieta ?? '').replace(/^./, (z) => z.toLowerCase()) : null,
  ].filter((x): x is string => x !== null);

  const granica = formatujDate(dodajDni(dzis, 30));
  const odDnia = formatujDate(dodajDni(dzis, 31));
  const { sekcje } = dane;
  const daneCiazy = kontekst.rodzina.daneCiazy;
  const daneRodziny = kontekst.rodzina.daneRodziny;
  const dochod = daneRodziny.dochodNaOsobe?.wartosc;
  const dr = daneRodziny.drugiRodzic;
  const formaDr = dr.formaZatrudnienia?.wartosc;
  const opisDrugiego = osoby.drugiRodzic
    ? [osoby.drugiRodzic, formaDr ? etykieta(t.daneProfilu.formy, formaDr) : null].filter(Boolean).join(', ')
    : t.daneProfilu.brak;
  const pozycjeProfilu: { e: string; w: string }[] = daneCiazy?.przyjecie
    ? [
        { e: t.daneProfilu.dataPrzyjecia, w: formatujDate(daneCiazy.przyjecie.dataPrzyjecia) },
        { e: t.daneProfilu.dataUrodzeniaDziecka, w: formatujDate(daneCiazy.przyjecie.dataUrodzeniaDziecka) },
        {
          e: t.daneProfilu.dataUprawomocnienia,
          w: daneCiazy.przyjecie.dataUprawomocnienia ? formatujDate(daneCiazy.przyjecie.dataUprawomocnienia) : t.daneProfilu.brak,
        },
      ]
    : [
        { e: t.daneProfilu.ptp, w: daneCiazy?.przewidywanyTerminPorodu ? formatujDate(daneCiazy.przewidywanyTerminPorodu) : t.daneProfilu.brak },
        {
          e: t.daneProfilu.dataPorodu,
          w: daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu ? formatujDate(daneCiazy.dataPorodu) : t.daneProfilu.brak,
        },
        {
          e: t.daneProfilu.wizyta,
          w:
            daneCiazy?.dataPierwszejWizyty === 'brak-wizyty'
              ? t.daneProfilu.brakWizyty
              : daneCiazy?.dataPierwszejWizyty
                ? formatujDate(daneCiazy.dataPierwszejWizyty)
                : t.daneProfilu.brak,
        },
        { e: t.daneProfilu.liczbaDzieci, w: String(daneCiazy?.liczbaUrodzonychDzieci ?? daneCiazy?.liczbaDzieciZCiazy ?? t.daneProfilu.brak) },
      ];
  pozycjeProfilu.push(
    { e: t.daneProfilu.dochod, w: dochod === undefined ? t.daneProfilu.brak : dochod === 'nieznany' ? t.daneProfilu.dochodNieznany : formatujKwote(dochod) },
    { e: t.daneProfilu.drugiRodzic, w: opisDrugiego },
  );

  return (
    <>
      {naglowek}
      <Stos odstep={7.5} className="max-w-tresc">
        <div className="flex flex-wrap items-end justify-between gap-x-7.5 gap-y-4">
          <Chipy<RodzajFiltruTerminow>
            etykieta={t.filtry.etykieta}
            steruje="lista-terminow"
            wybrana={rodzaj}
            onWybor={ustawRodzaj}
            opcje={[
              { wartosc: 'wszystkie', etykieta: t.filtry.wszystkie({ liczba: String(dane.liczniki.wszystkie) }) },
              { wartosc: 'z-kosztem', etykieta: t.filtry.zKosztem({ liczba: String(dane.liczniki['z-kosztem']) }) },
              { wartosc: 'powtarzalne', etykieta: t.filtry.powtarzalne({ liczba: String(dane.liczniki.powtarzalne) }) },
            ]}
          />
          <div className="min-w-0 flex-[0_1_300px]">
            <PoleWyboru<KogoDotyczyFiltr>
              id="kogo-dotyczy"
              etykieta={t.filtry.kogoDotyczy}
              opcje={opcjeKogo}
              wartosc={kogo}
              onZmiana={(w) => ustawKogo(w === '' ? 'wszyscy' : w)}
            />
          </div>
        </div>
        {aktywneFiltry.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <p className="m-0 text-body" role="status">
              {t.filtry.opis({ lista: aktywneFiltry.join(', ') })} {t.filtry.terminy} <strong>{dane.widoczne}</strong> {t.filtry.z}{' '}
              <strong>{dane.razem}</strong>
            </p>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-body font-semibold text-brand hover:text-brand-deep hover:underline"
              onClick={() => {
                ustawRodzaj('wszystkie');
                ustawKogo('wszyscy');
              }}
            >
              {t.filtry.wyczysc}
            </button>
          </div>
        ) : (
          <p className="m-0 text-body">
            {t.licznik.terminy} <strong>{dane.razem}</strong>, {t.licznik.poTerminie} <strong>{dane.poTerminie}</strong>, {t.licznik.szacowane}{' '}
            <strong>{dane.szacowane}</strong>
          </p>
        )}
        {dane.szacowane > 0 && daneCiazy?.przewidywanyTerminPorodu ? (
          <Notatka>
            <p className="m-0">{t.notaSzacowane({ data: formatujDate(daneCiazy.przewidywanyTerminPorodu) })}</p>
          </Notatka>
        ) : null}
        <Stos odstep={7.5} id="lista-terminow">
          {sekcje.poTerminie.length > 0 ? (
            <Karta tytul={t.sekcje.poTerminie({ liczba: String(sekcje.poTerminie.length) })} bezLinii>
              <p className="m-0 text-body">{t.sekcje.poTerminieOpis}</p>
              <ListaSekcji terminy={sekcje.poTerminie} plan={plan.pozycje} kontekst={kontekst} grupuj={false} />
            </Karta>
          ) : null}
          <Karta tytul={t.sekcje.najblizsze({ liczba: String(sekcje.najblizsze30Dni.length) })} bezLinii>
            {sekcje.najblizsze30Dni.length > 0 ? (
              <>
                <p className="m-0 text-body">{t.sekcje.najblizszeOpis({ data: granica })}</p>
                <ListaSekcji terminy={sekcje.najblizsze30Dni} plan={plan.pozycje} kontekst={kontekst} grupuj={false} />
              </>
            ) : (
              <p className="m-0 text-body">
                {rodzaj === 'z-kosztem' ? t.sekcje.najblizszePusteZKosztem({ data: granica }) : t.sekcje.najblizszePuste({ data: granica })}
              </p>
            )}
          </Karta>
          <Karta tytul={t.sekcje.pozniej({ liczba: String(sekcje.pozniej.length) })} bezLinii>
            {sekcje.pozniej.length > 0 ? (
              <>
                <p className="m-0 text-body">{t.sekcje.pozniejOpis({ data: odDnia })}</p>
                <ListaSekcji terminy={sekcje.pozniej} plan={plan.pozycje} kontekst={kontekst} grupuj />
              </>
            ) : (
              <p className="m-0 text-body">{t.sekcje.pozniejPuste({ data: odDnia })}</p>
            )}
          </Karta>
        </Stos>
        {rodzaj === 'z-kosztem' ? (
          <Notatka>
            <p className="m-0">{t.noty.zKosztem}</p>
          </Notatka>
        ) : (
          <>
            <Karta tytul={t.daneProfilu.tytul} bezLinii>
              <p className="m-0 text-body">{t.daneProfilu.wstep}</p>
              <dl className="m-0 mt-4 flex flex-wrap gap-x-7.5 gap-y-4">
                {pozycjeProfilu.map((p) => (
                  <div key={p.e} className="min-w-0 flex-[1_1_260px]">
                    <dt className="text-body font-semibold">{p.e}</dt>
                    <dd className="m-0 text-body text-ink-strong">{p.w}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6">
                <PrzyciskLink href={sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })} wariant="drugorzedny">
                  {t.daneProfilu.zmien}
                </PrzyciskLink>
              </div>
            </Karta>
            <Stos odstep={3}>
              <Notatka>
                <p className="m-0">
                  {t.noty.przeliczanie}{' '}
                  <Odnosnik wTekscie href={sciezkaWidoku('ViewFamilyPlan')}>
                    {t.noty.planieRodziny}
                  </Odnosnik>
                  .
                </p>
              </Notatka>
              <Notatka>
                <p className="m-0">
                  {t.noty.przypomnienia}{' '}
                  <Odnosnik wTekscie href={sciezkaWidoku('ViewGuideSettings')}>
                    {t.noty.ustawieniach}
                  </Odnosnik>
                  .
                </p>
              </Notatka>
            </Stos>
          </>
        )}
      </Stos>
    </>
  );
}

function PustyStan() {
  return (
    <Stos odstep={7.5} className="max-w-tresc">
      <section aria-label={t.sekcje.listaTerminow} className="rounded-sm bg-surface-card p-5">
        <StanPusty
          ikona="kalendarz-pusty"
          akcja={
            <PrzyciskLink href={sciezkaWidoku('ViewFamilyPlan')} wariant="glowny">
              {t.pusty.akcja}
            </PrzyciskLink>
          }
        >
          <p>{t.pusty.tekst}</p>
        </StanPusty>
      </section>
      <Notatka>
        <p className="m-0">{t.pusty.nota}</p>
      </Notatka>
    </Stos>
  );
}
