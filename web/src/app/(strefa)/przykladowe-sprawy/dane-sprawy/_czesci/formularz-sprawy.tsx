'use client';

// Karty danych przykładowej sprawy na ViewSampleCaseData (3.4.3.1.1, 3.4.3.1.3, 3.4.3.1.4, 3.4.3.1.5):
// pola pogrupowane według Danych sprawy, źródło przy każdej wartości, korekty, rozstrzygnięcie i zatwierdzenie.
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react';
import { Karta } from '@/komponenty/karta';
import { formatujMiesiac } from '@/komponenty/format';
import { Ikona } from '@/komponenty/ikona';
import { Komunikat } from '@/komponenty/komunikat';
import { BladPola, idBledu } from '@/komponenty/pole';
import { Przycisk, PrzyciskLink, klasyPrzycisku } from '@/komponenty/przycisk';
import { PrzyciskIkona } from '@/komponenty/przycisk-ikona';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos } from '@/komponenty/uklad';
import { Tabela } from '@/komponenty/tabela';
import { dataZeZnacznika, dodajMiesiaceDoMiesiaca, dodajMinuty, formatujDate, formatujDateICzas, miesiacZDaty } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import {
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
import type { BledyPol, DokumentSprawy, KodKomunikatu, Pesel, SprawaPrzykladowa, WartoscOdczytana, WartoscSprawy, ZrodloWartosciSprawy } from '@/domena/typy';
import { teksty } from '@/teksty';
import { nazwaDokumentu } from '../../_czesci/opisy';
import { OknoPodgladuDokumentu } from './okno-podgladu-dokumentu';
import { PodtytulKarty, PoleWpisuSprawy, PoleWyboruSprawy, SiatkaPol, type OpisZrodla } from './pole-sprawy';

const t = teksty.ViewSampleCaseData;
const o = t.opcje;
const ID_DODAJ = 'dodaj-plik';

function wielka(tekst: string): string {
  return tekst.length === 0 ? tekst : tekst[0].toLocaleUpperCase('pl-PL') + tekst.slice(1);
}

function nazwaZrodla(zrodlo: ZrodloWartosciSprawy, dokumenty: readonly DokumentSprawy[]): string | null {
  if (zrodlo.rodzaj !== 'dokument') return null;
  const d = dokumenty.find((x) => x.id === zrodlo.idDokumentu);
  return d ? nazwaDokumentu(d) : null;
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

export interface FormularzSprawyProps {
  sprawa: SprawaPrzykladowa;
  konto?: Pesel;
  teraz: string;
  onDodajDokument: (plik: File) => Promise<KodKomunikatu | null>;
  dodawanie: string | null;
}

export function FormularzDanychSprawy({ sprawa, konto, teraz, onDodajDokument, dodawanie }: FormularzSprawyProps) {
  const router = useRouter();
  const [poczatkowy] = useState<FormularzSprawy>(() => formularzZeSprawy(sprawa));
  const [f, setF] = useState<FormularzSprawy>(poczatkowy);
  const [bledy, setBledy] = useState<BledyPol<string>>({});
  const [bladStrony, setBladStrony] = useState<KodKomunikatu | null>(null);
  const [bladDodania, setBladDodania] = useState<KodKomunikatu | null>(null);
  const [podglad, setPodglad] = useState<DokumentSprawy | null>(null);
  const [fokusNaBledzie, setFokusNaBledzie] = useState(0);
  const [zatwierdzanie, setZatwierdzanie] = useState(false);
  const d = sprawa.dane;
  const dok = sprawa.dokumenty;
  const zespol = sprawa.zrodlo !== 'wgrane-dokumenty';

  useEffect(() => {
    if (fokusNaBledzie === 0) return;
    const pierwszy = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-blad="true"]');
    pierwszy?.focus();
  }, [fokusNaBledzie]);

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

  const blad = (id: string) => bledy[id] ?? null;

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
        blad={blad(pole)}
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
        blad={blad(pole)}
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

  function zatwierdz() {
    setBladStrony(null);
    const wynikWalidacji = walidujFormularzSprawy(f, sprawa);
    setBledy(wynikWalidacji);
    if (Object.keys(wynikWalidacji).length > 0) {
      setFokusNaBledzie((n) => n + 1);
      return;
    }
    setZatwierdzanie(true);
    if (!zapiszZmiany()) {
      setZatwierdzanie(false);
      return;
    }
    const wynik = zatwierdzDaneSprawy(pobierzKontekstOperacji());
    if (!wynik.ok) {
      setZatwierdzanie(false);
      if (wynik.bledyPol && Object.keys(wynik.bledyPol).length > 0) {
        setBledy(wynik.bledyPol);
        setFokusNaBledzie((n) => n + 1);
      } else {
        setBladStrony(wynik.kod);
      }
      return;
    }
    router.push(trasy.ViewSampleCaseVerification());
  }

  async function dodajDokument(e: ChangeEvent<HTMLInputElement>) {
    const plik = e.target.files?.[0];
    e.target.value = '';
    if (!plik) return;
    setBladDodania(null);
    const kody = Object.values(walidujFormularzSprawy(f, sprawa));
    zapiszZmiany(kody.every((k) => k === '0006' || k === '0109'));
    const kod = await onDodajDokument(plik);
    if (kod === '0103' || kod === '0104') setBladDodania(kod);
    else if (kod) setBladStrony(kod);
  }

  // --- widok --------------------------------------------------------------------------------------
  const mezczyzna = d.ubezpieczony.rola.wartosc === 'ojciec-przejmujacy';
  const jdg = f.pola.tytulRodzaj === 'dzialalnosc';
  const pokazUstanie = d.ustanieZatrudnienia.przyczyna.wartosc !== null || f.pola.tytulDo !== '' || f.pola.przyczyna !== '';
  const pokazNiezdolnosc = f.pola.zdarzenie === 'niezdolnosc' || d.zdarzenie.niezdolnosc.wartosc !== null;
  const pokazDziecko = d.dziecko.tydzienCiazy.wartosc !== null || d.dziecko.masaG.wartosc !== null || d.dziecko.pobyt.wartosc !== null
    || d.dziecko.zaZyciem.wartosc !== null || dok.some((x) => x.rodzaj === 'zaswiadczenie-szpitala' || x.rodzaj === 'zaswiadczenie-za-zyciem');
  const pokazMatke = f.pola.rola === 'ojciec-przejmujacy' || d.wniosek.okresMatki.wartosc !== null;
  const przyznane = d.swiadczeniaPrzyznane.wartosc ?? [];
  const rodzajKwot = kwoty.wartosc?.[0]?.rodzaj ?? 'wynagrodzenie';
  const zZrzutu = sprawa.rozstrzygniecie.some((r) => r.zrodlo.rodzaj === 'dokument');

  const usun = (i: number, etykieta: string, onClick: () => void) => (
    <PrzyciskIkona ksztalt="okragly" ikona="usun" etykieta={etykieta} onClick={onClick} className="self-end" />
  );

  return (
    <Stos odstep={7.5}>
      {bladStrony ? <Komunikat kod={bladStrony} /> : null}

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

      <Karta tytul={mezczyzna ? t.osoba.tytulMezczyzna : t.osoba.tytulKobieta} bezLinii>
        <PodtytulKarty>{mezczyzna ? t.osoba.daneMezczyzna : t.osoba.daneKobieta}</PodtytulKarty>
        <SiatkaPol>
          {poleWpisu('imie', t.osoba.imie, d.ubezpieczony.imie, { tylkoDoOdczytu: true, osobowe: 'imie' })}
          {poleWpisu('nazwisko', t.osoba.nazwisko, d.ubezpieczony.nazwisko, { tylkoDoOdczytu: true, osobowe: 'imie' })}
          {poleWpisu('pesel', t.osoba.pesel, d.ubezpieczony.pesel, { inputMode: 'numeric', osobowe: 'pesel' })}
          {poleWyboru('rola', t.osoba.rola, d.ubezpieczony.rola, o.rola)}
        </SiatkaPol>
        <PodtytulKarty>{t.osoba.tytul}</PodtytulKarty>
        <SiatkaPol>
          {poleWyboru('tytulRodzaj', t.osoba.tytulUbezpieczenia, d.tytul.rodzaj, o.tytul)}
          {poleWpisu('tytulOd', t.osoba.tytulOd, d.tytul.od, { data: true })}
          {poleWpisu('tytulDo', t.osoba.tytulDo, d.tytul.dataUstania, { data: true, trwa: f.pola.tytulDo === '' && f.pola.tytulOd !== '' ? 'tytul' : null })}
          {f.pola.tytulRodzaj === 'pracownik' || d.wymiarCzasuPracy.wartosc !== null ? poleWyboru('etat', t.osoba.etat, d.wymiarCzasuPracy, o.etat) : null}
          {f.pola.tytulRodzaj !== 'dzialalnosc' || d.liczbaUbezpieczonychPlatnika.wartosc !== null
            ? poleWyboru('liczbaUb', t.osoba.liczbaUb, d.liczbaUbezpieczonychPlatnika, o.liczbaUb)
            : null}
        </SiatkaPol>
        {pokazUstanie ? (
          <>
            <PodtytulKarty>{t.osoba.ustanie}</PodtytulKarty>
            <SiatkaPol>
              {poleWyboru('przyczyna', t.osoba.przyczyna, d.ustanieZatrudnienia.przyczyna, o.przyczyna)}
              {poleWyboru('inneZatrudnienie', t.osoba.inneZatrudnienie, d.ustanieZatrudnienia.inneZatrudnienie, o.takNie)}
              {poleWyboru('pracaPoUstaniu', t.osoba.pracaPoUstaniu, d.pracaPoUstaniu, o.takNie)}
            </SiatkaPol>
          </>
        ) : null}
      </Karta>

      <Karta tytul={t.chorobowe.tytul} bezLinii>
        <SiatkaPol>{poleWyboru('rodzajCh', t.chorobowe.rodzaj, d.ubezpieczenieChorobowe.rodzaj, o.chorobowe)}</SiatkaPol>
        <PodtytulKarty id={`${POLE_OKRESOW_CHOROBOWYCH}-naglowek`}>{t.chorobowe.okresy}</PodtytulKarty>
        <Stos odstep={4}>
          {f.okresyChorobowe.map((ok, i) => {
            const numer = String(i + 1);
            const pierwotny = poczatkowy.okresyChorobowe[i];
            return (
              <div key={i} className="grid grid-cols-1 items-start gap-x-6 gap-y-4 md:grid-cols-[1fr_1fr_auto]">
                <PoleWpisuSprawy
                  id={idOkresuChorobowego(i, 'od')}
                  etykieta={t.chorobowe.okresOd({ numer })}
                  data
                  wartosc={ok.od}
                  onZmiana={(w) => setF((s) => ({ ...s, okresyChorobowe: s.okresyChorobowe.map((x, j) => (j === i ? { ...x, od: w } : x)) }))}
                  zrodlo={opisElementu(okresyCh, ok.od !== (pierwotny?.od ?? ''), pierwotny?.od ?? '')}
                  blad={blad(idOkresuChorobowego(i, 'od'))}
                />
                <PoleWpisuSprawy
                  id={idOkresuChorobowego(i, 'do')}
                  etykieta={t.chorobowe.okresDo({ numer })}
                  data
                  wartosc={ok.do}
                  onZmiana={(w) => setF((s) => ({ ...s, okresyChorobowe: s.okresyChorobowe.map((x, j) => (j === i ? { ...x, do: w } : x)) }))}
                  zrodlo={opisKoncaOkresuCh(i)}
                  blad={blad(idOkresuChorobowego(i, 'do'))}
                />
                {usun(i, t.chorobowe.usunOkres({ numer }), () => setF((s) => ({ ...s, okresyChorobowe: s.okresyChorobowe.filter((_, j) => j !== i) })))}
              </div>
            );
          })}
        </Stos>
        <div className="mt-4 grid justify-items-start gap-1">
          <Przycisk
            wariant="tlo"
            ikona="plus"
            id={POLE_OKRESOW_CHOROBOWYCH}
            data-blad={blad(POLE_OKRESOW_CHOROBOWYCH) ? 'true' : undefined}
            aria-describedby={blad(POLE_OKRESOW_CHOROBOWYCH) ? idBledu(POLE_OKRESOW_CHOROBOWYCH) : undefined}
            onClick={() => setF((s) => ({ ...s, okresyChorobowe: [...s.okresyChorobowe, { od: '', do: '' }] }))}
          >
            {t.chorobowe.dodajOkres}
          </Przycisk>
          {blad(POLE_OKRESOW_CHOROBOWYCH) ? <BladPola id={idBledu(POLE_OKRESOW_CHOROBOWYCH)} kod={blad(POLE_OKRESOW_CHOROBOWYCH) ?? undefined} /> : null}
        </div>
        {jdg || d.zadluzenieJdg.wartosc !== null ? (
          <>
            <PodtytulKarty>{t.chorobowe.zadluzenie}</PodtytulKarty>
            <SiatkaPol>{poleWpisu('dlug', t.chorobowe.dlug, d.zadluzenieJdg, { inputMode: 'decimal', brak: t.chorobowe.dlugBrak })}</SiatkaPol>
          </>
        ) : null}
      </Karta>

      <Karta tytul={t.zdarzenie.tytul} bezLinii>
        <PodtytulKarty>{t.zdarzenie.zdarzenie}</PodtytulKarty>
        <SiatkaPol>
          {poleWyboru('zdarzenie', t.zdarzenie.rodzaj, d.zdarzenie.rodzaj, o.zdarzenie)}
          {f.pola.zdarzenie !== 'niezdolnosc' ? (
            <>
              {poleWpisu('porod', t.zdarzenie.porod, d.zdarzenie.dataPorodu, { data: true })}
              {poleWpisu('termin', t.zdarzenie.termin, d.zdarzenie.przewidywanyTermin, { data: true })}
              {poleWyboru('dzieci', t.zdarzenie.dzieci, d.zdarzenie.liczbaDzieci, o.dzieci)}
            </>
          ) : null}
          {f.pola.zdarzenie === 'martwe-urodzenie' || d.zdarzenie.liczbaMartwych.wartosc !== null
            ? poleWpisu('martwe', t.zdarzenie.martwe, d.zdarzenie.liczbaMartwych, { inputMode: 'numeric' })
            : null}
          {pokazNiezdolnosc ? (
            <>
              {poleWpisu('niezdolnoscOd', t.zdarzenie.niezdolnoscOd, d.zdarzenie.niezdolnosc, { data: true })}
              {poleWpisu('niezdolnoscDo', t.zdarzenie.niezdolnoscDo, d.zdarzenie.niezdolnosc, { data: true })}
              {poleWpisu('niezdolnoscKod', t.zdarzenie.niezdolnoscKod, d.zdarzenie.niezdolnosc)}
            </>
          ) : null}
        </SiatkaPol>
        {(d.zdarzenie.dalszeOkresy.wartosc ?? []).length > 0 ? (
          <>
            <PodtytulKarty>{t.zdarzenie.dalszeOkresy}</PodtytulKarty>
            <ul className="m-0 grid gap-1 pl-5">
              {(d.zdarzenie.dalszeOkresy.wartosc ?? []).map((ok) => (
                <li key={ok.od}>
                  {formatujDate(ok.od)}–{formatujDate(ok.do)}{' '}
                  <span className="text-small text-ink-muted">{opisElementu(d.zdarzenie.dalszeOkresy, false, '').tekst}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <PodtytulKarty>{t.zdarzenie.wniosek}</PodtytulKarty>
        <SiatkaPol>
          {(f.swiadczeniaWniosku.length > 0 ? f.swiadczeniaWniosku : ['']).map((s, i) => (
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
              blad={blad(idSwiadczeniaWniosku(i))}
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
        <PodtytulKarty>{t.zdarzenie.okresy}</PodtytulKarty>
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
                  zrodlo={opisElementu(okresyWn, ok.rodzajUrlopu !== (p?.rodzajUrlopu ?? ''), o.urlop[p?.rodzajUrlopu as keyof typeof o.urlop] ?? '')}
                  blad={blad(idOkresuWniosku(i, 'rodzaj'))}
                />
                <PoleWpisuSprawy id={idOkresuWniosku(i, 'od')} etykieta={t.zdarzenie.od} data wartosc={ok.od} onZmiana={zmien('od')}
                  zrodlo={opisElementu(okresyWn, ok.od !== (p?.od ?? ''), p?.od ?? '')} blad={blad(idOkresuWniosku(i, 'od'))} />
                <PoleWpisuSprawy id={idOkresuWniosku(i, 'do')} etykieta={t.zdarzenie.do} data wartosc={ok.do} onZmiana={zmien('do')}
                  zrodlo={opisElementu(okresyWn, ok.do !== (p?.do ?? ''), p?.do ?? '')} blad={blad(idOkresuWniosku(i, 'do'))} />
                {usun(i, t.zdarzenie.usunOkres({ numer }), () => setF((s) => ({ ...s, okresyWniosku: s.okresyWniosku.filter((_, j) => j !== i) })))}
              </div>
            );
          })}
        </Stos>
        <div className="mt-4">
          <Przycisk wariant="tlo" ikona="plus" onClick={() => setF((s) => ({ ...s, okresyWniosku: [...s.okresyWniosku, { rodzajUrlopu: '', od: '', do: '' }] }))}>
            {t.zdarzenie.dodajOkres}
          </Przycisk>
        </div>
      </Karta>

      {pokazDziecko ? (
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
      ) : null}

      <Karta tytul={t.kwoty.tytul} bezLinii>
        {f.kwoty.length > 0 ? (
          <>
            <p className="mt-0 mb-5">{t.kwoty.opisy[rodzajKwot]}</p>
            <SiatkaPol>
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
                    zrodlo={opisElementu(kwoty, k.kwota !== (p?.kwota ?? ''), pierwotna)}
                    blad={blad(idKwoty(i))}
                    dodatek={usun(i, t.kwoty.usunMiesiac({ miesiac: formatujMiesiac(k.miesiac) }), () => setF((s) => ({ ...s, kwoty: s.kwoty.filter((_, j) => j !== i) })))}
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
        <PodtytulKarty>{t.kwoty.poprzedni}</PodtytulKarty>
        <p className="mt-0 mb-5">{t.kwoty.poprzedniOpis}</p>
        <SiatkaPol>
          {poleWpisu('popPodstawa', t.kwoty.popPodstawa, d.poprzedniZasilek, { inputMode: 'decimal', brak: t.zrodla.podajeszTy })}
          {poleWpisu('popKoniec', t.kwoty.popKoniec, d.poprzedniZasilek, { data: true, brak: t.zrodla.podajeszTy })}
        </SiatkaPol>
      </Karta>

      {przyznane.length > 0 ? (
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
              okres: `${formatujDate(p.od)}–${formatujDate(p.do)}`,
              kwota: formatujKwote(p.kwota),
              zrodlo: opisElementu(d.swiadczeniaPrzyznane, false, '').tekst,
            }))}
          />
        </Karta>
      ) : null}

      <Karta tytul={t.rozstrzygniecie.tytul} bezLinii>
        <p className="mt-0 mb-5">
          {zZrzutu ? t.rozstrzygniecie.opisZrzutu : zespol ? t.rozstrzygniecie.opisZespolu({ id: sprawa.idSprawy ?? '' }) : t.rozstrzygniecie.opisWgranej}
        </p>
        <Stos odstep={6}>
          {f.rozstrzygniecie.map((r, i) => (
            <WpisRozstrzygniecia
              key={i}
              indeks={i}
              wpis={r}
              pierwotny={poczatkowy.rozstrzygniecie[i]}
              zrodlo={sprawa.rozstrzygniecie[i]?.zrodlo ?? { rodzaj: 'podaje-uzytkownik' }}
              dokumenty={dok}
              bledy={bledy}
              onZmiana={(pole, w) => setF((s) => ({ ...s, rozstrzygniecie: s.rozstrzygniecie.map((x, j) => (j === i ? { ...x, [pole]: w } : x)) }))}
              onUsun={() => setF((s) => ({ ...s, rozstrzygniecie: s.rozstrzygniecie.filter((_, j) => j !== i) }))}
            />
          ))}
        </Stos>
        <div className="mt-4">
          <Przycisk
            wariant="tlo"
            ikona="plus"
            onClick={() => setF((s) => ({ ...s, rozstrzygniecie: [...s.rozstrzygniecie, { swiadczenie: '', prawo: '', platnik: '', od: '', do: '', stawka: '', kwota: '' }] }))}
          >
            {t.rozstrzygniecie.dodaj}
          </Przycisk>
        </div>
      </Karta>

      <section aria-label={t.zatwierdzenie.etykieta} className="rounded-sm bg-surface-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Przycisk wariant="glowny" onClick={zatwierdz} zajety={zatwierdzanie}>
            {t.zatwierdzenie.zatwierdz}
          </Przycisk>
          <PrzyciskLink href={trasy.ViewSampleCaseList()} wariant="drugorzedny">
            {t.zatwierdzenie.wrocDoListy}
          </PrzyciskLink>
          <p className="m-0 min-w-0">{t.zatwierdzenie.opis}</p>
        </div>
      </section>

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
  wpis: FormularzSprawy['rozstrzygniecie'][number];
  pierwotny?: FormularzSprawy['rozstrzygniecie'][number];
  zrodlo: ZrodloWartosciSprawy;
  dokumenty: readonly DokumentSprawy[];
  bledy: BledyPol<string>;
  onZmiana: (pole: keyof FormularzSprawy['rozstrzygniecie'][number], w: string) => void;
  onUsun: () => void;
}

function WpisRozstrzygniecia({ indeks, wpis, pierwotny, zrodlo, dokumenty, bledy, onZmiana, onUsun }: WpisRozstrzygnieciaProps): ReactNode {
  const numer = String(indeks + 1);
  const tr = t.rozstrzygniecie;
  const opisPola = (pole: keyof typeof wpis, etykiety?: Readonly<Record<string, string>>) => {
    const p = pierwotny?.[pole] ?? '';
    return opisZrodla({ zrodlo }, { dokumenty, zmieniona: wpis[pole] !== p, pierwotna: etykiety ? (etykiety[p] ?? p) : p, brak: t.zrodla.podajeszTy });
  };
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="m-0 text-body-strong">{tr.swiadczenieNr({ numer })}</h3>
        <PrzyciskIkona ksztalt="okragly" ikona="usun" etykieta={tr.usun({ numer })} onClick={onUsun} />
      </div>
      <SiatkaPol>
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'sw')} etykieta={tr.swiadczenie} wartosc={wpis.swiadczenie} opcje={o.swiadczenie}
          onZmiana={(w) => onZmiana('swiadczenie', w)} zrodlo={opisPola('swiadczenie', o.swiadczenie)} blad={bledy[idRozstrzygniecia(indeks, 'sw')] ?? null} />
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'prawo')} etykieta={tr.prawo} wartosc={wpis.prawo} opcje={o.prawo} pustaOpcja
          onZmiana={(w) => onZmiana('prawo', w)} zrodlo={opisPola('prawo', o.prawo)} blad={bledy[idRozstrzygniecia(indeks, 'prawo')] ?? null} />
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'platnik')} etykieta={tr.platnik} wartosc={wpis.platnik} opcje={o.platnik} pustaOpcja
          onZmiana={(w) => onZmiana('platnik', w)} zrodlo={opisPola('platnik', o.platnik)} />
        <PoleWpisuSprawy id={idRozstrzygniecia(indeks, 'od')} etykieta={tr.od} data wartosc={wpis.od} onZmiana={(w) => onZmiana('od', w)}
          zrodlo={opisPola('od')} blad={bledy[idRozstrzygniecia(indeks, 'od')] ?? null} />
        <PoleWpisuSprawy id={idRozstrzygniecia(indeks, 'do')} etykieta={tr.do} data wartosc={wpis.do} onZmiana={(w) => onZmiana('do', w)}
          zrodlo={opisPola('do')} blad={bledy[idRozstrzygniecia(indeks, 'do')] ?? null} />
        <PoleWyboruSprawy id={idRozstrzygniecia(indeks, 'stawka')} etykieta={tr.stawka} wartosc={wpis.stawka} opcje={o.stawka} pustaOpcja
          onZmiana={(w) => onZmiana('stawka', w)} zrodlo={opisPola('stawka', o.stawka)} />
        <PoleWpisuSprawy id={idRozstrzygniecia(indeks, 'kwota')} etykieta={tr.kwota} inputMode="decimal" wartosc={wpis.kwota}
          onZmiana={(w) => onZmiana('kwota', w)} zrodlo={opisPola('kwota')} blad={bledy[idRozstrzygniecia(indeks, 'kwota')] ?? null} />
      </SiatkaPol>
    </div>
  );
}

