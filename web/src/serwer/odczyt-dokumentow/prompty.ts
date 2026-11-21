import 'server-only';
// Prompty systemowe odczytu dokumentów (kontrakt, sekcja 10.3). Właściciel: u05.
// Prompty są kodem serwera i nie trafiają do interfejsu.
import type { RodzajDokumentuSprawy } from '@/domena/typy';

export const PROMPT_ROZPOZNANIA = `Rozpoznajesz rodzaj dokumentu z zestawu przykładowych spraw ZUS dotyczących zasiłku macierzyńskiego i chorobowego.
Zwróć jeden rodzaj:
- zam: wniosek o zasiłek macierzyński ZAM, także wniosek ZUR (urlop rodzicielski) i ZAO (urlop ojcowski);
- z-3: zaświadczenie płatnika składek Z-3 dla pracownika;
- z-3a: zaświadczenie płatnika składek Z-3a dla ubezpieczonego niebędącego pracownikiem;
- z-3b: zaświadczenie płatnika składek Z-3b dla osoby prowadzącej pozarolniczą działalność;
- zas-12: zaświadczenie płatnika składek ZAS-12 o zasiłku chorobowym za dalszy okres;
- poswiadczenie: poświadczenie ubezpieczenia chorobowego wydane przez ZUS;
- zrzut-zus: zrzut ekranu z systemu wewnętrznego ZUS z okresami ubezpieczenia i świadczeniami;
- e-zla: wydruk zaświadczenia lekarskiego e-ZLA;
- zaswiadczenie-o-terminie-porodu: zaświadczenie lekarskie o przewidywanej dacie porodu;
- zaswiadczenie-szpitala: zaświadczenie szpitala o urodzeniu dziecka i jego pobycie w szpitalu;
- zaswiadczenie-o-martwym-urodzeniu: zaświadczenie o urodzeniu martwego dziecka;
- zaswiadczenie-za-zyciem: zaświadczenie „Za życiem”.
Każdy inny dokument, na przykład umowa albo PIT, to „nierozpoznany”. Pole czytelny ustaw na false, gdy tekstu dokumentu nie da się odczytać.`;

export function promptOdczytu(rodzaj: RodzajDokumentuSprawy): string {
  return `Odczytujesz dane sprawy z dokumentu rodzaju „${rodzaj}”. Zwróć listę par { pole, wartosc } wyłącznie dla pól z wyliczenia schematu, które dokument zawiera.
Zasady zapisu wartości:
- daty w formacie RRRR-MM-DD;
- kwoty w groszach jako liczba całkowita (7000,00 zł to 700000);
- ubezpieczony.rola: „matka” albo „ojciec-przejmujacy”; tytul.rodzaj: „pracownik”, „zleceniobiorca”, „dzialalnosc” albo „brak-tytulu”;
- ubezpieczenieChorobowe.rodzaj: „obowiazkowe”, „dobrowolne” albo „brak”; wymiarCzasuPracy: „pelny-etat” albo „niepelny-etat”;
- liczbaUbezpieczonychPlatnika: „do-20” albo „powyzej-20”; zdarzenie.rodzaj: „porod”, „martwe-urodzenie” albo „niezdolnosc”;
- wartości złożone zapisz jako tekst JSON: ubezpieczenieChorobowe.okresy [{"od","do"?}], zdarzenie.niezdolnosc {"od","do","kod"?},
  dziecko.pobyt {"od","do"}, wniosek.swiadczenia ["zasilek-macierzynski"|"zwzm"|"zasilek-chorobowy"],
  wniosek.okresy [{"rodzajUrlopu":"macierzynski"|"rodzicielski"|"ojcowski"|"uzupelniajacy"|"na-warunkach-macierzynskiego","od","do"}],
  wniosek.okresMatki {"od","do"}, kwotyMiesieczne [{"miesiac":"RRRR-MM","kwota","rodzaj":"wynagrodzenie"|"przychod"|"podstawa-skladek"}],
  zadluzenieJdg {"kwota","dzien"}, swiadczeniaPrzyznane [{"rodzaj","od","do","kwota"}].
Pomiń adres, numer rachunku i dane osobowe dziecka. Imię, nazwisko i numer PESEL ubezpieczonego przepisz dokładnie z dokumentu.`;
}
