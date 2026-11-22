'use client';

// Slot ViewCalcMaternityResult „akcje-urlopow” w liście slotyWyniku (kontrakt, sekcja 12.4). Właściciel: u20.
// Akcje „Podziel urlopy” i „Połącz urlop rodzicielski z pracą”, sekcja „Powrót do pracy” (historyjka 3.10.4.6.1:
// data powrotu, okresy pracy między urlopami, okres łączenia, uprawnienia po powrocie K20–K23) oraz trzy arkusze
// otwierane parametrem ?arkusz=: podział urlopów, łączenie z pracą i zmiana daty powrotu.
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  RODZICE,
  czesciWyniku,
  okresyLaczenia,
  okresyPracyMiedzyUrlopami,
  uprawnieniaPoPowrocie,
} from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/reguly-kalkulatora';
import {
  formaRodzica,
  ustawArkuszWAdresie,
  useNazwyRodzicow,
} from '@/app/(strefa)/kalkulator-zasilku/porownanie/_czesci/rodzice';
import { formatujDate, formatujProcent } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Przycisk } from '@/komponenty/przycisk';
import { useKatalog, useKonto, useRodzina } from '@/dane/magazyn/hooki';
import { laczeniaScenariusza } from '@/domena/kalkulatory';
import type { IdPozycji, RodzicWRodzinie } from '@/domena/typy';
import { teksty } from '@/teksty';
import { ArkuszLaczeniaZPraca } from './arkusz-laczenia-z-praca';
import { ArkuszPodzialuUrlopow } from './arkusz-podzialu-urlopow';
import { ArkuszPowrotuDoPracy } from './arkusz-powrotu-do-pracy';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCalcMaternityResult.akcjeUrlopow;
type Uprawnienie = keyof typeof t.tytulyUprawnien;

function czyUprawnienie(id: IdPozycji): id is Uprawnienie {
  return id in t.tytulyUprawnien;
}

export function SlotAkcjeUrlopow(props: PropsSlotu<'wynik'>) {
  const adres = useSearchParams();
  const arkusz = adres.get('arkusz');
  const nazwy = useNazwyRodzicow(props.daneWejsciowe.zdarzenie.wartosc === 'przyjecie');
  const katalog = useKatalog();
  const konto = useKonto();
  const rodzina = useRodzina();
  const { daneWejsciowe: d, wynik } = props;
  const zamknij = () => ustawArkuszWAdresie(null);
  const zPlanem = rodzina !== null && (konto?.rola === 'rodzic' || konto?.rola === 'drugi-rodzic');

  const sprawaWPlanie = (id: IdPozycji, rodzic: RodzicWRodzinie): string | null => {
    if (!zPlanem || rodzina?.plan == null) return null;
    const pozycje = rodzina.plan.pozycje.filter((p) => p.idPozycji === id);
    const dlaRodzica = pozycje.find((p) => p.idSprawy === `${id}-${rodzic}`) ?? pozycje[0];
    return dlaRodzica?.idSprawy ?? null;
  };

  const rodziceZPowrotem = RODZICE.filter((r) => wynik.datyPowrotu[r] !== undefined);
  // Wymiar pracy każdego łączenia rodzica w kolejności części (łączenie może dotyczyć części obojga rodziców).
  const czesciWyn = czesciWyniku(d, props.parametry, katalog);
  const wymiaryLaczen = (r: RodzicWRodzinie) =>
    laczeniaScenariusza(props.parametry)
      .filter((l) => czesciWyn[l.indeksCzesci]?.rodzic === r)
      .sort((a, b) => a.indeksCzesci - b.indeksCzesci)
      .map((l) => l.wymiarPracy);
  // 3.10.4.2.3: gdy żadne dziecko nie pozostało przy życiu, kalkulator nie umieszcza urlopu rodzicielskiego ani ojcowskiego.
  const bezUrlopuRodzicielskiego = Boolean(d.strata && d.strata.wartosc.liczbaDzieci >= d.liczbaDzieci.wartosc);

  return (
    <>
      {bezUrlopuRodzicielskiego ? null : (
        <div role="group" aria-label={t.etykietaAkcji} className="flex flex-wrap gap-3">
          <Przycisk wariant="drugorzedny" type="button" onClick={() => ustawArkuszWAdresie('podzial-urlopow')}>
            {t.podzielUrlopy}
          </Przycisk>
          <Przycisk wariant="drugorzedny" type="button" onClick={() => ustawArkuszWAdresie('laczenie-z-praca')}>
            {t.polaczZPraca}
          </Przycisk>
        </div>
      )}

      {rodziceZPowrotem.length > 0 ? (
        <Karta tytul={t.powrotTytul} bezLinii>
          <div className="flex flex-col gap-6">
            {rodziceZPowrotem.map((rodzic) => {
              const kto = nazwy[rodzic].mianownik;
              const data = wynik.datyPowrotu[rodzic];
              const praca = okresyPracyMiedzyUrlopami(wynik, rodzic);
              const laczenie = okresyLaczenia(wynik, rodzic);
              const forma = formaRodzica(d, rodzic).wartosc;
              // Po stracie wszystkich dzieci i przy przyjęciu dziecka na wychowanie wynik pomija przerwy na karmienie K20, tak jak wyliczenie w domenie.
              const uprawnienia = uprawnieniaPoPowrocie(rodzic, forma.forma, forma.dobrowolne)
                .filter((id) => !(id === 'K20' && (bezUrlopuRodzicielskiego || d.zdarzenie.wartosc === 'przyjecie')))
                .filter(czyUprawnienie);
              const opisPracy = praca.map((o) => t.okres({ od: formatujDate(o.od), do_: formatujDate(o.do) })).join(', ');
              return (
                <section key={rodzic} aria-labelledby={`powrot-${rodzic}`} className="flex flex-col gap-3 border-t border-line-soft pt-4 first:border-t-0 first:pt-0">
                  <h3 id={`powrot-${rodzic}`} className="m-0 text-tile-title text-ink first-letter:uppercase">
                    {kto}
                  </h3>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="m-0 text-small text-ink-muted">{t.dataPowrotu}</p>
                      <p className="m-0 text-amount text-ink-strong">{data ? formatujDate(data) : t.brakDatyPowrotu}</p>
                    </div>
                    <Przycisk
                      wariant="tlo"
                      type="button"
                      aria-label={t.zmienDateRodzica({ imieINazwisko: kto })}
                      onClick={() => ustawArkuszWAdresie('powrot-do-pracy', rodzic)}
                    >
                      {t.zmienDate}
                    </Przycisk>
                  </div>
                  <p className="m-0 text-body">
                    {praca.length === 0
                      ? t.okresyPracyBrak
                      : praca.length === 1
                        ? t.okresPracy({ okresy: opisPracy })
                        : t.okresyPracy({ okresy: opisPracy })}
                  </p>
                  {laczenie.map((o, i) => (
                    <p key={o.od} className="m-0 text-body">
                      {t.laczenie({
                        od: formatujDate(o.od),
                        do_: formatujDate(o.do),
                        wymiar: formatujProcent(wymiaryLaczen(rodzic)[i] ?? props.parametry.laczenie?.wymiarPracy ?? 0),
                      })}
                    </p>
                  ))}
                  <div className="flex flex-col gap-2">
                    <p className="m-0 text-body-strong text-ink">{t.uprawnienia}</p>
                    {uprawnienia.length === 0 ? (
                      <p className="m-0 text-small text-ink-muted">{t.bezUprawnien}</p>
                    ) : (
                      <ul className="m-0 flex list-none flex-col gap-3 p-0">
                        {uprawnienia.map((id) => {
                          const tytul = `${id} ${katalog.pozycje.find((p) => p.id === id)?.tytul ?? t.tytulyUprawnien[id]}`;
                          const idSprawy = sprawaWPlanie(id, rodzic);
                          return (
                            <li key={id} className="flex flex-col gap-1">
                              {idSprawy ? (
                                <Link href={`/sprawy/${encodeURIComponent(idSprawy)}`} className="text-body-strong">
                                  {tytul}
                                </Link>
                              ) : (
                                <p className="m-0 text-body-strong text-ink">{tytul}</p>
                              )}
                              <p className="m-0 text-small text-ink-muted">{t.warunkiUprawnien[id]}</p>
                              <p className="m-0 text-small text-ink-muted">{t.kanalyUprawnien[id]}</p>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </Karta>
      ) : null}

      <ArkuszPodzialuUrlopow {...props} otwarte={!bezUrlopuRodzicielskiego && arkusz === 'podzial-urlopow'} onZamknij={zamknij} />
      <ArkuszLaczeniaZPraca {...props} otwarte={!bezUrlopuRodzicielskiego && arkusz === 'laczenie-z-praca'} onZamknij={zamknij} />
      <ArkuszPowrotuDoPracy {...props} otwarte={arkusz === 'powrot-do-pracy'} onZamknij={zamknij} />
    </>
  );
}
