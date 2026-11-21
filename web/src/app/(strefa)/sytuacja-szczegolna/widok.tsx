'use client';

// ViewSpecialSituation (historyjki 3.3.5.1.1 i 3.3.5.1.2; wzory P22-02, P22-06 do P22-11). Właściciel: u25.
// Formularz zgłoszenia sytuacji szczególnej, lista zapisanych sytuacji, spokojny tryb i jego wyłączenie.
// Konto bez zgody na dane dotyczące zdrowia widzi wyłącznie komunikat 0004.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ListaAkordeonowa } from '@/komponenty/akordeon';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { formatujDate } from '@/domena/daty';
import {
  PUSTY_FORMULARZ_SYTUACJI,
  czySpokojnyTryb,
  type FormularzSytuacji as Formularz,
  type PoleSytuacji,
  type ZgloszenieSytuacji,
} from '@/domena/rodzina/sytuacje';
import type { BledyPol, KodKomunikatu } from '@/domena/typy';
import { useDzis, useKontekstRodziny } from '@/dane/magazyn/hooki';
import { wylaczSpokojnyTryb, zapiszSytuacjeSzczegolna } from '@/dane/magazyn/operacje/sytuacje';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';
import { ArkuszPotwierdzeniaSytuacji } from './_czesci/arkusz-potwierdzenia-sytuacji';
import { FormularzSytuacji } from './_czesci/formularz-sytuacji';
import { KartyBoczne } from './_czesci/karty-boczne';
import { useOsobySytuacji } from './_czesci/osoby';

const t = teksty.ViewSpecialSituation;

export function WidokSytuacjiSzczegolnej() {
  const kontekst = useKontekstRodziny();
  const dzis = useDzis();
  const router = useRouter();
  const osoby = useOsobySytuacji(kontekst);
  const [formularz, setFormularz] = useState<Formularz>(PUSTY_FORMULARZ_SYTUACJI);
  const [zgloszenie, setZgloszenie] = useState<ZgloszenieSytuacji | null>(null);
  const [bledyOperacji, setBledyOperacji] = useState<BledyPol<PoleSytuacji>>({});
  const [komunikatArkusza, setKomunikatArkusza] = useState<KodKomunikatu | null>(null);
  const [komunikatWidoku, setKomunikatWidoku] = useState<KodKomunikatu | null>(null);
  const [zajety, setZajety] = useState(false);

  const powrot = { href: trasy.ViewFamilyPlan(), etykieta: t.powrot };

  if (kontekst === null || kontekst.stanZgody !== 'udzielona') {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} stanNa={dzis} powrot={powrot} />
        <div className="flex max-w-tresc flex-col items-start gap-7.5">
          {kontekst !== null ? <Komunikat kod="0004" className="w-full" /> : null}
          <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
            {t.wrocDoPlanu}
          </PrzyciskLink>
        </div>
      </>
    );
  }

  const daneCiazy = kontekst.rodzina.daneCiazy;
  const sytuacje = daneCiazy?.sytuacjeSzczegolne ?? [];
  const spokojny = czySpokojnyTryb(daneCiazy);

  function przejdzDoArkusza(z: ZgloszenieSytuacji) {
    setBledyOperacji({});
    setKomunikatArkusza(null);
    setZgloszenie(z);
  }

  function zapisz() {
    if (zgloszenie === null) return;
    setZajety(true);
    const wynik = zapiszSytuacjeSzczegolna(formularz, pobierzKontekstOperacji());
    setZajety(false);
    if (wynik.ok) {
      setZgloszenie(null);
      setFormularz(PUSTY_FORMULARZ_SYTUACJI);
      router.push(trasy.ViewFamilyPlan());
      return;
    }
    if (wynik.bledyPol) {
      setBledyOperacji(wynik.bledyPol as BledyPol<PoleSytuacji>);
      setZgloszenie(null);
      return;
    }
    setKomunikatArkusza(wynik.kod);
  }

  function wylacz() {
    const wynik = wylaczSpokojnyTryb(pobierzKontekstOperacji());
    setKomunikatWidoku(wynik.ok ? '0128' : wynik.kod);
  }

  const formularzSytuacji = (wAkordeonie: boolean) => (
    <FormularzSytuacji
      daneCiazy={daneCiazy}
      dzis={dzis}
      wAkordeonie={wAkordeonie}
      formularz={formularz}
      onZmianaFormularza={(f) => {
        setFormularz(f);
        setBledyOperacji({});
      }}
      bledyZOperacji={bledyOperacji}
      onDalej={przejdzDoArkusza}
    />
  );

  const arkusz = (
    <ArkuszPotwierdzeniaSytuacji
      otwarte={zgloszenie !== null}
      onZamknij={() => setZgloszenie(null)}
      zgloszenie={zgloszenie}
      onZapisz={zapisz}
      zajety={zajety}
      komunikat={komunikatArkusza ? <Komunikat kod={komunikatArkusza} /> : null}
    />
  );

  if (sytuacje.length === 0) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={powrot} />
        <UkladDwuKolumnowy
          tresc={formularzSytuacji(false)}
          boczna={<KartyBoczne daneCiazy={daneCiazy} drugiRodzic={osoby.drugiRodzicImieINazwisko} dzis={dzis} />}
          etykietaBocznej={t.kartaProfilu}
        />
        {arkusz}
      </>
    );
  }

  const zrodlo = teksty.wspolne.etykiety.zrodlaDanych['odpowiedz-rodzica'];
  const wiersze = sytuacje.map((s) => ({
    id: s.id,
    rodzaj: t.rodzaje[s.rodzaj],
    data: formatujDate(s.dataZdarzenia),
    liczba: String(s.liczbaDzieci ?? 1),
    zrodlo,
  }));

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} stanNa={dzis} powrot={powrot} />
      {komunikatWidoku ? <Komunikat kod={komunikatWidoku} className="mb-7.5 max-w-tresc" /> : null}
      <UkladDwuKolumnowy
        tresc={
          <Karta tytul={t.kartaZapisanych} bezLinii>
            <div className="flex min-w-0 flex-col gap-6">
              <Tabela
                podpis={t.podpisTabeli}
                etykietaPrzewijania={t.przewijanieTabeli}
                kolumny={[
                  { klucz: 'rodzaj', naglowek: t.kolumny.rodzaj },
                  { klucz: 'data', naglowek: t.kolumny.data },
                  { klucz: 'liczba', naglowek: t.kolumny.liczba },
                  { klucz: 'zrodlo', naglowek: t.kolumny.zrodlo },
                ]}
                wiersze={wiersze}
              />
              <ListaAkordeonowa
                elementy={[{ id: 'sytuacja-kolejna', naglowek: t.zapiszKolejna, tresc: formularzSytuacji(true) }]}
              />
            </div>
          </Karta>
        }
        boczna={
          <Karta tytul={t.kartaTrybu} bezLinii>
            <div className="flex min-w-0 flex-col gap-4">
              <p className="m-0 text-body-strong">{spokojny ? t.trybWlaczony : t.trybWylaczony}</p>
              <p className="m-0">{spokojny ? t.opisTrybuWlaczonego : t.opisTrybuWylaczonego}</p>
              {spokojny ? (
                <Przycisk type="button" wariant="drugorzedny" szerokosc="pelna" onClick={wylacz}>
                  {t.wylaczTryb}
                </Przycisk>
              ) : (
                <PrzyciskLink href={trasy.ViewGuideSettings()} wariant="drugorzedny" szerokosc="pelna">
                  {t.ustawieniaPrzypomnien}
                </PrzyciskLink>
              )}
            </div>
          </Karta>
        }
        etykietaBocznej={t.kartaTrybu}
      />
      {arkusz}
    </>
  );
}
