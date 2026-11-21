// Krok planu `statusyZus` i wypłaty przy sprawie (kontrakt, sekcja 7.2; ANALIZY/15 R1–R7). Właściciel: u14.
// Wniosek złożony w ZUS nadaje status sprawie planu: złożony i w trakcie rozpatrywania → złożona,
// przyznanie → załatwiona, odmowa → do zrobienia z oznaczeniem odmowa. Status z danych ZUS zastępuje
// status oznaczony przez rodzica; sprawa bez wniosku w danych ZUS zachowuje swój status.
import { porownajDaty } from '@/domena/daty';
import { nowaSprawaZKatalogu } from '@/domena/plan/kroki/okres-zasilkowy-ezla';
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import type {
  DaneDrugiegoRodzicaZKonta,
  DaneZKontaZus,
  DataISO,
  IdPozycji,
  IdSprawy,
  PlanRodziny,
  PozycjaPlanu,
  RodzajWnioskuZus,
  StatusSprawy,
  StatusWnioskuZus,
  SwiadczenieRodzinneZus,
  WniosekZus,
  ZasilekWyplacony,
} from '@/domena/typy';

/** Sprawa planu, do której trafia wniosek danego rodzaju (R1). Dobry Start 300+ nie ma sprawy w katalogu. */
export const SPRAWA_WNIOSKU_ZUS: Readonly<Partial<Record<RodzajWnioskuZus, IdPozycji>>> = {
  'swiadczenie-800-plus': 'K12',
  '800-plus-kolejny-okres': 'K13',
  'aktywny-rodzic': 'K18',
  'zasilek-macierzynski': 'K08',
};

/** Status sprawy wynikający ze statusu wniosku w ZUS (R2). */
export function statusSprawyZWniosku(status: StatusWnioskuZus): StatusSprawy {
  if (status === 'przyznanie') return 'zalatwiona';
  if (status === 'odmowa') return 'do-zrobienia';
  return 'zlozona';
}

function czyKopiaZus(d: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null): d is DaneZKontaZus {
  return d !== null && 'wnioski' in d;
}

/** Najpóźniej złożony wniosek danego rodzaju z kopii Danych z konta ZUS. */
function najnowszyWniosek(wnioski: readonly WniosekZus[], rodzaj: RodzajWnioskuZus): WniosekZus | null {
  return (
    [...wnioski]
      .filter((x) => x.rodzaj === rodzaj)
      .sort((a, b) => porownajDaty(b.dataZlozenia, a.dataZlozenia))[0] ?? null
  );
}

/** Wniosek w ZUS powiązany ze sprawą planu: z kopii konta, a dla sprawy drugiego rodzica z jego kopii. */
export function wniosekZusSprawy(
  sprawa: Pick<PozycjaPlanu, 'idSprawy' | 'idPozycji' | 'idWnioskuZus'>,
  kopia: DaneZKontaZus | null,
): WniosekZus | null {
  if (!kopia) return null;
  if (sprawa.idWnioskuZus) {
    const powiazany = kopia.wnioski.find((x) => x.idWniosku === sprawa.idWnioskuZus);
    if (powiazany) return powiazany;
  }
  const rodzaj = (Object.keys(SPRAWA_WNIOSKU_ZUS) as RodzajWnioskuZus[]).find(
    (r) => SPRAWA_WNIOSKU_ZUS[r] === (sprawa.idPozycji ?? sprawa.idSprawy),
  );
  return rodzaj ? najnowszyWniosek(kopia.wnioski, rodzaj) : null;
}

function zastosujWniosek(sprawa: PozycjaPlanu, wniosek: WniosekZus): PozycjaPlanu {
  const status = statusSprawyZWniosku(wniosek.status);
  const bezOdmowy = sprawa.oznaczenia.filter((o) => o !== 'odmowa-zus');
  return {
    ...sprawa,
    status,
    zrodloStatusu: 'dane-zus',
    dataOznaczenia: wniosek.dataZlozenia,
    idWnioskuZus: wniosek.idWniosku,
    oznaczenia: wniosek.status === 'odmowa' ? [...bezOdmowy, 'odmowa-zus'] : bezOdmowy,
  };
}

/** Indeks sprawy dla wniosku: sprawa rodzica, który złożył wniosek, albo pierwsza sprawa pozycji. */
function indeksSprawy(pozycje: readonly PozycjaPlanu[], idPozycji: IdPozycji, odDrugiegoRodzica: boolean): number {
  const kandydaci = pozycje
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => (p.idPozycji ?? p.idSprawy) === idPozycji || p.idSprawy === idPozycji);
  if (kandydaci.length === 0) return -1;
  const przyRodzicu = kandydaci.find(({ p }) =>
    odDrugiegoRodzica ? p.idSprawy.endsWith('-drugi-rodzic') || p.rodzic === 'drugi-rodzic' : !p.idSprawy.endsWith('-drugi-rodzic'),
  );
  return (przyRodzicu ?? kandydaci[0]).i;
}

export const statusyZus: KrokPlanu = (pozycje, w) => {
  let wynik = [...pozycje];
  const zrodla: { kopia: DaneZKontaZus; drugiRodzic: boolean }[] = [];
  if (czyKopiaZus(w.daneZusMatki)) zrodla.push({ kopia: w.daneZusMatki, drugiRodzic: false });
  if (czyKopiaZus(w.daneZusDrugiegoRodzica)) zrodla.push({ kopia: w.daneZusDrugiegoRodzica, drugiRodzic: true });

  for (const { kopia, drugiRodzic } of zrodla) {
    for (const rodzaj of Object.keys(SPRAWA_WNIOSKU_ZUS) as RodzajWnioskuZus[]) {
      const idPozycji = SPRAWA_WNIOSKU_ZUS[rodzaj];
      const wniosek = najnowszyWniosek(kopia.wnioski, rodzaj);
      if (!idPozycji || !wniosek) continue;
      const indeks = indeksSprawy(wynik, idPozycji, drugiRodzic);
      if (indeks < 0) continue;
      wynik[indeks] = zastosujWniosek(wynik[indeks], wniosek);
    }
  }

  // Po przyznaniu 800+ plan dostaje sprawę wniosku na kolejny okres świadczeniowy (wzór P15-02).
  const k12 = wynik.find((p) => p.idSprawy === 'K12');
  if (k12?.status === 'zalatwiona' && k12.zrodloStatusu === 'dane-zus' && !wynik.some((p) => p.idSprawy === 'K13')) {
    const poprzednia = w.poprzedniPlan?.pozycje.find((p) => p.idSprawy === 'K13');
    const k13 =
      poprzednia ??
      nowaSprawaZKatalogu(w.katalog, 'K13', { rodzaj: 'swiadczenie', etap: 'pieniadze-na-dziecko', rodzic: 'matka-albo-ojciec' }, k12.liczbaDzieci);
    wynik = [...wynik, { ...k13, oznaczenia: [...k13.oznaczenia.filter((o) => o !== 'nowa-w-planie'), 'nowa-w-planie'] }];
  }
  return wynik;
};

// --- Wypłaty przy sprawie ----------------------------------------------------------------------

export interface WyplatyPrzySprawie {
  wyplacone: ZasilekWyplacony[]; // od najpóźniejszej daty wypłaty
  planowane: SwiadczenieRodzinneZus[]; // od najbliższego terminu, nie wcześniej niż dziś
}

/** Rodzaj świadczenia rodzinnego wypłacanego przy sprawie (R3). */
const SWIADCZENIE_SPRAWY: Readonly<Partial<Record<IdPozycji, SwiadczenieRodzinneZus['rodzaj']>>> = {
  K12: '800-plus',
  K18: 'aktywny-rodzic',
};

export function wyplatyPrzySprawie(sprawa: PozycjaPlanu, kopia: DaneZKontaZus | null, dzis: DataISO): WyplatyPrzySprawie {
  if (!kopia) return { wyplacone: [], planowane: [] };
  const id = sprawa.idPozycji ?? sprawa.idSprawy;
  const rodzajSwiadczenia = SWIADCZENIE_SPRAWY[id];
  const planowane = rodzajSwiadczenia
    ? kopia.swiadczeniaRodzinne
        .filter((s) => s.rodzaj === rodzajSwiadczenia && s.planowanyTerminWyplaty >= dzis)
        .sort((a, b) => porownajDaty(a.planowanyTerminWyplaty, b.planowanyTerminWyplaty))
    : [];
  const wyplacone =
    id === 'K08'
      ? kopia.zasilki
          .filter((z) => z.rodzaj.toLowerCase().includes('macierzy'))
          .sort((a, b) => porownajDaty(b.dataWyplaty, a.dataWyplaty))
      : [];
  return { wyplacone, planowane };
}

// --- Zmiany statusów z danych ZUS (powiadomienie, R6) ------------------------------------------

export interface ZmianaStatusuZus {
  idSprawy: IdSprawy;
  status: StatusSprawy;
  odmowa: boolean;
}

/** Sprawy, których status zmienił się na podstawie danych ZUS między dwoma wyliczeniami planu. */
export function zmianyStatusowZus(poprzedni: PlanRodziny | null, nowy: PlanRodziny): ZmianaStatusuZus[] {
  if (!poprzedni) return [];
  const zmiany: ZmianaStatusuZus[] = [];
  for (const p of nowy.pozycje) {
    if (p.zrodloStatusu !== 'dane-zus') continue;
    const przed = poprzedni.pozycje.find((x) => x.idSprawy === p.idSprawy);
    const odmowa = p.oznaczenia.includes('odmowa-zus');
    const odmowaPrzed = przed?.oznaczenia.includes('odmowa-zus') ?? false;
    if (!przed || przed.status !== p.status || odmowa !== odmowaPrzed) {
      zmiany.push({ idSprawy: p.idSprawy, status: p.status, odmowa });
    }
  }
  return zmiany;
}
