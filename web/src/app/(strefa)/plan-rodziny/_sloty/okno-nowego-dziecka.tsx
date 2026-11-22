'use client';

// Slot ViewFamilyPlan „okno-nowego-dziecka” w liście slotyNadPlanem (kontrakt, sekcja 12.4). Właściciel: u19.
// ModalNewChildDetected (tabela 2.3, 3.3.2.2.1), otwierane automatycznie, gdy daneCiazy.noweDzieckoOczekujace istnieje
// i nie jest zamknięte. Po zamknięciu slot pokazuje kartę „Dziecko już się urodziło?” z 0032 i linkiem do okna
// (wzór cz1/P10-01). Przy potwierdzonej dacie porodu różnej od daty z danych ZUS slot prowadzi do ViewBirthDate (0063).
// Teksty okna: teksty.ModalNewChildDetected; teksty karty: teksty.ViewFamilyPlan.oknoNowegoDziecka.
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { potwierdzZOkna, zamknijOkno } from '@/dane/magazyn/operacje/narodziny';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika, formatujDate } from '@/domena/daty';
import { dzieciZTaSamaData, porownajZDanymiZus } from '@/domena/rodzina/narodziny';
import type { CzlonekRodzinyZus, KodKomunikatu } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { czyPrzypomnienieONowymDziecku, czyZgloszenieNarodzinDostepne } from './akcja-zglos-narodziny';
import type { PropsSlotu } from './typy';

const tOkna = teksty.ModalNewChildDetected;
const tKarty = teksty.ViewFamilyPlan.oknoNowegoDziecka;

/** Wykrycia rozbieżności daty porodu, po których slot już przekierował do ViewBirthDate w tej karcie. */
const przekierowaneWykrycia = new Set<string>();

function opisZapisu(dzieci: CzlonekRodzinyZus[], zgoda: boolean): string {
  const data = formatujDate(dzieci[0].dataUrodzenia);
  const zapis =
    dzieci.length === 1
      ? tOkna.opisJednego({ data })
      : dzieci.length === 2
        ? tOkna.opisDwojga({ data })
        : tOkna.opisWielu({ data, liczba: String(dzieci.length) });
  return zgoda ? `${zapis} ${tOkna.opisSzczegolow}` : zapis;
}

export function SlotOknoNowegoDziecka({ kontekst }: PropsSlotu<'nadPlanem'>) {
  const router = useRouter();
  const daneCiazy = kontekst.rodzina.daneCiazy;
  const oczekujace = daneCiazy?.noweDzieckoOczekujace;
  const dzieci = dzieciZTaSamaData(oczekujace?.dzieci ?? []);
  const zgoda = kontekst.stanZgody === 'udzielona';
  const [ponownieOtwarte, setPonownieOtwarte] = useState(false);
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  // Treść okna z chwili potwierdzenia: zapis usuwa noweDzieckoOczekujace, a okno zostaje otwarte z ładowaniem
  // do pokazania następnego widoku, więc przeliczony plan pod nim nie zostaje sam na ekranie.
  const [przejscie, ustawPrzejscie] = useStanChwilowy<{ dzieci: CzlonekRodzinyZus[]; stanNa: string } | null>(null);

  const rozbieznosc =
    kontekst.rola === 'rodzic' &&
    daneCiazy?.dataPoroduPotwierdzona === true &&
    daneCiazy.dataPorodu !== undefined &&
    oczekujace !== undefined &&
    oczekujace.zamknieto === undefined &&
    porownajZDanymiZus(daneCiazy.dataPorodu, oczekujace.dzieci) === '0063';

  const wykryto = oczekujace?.wykryto;
  useEffect(() => {
    // Przekierowanie raz na wykrycie: po „Anuluj” na ViewBirthDate plan zostaje widoczny.
    if (!rozbieznosc || wykryto === undefined || przekierowaneWykrycia.has(wykryto)) return;
    przekierowaneWykrycia.add(wykryto);
    router.replace(sciezkaWidoku('ViewBirthDate', { tryb: 'pakiet' }));
  }, [rozbieznosc, wykryto, router]);

  const dostepne = czyZgloszenieNarodzinDostepne(kontekst) && oczekujace !== undefined && dzieci.length > 0;
  if (!dostepne && przejscie === null) return null;

  const otwarte = przejscie !== null || oczekujace?.zamknieto === undefined || ponownieOtwarte;
  const dzieciOkna = przejscie?.dzieci ?? dzieci;
  const stanNa =
    przejscie?.stanNa ??
    (kontekst.daneZusKonta?.odczytano ? dataZeZnacznika(kontekst.daneZusKonta.odczytano) : kontekst.dzis);

  function zamknij() {
    if (zajety) return;
    setPonownieOtwarte(false);
    setBlad(null);
    if (oczekujace?.zamknieto === undefined) {
      const wynik = zamknijOkno(pobierzKontekstOperacji());
      if (!wynik.ok) setBlad(wynik.kod);
    }
  }

  function potwierdz() {
    if (zajety) return;
    const zapamietane = { dzieci: dzieciOkna, stanNa };
    ustawZajety(true);
    const wynik = potwierdzZOkna(pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      setBlad(wynik.kod);
      return;
    }
    setBlad(null);
    ustawPrzejscie(zapamietane);
    przejdz(zgoda ? sciezkaWidoku('ViewBirthDetails', { tryb: 'pakiet' }) : sciezkaWidoku('ViewBirthPackage'));
  }

  const przewidywany = daneCiazy?.przewidywanyTerminPorodu;

  return (
    <>
      {przejscie === null && czyPrzypomnienieONowymDziecku(kontekst) ? (
        <Karta tytul={tKarty.tytulKarty}>
          <Stos odstep={6}>
            <Komunikat
              kod="0032"
              tresc={
                <p>
                  <strong>{teksty.wspolne.prefiksy.INFO}</strong> {teksty.komunikaty['0032']}{' '}
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-brand underline"
                    onClick={() => setPonownieOtwarte(true)}
                  >
                    {tKarty.zobaczDziecko}
                  </button>
                </p>
              }
            />
            <Stos odstep={3}>
              <p className="m-0 text-body">
                {przewidywany ? tKarty.opis({ data: formatujDate(przewidywany) }) : tKarty.opisBezTerminu}
              </p>
              <p className="m-0 text-body">{tKarty.opisPierwszeTygodnie}</p>
            </Stos>
            <div>
              <PrzyciskLink wariant="glowny" href={sciezkaWidoku('ViewBirthDate', { tryb: 'pakiet' })}>
                {tKarty.zglos}
              </PrzyciskLink>
            </div>
          </Stos>
        </Karta>
      ) : null}
      <OknoModalne
        otwarte={otwarte}
        onZamknij={zamknij}
        zamykanieZablokowane={zajety}
        tytul={dzieciOkna.length === 1 ? tOkna.tytul : tOkna.tytulWielu}
        opis={<Komunikat kod="0032" />}
        komunikat={blad ? <Komunikat kod={blad} /> : undefined}
        stopka={
          <>
            <Przycisk wariant="glowny" type="button" zajety={zajety} onClick={potwierdz}>
              {tOkna.potwierdz}
            </Przycisk>
            <Przycisk wariant="drugorzedny" type="button" disabled={zajety} onClick={zamknij}>
              {tOkna.zamknij}
            </Przycisk>
          </>
        }
      >
        <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(stanNa) })}</p>
        {dzieciOkna.length === 1 ? (
          <ListaDefinicji
            pozycje={[
              { etykieta: tOkna.imieINazwisko, wartosc: `${dzieciOkna[0].imie} ${dzieciOkna[0].nazwisko}` },
              { etykieta: tOkna.dataUrodzenia, wartosc: formatujDate(dzieciOkna[0].dataUrodzenia) },
            ]}
          />
        ) : (
          <ul aria-label={tOkna.listaDzieci} className="m-0 flex list-none flex-col gap-4 p-0">
            {dzieciOkna.map((d) => (
              <li key={d.pesel} className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-4">
                <div className="min-w-0">
                  <p className="m-0 text-body-strong">{tOkna.imieINazwisko}</p>
                  <p className="m-0 text-body">{`${d.imie} ${d.nazwisko}`}</p>
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-body-strong">{tOkna.dataUrodzenia}</p>
                  <p className="m-0 text-body">{formatujDate(d.dataUrodzenia)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="m-0 text-body">{opisZapisu(dzieciOkna, zgoda)}</p>
      </OknoModalne>
    </>
  );
}
