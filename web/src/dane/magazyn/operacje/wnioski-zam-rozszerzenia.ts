// Wniosek ZAM dla płatnika składek, wniosek przed porodem i przeliczenie po porodzie (kontrakt, sekcja 6.5).
// Właściciel: u33 (ZAM: wniosek dla płatnika, przed porodem i przy przyjęciu dziecka).
// Status i oznaczenia sprawy zmieniają wyłącznie operacje Planu rodzica (operacje/plan.ts).
import {
  czyWniosekPrzedPorodemDoPrzeliczenia,
  oznaczeniePoPorodzie,
  przeliczPoPorodzie,
} from '@/domena/wnioski/zam-przed-porodem';
import { ustawOznaczenie } from '@/dane/magazyn/operacje/plan';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { usunPlik, zapiszPlik } from '@/dane/magazyn/pliki';
import { czyBladZapisu } from '@/dane/magazyn/rdzen';
import {
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';
import type {
  DataISO,
  IdPliku,
  IdWidoku,
  IdWniosku,
  KontekstOperacji,
  LiczbaDzieci,
  PlikZalacznika,
  StanRodziny,
  Wniosek,
  WniosekZam,
  WynikOperacji,
} from '@/domena/typy';

function czyZam(w: Wniosek): w is WniosekZam {
  return w.rodzaj === 'zam';
}

/** Rodzina zalogowanego konta i jej wniosek ZAM o podanym identyfikatorze. */
function wniosekZalogowanego(id: IdWniosku): { rodzina: StanRodziny; wniosek: WniosekZam } | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const rodzina = rodzinaKonta(zalogowany.stanKonta.konto);
  if (rodzina === null) return null;
  const wniosek = rodzina.wnioski.find((w): w is WniosekZam => czyZam(w) && w.idWniosku === id);
  return wniosek ? { rodzina, wniosek } : null;
}

function zapiszWniosek(rodzina: StanRodziny, wniosek: WniosekZam): void {
  zmienStanRodziny(rodzina.idRodziny, (stan) => ({
    ...stan,
    wnioski: stan.wnioski.map((w) => (w.idWniosku === wniosek.idWniosku ? wniosek : w)),
  }));
}

export interface ZmianaPoczatkuZasilku {
  /** Dzień początku zasiłku albo null, gdy pole nie zawiera poprawnej daty (zapis do dokończenia). */
  dzienPoczatkuZasilku: DataISO | null;
  przewidywanyTerminPorodu: DataISO;
  liczbaDzieci: LiczbaDzieci;
  /** Nowy plik zaświadczenia lekarskiego do zapisania w szkicu. */
  plik?: File | null;
  /** Usunięcie wcześniej dołączonego pliku zaświadczenia. */
  usunZaswiadczenie?: boolean;
}

/**
 * Zapis ekranu ViewZamPrebirth w szkicu wniosku: dzień początku zasiłku, przewidywany termin porodu,
 * liczba dzieci i zaświadczenie lekarskie (plik w magazynie plików do chwili wysłania wniosku).
 */
export async function zapiszPoczatekZasilkuZam(
  id: IdWniosku,
  zmiana: ZmianaPoczatkuZasilku,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): Promise<WynikOperacji<WniosekZam>> {
  const znaleziony = wniosekZalogowanego(id);
  if (znaleziony === null) return { ok: false, kod: '0003' };
  const { wniosek } = znaleziony;
  const poprzednie = wniosek.przedPorodem?.zaswiadczenie;

  let zaswiadczenie = zmiana.usunZaswiadczenie ? undefined : poprzednie;
  let nowyPlik: IdPliku | null = null;
  if (zmiana.plik) {
    try {
      nowyPlik = await zapiszPlik(zmiana.plik, { nazwa: zmiana.plik.name, wlasciciel: wniosek.konto });
    } catch (blad) {
      if (czyBladZapisu(blad)) return { ok: false, kod: '0003' };
      throw blad;
    }
    const plik: PlikZalacznika = {
      idPliku: nowyPlik,
      nazwa: zmiana.plik.name,
      rozmiar: zmiana.plik.size,
      typ: (zmiana.plik.type || 'application/pdf') as PlikZalacznika['typ'],
    };
    zaswiadczenie = { id: 'zaswiadczenie-o-przewidywanej-dacie-porodu', rodzaj: 'zaswiadczenie-o-terminie-porodu', wymagany: true, plik };
  }

  const wynik = wykonajOperacjeZWynikiem<WniosekZam>(() => {
    const biezacy = wniosekZalogowanego(id);
    if (biezacy === null) return { ok: false, kod: '0003' };
    const dzien = zmiana.dzienPoczatkuZasilku ?? biezacy.wniosek.przedPorodem?.dzienPoczatkuZasilku;
    const przedPorodem: WniosekZam['przedPorodem'] =
      dzien === undefined
        ? biezacy.wniosek.przedPorodem
        : {
            dzienPoczatkuZasilku: dzien,
            przewidywanyTerminPorodu: zmiana.przewidywanyTerminPorodu,
            liczbaDzieci: zmiana.liczbaDzieci,
            ...(zaswiadczenie ? { zaswiadczenie } : {}),
          };
    const nowy: WniosekZam = {
      ...biezacy.wniosek,
      ...(przedPorodem ? { przedPorodem } : {}),
      rodzajUrlopu: biezacy.wniosek.rodzajUrlopu ?? 'macierzynski',
      daneDzieci: [],
      ostatniEkran: ekran,
      zaktualizowano: ctx.teraz,
    };
    zapiszWniosek(biezacy.rodzina, nowy);
    return { ok: true, wartosc: nowy };
  });

  if (!wynik.ok) {
    if (nowyPlik !== null) await usunPlik(nowyPlik);
    return wynik;
  }
  const usuniety = poprzednie?.plik?.idPliku;
  if (usuniety && (zmiana.usunZaswiadczenie || nowyPlik !== null)) await usunPlik(usuniety);
  return wynik;
}

/**
 * Wniosek przygotowany dla płatnika składek: stan przygotowany, adresat płatnik składek, nazwa pliku PDF;
 * sprawa zachowuje status do zrobienia i dostaje oznaczenie „wniosek przygotowany”. Wniosek nie trafia do ZUS.
 */
export function przygotujZamDlaPlatnika(id: IdWniosku, ctx: KontekstOperacji, nazwaPliku?: string): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const znaleziony = wniosekZalogowanego(id);
    if (znaleziony === null) return { ok: false, kod: '0003' };
    const { rodzina, wniosek } = znaleziony;
    const nowy: WniosekZam = {
      ...wniosek,
      stan: 'przygotowany',
      adresat: 'platnik-skladek',
      ostatniEkran: 'ViewZamForPayer',
      zaktualizowano: ctx.teraz,
      ...(nazwaPliku ? { nazwaPlikuDlaPlatnika: nazwaPliku } : {}),
    };
    zapiszWniosek(rodzina, nowy);
    const oznaczenie = ustawOznaczenie(wniosek.idSprawy, 'wniosek-przygotowany', true, ctx);
    if (!oznaczenie.ok) return oznaczenie;
    return przeliczRodzine(rodzina.idRodziny, ctx);
  });
}

/**
 * Przeliczenie wniosku złożonego przed porodem po potwierdzeniu daty porodu: nowy okres urlopu
 * macierzyńskiego i oznaczenie sprawy „dane dziecka do przekazania” (wniosek w ZUS, komunikat 0231)
 * albo „odpis aktu urodzenia do przekazania płatnikowi” (wniosek przygotowany dla płatnika).
 */
export function przeliczZamPoPorodzie(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const znaleziony = wniosekZalogowanego(id);
    if (znaleziony === null) return { ok: false, kod: '0003' };
    const { rodzina, wniosek } = znaleziony;
    const daneCiazy = rodzina.daneCiazy;
    if (!czyWniosekPrzedPorodemDoPrzeliczenia(wniosek) || !daneCiazy?.dataPoroduPotwierdzona || !daneCiazy.dataPorodu) {
      return { ok: true, wartosc: undefined };
    }
    if (wniosek.przekazanieDanychDziecka) return { ok: true, wartosc: undefined };
    const liczba = (daneCiazy.liczbaUrodzonychDzieci ?? wniosek.przedPorodem?.liczbaDzieci ?? 1) as LiczbaDzieci;
    const nowy = { ...przeliczPoPorodzie(wniosek, daneCiazy.dataPorodu, liczba), zaktualizowano: ctx.teraz };
    zapiszWniosek(rodzina, nowy);
    const oznaczenie = ustawOznaczenie(wniosek.idSprawy, oznaczeniePoPorodzie(nowy), true, ctx);
    if (!oznaczenie.ok) return oznaczenie;
    return przeliczRodzine(rodzina.idRodziny, ctx);
  });
}

/**
 * Przeliczenie wszystkich wniosków ZAM złożonych przed porodem w rodzinie zalogowanego konta.
 * Wywołuje je operacja potwierdzenia daty porodu w Profilu rodziny.
 */
export function przeliczWnioskiZamPoPorodzie(ctx: KontekstOperacji): WynikOperacji<{ przeliczone: IdWniosku[] }> {
  return wykonajOperacjeZWynikiem(() => {
    const zalogowany = odczytajZalogowanego();
    const rodzina = zalogowany ? rodzinaKonta(zalogowany.stanKonta.konto) : null;
    if (rodzina === null) return { ok: true, wartosc: { przeliczone: [] } };
    const przeliczone: IdWniosku[] = [];
    for (const w of rodzina.wnioski) {
      if (!czyZam(w) || !czyWniosekPrzedPorodemDoPrzeliczenia(w) || w.przekazanieDanychDziecka) continue;
      const wynik = przeliczZamPoPorodzie(w.idWniosku, ctx);
      if (!wynik.ok) return wynik;
      przeliczone.push(w.idWniosku);
    }
    return { ok: true, wartosc: { przeliczone } };
  });
}
