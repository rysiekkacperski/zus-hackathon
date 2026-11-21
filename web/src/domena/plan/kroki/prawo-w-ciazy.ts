// Krok planu `prawoWCiazy` (kontrakt, sekcja 7.2; ANALIZY/05 sekcja 5.17). Właściciel: u16.
// Zapisuje wynik ustalenia prawa przy sprawach K24 Zasiłek chorobowy w ciąży, K25 Świadczenie rehabilitacyjne
// w ciąży i K26 Zasiłek w wysokości zasiłku macierzyńskiego po utracie pracy w ciąży. Plan wylicza się po każdej
// zmianie danych konta ZUS, profilu rodziny i katalogu, więc wynik ustala się ponownie przy każdym przeliczeniu.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import type { DaneZKontaZus, IdPozycji, WynikUstaleniaPrawa } from '@/domena/typy';
import { ustalSwiadczeniaWCiazy, type SwiadczeniaWCiazy } from '@/domena/zasilki/prawo-w-ciazy';

const SPRAWY: Record<string, (s: SwiadczeniaWCiazy) => WynikUstaleniaPrawa> = {
  K24: (s) => s.zasilekChorobowy.wynik,
  K25: (s) => s.rehabilitacyjne.wynik,
  K26: (s) => s.zwzm.wynik,
};

function czyPelnaKopia(d: unknown): d is DaneZKontaZus {
  return typeof d === 'object' && d !== null && 'zaswiadczeniaEzla' in d && 'pesel' in d;
}

export const prawoWCiazy: KrokPlanu = (pozycje, w) => {
  const dotyczy = pozycje.some((p) => p.idPozycji !== null && (p.idPozycji as IdPozycji) in SPRAWY);
  if (!dotyczy) return pozycje;
  const kopia = czyPelnaKopia(w.daneZusMatki) ? w.daneZusMatki : null;
  const swiadczenia = ustalSwiadczeniaWCiazy({
    osoba: 'matka',
    daneRodziny: w.daneRodziny,
    daneCiazy: w.daneCiazy,
    kopia,
    katalog: w.katalog,
    dzis: w.dzis,
    zgoda: w.zgoda,
  });
  return pozycje.map((p) => {
    const wynik = p.idPozycji !== null ? SPRAWY[p.idPozycji]?.(swiadczenia) : undefined;
    return wynik ? { ...p, wynikUstaleniaPrawa: wynik } : p;
  });
};
