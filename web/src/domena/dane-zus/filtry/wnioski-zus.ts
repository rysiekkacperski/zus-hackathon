// Filtr odczytu danych z konta ZUS `wnioskiZus` (kontrakt, sekcja 7.2; ANALIZY/15 R1). Właściciel: u14.
// Kopia zawiera wnioski złożone w ZUS od najpóźniejszej daty złożenia oraz świadczenia rodzinne
// z planowanym terminem wypłaty od najbliższego.
import { porownajDaty } from '@/domena/daty';
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';

export const wnioskiZus: FiltrOdczytu = (kopia, w) => ({
  ...kopia,
  wnioski: [...(w.zrodlo.wnioski ?? kopia.wnioski)].sort((a, b) => porownajDaty(b.dataZlozenia, a.dataZlozenia)),
  swiadczeniaRodzinne: [...(w.zrodlo.swiadczeniaRodzinne ?? kopia.swiadczeniaRodzinne)].sort((a, b) =>
    porownajDaty(a.planowanyTerminWyplaty, b.planowanyTerminWyplaty),
  ),
});
