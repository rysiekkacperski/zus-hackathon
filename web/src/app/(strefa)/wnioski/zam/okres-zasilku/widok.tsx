'use client';

// ViewZamPeriod (3.9.1.1.2): okres zasiłku, wariant 81,5% i termin 21 dni. Urlop macierzyński z dostępnym
// wariantem ma dwie części (okres z tabelą stawek, potem wybór wariantu), urlop rodzicielski także dwie
// (tryb z datą początku, potem liczba tygodni), pozostałe rodzaje jedną.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDzis } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import type { BledyPol, KodKomunikatu, RodzajUrlopu } from '@/domena/typy';
import { ekranPoZam } from '@/domena/wnioski/zam-nawigacja';
import {
  okresyMacierzynskiego,
  parametryOkresuZam,
  walidujOkresZam,
  type FormularzOkresuZam,
  type PoleOkresuZam,
} from '@/domena/wnioski/zam-okresy';
import { CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { Tabela } from '@/komponenty/tabela';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import {
  adresPoprzedniegoKrokuZam,
  BrakWnioskuZam,
  DaneBoczne,
  KartaTwojWniosek,
  KomunikatBleduZapisu,
  liczbaCzesciZam,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  tekstOkresu,
  useKrokiKreatoraZam,
  useWniosekZam,
  usePrzejscieDalej,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../_czesci/kreator';
import { FormularzOkresuPrzyjecia } from './_czesci/okres-przyjecia';

const t = teksty.ViewZamPeriod;
const tk = teksty.ViewZamLeaveType.kreator;

/** Cel fokusu pól w kolejności na ekranie: nazwa grupy opcji albo identyfikator pola. */
const POLA: Record<PoleOkresuZam, string> = {
  wariant: 'zam-wariant',
  trybRodzicielskiego: 'zam-tryb',
  dataPoczatku: 'zam-data-poczatku',
  tygodnie: 'zam-tygodnie',
  dataOjcowskiego: 'zam-data-ojcowskiego',
  dniOjcowskiego: 'zam-dni-ojcowskiego',
};
const KOLEJNOSC_POL = Object.keys(POLA) as PoleOkresuZam[];

/** Pola każdej części ekranu. */
function podzialOkresu(rodzaj: RodzajUrlopu, liczba: number): PoleOkresuZam[][] {
  if (liczba < 2) return [KOLEJNOSC_POL];
  if (rodzaj === 'rodzicielski') return [['trybRodzicielskiego', 'dataPoczatku'], ['tygodnie']];
  return [[], ['wariant']];
}

function formularzPoczatkowy(dane: DaneWnioskuZam): FormularzOkresuZam {
  const w = dane.wniosek;
  const ojcowski = w.okresy.find((o) => o.rodzajUrlopu === 'ojcowski');
  return {
    wariant: w.wariant === 'caly-rodzicielski' || w.wariant === 'tylko-macierzynski' ? w.wariant : null,
    trybRodzicielskiego: w.rodzicielski?.tryb ?? null,
    dataPoczatku: w.rodzicielski?.tryb === 'pozniej' && w.rodzicielski.dataPoczatku ? formatujDate(w.rodzicielski.dataPoczatku) : '',
    tygodnie: w.rodzicielski?.tygodnie !== undefined ? String(w.rodzicielski.tygodnie) : '',
    dataOjcowskiego: ojcowski ? formatujDate(ojcowski.od) : '',
    dniOjcowskiego: ojcowski?.dni !== undefined ? String(ojcowski.dni) : '',
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

function FormularzOkresu({ dane }: { dane: DaneWnioskuZam }) {
  const router = useRouter();
  const dzis = useDzis();
  const { wniosek, okresy: k } = dane;
  const rodzaj = wniosek.rodzajUrlopu ?? 'macierzynski';
  const p = parametryOkresuZam(k, dzis);
  const { przejdzDalej, zajety } = usePrzejscieDalej();
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const kroki = useKrokiKreatoraZam(dane);
  const [f, ustawF] = useState<FormularzOkresuZam>(() => formularzPoczatkowy(dane));
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: f,
    waliduj: (w: FormularzOkresuZam): BledyPol<PoleOkresuZam> => {
      const wynik = walidujOkresZam(rodzaj, w, k, dzis);
      return wynik.ok ? {} : wynik.bledy;
    },
    pola: POLA,
  });
  const liczba = liczbaCzesciZam(kroki, 'ViewZamPeriod');
  const czesci = useCzesciFormularza({ liczba, podzial: podzialOkresu(rodzaj, liczba), walidacja });

  const zmien = <K extends keyof FormularzOkresuZam>(pole: K, wartosc: FormularzOkresuZam[K]) => {
    ustawF((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  };

  const dalej = () => {
    const wynik = walidujOkresZam(rodzaj, f, k, dzis);
    if (!wynik.ok) return;
    ustawBladZapisu(przejdzDalej(wniosek, wynik.zmiana, ekranPoZam(wniosek, 'ViewZamPeriod', k.przedPorodem)));
  };

  const zapisz = () => {
    const wynik = walidujOkresZam(rodzaj, f, k, dzis);
    ustawBladZapisu(zapiszDoDokonczenia(wniosek, wynik.ok ? wynik.zmiana : {}, 'ViewZamPeriod'));
  };

  const wstecz = () => router.push(adresPoprzedniegoKrokuZam(kroki, 'ViewZamPeriod', wniosek.idWniosku, 'ViewZamLeaveType'));

  const komunikaty: React.ReactNode[] = [];
  if (bladZapisu) komunikaty.push(<KomunikatBleduZapisu key="zapis" kod={bladZapisu} />);
  if (rodzaj === 'macierzynski' && !p.wariantDostepny) komunikaty.push(<Komunikat key="0038" kod="0038" />);

  const przy = tk.przyLiczbieDzieci[k.liczbaDzieci];
  let tresc: React.ReactNode = null;

  if (rodzaj === 'macierzynski' && p.okresMacierzynski) {
    const [mac, rodz] = okresyMacierzynskiego(p, 'caly-rodzicielski');
    const zWariantem = p.wariantDostepny && mac && rodz;
    tresc = (
      <>
        <CzescFormularza czesci={czesci} numer={1}>
          <Karta tytul={t.macierzynski.tytul} bezLinii>
            <p className="m-0 mb-6">
              {k.przedPorodem
                ? t.macierzynski.wstepPrzedPorodem({ przy, tygodnie: p.tygodnieMacierzynskiego })
                : t.macierzynski.wstep({ przy, tygodnie: p.tygodnieMacierzynskiego })}
            </p>
            {!p.wariantDostepny ? <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p> : null}
            <WierszOkresu
              pozycje={[
                { etykieta: t.macierzynski.od, wartosc: formatujDate(p.okresMacierzynski.od) },
                { etykieta: t.macierzynski.do, wartosc: formatujDate(p.okresMacierzynski.do) },
                {
                  etykieta: t.macierzynski.wymiar,
                  wartosc: t.macierzynski.wymiarWartosc({ tygodnie: p.tygodnieMacierzynskiego, dzieci: tk.liczbaDzieciNawias({ liczba: k.liczbaDzieci }) }),
                },
              ]}
            />
            {!p.wariantDostepny ? (
              <div className="mt-6">
                <DaneBoczne pozycje={[{ etykieta: t.macierzynski.zasilek, wartosc: t.macierzynski.zasilek100 }]} />
                <p className="m-0 mt-4">{t.macierzynski.poTerminie}</p>
              </div>
            ) : null}
            {zWariantem ? (
              <Tabela
                className="mt-6"
                podpis={t.wariant.podpisTabeli}
                podpisWidoczny
                etykietaPrzewijania={t.wariant.przewijanieTabeli}
                kolumny={[
                  { klucz: 'okres', naglowek: t.wariant.kolumnaOkres, tytulowa: true },
                  { klucz: 'caly', naglowek: t.wariant.kolumnaCaly },
                  { klucz: 'tylko', naglowek: t.wariant.kolumnaTylko },
                ]}
                wiersze={[
                  {
                    id: 'macierzynski',
                    okres: (
                      <>
                        <span className="block font-semibold">{tk.rodzajeUrlopu.macierzynski}</span>
                        {tekstOkresu(mac)}
                      </>
                    ),
                    caly: '81,5%',
                    tylko: '100%',
                  },
                  {
                    id: 'rodzicielski',
                    okres: (
                      <>
                        <span className="block font-semibold">{tk.rodzajeUrlopu.rodzicielski}</span>
                        {tekstOkresu(rodz)}
                      </>
                    ),
                    caly: '81,5%',
                    tylko: t.wariant.osobnyWniosek,
                  },
                ]}
              />
            ) : null}
          </Karta>
        </CzescFormularza>
        {zWariantem ? (
          <CzescFormularza czesci={czesci} numer={czesci.liczba}>
            <Karta tytul={t.wariant.tytul} bezLinii>
              <p className="m-0 mb-6">
                {k.przedPorodem || p.terminWariantu === null || p.dniDoTerminu === null
                  ? t.wariant.terminPrzedPorodem
                  : t.wariant.termin({ dni: tk.dni({ liczba: p.dniDoTerminu }), data: formatujDate(p.terminWariantu) })}
              </p>
              <GrupaOpcji
                nazwa={POLA.wariant}
                legenda={t.wariant.legenda}
                uklad="karty"
                wartosc={f.wariant}
                onZmiana={(w) => zmien('wariant', w)}
                {...walidacja.pole('wariant')}
                opcje={[
                  {
                    wartosc: 'caly-rodzicielski',
                    etykieta: t.wariant.caly,
                    opis: t.wariant.opisCaly({ okresMacierzynski: tekstOkresu(mac), okresRodzicielski: tekstOkresu(rodz) }),
                  },
                  { wartosc: 'tylko-macierzynski', etykieta: t.wariant.tylko, opis: t.wariant.opisTylko },
                ]}
              />
            </Karta>
          </CzescFormularza>
        ) : null}
      </>
    );
  } else if (rodzaj === 'uzupelniajacy' && p.okresUzupelniajacy) {
    tresc = (
      <Karta tytul={t.uzupelniajacy.tytul} bezLinii>
        <p className="m-0 mb-6">{t.uzupelniajacy.wstep}</p>
        <WierszOkresu
          pozycje={[
            { etykieta: t.macierzynski.od, wartosc: formatujDate(p.okresUzupelniajacy.od) },
            { etykieta: t.macierzynski.do, wartosc: formatujDate(p.okresUzupelniajacy.do) },
            { etykieta: t.macierzynski.zasilek, wartosc: t.macierzynski.zasilek100 },
          ]}
        />
      </Karta>
    );
  } else if (rodzaj === 'rodzicielski') {
    const podglad = walidujOkresZam(rodzaj, f, k, dzis);
    const zakres = p.rodzicielski.zakresPozniej;
    const maBledy = Object.values(walidacja.bledy).some(Boolean);
    tresc = (
      <Karta tytul={t.rodzicielski.tytul} bezLinii>
        <div className="flex flex-col gap-6">
          <CzescFormularza czesci={czesci} numer={1}>
            <GrupaOpcji
              nazwa={POLA.trybRodzicielskiego}
              legenda={t.rodzicielski.legenda}
              uklad="karty"
              wartosc={f.trybRodzicielskiego}
              onZmiana={(w) => zmien('trybRodzicielskiego', w)}
              {...walidacja.pole('trybRodzicielskiego')}
              opcje={[
                {
                  wartosc: 'bezposrednio',
                  etykieta: t.rodzicielski.bezposrednio,
                  opis: p.rodzicielski.bezposrednioOd ? t.rodzicielski.bezposrednioOpis({ od: formatujDate(p.rodzicielski.bezposrednioOd) }) : undefined,
                },
                {
                  wartosc: 'pozniej',
                  etykieta: t.rodzicielski.pozniej,
                  opis: zakres ? t.rodzicielski.pozniejOpis({ data: formatujDate(zakres.do) }) : undefined,
                },
              ]}
            />
            {f.trybRodzicielskiego === 'pozniej' ? (
              <PoleDaty
                id={POLA.dataPoczatku}
                etykieta={t.rodzicielski.dataPoczatku}
                podpowiedz={zakres ? t.rodzicielski.podpowiedzDaty({ od: formatujDate(zakres.od), do_: formatujDate(zakres.do) }) : undefined}
                wartosc={f.dataPoczatku}
                onZmiana={(w) => zmien('dataPoczatku', w)}
                {...walidacja.pole('dataPoczatku')}
              />
            ) : null}
          </CzescFormularza>
          <CzescFormularza czesci={czesci} numer={czesci.liczba}>
            <PoleLiczby
              id={POLA.tygodnie}
              etykieta={t.rodzicielski.tygodnie}
              podpowiedz={
                t.rodzicielski.podpowiedzTygodni({ maks: p.rodzicielski.maksTygodni, przy })
              }
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
                  wartosc: podglad.ok && podglad.zmiana.okresy[0] && !maBledy ? tekstOkresu(podglad.zmiana.okresy[0]) : t.rodzicielski.wyliczymy,
                },
                { etykieta: t.macierzynski.zasilek, wartosc: t.rodzicielski.zasilek70 },
              ]}
            />
          </CzescFormularza>
        </div>
      </Karta>
    );
  } else if (rodzaj === 'ojcowski') {
    const zakres = p.ojcowski.zakres;
    const podglad = walidujOkresZam(rodzaj, f, k, dzis);
    tresc = (
      <Karta tytul={t.ojcowski.tytul} bezLinii>
        <div className="flex flex-col gap-6">
          <p className="m-0">{t.ojcowski.wstep}</p>
          <PoleDaty
            id={POLA.dataOjcowskiego}
            etykieta={t.ojcowski.dataPoczatku}
            podpowiedz={zakres ? t.rodzicielski.podpowiedzDaty({ od: formatujDate(zakres.od), do_: formatujDate(zakres.do) }) : undefined}
            wartosc={f.dataOjcowskiego}
            onZmiana={(w) => zmien('dataOjcowskiego', w)}
            {...walidacja.pole('dataOjcowskiego')}
          />
          <PoleLiczby
            id={POLA.dniOjcowskiego}
            etykieta={t.ojcowski.liczbaDni}
            podpowiedz={t.ojcowski.podpowiedzDni({ od: p.ojcowski.minDni, do_: p.ojcowski.maksDni })}
            wartosc={f.dniOjcowskiego ?? ''}
            onZmiana={(w) => zmien('dniOjcowskiego', w)}
            {...walidacja.pole('dniOjcowskiego')}
            szerokosc="waska"
            maksDlugosc={2}
          />
          <WierszOkresu
            pozycje={[
              {
                etykieta: t.rodzicielski.okres,
                wartosc:
                  podglad.ok && podglad.zmiana.okresy[0] && !walidacja.blad('dataOjcowskiego') && !walidacja.blad('dniOjcowskiego')
                    ? tekstOkresu(podglad.zmiana.okresy[0])
                    : t.rodzicielski.wyliczymy,
              },
              { etykieta: t.macierzynski.zasilek, wartosc: t.macierzynski.zasilek100 },
            ]}
          />
        </div>
      </Karta>
    );
  }

  const boczna = (
    <>
      <KartaTwojWniosek dane={dane} zmien={{ ekran: 'ViewZamLeaveType', etykieta: tk.twojWniosek.zmienRodzaj }} />
      {rodzaj === 'macierzynski' && !k.przedPorodem && p.terminWariantu ? (
        <Karta tytul={t.boczna.terminTytul} bezLinii>
          <div className="flex items-start gap-3">
            <Ikona nazwa="zegar" className="flex-none text-brand" />
            <p className="m-0">
              {p.wariantDostepny ? t.boczna.terminWTerminie : t.boczna.terminMinal({ data: formatujDate(p.terminWariantu) })}
            </p>
          </div>
        </Karta>
      ) : null}
      {rodzaj === 'rodzicielski' ? (
        <Karta tytul={t.boczna.wymiarTytul} bezLinii>
          {k.rodzic === 'drugi-rodzic' ? (
            <p className="m-0">{t.boczna.wymiarDlaDrugiegoRodzica}</p>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="m-0">{t.boczna.wymiarZwykly}</p>
              <p className="m-0">{t.boczna.wymiarZaZyciem}</p>
              <p className="m-0">{t.boczna.wymiarDrugiegoRodzica}</p>
            </div>
          )}
        </Karta>
      ) : null}
    </>
  );

  return (
    <RamaKreatoraZam
      ekran="ViewZamPeriod"
      wniosek={wniosek}
      kroki={kroki}
      czesc={czesci.czesc}
      komunikaty={komunikaty.length > 0 ? komunikaty : null}
      boczna={boczna}
    >
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          czesci.dalej(dalej);
        }}
      >
        {tresc}
        <PrzyciskiKreatora onWstecz={() => czesci.wroc(wstecz)} onZapisz={zapisz} onDalej={() => undefined} zajety={zajety} />
      </form>
    </RamaKreatoraZam>
  );
}

export function WidokOkresuZasilkuZam() {
  const { dane } = useWniosekZam();
  if (dane === null) return <BrakWnioskuZam ekran="ViewZamPeriod" />;
  const przyjecie = dane.kontekst.rodzina.daneCiazy?.przyjecie;
  const rodzaj = dane.wniosek.rodzajUrlopu;
  if (przyjecie && (rodzaj === 'na-warunkach-macierzynskiego' || rodzaj === 'rodzicielski')) {
    return <FormularzOkresuPrzyjecia key={dane.wniosek.idWniosku} dane={dane} przyjecie={przyjecie} />;
  }
  return <FormularzOkresu key={dane.wniosek.idWniosku} dane={dane} />;
}
