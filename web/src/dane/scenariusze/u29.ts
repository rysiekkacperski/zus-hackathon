// Scenariusze demonstracyjne jednostki u29 (kontrakt, sekcja 6.6). Właściciel: u29.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki: pytanie Anny Nowak w sprawie K08
// wysłane 21.11.2026 o 10:15 bez odpowiedzi (KA-04, KA-05, KA-16) i z odpowiedzią ZUS z 25.11.2026 (KA-11 do KA-15).
import { odpowiedziZus } from '@/dane/konta-zus/odpowiedzi-zus';
import { trescSymulowanejOdpowiedzi } from '@/domena/pytania-zus/odpowiedzi';
import type { PytanieDoZus, ScenariuszDemo } from '@/domena/typy';

const PESEL_ANNY = '93041231085';

const pytanieK08: PytanieDoZus = {
  idPytania: 'PYT-20261121101500-DEMO01',
  idSprawy: 'K08',
  tresc: 'Czy po porodzie muszę zawiesić działalność, żeby otrzymać zasiłek macierzyński?',
  kontekst: {
    sprawa: {
      idSprawy: 'K08',
      tytul: 'Wniosek o zasiłek macierzyński',
      etap: 'urlopy-i-zasilek',
      status: 'do-zrobienia',
      termin: '2027-04-05',
      terminSzacowany: true,
    },
    profil: {
      formaZatrudnienia: 'jdg',
      ubezpieczenieChorobowe: true,
      platnikZasilku: 'zus',
      przewidywanyTerminPorodu: '2027-03-15',
      liczbaDzieci: 1,
    },
    rodzajUbezpieczeniaChorobowego: 'dobrowolne',
  },
  wyslano: '2026-11-21T10:15:00',
  status: 'wyslane',
  peselNadawcy: PESEL_ANNY,
};

export const scenariuszeU29: readonly ScenariuszDemo[] = [
  {
    id: 'u29-pytanie-k08-wyslane',
    nazwa: 'Anna Nowak: pytanie do ZUS w sprawie K08 bez odpowiedzi',
    opis: 'Pytanie wysłane 21.11.2026 o 10:15. Odpowiedź symulowana przychodzi po opóźnieniu z parametrów systemu.',
    pesel: PESEL_ANNY,
    zastosuj: () => ({ zus: { korespondencja: [pytanieK08] } }),
  },
  {
    id: 'u29-pytanie-k08-odpowiedz',
    nazwa: 'Anna Nowak: odpowiedź ZUS na pytanie w sprawie K08',
    opis: 'Odpowiedź ZUS z 25.11.2026; przy kolejnym odczycie korespondencji przewodnik wysyła SMS i e-mail według ustawień.',
    pesel: PESEL_ANNY,
    zastosuj: () => ({
      zus: {
        korespondencja: [
          {
            ...pytanieK08,
            status: 'odpowiedz',
            odpowiedz: { tresc: trescSymulowanejOdpowiedzi(pytanieK08, odpowiedziZus), czas: '2026-11-25T10:15:00', symulowana: true },
          },
        ],
      },
    }),
  },
];
