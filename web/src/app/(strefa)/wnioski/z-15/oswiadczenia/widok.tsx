'use client';

// ViewZ15Statements: licznik dni w roku kalendarzowym i oświadczenia wniosku Z-15 (część 1: limit, domownik,
// wspólne gospodarstwo i zwolnienia; część 2: zasiłki od poprzedniego płatnika, drugiego rodzica i innego członka rodziny).
import { useState } from 'react';
import { formatujDate, wiekWLatach } from '@/domena/daty';
import { walidujPesel } from '@/domena/pesel';
import type { OswiadczeniaZ15, WniosekZ15 } from '@/domena/typy';
import { czyKontoMatki } from '@/domena/wnioski/zas53';
import { dniOkresow, dniWnioskuPoWylaczeniach, limityWRoku, PARAMETRY_Z15, platnikZasilkuZ15, tytulZChorobowymZ15 } from '@/domena/wnioski/z15';
import { useDzis } from '@/dane/magazyn/hooki';
import { zapiszKrokZ15 } from '@/dane/magazyn/operacje/wnioski-z15';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { adresCzesci, CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { GrupaZaznaczen, PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import {
  AkcjeKreatoraZ15,
  adresEkranuZ15,
  BrakWnioskuZ15,
  NaglowekKreatoraZ15,
  PanelWnioskuZ15,
  PostepZ15,
  useWniosekZ15,
} from '../_czesci/kreator';

const t = teksty.ViewZ15Statements;
const tS = teksty.ViewZ15Start;
type TakNie = 'tak' | 'nie' | null;
type Pole = 'domownik' | 'wspolneGospodarstwo' | 'zwolnienie' | 'zasilekMacierzynski' | 'przerwaniePracy' | 'poprzedniPlatnik'
  | 'dniPoprzedni' | 'drugiImie' | 'drugiNazwisko' | 'drugiPesel' | 'drugiZasilek' | 'dniDrugiego' | 'innyCzlonek' | 'dniInnego';

interface Formularz {
  domownik: TakNie; dniDomownika: string[]; wspolneGospodarstwo: TakNie; zwolnienie: TakNie; dniZwolnienia: string[];
  zasilekMacierzynski: TakNie; przerwaniePracy: TakNie;
  poprzedniPlatnik: 'tak' | 'nie' | 'nie-zmienialem' | null; dniPoprzedni: string;
  drugiNieznany: boolean; drugiImie: string; drugiNazwisko: string; drugiPesel: string; drugiZasilek: TakNie; dniDrugiego: string;
  innyCzlonek: TakNie; dniInnego: string;
}

const tn = (b?: boolean): TakNie => (b === undefined ? null : b ? 'tak' : 'nie');
const OPCJE_TN = [{ wartosc: 'tak' as const, etykieta: teksty.ViewZ15Situation.tak }, { wartosc: 'nie' as const, etykieta: teksty.ViewZ15Situation.nie }];

export function WidokOswiadczenZ15() {
  const k = useWniosekZ15();
  const dzis = useDzis();
  if (!k) return <BrakWnioskuZ15 />;
  return <Formularz kontekst={k} dzis={dzis} />;
}

function Formularz({ kontekst: { wniosek, rodzina, konto, kopia }, dzis }: { kontekst: NonNullable<ReturnType<typeof useWniosekZ15>>; dzis: string }) {
  const { zajety, przejdz } = useNawigacjaZLadowaniem();
  const o = wniosek.oswiadczenia;
  const matkaKonto = czyKontoMatki(konto, rodzina.daneRodziny);
  const drugiZProfilu = matkaKonto && rodzina.daneRodziny.drugiRodzic.imie
    ? { imie: rodzina.daneRodziny.drugiRodzic.imie, nazwisko: rodzina.daneRodziny.drugiRodzic.nazwisko ?? '', pesel: rodzina.daneRodziny.drugiRodzic.pesel ?? '' }
    : null;
  const tytul = tytulZChorobowymZ15(kopia, dzis);
  const jedenPlatnik = (kopia?.tytuly ?? []).filter((x) => x.ubezpieczenieChorobowe.rodzaj !== 'brak').length <= 1;
  const [f, setF] = useState<Formularz>(() => ({
    domownik: tn(o.domownik), dniDomownika: o.dniDomownika ?? [], wspolneGospodarstwo: tn(o.wspolneGospodarstwo),
    zwolnienie: tn(o.zwolnienieZWynagrodzeniem), dniZwolnienia: o.dniZwolnienia ?? [],
    zasilekMacierzynski: tn(o.zasilekMacierzynskiMatki), przerwaniePracy: tn(o.przerwaniePracy),
    poprzedniPlatnik: o.poprzedniPlatnik ?? (jedenPlatnik ? 'nie-zmienialem' : null), dniPoprzedni: o.dniUPoprzedniegoPlatnika?.toString() ?? '',
    drugiNieznany: o.drugiRodzicNieznany ?? false,
    drugiImie: o.drugiRodzic?.imie ?? drugiZProfilu?.imie ?? '', drugiNazwisko: o.drugiRodzic?.nazwisko ?? drugiZProfilu?.nazwisko ?? '',
    drugiPesel: o.drugiRodzic?.pesel ?? drugiZProfilu?.pesel ?? '', drugiZasilek: tn(o.drugiRodzicZasilek), dniDrugiego: o.dniDrugiegoRodzica?.toString() ?? '',
    innyCzlonek: tn(o.innyCzlonekZasilek), dniInnego: o.dniInnegoCzlonka?.toString() ?? '',
  }));
  const [blad, setBlad] = useState<string | null>(null);
  const zmien = (z: Partial<Formularz>) => setF((p) => ({ ...p, ...z }));

  const dodatkowy = wniosek.sytuacja === 'dodatkowy-nowo-narodzone';
  const dziecko = wniosek.osoba?.pokrewienstwo === 'dziecko';
  const wiek = wniosek.osoba?.dataUrodzenia && wniosek.okresy[0] ? wiekWLatach(wniosek.osoba.dataUrodzenia, wniosek.okresy[0].od) : 0;
  const pytanieOGospodarstwo = !dodatkowy && (wniosek.sytuacja === 'chory-malzonek' || (wniosek.sytuacja === 'chore-dziecko' && wiek >= 14));
  const pracownik = tytul?.rodzaj === 'pracownik';
  const dniOkresu = dniOkresow(wniosek.okresy);

  const oswiadczenia = (): OswiadczeniaZ15 => {
    const liczba = (s: string) => (s.trim() === '' ? undefined : Number(s));
    return {
      domownik: dodatkowy ? undefined : f.domownik === 'tak',
      dniDomownika: f.domownik === 'tak' ? f.dniDomownika : [],
      wspolneGospodarstwo: pytanieOGospodarstwo ? f.wspolneGospodarstwo === 'tak' : undefined,
      zwolnienieZWynagrodzeniem: pracownik && !dodatkowy ? f.zwolnienie === 'tak' : undefined,
      dniZwolnienia: f.zwolnienie === 'tak' ? f.dniZwolnienia : [],
      zasilekMacierzynskiMatki: dodatkowy ? f.zasilekMacierzynski === 'tak' : undefined,
      przerwaniePracy: dodatkowy ? f.przerwaniePracy === 'tak' : undefined,
      poprzedniPlatnik: f.poprzedniPlatnik ?? undefined,
      dniUPoprzedniegoPlatnika: f.poprzedniPlatnik === 'tak' ? liczba(f.dniPoprzedni) : undefined,
      drugiRodzicNieznany: dziecko ? f.drugiNieznany : undefined,
      drugiRodzic: dziecko && !f.drugiNieznany ? { imie: f.drugiImie.trim(), nazwisko: f.drugiNazwisko.trim(), pesel: f.drugiPesel.trim() } : undefined,
      drugiRodzicZasilek: dziecko && !f.drugiNieznany ? f.drugiZasilek === 'tak' : undefined,
      dniDrugiegoRodzica: f.drugiZasilek === 'tak' ? liczba(f.dniDrugiego) : undefined,
      innyCzlonekZasilek: f.innyCzlonek === 'tak',
      dniInnegoCzlonka: f.innyCzlonek === 'tak' ? liczba(f.dniInnego) : undefined,
    };
  };
  const roboczy: WniosekZ15 = { ...wniosek, oswiadczenia: oswiadczenia() };
  const limity = limityWRoku(roboczy, rodzina.wnioski);
  const { dni: dniWniosku, drugiegoRodzica } = dniWnioskuPoWylaczeniach(roboczy, rodzina.wnioski);

  const waliduj = (w: Formularz): Partial<Record<Pole, string>> => {
    const b: Partial<Record<Pole, string>> = {};
    const liczbaOk = (s: string, maks: number) => /^\d+$/.test(s.trim()) && Number(s) <= maks;
    if (dodatkowy) {
      if (!w.zasilekMacierzynski) b.zasilekMacierzynski = t.bladOdpowiedzi;
      else if (w.zasilekMacierzynski === 'nie') b.zasilekMacierzynski = t.k0331;
      if (!w.przerwaniePracy) b.przerwaniePracy = t.bladOdpowiedzi;
      else if (w.przerwaniePracy === 'nie') b.przerwaniePracy = t.k0332;
    } else {
      if (!w.domownik) b.domownik = t.bladOdpowiedzi;
      if (pytanieOGospodarstwo && !w.wspolneGospodarstwo) b.wspolneGospodarstwo = t.bladOdpowiedzi;
      else if (pytanieOGospodarstwo && w.wspolneGospodarstwo === 'nie' && !(wniosek.sytuacja === 'chore-dziecko' && wniosek.orzeczenie)) b.wspolneGospodarstwo = t.k0314;
      if (pracownik && !w.zwolnienie) b.zwolnienie = t.bladOdpowiedzi;
      else if (w.zwolnienie === 'tak' && w.dniZwolnienia.length > 4) b.zwolnienie = t.k0317;
    }
    if (!w.poprzedniPlatnik) b.poprzedniPlatnik = t.bladOdpowiedzi;
    if (w.poprzedniPlatnik === 'tak' && !liczbaOk(w.dniPoprzedni, PARAMETRY_Z15.limitLaczny)) b.dniPoprzedni = t.bladLiczby({ maks: '60' });
    if (dziecko && !w.drugiNieznany) {
      if (!w.drugiImie.trim()) b.drugiImie = t.bladOdpowiedzi;
      if (!w.drugiNazwisko.trim()) b.drugiNazwisko = t.bladOdpowiedzi;
      if (w.drugiPesel.trim() && !walidujPesel(w.drugiPesel.trim()).ok) b.drugiPesel = t.bladPesel;
      if (!w.drugiZasilek) b.drugiZasilek = t.bladOdpowiedzi;
      if (w.drugiZasilek === 'tak' && !liczbaOk(w.dniDrugiego, PARAMETRY_Z15.limitLaczny)) b.dniDrugiego = t.bladLiczby({ maks: '60' });
    }
    if (!w.innyCzlonek) b.innyCzlonek = t.bladOdpowiedzi;
    if (w.innyCzlonek === 'tak' && !liczbaOk(w.dniInnego, PARAMETRY_Z15.limitLaczny)) b.dniInnego = t.bladLiczby({ maks: '60' });
    return b;
  };
  const walidacja = useWalidacjaNaBiezaco<Pole, Formularz, string>({
    wartosci: f,
    waliduj,
    pola: {
      domownik: 'z15-domownik', wspolneGospodarstwo: 'z15-gospodarstwo', zwolnienie: 'z15-zwolnienie', zasilekMacierzynski: 'z15-macierzynski',
      przerwaniePracy: 'z15-przerwanie', poprzedniPlatnik: 'z15-poprzedni', drugiZasilek: 'z15-drugi-zasilek', innyCzlonek: 'z15-inny',
    },
  });
  const czesci = useCzesciFormularza<Pole>({
    liczba: 2,
    podzial: [
      ['domownik', 'wspolneGospodarstwo', 'zwolnienie', 'zasilekMacierzynski', 'przerwaniePracy'],
      ['poprzedniPlatnik', 'dniPoprzedni', 'drugiImie', 'drugiNazwisko', 'drugiPesel', 'drugiZasilek', 'dniDrugiego', 'innyCzlonek', 'dniInnego'],
    ],
    walidacja,
  });

  const zapisz = (ekran: 'ViewZ15Statements' | 'ViewZ15Data') =>
    zapiszKrokZ15(
      wniosek.idWniosku,
      { oswiadczenia: oswiadczenia(), dniWRoku: limity, platnikZasilku: platnikZasilkuZ15(rodzina, konto, tytul) },
      ekran,
      pobierzKontekstOperacji(),
    );

  const dalej = () => {
    if (!dodatkowy) {
      if (dniWniosku.length === 0) return setBlad(t.k0313);
      const przekroczony = limity.find((l) => l.dniWniosku > l.dniPozostale);
      if (przekroczony) {
        return setBlad(t.k0308({ rok: String(przekroczony.rok), pozostale: String(przekroczony.dniPozostale), wniosku: String(przekroczony.dniWniosku) }));
      }
    }
    setBlad(null);
    const wynik = zapisz('ViewZ15Data');
    if (!wynik.ok) return setBlad(tS.kreator.bladZapisu);
    przejdz(adresEkranuZ15('ViewZ15Data', wniosek.idWniosku));
  };

  const opcjeDni = dniOkresu.map((d) => ({ wartosc: d, etykieta: formatujDate(d) }));

  return (
    <>
      <NaglowekKreatoraZ15 />
      <UkladDwuKolumnowy
        etykietaBocznej={tS.kreator.twojWniosek}
        tresc={
          <Stos odstep={4}>
            <PostepZ15 ekran="ViewZ15Statements" czesc={czesci.czesc} />
            <CzescFormularza czesci={czesci} numer={1}>
              <Karta tytul={t.czesc1} bezLinii as="section">
                <Stos odstep={4}>
                  {dodatkowy ? (
                    <>
                      <Komunikat tresc={t.k0333({ liczba: String(PARAMETRY_Z15.limitLaczny - (limity[0]?.dniWykorzystane ?? 0)) })} typ="INFO" />
                      <GrupaOpcji nazwa="z15-macierzynski" legenda={t.zasilekMacierzynski} uklad="poziomo" opcje={OPCJE_TN} wartosc={f.zasilekMacierzynski}
                        onZmiana={(w) => zmien({ zasilekMacierzynski: w })} {...walidacja.pole('zasilekMacierzynski')} />
                      <GrupaOpcji nazwa="z15-przerwanie" legenda={t.przerwaniePracy} uklad="poziomo" opcje={OPCJE_TN} wartosc={f.przerwaniePracy}
                        onZmiana={(w) => zmien({ przerwaniePracy: w })} {...walidacja.pole('przerwaniePracy')} />
                    </>
                  ) : (
                    <>
                      {limity.map((l) => (
                        <section key={l.rok} aria-label={t.rok({ rok: String(l.rok) })}>
                          <h3 className="m-0 mb-2 text-body-strong">{t.rok({ rok: String(l.rok) })}</h3>
                          <ListaDefinicji
                            szerokoscEtykiety="waska"
                            pozycje={[
                              { etykieta: t.kategoria({ limit: String(l.limitKategorii) }), wartosc: t.dni({ liczba: String(l.limitKategorii) }) },
                              { etykieta: t.lacznyLimit, wartosc: t.dni({ liczba: String(l.limitLaczny) }) },
                              { etykieta: t.wykorzystane, wartosc: t.dni({ liczba: String(l.dniWykorzystane) }) },
                              { etykieta: t.pozostale, wartosc: t.dni({ liczba: String(l.dniPozostale) }) },
                              { etykieta: t.dniWniosku, wartosc: t.dni({ liczba: String(l.dniWniosku) }) },
                            ]}
                          />
                        </section>
                      ))}
                      <GrupaOpcji nazwa="z15-domownik" legenda={t.domownik} podpowiedz={t.opisDomownika} uklad="poziomo" opcje={OPCJE_TN}
                        wartosc={f.domownik} onZmiana={(w) => zmien({ domownik: w })} {...walidacja.pole('domownik')} />
                      {f.domownik === 'tak' ? (
                        <GrupaZaznaczen legenda={t.dniDomownika} opcje={opcjeDni} wartosci={f.dniDomownika} onZmiana={(w) => zmien({ dniDomownika: w })} />
                      ) : null}
                      {pytanieOGospodarstwo ? (
                        <GrupaOpcji nazwa="z15-gospodarstwo" legenda={t.wspolneGospodarstwo} uklad="poziomo" opcje={OPCJE_TN}
                          wartosc={f.wspolneGospodarstwo} onZmiana={(w) => zmien({ wspolneGospodarstwo: w })} {...walidacja.pole('wspolneGospodarstwo')} />
                      ) : null}
                      {pracownik ? (
                        <GrupaOpcji nazwa="z15-zwolnienie" legenda={t.zwolnienie} uklad="poziomo" opcje={OPCJE_TN}
                          wartosc={f.zwolnienie} onZmiana={(w) => zmien({ zwolnienie: w })} {...walidacja.pole('zwolnienie')} />
                      ) : null}
                      {f.zwolnienie === 'tak' ? (
                        <GrupaZaznaczen legenda={t.dniZwolnienia} opcje={opcjeDni} wartosci={f.dniZwolnienia} onZmiana={(w) => zmien({ dniZwolnienia: w })} />
                      ) : null}
                      {f.zwolnienie === 'tak' && f.dniZwolnienia.length > 0 ? <Komunikat tresc={t.k0310({ liczba: String(f.dniZwolnienia.length) })} typ="INFO" /> : null}
                      {drugiegoRodzica.length > 0 ? (
                        <Komunikat tresc={t.k0307({ od: formatujDate(drugiegoRodzica[0]), do: formatujDate(drugiegoRodzica[drugiegoRodzica.length - 1]) })} typ="INFO" />
                      ) : null}
                    </>
                  )}
                </Stos>
              </Karta>
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={2}>
              <Karta tytul={t.czesc2} bezLinii as="section">
                <Stos odstep={4}>
                  <GrupaOpcji
                    nazwa="z15-poprzedni"
                    legenda={t.poprzedniPlatnik}
                    uklad="poziomo"
                    opcje={[...OPCJE_TN, { wartosc: 'nie-zmienialem' as const, etykieta: t.nieZmienialem }]}
                    wartosc={f.poprzedniPlatnik}
                    onZmiana={(w) => zmien({ poprzedniPlatnik: w })}
                    {...walidacja.pole('poprzedniPlatnik')}
                  />
                  {f.poprzedniPlatnik === 'tak' ? (
                    <PoleTekstowe id="dniPoprzedni" etykieta={t.liczbaDniPoprzedni} inputMode="numeric" szerokosc="waska" wartosc={f.dniPoprzedni} onZmiana={(v) => zmien({ dniPoprzedni: v })} {...walidacja.pole('dniPoprzedni')} />
                  ) : null}
                  {dziecko ? (
                    <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
                      <legend className="mb-2 text-body-strong">{t.drugiRodzic}</legend>
                      {drugiZProfilu ? (
                        <p className="m-0">{`${drugiZProfilu.imie} ${drugiZProfilu.nazwisko}${drugiZProfilu.pesel ? `, PESEL ${drugiZProfilu.pesel}` : ''}`}</p>
                      ) : (
                        <>
                          <PoleZaznaczenia id="z15-drugi-nieznany" etykieta={t.drugiRodzicNieznany} zaznaczone={f.drugiNieznany} onZmiana={(z) => zmien({ drugiNieznany: z })} />
                          {f.drugiNieznany ? null : (
                            <div className="flex flex-wrap gap-4">
                              <PoleTekstowe id="drugiImie" etykieta={t.imie} wartosc={f.drugiImie} onZmiana={(v) => zmien({ drugiImie: v })} {...walidacja.pole('drugiImie')} />
                              <PoleTekstowe id="drugiNazwisko" etykieta={t.nazwisko} wartosc={f.drugiNazwisko} onZmiana={(v) => zmien({ drugiNazwisko: v })} {...walidacja.pole('drugiNazwisko')} />
                              <PoleTekstowe id="drugiPesel" etykieta={t.pesel} inputMode="numeric" wartosc={f.drugiPesel} onZmiana={(v) => zmien({ drugiPesel: v })} {...walidacja.pole('drugiPesel')} />
                            </div>
                          )}
                        </>
                      )}
                      {f.drugiNieznany ? null : (
                        <GrupaOpcji nazwa="z15-drugi-zasilek" legenda={t.drugiRodzicZasilek} uklad="poziomo" opcje={OPCJE_TN} wartosc={f.drugiZasilek}
                          onZmiana={(w) => zmien({ drugiZasilek: w })} {...walidacja.pole('drugiZasilek')} />
                      )}
                      {f.drugiZasilek === 'tak' && !f.drugiNieznany ? (
                        <PoleTekstowe id="dniDrugiego" etykieta={t.liczbaDniDrugiego} inputMode="numeric" szerokosc="waska" wartosc={f.dniDrugiego} onZmiana={(v) => zmien({ dniDrugiego: v })} {...walidacja.pole('dniDrugiego')} />
                      ) : null}
                    </fieldset>
                  ) : null}
                  <GrupaOpcji nazwa="z15-inny" legenda={t.innyCzlonek} uklad="poziomo" opcje={OPCJE_TN} wartosc={f.innyCzlonek}
                    onZmiana={(w) => zmien({ innyCzlonek: w })} {...walidacja.pole('innyCzlonek')} />
                  {f.innyCzlonek === 'tak' ? (
                    <PoleTekstowe id="dniInnego" etykieta={t.liczbaDniInnego} inputMode="numeric" szerokosc="waska" wartosc={f.dniInnego} onZmiana={(v) => zmien({ dniInnego: v })} {...walidacja.pole('dniInnego')} />
                  ) : null}
                  {blad ? <Komunikat tresc={blad} typ="ERROR" /> : null}
                </Stos>
              </Karta>
            </CzescFormularza>
            <AkcjeKreatoraZ15
              onWstecz={() => czesci.wroc(() => przejdz(adresCzesci(adresEkranuZ15('ViewZ15Situation', wniosek.idWniosku), 2)))}
              onZapisz={() => setBlad(zapisz('ViewZ15Statements').ok ? null : tS.kreator.bladZapisu)}
              onDalej={() => czesci.dalej(dalej)}
              zajety={zajety}
            />
          </Stos>
        }
        boczna={<PanelWnioskuZ15 wniosek={wniosek} />}
      />
    </>
  );
}
