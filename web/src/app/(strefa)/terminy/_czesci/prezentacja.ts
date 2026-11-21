// Wspólne funkcje prezentacji terminów i kosztu spóźnienia dla ViewDeadlines, ViewFamilyPlan i ViewCaseDetails. Właściciel: u13.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { formatujKwote } from '@/domena/kwoty';
import { czyKosztMinimalny } from '@/domena/terminy/koszt';
import type { KosztSpoznienia, MiesiacISO, PozycjaPlanu } from '@/domena/typy';
import { formatujLiczbe } from '@/komponenty/format';
import { teksty } from '@/teksty';

const t = teksty.ViewDeadlines;

function imieINazwisko(imie?: string, nazwisko?: string): string | null {
  const tekst = [imie, nazwisko].filter(Boolean).join(' ').trim();
  return tekst === '' ? null : tekst;
}

/** Imię i nazwisko matki i drugiego rodzica z kontekstu rodziny. */
export function osobyRodziny(k: KontekstRodziny): { matka: string | null; drugiRodzic: string | null } {
  const dr = k.rodzina.daneRodziny.drugiRodzic;
  const drugiZDanych = imieINazwisko(dr.imie, dr.nazwisko);
  const kontoJestMatka = k.rodzina.daneRodziny.rodzicKonta === 'matka' && k.rola === 'rodzic';
  const kontoJestDrugim = k.rola === 'drugi-rodzic' || k.rodzina.daneRodziny.rodzicKonta === 'drugi-rodzic';
  const konto = imieINazwisko(k.konto.imie, k.konto.nazwisko);
  return {
    matka: kontoJestMatka ? konto : null,
    drugiRodzic: drugiZDanych ?? (kontoJestDrugim ? konto : null),
  };
}

/** Etykieta „Kogo dotyczy” sprawy. */
export function etykietaRodzica(sprawa: PozycjaPlanu, k: KontekstRodziny): string {
  const osoby = osobyRodziny(k);
  switch (sprawa.rodzic) {
    case 'matka':
      return osoby.matka ? t.rodzic.matka({ imieINazwisko: osoby.matka }) : t.rodzic.matkaBezImienia;
    case 'drugi-rodzic':
      return osoby.drugiRodzic ? t.rodzic.drugiRodzic({ imieINazwisko: osoby.drugiRodzic }) : t.rodzic.drugiRodzicBezImienia;
    case 'oboje-rodzice':
      return t.rodzic.obojeRodzice;
    case 'matka-albo-ojciec':
      return t.rodzic.matkaAlboOjciec;
    case 'rodzic-przyjmujacy': {
      const rola = k.rodzina.daneCiazy?.przyjecie?.rolaRodzicaPrzyjmujacego;
      const osoba = rola === 'ojciec' ? osoby.drugiRodzic : osoby.matka;
      return osoba ? t.rodzic.rodzicPrzyjmujacy({ imieINazwisko: osoba }) : t.rodzic.rodzicPrzyjmujacyBezImienia;
    }
  }
}

/** Miesiąc w mianowniku z wielką literą, np. „Marzec 2027”. */
export function miesiacNaglowka(m: MiesiacISO): string {
  const nazwa = teksty.wspolne.miesiace[Number(m.slice(5, 7)) - 1];
  return `${nazwa.charAt(0).toUpperCase()}${nazwa.slice(1)} ${m.slice(0, 4)}`;
}

function miesiacMianownik(m: MiesiacISO): string {
  return `${teksty.wspolne.miesiace[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;
}

function zakresMiesiecy(od: MiesiacISO, doM: MiesiacISO): { od: string; doMiesiaca: string } {
  const dop = (m: MiesiacISO) => t.miesiaceDopelniacz[Number(m.slice(5, 7)) - 1];
  if (od.slice(0, 4) === doM.slice(0, 4)) return { od: dop(od), doMiesiaca: `${dop(doM)} ${doM.slice(0, 4)}` };
  return { od: `${dop(od)} ${od.slice(0, 4)}`, doMiesiaca: `${dop(doM)} ${doM.slice(0, 4)}` };
}

function kwotaBezGroszy(grosze: number): string {
  return grosze % 100 === 0 ? `${formatujLiczbe(grosze / 100)} ${teksty.wspolne.zl}` : formatujKwote(grosze);
}

/** Wyjaśnienie kwoty kosztu spóźnienia po myślniku, np. „800 zł za każdy miesiąc od marca do maja 2027”. */
export function wyjasnienieKosztu(koszt: Extract<KosztSpoznienia, { rodzaj: 'kwota' }>, idPozycji: string | null): string | null {
  const n = koszt.liczbaDzieci;
  const r = koszt.rozbicie;
  if (r.length === 0) {
    if (koszt.tekst) return koszt.tekst;
    if (czyKosztMinimalny(idPozycji) && n > 1) return t.opisKosztu.naDziecko({ kwota: kwotaBezGroszy(koszt.kwota / n), liczba: String(n) });
    return null;
  }
  if (czyKosztMinimalny(idPozycji) && r.length === 1) {
    return n > 1 ? t.opisKosztu.naDziecko({ kwota: kwotaBezGroszy(r[0].kwotaNaDziecko), liczba: String(n) }) : null;
  }
  const rowne = r.every((x) => x.kwotaNaDziecko === r[0].kwotaNaDziecko);
  const kwota = kwotaBezGroszy(r[0].kwotaNaDziecko);
  if (r.length === 1) {
    const miesiac = miesiacMianownik(r[0].miesiac);
    return n > 1 ? t.opisKosztu.zaMiesiacNaDziecko({ kwota, liczba: String(n), miesiac }) : t.opisKosztu.zaMiesiac({ kwota, miesiac });
  }
  const zakres = zakresMiesiecy(r[0].miesiac, r[r.length - 1].miesiac);
  if (!rowne) return t.opisKosztu.zaMiesiaceRozne(zakres);
  return n > 1 ? t.opisKosztu.zaMiesiaceNaDziecko({ kwota, liczba: String(n), ...zakres }) : t.opisKosztu.zaMiesiace({ kwota, ...zakres });
}

/** Tekst liczby dni do terminu albo oznaczenia po terminie. */
export function tekstDni(dni: number): { glowny: string; poTerminie: boolean; minal?: string } {
  if (dni < 0) return { glowny: t.pozycja.poTerminie, poTerminie: true, minal: t.pozycja.minal({ liczba: formatujLiczbe(-dni) }) };
  if (dni === 0) return { glowny: t.pozycja.dzisTermin, poTerminie: false };
  return { glowny: t.pozycja.dniDoTerminu({ liczba: formatujLiczbe(dni) }), poTerminie: false };
}
