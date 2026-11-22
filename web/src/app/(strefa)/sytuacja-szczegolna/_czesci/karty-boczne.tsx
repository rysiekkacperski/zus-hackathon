'use client';

// Karty boczne formularza sytuacji szczególnej (wzór P22-02): „Dane z profilu rodziny” i „Co się zmieni”.
import { Karta } from '@/komponenty/karta';
import { formatujDate } from '@/domena/daty';
import { liczbaDzieciZCiazy } from '@/domena/rodzina/sytuacje';
import type { DaneCiazyIDziecka, DataISO } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewSpecialSituation;

function opisDatyPorodu(daneCiazy: DaneCiazyIDziecka | null): string {
  if (daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu) {
    return t.dataPotwierdzona({ data: formatujDate(daneCiazy.dataPorodu) });
  }
  if (daneCiazy?.przewidywanyTerminPorodu) {
    return t.dataNiepotwierdzona({ termin: formatujDate(daneCiazy.przewidywanyTerminPorodu) });
  }
  return t.dataBrak;
}

export function KartyBoczne({
  daneCiazy,
  drugiRodzic,
  dzis,
}: {
  daneCiazy: DaneCiazyIDziecka | null;
  drugiRodzic: string | null;
  dzis: DataISO;
}) {
  const pozycje = [
    { etykieta: t.dataPorodu, wartosc: opisDatyPorodu(daneCiazy) },
    { etykieta: t.liczbaDzieciZCiazy, wartosc: t.wartoscLiczbyDzieci({ liczba: liczbaDzieciZCiazy(daneCiazy) }) },
    { etykieta: t.drugiRodzic, wartosc: drugiRodzic ?? t.brakDrugiegoRodzica },
  ];
  return (
    <div className="flex min-w-0 flex-col gap-7.5">
      <Karta tytul={t.kartaProfilu} bezLinii>
        <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
        <dl className="m-0 grid gap-3">
          {pozycje.map((p) => (
            <div key={p.etykieta}>
              <dt className="text-body-strong">{p.etykieta}</dt>
              <dd className="m-0">{p.wartosc}</dd>
            </div>
          ))}
        </dl>
      </Karta>
      <Karta tytul={t.kartaZmian} bezLinii>
        <ul className="m-0 grid gap-2 pl-5">
          {t.zmiany.map((zmiana) => (
            <li key={zmiana}>{zmiana}</li>
          ))}
        </ul>
      </Karta>
    </div>
  );
}
