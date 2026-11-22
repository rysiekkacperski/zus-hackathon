// Symulacja uzupełnienia profilu w trybie demonstracyjnym (ViewDemoAccountPicker). Właściciel: u01.
// Operacja zapisuje dla konta rodzica Profil rodziny z danymi przykładowymi tak, jakby rodzic przeszedł cały
// Profil na start (szkicProfiluDemo i zbudujProfilZeSzkicu), z kopią Danych z konta ZUS i zgodą na dane
// dotyczące zdrowia, nadaje kontu rolę Rodzic i przelicza plan, którego bieżącym etapem jest Ciąża.
// Informacja o symulacji czeka w pamięci karty na wejście na ViewFamilyPlan, więc znika po przeładowaniu strony.
import { gminy } from '@/dane/gminy';
import { zrodloweDaneKonta } from '@/dane/konta-zus';
import { posprzatajPoPrzywroceniu, przywrocStanPoczatkowyWTransakcji, type SkutkiPrzywrocenia } from '@/dane/magazyn/operacje/konto';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { czyTrybDemonstracyjny, kontoDemo, wykonajOperacjeZWynikiem, zapiszStanKonta, zapiszStanRodziny } from '@/dane/magazyn/stan';
import { kontoPrzewodnikaZKontaDemo, stanKontaPoczatkowy, wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';
import { przygotujKopie } from '@/domena/dane-zus/odczyt';
import { WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import { szkicProfiluDemo } from '@/domena/profil/profil-demo';
import { zbudujProfilZeSzkicu } from '@/domena/profil/zapis';
import type { DataISO, KontekstOperacji, Pesel, WynikOperacji } from '@/domena/typy';

/** Informacja o ostatniej symulacji uzupełnienia profilu dla planu rodziny konta `pesel`. */
export interface InformacjaOSymulacjiProfilu {
  pesel: Pesel;
  terminPorodu: DataISO;
}

let informacja: InformacjaOSymulacjiProfilu | null = null;
const sluchacze = new Set<() => void>();

function ustawInformacje(nowa: InformacjaOSymulacjiProfilu | null): void {
  informacja = nowa;
  for (const sluchacz of [...sluchacze]) sluchacz();
}

export function subskrybujInformacjeOSymulacjiProfilu(sluchacz: () => void): () => void {
  sluchacze.add(sluchacz);
  return () => {
    sluchacze.delete(sluchacz);
  };
}

export function informacjaOSymulacjiProfilu(): InformacjaOSymulacjiProfilu | null {
  return informacja;
}

/** Usuwa informację o symulacji po jej pokazaniu na planie rodziny. */
export function zamknijInformacjeOSymulacjiProfilu(): void {
  if (informacja !== null) ustawInformacje(null);
}

/** Symulacja jest dostępna w trybie demonstracyjnym dla każdego konta rodzica z rejestru kont demonstracyjnych. */
export function czySymulacjaProfiluDostepna(pesel: Pesel): boolean {
  const konto = kontoDemo(pesel);
  return czyTrybDemonstracyjny() && konto !== null && konto.rodzaj !== 'konto-administratora';
}

/**
 * Uzupełnienie profilu danymi przykładowymi dla konta `pesel`. Symulacja nadpisuje dotychczasowe dane konta:
 * najpierw przywraca stan początkowy konta (nowe konto zostaje w rejestrze), potem zapisuje konto z rolą Rodzic,
 * zgodą na dane dotyczące zdrowia i kopią Danych z konta ZUS, Profil rodziny ze szkicu danych przykładowych
 * i przelicza plan. Zalogowanie kontem i przejście na plan rodziny wykonuje wywołujący.
 */
export function symulujUzupelnienieProfilu(
  pesel: Pesel,
  ctx: KontekstOperacji,
): WynikOperacji<InformacjaOSymulacjiProfilu> {
  const wynik = wykonajOperacjeZWynikiem<{ skutki: SkutkiPrzywrocenia; terminPorodu: DataISO }>(() => {
    const demo = kontoDemo(pesel);
    const gmina = gminy[0];
    if (demo === null || gmina === undefined || !czySymulacjaProfiluDostepna(pesel)) return { ok: false, kod: '0003' };
    const skutki = przywrocStanPoczatkowyWTransakcji(pesel, ctx, { zachowajWRejestrze: true });

    const zrodlo = zrodloweDaneKonta(pesel, null, demo);
    const kopia = zrodlo === null ? null : przygotujKopie({ zrodlo, poprzednia: null, teraz: ctx.teraz, zgodaNaDaneZdrowia: true });
    const szkic = szkicProfiluDemo({ kopia, plec: demo.plec, gmina, dzis: ctx.dzis, teraz: ctx.teraz });
    const { daneRodziny, daneCiazy } = zbudujProfilZeSzkicu(szkic, true, pesel, pesel, ctx.teraz);
    const terminPorodu = daneCiazy?.przewidywanyTerminPorodu;
    if (terminPorodu === undefined) return { ok: false, kod: '0003' };

    zapiszStanRodziny({
      idRodziny: pesel,
      daneRodziny,
      daneCiazy,
      plan: null,
      kalendarz: null,
      wnioski: [],
      wynikiKalkulacji: wynikiKalkulacjiPuste(),
    });
    const konto = kontoPrzewodnikaZKontaDemo(demo, ctx.teraz);
    zapiszStanKonta({
      ...stanKontaPoczatkowy({
        ...konto,
        rola: 'rodzic',
        idRodziny: pesel,
        decyzjeOZgodzie: [{ rodzaj: 'udzielenie', wersjaTresci: WERSJA_TRESCI_ZGODY, czas: ctx.teraz }],
      }),
      kopiaDanychZus: kopia,
      stanOdczytuZus: kopia === null ? { stan: 'brak' } : { stan: 'udany', czas: ctx.teraz },
    });

    const przeliczenie = przeliczRodzine(pesel, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: { skutki, terminPorodu } };
  });
  if (!wynik.ok) return wynik;
  posprzatajPoPrzywroceniu(wynik.wartosc.skutki, ctx);
  const nowa = { pesel, terminPorodu: wynik.wartosc.terminPorodu };
  ustawInformacje(nowa);
  return { ok: true, wartosc: nowa };
}
