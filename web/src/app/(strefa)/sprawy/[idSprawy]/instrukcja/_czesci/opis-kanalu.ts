// Teksty kafelków Instytucja i Kanał oraz notatek ViewCaseGuide według wybranego kanału (ANALIZY/08, wzory cz1/P08).
import type { DokumentyIAdresat, KanalZewnetrzny, WyborKanalu } from '@/domena/przewodnik/kanaly';
import type { FormaZatrudnienia, IdPozycji, PozycjaKatalogu } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewCaseGuide;

export interface WartoscKafelka {
  etykieta: string;
  wartosc: string;
  podpis?: string;
}

export function nazwaKanalu(kanal: KanalZewnetrzny): string {
  return t.nazwyKanalow[kanal];
}

function instytucjaZasilkuMacierzynskiego(dokumenty: DokumentyIAdresat): WartoscKafelka {
  const p = t.instytucjaPlatnika;
  if (dokumenty.typ === 'platnik-nieustalony') {
    return { etykieta: t.instytucja, wartosc: p.nieustalony, podpis: p.nieustalonyPodpis };
  }
  if (dokumenty.typ === 'lista' && dokumenty.platnik === 'platnik-skladek') {
    return { etykieta: t.instytucja, wartosc: dokumenty.nazwaPlatnika ?? p.platnikSkladek, podpis: p.platnikSkladekPodpis };
  }
  return { etykieta: t.instytucja, wartosc: p.zus, podpis: p.zusPodpis };
}

/** Kafelki Instytucja i Kanał albo jeden kafelek Instytucja i kanał dla spraw bez akcji przejścia. */
export function kafelkiKanalu(w: {
  wybor: WyborKanalu;
  forma: FormaZatrudnienia | null;
  dokumenty: DokumentyIAdresat;
  pozycja: PozycjaKatalogu | null;
  nazwaPracodawcy?: string;
}): WartoscKafelka[] {
  const o = t.opisyKanalow;
  switch (w.wybor.typ) {
    case 'kreator':
      if (w.wybor.idWidoku === 'ViewZamLeaveType') {
        return [
          instytucjaZasilkuMacierzynskiego(w.dokumenty),
          { etykieta: t.kanal, wartosc: o.zam.kanal, podpis: o.zam.kanalPodpis },
        ];
      }
      if (w.wybor.idWidoku === 'ViewZ15Start') {
        // K22: instytucja według formy zatrudnienia, wniosek Z-15 w kreatorze przewodnika (3.8.1.1.1, tabela kanałów).
        const instytucja =
          w.forma === 'umowa-o-prace'
            ? { wartosc: o.z15.instytucjaPracodawca, podpis: o.z15.instytucjaPracodawcaPodpis }
            : w.forma === 'umowa-zlecenia'
              ? { wartosc: o.z15.instytucjaZleceniodawca, podpis: o.z15.instytucjaZleceniodawcaPodpis }
              : { wartosc: o.z15.instytucjaZus, podpis: o.z15.instytucjaZusPodpis };
        return [
          { etykieta: t.instytucja, ...instytucja },
          { etykieta: t.kanal, wartosc: o.z15.kanal, podpis: o.z15.kanalPodpis },
        ];
      }
      return [
        { etykieta: t.instytucja, wartosc: o.zas53.instytucja, podpis: o.zas53.instytucjaPodpis },
        { etykieta: t.kanal, wartosc: o.zas53.kanal, podpis: o.zas53.kanalPodpis },
      ];
    case 'zewnetrzny': {
      const klucz = w.wybor.kanal === 'gov-zgloszenie-urodzenia' ? 'mobywatel' : w.wybor.kanal;
      const opis = o[klucz];
      // K08 po ustaniu umowy o pracę: ZUS, wniosek ZAM w eZUS (KA-02 3.8.1.1.2).
      const kanalPodpis = w.wybor.kanal === 'ezus' && w.pozycja?.id === 'K08' ? o.ezusZam.kanalPodpis : opis.kanalPodpis;
      return [
        { etykieta: t.instytucja, wartosc: opis.instytucja, podpis: opis.instytucjaPodpis },
        { etykieta: t.kanal, wartosc: opis.kanal, podpis: kanalPodpis },
      ];
    }
    case 'u-pracodawcy': {
      // K23: wniosek o urlop wychowawczy albo o obniżenie wymiaru czasu pracy w kreatorze wniosków do pracodawcy (KA-03 3.8.1.1.2).
      if (w.pozycja?.id === 'K23') {
        return [
          { etykieta: t.instytucja, wartosc: o.pracodawca.instytucja, podpis: w.nazwaPracodawcy },
          { etykieta: t.kanal, wartosc: o.pracodawcaK23.kanal, podpis: o.pracodawcaK23.kanalPodpis },
        ];
      }
      const opis = w.forma === 'umowa-zlecenia' ? o.zleceniodawca : o.pracodawca;
      return [
        { etykieta: t.instytucja, wartosc: opis.instytucja, podpis: w.nazwaPracodawcy },
        { etykieta: t.kanal, wartosc: opis.kanal, podpis: opis.kanalPodpis },
      ];
    }
    case 'brak-akcji':
      if (w.pozycja === null || w.pozycja.rodzaj === 'informacja') {
        return [{ etykieta: t.instytucjaIKanal, wartosc: o.informacja.wartosc, podpis: o.informacja.podpis }];
      }
      return [{ etykieta: t.instytucjaIKanal, wartosc: w.pozycja.instytucjaIKanal }];
  }
}

/** Notatka pod akcjami karty Najważniejsze informacje. */
export function notatkaKanalu(w: {
  wybor: WyborKanalu;
  forma: FormaZatrudnienia | null;
  oznaczona: boolean;
  informacja: boolean;
}): string {
  if (w.oznaczona) return t.notatkaPoOznaczeniu;
  switch (w.wybor.typ) {
    case 'kreator':
      return t.notatkaKreator;
    case 'zewnetrzny':
      return w.wybor.kanal === 'mobywatel' || w.wybor.kanal === 'gov-zgloszenie-urodzenia'
        ? t.notatkaMobywatel
        : t.notatkaZewnetrzny({ kanal: nazwaKanalu(w.wybor.kanal) });
    case 'u-pracodawcy':
      return w.forma === 'umowa-zlecenia' ? t.notatkaZleceniodawca : t.notatkaPracodawca;
    case 'brak-akcji':
      return w.informacja ? t.notatkaInformacja : t.notatkaBezKanalu;
  }
}

/** Etykieta akcji przejścia do kanału zewnętrznego. */
export function etykietaAkcjiZewnetrznej(kanal: KanalZewnetrzny, idPozycji: IdPozycji | null): string {
  if (kanal === 'ezus' && idPozycji !== null && idPozycji in t.akcjeZewnetrzneEzus) {
    return t.akcjeZewnetrzneEzus[idPozycji as keyof typeof t.akcjeZewnetrzneEzus];
  }
  return t.akcjeZewnetrzne[kanal];
}
