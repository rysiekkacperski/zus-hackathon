// Zapis Profilu rodziny (kontrakt, sekcja 6.5). Właściciel: u11 (Profil na start: drugi rodzic, podsumowanie i zapis).
// zapiszProfil: szkic konta Nowy użytkownik → Dane rodziny i Dane ciąży i dziecka z filtrem zgody, rola Nowy
// użytkownik → Rodzic, przeliczenie planu, komunikat 0017 na planie rodziny (KA-04, KA-05 3.3.1.3.1).
// zapiszZmianyProfilu: szkic zmiany profilu konta Rodzic albo Drugi rodzic zastępuje dane profilu
// i uruchamia przeliczenie planu (KA-09 3.3.1.3.1). Błąd zapisu daje 0003 bez zmiany stanu (KA-06).
import { czyMaZgode } from '@/domena/konto';
import { zastosujZmianeProfilu, zbudujProfilZeSzkicu } from '@/domena/profil/zapis';
import type { KontekstOperacji, StanRodziny, WynikOperacji } from '@/domena/typy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { przeliczWnioskiZamPoPorodzie } from '@/dane/magazyn/operacje/wnioski-zam-rozszerzenia';
import {
  odczytajStanRodziny,
  odczytajZalogowanego,
  rodzinaKonta,
  wykonajOperacjeZWynikiem,
  zapiszStanKonta,
  zapiszStanRodziny,
} from '@/dane/magazyn/stan';
import { wynikiKalkulacjiPuste } from '@/dane/magazyn/stan-poczatkowy';

/** Szkic → Dane rodziny i Dane ciąży z filtrem zgody, rola NU → R, przeliczenie, komunikat 0017. */
export function zapiszProfil(ctx: KontekstOperacji): WynikOperacji {
  const wynik = wykonajOperacjeZWynikiem<void>(() => {
    const zalogowany = odczytajZalogowanego();
    if (zalogowany === null) return { ok: false, kod: '0003' };
    const { stanKonta } = zalogowany;
    const { konto, szkicProfilu } = stanKonta;
    if (szkicProfilu === null || konto.rola !== 'nowy-uzytkownik') return { ok: false, kod: '0003' };

    const idRodziny = konto.pesel;
    const zgoda = czyMaZgode(konto.decyzjeOZgodzie);
    const { daneRodziny, daneCiazy } = zbudujProfilZeSzkicu(szkicProfilu, zgoda, idRodziny, konto.pesel, ctx.teraz);
    const poprzednia = odczytajStanRodziny(idRodziny);

    const rodzina: StanRodziny = {
      idRodziny,
      daneRodziny,
      daneCiazy,
      plan: null,
      kalendarz: null,
      wnioski: [],
      // Wyniki kalkulacji konta Nowy użytkownik przechodzą do rodziny, żeby zapisane scenariusze zostały.
      wynikiKalkulacji: poprzednia && !poprzednia.ukryte ? poprzednia.wynikiKalkulacji : stanKonta.wynikiKalkulacji ?? wynikiKalkulacjiPuste(),
    };
    zapiszStanRodziny(rodzina);
    zapiszStanKonta({
      ...stanKonta,
      konto: { ...konto, rola: 'rodzic', idRodziny },
      szkicProfilu: null,
    });

    const przeliczenie = przeliczRodzine(idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    return { ok: true, wartosc: undefined };
  });
  if (wynik.ok) ustawKomunikatPoPrzejsciu({ kod: '0017', dlaWidoku: 'ViewFamilyPlan' });
  return wynik;
}

/** Zapis zmian profilu z trybu zmiany profilu. */
export function zapiszZmianyProfilu(ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const zalogowany = odczytajZalogowanego();
    if (zalogowany === null) return { ok: false, kod: '0003' };
    const { stanKonta } = zalogowany;
    const { konto, szkicProfilu } = stanKonta;
    const rodzina = rodzinaKonta(konto);
    if (szkicProfilu === null || szkicProfilu.kontekst !== 'zmiana-profilu' || rodzina === null) {
      return { ok: false, kod: '0003' };
    }

    const zgoda = czyMaZgode(konto.decyzjeOZgodzie);
    const { daneRodziny, daneCiazy } = zastosujZmianeProfilu(
      { daneRodziny: rodzina.daneRodziny, daneCiazy: rodzina.daneCiazy },
      szkicProfilu,
      zgoda,
      ctx.teraz,
    );
    zapiszStanRodziny({ ...rodzina, daneRodziny, daneCiazy });
    zapiszStanKonta({ ...stanKonta, szkicProfilu: null });

    const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
    if (!przeliczenie.ok) return przeliczenie;
    // Potwierdzona w profilu data porodu przelicza wnioski ZAM złożone przed porodem (KA-19, KA-20, KA-22 3.9.1.3.1).
    const zam = przeliczWnioskiZamPoPorodzie(ctx);
    if (!zam.ok) return zam;
    return { ok: true, wartosc: undefined };
  });
}
