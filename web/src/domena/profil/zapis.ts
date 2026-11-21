// Zapis Profilu rodziny ze szkicu (kontrakt, sekcja 7.2). Właściciel: u11 (Profil na start: drugi rodzic, podsumowanie i zapis).
// Reguły R15 (drugi rodzic), R16 (zapis profilu z filtrem zgody) i R17 (zmiana profilu po zapisie) z analizy 3.3.1.
// Funkcje są czyste: czas, PESEL i zgodę dostają od wywołującego.
import { dataZeZnacznika } from '@/domena/daty';
import type {
  BledyPol,
  DaneCiazyIDziecka,
  DaneRodzica,
  DaneRodziny,
  DrugiRodzic,
  FormaZatrudnieniaDrugiegoRodzica,
  IdRodziny,
  Pesel,
  SytuacjaRodzica,
  SzkicProfilu,
  ZnacznikCzasu,
} from '@/domena/typy';

// --- Drugi rodzic (R15) ------------------------------------------------------------------------

/** Formy zatrudnienia drugiego rodzica w kolejności ze wzoru ViewProfileSecondParent. */
export const FORMY_DRUGIEGO_RODZICA: readonly FormaZatrudnieniaDrugiegoRodzica[] = [
  'umowa-o-prace',
  'umowa-zlecenia',
  'jdg',
  'brak-tytulu',
  'brak-drugiego-rodzica',
];

/** Pola formularza ViewProfileSecondParent. */
export interface FormularzDrugiegoRodzica {
  forma: FormaZatrudnieniaDrugiegoRodzica | null;
  /** Opłacanie dobrowolnego ubezpieczenia chorobowego; dotyczy umowy zlecenia i jednoosobowej działalności. */
  dobrowolne: boolean | null;
}

export type PoleDrugiegoRodzica = keyof FormularzDrugiegoRodzica;

/** O dobrowolne ubezpieczenie chorobowe system pyta wyłącznie przy umowie zlecenia i jednoosobowej działalności. */
export function czyPytacODobrowolne(forma: FormaZatrudnieniaDrugiegoRodzica | null | undefined): boolean {
  return forma === 'umowa-zlecenia' || forma === 'jdg';
}

/** Błędy danych drugiego rodzica: 0006 przy pustej formie i przy braku odpowiedzi o dobrowolnym ubezpieczeniu. */
export function walidujDrugiegoRodzica(f: FormularzDrugiegoRodzica): BledyPol<PoleDrugiegoRodzica> {
  const bledy: BledyPol<PoleDrugiegoRodzica> = {};
  if (f.forma === null) {
    bledy.forma = '0006';
    return bledy;
  }
  if (czyPytacODobrowolne(f.forma) && f.dobrowolne === null) bledy.dobrowolne = '0006';
  return bledy;
}

/** Formularz z danych drugiego rodzica zapisanych w szkicu albo w profilu. */
export function formularzDrugiegoRodzica(dr: Partial<DrugiRodzic> | null | undefined): FormularzDrugiegoRodzica {
  const forma = dr?.formaZatrudnienia?.wartosc ?? null;
  return {
    forma,
    dobrowolne: czyPytacODobrowolne(forma) ? (dr?.dobrowolneChorobowe?.wartosc ?? null) : null,
  };
}

/** Dane drugiego rodzica bez odpowiedzi rodzica, punkt wyjścia zapisu. */
export function drugiRodzicPusty(): DrugiRodzic {
  return { formaZatrudnienia: null, dobrowolneChorobowe: null, platnikZasilku: null, potwierdzeniaSkladek: [] };
}

/**
 * Dane drugiego rodzica z poprawnego formularza ze źródłem odpowiedź rodzica. Zachowuje pozostałe dane
 * drugiego rodzica (osoba, dane z konta ZUS), a dobrowolne ubezpieczenie zapisuje tylko przy UZ i JDG.
 */
export function drugiRodzicZFormularza(
  f: FormularzDrugiegoRodzica,
  poprzedni: Partial<DrugiRodzic> | null | undefined,
): DrugiRodzic {
  const baza: DrugiRodzic = { ...drugiRodzicPusty(), ...(poprzedni ?? {}) };
  const forma = f.forma;
  if (forma === null) return { ...baza, formaZatrudnienia: null, dobrowolneChorobowe: null };
  const pytaj = czyPytacODobrowolne(forma);
  const zmianaFormy = baza.formaZatrudnienia?.wartosc !== forma;
  return {
    ...baza,
    formaZatrudnienia: { wartosc: forma, zrodlo: 'odpowiedz-rodzica' },
    dobrowolneChorobowe: pytaj && f.dobrowolne !== null ? { wartosc: f.dobrowolne, zrodlo: 'odpowiedz-rodzica' } : null,
    // Płatnik zasiłku drugiego rodzica zależy od formy, więc zmiana formy go unieważnia.
    platnikZasilku: zmianaFormy ? null : baza.platnikZasilku,
  };
}

// --- Zapis profilu (R16) -----------------------------------------------------------------------

/** Sytuacje wskazujące ciążę albo poród, zapisywane wyłącznie przy zgodzie na dane dotyczące zdrowia. */
const SYTUACJE_ZDROWOTNE: readonly SytuacjaRodzica[] = ['oczekiwanie', 'narodziny'];

function matkaPusta(): DaneRodzica {
  return { formaZatrudnienia: null, dobrowolneChorobowe: null, platnikZasilku: null, potwierdzeniaSkladek: [] };
}

/** Dane ciąży i dziecka z pustymi listami, punkt wyjścia zapisu przy zgodzie. */
export function daneCiazyPuste(): DaneCiazyIDziecka {
  return {
    dataPoroduPotwierdzona: false,
    dzieci: [],
    sytuacjeSzczegolne: [],
    spokojnyTryb: { wlaczony: false },
  };
}

/**
 * Dane rodziny i Dane ciąży i dziecka zbudowane ze szkicu z filtrem zgody. Bez zgody na dane dotyczące
 * zdrowia system pomija Dane ciąży i dziecka oraz sytuacje „spodziewam się dziecka” i „dziecko już się
 * urodziło”. Konto zapisujące dostaje aktywny dostęp z rolą Rodzic.
 */
export function zbudujProfilZeSzkicu(
  szkic: SzkicProfilu,
  zgoda: boolean,
  idRodziny: IdRodziny,
  pesel: Pesel,
  teraz: ZnacznikCzasu,
): { daneRodziny: DaneRodziny; daneCiazy: DaneCiazyIDziecka | null } {
  const d = szkic.daneRodziny;
  const sytuacja = d.sytuacja ?? null;
  const sytuacjaPoFiltrze =
    sytuacja !== null && !zgoda && SYTUACJE_ZDROWOTNE.includes(sytuacja.wartosc) ? null : sytuacja;
  const stanCywilny = d.stanCywilny ?? null;

  const daneRodziny: DaneRodziny = {
    idRodziny,
    sytuacja: sytuacjaPoFiltrze,
    rodzicKonta: d.rodzicKonta ?? 'matka',
    matka: { ...matkaPusta(), ...(d.matka ?? {}) },
    drugiRodzic: { ...drugiRodzicPusty(), ...(d.drugiRodzic ?? {}) },
    stanCywilny,
    gmina: d.gmina ?? null,
    dochodNaOsobe: d.dochodNaOsobe ?? null,
    dostepKont: [{ pesel, rola: 'rodzic', dolaczono: dataZeZnacznika(teraz), stan: 'aktywny' }],
    zapisano: teraz,
  };
  if (stanCywilny?.wartosc === 'nie-malzenstwo' && d.uznanieOjcostwa) daneRodziny.uznanieOjcostwa = d.uznanieOjcostwa;

  const daneCiazy: DaneCiazyIDziecka | null = zgoda ? { ...daneCiazyPuste(), ...szkic.daneCiazy } : null;
  return { daneRodziny, daneCiazy };
}

// --- Zmiana profilu (R17) ----------------------------------------------------------------------

function czyObiekt(w: unknown): w is Record<string, unknown> {
  return w !== null && typeof w === 'object' && !Array.isArray(w);
}

/** Dana ze źródłem jest jedną wartością profilu, więc porównanie nie schodzi głębiej. */
function czyDanaZeZrodla(w: unknown): boolean {
  return czyObiekt(w) && 'wartosc' in w && 'zrodlo' in w;
}

function rowne(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function zbierzZmiany(przed: unknown, po: unknown, sciezka: string, wynik: string[]): void {
  const zagniezdzone =
    czyObiekt(przed) && czyObiekt(po) && !czyDanaZeZrodla(przed) && !czyDanaZeZrodla(po);
  if (!zagniezdzone) {
    if (!rowne(przed ?? null, po ?? null)) wynik.push(sciezka);
    return;
  }
  const klucze = new Set([...Object.keys(przed), ...Object.keys(po)]);
  for (const klucz of [...klucze].sort()) {
    zbierzZmiany(przed[klucz], po[klucz], sciezka ? `${sciezka}.${klucz}` : klucz, wynik);
  }
}

/**
 * Ścieżki pól, które różnią się między `przed` a `po`, np. `daneCiazy.przewidywanyTerminPorodu`.
 * Dana ze źródłem i lista to jedno pole; brak pola i wartość null są równe.
 */
export function zmienionePola(przed: object, po: object): string[] {
  const wynik: string[] = [];
  zbierzZmiany(przed, po, '', wynik);
  return wynik;
}

/** Wartość pola profilu pod ścieżką z `zmienionePola`. */
export function wartoscPola(zrodlo: object | null | undefined, sciezka: string): unknown {
  let biezacy: unknown = zrodlo;
  for (const klucz of sciezka.split('.')) {
    if (!czyObiekt(biezacy)) return undefined;
    biezacy = biezacy[klucz];
  }
  return biezacy;
}

/** Profil w układzie szkicu do porównania zapisanego profilu ze szkicem zmiany. */
export function profilJakoSzkic(
  daneRodziny: DaneRodziny,
  daneCiazy: DaneCiazyIDziecka | null,
): Pick<SzkicProfilu, 'daneRodziny' | 'daneCiazy'> {
  const { idRodziny, dostepKont, zaproszenie, zapisano, ...pola } = daneRodziny;
  void idRodziny;
  void dostepKont;
  void zaproszenie;
  void zapisano;
  return { daneRodziny: pola, daneCiazy: daneCiazy ?? {} };
}

/**
 * Dane rodziny po zmianie profilu: pola profilu ze szkicu zastępują zapisane, a dostęp kont,
 * zaproszenie i dane osób spoza odpowiedzi rodzica zostają.
 */
export function zastosujZmianeProfilu(
  zapisane: { daneRodziny: DaneRodziny; daneCiazy: DaneCiazyIDziecka | null },
  szkic: SzkicProfilu,
  zgoda: boolean,
  teraz: ZnacznikCzasu,
): { daneRodziny: DaneRodziny; daneCiazy: DaneCiazyIDziecka | null } {
  const zapisaneRodziny = zapisane.daneRodziny;
  const zbudowane = zbudujProfilZeSzkicu(szkic, zgoda, zapisaneRodziny.idRodziny, zapisaneRodziny.idRodziny, teraz);
  const daneRodziny: DaneRodziny = {
    ...zbudowane.daneRodziny,
    rodzicKonta: szkic.daneRodziny.rodzicKonta ?? zapisaneRodziny.rodzicKonta,
    matka: { ...zapisaneRodziny.matka, ...(szkic.daneRodziny.matka ?? {}) },
    drugiRodzic: { ...zapisaneRodziny.drugiRodzic, ...(szkic.daneRodziny.drugiRodzic ?? {}) },
    dostepKont: zapisaneRodziny.dostepKont,
    ...(zapisaneRodziny.zaproszenie ? { zaproszenie: zapisaneRodziny.zaproszenie } : {}),
  };
  const daneCiazy = zgoda
    ? { ...daneCiazyPuste(), ...(zapisane.daneCiazy ?? {}), ...szkic.daneCiazy }
    : zapisane.daneCiazy;
  return { daneRodziny, daneCiazy };
}
