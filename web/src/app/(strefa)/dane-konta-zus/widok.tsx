'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KartaOdczytuDanychZus,
  OgloszenieOdczytuDanychZus,
} from '@/app/(strefa)/profil-na-start/dane-z-konta-zus/_czesci/stan-odczytu-zus';
import { DanePytania } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
import { adresEzus, odczytajDaneKontaUbezpieczonego } from '@/dane/magazyn/operacje/kanaly-zus-usc';
import { zrodloOstatniegoOdczytuZus } from '@/dane/magazyn/operacje/odczyt-zus';
import { useDzis, useKonto, useStanKonta } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dodajDni, porownajDaty } from '@/domena/daty';
import type { DaneZKontaZus, KodKomunikatu, StanRozliczenSkladek, TytulUbezpieczenia } from '@/domena/typy';
import { formatujDate, formatujDateICzas, formatujKwote, formatujMiesiac } from '@/komponenty/format';
import { ODNOSNIKI } from '@/dane/katalog/pozycje';
import { Karta } from '@/komponenty/karta';
import { KartaWiecejInformacji } from '@/komponenty/karta-wiecej-informacji';
import { Komunikat } from '@/komponenty/komunikat';
import { Kwota } from '@/komponenty/kwota';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewZusAccountData;

type StanOdczytu = { stan: 'trwa' } | { stan: 'gotowy' } | { stan: 'blad'; kod: KodKomunikatu };

function okresChorobowego(tytul: TytulUbezpieczenia): string {
  const { rodzaj, od, do: doDnia } = tytul.ubezpieczenieChorobowe;
  if (rodzaj === 'brak' || !od) return t.brakDaty;
  return doDnia ? t.okresOdDo({ od: formatujDate(od), doDnia: formatujDate(doDnia) }) : t.okresOd({ od: formatujDate(od) });
}

function stanNaDzienOdczytu(kopia: DaneZKontaZus): StanRozliczenSkladek | null {
  if (kopia.stanyRozliczen.length === 0) return null;
  return [...kopia.stanyRozliczen].sort((a, b) => porownajDaty(b.dzien, a.dzien))[0];
}

function SekcjaTytulow({ kopia, dzis }: { kopia: DaneZKontaZus; dzis: string }) {
  if (kopia.tytuly.length === 0) return null;
  const trwajace = kopia.tytuly.some((x) => x.do === undefined || porownajDaty(x.do, dzis) >= 0);
  const ustaly = trwajace
    ? []
    : kopia.tytuly.filter((x) => x.do !== undefined).sort((a, b) => porownajDaty(b.do ?? '', a.do ?? ''));
  return (
    <Karta tytul={t.tytuly.tytul} bezLinii>
      <Stos odstep={4}>
        <Tabela
          podpis={t.tytuly.podpis}
          etykietaPrzewijania={t.tytuly.przewijanie}
          kolumny={[
            { klucz: 'rodzaj', naglowek: t.tytuly.kolumny.rodzaj, tytulowa: true },
            { klucz: 'od', naglowek: t.tytuly.kolumny.od },
            { klucz: 'do', naglowek: t.tytuly.kolumny.do },
            { klucz: 'chorobowe', naglowek: t.tytuly.kolumny.chorobowe },
            { klucz: 'okres', naglowek: t.tytuly.kolumny.okres },
          ]}
          wiersze={kopia.tytuly.map((x) => ({
            id: x.id,
            rodzaj: t.tytuly.rodzaje[x.rodzaj],
            od: formatujDate(x.od),
            do: x.do ? formatujDate(x.do) : t.brakDaty,
            chorobowe: t.tytuly.ubezpieczenie[x.ubezpieczenieChorobowe.rodzaj],
            okres: okresChorobowego(x),
          }))}
        />
        {ustaly[0]?.do ? (
          <Notatka>
            <p className="m-0">
              {t.tytuly.tytulUstal({ data: formatujDate(ustaly[0].do), nastepnyDzien: formatujDate(dodajDni(ustaly[0].do, 1)) })}
            </p>
          </Notatka>
        ) : null}
      </Stos>
    </Karta>
  );
}

function SekcjaPodstaw({ kopia }: { kopia: DaneZKontaZus }) {
  const tytuly = kopia.tytuly.filter((x) => x.podstawySkladek.length > 0);
  if (tytuly.length === 0) return null;
  return (
    <Karta tytul={t.podstawy.tytul} bezLinii>
      <Stos odstep={6}>
        {tytuly.map((x) => (
          <section key={x.id} className="grid gap-3">
            <h3 className="m-0 text-body-strong text-ink">
              {x.do ? t.podstawy.tytulDo({ rodzaj: t.tytuly.rodzaje[x.rodzaj], data: formatujDate(x.do) }) : t.tytuly.rodzaje[x.rodzaj]}
            </h3>
            <DanePytania
              wiersze={[...x.podstawySkladek]
                .sort((a, b) => (a.miesiac < b.miesiac ? -1 : 1))
                .map((p) => ({ etykieta: formatujMiesiac(p.miesiac), wartosc: formatujKwote(p.kwota) }))}
            />
          </section>
        ))}
      </Stos>
    </Karta>
  );
}

function SekcjaEzla({ kopia, staraHistoria }: { kopia: DaneZKontaZus; staraHistoria: boolean }) {
  if (kopia.zaswiadczeniaEzla.length === 0 && !staraHistoria) return null;
  return (
    <Karta tytul={t.ezla.tytul} bezLinii>
      <Stos odstep={4}>
        {kopia.zaswiadczeniaEzla.length === 0 ? (
          <Komunikat kod="0114" />
        ) : (
          <Tabela
            podpis={t.ezla.podpis}
            etykietaPrzewijania={t.ezla.przewijanie}
            kolumny={[
              { klucz: 'seria', naglowek: t.ezla.kolumny.seria, tytulowa: true },
              { klucz: 'wystawiono', naglowek: t.ezla.kolumny.wystawiono },
              { klucz: 'okres', naglowek: t.ezla.kolumny.okres },
              { klucz: 'kod', naglowek: t.ezla.kolumny.kod },
              { klucz: 'platnik', naglowek: t.ezla.kolumny.platnik },
              { klucz: 'rodzaj', naglowek: t.ezla.kolumny.rodzaj },
            ]}
            wiersze={kopia.zaswiadczeniaEzla.map((z) => ({
              id: z.seriaINumer,
              seria: z.seriaINumer,
              wystawiono: formatujDate(z.dataWystawienia),
              okres: t.okresOdDo({ od: formatujDate(z.od), doDnia: formatujDate(z.do) }),
              kod: z.kodyLiterowe.length > 0 ? z.kodyLiterowe.join(', ') : t.brakDaty,
              platnik: z.platnik,
              rodzaj: t.ezla.rodzaje[z.rodzaj],
            }))}
          />
        )}
        <Odnosnik href={trasy.ViewSickLeaveList()}>{t.ezla.zobacz}</Odnosnik>
      </Stos>
    </Karta>
  );
}

function SekcjaStanuRozliczen({ kopia }: { kopia: DaneZKontaZus }) {
  const stan = stanNaDzienOdczytu(kopia);
  if (stan === null) return null;
  return (
    <Karta tytul={t.stanRozliczen.tytul} bezLinii>
      <Stos odstep={4}>
        <Kwota etykieta={t.stanRozliczen.kwota} kwota={stan.kwotaZadluzenia} />
        {stan.kwotaZadluzenia === 0 ? <p className="m-0 text-body">{t.stanRozliczen.brakZaleglosci}</p> : null}
        <DanePytania
          wiersze={[
            { etykieta: t.stanRozliczen.dzien, wartosc: formatujDate(stan.dzien) },
            {
              etykieta: t.stanRozliczen.uklad,
              wartosc: stan.umowa?.rodzaj === 'uklad-ratalny' ? t.stanRozliczen.obowiazuje : t.stanRozliczen.brak,
            },
            {
              etykieta: t.stanRozliczen.odroczenie,
              wartosc: stan.umowa?.rodzaj === 'odroczenie' ? t.stanRozliczen.obowiazuje : t.stanRozliczen.brak,
            },
          ]}
        />
        <Odnosnik href={trasy.ViewContributionBalance()}>{t.stanRozliczen.szczegoly}</Odnosnik>
      </Stos>
    </Karta>
  );
}

export function WidokDanychKontaZus() {
  const parametry = useSearchParams();
  const konto = useKonto();
  const stanKonta = useStanKonta();
  const dzis = useDzis();
  const kopia = stanKonta?.kopiaDanychZus ?? null;

  const idSprawy = parametry.get('sprawa');
  const adresPowrotu = idSprawy ? trasy.ViewCaseGuide({ idSprawy }) : trasy.ViewFamilyPlan();

  const [odczyt, setOdczyt] = useState<StanOdczytu>({ stan: 'trwa' });
  // Błąd otwarcia eZUS jest chwilowy: po powrocie na trasę widok zaczyna bez niego.
  const [bladEzus, setBladEzus] = useStanChwilowy<KodKomunikatu | null>(null);

  const odczytaj = useCallback(async () => {
    setOdczyt({ stan: 'trwa' });
    const wynik = await odczytajDaneKontaUbezpieczonego(pobierzKontekstOperacji());
    setOdczyt(wynik.ok ? { stan: 'gotowy' } : { stan: 'blad', kod: wynik.kod });
  }, []);

  // Odczyt danych konta przy każdym otwarciu ekranu (R8), także po powrocie na trasę zachowaną przez Cache
  // Components; odstęp 1 s chroni przed podwójnym odczytem przy ponownym montowaniu w trybie deweloperskim.
  const ostatniOdczyt = useRef(0);
  useEffect(() => {
    const teraz = Date.now();
    if (teraz - ostatniOdczyt.current < 1000) return;
    ostatniOdczyt.current = teraz;
    void Promise.resolve().then(odczytaj);
  }, [odczytaj]);

  // Konto ma zaświadczenia e-ZLA, ale żadne z ostatnich 12 miesięcy: sekcja z komunikatem 0114 (R7). Dane źródłowe
  // pochodzą z ostatniego odczytu z REST API symulowanego ZUS, który zapisał bieżącą kopię.
  const staraHistoriaEzla = useMemo(() => {
    if (konto === null || kopia === null || kopia.zaswiadczeniaEzla.length > 0) return false;
    return (zrodloOstatniegoOdczytuZus(konto.pesel)?.zaswiadczeniaEzla.length ?? 0) > 0;
  }, [konto, kopia]);

  const przejdzDoEzus = () => {
    const wynik = adresEzus();
    if (!wynik.ok) {
      setBladEzus(wynik.kod);
      return;
    }
    const okno = window.open(wynik.wartosc.adres, '_blank');
    if (okno === null) {
      setBladEzus('0035');
      return;
    }
    okno.opener = null;
    setBladEzus(null);
  };

  const akcje = (
    <>
      <button
        type="button"
        onClick={() => void odczytaj()}
        disabled={odczyt.stan === 'trwa'}
        className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-brand underline-offset-2 hover:text-brand-deep hover:underline disabled:cursor-wait disabled:text-ink-muted"
      >
        {t.odczytajPonownie}
      </button>
      <Przycisk wariant="glowny" ikonaPo="zewnetrzny" onClick={przejdzDoEzus}>
        {t.przejdzDoEzus} {teksty.wspolne.otwieraSieWNowejKarcie}
      </Przycisk>
    </>
  );

  const stopka = (
    <>
      <Notatka>
        <p className="m-0">{t.notatka}</p>
      </Notatka>
      <div>
        <PrzyciskLink href={adresPowrotu} wariant="drugorzedny">
          {idSprawy ? t.wrocDoInstrukcji : t.wrocDoPlanu}
        </PrzyciskLink>
      </div>
    </>
  );

  const powrot = { href: adresPowrotu, etykieta: idSprawy ? t.powrotInstrukcja : t.powrotPlan };

  // Ogłoszenie odczytu stoi w obu układach ekranu na tej samej pozycji, więc zostaje na ekranie po zapisaniu kopii.
  const ogloszenieOdczytu = (
    <OgloszenieOdczytuDanychZus trwa={odczyt.stan === 'trwa'} udany={odczyt.stan === 'gotowy'} />
  );

  if (kopia === null) {
    const bezPolaczenia = odczyt.stan === 'blad';
    return (
      <>
        {ogloszenieOdczytu}
        <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
        <Stos odstep={7.5} className="max-w-tresc">
          {odczyt.stan === 'trwa' ? <KartaOdczytuDanychZus pesel={konto?.pesel} /> : null}
          {bezPolaczenia ? (
            <Komunikat
              kod={odczyt.kod === '0002' ? '0133' : odczyt.kod}
              akcje={
                <Przycisk wariant="glowny" onClick={() => void odczytaj()}>
                  {teksty.wspolne.przyciski.sprobujPonownie}
                </Przycisk>
              }
            />
          ) : null}
          {odczyt.stan === 'trwa' ? null : (
            <Karta tytul={t.pusta.tytul} bezLinii>
              <StanPusty ikona="baza-danych" przerywany>
                <p className="m-0">{t.pusta.opis}</p>
              </StanPusty>
              {/* Bez danych z ZUS rodzic wpisuje dane samodzielnie w profilu rodziny (wymaganie Personalizacja
                  na podstawie danych wpisanych przez użytkownika). */}
              <p className="m-0 mt-6">{t.pusta.wlasneDane}</p>
              <div className="mt-4">
                <PrzyciskLink href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wariant="drugorzedny">
                  {t.pusta.wpiszDane}
                </PrzyciskLink>
              </div>
            </Karta>
          )}
          <KartaWiecejInformacji odnosniki={[ODNOSNIKI.zus]} />
          {stopka}
        </Stos>
      </>
    );
  }

  return (
    <>
      {ogloszenieOdczytu}
      <NaglowekStrony tytul={t.naglowek} powrot={powrot} akcje={akcje} />
      <Stos odstep={7.5} className="max-w-tresc">
        {odczyt.stan === 'trwa' ? <KartaOdczytuDanychZus pesel={konto?.pesel} /> : null}
        {odczyt.stan === 'blad' && odczyt.kod === '0002' ? (
          <Komunikat kod="0002" parametry={{ dataOdczytu: formatujDate(kopia.odczytano) }} />
        ) : null}
        {odczyt.stan === 'blad' && odczyt.kod !== '0002' ? <Komunikat kod={odczyt.kod} /> : null}
        {bladEzus ? <Komunikat kod={bladEzus} /> : null}
        <div className="grid gap-2">
          <p className="m-0 text-body-strong">{t.stanNaCzas({ czas: formatujDateICzas(kopia.odczytano) })}</p>
          <p className="m-0 text-body">{t.wstep}</p>
        </div>
        <SekcjaTytulow kopia={kopia} dzis={dzis} />
        <SekcjaPodstaw kopia={kopia} />
        {kopia.czlonkowieRodziny.length > 0 ? (
          <Karta tytul={t.czlonkowie.tytul} bezLinii>
            <Tabela
              podpis={t.czlonkowie.podpis}
              etykietaPrzewijania={t.czlonkowie.przewijanie}
              kolumny={[
                { klucz: 'osoba', naglowek: t.czlonkowie.kolumny.imieINazwisko, tytulowa: true },
                { klucz: 'data', naglowek: t.czlonkowie.kolumny.dataUrodzenia },
              ]}
              wiersze={kopia.czlonkowieRodziny.map((c) => ({
                id: c.pesel || `${c.imie}-${c.dataUrodzenia}`,
                osoba: `${c.imie} ${c.nazwisko}`,
                data: formatujDate(c.dataUrodzenia),
              }))}
            />
          </Karta>
        ) : null}
        {kopia.zasilki.length > 0 ? (
          <Karta tytul={t.zasilki.tytul} bezLinii>
            <Tabela
              podpis={t.zasilki.podpis}
              etykietaPrzewijania={t.zasilki.przewijanie}
              kolumny={[
                { klucz: 'rodzaj', naglowek: t.zasilki.kolumny.rodzaj, tytulowa: true },
                { klucz: 'okres', naglowek: t.zasilki.kolumny.okres },
                { klucz: 'data', naglowek: t.zasilki.kolumny.data },
                { klucz: 'kwota', naglowek: t.zasilki.kolumny.kwota, liczbowa: true },
                { klucz: 'sposob', naglowek: t.zasilki.kolumny.sposob },
              ]}
              wiersze={kopia.zasilki.map((z, i) => ({
                id: `${z.dataWyplaty}-${i}`,
                rodzaj: t.zasilki.rodzaje[z.rodzaj] ?? z.rodzaj,
                okres:
                  z.okresOd && z.okresDo
                    ? t.okresOdDo({ od: formatujDate(z.okresOd), doDnia: formatujDate(z.okresDo) })
                    : t.brakDaty,
                data: formatujDate(z.dataWyplaty),
                kwota: formatujKwote(z.kwota),
                sposob: t.zasilki.sposoby[z.sposobWyplaty],
              }))}
            />
          </Karta>
        ) : null}
        <SekcjaEzla kopia={kopia} staraHistoria={staraHistoriaEzla} />
        <SekcjaStanuRozliczen kopia={kopia} />
        <KartaWiecejInformacji odnosniki={[ODNOSNIKI.zus]} />
        {stopka}
      </Stos>
    </>
  );
}
