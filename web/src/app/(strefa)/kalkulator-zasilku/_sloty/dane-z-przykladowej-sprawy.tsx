'use client';

// Slot ViewCalcMaternityInput „dane-z-przykladowej-sprawy” w liście slotyDanychWejsciowych (kontrakt, sekcja 12.4). Właściciel: u21.
// W trybie ?zrodlo=przykladowa-sprawa przekazuje gospodarzowi dane wejściowe i podstawę wymiaru ze sprawy (wzór P13-17)
// i pokazuje dane sprawy, których formularz kalkulatora nie zawiera: rolę, urlop z wniosku i opis podstawy.
// Teksty: teksty.ViewCalcMaternityInput.daneZPrzykladowejSprawy.
import { useEffect, useMemo, useRef } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Stos } from '@/komponenty/uklad';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import {
  daneWejscioweZeSprawy,
  dniPobytuWOkresieLiczenia,
  formaZTytulu,
  okresDoWyliczenia,
  ustalPodstaweZeSprawy,
} from '@/domena/przykladowe-sprawy/weryfikacja';
import type { RodzicWRodzinie } from '@/domena/typy';
import { useCzyGosc, useKatalog, useStanSesji } from '@/dane/magazyn/hooki';
import { teksty } from '@/teksty';
import type { PropsSlotu, ZmianaDanychKalkulatora } from './typy';

const T = teksty.ViewCalcMaternityInput.daneZPrzykladowejSprawy;
const ZRODLO = 'przykladowa-sprawa';

export function SlotDaneZPrzykladowejSprawy({ zrodlo, onUzupelnij }: PropsSlotu<'daneWejsciowe'>) {
  const stanSesji = useStanSesji();
  const katalog = useKatalog();
  const gosc = useCzyGosc();
  const sprawa = stanSesji?.przykladowaSprawa;
  const aktywny = zrodlo === ZRODLO && sprawa?.weryfikacja !== undefined;

  const przygotowane = useMemo(() => {
    if (!aktywny || sprawa === undefined) return null;
    const rodzic: RodzicWRodzinie = sprawa.dane.ubezpieczony.rola.wartosc === 'ojciec-przejmujacy' ? 'drugi-rodzic' : 'matka';
    const podstawa = ustalPodstaweZeSprawy(sprawa.dane, katalog);
    const zmiana: ZmianaDanychKalkulatora = {
      dane: daneWejscioweZeSprawy(sprawa.dane),
      ...('kod' in podstawa ? {} : { podstawy: { [rodzic]: podstawa } }),
    };
    return { zmiana, podstawa, okres: okresDoWyliczenia(sprawa.dane, sprawa.dokumenty) };
  }, [aktywny, sprawa, katalog]);

  // Gospodarz dostaje dane raz dla każdej wersji danych sprawy.
  const uzupelnij = useRef(onUzupelnij);
  const przekazane = useRef<string | null>(null);
  useEffect(() => {
    uzupelnij.current = onUzupelnij;
  }, [onUzupelnij]);
  const klucz = przygotowane === null ? null : JSON.stringify(przygotowane.zmiana);
  useEffect(() => {
    if (przygotowane === null || klucz === null || przekazane.current === klucz) return;
    przekazane.current = klucz;
    uzupelnij.current(przygotowane.zmiana);
  }, [klucz, przygotowane]);

  if (zrodlo !== ZRODLO) return null;
  if (sprawa === undefined || przygotowane === null) {
    return (
      <Komunikat
        typ="INFO"
        tresc={T.brakSprawy}
        akcje={<Odnosnik href={trasy.ViewSampleCaseVerification()}>{T.wrocDoWeryfikacji}</Odnosnik>}
      />
    );
  }

  const d = sprawa.dane;
  const podstawa = przygotowane.podstawa;
  const okres = przygotowane.okres;
  const liczba = String(d.zdarzenie.liczbaDzieci.wartosc ?? 1);
  const porod = d.zdarzenie.dataPorodu.wartosc;
  const termin = d.zdarzenie.przewidywanyTermin.wartosc;
  const rola = d.ubezpieczony.rola.wartosc ?? 'matka';
  const forma = formaZTytulu(d.tytul.rodzaj.wartosc);
  const pobyt = dniPobytuWOkresieLiczenia(d);
  const okresMatki = d.wniosek.okresMatki.wartosc;
  const oswiadczenie = d.wniosek.oswiadczeniePelnyWymiar.wartosc;
  const zlozono = d.wniosek.dataZlozenia.wartosc;
  const zaZyciem = d.dziecko.zaZyciem.wartosc;

  const zdarzenie =
    d.zdarzenie.rodzaj.wartosc === 'martwe-urodzenie' && porod !== null
      ? T.zdarzenieMartwe({ data: formatujDate(porod) })
      : porod !== null
        ? T.zdarzeniePorod({ data: formatujDate(porod), liczba })
        : termin !== null
          ? T.zdarzenieTermin({ data: formatujDate(termin), liczba })
          : null;

  return (
    <Stos odstep={6}>
      <p className="m-0 text-body">
        {gosc
          ? sprawa.idSprawy === undefined
            ? T.wstepGoscBezId
            : T.wstepGosc({ id: sprawa.idSprawy })
          : sprawa.idSprawy === undefined
            ? T.wstepBezId
            : T.wstep({ id: sprawa.idSprawy })}
      </p>
      <Karta tytul={T.tytulUbezpieczonej} poziomTytulu={2} bezLinii>
        <ListaDefinicji
          szerokoscEtykiety="szeroka"
          pozycje={[
            ...(zdarzenie === null ? [] : [{ etykieta: T.zdarzenie, wartosc: zdarzenie, zrodlo: ZRODLO }]),
            ...(zaZyciem === null ? [] : [{ etykieta: T.zaZyciem, wartosc: T.zaZyciemZDnia({ data: formatujDate(zaZyciem) }), zrodlo: ZRODLO }]),
            ...(pobyt === null || pobyt.dni === 0
              ? []
              : [
                  {
                    etykieta: T.pobyt,
                    wartosc: T.pobytDni({
                      dni: String(pobyt.dni),
                      tydzien: String(d.dziecko.tydzienCiazy.wartosc ?? ''),
                      masa: String(d.dziecko.masaG.wartosc ?? ''),
                    }),
                    zrodlo: ZRODLO,
                  },
                ]),
            { etykieta: T.formaZatrudnienia, wartosc: T.formy[forma], zrodlo: ZRODLO },
            { etykieta: T.rola, wartosc: T.role[rola], zrodlo: ZRODLO },
            'kod' in podstawa
              ? { etykieta: T.podstawa, wartosc: <Komunikat kod={podstawa.kod} /> }
              : {
                  etykieta: T.podstawa,
                  wartosc: (
                    <span className="flex flex-col gap-1">
                      <span className="text-amount">{formatujKwote(podstawa.kwota)}</span>
                      <span className="text-small text-ink-muted">{T.zrodloPodstawy({ opis: podstawa.skladniki?.[0]?.opis ?? '' })}</span>
                    </span>
                  ),
                },
          ]}
        />
      </Karta>
      {okres === undefined ? null : (
        <Karta tytul={T.tytulUrlopu} poziomTytulu={2} bezLinii>
          <ListaDefinicji
            szerokoscEtykiety="szeroka"
            pozycje={[
              { etykieta: T.rodzajUrlopu, wartosc: T.rodzajeUrlopu[okres.rodzajUrlopu], zrodlo: ZRODLO },
              {
                etykieta: T.poczatek,
                wartosc: (
                  <span className="flex flex-col gap-1">
                    <span>{formatujDate(okres.od)}</span>
                    <span className="text-small text-ink-muted">{T.poczatekOpis}</span>
                  </span>
                ),
              },
              ...(okresMatki === null
                ? []
                : [{ etykieta: T.okresMatki, wartosc: T.okresOdDo({ od: formatujDate(okresMatki.od), do: formatujDate(okresMatki.do) }), zrodlo: ZRODLO }]),
              ...(oswiadczenie === null ? [] : [{ etykieta: T.oswiadczenie, wartosc: oswiadczenie ? T.tak : T.nie, zrodlo: ZRODLO }]),
              ...(zlozono === null ? [] : [{ etykieta: T.dataZlozenia, wartosc: formatujDate(zlozono), zrodlo: ZRODLO }]),
            ]}
          />
        </Karta>
      )}
      <Odnosnik href={trasy.ViewSampleCaseVerification()} ikonaPo="w-prawo">
        {T.wrocDoWeryfikacji}
      </Odnosnik>
    </Stos>
  );
}
