'use client';

// Slot ViewCalcMaternityResult „porownanie-z-rozstrzygnieciem” w liście slotyWyniku (kontrakt, sekcja 12.4). Właściciel: u21.
// W trybie ?zrodlo=przykladowa-sprawa wylicza okres zasiłku, stawkę i wypłaty z danych sprawy, porównuje je
// z oczekiwanym rozstrzygnięciem (0111, 0112, 0180) i zapisuje wynik w Wynikach kalkulacji konta (wzory P13-18, P13-19).
// Teksty: teksty.ViewCalcMaternityResult.porownanieZRozstrzygnieciem.
import { useEffect, useMemo, useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujDate } from '@/domena/daty';
import { formatujKwote, formatujProcent } from '@/domena/kwoty';
import { porownajWyliczenie, type PozycjaPorownania } from '@/domena/przykladowe-sprawy/porownanie';
import { ustalPodstaweZeSprawy, wyliczWynikSprawy } from '@/domena/przykladowe-sprawy/weryfikacja';
import type { KodKomunikatu } from '@/domena/typy';
import { useKatalog, useParametry, useStanSesji } from '@/dane/magazyn/hooki';
import { zapiszWynikKalkulacjiSprawy } from '@/dane/magazyn/operacje/weryfikacja-sprawy';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const T = teksty.ViewCalcMaternityResult.porownanieZRozstrzygnieciem;
const RODZAJE = teksty.ViewCalcMaternityInput.daneZPrzykladowejSprawy.rodzajeUrlopu;
const ZRODLO = 'przykladowa-sprawa';

function tekstPorownania(p: PozycjaPorownania): string {
  if (p.zgodne === null) return T.brakWRozstrzygnieciu;
  if (p.pole === 'kwota' && p.roznica !== undefined) {
    const roznica = formatujKwote(p.roznica);
    return p.zgodne ? T.zgodneRoznica({ roznica }) : T.rozneRoznica({ roznica });
  }
  return p.zgodne ? T.zgodne : T.rozne;
}

export function SlotPorownanieZRozstrzygnieciem({ zrodlo }: PropsSlotu<'wynik'>) {
  const stanSesji = useStanSesji();
  const katalog = useKatalog();
  const parametry = useParametry();
  const sprawa = stanSesji?.przykladowaSprawa;
  const aktywny = zrodlo === ZRODLO && sprawa?.weryfikacja !== undefined;

  const wyliczenie = useMemo(() => {
    if (!aktywny || sprawa === undefined) return null;
    const podstawa = ustalPodstaweZeSprawy(sprawa.dane, katalog);
    if ('kod' in podstawa) return { kod: podstawa.kod };
    const wynik = wyliczWynikSprawy(sprawa.dane, podstawa, katalog, sprawa.dokumenty);
    const porownanie = porownajWyliczenie(wynik, sprawa.rozstrzygniecie, parametry.tolerancjaPorownaniaKwotyGrosze);
    return { podstawa, wynik, porownanie };
  }, [aktywny, sprawa, katalog, parametry.tolerancjaPorownaniaKwotyGrosze]);

  // Zapis w Wynikach kalkulacji przy pokazaniu wyniku; operacja pomija zapis, gdy wynik się nie zmienił.
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const wynikDoZapisu = wyliczenie === null || 'kod' in wyliczenie ? null : wyliczenie.wynik;
  useEffect(() => {
    if (wynikDoZapisu === null) return;
    const zapis = zapiszWynikKalkulacjiSprawy(wynikDoZapisu, pobierzKontekstOperacji());
    // Wynik zapisu pochodzi z magazynu poza Reactem, więc stan błędu ustawiamy po operacji.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizacja z wynikiem operacji magazynu
    setBladZapisu(zapis.ok ? null : zapis.kod);
  }, [wynikDoZapisu]);

  if (zrodlo !== ZRODLO) return null;
  if (sprawa === undefined || wyliczenie === null) return <Komunikat typ="INFO" tresc={T.brakSprawy} />;
  if ('kod' in wyliczenie) return <Komunikat kod={wyliczenie.kod} />;

  const { porownanie, wynik, podstawa } = wyliczenie;
  const tolerancja = formatujKwote(parametry.tolerancjaPorownaniaKwotyGrosze);
  const tytul = sprawa.idSprawy === undefined ? T.tytulBezId : T.tytul({ id: sprawa.idSprawy });
  const kwotaRozna = porownanie.pozycje.some((p) => p.pole === 'kwota' && p.zgodne === false);

  return (
    <Stos odstep={6}>
      <Komunikat kod={porownanie.kod} />
      {bladZapisu === null ? null : <Komunikat kod={bladZapisu} />}
      <Karta tytul={tytul} poziomTytulu={2} bezLinii>
        <Stos odstep={4}>
          <Tabela
            podpis={T.podpis}
            etykietaPrzewijania={T.przewijanie}
            kolumny={[
              { klucz: 'pole', naglowek: T.kolumny.pole, tytulowa: true },
              { klucz: 'wyliczenie', naglowek: T.kolumny.wyliczenie },
              { klucz: 'rozstrzygniecie', naglowek: T.kolumny.rozstrzygniecie },
              { klucz: 'porownanie', naglowek: T.kolumny.porownanie },
            ]}
            wiersze={porownanie.pozycje.map((p) => ({
              id: p.pole,
              pole: <span className="text-body-strong">{T.pola[p.pole]}</span>,
              wyliczenie: p.wyliczenie ?? T.brakWartosci,
              rozstrzygniecie: p.rozstrzygniecie ?? T.brakWartosci,
              porownanie: porownanie.wynik === 'bez-porownania' ? T.brakWartosci : tekstPorownania(p),
            }))}
          />
          <p className="m-0 text-small text-ink-muted">
            {kwotaRozna ? T.notaRoznicy({ tolerancja }) : T.notaTolerancji({ tolerancja })}
          </p>
        </Stos>
      </Karta>
      <Karta tytul={T.okresyTytul} poziomTytulu={2} bezLinii>
        <Stos odstep={4}>
          <p className="m-0 text-body">{T.podstawa({ kwota: formatujKwote(podstawa.kwota) })}</p>
          <Tabela
            podpis={T.podpisOkresow}
            etykietaPrzewijania={T.przewijanieOkresow}
            kwoty
            kolumny={[
              { klucz: 'urlop', naglowek: T.kolumnyOkresow.urlop, tytulowa: true },
              { klucz: 'od', naglowek: T.kolumnyOkresow.od },
              { klucz: 'do', naglowek: T.kolumnyOkresow.do },
              { klucz: 'dni', naglowek: T.kolumnyOkresow.dni, liczbowa: true },
              { klucz: 'stawka', naglowek: T.kolumnyOkresow.stawka, liczbowa: true },
              { klucz: 'miesiecznie', naglowek: T.kolumnyOkresow.miesiecznie, liczbowa: true },
              { klucz: 'suma', naglowek: T.kolumnyOkresow.suma, liczbowa: true },
            ]}
            wiersze={wynik.okresy.map((o, i) => ({
              id: `${o.rodzaj}-${i}`,
              urlop: RODZAJE[o.rodzaj],
              od: formatujDate(o.od),
              do: formatujDate(o.do),
              dni: String(o.dni),
              stawka: formatujProcent(o.stawka),
              miesiecznie: formatujKwote(o.miesiecznie),
              suma: formatujKwote(o.zaOkres),
            }))}
          />
          {wynik.zastosowaneReguly.map((r) => (
            <p key={r.opis} className="m-0 text-small text-ink-muted">
              {r.opis}
            </p>
          ))}
        </Stos>
      </Karta>
      <Karta tytul={T.coDalej} poziomTytulu={2} bezLinii>
        <Stos odstep={4}>
          <p className="m-0 text-body">{porownanie.wynik === 'rozne' ? T.poprawOpis : T.zapisano}</p>
          <div className="flex flex-wrap gap-4">
            {porownanie.wynik === 'rozne' ? (
              <PrzyciskLink href={trasy.ViewSampleCaseData()} wariant="glowny">
                {T.poprawDane}
              </PrzyciskLink>
            ) : null}
            <PrzyciskLink href={trasy.ViewSampleCaseVerification()} wariant={porownanie.wynik === 'rozne' ? 'drugorzedny' : 'glowny'}>
              {T.wrocDoWeryfikacji}
            </PrzyciskLink>
            {porownanie.wynik === 'rozne' ? null : (
              <PrzyciskLink href={trasy.ViewSampleCaseList()} wariant="drugorzedny">
                {T.wybierzInna}
              </PrzyciskLink>
            )}
          </div>
        </Stos>
      </Karta>
    </Stos>
  );
}
