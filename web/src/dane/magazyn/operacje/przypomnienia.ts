// Ustawienia przypomnień, kod SMS i doręczenie zaplanowanych przypomnień (kontrakt, sekcja 6.5).
// Właściciel: u18 (Przypomnienia, skrzynka demo i plik kalendarza).
import '@/domena/przypomnienia/rozszerzenia-typow';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { ustawieniaSkuteczne } from '@/domena/przypomnienia/planowanie';
import { trescKoduSms, trescPrzypomnienia } from '@/domena/przypomnienia/tresc';
import {
  noweUstawienia,
  sprawdzKod,
  walidujNumerDoKodu,
  walidujUstawieniaPrzypomnien,
  type PolaPrzypomnien,
} from '@/domena/przypomnienia/ustawienia';
import type { KontekstOperacji, KodKomunikatu, Pesel, Powiadomienie, StanKonta, Ustawienia, WynikOperacji } from '@/domena/typy';
import { normalizujTelefon } from '@/domena/walidacje';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { utworzPowiadomienie } from '@/dane/magazyn/operacje/powiadomienia';
import {
  czyTrybDemonstracyjny,
  odczytajKatalog,
  odczytajParametry,
  odczytajStanKonta,
  odczytajStanRodziny,
  odczytajZalogowanego,
  peseleKontPrzewodnika,
  wykonajOperacjeZWynikiem,
  zmienStanKonta,
} from '@/dane/magazyn/stan';

/** Pola sekcji przypomnień na ViewGuideSettings przed walidacją. */
export interface FormularzPrzypomnien extends PolaPrzypomnien {
  przypomnieniaWlaczone: boolean;
  wyprzedzenieDni: string;
  kanalEmail: boolean;
  adresEmail: string;
  kanalSms: boolean;
  numerTelefonu: string;
  kodWeryfikacyjny?: string;
}

function emailZKontaZus(stan: StanKonta): string | undefined {
  const email = stan.kopiaDanychZus?.emailEzus?.trim();
  return email ? email : undefined;
}

function ustawieniaKonta(stan: StanKonta): Ustawienia {
  return ustawieniaSkuteczne(stan.ustawienia, emailZKontaZus(stan));
}

function przeliczRodzineKonta(stan: StanKonta, ctx: KontekstOperacji): WynikOperacji {
  const idRodziny = stan.konto.idRodziny;
  if (idRodziny === null || odczytajStanRodziny(idRodziny) === null) return { ok: true, wartosc: undefined };
  return przeliczRodzine(idRodziny, ctx);
}

/**
 * Zapis ustawień przypomnień zalogowanego konta: walidacja pól (0052, 0214, 0059, 0060, 0213, 0124, 0217,
 * 0053, 0054), zapis Ustawień i ponowne zaplanowanie przypomnień rodziny.
 */
export function zapiszUstawieniaPrzypomnien(formularz: FormularzPrzypomnien, ctx: KontekstOperacji): WynikOperacji {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0003' };
  const stan = zalogowany.stanKonta;
  const bledy = walidujUstawieniaPrzypomnien(formularz, stan.ustawienia, ctx.teraz);
  const kody = Object.entries(bledy) as [string, KodKomunikatu][];
  if (kody.length > 0) return { ok: false, kod: kody[0][1], bledyPol: Object.fromEntries(kody) };

  return wykonajOperacjeZWynikiem(() => {
    const ustawienia = noweUstawienia(formularz, ustawieniaKonta(stan), emailZKontaZus(stan), ctx.teraz);
    const zmieniony = zmienStanKonta(stan.konto.pesel, (s) => ({ ...s, ustawienia }));
    if (zmieniony === null) return { ok: false, kod: '0003' };
    return przeliczRodzineKonta(zmieniony, ctx);
  });
}

/** Kod weryfikacyjny: stały przy symulacji kodSmsStaly w trybie demonstracyjnym, w przeciwnym razie losowy. */
function nowyKod(): string {
  const parametry = odczytajParametry();
  const staly = parametry.symulacje.kodSmsStaly;
  if (parametry.trybDemonstracyjny && staly !== null && /^\d{6}$/.test(staly)) return staly;
  return losowyCiag(6, '0123456789');
}

/**
 * Wysłanie 6-cyfrowego kodu SMS ważnego 10 minut na numer z pola (0213, 0124). Wiadomość trafia do
 * Powiadomień konta (skrzynka demonstracyjna), a Ustawienia zapamiętują kod, chwilę wysłania i numer.
 */
export function wyslijKodSms(numer: string, ctx: KontekstOperacji): WynikOperacji<{ numer: string }> {
  const blad = walidujNumerDoKodu(numer);
  if (blad) return { ok: false, kod: blad, bledyPol: { numerTelefonu: blad } };
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0003' };
  const pesel = zalogowany.stanKonta.konto.pesel;
  const wpisany = numer.trim();
  const kod = nowyKod();

  return wykonajOperacjeZWynikiem(() => {
    const zmieniony = zmienStanKonta(pesel, (s) => ({
      ...s,
      ustawienia: {
        ...ustawieniaKonta(s),
        kodWeryfikacyjny: { kod, wyslano: ctx.teraz, numer: normalizujTelefon(numer) },
      },
    }));
    if (zmieniony === null) return { ok: false, kod: '0003' };
    const sms = utworzPowiadomienie(
      {
        elementTworzacy: 'ustawienia-i-powiadomienia',
        rodzaj: 'kod-sms',
        kontoDocelowe: pesel,
        planowanaWysylka: ctx.teraz,
        kanal: 'sms',
        adresat: wpisany,
        tresc: trescKoduSms(kod),
      },
      ctx,
    );
    if (!sms.ok) return sms;
    return { ok: true, wartosc: { numer: wpisany } };
  });
}

/**
 * Sprawdzenie kodu weryfikacyjnego zalogowanego konta (0217, 0054, 0053). Kod zgodny potwierdza numer,
 * na który go wysłano, i włącza kanał SMS.
 */
export function sprawdzKodSms(kod: string, ctx: KontekstOperacji): WynikOperacji {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0003' };
  const stan = zalogowany.stanKonta;
  const wyslany = stan.ustawienia?.kodWeryfikacyjny;
  const blad = sprawdzKod(kod, wyslany, ctx.teraz);
  if (blad || wyslany === undefined) {
    const kodBledu = blad ?? '0053';
    return { ok: false, kod: kodBledu, bledyPol: { kodWeryfikacyjny: kodBledu } };
  }
  return wykonajOperacjeZWynikiem(() => {
    const zmieniony = zmienStanKonta(stan.konto.pesel, (s) => {
      const { kodWeryfikacyjny, ...ustawienia } = ustawieniaKonta(s);
      void kodWeryfikacyjny;
      return {
        ...s,
        ustawienia: {
          ...ustawienia,
          kanalSms: true,
          numerTelefonu: wyslany.numer,
          numerPotwierdzony: wyslany.numer,
          stanNumeru: 'potwierdzony',
          zapisano: ctx.teraz,
        },
      };
    });
    if (zmieniony === null) return { ok: false, kod: '0003' };
    return przeliczRodzineKonta(zmieniony, ctx);
  });
}

// --- Doręczenie ---------------------------------------------------------------------------------

function czyPrzypomnienieOTerminie(p: Powiadomienie): boolean {
  return p.rodzaj === 'przypomnienie-przed-terminem' || p.rodzaj === 'przypomnienie-w-dniu-terminu';
}

/** Sprawa przypomnienia jest nadal do zrobienia w planie rodziny. */
function czySprawaDoZrobienia(p: Powiadomienie): boolean {
  if (p.idRodziny === undefined || p.idSprawy === undefined) return true;
  const rodzina = odczytajStanRodziny(p.idRodziny);
  if (rodzina === null || rodzina.ukryte || rodzina.plan === null) return false;
  return rodzina.plan.pozycje.some((pozycja) => pozycja.idSprawy === p.idSprawy && pozycja.status === 'do-zrobienia');
}

function doreczone(p: Powiadomienie, stan: StanKonta): Powiadomienie {
  if (czyPrzypomnienieOTerminie(p) && !czySprawaDoZrobienia(p)) {
    return { ...p, statusDoreczenia: 'pominiete', powodPominiecia: 'sprawa-zalatwiona' };
  }
  const adresat =
    p.adresat.trim() !== ''
      ? p.adresat
      : p.kanal === 'email'
        ? (stan.ustawienia?.kanalEmail ? stan.ustawienia.adresEmail.trim() : '') || (emailZKontaZus(stan) ?? '')
        : '';
  if (adresat === '') return { ...p, statusDoreczenia: 'pominiete', powodPominiecia: 'brak-adresu' };

  let tresc: { temat?: string; tresc: string } = { temat: p.temat, tresc: p.tresc };
  if (czyPrzypomnienieOTerminie(p) && p.idSprawy !== undefined && p.termin !== undefined) {
    // Treść powstaje z bieżącym tytułem sprawy z katalogu w chwili doręczenia.
    tresc = trescPrzypomnienia({
      rodzaj: p.rodzaj as 'przypomnienie-przed-terminem' | 'przypomnienie-w-dniu-terminu',
      kanal: p.kanal,
      idSprawy: p.idSprawy,
      tytul: tytulSprawy(odczytajKatalog(), p.idSprawy),
      termin: p.termin,
      liczbaDni: p.liczbaDni ?? 0,
      koszt: p.kosztSpoznienia,
    });
  }
  return {
    ...p,
    adresat,
    ...(tresc.temat === undefined ? {} : { temat: tresc.temat }),
    tresc: tresc.tresc,
    statusDoreczenia: 'wyslane',
    wyslano: p.planowanaWysylka,
  };
}

/**
 * Doręczenie powiadomień zaplanowanych do chwili ctx.teraz do skrzynki demonstracyjnej: przypomnienie
 * o sprawie złożonej albo załatwionej i wiadomość bez adresu dostają status `pominiete`, pozostałe `wyslane`
 * z chwilą planowanej wysyłki. W trybie demonstracyjnym obejmuje wszystkie konta przewodnika.
 */
export function doreczZaplanowane(ctx: KontekstOperacji): WynikOperacji<{ doreczono: number }> {
  const zalogowany = odczytajZalogowanego()?.stanKonta.konto.pesel;
  const konta: Pesel[] = czyTrybDemonstracyjny()
    ? peseleKontPrzewodnika()
    : zalogowany === undefined
      ? []
      : [zalogowany];

  return wykonajOperacjeZWynikiem(() => {
    let doreczono = 0;
    for (const pesel of konta) {
      const doDoreczenia = odczytajStanKonta(pesel)?.powiadomienia.some(
        (p) => p.statusDoreczenia === 'zaplanowane' && p.planowanaWysylka <= ctx.teraz,
      );
      if (!doDoreczenia) continue;
      zmienStanKonta(pesel, (s) => {
        return {
          ...s,
          powiadomienia: s.powiadomienia.map((p) => {
            if (p.statusDoreczenia !== 'zaplanowane' || p.planowanaWysylka > ctx.teraz) return p;
            const wynik = doreczone(p, s);
            if (wynik.statusDoreczenia === 'wyslane') doreczono += 1;
            return wynik;
          }),
        };
      });
    }
    return { ok: true, wartosc: { doreczono } };
  });
}
