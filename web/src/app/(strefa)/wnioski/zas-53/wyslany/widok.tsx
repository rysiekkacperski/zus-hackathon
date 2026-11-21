'use client';

// ViewZas53Sent: potwierdzenie wysłania wniosku ZAS-53 (0045 po przejściu), numer, data, sprawa K24 w planie.
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { formatujDate } from '@/domena/daty';
import type { WniosekZas53 } from '@/domena/typy';
import { formatujRachunek } from '@/domena/walidacje';
import { useKonto, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { Kafelki } from '@/komponenty/kafelki';
import { Karta } from '@/komponenty/karta';
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { BrakWnioskuZas53 } from '../_czesci/kreator';
import { teksty } from '@/teksty';

const t = teksty.ViewZas53Sent;

export function WidokWyslanegoZas53() {
  const parametry = useSearchParams();
  const id = parametry.get('wniosek');
  const rodzina = useRodzina();
  const konto = useKonto();
  const stanKonta = useStanKonta();
  const wniosek = useMemo(
    () =>
      rodzina?.wnioski.find(
        (w): w is WniosekZas53 => w.idWniosku === id && w.rodzaj === 'zas-53' && w.konto === konto?.pesel && w.stan !== 'szkic',
      ),
    [rodzina, id, konto],
  );
  if (!wniosek || !rodzina) return <BrakWnioskuZas53 />;

  const z = wniosek.zaswiadczenie;
  const sprawa = rodzina.plan?.pozycje.find((p) => p.idSprawy === wniosek.idSprawy);
  const status = sprawa ? teksty.wspolne.etykiety.statusySpraw[sprawa.status] : teksty.wspolne.etykiety.statusySpraw.zlozona;
  const zalaczniki = wniosek.zalaczniki.map((zal) =>
    zal.nazwaPoWyslaniu ?? (zal.rodzaj === 'oswiadczenie-z10' ? teksty.ViewZas53Summary.z10Zalacznik : zal.opis ?? zal.rodzaj),
  );
  const adres = stanKonta?.kopiaDanychZus?.adres ?? '';

  return (
    <>
      <NaglowekStrony tytul={teksty.ViewZas53Sent.naglowek} powrot={{ href: trasy.ViewFamilyPlan(), etykieta: t.powrot }} />
      <UkladDwuKolumnowy
        etykietaBocznej={t.coDalej}
        tresc={
          <div className="flex flex-col gap-7.5">
            <Karta tytul={t.kartaPotwierdzenia} bezLinii as="section">
              <ListaDefinicji
                pozycje={[
                  { etykieta: t.numer, wartosc: wniosek.potwierdzenie ?? '' },
                  { etykieta: t.dataWyslania, wartosc: wniosek.dataZlozenia ? formatujDate(wniosek.dataZlozenia) : '' },
                  { etykieta: t.adresat, wartosc: t.zus },
                  { etykieta: t.wniosek, wartosc: t.wniosekWartosc },
                  ...(z
                    ? [
                        {
                          etykieta: t.zaswiadczenie,
                          wartosc: t.zaswiadczenieWartosc({
                            numer: z.seriaINumer || teksty.ViewZas53Start.kreator.bezNumeru,
                            od: formatujDate(z.od),
                            do: formatujDate(z.do),
                          }),
                        },
                      ]
                    : []),
                  {
                    etykieta: t.okres,
                    wartosc:
                      wniosek.okresUbezpieczenia?.rodzaj === 'po-ustaniu'
                        ? t.poUstaniu({ data: formatujDate(wniosek.okresUbezpieczenia.dataUstania) })
                        : t.wUbezpieczeniu,
                  },
                  ...(wniosek.okresPrawa
                    ? [
                        {
                          etykieta: t.zasilek,
                          wartosc: t.zasilekWartosc({
                            procent: `${wniosek.stawka ?? 100}%`,
                            od: formatujDate(wniosek.okresPrawa.od),
                            do: formatujDate(wniosek.okresPrawa.do),
                          }),
                        },
                      ]
                    : []),
                  { etykieta: t.zalaczniki, wartosc: zalaczniki.length > 0 ? zalaczniki.join(', ') : t.brakZalacznikow },
                ]}
              />
              {wniosek.potwierdzenie?.startsWith('ZAS53-DEMO') ? (
                <p className="m-0 mt-4">
                  <FlagaDemo>{t.flagaDemo}</FlagaDemo>
                </p>
              ) : null}
            </Karta>
            <Karta tytul={t.kartaSprawy} bezLinii as="section">
              <p className="m-0 text-body-strong">{t.sprawa}</p>
              <p className="m-0 mb-6">
                {t.status({
                  status: status.toLowerCase(),
                  data: formatujDate(sprawa?.dataOznaczenia ?? wniosek.dataZlozenia ?? wniosek.zaktualizowano),
                })}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
                  {t.doPlanu}
                </PrzyciskLink>
                <Odnosnik href={trasy.ViewApplicationList()}>{t.doWnioskow}</Odnosnik>
              </div>
            </Karta>
          </div>
        }
        boczna={
          <Karta tytul={t.coDalej} bezLinii as="section">
            {wniosek.numerRachunku ? (
              <>
                <p className="m-0">{t.naRachunek}</p>
                <p className="m-0 mb-4 text-body-strong">{formatujRachunek(wniosek.numerRachunku)}</p>
              </>
            ) : (
              <p className="m-0 mb-4">{t.przekazem({ adres })}</p>
            )}
            <p className="m-0 mb-4">{t.kolejne({ numer: z?.seriaINumer || teksty.ViewZas53Start.kreator.bezNumeru })}</p>
            <Kafelki kafelki={[{ href: trasy.ViewSickLeaveList(), etykieta: t.ezla, ikona: 'plik' }]} />
          </Karta>
        }
      />
    </>
  );
}
