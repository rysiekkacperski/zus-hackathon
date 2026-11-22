'use client';

// ViewZas53Summary: podsumowanie wniosku ZAS-53 w zakładkach, po jednej na grupę danych, z akcją zmiany każdej
// sekcji, załącznikami (0149, 0103, 0104), przekazem pocztowym (0241), oświadczeniem (0043) pod zakładkami,
// sprawą powiązaną K26 i wysyłką do ZUS (0044). Wybrana zakładka żyje w parametrze ?zakladka=.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatujDate, liczbaDniWlacznie } from '@/domena/daty';
import type { KodKomunikatu, WniosekZas53, Zalacznik } from '@/domena/typy';
import { formatujRachunek } from '@/domena/walidacje';
import { formatujHektary } from '@/domena/wnioski/z10';
import {
  brakujeWymaganegoPliku,
  czyOkresyNachodza,
  czyPoUstaniu,
  ID_ZALACZNIKA_WYPADKU,
  ID_ZALACZNIKA_Z10,
  ID_ZALACZNIKA_ZASWIADCZENIA,
  zbudujZalaczniki,
} from '@/domena/wnioski/zas53';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { dolaczPlikZas53, wyslijZas53, zapiszKrokZas53 } from '@/dane/magazyn/operacje/wnioski-zas53';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { adresCzesci } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Pole } from '@/komponenty/pole';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useZakladkaWAdresie, Zakladki } from '@/komponenty/zakladki';
import {
  adresEkranuZas53,
  adresOstatniejCzesciZas53,
  AkcjeKreatoraZas53,
  BrakWnioskuZas53,
  NaglowekKreatoraZas53,
  PostepZas53,
  poprzedniEkranZas53,
  useWniosekZas53,
} from '../_czesci/kreator';
import { teksty } from '@/teksty';

const t = teksty.ViewZas53Summary;
const tD = teksty.ViewZas53Data;
const tZ = teksty.ViewZas53AfterInsurance;

type ZakladkaZas53 = keyof typeof t.zakladki;

/** Zakładka przed wczytaniem szkicu; po wczytaniu listę wyznacza `zakladkiWniosku`. */
const ZAKLADKI_PRZED_WCZYTANIEM: readonly ZakladkaZas53[] = ['zaswiadczenie'];

function zalacznikiWniosku(wniosek: WniosekZas53): Zalacznik[] {
  return wniosek.zalaczniki.length > 0 ? wniosek.zalaczniki : zbudujZalaczniki(wniosek);
}

/**
 * Zakładki w kolejności sekcji podsumowania. Zaświadczenie ma dwie zakładki (dane zaświadczenia i prawo do zasiłku),
 * a pola plików mają osobną zakładkę, żeby każdy panel mieścił się w oknie 1440×800 razem z przyciskami.
 */
function zakladkiWniosku(wniosek: WniosekZas53): ZakladkaZas53[] {
  const lista: ZakladkaZas53[] = [];
  if (wniosek.zaswiadczenie) lista.push('zaswiadczenie', 'prawo');
  if (czyPoUstaniu(wniosek) && wniosek.oswiadczenieZ10) lista.push('z10');
  lista.push('wnioskodawca', 'wyplata', 'wypadek', 'zalaczniki');
  if (zalacznikiWniosku(wniosek).some((z) => z.id !== ID_ZALACZNIKA_Z10)) lista.push('pliki');
  return lista;
}

function opisDokumentuBiernik(z: Zalacznik, wniosek: WniosekZas53): string {
  if (z.id === ID_ZALACZNIKA_ZASWIADCZENIA) return t.dokumentyBiernik.zaswiadczenie({ numer: z.opis || wniosek.zaswiadczenie?.seriaINumer || '' });
  if (z.id === ID_ZALACZNIKA_Z10) return t.dokumentyBiernik.z10;
  const rodzaj = z.rodzaj as keyof typeof t.plikDokumentu;
  return t.dokumentyBiernik[rodzaj]({ numer: z.opis ?? '' });
}

/** Zwarta lista pytań i odpowiedzi Z-10: pytanie na całą szerokość, odpowiedź przy prawej krawędzi. */
function OdpowiedziZ10({ pozycje }: { pozycje: { pytanie: string; odpowiedz: string }[] }) {
  return (
    <dl className="m-0 min-w-0">
      {pozycje.map((p) => (
        <div
          key={p.pytanie}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line-row py-2 first:pt-0 last:border-b-0 last:pb-0"
        >
          <dt className="min-w-0 flex-1 basis-96 font-semibold text-ink">{p.pytanie}</dt>
          <dd className="m-0 min-w-0 break-words text-ink-strong">{p.odpowiedz}</dd>
        </div>
      ))}
    </dl>
  );
}

export function WidokPodsumowaniaZas53() {
  const k = useWniosekZas53();
  const { zajety: wysylanie, ustawZajety: ustawWysylanie, przejdz } = useNawigacjaZLadowaniem();
  const [oswiadczenie, setOswiadczenie] = useState<boolean | null>(null);
  // Komunikaty i błędy plików są chwilowe: po powrocie na podsumowanie z kroku kreatora widok zaczyna bez nich.
  const [bladWysylki, setBladWysylki] = useStanChwilowy<KodKomunikatu | null>(null);
  const [fokusKomunikatu, setFokusKomunikatu] = useStanChwilowy(0);
  const [bledyPlikow, setBledyPlikow] = useStanChwilowy<Record<string, { kod: KodKomunikatu; nazwa: string }>>({});
  const komunikatRef = useRef<HTMLDivElement>(null);
  const potwierdzone = oswiadczenie ?? k?.wniosek.oswiadczeniePotwierdzone ?? false;
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { oswiadczenie: potwierdzone },
    waliduj: (w: { oswiadczenie: boolean }): { oswiadczenie: KodKomunikatu | null } => ({ oswiadczenie: w.oswiadczenie ? null : '0043' }),
    pola: { oswiadczenie: 'zas53-oswiadczenie' },
  });
  const [zakladka, wybierzZakladke] = useZakladkaWAdresie<ZakladkaZas53>(k ? zakladkiWniosku(k.wniosek) : ZAKLADKI_PRZED_WCZYTANIEM);

  // Po nieudanej próbie fokus trafia na komunikat nad zakładkami.
  useEffect(() => {
    if (fokusKomunikatu > 0) komunikatRef.current?.focus();
  }, [fokusKomunikatu]);

  if (!k) return <BrakWnioskuZas53 />;
  const { wniosek, kopia, konto, rodzina } = k;
  const z = wniosek.zaswiadczenie;
  const poUstaniu = czyPoUstaniu(wniosek);
  const zWypadkiem = wniosek.wypadek?.tak ?? false;
  const zalaczniki = zalacznikiWniosku(wniosek);
  const brakPliku = brakujeWymaganegoPliku(zalaczniki);
  const adres = kopia?.adres ?? '';
  const numer = z?.seriaINumer ?? '';
  const adresEkranu = (e: Parameters<typeof adresEkranuZas53>[0]) => adresEkranuZas53(e, wniosek.idWniosku);
  const dostepne = zakladkiWniosku(wniosek);

  const k26 = rodzina.plan?.pozycje.find((p) => p.idPozycji === 'K26' && p.wynikUstaleniaPrawa?.od && p.wynikUstaleniaPrawa.do);
  const powiazana =
    k26 && wniosek.okresPrawa && czyOkresyNachodza(wniosek.okresPrawa, { od: k26.wynikUstaleniaPrawa?.od as string, do: k26.wynikUstaleniaPrawa?.do as string })
      ? k26
      : undefined;

  const pokazBlad = (kod: KodKomunikatu) => {
    setBladWysylki(kod);
    setFokusKomunikatu((n) => n + 1);
  };

  const zmienOswiadczenie = (wartosc: boolean) => {
    setOswiadczenie(wartosc);
    zapiszKrokZas53(wniosek.idWniosku, { oswiadczeniePotwierdzone: wartosc, zalaczniki }, 'ViewZas53Summary', pobierzKontekstOperacji());
  };

  const dolacz = async (idZalacznika: string, plik: File | undefined) => {
    if (!plik) return;
    if (wniosek.zalaczniki.length === 0) {
      zapiszKrokZas53(wniosek.idWniosku, { zalaczniki }, 'ViewZas53Summary', pobierzKontekstOperacji());
    }
    const wynik = await dolaczPlikZas53(wniosek.idWniosku, idZalacznika, plik, pobierzKontekstOperacji());
    setBledyPlikow((b) => {
      const nowe = { ...b };
      if (wynik.ok) delete nowe[idZalacznika];
      else nowe[idZalacznika] = { kod: wynik.kod, nazwa: plik.name };
      return nowe;
    });
  };

  const wyslij = async () => {
    setBladWysylki(null);
    if (!walidacja.sprobujWyslac()) return;
    ustawWysylanie(true);
    const ctx = pobierzKontekstOperacji();
    zapiszKrokZas53(wniosek.idWniosku, { oswiadczeniePotwierdzone: true, zalaczniki }, 'ViewZas53Summary', ctx);
    const wynik = await wyslijZas53(wniosek.idWniosku, ctx);
    if (!wynik.ok) {
      ustawWysylanie(false);
      if (wynik.kod === '0043') {
        walidacja.pokazBledy({ oswiadczenie: '0043' });
        return;
      }
      if (wynik.kod === '0149' && dostepne.includes('pliki')) wybierzZakladke('pliki');
      pokazBlad(wynik.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0045', dlaWidoku: 'ViewZas53Sent' });
    przejdz(trasy.ViewZas53Sent({ wniosek: wniosek.idWniosku }));
  };

  const zapiszDoDokonczenia = () => {
    const wynik = zapiszKrokZas53(
      wniosek.idWniosku,
      { oswiadczeniePotwierdzone: potwierdzone, zalaczniki },
      'ViewZas53Summary',
      pobierzKontekstOperacji(),
    );
    if (!wynik.ok) {
      pokazBlad(wynik.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseDetails' });
    przejdz(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy }));
  };

  const akcjaZmien = (href: string, sekcja: string) => (
    <Odnosnik href={href} aria-label={t.zmienSekcje({ sekcja })}>
      {t.zmien}
    </Odnosnik>
  );

  // Panel zakładki: karta bez górnego odstępu, bo panel zakładek ma własny odstęp od paska.
  const panel = (tytul: string, tresc: ReactNode, zmien?: string) => (
    <Karta tytul={tytul} bezLinii as="section" className="pt-0" akcje={zmien ? akcjaZmien(zmien, tytul) : undefined}>
      {tresc}
    </Karta>
  );

  const tytulChorobowe = kopia?.tytuly.find((ty) => ty.rodzaj === 'dzialalnosc' && ty.ubezpieczenieChorobowe.rodzaj !== 'brak');
  const ubezpieczenie =
    wniosek.okresUbezpieczenia?.rodzaj === 'po-ustaniu'
      ? t.poUstaniu({ data: formatujDate(wniosek.okresUbezpieczenia.dataUstania) })
      : tytulChorobowe?.ubezpieczenieChorobowe.od
        ? t.wUbezpieczeniuOd({
            rodzaj: teksty.ViewZas53Start.rodzajeChorobowego[tytulChorobowe.ubezpieczenieChorobowe.rodzaj].toLowerCase(),
            od: formatujDate(tytulChorobowe.ubezpieczenieChorobowe.od),
          })
        : t.wUbezpieczeniu;

  const listaDokumentow = zalaczniki.map((zal) => opisDokumentuBiernik(zal, wniosek)).join(', ');
  const plikowe = zalaczniki.filter((zal) => zal.id !== ID_ZALACZNIKA_Z10);
  const bladWPlikach = brakPliku || plikowe.some((zal) => bledyPlikow[zal.id]);

  function trescZakladki(): ReactNode {
    switch (zakladka) {
      case 'zaswiadczenie':
        return z
          ? panel(
              t.kartaZaswiadczenia,
              <ListaDefinicji
                pozycje={[
                  {
                    etykieta: t.seriaINumer,
                    wartosc: z.zrodlo === 'e-zla' ? t.zEzla({ numer }) : t.zTrybuAlternatywnego({ numer: numer || teksty.ViewZas53Start.kreator.bezNumeru }),
                  },
                  {
                    etykieta: t.okresNiezdolnosci,
                    wartosc: teksty.ViewZas53Start.kreator.okresZDniami({ od: formatujDate(z.od), do: formatujDate(z.do), dni: String(liczbaDniWlacznie(z)) }),
                  },
                  ...(z.zrodlo === 'e-zla'
                    ? [{ etykieta: t.kodLiterowy, wartosc: z.kodyLiterowe.length > 0 ? z.kodyLiterowe.map((kod) => t.kody[kod]).join(', ') : t.bezKodu }]
                    : []),
                ]}
              />,
              adresEkranu('ViewZas53Certificate'),
            )
          : null;
      case 'prawo':
        return panel(
          t.kartaPrawa,
          <ListaDefinicji
            pozycje={[
              ...(wniosek.okresPrawa
                ? [{ etykieta: t.zasilekPrzysluguje, wartosc: teksty.ViewZas53Start.kreator.okres({ od: formatujDate(wniosek.okresPrawa.od), do: formatujDate(wniosek.okresPrawa.do) }) }]
                : []),
              { etykieta: t.stawkaZasilku, wartosc: teksty.ViewZas53Start.kreator.stawkaWartosc({ procent: `${wniosek.stawka ?? 100}%` }) },
              { etykieta: t.ubezpieczenie, wartosc: ubezpieczenie },
            ]}
          />,
          adresEkranu('ViewZas53Certificate'),
        );
      case 'z10':
        return wniosek.oswiadczenieZ10
          ? panel(
              t.kartaZ10,
              <OdpowiedziZ10
                pozycje={wniosek.oswiadczenieZ10.odpowiedzi.map((o) => ({
                  pytanie: tZ.pytania[o.pytanie],
                  odpowiedz: [
                    o.tak ? t.odpowiedzTak : t.odpowiedzNie,
                    o.podmiot ?? o.miejsce,
                    o.rodzajDzialalnosci ? tZ.rodzaje[o.rodzajDzialalnosci as keyof typeof tZ.rodzaje] : undefined,
                    o.hektary !== undefined ? `${tZ.hektary}: ${formatujHektary(o.hektary)}` : undefined,
                    o.data ? formatujDate(o.data) : undefined,
                    o.urlop ? teksty.ViewZas53Start.kreator.okres({ od: formatujDate(o.urlop.od), do: formatujDate(o.urlop.do) }) : undefined,
                  ]
                    .filter(Boolean)
                    .join(', '),
                }))}
              />,
              adresEkranu('ViewZas53AfterInsurance'),
            )
          : null;
      case 'wnioskodawca':
        return panel(
          t.kartaWnioskodawcy,
          <ListaDefinicji
            pozycje={[
              {
                etykieta: t.wnioskodawca,
                wartosc: t.wnioskodawcaWartosc({
                  imieINazwisko: kopia ? `${kopia.imie} ${kopia.nazwisko}` : `${konto.imie} ${konto.nazwisko}`,
                  pesel: kopia?.pesel ?? konto.pesel,
                }),
              },
              { etykieta: t.adres, wartosc: adres || tD.brakDanej },
              {
                etykieta: t.telefon,
                wartosc: wniosek.numerTelefonu
                  ? `${wniosek.numerTelefonu.slice(0, 3)} ${wniosek.numerTelefonu.slice(3, 6)} ${wniosek.numerTelefonu.slice(6)}`
                  : t.brakTelefonu,
              },
              {
                etykieta: t.platnik,
                wartosc: wniosek.platnik ? t.platnikWartosc(wniosek.platnik) : tD.brakDanej,
              },
            ]}
          />,
          adresCzesci(adresEkranu('ViewZas53Data'), 2),
        );
      case 'wyplata':
        return panel(
          t.kartaWyplaty,
          wniosek.numerRachunku ? (
            <ListaDefinicji pozycje={[{ etykieta: t.rachunek, wartosc: formatujRachunek(wniosek.numerRachunku) }]} />
          ) : (
            <Komunikat kod="0241" parametry={{ adres: adres || tD.brakDanej }} />
          ),
          adresCzesci(adresEkranu('ViewZas53Data'), 2),
        );
      case 'wypadek':
        return panel(
          t.kartaWypadku,
          wniosek.wypadek?.tak ? (
            <ListaDefinicji
              pozycje={[
                {
                  etykieta: t.odpowiedz,
                  wartosc: t.wypadekTak({ przyczyna: wniosek.wypadek.przyczyna ? tD.przyczyny[wniosek.wypadek.przyczyna].toLowerCase() : '' }),
                },
                ...(wniosek.wypadek.dokument
                  ? [
                      {
                        etykieta: t.dokument,
                        wartosc: t.dokumentWartosc({
                          rodzaj: tD.rodzajeDokumentu[wniosek.wypadek.dokument.rodzaj],
                          numer: wniosek.wypadek.dokument.numer,
                          data: formatujDate(wniosek.wypadek.dokument.data),
                        }),
                      },
                    ]
                  : []),
              ]}
            />
          ) : (
            <p className="m-0">{t.wypadekNie}</p>
          ),
          adresCzesci(adresEkranu('ViewZas53Data'), 3),
        );
      case 'zalaczniki':
        return panel(
          t.kartaAdresata,
          <div className="flex flex-col gap-6">
            <ListaDefinicji pozycje={[{ etykieta: t.adresat, wartosc: t.adresatWartosc }]} />
            {zalaczniki.length === 0 ? <Notatka>{t.bezZalacznikow({ numer })}</Notatka> : <Komunikat kod="0149" parametry={{ listaDokumentow }} />}
            {zalaczniki.some((zal) => zal.id === ID_ZALACZNIKA_Z10) ? (
              <ListaDefinicji pozycje={[{ etykieta: t.z10Zalacznik, wartosc: t.z10Generowane }]} />
            ) : null}
          </div>,
        );
      case 'pliki':
        // Dwa pola plików stoją obok siebie, więc panel z dwoma plikami ma wysokość panelu z jednym plikiem.
        return panel(
          t.kartaPlikow,
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(24rem,100%),1fr))] items-start gap-6">
            {plikowe.map((zal) => {
              const id = `zas53-plik-${zal.id}`;
              const etykieta =
                zal.id === ID_ZALACZNIKA_ZASWIADCZENIA
                  ? t.plikZaswiadczenia({ numer: zal.opis || numer })
                  : zal.id === ID_ZALACZNIKA_WYPADKU
                    ? t.plikDokumentu[zal.rodzaj as keyof typeof t.plikDokumentu]({ numer: zal.opis ?? '' })
                    : zal.rodzaj;
              const blad = bledyPlikow[zal.id];
              return (
                <Pole
                  key={zal.id}
                  id={id}
                  etykieta={etykieta}
                  podpowiedz={zal.wymagany ? t.plikWymagany : t.plikOpcjonalny}
                  blad={blad?.kod ?? null}
                  dodatek={
                    blad ? (
                      <p className="m-0 text-small">{t.plikOdrzucony({ nazwa: blad.nazwa })}</p>
                    ) : zal.plik ? (
                      <p className="m-0 text-small" role="status">
                        {t.plikDolaczony({ nazwa: zal.plik.nazwa })}
                      </p>
                    ) : null
                  }
                >
                  {(aria) => (
                    <input
                      {...aria}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="block w-full max-w-full text-body file:mr-4 file:rounded-sm file:border file:border-brand file:bg-surface-card file:px-4 file:py-2 file:text-brand"
                      onChange={(e) => {
                        void dolacz(zal.id, e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  )}
                </Pole>
              );
            })}
          </div>,
        );
      default:
        return null;
    }
  }

  return (
    <>
      <NaglowekKreatoraZas53 />
      <div className="flex flex-col gap-7.5">
        <PostepZas53 ekran="ViewZas53Summary" poUstaniu={poUstaniu} idWniosku={wniosek.idWniosku} wypadek={zWypadkiem} />
        {bladWysylki ? (
          <div ref={komunikatRef} tabIndex={-1} className="outline-none">
            {bladWysylki === '0149' ? <Komunikat kod="0149" parametry={{ listaDokumentow }} /> : <Komunikat kod={bladWysylki} />}
          </div>
        ) : null}
        <UkladDwuKolumnowy
          etykietaBocznej={t.poWyslaniu}
          tresc={
            <form
              noValidate
              className="flex flex-col gap-7.5"
              onSubmit={(e) => {
                e.preventDefault();
                void wyslij();
              }}
            >
              <div className="flex flex-col gap-4">
                <p className="m-0">{t.wstep}</p>
                <Zakladki<ZakladkaZas53>
                  id="zas53-zakladki"
                  etykieta={t.zakladkiEtykieta}
                  zakladki={dostepne.map((w) => ({ wartosc: w, etykieta: t.zakladki[w], blad: w === 'pliki' && bladWPlikach }))}
                  wybrana={zakladka}
                  onWybor={wybierzZakladke}
                  tloPaneli="card"
                >
                  {trescZakladki()}
                </Zakladki>
              </div>
              <PoleZaznaczenia
                id="zas53-oswiadczenie"
                etykieta={t.oswiadczenie}
                zaznaczone={potwierdzone}
                onZmiana={zmienOswiadczenie}
                {...walidacja.pole('oswiadczenie')}
              />
              <div className="flex flex-col gap-2">
                <AkcjeKreatoraZas53
                  wstecz={adresOstatniejCzesciZas53(poprzedniEkranZas53('ViewZas53Summary', poUstaniu) ?? 'ViewZas53Data', wniosek.idWniosku, zWypadkiem)}
                  onZapisz={zapiszDoDokonczenia}
                  onDalej={() => void wyslij()}
                  etykietaDalej={t.wyslij}
                  dalejWylaczone={brakPliku}
                  zajety={wysylanie}
                  opisDalej={brakPliku ? 'zas53-wyslij-opis' : undefined}
                />
                {brakPliku ? (
                  <p id="zas53-wyslij-opis" className="m-0 text-small">
                    {t.wyslijNieaktywne({ numer: numer || teksty.ViewZas53Start.kreator.bezNumeru })}
                  </p>
                ) : null}
              </div>
            </form>
          }
          boczna={
            <div className="flex flex-col gap-7.5">
              <Karta tytul={t.poWyslaniu} bezLinii as="section">
                <p className="m-0">{t.poWyslaniuTresc({ numer: numer || teksty.ViewZas53Start.kreator.bezNumeru })}</p>
              </Karta>
              {powiazana?.wynikUstaleniaPrawa?.od && powiazana.wynikUstaleniaPrawa.do ? (
                <Karta tytul={t.sprawaPowiazana} bezLinii as="section">
                  <p className="m-0 mb-4">
                    {t.sprawaPowiazanaTresc({
                      od: formatujDate(powiazana.wynikUstaleniaPrawa.od),
                      do: formatujDate(powiazana.wynikUstaleniaPrawa.do),
                    })}
                  </p>
                  <div className="mb-4">
                    <Komunikat kod="0266" />
                  </div>
                  <Odnosnik href={trasy.ViewCaseDetails({ idSprawy: powiazana.idSprawy })}>{t.sprawaPowiazanaAkcja}</Odnosnik>
                </Karta>
              ) : null}
              {z?.zrodlo === 'tryb-alternatywny' ? (
                <Karta tytul={t.odLekarza} bezLinii as="section">
                  <p className="m-0">{t.odLekarzaTresc}</p>
                </Karta>
              ) : null}
            </div>
          }
        />
      </div>
    </>
  );
}
