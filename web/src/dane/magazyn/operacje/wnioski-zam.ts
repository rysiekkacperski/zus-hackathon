// Kreator wniosku ZAM do ZUS (kontrakt, sekcja 6.5). Właściciel: u27 (Kreator wniosku ZAM do ZUS).
// Szkic wniosku żyje w Wnioskach rodziny (stan szkic) z ostatnim wyświetlonym ekranem. Status sprawy zmienia
// wyłącznie operacja Planu rodzica ustawStatusSprawy. Wniosek wysyła REST API symulowanego ZUS (POST /api/v1/zus/wnioski),
// a magazyn zapisuje wniosek w stanie wysłanym z numerem potwierdzenia i datą złożenia z odpowiedzi.
import { wyslijWniosekDoZus } from '@/dane/api/klient';
import { opcjeSymulowanegoZus } from '@/dane/api/symulowany-zus';
import { usunPlik } from '@/dane/magazyn/pliki';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { ustawOznaczenie, ustawStatusSprawy } from '@/dane/magazyn/operacje/plan';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajKatalog,
  odczytajStanRodziny,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';
import { idZLosowych } from '@/domena/numery';
import type {
  DaneOsobyWniosku,
  DzieckoProfilu,
  IdPliku,
  IdSprawy,
  IdWidoku,
  IdWniosku,
  KontekstOperacji,
  KontoPrzewodnika,
  StanRodziny,
  Wniosek,
  WniosekZam,
  WynikOperacji,
} from '@/domena/typy';
import { adresatWniosku, platnikZasilkuWniosku, rodzicKontaWRodzinie } from '@/domena/wnioski/zam';
import { czyMinalTerminWariantu, wyliczOkresyZam } from '@/domena/wnioski/zam-okresy';

function czyZam(w: Wniosek): w is WniosekZam {
  return w.rodzaj === 'zam';
}

interface KontekstWniosku {
  konto: KontoPrzewodnika;
  rodzina: StanRodziny;
}

function kontekstZalogowanego(): KontekstWniosku | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const rodzina = rodzinaKonta(zalogowany.stanKonta.konto);
  return rodzina === null ? null : { konto: zalogowany.stanKonta.konto, rodzina };
}

/** Wniosek ZAM zalogowanego konta o podanym identyfikatorze. */
export function znajdzWniosekZam(rodzina: StanRodziny | null, id: IdWniosku | null, pesel?: string): WniosekZam | null {
  if (rodzina === null || id === null) return null;
  const w = rodzina.wnioski.find((x) => x.idWniosku === id);
  if (!w || !czyZam(w)) return null;
  return pesel === undefined || w.konto === pesel ? w : null;
}

/** Szkic wniosku ZAM konta dla sprawy. */
export function szkicZamSprawy(rodzina: StanRodziny | null, idSprawy: IdSprawy, pesel: string): WniosekZam | null {
  if (rodzina === null) return null;
  const w = rodzina.wnioski.find((x) => czyZam(x) && x.stan === 'szkic' && x.idSprawy === idSprawy && x.konto === pesel);
  return w && czyZam(w) ? w : null;
}

function zmienWniosek(idRodziny: string, id: IdWniosku, fn: (w: WniosekZam) => WniosekZam): WniosekZam | null {
  let wynik: WniosekZam | null = null;
  zmienStanRodziny(idRodziny, (stan) => ({
    ...stan,
    wnioski: stan.wnioski.map((w) => {
      if (w.idWniosku !== id || !czyZam(w)) return w;
      wynik = fn(w);
      return wynik;
    }),
  }));
  return wynik;
}

function sprawaWPlanie(rodzina: StanRodziny, idSprawy: IdSprawy): boolean {
  return rodzina.plan?.pozycje.some((p) => p.idSprawy === idSprawy) === true;
}

/** Nowy szkic wniosku ZAM dla sprawy albo szkic zapisany wcześniej (wznowienie od ostatniego ekranu). */
export function rozpocznijLubWznowZam(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji<WniosekZam> {
  return wykonajOperacjeZWynikiem<WniosekZam>(() => {
    const k = kontekstZalogowanego();
    if (k === null) return { ok: false, kod: '0003' };
    const istniejacy = szkicZamSprawy(k.rodzina, idSprawy, k.konto.pesel);
    if (istniejacy) return { ok: true, wartosc: istniejacy };
    const rodzic = rodzicKontaWRodzinie(k.konto, k.rodzina);
    const platnik = platnikZasilkuWniosku(k.rodzina, rodzic);
    const sprawa = k.rodzina.plan?.pozycje.find((p) => p.idSprawy === idSprawy);
    const wybrany = sprawa?.wybranyWariant;
    const wariant: WniosekZam['wariant'] =
      wybrany && 'wariant' in wybrany ? (wybrany.wariant === '81-5' ? 'caly-rodzicielski' : 'tylko-macierzynski') : undefined;
    const daneCiazy = k.rodzina.daneCiazy;
    const przedPorodem = !(daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu) && rodzic === 'matka';
    const nowy: WniosekZam = {
      idWniosku: idZLosowych('W', ctx.teraz, losowyCiag(6)),
      rodzaj: 'zam',
      idSprawy,
      konto: k.konto.pesel,
      rola: k.konto.rola,
      stan: 'szkic',
      ostatniEkran: 'ViewZamLeaveType',
      utworzono: ctx.teraz,
      zaktualizowano: ctx.teraz,
      adresat: adresatWniosku(platnik),
      zalaczniki: [],
      rodzajUrlopu: przedPorodem ? 'macierzynski' : undefined,
      okresy: [],
      wariant,
      daneRodzica: { imie: k.konto.imie, nazwisko: k.konto.nazwisko, pesel: k.konto.pesel },
      daneDzieci: [],
      oswiadczeniaPotwierdzone: false,
      oswiadczenieZaZyciem: daneCiazy?.zaswiadczenieZaZyciem === true ? true : undefined,
    };
    zmienStanRodziny(k.rodzina.idRodziny, (stan) => ({ ...stan, wnioski: [...stan.wnioski, nowy] }));
    const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: nowy };
  });
}

/** Dane dziecka wpisane we wniosku uzupełniają puste pola dziecka w profilu rodziny (KA-04 3.9.1.1.3). */
function uzupelnijDzieciWProfilu(stan: StanRodziny, dane: DaneOsobyWniosku[]): StanRodziny {
  if (stan.daneCiazy === null || dane.length === 0) return stan;
  const dzieci: DzieckoProfilu[] = [...stan.daneCiazy.dzieci];
  dane.forEach((d, i) => {
    const biezace: DzieckoProfilu = dzieci[i] ?? { zrodlo: 'odpowiedz-rodzica' };
    dzieci[i] = {
      ...biezace,
      imie: biezace.imie || d.imie,
      nazwisko: biezace.nazwisko || d.nazwisko,
      pesel: biezace.pesel || d.pesel,
      miejsceUrodzenia: biezace.miejsceUrodzenia || d.miejsceUrodzenia,
      dataUrodzenia: biezace.dataUrodzenia || d.dataUrodzenia,
    };
  });
  return { ...stan, daneCiazy: { ...stan.daneCiazy, dzieci } };
}

/** Zapis odpowiedzi z ekranu kreatora i ostatniego ekranu. */
export function zapiszKrokZam(
  id: IdWniosku,
  zmiana: Partial<WniosekZam>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekZam> {
  return wykonajOperacjeZWynikiem<WniosekZam>(() => {
    const k = kontekstZalogowanego();
    if (k === null) return { ok: false, kod: '0003' };
    const wniosek = znajdzWniosekZam(k.rodzina, id, k.konto.pesel);
    if (wniosek === null || wniosek.stan !== 'szkic') return { ok: false, kod: '0003' };
    const nowy = zmienWniosek(k.rodzina.idRodziny, id, (w) => ({
      ...w,
      ...zmiana,
      idWniosku: w.idWniosku,
      rodzaj: 'zam',
      stan: 'szkic',
      ostatniEkran: ekran,
      zaktualizowano: ctx.teraz,
    }));
    if (nowy === null) return { ok: false, kod: '0003' };
    if (zmiana.daneDzieci && zmiana.daneDzieci.length > 0) {
      const dzieci = zmiana.daneDzieci;
      zmienStanRodziny(k.rodzina.idRodziny, (stan) => uzupelnijDzieciWProfilu(stan, dzieci));
    }
    const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: nowy };
  });
}

/** Najkrótszy czas wysyłki do kanału wniosków eZUS, żeby stan wysyłania był widoczny także przy szybkiej odpowiedzi API. */
const OPOZNIENIE_WYSYLKI_MS = 600;

function poczekaj(ms: number): Promise<void> {
  return new Promise((rozwiaz) => setTimeout(rozwiaz, ms));
}

/** Termin 21 dni na wariant 81,5% minął (R12): szkic dostaje okresy bez wariantu, a wynik to 0038 bez wysyłki. */
function zapiszPoTerminieWariantu(
  id: IdWniosku,
  wejscie: Parameters<typeof wyliczOkresyZam>[0],
  ctx: KontekstOperacji,
): WynikOperacji<{ potwierdzenie: string }> {
  const { okresy } = wyliczOkresyZam(wejscie, odczytajKatalog(), ctx.dzis);
  const zapis = zapiszKrokZam(id, { okresy, wariant: 'brak', rodzicielski: undefined }, 'ViewZamSummary', ctx);
  return zapis.ok ? { ok: false, kod: '0038' } : zapis;
}

/**
 * Wysłanie wniosku do ZUS przez REST API symulowanego ZUS z numerem potwierdzenia z odpowiedzi. Ponowne sprawdzenie
 * terminu 21 dni (R12) przed wysłaniem i w API zmienia szkic i zwraca 0038 bez wysyłki; niedostępny ZUS (symulacja
 * wysylkaDoZusNiedostepna albo błąd sieci) daje 0044 z zachowanym szkicem, a kontrole API 0043 i 0149 zostawiają szkic.
 */
export async function wyslijZam(id: IdWniosku, ctx: KontekstOperacji): Promise<WynikOperacji<{ potwierdzenie: string }>> {
  const k = kontekstZalogowanego();
  if (k === null) return { ok: false, kod: '0003' };
  const wniosek = znajdzWniosekZam(k.rodzina, id, k.konto.pesel);
  if (wniosek === null || wniosek.stan !== 'szkic') return { ok: false, kod: '0003' };
  const wejscie = { wniosek, daneCiazy: k.rodzina.daneCiazy, plan: k.rodzina.plan };

  if (czyMinalTerminWariantu(wejscie, ctx.dzis)) return zapiszPoTerminieWariantu(id, wejscie, ctx);

  const [odpowiedz] = await Promise.all([
    wyslijWniosekDoZus(
      { wniosek, daneCiazy: k.rodzina.daneCiazy, plan: k.rodzina.plan, teraz: ctx.teraz },
      opcjeSymulowanegoZus(),
    ),
    poczekaj(OPOZNIENIE_WYSYLKI_MS),
  ]);

  if (!odpowiedz.ok) {
    if (odpowiedz.kod === '0038') return zapiszPoTerminieWariantu(id, wejscie, ctx);
    const kod = odpowiedz.kod === '0043' || odpowiedz.kod === '0149' ? odpowiedz.kod : '0044';
    const zapis = zapiszKrokZam(id, {}, 'ViewZamSummary', ctx);
    return zapis.ok ? { ok: false, kod } : zapis;
  }
  const { potwierdzenie, dataZlozenia } = odpowiedz.wartosc;

  let plikDoUsuniecia: IdPliku | null = null;
  const wynik = wykonajOperacjeZWynikiem<{ potwierdzenie: string }>(() => {
    const rodzina = odczytajStanRodziny(k.rodzina.idRodziny);
    if (rodzina === null) return { ok: false, kod: '0003' };
    zmienWniosek(rodzina.idRodziny, id, (w) => {
      const zaswiadczenie = w.przedPorodem?.zaswiadczenie;
      if (zaswiadczenie?.plik) plikDoUsuniecia = zaswiadczenie.plik.idPliku;
      return {
        ...w,
        stan: 'wyslany',
        adresat: 'zus',
        dataZlozenia,
        potwierdzenie,
        ostatniEkran: 'ViewZamSent',
        zaktualizowano: ctx.teraz,
        przedPorodem: w.przedPorodem
          ? {
              ...w.przedPorodem,
              zaswiadczenie: zaswiadczenie
                ? { ...zaswiadczenie, plik: undefined, nazwaPoWyslaniu: zaswiadczenie.plik?.nazwa ?? zaswiadczenie.nazwaPoWyslaniu }
                : undefined,
            }
          : undefined,
      };
    });
    if (sprawaWPlanie(rodzina, wniosek.idSprawy)) {
      const status = ustawStatusSprawy(wniosek.idSprawy, 'zlozona', 'kreator-wniosku', ctx);
      if (!status.ok) return status;
    }
    const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: { potwierdzenie } };
  });
  if (wynik.ok && plikDoUsuniecia !== null) {
    try {
      await usunPlik(plikDoUsuniecia);
    } catch {
      // Plik zostaje w IndexedDB; wniosek przechowuje wyłącznie nazwę pliku.
    }
  }
  return wynik;
}

/** Przekazanie danych dziecka do ZUS po porodzie (0232). */
export function przekazDaneDzieckaZus(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const k = kontekstZalogowanego();
    if (k === null) return { ok: false, kod: '0003' };
    const wniosek = znajdzWniosekZam(k.rodzina, id, k.konto.pesel);
    const ciaza = k.rodzina.daneCiazy;
    if (wniosek === null || ciaza === null) return { ok: false, kod: '0003' };
    const dane: DaneOsobyWniosku[] = ciaza.dzieci.map((d) => ({
      imie: d.imie ?? '',
      nazwisko: d.nazwisko ?? '',
      pesel: d.pesel,
      dataUrodzenia: d.dataUrodzenia ?? ciaza.dataPorodu,
      miejsceUrodzenia: d.miejsceUrodzenia,
    }));
    zmienWniosek(k.rodzina.idRodziny, id, (w) => ({
      ...w,
      daneDzieci: dane,
      przekazanieDanychDziecka: { czas: ctx.teraz, dane, liczbaUrodzonychDzieci: ciaza.liczbaUrodzonychDzieci ?? dane.length },
      zaktualizowano: ctx.teraz,
    }));
    const sprawa = k.rodzina.plan?.pozycje.find((p) => p.idSprawy === wniosek.idSprawy);
    if (sprawa?.oznaczenia.includes('dane-dziecka-do-przekazania')) {
      const oznaczenie = ustawOznaczenie(wniosek.idSprawy, 'dane-dziecka-do-przekazania', false, ctx);
      if (!oznaczenie.ok) return oznaczenie;
    }
    const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: undefined };
  });
}
