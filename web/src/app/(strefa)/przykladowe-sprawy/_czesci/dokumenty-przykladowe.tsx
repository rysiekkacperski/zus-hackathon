'use client';

// Dokumenty przykładowe zespołu na ViewSampleCaseUpload: pobranie wszystkich plików w archiwum ZIP, pobranie pojedynczego
// pliku i wgranie pliku z listy bez zapisywania go na komputerze. Pliki: dane/przykladowe-sprawy/dokumenty-przykladowe.ts.
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Przycisk, klasyPrzycisku } from '@/komponenty/przycisk';
import {
  ARCHIWUM_DOKUMENTOW_PRZYKLADOWYCH,
  adresDokumentuPrzykladowego,
  zestawyDokumentowPrzykladowych,
  type DokumentPrzykladowy,
} from '@/dane/przykladowe-sprawy/dokumenty-przykladowe';
import { teksty } from '@/teksty';

const t = teksty.ViewSampleCaseUpload.dokumentyPrzykladowe;
const klasyOdnosnika = 'inline-flex items-center gap-2 font-semibold text-brand no-underline hover:underline';

/** Odnośnik do pobrania archiwum ZIP wszystkich dokumentów przykładowych. */
export function PobierzDokumentyPrzykladowe({ etykieta, opis }: { etykieta: string; opis: string }) {
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <a href={ARCHIWUM_DOKUMENTOW_PRZYKLADOWYCH} download className={klasyPrzycisku('drugorzedny')}>
        <Ikona nazwa="pobierz" rozmiar={20} />
        {etykieta}
      </a>
      <span className="text-small text-ink-muted">{opis}</span>
    </span>
  );
}

export interface KartaDokumentowPrzykladowychProps {
  onWgraj: (dokument: DokumentPrzykladowy) => void;
  /** Nazwa pliku, który właśnie wgrywamy. */
  wgrywany: string | null;
  zablokowane: boolean;
  /** 'dodaj' dodaje dokument do bieżącej sprawy, 'nowa' zaczyna nową sprawę. */
  tryb: 'nowa' | 'dodaj';
}

export function KartaDokumentowPrzykladowych({ onWgraj, wgrywany, zablokowane, tryb }: KartaDokumentowPrzykladowychProps) {
  return (
    <Karta tytul={t.tytul} bezLinii id="dokumenty-przykladowe">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
        <p className="m-0 min-w-0 flex-[1_1_30rem]">{tryb === 'dodaj' ? t.opisDodaj : t.opis}</p>
        <PobierzDokumentyPrzykladowe etykieta={t.pobierzWszystkie} opis={t.archiwum} />
      </div>
      <div className="grid gap-x-7.5 gap-y-6 xl:grid-cols-2">
        {zestawyDokumentowPrzykladowych.map((zestaw) => {
          const opis = t.zestawy[zestaw.id];
          const idNaglowka = `zestaw-${zestaw.id}`;
          return (
            <section key={zestaw.id} aria-labelledby={idNaglowka} className="min-w-0 rounded-sm border border-line px-5 py-4">
              <h3 id={idNaglowka} className="m-0 text-body-strong">
                {opis.tytul}
              </h3>
              <p className="m-0 mt-1 text-small text-ink-muted">{opis.opis}</p>
              <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0" aria-label={t.podpisListy({ zestaw: opis.tytul })}>
                {zestaw.dokumenty.map((d) => (
                  <li key={d.plik} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="min-w-0 flex-[1_1_14rem]">
                      <span className="block">{t.rodzaje[d.rodzaj]}</span>
                      <span className="block text-small text-ink-muted">{d.plik}</span>
                    </span>
                    <a
                      href={adresDokumentuPrzykladowego(d.plik)}
                      download
                      aria-label={t.pobierzDokument({ nazwa: d.plik })}
                      className={klasyOdnosnika}
                    >
                      <Ikona nazwa="pobierz" rozmiar={20} />
                      {t.pobierz}
                    </a>
                    <Przycisk
                      wariant="drugorzedny"
                      ikona="wgraj"
                      onClick={() => onWgraj(d)}
                      zajety={wgrywany === d.plik}
                      disabled={zablokowane && wgrywany !== d.plik}
                      aria-label={t.wgrajDokument({ nazwa: d.plik })}
                    >
                      {t.wgraj}
                    </Przycisk>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Karta>
  );
}
