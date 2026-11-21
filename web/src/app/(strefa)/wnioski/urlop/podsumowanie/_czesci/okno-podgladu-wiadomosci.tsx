'use client';

// ModalEmployerMessagePreview (kontrakt, tabela 2.3): okno modalne na ViewLeaveRequestSummary. Właściciel: u32.
// Podgląd wiadomości e-mail do pracodawcy z wnioskiem o urlop (analiza 24, sekcja 9).
import { formatujDate } from '@/domena/daty';
import type { DataISO, WniosekOUrlop } from '@/domena/typy';
import type { DaneKreatora } from '@/domena/wnioski/urlopy';
import { nazwaPlikuWniosku } from '@/domena/wnioski/urlopy';
import { zakresWniosku } from '@/domena/wnioski/wysylka-do-pracodawcy';
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const t = teksty.ModalEmployerMessagePreview;
const tf = teksty.ViewLeaveRequestForm;

export interface OknoPodgladuWiadomosciProps {
  otwarte: boolean;
  onZamknij: () => void;
  wniosek?: WniosekOUrlop;
  dane?: DaneKreatora;
  email?: string;
  dzis?: DataISO;
  trybDemonstracyjny?: boolean;
  onWyslij?: () => void;
}

export function OknoPodgladuWiadomosci({ otwarte, onZamknij, wniosek, dane, email, dzis, trybDemonstracyjny, onWyslij }: OknoPodgladuWiadomosciProps) {
  if (!wniosek || !dane || !dzis) return null;
  const rodzaj = tf.nazwyWnioskow[wniosek.podrodzaj ?? 'macierzynski-z-rodzicielskim'];
  const zakres = zakresWniosku(wniosek);
  const dolaczone = wniosek.zalaczniki.filter((z) => z.plik);
  const pozycje = [
    { etykieta: t.do, wartosc: email?.trim() || t.brakAdresu },
    { etykieta: t.temat, wartosc: t.tematWiadomosci({ rodzaj, pracownik: dane.imieINazwisko }) },
    { etykieta: t.zalaczniki, wartosc: [nazwaPlikuWniosku(wniosek.podrodzaj), ...dolaczone.map((z) => z.plik!.nazwa)].join(', ') },
  ];
  const akapity = t.trescWiadomosci({
    rodzaj: rodzaj.charAt(0).toLowerCase() + rodzaj.slice(1),
    dataZlozenia: formatujDate(dzis),
    od: zakres ? formatujDate(zakres.od) : '',
    do: zakres ? formatujDate(zakres.do) : '',
    zalaczniki: dolaczone.map((z) => tf.zalaczniki[z.id] ?? z.rodzaj).join(', '),
    emailPracownika: dane.emailPracownika ?? t.brakAdresuPracownika,
    pracownik: dane.imieINazwisko,
  });
  return (
    <OknoModalne
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={t.tytul}
      stopka={
        <div className="flex flex-wrap justify-end gap-4">
          <Przycisk wariant="drugorzedny" onClick={onZamknij}>
            {t.wroc}
          </Przycisk>
          {onWyslij ? (
            <Przycisk wariant="glowny" ikona="wyslij" onClick={onWyslij}>
              {t.wyslij}
            </Przycisk>
          ) : null}
        </div>
      }
    >
      {trybDemonstracyjny ? <FlagaDemo className="mb-4">{t.demo}</FlagaDemo> : null}
      <dl className="m-0 flex flex-col gap-3">
        {pozycje.map((p) => (
          <div key={p.etykieta} className="flex flex-wrap gap-x-4">
            <dt className="w-24 text-body-strong">{p.etykieta}</dt>
            <dd className="m-0 min-w-0 flex-1 text-ink-strong">{p.wartosc}</dd>
          </div>
        ))}
      </dl>
      <h3 className="m-0 mt-6 mb-2 text-body-strong">{t.tresc}</h3>
      <div className="flex flex-col gap-3 rounded-sm bg-surface-page px-5 py-4">
        {akapity.map((a, i) => (
          <p key={i} className="m-0">
            {a}
          </p>
        ))}
      </div>
    </OknoModalne>
  );
}
