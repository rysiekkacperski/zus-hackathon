// Decyzja o zgodzie na dane dotyczące zdrowia (kontrakt, sekcja 6.5). Właściciel: u02 (Zgoda, powitanie i ustawienia przewodnika).
// Historyjki 3.1.1.1.1 (zadanie 6) i 3.1.1.2.1 (zadania 2 i 4); analiza 3.1.1, reguły R7, R9 i R10.
import { dodajDni } from '@/domena/daty';
import { DNI_DO_USUNIECIA_DANYCH, WERSJA_TRESCI_ZGODY } from '@/domena/konto';
import type {
  DaneCiazyIDziecka,
  DataISO,
  DecyzjaOZgodzie,
  KontekstOperacji,
  RodzajDecyzjiOZgodzie,
  StanKonta,
  StanRodziny,
  WynikOperacji,
  ZnacznikCzasu,
} from '@/domena/typy';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import {
  odczytajStanRodziny,
  odczytajZalogowanego,
  osobyRodziny,
  wykonajOperacjeZWynikiem,
  zapiszStanRodziny,
  zmienStanKonta,
} from '@/dane/magazyn/stan';

/** Rekord decyzji: rodzaj, aktualna wersja treści zgody, data i godzina (Europe/Warsaw). */
export function nowaDecyzja(rodzaj: RodzajDecyzjiOZgodzie, teraz: ZnacznikCzasu): DecyzjaOZgodzie {
  return { rodzaj, wersjaTresci: WERSJA_TRESCI_ZGODY, czas: teraz };
}

/** Termin usunięcia danych o ciąży, porodzie i stanie zdrowia dziecka: dzień decyzji + 30 dni. */
export function terminUsunieciaDanychZdrowotnych(dzis: DataISO): DataISO {
  return dodajDni(dzis, DNI_DO_USUNIECIA_DANYCH);
}

/**
 * Konto po decyzji: dopisany rekord decyzji. Wycofanie i odmowa wyznaczają termin usunięcia danych
 * dotyczących zdrowia (wycofanie) i usuwają dane ciąży ze szkicu profilu, a udzielenie zgody zdejmuje termin
 * usunięcia, więc dane zachowane do terminu wracają do użycia.
 */
export function kontoPoDecyzji(stan: StanKonta, decyzja: DecyzjaOZgodzie, termin: DataISO): StanKonta {
  const decyzje = [...stan.konto.decyzjeOZgodzie, decyzja];
  if (decyzja.rodzaj === 'udzielenie') {
    const { terminUsunieciaDanychZdrowotnych: usuwany, ...konto } = stan.konto;
    void usuwany;
    return { ...stan, konto: { ...konto, decyzjeOZgodzie: decyzje } };
  }
  const szkicProfilu = stan.szkicProfilu === null ? null : { ...stan.szkicProfilu, daneCiazy: {} };
  const konto =
    decyzja.rodzaj === 'wycofanie'
      ? { ...stan.konto, decyzjeOZgodzie: decyzje, terminUsunieciaDanychZdrowotnych: termin }
      : { ...stan.konto, decyzjeOZgodzie: decyzje };
  return { ...stan, konto, szkicProfilu };
}

/**
 * Dane ciąży i dziecka rodziny po decyzji konta, które zapisało profil rodziny. Wycofanie i odmowa
 * wyłączają dane z użycia od chwili decyzji z terminem usunięcia, udzielenie zgody przywraca dane zachowane
 * do terminu usunięcia. Rodzina bez danych ciąży zostaje bez zmian.
 */
export function daneCiazyPoDecyzji(
  daneCiazy: DaneCiazyIDziecka | null,
  decyzja: DecyzjaOZgodzie,
  termin: DataISO,
): DaneCiazyIDziecka | null {
  if (daneCiazy === null) return null;
  if (decyzja.rodzaj === 'udzielenie') {
    if (daneCiazy.wylaczoneZUzycia === undefined) return daneCiazy;
    const { wylaczoneZUzycia: zdejmowane, ...dane } = daneCiazy;
    void zdejmowane;
    return dane;
  }
  if (daneCiazy.wylaczoneZUzycia !== undefined) return daneCiazy;
  return { ...daneCiazy, wylaczoneZUzycia: { od: decyzja.czas, terminUsuniecia: termin } };
}

function rodzinaZarzadzanaPrzezKonto(idRodziny: string | null, pesel: string): StanRodziny | null {
  if (idRodziny === null) return null;
  const rodzina = odczytajStanRodziny(idRodziny);
  if (rodzina === null || rodzina.ukryte) return null;
  return osobyRodziny(rodzina.daneRodziny).peselRodzica === pesel ? rodzina : null;
}

/**
 * Zapisuje decyzję o zgodzie zalogowanego konta. Wycofanie wyłącza Dane ciąży i dziecka z użycia
 * natychmiast, wyznacza termin usunięcia +30 dni i przelicza rodzinę. Błąd zapisu daje 0003 bez zmiany stanu.
 */
export function zapiszDecyzjeOZgodzie(rodzaj: RodzajDecyzjiOZgodzie, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const zalogowany = odczytajZalogowanego();
    if (zalogowany === null) return { ok: false, kod: '0003' };
    const pesel = zalogowany.sesja.pesel;
    const decyzja = nowaDecyzja(rodzaj, ctx.teraz);
    const termin = terminUsunieciaDanychZdrowotnych(ctx.dzis);

    const stanKonta = zmienStanKonta(pesel, (stan) => kontoPoDecyzji(stan, decyzja, termin));
    if (stanKonta === null) return { ok: false, kod: '0003' };

    const rodzina = rodzinaZarzadzanaPrzezKonto(stanKonta.konto.idRodziny, pesel);
    if (rodzina !== null) {
      const daneCiazy = daneCiazyPoDecyzji(rodzina.daneCiazy, decyzja, termin);
      if (daneCiazy !== rodzina.daneCiazy) zapiszStanRodziny({ ...rodzina, daneCiazy });
    }

    // Zgoda konta zakładającego decyduje o użyciu danych w planie, terminach i przypomnieniach.
    const idRodziny = stanKonta.konto.idRodziny;
    if (idRodziny !== null) {
      const widoczna = odczytajStanRodziny(idRodziny);
      if (widoczna !== null && !widoczna.ukryte) {
        const przeliczenie = przeliczRodzine(idRodziny, ctx);
        if (!przeliczenie.ok) return przeliczenie;
      }
    }
    return { ok: true, wartosc: undefined };
  });
}
