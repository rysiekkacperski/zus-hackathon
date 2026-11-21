// Sytuacje szczególne i spokojny tryb (kontrakt, sekcja 6.5). Właściciel: u25 (Sytuacje szczególne i spokojny tryb).
// Zapis sytuacji przez konto Rodzic albo Drugi rodzic z udzieloną zgodą na dane dotyczące zdrowia, włączenie
// i wyłączenie spokojnego trybu dla całej rodziny oraz przeliczenie planu, terminów i przypomnień obojga rodziców.
import { czyMaZgode } from '@/domena/konto';
import { idZLosowych } from '@/domena/numery';
import {
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
import { odczytajZalogowanego, rodzinaKonta, wykonajOperacjeZWynikiem, zmienStanRodziny } from '@/dane/magazyn/stan';

interface KontoZRodzina {
  pesel: string;
  rodzina: StanRodziny;
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
    const bledy = walidujSytuacje(dane, rodzina.daneCiazy, ctx.dzis);
    const pierwszy = bledy.rodzaj ?? bledy.dataZdarzenia ?? bledy.liczbaDzieci;
    if (pierwszy) return { ok: false, kod: pierwszy, bledyPol: bledy as Record<string, KodKomunikatu> };
    const zgloszenie = zgloszenieZFormularza(dane, rodzina.daneCiazy, ctx.dzis);
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
    return { ok: true, wartosc: zgloszenie };
  });
  if (wynik.ok) ustawKomunikatPoPrzejsciu({ kod: '0126', dlaWidoku: 'ViewFamilyPlan' });
  return wynik;
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
