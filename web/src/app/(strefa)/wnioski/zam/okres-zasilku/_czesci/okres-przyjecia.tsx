'use client';

// ViewZamPeriod w trybie przyjęcia dziecka na wychowanie (3.9.8.1.1): okres urlopu na warunkach urlopu
// macierzyńskiego z wariantem 81,5% w terminie 21 dni od przyjęcia (0165 po terminie) albo okres urlopu
// rodzicielskiego po przyjęciu dziecka (0042, 0061).
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import { formatujDate, roznicaDni } from '@/domena/daty';
import type { BledyPol, KodKomunikatu, PrzyjecieDziecka, WniosekZam } from '@/domena/typy';
import { walidujDateWZakresie } from '@/domena/walidacje';
import { ekranPoZam } from '@/domena/wnioski/zam-nawigacja';
import {
  czyWyrownaniePoPrzyjeciu,
  komunikatDzieciPoWieku,
  okresWum,
  okresyZamPoPrzyjeciu,
  parametryRodzicielskiegoPoPrzyjeciu,
  walidujRodzicielskiPoPrzyjeciu,
  wariantPoPrzyjeciu,
  zakresPoczatkuWum,
  type FormularzRodzicielskiegoPoPrzyjeciu,
} from '@/domena/wnioski/zam-przyjecie';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import {
  adresPoprzedniegoKrokuZam,
  DaneBoczne,
  KartaTwojWniosek,
  KomunikatBleduZapisu,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  tekstOkresu,
  useKrokiKreatoraZam,
  usePrzejscieDalej,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../../_czesci/kreator';

const t = teksty.ViewZamPeriod;
const tp = t.przyjecie;
const tk = teksty.ViewZamLeaveType.kreator;

type WariantPrzyjecia = 'caly-rodzicielski' | 'tylko-wum';

interface FormularzPrzyjecia extends FormularzRodzicielskiegoPoPrzyjeciu {
  wariant: WariantPrzyjecia | null;
  poczatekWum: string;
}

type PolePrzyjecia = 'poczatekWum' | 'wariant' | 'tryb' | 'dataPoczatku' | 'tygodnie';

const POLA: Record<PolePrzyjecia, string> = {
  poczatekWum: 'zam-przyjecie-poczatek-wum',
  wariant: 'zam-przyjecie-wariant',
  tryb: 'zam-przyjecie-tryb',
  dataPoczatku: 'zam-przyjecie-data-poczatku',
  tygodnie: 'zam-przyjecie-tygodnie',
};

function formularzPoczatkowy(w: WniosekZam, dataPrzyjecia: string): FormularzPrzyjecia {
  const wumWniosku = w.okresy.find((o) => o.rodzajUrlopu === 'na-warunkach-macierzynskiego');
  return {
    poczatekWum: formatujDate(wumWniosku?.od ?? dataPrzyjecia),
    wariant: w.wariant === 'caly-rodzicielski' ? 'caly-rodzicielski' : w.wariant === 'tylko-macierzynski' ? 'tylko-wum' : null,
    tryb: w.rodzicielski?.tryb ?? null,
    dataPoczatku: w.rodzicielski?.tryb === 'pozniej' && w.rodzicielski.dataPoczatku ? formatujDate(w.rodzicielski.dataPoczatku) : '',
    tygodnie: w.rodzicielski?.tygodnie !== undefined ? String(w.rodzicielski.tygodnie) : '',
  };
}

function WierszOkresu({ pozycje }: { pozycje: { etykieta: string; wartosc: string }[] }) {
  return (
    <dl className="m-0 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {pozycje.map((p) => (
        <div key={p.etykieta} className="min-w-0">
          <dt className="text-body-strong">{p.etykieta}</dt>
          <dd className="m-0">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FormularzOkresuPrzyjecia({ dane, przyjecie }: { dane: DaneWnioskuZam; przyjecie: PrzyjecieDziecka }) {
  const router = useRouter();
  const dzis = useDzis();
  const katalog = useKatalog();
  const { wniosek, okresy: k } = dane;
  const rodzaj = wniosek.rodzajUrlopu === 'rodzicielski' ? 'rodzicielski' : 'na-warunkach-macierzynskiego';
  const { przejdzDalej, zajety } = usePrzejscieDalej();
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const kroki = useKrokiKreatoraZam(dane);
  const [f, ustawF] = useState<FormularzPrzyjecia>(() => formularzPoczatkowy(wniosek, przyjecie.dataPrzyjecia));
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);

  const zakresWum = zakresPoczatkuWum(przyjecie.dataPrzyjecia);
  /** Data początku urlopu na warunkach urlopu macierzyńskiego: puste pole oznacza dzień przyjęcia (0010, 0042). */
  const poczatekZPola = (tekst: string) =>
    tekst.trim() === '' ? { data: przyjecie.dataPrzyjecia } : walidujDateWZakresie(tekst, zakresWum, { format: '0010', zaWczesnie: '0042', zaPozno: '0042' });
  const wynikPoczatku = poczatekZPola(f.poczatekWum);
  const poczatekWum = rodzaj === 'na-warunkach-macierzynskiego' && 'data' in wynikPoczatku ? wynikPoczatku.data : przyjecie.dataPrzyjecia;
  const wum = okresWum(przyjecie, katalog, poczatekWum);
  const wariant = wariantPoPrzyjeciu(przyjecie.dataPrzyjecia, dzis);
  const parametry = parametryRodzicielskiegoPoPrzyjeciu(przyjecie, k.zaZyciem, katalog, { poczatekWum, dzis });
  const daneZapisu = { przyjecie: { forma: przyjecie.forma, dataPrzyjecia: przyjecie.dataPrzyjecia } };
  const wyrownanie = parametry !== null && czyWyrownaniePoPrzyjeciu(parametry, parametry.poczatekBezposrednio);

  const waliduj = (w: FormularzPrzyjecia): BledyPol<PolePrzyjecia> => {
    if (rodzaj === 'na-warunkach-macierzynskiego') {
      const bledy: BledyPol<PolePrzyjecia> = {};
      const poczatek = poczatekZPola(w.poczatekWum);
      if ('kod' in poczatek) bledy.poczatekWum = poczatek.kod;
      if (wariant.dostepny && w.wariant === null) bledy.wariant = '0006';
      return bledy;
    }
    if (parametry === null) return {};
    return walidujRodzicielskiPoPrzyjeciu(w, parametry).bledy;
  };
  const walidacja = useWalidacjaNaBiezaco({ wartosci: f, waliduj, pola: POLA });

  const zmien = <K extends keyof FormularzPrzyjecia>(pole: K, wartosc: FormularzPrzyjecia[K]) => {
    ustawF((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  };

  /** Zmiana szkicu z bieżącego formularza albo null, gdy formularz ma błędy. */
  const zmianaSzkicu = (): Partial<WniosekZam> | null => {
    if (Object.keys(waliduj(f)).length > 0) return null;
    if (rodzaj === 'na-warunkach-macierzynskiego') {
      const wybrany: WariantPrzyjecia = wariant.dostepny && f.wariant === 'caly-rodzicielski' ? 'caly-rodzicielski' : 'tylko-wum';
      return {
        ...daneZapisu,
        okresy: okresyZamPoPrzyjeciu({ przyjecie, zaZyciem: k.zaZyciem, wariant: wybrany, poczatekWum }, katalog),
        wariant: wariant.dostepny ? (wybrany === 'caly-rodzicielski' ? 'caly-rodzicielski' : 'tylko-macierzynski') : 'brak',
        rodzicielski: wybrany === 'caly-rodzicielski' && parametry ? { tryb: 'bezposrednio', tygodnie: parametry.maksWnioskodawcy } : undefined,
      };
    }
    if (parametry === null || f.tryb === null) return null;
    const wynik = walidujRodzicielskiPoPrzyjeciu(f, parametry);
    if (!wynik.okres) return null;
    return {
      ...daneZapisu,
      okresy: [wynik.okres],
      wariant: 'brak',
      rodzicielski: { tryb: f.tryb, dataPoczatku: wynik.okres.od, tygodnie: wynik.okres.tygodnie },
    };
  };

  const dalej = () => {
    if (!walidacja.sprobujWyslac()) return;
    const zmiana = zmianaSzkicu();
    if (zmiana === null) return;
    ustawBladZapisu(przejdzDalej(wniosek, zmiana, ekranPoZam(wniosek, 'ViewZamPeriod', false)));
  };

  const zapisz = () => ustawBladZapisu(zapiszDoDokonczenia(wniosek, zmianaSzkicu() ?? daneZapisu, 'ViewZamPeriod'));
  const wstecz = () => router.push(adresPoprzedniegoKrokuZam(kroki, 'ViewZamPeriod', wniosek.idWniosku, 'ViewZamLeaveType'));

  const komunikaty: React.ReactNode[] = [];
  if (bladZapisu) komunikaty.push(<KomunikatBleduZapisu key="zapis" kod={bladZapisu} />);
  if (rodzaj === 'na-warunkach-macierzynskiego' && !wariant.dostepny) komunikaty.push(<Komunikat key="0165" kod="0165" />);
  const dzieciPoWieku = komunikatDzieciPoWieku(przyjecie, katalog);
  if (dzieciPoWieku) komunikaty.push(<Komunikat key="0263" kod="0263" parametry={dzieciPoWieku.parametry} />);
  if (parametry?.zmianaWymiaru) {
    const z = parametry.zmianaWymiaru;
    komunikaty.push(
      <Komunikat key="0296" kod="0296" parametry={{ data: formatujDate(z.data), wiek: String(z.wiek), liczbaTygodni: String(z.wymiar) }} />,
    );
  }
  if (rodzaj === 'na-warunkach-macierzynskiego' && wariant.dostepny && f.wariant === 'caly-rodzicielski' && wyrownanie) {
    komunikaty.push(<Komunikat key="0267" kod="0267" />);
  }

  let tresc: React.ReactNode = null;
  if (rodzaj === 'na-warunkach-macierzynskiego' && wum) {
    const tygodnieWum = Math.floor((roznicaDni(wum.od, wum.do) + 1) / 7);
    const najkrotszy = tygodnieWum <= 9;
    const [, rodz] = okresyZamPoPrzyjeciu({ przyjecie, zaZyciem: k.zaZyciem, wariant: 'caly-rodzicielski', poczatekWum }, katalog);
    const opisCaly = wyrownanie ? tp.opisCalyWyrownanie : tp.opisCaly;
    tresc = (
      <Karta tytul={tp.tytulWum} bezLinii>
        <div className="flex flex-col gap-6">
          <p className="m-0">{tp.wstepWum({ data: formatujDate(przyjecie.dataPrzyjecia), do_: formatujDate(zakresWum.do) })}</p>
          <PoleDaty
            id={POLA.poczatekWum}
            etykieta={tp.poczatekWum}
            podpowiedz={tp.podpowiedzPoczatkuWum({ od: formatujDate(zakresWum.od), do_: formatujDate(zakresWum.do) })}
            wartosc={f.poczatekWum}
            onZmiana={(w) => zmien('poczatekWum', w)}
            {...walidacja.pole('poczatekWum')}
          />
          <WierszOkresu
            pozycje={[
              { etykieta: t.macierzynski.od, wartosc: formatujDate(wum.od) },
              { etykieta: t.macierzynski.do, wartosc: formatujDate(wum.do) },
              { etykieta: t.macierzynski.wymiar, wartosc: najkrotszy ? tp.wymiarNajkrotszy : tp.wymiarTygodni({ tygodnie: tygodnieWum }) },
            ]}
          />
          {wariant.dostepny ? (
            <>
              <p className="m-0">{tp.termin({ dni: tk.dni({ liczba: wariant.dniPozostale }), data: formatujDate(wariant.termin) })}</p>
              <GrupaOpcji
                nazwa={POLA.wariant}
                legenda={tp.legendaWariantu}
                uklad="karty"
                wartosc={f.wariant}
                onZmiana={(w) => zmien('wariant', w)}
                {...walidacja.pole('wariant')}
                opcje={[
                  {
                    wartosc: 'caly-rodzicielski',
                    etykieta: tp.caly,
                    opis:
                      rodz && parametry
                        ? opisCaly({
                            okresWum: tekstOkresu(wum),
                            okresRodzicielski: tekstOkresu(rodz),
                            tygodnie: parametry.maksWnioskodawcy,
                            wymiar: parametry.wymiar,
                          })
                        : undefined,
                  },
                  { wartosc: 'tylko-wum', etykieta: tp.tylko, opis: tp.opisTylko },
                ]}
              />
            </>
          ) : (
            <DaneBoczne pozycje={[{ etykieta: t.macierzynski.zasilek, wartosc: t.macierzynski.zasilek100 }]} />
          )}
        </div>
      </Karta>
    );
  } else if (rodzaj === 'rodzicielski' && parametry) {
    const zakres = parametry.zakresPoczatku;
    const podglad = walidujRodzicielskiPoPrzyjeciu(f, parametry);
    tresc = (
      <Karta tytul={t.rodzicielski.tytul} bezLinii>
        <div className="flex flex-col gap-6">
          <GrupaOpcji
            nazwa={POLA.tryb}
            legenda={t.rodzicielski.legenda}
            uklad="karty"
            wartosc={f.tryb}
            onZmiana={(w) => zmien('tryb', w)}
            {...walidacja.pole('tryb')}
            opcje={[
              {
                wartosc: 'bezposrednio',
                etykieta: tp.bezposrednio,
                opis: t.rodzicielski.bezposrednioOpis({ od: formatujDate(parametry.poczatekBezposrednio) }),
              },
              { wartosc: 'pozniej', etykieta: t.rodzicielski.pozniej, opis: tp.pozniejOpis({ data: formatujDate(zakres.do) }) },
            ]}
          />
          {f.tryb === 'pozniej' ? (
            <PoleDaty
              id={POLA.dataPoczatku}
              etykieta={t.rodzicielski.dataPoczatku}
              podpowiedz={t.rodzicielski.podpowiedzDaty({ od: formatujDate(zakres.od), do_: formatujDate(zakres.do) })}
              wartosc={f.dataPoczatku}
              onZmiana={(w) => zmien('dataPoczatku', w)}
              {...walidacja.pole('dataPoczatku')}
            />
          ) : null}
          <PoleLiczby
            id={POLA.tygodnie}
            etykieta={t.rodzicielski.tygodnie}
            podpowiedz={t.rodzicielski.podpowiedzTygodni({ maks: parametry.maksWnioskodawcy, przy: tk.przyLiczbieDzieci[przyjecie.liczbaPrzyjetychDzieci] })}
            wartosc={f.tygodnie}
            onZmiana={(w) => zmien('tygodnie', w)}
            {...walidacja.pole('tygodnie')}
            szerokosc="waska"
            maksDlugosc={2}
          />
          <WierszOkresu
            pozycje={[
              {
                etykieta: t.rodzicielski.okres,
                wartosc: podglad.okres && Object.keys(podglad.bledy).length === 0 ? tekstOkresu(podglad.okres) : t.rodzicielski.wyliczymy,
              },
              { etykieta: t.macierzynski.zasilek, wartosc: t.rodzicielski.zasilek70 },
            ]}
          />
        </div>
      </Karta>
    );
  }

  const boczna = (
    <>
      <KartaTwojWniosek dane={dane} zmien={{ ekran: 'ViewZamLeaveType', etykieta: tk.twojWniosek.zmienRodzaj }} />
      {rodzaj === 'na-warunkach-macierzynskiego' ? (
        <Karta tytul={t.boczna.terminTytul} bezLinii>
          <div className="flex items-start gap-3">
            <Ikona nazwa="zegar" className="flex-none text-brand" />
            <p className="m-0">
              {wariant.dostepny
                ? tp.boczneTermin({ data: formatujDate(wariant.termin) })
                : tp.boczneTerminMinal({ data: formatujDate(wariant.termin) })}
            </p>
          </div>
        </Karta>
      ) : parametry ? (
        <Karta tytul={t.boczna.wymiarTytul} bezLinii>
          <p className="m-0">{tp.boczneWymiar({ wymiar: parametry.wymiar, maks: parametry.maksWnioskodawcy })}</p>
        </Karta>
      ) : null}
    </>
  );

  return (
    <RamaKreatoraZam ekran="ViewZamPeriod" wniosek={wniosek} kroki={kroki} komunikaty={komunikaty.length > 0 ? komunikaty : null} boczna={boczna}>
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          dalej();
        }}
      >
        {tresc}
        <PrzyciskiKreatora onWstecz={wstecz} onZapisz={zapisz} onDalej={() => undefined} zajety={zajety} />
      </form>
    </RamaKreatoraZam>
  );
}
