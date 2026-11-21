// Walidacja i zapis ustawień przypomnień (historyjka 3.2.1.1.2, sekcja Walidacja). Właściciel: u18.
// Funkcje są czyste: chwilę i ustawienia dostają od operacji magazynu.
import { roznicaSekund } from '@/domena/daty';
import { WYPRZEDZENIE_MAX, WYPRZEDZENIE_MIN } from '@/domena/przypomnienia/planowanie';
import type { BledyPol, Ustawienia, ZnacznikCzasu } from '@/domena/typy';
import { normalizujTelefon, walidujEmail, walidujLiczbeCalkowita, walidujTelefon } from '@/domena/walidacje';

/** Ważność kodu weryfikacyjnego SMS od chwili wysłania (włącznie). */
export const WAZNOSC_KODU_SEKUNDY = 10 * 60;
export const DLUGOSC_KODU = 6;

/** Pola sekcji przypomnień na ViewGuideSettings przed walidacją. */
export interface PolaPrzypomnien {
  przypomnieniaWlaczone: boolean;
  wyprzedzenieDni: string;
  kanalEmail: boolean;
  adresEmail: string;
  kanalSms: boolean;
  numerTelefonu: string;
  kodWeryfikacyjny?: string;
}

export type PolePrzypomnien = 'wyprzedzenieDni' | 'kanaly' | 'adresEmail' | 'numerTelefonu' | 'kodWeryfikacyjny';

/** Stan potwierdzenia numeru wpisanego w polu numeru telefonu. */
export type StanNumeruWFormularzu = 'potwierdzony' | 'kod-wyslany' | 'czeka-na-kod';

/** Kod SMS wysłano na numer z pola i nie potwierdzono go jeszcze. */
export function czyKodWyslanyNaNumer(u: Ustawienia | null, numerZPola: string): boolean {
  const kod = u?.kodWeryfikacyjny;
  return kod !== undefined && kod.numer === normalizujTelefon(numerZPola);
}

/** Stan numeru z pola: potwierdzony (ten sam numer co potwierdzony), z wysłanym kodem albo czekający na kod. */
export function stanNumeruWFormularzu(u: Ustawienia | null, numerZPola: string): StanNumeruWFormularzu {
  const numer = normalizujTelefon(numerZPola);
  if (u?.stanNumeru === 'potwierdzony' && u.numerPotwierdzony === numer && numer !== '') return 'potwierdzony';
  if (czyKodWyslanyNaNumer(u, numerZPola)) return 'kod-wyslany';
  return 'czeka-na-kod';
}

/** Sprawdzenie kodu weryfikacyjnego: format (0217), ważność 10 minut (0054), zgodność z wysłanym (0053). */
export function sprawdzKod(
  wpisany: string,
  wyslany: { kod: string; wyslano: ZnacznikCzasu } | undefined,
  teraz: ZnacznikCzasu,
): '0217' | '0053' | '0054' | null {
  const kod = wpisany.trim();
  if (!new RegExp(`^\\d{${DLUGOSC_KODU}}$`).test(kod)) return '0217';
  if (wyslany === undefined) return '0053';
  if (roznicaSekund(wyslany.wyslano, teraz) > WAZNOSC_KODU_SEKUNDY) return '0054';
  return kod === wyslany.kod ? null : '0053';
}

/**
 * Walidacja formularza przypomnień przy zapisie. Przy wyłączonych przypomnieniach formularz nie wymaga
 * pozostałych pól. Kod sprawdza się wtedy, gdy wysłano go na numer z pola.
 */
export function walidujUstawieniaPrzypomnien(
  f: PolaPrzypomnien,
  zapisane: Ustawienia | null,
  teraz: ZnacznikCzasu,
): BledyPol<PolePrzypomnien> {
  const bledy: BledyPol<PolePrzypomnien> = {};
  if (!f.przypomnieniaWlaczone) return bledy;

  const wyprzedzenie = walidujLiczbeCalkowita(f.wyprzedzenieDni, WYPRZEDZENIE_MIN, WYPRZEDZENIE_MAX, '0052');
  if ('kod' in wyprzedzenie) bledy.wyprzedzenieDni = wyprzedzenie.kod;

  if (!f.kanalEmail && !f.kanalSms) bledy.kanaly = '0214';

  if (f.kanalEmail) {
    const blad = walidujEmail(f.adresEmail, true);
    if (blad) bledy.adresEmail = blad;
  }

  if (f.kanalSms) {
    const bladNumeru = walidujTelefon(f.numerTelefonu);
    if (bladNumeru) {
      bledy.numerTelefonu = bladNumeru;
    } else if (stanNumeruWFormularzu(zapisane, f.numerTelefonu) === 'kod-wyslany') {
      const bladKodu = sprawdzKod(f.kodWeryfikacyjny ?? '', zapisane?.kodWeryfikacyjny, teraz);
      if (bladKodu) bledy.kodWeryfikacyjny = bladKodu;
    }
  }
  return bledy;
}

/** Walidacja numeru przy wysłaniu kodu (0213, 0124). */
export function walidujNumerDoKodu(numer: string): '0213' | '0124' | null {
  return walidujTelefon(numer);
}

/**
 * Nowe Ustawienia po poprawnej walidacji. Kod zgodny z wysłanym potwierdza numer, zmiana potwierdzonego
 * numeru bez kodu daje stan „wymaga potwierdzenia nowego numeru”, a wyłączenie przypomnień zachowuje
 * pozostałe ustawienia.
 */
export function noweUstawienia(
  f: PolaPrzypomnien,
  zapisane: Ustawienia,
  emailZKontaZus: string | undefined,
  teraz: ZnacznikCzasu,
): Ustawienia {
  if (!f.przypomnieniaWlaczone) return { ...zapisane, przypomnieniaWlaczone: false, zapisano: teraz };

  const adresEmail = f.adresEmail.trim();
  const numer = normalizujTelefon(f.numerTelefonu);
  const wspolne: Ustawienia = {
    ...zapisane,
    przypomnieniaWlaczone: true,
    wyprzedzenieDni: Number(f.wyprzedzenieDni.replace(/\s/g, '')),
    kanalEmail: f.kanalEmail,
    adresEmail: f.kanalEmail ? adresEmail : zapisane.adresEmail,
    adresEmailZrodlo: f.kanalEmail
      ? adresEmail === (emailZKontaZus?.trim() ?? '')
        ? 'konto-zus'
        : 'uzytkownik'
      : zapisane.adresEmailZrodlo,
    kanalSms: f.kanalSms,
    zapisano: teraz,
  };
  if (!f.kanalSms) return wspolne;

  const stan = stanNumeruWFormularzu(zapisane, f.numerTelefonu);
  if (stan === 'potwierdzony') return { ...wspolne, numerTelefonu: numer, stanNumeru: 'potwierdzony' };
  if (stan === 'kod-wyslany') {
    const { kodWeryfikacyjny, ...bezKodu } = wspolne;
    void kodWeryfikacyjny;
    return { ...bezKodu, numerTelefonu: numer, stanNumeru: 'potwierdzony', numerPotwierdzony: numer };
  }
  const bylPotwierdzony = zapisane.stanNumeru !== 'niepotwierdzony' && zapisane.numerPotwierdzony !== undefined;
  return {
    ...wspolne,
    numerTelefonu: numer,
    stanNumeru: bylPotwierdzony ? 'wymaga-potwierdzenia-nowego' : 'niepotwierdzony',
  };
}

/** Pierwsze pole z błędem w kolejności formularza (fokus po nieudanym zapisie). */
export const KOLEJNOSC_POL: readonly PolePrzypomnien[] = [
  'wyprzedzenieDni',
  'kanaly',
  'adresEmail',
  'numerTelefonu',
  'kodWeryfikacyjny',
];

export function pierwszyBlad(bledy: BledyPol<PolePrzypomnien>): PolePrzypomnien | null {
  return KOLEJNOSC_POL.find((p) => bledy[p] !== undefined) ?? null;
}

