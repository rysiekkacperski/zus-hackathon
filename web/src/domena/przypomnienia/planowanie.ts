// Planowanie przypomnień o terminach (kontrakt, sekcja 7.2; historyjka 3.2.1.1.1, wymaganie Dni przypomnień).
// Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
//
// Dla każdej sprawy do zrobienia z terminem T i wyprzedzeniem W przypomnienia przypadają o 9:00
// w dniach T − W, T − 7 (gdy W < 7) i T. Gdy termin pojawia się w dniu albo po dniu pierwszego
// przypomnienia, przypomnienie zaległe wychodzi od razu w oknie 8:00–21:00, a poza nim o najbliższej 9:00.
// Funkcja jest czysta: wynik zastępuje przypomnienia rodziny na każdym koncie z `ustawienia`,
// a doręczenie wykonuje operacja doreczZaplanowane.
import './rozszerzenia-typow';
import { czesciZnacznika, dataZeZnacznika, dodajDni, roznicaDni, zbudujZnacznik } from '@/domena/daty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { trescPrzypomnienia, adresInstrukcji, type DaneTresciPrzypomnienia } from '@/domena/przypomnienia/tresc';
import type {
  DaneRodziny,
  DataISO,
  IdSprawy,
  KalendarzTerminow,
  KanalDoreczenia,
  Katalog,
  Pesel,
  PlanRodziny,
  PozycjaPlanu,
  Powiadomienie,
  Ustawienia,
  ZnacznikCzasu,
} from '@/domena/typy';

export interface WejsciePrzypomnien {
  plan: PlanRodziny;
  kalendarz: KalendarzTerminow;
  daneRodziny: DaneRodziny;
  ustawienia: Record<Pesel, Ustawienia | null>;
  poprzednie: Record<Pesel, Powiadomienie[]>;
  teraz: ZnacznikCzasu;
  /** Katalog do tytułów spraw; bez niego tytuł uzupełnia doręczenie z bieżącego katalogu. */
  katalog?: Katalog;
}

export const GODZINA_WYSYLKI = 9;
export const POCZATEK_OKNA_NATYCHMIASTOWEGO = 8;
export const KONIEC_OKNA_NATYCHMIASTOWEGO = 21;
export const WYPRZEDZENIE_DOMYSLNE = 7;
export const WYPRZEDZENIE_MIN = 1;
export const WYPRZEDZENIE_MAX = 30;
const DODATKOWE_PRZYPOMNIENIE_DNI = 7;

/** Ustawienia konta, które nie zmieniało ustawień przypomnień (wymaganie Kanały przypomnień). */
export function ustawieniaDomyslne(emailZKontaZus: string | undefined): Ustawienia {
  return {
    przypomnieniaWlaczone: true,
    wyprzedzenieDni: WYPRZEDZENIE_DOMYSLNE,
    kanalEmail: true,
    adresEmail: emailZKontaZus?.trim() ?? '',
    adresEmailZrodlo: 'konto-zus',
    kanalSms: false,
    numerTelefonu: '',
    stanNumeru: 'niepotwierdzony',
  };
}

/** Zapisane ustawienia albo ustawienia domyślne z adresem e-mail z danych konta ZUS. */
export function ustawieniaSkuteczne(ustawienia: Ustawienia | null, emailZKontaZus: string | undefined): Ustawienia {
  return ustawienia ?? ustawieniaDomyslne(emailZKontaZus);
}

/** Kanał SMS działa wyłącznie z numerem potwierdzonym kodem. */
export function czySmsPotwierdzony(u: Ustawienia): boolean {
  return u.kanalSms && u.stanNumeru === 'potwierdzony' && Boolean(u.numerPotwierdzony);
}

/**
 * Brak adresu do przypomnień (komunikat 0218; historyjka 3.2.1.1.3, wymaganie Kanały przypomnień):
 * ani dane konta ZUS, ani ustawienia przewodnika konta nie zawierają adresu e-mail, a kanał SMS
 * nie jest potwierdzony.
 */
export function czyBrakAdresuDoPrzypomnien(u: Ustawienia, emailZKontaZus?: string): boolean {
  const email = u.adresEmail.trim() !== '' || (emailZKontaZus?.trim() ?? '') !== '';
  return !email && !czySmsPotwierdzony(u);
}

/**
 * Konta docelowe sprawy (historyjka 3.2.1.1.3, wymaganie Role): sprawa drugiego rodzica trafia do konta Rodzic
 * do czasu dołączenia drugiego rodzica, a po dołączeniu do konta Drugi rodzic. Sprawa obojga rodziców
 * i sprawa, którą załatwia matka albo ojciec, trafia do obu kont.
 */
export function kontaDocelowe(pozycja: PozycjaPlanu, daneRodziny: DaneRodziny): Pesel[] {
  const aktywne = daneRodziny.dostepKont.filter((d) => d.stan === 'aktywny');
  const peselRodzica = aktywne.find((d) => d.rola === 'rodzic')?.pesel ?? daneRodziny.idRodziny;
  const peselDolaczonego = aktywne.find((d) => d.rola === 'drugi-rodzic' && d.pesel !== peselRodzica)?.pesel;
  const rodzicJestMatka = daneRodziny.rodzicKonta === 'matka';
  const peselMatki = rodzicJestMatka ? peselRodzica : peselDolaczonego;
  const peselDrugiegoRodzica = rodzicJestMatka ? peselDolaczonego : peselRodzica;
  switch (pozycja.rodzic) {
    case 'matka':
      return [peselMatki ?? peselRodzica];
    case 'drugi-rodzic':
      return [peselDrugiegoRodzica ?? peselRodzica];
    case 'oboje-rodzice':
    case 'matka-albo-ojciec':
      return peselDolaczonego === undefined ? [peselRodzica] : [peselRodzica, peselDolaczonego];
    default:
      return [peselRodzica];
  }
}

/** Dni wysyłki przypomnień o 9:00 dla terminu T i wyprzedzenia W, rosnąco. */
export function dniPrzypomnien(termin: DataISO, wyprzedzenieDni: number): DataISO[] {
  const w = Math.min(WYPRZEDZENIE_MAX, Math.max(WYPRZEDZENIE_MIN, Math.trunc(wyprzedzenieDni)));
  const dni = new Set<DataISO>([dodajDni(termin, -w), termin]);
  if (w < DODATKOWE_PRZYPOMNIENIE_DNI) dni.add(dodajDni(termin, -DODATKOWE_PRZYPOMNIENIE_DNI));
  return [...dni].sort();
}

/** Chwila wysyłki przypomnienia zaległego: od razu w oknie 8:00–21:00, poza nim najbliższa 9:00. */
export function chwilaWysylkiZaleglej(teraz: ZnacznikCzasu): ZnacznikCzasu {
  const { godzina } = czesciZnacznika(teraz);
  const dzis = dataZeZnacznika(teraz);
  if (godzina >= POCZATEK_OKNA_NATYCHMIASTOWEGO && godzina < KONIEC_OKNA_NATYCHMIASTOWEGO) return teraz;
  if (godzina < POCZATEK_OKNA_NATYCHMIASTOWEGO) return zbudujZnacznik(dzis, GODZINA_WYSYLKI, 0);
  return zbudujZnacznik(dodajDni(dzis, 1), GODZINA_WYSYLKI, 0);
}

/** Identyfikator przypomnienia: ten sam dla tej samej sprawy, terminu, dnia wysyłki i kanału. */
export function idPrzypomnienia(
  idRodziny: string,
  idSprawy: IdSprawy,
  termin: DataISO,
  dzienWysylki: DataISO,
  kanal: KanalDoreczenia,
): string {
  return `PRZ-${idRodziny}-${idSprawy}-${termin}-${dzienWysylki}-${kanal}`;
}

interface KanalKonta {
  kanal: KanalDoreczenia;
  adresat: string; // pusty adres e-mail uzupełnia doręczenie z danych konta ZUS
}

function kanalyKonta(u: Ustawienia | null): KanalKonta[] {
  if (u === null) return [{ kanal: 'email', adresat: '' }];
  if (!u.przypomnieniaWlaczone) return [];
  const kanaly: KanalKonta[] = [];
  if (u.kanalEmail && u.adresEmail.trim() !== '') kanaly.push({ kanal: 'email', adresat: u.adresEmail.trim() });
  if (czySmsPotwierdzony(u)) kanaly.push({ kanal: 'sms', adresat: u.numerPotwierdzony ?? u.numerTelefonu });
  return kanaly;
}

function czyPrzypomnienieOTerminie(p: Powiadomienie): boolean {
  return p.rodzaj === 'przypomnienie-przed-terminem' || p.rodzaj === 'przypomnienie-w-dniu-terminu';
}

interface Terminy {
  pozycja: PozycjaPlanu;
  termin: DataISO;
  koszt: DaneTresciPrzypomnienia['koszt'];
}

/** Sprawy do zrobienia z terminem (także drugim terminem), bez spraw pozostawionych bez przypomnień. */
function terminySpraw(plan: PlanRodziny, kalendarz: KalendarzTerminow): Terminy[] {
  const wynik: Terminy[] = [];
  for (const pozycja of plan.pozycje) {
    if (pozycja.status !== 'do-zrobienia' || pozycja.bezPrzypomnien) continue;
    const termin = kalendarz.terminy.find((t) => t.idSprawy === pozycja.idSprawy);
    if (!termin) continue;
    const daty = [termin.termin, termin.drugiTermin?.data].filter((d): d is DataISO => Boolean(d));
    for (const data of new Set(daty)) wynik.push({ pozycja, termin: data, koszt: termin.koszt });
  }
  return wynik;
}

export function zaplanujPrzypomnienia(w: WejsciePrzypomnien): Record<Pesel, Powiadomienie[]> {
  const idRodziny = w.daneRodziny.idRodziny;
  const terminy = terminySpraw(w.plan, w.kalendarz);
  const wynik: Record<Pesel, Powiadomienie[]> = {};

  for (const pesel of Object.keys(w.ustawienia)) {
    const poprzednie = (w.poprzednie[pesel] ?? []).filter(
      (p) => czyPrzypomnienieOTerminie(p) && p.idRodziny === idRodziny,
    );
    // Historia (wysłane, pominięte, nieudane) zostaje bez zmian; zaplanowane powstają od nowa.
    const historia = poprzednie.filter((p) => p.statusDoreczenia !== 'zaplanowane');
    const idHistorii = new Set(historia.map((p) => p.id));
    const zaplanowanePoprzednio = new Map(
      poprzednie.filter((p) => p.statusDoreczenia === 'zaplanowane').map((p) => [p.id, p]),
    );
    const ustawienia = w.ustawienia[pesel] ?? null;
    const kanaly = kanalyKonta(ustawienia);
    const wyprzedzenie = ustawienia?.wyprzedzenieDni ?? WYPRZEDZENIE_DOMYSLNE;
    const nowe: Powiadomienie[] = [];

    for (const { pozycja, termin, koszt } of terminy) {
      if (!kontaDocelowe(pozycja, w.daneRodziny).includes(pesel)) continue;
      const tytul = w.katalog ? tytulSprawy(w.katalog, pozycja.idSprawy) : pozycja.idSprawy;
      const dni = dniPrzypomnien(termin, wyprzedzenie);

      for (const { kanal, adresat } of kanaly) {
        const utworz = (dzien: DataISO, planowanaWysylka: ZnacznikCzasu): void => {
          const id = idPrzypomnienia(idRodziny, pozycja.idSprawy, termin, dzien, kanal);
          if (idHistorii.has(id) || nowe.some((p) => p.id === id)) return;
          const liczbaDni = roznicaDni(dzien, termin);
          const rodzaj = liczbaDni === 0 ? 'przypomnienie-w-dniu-terminu' : 'przypomnienie-przed-terminem';
          const { temat, tresc } = trescPrzypomnienia({ rodzaj, kanal, idSprawy: pozycja.idSprawy, tytul, termin, liczbaDni, koszt });
          nowe.push({
            id,
            elementTworzacy: 'kalendarz-terminow',
            rodzaj,
            idRodziny,
            idSprawy: pozycja.idSprawy,
            kontoDocelowe: pesel,
            termin,
            liczbaDni,
            planowanaWysylka,
            kanal,
            adresat,
            ...(temat === undefined ? {} : { temat }),
            tresc,
            adresInstrukcji: adresInstrukcji(pozycja.idSprawy),
            statusDoreczenia: 'zaplanowane',
            statusOdczytu: 'nieodczytane',
            kosztSpoznienia: koszt,
          });
        };

        const wczesniejsze = poprzednie.some(
          (p) => p.idSprawy === pozycja.idSprawy && p.termin === termin && p.kanal === kanal,
        );
        const pierwsze = zbudujZnacznik(dni[0], GODZINA_WYSYLKI, 0);

        // Przypomnienia zaplanowane wcześniej, których chwila minęła, czekają na doręczenie.
        for (const p of zaplanowanePoprzednio.values()) {
          if (p.idSprawy !== pozycja.idSprawy || p.termin !== termin || p.kanal !== kanal) continue;
          if (p.planowanaWysylka <= w.teraz) utworz(dataZeZnacznika(p.planowanaWysylka), p.planowanaWysylka);
        }
        // Przyszłe przypomnienia czekają na 9:00.
        for (const dzien of dni) {
          const chwila = zbudujZnacznik(dzien, GODZINA_WYSYLKI, 0);
          if (chwila > w.teraz) utworz(dzien, chwila);
        }

        // Termin wyliczony w dniu albo po dniu pierwszego przypomnienia: jedno przypomnienie zaległe.
        if (!wczesniejsze && pierwsze <= w.teraz) {
          const chwila = chwilaWysylkiZaleglej(w.teraz);
          const dzien = dataZeZnacznika(chwila);
          const pokryte = dni.some((d) => d === dzien && zbudujZnacznik(d, GODZINA_WYSYLKI, 0) > w.teraz);
          if (dzien <= termin && !pokryte) utworz(dzien, chwila);
        }
      }
    }

    nowe.sort((a, b) => (a.planowanaWysylka < b.planowanaWysylka ? -1 : a.planowanaWysylka > b.planowanaWysylka ? 1 : 0));
    wynik[pesel] = [...historia, ...nowe];
  }

  return wynik;
}
