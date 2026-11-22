'use client';

// Slot ViewFamilyPlan „akcja-przejecia-urlopu” w liście slotyPrzySprawie (kontrakt, sekcja 12.4). Właściciel: u25.
// Dopiski sytuacji szczególnej przy sprawie (wzory P22-04, P22-12): okres i kanał K34, „Zobacz organizacje” przy K35,
// oznaczenie „Bez przypomnień”, sprawa złożona albo załatwiona zachowana po stracie, wymiar urlopu macierzyńskiego
// po stracie w ciąży mnogiej oraz blok „Przejęcie urlopu macierzyńskiego” przy pierwszej sprawie etapu
// Urlopy i zasiłek macierzyński, gdy profil zawiera sytuację matki, drugiego rodzica i potwierdzoną datę porodu.
import type { ReactNode } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useOsobySytuacji } from '@/app/(strefa)/sytuacja-szczegolna/_czesci/osoby';
import { formatujDate } from '@/domena/daty';
import { RODZAJE_Z_K35, sytuacjaMatkiDoPrzejecia } from '@/domena/rodzina/sytuacje';
import type { SytuacjaSzczegolna } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewFamilyPlan.akcjaPrzejeciaUrlopu;

function opisSytuacjiMatki(s: SytuacjaSzczegolna, matka: string, kontoJestMatka: boolean): string {
  const data = formatujDate(s.dataZdarzenia);
  if (kontoJestMatka && (s.rodzaj === 'szpital' || s.rodzaj === 'orzeczenie')) return t.sytuacjaWlasna[s.rodzaj]({ data });
  if (s.rodzaj === 'szpital' || s.rodzaj === 'orzeczenie' || s.rodzaj === 'porzucenie' || s.rodzaj === 'smierc-matki') {
    return t.sytuacjaMatki[s.rodzaj]({ matka, data });
  }
  return '';
}

export function SlotAkcjaPrzejeciaUrlopu({ sprawa, kontekst }: PropsSlotu<'przySprawie'>) {
  const osoby = useOsobySytuacji(kontekst);
  const { rodzina } = kontekst;
  const daneCiazy = rodzina.daneCiazy;
  if (daneCiazy === null || daneCiazy.wylaczoneZUzycia || (daneCiazy.sytuacjeSzczegolne ?? []).length === 0) return null;
  if (kontekst.rola !== 'rodzic' && kontekst.rola !== 'drugi-rodzic') return null;

  const dopiski: ReactNode[] = [];
  const okres = sprawa.dane?.okresK34;
  if (sprawa.idSprawy === 'K34' && okres) {
    dopiski.push(
      <p key="k34" className="m-0">
        {t.okresK34({ od: formatujDate(okres.od), doDnia: formatujDate(okres.do) })}{' '}
        {sprawa.dane?.kanalK34 === 'zus' ? t.kanalZus : t.kanalPracodawca}
      </p>,
    );
  }
  if (sprawa.idSprawy === 'K35') {
    const sytuacja = [...daneCiazy.sytuacjeSzczegolne].reverse().find((s) => RODZAJE_Z_K35.includes(s.rodzaj));
    dopiski.push(
      <p key="k35" className="m-0">
        {t.organizacjeOpis}{' '}
        <Odnosnik
          href={trasy.ViewSupportOrganizations({ sytuacja: sytuacja?.rodzaj, powrot: trasy.ViewFamilyPlan() })}
          wTekscie
        >
          {t.organizacjeAkcja}
        </Odnosnik>
      </p>,
    );
  }
  const wymiar = sprawa.sytuacjaSzczegolna?.wymiarMacierzynskiegoTygodni;
  if (wymiar !== undefined) {
    dopiski.push(
      <p key="wymiar" className="m-0">
        {t.wymiarMacierzynskiego({ tygodnie: wymiar })}
      </p>,
    );
  }
  if (sprawa.sytuacjaSzczegolna?.zachowanaPoStracie && (sprawa.status === 'zlozona' || sprawa.status === 'zalatwiona')) {
    dopiski.push(
      <p key="zachowana" className="m-0">
        {sprawa.status === 'zlozona' ? t.zachowanaZlozona : t.zachowanaZalatwiona}
      </p>,
    );
  }
  if (sprawa.bezPrzypomnien) {
    dopiski.push(
      <span key="bez" className="flex items-center gap-1 text-small-strong">
        <Ikona nazwa="bez-przypomnien" rozmiar={16} className="text-brand" />
        {t.bezPrzypomnien}
      </span>,
    );
  }

  const sytuacjaMatki = sytuacjaMatkiDoPrzejecia(rodzina.daneRodziny, daneCiazy);
  const pierwszaWEtapie = rodzina.plan?.pozycje.find((p) => p.etap === 'urlopy-i-zasilek');
  const blokPrzejecia =
    sytuacjaMatki !== null && pierwszaWEtapie?.idSprawy === sprawa.idSprawy ? (
      <div key="przejecie" className="flex min-w-0 flex-col items-start gap-3 rounded-sm bg-brand-wash p-4">
        <h4 className="m-0 text-body-strong">{t.tytul}</h4>
        <p className="m-0">
          {opisSytuacjiMatki(sytuacjaMatki, osoby.matkaImieINazwisko ?? t.matkaDomyslnie, osoby.kontoJestMatka)}{' '}
          {osoby.kontoJestMatka ? t.opisDlaMatki : t.opisDlaDrugiegoRodzica}
        </p>
        <PrzyciskLink
          href={trasy.ViewFatherTakeover({ sytuacja: sytuacjaMatki.rodzaj, data: sytuacjaMatki.dataZdarzenia })}
          wariant="glowny"
        >
          {t.akcja}
        </PrzyciskLink>
      </div>
    ) : null;

  if (dopiski.length === 0 && blokPrzejecia === null) return null;
  return (
    <div className="mt-1 flex min-w-0 flex-col gap-2">
      {blokPrzejecia}
      {dopiski}
    </div>
  );
}
