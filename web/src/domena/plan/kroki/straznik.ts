// Krok planu `straznik` (historyjka 3.6.1.3.1, kontrakt 7.2). Właściciel: u12.
// Dla matki JDG albo UZ z dobrowolnym ubezpieczeniem chorobowym do potwierdzenia daty porodu: ostrzeżenia
// o braku aktywnego DUCh i o podwyższeniu podstawy przy sprawie K08, sprawa Opłacenie składek za poprzedni
// miesiąc (wyłącznie JDG) ze statusem ze stanu rozliczeń składek albo z potwierdzenia rodzica.
// Po potwierdzeniu daty porodu: koniec ostrzeżeń i nowych spraw Opłacenie składek, informacja przy K19.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import {
  RODZAJE_OSTRZEZEN_STRAZNIKA,
  czyInformacjaPoPorodzie,
  czySprawaOplacenia,
  ocenStraznika,
  ostrzezeniaPrawaDoZasilku,
} from '@/domena/plan/straznik';
import type { OstrzezenieSprawy, PozycjaPlanu } from '@/domena/typy';

const rodzajeStraznika: readonly string[] = RODZAJE_OSTRZEZEN_STRAZNIKA;
// Przy sprawach katalogu krok zdejmuje wyłącznie ostrzeżenia, które sam nadaje sprawom K08 i K19.
const rodzajePrzySprawachKatalogu: readonly string[] = ['brak-duch', 'podwyzszenie-podstawy', 'informacja-po-porodzie'];

function bezOstrzezenStraznika(ostrzezenia: OstrzezenieSprawy[]): OstrzezenieSprawy[] {
  return ostrzezenia.filter((o) => !rodzajeStraznika.includes(o.rodzaj));
}

function bezOstrzezenPrzySprawie(ostrzezenia: OstrzezenieSprawy[]): OstrzezenieSprawy[] {
  return ostrzezenia.filter((o) => !rodzajePrzySprawachKatalogu.includes(o.rodzaj));
}

export const straznik: KrokPlanu = (pozycje, w) => {
  const ocena = ocenStraznika({
    daneRodziny: w.daneRodziny,
    daneCiazy: w.daneCiazy,
    kopia: w.daneZusMatki,
    katalog: w.katalog,
    progPodwyzszeniaProcent: w.parametry.progPodwyzszeniaPodstawyProcent,
    dzis: w.dzis,
  });
  const informacjaPoPorodzie = czyInformacjaPoPorodzie(w.daneRodziny, w.daneCiazy);
  const ostrzezeniaK08 = ocena ? ostrzezeniaPrawaDoZasilku(ocena) : [];

  const sprawy: PozycjaPlanu[] = pozycje
    .filter((p) => !czySprawaOplacenia(p.idSprawy))
    .map((p) => {
      const ostrzezenia = bezOstrzezenPrzySprawie(p.ostrzezenia);
      if (p.idPozycji === 'K08' && ostrzezeniaK08.length > 0) ostrzezenia.push(...ostrzezeniaK08);
      if (p.idPozycji === 'K19' && informacjaPoPorodzie) ostrzezenia.push({ rodzaj: 'informacja-po-porodzie' });
      return ostrzezenia.length === p.ostrzezenia.length && ostrzezenia.every((o, i) => o === p.ostrzezenia[i])
        ? p
        : { ...p, ostrzezenia };
    });

  // Sprawy Opłacenie składek złożone albo załatwione zachowują status po przeliczeniu.
  const zachowane = new Map<string, PozycjaPlanu>();
  for (const p of [...(w.poprzedniPlan?.pozycje ?? []), ...pozycje]) {
    if (czySprawaOplacenia(p.idSprawy) && (p.status === 'zalatwiona' || p.status === 'zlozona')) {
      zachowane.set(p.idSprawy, { ...p, ostrzezenia: bezOstrzezenStraznika(p.ostrzezenia) });
    }
  }

  const oplacenie = ocena?.oplacenie ?? null;
  if (oplacenie !== null) {
    const poprzednia = zachowane.get(oplacenie.idSprawy);
    const zadluzenie = oplacenie.ostrzezenia.some((o) => o.rodzaj === 'zadluzenie-ponad-prog');
    const zachowajPoprzedni = poprzednia !== undefined && oplacenie.status === 'do-zrobienia' && !zadluzenie;
    const sprawa: PozycjaPlanu = {
      idSprawy: oplacenie.idSprawy,
      idPozycji: null,
      rodzaj: 'obowiazek',
      etap: 'ciaza',
      rodzic: 'matka',
      status: zachowajPoprzedni ? poprzednia.status : oplacenie.status,
      zrodloStatusu: zachowajPoprzedni ? poprzednia.zrodloStatusu : oplacenie.zrodlo,
      dataOznaczenia: zachowajPoprzedni ? poprzednia.dataOznaczenia : oplacenie.dataOznaczenia,
      liczbaDzieci: w.daneCiazy?.liczbaDzieciZCiazy ?? 1,
      miesiacSkladek: oplacenie.miesiac,
      ostrzezenia: oplacenie.ostrzezenia,
      oznaczenia: poprzednia?.oznaczenia ?? [],
    };
    zachowane.set(sprawa.idSprawy, sprawa);
  }

  const sprawyOplacenia = [...zachowane.values()].sort((a, b) => a.idSprawy.localeCompare(b.idSprawy));
  return [...sprawy, ...sprawyOplacenia];
};
