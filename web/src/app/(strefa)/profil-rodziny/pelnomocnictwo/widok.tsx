'use client';

// ViewSecondParentPowerOfAttorney (3.3.3.2.1): stan pełnomocnictwa PEL drugiego rodzica udzielonego kontu Rodzica,
// odczyt danych na jego podstawie albo instrukcja udzielenia pełnomocnictwa w eZUS.
// Wzory: cz2/P19-12 (obowiązuje), P19-13 (błąd odczytu), P19-15 (od przyszłej daty), P19-16 (brak),
// P19-17 (ograniczone do korespondencji), P19-18 (wygasło).
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { useKontekstRodziny, useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { odczytajDaneZPelnomocnictwa } from '@/dane/magazyn/operacje/drugi-rodzic';
import { pelnomocnictwaKonta } from '@/dane/magazyn/operacje/po-odczycie-zus/odswiez-pelnomocnictwo';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  komunikatStanu,
  type KomunikatPelnomocnictwa,
  poczatekPelnomocnictwa,
  stanPelnomocnictwa,
  wybierzPelnomocnictwo,
} from '@/domena/rodzina/pelnomocnictwo';
import { czyProfilMaDrugiegoRodzica, dolaczonyDrugiRodzic } from '@/domena/rodzina/zaproszenia';
import type { DataISO, KodKomunikatu, KontoPrzewodnika, PelnomocnictwoPel, StanPelnomocnictwa } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { ListaKrokow } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewSecondParentPowerOfAttorney;
const PROFIL_RODZINY = sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' });

function etykietaStanu(stan: StanPelnomocnictwa, p: PelnomocnictwoPel | null): string {
  if (stan === 'obowiazuje-od' && p) return t.obowiazujeOd({ data: formatujDate(poczatekPelnomocnictwa(p)) });
  if (stan === 'obowiazuje-od') return t.stany.obowiazuje;
  return t.stany[stan];
}

function okres(p: PelnomocnictwoPel): string {
  const od = formatujDate(poczatekPelnomocnictwa(p));
  return p.do ? t.okresOdDo({ od, doDnia: formatujDate(p.do) }) : t.okresDoOdwolania({ od });
}

function imieINazwisko(o: { imie: string; nazwisko: string }): string {
  return `${o.imie} ${o.nazwisko}`;
}

/** Tabela stanu pełnomocnictwa ze wzoru P19-12: nagłówki wierszy po lewej, wartości po prawej. */
function TabelaPelnomocnictwa({ wiersze }: { wiersze: { etykieta: string; wartosc: ReactNode }[] }) {
  return (
    <div role="region" aria-label={t.przewijanie} tabIndex={0} className="w-full min-w-0 overflow-x-auto">
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">{t.tytulPelnomocnictwa}</caption>
        <tbody>
          {wiersze.map((w) => (
            <tr key={w.etykieta}>
              <th
                scope="row"
                className="h-[3.875rem] w-2/5 border-b border-line-row px-5 py-3 text-left align-middle font-semibold text-ink"
              >
                {w.etykieta}
              </th>
              <td className="h-[3.875rem] border-b border-line-row px-5 py-3 text-left align-middle">{w.wartosc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KomunikatStanuPelnomocnictwa({ komunikat }: { komunikat: KomunikatPelnomocnictwa }) {
  const imieINazwisko = komunikat.parametry?.imieINazwisko ?? '';
  const data = komunikat.parametry?.data ?? '';
  switch (komunikat.kod) {
    case '0221':
    case '0224':
      return <Komunikat kod={komunikat.kod} parametry={{ imieINazwisko, data }} />;
    case '0220':
    case '0222':
      return <Komunikat kod={komunikat.kod} parametry={{ imieINazwisko }} />;
    default:
      return <Komunikat kod="0223" />;
  }
}

function ListaOpisowa({ pozycje }: { pozycje: { etykieta: string; wartosc: ReactNode }[] }) {
  return (
    <dl className="m-0 flex flex-col gap-4">
      {pozycje.map((p) => (
        <div key={p.etykieta}>
          <dt className="text-body-strong text-ink">{p.etykieta}</dt>
          <dd className="m-0 text-body">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}

function KartaZakresuDanych({ zNotatkaOdswiezania }: { zNotatkaOdswiezania: boolean }) {
  return (
    <Karta tytul={t.daneKtoreOdczytamy} bezLinii>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {t.zakresDanych.map((pozycja) => (
          <li key={pozycja} className="flex items-start gap-3">
            <Ikona nazwa="zaznaczenie" className="mt-0.5 shrink-0 text-brand" />
            <span className="min-w-0">{pozycja}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-4">
        <Notatka>
          <p>{t.notatkaEzla}</p>
        </Notatka>
        {zNotatkaOdswiezania ? (
          <Notatka>
            <p>{t.notatkaOdswiezania}</p>
          </Notatka>
        ) : null}
      </div>
    </Karta>
  );
}

function Instrukcja({
  konto,
  wstep,
  poWyslaniu,
  onSprawdz,
}: {
  konto: KontoPrzewodnika;
  wstep: string;
  poWyslaniu: string;
  onSprawdz: () => void;
}) {
  const i = t.instrukcja;
  const kroki = [
    i.krok1,
    <>
      {i.krok2.przed}
      <strong className="font-semibold">{i.krok2.wyroznienie}</strong>
      {i.krok2.po}
    </>,
    <>
      {i.krok3.przed}
      <strong className="font-semibold">{konto.imie}</strong>
      {i.krok3.nazwisko}
      <strong className="font-semibold">{konto.nazwisko}</strong>
      {i.krok3.pesel}
      <strong className="font-semibold text-ink-max">{konto.pesel}</strong>
      {i.krok3.po}
    </>,
    <>
      {i.krok4.przed}
      <strong className="font-semibold">{i.krok4.rola}</strong>
      {i.krok4.zakres}
      {i.krok4.po}
    </>,
  ];
  return (
    <Karta tytul={i.tytul} bezLinii>
      <p className="m-0 mb-6 text-body">{wstep}</p>
      <ListaKrokow kroki={kroki} />
      <p className="m-0 my-6 text-body">{poWyslaniu}</p>
      <div className="flex flex-wrap gap-4">
        <Przycisk wariant="glowny" ikona="odswiez" onClick={onSprawdz}>
          {i.sprawdzPonownie}
        </Przycisk>
        <PrzyciskLink href={sciezkaWidoku('ViewEzusHome')} wariant="drugorzedny" nowaKarta>
          {i.przejdzDoEzus}
        </PrzyciskLink>
      </div>
    </Karta>
  );
}

export function WidokPelnomocnictwa() {
  const kontekst = useKontekstRodziny();
  const pesel = kontekst?.konto.pesel;
  const stanZus = useStanSymulowanegoZus(pesel);
  const { pokaz } = useKomunikatChwilowy();
  const [bladOdczytu, ustawBladOdczytu] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const komunikat = useRef<HTMLDivElement>(null);

  const drugi = kontekst?.rodzina.daneRodziny.drugiRodzic;
  const pelnomocnictwo = useMemo(
    () =>
      pesel === undefined || drugi === undefined
        ? null
        : wybierzPelnomocnictwo(
            pelnomocnictwaKonta(pesel, stanZus),
            { peselPelnomocnika: pesel, ...(drugi.pesel ? { peselMocodawcy: drugi.pesel } : {}) },
            kontekst?.dzis ?? '',
          ),
    [pesel, drugi, stanZus, kontekst?.dzis],
  );

  if (kontekst === null) return <SzkieletWidoku />;
  const { konto, dzis } = kontekst;
  const daneRodziny = kontekst.rodzina.daneRodziny;
  const stan = stanPelnomocnictwa(pelnomocnictwo, dzis);
  const ty = t.ty({ imieINazwisko: imieINazwisko(konto) });
  const naglowek = (
    <NaglowekStrony tytul={t.naglowek} stanNa={dzis} powrot={{ href: PROFIL_RODZINY, etykieta: t.powrot }} />
  );

  // Drugi rodzic dołączył albo profil go nie zawiera: pełnomocnictwo nie dotyczy rodziny.
  const bezAkcji = !czyProfilMaDrugiegoRodzica(daneRodziny)
    ? t.bezAkcji.brakDrugiegoRodzica
    : dolaczonyDrugiRodzic(daneRodziny) !== null
      ? t.bezAkcji.dolaczyl
      : null;
  if (bezAkcji !== null) {
    return (
      <>
        {naglowek}
        <Karta bezLinii className="max-w-tresc">
          <p className="m-0 mb-6 text-body">{bezAkcji}</p>
          <PrzyciskLink href={PROFIL_RODZINY} wariant="glowny">
            {t.wrocDoProfilu}
          </PrzyciskLink>
        </Karta>
      </>
    );
  }

  function sprawdzPonownie() {
    // Stan pełnomocnictwa pochodzi z bieżącego stanu symulowanego ZUS, więc ekran pokazuje go od razu.
    ustawBladOdczytu(null);
    pokaz(t.sprawdzono);
  }

  function odczytaj() {
    ustawZajety(true);
    const wynik = odczytajDaneZPelnomocnictwa(pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      // Kod stanu pełnomocnictwa (np. wygasło przed chwilą) pokazuje ekran ze stanu; błąd odczytu i zapisu pokazuje baner.
      ustawBladOdczytu(wynik.kod === '0001' || wynik.kod === '0003' ? wynik.kod : null);
      requestAnimationFrame(() => komunikat.current?.focus());
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0219', dlaWidoku: 'ViewProfileSummary' });
    przejdz(PROFIL_RODZINY);
  }

  const komunikatStanuPel = komunikatStanu(pelnomocnictwo, stan, (d: DataISO) => formatujDate(d));
  // Stan odwołany nie ma komunikatu na tym ekranie: 0220 opisuje usunięcie danych przy otwarciu przewodnika.
  const komunikatEkranu = bladOdczytu
    ? <Komunikat kod={bladOdczytu} />
    : komunikatStanuPel && komunikatStanuPel.kod !== '0220'
      ? <KomunikatStanuPelnomocnictwa komunikat={komunikatStanuPel} />
      : null;

  const baner = komunikatEkranu ? (
    <div ref={komunikat} tabIndex={-1} className="mb-7.5 max-w-tresc outline-none">
      {komunikatEkranu}
    </div>
  ) : null;

  // Pełnomocnictwo obowiązuje albo obowiązuje od przyszłej daty (P19-12, P19-13, P19-15).
  if (pelnomocnictwo !== null && (stan === 'obowiazuje' || stan === 'obowiazuje-od')) {
    const mocodawca = imieINazwisko(pelnomocnictwo.mocodawca);
    const dopelniacz = pelnomocnictwo.mocodawca.imieINazwiskoDopelniacz;
    const wiersze = [
      { etykieta: t.wiersze.stan, wartosc: <strong className="font-semibold text-ink-strong">{etykietaStanu(stan, pelnomocnictwo)}</strong> },
      { etykieta: t.wiersze.mocodawca, wartosc: mocodawca },
      { etykieta: t.wiersze.pelnomocnik, wartosc: ty },
      { etykieta: t.wiersze.rola, wartosc: t.rolaUbezpieczony },
      { etykieta: t.wiersze.zakres, wartosc: t.zakresy[pelnomocnictwo.zakres] },
      { etykieta: t.wiersze.okres, wartosc: <span className="text-ink-strong">{okres(pelnomocnictwo)}</span> },
    ];
    const opis =
      stan === 'obowiazuje-od'
        ? t.opisPrzyszlej({ imieINazwisko: dopelniacz, data: formatujDate(poczatekPelnomocnictwa(pelnomocnictwo)) })
        : bladOdczytu === '0001'
          ? t.opisBleduOdczytu({ imieINazwisko: dopelniacz })
          : t.opisOdczytu({ imieINazwisko: dopelniacz });
    return (
      <>
        {naglowek}
        {baner}
        <UkladDwuKolumnowy
          tresc={
            <Karta tytul={t.tytulPelnomocnictwa} bezLinii>
              <TabelaPelnomocnictwa wiersze={wiersze} />
              <p className="m-0 my-6 text-body">{opis}</p>
              <div className="flex flex-wrap gap-4">
                {stan === 'obowiazuje' ? (
                  <Przycisk wariant="glowny" ikona="pobierz" zajety={zajety} onClick={odczytaj}>
                    {bladOdczytu === '0001' ? t.odczytajPonownie : t.odczytajDane}
                  </Przycisk>
                ) : null}
                <PrzyciskLink href={PROFIL_RODZINY} wariant={stan === 'obowiazuje' ? 'drugorzedny' : 'glowny'}>
                  {t.wrocDoProfilu}
                </PrzyciskLink>
              </div>
            </Karta>
          }
          boczna={<KartaZakresuDanych zNotatkaOdswiezania={stan === 'obowiazuje' && bladOdczytu === null} />}
          etykietaBocznej={t.daneKtoreOdczytamy}
        />
      </>
    );
  }

  // Brak pełnomocnictwa, ograniczone do korespondencji, wygasłe albo odwołane (P19-16, P19-17, P19-18).
  const mocodawcaMianownik = pelnomocnictwo ? imieINazwisko(pelnomocnictwo.mocodawca) : '';
  const wstep =
    pelnomocnictwo === null
      ? t.instrukcja.wstepBrak
      : stan === 'ograniczone'
        ? t.instrukcja.wstepOgraniczone({ imieINazwisko: mocodawcaMianownik })
        : t.instrukcja.wstepNowe({ imieINazwisko: mocodawcaMianownik });
  const poWyslaniu =
    pelnomocnictwo === null ? t.instrukcja.poWyslaniuBrak : t.instrukcja.poWyslaniu({ imieINazwisko: mocodawcaMianownik });
  const notatka =
    pelnomocnictwo === null
      ? t.notatkaBrak
      : stan === 'ograniczone'
        ? t.notatkaOgraniczone
        : stan === 'odwolane'
          ? t.notatkaOdwolane
          : t.notatkaWygaslo;
  const pozycje =
    pelnomocnictwo === null
      ? [
          { etykieta: t.wiersze.stan, wartosc: t.stany.brak },
          { etykieta: t.wiersze.pelnomocnik, wartosc: ty },
          { etykieta: t.wiersze.wymaganaRola, wartosc: t.rolaUbezpieczony },
          { etykieta: t.wiersze.wymaganyZakres, wartosc: t.zakresy['bez-ograniczen'] },
        ]
      : [
          { etykieta: t.wiersze.stan, wartosc: etykietaStanu(stan, pelnomocnictwo) },
          { etykieta: t.wiersze.mocodawca, wartosc: mocodawcaMianownik },
          { etykieta: t.wiersze.pelnomocnik, wartosc: ty },
          { etykieta: t.wiersze.rola, wartosc: t.rolaUbezpieczony },
          { etykieta: t.wiersze.zakres, wartosc: t.zakresy[pelnomocnictwo.zakres] },
          {
            etykieta: t.wiersze.okres,
            wartosc: <span className={stan === 'wygaslo' ? 'text-ink-strong' : undefined}>{okres(pelnomocnictwo)}</span>,
          },
        ];

  return (
    <>
      {naglowek}
      {baner}
      <UkladDwuKolumnowy
        tresc={<Instrukcja konto={konto} wstep={wstep} poWyslaniu={poWyslaniu} onSprawdz={sprawdzPonownie} />}
        boczna={
          <Karta tytul={pelnomocnictwo === null ? t.tytulStanu : t.tytulPelnomocnictwa} bezLinii>
            <ListaOpisowa pozycje={pozycje} />
            <Notatka className="mt-6">
              <p>{notatka}</p>
            </Notatka>
          </Karta>
        }
        etykietaBocznej={pelnomocnictwo === null ? t.tytulStanu : t.tytulPelnomocnictwa}
      />
    </>
  );
}
