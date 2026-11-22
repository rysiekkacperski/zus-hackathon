'use client';

// Pole rodzaju sytuacji ze wzoru P22-02: fieldset z dwiema grupami przycisków radio (dziecka, matki),
// błąd 0006 i komunikaty przy polu (0264 przy poronieniu, 0194 przy poronieniu potwierdzonym zaświadczeniem,
// 0037 z akcją potwierdzenia daty porodu, 0277 przy braku zgody konta matki na dane dotyczące zdrowia).
// Opuszczenie pola (walidacja na bieżąco) następuje po wyjściu fokusu poza fieldset i po wyborze rodzaju.
import { Komunikat } from '@/komponenty/komunikat';
import { Odnosnik } from '@/komponenty/odnosnik';
import { BladPola, idBledu, opuszczonoKontener } from '@/komponenty/pole';
import { trasy } from '@/komponenty/rama/trasy';
import { RODZAJE_DZIECKA, RODZAJE_MATKI, komunikatPrzyRodzaju } from '@/domena/rodzina/sytuacje';
import type { KodKomunikatu, RodzajSytuacjiSzczegolnej } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewSpecialSituation;

export function idOpcjiRodzaju(rodzaj: RodzajSytuacjiSzczegolnej): string {
  return `sytuacja-rodzaj-${rodzaj}`;
}

/** Nazwa grupy przycisków radio rodzaju sytuacji, cel fokusu pola z błędem. */
export const NAZWA_POLA_RODZAJU = 'sytuacja-rodzaj';
const ID_POLA = NAZWA_POLA_RODZAJU;

interface PoleRodzajuProps {
  wartosc: RodzajSytuacjiSzczegolnej | null;
  onZmiana: (rodzaj: RodzajSytuacjiSzczegolnej) => void;
  onOpuszczenie?: () => void;
  blad: KodKomunikatu | null;
  pokazBrakDatyPorodu: boolean;
  pokazBrakZgodyMatki?: boolean;
}

function GrupaRodzajow({
  podpis,
  rodzaje,
  wartosc,
  onZmiana,
}: {
  podpis: string;
  rodzaje: readonly RodzajSytuacjiSzczegolnej[];
  wartosc: RodzajSytuacjiSzczegolnej | null;
  onZmiana: (rodzaj: RodzajSytuacjiSzczegolnej) => void;
}) {
  return (
    <>
      <p className="m-0 mb-2 text-small-strong">{podpis}</p>
      <div className="flex flex-col gap-1">
        {rodzaje.map((rodzaj) => (
          <label
            key={rodzaj}
            htmlFor={idOpcjiRodzaju(rodzaj)}
            className={
              wartosc === rodzaj
                ? 'flex min-h-10 cursor-pointer items-center gap-3 font-semibold'
                : 'flex min-h-10 cursor-pointer items-center gap-3'
            }
          >
            <input
              id={idOpcjiRodzaju(rodzaj)}
              type="radio"
              name={ID_POLA}
              value={rodzaj}
              checked={wartosc === rodzaj}
              onChange={() => onZmiana(rodzaj)}
              className="m-0 size-5 flex-none accent-brand"
            />
            <span className="min-w-0">{t.rodzaje[rodzaj]}</span>
          </label>
        ))}
      </div>
    </>
  );
}

export function PoleRodzaju({
  wartosc,
  onZmiana,
  onOpuszczenie,
  blad,
  pokazBrakDatyPorodu,
  pokazBrakZgodyMatki = false,
}: PoleRodzajuProps) {
  const bladWyboru = blad === '0006';
  const informacja = komunikatPrzyRodzaju(wartosc);
  function wybierz(rodzaj: RodzajSytuacjiSzczegolnej) {
    onZmiana(rodzaj);
    onOpuszczenie?.();
  }
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <fieldset
        aria-describedby={bladWyboru ? idBledu(ID_POLA) : undefined}
        aria-invalid={bladWyboru ? true : undefined}
        onBlur={(e) => {
          if (onOpuszczenie && opuszczonoKontener(e)) onOpuszczenie();
        }}
        className="m-0 min-w-0 border-0 p-0"
      >
        <legend className="m-0 mb-3 p-0 text-body-strong">{t.legendaRodzaju}</legend>
        <GrupaRodzajow podpis={t.dotyczyDziecka} rodzaje={RODZAJE_DZIECKA} wartosc={wartosc} onZmiana={wybierz} />
        <div className="h-4" />
        <GrupaRodzajow podpis={t.dotyczyMatki} rodzaje={RODZAJE_MATKI} wartosc={wartosc} onZmiana={wybierz} />
        {bladWyboru ? <BladPola id={idBledu(ID_POLA)} kod="0006" /> : null}
      </fieldset>
      {informacja ? <Komunikat kod={informacja} /> : null}
      {pokazBrakZgodyMatki ? <Komunikat kod="0277" /> : null}
      {pokazBrakDatyPorodu ? (
        <Komunikat
          kod="0037"
          akcje={
            <Odnosnik href={trasy.ViewBirthDate({ tryb: 'pakiet' })} wTekscie>
              {t.potwierdzDatePorodu}
            </Odnosnik>
          }
        />
      ) : null}
    </div>
  );
}
