// Tworzenie i odczyt Powiadomień (kontrakt, sekcje 5.4 i 6.5). Właściciel: u00 (tworzenie),
// u18 (planowanie i doręczanie przypomnień). Doręczenie jest symulowane: powiadomienie trafia do
// Powiadomień konta docelowego, które pokazuje skrzynka demonstracyjna.
import { idZLosowych } from '@/domena/numery';
import type { KontekstOperacji, Pesel, Powiadomienie, WynikOperacji } from '@/domena/typy';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import {
  czyTrybDemonstracyjny,
  odczytajStanKonta,
  peseleKontPrzewodnika,
  wykonajOperacjeZWynikiem,
  zalogowanyPesel,
  zmienStanKonta,
} from '@/dane/magazyn/stan';

export type NowePowiadomienie = Omit<Powiadomienie, 'id' | 'statusDoreczenia' | 'statusOdczytu'>;

/**
 * Tworzy powiadomienie na koncie docelowym. Powiadomienie z chwilą wysyłki nie późniejszą niż teraz
 * dostaje status `wyslane` (doręczenie symulowane), późniejsze czeka jako `zaplanowane` na doręczenie (u18).
 * Konto docelowe bez konta przewodnika nie dostaje powiadomienia: wynik ma status `pominiete`.
 */
export function utworzPowiadomienie(p: NowePowiadomienie, ctx: KontekstOperacji): WynikOperacji<Powiadomienie> {
  const natychmiast = p.planowanaWysylka <= ctx.teraz;
  const powiadomienie: Powiadomienie = {
    ...p,
    id: idZLosowych('POW', ctx.teraz, losowyCiag(6)),
    statusDoreczenia: natychmiast ? 'wyslane' : 'zaplanowane',
    statusOdczytu: 'nieodczytane',
    ...(natychmiast ? { wyslano: ctx.teraz } : {}),
  };
  if (odczytajStanKonta(p.kontoDocelowe) === null) {
    return {
      ok: true,
      wartosc: { ...powiadomienie, statusDoreczenia: 'pominiete', powodPominiecia: 'brak-konta-przewodnika' },
    };
  }
  return wykonajOperacjeZWynikiem(() => {
    zmienStanKonta(p.kontoDocelowe, (s) => ({ ...s, powiadomienia: [...s.powiadomienia, powiadomienie] }));
    return { ok: true, wartosc: powiadomienie };
  });
}

function kontoZPowiadomieniem(id: string): Pesel | null {
  const zalogowany = zalogowanyPesel();
  const kandydaci = zalogowany === null ? [] : [zalogowany];
  // Skrzynka demonstracyjna pokazuje powiadomienia dowolnego konta, więc w trybie demonstracyjnym
  // szukamy powiadomienia na wszystkich kontach przewodnika.
  if (czyTrybDemonstracyjny()) kandydaci.push(...peseleKontPrzewodnika());
  return kandydaci.find((pesel) => odczytajStanKonta(pesel)?.powiadomienia.some((p) => p.id === id)) ?? null;
}

/** Oznacza powiadomienie jako odczytane na koncie zalogowanego użytkownika (albo dowolnym w trybie demo). */
export function oznaczOdczytane(id: string, ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  const pesel = kontoZPowiadomieniem(id);
  if (pesel === null) return { ok: true, wartosc: undefined };
  return wykonajOperacjeZWynikiem(() => {
    zmienStanKonta(pesel, (s) => ({
      ...s,
      powiadomienia: s.powiadomienia.map((p) => (p.id === id ? { ...p, statusOdczytu: 'odczytane' } : p)),
    }));
    return { ok: true, wartosc: undefined };
  });
}
