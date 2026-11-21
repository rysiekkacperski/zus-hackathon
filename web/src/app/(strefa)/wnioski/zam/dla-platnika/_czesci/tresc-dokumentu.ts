import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import { formatujRachunek } from '@/domena/walidacje';
import type { DataISO, DaneOsobyWniosku, WniosekZam } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { WierszPdf } from './pdf-wniosku';

const t = teksty.ViewZamForPayer;

export interface DaneDokumentuZam {
  wniosek: WniosekZam;
  wnioskodawca: DaneOsobyWniosku;
  dzieci: DaneOsobyWniosku[];
  dataPrzygotowania: DataISO;
  nazwaPlatnika?: string;
}

function wiersz(etykieta: string, wartosc: string | undefined): WierszPdf[] {
  return wartosc ? [{ tekst: t.pdf.wiersz({ etykieta, wartosc }) }] : [];
}

/** Wiersze dokumentu wniosku ZAM dla płatnika: wspólna treść pliku PDF i wydruku. */
export function wierszeDokumentuZam(d: DaneDokumentuZam): WierszPdf[] {
  const { wniosek } = d;
  const wiersze: WierszPdf[] = [{ tekst: t.pdf.tytul, rodzaj: 'tytul' }];
  if (wniosek.przedPorodem) wiersze.push({ tekst: t.pdf.podtytulPrzedPorodem });

  wiersze.push({ tekst: t.pdf.sekcjaWnioskodawca, rodzaj: 'naglowek' });
  wiersze.push(...wiersz(t.pdf.imieINazwisko, `${d.wnioskodawca.imie} ${d.wnioskodawca.nazwisko}`.trim()));
  wiersze.push(...wiersz(t.pdf.pesel, d.wnioskodawca.pesel));

  if (wniosek.przedPorodem) {
    wiersze.push({ tekst: t.pdf.sekcjaPrzedPorodem, rodzaj: 'naglowek' });
    wiersze.push(...wiersz(t.szczegoly.dzienPoczatku, formatujDate(wniosek.przedPorodem.dzienPoczatkuZasilku)));
    wiersze.push(...wiersz(t.szczegoly.terminPorodu, formatujDate(wniosek.przedPorodem.przewidywanyTerminPorodu)));
    wiersze.push({ tekst: t.pdf.brakDanychDziecka });
  } else if (d.dzieci.length > 0) {
    wiersze.push({ tekst: t.pdf.sekcjaDziecko, rodzaj: 'naglowek' });
    for (const dziecko of d.dzieci) {
      wiersze.push(...wiersz(t.pdf.imieINazwisko, `${dziecko.imie} ${dziecko.nazwisko}`.trim()));
      wiersze.push(...wiersz(t.pdf.pesel, dziecko.pesel));
      wiersze.push(...wiersz(t.pdf.dataUrodzenia, dziecko.dataUrodzenia ? formatujDate(dziecko.dataUrodzenia) : undefined));
      wiersze.push(...wiersz(t.pdf.miejsceUrodzenia, dziecko.miejsceUrodzenia));
    }
  }

  if (wniosek.przyjecie) {
    wiersze.push({ tekst: t.pdf.sekcjaPrzyjecie, rodzaj: 'naglowek' });
    wiersze.push(...wiersz(t.pdf.formaPrzyjecia, t.formyPrzyjecia[wniosek.przyjecie.forma]));
    wiersze.push(...wiersz(t.pdf.dataPrzyjecia, formatujDate(wniosek.przyjecie.dataPrzyjecia)));
  }

  if (wniosek.okresy.length > 0) {
    wiersze.push({ tekst: t.pdf.sekcjaOkresy, rodzaj: 'naglowek' });
    for (const okres of wniosek.okresy) {
      wiersze.push({
        tekst: t.pdf.okres({
          rodzaj: t.rodzajeUrlopu[okres.rodzajUrlopu],
          od: formatujDate(okres.od),
          do_: formatujDate(okres.do),
          stawka: formatujProcent(okres.stawka ?? 100),
        }),
      });
    }
  }

  wiersze.push({ tekst: t.pdf.sekcjaWyplata, rodzaj: 'naglowek' });
  wiersze.push(...wiersz(t.pdf.numerRachunku, wniosek.numerRachunku ? formatujRachunek(wniosek.numerRachunku) : undefined));
  wiersze.push(
    ...wiersz(t.szczegoly.adresat, d.nazwaPlatnika ? t.podsumowanie.adresat({ nazwa: d.nazwaPlatnika }) : t.szczegoly.adresatPlatnik),
  );
  wiersze.push(...wiersz(t.pdf.dataPrzygotowania, formatujDate(d.dataPrzygotowania)));

  if (wniosek.oswiadczeniaPotwierdzone || wniosek.oswiadczenieZaZyciem) {
    wiersze.push({ tekst: t.pdf.oswiadczenia, rodzaj: 'naglowek' });
    if (wniosek.oswiadczeniaPotwierdzone) wiersze.push({ tekst: t.pdf.oswiadczeniaPotwierdzone });
    if (wniosek.oswiadczenieZaZyciem) wiersze.push({ tekst: t.pdf.oswiadczenieZaZyciem });
  }
  wiersze.push({ tekst: t.pdf.stopka, rodzaj: 'naglowek' });
  return wiersze;
}
