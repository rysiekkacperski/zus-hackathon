// Kontekst asystenta AI wysyłany do API (kontrakt, sekcje 7.2 i 10.2). Właściciel: u31 (Asystent AI).
// Rodzic i Drugi rodzic: profil rodziny, plan, terminy, wnioski, wyniki kalkulacji rodziny, Dane z konta ZUS
// i Katalog świadczeń. Nowy użytkownik: wyłącznie Katalog świadczeń, Dane z konta ZUS i Wyniki kalkulacji konta.
// Dane ciąży i dziecka trafiają do kontekstu tylko przy udzielonej zgodzie.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import type {
  NajblizszyTerminWKontekscie,
  SzczegolyKontekstuAsystenta,
  WariantyZasilkuWKontekscie,
} from '@/domena/asystent/rozszerzenia-typow';
import { formatujDate, porownajDaty } from '@/domena/daty';
import { wartoscObowiazujaca } from '@/domena/katalog/odczyt';
import { formatujKwote } from '@/domena/kwoty';
import { formaStraznika, oplacenieSkladekNaDzien } from '@/domena/plan/straznik';
import { tytulSprawyPlanu } from '@/domena/plan/tytul-sprawy';
import { najblizszeTerminy, tytulNajblizszegoTerminu, type WpisNajblizszegoTerminu } from '@/domena/terminy/najblizsze';
import type {
  DaneZKontaZus,
  DataISO,
  FormaZatrudnienia,
  IdSprawy,
  Katalog,
  KontekstAsystenta,
  KontoPrzewodnika,
  OkresScenariusza,
  ScenariuszKalkulatora,
  WpisSlownika,
  WynikiKalkulacji,
} from '@/domena/typy';

/** Dane konta bez rodziny (Nowy użytkownik albo Administrator). */
export interface KontekstKontaBezRodziny {
  konto: KontoPrzewodnika;
  katalog: Katalog;
  kopia: DaneZKontaZus | null;
  wyniki: WynikiKalkulacji;
}

function czyKontekstRodziny(k: KontekstRodziny | KontekstKontaBezRodziny): k is KontekstRodziny {
  return 'rodzina' in k;
}

// --- Katalog -------------------------------------------------------------------------------------

/** Wartość wariantu wpisu w dniu `dzien`: z odczytu katalogu, a bez niego z wersji wpisu. */
function wartoscWpisu(k: Katalog, wpis: WpisSlownika, dzien: DataISO): { wartosc: number; od: DataISO } | null {
  const wariant = wpis.warianty[0];
  if (wariant === undefined) return null;
  const odczytana = wartoscObowiazujaca(k, wpis.id, dzien, wariant.klucz);
  if (odczytana !== null) return { wartosc: odczytana.wartosc, od: odczytana.od };
  const wersja = wpis.wersje.find(
    (w) => porownajDaty(w.od, dzien) <= 0 && (w.do === undefined || porownajDaty(dzien, w.do) <= 0),
  );
  const wartosc = wersja?.wartosci[wariant.klucz];
  return wersja === undefined || wartosc === undefined ? null : { wartosc, od: wersja.od };
}

/** Wariant 'zl' w wersji wpisu przechowuje kwotę w groszach (kontrakt 1.3). */
function kwotaZl(wartosc: number): string {
  return formatujKwote(Math.round(wartosc));
}

function kwotaWpisu(k: Katalog, wzorzec: RegExp, dzien: DataISO): string | undefined {
  const wpis = k.slowniki.find((w) => w.slownik === 'kwoty-i-progi' && wzorzec.test(w.nazwa.toLowerCase()));
  if (wpis === undefined) return undefined;
  const wartosc = wartoscWpisu(k, wpis, dzien);
  return wartosc === null ? undefined : kwotaZl(wartosc.wartosc);
}

function kontekstKatalogu(k: Katalog, dzien: DataISO): KontekstAsystenta['katalog'] {
  const kwoty: KontekstAsystenta['katalog']['kwoty'] = [];
  for (const wpis of k.slowniki) {
    if (wpis.slownik !== 'kwoty-i-progi') continue;
    const wartosc = wartoscWpisu(k, wpis, dzien);
    if (wartosc === null) continue;
    const jednostka = wpis.warianty[0]?.jednostka;
    kwoty.push({
      nazwa: wpis.nazwa,
      wartosc: jednostka === 'zl' ? kwotaZl(wartosc.wartosc) : String(wartosc.wartosc).replace('.', ','),
      od: formatujDate(wartosc.od),
    });
  }
  return {
    kwoty,
    pozycje: k.pozycje.map((p) => ({ id: p.id, tytul: p.tytul, warunek: p.warunekOpis, kanal: p.instytucjaIKanal })),
  };
}

function kwotyKatalogu(k: Katalog, dzien: DataISO): SzczegolyKontekstuAsystenta['kwotyKatalogu'] {
  return {
    progBecikowego: kwotaWpisu(k, /prog.*becikow|próg.*becikow/, dzien),
    swiadczenieRodzicielskie: kwotaWpisu(k, /świadczenie rodzicielskie|swiadczenie rodzicielskie/, dzien),
    swiadczenieWychowawcze: kwotaWpisu(k, /800|wychowawcze/, dzien),
  };
}

// --- Dane z konta ZUS ----------------------------------------------------------------------------

/** Forma zatrudnienia i dobrowolne ubezpieczenie chorobowe z tytułów aktywnych w dniu `dzien`. */
export function formaZDanychZus(kopia: DaneZKontaZus, dzien: DataISO): { forma: FormaZatrudnienia; dobrowolneChorobowe: boolean } {
  const aktywne = kopia.tytuly.filter(
    (t) => porownajDaty(t.od, dzien) <= 0 && (t.do === undefined || porownajDaty(dzien, t.do) <= 0),
  );
  const pierwszenstwo: Record<string, FormaZatrudnienia> = {
    pracownik: 'umowa-o-prace',
    zleceniobiorca: 'umowa-zlecenia',
    dzialalnosc: 'jdg',
  };
  const tytul = aktywne.find((t) => t.rodzaj === 'pracownik') ?? aktywne.find((t) => t.rodzaj === 'zleceniobiorca') ?? aktywne[0];
  if (tytul === undefined) return { forma: 'brak-tytulu', dobrowolneChorobowe: false };
  const dobrowolne = aktywne.some((t) => {
    const ch = t.ubezpieczenieChorobowe;
    return (
      ch.rodzaj === 'dobrowolne' &&
      (ch.od === undefined || porownajDaty(ch.od, dzien) <= 0) &&
      (ch.do === undefined || porownajDaty(dzien, ch.do) <= 0)
    );
  });
  return { forma: pierwszenstwo[tytul.rodzaj] ?? 'brak-tytulu', dobrowolneChorobowe: dobrowolne };
}

// Zaświadczenia lekarskie e-ZLA zalogowanego ubezpieczonego trafiają do kontekstu wyłącznie przy udzielonej zgodzie
// na dane dotyczące zdrowia (R-AS-ZRODLA).
function kontekstDanychZus(kopia: DaneZKontaZus | null, zgoda = false): KontekstAsystenta['daneZus'] {
  if (kopia === null) return null;
  const tytuly = kopia.tytuly.map((t) => {
    const ch = t.ubezpieczenieChorobowe.rodzaj;
    return `${t.rodzaj} od ${formatujDate(t.od)}${t.do ? ` do ${formatujDate(t.do)}` : ''}, ubezpieczenie chorobowe: ${ch}`;
  });
  const podstawy = kopia.tytuly.flatMap((t) => t.podstawySkladek);
  const ostatnia = [...podstawy].sort((a, b) => a.miesiac.localeCompare(b.miesiac)).at(-1);
  const ezla = kopia.zaswiadczeniaEzla.at(-1);
  const stan = kopia.stanyRozliczen.at(-1);
  return {
    tytuly,
    podstawaOstatnia: ostatnia ? formatujKwote(ostatnia.kwota) : undefined,
    ezla: zgoda && ezla ? `${formatujDate(ezla.od)} do ${formatujDate(ezla.do)}` : undefined,
    stanRozliczen: stan ? formatujKwote(stan.kwotaZadluzenia) : undefined,
  };
}

// --- Wyniki kalkulacji ---------------------------------------------------------------------------

function tygodnie(okresy: readonly OkresScenariusza[]): number {
  return Math.round(okresy.reduce((suma, o) => suma + o.dni, 0) / 7);
}

function ostatniScenariusz(wyniki: WynikiKalkulacji, wariant: '81-5' | '100-70'): ScenariuszKalkulatora | undefined {
  const pasujace = wyniki.scenariusze.filter((s) => s.parametry.wariant === wariant && !s.przykladowaSprawa);
  return pasujace.find((s) => s.wybranyWPlanie) ?? [...pasujace].sort((a, b) => a.numer - b.numer).at(-1);
}

/** Kwoty wariantów zasiłku z Wyników kalkulacji (scenariusze kalkulatora i porównanie wariantów). */
export function wariantyZWynikow(wyniki: WynikiKalkulacji): WariantyZasilkuWKontekscie {
  const wynik: WariantyZasilkuWKontekscie = {};
  const s100 = ostatniScenariusz(wyniki, '100-70');
  if (s100) {
    const okresyMatki = s100.wynik.okresy.filter((o) => o.rodzic === 'matka');
    const macierzynski = okresyMatki.filter((o) => o.rodzaj === 'macierzynski' || o.rodzaj === 'czesc-przed-porodem');
    const rodzicielski = okresyMatki.filter((o) => o.rodzaj === 'rodzicielski');
    if (macierzynski.length > 0 && rodzicielski.length > 0) {
      wynik.wariant100i70 = {
        macierzynskiMiesiecznie: formatujKwote(macierzynski[macierzynski.length - 1].miesiecznie),
        tygodnieMacierzynskiego: tygodnie(macierzynski),
        rodzicielskiMiesiecznie: formatujKwote(rodzicielski[0].miesiecznie),
        tygodnieRodzicielskiego: tygodnie(rodzicielski),
        razem: formatujKwote(s100.wynik.sumy.matka ?? s100.wynik.sumy.razem),
      };
      wynik.suma100i70 = wynik.wariant100i70.razem;
    }
  }
  const s81 = ostatniScenariusz(wyniki, '81-5');
  if (s81) {
    const okresyMatki = s81.wynik.okresy.filter((o) => o.rodzic === 'matka' && (o.rodzaj === 'macierzynski' || o.rodzaj === 'rodzicielski' || o.rodzaj === 'czesc-przed-porodem'));
    if (okresyMatki.length > 0) {
      wynik.wariant81 = {
        miesiecznie: formatujKwote(okresyMatki[0].miesiecznie),
        tygodnie: tygodnie(okresyMatki),
        razem: formatujKwote(s81.wynik.sumy.matka ?? s81.wynik.sumy.razem),
      };
      wynik.suma81 = wynik.wariant81.razem;
    }
  }
  const porownanie = wyniki.porownaniaWariantow.at(-1);
  if (porownanie) {
    wynik.suma81 = formatujKwote(porownanie.wynik.wariant81.suma);
    wynik.suma100i70 = formatujKwote(porownanie.wynik.wariant100i70.suma);
    if (!wynik.wariant81 && porownanie.wynik.wariant81.miesiecznie[0] !== undefined) {
      wynik.wariant81 = {
        miesiecznie: formatujKwote(porownanie.wynik.wariant81.miesiecznie[0]),
        tygodnie: Math.round(porownanie.wynik.wariant81.miesiecznie.length * (52 / 12)),
        razem: wynik.suma81,
      };
    }
  }
  return wynik;
}

function kontekstWynikow(warianty: WariantyZasilkuWKontekscie): KontekstAsystenta['wyniki'] {
  const wyniki: KontekstAsystenta['wyniki'] = [];
  if (warianty.wariant100i70) {
    const w = warianty.wariant100i70;
    wyniki.push({ opis: 'wariant-100-70', kwoty: [w.macierzynskiMiesiecznie, w.rodzicielskiMiesiecznie, w.razem] });
  }
  if (warianty.wariant81) wyniki.push({ opis: 'wariant-81-5', kwoty: [warianty.wariant81.miesiecznie, warianty.wariant81.razem] });
  return wyniki;
}

// --- Najbliższe terminy --------------------------------------------------------------------------

/** Najwięcej najbliższych terminów w kontekście; odpowiedź pokazuje trzy, a pytanie o tydzień szuka też terminu po tygodniu. */
const LIMIT_TERMINOW_W_KONTEKSCIE = 10;

function terminWKontekscie(katalog: Katalog, w: WpisNajblizszegoTerminu): NajblizszyTerminWKontekscie {
  const wspolne = { rodzaj: w.rodzaj, data: w.data, tytul: tytulNajblizszegoTerminu(katalog, w) };
  switch (w.rodzaj) {
    case 'sprawa':
      return { ...wspolne, rodzic: w.sprawa.rodzic, idSprawy: w.sprawa.idSprawy, szacowany: w.szacowany };
    case 'oplacenie-skladek':
      return { ...wspolne, rodzic: w.sprawa?.rodzic ?? 'matka', ...(w.sprawa ? { idSprawy: w.sprawa.idSprawy } : {}) };
    case 'kolejne-oplacenie-skladek':
      return { ...wspolne, rodzic: 'matka', dzienUtworzenia: w.dzienUtworzenia };
    case 'przewidywany-termin-porodu':
      return wspolne;
  }
}

/**
 * Najbliższe terminy z karty Najbliższe terminy: terminy kalendarza otwartych spraw, Opłacenie składek strażnika
 * i przewidywany termin porodu. Przewidywany termin porodu trafia do kontekstu tylko przy udzielonej zgodzie.
 */
function kontekstNajblizszychTerminow(k: KontekstRodziny, zgoda: boolean, dzis: DataISO): NajblizszyTerminWKontekscie[] {
  const { rodzina, katalog } = k;
  const oplacenie = oplacenieSkladekNaDzien(formaStraznika(rodzina.daneRodziny, rodzina.daneCiazy), dzis);
  return najblizszeTerminy({
    plan: rodzina.plan,
    kalendarz: rodzina.kalendarz,
    daneCiazy: zgoda ? rodzina.daneCiazy : null,
    oplacenie,
    dzis,
  })
    .slice(0, LIMIT_TERMINOW_W_KONTEKSCIE)
    .map((w) => terminWKontekscie(katalog, w));
}

// --- Kontekst ------------------------------------------------------------------------------------

function imieINazwisko(o: { imie: string; nazwisko: string } | null | undefined): string | undefined {
  return o ? `${o.imie} ${o.nazwisko}` : undefined;
}

/** Kontekst z profilu, planu, wniosków, wyników i katalogu w dniu `dzis`. */
export function zbudujKontekstAsystenta(k: KontekstRodziny | KontekstKontaBezRodziny, dzis: DataISO): KontekstAsystenta {
  if (!czyKontekstRodziny(k)) {
    const warianty = wariantyZWynikow(k.wyniki);
    return {
      rola: k.konto.rola,
      dzis,
      zgoda: false,
      profil: null,
      sprawy: [],
      wnioski: [],
      wyniki: kontekstWynikow(warianty),
      daneZus: kontekstDanychZus(k.kopia),
      katalog: kontekstKatalogu(k.katalog, dzis),
      szczegoly: {
        dobrowolneChorobowe: {},
        dataPoroduPotwierdzona: false,
        imionaRodzicow: {},
        daneZusKonta: k.kopia ? formaZDanychZus(k.kopia, dzis) : undefined,
        warianty,
        kwotyKatalogu: kwotyKatalogu(k.katalog, dzis),
        pozycjeSpraw: {},
      },
    };
  }

  const { rodzina, katalog } = k;
  const dane = rodzina.daneRodziny;
  const zgoda = k.stanZgody === 'udzielona';
  const ciaza = zgoda ? rodzina.daneCiazy : null;
  const terminy = new Map((rodzina.kalendarz?.terminy ?? []).map((t) => [t.idSprawy, t]));
  const pozycjeSpraw: Record<IdSprawy, string> = {};
  const sprawy: KontekstAsystenta['sprawy'] = (rodzina.plan?.pozycje ?? []).map((p) => {
    const termin = terminy.get(p.idSprawy);
    pozycjeSpraw[p.idSprawy] = p.idPozycji ?? p.idSprawy;
    const wariant = p.wybranyWariant && 'wariant' in p.wybranyWariant ? p.wybranyWariant.wariant : undefined;
    return {
      idSprawy: p.idSprawy,
      tytul: tytulSprawyPlanu(katalog, p),
      etap: p.etap,
      rodzic: p.rodzic,
      status: p.status,
      termin: termin?.termin ?? undefined,
      dniDoTerminu: termin?.dniDoTerminu ?? undefined,
      koszt: termin?.koszt.rodzaj === 'kwota' ? formatujKwote(termin.koszt.kwota) : undefined,
      wynikPrawa: p.wynikUstaleniaPrawa?.postac,
      wariant: wariant === '81-5' ? '81,5%' : wariant === '100-70' ? '100% i 70%' : undefined,
    };
  });
  const dochod = dane.dochodNaOsobe?.wartosc;
  const liczbaDzieci = ciaza?.liczbaUrodzonychDzieci ?? ciaza?.liczbaDzieciZCiazy;
  const warianty = wariantyZWynikow(rodzina.wynikiKalkulacji);
  return {
    rola: k.rola,
    dzis,
    zgoda,
    profil: {
      formaMatki: dane.matka.formaZatrudnienia?.wartosc,
      formaDrugiegoRodzica: dane.drugiRodzic.formaZatrudnienia?.wartosc,
      platnikZasilku: dane.matka.platnikZasilku?.wartosc,
      dochodNaOsobe: dochod,
      przewidywanyTerminPorodu: ciaza?.przewidywanyTerminPorodu,
      dataPorodu: ciaza?.dataPorodu,
      liczbaDzieci: liczbaDzieci === undefined ? undefined : Number(liczbaDzieci),
    },
    sprawy,
    wnioski: rodzina.wnioski.map((w) => ({ rodzaj: w.rodzaj, stan: w.stan, dataZlozenia: w.dataZlozenia })),
    wyniki: kontekstWynikow(warianty),
    daneZus: kontekstDanychZus(k.daneZusKonta, zgoda),
    katalog: kontekstKatalogu(katalog, dzis),
    szczegoly: {
      dobrowolneChorobowe: {
        matka: dane.matka.dobrowolneChorobowe?.wartosc,
        drugiRodzic: dane.drugiRodzic.dobrowolneChorobowe?.wartosc,
      },
      dataPoroduPotwierdzona: ciaza?.dataPoroduPotwierdzona ?? false,
      imionaRodzicow: {
        matka: imieINazwiska(k.daneZusMatki) ?? (dane.rodzicKonta === 'matka' && k.rola === 'rodzic' ? imieINazwisko(k.konto) : undefined),
        drugiRodzic:
          dane.drugiRodzic.imie && dane.drugiRodzic.nazwisko
            ? `${dane.drugiRodzic.imie} ${dane.drugiRodzic.nazwisko}`
            : k.rola === 'drugi-rodzic'
              ? imieINazwisko(k.konto)
              : undefined,
      },
      daneZusKonta: k.daneZusKonta ? formaZDanychZus(k.daneZusKonta, dzis) : undefined,
      warianty,
      kwotyKatalogu: kwotyKatalogu(katalog, dzis),
      dochodNaOsobe: typeof dochod === 'number' ? formatujKwote(dochod) : undefined,
      pozycjeSpraw,
      najblizszeTerminy: kontekstNajblizszychTerminow(k, zgoda, dzis),
    },
  };
}

function imieINazwiska(kopia: DaneZKontaZus | null): string | undefined {
  return kopia ? `${kopia.imie} ${kopia.nazwisko}` : undefined;
}
