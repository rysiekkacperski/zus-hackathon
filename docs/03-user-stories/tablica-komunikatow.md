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
| 0002 | Nieaktualne dane z konta ZUS | WARNING | 200 | Pokazujemy dane z ZUS z dnia [data odczytu]. Odświeżymy je przy następnym otwarciu przewodnika. |
| 0003 | Błąd zapisu danych | ERROR | 500 | Nie udało się zapisać zmian. Spróbuj ponownie. |
| 0004 | Brak zgody na dane dotyczące zdrowia | WARNING | 403 | Bez Twojej zgody nie zapiszemy danych o ciąży i dziecku. Plan pokaże sprawy, które od nich nie zależą. |
| 0005 | Zgoda na dane dotyczące zdrowia wycofana | INFO | 200 | Zgoda wycofana. Dane o ciąży i dziecku usuniemy w ciągu 30 dni. |
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
| 0033 | Sprawa oznaczona jako załatwiona | INFO | 200 | Gotowe. Nie będziemy już przypominać o tej sprawie. |
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
| 0053 | Wyłączone powiadomienia w telefonie | WARNING | 200 | Włącz powiadomienia dla mZUS w ustawieniach telefonu, żeby dostawać przypomnienia o terminach. |
| 0054 | Brak dostępu do kalendarza telefonu | ERROR | 403 | mZUS nie ma dostępu do kalendarza. Zezwól na dostęp w ustawieniach telefonu i spróbuj ponownie. |
| 0055 | Terminy dodane do kalendarza | INFO | 200 | Dodaliśmy terminy do kalendarza w Twoim telefonie. |
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
| 0070 | Pytanie poza zakresem asystenta | INFO | 200 | Na to pytanie odpowie konsultant ZUS. Możesz napisać wiadomość do ZUS, umówić e-wizytę albo napisać na mama@zus.pl. |
| 0071 | Asystent niedostępny | ERROR | 503 | Asystent jest chwilowo niedostępny. Spróbuj ponownie za chwilę albo skorzystaj z planu. |
| 0072 | Przerwane logowanie przez mObywatela | WARNING | 401 | Logowanie przez mObywatela zostało przerwane. Zaloguj się ponownie, żeby otworzyć przewodnik. |
| 0073 | Puste pole daty zmiany zatrudnienia | ERROR | 400 | Podaj datę rozpoczęcia albo zakończenia pracy. |
| 0074 | Data zmiany zatrudnienia poza okresem ciąży | ERROR | 400 | Podaj datę z okresu ciąży, najwcześniej 280 dni przed przewidywanym terminem porodu i najpóźniej w dniu tego terminu. |
| 0075 | Data ustania zatrudnienia przed datą rozpoczęcia | ERROR | 400 | Data zakończenia pracy nie może być wcześniejsza niż data jej rozpoczęcia. |
| 0076 | Naruszenie przepisów bez prawomocnego wyroku | INFO | 200 | Po rozwiązaniu umowy z naruszeniem przepisów zasiłek macierzyński po porodzie przysługuje, gdy naruszenie potwierdzi prawomocny wyrok sądu. |
| 0077 | Puste pole wymiaru | ERROR | 400 | Podaj wymiar. |
| 0078 | Nieprawidłowy wymiar | ERROR | 400 | Podaj liczbę całkowitą większą od zera. |
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
| 0105 | Nierozpoznany rodzaj dokumentu | ERROR | 422 | Nie rozpoznaliśmy dokumentu. Wgraj wniosek ZAM, zaświadczenie Z-3, zaświadczenie Z-3a albo poświadczenie ubezpieczenia chorobowego. |
| 0106 | Nieczytelny dokument | ERROR | 422 | Nie udało się odczytać danych z dokumentu. Wgraj wyraźniejszy plik albo wpisz dane sam. |
| 0107 | Dane odczytane z pomocą AI | INFO | 200 | Dane odczytaliśmy z dokumentu z pomocą sztucznej inteligencji. Sprawdź je i popraw, zanim przejdziesz dalej. |
| 0108 | Odczyt dokumentu niedostępny | ERROR | 503 | Odczyt dokumentu jest chwilowo niedostępny. Spróbuj ponownie za chwilę albo wybierz sprawę z listy. |
| 0109 | Brak danych do weryfikacji ubezpieczenia | ERROR | 409 | Do weryfikacji potrzebny jest tytuł ubezpieczenia, okres ubezpieczenia chorobowego i data zdarzenia. Uzupełnij dane sprawy. |
| 0110 | Data końca okresu przed datą początku | ERROR | 400 | Data końca okresu nie może być wcześniejsza niż data jego początku. |
| 0111 | Wyliczenie zgodne z rozstrzygnięciem | INFO | 200 | Wyliczenie jest zgodne z rozstrzygnięciem sprawy. |
| 0112 | Wyliczenie różne od rozstrzygnięcia | WARNING | 200 | Wyliczenie różni się od rozstrzygnięcia sprawy. Sprawdź dane sprawy i zastosowane reguły. |
| 0113 | Dokument sprawy usunięty | INFO | 410 | Dokument tej sprawy został usunięty po 24 godzinach. Wgraj go ponownie. |
| 0114 | Brak zaświadczeń lekarskich e-ZLA | INFO | 200 | Nie masz zaświadczeń lekarskich z ostatnich 12 miesięcy. |
| 0115 | Okres zasiłkowy bliski wyczerpania | WARNING | 200 | Do końca okresu zasiłkowego zostało [liczba dni] dni. |
| 0116 | Zadłużenie z tytułu składek | WARNING | 200 | Na dzień [data] masz zadłużenie z tytułu składek w kwocie [kwota]. Sprawdź, jak wpływa ono na prawo do zasiłku. |
| 0117 | Brak zadłużenia z tytułu składek | INFO | 200 | Na dzień [data] nie masz zadłużenia z tytułu składek. |
| 0118 | Zaświadczenie o stanie rozliczeń wystawione | INFO | 201 | Zaświadczenie o stanie rozliczeń jest gotowe do pobrania. |
| 0119 | Tytuł ubezpieczenia podjęty w ciąży | WARNING | 200 | Twoja umowa albo działalność zaczęła się w czasie ciąży. ZUS może sprawdzić, czy zgłoszenie do ubezpieczenia służyło wyłącznie uzyskaniu zasiłku. |
| 0120 | Brak ubezpieczenia chorobowego w dniu porodu | WARNING | 200 | Twoje ubezpieczenie chorobowe skończy się [data], przed przewidywanym terminem porodu. Bez ubezpieczenia w dniu porodu zasiłek macierzyński nie przysługuje. |
| 0121 | Umowa przedłużona do dnia porodu | INFO | 200 | Twoja umowa przedłuży się do dnia porodu. |
| 0122 | Puste pole nazwy organizacji | ERROR | 400 | Podaj nazwę organizacji. |
| 0123 | Nieprawidłowy adres strony organizacji | ERROR | 400 | Podaj adres strony zaczynający się od https://. |
| 0124 | Nieprawidłowy numer telefonu | ERROR | 400 | Podaj numer telefonu z 9 cyframi. |
| 0125 | Data uprawomocnienia przysposobienia w przyszłości | ERROR | 400 | Data uprawomocnienia orzeczenia nie może być późniejsza niż dzisiejsza. |
| 0126 | Sytuacja szczególna zapisana | INFO | 200 | Zapisaliśmy zmianę. Pokazujemy sprawy, które teraz dotyczą Twojej rodziny. |
| 0127 | Data zdarzenia w przyszłości | ERROR | 400 | Data zdarzenia nie może być późniejsza niż dzisiejsza. |
| 0128 | Spokojny tryb wyłączony | INFO | 200 | Przywróciliśmy wszystkie sprawy i przypomnienia. |
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
