'use client';

// Sekcja ViewCaseDetails „status-wniosku-zus” w liście sekcjeSprawy (kontrakt, sekcja 12.4; wzory P15-04…P15-08).
// Właściciel: u14. Teksty: teksty.ViewCaseDetails.sekcjaStatusWnioskuZus.
import { useMemo } from 'react';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { SPRAWA_WNIOSKU_ZUS, wniosekZusSprawy, wyplatyPrzySprawie, type WyplatyPrzySprawie } from '@/domena/plan/kroki/statusy-zus';
import type { DaneDrugiegoRodzicaZKonta, DaneZKontaZus, PozycjaPlanu, WniosekZus } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Kwota } from '@/komponenty/kwota';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Znaczek } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaStatusWnioskuZus;

function czyKopia(d: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null): d is DaneZKontaZus {
  return d !== null && 'wnioski' in d;
}

const SPRAWY_ZUS = new Set(Object.values(SPRAWA_WNIOSKU_ZUS));

export interface SprawaZus {
  wniosek: WniosekZus | null;
  kopia: DaneZKontaZus | null;
  wyplaty: WyplatyPrzySprawie;
  odmowa: boolean;
}

/** Wniosek w ZUS i wypłaty sprawy K08, K12, K13 albo K18 z kopii matki albo drugiego rodzica. */
export function useSprawaZus(sprawa: PozycjaPlanu, kontekst: KontekstRodziny): SprawaZus | null {
  return useMemo(() => {
    const id = sprawa.idPozycji ?? sprawa.idSprawy;
    if (!SPRAWY_ZUS.has(id)) return null;
    const kopie = [kontekst.daneZusMatki, kontekst.daneZusDrugiegoRodzica, kontekst.daneZusKonta].filter(czyKopia);
    for (const kopia of kopie) {
      const wniosek = wniosekZusSprawy(sprawa, kopia);
      if (wniosek) {
        return {
          wniosek,
          kopia,
          wyplaty: wyplatyPrzySprawie(sprawa, kopia, kontekst.dzis),
          odmowa: sprawa.oznaczenia.includes('odmowa-zus'),
        };
      }
    }
    const kopia = kopie[0] ?? null;
    return { wniosek: null, kopia, wyplaty: wyplatyPrzySprawie(sprawa, kopia, kontekst.dzis), odmowa: false };
  }, [sprawa, kontekst.daneZusMatki, kontekst.daneZusDrugiegoRodzica, kontekst.daneZusKonta, kontekst.dzis]);
}

export function SekcjaStatusWnioskuZus({ sprawa, kontekst }: PropsSlotu<'sekcja'>) {
  const zus = useSprawaZus(sprawa, kontekst);
  if (!zus) return null;
  const { wniosek, wyplaty, odmowa, kopia } = zus;
  const id = sprawa.idPozycji ?? sprawa.idSprawy;
  const zDanychZus = wniosek !== null && sprawa.zrodloStatusu === 'dane-zus';
  const tytulSprawy = kontekst.katalog.pozycje.find((p) => p.id === id)?.tytul ?? id;
  const brak = t.brakWartosci;
  const zakonczony = wniosek?.status === 'przyznanie' || wniosek?.status === 'odmowa';

  const kartaWniosku = (
    <Karta tytul={t.tytul}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {odmowa ? <Znaczek>{teksty.ViewFamilyPlan.statusWnioskuZus.odmowa}</Znaczek> : null}
          <span className="text-small text-ink-muted">{zDanychZus ? t.zrodloZus : t.zrodloRodzica}</span>
        </div>
        {!zDanychZus && sprawa.status === 'zlozona' ? <p className="m-0">{t.brakWnioskuOpis({ tytul: tytulSprawy })}</p> : null}
        <ListaDefinicji
          pozycje={[
            { etykieta: t.statusWZus, wartosc: zDanychZus && wniosek ? t.statusy[wniosek.status] : brak },
            { etykieta: t.dataZlozenia, wartosc: zDanychZus && wniosek ? formatujDate(wniosek.dataZlozenia) : brak },
            { etykieta: t.kanal, wartosc: zDanychZus && wniosek ? t.kanaly[wniosek.kanal] : brak },
            ...(zDanychZus && wniosek && !zakonczony && wniosek.planowyTerminZalatwienia
              ? [{ etykieta: t.planowyTermin, wartosc: formatujDate(wniosek.planowyTerminZalatwienia) }]
              : []),
          ]}
        />
      </div>
    </Karta>
  );

  const kartaOdmowy =
    odmowa && wniosek ? (
      <Karta tytul={t.odmowaTytul}>
        <div className="flex flex-col gap-4">
          <p className="m-0">{t.odmowaOpis({ data: formatujDate(wniosek.dataZlozenia) })}</p>
          <p className="m-0">{t.odmowaWskazowka}</p>
          <div className="flex flex-wrap gap-4">
            <PrzyciskLink href={trasy.ViewEzusApplicationDetails({ idWniosku: wniosek.idWniosku })} wariant="glowny" nowaKarta>
              {t.zobaczOdpowiedz}
            </PrzyciskLink>
          </div>
        </div>
      </Karta>
    ) : null;

  const stanNa = kopia ? t.stanNa({ data: formatujDate(kopia.odczytano) }) : null;
  let kartaWyplaty = null;
  if (id === 'K08') {
    const ostatnia = wyplaty.wyplacone[0];
    kartaWyplaty = (
      <Karta tytul={t.ostatniaTytul}>
        {ostatnia ? (
          <div className="flex flex-col gap-4">
            {stanNa ? <p className="m-0 text-small text-ink-muted">{stanNa}</p> : null}
            <Kwota etykieta={t.zasilekMacierzynski} kwota={ostatnia.kwota} />
            <ListaDefinicji
              pozycje={[
                { etykieta: t.dataWyplaty, wartosc: formatujDate(ostatnia.dataWyplaty) },
                { etykieta: t.sposobWyplaty, wartosc: t.sposoby[ostatnia.sposobWyplaty] },
              ]}
            />
          </div>
        ) : (
          <StanPusty ikona="pieniadze" przerywany>
            <p className="m-0">{t.brakWyplatyOstatniej}</p>
          </StanPusty>
        )}
      </Karta>
    );
  } else if (id === 'K12' || id === 'K18') {
    const najblizsza = wyplaty.planowane[0];
    kartaWyplaty = (
      <Karta tytul={t.najblizszaTytul}>
        {najblizsza && sprawa.status === 'zalatwiona' ? (
          <div className="flex flex-col gap-4">
            {stanNa ? <p className="m-0 text-small text-ink-muted">{stanNa}</p> : null}
            <Kwota etykieta={t.swiadczenia[najblizsza.rodzaj]} kwota={najblizsza.kwota} />
            <ListaDefinicji pozycje={[{ etykieta: t.planowanyTermin, wartosc: formatujDate(najblizsza.planowanyTerminWyplaty) }]} />
          </div>
        ) : (
          <StanPusty ikona="pieniadze" przerywany>
            <p className="m-0">{t.brakWyplatyNajblizszej}</p>
          </StanPusty>
        )}
      </Karta>
    );
  }

  return (
    <div className="flex flex-col gap-7.5">
      {kartaWniosku}
      {kartaOdmowy}
      {kartaWyplaty}
    </div>
  );
}
