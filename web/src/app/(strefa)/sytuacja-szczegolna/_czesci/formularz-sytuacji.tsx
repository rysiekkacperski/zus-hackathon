'use client';

// Formularz zgłoszenia sytuacji szczególnej (wzory P22-02, P22-08, P22-09, P22-10): karta „Co się wydarzyło”,
// karta „Kiedy” z datą zdarzenia i liczbą dzieci, akcje Wróć i Przejdź dalej. Po poprawnej walidacji
// przekazuje zgłoszenie do arkusza SheetSpecialSituationConfirm.
// Formularz pierwszej sytuacji pokazuje karty jako dwie części (`czesci` z widoku), a formularz w akordeonie
// „Zapisz kolejną sytuację” pokazuje obie sekcje razem.
import type { ReactNode } from 'react';
import type { CzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import type { WalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { formatujDate } from '@/domena/daty';
import {
  czyBrakZgodyMatki,
  czyDotyczyDziecka,
  czyPoleLiczbyDzieci,
  czyStrataCiazy,
  czyWymagaDatyPorodu,
  dataZdarzeniaZProfilu,
  liczbaDzieciZCiazy,
  proponowanaDataZdarzenia,
  zgloszenieZFormularza,
  type FormularzSytuacji as Formularz,
  type PoleSytuacji,
  type ZgloszenieSytuacji,
} from '@/domena/rodzina/sytuacje';
import type { DaneCiazyIDziecka, DataISO, RodzajSytuacjiSzczegolnej } from '@/domena/typy';
import { teksty } from '@/teksty';
import { NAZWA_POLA_RODZAJU, PoleRodzaju } from './pole-rodzaju';

const t = teksty.ViewSpecialSituation;
const ID_DATY = 'sytuacja-data';
const ID_LICZBY = 'sytuacja-liczba';

/** Kolejność pól na ekranie i cel fokusu po nieudanej próbie przejścia dalej (rodzaj: nazwa grupy radio). */
export const POLA_SYTUACJI: Record<PoleSytuacji, string> = {
  rodzaj: NAZWA_POLA_RODZAJU,
  dataZdarzenia: ID_DATY,
  liczbaDzieci: ID_LICZBY,
};

interface FormularzSytuacjiProps {
  daneCiazy: DaneCiazyIDziecka | null;
  dzis: DataISO;
  /** Formularz w akordeonie „Zapisz kolejną sytuację” nie ma akcji Wróć i pokazuje obie sekcje razem. */
  wAkordeonie?: boolean;
  /** Formularz po zamknięciu arkusza zachowuje wpisane wartości. */
  formularz: Formularz;
  onZmianaFormularza: (f: Formularz) => void;
  walidacja: WalidacjaNaBiezaco<PoleSytuacji>;
  czesci: CzesciFormularza;
  onDalej: (zgloszenie: ZgloszenieSytuacji) => void;
  /** Konto ojca bez zgody konta matki na dane dotyczące zdrowia (komunikat 0277 przy rodzajach zdrowia matki). */
  brakZgodyMatki?: boolean;
}

function Sekcja({ tytul, wAkordeonie, children }: { tytul: string; wAkordeonie: boolean; children: ReactNode }) {
  if (!wAkordeonie) {
    return (
      <Karta tytul={tytul} bezLinii>
        {children}
      </Karta>
    );
  }
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <h3 className="m-0 text-tile-title text-ink">{tytul}</h3>
      {children}
    </section>
  );
}

function opcjeLiczby(liczba: number) {
  return Array.from({ length: liczba }, (_, i) => ({ wartosc: String(i + 1), etykieta: String(i + 1) }));
}

function podpowiedzDaty(rodzaj: RodzajSytuacjiSzczegolnej | null, daneCiazy: DaneCiazyIDziecka | null): string {
  if (rodzaj === null) return t.podpowiedzDatyBezRodzaju;
  const podstawa = t.podpowiedziDaty[rodzaj];
  const zapiszemyJakoPorod = czyStrataCiazy(rodzaj) && !(daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu);
  return zapiszemyJakoPorod ? `${podstawa} ${t.dopisekDatyPorodu}` : podstawa;
}

export function FormularzSytuacji({
  daneCiazy,
  dzis,
  wAkordeonie = false,
  formularz,
  onZmianaFormularza,
  walidacja,
  czesci,
  onDalej,
  brakZgodyMatki = false,
}: FormularzSytuacjiProps) {
  const potwierdzona = Boolean(daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu);
  const liczbaZCiazy = liczbaDzieciZCiazy(daneCiazy);
  const rodzaj = formularz.rodzaj;
  const dataZProfilu = dataZdarzeniaZProfilu(rodzaj, daneCiazy);
  const poleLiczby = czyPoleLiczbyDzieci(rodzaj, daneCiazy);
  const pokazJednoDziecko = liczbaZCiazy === 1 && (rodzaj === null || czyDotyczyDziecka(rodzaj));
  const widoczna = (numer: number) => wAkordeonie || czesci.czesc === numer;

  function zmienRodzaj(nowy: RodzajSytuacjiSzczegolnej) {
    const propozycja = proponowanaDataZdarzenia(nowy, daneCiazy);
    const dataZdarzenia =
      dataZdarzeniaZProfilu(nowy, daneCiazy) !== null
        ? formatujDate(dataZdarzeniaZProfilu(nowy, daneCiazy) as DataISO)
        : formularz.dataZdarzenia === '' && propozycja
          ? formatujDate(propozycja)
          : formularz.dataZdarzenia;
    onZmianaFormularza({ ...formularz, rodzaj: nowy, dataZdarzenia });
  }

  function przejdzDalej() {
    // Na części 1 sprawdza rodzaj sytuacji, na ostatniej cały formularz z fokusem na pierwszym polu z błędem.
    czesci.dalej(() => {
      const zgloszenie = zgloszenieZFormularza(formularz, daneCiazy, dzis, brakZgodyMatki);
      if (zgloszenie !== null) onDalej(zgloszenie);
    });
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        przejdzDalej();
      }}
      className="flex min-w-0 flex-col gap-7.5"
    >
      {widoczna(1) ? (
        <Sekcja tytul={t.kartaRodzaju} wAkordeonie={wAkordeonie}>
          <PoleRodzaju
            wartosc={rodzaj}
            onZmiana={zmienRodzaj}
            onOpuszczenie={() => walidacja.onOpuszczenie('rodzaj')}
            blad={walidacja.blad('rodzaj') === '0006' ? '0006' : null}
            pokazBrakDatyPorodu={rodzaj !== null && czyWymagaDatyPorodu(rodzaj) && !potwierdzona}
            pokazBrakZgodyMatki={czyBrakZgodyMatki(rodzaj, brakZgodyMatki)}
          />
        </Sekcja>
      ) : null}
      {widoczna(2) ? (
        <Sekcja tytul={t.kartaDaty} wAkordeonie={wAkordeonie}>
          <div className="flex min-w-0 flex-col gap-6">
            <div className="max-w-105">
              <PoleDaty
                id={ID_DATY}
                etykieta={t.etykietaDaty}
                podpowiedz={podpowiedzDaty(rodzaj, daneCiazy)}
                wartosc={dataZProfilu ? formatujDate(dataZProfilu) : formularz.dataZdarzenia}
                tylkoDoOdczytu={dataZProfilu !== null}
                onZmiana={(dataZdarzenia) => onZmianaFormularza({ ...formularz, dataZdarzenia })}
                {...walidacja.pole('dataZdarzenia')}
              />
            </div>
            {poleLiczby ? (
              <div className="max-w-105">
                <PoleWyboru
                  id={ID_LICZBY}
                  etykieta={t.etykietaLiczby}
                  podpowiedz={t.podpowiedzLiczby({ liczba: liczbaZCiazy })}
                  opcje={opcjeLiczby(liczbaZCiazy)}
                  wartosc={formularz.liczbaDzieci}
                  pustaOpcja={t.pustaOpcjaLiczby}
                  onZmiana={(liczbaDzieci) => onZmianaFormularza({ ...formularz, liczbaDzieci })}
                  {...walidacja.pole('liczbaDzieci')}
                  szerokosc="srednia"
                />
              </div>
            ) : pokazJednoDziecko ? (
              <p className="m-0">{t.jednoDziecko}</p>
            ) : null}
          </div>
        </Sekcja>
      ) : null}
      <div className={wAkordeonie ? 'flex flex-wrap justify-end gap-4' : 'flex flex-wrap justify-between gap-4'}>
        {wAkordeonie ? null : czesci.czyPierwsza ? (
          <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
            {teksty.wspolne.przyciski.wroc}
          </PrzyciskLink>
        ) : (
          <Przycisk wariant="drugorzedny" onClick={() => czesci.wroc()}>
            {teksty.wspolne.przyciski.wroc}
          </Przycisk>
        )}
        <Przycisk type="submit" wariant="glowny">
          {teksty.wspolne.przyciski.dalej}
        </Przycisk>
      </div>
    </form>
  );
}
