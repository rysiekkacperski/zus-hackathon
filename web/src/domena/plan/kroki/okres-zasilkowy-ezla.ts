// Krok planu `okresZasilkowyEzla` (kontrakt, sekcja 7.2; ANALIZY/16 R9). Właściciel: u14.
// Sprawa K25 Świadczenie rehabilitacyjne w ciąży należy do planu, gdy okres zasiłkowy w ciąży matki
// wyczerpuje się przed przewidywanym terminem porodu, a dziecko jeszcze się nie urodziło.
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import type { DaneZKontaZus, Katalog, PozycjaPlanu, RodzicSprawy } from '@/domena/typy';
import { okresyZKatalogu, okresZasilkowyWCiazy } from '@/domena/zasilki/okres-zasilkowy';

export const ID_SWIADCZENIA_REHABILITACYJNEGO = 'K25';

/** Nowa sprawa planu z pozycji katalogu, ze statusem do zrobienia. */
export function nowaSprawaZKatalogu(
  katalog: Katalog,
  idPozycji: string,
  domyslne: Pick<PozycjaPlanu, 'rodzaj' | 'etap' | 'rodzic'>,
  liczbaDzieci: number,
): PozycjaPlanu {
  const p = katalog.pozycje.find((x) => x.id === idPozycji);
  const rodzic: RodzicSprawy =
    p?.rodzic === 'matka' || p?.rodzic === 'drugi-rodzic' || p?.rodzic === 'oboje-rodzice' ||
    p?.rodzic === 'matka-albo-ojciec' || p?.rodzic === 'rodzic-przyjmujacy'
      ? p.rodzic
      : domyslne.rodzic;
  return {
    idSprawy: idPozycji,
    idPozycji,
    rodzaj: p?.rodzaj ?? domyslne.rodzaj,
    etap: p?.etap ?? domyslne.etap,
    rodzic,
    status: 'do-zrobienia',
    zrodloStatusu: 'wyliczenie-planu',
    liczbaDzieci,
    ostrzezenia: [],
    oznaczenia: [],
  };
}

function czyKopiaZus(d: unknown): d is DaneZKontaZus {
  return typeof d === 'object' && d !== null && 'zaswiadczeniaEzla' in d;
}

export const okresZasilkowyEzla: KrokPlanu = (pozycje, w) => {
  const kopia = czyKopiaZus(w.daneZusMatki) ? w.daneZusMatki : null;
  const ptp = w.daneCiazy?.przewidywanyTerminPorodu;
  const urodzone = Boolean(w.daneCiazy?.dataPorodu);
  const forma = w.daneRodziny.matka.formaZatrudnienia?.wartosc;
  const bezChorobowego =
    (forma === 'umowa-zlecenia' || forma === 'jdg') && w.daneRodziny.matka.dobrowolneChorobowe?.wartosc === false;

  let nalezy = false;
  if (kopia && ptp && !urodzone && !bezChorobowego && w.zgoda) {
    const { limit, przerwa } = okresyZKatalogu(w.katalog, w.dzis);
    const okres = okresZasilkowyWCiazy(kopia.zaswiadczeniaEzla, limit, przerwa);
    nalezy = okres.dataWyczerpania !== null && okres.dataWyczerpania < ptp;
  }

  const obecna = pozycje.find((p) => p.idSprawy === ID_SWIADCZENIA_REHABILITACYJNEGO);
  if (!nalezy) return obecna ? pozycje.filter((p) => p !== obecna) : pozycje;
  if (obecna) return pozycje;

  const poprzednia = w.poprzedniPlan?.pozycje.find((p) => p.idSprawy === ID_SWIADCZENIA_REHABILITACYJNEGO);
  const nowa =
    poprzednia ??
    nowaSprawaZKatalogu(
      w.katalog,
      ID_SWIADCZENIA_REHABILITACYJNEGO,
      { rodzaj: 'swiadczenie', etap: 'ciaza', rodzic: 'matka' },
      w.daneCiazy?.liczbaDzieciZCiazy ?? 1,
    );
  return [...pozycje, nowa];
};
