// Reguły świadczeń z ubezpieczenia chorobowego (kontrakt, sekcja 8; ANALIZY/05 sekcja 4.1).
// Właściciel: u16. Treść reguł pochodzi dosłownie z Wspólnych wymagań epiku 3.5.2, a wpisy wskazują słowniki
// wymiarów i okresów oraz kwot i progów, z których reguła odczytuje wartość obowiązującą we wskazanym dniu.
// Plik importuje słowniki wyłącznie jako typy, bo skrypt spójności katalogu wczytuje go bez zależności.
import type { ID_KWOT } from '@/dane/katalog/slownik-kwot';
import type { ID_WYMIAROW } from '@/dane/katalog/slownik-wymiarow';
import type { RegulaSwiadczenia } from '@/domena/typy';

/** Identyfikator wpisu słownika kwot i progów albo słownika wymiarów i okresów. */
type IdWpisuKatalogu = (typeof ID_KWOT)[keyof typeof ID_KWOT] | (typeof ID_WYMIAROW)[keyof typeof ID_WYMIAROW];

/** Identyfikatory wpisów słowników, z których korzystają reguły świadczeń; typ zgłasza identyfikator spoza słowników. */
export const WPISY_REGUL = {
  okresWyczekiwania: 'okres-wyczekiwania-na-zasilek-chorobowy',
  wyjatkiWyczekiwania: 'wyjatki-od-okresu-wyczekiwania',
  wynagrodzenieChorobowe: 'wynagrodzenie-chorobowe-pracownika',
  wynagrodzenieWCiazy: 'wynagrodzenie-chorobowe-w-ciazy',
  zasilekChorobowyWCiazy: 'zasilek-chorobowy-w-ciazy',
  okresZasilkowy: 'okres-zasilkowy',
  przerwaWNiezdolnosci: 'przerwa-w-niezdolnosci-do-pracy',
  zasilekPoUstaniu: 'zasilek-chorobowy-po-ustaniu-ubezpieczenia',
  rehabilitacyjneOkres: 'swiadczenie-rehabilitacyjne-okres',
  rehabilitacyjneStawka: 'swiadczenie-rehabilitacyjne-stawki',
  zwzm: 'zasilek-w-wysokosci-zasilku-macierzynskiego',
  minimalnaPodstawa: 'minimalna-podstawa-wymiaru-zasilku-pelny-etat',
  zasilekMacierzynski: 'zasilek-macierzynski-wariant-81-5',
  progZadluzenia: 'prog-zadluzenia-z-tytulu-skladek-jdg',
  okresSplaty: 'okres-splaty-zadluzenia-z-tytulu-skladek',
  liczbaUbezpieczonych: 'liczba-ubezpieczonych-platnika-wyplacajacego-zasilki',
} as const satisfies Record<string, IdWpisuKatalogu>;

export const regulySwiadczen: readonly RegulaSwiadczenia[] = [
  {
    id: 'podleganie',
    nazwa: 'Podleganie ubezpieczeniu chorobowemu',
    tresc:
      'Pracownica podlega ubezpieczeniu chorobowemu obowiązkowo od dnia początku tytułu pracownika w danych konta ZUS do dnia jego końca. Zleceniobiorczyni i osoba prowadząca pozarolniczą działalność podlegają ubezpieczeniu chorobowemu dobrowolnie w okresie dobrowolnego ubezpieczenia chorobowego przy tytule w danych konta ZUS. Matka bez tytułu do ubezpieczenia i matka z tytułem bez ubezpieczenia chorobowego nie podlegają ubezpieczeniu chorobowemu.',
    wpisy: [],
  },
  {
    id: 'okres-wyczekiwania',
    nazwa: 'Okres wyczekiwania',
    tresc:
      'Prawo do zasiłku chorobowego powstaje po upływie 30 dni nieprzerwanego ubezpieczenia obowiązkowego albo 90 dni nieprzerwanego ubezpieczenia dobrowolnego, czyli od 31. albo od 91. dnia ubezpieczenia. Do okresu ubezpieczenia system wlicza poprzedni okres ubezpieczenia chorobowego, gdy przerwa między okresami nie przekroczyła 30 dni. Przerwę spowodowaną urlopem wychowawczym, urlopem bezpłatnym albo czynną służbą wojskową system pokazuje w oknie zastosowanych reguł jako warunek wliczenia poprzedniego okresu.',
    wpisy: [WPISY_REGUL.okresWyczekiwania],
  },
  {
    id: 'wyjatki-wyczekiwania',
    nazwa: 'Wyjątki od okresu wyczekiwania',
    tresc:
      'Prawo do zasiłku chorobowego od pierwszego dnia ubezpieczenia ma absolwent szkoły albo uczelni objęty ubezpieczeniem chorobowym w ciągu 90 dni od ukończenia szkoły albo uzyskania dyplomu oraz osoba ubezpieczona obowiązkowo, która ma wcześniejszy okres obowiązkowego ubezpieczenia chorobowego wynoszący łącznie co najmniej 10 lat. Wyjątek 10 lat system ustala z okresów ubezpieczenia w danych konta ZUS, a wyjątek absolwenta pokazuje w oknie zastosowanych reguł jako warunek przy wyniku z okresem wyczekiwania.',
    wpisy: [WPISY_REGUL.wyjatkiWyczekiwania],
  },
  {
    id: 'wynagrodzenie-chorobowe',
    nazwa: 'Wynagrodzenie chorobowe',
    tresc:
      'Pracownica za pierwsze 33 dni niezdolności do pracy w roku kalendarzowym, a od roku następującego po roku, w którym ukończyła 50 lat, za pierwsze 14 dni, otrzymuje od pracodawcy wynagrodzenie chorobowe, które za niezdolność do pracy w ciąży wynosi 100% wynagrodzenia. Wynagrodzenie chorobowe przysługuje na warunkach prawa do zasiłku chorobowego, w tym po okresie wyczekiwania. Rok ukończenia 50 lat system odczytuje z daty urodzenia zapisanej w numerze PESEL.',
    wpisy: [WPISY_REGUL.wynagrodzenieChorobowe, WPISY_REGUL.wynagrodzenieWCiazy],
  },
  {
    id: 'zasilek-chorobowy',
    nazwa: 'Zasiłek chorobowy',
    tresc:
      'Pracownicy zasiłek chorobowy przysługuje od 34. dnia niezdolności do pracy w roku kalendarzowym, a od roku następującego po roku ukończenia 50 lat od 15. dnia. Zleceniobiorczyni i osobie prowadzącej pozarolniczą działalność zasiłek przysługuje od pierwszego dnia niezdolności do pracy. Zasiłek przysługuje za okres niezdolności do pracy stwierdzonej w zaświadczeniu lekarskim e-ZLA, a za niezdolność do pracy w ciąży, którą zaświadczenie oznacza kodem literowym B, wynosi 100% podstawy wymiaru.',
    wpisy: [WPISY_REGUL.zasilekChorobowyWCiazy],
  },
  {
    id: 'okres-zasilkowy',
    nazwa: 'Okres zasiłkowy',
    tresc:
      'Zasiłek chorobowy przysługuje najdłużej przez okres zasiłkowy 182 dni, a gdy niezdolność do pracy przypada w ciąży, 270 dni. Do okresu zasiłkowego system wlicza dni wynagrodzenia chorobowego oraz poprzednie okresy niezdolności do pracy, gdy przerwa między nimi nie przekroczyła 60 dni, z wyjątkiem okresów sprzed takiej przerwy, gdy niezdolność po przerwie przypada w ciąży. Dni niezdolności do pracy w okresie wyczekiwania system pomija.',
    wpisy: [WPISY_REGUL.okresZasilkowy, WPISY_REGUL.przerwaWNiezdolnosci],
  },
  {
    id: 'zasilek-po-ustaniu',
    nazwa: 'Zasiłek po ustaniu ubezpieczenia',
    tresc:
      'Gdy niezdolność do pracy powstała w czasie ubezpieczenia chorobowego i trwa po jego ustaniu, zasiłek chorobowy przysługuje dalej, a gdy niezdolność przypada w ciąży, do wyczerpania okresu zasiłkowego 270 dni. Gdy niezdolność do pracy powstała po ustaniu ubezpieczenia, zasiłek przysługuje, jeżeli powstała najpóźniej 14. dnia od dnia ustania i trwała bez przerwy co najmniej 30 dni. Za okres po ustaniu ubezpieczenia zasiłek przysługuje najwyżej przez 91 dni, a za niezdolność do pracy w ciąży do wyczerpania okresu zasiłkowego. Zasiłek po ustaniu ubezpieczenia nie przysługuje osobie, która ma prawo do emerytury albo renty z tytułu niezdolności do pracy, kontynuuje albo podjęła działalność zarobkową stanowiącą tytuł do ubezpieczenia chorobowego, nie nabyła prawa do zasiłku w czasie ubezpieczenia z powodu okresu wyczekiwania albo ma prawo do zasiłku dla bezrobotnych. Nowy tytuł do ubezpieczenia chorobowego i okres wyczekiwania system sprawdza w danych konta ZUS, a pozostałe wyłączenia pokazuje w oknie zastosowanych reguł jako warunki.',
    wpisy: [WPISY_REGUL.zasilekPoUstaniu],
  },
  {
    id: 'swiadczenie-rehabilitacyjne',
    nazwa: 'Świadczenie rehabilitacyjne',
    tresc:
      'Świadczenie rehabilitacyjne przysługuje od dnia następującego po dniu wyczerpania okresu zasiłkowego, gdy matka jest nadal niezdolna do pracy, a dalsze leczenie albo rehabilitacja lecznicza rokują odzyskanie zdolności do pracy, o czym orzeka lekarz orzecznik ZUS. Przysługuje najdłużej przez 12 miesięcy w wysokości 90% podstawy wymiaru zasiłku chorobowego przez pierwsze 3 miesiące i 75% za pozostały okres, a gdy niezdolność do pracy przypada w ciąży, 100%. Świadczenie wypłaca płatnik zasiłku zgodnie z regułą Płatnik świadczenia. Świadczenie nie przysługuje osobie uprawnionej do emerytury, renty z tytułu niezdolności do pracy albo zasiłku dla bezrobotnych.',
    wpisy: [WPISY_REGUL.rehabilitacyjneOkres, WPISY_REGUL.rehabilitacyjneStawka],
  },
  {
    id: 'zwzm',
    nazwa: 'Zasiłek w wysokości zasiłku macierzyńskiego',
    tresc:
      'Pracownicy, z którą w ciąży rozwiązano umowę o pracę z powodu upadłości albo likwidacji pracodawcy albo której umowa o pracę wygasła z powodu śmierci pracodawcy i której nie zapewniono innego zatrudnienia, przysługuje od dnia następującego po dniu ustania umowy do dnia poprzedzającego dzień porodu zasiłek w wysokości zasiłku macierzyńskiego. Zasiłek wynosi 100% podstawy wymiaru bez podwyższenia do kwoty świadczenia rodzicielskiego, a podstawa wymiaru wynosi co najmniej minimalną podstawę wymiaru zasiłku pracownika na pełnym etacie, obecnie 4147,10 zł. Zasiłek wypłaca ZUS.',
    wpisy: [WPISY_REGUL.zwzm, WPISY_REGUL.minimalnaPodstawa],
  },
  {
    id: 'zasilek-macierzynski-bez-wyczekiwania',
    nazwa: 'Zasiłek macierzyński bez okresu wyczekiwania',
    tresc:
      'Zasiłek macierzyński przysługuje od dnia porodu bez okresu wyczekiwania, gdy poród nastąpi w okresie ubezpieczenia chorobowego. Gdy poród nastąpi po ustaniu ubezpieczenia chorobowego, zasiłek macierzyński przysługuje, jeżeli ubezpieczenie ustało w ciąży z powodu śmierci, upadłości albo likwidacji pracodawcy albo z naruszeniem przepisów stwierdzonym prawomocnym wyrokiem sądu, oraz pracownicy, której umowę na czas określony przedłużono do dnia porodu. Zasiłek macierzyński po ustaniu ubezpieczenia wypłaca ZUS. Stawkę zasiłku macierzyńskiego wyznacza wariant zasiłku macierzyńskiego.',
    wpisy: [WPISY_REGUL.zasilekMacierzynski],
  },
  {
    id: 'zadluzenie',
    nazwa: 'Zadłużenie z tytułu składek',
    tresc:
      'Osobie prowadzącej pozarolniczą działalność zasiłek chorobowy, świadczenie rehabilitacyjne i zasiłek macierzyński nie przysługują, gdy w dniu powstania prawa do świadczenia zadłużenie z tytułu składek na ubezpieczenia społeczne przekracza próg zadłużenia, obecnie 48,06 zł, do czasu spłaty całości zadłużenia. Spłata w ciągu 6 miesięcy od dnia powstania prawa daje świadczenie za cały okres. Gdy spłata następuje później, prawo do świadczenia za okres przed spłatą przedawnia się, a świadczenie przysługuje za dalszy okres od dnia spłaty. Zadłużenie objęte układem ratalnym albo odroczeniem terminu płatności, spłacane w terminach i w wysokości ustalonych w umowie, system traktuje jako brak zadłużenia, gdy całe zadłużenie z tytułu składek jest objęte umową.',
    wpisy: [WPISY_REGUL.progZadluzenia, WPISY_REGUL.okresSplaty],
  },
  {
    id: 'platnik-swiadczenia',
    nazwa: 'Płatnik świadczenia',
    tresc:
      'Wynagrodzenie chorobowe wypłaca pracodawca. Zasiłek chorobowy, świadczenie rehabilitacyjne i zasiłek macierzyński pracownicy i zleceniobiorczyni wypłaca płatnik składek, który zgłasza do ubezpieczenia chorobowego więcej niż 20 osób według stanu na 30 listopada poprzedniego roku, a gdy w tym dniu nie zgłaszał nikogo, według stanu w pierwszym miesiącu zgłoszenia, czyli płatnik uprawniony, a w pozostałych przypadkach ZUS. Osobie prowadzącej pozarolniczą działalność i osobie uprawnionej do świadczenia za okres po ustaniu ubezpieczenia świadczenie wypłaca ZUS. Płatnika zasiłku system odczytuje z danych rodziny, a płatnika nieustalonego pokazuje jako płatnika uprawnionego albo ZUS zależnie od liczby osób zgłaszanych do ubezpieczenia chorobowego.',
    wpisy: [WPISY_REGUL.liczbaUbezpieczonych],
  },
];
