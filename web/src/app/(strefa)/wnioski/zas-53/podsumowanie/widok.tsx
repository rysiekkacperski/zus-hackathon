'use client';

// ViewZas53Summary: podsumowanie wniosku ZAS-53 z akcją zmiany każdej sekcji, załącznikami (0149, 0103, 0104),
// przekazem pocztowym (0241), oświadczeniem (0043), sprawą powiązaną K26 i wysyłką do ZUS (0044).
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatujDate, liczbaDniWlacznie } from '@/domena/daty';
import type { KodKomunikatu, WniosekZas53, Zalacznik } from '@/domena/typy';
import { formatujRachunek } from '@/domena/walidacje';
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
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Pole } from '@/komponenty/pole';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import {
  adresEkranuZas53,
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

function opisDokumentuBiernik(z: Zalacznik, wniosek: WniosekZas53): string {
  if (z.id === ID_ZALACZNIKA_ZASWIADCZENIA) return t.dokumentyBiernik.zaswiadczenie({ numer: z.opis || wniosek.zaswiadczenie?.seriaINumer || '' });
  if (z.id === ID_ZALACZNIKA_Z10) return t.dokumentyBiernik.z10;
  const rodzaj = z.rodzaj as keyof typeof t.plikDokumentu;
  return t.dokumentyBiernik[rodzaj]({ numer: z.opis ?? '' });
}

export function WidokPodsumowaniaZas53() {
  const k = useWniosekZas53();
  const router = useRouter();
  const [oswiadczenie, setOswiadczenie] = useState<boolean | null>(null);
  const [bladOswiadczenia, setBladOswiadczenia] = useState<KodKomunikatu | null>(null);
  const [bladWysylki, setBladWysylki] = useState<KodKomunikatu | null>(null);
  const [bledyPlikow, setBledyPlikow] = useState<Record<string, { kod: KodKomunikatu; nazwa: string }>>({});
  const [wysylanie, setWysylanie] = useState(false);

  if (!k) return <BrakWnioskuZas53 />;
  const { wniosek, kopia, konto, rodzina } = k;
  const z = wniosek.zaswiadczenie;
  const poUstaniu = czyPoUstaniu(wniosek);
  const zalaczniki = wniosek.zalaczniki.length > 0 ? wniosek.zalaczniki : zbudujZalaczniki(wniosek);
  const potwierdzone = oswiadczenie ?? wniosek.oswiadczeniePotwierdzone;
  const brakPliku = brakujeWymaganegoPliku(zalaczniki);
  const adres = kopia?.adres ?? '';
  const numer = z?.seriaINumer ?? '';
  const adresEkranu = (e: Parameters<typeof adresEkranuZas53>[0]) => adresEkranuZas53(e, wniosek.idWniosku);

  const k26 = rodzina.plan?.pozycje.find((p) => p.idPozycji === 'K26' && p.wynikUstaleniaPrawa?.od && p.wynikUstaleniaPrawa.do);
  const powiazana =
    k26 && wniosek.okresPrawa && czyOkresyNachodza(wniosek.okresPrawa, { od: k26.wynikUstaleniaPrawa?.od as string, do: k26.wynikUstaleniaPrawa?.do as string })
      ? k26
      : undefined;

  const zmienOswiadczenie = (wartosc: boolean) => {
    setOswiadczenie(wartosc);
    setBladOswiadczenia(null);
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
    if (!potwierdzone) {
      setBladOswiadczenia('0043');
      document.getElementById('zas53-oswiadczenie')?.focus();
      return;
    }
    setWysylanie(true);
    const ctx = pobierzKontekstOperacji();
    zapiszKrokZas53(wniosek.idWniosku, { oswiadczeniePotwierdzone: true, zalaczniki }, 'ViewZas53Summary', ctx);
    const wynik = await wyslijZas53(wniosek.idWniosku, ctx);
    setWysylanie(false);
    if (!wynik.ok) {
      if (wynik.kod === '0043') setBladOswiadczenia('0043');
      else setBladWysylki(wynik.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0045', dlaWidoku: 'ViewZas53Sent' });
    router.push(trasy.ViewZas53Sent({ wniosek: wniosek.idWniosku }));
  };

  const zapiszDoDokonczenia = () => {
    const wynik = zapiszKrokZas53(
      wniosek.idWniosku,
      { oswiadczeniePotwierdzone: potwierdzone, zalaczniki },
      'ViewZas53Summary',
      pobierzKontekstOperacji(),
    );
    if (!wynik.ok) {
      setBladWysylki(wynik.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseDetails' });
    router.push(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy }));
  };

  const akcjaZmien = (href: string, sekcja: string) => (
    <Odnosnik href={href} aria-label={t.zmienSekcje({ sekcja })}>
      {t.zmien}
    </Odnosnik>
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

  return (
    <>
      <NaglowekKreatoraZas53 />
      <div className="flex flex-col gap-7.5">
        <PostepZas53 ekran="ViewZas53Summary" poUstaniu={poUstaniu} idWniosku={wniosek.idWniosku} />
        {bladWysylki ? <Komunikat kod={bladWysylki} /> : null}
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
              <p className="m-0">{t.wstep}</p>
              {z ? (
                <Karta tytul={t.kartaZaswiadczenia} bezLinii as="section" akcje={akcjaZmien(adresEkranu('ViewZas53Certificate'), t.kartaZaswiadczenia)}>
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
                      ...(wniosek.okresPrawa
                        ? [{ etykieta: t.zasilekPrzysluguje, wartosc: teksty.ViewZas53Start.kreator.okres({ od: formatujDate(wniosek.okresPrawa.od), do: formatujDate(wniosek.okresPrawa.do) }) }]
                        : []),
                      { etykieta: t.stawkaZasilku, wartosc: teksty.ViewZas53Start.kreator.stawkaWartosc({ procent: `${wniosek.stawka ?? 100}%` }) },
                      { etykieta: t.ubezpieczenie, wartosc: ubezpieczenie },
                    ]}
                  />
                </Karta>
              ) : null}
              {poUstaniu && wniosek.oswiadczenieZ10 ? (
                <Karta tytul={t.kartaZ10} bezLinii as="section" akcje={akcjaZmien(adresEkranu('ViewZas53AfterInsurance'), t.kartaZ10)}>
                  <ListaDefinicji
                    pozycje={wniosek.oswiadczenieZ10.odpowiedzi.map((o) => ({
                      etykieta: tZ.pytania[o.pytanie],
                      wartosc: [
                        o.tak ? t.odpowiedzTak : t.odpowiedzNie,
                        o.podmiot ?? o.miejsce,
                        o.rodzajDzialalnosci ? tZ.rodzaje[o.rodzajDzialalnosci as keyof typeof tZ.rodzaje] : undefined,
                        o.data ? formatujDate(o.data) : undefined,
                      ]
                        .filter(Boolean)
                        .join(', '),
                    }))}
                  />
                </Karta>
              ) : null}
              <Karta tytul={t.kartaWnioskodawcy} bezLinii as="section" akcje={akcjaZmien(adresEkranu('ViewZas53Data'), t.kartaWnioskodawcy)}>
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
                />
              </Karta>
              <Karta tytul={t.kartaWyplaty} bezLinii as="section" akcje={akcjaZmien(adresEkranu('ViewZas53Data'), t.kartaWyplaty)}>
                {wniosek.numerRachunku ? (
                  <ListaDefinicji pozycje={[{ etykieta: t.rachunek, wartosc: formatujRachunek(wniosek.numerRachunku) }]} />
                ) : (
                  <Komunikat kod="0241" parametry={{ adres: adres || tD.brakDanej }} />
                )}
              </Karta>
              <Karta tytul={t.kartaWypadku} bezLinii as="section" akcje={akcjaZmien(adresEkranu('ViewZas53Data'), t.kartaWypadku)}>
                {wniosek.wypadek?.tak ? (
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
                )}
              </Karta>
              <Karta tytul={t.kartaAdresata} bezLinii as="section">
                <div className="flex flex-col gap-6">
                  <ListaDefinicji pozycje={[{ etykieta: t.adresat, wartosc: t.adresatWartosc }]} />
                  {zalaczniki.length === 0 ? (
                    <Notatka>{t.bezZalacznikow({ numer })}</Notatka>
                  ) : (
                    <Komunikat kod="0149" parametry={{ listaDokumentow }} />
                  )}
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
                  {zalaczniki.some((zal) => zal.id === ID_ZALACZNIKA_Z10) ? (
                    <ListaDefinicji pozycje={[{ etykieta: t.z10Zalacznik, wartosc: t.z10Generowane }]} />
                  ) : null}
                </div>
              </Karta>
              <Karta tytul={t.kartaOswiadczenia} bezLinii as="section">
                <PoleZaznaczenia
                  id="zas53-oswiadczenie"
                  etykieta={t.oswiadczenie}
                  zaznaczone={potwierdzone}
                  onZmiana={zmienOswiadczenie}
                  blad={bladOswiadczenia}
                />
              </Karta>
              <AkcjeKreatoraZas53
                wstecz={adresEkranu(poprzedniEkranZas53('ViewZas53Summary', poUstaniu) ?? 'ViewZas53Data')}
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
