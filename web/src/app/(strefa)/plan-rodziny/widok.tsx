'use client';

// Ekran zastępczy ViewFamilyPlan z podstawowym działaniem (kontrakt 2.4). Właściciel: u12.
// Surowa lista plan.pozycje rodziny zalogowanego konta (identyfikator sprawy, tytuł z katalogu, status)
// z rejestrami slotów z sekcji 12.4, żeby właściciele slotów widzieli je na gospodarzu przed u12.
import { useKatalog, useKontekstRodziny, useRodzina } from '@/dane/magazyn/hooki';
import { formatujDateICzas } from '@/domena/daty';
import type { Katalog, PozycjaPlanu } from '@/domena/typy';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { StatusSprawy } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import { slotyNadPlanem, slotyNaglowka, slotyPrzySprawie } from './_sloty';

const tekst = teksty.wspolne.ekranZastepczy;

function tytulPozycji(katalog: Katalog, sprawa: PozycjaPlanu): string {
  return katalog.pozycje.find((p) => p.id === sprawa.idPozycji)?.tytul ?? sprawa.idSprawy;
}

export function WidokPlanuRodziny() {
  const rodzina = useRodzina();
  const kontekst = useKontekstRodziny();
  const katalog = useKatalog();
  const plan = rodzina?.plan ?? null;
  const terminy = rodzina?.kalendarz?.terminy ?? [];

  return (
    <>
      <NaglowekStrony
        tytul={teksty.ViewFamilyPlan.naglowek}
        akcje={
          kontekst ? (
            <>
              {slotyNaglowka.map(({ id, Komponent }) => (
                <Komponent key={id} kontekst={kontekst} />
              ))}
            </>
          ) : undefined
        }
      />
      <Stos odstep={7.5}>
        <Notatka>
          <p>{tekst.dzialajacy({ jednostka: 'u12' })}</p>
        </Notatka>
        {kontekst
          ? slotyNadPlanem.map(({ id, Komponent }) => <Komponent key={id} kontekst={kontekst} />)
          : null}
        {plan === null ? (
          <StanPusty ikona="plan">{tekst.plan.brakRodziny}</StanPusty>
        ) : (
          <section aria-labelledby="plan-pozycje" className="flex flex-col gap-4">
            <h2 id="plan-pozycje" className="m-0 text-section-title text-ink">
              {tekst.plan.podpis}
            </h2>
            <p className="m-0 text-small text-ink-muted">
              {tekst.plan.wyliczono({ data: formatujDateICzas(plan.wyliczono) })}
            </p>
            {plan.pozycje.length === 0 ? (
              <StanPusty ikona="plan" przerywany>
                {tekst.plan.brakPozycji}
              </StanPusty>
            ) : (
              <Stos as="ul" odstep={3} className="m-0 list-none p-0">
                {plan.pozycje.map((sprawa) => (
                  <li key={sprawa.idSprawy} className="flex flex-col gap-2 rounded-sm bg-surface-card p-5">
                    <Wiersz odstep={4} className="flex-wrap justify-between">
                      <Odnosnik
                        href={sciezkaWidoku('ViewCaseDetails', { idSprawy: sprawa.idSprawy })}
                        pochodzenie="plan"
                      >
                        {`${sprawa.idSprawy}: ${tytulPozycji(katalog, sprawa)}`}
                      </Odnosnik>
                      <StatusSprawy status={sprawa.status} zrodlo={sprawa.zrodloStatusu} data={sprawa.dataOznaczenia} />
                    </Wiersz>
                    {kontekst
                      ? slotyPrzySprawie.map(({ id, Komponent }) => (
                          <Komponent
                            key={id}
                            sprawa={sprawa}
                            termin={terminy.find((t) => t.idSprawy === sprawa.idSprawy)}
                            kontekst={kontekst}
                            pochodzenie="plan"
                          />
                        ))
                      : null}
                  </li>
                ))}
              </Stos>
            )}
          </section>
        )}
      </Stos>
    </>
  );
}
