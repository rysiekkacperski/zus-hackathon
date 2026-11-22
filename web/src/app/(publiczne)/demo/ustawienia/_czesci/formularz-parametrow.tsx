'use client';

// Formularz parametrów systemu na ViewDemoSettings (kontrakt 5.15 i 6.6). Wartości startowe pochodzą
// z magazynu; gospodarz montuje formularz od nowa po zmianie parametrów poza formularzem. Błąd pola
// pokazuje się po opuszczeniu pola i po próbie zapisu. Właściciel: u01.
import { useState, type FormEvent } from 'react';
import { ustawParametry, ustawSymulacje } from '@/dane/magazyn/operacje/parametry';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { ParametrySystemu } from '@/domena/typy';
import { walidujLiczbeCalkowita } from '@/domena/walidacje';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { PoleLiczby, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.parametry;

type PoleLiczbowe =
  | 'progPodwyzszeniaPodstawyProcent'
  | 'progOstrzezeniaOkresuZasilkowegoDni'
  | 'tolerancjaPorownaniaKwotyGrosze'
  | 'opoznienieOdpowiedziZusDni'
  | 'opoznienieOdczytuZusMs';

const polaLiczbowe: { pole: PoleLiczbowe; etykieta: string; min: number; maks: number }[] = [
  { pole: 'progPodwyzszeniaPodstawyProcent', etykieta: tekst.progPodwyzszenia, min: 1, maks: 1000 },
  { pole: 'progOstrzezeniaOkresuZasilkowegoDni', etykieta: tekst.progOkresu, min: 1, maks: 365 },
  { pole: 'tolerancjaPorownaniaKwotyGrosze', etykieta: tekst.tolerancja, min: 0, maks: 100000 },
  { pole: 'opoznienieOdpowiedziZusDni', etykieta: tekst.opoznienieOdpowiedzi, min: 0, maks: 60 },
  { pole: 'opoznienieOdczytuZusMs', etykieta: tekst.opoznienieOdczytu, min: 0, maks: 60000 },
];

type Pole = PoleLiczbowe | 'kodSmsStaly';

function wartoscPoczatkowa(parametry: ParametrySystemu, pole: PoleLiczbowe): number {
  return pole === 'opoznienieOdczytuZusMs' ? parametry.symulacje.opoznienieOdczytuZusMs : parametry[pole];
}

function idPola(pole: Pole): string {
  return `demo-parametr-${pole}`;
}

// Kolejność pól na ekranie i cel fokusu: pierwsze pole z błędem dostaje fokus.
const idPol = Object.fromEntries(
  [...polaLiczbowe.map((p) => p.pole), 'kodSmsStaly'].map((pole) => [pole, idPola(pole as Pole)]),
) as Record<Pole, string>;

/**
 * Walidacja wpisów: liczba całkowita z zakresu pola, kod SMS pusty albo z 6 cyframi. Zwraca błędy pól
 * i liczby z poprawnych pól liczbowych.
 */
function sprawdzWartosci(wartosci: Record<Pole, string>): {
  bledy: Partial<Record<Pole, string>>;
  liczby: Partial<Record<PoleLiczbowe, number>>;
} {
  const bledy: Partial<Record<Pole, string>> = {};
  const liczby: Partial<Record<PoleLiczbowe, number>> = {};
  for (const { pole, min, maks } of polaLiczbowe) {
    const wynik = walidujLiczbeCalkowita(wartosci[pole], min, maks, '0078');
    if ('kod' in wynik) bledy[pole] = tekst.zakres({ min: String(min), maks: String(maks) });
    else liczby[pole] = wynik.liczba;
  }
  const kodSms = wartosci.kodSmsStaly.trim();
  if (kodSms !== '' && !/^\d{6}$/.test(kodSms)) bledy.kodSmsStaly = tekst.kodSmsBlad;
  return { bledy, liczby };
}

function walidujWartosci(wartosci: Record<Pole, string>): Partial<Record<Pole, string>> {
  return sprawdzWartosci(wartosci).bledy;
}

export function FormularzParametrow({ parametry }: { parametry: ParametrySystemu }) {
  const { pokaz } = useKomunikatChwilowy();
  const [wartosci, ustawWartosci] = useState<Record<Pole, string>>(() => ({
    progPodwyzszeniaPodstawyProcent: String(parametry.progPodwyzszeniaPodstawyProcent),
    progOstrzezeniaOkresuZasilkowegoDni: String(parametry.progOstrzezeniaOkresuZasilkowegoDni),
    tolerancjaPorownaniaKwotyGrosze: String(parametry.tolerancjaPorownaniaKwotyGrosze),
    opoznienieOdpowiedziZusDni: String(parametry.opoznienieOdpowiedziZusDni),
    opoznienieOdczytuZusMs: String(wartoscPoczatkowa(parametry, 'opoznienieOdczytuZusMs')),
    kodSmsStaly: parametry.symulacje.kodSmsStaly ?? '',
  }));
  const walidacja = useWalidacjaNaBiezaco({
    wartosci,
    waliduj: walidujWartosci,
    pola: idPol,
  });
  const [bladZapisu, ustawBladZapisu] = useState(false);

  const zmien = (pole: Pole) => (wartosc: string) => ustawWartosci((w) => ({ ...w, [pole]: wartosc }));

  const zapisz = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!walidacja.sprobujWyslac()) return;
    const { liczby } = sprawdzWartosci(wartosci);
    const kodSms = wartosci.kodSmsStaly.trim();

    // Po walidacji bez błędów każde pole liczbowe ma liczbę.
    const l = liczby as Record<PoleLiczbowe, number>;
    const ctx = pobierzKontekstOperacji();
    const wynikParametrow = ustawParametry(
      {
        progPodwyzszeniaPodstawyProcent: l.progPodwyzszeniaPodstawyProcent,
        progOstrzezeniaOkresuZasilkowegoDni: l.progOstrzezeniaOkresuZasilkowegoDni,
        tolerancjaPorownaniaKwotyGrosze: l.tolerancjaPorownaniaKwotyGrosze,
        opoznienieOdpowiedziZusDni: l.opoznienieOdpowiedziZusDni,
      },
      ctx,
    );
    const wynikSymulacji = ustawSymulacje(
      { opoznienieOdczytuZusMs: l.opoznienieOdczytuZusMs, kodSmsStaly: kodSms === '' ? null : kodSms },
      ctx,
    );
    if (!wynikParametrow.ok || !wynikSymulacji.ok) {
      ustawBladZapisu(true);
      return;
    }
    ustawBladZapisu(false);
    pokaz(tekst.zapisano);
  };

  return (
    <Karta tytul={tekst.tytul} bezLinii>
      {bladZapisu ? <Komunikat kod="0003" className="mb-6" /> : null}
      <form noValidate onSubmit={zapisz}>
        <div className="flex max-w-login-column flex-col gap-6">
          {polaLiczbowe.map(({ pole, etykieta }) => (
            <PoleLiczby
              key={pole}
              id={idPola(pole)}
              etykieta={etykieta}
              wartosc={wartosci[pole]}
              onZmiana={zmien(pole)}
              {...walidacja.pole(pole)}
              szerokosc="srednia"
            />
          ))}
          <PoleTekstowe
            id={idPola('kodSmsStaly')}
            etykieta={tekst.kodSms}
            podpowiedz={tekst.kodSmsOpis}
            wartosc={wartosci.kodSmsStaly}
            onZmiana={zmien('kodSmsStaly')}
            {...walidacja.pole('kodSmsStaly')}
            inputMode="numeric"
            maksDlugosc={6}
            szerokosc="waska"
            autoComplete="off"
          />
        </div>
        <Przycisk type="submit" wariant="glowny" className="mt-7.5">
          {tekst.zapisz}
        </Przycisk>
      </form>
    </Karta>
  );
}
