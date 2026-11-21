'use client';

// Elementy ekranu ViewPregnancyBenefits ze wzorów cz1/P05-01 … P05-14: kafelki danych (dl), lista dokumentów
// z adresatem i terminem oraz etykieta wyniku ustalenia prawa. Właściciel: u16.
import type React from 'react';
import type { WpisSlownikaDokumentow, WynikUstaleniaPrawa } from '@/domena/typy';
import { teksty } from '@/teksty';

const T = teksty.ViewPregnancyBenefits;

export interface KafelekDanych {
  etykieta: string;
  wartosc: React.ReactNode;
  dopisek?: React.ReactNode;
}

/** Kafelki dl ze wzoru: tło surface-page, etykieta small-strong, wartość body-strong. */
export function KafelkiDanych({ kafelki, szerokosc = 'srednia', className }: { kafelki: KafelekDanych[]; szerokosc?: 'srednia' | 'waska'; className?: string }) {
  const klasyKafelka = szerokosc === 'waska' ? 'grow basis-45 min-w-0' : 'grow basis-50 min-w-0';
  return (
    <dl className={['m-0 flex flex-wrap gap-3', className].filter(Boolean).join(' ')}>
      {kafelki.map((k) => (
        <div key={k.etykieta} className={`${klasyKafelka} rounded-sm bg-surface-page px-4 py-3`}>
          <dt className="text-small-strong">{k.etykieta}</dt>
          <dd className="m-0 mt-1 text-body-strong text-ink-strong">{k.wartosc}</dd>
          {k.dopisek ? <dd className="m-0 mt-1 text-small">{k.dopisek}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

/** Podsekcja „Dokumenty i miejsce złożenia” z listą dokumentów, adresatem i terminem z wpisów słownika. */
export function DokumentyWpisow({ wpisy, wstep, naglowekId }: { wpisy: WpisSlownikaDokumentow[]; wstep?: string; naglowekId: string }) {
  const dokumenty = wpisy.flatMap((w) => w.dokumenty);
  const adresat = wpisy[0]?.adresat;
  const termin = wpisy[0]?.termin;
  return (
    <>
      {wstep ? <p className="m-0 mb-4 text-body">{wstep}</p> : null}
      <div className="flex flex-wrap gap-6">
        <ul aria-labelledby={naglowekId} className="m-0 flex min-w-0 grow-2 basis-105 list-none flex-col gap-3 p-0">
          {dokumenty.map((d) => (
            <li key={d} className="flex items-start gap-3 before:mt-2.5 before:size-1.5 before:shrink-0 before:rounded-full before:bg-brand before:content-['']">
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <dl className="m-0 flex min-w-0 grow basis-65 flex-col gap-3">
          {adresat ? (
            <div className="rounded-sm bg-surface-page px-4 py-3">
              <dt className="text-small-strong">{T.adresat}</dt>
              <dd className="m-0 mt-1">{adresat}</dd>
            </div>
          ) : null}
          {termin ? (
            <div className="rounded-sm bg-surface-page px-4 py-3">
              <dt className="text-small-strong">{T.termin}</dt>
              <dd className="m-0 mt-1">{termin}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </>
  );
}

/** Ramka podsekcji dokumentów z linią nad nią, jak na wzorze. */
export function SekcjaDokumentow({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-line-row pt-6">
      <h3 id={id} className="m-0 mb-4 text-body-strong">{T.dokumentyNaglowek}</h3>
      {children}
    </div>
  );
}

export interface OpcjeEtykiety {
  bezZgody?: boolean;
  warunekSkladek?: boolean;
  drugiRodzic?: boolean;
}

/** Etykieta wyniku ustalenia prawa wyświetlana jako p.body-strong na karcie świadczenia. */
export function etykietaWyniku(wynik: WynikUstaleniaPrawa, o: OpcjeEtykiety = {}): string {
  if (wynik.postac === 'nie-przysluguje' && wynik.przyczyna) return T.wyniki.nie[wynik.przyczyna.rodzaj];
  if (wynik.postac === 'warunek') {
    return o.bezZgody && wynik.swiadczenie !== 'zasilek-chorobowy' ? T.wyniki.bezWyliczenia : T.wyniki.zaleznyOdWarunku;
  }
  if (wynik.swiadczenie === 'swiadczenie-rehabilitacyjne') return T.wyniki.przyslugujePoOrzeczeniu;
  if (o.warunekSkladek) return o.drugiRodzic ? T.wyniki.przyslugujeWarunekSkladekMatki : T.wyniki.przyslugujeWarunekSkladek;
  return T.wyniki.przysluguje;
}
