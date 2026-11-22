'use client';

// Sprawy etapu planu na stronie etapu ViewFamilyPlanStage (historyjka 3.6.1.2.1, wzór Plan-rodziny): tabela spraw
// z rodzicem, statusem, oznaczeniami, kwotą i slotami przy sprawie. Link do sprawy prowadzi do ViewCaseDetails
// z ?z=plan i etapem, więc powrót z karty sprawy wraca na stronę etapu. Właściciel: u12.
import type { ReactNode } from 'react';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import type { Etap, PozycjaPlanu, TerminSprawy } from '@/domena/typy';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Tabela } from '@/komponenty/tabela';
import { StatusSprawy } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import { slotyPrzySprawie } from '../_sloty';
import { PARAMETR_ETAPU } from './sciezka-etapu';
import { czyDotyczyDziecka, etykietaRodzica, kwotaSprawy, nazwaEtapu, opisSprawy, tytulSprawy } from './sprawy';

const t = teksty.ViewFamilyPlan;

// Poniżej md wiersze tabeli spraw układają się w karty: nagłówki kolumn zostają dla czytników ekranu,
// a komórki sprawy, rodzica, statusu i kwoty stoją jedna pod drugą na całej szerokości karty.
const KLASY_KART_PONIZEJ_MD = [
  'max-md:overflow-visible',
  'max-md:[&_table]:block max-md:[&_tbody]:flex max-md:[&_tbody]:flex-col max-md:[&_tbody]:gap-3',
  'max-md:[&_thead]:sr-only',
  'max-md:[&_tbody_tr]:flex max-md:[&_tbody_tr]:flex-col max-md:[&_tbody_tr]:items-start max-md:[&_tbody_tr]:gap-3',
  'max-md:[&_tbody_tr]:rounded-md max-md:[&_tbody_tr]:border max-md:[&_tbody_tr]:border-line max-md:[&_tbody_tr]:p-4',
  'max-md:[&_tbody_th]:block max-md:[&_tbody_th]:h-auto max-md:[&_tbody_th]:w-full max-md:[&_tbody_th]:border-0 max-md:[&_tbody_th]:p-0',
  'max-md:[&_tbody_td]:block max-md:[&_tbody_td]:h-auto max-md:[&_tbody_td]:border-0 max-md:[&_tbody_td]:p-0 max-md:[&_tbody_td]:text-left',
].join(' ');

export interface EtapPlanuProps {
  etap: Etap;
  sprawy: PozycjaPlanu[];
  kontekst: KontekstRodziny;
  terminy: TerminSprawy[];
  przedTabela?: ReactNode;
  poTabeli?: ReactNode;
}

function KomorkaSprawy({
  sprawa,
  kontekst,
  termin,
  etap,
}: {
  sprawa: PozycjaPlanu;
  kontekst: KontekstRodziny;
  termin?: TerminSprawy;
  etap: Etap;
}) {
  const opis = opisSprawy(sprawa, kontekst.rodzina.daneCiazy);
  const informacjaK19 = sprawa.ostrzezenia.some((o) => o.rodzaj === 'informacja-po-porodzie');
  const oznaczenia: string[] = [];
  if (sprawa.poPorodzie) oznaczenia.push(t.oznaczenia.poPorodzie);
  if (sprawa.zalezyOdDochodu) oznaczenia.push(t.oznaczenia.zalezyOdDochodu);
  if (sprawa.oznaczenia.includes('nowa-w-planie')) oznaczenia.push(t.oznaczenia.nowaWPlanie);
  const liczbaDzieci = czyDotyczyDziecka(sprawa) ? t.oznaczenia.liczbaDzieci({ liczba: String(sprawa.liczbaDzieci) }) : null;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="font-semibold">
        <Odnosnik
          href={sciezkaWidoku('ViewCaseDetails', { idSprawy: sprawa.idSprawy, [PARAMETR_ETAPU]: etap })}
          pochodzenie="plan"
        >
          {tytulSprawy(kontekst.katalog, sprawa)}
        </Odnosnik>
      </span>
      {opis ? <span className="text-body">{opis}</span> : null}
      {oznaczenia.length > 0 || liczbaDzieci ? (
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          {oznaczenia.map((o) => (
            <span key={o} className="text-small-strong">
              {o}
            </span>
          ))}
          {liczbaDzieci ? <span className="text-small">{liczbaDzieci}</span> : null}
        </span>
      ) : null}
      {informacjaK19 ? <Komunikat typ="INFO" tresc={t.informacjaK19} className="mt-2" /> : null}
      {slotyPrzySprawie.map(({ id, Komponent }) => (
        <Komponent key={id} sprawa={sprawa} termin={termin} kontekst={kontekst} pochodzenie="plan" />
      ))}
    </div>
  );
}

export function EtapPlanu({ etap, sprawy, kontekst, terminy, przedTabela, poTabeli }: EtapPlanuProps) {
  const nazwa = nazwaEtapu(etap);
  const zKwota = etap === 'pieniadze-na-dziecko';

  return (
    <Karta tytul={teksty.ViewFamilyPlanStage.sprawyEtapu} bezLinii>
      <div className="flex flex-col gap-6">
        {przedTabela}
        {sprawy.length > 0 ? (
          <Tabela
            className={KLASY_KART_PONIZEJ_MD}
            podpis={t.podpisTabeli({ etap: nazwa })}
            etykietaPrzewijania={t.przewijanieTabeli({ etap: nazwa })}
            kolumny={[
              { klucz: 'sprawa', naglowek: t.kolumny.sprawa, tytulowa: true },
              { klucz: 'kogo', naglowek: t.kolumny.kogo },
              { klucz: 'status', naglowek: t.kolumny.status },
              ...(zKwota ? [{ klucz: 'kwota' as const, naglowek: t.kolumny.kwota, liczbowa: true }] : []),
            ]}
            wiersze={sprawy.map((sprawa) => ({
              id: sprawa.idSprawy,
              sprawa: (
                <KomorkaSprawy
                  sprawa={sprawa}
                  kontekst={kontekst}
                  termin={terminy.find((tr) => tr.idSprawy === sprawa.idSprawy)}
                  etap={etap}
                />
              ),
              kogo: (
                <>
                  <span className="text-small-strong md:hidden">{t.kolumny.kogo}: </span>
                  {etykietaRodzica(sprawa, kontekst.rola)}
                </>
              ),
              status: <StatusSprawy status={sprawa.status} />,
              kwota: (
                <>
                  <span className="text-small-strong md:hidden">{t.kolumny.kwota}: </span>
                  {kwotaSprawy(sprawa)}
                </>
              ),
            }))}
          />
        ) : przedTabela ? null : (
          <Notatka>
            <p className="m-0">{t.brakSprawWEtapie}</p>
          </Notatka>
        )}
        {poTabeli}
      </div>
    </Karta>
  );
}
