'use client';

// Sekcja ViewCaseDetails „wsparcie-k35” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u22.
// Akcja otwarcia listy organizacji ViewSupportOrganizations dla sytuacji szczególnej z profilu (wzór cz2/P18-14).
import type { RodzajSytuacjiSzczegolnej } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const tekst = teksty.ViewCaseDetails.sekcjaWsparcieK35;
const etykietySytuacji = teksty.ViewSupportOrganizations.sytuacje;

export function SekcjaWsparcieK35({ sprawa, kontekst, pochodzenie }: PropsSlotu<'sekcja'>) {
  if (sprawa.idPozycji !== 'K35') return null;
  const daneCiazy = kontekst.rodzina.daneCiazy;
  const sytuacje = daneCiazy?.sytuacjeSzczegolne ?? [];
  const rodzaje = sytuacje
    .map((s) => s.rodzaj)
    .filter((r, i, wszystkie): r is RodzajSytuacjiSzczegolnej => wszystkie.indexOf(r) === i);
  const powrot = sciezkaWidoku('ViewCaseDetails', { idSprawy: sprawa.idSprawy, z: pochodzenie });
  const adresListy = sciezkaWidoku('ViewSupportOrganizations', {
    sytuacja: rodzaje.length > 0 ? rodzaje.join(',') : undefined,
    powrot,
  });
  const opis = rodzaje.length === 1 ? tekst.opis({ sytuacja: tekst.sytuacjeWOpisie[rodzaje[0]] }) : tekst.opisOgolny;
  const ostatnia = sytuacje.at(-1);
  const dataPorodu = daneCiazy?.dataPoroduPotwierdzona ? daneCiazy.dataPorodu : undefined;

  return (
    <Stos odstep={7.5}>
      <Karta tytul={tekst.tytul} bezLinii>
        <p className="m-0 text-body">{opis}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <PrzyciskLink href={adresListy} wariant="glowny" ikona="serce">
            {tekst.zobaczOrganizacje}
          </PrzyciskLink>
        </div>
      </Karta>
      {rodzaje.length > 0 ? (
        <Karta tytul={tekst.sytuacjaWProfilu} bezLinii>
          <dl className="m-0">
            <dt className="text-body-strong">{tekst.rodzajSytuacji}</dt>
            <dd className="m-0 mb-3 text-body text-ink-strong">{rodzaje.map((r) => etykietySytuacji[r]).join(', ')}</dd>
            {dataPorodu ? (
              <>
                <dt className="text-body-strong">{tekst.dataPorodu}</dt>
                <dd className="m-0 text-body text-ink-strong">{formatujDate(dataPorodu)}</dd>
              </>
            ) : ostatnia ? (
              <>
                <dt className="text-body-strong">{tekst.dataZdarzenia}</dt>
                <dd className="m-0 text-body text-ink-strong">{formatujDate(ostatnia.dataZdarzenia)}</dd>
              </>
            ) : null}
          </dl>
        </Karta>
      ) : null}
    </Stos>
  );
}
