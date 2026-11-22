// Pytanie do ZUS, dane konta ubezpieczonego i wniosek o odpis aktu urodzenia (kontrakt, sekcja 6.5).
// Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Połączenie z PUE/eZUS i z rejestrem stanu cywilnego jest symulowane: pytanie trafia do korespondencji konta
// w symulowanym ZUS i do kopii danych konta ZUS, a wniosek o odpis przyjmuje albo odrzuca symulowany rejestr.
import { gminy } from '@/dane/gminy';
import { adresyProdukcyjne } from '@/dane/parametry-produkcyjne';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { nastepnyNumerPotwierdzenia } from '@/dane/magazyn/operacje/konto';
import { odczytajDaneKontaZus, poczekajNaSymulowanyOdczytZus } from '@/dane/magazyn/operacje/odczyt-zus';
import { uruchomPoOdczycieDanychZus } from '@/dane/magazyn/operacje/po-odczycie-zus';
import { ustawStatusSprawy } from '@/dane/magazyn/operacje/plan';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  czySymulacja,
  czyTrybDemonstracyjny,
  odczytajKatalog,
  odczytajStanKonta,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacje,
  wykonajOperacjeZWynikiem,
  zmienStanKonta,
  zmienStanRodziny,
  zmienStanZus,
} from '@/dane/magazyn/stan';
import { parsujDate } from '@/domena/daty';
import { idZLosowych } from '@/domena/numery';
import { przytnijTrescPytania, walidujTrescPytania, zbudujKontekstPytania } from '@/domena/pytania-zus';
import type {
  IdSprawy,
  IdWniosku,
  KodKomunikatu,
  KontekstOperacji,
  PytanieDoZus,
  StanRodziny,
  WniosekOOdpis,
  WynikOperacji,
} from '@/domena/typy';
import {
  dzieckoZProfilu,
  oplataSkarbowa,
  pierwszePoleZBledem,
  symulujRejestr,
  urzadStanuCywilnego,
  uzupelnieniaProfilu,
  walidujWniosekOOdpis,
  type FormularzOdpisu,
} from '@/domena/wnioski/odpis';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

export { sprawdzOdpowiedziZus } from '@/dane/magazyn/operacje/po-odczycie-zus/sprawdz-odpowiedzi-zus';

// --- Pytanie do ZUS (3.8.2.1.1) -------------------------------------------------------------------

/** Treść pytania i sprawa, której dotyczy (pytanie bez sprawy: brak `idSprawy`). */
export interface DanePytaniaDoZus {
  idSprawy?: IdSprawy;
  tresc: string;
}

/**
 * Wysłanie pytania przez PUE/eZUS zalogowanego użytkownika (R2, R3). Błędna treść: 0129 albo 0130,
 * PUE/eZUS niedostępne: 0133. Pytanie z kontekstem z chwili wysłania trafia do korespondencji konta.
 */
export function wyslijPytanieDoZus(dane: DanePytaniaDoZus, ctx: KontekstOperacji): WynikOperacji<PytanieDoZus> {
  const bladTresci = walidujTrescPytania(dane.tresc);
  if (bladTresci) return { ok: false, kod: bladTresci, bledyPol: { tresc: bladTresci } };
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0133' };
  if (czySymulacja('pueEzusNiedostepne')) return { ok: false, kod: '0133' };

  const konto = zalogowany.stanKonta.konto;
  const rodzina = rodzinaKonta(konto);
  const kontekst = zbudujKontekstPytania({
    ...(dane.idSprawy === undefined ? {} : { idSprawy: dane.idSprawy }),
    pesel: konto.pesel,
    daneRodziny: rodzina?.daneRodziny ?? null,
    daneCiazy: rodzina?.daneCiazy ?? null,
    plan: rodzina?.plan ?? null,
    kalendarz: rodzina?.kalendarz ?? null,
    katalog: odczytajKatalog(),
  });
  const pytanie: PytanieDoZus = {
    idPytania: idZLosowych('PYT', ctx.teraz, losowyCiag(6)),
    ...(kontekst.sprawa ? { idSprawy: kontekst.sprawa.idSprawy } : {}),
    tresc: przytnijTrescPytania(dane.tresc),
    kontekst,
    wyslano: ctx.teraz,
    status: 'wyslane',
    peselNadawcy: konto.pesel,
  };
  return wykonajOperacje(() => {
    zmienStanZus(konto.pesel, (s) => ({ ...s, korespondencja: [...s.korespondencja, pytanie] }));
    zmienStanKonta(konto.pesel, (s) =>
      s.kopiaDanychZus === null
        ? s
        : { ...s, kopiaDanychZus: { ...s.kopiaDanychZus, korespondencja: [pytanie, ...s.kopiaDanychZus.korespondencja] } },
    );
    return pytanie;
  });
}

// --- Dane konta ubezpieczonego (3.8.2.2.1) --------------------------------------------------------

/**
 * Odczyt danych konta ubezpieczonego przy otwarciu ViewZusAccountData i przy ponowieniu (R8): udany odczyt
 * zastępuje kopię; nieudany z kopią daje 0002, bez kopii 0133.
 */
export async function odczytajDaneKontaUbezpieczonego(ctx: KontekstOperacji): Promise<WynikOperacji> {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0133' };
  const pesel = zalogowany.sesja.pesel;

  if (czySymulacja('pueEzusNiedostepne') || czySymulacja('daneZusNiedostepne')) {
    // Nieudany odczyt kończy się po czasie symulowanego odczytu, tak jak odczyt udany.
    await poczekajNaSymulowanyOdczytZus();
    const maKopie = (odczytajStanKonta(pesel)?.kopiaDanychZus ?? null) !== null;
    wykonajOperacje(() => {
      zmienStanKonta(
        pesel,
        (s) => ({ ...s, stanOdczytuZus: { stan: maKopie ? 'nieudany-z-kopia' : 'nieudany-bez-kopii', czas: ctx.teraz } }),
        'systemowe',
      );
    });
    return { ok: false, kod: maKopie ? '0002' : '0133' };
  }

  const wynik = await odczytajDaneKontaZus(pesel, ctx);
  if (!wynik.ok) {
    if (wynik.kod === '0003') return wynik;
    return { ok: false, kod: odczytajStanKonta(pesel)?.kopiaDanychZus ? '0002' : '0133' };
  }
  try {
    uruchomPoOdczycieDanychZus(pesel, ctx);
  } catch {
    // Akcje po odczycie (nowe dzieci, pełnomocnictwo, odpowiedzi ZUS) nie unieważniają udanego odczytu.
  }
  return { ok: true, wartosc: undefined };
}

/** Adres strony głównej eZUS zalogowanego użytkownika (R9): błąd otwarcia kanału daje 0035. */
export function adresEzus(): WynikOperacji<{ adres: string }> {
  if (czySymulacja('kanalNiedostepny')) return { ok: false, kod: '0035' };
  const produkcyjny = adresyProdukcyjne.kanaly['pue-ezus'] ?? adresyProdukcyjne.kanaly.ezus;
  const adres = !czyTrybDemonstracyjny() && produkcyjny ? produkcyjny : trasy.ViewEzusHome();
  return { ok: true, wartosc: { adres } };
}

// --- Wniosek o odpis aktu urodzenia (3.9.7.1.1, 3.9.7.1.2) ----------------------------------------

/** Nazwa urzędu stanu cywilnego wybranego we wniosku (identyfikator TERYT gminy urzędu). */
function nazwaUrzedu(idTeryt: string): string | undefined {
  return (
    urzadStanuCywilnego(gminy.find((g) => g.idTeryt === idTeryt) ?? null, {
      wMiejscowniku: (m) => teksty.ViewBirthCertificateRequest.urzadWMiejscowniku({ miejscownik: m }),
      wGminie: (g) => teksty.ViewBirthCertificateRequest.urzadWGminie({ gmina: g }),
    }) ?? undefined
  );
}

/** Sprawa planu Odpis aktu urodzenia dziecka (K36) albo identyfikator pozycji, gdy plan jej nie zawiera. */
function sprawaOdpisu(rodzina: StanRodziny): IdSprawy {
  return rodzina.plan?.pozycje.find((p) => p.idPozycji === 'K36')?.idSprawy ?? 'K36';
}

/**
 * Zapis szkicu wniosku o odpis z formularza po walidacji wszystkich pól (R-8, R-10, R-6). Błędy pól zwraca
 * w `bledyPol` z kodem pierwszego pola z błędem; wniosek bez błędów zapisuje w Wnioskach rodziny jako szkic.
 */
export function przygotujWniosekOOdpis(
  f: FormularzOdpisu,
  idWniosku: IdWniosku | null,
  ctx: KontekstOperacji,
): WynikOperacji<{ idWniosku: IdWniosku }> {
  const bledy = walidujWniosekOOdpis(f, ctx.dzis);
  const pierwsze = pierwszePoleZBledem(bledy);
  if (pierwsze !== null) {
    return { ok: false, kod: bledy[pierwsze] ?? '0006', bledyPol: bledy as Record<string, KodKomunikatu> };
  }

  const zalogowany = odczytajZalogowanego();
  const konto = zalogowany?.stanKonta.konto ?? null;
  const rodzina = rodzinaKonta(konto);
  if (konto === null || rodzina === null || f.rodzajOdpisu === null || f.cel === null || f.sposobOdbioru === null) {
    return { ok: false, kod: '0003' };
  }
  const id = idWniosku ?? idZLosowych('W', ctx.teraz, losowyCiag(6));
  const poprzedni = rodzina.wnioski.find((w) => w.idWniosku === id);
  const pesel = f.pesel.trim();
  const urzad = nazwaUrzedu(f.urzadStanuCywilnego);
  const wniosek: WniosekOOdpis = {
    idWniosku: id,
    rodzaj: 'odpis-aktu-urodzenia',
    idSprawy: sprawaOdpisu(rodzina),
    konto: konto.pesel,
    rola: konto.rola,
    stan: 'szkic',
    ostatniEkran: 'ViewBirthCertificateRequest',
    utworzono: poprzedni?.utworzono ?? ctx.teraz,
    zaktualizowano: ctx.teraz,
    adresat: 'rejestr-stanu-cywilnego',
    zalaczniki: [],
    rodzajOdpisu: f.rodzajOdpisu,
    daneDziecka: {
      imie: f.imie.trim(),
      nazwisko: f.nazwisko.trim(),
      dataUrodzenia: parsujDate(f.dataUrodzenia) ?? undefined,
      miejsceUrodzenia: f.miejsceUrodzenia.trim(),
      ...(pesel ? { pesel } : {}),
    },
    daneWnioskodawcy: { imie: konto.imie, nazwisko: konto.nazwisko, pesel: konto.pesel },
    cel: f.cel,
    oplataSkarbowa: oplataSkarbowa(f.rodzajOdpisu, f.cel, ctx.dzis, odczytajKatalog()),
    sposobOdbioru: f.sposobOdbioru,
    ...(f.sposobOdbioru === 'poczta' ? { adresDoDoreczenia: f.adresDoDoreczenia.trim() } : {}),
    ...(urzad ? { urzadStanuCywilnego: urzad } : {}),
  };
  return wykonajOperacje(() => {
    zmienStanRodziny(rodzina.idRodziny, (s) => ({
      ...s,
      wnioski: [...s.wnioski.filter((w) => w.idWniosku !== id), wniosek],
    }));
    return { idWniosku: id };
  });
}

/**
 * Złożenie wniosku o odpis w rejestrze stanu cywilnego (R-9): rejestr niedostępny daje 0147, brak adresu do
 * e-Doręczeń wnioskodawcy 0295, brak aktu 0146.
 * Przyjęty wniosek dostaje numer potwierdzenia, datę złożenia i przewidywany dzień wydania (+7 dni), dane
 * wpisane w puste pola profilu trafiają do profilu, a sprawa K36 dostaje status złożona.
 */
export async function zlozWniosekOOdpis(
  id: IdWniosku,
  ctx: KontekstOperacji,
): Promise<WynikOperacji<{ potwierdzenie: string }>> {
  const konto = odczytajZalogowanego()?.stanKonta.konto ?? null;
  const rodzina = rodzinaKonta(konto);
  const wniosek = rodzina?.wnioski.find((w): w is WniosekOOdpis => w.idWniosku === id && w.rodzaj === 'odpis-aktu-urodzenia');
  if (rodzina === null || wniosek === undefined) return { ok: false, kod: '0003' };
  if (czySymulacja('rejestrStanuCywilnegoNiedostepny')) return { ok: false, kod: '0147' };

  const odpowiedz = symulujRejestr(
    { ...wniosek, dataZlozenia: ctx.dzis },
    { daneRodziny: rodzina.daneRodziny, daneCiazy: rodzina.daneCiazy },
  );
  // Brak adresu do e-Doręczeń wnioskodawcy (0295) i brak aktu (0146): wniosek zostaje szkicem, a sprawa K36 zachowuje status.
  if ('kod' in odpowiedz) return { ok: false, kod: odpowiedz.kod === '0145' ? '0003' : odpowiedz.kod };

  return wykonajOperacjeZWynikiem(() => {
    const potwierdzenie = nastepnyNumerPotwierdzenia('USC-DEMO', ctx.dzis);
    const zlozony: WniosekOOdpis = {
      ...wniosek,
      stan: 'zlozony',
      zaktualizowano: ctx.teraz,
      dataZlozenia: ctx.dzis,
      potwierdzenie,
      przewidywanyDzienWydania: odpowiedz.przewidywanyDzienWydania,
      ...(odpowiedz.urzadStanuCywilnego ? { urzadStanuCywilnego: odpowiedz.urzadStanuCywilnego } : {}),
    };
    zmienStanRodziny(rodzina.idRodziny, (s) => {
      const dziecko = dzieckoZProfilu(s.daneCiazy);
      const uzupelnienia = uzupelnieniaProfilu(dziecko, {
        imie: zlozony.daneDziecka?.imie ?? '',
        nazwisko: zlozony.daneDziecka?.nazwisko ?? '',
        miejsceUrodzenia: zlozony.daneDziecka?.miejsceUrodzenia,
        pesel: zlozony.daneDziecka?.pesel,
      });
      // Dane ciąży i dziecka istnieją wyłącznie przy zgodzie na dane dotyczące zdrowia; bez nich profil zostaje bez zmian.
      const daneCiazy =
        s.daneCiazy === null || Object.keys(uzupelnienia).length === 0
          ? s.daneCiazy
          : {
              ...s.daneCiazy,
              dzieci:
                s.daneCiazy.dzieci.length === 0
                  ? [{ zrodlo: 'odpowiedz-rodzica' as const, dataUrodzenia: zlozony.daneDziecka?.dataUrodzenia, ...uzupelnienia }]
                  : s.daneCiazy.dzieci.map((d, i) => (i === 0 ? { ...d, ...uzupelnienia } : d)),
            };
      return { ...s, daneCiazy, wnioski: s.wnioski.map((w) => (w.idWniosku === id ? zlozony : w)) };
    });
    // Status sprawy zmienia operacja Planu rodzica; jej wynik nie cofa złożonego wniosku.
    ustawStatusSprawy(zlozony.idSprawy, 'zlozona', 'kreator-wniosku', ctx);
    przeliczRodzine(rodzina.idRodziny, ctx);
    return { ok: true, wartosc: { potwierdzenie } };
  });
}
