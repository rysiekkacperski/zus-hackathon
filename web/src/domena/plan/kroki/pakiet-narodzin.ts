// Krok planu `pakietNarodzin` (kontrakt, sekcja 7.2). Właściciel: u19 (Pakiet narodzin).
// - K05 Zgłoszenie dziecka do ubezpieczenia zdrowotnego: załatwiona ze źródłem konto ZUS, gdy dziecko
//   z potwierdzoną datą porodu jest w Danych z konta ZUS matki;
// - K11 Uzupełniający urlop macierzyński: wymiar z danych dziecka (do 8 albo do 15 tygodni), a przy wyniku
//   „brak” sprawa wypada z planu;
// - sprawy urlopu rodzicielskiego (K07, K08, K10): wymiar urlopu rodzicielskiego z danych dziecka.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import { tygodnieUzupelniajacegoUrlopu } from '@/domena/rodzina/narodziny';
import type { DaneCiazyIDziecka, DaneZKontaZus, PozycjaPlanu, RodzicSprawy } from '@/domena/typy';

const SPRAWY_URLOPU_RODZICIELSKIEGO = ['K07', 'K08', 'K10'];

/** Czy dziecko urodzone w dniu potwierdzonej daty porodu jest w danych ZUS. */
function dzieckoWDanychZus(dane: DaneCiazyIDziecka, kopia: DaneZKontaZus | null): boolean {
  const dataPorodu = dane.dataPorodu;
  if (!dane.dataPoroduPotwierdzona || dataPorodu === undefined) return false;
  if (dane.dzieci.some((d) => d.zrodlo === 'konto-zus' && d.pesel !== undefined && (d.dataUrodzenia ?? dataPorodu) === dataPorodu)) {
    return true;
  }
  return (kopia?.czlonkowieRodziny ?? []).some((c) => c.dataUrodzenia === dataPorodu);
}

function rodzicSprawy(rodzic: string): RodzicSprawy {
  const znane: RodzicSprawy[] = ['matka', 'drugi-rodzic', 'oboje-rodzice', 'matka-albo-ojciec', 'rodzic-przyjmujacy'];
  return (znane as string[]).includes(rodzic) ? (rodzic as RodzicSprawy) : 'matka';
}

export const pakietNarodzin: KrokPlanu = (pozycje, w) => {
  const dane = w.daneCiazy;
  if (dane === null) return pozycje;

  let wynik: PozycjaPlanu[] = pozycje;

  // K05 załatwiona ze źródłem konto ZUS.
  if (dzieckoWDanychZus(dane, w.daneZusMatki)) {
    wynik = wynik.map((p) =>
      p.idPozycji === 'K05' && p.status === 'do-zrobienia'
        ? { ...p, status: 'zalatwiona', zrodloStatusu: 'dane-zus', dataOznaczenia: w.dzis }
        : p,
    );
  }

  // K11 z wymiarem uzupełniającego urlopu macierzyńskiego.
  const wymiar = dane.wymiarUzupelniajacegoUrlopu;
  const tygodnieK11 = tygodnieUzupelniajacegoUrlopu(wymiar);
  if (wymiar === 'brak') {
    wynik = wynik.filter((p) => p.idPozycji !== 'K11' || p.status !== 'do-zrobienia');
  } else if (tygodnieK11 !== null && dane.przyjecie === undefined) {
    // Po przyjęciu dziecka K11 rozstrzyga krok przyjecieDziecka (u24), więc pakiet nie dodaje jej do planu.
    const istnieje = wynik.some((p) => p.idPozycji === 'K11');
    const katalogowa = w.katalog.pozycje.find((p) => p.id === 'K11');
    if (!istnieje && katalogowa) {
      wynik = [
        ...wynik,
        {
          idSprawy: 'K11', idPozycji: 'K11', rodzaj: katalogowa.rodzaj, etap: katalogowa.etap,
          rodzic: rodzicSprawy(katalogowa.rodzic), status: 'do-zrobienia', zrodloStatusu: 'wyliczenie-planu',
          liczbaDzieci: dane.liczbaUrodzonychDzieci ?? 1, ostrzezenia: [], oznaczenia: [],
        },
      ];
    }
    wynik = wynik.map((p) => (p.idPozycji === 'K11' ? { ...p, dane: { ...p.dane, wymiarK11Tygodni: tygodnieK11 } } : p));
  }

  // Wymiar urlopu rodzicielskiego przy sprawach urlopu rodzicielskiego.
  const rodzicielski = dane.wymiarUrlopuRodzicielskiegoTygodni;
  if (rodzicielski !== undefined) {
    wynik = wynik.map((p) =>
      p.idPozycji !== null && SPRAWY_URLOPU_RODZICIELSKIEGO.includes(p.idPozycji)
        ? { ...p, dane: { ...p.dane, wymiarRodzicielskiegoTygodni: rodzicielski } }
        : p,
    );
  }

  return wynik;
};
