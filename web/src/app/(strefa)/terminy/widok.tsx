'use client';

// Ekran zastępczy ViewDeadlines z podstawowym działaniem (kontrakt 2.4). Właściciel: u13.
// Surowa lista kalendarz.terminy rodziny zalogowanego konta z rejestrem slotów z sekcji 12.4.
import { useKontekstRodziny, useRodzina } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import type { TerminSprawy } from '@/domena/typy';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { slotyTerminow } from './_sloty';

const tekst = teksty.wspolne.ekranZastepczy.terminy;

type Kolumna = 'sprawa' | 'termin' | 'dni' | 'uwagi';

function uwagiTerminu(termin: TerminSprawy): string {
  const uwagi: string[] = [];
  if (termin.szacowany) uwagi.push(tekst.szacowany);
  if (termin.poTerminie) uwagi.push(tekst.poTerminie);
  return uwagi.join(', ');
}

export function WidokTerminow() {
  const rodzina = useRodzina();
  const kontekst = useKontekstRodziny();
  const kalendarz = rodzina?.kalendarz ?? null;

  return (
    <>
      <NaglowekStrony
        tytul={teksty.ViewDeadlines.naglowek}
        akcje={
          kontekst ? (
            <>
              {slotyTerminow.map(({ id, Komponent }) => (
                <Komponent key={id} kontekst={kontekst} />
              ))}
            </>
          ) : undefined
        }
      />
      <Stos odstep={7.5}>
        <Notatka>
          <p>{teksty.wspolne.ekranZastepczy.dzialajacy({ jednostka: 'u13' })}</p>
        </Notatka>
        {kalendarz === null ? (
          <StanPusty ikona="kalendarz">{teksty.wspolne.ekranZastepczy.plan.brakRodziny}</StanPusty>
        ) : (
          <Tabela<Kolumna>
            podpis={tekst.podpis}
            podpisWidoczny
            etykietaPrzewijania={tekst.przewijanie}
            pustaTresc={tekst.brakTerminow}
            kolumny={[
              { klucz: 'sprawa', naglowek: tekst.kolumny.sprawa, tytulowa: true },
              { klucz: 'termin', naglowek: tekst.kolumny.termin },
              { klucz: 'dni', naglowek: tekst.kolumny.dni, liczbowa: true },
              { klucz: 'uwagi', naglowek: tekst.kolumny.uwagi },
            ]}
            wiersze={kalendarz.terminy.map((termin) => ({
              id: termin.idSprawy,
              sprawa: (
                <Odnosnik href={sciezkaWidoku('ViewCaseDetails', { idSprawy: termin.idSprawy })} pochodzenie="terminy">
                  {termin.idSprawy}
                </Odnosnik>
              ),
              termin: termin.termin === null ? tekst.bezTerminu : formatujDate(termin.termin),
              dni: termin.dniDoTerminu ?? '',
              uwagi: uwagiTerminu(termin),
            }))}
          />
        )}
      </Stos>
    </>
  );
}
