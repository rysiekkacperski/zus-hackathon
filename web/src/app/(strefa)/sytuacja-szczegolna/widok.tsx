'use client';

// ViewSpecialSituation (historyjki 3.3.5.1.1 i 3.3.5.1.2; wzory P22-02, P22-06 do P22-11). Właściciel: u25.
// Formularz zgłoszenia sytuacji szczególnej, lista zapisanych sytuacji, spokojny tryb i jego wyłączenie.
// Konto bez zgody na dane dotyczące zdrowia widzi wyłącznie komunikat 0004.
// Formularz pierwszej sytuacji ma dwie części w ?czesc=N (rodzaj sytuacji, potem data i liczba dzieci), żeby każda
// mieściła się w oknie. Formularz kolejnej sytuacji w akordeonie listy pokazuje obie sekcje razem.
import { useState } from 'react';
import { ListaAkordeonowa } from '@/komponenty/akordeon';
import { useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { formatujDate } from '@/domena/daty';
import {
  PUSTY_FORMULARZ_SYTUACJI,
  czySpokojnyTryb,
  walidujSytuacje,
  zgloszenieDopisaniaZaswiadczenia,
  type FormularzSytuacji as Formularz,
  type PoleSytuacji,
  type ZgloszenieSytuacji,
} from '@/domena/rodzina/sytuacje';
import type { BledyPol, KodKomunikatu, SytuacjaSzczegolna } from '@/domena/typy';
import { useDzis, useKontekstRodziny } from '@/dane/magazyn/hooki';
import {
  brakZgodyMatkiDlaKonta,
  dopiszZaswiadczenieOMartwymUrodzeniu,
  wylaczSpokojnyTryb,
  zapiszSytuacjeSzczegolna,
} from '@/dane/magazyn/operacje/sytuacje';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';
import { ArkuszPotwierdzeniaSytuacji } from './_czesci/arkusz-potwierdzenia-sytuacji';
import { FormularzSytuacji, POLA_SYTUACJI } from './_czesci/formularz-sytuacji';
import { KartyBoczne } from './_czesci/karty-boczne';
import { useOsobySytuacji } from './_czesci/osoby';

const t = teksty.ViewSpecialSituation;

/** Pola części formularza pierwszej sytuacji: 1 rodzaj sytuacji, 2 data zdarzenia i liczba dzieci. */
const PODZIAL: readonly (readonly PoleSytuacji[])[] = [['rodzaj'], ['dataZdarzenia', 'liczbaDzieci']];
const PODZIAL_AKORDEONU: readonly (readonly PoleSytuacji[])[] = [['rodzaj', 'dataZdarzenia', 'liczbaDzieci']];

export function WidokSytuacjiSzczegolnej() {
  const kontekst = useKontekstRodziny();
  const dzis = useDzis();
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const osoby = useOsobySytuacji(kontekst);
  const [formularz, setFormularz] = useState<Formularz>(PUSTY_FORMULARZ_SYTUACJI);
  // Arkusz zostaje otwarty z ładowaniem do pokazania planu rodziny i zamyka się po ukryciu trasy.
  const [zgloszenie, setZgloszenie] = useStanChwilowy<ZgloszenieSytuacji | null>(null);
  const [komunikatArkusza, setKomunikatArkusza] = useState<KodKomunikatu | null>(null);
  const [komunikatWidoku, setKomunikatWidoku] = useState<KodKomunikatu | null>(null);
  // Poronienie z listy zapisanych sytuacji, do którego rodzic dopisuje zaświadczenie o martwym urodzeniu.
  const [dopisanie, setDopisanie] = useState<SytuacjaSzczegolna | null>(null);

  const daneCiazyRodziny = kontekst?.rodzina.daneCiazy ?? null;
  const brakZgodyMatki = kontekst !== null ? brakZgodyMatkiDlaKonta(kontekst.konto.pesel, kontekst.rodzina) : false;
  const wAkordeonie = (daneCiazyRodziny?.sytuacjeSzczegolne ?? []).length > 0;
  // Błąd pola pokazuje się po opuszczeniu pola, a po próbie przejścia dalej przy każdej zmianie.
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: Formularz) => walidujSytuacje(f, daneCiazyRodziny, dzis, brakZgodyMatki),
    pola: POLA_SYTUACJI,
  });
  const czesci = useCzesciFormularza({
    liczba: wAkordeonie ? 1 : PODZIAL.length,
    podzial: wAkordeonie ? PODZIAL_AKORDEONU : PODZIAL,
    walidacja,
  });

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
    setKomunikatArkusza(null);
    setZgloszenie(z);
  }

  function zapiszDopisanie() {
    if (dopisanie === null) return;
    ustawZajety(true);
    const wynik = dopiszZaswiadczenieOMartwymUrodzeniu(dopisanie.id, pobierzKontekstOperacji());
    ustawZajety(false);
    if (wynik.ok) {
      setDopisanie(null);
      return;
    }
    setKomunikatArkusza(wynik.kod);
  }

  function zapisz() {
    if (dopisanie !== null) {
      zapiszDopisanie();
      return;
    }
    if (zgloszenie === null) return;
    ustawZajety(true);
    const wynik = zapiszSytuacjeSzczegolna(formularz, pobierzKontekstOperacji());
    if (wynik.ok) {
      setFormularz(PUSTY_FORMULARZ_SYTUACJI);
      walidacja.resetuj();
      przejdz(trasy.ViewFamilyPlan());
      return;
    }
    ustawZajety(false);
    if (wynik.bledyPol) {
      const bledy = wynik.bledyPol as BledyPol<PoleSytuacji>;
      setZgloszenie(null);
      walidacja.pokazBledy(bledy);
      const numer = PODZIAL.findIndex((pola) => pola.some((pole) => bledy[pole] !== undefined)) + 1;
      if (!wAkordeonie && numer > 0 && numer !== czesci.czesc) czesci.przejdzDo(numer, { bezFokusu: true });
      return;
    }
    setKomunikatArkusza(wynik.kod);
  }

  function wylacz() {
    const wynik = wylaczSpokojnyTryb(pobierzKontekstOperacji());
    setKomunikatWidoku(wynik.ok ? '0128' : wynik.kod);
  }

  const formularzSytuacji = (akordeon: boolean) => (
    <FormularzSytuacji
      daneCiazy={daneCiazy}
      dzis={dzis}
      wAkordeonie={akordeon}
      formularz={formularz}
      onZmianaFormularza={setFormularz}
      walidacja={walidacja}
      czesci={czesci}
      onDalej={przejdzDoArkusza}
      brakZgodyMatki={brakZgodyMatki}
    />
  );

  const arkusz = (
    <ArkuszPotwierdzeniaSytuacji
      otwarte={zgloszenie !== null || dopisanie !== null}
      onZamknij={() => {
        setZgloszenie(null);
        setDopisanie(null);
      }}
      zgloszenie={dopisanie !== null ? zgloszenieDopisaniaZaswiadczenia(dopisanie) : zgloszenie}
      onZapisz={zapisz}
      zajety={zajety}
      komunikat={komunikatArkusza ? <Komunikat kod={komunikatArkusza} /> : null}
    />
  );

  if (sytuacje.length === 0) {
    return (
      <>
        {arkusz}
        <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={powrot} />
        <UkladDwuKolumnowy
          tresc={formularzSytuacji(false)}
          boczna={<KartyBoczne daneCiazy={daneCiazy} drugiRodzic={osoby.drugiRodzicImieINazwisko} dzis={dzis} />}
          etykietaBocznej={t.kartaProfilu}
        />
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
    akcje:
      s.rodzaj === 'poronienie-bez-zaswiadczenia' ? (
        <Przycisk
          type="button"
          wariant="drugorzedny"
          onClick={() => {
            setKomunikatArkusza(null);
            setDopisanie(s);
          }}
        >
          {t.dopiszZaswiadczenie}
        </Przycisk>
      ) : null,
  }));
  const zPoronieniem = sytuacje.some((s) => s.rodzaj === 'poronienie-bez-zaswiadczenia');

  return (
    <>
      {arkusz}
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
                  ...(zPoronieniem ? [{ klucz: 'akcje' as const, naglowek: t.kolumny.akcje }] : []),
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
    </>
  );
}
