'use client';

// ViewSampleCaseData (3.4.3.1.1–3.4.3.1.5): dane bieżącej przykładowej sprawy ze źródłem każdej wartości,
// dokumenty sprawy z podglądem i dodawaniem, korekty, oczekiwane rozstrzygnięcie i zatwierdzenie danych
// (wzory P13-02, P13-06, P13-09, P13-10, P13-11, P13-12). Formularz dzieli grupy danych na części (?czesc=N),
// a komunikaty odczytu i notatka stanu stoją nad pierwszą częścią, czyli nad dokumentami sprawy.
import { useEffect, useState } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { Ikona } from '@/komponenty/ikona';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos } from '@/komponenty/uklad';
import { formatujDateICzas } from '@/domena/daty';
import { useSesja, useStanSesji, useTeraz } from '@/dane/magazyn/hooki';
import { usunPlikiPo24h, usunSprawe, wgrajDokument } from '@/dane/magazyn/operacje/przykladowe-sprawy';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu } from '@/domena/typy';
import { teksty } from '@/teksty';
import { malaLitera } from '../_czesci/opisy';
import { FormularzDanychSprawy } from './_czesci/formularz-sprawy';

const t = teksty.ViewSampleCaseData;

export function WidokDanychPrzykladowejSprawy() {
  const sesja = useSesja();
  const stanSesji = useStanSesji();
  const teraz = useTeraz();
  const sprawa = stanSesji?.przykladowaSprawa;
  const [komunikaty, setKomunikaty] = useState<KodKomunikatu[]>([]);
  const [dodawanie, setDodawanie] = useState<string | null>(null);
  const { zajety: usuwanie, ustawZajety: ustawUsuwanie, przejdz } = useNawigacjaZLadowaniem();

  useEffect(() => {
    usunPlikiPo24h(pobierzKontekstOperacji());
  }, [teraz]);

  if (!sprawa) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} />
        <StanPusty
          ikona="folder"
          przerywany
          akcja={
            <PrzyciskLink href={trasy.ViewSampleCaseList()} wariant="glowny">
              {t.przejdzDoListy}
            </PrzyciskLink>
          }
        >
          {t.brakSprawy}
        </StanPusty>
      </>
    );
  }

  async function dodajDokument(plik: File): Promise<KodKomunikatu | null> {
    setDodawanie(plik.name);
    const wynik = await wgrajDokument(plik, 'dodaj', pobierzKontekstOperacji());
    setDodawanie(null);
    if (!wynik.ok) return wynik.kod;
    setKomunikaty(wynik.wartosc.komunikaty);
    return null;
  }

  async function usun() {
    ustawUsuwanie(true);
    const wynik = await usunSprawe(pobierzKontekstOperacji());
    if (wynik.ok) przejdz(trasy.ViewSampleCaseList());
    else ustawUsuwanie(false);
  }

  const zespol = sprawa.zrodlo !== 'wgrane-dokumenty';
  const czasWyboru = sprawa.rozpoczeto ? formatujDateICzas(sprawa.rozpoczeto) : '';
  const tytul = zespol && sprawa.idSprawy ? t.naglowekSprawy({ id: sprawa.idSprawy }) : t.naglowek;
  const wstep = zespol
    ? t.wstepZespolu({ zrodlo: teksty.ViewSampleCaseList.zrodla[sprawa.zrodlo], sytuacja: malaLitera(sprawa.sytuacja ?? ''), czas: czasWyboru })
    : t.wstepWgranej({ czas: czasWyboru, stanNa: formatujDateICzas(teraz) });
  const kluczFormularza = `${sprawa.rozpoczeto}|${sprawa.dokumenty.map((d) => d.id).join(',')}`;
  const wprowadzenie = komunikaty.length > 0 || zespol ? (
    <Stos odstep={7.5}>
      {komunikaty.length > 0 ? (
        <Stos odstep={3}>
          {komunikaty.map((kod) => (
            <Komunikat key={kod} kod={kod} />
          ))}
        </Stos>
      ) : null}
      {zespol ? <Notatka>{t.notatkaStanu({ stanNa: formatujDateICzas(teraz) })}</Notatka> : null}
    </Stos>
  ) : null;

  return (
    <>
      <NaglowekStrony
        tytul={tytul}
        wstep={wstep}
        powrot={{ href: trasy.ViewSampleCaseList(), etykieta: teksty.ViewSampleCaseList.naglowek }}
        akcje={
          <button
            type="button"
            onClick={usun}
            disabled={usuwanie}
            aria-busy={usuwanie || undefined}
            className="inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 font-semibold text-brand underline-offset-2 hover:text-brand-deep hover:underline"
          >
            <Ikona nazwa="usun" rozmiar={20} />
            {t.usunSprawe}
          </button>
        }
      />
      <div className="max-w-tresc">
        <FormularzDanychSprawy
          key={kluczFormularza}
          sprawa={sprawa}
          konto={sesja?.pesel}
          teraz={teraz}
          onDodajDokument={dodajDokument}
          dodawanie={dodawanie}
          wprowadzenie={wprowadzenie}
        />
      </div>
    </>
  );
}
