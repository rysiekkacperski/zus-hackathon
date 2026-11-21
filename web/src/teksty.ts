import type { IdWidoku } from '@/domena/typy';

export const teksty = {
  wspolne: {
    nazwaAplikacji: "Przewodnik przyszłej mamy",
    opisAplikacji: "Moduł mZUS dla przyszłych i świeżo upieczonych rodziców",
    // Komponenty podstawowe (komponenty/przycisk.tsx … format.ts)
    przyciski: {
      dalej: "Przejdź dalej",
      wroc: "Wróć",
      anuluj: "Anuluj",
      zapisz: "Zapisz",
      zamknij: "Zamknij",
      wybierz: "Wybierz",
      zmien: "Zmień",
      usun: "Usuń",
      pobierz: "Pobierz",
      drukuj: "Drukuj",
      sprobujPonownie: "Spróbuj ponownie",
      zapiszDoDokonczenia: "Zapisz i dokończ później",
      wyslij: "Wyślij",
    },
    prefiksy: {
      ERROR: "Błąd:",
      WARNING: "Uwaga:",
      INFO: "Informacja:",
      SUCCESS: "Informacja:",
    },
    otwieraSieWNowejKarcie: "(otwiera się w nowej karcie)",
    wroc: "Wróć",
    ladowanie: "Ładujemy dane przewodnika.",
    trybDemonstracyjny: "Tryb demonstracyjny",
    zl: "zł",
    stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
    zDnia: ({ data }: { data: string }) => `z dnia ${data}`,
    miesiace: [
      "styczeń",
      "luty",
      "marzec",
      "kwiecień",
      "maj",
      "czerwiec",
      "lipiec",
      "sierpień",
      "wrzesień",
      "październik",
      "listopad",
      "grudzień",
    ],
    etykiety: {
      statusySpraw: {
        "do-zrobienia": "Do zrobienia",
        zlozona: "Złożona",
        zalatwiona: "Załatwiona",
        "wymaga-uzupelnienia-profilu": "Wymaga uzupełnienia profilu",
      },
      zrodlaStatusu: {
        "wyliczenie-planu": "Źródło: wyliczenie planu",
        "odpowiedz-rodzica": "Źródło: Twoja odpowiedź",
        "dane-zus": "Źródło: konto ZUS",
        "kreator-wniosku": "Źródło: wniosek z przewodnika",
        asystent: "Źródło: działanie potwierdzone w asystencie",
      },
      zrodlaDanych: {
        "konto-zus": "Z konta ZUS",
        "pelnomocnictwo-pel": "Z pełnomocnictwa PEL",
        "odpowiedz-rodzica": "Twoja odpowiedź",
        "profil-rodziny": "Z profilu rodziny",
        "przykladowa-sprawa": "Z przykładowej sprawy",
        "wartosc-w-kalkulatorze": "Wartość w kalkulatorze",
        "wartosc-domyslna": "Wartość domyślna",
      },
    },
    trescAI: "Odpowiedź przygotował asystent oparty na sztucznej inteligencji.",
    ekranZastepczy: {
      naglowek: "Ekran zastępczy",
      opis: ({ jednostka }: { jednostka: string }) =>
        `Ten widok buduje jednostka ${jednostka}. Przejdź dalej, aby sprawdzić ścieżkę.`,
      identyfikator: ({ idWidoku }: { idWidoku: string }) => `Identyfikator widoku: ${idWidoku}`,
      dalej: ({ tytul }: { tytul: string }) => `Dalej: ${tytul}`,
      // Ekrany zastępcze z podstawowym działaniem (kontrakt 2.4); właściciel widoku zastępuje je w całości.
      dzialajacy: ({ jednostka }: { jednostka: string }) =>
        `Ekran zastępczy z podstawowym działaniem do testów. Docelowy widok buduje jednostka ${jednostka}.`,
      element: ({ jednostka }: { jednostka: string }) => `Ten element buduje jednostka ${jednostka}.`,
      start: {
        wstep: "Spodziewasz się dziecka? Przewodnik ułoży plan świadczeń Twojej rodziny, policzy terminy i pomoże przygotować wnioski.",
        sposobyLogowania: "Zaloguj się do przewodnika",
        sposoby: {
          mobywatel: { tytul: "mObywatel", opis: "Zaloguj się przez mObywatela i zeskanuj kod QR w aplikacji." },
          ezus: { tytul: "Login i hasło eZUS", opis: "Zaloguj się loginem i hasłem do eZUS." },
          mzus: { tytul: "Kod z aplikacji mZUS", opis: "Zaloguj się kodem, który potwierdzisz w aplikacji mZUS." },
        },
        wyborKonta: "Wybierz konto w trybie demonstracyjnym",
      },
      makieta: {
        opis: "To makieta, która symuluje logowanie. Nie wpisuj prawdziwego loginu ani hasła.",
        potwierdz: "Potwierdź logowanie (makieta)",
        przerwij: "Przerwij logowanie",
      },
      wyborKonta: {
        wstep: "Wybierz konto, którym otworzysz przewodnik. Przewodnik działa tak, jakby jego właściciel zalogował się do przewodnika.",
        podpis: "Konta demonstracyjne",
        przewijanie: "Lista kont demonstracyjnych",
        kolumny: { konto: "Konto", opis: "Forma zatrudnienia albo rodzaj konta", stan: "Stan w przewodniku", akcje: "Akcje" },
        pierwszeLogowanie: "Pierwsze logowanie",
        zaloguj: "Zaloguj się",
        zalogujKonto: ({ imieINazwisko }: { imieINazwisko: string }) => `Zaloguj się jako ${imieINazwisko}`,
        przywroc: "Przywróć stan początkowy",
        przywrocKonto: ({ imieINazwisko }: { imieINazwisko: string }) =>
          `Przywróć stan początkowy konta ${imieINazwisko}`,
        przywrocono: ({ imieINazwisko }: { imieINazwisko: string }) =>
          `Przywróciliśmy stan początkowy konta ${imieINazwisko}.`,
        noweKonto: "Nowe konto",
        ustawieniaDemo: "Ustawienia trybu demonstracyjnego",
        opisyForm: {
          "jdg-z-dobrowolnym": "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
          "umowa-o-prace": "Umowa o pracę",
          "umowa-zlecenia-z-dobrowolnym": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
          "jdg-bez-dobrowolnego": "Jednoosobowa działalność gospodarcza bez dobrowolnego ubezpieczenia chorobowego",
          "umowa-o-prace-ustala-w-ciazy": "Umowa o pracę, która ustała w ciąży",
          "jdg-rozpoczeta-w-ciazy": "Jednoosobowa działalność gospodarcza rozpoczęta w ciąży, z dobrowolnym ubezpieczeniem chorobowym",
          administrator: "Administrator",
        },
        rodzajeKont: {
          "przykladowe-konto-rodzica": "Przykładowe konto rodzica",
          "konto-administratora": "Konto administratora",
          "nowe-konto": "Nowe konto",
        },
      },
      daneZus: {
        stanOdczytu: "Stan odczytu danych z konta ZUS",
        kopia: "Kopia danych z konta ZUS",
        brakKopii: "Konto nie ma jeszcze kopii danych z konta ZUS.",
        podgladStanu: "Podgląd stanu odczytu danych z konta ZUS",
        podgladKopii: "Podgląd kopii danych z konta ZUS",
        odczytajPonownie: "Odczytaj dane z konta ZUS ponownie",
      },
      plan: {
        podpis: "Pozycje planu rodziny",
        brakRodziny: "Konto nie ma jeszcze profilu rodziny ani planu.",
        brakPozycji: "Plan rodziny nie ma jeszcze pozycji.",
        wyliczono: ({ data }: { data: string }) => `Plan wyliczono ${data}.`,
      },
      terminy: {
        podpis: "Terminy spraw",
        przewijanie: "Tabela terminów spraw",
        kolumny: { sprawa: "Sprawa", termin: "Termin", dni: "Dni do terminu", uwagi: "Uwagi" },
        brakTerminow: "Kalendarz nie ma jeszcze terminów.",
        bezTerminu: "Bez terminu",
        szacowany: "Termin szacowany",
        poTerminie: "Po terminie",
      },
    },
    brakUprawnien: {
      tytul: "Panel administracyjny",
      katalog: {
        naglowek: "Katalog zmienia tylko administrator",
        opis: "Katalog świadczeń, jego kwoty, progi, stawki i wymiary urlopów zmienia tylko konto z rolą Administrator. Rolę Administrator nadaje osoba, która już ją ma.",
        akcja: "Przejdź do planu rodziny",
      },
      podmiotyWsparcia: {
        naglowek: "Słownik podmiotów wsparcia",
        opis: "Słownik prowadzi konto z rolą Administrator. Organizacje wsparcia dla Twojej rodziny zobaczysz w planie rodziny, przy sprawie Wsparcie organizacji w sytuacji szczególnej, gdy ta sprawa jest w planie.",
        akcja: "Wróć do planu rodziny",
      },
    },
    // Pola formularzy (komponenty/pole*.tsx)
    prefiksBledu: "Błąd:",
    pola: {
      podpowiedzDaty: "Wpisz datę w formacie DD.MM.RRRR.",
      pokazHaslo: "Pokaż hasło",
      wybierzZListy: "Wybierz z listy",
      liczbaZnakow: ({ liczba, maks }: { liczba: string; maks: string }) =>
        `Wpisano ${liczba} z ${maks} znaków.`,
      liczbaPodpowiedzi: ({ liczba }: { liczba: string }) =>
        `Podpowiedzi na liście: ${liczba}. Wybierz jedną strzałkami w górę i w dół, a potem naciśnij Enter.`,
      brakPodpowiedzi: "Nie znaleźliśmy podpowiedzi dla wpisanego tekstu.",
    },
    // Komponenty złożone (komponenty/zakladki.tsx … pobieranie.ts)
    zlozone: {
      zmieniono: "Zmieniono",
      krokZ: ({ krok, liczbaKrokow }: { krok: number; liczbaKrokow: number }) =>
        `Krok ${krok} z ${liczbaKrokow}`,
      krokZNazwa: ({ krok, liczbaKrokow, nazwa }: { krok: number; liczbaKrokow: number; nazwa: string }) =>
        `Krok ${krok} z ${liczbaKrokow}: ${nazwa}`,
      stanKroku: {
        gotowe: "Gotowe",
        biezacy: "Teraz",
        pominiety: "Pominięty",
        oczekuje: "Przed Tobą",
      },
      kodWygasnieZa: "Kod wygaśnie za:",
      czasWaznosciKodu: "Czas ważności kodu logowania",
      czasSlownie: ({ minuty, sekundy }: { minuty: number; sekundy: number }) => {
        const odmiana = (n: number, jeden: string, kilka: string, wiele: string) =>
          n === 1 ? jeden : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? kilka : wiele;
        const czesci = [
          minuty > 0 ? `${minuty} ${odmiana(minuty, "minuta", "minuty", "minut")}` : null,
          sekundy > 0 || minuty === 0 ? `${sekundy} ${odmiana(sekundy, "sekunda", "sekundy", "sekund")}` : null,
        ];
        return czesci.filter(Boolean).join(" ");
      },
      drukujLubZapiszPdf: "Drukuj albo zapisz jako PDF",
    },
  },
  rama: {
    logo: "Przewodnik rodzica",
    logoEtykieta: "Przewodnik rodzica, strona główna",
    przejdzDoTresci: "Przejdź do treści",
    ladowanie: "Ładowanie przewodnika",
    powrotDoPrzewodnika: "Wróć do przewodnika",
    menuPrzewodnika: "Menu przewodnika",
    otworzMenu: "Otwórz menu",
    zamknijMenu: "Zamknij menu",
    zwinMenu: "Zwiń menu",
    rozwinMenu: "Rozwiń menu",
    menu: {
      planRodziny: "Plan rodziny",
      terminy: "Terminy",
      twojeWnioski: "Twoje wnioski",
      kalkulator: "Kalkulator zasiłku",
      przykladoweSprawy: "Przykładowe sprawy ZUS",
      profilNaStart: "Profil na start",
      katalog: "Katalog świadczeń",
      podmiotyWsparcia: "Podmioty wsparcia",
    },
    kontoPodpis: "Ustawienia i wylogowanie",
    kontoOtworzMenu: ({ imieINazwisko }: { imieINazwisko: string }) => `Konto: ${imieINazwisko}, otwórz menu konta`,
    kontoZamknijMenu: ({ imieINazwisko }: { imieINazwisko: string }) => `Konto: ${imieINazwisko}, zamknij menu konta`,
    menuKonta: "Menu konta",
    etykietyRol: {
      "nowy-uzytkownik": "Konto nowego użytkownika",
      rodzic: "Konto rodzica",
      "drugi-rodzic": "Konto drugiego rodzica",
      administrator: "Konto administratora",
    },
    ustawienia: "Ustawienia",
    wyloguj: "Wyloguj",
    asystent: "Asystent",
    zamknijAsystenta: "Zamknij asystenta",
    // Etykiety linku powrotu według widoku docelowego; brak wpisu daje teksty.wspolne.wroc.
    powrotDo: {} as Partial<Record<IdWidoku, string>>,
    // app/not-found.tsx: adres spoza mapy tras albo notFound() w trasie
    nieZnaleziono: {
      tytulStrony: "Nie znaleźliśmy strony",
      naglowek: "Nie znaleźliśmy strony",
      opis: "Sprawdź adres strony albo przejdź do strony głównej przewodnika.",
      akcja: "Przejdź do strony głównej przewodnika",
    },
  },
  komunikaty: {
    // Brak połączenia z danymi konta ZUS
    "0001": "Nie udało się pobrać Twoich danych z ZUS. Spróbuj ponownie za chwilę.",
    // Nieaktualne dane z konta ZUS
    "0002": ({ dataOdczytu }: { dataOdczytu: string }) =>
      `Pokazujemy dane z ZUS z dnia ${dataOdczytu}. Odświeżymy je przy następnym otwarciu przewodnika.`,
    // Błąd zapisu danych
    "0003": "Nie udało się zapisać zmian. Spróbuj ponownie.",
    // Brak zgody na dane dotyczące zdrowia
    "0004": "Bez Twojej zgody nie zapiszemy danych o ciąży i dziecku. Plan pokaże sprawy, które od nich nie zależą.",
    // Zgoda na dane dotyczące zdrowia wycofana
    "0005": "Zgoda wycofana. Dane o ciąży i dziecku usuniemy w ciągu 30 dni.",
    // Brak wyboru z listy
    "0006": "Wybierz jedną z opcji.",
    // Puste pole przewidywanego terminu porodu
    "0007": "Podaj przewidywany termin porodu.",
    // Przewidywany termin porodu w przeszłości
    "0008": "Ten termin już minął. Jeśli dziecko się urodziło, podaj datę porodu.",
    // Przewidywany termin porodu zbyt odległy
    "0009": "Podaj termin porodu przypadający w ciągu 280 dni od dziś.",
    // Nieprawidłowy format daty
    "0010": "Podaj datę w formacie DD.MM.RRRR.",
    // Data wizyty u lekarza albo położnej w przyszłości
    "0011": "Data wizyty nie może być późniejsza niż dzisiejsza.",
    // Data wizyty u lekarza albo położnej przed początkiem ciąży
    "0012": "Data wizyty nie może być wcześniejsza niż początek ciąży.",
    // Puste pole gminy
    "0013": "Wybierz gminę, w której mieszkasz.",
    // Brak gminy na liście
    "0014": "Nie znaleźliśmy takiej gminy. Sprawdź nazwę i wybierz gminę z listy.",
    // Puste pole dochodu na osobę
    "0015": "Podaj miesięczny dochód netto na osobę w rodzinie.",
    // Nieprawidłowa kwota
    "0016": "Podaj kwotę w złotych, na przykład 1850,50.",
    // Profil zapisany
    "0017": "Twój plan jest gotowy.",
    // Puste pole daty porodu
    "0018": "Podaj datę porodu.",
    // Data porodu w przyszłości
    "0019": "Data porodu nie może być późniejsza niż dzisiejsza.",
    // Data porodu zbyt odległa
    "0020": "Przewodnik obejmuje dzieci urodzone w ciągu ostatnich 36 miesięcy.",
    // Nieprawidłowy tydzień ciąży w dniu porodu
    "0021": "Podaj tydzień ciąży od 22 do 44.",
    // Nieprawidłowa masa urodzeniowa
    "0022": "Podaj masę urodzeniową w gramach, od 300 do 7000.",
    // Nieprawidłowa liczba dni hospitalizacji
    "0023": "Podaj liczbę dni od 0 do 24.",
    // Puste pole numeru PESEL
    "0024": "Podaj numer PESEL.",
    // Nieprawidłowa liczba cyfr PESEL
    "0025": "Numer PESEL ma 11 cyfr.",
    // Nieprawidłowa cyfra kontrolna PESEL
    "0026": "Ten numer PESEL jest nieprawidłowy. Sprawdź cyfry.",
    // PESEL dziecka niezgodny z datą porodu
    "0027": "Data urodzenia zapisana w numerze PESEL różni się od daty porodu.",
    // Puste pole imienia
    "0028": "Podaj imię.",
    // Puste pole nazwiska
    "0029": "Podaj nazwisko.",
    // Niedozwolone znaki w imieniu lub nazwisku
    "0030": "Imię i nazwisko mogą zawierać litery, spację, łącznik i apostrof.",
    // Puste pole miejsca urodzenia
    "0031": "Podaj miejscowość, w której urodziło się dziecko.",
    // Nowe dziecko w danych ZUS
    "0032": "W Twoich danych w ZUS pojawiło się dziecko. Potwierdź datę porodu, a przygotujemy sprawy na najbliższe tygodnie.",
    // Sprawa oznaczona jako załatwiona
    "0033": "Gotowe. Nie będziemy już przypominać o tej sprawie.",
    // Cofnięcie oznaczenia sprawy
    "0034": "Sprawa wróciła do listy spraw do zrobienia.",
    // Błąd otwarcia kanału instytucji
    "0035": "Nie udało się otworzyć serwisu instytucji. Spróbuj ponownie.",
    // Wniosek ZAM niedostępny dla pracownika
    "0036": "Jako pracownik wnioskujesz o urlop u pracodawcy. Pokażemy Ci, jak to zrobić.",
    // Brak potwierdzonej daty porodu
    "0037": "Najpierw potwierdź datę porodu i dane dziecka.",
    // Minął termin na wariant 81,5%
    "0038": "Minęło 21 dni od porodu, więc zasiłek za okres urlopu rodzicielskiego otrzymasz w wysokości 70%.",
    // Puste pole numeru rachunku
    "0039": "Podaj numer rachunku do wypłaty zasiłku.",
    // Nieprawidłowa liczba cyfr rachunku
    "0040": "Numer rachunku ma 26 cyfr.",
    // Nieprawidłowa suma kontrolna rachunku
    "0041": "Ten numer rachunku jest nieprawidłowy. Sprawdź cyfry.",
    // Data początku urlopu poza dopuszczalnym zakresem
    "0042": "Podaj datę z zakresu wskazanego przy polu.",
    // Brak potwierdzenia oświadczeń
    "0043": "Potwierdź oświadczenia, aby wysłać wniosek.",
    // Błąd wysyłki wniosku do ZUS
    "0044": "Nie udało się wysłać wniosku. Zapisaliśmy Twoje dane, spróbuj ponownie za chwilę.",
    // Wniosek wysłany do ZUS
    "0045": "Wniosek trafił do ZUS. Status sprawdzisz w swoim planie.",
    // Wniosek przygotowany dla płatnika
    "0046": "Wniosek jest gotowy. Przekaż go płatnikowi razem ze skróconym odpisem aktu urodzenia dziecka.",
    // Brak uprawnień do katalogu
    "0047": "Nie masz uprawnień do zmiany katalogu świadczeń.",
    // Puste pole kwoty
    "0048": "Podaj kwotę.",
    // Nieprawidłowy okres obowiązywania
    "0049": "Data początku musi być późniejsza niż data początku obowiązującej wartości.",
    // Nakładający się okres obowiązywania
    "0050": "W tym okresie obowiązuje już inna wartość. Zakończ jej obowiązywanie wcześniej.",
    // Zmiana katalogu zapisana
    "0051": "Zmiana zapisana. Plany rodzin uwzględnią ją przy najbliższym wyliczeniu.",
    // Nieprawidłowe wyprzedzenie przypomnienia
    "0052": "Wybierz wyprzedzenie od 1 do 30 dni.",
    // Nieprawidłowy kod weryfikacyjny SMS
    "0053": "Ten kod jest nieprawidłowy. Sprawdź kod z wiadomości SMS i wpisz go ponownie.",
    // Wygasły kod weryfikacyjny SMS
    "0054": "Kod stracił ważność po 10 minutach. Wyślij nowy kod.",
    // Pobrany plik kalendarza
    "0055": "Pobraliśmy plik z terminami. Otwórz go, żeby dodać terminy do swojego kalendarza.",
    // Ustawienia przypomnień zapisane
    "0056": "Zapisaliśmy ustawienia przypomnień.",
    // Data porodu potwierdzona
    "0057": "Gratulacje! Przeliczyliśmy Twój plan i terminy.",
    // Wniosek zapisany do dokończenia
    "0058": "Zapisaliśmy wniosek. Dokończysz go w dowolnej chwili w swoim planie.",
    // Puste pole adresu e-mail
    "0059": "Podaj adres e-mail, na który wyślemy przypomnienia.",
    // Nieprawidłowy adres e-mail
    "0060": "Wpisz adres e-mail w formacie nazwa@domena.pl.",
    // Nieprawidłowa liczba tygodni urlopu
    "0061": "Podaj liczbę tygodni z zakresu wskazanego przy polu.",
    // Brak numeru PESEL dziecka
    "0062": "Do wniosku potrzebny jest numer PESEL dziecka. Otrzymasz go po zgłoszeniu urodzenia w urzędzie stanu cywilnego.",
    // Data porodu różna od danych ZUS
    "0063": "Data urodzenia dziecka w danych ZUS różni się od daty porodu w Twoim profilu. Sprawdź i potwierdź właściwą datę.",
    // Brak prawa do zasiłku macierzyńskiego
    "0064": "Zasiłek macierzyński przysługuje osobom objętym ubezpieczeniem chorobowym. W planie zobaczysz świadczenie, które przysługuje Twojej rodzinie.",
    // Zaproszenie wysłane
    "0065": "Zaproszenie jest gotowe. Przekaż link drugiemu rodzicowi. Link działa przez 7 dni.",
    // Zaproszenie wygasło
    "0066": "Ten link wygasł. Poproś o nowe zaproszenie.",
    // Zaproszenie do własnej rodziny
    "0067": "To zaproszenie jest przeznaczone dla drugiego rodzica. Przekaż mu link.",
    // Konto należy już do innej rodziny
    "0068": "Twoje konto jest już połączone z inną rodziną w przewodniku.",
    // Drugi rodzic dołączył
    "0069": "Drugi rodzic dołączył do Waszego planu.",
    // Pytanie poza zakresem asystenta
    "0070": "Na to pytanie odpowie konsultant ZUS. Możesz napisać wiadomość do ZUS, umówić e-wizytę albo napisać na mama@zus.pl.",
    // Asystent niedostępny
    "0071": "Asystent jest chwilowo niedostępny. Spróbuj ponownie za chwilę albo skorzystaj z planu.",
    // Przerwane logowanie przez mObywatela
    "0072": "Logowanie przez mObywatela zostało przerwane. Zaloguj się ponownie, żeby otworzyć przewodnik.",
    // Puste pole daty zmiany zatrudnienia
    "0073": "Podaj datę rozpoczęcia albo zakończenia pracy.",
    // Data zmiany zatrudnienia poza okresem ciąży
    "0074": "Podaj datę z okresu ciąży, najwcześniej 280 dni przed przewidywanym terminem porodu i najpóźniej w dniu tego terminu.",
    // Data ustania zatrudnienia przed datą rozpoczęcia
    "0075": "Data zakończenia pracy nie może być wcześniejsza niż data jej rozpoczęcia.",
    // Naruszenie przepisów bez prawomocnego wyroku
    "0076": "Po rozwiązaniu umowy z naruszeniem przepisów zasiłek macierzyński po porodzie przysługuje, gdy naruszenie potwierdzi prawomocny wyrok sądu.",
    // Puste pole wymiaru
    "0077": "Podaj wymiar.",
    // Nieprawidłowy wymiar
    "0078": "Podaj liczbę całkowitą większą od zera.",
    // Nieprawidłowa stawka
    "0079": "Podaj stawkę w procentach, większą od zera i najwyżej 100, z najwyżej dwoma miejscami po przecinku.",
    // Puste pole tytułu pozycji katalogu
    "0080": "Podaj tytuł sprawy.",
    // Tytuł pozycji katalogu już istnieje
    "0081": "W katalogu jest już pozycja o tym tytule.",
    // Pozycja katalogu dodana
    "0082": "Pozycja dodana do katalogu. Plany rodzin uwzględnią ją przy najbliższym wyliczeniu.",
    // Brak ubezpieczenia chorobowego w ciąży
    "0083": "Nie podlegasz teraz ubezpieczeniu chorobowemu, więc zasiłek chorobowy Ci nie przysługuje. Zobacz, co możesz jeszcze zrobić.",
    // Okres wyczekiwania na zasiłek chorobowy
    "0084": ({ data, liczbaDni }: { data: string; liczbaDni: string }) =>
      `Prawo do zasiłku chorobowego uzyskasz ${data}, po ${liczbaDni} dniach ubezpieczenia chorobowego.`,
    // Ubezpieczenie chorobowe ustało w ciąży
    "0085": ({ data }: { data: string }) =>
      `Twoje ubezpieczenie chorobowe ustało ${data}. Sprawdź, jakie świadczenie przysługuje Ci do porodu i po porodzie.`,
    // Okres zasiłkowy wyczerpany
    "0086": "Okres zasiłkowy wynoszący 270 dni minął. Jeśli niezdolność do pracy trwa dalej, możesz wystąpić o świadczenie rehabilitacyjne.",
    // Płatnik zasiłku nieustalony przy dokumentach
    "0087": "Odpowiedz na pytanie o płatnika zasiłku, a pokażemy, gdzie złożyć dokumenty.",
    // Puste pole daty przyjęcia dziecka
    "0088": "Podaj datę przyjęcia dziecka na wychowanie.",
    // Data przyjęcia dziecka zbyt odległa
    "0089": "Podaj datę przyjęcia dziecka przypadającą najpóźniej za 12 miesięcy od dziś.",
    // Data urodzenia dziecka po dacie przyjęcia
    "0090": "Data urodzenia dziecka nie może być późniejsza niż data przyjęcia na wychowanie.",
    // Wiek dziecka poza zakresem urlopu na warunkach urlopu macierzyńskiego
    "0091": ({ wiek }: { wiek: string }) =>
      `Urlop na warunkach urlopu macierzyńskiego przysługuje do ukończenia przez dziecko ${wiek} lat. Sprawdź, jaki urlop przysługuje Ci w tej sytuacji.`,
    // Rodzina zastępcza zawodowa bez prawa do zasiłku
    "0092": "Rodzinie zastępczej zawodowej nie przysługuje urlop na warunkach urlopu macierzyńskiego ani zasiłek macierzyński za ten okres.",
    // Puste pole podstawy wymiaru
    "0093": "Podaj podstawę wymiaru zasiłku.",
    // Brak podstaw składek w danych ZUS
    "0094": "W danych ZUS nie ma podstaw składek z ubezpieczeniem chorobowym. Wpisz podstawę wymiaru zasiłku sam.",
    // Przekroczony wymiar urlopu rodzicielskiego
    "0095": ({ liczbaTygodni }: { liczbaTygodni: string }) =>
      `Suma tygodni urlopu rodzicielskiego obojga rodziców może wynieść najwyżej ${liczbaTygodni} tygodni.`,
    // Przekroczona liczba części urlopu rodzicielskiego
    "0096": "Urlop rodzicielski można podzielić na najwyżej 5 części.",
    // Przejęcie urlopu macierzyńskiego przed upływem 14 tygodni
    "0097": "Ojciec przejmuje urlop macierzyński po wykorzystaniu przez matkę co najmniej 14 tygodni po porodzie, a wcześniej w sytuacji szczególnej, którą wskazujesz przy polu.",
    // Nieprawidłowy wymiar pracy przy urlopie rodzicielskim
    "0098": "Podaj wymiar pracy od 1% do 50% etatu.",
    // Łączenie urlopu rodzicielskiego z pracą dla pracownika
    "0099": "Urlop rodzicielski z pracą łączy pracownik, który pracuje u pracodawcy udzielającego urlopu.",
    // Scenariusz zapisany w planie
    "0100": "Zapisaliśmy scenariusz w Twoim planie.",
    // Kalkulator bez profilu rodziny
    "0101": "Liczymy na danych wpisanych w kalkulatorze. Zapisz profil rodziny, żeby zachować wynik w planie.",
    // Data zgonu dziecka przed datą porodu
    "0102": "Data zgonu dziecka nie może być wcześniejsza niż data porodu.",
    // Nieobsługiwany format pliku
    "0103": "Wgraj plik w formacie PDF, JPG albo PNG.",
    // Plik zbyt duży
    "0104": "Plik może mieć najwyżej 10 MB.",
    // Nierozpoznany rodzaj dokumentu
    "0105": "Nie rozpoznaliśmy dokumentu. Wgraj dokument z zestawu przykładowych spraw ZUS, na przykład wniosek o zasiłek macierzyński, zaświadczenie płatnika składek, poświadczenie ubezpieczenia chorobowego albo zaświadczenie lekarskie.",
    // Nieczytelny dokument
    "0106": "Nie udało się odczytać danych z dokumentu. Wgraj wyraźniejszy plik albo wpisz dane sam.",
    // Dane odczytane z pomocą AI
    "0107": "Dane odczytaliśmy z dokumentu z pomocą sztucznej inteligencji. Sprawdź je i popraw, zanim przejdziesz dalej.",
    // Odczyt dokumentu niedostępny
    "0108": "Odczyt dokumentu jest chwilowo niedostępny. Spróbuj ponownie za chwilę albo wybierz sprawę z listy.",
    // Brak danych do weryfikacji ubezpieczenia
    "0109": "Do weryfikacji potrzebny jest tytuł ubezpieczenia, okres ubezpieczenia chorobowego i data zdarzenia. Uzupełnij dane sprawy.",
    // Data końca okresu przed datą początku
    "0110": "Data końca okresu nie może być wcześniejsza niż data jego początku.",
    // Wyliczenie zgodne z rozstrzygnięciem
    "0111": "Wyliczenie jest zgodne z rozstrzygnięciem sprawy.",
    // Wyliczenie różne od rozstrzygnięcia
    "0112": "Wyliczenie różni się od rozstrzygnięcia sprawy. Sprawdź dane sprawy i zastosowane reguły.",
    // Dokument sprawy usunięty
    "0113": "Dokument tej sprawy został usunięty po 24 godzinach. Wgraj go ponownie.",
    // Brak zaświadczeń lekarskich e-ZLA
    "0114": "Nie masz zaświadczeń lekarskich z ostatnich 12 miesięcy.",
    // Okres zasiłkowy bliski wyczerpania
    "0115": ({ liczbaDni }: { liczbaDni: string }) =>
      `Do końca okresu zasiłkowego zostało ${liczbaDni} dni.`,
    // Zadłużenie z tytułu składek
    "0116": ({ data, kwota }: { data: string; kwota: string }) =>
      `Na dzień ${data} masz zadłużenie z tytułu składek w kwocie ${kwota}. Sprawdź, jak wpływa ono na prawo do zasiłku.`,
    // Brak zadłużenia z tytułu składek
    "0117": ({ data }: { data: string }) =>
      `Na dzień ${data} nie masz zadłużenia z tytułu składek.`,
    // Zaświadczenie o stanie rozliczeń wystawione
    "0118": "Zaświadczenie o stanie rozliczeń jest gotowe do pobrania.",
    // Tytuł ubezpieczenia podjęty w ciąży
    "0119": "Twoja umowa albo działalność zaczęła się w czasie ciąży. ZUS może sprawdzić, czy zgłoszenie do ubezpieczenia służyło wyłącznie uzyskaniu zasiłku.",
    // Brak ubezpieczenia chorobowego w dniu porodu
    "0120": ({ data }: { data: string }) =>
      `Twoje ubezpieczenie chorobowe skończy się ${data}, przed przewidywanym terminem porodu. Bez ubezpieczenia w dniu porodu zasiłek macierzyński nie przysługuje.`,
    // Umowa przedłużona do dnia porodu
    "0121": "Twoja umowa przedłuży się do dnia porodu.",
    // Puste pole nazwy organizacji
    "0122": "Podaj nazwę organizacji.",
    // Nieprawidłowy adres strony organizacji
    "0123": "Podaj adres strony zaczynający się od https://.",
    // Nieprawidłowy numer telefonu
    "0124": "Podaj numer telefonu z 9 cyframi.",
    // Data uprawomocnienia przysposobienia w przyszłości
    "0125": "Data uprawomocnienia orzeczenia nie może być późniejsza niż dzisiejsza.",
    // Sytuacja szczególna zapisana
    "0126": "Zapisaliśmy zmianę. Pokazujemy sprawy, które teraz dotyczą Twojej rodziny.",
    // Data zdarzenia w przyszłości
    "0127": "Data zdarzenia nie może być późniejsza niż dzisiejsza.",
    // Spokojny tryb wyłączony
    "0128": "Wyłączyliśmy spokojny tryb. Przypomnienia o sprawach z Twojego planu wracają.",
    // Puste pole treści pytania
    "0129": "Napisz treść pytania.",
    // Pytanie zbyt długie
    "0130": "Pytanie może mieć najwyżej 2000 znaków.",
    // Pytanie wysłane do ZUS
    "0131": "Pytanie trafiło do ZUS. Odpowiedź zobaczysz w przewodniku i w eZUS.",
    // Odpowiedź ZUS na pytanie
    "0132": "ZUS odpowiedział na Twoje pytanie.",
    // Brak połączenia z PUE/eZUS
    "0133": "Nie udało się połączyć z eZUS. Spróbuj ponownie za chwilę.",
    // Puste pole adresu e-mail pracodawcy
    "0134": "Podaj adres e-mail pracodawcy.",
    // Wniosek wysłany do pracodawcy
    "0135": ({ data }: { data: string }) =>
      `Wniosek trafił do pracodawcy ${data}. Od dnia złożenia wniosku przysługuje Ci szczególna ochrona przed wypowiedzeniem.`,
    // Wniosek o urlop rodzicielski później niż 21 dni przed urlopem
    "0136": "Wniosek o urlop rodzicielski składasz co najmniej 21 dni przed jego rozpoczęciem. Wybierz późniejszą datę początku urlopu albo uzgodnij termin z pracodawcą.",
    // Wniosek o urlop ojcowski później niż 7 dni przed urlopem
    "0137": "Wniosek o urlop ojcowski składasz co najmniej 7 dni przed jego rozpoczęciem. Wybierz późniejszą datę początku urlopu albo uzgodnij termin z pracodawcą.",
    // Błąd wysyłki wniosku do pracodawcy
    "0138": "Nie udało się wysłać wniosku do pracodawcy. Zapisaliśmy go, spróbuj ponownie za chwilę.",
    // Wniosek o urlop gotowy do pobrania
    "0139": "Wniosek jest gotowy do pobrania i przekazania pracodawcy.",
    // Wniosek o urlop dla pracownika
    "0140": "Wniosek o urlop składa pracownik. Przy umowie zlecenia i działalności składasz wniosek o zasiłek macierzyński.",
    // Rezygnacja przed upływem 14 tygodni
    "0141": "Z dalszej części urlopu macierzyńskiego rezygnujesz po wykorzystaniu co najmniej 14 tygodni po porodzie.",
    // Rezygnacja później niż 7 dni przed powrotem
    "0142": "Rezygnację z części urlopu macierzyńskiego składasz pracodawcy co najmniej 7 dni przed powrotem do pracy. Wybierz późniejszą datę powrotu albo uzgodnij termin z pracodawcą.",
    // Rezygnacja złożona
    "0143": "Rezygnacja jest złożona. Drugi rodzic może złożyć wniosek o pozostałą część urlopu.",
    // Brak dokumentu sytuacji szczególnej
    "0144": "Do wniosku dołącz dokument potwierdzający sytuację, na przykład zaświadczenie ze szpitala.",
    // Wniosek o odpis aktu urodzenia złożony
    "0145": "Wniosek o odpis aktu urodzenia trafił do urzędu stanu cywilnego. Odpis otrzymasz w wybrany sposób.",
    // Brak aktu urodzenia w rejestrze
    "0146": "Nie znaleźliśmy aktu urodzenia dla podanych danych. Sprawdź dane dziecka.",
    // Brak połączenia z rejestrem stanu cywilnego
    "0147": "Nie udało się połączyć z rejestrem stanu cywilnego. Spróbuj ponownie za chwilę.",
    // Odpowiedź asystenta AI
    "0148": "Odpowiedź przygotował asystent oparty na sztucznej inteligencji na podstawie Twojego planu. Sprawdź szczegóły sprawy, zanim podejmiesz decyzję.",
    // Załączniki do wniosku
    "0149": ({ listaDokumentow }: { listaDokumentow: string }) =>
      `Do wniosku dołącz: ${listaDokumentow}.`,
    // Stan rozliczeń składek niedostępny
    "0150": "Nie udało się pobrać stanu rozliczeń składek. Potwierdź sam, że składki są opłacone.",
    // Puste pole stawki
    "0151": "Podaj stawkę.",
    // Puste pole instytucji i kanału
    "0152": "Podaj instytucję i kanał, w którym rodzic załatwia sprawę.",
    // Nieprawidłowe przesunięcie terminu
    "0153": "Podaj liczbę całkowitą od -366 do 366 dni albo od -36 do 36 miesięcy.",
    // Zadłużenie z tytułu składek ponad próg przy świadczeniu
    "0154": ({
      data,
      kwota,
      prog,
    }: {
      data: string;
      kwota: string;
      prog: string;
    }) =>
      `Na dzień ${data} zadłużenie z tytułu składek wynosi ${kwota} i przekracza ${prog}. Świadczenie przysługuje po spłacie całego zadłużenia, a spłata w ciągu 6 miesięcy daje świadczenie za cały okres.`,
    // Prawo do świadczenia zależne od opłacenia składek
    "0155": ({ prog }: { prog: string }) =>
      `Świadczenie przysługuje, jeżeli w dniu powstania prawa zadłużenie z tytułu składek nie przekracza ${prog}. Sprawdź stan rozliczeń składek przed złożeniem wniosku.`,
    // Świadczenia w ciąży ustalone z profilu rodziny
    "0156": "Wynik ustaliliśmy z odpowiedzi w profilu rodziny. Wynik z danymi z konta ZUS matka zobaczy po zalogowaniu na swoim koncie.",
    // Umowa bez przedłużenia do dnia porodu
    "0157": ({ data }: { data: string }) =>
      `Twoja umowa skończy się ${data} i nie przedłuży się do dnia porodu. Sprawdź, jak zachować ubezpieczenie chorobowe w dniu porodu.`,
    // Okres szczególnej ochrony pracownika
    "0158": ({ dataOd, dataDo }: { dataOd: string; dataDo: string }) =>
      `Szczególna ochrona Twojej umowy o pracę trwa od ${dataOd} do ${dataDo}.`,
    // Brak podmiotów wsparcia dla sytuacji
    "0159": "Pokazujemy wszystkie organizacje, które wspierają rodziców w trudnych chwilach. Możesz wybrać sytuację, w której szukasz pomocy.",
    // Puste pole zakresu pomocy organizacji
    "0160": "Opisz, w czym organizacja pomaga rodzicom.",
    // Organizacja istniejąca w słowniku
    "0161": "W słowniku jest już organizacja o tej nazwie.",
    // Brak potwierdzenia charakteru charytatywnego organizacji
    "0162": "Potwierdź, że organizacja działa wyłącznie charytatywnie.",
    // Puste pole daty urodzenia dziecka
    "0163": "Podaj datę urodzenia dziecka.",
    // Nieprawidłowa liczba dni pobytu dziecka w szpitalu
    "0164": ({ liczbaDni }: { liczbaDni: string }) =>
      `Podaj liczbę dni od 0 do ${liczbaDni}.`,
    // Minął termin na wariant 81,5% po przyjęciu dziecka
    "0165": "Minęło 21 dni od przyjęcia dziecka na wychowanie, więc zasiłek za okres urlopu rodzicielskiego otrzymasz w wysokości 70%.",
    // Wyliczenie po stracie dziecka
    "0166": "Bardzo nam przykro z powodu Twojej straty. Pokazujemy, jak długo i w jakiej wysokości przysługuje Ci zasiłek, oraz gdzie znajdziesz wsparcie.",
    // Puste pole daty zgonu dziecka
    "0167": "Podaj datę zgonu dziecka.",
    // Nieprawidłowa liczba dzieci, których dotyczy strata
    "0168": ({ liczbaDzieci }: { liczbaDzieci: string }) =>
      `Podaj liczbę od 1 do ${liczbaDzieci}.`,
    // Przejęcie urlopu macierzyńskiego przed upływem 8 tygodni
    "0169": "W tej sytuacji drugi rodzic przejmuje urlop macierzyński po wykorzystaniu przez matkę co najmniej 8 tygodni po porodzie.",
    // Nieprawidłowa liczba scenariuszy do porównania
    "0170": "Wybierz od 2 do 3 scenariuszy.",
    // Zapisanie scenariusza przykładowej sprawy
    "0171": "Zapisaliśmy scenariusz przykładowej sprawy w kalkulatorze. Scenariusz nie zmienia Twojego planu.",
    // Urlop rodzicielski po osiągnięciu wieku przez dziecko
    "0172": ({ wiek }: { wiek: string }) =>
      `Urlop rodzicielski wykorzystasz do dnia poprzedzającego ukończenie przez dziecko ${wiek} lat. Tygodnie przypadające później przepadają.`,
    // Brak danych ZUS drugiego rodzica
    "0173": "Drugi rodzic nie dołączył do Waszego planu, więc nie znamy jego danych z ZUS. Wpisz jego podstawę wymiaru zasiłku albo zaproś go do planu.",
    // Wyrównanie zasiłku do 100%
    "0174": "Urlop rodzicielski zaczyna się po pierwszych urodzinach dziecka, więc zasiłek za ten urlop wyniesie 70%, a za urlop macierzyński otrzymasz na wniosek jednorazowe wyrównanie do 100%.",
    // Puste pole daty początku urlopu
    "0175": "Podaj datę początku urlopu.",
    // Puste pole daty końca pobytu matki w szpitalu
    "0176": "Podaj datę końca pobytu matki w szpitalu.",
    // Wynik weryfikacji zgodny z rozstrzygnięciem
    "0177": "Wynik weryfikacji ubezpieczenia jest zgodny z rozstrzygnięciem sprawy.",
    // Wynik weryfikacji różny od rozstrzygnięcia
    "0178": "Wynik weryfikacji ubezpieczenia różni się od rozstrzygnięcia sprawy. Sprawdź dane sprawy i uzasadnienie warunków.",
    // Przykładowa sprawa usunięta
    "0179": "Usunęliśmy sprawę razem z jej dokumentami i danymi.",
    // Brak rozstrzygnięcia sprawy do porównania
    "0180": "Podaj rozstrzygnięcie sprawy, żeby porównać z nim wynik weryfikacji i wyliczenie.",
    // Zastąpiony dokument tego samego rodzaju
    "0181": "Nowy dokument zastąpił wcześniej wgrany dokument tego samego rodzaju.",
    // Zadłużenie z tytułu składek przekraczające próg
    "0182": ({ prog, data }: { prog: string; data: string }) =>
      `Zadłużenie przekracza ${prog}. Zasiłek nie przysługuje do czasu spłaty całego zadłużenia. Spłać je do ${data}, a otrzymasz zasiłek za cały okres.`,
    // Zadłużenie z tytułu składek nieprzekraczające progu
    "0183": ({ prog }: { prog: string }) =>
      `Zadłużenie nie przekracza ${prog}, więc nie odbiera prawa do zasiłku. Opłać brakującą kwotę, żeby zadłużenie nie wzrosło.`,
    // Układ ratalny albo odroczenie spłacane terminowo
    "0184": "Spłacasz składki zgodnie z układem ratalnym albo odroczeniem terminu płatności, więc przy ustalaniu prawa do zasiłku ZUS nie traktuje ich jako zadłużenia.",
    // Zadłużenie niespłacone w ciągu 6 miesięcy
    "0185": ({ data }: { data: string }) =>
      `Zadłużenie nie zostało spłacone do ${data}. Zasiłek za okres przed spłatą przepadł, a po spłacie całego zadłużenia przysługuje od dnia spłaty.`,
    // Zadłużenie spłacone w ciągu 6 miesięcy
    "0186": ({
      dataSplaty,
      dataWyplaty,
    }: {
      dataSplaty: string;
      dataWyplaty: string;
    }) =>
      `Zadłużenie spłacone ${dataSplaty}. Zasiłek przysługuje za cały okres, a ZUS wypłaci go najpóźniej ${dataWyplaty}.`,
    // Stan rozliczeń na dzień powstania prawa w przyszłości
    "0187": ({ data }: { data: string }) =>
      `Pokazujemy stan rozliczeń na dziś. ZUS sprawdzi stan na ${data}, więc opłać składki przed tym dniem.`,
    // Puste pole dnia stanu rozliczeń
    "0188": "Podaj dzień, na który chcesz otrzymać zaświadczenie.",
    // Dzień stanu rozliczeń w przyszłości
    "0189": "Zaświadczenie wystawimy na dzień dzisiejszy albo wcześniejszy.",
    // Dzień stanu rozliczeń przed rozpoczęciem działalności
    "0190": ({ data }: { data: string }) =>
      `Podaj dzień od ${data}, czyli od początku prowadzenia działalności.`,
    // Data urodzenia dziecka w przyszłości
    "0191": "Data urodzenia dziecka nie może być późniejsza niż dzisiejsza.",
    // Brak daty uprawomocnienia przysposobienia
    "0192": "Termin urlopu ojcowskiego policzymy od dnia uprawomocnienia się orzeczenia o przysposobieniu. Dopisz tę datę w profilu, gdy ją poznasz.",
    // Puste pole daty zdarzenia
    "0193": "Podaj datę zdarzenia.",
    // Zaświadczenie o martwym urodzeniu przy poronieniu
    "0194": "Lekarz albo położna wystawia zaświadczenie o martwym urodzeniu bez względu na tydzień ciąży. Zaświadczenie jest potrzebne do zasiłku macierzyńskiego.",
    // Puste pole adresu do doręczenia
    "0195": "Podaj adres, na który urząd wyśle odpis.",
    // Brak kodu pocztowego w adresie
    "0196": "Podaj adres z kodem pocztowym w formacie 00-000.",
    // Pierwszy odpis skrócony bezpłatnie
    "0197": "Pierwszy odpis skrócony aktu urodzenia urząd stanu cywilnego wydaje bezpłatnie osobie, która zgłosiła urodzenie.",
    // Odpis wielojęzyczny w formie papierowej
    "0198": "Odpis wielojęzyczny otrzymasz w formie papierowej, pocztą albo osobiście w urzędzie stanu cywilnego.",
    // Wniosek o urlop wysłany przed okresem ochrony
    "0199": ({
      data,
      dataPoczatkuOchrony,
    }: {
      data: string;
      dataPoczatkuOchrony: string;
    }) =>
      `Wniosek trafił do pracodawcy ${data}. Szczególna ochrona przed wypowiedzeniem przysługuje Ci od ${dataPoczatkuOchrony} do końca urlopu.`,
    // Wniosek o łączenie urlopu rodzicielskiego z pracą wysłany
    "0200": ({ data }: { data: string }) =>
      `Wniosek trafił do pracodawcy ${data}. Pracodawca może odmówić łączenia urlopu z pracą ze względu na organizację albo rodzaj pracy i poinformuje Cię o tym w ciągu 7 dni.`,
    // Puste pole daty we wniosku o urlop
    "0201": "Podaj datę.",
    // Nieprawidłowa liczba dni urlopu
    "0202": "Podaj liczbę dni z zakresu wskazanego przy polu.",
    // Wniosek o uzupełniający urlop macierzyński później niż 21 dni przed końcem urlopu macierzyńskiego
    "0203": "Wniosek o uzupełniający urlop macierzyński składasz co najmniej 21 dni przed końcem urlopu macierzyńskiego. Uzgodnij termin z pracodawcą.",
    // Wniosek o urlop na warunkach urlopu macierzyńskiego później niż 7 dni od przyjęcia dziecka
    "0204": "Wniosek o urlop na warunkach urlopu macierzyńskiego składasz w ciągu 7 dni od przyjęcia dziecka. Uzgodnij termin z pracodawcą.",
    // Wniosek o łączenie urlopu rodzicielskiego z pracą później niż 21 dni przed podjęciem pracy
    "0205": "Wniosek o łączenie urlopu rodzicielskiego z pracą składasz co najmniej 21 dni przed podjęciem pracy. Wybierz późniejszą datę albo uzgodnij termin z pracodawcą.",
    // Rezygnacja bez drugiego rodzica w profilu
    "0206": "Z dalszej części urlopu macierzyńskiego rezygnujesz, gdy pozostałą część urlopu przejmie ojciec dziecka. Dodaj drugiego rodzica do profilu rodziny.",
    // Rezygnacja z części zasiłku macierzyńskiego w eZUS
    "0207": "Rezygnację z dalszej części zasiłku macierzyńskiego złożysz w eZUS wnioskiem ZAS-23 o skrócenie okresu wypłaty zasiłku macierzyńskiego, razem z oświadczeniem, od kiedy ojciec dziecka przejmie zasiłek. Złóż je przed dniem, od którego rezygnujesz. Pozostałą część zasiłku drugi rodzic otrzyma na swój wniosek.",
    // Wniosek o pozostałą część urlopu macierzyńskiego później niż 14 dni przed urlopem
    "0208": "Wniosek o pozostałą część urlopu macierzyńskiego składasz co najmniej 14 dni przed jej rozpoczęciem. Uzgodnij termin z pracodawcą.",
    // Rezygnacja z orzeczeniem przed upływem 8 tygodni
    "0209": "Przy orzeczeniu o niezdolności do samodzielnej egzystencji rezygnujesz z dalszej części urlopu macierzyńskiego po wykorzystaniu co najmniej 8 tygodni po porodzie.",
    // Sytuacja szczególna przed upływem 8 tygodni od porodu
    "0210": ({ data }: { data: string }) =>
      `W pierwszych 8 tygodniach życia dziecka możesz otrzymać zasiłek opiekuńczy na czas osobistej opieki nad dzieckiem. Część urlopu macierzyńskiego przejmiesz od ${data}.`,
    // PESEL dziecka niezgodny z datą urodzenia przyjętego dziecka
    "0211": "Data urodzenia zapisana w numerze PESEL różni się od daty urodzenia dziecka w Twoim profilu.",
    // Wygaśnięcie sesji
    "0212": "Sesja wygasła po 15 minutach bez działania. Zaloguj się ponownie przez mObywatela, żeby wrócić do przewodnika.",
    // Puste pole numeru telefonu
    "0213": "Podaj numer telefonu, na który wyślemy przypomnienia SMS.",
    // Brak wybranego kanału przypomnień
    "0214": "Wybierz e-mail, SMS albo oba kanały przypomnień.",
    // Wysłany kod weryfikacyjny SMS
    "0215": ({ numerTelefonu }: { numerTelefonu: string }) =>
      `Wysłaliśmy kod SMS na numer ${numerTelefonu}. Wpisz go w ciągu 10 minut.`,
    // Brak terminów do pobrania
    "0216": "W Twoim planie nie ma teraz spraw do zrobienia z terminem. Plik kalendarza pobierzesz, gdy pojawi się termin.",
    // Nieprawidłowy format kodu weryfikacyjnego
    "0217": "Wpisz 6 cyfr kodu z wiadomości SMS.",
    // Brak adresu do przypomnień
    "0218": "Podaj adres e-mail albo numer telefonu, żebyśmy mogli przypominać Ci o terminach.",
    // Dane drugiego rodzica pobrane z pełnomocnictwa
    "0219": "Pobraliśmy dane ubezpieczenia drugiego rodzica na podstawie pełnomocnictwa i przeliczyliśmy plan rodziny.",
    // Pełnomocnictwo PEL odwołane
    "0220": ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Pełnomocnictwo od ${imieINazwisko} zostało odwołane. Usunęliśmy dane pobrane na jego podstawie i przywróciliśmy Twoje odpowiedzi o drugim rodzicu.`,
    // Pełnomocnictwo PEL wygasło
    "0221": ({
      imieINazwisko,
      data,
    }: {
      imieINazwisko: string;
      data: string;
    }) =>
      `Pełnomocnictwo od ${imieINazwisko} obowiązywało do ${data}. Poproś o nowe pełnomocnictwo PEL w eZUS, żeby pobrać aktualne dane.`,
    // Pełnomocnictwo PEL ograniczone do korespondencji
    "0222": ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Pełnomocnictwo od ${imieINazwisko} obejmuje wyłącznie korespondencję. Poproś o pełnomocnictwo PEL do roli Ubezpieczony bez ograniczenia do korespondencji.`,
    // Brak pełnomocnictwa PEL od drugiego rodzica
    "0223": "Drugi rodzic nie udzielił Ci jeszcze pełnomocnictwa. Pokaż mu instrukcję udzielenia pełnomocnictwa PEL w eZUS.",
    // Pełnomocnictwo PEL od przyszłej daty
    "0224": ({
      imieINazwisko,
      data,
    }: {
      imieINazwisko: string;
      data: string;
    }) =>
      `Pełnomocnictwo od ${imieINazwisko} obowiązuje od ${data}. Dane drugiego rodzica pobierzemy od tego dnia.`,
    // Rozstrzygnięcie uzupełnione ze zrzutu z systemu ZUS
    "0225": "Rozstrzygnięcie sprawy uzupełniliśmy świadczeniami przyznanymi w zrzucie z systemu ZUS. Sprawdź je przed weryfikacją.",
    // Początek zasiłku wcześniej niż 6 tygodni przed terminem porodu
    "0226": ({
      dataPoczatkuZWniosku,
      terminPorodu,
      dataPoczatkuDoWyliczenia,
    }: {
      dataPoczatkuZWniosku: string;
      terminPorodu: string;
      dataPoczatkuDoWyliczenia: string;
    }) =>
      `Okres zasiłku we wniosku zaczyna się ${dataPoczatkuZWniosku}, czyli wcześniej niż 6 tygodni przed przewidywanym terminem porodu ${terminPorodu}. Do wyliczenia przyjmujemy początek ${dataPoczatkuDoWyliczenia}.`,
    // Brak zaświadczenia o przewidywanej dacie porodu w przykładowej sprawie
    "0227": "Zasiłek za okres przed porodem wymaga zaświadczenia lekarskiego o przewidywanej dacie porodu. Dodaj je do sprawy, jeśli jest w zestawie dokumentów.",
    // Brak zaświadczenia o przewidywanej dacie porodu
    "0228": "Dołącz zaświadczenie lekarskie o przewidywanej dacie porodu.",
    // Wniosek przed porodem
    "0229": ({ data }: { data: string }) =>
      `Zasiłek przed porodem możesz zacząć najwcześniej ${data}, czyli 6 tygodni przed przewidywanym terminem porodu. Możesz też pracować do porodu i złożyć wniosek po porodzie.`,
    // Wniosek przed porodem przygotowany dla płatnika
    "0230": "Wniosek jest gotowy. Przekaż go płatnikowi razem z zaświadczeniem lekarskim o przewidywanej dacie porodu, a po porodzie dostarcz płatnikowi skrócony odpis aktu urodzenia dziecka.",
    // Dane dziecka do przekazania ZUS
    "0231": "Przekaż ZUS dane dziecka do wniosku o zasiłek macierzyński złożonego przed porodem, żeby ZUS ustalił zasiłek za okres po porodzie.",
    // Dane dziecka przekazane ZUS
    "0232": "Przekazaliśmy ZUS dane dziecka do Twojego wniosku o zasiłek macierzyński.",
    // Wniosek ZAS-53 dla pracownika i zleceniobiorcy w okresie ubezpieczenia
    "0233": "Wniosek o zasiłek chorobowy składa osoba prowadząca działalność albo osoba po ustaniu ubezpieczenia. Twój zasiłek ustali płatnik składek albo ZUS na podstawie zaświadczenia lekarskiego, więc poinformuj płatnika o niezdolności do pracy.",
    // Zaświadczenie bez kodu B
    "0234": "Zaświadczenie nie ma kodu B, który oznacza ciążę, więc zasiłek wyniesie 80% podstawy wymiaru. Jeśli niezdolność przypada w ciąży, skontaktuj się z lekarzem, który wystawił zaświadczenie.",
    // Niezdolność po ustaniu ubezpieczenia powstała później niż 14 dni
    "0235": ({ dataUstania, data }: { dataUstania: string; data: string }) =>
      `Ubezpieczenie ustało ${dataUstania}, a niezdolność do pracy zaczęła się ${data}, czyli później niż 14 dni po ustaniu. Zasiłek chorobowy za ten okres nie przysługuje.`,
    // Niezdolność po ustaniu ubezpieczenia krótsza niż 30 dni
    "0236": ({ liczbaDni }: { liczbaDni: string }) =>
      `Po ustaniu ubezpieczenia zasiłek przysługuje, gdy niezdolność do pracy trwa bez przerwy co najmniej 30 dni. Twoja trwa ${liczbaDni} dni. Złożysz wniosek, gdy lekarz przedłuży zaświadczenie.`,
    // Okoliczność wyłączająca zasiłek po ustaniu ubezpieczenia
    "0237": "Przy tej odpowiedzi zasiłek chorobowy po ustaniu ubezpieczenia nie przysługuje. Sprawdź odpowiedź albo zapytaj ZUS o swoją sytuację.",
    // Puste pole informacji przy odpowiedzi tak
    "0238": "Uzupełnij informacje przy odpowiedzi tak.",
    // Puste pole daty we wniosku o zasiłek chorobowy
    "0239": "Podaj datę.",
    // Data we wniosku o zasiłek chorobowy w przyszłości
    "0240": "Data nie może być późniejsza niż dzisiejsza.",
    // Wypłata zasiłku przekazem pocztowym
    "0241": ({ adres }: { adres: string }) =>
      `Bez numeru rachunku ZUS wypłaci zasiłek przekazem pocztowym na adres ${adres}.`,
    // Kolejne zaświadczenie za nieprzerwaną niezdolność do pracy
    "0242": "To zaświadczenie przedłuża niezdolność do pracy, za którą wniosek jest już złożony. Wnioskiem za ten okres może być ten wniosek albo wydruk zaświadczenia e-ZLA od lekarza.",
    // Data powrotu do pracy przed najwcześniejszym dniem
    "0243": ({ data }: { data: string }) =>
      `Najwcześniej możesz wrócić do pracy ${data}. Wcześniejszy powrót w czasie urlopu macierzyńskiego zaplanujesz w podziale urlopów jako przejęcie urlopu przez drugiego rodzica.`,
    // Data powrotu do pracy po wyczerpaniu urlopu rodzicielskiego
    "0244": ({ data }: { data: string }) =>
      `Najpóźniej możesz wrócić do pracy ${data}, bo wtedy kończy się urlop rodzicielski, który możesz wykorzystać.`,
    // Data powrotu do pracy dopasowana do pełnych tygodni urlopu
    "0245": ({ data }: { data: string }) =>
      `Urlop rodzicielski liczymy w pełnych tygodniach, dlatego wrócisz do pracy ${data}.`,
    // Niższe wypłaty po wcześniejszym powrocie w wariancie 81,5%
    "0246": ({ data, kwota }: { data: string; kwota: string }) =>
      `Przy powrocie do pracy ${data} w wariancie 81,5% otrzymasz łącznie o ${kwota} mniej niż w wariancie 100% i 70%, bo zasiłek za urlop macierzyński wynosi 81,5% zamiast 100% podstawy.`,
    // Data podjęcia ubezpieczenia po porodzie poza zakresem
    "0247": ({ data }: { data: string }) =>
      `Podaj datę po dniu porodu, najpóźniej ${data}, żeby zmieścić co najmniej 7 dni urlopu ojcowskiego, zanim dziecko skończy 12 miesięcy.`,
    // Puste pole loginu eZUS
    "0248": "Podaj login do eZUS.",
    // Puste pole hasła eZUS
    "0249": "Podaj hasło do eZUS.",
    // Przerwane logowanie do eZUS
    "0250": "Logowanie do eZUS zostało przerwane. Zaloguj się ponownie, żeby otworzyć przewodnik.",
    // Przerwane logowanie kodem z aplikacji mZUS
    "0251": "Logowanie kodem z aplikacji mZUS zostało przerwane. Zaloguj się ponownie, żeby otworzyć przewodnik.",
    // Wygasły kod logowania z aplikacji mZUS
    "0252": "Kod logowania stracił ważność po 2 minutach. Potwierdź w aplikacji mZUS nowy kod.",
    // Puste pole daty urodzenia nowego konta
    "0253": "Podaj datę urodzenia.",
    // Wiek spoza zakresu nowego konta
    "0254": "Nowe konto w wersji demonstracyjnej zakłada osoba w wieku od 16 do 60 lat. Podaj inną datę urodzenia.",
    // Dane osobowe zastąpione danymi losowymi
    "0255": "Imię, nazwisko i numer PESEL z dokumentu zastąpiliśmy danymi losowymi z tą samą datą urodzenia i płcią. Daty, okresy i kwoty zostały takie jak w dokumencie.",
    // Asystent bez profilu rodziny
    "0256": "Odpowiadam na podstawie Twoich danych z konta ZUS i katalogu świadczeń. Uzupełnij profil na start, żebym mógł odpowiadać o planie i terminach Twojej rodziny.",
    // Pusta lista wniosków
    "0257": "Wnioski złożone, przygotowane i wysłane w przewodniku pojawią się na tej liście.",
    // Rezygnacja przy ojcu bez ubezpieczenia chorobowego
    "0258": "Z dalszej części urlopu macierzyńskiego zrezygnujesz, gdy pozostałą część urlopu przejmie ojciec dziecka zatrudniony na umowie o pracę albo objęty ubezpieczeniem chorobowym, który przerwie pracę zarobkową, żeby opiekować się dzieckiem.",
    // Brak daty uprawomocnienia przysposobienia przy zgłoszeniu do ubezpieczenia zdrowotnego
    "0259": "Dziecko zgłosisz do ubezpieczenia zdrowotnego w ciągu 7 dni od dnia uprawomocnienia się orzeczenia o przysposobieniu. Dopisz tę datę w profilu, gdy ją poznasz.",
    // Zaświadczenie płatnika składek Z-3a do wniosku o zasiłek macierzyński
    "0260": "Do wniosku o zasiłek macierzyński potrzebne jest zaświadczenie płatnika składek Z-3a. Wypełnia je Twój zleceniodawca, który może przekazać je do ZUS przez eZUS. Poproś zleceniodawcę o to zaświadczenie.",
    // Rezygnacja z części zasiłku macierzyńskiego u zleceniodawcy
    "0261": "Zasiłek macierzyński wypłaca Ci zleceniodawca. Z dalszej części zasiłku zrezygnujesz pisemnym wnioskiem złożonym zleceniodawcy, z datą, od której rezygnujesz, razem z oświadczeniem, od kiedy ojciec dziecka przejmie zasiłek. Złóż je przed dniem, od którego rezygnujesz. Pozostałą część zasiłku drugi rodzic otrzyma na swój wniosek.",
  },
  // Grupy powiadomień (właściciele: u18, u14, u29, u34)
  PowiadomieniaPrzypomnienia: {
    tytul: "Przypomnienia o terminach",
    // koniec PowiadomieniaPrzypomnienia
  },
  PowiadomieniaStatusWniosku: {
    tytul: "Zmiana statusu wniosku w ZUS",
    // koniec PowiadomieniaStatusWniosku
  },
  PowiadomieniaOdpowiedzZus: {
    tytul: "Odpowiedź ZUS na pytanie",
    // koniec PowiadomieniaOdpowiedzZus
  },
  PowiadomieniaPrzejecieUrlopu: {
    tytul: "Przejęcie urlopu macierzyńskiego",
    // koniec PowiadomieniaPrzejecieUrlopu
  },
  // Grupy widoków w kolejności mapy tras
  ViewGuideStart: {
    tytulStrony: "Przewodnik rodzica",
    naglowek: "Przewodnik rodzica",
    wstep: "Spodziewasz się dziecka? Przewodnik ułoży plan świadczeń Twojej rodziny, policzy terminy i pomoże przygotować wnioski.",
    logowanie: {
      tytul: "Zaloguj się do przewodnika",
      opis: "Wybierz sposób logowania. Rozpoznamy Cię po numerze PESEL potwierdzonym przy logowaniu, więc po każdym sposobie, na komputerze i na telefonie, zobaczysz ten sam profil rodziny.",
      opisPoWygasnieciu: "Wybierz sposób logowania. Po zalogowaniu wrócisz do ekranu, na którym była otwarta sesja.",
      sposoby: {
        mobywatel: { tytul: "mObywatel", opis: "Zaloguj się przez mObywatela i zeskanuj kod QR w aplikacji." },
        ezus: { tytul: "Login i hasło eZUS", opis: "Zaloguj się loginem i hasłem do eZUS." },
        mzus: { tytul: "Kod z aplikacji mZUS", opis: "Zaloguj się kodem, który potwierdzisz w aplikacji mZUS." },
      },
      notatkaDemo: "Wersja demonstracyjna: każdy sposób logowania otwiera makietę logowania, a po niej wybierasz przykładowe konto.",
      ustawieniaDemo: "Ustawienia trybu demonstracyjnego",
    },
    coZrobisz: {
      tytul: "Co zrobisz w przewodniku",
      plan: { tytul: "Plan świadczeń rodziny", opis: "Zobaczysz świadczenia, które przysługują Twojej rodzinie, i sprawy do załatwienia po kolei." },
      terminy: { tytul: "Terminy", opis: "Policzymy, do kiedy złożyć wnioski i dokumenty, i przypomnimy Ci o nich." },
      wnioski: { tytul: "Wnioski", opis: "Przygotujesz wnioski na podstawie danych z profilu rodziny." },
      kalkulator: { tytul: "Kalkulator zasiłku", opis: "Sprawdzisz, ile wyniesie zasiłek macierzyński." },
      twojeDane: "Twoje dane",
      zgoda: "Dane o ciąży, porodzie i stanie zdrowia dziecka zapisujemy tylko za Twoją zgodą.",
      ustawienia: "Zgodę zmienisz, a dane rodziny usuniesz w każdej chwili w ustawieniach przewodnika.",
    },
    // koniec ViewGuideStart
  },
  ViewMobywatelLogin: {
    tytulStrony: "Logowanie przez mObywatela",
    naglowek: "Logowanie przez mObywatela",
    flaga: "Tryb demonstracyjny: makieta logowania",
    wstep: "To makieta, która symuluje logowanie. Nie wpisuj prawdziwego loginu ani hasła i nie skanuj kodu prawdziwą aplikacją.",
    karta: "Zeskanuj kod QR w aplikacji mObywatel",
    kodQr: "Zastępczy kod QR makiety",
    kodTytul: "Kod weryfikacyjny",
    kodOpis: "Sprawdź, czy aplikacja pokazuje ten sam kod.",
    kroki: {
      otworz: "Otwórz aplikację mObywatel na telefonie.",
      zeskanuj: "Zeskanuj aplikacją kod QR z tego ekranu.",
      sprawdzPrzed: "Sprawdź, czy aplikacja pokazuje kod weryfikacyjny",
      sprawdzPo: ".",
      potwierdz: "Potwierdź logowanie w aplikacji.",
    },
    notatka: "W makiecie potwierdzenie w aplikacji zastępuje przycisk poniżej. Po nim wybierzesz przykładowe konto.",
    potwierdz: "Symuluj potwierdzenie w aplikacji mObywatel",
    przerwij: "Przerwij logowanie",
    // koniec ViewMobywatelLogin
  },
  ViewEzusLogin: {
    tytulStrony: "Logowanie loginem i hasłem eZUS",
    naglowek: "Logowanie loginem i hasłem eZUS",
    flaga: "Tryb demonstracyjny: makieta logowania",
    wstep: "To makieta, która symuluje logowanie do eZUS. Nie wpisuj prawdziwego loginu ani hasła.",
    karta: "Podaj login i hasło do eZUS",
    login: "Login",
    haslo: "Hasło",
    notatkaDalej: "Każdy wypełniony login i hasło prowadzą dalej, do wyboru przykładowego konta.",
    notatkaHaslo: "Hasło wykorzystamy wyłącznie do symulacji logowania i usuniemy je po przejściu dalej.",
    zaloguj: "Zaloguj się",
    przerwij: "Przerwij logowanie",
    // koniec ViewEzusLogin
  },
  ViewMzusCodeLogin: {
    tytulStrony: "Logowanie kodem z aplikacji mZUS",
    naglowek: "Logowanie kodem z aplikacji mZUS",
    flaga: "Tryb demonstracyjny: makieta logowania",
    wstep: "To makieta, która symuluje logowanie. Nie wpisuj prawdziwego loginu ani hasła i nie skanuj kodu prawdziwą aplikacją.",
    karta: "Potwierdź kod logowania w aplikacji mZUS",
    kodQr: "Zastępczy kod QR makiety",
    kodQrNowy: "Zastępczy kod QR makiety, nowy kod",
    kodTytul: "Kod logowania",
    nowyKodTytul: "Nowy kod logowania",
    kodOpis: "Kod jest ważny 2 minuty. Po tym czasie pokażemy nowy kod.",
    kroki: {
      otworz: "Otwórz aplikację mZUS na telefonie.",
      zeskanuj: "Zeskanuj aplikacją kod QR z tego ekranu.",
      sprawdzPrzed: "Sprawdź, czy aplikacja pokazuje kod logowania",
      sprawdzPo: ".",
      potwierdz: "Potwierdź logowanie w aplikacji.",
    },
    notatka: "W makiecie potwierdzenie w aplikacji zastępuje przycisk poniżej. Po nim wybierzesz przykładowe konto.",
    potwierdz: "Symuluj potwierdzenie w aplikacji mZUS",
    przerwij: "Przerwij logowanie",
    // koniec ViewMzusCodeLogin
  },
  ViewDemoAccountPicker: {
    tytulStrony: "Wybierz konto",
    naglowek: "Wybierz konto",
    flaga: "Tryb demonstracyjny: przykładowe konta",
    wstep: "Zaloguj się przykładowym kontem rodzica albo administratora albo załóż nowe konto bez danych w ZUS.",
    kontaPrzykladowe: ({ liczba }: { liczba: number }) => `Konta przykładowe (${liczba})`,
    notatkaDane: "Dane z konta ZUS przykładowych kont są przykładowe i nie pochodzą z prawdziwych kont w ZUS. Przewodnik odczytuje je przy każdym otwarciu.",
    notatkaSymulacji: ({ data }: { data: string }) =>
      `Symulacja zgłoszenia dziecka dodaje do członków rodziny w danych z konta ZUS dziecko o imieniu Zofia i nazwisku konta, urodzone 2 dni przed dniem dzisiejszym, czyli ${data}, z numerem PESEL zgodnym z tą datą. Przy każdym koncie rodzica użyjesz jej raz, do czasu przywrócenia stanu początkowego konta.`,
    rolaAdministrator: "Rola: Administrator",
    opisyForm: {
      "jdg-z-dobrowolnym": "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia-z-dobrowolnym": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      "jdg-bez-dobrowolnego": "Jednoosobowa działalność gospodarcza bez dobrowolnego ubezpieczenia chorobowego",
      "umowa-o-prace-ustala-w-ciazy": "Umowa o pracę, która ustała w ciąży",
      "jdg-rozpoczeta-w-ciazy": "Jednoosobowa działalność gospodarcza rozpoczęta w ciąży, z dobrowolnym ubezpieczeniem chorobowym",
      administrator: "Rola: Administrator",
    },
    oznaczenieNowegoKonta: "Nowe konto",
    noweKonta: ({ liczba }: { liczba: number }) => `Nowe konta (${liczba})`,
    noweKontaOpis: "Nowe konto ma puste dane konta ZUS. Po założeniu zalogujemy Cię nim od razu, a później znajdziesz je na tej liście.",
    zalozNoweKonto: "Załóż nowe konto",
    zaloguj: "Zaloguj się",
    zalogujKonto: ({ imieINazwisko }: { imieINazwisko: string }) => `Zaloguj się kontem ${imieINazwisko}`,
    symuluj: "Symuluj zgłoszenie dziecka",
    symulujKonto: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Symuluj zgłoszenie dziecka przy koncie ${imieINazwisko}`,
    przywroc: "Przywróć stan początkowy",
    przywrocKonto: ({ imieINazwisko }: { imieINazwisko: string }) => `Przywróć stan początkowy konta ${imieINazwisko}`,
    przywrocono: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Przywróciliśmy stan początkowy konta ${imieINazwisko}.`,
    dzieckoDodane: "Dziecko dodane symulacją:",
    opisDziecka: ({ imieINazwisko, data, pesel }: { imieINazwisko: string; data: string; pesel: string }) =>
      `${imieINazwisko}, urodzona ${data}, PESEL ${pesel}`,
    podpowiedzSymulacji: "Żeby zasymulować zgłoszenie ponownie, przywróć stan początkowy konta.",
    ustawieniaDemo: "Ustawienia trybu demonstracyjnego",
    trybWylaczony: "Tryb demonstracyjny jest wyłączony, więc symulacje i ustawienia trybu demonstracyjnego czekają na jego włączenie.",
    wlaczTryb: "Włącz tryb demonstracyjny",
    trybWlaczony: "Włączyliśmy tryb demonstracyjny.",
    // koniec ViewDemoAccountPicker
  },
  ViewDemoNewAccount: {
    tytulStrony: "Nowe konto",
    naglowek: "Nowe konto",
    powrot: "Wybór konta",
    flaga: "Tryb demonstracyjny: nowe konto",
    wstep: "Załóż konto bez danych w ZUS. Nadamy mu losowy numer PESEL z podaną datą urodzenia i płcią, a potem zalogujemy Cię tym kontem.",
    karta: "Dane konta",
    imie: "Imię",
    nazwisko: "Nazwisko",
    dataUrodzenia: "Data urodzenia",
    formatDaty: "DD.MM.RRRR",
    plec: "Płeć",
    wybierz: "Wybierz",
    plcie: { kobieta: "Kobieta", mezczyzna: "Mężczyzna" },
    notatka: "Nowe konto ma puste dane konta ZUS, czyli brak tytułu do ubezpieczenia. Formę zatrudnienia, ubezpieczenie chorobowe i podstawę wymiaru podasz sam w profilu na start i w kalkulatorze.",
    zaloz: "Załóż konto",
    // koniec ViewDemoNewAccount
  },
  ViewDemoSettings: {
    tytulStrony: "Ustawienia trybu demonstracyjnego",
    naglowek: "Ustawienia trybu demonstracyjnego",
    powrot: "Wybór konta",
    flaga: "Tryb demonstracyjny: ustawienia",
    wstep: "Ustaw datę demonstracyjną, parametry systemu i symulacje błędów, a potem wczytaj scenariusz z kryteriów akceptacji. Ustawienia obowiązują w tej przeglądarce.",
    tryb: {
      tytul: "Tryb demonstracyjny",
      przelacznik: "Tryb demonstracyjny włączony",
      opis: "Tryb demonstracyjny włącza makiety logowania, wybór konta, przykładowe dane z konta ZUS i symulacje. Po wyłączeniu przewodnik zamknie ten ekran, a tryb włączysz ponownie na ekranie wyboru konta.",
    },
    data: {
      tytul: "Data demonstracyjna",
      pole: "Data, od której przewodnik liczy dzień dzisiejszy",
      biezaca: ({ data }: { data: string }) => `Dzisiaj w przewodniku: ${data}`,
      zrodloDemo: "Przewodnik liczy terminy od daty demonstracyjnej.",
      zrodloZegar: "Przewodnik liczy terminy od daty z zegara.",
      ustaw: "Ustaw datę",
      wyczysc: "Wróć do daty z zegara",
      ustawiono: ({ data }: { data: string }) => `Ustawiliśmy datę demonstracyjną ${data}.`,
      wyczyszczono: "Przewodnik liczy terminy od daty z zegara.",
    },
    parametry: {
      tytul: "Parametry systemu",
      progPodwyzszenia: "Próg podwyższenia podstawy wymiaru w procentach",
      progOkresu: "Próg ostrzeżenia o końcu okresu zasiłkowego w dniach",
      tolerancja: "Tolerancja porównania kwoty w groszach",
      opoznienieOdpowiedzi: "Czas oczekiwania na symulowaną odpowiedź ZUS w dniach",
      opoznienieOdczytu: "Czas symulowanego odczytu danych z konta ZUS w milisekundach",
      kodSms: "Stały kod SMS",
      kodSmsOpis: "Zostaw pole puste, żeby przewodnik losował kod przy każdej wysyłce.",
      zakres: ({ min, maks }: { min: string; maks: string }) => `Podaj liczbę całkowitą od ${min} do ${maks}.`,
      kodSmsBlad: "Podaj 6 cyfr albo zostaw pole puste.",
      zapisz: "Zapisz parametry",
      zapisano: "Zapisaliśmy parametry systemu.",
    },
    symulacje: {
      tytul: "Symulacje",
      opis: "Symulacje działają wyłącznie w trybie demonstracyjnym. Zmiana przełącznika obowiązuje od razu.",
      zmieniono: "Zapisaliśmy ustawienie symulacji.",
      przelaczniki: {
        bladZapisu: { etykieta: "Błąd zapisu danych", opis: "Operacje zapisu danych kończą się komunikatem o błędzie zapisu." },
        daneZusNiedostepne: { etykieta: "Dane z konta ZUS niedostępne", opis: "Odczyt danych z konta ZUS kończy się komunikatem o niedostępności." },
        stanRozliczenNiedostepny: { etykieta: "Stan rozliczeń składek niedostępny", opis: "Odczyt stanu rozliczeń składek kończy się komunikatem o niedostępności." },
        kanalNiedostepny: { etykieta: "Kanał zewnętrzny niedostępny", opis: "Przejście do Emp@tii, mObywatela i gov.pl kończy się komunikatem o niedostępności." },
        mobywatelZainstalowany: { etykieta: "Aplikacja mObywatel zainstalowana", opis: "Przejście do mObywatela otwiera aplikację w miejscu usługi w przeglądarce." },
        wysylkaDoZusNiedostepna: { etykieta: "Wysyłka wniosku do ZUS niedostępna", opis: "Wysyłka wniosków ZAM i ZAS-53 kończy się komunikatem o niedostępności, a szkic zostaje." },
        pueEzusNiedostepne: { etykieta: "PUE/eZUS niedostępne", opis: "Pytanie do ZUS i zaświadczenie o stanie rozliczeń kończą się komunikatem o niedostępności." },
        rejestrStanuCywilnegoNiedostepny: { etykieta: "Rejestr stanu cywilnego niedostępny", opis: "Wniosek o odpis aktu urodzenia kończy się komunikatem o niedostępności." },
        uslugaEmailNiedostepna: { etykieta: "Usługa e-mail niedostępna", opis: "Wysyłka wniosku o urlop do pracodawcy kończy się komunikatem o niedostępności." },
        asystentNiedostepny: { etykieta: "Asystent niedostępny", opis: "Wiadomość do asystenta kończy się komunikatem o niedostępności." },
      },
      odczytDokumentu: {
        etykieta: "Odczyt dokumentu przykładowej sprawy",
        opcje: {
          model: "Odczyt modelem językowym",
          fikstura: "Wynik odczytu zapisany w prototypie",
          nierozpoznany: "Dokument nierozpoznany",
          nieczytelny: "Dokument nieczytelny",
          niedostepny: "Usługa odczytu niedostępna",
        },
      },
    },
    scenariusze: {
      tytul: "Scenariusze demonstracyjne",
      opis: "Scenariusz przywraca stan początkowy konta i wczytuje stan z kryteriów akceptacji. Aktywna sesja tego konta się kończy.",
      brak: "Lista scenariuszy jest pusta.",
      wczytaj: "Wczytaj scenariusz",
      wczytajScenariusz: ({ nazwa }: { nazwa: string }) => `Wczytaj scenariusz ${nazwa}`,
      konto: ({ imieINazwisko }: { imieINazwisko: string }) => `Konto: ${imieINazwisko}`,
      wczytano: ({ nazwa }: { nazwa: string }) => `Wczytaliśmy scenariusz ${nazwa}.`,
      u01AnnaDziecko: {
        nazwa: "Anna Nowak po symulacji zgłoszenia dziecka",
        opis: "Konto Anna Nowak w stanie początkowym z dzieckiem Zofia Nowak w danych z konta ZUS, urodzonym 2 dni przed dniem dzisiejszym w przewodniku.",
      },
    },
    stanPoczatkowy: {
      tytul: "Stan początkowy",
      katalog: "Przywróć katalog początkowy",
      katalogOpis: "Usuwa zmiany, które Administrator wprowadził w katalogu świadczeń.",
      katalogPrzywrocony: "Przywróciliśmy katalog początkowy.",
      parametry: "Przywróć parametry początkowe",
      parametryOpis: "Przywraca wartości początkowe parametrów systemu, daty demonstracyjnej i symulacji.",
      parametryPrzywrocone: "Przywróciliśmy parametry początkowe.",
    },
    // koniec ViewDemoSettings
  },
  ViewDemoInbox: {
    tytulStrony: "Skrzynka wiadomości",
    naglowek: "Skrzynka wiadomości",
    // koniec ViewDemoInbox
  },
  ViewGuideWelcome: {
    tytulStrony: "Witaj w przewodniku rodzica",
    naglowek: "Witaj w przewodniku rodzica",
    // koniec ViewGuideWelcome
  },
  ViewGuideSettings: {
    tytulStrony: "Ustawienia",
    naglowek: "Ustawienia",
    // Sloty ustawienia/_sloty (u02, u18, u18, u02)
    sekcjaZgody: {
      // koniec sekcjaZgody
    },
    sekcjaPrzypomnien: {
      // koniec sekcjaPrzypomnien
    },
    kartaPlikuKalendarza: {
      // koniec kartaPlikuKalendarza
    },
    sekcjaDanychRodziny: {
      // koniec sekcjaDanychRodziny
    },
    // koniec ViewGuideSettings
  },
  ViewProfileZusData: {
    tytulStrony: "Profil na start: dane z Twojego konta ZUS",
    naglowek: "Profil na start",
    // Części dane-z-konta-zus/_czesci (u03)
    stanOdczytuZus: {
      // koniec stanOdczytuZus
    },
    sekcjeDanychZus: {
      // koniec sekcjeDanychZus
    },
    // koniec ViewProfileZusData
  },
  ViewProfilePayer: {
    tytulStrony: "Profil na start: płatnik zasiłku",
    naglowek: "Profil na start",
    // koniec ViewProfilePayer
  },
  ViewProfileSituation: {
    tytulStrony: "Profil na start: Twoja sytuacja",
    naglowek: "Profil na start",
    // koniec ViewProfileSituation
  },
  ViewProfilePregnancy: {
    tytulStrony: "Profil na start: dane ciąży",
    naglowek: "Profil na start",
    // koniec ViewProfilePregnancy
  },
  ViewBirthDate: {
    tytulStrony: "Data porodu",
    naglowek: "Data porodu",
    tytulyTrybow: {
      pakiet: "Data porodu",
      profil: "Profil na start: data porodu",
    },
    // koniec ViewBirthDate
  },
  ViewProfileChildAdoption: {
    tytulStrony: "Profil na start: przyjęcie dziecka",
    naglowek: "Profil na start",
    // koniec ViewProfileChildAdoption
  },
  ViewProfileEmploymentChange: {
    tytulStrony: "Profil na start: zmiana zatrudnienia w ciąży",
    naglowek: "Profil na start",
    // koniec ViewProfileEmploymentChange
  },
  ViewProfileFamily: {
    tytulStrony: "Profil na start: dane rodziny",
    naglowek: "Profil na start",
    // koniec ViewProfileFamily
  },
  ViewProfileSecondParent: {
    tytulStrony: "Profil na start: drugi rodzic",
    naglowek: "Profil na start",
    wstep: "Odpowiedz na kilka pytań, a ułożymy z nich plan Twojej rodziny. Pytamy tylko o to, czego nie ma na Twoim koncie ZUS.",
    tytulKarty: "Drugi rodzic",
    opisKarty: "Podaj formę zatrudnienia drugiego rodzica. Dzięki temu plan pokaże też jego uprawnienia, na przykład urlop ojcowski.",
    legendaFormy: "Jaka jest forma zatrudnienia drugiego rodzica?",
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      jdg: "Jednoosobowa działalność gospodarcza",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "brak-drugiego-rodzica": "Rodzina bez drugiego rodzica",
    },
    legendaDobrowolnego: "Czy drugi rodzic opłaca dobrowolne ubezpieczenie chorobowe?",
    podpowiedziDobrowolnego: {
      "umowa-zlecenia": "Pytamy, bo drugi rodzic pracuje na umowie zlecenia.",
      jdg: "Pytamy, bo drugi rodzic prowadzi jednoosobową działalność gospodarczą.",
    },
    odpowiedziDobrowolnego: { tak: "Tak", nie: "Nie" },
    notatkaUmowyOPrace: "Pracownik ma obowiązkowe ubezpieczenie chorobowe, więc nie pytamy o dobrowolne.",
    // koniec ViewProfileSecondParent
  },
  ViewProfileSummary: {
    tytulStrony: "Profil na start: podsumowanie",
    naglowek: "Profil na start",
    tytulyTrybow: {
      start: "Profil na start: podsumowanie",
      rodzina: "Profil rodziny",
    },
    // Sloty profil-na-start/podsumowanie/_sloty (u19, u24, u23, u25)
    sekcjaDanychDziecka: {
      // koniec sekcjaDanychDziecka
    },
    sekcjaPrzyjecia: {
      // koniec sekcjaPrzyjecia
    },
    sekcjaDrugiegoRodzica: {
      // koniec sekcjaDrugiegoRodzica
    },
    sekcjaSytuacji: {
      // koniec sekcjaSytuacji
    },
    wstep: "Odpowiedz na kilka pytań, a ułożymy z nich plan Twojej rodziny. Pytamy tylko o to, czego nie ma na Twoim koncie ZUS.",
    notatkaStart: "Sprawdź odpowiedzi i zapisz profil. Dane oznaczone „Źródło: konto ZUS” odczytaliśmy z Twojego konta ZUS, pozostałe to Twoje odpowiedzi.",
    notatkaPoBledzie: "Twoje odpowiedzi są zachowane. Sprawdź je i zapisz profil jeszcze raz.",
    notatkaPrzedZapisem: "Po zapisaniu ułożymy plan Twojej rodziny. Profil zmienisz później z planu rodziny.",
    zapiszProfil: "Zapisz profil",
    brakSzkicu: "Nie masz jeszcze odpowiedzi w profilu na start. Zacznij od danych z Twojego konta ZUS.",
    przejdzDoProfiluNaStart: "Przejdź do profilu na start",
    brakProfilu: "Nie masz jeszcze zapisanego profilu rodziny.",
    sekcje: {
      formaIPlatnik: "Forma zatrudnienia i płatnik zasiłku",
      daneCiazy: "Dane ciąży",
      daneRodziny: "Dane rodziny",
      drugiRodzic: "Drugi rodzic",
    },
    zmienSekcje: {
      formaIPlatnik: "Zmień formę zatrudnienia i płatnika zasiłku",
      daneCiazy: "Zmień dane ciąży",
      daneRodziny: "Zmień dane rodziny",
      drugiRodzic: "Zmień dane drugiego rodzica",
    },
    zmienSytuacje: "Zmień sytuację",
    zmienZmianeZatrudnienia: "Zmień odpowiedź o zmianie zatrudnienia",
    pola: {
      formaZatrudnienia: "Forma zatrudnienia",
      dobrowolne: "Dobrowolne ubezpieczenie chorobowe",
      ubezpieczenieChorobowe: "Ubezpieczenie chorobowe",
      platnik: "Płatnik zasiłku",
      sytuacja: "Twoja sytuacja",
      termin: "Przewidywany termin porodu",
      liczbaDzieci: "Liczba dzieci",
      wizyta: "Pierwsza wizyta u lekarza albo położnej",
      dataPorodu: "Data porodu",
      liczbaUrodzonychDzieci: "Liczba urodzonych dzieci",
      zmianaZatrudnienia: "Zmiana zatrudnienia w ciąży",
      przyczynaUstania: "Przyczyna ustania umowy o pracę",
      inneZatrudnienie: "Zapewnione inne zatrudnienie",
      stanCywilny: "Stan cywilny",
      uznanieOjcostwa: "Uznanie ojcostwa",
      gmina: "Gmina",
      dochod: "Miesięczny dochód netto na osobę",
    },
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      jdg: "Jednoosobowa działalność gospodarcza",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "brak-drugiego-rodzica": "Rodzina bez drugiego rodzica",
    },
    formyWDopelniaczu: {
      "umowa-o-prace": "umowy o pracę",
      "umowa-zlecenia": "umowy zlecenia",
      jdg: "jednoosobowej działalności gospodarczej",
    },
    dobrowolneMatki: { tak: "Tak, opłacasz", nie: "Nie opłacasz" },
    dobrowolneDrugiegoRodzica: { tak: "Tak, opłaca", nie: "Nie opłaca" },
    chorobowePracownika: "Obowiązkowe",
    platnicy: {
      zus: "ZUS",
      nieustalony: "Jeszcze nie wiemy",
      "brak-platnika": "Brak",
    },
    opisyPlatnika: {
      jdg: "Przy jednoosobowej działalności gospodarczej zasiłek wypłaca ZUS.",
      zusZNazwa: ({ nazwa }: { nazwa: string }) =>
        `Twój płatnik składek ${nazwa} nie wypłaca zasiłków, więc zasiłek wypłaci ZUS.`,
      platnikSkladek: "Twój płatnik składek wypłaca zasiłki, więc zasiłek wypłaci płatnik składek.",
      nieustalony: "Płatnika zasiłku ustalimy, gdy będzie wiadomo, ile osób płatnik składek zgłasza do ubezpieczenia chorobowego.",
      brakPlatnika: "Bez tytułu do ubezpieczenia nie masz płatnika zasiłku.",
    },
    sytuacje: {
      oczekiwanie: "Spodziewam się dziecka",
      narodziny: "Dziecko już się urodziło",
      przyjecie: "Przyjmuję dziecko na wychowanie",
      planowanie: "Planuję rodzicielstwo",
    },
    liczbyDzieci: {
      "1": "Jedno dziecko",
      "2": "Bliźnięta",
      "3": "Trojaczki",
      "4": "Czworaczki",
      "5": "Pięcioraczki",
    },
    wizytaNieOdbylaSie: "Wizyta jeszcze się nie odbyła",
    zmianyZatrudnienia: {
      "bez-zmian": "Bez zmian",
      rozpoczecie: ({ forma, data }: { forma: string; data: string }) => `Rozpoczęcie ${forma} od ${data}`,
      ustanie: ({ forma, data }: { forma: string; data: string }) => `Ustanie ${forma} z dniem ${data}`,
    },
    przyczynyUstania: {
      upadlosc: "Upadłość pracodawcy",
      likwidacja: "Likwidacja pracodawcy",
      "smierc-pracodawcy": "Śmierć pracodawcy",
      "naruszenie-z-wyrokiem": "Rozwiązanie umowy z naruszeniem przepisów potwierdzone prawomocnym wyrokiem sądu",
      "naruszenie-bez-wyroku": "Rozwiązanie umowy z naruszeniem przepisów bez prawomocnego wyroku",
      "koniec-umowy-terminowej": "Koniec umowy na czas określony albo na okres próbny",
      inna: "Inna przyczyna",
    },
    takNie: { tak: "Tak", nie: "Nie" },
    stanyCywilne: {
      malzenstwo: "Rodzice są małżeństwem",
      "nie-malzenstwo": "Rodzice nie są małżeństwem",
    },
    uznaniaOjcostwa: {
      uznane: "Ojcostwo uznane",
      nieuznane: "Ojcostwo nieuznane",
    },
    gmina: ({ nazwa, powiat, wojewodztwo }: { nazwa: string; powiat: string; wojewodztwo: string }) =>
      `${nazwa} (powiat ${powiat}, województwo ${wojewodztwo})`,
    dochodNieznany: "Dochód nieznany",
    nieUstalono: "Nie podano",
    zrodla: {
      "konto-zus": "Źródło: konto ZUS",
      "pelnomocnictwo-pel": "Źródło: pełnomocnictwo PEL",
      "odpowiedz-rodzica": "Źródło: Twoja odpowiedź",
    },
    zmienione: ({ poprzednio }: { poprzednio: string }) => `Zmienione, przed zmianą: ${poprzednio}`,
    rodzina: {
      tytul: "Profil rodziny",
      powrot: "Plan rodziny",
      notatka: "Z tych odpowiedzi ułożyliśmy plan Twojej rodziny. Zmień sekcję i zapisz profil, a przeliczymy plan od nowa.",
      notatkaNiezapisanychZmian: "Masz niezapisane zmiany profilu. Zapisz profil, a przeliczymy plan rodziny.",
      notatkaNiezapisanegoTerminu: "Masz niezapisaną zmianę przewidywanego terminu porodu. Zapisz profil, a przeliczymy plan rodziny.",
      wrocDoPlanu: "Wróć do planu rodziny",
      anulujZmiany: "Anuluj zmiany",
      tytulKartyZmiany: "Zmiana profilu",
      notatkaPrzeliczenia: "Po zapisaniu zmiany przeliczymy plan rodziny. Sprawy złożone i załatwione zachowają swój status.",
      notatkaDanychZus: "Dane z konta ZUS odświeżamy przy każdym otwarciu przewodnika.",
      notatkaKalendarza: "Nowy termin porodu zmieni też terminy w kalendarzu.",
    },
    // koniec ViewProfileSummary
  },
  ViewBirthDetails: {
    tytulStrony: "Dane dziecka po porodzie",
    naglowek: "Dane dziecka po porodzie",
    tytulyTrybow: {
      pakiet: "Dane dziecka po porodzie",
      zmiana: "Zmień dane dziecka",
    },
    // koniec ViewBirthDetails
  },
  ViewSecondParentPowerOfAttorney: {
    tytulStrony: "Pełnomocnictwo drugiego rodzica",
    naglowek: "Pełnomocnictwo drugiego rodzica",
    // koniec ViewSecondParentPowerOfAttorney
  },
  ViewBirthPackage: {
    tytulStrony: "Pakiet narodzin",
    naglowek: "Pakiet narodzin",
    // Sloty narodziny/pakiet/_sloty (u28)
    akcjaWnioskuOUrlop: {
      // koniec akcjaWnioskuOUrlop
    },
    // koniec ViewBirthPackage
  },
  ViewSpecialSituation: {
    tytulStrony: "Sytuacja szczególna",
    naglowek: "Sytuacja szczególna",
    // koniec ViewSpecialSituation
  },
  ViewFamilyPlan: {
    tytulStrony: "Plan rodziny",
    naglowek: "Plan rodziny",
    // Sloty plan-rodziny/_sloty: nagłówek (u19, u25, u16), nad planem (u19, u14), przy sprawie (u13, u14, u22, u25)
    akcjaZglosNarodziny: {
      // koniec akcjaZglosNarodziny
    },
    akcjaSytuacjaSzczegolna: {
      // koniec akcjaSytuacjaSzczegolna
    },
    akcjaSwiadczeniaWCiazy: {
      etykieta: "Świadczenia z ubezpieczenia chorobowego w ciąży",
      // koniec akcjaSwiadczeniaWCiazy
    },
    oknoNowegoDziecka: {
      // koniec oknoNowegoDziecka
    },
    blokEzla: {
      // koniec blokEzla
    },
    terminSprawy: {
      // koniec terminSprawy
    },
    statusWnioskuZus: {
      // koniec statusWnioskuZus
    },
    ostrzezeniaSprawy: {
      // koniec ostrzezeniaSprawy
    },
    akcjaPrzejeciaUrlopu: {
      // koniec akcjaPrzejeciaUrlopu
    },
    // koniec ViewFamilyPlan
  },
  ViewPregnancyBenefits: {
    tytulStrony: "Świadczenia w ciąży",
    naglowek: "Świadczenia w ciąży",
    wstep: "Sprawdź, czy przysługuje Ci zasiłek chorobowy, świadczenie rehabilitacyjne i zasiłek w wysokości zasiłku macierzyńskiego, kto je wypłaca i jakie dokumenty przygotować.",
    wstepDrugiRodzic: "Sprawdź, czy matce przysługuje zasiłek chorobowy, świadczenie rehabilitacyjne i zasiłek w wysokości zasiłku macierzyńskiego, kto je wypłaca i jakie dokumenty przygotować.",
    powrot: "Plan rodziny",
    brakProfilu: "Świadczenia w ciąży ustalimy, gdy zapiszesz profil rodziny.",
    otworzProfil: "Otwórz profil rodziny",
    profilRodziny: "Profil rodziny",
    zobaczReguly: "Zobacz zastosowane reguły",
    dokumentyNaglowek: "Dokumenty i miejsce złożenia",
    adresat: "Adresat",
    termin: "Termin",
    odpowiedzOPlatnika: "Odpowiedz na pytanie o płatnika",
    brakDokumentow: "Dokumentów nie przygotowujesz, bo nie podlegasz ubezpieczeniu chorobowemu.",
    brakDokumentowMatki: "Dokumentów nie przygotowuje się, bo matka nie podlega ubezpieczeniu chorobowemu.",
    karty: {
      dane: "Dane, z których ustalamy wynik",
      daneMatki: "Dane matki, z których ustalamy wynik",
      zasilekChorobowy: "Zasiłek chorobowy",
      okresZasilkowy: "Wykorzystanie okresu zasiłkowego",
      rehabilitacyjne: "Świadczenie rehabilitacyjne",
      zwzm: "Zasiłek w wysokości zasiłku macierzyńskiego",
    },
    notatkaPonownie: "Wynik ustalamy ponownie po każdej zmianie danych z konta ZUS, profilu rodziny i katalogu świadczeń.",
    zrodlo: ({ zrodlo }: { zrodlo: string }) => `Źródło: ${zrodlo}`,
    zrodla: {
      "konto-zus": "konto ZUS",
      "pelnomocnictwo-pel": "pełnomocnictwo PEL",
      "odpowiedz-rodzica": "odpowiedź rodzica",
      "profil-rodziny": "profil rodziny",
    },
    wyniki: {
      przysluguje: "Przysługuje",
      przyslugujeWarunekSkladek: "Przysługuje, jeśli spełnisz warunek opłacenia składek",
      przyslugujeWarunekSkladekMatki: "Przysługuje, jeśli matka spełni warunek opłacenia składek",
      przyslugujePoOrzeczeniu: "Przysługuje po orzeczeniu lekarza orzecznika ZUS",
      zaleznyOdWarunku: "Zależy od warunku",
      bezWyliczenia: "Reguła bez wyliczenia",
      nie: {
        "brak-ubezpieczenia": "Nie przysługuje – brak ubezpieczenia chorobowego",
        ustanie: "Nie przysługuje – ustanie ubezpieczenia",
        "okres-wyczekiwania": "Nie przysługuje – okres wyczekiwania",
        "wyczerpany-okres-zasilkowy": "Nie przysługuje – wyczerpany okres zasiłkowy",
        zadluzenie: "Nie przysługuje – zadłużenie z tytułu składek",
      },
    },
    pola: {
      od: "Od",
      do: "Do",
      wyplaca: "Wypłaca",
      stawka: "Stawka",
      stawkaWCiazy: "Stawka w ciąży",
      najdluzej: "Najdłużej",
      podstawaCoNajmniej: "Podstawa wymiaru co najmniej",
      bezDatyKonca: "Bez daty końca",
      wynagrodzenieWRoku: ({ rok }: { rok: string }) => `Wynagrodzenie chorobowe w ${rok} roku`,
      dniZ: ({ a, b }: { a: string; b: string }) => `${a} z ${b} dni`,
      wykorzystane: "Wykorzystane dni okresu zasiłkowego",
      pozostale: "Pozostałe dni okresu zasiłkowego",
      zZ: ({ a, b }: { a: string; b: string }) => `${a} z ${b}`,
      dzienPoWyczerpaniu: "Dzień po wyczerpaniu okresu zasiłkowego",
      miesiace: ({ liczba }: { liczba: string }) => `${liczba} miesięcy`,
    },
    stawki: {
      podstawy: ({ procent }: { procent: string }) => `${procent}% podstawy wymiaru`,
      wynagrodzenia: ({ procent }: { procent: string }) => `${procent}% wynagrodzenia`,
      zwzm: ({ procent }: { procent: string }) => `${procent}% podstawy wymiaru, bez podwyższenia do kwoty świadczenia rodzicielskiego`,
    },
    opisWynagrodzenia: ({ limit, nastepny, wyplaca }: { limit: string; nastepny: string; wyplaca: string }) =>
      `Za pierwsze ${limit} dni niezdolności do pracy w roku kalendarzowym pracodawca wypłaca Ci wynagrodzenie chorobowe w wysokości 100% wynagrodzenia. Od ${nastepny}. dnia zasiłek chorobowy wypłaca ${wyplaca}.`,
    podzialNaglowek: ({ rok }: { rok: string }) => `Podział okresu zaświadczeń e-ZLA w ${rok} roku`,
    podzialPrzewijanie: "Tabela podziału okresu zaświadczeń e-ZLA",
    podzialKolumny: { okres: "Okres", swiadczenie: "Świadczenie", stawka: "Stawka", wyplaca: "Wypłaca" },
    okres: ({ od, koniec }: { od: string; koniec: string }) => `${od} – ${koniec}`,
    rodzajeOkresu: {
      "wynagrodzenie-chorobowe": ({ dni }: { dni: string }) => `Wynagrodzenie chorobowe, ${dni} dni`,
      "zasilek-chorobowy": ({ dni }: { dni: string }) => `Zasiłek chorobowy, ${dni} dni`,
      "zasilek-po-ustaniu": ({ dni }: { dni: string }) => `Zasiłek po ustaniu ubezpieczenia, ${dni} dni`,
    },
    ustanie: {
      naglowek: ({ data }: { data: string }) => `Ubezpieczenie ustaje ${data}`,
      opis: "Zatrudnienie kończy się przed przewidywanym terminem porodu. Sprawdź, czy w dniu porodu będziesz mieć ubezpieczenie chorobowe.",
    },
    okresZasilkowy: {
      opis: ({ limit }: { limit: string }) =>
        `Gdy niezdolność do pracy przypada w ciąży, zasiłek chorobowy przysługuje najdłużej przez ${limit} dni. Liczymy go z zaświadczeń lekarskich e-ZLA rodzaju niezdolność do pracy, a zaświadczeń na opiekę nie wliczamy.`,
      regula: "Zasiłek chorobowy przysługuje najdłużej przez okres zasiłkowy 182 dni, a gdy niezdolność do pracy przypada w ciąży, 270 dni. Okres zasiłkowy policzymy, gdy w danych z konta ZUS pojawią się zaświadczenia lekarskie e-ZLA.",
      bezZgody: "Bez Twojej zgody na dane dotyczące zdrowia nie korzystamy z zaświadczeń lekarskich e-ZLA. Zasiłek chorobowy przysługuje najdłużej przez okres zasiłkowy 182 dni, a gdy niezdolność do pracy przypada w ciąży, 270 dni.",
      bezEzlaMatki: "Na koncie drugiego rodzica nie pokazujemy zaświadczeń lekarskich e-ZLA matki. Zasiłek chorobowy przysługuje najdłużej przez okres zasiłkowy 182 dni, a gdy niezdolność do pracy przypada w ciąży, 270 dni.",
      pasek: ({ a, b }: { a: string; b: string }) => `Okres zasiłkowy: ${a} z ${b} dni`,
      ezla: "Zaświadczenia lekarskie (e-ZLA)",
    },
    rehabilitacyjne: {
      opis: "Świadczenie rehabilitacyjne przysługuje od dnia po wyczerpaniu okresu zasiłkowego, jeśli nadal jesteś niezdolna do pracy, a dalsze leczenie albo rehabilitacja lecznicza rokują odzyskanie zdolności do pracy. Orzeka o tym lekarz orzecznik ZUS.",
      poza: "Poza ciążą świadczenie wynosi 90% podstawy wymiaru przez pierwsze 3 miesiące i 75% za pozostały okres. Nie przysługuje osobie uprawnionej do emerytury, renty z tytułu niezdolności do pracy albo zasiłku dla bezrobotnych.",
    },
    zwzm: {
      opis: "Zasiłek przysługuje pracownicy, z którą w ciąży rozwiązano umowę o pracę z powodu upadłości albo likwidacji pracodawcy albo której umowa wygasła z powodu śmierci pracodawcy, jeśli nie zapewniono jej innego zatrudnienia. Przysługuje od dnia po ustaniu umowy do dnia przed porodem.",
      bezZmian: "W profilu zatrudnienie nie zmieniło się w ciąży.",
      jesliUstanie: "Jeśli umowa ustanie z jednej z tych przyczyn, przygotujesz:",
      nieDotyczyDokumentow: "Dokumentów nie przygotowujesz, bo zasiłek przysługuje wyłącznie pracownicy.",
    },
    akcje: {
      K03: "Zgłoś się do dobrowolnego ubezpieczenia chorobowego",
      K16: "Sprawdź świadczenie rodzicielskie",
      K25: "Sprawdź świadczenie rehabilitacyjne",
      K26: "Sprawdź zasiłek po utracie pracy w ciąży",
      K29: "Sprawdź ubezpieczenie chorobowe w dniu porodu",
      stanRozliczen: "Sprawdź stan rozliczeń składek",
    },
    platnicy: {
      zus: "ZUS",
      platnikSkladek: "Płatnik składek",
      pracodawca: "Pracodawca",
      pracodawcaZNazwa: ({ nazwa }: { nazwa: string }) => `Pracodawca – ${nazwa}`,
      albo: ({ nazwa }: { nazwa: string }) => `${nazwa} albo ZUS`,
      wyjasnienieNieustalonego: "Zasiłek wypłaca płatnik składek, gdy zgłasza do ubezpieczenia chorobowego więcej niż 20 osób, a w pozostałych przypadkach ZUS.",
    },
    platnicyZasilku: {
      zus: "ZUS",
      "platnik-skladek": "Płatnik składek",
      nieustalony: "Nieustalony",
      "brak-platnika": "Brak płatnika",
    },
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      jdg: "Jednoosobowa działalność gospodarcza",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
    },
    dane: {
      forma: "Forma zatrudnienia",
      formaOd: ({ forma, data }: { forma: string; data: string }) => `${forma} od ${data}`,
      dobrowolne: "Dobrowolne ubezpieczenie chorobowe",
      odDnia: ({ data }: { data: string }) => `od ${data}`,
      rozpoczecie: "Rozpoczęcie zatrudnienia w ciąży",
      ustanie: "Ustanie zatrudnienia w ciąży",
      platnikZasilku: "Płatnik zasiłku",
      ptp: "Przewidywany termin porodu",
      ezla: "Zaświadczenia lekarskie e-ZLA",
      liczbaEzla: ({ liczba }: { liczba: string }) => `${liczba} z kodem B (ciąża)`,
      brak: "Brak",
      stanRozliczen: "Stan rozliczeń składek",
      bezZadluzenia: ({ data }: { data: string }) => `Bez zadłużenia na ${data}`,
      zadluzenieNa: ({ kwota, data }: { kwota: string; data: string }) => `Zadłużenie ${kwota} na ${data}`,
      potwierdzenieSkladek: "Potwierdzenie opłacenia składek",
    },
    wpisy: {
      wyczekiwanieObowiazkowe: "Okres wyczekiwania na zasiłek chorobowy, ubezpieczenie obowiązkowe",
      wyczekiwanieDobrowolne: "Okres wyczekiwania na zasiłek chorobowy, ubezpieczenie dobrowolne",
      wyczekiwaniePrzerwa: "Okres wyczekiwania na zasiłek chorobowy, przerwa między okresami ubezpieczenia",
      wyjatekAbsolwenta: "Wyjątki od okresu wyczekiwania, od ukończenia szkoły albo uczelni",
      wyjatek10Lat: "Wyjątki od okresu wyczekiwania, obowiązkowe ubezpieczenie chorobowe",
      wynagrodzenie: "Wynagrodzenie chorobowe pracownika",
      zasilekWCiazy: "Zasiłek chorobowy w ciąży",
      progZadluzenia: "Próg zadłużenia z tytułu składek osoby prowadzącej pozarolniczą działalność",
      rehabilitacyjneOkres: "Świadczenie rehabilitacyjne, okres",
      rehabilitacyjneStawka: "Świadczenie rehabilitacyjne, stawka",
      zwzm: "Zasiłek w wysokości zasiłku macierzyńskiego",
      minimalnaPodstawa: "Minimalna podstawa wymiaru zasiłku pracownika na pełnym etacie",
      macierzynski: "Zasiłek macierzyński, wariant 81,5%",
    },
    jednostki: {
      dni: ({ liczba }: { liczba: string }) => `${liczba} dni`,
      lata: ({ liczba }: { liczba: string }) => `${liczba} lat`,
      miesiace: ({ liczba }: { liczba: string }) => `${liczba} miesięcy`,
      dniIDni: ({ a, b }: { a: string; b: string }) => `${a} dni, a od roku po ukończeniu 50 lat ${b} dni`,
      procentPodstawy: ({ procent }: { procent: string }) => `${procent}% podstawy`,
      trzyStawki: ({ a, b, c }: { a: string; b: string; c: string }) =>
        `${a}% przez pierwsze 3 miesiące, ${b}% za pozostały okres, ${c}% w ciąży`,
    },
    warunki: {
      zasilekChorobowy: [
        "Wyjątek absolwenta: ubezpieczenie chorobowe w ciągu 90 dni od ukończenia szkoły albo uzyskania dyplomu.",
        "Przerwa między okresami ubezpieczenia spowodowana urlopem wychowawczym, urlopem bezpłatnym albo czynną służbą wojskową.",
        "Prawo do emerytury, renty z tytułu niezdolności do pracy albo zasiłku dla bezrobotnych przy zasiłku po ustaniu ubezpieczenia.",
      ],
      rehabilitacyjne: [
        "Orzeczenie lekarza orzecznika ZUS, że dalsze leczenie albo rehabilitacja lecznicza rokują odzyskanie zdolności do pracy.",
        "Prawo do emerytury, renty z tytułu niezdolności do pracy albo zasiłku dla bezrobotnych.",
      ],
      zwzm: [
        "Rozwiązanie umowy o pracę z powodu upadłości albo likwidacji pracodawcy albo wygaśnięcie umowy z powodu śmierci pracodawcy.",
        "Brak zapewnienia innego zatrudnienia.",
      ],
      zadluzenie: ({ prog }: { prog: string }) => `Zadłużenie z tytułu składek w dniu powstania prawa nie przekracza ${prog}.`,
    },
    // koniec ViewPregnancyBenefits
  },
  ViewCaseDetails: {
    tytulStrony: "Szczegóły sprawy",
    naglowek: "Szczegóły sprawy",
    // Sekcje sprawy/[idSprawy]/_sekcje (u13, u14, u16, u14, u14, u22, u22, u22, u25, u24, u30, u12)
    sekcjaTerminIKoszt: {
      // koniec sekcjaTerminIKoszt
    },
    sekcjaStatusWnioskuZus: {
      // koniec sekcjaStatusWnioskuZus
    },
    sekcjaPrawoWCiazy: {
      tytul: "Prawo do świadczenia w ciąży",
      opis: "Wynik ustalamy z danych z konta ZUS i profilu rodziny. Szczegóły, dokumenty i zastosowane reguły pokazuje ekran Świadczenia w ciąży.",
      od: ({ data }: { data: string }) => `Od ${data}`,
      otworz: "Zobacz świadczenia w ciąży",
      // koniec sekcjaPrawoWCiazy
    },
    sekcjaZaswiadczeniaEzla: {
      // koniec sekcjaZaswiadczeniaEzla
    },
    sekcjaStanRozliczen: {
      // koniec sekcjaStanRozliczen
    },
    sekcjaOstrzezeniaRyzyk: {
      // koniec sekcjaOstrzezeniaRyzyk
    },
    sekcjaOchronaK30: {
      // koniec sekcjaOchronaK30
    },
    sekcjaWsparcieK35: {
      // koniec sekcjaWsparcieK35
    },
    sekcjaSytuacjaSzczegolnaK34: {
      // koniec sekcjaSytuacjaSzczegolnaK34
    },
    sekcjaPrzyjecieK31K33: {
      // koniec sekcjaPrzyjecieK31K33
    },
    sekcjaWniosekZas53: {
      // koniec sekcjaWniosekZas53
    },
    sekcjaStraznikOplacenieSkladek: {
      // koniec sekcjaStraznikOplacenieSkladek
    },
    // koniec ViewCaseDetails
  },
  ViewCaseGuide: {
    tytulStrony: "Instrukcja sprawy",
    naglowek: "Instrukcja sprawy",
    // Sekcje sprawy/[idSprawy]/instrukcja/_sekcje (u27, u28, u34, u26, u26, u20, u30, u29, u29)
    sekcjaAkcjaWnioskuZam: {
      // koniec sekcjaAkcjaWnioskuZam
    },
    sekcjaAkcjaWnioskuOUrlop: {
      // koniec sekcjaAkcjaWnioskuOUrlop
    },
    sekcjaAkcjaRezygnacjiIPrzejecia: {
      // koniec sekcjaAkcjaRezygnacjiIPrzejecia
    },
    sekcjaAkcjaWariantu: {
      tytul: "Wariant zasiłku macierzyńskiego",
      opis1: "Zdecyduj, jak chcesz otrzymywać zasiłek: po równo – 81,5% podstawy przez cały urlop, albo więcej na początku – 100% podstawy w czasie urlopu macierzyńskiego i 70% w czasie urlopu rodzicielskiego.",
      opis2: "Porównanie pokaże w złotych, ile i kiedy otrzymasz w każdym wariancie i co się zmieni, gdy wrócisz do pracy wcześniej.",
      termin: ({ termin }: { termin: string }) => `Wybierz wariant do ${termin}`,
      terminDopisek: " – to 21. dzień po porodzie. Później zostanie tylko wariant 100% i 70%.",
      poTerminie: ({ termin }: { termin: string }) => `Termin na wariant 81,5% minął ${termin}. Zasiłek za urlop rodzicielski wyniesie 70%.`,
      wybrany: "Wybrany wariant: ",
      wybranyKwota: ({ kwota, tygodnie }: { kwota: string; tygodnie: string }) => ` – ${kwota} miesięcznie przez ${tygodnie}.`,
      wybranyK07: ({ odM, doM, odR, doR, termin }: { odM: string; doM: string; odR: string; doR: string; termin: string }) =>
        `Wpisz we wniosku urlop macierzyński od ${odM} do ${doM} i cały urlop rodzicielski bezpośrednio po nim, od ${odR} do ${doR}. Wniosek złożony do ${termin} zachowa wariant 81,5%.`,
      porownaj: "Porównaj warianty zasiłku",
      stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
      dataPorodu: "Data porodu",
      przewidywanyTermin: "Przewidywany termin porodu",
      wybranyWariant: "Wybrany wariant",
      nieWybrano: "Nie wybrano",
      wariantZapisany: ({ wariant, data }: { wariant: string; data: string }) => `${wariant}, zapisany ${data}`,
      nazwaWariantu: { "81-5": "81,5%", "100-70": "100% i 70%" },
      zostalo: "Zostało na decyzję",
      dni: (n: number) => `${n} ${n === 1 ? "dzień" : "dni"}`,
      tygodnie: (n: number) => `${n} ${n === 1 ? "tydzień" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "tygodnie" : "tygodni"}`,
      brakDaty: "Brak w profilu",
      // koniec sekcjaAkcjaWariantu
    },
    sekcjaAkcjaPodzialuUrlopu: {
      tytul: "Podział urlopu rodzicielskiego",
      opisWymiaru: ({ dzieci, wymiar, imie }: { dzieci: string; wymiar: string; imie: string }) =>
        `Urlop rodzicielski ${dzieci} trwa ${wymiar}. Każde z Was ma w nim 9 tygodni, których nie można przekazać – jeśli ${imie} ich nie wykorzysta, przepadną.`,
      przyJednymDziecku: "przy jednym dziecku",
      przyWiecejDzieciach: "przy więcej niż jednym dziecku",
      zZaZyciem: " z zaświadczeniem „Za życiem”",
      drugiRodzic: "drugi rodzic",
      opisPlanu: "Plan podziału pokaże, ile tygodni przepada i ile miesięcznie otrzyma każde z Was. Zapisany plan zobaczycie oboje.",
      zaplanuj: "Zaplanuj podział urlopu",
      zmien: "Zmień podział urlopu",
      wybrany: "Wybrany wariant: ",
      wybranyPodzial: ({ matki, drugiego }: { matki: string; drugiego: string }) => `${matki} matki i ${drugiego} drugiego rodzica`,
      wybranyPodzialTwoje: ({ matki, drugiego }: { matki: string; drugiego: string }) => `${matki} matki i ${drugiego} Twoje`,
      nicNiePrzepada: " Nic nie przepada.",
      przepada: ({ tygodnie }: { tygodnie: string }) => ` Przepada ${tygodnie}.`,
      szacunkowo: ({ kwota, suma, tygodnie }: { kwota: string; suma: string; tygodnie: string }) =>
        `Szacunkowo drugi rodzic otrzyma ${kwota} miesięcznie, razem ${suma} za ${tygodnie}. Plan widzicie oboje i każde z Was może go zmienić.`,
      szacunkowoTwoje: ({ kwota, suma, tygodnie }: { kwota: string; suma: string; tygodnie: string }) =>
        `Szacunkowo otrzymasz ${kwota} miesięcznie, razem ${suma} za ${tygodnie}. Plan widzicie oboje i każde z Was może go zmienić.`,
      stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
      zapisanyPlan: "Zapisany plan podziału",
      nieZapisano: "Nie zapisano",
      podzialDomyslny: "Podział domyślny",
      zapisanoEtykieta: "Zapisano",
      zapisanoPrzez: ({ data, osoba }: { data: string; osoba: string }) => (osoba ? `${data}, ${osoba}` : data),
      przepadaEtykieta: "Przepada",
      tygodnieTylkoDla: ({ imie }: { imie: string }) => `Tygodnie tylko dla ${imie}`,
      tygodnie: (n: number) => `${n} ${n === 1 ? "tydzień" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "tygodnie" : "tygodni"}`,
      // koniec sekcjaAkcjaPodzialuUrlopu
    },
    sekcjaAkcjaKalkulatora: {
      // koniec sekcjaAkcjaKalkulatora
    },
    sekcjaAkcjaZas53: {
      // koniec sekcjaAkcjaZas53
    },
    sekcjaAkcjaOdpisu: {
      // koniec sekcjaAkcjaOdpisu
    },
    sekcjaPytaniaDoZus: {
      // koniec sekcjaPytaniaDoZus
    },
    // koniec ViewCaseGuide
  },
  ViewDeadlines: {
    tytulStrony: "Terminy",
    naglowek: "Terminy",
    // Sloty terminy/_sloty (u18)
    akcjaPlikuKalendarza: {
      // koniec akcjaPlikuKalendarza
    },
    // koniec ViewDeadlines
  },
  ViewApplicationList: {
    tytulStrony: "Twoje wnioski",
    naglowek: "Twoje wnioski",
    // koniec ViewApplicationList
  },
  ViewSickLeaveList: {
    tytulStrony: "Zaświadczenia lekarskie e-ZLA",
    naglowek: "Zaświadczenia lekarskie e-ZLA",
    // koniec ViewSickLeaveList
  },
  ViewContributionBalance: {
    tytulStrony: "Stan rozliczeń składek",
    naglowek: "Stan rozliczeń składek",
    // koniec ViewContributionBalance
  },
  ViewContributionCertificate: {
    tytulStrony: "Zaświadczenie o stanie rozliczeń",
    naglowek: "Zaświadczenie o stanie rozliczeń",
    // koniec ViewContributionCertificate
  },
  ViewZusAccountData: {
    tytulStrony: "Dane z Twojego konta ZUS",
    naglowek: "Dane z Twojego konta ZUS",
    // koniec ViewZusAccountData
  },
  ViewZusQuestion: {
    tytulStrony: "Pytanie do ZUS",
    naglowek: "Pytanie do ZUS",
    // koniec ViewZusQuestion
  },
  ViewZusQuestionSent: {
    tytulStrony: "Pytanie do ZUS wysłane",
    naglowek: "Pytanie do ZUS",
    // koniec ViewZusQuestionSent
  },
  ViewSupportOrganizations: {
    tytulStrony: "Organizacje wsparcia",
    naglowek: "Organizacje wsparcia",
    // koniec ViewSupportOrganizations
  },
  ViewCalcMaternityInput: {
    tytulStrony: "Kalkulator zasiłku macierzyńskiego",
    naglowek: "Kalkulator zasiłku macierzyńskiego",
    // Sloty kalkulator-zasilku/_sloty (u21)
    daneZPrzykladowejSprawy: {
      wstep: ({ id }: { id: string }) =>
        `Uzupełniliśmy dane z przykładowej sprawy ${id}. Zastępują one w tym wyliczeniu dane Twojego profilu rodziny, a plan rodziny pozostaje bez zmian.`,
      wstepBezId: "Uzupełniliśmy dane z przykładowej sprawy. Zastępują one w tym wyliczeniu dane Twojego profilu rodziny, a plan rodziny pozostaje bez zmian.",
      brakSprawy: "Przykładowa sprawa nie ma wyniku weryfikacji. Zatwierdź dane sprawy, żeby przenieść je do kalkulatora.",
      tytulUbezpieczonej: "Ubezpieczona z przykładowej sprawy",
      tytulUrlopu: "Urlop z wniosku",
      zrodlo: "Źródło: przykładowa sprawa",
      formaZatrudnienia: "Forma zatrudnienia",
      formy: {
        "umowa-o-prace": "Umowa o pracę",
        "umowa-zlecenia": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
        jdg: "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      rola: "Rola",
      role: { matka: "Matka", "ojciec-przejmujacy": "Ojciec, który przejmuje część urlopu macierzyńskiego" },
      zdarzenie: "Zdarzenie",
      zdarzeniePorod: ({ data, liczba }: { data: string; liczba: string }) => `Poród ${data}, liczba dzieci: ${liczba}`,
      zdarzenieTermin: ({ data, liczba }: { data: string; liczba: string }) =>
        `Przewidywany poród ${data}, liczba dzieci: ${liczba}`,
      zdarzenieMartwe: ({ data }: { data: string }) => `Urodzenie martwego dziecka ${data}`,
      zaZyciem: "Zaświadczenie „Za życiem”",
      zaZyciemZDnia: ({ data }: { data: string }) => `Tak, wystawione ${data}`,
      podstawa: "Podstawa wymiaru zasiłku",
      zrodloPodstawy: ({ opis }: { opis: string }) => `Źródło: przykładowa sprawa. ${opis}`,
      rodzajUrlopu: "Rodzaj urlopu",
      rodzajeUrlopu: {
        macierzynski: "Urlop macierzyński",
        "czesc-przed-porodem": "Urlop macierzyński przed porodem",
        rodzicielski: "Urlop rodzicielski",
        uzupelniajacy: "Uzupełniający urlop macierzyński",
        ojcowski: "Urlop ojcowski",
        "na-warunkach-macierzynskiego": "Urlop na warunkach urlopu macierzyńskiego",
        "przejety-macierzynski": "Urlop macierzyński przejęty przez ojca",
        "laczenie-z-praca": "Urlop rodzicielski łączony z pracą",
        "wydluzenie-rodzicielskiego": "Wydłużenie urlopu rodzicielskiego",
      },
      poczatek: "Początek okresu zasiłku",
      poczatekOpis: "Źródło: przykładowa sprawa. Koniec wyliczy kalkulator.",
      okresMatki: "Okres wykorzystany przez matkę",
      okresOdDo: ({ od, do: koniec }: { od: string; do: string }) => `od ${od} do ${koniec}`,
      oswiadczenie: "Oświadczenie o pełnym wymiarze urlopów",
      dataZlozenia: "Data złożenia wniosku",
      tak: "Tak",
      nie: "Nie",
      pobyt: "Pobyt dziecka w szpitalu w okresie liczenia",
      pobytDni: ({ dni, tydzien, masa }: { dni: string; tydzien: string; masa: string }) =>
        `${dni} dni, poród w ${tydzien}. tygodniu ciąży, masa urodzeniowa ${masa} g`,
      wrocDoWeryfikacji: "Wróć do weryfikacji sprawy",
      // koniec daneZPrzykladowejSprawy
    },
    // koniec ViewCalcMaternityInput
  },
  ViewCalcMaternityResult: {
    tytulStrony: "Wynik kalkulatora zasiłku macierzyńskiego",
    naglowek: "Wynik kalkulatora zasiłku macierzyńskiego",
    // Sloty kalkulator-zasilku/wynik/_sloty (u20, u20, u21)
    akcjeUrlopow: {
      // koniec akcjeUrlopow
    },
    zapisScenariusza: {
      // koniec zapisScenariusza
    },
    porownanieZRozstrzygnieciem: {
      tytul: ({ id }: { id: string }) => `Porównanie z rozstrzygnięciem sprawy ${id}`,
      tytulBezId: "Porównanie z rozstrzygnięciem sprawy",
      brakSprawy: "Przykładowa sprawa nie ma wyniku weryfikacji, więc wyliczenia nie porównamy z rozstrzygnięciem.",
      podpis: "Porównanie wyliczenia zasiłku macierzyńskiego z rozstrzygnięciem sprawy",
      przewijanie: "Tabela porównania z rozstrzygnięciem, przewiń w poziomie",
      kolumny: { pole: "Zasiłek macierzyński", wyliczenie: "Wyliczenie", rozstrzygniecie: "Rozstrzygnięcie sprawy", porownanie: "Porównanie" },
      pola: { poczatek: "Początek okresu", koniec: "Koniec okresu", kwota: "Miesięczna kwota" },
      zgodne: "Zgodne",
      rozne: "Różne",
      zgodneRoznica: ({ roznica }: { roznica: string }) => `Zgodne, różnica ${roznica}`,
      rozneRoznica: ({ roznica }: { roznica: string }) => `Różne, różnica ${roznica}`,
      brakWRozstrzygnieciu: "Brak w rozstrzygnięciu",
      brakWartosci: "-",
      notaTolerancji: ({ tolerancja }: { tolerancja: string }) =>
        `Daty początku i końca muszą być równe. Kwoty uznajemy za zgodne, gdy różnią się najwyżej o tolerancję porównania kwoty: ${tolerancja}.`,
      notaRoznicy: ({ tolerancja }: { tolerancja: string }) =>
        `Różnica przekracza tolerancję porównania kwoty: ${tolerancja}. Sprawdź dane sprawy i zastosowane reguły.`,
      okresyTytul: "Okres zasiłku i wypłaty według danych sprawy",
      podpisOkresow: "Okresy zasiłku, stawki i wypłaty wyliczone z danych sprawy",
      przewijanieOkresow: "Tabela okresów zasiłku, przewiń w poziomie",
      kolumnyOkresow: { urlop: "Urlop", od: "Od", do: "Do", dni: "Dni", stawka: "Stawka", miesiecznie: "Miesięcznie", suma: "Suma" },
      podstawa: ({ kwota }: { kwota: string }) => `Podstawa wymiaru ${kwota}, źródło: przykładowa sprawa.`,
      coDalej: "Co dalej",
      zapisano: "Wynik zapisaliśmy w wynikach kalkulacji z podstawą wymiaru ze źródłem przykładowa sprawa. Twój plan rodziny, w tym wariant zasiłku wybrany przy sprawie Wniosek o zasiłek macierzyński, pozostaje bez zmian.",
      poprawOpis: "Sprawdź dane sprawy, które wpływają na podstawę wymiaru i okres zasiłku, i popraw je na ekranie danych sprawy.",
      wrocDoWeryfikacji: "Wróć do weryfikacji sprawy",
      wybierzInna: "Wybierz inną sprawę",
      poprawDane: "Popraw dane sprawy",
      // koniec porownanieZRozstrzygnieciem
    },
    // koniec ViewCalcMaternityResult
  },
  ViewCalcScenarioCompare: {
    tytulStrony: "Porównanie scenariuszy",
    naglowek: "Porównanie scenariuszy",
    // koniec ViewCalcScenarioCompare
  },
  ViewCalcMaternityVariant: {
    tytulStrony: "Porównanie wariantów zasiłku macierzyńskiego",
    naglowek: "Porównanie wariantów zasiłku macierzyńskiego",
    otworzKalkulator: "Otwórz kalkulator zasiłku",
    powrotK07: "Wniosek o urlop macierzyński i rodzicielski u pracodawcy",
    powrotK08: "Wniosek o zasiłek macierzyński",
    tytulSprawyK07: "Wniosek o urlop macierzyński i rodzicielski u pracodawcy",
    tytulSprawyK08: "Wniosek o zasiłek macierzyński",
    tygodnie: (n: number) => `${n} ${n === 1 ? "tydzień" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "tygodnie" : "tygodni"}`,
    tygodniDopelniacz: (n: number) => `${n} ${n === 1 ? "tygodnia" : "tygodni"}`,
    dni: (n: number) => `${n} ${n === 1 ? "dzień" : "dni"}`,
    okres: ({ od, do: koniec }: { od: string; do: string }) => `${od}–${koniec}`,
    brakDanychTytul: "Kalkulator wariantu nie jest dostępny",
    brakPrawa: "Porównanie wariantów dotyczy matki, której przysługuje zasiłek macierzyński: pracującej na umowie o pracę albo wykonującej umowę zlecenia lub prowadzącej jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym.",
    brakDatyPorodu: "Do porównania wariantów potrzebna jest data porodu albo przewidywany termin porodu. Uzupełnij je w profilu rodziny.",
    brakRodziny: "Porównanie wariantów korzysta z profilu rodziny. Uzupełnij profil, żeby zobaczyć wyliczenie.",
    przejdzDoProfilu: "Przejdź do profilu rodziny",
    wrocDoPlanu: "Wróć do planu rodziny",
    wrocDoInstrukcji: "Wróć do instrukcji sprawy",
    daneTytul: "Dane do wyliczenia",
    zProfilu: ({ dataPorodu, przewidywany, liczbaDzieci, zaZyciem }: { dataPorodu: string; przewidywany: boolean; liczbaDzieci: number; zaZyciem: boolean }) =>
      `Z profilu rodziny: ${przewidywany ? "przewidywany termin porodu" : "data porodu"} ${dataPorodu}, ${liczbaDzieci === 1 ? "jedno dziecko" : `liczba dzieci: ${liczbaDzieci}`}, ${zaZyciem ? "z zaświadczeniem „Za życiem”" : "bez zaświadczenia „Za życiem”"}`,
    formaWProfilu: {
      "umowa-o-prace": "umowa o pracę",
      "umowa-zlecenia": "umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      jdg: "działalność z dobrowolnym ubezpieczeniem chorobowym",
      "brak-tytulu": "brak tytułu do ubezpieczenia",
    },
    twojaOdpowiedz: " (Twoja odpowiedź)",
    wymiaryUrlopow: ({ macierzynski, dniM, rodzicielski, dniR }: { macierzynski: string; dniM: number; rodzicielski: string; dniR: number }) =>
      `Urlop macierzyński trwa ${macierzynski} (${dniM} dni), a Twój urlop rodzicielski ${rodzicielski} (${dniR} dni).`,
    podstawaEtykieta: "Podstawa wymiaru zasiłku",
    podstawaDoWyliczenia: "Podstawa wymiaru zasiłku do wyliczenia",
    podstawaPodpowiedz: "Kwota w złotych większa od zera, najwyżej 99 999,99 zł, na przykład 5177,40.",
    podstawaNotatka: "Podstawą jest średnia podstaw składek na ubezpieczenie chorobowe z 12 pełnych miesięcy przed miesiącem porodu, pomniejszona o 13,71%.",
    zrodlo: ({ zrodlo }: { zrodlo: string }) => `Źródło: ${zrodlo}`,
    zrodla: {
      "konto-zus": "konto ZUS",
      "wartosc-wpisana-przez-rodzica": "odpowiedź rodzica",
      "przykladowa-sprawa": "przykładowa sprawa",
    },
    jakPoliczylismy: "Jak policzyliśmy podstawę",
    kolumnaSkladnik: "Składnik",
    kolumnaKwota: "Kwota",
    przewijanieTabeli: "Tabela przewija się w poziomie",
    podstawaWiersz: "Podstawa wymiaru zasiłku",
    poChorobowym: "Zasiłek macierzyński następuje bezpośrednio po zasiłku chorobowym? Wtedy podstawą jest podstawa zasiłku chorobowego. Wpisz ją w",
    kalkulatorzeZasilku: "kalkulatorze zasiłku",
    tygodnieEtykieta: "Liczba tygodni urlopu rodzicielskiego przed powrotem do pracy",
    tygodniePodpowiedz: ({ maks, opis, pelny }: { maks: number; opis: string; pelny: string }) => `Od 0 do ${maks} tygodni. Pełny urlop rodzicielski ${opis} to ${pelny}.`,
    przyJednymDziecku: "przy jednym dziecku",
    przyWiecejDzieciach: "przy więcej niż jednym dziecku",
    zZaZyciem: "z zaświadczeniem „Za życiem”",
    oblicz: "Oblicz",
    porownanieTytul: "Porównanie wariantów",
    pustePorownanie: "Zestawienie wariantów pokażemy, gdy wpiszesz podstawę wymiaru zasiłku.",
    wynikPelny: ({ tygodnie, koniec }: { tygodnie: string; koniec: string }) => `Wynik dla ${tygodnie} urlopu rodzicielskiego – to pełny urlop, do ${koniec}.`,
    wynikCzesciowy: ({ tygodnie, koniec, powrot }: { tygodnie: string; koniec: string; powrot: string }) =>
      `Wynik dla ${tygodnie} urlopu rodzicielskiego – urlop kończy się ${koniec}, a do pracy wracasz ${powrot}.`,
    wynikZero: ({ powrot }: { powrot: string }) => `Wynik dla 0 tygodni urlopu rodzicielskiego – do pracy wracasz ${powrot}, dzień po końcu urlopu macierzyńskiego.`,
    zPodstawa: ({ kwota, zrodlo }: { kwota: string; zrodlo: string }) => ` Podstawa wymiaru: ${kwota}, źródło: ${zrodlo}.`,
    terminWyboru: ({ termin }: { termin: string }) => `Wybierz wariant do ${termin}`,
    terminWyboruDopisek: ({ dni }: { dni: string }) => ` – to 21. dzień po porodzie. Zostało ${dni}.`,
    informacjaWyrownanie: ({ kwota }: { kwota: string }) =>
      `Gdy nie wykorzystasz żadnego dnia urlopu rodzicielskiego, w wariancie 81,5% otrzymasz wyrównanie zasiłku za urlop macierzyński do 100% podstawy – ${kwota}. Dlatego obie sumy są równe.`,
    wariant81: "Wariant 81,5%",
    wariant81Opis: "Równe wypłaty przez cały urlop.",
    wariant81OpisZero: "Równe wypłaty i wyrównanie po urlopie macierzyńskim.",
    wariant100: "Wariant 100% i 70%",
    wariant100Opis: "Więcej w urlopie macierzyńskim, mniej w rodzicielskim.",
    miesiecznieprzez: ({ tygodnie }: { tygodnie: string }) => `Miesięcznie przez ${tygodnie}`,
    miesiecznieMacierzynski: ({ tygodnie }: { tygodnie: string }) => `Miesięcznie przez ${tygodnie} urlopu macierzyńskiego`,
    miesiecznieRodzicielski: ({ tygodnie }: { tygodnie: string }) => `Miesięcznie przez ${tygodnie} urlopu rodzicielskiego`,
    podwyzszenie: ({ procent, kwota }: { procent: string; kwota: string }) =>
      `${procent} podstawy to ${kwota}, więc podwyższamy wypłatę do kwoty świadczenia rodzicielskiego.`,
    sumaZa: ({ tygodnie }: { tygodnie: string }) => `Suma za ${tygodnie}`,
    wyrownanieTytul: "Wyrównanie do 100% za urlop macierzyński",
    jednorazowo: "Jednorazowo, na wniosek",
    urlopRodzicielski: "Urlop rodzicielski",
    nieKorzystasz: "Nie korzystasz – 0 tygodni",
    wybierz81: "Wybierz wariant 81,5%",
    wybierz100: "Wybierz wariant 100% i 70%",
    zmienNa81: "Zmień na wariant 81,5%",
    zmienNa100: "Zmień na wariant 100% i 70%",
    twojWybor: "Twój wybór",
    wybranyWariant: "Wybrany wariant",
    roznicaPelny: ({ kwota }: { kwota: string }) =>
      `Przy pełnym urlopie wariant 100% i 70% daje o ${kwota} więcej. Im wcześniej wrócisz do pracy w czasie urlopu rodzicielskiego, tym większa różnica. Zmień liczbę tygodni w danych do wyliczenia, żeby to sprawdzić.`,
    roznicaPelnyRodzic: ({ kwota }: { kwota: string }) =>
      `Przy pełnym urlopie wariant 100% i 70% daje o ${kwota} więcej. Wyliczenie opiera się na podstawie, którą wpisujesz – ZUS ustali ją z Twoich dokumentów przy wniosku.`,
    okresyTytul: "Wypłaty w okresach urlopu",
    wykresPodpis: "Miesięczna wypłata w każdym okresie",
    wykresMacierzynski: ({ tygodnie }: { tygodnie: string }) => `Urlop macierzyński – ${tygodnie}`,
    wykresRodzicielski: ({ tygodnie }: { tygodnie: string }) => `Urlop rodzicielski – ${tygodnie}`,
    stawka81: "81,5%: ",
    stawka100: "100%: ",
    stawka70: "70%: ",
    zestawienie: "Zestawienie wypłat po okresach",
    zestawieniePowrot: ({ data }: { data: string }) => `Zestawienie wypłat po okresach przy powrocie do pracy ${data}`,
    zestawienieZero: ({ data }: { data: string }) => `Zestawienie wypłat przy powrocie do pracy ${data}`,
    kolumnaOkres: "Okres",
    kolumna81Miesiecznie: "Wariant 81,5% / miesięcznie",
    kolumna81Suma: "Wariant 81,5% / suma",
    kolumna100Miesiecznie: "Wariant 100% i 70% / miesięcznie",
    kolumna100Suma: "Wariant 100% i 70% / suma",
    kolumnaStawka: "Stawka",
    kolumnaMiesiecznie: "Miesięcznie",
    kolumnaSuma: "Suma",
    urlopMacierzynski: "Urlop macierzyński",
    razem: "Razem",
    okresDni: ({ okres, dni }: { okres: string; dni: string }) => `${okres}, ${dni}`,
    wyrownanieWiersz: "Wyrównanie do 100%",
    wyrownanieWierszOpis: "Za urlop macierzyński, jednorazowo",
    brakWartosci: "-",
    notatkaSuma: ({ kwota }: { kwota: string }) =>
      `Sumę za okres liczymy tak: podstawa wymiaru podzielona przez 30, pomnożona przez stawkę i liczbę dni okresu. Wypłatę niższą niż kwota świadczenia rodzicielskiego, obecnie ${kwota}, podwyższamy do tej kwoty.`,
    notatkaPodwyzszenie: ({ kwota }: { kwota: string }) =>
      `Wypłatę niższą niż kwota świadczenia rodzicielskiego, obecnie ${kwota}, podwyższamy do tej kwoty, a za miesiąc, w którym zasiłek przysługuje tylko za część dni – do kwoty proporcjonalnej do liczby dni. Porównujemy wypłatę przed potrąceniem zaliczki na podatek, a podwyższenie jest wolne od podatku.`,
    notatkaHarmonogram: "Sumy liczymy z wypłat w każdym miesiącu kalendarzowym. Kwotę za każdy miesiąc zobaczysz w",
    notatkaKalkulator: "Liczymy według tych samych reguł co kalkulator zasiłku. Wypłaty w każdym miesiącu, urlopy drugiego rodzica i datę powrotu do pracy zobaczysz w",
    notatkaKalkulatorPowrot: "Liczymy według tych samych reguł co kalkulator zasiłku. Datę powrotu do pracy i niewykorzystane tygodnie urlopu zaplanujesz w",
    kropka: ".",
    zapisanoK08: "Zapisaliśmy wariant 81,5% w planie rodziny przy sprawie Wniosek o zasiłek macierzyński. Kreator wniosku ustawi go jako domyślny.",
    zapisanoK08Wariant100: "Zapisaliśmy wariant 100% i 70% w planie rodziny przy sprawie Wniosek o zasiłek macierzyński. Kreator wniosku ustawi go jako domyślny.",
    zapisanoK07: "Zapisaliśmy wariant 81,5% w planie rodziny przy sprawie Wniosek o urlop macierzyński i rodzicielski u pracodawcy. Pracujesz na umowie o pracę, więc wariant wskażesz we wniosku do pracodawcy.",
    zapisanoK07Wariant100: "Zapisaliśmy wariant 100% i 70% w planie rodziny przy sprawie Wniosek o urlop macierzyński i rodzicielski u pracodawcy. Pracujesz na umowie o pracę, więc wariant wskażesz we wniosku do pracodawcy.",
    wyborTytul: ({ wariant }: { wariant: string }) => `Twój wybór: wariant ${wariant}`,
    nazwaWariantu: { "81-5": "81,5%", "100-70": "100% i 70%" },
    wyborOpis81: ({ kwota, tygodnie, od, do: koniec, suma }: { kwota: string; tygodnie: string; od: string; do: string; suma: string }) =>
      `Otrzymasz ${kwota} miesięcznie przez ${tygodnie}, od ${od} do ${koniec} – razem ${suma}.`,
    wyborOpis100: ({ kwotaM, kwotaR, suma }: { kwotaM: string; kwotaR: string; suma: string }) =>
      `Otrzymasz ${kwotaM} miesięcznie w czasie urlopu macierzyńskiego i ${kwotaR} miesięcznie w czasie urlopu rodzicielskiego – razem ${suma}.`,
    wyborTerminK08: ({ termin }: { termin: string }) => `Złóż wniosek do ${termin}`,
    wyborTerminK08Dopisek: ", żeby objąć nim cały urlop rodzicielski z zasiłkiem 81,5%. Do tego dnia możesz też zmienić wariant.",
    wyborTerminK07: ({ termin }: { termin: string }) => `Złóż pracodawcy wniosek do ${termin}`,
    wyborTerminK07Dopisek: " – o urlop macierzyński i cały urlop rodzicielski bezpośrednio po nim. Tylko wtedy zasiłek wyniesie 81,5% za cały okres.",
    wypelnijWniosek: "Wypełnij wniosek",
    zobaczInstrukcjePracodawcy: "Zobacz instrukcję wniosku u pracodawcy",
    zapisaneWWynikach: ({ data }: { data: string }) => `Zapisane w wynikach kalkulacji ${data}`,
    wariantZasilku: "Wariant zasiłku",
    podstawaWymiaru: "Podstawa wymiaru",
    podstawaZeZrodlem: ({ kwota, zrodlo }: { kwota: string; zrodlo: string }) => `${kwota}, źródło: ${zrodlo}`,
    urlopPrzedPowrotem: "Urlop rodzicielski przed powrotem do pracy",
    sprawaWPlanie: "Sprawa w planie rodziny",
    poTerminieTytul: "Twój wariant zasiłku",
    poTerminieOpis: ({ termin }: { termin: string }) => `Termin na wariant 81,5% minął ${termin}, 21. dnia po porodzie. `,
    // koniec ViewCalcMaternityVariant
  },
  ViewCalcParentalSplit: {
    tytulStrony: "Podział urlopu rodzicielskiego",
    naglowek: "Podział urlopu rodzicielskiego",
    powrot: "Urlop rodzicielski drugiego rodzica",
    otworzKalkulator: "Otwórz kalkulator zasiłku",
    brakRodziny: "Podział urlopu korzysta z profilu rodziny. Uzupełnij profil, żeby zaplanować podział.",
    przejdzDoProfilu: "Przejdź do profilu rodziny",
    zapisano: ({ tygodnieMatki, tygodnieDrugiego }: { tygodnieMatki: string; tygodnieDrugiego: string }) =>
      `Zapisaliśmy plan podziału: ${tygodnieMatki} matki i ${tygodnieDrugiego} drugiego rodzica. Zobaczycie go oboje – w planie rodziny i przy sprawie Urlop rodzicielski drugiego rodzica.`,
    rozdzielTytul: "Rozdziel tygodnie",
    opis: ({ dzieci, wymiar, maks }: { dzieci: string; wymiar: string; maks: string }) =>
      `W profilu rodziny jest ${dzieci}, więc urlop rodzicielski trwa ${wymiar}. Każde z Was może wykorzystać najwyżej ${maks}. Matka i drugi rodzic mają po 9 tygodni, których nie można przekazać – niewykorzystane przepadają.`,
    opisBezPrawa: ({ dzieci, wymiar, maks }: { dzieci: string; wymiar: string; maks: string }) =>
      `W profilu rodziny jest ${dzieci}, więc urlop rodzicielski trwa ${wymiar}. Drugi rodzic nie ma prawa do zasiłku, dlatego możesz wykorzystać najwyżej ${maks}, a 9 tygodni drugiego rodzica przepada.`,
    jednoDziecko: "jedno dziecko",
    jednoDzieckoZaZyciem: "jedno dziecko z zaświadczeniem „Za życiem”",
    wiecejDzieci: ({ liczba }: { liczba: number }) => `${liczba} dzieci`,
    wiecejDzieciZaZyciem: ({ liczba }: { liczba: number }) => `${liczba} dzieci z zaświadczeniem „Za życiem”`,
    matkaNaglowek: ({ imie }: { imie: string }) => (imie ? `Matka – ${imie}` : "Matka"),
    drugiNaglowek: ({ imie }: { imie: string }) => (imie ? `Drugi rodzic – ${imie}` : "Drugi rodzic"),
    tygodnieMatki: "Tygodnie matki",
    tygodnieDrugiego: "Tygodnie drugiego rodzica",
    podpowiedzMatki: ({ maks }: { maks: number }) => `Od 0 do ${maks} tygodni`,
    podpowiedzDrugiego: ({ maks, wymiar }: { maks: number; wymiar: number }) => `Od 0 do ${maks} tygodni, razem z tygodniami matki najwyżej ${wymiar}`,
    podstawaMatkiEtykieta: "Podstawa wymiaru zasiłku matki",
    podstawaDrugiegoEtykieta: "Podstawa wymiaru zasiłku drugiego rodzica",
    podstawaPodpowiedz: "Kwota w złotych większa od zera, najwyżej 99 999,99 zł, na przykład 5177,40",
    podstawaWymiaru: "Podstawa wymiaru",
    podstawaZeZrodlem: ({ kwota, zrodlo }: { kwota: string; zrodlo: string }) => `${kwota}, źródło: ${zrodlo}`,
    zrodloKontoZus: "konto ZUS",
    zrodloKontoZusOsoby: ({ osoby }: { osoby: string }) => `konto ZUS ${osoby}`,
    zrodloPel: "pełnomocnictwo PEL",
    zrodloRodzic: "odpowiedź rodzica",
    zrodloSprawa: "przykładowa sprawa",
    wariantZasilku: "Wariant zasiłku",
    wariantZPlanu: ({ wariant }: { wariant: string }) => `${wariant} – z planu rodziny. `,
    wariantWybrany: ({ wariant, data, sprawa }: { wariant: string; data: string; sprawa: string }) => `${wariant} – wybrany ${data} przy sprawie ${sprawa}. `,
    porownajWarianty: "Porównaj warianty",
    formaZatrudnienia: "Forma zatrudnienia",
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      jdg: "Jednoosobowa działalność gospodarcza",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "brak-drugiego-rodzica": "Brak drugiego rodzica",
    },
    zDobrowolnym: " z dobrowolnym ubezpieczeniem chorobowym",
    bezDobrowolnego: " bez dobrowolnego ubezpieczenia chorobowego",
    zrodloOdpowiedz: ", źródło: odpowiedź rodzica",
    zeroTygodni: "0 tygodni",
    bezZmiany: "Tej liczby nie można zmienić.",
    bezPrawaNotatka: "Bez ubezpieczenia chorobowego drugi rodzic nie ma prawa do zasiłku za okres urlopu rodzicielskiego, więc jego 9 tygodni przepada. Forma zatrudnienia się zmieniła?",
    sprawdzProfil: "Sprawdź profil rodziny",
    zaprosDrugiego: "Zaproś drugiego rodzica do planu",
    razem: ({ suma, wymiar }: { suma: string; wymiar: number }) => `${suma} z ${wymiar} tygodni`,
    razemEtykieta: "Razem: ",
    wylicz: "Wylicz podział",
    wynikTytul: "Wynik podziału",
    pustyWynik: "Wynik podziału i wypłaty pokażemy, gdy poprawisz dane i wyliczysz podział.",
    pustyWynikPodstawa: "Wynik podziału i wypłaty pokażemy, gdy wpiszesz podstawę wymiaru drugiego rodzica i wyliczysz podział.",
    kafelMatka: "Matka",
    kafelDrugi: "Drugi rodzic",
    kafelPrzepada: "Przepada",
    kafelRazem: "Razem urlopu rodzicielskiego",
    pasekTytul: ({ wymiar }: { wymiar: string }) => `Podział ${wymiar} urlopu`,
    pasekOpis: ({ wymiar, pula, matka, drugi, przepada }: { wymiar: string; pula: string; matka: string; drugi: string; przepada: string }) =>
      `Podział ${wymiar} urlopu. Tylko dla matki 9 tygodni, do podziału ${pula}, tylko dla drugiego rodzica 9 tygodni. Matka ${matka}, drugi rodzic ${drugi}, przepada ${przepada}.`,
    tylkoMatki: "Tylko dla matki – 9",
    doPodzialu: ({ pula }: { pula: string }) => `Do podziału – ${pula}`,
    tylkoDrugiego: "Tylko dla drugiego rodzica – 9",
    legendaMatka: ({ tygodnie, stawka }: { tygodnie: string; stawka: string }) => ` – ${tygodnie}${stawka}`,
    legendaDrugi: ({ tygodnie, stawka }: { tygodnie: string; stawka: string }) => ` – ${tygodnie}${stawka}`,
    legendaPrzepada: ({ tygodnie }: { tygodnie: number }) => ` – ${tygodnie}`,
    nieprzekazywalneTytul: "Tygodnie, których nie można przekazać",
    matkaWykorzystuje: ({ uzyte }: { uzyte: number }) => `Matka wykorzystuje ${uzyte} z 9 tygodni, które przysługują tylko jej.`,
    drugiWykorzystuje: ({ uzyte }: { uzyte: number }) => `Drugi rodzic wykorzystuje ${uzyte} z 9 tygodni, które przysługują tylko jemu.`,
    drugiWykorzystujePula: ({ pula }: { pula: string }) => `Drugi rodzic wykorzystuje 9 z 9 tygodni, które przysługują tylko jemu, i ${pula} z puli do podziału.`,
    drugiBezPrawa: "Drugi rodzic nie ma prawa do zasiłku – 9 tygodni, które przysługują tylko jemu, przepada.",
    tabelaPodpis: "Szacunkowe miesięczne wypłaty",
    przewijanieTabeli: "Tabela przewija się w poziomie",
    kolumnaRodzic: "Rodzic",
    kolumnaTygodnie: "Tygodnie",
    kolumnaPodstawa: "Podstawa wymiaru",
    kolumnaStawka: "Stawka",
    kolumnaMiesiecznie: "Miesięcznie",
    kolumnaSuma: "Suma za urlop rodzicielski",
    wierszMatkaOpis: ({ wariant }: { wariant: string }) => `Wariant ${wariant}`,
    wierszTylkoJego: ({ tygodnie }: { tygodnie: string }) => `${tygodnie} tylko dla niego`,
    wierszDrugiRazem: "Tygodnie tylko dla niego i z puli do podziału",
    wierszPonad: ({ tygodnie }: { tygodnie: string }) => `${tygodnie} ponad swoje 9, stawka z wariantu matki`,
    wierszBezPrawa: "Zasiłek nie przysługuje",
    brakWartosci: "-",
    notatkaStawki: "Za 9 tygodni tylko dla drugiego rodzica zasiłek wynosi 70% jego podstawy. Za tygodnie ponad 9 stosujemy stawkę urlopu rodzicielskiego z wariantu matki: 70% w wariancie 100% i 70% albo 81,5% w wariancie 81,5%.",
    notatkaCzesci: "Liczymy według tych samych reguł co kalkulator zasiłku. Urlop możecie wykorzystać jednocześnie, na zmianę albo po kolei, w najwyżej 5 częściach – daty części ułożysz w",
    kalkulatorzeZasilku: "kalkulatorze zasiłku",
    kropka: ".",
    zapisz: "Zapisz plan podziału",
    zapiszOpis: "Plan zobaczycie oboje – w planie rodziny i przy sprawie Urlop rodzicielski drugiego rodzica.",
    wrocDoPlanu: "Wróć do planu rodziny",
    nazwaWariantu: { "81-5": "81,5%", "100-70": "100% i 70%" },
    sprawaK07: "Wniosek o urlop macierzyński i rodzicielski u pracodawcy",
    sprawaK08: "Wniosek o zasiłek macierzyński",
    // koniec ViewCalcParentalSplit
  },
  ViewSampleCaseList: {
    tytulStrony: "Przykładowe sprawy ZUS",
    naglowek: "Przykładowe sprawy ZUS",
    // koniec ViewSampleCaseList
  },
  ViewSampleCaseUpload: {
    tytulStrony: "Wgraj dokument sprawy",
    naglowek: "Wgraj dokument sprawy",
    // koniec ViewSampleCaseUpload
  },
  ViewSampleCaseData: {
    tytulStrony: "Dane sprawy z wgranych dokumentów",
    naglowek: "Dane sprawy z wgranych dokumentów",
    // koniec ViewSampleCaseData
  },
  ViewSampleCaseVerification: {
    tytulStrony: "Weryfikacja ubezpieczenia chorobowego",
    naglowek: "Weryfikacja ubezpieczenia chorobowego",
    // Treści ekranu ViewSampleCaseVerification (wzory P13-13 do P13-16)
    wrocDoDanychSprawy: ({ id }: { id: string }) => `Dane sprawy ${id}`,
    wrocDoDanych: "Dane sprawy",
    wstepWzorcowa: ({ id, sytuacja }: { id: string; sytuacja: string }) => `Sprawa wzorcowa ${id}: ${sytuacja}.`,
    wstepZestaw: ({ id, sytuacja }: { id: string; sytuacja: string }) => `Sprawa z zestawu ZUS ${id}: ${sytuacja}.`,
    wstepWgrane: ({ dokumenty }: { dokumenty: string }) => `Sprawa z wgranych dokumentów: ${dokumenty}.`,
    stanNa: ({ czas }: { czas: string }) => `Stan na ${czas}.`,
    spojnikI: " i ",
    nazwyDokumentow: {
      zam: "Wniosek ZAM",
      "z-3": "Zaświadczenie Z-3",
      "z-3a": "Zaświadczenie Z-3a",
      "z-3b": "Zaświadczenie Z-3b",
      "zas-12": "Zaświadczenie ZAS-12",
      poswiadczenie: "Poświadczenie ubezpieczenia chorobowego",
      "zrzut-zus": "Zrzut z systemu wewnętrznego ZUS",
      "e-zla": "Wydruk zaświadczenia lekarskiego e-ZLA",
      "zaswiadczenie-o-terminie-porodu": "Zaświadczenie lekarskie o przewidywanej dacie porodu",
      "zaswiadczenie-szpitala": "Zaświadczenie szpitala",
      "zaswiadczenie-o-martwym-urodzeniu": "Zaświadczenie o urodzeniu martwego dziecka",
      "zaswiadczenie-za-zyciem": "Zaświadczenie „Za życiem”",
    },
    dokumentZNumerem: ({ nazwa, numer }: { nazwa: string; numer: string }) => `${nazwa} nr ${numer}`,
    brakSprawy: "Nie masz otwartej przykładowej sprawy. Wybierz sprawę z listy albo wgraj dokument z zestawu ZUS.",
    przejdzDoListy: "Przejdź do listy spraw",
    brakWeryfikacji: "Zatwierdź dane sprawy, żeby zobaczyć wynik weryfikacji ubezpieczenia chorobowego.",
    podajRozstrzygniecie: "Podaj rozstrzygnięcie w danych sprawy",
    wynikTytul: "Wynik weryfikacji",
    wynikTytulWiele: ({ liczba }: { liczba: string }) => `Wynik weryfikacji (${liczba} świadczenia)`,
    dataZdarzenia: ({ rodzaj, data }: { rodzaj: string; data: string }) => `Data zdarzenia: ${rodzaj} ${data}.`,
    dataZdarzeniaTermin: ({ data }: { data: string }) =>
      `Data zdarzenia: przewidywany termin porodu ${data}, bo sprawa nie zawiera daty porodu.`,
    rodzajeZdarzenia: {
      porod: "poród",
      "przewidywany-termin": "przewidywany termin porodu",
      niezdolnosc: "pierwszy dzień niezdolności do pracy",
      "okres-ojca": "pierwszy dzień okresu zasiłku ojca",
    },
    okresCiazy: ({ od, do: koniec }: { od: string; do: string }) => `Okres ciąży: od ${od} do ${koniec}.`,
    ustanieUbezpieczenia: ({ data }: { data: string }) => `Ubezpieczenie chorobowe ustało ${data}.`,
    podpisWynikow: "Wynik weryfikacji dla każdego świadczenia z wniosku",
    przewijanieWynikow: "Tabela wyników weryfikacji, przewiń w poziomie",
    kolumnyWynikow: {
      swiadczenie: "Świadczenie",
      wynik: "Wynik weryfikacji",
      platnik: "Płatnik zasiłku",
      oczekiwane: "Oczekiwane rozstrzygnięcie",
      porownanie: "Porównanie",
    },
    swiadczenia: {
      "zasilek-macierzynski": "Zasiłek macierzyński",
      zwzm: "Zasiłek w wysokości zasiłku macierzyńskiego",
      "zasilek-chorobowy": "Zasiłek chorobowy",
    },
    przysluguje: "Przysługuje",
    nieprzysluguje: "Nie przysługuje",
    przyslugujeOd: ({ od }: { od: string }) => `Przysługuje od ${od}`,
    przyslugujeOdDo: ({ od, do: koniec }: { od: string; do: string }) => `Przysługuje od ${od} do ${koniec}`,
    nieprzyslugujeZPrzyczyna: ({ przyczyna }: { przyczyna: string }) => `Nie przysługuje – ${przyczyna}`,
    platnicy: { zus: "ZUS", "platnik-skladek": "Płatnik składek", nieustalony: "Płatnik nieustalony" },
    porownania: { zgodne: "Zgodne", rozne: "Różne", "bez-porownania": "Bez porównania" },
    brakRozstrzygniecia: "-",
    korektaUzytkownika: "Korekta użytkownika",
    swiadczenieRodzicielskie: ({ kwota }: { kwota: string }) =>
      `Rodzinie przysługuje świadczenie rodzicielskie ${kwota} miesięcznie`,
    swiadczenieRodzicielskieOpis:
      "Kwota ze słownika kwot i progów obowiązującego w dniu porodu. Świadczenie przysługuje, gdy zasiłek macierzyński nie przysługuje z powodu tytułu, rodzaju ubezpieczenia albo podlegania ubezpieczeniu w dniu porodu.",
    sprawdzWyliczenia: "Sprawdź wyliczenia",
    wrocDoDanychSprawyPrzycisk: "Wróć do danych sprawy",
    opisSprawdzenia: "Kalkulator przyjmie podstawę wymiaru, datę porodu i okres urlopu z tej sprawy.",
    opisSprawdzeniaZwzm: "Podstawą zasiłku macierzyńskiego będzie podstawa ustalona dla zasiłku w wysokości zasiłku macierzyńskiego.",
    opisBezSprawdzenia: "Wyliczenia sprawdzisz w kalkulatorze, gdy weryfikacja potwierdzi prawo do zasiłku macierzyńskiego.",
    okresDoWyliczenia: ({ od }: { od: string }) => `Okres zasiłku do wyliczenia: urlop macierzyński od ${od}`,
    okresDoWyliczeniaOpis: ({ odZWniosku, od }: { odZWniosku: string; od: string }) =>
      `We wniosku okres zaczyna się ${odZWniosku}. Część urlopu macierzyńskiego przed porodem zaczyna się najwcześniej 42 dni przed przewidywanym terminem porodu, dlatego kalkulator przyjmie ${od}.`,
    zaswiadczenieOTerminieJest: "Sprawa zawiera zaświadczenie lekarskie o przewidywanej dacie porodu, wymagane dla zasiłku przed porodem.",
    zaswiadczenieOTerminieBrak: "Zasiłek przed porodem wymaga zaświadczenia lekarskiego o przewidywanej dacie porodu, którego sprawa jeszcze nie zawiera.",
    warunkiTytul: ({ liczba }: { liczba: string }) => `Warunki prawa do zasiłku (${liczba})`,
    podpisWarunkow: "Warunki prawa do zasiłku z wynikiem i uzasadnieniem",
    przewijanieWarunkow: "Tabela warunków prawa do zasiłku, przewiń w poziomie",
    kolumnyWarunkow: { warunek: "Warunek", wynik: "Wynik", uzasadnienie: "Uzasadnienie" },
    warunekZNumerem: ({ numer, nazwa }: { numer: string; nazwa: string }) => `${numer}. ${nazwa}`,
    wynikiWarunku: {
      spelniony: "Spełniony",
      niespelniony: "Niespełniony",
      ostrzezenie: "Ostrzeżenie",
      "nie-dotyczy": "Nie dotyczy",
      "brak-danych": "Brak danych",
    },
    legenda: "Możliwe wyniki warunku",
    regulaZwzm: "Zasiłek macierzyński przysługuje, gdy spełniony jest warunek 5 albo warunek 6. Zasiłek w wysokości zasiłku macierzyńskiego wymaga spełnionego warunku 6.",
    notaReguly: "Reguły korzystają z wartości słownika wymiarów i okresów oraz słownika kwot i progów obowiązujących w dniu zdarzenia. Wynik i uzasadnienie zapisaliśmy w dokumentach przykładowej sprawy.",
    notaNiezaleznosc: "Weryfikacja korzysta wyłącznie z danych tej sprawy. Twój profil rodziny, plan rodziny i terminy pozostają bez zmian.",
    // Uzasadnienia warunków, płatnika i podstawy (domena/przykladowe-sprawy/weryfikacja.ts)
    reguly: {
      okresOd: ({ od }: { od: string }) => `od ${od}`,
      okresDo: ({ do: koniec }: { do: string }) => `do ${koniec}`,
      okresOdDo: ({ od, do: koniec }: { od: string; do: string }) => `od ${od} do ${koniec}`,
      nazwyWarunkow: [
        "Tytuł ubezpieczenia",
        "Rodzaj ubezpieczenia chorobowego",
        "Okresy podlegania",
        "Okres wyczekiwania",
        "Podleganie w dniu zdarzenia",
        "Ustanie ubezpieczenia w ciąży",
        "Zadłużenie osoby prowadzącej pozarolniczą działalność",
        "Tytuł rozpoczęty w ciąży",
      ],
      zdarzenia: {
        porod: "Poród",
        "przewidywany-termin": "Przewidywany termin porodu",
        niezdolnosc: "Pierwszy dzień niezdolności do pracy",
        "okres-ojca": "Pierwszy dzień okresu zasiłku ojca",
      },
      zdarzeniaDopelniacz: {
        porod: "porodu",
        "przewidywany-termin": "zdarzenia",
        niezdolnosc: "powstania niezdolności do pracy",
        "okres-ojca": "zdarzenia",
      },
      tytuly: {
        pracownik: "Pracownik",
        zleceniobiorca: "Zleceniobiorca",
        dzialalnosc: "Osoba prowadząca pozarolniczą działalność",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      tytulyDopelniacz: {
        pracownik: "tytuł pracownika",
        zleceniobiorca: "tytuł zleceniobiorcy",
        dzialalnosc: "tytuł osoby prowadzącej pozarolniczą działalność",
        "brak-tytulu": "brak tytułu do ubezpieczenia",
      },
      rodzajeUbezpieczenia: { obowiazkowe: "Obowiązkowe", dobrowolne: "Dobrowolne", brak: "Brak" },
      rodzajeUbezpieczeniaMale: { obowiazkowe: "obowiązkowym", dobrowolne: "dobrowolnym", brak: "brak" },
      przyczynyUstania: {
        upadlosc: "upadłości pracodawcy",
        likwidacja: "likwidacji pracodawcy",
        "smierc-pracodawcy": "śmierci pracodawcy",
        "naruszenie-z-wyrokiem": "rozwiązania umowy z naruszeniem przepisów stwierdzonym prawomocnym wyrokiem sądu",
        "naruszenie-bez-wyroku": "rozwiązania umowy z naruszeniem przepisów",
        "koniec-umowy-terminowej": "końca umowy terminowej",
        inna: "innej przyczyny",
      },
      w1: {
        niespelniony: "Sprawa wskazuje brak tytułu do ubezpieczenia. Zasiłki z ubezpieczenia chorobowego wymagają tytułu do ubezpieczenia.",
        trwa: {
          pracownik: "Tytuł pracownika daje ubezpieczenie chorobowe.",
          zleceniobiorca: "Tytuł zleceniobiorcy pozwala przystąpić do dobrowolnego ubezpieczenia chorobowego.",
          dzialalnosc: "Tytuł osoby prowadzącej pozarolniczą działalność pozwala przystąpić do dobrowolnego ubezpieczenia chorobowego.",
        },
        ustal: "Warunek obejmuje także tytuł, który ustał.",
      },
      w2: {
        brakTytulu: "Zasiłki z ubezpieczenia chorobowego wymagają tytułu do ubezpieczenia i ubezpieczenia chorobowego, a sprawa wskazuje brak tytułu.",
        spelniony: {
          pracownik: "Pracownik podlega ubezpieczeniu chorobowemu obowiązkowo.",
          zleceniobiorca: "Zleceniobiorca ma prawo do zasiłków przy dobrowolnym ubezpieczeniu chorobowym.",
          dzialalnosc: "Osoba prowadząca pozarolniczą działalność ma prawo do zasiłków przy dobrowolnym ubezpieczeniu chorobowym.",
        },
        niespelniony: ({ rodzaj, tytul, wymagany }: { rodzaj: string; tytul: string; wymagany: string }) =>
          rodzaj === "brak"
            ? `Rodzaj ubezpieczenia chorobowego: brak. ${tytul} ma prawo do zasiłków wyłącznie przy ubezpieczeniu chorobowym ${wymagany}.`
            : `Rodzaj ubezpieczenia chorobowego: ubezpieczenie ${rodzaj}. ${tytul} ma prawo do zasiłków przy ubezpieczeniu chorobowym ${wymagany}.`,
      },
      w3: {
        nieDotyczy: "Rodzaj ubezpieczenia chorobowego to brak, więc warunek okresów podlegania nie ma zastosowania.",
        niespelniony: ({ data }: { data: string }) =>
          `Okresy podlegania ubezpieczeniu chorobowemu w sprawie zaczynają się od dnia zdarzenia ${data} albo później.`,
        jeden: ({ okres, dni, od, doDnia }: { okres: string; dni: string; od: string; doDnia: string; przerwa: string }) =>
          `Okres ${okres} zaczął się przed datą zdarzenia: ${dni} dni ubezpieczenia od ${od} do ${doDnia}.`,
        polaczone: ({ liczba, dni, od, doDnia, przerwa }: { liczba: string; dni: string; od: string; doDnia: string; przerwa: string }) =>
          `Łączymy ${liczba} okresy z przerwą do ${przerwa} dni: ${dni} dni połączonych okresów od ${od} do ${doDnia}, bez dni przerwy.`,
        pominiety: ({ koniec, przerwa }: { koniec: string; przerwa: string }) =>
          `Wcześniejszy okres zakończony ${koniec} liczymy osobno, bo przerwa wynosi ${przerwa} dni.`,
      },
      w4: {
        nieDotyczy: "Zasiłek macierzyński przysługuje bez okresu wyczekiwania.",
        nieDotyczyZwzm: "Zasiłek macierzyński i zasiłek w wysokości zasiłku macierzyńskiego przysługują bez okresu wyczekiwania.",
        brakOkresow: "Okres wyczekiwania liczymy z okresów podlegania rozpoczętych przed niezdolnością do pracy, a sprawa ich nie zawiera.",
        obowiazkowego: "obowiązkowego",
        dobrowolnego: "dobrowolnego",
        spelniony: ({ n, rodzaj, uplyw, niezdolnoscOd, odSlownika }: { n: string; rodzaj: string; uplyw: string; prawoOd: string; niezdolnoscOd: string; odSlownika: string }) =>
          `Okres wyczekiwania ${n} dni ubezpieczenia ${rodzaj} upłynął ${uplyw}, przed pierwszym dniem niezdolności do pracy ${niezdolnoscOd}. Wartość ze słownika wymiarów i okresów obowiązuje od ${odSlownika}.`,
        niespelniony: ({ n, rodzaj, uplyw, prawoOd, niezdolnoscOd, odSlownika }: { n: string; rodzaj: string; uplyw: string; prawoOd: string; niezdolnoscOd: string; odSlownika: string }) =>
          `Okres wyczekiwania ${n} dni ubezpieczenia ${rodzaj} upływa ${uplyw}, a niezdolność do pracy zaczęła się ${niezdolnoscOd}. Zasiłek chorobowy przysługuje od ${prawoOd}. Wartość ze słownika wymiarów i okresów obowiązuje od ${odSlownika}.`,
      },
      w5: {
        brak: ({ data }: { data: string }) =>
          `Rodzaj ubezpieczenia chorobowego to brak, więc w dniu zdarzenia ${data} osoba nie podlega ubezpieczeniu chorobowemu.`,
        spelniony: ({ zdarzenie, okres }: { zdarzenie: string; okres: string }) => `${zdarzenie} przypada w okresie podlegania ${okres}.`,
        poKoncu: ({ zdarzenie, koniec }: { zdarzenie: string; koniec: string }) =>
          `${zdarzenie} przypada po końcu ostatniego okresu podlegania ${koniec}.`,
        przedPoczatkiem: ({ zdarzenie }: { zdarzenie: string }) => `${zdarzenie} przypada przed początkiem okresu podlegania.`,
      },
      w6: {
        nieDotyczy: ({ zdarzenia }: { zdarzenia: string }) => `Ubezpieczenie chorobowe trwa w dniu ${zdarzenia}.`,
        nieDotyczyBrak: "Rodzaj ubezpieczenia chorobowego to brak, więc sprawa nie zawiera ustania ubezpieczenia chorobowego.",
        ustaloWCiazy: ({ data, przyczyna }: { data: string; przyczyna: string }) =>
          `Zatrudnienie ustało ${data}, w okresie ciąży, z powodu ${przyczyna}, bez zapewnienia innego zatrudnienia.`,
        zwzmOkres: ({ od, do: koniec }: { od: string; do: string }) =>
          `Zasiłek w wysokości zasiłku macierzyńskiego przysługuje od ${od} do ${koniec} w wysokości 100% podstawy.`,
        zmOdPorodu: "Zasiłek macierzyński przysługuje od dnia porodu.",
        ustaloPrzed: ({ data, zdarzenia }: { data: string; zdarzenia: string }) => `Ubezpieczenie ustało ${data}, przed dniem ${zdarzenia}.`,
        zmTylkoPracownica:
          "Zasiłek macierzyński po ustaniu ubezpieczenia przysługuje wyłącznie pracownicy, której ubezpieczenie ustało w ciąży wskutek upadłości, likwidacji albo śmierci pracodawcy albo z naruszeniem przepisów stwierdzonym prawomocnym wyrokiem sądu.",
        zchWCzasie: ({ ustanie }: { dniPo: string; trwa: string; ustanie: string; limit: string; min: string }) =>
          `Niezdolność do pracy powstała w czasie ubezpieczenia i trwa po jego ustaniu ${ustanie}, więc zasiłek chorobowy przysługuje także po ustaniu ubezpieczenia.`,
        zchPo: ({ dniPo, trwa, limit, min }: { dniPo: string; trwa: string; ustanie: string; limit: string; min: string }) =>
          `Niezdolność do pracy powstała ${dniPo} dni po ustaniu ubezpieczenia i trwała ${trwa} dni. Zasiłek chorobowy po ustaniu ubezpieczenia przysługuje, gdy niezdolność powstała najpóźniej ${limit} dni od ustania i trwała bez przerwy co najmniej ${min} dni.`,
        zchNiespelniony: ({ dniPo, trwa, limit, min }: { dniPo: string; trwa: string; ustanie: string; limit: string; min: string }) =>
          `Niezdolność do pracy powstała ${dniPo} dni po ustaniu ubezpieczenia i trwała ${trwa} dni. Zasiłek chorobowy po ustaniu ubezpieczenia wymaga niezdolności powstałej najpóźniej ${limit} dni od ustania i trwającej co najmniej ${min} dni, odpowiedzi nie w polu pracy zarobkowej, emerytury, renty albo zasiłku dla bezrobotnych i upływu okresu wyczekiwania.`,
      },
      w7: {
        nieDotyczy: ({ tytul }: { tytul: string }) =>
          `Warunek dotyczy osoby prowadzącej pozarolniczą działalność, a w sprawie jest ${tytul}.`,
        brakDanych: "Dokumenty sprawy pomijają kwotę zadłużenia z tytułu składek. Prawo do zasiłku zależy od stanu rozliczeń składek na dzień zdarzenia.",
        spelniony: ({ kwota, data, prog, odSlownika }: { kwota: string; data: string; prog: string; odSlownika: string; terminSplaty: string }) =>
          `Zadłużenie z tytułu składek ${kwota} na ${data} jest równe progowi zadłużenia ${prog} albo od niego niższe. Próg ze słownika kwot i progów obowiązuje od ${odSlownika}.`,
        niespelniony: ({ kwota, data, prog, odSlownika, terminSplaty }: { kwota: string; data: string; prog: string; odSlownika: string; terminSplaty: string }) =>
          `Zadłużenie z tytułu składek ${kwota} na ${data} przekracza próg zadłużenia ${prog} ze słownika kwot i progów, obowiązujący od ${odSlownika}. Zasiłek chorobowy i zasiłek macierzyński przysługują po spłacie całości zadłużenia. Spłata całości do ${terminSplaty} daje zasiłek za cały okres, a po spłacie późniejszej zasiłek przysługuje od dnia spłaty.`,
      },
      w8: {
        nieDotyczy: "Warunek dotyczy matki, a wniosek składa ojciec, który przejmuje część urlopu macierzyńskiego.",
        brakDanych: "Okres ciąży ustalamy z daty porodu albo przewidywanego terminu porodu, a sprawa zawiera wyłącznie inne daty zdarzenia.",
        ostrzezenie: ({ od, ciazaOd }: { od: string; ciazaOd: string }) =>
          `Tytuł od ${od} zaczął się w okresie ciąży trwającym od ${ciazaOd}. ZUS może sprawdzić, czy zgłoszenie do ubezpieczenia służyło wyłącznie uzyskaniu zasiłku, i uznać umowę albo działalność za pozorną.`,
        spelniony: ({ od, ciazaOd }: { od: string; ciazaOd: string }) =>
          `Tytuł od ${od} zaczął się przed okresem ciąży trwającym od ${ciazaOd}.`,
      },
      platnik: {
        jdg: "Płatnik zasiłku: ZUS, bo zasiłek osoby prowadzącej pozarolniczą działalność wypłaca ZUS.",
        poUstaniu: "Płatnik zasiłku: ZUS, bo zasiłek za okres po ustaniu ubezpieczenia wypłaca ZUS.",
        brakTytulu: "Płatnik zasiłku pozostaje nieustalony, bo sprawa wskazuje brak tytułu do ubezpieczenia.",
        powyzej: ({ liczba, odSlownika }: { liczba: string; odSlownika: string }) =>
          `Płatnik zasiłku: płatnik składek, bo zgłasza do ubezpieczenia chorobowego więcej niż ${liczba} ubezpieczonych (słownik wymiarów i okresów, obowiązuje od ${odSlownika}).`,
        doLiczby: ({ liczba, odSlownika }: { liczba: string; odSlownika: string }) =>
          `Płatnik zasiłku: ZUS, bo płatnik składek zgłasza do ubezpieczenia chorobowego do ${liczba} ubezpieczonych. Zasiłek wypłaca płatnik, który zgłasza więcej niż ${liczba} osób (słownik wymiarów i okresów, obowiązuje od ${odSlownika}).`,
        nieustalony: "Płatnik zasiłku pozostaje nieustalony, bo dane sprawy pomijają liczbę ubezpieczonych zgłoszonych przez płatnika składek.",
      },
      przyczyny: {
        wyczekiwanie: ({ od, do: koniec, prawoOd }: { od: string; do: string; prawoOd: string }) =>
          `za okres od ${od} do ${koniec}, przysługuje od ${prawoOd}`,
        zadluzenie: "do czasu spłaty całości zadłużenia",
        warunek: ({ numer, nazwa }: { numer: string; nazwa: string }) => `warunek ${numer}. ${nazwa}`,
      },
    },
    podstawa: {
      poprzedniZasilek: "Podstawa wymiaru poprzedniego zasiłku, bo zasiłek następuje bezpośrednio po nim albo po przerwie krótszej niż miesiąc kalendarzowy.",
      jdgPrzedPelnymMiesiacem: ({ najnizsza }: { najnizsza: string }) =>
        `Najniższa podstawa wymiaru składek ${najnizsza} pomniejszona o 13,71%, bo zdarzenie następuje przed upływem pełnego miesiąca ubezpieczenia.`,
      jdgKrotko: ({ najnizsza, bazowa, dodatek }: { najnizsza: string; bazowa: string; dodatek: string }) =>
        `Najniższa podstawa wymiaru składek ${najnizsza} pomniejszona o 13,71%, czyli ${bazowa}, powiększona o 1/12 nadwyżek podstaw wymiaru składek pomniejszonych o 13,71%, czyli ${dodatek}.`,
      miesiacZdarzenia: "Przychód z umowy za miesiąc zdarzenia pomniejszony o 13,71%.",
      zPoswiadczenia: "Przeciętna podstawa wymiaru składek z poświadczenia ubezpieczenia chorobowego pomniejszona o 13,71%.",
      zZ3a: "Przeciętny przychód z zaświadczenia Z-3a pomniejszony o 13,71%.",
      zZ3: "Przeciętne wynagrodzenie z zaświadczenia Z-3 pomniejszone o 13,71%.",
      minimalna: ({ wyliczona, minimalna }: { wyliczona: string; minimalna: string }) =>
        `Minimalna podstawa wymiaru zasiłku pracownika na pełnym etacie ${minimalna}, bo przeciętne wynagrodzenie pomniejszone o 13,71% wynosi ${wyliczona}.`,
    },
    wyliczenie: {
      macierzynski: ({ tygodnie, dni }: { tygodnie: string; dni: string }) =>
        `Okres liczymy od dnia początku z wniosku. Urlop macierzyński wynosi ${tygodnie} tygodni, czyli ${dni} dni.`,
      martweUrodzenie: ({ dni }: { dni: string }) => `Po urodzeniu martwego dziecka okres zasiłku za urlop macierzyński wynosi ${dni} dni od dnia porodu.`,
      ojciec: ({ dni }: { dni: string }) =>
        `Okres zasiłku ojca to wymiar urlopu macierzyńskiego pomniejszony o okres wykorzystany przez matkę, czyli ${dni} dni.`,
      uzupelniajacy: ({ dni, tygodnie }: { dni: string; tygodnie: string }) =>
        `Pobyt dziecka w szpitalu w okresie liczenia trwa ${dni} dni, więc uzupełniający urlop macierzyński wynosi ${tygodnie} tygodni.`,
      rodzicielski: ({ tygodnie }: { tygodnie: string }) => `Okres zasiłku za urlop rodzicielski matki wynosi ${tygodnie} tygodni.`,
      wariant815: ({ dni }: { dni: string }) =>
        `Wniosek z oświadczeniem o pełnym wymiarze urlopów złożony najpóźniej ${dni} dni po porodzie daje stawkę 81,5% za cały okres.`,
    },
    // koniec ViewSampleCaseVerification
  },
  ViewZamLeaveType: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): rodzaj urlopu",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    // koniec ViewZamLeaveType
  },
  ViewZamPrebirth: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): początek zasiłku",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM) przed porodem",
    // koniec ViewZamPrebirth
  },
  ViewZamPeriod: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): okres zasiłku",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    // koniec ViewZamPeriod
  },
  ViewFatherTakeover: {
    tytulStrony: "Przejęcie urlopu macierzyńskiego",
    naglowek: "Przejęcie urlopu macierzyńskiego",
    tytulyTrybow: {
      wniosek: "Przejęcie urlopu macierzyńskiego",
      zam: "Wniosek o zasiłek macierzyński (ZAM): przejęcie urlopu",
    },
    // koniec ViewFatherTakeover
  },
  ViewZamData: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): dane",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    // koniec ViewZamData
  },
  ViewZamStatements: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): oświadczenia",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    // koniec ViewZamStatements
  },
  ViewZamSummary: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): podsumowanie",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    // koniec ViewZamSummary
  },
  ViewZamSent: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM) wysłany",
    naglowek: "Wniosek wysłany",
    // koniec ViewZamSent
  },
  ViewZamForPayer: {
    tytulStrony: "Wniosek dla płatnika składek",
    naglowek: "Wniosek dla płatnika składek",
    // koniec ViewZamForPayer
  },
  ViewZas53Start: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53)",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    // koniec ViewZas53Start
  },
  ViewZas53Certificate: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): zaświadczenie lekarskie",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    // koniec ViewZas53Certificate
  },
  ViewZas53AfterInsurance: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): oświadczenie Z-10",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    // koniec ViewZas53AfterInsurance
  },
  ViewZas53Data: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): dane",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    // koniec ViewZas53Data
  },
  ViewZas53Summary: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): podsumowanie",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    // koniec ViewZas53Summary
  },
  ViewZas53Sent: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53) wysłany",
    naglowek: "Wniosek wysłany",
    // koniec ViewZas53Sent
  },
  ViewLeaveRequestType: {
    tytulStrony: "Wniosek o urlop do pracodawcy: rodzaj wniosku",
    naglowek: "Wniosek o urlop do pracodawcy",
    // koniec ViewLeaveRequestType
  },
  ViewLeaveRequestForm: {
    tytulStrony: "Wniosek o urlop do pracodawcy: formularz",
    naglowek: "Wniosek o urlop do pracodawcy",
    // koniec ViewLeaveRequestForm
  },
  ViewLeaveRequestSummary: {
    tytulStrony: "Wniosek o urlop do pracodawcy: podsumowanie i wysłanie",
    naglowek: "Wniosek o urlop do pracodawcy",
    // koniec ViewLeaveRequestSummary
  },
  ViewLeaveRequestSent: {
    tytulStrony: "Wniosek o urlop do pracodawcy wysłany",
    naglowek: "Wniosek wysłany",
    // koniec ViewLeaveRequestSent
  },
  ViewMaternityResignation: {
    tytulStrony: "Rezygnacja z dalszej części urlopu macierzyńskiego",
    naglowek: "Rezygnacja z dalszej części urlopu macierzyńskiego",
    // koniec ViewMaternityResignation
  },
  ViewBirthCertificateRequest: {
    tytulStrony: "Wniosek o odpis aktu urodzenia",
    naglowek: "Wniosek o odpis aktu urodzenia",
    // koniec ViewBirthCertificateRequest
  },
  ViewBirthCertificateRequestSent: {
    tytulStrony: "Wniosek o odpis aktu urodzenia złożony",
    naglowek: "Wniosek o odpis złożony",
    // koniec ViewBirthCertificateRequestSent
  },
  ViewInviteAccept: {
    tytulStrony: "Zaproszenie do planu rodziny",
    naglowek: "Zaproszenie do planu rodziny",
    // koniec ViewInviteAccept
  },
  ViewCatalogList: {
    tytulStrony: "Katalog świadczeń",
    naglowek: "Katalog świadczeń",
    // Sloty panel/katalog/_sloty (u16, u16)
    zakladkaRegul: {
      naglowek: "Reguły świadczeń z ubezpieczenia chorobowego",
      opis: "Reguły ustalają prawo matki do zasiłku chorobowego, świadczenia rehabilitacyjnego, zasiłku w wysokości zasiłku macierzyńskiego i zasiłku macierzyńskiego. Wartości liczbowe reguły odczytują ze słowników w wersji obowiązującej we wskazanym dniu.",
      liczba: ({ liczba }: { liczba: string }) => `Reguły (${liczba})`,
      wpisy: "Wartości w słownikach",
      bezWartosci: "Bez wartości liczbowej.",
      obowiazujeOd: ({ data }: { data: string }) => `obowiązuje od ${data}`,
      wpisPoza: "wpis do uzupełnienia w słowniku",
      // koniec zakladkaRegul
    },
    zakladkaDokumentow: {
      naglowek: "Słownik dokumentów i adresatów wniosków",
      opis: "Dokumenty, załączniki, adresat i termin wniosku dla każdego świadczenia i wniosku pracownika do pracodawcy, zależnie od formy zatrudnienia i płatnika zasiłku. Płatnik uprawniony to płatnik składek, który zgłasza do ubezpieczenia chorobowego więcej niż 20 osób według stanu na 30 listopada poprzedniego roku.",
      liczba: ({ liczba }: { liczba: string }) => `Wpisy słownika (${liczba})`,
      grupy: {
        "zasilek-chorobowy": "Zasiłek chorobowy",
        "swiadczenie-rehabilitacyjne": "Świadczenie rehabilitacyjne",
        zwzm: "Zasiłek w wysokości zasiłku macierzyńskiego",
        "zasilek-macierzynski": "Zasiłek macierzyński",
        zalaczniki: "Załączniki do wniosku o zasiłek macierzyński",
        "wnioski-pracownika": "Wnioski pracownika do pracodawcy",
      },
      grupaZLiczba: ({ nazwa, liczba }: { nazwa: string; liczba: string }) => `${nazwa} (${liczba})`,
      kolumny: { klucz: "Forma zatrudnienia i płatnik", dokumenty: "Dokumenty i załączniki", adresat: "Adresat", termin: "Termin" },
      przewijanie: ({ nazwa }: { nazwa: string }) => `Tabela wpisów: ${nazwa}`,
      kazdaForma: "Każda forma zatrudnienia",
      formy: {
        "umowa-o-prace": "Umowa o pracę",
        "umowa-zlecenia": "Umowa zlecenia",
        jdg: "Jednoosobowa działalność gospodarcza",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      platnicy: { "platnik-uprawniony": "płatnik uprawniony", zus: "ZUS" },
      poUstaniu: "po ustaniu ubezpieczenia",
      rowniezPoUstaniu: "także niezdolność do pracy powstała po ustaniu ubezpieczenia",
      // koniec zakladkaDokumentow
    },
    dodajPozycje: "Dodaj pozycję",
    zakladkiEtykieta: "Części katalogu",
    zakladki: {
      kwoty: ({ liczba }: { liczba: string }) => `Kwoty, progi i stawki (${liczba})`,
      wymiary: ({ liczba }: { liczba: string }) => `Wymiary i okresy (${liczba})`,
      pozycje: ({ liczba }: { liczba: string }) => `Pozycje katalogu (${liczba})`,
      reguly: "Reguły świadczeń",
      dokumenty: "Dokumenty i adresaci wniosków",
    },
    kwoty: {
      naglowek: "Słownik kwot i progów",
      opis: "Kwoty, progi dochodowe i stawki zasiłków. Plan rodziny, terminy, kreatory wniosków i kalkulatory stosują wartość obowiązującą w dniu, którego dotyczy termin albo świadczenie.",
      kolumnaNazwy: "Wartość",
      kolumnaWartosci: "Obowiązująca kwota, próg albo stawka",
      przewijanie: "Słownik kwot i progów, tabela przewijana poziomo",
      notatka: "Wartość zmieniasz, dopisując nową z datą początku obowiązywania. Poprzednia wartość przestaje obowiązywać dzień wcześniej i zostaje w historii.",
    },
    wymiary: {
      naglowek: "Słownik wymiarów i okresów",
      opis: "Wymiary urlopów, okresy świadczeń i inne liczby dni, tygodni albo miesięcy. Przewodnik stosuje wartość obowiązującą w dniu porodu, przyjęcia dziecka albo powstania prawa do świadczenia.",
      kolumnaNazwy: "Wymiar albo okres",
      kolumnaWartosci: "Obowiązująca wartość",
      przewijanie: "Słownik wymiarów i okresów, tabela przewijana poziomo",
      notatka: "Wymiar zmieniasz, dopisując nowy z datą początku obowiązywania. Poprzedni wymiar przestaje obowiązywać dzień wcześniej i zostaje w historii.",
    },
    liczbaWartosci: "Wartości:",
    kolumnaOkresu: "Okres obowiązywania",
    kolumnaAkcji: "Akcje",
    zmien: "Zmień",
    zmienWartosc: ({ nazwa }: { nazwa: string }) => `Zmień wartość: ${nazwa}`,
    okresOd: ({ data }: { data: string }) => `od ${data}`,
    okresDo: ({ data }: { data: string }) => `do ${data}`,
    zaplanowanaOd: ({ data }: { data: string }) => `Od ${data}:`,
    brakObowiazujacej: "Brak obowiązującej wartości",
    pozycje: {
      naglowek: "Pozycje katalogu",
      opis: "Sprawy, które przewodnik pokazuje rodzicom w planie rodziny i kalendarzu terminów. Nowa pozycja dostaje kolejny wolny identyfikator.",
      szukaj: "Wyszukaj sprawę",
      etap: "Etap ścieżki",
      wszystkieEtapy: "Wszystkie etapy",
      liczba: "Pozycje:",
      kolumnaId: "ID",
      kolumnaSprawy: "Sprawa",
      kolumnaRodzaju: "Rodzaj",
      kolumnaEtapu: "Etap ścieżki",
      kolumnaRodzica: "Rodzic",
      przewijanie: "Pozycje katalogu, tabela przewijana poziomo",
      brakWynikow: "Żadna pozycja nie pasuje do wyszukiwania. Zmień tekst albo etap ścieżki.",
      notatka: "Plany rodzin uwzględniają nową pozycję przy najbliższym wyliczeniu.",
    },
    zobaczZmiane: {
      kwota: "Zobacz zmienioną kwotę",
      stawka: "Zobacz zmienioną stawkę",
      wymiar: "Zobacz zmieniony wymiar",
      mieszany: "Zobacz zmienioną wartość",
      pozycja: ({ id }: { id: string }) => `Zobacz pozycję ${id}`,
    },
    // Etykiety słowników katalogu wspólne dla ViewCatalogList, ViewCatalogValueEdit i ViewCatalogItemAdd
    etykiety: {
      rodzaje: {
        swiadczenie: "Świadczenie",
        uprawnienie: "Uprawnienie",
        obowiazek: "Obowiązek",
        informacja: "Informacja",
      },
      etapy: {
        ciaza: "Ciąża",
        "pierwsze-tygodnie": "Pierwsze tygodnie po porodzie",
        "urlopy-i-zasilek": "Urlopy i zasiłek macierzyński",
        "pieniadze-na-dziecko": "Pieniądze na dziecko",
        "powrot-do-pracy": "Powrót do pracy",
      },
      rodzice: {
        matka: "Matka",
        "drugi-rodzic": "Drugi rodzic",
        "oboje-rodzice": "Oboje rodzice",
        "matka-albo-ojciec": "Matka albo ojciec",
        "kazdy-rodzic-na-umowie-o-prace": "Każdy rodzic na umowie o pracę",
        "rodzic-przyjmujacy": "Rodzic, który przyjął dziecko",
        "matka-a-bez-tytulu-drugi-rodzic": "Matka, a gdy matka nie ma tytułu do ubezpieczenia, drugi rodzic",
      },
      formyZatrudnienia: {
        "umowa-o-prace": "Umowa o pracę",
        "umowa-zlecenia": "Umowa zlecenia",
        jdg: "Jednoosobowa działalność gospodarcza",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      // Odmiana jednostek wariantów: 1, 2 do 4, 5 i więcej
      jednostki: {
        tygodnie: ["tydzień", "tygodnie", "tygodni"],
        dni: ["dzień", "dni", "dni"],
        miesiace: ["miesiąc", "miesiące", "miesięcy"],
        lata: ["rok", "lata", "lat"],
        osoby: ["osoba", "osoby", "osób"],
        czesci: ["część", "części", "części"],
        g: ["g", "g", "g"],
      },
      // Jednostki obok pól formularza
      jednostkiPol: {
        zl: "zł",
        procent: "%",
        "procent-etatu": "% etatu",
        tygodnie: "tyg.",
        dni: "dni",
        miesiace: "mies.",
        lata: "lat",
        osoby: "osób",
        czesci: "części",
        g: "g",
      },
      procentEtatu: ({ wartosc }: { wartosc: string }) => `${wartosc} etatu`,
    },
    // koniec ViewCatalogList
  },
  ViewCatalogValueEdit: {
    tytulStrony: "Zmiana wartości w katalogu świadczeń",
    naglowek: "Zmiana wartości w katalogu świadczeń",
    powrot: "Katalog świadczeń",
    slowniki: {
      "kwoty-i-progi": "Słownik kwot i progów",
      "wymiary-i-okresy": "Słownik wymiarów i okresów",
    },
    historia: {
      kwota: "Historia wartości",
      stawka: "Historia stawki",
      wymiar: "Historia wymiaru",
      mieszany: "Historia wartości",
    },
    kolumnaWartosci: {
      kwota: "Kwota",
      stawka: "Stawka",
      wymiar: "Wymiar",
      mieszany: "Wartość",
    },
    kolumnaOd: "Obowiązuje od",
    kolumnaDo: "Obowiązuje do",
    kolumnaStanu: "Stan",
    bezDatyKonca: "-",
    stany: {
      obowiazuje: "Obowiązuje",
      zaplanowana: "Zaplanowana",
      zakonczona: "Nie obowiązuje",
    },
    przewijanieHistorii: "Historia wartości, tabela przewijana poziomo",
    notatkaHistorii: {
      kwota: "Plan rodziny, terminy, kreatory wniosków i kalkulatory stosują kwotę obowiązującą w dniu, którego dotyczy termin albo świadczenie.",
      stawka: "Plan rodziny, kreatory wniosków i kalkulatory stosują stawkę obowiązującą w dniu, którego dotyczy świadczenie.",
      wymiar: "Plan rodziny, terminy, kreatory wniosków i kalkulatory stosują wymiar obowiązujący w dniu porodu albo przyjęcia dziecka na wychowanie.",
      mieszany: "Plan rodziny, terminy, kreatory wniosków i kalkulatory stosują wartość obowiązującą w dniu, którego dotyczy termin albo świadczenie.",
    },
    dopisz: {
      kwota: "Dopisz nową kwotę",
      stawka: "Dopisz nową stawkę",
      wymiar: "Dopisz nowy wymiar",
      mieszany: "Dopisz nową wartość",
    },
    opisPustego: {
      kwota: "Nowa kwota zacznie obowiązywać od podanej daty, a obowiązująca kwota przestanie obowiązywać dzień wcześniej. W historii zostaną wszystkie poprzednie wartości.",
      stawka: "Nowa stawka zacznie obowiązywać od podanej daty, a obowiązująca stawka przestanie obowiązywać dzień wcześniej. W historii zostaną wszystkie poprzednie wartości.",
      wymiar: "Nowy wymiar zacznie obowiązywać od podanej daty, a obowiązujący wymiar przestanie obowiązywać dzień wcześniej. W historii zostaną wszystkie poprzednie wartości.",
      mieszany: "Nowa wartość zacznie obowiązywać od podanej daty, a obowiązująca wartość przestanie obowiązywać dzień wcześniej. W historii zostaną wszystkie poprzednie wartości.",
    },
    opisWypelnionego: {
      kwota: "Wpisaliśmy obowiązujące kwoty. Zmień kwotę, która się zmienia, i podaj datę początku. Obowiązująca kwota przestanie obowiązywać dzień wcześniej, a w historii zostaną wszystkie poprzednie wartości.",
      stawka: "Wpisaliśmy obowiązujące stawki. Zmień stawkę, która się zmienia, i podaj datę początku. Obowiązująca stawka przestanie obowiązywać dzień wcześniej, a w historii zostaną wszystkie poprzednie wartości.",
      wymiar: "Wpisaliśmy obowiązujący wymiar każdego wariantu. Zmień warianty, które się zmieniają, i podaj datę początku. Obowiązujący wymiar przestanie obowiązywać dzień wcześniej, a w historii zostaną wszystkie poprzednie wartości.",
      mieszany: "Wpisaliśmy obowiązujące wartości. Zmień wartości, które się zmieniają, i podaj datę początku. Obowiązująca wartość przestanie obowiązywać dzień wcześniej, a w historii zostaną wszystkie poprzednie wartości.",
    },
    poleJedyne: {
      kwota: "Nowa kwota w złotych",
      stawka: "Nowa stawka w procentach",
      wymiar: "Nowy wymiar",
      mieszany: "Nowa wartość",
    },
    legenda: {
      kwota: "Kwota w złotych",
      stawka: "Stawka w procentach podstawy wymiaru",
      wymiar: "Wymiar",
      mieszany: "Wartości",
    },
    legendaWymiaru: {
      tygodnie: "Wymiar w tygodniach",
      dni: "Wymiar w dniach",
      miesiace: "Wymiar w miesiącach",
      lata: "Wymiar w latach",
    },
    podpowiedz: {
      kwota: "Na przykład 850 albo 1922,50, najwyżej dwa miejsca po przecinku.",
      stawka: "Liczba większa od zera i najwyżej 100, z najwyżej dwoma miejscami po przecinku, na przykład 81,5.",
      wymiar: ({ maks }: { maks: string }) => `Każdy wariant to liczba całkowita większa od zera, do ${maks}.`,
      wymiarJedyny: ({ maks }: { maks: string }) => `Liczba całkowita większa od zera, do ${maks}.`,
      mieszany: "Kwotę podaj w złotych z najwyżej dwoma miejscami po przecinku, stawkę w procentach do 100, a wymiar liczbą całkowitą większą od zera.",
    },
    obowiazuje: ({ wartosc }: { wartosc: string }) => `Obowiązuje: ${wartosc}`,
    dataPoczatku: "Data początku obowiązywania",
    podpowiedzDaty: ({ data }: { data: string }) => `W formacie DD.MM.RRRR, późniejsza niż ${data}.`,
    podpowiedzDatyBezWersji: "W formacie DD.MM.RRRR.",
    zapisz: {
      kwota: "Zapisz kwotę",
      stawka: "Zapisz stawkę",
      wymiar: "Zapisz wymiar",
      mieszany: "Zapisz wartość",
    },
    anuluj: "Anuluj",
    wartoscWyprowadzona: "Ta wartość wynika z innych wpisów słownika i zmienia się razem z nimi. Zmień wpis, z którego wynika.",
    nieZnaleziono: "W katalogu nie ma takiego wpisu. Wróć do katalogu i wybierz wpis z listy.",
    // koniec ViewCatalogValueEdit
  },
  ViewCatalogItemAdd: {
    tytulStrony: "Dodaj pozycję katalogu",
    naglowek: "Dodaj pozycję katalogu",
    wstep: ({ id }: { id: string }) =>
      `Pozycja dostanie kolejny wolny identyfikator: ${id}. Plany rodzin uwzględnią ją przy najbliższym wyliczeniu.`,
    powrot: "Katalog świadczeń",
    sprawa: {
      naglowek: "Sprawa",
      tytul: "Tytuł sprawy",
      podpowiedzTytulu: "Tytuł zrozumiały bez znajomości nazwy świadczenia, do 120 znaków. Nie może powtarzać tytułu innej pozycji.",
      rodzaj: "Rodzaj",
      wybierzRodzaj: "Wybierz rodzaj",
      etap: "Etap ścieżki",
      podpowiedzEtapu: "Etap Ciąża oznacza warunek „dziecko się nie urodziło”, a pozostałe etapy warunek „dziecko się urodziło”.",
      wybierzEtap: "Wybierz etap",
      rodzic: "Rodzic, którego dotyczy sprawa",
      wybierzRodzica: "Wybierz rodzica",
    },
    warunek: {
      naglowek: "Warunek",
      formy: "Formy zatrudnienia",
      podpowiedzForm: "Zaznacz co najmniej jedną formę, której dotyczy sprawa.",
      ubezpieczenie: "Ubezpieczenie chorobowe",
      podpowiedzUbezpieczenia: "Czy sprawa wymaga ubezpieczenia chorobowego rodzica.",
      ubezpieczenia: {
        "bez-znaczenia": "Bez znaczenia",
        wymagane: "Wymagane",
        brak: "Brak",
      },
    },
    kanal: {
      naglowek: "Instytucja, kanał i termin",
      instytucja: "Instytucja i kanał",
      podpowiedzInstytucji: "Gdzie i jak rodzic załatwia sprawę, do 500 znaków.",
      kotwica: "Data kotwicząca",
      podpowiedzKotwicy: "Data, od której liczymy termin sprawy.",
      kotwice: {
        brak: "Brak terminu",
        "koniec-10-tygodnia": "Ostatni dzień 10. tygodnia ciąży",
        "przewidywany-termin-porodu": "Przewidywany termin porodu",
        "data-porodu": "Data porodu",
        "data-przyjecia": "Data przyjęcia dziecka na wychowanie",
      },
      notatkaKotwicy: "Przesunięcie terminu podasz po wybraniu daty kotwiczącej.",
      przesuniecie: "Przesunięcie terminu",
      podpowiedzPrzesuniecia: "Liczba całkowita od -366 do 366 dni albo od -36 do 36 miesięcy. Liczba ujemna oznacza termin przed datą kotwiczącą.",
      jednostkaPrzesuniecia: "Jednostka przesunięcia terminu",
      jednostki: {
        dni: "dni",
        miesiace: "miesiące",
      },
      koszt: "Koszt spóźnienia (opcjonalnie)",
      podpowiedzKosztu: "Kwota albo skutek spóźnienia, do 500 znaków.",
    },
    zapisz: "Zapisz pozycję",
    anuluj: "Anuluj",
    // Opis warunku zapisany w pozycji katalogu dodanej w panelu
    opisWarunku: {
      formy: ({ lista }: { lista: string }) => `Rodzic ma formę zatrudnienia: ${lista}.`,
      ubezpieczenie: {
        "bez-znaczenia": "Ubezpieczenie chorobowe jest bez znaczenia.",
        wymagane: "Rodzic podlega ubezpieczeniu chorobowemu.",
        brak: "Rodzic nie podlega ubezpieczeniu chorobowemu.",
      },
      dzieckoNieUrodzilo: "Dziecko się nie urodziło.",
      dzieckoUrodzilo: "Dziecko się urodziło.",
    },
    // koniec ViewCatalogItemAdd
  },
  ViewCatalogSupportOrganizations: {
    tytulStrony: "Podmioty wsparcia",
    naglowek: "Podmioty wsparcia",
    tytulyTrybow: {
      lista: "Podmioty wsparcia",
      nowa: "Dodaj organizację",
      edycja: "Zmień dane organizacji",
    },
    // koniec ViewCatalogSupportOrganizations
  },
  ViewEzusHome: {
    tytulStrony: "eZUS",
    naglowek: "eZUS",
    // koniec ViewEzusHome
  },
  ViewEzus800Application: {
    tytulStrony: "Wniosek o świadczenie wychowawcze 800+",
    naglowek: "Wniosek o świadczenie wychowawcze 800+",
    // koniec ViewEzus800Application
  },
  ViewEzusActiveParentApplication: {
    tytulStrony: "Wniosek o świadczenie z programu Aktywny Rodzic",
    naglowek: "Wniosek o świadczenie z programu Aktywny Rodzic",
    // koniec ViewEzusActiveParentApplication
  },
  ViewEzusApplicationDetails: {
    tytulStrony: "Szczegóły wniosku w eZUS",
    naglowek: "Szczegóły wniosku",
    // koniec ViewEzusApplicationDetails
  },
  ViewZusEVisit: {
    tytulStrony: "e-wizyta w ZUS",
    naglowek: "e-wizyta w ZUS",
    // koniec ViewZusEVisit
  },
  ViewSimulatedChannel: {
    tytulStrony: "Serwis zewnętrzny",
    naglowek: "Serwis zewnętrzny",
    // koniec ViewSimulatedChannel
  },
  ViewAssistantChat: {
    tytulStrony: "Asystent",
    naglowek: "Asystent",
    podtytulRodzina: "Odpowiada na podstawie planu Twojej rodziny",
    podtytulNowyUzytkownik: "Odpowiada na podstawie danych z konta ZUS i katalogu świadczeń",
    historia: "Historia rozmowy",
    ty: "Ty",
    asystent: "Asystent",
    pustaRozmowa: "Tu zobaczysz rozmowę z asystentem. Zapytaj własnymi słowami o świadczenia, terminy i wnioski Twojej rodziny.",
    przykladowePytania: "Przykładowe pytania",
    pytaniaRodzina: [
      "Do kiedy złożyć wniosek o 800+?",
      "Co mam zrobić w tym tygodniu?",
      "Czy dostanę becikowe?",
      "Zgłosiłam już urodzenie w mObywatelu",
      "Chcę złożyć wniosek o zasiłek macierzyński",
    ],
    pytaniaNowyUzytkownik: [
      "Czy dostanę zasiłek macierzyński?",
      "Co mam zrobić w tym tygodniu?",
      "Ile wyniesie mój zasiłek?",
    ],
    notatkaRodzina: "Asystent zmieni dane w planie dopiero wtedy, gdy potwierdzisz jego propozycję. Rozmowę i Twoje decyzje zapisujemy, a usuniemy je razem z danymi rodziny.",
    notatkaNowyUzytkownik: "Rozmowę zapisujemy razem z danymi Twojego konta w przewodniku.",
    notatkaGranice: "Asystent odpowiada tylko na pytania o świadczenia z katalogu, które dotyczą Twojej rodziny. Pytania medyczne, podatkowe, o sprawy innych osób i o ocenę spraw rozpatrywanych przez ZUS kieruje do konsultanta.",
    formularz: "Nowa wiadomość do asystenta",
    poleWiadomosci: "Twoja wiadomość",
    podpowiedz: "Na przykład: Do kiedy złożyć wniosek o 800+?",
    licznik: ({ liczba }: { liczba: string }) => `${liczba} z 1000 znaków`,
    wyslij: "Wyślij",
    wysylanie: "Asystent przygotowuje odpowiedź.",
    wyslano: "Wysłano",
    sprobujPonownie: "Spróbuj ponownie",
    przejdzDoPlanu: "Przejdź do planu rodziny",
    przejdzDoProfiluNaStart: "Przejdź do profilu na start",
    uzupelnijProfil: "Uzupełnij profil na start",
    sprawaZTwojegoPlanu: "Sprawa z Twojego planu",
    sprawaZWaszegoPlanu: "Sprawa z Waszego planu",
    termin: ({ data }: { data: string }) => `Termin: ${data}`,
    terminZDniami: ({ data, liczbaDni }: { data: string; liczbaDni: string }) => `Termin: ${data}, ${liczbaDni} dni do terminu`,
    kosztSpoznienia: ({ kwota }: { kwota: string }) => `Koszt spóźnienia: ${kwota}`,
    status: ({ status }: { status: string }) => `Status: ${status}`,
    kogoDotyczy: ({ kto }: { kto: string }) => `Kogo dotyczy: ${kto}`,
    szczegolySprawy: "Szczegóły sprawy",
    szczegolySprawyEtykieta: ({ tytul }: { tytul: string }) => `Szczegóły sprawy: ${tytul}`,
    jakZalatwicSprawe: "Jak załatwić sprawę",
    otworzProfilRodziny: "Otwórz profil rodziny",
    proponowaneDzialanie: "Proponowane działanie",
    etykietySpraw: { sprawa: "Sprawa", termin: "Termin", status: "Status" },
    czekaNaPotwierdzenie: "Czeka na Twoje potwierdzenie.",
    sprawdzIPotwierdz: "Sprawdź i potwierdź",
    oznaczJakoZalatwiona: "Oznacz sprawę jako załatwioną",
    oznaczJakoZlozona: "Oznacz sprawę jako złożoną",
    dzialanieWykonane: "Działanie wykonane",
    dzialanieOdrzucone: "Działanie odrzucone",
    oznaczonoJakoZalatwiona: "Sprawa oznaczona jako załatwiona",
    oznaczonoJakoZlozona: "Sprawa oznaczona jako złożona",
    nadalDoZrobienia: "Sprawa nadal do zrobienia",
    potwierdzono: ({ czas }: { czas: string }) => `Potwierdzono ${czas}.`,
    odrzucono: ({ czas }: { czas: string }) => `Odrzucono ${czas}.`,
    niczegoNieZmienilismy: "Niczego nie zmieniliśmy w planie. Sprawę oznaczysz później w planie rodziny albo poprosisz o to asystenta.",
    przejscia: {
      ViewZamLeaveType: {
        tytul: "Rozpocznij wniosek o zasiłek macierzyński",
        opis: "Wniosek otworzy się w kreatorze. Samo otwarcie niczego nie zmienia w planie.",
        akcja: "Przejdź do wniosku",
      },
      ViewCalcMaternityVariant: {
        tytul: "Otwórz kalkulator wariantu zasiłku",
        opis: "Kalkulator porówna oba warianty miesiąc po miesiącu na Twoich danych.",
        akcja: "Otwórz kalkulator wariantu",
      },
      ViewCalcMaternityInput: {
        tytul: "Otwórz kalkulator zasiłku z danymi Twojej rodziny",
        opis: "Kalkulator przeliczy zasiłek na danych z profilu rodziny. Niczego nie zmieni w planie.",
        akcja: "Otwórz kalkulator zasiłku",
      },
      ViewCalcMaternityInputNowyUzytkownik: {
        tytul: "Otwórz kalkulator zasiłku",
        opis: "Formę zatrudnienia kalkulator uzupełni z Twojego konta ZUS.",
        akcja: "Otwórz kalkulator zasiłku",
      },
      ViewProfileZusData: {
        tytul: "Uzupełnij profil na start",
        opis: "Na podstawie profilu ułożymy plan i policzymy terminy Twojej rodziny.",
        akcja: "Przejdź do profilu na start",
      },
    },
    kanaly: {
      "pytanie-do-zus": "Napisz wiadomość do ZUS",
      "e-wizyta": "Umów e-wizytę",
      "mama-zus": "Napisz na mama@zus.pl",
    },
    adresMamaZus: "mama@zus.pl",
    stopkaAI: "Oznaczenie odpowiedzi AI",
    // Szablony odpowiedzi z faktów (domena/asystent/fakty.ts); liczby pochodzą z planu, terminów, wyników kalkulacji i katalogu.
    fakty: {
      terminSprawy: ({ tytul, data }: { tytul: string; data: string }) => `Sprawę ${tytul} załatw do ${data}.`,
      terminSprawyZDniami: ({ tytul, data, liczbaDni }: { tytul: string; data: string; liczbaDni: string }) =>
        `Sprawę ${tytul} załatw do ${data}, zostało ${liczbaDni} dni.`,
      termin800: ({ data }: { data: string }) => `Wniosek o 800+ złóż do ${data}. Wtedy dostaniesz świadczenie od miesiąca urodzenia dziecka.`,
      kosztSpoznienia: ({ kwota }: { kwota: string }) => `Jeśli się spóźnisz, stracisz ${kwota}.`,
      sprawaZalatwiona: ({ tytul, status }: { tytul: string; status: string }) => `Sprawa ${tytul} ma w planie status ${status}.`,
      brakTerminu: ({ tytul }: { tytul: string }) => `Sprawa ${tytul} nie ma terminu w Twoim planie.`,
      brakSprawy: "W Twoim planie nie ma sprawy, o którą pytasz. Plan zobaczysz w planie rodziny.",
      becikoweProg: ({ prog }: { prog: string }) => `Becikowe przysługuje, gdy dochód netto na osobę w rodzinie nie przekracza ${prog}.`,
      becikoweDochod: ({ dochod }: { dochod: string }) => `W Twoim profilu dochód na osobę wynosi ${dochod}, dlatego becikowego nie ma w Twoim planie.`,
      becikowePoprawDochod: "Jeśli dochód się zmienił, popraw go w profilu rodziny, a plan przeliczymy ponownie.",
      becikoweWPlanie: ({ data }: { data: string }) => `Becikowe jest w Twoim planie, wniosek złóż do ${data}.`,
      becikoweWPlanieBezTerminu: "Becikowe jest w Twoim planie.",
      prawoWPlanie: ({ tytul }: { tytul: string }) => `Sprawa ${tytul} jest w Twoim planie.`,
      prawoBrak: "Tego świadczenia nie ma w Twoim planie. Plan wylicza świadczenia z profilu rodziny i katalogu świadczeń.",
      tydzienSprawa: ({ tytul, data, liczbaDni }: { tytul: string; data: string; liczbaDni: string }) =>
        `W tym tygodniu załatw sprawę ${tytul}, termin mija ${data}, za ${liczbaDni} dni.`,
      tydzienKolejne: ({ data, sprawy }: { data: string; sprawy: string }) => `Kolejne terminy masz ${data}: ${sprawy}.`,
      tydzienBrak: "W tym tygodniu nie masz spraw z terminem. Wszystkie terminy zobaczysz w Terminach.",
      tydzienWszystkie: "Wszystkie terminy zobaczysz w Terminach.",
      wysokosc100i70: ({ macierzynski, tygodnieMacierzynskiego, rodzicielski, tygodnieRodzicielskiego, razem }: {
        macierzynski: string; tygodnieMacierzynskiego: string; rodzicielski: string; tygodnieRodzicielskiego: string; razem: string;
      }) =>
        `Według Twojego wyniku kalkulatora w wariancie 100% i 70% dostaniesz ${macierzynski} miesięcznie przez ${tygodnieMacierzynskiego} tygodni urlopu macierzyńskiego, a potem ${rodzicielski} miesięcznie przez ${tygodnieRodzicielskiego} tygodnie urlopu rodzicielskiego. Razem to ${razem}.`,
      wysokosc81: ({ miesiecznie, tygodnie }: { miesiecznie: string; tygodnie: string }) =>
        `W wariancie 81,5% dostaniesz ${miesiecznie} miesięcznie przez ${tygodnie} tygodnie.`,
      wyborWariantu: ({ data }: { data: string }) => `Wariant wybierzesz we wniosku o zasiłek macierzyński do ${data}.`,
      wysokoscBrak: "Kwotę zasiłku policzy kalkulator zasiłku macierzyńskiego na danych z profilu Twojej rodziny.",
      porownanieRowne: ({ suma100i70, suma81 }: { suma100i70: string; suma81: string }) =>
        `Przy pełnym wykorzystaniu urlopu macierzyńskiego i rodzicielskiego suma obu wariantów jest prawie równa: ${suma100i70} w wariancie 100% i 70% oraz ${suma81} w wariancie 81,5%.`,
      porownanieMiesiecznie: ({ miesiecznie }: { miesiecznie: string }) => `W wariancie 81,5% co miesiąc dostajesz tę samą kwotę, czyli ${miesiecznie}.`,
      porownanieOpis: "W wariancie 100% i 70% kwota jest wyższa w czasie urlopu macierzyńskiego, a niższa w czasie rodzicielskiego.",
      porownanieTermin: ({ data }: { data: string }) => `Wariant 81,5% możesz wybrać do ${data}.`,
      porownanieBrak: "Przy pełnym wykorzystaniu urlopu macierzyńskiego i rodzicielskiego suma obu wariantów jest prawie równa. Kalkulator wariantu porówna je na Twoich danych.",
      zamJdg: "Prowadzisz jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym, więc wniosek o zasiłek macierzyński składasz w ZUS.",
      zamUz: "Wykonujesz umowę zlecenia z dobrowolnym ubezpieczeniem chorobowym, więc wniosek o zasiłek macierzyński składasz w ZUS.",
      zamDataPotwierdzona: ({ data }: { data: string }) => `Data porodu ${data} jest potwierdzona, więc możesz zacząć wniosek od razu.`,
      zamRodzajUrlopu: "Na początku wybierzesz rodzaj urlopu, za który chcesz dostać zasiłek.",
      zamBezDatyPorodu: "Wniosek o zasiłek macierzyński zaczniesz po potwierdzeniu daty porodu w profilu rodziny.",
      zamBrakSprawy: "W Twoim planie nie ma wniosku o zasiłek macierzyński do ZUS. Sposób złożenia wniosku zależy od formy zatrudnienia w profilu rodziny.",
      uopPracodawca: "Pracujesz na umowie o pracę, więc wniosek o urlop macierzyński i rodzicielski składasz u pracodawcy.",
      uopBezWniosku: "Osobnego wniosku o zasiłek macierzyński w przewodniku nie składasz.",
      uopTermin: ({ data }: { data: string }) => `Jeśli urlop rodzicielski ma się zacząć zaraz po macierzyńskim, złóż wniosek do ${data}.`,
      uopInstrukcja: "Instrukcja sprawy podpowie Ci, co przygotować.",
      sposobSprawy: ({ tytul, kanal }: { tytul: string; kanal: string }) => `Sprawę ${tytul} załatwisz tak: ${kanal}`,
      sposobInstrukcja: "Instrukcja sprawy podpowie Ci kolejne kroki.",
      oznaczPropozycja: ({ tytul, status, data }: { tytul: string; status: string; data: string }) =>
        `W Twoim planie sprawa ${tytul} ma jeszcze status ${status}, z terminem ${data}.`,
      oznaczPropozycjaBezTerminu: ({ tytul, status }: { tytul: string; status: string }) => `W Twoim planie sprawa ${tytul} ma jeszcze status ${status}.`,
      oznaczZalatwiona: "Mogę oznaczyć ją jako załatwioną, zrobię to dopiero, gdy potwierdzisz.",
      oznaczZlozona: "Mogę oznaczyć ją jako złożoną, zrobię to dopiero, gdy potwierdzisz.",
      oznaczJuz: ({ tytul, status }: { tytul: string; status: string }) => `Sprawa ${tytul} ma już w planie status ${status}.`,
      oznaczNieTwoja: ({ tytul, osoba }: { tytul: string; osoba: string }) =>
        `Tej sprawy nie oznaczysz ze swojego konta. Sprawa ${tytul} jest przypisana matce, więc oznacza ją ${osoba}.`,
      oznaczNieTwojaStatus: "Aktualny status sprawy zobaczysz w planie rodziny.",
      oznaczBrakSprawy: "Nie znalazłem w Twoim planie sprawy, którą chcesz oznaczyć. Sprawy oznaczysz w planie rodziny.",
      kalkulator: "Zasiłek przeliczy kalkulator zasiłku macierzyńskiego na danych z profilu rodziny.",
      instrukcja: ({ tytul }: { tytul: string }) => `Instrukcja sprawy ${tytul} podpowie Ci kolejne kroki.`,
      profilPlan: "Plan rodziny jest gotowy. Profil rodziny zmienisz w ustawieniach profilu.",
      nuZasilekJdgBezDuch:
        "Prowadzisz jednoosobową działalność gospodarczą, a zasiłek macierzyński przy działalności wymaga dobrowolnego ubezpieczenia chorobowego. W danych Twojego konta ZUS tego ubezpieczenia nie ma.",
      nuZasilekUzBezDuch:
        "Wykonujesz umowę zlecenia, a zasiłek macierzyński przy umowie zlecenia wymaga dobrowolnego ubezpieczenia chorobowego. W danych Twojego konta ZUS tego ubezpieczenia nie ma.",
      nuZasilekUop: "Pracujesz na umowie o pracę, więc masz ubezpieczenie chorobowe i prawo do zasiłku macierzyńskiego za czas urlopu.",
      nuZasilekZDuch: "W danych Twojego konta ZUS jest dobrowolne ubezpieczenie chorobowe, więc możesz dostać zasiłek macierzyński.",
      nuZasilekBrakTytulu: "W danych Twojego konta ZUS nie ma tytułu do ubezpieczenia, więc zasiłku macierzyńskiego nie dostaniesz.",
      nuSwiadczenieRodzicielskie: ({ kwota }: { kwota: string }) =>
        `Bez niego możesz dostać świadczenie rodzicielskie, według katalogu świadczeń to ${kwota} miesięcznie.`,
      nuSwiadczenieRodzicielskieBrakTytulu: ({ kwota }: { kwota: string }) =>
        `Możesz dostać świadczenie rodzicielskie, według katalogu świadczeń to ${kwota} miesięcznie.`,
      nuUzupelnij: "Uzupełnij profil na start, a pokażę sprawy i terminy Twojej rodziny.",
      nuBrakPlanu: "Nie znam jeszcze planu Twojej rodziny, więc nie wskażę spraw na ten tydzień. Uzupełnij profil na start, na jego podstawie ułożymy plan i policzymy terminy.",
      nuBrakPlanuOgolnie: "Nie znam jeszcze planu Twojej rodziny. Uzupełnij profil na start, na jego podstawie ułożymy plan i policzymy terminy.",
      nuKalkulator: "Kwotę policzy kalkulator zasiłku macierzyńskiego. Formę zatrudnienia uzupełnimy w nim z Twojego konta ZUS, a pozostałe dane podasz sama.",
    },
    // koniec ViewAssistantChat
  },
  // Arkusze i okna modalne
  SheetHealthDataConsent: {
    tytul: "Zgoda na dane dotyczące zdrowia",
    // koniec SheetHealthDataConsent
  },
  ModalConsentText: {
    tytul: "Pełna treść zgody",
    // koniec ModalConsentText
  },
  SheetConsentWithdrawConfirm: {
    tytul: "Wycofać zgodę na dane dotyczące zdrowia?",
    // koniec SheetConsentWithdrawConfirm
  },
  SheetFamilyDataDeleteConfirm: {
    tytul: "Usunąć dane rodziny?",
    // koniec SheetFamilyDataDeleteConfirm
  },
  SheetEmploymentChoice: {
    tytul: "Wybierz formę zatrudnienia",
    // koniec SheetEmploymentChoice
  },
  SheetContributionPaidConfirm: {
    tytul: "Potwierdź opłacenie składek",
    // koniec SheetContributionPaidConfirm
  },
  ModalNewChildDetected: {
    tytul: "Nowe dziecko w danych ZUS",
    // koniec ModalNewChildDetected
  },
  ModalBenefitRules: {
    tytul: "Zastosowane reguły",
    tytulSwiadczenia: ({ nazwa }: { nazwa: string }) => `Zastosowane reguły – ${nazwa}`,
    wynik: ({ wynik }: { wynik: string }) => `Wynik: ${wynik}.`,
    wynikOd: ({ wynik, data }: { wynik: string; data: string }) => `Wynik: ${wynik} od ${data}.`,
    reguly: "Reguły",
    wartosci: "Wartości ze słowników",
    wartosciPrzewijanie: "Tabela wartości ze słowników",
    kolumnyWartosci: { wpis: "Wpis", wartosc: "Wartość", od: "Obowiązuje od" },
    dane: "Dane, z których skorzystaliśmy",
    danePrzewijanie: "Tabela danych, z których skorzystaliśmy",
    kolumnyDanych: { dana: "Dana", wartosc: "Wartość", zrodlo: "Źródło" },
    warunki: "Warunki, których nie sprawdzamy w danych",
    brakDanych: "Brak danych",
    // koniec ModalBenefitRules
  },
  SheetCaseDoneConfirm: {
    tytul: "Udało się załatwić sprawę?",
    // koniec SheetCaseDoneConfirm
  },
  SheetCalendarDownload: {
    tytul: "Pobierz terminy jako plik kalendarza",
    // koniec SheetCalendarDownload
  },
  SheetCalcBaseSource: {
    tytul: "Podstawa wymiaru zasiłku",
    // koniec SheetCalcBaseSource
  },
  ModalCalcAppliedRules: {
    tytul: "Zastosowane reguły",
    // koniec ModalCalcAppliedRules
  },
  SheetCalcParentalParts: {
    tytul: "Podział urlopów",
    // koniec SheetCalcParentalParts
  },
  SheetCalcWorkCombination: {
    tytul: "Łączenie urlopu rodzicielskiego z pracą",
    // koniec SheetCalcWorkCombination
  },
  SheetCalcReturnToWork: {
    tytul: "Zmień datę powrotu do pracy",
    // koniec SheetCalcReturnToWork
  },
  ModalSampleCaseDocument: {
    tytul: "Podgląd dokumentu",
    // koniec ModalSampleCaseDocument
  },
  ModalSickLeaveDetails: {
    tytul: "Szczegóły zaświadczenia",
    // Sloty zaswiadczenia-e-zla/_sloty (u30)
    akcjaWnioskuZas53: {
      // koniec akcjaWnioskuZas53
    },
    // koniec ModalSickLeaveDetails
  },
  ModalStatementsText: {
    tytul: "Pełna treść oświadczeń",
    // koniec ModalStatementsText
  },
  SheetZas53ManualCertificate: {
    tytul: "Zaświadczenie spoza listy",
    // koniec SheetZas53ManualCertificate
  },
  ModalEmployerMessagePreview: {
    tytul: "Wiadomość do pracodawcy",
    // koniec ModalEmployerMessagePreview
  },
  SheetRiskDetails: {
    tytul: "Szczegóły ryzyka",
    // koniec SheetRiskDetails
  },
  SheetInviteSecondParent: {
    tytul: "Zaproś drugiego rodzica",
    // koniec SheetInviteSecondParent
  },
  SheetSecondParentRemoveConfirm: {
    tytul: "Odłączyć drugiego rodzica?",
    // koniec SheetSecondParentRemoveConfirm
  },
  SheetSpecialSituationConfirm: {
    tytul: "Sprawdź i zapisz",
    // koniec SheetSpecialSituationConfirm
  },
  SheetAssistantActionConfirm: {
    tytul: "Potwierdź działanie asystenta",
    opisZalatwiona: "Asystent oznaczy sprawę jako załatwioną w Twoim planie rodziny. Nie będziemy już przypominać o jej terminie.",
    opisZlozona: "Asystent oznaczy sprawę jako złożoną w Twoim planie rodziny. Nie będziemy już przypominać o jej terminie.",
    etykiety: {
      dzialanie: "Działanie",
      sprawa: "Sprawa",
      kogoDotyczy: "Kogo dotyczy",
      termin: "Termin",
      statusTeraz: "Status teraz",
      statusPo: "Status po potwierdzeniu",
    },
    dzialanieZalatwiona: "Oznaczenie sprawy jako załatwionej",
    dzialanieZlozona: "Oznaczenie sprawy jako złożonej",
    kogoDotyczy: {
      matka: "Matka",
      "drugi-rodzic": "Drugi rodzic",
      "oboje-rodzice": "Oboje rodzice",
      "matka-albo-ojciec": "Matka albo ojciec",
      "rodzic-przyjmujacy": "Rodzic przyjmujący dziecko",
    },
    brakTerminu: "Bez terminu",
    notatka: "Twoją decyzję zapiszemy w historii rozmowy. Jeśli odrzucisz działanie, sprawa zostanie w planie ze statusem do zrobienia.",
    potwierdz: "Potwierdź",
    odrzuc: "Odrzuć",
    zamknij: "Zamknij",
    // koniec SheetAssistantActionConfirm
  },
} as const;
