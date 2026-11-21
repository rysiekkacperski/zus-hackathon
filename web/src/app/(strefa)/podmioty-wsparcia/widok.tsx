'use client';

// ViewSupportOrganizations (kontrakt, tabela 2.2). Właściciel: u22. Wzory: cz2/P18-15, cz2/P18-16.
// Lista organizacji ze słownika podmiotów wsparcia dla sytuacji szczególnej z parametru ?sytuacja= albo z profilu rodziny,
// z filtrem sytuacji, licznikiem, kontaktem (tel:, mailto:, strona w nowej karcie) i powrotem do sprawy (?powrot=).
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useDzis, useKatalog, useRodzina } from '@/dane/magazyn/hooki';
import {
  SYTUACJE_SZCZEGOLNE,
  adresTelefonu,
  czySytuacjaSzczegolna,
  listaOrganizacji,
  tekstAdresuStrony,
} from '@/domena/przewodnik/ryzyka';
import type { Katalog, PodmiotWsparcia, RodzajSytuacjiSzczegolnej } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { dopasujTrase } from '@/komponenty/rama/mapa-tras';
import { bezpiecznyPowrot } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewSupportOrganizations;
const PROFIL = 'profil';
type WyborSytuacji = RodzajSytuacjiSzczegolnej | typeof PROFIL;

const klasyOdnosnika = 'inline-flex items-center gap-2 font-semibold text-brand no-underline hover:underline';

function sytuacjeZParametru(wartosc: string | null): RodzajSytuacjiSzczegolnej[] {
  if (wartosc === null) return [];
  return wartosc.split(',').filter(czySytuacjaSzczegolna);
}

function etykietaPowrotu(sciezka: string, katalog: Katalog): string | undefined {
  const dopasowanie = dopasujTrase(sciezka.split('?')[0]);
  if (dopasowanie?.wpis.widok !== 'ViewCaseDetails') return undefined;
  const idSprawy = String(dopasowanie.parametry.idSprawy ?? '');
  const idPozycji = idSprawy.split('-')[0];
  return katalog.pozycje.find((p) => p.id === idPozycji)?.tytul;
}

function KartaOrganizacji({ podmiot, indeks }: { podmiot: PodmiotWsparcia; indeks: number }) {
  const idTytulu = `organizacja-${indeks}`;
  return (
    <article aria-labelledby={idTytulu} className="box-border min-w-0 flex-[1_1_26.25rem] rounded-sm bg-surface-card p-5">
      <h2 id={idTytulu} className="m-0 text-tile-title text-ink-strong">
        {podmiot.nazwa}
      </h2>
      <p className="m-0 mt-2 text-body">{podmiot.zakresPomocy}</p>
      <ul className="m-0 mt-4 grid list-none gap-3 border-t border-line-row p-0 pt-4">
        {podmiot.telefon ? (
          <li>
            <a href={adresTelefonu(podmiot.telefon)} className={klasyOdnosnika}>
              <Ikona nazwa="telefon" rozmiar={20} />
              {tekst.zadzwon({ numer: podmiot.telefon })}
            </a>
          </li>
        ) : null}
        {podmiot.email ? (
          <li>
            <a href={`mailto:${podmiot.email}`} className={`${klasyOdnosnika} [overflow-wrap:anywhere]`}>
              <Ikona nazwa="email" rozmiar={20} />
              <span className="min-w-0">{tekst.napisz({ adres: podmiot.email })}</span>
            </a>
          </li>
        ) : null}
        <li>
          <a href={podmiot.adresStrony} target="_blank" rel="noopener noreferrer" className={`${klasyOdnosnika} [overflow-wrap:anywhere]`}>
            <Ikona nazwa="strona-www" rozmiar={20} />
            <span className="min-w-0">{tekst.otworzStrone({ adres: tekstAdresuStrony(podmiot.adresStrony) })}</span>
            <span className="sr-only">{` ${teksty.wspolne.otwieraSieWNowejKarcie}`}</span>
          </a>
        </li>
      </ul>
    </article>
  );
}

export function WidokPodmiotowWsparcia() {
  const parametry = useSearchParams();
  const katalog = useKatalog();
  const rodzina = useRodzina();
  const dzis = useDzis();

  const zParametru = sytuacjeZParametru(parametry.get('sytuacja'));
  const zProfilu = (rodzina?.daneCiazy?.sytuacjeSzczegolne ?? [])
    .map((s) => s.rodzaj)
    .filter((r, i, wszystkie) => wszystkie.indexOf(r) === i);
  const zestaw = zParametru.length > 0 ? zParametru : zProfilu;
  const [wybor, setWybor] = useState<WyborSytuacji | ''>(() =>
    zestaw.length > 1 ? PROFIL : (zestaw[0] ?? ''),
  );

  const sytuacjeListy: RodzajSytuacjiSzczegolnej[] =
    wybor === PROFIL ? zestaw : wybor === '' ? [] : [wybor];
  const { organizacje, kod } = listaOrganizacji(katalog, sytuacjeListy);

  const powrot = bezpiecznyPowrot(parametry.get('powrot'));
  const etykieta = powrot ? etykietaPowrotu(powrot, katalog) : undefined;

  function zmienSytuacje(w: WyborSytuacji | '') {
    setWybor(w);
    const adres = new URL(window.location.href);
    const wartosc = w === PROFIL ? zestaw.join(',') : w;
    if (wartosc === '') adres.searchParams.delete('sytuacja');
    else adres.searchParams.set('sytuacja', wartosc);
    window.history.replaceState(null, '', `${adres.pathname}${adres.search}`);
  }

  const opcje = [
    ...(zestaw.length > 1 ? [{ wartosc: PROFIL as WyborSytuacji, etykieta: tekst.sytuacjeZProfilu }] : []),
    ...SYTUACJE_SZCZEGOLNE.map((s) => ({ wartosc: s as WyborSytuacji, etykieta: tekst.sytuacje[s] })),
  ];

  return (
    <>
      <NaglowekStrony
        tytul={tekst.naglowek}
        stanNa={dzis}
        powrot={powrot ? { href: powrot, ...(etykieta ? { etykieta } : {}) } : undefined}
      />
      <div className="flex max-w-tresc flex-col gap-7.5">
        <section aria-label={tekst.wyborSytuacji} className="box-border min-w-0 rounded-sm bg-surface-card p-5">
          <div className="max-w-120">
            <PoleWyboru<WyborSytuacji>
              id="sytuacja"
              etykieta={tekst.poleSytuacji}
              opcje={opcje}
              wartosc={wybor}
              onZmiana={zmienSytuacje}
            />
          </div>
          <p className="m-0 mt-4 text-body" aria-live="polite">
            {tekst.licznik} <strong>{organizacje.length}</strong>
          </p>
        </section>
        {kod ? <Komunikat kod={kod} /> : null}
        <div id="lista-organizacji" aria-label={tekst.listaOrganizacji} role="region" className="flex flex-wrap items-stretch gap-7.5">
          {organizacje.map((p, i) => (
            <KartaOrganizacji key={p.id} podmiot={p} indeks={i + 1} />
          ))}
          {organizacje.length % 2 === 1 ? <div aria-hidden="true" className="min-w-0 flex-[1_1_26.25rem]" /> : null}
        </div>
        {powrot ? (
          <div>
            <PrzyciskLink href={powrot} wariant="drugorzedny">
              {tekst.wrocDoSprawy}
            </PrzyciskLink>
          </div>
        ) : null}
      </div>
    </>
  );
}
