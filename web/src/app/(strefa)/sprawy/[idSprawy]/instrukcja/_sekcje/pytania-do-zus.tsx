'use client';

// Sekcja ViewCaseGuide „pytania-do-zus” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u29.
// Karta „Pytania do ZUS”: akcje pytania i podglądu danych konta oraz lista pytań w sprawie (3.8.2.1.1, 3.8.2.2.1).
import { useMemo } from 'react';
import { useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { pytaniaWSprawie, scalPytania } from '@/domena/pytania-zus/odpowiedzi';
import { formatujDateICzas } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaPytaniaDoZus;

export function SekcjaPytaniaDoZus({ sprawa, kontekst }: PropsSlotu<'akcja'>) {
  const pesel = kontekst.konto.pesel;
  const stanZus = useStanSymulowanegoZus(pesel);
  const pytania = useMemo(
    () =>
      pytaniaWSprawie(
        scalPytania(kontekst.daneZusKonta?.korespondencja, stanZus?.korespondencja).filter((p) => p.peselNadawcy === pesel),
        sprawa.idSprawy,
      ),
    [kontekst.daneZusKonta, stanZus, pesel, sprawa.idSprawy],
  );

  return (
    <Karta tytul={t.tytul} bezLinii>
      <Stos odstep={6}>
        <p className="m-0 text-body">{t.opis}</p>
        <Wiersz>
          <PrzyciskLink href={trasy.ViewZusQuestion({ sprawa: sprawa.idSprawy })} wariant="drugorzedny">
            {t.zadajPytanie}
          </PrzyciskLink>
          <PrzyciskLink href={trasy.ViewZusAccountData({ sprawa: sprawa.idSprawy })} wariant="drugorzedny">
            {t.zobaczDane}
          </PrzyciskLink>
        </Wiersz>
        <section className="grid gap-3">
          <h3 className="m-0 text-body-strong text-ink">{t.lista}</h3>
          {pytania.length === 0 ? (
            <p className="m-0 text-body">{t.pustaLista}</p>
          ) : (
            <Tabela
              podpis={t.podpisListy}
              etykietaPrzewijania={t.przewijanie}
              kolumny={[
                { klucz: 'pytanie', naglowek: t.kolumny.pytanie, tytulowa: true },
                { klucz: 'wyslano', naglowek: t.kolumny.wyslano },
                { klucz: 'status', naglowek: t.kolumny.status },
              ]}
              wiersze={pytania.map((p) => ({
                id: p.idPytania,
                pytanie: (
                  <Odnosnik href={trasy.ViewZusQuestionSent({ idPytania: p.idPytania })}>
                    <span className="line-clamp-2 break-words">{p.tresc}</span>
                  </Odnosnik>
                ),
                wyslano: formatujDateICzas(p.wyslano),
                status: t.statusy[p.status],
              }))}
            />
          )}
        </section>
      </Stos>
    </Karta>
  );
}
