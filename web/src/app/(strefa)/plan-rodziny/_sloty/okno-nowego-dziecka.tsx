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

  if (!czyZgloszenieNarodzinDostepne(kontekst) || oczekujace === undefined || dzieci.length === 0) return null;

  const otwarte = oczekujace.zamknieto === undefined || ponownieOtwarte;
  const stanNa = kontekst.daneZusKonta?.odczytano ? dataZeZnacznika(kontekst.daneZusKonta.odczytano) : kontekst.dzis;

  function zamknij() {
    setPonownieOtwarte(false);
    setBlad(null);
    if (oczekujace?.zamknieto === undefined) {
      const wynik = zamknijOkno(pobierzKontekstOperacji());
      if (!wynik.ok) setBlad(wynik.kod);
    }
  }

  function potwierdz() {
    const wynik = potwierdzZOkna(pobierzKontekstOperacji());
    if (!wynik.ok) {
      setBlad(wynik.kod);
      return;
    }
    router.push(zgoda ? sciezkaWidoku('ViewBirthDetails', { tryb: 'pakiet' }) : sciezkaWidoku('ViewBirthPackage'));
  }

  const przewidywany = daneCiazy?.przewidywanyTerminPorodu;

  return (
    <>
      {czyPrzypomnienieONowymDziecku(kontekst) ? (
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
        tytul={dzieci.length === 1 ? tOkna.tytul : tOkna.tytulWielu}
        opis={<Komunikat kod="0032" />}
        komunikat={blad ? <Komunikat kod={blad} /> : undefined}
        stopka={
          <>
            <Przycisk wariant="glowny" type="button" onClick={potwierdz}>
              {tOkna.potwierdz}
            </Przycisk>
            <Przycisk wariant="drugorzedny" type="button" onClick={zamknij}>
              {tOkna.zamknij}
            </Przycisk>
          </>
        }
      >
        <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(stanNa) })}</p>
        {dzieci.length === 1 ? (
          <ListaDefinicji
            pozycje={[
              { etykieta: tOkna.imieINazwisko, wartosc: `${dzieci[0].imie} ${dzieci[0].nazwisko}` },
              { etykieta: tOkna.dataUrodzenia, wartosc: formatujDate(dzieci[0].dataUrodzenia) },
            ]}
          />
        ) : (
          <ul aria-label={tOkna.listaDzieci} className="m-0 flex list-none flex-col gap-4 p-0">
            {dzieci.map((d) => (
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
        <p className="m-0 text-body">{opisZapisu(dzieci, zgoda)}</p>
      </OknoModalne>
    </>
  );
}
