'use client';

// ViewPregnancyBenefits (historyjki 3.5.2.1.2 i 3.5.2.2.1; wzory cz1/P05-01 … P05-14). Właściciel: u16.
// Karty: dane, z których ustalamy wynik, zasiłek chorobowy z podziałem okresu e-ZLA i dokumentami, wykorzystanie
// okresu zasiłkowego, świadczenie rehabilitacyjne i zasiłek w wysokości zasiłku macierzyńskiego, każda z oknem
// ModalBenefitRules. Komunikaty i działania przy przyczynie braku prawa według tabeli Informacja o świadczeniach w ciąży.
import { useMemo, useState } from 'react';
import { SWIADCZENIA_SLOWNIKA } from '@/dane/katalog/slownik-dokumentow';
import { useKontekstRodziny, type KontekstRodziny } from '@/dane/magazyn/hooki';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Postep } from '@/komponenty/postep';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import type { KodKomunikatu, WynikUstaleniaPrawa } from '@/domena/typy';
import { platnikDokumentow, wybierzDokumenty } from '@/domena/zasilki/dokumenty';
import { platnikZasilkuMatki } from '@/domena/zasilki/platnik';
import { ustalSwiadczeniaWCiazy, type SwiadczeniaWCiazy, type UstalenieSwiadczenia } from '@/domena/zasilki/prawo-w-ciazy';
import { teksty } from '@/teksty';
import { DokumentyWpisow, KafelkiDanych, SekcjaDokumentow, etykietaWyniku } from './_czesci/elementy';
import { OknoZastosowanychRegul } from './_czesci/okno-zastosowanych-regul';

const T = teksty.ViewPregnancyBenefits;
type KluczKarty = 'zasilekChorobowy' | 'rehabilitacyjne' | 'zwzm';

/** Czy zalogowane konto jest matką: Rodzic, który w rodzinie jest matką. */
export function czyKontoMatki(k: KontekstRodziny): boolean {
  return k.rola === 'rodzic' && k.rodzina.daneRodziny.rodzicKonta === 'matka';
}

/** Wynik świadczeń w ciąży dla kontekstu rodziny: na koncie matki z danych konta ZUS, na pozostałych z profilu. */
export function swiadczeniaDlaKontekstu(k: KontekstRodziny): SwiadczeniaWCiazy {
  const matka = czyKontoMatki(k);
  return ustalSwiadczeniaWCiazy({
    osoba: matka ? 'matka' : 'drugi-rodzic',
    daneRodziny: k.rodzina.daneRodziny,
    daneCiazy: k.rodzina.daneCiazy,
    kopia: matka ? k.daneZusKonta : null,
    katalog: k.katalog,
    dzis: k.dzis,
    zgoda: k.stanZgody === 'udzielona',
    tytulyMatkiDlaProfilu: matka ? null : k.daneZusMatki,
  });
}

function linkSprawy(idSprawy: string): string {
  return trasy.ViewCaseDetails({ idSprawy, z: 'plan' });
}

function sprawaBrakuUbezpieczenia(s: SwiadczeniaWCiazy): 'K03' | 'K16' {
  return s.forma === 'umowa-zlecenia' || s.forma === 'jdg' ? 'K03' : 'K16';
}

interface Dzialanie { href: string; etykieta: string; wariant: 'glowny' | 'drugorzedny' }

function dzialanieZasilku(s: SwiadczeniaWCiazy): Dzialanie | null {
  const w = s.zasilekChorobowy.wynik;
  if (w.postac !== 'nie-przysluguje' || !w.przyczyna) {
    if (s.zasilekChorobowy.warunekZadluzenia !== undefined) {
      return { href: trasy.ViewContributionBalance(), etykieta: T.akcje.stanRozliczen, wariant: 'drugorzedny' };
    }
    return null;
  }
  switch (w.przyczyna.rodzaj) {
    case 'brak-ubezpieczenia': {
      const sprawa = sprawaBrakuUbezpieczenia(s);
      return { href: linkSprawy(sprawa), etykieta: T.akcje[sprawa], wariant: 'glowny' };
    }
    case 'ustanie': {
      const sprawa = s.zwzm.wynik.postac === 'przysluguje' ? 'K26' : 'K29';
      return { href: linkSprawy(sprawa), etykieta: T.akcje[sprawa], wariant: 'glowny' };
    }
    case 'wyczerpany-okres-zasilkowy':
      return { href: linkSprawy('K25'), etykieta: T.akcje.K25, wariant: 'glowny' };
    case 'zadluzenie':
      return { href: trasy.ViewContributionBalance(), etykieta: T.akcje.stanRozliczen, wariant: 'glowny' };
    default:
      return null;
  }
}

function KomunikatWyniku({ wynik, dzialanie }: { wynik: WynikUstaleniaPrawa; dzialanie: Dzialanie | null }) {
  if (!wynik.kodKomunikatu) return null;
  return (
    <div className="mt-4 flex flex-col items-start gap-4">
      <Komunikat
        kod={wynik.kodKomunikatu as KodKomunikatu}
        parametry={wynik.parametryKomunikatu as never}
        className="w-full"
      />
      {dzialanie ? (
        <PrzyciskLink href={dzialanie.href} wariant={dzialanie.wariant}>
          {dzialanie.etykieta}
        </PrzyciskLink>
      ) : null}
    </div>
  );
}

function ZawartoscDokumentow({ s, swiadczenie, idNaglowka, wstep }: {
  s: SwiadczeniaZKatalogiem;
  swiadczenie: string;
  idNaglowka: string;
  wstep?: string;
}) {
  const brakUbezpieczenia = s.zasilekChorobowy.wynik.przyczyna?.rodzaj === 'brak-ubezpieczenia' || s.forma === null || s.forma === 'brak-tytulu';
  if (brakUbezpieczenia) {
    return (
      <StanPusty ikona="plik" przerywany>
        {s.tryb === 'konto-zus' ? T.brakDokumentow : T.brakDokumentowMatki}
      </StanPusty>
    );
  }
  const forma = s.forma as Exclude<typeof s.forma, null>;
  const platnik = platnikDokumentow(platnikZasilkuMatki({ forma, platnikZasilku: s.platnikZasilku, ...(s.tytul ? { tytul: s.tytul } : {}) }));
  const poUstaniu = swiadczenie === SWIADCZENIA_SLOWNIKA.zwzm ? true : s.poUstaniu;
  const wybor = wybierzDokumenty({ swiadczenieAlboWniosek: swiadczenie, forma, platnik, poUstaniu }, s.katalog);
  if ('kod' in wybor) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Komunikat kod="0087" className="w-full" />
        <PrzyciskLink href={trasy.ViewProfilePayer({ powrot: trasy.ViewPregnancyBenefits() })} wariant="glowny">
          {T.odpowiedzOPlatnika}
        </PrzyciskLink>
      </div>
    );
  }
  if (wybor.length === 0) {
    return <StanPusty ikona="plik" przerywany>{T.zwzm.nieDotyczyDokumentow}</StanPusty>;
  }
  return <DokumentyWpisow wpisy={wybor} wstep={wstep} naglowekId={idNaglowka} />;
}

type SwiadczeniaZKatalogiem = SwiadczeniaWCiazy & { katalog: KontekstRodziny['katalog']; platnikZasilku: ReturnType<typeof platnikZasilkuZRodziny> };

function platnikZasilkuZRodziny(k: KontekstRodziny) {
  return k.rodzina.daneRodziny.matka.platnikZasilku?.wartosc ?? null;
}

export function WidokSwiadczenWCiazy() {
  const kontekst = useKontekstRodziny();
  const [okno, ustawOkno] = useState<KluczKarty | null>(null);
  const s = useMemo<SwiadczeniaZKatalogiem | null>(
    () => (kontekst ? { ...swiadczeniaDlaKontekstu(kontekst), katalog: kontekst.katalog, platnikZasilku: platnikZasilkuZRodziny(kontekst) } : null),
    [kontekst],
  );

  if (kontekst === null || s === null) {
    return (
      <>
        <NaglowekStrony tytul={T.naglowek} powrot={{ etykieta: T.powrot }} />
        <StanPusty ikona="profil" akcja={<PrzyciskLink href={trasy.ViewProfileZusData()} wariant="glowny">{T.otworzProfil}</PrzyciskLink>}>
          {T.brakProfilu}
        </StanPusty>
      </>
    );
  }

  const matka = s.tryb === 'konto-zus';
  const drugiRodzic = !czyKontoMatki(kontekst);
  const bezZgody = !s.zgoda;
  const zc = s.zasilekChorobowy;
  const wzc = zc.wynik;
  const oz = s.okresZasilkowy;
  const opcjeEtykiety = { bezZgody, drugiRodzic, warunekSkladek: zc.warunekZadluzenia !== undefined };
  const etykiety: Record<KluczKarty, string> = {
    zasilekChorobowy: etykietaWyniku(wzc, opcjeEtykiety),
    rehabilitacyjne: etykietaWyniku(s.rehabilitacyjne.wynik, opcjeEtykiety),
    zwzm: etykietaWyniku(s.zwzm.wynik, opcjeEtykiety),
  };
  const nazwy: Record<KluczKarty, string> = {
    zasilekChorobowy: T.karty.zasilekChorobowy,
    rehabilitacyjne: T.karty.rehabilitacyjne,
    zwzm: T.karty.zwzm,
  };
  const ustalenia: Record<KluczKarty, UstalenieSwiadczenia> = { zasilekChorobowy: zc, rehabilitacyjne: s.rehabilitacyjne, zwzm: s.zwzm };
  const zrodla = T.zrodla;
  const przyciskReguly = (klucz: KluczKarty) => (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => ustawOkno(klucz)}
      className="cursor-pointer border-0 bg-transparent p-0 text-body-strong text-brand underline-offset-2 hover:text-brand-deep hover:underline"
    >
      {T.zobaczReguly}
    </button>
  );

  const kafelkiDanych = wzc.daneZeZrodlem.map((d) => ({
    etykieta: d.pole,
    wartosc: d.wartosc,
    dopisek: T.zrodlo({ zrodlo: zrodla[d.zrodlo] }),
  }));

  const kafelkiZasilku = wzc.postac === 'przysluguje'
    ? [
        ...(wzc.od ? [{ etykieta: T.pola.od, wartosc: formatujDate(wzc.od) }] : []),
        { etykieta: T.pola.do, wartosc: wzc.do ? formatujDate(wzc.do) : T.pola.bezDatyKonca },
        { etykieta: T.pola.wyplaca, wartosc: wzc.wyplaca ?? T.platnicy.zus },
        { etykieta: T.pola.stawka, wartosc: T.stawki.podstawy({ procent: String(wzc.stawka ?? 100) }) },
        ...(oz?.wynagrodzenie
          ? [{ etykieta: T.pola.wynagrodzenieWRoku({ rok: String(oz.wynagrodzenie.rok) }), wartosc: T.pola.dniZ({ a: String(oz.wynagrodzenie.wykorzystane), b: String(oz.wynagrodzenie.limit) }) }]
          : []),
      ]
    : [];
  const podzial = wzc.podzial ?? [];
  const rokPodzialu = podzial.length > 0 ? podzial[podzial.length - 1].do.slice(0, 4) : '';
  const limitWynagrodzenia = oz?.wynagrodzenie?.limit ?? 33;

  return (
    <>
      <NaglowekStrony
        tytul={T.naglowek}
        stanNa={kontekst.dzis}
        wstep={drugiRodzic ? T.wstepDrugiRodzic : T.wstep}
        powrot={{ href: trasy.ViewFamilyPlan(), etykieta: T.powrot }}
      />
      <div className="flex max-w-tresc flex-col gap-7.5">
        {drugiRodzic ? <Komunikat kod="0156" /> : null}
        {bezZgody ? (
          <div className="flex flex-col items-start gap-4">
            <Komunikat kod="0004" className="w-full" />
            <Odnosnik href={trasy.ViewProfileSummary({ tryb: 'rodzina' })}>{T.otworzProfil}</Odnosnik>
          </div>
        ) : null}

        <Karta tytul={drugiRodzic ? T.karty.daneMatki : T.karty.dane} bezLinii akcje={<Odnosnik href={trasy.ViewProfileSummary({ tryb: 'rodzina' })}>{T.profilRodziny}</Odnosnik>}>
          <KafelkiDanych kafelki={kafelkiDanych} />
          <div className="mt-4">
            <Notatka>{T.notatkaPonownie}</Notatka>
          </div>
        </Karta>

        <Karta tytul={T.karty.zasilekChorobowy} bezLinii akcje={przyciskReguly('zasilekChorobowy')}>
          <p className="m-0 text-body-strong text-ink-strong">{etykiety.zasilekChorobowy}</p>
          <KomunikatWyniku wynik={wzc} dzialanie={dzialanieZasilku(s)} />
          {kafelkiZasilku.length > 0 ? <KafelkiDanych kafelki={kafelkiZasilku} szerokosc="waska" className="mt-4" /> : null}
          {wzc.postac === 'przysluguje' && s.forma === 'umowa-o-prace' && matka ? (
            <p className="m-0 mt-4 text-body">
              {T.opisWynagrodzenia({ limit: String(limitWynagrodzenia), nastepny: String(limitWynagrodzenia + 1), wyplaca: wzc.wyplaca ?? T.platnicy.zus })}
            </p>
          ) : null}
          {zc.platnikNieustalony && wzc.postac === 'przysluguje' ? (
            <p className="m-0 mt-4 text-body">{T.platnicy.wyjasnienieNieustalonego}</p>
          ) : null}
          {podzial.length > 0 && s.forma === 'umowa-o-prace' ? (
            <>
              <h3 id="podzial-t" className="m-0 mt-6 mb-3 text-body-strong">{T.podzialNaglowek({ rok: rokPodzialu })}</h3>
              <Tabela
                podpis={T.podzialNaglowek({ rok: rokPodzialu })}
                etykietaPrzewijania={T.podzialPrzewijanie}
                kolumny={[
                  { klucz: 'okres', naglowek: T.podzialKolumny.okres, tytulowa: true },
                  { klucz: 'swiadczenie', naglowek: T.podzialKolumny.swiadczenie },
                  { klucz: 'stawka', naglowek: T.podzialKolumny.stawka },
                  { klucz: 'wyplaca', naglowek: T.podzialKolumny.wyplaca },
                ]}
                wiersze={podzial.map((p) => ({
                  id: p.od,
                  okres: <span className="whitespace-nowrap">{T.okres({ od: formatujDate(p.od), koniec: formatujDate(p.do) })}</span>,
                  swiadczenie: T.rodzajeOkresu[p.rodzaj]({ dni: String(p.dni) }),
                  stawka: p.rodzaj === 'wynagrodzenie-chorobowe' ? T.stawki.wynagrodzenia({ procent: String(p.stawka) }) : T.stawki.podstawy({ procent: String(p.stawka) }),
                  wyplaca: p.wyplaca,
                }))}
              />
            </>
          ) : null}
          {zc.ustaniePrzedPorodem ? (
            <div className="mt-6 flex flex-col items-start gap-3 rounded-sm bg-surface-page px-4 py-3">
              <p className="m-0 text-body-strong text-ink-strong">{T.ustanie.naglowek({ data: formatujDate(zc.ustaniePrzedPorodem) })}</p>
              <p className="m-0 text-body">{T.ustanie.opis}</p>
              <PrzyciskLink href={linkSprawy('K29')} wariant="drugorzedny">{T.akcje.K29}</PrzyciskLink>
            </div>
          ) : null}
          <SekcjaDokumentow id="dok-zc-t">
            <ZawartoscDokumentow s={s} swiadczenie={SWIADCZENIA_SLOWNIKA.zasilekChorobowy} idNaglowka="dok-zc-t" />
          </SekcjaDokumentow>
        </Karta>

        <Karta
          tytul={T.karty.okresZasilkowy}
          bezLinii
          akcje={matka ? <Odnosnik href={trasy.ViewSickLeaveList()}>{T.okresZasilkowy.ezla}</Odnosnik> : undefined}
        >
          {bezZgody ? (
            <p className="m-0 text-body">{T.okresZasilkowy.bezZgody}</p>
          ) : !matka ? (
            <p className="m-0 text-body">{T.okresZasilkowy.bezEzlaMatki}</p>
          ) : oz === null ? (
            <div className="flex flex-col gap-4">
              <p className="m-0 text-body">{T.okresZasilkowy.regula}</p>
              <Komunikat kod="0114" />
            </div>
          ) : (
            <>
              <p className="m-0 text-body">{T.okresZasilkowy.opis({ limit: String(oz.limit) })}</p>
              <KafelkiDanych
                className="mt-4"
                kafelki={[
                  { etykieta: T.pola.wykorzystane, wartosc: T.pola.zZ({ a: String(oz.wykorzystane), b: String(oz.limit) }) },
                  { etykieta: T.pola.pozostale, wartosc: String(oz.pozostale) },
                  ...(oz.wynagrodzenie
                    ? [{ etykieta: T.pola.wynagrodzenieWRoku({ rok: String(oz.wynagrodzenie.rok) }), wartosc: T.pola.dniZ({ a: String(oz.wynagrodzenie.wykorzystane), b: String(oz.wynagrodzenie.limit) }) }]
                    : []),
                ]}
              />
              <p id="oz-pasek" className="m-0 mt-4 mb-2 text-small-strong">
                {T.okresZasilkowy.pasek({ a: String(oz.wykorzystane), b: String(oz.limit) })}
              </p>
              <Postep
                wartosc={oz.wykorzystane}
                maks={oz.limit}
                etykieta={T.okresZasilkowy.pasek({ a: String(oz.wykorzystane), b: String(oz.limit) })}
                idEtykiety="oz-pasek"
                tekstWartosci={T.pola.dniZ({ a: String(oz.wykorzystane), b: String(oz.limit) })}
              />
            </>
          )}
        </Karta>

        <Karta tytul={T.karty.rehabilitacyjne} bezLinii akcje={przyciskReguly('rehabilitacyjne')}>
          <p className="m-0 text-body-strong text-ink-strong">{etykiety.rehabilitacyjne}</p>
          {s.rehabilitacyjne.wynik.przyczyna?.rodzaj === 'brak-ubezpieczenia' ? (
            <div className="mt-4">
              <Odnosnik href={linkSprawy(sprawaBrakuUbezpieczenia(s))}>{T.akcje[sprawaBrakuUbezpieczenia(s)]}</Odnosnik>
            </div>
          ) : (
            <>
              <p className="m-0 mt-4 text-body">{T.rehabilitacyjne.opis}</p>
              <KafelkiDanych
                szerokosc="waska"
                className="mt-4"
                kafelki={[
                  {
                    etykieta: T.pola.od,
                    wartosc: s.rehabilitacyjne.wynik.postac === 'przysluguje' && s.rehabilitacyjne.wynik.od
                      ? formatujDate(s.rehabilitacyjne.wynik.od)
                      : T.pola.dzienPoWyczerpaniu,
                  },
                  { etykieta: T.pola.najdluzej, wartosc: T.pola.miesiace({ liczba: '12' }) },
                  { etykieta: T.pola.wyplaca, wartosc: s.rehabilitacyjne.wynik.wyplaca ?? T.platnicy.zus },
                  { etykieta: T.pola.stawkaWCiazy, wartosc: T.stawki.podstawy({ procent: String(s.rehabilitacyjne.wynik.stawka ?? 100) }) },
                ]}
              />
              <p className="m-0 mt-4 text-body">{T.rehabilitacyjne.poza}</p>
            </>
          )}
          <SekcjaDokumentow id="dok-sr-t">
            <ZawartoscDokumentow s={s} swiadczenie={SWIADCZENIA_SLOWNIKA.swiadczenieRehabilitacyjne} idNaglowka="dok-sr-t" />
          </SekcjaDokumentow>
        </Karta>

        <Karta tytul={T.karty.zwzm} bezLinii akcje={przyciskReguly('zwzm')}>
          <p className="m-0 text-body-strong text-ink-strong">{etykiety.zwzm}</p>
          <p className="m-0 mt-4 text-body">
            {T.zwzm.opis}
            {s.zwzm.wynik.postac === 'warunek' && kontekst.rodzina.daneRodziny.matka.zmianaZatrudnienia?.rodzaj.wartosc !== 'ustanie' ? ` ${T.zwzm.bezZmian}` : null}
          </p>
          <KafelkiDanych
            szerokosc="waska"
            className="mt-4"
            kafelki={[
              ...(s.zwzm.wynik.postac === 'przysluguje' && s.zwzm.wynik.od && s.zwzm.wynik.do
                ? [
                    { etykieta: T.pola.od, wartosc: formatujDate(s.zwzm.wynik.od) },
                    { etykieta: T.pola.do, wartosc: formatujDate(s.zwzm.wynik.do) },
                  ]
                : []),
              { etykieta: T.pola.wyplaca, wartosc: T.platnicy.zus },
              { etykieta: T.pola.stawka, wartosc: T.stawki.zwzm({ procent: String(s.zwzm.wynik.stawka ?? 100) }) },
              { etykieta: T.pola.podstawaCoNajmniej, wartosc: formatujKwote(Number(s.zwzm.wynik.zastosowaneReguly[0]?.wartosci[1]?.wartosc ?? 414710)) },
            ]}
          />
          <SekcjaDokumentow id="dok-zm-t">
            {s.forma === 'umowa-o-prace' ? (
              <ZawartoscDokumentow
                s={s}
                swiadczenie={SWIADCZENIA_SLOWNIKA.zwzm}
                idNaglowka="dok-zm-t"
                {...(s.zwzm.wynik.postac === 'przysluguje' ? {} : { wstep: T.zwzm.jesliUstanie })}
              />
            ) : (
              <StanPusty ikona="plik" przerywany>{T.zwzm.nieDotyczyDokumentow}</StanPusty>
            )}
          </SekcjaDokumentow>
        </Karta>
      </div>

      <OknoZastosowanychRegul
        otwarte={okno !== null}
        onZamknij={() => ustawOkno(null)}
        nazwaSwiadczenia={okno ? nazwy[okno] : undefined}
        etykietaWyniku={okno ? etykiety[okno] : undefined}
        ustalenie={okno ? ustalenia[okno] : null}
        katalog={kontekst.katalog}
      />
    </>
  );
}
