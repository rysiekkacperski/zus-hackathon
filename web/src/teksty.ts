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
    // koniec ViewGuideStart
  },
  ViewMobywatelLogin: {
    tytulStrony: "Logowanie przez mObywatela",
    naglowek: "Logowanie przez mObywatela",
    // koniec ViewMobywatelLogin
  },
  ViewEzusLogin: {
    tytulStrony: "Logowanie loginem i hasłem eZUS",
    naglowek: "Logowanie loginem i hasłem eZUS",
    // koniec ViewEzusLogin
  },
  ViewMzusCodeLogin: {
    tytulStrony: "Logowanie kodem z aplikacji mZUS",
    naglowek: "Logowanie kodem z aplikacji mZUS",
    // koniec ViewMzusCodeLogin
  },
  ViewDemoAccountPicker: {
    tytulStrony: "Wybierz konto",
    naglowek: "Wybierz konto",
    // koniec ViewDemoAccountPicker
  },
  ViewDemoNewAccount: {
    tytulStrony: "Nowe konto",
    naglowek: "Nowe konto",
    // koniec ViewDemoNewAccount
  },
  ViewDemoSettings: {
    tytulStrony: "Ustawienia trybu demonstracyjnego",
    naglowek: "Ustawienia trybu demonstracyjnego",
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
    wstep: "Spodziewasz się dziecka? Przewodnik ułoży plan świadczeń Twojej rodziny, policzy terminy i pomoże przygotować wnioski.",
    coZrobisz: {
      tytul: "Co zrobisz w przewodniku",
      plan: {
        tytul: "Plan świadczeń",
        opis: "Zobaczysz świadczenia, które przysługują Twojej rodzinie, i sprawy do załatwienia po kolei.",
      },
      terminy: {
        tytul: "Terminy",
        opis: "Policzymy, do kiedy złożyć wnioski i dokumenty, i przypomnimy Ci o nich.",
      },
      wnioski: {
        tytul: "Wnioski",
        opis: "Przygotujesz wnioski na podstawie danych z profilu rodziny.",
      },
      kalkulator: {
        tytul: "Kalkulator zasiłku",
        opis: "Sprawdzisz, ile wyniesie zasiłek macierzyński.",
      },
    },
    jakZaczniesz: {
      tytul: "Jak zaczniesz",
      kroki: [
        "Zdecydujesz, czy zgadzasz się na przetwarzanie danych o ciąży, porodzie i stanie zdrowia dziecka.",
        "Sprawdzisz dane z konta ZUS i uzupełnisz profil na start.",
        "Zobaczysz plan świadczeń swojej rodziny.",
      ],
      twojeDane: "Twoje dane",
      notatki: [
        "Rozpoznajemy Cię po numerze PESEL potwierdzonym przy logowaniu. Po każdym sposobie logowania zobaczysz ten sam profil rodziny.",
        "Dane o ciąży, porodzie i stanie zdrowia dziecka zapisujemy tylko za Twoją zgodą.",
        "Zgodę zmienisz, a dane rodziny usuniesz w każdej chwili w ustawieniach przewodnika.",
      ],
    },
    rozpocznij: "Rozpocznij",
    // koniec ViewGuideWelcome
  },
  ViewGuideSettings: {
    tytulStrony: "Ustawienia",
    naglowek: "Ustawienia",
    // Sloty ustawienia/_sloty (u02, u18, u18, u02)
    sekcjaZgody: {
      tytul: "Zgoda na dane dotyczące zdrowia",
      opis: "Zgoda dotyczy danych o ciąży, porodzie i stanie zdrowia dziecka, które podajesz w przewodniku. Wykorzystujemy je wyłącznie do wyliczenia planu rodziny, terminów i wniosków.",
      opisBezZgody: "Bez zgody nie zapisujemy tych danych. Gdy udzielisz zgody, przewodnik uwzględni je w planie rodziny, terminach i wnioskach.",
      opisWycofanej: ({ terminUsuniecia }: { terminUsuniecia: string }) =>
        `Nie wykorzystujemy już tych danych. Usuniemy je do ${terminUsuniecia}.`,
      opisWycofanejZTerminemPorodu: ({ terminPorodu, terminUsuniecia }: { terminPorodu: string; terminUsuniecia: string }) =>
        `Nie wykorzystujemy już tych danych, także przewidywanego terminu porodu ${terminPorodu}. Usuniemy je do ${terminUsuniecia}.`,
      stanZgody: "Stan zgody",
      dataOstatniejDecyzji: "Data ostatniej decyzji",
      wersjaTresci: "Wersja treści zgody",
      stany: {
        "brak-decyzji": "Nieudzielona",
        udzielona: "Udzielona",
        odmowa: "Nieudzielona – odmowa",
        wycofana: "Wycofana",
      },
      wycofaj: "Wycofaj zgodę",
      udziel: "Udziel zgody",
      notatkaUdzielonej: "Po wycofaniu zgody od razu przestaniemy wykorzystywać te dane i usuniemy je w ciągu 30 dni.",
      notatkaBezZgody: "Zgodę wycofasz w każdej chwili w tym miejscu.",
      notatkaWycofanej: "Gdy udzielisz zgody ponownie, przewodnik znów uwzględni te dane w planie rodziny, terminach i wnioskach.",
      // koniec sekcjaZgody
    },
    sekcjaPrzypomnien: {
      // koniec sekcjaPrzypomnien
    },
    kartaPlikuKalendarza: {
      // koniec kartaPlikuKalendarza
    },
    sekcjaDanychRodziny: {
      tytul: "Dane rodziny",
      wstep: "Jednym działaniem usuniesz wszystkie dane rodziny zapisane w przewodniku:",
      zakres: [
        "profil rodziny,",
        "plan rodziny,",
        "terminy i przypomnienia,",
        "wnioski przygotowane w przewodniku, których nie wysłano.",
      ],
      termin: "Usuniemy je w ciągu 30 dni. Wnioski wysłane do ZUS pozostają w ZUS.",
      usun: "Usuń dane rodziny",
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
    // Szkielet kreatora profilu-na-start/_czesci (u07), wspólny dla ekranów kreatora
    kreator: {
      wstep: "Odpowiedz na kilka pytań, a ułożymy z nich plan Twojej rodziny. Pytamy tylko o to, czego nie ma na Twoim koncie ZUS.",
      krokiTytul: "Kroki profilu",
      nazwyKrokow: {
        pracaIZasilek: "Praca i zasiłek",
        sytuacja: "Twoja sytuacja",
        ciazaAlboDziecko: "Ciąża albo dziecko",
        daneCiazy: "Dane ciąży",
        dataPorodu: "Data porodu",
        przyjecieDziecka: "Przyjęcie dziecka",
        zmianaZatrudnienia: "Zmiana zatrudnienia",
        rodzina: "Rodzina",
        drugiRodzic: "Drugi rodzic",
        podsumowanie: "Podsumowanie",
      },
      notatkaZapamietywania: "Zapamiętujemy Twoje odpowiedzi. Jeśli przerwiesz, po powrocie zaczniesz w tym samym miejscu.",
      zrodla: {
        "konto-zus": "Źródło: konto ZUS",
        "odpowiedz-rodzica": "Źródło: Twoja odpowiedź",
        "pelnomocnictwo-pel": "Źródło: pełnomocnictwo PEL",
      },
      formy: {
        "umowa-o-prace": "Umowa o pracę",
        "umowa-zlecenia": "Umowa zlecenia",
        jdg: "Jednoosobowa działalność gospodarcza",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      // koniec kreator
    },
    tytulKarty: "Dane z Twojego konta ZUS",
    opisKarty: "Odczytaliśmy je z Twojego konta ZUS. Sprawdź je i potwierdź albo zmień odpowiedź.",
    opisKartyBezDanych: "Nie mamy teraz danych z Twojego konta ZUS. Spróbuj ponownie albo wybierz formę zatrudnienia samodzielnie.",
    etykiety: {
      forma: "Forma zatrudnienia",
      pozostale: "Pozostałe tytuły ubezpieczenia",
      zakonczony: "Tytuł zakończony",
      chorobowe: "Ubezpieczenie chorobowe",
      platnik: "Płatnik zasiłku",
    },
    rodzajeTytulow: {
      pracownik: "pracownik",
      zleceniobiorca: "zleceniobiorca",
      dzialalnosc: "osoba prowadząca pozarolniczą działalność",
    },
    tytulOd: ({ rodzaj, od }: { rodzaj: string; od: string }) => `Tytuł ubezpieczenia: ${rodzaj}, od ${od}`,
    tytulOdDo: ({ rodzaj, od, doDnia }: { rodzaj: string; od: string; doDnia: string }) =>
      `Tytuł ubezpieczenia: ${rodzaj}, od ${od} do ${doDnia}`,
    brakTytuluOd: ({ data }: { data: string }) => `Od ${data} na Twoim koncie ZUS nie ma tytułu do ubezpieczenia.`,
    brakTytulu: "Na Twoim koncie ZUS nie ma tytułu do ubezpieczenia.",
    platnikSkladek: ({ nazwa }: { nazwa: string }) => `Płatnik składek: ${nazwa}`,
    zakonczonaUmowa: "Umowa skończyła się w ciągu ostatnich 280 dni. Zapytamy Cię o nią w kroku Zmiana zatrudnienia.",
    zakonczonaDzialalnosc: "Działalność skończyła się w ciągu ostatnich 280 dni. Zapytamy Cię o nią w kroku Zmiana zatrudnienia.",
    brakPozostalych: "-",
    choroboweObowiazkowe: "Obowiązkowe. Jako pracownik nie odpowiadasz na pytanie o dobrowolne ubezpieczenie chorobowe.",
    zmienForme: "Zmień formę zatrudnienia",
    wybierzForme: "Wybierz formę zatrudnienia",
    nieWybrano: "Nie wybrano",
    formyMiejscownik: {
      "umowa-o-prace": "umowie o pracę",
      "umowa-zlecenia": "umowie zlecenia",
      jdg: "jednoosobowej działalności gospodarczej",
      "brak-tytulu": "braku tytułu do ubezpieczenia",
    },
    platnicy: {
      zus: "ZUS",
      brak: "Brak",
      nieWiemy: "Jeszcze nie wiemy",
      nieustalony: "Płatnik nieustalony",
      jdg: "Przy jednoosobowej działalności gospodarczej zasiłek wypłaca ZUS.",
      brakTytulu: "Bez tytułu do ubezpieczenia nie masz płatnika zasiłku.",
      niewyplaca: ({ nazwa }: { nazwa: string }) =>
        `Twój płatnik składek ${nazwa} nie wypłaca zasiłków, bo zgłasza do ubezpieczenia chorobowego nie więcej niż 20 osób. Zasiłek wypłaci Ci ZUS.`,
      wyplaca: "Ten płatnik składek wypłaca zasiłki, bo zgłasza do ubezpieczenia chorobowego więcej niż 20 osób. Ustaliliśmy go z tytułu, który potwierdzasz jako formę zatrudnienia.",
      brakPlatnikaPrzy: ({ forma }: { forma: string }) =>
        `Na Twoim koncie ZUS nie ma płatnika składek przy ${forma}. Zapytamy o niego na następnym ekranie.`,
      brakInformacji: ({ nazwa }: { nazwa: string }) =>
        `Na Twoim koncie ZUS nie ma informacji, czy płatnik składek ${nazwa} wypłaca zasiłki. Zapytamy o to na następnym ekranie.`,
    },
    dobrowolne: {
      legenda: "Czy opłacasz dobrowolne ubezpieczenie chorobowe?",
      tak: "Tak",
      nie: "Nie",
      przy: {
        "umowa-zlecenia": "przy umowie zlecenia",
        jdg: "przy działalności",
      },
      zKontaTak: ({ przy }: { przy: string }) =>
        `Na Twoim koncie ZUS ${przy} jest dobrowolne ubezpieczenie chorobowe, więc zaznaczyliśmy „Tak”. Zmień odpowiedź, jeśli jest inna.`,
      zKontaNie: ({ przy }: { przy: string }) =>
        `Na Twoim koncie ZUS ${przy} nie ma ubezpieczenia chorobowego, więc zaznaczyliśmy „Nie”. Zmień odpowiedź, jeśli jest inna.`,
      zalezy: {
        "umowa-zlecenia": "Przy umowie zlecenia od tej odpowiedzi zależy prawo do zasiłku macierzyńskiego.",
        jdg: "Przy jednoosobowej działalności gospodarczej od tej odpowiedzi zależy prawo do zasiłku macierzyńskiego.",
      },
    },
    notatkaKilkaTytulow: "Masz kilka tytułów ubezpieczenia. Proponujemy pierwszy z kolejności: umowa o pracę, jednoosobowa działalność gospodarcza, umowa zlecenia.",
    dzieci: {
      tytul: "Dzieci zgłoszone do ubezpieczenia zdrowotnego",
      brak: "Na Twoim koncie ZUS nie ma dzieci zgłoszonych do ubezpieczenia zdrowotnego.",
      bezDanych: "Pokażemy je, gdy odczytamy dane z Twojego konta ZUS.",
      kolumny: {
        imieINazwisko: "Imię i nazwisko",
        dataUrodzenia: "Data urodzenia",
        zrodlo: "Źródło",
      },
      zrodloKonto: "Konto ZUS",
      przewijanie: "Tabela dzieci zgłoszonych do ubezpieczenia zdrowotnego",
    },
    pozostaleDane: "Wszystkie dane z Twojego konta ZUS",
    notatkaOdswiezania: "Dane z konta ZUS odświeżamy przy każdym otwarciu przewodnika.",
    dalej: "Potwierdź i przejdź dalej",
    // koniec ViewProfileZusData
  },
  ViewProfilePayer: {
    tytulStrony: "Profil na start: płatnik zasiłku",
    naglowek: "Profil na start",
    tytulKarty: "Kto wypłaci Ci zasiłek",
    wstepZNazwa: ({ forma, nazwa }: { forma: string; nazwa: string }) =>
      `Pracujesz na ${forma} dla płatnika składek ${nazwa}. Na Twoim koncie ZUS nie ma informacji, czy ten płatnik wypłaca zasiłki. Odpowiedz na jedno pytanie.`,
    wstepBezNazwy: ({ forma }: { forma: string }) =>
      `Na Twoim koncie ZUS nie ma płatnika składek przy ${forma}. Odpowiedz na jedno pytanie.`,
    wstepOgolny: "Na Twoim koncie ZUS nie ma informacji, czy Twój płatnik składek wypłaca zasiłki. Odpowiedz na jedno pytanie.",
    pytanieZNazwa: ({ nazwa }: { nazwa: string }) => `Czy ${nazwa} zgłasza do ubezpieczenia chorobowego więcej niż 20 osób?`,
    pytanieBezNazwy: "Czy Twój płatnik składek zgłasza do ubezpieczenia chorobowego więcej niż 20 osób?",
    podpowiedz: "Liczy się stan na 30 listopada poprzedniego roku. Płatnik, który zgłasza więcej niż 20 osób, sam wypłaca zasiłki.",
    odpowiedzi: {
      tak: "Tak",
      nie: "Nie",
      "nie-wiem": "Nie wiem",
    },
    opisTakZNazwa: ({ nazwa }: { nazwa: string }) => `Zasiłek wypłaci ${nazwa}.`,
    opisTakBezNazwy: "Zasiłek wypłaci Twój płatnik składek.",
    opisNie: "Zasiłek wypłaci ZUS.",
    opisNieWiem: "Zapiszemy, że płatnika zasiłku nie udało się ustalić.",
    notatka: "Nie znasz odpowiedzi? Zapytaj płatnika składek, ile osób zgłasza do ubezpieczenia chorobowego.",
    // koniec ViewProfilePayer
  },
  ViewProfileSituation: {
    tytulStrony: "Profil na start: Twoja sytuacja",
    naglowek: "Profil na start",
    tytulKarty: "Twoja sytuacja",
    opisKarty: "Od Twojej sytuacji zależy, o co zapytamy dalej.",
    legenda: "Która sytuacja Cię dotyczy?",
    sytuacje: {
      oczekiwanie: {
        etykieta: "Spodziewam się dziecka",
        opis: "Podasz przewidywany termin porodu, liczbę dzieci i datę pierwszej wizyty u lekarza albo położnej.",
      },
      narodziny: {
        etykieta: "Dziecko już się urodziło",
        opis: "Podasz datę porodu i liczbę urodzonych dzieci.",
      },
      przyjecie: {
        etykieta: "Przyjmuję dziecko na wychowanie",
        opis: "Podasz dane przyjęcia dziecka, na przykład formę i datę przyjęcia.",
      },
      planowanie: {
        etykieta: "Planuję rodzicielstwo",
        opis: "Przejdziesz do kalkulatora zasiłku macierzyńskiego. Do profilu wrócisz przy następnym otwarciu przewodnika.",
      },
    },
    notatkaZgodyPrzed: "Dane o ciąży i dziecku zapisujemy tylko wtedy, gdy masz zgodę na dane dotyczące zdrowia. Zgodę zmienisz w ",
    notatkaZgodyLink: "ustawieniach przewodnika",
    notatkaZgodyPo: ".",
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
      zobaczSzczegoly: "Zobacz szczegóły ryzyka",
      // koniec ostrzezeniaSprawy
    },
    akcjaPrzejeciaUrlopu: {
      // koniec akcjaPrzejeciaUrlopu
    },
    // Widok planu (u12)
    otworzProfil: "Otwórz profil rodziny",
    brakPlanu: "Plan rodziny pojawi się po zapisaniu profilu na start.",
    zmienDecyzjeOZgodzie: "Zmień decyzję o zgodzie",
    sciezka: {
      tytul: "Twoja ścieżka",
      wstep: "Widzisz tylko sprawy, które dotyczą Twojej rodziny. Każdą przypisaliśmy do etapu i do rodzica, którego dotyczy.",
      wPlanie: "Sprawy w planie",
      doZrobienia: "Do zrobienia",
      zlozone: "Złożone",
      zalatwione: "Załatwione",
      etapyPlanu: "Etapy planu",
      licznikSpraw: ({ liczba }: { liczba: string }) => `Sprawy: ${liczba}`,
      licznikDoZrobienia: ({ liczba }: { liczba: string }) => `do zrobienia: ${liczba}`,
      licznikZlozonych: ({ liczba }: { liczba: string }) => `złożone: ${liczba}`,
      licznikZalatwionych: ({ liczba }: { liczba: string }) => `załatwione: ${liczba}`,
    },
    biezacyEtap: "Bieżący etap",
    etapZakonczony: "Etap zakończony",
    etapy: {
      ciaza: "Ciąża",
      "pierwsze-tygodnie": "Pierwsze tygodnie po porodzie",
      "urlopy-i-zasilek": "Urlopy i zasiłek macierzyński",
      "pieniadze-na-dziecko": "Pieniądze na dziecko",
      "powrot-do-pracy": "Powrót do pracy",
    },
    tytulEtapu: ({ numer, nazwa }: { numer: string; nazwa: string }) => `${numer}. ${nazwa}`,
    opisyEtapow: {
      ciaza: "Sprawy do załatwienia przed porodem.",
      "pierwsze-tygodnie": "Zgłoszenia, które załatwisz w pierwszych 6 tygodniach po porodzie.",
      "urlopy-i-zasilek": "Urlopy rodziców i zasiłek na czas opieki nad dzieckiem.",
      "pieniadze-na-dziecko": "Świadczenia pieniężne, o które wystąpisz po porodzie.",
      "powrot-do-pracy": "Uprawnienia rodziców po powrocie do pracy.",
    },
    terminPorodu: ({ data }: { data: string }) => `Przewidywany termin porodu: ${data}.`,
    ukryjSprawy: ({ liczba }: { liczba: string }) => `Ukryj sprawy (${liczba})`,
    pokazSprawy: ({ liczba }: { liczba: string }) => `Pokaż sprawy (${liczba})`,
    brakSprawWEtapie: "W tym etapie nie ma spraw Twojej rodziny.",
    kolumny: { sprawa: "Sprawa", kogo: "Kogo dotyczy", status: "Status", kwota: "Kwota" },
    podpisTabeli: ({ etap }: { etap: string }) => `Sprawy w etapie ${etap}`,
    przewijanieTabeli: ({ etap }: { etap: string }) => `Tabela spraw w etapie ${etap}`,
    rodzice: {
      matka: "Matka",
      "drugi-rodzic": "Drugi rodzic",
      "oboje-rodzice": "Oboje rodzice",
      "matka-albo-ojciec": "Matka albo ojciec",
      "rodzic-przyjmujacy": "Rodzic, który przyjął dziecko",
    },
    rodzicTy: ({ rodzic }: { rodzic: string }) => `${rodzic} (Ty)`,
    oznaczenia: {
      poPorodzie: "Po porodzie",
      zalezyOdDochodu: "Zależy od dochodu",
      nowaWPlanie: "Nowa w planie",
      liczbaDzieci: ({ liczba }: { liczba: string }) => `Liczba dzieci: ${liczba}`,
    },
    kwoty: {
      miesiecznie: ({ kwota }: { kwota: string }) => `${kwota} miesięcznie`,
      jednorazowo: ({ kwota }: { kwota: string }) => `${kwota} jednorazowo`,
      brak: "-",
    },
    opisySpraw: {
      K01: "Zaświadczenie z wizyty dołączysz do wniosku o becikowe.",
      K02: "Rodzice, którzy nie są małżeństwem, uznają ojcostwo w urzędzie stanu cywilnego.",
      K03: "Bez tego ubezpieczenia nie dostaniesz zasiłku macierzyńskiego z ZUS.",
      K04: "Uprawnienia pracownicy w ciąży u pracodawcy.",
      K05: "Zgłosisz dziecko do ubezpieczenia zdrowotnego jako członka rodziny.",
      K06: "Zgłosisz je w urzędzie stanu cywilnego.",
      K07: "Wniosek złożysz u swojego pracodawcy.",
      K08: "Złożysz go w kreatorze wniosku w przewodniku.",
      K09: "Dotyczy drugiego rodzica z ubezpieczeniem chorobowym.",
      K10: "Dotyczy drugiego rodzica z ubezpieczeniem chorobowym.",
      K11: "Dodatkowy urlop przy wcześniactwie albo hospitalizacji dziecka po porodzie.",
      K12: "Na każde dziecko do ukończenia 18 lat.",
      K13: "Wniosek na kolejny okres świadczeniowy.",
      K14: "Jednorazowa zapomoga z tytułu urodzenia dziecka.",
      K15: "Dodatek do zasiłku rodzinnego z tytułu urodzenia dziecka.",
      K16: "Świadczenie dla rodzica, któremu nie przysługuje zasiłek macierzyński.",
      K17: "Jednorazowe świadczenie przy ciężkiej chorobie dziecka.",
      K18: "Wybierzesz jedno ze świadczeń programu.",
      K19: "Dotyczy składki zdrowotnej z Twojej działalności gospodarczej.",
      K20: "Dla matki na umowie o pracę po powrocie do pracy.",
      K21: "Dla rodzica na umowie o pracę.",
      K22: "Dla rodzica na umowie o pracę albo z dobrowolnym ubezpieczeniem chorobowym.",
      K23: "Dla rodzica na umowie o pracę.",
      K24: "Przysługuje za niezdolność do pracy w ciąży potwierdzoną zaświadczeniem lekarskim e-ZLA.",
      K25: "Przysługuje po wyczerpaniu okresu zasiłkowego zasiłku chorobowego.",
      K26: "Dla matki, której umowa o pracę ustała w ciąży po upadłości, likwidacji albo śmierci pracodawcy.",
      K27: "Bez ubezpieczenia chorobowego nie dostaniesz zasiłków z ZUS.",
      K28: "Sprawdzimy, od kiedy przysługuje Ci ubezpieczenie chorobowe.",
      K29: "Sprawdzimy, czy w dniu porodu będziesz mieć ubezpieczenie chorobowe.",
      K30: "Ochrona umowy o pracę w ciąży i w czasie urlopów.",
      K31: "Wniosek złożysz u swojego pracodawcy.",
      K32: "Wniosek złożysz w ZUS po przyjęciu dziecka na wychowanie.",
      K33: "Zasiłek macierzyński w rodzinie zastępczej zawodowej.",
      K34: "Zasiłek macierzyński po stracie dziecka.",
      K35: "Organizacje, które pomagają rodzicom w trudnej sytuacji.",
      K36: "Odpis skrócony dołączysz do wniosku o zasiłek macierzyński.",
      K37: "Rodzic na umowie o pracę może łączyć urlop rodzicielski z pracą.",
    } as Readonly<Record<string, string>>,
    wizytaOdbyta: ({ data, koniec }: { data: string; koniec: string }) =>
      `Wizyta odbyła się ${data}, przed końcem 10. tygodnia ciąży (${koniec}).`,
    informacjaK19:
      "Dobrowolne ubezpieczenie chorobowe ustaje z mocy ustawy od pierwszego dnia prawa do zasiłku macierzyńskiego. Składka zdrowotna jest dalej płatna, chyba że zasiłek nie przekracza kwoty świadczenia rodzicielskiego.",
    oplacenie: {
      tytul: ({ miesiac }: { miesiac: string }) => `Opłacenie składek za ${miesiac}`,
      termin: ({ termin }: { termin: string }) => `Termin: ${termin}. Kogo dotyczy: matka.`,
      zrodloZus: ({ data }: { data: string }) => `Źródło: konto ZUS – stan rozliczeń składek z ${data} bez zadłużenia.`,
      zrodloRodzica: ({ data }: { data: string }) => `Źródło: Twoja odpowiedź z ${data}.`,
      nastepna: ({ miesiac, utworzenie, termin }: { miesiac: string; utworzenie: string; termin: string }) =>
        `Sprawę Opłacenie składek za ${miesiac} dodamy do planu ${utworzenie}, z terminem ${termin}.`,
    },
    straznik: {
      tytul: "Strażnik ubezpieczenia chorobowego",
      liczbaOstrzezen: ({ liczba }: { liczba: string }) => `Ostrzeżenia: ${liczba}`,
      wstepJdg: "Do porodu pilnujemy Twojego dobrowolnego ubezpieczenia chorobowego. Bez niego nie dostaniesz zasiłku macierzyńskiego.",
      wstepUz: "Do porodu pilnujemy Twojego dobrowolnego ubezpieczenia chorobowego z umowy zlecenia. Bez niego nie dostaniesz zasiłku macierzyńskiego.",
      wstepDrugiRodzic: ({ osoba }: { osoba: string }) =>
        `Do porodu pilnujemy dobrowolnego ubezpieczenia chorobowego ${osoba}. Bez niego nie dostanie zasiłku macierzyńskiego.`,
      matkiDomyslnie: "matki",
      stanNa: ({ data }: { data: string }) => `Stan na ${data} – dane z konta ZUS`,
      brakDanychZus: "Nie mamy jeszcze danych z konta ZUS. Sprawdzimy ubezpieczenie po następnym odczycie danych.",
      duch: "Dobrowolne ubezpieczenie chorobowe",
      aktywne: "Aktywne",
      nieaktywne: "Brak",
      aktywneStanNa: ({ data }: { data: string }) => `Aktywne – stan na ${data}`,
      tytulUbezpieczenia: "Tytuł ubezpieczenia",
      tytulJdg: "Prowadzenie pozarolniczej działalności",
      tytulUz: "Umowa zlecenia",
      zadluzenie: "Zadłużenie z tytułu składek",
      prog: "Próg zadłużenia",
      brakWartosci: "-",
      opiekaSkladek: ({ prog }: { prog: string }) =>
        `Opłacaj składki do 20. dnia każdego miesiąca. Nieopłacenie składki w terminie powoduje ustanie dobrowolnego ubezpieczenia chorobowego. Zadłużenie z tytułu składek wyższe niż ${prog} w dniu powstania prawa do zasiłku odbiera prawo do zasiłku do czasu spłaty całego zadłużenia.`,
      brakDuchJdg: ({ data }: { data: string }) =>
        `Nie masz aktywnego dobrowolnego ubezpieczenia chorobowego. W danych z konta ZUS z ${data} nie ma go już przy tytule osoby prowadzącej pozarolniczą działalność. Bez tego ubezpieczenia nie dostaniesz zasiłku macierzyńskiego.`,
      brakDuchUz: ({ data }: { data: string }) =>
        `Nie masz aktywnego dobrowolnego ubezpieczenia chorobowego. W danych z konta ZUS z ${data} nie ma go już przy tytule zleceniobiorcy. Bez tego ubezpieczenia nie dostaniesz zasiłku macierzyńskiego.`,
      daneZus: "Dane z konta ZUS",
      profil: "Twój profil rodziny",
      brakDuchZusJdg: "Brak dobrowolnego ubezpieczenia chorobowego",
      brakDuchZusUz: "Umowa zlecenia bez dobrowolnego ubezpieczenia chorobowego",
      profilDuchTak: "Dobrowolne ubezpieczenie chorobowe: tak",
      podwyzszenie: ({ procent }: { procent: string }) =>
        `ZUS może zakwestionować gwałtowne podwyższenie podstawy wymiaru składek tuż przed porodem. Twoja ostatnia podstawa jest o ${procent} wyższa niż średnia z poprzednich 11 miesięcy.`,
      podstawy: {
        podpis: "Podstawa wymiaru składek przed porodem",
        przewijanie: "Tabela podstaw wymiaru składek",
        kolPodstawa: "Podstawa wymiaru składek",
        kolKwota: "Kwota",
        srednia: ({ od, doMiesiaca }: { od: string; doMiesiaca: string }) => `Średnia z 11 miesięcy (${od} – ${doMiesiaca})`,
        wzrost: "Wzrost",
        wzrostWartosc: ({ kwota, procent }: { kwota: string; procent: string }) => `${kwota} (${procent})`,
      },
      zadluzeniePonadProg: ({ data, kwota, prog }: { data: string; kwota: string; prog: string }) =>
        `Stan rozliczeń składek z ${data} pokazuje zadłużenie ${kwota}. Zadłużenie wyższe niż ${prog} w dniu powstania prawa do zasiłku odbiera prawo do zasiłku do czasu spłaty całości zadłużenia.`,
      potwierdz: "Potwierdź opłacenie składek",
      sprawdzStan: "Sprawdź stan rozliczeń składek",
      tylkoNaKoncieMatki: ({ osoba }: { osoba: string }) =>
        `Stan rozliczeń składek i potwierdzenie opłacenia składek są dostępne tylko na koncie ${osoba}.`,
      kontaMatkiDomyslnie: "matki",
    },
    ezla: {
      opis: "Okresy niezdolności do pracy w ciąży i wykorzystany okres zasiłkowy sprawdzisz w zaświadczeniach lekarskich.",
      kafelek: "Zaświadczenia lekarskie e-ZLA",
    },
    kalkulator: {
      opis: "Policz, ile wyniesie zasiłek macierzyński i jak rozłożyć urlopy między rodziców.",
      kafelek: "Kalkulator zasiłku",
    },
    bezBecikowego: ({ dochod }: { dochod: string }) =>
      `Becikowego i dodatku z tytułu urodzenia dziecka nie ma w planie, bo dochód na osobę ${dochod} przekracza progi dochodowe.`,
    najblizszeTerminy: {
      tytul: "Najbliższe terminy",
      wszystkie: "Wszystkie terminy",
      ptp: "Przewidywany termin porodu",
      ptpOpis: "Terminy spraw po porodzie policzymy od daty porodu.",
      dodamy: ({ data }: { data: string }) => `Sprawę dodamy do planu ${data}.`,
      brak: "Nie masz terminów w najbliższym czasie.",
    },
    naSkroty: {
      tytul: "Na skróty",
      przykladoweSprawy: "Przykładowe sprawy ZUS",
      terminy: "Terminy",
    },
    daneProfilu: {
      tytul: "Dane, z których powstał plan",
      matka: "Matka",
      formaMatki: "Forma zatrudnienia matki",
      duch: "Dobrowolne ubezpieczenie chorobowe",
      drugiRodzic: "Drugi rodzic",
      stanCywilny: "Stan cywilny rodziców",
      ptp: "Przewidywany termin porodu",
      dataPorodu: "Data porodu",
      wizyta: "Pierwsza wizyta u lekarza albo położnej",
      brakWizyty: "Wizyta jeszcze się nie odbyła",
      dochod: "Dochód na osobę",
      dochodNieznany: "Nieznany",
      liczbaDzieci: "Liczba dzieci z ciąży",
      tak: "Tak",
      nie: "Nie",
      brakWartosci: "-",
      zZrodlem: ({ wartosc, zrodlo }: { wartosc: string; zrodlo: string }) => `${wartosc} – ${zrodlo}`,
      zrodla: {
        "konto-zus": "dane z konta ZUS",
        "pelnomocnictwo-pel": "dane z pełnomocnictwa PEL",
        "odpowiedz-rodzica": "Twoja odpowiedź",
      },
      osobaZForma: ({ osoba, forma }: { osoba: string; forma: string }) => `${osoba}, ${forma}`,
      stanyCywilne: { malzenstwo: "Małżeństwo", "nie-malzenstwo": "Rodzice nie są małżeństwem" },
      przelicz: "Zmień dane w profilu, a plan przeliczymy ponownie. Sprawy złożone i załatwione zachowają status.",
    },
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      jdg: "Jednoosobowa działalność gospodarcza",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "brak-drugiego-rodzica": "Brak drugiego rodzica",
    },
    zmiany: {
      tytul: "Co się zmieniło w planie",
      podpis: "Zmiany w planie po ostatnim przeliczeniu",
      przewijanie: "Tabela zmian w planie",
      kolSprawa: "Sprawa",
      kolZmiana: "Zmiana",
      rodzaje: {
        dodana: "Dodana",
        usunieta: "Usunięta",
        "zmieniona-kwota": "Zmieniona kwota",
        "zmieniony-status": "Zmieniony status",
        "zmieniony-termin": "Zmieniony termin",
      },
    },
    // koniec ViewFamilyPlan
  },
  ViewPregnancyBenefits: {
    tytulStrony: "Świadczenia w ciąży",
    naglowek: "Świadczenia w ciąży",
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
      // koniec sekcjaPrawoWCiazy
    },
    sekcjaZaswiadczeniaEzla: {
      // koniec sekcjaZaswiadczeniaEzla
    },
    sekcjaStanRozliczen: {
      // koniec sekcjaStanRozliczen
    },
    sekcjaOstrzezeniaRyzyk: {
      zobaczSzczegoly: "Zobacz szczegóły ryzyka",
      // koniec sekcjaOstrzezeniaRyzyk
    },
    sekcjaOchronaK30: {
      przedluzenie: {
        tytul: "Czy Twoja umowa przedłuży się do dnia porodu",
        wstep: ({ data }: { data: string }) =>
          `Twoja umowa o pracę kończy się ${data}, bo jest umową na czas określony albo na okres próbny. Taka umowa przedłuża się do dnia porodu, jeśli skończyłaby się po upływie trzeciego miesiąca ciąży.`,
        wybierz: "Wybierz rodzaj umowy, a sprawdzimy to.",
        sprawdzono: {
          kobieta: "Sprawdziliśmy to na podstawie rodzaju umowy, który wybrałaś.",
          mezczyzna: "Sprawdziliśmy to na podstawie rodzaju umowy, który wybrałeś.",
        },
        koniecUmowy: "Koniec umowy",
        uplywTrzeciegoMiesiaca: "Upływ trzeciego miesiąca ciąży",
        legenda: "Rodzaj umowy",
        rodzaje: {
          "czas-okreslony": "Umowa na czas określony",
          zastepstwo: "Umowa na czas określony w celu zastępstwa",
          "probna-dluzsza": "Umowa na okres próbny przekraczający miesiąc",
          "probna-krotsza": "Umowa na okres próbny do miesiąca",
        },
        zapisz: "Zapisz rodzaj umowy",
        notatka: "Rodzaj umowy zapiszemy w profilu rodziny jako Twoją odpowiedź i przeliczymy plan.",
        rodzajUmowy: "Rodzaj umowy",
        odpowiedz: ({ rodzaj }: { rodzaj: string }) => `${rodzaj} – Twoja odpowiedź`,
        przewidywanyTerminPorodu: "Przewidywany termin porodu:",
        dzienPorodu: "Dzień porodu:",
        zachowajUbezpieczenie: "Zobacz, jak zachować ubezpieczenie",
        zmienRodzaj: "Zmień rodzaj umowy",
      },
      okresy: {
        tytul: "Okresy ochrony z Twoich wniosków",
        wstep: {
          kobieta: "Liczymy je z wniosków o urlop, które wysłałaś do pracodawcy.",
          mezczyzna: "Liczymy je z wniosków o urlop, które wysłałeś do pracodawcy.",
        },
        wniosek: ({ rodzaj }: { rodzaj: string }) => `Wniosek o ${rodzaj}`,
        rodzajeUrlopu: {
          macierzynski: "urlop macierzyński",
          "czesc-przed-porodem": "część urlopu macierzyńskiego przed porodem",
          rodzicielski: "urlop rodzicielski",
          uzupelniajacy: "uzupełniający urlop macierzyński",
          ojcowski: "urlop ojcowski",
          "na-warunkach-macierzynskiego": "urlop na warunkach urlopu macierzyńskiego",
          "przejety-macierzynski": "pozostałą część urlopu macierzyńskiego",
          "laczenie-z-praca": "urlop rodzicielski połączony z pracą",
        },
        szczegoly: ({ dataZlozenia, od, do: koniec }: { dataZlozenia: string; od: string; do: string }) =>
          `Złożony pracodawcy ${dataZlozenia}. Urlop od ${od} do ${koniec}.`,
        brak: "Tu zobaczysz okres ochrony dla każdego wniosku o urlop, który wyślesz do pracodawcy.",
        twojeWnioski: "Zobacz Twoje wnioski",
      },
      ochrona: {
        tytul: "Kiedy pracodawca nie może rozwiązać Twojej umowy",
        wstep:
          "Pracodawca nie może prowadzić przygotowań do wypowiedzenia ani do rozwiązania umowy o pracę bez wypowiedzenia ani wypowiedzieć albo rozwiązać umowy o pracę:",
        zasady: [
          "w okresie ciąży,",
          "w czasie urlopu macierzyńskiego,",
          "od dnia złożenia wniosku o urlop macierzyński albo jego część, urlop na warunkach urlopu macierzyńskiego albo jego część, uzupełniający urlop macierzyński, urlop ojcowski albo jego część i urlop rodzicielski albo jego część do dnia zakończenia tego urlopu.",
        ],
        wyjatkiTytul: "Wyjątki",
        wyjatki: [
          "przyczyny uzasadniające rozwiązanie umowy bez wypowiedzenia z winy pracownika, gdy reprezentująca go zakładowa organizacja związkowa zgodzi się na rozwiązanie umowy,",
          "wypowiedzenie przy upadłości albo likwidacji pracodawcy.",
        ],
        wczesniejTytul: "Wniosek o urlop złożony wcześniej",
        wczesniejWstep: "Gdy złożysz wniosek wcześniej, ochrona zaczyna się najwcześniej:",
        tabelaPodpis: "Początek szczególnej ochrony według rodzaju urlopu",
        tabelaPrzewijanie: "Tabela początku szczególnej ochrony",
        kolumnaRodzaj: "Rodzaj urlopu",
        kolumnaOd: "Ochrona od",
        wiersze: [
          { rodzaj: "Część urlopu macierzyńskiego albo urlopu na warunkach urlopu macierzyńskiego", od: "14. dnia przed rozpoczęciem urlopu" },
          { rodzaj: "Uzupełniający urlop macierzyński albo urlop rodzicielski", od: "21. dnia przed rozpoczęciem urlopu" },
          { rodzaj: "Urlop ojcowski", od: "7. dnia przed rozpoczęciem urlopu" },
        ],
        sporneTytul: "Sprawy sporne",
        sporne: "W sprawach spornych zwróć się do Państwowej Inspekcji Pracy i do sądu pracy.",
        pip: "Rodzicielstwo – porady prawne Państwowej Inspekcji Pracy",
      },
      rodzice: {
        matka: "Matka",
        "drugi-rodzic": "Drugi rodzic",
      },
      ochronaRodzica: ({ rodzic }: { rodzic: string }) => `Szczególna ochrona: ${rodzic}`,
      notatkaDrugiegoRodzica: ({ imieINazwisko, forma }: { imieINazwisko: string; forma: string }) =>
        `Sprawa dotyczy Ciebie, bo pracujesz na umowie o pracę. ${imieINazwisko} ${forma}, więc szczególna ochrona pracownika jej nie obejmuje.`,
      formyMatki: {
        jdg: "prowadzi jednoosobową działalność gospodarczą",
        "umowa-zlecenia": "pracuje na umowie zlecenia",
        "brak-tytulu": "nie ma tytułu do ubezpieczenia",
      },
      // koniec sekcjaOchronaK30
    },
    sekcjaWsparcieK35: {
      tytul: "Organizacje, które pomagają rodzicom",
      opis: ({ sytuacja }: { sytuacja: string }) =>
        `Organizacje charytatywne wspierają rodziców ${sytuacja}. Zobaczysz, w czym pomagają i jak się z nimi skontaktować.`,
      opisOgolny: "Organizacje charytatywne wspierają rodziców w trudnych chwilach. Zobaczysz, w czym pomagają i jak się z nimi skontaktować.",
      sytuacjeWOpisie: {
        "martwe-urodzenie": "po urodzeniu martwego dziecka",
        poronienie: "po poronieniu",
        "zgon-dziecka": "po śmierci dziecka",
        "przedwczesny-porod": "po przedwczesnym porodzie",
        "choroba-dziecka": "w czasie ciężkiej choroby dziecka",
        szpital: "w czasie pobytu matki w szpitalu",
        orzeczenie: "po orzeczeniu o niezdolności matki do samodzielnej egzystencji",
        porzucenie: "po porzuceniu dziecka przez matkę",
        "smierc-matki": "po śmierci matki",
      },
      zobaczOrganizacje: "Zobacz organizacje",
      sytuacjaWProfilu: "Sytuacja w profilu",
      rodzajSytuacji: "Rodzaj sytuacji",
      dataZdarzenia: "Data zdarzenia",
      dataPorodu: "Data porodu",
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
      tytul: "Opłacenie składek",
      miesiac: "Miesiąc składek",
      termin: "Termin opłacenia",
      opis: "Opłacaj składki do 20. dnia każdego miesiąca. Nieopłacenie składki w terminie powoduje ustanie dobrowolnego ubezpieczenia chorobowego.",
      // koniec sekcjaStraznikOplacenieSkladek
    },
    // Widok szczegółów sprawy (u12)
    nieZnaleziono: "Nie znaleźliśmy tej sprawy w planie Twojej rodziny.",
    przejdzDoPlanu: "Przejdź do planu rodziny",
    szczegoly: {
      tytul: "Szczegóły sprawy",
      rodzaj: "Rodzaj",
      etap: "Etap",
      kogo: "Kogo dotyczy",
      status: "Status",
      instytucja: "Instytucja",
      liczbaDzieci: "Liczba dzieci",
      kwota: "Kwota",
      kanal: "Kanał",
      osoba: ({ rodzic, osoba }: { rodzic: string; osoba: string }) => `${rodzic} – ${osoba}`,
      kwotaNaDziecko: ({ kwota }: { kwota: string }) => `${kwota} na dziecko`,
      instytucjaOplacenia: "Zakład Ubezpieczeń Społecznych (ZUS)",
      kanalOplacenia: "Przelew na indywidualny rachunek składkowy",
    },
    rodzaje: {
      swiadczenie: "Świadczenie pieniężne",
      uprawnienie: "Uprawnienie",
      obowiazek: "Obowiązek",
      informacja: "Informacja",
    },
    kanaly: {
      kreatory: {
        ViewZamLeaveType: "Kreator wniosku o zasiłek macierzyński w przewodniku",
        ViewLeaveRequestType: "Kreator wniosku o urlop do pracodawcy w przewodniku",
        ViewZas53Start: "Kreator wniosku o zasiłek chorobowy ZAS-53 w przewodniku",
        ViewBirthCertificateRequest: "Kreator wniosku o odpis aktu urodzenia w przewodniku",
      } as Readonly<Record<string, string>>,
      kreator: "Kreator wniosku w przewodniku",
      zewnetrzne: {
        ezus: "Wniosek przez internet w eZUS",
        empatia: "Wniosek przez internet w Emp@tii",
        mobywatel: "Usługa w aplikacji mObywatel",
        "gov-rejestr-stanu-cywilnego": "Wniosek przez internet na gov.pl",
        "gov-zgloszenie-urodzenia": "Zgłoszenie przez internet na gov.pl",
      },
      uPracodawcy: "Wniosek u pracodawcy",
      informacja: "Informacja w przewodniku",
    },
    dlaczego: {
      tytul: "Dlaczego ta sprawa Cię dotyczy",
      wstep: "Twoja rodzina spełnia warunek tej sprawy:",
      podpis: "Dane w profilu rodziny, z których wynika sprawa",
      przewijanie: "Tabela danych w profilu rodziny",
      kolDane: "Dane w profilu rodziny",
      kolWartosc: "Wartość",
      kolZrodlo: "Źródło",
      notaPrzed: "Dane się nie zgadzają?",
      notaPo: "i popraw je – plan przeliczymy ponownie.",
    },
    warunki: {
      matkaJdgDuch: "Matka prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym.",
      matkaUzDuch: "Matka wykonuje umowę zlecenia z dobrowolnym ubezpieczeniem chorobowym.",
      matkaUop: "Matka pracuje na umowie o pracę.",
      matkaUstanie: "Umowa o pracę matki ustała w ciąży z przyczyny, która daje prawo do zasiłku macierzyńskiego.",
      drUop: "Drugi rodzic pracuje na umowie o pracę.",
      drUzDuch: "Drugi rodzic wykonuje umowę zlecenia z dobrowolnym ubezpieczeniem chorobowym.",
      drJdgDuch: "Drugi rodzic prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym.",
      urodzone: "Dziecko się urodziło albo urodzi się w przewidywanym terminie porodu.",
    },
    daneProfilu: {
      formaMatki: "Forma zatrudnienia matki",
      formaDrugiego: "Forma zatrudnienia drugiego rodzica",
      duchMatki: "Dobrowolne ubezpieczenie chorobowe matki",
      duchDrugiego: "Dobrowolne ubezpieczenie chorobowe drugiego rodzica",
      ptp: "Przewidywany termin porodu",
      dataPorodu: "Data porodu",
      dochod: "Dochód na osobę",
      stanCywilny: "Stan cywilny rodziców",
      zrodla: {
        "konto-zus": "Konto ZUS",
        "pelnomocnictwo-pel": "Pełnomocnictwo PEL",
        "odpowiedz-rodzica": "Twoja odpowiedź",
      },
    },
    brakuje: {
      tytul: "Czego brakuje w profilu",
      wstep: "Warunek tej sprawy:",
      opis: "Żeby sprawdzić ten warunek, potrzebujemy danych o ciąży i dziecku. Zapiszemy je dopiero po udzieleniu zgody na dane dotyczące zdrowia.",
      podpis: "Dane w profilu rodziny potrzebne do sprawdzenia warunku",
      zgoda: "Zgoda na dane dotyczące zdrowia",
      ptp: "Przewidywany termin porodu",
      dataPorodu: "Data porodu i liczba dzieci",
      stanyZgody: {
        "brak-decyzji": "Brak decyzji",
        udzielona: "Udzielona",
        odmowa: "Odmowa",
        wycofana: "Wycofana",
      },
      uzupelnij: "Uzupełnij profil rodziny",
    },
    jak: {
      tytul: "Jak załatwić sprawę",
      opis: "Instrukcja powie Ci krok po kroku, co przygotować i gdzie załatwić sprawę.",
      opisPoPorodzie: "Instrukcję zobaczysz już teraz, a sprawę załatwisz po porodzie.",
      przejdz: "Przejdź do instrukcji",
    },
    skladki: {
      tytul: "Twoje składki",
      opis: ({ prog }: { prog: string }) =>
        `Zasiłek przysługuje, gdy w dniu powstania prawa zadłużenie z tytułu składek nie przekracza ${prog}.`,
      kafelek: "Stan rozliczeń składek",
    },
    ezla: {
      tytul: "Zaświadczenia lekarskie",
      kafelek: "Zaświadczenia lekarskie e-ZLA",
    },
    // koniec ViewCaseDetails
  },
  ViewCaseGuide: {
    tytulStrony: "Instrukcja sprawy",
    naglowek: "Instrukcja sprawy",
    // Sekcje sprawy/[idSprawy]/instrukcja/_sekcje (u27, u28, u34, u26, u26, u20, u30, u29, u29)
    sekcjaAkcjaWnioskuZam: {
      wypelnij: "Wypełnij wniosek",
      wrocDoWniosku: "Wróć do wniosku",
      opis: "Kreator wniosku otworzy się w przewodniku, nie musisz logować się do innego serwisu.",
      szkic: ({ data }: { data: string }) =>
        `Masz szkic wniosku zapisany ${data}. Wrócisz do ostatniego kroku z zachowanymi odpowiedziami.`,
      wyslany: ({ data, numer }: { data: string; numer: string }) => `Wniosek wysłany ${data}, numer potwierdzenia ${numer}.`,
      zobaczPotwierdzenie: "Zobacz potwierdzenie",
      // koniec sekcjaAkcjaWnioskuZam
    },
    sekcjaAkcjaWnioskuOUrlop: {
      // koniec sekcjaAkcjaWnioskuOUrlop
    },
    sekcjaAkcjaRezygnacjiIPrzejecia: {
      // koniec sekcjaAkcjaRezygnacjiIPrzejecia
    },
    sekcjaAkcjaWariantu: {
      // koniec sekcjaAkcjaWariantu
    },
    sekcjaAkcjaPodzialuUrlopu: {
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
    // u17: treść instrukcji sprawy
    powrotDoSprawy: "Szczegóły sprawy",
    powrotDoTerminow: "Terminy",
    brakSprawy: "Nie znaleźliśmy tej sprawy w Twoim planie rodziny.",
    przejdzDoPlanu: "Przejdź do planu rodziny",
    kartaNajwazniejsze: "Najważniejsze informacje",
    kartaKroki: "Krok po kroku",
    kartaCoPrzygotowac: "Co przygotować",
    kartaWiecejInformacji: "Więcej informacji",
    etykietaKolumnyBocznej: "Co przygotować do sprawy",
    brakKrokow: "Kroki tej sprawy pokażemy, gdy pojawią się w katalogu świadczeń.",
    wstepFormy: {
      "umowa-o-prace": "Pracujesz na umowie o pracę.",
      "umowa-zlecenia": "Wykonujesz umowę zlecenia.",
      jdg: "Prowadzisz jednoosobową działalność gospodarczą.",
      "brak-tytulu": "Nie masz tytułu do ubezpieczenia.",
    },
    termin: "Termin",
    bezTerminu: "Bez terminu",
    sprawaBezTerminu: "Sprawa nie ma terminu w kalendarzu",
    terminSzacowany: ({ opis }: { opis: string }) => `Szacowany, ${opis}`,
    nieprzypominamyZlozona: "Nie przypominamy, wniosek złożony",
    nieprzypominamyZalatwiona: "Nie przypominamy, sprawa załatwiona",
    instytucja: "Instytucja",
    kanal: "Kanał",
    instytucjaIKanal: "Instytucja i kanał",
    status: "Status",
    rodzajSprawy: ({ rodzaj }: { rodzaj: string }) => `Rodzaj sprawy: ${rodzaj}`,
    oznaczono: ({ data }: { data: string }) => `Oznaczono ${data}`,
    rodzajePozycji: {
      swiadczenie: "świadczenie",
      uprawnienie: "uprawnienie",
      obowiazek: "obowiązek",
      informacja: "informacja",
    },
    // Instytucja i kanał według wybranego kanału
    opisyKanalow: {
      zam: {
        kanal: "Kreator wniosku w przewodniku",
        kanalPodpis: "Wniosek o zasiłek macierzyński (ZAM)",
      },
      zas53: {
        instytucja: "ZUS",
        instytucjaPodpis: "Wypłaca Ci zasiłek",
        kanal: "Kreator wniosku w przewodniku",
        kanalPodpis: "Wniosek o zasiłek chorobowy (ZAS-53)",
      },
      ezus: {
        instytucja: "ZUS",
        instytucjaPodpis: "Zakład Ubezpieczeń Społecznych",
        kanal: "eZUS",
        kanalPodpis: "Przez internet, po zalogowaniu do eZUS",
      },
      empatia: {
        instytucja: "Gmina albo MOPS",
        instytucjaPodpis: "W miejscu Twojego zamieszkania",
        kanal: "Emp@tia",
        kanalPodpis: "Przez internet albo osobiście w urzędzie",
      },
      mobywatel: {
        instytucja: "Urząd stanu cywilnego",
        instytucjaPodpis: "Właściwy dla miejsca urodzenia dziecka",
        kanal: "mObywatel albo gov.pl",
        kanalPodpis: "Przez internet albo osobiście w urzędzie",
      },
      "gov-rejestr-stanu-cywilnego": {
        instytucja: "Urząd stanu cywilnego",
        instytucjaPodpis: "Wniosek przez rejestr stanu cywilnego",
        kanal: "gov.pl",
        kanalPodpis: "Przez internet albo osobiście w urzędzie",
      },
      pracodawca: {
        instytucja: "Pracodawca",
        kanal: "Dział kadr",
        kanalPodpis: "Osobiście albo w sposób przyjęty w firmie",
      },
      zleceniodawca: {
        instytucja: "Zleceniodawca",
        kanal: "Osoba, która prowadzi Twoją umowę",
        kanalPodpis: "Osobiście albo w sposób przyjęty u zleceniodawcy",
      },
      informacja: {
        wartosc: "Informacja w przewodniku",
        podpis: "Nie składasz wniosku",
      },
    },
    instytucjaPlatnika: {
      zus: "ZUS",
      zusPodpis: "Zasiłek wypłaca Ci ZUS",
      platnikSkladek: "Płatnik składek",
      platnikSkladekPodpis: "Zasiłek wypłaca Ci płatnik składek",
      nieustalony: "Do ustalenia",
      nieustalonyPodpis: "ZUS albo płatnik składek, zależy od płatnika zasiłku",
    },
    // Akcje przejścia do kanału
    akcjaKreatorZam: "Wypełnij wniosek",
    akcjaKreatorZas53: "Wypełnij wniosek ZAS-53",
    akcjeZewnetrzne: {
      ezus: "Przejdź do eZUS",
      empatia: "Przejdź do Emp@tii",
      mobywatel: "Przejdź do zgłoszenia urodzenia",
      "gov-zgloszenie-urodzenia": "Przejdź do zgłoszenia urodzenia",
      "gov-rejestr-stanu-cywilnego": "Przejdź do rejestru stanu cywilnego",
    },
    akcjeZewnetrzneEzus: {
      K12: "Złóż wniosek o 800+ w eZUS",
      K13: "Złóż wniosek o 800+ w eZUS",
      K18: "Złóż wniosek Aktywny Rodzic w eZUS",
    },
    sprawdzWKanale: {
      ezus: "Sprawdź wniosek w eZUS",
      empatia: "Sprawdź wniosek w Emp@tii",
      mobywatel: "Sprawdź zgłoszenie w mObywatelu",
      "gov-zgloszenie-urodzenia": "Sprawdź zgłoszenie na gov.pl",
      "gov-rejestr-stanu-cywilnego": "Sprawdź wniosek na gov.pl",
    },
    oznaczJakoZlozona: "Oznacz jako złożoną",
    oznaczJakoZalatwiona: "Oznacz jako załatwioną",
    cofnijOznaczenie: "Cofnij oznaczenie",
    przejdzDoSwiadczeniaRodzicielskiego: "Przejdź do sprawy Świadczenie rodzicielskie",
    // Notatki pod akcjami
    notatkaKreator: "Kreator wniosku otworzy się w przewodniku, więc nie musisz logować się do innego serwisu.",
    notatkaZewnetrzny: ({ kanal }: { kanal: string }) =>
      `${kanal} otworzy się w nowej karcie. Gdy wrócisz do przewodnika, zapytamy, czy udało się załatwić sprawę.`,
    notatkaMobywatel:
      "Na telefonie z aplikacją mObywatel otworzy się aplikacja. Bez aplikacji usługa zgłoszenia urodzenia otworzy się w nowej karcie przeglądarki. Gdy wrócisz, zapytamy, czy udało się zgłosić urodzenie.",
    notatkaPracodawca: "Tę sprawę załatwiasz u pracodawcy, dlatego nie ma tu przejścia do serwisu internetowego.",
    notatkaZleceniodawca: "Tę sprawę załatwiasz u zleceniodawcy, dlatego nie ma tu przejścia do serwisu internetowego.",
    notatkaK05Pracownik:
      "Przekaż pracodawcy albo zleceniodawcy dane dziecka: imię, nazwisko, datę urodzenia i numer PESEL. Pracodawca albo zleceniodawca zgłosi dziecko do ubezpieczenia zdrowotnego w ZUS.",
    notatkaBezKanalu: "Tę sprawę załatwiasz osobiście, dlatego nie ma tu przejścia do serwisu internetowego.",
    notatkaInformacja: "Oznacz sprawę jako załatwioną, gdy przeczytasz informację. Zniknie z listy spraw do zrobienia.",
    notatkaPoOznaczeniu:
      "Kalendarz nie pokazuje już terminu tej sprawy. Sprawa oznaczona przez pomyłkę? Cofnij oznaczenie, a wróci do spraw do zrobienia.",
    // Co przygotować
    daneIDokumenty: "Dane i dokumenty",
    dokumentyIAdresat: "Dokumenty i adresat wniosku",
    dokumenty: "Dokumenty",
    adresatWniosku: "Adresat wniosku",
    adresatZus: "ZUS",
    adresatPlatnik: "Płatnik składek",
    platnikWProfilu: ({ platnik }: { platnik: string }) => `Płatnik zasiłku w Twoim profilu: ${platnik}.`,
    odpowiedzOPlatnika: "Odpowiedz na pytanie o płatnika",
    brakDokumentowWSlowniku: "Listę dokumentów pokażemy, gdy pojawi się w słowniku dokumentów katalogu świadczeń.",
    serwisyWNowejKarcie: "Serwisy otworzą się w nowej karcie.",
    // Nazwy kanałów w mianowniku i dopełniaczu
    nazwyKanalow: {
      ezus: "eZUS",
      empatia: "Emp@tia",
      mobywatel: "Aplikacja mObywatel",
      "gov-zgloszenie-urodzenia": "Usługa zgłoszenia urodzenia",
      "gov-rejestr-stanu-cywilnego": "Rejestr stanu cywilnego",
      "pue-ezus": "eZUS",
      "e-wizyta": "e-wizyta w ZUS",
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
    tytulKarty: "Wnioski złożone, przygotowane i wysłane w przewodniku",
    licznik: "Wnioski:",
    podpis: "Wnioski konta od najnowszego",
    przewijanie: "Tabela wniosków",
    kolumny: { wniosek: "Wniosek", adresat: "Adresat", data: "Data", status: "Status" },
    rodzaje: {
      zam: "Wniosek o zasiłek macierzyński (ZAM)",
      "zas-53": "Wniosek o zasiłek chorobowy (ZAS-53)",
      "urlop-do-pracodawcy": "Wniosek o urlop do pracodawcy",
      "rezygnacja-z-czesci-zasilku": "Wniosek o rezygnację z części urlopu macierzyńskiego",
      "wniosek-ojca-o-urlop": "Wniosek ojca o urlop macierzyński",
      "odpis-aktu-urodzenia": "Wniosek o odpis aktu urodzenia",
    },
    podrodzajeUrlopu: {
      "czesc-przed-porodem": "Wniosek o część urlopu macierzyńskiego przed porodem",
      "macierzynski-z-rodzicielskim": "Wniosek o urlop macierzyński i rodzicielski",
      rodzicielski: "Wniosek o urlop rodzicielski",
      ojcowski: "Wniosek o urlop ojcowski",
      uzupelniajacy: "Wniosek o uzupełniający urlop macierzyński",
      "na-warunkach-macierzynskiego": "Wniosek o urlop na warunkach urlopu macierzyńskiego",
      "laczenie-z-praca": "Wniosek o łączenie urlopu rodzicielskiego z pracą",
      "rezygnacja-matki": "Wniosek o rezygnację z części urlopu macierzyńskiego",
      "pozostala-czesc-macierzynskiego": "Wniosek o pozostałą część urlopu macierzyńskiego",
    },
    rodzajeOdpisu: {
      skrocony: "Wniosek o odpis skrócony aktu urodzenia",
      zupelny: "Wniosek o odpis zupełny aktu urodzenia",
      wielojezyczny: "Wniosek o odpis wielojęzyczny aktu urodzenia",
    },
    adresaci: {
      zus: "ZUS",
      "platnik-skladek": "Płatnik składek",
      pracodawca: "Pracodawca",
      "rejestr-stanu-cywilnego": "Rejestr stanu cywilnego",
    },
    statusy: {
      wTrakcie: "W trakcie rozpatrywania",
      zalatwiona: "Załatwiona",
      przygotowany: "Przygotowany",
      wyslany: "Wysłany",
      zlozony: "Złożony",
    },
    statusZDanychZus: "Status z danych konta ZUS",
    sprawa: ({ tytul }: { tytul: string }) => `Sprawa: ${tytul}`,
    nota: "Data to dzień złożenia, przygotowania albo wysłania wniosku. Wniosek dla płatnika składek ma status przygotowany, a wniosek do pracodawcy status wysłany. Wybierz wniosek, żeby otworzyć sprawę, której dotyczy.",
    przejdzDoPlanu: "Przejdź do planu rodziny",
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
    wyborSytuacji: "Wybór sytuacji",
    poleSytuacji: "Sytuacja, w której szukasz pomocy",
    sytuacjeZProfilu: "Sytuacje z profilu rodziny",
    licznik: "Organizacje:",
    listaOrganizacji: "Lista organizacji wsparcia",
    sytuacje: {
      "martwe-urodzenie": "Urodzenie martwego dziecka",
      poronienie: "Poronienie potwierdzone zaświadczeniem o martwym urodzeniu",
      "zgon-dziecka": "Zgon dziecka",
      "przedwczesny-porod": "Przedwczesny poród",
      "choroba-dziecka": "Ciężka choroba dziecka",
      szpital: "Pobyt matki w szpitalu",
      orzeczenie: "Orzeczenie o niezdolności matki do samodzielnej egzystencji",
      porzucenie: "Porzucenie dziecka przez matkę",
      "smierc-matki": "Śmierć matki",
    },
    zadzwon: ({ numer }: { numer: string }) => `Zadzwoń: ${numer}`,
    napisz: ({ adres }: { adres: string }) => `Napisz: ${adres}`,
    otworzStrone: ({ adres }: { adres: string }) => `Otwórz stronę: ${adres}`,
    wrocDoSprawy: "Wróć do sprawy",
    // koniec ViewSupportOrganizations
  },
  ViewCalcMaternityInput: {
    tytulStrony: "Kalkulator zasiłku macierzyńskiego",
    naglowek: "Kalkulator zasiłku macierzyńskiego",
    // Sloty kalkulator-zasilku/_sloty (u21)
    daneZPrzykladowejSprawy: {
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
    // koniec ViewCalcMaternityVariant
  },
  ViewCalcParentalSplit: {
    tytulStrony: "Podział urlopu rodzicielskiego",
    naglowek: "Podział urlopu rodzicielskiego",
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
    // koniec ViewSampleCaseVerification
  },
  ViewZamLeaveType: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): rodzaj urlopu",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    // Teksty wspólne ekranów kreatora ZAM (u27)
    kreator: {
      powrot: "Instrukcja sprawy",
      krok: ({ krok, liczbaKrokow, nazwa }: { krok: number; liczbaKrokow: number; nazwa: string }) =>
        `Krok ${krok} z ${liczbaKrokow}: ${nazwa}`,
      zapisujemy: "Odpowiedzi zapisujemy po każdym kroku.",
      krokiWniosku: "Kroki wniosku",
      numerKroku: ({ numer, nazwa }: { numer: number; nazwa: string }) => `${numer}. ${nazwa}`,
      nazwyKrokow: {
        ViewZamLeaveType: "Rodzaj urlopu",
        ViewZamPrebirth: "Początek zasiłku",
        ViewZamPeriod: "Okres zasiłku",
        ViewZamData: "Dane",
        ViewZamStatements: "Oświadczenia",
        ViewZamSummary: "Podsumowanie",
      },
      przyciski: { wstecz: "Wstecz", zapiszDoDokonczenia: "Zapisz do dokończenia", dalej: "Dalej" },
      etykietaBocznej: "Informacje o wniosku",
      ladowanie: "Sprawdzamy, czy możesz złożyć wniosek.",
      brakWniosku: "Nie znaleźliśmy tego wniosku. Rozpocznij wniosek z instrukcji sprawy w planie rodziny.",
      przejdzDoPlanu: "Przejdź do planu rodziny",
      rodzajeUrlopu: {
        macierzynski: "Urlop macierzyński",
        "czesc-przed-porodem": "Część urlopu macierzyńskiego przed porodem",
        rodzicielski: "Urlop rodzicielski",
        uzupelniajacy: "Uzupełniający urlop macierzyński",
        ojcowski: "Urlop ojcowski",
        "na-warunkach-macierzynskiego": "Urlop na warunkach urlopu macierzyńskiego",
        "przejety-macierzynski": "Urlop macierzyński przejęty od matki",
        "laczenie-z-praca": "Urlop łączony z pracą",
      },
      rodzajeUrlopuDopelniacz: {
        macierzynski: "urlopu macierzyńskiego",
        "czesc-przed-porodem": "części urlopu macierzyńskiego przed porodem",
        rodzicielski: "urlopu rodzicielskiego",
        uzupelniajacy: "uzupełniającego urlopu macierzyńskiego",
        ojcowski: "urlopu ojcowskiego",
        "na-warunkach-macierzynskiego": "urlopu na warunkach urlopu macierzyńskiego",
        "przejety-macierzynski": "urlopu macierzyńskiego przejętego od matki",
        "laczenie-z-praca": "urlopu łączonego z pracą",
      },
      macierzynskiZCalym: "Urlop macierzyński z całym urlopem rodzicielskim",
      okres: ({ od, do_ }: { od: string; do_: string }) => `${od} – ${do_}`,
      stawka: ({ stawka }: { stawka: string }) => `${stawka} podstawy`,
      stawkaZaCalyOkres: ({ stawka }: { stawka: string }) => `${stawka} podstawy za cały okres`,
      dni: ({ liczba }: { liczba: number }) => (liczba === 1 ? "1 dzień" : `${liczba} dni`),
      liczbaDzieciNawias: ({ liczba }: { liczba: number }) => (liczba === 1 ? "1 dziecko" : `${liczba} dzieci`),
      przyLiczbieDzieci: {
        1: "przy jednym dziecku",
        2: "przy dwojgu dzieciach",
        3: "przy trojgu dzieciach",
        4: "przy czworgu dzieciach",
        5: "przy pięciorgu i więcej dzieciach",
      },
      formyZatrudnienia: {
        "umowa-o-prace": "Umowa o pracę",
        "umowa-zlecenia": "Umowa zlecenia",
        jdg: "Jednoosobowa działalność gospodarcza",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      zDobrowolnym: ({ forma }: { forma: string }) => `${forma}, dobrowolne ubezpieczenie chorobowe`,
      platnicy: {
        zus: "ZUS",
        "platnik-skladek": "Płatnik składek",
        nieustalony: "Nieustalony",
        "brak-platnika": "Brak płatnika",
      },
      role: { rodzic: "Rodzic", "drugi-rodzic": "Drugi rodzic" },
      twojWniosek: {
        tytul: "Twój wniosek",
        rodzajUrlopu: "Rodzaj urlopu",
        dataPorodu: "Data porodu",
        liczbaDzieci: "Liczba dzieci",
        platnikZasilku: "Płatnik zasiłku",
        urlopMacierzynski: "Urlop macierzyński",
        okres: "Okres",
        zasilek: "Zasiłek",
        dziecko: "Dziecko",
        zmienRodzaj: "Zmień rodzaj urlopu",
        zmienOkres: "Zmień okres zasiłku",
      },
    },
    tytulKarty: "Rodzaj urlopu",
    wstepMatki:
      "Wypełniasz tylko tę część formularza ZAM, która dotyczy wybranego urlopu. Twoje dane i dane dziecka uzupełnimy z konta ZUS i z profilu rodziny.",
    wstepDrugiegoRodzica:
      "Jako drugi rodzic wnioskujesz o zasiłek za okres urlopu ojcowskiego albo za swoją część urlopu rodzicielskiego. Wypełniasz tylko tę część formularza ZAM, która dotyczy wybranego urlopu.",
    legenda: "Jakiego urlopu dotyczy wniosek?",
    opisMacierzynski: ({ dataPorodu, tygodnie, przy }: { dataPorodu: string; tygodnie: number; przy: string }) =>
      `Od dnia porodu ${dataPorodu}, ${tygodnie} tygodni ${przy}. Zasiłek 100% podstawy albo 81,5% za cały okres, jeśli od razu obejmiesz wnioskiem urlop rodzicielski.`,
    opisMacierzynskiPrzedPorodem: ({ tygodnie, przy }: { tygodnie: number; przy: string }) =>
      `Od wybranego dnia przed porodem, ${tygodnie} tygodni ${przy}. Zasiłek 100% podstawy albo 81,5% za cały okres, jeśli od razu obejmiesz wnioskiem urlop rodzicielski.`,
    opisRodzicielski: ({ maks, data }: { maks: number; data: string }) =>
      `Do ${maks} tygodni, bezpośrednio po urlopie macierzyńskim albo w późniejszym terminie, z początkiem najpóźniej ${data}. Zasiłek 70% podstawy.`,
    opisRodzicielskiDrugiegoRodzica: "9 tygodni, które przysługują wyłącznie Tobie jako drugiemu rodzicowi. Zasiłek 70% podstawy.",
    opisUzupelniajacy: ({ tygodnie, od }: { tygodnie: number; od: string }) =>
      `Do ${tygodnie} tygodni od ${od}, dzień po końcu urlopu macierzyńskiego, zgodnie ze sprawą w Twoim planie. Zasiłek 100% podstawy.`,
    opisOjcowski: ({ data }: { data: string }) =>
      `14 dni, z początkiem najpóźniej ${data}, żeby wykorzystać urlop przed ukończeniem przez dziecko 12 miesięcy. Zasiłek 100% podstawy.`,
    opisNaWarunkach: "Urlop po przyjęciu dziecka na wychowanie. Zasiłek 100% podstawy.",
    notatka: "Cały urlop rodzicielski możesz objąć wnioskiem o urlop macierzyński. Zdecydujesz o tym w następnym kroku.",
    profil: {
      tytul: "Dane z profilu rodziny",
      twojaRola: "Twoja rola",
      dataPorodu: "Data porodu",
      potwierdzona: ({ data }: { data: string }) => `${data} (potwierdzona)`,
      przewidywanyTermin: "Przewidywany termin porodu",
      liczbaDzieci: "Liczba dzieci",
      formaZatrudnienia: "Forma zatrudnienia",
      platnikZasilku: "Płatnik zasiłku",
      link: "Profil rodziny",
    },
    kartaTerminu: {
      tytul: "Zasiłek 81,5% za cały okres",
      tresc: ({ data, dni }: { data: string; dni: string }) =>
        `Wyślij wniosek o urlop macierzyński z całym urlopem rodzicielskim do ${data}. Zostało ${dni}.`,
    },
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
    macierzynski: {
      tytul: "Okres urlopu macierzyńskiego",
      wstep: ({ przy, tygodnie }: { przy: string; tygodnie: number }) =>
        `Urlop macierzyński zaczyna się w dniu porodu. ${przy.charAt(0).toUpperCase()}${przy.slice(1)} trwa ${tygodnie} tygodni.`,
      wstepPrzedPorodem: ({ przy, tygodnie }: { przy: string; tygodnie: number }) =>
        `Urlop macierzyński zaczyna się w dniu początku zasiłku. ${przy.charAt(0).toUpperCase()}${przy.slice(1)} trwa ${tygodnie} tygodni.`,
      od: "Od",
      do: "Do",
      wymiar: "Wymiar",
      wymiarWartosc: ({ tygodnie, dzieci }: { tygodnie: number; dzieci: string }) => `${tygodnie} tygodni (${dzieci})`,
      zasilek: "Zasiłek",
      zasilek100: "100% podstawy",
      poTerminie: "O urlop rodzicielski złożysz osobny wniosek. Wybierz go jako rodzaj urlopu, gdy zdecydujesz o terminie.",
    },
    wariant: {
      tytul: "Wariant zasiłku",
      termin: ({ dni, data }: { dni: string; data: string }) =>
        `Do końca terminu na wariant 81,5% zostało ${dni}. Wyślij wniosek do ${data}.`,
      terminPrzedPorodem: "Wniosek wysyłasz przed porodem, więc możesz wybrać zasiłek 81,5% podstawy za cały okres.",
      legenda: "Czy obejmujesz wnioskiem także urlop rodzicielski?",
      caly: "Tak, wniosek z całym urlopem rodzicielskim",
      opisCaly: ({ okresMacierzynski, okresRodzicielski }: { okresMacierzynski: string; okresRodzicielski: string }) =>
        `Urlop macierzyński ${okresMacierzynski} i urlop rodzicielski ${okresRodzicielski}. Zasiłek 81,5% podstawy za cały okres, równe wypłaty przez rok.`,
      tylko: "Nie, wniosek tylko o urlop macierzyński",
      opisTylko:
        "Zasiłek 100% podstawy za urlop macierzyński. O urlop rodzicielski złożysz osobny wniosek, zasiłek za ten okres wyniesie 70% podstawy.",
      podpisTabeli: "Stawka zasiłku w obu wariantach",
      przewijanieTabeli: "Tabela stawek zasiłku w obu wariantach",
      kolumnaOkres: "Okres",
      kolumnaCaly: "Z całym urlopem rodzicielskim",
      kolumnaTylko: "Tylko urlop macierzyński",
      osobnyWniosek: "70%, osobny wniosek",
    },
    uzupelniajacy: {
      tytul: "Okres uzupełniającego urlopu macierzyńskiego",
      wstep: "Uzupełniający urlop macierzyński zaczyna się dzień po końcu urlopu macierzyńskiego. Wymiar pochodzi ze sprawy w Twoim planie.",
    },
    rodzicielski: {
      tytul: "Okres urlopu rodzicielskiego",
      legenda: "Kiedy zaczynasz urlop rodzicielski?",
      bezposrednio: "Bezpośrednio po urlopie macierzyńskim",
      bezposrednioOpis: ({ od }: { od: string }) => `Od ${od}.`,
      pozniej: "W późniejszym terminie",
      pozniejOpis: ({ data }: { data: string }) =>
        `Podaj datę początku, najpóźniej ${data}, czyli w roku, w którym dziecko kończy 6 lat.`,
      dataPoczatku: "Data początku urlopu",
      podpowiedzDaty: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}, w formacie DD.MM.RRRR`,
      tygodnie: "Liczba tygodni",
      podpowiedzTygodni: ({ maks, przy }: { maks: number; przy: string }) => `Od 1 do ${maks} tygodni ${przy}`,
      podpowiedzTygodniDrugiegoRodzica: "Od 1 do 9 tygodni",
      okres: "Okres",
      wyliczymy: "Wyliczymy po wypełnieniu pól",
      zasilek70: "70% podstawy",
    },
    ojcowski: {
      tytul: "Okres urlopu ojcowskiego",
      wstep: "Urlop ojcowski trwa 14 dni. Wykorzystasz go do ukończenia przez dziecko 12 miesięcy.",
      dataPoczatku: "Data początku urlopu",
    },
    boczna: {
      terminTytul: "Termin 21 dni",
      terminWTerminie:
        "Termin sprawdzimy jeszcze raz w dniu wysłania wniosku. Jeśli minie, wniosek obejmie tylko urlop macierzyński z zasiłkiem 100% podstawy.",
      terminMinal: ({ data }: { data: string }) =>
        `Termin na wariant 81,5% minął ${data}. Wniosek obejmie tylko urlop macierzyński z zasiłkiem 100% podstawy.`,
      wymiarTytul: "Wymiar urlopu rodzicielskiego",
      wymiarZwykly: "Przy jednym dziecku masz do 32 tygodni, przy więcej niż jednym do 34 tygodni.",
      wymiarZaZyciem: "Gdy dziecko ma zaświadczenie „Za życiem”, masz do 56 tygodni, a przy więcej niż jednym dziecku do 58 tygodni.",
      wymiarDrugiegoRodzica: "Kolejne 9 tygodni przysługuje wyłącznie drugiemu rodzicowi.",
      wymiarDlaDrugiegoRodzica: "Jako drugi rodzic masz 9 tygodni urlopu rodzicielskiego, które przysługują wyłącznie Tobie.",
    },
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
    wnioskodawca: {
      tytul: "Dane wnioskodawcy",
      wstep: "Dane pochodzą z Twojego konta ZUS, nie zmienisz ich we wniosku.",
      imieINazwisko: "Imię i nazwisko",
      pesel: "PESEL",
    },
    dziecko: {
      tytul: "Dane dziecka",
      tytulNumer: ({ numer }: { numer: number }) => `Dziecko ${numer}`,
      wstep: "Uzupełniliśmy dane z profilu rodziny. Jeśli coś zmienisz, zapiszemy to także w profilu.",
      imie: "Imię",
      nazwisko: "Nazwisko",
      pesel: "Numer PESEL",
      dataUrodzenia: "Data urodzenia",
      dataUrodzeniaWartosc: ({ data }: { data: string }) => `${data}, z profilu rodziny`,
      miejsceUrodzenia: "Miejscowość urodzenia",
      przedPorodem: "Dane dziecka przekażesz ZUS po porodzie. Przypomnimy Ci o tym przy sprawie w planie rodziny.",
    },
    rachunek: {
      tytul: "Rachunek do wypłaty zasiłku",
      numer: "Numer rachunku",
      podpowiedz: "26 cyfr, możesz wpisać je ze spacjami",
    },
    brakPesel: {
      tytul: "Nie masz jeszcze numeru PESEL dziecka?",
      tresc: "Zapisz wniosek. Wrócisz do niego z instrukcji sprawy w planie rodziny, odpowiedzi z poprzednich kroków zostaną zachowane.",
    },
    // koniec ViewZamData
  },
  ViewZamStatements: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): oświadczenia",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    tytulKarty: "Oświadczenia",
    wstep: "Składając wniosek, oświadczasz, że:",
    punkty: {
      prawda: "dane we wniosku są zgodne z prawdą,",
      okresCaly:
        "wnioskujesz o zasiłek za okres urlopu macierzyńskiego i całego urlopu rodzicielskiego bezpośrednio po nim, z zasiłkiem 81,5% podstawy za cały okres,",
      okres: ({ rodzaj, stawka }: { rodzaj: string; stawka: string }) =>
        `wnioskujesz o zasiłek za okres ${rodzaj} z zasiłkiem ${stawka} podstawy,`,
      zaZyciem: "dziecko ma zaświadczenie „Za życiem”,",
      zmiany: "poinformujesz ZUS o każdej zmianie, która wpływa na prawo do zasiłku lub jego wysokość,",
      odpowiedzialnosc: "wiesz, że za podanie nieprawdziwych danych grozi odpowiedzialność karna i zwrot nienależnie pobranego zasiłku.",
    },
    pelnaTresc: "Przeczytaj pełną treść oświadczeń",
    potwierdzam: "Potwierdzam powyższe oświadczenia",
    // koniec ViewZamStatements
  },
  ViewZamSummary: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM): podsumowanie",
    naglowek: "Wniosek o zasiłek macierzyński (ZAM)",
    wstep: "Sprawdź wniosek przed wysłaniem. Każdą sekcję możesz zmienić.",
    sekcje: {
      rodzajUrlopu: "Rodzaj urlopu",
      okresZasilku: "Okres zasiłku",
      wnioskodawcaIDziecko: "Wnioskodawca i dziecko",
      rachunek: "Rachunek do wypłaty zasiłku",
      oswiadczenia: "Oświadczenia",
      adresat: "Adresat wniosku",
    },
    zmien: "Zmień",
    zmienSekcje: ({ sekcja }: { sekcja: string }) => `Zmień sekcję ${sekcja}`,
    tabela: {
      podpis: "Okresy zasiłku",
      przewijanie: "Tabela okresów zasiłku",
      urlop: "Urlop",
      od: "Od",
      do: "Do",
      zasilek: "Zasiłek",
    },
    stawkaZasilku: ({ stawka }: { stawka: string }) => `Stawka zasiłku: ${stawka}`,
    wnioskodawca: "Wnioskodawca",
    dziecko: "Dziecko",
    imieINazwisko: "Imię i nazwisko",
    pesel: "PESEL",
    dataUrodzenia: "Data urodzenia",
    miejsceUrodzenia: "Miejscowość urodzenia",
    przewidywanyTermin: "Przewidywany termin porodu",
    potwierdzone: "Potwierdzone",
    niepotwierdzone: "Niepotwierdzone",
    trafiDo: "Wniosek trafi do",
    adresatZus: "ZUS, płatnik Twojego zasiłku",
    adresatPlatnik: ({ nazwa }: { nazwa: string }) => `Płatnik składek ${nazwa}, płatnik Twojego zasiłku`,
    adresatPlatnikBezNazwy: "Płatnik składek, płatnik Twojego zasiłku",
    bezOdpisu: "Wniosek nie wymaga skróconego odpisu aktu urodzenia. ZUS pobierze go sam na podstawie danych dziecka.",
    dokumenty: {
      "zaswiadczenie-szpitala": "zaświadczenie szpitala o pobycie dziecka",
      "zaswiadczenie-lekarskie": "zaświadczenie lekarskie o przewidywanej dacie porodu",
      "odpis-skrocony": "skrócony odpis aktu urodzenia dziecka",
    },
    wyslij: "Wyślij wniosek",
    wyslijPonownie: "Wyślij ponownie",
    przygotuj: "Przygotuj wniosek",
    poTerminie: ({ dataSzkicu, termin }: { dataSzkicu: string; termin: string }) =>
      `Nie wysłaliśmy wniosku. Szkic z ${dataSzkicu} obejmował cały urlop rodzicielski, ale termin na wariant 81,5% minął ${termin}. Wniosek obejmuje teraz tylko urlop macierzyński z zasiłkiem 100% podstawy. Sprawdź go i wyślij ponownie.`,
    boczna: {
      terminTytul: "Termin 21 dni",
      terminTresc: ({ data, dni }: { data: string; dni: string }) =>
        `Wyślij wniosek do ${data}, zostało ${dni}. Termin sprawdzimy jeszcze raz w chwili wysłania.`,
      terminPoBledzie: ({ data, dni }: { data: string; dni: string }) =>
        `Wyślij wniosek do ${data}, zostało ${dni}. Szkic jest zapisany, więc nie stracisz odpowiedzi.`,
      terminMinal: ({ data }: { data: string }) =>
        `Termin na wariant 81,5% minął ${data}. O urlop rodzicielski złożysz osobny wniosek, zasiłek za ten okres wyniesie 70% podstawy.`,
      poWyslaniuTytul: "Po wysłaniu",
      poWyslaniuTresc:
        "Dostaniesz numer potwierdzenia, a sprawa w Twoim planie będzie miała status złożona. Przypomnienia o niej wyłączymy.",
    },
    // koniec ViewZamSummary
  },
  ViewZamSent: {
    tytulStrony: "Wniosek o zasiłek macierzyński (ZAM) wysłany",
    naglowek: "Wniosek wysłany",
    powrot: "Plan rodziny",
    potwierdzenie: {
      tytul: "Potwierdzenie wysłania",
      numer: "Numer potwierdzenia",
      dataWyslania: "Data wysłania",
      adresat: "Adresat",
      adresatZus: "ZUS",
      rodzajUrlopu: "Rodzaj urlopu",
      okres: "Okres",
      zasilek: "Zasiłek",
      flaga: "Tryb demonstracyjny, numer potwierdzenia przykładowy",
    },
    sprawa: {
      tytul: "Sprawa w Twoim planie",
      nazwa: ({ id, tytul }: { id: string; tytul: string }) => `${id} ${tytul}`,
      tytulDomyslny: "Wniosek o zasiłek macierzyński",
      status: "Status: złożona. Przypomnienia o tej sprawie wyłączyliśmy.",
      przejdzDoPlanu: "Przejdź do planu rodziny",
    },
    coDalej: {
      tytul: "Co dalej",
      wyplata: "ZUS wypłaci zasiłek na rachunek:",
      numer: "Numer potwierdzenia znajdziesz też w sprawie w planie rodziny i w menu Twoje wnioski.",
    },
    przekazanie: {
      naglowek: "Dane dziecka przekazane",
      tytul: "Przekazane dane",
      data: "Data przekazania",
      dziecko: "Dziecko",
      liczbaDzieci: "Liczba urodzonych dzieci",
    },
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
      // koniec zakladkaRegul
    },
    zakladkaDokumentow: {
      // koniec zakladkaDokumentow
    },
    // koniec ViewCatalogList
  },
  ViewCatalogValueEdit: {
    tytulStrony: "Zmiana wartości w katalogu świadczeń",
    naglowek: "Zmiana wartości w katalogu świadczeń",
    // koniec ViewCatalogValueEdit
  },
  ViewCatalogItemAdd: {
    tytulStrony: "Dodaj pozycję katalogu",
    naglowek: "Dodaj pozycję katalogu",
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
    wstep:
      "Organizacje o charakterze wyłącznie charytatywnym, które wspierają rodziców w sytuacjach szczególnych. Rodzice widzą je przy sprawie Wsparcie organizacji w sytuacji szczególnej.",
    dodaj: "Dodaj organizację",
    slownik: "Słownik podmiotów wsparcia",
    licznik: "Organizacje:",
    kolumny: {
      organizacja: "Organizacja i zakres pomocy",
      sytuacje: "Sytuacje szczególne",
      kontakt: "Kontakt",
      akcje: "Akcje",
    },
    przewijanie: "Tabela słownika podmiotów wsparcia",
    telefon: ({ wartosc }: { wartosc: string }) => `Telefon: ${wartosc}`,
    email: ({ wartosc }: { wartosc: string }) => `E-mail: ${wartosc}`,
    strona: ({ wartosc }: { wartosc: string }) => `Strona: ${wartosc}`,
    brakWartosci: "-",
    zmien: "Zmień",
    zmienDane: ({ nazwa }: { nazwa: string }) => ` dane: ${nazwa}`,
    notatka:
      "Każda organizacja ma potwierdzony charakter wyłącznie charytatywny. Rodzice zobaczą zmiany przy najbliższym otwarciu listy organizacji.",
    formularz: {
      wstepNowa: "Rodzice zobaczą organizację przy sprawie Wsparcie organizacji w sytuacji szczególnej, gdy ich sytuacja jest na liście.",
      wstepEdycja: ({ nazwa }: { nazwa: string }) =>
        `${nazwa}. Rodzice zobaczą zmienione dane przy najbliższym otwarciu listy organizacji.`,
      dane: "Dane organizacji",
      nazwa: "Nazwa organizacji",
      sytuacje: "Sytuacje szczególne",
      sytuacjePodpowiedz: "Wybierz sytuacje, w których organizacja pomaga. Możesz wybrać kilka.",
      zakres: "Zakres pomocy",
      telefon: "Numer telefonu (opcjonalnie)",
      telefonPodpowiedz: "9 cyfr, możesz je poprzedzić prefiksem +48, np. 22 350 00 50.",
      email: "Adres e-mail (opcjonalnie)",
      strona: "Adres strony",
      stronaPodpowiedz: "Adres zaczyna się od https://",
      charytatywny: "Potwierdzam, że organizacja działa wyłącznie charytatywnie.",
      zapisz: "Zapisz organizację",
      anuluj: "Anuluj",
      powrot: "Podmioty wsparcia",
      nieZnaleziono: "Nie znaleźliśmy tej organizacji w słowniku podmiotów wsparcia.",
      wrocDoListy: "Wróć do listy organizacji",
    },
    // koniec ViewCatalogSupportOrganizations
  },
  ViewEzusHome: {
    tytulStrony: "eZUS",
    naglowek: "eZUS",
    wstep: "Symulowany serwis eZUS w trybie demonstracyjnym przewodnika.",
    kartaWnioski: "Wnioski o świadczenia na dziecko",
    wniosek800: "Wniosek o świadczenie wychowawcze 800+",
    wniosekAktywnyRodzic: "Wniosek o świadczenie z programu Aktywny Rodzic",
    notatka: "Po wysłaniu wniosku wróć do karty przewodnika i oznacz sprawę w instrukcji.",
    // koniec ViewEzusHome
  },
  ViewEzus800Application: {
    tytulStrony: "Wniosek o świadczenie wychowawcze 800+",
    naglowek: "Wniosek o świadczenie wychowawcze 800+",
    opis: "Wniosek o świadczenie wychowawcze 800+ składasz w ZUS przez internet. Świadczenie przysługuje na każde dziecko do ukończenia 18 lat, bez względu na dochód rodziny.",
    kroki: [
      "Sprawdź swoje dane i dane drugiego rodzica.",
      "Dodaj dane dziecka: imię, nazwisko, datę urodzenia i numer PESEL.",
      "Wpisz numer rachunku do wypłaty świadczenia.",
      "Potwierdź oświadczenia i wyślij wniosek.",
    ],
    // koniec ViewEzus800Application
  },
  ViewEzusActiveParentApplication: {
    tytulStrony: "Wniosek o świadczenie z programu Aktywny Rodzic",
    naglowek: "Wniosek o świadczenie z programu Aktywny Rodzic",
    opis: "Wniosek o świadczenie z programu Aktywny Rodzic składasz w ZUS przez internet. Wybierz jedno ze świadczeń: aktywni rodzice w pracy, aktywnie w żłobku albo aktywnie w domu.",
    kroki: [
      "Wybierz świadczenie z programu Aktywny Rodzic.",
      "Sprawdź swoje dane i dodaj dane dziecka.",
      "Wpisz numer rachunku do wypłaty świadczenia.",
      "Potwierdź oświadczenia i wyślij wniosek.",
    ],
    // koniec ViewEzusActiveParentApplication
  },
  ViewEzusApplicationDetails: {
    tytulStrony: "Szczegóły wniosku w eZUS",
    naglowek: "Szczegóły wniosku",
    numerWniosku: "Numer wniosku",
    status: "Status",
    statusWartosc: "Wniosek w trakcie rozpatrywania",
    // koniec ViewEzusApplicationDetails
  },
  ViewZusEVisit: {
    tytulStrony: "e-wizyta w ZUS",
    naglowek: "e-wizyta w ZUS",
    opis: "Symulowana rezerwacja e-wizyty w ZUS. Podczas e-wizyty rozmawiasz z pracownikiem ZUS przez internet, z obrazem i dźwiękiem.",
    // koniec ViewZusEVisit
  },
  ViewSimulatedChannel: {
    tytulStrony: "Serwis zewnętrzny",
    naglowek: "Serwis zewnętrzny",
    wstep: "Symulowany serwis instytucji w trybie demonstracyjnym przewodnika.",
    serwisy: {
      empatia: {
        naglowek: "Emp@tia",
        opis: "Portal Emp@tia przyjmuje wnioski o świadczenia z gminy albo MOPS, na przykład o becikowe, świadczenie rodzicielskie i zasiłek rodzinny. Logujesz się profilem zaufanym albo podpisem kwalifikowanym.",
      },
      mobywatel: {
        naglowek: "Aplikacja mObywatel",
        opis: "W aplikacji mObywatel zgłaszasz urodzenie dziecka. Wypełniasz formularz, wybierasz imię dziecka i podpisujesz zgłoszenie w aplikacji.",
      },
      "gov-zgloszenie-urodzenia": {
        naglowek: "Zgłoś urodzenie dziecka",
        opis: "Usługa na gov.pl pozwala zgłosić urodzenie dziecka przez internet. Logujesz się przez login.gov.pl i podpisujesz zgłoszenie profilem zaufanym, e-dowodem albo podpisem kwalifikowanym.",
      },
      "gov-rejestr-stanu-cywilnego": {
        naglowek: "Rejestr stanu cywilnego",
        opis: "Usługa na gov.pl pozwala zamówić odpis aktu urodzenia dziecka przez internet.",
      },
      "pue-ezus": {
        naglowek: "eZUS",
        opis: "Platforma Usług Elektronicznych ZUS, w której wysyłasz wnioski i wiadomości do ZUS.",
      },
    },
    notatka: "Gdy załatwisz sprawę, wróć do karty przewodnika. Zapytamy, czy udało się ją załatwić.",
    zamknij: "Zakończ i wróć do przewodnika",
    // koniec ViewSimulatedChannel
  },
  ViewAssistantChat: {
    tytulStrony: "Asystent",
    naglowek: "Asystent",
    // koniec ViewAssistantChat
  },
  // Arkusze i okna modalne
  SheetHealthDataConsent: {
    tytul: "Zgoda na dane dotyczące zdrowia",
    wstep: "Żeby wyliczyć plan rodziny, terminy i wnioski, przewodnik potrzebuje danych o ciąży, porodzie i stanie zdrowia dziecka. To dane dotyczące zdrowia, dlatego prosimy Cię o zgodę na ich przetwarzanie.",
    zakresTytul: "Zgoda obejmuje dane, które podajesz w przewodniku:",
    zakres: [
      "o ciąży, np. przewidywany termin porodu,",
      "o porodzie, np. datę porodu i tydzień ciąży w dniu porodu,",
      "o stanie zdrowia dziecka, np. masę urodzeniową i liczbę dni hospitalizacji.",
    ],
    cel: "Wykorzystamy je wyłącznie do wyliczenia planu rodziny, terminów i wniosków.",
    bezZgody: "Bez zgody przewodnik nadal działa, ale nie zapisze tych danych. Plan pokaże wtedy sprawy, które od nich nie zależą.",
    wycofanie: "Zgodę wycofasz w każdej chwili w ustawieniach przewodnika.",
    pelnaTresc: ({ wersja }: { wersja: string }) => `Przeczytaj pełną treść zgody (wersja ${wersja})`,
    udziel: "Udziel zgody",
    kontynuujBezZgody: "Kontynuuj bez zgody",
    // koniec SheetHealthDataConsent
  },
  ModalConsentText: {
    tytul: "Pełna treść zgody",
    opis: ({ wersja }: { wersja: string }) =>
      `Zgoda na przetwarzanie danych dotyczących zdrowia w przewodniku rodzica, wersja ${wersja}`,
    etykietaTresci: ({ wersja }: { wersja: string }) => `Treść zgody, wersja ${wersja}`,
    punkty: [
      {
        tytul: "1. Kto przetwarza Twoje dane",
        tresc: "[Administrator danych i jego dane kontaktowe, z dokumentu zgody w wersji 1.0]",
      },
      {
        tytul: "2. Jakie dane obejmuje zgoda",
        tresc: "Zgoda obejmuje dane dotyczące zdrowia, które podajesz w przewodniku rodzica: dane o ciąży, porodzie i stanie zdrowia dziecka, na przykład przewidywany termin porodu, datę porodu, tydzień ciąży w dniu porodu, masę urodzeniową dziecka i liczbę dni hospitalizacji.",
      },
      {
        tytul: "3. W jakim celu wykorzystujemy dane",
        tresc: "Dane wykorzystujemy wyłącznie do wyliczenia planu rodziny, terminów i wniosków w przewodniku.",
      },
      {
        tytul: "4. Co się stanie, jeśli nie udzielisz zgody",
        tresc: "Przewodnik działa dalej, ale nie zapisuje danych o ciąży, porodzie i stanie zdrowia dziecka. Plan rodziny pokazuje wtedy sprawy, które od tych danych nie zależą.",
      },
      {
        tytul: "5. Jak zapisujemy Twoją decyzję",
        tresc: "Przy każdej decyzji zapisujemy jej rodzaj, czyli udzielenie, odmowę albo wycofanie zgody, wersję treści zgody oraz datę i godzinę.",
      },
      {
        tytul: "6. Jak wycofać zgodę",
        tresc: "Zgodę wycofasz w każdej chwili w ustawieniach przewodnika. Od razu przestaniemy wykorzystywać dane o ciąży, porodzie i stanie zdrowia dziecka, a usuniemy je w ciągu 30 dni.",
      },
      {
        tytul: "7. Usunięcie danych rodziny",
        tresc: "W ustawieniach przewodnika możesz też jednym działaniem usunąć wszystkie dane rodziny: profil rodziny, plan rodziny, terminy, przypomnienia i wnioski przygotowane w przewodniku, których nie wysłano. Usuniemy je w ciągu 30 dni. Wnioski wysłane do ZUS pozostają w ZUS.",
      },
      {
        tytul: "8. Twoje prawa",
        tresc: "[Podstawa prawna, prawa osoby, której dane dotyczą, i kontakt z inspektorem ochrony danych, z dokumentu zgody w wersji 1.0]",
      },
    ],
    zamknij: "Zamknij",
    // koniec ModalConsentText
  },
  SheetConsentWithdrawConfirm: {
    tytul: "Wycofać zgodę na dane dotyczące zdrowia?",
    skutkiTytul: "Po wycofaniu zgody:",
    skutekDane: "od razu przestaniemy wykorzystywać dane o ciąży, porodzie i stanie zdrowia dziecka,",
    skutekDaneZTerminemPorodu: ({ terminPorodu }: { terminPorodu: string }) =>
      `od razu przestaniemy wykorzystywać dane o ciąży, porodzie i stanie zdrowia dziecka, także przewidywany termin porodu ${terminPorodu},`,
    skutekUsuniecie: "usuniemy te dane w ciągu 30 dni,",
    skutekPlan: "plan rodziny pokaże sprawy, które od tych danych nie zależą.",
    ponownaZgoda: "Zgody możesz udzielić ponownie w ustawieniach przewodnika.",
    potwierdz: "Wycofaj zgodę",
    anuluj: "Anuluj",
    // koniec SheetConsentWithdrawConfirm
  },
  SheetFamilyDataDeleteConfirm: {
    tytul: "Usunąć dane rodziny?",
    wstep: "Usuniemy wszystkie dane rodziny zapisane w przewodniku:",
    profil: "profil rodziny,",
    plan: "plan rodziny,",
    planZLiczbaSpraw: ({ liczba }: { liczba: number }) => {
      const reszta10 = liczba % 10;
      const reszta100 = liczba % 100;
      const odmiana =
        liczba === 1
          ? "sprawa"
          : reszta10 >= 2 && reszta10 <= 4 && (reszta100 < 12 || reszta100 > 14)
            ? "sprawy"
            : "spraw";
      return `plan rodziny – ${liczba} ${odmiana},`;
    },
    terminy: "terminy i przypomnienia,",
    wnioski: "wnioski przygotowane w przewodniku, których nie wysłano.",
    wnioskiZLista: ({ lista }: { lista: string }) => `wnioski, których nie wysłano – ${lista}.`,
    rodzajeWnioskow: {
      zam: "wniosek o zasiłek macierzyński (ZAM)",
      "zas-53": "wniosek o zasiłek chorobowy (ZAS-53)",
      "urlop-do-pracodawcy": "wniosek o urlop do pracodawcy",
      "rezygnacja-z-czesci-zasilku": "wniosek o rezygnację z części zasiłku macierzyńskiego",
      "wniosek-ojca-o-urlop": "wniosek ojca o urlop",
      "odpis-aktu-urodzenia": "wniosek o odpis aktu urodzenia",
    },
    stanyWnioskow: {
      szkic: "nieukończony",
      przygotowany: "przygotowany",
    },
    wniosekZeStanem: ({ wniosek, stan }: { wniosek: string; stan: string }) => `${wniosek}, ${stan}`,
    widocznosc: "Przestaniesz widzieć te dane od razu, a usuniemy je w ciągu 30 dni. Wnioski wysłane do ZUS pozostają w ZUS.",
    odPoczatku: "Po usunięciu danych zaczniesz korzystanie z przewodnika od początku, od ekranu powitalnego.",
    potwierdz: "Usuń dane rodziny",
    anuluj: "Anuluj",
    // koniec SheetFamilyDataDeleteConfirm
  },
  SheetEmploymentChoice: {
    tytul: "Wybierz formę zatrudnienia",
    opis: "Wybierz formę, którą ma uwzględnić Twój plan. Zaznaczyliśmy formę odczytaną z Twojego konta ZUS.",
    opisBezDanych: "Wybierz formę, którą ma uwzględnić Twój plan.",
    legenda: "Forma zatrudnienia",
    znacznikZKonta: "Z konta ZUS",
    // koniec SheetEmploymentChoice
  },
  SheetContributionPaidConfirm: {
    tytul: "Potwierdź opłacenie składek",
    tytulMiesiaca: ({ miesiac }: { miesiac: string }) => `Potwierdź opłacenie składek za ${miesiac}`,
    opis: ({ miesiac }: { miesiac: string }) =>
      `Nie mamy stanu rozliczeń składek z konta ZUS, więc potrzebujemy Twojego potwierdzenia. Sprawdź w swoim banku, czy składki za ${miesiac} zostały opłacone.`,
    miesiac: "Miesiąc składek",
    termin: "Termin opłacenia",
    tytulUbezpieczenia: "Tytuł ubezpieczenia",
    tytulJdg: "Prowadzenie pozarolniczej działalności",
    nota: ({ miesiac }: { miesiac: string }) =>
      `Potwierdzenie zapiszemy w profilu rodziny jako Twoją odpowiedź, a sprawa Opłacenie składek za ${miesiac} dostanie status załatwiona.`,
    rezygnacja: "Składki nie są jeszcze opłacone? Wybierz Zrezygnuj, a sprawa zostanie w planie ze statusem do zrobienia.",
    potwierdz: "Potwierdź opłacenie",
    zrezygnuj: "Zrezygnuj",
    zamknij: "Zamknij okno potwierdzenia opłacenia składek",
    // koniec SheetContributionPaidConfirm
  },
  ModalNewChildDetected: {
    tytul: "Nowe dziecko w danych ZUS",
    // koniec ModalNewChildDetected
  },
  ModalBenefitRules: {
    tytul: "Zastosowane reguły",
    // koniec ModalBenefitRules
  },
  SheetCaseDoneConfirm: {
    tytul: "Udało się załatwić sprawę?",
    tytulSwiadczenie: "Udało się złożyć wniosek?",
    zKanalu: {
      ezus: "z eZUS",
      empatia: "z Emp@tii",
      mobywatel: "z aplikacji mObywatel",
      "gov-zgloszenie-urodzenia": "z usługi zgłoszenia urodzenia",
      "gov-rejestr-stanu-cywilnego": "z rejestru stanu cywilnego",
      "pue-ezus": "z eZUS",
      "e-wizyta": "z e-wizyty w ZUS",
    },
    opisSwiadczenie: ({ zKanalu, termin }: { zKanalu: string; termin: string }) =>
      `Wracasz ${zKanalu}. Jeśli wniosek jest wysłany, oznacz sprawę jako złożoną, a przestaniemy przypominać o terminie ${termin}.`,
    opisSwiadczenieBezTerminu: ({ zKanalu }: { zKanalu: string }) =>
      `Wracasz ${zKanalu}. Jeśli wniosek jest wysłany, oznacz sprawę jako złożoną, a przestaniemy o niej przypominać.`,
    opisPozostale: ({ zKanalu }: { zKanalu: string }) =>
      `Wracasz ${zKanalu}. Jeśli sprawa jest załatwiona, oznacz ją jako załatwioną, a usuniemy ją z listy terminów i przestaniemy o niej przypominać.`,
    notatka: "Oznaczenie możesz cofnąć w każdej chwili w instrukcji sprawy.",
    potwierdzZlozona: "Tak, oznacz jako złożoną",
    potwierdzZalatwiona: "Tak, oznacz jako załatwioną",
    zostaw: "Nie, zostaw do zrobienia",
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
    wnioskodawca: ({ imieINazwisko, pesel }: { imieINazwisko: string; pesel: string }) =>
      `Wniosek o zasiłek macierzyński (ZAM). Wnioskodawca: ${imieINazwisko}, PESEL ${pesel}.`,
    dziecko: ({ imieINazwisko, pesel }: { imieINazwisko: string; pesel: string }) =>
      `Dziecko: ${imieINazwisko}, PESEL ${pesel}.`,
    prawda: "Oświadczam, że dane podane we wniosku są zgodne ze stanem faktycznym.",
    okres: ({ rodzaj, od, do_, stawka }: { rodzaj: string; od: string; do_: string; stawka: string }) =>
      `Wnioskuję o zasiłek macierzyński za okres ${rodzaj} od ${od} do ${do_}. Wiem, że zasiłek za ten okres wyniesie ${stawka} podstawy wymiaru.`,
    zaZyciem: "Oświadczam, że dziecko ma zaświadczenie „Za życiem”.",
    zmiany:
      "Zobowiązuję się niezwłocznie powiadomić ZUS o każdej zmianie, która ma wpływ na prawo do zasiłku macierzyńskiego lub jego wysokość, w szczególności o rezygnacji z urlopu lub jego części.",
    odpowiedzialnosc:
      "Wiem, że za zeznanie nieprawdy lub zatajenie prawdy grozi odpowiedzialność karna, a nienależnie pobrany zasiłek podlega zwrotowi.",
    odpisZus: "Nie dołączam skróconego odpisu aktu urodzenia dziecka. ZUS pobierze go sam na podstawie danych dziecka z wniosku.",
    odpisPlatnik: "Do wniosku dołączam skrócony odpis aktu urodzenia dziecka.",
    zamknij: "Zamknij",
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
    sprawa: ({ tytul }: { tytul: string }) => `Sprawa: ${tytul}`,
    coMozeSieStac: "Co może się stać",
    dataRyzyka: "Data, której dotyczy ryzyko",
    coMoznaZrobic: "Co możesz zrobić",
    poczatekTytulu: {
      "umowa-o-prace": "początek umowy o pracę",
      "umowa-zlecenia": "początek umowy zlecenia",
      jdg: "początek jednoosobowej działalności gospodarczej",
      "brak-tytulu": "początek tytułu do ubezpieczenia",
    },
    koniecUbezpieczenia: {
      "umowa-o-prace": "koniec umowy o pracę",
      "umowa-o-prace-terminowa": "koniec umowy o pracę (koniec umowy na czas określony albo na okres próbny)",
      "umowa-zlecenia": "koniec umowy zlecenia, a z nim dobrowolnego ubezpieczenia chorobowego",
      jdg: "koniec jednoosobowej działalności gospodarczej, a z nią dobrowolnego ubezpieczenia chorobowego",
      "brak-tytulu": "koniec tytułu do ubezpieczenia",
    },
    skutki: {
      K28: "ZUS może uznać umowę zawartą albo działalność podjętą wyłącznie w celu uzyskania zasiłku za pozorną i wydać decyzję o niepodleganiu ubezpieczeniom, a wtedy zasiłki nie przysługują.",
      K29: "Brak zasiłku macierzyńskiego, a rodzinie przysługuje wtedy świadczenie rodzicielskie.",
    },
    prefiksSkutku: "Skutek bez kwoty:",
    pytanieOpis: "Jeśli masz wątpliwości, zapytaj ZUS. Pytanie wyślesz z kontekstem tej sprawy.",
    pytanieAkcja: "Zadaj pytanie do ZUS",
    dzialania: {
      "umowa-zlecenia": "Zawrzyj umowę zlecenia z dobrowolnym ubezpieczeniem chorobowym, która będzie trwać w dniu porodu.",
      jdg: "Prowadź działalność z dobrowolnym ubezpieczeniem chorobowym do dnia porodu albo zgłoś się do dobrowolnego ubezpieczenia chorobowego w eZUS.",
      "umowa-o-prace": "Podejmij przed porodem nowy tytuł do ubezpieczenia chorobowego.",
      "brak-tytulu": "Podejmij przed porodem nowy tytuł do ubezpieczenia chorobowego.",
    },
    zobaczInstrukcje: "Zobacz instrukcję",
    przedluzenieOpis:
      "Nie wiemy, jaki to rodzaj umowy. Umowa na czas określony albo na okres próbny może przedłużyć się do dnia porodu. Sprawdź to w sprawie Szczególna ochrona pracownika w ciąży i w czasie urlopów.",
    przedluzenieAkcja: "Sprawdź przedłużenie umowy",
    swiadczenieRodzicielskieOpis: "Bez zasiłku macierzyńskiego rodzina może dostać świadczenie rodzicielskie.",
    swiadczenieRodzicielskieAkcja: "Przejdź do sprawy Świadczenie rodzicielskie",
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
    // koniec SheetAssistantActionConfirm
  },
} as const;
