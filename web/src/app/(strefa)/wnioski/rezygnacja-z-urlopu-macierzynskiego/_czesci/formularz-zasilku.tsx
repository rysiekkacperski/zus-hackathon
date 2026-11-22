'use client';

// Rezygnacja matki z dalszej części zasiłku macierzyńskiego przy umowie zlecenia i działalności (u34, 0207 i 0261).
// Ten sam formularz w dwóch częściach (?czesc=N) służy wnioskowi ZAS-23 w symulowanym eZUS (adresat ZUS) i wnioskowi
// do zleceniodawcy, który wypłaca zasiłek (adresat płatnik składek). Część 1: data rezygnacji. Część 2: oświadczenie
// ojca dziecka. Po zapisie widok pokazuje potwierdzenie i dokumenty do wydruku: oświadczenie ojca, a u zleceniodawcy
// także wniosek o rezygnację.
import { useState } from 'react';
import { PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { DokumentDoDruku } from '@/komponenty/dokument-do-druku';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { zapiszRezygnacjeZZasilku } from '@/dane/magazyn/operacje/rezygnacja';
import type { DataISO, KodKomunikatu, WniosekOUrlop } from '@/domena/typy';
import type { UrlopMacierzynski } from '@/domena/wnioski/rezygnacja';
import {
  walidujDateRezygnacjiZZasilku,
  walidujRezygnacjeZZasilku,
  zakresRezygnacjiZZasilku,
  type FormularzRezygnacjiZZasilku,
  type PoleRezygnacjiZZasilku,
} from '@/domena/wnioski/zas23';
import { teksty } from '@/teksty';
import { ListaDanych, RamkaOkresu } from './wspolne';

const t = teksty.ViewEzusZas23;
const ID_POL: Record<PoleRezygnacjiZZasilku, string> = {
  data: 'rezygnacja-zasilku-data',
  ojciec: 'rezygnacja-zasilku-ojciec',
  oswiadczenie: 'rezygnacja-zasilku-oswiadczenie',
};
const PODZIAL: PoleRezygnacjiZZasilku[][] = [['data'], ['ojciec', 'oswiadczenie']];

export interface FormularzZasilkuProps {
  adresat: 'zus' | 'platnik-skladek';
  idSprawy: string;
  urlop: UrlopMacierzynski;
  zOrzeczeniem: boolean;
  dzis: DataISO;
  /** Imię i nazwisko matki dziecka (wnioskodawczyni). */
  matka: string;
  /** Imię i nazwisko ojca dziecka z profilu rodziny. */
  ojciec: string;
  /** Nazwa zleceniodawcy, który wypłaca zasiłek. */
  nazwaPlatnika?: string;
  /** Dane wniosku ZAM matki do karty wniosku. */
  pozycjeZam?: { etykieta: string; wartosc: string }[];
  /** Rezygnacja zapisana wcześniej: widok pokazuje od razu potwierdzenie i dokumenty. */
  zapisana?: WniosekOUrlop | null;
  onWroc?: () => void;
}

/** Potwierdzenie zapisanej rezygnacji z dokumentami do wydruku. */
function PotwierdzenieRezygnacji({
  wniosek,
  adresat,
  matka,
  ojciec,
  nazwaPlatnika,
}: {
  wniosek: WniosekOUrlop;
  adresat: 'zus' | 'platnik-skladek';
  matka: string;
  ojciec: string;
  nazwaPlatnika?: string;
}) {
  const okres = wniosek.okresy[0];
  const dataRezygnacji = okres ? formatujDate(okres.od) : '';
  const imieOjca = ojciec.trim() || teksty.ViewMaternityResignation.ojciecDziecka;
  const zOrzeczeniem = wniosek.rezygnacja?.zOrzeczeniem === true;
  const platnik = nazwaPlatnika ?? t.zleceniodawca;
  const miejscePodpisu = (
    <p className="m-0 mt-8 border-t border-line pt-2 text-small text-ink-muted">{t.miejscePodpisu}</p>
  );
  return (
    <>
      {adresat === 'zus' ? (
        <Komunikat
          kod="0337"
          parametry={{ data: formatujDate(wniosek.dataZlozenia ?? ''), dataRezygnacji }}
        />
      ) : (
        <Komunikat kod="0339" parametry={{ dataRezygnacji }} />
      )}
      <Karta tytul={t.kartaPotwierdzenia} bezLinii>
        <ListaDanych
          pozycje={[
            ...(wniosek.potwierdzenie ? [{ etykieta: t.numerPotwierdzenia, wartosc: wniosek.potwierdzenie }] : []),
            adresat === 'zus'
              ? { etykieta: t.dataZlozenia, wartosc: formatujDate(wniosek.dataZlozenia ?? '') }
              : { etykieta: t.dataPrzygotowania, wartosc: formatujDate(wniosek.dataPrzygotowania ?? '') },
            { etykieta: t.rezygnacjaOd, wartosc: dataRezygnacji },
            ...(okres ? [{ etykieta: t.okresOjca, wartosc: t.okres({ od: formatujDate(okres.od), do_: formatujDate(okres.do) }) }] : []),
          ]}
        />
      </Karta>
      {adresat === 'platnik-skladek' ? (
        <DokumentDoDruku tytul={t.dokumentWniosku} nazwaPliku={t.nazwaPlikuWniosku}>
          <p className="m-0">
            {zOrzeczeniem
              ? t.trescWnioskuZOrzeczeniem({ matka, data: dataRezygnacji, platnik })
              : t.trescWniosku({ matka, data: dataRezygnacji, platnik })}
          </p>
          {miejscePodpisu}
        </DokumentDoDruku>
      ) : null}
      <DokumentDoDruku tytul={t.dokumentOswiadczenia} nazwaPliku={t.nazwaPlikuOswiadczenia}>
        <p className="m-0">{t.trescOswiadczenia({ ojciec: imieOjca, matka, data: dataRezygnacji })}</p>
        {miejscePodpisu}
      </DokumentDoDruku>
    </>
  );
}

export function FormularzRezygnacjiZZasilku(p: FormularzZasilkuProps) {
  const [formularz, setFormularz] = useState<FormularzRezygnacjiZZasilku>({ data: '', ojciec: p.ojciec, oswiadczenie: false });
  const [zapisany, setZapisany] = useState<WniosekOUrlop | null>(p.zapisana ?? null);
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const [zajety, setZajety] = useState(false);
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: FormularzRezygnacjiZZasilku) => walidujRezygnacjeZZasilku(f, p.urlop, p.zOrzeczeniem, p.dzis),
    pola: ID_POL,
  });
  const czesci = useCzesciFormularza({ liczba: PODZIAL.length, podzial: PODZIAL, walidacja });

  if (zapisany) {
    return (
      <PotwierdzenieRezygnacji
        wniosek={zapisany}
        adresat={p.adresat}
        matka={p.matka}
        ojciec={formularz.ojciec}
        nazwaPlatnika={p.nazwaPlatnika}
      />
    );
  }

  const zakres = zakresRezygnacjiZZasilku(p.urlop, p.zOrzeczeniem, p.dzis);
  const data = walidujDateRezygnacjiZZasilku(formularz.data, p.urlop, p.zOrzeczeniem, p.dzis);
  const poprawnaData = 'data' in data ? data.data : null;
  const zmien = <K extends keyof FormularzRezygnacjiZZasilku>(pole: K, wartosc: FormularzRezygnacjiZZasilku[K]) =>
    setFormularz((f) => ({ ...f, [pole]: wartosc }));
  const zus = p.adresat === 'zus';
  const etykietaOswiadczenia = poprawnaData
    ? (zus ? t.potwierdzenie : t.potwierdzenieZleceniodawca)({ data: formatujDate(poprawnaData) })
    : zus
      ? t.potwierdzenieBezDaty
      : t.potwierdzenieZleceniodawcaBezDaty;

  function zapisz() {
    if (poprawnaData === null) return;
    setZajety(true);
    const wynik = zapiszRezygnacjeZZasilku(
      {
        idSprawy: p.idSprawy,
        dataRezygnacji: poprawnaData,
        koniecZasilku: p.urlop.okres.do,
        zOrzeczeniem: p.zOrzeczeniem,
        ojciec: formularz.ojciec,
      },
      p.adresat,
      pobierzKontekstOperacji(),
    );
    setZajety(false);
    if (!wynik.ok) {
      setBlad(wynik.kod);
      return;
    }
    setBlad(null);
    setZapisany(wynik.wartosc);
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      {blad ? <Komunikat kod={blad} /> : null}
      {czesci.czesc === 1 ? (
        <Karta tytul={t.kartaWniosku} bezLinii>
          {p.pozycjeZam && p.pozycjeZam.length > 0 ? (
            <div className="mb-6">
              <ListaDanych pozycje={[{ etykieta: t.ubezpieczona, wartosc: p.matka }, ...p.pozycjeZam]} />
            </div>
          ) : null}
          <PoleDaty
            id={ID_POL.data}
            etykieta={t.poleDaty}
            podpowiedz={t.podpowiedzDaty({ od: formatujDate(zakres.od), do_: formatujDate(zakres.do) })}
            wartosc={formularz.data}
            onZmiana={(w) => zmien('data', w)}
            {...walidacja.pole('data')}
            wymagane
            className="max-w-120"
          />
          {poprawnaData ? (
            <RamkaOkresu
              etykieta={t.ojciecPobiera}
              okres={t.okres({ od: formatujDate(poprawnaData), do_: formatujDate(p.urlop.okres.do) })}
            />
          ) : null}
        </Karta>
      ) : (
        <Karta tytul={t.kartaOswiadczenia} bezLinii>
          <p className="m-0 mb-6">{t.oswiadczenieWstep}</p>
          <div className="flex flex-col gap-6">
            <PoleTekstowe
              id={ID_POL.ojciec}
              etykieta={t.poleOjca}
              wartosc={formularz.ojciec}
              onZmiana={(w) => zmien('ojciec', w)}
              {...walidacja.pole('ojciec')}
              wymagane
              autoComplete="off"
              className="max-w-120"
            />
            <PoleZaznaczenia
              id={ID_POL.oswiadczenie}
              etykieta={etykietaOswiadczenia}
              zaznaczone={formularz.oswiadczenie}
              onZmiana={(z) => zmien('oswiadczenie', z)}
              {...walidacja.pole('oswiadczenie')}
            />
          </div>
          {zus ? (
            <Notatka className="mt-6" ikona="info">
              {teksty.ViewEzusHome.notatka}
            </Notatka>
          ) : null}
        </Karta>
      )}
      <PrzyciskiCzesci
        czesci={czesci}
        onAkcjaKroku={zapisz}
        etykietaAkcji={zus ? t.wyslij : t.przygotuj}
        onWrocKroku={p.onWroc}
        zajety={zajety}
      />
    </>
  );
}
