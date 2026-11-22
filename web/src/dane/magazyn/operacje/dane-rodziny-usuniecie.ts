// Usunięcie danych rodziny (kontrakt, sekcja 6.5). Właściciel: u02 (Zgoda, powitanie i ustawienia przewodnika).
// Historyjka 3.1.1.2.1 (zadanie 6); analiza 3.1.1, reguła R11.
import { dodajDni } from '@/domena/daty';
import { DNI_DO_USUNIECIA_DANYCH } from '@/domena/konto';
import type {
  DataISO,
  IdRodziny,
  KontekstOperacji,
  KontoPrzewodnika,
  Pesel,
  StanKonta,
  StanRodziny,
  Wniosek,
  WynikOperacji,
} from '@/domena/typy';
import { czyPrzypomnienieRodziny, przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { interakcjeAsystentaPuste } from '@/dane/magazyn/stan-poczatkowy';
import {
  odczytajStanRodziny,
  odczytajZalogowanego,
  osobyRodziny,
  wykonajOperacjeZWynikiem,
  zapiszStanRodziny,
  zmienStanKonta,
  zmienStanSesji,
} from '@/dane/magazyn/stan';

/** Wniosek przygotowany w przewodniku, którego nie wysłano: szkic albo wniosek przygotowany. */
export function czyWniosekNiewyslany(wniosek: Pick<Wniosek, 'stan'>): boolean {
  return wniosek.stan === 'szkic' || wniosek.stan === 'przygotowany';
}

/** Termin usunięcia danych rodziny: dzień usunięcia + 30 dni. */
export function terminUsunieciaDanychRodziny(dzis: DataISO): DataISO {
  return dodajDni(dzis, DNI_DO_USUNIECIA_DANYCH);
}

/** Rola konta po usunięciu danych rodziny: Rodzic i Drugi rodzic wracają do roli Nowy użytkownik. */
function rolaPoUsunieciu(konto: KontoPrzewodnika): KontoPrzewodnika['rola'] {
  return konto.rola === 'administrator' ? konto.rola : 'nowy-uzytkownik';
}

function bezPrzypomnienRodziny(stan: StanKonta, idRodziny: IdRodziny | null): StanKonta['powiadomienia'] {
  if (idRodziny === null) return stan.powiadomienia;
  return stan.powiadomienia.filter((p) => !czyPrzypomnienieRodziny(p, idRodziny));
}

/** Rodzina ukryta od chwili usunięcia, z terminem usunięcia wykonywanym leniwie przez przeliczRodzine. */
export function ukryjRodzine(rodzina: StanRodziny, ctx: KontekstOperacji, termin: DataISO): StanRodziny {
  return { ...rodzina, ukryte: { od: ctx.teraz, terminUsuniecia: termin } };
}

/** Rodzina z odłączonym dostępem konta (Drugi rodzic usuwa dane rodziny ze swojego konta). */
export function odlaczDostepKonta(rodzina: StanRodziny, pesel: Pesel, dzis: DataISO): StanRodziny {
  return {
    ...rodzina,
    daneRodziny: {
      ...rodzina.daneRodziny,
      dostepKont: rodzina.daneRodziny.dostepKont.map((d) =>
        d.pesel === pesel && d.stan === 'aktywny' ? { ...d, stan: 'odlaczony', odlaczono: dzis } : d,
      ),
    },
  };
}

/**
 * Usuwa dane rodziny zalogowanego konta: rola Nowy użytkownik, rodzina ukryta z terminem usunięcia +30 dni,
 * czyli profil, plan, terminy i niewysłane wnioski przestają być widoczne od razu, przypomnienia o terminach
 * rodziny znikają z kont, a szkic profilu i log asystenta zostają usunięte. Wnioski wysłane do ZUS zostają
 * w symulowanym ZUS. Konta dołączone do rodziny wracają do roli Nowy użytkownik bez rodziny. Konto z rolą
 * Drugi rodzic traci dostęp do rodziny Rodzica, a rodzina Rodzica zostaje i przelicza się bez niego.
 * Błąd zapisu daje 0003 bez zmiany stanu.
 */
export function usunDaneRodziny(ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem<void>(() => {
    const zalogowany = odczytajZalogowanego();
    if (zalogowany === null) return { ok: false, kod: '0003' };
    const { sesja, stanKonta } = zalogowany;
    const pesel = stanKonta.konto.pesel;
    const termin = terminUsunieciaDanychRodziny(ctx.dzis);
    const idRodziny = stanKonta.konto.idRodziny;
    const rodzina = idRodziny === null ? null : odczytajStanRodziny(idRodziny);

    let rodzinaUkryta = false;
    const doPrzeliczenia: IdRodziny[] = [];
    if (rodzina !== null && !rodzina.ukryte) {
      if (osobyRodziny(rodzina.daneRodziny).peselRodzica === pesel) {
        zapiszStanRodziny(ukryjRodzine(rodzina, ctx, termin));
        rodzinaUkryta = true;
        for (const dostep of rodzina.daneRodziny.dostepKont) {
          if (dostep.pesel === pesel) continue;
          zmienStanKonta(dostep.pesel, (stan) => ({
            ...stan,
            konto:
              stan.konto.idRodziny === rodzina.idRodziny
                ? { ...stan.konto, rola: rolaPoUsunieciu(stan.konto), idRodziny: null }
                : stan.konto,
            powiadomienia: bezPrzypomnienRodziny(stan, rodzina.idRodziny),
          }));
        }
      } else {
        zapiszStanRodziny(odlaczDostepKonta(rodzina, pesel, ctx.dzis));
        doPrzeliczenia.push(rodzina.idRodziny);
      }
    }

    const zmieniony = zmienStanKonta(pesel, (stan) => ({
      ...stan,
      konto: {
        ...stan.konto,
        rola: rolaPoUsunieciu(stan.konto),
        // Ukryta rodzina zostaje powiązana z kontem, żeby synchronizacja usunęła ją po terminie.
        idRodziny: rodzinaUkryta ? stan.konto.idRodziny : null,
        ...(rodzinaUkryta ? { terminUsunieciaDanychRodziny: termin } : {}),
      },
      szkicProfilu: null,
      powiadomienia: bezPrzypomnienRodziny(stan, idRodziny),
      interakcjeAsystenta: interakcjeAsystentaPuste(),
    }));
    if (zmieniony === null) return { ok: false, kod: '0003' };

    // Rozmowa asystenta w bieżącej sesji należy do logu asystenta, więc znika razem z nim.
    zmienStanSesji(sesja.idSesji, (stan) => ({
      ...stan,
      panelAsystenta: { otwarty: stan.panelAsystenta.otwarty, szkic: '' },
    }));

    for (const id of doPrzeliczenia) {
      const przeliczenie = przeliczRodzine(id, ctx);
      if (!przeliczenie.ok) return przeliczenie;
    }
    return { ok: true, wartosc: undefined };
  });
}
