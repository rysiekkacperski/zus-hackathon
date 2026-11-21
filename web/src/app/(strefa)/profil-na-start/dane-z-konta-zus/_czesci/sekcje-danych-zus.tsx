'use client';

// Część ViewProfileZusData: sekcje kopii Danych z konta ZUS (kontrakt 11.2, u03): tytuły ubezpieczenia
// z ubezpieczeniem chorobowym i podstawami składek, płatnicy składek, członkowie rodziny z oznaczeniem nowego
// dziecka, zasiłki z ostatnich 6 miesięcy, adres i kontakt, także stan pustych danych (wzory P02-04 … P02-13).
// Gospodarz: widok ViewProfileZusData (u07). Teksty: teksty.ViewProfileZusData.sekcjeDanychZus.
import { dodajMiesiaceDoMiesiaca, dataZeZnacznika, miesiacZDaty } from '@/domena/daty';
import type {
  CzlonekRodzinyZus,
  DaneZKontaZus,
  MiesiacISO,
  PodstawaSkladek,
  TytulUbezpieczenia,
  ZasilekWyplacony,
} from '@/domena/typy';
import { etykieta, formatujDate, formatujKwote } from '@/komponenty/format';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tekst = teksty.ViewProfileZusData.sekcjeDanychZus;

export interface SekcjeDanychZusProps {
  kopia: DaneZKontaZus;
}

// --- Formatowanie -------------------------------------------------------------------------------

function Mocny({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-strong">{children}</span>;
}

function okres(od: string | undefined, do_: string | undefined): string {
  if (od === undefined) return '';
  return do_ === undefined
    ? tekst.okresOd({ dataOd: formatujDate(od) })
    : tekst.okresOdDo({ dataOd: formatujDate(od), dataDo: formatujDate(do_) });
}

function opisChorobowego(tytul: TytulUbezpieczenia): string {
  const { rodzaj, od, do: koniec } = tytul.ubezpieczenieChorobowe;
  const nazwa = tekst.rodzajeChorobowego[rodzaj];
  if (rodzaj === 'brak') return nazwa;
  const zakres = okres(od, koniec);
  return zakres ? tekst.chorobowe({ rodzaj: nazwa, okres: zakres }) : nazwa;
}

function numerMiesiaca(miesiac: MiesiacISO): { rok: string; indeks: number } {
  const [rok = '', numer = '1'] = miesiac.split('-');
  return { rok, indeks: Number(numer) - 1 };
}

function miesiacDopelniacz(miesiac: MiesiacISO): string {
  const { rok, indeks } = numerMiesiaca(miesiac);
  return `${tekst.miesiaceDopelniacz[indeks] ?? miesiac} ${rok}`;
}

function miesiacMiejscownik(miesiac: MiesiacISO, zRokiem = true): string {
  const { rok, indeks } = numerMiesiaca(miesiac);
  const nazwa = tekst.miesiaceMiejscownik[indeks] ?? miesiac;
  return zRokiem ? `${nazwa} ${rok}` : nazwa;
}

interface CiagPodstaw {
  kwota: number;
  od: MiesiacISO;
  do: MiesiacISO;
  liczba: number;
}

/** Kolejne miesiące z tą samą kwotą podstawy łączy w jeden ciąg. */
function ciagiPodstaw(podstawy: PodstawaSkladek[]): CiagPodstaw[] {
  const posortowane = [...podstawy].sort((a, b) => (a.miesiac < b.miesiac ? -1 : a.miesiac > b.miesiac ? 1 : 0));
  const ciagi: CiagPodstaw[] = [];
  for (const p of posortowane) {
    const ostatni = ciagi.at(-1);
    if (ostatni && ostatni.kwota === p.kwota && dodajMiesiaceDoMiesiaca(ostatni.do, 1) === p.miesiac) {
      ostatni.do = p.miesiac;
      ostatni.liczba += 1;
    } else {
      ciagi.push({ kwota: p.kwota, od: p.miesiac, do: p.miesiac, liczba: 1 });
    }
  }
  return ciagi;
}

/** Opis podstaw składek tytułu, na przykład „6 000,00 zł w każdym miesiącu” albo „5 652,00 zł w październiku i listopadzie 2026”. */
function opisPodstaw(podstawy: PodstawaSkladek[], miesiacOdczytu: MiesiacISO): string {
  const ciagi = ciagiPodstaw(podstawy);
  if (ciagi.length === 0) return tekst.brakWartosci;
  const pelneOkno = dodajMiesiaceDoMiesiaca(miesiacOdczytu, -11);
  return ciagi
    .map((c) => {
      const kwota = formatujKwote(c.kwota);
      if (c.liczba === 12 && c.od === pelneOkno && c.do === miesiacOdczytu) return tekst.podstawy.wKazdymMiesiacu({ kwota });
      if (c.liczba >= 3) {
        return tekst.podstawy.wKazdymMiesiacuOdDo({
          kwota,
          miesiacOd: miesiacDopelniacz(c.od),
          miesiacDo: miesiacDopelniacz(c.do),
        });
      }
      if (c.liczba === 2) {
        const tenSamRok = c.od.slice(0, 4) === c.do.slice(0, 4);
        return tekst.podstawy.wDwochMiesiacach({
          kwota,
          miesiacPierwszy: miesiacMiejscownik(c.od, !tenSamRok),
          miesiacDrugi: miesiacMiejscownik(c.do),
        });
      }
      return tekst.podstawy.wMiesiacu({ kwota, miesiac: miesiacMiejscownik(c.od) });
    })
    .join(', ');
}

function nazwaTytulu(tytul: TytulUbezpieczenia): string {
  const nazwa = tekst.rodzajeTytulu[tytul.rodzaj];
  return tytul.do === undefined ? nazwa : tekst.tytulDo({ tytul: nazwa, dataDo: formatujDate(tytul.do) });
}

function polaczImiona(imiona: string[], spojnik: string): string {
  if (imiona.length <= 1) return imiona.join('');
  return `${imiona.slice(0, -1).join(', ')}${spojnik}${imiona.at(-1)}`;
}

// --- Sekcje -------------------------------------------------------------------------------------

interface WierszTytulu {
  id: string;
  tytul: string;
  okres: React.ReactNode;
  chorobowe: string;
  podstawa: React.ReactNode;
}

function SekcjaTytulow({ kopia }: { kopia: DaneZKontaZus }) {
  if (kopia.tytuly.length === 0) {
    return (
      <Karta tytul={tekst.tytuly.tytul} bezLinii>
        <StanPusty ikona="plik-brak" przerywany>
          <p>{tekst.tytuly.brakDanych}</p>
        </StanPusty>
        <Notatka className="mt-4">
          <p>{tekst.tytuly.brakDanychNotatka}</p>
        </Notatka>
      </Karta>
    );
  }

  const miesiacOdczytu = miesiacZDaty(dataZeZnacznika(kopia.odczytano));
  const wiersze: WierszTytulu[] = kopia.tytuly.map((tytul) => ({
    id: tytul.id,
    tytul: tekst.rodzajeTytulu[tytul.rodzaj],
    okres: <Mocny>{okres(tytul.od, tytul.do)}</Mocny>,
    chorobowe: opisChorobowego(tytul),
    podstawa: <Mocny>{opisPodstaw(tytul.podstawySkladek, miesiacOdczytu)}</Mocny>,
  }));
  if (kopia.brakTytuluOd !== undefined) {
    wiersze.push({
      id: 'brak-tytulu',
      tytul: tekst.tytuly.brakTytulu,
      okres: <Mocny>{tekst.okresOd({ dataOd: formatujDate(kopia.brakTytuluOd) })}</Mocny>,
      chorobowe: tekst.brakWartosci,
      podstawa: tekst.brakWartosci,
    });
  }

  const zakonczony =
    kopia.brakTytuluOd === undefined
      ? undefined
      : kopia.tytuly
          .filter((t) => t.do !== undefined && t.do < (kopia.brakTytuluOd as string))
          .sort((a, b) => ((a.do as string) < (b.do as string) ? -1 : 1))
          .at(-1);

  return (
    <Karta tytul={tekst.tytuly.tytul} bezLinii>
      <p className="m-0 mb-4">{tekst.tytuly.wstep}</p>
      <Tabela
        podpis={tekst.tytuly.podpis}
        etykietaPrzewijania={tekst.tytuly.przewijanie}
        kolumny={[
          { klucz: 'tytul', naglowek: tekst.tytuly.kolumny.tytul },
          { klucz: 'okres', naglowek: tekst.tytuly.kolumny.okres },
          { klucz: 'chorobowe', naglowek: tekst.tytuly.kolumny.chorobowe },
          { klucz: 'podstawa', naglowek: tekst.tytuly.kolumny.podstawa },
        ]}
        wiersze={wiersze}
      />
      {zakonczony?.do !== undefined && kopia.brakTytuluOd !== undefined ? (
        <Notatka className="mt-4">
          <p>
            {tekst.tytuly.koniecTytulu({
              tytul: tekst.rodzajeTytuluDopelniacz[zakonczony.rodzaj],
              dataKonca: formatujDate(zakonczony.do),
              dataBraku: formatujDate(kopia.brakTytuluOd),
            })}
          </p>
        </Notatka>
      ) : null}
    </Karta>
  );
}

function SekcjaPlatnikow({ tytuly }: { tytuly: TytulUbezpieczenia[] }) {
  if (tytuly.length === 0) return null;
  const bezInformacji = tytuly
    .filter((t) => t.platnik.wyplacaZasilki === 'brak-informacji')
    .map((t) => t.platnik.nazwa);
  const zInformacja = tytuly.some((t) => t.platnik.wyplacaZasilki === 'tak' || t.platnik.wyplacaZasilki === 'nie');

  let notatka: string;
  if (bezInformacji.length > 0) {
    const platnicy = polaczImiona([...new Set(bezInformacji)], tekst.platnicy.spojnikPlatnikow);
    notatka = `${tekst.platnicy.zasada} ${tekst.platnicy.brakInformacji({ platnicy })}`;
  } else if (zInformacja) {
    notatka = tekst.platnicy.zasada;
  } else {
    notatka = tekst.platnicy.dzialalnosc;
  }

  return (
    <Karta tytul={tekst.platnicy.tytul} bezLinii>
      <Tabela
        podpis={tekst.platnicy.podpis}
        etykietaPrzewijania={tekst.platnicy.przewijanie}
        kolumny={[
          { klucz: 'tytul', naglowek: tekst.platnicy.kolumny.tytul },
          { klucz: 'platnik', naglowek: tekst.platnicy.kolumny.platnik },
          { klucz: 'nip', naglowek: tekst.platnicy.kolumny.nip },
          { klucz: 'regon', naglowek: tekst.platnicy.kolumny.regon },
          { klucz: 'wyplaca', naglowek: tekst.platnicy.kolumny.wyplaca },
        ]}
        wiersze={tytuly.map((tytul) => ({
          id: tytul.id,
          tytul: nazwaTytulu(tytul),
          platnik: tytul.platnik.nazwa,
          nip: <Mocny>{tytul.platnik.nip}</Mocny>,
          regon: <Mocny>{tytul.platnik.regon}</Mocny>,
          wyplaca: tekst.platnicy.wyplaca[tytul.platnik.wyplacaZasilki],
        }))}
      />
      <Notatka className="mt-4">
        <p>{notatka}</p>
      </Notatka>
    </Karta>
  );
}

function OpisNowychDzieci({ nowe, poprzedniOdczyt }: { nowe: CzlonekRodzinyZus[]; poprzedniOdczyt?: string }) {
  if (nowe.length === 0) return null;
  const imieINazwisko = polaczImiona(
    nowe.map((c) => `${c.imie} ${c.nazwisko}`),
    tekst.czlonkowie.spojnikImion,
  );
  const wiele = nowe.length > 1;
  const opis =
    poprzedniOdczyt === undefined
      ? wiele
        ? tekst.czlonkowie.noweDzieciPierwszyOdczyt({ imieINazwisko })
        : tekst.czlonkowie.noweDzieckoPierwszyOdczyt({ imieINazwisko })
      : wiele
        ? tekst.czlonkowie.noweDzieciPoOdczycie({ imieINazwisko, dataOdczytu: formatujDate(poprzedniOdczyt) })
        : tekst.czlonkowie.noweDzieckoPoOdczycie({ imieINazwisko, dataOdczytu: formatujDate(poprzedniOdczyt) });
  return <p className="m-0 mt-4">{opis}</p>;
}

function SekcjaCzlonkow({ kopia, klasy }: { kopia: DaneZKontaZus; klasy?: string }) {
  const czlonkowie = kopia.czlonkowieRodziny;
  if (czlonkowie.length === 0) {
    return (
      <Karta tytul={tekst.czlonkowie.tytul} bezLinii className={klasy}>
        <StanPusty ikona="rodzina" przerywany>
          <p>{tekst.czlonkowie.brak}</p>
        </StanPusty>
      </Karta>
    );
  }
  return (
    <Karta tytul={tekst.czlonkowie.tytulZLiczba({ liczba: String(czlonkowie.length) })} bezLinii className={klasy}>
      <Tabela
        podpis={tekst.czlonkowie.podpis}
        etykietaPrzewijania={tekst.czlonkowie.przewijanie}
        kolumny={[
          { klucz: 'imieINazwisko', naglowek: tekst.czlonkowie.kolumny.imieINazwisko },
          { klucz: 'pesel', naglowek: tekst.czlonkowie.kolumny.pesel },
          { klucz: 'dataUrodzenia', naglowek: tekst.czlonkowie.kolumny.dataUrodzenia },
          { klucz: 'oznaczenie', naglowek: tekst.czlonkowie.kolumny.oznaczenie },
        ]}
        wiersze={czlonkowie.map((c) => ({
          id: c.pesel,
          imieINazwisko: `${c.imie} ${c.nazwisko}`,
          pesel: <Mocny>{c.pesel}</Mocny>,
          dataUrodzenia: <span className="whitespace-nowrap text-ink-strong">{formatujDate(c.dataUrodzenia)}</span>,
          oznaczenie: c.noweDziecko ? (
            <span className="inline-flex items-center gap-2 text-body-strong">
              <Ikona nazwa="dziecko" rozmiar={20} className="text-brand" />
              {tekst.czlonkowie.noweDziecko}
            </span>
          ) : (
            tekst.brakWartosci
          ),
        }))}
      />
      <OpisNowychDzieci nowe={czlonkowie.filter((c) => c.noweDziecko)} poprzedniOdczyt={kopia.poprzedniOdczyt} />
    </Karta>
  );
}

function nazwaZasilku(z: ZasilekWyplacony): string {
  return tekst.zasilki.rodzaje[z.rodzaj] ?? z.rodzaj;
}

function SekcjaZasilkow({ zasilki, klasy }: { zasilki: ZasilekWyplacony[]; klasy?: string }) {
  if (zasilki.length === 0) {
    return (
      <Karta tytul={tekst.zasilki.tytul} bezLinii className={klasy}>
        <StanPusty ikona="plik-brak" przerywany>
          <p>{tekst.zasilki.brak}</p>
        </StanPusty>
      </Karta>
    );
  }
  return (
    <Karta tytul={tekst.zasilki.tytul} bezLinii className={klasy}>
      <Tabela
        podpis={tekst.zasilki.podpis}
        etykietaPrzewijania={tekst.zasilki.przewijanie}
        kolumny={[
          { klucz: 'rodzaj', naglowek: tekst.zasilki.kolumny.rodzaj },
          { klucz: 'data', naglowek: tekst.zasilki.kolumny.data },
          { klucz: 'kwota', naglowek: tekst.zasilki.kolumny.kwota, liczbowa: true },
          { klucz: 'sposob', naglowek: tekst.zasilki.kolumny.sposob },
          { klucz: 'wyplacil', naglowek: tekst.zasilki.kolumny.wyplacil },
        ]}
        wiersze={zasilki.map((z, i) => ({
          id: `${z.dataWyplaty}-${i}`,
          rodzaj: nazwaZasilku(z),
          data: <span className="whitespace-nowrap text-ink-strong">{formatujDate(z.dataWyplaty)}</span>,
          kwota: <Mocny>{formatujKwote(z.kwota)}</Mocny>,
          sposob: etykieta(tekst.zasilki.sposoby, z.sposobWyplaty),
          wyplacil: tekst.zasilki.wyplacil,
        }))}
      />
      <Notatka className="mt-4">
        <p>{tekst.zasilki.notatka}</p>
      </Notatka>
    </Karta>
  );
}

function SekcjaKontaktu({ kopia }: { kopia: DaneZKontaZus }) {
  const pozycje = [
    { etykieta: tekst.kontakt.adres, wartosc: kopia.adres },
    { etykieta: tekst.kontakt.email, wartosc: kopia.emailEzus },
  ];
  return (
    <Karta tytul={tekst.kontakt.tytul} bezLinii>
      <dl className="m-0 flex flex-wrap gap-x-7.5 gap-y-4">
        {pozycje.map((p) => (
          <div key={p.etykieta} className="min-w-0 grow basis-75">
            <dt className="text-body-strong">{p.etykieta}</dt>
            <dd className="m-0 break-words">{p.wartosc?.trim() ? p.wartosc : tekst.brakWartosci}</dd>
          </div>
        ))}
      </dl>
    </Karta>
  );
}

export function SekcjeDanychZus({ kopia }: SekcjeDanychZusProps) {
  const obiePuste = kopia.czlonkowieRodziny.length === 0 && kopia.zasilki.length === 0;
  const klasyPolowy = 'min-w-0 grow basis-105';

  return (
    <Stos odstep={7.5} className="max-w-tresc">
      <SekcjaTytulow kopia={kopia} />
      <SekcjaPlatnikow tytuly={kopia.tytuly} />
      {obiePuste ? (
        <div className="flex flex-wrap items-stretch gap-7.5">
          <SekcjaCzlonkow kopia={kopia} klasy={klasyPolowy} />
          <SekcjaZasilkow zasilki={kopia.zasilki} klasy={klasyPolowy} />
        </div>
      ) : (
        <>
          <SekcjaCzlonkow kopia={kopia} />
          <SekcjaZasilkow zasilki={kopia.zasilki} />
        </>
      )}
      <SekcjaKontaktu kopia={kopia} />
      <Notatka>
        <p>{tekst.tylkoOdczyt}</p>
      </Notatka>
    </Stos>
  );
}
