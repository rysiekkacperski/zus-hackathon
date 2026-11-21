// Szkic Profilu na start i zmiana profilu (kontrakt, sekcja 6.5; analiza 3.3.1, reguły R3–R6, R17).
// Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
// Szkic żyje w stanie konta (`StanKonta.szkicProfilu`), więc przetrwa zamknięcie przewodnika i wraca
// po ponownym zalogowaniu na ostatnim wyświetlonym ekranie (kierowanie, sekcja 3.6).
import { tytulDlaFormy } from '@/domena/profil/forma-zatrudnienia';
import { platnikZOdpowiedzi, type OdpowiedzOPlatniku } from '@/domena/profil/platnik';
import type {
  DaneRodzica,
  DataISO,
  DrugiRodzic,
  FormaZatrudnienia,
  IdWidoku,
  KontekstOperacji,
  LiczbaDzieci,
  RodzicWRodzinie,
  StanKonta,
  StanRodziny,
  SzkicProfilu,
  WynikOperacji,
} from '@/domena/typy';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajStanKonta,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zalogowanyPesel,
  zmienStanKonta,
  zmienStanRodziny,
} from '@/dane/magazyn/stan';

type DaneRodzinySzkicu = SzkicProfilu['daneRodziny'];

/**
 * Zmiana pól szkicu z ekranu kreatora. Scalanie: pola z wartością zastępują pola szkicu, a pole z wartością
 * `undefined` usuwa pole ze szkicu. Dane rodziców (`matka`, `drugiRodzic`) i `daneCiazy` scalają się pole po polu,
 * więc ekran przekazuje wyłącznie swoje pola.
 */
export interface ZmianaSzkicu {
  daneRodziny?: Omit<DaneRodzinySzkicu, 'matka' | 'drugiRodzic'> & {
    matka?: Partial<DaneRodzica>;
    drugiRodzic?: Partial<DrugiRodzic>;
  };
  daneCiazy?: SzkicProfilu['daneCiazy'];
  powrotNaPodsumowanie?: boolean;
}

/** Scalenie obiektu: wartość `undefined` usuwa klucz, pozostałe wartości zastępują poprzednie. */
function scal<T extends object>(bazowy: T, zmiana: Partial<T>): T {
  const wynik: Record<string, unknown> = { ...(bazowy as Record<string, unknown>) };
  for (const [klucz, wartosc] of Object.entries(zmiana)) {
    if (wartosc === undefined) delete wynik[klucz];
    else wynik[klucz] = wartosc;
  }
  return wynik as T;
}

function scalDaneRodziny(bazowe: DaneRodzinySzkicu, zmiana: NonNullable<ZmianaSzkicu['daneRodziny']>): DaneRodzinySzkicu {
  const { matka, drugiRodzic, ...reszta } = zmiana;
  const wynik = scal<DaneRodzinySzkicu>(bazowe, reszta as Partial<DaneRodzinySzkicu>);
  if (matka !== undefined) wynik.matka = scal(bazowe.matka ?? ({} as DaneRodzica), matka as Partial<DaneRodzica>);
  if (drugiRodzic !== undefined) {
    wynik.drugiRodzic = scal(bazowe.drugiRodzic ?? ({} as DrugiRodzic), drugiRodzic as Partial<DrugiRodzic>);
  }
  return wynik;
}

function nowySzkic(ekran: IdWidoku, ctx: KontekstOperacji): SzkicProfilu {
  return {
    kontekst: 'start',
    powrotNaPodsumowanie: false,
    ostatniEkran: ekran,
    daneRodziny: {},
    daneCiazy: {},
    zmienionePola: [],
    utworzono: ctx.teraz,
    zaktualizowano: ctx.teraz,
  };
}

/** Szkic w trybie zmiany profilu z zapisanych Danych rodziny i Danych ciąży i dziecka. */
function szkicZRodziny(rodzina: StanRodziny, ctx: KontekstOperacji): SzkicProfilu {
  const { daneRodziny, daneCiazy } = rodzina;
  const dane: DaneRodzinySzkicu = {
    sytuacja: daneRodziny.sytuacja,
    rodzicKonta: daneRodziny.rodzicKonta,
    matka: daneRodziny.matka,
    drugiRodzic: daneRodziny.drugiRodzic,
    stanCywilny: daneRodziny.stanCywilny,
    gmina: daneRodziny.gmina,
    dochodNaOsobe: daneRodziny.dochodNaOsobe,
  };
  if (daneRodziny.uznanieOjcostwa !== undefined) dane.uznanieOjcostwa = daneRodziny.uznanieOjcostwa;
  return {
    kontekst: 'zmiana-profilu',
    powrotNaPodsumowanie: true,
    ostatniEkran: 'ViewProfileSummary',
    daneRodziny: dane,
    daneCiazy: daneCiazy ?? {},
    zmienionePola: [],
    utworzono: ctx.teraz,
    zaktualizowano: ctx.teraz,
  };
}

/** Szkic zalogowanego konta: istniejący, nowy dla Nowego użytkownika albo z zapisanej rodziny dla Rodzica. */
function szkicDoZmiany(stan: StanKonta, ekran: IdWidoku, ctx: KontekstOperacji): SzkicProfilu {
  if (stan.szkicProfilu !== null) return stan.szkicProfilu;
  const rodzina = stan.konto.rola === 'nowy-uzytkownik' ? null : rodzinaKonta(stan.konto);
  return rodzina === null ? nowySzkic(ekran, ctx) : szkicZRodziny(rodzina, ctx);
}

function zastosujZmiane(szkic: SzkicProfilu, zmiana: ZmianaSzkicu, ekran: IdWidoku, ctx: KontekstOperacji): SzkicProfilu {
  return {
    ...szkic,
    ostatniEkran: ekran,
    powrotNaPodsumowanie: zmiana.powrotNaPodsumowanie ?? szkic.powrotNaPodsumowanie,
    daneRodziny: zmiana.daneRodziny ? scalDaneRodziny(szkic.daneRodziny, zmiana.daneRodziny) : szkic.daneRodziny,
    daneCiazy: zmiana.daneCiazy ? scal(szkic.daneCiazy, zmiana.daneCiazy) : szkic.daneCiazy,
    zaktualizowano: ctx.teraz,
  };
}

/** Zapis zmiany szkicu i ostatniego ekranu kreatora; zwraca szkic po zmianie. */
export function zapiszSzkic(zmiana: ZmianaSzkicu, ekran: IdWidoku, ctx: KontekstOperacji): WynikOperacji<SzkicProfilu> {
  return wykonajOperacjeZWynikiem<SzkicProfilu>(() => {
    const pesel = zalogowanyPesel();
    if (pesel === null) return { ok: false, kod: '0003' };
    let wynik: SzkicProfilu | null = null;
    const stan = zmienStanKonta(pesel, (s) => {
      wynik = zastosujZmiane(szkicDoZmiany(s, ekran, ctx), zmiana, ekran, ctx);
      return { ...s, szkicProfilu: wynik };
    });
    if (stan === null || wynik === null) return { ok: false, kod: '0003' };
    return { ok: true, wartosc: wynik };
  });
}

/**
 * Zapis ostatniego wyświetlonego ekranu kreatora (wznowienie, R6). Konto Nowy użytkownik dostaje szkic przy
 * pierwszym ekranie; konto z rodziną zapisuje ekran wyłącznie w istniejącym szkicu zmiany profilu.
 */
export function zapiszOstatniEkran(ekran: IdWidoku, ctx: KontekstOperacji, powrotNaPodsumowanie?: boolean): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const pesel = zalogowanyPesel();
    if (pesel === null) return { ok: false, kod: '0003' };
    const stan = odczytajStanKonta(pesel);
    if (stan === null) return { ok: false, kod: '0003' };
    const szkic = stan.szkicProfilu;
    if (szkic === null && stan.konto.rola !== 'nowy-uzytkownik') return { ok: true, wartosc: undefined };
    const powrot = powrotNaPodsumowanie ?? szkic?.powrotNaPodsumowanie ?? false;
    if (szkic !== null && szkic.ostatniEkran === ekran && szkic.powrotNaPodsumowanie === powrot) {
      return { ok: true, wartosc: undefined };
    }
    zmienStanKonta(pesel, (s) => ({
      ...s,
      szkicProfilu: { ...(s.szkicProfilu ?? nowySzkic(ekran, ctx)), ostatniEkran: ekran, powrotNaPodsumowanie: powrot, zaktualizowano: ctx.teraz },
    }));
    return { ok: true, wartosc: undefined };
  });
}

/** Szkic w trybie zmiany profilu z zapisanych Danych rodziny i Danych ciąży i dziecka. */
export function rozpocznijZmianeProfilu(ctx: KontekstOperacji): WynikOperacji<SzkicProfilu> {
  return wykonajOperacjeZWynikiem<SzkicProfilu>(() => {
    const pesel = zalogowanyPesel();
    if (pesel === null) return { ok: false, kod: '0003' };
    const stan = odczytajStanKonta(pesel);
    if (stan === null) return { ok: false, kod: '0003' };
    if (stan.szkicProfilu !== null && stan.szkicProfilu.kontekst === 'zmiana-profilu') {
      return { ok: true, wartosc: stan.szkicProfilu };
    }
    const rodzina = rodzinaKonta(stan.konto);
    if (rodzina === null) return { ok: false, kod: '0003' };
    const szkic = szkicZRodziny(rodzina, ctx);
    zmienStanKonta(pesel, (s) => ({ ...s, szkicProfilu: szkic }));
    return { ok: true, wartosc: szkic };
  });
}

/** Porzucenie szkicu w trybie zmiany profilu; szkic Profilu na start zostaje bez zmian. */
export function anulujZmianyProfilu(ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  return wykonajOperacjeZWynikiem(() => {
    const pesel = zalogowanyPesel();
    if (pesel === null) return { ok: false, kod: '0003' };
    const stan = odczytajStanKonta(pesel);
    if (stan === null) return { ok: false, kod: '0003' };
    if (stan.szkicProfilu?.kontekst === 'zmiana-profilu') {
      zmienStanKonta(pesel, (s) => ({ ...s, szkicProfilu: null }));
    }
    return { ok: true, wartosc: undefined };
  });
}

/** Data porodu i liczba urodzonych dzieci z ViewBirthDate w trybie profilu zapisane w szkicu (KA-04 3.3.1.4.1). */
export function zapiszDatePoroduWSzkicu(
  dane: { dataPorodu: DataISO; liczbaUrodzonychDzieci: LiczbaDzieci },
  ctx: KontekstOperacji,
): WynikOperacji<SzkicProfilu> {
  return zapiszSzkic(
    {
      daneCiazy: {
        dataPorodu: dane.dataPorodu,
        liczbaUrodzonychDzieci: dane.liczbaUrodzonychDzieci,
        dataPoroduPotwierdzona: true,
        zrodloDatyPorodu: 'odpowiedz-rodzica',
      },
    },
    'ViewBirthDate',
    ctx,
  );
}

type PlatnikRodzica = NonNullable<DaneRodzica['platnikZasilku']>;

function platnikZOdpowiedziRodzica(
  odpowiedz: OdpowiedzOPlatniku,
  forma: FormaZatrudnienia | 'brak-drugiego-rodzica' | undefined,
  stan: StanKonta,
  wlasneDane: boolean,
): PlatnikRodzica {
  const platnik: PlatnikRodzica = { wartosc: platnikZOdpowiedzi(odpowiedz), zrodlo: 'odpowiedz-rodzica' };
  if (odpowiedz !== 'tak' || !wlasneDane || forma === 'brak-drugiego-rodzica') return platnik;
  const nazwa = tytulDlaFormy(stan.kopiaDanychZus, forma)?.platnik.nazwa;
  return nazwa ? { ...platnik, nazwaPlatnika: nazwa } : platnik;
}

/**
 * Płatnik zasiłku z odpowiedzi rodzica na ViewProfilePayer ze źródłem odpowiedź rodzica: tak oznacza płatnika
 * składek, nie oznacza ZUS, nie wiem oznacza płatnika nieustalonego. Przy szkicu odpowiedź trafia do szkicu,
 * a bez szkicu (Rodzic albo Drugi rodzic z planu albo kreatora wniosku) do Danych rodziny z przeliczeniem.
 */
export function zapiszOdpowiedzPlatnika(
  rodzic: RodzicWRodzinie,
  odpowiedz: OdpowiedzOPlatniku,
  ctx: KontekstOperacji,
): WynikOperacji {
  const klucz = rodzic === 'drugi-rodzic' ? 'drugiRodzic' : 'matka';
  let przeliczyc: string | null = null;

  const wynik = wykonajOperacjeZWynikiem(() => {
    const pesel = zalogowanyPesel();
    if (pesel === null) return { ok: false, kod: '0003' };
    const stan = odczytajStanKonta(pesel);
    if (stan === null) return { ok: false, kod: '0003' };

    const rodzina = stan.szkicProfilu === null && stan.konto.rola !== 'nowy-uzytkownik' ? rodzinaKonta(stan.konto) : null;
    if (rodzina !== null) {
      const rola = stan.konto.rola;
      const kluczKonta = rola === 'drugi-rodzic' ? 'drugiRodzic' : rodzina.daneRodziny.rodzicKonta === 'drugi-rodzic' ? 'drugiRodzic' : 'matka';
      const dane = rodzina.daneRodziny[klucz];
      const platnik = platnikZOdpowiedziRodzica(odpowiedz, dane.formaZatrudnienia?.wartosc, stan, kluczKonta === klucz);
      zmienStanRodziny(rodzina.idRodziny, (r) => ({
        ...r,
        daneRodziny: {
          ...r.daneRodziny,
          [klucz]: { ...r.daneRodziny[klucz], platnikZasilku: platnik },
          zapisano: ctx.teraz,
        },
      }));
      przeliczyc = rodzina.idRodziny;
      return { ok: true, wartosc: undefined };
    }

    const szkic = szkicDoZmiany(stan, 'ViewProfilePayer', ctx);
    const kluczKonta = szkic.daneRodziny.rodzicKonta === 'drugi-rodzic' ? 'drugiRodzic' : 'matka';
    const forma = szkic.daneRodziny[klucz]?.formaZatrudnienia?.wartosc;
    const platnik = platnikZOdpowiedziRodzica(odpowiedz, forma, stan, kluczKonta === klucz);
    const zmiana: ZmianaSzkicu = { daneRodziny: { [klucz]: { platnikZasilku: platnik } } };
    zmienStanKonta(pesel, (s) => ({ ...s, szkicProfilu: zastosujZmiane(szkic, zmiana, 'ViewProfilePayer', ctx) }));
    return { ok: true, wartosc: undefined };
  });

  if (wynik.ok && przeliczyc !== null) przeliczRodzine(przeliczyc, ctx);
  return wynik;
}
