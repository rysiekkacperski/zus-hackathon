// Kody i typy komunikatów z docs/03-user-stories/tablica-komunikatow.md (kolumny ID, Nazwa i Typ).
// Treści komunikatów leżą w teksty.komunikaty w src/teksty.ts.

// komunikaty.ts: zamknięta unia wszystkich 341 kodów tablicy komunikatów
export type KodKomunikatu =
  | '0001' // Brak połączenia z danymi konta ZUS
  | '0002' // Nieaktualne dane konta ZUS
  | '0003' // Błąd zapisu danych
  | '0004' // Brak zgody na dane dotyczące zdrowia
  | '0005' // Zgoda na dane dotyczące zdrowia wycofana
  | '0006' // Brak wyboru z listy
  | '0007' // Puste pole przewidywanego terminu porodu
  | '0008' // Przewidywany termin porodu w przeszłości
  | '0009' // Przewidywany termin porodu zbyt odległy
  | '0010' // Nieprawidłowy format daty
  | '0011' // Data wizyty u lekarza albo położnej w przyszłości
  | '0012' // Data wizyty u lekarza albo położnej przed początkiem ciąży
  | '0013' // Puste pole gminy
  | '0014' // Brak gminy na liście
  | '0015' // Puste pole dochodu na osobę
  | '0016' // Nieprawidłowa kwota
  | '0017' // Profil zapisany
  | '0018' // Puste pole daty porodu
  | '0019' // Data porodu w przyszłości
  | '0020' // Data porodu zbyt odległa
  | '0021' // Nieprawidłowy tydzień ciąży w dniu porodu
  | '0022' // Nieprawidłowa masa urodzeniowa
  | '0023' // Nieprawidłowa liczba dni hospitalizacji
  | '0024' // Puste pole numeru PESEL
  | '0025' // Nieprawidłowa liczba cyfr PESEL
  | '0026' // Nieprawidłowa cyfra kontrolna PESEL
  | '0027' // PESEL dziecka niezgodny z datą porodu
  | '0028' // Puste pole imienia
  | '0029' // Puste pole nazwiska
  | '0030' // Niedozwolone znaki w imieniu lub nazwisku
  | '0031' // Puste pole miejsca urodzenia
  | '0032' // Nowe dziecko w danych ZUS
  | '0033' // Sprawa oznaczona jako złożona albo załatwiona
  | '0034' // Cofnięcie oznaczenia sprawy
  | '0035' // Błąd otwarcia kanału instytucji
  | '0036' // Wniosek ZAM niedostępny dla pracownika
  | '0037' // Brak potwierdzonej daty porodu
  | '0038' // Minął termin na wariant 81,5%
  | '0039' // Puste pole numeru rachunku
  | '0040' // Nieprawidłowa liczba cyfr rachunku
  | '0041' // Nieprawidłowa suma kontrolna rachunku
  | '0042' // Data początku urlopu poza dopuszczalnym zakresem
  | '0043' // Brak potwierdzenia oświadczeń
  | '0044' // Błąd wysyłki wniosku do ZUS
  | '0045' // Wniosek wysłany do ZUS
  | '0046' // Wniosek przygotowany dla płatnika
  | '0047' // Brak uprawnień do katalogu
  | '0048' // Puste pole kwoty
  | '0049' // Nieprawidłowy okres obowiązywania
  | '0050' // Nakładający się okres obowiązywania
  | '0051' // Zmiana katalogu zapisana
  | '0052' // Nieprawidłowe wyprzedzenie przypomnienia
  | '0053' // Nieprawidłowy kod weryfikacyjny SMS
  | '0054' // Wygasły kod weryfikacyjny SMS
  | '0055' // Pobrany plik kalendarza
  | '0056' // Ustawienia przypomnień zapisane
  | '0057' // Data porodu potwierdzona
  | '0058' // Wniosek zapisany do dokończenia
  | '0059' // Puste pole adresu e-mail
  | '0060' // Nieprawidłowy adres e-mail
  | '0061' // Nieprawidłowa liczba tygodni urlopu
  | '0062' // Brak numeru PESEL dziecka
  | '0063' // Data porodu różna od danych ZUS
  | '0064' // Brak prawa do zasiłku macierzyńskiego
  | '0065' // Zaproszenie wysłane
  | '0066' // Zaproszenie wygasło
  | '0067' // Zaproszenie do własnej rodziny
  | '0068' // Konto należy już do innej rodziny
  | '0069' // Drugi rodzic dołączył
  | '0070' // Pytanie poza zakresem asystenta
  | '0071' // Asystent niedostępny
  | '0072' // Przerwane logowanie przez mObywatela
  | '0073' // Puste pole daty zmiany zatrudnienia
  | '0074' // Data zmiany zatrudnienia poza okresem ciąży
  | '0075' // Data ustania zatrudnienia przed datą rozpoczęcia
  | '0076' // Naruszenie przepisów bez prawomocnego wyroku
  | '0077' // Puste pole wymiaru
  | '0078' // Nieprawidłowy wymiar
  | '0079' // Nieprawidłowa stawka
  | '0080' // Puste pole tytułu pozycji katalogu
  | '0081' // Tytuł pozycji katalogu już istnieje
  | '0082' // Pozycja katalogu dodana
  | '0083' // Brak ubezpieczenia chorobowego w ciąży
  | '0084' // Okres wyczekiwania na zasiłek chorobowy
  | '0085' // Ubezpieczenie chorobowe ustało w ciąży
  | '0086' // Okres zasiłkowy wyczerpany
  | '0087' // Płatnik zasiłku nieustalony przy dokumentach
  | '0088' // Puste pole daty przyjęcia dziecka
  | '0089' // Data przyjęcia dziecka zbyt odległa
  | '0090' // Data urodzenia dziecka po dacie przyjęcia
  | '0091' // Wiek dziecka poza zakresem urlopu na warunkach urlopu macierzyńskiego
  | '0092' // Rodzina zastępcza zawodowa bez prawa do zasiłku
  | '0093' // Puste pole podstawy wymiaru
  | '0094' // Brak podstaw składek w danych ZUS
  | '0095' // Przekroczony wymiar urlopu rodzicielskiego
  | '0096' // Przekroczona liczba części urlopu rodzicielskiego
  | '0097' // Przejęcie urlopu macierzyńskiego przed upływem 14 tygodni
  | '0098' // Nieprawidłowy wymiar pracy przy urlopie rodzicielskim
  | '0099' // Łączenie urlopu rodzicielskiego z pracą dla pracownika
  | '0100' // Scenariusz zapisany w planie
  | '0101' // Kalkulator bez profilu rodziny
  | '0102' // Data zgonu dziecka przed datą porodu
  | '0103' // Nieobsługiwany format pliku
  | '0104' // Plik zbyt duży
  | '0105' // Nierozpoznany rodzaj dokumentu
  | '0106' // Nieczytelny dokument
  | '0107' // Dane odczytane z pomocą AI
  | '0108' // Odczyt dokumentu niedostępny
  | '0109' // Brak danych do weryfikacji ubezpieczenia
  | '0110' // Data końca okresu przed datą początku
  | '0111' // Wyliczenie zgodne z rozstrzygnięciem
  | '0112' // Wyliczenie różne od rozstrzygnięcia
  | '0113' // Dokument sprawy usunięty
  | '0114' // Brak zaświadczeń lekarskich e-ZLA
  | '0115' // Okres zasiłkowy bliski wyczerpania
  | '0116' // Zadłużenie z tytułu składek
  | '0117' // Brak zadłużenia z tytułu składek
  | '0118' // Zaświadczenie o niezaleganiu wydane
  | '0119' // Tytuł ubezpieczenia podjęty w ciąży
  | '0120' // Brak ubezpieczenia chorobowego w dniu porodu
  | '0121' // Umowa przedłużona do dnia porodu
  | '0122' // Puste pole nazwy organizacji
  | '0123' // Nieprawidłowy adres strony organizacji
  | '0124' // Nieprawidłowy numer telefonu
  | '0125' // Data uprawomocnienia przysposobienia w przyszłości
  | '0126' // Sytuacja szczególna zapisana
  | '0127' // Data zdarzenia w przyszłości
  | '0128' // Spokojny tryb wyłączony
  | '0129' // Puste pole treści pytania
  | '0130' // Pytanie zbyt długie
  | '0131' // Pytanie wysłane do ZUS
  | '0132' // Odpowiedź ZUS na pytanie
  | '0133' // Brak połączenia z PUE/eZUS
  | '0134' // Puste pole adresu e-mail pracodawcy
  | '0135' // Wniosek wysłany do pracodawcy
  | '0136' // Wniosek o urlop rodzicielski później niż 21 dni przed urlopem
  | '0137' // Wniosek o urlop ojcowski później niż 7 dni przed urlopem
  | '0138' // Błąd wysyłki wniosku do pracodawcy
  | '0139' // Wniosek o urlop gotowy do pobrania
  | '0140' // Wniosek o urlop dla pracownika
  | '0141' // Rezygnacja przed upływem 14 tygodni
  | '0142' // Rezygnacja później niż 7 dni przed powrotem
  | '0143' // Rezygnacja złożona
  | '0144' // Brak dokumentu sytuacji szczególnej
  | '0145' // Wniosek o odpis aktu urodzenia złożony
  | '0146' // Brak aktu urodzenia w rejestrze
  | '0147' // Brak połączenia z rejestrem stanu cywilnego
  | '0148' // Odpowiedź asystenta AI
  | '0149' // Załączniki do wniosku
  | '0150' // Stan rozliczeń składek niedostępny
  | '0151' // Puste pole stawki
  | '0152' // Puste pole instytucji i kanału
  | '0153' // Nieprawidłowe przesunięcie terminu
  | '0154' // Zadłużenie z tytułu składek ponad próg przy świadczeniu
  | '0155' // Prawo do świadczenia zależne od opłacenia składek
  | '0156' // Świadczenia w ciąży ustalone z profilu rodziny
  | '0157' // Umowa bez przedłużenia do dnia porodu
  | '0158' // Okres szczególnej ochrony pracownika
  | '0159' // Brak podmiotów wsparcia dla sytuacji
  | '0160' // Puste pole zakresu pomocy organizacji
  | '0161' // Organizacja istniejąca w słowniku
  | '0162' // Brak potwierdzenia charakteru charytatywnego organizacji
  | '0163' // Puste pole daty urodzenia dziecka
  | '0164' // Nieprawidłowa liczba dni pobytu dziecka w szpitalu
  | '0165' // Minął termin na wariant 81,5% po przyjęciu dziecka
  | '0166' // Wyliczenie po stracie dziecka
  | '0167' // Puste pole daty zgonu dziecka
  | '0168' // Nieprawidłowa liczba dzieci, których dotyczy strata
  | '0169' // Przejęcie urlopu macierzyńskiego przed upływem 8 tygodni
  | '0170' // Nieprawidłowa liczba scenariuszy do porównania
  | '0171' // Zapisanie scenariusza przykładowej sprawy
  | '0172' // Urlop rodzicielski po osiągnięciu wieku przez dziecko
  | '0173' // Brak danych ZUS drugiego rodzica
  | '0174' // Wyrównanie zasiłku do 100%
  | '0175' // Puste pole daty początku urlopu
  | '0176' // Puste pole daty końca pobytu matki w szpitalu
  | '0177' // Wynik weryfikacji zgodny z rozstrzygnięciem
  | '0178' // Wynik weryfikacji różny od rozstrzygnięcia
  | '0179' // Przykładowa sprawa usunięta
  | '0180' // Brak rozstrzygnięcia sprawy do porównania
  | '0181' // Zastąpiony dokument tego samego rodzaju
  | '0182' // Zadłużenie z tytułu składek przekraczające próg
  | '0183' // Zadłużenie z tytułu składek nieprzekraczające progu
  | '0184' // Układ ratalny albo odroczenie spłacane terminowo
  | '0185' // Zadłużenie niespłacone w ciągu 6 miesięcy
  | '0186' // Zadłużenie spłacone w ciągu 6 miesięcy
  | '0187' // Stan rozliczeń na dzień powstania prawa w przyszłości
  | '0188' // Puste pole dnia stanu rozliczeń
  | '0189' // Dzień stanu rozliczeń w przyszłości
  | '0190' // Dzień stanu rozliczeń przed rozpoczęciem działalności
  | '0191' // Data urodzenia dziecka w przyszłości
  | '0192' // Brak daty uprawomocnienia przysposobienia
  | '0193' // Puste pole daty zdarzenia
  | '0194' // Poronienie potwierdzone zaświadczeniem o martwym urodzeniu
  | '0195' // Puste pole adresu do doręczenia
  | '0196' // Brak kodu pocztowego w adresie
  | '0197' // Pierwszy odpis skrócony bezpłatnie
  | '0198' // Odpis wielojęzyczny w formie papierowej
  | '0199' // Wniosek o urlop wysłany przed okresem ochrony
  | '0200' // Wniosek o łączenie urlopu rodzicielskiego z pracą wysłany
  | '0201' // Puste pole daty we wniosku o urlop
  | '0202' // Nieprawidłowa liczba dni urlopu
  | '0203' // Wniosek o uzupełniający urlop macierzyński później niż 21 dni przed końcem urlopu macierzyńskiego
  | '0204' // Wniosek o urlop na warunkach urlopu macierzyńskiego później niż 7 dni od przyjęcia dziecka
  | '0205' // Wniosek o łączenie urlopu rodzicielskiego z pracą później niż 21 dni przed podjęciem pracy
  | '0206' // Rezygnacja bez drugiego rodzica w profilu
  | '0207' // Rezygnacja z części zasiłku macierzyńskiego w eZUS
  | '0208' // Wniosek o pozostałą część urlopu macierzyńskiego później niż 14 dni przed urlopem
  | '0209' // Rezygnacja z orzeczeniem przed upływem 8 tygodni
  | '0210' // Sytuacja szczególna przed upływem 8 tygodni od porodu
  | '0211' // PESEL dziecka niezgodny z datą urodzenia przyjętego dziecka
  | '0212' // Wygaśnięcie sesji
  | '0213' // Puste pole numeru telefonu
  | '0214' // Brak wybranego kanału przypomnień
  | '0215' // Wysłany kod weryfikacyjny SMS
  | '0216' // Brak terminów do pobrania
  | '0217' // Nieprawidłowy format kodu weryfikacyjnego
  | '0218' // Brak adresu do przypomnień
  | '0219' // Dane drugiego rodzica pobrane z pełnomocnictwa
  | '0220' // Pełnomocnictwo PEL odwołane
  | '0221' // Pełnomocnictwo PEL wygasło
  | '0222' // Pełnomocnictwo PEL ograniczone do korespondencji
  | '0223' // Brak pełnomocnictwa PEL od drugiego rodzica
  | '0224' // Pełnomocnictwo PEL od przyszłej daty
  | '0225' // Rozstrzygnięcie uzupełnione ze zrzutu z systemu ZUS
  | '0226' // Początek zasiłku wcześniej niż 6 tygodni przed terminem porodu
  | '0227' // Brak zaświadczenia o przewidywanej dacie porodu w przykładowej sprawie
  | '0228' // Brak zaświadczenia o przewidywanej dacie porodu
  | '0229' // Wniosek przed porodem
  | '0230' // Wniosek przed porodem przygotowany dla płatnika
  | '0231' // Dane dziecka do przekazania ZUS
  | '0232' // Dane dziecka przekazane ZUS
  | '0233' // Wniosek ZAS-53 dla pracownika i zleceniobiorcy w okresie ubezpieczenia
  | '0234' // Zaświadczenie bez kodu B
  | '0235' // Niezdolność po ustaniu ubezpieczenia powstała później niż 14 dni
  | '0236' // Niezdolność po ustaniu ubezpieczenia krótsza niż 30 dni
  | '0237' // Okoliczność wyłączająca zasiłek po ustaniu ubezpieczenia
  | '0238' // Puste pole informacji przy odpowiedzi tak
  | '0239' // Puste pole daty we wniosku o zasiłek chorobowy
  | '0240' // Data we wniosku o zasiłek chorobowy w przyszłości
  | '0241' // Wypłata zasiłku przekazem pocztowym
  | '0242' // Kolejne zaświadczenie za nieprzerwaną niezdolność do pracy
  | '0243' // Data powrotu do pracy przed najwcześniejszym dniem
  | '0244' // Data powrotu do pracy po wyczerpaniu urlopu rodzicielskiego
  | '0245' // Data powrotu do pracy dopasowana do pełnych tygodni urlopu
  | '0246' // Niższe wypłaty po wcześniejszym powrocie w wariancie 81,5%
  | '0247' // Data podjęcia ubezpieczenia po porodzie poza zakresem
  | '0248' // Puste pole loginu eZUS
  | '0249' // Puste pole hasła eZUS
  | '0250' // Przerwane logowanie do eZUS
  | '0251' // Przerwane logowanie kodem z aplikacji mZUS
  | '0252' // Wygasły kod logowania z aplikacji mZUS
  | '0253' // Puste pole daty urodzenia nowego konta
  | '0254' // Wiek spoza zakresu nowego konta
  | '0255' // Dane osobowe zastąpione danymi losowymi
  | '0256' // Asystent bez profilu rodziny
  | '0257' // Pusta lista wniosków
  | '0258' // Rezygnacja przy ojcu bez ubezpieczenia chorobowego
  | '0259' // Brak daty uprawomocnienia przysposobienia przy zgłoszeniu do ubezpieczenia zdrowotnego
  | '0260' // Zaświadczenie płatnika składek Z-3a do wniosku o zasiłek macierzyński
  | '0261' // Rezygnacja z części zasiłku macierzyńskiego u zleceniodawcy
  | '0262' // Decyzja o odmowie wydania zaświadczenia o niezaleganiu
  | '0263' // Dzieci po wieku granicznym poza wymiarem urlopu
  | '0264' // Uzyskanie zaświadczenia o martwym urodzeniu po poronieniu
  | '0265' // Prawo do urlopu i zasiłku po poronieniu po przedstawieniu zaświadczenia
  | '0266' // Zasiłek chorobowy i zasiłek w wysokości zasiłku macierzyńskiego za ten sam okres
  | '0267' // Wyrównanie zasiłku do 100% po przyjęciu dziecka
  | '0268' // Uzupełniający urlop macierzyński drugiego rodzica
  | '0269' // Wniosek o zasiłek za uzupełniający urlop macierzyński po końcu urlopu macierzyńskiego
  | '0270' // Nieprawidłowa liczba hektarów przeliczeniowych
  | '0271' // Zbyt długi tekst pola
  | '0272' // Płatnik zasiłku przewidywany
  | '0273' // Pusta data wystąpienia do sądu o przysposobienie
  | '0274' // Data wystąpienia do sądu o przysposobienie zbyt odległa
  | '0275' // Pytanie medyczne do asystenta
  | '0276' // Pytanie podatkowe do asystenta
  | '0277' // Brak zgody matki na dane dotyczące zdrowia
  | '0278' // Niezdolność do pracy w czasie urlopu wychowawczego albo bezpłatnego
  | '0279' // Praca zarobkowa w czasie zwolnienia lekarskiego
  | '0280' // Nieprawidłowy numer KRS organizacji
  | '0281' // Wniosek o urlop wychowawczy później niż 21 dni przed urlopem
  | '0282' // Wniosek o obniżenie wymiaru czasu pracy później niż 21 dni przed obniżeniem
  | '0283' // Przekroczony wymiar urlopu wychowawczego
  | '0284' // Nieprawidłowy wymiar czasu pracy po obniżeniu
  | '0285' // Okres obniżenia wymiaru czasu pracy dłuższy niż pozostały urlop wychowawczy
  | '0286' // Wniosek o obniżenie wymiaru czasu pracy wysłany
  | '0287' // Urlop wychowawczy przed 6 miesiącami zatrudnienia
  | '0288' // Przekroczona liczba części urlopu wychowawczego
  | '0289' // Nieprawidłowa liczba dni pobytu dziecka w szpitalu po porodzie
  | '0290' // Ostatni dzień urlopu rodzicielskiego w wymiarze 38 albo 62 tygodni
  | '0291' // Zaświadczenie według stanu w dniu wydania
  | '0292' // Rezygnacja z części zasiłku po wniosku ZAM o 14 tygodni
  | '0293' // Dodatek z tytułu urodzenia dziecka po zgonie dziecka
  | '0294' // Nieprawidłowy wymiar etatu
  | '0295' // Brak adresu do e-Doręczeń wnioskodawcy
  | '0296' // Wymiar urlopu rodzicielskiego dla jednego przyjętego dziecka
  | '0297' // Świadczenie za okres życia dziecka po zgonie dziecka
  | '0298' // Brak ubezpieczenia chorobowego przy zasiłku opiekuńczym
  | '0299' // Brak zaświadczenia lekarskiego na opiekę nad wybraną osobą
  | '0300' // Kolejny okres opieki nad tą samą osobą
  | '0301' // Dni bez ubezpieczenia chorobowego w okresie opieki
  | '0302' // Zamknięcie placówki zapowiedziane co najmniej 7 dni wcześniej
  | '0303' // Wiek dziecka poza sytuacją opieki
  | '0304' // Brak okresu opieki
  | '0305' // Puste pole daty we wniosku o zasiłek opiekuńczy
  | '0306' // Własny urlop w okresie opieki
  | '0307' // Dni opieki drugiego rodzica nad tą samą osobą
  | '0308' // Przekroczony limit dni zasiłku opiekuńczego
  | '0309' // Drugi rodzic na urlopie w okresie opieki
  | '0310' // Dni zwolnienia od pracy z wynagrodzeniem wyłączone z wniosku
  | '0311' // Własna niezdolność do pracy w okresie opieki
  | '0312' // Dni opieki objęte innym wnioskiem
  | '0313' // Wniosek bez dni zasiłku opiekuńczego
  | '0314' // Brak wspólnego gospodarstwa domowego z osobą pod opieką
  | '0315' // Nieprawidłowa liczba dni zasiłku opiekuńczego
  | '0316' // Liczba dni mniejsza niż dni z wniosków w przewodniku
  | '0317' // Przekroczona liczba dni zwolnienia od pracy
  | '0318' // Szacunkowa kwota zasiłku opiekuńczego
  | '0319' // Zasiłek opiekuńczy bez podstawy wymiaru w przewodniku
  | '0320' // Termin złożenia wniosku o zasiłek opiekuńczy
  | '0321' // Przedawnienie zasiłku opiekuńczego za okres opieki
  | '0322' // Zaświadczenie płatnika składek do wniosku o zasiłek opiekuńczy
  | '0323' // Wniosek o zasiłek opiekuńczy przygotowany dla płatnika
  | '0324' // Płatnik zasiłku nieustalony we wniosku o zasiłek opiekuńczy
  | '0325' // Wypłata zasiłku opiekuńczego przez płatnika składek
  | '0326' // Wniosek o zasiłek opiekuńczy przekazany płatnikowi
  | '0327' // Sytuacja matki po upływie 8 tygodni od porodu
  | '0328' // Data porzucenia dziecka przed dniem porodu
  | '0329' // Data wypisu matki ze szpitala poza zakresem
  | '0330' // Okres poza dodatkowym zasiłkiem opiekuńczym
  | '0331' // Matka bez zasiłku macierzyńskiego w 8 tygodniach po porodzie
  | '0332' // Ojciec bez przerwy w pracy
  | '0333' // Dodatkowy zasiłek opiekuńczy poza limitem dni
  | '0334' // Pobyt matki w szpitalu bez daty wypisu
  | '0335' // Usługa wyliczeń przewodnika niedostępna
  | '0336' // Data rezygnacji z zasiłku macierzyńskiego nie później niż dziś
  | '0337' // Wniosek ZAS-23 wysłany
  | '0338' // Wniosek ZAS-23 niedostępny
  | '0339' // Rezygnacja z części zasiłku dla zleceniodawcy przygotowana
  | '0340' // Puste pole tekstowe katalogu
  | '0341'; // Nazwa wpisu słownika już istnieje

// Wartości kolumny Typ tablicy komunikatów.
export type TypKomunikatu = 'ERROR' | 'WARNING' | 'INFO';

// Typ każdego komunikatu z kolumny Typ tablicy komunikatów.
export const typyKomunikatow: Record<KodKomunikatu, TypKomunikatu> = {
  '0001': 'ERROR',
  '0002': 'WARNING',
  '0003': 'ERROR',
  '0004': 'WARNING',
  '0005': 'INFO',
  '0006': 'ERROR',
  '0007': 'ERROR',
  '0008': 'ERROR',
  '0009': 'ERROR',
  '0010': 'ERROR',
  '0011': 'ERROR',
  '0012': 'ERROR',
  '0013': 'ERROR',
  '0014': 'ERROR',
  '0015': 'ERROR',
  '0016': 'ERROR',
  '0017': 'INFO',
  '0018': 'ERROR',
  '0019': 'ERROR',
  '0020': 'ERROR',
  '0021': 'ERROR',
  '0022': 'ERROR',
  '0023': 'ERROR',
  '0024': 'ERROR',
  '0025': 'ERROR',
  '0026': 'ERROR',
  '0027': 'ERROR',
  '0028': 'ERROR',
  '0029': 'ERROR',
  '0030': 'ERROR',
  '0031': 'ERROR',
  '0032': 'INFO',
  '0033': 'INFO',
  '0034': 'INFO',
  '0035': 'ERROR',
  '0036': 'INFO',
  '0037': 'WARNING',
  '0038': 'INFO',
  '0039': 'ERROR',
  '0040': 'ERROR',
  '0041': 'ERROR',
  '0042': 'ERROR',
  '0043': 'ERROR',
  '0044': 'ERROR',
  '0045': 'INFO',
  '0046': 'INFO',
  '0047': 'ERROR',
  '0048': 'ERROR',
  '0049': 'ERROR',
  '0050': 'ERROR',
  '0051': 'INFO',
  '0052': 'ERROR',
  '0053': 'ERROR',
  '0054': 'ERROR',
  '0055': 'INFO',
  '0056': 'INFO',
  '0057': 'INFO',
  '0058': 'INFO',
  '0059': 'ERROR',
  '0060': 'ERROR',
  '0061': 'ERROR',
  '0062': 'WARNING',
  '0063': 'WARNING',
  '0064': 'INFO',
  '0065': 'INFO',
  '0066': 'ERROR',
  '0067': 'ERROR',
  '0068': 'ERROR',
  '0069': 'INFO',
  '0070': 'INFO',
  '0071': 'ERROR',
  '0072': 'WARNING',
  '0073': 'ERROR',
  '0074': 'ERROR',
  '0075': 'ERROR',
  '0076': 'INFO',
  '0077': 'ERROR',
  '0078': 'ERROR',
  '0079': 'ERROR',
  '0080': 'ERROR',
  '0081': 'ERROR',
  '0082': 'INFO',
  '0083': 'INFO',
  '0084': 'INFO',
  '0085': 'WARNING',
  '0086': 'INFO',
  '0087': 'INFO',
  '0088': 'ERROR',
  '0089': 'ERROR',
  '0090': 'ERROR',
  '0091': 'INFO',
  '0092': 'INFO',
  '0093': 'ERROR',
  '0094': 'INFO',
  '0095': 'ERROR',
  '0096': 'ERROR',
  '0097': 'ERROR',
  '0098': 'ERROR',
  '0099': 'INFO',
  '0100': 'INFO',
  '0101': 'INFO',
  '0102': 'ERROR',
  '0103': 'ERROR',
  '0104': 'ERROR',
  '0105': 'ERROR',
  '0106': 'ERROR',
  '0107': 'INFO',
  '0108': 'ERROR',
  '0109': 'ERROR',
  '0110': 'ERROR',
  '0111': 'INFO',
  '0112': 'WARNING',
  '0113': 'WARNING',
  '0114': 'INFO',
  '0115': 'WARNING',
  '0116': 'WARNING',
  '0117': 'INFO',
  '0118': 'INFO',
  '0119': 'WARNING',
  '0120': 'WARNING',
  '0121': 'INFO',
  '0122': 'ERROR',
  '0123': 'ERROR',
  '0124': 'ERROR',
  '0125': 'ERROR',
  '0126': 'INFO',
  '0127': 'ERROR',
  '0128': 'INFO',
  '0129': 'ERROR',
  '0130': 'ERROR',
  '0131': 'INFO',
  '0132': 'INFO',
  '0133': 'ERROR',
  '0134': 'ERROR',
  '0135': 'INFO',
  '0136': 'WARNING',
  '0137': 'WARNING',
  '0138': 'ERROR',
  '0139': 'INFO',
  '0140': 'INFO',
  '0141': 'ERROR',
  '0142': 'WARNING',
  '0143': 'INFO',
  '0144': 'WARNING',
  '0145': 'INFO',
  '0146': 'ERROR',
  '0147': 'ERROR',
  '0148': 'INFO',
  '0149': 'INFO',
  '0150': 'WARNING',
  '0151': 'ERROR',
  '0152': 'ERROR',
  '0153': 'ERROR',
  '0154': 'WARNING',
  '0155': 'INFO',
  '0156': 'INFO',
  '0157': 'INFO',
  '0158': 'INFO',
  '0159': 'INFO',
  '0160': 'ERROR',
  '0161': 'ERROR',
  '0162': 'ERROR',
  '0163': 'ERROR',
  '0164': 'ERROR',
  '0165': 'INFO',
  '0166': 'INFO',
  '0167': 'ERROR',
  '0168': 'ERROR',
  '0169': 'ERROR',
  '0170': 'ERROR',
  '0171': 'INFO',
  '0172': 'INFO',
  '0173': 'INFO',
  '0174': 'INFO',
  '0175': 'ERROR',
  '0176': 'ERROR',
  '0177': 'INFO',
  '0178': 'WARNING',
  '0179': 'INFO',
  '0180': 'INFO',
  '0181': 'INFO',
  '0182': 'WARNING',
  '0183': 'INFO',
  '0184': 'INFO',
  '0185': 'WARNING',
  '0186': 'INFO',
  '0187': 'INFO',
  '0188': 'ERROR',
  '0189': 'ERROR',
  '0190': 'ERROR',
  '0191': 'ERROR',
  '0192': 'INFO',
  '0193': 'ERROR',
  '0194': 'INFO',
  '0195': 'ERROR',
  '0196': 'ERROR',
  '0197': 'INFO',
  '0198': 'INFO',
  '0199': 'INFO',
  '0200': 'INFO',
  '0201': 'ERROR',
  '0202': 'ERROR',
  '0203': 'WARNING',
  '0204': 'WARNING',
  '0205': 'WARNING',
  '0206': 'INFO',
  '0207': 'INFO',
  '0208': 'WARNING',
  '0209': 'ERROR',
  '0210': 'INFO',
  '0211': 'ERROR',
  '0212': 'WARNING',
  '0213': 'ERROR',
  '0214': 'ERROR',
  '0215': 'INFO',
  '0216': 'INFO',
  '0217': 'ERROR',
  '0218': 'WARNING',
  '0219': 'INFO',
  '0220': 'WARNING',
  '0221': 'WARNING',
  '0222': 'WARNING',
  '0223': 'INFO',
  '0224': 'INFO',
  '0225': 'INFO',
  '0226': 'WARNING',
  '0227': 'INFO',
  '0228': 'ERROR',
  '0229': 'INFO',
  '0230': 'INFO',
  '0231': 'INFO',
  '0232': 'INFO',
  '0233': 'INFO',
  '0234': 'INFO',
  '0235': 'INFO',
  '0236': 'INFO',
  '0237': 'INFO',
  '0238': 'ERROR',
  '0239': 'ERROR',
  '0240': 'ERROR',
  '0241': 'INFO',
  '0242': 'INFO',
  '0243': 'ERROR',
  '0244': 'ERROR',
  '0245': 'INFO',
  '0246': 'INFO',
  '0247': 'ERROR',
  '0248': 'ERROR',
  '0249': 'ERROR',
  '0250': 'WARNING',
  '0251': 'WARNING',
  '0252': 'WARNING',
  '0253': 'ERROR',
  '0254': 'ERROR',
  '0255': 'INFO',
  '0256': 'INFO',
  '0257': 'INFO',
  '0258': 'INFO',
  '0259': 'INFO',
  '0260': 'INFO',
  '0261': 'INFO',
  '0262': 'WARNING',
  '0263': 'INFO',
  '0264': 'INFO',
  '0265': 'INFO',
  '0266': 'INFO',
  '0267': 'INFO',
  '0268': 'ERROR',
  '0269': 'WARNING',
  '0270': 'ERROR',
  '0271': 'ERROR',
  '0272': 'INFO',
  '0273': 'ERROR',
  '0274': 'ERROR',
  '0275': 'INFO',
  '0276': 'INFO',
  '0277': 'WARNING',
  '0278': 'INFO',
  '0279': 'INFO',
  '0280': 'ERROR',
  '0281': 'WARNING',
  '0282': 'WARNING',
  '0283': 'ERROR',
  '0284': 'ERROR',
  '0285': 'ERROR',
  '0286': 'INFO',
  '0287': 'INFO',
  '0288': 'ERROR',
  '0289': 'ERROR',
  '0290': 'INFO',
  '0291': 'INFO',
  '0292': 'INFO',
  '0293': 'INFO',
  '0294': 'ERROR',
  '0295': 'WARNING',
  '0296': 'INFO',
  '0297': 'INFO',
  '0298': 'INFO',
  '0299': 'INFO',
  '0300': 'INFO',
  '0301': 'INFO',
  '0302': 'ERROR',
  '0303': 'ERROR',
  '0304': 'ERROR',
  '0305': 'ERROR',
  '0306': 'INFO',
  '0307': 'INFO',
  '0308': 'ERROR',
  '0309': 'WARNING',
  '0310': 'INFO',
  '0311': 'INFO',
  '0312': 'INFO',
  '0313': 'ERROR',
  '0314': 'ERROR',
  '0315': 'ERROR',
  '0316': 'ERROR',
  '0317': 'ERROR',
  '0318': 'INFO',
  '0319': 'INFO',
  '0320': 'INFO',
  '0321': 'WARNING',
  '0322': 'INFO',
  '0323': 'INFO',
  '0324': 'INFO',
  '0325': 'INFO',
  '0326': 'INFO',
  '0327': 'ERROR',
  '0328': 'ERROR',
  '0329': 'ERROR',
  '0330': 'ERROR',
  '0331': 'WARNING',
  '0332': 'WARNING',
  '0333': 'INFO',
  '0334': 'INFO',
  '0335': 'ERROR',
  '0336': 'ERROR',
  '0337': 'INFO',
  '0338': 'INFO',
  '0339': 'INFO',
  '0340': 'ERROR',
  '0341': 'ERROR',
};
