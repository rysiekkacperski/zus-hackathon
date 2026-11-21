// Decyzje z kalkulatorów wariantu zasiłku i podziału urlopu (kontrakt, sekcja 6.5).
// Właściciel: u26 (Kalkulatory wariantu zasiłku i podziału urlopu).
// Zapis trafia do Wyników kalkulacji rodziny (plan podziału widzą oboje rodzice), a wybrany wariant sprawy
// K07, K08 albo K10 ustawia operacja Planu rodzica zapiszWybranyWariant (u08), która przelicza rodzinę.
import { dodajDni } from '@/domena/daty';
import type {
  KontekstOperacji,
  StanRodziny,
  WynikiKalkulacji,
  WynikOperacji,
  ZapisPodzialuUrlopu,
  ZapisPorownaniaWariantow,
} from '@/domena/typy';
import { zapiszWybranyWariant } from '@/dane/magazyn/operacje/plan';
import { odczytajZalogowanego, rodzinaKonta, wykonajOperacjeZWynikiem, zmienStanRodziny } from '@/dane/magazyn/stan';

const WYNIKI_PUSTE: WynikiKalkulacji = { scenariusze: [], porownaniaWariantow: [], podzialyUrlopu: [], nastepnyNumer: 1 };

function wynikiRodziny(s: StanRodziny): WynikiKalkulacji {
  return s.wynikiKalkulacji ?? WYNIKI_PUSTE;
}

function zalogowanaRodzina(): { pesel: string; rodzina: StanRodziny } | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const rodzina = rodzinaKonta(zalogowany.stanKonta.konto);
  return rodzina === null ? null : { pesel: zalogowany.stanKonta.konto.pesel, rodzina };
}

/** Okresy urlopów matki dla wybranego wariantu: macierzyński od dnia porodu i rodzicielski po nim. */
function okresyWariantu(zapis: Omit<ZapisPorownaniaWariantow, 'id' | 'zapisano' | 'konto'>, tygodnieMacierzynskiego: number) {
  const koniecMacierzynskiego = dodajDni(zapis.dataPorodu, tygodnieMacierzynskiego * 7 - 1);
  const poczatekRodzicielskiego = dodajDni(koniecMacierzynskiego, 1);
  const okresMacierzynski = { od: zapis.dataPorodu, do: koniecMacierzynskiego };
  const okresyRodzicielskie =
    zapis.tygodniePrzedPowrotem > 0
      ? [{ od: poczatekRodzicielskiego, do: dodajDni(poczatekRodzicielskiego, zapis.tygodniePrzedPowrotem * 7 - 1) }]
      : [];
  return { okresMacierzynski, okresyRodzicielskie };
}

/**
 * Zapis decyzji o wariancie zasiłku (R8): rekord porównania w Wynikach kalkulacji z danymi wejściowymi
 * i wybrany wariant sprawy K07 albo K08 w Pozycjach planu. Błąd zapisu daje 0003 bez zmiany stanu.
 */
export function zapiszDecyzjeWariantu(
  zapis: Omit<ZapisPorownaniaWariantow, 'id' | 'zapisano' | 'konto'> & { tygodnieMacierzynskiego?: number },
  ctx: KontekstOperacji,
): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const dane = zalogowanaRodzina();
    if (dane === null) return { ok: false, kod: '0003' };
    const { tygodnieMacierzynskiego, ...bezDodatkow } = zapis;
    const rekord: ZapisPorownaniaWariantow = {
      ...bezDodatkow,
      id: `WAR-${zapis.sprawa}-${ctx.teraz}`,
      zapisano: ctx.dzis,
      konto: dane.pesel,
    };
    zmienStanRodziny(dane.rodzina.idRodziny, (s) => {
      const wyniki = wynikiRodziny(s);
      return { ...s, wynikiKalkulacji: { ...wyniki, porownaniaWariantow: [...wyniki.porownaniaWariantow, rekord] } };
    });
    const okresy = okresyWariantu(zapis, tygodnieMacierzynskiego ?? 20);
    return zapiszWybranyWariant(
      { sprawa: zapis.sprawa, wariant: zapis.decyzja, zapisano: ctx.dzis, zrodlo: 'kalkulator-wariantu', ...okresy },
      ctx,
    );
  });
}

/**
 * Zapis planu podziału urlopu rodzicielskiego (R12): rekord w Wynikach kalkulacji rodziny z danymi wejściowymi,
 * podziałem, wynikiem, kontem i datą zapisu oraz wybrany wariant sprawy K10 z liczbą tygodni każdego rodzica.
 */
export function zapiszPlanPodzialu(
  zapis: Omit<ZapisPodzialuUrlopu, 'id' | 'zapisano' | 'konto'>,
  ctx: KontekstOperacji,
): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const dane = zalogowanaRodzina();
    if (dane === null) return { ok: false, kod: '0003' };
    const rekord: ZapisPodzialuUrlopu = { ...zapis, id: `POD-${ctx.teraz}`, zapisano: ctx.dzis, konto: dane.pesel };
    zmienStanRodziny(dane.rodzina.idRodziny, (s) => {
      const wyniki = wynikiRodziny(s);
      return { ...s, wynikiKalkulacji: { ...wyniki, podzialyUrlopu: [...wyniki.podzialyUrlopu, rekord] } };
    });
    return zapiszWybranyWariant(
      {
        sprawa: 'K10',
        tygodnieMatki: zapis.tygodnieMatki,
        tygodnieDrugiegoRodzica: zapis.tygodnieDrugiegoRodzica,
        zapisal: dane.pesel,
        zapisano: ctx.dzis,
      },
      ctx,
    );
  });
}
