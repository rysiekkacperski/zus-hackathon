// Dołączenie drugiego rodzica i pełnomocnictwo PEL (kontrakt, sekcja 6.5). Właściciel: u23 (Dołączenie drugiego rodzica i pełnomocnictwo PEL).
// odswiezPelnomocnictwo leży w rejestrze po-odczycie-zus (plik u23) i jest tu reeksportowana.
// Operacje zmieniają Dane rodziny (dostęp kont, zaproszenie, dane drugiego rodzica), rolę i rodzinę konta
// drugiego rodzica oraz indeks zaproszeń w stanie globalnym, a na końcu przeliczają rodzinę.
import { useCallback, useSyncExternalStore } from 'react';
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { czyPrzypomnienieRodziny, przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajDaneMocodawcy,
  pelnomocnictwoDrugiegoRodzica,
  rodzinaRodzicaBezDolaczonego,
  zapiszDrugiegoRodzica,
} from '@/dane/magazyn/operacje/po-odczycie-zus/odswiez-pelnomocnictwo';
import { subskrybuj } from '@/dane/magazyn/rdzen';
import {
  czySymulacja,
  odczytajGlobalne,
  odczytajStanKonta,
  odczytajStanRodziny,
  odczytajStanZus,
  odczytajZalogowanego,
  osobyRodziny,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zmienGlobalne,
  zmienKonto,
  zmienStanKonta,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';
import { formatujDate } from '@/domena/daty';
import type { Losuj } from '@/domena/losowanie';
import { komunikatStanu, stanPelnomocnictwa, zastosujDaneZPelnomocnictwa } from '@/domena/rodzina/pelnomocnictwo';
import {
  czyProfilMaDrugiegoRodzica,
  dolaczonyDrugiRodzic,
  dostepPoDolaczeniu,
  dostepPoOdlaczeniu,
  drugiRodzicPoDolaczeniu,
  drugiRodzicPoOdlaczeniu,
  noweZaproszenie,
  nowyToken,
  ocenLinkZaproszenia,
} from '@/domena/rodzina/zaproszenia';
import type {
  DaneDrugiegoRodzicaZKonta,
  KontekstOperacji,
  KontoPrzewodnika,
  StanKonta,
  StanRodziny,
  WynikOperacji,
  Zaproszenie,
} from '@/domena/typy';

export { odswiezPelnomocnictwo } from '@/dane/magazyn/operacje/po-odczycie-zus/odswiez-pelnomocnictwo';

const BLAD_ZAPISU = { ok: false, kod: '0003' } as const;

/** Rodzina zalogowanego konta z rolą Rodzic, które zapisało profil rodziny. */
function rodzinaZalogowanegoRodzica(): { konto: KontoPrzewodnika; rodzina: StanRodziny } | null {
  const konto = odczytajZalogowanego()?.stanKonta.konto ?? null;
  if (konto === null || konto.rola !== 'rodzic') return null;
  const rodzina = rodzinaKonta(konto);
  if (rodzina === null || osobyRodziny(rodzina.daneRodziny).peselRodzica !== konto.pesel) return null;
  return { konto, rodzina };
}

/** Rodzina, do której prowadzi token zaproszenia (indeks zaproszeń w stanie globalnym). */
function rodzinaZaproszenia(token: string): StanRodziny | null {
  const idRodziny = odczytajGlobalne().zaproszenia[token];
  return idRodziny === undefined ? null : odczytajStanRodziny(idRodziny);
}

/**
 * Nowe zaproszenie drugiego rodzica (3.3.3.1.1): link jednorazowy ważny 7 dni od dziś, który unieważnia poprzedni.
 * Wymaga konta z rolą Rodzic i drugiego rodzica w profilu, który nie dołączył do planu.
 */
export function utworzZaproszenie(losuj: Losuj, ctx: KontekstOperacji): WynikOperacji<Zaproszenie> {
  const kontekst = rodzinaZalogowanegoRodzica();
  if (kontekst === null) return BLAD_ZAPISU;
  const { konto, rodzina } = kontekst;
  if (!czyProfilMaDrugiegoRodzica(rodzina.daneRodziny) || dolaczonyDrugiRodzic(rodzina.daneRodziny) !== null) {
    return BLAD_ZAPISU;
  }
  const zajete = odczytajGlobalne().zaproszenia;
  let token = nowyToken(losuj);
  for (let proba = 0; proba < 5 && zajete[token] !== undefined; proba += 1) token = nowyToken(losuj);
  const zaproszenie = noweZaproszenie(token, konto.pesel, ctx.dzis, ctx.teraz);

  return wykonajOperacjeZWynikiem(() => {
    const zapisana = zmienStanRodziny(rodzina.idRodziny, (s) => ({
      ...s,
      daneRodziny: { ...s.daneRodziny, zaproszenie },
    }));
    if (zapisana === null) return BLAD_ZAPISU;
    zmienGlobalne((g) => ({ ...g, zaproszenia: { ...g.zaproszenia, [token]: rodzina.idRodziny } }), 'domenowe');
    return { ok: true, wartosc: zaproszenie };
  });
}

/** Dane konta ZUS drugiego rodzica: kopia z jego konta przewodnika albo bieżące dane symulowanego ZUS. */
function daneKontaDrugiegoRodzica(stanKonta: StanKonta, ctx: KontekstOperacji): DaneDrugiegoRodzicaZKonta {
  const kopia = stanKonta.kopiaDanychZus;
  if (kopia !== null) return { zrodlo: 'konto-zus', tytuly: kopia.tytuly, zasilki: kopia.zasilki, odczytano: kopia.odczytano };
  const pesel = stanKonta.konto.pesel;
  const zrodlo = zrodloweDaneKonta(pesel, odczytajStanZus(pesel), stanKonta.konto);
  return { zrodlo: 'konto-zus', tytuly: zrodlo?.tytuly ?? [], zasilki: zrodlo?.zasilki ?? [], odczytano: ctx.teraz };
}

/**
 * Przyjęcie zaproszenia (R-DOLACZENIE): konto otrzymuje rolę Drugi rodzic i dostęp do planu rodziny z dzisiejszą
 * datą, zaproszenie jest wykorzystane, dane drugiego rodzica pochodzą z jego konta ZUS, a plan jest wyliczony
 * ponownie. Ekran ViewFamilyPlan pokazuje po przejściu komunikat 0069.
 */
export function przyjmijZaproszenie(token: string, ctx: KontekstOperacji): WynikOperacji {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return BLAD_ZAPISU;
  const stanKonta = zalogowany.stanKonta;
  const konto = stanKonta.konto;
  const rodzina = rodzinaZaproszenia(token);
  const kod = ocenLinkZaproszenia(token, konto, rodzina, ctx.dzis);
  if (kod !== null || rodzina === null) return { ok: false, kod: kod ?? '0066' };
  const zaproszenie = rodzina.daneRodziny.zaproszenie as Zaproszenie;
  const daneKonta = daneKontaDrugiegoRodzica(stanKonta, ctx);

  const wynik = wykonajOperacjeZWynikiem<void>(() => {
    zmienStanRodziny(rodzina.idRodziny, (s) => ({
      ...s,
      daneRodziny: {
        ...s.daneRodziny,
        drugiRodzic: drugiRodzicPoDolaczeniu(s.daneRodziny.drugiRodzic, konto, daneKonta, ctx.dzis),
        dostepKont: dostepPoDolaczeniu(s.daneRodziny.dostepKont, konto.pesel, ctx.dzis),
        zaproszenie: { ...zaproszenie, stan: 'wykorzystane' },
      },
    }));
    const zmienione = zmienKonto(konto.pesel, (k) => ({ ...k, rola: 'drugi-rodzic', idRodziny: rodzina.idRodziny }));
    if (zmienione === null) return BLAD_ZAPISU;
    return przeliczRodzine(rodzina.idRodziny, ctx);
  });
  if (wynik.ok) ustawKomunikatPoPrzejsciu({ kod: '0069', dlaWidoku: 'ViewFamilyPlan' });
  return wynik;
}

/**
 * Odrzucenie zaproszenia (R-ODRZUCENIE): rola konta się nie zmienia, a jednorazowy link przestaje działać.
 * Kierowanie po odrzuceniu (ViewGuideWelcome albo ViewProfileZusData) wyznacza widok ze stanu zgody konta.
 */
export function odrzucZaproszenie(token: string, ctx: KontekstOperacji): WynikOperacji {
  const konto = odczytajZalogowanego()?.stanKonta.konto ?? null;
  if (konto === null) return BLAD_ZAPISU;
  const rodzina = rodzinaZaproszenia(token);
  const kod = ocenLinkZaproszenia(token, konto, rodzina, ctx.dzis);
  if (kod !== null || rodzina === null) return { ok: false, kod: kod ?? '0066' };
  return wykonajOperacjeZWynikiem<void>(() => {
    const zapisana = zmienStanRodziny(rodzina.idRodziny, (s) =>
      s.daneRodziny.zaproszenie?.token === token
        ? { ...s, daneRodziny: { ...s.daneRodziny, zaproszenie: { ...s.daneRodziny.zaproszenie, stan: 'odrzucone' } } }
        : s,
    );
    return zapisana === null ? BLAD_ZAPISU : { ok: true, wartosc: undefined };
  });
}

/**
 * Odłączenie drugiego rodzica (R-ODLACZENIE): konto drugiego rodzica traci rolę Drugi rodzic, rodzinę i przypomnienia
 * tej rodziny, dane drugiego rodzica zostają w profilu ze źródłem odpowiedź rodzica, a stan dostępu to
 * „Odłączony” z dzisiejszą datą. Przeliczenie kieruje przypomnienia o sprawach drugiego rodzica na konto Rodzica.
 */
export function odlaczDrugiegoRodzica(ctx: KontekstOperacji): WynikOperacji {
  const kontekst = rodzinaZalogowanegoRodzica();
  if (kontekst === null) return BLAD_ZAPISU;
  const { rodzina } = kontekst;
  const dolaczony = dolaczonyDrugiRodzic(rodzina.daneRodziny);
  if (dolaczony === null) return BLAD_ZAPISU;
  const idRodziny = rodzina.idRodziny;

  return wykonajOperacjeZWynikiem<void>(() => {
    zmienStanRodziny(idRodziny, (s) => ({
      ...s,
      daneRodziny: {
        ...s.daneRodziny,
        drugiRodzic: drugiRodzicPoOdlaczeniu(s.daneRodziny.drugiRodzic),
        dostepKont: dostepPoOdlaczeniu(s.daneRodziny.dostepKont, ctx.dzis),
      },
    }));
    zmienStanKonta(dolaczony.pesel, (s) => {
      const wRodzinie = s.konto.idRodziny === idRodziny;
      return {
        ...s,
        konto: wRodzinie ? { ...s.konto, rola: 'nowy-uzytkownik', idRodziny: null } : s.konto,
        powiadomienia: s.powiadomienia.filter((p) => !czyPrzypomnienieRodziny(p, idRodziny)),
      };
    });
    return przeliczRodzine(idRodziny, ctx);
  });
}

/**
 * Odczyt danych drugiego rodzica na podstawie obowiązującego pełnomocnictwa PEL (R-PEL-ODCZYT): zapis zakresu
 * R-PEL-ZAKRES ze źródłem pełnomocnictwo PEL i datą odczytu, zachowanie odpowiedzi rodzica i przeliczenie planu.
 * Brak połączenia z kontem ZUS daje 0001 bez zmiany danych; pełnomocnictwo w innym stanie daje kod swojego stanu.
 */
export function odczytajDaneZPelnomocnictwa(ctx: KontekstOperacji): WynikOperacji {
  const konto = odczytajZalogowanego()?.stanKonta.konto ?? null;
  const rodzina = konto === null ? null : rodzinaRodzicaBezDolaczonego(konto.pesel);
  if (konto === null || rodzina === null) return BLAD_ZAPISU;
  const drugi = rodzina.daneRodziny.drugiRodzic;
  const p = pelnomocnictwoDrugiegoRodzica(konto.pesel, drugi, ctx.dzis);
  const stan = stanPelnomocnictwa(p, ctx.dzis);
  if (p === null || stan !== 'obowiazuje') {
    return { ok: false, kod: komunikatStanu(p, stan, formatujDate)?.kod ?? '0223' };
  }
  if (czySymulacja('daneZusNiedostepne')) return { ok: false, kod: '0001' };
  const dane = odczytajDaneMocodawcy(p, ctx);
  if (dane === null) return { ok: false, kod: '0001' };

  return wykonajOperacjeZWynikiem<void>(() => {
    const zapisana = zapiszDrugiegoRodzica(rodzina.idRodziny, zastosujDaneZPelnomocnictwa(drugi, dane, p.mocodawca));
    if (zapisana === null) return BLAD_ZAPISU;
    return przeliczRodzine(rodzina.idRodziny, ctx);
  });
}

// --- Podgląd zaproszenia dla konta, które otworzyło link ---------------------------------------

export interface PodgladZaproszenia {
  /** Rodzina zapraszającego rodzica albo null dla nieznanego tokenu. */
  rodzina: StanRodziny | null;
  /** Konto zapraszającego rodzica (imię i nazwisko na ekranie ViewInviteAccept). */
  zapraszajacy: KontoPrzewodnika | null;
}

const BRAK_PODGLADU: PodgladZaproszenia = { rodzina: null, zapraszajacy: null };
const pamiecPodgladu = new Map<string, PodgladZaproszenia>();

function migawkaPodgladu(token: string): PodgladZaproszenia {
  const rodzina = rodzinaZaproszenia(token);
  if (rodzina === null) return BRAK_PODGLADU;
  const peselZapraszajacego = rodzina.daneRodziny.zaproszenie?.zapraszajacy ?? rodzina.idRodziny;
  const zapraszajacy = odczytajStanKonta(peselZapraszajacego)?.konto ?? null;
  const poprzedni = pamiecPodgladu.get(token);
  if (poprzedni && poprzedni.rodzina === rodzina && poprzedni.zapraszajacy === zapraszajacy) return poprzedni;
  const nowy = { rodzina, zapraszajacy };
  pamiecPodgladu.set(token, nowy);
  return nowy;
}

function migawkaPodgladuSerwera(): PodgladZaproszenia {
  return BRAK_PODGLADU;
}

/**
 * Rodzina i konto zapraszającego dla tokenu z linku. Konto, które otworzyło link, nie należy jeszcze do tej
 * rodziny, więc ekran ViewInviteAccept czyta wyłącznie zaproszenie i imię oraz nazwisko zapraszającego.
 */
export function usePodgladZaproszenia(token: string): PodgladZaproszenia {
  const migawka = useCallback(() => migawkaPodgladu(token), [token]);
  return useSyncExternalStore(subskrybuj, migawka, migawkaPodgladuSerwera);
}
