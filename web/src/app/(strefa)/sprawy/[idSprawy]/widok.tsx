'use client';

// ViewCaseDetails: szczegóły sprawy planu (historyjki 3.6.1.2.1, 3.6.1.4.1; wzory Sprawa, P06-14, P06-15, P06-16).
// Tytuł, rodzaj, etap, rodzic, status, warunek spełniany przez rodzinę, instytucja i kanał, przejście do instrukcji,
// akcje e-ZLA i stanu rozliczeń składek, sekcje innych jednostek. Właściciel: u12.
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { czySprawaOplacenia, formaMatkiZDuch, progZadluzenia } from '@/domena/plan/straznik';
import type { Pochodzenie } from '@/domena/typy';
import { Kafelki } from '@/komponenty/kafelki';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji, type PozycjaListyDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { StatusSprawy } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import {
  czyDotyczyDziecka,
  etykietaRodzica,
  kwotaSprawy,
  pozycjaKatalogu,
  tytulEtapuZNumerem,
  tytulSprawy,
} from '@/app/(strefa)/plan-rodziny/_czesci/sprawy';
import { ArkuszRyzyka } from './_czesci/arkusz-ryzyka';
import { daneProfiluSprawy, kanalSprawy, spelnionyWarunek } from './_czesci/opis-sprawy';
import { sekcjeSprawy } from './_sekcje';

const t = teksty.ViewCaseDetails;
const POCHODZENIA: readonly Pochodzenie[] = ['plan', 'terminy', 'wnioski', 'asystent'];
const SPRAWY_ZE_STANEM_ROZLICZEN = ['K08', 'K24'];

export function WidokSprawy({ params }: { params: PageProps<'/sprawy/[idSprawy]'>['params'] }) {
  const { idSprawy: surowyId } = use(params);
  const idSprawy = decodeURIComponent(surowyId);
  const zapytanie = useSearchParams();
  const kontekst = useKontekstRodziny();
  const z = zapytanie.get('z');
  const pochodzenie = POCHODZENIA.find((p) => p === z);
  const arkuszRyzyka = zapytanie.get('arkusz') === 'ryzyko';

  const sprawa = kontekst?.rodzina.plan?.pozycje.find((p) => p.idSprawy === idSprawy);

  if (!kontekst || !sprawa) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} />
        <StanPusty
          ikona="plan"
          akcja={
            <PrzyciskLink wariant="drugorzedny" href={sciezkaWidoku('ViewFamilyPlan')}>
              {t.przejdzDoPlanu}
            </PrzyciskLink>
          }
        >
          {t.nieZnaleziono}
        </StanPusty>
      </>
    );
  }

  const { katalog, rodzina, dzis, rola, konto, daneZusMatki } = kontekst;
  const daneRodziny = rodzina.daneRodziny;
  const pozycja = pozycjaKatalogu(katalog, sprawa);
  const oplacenie = czySprawaOplacenia(sprawa.idSprawy);
  const wymagaUzupelnienia = sprawa.status === 'wymaga-uzupelnienia-profilu';
  const termin = rodzina.kalendarz?.terminy.find((tr) => tr.idSprawy === sprawa.idSprawy);
  const profil = sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' });

  const rodzic = etykietaRodzica(sprawa, rola);
  let osoba: string | null = null;
  if (sprawa.rodzic === 'matka' && daneZusMatki) osoba = `${daneZusMatki.imie} ${daneZusMatki.nazwisko}`;
  if (sprawa.rodzic === 'drugi-rodzic') {
    const imie = [daneRodziny.drugiRodzic.imie, daneRodziny.drugiRodzic.nazwisko].filter(Boolean).join(' ');
    osoba = imie || (rola === 'drugi-rodzic' ? `${konto.imie} ${konto.nazwisko}` : null);
  }

  const szczegoly: PozycjaListyDefinicji[] = [
    { etykieta: t.szczegoly.rodzaj, wartosc: t.rodzaje[sprawa.rodzaj] },
    { etykieta: t.szczegoly.etap, wartosc: tytulEtapuZNumerem(sprawa.etap) },
    { etykieta: t.szczegoly.kogo, wartosc: osoba ? t.szczegoly.osoba({ rodzic, osoba }) : rodzic },
    {
      etykieta: t.szczegoly.status,
      wartosc: (
        <StatusSprawy
          status={sprawa.status}
          zrodlo={sprawa.zrodloStatusu === 'wyliczenie-planu' ? undefined : sprawa.zrodloStatusu}
          data={sprawa.dataOznaczenia}
        />
      ),
    },
  ];
  const instytucja = oplacenie ? t.szczegoly.instytucjaOplacenia : pozycja?.instytucjaIKanal;
  if (instytucja) szczegoly.push({ etykieta: t.szczegoly.instytucja, wartosc: instytucja });
  if (!oplacenie && (czyDotyczyDziecka(sprawa) || sprawa.liczbaDzieci > 1)) {
    szczegoly.push({ etykieta: t.szczegoly.liczbaDzieci, wartosc: String(sprawa.liczbaDzieci) });
  }
  if (sprawa.kwota) szczegoly.push({ etykieta: t.szczegoly.kwota, wartosc: kwotaSprawy(sprawa) });
  const kanal = kanalSprawy(sprawa, pozycja, daneRodziny);
  if (kanal) szczegoly.push({ etykieta: t.szczegoly.kanal, wartosc: kanal });

  const warunek = spelnionyWarunek(sprawa, pozycja, daneRodziny);
  const wierszeProfilu = daneProfiluSprawy(sprawa, daneRodziny, rodzina.daneCiazy);
  const matkaJdg = formaMatkiZDuch(daneRodziny) === 'jdg' || daneRodziny.matka.formaZatrudnienia?.wartosc === 'jdg';
  const pokazSkladki =
    matkaJdg && sprawa.rodzic === 'matka' && (oplacenie || SPRAWY_ZE_STANEM_ROZLICZEN.includes(sprawa.idPozycji ?? ''));
  const pokazEzla = sprawa.idPozycji === 'K24';

  const zamknijArkuszRyzyka = () => {
    const adres = new URL(window.location.href);
    adres.searchParams.delete('arkusz');
    window.history.replaceState(null, '', `${adres.pathname}${adres.search}${adres.hash}`);
  };

  const kartaWarunku = wymagaUzupelnienia ? (
    <Karta tytul={t.brakuje.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        <p className="m-0 text-body">{t.brakuje.wstep}</p>
        <p className="m-0 text-body-strong">{warunek}</p>
        <p className="m-0 text-body">{t.brakuje.opis}</p>
        <Tabela
          podpis={t.brakuje.podpis}
          etykietaPrzewijania={t.dlaczego.przewijanie}
          kolumny={[
            { klucz: 'dane', naglowek: t.dlaczego.kolDane },
            { klucz: 'wartosc', naglowek: t.dlaczego.kolWartosc },
          ]}
          wiersze={[
            { id: 'zgoda', dane: t.brakuje.zgoda, wartosc: t.brakuje.stanyZgody[kontekst.stanZgody] },
            { id: 'ptp', dane: t.brakuje.ptp, wartosc: teksty.ViewFamilyPlan.daneProfilu.brakWartosci },
            { id: 'porod', dane: t.brakuje.dataPorodu, wartosc: teksty.ViewFamilyPlan.daneProfilu.brakWartosci },
          ]}
        />
      </div>
    </Karta>
  ) : (
    <Karta tytul={t.dlaczego.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        <p className="m-0 text-body">{t.dlaczego.wstep}</p>
        {warunek ? <p className="m-0 rounded-sm bg-surface-page p-4 text-body-strong">{warunek}</p> : null}
        <p className="m-0 text-body-strong">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
        {wierszeProfilu.length > 0 ? (
          <Tabela
            podpis={t.dlaczego.podpis}
            etykietaPrzewijania={t.dlaczego.przewijanie}
            kolumny={[
              { klucz: 'dane', naglowek: t.dlaczego.kolDane },
              { klucz: 'wartosc', naglowek: t.dlaczego.kolWartosc },
              { klucz: 'zrodlo', naglowek: t.dlaczego.kolZrodlo },
            ]}
            wiersze={wierszeProfilu}
          />
        ) : null}
        <Notatka>
          <p className="m-0">
            {t.dlaczego.notaPrzed}{' '}
            <Odnosnik href={profil} wTekscie>
              {teksty.ViewFamilyPlan.otworzProfil}
            </Odnosnik>{' '}
            {t.dlaczego.notaPo}
          </p>
        </Notatka>
      </div>
    </Karta>
  );

  const tresc = (
    <Stos odstep={7.5}>
      <Karta tytul={t.szczegoly.tytul} bezLinii>
        <ListaDefinicji pozycje={szczegoly} />
      </Karta>
      {kartaWarunku}
      {sekcjeSprawy.map(({ id, Komponent }) => (
        <Komponent key={id} sprawa={sprawa} termin={termin} kontekst={kontekst} pochodzenie={pochodzenie} />
      ))}
    </Stos>
  );

  const boczna = (
    <Stos odstep={7.5}>
      <Karta tytul={t.jak.tytul} bezLinii>
        <div className="flex flex-col gap-6">
          <p className="m-0 text-body">{sprawa.poPorodzie ? t.jak.opisPoPorodzie : t.jak.opis}</p>
          {wymagaUzupelnienia ? (
            <PrzyciskLink wariant="glowny" szerokosc="pelna" href={profil}>
              {t.brakuje.uzupelnij}
            </PrzyciskLink>
          ) : null}
          <PrzyciskLink
            wariant={wymagaUzupelnienia || sprawa.poPorodzie ? 'drugorzedny' : 'glowny'}
            szerokosc="pelna"
            href={sciezkaWidoku('ViewCaseGuide', { idSprawy: sprawa.idSprawy, ...(pochodzenie ? { z: pochodzenie } : {}) })}
          >
            {t.jak.przejdz}
          </PrzyciskLink>
        </div>
      </Karta>
      {pokazEzla ? (
        <Karta tytul={t.ezla.tytul} bezLinii>
          <Kafelki kafelki={[{ href: sciezkaWidoku('ViewSickLeaveList'), etykieta: t.ezla.kafelek }]} />
        </Karta>
      ) : null}
      {pokazSkladki ? (
        <Karta tytul={t.skladki.tytul} bezLinii>
          <div className="flex flex-col gap-6">
            <p className="m-0 text-body">{t.skladki.opis({ prog: formatujKwote(progZadluzenia(katalog, dzis)) })}</p>
            <Kafelki kafelki={[{ href: sciezkaWidoku('ViewContributionBalance'), etykieta: t.skladki.kafelek }]} />
          </div>
        </Karta>
      ) : null}
    </Stos>
  );

  return (
    <>
      <NaglowekStrony tytul={tytulSprawy(katalog, sprawa)} stanNa={dzis} />
      <Stos odstep={7.5}>
        {wymagaUzupelnienia && kontekst.stanZgody !== 'udzielona' ? <Komunikat kod="0004" /> : null}
        <UkladDwuKolumnowy tresc={tresc} boczna={boczna} />
      </Stos>
      <ArkuszRyzyka otwarte={arkuszRyzyka} onZamknij={zamknijArkuszRyzyka} />
    </>
  );
}
