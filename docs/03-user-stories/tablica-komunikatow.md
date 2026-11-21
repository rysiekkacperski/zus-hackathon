# Tablica kodów komunikatów do użytkownika

## Metadata

| Pole | Wartość |
| --- | --- |
| Wykonawca | Ryszard Kacperski |
| Właściciel merytoryczny | Ryszard Kacperski |
| Status | do przeglądu |
| Wersja | 0.3.0 |
| Data ostatniej aktualizacji |  |

**Tablica zawiera treść każdego komunikatu dla użytkownika, do którego odwołują się User Stories nazwą sytuacji i kodem.** Kolumna ID zawiera czterocyfrowy kod komunikatu nadawany kolejno od 0001, Nazwa opisuje sytuację, której dotyczy komunikat, Typ przyjmuje wartość ERROR, WARNING albo INFO, Kod HTTP wskazuje kod odpowiedzi systemu, a Wiadomość zawiera treść pokazywaną użytkownikowi. Story, które wprowadza nową sytuację, dodaje wiersz z kolejnym wolnym kodem, a ta sama nazwa sytuacji oznacza w całym Epiku ten sam komunikat.

| ID | Nazwa | Typ | Kod HTTP | Wiadomość |
| --- | --- | --- | --- | --- |
| 0001 | Brak połączenia z danymi konta ZUS | ERROR | 503 | Nie udało się pobrać Twoich danych z ZUS. Spróbuj ponownie za chwilę. |
| 0002 | Nieaktualne dane konta ZUS | WARNING | 200 | Pokazujemy dane z ZUS z dnia [data odczytu]. Odświeżymy je przy następnym otwarciu przewodnika. |
| 0003 | Błąd zapisu danych | ERROR | 500 | Nie udało się zapisać zmian. Spróbuj ponownie. |
| 0004 | Brak zgody na dane dotyczące zdrowia | WARNING | 403 | Bez Twojej zgody nie zapiszemy danych o ciąży, zdrowiu i zaświadczeniach lekarskich. Plan pokaże sprawy, które od nich nie zależą. |
| 0005 | Zgoda na dane dotyczące zdrowia wycofana | INFO | 200 | Zgoda wycofana. Dane o ciąży, zdrowiu i zaświadczeniach lekarskich usuniemy w ciągu 30 dni. |
| 0006 | Brak wyboru z listy | ERROR | 400 | Wybierz jedną z opcji. |
| 0007 | Puste pole przewidywanego terminu porodu | ERROR | 400 | Podaj przewidywany termin porodu. |
| 0008 | Przewidywany termin porodu w przeszłości | ERROR | 400 | Ten termin już minął. Jeśli dziecko się urodziło, podaj datę porodu. |
| 0009 | Przewidywany termin porodu zbyt odległy | ERROR | 400 | Podaj termin porodu przypadający w ciągu 280 dni od dziś. |
| 0010 | Nieprawidłowy format daty | ERROR | 400 | Podaj datę w formacie DD.MM.RRRR. |
| 0011 | Data wizyty u lekarza albo położnej w przyszłości | ERROR | 400 | Data wizyty nie może być późniejsza niż dzisiejsza. |
| 0012 | Data wizyty u lekarza albo położnej przed początkiem ciąży | ERROR | 400 | Data wizyty nie może być wcześniejsza niż początek ciąży. |
| 0013 | Puste pole gminy | ERROR | 400 | Wybierz gminę, w której mieszkasz. |
| 0014 | Brak gminy na liście | ERROR | 400 | Nie znaleźliśmy takiej gminy. Sprawdź nazwę i wybierz gminę z listy. |
| 0015 | Puste pole dochodu na osobę | ERROR | 400 | Podaj miesięczny dochód netto na osobę w rodzinie. |
| 0016 | Nieprawidłowa kwota | ERROR | 400 | Podaj kwotę w złotych, na przykład 1850,50. |
| 0017 | Profil zapisany | INFO | 201 | Twój plan jest gotowy. |
| 0018 | Puste pole daty porodu | ERROR | 400 | Podaj datę porodu. |
| 0019 | Data porodu w przyszłości | ERROR | 400 | Data porodu nie może być późniejsza niż dzisiejsza. |
| 0020 | Data porodu zbyt odległa | ERROR | 400 | Przewodnik obejmuje dzieci urodzone w ciągu ostatnich 36 miesięcy. |
| 0021 | Nieprawidłowy tydzień ciąży w dniu porodu | ERROR | 400 | Podaj tydzień ciąży od 22 do 44. |
| 0022 | Nieprawidłowa masa urodzeniowa | ERROR | 400 | Podaj masę urodzeniową w gramach, od 300 do 7000. |
| 0023 | Nieprawidłowa liczba dni hospitalizacji | ERROR | 400 | Podaj liczbę dni od 0 do 24. |
| 0024 | Puste pole numeru PESEL | ERROR | 400 | Podaj numer PESEL. |
| 0025 | Nieprawidłowa liczba cyfr PESEL | ERROR | 400 | Numer PESEL ma 11 cyfr. |
| 0026 | Nieprawidłowa cyfra kontrolna PESEL | ERROR | 400 | Ten numer PESEL jest nieprawidłowy. Sprawdź cyfry. |
| 0027 | PESEL dziecka niezgodny z datą porodu | ERROR | 400 | Data urodzenia zapisana w numerze PESEL różni się od daty porodu. |
| 0028 | Puste pole imienia | ERROR | 400 | Podaj imię. |
| 0029 | Puste pole nazwiska | ERROR | 400 | Podaj nazwisko. |
| 0030 | Niedozwolone znaki w imieniu lub nazwisku | ERROR | 400 | Imię i nazwisko mogą zawierać litery, spację, łącznik i apostrof. |
| 0031 | Puste pole miejsca urodzenia | ERROR | 400 | Podaj miejscowość, w której urodziło się dziecko. |
| 0032 | Nowe dziecko w danych ZUS | INFO | 200 | W Twoich danych w ZUS pojawiło się dziecko. Potwierdź datę porodu, a przygotujemy sprawy na najbliższe tygodnie. |
| 0033 | Sprawa oznaczona jako złożona albo załatwiona | INFO | 200 | Gotowe. Nie będziemy już przypominać o tej sprawie. |
| 0034 | Cofnięcie oznaczenia sprawy | INFO | 200 | Sprawa wróciła do listy spraw do zrobienia. |
| 0035 | Błąd otwarcia kanału instytucji | ERROR | 502 | Nie udało się otworzyć serwisu instytucji. Spróbuj ponownie. |
| 0036 | Wniosek ZAM niedostępny dla pracownika | INFO | 200 | Jako pracownik wnioskujesz o urlop u pracodawcy. Pokażemy Ci, jak to zrobić. |
| 0037 | Brak potwierdzonej daty porodu | WARNING | 409 | Najpierw potwierdź datę porodu i dane dziecka. |
| 0038 | Minął termin na wariant 81,5% | INFO | 200 | Minęło 21 dni od porodu, więc zasiłek za okres urlopu rodzicielskiego otrzymasz w wysokości 70%. |
| 0039 | Puste pole numeru rachunku | ERROR | 400 | Podaj numer rachunku do wypłaty zasiłku. |
| 0040 | Nieprawidłowa liczba cyfr rachunku | ERROR | 400 | Numer rachunku ma 26 cyfr. |
| 0041 | Nieprawidłowa suma kontrolna rachunku | ERROR | 400 | Ten numer rachunku jest nieprawidłowy. Sprawdź cyfry. |
| 0042 | Data początku urlopu poza dopuszczalnym zakresem | ERROR | 400 | Podaj datę z zakresu wskazanego przy polu. |
| 0043 | Brak potwierdzenia oświadczeń | ERROR | 400 | Potwierdź oświadczenia, aby wysłać wniosek. |
| 0044 | Błąd wysyłki wniosku do ZUS | ERROR | 503 | Nie udało się wysłać wniosku. Zapisaliśmy Twoje dane, spróbuj ponownie za chwilę. |
| 0045 | Wniosek wysłany do ZUS | INFO | 201 | Wniosek trafił do ZUS. Status sprawdzisz w swoim planie. |
| 0046 | Wniosek przygotowany dla płatnika | INFO | 201 | Wniosek jest gotowy. Przekaż go płatnikowi razem ze skróconym odpisem aktu urodzenia dziecka. |
| 0047 | Brak uprawnień do katalogu | ERROR | 403 | Nie masz uprawnień do zmiany katalogu świadczeń. |
| 0048 | Puste pole kwoty | ERROR | 400 | Podaj kwotę. |
| 0049 | Nieprawidłowy okres obowiązywania | ERROR | 400 | Data początku musi być późniejsza niż data początku obowiązującej wartości. |
| 0050 | Nakładający się okres obowiązywania | ERROR | 409 | W tym okresie obowiązuje już inna wartość. Zakończ jej obowiązywanie wcześniej. |
| 0051 | Zmiana katalogu zapisana | INFO | 200 | Zmiana zapisana. Plany rodzin uwzględnią ją przy najbliższym wyliczeniu. |
| 0052 | Nieprawidłowe wyprzedzenie przypomnienia | ERROR | 400 | Wybierz wyprzedzenie od 1 do 30 dni. |
| 0053 | Nieprawidłowy kod weryfikacyjny SMS | ERROR | 400 | Ten kod jest nieprawidłowy. Sprawdź kod z wiadomości SMS i wpisz go ponownie. |
| 0054 | Wygasły kod weryfikacyjny SMS | ERROR | 410 | Kod stracił ważność po 10 minutach. Wyślij nowy kod. |
| 0055 | Pobrany plik kalendarza | INFO | 200 | Pobraliśmy plik z terminami. Otwórz go, żeby dodać terminy do swojego kalendarza. |
| 0056 | Ustawienia przypomnień zapisane | INFO | 200 | Zapisaliśmy ustawienia przypomnień. |
| 0057 | Data porodu potwierdzona | INFO | 200 | Gratulacje! Przeliczyliśmy Twój plan i terminy. |
| 0058 | Wniosek zapisany do dokończenia | INFO | 200 | Zapisaliśmy wniosek. Dokończysz go w dowolnej chwili w swoim planie. |
| 0059 | Puste pole adresu e-mail | ERROR | 400 | Podaj adres e-mail, na który wyślemy przypomnienia. |
| 0060 | Nieprawidłowy adres e-mail | ERROR | 400 | Wpisz adres e-mail w formacie nazwa@domena.pl. |
| 0061 | Nieprawidłowa liczba tygodni urlopu | ERROR | 400 | Podaj liczbę tygodni z zakresu wskazanego przy polu. |
| 0062 | Brak numeru PESEL dziecka | WARNING | 409 | Do wniosku potrzebny jest numer PESEL dziecka. Otrzymasz go po zgłoszeniu urodzenia w urzędzie stanu cywilnego. |
| 0063 | Data porodu różna od danych ZUS | WARNING | 200 | Data urodzenia dziecka w danych ZUS różni się od daty porodu w Twoim profilu. Sprawdź i potwierdź właściwą datę. |
| 0064 | Brak prawa do zasiłku macierzyńskiego | INFO | 200 | Zasiłek macierzyński przysługuje osobom objętym ubezpieczeniem chorobowym. W planie zobaczysz świadczenie, które przysługuje Twojej rodzinie. |
| 0065 | Zaproszenie wysłane | INFO | 201 | Zaproszenie jest gotowe. Przekaż link drugiemu rodzicowi. Link działa przez 7 dni. |
| 0066 | Zaproszenie wygasło | ERROR | 410 | Ten link wygasł. Poproś o nowe zaproszenie. |
| 0067 | Zaproszenie do własnej rodziny | ERROR | 409 | To zaproszenie jest przeznaczone dla drugiego rodzica. Przekaż mu link. |
| 0068 | Konto należy już do innej rodziny | ERROR | 409 | Twoje konto jest już połączone z inną rodziną w przewodniku. |
| 0069 | Drugi rodzic dołączył | INFO | 200 | Drugi rodzic dołączył do Waszego planu. |
| 0070 | Pytanie poza zakresem asystenta | INFO | 200 | Na to pytanie odpowie konsultant ZUS. Możesz napisać wiadomość do ZUS, umówić e-wizytę, napisać na mama@zus.pl albo zadzwonić na infolinię 22 560 16 00. |
| 0071 | Asystent niedostępny | ERROR | 503 | Asystent jest chwilowo niedostępny. Spróbuj ponownie za chwilę albo skorzystaj z planu. |
| 0072 | Przerwane logowanie przez mObywatela | WARNING | 401 | Logowanie przez mObywatela zostało przerwane. Zaloguj się ponownie, żeby otworzyć przewodnik. |
| 0073 | Puste pole daty zmiany zatrudnienia | ERROR | 400 | Podaj datę rozpoczęcia albo zakończenia pracy. |
| 0074 | Data zmiany zatrudnienia poza okresem ciąży | ERROR | 400 | Podaj datę z okresu ciąży, najwcześniej 280 dni przed przewidywanym terminem porodu i najpóźniej w dniu tego terminu. |
| 0075 | Data ustania zatrudnienia przed datą rozpoczęcia | ERROR | 400 | Data zakończenia pracy nie może być wcześniejsza niż data jej rozpoczęcia. |
| 0076 | Naruszenie przepisów bez prawomocnego wyroku | INFO | 200 | Po rozwiązaniu umowy z naruszeniem przepisów zasiłek macierzyński po porodzie przysługuje, gdy naruszenie potwierdzi prawomocny wyrok sądu. |
| 0077 | Puste pole wymiaru | ERROR | 400 | Podaj wymiar. |
| 0078 | Nieprawidłowy wymiar | ERROR | 400 | Podaj liczbę całkowitą od 1 do 999. |
| 0079 | Nieprawidłowa stawka | ERROR | 400 | Podaj stawkę w procentach, większą od zera i najwyżej 100, z najwyżej dwoma miejscami po przecinku. |
| 0080 | Puste pole tytułu pozycji katalogu | ERROR | 400 | Podaj tytuł sprawy. |
| 0081 | Tytuł pozycji katalogu już istnieje | ERROR | 409 | W katalogu jest już pozycja o tym tytule. |
| 0082 | Pozycja katalogu dodana | INFO | 201 | Pozycja dodana do katalogu. Plany rodzin uwzględnią ją przy najbliższym wyliczeniu. |
| 0083 | Brak ubezpieczenia chorobowego w ciąży | INFO | 200 | Nie podlegasz teraz ubezpieczeniu chorobowemu, więc zasiłek chorobowy Ci nie przysługuje. Zobacz, co możesz jeszcze zrobić. |
| 0084 | Okres wyczekiwania na zasiłek chorobowy | INFO | 200 | Prawo do zasiłku chorobowego uzyskasz [data], po [liczba dni] dniach ubezpieczenia chorobowego. |
| 0085 | Ubezpieczenie chorobowe ustało w ciąży | WARNING | 200 | Twoje ubezpieczenie chorobowe ustało [data]. Sprawdź, jakie świadczenie przysługuje Ci do porodu i po porodzie. |
| 0086 | Okres zasiłkowy wyczerpany | INFO | 200 | Okres zasiłkowy wynoszący 270 dni minął. Jeśli niezdolność do pracy trwa dalej, możesz wystąpić o świadczenie rehabilitacyjne. |
| 0087 | Płatnik zasiłku nieustalony przy dokumentach | INFO | 200 | Odpowiedz na pytanie o płatnika zasiłku, a pokażemy, gdzie złożyć dokumenty. |
| 0088 | Puste pole daty przyjęcia dziecka | ERROR | 400 | Podaj datę przyjęcia dziecka na wychowanie. |
| 0089 | Data przyjęcia dziecka zbyt odległa | ERROR | 400 | Podaj datę przyjęcia dziecka przypadającą najpóźniej za 12 miesięcy od dziś. |
| 0090 | Data urodzenia dziecka po dacie przyjęcia | ERROR | 400 | Data urodzenia dziecka nie może być późniejsza niż data przyjęcia na wychowanie. |
| 0091 | Wiek dziecka poza zakresem urlopu na warunkach urlopu macierzyńskiego | INFO | 200 | Urlop na warunkach urlopu macierzyńskiego przysługuje do ukończenia przez dziecko [wiek] lat. Sprawdź, jaki urlop przysługuje Ci w tej sytuacji. |
| 0092 | Rodzina zastępcza zawodowa bez prawa do zasiłku | INFO | 200 | Rodzinie zastępczej zawodowej nie przysługuje urlop na warunkach urlopu macierzyńskiego ani zasiłek macierzyński za ten okres. |
| 0093 | Puste pole podstawy wymiaru | ERROR | 400 | Podaj podstawę wymiaru zasiłku. |
| 0094 | Brak podstaw składek w danych ZUS | INFO | 200 | W danych ZUS nie ma podstaw składek z ubezpieczeniem chorobowym. Wpisz podstawę wymiaru zasiłku sam. |
| 0095 | Przekroczony wymiar urlopu rodzicielskiego | ERROR | 400 | Suma tygodni urlopu rodzicielskiego obojga rodziców może wynieść najwyżej [liczba tygodni] tygodni. |
| 0096 | Przekroczona liczba części urlopu rodzicielskiego | ERROR | 400 | Urlop rodzicielski można podzielić na najwyżej 5 części. |
| 0097 | Przejęcie urlopu macierzyńskiego przed upływem 14 tygodni | ERROR | 400 | Ojciec przejmuje urlop macierzyński po wykorzystaniu przez matkę co najmniej 14 tygodni po porodzie, a wcześniej w sytuacji szczególnej, którą wskazujesz przy polu. |
| 0098 | Nieprawidłowy wymiar pracy przy urlopie rodzicielskim | ERROR | 400 | Podaj wymiar pracy od 1% do 50% etatu. |
| 0099 | Łączenie urlopu rodzicielskiego z pracą dla pracownika | INFO | 200 | Urlop rodzicielski z pracą łączy pracownik, który pracuje u pracodawcy udzielającego urlopu. |
| 0100 | Scenariusz zapisany w planie | INFO | 201 | Zapisaliśmy scenariusz w Twoim planie. |
| 0101 | Kalkulator bez profilu rodziny | INFO | 200 | Liczymy na danych wpisanych w kalkulatorze. Zapisz profil rodziny, żeby zachować wynik w planie. |
| 0102 | Data zgonu dziecka przed datą porodu | ERROR | 400 | Data zgonu dziecka nie może być wcześniejsza niż data porodu. |
| 0103 | Nieobsługiwany format pliku | ERROR | 415 | Wgraj plik w formacie PDF, JPG albo PNG. |
| 0104 | Plik zbyt duży | ERROR | 413 | Plik może mieć najwyżej 10 MB. |
| 0105 | Nierozpoznany rodzaj dokumentu | ERROR | 422 | Nie rozpoznaliśmy dokumentu. Wgraj dokument z zestawu przykładowych spraw ZUS, na przykład wniosek o zasiłek macierzyński, zaświadczenie płatnika składek, poświadczenie ubezpieczenia chorobowego albo zaświadczenie lekarskie. |
| 0106 | Nieczytelny dokument | ERROR | 422 | Nie udało się odczytać danych z dokumentu. Wgraj wyraźniejszy plik albo wpisz dane sam. |
| 0107 | Dane odczytane z pomocą AI | INFO | 200 | Dane odczytaliśmy z dokumentu z pomocą sztucznej inteligencji. Sprawdź je i popraw, zanim przejdziesz dalej. |
| 0108 | Odczyt dokumentu niedostępny | ERROR | 503 | Odczyt dokumentu jest chwilowo niedostępny. Spróbuj ponownie za chwilę albo wybierz sprawę z listy. |
| 0109 | Brak danych do weryfikacji ubezpieczenia | ERROR | 409 | Do weryfikacji potrzebny jest tytuł ubezpieczenia, okres ubezpieczenia chorobowego i data zdarzenia. Uzupełnij dane sprawy. |
| 0110 | Data końca okresu przed datą początku | ERROR | 400 | Data końca okresu nie może być wcześniejsza niż data jego początku. |
| 0111 | Wyliczenie zgodne z rozstrzygnięciem | INFO | 200 | Wyliczenie jest zgodne z rozstrzygnięciem sprawy. |
| 0112 | Wyliczenie różne od rozstrzygnięcia | WARNING | 200 | Wyliczenie różni się od rozstrzygnięcia sprawy. Sprawdź dane sprawy i zastosowane reguły. |
| 0113 | Dokument sprawy usunięty | WARNING | 410 | Dokument tej sprawy został usunięty po 24 godzinach. Wgraj go ponownie. |
| 0114 | Brak zaświadczeń lekarskich e-ZLA | INFO | 200 | Nie masz zaświadczeń lekarskich z ostatnich 12 miesięcy. |
| 0115 | Okres zasiłkowy bliski wyczerpania | WARNING | 200 | Do końca okresu zasiłkowego zostało [liczba dni] dni. Jeśli niezdolność do pracy potrwa dłużej, złóż wniosek o świadczenie rehabilitacyjne co najmniej 6 tygodni przed końcem okresu zasiłkowego. |
| 0116 | Zadłużenie z tytułu składek | WARNING | 200 | Na dzień [data] masz zadłużenie z tytułu składek w kwocie [kwota]. Sprawdź, jak wpływa ono na prawo do zasiłku. |
| 0117 | Brak zadłużenia z tytułu składek | INFO | 200 | Na dzień [data] nie masz zadłużenia z tytułu składek. |
| 0118 | Zaświadczenie o niezaleganiu wydane | INFO | 201 | Zaświadczenie o niezaleganiu w opłacaniu składek jest gotowe do pobrania. |
| 0119 | Tytuł ubezpieczenia podjęty w ciąży | WARNING | 200 | Twoja umowa albo działalność zaczęła się w czasie ciąży. ZUS może sprawdzić, czy zgłoszenie do ubezpieczenia służyło wyłącznie uzyskaniu zasiłku. |
| 0120 | Brak ubezpieczenia chorobowego w dniu porodu | WARNING | 200 | Twoje ubezpieczenie chorobowe skończy się [data], przed przewidywanym terminem porodu. Bez ubezpieczenia w dniu porodu zasiłek macierzyński nie przysługuje. |
| 0121 | Umowa przedłużona do dnia porodu | INFO | 200 | Twoja umowa przedłuży się do dnia porodu, czyli do [data]. |
| 0122 | Puste pole nazwy organizacji | ERROR | 400 | Podaj nazwę organizacji. |
| 0123 | Nieprawidłowy adres strony organizacji | ERROR | 400 | Podaj adres strony zaczynający się od https://. |
| 0124 | Nieprawidłowy numer telefonu | ERROR | 400 | Podaj numer telefonu z 9 cyframi. |
| 0125 | Data uprawomocnienia przysposobienia w przyszłości | ERROR | 400 | Data uprawomocnienia orzeczenia nie może być późniejsza niż dzisiejsza. |
| 0126 | Sytuacja szczególna zapisana | INFO | 200 | Zapisaliśmy zmianę. Pokazujemy sprawy, które teraz dotyczą Twojej rodziny. |
| 0127 | Data zdarzenia w przyszłości | ERROR | 400 | Data zdarzenia nie może być późniejsza niż dzisiejsza. |
| 0128 | Spokojny tryb wyłączony | INFO | 200 | Wyłączyliśmy spokojny tryb. Przypomnienia o sprawach z Twojego planu wracają. |
| 0129 | Puste pole treści pytania | ERROR | 400 | Napisz treść pytania. |
| 0130 | Pytanie zbyt długie | ERROR | 400 | Pytanie może mieć najwyżej 2000 znaków. |
| 0131 | Pytanie wysłane do ZUS | INFO | 201 | Pytanie trafiło do ZUS. Odpowiedź zobaczysz w przewodniku i w eZUS. |
| 0132 | Odpowiedź ZUS na pytanie | INFO | 200 | ZUS odpowiedział na Twoje pytanie. |
| 0133 | Brak połączenia z PUE/eZUS | ERROR | 503 | Nie udało się połączyć z eZUS. Spróbuj ponownie za chwilę. |
| 0134 | Puste pole adresu e-mail pracodawcy | ERROR | 400 | Podaj adres e-mail pracodawcy. |
| 0135 | Wniosek wysłany do pracodawcy | INFO | 201 | Wniosek trafił do pracodawcy [data]. Od dnia złożenia wniosku przysługuje Ci szczególna ochrona przed wypowiedzeniem. |
| 0136 | Wniosek o urlop rodzicielski później niż 21 dni przed urlopem | WARNING | 200 | Wniosek o urlop rodzicielski składasz co najmniej 21 dni przed jego rozpoczęciem. Wybierz późniejszą datę początku urlopu albo uzgodnij termin z pracodawcą. |
| 0137 | Wniosek o urlop ojcowski później niż 7 dni przed urlopem | WARNING | 200 | Wniosek o urlop ojcowski składasz co najmniej 7 dni przed jego rozpoczęciem. Wybierz późniejszą datę początku urlopu albo uzgodnij termin z pracodawcą. |
| 0138 | Błąd wysyłki wniosku do pracodawcy | ERROR | 503 | Nie udało się wysłać wniosku do pracodawcy. Zapisaliśmy go, spróbuj ponownie za chwilę. |
| 0139 | Wniosek o urlop gotowy do pobrania | INFO | 201 | Wniosek jest gotowy do pobrania i przekazania pracodawcy. |
| 0140 | Wniosek o urlop dla pracownika | INFO | 200 | Wniosek o urlop składa pracownik. Przy umowie zlecenia i działalności składasz wniosek o zasiłek macierzyński. |
| 0141 | Rezygnacja przed upływem 14 tygodni | ERROR | 400 | Z dalszej części urlopu macierzyńskiego rezygnujesz po wykorzystaniu co najmniej 14 tygodni po porodzie. |
| 0142 | Rezygnacja później niż 7 dni przed powrotem | WARNING | 200 | Rezygnację z części urlopu macierzyńskiego składasz pracodawcy co najmniej 7 dni przed powrotem do pracy. Wybierz późniejszą datę powrotu albo uzgodnij termin z pracodawcą. |
| 0143 | Rezygnacja złożona | INFO | 201 | Rezygnacja jest złożona. Drugi rodzic może złożyć wniosek o pozostałą część urlopu. |
| 0144 | Brak dokumentu sytuacji szczególnej | WARNING | 409 | Do wniosku dołącz dokument potwierdzający sytuację, na przykład zaświadczenie ze szpitala. |
| 0145 | Wniosek o odpis aktu urodzenia złożony | INFO | 201 | Wniosek o odpis aktu urodzenia trafił do urzędu stanu cywilnego. Odpis otrzymasz w wybrany sposób. |
| 0146 | Brak aktu urodzenia w rejestrze | ERROR | 404 | Nie znaleźliśmy aktu urodzenia dla podanych danych. Sprawdź dane dziecka. |
| 0147 | Brak połączenia z rejestrem stanu cywilnego | ERROR | 503 | Nie udało się połączyć z rejestrem stanu cywilnego. Spróbuj ponownie za chwilę. |
| 0148 | Odpowiedź asystenta AI | INFO | 200 | Odpowiedź przygotował asystent oparty na sztucznej inteligencji na podstawie Twojego planu. Sprawdź szczegóły sprawy, zanim podejmiesz decyzję. |
| 0149 | Załączniki do wniosku | INFO | 200 | Do wniosku dołącz: [lista dokumentów]. |
| 0150 | Stan rozliczeń składek niedostępny | WARNING | 200 | Nie udało się pobrać stanu rozliczeń składek. Potwierdź sam, że składki są opłacone. |
| 0151 | Puste pole stawki | ERROR | 400 | Podaj stawkę. |
| 0152 | Puste pole instytucji i kanału | ERROR | 400 | Podaj instytucję i kanał, w którym rodzic załatwia sprawę. |
| 0153 | Nieprawidłowe przesunięcie terminu | ERROR | 400 | Podaj liczbę całkowitą od -366 do 366 dni albo od -36 do 36 miesięcy. |
| 0154 | Zadłużenie z tytułu składek ponad próg przy świadczeniu | WARNING | 200 | Na dzień [data] zadłużenie z tytułu składek wynosi [kwota] i przekracza [próg]. Świadczenie przysługuje po spłacie całego zadłużenia, a spłata w ciągu 6 miesięcy daje świadczenie za cały okres. |
| 0155 | Prawo do świadczenia zależne od opłacenia składek | INFO | 200 | Świadczenie przysługuje, jeżeli w dniu powstania prawa zadłużenie z tytułu składek nie przekracza [próg]. Sprawdź stan rozliczeń składek przed złożeniem wniosku. |
| 0156 | Świadczenia w ciąży ustalone z profilu rodziny | INFO | 200 | Wynik ustaliliśmy z odpowiedzi w profilu rodziny. Wynik z danymi z konta ZUS matka zobaczy po zalogowaniu na swoim koncie. |
| 0157 | Umowa bez przedłużenia do dnia porodu | INFO | 200 | Twoja umowa skończy się [data] i nie przedłuży się do dnia porodu. Sprawdź, jak zachować ubezpieczenie chorobowe w dniu porodu. |
| 0158 | Okres szczególnej ochrony pracownika | INFO | 200 | Szczególna ochrona Twojej umowy o pracę trwa od [data] do [data]. |
| 0159 | Brak podmiotów wsparcia dla sytuacji | INFO | 200 | Pokazujemy wszystkie organizacje, które wspierają rodziców w trudnych chwilach. Możesz wybrać sytuację, w której szukasz pomocy. |
| 0160 | Puste pole zakresu pomocy organizacji | ERROR | 400 | Opisz, w czym organizacja pomaga rodzicom. |
| 0161 | Organizacja istniejąca w słowniku | ERROR | 409 | W słowniku jest już organizacja o tej nazwie. |
| 0162 | Brak potwierdzenia charakteru charytatywnego organizacji | ERROR | 400 | Potwierdź, że organizacja działa wyłącznie charytatywnie. |
| 0163 | Puste pole daty urodzenia dziecka | ERROR | 400 | Podaj datę urodzenia dziecka. |
| 0164 | Nieprawidłowa liczba dni pobytu dziecka w szpitalu | ERROR | 400 | Podaj liczbę dni od 0 do [liczba dni]. |
| 0165 | Minął termin na wariant 81,5% po przyjęciu dziecka | INFO | 200 | Minęło 21 dni od przyjęcia dziecka na wychowanie, więc zasiłek za okres urlopu rodzicielskiego otrzymasz w wysokości 70%. |
| 0166 | Wyliczenie po stracie dziecka | INFO | 200 | Bardzo nam przykro z powodu Twojej straty. Pokazujemy, jak długo i w jakiej wysokości przysługuje Ci zasiłek, oraz gdzie znajdziesz wsparcie. |
| 0167 | Puste pole daty zgonu dziecka | ERROR | 400 | Podaj datę zgonu dziecka. |
| 0168 | Nieprawidłowa liczba dzieci, których dotyczy strata | ERROR | 400 | Podaj liczbę od 1 do [liczba dzieci]. |
| 0169 | Przejęcie urlopu macierzyńskiego przed upływem 8 tygodni | ERROR | 400 | W tej sytuacji drugi rodzic przejmuje urlop macierzyński po wykorzystaniu przez matkę co najmniej 8 tygodni po porodzie. |
| 0170 | Nieprawidłowa liczba scenariuszy do porównania | ERROR | 400 | Wybierz od 2 do 3 scenariuszy. |
| 0171 | Zapisanie scenariusza przykładowej sprawy | INFO | 201 | Zapisaliśmy scenariusz przykładowej sprawy w kalkulatorze. Scenariusz nie zmienia Twojego planu. |
| 0172 | Urlop rodzicielski po osiągnięciu wieku przez dziecko | INFO | 200 | Urlop rodzicielski wykorzystasz do dnia poprzedzającego ukończenie przez dziecko [wiek] lat. Tygodnie przypadające później przepadają. |
| 0173 | Brak danych ZUS drugiego rodzica | INFO | 200 | Drugi rodzic nie dołączył do Waszego planu, więc nie znamy jego danych z ZUS. Wpisz jego podstawę wymiaru zasiłku albo zaproś go do planu. |
| 0174 | Wyrównanie zasiłku do 100% | INFO | 200 | Urlop rodzicielski zaczyna się po pierwszych urodzinach dziecka, więc zasiłek za ten urlop wyniesie 70%, a za urlop macierzyński otrzymasz na wniosek jednorazowe wyrównanie do 100%. |
| 0175 | Puste pole daty początku urlopu | ERROR | 400 | Podaj datę początku urlopu. |
| 0176 | Puste pole daty końca pobytu matki w szpitalu | ERROR | 400 | Podaj datę końca pobytu matki w szpitalu. |
| 0177 | Wynik weryfikacji zgodny z rozstrzygnięciem | INFO | 200 | Wynik weryfikacji ubezpieczenia jest zgodny z rozstrzygnięciem sprawy. |
| 0178 | Wynik weryfikacji różny od rozstrzygnięcia | WARNING | 200 | Wynik weryfikacji ubezpieczenia różni się od rozstrzygnięcia sprawy. Sprawdź dane sprawy i uzasadnienie warunków. |
| 0179 | Przykładowa sprawa usunięta | INFO | 200 | Usunęliśmy sprawę razem z jej dokumentami i danymi. |
| 0180 | Brak rozstrzygnięcia sprawy do porównania | INFO | 200 | Podaj rozstrzygnięcie sprawy, żeby porównać z nim wynik weryfikacji i wyliczenie. |
| 0181 | Zastąpiony dokument tego samego rodzaju | INFO | 200 | Nowy dokument zastąpił wcześniej wgrany dokument tego samego rodzaju. |
| 0182 | Zadłużenie z tytułu składek przekraczające próg | WARNING | 200 | Zadłużenie przekracza [próg]. Zasiłek nie przysługuje do czasu spłaty całego zadłużenia. Spłać je do [data], a otrzymasz zasiłek za cały okres. |
| 0183 | Zadłużenie z tytułu składek nieprzekraczające progu | INFO | 200 | Zadłużenie nie przekracza [próg], więc nie odbiera prawa do zasiłku. Opłać brakującą kwotę, żeby zadłużenie nie wzrosło. |
| 0184 | Układ ratalny albo odroczenie spłacane terminowo | INFO | 200 | Spłacasz składki zgodnie z układem ratalnym albo odroczeniem terminu płatności, więc przy ustalaniu prawa do zasiłku ZUS nie traktuje ich jako zadłużenia. |
| 0185 | Zadłużenie niespłacone w ciągu 6 miesięcy | WARNING | 200 | Zadłużenie nie zostało spłacone do [data]. Zasiłek za okres przed spłatą przepadł, a po spłacie całego zadłużenia przysługuje od dnia spłaty. |
| 0186 | Zadłużenie spłacone w ciągu 6 miesięcy | INFO | 200 | Zadłużenie spłacone [data spłaty]. Zasiłek przysługuje za cały okres, a ZUS wypłaci go najpóźniej [data wypłaty]. |
| 0187 | Stan rozliczeń na dzień powstania prawa w przyszłości | INFO | 200 | Pokazujemy stan rozliczeń na dziś. ZUS sprawdzi stan na [data], więc opłać składki przed tym dniem. |
| 0188 | Puste pole dnia stanu rozliczeń | ERROR | 400 | Podaj dzień, na który chcesz otrzymać zaświadczenie. |
| 0189 | Dzień stanu rozliczeń w przyszłości | ERROR | 400 | Zaświadczenie wystawimy na dzień dzisiejszy albo wcześniejszy. |
| 0190 | Dzień stanu rozliczeń przed rozpoczęciem działalności | ERROR | 400 | Podaj dzień od [data], czyli od początku prowadzenia działalności. |
| 0191 | Data urodzenia dziecka w przyszłości | ERROR | 400 | Data urodzenia dziecka nie może być późniejsza niż dzisiejsza. |
| 0192 | Brak daty uprawomocnienia przysposobienia | INFO | 200 | Termin urlopu ojcowskiego policzymy od dnia uprawomocnienia się orzeczenia o przysposobieniu. Dopisz tę datę w profilu, gdy ją poznasz. |
| 0193 | Puste pole daty zdarzenia | ERROR | 400 | Podaj datę zdarzenia. |
| 0194 | Poronienie potwierdzone zaświadczeniem o martwym urodzeniu | INFO | 200 | Na podstawie zaświadczenia o martwym urodzeniu przysługuje Ci urlop macierzyński i zasiłek macierzyński na zasadach urodzenia martwego dziecka. |
| 0195 | Puste pole adresu do doręczenia | ERROR | 400 | Podaj adres, na który urząd wyśle odpis. |
| 0196 | Brak kodu pocztowego w adresie | ERROR | 400 | Podaj adres z kodem pocztowym w formacie 00-000. |
| 0197 | Pierwszy odpis skrócony bezpłatnie | INFO | 200 | Pierwszy odpis skrócony aktu urodzenia urząd stanu cywilnego wydaje bezpłatnie osobie, która zgłosiła urodzenie. |
| 0198 | Odpis wielojęzyczny w formie papierowej | INFO | 200 | Odpis wielojęzyczny otrzymasz w formie papierowej, pocztą albo osobiście w urzędzie stanu cywilnego. |
| 0199 | Wniosek o urlop wysłany przed okresem ochrony | INFO | 201 | Wniosek trafił do pracodawcy [data]. Szczególna ochrona przed wypowiedzeniem przysługuje Ci od [data początku ochrony] do końca urlopu. |
| 0200 | Wniosek o łączenie urlopu rodzicielskiego z pracą wysłany | INFO | 201 | Wniosek trafił do pracodawcy [data]. Pracodawca może odmówić łączenia urlopu z pracą ze względu na organizację albo rodzaj pracy i poinformuje Cię o tym w ciągu 7 dni. |
| 0201 | Puste pole daty we wniosku o urlop | ERROR | 400 | Podaj datę. |
| 0202 | Nieprawidłowa liczba dni urlopu | ERROR | 400 | Podaj liczbę dni z zakresu wskazanego przy polu. |
| 0203 | Wniosek o uzupełniający urlop macierzyński później niż 21 dni przed końcem urlopu macierzyńskiego | WARNING | 200 | Wniosek o uzupełniający urlop macierzyński składasz co najmniej 21 dni przed końcem urlopu macierzyńskiego. Uzgodnij termin z pracodawcą. |
| 0204 | Wniosek o urlop na warunkach urlopu macierzyńskiego później niż 7 dni od przyjęcia dziecka | WARNING | 200 | Wniosek o urlop na warunkach urlopu macierzyńskiego składasz w ciągu 7 dni od przyjęcia dziecka. Uzgodnij termin z pracodawcą. |
| 0205 | Wniosek o łączenie urlopu rodzicielskiego z pracą później niż 21 dni przed podjęciem pracy | WARNING | 200 | Wniosek o łączenie urlopu rodzicielskiego z pracą składasz co najmniej 21 dni przed podjęciem pracy. Wybierz późniejszą datę albo uzgodnij termin z pracodawcą. |
| 0206 | Rezygnacja bez drugiego rodzica w profilu | INFO | 200 | Z dalszej części urlopu macierzyńskiego rezygnujesz, gdy pozostałą część urlopu przejmie ojciec dziecka. Dodaj drugiego rodzica do profilu rodziny. |
| 0207 | Rezygnacja z części zasiłku macierzyńskiego w eZUS | INFO | 200 | Rezygnację z dalszej części zasiłku macierzyńskiego złożysz w eZUS wnioskiem ZAS-23 o skrócenie okresu wypłaty zasiłku macierzyńskiego, razem z oświadczeniem, od kiedy ojciec dziecka przejmie zasiłek. Złóż je przed dniem, od którego rezygnujesz. Pozostałą część zasiłku drugi rodzic otrzyma na swój wniosek. |
| 0208 | Wniosek o pozostałą część urlopu macierzyńskiego później niż 14 dni przed urlopem | WARNING | 200 | Wniosek o pozostałą część urlopu macierzyńskiego składasz co najmniej 14 dni przed jej rozpoczęciem. Uzgodnij termin z pracodawcą. |
| 0209 | Rezygnacja z orzeczeniem przed upływem 8 tygodni | ERROR | 400 | Przy orzeczeniu o niezdolności do samodzielnej egzystencji rezygnujesz z dalszej części urlopu macierzyńskiego po wykorzystaniu co najmniej 8 tygodni po porodzie. |
| 0210 | Sytuacja szczególna przed upływem 8 tygodni od porodu | INFO | 200 | W pierwszych 8 tygodniach życia dziecka możesz otrzymać zasiłek opiekuńczy na czas osobistej opieki nad dzieckiem. Część urlopu macierzyńskiego przejmiesz od [data]. |
| 0211 | PESEL dziecka niezgodny z datą urodzenia przyjętego dziecka | ERROR | 400 | Data urodzenia zapisana w numerze PESEL różni się od daty urodzenia dziecka w Twoim profilu. |
| 0212 | Wygaśnięcie sesji | WARNING | 401 | Sesja wygasła po 15 minutach bez działania. Zaloguj się ponownie, żeby wrócić do przewodnika. |
| 0213 | Puste pole numeru telefonu | ERROR | 400 | Podaj numer telefonu, na który wyślemy przypomnienia SMS. |
| 0214 | Brak wybranego kanału przypomnień | ERROR | 400 | Wybierz e-mail, SMS albo oba kanały przypomnień. |
| 0215 | Wysłany kod weryfikacyjny SMS | INFO | 200 | Wysłaliśmy kod SMS na numer [numer telefonu]. Wpisz go w ciągu 10 minut. |
| 0216 | Brak terminów do pobrania | INFO | 200 | W Twoim planie nie ma teraz spraw do zrobienia z terminem. Plik kalendarza pobierzesz, gdy pojawi się termin. |
| 0217 | Nieprawidłowy format kodu weryfikacyjnego | ERROR | 400 | Wpisz 6 cyfr kodu z wiadomości SMS. |
| 0218 | Brak adresu do przypomnień | WARNING | 200 | Podaj adres e-mail albo numer telefonu, żebyśmy mogli przypominać Ci o terminach. |
| 0219 | Dane drugiego rodzica pobrane z pełnomocnictwa | INFO | 200 | Pobraliśmy dane ubezpieczenia drugiego rodzica na podstawie pełnomocnictwa i przeliczyliśmy plan rodziny. |
| 0220 | Pełnomocnictwo PEL odwołane | WARNING | 200 | Pełnomocnictwo od [imię i nazwisko] zostało odwołane. Usunęliśmy dane pobrane na jego podstawie i przywróciliśmy Twoje odpowiedzi o drugim rodzicu. |
| 0221 | Pełnomocnictwo PEL wygasło | WARNING | 200 | Pełnomocnictwo od [imię i nazwisko] obowiązywało do [data]. Poproś o nowe pełnomocnictwo PEL w eZUS, żeby pobrać aktualne dane. |
| 0222 | Pełnomocnictwo PEL ograniczone do korespondencji | WARNING | 200 | Pełnomocnictwo od [imię i nazwisko] obejmuje wyłącznie korespondencję. Poproś o pełnomocnictwo PEL do roli Ubezpieczony bez ograniczenia do korespondencji. |
| 0223 | Brak pełnomocnictwa PEL od drugiego rodzica | INFO | 200 | Drugi rodzic nie udzielił Ci jeszcze pełnomocnictwa. Pokaż mu instrukcję udzielenia pełnomocnictwa PEL w eZUS. |
| 0224 | Pełnomocnictwo PEL od przyszłej daty | INFO | 200 | Pełnomocnictwo od [imię i nazwisko] obowiązuje od [data]. Dane drugiego rodzica pobierzemy od tego dnia. |
| 0225 | Rozstrzygnięcie uzupełnione ze zrzutu z systemu ZUS | INFO | 200 | Rozstrzygnięcie sprawy uzupełniliśmy świadczeniami przyznanymi w zrzucie z systemu ZUS. Sprawdź je przed weryfikacją. |
| 0226 | Początek zasiłku wcześniej niż 6 tygodni przed terminem porodu | WARNING | 200 | Okres zasiłku we wniosku zaczyna się [data początku z wniosku], czyli wcześniej niż 6 tygodni przed przewidywanym terminem porodu [termin porodu]. Do wyliczenia przyjmujemy początek [data początku do wyliczenia]. |
| 0227 | Brak zaświadczenia o przewidywanej dacie porodu w przykładowej sprawie | INFO | 200 | Zasiłek za okres przed porodem wymaga zaświadczenia lekarskiego o przewidywanej dacie porodu. Dodaj je do sprawy, jeśli jest w zestawie dokumentów. |
| 0228 | Brak zaświadczenia o przewidywanej dacie porodu | ERROR | 400 | Dołącz zaświadczenie lekarskie o przewidywanej dacie porodu. |
| 0229 | Wniosek przed porodem | INFO | 200 | Zasiłek przed porodem możesz zacząć najwcześniej [data], czyli 6 tygodni przed przewidywanym terminem porodu. Możesz też pracować do porodu i złożyć wniosek po porodzie. |
| 0230 | Wniosek przed porodem przygotowany dla płatnika | INFO | 201 | Wniosek jest gotowy. Przekaż go płatnikowi razem z zaświadczeniem lekarskim o przewidywanej dacie porodu, a po porodzie dostarcz płatnikowi skrócony odpis aktu urodzenia dziecka. |
| 0231 | Dane dziecka do przekazania ZUS | INFO | 200 | Przekaż ZUS dane dziecka do wniosku o zasiłek macierzyński złożonego przed porodem, żeby ZUS ustalił zasiłek za okres po porodzie. |
| 0232 | Dane dziecka przekazane ZUS | INFO | 201 | Przekazaliśmy ZUS dane dziecka do Twojego wniosku o zasiłek macierzyński. |
| 0233 | Wniosek ZAS-53 dla pracownika i zleceniobiorcy w okresie ubezpieczenia | INFO | 200 | Wniosek o zasiłek chorobowy składa osoba prowadząca działalność albo osoba po ustaniu ubezpieczenia. Twój zasiłek ustali płatnik składek albo ZUS na podstawie zaświadczenia lekarskiego, więc poinformuj płatnika o niezdolności do pracy. |
| 0234 | Zaświadczenie bez kodu B | INFO | 200 | Zaświadczenie nie ma kodu B, który oznacza ciążę, więc zasiłek wyniesie 80% podstawy wymiaru. Jeśli niezdolność przypada w ciąży, skontaktuj się z lekarzem, który wystawił zaświadczenie. |
| 0235 | Niezdolność po ustaniu ubezpieczenia powstała później niż 14 dni | INFO | 200 | Ubezpieczenie ustało [data ustania], a niezdolność do pracy zaczęła się [data], czyli później niż 14 dni po ustaniu. Zasiłek chorobowy za ten okres nie przysługuje. |
| 0236 | Niezdolność po ustaniu ubezpieczenia krótsza niż 30 dni | INFO | 200 | Po ustaniu ubezpieczenia zasiłek przysługuje, gdy niezdolność do pracy trwa bez przerwy co najmniej 30 dni. Twoja trwa [liczba dni] dni. Złożysz wniosek, gdy lekarz przedłuży zaświadczenie. |
| 0237 | Okoliczność wyłączająca zasiłek po ustaniu ubezpieczenia | INFO | 200 | Przy tej odpowiedzi zasiłek chorobowy po ustaniu ubezpieczenia nie przysługuje. Sprawdź odpowiedź albo zapytaj ZUS o swoją sytuację. |
| 0238 | Puste pole informacji przy odpowiedzi tak | ERROR | 400 | Uzupełnij informacje przy odpowiedzi tak. |
| 0239 | Puste pole daty we wniosku o zasiłek chorobowy | ERROR | 400 | Podaj datę. |
| 0240 | Data we wniosku o zasiłek chorobowy w przyszłości | ERROR | 400 | Data nie może być późniejsza niż dzisiejsza. |
| 0241 | Wypłata zasiłku przekazem pocztowym | INFO | 200 | Bez numeru rachunku ZUS wypłaci zasiłek przekazem pocztowym na adres [adres]. |
| 0242 | Kolejne zaświadczenie za nieprzerwaną niezdolność do pracy | INFO | 200 | To zaświadczenie przedłuża niezdolność do pracy, za którą wniosek jest już złożony. Wnioskiem za ten okres może być ten wniosek albo wydruk zaświadczenia e-ZLA od lekarza. |
| 0243 | Data powrotu do pracy przed najwcześniejszym dniem | ERROR | 400 | Najwcześniej możesz wrócić do pracy [data]. Wcześniejszy powrót w czasie urlopu macierzyńskiego zaplanujesz w podziale urlopów jako przejęcie urlopu przez drugiego rodzica. |
| 0244 | Data powrotu do pracy po wyczerpaniu urlopu rodzicielskiego | ERROR | 400 | Najpóźniej możesz wrócić do pracy [data], bo wtedy kończy się urlop rodzicielski, który możesz wykorzystać. |
| 0245 | Data powrotu do pracy dopasowana do pełnych tygodni urlopu | INFO | 200 | Urlop rodzicielski liczymy w pełnych tygodniach, dlatego wrócisz do pracy [data]. |
| 0246 | Niższe wypłaty po wcześniejszym powrocie w wariancie 81,5% | INFO | 200 | Przy powrocie do pracy [data] w wariancie 81,5% otrzymasz łącznie o [kwota] mniej niż w wariancie 100% i 70%, bo zasiłek za urlop macierzyński wynosi 81,5% zamiast 100% podstawy. |
| 0247 | Data podjęcia ubezpieczenia po porodzie poza zakresem | ERROR | 400 | Podaj datę po dniu porodu, najpóźniej [data], żeby zmieścić co najmniej 7 dni urlopu ojcowskiego, zanim dziecko skończy 12 miesięcy. |
| 0248 | Puste pole loginu eZUS | ERROR | 400 | Podaj login do eZUS. |
| 0249 | Puste pole hasła eZUS | ERROR | 400 | Podaj hasło do eZUS. |
| 0250 | Przerwane logowanie do eZUS | WARNING | 401 | Logowanie do eZUS zostało przerwane. Zaloguj się ponownie, żeby otworzyć przewodnik. |
| 0251 | Przerwane logowanie kodem z aplikacji mZUS | WARNING | 401 | Logowanie kodem z aplikacji mZUS zostało przerwane. Zaloguj się ponownie, żeby otworzyć przewodnik. |
| 0252 | Wygasły kod logowania z aplikacji mZUS | WARNING | 401 | Kod logowania stracił ważność po 2 minutach. Potwierdź w aplikacji mZUS nowy kod. |
| 0253 | Puste pole daty urodzenia nowego konta | ERROR | 400 | Podaj datę urodzenia. |
| 0254 | Wiek spoza zakresu nowego konta | ERROR | 400 | Nowe konto w wersji demonstracyjnej zakłada osoba w wieku od 16 do 60 lat. Podaj inną datę urodzenia. |
| 0255 | Dane osobowe zastąpione danymi losowymi | INFO | 200 | Imię, nazwisko i numer PESEL z dokumentu zastąpiliśmy danymi losowymi z tą samą datą urodzenia i płcią. Daty, okresy i kwoty zostały takie jak w dokumencie. |
| 0256 | Asystent bez profilu rodziny | INFO | 200 | Odpowiadam na podstawie Twoich danych z konta ZUS i katalogu świadczeń. Uzupełnij profil na start, żebym mógł odpowiadać o planie i terminach Twojej rodziny. |
| 0257 | Pusta lista wniosków | INFO | 200 | Wnioski złożone, przygotowane i wysłane w przewodniku pojawią się na tej liście. |
| 0258 | Rezygnacja przy ojcu bez ubezpieczenia chorobowego | INFO | 200 | Z dalszej części urlopu macierzyńskiego zrezygnujesz, gdy pozostałą część urlopu przejmie ojciec dziecka zatrudniony na umowie o pracę albo objęty ubezpieczeniem chorobowym, który przerwie pracę zarobkową, żeby opiekować się dzieckiem. |
| 0259 | Brak daty uprawomocnienia przysposobienia przy zgłoszeniu do ubezpieczenia zdrowotnego | INFO | 200 | Dziecko zgłosisz do ubezpieczenia zdrowotnego w ciągu 7 dni od dnia uprawomocnienia się orzeczenia o przysposobieniu. Dopisz tę datę w profilu, gdy ją poznasz. |
| 0260 | Zaświadczenie płatnika składek Z-3a do wniosku o zasiłek macierzyński | INFO | 200 | Do wniosku o zasiłek macierzyński potrzebne jest zaświadczenie płatnika składek Z-3a. Wypełnia je Twój zleceniodawca, który może przekazać je do ZUS przez eZUS. Poproś zleceniodawcę o to zaświadczenie. |
| 0261 | Rezygnacja z części zasiłku macierzyńskiego u zleceniodawcy | INFO | 200 | Zasiłek macierzyński wypłaca Ci zleceniodawca. Z dalszej części zasiłku zrezygnujesz pisemnym wnioskiem złożonym zleceniodawcy, z datą, od której rezygnujesz, razem z oświadczeniem, od kiedy ojciec dziecka przejmie zasiłek. Złóż je przed dniem, od którego rezygnujesz. Pozostałą część zasiłku drugi rodzic otrzyma na swój wniosek. |
| 0262 | Decyzja o odmowie wydania zaświadczenia o niezaleganiu | WARNING | 201 | Na dzień [data] masz zadłużenie z tytułu składek w kwocie [kwota], dlatego ZUS wydaje decyzję o odmowie wydania zaświadczenia o niezaleganiu w opłacaniu składek. Decyzja jest gotowa do pobrania. |
| 0263 | Dzieci po wieku granicznym poza wymiarem urlopu | INFO | 200 | Wymiar urlopu na warunkach urlopu macierzyńskiego i urlopu rodzicielskiego liczymy dla [liczba dzieci] przyjętych dzieci, które w dniu przyjęcia nie ukończyły [wiek] lat. |
| 0264 | Uzyskanie zaświadczenia o martwym urodzeniu po poronieniu | INFO | 200 | Poproś lekarza albo położną o zaświadczenie o martwym urodzeniu. Lekarz albo położna wystawia je bez względu na czas trwania ciąży, a zaświadczenie jest podstawą urlopu macierzyńskiego i zasiłku macierzyńskiego po poronieniu. Gdy je otrzymasz, dopisz je w przewodniku do zapisanego poronienia. |
| 0265 | Prawo do urlopu i zasiłku po poronieniu po przedstawieniu zaświadczenia | INFO | 200 | Prawo do urlopu macierzyńskiego i zasiłku macierzyńskiego po poronieniu powstaje po przedstawieniu zaświadczenia o martwym urodzeniu. Dopisz zaświadczenie w przewodniku, a pokażemy okres zasiłku. |
| 0266 | Zasiłek chorobowy i zasiłek w wysokości zasiłku macierzyńskiego za ten sam okres | INFO | 200 | Za ten sam okres otrzymasz jeden zasiłek. Gdy ZUS przyzna Ci zasiłek w wysokości zasiłku macierzyńskiego, zaliczy na jego poczet zasiłek chorobowy wypłacony za ten okres. |
| 0267 | Wyrównanie zasiłku do 100% po przyjęciu dziecka | INFO | 200 | Urlop rodzicielski zaczyna się po pierwszych urodzinach dziecka, więc zasiłek za ten urlop wyniesie 70%, a za urlop na warunkach urlopu macierzyńskiego otrzymasz na wniosek jednorazowe wyrównanie do 100%. |
| 0268 | Uzupełniający urlop macierzyński drugiego rodzica | ERROR | 400 | Z zasiłku za okres uzupełniającego urlopu macierzyńskiego korzysta jedno z rodziców. Wniosek złożysz, gdy drugi rodzic z niego nie korzysta. |
| 0269 | Wniosek o zasiłek za uzupełniający urlop macierzyński po końcu urlopu macierzyńskiego | WARNING | 409 | Wniosek o zasiłek za okres uzupełniającego urlopu macierzyńskiego składasz najpóźniej w ostatnim dniu zasiłku za urlop macierzyński, czyli do [data]. Zapytaj ZUS o swoją sytuację. |
| 0270 | Nieprawidłowa liczba hektarów przeliczeniowych | ERROR | 400 | Podaj liczbę hektarów przeliczeniowych większą od 0, z najwyżej dwoma miejscami po przecinku. |
| 0271 | Zbyt długi tekst pola | ERROR | 400 | Tekst może mieć najwyżej [liczba znaków] znaków. |
| 0272 | Płatnik zasiłku przewidywany | INFO | 200 | Kto wypłaci zasiłek od [rok początku zasiłku], zależy od liczby osób zgłoszonych przez płatnika do ubezpieczenia chorobowego według stanu na 30 listopada [rok poprzedzający rok początku zasiłku]. Do czasu odczytu tej informacji z konta ZUS pokazujemy płatnika według stanu na 30 listopada [rok stanu w danych konta ZUS]. |
| 0273 | Pusta data wystąpienia do sądu o przysposobienie | ERROR | 400 | Podaj datę złożenia w sądzie wniosku o przysposobienie dziecka. |
| 0274 | Data wystąpienia do sądu o przysposobienie zbyt odległa | ERROR | 400 | Podaj datę złożenia w sądzie wniosku o przysposobienie przypadającą najpóźniej za 12 miesięcy od dziś. |
| 0275 | Pytanie medyczne do asystenta | INFO | 200 | Na pytania o zdrowie, leki i przebieg ciąży odpowie lekarz albo położna, którzy opiekują się Tobą i dzieckiem. W nagłej sytuacji zadzwoń pod numer alarmowy 112. |
| 0276 | Pytanie podatkowe do asystenta | INFO | 200 | Na pytania o podatki odpowie Krajowa Informacja Skarbowa. |
| 0277 | Brak zgody matki na dane dotyczące zdrowia | WARNING | 403 | Tę sytuację zapisze mama albo zapiszesz ją po udzieleniu przez mamę zgody na dane dotyczące zdrowia w przewodniku. |
| 0278 | Niezdolność do pracy w czasie urlopu wychowawczego albo bezpłatnego | INFO | 200 | Za niezdolność do pracy w czasie urlopu wychowawczego albo bezpłatnego zasiłek chorobowy nie przysługuje. Jeżeli urodzisz dziecko w czasie urlopu wychowawczego, przysługuje Ci zasiłek macierzyński. |
| 0279 | Praca zarobkowa w czasie zwolnienia lekarskiego | INFO | 200 | W czasie zwolnienia lekarskiego powstrzymaj się od pracy zarobkowej, także w swojej firmie. Praca zarobkowa w czasie zwolnienia odbiera zasiłek za cały okres zwolnienia, z wyjątkiem incydentalnych czynności wymaganych istotnymi okolicznościami innymi niż polecenie pracodawcy. |
| 0280 | Nieprawidłowy numer KRS organizacji | ERROR | 400 | Podaj numer KRS organizacji z 10 cyframi. |
| 0281 | Wniosek o urlop wychowawczy później niż 21 dni przed urlopem | WARNING | 200 | Wniosek o urlop wychowawczy składasz co najmniej 21 dni przed jego rozpoczęciem. Po wniosku złożonym później pracodawca udzieli urlopu najpóźniej od dnia, w którym upływa 21 dni od złożenia wniosku. |
| 0282 | Wniosek o obniżenie wymiaru czasu pracy później niż 21 dni przed obniżeniem | WARNING | 200 | Wniosek o obniżenie wymiaru czasu pracy składasz co najmniej 21 dni przed rozpoczęciem pracy w obniżonym wymiarze. Po wniosku złożonym później pracodawca obniży wymiar czasu pracy najpóźniej od dnia, w którym upływa 21 dni od złożenia wniosku. |
| 0283 | Przekroczony wymiar urlopu wychowawczego | ERROR | 400 | Ten okres razem z wykorzystanym urlopem wychowawczym przekracza przysługujący wymiar. Do wykorzystania zostało [pozostały wymiar]. |
| 0284 | Nieprawidłowy wymiar czasu pracy po obniżeniu | ERROR | 400 | Podaj wymiar czasu pracy od 50% do 99% pełnego wymiaru. |
| 0285 | Okres obniżenia wymiaru czasu pracy dłuższy niż pozostały urlop wychowawczy | ERROR | 400 | Po wykorzystaniu części urlopu wychowawczego pracujesz w obniżonym wymiarze najwyżej przez okres pozostałego urlopu, czyli [pozostały wymiar]. Podaj krótszy okres. |
| 0286 | Wniosek o obniżenie wymiaru czasu pracy wysłany | INFO | 201 | Wniosek trafił do pracodawcy [data]. Pracodawca obniży Twój wymiar czasu pracy zgodnie z wnioskiem, a szczególna ochrona przed wypowiedzeniem przysługuje Ci od [data początku ochrony] do [data końca ochrony]. |
| 0287 | Urlop wychowawczy przed 6 miesiącami zatrudnienia | INFO | 200 | Wniosek o urlop wychowawczy i o obniżenie wymiaru czasu pracy przygotujesz po 6 miesiącach zatrudnienia, czyli od [data]. Do 6 miesięcy wliczamy także poprzednie okresy zatrudnienia. |
| 0288 | Przekroczona liczba części urlopu wychowawczego | ERROR | 400 | Urlop wychowawczy na dziecko wykorzystujecie najwyżej w 5 częściach, a ten wniosek byłby szóstą częścią. |
| 0289 | Nieprawidłowa liczba dni pobytu dziecka w szpitalu po porodzie | ERROR | 400 | Podaj liczbę dni od 0 do 52. |
