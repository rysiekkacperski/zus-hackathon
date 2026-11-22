// Filtr odczytu danych z konta ZUS `korespondencja` (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Kopia zawiera korespondencję konta (pytania wysłane z tego konta) od najnowszej i zachowuje z poprzedniej kopii
// znacznik wysłanego powiadomienia o odpowiedzi, żeby kolejny odczyt nie powiadamiał ponownie.
import type { FiltrOdczytu } from '@/domena/dane-zus/filtry/typ';
import { scalPytania } from '@/domena/pytania-zus/odpowiedzi';

export const korespondencja: FiltrOdczytu = (kopia, w) => {
  const wlasne = (lista: typeof kopia.korespondencja) => lista.filter((p) => p.peselNadawcy === kopia.pesel);
  const zrodlowe = wlasne(w.zrodlo.korespondencja ?? kopia.korespondencja);
  const powiadomione = new Set(
    (w.poprzednia?.korespondencja ?? []).filter((p) => p.powiadomionoOOdpowiedzi).map((p) => p.idPytania),
  );
  const pytania = scalPytania(zrodlowe).map((p) =>
    powiadomione.has(p.idPytania) && p.odpowiedz ? { ...p, powiadomionoOOdpowiedzi: true } : p,
  );
  return { ...kopia, korespondencja: pytania };
};
