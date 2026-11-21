// Filtr odczytu danych z konta ZUS `stanRozliczen` (kontrakt, sekcja 7.2; ANALIZY/17 R1, R2, R5, R6).
// Właściciel: u14. Konto z tytułem osoby prowadzącej pozarolniczą działalność dostaje stan rozliczeń
// na dzień odczytu i na dni powstania prawa nie późniejsze niż dzień odczytu: pierwszy dzień niezdolności
// z ostatniego e-ZLA i dzień urodzenia dziecka z danych członków rodziny. Oś zadłużenia trafia do kopii,
// żeby widok ustalił stan na dzień porodu z profilu rodziny.
import { dataZeZnacznika } from '@/domena/daty';
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';
import type { DataISO, StanRozliczenSkladek } from '@/domena/typy';
import { ostatnieZaswiadczenie, stanNaDzien } from '@/domena/zasilki/stan-rozliczen';
import '@/domena/zasilki/rozszerzenia-typow';

export const stanRozliczen: FiltrOdczytu = (kopia, w) => {
  const dzienOdczytu = dataZeZnacznika(w.teraz);
  const dzialalnosc = w.zrodlo.tytuly.filter((t) => t.rodzaj === 'dzialalnosc');
  const { osZadluzenia: pominietaOs, stanRozliczenNiedostepny: pominietyZnacznik, ...bezRozliczen } = kopia;
  void pominietaOs;
  void pominietyZnacznik;
  if (dzialalnosc.length === 0) return { ...bezRozliczen, stanyRozliczen: [] };
  if (w.zrodlo.stanRozliczenNiedostepny || !w.zrodlo.osZadluzenia) {
    return { ...bezRozliczen, stanyRozliczen: [], stanRozliczenNiedostepny: true };
  }

  const os = w.zrodlo.osZadluzenia;
  const poczatekDzialalnosci = dzialalnosc.map((t) => t.od).sort()[0];
  const stany: StanRozliczenSkladek[] = [stanNaDzien(os, dzienOdczytu, w.teraz)];
  const dodaj = (dzien: DataISO, zrodloDniaPrawa: StanRozliczenSkladek['zrodloDniaPrawa']) => {
    if (dzien > dzienOdczytu || dzien < poczatekDzialalnosci) return;
    const indeks = stany.findIndex((s) => s.dzien === dzien);
    if (indeks >= 0) {
      if (!stany[indeks].zrodloDniaPrawa) stany[indeks] = { ...stany[indeks], zrodloDniaPrawa };
      return;
    }
    stany.push({ ...stanNaDzien(os, dzien, w.teraz), zrodloDniaPrawa });
  };

  const ostatnie = ostatnieZaswiadczenie(w.zrodlo.zaswiadczeniaEzla);
  if (ostatnie) dodaj(ostatnie.od, 'e-zla');
  for (const czlonek of w.zrodlo.czlonkowieRodziny) dodaj(czlonek.dataUrodzenia, 'porod');

  return { ...bezRozliczen, stanyRozliczen: stany, osZadluzenia: os };
};
