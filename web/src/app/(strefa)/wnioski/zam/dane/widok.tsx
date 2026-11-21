'use client';

// ViewZamData (3.9.1.1.3): dane wnioskodawcy z konta ZUS, dane dziecka z profilu rodziny i rachunek do wypłaty.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDzis } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import { formatujRachunek } from '@/domena/walidacje';
import type { DaneOsobyWniosku, KodKomunikatu } from '@/domena/typy';
import { MAKS_DLUGOSC_MIEJSCOWOSCI, rachunekDoZapisu, walidujDaneZam, type PoleDanychZam } from '@/domena/wnioski/zam';
import { ekranPoZam, ekranPrzedZam } from '@/domena/wnioski/zam-nawigacja';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';
import {
  adresEkranuZam,
  BrakWnioskuZam,
  DaneBoczne,
  KartaTwojWniosek,
  KomunikatBleduZapisu,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  useWniosekZam,
  usePrzejscieDalej,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../_czesci/kreator';

const t = teksty.ViewZamData;
const tk = teksty.ViewZamLeaveType.kreator;

interface PolaDziecka {
  imie: string;
  nazwisko: string;
  pesel: string;
  miejsce: string;
}

const POLA_DZIECKA: { pole: keyof PolaDziecka; domena: PoleDanychZam }[] = [
  { pole: 'imie', domena: 'imieDziecka' },
  { pole: 'nazwisko', domena: 'nazwiskoDziecka' },
  { pole: 'pesel', domena: 'peselDziecka' },
  { pole: 'miejsce', domena: 'miejsceUrodzenia' },
];

function idPola(pole: keyof PolaDziecka, i: number) {
  return `zam-dziecko-${i}-${pole}`;
}

function FormularzDanych({ dane }: { dane: DaneWnioskuZam }) {
  const router = useRouter();
  const dzis = useDzis();
  const { wniosek, kontekst, okresy } = dane;
  const przejdzDalej = usePrzejscieDalej();
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const zDanymiDziecka = !okresy.przedPorodem && okresy.dataPorodu !== null;
  const profilDzieci = kontekst.rodzina.daneCiazy?.dzieci ?? [];
  const liczbaDzieci = zDanymiDziecka ? Math.max(1, okresy.liczbaDzieci) : 0;
  const brakPeselWProfilu = zDanymiDziecka && Array.from({ length: liczbaDzieci }, (_, i) => profilDzieci[i]?.pesel).some((p) => !p);

  const [dzieci, ustawDzieci] = useState<PolaDziecka[]>(() =>
    Array.from({ length: liczbaDzieci }, (_, i) => {
      const zWniosku = wniosek.daneDzieci[i];
      const zProfilu = profilDzieci[i];
      return {
        imie: zWniosku?.imie ?? zProfilu?.imie ?? '',
        nazwisko: zWniosku?.nazwisko ?? zProfilu?.nazwisko ?? '',
        pesel: zWniosku?.pesel ?? zProfilu?.pesel ?? '',
        miejsce: zWniosku?.miejsceUrodzenia ?? zProfilu?.miejsceUrodzenia ?? '',
      };
    }),
  );
  const [rachunek, ustawRachunek] = useState(wniosek.numerRachunku ? formatujRachunek(wniosek.numerRachunku) : '');
  const [bledy, ustawBledy] = useState<Record<string, KodKomunikatu | undefined>>({});
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);

  const zmienDziecko = (i: number, pole: keyof PolaDziecka, wartosc: string) => {
    ustawDzieci((poprzednie) => poprzednie.map((d, j) => (j === i ? { ...d, [pole]: wartosc } : d)));
    ustawBledy((poprzednie) => ({ ...poprzednie, [idPola(pole, i)]: undefined }));
  };

  const daneDzieci = (): DaneOsobyWniosku[] =>
    dzieci.map((d) => ({
      imie: d.imie.trim(),
      nazwisko: d.nazwisko.trim(),
      pesel: d.pesel.trim() || undefined,
      dataUrodzenia: okresy.dataPorodu ?? undefined,
      miejsceUrodzenia: d.miejsce.trim() || undefined,
    }));

  const dalej = () => {
    const nowe: Record<string, KodKomunikatu | undefined> = {};
    const kolejnosc: string[] = [];
    dzieci.forEach((d, i) => {
      const b = walidujDaneZam({
        zDanymiDziecka: true,
        imieDziecka: d.imie,
        nazwiskoDziecka: d.nazwisko,
        peselDziecka: d.pesel,
        miejsceUrodzenia: d.miejsce,
        numerRachunku: rachunek,
        dataPorodu: okresy.dataPorodu ?? undefined,
      });
      for (const { pole, domena } of POLA_DZIECKA) {
        kolejnosc.push(idPola(pole, i));
        if (b[domena]) nowe[idPola(pole, i)] = b[domena];
      }
    });
    const bRachunku = walidujDaneZam({
      zDanymiDziecka: false,
      imieDziecka: '',
      nazwiskoDziecka: '',
      peselDziecka: '',
      miejsceUrodzenia: '',
      numerRachunku: rachunek,
    });
    kolejnosc.push('zam-rachunek');
    if (bRachunku.numerRachunku) nowe['zam-rachunek'] = bRachunku.numerRachunku;
    ustawBledy(nowe);
    const pierwsze = kolejnosc.find((id) => nowe[id]);
    if (pierwsze) {
      document.getElementById(pierwsze)?.focus();
      return;
    }
    ustawBladZapisu(
      przejdzDalej(
        wniosek,
        { daneDzieci: daneDzieci(), numerRachunku: rachunekDoZapisu(rachunek) },
        ekranPoZam(wniosek, 'ViewZamData', okresy.przedPorodem),
      ),
    );
  };

  const zapisz = () => {
    const czystyRachunek = rachunekDoZapisu(rachunek);
    ustawBladZapisu(
      zapiszDoDokonczenia(
        wniosek,
        { daneDzieci: zDanymiDziecka ? daneDzieci() : wniosek.daneDzieci, numerRachunku: czystyRachunek || undefined },
        'ViewZamData',
      ),
    );
  };

  const wstecz = () => router.push(adresEkranuZam(ekranPrzedZam(wniosek, 'ViewZamData') ?? 'ViewZamPeriod', wniosek.idWniosku));

  const rodzic = wniosek.daneRodzica;
  const boczna = (
    <>
      <KartaTwojWniosek dane={dane} pokazOkres zmien={{ ekran: 'ViewZamPeriod', etykieta: tk.twojWniosek.zmienOkres }} />
      {brakPeselWProfilu ? (
        <Karta tytul={t.brakPesel.tytul} bezLinii>
          <p className="m-0">{t.brakPesel.tresc}</p>
        </Karta>
      ) : null}
    </>
  );

  return (
    <RamaKreatoraZam ekran="ViewZamData" wniosek={wniosek} komunikaty={<KomunikatBleduZapisu kod={bladZapisu} />} boczna={boczna}>
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          dalej();
        }}
      >
        <Karta tytul={t.wnioskodawca.tytul} bezLinii>
          <p className="m-0">{t.wnioskodawca.wstep}</p>
          <p className="m-0 mt-2 mb-6 text-small text-ink-muted">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
          <dl className="m-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-body-strong">{t.wnioskodawca.imieINazwisko}</dt>
              <dd className="m-0">{rodzic ? `${rodzic.imie} ${rodzic.nazwisko}` : `${kontekst.konto.imie} ${kontekst.konto.nazwisko}`}</dd>
            </div>
            <div>
              <dt className="text-body-strong">{t.wnioskodawca.pesel}</dt>
              <dd className="m-0">{rodzic?.pesel ?? kontekst.konto.pesel}</dd>
            </div>
          </dl>
        </Karta>

        {zDanymiDziecka ? (
          dzieci.map((d, i) => (
            <Karta key={i} tytul={liczbaDzieci > 1 ? t.dziecko.tytulNumer({ numer: i + 1 }) : t.dziecko.tytul} bezLinii>
              <div className="flex flex-col gap-6">
                {i === 0 ? <p className="m-0">{t.dziecko.wstep}</p> : null}
                {i === 0 && brakPeselWProfilu ? (
                  <Komunikat
                    kod="0062"
                    akcje={
                      <Przycisk type="button" wariant="tlo" ikona="zapisz" onClick={zapisz}>
                        {tk.przyciski.zapiszDoDokonczenia}
                      </Przycisk>
                    }
                  />
                ) : null}
                <PoleTekstowe
                  id={idPola('imie', i)}
                  etykieta={t.dziecko.imie}
                  wartosc={d.imie}
                  onZmiana={(w) => zmienDziecko(i, 'imie', w)}
                  blad={bledy[idPola('imie', i)]}
                  maksDlugosc={40}
                  autoComplete="off"
                  szerokosc="srednia"
                />
                <PoleTekstowe
                  id={idPola('nazwisko', i)}
                  etykieta={t.dziecko.nazwisko}
                  wartosc={d.nazwisko}
                  onZmiana={(w) => zmienDziecko(i, 'nazwisko', w)}
                  blad={bledy[idPola('nazwisko', i)]}
                  maksDlugosc={60}
                  autoComplete="off"
                  szerokosc="srednia"
                />
                <PoleTekstowe
                  id={idPola('pesel', i)}
                  etykieta={t.dziecko.pesel}
                  wartosc={d.pesel}
                  onZmiana={(w) => zmienDziecko(i, 'pesel', w)}
                  blad={bledy[idPola('pesel', i)]}
                  inputMode="numeric"
                  maksDlugosc={11}
                  autoComplete="off"
                  szerokosc="srednia"
                />
                <DaneBoczne
                  pozycje={[
                    {
                      etykieta: t.dziecko.dataUrodzenia,
                      wartosc: okresy.dataPorodu ? t.dziecko.dataUrodzeniaWartosc({ data: formatujDate(okresy.dataPorodu) }) : '',
                    },
                  ]}
                />
                <PoleTekstowe
                  id={idPola('miejsce', i)}
                  etykieta={t.dziecko.miejsceUrodzenia}
                  wartosc={d.miejsce}
                  onZmiana={(w) => zmienDziecko(i, 'miejsce', w)}
                  blad={bledy[idPola('miejsce', i)]}
                  maksDlugosc={MAKS_DLUGOSC_MIEJSCOWOSCI}
                  autoComplete="off"
                  szerokosc="srednia"
                />
              </div>
            </Karta>
          ))
        ) : (
          <Karta tytul={t.dziecko.tytul} bezLinii>
            <p className="m-0">{t.dziecko.przedPorodem}</p>
          </Karta>
        )}

        <Karta tytul={t.rachunek.tytul} bezLinii>
          <PoleTekstowe
            id="zam-rachunek"
            etykieta={t.rachunek.numer}
            podpowiedz={t.rachunek.podpowiedz}
            wartosc={rachunek}
            onZmiana={(w) => {
              ustawRachunek(w);
              ustawBledy((poprzednie) => ({ ...poprzednie, 'zam-rachunek': undefined }));
            }}
            blad={bledy['zam-rachunek']}
            inputMode="numeric"
            maksDlugosc={40}
            autoComplete="off"
          />
        </Karta>
        <PrzyciskiKreatora onWstecz={wstecz} onZapisz={zapisz} onDalej={() => undefined} />
      </form>
    </RamaKreatoraZam>
  );
}

export function WidokDanychZam() {
  const { dane } = useWniosekZam();
  if (dane === null) return <BrakWnioskuZam ekran="ViewZamData" />;
  return <FormularzDanych key={dane.wniosek.idWniosku} dane={dane} />;
}
