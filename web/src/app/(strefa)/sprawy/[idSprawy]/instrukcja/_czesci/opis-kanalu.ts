// Teksty kafelków Instytucja i Kanał oraz notatek ViewCaseGuide według wybranego kanału (ANALIZY/08, wzory cz1/P08).
import type { DokumentyIAdresat, KanalZewnetrzny, WyborKanalu } from '@/domena/przewodnik/kanaly';
import type { FormaZatrudnienia, IdPozycji, PozycjaKatalogu, RodzicWRodzinie } from '@/domena/typy';
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
  if (dokumenty.typ === 'platnik-nieustalony' || dokumenty.typ === 'warianty-platnika') {
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

/** Zdania akapitu Najważniejsze informacje w drugiej osobie albo w trzeciej osobie dla drugiego z rodziców. */
interface ZdaniaKanalu {
  instytucja: { [K in Exclude<keyof typeof t.zdaniaKanalu.instytucja, 'platnikSkladekNazwa'>]: string } & {
    platnikSkladekNazwa: (p: { nazwa: string }) => string;
  };
  kanal: { [K in keyof typeof t.zdaniaKanalu.kanal]: string };
  informacja: string;
  zKatalogu: (p: { wartosc: string }) => string;
}

/**
 * Nazwa rodzica sprawy w zdaniach w trzeciej osobie, gdy sprawę ogląda drugi z rodziców: drugiego rodzica nazywamy
 * imieniem z profilu, gdy je znamy. Dla sprawy rodzica konta zwraca null, a zdania zostają w drugiej osobie.
 */
export function osobaRodzicaSprawy(
  rodzicSprawy: RodzicWRodzinie,
  rodzicKonta: RodzicWRodzinie,
  imieDrugiegoRodzica?: string,
): string | null {
  if (rodzicSprawy === rodzicKonta) return null;
  if (rodzicSprawy === 'matka') return t.osobaSprawy.matka;
  return imieDrugiegoRodzica?.trim() || t.osobaSprawy.drugiRodzic;
}

function zdaniaDla(osoba: string | null | undefined): ZdaniaKanalu {
  return osoba ? t.zdaniaKanaluDrugiegoRodzica : t.zdaniaKanalu;
}

/**
 * Zdanie o formie zatrudnienia rodzica sprawy. Gdy rodzic sprawy jest drugim z rodziców wobec rodzica konta,
 * zdanie jest w trzeciej osobie z nazwą tego rodzica (osoba), a bez znanej formy wskazuje, kto prowadzi sprawę.
 */
export function wstepFormy(forma: FormaZatrudnienia | null, osoba?: string | null): string | null {
  if (osoba) return forma === null ? t.wstepFormyDrugiegoRodzica.bezFormy({ osoba }) : t.wstepFormyDrugiegoRodzica[forma]({ osoba });
  return forma === null ? null : t.wstepFormy[forma];
}

function zdanieInstytucjiZasilkuMacierzynskiego(dokumenty: DokumentyIAdresat, zdaniaKanalu: ZdaniaKanalu): string {
  const z = zdaniaKanalu.instytucja;
  if (dokumenty.typ === 'platnik-nieustalony' || dokumenty.typ === 'warianty-platnika') return z.platnikNieustalony;
  if (dokumenty.typ === 'lista' && dokumenty.platnik === 'platnik-skladek') {
    return dokumenty.nazwaPlatnika ? z.platnikSkladekNazwa({ nazwa: dokumenty.nazwaPlatnika }) : z.platnikSkladek;
  }
  return z.zus;
}

/**
 * Zdania akapitu Najważniejsze informacje o instytucji i kanale, z tymi samymi rozgałęzieniami co kafelki kanału,
 * czyli właściwe dla formy zatrudnienia rodzica sprawy. Z nazwą rodzica sprawy (osoba) zdania są w trzeciej osobie.
 */
export function zdanieKanalu(w: Parameters<typeof kafelkiKanalu>[0] & { osoba?: string | null }): string {
  const z = zdaniaDla(w.osoba);
  const zdania = (instytucja: string, kanal: string) => `${instytucja} ${kanal}`;
  switch (w.wybor.typ) {
    case 'kreator':
      if (w.wybor.idWidoku === 'ViewZamLeaveType') return zdania(zdanieInstytucjiZasilkuMacierzynskiego(w.dokumenty, z), z.kanal.zam);
      if (w.wybor.idWidoku === 'ViewZ15Start') {
        const instytucja =
          w.forma === 'umowa-o-prace' ? z.instytucja.pracodawca : w.forma === 'umowa-zlecenia' ? z.instytucja.platnikAlboZus : z.instytucja.zus;
        return zdania(instytucja, z.kanal.z15);
      }
      return zdania(z.instytucja.zus, z.kanal.zas53);
    case 'zewnetrzny':
      switch (w.wybor.kanal) {
        case 'ezus':
          return zdania(z.instytucja.zus, w.pozycja?.id === 'K08' ? z.kanal.ezusZam : z.kanal.ezus);
        case 'empatia':
          return zdania(z.instytucja.gmina, z.kanal.empatia);
        case 'mobywatel':
        case 'gov-zgloszenie-urodzenia':
          return zdania(z.instytucja.urzadStanuCywilnego, z.kanal.mobywatel);
        default:
          return zdania(z.instytucja.urzadStanuCywilnego, z.kanal['gov-rejestr-stanu-cywilnego']);
      }
    case 'u-pracodawcy':
      if (w.pozycja?.id === 'K23') return zdania(z.instytucja.pracodawca, z.kanal.pracodawcaK23);
      return w.forma === 'umowa-zlecenia'
        ? zdania(z.instytucja.zleceniodawca, z.kanal.zleceniodawca)
        : zdania(z.instytucja.pracodawca, z.kanal.pracodawca);
    case 'brak-akcji':
      if (w.pozycja === null || w.pozycja.rodzaj === 'informacja') return z.informacja;
      return z.zKatalogu({ wartosc: w.pozycja.instytucjaIKanal });
  }
}

/** Notatka pod akcjami karty Najważniejsze informacje. */
export function notatkaKanalu(w: {
  wybor: WyborKanalu;
  forma: FormaZatrudnienia | null;
  oznaczona: boolean;
  informacja: boolean;
  osoba?: string | null;
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
      if (w.osoba) return w.forma === 'umowa-zlecenia' ? t.notatkaZleceniodawcaDrugiegoRodzica : t.notatkaPracodawcaDrugiegoRodzica;
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
