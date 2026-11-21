// Przejścia do kanałów i oznaczanie spraw jako załatwionych (kontrakt, sekcja 6.5). Właściciel: u17 (Instrukcje spraw i przejścia do kanałów).
// Status sprawy zmienia wyłącznie operacja Planu rodzica ustawStatusSprawy (u08); przeliczenie rodziny wykonuje ta operacja.
import { adresProdukcyjnyKanalu, type KanalProdukcyjny } from '@/dane/parametry-produkcyjne';
import { ADRESY_SYMULOWANE, rodzajOznaczenia, wybierzKanal } from '@/domena/przewodnik/kanaly';
import type { IdSprawy, KontekstOperacji, PozycjaPlanu, StanRodziny, WynikOperacji } from '@/domena/typy';
import { ustawStatusSprawy } from '@/dane/magazyn/operacje/plan';
import {
  czySymulacja,
  odczytajKatalog,
  odczytajParametry,
  odczytajSesje,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienStanSesji,
} from '@/dane/magazyn/stan';

/** Symulowane adresy serwisów spoza katalogu (PUE/eZUS, e-wizyta). */
const ADRESY_SYMULOWANE_POZOSTALE: Record<Exclude<KanalProdukcyjny, keyof typeof ADRESY_SYMULOWANE>, string> = {
  'pue-ezus': '/kanal/pue-ezus',
  'e-wizyta': '/kanal/e-wizyta',
};

function adresSymulowany(kanal: KanalProdukcyjny): string {
  return kanal in ADRESY_SYMULOWANE
    ? ADRESY_SYMULOWANE[kanal as keyof typeof ADRESY_SYMULOWANE]
    : ADRESY_SYMULOWANE_POZOSTALE[kanal as keyof typeof ADRESY_SYMULOWANE_POZOSTALE];
}

function rodzinaZalogowanego(): StanRodziny | null {
  const zalogowany = odczytajZalogowanego();
  return zalogowany === null ? null : rodzinaKonta(zalogowany.stanKonta.konto);
}

function sprawaWPlanie(rodzina: StanRodziny | null, idSprawy: IdSprawy): PozycjaPlanu | null {
  return rodzina?.plan?.pozycje.find((p) => p.idSprawy === idSprawy) ?? null;
}

/**
 * Adres kanału sprawy i zapis oczekującego powrotu z kanału w Stanie sesji. W trybie demonstracyjnym
 * adres prowadzi do symulowanego serwisu, poza nim do adresu z instrukcji pozycji albo z parametrów
 * produkcyjnych. Przełącznik kanalNiedostepny daje 0035, a widok zostaje na instrukcji.
 */
export function przejdzDoKanalu(
  idSprawy: IdSprawy,
  kanal: KanalProdukcyjny,
  ctx: KontekstOperacji,
): WynikOperacji<{ adres: string }> {
  if (czySymulacja('kanalNiedostepny')) return { ok: false, kod: '0035' };
  const parametry = odczytajParametry();
  const rodzina = rodzinaZalogowanego();
  const sprawa = sprawaWPlanie(rodzina, idSprawy);

  let adres: string | null = null;
  if (rodzina !== null && sprawa !== null) {
    const wybor = wybierzKanal(sprawa, rodzina.daneRodziny, odczytajKatalog(), {
      demonstracyjny: parametry.trybDemonstracyjny,
      mobywatelZainstalowany: parametry.trybDemonstracyjny && parametry.symulacje.mobywatelZainstalowany,
    });
    if (wybor.typ === 'zewnetrzny' && wybor.kanal === kanal) adres = wybor.adres;
  }
  if (adres === null) {
    adres = parametry.trybDemonstracyjny ? adresSymulowany(kanal) : (adresProdukcyjnyKanalu(kanal) ?? adresSymulowany(kanal));
  }

  const sesja = odczytajSesje();
  if (sesja !== null) {
    zmienStanSesji(sesja.idSesji, (stan) => ({
      ...stan,
      oczekujacyPowrotZKanalu: { idSprawy, kanal, otwarto: ctx.teraz },
    }));
  }
  return { ok: true, wartosc: { adres } };
}

/** Usuwa oczekujący powrót z kanału, gdy rodzic rezygnuje z oznaczenia albo zamyka arkusz. */
export function porzucPowrotZKanalu(ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  const sesja = odczytajSesje();
  if (sesja === null) return { ok: true, wartosc: undefined };
  zmienStanSesji(sesja.idSesji, (stan) => {
    const { oczekujacyPowrotZKanalu, ...reszta } = stan;
    void oczekujacyPowrotZKanalu;
    return reszta;
  });
  return { ok: true, wartosc: undefined };
}

/**
 * Oznaczenie sprawy przez rodzica: świadczenie jako złożone, pozostałe rodzaje jako załatwione
 * (rodzajOznaczenia), ze źródłem statusu odpowiedź rodzica. Błąd zapisu zostawia status bez zmian (0003).
 */
export function oznaczSpraweJakoZalatwiona(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji {
  const sprawa = sprawaWPlanie(rodzinaZalogowanego(), idSprawy);
  if (sprawa === null) return { ok: false, kod: '0003' };
  const wynik = wykonajOperacjeZWynikiem(() =>
    ustawStatusSprawy(idSprawy, rodzajOznaczenia(sprawa.rodzaj), 'odpowiedz-rodzica', ctx),
  );
  if (wynik.ok) porzucPowrotZKanalu(ctx);
  return wynik;
}

/** Cofnięcie oznaczenia: sprawa wraca do statusu do zrobienia, a termin do kalendarza i przypomnień. */
export function cofnijOznaczenie(idSprawy: IdSprawy, ctx: KontekstOperacji): WynikOperacji {
  const sprawa = sprawaWPlanie(rodzinaZalogowanego(), idSprawy);
  if (sprawa === null) return { ok: false, kod: '0003' };
  return wykonajOperacjeZWynikiem(() => ustawStatusSprawy(idSprawy, 'do-zrobienia', 'odpowiedz-rodzica', ctx));
}
