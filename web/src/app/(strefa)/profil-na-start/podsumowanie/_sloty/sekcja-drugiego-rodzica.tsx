'use client';

// Slot ViewProfileSummary „sekcja-drugiego-rodzica” w liście slotyPodsumowania (kontrakt, sekcja 12.4). Właściciel: u23.
// Teksty: teksty.ViewProfileSummary.sekcjaDrugiegoRodzica.
// Sekcja „Drugi rodzic” profilu rodziny (wzory cz2/P19-01, P19-08, P19-09, P19-11, P19-14) w zakładce „Drugi rodzic”:
// slot uzupełnia kartę sekcji profilu z KartySekcjiProfilu o imię i nazwisko, rolę albo dostęp do planu, płatnika
// i dane z pełnomocnictwa PEL, a obok danych pokazuje zaproszenie i sprawdzenie pełnomocnictwa PEL, gdy drugi rodzic
// nie dołączył, albo odłączenie, gdy dołączył. Konto Drugi rodzic widzi w zakładce „Twoje dane” własne dane i ich zmianę.
import { use, useMemo, useState } from 'react';
import { useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { ArkuszOdlaczenia } from '@/app/(strefa)/profil-rodziny/_czesci/arkusz-odlaczenia';
import { ArkuszZaproszenia } from '@/app/(strefa)/profil-rodziny/_czesci/arkusz-zaproszenia';
import { useStanKontaOsoby, useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { losuj } from '@/dane/magazyn/losowanie';
import { utworzZaproszenie } from '@/dane/magazyn/operacje/drugi-rodzic';
import { pelnomocnictwaKonta } from '@/dane/magazyn/operacje/po-odczycie-zus/odswiez-pelnomocnictwo';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika } from '@/domena/daty';
import {
  czyDaneZPelnomocnictwa,
  poczatekPelnomocnictwa,
  tytulGlowny,
  wybierzPelnomocnictwo,
} from '@/domena/rodzina/pelnomocnictwo';
import { czyProfilMaDrugiegoRodzica, dolaczonyDrugiRodzic, odlaczonyDrugiRodzic } from '@/domena/rodzina/zaproszenia';
import type { DataISO, DrugiRodzic, IdWidoku, KodKomunikatu, KontoPrzewodnika } from '@/domena/typy';
import { formatujDate, formatujKwote, formatujMiesiac } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { KartaSekcjiProfilu, KartySekcjiProfilu, type KartaSekcjiProfiluProps } from '../_czesci/karta-sekcji-profilu';
import { zrodloDoPokazania, type WierszProfilu } from '../_czesci/sekcje-profilu';
import type { PropsSlotu } from './typy';

const t = teksty.ViewProfileSummary.sekcjaDrugiegoRodzica;
const tPel = teksty.ViewSecondParentPowerOfAttorney;

function imieINazwisko(drugi: Pick<DrugiRodzic, 'imie' | 'nazwisko'>): string {
  return [drugi.imie, drugi.nazwisko].filter(Boolean).join(' ');
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

/** Wiersz imienia i nazwiska, gdy profil je zna; źródło jak przy formie zatrudnienia. */
function wierszImienia(drugi: DrugiRodzic, zeZrodlem: boolean): WierszProfilu[] {
  const nazwa = imieINazwisko(drugi);
  if (!nazwa) return [];
  const zrodlo = zeZrodlem ? zrodloDoPokazania(drugi.formaZatrudnienia?.zrodlo) : undefined;
  return [{ klucz: 'imie', etykieta: t.wiersze.imieINazwisko, wartosc: nazwa, zrodlo }];
}

function wierszPlatnika(drugi: DrugiRodzic): WierszProfilu {
  return {
    klucz: 'platnik',
    etykieta: t.wiersze.platnik,
    wartosc: platnikTekst(drugi),
    zrodlo: zrodloDoPokazania(drugi.platnikZasilku?.zrodlo),
  };
}

/**
 * Wiersze z pełnomocnictwa PEL bez formy zatrudnienia i dobrowolnego ubezpieczenia chorobowego, które pokazuje sekcja
 * profilu; wiersz ubezpieczenia chorobowego stoi tylko przy sekcji bez wiersza dobrowolnego ubezpieczenia.
 * Źródło podaje akapit nad wierszami.
 */
function wierszeZPelnomocnictwa(drugi: DrugiRodzic, sekcjaZDobrowolnym: boolean): WierszProfilu[] {
  const dane = drugi.daneZKontaZus;
  const dzien = dane ? dataZeZnacznika(dane.odczytano) : '';
  const tytul = dane ? tytulGlowny(dane.tytuly, dzien) : null;
  const podstawy = tytul?.podstawySkladek ?? [];
  const ostatnia = podstawy.at(-1);
  const stala = podstawy.length === 12 && podstawy.every((p) => p.kwota === podstawy[0].kwota);
  const podstawa = ostatnia
    ? stala
      ? t.podstawaStala({ kwota: formatujKwote(ostatnia.kwota) })
      : t.podstawaOstatnia({ kwota: formatujKwote(ostatnia.kwota), miesiac: formatujMiesiac(ostatnia.miesiac) })
    : t.brakPodstaw;
  // Zakres pełnomocnictwa PEL (3.3.3.2.2 KA-01): tytuły, ubezpieczenie chorobowe, podstawy i wypłata zasiłków przez płatnika.
  return [
    ...(tytul
      ? [{ klucz: 'tytul', etykieta: t.wiersze.tytul, wartosc: t.tytuly[tytul.rodzaj]({ data: formatujDate(tytul.od) }) }]
      : []),
    ...(sekcjaZDobrowolnym
      ? []
      : [
          {
            klucz: 'chorobowe',
            etykieta: t.wiersze.chorobowe,
            wartosc: tytul ? t.rodzajeChorobowego[tytul.ubezpieczenieChorobowe.rodzaj] : t.rodzajeChorobowego.brak,
          },
        ]),
    { klucz: 'podstawa', etykieta: t.wiersze.podstawa, wartosc: podstawa },
    {
      klucz: 'platnik-wyplaca',
      etykieta: t.wiersze.platnikWyplaca,
      wartosc: tytul ? t.wyplacaZasilki[tytul.platnik.wyplacaZasilki] : t.wyplacaZasilki['nie-dotyczy'],
    },
  ];
}

function okresPelnomocnictwa(od: DataISO, doDnia: DataISO | undefined): string {
  return doDnia
    ? tPel.okresOdDo({ od: formatujDate(od), doDnia: formatujDate(doDnia) })
    : tPel.okresDoOdwolania({ od: formatujDate(od) });
}

export function SlotSekcjaDrugiegoRodzica({ tryb, konto, kontekst }: PropsSlotu<'sekcja'>) {
  const karta = use(KartySekcjiProfilu)['drugi-rodzic'];
  if (tryb !== 'rodzina' || kontekst === null || karta === undefined) return null;
  if (!czyProfilMaDrugiegoRodzica(kontekst.rodzina.daneRodziny)) return null;
  if (konto.rola !== 'rodzic' && konto.rola !== 'drugi-rodzic') return null;
  return <SekcjaDrugiegoRodzica konto={konto} kontekst={kontekst} karta={karta} />;
}

function SekcjaDrugiegoRodzica({
  konto,
  kontekst,
  karta,
}: {
  konto: KontoPrzewodnika;
  kontekst: KontekstRodziny;
  karta: KartaSekcjiProfiluProps;
}) {
  // Arkusze w stanie chwilowym: po powrocie na podsumowanie (Cache Components) nie otwierają się ponownie.
  const [zaproszenie, ustawZaproszenie] = useStanChwilowy<{ link: string; wazneDo: DataISO } | null>(null);
  const [odlaczenieOtwarte, ustawOdlaczenieOtwarte] = useStanChwilowy(false);
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
  const nazwa = imieINazwisko(drugi);
  const nazwaDopelniacz = drugi.imieINazwiskoDopelniacz ?? nazwa;

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

  const wierszRoli: WierszProfilu[] = dolaczony
    ? [{ klucz: 'rola', etykieta: t.wiersze.rola, wartosc: t.drugiRodzicOd({ data: formatujDate(dolaczony.dolaczono) }) }]
    : [];

  // Widok konta Drugi rodzic (P19-08): własne dane i akcja zmiany sekcji.
  if (konto.rola === 'drugi-rodzic') {
    const odpowiedz = odpowiedzWTekscie(drugi.zachowaneOdpowiedzi);
    const rodzic = stanRodzica?.konto;
    const rodzicDopelniacz = rodzic?.imieINazwiskoDopelniacz ?? (rodzic ? `${rodzic.imie} ${rodzic.nazwisko}` : '');
    return (
      <KartaSekcjiProfilu
        {...karta}
        tytul={t.tytulDrugiegoRodzica}
        wierszePrzed={[...wierszImienia(drugi, true), ...wierszRoli]}
        wierszePo={[wierszPlatnika(drugi)]}
        podWierszami={
          <Notatka>
            <p>
              {odpowiedz && rodzicDopelniacz
                ? t.notatki.widokDrugiegoRodzica({ imieINazwisko: rodzicDopelniacz, odpowiedz })
                : t.notatki.widokDrugiegoRodzicaBezOdpowiedzi}
            </p>
          </Notatka>
        }
      />
    );
  }

  // Konto Rodzic, drugi rodzic dołączył (P19-09): dane z konta ZUS bez zmiany sekcji i wyłącznie akcja odłączenia.
  if (dolaczony !== null) {
    const bezZmianySekcji = (ekran: IdWidoku) => (ekran === karta.sekcja.ekran ? null : karta.adresEkranu(ekran));
    return (
      <>
        <KartaSekcjiProfilu
          {...karta}
          adresEkranu={bezZmianySekcji}
          wierszePrzed={[...wierszImienia(drugi, true), ...wierszRoli]}
          wierszePo={[wierszPlatnika(drugi)]}
          podWierszami={
            <Notatka>
              <p>{t.notatki.dolaczyl({ imieINazwisko: nazwaDopelniacz })}</p>
            </Notatka>
          }
          boczna={
            <div className="flex flex-col gap-3">
              <h3 className="m-0 text-body-strong text-ink">{t.dolaczony.naglowek({ imieINazwisko: nazwa })}</h3>
              <p className="m-0 text-body">{t.dolaczony.opis({ imie: drugi.imie ?? nazwa })}</p>
              <p className="m-0 text-body">{t.dolaczony.opisOdlaczenia}</p>
              <div>
                <Przycisk wariant="drugorzedny" ikona="odlacz-osobe" onClick={() => ustawOdlaczenieOtwarte(true)}>
                  {t.dolaczony.przycisk}
                </Przycisk>
              </div>
            </div>
          }
        />
        <ArkuszOdlaczenia
          otwarte={odlaczenieOtwarte}
          onZamknij={() => ustawOdlaczenieOtwarte(false)}
          imieINazwisko={nazwa}
        />
      </>
    );
  }

  // Konto Rodzic, drugi rodzic nie dołączył (P19-01, P19-11, P19-14): zaproszenie i pełnomocnictwo PEL.
  const poOdlaczeniu = odlaczony !== null && !zPelnomocnictwa;
  const wierszDostepu: WierszProfilu = {
    klucz: 'dostep',
    etykieta: t.wiersze.dostep,
    wartosc: poOdlaczeniu && odlaczony.odlaczono ? t.odlaczony({ data: formatujDate(odlaczony.odlaczono) }) : t.nieDolaczyl,
  };
  const zachowane = odpowiedzWTekscie(drugi.zachowaneOdpowiedzi);
  const okresPel =
    zPelnomocnictwa && pelnomocnictwo
      ? t.pelnomocnictwo.okres({
          imieINazwisko: pelnomocnictwo.mocodawca.imieINazwiskoDopelniacz,
          okres: okresPelnomocnictwa(poczatekPelnomocnictwa(pelnomocnictwo), pelnomocnictwo.do),
        })
      : null;

  const naglowekTresci =
    zPelnomocnictwa && drugi.daneZKontaZus ? (
      <p className="m-0 mb-2 text-body">
        {t.zrodloPelnomocnictwa({ imieINazwisko: nazwaDopelniacz })}{' '}
        <strong className="font-semibold text-ink-strong">{formatujDate(drugi.daneZKontaZus.odczytano)}</strong>
      </p>
    ) : poOdlaczeniu && nazwa ? (
      <p className="m-0 mb-2 text-body">{t.odlaczonyOpis({ imieINazwisko: nazwa })}</p>
    ) : undefined;

  return (
    <>
      <KartaSekcjiProfilu
        {...karta}
        naglowekTresci={naglowekTresci}
        wierszePrzed={zPelnomocnictwa || poOdlaczeniu ? wierszImienia(drugi, poOdlaczeniu) : []}
        wierszePo={[
          ...(zPelnomocnictwa
            ? wierszeZPelnomocnictwa(drugi, karta.sekcja.wiersze.some((w) => w.klucz === 'dobrowolne-drugiego'))
            : []),
          ...(poOdlaczeniu ? [wierszPlatnika(drugi)] : []),
          wierszDostepu,
        ]}
        podWierszami={
          <Notatka>
            <p>
              {zPelnomocnictwa
                ? zachowane
                  ? t.notatki.zPelnomocnictwa({ odpowiedzi: zachowane })
                  : t.notatki.zPelnomocnictwaBezOdpowiedzi
                : poOdlaczeniu
                  ? t.notatki.poOdlaczeniu
                  : t.notatki.nieDolaczyl}
            </p>
          </Notatka>
        }
        boczna={
          <>
            {blad ? <Komunikat kod={blad} /> : null}
            <div className="flex flex-col gap-3">
              <h3 className="m-0 text-body-strong text-ink">
                {poOdlaczeniu ? t.zaproszenie.naglowekPonownie : t.zaproszenie.naglowek}
              </h3>
              <p className="m-0 text-body">
                {zPelnomocnictwa
                  ? t.zaproszenie.opisPrzyDanychZPelnomocnictwa
                  : poOdlaczeniu
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
          </>
        }
      />
      <ArkuszZaproszenia
        otwarte={zaproszenie !== null}
        onZamknij={() => ustawZaproszenie(null)}
        link={zaproszenie?.link}
        wazneDo={zaproszenie?.wazneDo}
      />
    </>
  );
}
