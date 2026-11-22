// Opis reguły terminu pozycji katalogu słowami dla ViewCatalogItemEdit, np. „data porodu +21 dni”.
import type { Katalog, RegulaTerminu } from '@/domena/typy';
import { teksty } from '@/teksty';

function liczbaZeZnakiem(n: number): string {
  return n > 0 ? `+${n}` : String(n).replace('-', '−');
}

/** Opis reguły terminu: data kotwicząca z przesunięciem, reguła wieku dziecka, termin coroczny albo bez terminu. */
export function opisRegulyTerminu(r: RegulaTerminu, k: Katalog): string {
  const t = teksty.ViewCatalogItemEdit.opisReguly;
  switch (r.typ) {
    case 'brak':
      return t.brak;
    case 'przesuniecie': {
      const kotwica = t.kotwice[r.kotwica];
      const glowna =
        r.przesuniecie === 0
          ? t.wDniu({ kotwica })
          : t.przesuniecie({ kotwica, liczba: liczbaZeZnakiem(r.przesuniecie), jednostka: t.jednostki[r.jednostka] });
      return r.korekta ? `${glowna}${t.korekta({ liczba: liczbaZeZnakiem(r.korekta.przesuniecie) })}` : glowna;
    }
    case 'plus-wymiar':
      return t.plusWymiar({
        kotwica: t.kotwice[r.kotwica],
        wpis: k.slowniki.find((w) => w.id === r.idWpisu)?.nazwa ?? r.idWpisu,
      });
    case 'dzien-przed-urodzinami':
      return t.dzienPrzedUrodzinami({ lata: String(r.lata) });
    case 'koniec-roku-urodzin':
      return t.koniecRokuUrodzin({ lata: String(r.lata) });
    case 'koniec-miesiaca-wieku':
      return t.koniecMiesiacaWieku({ miesiace: String(r.miesiace) });
    case 'coroczny': {
      const [miesiac, dzien] = r.dzien.split('-');
      return t.coroczny({ dzien: `${dzien}.${miesiac}` });
    }
    case 'dwa-terminy':
      return t.dwaTerminy({ pierwszy: opisRegulyTerminu(r.pierwszy, k), drugi: opisRegulyTerminu(r.drugi, k) });
    case 'specjalna':
      return r.opis;
  }
}
