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
    temat: ({ rodzajWniosku }: { rodzajWniosku: string }) => `Wniosek: ${rodzajWniosku}`,
    tresc: ({ status, adresPrzewodnika }: { status: string; adresPrzewodnika: string }) =>
      `Status Twojego wniosku zmienił się na: ${status}. Szczegóły zobaczysz w przewodniku: ${adresPrzewodnika}`,
    statusy: {
      "do-zrobienia": "do zrobienia",
      zlozona: "złożona",
      zalatwiona: "załatwiona",
      "wymaga-uzupelnienia-profilu": "wymaga uzupełnienia profilu",
    },
    odmowa: "odmowa",
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
    powrotDoPlanu: "Plan rodziny",
    powrotDoSytuacji: "Twoja sytuacja",
    leadProfil: "Profil na start",
    wstep: "Podaj datę porodu i liczbę urodzonych dzieci. Od tej daty przeliczymy plan rodziny i terminy – zastąpi ona przewidywany termin porodu.",
    przewidywanyTermin: "Przewidywany termin porodu w profilu:",
    wstepProfil: "Podaj datę porodu i liczbę urodzonych dzieci. Zapiszemy je w szkicu profilu, a plan rodziny i terminy wyliczymy od daty porodu, gdy zapiszesz profil.",
    wstepRozbieznosc: "Wpisaliśmy datę urodzenia z danych ZUS. Jeśli właściwa jest data z profilu, popraw ją w polu. Od potwierdzonej daty przeliczymy plan rodziny i terminy.",
    rozbieznosc: {
      dataWProfilu: "Data porodu w Twoim profilu",
      dataWZus: "Data urodzenia w danych ZUS",
      dzieckoWZus: "Dziecko w danych ZUS",
    },
    poleDaty: {
      etykieta: "Data porodu",
      podpowiedz: "Wpisz datę w formacie DD.MM.RRRR, np. 19.11.2026. Podaj datę z ostatnich 36 miesięcy.",
    },
    poleLiczby: {
      etykieta: "Liczba urodzonych dzieci",
      podpowiedz: "Podpowiadamy liczbę dzieci z profilu rodziny.",
      podpowiedzProfil: "Jeśli urodziły się bliźnięta, wybierz 2.",
      wybierz: "Wybierz",
    },
    notkaProfil: "W następnym kroku zapytamy, czy w czasie ciąży zmieniło się Twoje zatrudnienie.",
    potwierdz: "Potwierdź datę porodu",
    anuluj: "Anuluj",
    brakRodziny: "Przewodnik nie ma jeszcze profilu rodziny. Zapisz profil na start, a potem zgłoś narodziny.",
    // koniec ViewBirthDate
  },
  ViewProfileChildAdoption: {
    tytulStrony: "Profil na start: przyjęcie dziecka",
    naglowek: "Profil na start",
    wstep: "Kilka pytań, z których ułożymy plan Twojej rodziny.",
    naglowekZmiany: "Dane przyjęcia dziecka",
    powrotDoProfilu: "Profil rodziny",
    nazwaKroku: "Przyjęcie dziecka",
    tytulKarty: "Przyjęcie dziecka na wychowanie",
    opisKarty:
      "Plan Twojej rodziny policzymy od dnia przyjęcia dziecka. Od tej daty biegną terminy wniosków o urlop i o zasiłek.",
    opisKartyZmiany: "Zmień dane i przejdź dalej. Zmianę zapiszesz w podsumowaniu profilu.",
    rola: {
      legenda: "Kim jesteś dla przyjętego dziecka?",
      podpowiedz: "Odpowiedź zaproponowaliśmy na podstawie Twojego numeru PESEL. Możesz ją zmienić.",
      matka: "Matką",
      ojciec: "Ojcem",
    },
    forma: {
      legenda: "Forma przyjęcia dziecka",
      przysposobienie: "Przysposobienie z wnioskiem do sądu",
      opisPrzysposobienia: "Dziecko jest u Ciebie na wychowaniu, a do sądu trafił wniosek o przysposobienie.",
      niezawodowa: "Rodzina zastępcza niezawodowa",
      zawodowa: "Rodzina zastępcza zawodowa",
    },
    dataPrzyjecia: {
      etykieta: "Data przyjęcia dziecka",
      podpowiedz: ({ data }: { data: string }) => `DD.MM.RRRR, najpóźniej ${data}`,
      zapisana: ({ data }: { data: string }) => `Zapisana data: ${data}`,
    },
    dataUrodzenia: {
      etykieta: "Data urodzenia dziecka",
      podpowiedz: "DD.MM.RRRR",
    },
    odroczenie: {
      legenda: "Czy wobec dziecka podjęto decyzję o odroczeniu obowiązku szkolnego?",
      tak: "Tak",
      nie: "Nie",
    },
    dataUprawomocnienia: {
      etykieta: "Data uprawomocnienia się orzeczenia o przysposobieniu (nieobowiązkowo)",
      podpowiedz:
        "Podaj ją, gdy ją poznasz. Od tej daty policzymy termin urlopu ojcowskiego i zgłoszenia dziecka do ubezpieczenia zdrowotnego.",
    },
    liczbaDzieci: {
      legenda: "Ile dzieci przyjmujesz jednocześnie?",
      opcje: {
        1: "Jedno dziecko",
        2: "Dwoje",
        3: "Troje",
        4: "Czworo",
        5: "Pięcioro i więcej",
      },
    },
    notatkaSciezki:
      "Profil prowadzi jedną ścieżkę: ciążę i poród albo przyjęcie dziecka. Gdy przejdziesz dalej, dane przyjęcia zastąpią w profilu dane ciąży. Gdy wrócisz do poprzedniego kroku, dane ciąży zostaną bez zmian.",
    wstecz: "Wstecz",
    dalej: "Dalej",
    krokiProfilu: {
      tytul: "Kroki profilu",
      etykietaBocznej: "Postęp profilu",
      daneZKontaZus: "Dane z konta ZUS",
      sytuacja: "Twoja sytuacja",
      przyjecie: "Przyjęcie dziecka",
      rodzina: "Rodzina",
      drugiRodzic: "Drugi rodzic",
      podsumowanie: "Podsumowanie",
      notatka: "Zapamiętujemy Twoje odpowiedzi. Jeśli przerwiesz, po powrocie zaczniesz w tym samym miejscu.",
    },
    poZapisie: {
      tytul: "Po zapisaniu profilu",
      etykietaBocznej: "Informacje o zmianie",
      punkty: [
        "Przeliczymy plan rodziny i terminy od nowej daty przyjęcia dziecka.",
        "Sprawy złożone i załatwione zachowają swój status.",
        "Terminy urlopu ojcowskiego i zgłoszenia do ubezpieczenia zdrowotnego policzymy, gdy dopiszesz datę uprawomocnienia się orzeczenia.",
      ],
    },
    bezZgody: {
      przejdzDalej: "Przejdź dalej",
      wrocDoProfilu: "Wróć do profilu rodziny",
    },
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
      tytul: "Dziecko",
      zmien: "Zmień dane dziecka",
      imieINazwisko: "Imię i nazwisko",
      pesel: "Numer PESEL",
      dataPorodu: "Data porodu",
      liczbaDzieci: "Liczba urodzonych dzieci",
      tydzien: "Tydzień ciąży w dniu porodu",
      masa: "Masa urodzeniowa",
      masaWGramach: ({ masa }: { masa: string }) => `${masa} g`,
      dni: "Dni hospitalizacji między 5. a 28. dniem życia",
      ciezkaChoroba: "Ciężka choroba dziecka",
      zaZyciem: "Zaświadczenie „Za życiem”",
      tak: "Tak",
      nie: "Nie",
      coZTegoWynika: "Co z tego wynika",
      uzupelniajacy: "Uzupełniający urlop macierzyński",
      rodzicielski: "Urlop rodzicielski",
      wymiarRodzicielskiego: ({ tygodnie }: { tygodnie: string }) =>
        `Do ${tygodnie} tygodni, w tym po 9 tygodni wyłącznie dla każdego z rodziców`,
      wymiaryUzupelniajacego: {
        brak: "Nie przysługuje",
        "do-8": "Do 8 tygodni",
        "do-15": "Do 15 tygodni",
        "nie-sprawdzono": "Nie sprawdziliśmy",
      },
      notka: "Jeśli dziecko trafi do szpitala, liczbę dni hospitalizacji zmienisz do 28. dnia jego życia. Każda zmiana przelicza plan rodziny, kalkulator zasiłku i wniosek o zasiłek macierzyński.",
      // koniec sekcjaDanychDziecka
    },
    sekcjaPrzyjecia: {
      tytul: "Dane przyjęcia dziecka",
      zmien: "Zmień",
      zmienEtykieta: "Zmień dane przyjęcia dziecka",
      kimJestes: "Kim jesteś dla dziecka",
      formaPrzyjecia: "Forma przyjęcia",
      dataPrzyjecia: "Data przyjęcia dziecka",
      dataUrodzenia: "Data urodzenia dziecka",
      liczbaDzieci: "Liczba jednocześnie przyjętych dzieci",
      odroczenie: "Odroczenie obowiązku szkolnego",
      dataUprawomocnienia: "Data uprawomocnienia się orzeczenia o przysposobieniu",
      niePodano: "Nie podano",
      zmienionoPoprzednio: ({ wartosc }: { wartosc: string }) => `Zmieniono – poprzednio ${wartosc}`,
      role: { matka: "Matką", ojciec: "Ojcem" },
      formy: {
        przysposobienie: "Przysposobienie z wnioskiem do sądu",
        "rodzina-zastepcza-niezawodowa": "Rodzina zastępcza niezawodowa",
        "rodzina-zastepcza-zawodowa": "Rodzina zastępcza zawodowa",
      },
      liczby: {
        1: "Jedno dziecko",
        2: "Dwoje",
        3: "Troje",
        4: "Czworo",
        5: "Pięcioro i więcej",
      },
      tak: "Tak",
      nie: "Nie",
      planOdDniaPrzyjecia: {
        tytul: "Plan od dnia przyjęcia",
        sciezka:
          "Twój profil prowadzi ścieżkę przyjęcia dziecka na wychowanie, dlatego zamiast danych ciąży widzisz dane przyjęcia dziecka.",
        przeliczenie: ({ data }: { data: string }) =>
          `Po zapisaniu przeliczymy plan i terminy od daty przyjęcia ${data}. Sprawy złożone i załatwione zachowają status.`,
      },
      bezDanych: {
        tytul: "Ciąża albo przyjęcie dziecka",
        opis: "Nie masz zapisanych danych ciąży ani przyjęcia dziecka.",
        podaj: "Podaj dane przyjęcia dziecka",
      },
      akcjaPrzyjecia: {
        tytul: "Przyjęcie dziecka na wychowanie",
        opis: "Jeśli przyjmujesz dziecko na wychowanie, podaj dane przyjęcia. Zastąpią w profilu dane ciąży.",
        podaj: "Podaj dane przyjęcia dziecka",
      },
      zgoda: {
        tytul: "Zgoda na dane zdrowia",
        opis: "Zapisaliśmy, że nie udzielasz zgody na przetwarzanie danych dotyczących zdrowia. Dane przyjęcia dziecka należą do danych o ciąży i dziecku.",
        ustawienia: "Zgody możesz udzielić w każdej chwili w ustawieniach przewodnika.",
        przejdz: "Przejdź do ustawień",
      },
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
    powrotDoPlanu: "Plan rodziny",
    powrotDoProfilu: "Profil rodziny",
    kartaPorod: "Poród",
    kartaZdrowie: "Zdrowie dziecka",
    dziecko: "Dziecko",
    dataPorodu: "Data porodu",
    liczbaDzieci: "Liczba urodzonych dzieci",
    wstepPorod: "Od tych danych zależy, czy przysługuje Ci uzupełniający urlop macierzyński – do 8 albo do 15 tygodni.",
    poleTygodnia: { etykieta: "Tydzień ciąży w dniu porodu", podpowiedz: "Liczba od 22 do 44, np. 39." },
    poleMasy: { etykieta: "Masa urodzeniowa w gramach", podpowiedz: "Liczba od 300 do 7000, np. 3350." },
    poleDni: {
      etykieta: "Dni hospitalizacji dziecka między 5. a 28. dniem życia",
      podpowiedz: "Liczba od 0 do 24. Jeśli dziecko jest jeszcze w szpitalu, zmienisz ją w profilu rodziny.",
      podpowiedzZmiana: "Liczba od 0 do 24. Wpisz, ile dni dziecko było w szpitalu między 5. a 28. dniem życia.",
    },
    wstepZdrowie: "Pola nieobowiązkowe. Zaznacz je tylko wtedy, gdy dotyczą Twojego dziecka.",
    ciezkaChoroba: {
      etykieta: "U dziecka stwierdzono ciężkie i nieodwracalne upośledzenie albo nieuleczalną chorobę zagrażającą życiu",
      opis: "Jeśli zaznaczysz, sprawdzimy, czy przysługuje Ci jednorazowe świadczenie „Za życiem”.",
      opisZaZyciem: "Zaznaczyliśmy, bo dziecko ma zaświadczenie „Za życiem”. Sprawdzimy, czy przysługuje Ci jednorazowe świadczenie „Za życiem”.",
    },
    zaZyciem: {
      etykieta: "Dziecko ma zaświadczenie lekarza „Za życiem”",
      opis: "To zaświadczenie o ciężkim i nieodwracalnym upośledzeniu albo nieuleczalnej chorobie zagrażającej życiu, które powstały w prenatalnym okresie rozwoju dziecka lub w czasie porodu. Wydłuża urlop rodzicielski do 65 tygodni przy jednym dziecku i do 67 tygodni przy więcej niż jednym dziecku.",
    },
    wymiarRodzicielskiego: ({ tygodnie }: { tygodnie: string }) => `Urlop rodzicielski: do ${tygodnie} tygodni`,
    opisWymiaru: "Po 9 tygodni z tego wymiaru przysługuje wyłącznie każdemu z rodziców. Po zapisaniu przeliczymy plan rodziny, a kalkulator zasiłku i kreator wniosku o zasiłek macierzyński wezmą ten wymiar.",
    opisWymiaruPoOdznaczeniu: "Bez zaświadczenia „Za życiem” wrócimy do zwykłego wymiaru. Po 9 tygodni z tego wymiaru przysługuje wyłącznie każdemu z rodziców. Po zapisaniu przeliczymy plan rodziny, kalkulator zasiłku i wniosek o zasiłek macierzyński.",
    notkaZgody: {
      przed: "To dane dotyczące zdrowia. Zapisujemy je na podstawie Twojej zgody, którą zmienisz w ",
      link: "ustawieniach",
      po: ".",
    },
    zapisz: "Zapisz dane dziecka",
    zapiszZmiany: "Zapisz zmiany",
    anuluj: "Anuluj",
    brakDaty: "Najpierw potwierdź datę porodu. Od niej zależą dane dziecka po porodzie.",
    zglosNarodziny: "Zgłoś narodziny",
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
    powrotDoPlanu: "Plan rodziny",
    kartaPorod: "Poród",
    dataPorodu: "Data porodu",
    liczbaDzieci: "Liczba urodzonych dzieci",
    formaZatrudnienia: "Forma zatrudnienia",
    uzupelniajacy: "Uzupełniający urlop macierzyński",
    wymiaryUzupelniajacego: {
      brak: "Nie przysługuje",
      "do-8": "Do 8 tygodni",
      "do-15": "Do 15 tygodni",
      "nie-sprawdzono": "Nie sprawdziliśmy",
    },
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia-z": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      "umowa-zlecenia-bez": "Umowa zlecenia bez dobrowolnego ubezpieczenia chorobowego",
      "jdg-z": "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
      "jdg-bez": "Jednoosobowa działalność gospodarcza bez dobrowolnego ubezpieczenia chorobowego",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
    },
    brakFormy: "Nie podano",
    notkaBezZgody: {
      przed: "Bez Twojej zgody na dane dotyczące zdrowia nie pytamy o tydzień ciąży, masę urodzeniową ani pobyt dziecka w szpitalu, więc nie sprawdzimy, czy przysługuje Ci uzupełniający urlop macierzyński. Zgodę zmienisz w ",
      link: "ustawieniach",
      po: ".",
    },
    kartaSpraw: ({ liczba }: { liczba: string }) => `Sprawy na pierwsze 3 miesiące (${liczba})`,
    wstepSpraw: ({ data }: { data: string }) => `Zacznij od najbliższego terminu. Pokazujemy sprawy z terminem do ${data}.`,
    k05Zalatwiona: "Sprawa Zgłoszenie dziecka do ubezpieczenia zdrowotnego jest załatwiona – dziecko jest już w Twoich danych w ZUS.",
    notkaSwiadczeniaRodzicielskiego: "Nie masz dobrowolnego ubezpieczenia chorobowego, więc zasiłek macierzyński Ci nie przysługuje. Zamiast niego rodzinie przysługuje świadczenie rodzicielskie.",
    brakSpraw: "W pierwszych 3 miesiącach po porodzie nie masz spraw do zrobienia z terminem.",
    termin: "Termin",
    zaDni: ({ liczba }: { liczba: number }) => (liczba === 1 ? "za 1 dzień" : `za ${liczba} dni`),
    dzisiaj: "dzisiaj",
    poTerminie: ({ liczba }: { liczba: number }) => (liczba === 1 ? "1 dzień po terminie" : `${liczba} dni po terminie`),
    skutekSpoznienia: "Skutek spóźnienia:",
    kosztSpoznienia: "Koszt spóźnienia:",
    opisy: {
      K05: {
        jdg: "Prowadzisz działalność, więc dziecko zgłaszasz sama w eZUS.",
        "umowa-zlecenia": "Przekaż dane dziecka zleceniodawcy – to on zgłosi dziecko do ubezpieczenia zdrowotnego.",
        "umowa-o-prace": "Przekaż dane dziecka pracodawcy – to on zgłosi dziecko do ubezpieczenia zdrowotnego.",
      },
      K06: "Zgłosisz je w urzędzie stanu cywilnego albo w mObywatelu. Potem dziecko dostanie akt urodzenia i numer PESEL.",
      K07: "Pracujesz na umowie o pracę, więc wniosek o oba urlopy składasz u pracodawcy, a nie w ZUS. Pokażemy Ci, co w nim wpisać.",
      K08: {
        jdg: "Masz dobrowolne ubezpieczenie chorobowe, więc wniosek składasz w ZUS. Przeprowadzimy Cię przez niego krok po kroku.",
        "umowa-zlecenia": "Masz dobrowolne ubezpieczenie chorobowe przy umowie zlecenia, więc składasz wniosek o zasiłek macierzyński. Przeprowadzimy Cię przez niego krok po kroku.",
        inna: "Wniosek o zasiłek macierzyński składasz w ZUS. Przeprowadzimy Cię przez niego krok po kroku.",
      },
      K12: "Wniosek o 800+ złożysz w eZUS.",
      K16: "Wniosek złożysz w gminie albo w MOPS, osobiście albo przez Emp@tię.",
    },
    akcje: {
      instrukcja: "Zobacz instrukcję",
      kreator: "Otwórz kreator wniosku",
      ezus: "Złóż wniosek w eZUS",
      nowaKarta: "Otworzy się w nowej karcie.",
    },
    notkaPozostale: "Pozostałe sprawy znajdziesz w planie rodziny, w etapie Pierwsze tygodnie po porodzie i w kolejnych etapach.",
    notkaPozostaleUzupelniajacy: "Pozostałe sprawy, w tym uzupełniający urlop macierzyński, znajdziesz w planie rodziny.",
    przejdzDoPlanu: "Przejdź do planu rodziny",
    wszystkieTerminy: "Zobacz wszystkie terminy",
    brakDaty: "Pakiet narodzin pokażemy po potwierdzeniu daty porodu.",
    zglosNarodziny: "Zgłoś narodziny",
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
      zglos: "Zgłoś narodziny",
      // koniec akcjaZglosNarodziny
    },
    akcjaSytuacjaSzczegolna: {
      // koniec akcjaSytuacjaSzczegolna
    },
    akcjaSwiadczeniaWCiazy: {
      // koniec akcjaSwiadczeniaWCiazy
    },
    oknoNowegoDziecka: {
      tytulKarty: "Dziecko już się urodziło?",
      zobaczDziecko: "Zobacz dziecko z danych ZUS",
      opis: ({ data }: { data: string }) =>
        `Podaj datę porodu. Przeliczymy plan i terminy od prawdziwej daty zamiast od przewidywanego terminu porodu ${data}.`,
      opisBezTerminu: "Podaj datę porodu. Przeliczymy plan i terminy od prawdziwej daty porodu.",
      opisPierwszeTygodnie: "Po porodzie najwięcej terminów mija w pierwszych tygodniach – pokażemy Ci, od czego zacząć.",
      zglos: "Zgłoś narodziny",
      // koniec oknoNowegoDziecka
    },
    blokEzla: {
      tytulEzla: "Zaświadczenia lekarskie e-ZLA",
      podsumowanie: ({ liczba, wykorzystane, limit }: { liczba: number; wykorzystane: number; limit: number }) =>
        `Zaświadczenia z ostatnich 12 miesięcy: ${liczba}. Okres zasiłkowy w ciąży: wykorzystane ${wykorzystane} dni z ${limit}.`,
      podsumowanieBezOkresu: ({ liczba }: { liczba: number }) => `Zaświadczenia z ostatnich 12 miesięcy: ${liczba}.`,
      zobaczEzla: "Zobacz zaświadczenia lekarskie e-ZLA",
      tytulRozliczen: "Stan rozliczeń składek",
      rozliczeniaNa: ({ data, kwota }: { data: string; kwota: string }) =>
        `Stan rozliczeń na ${data}: zadłużenie z tytułu składek ${kwota}.`,
      zobaczRozliczenia: "Zobacz stan rozliczeń składek",
      // koniec blokEzla
    },
    terminSprawy: {
      // koniec terminSprawy
    },
    statusWnioskuZus: {
      odmowa: "Odmowa",
      zrodloZus: "Dane z konta ZUS",
      zrodloRodzica: "Oznaczone przez Ciebie",
      wniosekZKanalem: ({ data, kanal, status }: { data: string; kanal: string; status: string }) =>
        `Wniosek z ${data} przez ${kanal} – ${status}`,
      planowyTermin: ({ data }: { data: string }) => `Planowy termin załatwienia: ${data}`,
      przyznane: ({ data }: { data: string }) => `Świadczenie przyznane na wniosek z ${data}`,
      najblizszaWyplata: ({ kwota, data }: { kwota: string; data: string }) => `Najbliższa wypłata: ${kwota}, ${data}`,
      ostatniaWyplata: ({ kwota, data }: { kwota: string; data: string }) => `Ostatnia wypłata: ${kwota}, ${data}`,
      odmowaOpis: ({ data }: { data: string }) => `ZUS odmówił przyznania świadczenia na wniosek z ${data}`,
      zobaczOdpowiedz: "Zobacz odpowiedź ZUS w eZUS",
      brakWniosku: "Nie ma jeszcze wniosku w danych z konta ZUS",
      nowaSprawa: "Nowa sprawa – 800+ jest już przyznane",
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
      tytul: "Wniosek w ZUS",
      statusWZus: "Status wniosku w ZUS",
      dataZlozenia: "Data złożenia",
      kanal: "Kanał złożenia",
      planowyTermin: "Planowy termin załatwienia",
      brakWartosci: "-",
      statusy: {
        zlozony: "Złożony",
        "w-trakcie": "W trakcie rozpatrywania",
        przyznanie: "Przyznano świadczenie",
        odmowa: "Odmowa",
      },
      kanaly: {
        ezus: "eZUS",
        mzus: "mZUS",
        bankowosc: "Bankowość elektroniczna",
        empatia: "Emp@tia",
        przewodnik: "Przewodnik rodzica",
      },
      zrodloZus: "Źródło statusu: dane z konta ZUS",
      zrodloRodzica: "Źródło statusu: oznaczone przez Ciebie",
      brakWnioskuOpis: ({ tytul }: { tytul: string }) =>
        `W danych z konta ZUS nie ma jeszcze wniosku: ${tytul}. Gdy ZUS go zarejestruje, status z danych ZUS zastąpi Twoje oznaczenie.`,
      odmowaTytul: "Co możesz zrobić",
      odmowaOpis: ({ data }: { data: string }) =>
        `ZUS odmówił przyznania świadczenia na wniosek z ${data}, więc sprawa wróciła do spraw do zrobienia.`,
      odmowaWskazowka: "Odpowiedź ZUS na wniosek zobaczysz w szczegółach wniosku w eZUS. Otworzymy je w nowej karcie przeglądarki.",
      zobaczOdpowiedz: "Zobacz odpowiedź ZUS w eZUS",
      najblizszaTytul: "Najbliższa wypłata",
      ostatniaTytul: "Ostatnia wypłata",
      stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
      planowanyTermin: "Planowany termin wypłaty",
      dataWyplaty: "Data wypłaty",
      sposobWyplaty: "Sposób wypłaty",
      sposoby: { przelew: "Przelew na rachunek bankowy", "przekaz-pocztowy": "Przekaz pocztowy" },
      swiadczenia: {
        "800-plus": "Świadczenie wychowawcze 800+",
        "aktywny-rodzic": "Świadczenie z programu Aktywny Rodzic",
      },
      zasilekMacierzynski: "Zasiłek macierzyński",
      brakWyplatyNajblizszej: "Tu zobaczysz kwotę i termin najbliższej wypłaty, gdy ZUS przyzna świadczenie.",
      brakWyplatyOstatniej: "Tu zobaczysz datę i kwotę ostatniej wypłaty zasiłku macierzyńskiego, gdy ZUS ją zrealizuje.",
      // koniec sekcjaStatusWnioskuZus
    },
    sekcjaPrawoWCiazy: {
      // koniec sekcjaPrawoWCiazy
    },
    sekcjaZaswiadczeniaEzla: {
      tytul: "Zaświadczenia lekarskie e-ZLA",
      stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
      liczba: "Zaświadczenia z ostatnich 12 miesięcy",
      liczbaWartosc: ({ liczba, zKodemB }: { liczba: number; zKodemB: number }) => `${liczba}, w tym ${zKodemB} z kodem B`,
      okres: "Okres zasiłkowy w ciąży",
      okresWartosc: ({ wykorzystane, limit, koniec }: { wykorzystane: number; limit: number; koniec: string }) =>
        `Wykorzystane ${wykorzystane} dni z ${limit}, koniec ${koniec}`,
      zasilek: "Zasiłek chorobowy",
      zasilekOd: ({ data, limit }: { data: string; limit: number }) =>
        `Od ${data}, po ${limit} dniach wynagrodzenia chorobowego`,
      zasilekPracodawca: ({ wykorzystane, limit }: { wykorzystane: number; limit: number }) =>
        `Wynagrodzenie chorobowe: wykorzystane ${wykorzystane} dni z ${limit}`,
      zasilekOdPierwszego: "Od pierwszego dnia niezdolności do pracy",
      ostatnie: "Ostatnie zaświadczenie",
      ostatnieWartosc: ({ numer, okres }: { numer: string; okres: string }) => `${numer}, ${okres}`,
      brak: "Nie masz zaświadczeń lekarskich z ostatnich 12 miesięcy.",
      zobacz: "Zobacz zaświadczenia lekarskie e-ZLA",
      // koniec sekcjaZaswiadczeniaEzla
    },
    sekcjaStanRozliczen: {
      tytul: "Składki a zasiłek",
      opis: "Zadłużenie z tytułu składek w dniu porodu może wstrzymać wypłatę zasiłku.",
      opisChorobowy: "Zadłużenie z tytułu składek w dniu powstania niezdolności do pracy może wstrzymać wypłatę zasiłku.",
      opisSkladek: "Stan rozliczeń składek pokazuje, czy opłacone składki chronią Twoje prawo do zasiłku.",
      naDzien: ({ data, kwota }: { data: string; kwota: string }) => `Zadłużenie z tytułu składek na ${data}: ${kwota}`,
      zobacz: "Zobacz stan rozliczeń składek",
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
      terminy: {
        tytul: "Terminy",
        opisK31: ({ data }: { data: string }) =>
          `Oba terminy liczymy od daty przyjęcia dziecka na wychowanie: ${data}.`,
        opisK32: ({ data }: { data: string }) => `Termin liczymy od daty przyjęcia dziecka na wychowanie: ${data}.`,
        wniosekOUrlop: "Termin wniosku o urlop",
        opisWnioskuOUrlop:
          "Data przyjęcia dziecka powiększona o 7 dni. Do tego dnia złóż pracodawcy wniosek o urlop na warunkach urlopu macierzyńskiego.",
        wariant815: "Ostatni dzień rozpoczęcia urlopu i wniosku w wariancie 81,5%",
        opisWariantu815:
          "Data przyjęcia dziecka powiększona o 21 dni. Wniosek o urlop na warunkach urlopu macierzyńskiego i urlop rodzicielski złożony do tego dnia daje zasiłek 81,5% za cały okres.",
        wniosekOZasilek: "Termin wniosku o zasiłek macierzyński",
        opisWnioskuOZasilek:
          "Data przyjęcia dziecka powiększona o 21 dni. Wniosek o zasiłek za okres obu urlopów złożony do tego dnia daje zasiłek 81,5% za cały okres.",
        skutek: "Skutek spóźnienia",
        trescSkutku: "Utrata możliwości wyboru równych wypłat w wysokości 81,5%.",
        notatka: "Jeśli zmienisz datę przyjęcia dziecka, przeliczymy oba terminy.",
        zmien: "Zmień dane przyjęcia dziecka",
        dzisiaj: "dzisiaj",
        poTerminie: "Po terminie",
        zaDni: ({ liczba }: { liczba: number }) => (liczba === 1 ? "za 1 dzień" : `za ${liczba} dni`),
      },
      dane: {
        tytul: "Dane przyjęcia dziecka",
        formaPrzyjecia: "Forma przyjęcia",
        dataPrzyjecia: "Data przyjęcia",
        dataUrodzenia: "Data urodzenia dziecka",
        liczbaDzieci: "Liczba dzieci",
        dataUprawomocnienia: "Data uprawomocnienia się orzeczenia",
        zmien: "Zmień dane przyjęcia",
      },
      formy: {
        przysposobienie: "Przysposobienie z wnioskiem do sądu",
        "rodzina-zastepcza-niezawodowa": "Rodzina zastępcza niezawodowa",
        "rodzina-zastepcza-zawodowa": "Rodzina zastępcza zawodowa",
      },
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
    powrot: "Plan rodziny",
    powrotDoSprawy: "Szczegóły sprawy",
    stanNaZGodzina: ({ data }: { data: string }) => `Stan na ${data}`,
    stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
    listaTytul: "Zaświadczenia z ostatnich 12 miesięcy",
    listaOpis: ({ data }: { data: string }) =>
      `Pokazujemy zaświadczenia wystawione od ${data}, od najpóźniejszego okresu niezdolności do pracy.`,
    tylkoWlasne: "Widzisz tylko zaświadczenia z własnego konta ZUS.",
    licznik: ({ liczba, zKodemB }: { liczba: number; zKodemB: number }) =>
      `Zaświadczenia: ${liczba}, z kodem B: ${zKodemB}`,
    podpisTabeli: "Zaświadczenia lekarskie e-ZLA z ostatnich 12 miesięcy",
    przewijanieTabeli: "Tabela zaświadczeń lekarskich, przewiń w poziomie",
    kolumny: {
      okres: "Okres niezdolności do pracy",
      dni: "Liczba dni",
      kod: "Kod literowy",
      platnik: "Płatnik składek",
      rodzaj: "Rodzaj",
      akcje: "Akcje",
    },
    brakKodu: "-",
    znaczekCiazy: "Ciąża",
    rodzaje: {
      choroba: "Niezdolność do pracy z powodu choroby",
      opieka: "Opieka nad dzieckiem lub członkiem rodziny",
    },
    szczegoly: "Szczegóły",
    szczegolyEtykieta: ({ numer }: { numer: string }) => `Szczegóły zaświadczenia ${numer}`,
    pustaListaOpis: "Tu zobaczysz zaświadczenia, które wystawi Ci lekarz, i wyliczenie okresu zasiłkowego.",
    brakPolaczeniaOpis: "Tu zobaczysz zaświadczenia lekarskie i wyliczenie okresu zasiłkowego, gdy pobierzemy dane z ZUS.",
    ponawianie: "Pobieramy dane z ZUS",
    okresTytul: "Okres zasiłkowy w ciąży",
    wykorzystane: "Wykorzystane",
    pozostalo: "Pozostało",
    koniecOkresu: "Koniec okresu",
    dniZ: ({ liczba, limit }: { liczba: number; limit: number }) => `${liczba} dni z ${limit}`,
    dni: ({ liczba }: { liczba: number }) => `${liczba} dni`,
    postepOkresu: "Wykorzystana część okresu zasiłkowego w ciąży",
    poczatekOkresu: "Początek okresu zasiłkowego",
    zaswiadczeniaWOkresie: "Zaświadczenia w okresie",
    przewidywanyTermin: "Przewidywany termin porodu",
    notatkaOkresu:
      "Liczymy dni z zaświadczeń z kodem B wystawionych z powodu choroby. Przerwa do 60 dni nie przerywa okresu, a dłuższa zaczyna nowy. Datę końca podajemy przy niezdolności do pracy trwającej bez przerwy.",
    terminPrzedKoncem: ({ data }: { data: string }) =>
      `Przewidywany termin porodu ${data} przypada przed końcem okresu zasiłkowego.`,
    koniecPrzedTerminem: ({ data }: { data: string }) =>
      `Okres zasiłkowy kończy się ${data}, przed terminem porodu, dlatego w planie rodziny jest sprawa Świadczenie rehabilitacyjne w ciąży.`,
    okresNieDotyczy: "Nie dotyczy – na Twoich zaświadczeniach nie ma kodu B, który oznacza niezdolność do pracy w ciąży.",
    bezUbezpieczeniaOpis:
      "Prowadzisz działalność albo pracujesz na umowie zlecenia bez dobrowolnego ubezpieczenia chorobowego, dlatego nie wyliczamy okresu zasiłkowego. Sprawy, które możesz załatwić, znajdziesz w",
    planRodzinyOdnosnik: "planie rodziny",
    rehabilitacyjneOdnosnik: "Świadczenie rehabilitacyjne w ciąży – zobacz sprawę w planie",
    wynagrodzenieTytul: ({ rok }: { rok: number }) => `Wynagrodzenie chorobowe w ${rok} roku`,
    zasilekOd: "Zasiłek chorobowy od",
    notatkaWynagrodzenia: ({ limit }: { limit: number }) =>
      `Za pierwsze ${limit} dni niezdolności do pracy w roku kalendarzowym pracodawca wypłaca Ci wynagrodzenie chorobowe, a od kolejnego dnia przysługuje zasiłek chorobowy. W ciąży oba wynoszą 100% podstawy.`,
    wliczoneBezB: ({ rok, numery }: { rok: number; numery: string }) =>
      `Wliczamy wszystkie zaświadczenia z powodu choroby z ${rok} roku, także ${numery} bez kodu B.`,
    opiekaNieWliczana: ({ numery }: { numery: string }) =>
      `Zaświadczenie ${numery} dotyczy opieki nad dzieckiem lub członkiem rodziny, więc nie wliczamy go do dni wynagrodzenia chorobowego.`,
    zasilekOdPierwszegoTytul: "Zasiłek chorobowy od pierwszego dnia",
    formaZatrudnienia: "Forma zatrudnienia",
    zasilekChorobowy: "Zasiłek chorobowy",
    odPierwszegoDnia: "Od pierwszego dnia niezdolności do pracy",
    formy: {
      "umowa-zlecenia": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      jdg: "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "umowa-o-prace": "Umowa o pracę",
    },
    notatkaOdPierwszego:
      "Wynagrodzenie chorobowe wypłaca pracodawca tylko pracownikowi. Za każdy dzień niezdolności do pracy przysługuje Ci zasiłek chorobowy, w ciąży w wysokości 100% podstawy.",
    wyliczeniaTytul: "Wyliczenia z zaświadczeń",
    wynagrodzenieKrotko: ({ rok }: { rok: number }) => `Wynagrodzenie chorobowe w ${rok}`,
    wrocDoPlanu: "Wróć do planu rodziny",
    // koniec ViewSickLeaveList
  },
  ViewContributionBalance: {
    tytulStrony: "Stan rozliczeń składek",
    naglowek: "Stan rozliczeń składek",
    powrot: "Plan rodziny",
    stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
    wystawZaswiadczenie: "Wystaw zaświadczenie o stanie rozliczeń",
    kartaChorobowy: "Zasiłek chorobowy",
    kartaMacierzynski: "Zasiłek macierzyński",
    kartaNaDzis: "Stan rozliczeń na dziś",
    dzienPrawaEzla: ({ data, numer }: { data: string; numer: string }) =>
      `Dzień powstania prawa: ${data} – pierwszy dzień niezdolności do pracy z zaświadczenia lekarskiego ${numer}.`,
    dzienPrawaPorod: ({ data }: { data: string }) => `Dzień powstania prawa: ${data} – dzień porodu.`,
    dzienPrawaTermin: ({ data }: { data: string }) =>
      `Dzień powstania prawa: ${data} – przewidywany termin porodu. Do tego dnia pokazujemy stan rozliczeń na dziś.`,
    zadluzenieNa: ({ data }: { data: string }) => `Zadłużenie z tytułu składek na ${data}`,
    objetaUmowaNa: ({ data, rodzaj }: { data: string; rodzaj: string }) => `Kwota objęta ${rodzaj} na ${data}`,
    objetaUmowaRodzaje: { "uklad-ratalny": "układem ratalnym", odroczenie: "odroczeniem terminu płatności" },
    zadluzenieOd: ({ data }: { data: string }) => `Zadłużenie od ${data}`,
    progZadluzenia: "Próg zadłużenia",
    umowa: "Układ ratalny albo odroczenie",
    umowaBrak: "Brak",
    umowaOpis: {
      "uklad-ratalny": "Układ ratalny",
      odroczenie: "Odroczenie terminu płatności",
    },
    umowaZgodnie: "raty spłacane zgodnie z umową",
    umowaNiezgodnie: "raty spłacane niezgodnie z umową",
    nieobjeteUmowa: "Zadłużenie nieobjęte umową",
    dataSplaty: "Data spłaty całego zadłużenia",
    sprawyWPlanie: "Sprawy w planie rodziny",
    wplywTytul: "Jak zadłużenie wpływa na zasiłek",
    wplywProg: ({ prog, minimalne }: { prog: string; minimalne: string }) =>
      `${prog} – 1% minimalnego wynagrodzenia ${minimalne}`,
    wplywPonadProgEtykieta: "Zadłużenie powyżej progu",
    wplywPonadProg:
      "Zasiłek nie przysługuje do spłaty całego zadłużenia. Spłata w ciągu 6 miesięcy od dnia powstania prawa daje zasiłek za cały okres.",
    wplywWyplataEtykieta: "Wypłata po spłacie",
    wplywWyplata: "ZUS wypłaca zasiłek najpóźniej w ciągu 60 dni od dnia spłaty.",
    notatkaOdczytu: "Stan rozliczeń pobieramy z eZUS przy każdym otwarciu przewodnika.",
    niedostepnyTytul: "Stan rozliczeń na dzień powstania prawa",
    niedostepnyOpis:
      "Tu zobaczysz kwotę zadłużenia i jego skutek dla zasiłku, gdy pobierzemy stan rozliczeń z eZUS. Spróbujemy ponownie przy następnym otwarciu przewodnika.",
    potwierdzWPlanie: "Potwierdź opłacenie składek w planie",
    brakDzialalnosci:
      "Stan rozliczeń składek dotyczy osoby, która prowadzi działalność i sama rozlicza składki. Twoje składki rozlicza płatnik składek.",
    wrocDoPlanu: "Wróć do planu rodziny",
    // koniec ViewContributionBalance
  },
  ViewContributionCertificate: {
    tytulStrony: "Zaświadczenie o stanie rozliczeń",
    naglowek: "Zaświadczenie o stanie rozliczeń",
    powrot: "Stan rozliczeń",
    flagaDemo: "Tryb demonstracyjny – symulacja wystawienia zaświadczenia",
    wyborTytul: "Wybierz dzień stanu rozliczeń",
    wyborOpis:
      "Wystawimy zaświadczenie o niezaleganiu w opłacaniu składek albo o wysokości zadłużenia na wybrany dzień. Dokument będzie oznaczony jako symulacja.",
    poleDnia: "Dzień stanu rozliczeń",
    podpowiedzDnia: ({ data }: { data: string }) =>
      `Podaj datę w formacie DD.MM.RRRR – dziś albo wcześniej, nie wcześniej niż ${data}, czyli początek Twojej działalności.`,
    podpowiedzDniaBezDzialalnosci: "Podaj datę w formacie DD.MM.RRRR – dziś albo wcześniej.",
    podpowiedzDomyslna: "Podpowiadamy dzień porodu, a przed porodem – dzień dzisiejszy.",
    wystaw: "Wystaw zaświadczenie",
    wrocDoStanu: "Wróć do stanu rozliczeń",
    coZawieraTytul: "Co znajdzie się w zaświadczeniu",
    coZawiera: [
      "Imię, nazwisko i numer PESEL",
      "Dzień stanu rozliczeń i rodzaj zaświadczenia",
      "Kwota zadłużenia i informacja o układzie ratalnym albo odroczeniu",
      "Data i godzina wystawienia oraz oznaczenie symulacji na każdej stronie",
    ],
    wystawioneTytul: "Wystawione zaświadczenie",
    rodzaj: "Rodzaj",
    dzienStanu: "Dzień stanu rozliczeń",
    kwotaZadluzenia: "Kwota zadłużenia",
    umowa: "Układ ratalny albo odroczenie",
    umowaPdf: "Układ ratalny albo odroczenie terminu płatności",
    umowaBrak: "Brak",
    umowaOpis: ({ rodzaj, kwota }: { rodzaj: string; kwota: string }) => `${rodzaj} – kwota objęta umową ${kwota}`,
    umowaRodzaje: { "uklad-ratalny": "Układ ratalny", odroczenie: "Odroczenie terminu płatności" },
    wystawiono: "Data i godzina wystawienia",
    rodzaje: {
      "o-niezaleganiu": "Zaświadczenie o niezaleganiu w opłacaniu składek",
      "o-wysokosci-zadluzenia": "Zaświadczenie o wysokości zadłużenia",
    },
    pobierz: "Pobierz zaświadczenie (PDF)",
    notatkaPobrania:
      "Zaświadczenie pobierzesz do końca sesji. To symulacja z wersji demonstracyjnej przewodnika, a nie dokument wydany przez ZUS.",
    innyDzienTytul: "Wystaw na inny dzień",
    podpowiedzInnegoDnia: ({ data }: { data: string }) =>
      `Podaj datę w formacie DD.MM.RRRR – dziś albo wcześniej, nie wcześniej niż ${data}.`,
    pdfSymulacjaGora: "SYMULACJA – dokument przygotowany w wersji demonstracyjnej przewodnika",
    pdfSymulacjaDol: "SYMULACJA – nie jest zaświadczeniem wydanym przez ZUS",
    pdfLogo: "Przewodnik rodzica",
    pdfWystawiono: ({ data }: { data: string }) => `Wystawiono: ${data}`,
    pdfPodtytul: "Stan rozliczeń składek na ubezpieczenia społeczne osoby prowadzącej pozarolniczą działalność",
    pdfImieNazwisko: "Imię i nazwisko",
    pdfPesel: "Numer PESEL",
    pdfRodzaj: "Rodzaj zaświadczenia",
    pdfPodpisTabeli: "Dane zaświadczenia o stanie rozliczeń",
    pdfPrzewijanie: "Dane zaświadczenia, przewiń w poziomie",
    pdfKolumnaPole: "Pole",
    pdfKolumnaWartosc: "Wartość",
    pdfPodsumowanieNiezaleganie: ({ data }: { data: string }) =>
      `Na dzień ${data} osoba wskazana powyżej nie ma zadłużenia z tytułu składek na ubezpieczenia społeczne.`,
    pdfPodsumowanieUmowa: ({ data }: { data: string }) =>
      `Na dzień ${data} osoba wskazana powyżej spłaca składki zgodnie z umową o spłacie, która obejmuje całe zadłużenie.`,
    pdfPodsumowanieZadluzenie: ({ data, kwota }: { data: string; kwota: string }) =>
      `Na dzień ${data} osoba wskazana powyżej ma zadłużenie z tytułu składek na ubezpieczenia społeczne w kwocie ${kwota}.`,
    pdfStrona: "Strona 1 z 1",
    nazwaPliku: ({ data }: { data: string }) => `zaswiadczenie-stan-rozliczen-${data}.pdf`,
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
    tytulWielu: "Nowe dzieci w danych ZUS",
    imieINazwisko: "Imię i nazwisko dziecka",
    dataUrodzenia: "Data urodzenia",
    listaDzieci: "Dzieci z danych ZUS",
    opisJednego: ({ data }: { data: string }) =>
      `Po potwierdzeniu zapiszemy w profilu rodziny datę porodu ${data}, liczbę urodzonych dzieci 1 oraz imię, nazwisko i numer PESEL dziecka.`,
    opisDwojga: ({ data }: { data: string }) =>
      `Po potwierdzeniu zapiszemy w profilu rodziny datę porodu ${data}, liczbę urodzonych dzieci 2 oraz imiona, nazwiska i numery PESEL obojga dzieci.`,
    opisWielu: ({ data, liczba }: { data: string; liczba: string }) =>
      `Po potwierdzeniu zapiszemy w profilu rodziny datę porodu ${data}, liczbę urodzonych dzieci ${liczba} oraz imiona, nazwiska i numery PESEL wszystkich dzieci.`,
    opisSzczegolow: "Potem zapytamy Cię o kilka szczegółów porodu.",
    potwierdz: "Potwierdź datę porodu",
    zamknij: "Zamknij",
    // koniec ModalNewChildDetected
  },
  ModalBenefitRules: {
    tytul: "Zastosowane reguły",
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
    tytulZNumerem: ({ numer }: { numer: string }) => `Zaświadczenie ${numer}`,
    seriaINumer: "Seria i numer",
    dataWystawienia: "Data wystawienia",
    okres: "Okres niezdolności do pracy",
    liczbaDni: "Liczba dni",
    kod: "Kod literowy",
    kodCiazy: "niezdolność do pracy w okresie ciąży",
    platnik: "Płatnik składek",
    rodzaj: "Rodzaj zaświadczenia",
    zamknij: "Zamknij",
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
    // koniec SheetAssistantActionConfirm
  },
} as const;
