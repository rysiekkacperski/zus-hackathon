'use client';

// Slot ViewFamilyPlan „akcja-sytuacja-szczegolna” (kontrakt, sekcja 12.4). Właściciel: u25.
// Karta „Coś zmieniło się w ciąży albo po porodzie?” z przykładami sytuacji szczególnych i akcją zapisania
// (wzór P22-01) albo w spokojnym trybie karta „Spokojny tryb”, którą pulpit pokazuje w prawej kolumnie,
// z datą włączenia i przejściem do ViewSpecialSituation (wzory P22-04, P22-12). Role Rodzic i Drugi rodzic.
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useOsobySytuacji } from '@/app/(strefa)/sytuacja-szczegolna/_czesci/osoby';
import { formatujDate } from '@/domena/daty';
import { czySpokojnyTryb } from '@/domena/rodzina/sytuacje';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewFamilyPlan.akcjaSytuacjaSzczegolna;

export function SlotAkcjaSytuacjaSzczegolna({ kontekst }: PropsSlotu<'akcje'>) {
  const osoby = useOsobySytuacji(kontekst);
  if (kontekst.rola !== 'rodzic' && kontekst.rola !== 'drugi-rodzic') return null;
  const daneCiazy = kontekst.rodzina.daneCiazy;

  if (czySpokojnyTryb(daneCiazy) && daneCiazy) {
    const od = daneCiazy.spokojnyTryb.od;
    const bezPrzypomnien = (kontekst.rodzina.plan?.pozycje ?? []).some((p) => p.bezPrzypomnien);
    return (
      <Karta tytul={t.tytulTrybu} poziomTytulu={3} bezLinii className="flex flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {od ? (
            <p className="m-0">
              {osoby.innyRodzicDopelniacz
                ? t.wlaczonyOd({ data: formatujDate(od), osoba: osoby.innyRodzicDopelniacz })
                : t.wlaczonyOdDlaRodziny({ data: formatujDate(od) })}
            </p>
          ) : null}
          <p className="m-0">{bezPrzypomnien ? t.opisBezPrzypomnien : t.opisZPrzypomnieniami}</p>
          <div className="mt-auto">
            <PrzyciskLink href={trasy.ViewSpecialSituation()} wariant="drugorzedny" szerokosc="pelna">
              {t.akcjaTrybu}
            </PrzyciskLink>
          </div>
        </div>
      </Karta>
    );
  }

  return (
    <Karta tytul={t.tytul} poziomTytulu={3} bezLinii className="flex flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="m-0">{t.opis}</p>
        <p className="m-0 text-small text-ink-muted">{t.dopowiedzenie}</p>
        <div className="mt-auto">
          <PrzyciskLink href={trasy.ViewSpecialSituation()} wariant="drugorzedny" szerokosc="pelna">
            {t.akcja}
          </PrzyciskLink>
        </div>
      </div>
    </Karta>
  );
}
