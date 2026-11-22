// Treść przypomnień e-mail i SMS (kontrakt, sekcja 7.2; historyjka 3.2.1.1.1, Draft wiadomości).
// Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import type {
  DataISO,
  Grosze,
  IdSprawy,
  KanalDoreczenia,
  KosztSpoznienia,
  RodzajPowiadomienia,
} from '@/domena/typy';
import { teksty } from '@/teksty';

/** Najwyższa długość jednej wiadomości SMS. */
export const MAKS_DLUGOSC_SMS = 160;
/** Najwyższa długość tytułu sprawy w SMS. */
export const MAKS_TYTUL_SMS = 40;

const t = teksty.PowiadomieniaPrzypomnienia;

const ODPOWIEDNIKI: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
  Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z',
};

/**
 * Tekst SMS bez polskich znaków diakrytycznych, z cudzysłowami „ i ” zamienionymi na prosty cudzysłów "
 * (historyjka 3.2.1.1.3, wymaganie Treść SMS); twarda spacja staje się zwykłą spacją.
 */
export function transliterujSms(tekst: string): string {
  return tekst
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (znak) => ODPOWIEDNIKI[znak] ?? znak)
    .replace(/[„”“]/g, '"')
    .replace(/ /g, ' ');
}

/** Tytuł skrócony do `maks` pierwszych znaków (w SMS 40), bez wielokropka. */
export function skrocTytul(tekst: string, maks: number): string {
  const znaki = Array.from(tekst);
  return znaki.length <= maks ? tekst : znaki.slice(0, maks).join('').trimEnd();
}

/** Adres instrukcji sprawy w przewodniku (ViewCaseGuide). */
export function adresInstrukcji(idSprawy: IdSprawy): string {
  return `/sprawy/${encodeURIComponent(idSprawy)}/instrukcja`;
}

/** Najwyższa długość skróconego adresu instrukcji sprawy w SMS (historyjka 3.2.1.1.3, wymaganie Treść SMS). */
export const MAKS_ADRES_SMS = 30;

/** Skrócony adres instrukcji sprawy w SMS, najwyżej 30 znaków; prowadzi do tej samej instrukcji co adres pełny. */
export function adresKrotkiSms(idSprawy: IdSprawy): string {
  return `/s/${encodeURIComponent(idSprawy)}`.slice(0, MAKS_ADRES_SMS);
}

/** Kwota w SMS: złote bez separatora tysięcy, grosze po przecinku tylko wtedy, gdy są (2400, 1234,50). */
export function kwotaSms(grosze: Grosze): string {
  const zlote = Math.trunc(grosze / 100);
  const reszta = Math.abs(grosze % 100);
  return reszta === 0 ? String(zlote) : `${zlote},${String(reszta).padStart(2, '0')}`;
}

function bezKropkiNaKoncu(tekst: string): string {
  return tekst.trim().replace(/[.\s]+$/, '');
}

/** Kwota spóźnienia z Terminów: pole `kwota` zawiera sumę dla wszystkich dzieci. */
function kwotaSpoznienia(koszt: KosztSpoznienia): Grosze | null {
  return koszt.rodzaj === 'kwota' ? koszt.kwota : null;
}

/** Zdanie o koszcie albo skutku spóźnienia w wiadomości e-mail i w opisie wydarzenia; pusty tekst bez kosztu. */
export function spoznienieEmail(koszt: KosztSpoznienia | undefined): string {
  if (koszt === undefined || koszt.rodzaj === 'brak') return '';
  const kwota = kwotaSpoznienia(koszt);
  if (kwota !== null) return t.kosztEmail({ kwota: formatujKwote(kwota) });
  if (koszt.rodzaj === 'skutek' && koszt.tekst.trim() !== '') return t.skutekEmail({ skutek: bezKropkiNaKoncu(koszt.tekst) });
  return '';
}

/** Informacja o spóźnieniu w SMS; pusty tekst bez kosztu. */
export function spoznienieSms(koszt: KosztSpoznienia | undefined): string {
  if (koszt === undefined || koszt.rodzaj === 'brak') return '';
  const kwota = kwotaSpoznienia(koszt);
  if (kwota !== null) return t.kosztSms({ kwota: kwotaSms(kwota) });
  return t.skutekSms;
}

export interface DaneTresciPrzypomnienia {
  rodzaj: Extract<RodzajPowiadomienia, 'przypomnienie-przed-terminem' | 'przypomnienie-w-dniu-terminu'>;
  kanal: KanalDoreczenia;
  idSprawy: IdSprawy;
  tytul: string;
  termin: DataISO;
  liczbaDni: number;
  koszt: KosztSpoznienia | undefined;
}

export interface TrescWiadomosci {
  temat?: string;
  tresc: string;
}

function smsPrzypomnienia(d: DaneTresciPrzypomnienia, tytul: string): string {
  const wspolne = { tytul, informacja: spoznienieSms(d.koszt), adres: adresKrotkiSms(d.idSprawy) };
  const tekst =
    d.rodzaj === 'przypomnienie-w-dniu-terminu'
      ? t.smsWDniuTerminu(wspolne)
      : t.smsPrzedTerminem({ ...wspolne, termin: formatujDate(d.termin), zostalo: t.zostaloDni({ liczbaDni: d.liczbaDni }) });
  return transliterujSms(tekst);
}

/**
 * Temat i treść przypomnienia według draftów wiadomości. SMS: tytuł skrócony do 40 znaków, bez polskich
 * znaków, jedna wiadomość do 160 znaków (przy dłuższym identyfikatorze sprawy tytuł skraca się dalej).
 */
export function trescPrzypomnienia(d: DaneTresciPrzypomnienia): TrescWiadomosci {
  if (d.kanal === 'sms') {
    let dlugoscTytulu = MAKS_TYTUL_SMS;
    let tekst = smsPrzypomnienia(d, skrocTytul(d.tytul, dlugoscTytulu));
    while (tekst.length > MAKS_DLUGOSC_SMS && dlugoscTytulu > 1) {
      dlugoscTytulu -= 1;
      tekst = smsPrzypomnienia(d, skrocTytul(d.tytul, dlugoscTytulu));
    }
    return { tresc: tekst };
  }
  const spoznienie = spoznienieEmail(d.koszt);
  const adres = adresInstrukcji(d.idSprawy);
  if (d.rodzaj === 'przypomnienie-w-dniu-terminu') {
    return {
      temat: t.emailWDniuTerminu.temat({ tytul: d.tytul }),
      tresc: t.emailWDniuTerminu.tresc({ tytul: d.tytul, spoznienie, adres }),
    };
  }
  const termin = formatujDate(d.termin);
  return {
    temat: t.emailPrzedTerminem.temat({ tytul: d.tytul, termin }),
    tresc: t.emailPrzedTerminem.tresc({
      termin,
      zostalo: t.zostaloDni({ liczbaDni: d.liczbaDni }),
      tytul: d.tytul,
      spoznienie,
      adres,
    }),
  };
}

/** Treść SMS z kodem weryfikacyjnym (draft Kod weryfikacyjny SMS z 3.2.1.1.2). */
export function trescKoduSms(kod: string): string {
  return transliterujSms(t.smsKodWeryfikacyjny({ kod }));
}
