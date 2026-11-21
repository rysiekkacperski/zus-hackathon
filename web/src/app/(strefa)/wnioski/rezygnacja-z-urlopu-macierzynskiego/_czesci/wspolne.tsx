'use client';

// Części wspólne ekranów ViewMaternityResignation i ViewFatherTakeover (u34): lista danych ze wzorów P25,
// ramka okresu, lista załączników z akcją „Dodaj plik”, odmiana liczebników i etykiety form zatrudnienia.
import { useRef, useState, type ReactNode } from 'react';
import { BladPola } from '@/komponenty/pole';
import { Ikona } from '@/komponenty/ikona';
import { Przycisk } from '@/komponenty/przycisk';
import { walidujPlik } from '@/domena/walidacje';
import type { DrugiRodzic, FormaZatrudnieniaDrugiegoRodzica, KodKomunikatu, PlikZalacznika, Zalacznik } from '@/domena/typy';
import { zapiszPlik } from '@/dane/magazyn/pliki';
import { teksty } from '@/teksty';

const t = teksty.ViewMaternityResignation;

/** Liczba tygodni z odmianą: 1 tydzień, 33 tygodnie, 20 tygodni. */
export function tygodnie(n: number): string {
  const o = t.odmianaTygodni;
  const forma = n === 1 ? o.jeden : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? o.kilka : o.wiele;
  return t.liczbaZJednostka({ liczba: String(n), jednostka: forma });
}

/** Liczba dni z odmianą: 1 dzień, 38 dni. */
export function dni(n: number): string {
  return t.liczbaZJednostka({ liczba: String(n), jednostka: n === 1 ? t.odmianaDni.jeden : t.odmianaDni.wiele });
}

/** Etykieta formy zatrudnienia z informacją o dobrowolnym ubezpieczeniu chorobowym. */
export function etykietaFormy(forma: FormaZatrudnieniaDrugiegoRodzica | null | undefined, dobrowolne?: boolean | null): string {
  if (!forma) return t.formy['brak-drugiego-rodzica'];
  if (forma === 'umowa-zlecenia') {
    if (dobrowolne === true) return t.formy['umowa-zlecenia-z-dobrowolnym'];
    if (dobrowolne === false) return t.formy['umowa-zlecenia-bez-dobrowolnego'];
    return t.formy['umowa-zlecenia'];
  }
  if (forma === 'jdg') {
    if (dobrowolne === true) return t.formy['jdg-z-dobrowolnym'];
    if (dobrowolne === false) return t.formy['jdg-bez-dobrowolnego'];
    return t.formy.jdg;
  }
  return t.formy[forma];
}

/** Imię i nazwisko drugiego rodzica z profilu rodziny. */
export function imieINazwiskoDrugiego(drugi: DrugiRodzic): string | null {
  const tekst = [drugi.imie, drugi.nazwisko].filter(Boolean).join(' ');
  return tekst === '' ? null : tekst;
}

/** Lista danych ze wzorów P25: etykieta pogrubiona nad wartością. */
export function ListaDanych({ pozycje }: { pozycje: { etykieta: string; wartosc: ReactNode }[] }) {
  return (
    <dl className="m-0 grid gap-3">
      {pozycje.map((p) => (
        <div key={p.etykieta} className="min-w-0">
          <dt className="text-body-strong">{p.etykieta}</dt>
          <dd className="m-0 break-words">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Ramka z wyliczonym okresem urlopu ze wzorów P25-02 i P25-14. */
export function RamkaOkresu({ etykieta, okres, id }: { etykieta: string; okres: string; id?: string }) {
  return (
    <div id={id} role="status" className="mt-6 rounded-md bg-surface-page px-5 py-4">
      <p className="m-0">{etykieta}</p>
      <p className="m-0 mt-1 text-body-strong text-ink-strong">{okres}</p>
    </div>
  );
}

/** Komunikat ostrzeżenia przy polu ze wzorów P25-04 i P25-16: akapit „Uwaga: …”. */
export function OstrzezeniePola({ id, kod }: { id: string; kod: KodKomunikatu }) {
  const tresc = teksty.komunikaty[kod];
  return (
    <p id={id} role="status" className="m-0 mt-1 flex items-start gap-2 font-semibold text-ink-strong">
      <Ikona nazwa="uwaga" rozmiar={20} className="mt-0.5 text-brand" />
      <span className="min-w-0">
        {teksty.wspolne.prefiksy.WARNING} {typeof tresc === 'string' ? tresc : ''}
      </span>
    </p>
  );
}

/** Akapit informacji przy polu ze wzoru P25-22: „Informacja: …”. */
export function InformacjaPola({ id, tresc }: { id: string; tresc: string }) {
  return (
    <p id={id} role="status" className="m-0 mt-1 flex items-start gap-2">
      <Ikona nazwa="info" rozmiar={20} className="mt-0.5 text-brand" />
      <span className="min-w-0">
        <strong className="font-semibold text-ink-strong">{teksty.wspolne.prefiksy.INFO}</strong> {tresc}
      </span>
    </p>
  );
}

export interface PozycjaZalacznika {
  rodzaj: string;
  tytul: string;
  opis?: string;
  /** Załącznik dołączany automatycznie (kopia wniosku z Wniosków drugiego rodzica). */
  automatyczny?: boolean;
}

/**
 * Lista załączników ze wzorów P25: tytuł, opis i przycisk „Dodaj plik” przy dokumentach do wgrania.
 * Plik trafia do magazynu plików przeglądarki, a lista zwraca jego metadane przez `onZmianaPlikow`.
 */
export function ListaZalacznikow({
  pozycje,
  pliki,
  onZmianaPlikow,
  wlasciciel,
}: {
  pozycje: PozycjaZalacznika[];
  pliki: Record<string, PlikZalacznika>;
  onZmianaPlikow: (pliki: Record<string, PlikZalacznika>) => void;
  wlasciciel: string;
}) {
  const [bledy, setBledy] = useState<Record<string, KodKomunikatu>>({});
  const wejscia = useRef<Record<string, HTMLInputElement | null>>({});

  async function wgraj(rodzaj: string, plik: File | undefined) {
    if (!plik) return;
    const kod = walidujPlik({ typ: plik.type, rozmiar: plik.size });
    if (kod) {
      setBledy((b) => ({ ...b, [rodzaj]: kod }));
      return;
    }
    try {
      const idPliku = await zapiszPlik(plik, { nazwa: plik.name, wlasciciel });
      setBledy((b) => {
        const kopia = { ...b };
        delete kopia[rodzaj];
        return kopia;
      });
      onZmianaPlikow({
        ...pliki,
        [rodzaj]: { idPliku, nazwa: plik.name, rozmiar: plik.size, typ: plik.type as PlikZalacznika['typ'] },
      });
    } catch {
      setBledy((b) => ({ ...b, [rodzaj]: '0003' }));
    }
  }

  return (
    <ul className="m-0 list-none p-0">
      {pozycje.map((p) => {
        const idWejscia = `zalacznik-${p.rodzaj}`;
        const plik = pliki[p.rodzaj];
        return (
          <li key={p.rodzaj} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-3">
            <span className="flex min-w-0 flex-[1_1_300px] items-start gap-3">
              <Ikona nazwa="zalacznik" rozmiar={20} className="mt-0.5 shrink-0 text-brand" />
              <span className="min-w-0">
                <span className="block text-body-strong">{p.tytul}</span>
                {p.opis ? <span className="block">{p.opis}</span> : null}
                {plik ? <span className="block">{t.dodanyPlik({ nazwa: plik.nazwa })}</span> : null}
                {bledy[p.rodzaj] ? <BladPola id={`${idWejscia}-blad`} kod={bledy[p.rodzaj]} /> : null}
              </span>
            </span>
            {p.automatyczny ? null : (
              <>
                <input
                  ref={(el) => {
                    wejscia.current[p.rodzaj] = el;
                  }}
                  id={idWejscia}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => {
                    void wgraj(p.rodzaj, e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                <Przycisk
                  type="button"
                  wariant="drugorzedny"
                  aria-label={t.dodajPlikDo({ zalacznik: p.tytul })}
                  onClick={() => wejscia.current[p.rodzaj]?.click()}
                >
                  {t.dodajPlik}
                </Przycisk>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Załączniki wniosku z listy pozycji i wgranych plików. */
export function zbudujZalaczniki(pozycje: PozycjaZalacznika[], pliki: Record<string, PlikZalacznika>): Zalacznik[] {
  return pozycje.map((p) => ({
    id: p.rodzaj,
    rodzaj: p.rodzaj,
    opis: p.tytul,
    wymagany: true,
    ...(pliki[p.rodzaj] ? { plik: pliki[p.rodzaj] } : {}),
  }));
}

/** Pliki zapisane wcześniej w załącznikach szkicu. */
export function plikiZeSzkicu(zalaczniki: readonly Zalacznik[] | undefined): Record<string, PlikZalacznika> {
  const wynik: Record<string, PlikZalacznika> = {};
  for (const z of zalaczniki ?? []) if (z.plik) wynik[z.rodzaj] = z.plik;
  return wynik;
}
