// Dokumenty przykładowej sprawy: wybór sprawy, wgranie i odczyt dokumentu, korekty (kontrakt, sekcja 6.5).
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Sprawa żyje w danych sesji (StanSesji.przykladowaSprawa) i znika z końcem sesji; pliki dokumentów żyją
// w IndexedDB najwyżej 24 godziny. Sprawa nie zmienia profilu rodziny, planu, terminów ani kopii danych ZUS.
import { dodajMinuty, porownajZnaczniki } from '@/domena/daty';
import { peselZastepczy } from '@/domena/przykladowe-sprawy/dane-zastepcze';
import { pusteDaneSprawy, scalOdczytZKomunikatami, zKorekta } from '@/domena/przykladowe-sprawy/scalanie';
import { walidujPlik } from '@/domena/walidacje';
import type {
  BladOdczytuDokumentu,
  DokumentSprawy,
  KodKomunikatu,
  KontekstOperacji,
  RozstrzygniecieSprawy,
  SprawaPrzykladowa,
  StanSesji,
  WartoscOdczytana,
  WynikOdczytuDokumentu,
  WynikOperacji,
} from '@/domena/typy';
import { sprawyWzorcowe } from '@/dane/przykladowe-sprawy/sprawy-wzorcowe';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { losowyCiag, losuj } from '@/dane/magazyn/losowanie';
import { usunPlik, zapiszPlik } from '@/dane/magazyn/pliki';
import { czyWymuszonyBladZapisu } from '@/dane/magazyn/rdzen';
import { odczytajParametry, odczytajSesje, odczytajStanSesji, wykonajOperacje, zmienStanSesji } from '@/dane/magazyn/stan';

/** Tryb wgrania: nowa sprawa albo dokument dodany do bieżącej sprawy. */
export type TrybWgraniaDokumentu = 'nowa' | 'dodaj';

/** Wynik udanego wgrania: komunikaty dla ekranu ViewSampleCaseData (0107, 0255, 0181, 0225). */
export interface WynikWgrania { komunikaty: KodKomunikatu[] }

const LIMIT_ODCZYTU_MS = 30_000;
const CZAS_PRZECHOWANIA_PLIKU_MINUTY = 24 * 60;

let zestawyZus: SprawaPrzykladowa[] = [];

/** Sprawy z zestawów ZUS pobrane przez ViewSampleCaseList z GET /api/przykladowe-sprawy/zestawy. */
export function zapamietajZestawyZus(sprawy: SprawaPrzykladowa[]): void {
  zestawyZus = sprawy;
}

/** Sprawy zespołu do wyboru: zestawy ZUS, potem sprawy wzorcowe S01–S11. */
export function sprawyZespolu(): SprawaPrzykladowa[] {
  return [...zestawyZus, ...sprawyWzorcowe];
}

function usunPlikiSprawy(sprawa: SprawaPrzykladowa | undefined): void {
  for (const dokument of sprawa?.dokumenty ?? []) {
    if (dokument.idPliku && dokument.usunietoPlik === undefined) void usunPlik(dokument.idPliku);
  }
}

function zapiszSprawe(idSesji: string, zmiana: Partial<StanSesji>): void {
  zmienStanSesji(idSesji, (stan) => ({ ...stan, ...zmiana }));
}

/** Sprawa z zestawu ZUS albo sprawa wzorcowa jako bieżąca przykładowa sprawa sesji. */
export function wybierzSpraweZespolu(id: string, ctx: KontekstOperacji): WynikOperacji {
  const sesja = odczytajSesje();
  const wzor = sprawyZespolu().find((s) => s.idSprawy === id);
  if (sesja === null || wzor === undefined) return { ok: false, kod: '0003' };
  if (czyWymuszonyBladZapisu()) return { ok: false, kod: '0003' };
  const poprzednia = odczytajStanSesji(sesja.idSesji)?.przykladowaSprawa;
  const sprawa: SprawaPrzykladowa = {
    ...structuredClone(wzor),
    konto: sesja.pesel,
    rozpoczeto: ctx.teraz,
    dokumenty: wzor.dokumenty.map((d) => ({ ...d, wgrano: ctx.teraz, konto: sesja.pesel })),
    weryfikacja: undefined,
  };
  const wynik = wykonajOperacje(() => zapiszSprawe(sesja.idSesji, { przykladowaSprawa: sprawa, powiazaniaZastepcze: [] }));
  if (wynik.ok) usunPlikiSprawy(poprzednia);
  return wynik;
}

function nowaSprawa(konto: string, ctx: KontekstOperacji): SprawaPrzykladowa {
  return { zrodlo: 'wgrane-dokumenty', konto, rozpoczeto: ctx.teraz, dokumenty: [], dane: pusteDaneSprawy(), rozstrzygniecie: [] };
}

async function odczytajPrzezApi(plik: File, stan: StanSesji | null, tryb: 'model' | 'fikstura'): Promise<WynikOdczytuDokumentu | KodKomunikatu> {
  const formularz = new FormData();
  formularz.set('plik', plik, plik.name);
  formularz.set('powiazania', JSON.stringify(stan?.powiazaniaZastepcze ?? []));
  formularz.set('tryb', tryb);
  let odpowiedz: Response;
  try {
    odpowiedz = await fetch('/api/odczyt-dokumentu', { method: 'POST', body: formularz, signal: AbortSignal.timeout(LIMIT_ODCZYTU_MS) });
  } catch {
    return '0108';
  }
  if (odpowiedz.status === 400) {
    const blad = (await odpowiedz.json().catch(() => null)) as BladOdczytuDokumentu | null;
    return blad && 'kod' in blad ? blad.kod : '0103';
  }
  if (!odpowiedz.ok) return '0108';
  const wynik = (await odpowiedz.json().catch(() => null)) as WynikOdczytuDokumentu | null;
  if (wynik === null) return '0108';
  if (wynik.status === 'nierozpoznany') return '0105';
  if (wynik.status === 'nieczytelny') return '0106';
  if (wynik.status !== 'odczytany' || wynik.rodzajDokumentu === undefined) return '0108';
  return wynik;
}

/** Walidacja pliku, odczyt przez API (albo fikstura), scalenie z danymi sprawy. */
export async function wgrajDokument(plik: File, tryb: TrybWgraniaDokumentu, ctx: KontekstOperacji): Promise<WynikOperacji<WynikWgrania>> {
  const kodPliku = walidujPlik({ typ: plik.type, rozmiar: plik.size });
  if (kodPliku !== null) return { ok: false, kod: kodPliku, bledyPol: { plik: kodPliku } };
  const sesja = odczytajSesje();
  if (sesja === null) return { ok: false, kod: '0003' };

  const symulacja = odczytajParametry().symulacje.odczytDokumentu;
  if (symulacja === 'nierozpoznany') return { ok: false, kod: '0105' };
  if (symulacja === 'nieczytelny') return { ok: false, kod: '0106' };
  if (symulacja === 'niedostepny') return { ok: false, kod: '0108' };

  const stanPrzed = odczytajStanSesji(sesja.idSesji);
  const odczyt = await odczytajPrzezApi(plik, stanPrzed, symulacja);
  if (typeof odczyt === 'string') return { ok: false, kod: odczyt };

  const wygasa = dodajMinuty(ctx.teraz, CZAS_PRZECHOWANIA_PLIKU_MINUTY);
  let idPliku: string;
  try {
    idPliku = await zapiszPlik(plik, { nazwa: `dokument-${losowyCiag(8)}`, wlasciciel: sesja.pesel, idSesji: sesja.idSesji, wygasa });
  } catch {
    return { ok: false, kod: '0003' };
  }

  const stan = odczytajStanSesji(sesja.idSesji);
  const biezaca = stan?.przykladowaSprawa;
  const zaczynaNowa = tryb === 'nowa' || biezaca === undefined || biezaca.konto !== sesja.pesel;
  const baza = zaczynaNowa ? nowaSprawa(sesja.pesel, ctx) : biezaca;
  const rodzaj = odczyt.rodzajDokumentu as DokumentSprawy['rodzaj'];
  const dokument: DokumentSprawy = {
    id: `D-${losowyCiag(10)}`,
    rodzaj,
    numer: 1,
    wgrano: ctx.teraz,
    idPliku,
    konto: sesja.pesel,
  };
  const { sprawa, komunikaty } = scalOdczytZKomunikatami(baza, odczyt, dokument);
  const zastapiony = baza.dokumenty.find((d) => d.rodzaj === rodzaj);
  const powiazania = zaczynaNowa ? odczyt.nowePowiazania : [...(stan?.powiazaniaZastepcze ?? []), ...odczyt.nowePowiazania];

  const wynik = wykonajOperacje(() => {
    zapiszSprawe(sesja.idSesji, {
      przykladowaSprawa: sprawa,
      powiazaniaZastepcze: powiazania,
      plikiSesji: [...(stan?.plikiSesji ?? []), idPliku],
    });
  });
  if (!wynik.ok) {
    void usunPlik(idPliku);
    return wynik;
  }
  if (zaczynaNowa) usunPlikiSprawy(biezaca);
  else if (zastapiony?.idPliku) void usunPlik(zastapiony.idPliku);
  return { ok: true, wartosc: { komunikaty } };
}

function zmienSprawe(fn: (sprawa: SprawaPrzykladowa) => SprawaPrzykladowa): WynikOperacji {
  const sesja = odczytajSesje();
  const sprawa = sesja === null ? undefined : odczytajStanSesji(sesja.idSesji)?.przykladowaSprawa;
  if (sesja === null || sprawa === undefined) return { ok: false, kod: '0003' };
  if (czyWymuszonyBladZapisu()) return { ok: false, kod: '0003' };
  return wykonajOperacje(() => zapiszSprawe(sesja.idSesji, { przykladowaSprawa: fn(sprawa) }));
}

/**
 * Korekta wartości pola (ścieżka w DaneSprawy) z zachowaniem wartości pierwotnej. Wartość złożona może
 * przyjść jako tekst JSON albo obiekt. Numer PESEL wpisany przez użytkownika zastępujemy numerem losowym
 * z tą samą datą urodzenia i płcią.
 */
export function zapiszKorekte(pole: string, wartosc: WartoscOdczytana['wartosc'] | object, ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  return zmienSprawe((sprawa) => {
    let nowa: unknown = wartosc;
    if (typeof wartosc === 'string' && (wartosc.startsWith('[') || wartosc.startsWith('{'))) {
      try {
        nowa = JSON.parse(wartosc) as unknown;
      } catch {
        nowa = wartosc;
      }
    }
    if (pole === 'ubezpieczony.pesel' && typeof nowa === 'string' && /^\d{11}$/.test(nowa)) {
      const zastepczy = peselZastepczy(nowa, losuj);
      return { ...sprawa, dane: zKorekta(sprawa.dane, pole, zastepczy, true), weryfikacja: undefined };
    }
    return { ...sprawa, dane: zKorekta(sprawa.dane, pole, nowa), weryfikacja: undefined };
  });
}

/** Oczekiwane rozstrzygnięcie sprawy po edycji użytkownika (wpisy zmienione mają źródło korekta użytkownika). */
export function zapiszRozstrzygniecie(rozstrzygniecie: RozstrzygniecieSprawy[], ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  return zmienSprawe((sprawa) => ({ ...sprawa, rozstrzygniecie, weryfikacja: undefined }));
}

/** Usuwa pliki dokumentów po 24 godzinach od wgrania i zapisuje datę i godzinę usunięcia. */
export function usunPlikiPo24h(ctx: KontekstOperacji): WynikOperacji<number> {
  const sesja = odczytajSesje();
  const sprawa = sesja === null ? undefined : odczytajStanSesji(sesja.idSesji)?.przykladowaSprawa;
  if (sesja === null || sprawa === undefined) return { ok: true, wartosc: 0 };
  const wygasle = sprawa.dokumenty.filter(
    (d) => d.idPliku !== undefined && d.usunietoPlik === undefined
      && porownajZnaczniki(dodajMinuty(d.wgrano, CZAS_PRZECHOWANIA_PLIKU_MINUTY), ctx.teraz) <= 0,
  );
  if (wygasle.length === 0) return { ok: true, wartosc: 0 };
  for (const d of wygasle) if (d.idPliku) void usunPlik(d.idPliku);
  const wynik = wykonajOperacje(() =>
    zapiszSprawe(sesja.idSesji, {
      przykladowaSprawa: {
        ...sprawa,
        dokumenty: sprawa.dokumenty.map((d) =>
          wygasle.some((w) => w.id === d.id) ? { ...d, usunietoPlik: dodajMinuty(d.wgrano, CZAS_PRZECHOWANIA_PLIKU_MINUTY) } : d,
        ),
      },
    }),
  );
  return wynik.ok ? { ok: true, wartosc: wygasle.length } : wynik;
}

/** Usunięcie sprawy, jej plików i powiązań danych zastępczych; komunikat 0179 na liście spraw. */
export async function usunSprawe(ctx: KontekstOperacji): Promise<WynikOperacji> {
  void ctx;
  const sesja = odczytajSesje();
  if (sesja === null) return { ok: false, kod: '0003' };
  const sprawa = odczytajStanSesji(sesja.idSesji)?.przykladowaSprawa;
  const wynik = wykonajOperacje(() => zapiszSprawe(sesja.idSesji, { przykladowaSprawa: undefined, powiazaniaZastepcze: [] }));
  if (!wynik.ok) return wynik;
  await Promise.all((sprawa?.dokumenty ?? []).filter((d) => d.idPliku).map((d) => usunPlik(d.idPliku as string)));
  ustawKomunikatPoPrzejsciu({ kod: '0179', dlaWidoku: 'ViewSampleCaseList' });
  return { ok: true, wartosc: undefined };
}
