// Odczyt Danych z konta ZUS (kontrakt, sekcje 6.5 i 6.7). Właściciel: u00 → u03.
// Zaślepka fundamentu: kopiuje dane źródłowe konta z rejestru dane/konta-zus bez filtrów, opóźnienia
// i symulacji niedostępności, zapisuje kopię z datą odczytu i przelicza rodzinę konta.
// u03 zastępuje treść pliku z zachowaniem nazwy eksportu i podpisu (filtry odczytu, oznaczenie nowych
// dzieci, opóźnienie, niedostępność i użycie poprzedniej kopii).
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import type {
  DaneZKontaZus,
  KontekstOperacji,
  Pesel,
  WynikOperacji,
  ZnacznikCzasu,
  ZrodloweDaneKontaZus,
} from '@/domena/typy';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { odczytajStanKonta, odczytajStanZus, wykonajOperacje, zmienStanKonta } from '@/dane/magazyn/stan';

function kopiaBezFiltrow(zrodlo: ZrodloweDaneKontaZus, teraz: ZnacznikCzasu): DaneZKontaZus {
  return {
    odczytano: teraz,
    pesel: zrodlo.pesel,
    imie: zrodlo.imie,
    nazwisko: zrodlo.nazwisko,
    tytuly: zrodlo.tytuly,
    czlonkowieRodziny: zrodlo.czlonkowieRodziny.map((czlonek) => ({ ...czlonek, noweDziecko: false })),
    zasilki: zrodlo.zasilki,
    swiadczeniaRodzinne: zrodlo.swiadczeniaRodzinne,
    wnioski: zrodlo.wnioski,
    zaswiadczeniaEzla: zrodlo.zaswiadczeniaEzla,
    stanyRozliczen: [],
    zaswiadczeniaORozliczeniach: zrodlo.zaswiadczeniaORozliczeniach,
    korespondencja: zrodlo.korespondencja,
    pelnomocnictwa: zrodlo.pelnomocnictwa,
    ...(zrodlo.emailEzus === undefined ? {} : { emailEzus: zrodlo.emailEzus }),
    ...(zrodlo.adres === undefined ? {} : { adres: zrodlo.adres }),
  };
}

/**
 * Odczytuje Dane z konta ZUS konta przewodnika i zapisuje kopię ze stanem odczytu `udany`.
 * Konto bez danych w symulowanym ZUS (Administrator ZUS) kończy odczyt bez kopii.
 */
export async function odczytajDaneKontaZus(pesel: Pesel, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const stanKonta = odczytajStanKonta(pesel);
  if (stanKonta === null) return { ok: false, kod: '0001' };

  const zrodlo = zrodloweDaneKonta(pesel, odczytajStanZus(pesel), {
    imie: stanKonta.konto.imie,
    nazwisko: stanKonta.konto.nazwisko,
  });
  if (zrodlo === null) return { ok: true, wartosc: undefined };

  const kopia = kopiaBezFiltrow(zrodlo, ctx.teraz);
  // Odczyt kopii jest zapisem systemowym: symulacja błędu zapisu dotyczy operacji użytkownika.
  const zapis = wykonajOperacje(() => {
    zmienStanKonta(
      pesel,
      (s) => ({ ...s, kopiaDanychZus: kopia, stanOdczytuZus: { stan: 'udany', czas: ctx.teraz } }),
      'systemowe',
    );
  });
  if (!zapis.ok) return zapis;

  // Przeliczenie po zapisaniu kopii (sekcja 6.7); jego błąd zapisu nie unieważnia odczytu.
  const idRodziny = odczytajStanKonta(pesel)?.konto.idRodziny ?? null;
  if (idRodziny !== null) przeliczRodzine(idRodziny, ctx);
  return { ok: true, wartosc: undefined };
}
