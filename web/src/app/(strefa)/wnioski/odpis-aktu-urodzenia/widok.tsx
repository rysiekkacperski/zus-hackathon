'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { DanePytania } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { przygotujWniosekOOdpis, zlozWniosekOOdpis } from '@/dane/magazyn/operacje/kanaly-zus-usc';
import { useDzis, useKatalog, useKonto, useRodzina } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dodajDni } from '@/domena/daty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import type { BledyPol, KodKomunikatu, WniosekOOdpis } from '@/domena/typy';
import {
  CELE_ODPISU,
  DNI_DO_WYDANIA_ODPISU,
  KOLEJNOSC_POL_ODPISU,
  RODZAJE_ODPISU,
  formularzZProfilu,
  komunikatOdbioru,
  komunikatPierwszegoOdpisu,
  oplataSkarbowa,
  opcjeOdbioru,
  sposobPoZmianieRodzaju,
  sprawdzWejscieDoOdpisu,
  walidujWniosekOOdpis,
  zrodloPolaDziecka,
  type FormularzOdpisu,
  type PoleDziecka,
  type PoleOdpisu,
  type RodzajOdpisu,
} from '@/domena/wnioski/odpis';
import { adresCzesci, CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { PostepKreatora } from '@/komponenty/kroki';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
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

// Cel fokusu pól w kolejności na ekranie: grupy wyboru przez nazwę grupy radio, pozostałe przez id pola.
const CELE_FOKUSU: Record<PoleOdpisu, string> = {
  rodzajOdpisu: 'rodzaj-odpisu',
  ...ID_POLA,
  cel: 'cel-odpisu',
  sposobOdbioru: 'sposob-odbioru',
};

// Części formularza (każda mieści się w oknie bez przewijania): rodzaj, dane dziecka, urodzenie dziecka, cel,
// sposób odbioru, wnioskodawca i urząd z przyciskiem złożenia.
const CZESCI_ODPISU = ['rodzaj', 'dziecko', 'urodzenie', 'cel', 'odbior', 'wnioskodawca'] as const;
type CzescOdpisu = (typeof CZESCI_ODPISU)[number];
const POLA_CZESCI: Record<CzescOdpisu, readonly PoleOdpisu[]> = {
  rodzaj: ['rodzajOdpisu'],
  dziecko: ['imie', 'nazwisko'],
  urodzenie: ['dataUrodzenia', 'miejsceUrodzenia', 'pesel'],
  cel: ['cel'],
  odbior: ['sposobOdbioru', 'adresDoDoreczenia'],
  wnioskodawca: [],
};
const PODZIAL_ODPISU = CZESCI_ODPISU.map((c) => POLA_CZESCI[c]);
const NUMER_CZESCI_DZIECKA = CZESCI_ODPISU.indexOf('dziecko') + 1;

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

export function WidokWnioskuOOdpis() {
  const parametry = useSearchParams();
  const konto = useKonto();
  const rodzina = useRodzina();
  const katalog = useKatalog();
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
  const [bladRejestru, setBladRejestru] = useState<KodKomunikatu | null>(null);
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const { zajety: skladanie, ustawZajety: ustawSkladanie, przejdz } = useNawigacjaZLadowaniem();

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: f,
    waliduj: (w: FormularzOdpisu) => walidujWniosekOOdpis(w, dzis),
    pola: CELE_FOKUSU,
  });
  const czesci = useCzesciFormularza<PoleOdpisu>({
    liczba: CZESCI_ODPISU.length,
    podzial: PODZIAL_ODPISU,
    walidacja,
  });
  const czesc = CZESCI_ODPISU[czesci.czesc - 1];

  // Akt nieznaleziony w rejestrze (0146): fokus na imieniu dziecka po przejściu do części z danymi dziecka.
  const fokusNaImieniu = useRef(false);
  useEffect(() => {
    if (!fokusNaImieniu.current || czesc !== 'dziecko') return;
    fokusNaImieniu.current = false;
    document.getElementById(ID_POLA.imie)?.focus();
  });

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

  // Błędy pól z operacji: przejście do części pierwszego pola z błędem i fokus na tym polu.
  const pokazBledyPol = (bledyPol: BledyPol<PoleOdpisu>) => {
    const pierwsze = KOLEJNOSC_POL_ODPISU.find((p) => bledyPol[p] !== undefined);
    if (pierwsze === undefined) return false;
    const numer = PODZIAL_ODPISU.findIndex((pola) => pola.includes(pierwsze)) + 1;
    if (numer > 0) czesci.przejdzDo(numer, { bezFokusu: true });
    walidacja.pokazBledy(bledyPol);
    return true;
  };

  const zloz = async () => {
    if (skladanie) return;
    setBladRejestru(null);
    setBladOgolny(null);
    const ctx = pobierzKontekstOperacji();
    const zapis = przygotujWniosekOOdpis(f, idWniosku, ctx);
    if (!zapis.ok) {
      if (!pokazBledyPol((zapis.bledyPol ?? {}) as BledyPol<PoleOdpisu>)) setBladOgolny(zapis.kod);
      return;
    }
    const id = zapis.wartosc.idWniosku;
    if (id !== idWniosku) {
      setIdWniosku(id);
      window.history.replaceState(
        window.history.state,
        '',
        adresCzesci(trasy.ViewBirthCertificateRequest({ wniosek: id }), czesci.czesc),
      );
    }
    ustawSkladanie(true);
    const wynik = await zlozWniosekOOdpis(id, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawSkladanie(false);
      if (wynik.kod === '0146') {
        setBladRejestru('0146');
        fokusNaImieniu.current = true;
        czesci.przejdzDo(NUMER_CZESCI_DZIECKA, { bezFokusu: true });
      } else {
        setBladOgolny(wynik.kod);
        window.scrollTo({ top: 0 });
      }
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0145', dlaWidoku: 'ViewBirthCertificateRequestSent' });
    przejdz(trasy.ViewBirthCertificateRequestSent({ wniosek: id }));
  };

  // Enter w polu i przycisk główny: przejście do następnej części albo złożenie wniosku na ostatniej części.
  const wyslij = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (skladanie) return;
    czesci.dalej(() => void zloz());
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
      <form noValidate onSubmit={wyslij} className="max-w-tresc">
        <Stos odstep={7.5}>
          <PostepKreatora
            id="postep-odpisu"
            krok={czesci.czesc}
            liczbaKrokow={czesci.liczba}
            nazwaKroku={t.czesci[czesc]}
          />
          {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}

          <CzescFormularza czesci={czesci} numer={1}>
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
                {...walidacja.pole('rodzajOdpisu')}
                opcje={RODZAJE_ODPISU.map((r) => ({ wartosc: r, etykieta: t.rodzaj.opcje[r].etykieta, opis: t.rodzaj.opcje[r].opis }))}
              />
            </Karta>
          </CzescFormularza>

          <CzescFormularza czesci={czesci} numer={2}>
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
                  {...walidacja.pole('imie')}
                  autoComplete="off"
                  szerokosc="srednia"
                  dodatek={podpowiedzZrodla('imie')}
                />
                <PoleTekstowe
                  id={ID_POLA.nazwisko}
                  etykieta={t.dziecko.nazwisko}
                  wartosc={f.nazwisko}
                  onZmiana={(w) => zmien('nazwisko', w)}
                  {...walidacja.pole('nazwisko')}
                  autoComplete="off"
                  szerokosc="srednia"
                  dodatek={podpowiedzZrodla('nazwisko')}
                />
              </Stos>
            </Karta>
          </CzescFormularza>

          <CzescFormularza czesci={czesci} numer={3}>
            <Karta tytul={t.tytulUrodzenia} bezLinii>
              <Stos odstep={6}>
                <PoleTekstowe
                  id={ID_POLA.dataUrodzenia}
                  etykieta={t.dziecko.dataUrodzenia}
                  podpowiedz={t.dziecko.podpowiedzDaty}
                  wartosc={f.dataUrodzenia}
                  onZmiana={(w) => zmien('dataUrodzenia', w)}
                  {...walidacja.pole('dataUrodzenia')}
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
                  {...walidacja.pole('miejsceUrodzenia')}
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
                  {...walidacja.pole('pesel')}
                  inputMode="numeric"
                  autoComplete="off"
                  szerokosc="srednia"
                  dodatek={podpowiedzZrodla('pesel')}
                />
              </Stos>
            </Karta>
          </CzescFormularza>

          <CzescFormularza czesci={czesci} numer={4}>
            <Karta tytul={t.cel.tytul} bezLinii>
              <Stos odstep={6}>
                <GrupaOpcji
                  nazwa="cel-odpisu"
                  legenda={t.cel.legenda}
                  podpowiedz={t.cel.podpowiedz}
                  wartosc={f.cel}
                  onZmiana={(w) => zmien('cel', w)}
                  {...walidacja.pole('cel')}
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
                  </div>
                ) : null}
              </Stos>
            </Karta>
          </CzescFormularza>

          <CzescFormularza czesci={czesci} numer={5}>
            <Karta tytul={t.odbior.tytul} bezLinii>
              <Stos odstep={6}>
                {komunikat0198 ? <Komunikat kod={komunikat0198} /> : null}
                <GrupaOpcji
                  nazwa="sposob-odbioru"
                  legenda={t.odbior.legenda}
                  wartosc={f.sposobOdbioru}
                  onZmiana={(w) => zmien('sposobOdbioru', w)}
                  {...walidacja.pole('sposobOdbioru')}
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
                    {...walidacja.pole('adresDoDoreczenia')}
                    autoComplete="street-address"
                  />
                ) : null}
              </Stos>
            </Karta>
          </CzescFormularza>

          <CzescFormularza czesci={czesci} numer={6}>
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
          </CzescFormularza>

          <Wiersz>
            {czesci.czyPierwsza ? (
              <PrzyciskLink href={adresInstrukcji} wariant="drugorzedny">
                {t.wrocDoInstrukcji}
              </PrzyciskLink>
            ) : (
              <Przycisk wariant="drugorzedny" disabled={skladanie} onClick={() => czesci.wroc()}>
                {teksty.wspolne.przyciski.wroc}
              </Przycisk>
            )}
            <Przycisk type="submit" wariant="glowny" zajety={czesci.czyOstatnia && skladanie}>
              {czesci.czyOstatnia ? t.zloz : teksty.wspolne.przyciski.dalej}
            </Przycisk>
          </Wiersz>
        </Stos>
      </form>
    </>
  );
}
