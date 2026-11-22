'use client';

// Sekcja Pozycje katalogu na ViewCatalogList: wyszukiwarka, filtr etapu ścieżki i tabela pozycji (wzory Katalog, P04-14)
// ze stanem pozycji w planach rodzin i odnośnikiem do zmiany pozycji (ViewCatalogItemEdit).
import { useId, useMemo, useState } from 'react';
import { kotwicaPozycji } from '@/dane/magazyn/operacje/katalog';
import { ETAPY } from '@/domena/katalog/edycja';
import type { Etap, PozycjaKatalogu } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PoleWyszukiwania } from '@/komponenty/pole-wyszukiwania';
import { trasy } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';

type KolumnaPozycji = 'identyfikator' | 'sprawa' | 'rodzaj' | 'etap' | 'rodzic' | 'stan' | 'akcja';

function pasuje(pozycja: PozycjaKatalogu, fraza: string, etap: Etap | ''): boolean {
  if (etap !== '' && pozycja.etap !== etap) return false;
  if (fraza === '') return true;
  return `${pozycja.id} ${pozycja.tytul}`.toLocaleLowerCase('pl-PL').includes(fraza);
}

export function TabelaPozycji({ pozycje }: { pozycje: PozycjaKatalogu[] }) {
  const t = teksty.ViewCatalogList;
  const etykiety = t.etykiety;
  const idTabeli = useId();
  const [szukane, setSzukane] = useState('');
  const [etap, setEtap] = useState<Etap | ''>('');

  const widoczne = useMemo(() => {
    const fraza = szukane.trim().toLocaleLowerCase('pl-PL');
    return pozycje.filter((p) => pasuje(p, fraza, etap));
  }, [pozycje, szukane, etap]);

  return (
    <Karta tytul={t.pozycje.naglowek} bezLinii>
      <p className="m-0 mb-6">{t.pozycje.opis}</p>
      <div className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-4">
        <PoleWyszukiwania
          id="katalog-szukaj"
          etykieta={t.pozycje.szukaj}
          placeholder={t.pozycje.szukaj}
          wartosc={szukane}
          onZmiana={setSzukane}
          steruje={idTabeli}
          className="min-w-0 grow basis-80 max-w-120"
        />
        <PoleWyboru<Etap>
          id="katalog-etap"
          etykieta={t.pozycje.etap}
          opcje={ETAPY.map((e) => ({ wartosc: e, etykieta: etykiety.etapy[e] }))}
          wartosc={etap}
          onZmiana={setEtap}
          pustaOpcja={t.pozycje.wszystkieEtapy}
          szerokosc="pelna"
          className="min-w-0 shrink grow-0 basis-79"
        />
      </div>
      <p className="m-0 mb-4" aria-live="polite">
        {t.pozycje.liczba} <strong className="font-semibold">{widoczne.length}</strong>
      </p>
      <Tabela<KolumnaPozycji>
        id={idTabeli}
        podpis={t.pozycje.naglowek}
        etykietaPrzewijania={t.pozycje.przewijanie}
        pustaTresc={t.pozycje.brakWynikow}
        kolumny={[
          { klucz: 'identyfikator', naglowek: t.pozycje.kolumnaId },
          { klucz: 'sprawa', naglowek: t.pozycje.kolumnaSprawy, tytulowa: true },
          { klucz: 'rodzaj', naglowek: t.pozycje.kolumnaRodzaju },
          { klucz: 'etap', naglowek: t.pozycje.kolumnaEtapu },
          { klucz: 'rodzic', naglowek: t.pozycje.kolumnaRodzica },
          { klucz: 'stan', naglowek: t.edycja.kolumnaStanu },
          { klucz: 'akcja', naglowek: t.edycja.kolumnaAkcji, ukryjNaglowek: true },
        ]}
        wiersze={widoczne.map((p) => ({
          id: p.id,
          identyfikator: (
            <span id={kotwicaPozycji(p.id)} className="scroll-mt-28 text-ink-strong">
              {p.id}
            </span>
          ),
          sprawa: p.tytul,
          rodzaj: etykiety.rodzaje[p.rodzaj],
          etap: etykiety.etapy[p.etap],
          rodzic: etykiety.rodzice[p.rodzic],
          stan: p.wylaczona ? <strong className="font-semibold">{t.edycja.wylaczona}</strong> : t.edycja.aktywna,
          akcja: (
            <Odnosnik href={trasy.ViewCatalogItemEdit({ idPozycji: p.id })} aria-label={t.edycja.zmienPozycje({ id: p.id })}>
              {t.zmien}
            </Odnosnik>
          ),
        }))}
      />
      <Notatka className="mt-6">
        <p>
          {t.pozycje.notatka}{' '}
          <Odnosnik href={trasy.ViewCatalogItemAdd()} wTekscie>
            {t.dodajPozycje}
          </Odnosnik>
        </p>
      </Notatka>
    </Karta>
  );
}
