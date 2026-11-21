// Kreator wniosków o urlop do pracodawcy (kontrakt, sekcja 6.5). Właściciel: u28 (Wnioski o urlop do pracodawcy: rdzeń).
// Szkic wniosku żyje w Wnioskach rodziny (stan 'szkic'), jeden na konto i sprawę wejścia.
import { idZLosowych } from '@/domena/numery';
import type {
  IdSprawy,
  IdWidoku,
  IdWniosku,
  KontekstOperacji,
  StanRodziny,
  WniosekOUrlop,
  WynikOperacji,
} from '@/domena/typy';
import { czyWniosekOUrlop } from '@/domena/wnioski/urlopy';
import { losowyCiag } from '@/dane/magazyn/losowanie';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { odczytajZalogowanego, rodzinaKonta, wykonajOperacjeZWynikiem, zmienStanRodziny } from '@/dane/magazyn/stan';

function kontekstKonta(): { pesel: string; rodzina: StanRodziny; rola: WniosekOUrlop['rola'] } | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const konto = zalogowany.stanKonta.konto;
  const rodzina = rodzinaKonta(konto);
  if (rodzina === null) return null;
  return { pesel: konto.pesel, rodzina, rola: konto.rola };
}

/** Wniosek o urlop zalogowanego konta po identyfikatorze; null, gdy go brak albo należy do innego konta. */
export function znajdzWniosekOUrlop(rodzina: StanRodziny | null, pesel: string | undefined, id: IdWniosku | null): WniosekOUrlop | null {
  if (rodzina === null || pesel === undefined || id === null) return null;
  const w = rodzina.wnioski.find((x) => x.idWniosku === id);
  return w && czyWniosekOUrlop(w) && w.konto === pesel ? w : null;
}

/** Niewysłany wniosek o urlop konta dla sprawy wejścia (szkic albo przygotowany). */
export function szkicDlaSprawy(rodzina: StanRodziny | null, pesel: string | undefined, idSprawy: IdSprawy): WniosekOUrlop | null {
  if (rodzina === null || pesel === undefined) return null;
  const w = rodzina.wnioski.find(
    (x) => czyWniosekOUrlop(x) && x.konto === pesel && x.idSprawy === idSprawy && (x.stan === 'szkic' || x.stan === 'przygotowany'),
  );
  return (w as WniosekOUrlop | undefined) ?? null;
}

/** Nowy albo wznowiony szkic wniosku o urlop; `scenariusz` to numer scenariusza kalkulatora albo undefined. */
export function rozpocznijLubWznowWniosekOUrlop(
  idSprawy: IdSprawy,
  scenariusz: number | undefined,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekOUrlop> {
  void scenariusz;
  return wykonajOperacjeZWynikiem<WniosekOUrlop>(() => {
    const k = kontekstKonta();
    if (k === null) return { ok: false, kod: '0003' };
    const istniejacy = szkicDlaSprawy(k.rodzina, k.pesel, idSprawy);
    if (istniejacy) return { ok: true, wartosc: istniejacy };
    const nowy: WniosekOUrlop = {
      idWniosku: idZLosowych('W', ctx.teraz, losowyCiag(6)),
      rodzaj: 'urlop-do-pracodawcy',
      idSprawy,
      konto: k.pesel,
      rola: k.rola,
      stan: 'szkic',
      ostatniEkran: 'ViewLeaveRequestType',
      utworzono: ctx.teraz,
      zaktualizowano: ctx.teraz,
      adresat: 'pracodawca',
      zalaczniki: [],
      okresy: [],
      oswiadczenia: {},
    };
    zmienStanRodziny(k.rodzina.idRodziny, (s) => ({ ...s, wnioski: [...s.wnioski, nowy] }));
    przeliczRodzine(k.rodzina.idRodziny, ctx);
    return { ok: true, wartosc: nowy };
  });
}

/** Zapis odpowiedzi z ekranu kreatora i ostatniego ekranu. */
export function zapiszKrokWnioskuOUrlop(
  id: IdWniosku,
  zmiana: Partial<WniosekOUrlop>,
  ekran: IdWidoku,
  ctx: KontekstOperacji,
): WynikOperacji<WniosekOUrlop> {
  return wykonajOperacjeZWynikiem<WniosekOUrlop>(() => {
    const k = kontekstKonta();
    if (k === null) return { ok: false, kod: '0003' };
    const biezacy = znajdzWniosekOUrlop(k.rodzina, k.pesel, id);
    if (biezacy === null || biezacy.stan === 'wyslany') return { ok: false, kod: '0003' };
    const nowy: WniosekOUrlop = {
      ...biezacy,
      ...zmiana,
      oswiadczenia: zmiana.oswiadczenia ? { ...biezacy.oswiadczenia, ...zmiana.oswiadczenia } : biezacy.oswiadczenia,
      idWniosku: biezacy.idWniosku,
      rodzaj: biezacy.rodzaj,
      konto: biezacy.konto,
      ostatniEkran: ekran,
      zaktualizowano: ctx.teraz,
    };
    zmienStanRodziny(k.rodzina.idRodziny, (s) => ({
      ...s,
      wnioski: s.wnioski.map((w) => (w.idWniosku === id ? nowy : w)),
    }));
    przeliczRodzine(k.rodzina.idRodziny, ctx);
    return { ok: true, wartosc: nowy };
  });
}
