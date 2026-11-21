// Potwierdzenie opłacenia składek w sprawie strażnika (historyjka 3.6.1.3.1, kontrakt 6.5). Właściciel: u12.
// Zapisuje w Danych rodziny potwierdzenie matki za miesiąc ze źródłem odpowiedź rodzica i przelicza rodzinę:
// krok planu `straznik` nadaje wtedy sprawie Opłacenie składek status załatwiona.
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import { odczytajZalogowanego, rodzinaKonta, wykonajOperacjeZWynikiem, zmienStanRodziny } from '@/dane/magazyn/stan';
import type { KontekstOperacji, MiesiacISO, WynikOperacji } from '@/domena/typy';

export function potwierdzOplacenieSkladek(miesiac: MiesiacISO, ctx: KontekstOperacji): WynikOperacji {
  return wykonajOperacjeZWynikiem(() => {
    const zalogowany = odczytajZalogowanego();
    if (zalogowany === null) return { ok: false, kod: '0003' };
    const konto = zalogowany.stanKonta.konto;
    const rodzina = rodzinaKonta(konto);
    if (rodzina === null || konto.rola !== 'rodzic') return { ok: false, kod: '0003' };
    const zapisana = zmienStanRodziny(rodzina.idRodziny, (stan) => {
      const potwierdzenia = (stan.daneRodziny.matka.potwierdzeniaSkladek ?? []).filter((p) => p.miesiac !== miesiac);
      return {
        ...stan,
        daneRodziny: {
          ...stan.daneRodziny,
          matka: {
            ...stan.daneRodziny.matka,
            potwierdzeniaSkladek: [
              ...potwierdzenia,
              { miesiac, zrodlo: 'odpowiedz-rodzica', czas: ctx.teraz },
            ],
          },
          zapisano: ctx.teraz,
        },
      };
    });
    if (zapisana === null) return { ok: false, kod: '0003' };
    return przeliczRodzine(rodzina.idRodziny, ctx);
  });
}
