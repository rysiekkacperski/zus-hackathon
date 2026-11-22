'use client';

// Stan rozliczeń składek zalogowanego konta na dni powstania prawa (ANALIZY/17 R1–R6), wspólny dla
// ViewContributionBalance, ViewContributionCertificate, bloku na ViewFamilyPlan i sekcji ViewCaseDetails.
// Właściciel: u14.
import { useMemo } from 'react';
import { useDzis, useKatalog, useParametry } from '@/dane/magazyn/hooki';
import { dataZeZnacznika } from '@/domena/daty';
import type { DataISO, Grosze, StanRozliczenSkladek, TytulUbezpieczenia } from '@/domena/typy';
import {
  dniPowstaniaPrawaZPodstawa,
  komunikatyStanu,
  okresSplatyZKatalogu,
  progZadluzenia,
  stanZKopii,
  tytulDzialalnosci,
  wyczekiwanieDobrowolneZKatalogu,
  type DzienPowstaniaPrawa,
  type KomunikatStanu,
} from '@/domena/zasilki/stan-rozliczen';
import { useWyliczeniaEzlaKonta, type WyliczeniaKonta } from '../../zaswiadczenia-e-zla/_czesci/wyliczenia';

export interface KartaStanu {
  klucz: string;
  dzienPrawa: DzienPowstaniaPrawa | null; // null: karta „Stan rozliczeń na dziś”
  stan: StanRozliczenSkladek;
  prog: Grosze;
  komunikaty: KomunikatStanu[];
}

export interface StanRozliczenKonta {
  dane: WyliczeniaKonta;
  dzialalnosc: TytulUbezpieczenia | null;
  niedostepny: boolean;
  dzienOdczytu: DataISO | null;
  stanNaDzienOdczytu: StanRozliczenSkladek | null;
  karty: KartaStanu[];
  prog: Grosze;
  minimalne: Grosze;
  maChorobowe: boolean;
}

export function useStanRozliczenKonta(): StanRozliczenKonta | null {
  const dane = useWyliczeniaEzlaKonta();
  const katalog = useKatalog();
  const parametry = useParametry();
  const dzis = useDzis();

  return useMemo(() => {
    if (!dane) return null;
    const { kopia, rodzina, profil } = dane;
    const dzialalnosc = tytulDzialalnosci(kopia);
    const { prog, minimalne } = progZadluzenia(katalog, dzis);
    const maChorobowe = profil.chorobowe !== false && dzialalnosc?.ubezpieczenieChorobowe.rodzaj !== 'brak';
    const symulacja = parametry.trybDemonstracyjny && parametry.symulacje.stanRozliczenNiedostepny;
    const wynik: StanRozliczenKonta = {
      dane,
      dzialalnosc,
      niedostepny: false,
      dzienOdczytu: kopia ? dataZeZnacznika(kopia.odczytano) : null,
      stanNaDzienOdczytu: null,
      karty: [],
      prog,
      minimalne,
      maChorobowe,
    };
    if (!kopia || !dzialalnosc) return wynik;
    if (kopia.stanRozliczenNiedostepny || symulacja) return { ...wynik, niedostepny: true };

    const dzienOdczytu = dataZeZnacznika(kopia.odczytano);
    const stanOdczytu = stanZKopii(kopia, dzienOdczytu);
    if (!stanOdczytu) return { ...wynik, niedostepny: true };
    const okresSplaty = okresSplatyZKatalogu(katalog, dzis);

    const karty: KartaStanu[] = [];
    const chorobowe = dzialalnosc.ubezpieczenieChorobowe;
    const dni = maChorobowe
      ? dniPowstaniaPrawaZPodstawa(rodzina?.daneCiazy ?? null, kopia.zaswiadczeniaEzla, {
          wnioski: rodzina?.wnioski ?? [],
          pesel: dane.konto.pesel,
          poczatekChorobowego: chorobowe.rodzaj === 'dobrowolne' ? (chorobowe.od ?? null) : null,
          wyczekiwanieDni: wyczekiwanieDobrowolneZKatalogu(katalog, dzis),
        })
      : [];
    for (const d of dni) {
      const stan = d.dzien <= dzienOdczytu ? (stanZKopii(kopia, d.dzien) ?? stanOdczytu) : stanOdczytu;
      // Próg zadłużenia obowiązujący w dniu powstania prawa (48,06 zł do 31.12.2026, 49,50 zł od 01.01.2027).
      const progDnia = progZadluzenia(katalog, d.dzien).prog;
      karty.push({
        klucz: d.swiadczenie,
        dzienPrawa: d,
        stan,
        prog: progDnia,
        komunikaty: komunikatyStanu(stan, d.dzien, progDnia, okresSplaty, dzis, true),
      });
    }
    if (karty.length === 0) {
      karty.push({
        klucz: 'na-dzis',
        dzienPrawa: null,
        stan: stanOdczytu,
        prog,
        komunikaty: komunikatyStanu(stanOdczytu, dzienOdczytu, prog, okresSplaty, dzis, maChorobowe),
      });
    }
    return { ...wynik, dzienOdczytu, stanNaDzienOdczytu: stanOdczytu, karty };
  }, [dane, katalog, parametry, dzis]);
}
