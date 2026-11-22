// Wysyłka i pobranie wniosku o urlop do pracodawcy (kontrakt, sekcja 6.5). Właściciel: u32 (Wnioski o urlop: warianty formularza i wysyłka).
// Reguły R-13 (szczególna ochrona), R-15 (status sprawy), R-16 (ponowne sprawdzenie 81,5%) i R-17 (numer potwierdzenia).
import { walidujPlik } from '@/domena/walidacje';
import type {
  DaneRodzica,
  DrugiRodzic,
  IdWniosku,
  KodKomunikatu,
  KontekstOperacji,
  PlikZalacznika,
  StanRodziny,
  WniosekOUrlop,
  WynikOperacji,
} from '@/domena/typy';
import { poczatekOchrony } from '@/domena/wnioski/ochrona';
import { czyWychowawczy, ochronaWychowawczego } from '@/domena/wnioski/urlopy-wychowawczy';
import { czyWyslanieZamykaSprawe, zbierzDaneKreatora } from '@/domena/wnioski/urlopy';
import { okresOchrony, sprawdzTermin815, walidujWysylke } from '@/domena/wnioski/wysylka-do-pracodawcy';
import { nastepnyNumerPotwierdzenia } from '@/dane/magazyn/operacje/konto';
import { ustawOznaczenie, ustawStatusSprawy } from '@/dane/magazyn/operacje/plan';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { usunPlik, zapiszPlik } from '@/dane/magazyn/pliki';
import { czyBladZapisu } from '@/dane/magazyn/rdzen';
import {
  czySymulacja,
  czyTrybDemonstracyjny,
  odczytajKatalog,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacje,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';
import { znajdzWniosekOUrlop } from '@/dane/magazyn/operacje/wnioski-urlop';
import { poWyslaniuDoPracodawcy } from '@/dane/magazyn/operacje/rezygnacja';

interface KontekstWysylki {
  rodzina: StanRodziny;
  wniosek: WniosekOUrlop;
  pesel: string;
  dane: ReturnType<typeof zbierzDaneKreatora>;
}

function kontekstWysylki(id: IdWniosku): KontekstWysylki | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const konto = zalogowany.stanKonta.konto;
  const rodzina = rodzinaKonta(konto);
  const wniosek = znajdzWniosekOUrlop(rodzina, konto.pesel, id);
  if (rodzina === null || wniosek === null) return null;
  const dane = zbierzDaneKreatora({ konto, rodzina, daneZus: zalogowany.stanKonta.kopiaDanychZus, katalog: odczytajKatalog() });
  return { rodzina, wniosek, pesel: konto.pesel, dane };
}

function zamienWniosek(idRodziny: string, nowy: WniosekOUrlop): void {
  zmienStanRodziny(idRodziny, (s) => ({ ...s, wnioski: s.wnioski.map((w) => (w.idWniosku === nowy.idWniosku ? nowy : w)) }));
}

/** Adres e-mail pracodawcy w Danych rodziny ze źródłem odpowiedź rodzica, gdy go brak albo jest inny. */
function zapiszEmailPracodawcy(rodzina: StanRodziny, rodzic: 'matka' | 'drugi-rodzic', email: string): void {
  const dane: DaneRodzica | DrugiRodzic = rodzic === 'matka' ? rodzina.daneRodziny.matka : rodzina.daneRodziny.drugiRodzic;
  if (dane.emailPracodawcy?.wartosc === email) return;
  const emailPracodawcy = { wartosc: email, zrodlo: 'odpowiedz-rodzica' as const };
  zmienStanRodziny(rodzina.idRodziny, (s) => ({
    ...s,
    daneRodziny: rodzic === 'matka'
      ? { ...s.daneRodziny, matka: { ...s.daneRodziny.matka, emailPracodawcy } }
      : { ...s.daneRodziny, drugiRodzic: { ...s.daneRodziny.drugiRodzic, emailPracodawcy } },
  }));
}

type RezultatWysylki = { rodzaj: 'wyslany'; pliki: string[] } | { rodzaj: 'blad'; kod: KodKomunikatu };

/**
 * Wysłanie wniosku e-mailem do pracodawcy (0138 przy uslugaEmailNiedostepna). Adres e-mail zapisuje wcześniej
 * zapiszKrokWnioskuOUrlop. Po upływie terminu 81,5% zmienia stawki w szkicu i zwraca 0038 albo 0165 bez wysłania.
 */
export async function wyslijWniosekDoPracodawcy(id: IdWniosku, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const wynik = wykonajOperacje<RezultatWysylki>(() => {
    const k = kontekstWysylki(id);
    if (k === null) return { rodzaj: 'blad', kod: '0003' };
    const { wniosek, rodzina, dane } = k;
    const email = wniosek.emailPracodawcy ?? '';
    const bledy = walidujWysylke({ email });
    if (bledy.email) return { rodzaj: 'blad', kod: bledy.email };
    const termin = sprawdzTermin815(wniosek, dane, ctx.dzis);
    if (termin) {
      zamienWniosek(rodzina.idRodziny, { ...wniosek, okresy: termin.okresy, wariant: '100-70', zaktualizowano: ctx.teraz });
      return { rodzaj: 'blad', kod: termin.kod };
    }
    if (czySymulacja('uslugaEmailNiedostepna')) return { rodzaj: 'blad', kod: '0138' };
    const pierwszy = okresOchrony(wniosek);
    // Urlop wychowawczy i obniżenie wymiaru (3.9.6.2.2): ochrona od 21 dni przed początkiem okresu.
    const ochronaWych =
      wniosek.wychowawczy && czyWychowawczy(wniosek.podrodzaj)
        ? ochronaWychowawczego(wniosek.wychowawczy, wniosek.podrodzaj, ctx.dzis)
        : null;
    const dataPoczatkuOchrony = ochronaWych
      ? ochronaWych.od
      : pierwszy
        ? poczatekOchrony(ctx.dzis, pierwszy.od, pierwszy.rodzajUrlopu === 'laczenie-z-praca' ? 'rodzicielski' : pierwszy.rodzajUrlopu)
        : ctx.dzis;
    const pliki = wniosek.zalaczniki.flatMap((z) => (z.plik ? [z.plik.idPliku] : []));
    const wyslany: WniosekOUrlop = {
      ...wniosek,
      stan: 'wyslany',
      adresat: 'pracodawca',
      dataZlozenia: ctx.dzis,
      dataPoczatkuOchrony,
      ...(ochronaWych ? { dataKoncaOchrony: ochronaWych.do } : {}),
      potwierdzenie: czyTrybDemonstracyjny() ? nastepnyNumerPotwierdzenia('URLOP-DEMO', ctx.dzis) : undefined,
      zalaczniki: wniosek.zalaczniki.map((z) => (z.plik ? { ...z, plik: undefined, nazwaPoWyslaniu: z.plik.nazwa } : z)),
      ostatniEkran: 'ViewLeaveRequestSent',
      zaktualizowano: ctx.teraz,
    };
    zamienWniosek(rodzina.idRodziny, wyslany);
    zapiszEmailPracodawcy(rodzina, dane.rodzic, email);
    if (czyWyslanieZamykaSprawe(wniosek.podrodzaj)) ustawStatusSprawy(wniosek.idSprawy, 'zlozona', 'kreator-wniosku', ctx);
    przeliczRodzine(rodzina.idRodziny, ctx);
    return { rodzaj: 'wyslany', pliki };
  });
  if (!wynik.ok) return wynik;
  if (wynik.wartosc.rodzaj === 'blad') return { ok: false, kod: wynik.wartosc.kod };
  // Rezygnacja matki i wniosek ojca (u34): powiadomienie drugiego rodzica i data początku ochrony ojca.
  poWyslaniuDoPracodawcy(id, ctx);
  await Promise.all(wynik.wartosc.pliki.map((p) => usunPlik(p).catch(() => undefined)));
  return { ok: true, wartosc: undefined };
}

/** Wniosek przygotowany do pobrania i wydruku: stan przygotowany i oznaczenie sprawy „wniosek przygotowany”. */
export function pobierzWniosekOUrlop(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstWysylki(id);
    if (k === null) return { ok: false, kod: '0003' };
    if (k.wniosek.stan === 'wyslany') return { ok: true, wartosc: undefined };
    zamienWniosek(k.rodzina.idRodziny, {
      ...k.wniosek, stan: 'przygotowany', adresat: 'pracodawca', dataPrzygotowania: ctx.dzis, zaktualizowano: ctx.teraz,
    });
    ustawOznaczenie(k.wniosek.idSprawy, 'wniosek-przygotowany', true, ctx);
    przeliczRodzine(k.rodzina.idRodziny, ctx);
    return { ok: true, wartosc: undefined };
  });
}

/** Dołączenie pliku do załącznika wniosku (0103, 0104); plik żyje w IndexedDB do wysłania wniosku. */
export async function dolaczPlikDoWniosku(id: IdWniosku, idZalacznika: string, plik: File, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const kod = walidujPlik({ typ: plik.type, rozmiar: plik.size });
  if (kod !== null) return { ok: false, kod };
  const k = kontekstWysylki(id);
  if (k === null) return { ok: false, kod: '0003' };
  let idPliku: string;
  try {
    idPliku = await zapiszPlik(plik, { nazwa: plik.name, wlasciciel: k.pesel });
  } catch (blad) {
    if (czyBladZapisu(blad)) return { ok: false, kod: '0003' };
    throw blad;
  }
  const opis: PlikZalacznika = { idPliku, nazwa: plik.name, rozmiar: plik.size, typ: plik.type as PlikZalacznika['typ'] };
  let poprzedni: string | undefined;
  const wynik = wykonajOperacjeZWynikiem(() => {
    const biezacy = kontekstWysylki(id);
    if (biezacy === null) return { ok: false, kod: '0003' };
    poprzedni = biezacy.wniosek.zalaczniki.find((z) => z.id === idZalacznika)?.plik?.idPliku;
    const zalaczniki = biezacy.wniosek.zalaczniki.some((z) => z.id === idZalacznika)
      ? biezacy.wniosek.zalaczniki.map((z) => (z.id === idZalacznika ? { ...z, plik: opis } : z))
      : [...biezacy.wniosek.zalaczniki, { id: idZalacznika, rodzaj: idZalacznika, wymagany: false, plik: opis }];
    zamienWniosek(biezacy.rodzina.idRodziny, { ...biezacy.wniosek, zalaczniki, zaktualizowano: ctx.teraz });
    return { ok: true, wartosc: undefined };
  });
  if (!wynik.ok) await usunPlik(idPliku).catch(() => undefined);
  else if (poprzedni) await usunPlik(poprzedni).catch(() => undefined);
  return wynik;
}

/** Usunięcie dołączonego pliku z załącznika wniosku. */
export async function usunPlikZWniosku(id: IdWniosku, idZalacznika: string, ctx: KontekstOperacji): Promise<WynikOperacji> {
  let idPliku: string | undefined;
  const wynik = wykonajOperacjeZWynikiem(() => {
    const k = kontekstWysylki(id);
    if (k === null) return { ok: false, kod: '0003' };
    idPliku = k.wniosek.zalaczniki.find((z) => z.id === idZalacznika)?.plik?.idPliku;
    const zalaczniki = k.wniosek.zalaczniki.map((z) => (z.id === idZalacznika ? { ...z, plik: undefined } : z));
    zamienWniosek(k.rodzina.idRodziny, { ...k.wniosek, zalaczniki, zaktualizowano: ctx.teraz });
    return { ok: true, wartosc: undefined };
  });
  if (wynik.ok && idPliku) await usunPlik(idPliku).catch(() => undefined);
  return wynik;
}
