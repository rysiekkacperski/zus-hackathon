// Słownik wymiarów i okresów z wariantami i wersjami (kontrakt, sekcja 8; ANALIZY/04 sekcja 4.2).
// Właściciel: u04. Stan prawny z listopada 2026 roku. Zasady zapisu wartości i szablonów opisu opisuje
// `dane/katalog/slownik-kwot.ts`.
import type { WpisSlownika } from '@/domena/typy';

/** Identyfikatory wpisów słownika wymiarów i okresów. */
export const ID_WYMIAROW = {
  urlopMacierzynski: 'urlop-macierzynski',
  czescUrlopuPrzedPorodem: 'czesc-urlopu-macierzynskiego-przed-porodem',
  czescUrlopuMatki: 'czesc-urlopu-macierzynskiego-wykorzystywana-przez-matke',
  urlopPoStracieDziecka: 'urlop-macierzynski-po-urodzeniu-martwego-dziecka-albo-zgonie',
  uzupelniajacyUrlopMacierzynski: 'uzupelniajacy-urlop-macierzynski',
  urlopNaWarunkachMacierzynskiego: 'urlop-na-warunkach-urlopu-macierzynskiego',
  wiekDzieckaUrlopNaWarunkach: 'wiek-dziecka-urlop-na-warunkach-urlopu-macierzynskiego',
  urlopRodzicielski: 'urlop-rodzicielski',
  nieprzenoszalnaCzescUrlopuRodzicielskiego: 'nieprzenoszalna-czesc-urlopu-rodzicielskiego',
  liczbaCzesciUrlopuRodzicielskiego: 'liczba-czesci-urlopu-rodzicielskiego',
  wykorzystanieUrlopuRodzicielskiego: 'wykorzystanie-urlopu-rodzicielskiego',
  urlopRodzicielskiZPraca: 'urlop-rodzicielski-przy-laczeniu-z-praca',
  urlopOjcowski: 'urlop-ojcowski',
  terminWnioskuWariant815: 'termin-wniosku-w-wariancie-81-5',
  okresWyczekiwania: 'okres-wyczekiwania-na-zasilek-chorobowy',
  wyjatkiOdOkresuWyczekiwania: 'wyjatki-od-okresu-wyczekiwania',
  okresZasilkowy: 'okres-zasilkowy',
  przerwaWNiezdolnosci: 'przerwa-w-niezdolnosci-do-pracy',
  zasilekPoUstaniu: 'zasilek-chorobowy-po-ustaniu-ubezpieczenia',
  wynagrodzenieChorobowe: 'wynagrodzenie-chorobowe-pracownika',
  swiadczenieRehabilitacyjneOkres: 'swiadczenie-rehabilitacyjne-okres',
  okresSplatyZadluzenia: 'okres-splaty-zadluzenia-z-tytulu-skladek',
  liczbaUbezpieczonychPlatnika: 'liczba-ubezpieczonych-platnika-wyplacajacego-zasilki',
  zasilekPoUstaniuChorobaZakazna: 'zasilek-chorobowy-po-ustaniu-przy-chorobie-zakaznej',
  urlopWychowawczy: 'urlop-wychowawczy',
  okresZatrudnieniaUrlopWychowawczy: 'okres-zatrudnienia-uprawniajacy-do-urlopu-wychowawczego',
  obnizenieWymiaruUrlopWychowawczy: 'obnizenie-wymiaru-czasu-pracy-w-okresie-urlopu-wychowawczego',
  okresSwiadczeniaRodzicielskiego: 'okres-swiadczenia-rodzicielskiego',
  wydluzenieOkresuSwiadczeniaRodzicielskiego: 'wydluzenie-okresu-swiadczenia-rodzicielskiego',
  okresPodstawyWymiaruZasilku: 'okres-podstawy-wymiaru-zasilku',
} as const;

/** Początek obowiązywania wartości słownika wymiarów i okresów (3.5.1.1.2). */
const OD_URUCHOMIENIA = '2023-04-26';
/** Początek obowiązywania uzupełniającego urlopu macierzyńskiego i wydłużenia okresu świadczenia rodzicielskiego. */
const OD_UZUPELNIAJACEGO_URLOPU = '2025-03-19';

export const wpisySlownikaWymiarow: readonly WpisSlownika[] = [
  {
    id: ID_WYMIAROW.urlopMacierzynski,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Urlop macierzyński',
    warianty: [
      { klucz: 'jednoDziecko', etykieta: 'Przy jednym dziecku', jednostka: 'tygodnie' },
      { klucz: 'dwojeDzieci', etykieta: 'Przy dwojgu dzieci', jednostka: 'tygodnie' },
      { klucz: 'trojeDzieci', etykieta: 'Przy trojgu dzieci', jednostka: 'tygodnie' },
      { klucz: 'czworoDzieci', etykieta: 'Przy czworgu dzieci', jednostka: 'tygodnie' },
      { klucz: 'piecioroDzieci', etykieta: 'Przy pięciorgu i więcej dzieciach', jednostka: 'tygodnie' },
    ],
    wersje: [
      { od: OD_URUCHOMIENIA, wartosci: { jednoDziecko: 20, dwojeDzieci: 31, trojeDzieci: 33, czworoDzieci: 35, piecioroDzieci: 37 } },
    ],
    szablonOpisu:
      '{jednoDziecko} tygodni przy jednym dziecku, {dwojeDzieci} tygodni przy dwojgu, {trojeDzieci} przy trojgu, {czworoDzieci} przy czworgu i {piecioroDzieci} przy pięciorgu i więcej dzieciach',
    edytowalny: true,
    kolejnosc: 1,
  },
  {
    id: ID_WYMIAROW.czescUrlopuPrzedPorodem,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Część urlopu macierzyńskiego przed porodem',
    warianty: [{ klucz: 'tygodnie', etykieta: 'Najwyżej przed przewidywanym terminem porodu', jednostka: 'tygodnie' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { tygodnie: 6 } }],
    szablonOpisu: 'najwyżej {tygodnie} tygodni przed przewidywanym terminem porodu',
    edytowalny: true,
    kolejnosc: 2,
  },
  {
    id: ID_WYMIAROW.czescUrlopuMatki,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Część urlopu macierzyńskiego wykorzystywana przez matkę',
    warianty: [
      { klucz: 'tygodnie', etykieta: 'Co najmniej po porodzie', jednostka: 'tygodnie' },
      {
        klucz: 'przejecieWSytuacjiSzczegolnej',
        etykieta: 'Co najmniej przy przejęciu urlopu przez ojca w sytuacji szczególnej',
        jednostka: 'tygodnie',
      },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { tygodnie: 14, przejecieWSytuacjiSzczegolnej: 8 } }],
    szablonOpisu:
      'co najmniej {tygodnie} tygodni po porodzie, a przy przejęciu urlopu przez ojca w sytuacji szczególnej co najmniej {przejecieWSytuacjiSzczegolnej} tygodni',
    edytowalny: true,
    kolejnosc: 3,
  },
  {
    id: ID_WYMIAROW.urlopPoStracieDziecka,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Urlop macierzyński po urodzeniu martwego dziecka albo zgonie dziecka',
    warianty: [
      { klucz: 'poPorodzie', etykieta: 'Po porodzie', jednostka: 'tygodnie' },
      { klucz: 'odZgonu', etykieta: 'Nie krócej niż od zgonu', jednostka: 'dni' },
      { klucz: 'odZgonuPoOsmymTygodniu', etykieta: 'Od zgonu po 8 tygodniach życia', jednostka: 'dni' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { poPorodzie: 8, odZgonu: 7, odZgonuPoOsmymTygodniu: 7 } }],
    szablonOpisu:
      '{poPorodzie} tygodni po porodzie, nie krócej niż {odZgonu} dni od zgonu, a przy zgonie po {poPorodzie} tygodniach życia {odZgonuPoOsmymTygodniu} dni od zgonu',
    edytowalny: true,
    kolejnosc: 4,
  },
  {
    id: ID_WYMIAROW.uzupelniajacyUrlopMacierzynski,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Uzupełniający urlop macierzyński',
    warianty: [
      {
        klucz: 'przedwczesnyPorod',
        etykieta: 'Najwyżej przy porodzie przed ukończeniem granicznego tygodnia ciąży albo przy granicznej masie urodzeniowej',
        jednostka: 'tygodnie',
      },
      { klucz: 'tydzienCiazy', etykieta: 'Graniczny tydzień ciąży', jednostka: 'tygodnie' },
      { klucz: 'masaUrodzeniowa', etykieta: 'Graniczna masa urodzeniowa', jednostka: 'g' },
      { klucz: 'pozostale', etykieta: 'Najwyżej w pozostałych przypadkach', jednostka: 'tygodnie' },
      // Art. 180^2 Kodeksu pracy (gov.pl, Ministerstwo Rodziny, Pracy i Polityki Społecznej, pytania i odpowiedzi
      // o uzupełniającym urlopie macierzyńskim): poród przed ukończeniem 37. tygodnia ciąży daje 8 tygodni za pobyt
      // do upływu 8. tygodnia po porodzie, a poród w terminie wymaga pobytu co najmniej 2 kolejnych dni, z pierwszym
      // dniem między 5. a 28. dniem po porodzie, liczonego od 5. dnia do upływu 8. tygodnia po porodzie.
      { klucz: 'tydzienPoroduWTerminie', etykieta: 'Tydzień ciąży, od którego poród jest porodem w terminie', jednostka: 'tygodnie' },
      { klucz: 'poczatekPobytuOd', etykieta: 'Przy porodzie w terminie pierwszy dzień pobytu najwcześniej w dniu po porodzie', jednostka: 'dni' },
      { klucz: 'poczatekPobytuDo', etykieta: 'Przy porodzie w terminie pierwszy dzień pobytu najpóźniej w dniu po porodzie', jednostka: 'dni' },
      { klucz: 'najkrotszyPobyt', etykieta: 'Przy porodzie w terminie najkrótszy pobyt w kolejnych dniach', jednostka: 'dni' },
    ],
    wersje: [
      {
        od: OD_UZUPELNIAJACEGO_URLOPU,
        wartosci: {
          przedwczesnyPorod: 15,
          tydzienCiazy: 28,
          masaUrodzeniowa: 1000,
          pozostale: 8,
          tydzienPoroduWTerminie: 37,
          poczatekPobytuOd: 5,
          poczatekPobytuDo: 28,
          najkrotszyPobyt: 2,
        },
      },
    ],
    szablonOpisu:
      'do {przedwczesnyPorod} tygodni przy porodzie przed ukończeniem {tydzienCiazy}. tygodnia ciąży albo masie urodzeniowej do {masaUrodzeniowa} g, do {pozostale} tygodni w pozostałych przypadkach, a przy porodzie od {tydzienPoroduWTerminie}. tygodnia ciąży przy pobycie co najmniej {najkrotszyPobyt} kolejnych dni rozpoczętym między {poczatekPobytuOd}. a {poczatekPobytuDo}. dniem po porodzie, tydzień urlopu za każdy rozpoczęty tydzień pobytu dziecka w szpitalu',
    edytowalny: true,
    kolejnosc: 5,
  },
  {
    id: ID_WYMIAROW.urlopNaWarunkachMacierzynskiego,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Urlop na warunkach urlopu macierzyńskiego',
    warianty: [
      { klucz: 'jednoDziecko', etykieta: 'Przy przyjęciu jednego dziecka', jednostka: 'tygodnie' },
      { klucz: 'dwojeDzieci', etykieta: 'Przy jednoczesnym przyjęciu dwojga dzieci', jednostka: 'tygodnie' },
      { klucz: 'trojeDzieci', etykieta: 'Przy jednoczesnym przyjęciu trojga dzieci', jednostka: 'tygodnie' },
      { klucz: 'czworoDzieci', etykieta: 'Przy jednoczesnym przyjęciu czworga dzieci', jednostka: 'tygodnie' },
      { klucz: 'piecioroDzieci', etykieta: 'Przy jednoczesnym przyjęciu pięciorga i więcej dzieci', jednostka: 'tygodnie' },
      { klucz: 'minimum', etykieta: 'Co najmniej', jednostka: 'tygodnie' },
    ],
    wersje: [
      {
        od: OD_URUCHOMIENIA,
        wartosci: { jednoDziecko: 20, dwojeDzieci: 31, trojeDzieci: 33, czworoDzieci: 35, piecioroDzieci: 37, minimum: 9 },
      },
    ],
    szablonOpisu:
      '{jednoDziecko} tygodni przy jednym dziecku, {dwojeDzieci}, {trojeDzieci}, {czworoDzieci} i {piecioroDzieci} tygodni przy jednoczesnym przyjęciu dwojga, trojga, czworga oraz pięciorga i więcej dzieci, co najmniej {minimum} tygodni',
    edytowalny: true,
    kolejnosc: 6,
  },
  {
    id: ID_WYMIAROW.wiekDzieckaUrlopNaWarunkach,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Wiek dziecka uprawniający do urlopu na warunkach urlopu macierzyńskiego',
    warianty: [
      { klucz: 'rodzinaZastepczaNiezawodowa', etykieta: 'W rodzinie zastępczej niezawodowej', jednostka: 'lata' },
      { klucz: 'odroczonyObowiazekSzkolny', etykieta: 'Przy odroczonym obowiązku szkolnym', jednostka: 'lata' },
      { klucz: 'przysposobienie', etykieta: 'Przy przysposobieniu', jednostka: 'lata' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { rodzinaZastepczaNiezawodowa: 7, odroczonyObowiazekSzkolny: 10, przysposobienie: 14 } }],
    szablonOpisu:
      'do {rodzinaZastepczaNiezawodowa} lat w rodzinie zastępczej niezawodowej, do {odroczonyObowiazekSzkolny} lat przy odroczonym obowiązku szkolnym, do {przysposobienie} lat przy przysposobieniu',
    edytowalny: true,
    kolejnosc: 7,
  },
  {
    id: ID_WYMIAROW.urlopRodzicielski,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Urlop rodzicielski',
    warianty: [
      { klucz: 'jednoDziecko', etykieta: 'Przy jednym dziecku', jednostka: 'tygodnie' },
      { klucz: 'wiecejDzieci', etykieta: 'Przy więcej niż jednym dziecku', jednostka: 'tygodnie' },
      { klucz: 'jednoDzieckoZaZyciem', etykieta: 'Przy jednym dziecku z zaświadczeniem „Za życiem”', jednostka: 'tygodnie' },
      {
        klucz: 'wiecejDzieciZaZyciem',
        etykieta: 'Przy więcej niż jednym dziecku z zaświadczeniem „Za życiem”',
        jednostka: 'tygodnie',
      },
      {
        klucz: 'poUrlopieNaWarunkach',
        etykieta: 'Po urlopie na warunkach urlopu macierzyńskiego w wymiarze 9 tygodni',
        jednostka: 'tygodnie',
      },
      {
        klucz: 'poUrlopieNaWarunkachZaZyciem',
        etykieta: 'Po urlopie na warunkach urlopu macierzyńskiego w wymiarze 9 tygodni, z zaświadczeniem „Za życiem”',
        jednostka: 'tygodnie',
      },
    ],
    wersje: [
      {
        od: OD_URUCHOMIENIA,
        wartosci: {
          jednoDziecko: 41,
          wiecejDzieci: 43,
          jednoDzieckoZaZyciem: 65,
          wiecejDzieciZaZyciem: 67,
          poUrlopieNaWarunkach: 38,
          poUrlopieNaWarunkachZaZyciem: 62,
        },
      },
    ],
    szablonOpisu:
      '{jednoDziecko} tygodni przy jednym dziecku i {wiecejDzieci} przy więcej niż jednym, z zaświadczeniem „Za życiem” {jednoDzieckoZaZyciem} i {wiecejDzieciZaZyciem} tygodni, a po urlopie na warunkach urlopu macierzyńskiego w wymiarze 9 tygodni {poUrlopieNaWarunkach} tygodni, z zaświadczeniem „Za życiem” {poUrlopieNaWarunkachZaZyciem} tygodnie',
    edytowalny: true,
    kolejnosc: 8,
  },
  {
    id: ID_WYMIAROW.nieprzenoszalnaCzescUrlopuRodzicielskiego,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Nieprzenoszalna część urlopu rodzicielskiego',
    warianty: [{ klucz: 'tygodnie', etykieta: 'Dla każdego rodzica', jednostka: 'tygodnie' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { tygodnie: 9 } }],
    szablonOpisu: '{tygodnie} tygodni dla każdego rodzica',
    edytowalny: true,
    kolejnosc: 9,
  },
  {
    id: ID_WYMIAROW.liczbaCzesciUrlopuRodzicielskiego,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Liczba części urlopu rodzicielskiego',
    warianty: [{ klucz: 'czesci', etykieta: 'Najwyżej', jednostka: 'czesci' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { czesci: 5 } }],
    szablonOpisu: 'najwyżej {czesci}',
    edytowalny: true,
    kolejnosc: 10,
  },
  {
    id: ID_WYMIAROW.wykorzystanieUrlopuRodzicielskiego,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Wykorzystanie urlopu rodzicielskiego',
    warianty: [{ klucz: 'lata', etykieta: 'Do końca roku, w którym dziecko kończy', jednostka: 'lata' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { lata: 6 } }],
    szablonOpisu: 'do 31 grudnia roku, w którym dziecko kończy {lata} lat',
    edytowalny: true,
    kolejnosc: 11,
  },
  {
    id: ID_WYMIAROW.urlopRodzicielskiZPraca,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Urlop rodzicielski przy łączeniu z pracą',
    warianty: [
      { klucz: 'wymiarPracy', etykieta: 'Najwyższy wymiar pracy', jednostka: 'procent-etatu' },
      { klucz: 'jednoDziecko', etykieta: 'Wydłużenie przy jednym dziecku', jednostka: 'tygodnie' },
      { klucz: 'wiecejDzieci', etykieta: 'Wydłużenie przy więcej niż jednym dziecku', jednostka: 'tygodnie' },
      { klucz: 'jednoDzieckoZaZyciem', etykieta: 'Wydłużenie przy jednym dziecku z zaświadczeniem „Za życiem”', jednostka: 'tygodnie' },
      {
        klucz: 'wiecejDzieciZaZyciem',
        etykieta: 'Wydłużenie przy więcej niż jednym dziecku z zaświadczeniem „Za życiem”',
        jednostka: 'tygodnie',
      },
    ],
    wersje: [
      {
        od: OD_URUCHOMIENIA,
        wartosci: { wymiarPracy: 50, jednoDziecko: 82, wiecejDzieci: 86, jednoDzieckoZaZyciem: 130, wiecejDzieciZaZyciem: 134 },
      },
    ],
    szablonOpisu:
      'wymiar pracy najwyżej połowa etatu, wydłużenie urlopu do {jednoDziecko} tygodni przy jednym dziecku i {wiecejDzieci} przy więcej niż jednym, z zaświadczeniem „Za życiem” do {jednoDzieckoZaZyciem} i {wiecejDzieciZaZyciem} tygodni',
    edytowalny: true,
    kolejnosc: 12,
  },
  {
    id: ID_WYMIAROW.urlopOjcowski,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Urlop ojcowski',
    warianty: [
      { klucz: 'dni', etykieta: 'Wymiar urlopu', jednostka: 'dni' },
      { klucz: 'czesci', etykieta: 'Najwyższa liczba części', jednostka: 'czesci' },
      { klucz: 'dniCzesci', etykieta: 'Najkrótsza część', jednostka: 'dni' },
      { klucz: 'wiekDzieckaMiesiace', etykieta: 'Do ukończenia przez dziecko', jednostka: 'miesiace' },
      { klucz: 'odPrzysposobieniaMiesiace', etykieta: 'Od uprawomocnienia się orzeczenia o przysposobieniu', jednostka: 'miesiace' },
      { klucz: 'wiekGranicznyLata', etykieta: 'Nie dłużej niż do ukończenia przez dziecko', jednostka: 'lata' },
    ],
    wersje: [
      {
        od: OD_URUCHOMIENIA,
        wartosci: { dni: 14, czesci: 2, dniCzesci: 7, wiekDzieckaMiesiace: 12, odPrzysposobieniaMiesiace: 12, wiekGranicznyLata: 14 },
      },
    ],
    szablonOpisu:
      '{dni} dni, jednorazowo albo w {czesci} częściach po co najmniej {dniCzesci} dni, do ukończenia przez dziecko {wiekDzieckaMiesiace} miesięcy albo do upływu {odPrzysposobieniaMiesiace} miesięcy od uprawomocnienia się orzeczenia o przysposobieniu, nie dłużej niż do ukończenia przez dziecko {wiekGranicznyLata} lat',
    edytowalny: true,
    kolejnosc: 13,
  },
  {
    id: ID_WYMIAROW.urlopWychowawczy,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Urlop wychowawczy',
    warianty: [
      { klucz: 'miesiace', etykieta: 'Łącznie dla obojga rodziców', jednostka: 'miesiace' },
      { klucz: 'wylacznie', etykieta: 'Wyłącznie dla każdego rodzica', jednostka: 'miesiace' },
      { klucz: 'czesci', etykieta: 'Najwyższa liczba części', jednostka: 'czesci' },
      { klucz: 'lata', etykieta: 'Wykorzystanie do 31 grudnia roku, w którym dziecko kończy', jednostka: 'lata' },
      {
        klucz: 'niepelnosprawnosc',
        etykieta: 'Na dziecko z orzeczeniem o niepełnosprawności, niezależnie',
        jednostka: 'miesiace',
      },
      {
        klucz: 'wiekNiepelnosprawnosc',
        etykieta: 'Wiek dziecka z orzeczeniem o niepełnosprawności',
        jednostka: 'lata',
      },
    ],
    wersje: [
      {
        od: OD_URUCHOMIENIA,
        wartosci: { miesiace: 36, wylacznie: 1, czesci: 5, lata: 6, niepelnosprawnosc: 36, wiekNiepelnosprawnosc: 18 },
      },
    ],
    szablonOpisu:
      'do {miesiace} miesięcy łącznie dla obojga rodziców, z czego {wylacznie} miesiąc wyłącznie dla każdego rodzica, a do {miesiace} miesięcy dla jednego rodzica, gdy drugi rodzic nie żyje albo nie ma władzy rodzicielskiej, najwyżej w {czesci} częściach, do 31 grudnia roku, w którym dziecko kończy {lata} lat, a niezależnie do {niepelnosprawnosc} miesięcy na dziecko z orzeczeniem o niepełnosprawności, do ukończenia przez dziecko {wiekNiepelnosprawnosc} lat',
    edytowalny: true,
    kolejnosc: 13.1,
  },
  {
    id: ID_WYMIAROW.okresZatrudnieniaUrlopWychowawczy,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Okres zatrudnienia uprawniający do urlopu wychowawczego',
    warianty: [{ klucz: 'miesiace', etykieta: 'Okres zatrudnienia', jednostka: 'miesiace' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { miesiace: 6 } }],
    szablonOpisu: '{miesiace} miesięcy z wliczeniem poprzednich okresów zatrudnienia',
    edytowalny: true,
    kolejnosc: 13.2,
  },
  {
    id: ID_WYMIAROW.obnizenieWymiaruUrlopWychowawczy,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Obniżenie wymiaru czasu pracy w okresie urlopu wychowawczego',
    warianty: [
      { klucz: 'dni', etykieta: 'Wniosek najpóźniej przed rozpoczęciem pracy w obniżonym wymiarze', jednostka: 'dni' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { dni: 21 } }],
    szablonOpisu:
      'do co najmniej połowy pełnego wymiaru czasu pracy, wniosek co najmniej {dni} dni przed rozpoczęciem pracy w obniżonym wymiarze',
    edytowalny: true,
    kolejnosc: 13.3,
  },
  {
    id: ID_WYMIAROW.okresSwiadczeniaRodzicielskiego,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Okres świadczenia rodzicielskiego',
    warianty: [
      { klucz: 'jednoDziecko', etykieta: 'Przy jednym dziecku', jednostka: 'tygodnie' },
      { klucz: 'dwojeDzieci', etykieta: 'Przy dwojgu dzieci', jednostka: 'tygodnie' },
      { klucz: 'trojeDzieci', etykieta: 'Przy trojgu dzieci', jednostka: 'tygodnie' },
      { klucz: 'czworoDzieci', etykieta: 'Przy czworgu dzieci', jednostka: 'tygodnie' },
      { klucz: 'piecioroDzieci', etykieta: 'Przy pięciorgu i więcej dzieciach', jednostka: 'tygodnie' },
    ],
    wersje: [
      { od: OD_URUCHOMIENIA, wartosci: { jednoDziecko: 52, dwojeDzieci: 65, trojeDzieci: 67, czworoDzieci: 69, piecioroDzieci: 71 } },
    ],
    szablonOpisu:
      '{jednoDziecko} tygodnie przy jednym dziecku, {dwojeDzieci} przy dwojgu, {trojeDzieci} przy trojgu, {czworoDzieci} przy czworgu i {piecioroDzieci} przy pięciorgu i więcej dzieciach urodzonych przy jednym porodzie, przysposobionych albo objętych opieką',
    edytowalny: true,
    kolejnosc: 13.4,
  },
  {
    id: ID_WYMIAROW.wydluzenieOkresuSwiadczeniaRodzicielskiego,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Wydłużenie okresu świadczenia rodzicielskiego',
    warianty: [],
    wersje: [{ od: OD_UZUPELNIAJACEGO_URLOPU, wartosci: {} }],
    szablonOpisu:
      'tydzień za każdy tydzień pobytu dziecka w szpitalu na zasadach uzupełniającego urlopu macierzyńskiego, na wniosek złożony najpóźniej w ostatnim dniu miesiąca następującego po upływie okresu świadczenia rodzicielskiego',
    edytowalny: false,
    kolejnosc: 13.5,
  },
  {
    id: ID_WYMIAROW.terminWnioskuWariant815,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Termin wniosku w wariancie 81,5%',
    warianty: [{ klucz: 'dni', etykieta: 'Od porodu albo od przyjęcia dziecka na wychowanie', jednostka: 'dni' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { dni: 21 } }],
    szablonOpisu: '{dni} dni od porodu albo od przyjęcia dziecka na wychowanie',
    edytowalny: true,
    kolejnosc: 14,
  },
  {
    id: ID_WYMIAROW.okresWyczekiwania,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Okres wyczekiwania na zasiłek chorobowy',
    warianty: [
      { klucz: 'obowiazkowe', etykieta: 'Nieprzerwane ubezpieczenie obowiązkowe', jednostka: 'dni' },
      { klucz: 'dobrowolne', etykieta: 'Nieprzerwane ubezpieczenie dobrowolne', jednostka: 'dni' },
      { klucz: 'przerwa', etykieta: 'Najdłuższa przerwa, przy której wliczamy poprzedni okres ubezpieczenia', jednostka: 'dni' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { obowiazkowe: 30, dobrowolne: 90, przerwa: 30 } }],
    szablonOpisu:
      '{obowiazkowe} dni nieprzerwanego ubezpieczenia obowiązkowego, {dobrowolne} dni nieprzerwanego ubezpieczenia dobrowolnego, z wliczeniem poprzedniego okresu ubezpieczenia, gdy przerwa nie przekroczyła {przerwa} dni',
    edytowalny: true,
    reguly: ['okres-wyczekiwania'],
    kolejnosc: 15,
  },
  {
    id: ID_WYMIAROW.wyjatkiOdOkresuWyczekiwania,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Wyjątki od okresu wyczekiwania',
    warianty: [
      { klucz: 'dniOdUkonczeniaSzkoly', etykieta: 'Objęcie ubezpieczeniem od ukończenia szkoły albo uczelni', jednostka: 'dni' },
      { klucz: 'lataUbezpieczenia', etykieta: 'Wcześniejszy okres obowiązkowego ubezpieczenia chorobowego', jednostka: 'lata' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { dniOdUkonczeniaSzkoly: 90, lataUbezpieczenia: 10 } }],
    szablonOpisu:
      'prawo do zasiłku chorobowego od pierwszego dnia ubezpieczenia dla absolwenta objętego ubezpieczeniem chorobowym w ciągu {dniOdUkonczeniaSzkoly} dni od ukończenia szkoły albo uczelni i dla osoby ubezpieczonej obowiązkowo z wcześniejszym okresem obowiązkowego ubezpieczenia chorobowego wynoszącym co najmniej {lataUbezpieczenia} lat',
    edytowalny: true,
    reguly: ['wyjatki-wyczekiwania'],
    kolejnosc: 16,
  },
  {
    id: ID_WYMIAROW.okresZasilkowy,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Okres zasiłkowy',
    warianty: [
      { klucz: 'podstawowy', etykieta: 'Okres zasiłkowy', jednostka: 'dni' },
      { klucz: 'ciaza', etykieta: 'Gdy niezdolność do pracy przypada w ciąży', jednostka: 'dni' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { podstawowy: 182, ciaza: 270 } }],
    szablonOpisu: '{podstawowy} dni, a gdy niezdolność do pracy przypada w ciąży, {ciaza} dni',
    edytowalny: true,
    reguly: ['okres-zasilkowy'],
    kolejnosc: 17,
  },
  {
    id: ID_WYMIAROW.przerwaWNiezdolnosci,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Przerwa w niezdolności do pracy w jednym okresie zasiłkowym',
    warianty: [{ klucz: 'dni', etykieta: 'Najdłuższa przerwa', jednostka: 'dni' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { dni: 60 } }],
    szablonOpisu: '{dni} dni',
    edytowalny: true,
    reguly: ['okres-zasilkowy'],
    kolejnosc: 18,
  },
  {
    id: ID_WYMIAROW.zasilekPoUstaniu,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Zasiłek chorobowy po ustaniu ubezpieczenia',
    warianty: [
      { klucz: 'dniOdUstania', etykieta: 'Powstanie niezdolności do pracy najpóźniej od ustania ubezpieczenia', jednostka: 'dni' },
      { klucz: 'nieprzerwanaNiezdolnosc', etykieta: 'Nieprzerwana niezdolność do pracy co najmniej', jednostka: 'dni' },
      { klucz: 'najdluzszyOkres', etykieta: 'Zasiłek najwyżej przez', jednostka: 'dni' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { dniOdUstania: 14, nieprzerwanaNiezdolnosc: 30, najdluzszyOkres: 91 } }],
    szablonOpisu:
      'niezdolność do pracy powstała najpóźniej {dniOdUstania}. dnia od ustania ubezpieczenia i trwająca bez przerwy co najmniej {nieprzerwanaNiezdolnosc} dni, zasiłek najwyżej przez {najdluzszyOkres} dni, a za niezdolność do pracy w ciąży do wyczerpania okresu zasiłkowego',
    edytowalny: true,
    reguly: ['zasilek-po-ustaniu'],
    kolejnosc: 19,
  },
  {
    id: ID_WYMIAROW.wynagrodzenieChorobowe,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Wynagrodzenie chorobowe pracownika',
    warianty: [
      { klucz: 'dni', etykieta: 'Dni niezdolności do pracy w roku kalendarzowym', jednostka: 'dni' },
      { klucz: 'wiek', etykieta: 'Wiek, po którego ukończeniu obowiązuje krótszy okres', jednostka: 'lata' },
      { klucz: 'dniPoUkonczeniuWieku', etykieta: 'Dni od roku następującego po roku ukończenia wieku', jednostka: 'dni' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { dni: 33, wiek: 50, dniPoUkonczeniuWieku: 14 } }],
    szablonOpisu:
      '{dni} dni niezdolności do pracy w roku kalendarzowym, a od roku następującego po roku ukończenia {wiek} lat {dniPoUkonczeniuWieku} dni',
    edytowalny: true,
    reguly: ['wynagrodzenie-chorobowe'],
    kolejnosc: 20,
  },
  {
    id: ID_WYMIAROW.swiadczenieRehabilitacyjneOkres,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Świadczenie rehabilitacyjne',
    warianty: [{ klucz: 'miesiace', etykieta: 'Najdłuższy okres', jednostka: 'miesiace' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { miesiace: 12 } }],
    szablonOpisu: 'najwyżej {miesiace} miesięcy',
    edytowalny: true,
    reguly: ['swiadczenie-rehabilitacyjne'],
    kolejnosc: 21,
  },
  {
    id: ID_WYMIAROW.okresSplatyZadluzenia,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Okres spłaty zadłużenia z tytułu składek',
    warianty: [{ klucz: 'miesiace', etykieta: 'Od dnia powstania prawa do świadczenia', jednostka: 'miesiace' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { miesiace: 6 } }],
    szablonOpisu: '{miesiace} miesięcy od dnia powstania prawa do świadczenia',
    edytowalny: true,
    reguly: ['zadluzenie'],
    kolejnosc: 22,
  },
  {
    id: ID_WYMIAROW.liczbaUbezpieczonychPlatnika,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Liczba ubezpieczonych płatnika, który wypłaca zasiłki',
    warianty: [
      { klucz: 'osoby', etykieta: 'Więcej niż, według stanu na 30 listopada poprzedniego roku', jednostka: 'osoby' },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { osoby: 20 } }],
    szablonOpisu:
      'więcej niż {osoby} osób zgłoszonych do ubezpieczenia chorobowego według stanu na 30 listopada poprzedniego roku',
    edytowalny: true,
    reguly: ['platnik-swiadczenia'],
    kolejnosc: 23,
  },
  {
    id: ID_WYMIAROW.zasilekPoUstaniuChorobaZakazna,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Zasiłek chorobowy po ustaniu ubezpieczenia przy chorobie zakaźnej',
    warianty: [
      {
        klucz: 'miesiace',
        etykieta: 'Powstanie niezdolności do pracy z kodem E najpóźniej od ustania ubezpieczenia',
        jednostka: 'miesiace',
      },
    ],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { miesiace: 3 } }],
    szablonOpisu:
      'niezdolność do pracy z powodu choroby zakaźnej, oznaczona na zaświadczeniu lekarskim kodem E, powstała najpóźniej {miesiace} miesiące od ustania ubezpieczenia',
    edytowalny: true,
    reguly: ['zasilek-po-ustaniu'],
    kolejnosc: 24,
  },
  // Podstawa wymiaru zasiłku: art. 36 ust. 1 i 2 ustawy z 25 czerwca 1999 r. o świadczeniach pieniężnych
  // z ubezpieczenia społecznego w razie choroby i macierzyństwa.
  {
    id: ID_WYMIAROW.okresPodstawyWymiaruZasilku,
    slownik: 'wymiary-i-okresy',
    nazwa: 'Okres, z którego liczymy podstawę wymiaru zasiłku',
    warianty: [{ klucz: 'miesiace', etykieta: 'Pełne miesiące kalendarzowe przed miesiącem powstania prawa', jednostka: 'miesiace' }],
    wersje: [{ od: OD_URUCHOMIENIA, wartosci: { miesiace: 12 } }],
    szablonOpisu:
      'przeciętne miesięczne wynagrodzenie albo przychód z {miesiace} pełnych miesięcy kalendarzowych przed miesiącem powstania prawa do zasiłku, a przy krótszym ubezpieczeniu z pełnych miesięcy ubezpieczenia',
    edytowalny: true,
    kolejnosc: 25,
  },
];
