// Wnioski złożone w ZUS i świadczenia rodzinne kont w symulowanym ZUS (kontrakt, sekcja 8; ANALIZY/15).
// Właściciel: u14. Wnioski wysłane z przewodnika dopisuje `StanSymulowanegoZus.wnioskiZPrzewodnika`.
// Stan bazowy kont przykładowych nie ma wniosków; stany z kryteriów akceptacji 3.4.2.1.1 (wniosek o 800+
// w trakcie rozpatrywania, przyznanie, odmowa, wypłata zasiłku macierzyńskiego) wczytują scenariusze u14.
import type { Pesel, SwiadczenieRodzinneZus, WniosekZus, ZasilekWyplacony, ZrodloweDaneKontaZus } from '@/domena/typy';

export type WnioskiISwiadczeniaKontaZus = Partial<Pick<ZrodloweDaneKontaZus, 'wnioski' | 'swiadczeniaRodzinne'>>;

/** Wnioski i świadczenia rodzinne według numeru PESEL konta. */
export const wnioskiKontZus: Readonly<Partial<Record<Pesel, WnioskiISwiadczeniaKontaZus>>> = {};

/** Wniosek o 800+ Anny Nowak złożony 25.11.2026 przez eZUS (KA-01–KA-05). */
export function wniosek800Plus(status: WniosekZus['status']): WniosekZus {
  return {
    idWniosku: 'EZUS-800-20261125-0001',
    rodzaj: 'swiadczenie-800-plus',
    kanal: 'ezus',
    dataZlozenia: '2026-11-25',
    status,
    planowyTerminZalatwienia: '2027-01-25',
  };
}

/** Wniosek o zasiłek macierzyński w trakcie rozpatrywania (KA-06). */
export const wniosekZasilkuMacierzynskiego: WniosekZus = {
  idWniosku: 'EZUS-ZAM-20261202-0001',
  rodzaj: 'zasilek-macierzynski',
  kanal: 'ezus',
  dataZlozenia: '2026-12-02',
  status: 'w-trakcie',
  planowyTerminZalatwienia: '2027-01-01',
};

/** Świadczenie rodzinne 800+ z planowanym terminem wypłaty 10.02.2027 (KA-05). */
export const wyplata800Plus: SwiadczenieRodzinneZus = { rodzaj: '800-plus', kwota: 80000, planowanyTerminWyplaty: '2027-02-10' };

/** Zasiłek macierzyński wypłacony 15.12.2026 przelewem (KA-06). */
export const wyplataZasilkuMacierzynskiego: ZasilekWyplacony = {
  rodzaj: 'Zasiłek macierzyński',
  dataWyplaty: '2026-12-15',
  kwota: 421958,
  sposobWyplaty: 'przelew',
};
