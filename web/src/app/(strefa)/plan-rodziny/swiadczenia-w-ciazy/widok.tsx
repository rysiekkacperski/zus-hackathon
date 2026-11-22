'use client';

// ViewPregnancyBenefits (historyjki 3.5.2.1.2 i 3.5.2.2.1; wzory cz1/P05-01 … P05-14). Właściciel: u16.
// Karty: dane, z których ustalamy wynik, zasiłek chorobowy z podziałem okresu e-ZLA i dokumentami, wykorzystanie
// okresu zasiłkowego, świadczenie rehabilitacyjne i zasiłek w wysokości zasiłku macierzyńskiego, każda z oknem
// ModalBenefitRules, oraz karta ryzyk dla zasiłków w ciąży ze szczególną ochroną z Kodeksu pracy. Komunikaty i działania
// przy przyczynie braku prawa według tabeli Informacja o świadczeniach w ciąży; działanie prowadzi wyłącznie do sprawy,
// którą zawiera plan rodziny.
import { useState } from 'react';
import { ustalSwiadczeniaWCiazy as ustalSwiadczeniaWCiazyApi } from '@/dane/api/klient';
import { useWyliczenieApi, type WyliczenieApi } from '@/dane/api/wyliczenie';
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
import { BladWyliczenia, StatusPrzeliczania, SzkieletWyliczenia } from '@/komponenty/stan-wyliczenia';
import { Tabela } from '@/komponenty/tabela';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { koniecUmowyDoSprawdzenia } from '@/domena/przewodnik/ryzyka';
import type { IdPozycji, KodKomunikatu, WynikUstaleniaPrawa } from '@/domena/typy';
import { platnikDokumentow, wybierzDokumenty } from '@/domena/zasilki/dokumenty';
import { platnikZasilkuMatki } from '@/domena/zasilki/platnik';
import type { SwiadczeniaWCiazy, UstalenieSwiadczenia } from '@/domena/zasilki/prawo-w-ciazy';
import type { OdpowiedzSwiadczenWCiazyApi, ZadanieSwiadczenWCiazyApi } from '@/domena/typy/api-v1';
import { teksty } from '@/teksty';
import { DokumentyWpisow, KafelkiDanych, SekcjaDokumentow, etykietaWyniku } from './_czesci/elementy';
import { OknoZastosowanychRegul } from './_czesci/okno-zastosowanych-regul';

const T = teksty.ViewPregnancyBenefits;
type KluczKarty = 'zasilekChorobowy' | 'rehabilitacyjne' | 'zwzm';

/** Czy zalogowane konto jest matką: Rodzic, który w rodzinie jest matką. */
export function czyKontoMatki(k: KontekstRodziny): boolean {
  return k.rola === 'rodzic' && k.rodzina.daneRodziny.rodzicKonta === 'matka';
}

/**
 * Żądanie POST /api/v1/swiadczenia-w-ciazy dla kontekstu rodziny: na koncie matki wynik z danych konta ZUS, na pozostałych
 * z profilu rodziny. Serwer ustala świadczenia funkcją domeny ustalSwiadczeniaWCiazy z katalogiem świadczeń serwera.
 */
export function zadanieSwiadczenWCiazy(k: KontekstRodziny): ZadanieSwiadczenWCiazyApi {
  const matka = czyKontoMatki(k);
  return {
    dzis: k.dzis,
    osoba: matka ? 'matka' : 'drugi-rodzic',
    daneRodziny: k.rodzina.daneRodziny,
    daneCiazy: k.rodzina.daneCiazy,
    kopia: matka ? k.daneZusKonta : null,
    zgoda: k.stanZgody === 'udzielona',
    tytulyMatkiDlaProfilu: matka ? null : k.daneZusMatki,
  };
}

/** Wynik świadczeń w ciąży z REST API; `k` równe null pomija wyliczenie. */
export function useSwiadczeniaWCiazyApi(k: KontekstRodziny | null): WyliczenieApi<OdpowiedzSwiadczenWCiazyApi> {
  return useWyliczenieApi(k === null ? null : zadanieSwiadczenWCiazy(k), ustalSwiadczeniaWCiazyApi);
}

function linkSprawy(idSprawy: string): string {
  return trasy.ViewCaseDetails({ idSprawy, z: 'plan' });
}

/** Identyfikator sprawy pozycji w planie rodziny (sprawa matki albo obojga rodziców); null, gdy planu nie ma tej sprawy. */
function sprawaWPlanie(k: KontekstRodziny, idPozycji: IdPozycji): string | null {
  const pozycje = k.rodzina.plan?.pozycje.filter((p) => p.idPozycji === idPozycji) ?? [];
  const sprawa = pozycje.find((p) => p.rodzic === 'matka' || p.rodzic === 'oboje-rodzice') ?? pozycje[0];
  return sprawa?.idSprawy ?? null;
}

function sprawaBrakuUbezpieczenia(s: SwiadczeniaWCiazy): 'K03' | 'K16' {
  return s.forma === 'umowa-zlecenia' || s.forma === 'jdg' ? 'K03' : 'K16';
}

/**
 * Sprawa planu po ustaniu ubezpieczenia w ciąży: K26 przy zasiłku w wysokości zasiłku macierzyńskiego, K08 przy
 * zasiłku macierzyńskim po porodzie (naruszenie z wyrokiem, przedłużenie umowy, upadłość, likwidacja, śmierć
 * pracodawcy), a w pozostałych przypadkach K29 z ryzykiem braku ubezpieczenia w dniu porodu.
 */
function sprawaPoUstaniu(s: SwiadczeniaWCiazy): 'K26' | 'K08' | 'K29' {
  if (s.zwzm.wynik.postac === 'przysluguje') return 'K26';
  if (s.zwzm.macierzynskiPoUstaniu || (s.poUstaniu && s.macierzynski.wynik.postac === 'przysluguje')) return 'K08';
  return 'K29';
}

interface Dzialanie { href: string; etykieta: string; wariant: 'glowny' | 'drugorzedny' }

type SprawaDzialania = keyof Pick<typeof T.akcje, 'K03' | 'K08' | 'K16' | 'K25' | 'K26' | 'K29'>;

/** Działanie prowadzące do sprawy planu; null, gdy planu nie ma tej sprawy. */
function dzialanieSprawy(k: KontekstRodziny, id: SprawaDzialania, wariant: Dzialanie['wariant']): Dzialanie | null {
  const idSprawy = sprawaWPlanie(k, id);
  return idSprawy ? { href: linkSprawy(idSprawy), etykieta: T.akcje[id], wariant } : null;
}

function dzialanieZasilku(s: SwiadczeniaWCiazy, k: KontekstRodziny): Dzialanie | null {
  const w = s.zasilekChorobowy.wynik;
  if (w.postac !== 'nie-przysluguje' || !w.przyczyna) {
    if (s.zasilekChorobowy.warunekZadluzenia !== undefined) {
      return { href: trasy.ViewContributionBalance(), etykieta: T.akcje.stanRozliczen, wariant: 'drugorzedny' };
    }
    return null;
  }
  switch (w.przyczyna.rodzaj) {
    case 'brak-ubezpieczenia':
      return dzialanieSprawy(k, sprawaBrakuUbezpieczenia(s), 'glowny');
    case 'ustanie':
      return dzialanieSprawy(k, sprawaPoUstaniu(s), 'glowny');
    case 'wyczerpany-okres-zasilkowy':
      return dzialanieSprawy(k, 'K25', 'glowny');
    case 'zadluzenie':
      return { href: trasy.ViewContributionBalance(), etykieta: T.akcje.stanRozliczen, wariant: 'glowny' };
    default:
      return null;
  }
}

/** Stawka zasiłku chorobowego na kafelku: stawka ustalonego okresu albo obie stawki, z kodem B i bez kodu B. */
function tekstStawkiZasilku(zc: UstalenieSwiadczenia): string {
  const sz = zc.stawkaZasilku;
  if (sz?.wartosc !== undefined) return T.stawki.podstawy({ procent: String(sz.wartosc) });
  if (sz) return T.stawki.podstawyZKodemB({ zKodemB: String(sz.zKodemB), bezKoduB: String(sz.bezKoduB) });
  return T.stawki.podstawy({ procent: String(zc.wynik.stawka ?? 100) });
}

/** Stawka wynagrodzenia chorobowego w opisie: stawka odcinków wynagrodzenia z podziału albo obie stawki. */
function tekstStawkiWynagrodzenia(zc: UstalenieSwiadczenia): string {
  const stawki = new Set((zc.wynik.podzial ?? []).filter((p) => p.rodzaj === 'wynagrodzenie-chorobowe').map((p) => p.stawka));
  if (stawki.size === 1) return T.stawki.wynagrodzenia({ procent: String([...stawki][0]) });
  const sw = zc.stawkaWynagrodzenia ?? { zKodemB: 100, bezKoduB: 80 };
  return T.stawki.wynagrodzeniaZKodemB({ zKodemB: String(sw.zKodemB), bezKoduB: String(sw.bezKoduB) });
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

interface PozycjaRyzyka {
  id: string;
  tytul: string;
  opisy: string[];
  wykryte: boolean;
  link: { href: string; etykieta: string } | null;
}

/**
 * Karta ryzyk dla zasiłków w ciąży: umowa albo działalność dla pozoru, podwyższenie podstawy wymiaru składek,
 * ubezpieczenie chorobowe w dniu porodu i szczególna ochrona z Kodeksu pracy według formy zatrudnienia matki.
 * Informacja jest stała, a gdy plan rodziny zawiera sprawę ryzyka (K28, ostrzeżenie przy K08, K29, K03), pozycja
 * dostaje oznaczenie i odnośnik do sprawy.
 */
function KartaRyzyk({ kontekst, s }: { kontekst: KontekstRodziny; s: SwiadczeniaWCiazy }) {
  const R = T.ryzyka;
  const link = (idSprawy: string | null, etykieta: string = R.zobaczSprawe) => (idSprawy ? { href: linkSprawy(idSprawy), etykieta } : null);
  const k28 = sprawaWPlanie(kontekst, 'K28');
  // Strażnik dopina ostrzeżenie do K08, a matce na umowie o pracę bez K08 w planie do K07.
  const podwyzszenie = kontekst.rodzina.plan?.pozycje.find(
    (p) => (p.idPozycji === 'K08' || p.idPozycji === 'K07') && p.ostrzezenia.some((o) => o.rodzaj === 'podwyzszenie-podstawy'),
  );
  const dzienPorodu = sprawaWPlanie(kontekst, 'K29') ?? sprawaWPlanie(kontekst, 'K03');
  const uop = s.forma === 'umowa-o-prace';
  const formaDrugiego = kontekst.rodzina.daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc;
  // Szczególna ochrona drugiego rodzica przy urlopie ojcowskim i rodzicielskim: art. 177 § 1 i § 1¹ Kodeksu pracy
  // (Dz.U. 2026 poz. 1245) obejmuje wyłącznie pracownika.
  const ochronaDrugiego = formaDrugiego === 'umowa-o-prace'
    ? [R.ochrona.drugiRodzic]
    : formaDrugiego === 'umowa-zlecenia' || formaDrugiego === 'jdg' ? [R.ochrona.drugiRodzicBezUmowyOPrace] : [];
  const pozycje: PozycjaRyzyka[] = [
    { id: 'pozor', tytul: R.pozor.tytul, opisy: [R.pozor.opis], wykryte: k28 !== null, link: link(k28) },
    {
      id: 'podwyzszenie', tytul: R.podwyzszenie.tytul, opisy: [R.podwyzszenie.opis],
      wykryte: podwyzszenie !== undefined, link: link(podwyzszenie?.idSprawy ?? null),
    },
    {
      id: 'dzien-porodu', tytul: R.dzienPorodu.tytul, opisy: [R.dzienPorodu.opis, R.dzienPorodu.wyjatki],
      wykryte: dzienPorodu !== null, link: link(dzienPorodu),
    },
    {
      id: 'ochrona', tytul: R.ochrona.tytul,
      opisy: [uop ? R.ochrona.umowaOPrace : R.ochrona.bezUmowyOPrace, ...ochronaDrugiego],
      wykryte: false, link: uop ? link(sprawaWPlanie(kontekst, 'K30'), R.ochrona.zobaczOchrone) : null,
    },
  ];
  return (
    <Karta tytul={R.tytul} bezLinii>
      <p className="m-0 text-body">{R.wstep}</p>
      <ul className="m-0 mt-4 grid list-none gap-3 p-0">
        {pozycje.map((p) => (
          <li key={p.id} className="flex flex-col items-start gap-2 rounded-sm bg-surface-page px-4 py-3">
            <h3 className="m-0 text-body-strong text-ink-strong">{p.tytul}</h3>
            {p.wykryte ? <p className="m-0 text-small-strong text-brand">{R.wykryto}</p> : null}
            {p.opisy.map((o) => (
              <p key={o} className="m-0 text-body">{o}</p>
            ))}
            {p.link ? <Odnosnik href={p.link.href}>{p.link.etykieta}</Odnosnik> : null}
          </li>
        ))}
      </ul>
    </Karta>
  );
}

type SwiadczeniaZKatalogiem = SwiadczeniaWCiazy & { katalog: KontekstRodziny['katalog']; platnikZasilku: ReturnType<typeof platnikZasilkuZRodziny> };

function platnikZasilkuZRodziny(k: KontekstRodziny) {
  return k.rodzina.daneRodziny.matka.platnikZasilku?.wartosc ?? null;
}

export function WidokSwiadczenWCiazy() {
  const kontekst = useKontekstRodziny();
  const [okno, ustawOkno] = useState<KluczKarty | null>(null);
  const wyliczenie = useSwiadczeniaWCiazyApi(kontekst);
  const swiadczenia = wyliczenie.wartosc?.swiadczenia ?? null;
  const s: SwiadczeniaZKatalogiem | null =
    kontekst && swiadczenia ? { ...swiadczenia, katalog: kontekst.katalog, platnikZasilku: platnikZasilkuZRodziny(kontekst) } : null;

  if (kontekst !== null && s === null) {
    return (
      <>
        <NaglowekStrony tytul={T.naglowek} powrot={{ href: trasy.ViewFamilyPlan(), etykieta: T.powrot }} stanNa={kontekst.dzis} />
        {wyliczenie.blad ? (
          <BladWyliczenia
            kod={wyliczenie.blad.kod}
            parametry={wyliczenie.blad.parametry as never}
            onPonow={wyliczenie.ponow}
            className="max-w-tresc"
          />
        ) : (
          <SzkieletWyliczenia className="max-w-tresc" />
        )}
      </>
    );
  }

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
  // Zasiłek w wysokości zasiłku macierzyńskiego przysługuje wyłącznie pracownicy na umowie o pracę.
  const zwzmDlaPracownicy = s.forma === null || s.forma === 'umowa-o-prace';
  const etykiety: Record<KluczKarty, string> = {
    zasilekChorobowy: etykietaWyniku(wzc, opcjeEtykiety),
    rehabilitacyjne: etykietaWyniku(s.rehabilitacyjne.wynik, opcjeEtykiety),
    zwzm: !zwzmDlaPracownicy
      ? T.wyniki.nieDlaPracownicy
      : s.zwzm.macierzynskiPoUstaniu
        ? T.wyniki.macierzynskiPoUstaniu
        : etykietaWyniku(s.zwzm.wynik, opcjeEtykiety),
  };
  const sprawaK24 = sprawaWPlanie(kontekst, 'K24');
  const sprawaK08 = sprawaWPlanie(kontekst, 'K08');
  const sprawaPoUstaniuWPlanie = sprawaWPlanie(kontekst, sprawaPoUstaniu(s));
  const sprawaBrakuUbezpieczeniaWPlanie = sprawaWPlanie(kontekst, sprawaBrakuUbezpieczenia(s));
  // Koniec umowy o pracę z konta ZUS w ciąży bez zgłoszonego ustania: rodzic sprawdza przedłużenie do dnia porodu.
  const koniecUmowy = matka && s.forma === 'umowa-o-prace' && kontekst.daneZusKonta
    ? koniecUmowyDoSprawdzenia(kontekst.rodzina.daneRodziny.matka, kontekst.daneZusKonta.tytuly, kontekst.rodzina.daneCiazy, kontekst.dzis)
    : null;
  const bezWynagrodzenia = s.forma === 'umowa-zlecenia' || s.forma === 'jdg';
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
        { etykieta: T.pola.stawka, wartosc: tekstStawkiZasilku(zc) },
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
        <StatusPrzeliczania laduje={wyliczenie.laduje} />
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
          <KomunikatWyniku wynik={wzc} dzialanie={dzialanieZasilku(s, kontekst)} />
          {wzc.przyczyna?.rodzaj === 'okres-wyczekiwania' && !drugiRodzic ? (
            <div className="mt-4 flex flex-col items-start gap-3 rounded-sm bg-surface-page px-4 py-3">
              <p className="m-0 text-body-strong text-ink-strong">{T.wyjatkiWyczekiwania.naglowek}</p>
              <p className="m-0 text-body">{T.wyjatkiWyczekiwania.absolwent}</p>
              <p className="m-0 text-body">{T.wyjatkiWyczekiwania.przerwa}</p>
              <p className="m-0 text-body">{T.wyjatkiWyczekiwania.zapytaj}</p>
              <Odnosnik href={trasy.ViewZusQuestion(sprawaK24 ? { sprawa: sprawaK24 } : {})}>{T.wyjatkiWyczekiwania.zadajPytanie}</Odnosnik>
            </div>
          ) : null}
          {kafelkiZasilku.length > 0 ? <KafelkiDanych kafelki={kafelkiZasilku} szerokosc="waska" className="mt-4" /> : null}
          {wzc.postac === 'przysluguje' && (zc.zaswiadczeniaBezKoduB ?? 0) > 0 ? (
            <Komunikat kod="0234" className="mt-4" />
          ) : null}
          {wzc.postac === 'przysluguje' && zc.stawkaZasilku && zc.stawkaZasilku.wartosc === undefined ? (
            <p className="m-0 mt-4 text-body">{T.stawkaZasilku}</p>
          ) : null}
          {wzc.postac === 'przysluguje' && s.forma === 'umowa-o-prace' && matka ? (
            <p className="m-0 mt-4 text-body">
              {T.opisWynagrodzenia({
                limit: String(limitWynagrodzenia),
                nastepny: String(limitWynagrodzenia + 1),
                wyplaca: wzc.wyplaca ?? T.platnicy.zus,
                stawka: tekstStawkiWynagrodzenia(zc),
              })}
            </p>
          ) : null}
          {wzc.postac === 'przysluguje' && bezWynagrodzenia ? (
            <p className="m-0 mt-4 text-body">
              {drugiRodzic
                ? T.odPierwszegoDniaMatki({ wyplaca: wzc.wyplaca ?? T.platnicy.zus })
                : T.odPierwszegoDnia({ wyplaca: wzc.wyplaca ?? T.platnicy.zus })}
            </p>
          ) : null}
          {zc.platnikNieustalony && wzc.postac === 'przysluguje' ? (
            <p className="m-0 mt-4 text-body">{T.platnicy.wyjasnienieNieustalonego}</p>
          ) : null}
          {podzial.length > 0 ? (
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
              {sprawaPoUstaniuWPlanie ? (
                <PrzyciskLink href={linkSprawy(sprawaPoUstaniuWPlanie)} wariant="drugorzedny">{T.akcje[sprawaPoUstaniu(s)]}</PrzyciskLink>
              ) : null}
            </div>
          ) : null}
          {koniecUmowy ? (
            <div className="mt-6 flex flex-col items-start gap-3 rounded-sm bg-surface-page px-4 py-3">
              <p className="m-0 text-body-strong text-ink-strong">{T.koniecUmowyZKonta.naglowek({ data: formatujDate(koniecUmowy) })}</p>
              <p className="m-0 text-body">{T.koniecUmowyZKonta.opis}</p>
              <PrzyciskLink href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wariant="drugorzedny">{T.koniecUmowyZKonta.zglos}</PrzyciskLink>
            </div>
          ) : null}
          {wzc.postac === 'przysluguje' && zc.wyczekiwanieZaDni ? (
            <p className="m-0 mt-4 text-body">
              {T.koniecZasilku.wyczekiwanie({ od: formatujDate(zc.wyczekiwanieZaDni.od), koniec: formatujDate(zc.wyczekiwanieZaDni.do) })}
            </p>
          ) : null}
          {wzc.postac === 'przysluguje' && wzc.do && s.liczbaEzla > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              <p className="m-0 text-body">
                {zc.macierzynskiZaDni
                  ? T.koniecZasilku.macierzynskiOdPorodu({ od: formatujDate(zc.macierzynskiZaDni.od), koniec: formatujDate(zc.macierzynskiZaDni.do) })
                  : `${T.koniecZasilku.doKoncaNiezdolnosci({ data: formatujDate(wzc.do) })} ${T.koniecZasilku.porodWNiezdolnosci}`}
              </p>
              {podzial.some((p) => p.rodzaj === 'zasilek-po-ustaniu') && s.zwzm.wynik.postac === 'przysluguje' ? (
                <Komunikat kod="0266" className="w-full" />
              ) : null}
              <Komunikat kod="0279" className="w-full" />
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
              {oz.poDzis > 0 ? (
                <p className="m-0 mt-2 text-body">
                  {T.okresZasilkowy.poDzis({ liczba: String(oz.poDzis), data: formatujDate(kontekst.dzis) })}
                </p>
              ) : null}
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
            sprawaBrakuUbezpieczeniaWPlanie ? (
              <div className="mt-4">
                <Odnosnik href={linkSprawy(sprawaBrakuUbezpieczeniaWPlanie)}>{T.akcje[sprawaBrakuUbezpieczenia(s)]}</Odnosnik>
              </div>
            ) : null
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
              {s.rehabilitacyjne.stawkaCiazyDo && s.rehabilitacyjne.wynik.postac === 'przysluguje' ? (
                <p className="m-0 mt-4 text-body">{T.stawkaRehabilitacyjnegoDo({ data: formatujDate(s.rehabilitacyjne.stawkaCiazyDo) })}</p>
              ) : null}
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
            {zwzmDlaPracownicy && s.zwzm.wynik.postac === 'warunek' && kontekst.rodzina.daneRodziny.matka.zmianaZatrudnienia?.rodzaj.wartosc !== 'ustanie' ? ` ${T.zwzm.bezZmian}` : null}
          </p>
          {zwzmDlaPracownicy && s.zwzm.macierzynskiPoUstaniu ? (
            <div className="mt-4 flex flex-col items-start gap-3 rounded-sm bg-surface-page px-4 py-3">
              <p className="m-0 text-body">
                {s.zwzm.macierzynskiPoUstaniu === 'naruszenie-z-wyrokiem' ? T.zwzm.naruszenie : T.zwzm.przedluzenie}
              </p>
              {sprawaK08 ? (
                <PrzyciskLink href={linkSprawy(sprawaK08)} wariant="drugorzedny">{T.akcje.K08}</PrzyciskLink>
              ) : null}
            </div>
          ) : null}
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

        <KartaRyzyk kontekst={kontekst} s={s} />
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
