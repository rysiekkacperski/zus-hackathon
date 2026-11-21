'use client';

// SheetCalcReturnToWork (kontrakt, tabela 2.3): arkusz na ViewCalcMaternityResult, otwierany parametrem ?arkusz=powrot-do-pracy&rodzic=. Właściciel: u20.
// Historyjka 3.10.4.6.1: zmiana daty powrotu jednego rodzica, urlop rodzicielski w pełnych tygodniach (0245), zakres (0243, 0244)
// i porównanie sum obu wariantów przy wcześniejszym powrocie w wariancie 81,5% (0246). Renderuje go slot akcje-urlopow.
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  koniecCzesci,
  koniecMacierzynskiego,
  walidujDatePowrotu,
  wymiarRodzicielskiego,
  zakresPowrotu,
  zmienPowrot,
} from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/reguly-kalkulatora';
import { ustawArkuszWAdresie, useNazwyRodzicow } from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/rodzice';
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Arkusz } from '@/komponenty/okno';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import { wyliczScenariusz } from '@/domena/kalkulatory';
import type { CzescUrlopuRodzicielskiego, ParametryScenariusza, RodzicWRodzinie } from '@/domena/typy';
import { teksty } from '@/teksty';
import { KLASY_ARKUSZA_Z_PRZYKLEJONA_STOPKA } from '../../_czesci/arkusz';
import type { PropsArkuszaWyniku } from './typy';

const t = teksty.SheetCalcReturnToWork;
const tTygodnie = teksty.SheetCalcParentalParts.tygodnie;
const ID = 'powrot';

function opisCzesci(czesci: CzescUrlopuRodzicielskiego[]): string {
  if (czesci.length === 0) return t.bezUrlopu;
  return czesci
    .map((c) =>
      t.okresTygodnie({ od: formatujDate(c.od), do_: formatujDate(koniecCzesci(c.od, c.tygodnie)), tygodnie: tTygodnie({ liczba: c.tygodnie }) }),
    )
    .join('; ');
}

export function ArkuszPowrotuDoPracy(props: PropsArkuszaWyniku) {
  if (!props.otwarte) return null;
  return <TrescArkuszaPowrotu {...props} />;
}

function TrescArkuszaPowrotu({ daneWejsciowe: d, parametry: p, podstawy, wynik, onZmianaParametrow, onZamknij }: PropsArkuszaWyniku) {
  const nazwy = useNazwyRodzicow();
  const katalog = useKatalog();
  const dzis = useDzis();
  const adres = useSearchParams();
  const rodzic: RodzicWRodzinie = adres.get('rodzic') === 'drugi-rodzic' ? 'drugi-rodzic' : 'matka';
  const drugi: RodzicWRodzinie = rodzic === 'matka' ? 'drugi-rodzic' : 'matka';
  const wymiar = wymiarRodzicielskiego(d);
  const zakres = useMemo(
    () => zakresPowrotu(p.czesciRodzicielskiego, rodzic, wymiar, wynik, koniecMacierzynskiego(d, p, wynik)),
    [p, rodzic, wymiar, wynik, d],
  );
  const obecnaData = wynik.datyPowrotu[rodzic] ?? p.datyPowrotu[rodzic];
  const [tekst, ustawTekst] = useState(obecnaData ? formatujDate(obecnaData) : '');

  const ocena = zakres && tekst.trim() !== '' ? walidujDatePowrotu(tekst, zakres) : null;
  // Pusta data nie ma błędu: przycisk Zapisz jest wtedy nieaktywny.
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { data: tekst },
    waliduj: (w) => {
      const r = zakres && w.data.trim() !== '' ? walidujDatePowrotu(w.data, zakres) : null;
      return { data: r && 'kod' in r ? r.kod : null };
    },
    pola: { data: `${ID}-data` },
  });
  const parametrBledu = ocena && 'kod' in ocena ? ocena.parametr : undefined;
  const { zmiana, nowe } = useMemo(() => {
    const ocenaPola = zakres && tekst.trim() !== '' ? walidujDatePowrotu(tekst, zakres) : null;
    if (!zakres || !ocenaPola || !('data' in ocenaPola)) return { zmiana: null, nowe: null };
    const wynikZmiany = zmienPowrot(p.czesciRodzicielskiego, rodzic, ocenaPola.data, zakres);
    const parametry: ParametryScenariusza = {
      ...p,
      czesciRodzicielskiego: wynikZmiany.czesci,
      datyPowrotu: { ...p.datyPowrotu, [rodzic]: wynikZmiany.dataPowrotu },
    };
    return { zmiana: wynikZmiany, nowe: parametry };
  }, [zakres, tekst, p, rodzic]);

  const sumy = useMemo(() => {
    if (!nowe) return null;
    const w81 = wyliczScenariusz(d, podstawy, { ...nowe, wariant: '81-5' }, katalog, dzis);
    const w100 = wyliczScenariusz(d, podstawy, { ...nowe, wariant: '100-70' }, katalog, dzis);
    return { '81-5': w81.sumy[rodzic] ?? 0, '100-70': w100.sumy[rodzic] ?? 0 };
  }, [nowe, d, podstawy, katalog, dzis, rodzic]);

  const pokaz0246 =
    zmiana !== null &&
    sumy !== null &&
    p.wariant === '81-5' &&
    rodzic === 'matka' &&
    zmiana.niewykorzystane > 0 &&
    sumy['81-5'] < sumy['100-70'];

  const zapisz = () => {
    if (!zakres || !ocena) return;
    if (!walidacja.sprobujWyslac()) return;
    if (nowe) onZmianaParametrow(nowe);
    onZamknij();
  };

  const kto = nazwy[rodzic];
  const ktoDrugi = nazwy[drugi];
  const czesciDrugiego = p.czesciRodzicielskiego.filter((c) => c.rodzic === drugi);
  const czesciRodzica = zmiana ? zmiana.czesci.filter((c) => c.rodzic === rodzic) : [];
  const dataPowrotuDrugiego = wynik.datyPowrotu[drugi];

  const stopka = (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {zmiana && zmiana.niewykorzystane > 0 ? (
        <Przycisk wariant="tlo" type="button" onClick={() => ustawArkuszWAdresie('podzial-urlopow')}>
          {t.zaplanuj}
        </Przycisk>
      ) : null}
      <Przycisk wariant="drugorzedny" type="button" onClick={onZamknij}>
        {t.anuluj}
      </Przycisk>
      <Przycisk wariant="glowny" type="button" onClick={zapisz} disabled={!zakres || tekst.trim() === ''}>
        {t.zapisz}
      </Przycisk>
    </div>
  );

  return (
    <Arkusz
      otwarte
      onZamknij={onZamknij}
      tytul={t.tytulRodzica({ kto: kto.mianownik })}
      className={KLASY_ARKUSZA_Z_PRZYKLEJONA_STOPKA}
      opis={
        obecnaData
          ? czesciDrugiego.length > 0
            ? t.wstep({ data: formatujDate(obecnaData), kogo: kto.dopelniacz, kogoDrugiego: ktoDrugi.dopelniacz })
            : t.wstepBezDrugiego({ data: formatujDate(obecnaData), kogo: kto.dopelniacz })
          : undefined
      }
      stopka={stopka}
    >
      {!zakres ? (
        <p className="m-0 text-body">{t.brakZakresu}</p>
      ) : (
        <div className="flex flex-col gap-5">
          <PoleDaty
            id={`${ID}-data`}
            etykieta={t.pole}
            podpowiedz={t.zakres({ od: formatujDate(zakres.najwczesniej), do_: formatujDate(zakres.najpozniej) })}
            wartosc={tekst}
            onZmiana={ustawTekst}
            {...walidacja.pole('data')}
            parametryBledu={parametrBledu ? { data: formatujDate(parametrBledu) } : undefined}
          />
          {zmiana?.dopasowano ? <Komunikat kod="0245" parametry={{ data: formatujDate(zmiana.dataPowrotu) }} /> : null}
          {zmiana ? (
            <section aria-labelledby={`${ID}-po-zmianie`} className="flex flex-col gap-4" role="status">
              <p id={`${ID}-po-zmianie`} className="m-0 text-body-strong text-ink">
                {t.poZmianie}
              </p>
              <ListaDefinicji
                pozycje={[
                  { etykieta: t.urlopRodzicielski({ kogo: kto.dopelniacz }), wartosc: opisCzesci(czesciRodzica) },
                  { etykieta: t.niewykorzystane, wartosc: String(zmiana.niewykorzystane) },
                  ...(czesciDrugiego.length > 0
                    ? [
                        {
                          etykieta: t.urlopDrugiegoBezZmian({ kogo: ktoDrugi.dopelniacz }),
                          wartosc: czesciDrugiego
                            .map((c) => t.okres({ od: formatujDate(c.od), do_: formatujDate(koniecCzesci(c.od, c.tygodnie)) }))
                            .join('; '),
                        },
                      ]
                    : []),
                  ...(dataPowrotuDrugiego
                    ? [{ etykieta: t.dataPowrotuKogo({ kogo: ktoDrugi.dopelniacz }), wartosc: formatujDate(dataPowrotuDrugiego) }]
                    : []),
                  { etykieta: t.dataPowrotuKogo({ kogo: kto.dopelniacz }), wartosc: formatujDate(zmiana.dataPowrotu) },
                ]}
              />
              {sumy && (sumy['81-5'] > 0 || sumy['100-70'] > 0) ? (
                <>
                  <p className="m-0 text-body-strong text-ink">{t.sumaWyplat({ kogo: kto.dopelniacz })}</p>
                  <ListaDefinicji
                    pozycje={[
                      { etykieta: p.wariant === '100-70' ? t.wariant100Wybrany : t.wariant100, wartosc: formatujKwote(sumy['100-70']) },
                      { etykieta: p.wariant === '81-5' ? t.wariant81Wybrany : t.wariant81, wartosc: formatujKwote(sumy['81-5']) },
                    ]}
                  />
                </>
              ) : null}
              {pokaz0246 && sumy ? (
                <Komunikat
                  kod="0246"
                  parametry={{ data: formatujDate(zmiana.dataPowrotu), kwota: formatujKwote(sumy['100-70'] - sumy['81-5']) }}
                />
              ) : null}
            </section>
          ) : null}
        </div>
      )}
    </Arkusz>
  );
}
