'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { DanePytania } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { przygotujWniosekOOdpis, zlozWniosekOOdpis } from '@/dane/magazyn/operacje/kanaly-zus-usc';
import { useDzis, useKatalog, useKonto, useParametry, useRodzina } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dodajDni } from '@/domena/daty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import type { BledyPol, KodKomunikatu, WniosekOOdpis } from '@/domena/typy';
import {
  CELE_ODPISU,
  DNI_DO_WYDANIA_ODPISU,
  RODZAJE_ODPISU,
  formularzZProfilu,
  komunikatOdbioru,
  komunikatPierwszegoOdpisu,
  oplataSkarbowa,
  opcjeOdbioru,
  pierwszePoleZBledem,
  sposobPoZmianieRodzaju,
  sprawdzWejscieDoOdpisu,
  zrodloPolaDziecka,
  type FormularzOdpisu,
  type PoleDziecka,
  type PoleOdpisu,
  type RodzajOdpisu,
} from '@/domena/wnioski/odpis';
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewBirthCertificateRequest;

const ID_POLA: Record<Exclude<PoleOdpisu, 'rodzajOdpisu' | 'cel' | 'sposobOdbioru'>, string> = {
  imie: 'dziecko-imie',
  nazwisko: 'dziecko-nazwisko',
  dataUrodzenia: 'dziecko-data-urodzenia',
  miejsceUrodzenia: 'dziecko-miejsce-urodzenia',
  pesel: 'dziecko-pesel',
  adresDoDoreczenia: 'adres-do-doreczenia',
};

function formularzZWniosku(w: WniosekOOdpis, profil: FormularzOdpisu): FormularzOdpisu {
  const data = w.daneDziecka?.dataUrodzenia;
  return {
    rodzajOdpisu: w.rodzajOdpisu ?? null,
    imie: w.daneDziecka?.imie ?? profil.imie,
    nazwisko: w.daneDziecka?.nazwisko ?? profil.nazwisko,
    dataUrodzenia: data ? formatujDate(data) : profil.dataUrodzenia,
    miejsceUrodzenia: w.daneDziecka?.miejsceUrodzenia ?? profil.miejsceUrodzenia,
    pesel: w.daneDziecka?.pesel ?? '',
    cel: w.cel ?? null,
    sposobOdbioru: w.sposobOdbioru ?? null,
    adresDoDoreczenia: w.adresDoDoreczenia ?? '',
  };
}

function ustawFokus(pole: PoleOdpisu, f: FormularzOdpisu) {
  let id: string;
  if (pole === 'rodzajOdpisu') id = idOpcjiGrupy('rodzaj-odpisu', f.rodzajOdpisu ?? RODZAJE_ODPISU[0]);
  else if (pole === 'cel') id = idOpcjiGrupy('cel-odpisu', f.cel ?? CELE_ODPISU[0]);
  else if (pole === 'sposobOdbioru') {
    const opcje = opcjeOdbioru(f.rodzajOdpisu ?? 'skrocony');
    id = idOpcjiGrupy('sposob-odbioru', f.sposobOdbioru ?? opcje[0]);
  } else id = ID_POLA[pole];
  document.getElementById(id)?.focus();
}

export function WidokWnioskuOOdpis() {
  const router = useRouter();
  const parametry = useSearchParams();
  const konto = useKonto();
  const rodzina = useRodzina();
  const katalog = useKatalog();
  const parametrySystemu = useParametry();
  const dzis = useDzis();

  const zProfilu = useMemo(() => formularzZProfilu(rodzina?.daneCiazy ?? null), [rodzina?.daneCiazy]);
  const [idWniosku, setIdWniosku] = useState<string | null>(() => {
    const id = parametry.get('wniosek');
    return id && rodzina?.wnioski.some((w) => w.idWniosku === id && w.stan === 'szkic') ? id : null;
  });
  const [f, setF] = useState<FormularzOdpisu>(() => {
    const szkic = rodzina?.wnioski.find(
      (w): w is WniosekOOdpis => w.idWniosku === idWniosku && w.rodzaj === 'odpis-aktu-urodzenia',
    );
    return szkic ? formularzZWniosku(szkic, zProfilu) : zProfilu;
  });
  const [bledy, setBledy] = useState<BledyPol<PoleOdpisu>>({});
  const [bladRejestru, setBladRejestru] = useState<KodKomunikatu | null>(null);
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const [skladanie, setSkladanie] = useState(false);

  const sprawaK36 = rodzina?.plan?.pozycje.find((p) => p.idPozycji === 'K36');
  const adresInstrukcji = trasy.ViewCaseGuide({ idSprawy: sprawaK36?.idSprawy ?? 'K36' });
  const naglowek = (
    <NaglowekStrony tytul={t.naglowek} powrot={{ href: adresInstrukcji, etykieta: t.powrotInstrukcja }} />
  );

  if (konto === null || rodzina === null) {
    return (
      <>
        {naglowek}
        <Karta>
          <p className="m-0 text-body">{t.brakRodziny}</p>
        </Karta>
      </>
    );
  }

  if (sprawdzWejscieDoOdpisu(rodzina.daneCiazy) === '0037') {
    return (
      <>
        {naglowek}
        <Komunikat
          kod="0037"
          akcje={
            <PrzyciskLink href={trasy.ViewBirthDate()} wariant="drugorzedny">
              {t.brakDatyPorodu}
            </PrzyciskLink>
          }
        />
      </>
    );
  }

  const zmien = <K extends keyof FormularzOdpisu>(pole: K, wartosc: FormularzOdpisu[K]) => {
    setF((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  };
  const zmienRodzaj = (rodzaj: RodzajOdpisu) => {
    setF((poprzedni) => ({ ...poprzedni, rodzajOdpisu: rodzaj, sposobOdbioru: sposobPoZmianieRodzaju(rodzaj, poprzedni.sposobOdbioru) }));
  };

  const gmina = rodzina.daneRodziny.gmina?.wartosc ?? null;
  const urzad = gmina
    ? gmina.urzadStanuCywilnegoMiejscownik
      ? t.urzadWMiejscowniku({ miejscownik: gmina.urzadStanuCywilnegoMiejscownik })
      : t.urzadWGminie({ gmina: gmina.nazwa })
    : null;
  const k06 = rodzina.plan?.pozycje.find((p) => p.idPozycji === 'K06');
  const komunikat0197 = komunikatPierwszegoOdpisu(rodzina.plan?.pozycje ?? []);
  const komunikat0198 = komunikatOdbioru(f.rodzajOdpisu);
  const opcjeSposobu = opcjeOdbioru(f.rodzajOdpisu ?? 'skrocony');

  const podpowiedzZrodla = (pole: PoleDziecka) => {
    const zrodlo = zrodloPolaDziecka(pole, f[pole], zProfilu);
    if (zrodlo === 'puste-w-profilu' && f[pole].trim() !== '') {
      return <p className="m-0 text-small text-ink-muted">{t.dziecko.pusteWProfilu}</p>;
    }
    if (zrodlo === 'zmienione') {
      return <p className="m-0 text-small text-ink-muted">{t.dziecko.zmienione({ wartosc: zProfilu[pole] })}</p>;
    }
    return undefined;
  };

  const zloz = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (skladanie) return;
    setBladRejestru(null);
    setBladOgolny(null);
    const ctx = pobierzKontekstOperacji();
    const zapis = przygotujWniosekOOdpis(f, idWniosku, ctx);
    if (!zapis.ok) {
      const bledyPol = (zapis.bledyPol ?? {}) as BledyPol<PoleOdpisu>;
      setBledy(bledyPol);
      const pierwsze = pierwszePoleZBledem(bledyPol);
      if (pierwsze) ustawFokus(pierwsze, f);
      else setBladOgolny(zapis.kod);
      return;
    }
    setBledy({});
    const id = zapis.wartosc.idWniosku;
    if (id !== idWniosku) {
      setIdWniosku(id);
      window.history.replaceState(null, '', trasy.ViewBirthCertificateRequest({ wniosek: id }));
    }
    setSkladanie(true);
    const wynik = await zlozWniosekOOdpis(id, pobierzKontekstOperacji());
    setSkladanie(false);
    if (!wynik.ok) {
      if (wynik.kod === '0146') {
        setBladRejestru('0146');
        document.getElementById(ID_POLA.imie)?.focus();
      } else {
        setBladOgolny(wynik.kod);
        window.scrollTo({ top: 0 });
      }
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0145', dlaWidoku: 'ViewBirthCertificateRequestSent' });
    router.push(trasy.ViewBirthCertificateRequestSent({ wniosek: id }));
  };

  const oplata = f.rodzajOdpisu && f.cel ? oplataSkarbowa(f.rodzajOdpisu, f.cel, dzis, katalog) : null;
  const opisOplaty =
    f.cel === null
      ? null
      : f.cel !== 'inny'
        ? t.cel.opisBezOplaty({ cel: t.cel.wZdaniu[f.cel] })
        : f.rodzajOdpisu
          ? t.cel.opisOplaty[f.rodzajOdpisu]
          : t.cel.wybierzRodzaj;

  return (
    <>
      {naglowek}
      <form noValidate onSubmit={zloz} className="max-w-tresc">
        <Stos odstep={7.5}>
          {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
          {komunikat0197 ? (
            <Komunikat
              kod="0197"
              akcje={
                k06 ? (
                  <p className="m-0">
                    {t.sprawaWPlanie}{' '}
                    <Odnosnik href={trasy.ViewCaseDetails({ idSprawy: k06.idSprawy })} wTekscie>
                      {t.sprawaK06({
                        tytul: tytulSprawy(katalog, k06.idSprawy),
                        status: teksty.wspolne.etykiety.statusySpraw[k06.status].toLocaleLowerCase('pl'),
                      })}
                    </Odnosnik>
                  </p>
                ) : undefined
              }
            />
          ) : null}

          <Karta tytul={t.rodzaj.tytul} bezLinii>
            <GrupaOpcji
              nazwa="rodzaj-odpisu"
              legenda={t.rodzaj.legenda}
              wartosc={f.rodzajOdpisu}
              onZmiana={zmienRodzaj}
              blad={bledy.rodzajOdpisu ?? null}
              opcje={RODZAJE_ODPISU.map((r) => ({ wartosc: r, etykieta: t.rodzaj.opcje[r].etykieta, opis: t.rodzaj.opcje[r].opis }))}
            />
          </Karta>

          <Karta tytul={t.wnioskodawca.tytul} bezLinii>
            <Stos odstep={4}>
              <Notatka>
                <p className="m-0">{t.wnioskodawca.notatka}</p>
              </Notatka>
              <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
              <DanePytania
                wiersze={[
                  { etykieta: t.wnioskodawca.imieINazwisko, wartosc: `${konto.imie} ${konto.nazwisko}` },
                  { etykieta: t.wnioskodawca.pesel, wartosc: konto.pesel },
                  { etykieta: t.wnioskodawca.wnioskujeszJako, wartosc: t.wnioskodawca.rodzicDziecka },
                ]}
              />
            </Stos>
          </Karta>

          <Karta tytul={t.dziecko.tytul} bezLinii>
            <Stos odstep={6}>
              {bladRejestru ? <Komunikat kod={bladRejestru} /> : null}
              <Notatka>
                <p className="m-0">{t.dziecko.notatka}</p>
              </Notatka>
              <PoleTekstowe
                id={ID_POLA.imie}
                etykieta={t.dziecko.imie}
                wartosc={f.imie}
                onZmiana={(w) => zmien('imie', w)}
                blad={bledy.imie ?? null}
                autoComplete="off"
                szerokosc="srednia"
                dodatek={podpowiedzZrodla('imie')}
              />
              <PoleTekstowe
                id={ID_POLA.nazwisko}
                etykieta={t.dziecko.nazwisko}
                wartosc={f.nazwisko}
                onZmiana={(w) => zmien('nazwisko', w)}
                blad={bledy.nazwisko ?? null}
                autoComplete="off"
                szerokosc="srednia"
                dodatek={podpowiedzZrodla('nazwisko')}
              />
              <PoleTekstowe
                id={ID_POLA.dataUrodzenia}
                etykieta={t.dziecko.dataUrodzenia}
                podpowiedz={t.dziecko.podpowiedzDaty}
                wartosc={f.dataUrodzenia}
                onZmiana={(w) => zmien('dataUrodzenia', w)}
                blad={bledy.dataUrodzenia ?? null}
                inputMode="numeric"
                autoComplete="off"
                szerokosc="waska"
                dodatek={podpowiedzZrodla('dataUrodzenia')}
              />
              <PoleTekstowe
                id={ID_POLA.miejsceUrodzenia}
                etykieta={t.dziecko.miejsceUrodzenia}
                podpowiedz={t.dziecko.podpowiedzMiejsca}
                wartosc={f.miejsceUrodzenia}
                onZmiana={(w) => zmien('miejsceUrodzenia', w)}
                blad={bledy.miejsceUrodzenia ?? null}
                autoComplete="off"
                szerokosc="srednia"
                dodatek={podpowiedzZrodla('miejsceUrodzenia')}
              />
              <PoleTekstowe
                id={ID_POLA.pesel}
                etykieta={t.dziecko.pesel}
                podpowiedz={t.dziecko.podpowiedzPesel}
                wartosc={f.pesel}
                onZmiana={(w) => zmien('pesel', w)}
                blad={bledy.pesel ?? null}
                inputMode="numeric"
                autoComplete="off"
                szerokosc="srednia"
                dodatek={podpowiedzZrodla('pesel')}
              />
            </Stos>
          </Karta>

          <Karta tytul={t.cel.tytul} bezLinii>
            <Stos odstep={6}>
              <GrupaOpcji
                nazwa="cel-odpisu"
                legenda={t.cel.legenda}
                podpowiedz={t.cel.podpowiedz}
                wartosc={f.cel}
                onZmiana={(w) => zmien('cel', w)}
                blad={bledy.cel ?? null}
                opcje={CELE_ODPISU.map((c) => ({
                  wartosc: c,
                  etykieta: t.cel.opcje[c],
                  znacznik: c === 'inny' ? t.cel.zOplata : t.cel.bezOplaty,
                }))}
              />
              {f.cel ? (
                <div className="grid gap-2" aria-live="polite">
                  <p className="m-0 text-small">{t.cel.oplata}</p>
                  <p className="m-0 text-amount text-ink-strong">
                    {oplata === null ? t.cel.zOplata : oplata === 0 ? t.cel.bezOplaty : formatujKwote(oplata)}
                  </p>
                  {opisOplaty ? <p className="m-0 text-small">{opisOplaty}</p> : null}
                  {f.cel === 'inny' && parametrySystemu.trybDemonstracyjny ? (
                    <FlagaDemo>{t.cel.flagaOplaty}</FlagaDemo>
                  ) : null}
                </div>
              ) : null}
            </Stos>
          </Karta>

          <Karta tytul={t.odbior.tytul} bezLinii>
            <Stos odstep={6}>
              {komunikat0198 ? <Komunikat kod={komunikat0198} /> : null}
              <GrupaOpcji
                nazwa="sposob-odbioru"
                legenda={t.odbior.legenda}
                wartosc={f.sposobOdbioru}
                onZmiana={(w) => zmien('sposobOdbioru', w)}
                blad={bledy.sposobOdbioru ?? null}
                opcje={opcjeSposobu.map((s) => ({
                  wartosc: s,
                  etykieta: t.odbior.opcje[s].etykieta,
                  opis:
                    s === 'osobiscie' && gmina?.urzadStanuCywilnegoMiejscownik
                      ? t.odbior.opisOsobiscieWMiejscowniku({ miejscownik: gmina.urzadStanuCywilnegoMiejscownik })
                      : t.odbior.opcje[s].opis,
                }))}
              />
              {f.sposobOdbioru === 'poczta' ? (
                <PoleTekstowe
                  id={ID_POLA.adresDoDoreczenia}
                  etykieta={t.odbior.adres}
                  podpowiedz={t.odbior.podpowiedzAdresu}
                  wartosc={f.adresDoDoreczenia}
                  onZmiana={(w) => zmien('adresDoDoreczenia', w)}
                  blad={bledy.adresDoDoreczenia ?? null}
                  autoComplete="street-address"
                />
              ) : null}
            </Stos>
          </Karta>

          <Karta tytul={t.urzad.tytul} bezLinii>
            <Stos odstep={3}>
              {urzad && gmina ? (
                <>
                  <p className="m-0 text-body-strong">{urzad}</p>
                  <p className="m-0 text-body">{t.urzad.gminaZProfilu({ gmina: gmina.nazwa })}</p>
                </>
              ) : (
                <p className="m-0 text-body">{t.urzad.brakGminy}</p>
              )}
              <p className="m-0 text-body">
                {t.urzad.opisZlozenia({ data: formatujDate(dodajDni(dzis, DNI_DO_WYDANIA_ODPISU)) })}
              </p>
              <p className="m-0 text-body">
                {t.urzad.zmianaGminyPrzed}
                <Odnosnik href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wTekscie>
                  {t.urzad.zmianaGminyLink}
                </Odnosnik>
                {t.urzad.zmianaGminyPo}
              </p>
            </Stos>
          </Karta>

          {parametrySystemu.trybDemonstracyjny ? <FlagaDemo>{t.flaga}</FlagaDemo> : null}

          <Wiersz>
            <PrzyciskLink href={adresInstrukcji} wariant="drugorzedny">
              {t.wrocDoInstrukcji}
            </PrzyciskLink>
            <Przycisk type="submit" wariant="glowny" zajety={skladanie}>
              {t.zloz}
            </Przycisk>
          </Wiersz>
        </Stos>
      </form>
    </>
  );
}
