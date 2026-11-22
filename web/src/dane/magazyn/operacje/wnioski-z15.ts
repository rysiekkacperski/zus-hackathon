// Kreator wniosku o zasiłek opiekuńczy Z-15 (epik 3.9.3). Właściciel: u30.
// Szkic wniosku w grupie Wnioski rodziny, zapis kroków, pliki załączników, wysyłka do ZUS przez REST API symulowanego ZUS
// (POST /api/v1/zus/wnioski, w trybie demonstracyjnym numer Z15-DEMO-RRRRMMDD-NNNN z odpowiedzi), przygotowanie dla płatnika
// składek i oznaczenie przekazania. Status sprawy K22 zmienia operacja planu ustawStatusSprawy.
import { idZLosowych } from '@/domena/numery';
import { walidujPlik } from '@/domena/walidacje';
import type {
  IdPliku,
  IdSprawy,
  IdWidoku,
  IdWniosku,
  KontekstOperacji,
  PlikZalacznika,
  StanRodziny,
  SytuacjaOpiekiZ15,
  WniosekZ15,
  WynikOperacji,
} from '@/domena/typy';
import { wyslijWniosekDoZusZNumeracja } from '@/dane/magazyn/operacje/numeracja-wnioskow-zus';
import { opcjeSymulowanegoZus } from '@/dane/api/symulowany-zus';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { ustawStatusSprawy } from '@/dane/magazyn/operacje/plan';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { usunPlik, zapiszPlik } from '@/dane/magazyn/pliki';
import {
  czyTrybDemonstracyjny,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';

export const SPRAWA_Z15: IdSprawy = 'K22';

export interface StartWnioskuZ15 {
  idSprawy?: IdSprawy;
  sytuacja?: SytuacjaOpiekiZ15;
}

function kontekstZalogowanego(): { rodzina: StanRodziny; pesel: string; rola: WniosekZ15['rola'] } | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const konto = zalogowany.stanKonta.konto;
  const rodzina = rodzinaKonta(konto);
  if (rodzina === null) return null;
  return { rodzina, pesel: konto.pesel, rola: konto.rola };
}

export function szkicZ15(rodzina: StanRodziny, pesel: string): WniosekZ15 | undefined {
  return rodzina.wnioski
    .filter((w): w is WniosekZ15 => w.rodzaj === 'z-15' && w.stan === 'szkic' && w.konto === pesel)
    .sort((a, b) => b.zaktualizowano.localeCompare(a.zaktualizowano))[0];
}

function zapiszWniosek(rodzina: StanRodziny, wniosek: WniosekZ15): void {
  zmienStanRodziny(rodzina.idRodziny, (s) => ({
    ...s,
    wnioski: s.wnioski.some((w) => w.idWniosku === wniosek.idWniosku)
      ? s.wnioski.map((w) => (w.idWniosku === wniosek.idWniosku ? wniosek : w))
      : [...s.wnioski, wniosek],
  }));
}

function znajdz(k: { rodzina: StanRodziny }, id: IdWniosku): WniosekZ15 | undefined {
  return k.rodzina.wnioski.find((w): w is WniosekZ15 => w.idWniosku === id && w.rodzaj === 'z-15');
}

/** Nowy szkic albo szkic zapisany wcześniej; akcja dodatkowego zasiłku ustawia sytuację w szkicu. */
export function rozpocznijLubWznowZ15(dane: StartWnioskuZ15, ctx: KontekstOperacji): WynikOperacji<WniosekZ15> {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstZalogowanego();
    if (k === null) return { ok: false, kod: '0003' };
    const istniejacy = szkicZ15(k.rodzina, k.pesel);
    if (istniejacy && !dane.sytuacja) return { ok: true, wartosc: istniejacy };
    const baza: WniosekZ15 = istniejacy ?? {
      idWniosku: idZLosowych('W', ctx.teraz, losowyCiag(6)),
      rodzaj: 'z-15',
      idSprawy: dane.idSprawy ?? SPRAWA_Z15,
      konto: k.pesel,
      rola: k.rola,
      stan: 'szkic',
      ostatniEkran: 'ViewZ15Situation',
      utworzono: ctx.teraz,
      zaktualizowano: ctx.teraz,
      zalaczniki: [],
      okresy: [],
      oswiadczenia: {},
      oswiadczeniePotwierdzone: false,
    };
    const wniosek: WniosekZ15 = dane.sytuacja
      ? { ...baza, sytuacja: dane.sytuacja, okresy: baza.sytuacja === dane.sytuacja ? baza.okresy : [], ostatniEkran: 'ViewZ15Situation', zaktualizowano: ctx.teraz }
      : baza;
    zapiszWniosek(k.rodzina, wniosek);
    const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: wniosek };
  });
}

export function zapiszKrokZ15(id: IdWniosku, zmiana: Partial<WniosekZ15>, ekran: IdWidoku, ctx: KontekstOperacji): WynikOperacji<WniosekZ15> {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstZalogowanego();
    if (k === null) return { ok: false, kod: '0003' };
    const obecny = znajdz(k, id);
    if (!obecny || obecny.stan !== 'szkic') return { ok: false, kod: '0003' };
    const wniosek: WniosekZ15 = {
      ...obecny,
      ...zmiana,
      idWniosku: obecny.idWniosku,
      rodzaj: 'z-15',
      stan: 'szkic',
      ostatniEkran: ekran,
      zaktualizowano: ctx.teraz,
    };
    zapiszWniosek(k.rodzina, wniosek);
    const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: wniosek };
  });
}

/** Dołączenie pliku do pozycji załącznika (0103, 0104). */
export async function dolaczPlikZ15(id: IdWniosku, idZalacznika: string, rodzaj: string, plik: File, ctx: KontekstOperacji): Promise<WynikOperacji<WniosekZ15>> {
  const typ = plik.type === 'image/jpg' ? 'image/jpeg' : plik.type;
  const blad = walidujPlik({ typ, rozmiar: plik.size });
  if (blad) return { ok: false, kod: blad };
  const k = kontekstZalogowanego();
  const obecny = k ? znajdz(k, id) : undefined;
  if (!k || !obecny) return { ok: false, kod: '0003' };
  let idPliku: IdPliku;
  try {
    idPliku = await zapiszPlik(plik, { nazwa: plik.name, wlasciciel: k.pesel });
  } catch {
    return { ok: false, kod: '0003' };
  }
  const zapisany: PlikZalacznika = { idPliku, nazwa: plik.name, rozmiar: plik.size, typ: typ as PlikZalacznika['typ'] };
  const poprzedni = obecny.zalaczniki.find((z) => z.id === idZalacznika)?.plik;
  const zalaczniki = [
    ...obecny.zalaczniki.filter((z) => z.id !== idZalacznika),
    { id: idZalacznika, rodzaj, wymagany: true, plik: zapisany },
  ];
  const wynik = zapiszKrokZ15(id, { zalaczniki }, obecny.ostatniEkran ?? 'ViewZ15Summary', ctx);
  if (!wynik.ok) {
    await usunPlik(idPliku).catch(() => undefined);
    return wynik;
  }
  if (poprzedni) await usunPlik(poprzedni.idPliku).catch(() => undefined);
  return wynik;
}

/**
 * Wysłanie wniosku do ZUS przez REST API symulowanego ZUS (0043 bez oświadczenia, 0149 bez plików, 0044 przy niedostępnym
 * kanale albo błędzie sieci). Numer potwierdzenia i datę złożenia nadaje API; wymagane załączniki z kreatora API sprawdza
 * ponownie. W treści żądania załączniki spoza listy wymaganych z kreatora mają wyłączone oznaczenie wymaganego, bo kreator
 * ich już nie żąda.
 */
export async function wyslijZ15(id: IdWniosku, wymaganeZalaczniki: string[], ctx: KontekstOperacji): Promise<WynikOperacji<{ potwierdzenie: string }>> {
  const k = kontekstZalogowanego();
  const obecny = k ? znajdz(k, id) : undefined;
  if (!k || !obecny || obecny.stan !== 'szkic') return { ok: false, kod: '0003' };
  if (!obecny.oswiadczeniePotwierdzone) return { ok: false, kod: '0043' };
  if (wymaganeZalaczniki.some((z) => !obecny.zalaczniki.find((p) => p.id === z)?.plik)) return { ok: false, kod: '0149' };
  if (!czyTrybDemonstracyjny()) return { ok: false, kod: '0044' };
  const doWyslania: WniosekZ15 = {
    ...obecny,
    zalaczniki: obecny.zalaczniki.map((z) => (wymaganeZalaczniki.includes(z.id) ? z : { ...z, wymagany: false })),
  };
  const odpowiedz = await wyslijWniosekDoZusZNumeracja({ wniosek: doWyslania, wymaganeZalaczniki, teraz: ctx.teraz }, opcjeSymulowanegoZus());
  // Kod, pola i parametry z odpowiedzi API; klient daje 0044 po błędzie sieci albo odpowiedzi bez kodu.
  if (!odpowiedz.ok) return odpowiedz;
  const { potwierdzenie, dataZlozenia } = odpowiedz.wartosc;
  const pliki = obecny.zalaczniki.flatMap((z) => (z.plik ? [z.plik.idPliku] : []));
  const wynik = wykonajOperacjeZWynikiem<{ potwierdzenie: string }>(() => {
    const wyslany: WniosekZ15 = {
      ...obecny,
      stan: 'wyslany',
      adresat: 'zus',
      dataZlozenia,
      potwierdzenie,
      zaktualizowano: ctx.teraz,
      zalaczniki: obecny.zalaczniki.map(({ plik, ...z }) => (plik ? { ...z, nazwaPoWyslaniu: plik.nazwa } : z)),
    };
    zapiszWniosek(k.rodzina, wyslany);
    const status = ustawStatusSprawy(obecny.idSprawy, 'zlozona', 'kreator-wniosku', ctx);
    if (!status.ok) {
      const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
      if (!przeliczenie.ok) return przeliczenie;
    }
    return { ok: true, wartosc: { potwierdzenie } };
  });
  if (wynik.ok) await Promise.all(pliki.map((p) => usunPlik(p).catch(() => undefined)));
  return wynik;
}

/** Przygotowanie wniosku dla płatnika składek (0043 bez oświadczenia); sprawa K22 pozostaje do zrobienia. */
export function przygotujZ15DlaPlatnika(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji<WniosekZ15> {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstZalogowanego();
    const obecny = k ? znajdz(k, id) : undefined;
    if (!k || !obecny || obecny.stan !== 'szkic') return { ok: false, kod: '0003' };
    if (!obecny.oswiadczeniePotwierdzone) return { ok: false, kod: '0043' };
    const przygotowany: WniosekZ15 = {
      ...obecny,
      stan: 'przygotowany',
      adresat: 'platnik-skladek',
      dataPrzygotowania: ctx.dzis,
      ostatniEkran: 'ViewZ15ForPayer',
      zaktualizowano: ctx.teraz,
    };
    zapiszWniosek(k.rodzina, przygotowany);
    const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: przygotowany };
  });
}

/** Oznaczenie wniosku jako przekazanego płatnikowi (0326): data przekazania i status złożona sprawy K22. */
export function oznaczZ15JakoPrzekazany(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji<WniosekZ15> {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstZalogowanego();
    const obecny = k ? znajdz(k, id) : undefined;
    if (!k || !obecny || obecny.stan !== 'przygotowany') return { ok: false, kod: '0003' };
    const zlozony: WniosekZ15 = { ...obecny, stan: 'zlozony', dataPrzekazania: ctx.dzis, dataZlozenia: ctx.dzis, zaktualizowano: ctx.teraz };
    zapiszWniosek(k.rodzina, zlozony);
    const status = ustawStatusSprawy(obecny.idSprawy, 'zlozona', 'kreator-wniosku', ctx);
    if (!status.ok) {
      const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
      if (!przeliczenie.ok) return przeliczenie;
    }
    return { ok: true, wartosc: zlozony };
  });
}
