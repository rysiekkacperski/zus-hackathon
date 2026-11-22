// Akcja po odczycie Danych z konta ZUS `sprawdzOdpowiedziZus` (kontrakt, sekcja 6.5).
// Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Odczyt korespondencji przy otwarciu przewodnika: w trybie demonstracyjnym symulowany ZUS dodaje odpowiedzi
// po opóźnieniu z parametrów (R6), a każda nowa odpowiedź trafia do kopii i daje SMS i e-mail według ustawień (R5).
import { odpowiedziZus } from '@/dane/konta-zus/odpowiedzi-zus';
import { utworzPowiadomienie, type NowePowiadomienie } from '@/dane/magazyn/operacje/powiadomienia';
import type { AkcjaPoOdczycieDanychZus } from '@/dane/magazyn/operacje/po-odczycie-zus/typ';
import {
  odczytajKatalog,
  odczytajParametry,
  odczytajStanKonta,
  odczytajStanZus,
  wykonajOperacje,
  zmienStanKonta,
  zmienStanZus,
} from '@/dane/magazyn/stan';
import { formatujDate } from '@/domena/daty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { scalPytania, symulowanaOdpowiedz } from '@/domena/pytania-zus/odpowiedzi';
import type { KontekstOperacji, Pesel, PytanieDoZus, StanKonta } from '@/domena/typy';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

/** Odnośnik z wiadomości: logowanie do przewodnika z powrotem na ViewZusQuestionSent pytania. */
export function adresPytaniaPoZalogowaniu(idPytania: string): string {
  return trasy.ViewGuideStart({ powrot: trasy.ViewZusQuestionSent({ idPytania }) });
}

function tytulDoWiadomosci(pytanie: PytanieDoZus): string {
  if (pytanie.idSprawy === undefined) return teksty.PowiadomieniaOdpowiedzZus.pytanieOgolne;
  return pytanie.kontekst.sprawa?.tytul ?? tytulSprawy(odczytajKatalog(), pytanie.idSprawy);
}

function wiadomosciOOdpowiedzi(stanKonta: StanKonta, pytanie: PytanieDoZus, ctx: KontekstOperacji): NowePowiadomienie[] {
  const tytul = tytulDoWiadomosci(pytanie);
  const adres = adresPytaniaPoZalogowaniu(pytanie.idPytania);
  const ustawienia = stanKonta.ustawienia;
  const wspolne = {
    elementTworzacy: 'odczyt-danych-zus' as const,
    rodzaj: 'odpowiedz-zus' as const,
    kontoDocelowe: stanKonta.konto.pesel,
    planowanaWysylka: ctx.teraz,
    adresInstrukcji: adres,
    ...(pytanie.idSprawy === undefined ? {} : { idSprawy: pytanie.idSprawy }),
    ...(stanKonta.konto.idRodziny === null ? {} : { idRodziny: stanKonta.konto.idRodziny }),
  };
  const wynik: NowePowiadomienie[] = [];
  if (ustawienia?.kanalSms && ustawienia.numerTelefonu) {
    wynik.push({
      ...wspolne,
      kanal: 'sms',
      adresat: ustawienia.numerTelefonu,
      tresc: teksty.PowiadomieniaOdpowiedzZus.sms({ tytulSprawy: tytul, adresPrzewodnika: adres }),
    });
  }
  // Bez zapisanych ustawień kanał e-mail jest włączony z adresem konta eZUS (wartości domyślne Ustawień).
  const email = ustawienia === null ? stanKonta.kopiaDanychZus?.emailEzus : ustawienia.kanalEmail ? ustawienia.adresEmail : undefined;
  if (email) {
    wynik.push({
      ...wspolne,
      kanal: 'email',
      adresat: email,
      temat: teksty.PowiadomieniaOdpowiedzZus.tematEmail,
      tresc: teksty.PowiadomieniaOdpowiedzZus.email({
        dataWyslania: formatujDate(pytanie.wyslano),
        tytulSprawy: tytul,
        adresPrzewodnika: adres,
      }),
    });
  }
  return wynik;
}

/** Dodaje symulowane odpowiedzi do korespondencji konta w symulowanym ZUS (R6); zwraca, czy coś się zmieniło. */
function zasymulujOdpowiedzi(pesel: Pesel, ctx: KontekstOperacji): void {
  const parametry = odczytajParametry();
  const zus = odczytajStanZus(pesel);
  if (!parametry.trybDemonstracyjny || zus === null) return;
  let zmiana = false;
  const korespondencja = zus.korespondencja.map((p) => {
    const odpowiedz = symulowanaOdpowiedz(p, odpowiedziZus, ctx.teraz, parametry.opoznienieOdpowiedziZusDni);
    if (odpowiedz === null) return p;
    zmiana = true;
    return { ...p, odpowiedz, status: 'odpowiedz' as const };
  });
  if (zmiana) zmienStanZus(pesel, (s) => ({ ...s, korespondencja }), 'systemowe');
}

/** Odczyt korespondencji konta: nowe odpowiedzi ZUS w kopii, status odpowiedź, SMS i e-mail (R5, R6). */
export function odczytajKorespondencje(pesel: Pesel, ctx: KontekstOperacji): void {
  if (odczytajStanKonta(pesel) === null) return;
  wykonajOperacje(() => {
    zasymulujOdpowiedzi(pesel, ctx);
    const stanKonta = odczytajStanKonta(pesel);
    if (stanKonta === null) return;
    const zus = odczytajStanZus(pesel);
    const pytania = scalPytania(stanKonta.kopiaDanychZus?.korespondencja, zus?.korespondencja).filter(
      (p) => p.peselNadawcy === pesel,
    );
    const nowe = new Set(pytania.filter((p) => p.odpowiedz && !p.powiadomionoOOdpowiedzi).map((p) => p.idPytania));
    for (const pytanie of pytania) {
      if (!nowe.has(pytanie.idPytania)) continue;
      for (const wiadomosc of wiadomosciOOdpowiedzi(stanKonta, pytanie, ctx)) utworzPowiadomienie(wiadomosc, ctx);
    }
    const oznacz = (p: PytanieDoZus): PytanieDoZus => (nowe.has(p.idPytania) ? { ...p, powiadomionoOOdpowiedzi: true } : p);
    if (stanKonta.kopiaDanychZus !== null) {
      zmienStanKonta(
        pesel,
        (s) => (s.kopiaDanychZus === null ? s : { ...s, kopiaDanychZus: { ...s.kopiaDanychZus, korespondencja: pytania.map(oznacz) } }),
        'systemowe',
      );
    }
    if (zus !== null && nowe.size > 0) {
      zmienStanZus(pesel, (s) => ({ ...s, korespondencja: s.korespondencja.map(oznacz) }), 'systemowe');
    }
  });
}

export const sprawdzOdpowiedziZus: AkcjaPoOdczycieDanychZus = (pesel, ctx) => {
  odczytajKorespondencje(pesel, ctx);
};
