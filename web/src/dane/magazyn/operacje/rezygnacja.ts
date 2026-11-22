// Rezygnacja matki z części urlopu i przejęcie urlopu przez ojca (kontrakt, sekcja 6.5). Właściciel: u34 (Rezygnacja matki i wniosek ojca o zasiłek).
// Szkic rezygnacji i wniosku ojca żyje we Wnioskach rodziny. Wysyłkę do pracodawcy prowadzi kreator
// wniosków o urlop (u32), a wniosek ZAM kreator wniosku o zasiłek macierzyński (u27).
import { formatujDate } from '@/domena/daty';
import { idZLosowych } from '@/domena/numery';
import type {
  DataISO,
  IdSprawy,
  IdWidoku,
  IdWniosku,
  KontekstOperacji,
  Okres,
  RodzajSytuacjiSzczegolnej,
  StanRodziny,
  Wniosek,
  WniosekOUrlop,
  WniosekZam,
  WynikOperacji,
} from '@/domena/typy';
import { terminWnioskuOjca, poczatekOchronyOjca } from '@/domena/wnioski/rezygnacja';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { nastepnyNumerPotwierdzenia } from '@/dane/magazyn/operacje/konto';
import { utworzPowiadomienie } from '@/dane/magazyn/operacje/powiadomienia';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { rozpocznijLubWznowZam } from '@/dane/magazyn/operacje/wnioski-zam';
import {
  czySymulacja,
  czyTrybDemonstracyjny,
  odczytajStanKonta,
  odczytajZalogowanego,
  osobyRodziny,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';
import { teksty } from '@/teksty';

/** Przyczyna i data zdarzenia przejęcia urlopu. */
export interface ParametryPrzejecia {
  przyczyna: 'rezygnacja' | RodzajSytuacjiSzczegolnej;
  dataZdarzenia?: DataISO;
}

interface Kontekst {
  rodzina: StanRodziny;
  pesel: string;
  rola: WniosekOUrlop['rola'];
}

function kontekstZalogowanego(): Kontekst | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const rodzina = rodzinaKonta(zalogowany.stanKonta.konto);
  if (rodzina === null) return null;
  return { rodzina, pesel: zalogowany.stanKonta.konto.pesel, rola: zalogowany.stanKonta.konto.rola };
}

function nowyWniosek(
  k: Kontekst,
  rodzaj: 'rezygnacja-z-czesci-zasilku' | 'wniosek-ojca-o-urlop',
  idSprawy: IdSprawy,
  ctx: KontekstOperacji,
): WniosekOUrlop {
  return {
    idWniosku: idZLosowych('W', ctx.teraz, losowyCiag(6)),
    rodzaj,
    podrodzaj: rodzaj === 'rezygnacja-z-czesci-zasilku' ? 'rezygnacja-matki' : 'pozostala-czesc-macierzynskiego',
    idSprawy,
    konto: k.pesel,
    rola: k.rola,
    stan: 'szkic',
    utworzono: ctx.teraz,
    zaktualizowano: ctx.teraz,
    adresat: 'pracodawca',
    zalaczniki: [],
    okresy: [],
    oswiadczenia: {},
  };
}

function rozpocznij(
  rodzaj: 'rezygnacja-z-czesci-zasilku' | 'wniosek-ojca-o-urlop',
  idSprawy: IdSprawy,
  uzupelnij: (w: WniosekOUrlop) => WniosekOUrlop,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekOUrlop> {
  const k = kontekstZalogowanego();
  if (k === null) return { ok: false, kod: '0003' };
  const istniejacy = k.rodzina.wnioski.find(
    (w): w is WniosekOUrlop => w.rodzaj === rodzaj && w.konto === k.pesel && w.stan === 'szkic',
  );
  if (istniejacy) return { ok: true, wartosc: istniejacy };
  const wniosek = uzupelnij(nowyWniosek(k, rodzaj, idSprawy, ctx));
  return wykonajOperacjeZWynikiem(() => {
    zmienStanRodziny(k.rodzina.idRodziny, (s) => ({ ...s, wnioski: [...s.wnioski, wniosek] }));
    return { ok: true, wartosc: wniosek };
  });
}

/** Tworzy albo wznawia szkic rezygnacji matki z dalszej części urlopu macierzyńskiego. */
export function rozpocznijRezygnacje(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji<WniosekOUrlop> {
  return rozpocznij('rezygnacja-z-czesci-zasilku', idSprawy, (w) => w, ctx);
}

/** Tworzy albo wznawia szkic wniosku ojca do pracodawcy o pozostałą część urlopu macierzyńskiego. */
export function rozpocznijPrzejecie(
  idSprawy: IdSprawy,
  parametry: ParametryPrzejecia,
  ctx: KontekstOperacji,
): WynikOperacji<Wniosek> {
  return rozpocznij(
    'wniosek-ojca-o-urlop',
    idSprawy,
    (w) => ({
      ...w,
      wniosekOjca: {
        przyczyna: parametry.przyczyna,
        dniPrzedPorodem: 0,
        ...(parametry.dataZdarzenia ? { dataZdarzenia: parametry.dataZdarzenia } : {}),
      },
    }),
    ctx,
  );
}

/** Zapis odpowiedzi z ekranu rezygnacji albo przejęcia i ostatniego ekranu. */
export function zapiszKrok(
  id: IdWniosku,
  zmiana: Partial<WniosekOUrlop> | Partial<WniosekZam>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<Wniosek> {
  const k = kontekstZalogowanego();
  if (k === null) return { ok: false, kod: '0003' };
  const obecny = k.rodzina.wnioski.find((w) => w.idWniosku === id);
  if (!obecny) return { ok: false, kod: '0003' };
  const nowy = { ...obecny, ...zmiana, idWniosku: obecny.idWniosku, rodzaj: obecny.rodzaj, ostatniEkran: ekran, zaktualizowano: ctx.teraz } as Wniosek;
  const wynik = wykonajOperacjeZWynikiem<Wniosek>(() => {
    zmienStanRodziny(k.rodzina.idRodziny, (s) => ({
      ...s,
      wnioski: s.wnioski.map((w) => (w.idWniosku === id ? nowy : w)),
    }));
    return { ok: true, wartosc: nowy };
  });
  if (wynik.ok) przeliczRodzine(k.rodzina.idRodziny, ctx);
  return wynik;
}

/**
 * Wniosek ZAM matki wyłącznie o 14 tygodni: szkic kreatora ZAM (u27) z okresem od dnia porodu do ostatniego
 * dnia 14. tygodnia i zasiłkiem 100% podstawy wymiaru. Wynik wskazuje wniosek do otwarcia na ViewZamPeriod.
 */
export function rozpocznijZamZa14Tygodni(
  idSprawy: IdSprawy,
  okres: Okres,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekZam> {
  const start = rozpocznijLubWznowZam(idSprawy, ctx);
  if (!start.ok) return start;
  const zmiana: Partial<WniosekZam> = {
    rodzajUrlopu: 'macierzynski',
    wariant: 'tylko-macierzynski',
    okresy: [{ rodzajUrlopu: 'macierzynski', od: okres.od, do: okres.do, tygodnie: 14, stawka: 100 }],
  };
  const zapis = zapiszKrok(start.wartosc.idWniosku, zmiana, 'ViewZamPeriod', ctx);
  if (!zapis.ok) return zapis;
  return { ok: true, wartosc: zapis.wartosc as WniosekZam };
}

/** Dane rezygnacji matki z dalszej części zasiłku macierzyńskiego przy umowie zlecenia i działalności. */
export interface RezygnacjaZZasilku {
  idSprawy: IdSprawy;
  dataRezygnacji: DataISO;
  koniecZasilku: DataISO;
  zOrzeczeniem: boolean;
  /** Imię i nazwisko ojca dziecka z oświadczenia, od kiedy przejmie zasiłek. */
  ojciec: string;
}

/**
 * Rezygnacja matki z dalszej części zasiłku macierzyńskiego zapisana we Wnioskach rodziny z okresem, który przejmie
 * ojciec dziecka. Adresat ZUS: wniosek ZAS-23 wysłany w symulowanym eZUS z numerem ZAS23-DEMO (0337, awaria kanału
 * 0044). Adresat płatnik składek: wniosek przygotowany do wydruku dla zleceniodawcy (0339). Wysłana rezygnacja
 * podpowiada ojcu dziecka datę początku zasiłku we wniosku ZAM o przejęcie (proponujPrzejecie).
 */
export function zapiszRezygnacjeZZasilku(
  dane: RezygnacjaZZasilku,
  adresat: 'zus' | 'platnik-skladek',
  ctx: KontekstOperacji,
): WynikOperacji<WniosekOUrlop> {
  const k = kontekstZalogowanego();
  if (k === null) return { ok: false, kod: '0003' };
  // Kanał wniosków eZUS: prototyp wysyła wyłącznie w trybie demonstracyjnym; poza nim kanał jest niedostępny.
  if (adresat === 'zus' && (!czyTrybDemonstracyjny() || czySymulacja('wysylkaDoZusNiedostepna'))) return { ok: false, kod: '0044' };
  const wniosek: WniosekOUrlop = {
    ...nowyWniosek(k, 'rezygnacja-z-czesci-zasilku', dane.idSprawy, ctx),
    stan: adresat === 'zus' ? 'wyslany' : 'przygotowany',
    adresat,
    ...(adresat === 'zus'
      ? { dataZlozenia: ctx.dzis, potwierdzenie: nastepnyNumerPotwierdzenia('ZAS23-DEMO', ctx.dzis) }
      : { dataPrzygotowania: ctx.dzis }),
    okresy: [{ rodzajUrlopu: 'przejety-macierzynski', od: dane.dataRezygnacji, do: dane.koniecZasilku, rodzic: 'drugi-rodzic' }],
    rezygnacja: { dataPowrotu: dane.dataRezygnacji, zOrzeczeniem: dane.zOrzeczeniem, ojciec: dane.ojciec.trim() },
    zalaczniki: [
      {
        id: 'oswiadczenie-ojca',
        rodzaj: 'oswiadczenie-ojca-o-przejeciu-zasilku',
        opis: teksty.ViewEzusZas23.oswiadczenieOjcaZalacznik({ imieINazwisko: dane.ojciec.trim() }),
        wymagany: true,
      },
    ],
    ostatniEkran: adresat === 'zus' ? 'ViewEzusZas23' : 'ViewMaternityResignation',
  };
  const wynik = wykonajOperacjeZWynikiem<WniosekOUrlop>(() => {
    zmienStanRodziny(k.rodzina.idRodziny, (s) => ({
      ...s,
      // Nowa rezygnacja zastępuje szkic i wcześniej przygotowany wniosek konta o tym samym adresacie.
      wnioski: [
        ...s.wnioski.filter(
          (w) =>
            !(
              w.rodzaj === 'rezygnacja-z-czesci-zasilku' &&
              w.konto === k.pesel &&
              (w.stan === 'szkic' || (w.stan === 'przygotowany' && w.adresat === adresat))
            ),
        ),
        wniosek,
      ],
    }));
    return { ok: true, wartosc: wniosek };
  });
  if (wynik.ok) przeliczRodzine(k.rodzina.idRodziny, ctx);
  return wynik;
}

/**
 * Skutki wysłania rezygnacji albo wniosku ojca do pracodawcy, wywoływane przez wysyłkę kreatora wniosków
 * o urlop (u32) po zapisaniu wysyłki. Rezygnacja: powiadomienie konta Drugi rodzic „Możliwość przejęcia
 * części urlopu macierzyńskiego”. Wniosek ojca: data początku szczególnej ochrony.
 */
export function poWyslaniuDoPracodawcy(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  const k = kontekstZalogowanego();
  if (k === null) return { ok: true, wartosc: undefined };
  const wniosek = k.rodzina.wnioski.find((w): w is WniosekOUrlop => w.idWniosku === id && 'okresy' in w);
  if (!wniosek) return { ok: true, wartosc: undefined };

  if (wniosek.rodzaj === 'wniosek-ojca-o-urlop') {
    const poczatek = wniosek.okresy[0]?.od;
    if (!poczatek) return { ok: true, wartosc: undefined };
    const ochrona = poczatekOchronyOjca(wniosek.dataZlozenia ?? ctx.dzis, poczatek);
    return wykonajOperacjeZWynikiem(() => {
      zmienStanRodziny(k.rodzina.idRodziny, (s) => ({
        ...s,
        wnioski: s.wnioski.map((w) => (w.idWniosku === id ? { ...w, dataPoczatkuOchrony: ochrona } : w)),
      }));
      return { ok: true, wartosc: undefined };
    });
  }

  if (wniosek.rodzaj !== 'rezygnacja-z-czesci-zasilku') return { ok: true, wartosc: undefined };
  const powrot = wniosek.rezygnacja?.dataPowrotu;
  const koniec = wniosek.okresy[0]?.do;
  const peselDrugiego = osobyRodziny(k.rodzina.daneRodziny).peselDrugiegoRodzica;
  if (!powrot || !koniec || !peselDrugiego || peselDrugiego === k.pesel) return { ok: true, wartosc: undefined };

  const stanDrugiego = odczytajStanKonta(peselDrugiego);
  const ustawienia = stanDrugiego?.ustawienia ?? null;
  const t = teksty.PowiadomieniaPrzejecieUrlopu;
  const imieMatki = odczytajZalogowanego()?.stanKonta.konto.imie ?? '';
  const wynik = utworzPowiadomienie(
    {
      elementTworzacy: 'kreatory-wnioskow',
      rodzaj: 'mozliwosc-przejecia-urlopu',
      idRodziny: k.rodzina.idRodziny,
      idSprawy: 'K10',
      kontoDocelowe: peselDrugiego,
      planowanaWysylka: ctx.teraz,
      kanal: ustawienia?.kanalSms && !ustawienia.kanalEmail ? 'sms' : 'email',
      adresat: ustawienia?.adresEmail ?? stanDrugiego?.kopiaDanychZus?.emailEzus ?? '',
      temat: t.temat,
      tresc: t.tresc({
        imieMatki,
        dataPowrotu: formatujDate(powrot),
        dataPoczatku: formatujDate(powrot),
        dataKonca: formatujDate(koniec),
        terminZlozeniaWniosku: formatujDate(terminWnioskuOjca(powrot)),
      }),
    },
    ctx,
  );
  return wynik.ok ? { ok: true, wartosc: undefined } : wynik;
}
