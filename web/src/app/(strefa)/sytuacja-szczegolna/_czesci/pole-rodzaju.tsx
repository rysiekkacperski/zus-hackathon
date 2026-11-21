'use client';

// Pole rodzaju sytuacji ze wzoru P22-02: fieldset z dwiema grupami przycisków radio (dziecka, matki),
// błąd 0006 i komunikaty przy polu (0194 przy poronieniu, 0037 z akcją potwierdzenia daty porodu).
import { Komunikat } from '@/komponenty/komunikat';
import { Odnosnik } from '@/komponenty/odnosnik';
import { BladPola, idBledu } from '@/komponenty/pole';
import { trasy } from '@/komponenty/rama/trasy';
import { RODZAJE_DZIECKA, RODZAJE_MATKI } from '@/domena/rodzina/sytuacje';
import type { KodKomunikatu, RodzajSytuacjiSzczegolnej } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewSpecialSituation;

export function idOpcjiRodzaju(rodzaj: RodzajSytuacjiSzczegolnej): string {
  return `sytuacja-rodzaj-${rodzaj}`;
}

const ID_POLA = 'sytuacja-rodzaj';

interface PoleRodzajuProps {
  wartosc: RodzajSytuacjiSzczegolnej | null;
  onZmiana: (rodzaj: RodzajSytuacjiSzczegolnej) => void;
  blad: KodKomunikatu | null;
  pokazBrakDatyPorodu: boolean;
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

export function PoleRodzaju({ wartosc, onZmiana, blad, pokazBrakDatyPorodu }: PoleRodzajuProps) {
  const bladWyboru = blad === '0006';
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <fieldset
        aria-describedby={bladWyboru ? idBledu(ID_POLA) : undefined}
        aria-invalid={bladWyboru ? true : undefined}
        className="m-0 min-w-0 border-0 p-0"
      >
        <legend className="m-0 mb-3 p-0 text-body-strong">{t.legendaRodzaju}</legend>
        <GrupaRodzajow podpis={t.dotyczyDziecka} rodzaje={RODZAJE_DZIECKA} wartosc={wartosc} onZmiana={onZmiana} />
        <div className="h-4" />
        <GrupaRodzajow podpis={t.dotyczyMatki} rodzaje={RODZAJE_MATKI} wartosc={wartosc} onZmiana={onZmiana} />
        {bladWyboru ? <BladPola id={idBledu(ID_POLA)} kod="0006" /> : null}
      </fieldset>
      {wartosc === 'poronienie' ? <Komunikat kod="0194" /> : null}
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
