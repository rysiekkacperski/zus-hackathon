'use client';

// ViewFamilyPlan: strona główna Rodzica i Drugiego rodzica (historyjki 3.6.1.2.1, 3.6.1.3.1, 3.6.1.4.1,
// wzory Plan-rodziny, P06-04 … P06-13). Pulpit pokazuje kolejno: okno nowego dziecka, Twoją ścieżkę z etapami
// i najbliższe terminy, akcje „Co możesz zrobić”, zmiany w planie, skróty i dane, z których powstał plan.
// Sprawy etapów z blokiem strażnika ubezpieczenia chorobowego pokazuje strona etapu ViewFamilyPlanStage.
// Właściciel: u12.
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { wyznaczBiezacyEtap } from '@/domena/plan/etap';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { KartaDanychPlanu, KartaNaSkroty, KartaSciezki, KartaTerminow, KartaZmian } from './_czesci/karty-planu';
import { useOcenaStraznika } from './_czesci/ocena-straznika';
import { slotyAkcji, slotyNadPlanem } from './_sloty';

const t = teksty.ViewFamilyPlan;

export function WidokPlanuRodziny() {
  const kontekst = useKontekstRodziny();
  const ocena = useOcenaStraznika(kontekst);

  if (kontekst === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={false} />
        <StanPusty ikona="plan">{t.brakPlanu}</StanPusty>
      </>
    );
  }

  const { rodzina, dzis, stanZgody } = kontekst;
  const plan = rodzina.plan;
  const pozycje = plan?.pozycje ?? [];
  const biezacyEtap = wyznaczBiezacyEtap(rodzina.daneCiazy, dzis);
  const ostrzezeniaStraznika = ocena && kontekst.rola !== 'drugi-rodzic' ? ocena.liczbaOstrzezen : 0;

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        stanNa={dzis}
        powrot={false}
        akcje={<Odnosnik href={sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })}>{t.otworzProfil}</Odnosnik>}
      />
      <Stos odstep={7.5}>
        {stanZgody !== 'udzielona' ? (
          <Komunikat
            kod="0004"
            akcje={<Odnosnik href={sciezkaWidoku('ViewGuideSettings')}>{t.zmienDecyzjeOZgodzie}</Odnosnik>}
          />
        ) : null}
        {slotyNadPlanem.map(({ id, Komponent }) => (
          <Komponent key={id} kontekst={kontekst} />
        ))}
        {plan === null ? (
          <StanPusty ikona="plan">{t.brakPlanu}</StanPusty>
        ) : (
          <UkladDwuKolumnowy
            tresc={<KartaSciezki pozycje={pozycje} biezacyEtap={biezacyEtap} ostrzezeniaStraznika={ostrzezeniaStraznika} />}
            boczna={<KartaTerminow kontekst={kontekst} ocena={ocena} />}
          />
        )}
        <section aria-labelledby="co-mozesz-zrobic" className="flex min-w-0 flex-col gap-4">
          <h2 id="co-mozesz-zrobic" className="m-0 text-section-title text-ink">
            {t.coMozeszZrobic}
          </h2>
          <div className="grid grid-cols-1 gap-7.5 md:grid-cols-2">
            {slotyAkcji.map(({ id, Komponent }) => (
              <Komponent key={id} kontekst={kontekst} />
            ))}
          </div>
        </section>
        {plan === null ? null : (
          <>
            <KartaZmian kontekst={kontekst} />
            <KartaNaSkroty />
            <KartaDanychPlanu kontekst={kontekst} />
          </>
        )}
      </Stos>
    </>
  );
}
