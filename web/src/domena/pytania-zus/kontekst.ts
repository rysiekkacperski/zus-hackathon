// Kontekst pytania do ZUS (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
import '@/domena/pytania-zus/rozszerzenia-typow';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DaneRodziny,
  DrugiRodzic,
  FormaZatrudnienia,
  IdSprawy,
  KalendarzTerminow,
  Katalog,
  KontekstPytaniaDoZus,
  Pesel,
  PlanRodziny,
  RodzicWRodzinie,
} from '@/domena/typy';

/** Dane wejściowe kontekstu: rodzina konta wysyłającego pytanie i sprawa z planu (pytanie bez sprawy: brak). */
export interface WejscieKontekstuPytania {
  idSprawy?: IdSprawy;
  pesel: Pesel;
  daneRodziny: DaneRodziny | null;
  daneCiazy: DaneCiazyIDziecka | null;
  plan: PlanRodziny | null;
  kalendarz: KalendarzTerminow | null;
  katalog: Katalog;
}

/** Kim w rodzinie jest konto: konto zakładające to `rodzicKonta`, konto dołączone to drugi z rodziców. */
export function rodzicKontaWRodzinie(daneRodziny: DaneRodziny, pesel: Pesel): RodzicWRodzinie {
  const zakladajace = daneRodziny.idRodziny === pesel;
  if (zakladajace) return daneRodziny.rodzicKonta;
  return daneRodziny.rodzicKonta === 'matka' ? 'drugi-rodzic' : 'matka';
}

function formaRodzica(dane: DaneRodzica | DrugiRodzic): FormaZatrudnienia | undefined {
  const forma = dane.formaZatrudnienia?.wartosc;
  return forma === undefined || forma === 'brak-drugiego-rodzica' ? undefined : forma;
}

/** Rodzaj ubezpieczenia chorobowego wynikający z formy zatrudnienia i dobrowolnego ubezpieczenia (R1). */
export function rodzajUbezpieczeniaZProfilu(
  forma: FormaZatrudnienia | undefined,
  dobrowolne: boolean | undefined,
): 'obowiazkowe' | 'dobrowolne' | 'brak' | undefined {
  if (forma === undefined) return undefined;
  if (forma === 'umowa-o-prace') return 'obowiazkowe';
  if (forma === 'brak-tytulu') return 'brak';
  if (dobrowolne === undefined) return undefined;
  return dobrowolne ? 'dobrowolne' : 'brak';
}

function kontekstProfilu(w: WejscieKontekstuPytania): Pick<
  KontekstPytaniaDoZus,
  'profil' | 'nazwaPlatnikaZasilku' | 'rodzajUbezpieczeniaChorobowego'
> {
  const profil: KontekstPytaniaDoZus['profil'] = {};
  const wynik: Pick<KontekstPytaniaDoZus, 'profil' | 'nazwaPlatnikaZasilku' | 'rodzajUbezpieczeniaChorobowego'> = { profil };
  if (w.daneRodziny !== null) {
    const kto = rodzicKontaWRodzinie(w.daneRodziny, w.pesel);
    const dane = kto === 'matka' ? w.daneRodziny.matka : w.daneRodziny.drugiRodzic;
    const forma = formaRodzica(dane);
    const rodzaj = rodzajUbezpieczeniaZProfilu(forma, dane.dobrowolneChorobowe?.wartosc);
    if (forma !== undefined) profil.formaZatrudnienia = forma;
    if (rodzaj !== undefined) {
      profil.ubezpieczenieChorobowe = rodzaj !== 'brak';
      wynik.rodzajUbezpieczeniaChorobowego = rodzaj;
    }
    if (dane.platnikZasilku) {
      profil.platnikZasilku = dane.platnikZasilku.wartosc;
      if (dane.platnikZasilku.nazwaPlatnika) wynik.nazwaPlatnikaZasilku = dane.platnikZasilku.nazwaPlatnika;
    }
  }
  // Dane ciąży i dziecka dołączamy wyłącznie wtedy, gdy profil je zawiera (zapis tylko przy zgodzie).
  const ciaza = w.daneCiazy;
  if (ciaza !== null) {
    if (ciaza.dataPoroduPotwierdzona && ciaza.dataPorodu) profil.dataPorodu = ciaza.dataPorodu;
    else if (ciaza.przewidywanyTerminPorodu) profil.przewidywanyTerminPorodu = ciaza.przewidywanyTerminPorodu;
    const liczba = ciaza.dataPoroduPotwierdzona ? (ciaza.liczbaUrodzonychDzieci ?? ciaza.liczbaDzieciZCiazy) : ciaza.liczbaDzieciZCiazy;
    if (liczba !== undefined) profil.liczbaDzieci = liczba;
    if (ciaza.przyjecie) {
      profil.przyjecie = { forma: ciaza.przyjecie.forma, dataPrzyjecia: ciaza.przyjecie.dataPrzyjecia };
      if (profil.liczbaDzieci === undefined) profil.liczbaDzieci = ciaza.przyjecie.liczbaPrzyjetychDzieci;
    }
  }
  return wynik;
}

/**
 * Kontekst sprawy i profilu dołączany do pytania (R1). Z identyfikatorem sprawy obecnej w planie: kontekst sprawy
 * (identyfikator, tytuł, etap, status, termin) i profilu; bez sprawy: wyłącznie kontekst profilu.
 */
export function zbudujKontekstPytania(w: WejscieKontekstuPytania): KontekstPytaniaDoZus {
  const kontekst: KontekstPytaniaDoZus = kontekstProfilu(w);
  if (w.idSprawy === undefined) return kontekst;
  const sprawa = w.plan?.pozycje.find((p) => p.idSprawy === w.idSprawy);
  if (sprawa === undefined) return kontekst;
  const termin = w.kalendarz?.terminy.find((t) => t.idSprawy === w.idSprawy);
  kontekst.sprawa = {
    idSprawy: sprawa.idSprawy,
    tytul: tytulSprawy(w.katalog, sprawa.idSprawy),
    etap: sprawa.etap,
    status: sprawa.status,
    ...(termin?.termin ? { termin: termin.termin, terminSzacowany: termin.szacowany } : {}),
  };
  return kontekst;
}
