'use client';

// ViewSickLeaveList (3.4.4.1.1–3.4.4.1.4; wzory cz2/Zaswiadczenia-e-ZLA i P16-02…P16-09). Właściciel: u14.
import { useState } from 'react';
import {
  KartaOdczytuDanychZus,
  OgloszenieOdczytuDanychZus,
} from '@/app/(strefa)/profil-na-start/dane-z-konta-zus/_czesci/stan-odczytu-zus';
import { odczytajDaneKontaZus } from '@/dane/magazyn/operacje/odczyt-zus';
import { useStanKonta } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika } from '@/domena/daty';
import type { ZaswiadczenieEzla } from '@/domena/typy';
import {
  czyKodCiazy,
  listaNumerow,
  liczbaDniZaswiadczenia,
  okresNiezdolnosci,
  type WyliczeniaEzla,
} from '@/domena/zasilki/okres-zasilkowy';
import { poczatekOknaEzla } from '@/domena/dane-zus/filtry/ezla';
import { formatujDate, formatujDateICzas } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Postep } from '@/komponenty/postep';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Znaczek } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import { KafleWartosci } from './_czesci/kafle-wartosci';
import { OknoSzczegolowZaswiadczenia } from './_czesci/okno-szczegolow-zaswiadczenia';
import { useWyliczeniaEzlaKonta } from './_czesci/wyliczenia';

const t = teksty.ViewSickLeaveList;

export function WidokZaswiadczenEZla() {
  const dane = useWyliczeniaEzlaKonta();
  const stanKonta = useStanKonta();
  const [wybrane, setWybrane] = useState<ZaswiadczenieEzla | null>(null);
  const [ponawianie, setPonawianie] = useState(false);

  if (!dane || !stanKonta) return null;
  const { konto, kopia, wyliczenia, rodzina, zgoda } = dane;
  const stanOdczytu = stanKonta.stanOdczytuZus;
  const brakPolaczenia = kopia === null && stanOdczytu.stan !== 'trwa';
  const odczytBezKopii = kopia === null && stanOdczytu.stan === 'trwa';
  const nieaktualne = kopia !== null && stanOdczytu.stan === 'nieudany-z-kopia';
  const ptp = rodzina?.daneCiazy?.przewidywanyTerminPorodu;

  async function ponow() {
    setPonawianie(true);
    await odczytajDaneKontaZus(konto.pesel, pobierzKontekstOperacji());
    setPonawianie(false);
  }

  const stopka = (
    <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
      {t.wrocDoPlanu}
    </PrzyciskLink>
  );

  return (
    <>
      <OgloszenieOdczytuDanychZus trwa={odczytBezKopii} udany={stanOdczytu.stan === 'udany'} />
      <NaglowekStrony
        tytul={t.naglowek}
        powrot={{ etykieta: t.powrot }}
        wstep={kopia ? t.stanNaZGodzina({ data: formatujDateICzas(kopia.odczytano) }) : undefined}
      />
      <div className="flex max-w-tresc flex-col gap-7.5">
        {odczytBezKopii ? <KartaOdczytuDanychZus pesel={konto.pesel} /> : null}
        {brakPolaczenia ? (
          <>
            <Komunikat kod="0001" />
            <Karta tytul={t.listaTytul}>
              <StanPusty
                ikona="plik"
                akcja={
                  <Przycisk wariant="glowny" onClick={ponow} zajety={ponawianie}>
                    {teksty.wspolne.przyciski.sprobujPonownie}
                  </Przycisk>
                }
              >
                <p className="m-0">{t.brakPolaczeniaOpis}</p>
              </StanPusty>
            </Karta>
          </>
        ) : kopia && !zgoda ? (
          <Karta tytul={t.listaTytul}>
            <div className="flex flex-col gap-4">
              <Komunikat kod="0004" />
              <p className="m-0">{t.brakZgodyOpis}</p>
              <div>
                <PrzyciskLink href={trasy.ViewGuideSettings()} wariant="glowny">
                  {t.przejdzDoUstawien}
                </PrzyciskLink>
              </div>
            </div>
          </Karta>
        ) : kopia && wyliczenia ? (
          <>
            {nieaktualne ? <Komunikat kod="0002" parametry={{ dataOdczytu: formatujDate(kopia.odczytano) }} /> : null}
            {!nieaktualne
              ? wyliczenia.ostrzezenia.map((o) =>
                  o.kod === '0086' ? (
                    <Komunikat
                      key={o.kod}
                      kod="0086"
                      akcje={
                        <Odnosnik href={trasy.ViewCaseDetails({ idSprawy: 'K25', z: 'plan' })} wTekscie>
                          {t.rehabilitacyjneOdnosnik}
                        </Odnosnik>
                      }
                    />
                  ) : (
                    <Komunikat key={o.kod} kod={o.kod} tresc={trescKomunikatu(o.kod, o.parametry)} />
                  ),
                )
              : null}
            <KartaListy
              zaswiadczenia={wyliczenia.zaswiadczenia}
              liczbaZKodemB={wyliczenia.liczbaZKodemB}
              poczatekOkna={poczatekOknaEzla(dataZeZnacznika(kopia.odczytano))}
              tylkoWlasne={konto.rola === 'drugi-rodzic'}
              onSzczegoly={setWybrane}
            />
            {wyliczenia.zaswiadczenia.length > 0 ? (
              nieaktualne ? (
                <KartaZwarta wyliczenia={wyliczenia} odczytano={kopia.odczytano} />
              ) : (
                <KartyWyliczen wyliczenia={wyliczenia} dzien={dataZeZnacznika(kopia.odczytano)} ptp={ptp} />
              )
            ) : null}
          </>
        ) : null}
        <div className="flex flex-wrap gap-4">{stopka}</div>
      </div>
      <OknoSzczegolowZaswiadczenia
        otwarte={wybrane !== null}
        onZamknij={() => setWybrane(null)}
        zaswiadczenie={wybrane}
        konto={konto}
      />
    </>
  );
}

function KartaListy({
  zaswiadczenia,
  liczbaZKodemB,
  poczatekOkna,
  tylkoWlasne,
  onSzczegoly,
}: {
  zaswiadczenia: ZaswiadczenieEzla[];
  liczbaZKodemB: number;
  poczatekOkna: string;
  tylkoWlasne: boolean;
  onSzczegoly: (z: ZaswiadczenieEzla) => void;
}) {
  if (zaswiadczenia.length === 0) {
    return (
      <Karta tytul={t.listaTytul}>
        <div className="flex flex-col gap-4">
          <Komunikat kod="0114" />
          <p className="m-0">{t.pustaListaOpis}</p>
        </div>
      </Karta>
    );
  }
  return (
    <Karta tytul={t.listaTytul}>
      <div className="flex flex-col gap-4">
        <p className="m-0">{tylkoWlasne ? t.tylkoWlasne : t.listaOpis({ data: formatujDate(poczatekOkna) })}</p>
        <p className="m-0 text-body-strong">{t.licznik({ liczba: zaswiadczenia.length, zKodemB: liczbaZKodemB })}</p>
        <Tabela
          podpis={t.podpisTabeli}
          etykietaPrzewijania={t.przewijanieTabeli}
          kolumny={[
            { klucz: 'okres', naglowek: t.kolumny.okres, tytulowa: true },
            { klucz: 'dni', naglowek: t.kolumny.dni, liczbowa: true },
            { klucz: 'kod', naglowek: t.kolumny.kod },
            { klucz: 'platnik', naglowek: t.kolumny.platnik },
            { klucz: 'rodzaj', naglowek: t.kolumny.rodzaj },
            { klucz: 'akcje', naglowek: t.kolumny.akcje },
          ]}
          wiersze={zaswiadczenia.map((z) => ({
            id: z.seriaINumer,
            okres: (
              <span className="flex flex-col">
                <span className="whitespace-nowrap">{okresNiezdolnosci(z)}</span>
                <span className="text-small text-ink-muted">{z.seriaINumer}</span>
              </span>
            ),
            dni: String(liczbaDniZaswiadczenia(z)),
            kod: czyKodCiazy(z) ? (
              <span className="inline-flex items-center gap-2">
                <span>B</span>
                <Znaczek>{t.znaczekCiazy}</Znaczek>
              </span>
            ) : (
              t.brakKodu
            ),
            platnik: z.platnik,
            rodzaj: t.rodzaje[z.rodzaj],
            akcje: (
              <button
                type="button"
                onClick={() => onSzczegoly(z)}
                aria-label={t.szczegolyEtykieta({ numer: z.seriaINumer })}
                className="cursor-pointer border-0 bg-transparent p-0 text-body font-semibold text-brand underline hover:text-brand-deep"
              >
                {t.szczegoly}
              </button>
            ),
          }))}
        />
      </div>
    </Karta>
  );
}

function KartyWyliczen({ wyliczenia, dzien, ptp }: { wyliczenia: WyliczeniaEzla; dzien: string; ptp?: string }) {
  const { okres, wynagrodzenie, wariant, zaswiadczenia } = wyliczenia;
  const stan = t.stanNa({ data: formatujDate(dzien) });
  const bezTytulu = useWyliczeniaEzlaKonta()?.profil.forma === 'brak-tytulu';

  const kartaOkresu =
    wariant === 'bez-ubezpieczenia' ? (
      <Karta tytul={t.okresTytul} className="grow basis-84 min-w-0">
        <div className="flex flex-col gap-4">
          <Komunikat kod="0083" />
          <p className="m-0">
            {bezTytulu ? t.bezTytuluOpis : t.bezUbezpieczeniaOpis}{' '}
            <Odnosnik href={trasy.ViewFamilyPlan()} wTekscie>
              {t.planRodzinyOdnosnik}
            </Odnosnik>
            .
          </p>
        </div>
      </Karta>
    ) : okres && okres.zaswiadczenia.length > 0 ? (
      <Karta tytul={t.okresTytul} className="grow basis-84 min-w-0">
        <div className="flex flex-col gap-4">
          <p className="m-0 text-small text-ink-muted">{stan}</p>
          <KafleWartosci
            kafle={[
              { etykieta: t.wykorzystane, wartosc: t.dniZ({ liczba: okres.wykorzystane, limit: okres.limit ?? 270 }) },
              { etykieta: t.pozostalo, wartosc: t.dni({ liczba: okres.pozostale }) },
              { etykieta: t.koniecOkresu, wartosc: okres.dataWyczerpania ? formatujDate(okres.dataWyczerpania) : '-' },
            ]}
          />
          <Postep wartosc={okres.wykorzystane} maks={okres.limit ?? 270} etykieta={t.postepOkresu} />
          <ListaDefinicji
            pozycje={[
              { etykieta: t.poczatekOkresu, wartosc: okres.poczatek ? formatujDate(okres.poczatek) : '-' },
              okres.pozostale === 0 && ptp
                ? { etykieta: t.przewidywanyTermin, wartosc: formatujDate(ptp) }
                : { etykieta: t.zaswiadczeniaWOkresie, wartosc: listaNumerow(okres.zaswiadczenia) },
            ]}
          />
          <Notatka>{t.notatkaOkresu}</Notatka>
          {wariant === 'po-ustaniu-ubezpieczenia' ? <p className="m-0">{t.poUstaniuOpis}</p> : null}
          {ptp && okres.dataWyczerpania ? (
            <p className="m-0">
              {okres.dataWyczerpania < ptp
                ? t.koniecPrzedTerminem({ data: formatujDate(okres.dataWyczerpania) })
                : t.terminPrzedKoncem({ data: formatujDate(ptp) })}
            </p>
          ) : null}
        </div>
      </Karta>
    ) : (
      <Karta tytul={t.okresTytul} className="grow basis-84 min-w-0">
        <p className="m-0">{t.okresNieDotyczy}</p>
      </Karta>
    );

  let kartaDruga = null;
  if (wariant === 'wynagrodzenie' && wynagrodzenie) {
    const bezB = zaswiadczenia.filter(
      (z) => z.rodzaj === 'choroba' && !czyKodCiazy(z) && z.od.slice(0, 4) <= String(wynagrodzenie.rok) && z.do.slice(0, 4) >= String(wynagrodzenie.rok),
    );
    const opieka = zaswiadczenia.filter((z) => z.rodzaj === 'opieka');
    kartaDruga = (
      <Karta tytul={t.wynagrodzenieTytul({ rok: wynagrodzenie.rok })} className="grow basis-84 min-w-0">
        <div className="flex flex-col gap-4">
          <p className="m-0 text-small text-ink-muted">{stan}</p>
          <KafleWartosci
            kafle={[
              { etykieta: t.wykorzystane, wartosc: t.dniZ({ liczba: wynagrodzenie.wykorzystane, limit: wynagrodzenie.limit }) },
              { etykieta: t.pozostalo, wartosc: t.dni({ liczba: wynagrodzenie.pozostale }) },
              ...(wynagrodzenie.zasilekOd ? [{ etykieta: t.zasilekOd, wartosc: formatujDate(wynagrodzenie.zasilekOd) }] : []),
            ]}
          />
          {wynagrodzenie.zasilekOd && wynagrodzenie.zasilekZaNiezdolnoscOd ? (
            <p className="m-0">
              {t.przelomRoku({
                data: formatujDate(wynagrodzenie.zasilekOd),
                od: formatujDate(wynagrodzenie.zasilekZaNiezdolnoscOd),
              })}
            </p>
          ) : null}
          {wynagrodzenie.wykorzystane > 0 ? <Notatka>{t.notatkaWynagrodzenia({ limit: wynagrodzenie.limit })}</Notatka> : null}
          {bezB.length > 0 && wynagrodzenie.wykorzystane > 0 ? (
            <p className="m-0">{t.wliczoneBezB({ rok: wynagrodzenie.rok, numery: listaNumerow(bezB) })}</p>
          ) : null}
          {opieka.length > 0 ? <p className="m-0">{t.opiekaNieWliczana({ numery: listaNumerow(opieka) })}</p> : null}
        </div>
      </Karta>
    );
  } else if (wariant === 'zasilek-od-pierwszego-dnia') {
    kartaDruga = <KartaOdPierwszegoDnia stan={stan} />;
  }

  return (
    <div className="flex flex-wrap gap-7.5">
      {wariant === 'wynagrodzenie' && okres?.zaswiadczenia.length === 0 ? (
        <>
          {kartaDruga}
          {kartaOkresu}
        </>
      ) : (
        <>
          {kartaOkresu}
          {kartaDruga}
        </>
      )}
    </div>
  );
}

function KartaOdPierwszegoDnia({ stan }: { stan: string }) {
  const dane = useWyliczeniaEzlaKonta();
  const forma = dane?.profil.forma;
  const etykietaFormy = forma && forma !== 'umowa-o-prace' ? t.formy[forma] : t.formy['brak-tytulu'];
  return (
    <Karta tytul={t.zasilekOdPierwszegoTytul} className="grow basis-84 min-w-0">
      <div className="flex flex-col gap-4">
        <p className="m-0 text-small text-ink-muted">{stan}</p>
        <ListaDefinicji
          pozycje={[
            { etykieta: t.formaZatrudnienia, wartosc: etykietaFormy },
            { etykieta: t.zasilekChorobowy, wartosc: t.odPierwszegoDnia },
          ]}
        />
        <Notatka>{t.notatkaOdPierwszego}</Notatka>
      </div>
    </Karta>
  );
}

function KartaZwarta({ wyliczenia, odczytano }: { wyliczenia: WyliczeniaEzla; odczytano: string }) {
  const { okres, wynagrodzenie } = wyliczenia;
  const kafle = [];
  if (okres && okres.zaswiadczenia.length > 0) {
    kafle.push({ etykieta: t.okresTytul, wartosc: t.dniZ({ liczba: okres.wykorzystane, limit: okres.limit ?? 270 }) });
    if (okres.dataWyczerpania) kafle.push({ etykieta: t.koniecOkresu, wartosc: formatujDate(okres.dataWyczerpania) });
  }
  if (wynagrodzenie) {
    kafle.push({
      etykieta: t.wynagrodzenieKrotko({ rok: wynagrodzenie.rok }),
      wartosc: t.dniZ({ liczba: wynagrodzenie.wykorzystane, limit: wynagrodzenie.limit }),
    });
    if (wynagrodzenie.zasilekOd) kafle.push({ etykieta: t.zasilekOd, wartosc: formatujDate(wynagrodzenie.zasilekOd) });
  }
  if (wyliczenia.wariant === 'bez-ubezpieczenia') {
    return (
      <Karta tytul={t.wyliczeniaTytul}>
        <Komunikat kod="0083" />
      </Karta>
    );
  }
  return (
    <Karta tytul={t.wyliczeniaTytul}>
      <div className="flex flex-col gap-4">
        <p className="m-0 text-small text-ink-muted">{t.stanNaZGodzina({ data: formatujDateICzas(odczytano) })}</p>
        <KafleWartosci kafle={kafle} />
      </div>
    </Karta>
  );
}
