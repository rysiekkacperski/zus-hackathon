// Zaświadczenie o niezaleganiu w opłacaniu składek albo decyzja o odmowie jego wydania i powiadomienie o zmianie statusu wniosku w ZUS
// (kontrakt, sekcja 6.5; ANALIZY/17 R8–R9, ANALIZY/15 R6; 3.4.5.1.4). Właściciel: u14.
// Dokument wydaje REST API symulowanego ZUS (POST /api/v1/zus/zaswiadczenia-o-niezaleganiu) według stanu rozliczeń z danych
// konta z nałożonym stanem symulowanego ZUS z magazynu, a magazyn zapisuje go w danych konta ZUS i jako plik do pobrania.
import { zawnioskujOZaswiadczenieONiezaleganiu } from '@/dane/api/klient';
import { opcjeSymulowanegoZus } from '@/dane/api/symulowany-zus';
import { utworzPowiadomienie } from '@/dane/magazyn/operacje/powiadomienia';
import { zapiszPlik } from '@/dane/magazyn/pliki';
import { czyBladZapisu } from '@/dane/magazyn/rdzen';
import {
  odczytajKatalog,
  odczytajStanKonta,
  odczytajStanRodziny,
  odczytajStanZus,
  odczytajZalogowanego,
  osobyRodziny,
  wykonajOperacje,
  zmienStanKonta,
  zmienStanZus,
} from '@/dane/magazyn/stan';
import { dataZeZnacznika } from '@/domena/daty';
import { zmianyStatusowZus } from '@/domena/plan/kroki/statusy-zus';
import type {
  DataISO,
  IdPliku,
  IdRodziny,
  KontekstOperacji,
  PlanRodziny,
  WynikOperacji,
  ZaswiadczenieOStanieRozliczen,
} from '@/domena/typy';
import '@/domena/zasilki/rozszerzenia-typow';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

/**
 * Wniosek o zaświadczenie o niezaleganiu w opłacaniu składek (3.4.5.1.4): ZUS wydaje dokument według stanu
 * rozliczeń w dniu wydania, a symulacja wydaje go w dniu wysłania wniosku, czyli w dniu z `ctx.teraz`.
 */
export async function wyslijWniosekOZaswiadczenieONiezaleganiu(
  ctx: KontekstOperacji,
): Promise<WynikOperacji<{ idPliku: IdPliku }>> {
  return wystawZaswiadczenieORozliczeniach(dataZeZnacznika(ctx.teraz), ctx);
}

/**
 * Zaświadczenie o niezaleganiu albo decyzja o odmowie jego wydania na dzień `dzien` z REST API symulowanego ZUS, zapisane
 * w danych konta ZUS i jako plik do pobrania do zakończenia sesji. Kod 0133 oznacza niedostępne PUE/eZUS (symulacja
 * pueEzusNiedostepne), konto bez stanu rozliczeń albo błąd sieci.
 */
export async function wystawZaswiadczenieORozliczeniach(
  dzien: DataISO,
  ctx: KontekstOperacji,
): Promise<WynikOperacji<{ idPliku: IdPliku }>> {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0003' };

  const { konto } = zalogowany.stanKonta;
  const wydane = await zawnioskujOZaswiadczenieONiezaleganiu(
    {
      pesel: konto.pesel,
      dzien,
      teraz: ctx.teraz,
      stanSymulowany: odczytajStanZus(konto.pesel),
      wnioskodawca: { imie: konto.imie, nazwisko: konto.nazwisko },
    },
    opcjeSymulowanegoZus(),
  );
  if (!wydane.ok) return { ok: false, kod: '0133' };
  const zaswiadczenie: ZaswiadczenieOStanieRozliczen = wydane.wartosc.zaswiadczenie;

  let idPliku: IdPliku;
  try {
    const nazwa = teksty.ViewContributionCertificate.nazwaPliku({
      data: dzien.split('-').reverse().join('-'),
      rodzaj: zaswiadczenie.rodzaj,
    });
    idPliku = await zapiszPlik(new Blob([JSON.stringify(zaswiadczenie)], { type: 'application/json' }), {
      nazwa,
      wlasciciel: konto.pesel,
      idSesji: zalogowany.sesja.idSesji,
    });
  } catch (blad) {
    if (czyBladZapisu(blad)) return { ok: false, kod: '0003' };
    throw blad;
  }

  const zapisane: ZaswiadczenieOStanieRozliczen = { ...zaswiadczenie, idPliku };
  const zapis = wykonajOperacje(() => {
    zmienStanZus(konto.pesel, (s) => ({
      ...s,
      zaswiadczeniaORozliczeniach: [...s.zaswiadczeniaORozliczeniach.filter((z) => z.id !== zapisane.id), zapisane],
    }));
    zmienStanKonta(konto.pesel, (s) =>
      s.kopiaDanychZus
        ? {
            ...s,
            kopiaDanychZus: {
              ...s.kopiaDanychZus,
              zaswiadczeniaORozliczeniach: [...s.kopiaDanychZus.zaswiadczeniaORozliczeniach, zapisane],
            },
          }
        : s,
    );
  });
  if (!zapis.ok) return zapis;
  return { ok: true, wartosc: { idPliku } };
}

/**
 * Powiadomienia o zmianie statusu sprawy na podstawie danych ZUS (draft „Zmiana statusu wniosku”).
 * Wywołuje ją przeliczenie rodziny po zapisaniu nowego planu z planem sprzed przeliczenia. Wiadomość
 * trafia do kont rodziców w rodzinie na kanały włączone w ustawieniach przypomnień.
 */
export function powiadomOZmianachStatusowWnioskow(
  idRodziny: IdRodziny,
  poprzedniPlan: PlanRodziny | null,
  ctx: KontekstOperacji,
): WynikOperacji<{ liczba: number }> {
  const rodzina = odczytajStanRodziny(idRodziny);
  if (!rodzina?.plan) return { ok: true, wartosc: { liczba: 0 } };
  const zmiany = zmianyStatusowZus(poprzedniPlan, rodzina.plan);
  if (zmiany.length === 0) return { ok: true, wartosc: { liczba: 0 } };

  const katalog = odczytajKatalog();
  const osoby = osobyRodziny(rodzina.daneRodziny);
  const odbiorcy = [...new Set([osoby.peselRodzica, osoby.peselDolaczonego].filter((p): p is string => Boolean(p)))];
  const t = teksty.PowiadomieniaStatusWniosku;
  let liczba = 0;

  for (const zmiana of zmiany) {
    const pozycja = rodzina.plan.pozycje.find((p) => p.idSprawy === zmiana.idSprawy);
    const tytul = katalog.pozycje.find((p) => p.id === (pozycja?.idPozycji ?? zmiana.idSprawy))?.tytul ?? zmiana.idSprawy;
    const adres = trasy.ViewCaseDetails({ idSprawy: zmiana.idSprawy });
    const status = zmiana.odmowa ? t.odmowa : t.statusy[zmiana.status];
    const tresc = t.tresc({ status, adresPrzewodnika: adres });

    for (const pesel of odbiorcy) {
      const stan = odczytajStanKonta(pesel);
      if (!stan) continue;
      const u = stan.ustawienia;
      const kanaly: { kanal: 'email' | 'sms'; adresat: string }[] = [];
      if (!u || u.kanalEmail) {
        const adresat = u?.adresEmail || stan.kopiaDanychZus?.emailEzus || '';
        if (adresat) kanaly.push({ kanal: 'email', adresat });
      }
      if (u?.kanalSms && u.stanNumeru === 'potwierdzony' && u.numerTelefonu) kanaly.push({ kanal: 'sms', adresat: u.numerTelefonu });
      for (const { kanal, adresat } of kanaly) {
        const wynik = utworzPowiadomienie(
          {
            elementTworzacy: 'odczyt-danych-zus',
            rodzaj: 'zmiana-statusu-wniosku',
            idRodziny,
            idSprawy: zmiana.idSprawy,
            kontoDocelowe: pesel,
            planowanaWysylka: ctx.teraz,
            kanal,
            adresat,
            ...(kanal === 'email' ? { temat: t.temat({ rodzajWniosku: tytul }) } : {}),
            tresc,
            adresInstrukcji: adres,
          },
          ctx,
        );
        if (wynik.ok) liczba += 1;
      }
    }
  }
  return { ok: true, wartosc: { liczba } };
}
