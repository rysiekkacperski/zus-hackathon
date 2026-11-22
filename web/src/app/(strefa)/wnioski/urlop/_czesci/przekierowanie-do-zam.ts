// Przekierowanie z kreatora wniosku o urlop (u28) dla rodzica bez umowy o pracę: kreator ZAM sprawy rodzica konta,
// istniejący szkic ZAM tej sprawy albo instrukcja sprawy, gdy wniosek ZAM jest już wysłany lub sprawa dotyczy drugiego rodzica.
import { pozycjeKatalogu } from '@/dane/katalog/pozycje';
import { idPozycjiSprawy, rodzicSprawy } from '@/domena/przewodnik/kanaly';
import type { IdWidoku, KodKomunikatu, KontoPrzewodnika, StanRodziny, Wniosek, WniosekZam } from '@/domena/typy';
import { otworzKreatorWnioskow, rodzicKontaWRodzinie } from '@/domena/wnioski/urlopy';
import { nastepnyEkranZam } from '@/domena/wnioski/zam-nawigacja';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';

export interface PrzekierowanieZKreatoraUrlopu {
  cel: IdWidoku;
  kod?: KodKomunikatu;
  sciezka: string;
}

function czyZam(w: Wniosek): w is WniosekZam {
  return w.rodzaj === 'zam';
}

/** Sprawa dotyczy rodzica konta: sprawy obojga rodziców i sprawy rodzica, którego dotyczy zalogowane konto. */
function czySprawaRodzicaKonta(konto: KontoPrzewodnika, rodzina: StanRodziny, idSprawy: string): boolean {
  const pozycjaPlanu = rodzina.plan?.pozycje.find((p) => p.idSprawy === idSprawy);
  const idPozycji = idPozycjiSprawy(pozycjaPlanu ?? { idSprawy, idPozycji: null });
  const pozycjaKatalogu = pozycjeKatalogu.find((p) => p.id === idPozycji) ?? null;
  const rodzicPozycji = pozycjaPlanu?.rodzic ?? pozycjaKatalogu?.rodzic;
  if (rodzicPozycji === 'oboje-rodzice' || rodzicPozycji === 'matka-albo-ojciec') return true;
  const rodzic = rodzicSprawy(
    { idSprawy, rodzic: rodzicPozycji === 'drugi-rodzic' || rodzicPozycji === 'rodzic-przyjmujacy' ? rodzicPozycji : 'matka' },
    pozycjaKatalogu,
    rodzina.daneRodziny,
  );
  return rodzic === rodzicKontaWRodzinie(konto.pesel, konto.rola, rodzina.daneRodziny);
}

/**
 * Cel wejścia do kreatora wniosku o urlop albo null, gdy rodzic konta pracuje na umowie o pracę.
 * Przy umowie zlecenia i działalności z dobrowolnym ubezpieczeniem chorobowym kreator ZAM tworzy szkic tylko dla sprawy
 * rodzica konta, która nie ma jeszcze wniosku ZAM. Istniejący szkic otwiera się od ostatniego ekranu, a wysłany wniosek
 * i sprawa drugiego rodzica prowadzą do instrukcji sprawy.
 */
export function przekierowanieZKreatoraUrlopu(
  konto: KontoPrzewodnika,
  rodzina: StanRodziny | null,
  idSprawy: string | null,
): PrzekierowanieZKreatoraUrlopu | null {
  const wynik = otworzKreatorWnioskow(konto, rodzina, idSprawy ?? undefined);
  if (wynik.cel === 'ViewLeaveRequestType') return null;
  if (wynik.cel !== 'ViewZamLeaveType') return { ...wynik, sciezka: sciezkaWidoku(wynik.cel) };
  if (rodzina === null || !idSprawy) return { ...wynik, sciezka: sciezkaWidoku(wynik.cel) };
  if (!czySprawaRodzicaKonta(konto, rodzina, idSprawy)) {
    return { cel: 'ViewCaseGuide', sciezka: trasy.ViewCaseGuide({ idSprawy }) };
  }
  const wnioskiZam = rodzina.wnioski.filter(czyZam).filter((w) => w.idSprawy === idSprawy && w.konto === konto.pesel);
  const szkic = wnioskiZam.find((w) => w.stan === 'szkic');
  if (szkic) {
    const cel = nastepnyEkranZam(szkic);
    return { cel, kod: wynik.kod, sciezka: sciezkaWidoku(cel, { wniosek: szkic.idWniosku }) };
  }
  if (wnioskiZam.length > 0) {
    return { cel: 'ViewCaseGuide', kod: wynik.kod, sciezka: trasy.ViewCaseGuide({ idSprawy }) };
  }
  return { ...wynik, sciezka: sciezkaWidoku(wynik.cel, { sprawa: idSprawy }) };
}
