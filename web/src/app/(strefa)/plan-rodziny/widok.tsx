'use client';

// ViewFamilyPlan: strona główna Rodzica i Drugiego rodzica (historyjki 3.6.1.2.1, 3.6.1.3.1, 3.6.1.4.1,
// wzory Plan-rodziny, P06-04 … P06-13). Nagłówek ma akcję „Zgłoś narodziny” do potwierdzenia daty porodu. Pulpit
// pokazuje kolejno: okno nowego dziecka, Twoją ścieżkę z etapami obok trzech najbliższych terminów i karty
// Sytuacje szczególne oraz zmiany w planie. Dane, z których powstał plan, pokazuje Profil rodziny.
// Obok „Zgłoś narodziny” Rodzic bez dołączonego drugiego rodzica ma akcję „Dodaj drugiego rodzica”, która prowadzi
// do zakładki Drugi rodzic w Profilu rodziny z zaproszeniem i pełnomocnictwem (3.3.3.1.1).
// Sprawy etapów z blokiem strażnika ubezpieczenia chorobowego pokazuje strona etapu ViewFamilyPlanStage.
// Właściciel: u12.
import { useKontekstRodziny, useStanKonta } from '@/dane/magazyn/hooki';
import { wyznaczBiezacyEtap } from '@/domena/plan/etap';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { KartaSciezki, KartaSytuacjiSzczegolnych, KartaTerminow, KartaZmian } from './_czesci/karty-planu';
import { useOcenaStraznika } from './_czesci/ocena-straznika';
import { adresDodaniaDrugiegoRodzica, czyDodanieDrugiegoRodzicaDostepne } from './_czesci/zaproszenie-drugiego-rodzica';
import { slotyNadPlanem } from './_sloty';
import { czyZgloszenieNarodzinDostepne } from './_sloty/akcja-zglos-narodziny';

const t = teksty.ViewFamilyPlan;

export function WidokPlanuRodziny() {
  const kontekst = useKontekstRodziny();
  const ocena = useOcenaStraznika(kontekst);
  const odczytZusTrwa = useStanKonta()?.stanOdczytuZus?.stan === 'trwa';

  // Plan czeka na koniec odczytu Danych z konta ZUS, z których wynikają statusy i terminy spraw.
  if (odczytZusTrwa) return <SzkieletWidoku />;

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
  const zglosNarodziny = czyZgloszenieNarodzinDostepne(kontekst);
  const dodajDrugiego = czyDodanieDrugiegoRodzicaDostepne(kontekst);

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        stanNa={dzis}
        powrot={false}
        akcje={
          zglosNarodziny || dodajDrugiego ? (
            <>
              {zglosNarodziny ? (
                <PrzyciskLink wariant="glowny" href={sciezkaWidoku('ViewBirthDate', { tryb: 'pakiet' })}>
                  {t.akcjaZglosNarodziny.zglos}
                </PrzyciskLink>
              ) : null}
              {dodajDrugiego ? (
                <PrzyciskLink wariant="drugorzedny" ikona="dodaj-osobe" href={adresDodaniaDrugiegoRodzica}>
                  {t.dodajDrugiegoRodzica}
                </PrzyciskLink>
              ) : null}
            </>
          ) : undefined
        }
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
            boczna={
              <Stos odstep={7.5}>
                <KartaTerminow kontekst={kontekst} ocena={ocena} />
                <KartaSytuacjiSzczegolnych kontekst={kontekst} />
              </Stos>
            }
          />
        )}
        {plan === null ? null : <KartaZmian kontekst={kontekst} />}
      </Stos>
    </>
  );
}
