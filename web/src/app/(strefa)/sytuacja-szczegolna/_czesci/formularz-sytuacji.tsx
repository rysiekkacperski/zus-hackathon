'use client';

// Formularz zgłoszenia sytuacji szczególnej (wzory P22-02, P22-08, P22-09, P22-10): karta „Co się wydarzyło”,
// karta „Kiedy” z datą zdarzenia i liczbą dzieci, akcje Wróć i Przejdź dalej. Po poprawnej walidacji
// przekazuje zgłoszenie do arkusza SheetSpecialSituationConfirm.
import { useState, type ReactNode } from 'react';
import { Karta } from '@/komponenty/karta';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujDate } from '@/domena/daty';
import {
  czyDotyczyDziecka,
  czyPoleLiczbyDzieci,
  czyStrataCiazy,
  czyWymagaDatyPorodu,
  dataZdarzeniaZProfilu,
  liczbaDzieciZCiazy,
  proponowanaDataZdarzenia,
  walidujSytuacje,
  zgloszenieZFormularza,
  type FormularzSytuacji as Formularz,
  type PoleSytuacji,
  type ZgloszenieSytuacji,
} from '@/domena/rodzina/sytuacje';
import type { BledyPol, DaneCiazyIDziecka, DataISO, RodzajSytuacjiSzczegolnej } from '@/domena/typy';
import { teksty } from '@/teksty';
import { PoleRodzaju, idOpcjiRodzaju } from './pole-rodzaju';

const t = teksty.ViewSpecialSituation;
const ID_DATY = 'sytuacja-data';
const ID_LICZBY = 'sytuacja-liczba';

interface FormularzSytuacjiProps {
  daneCiazy: DaneCiazyIDziecka | null;
  dzis: DataISO;
  /** Formularz w akordeonie „Zapisz kolejną sytuację” nie ma akcji Wróć. */
  wAkordeonie?: boolean;
  /** Formularz po zamknięciu arkusza zachowuje wpisane wartości. */
  formularz: Formularz;
  onZmianaFormularza: (f: Formularz) => void;
  bledyZOperacji?: BledyPol<PoleSytuacji>;
  onDalej: (zgloszenie: ZgloszenieSytuacji) => void;
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
  bledyZOperacji,
  onDalej,
}: FormularzSytuacjiProps) {
  const [bledy, setBledy] = useState<BledyPol<PoleSytuacji>>({});
  const widoczneBledy = { ...bledy, ...bledyZOperacji };
  const potwierdzona = Boolean(daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu);
  const liczbaZCiazy = liczbaDzieciZCiazy(daneCiazy);
  const rodzaj = formularz.rodzaj;
  const dataZProfilu = dataZdarzeniaZProfilu(rodzaj, daneCiazy);
  const poleLiczby = czyPoleLiczbyDzieci(rodzaj, daneCiazy);
  const pokazJednoDziecko = liczbaZCiazy === 1 && (rodzaj === null || czyDotyczyDziecka(rodzaj));

  function zmienRodzaj(nowy: RodzajSytuacjiSzczegolnej) {
    const propozycja = proponowanaDataZdarzenia(nowy, daneCiazy);
    const dataZdarzenia =
      dataZdarzeniaZProfilu(nowy, daneCiazy) !== null
        ? formatujDate(dataZdarzeniaZProfilu(nowy, daneCiazy) as DataISO)
        : formularz.dataZdarzenia === '' && propozycja
          ? formatujDate(propozycja)
          : formularz.dataZdarzenia;
    onZmianaFormularza({ ...formularz, rodzaj: nowy, dataZdarzenia });
    setBledy((b) => ({ ...b, rodzaj: undefined }));
  }

  function przejdzDalej() {
    const nowe = walidujSytuacje(formularz, daneCiazy, dzis);
    setBledy(nowe);
    const zgloszenie = zgloszenieZFormularza(formularz, daneCiazy, dzis);
    if (zgloszenie !== null) {
      onDalej(zgloszenie);
      return;
    }
    // Fokus na pierwsze pole z błędem (kontrakt, sekcja 1.4).
    const idPola = nowe.rodzaj
      ? idOpcjiRodzaju(formularz.rodzaj ?? 'martwe-urodzenie')
      : nowe.dataZdarzenia
        ? ID_DATY
        : nowe.liczbaDzieci
          ? ID_LICZBY
          : null;
    if (idPola) document.getElementById(idPola)?.focus();
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
      <Sekcja tytul={t.kartaRodzaju} wAkordeonie={wAkordeonie}>
        <PoleRodzaju
          wartosc={rodzaj}
          onZmiana={zmienRodzaj}
          blad={widoczneBledy.rodzaj === '0006' ? '0006' : null}
          pokazBrakDatyPorodu={rodzaj !== null && czyWymagaDatyPorodu(rodzaj) && !potwierdzona}
        />
      </Sekcja>
      <Sekcja tytul={t.kartaDaty} wAkordeonie={wAkordeonie}>
        <div className="flex min-w-0 flex-col gap-6">
          <div className="max-w-105">
            <PoleDaty
              id={ID_DATY}
              etykieta={t.etykietaDaty}
              podpowiedz={podpowiedzDaty(rodzaj, daneCiazy)}
              wartosc={dataZProfilu ? formatujDate(dataZProfilu) : formularz.dataZdarzenia}
              tylkoDoOdczytu={dataZProfilu !== null}
              onZmiana={(dataZdarzenia) => {
                onZmianaFormularza({ ...formularz, dataZdarzenia });
                setBledy((b) => ({ ...b, dataZdarzenia: undefined }));
              }}
              blad={widoczneBledy.dataZdarzenia ?? null}
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
                onZmiana={(liczbaDzieci) => {
                  onZmianaFormularza({ ...formularz, liczbaDzieci });
                  setBledy((b) => ({ ...b, liczbaDzieci: undefined }));
                }}
                blad={widoczneBledy.liczbaDzieci ?? null}
                szerokosc="srednia"
              />
            </div>
          ) : pokazJednoDziecko ? (
            <p className="m-0">{t.jednoDziecko}</p>
          ) : null}
        </div>
      </Sekcja>
      <div className={wAkordeonie ? 'flex flex-wrap justify-end gap-4' : 'flex flex-wrap justify-between gap-4'}>
        {wAkordeonie ? null : (
          <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
            {teksty.wspolne.przyciski.wroc}
          </PrzyciskLink>
        )}
        <Przycisk type="submit" wariant="glowny">
          {teksty.wspolne.przyciski.dalej}
        </Przycisk>
      </div>
    </form>
  );
}

