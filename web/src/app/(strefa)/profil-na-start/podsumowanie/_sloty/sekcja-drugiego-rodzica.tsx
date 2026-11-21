'use client';

// Slot ViewProfileSummary „sekcja-drugiego-rodzica” w liście slotyPodsumowania (kontrakt, sekcja 12.4). Właściciel: u23.
// Teksty: teksty.ViewProfileSummary.sekcjaDrugiegoRodzica.
// Sekcja „Drugi rodzic” profilu rodziny (wzory cz2/P19-01, P19-08, P19-09, P19-11, P19-14): dane drugiego rodzica
// ze źródłem, akcja zaproszenia i sprawdzenia pełnomocnictwa PEL, gdy drugi rodzic nie dołączył, akcja odłączenia,
// gdy dołączył, oraz widok Drugiego rodzica ze zmianą wyłącznie własnych danych.
import { useMemo, useState, type ReactNode } from 'react';
import { ArkuszOdlaczenia } from '@/app/(strefa)/profil-rodziny/_czesci/arkusz-odlaczenia';
import { ArkuszZaproszenia } from '@/app/(strefa)/profil-rodziny/_czesci/arkusz-zaproszenia';
import { useStanKontaOsoby, useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { losuj } from '@/dane/magazyn/losowanie';
import { utworzZaproszenie } from '@/dane/magazyn/operacje/drugi-rodzic';
import { pelnomocnictwaKonta } from '@/dane/magazyn/operacje/po-odczycie-zus/odswiez-pelnomocnictwo';
import { rozpocznijZmianeProfilu } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika } from '@/domena/daty';
import {
  czyDaneZPelnomocnictwa,
  poczatekPelnomocnictwa,
  tytulGlowny,
  wybierzPelnomocnictwo,
} from '@/domena/rodzina/pelnomocnictwo';
import { czyProfilMaDrugiegoRodzica, dolaczonyDrugiRodzic, odlaczonyDrugiRodzic } from '@/domena/rodzina/zaproszenia';
import type { DataISO, DrugiRodzic, KodKomunikatu, KontoPrzewodnika, ZrodloDanej } from '@/domena/typy';
import { formatujDate, formatujKwote, formatujMiesiac } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { Tabela } from '@/komponenty/tabela';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewProfileSummary.sekcjaDrugiegoRodzica;
const tPel = teksty.ViewSecondParentPowerOfAttorney;

type Kolumna = 'dane' | 'wartosc' | 'zrodlo';
type Wiersz = { id: string } & Record<Kolumna, ReactNode>;

const KOLUMNY = [
  { klucz: 'dane', naglowek: t.kolumny.dane },
  { klucz: 'wartosc', naglowek: t.kolumny.wartosc },
  { klucz: 'zrodlo', naglowek: t.kolumny.zrodlo },
] as const satisfies { klucz: Kolumna; naglowek: string }[];

function zrodlo(z: ZrodloDanej | null | undefined): string {
  return z ? t.zrodla[z] : t.zrodla.brak;
}

function imieINazwisko(drugi: Pick<DrugiRodzic, 'imie' | 'nazwisko'>): string {
  return [drugi.imie, drugi.nazwisko].filter(Boolean).join(' ');
}

function formaTekst(drugi: DrugiRodzic): string {
  const forma = drugi.formaZatrudnienia?.wartosc;
  return forma && forma !== 'brak-drugiego-rodzica' ? t.formy[forma] : t.brakDanych;
}

function dobrowolneTekst(drugi: DrugiRodzic): string {
  if (drugi.formaZatrudnienia?.wartosc === 'umowa-o-prace') {
    return drugi.formaZatrudnienia.zrodlo === 'odpowiedz-rodzica' ? t.nieDotyczy : t.nieDotyczyObowiazkowe;
  }
  const d = drugi.dobrowolneChorobowe;
  return d ? (d.wartosc ? t.tak : t.nie) : t.brakDanych;
}

function platnikTekst(drugi: DrugiRodzic): string {
  const p = drugi.platnikZasilku;
  if (!p) return t.brakDanych;
  return p.wartosc === 'platnik-skladek' && p.nazwaPlatnika ? p.nazwaPlatnika : t.platnicy[p.wartosc];
}

/** Odpowiedź rodzica w tekście, np. „umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym”. */
function odpowiedzWTekscie(drugi: Omit<DrugiRodzic, 'zachowaneOdpowiedzi'> | undefined): string | null {
  const forma = drugi?.formaZatrudnienia?.wartosc;
  if (!drugi || !forma || forma === 'brak-drugiego-rodzica') return null;
  const tekst = t.formyWTekscie[forma];
  if (forma !== 'umowa-zlecenia' && forma !== 'jdg') return tekst;
  if (!drugi.dobrowolneChorobowe) return tekst;
  return drugi.dobrowolneChorobowe.wartosc ? t.zDobrowolnym({ forma: tekst }) : t.bezDobrowolnego({ forma: tekst });
}

function wierszeOdpowiedziLubKonta(drugi: DrugiRodzic, w: { imie: boolean; platnik: boolean }): Wiersz[] {
  const wiersze: Wiersz[] = [];
  if (w.imie && imieINazwisko(drugi)) {
    wiersze.push({
      id: 'imie',
      dane: t.wiersze.imieINazwisko,
      wartosc: imieINazwisko(drugi),
      zrodlo: zrodlo(drugi.formaZatrudnienia?.zrodlo),
    });
  }
  wiersze.push(
    { id: 'forma', dane: t.wiersze.forma, wartosc: formaTekst(drugi), zrodlo: zrodlo(drugi.formaZatrudnienia?.zrodlo) },
    {
      id: 'dobrowolne',
      dane: t.wiersze.dobrowolne,
      wartosc: dobrowolneTekst(drugi),
      zrodlo: zrodlo(drugi.dobrowolneChorobowe?.zrodlo ?? drugi.formaZatrudnienia?.zrodlo),
    },
  );
  if (w.platnik) {
    wiersze.push({ id: 'platnik', dane: t.wiersze.platnik, wartosc: platnikTekst(drugi), zrodlo: zrodlo(drugi.platnikZasilku?.zrodlo) });
  }
  return wiersze;
}

function wierszeZPelnomocnictwa(drugi: DrugiRodzic): Wiersz[] {
  const dane = drugi.daneZKontaZus;
  const zrodloPel = t.zrodla['pelnomocnictwo-pel'];
  const dzien = dane ? dataZeZnacznika(dane.odczytano) : '';
  const tytul = dane ? tytulGlowny(dane.tytuly, dzien) : null;
  const forma = tytul ? t.formaZTytulem({ forma: formaTekst(drugi), tytul: t.tytuly[tytul.rodzaj]({ data: formatujDate(tytul.od) }) }) : formaTekst(drugi);
  const podstawy = tytul?.podstawySkladek ?? [];
  const ostatnia = podstawy.at(-1);
  const stala = podstawy.length === 12 && podstawy.every((p) => p.kwota === podstawy[0].kwota);
  const podstawa = ostatnia
    ? stala
      ? t.podstawaStala({ kwota: formatujKwote(ostatnia.kwota) })
      : t.podstawaOstatnia({ kwota: formatujKwote(ostatnia.kwota), miesiac: formatujMiesiac(ostatnia.miesiac) })
    : t.brakPodstaw;
  const zasilki = dane?.zasilki ?? [];
  return [
    { id: 'imie', dane: t.wiersze.imieINazwisko, wartosc: imieINazwisko(drugi), zrodlo: zrodloPel },
    { id: 'forma', dane: t.wiersze.forma, wartosc: forma, zrodlo: zrodloPel },
    {
      id: 'chorobowe',
      dane: t.wiersze.chorobowe,
      wartosc: tytul ? t.rodzajeChorobowego[tytul.ubezpieczenieChorobowe.rodzaj] : t.rodzajeChorobowego.brak,
      zrodlo: zrodloPel,
    },
    { id: 'podstawa', dane: t.wiersze.podstawa, wartosc: <span className="text-ink-strong">{podstawa}</span>, zrodlo: zrodloPel },
    {
      id: 'platnik-wyplaca',
      dane: t.wiersze.platnikWyplaca,
      wartosc: tytul ? t.wyplacaZasilki[tytul.platnik.wyplacaZasilki] : t.wyplacaZasilki['nie-dotyczy'],
      zrodlo: zrodloPel,
    },
    {
      id: 'zasilki',
      dane: t.wiersze.zasilki,
      wartosc:
        zasilki.length === 0
          ? t.brakZasilkow
          : zasilki
              .map((z) => t.zasilek({ rodzaj: z.rodzaj, kwota: formatujKwote(z.kwota), data: formatujDate(z.dataWyplaty) }))
              .join('; '),
      zrodlo: zrodloPel,
    },
  ];
}

function okresPelnomocnictwa(od: DataISO, doDnia: DataISO | undefined): string {
  return doDnia
    ? tPel.okresOdDo({ od: formatujDate(od), doDnia: formatujDate(doDnia) })
    : tPel.okresDoOdwolania({ od: formatujDate(od) });
}

export function SlotSekcjaDrugiegoRodzica({ tryb, konto, kontekst }: PropsSlotu<'sekcja'>) {
  if (tryb !== 'rodzina' || kontekst === null) return null;
  if (!czyProfilMaDrugiegoRodzica(kontekst.rodzina.daneRodziny)) return null;
  if (konto.rola !== 'rodzic' && konto.rola !== 'drugi-rodzic') return null;
  return <SekcjaDrugiegoRodzica konto={konto} kontekst={kontekst} />;
}

function SekcjaDrugiegoRodzica({ konto, kontekst }: { konto: KontoPrzewodnika; kontekst: KontekstRodziny }) {
  const [zaproszenie, ustawZaproszenie] = useState<{ link: string; wazneDo: DataISO } | null>(null);
  const [odlaczenieOtwarte, ustawOdlaczenieOtwarte] = useState(false);
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);

  const daneRodziny = kontekst.rodzina.daneRodziny;
  const drugi = daneRodziny.drugiRodzic;
  const stanRodzica = useStanKontaOsoby(osobyRodziny(daneRodziny).peselRodzica);
  const stanZus = useStanSymulowanegoZus(konto.rola === 'rodzic' ? konto.pesel : undefined);
  const pelnomocnictwo = useMemo(
    () =>
      konto.rola === 'rodzic' && czyDaneZPelnomocnictwa(drugi)
        ? wybierzPelnomocnictwo(
            pelnomocnictwaKonta(konto.pesel, stanZus),
            { peselPelnomocnika: konto.pesel, ...(drugi.pesel ? { peselMocodawcy: drugi.pesel } : {}) },
            kontekst.dzis,
          )
        : null,
    [konto.rola, konto.pesel, drugi, stanZus, kontekst.dzis],
  );

  const dolaczony = dolaczonyDrugiRodzic(daneRodziny);
  const odlaczony = odlaczonyDrugiRodzic(daneRodziny);
  const zPelnomocnictwa = dolaczony === null && czyDaneZPelnomocnictwa(drugi);
  const widokDrugiegoRodzica = konto.rola === 'drugi-rodzic';
  const nazwa = imieINazwisko(drugi);
  const nazwaDopelniacz = drugi.imieINazwiskoDopelniacz ?? nazwa;

  function zmienDane() {
    // Zmiana profilu startuje szkic zmiany (operacja profilu na start); ekran drugiego rodzica zapisuje zmiany.
    rozpocznijZmianeProfilu(pobierzKontekstOperacji());
  }

  function zapros() {
    const wynik = utworzZaproszenie(losuj, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return;
    }
    ustawBlad(null);
    const sciezka = sciezkaWidoku('ViewInviteAccept', { token: wynik.wartosc.token });
    ustawZaproszenie({ link: new URL(sciezka, window.location.origin).href, wazneDo: wynik.wartosc.wazneDo });
  }

  const linkZmiany = (
    <Odnosnik href={sciezkaWidoku('ViewProfileSecondParent')} onClick={zmienDane} aria-label={t.zmienEtykieta}>
      {t.zmien}
    </Odnosnik>
  );

  // Wiersze tabeli według stanu dostępu drugiego rodzica.
  let wiersze: Wiersz[];
  if (dolaczony !== null) {
    const [imie, ...reszta] = wierszeOdpowiedziLubKonta(drugi, { imie: true, platnik: true });
    wiersze = [
      ...(imie ? [imie] : []),
      {
        id: 'rola',
        dane: t.wiersze.rola,
        wartosc: t.drugiRodzicOd({ data: formatujDate(dolaczony.dolaczono) }),
        zrodlo: t.zrodla.brak,
      },
      ...reszta,
    ];
  } else if (zPelnomocnictwa) {
    wiersze = [
      ...wierszeZPelnomocnictwa(drugi),
      { id: 'dostep', dane: t.wiersze.dostep, wartosc: t.nieDolaczyl, zrodlo: t.zrodla.brak },
    ];
  } else {
    const poOdlaczeniu = odlaczony !== null;
    wiersze = [
      ...wierszeOdpowiedziLubKonta(drugi, { imie: poOdlaczeniu, platnik: poOdlaczeniu }),
      {
        id: 'dostep',
        dane: t.wiersze.dostep,
        wartosc: odlaczony?.odlaczono ? t.odlaczony({ data: formatujDate(odlaczony.odlaczono) }) : t.nieDolaczyl,
        zrodlo: t.zrodla.brak,
      },
    ];
  }

  const tabela = (
    <Tabela podpis={t.podpisTabeli} etykietaPrzewijania={t.przewijanie} kolumny={[...KOLUMNY]} wiersze={wiersze} />
  );

  // Widok konta Drugi rodzic (P19-08): wyłącznie własne dane i akcja zmiany.
  if (widokDrugiegoRodzica) {
    const odpowiedz = odpowiedzWTekscie(drugi.zachowaneOdpowiedzi);
    const rodzic = stanRodzica?.konto;
    const rodzicDopelniacz = rodzic?.imieINazwiskoDopelniacz ?? (rodzic ? `${rodzic.imie} ${rodzic.nazwisko}` : '');
    return (
      <Karta tytul={t.tytulDrugiegoRodzica} bezLinii akcje={linkZmiany}>
        {tabela}
        <Notatka className="mt-6">
          <p>
            {odpowiedz && rodzicDopelniacz
              ? t.notatki.widokDrugiegoRodzica({ imieINazwisko: rodzicDopelniacz, odpowiedz })
              : t.notatki.widokDrugiegoRodzicaBezOdpowiedzi}
          </p>
        </Notatka>
      </Karta>
    );
  }

  // Konto Rodzic, drugi rodzic dołączył (P19-09): dane z konta ZUS i wyłącznie akcja odłączenia.
  if (dolaczony !== null) {
    return (
      <Karta tytul={t.tytul} bezLinii>
        <div className="flex flex-wrap items-start gap-7.5">
          <div className="min-w-0 grow-999 basis-120">{tabela}</div>
          <div className="flex min-w-0 grow basis-84 flex-col gap-3">
            <h3 className="m-0 text-body-strong text-ink">{t.dolaczony.naglowek({ imieINazwisko: nazwa })}</h3>
            <p className="m-0 text-body">{t.dolaczony.opis({ imie: drugi.imie ?? nazwa })}</p>
            <p className="m-0 text-body">{t.dolaczony.opisOdlaczenia}</p>
            <div>
              <Przycisk wariant="drugorzedny" ikona="odlacz-osobe" onClick={() => ustawOdlaczenieOtwarte(true)}>
                {t.dolaczony.przycisk}
              </Przycisk>
            </div>
          </div>
        </div>
        <Notatka className="mt-6">
          <p>{t.notatki.dolaczyl({ imieINazwisko: nazwaDopelniacz })}</p>
        </Notatka>
        <ArkuszOdlaczenia
          otwarte={odlaczenieOtwarte}
          onZamknij={() => ustawOdlaczenieOtwarte(false)}
          imieINazwisko={nazwa}
        />
      </Karta>
    );
  }

  // Konto Rodzic, drugi rodzic nie dołączył (P19-01, P19-11, P19-14): zaproszenie i pełnomocnictwo PEL.
  const zachowane = odpowiedzWTekscie(drugi.zachowaneOdpowiedzi);
  const okresPel =
    zPelnomocnictwa && pelnomocnictwo
      ? t.pelnomocnictwo.okres({
          imieINazwisko: pelnomocnictwo.mocodawca.imieINazwiskoDopelniacz,
          okres: okresPelnomocnictwa(poczatekPelnomocnictwa(pelnomocnictwo), pelnomocnictwo.do),
        })
      : null;

  return (
    <Karta tytul={t.tytul} bezLinii akcje={linkZmiany}>
      {blad ? <Komunikat kod={blad} className="mb-6" /> : null}
      {zPelnomocnictwa && drugi.daneZKontaZus ? (
        <p className="m-0 mb-6 text-body">
          {t.zrodloPelnomocnictwa({ imieINazwisko: nazwaDopelniacz })}{' '}
          <strong className="font-semibold text-ink-strong">{formatujDate(drugi.daneZKontaZus.odczytano)}</strong>
        </p>
      ) : null}
      {odlaczony !== null && !zPelnomocnictwa && nazwa ? (
        <p className="m-0 mb-6 text-body">{t.odlaczonyOpis({ imieINazwisko: nazwa })}</p>
      ) : null}
      <div className="flex flex-wrap items-start gap-7.5">
        <div className="min-w-0 grow-999 basis-120">{tabela}</div>
        <div className="flex min-w-0 grow basis-84 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-body-strong text-ink">
              {odlaczony !== null && !zPelnomocnictwa ? t.zaproszenie.naglowekPonownie : t.zaproszenie.naglowek}
            </h3>
            <p className="m-0 text-body">
              {zPelnomocnictwa
                ? t.zaproszenie.opisPrzyDanychZPelnomocnictwa
                : odlaczony !== null
                  ? t.zaproszenie.opisPonownie
                  : t.zaproszenie.opis}
            </p>
            <div>
              <Przycisk wariant="glowny" ikona="dodaj-osobe" onClick={zapros}>
                {t.zaproszenie.przycisk}
              </Przycisk>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-line-row pt-6">
            <h3 className="m-0 text-body-strong text-ink">
              {zPelnomocnictwa ? t.pelnomocnictwo.naglowekPrzyDanych : t.pelnomocnictwo.naglowek}
            </h3>
            <p className="m-0 text-body">
              {okresPel ?? (odlaczony !== null ? t.pelnomocnictwo.opisPoOdlaczeniu : t.pelnomocnictwo.opis)}
            </p>
            <div>
              <PrzyciskLink
                href={sciezkaWidoku('ViewSecondParentPowerOfAttorney')}
                wariant="drugorzedny"
                ikona="pelnomocnictwo"
              >
                {t.pelnomocnictwo.przycisk}
              </PrzyciskLink>
            </div>
          </div>
        </div>
      </div>
      <Notatka className="mt-6">
        <p>
          {zPelnomocnictwa
            ? zachowane
              ? t.notatki.zPelnomocnictwa({ odpowiedzi: zachowane })
              : t.notatki.zPelnomocnictwaBezOdpowiedzi
            : odlaczony !== null
              ? t.notatki.poOdlaczeniu
              : t.notatki.nieDolaczyl}
        </p>
      </Notatka>
      <ArkuszZaproszenia
        otwarte={zaproszenie !== null}
        onZamknij={() => ustawZaproszenie(null)}
        link={zaproszenie?.link}
        wazneDo={zaproszenie?.wazneDo}
      />
    </Karta>
  );
}
