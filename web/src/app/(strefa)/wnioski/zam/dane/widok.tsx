'use client';

// ViewZamData (3.9.1.1.3): dane wnioskodawcy z konta ZUS, dane dziecka z profilu rodziny i rachunek do wypłaty.
// Po porodzie ekran ma część z danymi wnioskodawcy, część z rachunkiem oraz dwie części na każde dziecko (imię, nazwisko
// i data urodzenia, potem PESEL i miejscowość urodzenia). Przed porodem: dane wnioskodawcy, potem informacja o danych dziecka z rachunkiem.
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useDzis, useStanKonta } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import { formatujRachunek } from '@/domena/walidacje';
import type { BledyPol, DaneOsobyWniosku, KodKomunikatu } from '@/domena/typy';
import { MAKS_DLUGOSC_MIEJSCOWOSCI, rachunekDoZapisu, telefonDoZapisu, walidujDaneZam, type PoleDanychZam } from '@/domena/wnioski/zam';
import { ekranPoZam } from '@/domena/wnioski/zam-nawigacja';
import { datyUrodzeniaPrzyjetych } from '@/domena/wnioski/zam-przyjecie';
import { CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import {
  adresPoprzedniegoKrokuZam,
  BrakWnioskuZam,
  DaneBoczne,
  KartaTwojWniosek,
  KomunikatBleduZapisu,
  liczbaDzieciZDanymiZam,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  useKrokiKreatoraZam,
  useWniosekZam,
  usePrzejscieDalej,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../_czesci/kreator';
import { PrzekazanieDanychDziecka } from './_czesci/przekazanie-danych-dziecka';

const t = teksty.ViewZamData;
const tk = teksty.ViewZamLeaveType.kreator;

const ID_RACHUNKU = 'zam-rachunek';
const ID_TELEFONU = 'zam-telefon';

interface PolaDziecka {
  imie: string;
  nazwisko: string;
  pesel: string;
  miejsce: string;
}

interface FormularzDanych {
  dzieci: PolaDziecka[];
  rachunek: string;
  telefon: string;
}

const POLA_DZIECKA: { pole: keyof PolaDziecka; domena: PoleDanychZam }[] = [
  { pole: 'imie', domena: 'imieDziecka' },
  { pole: 'nazwisko', domena: 'nazwiskoDziecka' },
  { pole: 'pesel', domena: 'peselDziecka' },
  { pole: 'miejsce', domena: 'miejsceUrodzenia' },
];

/** Pola dziecka w dwóch częściach: imię i nazwisko (z datą urodzenia do odczytu), potem PESEL i miejscowość urodzenia. */
const CZESCI_DZIECKA: (keyof PolaDziecka)[][] = [
  ['imie', 'nazwisko'],
  ['pesel', 'miejsce'],
];

function idPola(pole: keyof PolaDziecka, i: number) {
  return `zam-dziecko-${i}-${pole}`;
}

const WZOR_POLA_DZIECKA = /^zam-dziecko-(\d+)-(imie|nazwisko|pesel|miejsce)$/;

function wartoscPolaDanych(w: FormularzDanych, pole: string): string {
  if (pole === ID_RACHUNKU) return w.rachunek;
  if (pole === ID_TELEFONU) return w.telefon;
  const dopasowanie = WZOR_POLA_DZIECKA.exec(pole);
  if (!dopasowanie) return '';
  return w.dzieci[Number(dopasowanie[1])]?.[dopasowanie[2] as keyof PolaDziecka] ?? '';
}

/** Błędy rachunku (0039–0041) i danych każdego dziecka (0024–0031) pod identyfikatorami pól. */
function walidujDane(w: FormularzDanych, dataUrodzeniaDziecka: (i: number) => string | undefined, przyjecie = false): BledyPol<string> {
  const bledy: BledyPol<string> = {};
  const bRachunku = walidujDaneZam({
    zDanymiDziecka: false,
    imieDziecka: '',
    nazwiskoDziecka: '',
    peselDziecka: '',
    miejsceUrodzenia: '',
    numerRachunku: w.rachunek,
    numerTelefonu: w.telefon,
  });
  if (bRachunku.numerRachunku) bledy[ID_RACHUNKU] = bRachunku.numerRachunku;
  if (bRachunku.numerTelefonu) bledy[ID_TELEFONU] = bRachunku.numerTelefonu;
  w.dzieci.forEach((d, i) => {
    const b = walidujDaneZam({
      zDanymiDziecka: true,
      imieDziecka: d.imie,
      nazwiskoDziecka: d.nazwisko,
      peselDziecka: d.pesel,
      miejsceUrodzenia: d.miejsce,
      numerRachunku: w.rachunek,
      dataPorodu: dataUrodzeniaDziecka(i),
    });
    for (const { pole, domena } of POLA_DZIECKA) {
      const kod = b[domena];
      // Przyjęte dziecko (3.9.8.1.1): PESEL niezgodny z datą urodzenia z profilu daje 0211, miejsce urodzenia nie jest wymagane.
      if (kod && przyjecie && domena === 'miejsceUrodzenia') continue;
      if (kod) bledy[idPola(pole, i)] = przyjecie && kod === '0027' ? '0211' : kod;
    }
  });
  return bledy;
}

/**
 * Pola każdej części w kolejności na ekranie. Po porodzie: telefon, rachunek, potem dwie części na każde dziecko.
 * Przed porodem: telefon, potem rachunek.
 */
function podzialDanych(liczbaDzieci: number): string[][] {
  if (liczbaDzieci === 0) return [[ID_TELEFONU], [ID_RACHUNKU]];
  const dzieci = Array.from({ length: liczbaDzieci }, (_, i) => CZESCI_DZIECKA.map((pola) => pola.map((p) => idPola(p, i)))).flat();
  return [[ID_TELEFONU], [ID_RACHUNKU], ...dzieci];
}

function FormularzDanych({ dane }: { dane: DaneWnioskuZam }) {
  const router = useRouter();
  const dzis = useDzis();
  const { wniosek, kontekst, okresy } = dane;
  const { przejdzDalej, zajety } = usePrzejscieDalej();
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const kroki = useKrokiKreatoraZam(dane);
  const przyjecie = kontekst.rodzina.daneCiazy?.przyjecie;
  const dataUrodzenia = przyjecie?.dataUrodzeniaDziecka ?? okresy.dataPorodu ?? undefined;
  // 3.9.8.1.2: data urodzenia każdego przyjętego dziecka z profilu rodziny.
  const datyPrzyjetych = przyjecie ? datyUrodzeniaPrzyjetych(przyjecie) : [];
  const dataUrodzeniaDziecka = (i: number) => datyPrzyjetych[i] ?? dataUrodzenia;
  const liczbaDzieci = przyjecie ? Math.max(1, datyPrzyjetych.length) : liczbaDzieciZDanymiZam(okresy);
  const zDanymiDziecka = liczbaDzieci > 0;
  const profilDzieci = kontekst.rodzina.daneCiazy?.dzieci ?? [];
  const brakPeselWProfilu = zDanymiDziecka && Array.from({ length: liczbaDzieci }, (_, i) => profilDzieci[i]?.pesel).some((p) => !p);

  const [dzieci, ustawDzieci] = useState<PolaDziecka[]>(() =>
    Array.from({ length: liczbaDzieci }, (_, i) => {
      const zWniosku = wniosek.daneDzieci[i];
      const zProfilu = profilDzieci[i];
      return {
        imie: zWniosku?.imie ?? zProfilu?.imie ?? '',
        nazwisko: zWniosku?.nazwisko ?? zProfilu?.nazwisko ?? '',
        pesel: zWniosku?.pesel ?? zProfilu?.pesel ?? '',
        miejsce: zWniosku?.miejsceUrodzenia ?? zProfilu?.miejsceUrodzenia ?? '',
      };
    }),
  );
  const [rachunek, ustawRachunek] = useState(wniosek.numerRachunku ? formatujRachunek(wniosek.numerRachunku) : '');
  const [telefon, ustawTelefon] = useState(wniosek.numerTelefonu ?? '');
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  // 3.9.1.1.7: dane wnioskodawcy i płatnika składek z kopii danych konta ZUS.
  const kopiaZus = useStanKonta()?.kopiaDanychZus ?? null;
  const tytulZus = kopiaZus?.tytuly.find((ty) => !ty.do || ty.do >= dzis) ?? kopiaZus?.tytuly[0];
  const adresWnioskodawcy = kopiaZus?.adres;
  const platnikSkladek = tytulZus
    ? tytulZus.rodzaj === 'dzialalnosc'
      ? { nazwa: `${kontekst.konto.imie} ${kontekst.konto.nazwisko}`, nip: tytulZus.platnik.nip, regon: tytulZus.platnik.regon, adres: adresWnioskodawcy }
      : { nazwa: tytulZus.platnik.nazwa, nip: tytulZus.platnik.nip, regon: tytulZus.platnik.regon }
    : undefined;
  const objecieChorobowym =
    tytulZus?.rodzaj === 'dzialalnosc' ? tytulZus.ubezpieczenieChorobowe.rodzaj === 'dobrowolne' : undefined;

  const podzial = podzialDanych(liczbaDzieci);
  const walidacja = useWalidacjaNaBiezaco<string, FormularzDanych>({
    wartosci: { dzieci, rachunek, telefon },
    waliduj: (w) => walidujDane(w, dataUrodzeniaDziecka, przyjecie !== undefined),
    pola: Object.fromEntries(podzial.flat().map((id) => [id, id])),
    wartoscPola: wartoscPolaDanych,
  });
  const czesci = useCzesciFormularza({ liczba: podzial.length, podzial, walidacja });

  const zmienDziecko = (i: number, pole: keyof PolaDziecka, wartosc: string) => {
    ustawDzieci((poprzednie) => poprzednie.map((d, j) => (j === i ? { ...d, [pole]: wartosc } : d)));
  };

  const daneDzieci = (): DaneOsobyWniosku[] =>
    dzieci.map((d, i) => ({
      imie: d.imie.trim(),
      nazwisko: d.nazwisko.trim(),
      pesel: d.pesel.trim() || undefined,
      dataUrodzenia: dataUrodzeniaDziecka(i),
      miejsceUrodzenia: d.miejsce.trim() || undefined,
    }));

  const dalej = () => {
    ustawBladZapisu(
      przejdzDalej(
        wniosek,
        {
          daneDzieci: daneDzieci(),
          numerRachunku: rachunekDoZapisu(rachunek) || undefined,
          numerTelefonu: telefonDoZapisu(telefon),
          ...(platnikSkladek ? { platnikSkladek } : {}),
          ...(objecieChorobowym !== undefined ? { objecieChorobowym } : {}),
        },
        ekranPoZam(wniosek, 'ViewZamData', okresy.przedPorodem),
      ),
    );
  };

  const zapisz = () => {
    const czystyRachunek = rachunekDoZapisu(rachunek);
    ustawBladZapisu(
      zapiszDoDokonczenia(
        wniosek,
        {
          daneDzieci: zDanymiDziecka ? daneDzieci() : wniosek.daneDzieci,
          numerRachunku: czystyRachunek || undefined,
          numerTelefonu: telefonDoZapisu(telefon),
        },
        'ViewZamData',
      ),
    );
  };

  const wstecz = () => router.push(adresPoprzedniegoKrokuZam(kroki, 'ViewZamData', wniosek.idWniosku, 'ViewZamPeriod'));

  const rodzic = wniosek.daneRodzica;
  const boczna = (
    <>
      <KartaTwojWniosek dane={dane} pokazOkres zmien={{ ekran: 'ViewZamPeriod', etykieta: tk.twojWniosek.zmienOkres }} />
      {brakPeselWProfilu ? (
        <Karta tytul={t.brakPesel.tytul} bezLinii>
          <p className="m-0">{t.brakPesel.tresc}</p>
        </Karta>
      ) : null}
    </>
  );

  const kartaWnioskodawcy = (
    <Karta tytul={t.wnioskodawca.tytul} bezLinii>
      <p className="m-0">{t.wnioskodawca.wstep}</p>
      <p className="m-0 mt-1 mb-4 text-small text-ink-muted">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
      <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
        <div>
          <dt className="text-body-strong">{t.wnioskodawca.imieINazwisko}</dt>
          <dd className="m-0">{rodzic ? `${rodzic.imie} ${rodzic.nazwisko}` : `${kontekst.konto.imie} ${kontekst.konto.nazwisko}`}</dd>
        </div>
        <div>
          <dt className="text-body-strong">{t.wnioskodawca.pesel}</dt>
          <dd className="m-0">{rodzic?.pesel ?? kontekst.konto.pesel}</dd>
        </div>
        {adresWnioskodawcy ? (
          <div>
            <dt className="text-body-strong">{t.wnioskodawca.adres}</dt>
            <dd className="m-0">{adresWnioskodawcy}</dd>
          </div>
        ) : null}
        {objecieChorobowym ? (
          <div className="sm:col-span-3">
            <dt className="text-body-strong">{t.wnioskodawca.chorobowe}</dt>
            <dd className="m-0">{t.wnioskodawca.chorobowePodlegam}</dd>
          </div>
        ) : null}
      </dl>
      {platnikSkladek ? (
        <div className="mt-4">
          <h3 className="m-0 mb-2 text-body-strong">{t.platnikSkladek.tytul}</h3>
          <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="text-body-strong">{t.platnikSkladek.nazwa}</dt>
              <dd className="m-0">{platnikSkladek.nazwa}</dd>
            </div>
            <div>
              <dt className="text-body-strong">{t.platnikSkladek.nip}</dt>
              <dd className="m-0">{platnikSkladek.nip}</dd>
            </div>
            <div>
              <dt className="text-body-strong">{t.platnikSkladek.regon}</dt>
              <dd className="m-0">{platnikSkladek.regon}</dd>
            </div>
          </dl>
        </div>
      ) : null}
      <div className="mt-4">
        <PoleTekstowe
          id={ID_TELEFONU}
          etykieta={t.wnioskodawca.telefon}
          podpowiedz={t.wnioskodawca.telefonPodpowiedz}
          wartosc={telefon}
          onZmiana={ustawTelefon}
          {...walidacja.pole(ID_TELEFONU)}
          inputMode="tel"
          maksDlugosc={16}
          autoComplete="tel"
          szerokosc="srednia"
        />
      </div>
    </Karta>
  );

  const kartaRachunku = (
    <Karta tytul={t.rachunek.tytul} bezLinii>
      <PoleTekstowe
        id={ID_RACHUNKU}
        etykieta={t.rachunek.numer}
        podpowiedz={t.rachunek.podpowiedz}
        wartosc={rachunek}
        onZmiana={ustawRachunek}
        {...walidacja.pole(ID_RACHUNKU)}
        inputMode="numeric"
        maksDlugosc={40}
        autoComplete="off"
      />
      {wniosek.adresat !== 'platnik-skladek' && rachunekDoZapisu(rachunek) === '' && adresWnioskodawcy ? (
        <div className="mt-6">
          <Komunikat kod="0241" parametry={{ adres: adresWnioskodawcy }} />
        </div>
      ) : null}
    </Karta>
  );

  const tytulDziecka = (i: number) => (liczbaDzieci > 1 ? t.dziecko.tytulNumer({ numer: i + 1 }) : t.dziecko.tytul);

  const czesciDzieci: ReactNode[] = dzieci.flatMap((d, i) => [
    <CzescFormularza key={`${i}-imie`} czesci={czesci} numer={3 + 2 * i}>
      <Karta tytul={tytulDziecka(i)} bezLinii>
        <div className="flex flex-col gap-6">
          {i === 0 ? <p className="m-0">{t.dziecko.wstep}</p> : null}
          <PoleTekstowe
            id={idPola('imie', i)}
            etykieta={t.dziecko.imie}
            wartosc={d.imie}
            onZmiana={(w) => zmienDziecko(i, 'imie', w)}
            {...walidacja.pole(idPola('imie', i))}
            maksDlugosc={40}
            autoComplete="off"
            szerokosc="srednia"
          />
          <PoleTekstowe
            id={idPola('nazwisko', i)}
            etykieta={t.dziecko.nazwisko}
            wartosc={d.nazwisko}
            onZmiana={(w) => zmienDziecko(i, 'nazwisko', w)}
            {...walidacja.pole(idPola('nazwisko', i))}
            maksDlugosc={60}
            autoComplete="off"
            szerokosc="srednia"
          />
          <DaneBoczne
            pozycje={[
              {
                etykieta: t.dziecko.dataUrodzenia,
                wartosc: dataUrodzeniaDziecka(i) ? t.dziecko.dataUrodzeniaWartosc({ data: formatujDate(dataUrodzeniaDziecka(i) ?? '') }) : '',
              },
            ]}
          />
        </div>
      </Karta>
    </CzescFormularza>,
    <CzescFormularza key={`${i}-pesel`} czesci={czesci} numer={4 + 2 * i}>
      <Karta tytul={tytulDziecka(i)} bezLinii>
        <div className="flex flex-col gap-6">
          {i === 0 && brakPeselWProfilu ? (
            <Komunikat
              kod="0062"
              akcje={
                <Przycisk type="button" wariant="tlo" ikona="zapisz" onClick={zapisz} disabled={zajety}>
                  {tk.przyciski.zapiszDoDokonczenia}
                </Przycisk>
              }
            />
          ) : null}
          <PoleTekstowe
            id={idPola('pesel', i)}
            etykieta={t.dziecko.pesel}
            wartosc={d.pesel}
            onZmiana={(w) => zmienDziecko(i, 'pesel', w)}
            {...walidacja.pole(idPola('pesel', i))}
            inputMode="numeric"
            maksDlugosc={11}
            autoComplete="off"
            szerokosc="srednia"
          />
          <PoleTekstowe
            id={idPola('miejsce', i)}
            etykieta={t.dziecko.miejsceUrodzenia}
            wartosc={d.miejsce}
            onZmiana={(w) => zmienDziecko(i, 'miejsce', w)}
            {...walidacja.pole(idPola('miejsce', i))}
            maksDlugosc={MAKS_DLUGOSC_MIEJSCOWOSCI}
            autoComplete="off"
            szerokosc="srednia"
          />
        </div>
      </Karta>
    </CzescFormularza>,
  ]);

  return (
    <RamaKreatoraZam
      ekran="ViewZamData"
      wniosek={wniosek}
      kroki={kroki}
      czesc={czesci.czesc}
      komunikaty={<KomunikatBleduZapisu kod={bladZapisu} />}
      boczna={boczna}
    >
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          czesci.dalej(dalej);
        }}
      >
        {zDanymiDziecka ? (
          <>
            <CzescFormularza czesci={czesci} numer={1}>
              {kartaWnioskodawcy}
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={2}>
              {kartaRachunku}
            </CzescFormularza>
            {czesciDzieci}
          </>
        ) : (
          <>
            <CzescFormularza czesci={czesci} numer={1}>
              {kartaWnioskodawcy}
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={2}>
              <Karta tytul={t.dziecko.tytul} bezLinii>
                <p className="m-0">{t.dziecko.przedPorodem}</p>
              </Karta>
              {kartaRachunku}
            </CzescFormularza>
          </>
        )}
        <PrzyciskiKreatora onWstecz={() => czesci.wroc(wstecz)} onZapisz={zapisz} onDalej={() => undefined} zajety={zajety} />
      </form>
    </RamaKreatoraZam>
  );
}

export function WidokDanychZam() {
  const { dane } = useWniosekZam();
  const tryb = useSearchParams().get('tryb');
  if (dane === null) return <BrakWnioskuZam ekran="ViewZamData" />;
  if (tryb === 'przekazanie-danych-dziecka' && dane.wniosek.stan !== 'szkic') {
    return <PrzekazanieDanychDziecka key={dane.wniosek.idWniosku} dane={dane} />;
  }
  return <FormularzDanych key={dane.wniosek.idWniosku} dane={dane} />;
}
