'use client';

// ViewDemoSettings (widok prototypu P): tryb demonstracyjny, data demonstracyjna, parametry systemu,
// przełączniki symulacji, scenariusze demonstracyjne i przywrócenie katalogu oraz parametrów
// początkowych (kontrakt 6.6). Ekran działa w trybie demonstracyjnym; po jego wyłączeniu strażnik
// prowadzi na stronę startową, a tryb włącza się ponownie na ViewDemoAccountPicker. Właściciel: u01.
import { useMemo, useState, type FormEvent } from 'react';
import { NaglowekDemo } from '@/app/(publiczne)/_czesci/naglowek-demo';
import { useDzis, useKontaDemo, useParametry } from '@/dane/magazyn/hooki';
import {
  listaScenariuszy,
  przywrocKatalogPoczatkowy,
  przywrocParametryPoczatkowe,
  ustawParametry,
  ustawSymulacje,
  wczytajScenariusz,
  type ZmianaSymulacji,
} from '@/dane/magazyn/operacje/parametry';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { parsujDate } from '@/domena/daty';
import type { KodKomunikatu, ParametrySystemu, WynikOperacji } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przelacznik } from '@/komponenty/przelacznik';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';
import { FormularzParametrow } from './_czesci/formularz-parametrow';

const tekst = teksty.ViewDemoSettings;

type Symulacje = ParametrySystemu['symulacje'];
type PrzelacznikSymulacji = keyof typeof tekst.symulacje.przelaczniki;
type OdczytDokumentu = Symulacje['odczytDokumentu'];

const przelaczniki = Object.keys(tekst.symulacje.przelaczniki) as PrzelacznikSymulacji[];
const opcjeOdczytu = (Object.keys(tekst.symulacje.odczytDokumentu.opcje) as OdczytDokumentu[]).map((wartosc) => ({
  wartosc,
  etykieta: tekst.symulacje.odczytDokumentu.opcje[wartosc],
}));

/** Wynik operacji ustawień: komunikat chwilowy po sukcesie albo kod błędu dla komunikatu strony. */
function useWykonanie(ustawBlad: (kod: KodKomunikatu | null) => void) {
  const { pokaz } = useKomunikatChwilowy();
  return (wynik: WynikOperacji<unknown>, komunikatSukcesu?: string) => {
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return false;
    }
    ustawBlad(null);
    if (komunikatSukcesu) pokaz(komunikatSukcesu);
    return true;
  };
}

function KartaDaty({ dataDemo, onBlad }: { dataDemo: string | null; onBlad: (kod: KodKomunikatu | null) => void }) {
  const dzis = useDzis();
  const wykonaj = useWykonanie(onBlad);
  const [wpis, ustawWpis] = useState(dataDemo ? formatujDate(dataDemo) : '');
  const [blad, ustawBladPola] = useState<KodKomunikatu | null>(null);

  const ustaw = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = parsujDate(wpis);
    if (data === null) {
      ustawBladPola('0010');
      document.getElementById('demo-data')?.focus();
      return;
    }
    ustawBladPola(null);
    wykonaj(ustawParametry({ dataDemo: data }, pobierzKontekstOperacji()), tekst.data.ustawiono({ data: formatujDate(data) }));
  };

  const wyczysc = () => {
    ustawBladPola(null);
    ustawWpis('');
    wykonaj(ustawParametry({ dataDemo: null }, pobierzKontekstOperacji()), tekst.data.wyczyszczono);
  };

  return (
    <Karta tytul={tekst.data.tytul} bezLinii>
      <p className="mt-0 mb-1 text-body-strong">{tekst.data.biezaca({ data: formatujDate(dzis) })}</p>
      <p className="mt-0 mb-6">{dataDemo ? tekst.data.zrodloDemo : tekst.data.zrodloZegar}</p>
      <form noValidate onSubmit={ustaw}>
        <PoleDaty id="demo-data" etykieta={tekst.data.pole} wartosc={wpis} onZmiana={ustawWpis} blad={blad} />
        <div className="mt-6 flex flex-wrap gap-4">
          <Przycisk type="submit" wariant="glowny">
            {tekst.data.ustaw}
          </Przycisk>
          {dataDemo ? (
            <Przycisk wariant="drugorzedny" onClick={wyczysc}>
              {tekst.data.wyczysc}
            </Przycisk>
          ) : null}
        </div>
      </form>
    </Karta>
  );
}

function KartaSymulacji({ symulacje, onBlad }: { symulacje: Symulacje; onBlad: (kod: KodKomunikatu | null) => void }) {
  const wykonaj = useWykonanie(onBlad);
  const zmien = (zmiana: ZmianaSymulacji) => {
    wykonaj(ustawSymulacje(zmiana, pobierzKontekstOperacji()), tekst.symulacje.zmieniono);
  };

  return (
    <Karta tytul={tekst.symulacje.tytul} bezLinii>
      <p className="mt-0 mb-6">{tekst.symulacje.opis}</p>
      <div className="flex flex-col gap-4">
        {przelaczniki.map((klucz) => (
          <Przelacznik
            key={klucz}
            id={`demo-symulacja-${klucz}`}
            etykieta={tekst.symulacje.przelaczniki[klucz].etykieta}
            opis={<p className="m-0 text-small">{tekst.symulacje.przelaczniki[klucz].opis}</p>}
            wlaczony={symulacje[klucz]}
            onZmiana={(wlaczony) => zmien({ [klucz]: wlaczony })}
          />
        ))}
        <PoleWyboru<OdczytDokumentu>
          id="demo-symulacja-odczyt-dokumentu"
          etykieta={tekst.symulacje.odczytDokumentu.etykieta}
          opcje={opcjeOdczytu}
          wartosc={symulacje.odczytDokumentu}
          onZmiana={(wartosc) => {
            if (wartosc !== '') zmien({ odczytDokumentu: wartosc });
          }}
          szerokosc="srednia"
          className="mt-2"
        />
      </div>
    </Karta>
  );
}

function KartaScenariuszy({ onBlad }: { onBlad: (kod: KodKomunikatu | null) => void }) {
  const wykonaj = useWykonanie(onBlad);
  const konta = useKontaDemo();
  const scenariusze = listaScenariuszy();
  const nazwyKont = useMemo(() => new Map(konta.map((k) => [k.pesel, `${k.imie} ${k.nazwisko}`])), [konta]);

  return (
    <Karta tytul={tekst.scenariusze.tytul} bezLinii>
      <p className="mt-0 mb-6">{tekst.scenariusze.opis}</p>
      {scenariusze.length === 0 ? (
        <p className="m-0">{tekst.scenariusze.brak}</p>
      ) : (
        <ul className="m-0 list-none border-t border-line-row p-0">
          {scenariusze.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-line-row py-4">
              <div className="min-w-0 flex-[1_1_360px]">
                <h3 className="m-0 text-body-strong">{s.nazwa}</h3>
                <p className="m-0">{s.opis}</p>
                <p className="mt-1 mb-0 text-small">
                  {tekst.scenariusze.konto({ imieINazwisko: nazwyKont.get(s.pesel) ?? s.pesel })}
                </p>
              </div>
              <Przycisk
                wariant="drugorzedny"
                aria-label={tekst.scenariusze.wczytajScenariusz({ nazwa: s.nazwa })}
                onClick={() =>
                  wykonaj(wczytajScenariusz(s.id, pobierzKontekstOperacji()), tekst.scenariusze.wczytano({ nazwa: s.nazwa }))
                }
              >
                {tekst.scenariusze.wczytaj}
              </Przycisk>
            </li>
          ))}
        </ul>
      )}
    </Karta>
  );
}

export function WidokUstawienDemo() {
  const parametry = useParametry();
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const wykonaj = useWykonanie(ustawBlad);
  // Formularze z wpisanymi wartościami montują się od nowa, gdy wartości zmieniły się poza nimi.
  const kluczParametrow = JSON.stringify([
    parametry.progPodwyzszeniaPodstawyProcent,
    parametry.progOstrzezeniaOkresuZasilkowegoDni,
    parametry.tolerancjaPorownaniaKwotyGrosze,
    parametry.opoznienieOdpowiedziZusDni,
    parametry.symulacje.opoznienieOdczytuZusMs,
    parametry.symulacje.kodSmsStaly,
  ]);

  return (
    <>
      <NaglowekDemo flaga={tekst.flaga} tytul={tekst.naglowek} wstep={tekst.wstep} powrot={tekst.powrot} />
      <div className="flex max-w-190 flex-col gap-7.5">
        {blad ? <Komunikat kod={blad} /> : null}

        <Karta tytul={tekst.tryb.tytul} bezLinii>
          <Przelacznik
            id="demo-tryb"
            etykieta={tekst.tryb.przelacznik}
            opis={<p className="m-0 text-small">{tekst.tryb.opis}</p>}
            wlaczony={parametry.trybDemonstracyjny}
            onZmiana={(wlaczony) => wykonaj(ustawParametry({ trybDemonstracyjny: wlaczony }, pobierzKontekstOperacji()))}
          />
        </Karta>

        <KartaDaty key={parametry.dataDemo ?? ''} dataDemo={parametry.dataDemo} onBlad={ustawBlad} />
        <FormularzParametrow key={kluczParametrow} parametry={parametry} />
        <KartaSymulacji symulacje={parametry.symulacje} onBlad={ustawBlad} />
        <KartaScenariuszy onBlad={ustawBlad} />

        <Karta tytul={tekst.stanPoczatkowy.tytul} bezLinii>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start gap-3">
              <Notatka>
                <p>{tekst.stanPoczatkowy.katalogOpis}</p>
              </Notatka>
              <Przycisk
                wariant="drugorzedny"
                onClick={() =>
                  wykonaj(przywrocKatalogPoczatkowy(pobierzKontekstOperacji()), tekst.stanPoczatkowy.katalogPrzywrocony)
                }
              >
                {tekst.stanPoczatkowy.katalog}
              </Przycisk>
            </div>
            <div className="flex flex-col items-start gap-3">
              <Notatka>
                <p>{tekst.stanPoczatkowy.parametryOpis}</p>
              </Notatka>
              <Przycisk
                wariant="drugorzedny"
                onClick={() =>
                  wykonaj(przywrocParametryPoczatkowe(pobierzKontekstOperacji()), tekst.stanPoczatkowy.parametryPrzywrocone)
                }
              >
                {tekst.stanPoczatkowy.parametry}
              </Przycisk>
            </div>
          </div>
        </Karta>
      </div>
    </>
  );
}
