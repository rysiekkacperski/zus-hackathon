'use client';

// ViewAssistantChat (kontrakt, sekcja 3.3; wzory cz2/Asystent, P28-01 … P28-15). Właściciel: u31.
// Od 768 px panel jest niemodalnym oknem w prawej dolnej części ekranu (480 px), a bieżący ekran zostaje obok;
// poniżej 768 px panel zajmuje cały ekran jako okno modalne z nieaktywnym tłem i pułapką fokusu (R-AS-UKL).
// Panel pozostaje zamontowany po zwinięciu, więc rozmowa, szkic pola i ekran pod panelem się nie zmieniają.
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from 'react';
import { ArkuszPotwierdzeniaDzialania } from '@/app/(strefa)/_asystent/arkusz-potwierdzenia-dzialania';
import { DymekUzytkownika, PowitanieNowegoUzytkownika, WiadomoscAsystentaWidok, type KontekstWiadomosci } from '@/app/(strefa)/_asystent/wiadomosci';
import { useKatalog, useKontekstRodziny, useStanKonta, useStanSesji, useTeraz } from '@/dane/magazyn/hooki';
import {
  idZapisuAudytowego,
  odrzucDzialanie,
  ponowWiadomosc,
  wyslijWiadomosc,
  zapiszSzkicWiadomosci,
  zatwierdzDzialanie,
} from '@/dane/magazyn/operacje/asystent';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { MAKS_DLUGOSC_WIADOMOSCI, przytnijWiadomosc, walidujWiadomosc } from '@/domena/asystent/intencje';
import { zbudujKontekstAsystenta } from '@/domena/asystent/kontekst';
import type { KodKomunikatu, KontekstAsystenta } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { PrzyciskIkona } from '@/komponenty/przycisk-ikona';
import { teksty } from '@/teksty';

const T = teksty.ViewAssistantChat;
const ZAPYTANIE_WASKIEGO_EKRANU = '(max-width: 767.98px)';

function subskrybujSzerokosc(sluchacz: () => void) {
  const zapytanie = window.matchMedia(ZAPYTANIE_WASKIEGO_EKRANU);
  zapytanie.addEventListener('change', sluchacz);
  return () => zapytanie.removeEventListener('change', sluchacz);
}

/** Szerokość okna poniżej 768 px (panel na całym ekranie). */
function useWaskiEkran(): boolean {
  return useSyncExternalStore(
    subskrybujSzerokosc,
    () => window.matchMedia(ZAPYTANIE_WASKIEGO_EKRANU).matches,
    () => false,
  );
}

const SELEKTOR_FOKUSU = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface PanelAsystentaProps {
  id: string;
  otwarty: boolean;
  onZamknij: () => void;
}

export function PanelAsystenta({ id, otwarty, onZamknij }: PanelAsystentaProps) {
  const idTytulu = useId();
  const idLicznika = useId();
  const idPola = useId();
  const panel = useRef<HTMLElement>(null);
  const naglowek = useRef<HTMLHeadingElement>(null);
  const pole = useRef<HTMLTextAreaElement>(null);
  const waski = useWaskiEkran();

  const stanKonta = useStanKonta();
  const stanSesji = useStanSesji();
  const kontekstRodziny = useKontekstRodziny();
  const katalog = useKatalog();
  const teraz = useTeraz();
  const konto = stanKonta?.konto ?? null;
  const rola = konto?.rola ?? 'nowy-uzytkownik';
  const nowyUzytkownik = rola === 'nowy-uzytkownik';

  const panelSesji = stanSesji?.panelAsystenta;
  const interakcje = stanKonta?.interakcjeAsystenta;
  const idRozmowy = panelSesji?.idRozmowy;
  const rozmowa = useMemo(
    () => (idRozmowy ? interakcje?.rozmowy.find((r) => r.idRozmowy === idRozmowy) ?? null : null),
    [interakcje, idRozmowy],
  );
  const wiadomosci = rozmowa?.wiadomosci ?? [];
  const bezPytan = !wiadomosci.some((w) => w.autor === 'uzytkownik');

  const kontekst: KontekstAsystenta | null = useMemo(() => {
    if (konto === null || stanKonta === null) return null;
    if (kontekstRodziny !== null && !nowyUzytkownik) return zbudujKontekstAsystenta(kontekstRodziny, kontekstRodziny.dzis);
    return zbudujKontekstAsystenta(
      { konto, katalog, kopia: stanKonta.kopiaDanychZus, wyniki: stanKonta.wynikiKalkulacji },
      teraz.slice(0, 10),
    );
  }, [konto, stanKonta, kontekstRodziny, nowyUzytkownik, katalog, teraz]);

  // Szkic pola trwa w stanie sesji (KA-10 3.11.1.2.1); stan lokalny trzyma bieżącą wartość pola.
  const szkicSesji = panelSesji?.szkic ?? '';
  const [szkic, setSzkic] = useState({ zrodlo: szkicSesji, tekst: szkicSesji });
  if (szkic.zrodlo !== szkicSesji) setSzkic({ zrodlo: szkicSesji, tekst: szkicSesji });
  const tekst = szkic.tekst;

  const [wysylanie, setWysylanie] = useState(false);
  const [arkusz, setArkusz] = useState<{ idWiadomosci: string; blad: KodKomunikatu | null } | null>(null);

  // Fokus: tytuł panelu po otwarciu, przycisk asystenta po zwinięciu.
  const bylOtwarty = useRef(false);
  useEffect(() => {
    if (otwarty) {
      naglowek.current?.focus();
      bylOtwarty.current = true;
    } else if (bylOtwarty.current) {
      bylOtwarty.current = false;
      document.querySelector<HTMLElement>(`[aria-controls="${id}"]`)?.focus();
    }
  }, [otwarty, id]);

  // Poniżej 768 px tło jest nieaktywne, dopóki panel jest otwarty.
  useEffect(() => {
    const el = panel.current;
    if (!otwarty || !waski || !el?.parentElement) return;
    const tlo = Array.from(el.parentElement.children).filter((x): x is HTMLElement => x !== el && x instanceof HTMLElement && !x.inert);
    for (const x of tlo) x.inert = true;
    return () => {
      for (const x of tlo) x.inert = false;
    };
  }, [otwarty, waski]);

  const zmienTekst = (wartosc: string) => {
    const przyciety = przytnijWiadomosc(wartosc);
    setSzkic((s) => ({ ...s, tekst: przyciety }));
    zapiszSzkicWiadomosci(przyciety, pobierzKontekstOperacji());
  };

  const wyslij = async (tresc: string) => {
    if (!walidujWiadomosc(tresc) || wysylanie) return;
    setWysylanie(true);
    setSzkic((s) => ({ ...s, tekst: '' }));
    try {
      await wyslijWiadomosc(tresc, pobierzKontekstOperacji());
    } finally {
      setWysylanie(false);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void wyslij(tekst);
  };

  const ponow = useCallback(async (idWiadomosci: string) => {
    setWysylanie(true);
    try {
      await ponowWiadomosc(idWiadomosci, pobierzKontekstOperacji());
    } finally {
      setWysylanie(false);
    }
  }, []);

  const poPrzejsciu = useCallback(() => {
    if (waski) onZamknij();
  }, [waski, onZamknij]);

  const obsluzKlawisz = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onZamknij();
      return;
    }
    if (e.key !== 'Tab' || !waski || !panel.current) return;
    const elementy = Array.from(panel.current.querySelectorAll<HTMLElement>(SELEKTOR_FOKUSU)).filter((x) => x.getClientRects().length > 0);
    if (elementy.length === 0) return;
    const pierwszy = elementy[0];
    const ostatni = elementy[elementy.length - 1];
    if (e.shiftKey && (document.activeElement === pierwszy || document.activeElement === naglowek.current)) {
      e.preventDefault();
      ostatni.focus();
    } else if (!e.shiftKey && document.activeElement === ostatni) {
      e.preventDefault();
      pierwszy.focus();
    }
  };

  const k: KontekstWiadomosci = {
    rola,
    sprawy: kontekst?.sprawy ?? [],
    szczegoly: kontekst?.szczegoly,
    czasDecyzji: (idWiadomosci) => interakcje?.audyt.find((a) => a.id === idZapisuAudytowego(idWiadomosci))?.czas,
    poPrzejsciu,
    onSprawdz: (idWiadomosci) => setArkusz({ idWiadomosci, blad: null }),
    onPonow: (idWiadomosci) => void ponow(idWiadomosci),
    zajety: wysylanie,
  };

  const wiadomoscArkusza = arkusz ? wiadomosci.find((w) => w.id === arkusz.idWiadomosci) : undefined;
  const propozycjaArkusza = wiadomoscArkusza?.propozycja?.rodzaj === 'oznacz-sprawe' ? wiadomoscArkusza.propozycja : undefined;
  const sprawaArkusza = propozycjaArkusza ? kontekst?.sprawy.find((s) => s.idSprawy === propozycjaArkusza.idSprawy) : undefined;

  const potwierdz = () => {
    if (!arkusz) return;
    const wynik = zatwierdzDzialanie(arkusz.idWiadomosci, pobierzKontekstOperacji());
    if (wynik.ok) setArkusz(null);
    else setArkusz({ ...arkusz, blad: wynik.kod });
  };
  const odrzuc = () => {
    if (!arkusz) return;
    const wynik = odrzucDzialanie(arkusz.idWiadomosci, pobierzKontekstOperacji());
    if (wynik.ok) setArkusz(null);
    else setArkusz({ ...arkusz, blad: wynik.kod });
  };

  const pytania = nowyUzytkownik ? T.pytaniaNowyUzytkownik : T.pytaniaRodzina;
  const pozaZakresem = wiadomosci.some((w) => w.kodKomunikatu === '0070');

  return (
    <section
      ref={panel}
      id={id}
      role="dialog"
      aria-modal={waski ? 'true' : 'false'}
      aria-labelledby={idTytulu}
      hidden={!otwarty}
      onKeyDown={obsluzKlawisz}
      className="fixed inset-0 z-40 box-border flex flex-col overflow-hidden bg-surface-card md:inset-auto md:right-6 md:bottom-6 md:z-25 md:max-h-[calc(100vh-128px)] md:w-panel-asystenta md:max-w-[calc(100vw-48px)] md:rounded-sm md:border md:border-line"
    >
      <div className="flex flex-none items-center gap-3 bg-brand py-3 pr-4 pl-5 text-on-brand">
        <span aria-hidden="true" className="grid size-toggle flex-none place-items-center rounded-full bg-surface-card text-brand">
          <Ikona nazwa="asystent" />
        </span>
        <div className="min-w-0 flex-auto">
          <h2 ref={naglowek} id={idTytulu} tabIndex={-1} className="m-0 text-section-title outline-none">
            {T.naglowek}
          </h2>
          <p className="m-0 text-small">{nowyUzytkownik ? T.podtytulNowyUzytkownik : T.podtytulRodzina}</p>
        </div>
        <PrzyciskIkona ksztalt="okragly" ikona="zamknij" etykieta={teksty.rama.zamknijAsystenta} onClick={onZamknij} className="flex-none" />
      </div>

      <div className="flex min-h-0 flex-auto flex-col-reverse overflow-y-auto">
        <div role="log" aria-live="polite" aria-label={T.historia} aria-busy={wysylanie} className="flex flex-col gap-5 p-5">
          {nowyUzytkownik && !wiadomosci.some((w) => w.kodKomunikatu === '0256') ? (
            <PowitanieNowegoUzytkownika czas={teraz} k={k} />
          ) : null}
          {bezPytan && !nowyUzytkownik ? (
            <div className="flex flex-col items-center gap-4 rounded-sm bg-surface-page px-6 py-8 text-center">
              <span className="grid size-empty-icon place-items-center rounded-full bg-surface-card text-brand">
                <Ikona nazwa="asystent" className="size-8" />
              </span>
              <p className="m-0">{T.pustaRozmowa}</p>
            </div>
          ) : null}
          {wiadomosci.map((w, i) =>
            w.autor === 'uzytkownik' ? (
              <DymekUzytkownika key={w.id} wiadomosc={w} wyslano={wiadomosci[i + 1]?.kodKomunikatu === '0071'} />
            ) : (
              <WiadomoscAsystentaWidok key={w.id} wiadomosc={w} poprzednia={wiadomosci[i - 1]} k={k} />
            ),
          )}
          {bezPytan ? (
            <div>
              <p className="m-0 mb-3 text-small-strong">{T.przykladowePytania}</p>
              <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                {pytania.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onClick={() => void wyslij(p)}
                      disabled={wysylanie}
                      className="inline-flex min-h-control cursor-pointer items-center rounded-sm border-0 bg-brand-wash px-4 py-2 text-left text-body font-semibold text-brand transition-colors duration-150 hover:bg-brand-tint hover:text-brand-deep disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
              <Notatka className="mt-4">
                <p>{nowyUzytkownik ? T.notatkaNowyUzytkownik : T.notatkaRodzina}</p>
              </Notatka>
            </div>
          ) : null}
          {pozaZakresem ? (
            <Notatka>
              <p>{T.notatkaGranice}</p>
            </Notatka>
          ) : null}
          {wysylanie ? (
            <p role="status" className="m-0 flex items-center gap-2 text-small text-ink-muted">
              <Ikona nazwa="ladowanie" rozmiar={20} className="animate-spin motion-reduce:animate-none" />
              {T.wysylanie}
            </p>
          ) : null}
        </div>
      </div>

      <form aria-label={T.formularz} onSubmit={onSubmit} className="flex-none border-t border-line px-5 pt-4 pb-5">
        <label htmlFor={idPola} className="block text-body-strong text-ink">
          {T.poleWiadomosci}
        </label>
        <textarea
          ref={pole}
          id={idPola}
          name="wiadomosc"
          rows={2}
          maxLength={MAKS_DLUGOSC_WIADOMOSCI}
          aria-describedby={idLicznika}
          placeholder={T.podpowiedz}
          value={tekst}
          onChange={(e) => zmienTekst(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void wyslij(tekst);
            }
          }}
          className="mt-1 box-border block min-h-18 w-full resize-y rounded-xs border border-line-strong bg-surface-card p-3 font-sans text-body text-ink"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p id={idLicznika} className="m-0 text-small">
            {T.licznik({ liczba: String(tekst.length) })}
          </p>
          <Przycisk type="submit" wariant="glowny" ikona="wyslij" disabled={!walidujWiadomosc(tekst) || wysylanie}>
            {T.wyslij}
          </Przycisk>
        </div>
      </form>

      <ArkuszPotwierdzeniaDzialania
        otwarte={arkusz !== null && propozycjaArkusza !== undefined}
        onZamknij={odrzuc}
        status={propozycjaArkusza?.status}
        sprawa={sprawaArkusza ? { tytul: sprawaArkusza.tytul, rodzic: sprawaArkusza.rodzic, termin: sprawaArkusza.termin, status: sprawaArkusza.status } : undefined}
        onPotwierdz={potwierdz}
        onOdrzuc={odrzuc}
        blad={arkusz?.blad ?? null}
      />
    </section>
  );
}
