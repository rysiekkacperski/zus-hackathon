// Fakty dla odpowiedzi asystenta AI (kontrakt, sekcje 7.2 i 10.3). Właściciel: u31 (Asystent AI).
// Fakty powstają deterministycznie z kontekstu: liczby pochodzą z planu, terminów, wyników kalkulacji
// i katalogu świadczeń, a asystent niczego nie liczy samodzielnie (R-AS-ZRODLA). Razem z faktami funkcja
// `analizujPytanie` wyznacza sprawy odpowiedzi, propozycję działania (R-AS-DZIAL) i akcje kanałów (R-AS-GRAN).
import '@/domena/asystent/rozszerzenia-typow';
import { czyPozaZakresem, normalizujTekst, pozycjeZTekstu } from '@/domena/asystent/intencje';
import { czyRolaZmieniaSprawe, dozwoloneDzialanieDlaSpraw } from '@/domena/asystent/uprawnienia';
import { dodajDni, formatujDate, porownajDaty, roznicaDni } from '@/domena/daty';
import type {
  AkcjaKanaluAsystenta,
  Fakt,
  IdSprawy,
  IdWidoku,
  IntencjaAsystenta,
  KodKomunikatu,
  KontekstAsystenta,
  PropozycjaDzialania,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const F = teksty.ViewAssistantChat.fakty;

type SprawaKontekstu = KontekstAsystenta['sprawy'][number];

export interface AnalizaPytania {
  fakty: Fakt[];
  sprawy: IdSprawy[];
  propozycja?: PropozycjaDzialania;
  akcjeKanalow?: AkcjaKanaluAsystenta[];
  kodKomunikatu: '0070' | '0148';
}

export interface WskazaniePytania {
  wiadomosc: string;
  sprawy: IdSprawy[];
}

function fakt(klucz: string, tekst: string, liczby: string[] = [], idSprawy?: IdSprawy): Fakt {
  return { klucz, tekst, liczby, ...(idSprawy ? { idSprawy } : {}) };
}

function idPozycji(k: KontekstAsystenta, s: SprawaKontekstu): string {
  return k.szczegoly?.pozycjeSpraw[s.idSprawy] ?? s.idSprawy.split('-')[0];
}

function sprawaPozycji(k: KontekstAsystenta, pozycja: string): SprawaKontekstu | undefined {
  return k.sprawy.find((s) => idPozycji(k, s) === pozycja);
}

function statusTekst(s: SprawaKontekstu): string {
  return teksty.wspolne.etykiety.statusySpraw[s.status].toLowerCase();
}

function zMalejLitery(t: string): string {
  return t.length === 0 ? t : t[0].toLowerCase() + t.slice(1);
}

function dniDoTerminu(k: KontekstAsystenta, s: SprawaKontekstu): number | undefined {
  if (s.dniDoTerminu !== undefined) return s.dniDoTerminu;
  return s.termin ? roznicaDni(k.dzis, s.termin) : undefined;
}

/** Sprawy wskazane w pytaniu: najpierw identyfikatory z klasyfikacji, potem słowa kluczowe wiadomości. */
function sprawyWskazane(k: KontekstAsystenta, w: WskazaniePytania | undefined): SprawaKontekstu[] {
  const wynik: SprawaKontekstu[] = [];
  for (const id of w?.sprawy ?? []) {
    const s = k.sprawy.find((x) => x.idSprawy === id);
    if (s && !wynik.includes(s)) wynik.push(s);
  }
  for (const pozycja of pozycjeZTekstu(w?.wiadomosc ?? '')) {
    const s = sprawaPozycji(k, pozycja);
    if (s && !wynik.includes(s)) wynik.push(s);
  }
  return wynik;
}

function faktyTerminu(k: KontekstAsystenta, s: SprawaKontekstu): Fakt[] {
  if (s.status === 'zlozona' || s.status === 'zalatwiona') {
    return [fakt('status', F.sprawaZalatwiona({ tytul: s.tytul, status: statusTekst(s) }), [], s.idSprawy)];
  }
  if (!s.termin) return [fakt('brak-terminu', F.brakTerminu({ tytul: s.tytul }), [], s.idSprawy)];
  const data = formatujDate(s.termin);
  const wynik: Fakt[] = [];
  if (idPozycji(k, s) === 'K12') {
    wynik.push(fakt('termin', F.termin800({ data }), [data], s.idSprawy));
  } else {
    const dni = dniDoTerminu(k, s);
    wynik.push(
      dni !== undefined && dni >= 0
        ? fakt('termin', F.terminSprawyZDniami({ tytul: s.tytul, data, liczbaDni: String(dni) }), [data, String(dni)], s.idSprawy)
        : fakt('termin', F.terminSprawy({ tytul: s.tytul, data }), [data], s.idSprawy),
    );
  }
  if (s.koszt) wynik.push(fakt('koszt', F.kosztSpoznienia({ kwota: s.koszt }), [s.koszt], s.idSprawy));
  return wynik;
}

function przejdz(idWidoku: IdWidoku, parametry?: Record<string, string>): PropozycjaDzialania {
  return parametry ? { rodzaj: 'przejdz', idWidoku, parametry } : { rodzaj: 'przejdz', idWidoku };
}

const PROFIL_NA_START = przejdz('ViewProfileZusData');
const KALKULATOR = przejdz('ViewCalcMaternityInput');

function analiza(fakty: Fakt[], sprawy: (SprawaKontekstu | undefined)[], propozycja?: PropozycjaDzialania): AnalizaPytania {
  return {
    fakty,
    sprawy: sprawy.filter((s): s is SprawaKontekstu => s !== undefined).map((s) => s.idSprawy),
    ...(propozycja ? { propozycja } : {}),
    kodKomunikatu: '0148',
  };
}

// --- Nowy użytkownik (R-AS-NU) -------------------------------------------------------------------

function analizaNowegoUzytkownika(intencja: IntencjaAsystenta, k: KontekstAsystenta, w?: WskazaniePytania): AnalizaPytania {
  const sz = k.szczegoly;
  switch (intencja) {
    case 'wysokosc-zasilku':
    case 'otwarcie-kalkulatora':
    case 'porownanie-wariantow':
      return analiza([fakt('kalkulator', F.nuKalkulator)], [], KALKULATOR);
    case 'sprawy-na-tydzien':
      return analiza([fakt('brak-planu', F.nuBrakPlanu)], [], PROFIL_NA_START);
    case 'prawo-do-swiadczenia':
    case 'rozpoczecie-wniosku-zam':
    case 'sposob-zalatwienia': {
      const pozycje = pozycjeZTekstu(w?.wiadomosc ?? '');
      const oZasilek = pozycje.includes('K08') || /zasil/.test(normalizujTekst(w?.wiadomosc ?? ''));
      if (!oZasilek) return analiza([fakt('brak-planu', F.nuBrakPlanuOgolnie)], [], PROFIL_NA_START);
      const fakty: Fakt[] = [];
      const forma = sz?.daneZusKonta?.forma;
      const duch = sz?.daneZusKonta?.dobrowolneChorobowe ?? false;
      const kwota = sz?.kwotyKatalogu.swiadczenieRodzicielskie;
      if (forma === 'jdg' && !duch) fakty.push(fakt('forma', F.nuZasilekJdgBezDuch));
      else if (forma === 'umowa-zlecenia' && !duch) fakty.push(fakt('forma', F.nuZasilekUzBezDuch));
      else if (forma === 'umowa-o-prace') fakty.push(fakt('forma', F.nuZasilekUop));
      else if (forma === 'brak-tytulu') fakty.push(fakt('forma', F.nuZasilekBrakTytulu));
      else if (forma !== undefined) fakty.push(fakt('forma', F.nuZasilekZDuch));
      const bezZasilku = forma === 'brak-tytulu' || ((forma === 'jdg' || forma === 'umowa-zlecenia') && !duch);
      if (bezZasilku && kwota) {
        fakty.push(
          fakt(
            'swiadczenie-rodzicielskie',
            forma === 'brak-tytulu' ? F.nuSwiadczenieRodzicielskieBrakTytulu({ kwota }) : F.nuSwiadczenieRodzicielskie({ kwota }),
            [kwota],
          ),
        );
      }
      fakty.push(fakt('uzupelnij', F.nuUzupelnij));
      return analiza(fakty, [], PROFIL_NA_START);
    }
    default:
      return analiza([fakt('brak-planu', F.nuBrakPlanuOgolnie)], [], PROFIL_NA_START);
  }
}

// --- Rodzic i Drugi rodzic -----------------------------------------------------------------------

function analizaTerminu(k: KontekstAsystenta, wskazane: SprawaKontekstu[], w?: WskazaniePytania): AnalizaPytania {
  const s = wskazane[0];
  if (s === undefined) {
    if (pozycjeZTekstu(w?.wiadomosc ?? '').includes('K14')) return analizaBecikowego(k);
    return analiza([fakt('brak-sprawy', F.brakSprawy)], []);
  }
  return analiza(faktyTerminu(k, s), [s]);
}

function analizaBecikowego(k: KontekstAsystenta): AnalizaPytania {
  const s = sprawaPozycji(k, 'K14');
  if (s) {
    return analiza(
      [s.termin ? fakt('becikowe', F.becikoweWPlanie({ data: formatujDate(s.termin) }), [formatujDate(s.termin)], s.idSprawy) : fakt('becikowe', F.becikoweWPlanieBezTerminu)],
      [s],
    );
  }
  const prog = k.szczegoly?.kwotyKatalogu.progBecikowego;
  const dochod = k.szczegoly?.dochodNaOsobe;
  const fakty: Fakt[] = [];
  if (prog) fakty.push(fakt('prog', F.becikoweProg({ prog }), [prog]));
  if (dochod) fakty.push(fakt('dochod', F.becikoweDochod({ dochod }), [dochod]));
  fakty.push(fakt('popraw', F.becikowePoprawDochod));
  return analiza(fakty, [], przejdz('ViewProfileSummary', { tryb: 'rodzina' }));
}

function analizaPrawa(k: KontekstAsystenta, wskazane: SprawaKontekstu[], w?: WskazaniePytania): AnalizaPytania {
  const pozycje = pozycjeZTekstu(w?.wiadomosc ?? '');
  if (pozycje.includes('K14')) return analizaBecikowego(k);
  const s = wskazane[0];
  if (s === undefined) return analiza([fakt('brak', F.prawoBrak)], []);
  return analiza([fakt('w-planie', F.prawoWPlanie({ tytul: s.tytul }), [], s.idSprawy), ...faktyTerminu(k, s)], [s]);
}

function analizaTygodnia(k: KontekstAsystenta): AnalizaPytania {
  const koniec = dodajDni(k.dzis, 6);
  const doZrobienia = k.sprawy
    .filter((s) => s.status === 'do-zrobienia' && s.termin && porownajDaty(s.termin, k.dzis) >= 0)
    .sort((a, b) => porownajDaty(a.termin as string, b.termin as string));
  const wTygodniu = doZrobienia.filter((s) => porownajDaty(s.termin as string, koniec) <= 0);
  const pierwsza = wTygodniu[0];
  if (pierwsza === undefined) return analiza([fakt('brak', F.tydzienBrak)], []);
  const data = formatujDate(pierwsza.termin as string);
  const dni = String(dniDoTerminu(k, pierwsza) ?? roznicaDni(k.dzis, pierwsza.termin as string));
  const fakty: Fakt[] = [fakt('tydzien', F.tydzienSprawa({ tytul: zMalejLitery(pierwsza.tytul), data, liczbaDni: dni }), [data, dni], pierwsza.idSprawy)];
  const kolejna = doZrobienia.find((s) => s !== pierwsza && porownajDaty(s.termin as string, pierwsza.termin as string) > 0);
  if (kolejna) {
    const tegoDnia = doZrobienia.filter((s) => s.termin === kolejna.termin);
    const dataKolejna = formatujDate(kolejna.termin as string);
    fakty.push(fakt('kolejne', F.tydzienKolejne({ data: dataKolejna, sprawy: tegoDnia.map((s) => zMalejLitery(s.tytul)).join(' i ') }), [dataKolejna]));
  }
  fakty.push(fakt('wszystkie', F.tydzienWszystkie));
  return analiza(fakty, [pierwsza]);
}

function sprawaZasilku(k: KontekstAsystenta): SprawaKontekstu | undefined {
  return sprawaPozycji(k, 'K08') ?? sprawaPozycji(k, 'K07');
}

function analizaWysokosci(k: KontekstAsystenta): AnalizaPytania {
  const warianty = k.szczegoly?.warianty;
  const s = sprawaZasilku(k);
  const fakty: Fakt[] = [];
  if (warianty?.wariant100i70) {
    const w = warianty.wariant100i70;
    fakty.push(
      fakt(
        'wariant-100-70',
        F.wysokosc100i70({
          macierzynski: w.macierzynskiMiesiecznie,
          tygodnieMacierzynskiego: String(w.tygodnieMacierzynskiego),
          rodzicielski: w.rodzicielskiMiesiecznie,
          tygodnieRodzicielskiego: String(w.tygodnieRodzicielskiego),
          razem: w.razem,
        }),
        [w.macierzynskiMiesiecznie, String(w.tygodnieMacierzynskiego), w.rodzicielskiMiesiecznie, String(w.tygodnieRodzicielskiego), w.razem, '100', '70'],
      ),
    );
  }
  if (warianty?.wariant81) {
    const w = warianty.wariant81;
    fakty.push(fakt('wariant-81-5', F.wysokosc81({ miesiecznie: w.miesiecznie, tygodnie: String(w.tygodnie) }), [w.miesiecznie, String(w.tygodnie), '81,5']));
  }
  if (fakty.length === 0) return analiza([fakt('brak', F.wysokoscBrak)], [s], KALKULATOR);
  if (s?.termin && idPozycji(k, s) === 'K08') {
    const data = formatujDate(s.termin);
    fakty.push(fakt('wybor', F.wyborWariantu({ data }), [data], s.idSprawy));
  }
  return analiza(fakty, [s], KALKULATOR);
}

function analizaPorownania(k: KontekstAsystenta): AnalizaPytania {
  const warianty = k.szczegoly?.warianty;
  const s = sprawaZasilku(k);
  const propozycja = przejdz('ViewCalcMaternityVariant', s ? { sprawa: s.idSprawy } : undefined);
  const fakty: Fakt[] = [];
  if (warianty?.suma100i70 && warianty.suma81) {
    fakty.push(fakt('sumy', F.porownanieRowne({ suma100i70: warianty.suma100i70, suma81: warianty.suma81 }), [warianty.suma100i70, warianty.suma81, '100', '70', '81,5']));
    if (warianty.wariant81) fakty.push(fakt('miesiecznie', F.porownanieMiesiecznie({ miesiecznie: warianty.wariant81.miesiecznie }), [warianty.wariant81.miesiecznie, '81,5']));
    fakty.push(fakt('opis', F.porownanieOpis, ['100', '70']));
  } else {
    fakty.push(fakt('brak', F.porownanieBrak, ['100', '70', '81,5']));
  }
  if (s?.termin) {
    const data = formatujDate(s.termin);
    fakty.push(fakt('termin', F.porownanieTermin({ data }), [data, '81,5'], s.idSprawy));
  }
  return analiza(fakty, [s], propozycja);
}

function analizaUmowyOPrace(k: KontekstAsystenta): AnalizaPytania {
  const s = sprawaPozycji(k, 'K07');
  const fakty: Fakt[] = [fakt('pracodawca', F.uopPracodawca), fakt('bez-wniosku', F.uopBezWniosku)];
  if (s?.termin) {
    const data = formatujDate(s.termin);
    fakty.push(fakt('termin', F.uopTermin({ data }), [data], s.idSprawy));
  }
  fakty.push(fakt('instrukcja', F.uopInstrukcja));
  return analiza(fakty, [s], s ? przejdz('ViewCaseGuide', { idSprawy: s.idSprawy }) : undefined);
}

function analizaWnioskuZam(k: KontekstAsystenta): AnalizaPytania {
  if (k.profil?.formaMatki === 'umowa-o-prace') return analizaUmowyOPrace(k);
  const s = sprawaPozycji(k, 'K08');
  if (s === undefined) return analiza([fakt('brak', F.zamBrakSprawy)], []);
  const fakty: Fakt[] = [fakt('forma', k.profil?.formaMatki === 'umowa-zlecenia' ? F.zamUz : F.zamJdg, [], s.idSprawy)];
  const dataPorodu = k.profil?.dataPorodu;
  const potwierdzona = k.szczegoly?.dataPoroduPotwierdzona === true && dataPorodu !== undefined;
  if (!potwierdzona) {
    fakty.push(fakt('data-porodu', F.zamBezDatyPorodu));
    return analiza(fakty, [s]);
  }
  const data = formatujDate(dataPorodu);
  fakty.push(fakt('data-porodu', F.zamDataPotwierdzona({ data }), [data]), fakt('rodzaj-urlopu', F.zamRodzajUrlopu));
  const propozycja = przejdz('ViewZamLeaveType', { sprawa: s.idSprawy });
  return analiza(fakty, [s], dozwoloneDzialanieDlaSpraw(k.rola, propozycja, k.sprawy) ? propozycja : undefined);
}

function analizaSposobu(k: KontekstAsystenta, wskazane: SprawaKontekstu[], w?: WskazaniePytania): AnalizaPytania {
  const tekst = normalizujTekst(w?.wiadomosc ?? '');
  const oZasilek = /zasil/.test(tekst) || wskazane.some((s) => ['K07', 'K08'].includes(idPozycji(k, s)));
  if (oZasilek) return analizaWnioskuZam(k);
  const s = wskazane[0];
  if (s === undefined) return analiza([fakt('brak-sprawy', F.brakSprawy)], []);
  const kanal = k.katalog.pozycje.find((p) => p.id === idPozycji(k, s))?.kanal;
  const fakty = [
    ...(kanal ? [fakt('kanal', F.sposobSprawy({ tytul: s.tytul, kanal }), [], s.idSprawy)] : []),
    fakt('instrukcja', F.sposobInstrukcja),
  ];
  return analiza(fakty, [s], przejdz('ViewCaseGuide', { idSprawy: s.idSprawy }));
}

function analizaOznaczenia(k: KontekstAsystenta, wskazane: SprawaKontekstu[], w?: WskazaniePytania): AnalizaPytania {
  const s = wskazane[0];
  if (s === undefined) return analiza([fakt('brak-sprawy', F.oznaczBrakSprawy)], []);
  const tekst = normalizujTekst(w?.wiadomosc ?? '');
  const status: 'zlozona' | 'zalatwiona' = /zlozon|zlozyl|wyslal/.test(tekst) && !/zglosil/.test(tekst) ? 'zlozona' : 'zalatwiona';
  if (s.status === status || s.status === 'zalatwiona') {
    return analiza([fakt('juz', F.oznaczJuz({ tytul: s.tytul, status: statusTekst(s) }), [], s.idSprawy)], [s]);
  }
  if (!czyRolaZmieniaSprawe(k.rola, s.rodzic)) {
    const osoba = k.szczegoly?.imionaRodzicow.matka ?? teksty.SheetAssistantActionConfirm.kogoDotyczy.matka.toLowerCase();
    return analiza(
      [fakt('nie-twoja', F.oznaczNieTwoja({ tytul: s.tytul, osoba }), [], s.idSprawy), fakt('status', F.oznaczNieTwojaStatus)],
      [s],
    );
  }
  const propozycja: PropozycjaDzialania = { rodzaj: 'oznacz-sprawe', idSprawy: s.idSprawy, status };
  const fakty: Fakt[] = [];
  if (s.termin) {
    const data = formatujDate(s.termin);
    fakty.push(fakt('stan', F.oznaczPropozycja({ tytul: s.tytul, status: statusTekst(s), data }), [data], s.idSprawy));
  } else {
    fakty.push(fakt('stan', F.oznaczPropozycjaBezTerminu({ tytul: s.tytul, status: statusTekst(s) }), [], s.idSprawy));
  }
  fakty.push(fakt('propozycja', status === 'zalatwiona' ? F.oznaczZalatwiona : F.oznaczZlozona));
  return analiza(fakty, [s], dozwoloneDzialanieDlaSpraw(k.rola, propozycja, k.sprawy) ? propozycja : undefined);
}

function analizaInstrukcji(k: KontekstAsystenta, wskazane: SprawaKontekstu[]): AnalizaPytania {
  const s = wskazane[0];
  if (s === undefined) return analiza([fakt('brak-sprawy', F.brakSprawy)], []);
  return analiza([fakt('instrukcja', F.instrukcja({ tytul: s.tytul }), [], s.idSprawy)], [s], przejdz('ViewCaseGuide', { idSprawy: s.idSprawy }));
}

/** Pełna analiza pytania: fakty, sprawy, propozycja działania i akcje kanałów. */
export function analizujPytanie(intencja: IntencjaAsystenta, k: KontekstAsystenta, w?: WskazaniePytania): AnalizaPytania {
  if (czyPozaZakresem(intencja)) {
    return {
      fakty: [fakt('poza-zakresem', teksty.komunikaty['0070'])],
      sprawy: [],
      akcjeKanalow: ['pytanie-do-zus', 'e-wizyta', 'mama-zus'],
      kodKomunikatu: '0070',
    };
  }
  if (k.rola === 'nowy-uzytkownik' || k.profil === null) return analizaNowegoUzytkownika(intencja, k, w);
  const wskazane = sprawyWskazane(k, w);
  switch (intencja) {
    case 'termin-sprawy':
      return analizaTerminu(k, wskazane, w);
    case 'prawo-do-swiadczenia':
      return analizaPrawa(k, wskazane, w);
    case 'sprawy-na-tydzien':
      return analizaTygodnia(k);
    case 'wysokosc-zasilku':
      return analizaWysokosci(k);
    case 'porownanie-wariantow':
      return analizaPorownania(k);
    case 'rozpoczecie-wniosku-zam':
      return analizaWnioskuZam(k);
    case 'sposob-zalatwienia':
      return analizaSposobu(k, wskazane, w);
    case 'oznaczenie-sprawy':
      return analizaOznaczenia(k, wskazane, w);
    case 'otwarcie-kalkulatora':
      return analiza([fakt('kalkulator', F.kalkulator)], [sprawaZasilku(k)], KALKULATOR);
    case 'otwarcie-instrukcji':
      return analizaInstrukcji(k, wskazane);
    case 'uzupelnienie-profilu':
      return analiza([fakt('profil', F.profilPlan)], [], przejdz('ViewProfileSummary', { tryb: 'rodzina' }));
    default:
      return analiza([fakt('brak-sprawy', F.brakSprawy)], []);
  }
}

/** Fakty z kontekstu potrzebne do odpowiedzi na intencję. */
export function faktyDlaIntencji(intencja: IntencjaAsystenta, kontekst: KontekstAsystenta, wskazanie?: WskazaniePytania): Fakt[] {
  return analizujPytanie(intencja, kontekst, wskazanie).fakty;
}

/** Tekst odpowiedzi z szablonów faktów (najwyżej 5 zdań). */
export function tekstZFaktow(fakty: readonly Fakt[]): string {
  return fakty
    .map((f) => f.tekst)
    .join(' ')
    .split(/(?<=[.!?])\s+/)
    .slice(0, 5)
    .join(' ');
}

/** Kod komunikatu stopki odpowiedzi: 0148 przy odpowiedzi merytorycznej, 0070 poza zakresem. */
export type KodOdpowiedzi = Extract<KodKomunikatu, '0070' | '0148'>;
