// Kreator wniosku o zasiłek chorobowy ZAS-53 (kontrakt, sekcja 6.5). Właściciel: u30 (Kreator wniosku o zasiłek chorobowy ZAS-53).
// Szkic wniosku w grupie Wnioski rodziny, zapis kroków, dołączanie plików i wysyłka do ZUS (w trybie demonstracyjnym
// numer ZAS53-DEMO-RRRRMMDD-NNNN). Status sprawy K24 zmienia operacja planu ustawStatusSprawy.
import { kluczZaswiadczenia, zaswiadczenieZEzla } from '@/domena/wnioski/zas53';
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
  WniosekZas53,
  WynikOperacji,
} from '@/domena/typy';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { nastepnyNumerPotwierdzenia } from '@/dane/magazyn/operacje/konto';
import { ustawStatusSprawy } from '@/dane/magazyn/operacje/plan';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { usunPlik, zapiszPlik } from '@/dane/magazyn/pliki';
import {
  czySymulacja,
  czyTrybDemonstracyjny,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanRodziny,
  zmienStanZus,
} from '@/dane/magazyn/stan';

/** Miejsce rozpoczęcia wniosku: sprawa planu i zaświadczenie e-ZLA wybrane w oknie ModalSickLeaveDetails. */
export interface StartWnioskuZas53 {
  idSprawy?: IdSprawy;
  seriaINumer?: string;
}

const SPRAWA_ZAS53: IdSprawy = 'K24';

function kontekstZalogowanego(): { rodzina: StanRodziny; pesel: string; rola: WniosekZas53['rola'] } | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const konto = zalogowany.stanKonta.konto;
  const rodzina = rodzinaKonta(konto);
  if (rodzina === null) return null;
  return { rodzina, pesel: konto.pesel, rola: konto.rola };
}

/** Szkic wniosku ZAS-53 zalogowanego konta (najpóźniej zaktualizowany). */
export function szkicZas53(rodzina: StanRodziny, pesel: string): WniosekZas53 | undefined {
  return rodzina.wnioski
    .filter((w): w is WniosekZas53 => w.rodzaj === 'zas-53' && w.stan === 'szkic' && w.konto === pesel)
    .sort((a, b) => b.zaktualizowano.localeCompare(a.zaktualizowano))[0];
}

function zapiszWniosek(rodzina: StanRodziny, wniosek: WniosekZas53): void {
  zmienStanRodziny(rodzina.idRodziny, (s) => ({
    ...s,
    wnioski: s.wnioski.some((w) => w.idWniosku === wniosek.idWniosku)
      ? s.wnioski.map((w) => (w.idWniosku === wniosek.idWniosku ? wniosek : w))
      : [...s.wnioski, wniosek],
  }));
}

/**
 * Nowy szkic wniosku ZAS-53 albo szkic zapisany wcześniej. Zaświadczenie z okna ModalSickLeaveDetails
 * zastępuje wybór w szkicu i prowadzi na ekran wyboru zaświadczenia.
 */
export function rozpocznijLubWznowZas53(dane: StartWnioskuZas53, ctx: KontekstOperacji): WynikOperacji<WniosekZas53> {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstZalogowanego();
    if (k === null) return { ok: false, kod: '0003' };
    const istniejacy = szkicZas53(k.rodzina, k.pesel);
    const kopia = odczytajZalogowanego()?.stanKonta.kopiaDanychZus ?? null;
    const wybrane = dane.seriaINumer
      ? kopia?.zaswiadczeniaEzla.find((z) => kluczZaswiadczenia(z.seriaINumer) === kluczZaswiadczenia(dane.seriaINumer))
      : undefined;

    if (istniejacy && !wybrane) return { ok: true, wartosc: istniejacy };

    const baza: WniosekZas53 = istniejacy ?? {
      idWniosku: idZLosowych('W', ctx.teraz, losowyCiag(6)),
      rodzaj: 'zas-53',
      idSprawy: dane.idSprawy ?? SPRAWA_ZAS53,
      konto: k.pesel,
      rola: k.rola,
      stan: 'szkic',
      ostatniEkran: 'ViewZas53Certificate',
      utworzono: ctx.teraz,
      zaktualizowano: ctx.teraz,
      zalaczniki: [],
      oswiadczeniePotwierdzone: false,
    };
    const wniosek: WniosekZas53 = wybrane
      ? { ...baza, zaswiadczenie: zaswiadczenieZEzla(wybrane), okresPrawa: undefined, ostatniEkran: 'ViewZas53Certificate', zaktualizowano: ctx.teraz }
      : baza;
    zapiszWniosek(k.rodzina, wniosek);
    const przeliczenie = przeliczRodzine(k.rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: wniosek };
  });
}

/** Zapis odpowiedzi z ekranu kreatora i ostatniego wyświetlonego ekranu szkicu. */
export function zapiszKrokZas53(
  id: IdWniosku,
  zmiana: Partial<WniosekZas53>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekZas53> {
  return wykonajOperacjeZWynikiem(() => {
    const k = kontekstZalogowanego();
    if (k === null) return { ok: false, kod: '0003' };
    const obecny = k.rodzina.wnioski.find((w): w is WniosekZas53 => w.idWniosku === id && w.rodzaj === 'zas-53');
    if (!obecny || obecny.stan !== 'szkic') return { ok: false, kod: '0003' };
    const wniosek: WniosekZas53 = {
      ...obecny,
      ...zmiana,
      idWniosku: obecny.idWniosku,
      rodzaj: 'zas-53',
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

/**
 * Dołączenie pliku do pozycji załącznika (0103, 0104). Plik trafia do magazynu plików i żyje do wysłania wniosku;
 * wcześniejszy plik tej pozycji jest usuwany.
 */
export async function dolaczPlikZas53(
  id: IdWniosku,
  idZalacznika: string,
  plik: File,
  ctx: KontekstOperacji,
): Promise<WynikOperacji<WniosekZas53>> {
  const typ = plik.type === 'image/jpg' ? 'image/jpeg' : plik.type;
  const blad = walidujPlik({ typ, rozmiar: plik.size });
  if (blad) return { ok: false, kod: blad };
  const k = kontekstZalogowanego();
  const obecny = k?.rodzina.wnioski.find((w): w is WniosekZas53 => w.idWniosku === id && w.rodzaj === 'zas-53');
  if (!k || !obecny) return { ok: false, kod: '0003' };
  let idPliku: IdPliku;
  try {
    idPliku = await zapiszPlik(plik, { nazwa: plik.name, wlasciciel: k.pesel });
  } catch {
    return { ok: false, kod: '0003' };
  }
  const zapisany: PlikZalacznika = { idPliku, nazwa: plik.name, rozmiar: plik.size, typ: typ as PlikZalacznika['typ'] };
  const poprzedni = obecny.zalaczniki.find((z) => z.id === idZalacznika)?.plik;
  const wynik = zapiszKrokZas53(
    id,
    { zalaczniki: obecny.zalaczniki.map((z) => (z.id === idZalacznika ? { ...z, plik: zapisany } : z)) },
    obecny.ostatniEkran ?? 'ViewZas53Summary',
    ctx,
  );
  if (!wynik.ok) {
    await usunPlik(idPliku).catch(() => undefined);
    return wynik;
  }
  if (poprzedni) await usunPlik(poprzedni.idPliku).catch(() => undefined);
  return wynik;
}

/** Wysłanie wniosku do ZUS (0043 bez oświadczenia, 0044 przy niedostępnym kanale, szkic zachowany). */
export async function wyslijZas53(id: IdWniosku, ctx: KontekstOperacji): Promise<WynikOperacji<{ potwierdzenie: string }>> {
  const k = kontekstZalogowanego();
  const obecny = k?.rodzina.wnioski.find((w): w is WniosekZas53 => w.idWniosku === id && w.rodzaj === 'zas-53');
  if (!k || !obecny || obecny.stan !== 'szkic') return { ok: false, kod: '0003' };
  if (!obecny.oswiadczeniePotwierdzone) return { ok: false, kod: '0043' };
  if (obecny.zalaczniki.some((z) => z.wymagany && !z.plik)) return { ok: false, kod: '0149' };
  // Kanał wniosków eZUS: prototyp wysyła wyłącznie w trybie demonstracyjnym; poza nim kanał jest niedostępny.
  if (!czyTrybDemonstracyjny() || czySymulacja('wysylkaDoZusNiedostepna')) return { ok: false, kod: '0044' };

  const pliki = obecny.zalaczniki.flatMap((z) => (z.plik ? [z.plik.idPliku] : []));
  const wynik = wykonajOperacjeZWynikiem<{ potwierdzenie: string }>(() => {
    const potwierdzenie = nastepnyNumerPotwierdzenia('ZAS53-DEMO', ctx.dzis);
    const wyslany: WniosekZas53 = {
      ...obecny,
      stan: 'wyslany',
      adresat: 'zus',
      dataZlozenia: ctx.dzis,
      potwierdzenie,
      zaktualizowano: ctx.teraz,
      zalaczniki: obecny.zalaczniki.map(({ plik, ...z }) => (plik ? { ...z, nazwaPoWyslaniu: plik.nazwa } : z)),
    };
    zapiszWniosek(k.rodzina, wyslany);
    zmienStanZus(k.pesel, (s) => ({
      ...s,
      wnioskiZPrzewodnika: [
        ...s.wnioskiZPrzewodnika.filter((w) => w.idWnioskuPrzewodnika !== id),
        {
          idWniosku: potwierdzenie,
          rodzaj: 'zasilek-chorobowy',
          kanal: 'przewodnik',
          dataZlozenia: ctx.dzis,
          status: 'zlozony',
          idWnioskuPrzewodnika: id,
        },
      ],
    }));
    // Status sprawy zmienia właściciel planu; ustawStatusSprawy przelicza rodzinę.
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
