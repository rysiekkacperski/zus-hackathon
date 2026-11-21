'use client';

import type { Ref } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { BladPola, Pole, klasyRamkiPolaWpisu } from '@/komponenty/pole';
import { Przycisk } from '@/komponenty/przycisk';
import type { KodKomunikatu } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewZamPrebirth.zaswiadczenie;

export interface PlikDoPokazania {
  nazwa: string;
  typ: string;
  rozmiar: number;
}

function opisTypu(typ: string, nazwa: string): string {
  if (typ === 'application/pdf' || /\.pdf$/i.test(nazwa)) return 'PDF';
  if (typ === 'image/png' || /\.png$/i.test(nazwa)) return 'PNG';
  return 'JPG';
}

function opisRozmiaru(rozmiar: number): string {
  const mb = Math.max(0.1, Math.round((rozmiar / 1048576) * 10) / 10);
  const liczba = Number.isInteger(mb) ? String(mb) : mb.toFixed(1).replace('.', ',');
  return t.rozmiarMb({ liczba });
}

export interface PoleZaswiadczeniaProps {
  id: string;
  plik: PlikDoPokazania | null;
  blad: KodKomunikatu | null;
  onWybor: (plik: File) => void;
  onUsun: () => void;
  ref?: Ref<HTMLInputElement>;
}

// Pole pliku zaświadczenia ze wzorów P11-04 (plik dołączony z akcją Usuń plik) i P11-05 (pole pliku z błędem).
export function PoleZaswiadczenia({ id, plik, blad, onWybor, onUsun, ref }: PoleZaswiadczeniaProps) {
  if (plik !== null) {
    return (
      <div className="grid min-w-0 gap-1">
        <p className="m-0 text-body-strong">{t.dolaczonyPlik}</p>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-sm bg-surface-page px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Ikona nazwa="plik" className="flex-none text-brand" />
            <div className="min-w-0">
              <p className="m-0 text-body-strong break-words">{plik.nazwa}</p>
              <p className="m-0">{t.opisPliku({ typ: opisTypu(plik.typ, plik.nazwa), rozmiar: opisRozmiaru(plik.rozmiar) })}</p>
            </div>
          </div>
          <Przycisk wariant="drugorzedny" ikona="usun" onClick={onUsun} aria-label={t.usunPlikEtykieta({ nazwa: plik.nazwa })}>
            {t.usunPlik}
          </Przycisk>
        </div>
        {blad ? <BladPola id={`${id}-blad`} kod={blad} /> : null}
        <p className="m-0 mt-1 text-small">{t.podpowiedz}</p>
      </div>
    );
  }
  return (
    <Pole id={id} etykieta={t.etykietaPola} podpowiedz={t.podpowiedz} blad={blad}>
      {(aria) => (
        <input
          {...aria}
          ref={ref}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className={`box-border w-full max-w-115 py-2.5 ${klasyRamkiPolaWpisu} px-3`}
          onChange={(e) => {
            const wybrany = e.currentTarget.files?.[0];
            if (wybrany) onWybor(wybrany);
            e.currentTarget.value = '';
          }}
        />
      )}
    </Pole>
  );
}
