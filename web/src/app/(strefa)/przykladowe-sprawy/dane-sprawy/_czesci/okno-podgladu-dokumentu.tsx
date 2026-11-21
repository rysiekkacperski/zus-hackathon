'use client';

// ModalSampleCaseDocument (kontrakt, tabela 2.3): okno modalne na ViewSampleCaseData. Właściciel: u05.
// Podgląd pliku wgranego przez konto albo gościa (do 24 godzin od wgrania) albo pliku sprawy zespołu; po usunięciu pliku 0113
// i akcja ponownego wgrania (wzory P13-07, P13-08).
import { useEffect, useState, type ChangeEvent } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk, klasyPrzycisku } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Ikona } from '@/komponenty/ikona';
import { dodajMinuty, formatujDateICzas } from '@/domena/daty';
import { pobierzPlik } from '@/dane/magazyn/pliki';
import type { DokumentSprawy } from '@/domena/typy';
import { teksty } from '@/teksty';
import { nazwaDokumentu } from '../../_czesci/opisy';

const t = teksty.ModalSampleCaseDocument;

export interface OknoPodgladuDokumentuProps {
  otwarte: boolean;
  onZamknij: () => void;
  dokument?: DokumentSprawy | null;
  // Właściciel danych: PESEL konta albo 'gosc:<id>' w trybie gościa.
  konto?: string;
  onWgrajPonownie?: (plik: File) => void;
}

function PodgladPliku({ idPliku }: { idPliku: string }) {
  const [adres, setAdres] = useState<{ url: string; typ: string } | null | 'brak'>(null);
  useEffect(() => {
    let url: string | null = null;
    let aktywne = true;
    void pobierzPlik(idPliku).then((plik) => {
      if (!aktywne) return;
      if (plik === null) {
        setAdres('brak');
        return;
      }
      url = URL.createObjectURL(plik.blob);
      setAdres({ url, typ: plik.typ });
    });
    return () => {
      aktywne = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [idPliku]);

  if (adres === null) return <p className="m-0" role="status">{t.ladowanie}</p>;
  if (adres === 'brak') return <StanPusty ikona="plik-brak">{t.pustyPodglad}</StanPusty>;
  return (
    <figure aria-label={t.podgladPliku} className="m-0 overflow-hidden rounded-sm border border-line bg-surface-sunken">
      <object data={adres.url} type={adres.typ} aria-label={t.podgladPliku} className="block h-[60vh] max-h-130 w-full">
        <p className="m-4">{t.podgladPliku}</p>
      </object>
    </figure>
  );
}

export function OknoPodgladuDokumentu({ otwarte, onZamknij, dokument, konto, onWgrajPonownie }: OknoPodgladuDokumentuProps) {
  if (!dokument) return null;
  const usuniety = dokument.usunietoPlik !== undefined;
  const wlasny = dokument.idPliku !== undefined && dokument.konto === konto;
  const ponowneWgranie = (e: ChangeEvent<HTMLInputElement>) => {
    const plik = e.target.files?.[0];
    if (plik) onWgrajPonownie?.(plik);
  };

  return (
    <OknoModalne
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={nazwaDokumentu(dokument)}
      stopka={
        <div className="flex flex-wrap gap-4">
          {usuniety && onWgrajPonownie ? (
            <>
              <label htmlFor="wgraj-ponownie" className={klasyPrzycisku('glowny')}>
                <Ikona nazwa="wgraj" />
                {t.wgrajPonownie}
              </label>
              <input id="wgraj-ponownie" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={ponowneWgranie} className="sr-only" />
            </>
          ) : null}
          <Przycisk wariant="drugorzedny" onClick={onZamknij}>
            {teksty.wspolne.przyciski.zamknij}
          </Przycisk>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-1">
          <p className="m-0">
            <strong>{t.rodzajDokumentu}</strong> {t.opisyRodzajow[dokument.rodzaj]}
          </p>
          {dokument.plikZespolu ? (
            <p className="m-0">{t.plikZespolu}</p>
          ) : (
            <>
              <p className="m-0">
                <strong>{t.wgrany}</strong> {formatujDateICzas(dokument.wgrano)}
              </p>
              <p className="m-0">
                <strong>{usuniety ? t.plikUsuniety : t.plikUsuniemy}</strong>{' '}
                {formatujDateICzas(dokument.usunietoPlik ?? dodajMinuty(dokument.wgrano, 24 * 60))}
              </p>
            </>
          )}
        </div>
        {usuniety ? (
          <>
            <Komunikat kod="0113" />
            <StanPusty ikona="plik-brak">{t.pustyPodglad}</StanPusty>
          </>
        ) : dokument.plikZespolu ? (
          <StanPusty ikona="dokument" przerywany>
            {t.podgladZespolu}
          </StanPusty>
        ) : wlasny && dokument.idPliku ? (
          <PodgladPliku idPliku={dokument.idPliku} />
        ) : (
          <StanPusty ikona="plik-brak">{t.pustyPodglad}</StanPusty>
        )}
        {!usuniety ? <Notatka>{t.notatka}</Notatka> : null}
      </div>
    </OknoModalne>
  );
}
