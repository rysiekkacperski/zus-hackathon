// Pomocnicze funkcje prezentacji spraw planu dla ViewFamilyPlan, ViewCaseDetails i ViewApplicationList. Właściciel: u12.
import { dodajDni, formatujDate, porownajDaty } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { czySprawaOplacenia, miesiacZIdSprawyOplacenia } from '@/domena/plan/straznik';
import type {
  DaneCiazyIDziecka,
  Etap,
  FormaZatrudnienia,
  FormaZatrudnieniaDrugiegoRodzica,
  Katalog,
  PozycjaKatalogu,
  PozycjaPlanu,
  Rola,
  StatusSprawy,
} from '@/domena/typy';
import { formatujMiesiac } from '@/komponenty/format';
import { teksty } from '@/teksty';

const t = teksty.ViewFamilyPlan;

export const ETAPY: readonly Etap[] = [
  'ciaza',
  'pierwsze-tygodnie',
  'urlopy-i-zasilek',
  'pieniadze-na-dziecko',
  'powrot-do-pracy',
];

export function numerEtapu(etap: Etap): number {
  return ETAPY.indexOf(etap) + 1;
}

export function nazwaEtapu(etap: Etap): string {
  return t.etapy[etap];
}

export function tytulEtapuZNumerem(etap: Etap): string {
  return t.tytulEtapu({ numer: String(numerEtapu(etap)), nazwa: nazwaEtapu(etap) });
}

export function pozycjaKatalogu(katalog: Katalog, sprawa: PozycjaPlanu): PozycjaKatalogu | null {
  if (sprawa.idPozycji === null) return null;
  return katalog.pozycje.find((p) => p.id === sprawa.idPozycji) ?? null;
}

export function tytulSprawy(katalog: Katalog, sprawa: PozycjaPlanu): string {
  if (czySprawaOplacenia(sprawa.idSprawy)) {
    const miesiac = sprawa.miesiacSkladek ?? miesiacZIdSprawyOplacenia(sprawa.idSprawy);
    return miesiac ? t.oplacenie.tytul({ miesiac: formatujMiesiac(miesiac) }) : sprawa.idSprawy;
  }
  return pozycjaKatalogu(katalog, sprawa)?.tytul ?? sprawa.idSprawy;
}

/** Etykieta rodzica sprawy; konto Drugi rodzic widzi swoje sprawy jako „Drugi rodzic (Ty)”. */
export function etykietaRodzica(sprawa: PozycjaPlanu, rola: Rola): string {
  const nazwa = t.rodzice[sprawa.rodzic];
  return rola === 'drugi-rodzic' && sprawa.rodzic === 'drugi-rodzic' ? t.rodzicTy({ rodzic: nazwa }) : nazwa;
}

/** Ostatni dzień 10. tygodnia ciąży: przewidywany termin porodu minus 211 dni. */
export function koniec10Tygodnia(przewidywanyTerminPorodu: string): string {
  return dodajDni(przewidywanyTerminPorodu, -211);
}

export function opisSprawy(sprawa: PozycjaPlanu, daneCiazy: DaneCiazyIDziecka | null): string | null {
  if (sprawa.idPozycji === 'K01' && sprawa.status === 'zalatwiona') {
    const wizyta = daneCiazy?.dataPierwszejWizyty;
    const ptp = daneCiazy?.przewidywanyTerminPorodu;
    if (wizyta && wizyta !== 'brak-wizyty' && ptp) {
      const koniec = koniec10Tygodnia(ptp);
      if (porownajDaty(wizyta, koniec) <= 0) {
        return t.wizytaOdbyta({ data: formatujDate(wizyta), koniec: formatujDate(koniec) });
      }
    }
  }
  if (sprawa.idPozycji === null) return null;
  return t.opisySpraw[sprawa.idPozycji] ?? null;
}

/** Sprawa dotyczy dziecka, więc pokazuje liczbę dzieci z ciąży. */
export function czyDotyczyDziecka(sprawa: PozycjaPlanu): boolean {
  if (sprawa.idPozycji === 'K35') return false;
  return sprawa.etap === 'pierwsze-tygodnie' || sprawa.etap === 'pieniadze-na-dziecko';
}

export function kwotaSprawy(sprawa: PozycjaPlanu): string {
  if (!sprawa.kwota) return t.kwoty.brak;
  const kwota = formatujKwote(sprawa.kwota.kwota);
  return sprawa.kwota.okres === 'miesiecznie' ? t.kwoty.miesiecznie({ kwota }) : t.kwoty.jednorazowo({ kwota });
}

export function czyOtwarta(status: StatusSprawy): boolean {
  return status === 'do-zrobienia' || status === 'wymaga-uzupelnienia-profilu';
}

export function nazwaFormy(forma: FormaZatrudnienia | FormaZatrudnieniaDrugiegoRodzica): string {
  return t.formy[forma];
}

/** Pierwsza litera wielka, na przykład nazwa miesiąca w wierszu listy definicji. */
export function wielkaLitera(tekst: string): string {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}
