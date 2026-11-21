// Narodziny dziecka: data porodu, okno nowego dziecka, dane dziecka (kontrakt, sekcja 6.5). Właściciel: u19 (Pakiet narodzin).
// obsluzNoweDzieci leży w rejestrze po-odczycie-zus (plik u19) i jest tu reeksportowana.
// Po potwierdzeniu daty porodu bez zgody i po zapisie danych dziecka w pakiecie operacja ustawia komunikat
// po przejściu 0057 (w spokojnym trybie 0126) dla ViewBirthPackage.
import { czyMaZgode } from '@/domena/konto';
import {
  dzieciZTaSamaData,
  liczbaDzieciZPola,
  odczytajDaneDziecka,
  walidujDaneDziecka,
  walidujDatePorodu,
  wyznaczUzupelniajacyUrlop,
  wyznaczWymiarUrlopuRodzicielskiego,
  type FormularzDanychDziecka,
  type FormularzDatyPorodu,
} from '@/domena/rodzina/narodziny';
import { parsujDate } from '@/domena/daty';
import type {
  CzlonekRodzinyZus,
  DaneCiazyIDziecka,
  DaneRodziny,
  DzieckoProfilu,
  KodKomunikatu,
  KontekstOperacji,
  LiczbaDzieci,
  StanRodziny,
  WynikOperacji,
} from '@/domena/typy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { zapiszSzkic } from '@/dane/magazyn/operacje/profil-szkic';
import {
  odczytajKatalog,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zapiszStanRodziny,
} from '@/dane/magazyn/stan';

export { obsluzNoweDzieci } from '@/dane/magazyn/operacje/po-odczycie-zus/obsluz-nowe-dzieci';

/** Puste Dane ciąży i dziecka dla rodziny, która ich jeszcze nie ma. */
export function pusteDaneCiazy(): DaneCiazyIDziecka {
  return { dataPoroduPotwierdzona: false, dzieci: [], sytuacjeSzczegolne: [], spokojnyTryb: { wlaczony: false } };
}

/** Dzieci profilu po dopisaniu dzieci z danych ZUS (te same numery PESEL zastępują wcześniejsze wpisy). */
export function scalDzieciZDanymiZus(dzieci: readonly DzieckoProfilu[], zZus: readonly CzlonekRodzinyZus[]): DzieckoProfilu[] {
  const pesele = new Set(zZus.map((d) => d.pesel));
  const zachowane = dzieci.filter((d) => d.zrodlo === 'konto-zus' && d.pesel !== undefined && !pesele.has(d.pesel));
  const nowe: DzieckoProfilu[] = zZus.map((d) => ({
    imie: d.imie, nazwisko: d.nazwisko, pesel: d.pesel, dataUrodzenia: d.dataUrodzenia, zrodlo: 'konto-zus',
  }));
  const zOdpowiedzi = dzieci.filter((d) => d.zrodlo === 'odpowiedz-rodzica').slice(nowe.length + zachowane.length);
  return [...zachowane, ...nowe, ...zOdpowiedzi];
}

/** Dane ciąży bez oczekującego nowego dziecka. */
function bezOczekujacego(dane: DaneCiazyIDziecka): DaneCiazyIDziecka {
  const { noweDzieckoOczekujace, ...reszta } = dane;
  void noweDzieckoOczekujace;
  return reszta;
}

/** Sytuacja rodzica po porodzie: „oczekiwanie” zmienia się na „narodziny” (zapis przy zgodzie). */
function sytuacjaPoPorodzie(daneRodziny: DaneRodziny, zgoda: boolean): DaneRodziny {
  if (!zgoda || daneRodziny.sytuacja?.wartosc !== 'oczekiwanie') return daneRodziny;
  return { ...daneRodziny, sytuacja: { wartosc: 'narodziny', zrodlo: 'odpowiedz-rodzica' } };
}

/** Komunikat ViewBirthPackage po potwierdzeniu narodzin: 0126 w spokojnym trybie, w pozostałych przypadkach 0057. */
export function komunikatPakietu(dane: DaneCiazyIDziecka | null): KodKomunikatu {
  return dane?.spokojnyTryb.wlaczony ? '0126' : '0057';
}

interface RodzinaZalogowanego {
  rodzina: StanRodziny;
  zgoda: boolean;
}

function rodzinaZalogowanego(): RodzinaZalogowanego | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const rodzina = rodzinaKonta(zalogowany.stanKonta.konto);
  if (rodzina === null) return null;
  return { rodzina, zgoda: czyMaZgode(zalogowany.stanKonta.konto.decyzjeOZgodzie) };
}

function pierwszyBlad(bledy: Record<string, KodKomunikatu | undefined>): WynikOperacji | null {
  const wpisy = Object.entries(bledy).filter((w): w is [string, KodKomunikatu] => w[1] !== undefined);
  if (wpisy.length === 0) return null;
  return { ok: false, kod: wpisy[0][1], bledyPol: Object.fromEntries(wpisy) };
}

/** Zapis potwierdzonej daty porodu w rodzinie, przeliczenie planu i terminów, komunikat pakietu bez zgody. */
function zapiszPotwierdzenie(
  r: RodzinaZalogowanego,
  zmien: (dane: DaneCiazyIDziecka) => DaneCiazyIDziecka,
  ctx: KontekstOperacji,
): WynikOperacji {
  const { rodzina, zgoda } = r;
  const daneCiazy = zmien(rodzina.daneCiazy ?? pusteDaneCiazy());
  zapiszStanRodziny({ ...rodzina, daneCiazy, daneRodziny: sytuacjaPoPorodzie(rodzina.daneRodziny, zgoda) });
  const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
  if (!przeliczenie.ok) return przeliczenie;
  if (!zgoda) ustawKomunikatPoPrzejsciu({ kod: komunikatPakietu(daneCiazy), dlaWidoku: 'ViewBirthPackage' });
  return { ok: true, wartosc: undefined };
}

/** Potwierdzenie daty porodu (0057 albo 0126 po przejściu). */
export function potwierdzDatePorodu(dane: FormularzDatyPorodu, ctx: KontekstOperacji): WynikOperacji {
  const blad = pierwszyBlad(walidujDatePorodu(dane, ctx.dzis));
  if (blad) return blad;
  const dataPorodu = parsujDate(dane.dataPorodu) as string;
  const liczba = liczbaDzieciZPola(dane.liczbaDzieci) as LiczbaDzieci;

  if (dane.zrodlo === 'profil') {
    const szkic = odczytajZalogowanego()?.stanKonta.szkicProfilu ?? null;
    const wynik = zapiszSzkic(
      {
        daneCiazy: {
          ...(szkic?.daneCiazy ?? {}),
          dataPorodu, liczbaUrodzonychDzieci: liczba, dataPoroduPotwierdzona: true, zrodloDatyPorodu: 'odpowiedz-rodzica',
        },
      },
      'ViewBirthDate',
      ctx,
    );
    return wynik.ok ? { ok: true, wartosc: undefined } : wynik;
  }

  return wykonajOperacjeZWynikiem(() => {
    const r = rodzinaZalogowanego();
    if (r === null) return { ok: false, kod: '0003' };
    return zapiszPotwierdzenie(
      r,
      (d) => {
        const zZus = dzieciZTaSamaData(d.noweDzieckoOczekujace?.dzieci ?? []).filter((c) => c.dataUrodzenia === dataPorodu);
        return {
          ...bezOczekujacego(d),
          dataPorodu, dataPoroduPotwierdzona: true, zrodloDatyPorodu: 'odpowiedz-rodzica', liczbaUrodzonychDzieci: liczba,
          dzieci: zZus.length > 0 ? scalDzieciZDanymiZus(d.dzieci, zZus) : d.dzieci,
        };
      },
      ctx,
    );
  });
}

/** Potwierdzenie nowego dziecka z okna ModalNewChildDetected. */
export function potwierdzZOkna(ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const r = rodzinaZalogowanego();
    const oczekujace = dzieciZTaSamaData(r?.rodzina.daneCiazy?.noweDzieckoOczekujace?.dzieci ?? []);
    const pierwsze = oczekujace[0];
    if (r === null || pierwsze === undefined) return { ok: false, kod: '0003' };
    const liczba = Math.min(Math.max(oczekujace.length, 1), 5) as LiczbaDzieci;
    return zapiszPotwierdzenie(
      r,
      (d) => ({
        ...bezOczekujacego(d),
        dataPorodu: pierwsze.dataUrodzenia, dataPoroduPotwierdzona: true, zrodloDatyPorodu: 'konto-zus',
        liczbaUrodzonychDzieci: liczba, dzieci: scalDzieciZDanymiZus(d.dzieci, oczekujace),
      }),
      ctx,
    );
  });
}

/** Zamknięcie okna ModalNewChildDetected bez potwierdzenia. */
export function zamknijOkno(ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const r = rodzinaZalogowanego();
    const daneCiazy = r?.rodzina.daneCiazy ?? null;
    const oczekujace = daneCiazy?.noweDzieckoOczekujace;
    if (r === null || daneCiazy === null || oczekujace === undefined) return { ok: true, wartosc: undefined };
    zapiszStanRodziny({ ...r.rodzina, daneCiazy: { ...daneCiazy, noweDzieckoOczekujace: { ...oczekujace, zamknieto: ctx.teraz } } });
    return { ok: true, wartosc: undefined };
  });
}

/** Zapis danych dziecka po porodzie: uzupełniający urlop (K11), urlop rodzicielski, ciężka choroba (K17). */
export function zapiszDaneDziecka(dane: FormularzDanychDziecka, ctx: KontekstOperacji): WynikOperacji {
  const blad = pierwszyBlad(walidujDaneDziecka(dane));
  if (blad) return blad;
  const liczby = odczytajDaneDziecka(dane);
  if (liczby === null) return { ok: false, kod: '0003' };

  return wykonajOperacjeZWynikiem(() => {
    const r = rodzinaZalogowanego();
    if (r === null) return { ok: false, kod: '0003' };
    if (!r.zgoda) return { ok: false, kod: '0004' };
    const { rodzina } = r;
    const matka = rodzina.daneRodziny.matka;
    const forma = matka.formaZatrudnienia?.wartosc ?? null;
    const chorobowe = forma === 'umowa-o-prace' || matka.dobrowolneChorobowe?.wartosc === true;
    const obecne = rodzina.daneCiazy ?? pusteDaneCiazy();
    const dataPorodu = obecne.dataPorodu ?? ctx.dzis;
    const liczbaDzieci = obecne.liczbaUrodzonychDzieci ?? 1;
    const daneCiazy: DaneCiazyIDziecka = {
      ...obecne,
      tydzienCiazyWDniuPorodu: liczby.tydzien,
      masaUrodzeniowaG: liczby.masa,
      dniHospitalizacji5do28: liczby.dni,
      ciezkaChorobaDziecka: dane.ciezkaChoroba || dane.zaswiadczenieZaZyciem,
      zaswiadczenieZaZyciem: dane.zaswiadczenieZaZyciem,
      wymiarUzupelniajacegoUrlopu: wyznaczUzupelniajacyUrlop(forma, chorobowe, liczby.tydzien, liczby.masa, liczby.dni),
      wymiarUrlopuRodzicielskiegoTygodni: wyznaczWymiarUrlopuRodzicielskiego(
        liczbaDzieci, dane.zaswiadczenieZaZyciem, dataPorodu, odczytajKatalog(),
      ),
    };
    zapiszStanRodziny({ ...rodzina, daneCiazy });
    const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    if ((dane.tryb ?? 'pakiet') === 'pakiet') {
      ustawKomunikatPoPrzejsciu({ kod: komunikatPakietu(daneCiazy), dlaWidoku: 'ViewBirthPackage' });
    }
    return { ok: true, wartosc: undefined };
  });
}
