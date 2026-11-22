// Dane przyjęcia dziecka w szkicu profilu (kontrakt, sekcja 6.5). Właściciel: u24 (Przyjęcie dziecka na wychowanie).
// Zapis działa dla konta ze zgodą na dane dotyczące zdrowia i bez niej (3.3.4.1.3). Zapis danych przyjęcia ustawia sytuację
// „przyjęcie dziecka na wychowanie” i usuwa ze szkicu przewidywany termin porodu, liczbę dzieci
// z ciąży i datę pierwszej wizyty u lekarza albo położnej.
import { rozpocznijZmianeProfilu } from '@/dane/magazyn/operacje/profil-szkic';
import { odczytajStanKonta, odczytajZalogowanego, wykonajOperacjeZWynikiem, zmienStanKonta } from '@/dane/magazyn/stan';
import {
  KOLEJNOSC_POL_PRZYJECIA,
  walidujDanePrzyjecia,
  zbudujPrzyjecie,
  type FormularzPrzyjecia,
} from '@/domena/rodzina/przyjecie';
import type { KodKomunikatu, KontekstOperacji, SzkicProfilu, WynikOperacji } from '@/domena/typy';

/** Ścieżka pola danych przyjęcia w `SzkicProfilu.zmienionePola`. */
export const POLE_PRZYJECIA_W_SZKICU = 'daneCiazy.przyjecie';

function nowySzkic(ctx: KontekstOperacji): SzkicProfilu {
  return {
    kontekst: 'start',
    powrotNaPodsumowanie: false,
    ostatniEkran: 'ViewProfileChildAdoption',
    daneRodziny: {},
    daneCiazy: {},
    zmienionePola: [],
    utworzono: ctx.teraz,
    zaktualizowano: ctx.teraz,
  };
}

export function zapiszDanePrzyjeciaWSzkicu(dane: FormularzPrzyjecia, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const zalogowany = odczytajZalogowanego();
    if (zalogowany === null) return { ok: false, kod: '0003' };
    // 3.3.4.1.3, KA-15: dane przyjęcia zapisujemy dla konta ze zgodą na dane dotyczące zdrowia i bez niej.
    const { konto } = zalogowany.stanKonta;

    const bledy = walidujDanePrzyjecia(dane, ctx.dzis);
    const pierwszyBlad = KOLEJNOSC_POL_PRZYJECIA.find((pole) => bledy[pole] !== undefined);
    if (pierwszyBlad !== undefined) {
      const bledyPol: Record<string, KodKomunikatu> = {};
      for (const [pole, kod] of Object.entries(bledy)) if (kod) bledyPol[pole] = kod;
      return { ok: false, kod: bledy[pierwszyBlad] as KodKomunikatu, bledyPol };
    }
    const przyjecie = zbudujPrzyjecie(dane, ctx.dzis);
    if (przyjecie === null) return { ok: false, kod: '0006' };

    // Rodzic bez szkicu zmienia zapisany profil, więc szkic zmiany profilu zakłada właściciel szkicu (u07).
    let szkic = zalogowany.stanKonta.szkicProfilu;
    if (szkic === null && konto.rola !== 'nowy-uzytkownik') {
      const rozpoczecie = rozpocznijZmianeProfilu(ctx);
      if (!rozpoczecie.ok) return rozpoczecie;
      szkic = odczytajStanKonta(konto.pesel)?.szkicProfilu ?? rozpoczecie.wartosc;
    }
    const biezacy = szkic ?? nowySzkic(ctx);

    const daneCiazy: SzkicProfilu['daneCiazy'] = { ...biezacy.daneCiazy, przyjecie };
    delete daneCiazy.przewidywanyTerminPorodu;
    delete daneCiazy.liczbaDzieciZCiazy;
    delete daneCiazy.dataPierwszejWizyty;

    const zmienionePola =
      biezacy.kontekst === 'zmiana-profilu' && !biezacy.zmienionePola.includes(POLE_PRZYJECIA_W_SZKICU)
        ? [...biezacy.zmienionePola, POLE_PRZYJECIA_W_SZKICU]
        : biezacy.zmienionePola;

    const nowy: SzkicProfilu = {
      ...biezacy,
      daneRodziny: { ...biezacy.daneRodziny, sytuacja: { wartosc: 'przyjecie', zrodlo: 'odpowiedz-rodzica' } },
      daneCiazy,
      zmienionePola,
      ostatniEkran: 'ViewProfileChildAdoption',
      zaktualizowano: ctx.teraz,
    };
    const zapisany = zmienStanKonta(konto.pesel, (stan) => ({ ...stan, szkicProfilu: nowy }));
    if (zapisany === null) return { ok: false, kod: '0003' };
    return { ok: true, wartosc: undefined };
  });
}
