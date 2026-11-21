'use client';

// Lista słownika podmiotów wsparcia na ViewCatalogSupportOrganizations (wzory cz2/Podmioty-wsparcia, cz2/P18-20). Właściciel: u22.
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import { organizacjeDlaSytuacji } from '@/domena/przewodnik/ryzyka';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';

const tekst = teksty.ViewCatalogSupportOrganizations;
const etykietySytuacji = teksty.ViewSupportOrganizations.sytuacje;

type Kolumna = 'organizacja' | 'sytuacje' | 'kontakt' | 'akcje';

export function ListaPodmiotowWsparcia() {
  const katalog = useKatalog();
  const dzis = useDzis();
  const podmioty = organizacjeDlaSytuacji(katalog);

  return (
    <>
      <NaglowekStrony
        tytul={tekst.tytulyTrybow.lista}
        stanNa={dzis}
        wstep={tekst.wstep}
        powrot={false}
        akcje={
          <PrzyciskLink href={sciezkaWidoku('ViewCatalogSupportOrganizations', { tryb: 'nowa' })} wariant="glowny" ikona="plus">
            {tekst.dodaj}
          </PrzyciskLink>
        }
      />
      <Karta tytul={tekst.slownik} bezLinii className="max-w-tresc">
        <p className="m-0 mb-4 text-body">
          {tekst.licznik} <strong>{podmioty.length}</strong>
        </p>
        <Tabela<Kolumna>
          podpis={tekst.slownik}
          etykietaPrzewijania={tekst.przewijanie}
          kolumny={[
            { klucz: 'organizacja', naglowek: tekst.kolumny.organizacja },
            { klucz: 'sytuacje', naglowek: tekst.kolumny.sytuacje },
            { klucz: 'kontakt', naglowek: tekst.kolumny.kontakt },
            { klucz: 'akcje', naglowek: tekst.kolumny.akcje, ukryjNaglowek: true },
          ]}
          wiersze={podmioty.map((p) => ({
            id: p.id,
            organizacja: (
              <>
                <span className="block text-body-strong text-ink-strong">{p.nazwa}</span>
                {p.zakresPomocy}
              </>
            ),
            sytuacje: (
              <ul className="m-0 pl-5">
                {p.sytuacje.map((s) => (
                  <li key={s}>{etykietySytuacji[s]}</li>
                ))}
              </ul>
            ),
            kontakt: (
              <span className="block [overflow-wrap:anywhere]">
                {tekst.telefon({ wartosc: p.telefon ?? tekst.brakWartosci })}
                <br />
                {tekst.email({ wartosc: p.email ?? tekst.brakWartosci })}
                <br />
                {tekst.strona({ wartosc: p.adresStrony })}
              </span>
            ),
            akcje: (
              <Odnosnik href={sciezkaWidoku('ViewCatalogSupportOrganizations', { tryb: 'edycja', idOrganizacji: p.id })}>
                {tekst.zmien}
                <span className="sr-only">{tekst.zmienDane({ nazwa: p.nazwa })}</span>
              </Odnosnik>
            ),
          }))}
        />
        <Notatka className="mt-6">
          <p className="m-0">{tekst.notatka}</p>
        </Notatka>
      </Karta>
    </>
  );
}
