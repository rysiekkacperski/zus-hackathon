'use client';

// ViewZ15Situation: osoba pod opieką, orzeczenie, sytuacja opieki (część 1) oraz zaświadczenia e-ZLA na opiekę
// i okresy opieki (część 2). Sytuacja dodatkowego zasiłku ma sytuację mamy i zakres do 8. tygodnia życia dziecka.
import { useMemo, useState } from 'react';
import { dodajDni, formatujDate, parsujDate, porownajDaty } from '@/domena/daty';
import type { OkresOpiekiZ15, SytuacjaOpiekiZ15, WniosekZ15 } from '@/domena/typy';
import {
  czyKolejnyOkres,
  czyOjciecDziecka,
  czySytuacjaZZaswiadczeniem,
  dniBezChorobowego,
  kluczOsoby,
  kluczZaswiadczeniaZ15,
  osobyPodOpieka,
  ostatniDzienOsmegoTygodnia,
  PARAMETRY_Z15,
  przekroczenieWieku,
  sytuacjeDostepne,
  zakresDodatkowego,
  zaswiadczeniaNaOpieke,
} from '@/domena/wnioski/z15';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { zapiszKrokZ15 } from '@/dane/magazyn/operacje/wnioski-z15';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleDaty, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
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

const t = teksty.ViewZ15Situation;
const tS = teksty.ViewZ15Start;

type OkresFormularza = { od: string; do: string; seria: string };
type SytuacjaMatki = NonNullable<WniosekZ15['sytuacjaMatki']>['rodzaj'];
type Placowka = NonNullable<WniosekZ15['placowka']>['rodzaj'];
interface Formularz {
  osoba: string | null;
  orzeczenie: 'tak' | 'nie' | null;
  sytuacja: SytuacjaOpiekiZ15 | null;
  placowka: Placowka | null;
  dataPowiadomienia: string;
  sytuacjaMatki: SytuacjaMatki | null;
  dataZdarzenia: string;
  dataWypisu: string;
  zaswiadczenia: string[];
  okresy: OkresFormularza[];
}
type Pole = 'osoba' | 'orzeczenie' | 'sytuacja' | 'placowka' | 'dataPowiadomienia' | 'sytuacjaMatki' | 'dataZdarzenia' | 'dataWypisu' | 'okresy';

const tekstDaty = (d?: string) => (d ? formatujDate(d) : '');

function formularzZeSzkicu(w: WniosekZ15): Formularz {
  return {
    osoba: w.osoba ? kluczOsoby(w.osoba) : null,
    orzeczenie: w.orzeczenie === undefined ? null : w.orzeczenie ? 'tak' : 'nie',
    sytuacja: w.sytuacja ?? null,
    placowka: w.placowka?.rodzaj ?? null,
    dataPowiadomienia: tekstDaty(w.placowka?.dataPowiadomienia),
    sytuacjaMatki: w.sytuacjaMatki?.rodzaj ?? null,
    dataZdarzenia: tekstDaty(w.sytuacjaMatki?.dataZdarzenia),
    dataWypisu: tekstDaty(w.sytuacjaMatki?.dataWypisu),
    zaswiadczenia: w.okresy.filter((o) => o.seriaINumer && !o.trybAlternatywny).map((o) => kluczZaswiadczeniaZ15(o.seriaINumer)),
    okresy: w.okresy.filter((o) => !o.seriaINumer || o.trybAlternatywny).map((o) => ({ od: formatujDate(o.od), do: formatujDate(o.do), seria: o.seriaINumer ?? '' })),
  };
}

export function WidokSytuacjiZ15() {
  const k = useWniosekZ15();
  const rodzinny = useKontekstRodziny();
  if (!rodzinny) return <SzkieletWidoku />;
  if (!k) return <BrakWnioskuZ15 />;
  return <Formularz kontekst={k} dzis={rodzinny.dzis} matka={rodzinny.daneZusMatki} />;
}

function Formularz({
  kontekst: { wniosek, rodzina, konto, kopia },
  dzis,
  matka,
}: {
  kontekst: NonNullable<ReturnType<typeof useWniosekZ15>>;
  dzis: string;
  matka: { imie: string; nazwisko: string; pesel: string } | null;
}) {
  const { zajety, przejdz } = useNawigacjaZLadowaniem();
  const [f, setF] = useState<Formularz>(() => formularzZeSzkicu(wniosek));
  const [informacja, setInformacja] = useState<string | null>(null);
  const ojciec = czyOjciecDziecka(konto, rodzina);
  const osoby = useMemo(
    () => osobyPodOpieka(rodzina, konto, kopia, matka ? { imie: matka.imie, nazwisko: matka.nazwisko, pesel: matka.pesel } : undefined),
    [rodzina, konto, kopia, matka],
  );
  const osoba = osoby.find((o) => kluczOsoby(o) === f.osoba);
  const dataPorodu = rodzina.daneCiazy?.dataPorodu;
  const sytuacje = sytuacjeDostepne({
    osoba,
    orzeczenie: f.orzeczenie === 'tak',
    dzis,
    ojciec,
    dataPorodu,
    dataPoroduPotwierdzona: rodzina.daneCiazy?.dataPoroduPotwierdzona,
  });
  const dodatkowy = f.sytuacja === 'dodatkowy-nowo-narodzone';
  const zZaswiadczeniem = czySytuacjaZZaswiadczeniem(f.sytuacja ?? undefined);
  const zaswiadczenia = zZaswiadczeniem ? zaswiadczeniaNaOpieke(kopia, osoba, rodzina.wnioski, dzis) : [];
  const matkaBezChorobowego = dodatkowy && !rodzina.daneRodziny.matka.formaZatrudnienia?.wartosc
    ? false
    : dodatkowy && (rodzina.daneRodziny.matka.formaZatrudnienia?.wartosc === 'brak-tytulu' ||
        (rodzina.daneRodziny.matka.formaZatrudnienia?.wartosc !== 'umowa-o-prace' && rodzina.daneRodziny.matka.dobrowolneChorobowe?.wartosc === false));

  const okresy = (): OkresOpiekiZ15[] => {
    const wybrane = zaswiadczenia
      .filter((z) => f.zaswiadczenia.includes(kluczZaswiadczeniaZ15(z.seriaINumer)))
      .map((z) => ({ od: z.od, do: z.do, seriaINumer: z.seriaINumer }));
    const wpisane = f.okresy.flatMap((o) => {
      const od = parsujDate(o.od);
      const doDnia = parsujDate(o.do);
      if (!od || !doDnia) return [];
      return [{ od, do: doDnia, ...(zZaswiadczeniem ? { seriaINumer: o.seria.trim(), trybAlternatywny: true } : {}) }];
    });
    return [...wybrane, ...wpisane];
  };

  const zakres =
    dodatkowy && dataPorodu && parsujDate(f.dataZdarzenia)
      ? zakresDodatkowego(dataPorodu, parsujDate(f.dataZdarzenia)!, parsujDate(f.dataWypisu) ?? undefined)
      : null;

  const waliduj = (w: Formularz): Partial<Record<Pole, string>> => {
    const b: Partial<Record<Pole, string>> = {};
    if (!w.osoba) b.osoba = t.bladOsoby;
    if (osoba?.pokrewienstwo === 'dziecko' && !w.orzeczenie) b.orzeczenie = t.bladOsoby;
    if (!w.sytuacja) b.sytuacja = t.bladSytuacji;
    else if (dodatkowy && matkaBezChorobowego) b.sytuacja = t.k0331;
    if (w.sytuacja === 'zamkniecie-placowki') {
      if (!w.placowka) b.placowka = t.bladPlacowki;
      const data = parsujDate(w.dataPowiadomienia);
      if (!data) b.dataPowiadomienia = t.bladDaty;
      else {
        const pierwszy = okresy().map((o) => o.od).sort()[0];
        if (pierwszy && porownajDaty(data, dodajDni(pierwszy, -PARAMETRY_Z15.dniPowiadomieniaOZamknieciu)) <= 0) b.dataPowiadomienia = t.k0302;
      }
    }
    if (w.sytuacja === 'dodatkowy-nowo-narodzone') {
      if (!w.sytuacjaMatki) b.sytuacjaMatki = t.bladSytuacji;
      const zd = parsujDate(w.dataZdarzenia);
      if (!zd) b.dataZdarzenia = t.bladDaty;
      else if (porownajDaty(zd, dzis) > 0) b.dataZdarzenia = t.bladDatyPrzyszlej;
      else if (dataPorodu && porownajDaty(zd, ostatniDzienOsmegoTygodnia(dataPorodu)) > 0) {
        b.dataZdarzenia = t.k0327({ data: formatujDate(ostatniDzienOsmegoTygodnia(dataPorodu)) });
      } else if (dataPorodu && w.sytuacjaMatki === 'porzucenie' && porownajDaty(zd, dataPorodu) < 0) {
        b.dataZdarzenia = t.k0328({ data: formatujDate(dataPorodu) });
      }
      if (w.sytuacjaMatki === 'szpital' && w.dataWypisu.trim()) {
        const wy = parsujDate(w.dataWypisu);
        if (!wy || (zd && porownajDaty(wy, zd) < 0) || porownajDaty(wy, dzis) > 0) b.dataWypisu = t.k0329({ data: zd ? formatujDate(zd) : '' });
      }
    }
    return b;
  };

  const walidacja = useWalidacjaNaBiezaco<Pole, Formularz, string>({
    wartosci: f,
    waliduj,
    pola: { osoba: 'z15-osoba', orzeczenie: 'z15-orzeczenie', sytuacja: 'z15-sytuacja', placowka: 'z15-placowka', sytuacjaMatki: 'z15-sytuacja-matki' },
  });
  const czesci = useCzesciFormularza<Pole>({
    liczba: 2,
    podzial: [['osoba', 'orzeczenie', 'sytuacja', 'placowka', 'dataPowiadomienia', 'sytuacjaMatki', 'dataZdarzenia', 'dataWypisu'], ['okresy']],
    walidacja,
  });

  const zmien = (z: Partial<Formularz>) => setF((p) => ({ ...p, ...z }));

  const zmiana = (): Partial<WniosekZ15> => {
    const zd = parsujDate(f.dataZdarzenia);
    return {
      osoba,
      orzeczenie: osoba?.pokrewienstwo === 'dziecko' ? f.orzeczenie === 'tak' : undefined,
      sytuacja: f.sytuacja ?? undefined,
      okresy: okresy(),
      placowka: f.sytuacja === 'zamkniecie-placowki' && f.placowka ? { rodzaj: f.placowka, dataPowiadomienia: parsujDate(f.dataPowiadomienia) ?? undefined } : undefined,
      sytuacjaMatki:
        dodatkowy && f.sytuacjaMatki && zd
          ? { rodzaj: f.sytuacjaMatki, dataZdarzenia: zd, dataWypisu: parsujDate(f.dataWypisu) ?? undefined }
          : undefined,
    };
  };

  const zapisz = () => {
    const wynik = zapiszKrokZ15(wniosek.idWniosku, zmiana(), 'ViewZ15Situation', pobierzKontekstOperacji());
    setInformacja(wynik.ok ? tS.kreator.zapisano : tS.kreator.bladZapisu);
  };

  const [bladOkresow, setBladOkresow] = useState<string | null>(null);
  const dalej = () => {
    const lista = okresy();
    if (lista.length === 0) return setBladOkresow(t.k0304);
    if (f.okresy.some((o) => !parsujDate(o.od) || !parsujDate(o.do))) return setBladOkresow(t.bladDaty);
    if (lista.some((o) => porownajDaty(o.od, o.do) > 0)) return setBladOkresow(t.bladKolejnosci);
    if (zZaswiadczeniem && f.okresy.some((o) => !o.seria.trim())) return setBladOkresow(t.bladSerii);
    if (lista.length > PARAMETRY_Z15.maksOkresow) return setBladOkresow(t.k0304);
    const wiek = przekroczenieWieku(osoba, f.sytuacja ?? undefined, f.orzeczenie === 'tak', lista);
    if (wiek) return setBladOkresow(t.k0303({ wiek: String(wiek.wiek), data: formatujDate(wiek.urodziny) }));
    if (zakres && lista.some((o) => porownajDaty(o.od, zakres.od) < 0 || porownajDaty(o.do, zakres.do) > 0)) {
      return setBladOkresow(t.k0330({ od: formatujDate(zakres.od), do: formatujDate(zakres.do) }));
    }
    const bladPowiadomienia = waliduj(f).dataPowiadomienia;
    if (bladPowiadomienia) return setBladOkresow(bladPowiadomienia);
    setBladOkresow(null);
    const wynik = zapiszKrokZ15(wniosek.idWniosku, zmiana(), 'ViewZ15Statements', pobierzKontekstOperacji());
    if (!wynik.ok) return setInformacja(tS.kreator.bladZapisu);
    przejdz(adresEkranuZ15('ViewZ15Statements', wniosek.idWniosku));
  };

  const bezChorobowego = dniBezChorobowego(kopia, okresy());
  const kolejny = czyKolejnyOkres({ ...wniosek, ...zmiana(), okresy: okresy() } as WniosekZ15, rodzina.wnioski);

  return (
    <>
      <NaglowekKreatoraZ15 />
      <UkladDwuKolumnowy
        etykietaBocznej={tS.kreator.twojWniosek}
        tresc={
          <Stos odstep={4}>
            <PostepZ15 ekran="ViewZ15Situation" czesc={czesci.czesc} />
            {informacja ? <Komunikat tresc={informacja} typ="INFO" /> : null}
            <CzescFormularza czesci={czesci} numer={1}>
              <Karta tytul={t.czesc1} bezLinii as="section">
                <Stos odstep={4}>
                  {osoby.length === 0 ? (
                    <Komunikat tresc={t.brakOsob} typ="INFO" />
                  ) : (
                    <GrupaOpcji
                      nazwa="z15-osoba"
                      legenda={t.osoba}
                      opcje={osoby.map((o) => ({
                        wartosc: kluczOsoby(o),
                        etykieta: `${o.imie} ${o.nazwisko}`,
                        opis: t.opisOsoby({
                          pesel: o.pesel ?? t.brakPesel,
                          data: o.dataUrodzenia ? formatujDate(o.dataUrodzenia) : '',
                          pokrewienstwo: tS.pokrewienstwa[o.pokrewienstwo],
                        }),
                      }))}
                      wartosc={f.osoba}
                      onZmiana={(w) => zmien({ osoba: w, sytuacja: null, zaswiadczenia: [], okresy: [] })}
                      {...walidacja.pole('osoba')}
                    />
                  )}
                  {osoba?.pokrewienstwo === 'dziecko' ? (
                    <GrupaOpcji
                      nazwa="z15-orzeczenie"
                      legenda={t.orzeczenie}
                      uklad="poziomo"
                      opcje={[{ wartosc: 'tak', etykieta: t.tak }, { wartosc: 'nie', etykieta: t.nie }]}
                      wartosc={f.orzeczenie}
                      onZmiana={(w) => zmien({ orzeczenie: w as 'tak' | 'nie' })}
                      {...walidacja.pole('orzeczenie')}
                    />
                  ) : null}
                  {osoba ? (
                    <GrupaOpcji
                      nazwa="z15-sytuacja"
                      legenda={t.sytuacja}
                      uklad="proste"
                      opcje={sytuacje.map((s) => ({ wartosc: s, etykieta: tS.sytuacje[s] }))}
                      wartosc={f.sytuacja}
                      onZmiana={(w) => zmien({ sytuacja: w, zaswiadczenia: [], okresy: [] })}
                      {...walidacja.pole('sytuacja')}
                    />
                  ) : null}
                  {f.sytuacja === 'zamkniecie-placowki' ? (
                    <>
                      <GrupaOpcji
                        nazwa="z15-placowka"
                        legenda={t.placowka}
                        uklad="poziomo"
                        opcje={(Object.keys(t.placowki) as Placowka[]).map((p) => ({ wartosc: p, etykieta: t.placowki[p] }))}
                        wartosc={f.placowka}
                        onZmiana={(w) => zmien({ placowka: w })}
                        {...walidacja.pole('placowka')}
                      />
                      <PoleDaty id="dataPowiadomienia" etykieta={t.dataPowiadomienia} wartosc={f.dataPowiadomienia} onZmiana={(v) => zmien({ dataPowiadomienia: v })} {...walidacja.pole('dataPowiadomienia')} />
                    </>
                  ) : null}
                  {dodatkowy ? (
                    <>
                      <GrupaOpcji
                        nazwa="z15-sytuacja-matki"
                        legenda={t.sytuacjaMatki}
                        uklad="proste"
                        opcje={(Object.keys(t.sytuacjeMatki) as SytuacjaMatki[]).map((s) => ({ wartosc: s, etykieta: t.sytuacjeMatki[s] }))}
                        wartosc={f.sytuacjaMatki}
                        onZmiana={(w) => zmien({ sytuacjaMatki: w })}
                        {...walidacja.pole('sytuacjaMatki')}
                      />
                      <PoleDaty id="dataZdarzenia" etykieta={t.dataZdarzenia} wartosc={f.dataZdarzenia} onZmiana={(v) => zmien({ dataZdarzenia: v })} {...walidacja.pole('dataZdarzenia')} />
                      {f.sytuacjaMatki === 'szpital' ? (
                        <PoleDaty id="dataWypisu" etykieta={t.dataWypisu} wartosc={f.dataWypisu} onZmiana={(v) => zmien({ dataWypisu: v })} {...walidacja.pole('dataWypisu')} />
                      ) : null}
                      {f.sytuacjaMatki ? <Komunikat tresc={t.k0144} typ="INFO" /> : null}
                      {f.sytuacjaMatki === 'szpital' && !f.dataWypisu.trim() ? <Komunikat kod="0334" typ="INFO" /> : null}
                    </>
                  ) : null}
                </Stos>
              </Karta>
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={2}>
              <Karta tytul={t.czesc2} bezLinii as="section">
                <Stos odstep={4}>
                  {zZaswiadczeniem ? (
                    zaswiadczenia.length > 0 ? (
                      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
                        <legend className="mb-2 text-body-strong">{t.zaswiadczenia}</legend>
                        {zaswiadczenia.map((z) => {
                          const klucz = kluczZaswiadczeniaZ15(z.seriaINumer);
                          return (
                            <PoleZaznaczenia
                              key={klucz}
                              id={`z15-zla-${klucz}`}
                              etykieta={t.zaswiadczenie({ numer: z.seriaINumer, od: formatujDate(z.od), do: formatujDate(z.do), platnik: z.platnik })}
                              zaznaczone={f.zaswiadczenia.includes(klucz)}
                              onZmiana={(zazn) =>
                                zmien({ zaswiadczenia: zazn ? [...f.zaswiadczenia, klucz] : f.zaswiadczenia.filter((x) => x !== klucz) })
                              }
                            />
                          );
                        })}
                      </fieldset>
                    ) : (
                      <Komunikat kod="0299" typ="INFO" />
                    )
                  ) : null}
                  {zakres ? <p className="m-0">{t.zakresDodatkowego({ od: formatujDate(zakres.od), do: formatujDate(zakres.do) })}</p> : null}
                  {f.okresy.map((o, i) => (
                    <fieldset key={i} className="m-0 flex flex-wrap items-end gap-4 border-0 p-0">
                      <legend className="mb-2 text-body-strong">{t.okresNr({ numer: i + 1 })}</legend>
                      <PoleDaty id={`z15-od-${i}`} etykieta={t.poczatek} wartosc={o.od} onZmiana={(v) => zmien({ okresy: f.okresy.map((x, j) => (j === i ? { ...x, od: v } : x)) })} />
                      <PoleDaty id={`z15-do-${i}`} etykieta={t.koniec} wartosc={o.do} onZmiana={(v) => zmien({ okresy: f.okresy.map((x, j) => (j === i ? { ...x, do: v } : x)) })} />
                      {zZaswiadczeniem ? (
                        <PoleTekstowe id={`z15-seria-${i}`} etykieta={t.seriaINumer} wartosc={o.seria} onZmiana={(v) => zmien({ okresy: f.okresy.map((x, j) => (j === i ? { ...x, seria: v } : x)) })} />
                      ) : null}
                      <Przycisk type="button" wariant="drugorzedny" onClick={() => zmien({ okresy: f.okresy.filter((_, j) => j !== i) })}>
                        {t.usunOkres}
                      </Przycisk>
                    </fieldset>
                  ))}
                  {okresy().length < PARAMETRY_Z15.maksOkresow ? (
                    <div>
                      <Przycisk type="button" wariant="drugorzedny" onClick={() => zmien({ okresy: [...f.okresy, { od: '', do: '', seria: '' }] })}>
                        {t.dodajOkres}
                      </Przycisk>
                    </div>
                  ) : null}
                  {bezChorobowego.length > 0 ? (
                    <Komunikat tresc={t.k0301({ od: formatujDate(bezChorobowego[0]), do: formatujDate(bezChorobowego[bezChorobowego.length - 1]) })} typ="INFO" />
                  ) : null}
                  {kolejny ? <Komunikat kod="0300" typ="INFO" /> : null}
                  {bladOkresow ? <Komunikat tresc={bladOkresow} typ="ERROR" /> : null}
                </Stos>
              </Karta>
            </CzescFormularza>
            <AkcjeKreatoraZ15
              onWstecz={() => czesci.wroc(() => przejdz(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy })))}
              onZapisz={zapisz}
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

