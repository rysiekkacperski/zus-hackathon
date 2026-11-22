// Sytuacje szczególne i spokojny tryb (kontrakt, sekcja 6.5). Właściciel: u25 (Sytuacje szczególne i spokojny tryb).
// Zapis sytuacji przez konto Rodzic albo Drugi rodzic z udzieloną zgodą na dane dotyczące zdrowia, włączenie
// i wyłączenie spokojnego trybu dla całej rodziny oraz przeliczenie planu, terminów i przypomnień obojga rodziców.
import { czyMaZgode } from '@/domena/konto';
import { idZLosowych } from '@/domena/numery';
import {
  dopiszZaswiadczenieWDanychCiazy,
  walidujSytuacje,
  wylaczSpokojnyTrybWDanychCiazy,
  zapiszSytuacjeWDanychCiazy,
  zgloszenieZFormularza,
  type FormularzSytuacji,
  type ZgloszenieSytuacji,
} from '@/domena/rodzina/sytuacje';
import type { KodKomunikatu, KontekstOperacji, StanRodziny, WynikOperacji } from '@/domena/typy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajStanKonta,
  odczytajZalogowanego,
  osobyRodziny,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienKonto,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';

interface KontoZRodzina {
  pesel: string;
  rodzina: StanRodziny;
}

/**
 * Czy konto ojca zapisuje sytuację bez zgody konta matki na dane dotyczące zdrowia (warunek komunikatu 0277).
 * Konto matki zapisuje sytuacje na podstawie własnej zgody.
 */
export function brakZgodyMatkiDlaKonta(pesel: string, rodzina: StanRodziny): boolean {
  const peselMatki = osobyRodziny(rodzina.daneRodziny).peselMatki;
  if (peselMatki === pesel) return false;
  const kontoMatki = peselMatki ? (odczytajStanKonta(peselMatki)?.konto ?? null) : null;
  return kontoMatki === null || !czyMaZgode(kontoMatki.decyzjeOZgodzie);
}

/**
 * Role kont po zapisaniu śmierci matki: konto matki z rolą Rodzic przekazuje rolę Rodzic drugiemu rodzicowi,
 * a konto matki dostaje rolę Nowy użytkownik i traci dostęp do planu rodziny.
 */
function zmienRolePoSmierciMatki(rodzina: StanRodziny): void {
  const osoby = osobyRodziny(rodzina.daneRodziny);
  if (!osoby.peselMatki) return;
  const kontoMatki = odczytajStanKonta(osoby.peselMatki)?.konto ?? null;
  if (kontoMatki === null) return;
  if (kontoMatki.rola === 'rodzic' && osoby.peselDrugiegoRodzica) {
    zmienKonto(osoby.peselDrugiegoRodzica, (k) => (k.rola === 'drugi-rodzic' ? { ...k, rola: 'rodzic' } : k));
  }
  if (kontoMatki.rola === 'rodzic' || kontoMatki.rola === 'drugi-rodzic') {
    zmienKonto(osoby.peselMatki, (k) => ({ ...k, rola: 'nowy-uzytkownik', idRodziny: null }));
  }
}

/** Konto Rodzic albo Drugi rodzic z widoczną rodziną; brak zgody daje 0004. */
function kontoZapisujace(): { ok: true; wartosc: KontoZRodzina } | { ok: false; kod: KodKomunikatu } {
  const zalogowany = odczytajZalogowanego();
  const konto = zalogowany?.stanKonta.konto ?? null;
  if (konto === null || (konto.rola !== 'rodzic' && konto.rola !== 'drugi-rodzic')) return { ok: false, kod: '0003' };
  if (!czyMaZgode(konto.decyzjeOZgodzie)) return { ok: false, kod: '0004' };
  const rodzina = rodzinaKonta(konto);
  if (rodzina === null) return { ok: false, kod: '0003' };
  return { ok: true, wartosc: { pesel: konto.pesel, rodzina } };
}

/**
 * Zapisuje sytuację szczególną w Danych ciąży i dziecka rodziny, włącza spokojny tryb i przelicza rodzinę.
 * Po zapisie ustawia komunikat 0126 dla ViewFamilyPlan.
 */
export function zapiszSytuacjeSzczegolna(dane: FormularzSytuacji, ctx: KontekstOperacji): WynikOperacji<ZgloszenieSytuacji> {
  const wynik = wykonajOperacjeZWynikiem<ZgloszenieSytuacji>(() => {
    const konto = kontoZapisujace();
    if (!konto.ok) return konto;
    const { pesel, rodzina } = konto.wartosc;
    const brakZgodyMatki = brakZgodyMatkiDlaKonta(pesel, rodzina);
    const bledy = walidujSytuacje(dane, rodzina.daneCiazy, ctx.dzis, brakZgodyMatki);
    const pierwszy = bledy.rodzaj ?? bledy.dataZdarzenia ?? bledy.liczbaDzieci;
    if (pierwszy) return { ok: false, kod: pierwszy, bledyPol: bledy as Record<string, KodKomunikatu> };
    const zgloszenie = zgloszenieZFormularza(dane, rodzina.daneCiazy, ctx.dzis, brakZgodyMatki);
    if (zgloszenie === null) return { ok: false, kod: '0006' };

    const id = idZLosowych('SS', ctx.teraz, losowyCiag(4));
    zmienStanRodziny(rodzina.idRodziny, (s) => ({
      ...s,
      daneCiazy: zapiszSytuacjeWDanychCiazy(s.daneCiazy, zgloszenie, {
        id,
        kontoZapisujace: pesel,
        teraz: ctx.teraz,
        dzis: ctx.dzis,
      }),
    }));
    const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    if (zgloszenie.rodzaj === 'smierc-matki') zmienRolePoSmierciMatki(rodzina);
    return { ok: true, wartosc: zgloszenie };
  });
  if (wynik.ok) ustawKomunikatPoPrzejsciu({ kod: '0126', dlaWidoku: 'ViewFamilyPlan' });
  return wynik;
}

/**
 * Dopisuje zaświadczenie o martwym urodzeniu do zapisanego poronienia: rodzaj zmienia się na poronienie potwierdzone
 * zaświadczeniem, profil dostaje datę porodu, a plan przelicza się z K34 w miejscu K07 i K08.
 */
export function dopiszZaswiadczenieOMartwymUrodzeniu(idSytuacji: string, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const konto = kontoZapisujace();
    if (!konto.ok) return konto;
    const { rodzina } = konto.wartosc;
    if (rodzina.daneCiazy === null) return { ok: false, kod: '0003' };
    const nowe = dopiszZaswiadczenieWDanychCiazy(rodzina.daneCiazy, idSytuacji);
    if (nowe === null) return { ok: false, kod: '0003' };
    zmienStanRodziny(rodzina.idRodziny, (s) => ({ ...s, daneCiazy: nowe }));
    const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: undefined };
  });
}

/** Wyłącza spokojny tryb dla całej rodziny: sytuacje i plan zostają, przypomnienia wracają po przeliczeniu. */
export function wylaczSpokojnyTryb(ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const konto = kontoZapisujace();
    if (!konto.ok) return konto;
    const { rodzina } = konto.wartosc;
    if (rodzina.daneCiazy === null) return { ok: false, kod: '0003' };
    zmienStanRodziny(rodzina.idRodziny, (s) =>
      s.daneCiazy === null ? s : { ...s, daneCiazy: wylaczSpokojnyTrybWDanychCiazy(s.daneCiazy, ctx.dzis) },
    );
    const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: undefined };
  });
}
