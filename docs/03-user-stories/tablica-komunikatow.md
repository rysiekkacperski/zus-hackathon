# Tablica kodów komunikatów do użytkownika

## Metadata

| Pole | Wartość |
| --- | --- |
| Wykonawca | Ryszard Kacperski |
| Właściciel merytoryczny | Ryszard Kacperski |
| Status | robocze |
| Wersja | 0.2.0 |
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
