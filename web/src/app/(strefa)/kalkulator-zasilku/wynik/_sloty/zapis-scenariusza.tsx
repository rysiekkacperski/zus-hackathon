'use client';

// Slot ViewCalcMaternityResult „zapis-scenariusza” w liście slotyWyniku (kontrakt, sekcja 12.4). Właściciel: u20.
// Karta „Co dalej” (historyjka 3.10.4.5.1): zapis scenariusza (0100, 0101, 0171, 0003), wybrany wariant spraw planu,
// porównanie scenariuszy i przeniesienie scenariusza do wniosku ZAM (0037, 0101) albo do wniosku o urlop do pracodawcy.
import Link from 'next/link';
import { useState } from 'react';
import { useNazwyRodzicow } from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/rodzice';
import { formatujDate, formatujProcent } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { useKatalog, useKonto, useRodzina } from '@/dane/magazyn/hooki';
import {
  przeniesDoWnioskuOUrlop,
  przeniesDoZam,
  rodzicKontaWRodzinie,
  rodzicWnioskuOUrlop,
  rodzicWnioskuZam,
  wariantyZeScenariusza,
  zapiszScenariusz,
  type NowyScenariuszKalkulatora,
} from '@/dane/magazyn/operacje/kalkulacje-scenariusze';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { liczbaDniWlacznie } from '@/domena/daty';
import type { IdPozycji, KodKomunikatu, Okres, ScenariuszKalkulatora, WybranyWariant } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCalcMaternityResult.zapisScenariusza;
const tTygodnie = teksty.SheetCalcParentalParts.tygodnie;

function okres(o: Okres | undefined): string {
  return o ? t.okres({ od: formatujDate(o.od), do_: formatujDate(o.do) }) : t.brakOkresu;
}

function zakresOkresow(o: Okres[] | undefined): Okres | undefined {
  if (!o || o.length === 0) return undefined;
  return { od: o[0].od, do: o[o.length - 1].do };
}

function opisWariantu(w: WybranyWariant): string {
  switch (w.sprawa) {
    case 'K07':
    case 'K08':
      return t.opisK07K08({ wariant: t.warianty[w.wariant], macierzynski: okres(w.okresMacierzynski), rodzicielski: okres(zakresOkresow(w.okresyRodzicielskie)) });
    case 'K31':
    case 'K32':
      return t.opisK31K32({ wariant: t.warianty[w.wariant], macierzynski: okres(w.okresMacierzynski), rodzicielski: okres(zakresOkresow(w.okresyRodzicielskie)) });
    case 'K09': {
      const dni = w.okresyOjcowskiego.reduce((s, o) => s + liczbaDniWlacznie(o), 0);
      return t.opisK09({
        okresy: w.okresyOjcowskiego.map((o) => t.okresWielka({ od: formatujDate(o.od), do_: formatujDate(o.do) })).join(', '),
        dni: String(dni),
      });
    }
    case 'K10':
      return w.dataPoczatku
        ? t.opisK10({ tygodnie: tTygodnie({ liczba: w.tygodnieDrugiegoRodzica }), od: formatujDate(w.dataPoczatku) })
        : t.opisK10BezCzesci;
    case 'K11':
      return t.opisK11({ tygodnie: tTygodnie({ liczba: w.wymiarTygodni }) });
    case 'K37':
      return t.opisK37({ okres: okres(w.okres), wymiar: formatujProcent(w.wymiarPracy) });
  }
}

interface Zapisany {
  scenariusz: ScenariuszKalkulatora;
  kod: '0100' | '0101' | '0171';
}

export function SlotZapisScenariusza(props: PropsSlotu<'wynik'>) {
  const { zajety, przejdz } = useNawigacjaZLadowaniem();
  // Przycisk przejścia, który pokazuje ładowanie; wraca do null po ukryciu trasy.
  const [cel, ustawCel] = useStanChwilowy<'zam' | 'urlop' | null>(null);
  const konto = useKonto();
  const rodzina = useRodzina();
  const katalog = useKatalog();
  const nazwy = useNazwyRodzicow();
  const [zapisany, ustawZapisany] = useState<Zapisany | null>(null);
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);

  const zPlanem = rodzina !== null && (konto?.rola === 'rodzic' || konto?.rola === 'drugi-rodzic');
  const przykladowa = props.zrodlo === 'przykladowa-sprawa';
  const rodzicKonta = konto ? rodzicKontaWRodzinie(konto, zPlanem ? rodzina.daneRodziny : null) : null;
  const rodzicZam = rodzicWnioskuZam(props.daneWejsciowe, rodzicKonta);
  const rodzicUrlopu = rodzicWnioskuOUrlop(props.daneWejsciowe, rodzicKonta);

  const nowy = (): NowyScenariuszKalkulatora => ({
    zakres: zPlanem ? 'rodzina' : 'konto',
    przykladowaSprawa: przykladowa,
    daneWejsciowe: props.daneWejsciowe,
    podstawy: props.podstawy,
    parametry: props.parametry,
    wynik: props.wynik,
  });

  /** Zapis bieżącego scenariusza; zwraca numer albo null po błędzie. */
  const zapisz = (): number | null => {
    const ctx = pobierzKontekstOperacji();
    const wynik = zapiszScenariusz(nowy(), ctx);
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return null;
    }
    ustawBlad(null);
    ustawZapisany({
      kod: wynik.wartosc.kod,
      scenariusz: {
        ...nowy(),
        numer: wynik.wartosc.numer,
        zapisano: ctx.dzis,
        konto: konto?.pesel ?? '',
        wybranyWPlanie: wynik.wartosc.kod === '0100',
      },
    });
    return wynik.wartosc.numer;
  };

  const numerDoPrzeniesienia = (): number | null => zapisany?.scenariusz.numer ?? zapisz();

  const naZam = () => {
    if (!zPlanem) return ustawBlad('0101');
    const przyjecie = props.daneWejsciowe.zdarzenie.wartosc === 'przyjecie';
    const potwierdzone = przyjecie ? rodzina.daneCiazy?.przyjecie !== undefined : rodzina.daneCiazy?.dataPoroduPotwierdzona === true;
    if (!potwierdzone) return ustawBlad('0037');
    const numer = numerDoPrzeniesienia();
    if (numer === null) return;
    const wynik = przeniesDoZam(numer, pobierzKontekstOperacji());
    if (!wynik.ok) return ustawBlad(wynik.kod);
    ustawCel('zam');
    przejdz(`/wnioski/zam/okres-zasilku?wniosek=${encodeURIComponent(wynik.wartosc.idWniosku)}`);
  };

  const naUrlop = () => {
    if (!zPlanem) return ustawBlad('0101');
    const numer = numerDoPrzeniesienia();
    if (numer === null) return;
    const wynik = przeniesDoWnioskuOUrlop(numer, pobierzKontekstOperacji());
    if (!wynik.ok) return ustawBlad(wynik.kod);
    ustawCel('urlop');
    przejdz(
      `/wnioski/urlop/rodzaj?wniosek=${encodeURIComponent(wynik.wartosc.idWniosku)}&scenariusz=${encodeURIComponent(String(numer))}`,
    );
  };

  const sprawyWPlanie = new Set<IdPozycji>(
    (rodzina?.plan?.pozycje ?? []).map((p) => p.idPozycji).filter((id): id is IdPozycji => id !== null),
  );
  const warianty =
    zapisany && zapisany.kod === '0100' && konto
      ? wariantyZeScenariusza(zapisany.scenariusz, sprawyWPlanie, konto.pesel, zapisany.scenariusz.zapisano)
      : [];
  const tytulSprawy = (id: string) => `${id} ${katalog.pozycje.find((p) => p.id === id)?.tytul ?? ''}`.trim();

  return (
    <Karta tytul={t.tytul} bezLinii>
      <div className="flex flex-col gap-5">
        {blad ? <Komunikat kod={blad} /> : null}
        {zapisany ? (
          <div className="flex flex-col gap-4">
            <Komunikat kod={zapisany.kod} />
            <section aria-labelledby="scenariusz-zapisany" className="flex flex-col gap-3 rounded-sm bg-surface-sunken p-4">
              <h3 id="scenariusz-zapisany" className="m-0 text-tile-title text-ink">
                {t.scenariusz({ numer: String(zapisany.scenariusz.numer) })}
              </h3>
              <p className="m-0 text-body">
                {zapisany.scenariusz.zakres === 'rodzina'
                  ? t.zapisanyRodzina({
                      data: formatujDate(zapisany.scenariusz.zapisano),
                      kto: konto ? `${konto.imie} ${konto.nazwisko}` : '',
                      wariant: t.warianty[props.parametry.wariant],
                    })
                  : t.zapisanyKonto({ data: formatujDate(zapisany.scenariusz.zapisano), wariant: t.warianty[props.parametry.wariant] })}
              </p>
              {warianty.length > 0 ? (
                <>
                  <h4 className="m-0 text-body-strong text-ink">{t.wybranyWariant}</h4>
                  <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {warianty.map((w) => (
                      <li key={w.sprawa} className="flex flex-col gap-1">
                        <Link href={`/sprawy/${w.sprawa}`} className="text-body-strong">
                          {tytulSprawy(w.sprawa)}
                        </Link>
                        <p className="m-0 text-small text-ink-muted">{opisWariantu(w)}</p>
                      </li>
                    ))}
                  </ul>
                  <Link href="/plan-rodziny" className="text-body-strong">
                    {t.zobaczPlan}
                  </Link>
                </>
              ) : null}
            </section>
          </div>
        ) : null}
        <p className="m-0 text-body">{zPlanem ? t.opis : t.opisKonta}</p>
        <div className="flex flex-wrap gap-3">
          <Przycisk wariant="glowny" type="button" ikona="zapisz" onClick={() => zapisz()}>
            {t.zapisz}
          </Przycisk>
          <PrzyciskLink wariant="drugorzedny" href="/kalkulator-zasilku/porownanie">
            {t.porownaj}
          </PrzyciskLink>
          {rodzicZam ? (
            <Przycisk wariant="drugorzedny" type="button" onClick={naZam} zajety={zajety && cel === 'zam'} disabled={zajety && cel !== 'zam'}>
              {t.przeniesZam({ kto: nazwy[rodzicZam].mianownik })}
            </Przycisk>
          ) : null}
          {rodzicUrlopu ? (
            <Przycisk wariant="drugorzedny" type="button" onClick={naUrlop} zajety={zajety && cel === 'urlop'} disabled={zajety && cel !== 'urlop'}>
              {t.przeniesUrlop({ kto: nazwy[rodzicUrlopu].mianownik })}
            </Przycisk>
          ) : null}
        </div>
      </div>
    </Karta>
  );
}
