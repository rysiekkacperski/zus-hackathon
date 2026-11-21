'use client';

// ViewProfileZusData (historyjki 3.3.1.1.1, 3.3.1.1.2; wzory cz1/Profil-na-start, cz1/P03-01…P03-06).
// Właściciel: u07, części stanu odczytu i sekcji kopii Danych z konta ZUS: u03.
// Krok 1 kreatora „Praca i zasiłek”: forma zatrudnienia proponowana z tytułów ubezpieczenia, tytuły zakończone
// i pozostałe, ubezpieczenie chorobowe albo pytanie o dobrowolne ubezpieczenie chorobowe, płatnik zasiłku
// i dzieci zgłoszone do ubezpieczenia zdrowotnego; zapis w szkicu profilu ze źródłem danej.
import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszSzkic, type ZmianaSzkicu } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika, dodajDni, formatujDate } from '@/domena/daty';
import { czyMaZgode } from '@/domena/konto';
import {
  FORMA_Z_TYTULU,
  czyPytacODobrowolne,
  dobrowolnePoZmianieFormy,
  dobrowolneZOdpowiedzi,
  formaPoWyborze,
  pozostaleTytulyDlaFormy,
  proponujFormeZatrudnienia,
  tytulDlaFormy,
  tytulyTrwajace,
} from '@/domena/profil/forma-zatrudnienia';
import { daneRodzicaKonta, kluczRodzicaKonta, nastepnyEkran, poprzedniEkran } from '@/domena/profil/nawigacja';
import { ustalPlatnikaZasilku } from '@/domena/profil/platnik';
import type {
  DanaZeZrodla,
  DaneRodzica,
  DaneZKontaZus,
  FormaZatrudnienia,
  KodKomunikatu,
  SzkicProfilu,
  TytulUbezpieczenia,
} from '@/domena/typy';
import { Akordeon } from '@/komponenty/akordeon';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { BladPola } from '@/komponenty/pole';
import { Przycisk } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';
import { NaglowekKreatoraProfilu, NotatkaZapamietywania, SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { sciezkaEkranuProfilu } from '../_czesci/trasy-profilu';
import { ZrodloDanejPola } from '../_czesci/zrodlo-danej';
import { ArkuszFormyZatrudnienia } from './_czesci/arkusz-formy-zatrudnienia';
import { SekcjeDanychZus } from './_czesci/sekcje-danych-zus';
import { StanOdczytuDanychZus } from './_czesci/stan-odczytu-zus';

const tekst = teksty.ViewProfileZusData;
const formy = tekst.kreator.formy;

const ID_BLEDU_FORMY = 'forma-zatrudnienia-blad';
const ID_PRZYCISKU_FORMY = 'forma-zatrudnienia-zmien';
const NAZWA_DOBROWOLNEGO = 'dobrowolne-chorobowe';

type PlatnikRodzica = NonNullable<DaneRodzica['platnikZasilku']>;
type BledyEkranu = { forma?: KodKomunikatu; dobrowolne?: KodKomunikatu };

function WierszDanych({ etykieta, children, ostatni }: { etykieta: string; children: ReactNode; ostatni?: boolean }) {
  return (
    <div
      className={[
        'flex flex-wrap gap-x-6 gap-y-1 border-t border-line-row py-4',
        ostatni ? 'border-b' : '',
      ].join(' ')}
    >
      <dt className="min-w-0 shrink-0 grow-0 basis-60 font-semibold text-ink">{etykieta}</dt>
      <dd className="m-0 flex min-w-0 grow basis-70 flex-col items-start gap-1">{children}</dd>
    </div>
  );
}

function opisTytulu(tytul: TytulUbezpieczenia): string {
  const rodzaj = tekst.rodzajeTytulow[tytul.rodzaj];
  const od = formatujDate(tytul.od);
  return tytul.do === undefined
    ? tekst.tytulOd({ rodzaj, od })
    : tekst.tytulOdDo({ rodzaj, od, doDnia: formatujDate(tytul.do) });
}

function TytulZForma({ tytul }: { tytul: TytulUbezpieczenia }) {
  return (
    <>
      <span className="block">{formy[FORMA_Z_TYTULU[tytul.rodzaj]]}</span>
      <span className="block">{opisTytulu(tytul)}</span>
    </>
  );
}

/** Tekst o braku tytułu: od dnia po końcu ostatniego tytułu albo bez daty. */
function opisBrakuTytulu(kopia: DaneZKontaZus | null): string {
  if (kopia === null) return tekst.brakTytulu;
  const od =
    kopia.brakTytuluOd ??
    kopia.tytuly
      .map((t) => t.do)
      .filter((d): d is string => d !== undefined)
      .sort()
      .map((d) => dodajDni(d, 1))
      .pop();
  return od ? tekst.brakTytuluOd({ data: formatujDate(od) }) : tekst.brakTytulu;
}

function PlatnikZasilku({ forma, kopia }: { forma: DanaZeZrodla<FormaZatrudnienia>; kopia: DaneZKontaZus | null }) {
  const p = tekst.platnicy;
  const tytul = tytulDlaFormy(kopia, forma.wartosc);
  const ustalenie = ustalPlatnikaZasilku(forma.wartosc, tytul, forma.zrodlo);
  if ('pytaj' in ustalenie) {
    const opis = ustalenie.nazwaPlatnika
      ? p.brakInformacji({ nazwa: ustalenie.nazwaPlatnika })
      : p.brakPlatnikaPrzy({ forma: tekst.formyMiejscownik[forma.wartosc] });
    return (
      <>
        <span className="block">{p.nieWiemy}</span>
        <span className="block">{opis}</span>
      </>
    );
  }
  if (forma.wartosc === 'jdg') {
    return (
      <>
        <span className="block">{p.zus}</span>
        <span className="block">{p.jdg}</span>
      </>
    );
  }
  if (forma.wartosc === 'brak-tytulu') {
    return (
      <>
        <span className="block">{p.brak}</span>
        <span className="block">{p.brakTytulu}</span>
      </>
    );
  }
  const wyplaca = ustalenie.platnik === 'platnik-skladek';
  return (
    <>
      <span className="block">{wyplaca ? (ustalenie.nazwa ?? p.zus) : p.zus}</span>
      <span className="block">{wyplaca ? p.wyplaca : p.niewyplaca({ nazwa: ustalenie.nazwa ?? '' })}</span>
      <ZrodloDanejPola zrodlo={ustalenie.zrodlo} className="mt-1" />
    </>
  );
}

function DzieciZgloszone({ kopia }: { kopia: DaneZKontaZus | null }) {
  const d = tekst.dzieci;
  return (
    <Karta tytul={d.tytul} bezLinii as="section">
      {kopia === null ? (
        <StanPusty ikona="rodzina" przerywany>
          <p>{d.bezDanych}</p>
        </StanPusty>
      ) : (
        <>
          <p className="m-0 mb-4 text-body-strong">
            {teksty.wspolne.stanNa({ data: formatujDate(dataZeZnacznika(kopia.odczytano)) })}
          </p>
          {kopia.czlonkowieRodziny.length === 0 ? (
            <StanPusty ikona="rodzina" przerywany>
              <p>{d.brak}</p>
            </StanPusty>
          ) : (
            <Tabela
              podpis={d.tytul}
              etykietaPrzewijania={d.przewijanie}
              kolumny={[
                { klucz: 'imie', naglowek: d.kolumny.imieINazwisko },
                { klucz: 'data', naglowek: d.kolumny.dataUrodzenia },
                { klucz: 'zrodlo', naglowek: d.kolumny.zrodlo },
              ]}
              wiersze={kopia.czlonkowieRodziny.map((c) => ({
                id: c.pesel,
                imie: `${c.imie} ${c.nazwisko}`,
                data: formatujDate(c.dataUrodzenia),
                zrodlo: d.zrodloKonto,
              }))}
            />
          )}
        </>
      )}
    </Karta>
  );
}

function zmianaDanychRodzica(klucz: 'matka' | 'drugiRodzic', dane: Partial<DaneRodzica>): ZmianaSzkicu {
  return { daneRodziny: klucz === 'matka' ? { matka: dane } : { drugiRodzic: dane } };
}

export function WidokDanychZKontaZus() {
  const router = useRouter();
  const stanKonta = useStanKonta();
  const kopia = stanKonta?.kopiaDanychZus ?? null;
  const stanOdczytu = stanKonta?.stanOdczytuZus ?? { stan: 'brak' as const };
  const szkic = stanKonta?.szkicProfilu ?? null;
  const zgoda = stanKonta ? czyMaZgode(stanKonta.konto.decyzjeOZgodzie) : false;

  const propozycja = useMemo(() => (kopia === null ? null : proponujFormeZatrudnienia(kopia)), [kopia]);
  const zapisane = daneRodzicaKonta(szkic);
  const formaZapisana =
    zapisane.formaZatrudnienia && zapisane.formaZatrudnienia.wartosc !== 'brak-drugiego-rodzica'
      ? (zapisane.formaZatrudnienia as DanaZeZrodla<FormaZatrudnienia>)
      : null;

  const [zmianaFormy, ustawZmianeFormy] = useState<DanaZeZrodla<FormaZatrudnienia> | null>(null);
  const [zmianaDobrowolnego, ustawZmianeDobrowolnego] = useState<{ wartosc: DanaZeZrodla<boolean> | null } | null>(null);
  const [arkuszOtwarty, ustawArkuszOtwarty] = useState(false);
  const [bledy, ustawBledy] = useState<BledyEkranu>({});
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  const formaZPropozycji: DanaZeZrodla<FormaZatrudnienia> | null = propozycja
    ? { wartosc: propozycja.forma, zrodlo: 'konto-zus' }
    : null;
  const forma = zmianaFormy ?? formaZapisana ?? formaZPropozycji;

  const dobrowolneDomyslne: DanaZeZrodla<boolean> | null = formaZapisana
    ? (zapisane.dobrowolneChorobowe ?? null)
    : forma
      ? dobrowolnePoZmianieFormy(forma, propozycja)
      : null;
  const dobrowolne = zmianaDobrowolnego !== null ? zmianaDobrowolnego.wartosc : dobrowolneDomyslne;

  const odczytTrwa = stanOdczytu.stan === 'trwa' && kopia === null;
  const pytacODobrowolne = czyPytacODobrowolne(forma?.wartosc);
  const tytulFormy = forma ? tytulDlaFormy(kopia, forma.wartosc) : undefined;
  const pozostale = forma ? pozostaleTytulyDlaFormy(kopia, forma.wartosc) : [];
  const zakonczone = propozycja?.tytulyZakonczone ?? [];
  const kilkaTytulow = kopia !== null && tytulyTrwajace(kopia).length > 1;

  const wybierzForme = (wybrana: FormaZatrudnienia) => {
    const nowa = formaPoWyborze(wybrana, propozycja);
    ustawZmianeFormy(nowa);
    ustawZmianeDobrowolnego({ wartosc: dobrowolnePoZmianieFormy(nowa, propozycja) });
    ustawBledy({});
  };

  const wybierzDobrowolne = (w: 'tak' | 'nie') => {
    if (!forma) return;
    ustawZmianeDobrowolnego({ wartosc: dobrowolneZOdpowiedzi(w === 'tak', forma, propozycja) });
    ustawBledy((b) => ({ ...b, dobrowolne: undefined }));
  };

  const szkicNaEkranie = (s: SzkicProfilu | null): SzkicProfilu | null =>
    s === null ? null : { ...s, ostatniEkran: 'ViewProfileZusData' };

  const wroc = () => {
    const s = szkicNaEkranie(szkic);
    const cel = s ? poprzedniEkran(s, zgoda) : 'ViewGuideWelcome';
    router.push(sciezkaEkranuProfilu(cel, s));
  };

  const dalej = () => {
    const nowe: BledyEkranu = {};
    if (!forma) nowe.forma = '0006';
    else if (pytacODobrowolne && !dobrowolne) nowe.dobrowolne = '0006';
    ustawBledy(nowe);
    if (nowe.forma) {
      document.getElementById(ID_PRZYCISKU_FORMY)?.focus();
      return;
    }
    if (nowe.dobrowolne) {
      document.getElementById(idOpcjiGrupy(NAZWA_DOBROWOLNEGO, 'tak'))?.focus();
      return;
    }
    if (!forma) return;

    const ustalenie = ustalPlatnikaZasilku(forma.wartosc, tytulFormy, forma.zrodlo);
    let platnik: PlatnikRodzica | null;
    if ('pytaj' in ustalenie) {
      const poprzedni = zapisane.platnikZasilku;
      platnik =
        poprzedni && poprzedni.zrodlo === 'odpowiedz-rodzica' && formaZapisana?.wartosc === forma.wartosc
          ? poprzedni
          : null;
    } else {
      platnik = { wartosc: ustalenie.platnik, zrodlo: ustalenie.zrodlo };
      if (ustalenie.nazwa) platnik.nazwaPlatnika = ustalenie.nazwa;
    }

    ustawZajety(true);
    const wynik = zapiszSzkic(
      zmianaDanychRodzica(kluczRodzicaKonta(szkic), {
        formaZatrudnienia: forma,
        dobrowolneChorobowe: pytacODobrowolne ? dobrowolne : null,
        platnikZasilku: platnik,
      }),
      'ViewProfileZusData',
      pobierzKontekstOperacji(),
    );
    if (!wynik.ok) {
      ustawZajety(false);
      ustawBladZapisu(wynik.kod);
      return;
    }
    ustawBladZapisu(null);
    router.push(sciezkaEkranuProfilu(nastepnyEkran(wynik.wartosc, zgoda), wynik.wartosc));
  };

  const komunikat = stanKonta ? <StanOdczytuDanychZus stan={stanOdczytu} kopia={kopia} /> : null;

  return (
    <>
      <NaglowekKreatoraProfilu />
      <SzkieletKreatoraProfilu
        biezacy="ViewProfileZusData"
        komunikat={komunikat}
        onWroc={wroc}
        onDalej={odczytTrwa ? undefined : dalej}
        etykietaDalej={tekst.dalej}
        zajety={zajety}
        notatkiKrokow={
          <>
            <NotatkaZapamietywania />
            <Notatka>
              <p className="m-0">{tekst.notatkaOdswiezania}</p>
            </Notatka>
          </>
        }
      >
        {odczytTrwa ? null : (
          <>
            <Karta tytul={tekst.tytulKarty} bezLinii as="section">
              <p className="m-0 mb-4">{kopia ? tekst.opisKarty : tekst.opisKartyBezDanych}</p>
              {kopia ? (
                <p className="m-0 mb-2 text-body-strong">
                  {teksty.wspolne.stanNa({ data: formatujDate(dataZeZnacznika(kopia.odczytano)) })}
                </p>
              ) : null}
              <dl className="m-0">
                <WierszDanych etykieta={tekst.etykiety.forma} ostatni={!forma}>
                  {forma ? (
                    <>
                      <span className="block">{formy[forma.wartosc]}</span>
                      {tytulFormy ? <span className="block">{opisTytulu(tytulFormy)}</span> : null}
                      {forma.wartosc === 'brak-tytulu' && forma.zrodlo === 'konto-zus' ? (
                        <span className="block">{opisBrakuTytulu(kopia)}</span>
                      ) : null}
                      <ZrodloDanejPola zrodlo={forma.zrodlo} className="mt-1" />
                      <button
                        type="button"
                        id={ID_PRZYCISKU_FORMY}
                        aria-haspopup="dialog"
                        onClick={() => ustawArkuszOtwarty(true)}
                        className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-left font-sans text-body font-semibold text-brand hover:text-brand-deep hover:underline"
                      >
                        {tekst.zmienForme}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="block">{tekst.nieWybrano}</span>
                      <Przycisk
                        id={ID_PRZYCISKU_FORMY}
                        wariant="drugorzedny"
                        aria-haspopup="dialog"
                        aria-describedby={bledy.forma ? ID_BLEDU_FORMY : undefined}
                        onClick={() => ustawArkuszOtwarty(true)}
                        className="mt-2"
                      >
                        {tekst.wybierzForme}
                      </Przycisk>
                      {bledy.forma ? <BladPola id={ID_BLEDU_FORMY} kod={bledy.forma} /> : null}
                    </>
                  )}
                </WierszDanych>
                {forma
                  ? zakonczone.map((t) => (
                      <WierszDanych key={t.id} etykieta={tekst.etykiety.zakonczony}>
                        <TytulZForma tytul={t} />
                        {t.rodzaj === 'dzialalnosc' ? null : (
                          <span className="block">{tekst.platnikSkladek({ nazwa: t.platnik.nazwa })}</span>
                        )}
                        <ZrodloDanejPola zrodlo="konto-zus" className="mt-1" />
                        <span className="block">
                          {t.rodzaj === 'dzialalnosc' ? tekst.zakonczonaDzialalnosc : tekst.zakonczonaUmowa}
                        </span>
                      </WierszDanych>
                    ))
                  : null}
                {forma ? (
                  <WierszDanych etykieta={tekst.etykiety.pozostale}>
                    {pozostale.length === 0 ? (
                      <span className="block">{tekst.brakPozostalych}</span>
                    ) : (
                      pozostale.map((t) => (
                        <span key={t.id} className="flex flex-col gap-1">
                          <TytulZForma tytul={t} />
                        </span>
                      ))
                    )}
                  </WierszDanych>
                ) : null}
                {forma?.wartosc === 'umowa-o-prace' ? (
                  <WierszDanych etykieta={tekst.etykiety.chorobowe}>
                    <span className="block">{tekst.choroboweObowiazkowe}</span>
                  </WierszDanych>
                ) : null}
                {forma ? (
                  <WierszDanych etykieta={tekst.etykiety.platnik} ostatni>
                    <PlatnikZasilku forma={forma} kopia={kopia} />
                  </WierszDanych>
                ) : null}
              </dl>
              {kilkaTytulow ? (
                <Notatka className="mt-6">
                  <p className="m-0">{tekst.notatkaKilkaTytulow}</p>
                </Notatka>
              ) : null}
              {forma && pytacODobrowolne ? (
                <div className="mt-6">
                  <GrupaOpcji
                    nazwa={NAZWA_DOBROWOLNEGO}
                    legenda={tekst.dobrowolne.legenda}
                    podpowiedz={
                      <p className="m-0">
                        {opisDobrowolnego(forma.wartosc as 'umowa-zlecenia' | 'jdg', dobrowolne)}
                      </p>
                    }
                    uklad="poziomo"
                    opcje={[
                      { wartosc: 'tak', etykieta: tekst.dobrowolne.tak },
                      { wartosc: 'nie', etykieta: tekst.dobrowolne.nie },
                    ]}
                    wartosc={dobrowolne === null ? null : dobrowolne.wartosc ? 'tak' : 'nie'}
                    onZmiana={wybierzDobrowolne}
                    blad={bledy.dobrowolne ?? null}
                  />
                  {dobrowolne ? <ZrodloDanejPola zrodlo={dobrowolne.zrodlo} className="mt-2" /> : null}
                </div>
              ) : null}
            </Karta>
            <DzieciZgloszone kopia={kopia} />
            {kopia ? (
              <Akordeon id="dane-z-konta-zus-szczegoly" naglowek={tekst.pozostaleDane}>
                <SekcjeDanychZus kopia={kopia} />
              </Akordeon>
            ) : null}
            {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
          </>
        )}
      </SzkieletKreatoraProfilu>
      <ArkuszFormyZatrudnienia
        otwarte={arkuszOtwarty}
        onZamknij={() => ustawArkuszOtwarty(false)}
        wybrana={forma?.wartosc ?? null}
        zKontaZus={propozycja?.forma ?? null}
        onWybor={wybierzForme}
      />
    </>
  );
}

function opisDobrowolnego(forma: 'umowa-zlecenia' | 'jdg', dobrowolne: DanaZeZrodla<boolean> | null): string {
  const d = tekst.dobrowolne;
  if (dobrowolne && dobrowolne.zrodlo === 'konto-zus') {
    const przy = d.przy[forma];
    return dobrowolne.wartosc ? d.zKontaTak({ przy }) : d.zKontaNie({ przy });
  }
  return d.zalezy[forma];
}
