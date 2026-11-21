'use client';

// ViewSampleCaseList (3.4.3.1.1, 3.4.3.1.5): sprawy z zestawów ZUS i sprawy wzorcowe S01–S11 z akcją wyboru
// oraz karta wgrania dokumentu z zestawu ZUS (wzory Przykladowe-sprawy, P13-01).
import { useEffect, useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { Tabela } from '@/komponenty/tabela';
import { useDzis } from '@/dane/magazyn/hooki';
import { sprawyZespolu, wybierzSpraweZespolu, zapamietajZestawyZus } from '@/dane/magazyn/operacje/przykladowe-sprawy';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu, OdpowiedzZestawowSpraw, SprawaPrzykladowa } from '@/domena/typy';
import { teksty } from '@/teksty';
import { formaZatrudnienia, listaDokumentow, prawoSprawy } from './_czesci/opisy';

const t = teksty.ViewSampleCaseList;

type Kolumna = 'sprawa' | 'sytuacja' | 'forma' | 'dokumenty' | 'prawo' | 'akcja';

export function WidokPrzykladowychSpraw() {
  const dzis = useDzis();
  const { przejdz } = useNawigacjaZLadowaniem();
  const [sprawy, setSprawy] = useState<SprawaPrzykladowa[]>(() => sprawyZespolu());
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const [wybierana, setWybierana] = useStanChwilowy<string | null>(null);

  useEffect(() => {
    let aktywne = true;
    fetch('/api/przykladowe-sprawy/zestawy', { cache: 'no-store' })
      .then((odpowiedz) => (odpowiedz.ok ? (odpowiedz.json() as Promise<OdpowiedzZestawowSpraw>) : { sprawy: [] }))
      .then((dane) => {
        if (!aktywne) return;
        zapamietajZestawyZus(dane.sprawy);
        setSprawy(sprawyZespolu());
      })
      .catch(() => undefined);
    return () => {
      aktywne = false;
    };
  }, []);

  const liczbaZestawow = sprawy.filter((s) => s.zrodlo === 'zestaw-zus').length;
  const liczbaWzorcowych = sprawy.filter((s) => s.zrodlo === 'sprawa-wzorcowa').length;

  function wybierz(id: string) {
    setWybierana(id);
    const wynik = wybierzSpraweZespolu(id, pobierzKontekstOperacji());
    if (!wynik.ok) {
      setBlad(wynik.kod);
      setWybierana(null);
      return;
    }
    przejdz(trasy.ViewSampleCaseData());
  }

  const kolumny: { klucz: Kolumna; naglowek: string; ukryjNaglowek?: boolean }[] = [
    { klucz: 'sprawa', naglowek: t.tabela.sprawa },
    { klucz: 'sytuacja', naglowek: t.tabela.sytuacja },
    { klucz: 'forma', naglowek: t.tabela.forma },
    { klucz: 'dokumenty', naglowek: t.tabela.dokumenty },
    { klucz: 'prawo', naglowek: t.tabela.prawo },
    { klucz: 'akcja', naglowek: t.tabela.akcja, ukryjNaglowek: true },
  ];

  const wiersze = sprawy.map((s) => {
    const id = s.idSprawy ?? '';
    return {
      id: `${s.zrodlo}-${id}`,
      sprawa: (
        <>
          <span className="block font-semibold text-ink-strong">{id}</span>
          {t.zrodla[s.zrodlo]}
        </>
      ),
      sytuacja: s.sytuacja ?? '',
      forma: formaZatrudnienia(s),
      dokumenty: listaDokumentow(s),
      prawo: prawoSprawy(s).map((linia) => (
        <span key={linia} className="block">
          {linia}
        </span>
      )),
      akcja: (
        <Przycisk
          wariant="drugorzedny"
          onClick={() => wybierz(id)}
          zajety={wybierana === id}
          aria-label={t.tabela.wybierzSprawe({ id })}
        >
          {t.tabela.wybierz}
        </Przycisk>
      ),
    };
  });

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} stanNa={dzis} wstep={t.wstep} powrot={false} />
      <Stos odstep={7.5} className="max-w-tresc">
        {blad ? <Komunikat kod={blad} /> : null}
        <Karta tytul={t.kartaWgrania.tytul} bezLinii>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="m-0 min-w-0 flex-[1_1_30rem]">{t.kartaWgrania.opis}</p>
            <PrzyciskLink href={trasy.ViewSampleCaseUpload({ trybWgrania: 'nowa' })} wariant="glowny" ikona="wgraj">
              {t.kartaWgrania.przycisk}
            </PrzyciskLink>
          </div>
        </Karta>
        <Karta tytul={t.kartaListy.tytul} bezLinii>
          <p className="mt-0 mb-5">
            {t.kartaListy.licznikZestawow} <strong>{liczbaZestawow}</strong>, {t.kartaListy.licznikWzorcowych}{' '}
            <strong>{liczbaWzorcowych}</strong>
          </p>
          <Tabela podpis={t.tabela.podpis} kolumny={kolumny} wiersze={wiersze} etykietaPrzewijania={t.tabela.etykietaPrzewijania} />
          <Notatka className="mt-6">{t.kartaListy.notatka}</Notatka>
        </Karta>
        <Notatka>{t.notatkaJednaSprawa}</Notatka>
      </Stos>
    </>
  );
}
