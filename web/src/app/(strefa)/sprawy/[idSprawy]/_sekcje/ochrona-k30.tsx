'use client';

// Sekcja ViewCaseDetails „ochrona-k30” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u22.
// Szczególna ochrona pracownika sprawy K30 dla rodzica na umowie o pracę: przedłużenie umowy do dnia porodu (0121, 0157),
// okresy ochrony z wniosków o urlop (0158) i zasady ochrony z odnośnikiem PIP (wzory cz2/P18-08 do P18-13).
import { useState } from 'react';
import { idSprawyPozycji } from '@/app/(strefa)/sprawy/[idSprawy]/_czesci/arkusz-ryzyka';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { zapiszRodzajUmowy } from '@/dane/magazyn/operacje/ryzyka-i-podmioty';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  RODZAJE_UMOWY_TERMINOWEJ,
  czyKoniecUmowyTerminowej,
  czyRodzajUmowyTerminowej,
  uplywTrzeciegoMiesiaca,
  ustalPrzedluzenieUmowy,
  type RodzajUmowyTerminowej,
} from '@/domena/przewodnik/ryzyka';
import { okresyOchronyWnioskow } from '@/domena/wnioski/ochrona';
import type { DaneRodzica, KodKomunikatu, Pochodzenie, RodzicWRodzinie } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik, OdnosnikZewnetrzny } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const tekst = teksty.ViewCaseDetails.sekcjaOchronaK30;

/** Serwis Państwowej Inspekcji Pracy o rodzicielstwie (KA-02 3.5.3.1.2). */
const ADRES_PIP = 'https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo';

function daneRodzica(kontekst: KontekstRodziny, rodzic: RodzicWRodzinie): DaneRodzica {
  const dane = kontekst.rodzina.daneRodziny;
  return rodzic === 'matka' ? dane.matka : (dane.drugiRodzic as unknown as DaneRodzica);
}

function formaRodzica(kontekst: KontekstRodziny, rodzic: RodzicWRodzinie): string | undefined {
  const dane = kontekst.rodzina.daneRodziny;
  return (rodzic === 'matka' ? dane.matka.formaZatrudnienia : dane.drugiRodzic.formaZatrudnienia)?.wartosc;
}

function rodziceSprawy(rodzic: string): RodzicWRodzinie[] {
  if (rodzic === 'matka') return ['matka'];
  if (rodzic === 'drugi-rodzic') return ['drugi-rodzic'];
  return ['matka', 'drugi-rodzic'];
}

function KartaPrzedluzenia({ kontekst, rodzic, poziom, pochodzenie, przyrostek }: { kontekst: KontekstRodziny; rodzic: RodzicWRodzinie; poziom: 2 | 3; pochodzenie?: Pochodzenie; przyrostek: string }) {
  const dane = daneRodzica(kontekst, rodzic);
  const zapisany = dane.rodzajUmowy?.wartosc;
  const odpowiedz = czyRodzajUmowyTerminowej(zapisany) ? zapisany : null;
  const [wybor, setWybor] = useState<RodzajUmowyTerminowej | null>(odpowiedz);
  const [edycja, setEdycja] = useState(odpowiedz === null);
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const [zajety, setZajety] = useState(false);

  const dataUstania = dane.zmianaZatrudnienia?.data?.wartosc;
  if (dataUstania === undefined) return null;
  const daneCiazy = kontekst.rodzina.daneCiazy;
  const ptp = daneCiazy?.przewidywanyTerminPorodu;
  const nazwa = `rodzaj-umowy-${rodzic}`;
  const plec = kontekst.konto.plec;

  function zapisz() {
    if (wybor === null) {
      setBlad('0006');
      document.getElementById(idOpcjiGrupy(nazwa, RODZAJE_UMOWY_TERMINOWEJ[0]))?.focus();
      return;
    }
    setZajety(true);
    const wynik = zapiszRodzajUmowy(rodzic, wybor, pobierzKontekstOperacji());
    setZajety(false);
    if (wynik.ok) {
      setBlad(null);
      setBladZapisu(null);
      setEdycja(false);
    } else if (wynik.kod === '0006') {
      setBlad('0006');
    } else {
      setBladZapisu(wynik.kod);
    }
  }

  const przedluzenie =
    ptp !== undefined && odpowiedz !== null
      ? ustalPrzedluzenieUmowy(ptp, dataUstania, 'koniec-umowy-terminowej', odpowiedz)
      : null;
  const sciezkaK29 = sciezkaWidoku('ViewCaseGuide', { idSprawy: idSprawyPozycji(kontekst, 'K29'), z: pochodzenie });

  return (
    <Karta id={`przedluzenie${przyrostek}`} tytul={tekst.przedluzenie.tytul} poziomTytulu={poziom} bezLinii>
      <p className="m-0 text-body">
        {tekst.przedluzenie.wstep({ data: formatujDate(dataUstania) })}{' '}
        {edycja ? tekst.przedluzenie.wybierz : tekst.przedluzenie.sprawdzono[plec]}
      </p>
      <dl className="m-0 mt-4 mb-6 flex flex-wrap gap-x-7.5 gap-y-3">
        <div className="min-w-0 flex-[1_1_12.5rem]">
          <dt className="text-body-strong">{tekst.przedluzenie.koniecUmowy}</dt>
          <dd className="m-0 text-body text-ink-strong">{formatujDate(dataUstania)}</dd>
        </div>
        {ptp !== undefined ? (
          <div className="min-w-0 flex-[1_1_12.5rem]">
            <dt className="text-body-strong">{tekst.przedluzenie.uplywTrzeciegoMiesiaca}</dt>
            <dd className="m-0 text-body text-ink-strong">{formatujDate(uplywTrzeciegoMiesiaca(ptp))}</dd>
          </div>
        ) : null}
      </dl>
      {edycja ? (
        <>
          {bladZapisu ? <Komunikat kod={bladZapisu} className="mb-6" /> : null}
          <GrupaOpcji<RodzajUmowyTerminowej>
            nazwa={nazwa}
            legenda={tekst.przedluzenie.legenda}
            uklad="proste"
            opcje={RODZAJE_UMOWY_TERMINOWEJ.map((r) => ({ wartosc: r, etykieta: tekst.przedluzenie.rodzaje[r] }))}
            wartosc={wybor}
            onZmiana={(w) => {
              setWybor(w);
              setBlad(null);
            }}
            blad={blad}
          />
          <div className="mt-6 flex flex-wrap gap-4">
            <Przycisk type="button" wariant="glowny" zajety={zajety} onClick={zapisz}>
              {tekst.przedluzenie.zapisz}
            </Przycisk>
          </div>
          <Notatka className="mt-4">
            <p className="m-0">{tekst.przedluzenie.notatka}</p>
          </Notatka>
        </>
      ) : (
        <>
          {odpowiedz !== null ? (
            <dl className="m-0 mb-4">
              <dt className="text-body-strong">{tekst.przedluzenie.rodzajUmowy}</dt>
              <dd className="m-0 text-body text-ink-strong">
                {tekst.przedluzenie.odpowiedz({ rodzaj: tekst.przedluzenie.rodzaje[odpowiedz] })}
              </dd>
            </dl>
          ) : null}
          {przedluzenie?.przedluzonaDoPorodu && ptp !== undefined ? (
            <Komunikat
              kod="0121"
              tresc={
                <>
                  <p className="m-0">
                    <strong className="font-semibold text-ink-strong">{teksty.wspolne.prefiksy.INFO}</strong>{' '}
                    {teksty.komunikaty['0121']}
                  </p>
                  <p className="m-0 mt-1">
                    {daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu
                      ? tekst.przedluzenie.dzienPorodu
                      : tekst.przedluzenie.przewidywanyTerminPorodu}{' '}
                    <strong className="text-ink-strong">
                      {formatujDate(daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu ? daneCiazy.dataPorodu : ptp)}
                    </strong>
                  </p>
                </>
              }
              bezPrefiksu
            />
          ) : przedluzenie !== null ? (
            <Komunikat
              kod="0157"
              parametry={{ data: formatujDate(dataUstania) }}
              akcje={
                <PrzyciskLink href={sciezkaK29} wariant="drugorzedny">
                  {tekst.przedluzenie.zachowajUbezpieczenie}
                </PrzyciskLink>
              }
            />
          ) : null}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setWybor(odpowiedz);
                setEdycja(true);
              }}
              className="m-0 inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-body-strong text-brand no-underline hover:underline"
            >
              {tekst.przedluzenie.zmienRodzaj}
            </button>
          </div>
        </>
      )}
    </Karta>
  );
}

function KartaOkresow({ kontekst, rodzic, poziom, przyrostek }: { kontekst: KontekstRodziny; rodzic: RodzicWRodzinie; poziom: 2 | 3; przyrostek: string }) {
  const okresy = okresyOchronyWnioskow(kontekst.rodzina.wnioski, kontekst.rodzina.daneRodziny).filter(
    (o) => o.rodzic === rodzic,
  );
  const PoziomWniosku = poziom === 2 ? 'h3' : 'h4';
  return (
    <Karta id={`okresy${przyrostek}`} tytul={tekst.okresy.tytul} poziomTytulu={poziom} bezLinii>
      {okresy.length === 0 ? (
        <StanPusty ikona="wnioski" przerywany>
          {tekst.okresy.brak}
        </StanPusty>
      ) : (
        <>
          <p className="m-0 mb-4 text-body">{tekst.okresy.wstep[kontekst.konto.plec]}</p>
          <ul className="m-0 grid list-none gap-3 p-0">
            {okresy.map((o) => (
              <li key={o.idWniosku} className="rounded-md bg-surface-page px-5 py-4">
                <PoziomWniosku className="m-0 text-body-strong text-ink-strong">
                  {tekst.okresy.wniosek({ rodzaj: tekst.okresy.rodzajeUrlopu[o.rodzajUrlopu] })}
                </PoziomWniosku>
                <p className="m-0 mt-1 mb-3 text-body">
                  {tekst.okresy.szczegoly({
                    dataZlozenia: formatujDate(o.dataZlozenia),
                    od: formatujDate(o.urlop.od),
                    do: formatujDate(o.urlop.do),
                  })}
                </p>
                <Komunikat
                  kod="0158"
                  parametry={{ dataOd: formatujDate(o.ochrona.od), dataDo: formatujDate(o.ochrona.do) }}
                />
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Odnosnik href={sciezkaWidoku('ViewApplicationList')}>{tekst.okresy.twojeWnioski}</Odnosnik>
          </div>
        </>
      )}
    </Karta>
  );
}

function KartaZasad() {
  const t = tekst.ochrona;
  return (
    <Karta id="ochrona" tytul={t.tytul} bezLinii>
      <p className="m-0 text-body">{t.wstep}</p>
      <ul className="m-0 mt-2 pl-6 text-body">
        {t.zasady.map((z) => (
          <li key={z}>{z}</li>
        ))}
      </ul>
      <h3 className="m-0 mt-6 mb-2 text-body-strong">{t.wyjatkiTytul}</h3>
      <ul className="m-0 pl-6 text-body">
        {t.wyjatki.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <h3 className="m-0 mt-6 mb-2 text-body-strong">{t.wczesniejTytul}</h3>
      <p className="m-0 mb-3 text-body">{t.wczesniejWstep}</p>
      <Tabela<'rodzaj' | 'od'>
        podpis={t.tabelaPodpis}
        etykietaPrzewijania={t.tabelaPrzewijanie}
        kolumny={[
          { klucz: 'rodzaj', naglowek: t.kolumnaRodzaj },
          { klucz: 'od', naglowek: t.kolumnaOd },
        ]}
        wiersze={t.wiersze.map((w, i) => ({ id: String(i), rodzaj: w.rodzaj, od: <span className="text-ink-strong">{w.od}</span> }))}
      />
      <h3 className="m-0 mt-6 mb-2 text-body-strong">{t.sporneTytul}</h3>
      <p className="m-0 text-body">{t.sporne}</p>
      <div className="mt-3">
        <OdnosnikZewnetrzny href={ADRES_PIP}>{t.pip}</OdnosnikZewnetrzny>
      </div>
    </Karta>
  );
}

export function SekcjaOchronaK30({ sprawa, kontekst, pochodzenie }: PropsSlotu<'sekcja'>) {
  if (sprawa.idPozycji !== 'K30') return null;
  const naUmowie = rodziceSprawy(sprawa.rodzic).filter((r) => formaRodzica(kontekst, r) === 'umowa-o-prace');
  if (naUmowie.length === 0) return null;
  const kilku = naUmowie.length > 1;
  const poziom = kilku ? 3 : 2;

  const formaMatki = formaRodzica(kontekst, 'matka');
  const matka = kontekst.daneZusMatki;
  const notatka =
    kontekst.rola === 'drugi-rodzic' &&
    !kilku &&
    naUmowie[0] === 'drugi-rodzic' &&
    matka !== null &&
    (formaMatki === 'jdg' || formaMatki === 'umowa-zlecenia' || formaMatki === 'brak-tytulu')
      ? tekst.notatkaDrugiegoRodzica({ imieINazwisko: `${matka.imie} ${matka.nazwisko}`, forma: tekst.formyMatki[formaMatki] })
      : null;

  return (
    <Stos odstep={7.5}>
      {notatka ? (
        <Notatka>
          <p className="m-0">{notatka}</p>
        </Notatka>
      ) : null}
      {naUmowie.map((rodzic) => {
        const przyrostek = kilku && rodzic === 'drugi-rodzic' ? '-drugi-rodzic' : '';
        const karty = (
          <>
            {czyKoniecUmowyTerminowej(daneRodzica(kontekst, rodzic)) ? (
              <KartaPrzedluzenia kontekst={kontekst} rodzic={rodzic} poziom={poziom} pochodzenie={pochodzenie} przyrostek={przyrostek} />
            ) : null}
            <KartaOkresow kontekst={kontekst} rodzic={rodzic} poziom={poziom} przyrostek={przyrostek} />
          </>
        );
        return kilku ? (
          <section key={rodzic} aria-labelledby={`ochrona-${rodzic}`} className="flex flex-col gap-7.5">
            <h2 id={`ochrona-${rodzic}`} className="m-0 text-section-title text-ink">
              {tekst.ochronaRodzica({ rodzic: tekst.rodzice[rodzic] })}
            </h2>
            {karty}
          </section>
        ) : (
          <Stos key={rodzic} odstep={7.5}>
            {karty}
          </Stos>
        );
      })}
      <KartaZasad />
    </Stos>
  );
}
