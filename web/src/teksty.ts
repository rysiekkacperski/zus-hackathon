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
    nadawca: "Przewodnik rodzica",
    // Liczba dni w treści przypomnienia
    zostaloDni: ({ liczbaDni }: { liczbaDni: number }) =>
      liczbaDni === 1 ? "został 1 dzień" : `zostało ${liczbaDni} dni`,
    // Koszt albo skutek spóźnienia w wiadomości e-mail i w opisie wydarzenia pliku kalendarza
    kosztEmail: ({ kwota }: { kwota: string }) => `Spóźnienie kosztuje ${kwota}.`,
    skutekEmail: ({ skutek }: { skutek: string }) => `Skutek spóźnienia: ${skutek}.`,
    // Informacja o spóźnieniu w SMS
    kosztSms: ({ kwota }: { kwota: string }) => `Spóźnienie kosztuje ${kwota} zł.`,
    skutekSms: "Sprawdź skutek spóźnienia w przewodniku.",
    // Przypomnienie przed terminem e-mailem
    emailPrzedTerminem: {
      temat: ({ tytul, termin }: { tytul: string; termin: string }) => `Przypomnienie: ${tytul} do ${termin}`,
      tresc: ({ termin, zostalo, tytul, spoznienie, adres }: { termin: string; zostalo: string; tytul: string; spoznienie: string; adres: string }) =>
        `Dzień dobry, do ${termin} ${zostalo} na sprawę: ${tytul}.${spoznienie ? ` ${spoznienie}` : ""} Instrukcję znajdziesz w przewodniku dla rodziców: ${adres}. Ta wiadomość została wysłana automatycznie, nie odpowiadaj na nią.`,
    },
    // Przypomnienie w dniu terminu e-mailem
    emailWDniuTerminu: {
      temat: ({ tytul }: { tytul: string }) => `Dziś mija termin: ${tytul}`,
      tresc: ({ tytul, spoznienie, adres }: { tytul: string; spoznienie: string; adres: string }) =>
        `Dzień dobry, dziś mija termin sprawy: ${tytul}.${spoznienie ? ` ${spoznienie}` : ""} Jeśli sprawa jest już załatwiona, oznacz ją w przewodniku dla rodziców: ${adres}. Ta wiadomość została wysłana automatycznie, nie odpowiadaj na nią.`,
    },
    // Przypomnienie przed terminem SMS-em
    smsPrzedTerminem: ({ tytul, termin, zostalo, informacja, adres }: { tytul: string; termin: string; zostalo: string; informacja: string; adres: string }) =>
      `Przewodnik ZUS: ${tytul} do ${termin}, ${zostalo}.${informacja ? ` ${informacja}` : ""} Szczegóły: ${adres}`,
    // Przypomnienie w dniu terminu SMS-em
    smsWDniuTerminu: ({ tytul, informacja, adres }: { tytul: string; informacja: string; adres: string }) =>
      `Przewodnik ZUS: dziś mija termin: ${tytul}.${informacja ? ` ${informacja}` : ""} Załatwione? Oznacz w przewodniku: ${adres}`,
    // Kod weryfikacyjny SMS
    smsKodWeryfikacyjny: ({ kod }: { kod: string }) =>
      `Przewodnik ZUS: Twój kod do włączenia przypomnień SMS to ${kod}. Kod jest ważny 10 minut. Jeśli to nie Ty, zignoruj tę wiadomość.`,
    // Plik kalendarza
    nazwaKalendarza: "Terminy z przewodnika rodzica",
    nazwaPliku: ({ data }: { data: string }) => `terminy-przewodnika-rodzica-${data}.ics`,
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
    wstep: "Tu widzisz wiadomości e-mail i SMS, które przewodnik wysłał na konta w trybie demonstracyjnym, oraz wiadomości zaplanowane do wysłania.",
    tylkoDemo: "Skrzynka wiadomości działa wyłącznie w trybie demonstracyjnym.",
    konto: "Konto",
    kontoPodpowiedz: "Wybierz konto, którego wiadomości chcesz zobaczyć.",
    brakKonta: "To konto nie ma jeszcze wiadomości, bo nikt się na nie nie zalogował.",
    doreczanie: {
      tytul: "Wysyłka zaplanowanych wiadomości",
      opis: ({ teraz }: { teraz: string }) =>
        `Przewodnik wysyła zaplanowane wiadomości o ustalonej godzinie. Bieżąca chwila w trybie demonstracyjnym: ${teraz}.`,
      przycisk: "Doręcz zaplanowane do dzisiaj",
      wynik: ({ liczba }: { liczba: number }) =>
        liczba === 0 ? "Nie ma wiadomości zaplanowanych do tej chwili." : `Doręczyliśmy zaplanowane wiadomości: ${liczba}.`,
      zmienDate: "Zmień datę w ustawieniach trybu demonstracyjnego",
    },
    wyslane: {
      tytul: ({ liczba }: { liczba: number }) => `Wysłane wiadomości (${liczba})`,
      pusto: "Na to konto nie wysłaliśmy jeszcze żadnej wiadomości.",
    },
    zaplanowane: {
      tytul: ({ liczba }: { liczba: number }) => `Zaplanowane wiadomości (${liczba})`,
      pusto: "Na to konto nie ma zaplanowanych wiadomości.",
      podpis: "Wiadomości zaplanowane do wysłania",
      przewijanie: "Tabela wiadomości zaplanowanych do wysłania",
      kolumny: { data: "Data wysyłki", kanal: "Kanał", adresat: "Adresat", tresc: "Temat albo treść" },
    },
    pominiete: {
      tytul: ({ liczba }: { liczba: number }) => `Niewysłane wiadomości (${liczba})`,
      podpis: "Wiadomości, których przewodnik nie wysłał",
      przewijanie: "Tabela wiadomości, których przewodnik nie wysłał",
      kolumny: { data: "Planowana data", kanal: "Kanał", tresc: "Temat albo treść", powod: "Powód" },
      powody: {
        "brak-adresu": "Brak adresu e-mail albo potwierdzonego numeru telefonu",
        "sprawa-zalatwiona": "Sprawa jest złożona albo załatwiona",
        "brak-konta-przewodnika": "Adresat nie ma konta w przewodniku",
        inny: "Wiadomość nie została wysłana",
      },
    },
    kanaly: { email: "E-mail", sms: "SMS" },
    rodzaje: {
      "przypomnienie-przed-terminem": "Przypomnienie przed terminem",
      "przypomnienie-w-dniu-terminu": "Przypomnienie w dniu terminu",
      "kod-sms": "Kod weryfikacyjny SMS",
      "zmiana-statusu-wniosku": "Zmiana statusu wniosku",
      "odpowiedz-zus": "Odpowiedź ZUS",
      "mozliwosc-przejecia-urlopu": "Możliwość przejęcia urlopu",
      "pakiet-narodzin": "Pakiet narodzin",
    },
    od: "Od",
    do: "Do",
    data: "Data",
    nieodczytana: "Nieodczytana",
    oznaczOdczytana: "Oznacz jako odczytaną",
    liczbaZnakow: ({ liczba }: { liczba: number }) => `Długość wiadomości: ${liczba} znaków.`,
    adresZKontaZus: "Adres e-mail z danych konta ZUS",
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
      tytul: "Przypomnienia o terminach",
      wstep: "Przypomnimy Ci o każdej sprawie do zrobienia przed jej terminem i w dniu terminu, zawsze o 9:00. Gdy oznaczysz sprawę jako złożoną albo załatwioną, przestaniemy o niej przypominać.",
      wlacz: "Wysyłaj mi przypomnienia o terminach",
      wylaczone: {
        przed: "Przypomnienia są wyłączone. Nie wyślemy Ci przypomnień o żadnej sprawie, także o tej z najbliższym terminem. Terminy sprawdzisz na stronie",
        link: "Terminy",
        po: ".",
      },
      wyprzedzenie: "Wyprzedzenie przypomnienia w dniach",
      wyprzedzeniePodpowiedz: "Wpisz liczbę od 1 do 30. Gdy wpiszesz mniej niż 7, przypomnimy też 7 dni przed terminem. W dniu terminu przypominamy zawsze.",
      kanaly: "Kanały przypomnień",
      kanalyPodpowiedz: "Włącz jeden kanał albo oba.",
      email: "E-mail",
      emailWylaczonyPodpowiedz: "Po włączeniu wpiszemy adres z danych Twojego konta ZUS. Możesz go zmienić.",
      adresEmail: "Adres e-mail",
      adresEmailZKonta: "Wpisaliśmy adres z danych Twojego konta ZUS. Możesz go zmienić.",
      adresEmailBrakWKoncie: "W danych Twojego konta ZUS nie ma adresu e-mail. Wpisz adres, na który mamy wysyłać przypomnienia.",
      adresEmailWlasny: "Na ten adres wyślemy przypomnienia. Możesz go zmienić.",
      sms: "SMS",
      smsWylaczonyPodpowiedz: "Po włączeniu podasz numer telefonu i potwierdzisz go kodem z SMS-a.",
      numerTelefonu: "Numer telefonu",
      numerPodpowiedz: "Wpisz 9 cyfr, na początku możesz dodać +48. Wyślemy na ten numer kod ważny 10 minut.",
      numerPotwierdzony: "Numer potwierdzony",
      numerPotwierdzonyPodpowiedz: "Gdy zmienisz numer, potwierdzisz go nowym kodem z SMS-a.",
      nowyNumerCzeka: "Nowy numer czeka na potwierdzenie kodem. Do tego czasu nie wyślemy przypomnień SMS-em.",
      numerCzeka: "Numer czeka na potwierdzenie kodem. Do tego czasu nie wyślemy przypomnień SMS-em.",
      wyslijKod: "Wyślij kod",
      wyslijNowyKod: "Wyślij nowy kod",
      wyslijKodNaNumer: ({ numer }: { numer: string }) => `Wyślij kod na numer ${numer}`,
      kod: "Kod weryfikacyjny z SMS-a",
      kodPodpowiedz: "Wpisz 6 cyfr i zapisz ustawienia, żeby włączyć przypomnienia SMS-em.",
      zapisz: "Zapisz ustawienia",
      // koniec sekcjaPrzypomnien
    },
    kartaPlikuKalendarza: {
      tytul: "Terminy w Twoim kalendarzu",
      wstep: "Pobierz terminy spraw do zrobienia jako plik kalendarza i otwórz go w kalendarzu na komputerze albo na telefonie.",
      przycisk: "Pobierz plik kalendarza",
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
      wstepBezKopii: "Zaczynamy od danych, które ZUS ma na Twoim koncie.",
      stanNa: ({ dataICzas }: { dataICzas: string }) => `Stan na ${dataICzas}`,
      tytulOdczytu: "Pobieramy Twoje dane z ZUS",
      opisOdczytu: "Sprawdzamy dane z Twojego konta ZUS, żeby nie trzeba było ich wpisywać. To potrwa kilka sekund.",
      tekstPostepu: ({ pobrano, zKolei }: { pobrano: string; zKolei: string }) =>
        `Pobrano ${pobrano} z ${zKolei} rodzajów danych`,
      licznik: ({ pobrano, zKolei }: { pobrano: string; zKolei: string }) => `Pobrano: ${pobrano} z ${zKolei}`,
      czesci: {
        tytuly: "Tytuły ubezpieczenia i ubezpieczenie chorobowe",
        podstawy: "Podstawy składek z ostatnich 12 miesięcy",
        platnicy: "Płatnicy składek i wypłata zasiłków",
        czlonkowie: "Członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego",
        zasilki: "Zasiłki z ostatnich 6 miesięcy",
        kontakt: "Adres i adres e-mail konta eZUS",
      },
      stanyCzesci: {
        pobrano: "Pobrano",
        pobieramy: "Pobieramy",
        wKolejce: "W kolejce",
      },
      listaCzesci: "Części danych z konta ZUS",
      tylkoOdczyt: "Przewodnik tylko odczytuje dane z Twojego konta ZUS i niczego w nim nie zmienia.",
      tytulBrakuDanych: "Twoje dane z ZUS",
      opisBrakuDanych:
        "Tu zobaczysz dane z Twojego konta ZUS: tytuły ubezpieczenia, podstawy składek, płatników, członków rodziny i zasiłki.",
      pobierzPonownie: "Pobierz dane ponownie",
      pobierz: "Pobierz dane z ZUS",
      // koniec stanOdczytuZus
    },
    sekcjeDanychZus: {
      brakWartosci: "-",
      okresOd: ({ dataOd }: { dataOd: string }) => `od ${dataOd}`,
      okresOdDo: ({ dataOd, dataDo }: { dataOd: string; dataDo: string }) => `od ${dataOd} do ${dataDo}`,
      tytuly: {
        tytul: "Tytuły ubezpieczenia i podstawy składek",
        wstep: "Te dane pobraliśmy z Twojego konta ZUS, więc nie musisz ich wpisywać.",
        podpis: "Tytuły ubezpieczenia z okresem, ubezpieczeniem chorobowym i podstawą składek",
        przewijanie: "Tabela tytułów ubezpieczenia",
        kolumny: {
          tytul: "Tytuł ubezpieczenia",
          okres: "Okres tytułu",
          chorobowe: "Ubezpieczenie chorobowe",
          podstawa: "Podstawa składek z ostatnich 12 miesięcy",
        },
        brakTytulu: "Brak tytułu ubezpieczenia",
        brakDanych: "Brak tytułu ubezpieczenia w danych z konta ZUS",
        brakDanychNotatka:
          "Formę zatrudnienia, ubezpieczenie chorobowe i podstawę wymiaru zasiłku podasz sam na kolejnych ekranach profilu i w kalkulatorze zasiłku.",
        koniecTytulu: ({ tytul, dataKonca, dataBraku }: { tytul: string; dataKonca: string; dataBraku: string }) =>
          `Tytuł ${tytul} zakończył się ${dataKonca}. Od ${dataBraku} dane z ZUS nie pokazują żadnego tytułu ubezpieczenia.`,
      },
      rodzajeTytulu: {
        pracownik: "Pracownik",
        zleceniobiorca: "Zleceniobiorca",
        dzialalnosc: "Osoba prowadząca pozarolniczą działalność",
      },
      rodzajeTytuluDopelniacz: {
        pracownik: "pracownika",
        zleceniobiorca: "zleceniobiorcy",
        dzialalnosc: "osoby prowadzącej pozarolniczą działalność",
      },
      tytulDo: ({ tytul, dataDo }: { tytul: string; dataDo: string }) => `${tytul}, do ${dataDo}`,
      rodzajeChorobowego: {
        obowiazkowe: "Obowiązkowe",
        dobrowolne: "Dobrowolne",
        brak: "Brak",
      },
      chorobowe: ({ rodzaj, okres }: { rodzaj: string; okres: string }) => `${rodzaj} ${okres}`,
      podstawy: {
        wKazdymMiesiacu: ({ kwota }: { kwota: string }) => `${kwota} w każdym miesiącu`,
        wKazdymMiesiacuOdDo: ({ kwota, miesiacOd, miesiacDo }: { kwota: string; miesiacOd: string; miesiacDo: string }) =>
          `${kwota} w każdym miesiącu od ${miesiacOd} do ${miesiacDo}`,
        wDwochMiesiacach: ({ kwota, miesiacPierwszy, miesiacDrugi }: { kwota: string; miesiacPierwszy: string; miesiacDrugi: string }) =>
          `${kwota} w ${miesiacPierwszy} i ${miesiacDrugi}`,
        wMiesiacu: ({ kwota, miesiac }: { kwota: string; miesiac: string }) => `${kwota} w ${miesiac}`,
      },
      // Odmiana nazw miesięcy do opisu podstaw składek (od listopada 2025, w październiku 2026).
      miesiaceDopelniacz: [
        "stycznia",
        "lutego",
        "marca",
        "kwietnia",
        "maja",
        "czerwca",
        "lipca",
        "sierpnia",
        "września",
        "października",
        "listopada",
        "grudnia",
      ],
      miesiaceMiejscownik: [
        "styczniu",
        "lutym",
        "marcu",
        "kwietniu",
        "maju",
        "czerwcu",
        "lipcu",
        "sierpniu",
        "wrześniu",
        "październiku",
        "listopadzie",
        "grudniu",
      ],
      platnicy: {
        tytul: "Płatnicy składek",
        podpis: "Płatnicy składek przy tytułach ubezpieczenia z informacją o wypłacie zasiłków",
        przewijanie: "Tabela płatników składek",
        kolumny: {
          tytul: "Tytuł ubezpieczenia",
          platnik: "Płatnik składek",
          nip: "NIP",
          regon: "REGON",
          wyplaca: "Płatnik wypłaca zasiłki",
        },
        wyplaca: {
          tak: "Tak",
          nie: "Nie",
          "brak-informacji": "Brak informacji w danych ZUS",
          "nie-dotyczy": "-",
        },
        zasada:
          "Płatnik wypłaca zasiłki, gdy według stanu na 30 listopada poprzedniego roku zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób.",
        brakInformacji: ({ platnicy }: { platnicy: string }) =>
          `Dane z ZUS nie mówią tego o ${platnicy}, więc zapytamy Cię o to na następnym ekranie.`,
        spojnikPlatnikow: " i ",
        dzialalnosc: "Przy działalności gospodarczej płatnikiem składek jesteś Ty, a zasiłki wypłaca ZUS.",
      },
      czlonkowie: {
        tytul: "Członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego",
        tytulZLiczba: ({ liczba }: { liczba: string }) =>
          `Członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego (${liczba})`,
        brak: "Brak zgłoszonych członków rodziny",
        podpis: "Członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego z oznaczeniem nowego dziecka",
        przewijanie: "Tabela członków rodziny",
        kolumny: {
          imieINazwisko: "Imię i nazwisko",
          pesel: "Numer PESEL",
          dataUrodzenia: "Data urodzenia",
          oznaczenie: "Oznaczenie",
        },
        noweDziecko: "Nowe dziecko",
        spojnikImion: " i ",
        noweDzieckoPoOdczycie: ({ imieINazwisko, dataOdczytu }: { imieINazwisko: string; dataOdczytu: string }) =>
          `${imieINazwisko} to nowe dziecko, którego nie było w danych z ${dataOdczytu}. Przekażemy to do Twojego profilu rodziny.`,
        noweDzieciPoOdczycie: ({ imieINazwisko, dataOdczytu }: { imieINazwisko: string; dataOdczytu: string }) =>
          `${imieINazwisko} to nowe dzieci, których nie było w danych z ${dataOdczytu}. Przekażemy to do Twojego profilu rodziny.`,
        noweDzieckoPierwszyOdczyt: ({ imieINazwisko }: { imieINazwisko: string }) =>
          `${imieINazwisko} to nowe dziecko urodzone w ciągu ostatnich 30 dni. Przekażemy to do Twojego profilu rodziny.`,
        noweDzieciPierwszyOdczyt: ({ imieINazwisko }: { imieINazwisko: string }) =>
          `${imieINazwisko} to nowe dzieci urodzone w ciągu ostatnich 30 dni. Przekażemy to do Twojego profilu rodziny.`,
      },
      zasilki: {
        tytul: "Zasiłki z ostatnich 6 miesięcy",
        brak: "Brak zasiłków wypłaconych przez ZUS",
        podpis: "Zasiłki wypłacone przez ZUS w ostatnich 6 miesiącach",
        przewijanie: "Tabela zasiłków",
        kolumny: {
          rodzaj: "Rodzaj zasiłku",
          data: "Data wypłaty",
          kwota: "Kwota",
          sposob: "Sposób wypłaty",
          wyplacil: "Wypłacił",
        },
        wyplacil: "ZUS",
        notatka: "Pokazujemy zasiłki, które wypłacił Ci ZUS.",
        rodzaje: {
          "zasilek-chorobowy": "Zasiłek chorobowy",
          "zasilek-macierzynski": "Zasiłek macierzyński",
          "zasilek-opiekunczy": "Zasiłek opiekuńczy",
          "zasilek-wyrownawczy": "Zasiłek wyrównawczy",
          "swiadczenie-rehabilitacyjne": "Świadczenie rehabilitacyjne",
        } as Readonly<Record<string, string>>,
        sposoby: {
          przelew: "Przelew",
          "przekaz-pocztowy": "Przekaz pocztowy",
        },
      },
      kontakt: {
        tytul: "Adres i kontakt",
        adres: "Adres",
        email: "Adres e-mail konta eZUS",
      },
      tylkoOdczyt:
        "Przewodnik tylko odczytuje dane z Twojego konta ZUS i niczego w nim nie zmienia. Odświeżamy je przy każdym otwarciu przewodnika.",
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
      tytul: "Drugi rodzic",
      tytulDrugiegoRodzica: "Drugi rodzic – Twoje dane",
      zmien: "Zmień",
      zmienEtykieta: "Zmień sekcję Drugi rodzic",
      podpisTabeli: "Dane drugiego rodzica",
      przewijanie: "Tabela danych drugiego rodzica",
      kolumny: { dane: "Dane", wartosc: "Wartość", zrodlo: "Źródło" },
      wiersze: {
        imieINazwisko: "Imię i nazwisko",
        rola: "Rola w przewodniku",
        forma: "Forma zatrudnienia",
        dobrowolne: "Dobrowolne ubezpieczenie chorobowe",
        chorobowe: "Ubezpieczenie chorobowe",
        podstawa: "Podstawa składek",
        platnik: "Płatnik zasiłku",
        platnikWyplaca: "Płatnik składek wypłaca zasiłki",
        zasilki: "Wypłacone zasiłki",
        dostep: "Dostęp do planu",
      },
      zrodla: {
        "konto-zus": "Konto ZUS",
        "pelnomocnictwo-pel": "Pełnomocnictwo PEL",
        "odpowiedz-rodzica": "Odpowiedź rodzica",
        brak: "-",
      },
      formy: {
        "umowa-o-prace": "Umowa o pracę",
        "umowa-zlecenia": "Umowa zlecenia",
        jdg: "Jednoosobowa działalność gospodarcza",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      formyWTekscie: {
        "umowa-o-prace": "umowa o pracę",
        "umowa-zlecenia": "umowa zlecenia",
        jdg: "jednoosobowa działalność gospodarcza",
        "brak-tytulu": "brak tytułu do ubezpieczenia",
      },
      zDobrowolnym: ({ forma }: { forma: string }) => `${forma} z dobrowolnym ubezpieczeniem chorobowym`,
      bezDobrowolnego: ({ forma }: { forma: string }) => `${forma} bez dobrowolnego ubezpieczenia chorobowego`,
      tak: "Tak",
      nie: "Nie",
      nieDotyczy: "Nie dotyczy",
      nieDotyczyObowiazkowe: "Nie dotyczy – ubezpieczenie chorobowe obowiązkowe",
      brakDanych: "-",
      rodzajeChorobowego: {
        obowiazkowe: "Obowiązkowe",
        dobrowolne: "Dobrowolne",
        brak: "Brak ubezpieczenia chorobowego",
      },
      platnicy: {
        zus: "ZUS",
        "platnik-skladek": "Płatnik składek",
        nieustalony: "Nieustalony",
        "brak-platnika": "Brak płatnika zasiłku",
      },
      wyplacaZasilki: {
        tak: "Tak",
        nie: "Nie",
        "brak-informacji": "Brak informacji",
        "nie-dotyczy": "Nie dotyczy",
      },
      formaZTytulem: ({ forma, tytul }: { forma: string; tytul: string }) => `${forma} – ${tytul}`,
      tytuly: {
        pracownik: ({ data }: { data: string }) => `tytuł pracownika od ${data}`,
        zleceniobiorca: ({ data }: { data: string }) => `tytuł zleceniobiorcy od ${data}`,
        dzialalnosc: ({ data }: { data: string }) => `działalność gospodarcza od ${data}`,
      },
      podstawaStala: ({ kwota }: { kwota: string }) => `${kwota} w każdym z ostatnich 12 miesięcy`,
      podstawaOstatnia: ({ kwota, miesiac }: { kwota: string; miesiac: string }) => `${kwota} za ${miesiac}`,
      brakPodstaw: "Brak podstaw składek",
      brakZasilkow: "Brak wypłaconych zasiłków",
      zasilek: ({ rodzaj, kwota, data }: { rodzaj: string; kwota: string; data: string }) =>
        `${rodzaj}: ${kwota}, wypłata ${data}`,
      nieDolaczyl: "Nie dołączył",
      drugiRodzicOd: ({ data }: { data: string }) => `Drugi rodzic od ${data}`,
      odlaczony: ({ data }: { data: string }) => `Odłączony ${data}`,
      zrodloPelnomocnictwa: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Źródło: pełnomocnictwo PEL od ${imieINazwisko}. Data odczytu:`,
      odlaczonyOpis: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `${imieINazwisko} nie ma już dostępu do planu rodziny. Przypomnienia o jego sprawach, np. o urlopie ojcowskim, wysyłamy teraz na Twoje konto.`,
      zaproszenie: {
        naglowek: "Zaproś drugiego rodzica do planu",
        naglowekPonownie: "Zaproś drugiego rodzica ponownie",
        opis: "Drugi rodzic zobaczy Wasz wspólny plan i swoje uprawnienia, a przypomnienia o jego terminach trafią na jego konto.",
        opisPonownie: "Po przyjęciu zaproszenia drugi rodzic znów zobaczy Wasz wspólny plan, a jego dane odczytamy z jego konta ZUS.",
        opisPrzyDanychZPelnomocnictwa: "Po dołączeniu drugi rodzic zobaczy Wasz wspólny plan, a jego dane odczytamy bezpośrednio z jego konta ZUS.",
        przycisk: "Zaproś drugiego rodzica",
      },
      pelnomocnictwo: {
        naglowek: "Pobierz dane z pełnomocnictwa PEL",
        naglowekPrzyDanych: "Pełnomocnictwo PEL",
        opis: "Drugi rodzic nie dołączy do planu? Jeśli udzielił Ci w eZUS pełnomocnictwa PEL do roli Ubezpieczony, odczytamy dane jego ubezpieczenia do Waszego planu.",
        opisPoOdlaczeniu: "Jeśli drugi rodzic udzielił Ci w eZUS pełnomocnictwa PEL do roli Ubezpieczony, odczytamy dane jego ubezpieczenia do Waszego planu.",
        okres: ({ imieINazwisko, okres }: { imieINazwisko: string; okres: string }) =>
          `Pełnomocnictwo od ${imieINazwisko} obowiązuje ${okres}.`,
        przycisk: "Sprawdź pełnomocnictwo",
      },
      dolaczony: {
        naglowek: ({ imieINazwisko }: { imieINazwisko: string }) => `${imieINazwisko} widzi Wasz plan`,
        opis: ({ imie }: { imie: string }) =>
          `${imie} ma dostęp do planu rodziny, terminów, swoich wniosków, kalkulatorów i asystenta. Przypomnienia o jego sprawach, np. o urlopie ojcowskim, trafiają na jego konto.`,
        opisOdlaczenia: "Sytuacja rodziny się zmieniła? Możesz odłączyć drugiego rodzica od planu.",
        przycisk: "Odłącz drugiego rodzica",
      },
      notatki: {
        nieDolaczyl: "Urlop ojcowski i 9 tygodni urlopu rodzicielskiego przepadają, jeśli drugi rodzic z nich nie skorzysta. Dopóki nie dołączy do planu, przypomnienia o jego sprawach wysyłamy na Twoje konto.",
        dolaczyl: ({ imieINazwisko }: { imieINazwisko: string }) =>
          `Dane z konta ZUS ${imieINazwisko} zastąpiły Twoje odpowiedzi o drugim rodzicu. Plan rodziny wyliczyliśmy ponownie.`,
        poOdlaczeniu: "Dane drugiego rodzica zostały w profilu jako Twoja odpowiedź. Sprawdź, czy są aktualne.",
        zPelnomocnictwa: ({ odpowiedzi }: { odpowiedzi: string }) =>
          `Twoje odpowiedzi o drugim rodzicu (${odpowiedzi}) zachowaliśmy. Przywrócimy je, gdy pełnomocnictwo wygaśnie albo zostanie odwołane.`,
        zPelnomocnictwaBezOdpowiedzi: "Twoje odpowiedzi o drugim rodzicu zachowaliśmy. Przywrócimy je, gdy pełnomocnictwo wygaśnie albo zostanie odwołane.",
        widokDrugiegoRodzica: ({ imieINazwisko, odpowiedz }: { imieINazwisko: string; odpowiedz: string }) =>
          `Dane z Twojego konta ZUS zastąpiły odpowiedź ${imieINazwisko} o drugim rodzicu (${odpowiedz}). Plan rodziny wyliczyliśmy ponownie.`,
        widokDrugiegoRodzicaBezOdpowiedzi: "Dane z Twojego konta ZUS zastąpiły odpowiedź rodzica o drugim rodzicu. Plan rodziny wyliczyliśmy ponownie.",
      },
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
    powrot: "Profil rodziny",
    tytulPelnomocnictwa: "Pełnomocnictwo PEL w eZUS",
    tytulStanu: "Stan pełnomocnictwa",
    przewijanie: "Tabela pełnomocnictwa PEL",
    wiersze: {
      stan: "Stan",
      mocodawca: "Mocodawca",
      pelnomocnik: "Pełnomocnik",
      rola: "Rola",
      zakres: "Zakres",
      okres: "Okres obowiązywania",
      wymaganaRola: "Wymagana rola",
      wymaganyZakres: "Wymagany zakres",
    },
    ty: ({ imieINazwisko }: { imieINazwisko: string }) => `${imieINazwisko} (Ty)`,
    stany: {
      obowiazuje: "Obowiązuje",
      ograniczone: "Ograniczone do korespondencji",
      wygaslo: "Wygasło",
      odwolane: "Odwołane",
      brak: "Brak pełnomocnictwa",
    },
    obowiazujeOd: ({ data }: { data: string }) => `Obowiązuje od ${data}`,
    rolaUbezpieczony: "Ubezpieczony",
    zakresy: {
      "bez-ograniczen": "Bez ograniczenia do korespondencji",
      korespondencja: "Wyłącznie korespondencja",
    },
    okresDoOdwolania: ({ od }: { od: string }) => `od ${od} do odwołania`,
    okresOdDo: ({ od, doDnia }: { od: string; doDnia: string }) => `od ${od} do ${doDnia}`,
    opisOdczytu: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Na podstawie tego pełnomocnictwa odczytamy dane ubezpieczenia ${imieINazwisko} z jego konta ZUS, zapiszemy je w profilu rodziny i ponownie wyliczymy plan.`,
    opisBleduOdczytu: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Danych ${imieINazwisko} nie zapisaliśmy. Twoje odpowiedzi o drugim rodzicu się nie zmieniły, a plan rodziny pozostał bez zmian.`,
    opisPrzyszlej: ({ imieINazwisko, data }: { imieINazwisko: string; data: string }) =>
      `Do tego dnia plan rodziny liczymy z Twoich odpowiedzi o drugim rodzicu. Dane ${imieINazwisko} odczytamy przy pierwszym otwarciu przewodnika od ${data} – nie musisz nic robić.`,
    odczytajDane: "Odczytaj dane",
    odczytajPonownie: "Odczytaj dane ponownie",
    wrocDoProfilu: "Wróć do profilu rodziny",
    daneKtoreOdczytamy: "Dane, które odczytamy",
    zakresDanych: [
      "Tytuły i okresy ubezpieczenia",
      "Ubezpieczenie chorobowe",
      "Podstawy składek",
      "Informację, czy płatnik składek wypłaca zasiłki",
      "Wypłacone zasiłki",
    ],
    notatkaEzla: "Innych danych z konta drugiego rodzica, np. zaświadczeń lekarskich e-ZLA, nie odczytujemy.",
    notatkaOdswiezania: "Dane odczytamy ponownie przy każdym otwarciu przewodnika. Gdy pełnomocnictwo wygaśnie albo zostanie odwołane, usuniemy je i przywrócimy Twoje odpowiedzi o drugim rodzicu.",
    instrukcja: {
      tytul: "Jak udzielić pełnomocnictwa PEL w eZUS",
      wstepBrak: "Pokaż tę instrukcję drugiemu rodzicowi. Pełnomocnictwo składa on na swoim koncie w eZUS.",
      wstepOgraniczone: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Na podstawie pełnomocnictwa do korespondencji nie odczytamy danych ubezpieczenia. ${imieINazwisko} zmieni zakres, składając ponownie wniosek PEL. Pokaż mu tę instrukcję.`,
      wstepNowe: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `${imieINazwisko} udzieli nowego pełnomocnictwa, składając ponownie wniosek PEL. Pokaż mu tę instrukcję.`,
      krok1: "Zaloguj się do eZUS na swoje konto.",
      krok2: { przed: "Wybierz wniosek ", wyroznienie: "PEL", po: " – pełnomocnictwo." },
      krok3: { przed: "Jako pełnomocnika wpisz: imię ", nazwisko: ", nazwisko ", pesel: ", numer PESEL ", po: "." },
      krok4: { przed: "W sekcji eZUS zaznacz rolę ", rola: "Ubezpieczony", zakres: " bez ograniczenia do korespondencji", po: " i wyślij wniosek." },
      poWyslaniuBrak: "Gdy drugi rodzic wyśle wniosek, sprawdź pełnomocnictwo ponownie.",
      poWyslaniu: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Gdy ${imieINazwisko} wyśle nowy wniosek, sprawdź pełnomocnictwo ponownie.`,
      sprawdzPonownie: "Sprawdź ponownie",
      przejdzDoEzus: "Przejdź do eZUS",
    },
    notatkaBrak: "Do czasu udzielenia pełnomocnictwa plan rodziny liczymy z Twoich odpowiedzi o drugim rodzicu.",
    notatkaOgraniczone: "Plan rodziny liczymy z Twoich odpowiedzi o drugim rodzicu.",
    notatkaWygaslo: "Danych z wygasłego pełnomocnictwa nie przechowujemy. Plan rodziny liczymy z Twoich odpowiedzi o drugim rodzicu.",
    notatkaOdwolane: "Danych z odwołanego pełnomocnictwa nie przechowujemy. Plan rodziny liczymy z Twoich odpowiedzi o drugim rodzicu.",
    sprawdzono: "Sprawdziliśmy pełnomocnictwo ponownie.",
    bezAkcji: {
      dolaczyl: "Drugi rodzic dołączył do Waszego planu, więc jego dane odczytujemy z jego konta ZUS.",
      brakDrugiegoRodzica: "Profil rodziny nie zawiera drugiego rodzica.",
    },
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
      brakTerminu: "-",
      dniDoTerminu: ({ liczba }: { liczba: string }) => `${liczba} dni do terminu`,
      dzisTermin: "Termin mija dzisiaj",
      poTerminie: "Po terminie",
      minal: ({ liczba }: { liczba: string }) => `Minął ${liczba} dni temu`,
      szacowany: "Szacowany",
      koszt: "Koszt:",
      skutek: "Skutek:",
      coNajmniej: "co najmniej",
      wDniuPoTerminie: "w dniu po terminie",
      naDzis: "na dziś",
      etykietaTerminu: "Termin",
      etykietaKosztu: "Koszt albo skutek spóźnienia",
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
    // koniec ViewPregnancyBenefits
  },
  ViewCaseDetails: {
    tytulStrony: "Szczegóły sprawy",
    naglowek: "Szczegóły sprawy",
    // Sekcje sprawy/[idSprawy]/_sekcje (u13, u14, u16, u14, u14, u22, u22, u22, u25, u24, u30, u12)
    sekcjaTerminIKoszt: {
      termin: "Termin",
      terminy: ({ liczba }: { liczba: string }) => `Terminy (${liczba})`,
      dwaTerminyWstep: "Ta sprawa ma dwa terminy. Pokazujemy je w kolejności dat.",
      dniDoTerminu: ({ liczba }: { liczba: string }) => `${liczba} dni do terminu`,
      dzisTermin: "Termin mija dzisiaj",
      poTerminie: "Po terminie",
      minal: ({ liczba }: { liczba: string }) => `Minął ${liczba} dni temu`,
      szacowany: "Szacowany",
      powtarzaSie: "Powtarza się co roku",
      jakPoliczylismy: "Jak policzyliśmy termin",
      jakPoliczylismyZDwukropkiem: ({ opis }: { opis: string }) => `Jak policzyliśmy termin: ${opis}.`,
      opisTerminu: ({ opis }: { opis: string }) => `${opis.charAt(0).toUpperCase()}${opis.slice(1)}.`,
      opisDrugiegoTerminu: {
        "wniosek-o-urlop": "Do tego dnia składasz pracodawcy wniosek o urlop na warunkach urlopu macierzyńskiego.",
        "wariant-81-5": "Wniosek o urlop na warunkach urlopu macierzyńskiego i urlop rodzicielski złożony do tego dnia daje zasiłek w wysokości 81,5% za cały okres.",
      },
      wazneDaty: ({ rok }: { rok: string }) => `Ważne daty w ${rok} roku`,
      poczatekSkladania: "Początek składania wniosków",
      trwa: "Trwa",
      zalecanyTermin: "Zalecany termin, który daje wypłatę bez przerwy od 1 czerwca",
      terminWniosku: "Termin",
      zalatwionaWRoku: ({ rok }: { rok: string }) => `Załatwiona w ${rok} roku`,
      nastepnyTermin: "Następny termin",
      wracaDoZrobienia: ({ data }: { data: string }) => `Sprawa wróci do statusu do zrobienia ${data}.`,
      skutekSpoznienia: "Skutek spóźnienia",
      kosztSpoznienia: "Koszt spóźnienia",
      wDniuPoTerminie: ({ data }: { data: string }) => `W dniu po terminie, ${data}`,
      naDzis: ({ data }: { data: string }) => `Na dziś, ${data}`,
      coNajmniej: "Co najmniej",
      opisKosztuMiesiecznego: "Jeśli złożysz wniosek po terminie, świadczenie dostaniesz od miesiąca złożenia wniosku. Świadczenie za wcześniejsze miesiące przepada.",
      opisKosztuJednorazowego: "Jeśli złożysz wniosek po terminie, świadczenie przepada.",
      jakPoliczylismyKoszt: "Jak policzyliśmy koszt",
      podpisTabeli: "Wyliczenie kosztu spóźnienia według miesięcy",
      przewijanieTabeli: "Tabela wyliczenia kosztu spóźnienia",
      kolumnaMiesiac: "Miesiąc",
      kolumnaKwota: "Kwota na 1 dziecko",
      kolumnaRazem: "Razem",
      razem: "Razem",
      wyjasnienie: ({ liczba }: { liczba: string }) =>
        `Liczymy kwotę obowiązującą w każdym miesiącu i mnożymy ją przez liczbę dzieci, gdy świadczenie przysługuje na każde dziecko. Liczba dzieci w sprawie: ${liczba}.`,
      wzrost: ({ kwota }: { kwota: string }) => `Za każdy kolejny miesiąc zwłoki koszt wzrośnie o ${kwota}.`,
      przypomnienia: "Jeśli masz włączone przypomnienia, przypomnimy Ci o każdym terminie osobno. Ustawisz je w",
      ustawieniach: "Ustawieniach",
      daneProfilu: "Dane z profilu",
      daneProfiluWstep: "Od tych danych liczymy termin i koszt spóźnienia.",
      potwierdzona: ({ data }: { data: string }) => `${data}, potwierdzona`,
      zmienDane: "Zmień dane w profilu",
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
      przycisk: "Pobierz plik kalendarza",
      // koniec akcjaPlikuKalendarza
    },
    wstep: "Tu zobaczysz terminy spraw z planu rodziny – od najbliższego. Przy każdym terminie pokazujemy, ile stracisz albo co się stanie, jeśli się spóźnisz.",
    filtry: {
      etykieta: "Rodzaj terminu",
      wszystkie: ({ liczba }: { liczba: string }) => `Wszystkie (${liczba})`,
      zKosztem: ({ liczba }: { liczba: string }) => `Z kosztem w złotych (${liczba})`,
      powtarzalne: ({ liczba }: { liczba: string }) => `Powtarzalne (${liczba})`,
      kogoDotyczy: "Kogo dotyczy",
      wszyscy: "Wszyscy",
      nazwaZKosztem: "z kosztem w złotych",
      nazwaPowtarzalne: "powtarzalne",
      opis: ({ lista }: { lista: string }) => `Filtry: ${lista}.`,
      terminy: "Terminy:",
      z: "z",
      wyczysc: "Wyczyść filtry",
    },
    licznik: { terminy: "Terminy:", poTerminie: "po terminie:", szacowane: "szacowane:" },
    notaSzacowane: ({ data }: { data: string }) =>
      `Terminy oznaczone jako szacowane liczymy od przewidywanego terminu porodu ${data}. Gdy potwierdzisz datę porodu, przeliczymy je od tej daty.`,
    sekcje: {
      poTerminie: ({ liczba }: { liczba: string }) => `Po terminie (${liczba})`,
      poTerminieOpis: "Termin tych spraw już minął. Załatw je jak najszybciej.",
      najblizsze: ({ liczba }: { liczba: string }) => `Najbliższe 30 dni (${liczba})`,
      najblizszeOpis: ({ data }: { data: string }) => `Terminy do ${data}.`,
      najblizszePuste: ({ data }: { data: string }) => `Do ${data} nie masz terminów spraw z planu.`,
      najblizszePusteZKosztem: ({ data }: { data: string }) => `Do ${data} nie masz terminów z kosztem w złotych.`,
      pozniej: ({ liczba }: { liczba: string }) => `Później (${liczba})`,
      pozniejOpis: ({ data }: { data: string }) => `Terminy od ${data}.`,
      pozniejPuste: ({ data }: { data: string }) => `Od ${data} nie masz terminów spraw z planu.`,
      listaTerminow: "Lista terminów",
    },
    pozycja: {
      dniDoTerminu: ({ liczba }: { liczba: string }) => `${liczba} dni do terminu`,
      dzisTermin: "Termin mija dzisiaj",
      poTerminie: "Po terminie",
      minal: ({ liczba }: { liczba: string }) => `Minął ${liczba} dni temu`,
      szacowany: "Szacowany",
      kogoDotyczy: "Kogo dotyczy: ",
      dzieci: ({ liczba }: { liczba: string }) => `Dzieci: ${liczba}`,
      powtarzaSie: "Powtarza się co roku",
      zalezyOdDochodu: "Zależy od dochodu",
      kosztSpoznienia: "Koszt spóźnienia:",
      skutekSpoznienia: "Skutek spóźnienia:",
      coNajmniej: "co najmniej",
      wDniuPoTerminie: "w dniu po terminie",
      naDzis: "na dziś",
      jakZalatwic: "Jak załatwić sprawę",
      jakZalatwicSprawe: ({ tytul }: { tytul: string }) => `Jak załatwić sprawę: ${tytul}`,
      wizytaOdbylaSie: "Wizyta już się odbyła? Wpisz jej datę w",
      profiluRodziny: "profilu rodziny",
      drugiTermin: ({ etykieta }: { etykieta: string }) => `Termin: ${etykieta}`,
    },
    pusty: {
      tekst: "Tu zobaczysz terminy spraw z Twojego planu. Teraz nie masz spraw do zrobienia z terminem.",
      akcja: "Zobacz plan rodziny",
      nota: "Tu nie pokazujemy spraw złożonych, załatwionych ani spraw bez terminu. Sprawy powtarzalne wrócą tu same: wniosek o 800+ na kolejny okres świadczeniowy 1 lutego, a dwa dni opieki nad dzieckiem 1 stycznia.",
    },
    daneProfilu: {
      tytul: "Dane z profilu",
      wstep: "Od tych danych liczymy terminy i koszt spóźnienia. Po porodzie potwierdź datę porodu – przeliczymy terminy szacowane od tej daty.",
      ptp: "Przewidywany termin porodu",
      dataPorodu: "Data porodu",
      wizyta: "Pierwsza wizyta u lekarza albo położnej",
      brakWizyty: "Brak wizyty",
      liczbaDzieci: "Liczba dzieci z ciąży",
      dochod: "Dochód na osobę",
      dochodNieznany: "Nieznany",
      drugiRodzic: "Drugi rodzic",
      dataPrzyjecia: "Data przyjęcia dziecka na wychowanie",
      dataUrodzeniaDziecka: "Data urodzenia dziecka",
      dataUprawomocnienia: "Data uprawomocnienia się orzeczenia",
      brak: "-",
      zmien: "Zmień dane w profilu",
      formy: {
        "umowa-o-prace": "umowa o pracę",
        "umowa-zlecenia": "umowa zlecenia",
        jdg: "jednoosobowa działalność gospodarcza",
        "brak-tytulu": "brak tytułu do ubezpieczenia",
        "brak-drugiego-rodzica": "brak drugiego rodzica",
      },
    },
    noty: {
      przeliczanie: "Terminy przeliczamy codziennie o północy i po każdej zmianie dat w profilu. Tu nie pokazujemy spraw złożonych, załatwionych ani spraw bez terminu – znajdziesz je w",
      planieRodziny: "planie rodziny",
      przypomnienia: "Chcesz dostawać przypomnienia o terminach? Ustawisz je w",
      ustawieniach: "Ustawieniach",
      zKosztem: "Filtr „Z kosztem w złotych” pokazuje sprawy, przy których spóźnienie oznacza utratę pieniędzy. Sprawy ze skutkiem bez kwoty, na przykład zgłoszenie urodzenia dziecka, zobaczysz po wybraniu „Wszystkie”.",
    },
    // Etykiety rodzica sprawy w polu „Kogo dotyczy”.
    rodzic: {
      matka: ({ imieINazwisko }: { imieINazwisko: string }) => `Matka – ${imieINazwisko}`,
      drugiRodzic: ({ imieINazwisko }: { imieINazwisko: string }) => `Drugi rodzic – ${imieINazwisko}`,
      rodzicPrzyjmujacy: ({ imieINazwisko }: { imieINazwisko: string }) => `Rodzic, który przyjął dziecko – ${imieINazwisko}`,
      matkaBezImienia: "Matka",
      drugiRodzicBezImienia: "Drugi rodzic",
      obojeRodzice: "Oboje rodzice",
      matkaAlboOjciec: "Matka albo ojciec",
      rodzicPrzyjmujacyBezImienia: "Rodzic, który przyjął dziecko",
    },
    // Opisy kosztu spóźnienia przy kwocie.
    opisKosztu: {
      zaMiesiace: ({ kwota, od, doMiesiaca }: { kwota: string; od: string; doMiesiaca: string }) =>
        `${kwota} za każdy miesiąc od ${od} do ${doMiesiaca}`,
      zaMiesiaceNaDziecko: ({ kwota, liczba, od, doMiesiaca }: { kwota: string; liczba: string; od: string; doMiesiaca: string }) =>
        `${kwota} na każde z ${liczba} dzieci za każdy miesiąc od ${od} do ${doMiesiaca}`,
      zaMiesiac: ({ kwota, miesiac }: { kwota: string; miesiac: string }) => `${kwota} za ${miesiac}`,
      zaMiesiacNaDziecko: ({ kwota, liczba, miesiac }: { kwota: string; liczba: string; miesiac: string }) =>
        `${kwota} na każde z ${liczba} dzieci za ${miesiac}`,
      zaMiesiaceRozne: ({ od, doMiesiaca }: { od: string; doMiesiaca: string }) => `za miesiące od ${od} do ${doMiesiaca}`,
      naDziecko: ({ kwota, liczba }: { kwota: string; liczba: string }) => `${kwota} na każde z ${liczba} dzieci`,
      becikoweIDodatek: "becikowe i dodatek z tytułu urodzenia dziecka",
      becikowe: "becikowe",
      dodatek: "dodatek z tytułu urodzenia dziecka",
    },
    miesiaceDopelniacz: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"],
    // Opisy dat kotwiczących terminów (pole kotwica.opis w Terminach).
    kotwice: {
      koniec10Tygodnia: ({ data, ptp }: { data: string; ptp: string }) =>
        `ostatni dzień 10. tygodnia ciąży ${data}, czyli przewidywany termin porodu ${ptp} pomniejszony o 211 dni`,
      ptp: ({ data }: { data: string }) => `przewidywany termin porodu ${data}`,
      ptpMinus1: ({ data }: { data: string }) => `dzień poprzedzający przewidywany termin porodu ${data}`,
      plusDni: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) => `${nazwa} ${data} powiększona o ${liczba} dni`,
      plusMiesiace: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) =>
        `${nazwa} ${data} powiększona o ${liczba} miesięcy`,
      plus12MinusDni: ({ nazwa, data }: { nazwa: string; data: string }) => `${nazwa} ${data} powiększona o 12 miesięcy i pomniejszona o 14 dni`,
      plusTygodnie: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) =>
        `${nazwa} ${data} powiększona o ${liczba} tygodni urlopu macierzyńskiego`,
      dzienPrzedUrodzinami: ({ data, lata }: { data: string; lata: string }) =>
        `dzień poprzedzający ukończenie przez dziecko ${lata} lat, licząc od daty urodzenia ${data}`,
      dzienPrzedPierwszymiUrodzinami: ({ data }: { data: string }) => `dzień poprzedzający ukończenie 1. roku życia, licząc od daty urodzenia ${data}`,
      koniecRokuUrodzin: ({ data, rok }: { data: string; rok: string }) => `31 grudnia ${rok} roku, w którym dziecko urodzone ${data} kończy 6 lat`,
      koniecMiesiaca12: ({ data }: { data: string }) => `ostatni dzień miesiąca, w którym dziecko urodzone ${data} kończy 12 miesięcy`,
      koniecMiesiacaPrzyjecia: ({ data }: { data: string }) => `ostatni dzień miesiąca przyjęcia dziecka ${data}`,
      k13: ({ data }: { data: string }) => `30 czerwca każdego roku, a pierwszy termin przypada w roku pierwszego 31 maja po dniu urodzenia dziecka ${data}`,
      k21: ({ od, doRoku }: { od: string; doRoku: string }) =>
        `31 grudnia każdego roku, od roku urodzenia dziecka (${od}) do roku, w którym dziecko kończy 14 lat (${doRoku})`,
      k09Przysposobienie: ({ data, limit }: { data: string; limit: string }) =>
        `data uprawomocnienia się orzeczenia ${data} powiększona o 12 miesięcy i pomniejszona o 14 dni, nie później niż ${limit}`,
      oplacenieSkladek: ({ miesiac }: { miesiac: string }) => `20. dzień miesiąca następującego po miesiącu ${miesiac}`,
      nazwy: {
        dataPorodu: "data porodu",
        ptpZamiastPorodu: "przewidywany termin porodu",
        dataPrzyjecia: "data przyjęcia dziecka",
        dataUprawomocnienia: "data uprawomocnienia się orzeczenia",
        kotwica: "data kotwicząca",
      },
    },
    etykietyDrugiegoTerminu: {
      "wniosek-o-urlop": "Wniosek o urlop do pracodawcy",
      "wariant-81-5": "Wniosek o oba urlopy w wariancie 81,5%",
    },
    // Skutki spóźnienia z reguł terminów, gdy pozycja katalogu nie podaje tekstu skutku.
    skutki: {
      K01: "utrata prawa do świadczenia „Za życiem” w razie ciężkiej choroby dziecka.",
      K02: "ojciec nie zgłosi urodzenia dziecka, a jego dane nie trafią do aktu urodzenia bez późniejszego uznania ojcostwa.",
      K03: "brak prawa do zasiłku macierzyńskiego, a rodzinie przysługuje wtedy świadczenie rodzicielskie.",
      K05: "dziecko nie pojawi się w danych ZUS wśród członków rodziny zgłoszonych do ubezpieczenia zdrowotnego.",
      K06: "kierownik urzędu stanu cywilnego sam wybierze dziecku imię.",
      K07: "utrata możliwości wyboru równych wypłat w wysokości 81,5% przez cały rok.",
      K08: "utrata możliwości wyboru równych wypłat w wysokości 81,5% przez cały rok.",
      K09: "utrata 14 dni urlopu ojcowskiego płatnego w wysokości 100%.",
      K10: "utrata 9 tygodni urlopu rodzicielskiego zarezerwowanych dla drugiego rodzica.",
      K11: "utrata do 15 albo do 8 tygodni urlopu płatnego w wysokości 100%.",
      K21: "niewykorzystane 2 dni albo 16 godzin płatnego zwolnienia przepadają.",
      K27: "brak zasiłku chorobowego w ciąży i zasiłku macierzyńskiego po porodzie, a rodzinie przysługuje świadczenie rodzicielskie.",
      K28: "ZUS może uznać umowę zawartą albo działalność podjętą wyłącznie w celu uzyskania zasiłku za pozorną i wydać decyzję o niepodleganiu ubezpieczeniom, a wtedy zasiłki nie przysługują.",
      K29: "brak zasiłku macierzyńskiego, a rodzinie przysługuje wtedy świadczenie rodzicielskie.",
      K31: "utrata możliwości wyboru równych wypłat w wysokości 81,5%.",
      K32: "utrata możliwości wyboru równych wypłat w wysokości 81,5%.",
      K33: "rodzinie zastępczej zawodowej nie przysługuje urlop na warunkach urlopu macierzyńskiego ani zasiłek macierzyński za ten okres.",
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
    tytulKarty: ({ imie }: { imie: string }) => `${imie} zaprasza Cię do wspólnego planu rodziny`,
    wstep: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `${imieINazwisko} zaprasza Cię do przewodnika rodzica jako drugiego rodzica. Po przyjęciu zaproszenia oboje będziecie widzieć wspólny plan rodziny.`,
    poPrzyjeciu: "Po przyjęciu zaproszenia",
    korzysci: [
      "Zobaczysz wspólny plan rodziny i kalendarz terminów.",
      "Poznasz swoje uprawnienia, m.in. urlop ojcowski i 9 tygodni urlopu rodzicielskiego, które przepadają, jeśli z nich nie skorzystasz.",
      "Przypomnienia o Twoich sprawach będziemy wysyłać na Twoje konto.",
      "Przygotujesz własne wnioski i skorzystasz z kalkulatorów oraz asystenta.",
    ],
    daneZus: "Dane z Twojego konta ZUS",
    daneZusOpis: {
      kobieta: ({ imie }: { imie: string }) =>
        `Formę zatrudnienia, dobrowolne ubezpieczenie chorobowe i płatnika zasiłku odczytamy z Twojego konta ZUS. Zastąpią one odpowiedzi, które podała o Tobie ${imie}, a plan wyliczymy ponownie. W profilu rodziny zmienisz tylko swoje dane.`,
      mezczyzna: ({ imie }: { imie: string }) =>
        `Formę zatrudnienia, dobrowolne ubezpieczenie chorobowe i płatnika zasiłku odczytamy z Twojego konta ZUS. Zastąpią one odpowiedzi, które podał o Tobie ${imie}, a plan wyliczymy ponownie. W profilu rodziny zmienisz tylko swoje dane.`,
    },
    przyjmij: "Przyjmij zaproszenie",
    odrzuc: "Odrzuć zaproszenie",
    notatkaOdrzucenia: "Jeśli odrzucisz zaproszenie, Twoje konto się nie zmieni.",
    szczegoly: "Szczegóły zaproszenia",
    zaprasza: "Zaprasza",
    rolaPoPrzyjeciu: "Twoja rola po przyjęciu",
    rolaDrugiRodzic: "Drugi rodzic",
    wazneDo: "Zaproszenie ważne do",
    notatkaOdlaczenia: ({ imie }: { imie: string }) => `${imie} może w każdej chwili odłączyć Cię od planu.`,
    bledy: {
      "0066": {
        tytul: "Zaproszenie nie działa",
        akapity: [
          "Link do zaproszenia działa przez 7 dni od utworzenia. Przestaje działać wcześniej, gdy rodzic utworzy nowe zaproszenie.",
          "Poproś rodzica, który Cię zaprosił, o nowy link. Otworzysz go tak samo – w przeglądarce, po zalogowaniu przez mObywatela.",
        ],
        akcja: "Przejdź do strony głównej",
      },
      "0067": {
        tytul: "To jest Twoje zaproszenie",
        akapity: [
          "Link otwiera zaproszenie tylko na koncie drugiego rodzica. Wyślij go dowolnym komunikatorem albo e-mailem.",
          "Nie masz już linku? W profilu rodziny utwórz nowe zaproszenie. Poprzedni link przestanie wtedy działać.",
        ],
        akcja: "Przejdź do profilu rodziny",
      },
      "0068": {
        tytul: "Nie dołączysz do tego planu",
        akapity: [
          "Masz w przewodniku własny plan rodziny, w którym jesteś rodzicem. Jedno konto należy tylko do jednej rodziny, więc z tego zaproszenia nie dołączysz do innego planu.",
          "Twój plan rodziny się nie zmienił.",
        ],
        akcja: "Przejdź do swojego planu rodziny",
      },
    },
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
    opis: "Plik zawiera terminy spraw do zrobienia według stanu Twojego planu w chwili pobrania. Sprawy złożone i załatwione do niego nie trafiają.",
    liczbaTerminow: ({ liczba }: { liczba: number }) => `Terminy w pliku: ${liczba}`,
    podpisTabeli: "Sprawy z terminem w pliku kalendarza",
    przewijanie: "Tabela spraw z terminem w pliku kalendarza",
    kolumny: { sprawa: "Sprawa", termin: "Termin" },
    szacowany: "termin szacowany",
    notatka: "Każdy termin to w pliku wydarzenie całodniowe w dniu terminu, z tytułem sprawy w nazwie oraz kosztem albo skutkiem spóźnienia w opisie. Otwórz plik (.ics) w kalendarzu na komputerze albo na telefonie. Gdy plan się zmieni, pobierz nowy plik.",
    pobierz: "Pobierz plik",
    anuluj: "Anuluj",
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
    opis: "Skopiuj link i wyślij go drugiemu rodzicowi dowolnym komunikatorem albo e-mailem. Drugi rodzic otworzy link w przeglądarce i zaloguje się przez mObywatela.",
    etykietaLinku: "Link do zaproszenia",
    waznyDo: "Link ważny do",
    kopiuj: "Kopiuj link",
    udostepnij: "Udostępnij link",
    notatka: "Link jest jednorazowy. Gdy utworzysz nowe zaproszenie, ten link przestanie działać.",
    skopiowano: "Skopiowaliśmy link do schowka.",
    zaznaczono: "Zaznaczyliśmy link. Skopiuj go skrótem klawiszowym.",
    tytulUdostepnienia: "Zaproszenie do planu rodziny",
    trescUdostepnienia: "Zapraszam Cię do wspólnego planu rodziny w przewodniku rodzica.",
    // koniec SheetInviteSecondParent
  },
  SheetSecondParentRemoveConfirm: {
    tytul: "Odłączyć drugiego rodzica?",
    opis: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `${imieINazwisko} przestanie widzieć plan Twojej rodziny i dostawać przypomnienia.`,
    poOdlaczeniu: "Po odłączeniu",
    skutki: {
      rola: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `${imieINazwisko} straci rolę Drugi rodzic i dostęp do planu rodziny.`,
      przypomnienia: "Przypomnienia o jego sprawach, np. o urlopie ojcowskim, będziemy wysyłać na Twoje konto.",
      dane: "Jego dane zostaną w profilu jako Twoja odpowiedź. Możesz je potem zmienić.",
    },
    ponownie: "Drugiego rodzica możesz później zaprosić ponownie.",
    potwierdz: "Odłącz drugiego rodzica",
    anuluj: "Anuluj",
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
