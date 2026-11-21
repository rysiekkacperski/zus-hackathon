'use client';

// ViewBirthDetails (3.3.2.1.2, 3.3.2.1.3): dane dziecka po porodzie i zaświadczenie „Za życiem”.
// Tryb pakietu (/narodziny/dane-dziecka) prowadzi do ViewBirthPackage, tryb zmiany
// (/profil-rodziny/dane-dziecka) wraca do profilu rodziny. Wzory: cz1/P10-09, P10-10, P10-11, P10-17.
// Formularz ma trzy części w ?czesc=N, żeby każda mieściła się w oknie: dane porodu, pobyt dziecka w szpitalu
// i zdrowie dziecka. Zapis następuje na ostatniej części.
import { useState, type FormEvent } from 'react';
import { useKatalog, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszDaneDziecka } from '@/dane/magazyn/operacje/narodziny';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import { czyMaZgode } from '@/domena/konto';
import {
  walidujDaneDziecka,
  wyznaczWymiarUrlopuRodzicielskiego,
  type FormularzDanychDziecka as Formularz,
  type PoleDanychDziecka,
} from '@/domena/rodzina/narodziny';
import type { BledyPol, DaneCiazyIDziecka, KodKomunikatu } from '@/domena/typy';
import { CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji, type PozycjaListyDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const t = teksty.ViewBirthDetails;

const ID_POL: Record<PoleDanychDziecka, string> = {
  tydzienCiazy: 'tydzien-ciazy',
  masaUrodzeniowa: 'masa-urodzeniowa',
  dniHospitalizacji: 'dni-hospitalizacji',
};

/** Pola każdej części formularza: 1 dane porodu, 2 pobyt dziecka w szpitalu, 3 zdrowie dziecka (bez pól wymaganych). */
const PODZIAL: readonly (readonly PoleDanychDziecka[])[] = [['tydzienCiazy', 'masaUrodzeniowa'], ['dniHospitalizacji'], []];

function powrotTrybu(tryb: TrybWidoku<'ViewBirthDetails'>) {
  return tryb === 'zmiana'
    ? { href: sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' }), etykieta: t.powrotDoProfilu }
    : { href: sciezkaWidoku('ViewFamilyPlan'), etykieta: t.powrotDoPlanu };
}

export function WidokDanychDziecka({ tryb }: { tryb: TrybWidoku<'ViewBirthDetails'> }) {
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const daneCiazy = rodzina?.daneCiazy ?? null;
  const zgoda = stanKonta !== null && czyMaZgode(stanKonta.konto.decyzjeOZgodzie);
  const tytul = t.tytulyTrybow[tryb];
  const powrot = powrotTrybu(tryb);

  if (!zgoda) {
    return (
      <>
        <NaglowekStrony tytul={tytul} powrot={powrot} />
        <Komunikat kod="0004" />
      </>
    );
  }
  if (daneCiazy === null || !daneCiazy.dataPoroduPotwierdzona || daneCiazy.dataPorodu === undefined) {
    return (
      <>
        <NaglowekStrony tytul={tytul} powrot={powrot} />
        <StanPusty
          ikona="plan"
          akcja={
            <PrzyciskLink wariant="glowny" href={sciezkaWidoku('ViewBirthDate', { tryb: 'pakiet' })}>
              {t.zglosNarodziny}
            </PrzyciskLink>
          }
        >
          {t.brakDaty}
        </StanPusty>
      </>
    );
  }
  return <FormularzDanychDziecka tryb={tryb} daneCiazy={daneCiazy} dataPorodu={daneCiazy.dataPorodu} />;
}

interface PropsFormularza {
  tryb: TrybWidoku<'ViewBirthDetails'>;
  daneCiazy: DaneCiazyIDziecka;
  dataPorodu: string;
}

function FormularzDanychDziecka({ tryb, daneCiazy, dataPorodu }: PropsFormularza) {
  const katalog = useKatalog();
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const zmiana = tryb === 'zmiana';
  const powrot = powrotTrybu(tryb);
  const liczbaDzieci = daneCiazy.liczbaUrodzonychDzieci ?? 1;

  const [tydzien, setTydzien] = useState(() => daneCiazy.tydzienCiazyWDniuPorodu?.toString() ?? '');
  const [masa, setMasa] = useState(() => daneCiazy.masaUrodzeniowaG?.toString() ?? '');
  const [dni, setDni] = useState(() => (daneCiazy.dniHospitalizacji5do28 ?? 0).toString());
  const [ciezka, setCiezka] = useState(() => daneCiazy.ciezkaChorobaDziecka === true);
  const [zaZyciem, setZaZyciem] = useState(() => daneCiazy.zaswiadczenieZaZyciem === true);
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);

  const formularz: Formularz = {
    tydzienCiazy: tydzien,
    masaUrodzeniowa: masa,
    dniHospitalizacji: dni,
    ciezkaChoroba: ciezka,
    zaswiadczenieZaZyciem: zaZyciem,
    tryb,
  };
  // Błąd pola pokazuje się po opuszczeniu pola, a po próbie przejścia dalej przy każdej zmianie.
  const walidacja = useWalidacjaNaBiezaco({ wartosci: formularz, waliduj: walidujDaneDziecka, pola: ID_POL });
  const czesci = useCzesciFormularza({ liczba: PODZIAL.length, podzial: PODZIAL, walidacja });

  const wymiar = wyznaczWymiarUrlopuRodzicielskiego(liczbaDzieci, zaZyciem, dataPorodu, katalog);
  const opisWymiaru = !zaZyciem && zmiana && daneCiazy.zaswiadczenieZaZyciem ? t.opisWymiaruPoOdznaczeniu : t.opisWymiaru;

  function zmienZaZyciem(z: boolean) {
    setZaZyciem(z);
    if (z) setCiezka(true);
  }

  function pokazBledyZapisu(bledy: BledyPol<PoleDanychDziecka>) {
    walidacja.pokazBledy(bledy);
    const numer = PODZIAL.findIndex((pola) => pola.some((pole) => bledy[pole] !== undefined)) + 1;
    if (numer > 0 && numer !== czesci.czesc) czesci.przejdzDo(numer, { bezFokusu: true });
  }

  function zapiszIPrzejdz() {
    ustawZajety(true);
    const wynik = zapiszDaneDziecka(formularz, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      if (wynik.bledyPol) {
        setBladZapisu(null);
        pokazBledyZapisu(wynik.bledyPol as BledyPol<PoleDanychDziecka>);
      } else {
        setBladZapisu(wynik.kod);
      }
      return;
    }
    przejdz(zmiana ? sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' }) : sciezkaWidoku('ViewBirthPackage'));
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    czesci.dalej(zapiszIPrzejdz);
  }

  const imiona = daneCiazy.dzieci
    .map((d) => [d.imie, d.nazwisko].filter(Boolean).join(' '))
    .filter((n) => n !== '')
    .join(', ');
  const porod: PozycjaListyDefinicji[] = [
    ...(zmiana && imiona !== '' ? [{ etykieta: t.dziecko, wartosc: imiona }] : []),
    { etykieta: t.dataPorodu, wartosc: formatujDate(dataPorodu) },
    { etykieta: t.liczbaDzieci, wartosc: String(liczbaDzieci) },
  ];

  return (
    <>
      <NaglowekStrony tytul={t.tytulyTrybow[tryb]} powrot={powrot} />
      <Stos odstep={6}>
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        <form noValidate onSubmit={wyslij}>
          <Stos odstep={6}>
            <CzescFormularza czesci={czesci} numer={1}>
              <Karta tytul={t.kartaPorod}>
                <Stos odstep={6}>
                  <ListaDefinicji pozycje={porod} />
                  <p className="m-0 text-body">{t.wstepPorod}</p>
                  <PoleTekstowe
                    id={ID_POL.tydzienCiazy}
                    nazwa="tydzienCiazy"
                    etykieta={t.poleTygodnia.etykieta}
                    podpowiedz={t.poleTygodnia.podpowiedz}
                    inputMode="numeric"
                    szerokosc="waska"
                    wartosc={tydzien}
                    onZmiana={setTydzien}
                    {...walidacja.pole('tydzienCiazy')}
                    wymagane
                  />
                  <PoleTekstowe
                    id={ID_POL.masaUrodzeniowa}
                    nazwa="masaUrodzeniowa"
                    etykieta={t.poleMasy.etykieta}
                    podpowiedz={t.poleMasy.podpowiedz}
                    inputMode="numeric"
                    szerokosc="waska"
                    wartosc={masa}
                    onZmiana={setMasa}
                    {...walidacja.pole('masaUrodzeniowa')}
                    wymagane
                  />
                </Stos>
              </Karta>
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={2}>
              <Karta tytul={t.kartaHospitalizacja}>
                <Stos odstep={6}>
                  <p className="m-0 text-body">{t.wstepPorod}</p>
                  <PoleTekstowe
                    id={ID_POL.dniHospitalizacji}
                    nazwa="dniHospitalizacji"
                    etykieta={t.poleDni.etykieta}
                    podpowiedz={zmiana ? t.poleDni.podpowiedzZmiana : t.poleDni.podpowiedz}
                    inputMode="numeric"
                    szerokosc="waska"
                    wartosc={dni}
                    onZmiana={setDni}
                    {...walidacja.pole('dniHospitalizacji')}
                    wymagane
                  />
                </Stos>
              </Karta>
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={3}>
              <Karta tytul={t.kartaZdrowie}>
                <Stos odstep={6}>
                  <p className="m-0 text-body">{t.wstepZdrowie}</p>
                  <PoleZaznaczenia
                    id="ciezka-choroba"
                    nazwa="ciezkaChoroba"
                    etykieta={t.ciezkaChoroba.etykieta}
                    opis={zaZyciem ? t.ciezkaChoroba.opisZaZyciem : t.ciezkaChoroba.opis}
                    zaznaczone={ciezka}
                    onZmiana={setCiezka}
                  />
                  <Stos odstep={3}>
                    <PoleZaznaczenia
                      id="zaswiadczenie-za-zyciem"
                      nazwa="zaswiadczenieZaZyciem"
                      etykieta={t.zaZyciem.etykieta}
                      opis={t.zaZyciem.opis}
                      zaznaczone={zaZyciem}
                      onZmiana={zmienZaZyciem}
                    />
                    <div role="status" className="flex flex-col gap-1 rounded-sm bg-brand-wash px-5 py-4">
                      <p className="m-0 text-body-strong">{t.wymiarRodzicielskiego({ tygodnie: String(wymiar) })}</p>
                      <p className="m-0 text-body">{opisWymiaru}</p>
                    </div>
                  </Stos>
                  <Notatka>
                    <p>
                      {t.notkaZgody.przed}
                      <Odnosnik href={sciezkaWidoku('ViewGuideSettings')} wTekscie>
                        {t.notkaZgody.link}
                      </Odnosnik>
                      {t.notkaZgody.po}
                    </p>
                  </Notatka>
                </Stos>
              </Karta>
            </CzescFormularza>
            <Wiersz odstep={4} className="flex-wrap">
              <Przycisk wariant="glowny" type="submit" zajety={zajety}>
                {czesci.czyOstatnia ? (zmiana ? t.zapiszZmiany : t.zapisz) : teksty.wspolne.przyciski.dalej}
              </Przycisk>
              {czesci.czyPierwsza ? null : (
                <Przycisk wariant="drugorzedny" disabled={zajety} onClick={() => czesci.wroc()}>
                  {teksty.wspolne.przyciski.wroc}
                </Przycisk>
              )}
              {zmiana ? (
                <PrzyciskLink wariant="drugorzedny" href={powrot.href}>
                  {t.anuluj}
                </PrzyciskLink>
              ) : null}
            </Wiersz>
          </Stos>
        </form>
      </Stos>
    </>
  );
}
