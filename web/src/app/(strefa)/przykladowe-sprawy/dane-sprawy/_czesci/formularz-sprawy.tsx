'use client';

// Karty danych przykładowej sprawy na ViewSampleCaseData (3.4.3.1.1, 3.4.3.1.3, 3.4.3.1.4, 3.4.3.1.5):
// pola pogrupowane według Danych sprawy, źródło przy każdej wartości, korekty, rozstrzygnięcie i zatwierdzenie.
// Każda grupa danych jest osobną częścią ekranu (?czesc=N, podział w ../../_czesci/czesci-danych-sprawy.ts), żeby
// część mieściła się w oknie bez przewijania. Błąd pola pokazuje się po opuszczeniu pola, „Przejdź dalej” sprawdza
// pola bieżącej części, a „Zatwierdź dane” na ostatniej części cały formularz.
import { useState, type ChangeEvent, type ReactNode } from 'react';
import { PrzyciskiCzesci, useCzesciFormularza, type CzesciFormularza } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { formatujMiesiac } from '@/komponenty/format';
import { Ikona } from '@/komponenty/ikona';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { BladPola, idBledu } from '@/komponenty/pole';
import { Przycisk, klasyPrzycisku } from '@/komponenty/przycisk';
import { PrzyciskIkona } from '@/komponenty/przycisk-ikona';
import { trasy } from '@/komponenty/rama/trasy';
import { Segmenty } from '@/komponenty/segmenty';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos } from '@/komponenty/uklad';
import { Tabela } from '@/komponenty/tabela';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { dataZeZnacznika, dodajMiesiaceDoMiesiaca, dodajMinuty, formatujDate, formatujDateICzas, miesiacZDaty } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import {
  POLA_PROSTE,
  POLE_OKRESOW_CHOROBOWYCH,
  dataDoPola,
  formularzZeSprawy,
  idKwoty,
  idOkresuChorobowego,
  idOkresuWniosku,
  idRozstrzygniecia,
  idSwiadczeniaWniosku,
  rowne,
  rozstrzygniecieZFormularza,
  walidujFormularzSprawy,
  zmianyZFormularza,
  type FormularzSprawy,
  type PoleProste,
} from '@/domena/przykladowe-sprawy/walidacja';
import { zapiszKorekte, zapiszRozstrzygniecie } from '@/dane/magazyn/operacje/przykladowe-sprawy';
import { zatwierdzDaneSprawy } from '@/dane/magazyn/operacje/weryfikacja-sprawy';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { DokumentSprawy, KodKomunikatu, SprawaPrzykladowa, WartoscOdczytana, WartoscSprawy, ZrodloWartosciSprawy } from '@/domena/typy';
import { teksty } from '@/teksty';
import { czesciDanychSprawy, type CzescDanychSprawy } from '../../_czesci/czesci-danych-sprawy';
import { nazwaDokumentu } from '../../_czesci/opisy';
import { OknoPodgladuDokumentu } from './okno-podgladu-dokumentu';
import { PodtytulKarty, PoleWpisuSprawy, PoleWyboruSprawy, SiatkaPol, type OpisZrodla } from './pole-sprawy';

const t = teksty.ViewSampleCaseData;
const o = t.opcje;
const ID_DODAJ = 'dodaj-plik';
const ID_POSTEPU = 'postep-danych-sprawy';

type PoleRozstrzygniecia = keyof FormularzSprawy['rozstrzygniecie'][number];

const POLA_WPISU_ROZSTRZYGNIECIA = [
  ['sw', 'swiadczenie'],
  ['prawo', 'prawo'],
  ['platnik', 'platnik'],
  ['od', 'od'],
  ['do', 'do'],
  ['stawka', 'stawka'],
  ['kwota', 'kwota'],
] as const satisfies readonly (readonly [Parameters<typeof idRozstrzygniecia>[1], PoleRozstrzygniecia])[];

function wielka(tekst: string): string {
  return tekst.length === 0 ? tekst : tekst[0].toLocaleUpperCase('pl-PL') + tekst.slice(1);
}

function nazwaZrodla(zrodlo: ZrodloWartosciSprawy, dokumenty: readonly DokumentSprawy[]): string | null {
  if (zrodlo.rodzaj !== 'dokument') return null;
  const d = dokumenty.find((x) => x.id === zrodlo.idDokumentu);
  return d ? nazwaDokumentu(d) : null;
}

/** Wartość pola formularza o identyfikatorze pola z walidacji (do oceny, czy pole zmieniło się od błędu). */
function wartoscPolaFormularza(f: FormularzSprawy, id: string): unknown {
  if ((POLA_PROSTE as readonly string[]).includes(id)) return f.pola[id as PoleProste];
  if (id === POLE_OKRESOW_CHOROBOWYCH) return f.okresyChorobowe;
  let m = /^ok-(\d+)-(od|do)$/.exec(id);
  if (m) return f.okresyChorobowe[Number(m[1])]?.[m[2] as 'od' | 'do'];
  m = /^url-(\d+)-(rodzaj|od|do)$/.exec(id);
  if (m) {
    const okres = f.okresyWniosku[Number(m[1])];
    return m[2] === 'rodzaj' ? okres?.rodzajUrlopu : okres?.[m[2] as 'od' | 'do'];
  }
  m = /^m-(\d+)$/.exec(id);
  if (m) return f.kwoty[Number(m[1])]?.kwota;
  m = /^swiadczenie-(\d+)$/.exec(id);
  if (m) return f.swiadczeniaWniosku[Number(m[1])];
  m = /^r-(\d+)-(\w+)$/.exec(id);
  if (m) {
    const pole = POLA_WPISU_ROZSTRZYGNIECIA.find(([klucz]) => klucz === m?.[2])?.[1];
    return pole ? f.rozstrzygniecie[Number(m[1])]?.[pole] : undefined;
  }
  return undefined;
}

/** Numer wpisu rozstrzygnięcia z identyfikatora pola `r-<numer>-<pole>` albo null. */
function wpisRozstrzygnieciaPola(id: string | null): number | null {
  const m = id === null ? null : /^r-(\d+)-/.exec(id);
  return m ? Number(m[1]) : null;
}

interface OpcjeOpisu {
  dokumenty: readonly DokumentSprawy[];
  zmieniona: boolean;
  pierwotna: string;
  osobowe?: 'imie' | 'pesel';
  trwa?: 'tytul' | 'okres' | null;
  brak?: string;
}

/** Opis źródła wartości pod polem. */
function opisZrodla(w: WartoscSprawy<unknown> | { zrodlo: ZrodloWartosciSprawy; odczytaneAI?: boolean; daneZastapione?: boolean }, op: OpcjeOpisu): OpisZrodla {
  const korekta = (pierwotna: string): OpisZrodla => ({
    ikona: 'edytuj',
    tekst: (
      <>
        <strong>{t.zrodla.korekta}</strong>
        {pierwotna ? ` ${t.zrodla.odczytano({ wartosc: pierwotna })}` : null}
      </>
    ),
  });
  if (op.zmieniona) return korekta(op.pierwotna);
  if (w.zrodlo.rodzaj === 'korekta-uzytkownika') {
    const p = w.zrodlo.wartoscPierwotna;
    return korekta(typeof p === 'string' || typeof p === 'number' ? String(p) : '');
  }
  if (w.daneZastapione) {
    return { ikona: 'dane-losowe', tekst: op.osobowe === 'pesel' ? t.zrodla.zastapionyPesel : `${t.zrodla.zastapione}. ${t.zrodla.tylkoDoOdczytu}` };
  }
  if (w.zrodlo.rodzaj === 'dokument') {
    return { ikona: 'iskry-ai', tekst: t.zrodla.odczytaneAI({ dokument: nazwaZrodla(w.zrodlo, op.dokumenty) ?? '' }) };
  }
  if (w.zrodlo.rodzaj === 'sprawa-zespolu') {
    return { tekst: op.osobowe === 'imie' ? `${t.zrodla.tylkoDoOdczytu}. ${t.zrodla.sprawaZespolu}` : t.zrodla.sprawaZespolu };
  }
  if (w.zrodlo.rodzaj === 'podaje-uzytkownik') return { tekst: t.zrodla.podajeszTy };
  if (w.zrodlo.rodzaj === 'wartosc-domyslna') return { tekst: t.zrodla.wartoscDomyslna };
  if (op.trwa === 'tytul') return { tekst: t.zrodla.tytulTrwa };
  if (op.trwa === 'okres') return { tekst: t.zrodla.okresTrwa };
  return { tekst: op.brak ?? t.zrodla.brak };
}

type PropsyPola = { blad: KodKomunikatu | null; onOpuszczenie: () => void };

export interface FormularzSprawyProps {
  sprawa: SprawaPrzykladowa;
  // Właściciel danych: PESEL konta albo 'gosc:<id>' w trybie gościa.
  konto?: string;
  teraz: string;
  onDodajDokument: (plik: File) => Promise<KodKomunikatu | null>;
  dodawanie: string | null;
  /** Komunikaty i notatka nad pierwszą częścią (dokumenty sprawy). */
  wprowadzenie?: ReactNode;
}

export function FormularzDanychSprawy({ sprawa, konto, teraz, onDodajDokument, dodawanie, wprowadzenie }: FormularzSprawyProps) {
  const [poczatkowy] = useState<FormularzSprawy>(() => formularzZeSprawy(sprawa));
  const [f, setF] = useState<FormularzSprawy>(poczatkowy);
  const [bladStrony, setBladStrony] = useState<KodKomunikatu | null>(null);
  const [bladDodania, setBladDodania] = useState<KodKomunikatu | null>(null);
  const [podglad, setPodglad] = useState<DokumentSprawy | null>(null);
  const [aktywnyWpis, setAktywnyWpis] = useState(0);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const d = sprawa.dane;
  const dok = sprawa.dokumenty;
  const zespol = sprawa.zrodlo !== 'wgrane-dokumenty';

  // --- widoczność pól ------------------------------------------------------------------------------
  const mezczyzna = d.ubezpieczony.rola.wartosc === 'ojciec-przejmujacy';
  const jdg = f.pola.tytulRodzaj === 'dzialalnosc';
  const pokazEtat = f.pola.tytulRodzaj === 'pracownik' || d.wymiarCzasuPracy.wartosc !== null;
  const pokazLiczbeUb = f.pola.tytulRodzaj !== 'dzialalnosc' || d.liczbaUbezpieczonychPlatnika.wartosc !== null;
  const pokazUstanie = d.ustanieZatrudnienia.przyczyna.wartosc !== null || f.pola.tytulDo !== '' || f.pola.przyczyna !== '';
  const pokazDlug = jdg || d.zadluzenieJdg.wartosc !== null;
  const pokazPorod = f.pola.zdarzenie !== 'niezdolnosc';
  const pokazMartwe = f.pola.zdarzenie === 'martwe-urodzenie' || d.zdarzenie.liczbaMartwych.wartosc !== null;
  const pokazNiezdolnosc = f.pola.zdarzenie === 'niezdolnosc' || d.zdarzenie.niezdolnosc.wartosc !== null;
  const pokazMatke = f.pola.rola === 'ojciec-przejmujacy' || d.wniosek.okresMatki.wartosc !== null;
  const dalszeOkresy = d.zdarzenie.dalszeOkresy.wartosc ?? [];
  const przyznane = d.swiadczeniaPrzyznane.wartosc ?? [];
  const rodzajKwot = d.kwotyMiesieczne.wartosc?.[0]?.rodzaj ?? 'wynagrodzenie';
  const zZrzutu = sprawa.rozstrzygniecie.some((r) => r.zrodlo.rodzaj === 'dokument');
  const swiadczeniaWniosku = f.swiadczeniaWniosku.length > 0 ? f.swiadczeniaWniosku : [''];
  const liczbaWpisow = f.rozstrzygniecie.length;
  const wpis = Math.min(aktywnyWpis, Math.max(0, liczbaWpisow - 1));

  // --- części i pola każdej części w kolejności na ekranie -------------------------------------------
  const uklad = czesciDanychSprawy(sprawa);
  const polaCzesci: Record<CzescDanychSprawy, string[]> = {
    dokumenty: [],
    osoba: ['imie', 'nazwisko', 'pesel', 'rola'],
    tytul: [
      'tytulRodzaj',
      'tytulOd',
      'tytulDo',
      ...(pokazEtat ? ['etat'] : []),
      ...(pokazLiczbeUb ? ['liczbaUb'] : []),
      ...(pokazUstanie ? ['przyczyna', 'inneZatrudnienie', 'pracaPoUstaniu'] : []),
    ],
    chorobowe: [
      'rodzajCh',
      ...(pokazDlug ? ['dlug'] : []),
      ...f.okresyChorobowe.flatMap((_, i) => [idOkresuChorobowego(i, 'od'), idOkresuChorobowego(i, 'do')]),
      POLE_OKRESOW_CHOROBOWYCH,
    ],
    zdarzenie: [
      'zdarzenie',
      ...(pokazPorod ? ['porod', 'termin', 'dzieci'] : []),
      ...(pokazMartwe ? ['martwe'] : []),
      ...(pokazNiezdolnosc ? ['niezdolnoscOd', 'niezdolnoscDo', 'niezdolnoscKod'] : []),
    ],
    wniosek: [...swiadczeniaWniosku.map((_, i) => idSwiadczeniaWniosku(i)), 'zlozenie', 'oswiadczenie', ...(pokazMatke ? ['matkaOd', 'matkaDo'] : [])],
    okresy: f.okresyWniosku.flatMap((_, i) => [idOkresuWniosku(i, 'rodzaj'), idOkresuWniosku(i, 'od'), idOkresuWniosku(i, 'do')]),
    dziecko: ['tydzien', 'masa', 'zaZyciem', 'pobytOd', 'pobytDo'],
    kwoty: f.kwoty.map((_, i) => idKwoty(i)),
    poprzedni: ['popPodstawa', 'popKoniec'],
    przyznane: [],
    rozstrzygniecie: f.rozstrzygniecie.flatMap((_, i) => POLA_WPISU_ROZSTRZYGNIECIA.map(([klucz]) => idRozstrzygniecia(i, klucz))),
  };
  const podzial = uklad.map((c) => polaCzesci[c]);
  const pola = Object.fromEntries(podzial.flat().map((id) => [id, id]));

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: f,
    waliduj: (w: FormularzSprawy) => walidujFormularzSprawy(w, sprawa),
    pola,
    wartoscPola: wartoscPolaFormularza,
  });
  const czesci = useCzesciFormularza({ liczba: uklad.length, podzial, walidacja });
  const biezaca = uklad[czesci.czesc - 1];

  const ustaw = (pole: PoleProste) => (w: string) => setF((s) => ({ ...s, pola: { ...s.pola, [pole]: w } }));

  function opis(pole: PoleProste, w: WartoscSprawy<unknown>, extra: Partial<OpcjeOpisu> = {}, etykiety?: Readonly<Record<string, string>>): OpisZrodla {
    const pierwotny = poczatkowy.pola[pole];
    return opisZrodla(w, {
      dokumenty: dok,
      zmieniona: f.pola[pole] !== pierwotny,
      pierwotna: etykiety ? (etykiety[pierwotny] ?? pierwotny) : pierwotny,
      ...extra,
    });
  }

  function poleWpisu(pole: PoleProste, etykieta: string, w: WartoscSprawy<unknown>, extra: Partial<OpcjeOpisu> & { data?: boolean; inputMode?: 'numeric' | 'decimal'; tylkoDoOdczytu?: boolean } = {}) {
    const { data, inputMode, tylkoDoOdczytu, ...op } = extra;
    return (
      <PoleWpisuSprawy
        id={pole}
        etykieta={etykieta}
        wartosc={f.pola[pole]}
        onZmiana={tylkoDoOdczytu ? undefined : ustaw(pole)}
        tylkoDoOdczytu={tylkoDoOdczytu}
        data={data}
        inputMode={inputMode}
        zrodlo={opis(pole, w, op)}
        {...walidacja.pole(pole)}
      />
    );
  }

  function poleWyboru(pole: PoleProste, etykieta: string, w: WartoscSprawy<unknown>, opcje: Readonly<Record<string, string>>) {
    return (
      <PoleWyboruSprawy
        id={pole}
        etykieta={etykieta}
        wartosc={f.pola[pole]}
        opcje={opcje}
        onZmiana={ustaw(pole)}
        zrodlo={opis(pole, w, {}, opcje)}
        {...walidacja.pole(pole)}
      />
    );
  }

  // --- listy -------------------------------------------------------------------------------------
  const okresyCh = d.ubezpieczenieChorobowe.okresy;
  const okresyWn = d.wniosek.okresy;
  const kwoty = d.kwotyMiesieczne;

  function opisElementu(w: WartoscSprawy<unknown>, zmieniona: boolean, pierwotna: string, trwa: 'okres' | null = null): OpisZrodla {
    return opisZrodla(w, { dokumenty: dok, zmieniona, pierwotna, trwa });
  }

  function opisKoncaOkresuCh(i: number): OpisZrodla {
    const ustanie = d.ubezpieczenieChorobowe.dataUstaniaPrzyTrwajacymTytule;
    const tekstDo = f.okresyChorobowe[i]?.do ?? '';
    const pierwotny = poczatkowy.okresyChorobowe[i]?.do ?? '';
    if (ustanie.wartosc !== null && tekstDo === dataDoPola(ustanie.wartosc) && tekstDo === pierwotny) {
      return opisElementu(ustanie, false, '');
    }
    return opisElementu(okresyCh, tekstDo !== pierwotny, pierwotny, tekstDo === '' ? 'okres' : null);
  }

  function dodajMiesiac() {
    setF((s) => {
      const zdarzenie = s.pola.porod || s.pola.termin || s.pola.niezdolnoscOd;
      const najwczesniejszy = s.kwoty.map((k) => k.miesiac).sort()[0];
      const miesiacZdarzenia = zdarzenie && /^\d{2}\.\d{2}\.\d{4}$/.test(zdarzenie)
        ? `${zdarzenie.slice(6, 10)}-${zdarzenie.slice(3, 5)}`
        : miesiacZDaty(dataZeZnacznika(teraz));
      const miesiac = dodajMiesiaceDoMiesiaca(najwczesniejszy ?? miesiacZdarzenia, -1);
      return { ...s, kwoty: [{ miesiac, kwota: '' }, ...s.kwoty] };
    });
  }

  // --- zapis --------------------------------------------------------------------------------------
  function zapiszZmiany(zDanymi = true): boolean {
    const ctx = pobierzKontekstOperacji();
    for (const z of zDanymi ? zmianyZFormularza(f, sprawa.dane) : []) {
      const wynik = zapiszKorekte(z.pole, z.wartosc as WartoscOdczytana['wartosc'] | object, ctx);
      if (!wynik.ok) {
        setBladStrony(wynik.kod);
        return false;
      }
    }
    const rozstrzygniecie = rozstrzygniecieZFormularza(f, sprawa.rozstrzygniecie);
    if (!rowne(rozstrzygniecie, sprawa.rozstrzygniecie)) {
      const wynik = zapiszRozstrzygniecie(rozstrzygniecie, ctx);
      if (!wynik.ok) {
        setBladStrony(wynik.kod);
        return false;
      }
    }
    return true;
  }

  function czescPola(id: string): number | null {
    const indeks = podzial.findIndex((p) => p.includes(id));
    return indeks < 0 ? null : indeks + 1;
  }

  /** Pokazuje wpis rozstrzygnięcia z pierwszym błędem, żeby fokus walidacji trafił na pole tego wpisu. */
  function pokazWpisZBledem(id: string | null) {
    const numer = wpisRozstrzygnieciaPola(id);
    if (numer !== null) setAktywnyWpis(numer);
  }

  // Akcja ostatniej części po poprawnej walidacji całego formularza w czesci.dalej.
  function zatwierdz() {
    setBladStrony(null);
    ustawZajety(true);
    if (!zapiszZmiany()) {
      ustawZajety(false);
      return;
    }
    const wynik = zatwierdzDaneSprawy(pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      const bledyPol = wynik.bledyPol ?? {};
      const pierwsze = Object.keys(pola).find((id) => bledyPol[id]) ?? Object.keys(bledyPol)[0];
      if (pierwsze === undefined) {
        setBladStrony(wynik.kod);
        return;
      }
      walidacja.pokazBledy(bledyPol);
      const docelowa = czescPola(pierwsze);
      if (docelowa !== null && docelowa !== czesci.czesc) czesci.przejdzDo(docelowa, { bezFokusu: true });
      pokazWpisZBledem(pierwsze);
      return;
    }
    przejdz(trasy.ViewSampleCaseVerification());
  }

  // „Przejdź dalej” i „Zatwierdź dane”: przy błędzie w ukrytym wpisie rozstrzygnięcia pokazujemy ten wpis.
  const czesciZWpisem: CzesciFormularza = {
    ...czesci,
    dalej: (akcja) => {
      czesci.dalej(akcja);
      if (czesci.czyOstatnia) pokazWpisZBledem(walidacja.pierwszePoleZBledem());
    },
  };

  async function dodajDokument(e: ChangeEvent<HTMLInputElement>) {
    const plik = e.target.files?.[0];
    e.target.value = '';
    if (!plik) return;
    setBladDodania(null);
    const kody = Object.values(walidacja.bledyAktualne);
    zapiszZmiany(kody.every((k) => k === '0006' || k === '0018' || k === '0109'));
    const kod = await onDodajDokument(plik);
    if (kod === '0103' || kod === '0104') setBladDodania(kod);
    else if (kod) setBladStrony(kod);
  }

  // --- widok --------------------------------------------------------------------------------------
  const usun = (etykieta: string, onClick: () => void) => (
    <PrzyciskIkona ksztalt="okragly" ikona="usun" etykieta={etykieta} onClick={onClick} className="self-end" />
  );

  const nazwyCzesci: Record<CzescDanychSprawy, string> = {
    dokumenty: t.dokumenty.nazwaCzesci,
    osoba: mezczyzna ? t.osoba.daneMezczyzna : t.osoba.daneKobieta,
    tytul: t.osoba.tytul,
    chorobowe: t.chorobowe.tytul,
    zdarzenie: t.zdarzenie.zdarzenie,
    wniosek: t.zdarzenie.wniosek,
    okresy: t.zdarzenie.okresy,
    dziecko: t.dziecko.tytul,
    kwoty: t.kwoty.tytul,
    poprzedni: t.kwoty.poprzedni,
    przyznane: t.przyznane.tytul,
    rozstrzygniecie: t.rozstrzygniecie.tytul,
  };

  function kartaDokumentow() {
    return (
      <Karta tytul={t.dokumenty.tytul({ liczba: String(dok.length) })} bezLinii>
        <ul className="m-0 grid list-none gap-3 p-0">
          {dok.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line-row pb-3 last:border-b-0">
              <span className="flex min-w-0 items-start gap-3">
                <Ikona nazwa="dokument" className="mt-0.5 shrink-0 text-brand" />
                <span className="grid min-w-0">
                  <span className="font-semibold text-ink-strong">{nazwaDokumentu(x)}</span>
                  <span className="text-small text-ink-muted">
                    {x.plikZespolu
                      ? t.dokumenty.plikZespolu
                      : x.usunietoPlik
                        ? t.dokumenty.usuniety({ wgrano: formatujDateICzas(x.wgrano), usunieto: formatujDateICzas(x.usunietoPlik) })
                        : t.dokumenty.wgrany({ wgrano: formatujDateICzas(x.wgrano), usuniemy: formatujDateICzas(dodajMinuty(x.wgrano, 24 * 60)) })}
                  </span>
                </span>
              </span>
              <Przycisk wariant="drugorzedny" ikona="podglad" onClick={() => setPodglad(x)} aria-label={t.dokumenty.podgladDokumentu({ nazwa: nazwaDokumentu(x) })}>
                {t.dokumenty.podglad}
              </Przycisk>
            </li>
          ))}
        </ul>
        <div className="mt-5 grid justify-items-start gap-2">
          <label htmlFor={ID_DODAJ} className={klasyPrzycisku('drugorzedny', 'auto', dodawanie ? 'pointer-events-none opacity-70' : 'cursor-pointer')}>
            <Ikona nazwa="plus" />
            {t.dokumenty.dodaj}
          </label>
          <input
            id={ID_DODAJ}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={dodajDokument}
            disabled={dodawanie !== null}
            aria-describedby={[`${ID_DODAJ}-podpowiedz`, bladDodania ? idBledu(ID_DODAJ) : ''].filter(Boolean).join(' ')}
            aria-invalid={bladDodania ? true : undefined}
            className="sr-only"
          />
          <p id={`${ID_DODAJ}-podpowiedz`} className="m-0 text-small text-ink-muted">
            {t.dokumenty.dodajPodpowiedz}
          </p>
          {dodawanie ? <p role="status" className="m-0">{t.dokumenty.trwaOdczyt({ nazwa: dodawanie })}</p> : null}
          {bladDodania ? <BladPola id={idBledu(ID_DODAJ)} kod={bladDodania} /> : null}
        </div>
      </Karta>
    );
  }

  function kartaOsoby() {
    return (
      <Karta tytul={nazwyCzesci.osoba} bezLinii>
        <SiatkaPol>
          {poleWpisu('imie', t.osoba.imie, d.ubezpieczony.imie, { tylkoDoOdczytu: true, osobowe: 'imie' })}
          {poleWpisu('nazwisko', t.osoba.nazwisko, d.ubezpieczony.nazwisko, { tylkoDoOdczytu: true, osobowe: 'imie' })}
          {poleWpisu('pesel', t.osoba.pesel, d.ubezpieczony.pesel, { inputMode: 'numeric', osobowe: 'pesel' })}
          {poleWyboru('rola', t.osoba.rola, d.ubezpieczony.rola, o.rola)}
        </SiatkaPol>
      </Karta>
    );
  }

  function kartaTytulu() {
    return (
      <Karta tytul={t.osoba.tytul} bezLinii>
        <SiatkaPol>
          {poleWyboru('tytulRodzaj', t.osoba.tytulUbezpieczenia, d.tytul.rodzaj, o.tytul)}
          {poleWpisu('tytulOd', t.osoba.tytulOd, d.tytul.od, { data: true })}
          {poleWpisu('tytulDo', t.osoba.tytulDo, d.tytul.dataUstania, { data: true, trwa: f.pola.tytulDo === '' && f.pola.tytulOd !== '' ? 'tytul' : null })}
          {pokazEtat ? poleWyboru('etat', t.osoba.etat, d.wymiarCzasuPracy, o.etat) : null}
          {pokazEtat && f.pola.etat === 'niepelny-etat' ? poleWpisu('wymiarEtatu', t.osoba.wymiarEtatu, d.wymiarEtatu ?? { wartosc: null, zrodlo: { rodzaj: 'brak' } }) : null}
          {pokazLiczbeUb ? poleWyboru('liczbaUb', t.osoba.liczbaUb, d.liczbaUbezpieczonychPlatnika, o.liczbaUb) : null}
          {pokazUstanie ? (
            <>
              {poleWyboru('przyczyna', t.osoba.przyczyna, d.ustanieZatrudnienia.przyczyna, o.przyczyna)}
              {poleWyboru('inneZatrudnienie', t.osoba.inneZatrudnienie, d.ustanieZatrudnienia.inneZatrudnienie, o.takNie)}
              {poleWyboru('pracaPoUstaniu', t.osoba.pracaPoUstaniu, d.pracaPoUstaniu, o.takNie)}
            </>
          ) : null}
        </SiatkaPol>
      </Karta>
    );
  }

  function kartaChorobowego() {
    const bladOkresow = walidacja.blad(POLE_OKRESOW_CHOROBOWYCH);
    return (
      <Karta tytul={t.chorobowe.tytul} bezLinii>
        <SiatkaPol>
          {poleWyboru('rodzajCh', t.chorobowe.rodzaj, d.ubezpieczenieChorobowe.rodzaj, o.chorobowe)}
          {pokazDlug ? poleWpisu('dlug', t.chorobowe.dlug, d.zadluzenieJdg, { inputMode: 'decimal', brak: t.chorobowe.dlugBrak }) : null}
        </SiatkaPol>
        <PodtytulKarty id={`${POLE_OKRESOW_CHOROBOWYCH}-naglowek`}>{t.chorobowe.okresy}</PodtytulKarty>
        {poczatkowy.okresyChorobowe.length > 0 ? (
          <p className="mt-0 mb-4 text-small text-ink-muted">{opisElementu(okresyCh, false, '').tekst}</p>
        ) : null}
        {f.okresyChorobowe.length > 0 ? (
          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-4 xl:grid-cols-2">
            {f.okresyChorobowe.map((ok, i) => {
              const numer = String(i + 1);
              const pierwotny = poczatkowy.okresyChorobowe[i];
              return (
                <div key={i} className="grid grid-cols-1 items-start gap-x-4 gap-y-4 md:grid-cols-[1fr_1fr_auto]">
                  <PoleWpisuSprawy
                    id={idOkresuChorobowego(i, 'od')}
                    etykieta={t.chorobowe.okresOd({ numer })}
                    data
                    wartosc={ok.od}
                    onZmiana={(w) => setF((s) => ({ ...s, okresyChorobowe: s.okresyChorobowe.map((x, j) => (j === i ? { ...x, od: w } : x)) }))}
                    zrodlo={pierwotny === undefined ? { tekst: t.zrodla.podajeszTy } : ok.od !== pierwotny.od ? opisElementu(okresyCh, true, pierwotny.od) : null}
                    {...walidacja.pole(idOkresuChorobowego(i, 'od'))}
                  />
                  <PoleWpisuSprawy
                    id={idOkresuChorobowego(i, 'do')}
                    etykieta={t.chorobowe.okresDo({ numer })}
                    data
                    wartosc={ok.do}
                    onZmiana={(w) => setF((s) => ({ ...s, okresyChorobowe: s.okresyChorobowe.map((x, j) => (j === i ? { ...x, do: w } : x)) }))}
                    zrodlo={pierwotny === undefined ? { tekst: t.zrodla.podajeszTy } : opisKoncaOkresuCh(i)}
                    {...walidacja.pole(idOkresuChorobowego(i, 'do'))}
                  />
                  {usun(t.chorobowe.usunOkres({ numer }), () => setF((s) => ({ ...s, okresyChorobowe: s.okresyChorobowe.filter((_, j) => j !== i) })))}
                </div>
              );
            })}
          </div>
        ) : null}
        <div className={['grid justify-items-start gap-1', f.okresyChorobowe.length > 0 ? 'mt-4' : ''].join(' ')}>
          <Przycisk
            wariant="tlo"
            ikona="plus"
            id={POLE_OKRESOW_CHOROBOWYCH}
            data-blad={bladOkresow ? 'true' : undefined}
            aria-describedby={bladOkresow ? idBledu(POLE_OKRESOW_CHOROBOWYCH) : undefined}
            onClick={() => {
              const nowy = f.okresyChorobowe.length;
              setF((s) => ({ ...s, okresyChorobowe: [...s.okresyChorobowe, { od: '', do: '' }] }));
              // Fokus trafia na pierwsze pole nowego okresu po jego wyrenderowaniu.
              setTimeout(() => document.getElementById(idOkresuChorobowego(nowy, 'od'))?.focus(), 0);
            }}
          >
            {t.chorobowe.dodajOkres}
          </Przycisk>
          {bladOkresow ? <BladPola id={idBledu(POLE_OKRESOW_CHOROBOWYCH)} kod={bladOkresow} /> : null}
        </div>
      </Karta>
    );
  }

  function kartaZdarzenia() {
    return (
      <Karta tytul={t.zdarzenie.zdarzenie} bezLinii>
        <SiatkaPol>
          {poleWyboru('zdarzenie', t.zdarzenie.rodzaj, d.zdarzenie.rodzaj, o.zdarzenie)}
          {pokazPorod ? (
            <>
              {poleWpisu('porod', t.zdarzenie.porod, d.zdarzenie.dataPorodu, { data: true })}
              {poleWpisu('termin', t.zdarzenie.termin, d.zdarzenie.przewidywanyTermin, { data: true })}
              {poleWyboru('dzieci', t.zdarzenie.dzieci, d.zdarzenie.liczbaDzieci, o.dzieci)}
            </>
          ) : null}
          {pokazMartwe ? poleWpisu('martwe', t.zdarzenie.martwe, d.zdarzenie.liczbaMartwych, { inputMode: 'numeric' }) : null}
          {pokazNiezdolnosc ? (
            <>
              {poleWpisu('niezdolnoscOd', t.zdarzenie.niezdolnoscOd, d.zdarzenie.niezdolnosc, { data: true })}
              {poleWpisu('niezdolnoscDo', t.zdarzenie.niezdolnoscDo, d.zdarzenie.niezdolnosc, { data: true })}
              {poleWpisu('niezdolnoscKod', t.zdarzenie.niezdolnoscKod, d.zdarzenie.niezdolnosc)}
            </>
          ) : null}
        </SiatkaPol>
        {dalszeOkresy.length > 0 ? (
          <>
            <PodtytulKarty>{t.zdarzenie.dalszeOkresy}</PodtytulKarty>
            <ul className="m-0 grid gap-1 pl-5">
              {dalszeOkresy.map((ok) => (
                <li key={ok.od}>
                  {formatujDate(ok.od)}–{formatujDate(ok.do)}{' '}
                  <span className="text-small text-ink-muted">{opisElementu(d.zdarzenie.dalszeOkresy, false, '').tekst}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Karta>
    );
  }

  function kartaWniosku() {
    return (
      <Karta tytul={t.zdarzenie.wniosek} bezLinii>
        <SiatkaPol>
          {swiadczeniaWniosku.map((s, i) => (
            <PoleWyboruSprawy
              key={i}
              id={idSwiadczeniaWniosku(i)}
              etykieta={f.swiadczeniaWniosku.length > 1 ? t.zdarzenie.swiadczenieNr({ numer: String(i + 1) }) : t.zdarzenie.swiadczenie}
              wartosc={s}
              opcje={o.swiadczenie}
              onZmiana={(w) =>
                setF((st) => {
                  const lista = st.swiadczeniaWniosku.length > 0 ? [...st.swiadczeniaWniosku] : [''];
                  lista[i] = w;
                  return { ...st, swiadczeniaWniosku: lista };
                })
              }
              zrodlo={opisElementu(d.wniosek.swiadczenia, s !== (poczatkowy.swiadczeniaWniosku[i] ?? ''), o.swiadczenie[poczatkowy.swiadczeniaWniosku[i] as keyof typeof o.swiadczenie] ?? '')}
              {...walidacja.pole(idSwiadczeniaWniosku(i))}
            />
          ))}
          {poleWpisu('zlozenie', t.zdarzenie.zlozenie, d.wniosek.dataZlozenia, { data: true })}
          {poleWyboru('oswiadczenie', t.zdarzenie.oswiadczenie, d.wniosek.oswiadczeniePelnyWymiar, o.takNie)}
          {pokazMatke ? (
            <>
              {poleWpisu('matkaOd', t.zdarzenie.matkaOd, d.wniosek.okresMatki, { data: true })}
              {poleWpisu('matkaDo', t.zdarzenie.matkaDo, d.wniosek.okresMatki, { data: true })}
            </>
          ) : null}
        </SiatkaPol>
      </Karta>
    );
  }

  function kartaOkresowWniosku() {
    return (
      <Karta tytul={t.zdarzenie.okresy} bezLinii>
        {f.okresyWniosku.length > 0 ? (
          <Stos odstep={4}>
            {f.okresyWniosku.map((ok, i) => {
              const numer = String(i + 1);
              const p = poczatkowy.okresyWniosku[i];
              const zmien = (pole: 'rodzajUrlopu' | 'od' | 'do') => (w: string) =>
                setF((s) => ({ ...s, okresyWniosku: s.okresyWniosku.map((x, j) => (j === i ? { ...x, [pole]: w } : x)) }));
              return (
                <div key={i} className="grid grid-cols-1 items-start gap-x-6 gap-y-4 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <PoleWyboruSprawy
                    id={idOkresuWniosku(i, 'rodzaj')}
                    etykieta={t.zdarzenie.rodzajUrlopu}
                    wartosc={ok.rodzajUrlopu}
                    opcje={o.urlop}
                    onZmiana={zmien('rodzajUrlopu')}
                    zrodlo={p === undefined ? { tekst: t.zrodla.podajeszTy } : opisElementu(okresyWn, ok.rodzajUrlopu !== (p?.rodzajUrlopu ?? ''), o.urlop[p?.rodzajUrlopu as keyof typeof o.urlop] ?? '')}
                    {...walidacja.pole(idOkresuWniosku(i, 'rodzaj'))}
                  />
                  <PoleWpisuSprawy id={idOkresuWniosku(i, 'od')} etykieta={t.zdarzenie.od} data wartosc={ok.od} onZmiana={zmien('od')}
                    zrodlo={p === undefined ? { tekst: t.zrodla.podajeszTy } : opisElementu(okresyWn, ok.od !== (p?.od ?? ''), p?.od ?? '')} {...walidacja.pole(idOkresuWniosku(i, 'od'))} />
                  <PoleWpisuSprawy id={idOkresuWniosku(i, 'do')} etykieta={t.zdarzenie.do} data wartosc={ok.do} onZmiana={zmien('do')}
                    zrodlo={p === undefined ? { tekst: t.zrodla.podajeszTy } : opisElementu(okresyWn, ok.do !== (p?.do ?? ''), p?.do ?? '')} {...walidacja.pole(idOkresuWniosku(i, 'do'))} />
                  {usun(t.zdarzenie.usunOkres({ numer }), () => setF((s) => ({ ...s, okresyWniosku: s.okresyWniosku.filter((_, j) => j !== i) })))}
                </div>
              );
            })}
          </Stos>
        ) : null}
        <div className={f.okresyWniosku.length > 0 ? 'mt-4' : undefined}>
          <Przycisk wariant="tlo" ikona="plus" onClick={() => setF((s) => ({ ...s, okresyWniosku: [...s.okresyWniosku, { rodzajUrlopu: '', od: '', do: '' }] }))}>
            {t.zdarzenie.dodajOkres}
          </Przycisk>
        </div>
      </Karta>
    );
  }

  function kartaDziecka() {
    return (
      <Karta tytul={t.dziecko.tytul} bezLinii>
        <p className="mt-0 mb-5">{t.dziecko.opis}</p>
        <SiatkaPol>
          {poleWpisu('tydzien', t.dziecko.tydzien, d.dziecko.tydzienCiazy, { inputMode: 'numeric' })}
          {poleWpisu('masa', t.dziecko.masa, d.dziecko.masaG, { inputMode: 'numeric' })}
          {poleWpisu('zaZyciem', t.dziecko.zaZyciem, d.dziecko.zaZyciem, { data: true })}
          {poleWpisu('pobytOd', t.dziecko.pobytOd, d.dziecko.pobyt, { data: true })}
          {poleWpisu('pobytDo', t.dziecko.pobytDo, d.dziecko.pobyt, { data: true })}
        </SiatkaPol>
      </Karta>
    );
  }

  function kartaKwot() {
    return (
      <Karta tytul={t.kwoty.tytul} bezLinii>
        {f.kwoty.length > 0 ? (
          <>
            <p className="mt-0 mb-2">{t.kwoty.opisy[rodzajKwot]}</p>
            {/* Źródło wspólne dla kwot pokazujemy raz, a przy polu tylko korektę albo kwotę dopisaną ręcznie. */}
            <p className="mt-0 mb-5 text-small text-ink-muted">{opisElementu(kwoty, false, '').tekst}</p>
            <SiatkaPol kolumny={6}>
              {f.kwoty.map((k, i) => {
                const miesiac = wielka(formatujMiesiac(k.miesiac));
                const p = poczatkowy.kwoty.find((x) => x.miesiac === k.miesiac);
                const pierwotna = p?.kwota ? formatujKwote(Math.round(Number(p.kwota.replace(',', '.')) * 100)) : '';
                return (
                  <PoleWpisuSprawy
                    key={k.miesiac + i}
                    id={idKwoty(i)}
                    etykieta={miesiac}
                    inputMode="decimal"
                    wartosc={k.kwota}
                    onZmiana={(w) => setF((s) => ({ ...s, kwoty: s.kwoty.map((x, j) => (j === i ? { ...x, kwota: w } : x)) }))}
                    zrodlo={p === undefined ? { tekst: t.zrodla.podajeszTy } : k.kwota !== p.kwota ? opisElementu(kwoty, true, pierwotna) : null}
                    dodatek={usun(t.kwoty.usunMiesiac({ miesiac: formatujMiesiac(k.miesiac) }), () => setF((s) => ({ ...s, kwoty: s.kwoty.filter((_, j) => j !== i) })))}
                    {...walidacja.pole(idKwoty(i))}
                  />
                );
              })}
            </SiatkaPol>
          </>
        ) : (
          <StanPusty ikona="pieniadze" przerywany>
            {t.kwoty.pusto}
          </StanPusty>
        )}
        <div className="mt-4">
          <Przycisk wariant="tlo" ikona="plus" onClick={dodajMiesiac}>
            {t.kwoty.dodajMiesiac}
          </Przycisk>
        </div>
      </Karta>
    );
  }

  function kartaPoprzedniegoZasilku() {
    return (
      <Karta tytul={t.kwoty.poprzedni} bezLinii>
        <p className="mt-0 mb-5">{t.kwoty.poprzedniOpis}</p>
        <SiatkaPol>
          {poleWpisu('popPodstawa', t.kwoty.popPodstawa, d.poprzedniZasilek, { inputMode: 'decimal', brak: t.zrodla.podajeszTy })}
          {poleWpisu('popKoniec', t.kwoty.popKoniec, d.poprzedniZasilek, { data: true, brak: t.zrodla.podajeszTy })}
        </SiatkaPol>
      </Karta>
    );
  }

  function kartaPrzyznanych() {
    return (
      <Karta tytul={t.przyznane.tytul} bezLinii>
        <Tabela
          podpis={t.przyznane.podpis}
          etykietaPrzewijania={t.przyznane.etykietaPrzewijania}
          kolumny={[
            { klucz: 'swiadczenie', naglowek: t.przyznane.swiadczenie },
            { klucz: 'okres', naglowek: t.przyznane.okres },
            { klucz: 'kwota', naglowek: t.przyznane.kwota, liczbowa: true },
            { klucz: 'zrodlo', naglowek: t.przyznane.zrodlo },
          ]}
          wiersze={przyznane.map((p, i) => ({
            id: `${p.rodzaj}-${i}`,
            swiadczenie: p.rodzaj in o.swiadczenie ? o.swiadczenie[p.rodzaj as keyof typeof o.swiadczenie] : p.rodzaj,
            okres: teksty.wspolne.zlozone.zakresDat({ od: formatujDate(p.od), do: formatujDate(p.do) }),
            kwota: formatujKwote(p.kwota),
            zrodlo: opisElementu(d.swiadczeniaPrzyznane, false, '').tekst,
          }))}
        />
      </Karta>
    );
  }

  function kartaRozstrzygniecia() {
    return (
      <Karta tytul={t.rozstrzygniecie.tytul} bezLinii>
        <p className="mt-0 mb-5">
          {zZrzutu ? t.rozstrzygniecie.opisZrzutu : zespol ? t.rozstrzygniecie.opisZespolu({ id: sprawa.idSprawy ?? '' }) : t.rozstrzygniecie.opisWgranej}
        </p>
        {liczbaWpisow > 0 ? (
          <WpisRozstrzygniecia
            indeks={wpis}
            liczbaWpisow={liczbaWpisow}
            onWybierzWpis={setAktywnyWpis}
            wpis={f.rozstrzygniecie[wpis]}
            pierwotny={poczatkowy.rozstrzygniecie[wpis]}
            zrodlo={sprawa.rozstrzygniecie[wpis]?.zrodlo ?? { rodzaj: 'podaje-uzytkownik' }}
            dokumenty={dok}
            pole={walidacja.pole}
            onZmiana={(pole, w) => setF((s) => ({ ...s, rozstrzygniecie: s.rozstrzygniecie.map((x, j) => (j === wpis ? { ...x, [pole]: w } : x)) }))}
            onUsun={() => {
              setF((s) => ({ ...s, rozstrzygniecie: s.rozstrzygniecie.filter((_, j) => j !== wpis) }));
              setAktywnyWpis(Math.max(0, wpis - 1));
            }}
          />
        ) : null}
        <div className={liczbaWpisow > 0 ? 'mt-4' : undefined}>
          <Przycisk
            wariant="tlo"
            ikona="plus"
            onClick={() => {
              setF((s) => ({ ...s, rozstrzygniecie: [...s.rozstrzygniecie, { swiadczenie: '', prawo: '', platnik: '', od: '', do: '', stawka: '', kwota: '' }] }));
              setAktywnyWpis(liczbaWpisow);
            }}
          >
            {t.rozstrzygniecie.dodaj}
          </Przycisk>
        </div>
      </Karta>
    );
  }

  const karty: Record<CzescDanychSprawy, () => ReactNode> = {
    dokumenty: kartaDokumentow,
    osoba: kartaOsoby,
    tytul: kartaTytulu,
    chorobowe: kartaChorobowego,
    zdarzenie: kartaZdarzenia,
    wniosek: kartaWniosku,
    okresy: kartaOkresowWniosku,
    dziecko: kartaDziecka,
    kwoty: kartaKwot,
    poprzedni: kartaPoprzedniegoZasilku,
    przyznane: kartaPrzyznanych,
    rozstrzygniecie: kartaRozstrzygniecia,
  };

  return (
    <Stos odstep={7.5}>
      <PostepKreatora id={ID_POSTEPU} krok={czesci.czesc} liczbaKrokow={czesci.liczba} nazwaKroku={nazwyCzesci[biezaca]} />
      {biezaca === 'dokumenty' ? wprowadzenie : null}
      {bladStrony ? <Komunikat kod={bladStrony} /> : null}

      {karty[biezaca]()}

      <PrzyciskiCzesci
        czesci={czesciZWpisem}
        onAkcjaKroku={zatwierdz}
        etykietaAkcji={t.zatwierdzenie.zatwierdz}
        onWrocKroku={() => przejdz(trasy.ViewSampleCaseList())}
        zajety={zajety}
        dodatkowe={czesci.czyOstatnia ? <p className="m-0 min-w-0">{t.zatwierdzenie.opis}</p> : undefined}
      />

      <OknoPodgladuDokumentu
        otwarte={podglad !== null}
        onZamknij={() => setPodglad(null)}
        dokument={podglad}
        konto={konto}
        onWgrajPonownie={(plik) => {
          setPodglad(null);
          void onDodajDokument(plik);
        }}
      />
    </Stos>
  );
}

interface WpisRozstrzygnieciaProps {
  indeks: number;
  liczbaWpisow: number;
  onWybierzWpis: (indeks: number) => void;
  wpis: FormularzSprawy['rozstrzygniecie'][number];
  pierwotny?: FormularzSprawy['rozstrzygniecie'][number];
  zrodlo: ZrodloWartosciSprawy;
  dokumenty: readonly DokumentSprawy[];
  pole: (id: string) => PropsyPola;
  onZmiana: (pole: PoleRozstrzygniecia, w: string) => void;
  onUsun: () => void;
}

// Jeden wpis rozstrzygnięcia naraz: przy kilku wpisach segmenty przełączają wpis, żeby część mieściła się w oknie.
function WpisRozstrzygniecia({ indeks, liczbaWpisow, onWybierzWpis, wpis, pierwotny, zrodlo, dokumenty, pole, onZmiana, onUsun }: WpisRozstrzygnieciaProps): ReactNode {
  const numer = String(indeks + 1);
  const tr = t.rozstrzygniecie;
  const idPanelu = 'wpis-rozstrzygniecia';
  const opisPola = (p: PoleRozstrzygniecia, etykiety?: Readonly<Record<string, string>>) => {
    const pierwotna = pierwotny?.[p] ?? '';
    return opisZrodla({ zrodlo }, { dokumenty, zmieniona: wpis[p] !== pierwotna, pierwotna: etykiety ? (etykiety[pierwotna] ?? pierwotna) : pierwotna, brak: t.zrodla.podajeszTy });
  };
  return (
    <div id={idPanelu} className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        {liczbaWpisow > 1 ? (
          <>
            <h3 className="sr-only">{tr.swiadczenieNr({ numer })}</h3>
            <Segmenty
              etykieta={tr.wyborWpisu}
              opcje={Array.from({ length: liczbaWpisow }, (_, i) => ({ wartosc: String(i), etykieta: tr.swiadczenieNr({ numer: String(i + 1) }) }))}
              wybrana={String(indeks)}
              onWybor={(w) => onWybierzWpis(Number(w))}
              steruje={idPanelu}
            />
          </>
        ) : (
          <h3 className="m-0 text-body-strong">{tr.swiadczenieNr({ numer })}</h3>
        )}
        <PrzyciskIkona ksztalt="okragly" ikona="usun" etykieta={tr.usun({ numer })} onClick={onUsun} />
      </div>
      <SiatkaPol kolumny={4}>
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'sw')} etykieta={tr.swiadczenie} wartosc={wpis.swiadczenie} opcje={o.swiadczenie} className="xl:col-span-2"
          onZmiana={(w) => onZmiana('swiadczenie', w)} zrodlo={opisPola('swiadczenie', o.swiadczenie)} {...pole(idRozstrzygniecia(indeks, 'sw'))} />
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'prawo')} etykieta={tr.prawo} wartosc={wpis.prawo} opcje={o.prawo} pustaOpcja
          onZmiana={(w) => onZmiana('prawo', w)} zrodlo={opisPola('prawo', o.prawo)} {...pole(idRozstrzygniecia(indeks, 'prawo'))} />
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'platnik')} etykieta={tr.platnik} wartosc={wpis.platnik} opcje={o.platnik} pustaOpcja
          onZmiana={(w) => onZmiana('platnik', w)} zrodlo={opisPola('platnik', o.platnik)} {...pole(idRozstrzygniecia(indeks, 'platnik'))} />
        <PoleWpisuSprawy id={idRozstrzygniecia(indeks, 'od')} etykieta={tr.od} data wartosc={wpis.od} onZmiana={(w) => onZmiana('od', w)}
          zrodlo={opisPola('od')} {...pole(idRozstrzygniecia(indeks, 'od'))} />
        <PoleWpisuSprawy id={idRozstrzygniecia(indeks, 'do')} etykieta={tr.do} data wartosc={wpis.do} onZmiana={(w) => onZmiana('do', w)}
          zrodlo={opisPola('do')} {...pole(idRozstrzygniecia(indeks, 'do'))} />
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'stawka')} etykieta={tr.stawka} wartosc={wpis.stawka} opcje={o.stawka} pustaOpcja
          onZmiana={(w) => onZmiana('stawka', w)} zrodlo={opisPola('stawka', o.stawka)} {...pole(idRozstrzygniecia(indeks, 'stawka'))} />
        <PoleWpisuSprawy id={idRozstrzygniecia(indeks, 'kwota')} etykieta={tr.kwota} inputMode="decimal" wartosc={wpis.kwota}
          onZmiana={(w) => onZmiana('kwota', w)} zrodlo={opisPola('kwota')} {...pole(idRozstrzygniecia(indeks, 'kwota'))} />
      </SiatkaPol>
    </div>
  );
}
