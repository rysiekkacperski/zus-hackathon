import type { IdWidoku } from '@/domena/typy';

/** Liczba z rzeczownikiem w formie zgodnej z liczbą, na przykład „1 dzień”, „3 miesiące” albo „12 miesięcy”. */
function zLiczba(liczba: string, [jeden, kilka, wiele]: readonly [string, string, string]): string {
  const n = Number(liczba);
  const formaKilku = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
  return `${liczba} ${n === 1 ? jeden : formaKilku ? kilka : wiele}`;
}
const DNI = ["dzień", "dni", "dni"] as const;
const MIESIACE = ["miesiąc", "miesiące", "miesięcy"] as const;
const TYGODNIE = ["tydzień", "tygodnie", "tygodni"] as const;

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
    wiecejInformacji: {
      tytul: "Więcej informacji",
      wNowejKarcie: "Serwisy otworzą się w nowej karcie.",
    },
    wroc: "Wróć",
    ladowanie: "Ładujemy dane przewodnika.",
    // Wyliczenia przez REST API (komponenty/stan-wyliczenia.tsx)
    wyliczenie: {
      trwa: "Liczymy wynik.",
      przeliczanie: "Przeliczamy wynik po zmianie danych.",
      zmienDane: "Zmień dane",
    },
    zl: "zł",
    stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
    zDnia: ({ data }: { data: string }) => `z dnia ${data}`,
    rozmiarPliku: {
      b: ({ liczba }: { liczba: string }) => `${liczba} B`,
      kb: ({ liczba }: { liczba: string }) => `${liczba} KB`,
      mb: ({ liczba }: { liczba: string }) => `${liczba} MB`,
    },
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
        "wyliczenie-planu": "Źródło: plan rodziny",
        "odpowiedz-rodzica": "Źródło: Twoja odpowiedź",
        "dane-zus": "Źródło: konto ZUS",
        "kreator-wniosku": "Źródło: wniosek z przewodnika",
        asystent: "Źródło: potwierdzenie w asystencie",
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
        wstep: "Wybierz konto, którym otworzysz przewodnik. Zobaczysz przewodnik tak, jak widzi go właściciel tego konta po zalogowaniu.",
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
        odczytajPonownie: "Pobierz dane z konta ZUS ponownie",
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
        opis: "Kwoty, progi, stawki i wymiary urlopów w katalogu świadczeń zmienia tylko konto z rolą Administrator. Tę rolę nadaje osoba, która już ją ma.",
        akcja: "Przejdź do planu rodziny",
      },
      podmiotyWsparcia: {
        naglowek: "Słownik podmiotów wsparcia",
        opis: "Słownik prowadzi konto z rolą Administrator. Organizacje wsparcia dla Twojej rodziny zobaczysz przy sprawie Wsparcie organizacji w sytuacji szczególnej, jeśli ta sprawa jest w planie rodziny.",
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
      // Tekst dla czytnika przy zakładce ze wskaźnikiem błędu (komponenty/zakladki.tsx)
      zakladkaZBledem: "zawiera błąd",
      // Wymiar urlopu w miesiącach i dniach, np. „4 miesiące” albo „33 miesiące i 16 dni” (domena/wnioski/urlopy-wychowawczy.ts)
      wymiarMiesiecyIDni: ({ miesiace, dni }: { miesiace: number; dni: number }) => {
        const odmiana = (n: number, jeden: string, kilka: string, wiele: string) =>
          n === 1 ? jeden : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? kilka : wiele;
        const czescDni = dni === 0 ? "" : ` i ${dni} ${dni === 1 ? "dzień" : "dni"}`;
        return `${miesiace} ${odmiana(miesiace, "miesiąc", "miesiące", "miesięcy")}${czescDni}`;
      },
      // Okres od dnia do dnia, daty sformatowane przed przekazaniem (domena/zasilki/okres-zasilkowy.ts)
      zakresDat: ({ od, do: doDnia }: { od: string; do: string }) => `${od} – ${doDnia}`,
    },
  },
  rama: {
    logo: "Przewodnik rodzica",
    logoEtykieta: "ZUS Mama, Przewodnik rodzica, strona główna",
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
      profilRodziny: "Profil rodziny",
      sytuacjeSzczegolne: "Sytuacje szczególne",
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
    // Tryb gościa: przycisk w nagłówku i pozycja menu bocznego prowadzą do logowania z powrotem na bieżący ekran.
    zalogujSie: "Zaloguj się",
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
    // Nieaktualne dane konta ZUS
    "0002": ({ dataOdczytu }: { dataOdczytu: string }) =>
      `Pokazujemy dane z ZUS z dnia ${dataOdczytu}. Odświeżymy je przy następnym otwarciu przewodnika.`,
    // Błąd zapisu danych
    "0003": "Nie udało się zapisać zmian. Spróbuj ponownie.",
    // Brak zgody na dane dotyczące zdrowia
    "0004": "Bez Twojej zgody nie zapiszemy danych o ciąży, zdrowiu i zaświadczeniach lekarskich. Plan pokaże sprawy, które od nich nie zależą.",
    // Zgoda na dane dotyczące zdrowia wycofana
    "0005": "Zgoda wycofana. Dane o ciąży, zdrowiu i zaświadczeniach lekarskich usuniemy w ciągu 30 dni.",
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
    // Sprawa oznaczona jako złożona albo załatwiona
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
    "0070": "Na to pytanie odpowie konsultant ZUS. Możesz napisać wiadomość do ZUS, umówić e-wizytę, napisać na mama@zus.pl albo zadzwonić na infolinię 22 560 16 00.",
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
    "0078": "Podaj liczbę całkowitą od 1 do 999.",
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
      `Do końca okresu zasiłkowego zostało ${liczbaDni} dni. Jeśli niezdolność do pracy potrwa dłużej, złóż wniosek o świadczenie rehabilitacyjne co najmniej 6 tygodni przed końcem okresu zasiłkowego.`,
    // Zadłużenie z tytułu składek
    "0116": ({ data, kwota }: { data: string; kwota: string }) =>
      `Na dzień ${data} masz zadłużenie z tytułu składek w kwocie ${kwota}. Sprawdź, jak wpływa ono na prawo do zasiłku.`,
    // Brak zadłużenia z tytułu składek
    "0117": ({ data }: { data: string }) =>
      `Na dzień ${data} nie masz zadłużenia z tytułu składek.`,
    // Zaświadczenie o niezaleganiu wydane
    "0118": "Zaświadczenie o niezaleganiu w opłacaniu składek jest gotowe do pobrania.",
    // Tytuł ubezpieczenia podjęty w ciąży
    "0119": "Twoja umowa albo działalność zaczęła się w czasie ciąży. ZUS może sprawdzić, czy zgłoszenie do ubezpieczenia służyło wyłącznie uzyskaniu zasiłku.",
    // Brak ubezpieczenia chorobowego w dniu porodu
    "0120": ({ data }: { data: string }) =>
      `Twoje ubezpieczenie chorobowe skończy się ${data}, przed przewidywanym terminem porodu. Bez ubezpieczenia w dniu porodu zasiłek macierzyński nie przysługuje.`,
    // Umowa przedłużona do dnia porodu
    "0121": ({ data }: { data: string }) =>
      `Twoja umowa przedłuży się do dnia porodu, czyli do ${data}.`,
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
    "0162": "Potwierdź, że organizacja ma status organizacji pożytku publicznego w Krajowym Rejestrze Sądowym.",
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
    // Poronienie potwierdzone zaświadczeniem o martwym urodzeniu
    "0194": "Na podstawie zaświadczenia o martwym urodzeniu przysługuje Ci urlop macierzyński i zasiłek macierzyński na zasadach urodzenia martwego dziecka.",
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
    "0207": "Rezygnację z dalszej części zasiłku macierzyńskiego złożysz w eZUS wnioskiem ZAS-23 o skrócenie okresu wypłaty zasiłku macierzyńskiego. Oświadczenie, od kiedy ojciec dziecka przejmie zasiłek, dostarcz do placówki ZUS osobiście albo pocztą. Złóż oba dokumenty przed dniem, od którego rezygnujesz. Pozostałą część zasiłku drugi rodzic otrzyma na swój wniosek.",
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
    "0212": "Sesja wygasła po 15 minutach bez działania. Zaloguj się ponownie, żeby wrócić do przewodnika.",
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
    "0225": "Rozstrzygnięcie sprawy uzupełniliśmy świadczeniami przyznanymi i odmówionymi w zrzucie z systemu ZUS. Sprawdź je przed weryfikacją.",
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
    "0231": ({ data }: { data: string }) =>
      `Wyślij ZUS kolejny wniosek o zasiłek macierzyński z danymi dziecka do wniosku złożonego przed porodem, żeby ZUS ustalił zasiłek za okres po porodzie. Wyślij go najpóźniej ${data}, czyli 21 dni po porodzie.`,
    // Dane dziecka przekazane ZUS
    "0232": "Wysłaliśmy ZUS kolejny wniosek o zasiłek macierzyński z danymi dziecka. Uzupełnia on Twój wniosek złożony przed porodem.",
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
    // Decyzja o odmowie wydania zaświadczenia o niezaleganiu
    "0262": ({ data, kwota }: { data: string; kwota: string }) =>
      `Na dzień ${data} masz zadłużenie z tytułu składek w kwocie ${kwota}, dlatego ZUS wydaje decyzję o odmowie wydania zaświadczenia o niezaleganiu w opłacaniu składek. Decyzja jest gotowa do pobrania.`,
    // Dzieci po wieku granicznym poza wymiarem urlopu
    "0263": ({ liczbaDzieci, wiek }: { liczbaDzieci: string; wiek: string }) =>
      `Wymiar urlopu na warunkach urlopu macierzyńskiego i urlopu rodzicielskiego liczymy dla ${liczbaDzieci} przyjętych dzieci, które w dniu przyjęcia nie ukończyły ${wiek} lat.`,
    // Uzyskanie zaświadczenia o martwym urodzeniu po poronieniu
    "0264": "Poproś lekarza albo położną o zaświadczenie o martwym urodzeniu. Lekarz albo położna wystawia je bez względu na czas trwania ciąży, a zaświadczenie jest podstawą urlopu macierzyńskiego i zasiłku macierzyńskiego po poronieniu. Gdy je otrzymasz, dopisz je w przewodniku do zapisanego poronienia.",
    // Prawo do urlopu i zasiłku po poronieniu po przedstawieniu zaświadczenia
    "0265": "Prawo do urlopu macierzyńskiego i zasiłku macierzyńskiego po poronieniu powstaje po przedstawieniu zaświadczenia o martwym urodzeniu. Dopisz zaświadczenie w przewodniku, a pokażemy okres zasiłku.",
    // Zasiłek chorobowy i zasiłek w wysokości zasiłku macierzyńskiego za ten sam okres
    "0266": "Za ten sam okres otrzymasz jeden zasiłek. Gdy ZUS przyzna Ci zasiłek w wysokości zasiłku macierzyńskiego, zaliczy na jego poczet zasiłek chorobowy wypłacony za ten okres.",
    // Wyrównanie zasiłku do 100% po przyjęciu dziecka
    "0267": "Urlop rodzicielski zaczyna się po pierwszych urodzinach dziecka, więc zasiłek za ten urlop wyniesie 70%, a za urlop na warunkach urlopu macierzyńskiego otrzymasz na wniosek jednorazowe wyrównanie do 100%.",
    // Uzupełniający urlop macierzyński drugiego rodzica
    "0268": "Z zasiłku za okres uzupełniającego urlopu macierzyńskiego korzysta jedno z rodziców. Wniosek złożysz, gdy drugi rodzic z niego nie korzysta.",
    // Wniosek o zasiłek za uzupełniający urlop macierzyński po końcu urlopu macierzyńskiego
    "0269": ({ data }: { data: string }) =>
      `Wniosek o zasiłek za okres uzupełniającego urlopu macierzyńskiego składasz najpóźniej w ostatnim dniu zasiłku za urlop macierzyński, czyli do ${data}. Zapytaj ZUS o swoją sytuację.`,
    // Nieprawidłowa liczba hektarów przeliczeniowych
    "0270": "Podaj liczbę hektarów przeliczeniowych większą od 0, z najwyżej dwoma miejscami po przecinku.",
    // Zbyt długi tekst pola
    "0271": ({ liczbaZnakow }: { liczbaZnakow: string }) =>
      `Tekst może mieć najwyżej ${liczbaZnakow} znaków.`,
    // Płatnik zasiłku przewidywany
    "0272": ({
      rokPoczatkuZasilku,
      rokPoprzedzajacyRokPoczatkuZasilku,
      rokStanuWDanychKontaZus,
    }: {
      rokPoczatkuZasilku: string;
      rokPoprzedzajacyRokPoczatkuZasilku: string;
      rokStanuWDanychKontaZus: string;
    }) =>
      `Kto wypłaci zasiłek od ${rokPoczatkuZasilku}, zależy od liczby osób zgłoszonych przez płatnika do ubezpieczenia chorobowego według stanu na 30 listopada ${rokPoprzedzajacyRokPoczatkuZasilku}. Do czasu odczytu tej informacji z konta ZUS pokazujemy płatnika według stanu na 30 listopada ${rokStanuWDanychKontaZus}.`,
    // Pusta data wystąpienia do sądu o przysposobienie
    "0273": "Podaj datę złożenia w sądzie wniosku o przysposobienie dziecka.",
    // Data wystąpienia do sądu o przysposobienie zbyt odległa
    "0274": "Podaj datę złożenia w sądzie wniosku o przysposobienie przypadającą najpóźniej za 12 miesięcy od dziś.",
    // Pytanie medyczne do asystenta
    "0275": "Na pytania o zdrowie, leki i przebieg ciąży odpowie lekarz albo położna, którzy opiekują się Tobą i dzieckiem. W nagłej sytuacji zadzwoń pod numer alarmowy 112.",
    // Pytanie podatkowe do asystenta
    "0276": "Na pytania o podatki odpowie Krajowa Informacja Skarbowa.",
    // Brak zgody matki na dane dotyczące zdrowia
    "0277": "Tę sytuację zapisze mama albo zapiszesz ją po udzieleniu przez mamę zgody na dane dotyczące zdrowia w przewodniku. Wniosek o część urlopu macierzyńskiego złożysz u pracodawcy albo w ZUS także bez zapisu w przewodniku.",
    // Niezdolność do pracy w czasie urlopu wychowawczego albo bezpłatnego
    "0278": "Za niezdolność do pracy w czasie urlopu wychowawczego albo bezpłatnego zasiłek chorobowy nie przysługuje. Jeżeli urodzisz dziecko w czasie urlopu wychowawczego, przysługuje Ci zasiłek macierzyński.",
    // Praca zarobkowa w czasie zwolnienia lekarskiego
    "0279": "W czasie zwolnienia lekarskiego powstrzymaj się od pracy zarobkowej, także w swojej firmie. Praca zarobkowa w czasie zwolnienia odbiera zasiłek za cały okres zwolnienia, z wyjątkiem incydentalnych czynności wymaganych istotnymi okolicznościami innymi niż polecenie pracodawcy.",
    // Nieprawidłowy numer KRS organizacji
    "0280": "Podaj numer KRS organizacji z 10 cyframi.",
    // Wniosek o urlop wychowawczy później niż 21 dni przed urlopem
    "0281": "Wniosek o urlop wychowawczy składasz co najmniej 21 dni przed jego rozpoczęciem. Po wniosku złożonym później pracodawca udzieli urlopu najpóźniej od dnia, w którym upływa 21 dni od złożenia wniosku.",
    // Wniosek o obniżenie wymiaru czasu pracy później niż 21 dni przed obniżeniem
    "0282": "Wniosek o obniżenie wymiaru czasu pracy składasz co najmniej 21 dni przed rozpoczęciem pracy w obniżonym wymiarze. Po wniosku złożonym później pracodawca obniży wymiar czasu pracy najpóźniej od dnia, w którym upływa 21 dni od złożenia wniosku.",
    // Przekroczony wymiar urlopu wychowawczego
    "0283": ({ miesiace, dni }: { miesiace: string; dni: string }): string =>
      `Ten okres razem z wykorzystanym urlopem wychowawczym przekracza przysługujący wymiar. Do wykorzystania zostało ${teksty.wspolne.zlozone.wymiarMiesiecyIDni({ miesiace: Number(miesiace), dni: Number(dni) })}.`,
    // Nieprawidłowy wymiar czasu pracy po obniżeniu
    "0284": "Podaj wymiar czasu pracy od 50% do 99% pełnego wymiaru.",
    // Okres obniżenia wymiaru czasu pracy dłuższy niż pozostały urlop wychowawczy
    "0285": ({ miesiace, dni }: { miesiace: string; dni: string }): string =>
      `Po wykorzystaniu części urlopu wychowawczego pracujesz w obniżonym wymiarze najwyżej przez okres pozostałego urlopu, czyli ${teksty.wspolne.zlozone.wymiarMiesiecyIDni({ miesiace: Number(miesiace), dni: Number(dni) })}. Podaj krótszy okres.`,
    // Wniosek o obniżenie wymiaru czasu pracy wysłany
    "0286": ({
      data,
      dataPoczatkuOchrony,
      dataKoncaOchrony,
    }: {
      data: string;
      dataPoczatkuOchrony: string;
      dataKoncaOchrony: string;
    }) =>
      `Wniosek trafił do pracodawcy ${data}. Pracodawca obniży Twój wymiar czasu pracy zgodnie z wnioskiem, a szczególna ochrona przed wypowiedzeniem przysługuje Ci od ${dataPoczatkuOchrony} do ${dataKoncaOchrony}.`,
    // Urlop wychowawczy przed 6 miesiącami zatrudnienia
    "0287": ({ data }: { data: string }) =>
      `Wniosek o urlop wychowawczy i o obniżenie wymiaru czasu pracy przygotujesz po 6 miesiącach zatrudnienia, czyli od ${data}. Do 6 miesięcy wliczamy także poprzednie okresy zatrudnienia.`,
    // Przekroczona liczba części urlopu wychowawczego
    "0288": "Urlop wychowawczy na dziecko wykorzystujecie najwyżej w 5 częściach, a ten wniosek byłby szóstą częścią.",
    // Nieprawidłowa liczba dni pobytu dziecka w szpitalu po porodzie
    "0289": "Podaj liczbę dni od 0 do 52.",
    // Ostatni dzień urlopu rodzicielskiego w wymiarze 38 albo 62 tygodni
    "0290": ({ wymiar, data }: { wymiar: string; data: string }) =>
      `Urlop rodzicielski w wymiarze ${wymiar} tygodni wykorzystacie najpóźniej do ${data}. Urlop przypadający po tym dniu przepada. Zaplanuj wszystkie części urlopu do tego dnia, a w sprawie późniejszego terminu skontaktuj się z ZUS.`,
    // Zaświadczenie według stanu w dniu wydania
    "0291": ({
      data,
      dataPowstaniaPrawa,
    }: {
      data: string;
      dataPowstaniaPrawa: string;
    }) =>
      `ZUS wyda zaświadczenie według stanu rozliczeń w dniu wydania, czyli na ${data}. Stan rozliczeń na dzień powstania prawa do zasiłku, ${dataPowstaniaPrawa}, sprawdzisz w stanie rozliczeń składek.`,
    // Rezygnacja z części zasiłku po wniosku ZAM o 14 tygodni
    "0292": ({
      imieINazwiskoOjca,
      dataRezygnacji,
      termin,
    }: {
      imieINazwiskoOjca: string;
      dataRezygnacji: string;
      termin: string;
    }) =>
      `Wniosek o zasiłek macierzyński za 14 tygodni po porodzie jest wysłany. Żeby ${imieINazwiskoOjca} pobierał zasiłek macierzyński od ${dataRezygnacji}, złóż w eZUS wniosek ZAS-23 o skrócenie okresu wypłaty zasiłku macierzyńskiego od tego dnia. Oświadczenie, że od ${dataRezygnacji} zasiłek macierzyński będzie pobierał ojciec dziecka, dostarcz do placówki ZUS osobiście albo pocztą. Zrób to od razu, najpóźniej ${termin}.`,
    // Dodatek z tytułu urodzenia dziecka po zgonie dziecka
    "0293": ({ data }: { data: string }) =>
      `Wniosek o dodatek z tytułu urodzenia dziecka złóż na każde dziecko urodzone żywo, także na dziecko, które zmarło. O dodatku na to dziecko decyduje gmina albo MOPS. Złóż wniosek do ${data}, a w razie pytań skontaktuj się z gminą albo MOPS.`,
    // Nieprawidłowy wymiar etatu
    "0294": "Podaj wymiar etatu jako ułamek mniejszy od pełnego etatu, na przykład 1/2 albo 3/4.",
    // Brak adresu do e-Doręczeń wnioskodawcy
    "0295": "Wniosek o odpis przez internet wymaga Twojego adresu do e-Doręczeń, na który urząd wyśle potwierdzenie złożenia wniosku. Załóż adres do e-Doręczeń na gov.pl albo złóż wniosek w urzędzie stanu cywilnego osobiście lub listownie.",
    // Wymiar urlopu rodzicielskiego dla jednego przyjętego dziecka
    "0296": ({
      data,
      wiek,
      liczbaTygodni,
    }: {
      data: string;
      wiek: string;
      liczbaTygodni: string;
    }) =>
      `Od ${data}, gdy kolejne przyjęte dziecko kończy ${wiek} lat, urlop rodzicielski liczymy dla jednego dziecka, a wymiar urlopu rodzicielskiego obojga rodziców wynosi ${liczbaTygodni} tygodni. Przed złożeniem wniosku potwierdź wymiar urlopu w ZUS.`,
    // Świadczenie za okres życia dziecka po zgonie dziecka
    "0297": ({ data, instytucja }: { data: string; instytucja: string }) =>
      `Za czas, kiedy dziecko żyło, możesz otrzymać to świadczenie, gdy złożysz wniosek do ${data}. W razie pytań skontaktuj się z ${instytucja}.`,
    // Brak ubezpieczenia chorobowego przy zasiłku opiekuńczym
    "0298": "Zasiłek opiekuńczy przysługuje osobie, która podlega ubezpieczeniu chorobowemu. Twoje konto ZUS nie pokazuje tego ubezpieczenia w ostatnich 6 miesiącach. Zobacz w swoim planie, z czego możesz skorzystać.",
    // Brak zaświadczenia lekarskiego na opiekę nad wybraną osobą
    "0299": "Na Twoim koncie ZUS nie ma zaświadczenia lekarskiego na opiekę nad tą osobą. Jeśli lekarz wystawił zaświadczenie na wydrukowanym formularzu, dodaj okres opieki z serią i numerem tego zaświadczenia.",
    // Kolejny okres opieki nad tą samą osobą
    "0300": "Ten okres przedłuża opiekę, za którą wniosek jest już złożony. Jeśli okoliczności się nie zmieniły, wnioskiem za ten okres jest wcześniejszy wniosek. Gdy coś się zmieniło, złóż nowy wniosek.",
    // Dni bez ubezpieczenia chorobowego w okresie opieki
    "0301": ({ dataOd, dataDo }: { dataOd: string; dataDo: string }) =>
      `Od ${dataOd} do ${dataDo} nie podlegasz ubezpieczeniu chorobowemu, więc za te dni zasiłek opiekuńczy nie przysługuje. Wyłączyliśmy je z okresu opieki.`,
    // Zamknięcie placówki zapowiedziane co najmniej 7 dni wcześniej
    "0302": "Zasiłek przysługuje, gdy o zamknięciu placówki dowiedziałeś się mniej niż 7 dni przed dniem zamknięcia. Sprawdź datę powiadomienia.",
    // Wiek dziecka poza sytuacją opieki
    "0303": ({ wiek, data }: { wiek: string; data: string }) =>
      `W tej sytuacji zasiłek przysługuje na dziecko do ukończenia ${wiek} lat. Dziecko kończy ${wiek} lat ${data}, więc okres opieki kończy się przed tym dniem.`,
    // Brak okresu opieki
    "0304": "Wybierz zaświadczenie lekarskie albo dodaj okres opieki.",
    // Puste pole daty we wniosku o zasiłek opiekuńczy
    "0305": "Podaj datę.",
    // Własny urlop w okresie opieki
    "0306": ({
      dataOd,
      dataDo,
      rodzajUrlopu,
    }: {
      dataOd: string;
      dataDo: string;
      rodzajUrlopu: string;
    }) =>
      `Od ${dataOd} do ${dataDo} jesteś na urlopie ${rodzajUrlopu}, więc za te dni zasiłek opiekuńczy nie przysługuje. Wyłączyliśmy je z okresu wniosku.`,
    // Dni opieki drugiego rodzica nad tą samą osobą
    "0307": ({
      dataOd,
      dataDo,
      imieINazwisko,
    }: {
      dataOd: string;
      dataDo: string;
      imieINazwisko: string;
    }) =>
      `Za dni od ${dataOd} do ${dataDo} wniosek o zasiłek opiekuńczy na tę samą osobę złożył drugi rodzic, ${imieINazwisko}. Za ten sam dzień zasiłek otrzymuje jeden rodzic, dlatego wyłączyliśmy te dni z okresu wniosku.`,
    // Przekroczony limit dni zasiłku opiekuńczego
    "0308": ({
      rok,
      liczbaDni,
      liczbaDniWniosku,
    }: {
      rok: string;
      liczbaDni: string;
      liczbaDniWniosku: string;
    }) =>
      `W ${rok} zostało do wykorzystania ${liczbaDni} dni zasiłku opiekuńczego na tę opiekę, a okresy wniosku obejmują ${liczbaDniWniosku} dni. Skróć okresy opieki na poprzednim ekranie.`,
    // Drugi rodzic na urlopie w okresie opieki
    "0309": ({
      dataOd,
      dataDo,
      imieINazwisko,
      rodzajUrlopu,
    }: {
      dataOd: string;
      dataDo: string;
      imieINazwisko: string;
      rodzajUrlopu: string;
    }) =>
      `Od ${dataOd} do ${dataDo} ${imieINazwisko} jest na ${rodzajUrlopu} i może zapewnić opiekę. Zasiłek opiekuńczy przysługuje, gdy nie ma domownika, który może zapewnić opiekę. Odpowiedz na oświadczenie o domowniku zgodnie z prawdą i przed złożeniem wniosku skontaktuj się z ZUS.`,
    // Dni zwolnienia od pracy z wynagrodzeniem wyłączone z wniosku
    "0310": ({ liczbaDni }: { liczbaDni: string }) =>
      `Za ${liczbaDni} dni zwolnienia od pracy zachowujesz wynagrodzenie, więc zasiłek opiekuńczy za te dni nie przysługuje. Wyłączyliśmy je z okresu wniosku, a limit dni zasiłku pozostaje bez zmian.`,
    // Własna niezdolność do pracy w okresie opieki
    "0311": ({
      dataOd,
      dataDo,
      seriaINumer,
    }: {
      dataOd: string;
      dataDo: string;
      seriaINumer: string;
    }) =>
      `Od ${dataOd} do ${dataDo} masz zaświadczenie lekarskie ${seriaINumer} o własnej niezdolności do pracy. Za te dni przysługuje Ci zasiłek chorobowy, dlatego wyłączyliśmy je z okresu wniosku.`,
    // Dni opieki objęte innym wnioskiem
    "0312": ({
      liczbaDni,
      imieINazwisko,
    }: {
      liczbaDni: string;
      imieINazwisko: string;
    }) =>
      `${liczbaDni} dni z okresu wniosku obejmuje już Twój wniosek o zasiłek opiekuńczy na ${imieINazwisko}. Za te dni zasiłek przysługuje raz, dlatego liczymy je do limitu raz.`,
    // Wniosek bez dni zasiłku opiekuńczego
    "0313": "Po wyłączeniu dni, za które zasiłek opiekuńczy nie przysługuje, wniosek obejmuje 0 dni. Zmień okresy opieki albo odpowiedzi na oświadczenia.",
    // Brak wspólnego gospodarstwa domowego z osobą pod opieką
    "0314": "Zasiłek opiekuńczy na chore dziecko w wieku powyżej 14 lat bez orzeczenia i na chorego małżonka przysługuje, gdy w okresie opieki pozostajesz z nim we wspólnym gospodarstwie domowym.",
    // Nieprawidłowa liczba dni zasiłku opiekuńczego
    "0315": ({ liczbaDni }: { liczbaDni: string }) =>
      `Podaj liczbę dni od 0 do ${liczbaDni}.`,
    // Liczba dni mniejsza niż dni z wniosków w przewodniku
    "0316": ({
      imieINazwisko,
      liczbaDni,
      rok,
    }: {
      imieINazwisko: string;
      liczbaDni: string;
      rok: string;
    }) =>
      `W przewodniku są zapisane wnioski i zasiłki ${imieINazwisko} na ${liczbaDni} dni zasiłku opiekuńczego w ${rok}. Podaj co najmniej ${liczbaDni} dni.`,
    // Przekroczona liczba dni zwolnienia od pracy
    "0317": "Zwolnienie od pracy tego rodzaju przysługuje najwyżej przez 2 dni w roku kalendarzowym.",
    // Szacunkowa kwota zasiłku opiekuńczego
    "0318": ({
      liczbaDni,
      kwota,
      stawkaDzienna,
      platnikZasilku,
    }: {
      liczbaDni: string;
      kwota: string;
      stawkaDzienna: string;
      platnikZasilku: string;
    }) =>
      `Szacunkowy zasiłek opiekuńczy za ${liczbaDni} dni wynosi ${kwota} zł brutto przy stawce ${stawkaDzienna} zł za dzień opieki. Kwotę zasiłku ustali ${platnikZasilku}.`,
    // Zasiłek opiekuńczy bez podstawy wymiaru w przewodniku
    "0319": ({ platnikZasilku }: { platnikZasilku: string }) =>
      `Za każdy dzień opieki otrzymasz 80% podstawy wymiaru zasiłku podzielonej przez 30. Podstawę wymiaru i kwotę zasiłku ustali ${platnikZasilku}.`,
    // Termin złożenia wniosku o zasiłek opiekuńczy
    "0320": ({
      dataOd,
      dataDo,
      termin,
    }: {
      dataOd: string;
      dataDo: string;
      termin: string;
    }) =>
      `Złóż wniosek o zasiłek za okres od ${dataOd} do ${dataDo} najpóźniej ${termin}. Po tym dniu roszczenie o wypłatę zasiłku za ten okres przedawnia się.`,
    // Przedawnienie zasiłku opiekuńczego za okres opieki
    "0321": ({
      dataOd,
      dataDo,
      termin,
    }: {
      dataOd: string;
      dataDo: string;
      termin: string;
    }) =>
      `Termin złożenia wniosku o zasiłek za okres od ${dataOd} do ${dataDo} minął ${termin}. Jeśli nie mogłeś złożyć wniosku z przyczyn od Ciebie niezależnych, skontaktuj się z ZUS przed wysłaniem wniosku.`,
    // Zaświadczenie płatnika składek do wniosku o zasiłek opiekuńczy
    "0322": ({
      symbolZaswiadczenia,
      nazwaPlatnikaSkladek,
    }: {
      symbolZaswiadczenia: string;
      nazwaPlatnikaSkladek: string;
    }) =>
      `Do wniosku o zasiłek opiekuńczy potrzebne jest zaświadczenie płatnika składek ${symbolZaswiadczenia}. Wypełnia je ${nazwaPlatnikaSkladek}, który może przekazać je do ZUS przez eZUS. Poproś płatnika o to zaświadczenie.`,
    // Wniosek o zasiłek opiekuńczy przygotowany dla płatnika
    "0323": ({ nazwaPlatnikaSkladek }: { nazwaPlatnikaSkladek: string }) =>
      `Wniosek jest gotowy. Podpisz go i przekaż płatnikowi składek ${nazwaPlatnikaSkladek} w postaci papierowej albo elektronicznej, na przykład e-mailem, razem z dokumentami z listy.`,
    // Płatnik zasiłku nieustalony we wniosku o zasiłek opiekuńczy
    "0324": ({ nazwaPlatnikaSkladek }: { nazwaPlatnikaSkladek: string }) =>
      `Przygotujemy wniosek dla płatnika składek ${nazwaPlatnikaSkladek}. Jeśli płatnik nie wypłaca zasiłków, przekaże wniosek do ZUS w ciągu 7 dni.`,
    // Wypłata zasiłku opiekuńczego przez płatnika składek
    "0325": ({ nazwaPlatnikaSkladek }: { nazwaPlatnikaSkladek: string }) =>
      `Zasiłek wypłaci płatnik składek ${nazwaPlatnikaSkladek} w terminie wypłaty wynagrodzenia.`,
    // Wniosek o zasiłek opiekuńczy przekazany płatnikowi
    "0326": ({ data }: { data: string }) =>
      `Zapisaliśmy przekazanie wniosku płatnikowi ${data}. Sprawa ma w planie status złożona.`,
    // Sytuacja matki po upływie 8 tygodni od porodu
    "0327": ({ data }: { data: string }) =>
      `Dodatkowy zasiłek opiekuńczy przysługuje, gdy sytuacja mamy wystąpiła najpóźniej ${data}, w ostatnim dniu 8. tygodnia życia dziecka. Po tym dniu możesz przejąć część urlopu macierzyńskiego, a akcję przejęcia znajdziesz w planie rodziny.`,
    // Data porzucenia dziecka przed dniem porodu
    "0328": ({ data }: { data: string }) =>
      `Data porzucenia dziecka przypada w dniu porodu ${data} albo później.`,
    // Data wypisu matki ze szpitala poza zakresem
    "0329": ({ data }: { data: string }) =>
      `Podaj datę wypisu mamy ze szpitala z zakresu od ${data} do dzisiaj.`,
    // Okres poza dodatkowym zasiłkiem opiekuńczym
    "0330": ({
      dataPoczatku,
      dataKonca,
    }: {
      dataPoczatku: string;
      dataKonca: string;
    }) =>
      `Dodatkowy zasiłek opiekuńczy przysługuje za dni od ${dataPoczatku} do ${dataKonca}. Popraw okres opieki.`,
    // Matka bez zasiłku macierzyńskiego w 8 tygodniach po porodzie
    "0331": "Dodatkowy zasiłek opiekuńczy przysługuje, gdy mama podlega ubezpieczeniu chorobowemu i pobiera zasiłek macierzyński w pierwszych 8 tygodniach po porodzie. Sprawdź w planie rodziny przejęcie urlopu macierzyńskiego albo skontaktuj się z ZUS.",
    // Ojciec bez przerwy w pracy
    "0332": "Dodatkowy zasiłek opiekuńczy przysługuje, gdy przerwiesz pracę albo działalność zarobkową, żeby osobiście opiekować się dzieckiem.",
    // Dodatkowy zasiłek opiekuńczy poza limitem dni
    "0333": ({ liczba }: { liczba: string }) =>
      `Dni dodatkowego zasiłku opiekuńczego na nowo narodzone dziecko liczymy poza rocznym limitem zasiłku opiekuńczego, więc w tym roku nadal masz ${liczba} dni zasiłku opiekuńczego.`,
    // Pobyt matki w szpitalu bez daty wypisu
    "0334": "Dodatkowy zasiłek opiekuńczy przysługuje za dni pobytu mamy w szpitalu. Gdy mama wróci ze szpitala, poinformuj płatnika zasiłku o dniu wypisu.",
    // Usługa wyliczeń przewodnika niedostępna
    "0335": "Nie udało się wykonać wyliczenia. Spróbuj ponownie za chwilę.",
    // Data rezygnacji z zasiłku macierzyńskiego nie później niż dziś
    "0336": "Rezygnację składasz przed dniem, od którego rezygnujesz z zasiłku. Podaj datę późniejszą niż dzisiejsza.",
    // Wniosek ZAS-23 wysłany
    "0337": ({ data, dataRezygnacji }: { data: string; dataRezygnacji: string }) =>
      `Wniosek ZAS-23 wysłaliśmy do ZUS ${data}. Dostarcz podpisane oświadczenie ojca dziecka do placówki ZUS osobiście albo pocztą przed ${dataRezygnacji}. Ojciec dziecka złoży wniosek o zasiłek macierzyński za okres od ${dataRezygnacji}.`,
    // Wniosek ZAS-23 niedostępny
    "0338": "Wniosek ZAS-23 składasz w eZUS, gdy zasiłek macierzyński wypłaca Ci ZUS na podstawie Twojego wniosku o zasiłek macierzyński. Sprawdź rezygnację w przewodniku.",
    // Rezygnacja z części zasiłku dla zleceniodawcy przygotowana
    "0339": ({ dataRezygnacji }: { dataRezygnacji: string }) =>
      `Wniosek o rezygnację i oświadczenie ojca dziecka są gotowe do wydruku. Złóż je zleceniodawcy przed ${dataRezygnacji}.`,
    // Puste pole tekstowe katalogu
    "0340": "Uzupełnij to pole.",
    // Nazwa wpisu słownika już istnieje
    "0341": "W słowniku jest już wpis o tej nazwie.",
  },
  // Grupy powiadomień (właściciele: u18, u14, u29, u34)
  PowiadomieniaPrzypomnienia: {
    tytul: "Przypomnienia o terminach",
    nadawca: "Przewodnik rodzica",
    // Liczba dni w treści przypomnienia
    zostaloDni: ({ liczbaDni }: { liczbaDni: number }) =>
      liczbaDni === 1
        ? "został 1 dzień"
        : liczbaDni % 10 >= 2 && liczbaDni % 10 <= 4 && (liczbaDni % 100 < 12 || liczbaDni % 100 > 14)
          ? `zostały ${liczbaDni} dni`
          : `zostało ${liczbaDni} dni`,
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
      `Przewodnik ZUS: ${tytul} do ${termin}, ${zostalo}.${informacja ? ` ${informacja}` : ""} ${adres}`,
    // Przypomnienie w dniu terminu SMS-em
    smsWDniuTerminu: ({ tytul, informacja, adres }: { tytul: string; informacja: string; adres: string }) =>
      `Przewodnik ZUS: dziś mija termin: ${tytul}.${informacja ? ` ${informacja}` : ""} ${adres}`,
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
    nadawca: "Przewodnik rodzica (wiadomość automatyczna)",
    pytanieOgolne: "pytanie ogólne",
    sms: ({ tytulSprawy, adresPrzewodnika }: { tytulSprawy: string; adresPrzewodnika: string }) =>
      `ZUS odpowiedział na Twoje pytanie w sprawie: ${tytulSprawy}. Odpowiedź przeczytasz w przewodniku: ${adresPrzewodnika}`,
    tematEmail: "Odpowiedź ZUS na Twoje pytanie",
    email: ({ dataWyslania, tytulSprawy, adresPrzewodnika }: { dataWyslania: string; tytulSprawy: string; adresPrzewodnika: string }) =>
      `Dzień dobry, ZUS odpowiedział na Twoje pytanie wysłane ${dataWyslania} w sprawie: ${tytulSprawy}. Odpowiedź przeczytasz w przewodniku dla rodziców pod adresem ${adresPrzewodnika} i w eZUS. Ta wiadomość została wysłana automatycznie, nie odpowiadaj na nią.`,
    // koniec PowiadomieniaOdpowiedzZus
  },
  PowiadomieniaPrzejecieUrlopu: {
    tytul: "Przejęcie urlopu macierzyńskiego",
    temat: "Możesz przejąć część urlopu macierzyńskiego",
    tresc: ({
      imieMatki,
      dataPowrotu,
      dataPoczatku,
      dataKonca,
      terminZlozeniaWniosku,
    }: {
      imieMatki: string;
      dataPowrotu: string;
      dataPoczatku: string;
      dataKonca: string;
      terminZlozeniaWniosku: string;
    }) =>
      `${imieMatki} złożyła rezygnację z dalszej części urlopu macierzyńskiego i wraca do pracy ${dataPowrotu}. Pozostała część urlopu od ${dataPoczatku} do ${dataKonca} przysługuje Tobie. Złóż wniosek o tę część urlopu w przewodniku. Jeśli pracujesz na umowie o pracę, złóż go pracodawcy do ${terminZlozeniaWniosku}.`,
    // koniec PowiadomieniaPrzejecieUrlopu
  },
  // Grupy widoków w kolejności mapy tras
  ViewGuideStart: {
    tytulStrony: "Przewodnik rodzica",
    naglowek: "Przewodnik rodzica",
    wstep: "Spodziewasz się dziecka? Przewodnik ułoży plan świadczeń Twojej rodziny, policzy terminy i pomoże przygotować wnioski.",
    logowanie: {
      tytul: "Zaloguj się do przewodnika",
      opis: "Podaj login i hasło do eZUS albo wybierz inny sposób logowania. Każdym sposobem otworzysz ten sam profil rodziny.",
      opisPoWygasnieciu: "Podaj login i hasło do eZUS albo wybierz inny sposób logowania. Po zalogowaniu wrócisz do ostatnio otwartego ekranu.",
      login: "Login",
      haslo: "Hasło",
      zaloguj: "Zaloguj się",
      albo: "albo",
      mobywatel: "Zaloguj się przez mObywatela",
      mzus: "Zaloguj się kodem z aplikacji mZUS",
      notatkaDemo: "Wersja demonstracyjna: nie wpisuj prawdziwego loginu ani hasła. Wpisz dowolny login i hasło, a potem wybierzesz przykładowe konto.",
      ustawieniaDemo: "Ustawienia trybu demonstracyjnego",
    },
    bezLogowania: {
      tytul: "Bez logowania",
      opis: "Sprawdź, ile wyniesie zasiłek macierzyński, i zobacz, jak przewodnik liczy go na przykładowych sprawach ZUS.",
      kalkulator: "Policz zasiłek macierzyński",
      przykladoweSprawy: "Przykładowe sprawy ZUS",
    },
    coZrobisz: {
      tytul: "Co zrobisz w przewodniku",
      plan: { tytul: "Plan świadczeń rodziny", opis: "Zobaczysz świadczenia, które przysługują Twojej rodzinie, i sprawy do załatwienia po kolei." },
      terminy: { tytul: "Terminy", opis: "Policzymy, do kiedy złożyć wnioski i dokumenty, i przypomnimy Ci o nich." },
      wnioski: { tytul: "Wnioski", opis: "Przygotujesz wnioski na podstawie danych z profilu rodziny." },
      zgoda: "Dane o ciąży, porodzie i stanie zdrowia dziecka zapisujemy tylko za Twoją zgodą.",
    },
    // koniec ViewGuideStart
  },
  ViewMobywatelLogin: {
    tytulStrony: "Logowanie przez mObywatela",
    naglowek: "Logowanie przez mObywatela",
    wstep: "To makieta, która symuluje logowanie. Nie skanuj kodu prawdziwą aplikacją mObywatel.",
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
    notatka: "Naciśnij przycisk poniżej, aby symulować potwierdzenie w aplikacji. Potem wybierzesz przykładowe konto.",
    potwierdz: "Symuluj potwierdzenie w aplikacji mObywatel",
    przerwij: "Przerwij logowanie",
    // koniec ViewMobywatelLogin
  },
  ViewEzusLogin: {
    tytulStrony: "Logowanie loginem i hasłem eZUS",
    naglowek: "Logowanie loginem i hasłem eZUS",
    wstep: "To makieta, która symuluje logowanie do eZUS. Nie wpisuj prawdziwego loginu ani hasła.",
    karta: "Podaj login i hasło do eZUS",
    login: "Login",
    haslo: "Hasło",
    notatkaDalej: "Wpisz dowolny login i hasło, a potem wybierzesz przykładowe konto.",
    notatkaHaslo: "Hasło wykorzystamy wyłącznie do symulacji logowania i usuniemy je po przejściu dalej.",
    zaloguj: "Zaloguj się",
    przerwij: "Przerwij logowanie",
    // koniec ViewEzusLogin
  },
  ViewMzusCodeLogin: {
    tytulStrony: "Logowanie kodem z aplikacji mZUS",
    naglowek: "Logowanie kodem z aplikacji mZUS",
    wstep: "To makieta, która symuluje logowanie. Nie skanuj kodu prawdziwą aplikacją mZUS.",
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
    notatka: "Naciśnij przycisk poniżej, aby symulować potwierdzenie w aplikacji. Potem wybierzesz przykładowe konto.",
    potwierdz: "Symuluj potwierdzenie w aplikacji mZUS",
    przerwij: "Przerwij logowanie",
    // koniec ViewMzusCodeLogin
  },
  ViewDemoAccountPicker: {
    tytulStrony: "Wybierz konto",
    naglowek: "Wybierz konto",
    wstep: "Zaloguj się przykładowym kontem rodzica albo kontem administratora. Możesz też założyć nowe konto bez danych w ZUS.",
    kontaPrzykladowe: ({ liczba }: { liczba: number }) => `Konta przykładowe (${liczba})`,
    notatkaDane: "Konta przykładowe mają zmyślone dane z ZUS, a każde konto rodzica pokazuje inną sytuację.",
    notatkaSymulacji: "Wybierz Symuluj stworzenie profilu, aby utworzyć profil rodziny z przykładowymi danymi i od razu otworzyć plan rodziny na etapie Ciąża.",
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
    noweKontaOpis: "Nowe konto zakładasz bez danych w ZUS. Po założeniu od razu zalogujemy Cię tym kontem, a później znajdziesz je na tej liście.",
    zalozNoweKonto: "Załóż nowe konto",
    zaloguj: "Zaloguj się",
    zalogujKonto: ({ imieINazwisko }: { imieINazwisko: string }) => `Konto ${imieINazwisko}: zaloguj się`,
    symuluj: "Symuluj stworzenie profilu",
    symulujKonto: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Konto ${imieINazwisko}: symuluj stworzenie profilu`,
    przywroc: "Przywróć stan początkowy",
    przywrocKonto: ({ imieINazwisko }: { imieINazwisko: string }) => `Konto ${imieINazwisko}: przywróć stan początkowy`,
    przywrocono: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Konto ${imieINazwisko}: przywróciliśmy stan początkowy.`,
    oknoPrzywracania: {
      tytul: "Przywrócić stan początkowy konta?",
      opis: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Usuniemy dane konta ${imieINazwisko}, w tym profil rodziny, w której to konto jest rodzicem, plan rodziny i pliki. Nowe konto zniknie z listy kont, a konto dołączone do rodziny drugiego rodzica straci do niej dostęp. Tej operacji nie cofniesz.`,
      potwierdz: "Przywróć stan początkowy",
      anuluj: "Anuluj",
      zamknij: "Zamknij okno przywracania stanu początkowego",
    },
    ustawieniaDemo: "Ustawienia trybu demonstracyjnego",
    trybWylaczony: "Tryb demonstracyjny jest wyłączony. Włącz go, aby korzystać z symulacji i ustawień tego trybu.",
    wlaczTryb: "Włącz tryb demonstracyjny",
    trybWlaczony: "Włączyliśmy tryb demonstracyjny.",
    // koniec ViewDemoAccountPicker
  },
  ViewDemoNewAccount: {
    tytulStrony: "Nowe konto",
    naglowek: "Nowe konto",
    powrot: "Wybór konta",
    wstep: "Załóż konto bez danych w ZUS. Nadamy mu losowy numer PESEL zgodny z podaną datą urodzenia i płcią, a potem zalogujemy Cię tym kontem.",
    karta: "Dane konta",
    imie: "Imię",
    nazwisko: "Nazwisko",
    dataUrodzenia: "Data urodzenia",
    formatDaty: "DD.MM.RRRR",
    plec: "Płeć",
    wybierz: "Wybierz",
    plcie: { kobieta: "Kobieta", mezczyzna: "Mężczyzna" },
    notatka: "Nowe konto nie ma danych z ZUS ani tytułu do ubezpieczenia. Formę zatrudnienia, ubezpieczenie chorobowe i podstawę wymiaru podasz w profilu na start i w kalkulatorze.",
    zaloz: "Załóż konto",
    // koniec ViewDemoNewAccount
  },
  ViewDemoSettings: {
    tytulStrony: "Ustawienia trybu demonstracyjnego",
    naglowek: "Ustawienia trybu demonstracyjnego",
    powrot: "Wybór konta",
    wstep: "Ustaw datę demonstracyjną, parametry systemu i symulacje błędów, a potem wczytaj scenariusz z kryteriów akceptacji. Ustawienia obowiązują w tej przeglądarce.",
    tryb: {
      tytul: "Tryb demonstracyjny",
      przelacznik: "Tryb demonstracyjny włączony",
      opis: "Tryb demonstracyjny włącza makiety logowania, wybór konta, przykładowe dane z konta ZUS i symulacje. Po wyłączeniu przewodnik zamknie ten ekran, a tryb włączysz ponownie na ekranie wyboru konta.",
    },
    data: {
      tytul: "Data demonstracyjna",
      pole: "Data, którą przewodnik uznaje za dzisiejszą",
      biezaca: ({ data }: { data: string }) => `Dzisiaj w przewodniku: ${data}`,
      zrodloDemo: "Przewodnik liczy terminy od daty demonstracyjnej.",
      zrodloZegar: "Przewodnik liczy terminy od rzeczywistej dzisiejszej daty.",
      ustaw: "Ustaw datę",
      wyczysc: "Wróć do rzeczywistej daty",
      ustawiono: ({ data }: { data: string }) => `Ustawiliśmy datę demonstracyjną ${data}.`,
      wyczyszczono: "Wróciliśmy do rzeczywistej daty.",
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
        bladZapisu: { etykieta: "Błąd zapisu danych", opis: "Każdy zapis danych kończy się komunikatem o błędzie zapisu." },
        daneZusNiedostepne: { etykieta: "Dane z konta ZUS niedostępne", opis: "Odczyt danych z konta ZUS kończy się komunikatem o niedostępności." },
        stanRozliczenNiedostepny: { etykieta: "Stan rozliczeń składek niedostępny", opis: "Odczyt stanu rozliczeń składek kończy się komunikatem o niedostępności." },
        kanalNiedostepny: { etykieta: "Kanał zewnętrzny niedostępny", opis: "Przejście do Emp@tii, mObywatela i gov.pl kończy się komunikatem o niedostępności." },
        mobywatelZainstalowany: { etykieta: "Aplikacja mObywatel zainstalowana", opis: "Przejście do mObywatela otwiera aplikację mObywatel zamiast usługi w przeglądarce." },
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
      opis: "Scenariusz przywraca stan początkowy konta, wczytuje stan z kryteriów akceptacji i wylogowuje to konto.",
      brak: "Lista scenariuszy jest pusta.",
      wczytaj: "Wczytaj scenariusz",
      wczytajScenariusz: ({ nazwa }: { nazwa: string }) => `Wczytaj scenariusz ${nazwa}`,
      konto: ({ imieINazwisko }: { imieINazwisko: string }) => `Konto: ${imieINazwisko}`,
      wczytano: ({ nazwa }: { nazwa: string }) => `Wczytaliśmy scenariusz ${nazwa}.`,
      pozycje: {
        "u02-anna-zgoda-udzielona-bez-profilu": {
          nazwa: "Anna Nowak: zgoda udzielona, bez profilu rodziny",
          opis: "Konto z rolą Nowy użytkownik i zgodą w wersji 1.0 udzieloną 21.11.2026 o 10:15. Po zalogowaniu przewodnik otwiera profil na start.",
        },
        "u02-anna-odmowa-zgody": {
          nazwa: "Anna Nowak: odmowa zgody, ustawienia 24.11.2026",
          opis: "Konto z rolą Nowy użytkownik z odmową zgody z 21.11.2026. Data demonstracyjna 24.11.2026 pozwala udzielić zgody w ustawieniach.",
        },
        "u02-anna-rodzic-z-planem": {
          nazwa: "Anna Nowak: Rodzic z profilem, terminem porodu 15.03.2027 i nieukończonym wnioskiem ZAM",
          opis: "Konto z rolą Rodzic ze zgodą z 21.11.2026, przewidywanym terminem porodu 15.03.2027, planem rodziny i nieukończonym wnioskiem o zasiłek macierzyński. Data demonstracyjna 24.11.2026.",
        },
        "u02-anna-rodzic-z-wyslanym-zam": {
          nazwa: "Anna Nowak: Rodzic z wnioskiem ZAM wysłanym do ZUS",
          opis: "Konto z rolą Rodzic ze zgodą z 21.11.2026 i wnioskiem o zasiłek macierzyński wysłanym do ZUS 21.11.2026. Data demonstracyjna 24.11.2026.",
        },
        "u03-anna-nowe-dziecko": {
          nazwa: "Anna Nowak: nowe dziecko w danych z konta ZUS",
          opis: "Anna Nowak ma dane z konta ZUS zapisane 20.11.2026 o 18:30, bez członków rodziny, a konto ZUS pokazuje Zofię Nowak urodzoną 19.11.2026. Przy otwarciu 21.11.2026 przewodnik oznacza ją jako nowe dziecko.",
        },
        "u03-anna-dziecko-w-kopii": {
          nazwa: "Anna Nowak: dziecko obecne w poprzednim odczycie",
          opis: "Anna Nowak ma dane z konta ZUS zapisane 20.11.2026 o 18:30, z Zofią Nowak. Przy otwarciu 21.11.2026 przewodnik zapisuje Zofię Nowak bez oznaczenia nowego dziecka.",
        },
        "u03-anna-nieaktualne-dane": {
          nazwa: "Anna Nowak: dane konta ZUS niedostępne, dane zapisane 20.11.2026",
          opis: "Anna Nowak ma dane z konta ZUS zapisane 20.11.2026 o 18:30, a konto ZUS jest niedostępne. Przy otwarciu 21.11.2026 przewodnik pokazuje zapisane dane z komunikatem 0002.",
        },
        "u03-joanna-brak-polaczenia": {
          nazwa: "Joanna Mazur: dane konta ZUS niedostępne, bez zapisanych danych",
          opis: "Joanna Mazur nie ma zapisanych danych z konta ZUS, a konto ZUS jest niedostępne. Przewodnik pokazuje komunikat 0001 z akcją ponowienia. Wyłącz symulację niedostępności danych ZUS i pobierz dane ponownie.",
        },
        "u03-pierwszy-odczyt-dziecko-z-2025": {
          nazwa: "Magdalena Wójcik: pierwszy odczyt z dzieckiem urodzonym 05.05.2025",
          opis: "Konto Magdalena Wójcik otwiera przewodnik po raz pierwszy, a dane konta ZUS pokazują członka rodziny urodzonego 05.05.2025. Odczyt zapisuje go bez oznaczenia nowego dziecka.",
        },
        "u03-pierwszy-odczyt-dziecko-z-listopada": {
          nazwa: "Karolina Lis: pierwszy odczyt z dzieckiem urodzonym 02.11.2026",
          opis: "Konto Karolina Lis otwiera przewodnik po raz pierwszy, a dane konta ZUS pokazują członka rodziny urodzonego 02.11.2026. Odczyt oznacza go jako nowe dziecko.",
        },
        "u07-kilka-tytulow": {
          nazwa: "Profil na start: kilka tytułów i dziecko z konta ZUS",
          opis: "Magdalena Wójcik z tytułem pracownika od 01.09.2023 u płatnika, który wypłaca zasiłki, i tytułem zleceniobiorcy od 01.02.2025 u płatnika, który ich nie wypłaca, oraz z dzieckiem Jan Wiśniewski urodzonym 12.03.2024 (KA-04, KA-06, KA-12).",
        },
        "u07-dane-zus-niedostepne": {
          nazwa: "Profil na start: dane z konta ZUS niedostępne",
          opis: "Joanna Mazur ze zgodą na dane dotyczące zdrowia i włączoną symulacją niedostępności danych z konta ZUS. Ekran danych z konta ZUS w profilu na start nie ma wybranej formy zatrudnienia (KA-14).",
        },
        "u07-odmowa-zgody": {
          nazwa: "Profil na start: odmowa zgody na dane dotyczące zdrowia",
          opis: "Anna Nowak z zapisaną odmową zgody na dane dotyczące zdrowia; sytuacje z ciążą, porodem i przyjęciem prowadzą do ekranu danych rodziny w profilu na start (KA-09, KA-10, KA-11 3.3.1.4.1).",
        },
        "u07-planowanie-rodzicielstwa": {
          nazwa: "Profil na start: wybrane planowanie rodzicielstwa",
          opis: "Anna Nowak ze szkicem profilu po wyborze sytuacji planuję rodzicielstwo; po zalogowaniu przewodnik otwiera ekran wyboru sytuacji w profilu na start z tą sytuacją (KA-08 3.3.1.4.1).",
        },
        "u08-anna-plan-przed-porodem": {
          nazwa: "Anna Nowak: plan rodziny przed porodem",
          opis: "Jednoosobowa działalność z dobrowolnym ubezpieczeniem chorobowym, termin porodu 15.03.2027, wizyta 20.07.2026, małżeństwo, dochód 3 500,00 zł, drugi rodzic na umowie o pracę.",
        },
        "u08-anna-po-porodzie": {
          nazwa: "Anna Nowak: plan po potwierdzeniu daty porodu",
          opis: "Po potwierdzeniu daty porodu 19.11.2026 plan sprzed porodu pokazuje zmiany i bieżący etap Pierwsze tygodnie po porodzie.",
        },
        "u08-joanna-jdg-bez-chorobowego": {
          nazwa: "Joanna Mazur: działalność bez dobrowolnego ubezpieczenia chorobowego",
          opis: "Termin porodu 15.03.2027, wizyta 20.07.2026, rodzice bez ślubu i bez uznania ojcostwa, dochód nieznany, drugi rodzic na umowie o pracę.",
        },
        "u08-magdalena-bliznieta": {
          nazwa: "Magdalena Wójcik: umowa o pracę, bliźnięta",
          opis: "Umowa o pracę, ciąża bliźniacza, termin porodu 15.03.2027, wizyta 20.07.2026, małżeństwo, dochód 600,00 zł, drugi rodzic na umowie o pracę.",
        },
        "u08-magdalena-bez-zgody": {
          nazwa: "Magdalena Wójcik: plan bez zgody na dane dotyczące zdrowia",
          opis: "Odmowa zgody na dane dotyczące zdrowia, umowa o pracę matki: sprawy zależne od danych ciąży i dziecka wymagają uzupełnienia profilu.",
        },
        "u08-ewa-utrata-pracy": {
          nazwa: "Ewa Kamińska: umowa o pracę ustała w ciąży",
          opis: "Brak tytułu do ubezpieczenia, umowa o pracę ustała 31.10.2026 z powodu likwidacji pracodawcy, bez innego zatrudnienia, termin porodu 15.03.2027, dochód 1 950,00 zł.",
        },
        "u11-anna-podsumowanie-profilu": {
          nazwa: "Anna Nowak: podsumowanie profilu przed zapisem",
          opis: "Nowy użytkownik ze zgodą na dane dotyczące zdrowia i szkicem profilu na ekranie podsumowania: jednoosobowa działalność z konta ZUS, termin porodu 15.03.2027, gmina Bydgoszcz, drugi rodzic na umowie o pracę.",
        },
        "u11-anna-dane-rodziny": {
          nazwa: "Anna Nowak: przerwany profil na ekranie danych rodziny",
          opis: "Nowy użytkownik, który zamknął przewodnik na ekranie danych rodziny z wybraną gminą Bydgoszcz.",
        },
        "u11-anna-profil-zapisany": {
          nazwa: "Anna Nowak: zapisany profil rodziny",
          opis: "Rodzic z zapisanym profilem: jednoosobowa działalność z konta ZUS, termin porodu 15.03.2027, gmina Bydgoszcz, drugi rodzic na umowie o pracę.",
        },
        "u12-anna-zadluzenie-120": {
          nazwa: "Anna Nowak: zadłużenie z tytułu składek 120,00 zł",
          opis: "Stan rozliczeń składek z 21.11.2026 pokazuje zadłużenie 120,00 zł, wyższe niż próg 48,06 zł. Strażnik ostrzega przy sprawie Opłacenie składek.",
        },
        "u12-anna-zadluzenie-30": {
          nazwa: "Anna Nowak: zadłużenie z tytułu składek 30,00 zł",
          opis: "Stan rozliczeń składek z 21.11.2026 pokazuje zadłużenie 30,00 zł, nie wyższe niż próg 48,06 zł. Sprawa Opłacenie składek ma status załatwiona ze źródłem konto ZUS.",
        },
        "u12-anna-bez-duch": {
          nazwa: "Anna Nowak: dobrowolne ubezpieczenie chorobowe ustało",
          opis: "Profil podaje działalność z dobrowolnym ubezpieczeniem chorobowym, a dane konta ZUS z 21.11.2026 pokazują ustanie ubezpieczenia chorobowego od 01.11.2026. Strażnik ostrzega w etapie Ciąża.",
        },
        "u12-anna-podwyzszenie-podstawy": {
          nazwa: "Anna Nowak: podwyższenie podstawy składek do 12 000,00 zł",
          opis: "Dane konta ZUS zawierają podstawę składek 6 000,00 zł w 11 miesiącach i 12 000,00 zł w listopadzie 2026. Strażnik ostrzega o gwałtownym podwyższeniu podstawy.",
        },
        "u12-anna-podstawa-7000": {
          nazwa: "Anna Nowak: podstawa składek 7 000,00 zł bez ostrzeżenia",
          opis: "Dane konta ZUS zawierają podstawę składek 6 000,00 zł w 11 miesiącach i 7 000,00 zł w listopadzie 2026. Wzrost nie przekracza progu 50%, więc strażnik nie ostrzega o podstawie.",
        },
        "u12-karolina-bez-duch": {
          nazwa: "Karolina Lis: dobrowolne ubezpieczenie chorobowe ustało",
          opis: "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym w profilu, a dane konta ZUS pokazują ustanie ubezpieczenia chorobowego od 01.11.2026. Strażnik ostrzega, a plan nie zawiera sprawy Opłacenie składek.",
        },
        "u12-karolina-podwyzszenie-podstawy": {
          nazwa: "Karolina Lis: podwyższenie podstawy składek do 9 000,00 zł",
          opis: "Dane konta ZUS zawierają podstawę składek 4 806,00 zł w 11 miesiącach i 9 000,00 zł w listopadzie 2026. Strażnik ostrzega o gwałtownym podwyższeniu podstawy.",
        },
        "u13-anna-terminy-po-porodzie": {
          nazwa: "Anna Nowak: terminy po porodzie 19.11.2026",
          opis: "Dzień 21.11.2026, potwierdzona data porodu 19.11.2026. Kalendarz liczy terminy od daty porodu i pokazuje koszt spóźnienia przy sprawach.",
        },
        "u13-anna-wizyta-przed-terminem": {
          nazwa: "Anna Nowak: wizyta u lekarza przed końcem 10. tygodnia",
          opis: "Dzień 21.11.2026, przewidywany termin porodu 30.06.2027, bez daty pierwszej wizyty. Sprawa wizyty u lekarza albo położnej ma termin 01.12.2026 i 10 dni do terminu.",
        },
        "u13-anna-wizyta-po-terminie": {
          nazwa: "Anna Nowak: wizyta u lekarza po terminie",
          opis: "Dzień 05.12.2026, przewidywany termin porodu 30.06.2027, bez daty pierwszej wizyty. Sprawa wizyty jest w sekcji Po terminie.",
        },
        "u13-anna-800-po-terminie": {
          nazwa: "Anna Nowak: 800+ po terminie",
          opis: "Dzień 10.04.2027, data porodu 19.11.2026. Wniosek o 800+ jest po terminie, a kalendarz pokazuje koszt spóźnienia na dziś.",
        },
        "u14-ezla-koniec-okresu-blisko": {
          nazwa: "e-ZLA: okres zasiłkowy bliski wyczerpania",
          opis: "Magdalena Wójcik, zaświadczenie z kodem B od 16.03.2026 do 15.11.2026 (245 dni), ostrzeżenie 0115.",
        },
        "u14-ezla-okres-wyczerpany": {
          nazwa: "e-ZLA: okres zasiłkowy wyczerpany",
          opis: "Magdalena Wójcik, zaświadczenie z kodem B od 02.03.2026 do 26.11.2026 (270 dni), komunikat 0086.",
        },
        "u14-ezla-przerwa-65-dni": {
          nazwa: "e-ZLA: przerwa 65 dni otwiera nowy okres zasiłkowy",
          opis: "Magdalena Wójcik, zaświadczenia z kodem B od 01.06.2026 do 20.06.2026 i od 25.08.2026 do 14.09.2026: 21 dni z 270 od 25.08.2026.",
        },
        "u14-ezla-przerwa-56-dni": {
          nazwa: "e-ZLA: przerwa 56 dni w jednym okresie zasiłkowym",
          opis: "Magdalena Wójcik, zaświadczenia z kodem B od 01.07.2026 do 20.07.2026 i od 15.09.2026 do 30.09.2026: 36 dni z 270.",
        },
        "u14-ezla-nowy-rok-wynagrodzenia": {
          nazwa: "e-ZLA: wynagrodzenie chorobowe w nowym roku",
          opis: "Magdalena Wójcik, dzień 15.01.2027, zaświadczenie z kodem B od 20.12.2026 do 10.01.2027: w 2027 roku 10 dni z 33.",
        },
        "u14-ezla-jdg-bez-chorobowego": {
          nazwa: "e-ZLA: działalność bez dobrowolnego ubezpieczenia chorobowego",
          opis: "Joanna Mazur, zaświadczenie z kodem B od 02.11.2026 do 15.11.2026 bez wyliczeń okresu zasiłkowego, komunikat 0083.",
        },
        "u14-rozliczenia-niedostepne": {
          nazwa: "Stan rozliczeń niedostępny",
          opis: "Anna Nowak, PUE/eZUS nie zwraca stanu rozliczeń składek (0150).",
        },
        "u14-rozliczenia-na-progu": {
          nazwa: "Stan rozliczeń: zadłużenie 48,06 zł w dniu porodu",
          opis: "Anna Nowak, poród 19.11.2026 w profilu, zadłużenie 48,06 zł od 19.11.2026 równe progowi (0183).",
        },
        "u14-rozliczenia-ponad-prog": {
          nazwa: "Stan rozliczeń: zadłużenie 48,07 zł w dniu porodu",
          opis: "Anna Nowak, poród 19.11.2026 w profilu, zadłużenie 48,07 zł od 19.11.2026 (0182 z dniem 19.05.2027).",
        },
        "u14-rozliczenia-uklad-ratalny": {
          nazwa: "Stan rozliczeń: układ ratalny 900,00 zł",
          opis: "Anna Nowak, poród 19.11.2026 w profilu, 900,00 zł objęte układem ratalnym spłacanym zgodnie z umową (0184, zaświadczenie o niezaleganiu).",
        },
        "u14-rozliczenia-splata-w-6-miesiacach": {
          nazwa: "Stan rozliczeń: 120,00 zł spłacone 10.12.2026",
          opis: "Anna Nowak, dzień 15.12.2026, poród 19.11.2026 w profilu, zadłużenie 120,00 zł na 19.11.2026 spłacone 10.12.2026 (0186, wypłata do 08.02.2027).",
        },
        "u14-rozliczenia-bez-splaty-6-miesiecy": {
          nazwa: "Stan rozliczeń: 120,00 zł niespłacone od porodu 10.04.2026",
          opis: "Anna Nowak, dzień 21.11.2026, poród 10.04.2026 w profilu, zadłużenie 120,00 zł na 10.04.2026 i na 21.11.2026 bez spłaty (0185 z dniem 10.10.2026).",
        },
        "u14-rozliczenia-dzien-e-zla": {
          nazwa: "Stan rozliczeń: dzień powstania prawa z e-ZLA",
          opis: "Anna Nowak, dzień 21.11.2026, zaświadczenie e-ZLA od 02.11.2026 do 20.11.2026, zadłużenie 0,00 zł na 02.11.2026.",
        },
        "u14-800-plus-w-trakcie": {
          nazwa: "Wniosek o 800+ w trakcie rozpatrywania",
          opis: "Anna Nowak, 16.12.2026: wniosek o 800+ z 25.11.2026 w trakcie, zasiłek macierzyński wypłacony 15.12.2026.",
        },
        "u14-800-plus-przyznane": {
          nazwa: "Wniosek o 800+ przyznany",
          opis: "Anna Nowak, 05.01.2027: przyznanie 800+ na wniosek z 25.11.2026, najbliższa wypłata 800,00 zł 10.02.2027.",
        },
        "u14-800-plus-odmowa": {
          nazwa: "Wniosek o 800+ z odmową",
          opis: "Anna Nowak, 05.01.2027: odmowa na wniosek o 800+ z 25.11.2026, akcja przejścia do eZUS.",
        },
        "u14-aktywny-rodzic-zlozona-przez-rodzica": {
          nazwa: "Aktywny Rodzic: status złożona oznaczony przez rodzica",
          opis: "Anna Nowak, 25.11.2027: sprawa K18 Świadczenie z programu Aktywny Rodzic ma status złożona oznaczony przez rodzica 22.11.2027, a dane konta ZUS nie zawierają wniosku o świadczenie z programu Aktywny Rodzic.",
        },
        "u16-magdalena-dwa-zaswiadczenia": {
          nazwa: "Świadczenia w ciąży: dwa zaświadczenia e-ZLA z kodem B",
          opis: "Magdalena Wójcik, 21.11.2026, e-ZLA B 01.09.2026–30.09.2026 i 01.10.2026–31.10.2026: 33 z 33 dni wynagrodzenia, 61 z 270 dni okresu zasiłkowego.",
        },
        "u16-magdalena-bez-ezla": {
          nazwa: "Świadczenia w ciąży: bez zaświadczeń e-ZLA",
          opis: "Magdalena Wójcik, 21.11.2026, tytuł pracownika od 01.09.2019 bez zaświadczeń e-ZLA: reguła okresu zasiłkowego bez wyliczenia, komunikat 0114.",
        },
        "u16-anna-zadluzenie-120": {
          nazwa: "Świadczenia w ciąży: zadłużenie 120,00 zł ponad próg",
          opis: "Anna Nowak, 21.11.2026, zadłużenie z tytułu składek 120,00 zł bez układu ratalnego i odroczenia: komunikat 0154.",
        },
        "u16-anna-zadluzenie-progowe": {
          nazwa: "Świadczenia w ciąży: zadłużenie 48,06 zł równe progowi",
          opis: "Anna Nowak, 21.11.2026, bez zaświadczeń e-ZLA, zadłużenie 48,06 zł: zasiłek chorobowy przysługuje od 30.05.2024.",
        },
        "u16-anna-bez-stanu-rozliczen": {
          nazwa: "Świadczenia w ciąży: bez stanu rozliczeń składek",
          opis: "Anna Nowak, 21.11.2026, PUE/eZUS nie zwraca stanu rozliczeń: wynik z warunkiem opłacenia składek i komunikat 0155.",
        },
        "u16-anna-okres-wyczerpany": {
          nazwa: "Świadczenia w ciąży: okres zasiłkowy wyczerpany 04.03.2027",
          opis: "Anna Nowak, 05.03.2027, e-ZLA B nieprzerwanie 08.06.2026–14.03.2027 bez zadłużenia: komunikat 0086 i świadczenie rehabilitacyjne od 05.03.2027.",
        },
        "u16-paulina-okres-wyczekiwania": {
          nazwa: "Świadczenia w ciąży: okres wyczekiwania 90 dni",
          opis: "Paulina Wrona, 21.11.2026, dobrowolne ubezpieczenie chorobowe od 01.10.2026 bez zadłużenia: komunikat 0084 z dniem nabycia prawa 30.12.2026.",
        },
        "u16-paulina-ezla-styczen": {
          nazwa: "Świadczenia w ciąży: e-ZLA po okresie wyczekiwania",
          opis: "Paulina Wrona, 04.01.2027, e-ZLA B 04.01.2027–31.01.2027 bez zadłużenia: zasiłek chorobowy od 04.01.2027 do 31.01.2027, wypłaca ZUS.",
        },
        "u16-ewa-ustanie-umowy": {
          nazwa: "Świadczenia w ciąży: ustanie umowy o pracę 31.10.2026",
          opis: "Ewa Kamińska, 21.11.2026, tytuł pracownika 01.02.2021–31.10.2026 bez zaświadczeń e-ZLA: komunikat 0085 i zasiłek w wysokości zasiłku macierzyńskiego.",
        },
        "u16-karolina-odmowa-zgody": {
          nazwa: "Świadczenia w ciąży: odmowa zgody na dane dotyczące zdrowia",
          opis: "Karolina Lis, 21.11.2026, odmowa zgody i e-ZLA z 10.10.2026: wynik bez zaświadczeń e-ZLA i komunikat 0004.",
        },
        "u17-kanal-niedostepny": {
          nazwa: "Anna Nowak: Emp@tia niedostępna",
          opis: "Przejście do kanału z instrukcji sprawy, na przykład K14 Becikowe, kończy się komunikatem 0035, a przewodnik zostaje na instrukcji.",
        },
        "u17-mobywatel-zainstalowany": {
          nazwa: "Anna Nowak: aplikacja mObywatel zainstalowana",
          opis: "Instrukcja sprawy K06 Zgłoszenie urodzenia dziecka otwiera aplikację mObywatel zamiast usługi zgłoszenia urodzenia na gov.pl.",
        },
        "u17-blad-zapisu-oznaczenia": {
          nazwa: "Anna Nowak: błąd zapisu oznaczenia sprawy",
          opis: "Oznaczenie sprawy na instrukcji albo w arkuszu po powrocie z kanału kończy się komunikatem 0003, a sprawa zostaje do zrobienia.",
        },
        "u18-anna-email-z-konta-zus": {
          nazwa: "Anna Nowak: adres e-mail anna.nowak@poczta.pl w danych konta ZUS",
          opis: "Dane konta ZUS Anny Nowak zawierają adres anna.nowak@poczta.pl, a ustawienia przypomnień są domyślne: 7 dni, kanał e-mail, SMS wyłączony. Kod SMS w trybie demonstracyjnym to 482913.",
        },
        "u18-anna-sms-potwierdzony": {
          nazwa: "Anna Nowak: e-mail i potwierdzony SMS 600100200",
          opis: "Ustawienia przypomnień Anny Nowak z wyprzedzeniem 3 dni, kanałem e-mail anna.nowak@poczta.pl i kanałem SMS z numerem 600100200 potwierdzonym kodem.",
        },
        "u18-tomasz-bez-adresu-email": {
          nazwa: "Tomasz Nowak: brak adresu e-mail w danych konta ZUS",
          opis: "Dane konta ZUS Tomasza Nowaka nie zawierają adresu e-mail, a kanał SMS nie jest potwierdzony. Sekcja przypomnień pokazuje komunikat o braku adresu do przypomnień.",
        },
        "u18-tomasz-email-z-konta-zus": {
          nazwa: "Tomasz Nowak: adres e-mail tomasz.nowak@poczta.pl w danych konta ZUS",
          opis: "Dane konta ZUS Tomasza Nowaka z rolą Drugi rodzic zawierają adres tomasz.nowak@poczta.pl, a ustawienia przypomnień są domyślne. Przypomnienia o jego sprawach i sprawach obojga rodziców trafiają na ten adres.",
        },
        "u19-anna-przed-porodem": {
          nazwa: "Anna Nowak przed porodem",
          opis: "Profil z przewidywanym terminem porodu 15.03.2027, bez potwierdzonej daty porodu. Plan pokazuje akcję „Zgłoś narodziny”.",
        },
        "u19-anna-termin-26-11-2026": {
          nazwa: "Anna Nowak przed porodem z terminem 26.11.2026",
          opis: "Profil z przewidywanym terminem porodu 26.11.2026, bez potwierdzonej daty porodu. Po potwierdzeniu daty porodu 19.11.2026 sprawa K12 Świadczenie wychowawcze 800+ ma termin 19.02.2027.",
        },
        "u19-anna-nowe-dziecko-w-zus": {
          nazwa: "Anna Nowak: nowe dziecko w danych ZUS",
          opis: "Bez potwierdzonej daty porodu; w danych ZUS pojawia się Zofia Nowak urodzona 19.11.2026. Po zalogowaniu plan pokazuje okno nowego dziecka.",
        },
        "u19-anna-blizneta-w-zus": {
          nazwa: "Anna Nowak: bliźnięta w danych ZUS",
          opis: "Bez potwierdzonej daty porodu; w danych ZUS pojawiają się Zofia i Jan Nowak urodzeni 19.11.2026.",
        },
        "u19-anna-po-porodzie": {
          nazwa: "Anna Nowak po porodzie 19.11.2026",
          opis: "Potwierdzona data porodu 19.11.2026, jedno dziecko. Pakiet narodzin pokazuje sprawy na pierwsze 3 miesiące.",
        },
        "u19-anna-rozna-data-porodu": {
          nazwa: "Anna Nowak: data porodu różna od danych ZUS",
          opis: "Potwierdzona data porodu 18.11.2026; w danych ZUS pojawia się Zofia Nowak urodzona 19.11.2026. Po zalogowaniu przewodnik prowadzi do daty porodu z komunikatem 0063.",
        },
        "u22-paulina-k28": {
          nazwa: "Paulina Wrona: działalność podjęta w ciąży",
          opis: "Rozpoczęcie jednoosobowej działalności gospodarczej 01.10.2026, przewidywany termin porodu 15.03.2027 (sprawa K28 Umowa albo działalność podjęta w ciąży z ostrzeżeniem 0119).",
        },
        "u22-karolina-k29": {
          nazwa: "Karolina Lis: koniec umowy zlecenia przed porodem",
          opis: "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym od 01.02.2025 ustaje 31.01.2027, przewidywany termin porodu 15.03.2027 (sprawa K29 Ubezpieczenie chorobowe w dniu porodu z ostrzeżeniem 0120).",
        },
        "u22-zleceniobiorczyni-k29-tytul-pracownika": {
          nazwa: "Zleceniobiorczyni z umową o pracę: koniec umowy zlecenia przed porodem",
          opis: "Tytuł zleceniobiorcy z dobrowolnym ubezpieczeniem chorobowym od 01.02.2025 i tytuł pracownika od 01.06.2025 bez daty końca, umowa zlecenia ustaje 31.01.2027, przewidywany termin porodu 15.03.2027 (sprawa K29 Ubezpieczenie chorobowe w dniu porodu bez ostrzeżenia o ustaniu ubezpieczenia).",
        },
        "u22-ewa-k30-umowa-terminowa": {
          nazwa: "Ewa Kamińska: koniec umowy terminowej bez rodzaju umowy",
          opis: "Umowa o pracę kończy się 31.01.2027 z przyczyną koniec umowy na czas określony albo na okres próbny, przewidywany termin porodu 30.06.2027 (sprawa K29 Ubezpieczenie chorobowe w dniu porodu z przejściem do przedłużenia umowy w sprawie K30 Szczególna ochrona pracownika w ciąży i w czasie urlopów).",
        },
        "u22-magdalena-k30-wniosek": {
          nazwa: "Magdalena Wójcik: okres ochrony z wniosku o urlop rodzicielski",
          opis: "Umowa o pracę, przewidywany termin porodu 15.03.2027, wniosek o urlop rodzicielski od 02.08.2027 do 31.10.2027 złożony pracodawcy 21.11.2026 (sprawa K30 Szczególna ochrona pracownika w ciąży i w czasie urlopów z komunikatem 0158).",
        },
        "u22-karolina-k35-przedwczesny-porod": {
          nazwa: "Karolina Lis: przedwczesny poród",
          opis: "Poród 10.11.2026 w 32. tygodniu ciąży, przewidywany termin porodu 05.01.2027, sytuacja szczególna przedwczesny poród w profilu (sprawa K35 Wsparcie organizacji w sytuacji szczególnej z listą organizacji wsparcia).",
        },
        "u23-anna-drugi-rodzic-nie-dolaczyl": {
          nazwa: "Anna Nowak: drugi rodzic nie dołączył",
          opis: "Profil Anny Nowak z Tomaszem Nowakiem na umowie zlecenia (odpowiedź rodzica), który nie dołączył do planu. Pełnomocnictwo PEL od 01.10.2026 do odwołania. Dzisiaj 21.11.2026.",
        },
        "u23-anna-pel-od-przyszlej-daty": {
          nazwa: "Anna Nowak: pełnomocnictwo PEL od 01.12.2026",
          opis: "Tomasz Nowak udzielił Annie Nowak pełnomocnictwa PEL do roli Ubezpieczony od 01.12.2026. Dzisiaj 21.11.2026; po zmianie daty na 01.12.2026 przewodnik odczyta dane przy otwarciu.",
        },
        "u23-anna-pel-odczytane-ponowny-odczyt": {
          nazwa: "Anna Nowak: ponowny odczyt danych z pełnomocnictwa",
          opis: "Dane Tomasza Nowaka odczytane z pełnomocnictwa PEL 21.11.2026. Dzisiaj 05.12.2026; przy otwarciu przewodnik odczyta je ponownie.",
        },
        "u23-anna-pel-odwolane": {
          nazwa: "Anna Nowak: pełnomocnictwo PEL odwołane",
          opis: "Dane Tomasza Nowaka odczytane z pełnomocnictwa PEL 21.11.2026, odwołanego formularzem PEL-O 10.12.2026. Dzisiaj 11.12.2026.",
        },
        "u23-anna-pel-wygaslo": {
          nazwa: "Anna Nowak: pełnomocnictwo PEL wygasło 31.12.2026",
          opis: "Dane Tomasza Nowaka odczytane z pełnomocnictwa PEL obowiązującego do 31.12.2026. Dzisiaj 02.01.2027.",
        },
        "u23-magdalena-pel-korespondencja": {
          nazwa: "Magdalena Wójcik: pełnomocnictwo PEL do korespondencji",
          opis: "Profil Magdaleny Wójcik z Piotrem Wójcikiem na umowie o pracę (odpowiedź rodzica). Pełnomocnictwo PEL ograniczone do korespondencji.",
        },
        "u23-karolina-pel-wygasle": {
          nazwa: "Karolina Lis: pełnomocnictwo PEL wygasłe",
          opis: "Profil Karoliny Lis (Rodzic we własnej rodzinie) z Marcinem Lisem na umowie o pracę. Pełnomocnictwo PEL od 01.01.2026 do 31.10.2026. Dzisiaj 21.11.2026.",
        },
        "u23-joanna-bez-pelnomocnictwa": {
          nazwa: "Joanna Mazur: drugi rodzic bez pełnomocnictwa",
          opis: "Profil Joanny Mazur z drugim rodzicem na umowie o pracę, który nie udzielił pełnomocnictwa PEL. Dzisiaj 21.11.2026.",
        },
        "u24-tomasz-nowy-uzytkownik-przyjecie": {
          nazwa: "Tomasz Nowak: profil na start, przyjęcie dziecka",
          opis: "Nowy użytkownik ze zgodą na dane zdrowia i sytuacją przyjęcia dziecka w szkicu profilu (3.3.4.1.1 KA-01, KA-03).",
        },
        "u24-magdalena-przysposobienie": {
          nazwa: "Magdalena Wójcik: przysposobienie 16.11.2026",
          opis: "Rodzic na umowie o pracę z przysposobieniem bez daty uprawomocnienia, data wystąpienia do sądu 16.11.2026, drugi rodzic Piotr Wójcik na umowie o pracę, sprawa K01 Pierwsza wizyta u lekarza albo położnej do końca 10. tygodnia ciąży załatwiona oraz sprawy K04 Prawa pracownicy w ciąży i K24 Zasiłek chorobowy w ciąży do zrobienia przed zmianą (3.3.4.1.4 KA-01, KA-10, KA-11).",
        },
        "u24-magdalena-rodzina-zastepcza-zawodowa": {
          nazwa: "Magdalena Wójcik: rodzina zastępcza zawodowa",
          opis: "Rodzina zastępcza zawodowa z datą przyjęcia 16.11.2026 i drugim rodzicem Piotrem Wójcikiem (3.3.4.1.4 KA-13).",
        },
        "u24-anna-rodzina-zastepcza-odroczenie": {
          nazwa: "Anna Nowak: rodzina zastępcza niezawodowa z odroczeniem",
          opis: "Działalność z dobrowolnym ubezpieczeniem chorobowym, przyjęcie 16.11.2026, dziecko urodzone 10.05.2019, odroczenie obowiązku szkolnego (3.3.4.1.2 KA-08, KA-09).",
        },
        "u24-anna-rodzina-zastepcza-poza-wiekiem": {
          nazwa: "Anna Nowak: dziecko poza wiekiem urlopu",
          opis: "Rodzina zastępcza niezawodowa bez odroczenia, dziecko urodzone 10.05.2019, komunikat 0091 z wiekiem 7 lat (3.3.4.1.2 KA-07).",
        },
        "u24-anna-odmowa-zgody": {
          nazwa: "Anna Nowak: odmowa zgody na dane zdrowia",
          opis: "Rodzic z zapisaną odmową zgody; akcja danych przyjęcia na profilu rodziny pokazuje komunikat 0004 (3.3.4.1.1 KA-07).",
        },
        "u24-tomasz-ojciec-uprawomocnienie": {
          nazwa: "Tomasz Nowak: ojciec z datą uprawomocnienia",
          opis: "Ojciec na umowie o pracę, przysposobienie 02.03.2026, uprawomocnienie 15.10.2026 (3.3.4.1.2 KA-03, KA-20).",
        },
        "u24-magdalena-dwoje-dzieci": {
          nazwa: "Magdalena Wójcik: przysposobienie dwojga dzieci",
          opis: "Umowa o pracę, przysposobienie 16.11.2026 dwojga dzieci urodzonych 14.03.2024 i 01.02.2012, drugi rodzic Piotr Wójcik (3.3.4.1.4 KA-05, KA-06).",
        },
        "u25-anna-martwe-urodzenie": {
          nazwa: "Anna Nowak: urodzenie martwego dziecka, spokojny tryb",
          opis: "Poród 19.11.2026 zgłoszony jako urodzenie martwego dziecka. Spokojny tryb jest włączony, plan pokazuje zasiłek macierzyński po stracie dziecka i sprawy bez przypomnień.",
        },
        "u25-anna-zgon-jednego-z-blizniat": {
          nazwa: "Anna Nowak: zgon jednego z bliźniąt",
          opis: "Bliźnięta urodzone 19.11.2026, jedno dziecko zmarło 20.11.2026. Plan liczy świadczenia dla dziecka przy życiu.",
        },
        "u25-anna-przedwczesny-porod": {
          nazwa: "Anna Nowak: przedwczesny poród",
          opis: "Poród 19.11.2026 przed przewidywanym terminem 10.12.2026 zgłoszony jako przedwczesny. Plan pokazuje sprawę wsparcia z linkiem do organizacji.",
        },
        "u26-anna-tomasz-podzial": {
          nazwa: "Anna i Tomasz Nowak: podział urlopu rodzicielskiego",
          opis: "Poród 19.11.2026, jedno dziecko, podstawa wymiaru Anny 5 177,40 zł i Tomasza 8 197,55 zł z konta ZUS, wariant 100% i 70%.",
        },
        "u26-anna-tomasz-bez-danych-zus": {
          nazwa: "Anna Nowak: podział urlopu bez danych ZUS drugiego rodzica",
          opis: "Poród 19.11.2026, Tomasz Nowak na umowie o pracę bez dołączonego konta, więc rodzic wpisuje jego podstawę wymiaru.",
        },
        "u26-anna-tomasz-za-zyciem": {
          nazwa: "Anna i Tomasz Nowak: podział z zaświadczeniem „Za życiem”",
          opis: "Poród 19.11.2026, jedno dziecko z zaświadczeniem „Za życiem”, wymiar urlopu rodzicielskiego 65 tygodni.",
        },
        "u26-anna-tomasz-jdg-bez-chorobowego": {
          nazwa: "Anna Nowak: drugi rodzic bez prawa do zasiłku",
          opis: "Poród 19.11.2026, Tomasz Nowak prowadzi działalność bez dobrowolnego ubezpieczenia chorobowego, więc jego 9 tygodni przepada.",
        },
        "u26-anna-wariant-po-terminie": {
          nazwa: "Anna Nowak: wariant zasiłku po upływie 21 dni od porodu",
          opis: "Dzisiaj jest 11.12.2026, poród 19.11.2026, więc porównanie pokazuje wyłącznie wariant 100% i 70% z komunikatem 0038.",
        },
        "u27-anna-po-porodzie": {
          nazwa: "Wniosek ZAM: Anna Nowak po porodzie",
          opis: "Anna Nowak, JDG z dobrowolnym ubezpieczeniem chorobowym, poród 19.11.2026, córka Zofia Nowak, dzień demonstracyjny 21.11.2026.",
        },
        "u27-anna-bez-pesel-dziecka": {
          nazwa: "Wniosek ZAM: brak numeru PESEL dziecka",
          opis: "Anna Nowak po porodzie 19.11.2026; profil nie zawiera numeru PESEL ani miejscowości urodzenia dziecka.",
        },
        "u27-anna-za-zyciem": {
          nazwa: "Wniosek ZAM: zaświadczenie „Za życiem”",
          opis: "Anna Nowak po porodzie 19.11.2026; dziecko ma zaświadczenie „Za życiem”, urlop rodzicielski do 56 tygodni.",
        },
        "u27-anna-blizneta": {
          nazwa: "Wniosek ZAM: bliźnięta",
          opis: "Anna Nowak po porodzie 19.11.2026 z bliźniętami; urlop macierzyński do 23.06.2027.",
        },
        "u27-anna-szkic-po-terminie": {
          nazwa: "Wniosek ZAM: szkic z 08.12.2026 po terminie 21 dni",
          opis: "Szkic wniosku z całym urlopem rodzicielskim i zasiłkiem 81,5% z 08.12.2026; dzień demonstracyjny 11.12.2026.",
        },
        "u28-urlop-przed-porodem": {
          nazwa: "Wniosek o urlop przed porodem (Magdalena Wójcik)",
          opis: "Dzień 01.02.2027, umowa o pracę, przewidywany termin porodu 15.03.2027, data porodu niepotwierdzona.",
        },
        "u28-urlop-po-porodzie": {
          nazwa: "Wniosek o urlop macierzyński i rodzicielski (Magdalena Wójcik)",
          opis: "Dzień 21.11.2026, umowa o pracę, poród 19.11.2026, jedno dziecko Jan Wójcik, bez wysłanych wniosków o urlop.",
        },
        "u29-odpis-po-porodzie": {
          nazwa: "Anna Nowak: wniosek o odpis aktu urodzenia Zofii",
          opis: "Potwierdzona data porodu 19.11.2026, dziecko Zofia Nowak urodzone w Bydgoszczy, gmina Bydgoszcz. W planie sprawa Odpis aktu urodzenia dziecka prowadzi do wniosku o odpis.",
        },
        "u29-odpis-bez-miejsca-urodzenia": {
          nazwa: "Anna Nowak: odpis aktu urodzenia bez miejsca urodzenia w profilu",
          opis: "Potwierdzona data porodu 19.11.2026, dziecko Zofia Nowak, gmina Bydgoszcz, profil bez miejsca urodzenia dziecka. Miejsce urodzenia wpisane we wniosku trafia po złożeniu także do profilu rodziny.",
        },
        "u29-odpis-tomasz-bez-e-doreczen": {
          nazwa: "Tomasz Nowak: wniosek o odpis bez adresu do e-Doręczeń",
          opis: "Tomasz Nowak z rolą Drugi rodzic w rodzinie Anny Nowak po porodzie Zofii. Konto nie ma adresu do e-Doręczeń, więc rejestr stanu cywilnego nie przyjmuje wniosku o odpis przy żadnym sposobie odbioru.",
        },
        "u29-pytanie-k08-wyslane": {
          nazwa: "Anna Nowak: pytanie do ZUS o wniosek o zasiłek macierzyński (K08) bez odpowiedzi",
          opis: "Zapisany profil i plan rodziny. Pytanie wysłane 21.11.2026 o 10:15. Symulowana odpowiedź ZUS przychodzi po czasie ustawionym w parametrach systemu.",
        },
        "u29-pytanie-k08-odpowiedz": {
          nazwa: "Anna Nowak: odpowiedź ZUS na pytanie o wniosek o zasiłek macierzyński (K08)",
          opis: "Zapisany profil i plan rodziny, przypomnienia SMS 500 100 200 i e-mail anna.nowak@example.pl. Odpowiedź ZUS z 25.11.2026; gdy przewodnik ponownie sprawdzi korespondencję, wyśle SMS i e-mail.",
        },
        "u29-dane-konta-kopia-nieaktualna": {
          nazwa: "Anna Nowak: dane konta ZUS z 20.11.2026 przy niedostępnym PUE/eZUS",
          opis: "Zapisany profil i plan rodziny, dane z konta ZUS zapisane 20.11.2026 o 18:30. PUE/eZUS jest niedostępne, więc podgląd danych konta pokazuje zapisane dane z komunikatem 0002.",
        },
        "u30-anna-zas53-w-ubezpieczeniu": {
          nazwa: "Wniosek ZAS-53: Anna Nowak w okresie ubezpieczenia",
          opis: "Anna Nowak w ciąży, JDG z dobrowolnym ubezpieczeniem chorobowym, przewidywany termin porodu 15.03.2027, e-ZLA ZY 2611021 od 02.11.2026 z kodem B (sprawa K24 Zasiłek chorobowy w ciąży).",
        },
        "u30-ewa-zas53-po-ustaniu": {
          nazwa: "Wniosek ZAS-53: Ewa Kamińska po ustaniu ubezpieczenia",
          opis: "Ewa Kamińska w ciąży, umowa o pracę ustała 31.10.2026 z powodu likwidacji pracodawcy, e-ZLA ZY 2611093 od 09.11.2026, przewidywany termin porodu 20.03.2027 (sprawa K24 Zasiłek chorobowy w ciąży z oświadczeniem Z-10).",
        },
        "u32-laczenie-z-praca": {
          nazwa: "Łączenie urlopu rodzicielskiego z pracą (Magdalena Wójcik)",
          opis: "Dzień 01.06.2027, umowa o pracę, poród 19.11.2026, wysłany wniosek o urlop macierzyński z urlopem rodzicielskim do 17.11.2027.",
        },
        "u34-rezygnacja-magdalena": {
          nazwa: "Rezygnacja z dalszej części urlopu macierzyńskiego (Magdalena Wójcik)",
          opis: "Dzień 10.02.2027, umowa o pracę, poród 19.11.2026, drugi rodzic Piotr Wójcik na umowie o pracę, pracodawca kadry@przyklad.pl.",
        },
        "u34-zam-14-tygodni-anna": {
          nazwa: "Wniosek ZAM wyłącznie o 14 tygodni (Anna Nowak)",
          opis: "Dzień 21.11.2026, działalność z dobrowolnym ubezpieczeniem chorobowym, poród 19.11.2026, bez wniosku ZAM.",
        },
        "u34-zam-14-tygodni-karolina": {
          nazwa: "Wniosek ZAM wyłącznie o 14 tygodni dla zleceniodawcy (Karolina Lis)",
          opis: "Dzień 21.11.2026, umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym, zasiłek wypłaca zleceniodawca, poród 19.11.2026, bez wniosku ZAM.",
        },
      },
      u01AnnaProfilDemo: {
        nazwa: "Anna Nowak po symulacji uzupełnienia profilu",
        opis: "Profil rodziny Anny Nowak z danymi przykładowymi: przewidywany termin porodu za 120 dni, jedno dziecko, plan rodziny w etapie Ciąża.",
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
    wstep: "Skrzynka zbiera wiadomości e-mail i SMS, które przewodnik wysłał na konta w trybie demonstracyjnym, oraz wiadomości zaplanowane do wysłania.",
    tylkoDemo: "Skrzynka wiadomości działa wyłącznie w trybie demonstracyjnym.",
    konto: "Konto",
    kontoPodpowiedz: "Wybierz konto, którego wiadomości chcesz zobaczyć.",
    brakKonta: "To konto nie ma jeszcze wiadomości, bo nikt się na nie nie zalogował.",
    doreczanie: {
      tytul: "Wysyłka zaplanowanych wiadomości",
      opis: ({ teraz }: { teraz: string }) =>
        `Przewodnik wysyła zaplanowane wiadomości o ustalonej godzinie. Teraz w trybie demonstracyjnym jest ${teraz}.`,
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
        inny: "Inny powód",
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
    wstep: "Przewodnik ułoży plan rodziny ze świadczeniami, które Ci przysługują, policzy terminy i pomoże przygotować wnioski.",
    coZrobisz: {
      tytul: "Co zrobisz w przewodniku",
      plan: {
        tytul: "Plan rodziny",
        opis: "Zobaczysz świadczenia, które przysługują Twojej rodzinie, i sprawy do załatwienia po kolei.",
      },
      terminy: {
        tytul: "Terminy",
        opis: "Policzymy, do kiedy złożyć wnioski i dokumenty, i przypomnimy Ci o nich.",
      },
      wnioski: {
        tytul: "Twoje wnioski",
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
        "Zdecydujesz, czy zgadzasz się na przetwarzanie danych dotyczących zdrowia: o ciąży, porodzie, poronieniu i stanie zdrowia matki i dziecka oraz zaświadczeń lekarskich e-ZLA.",
        "Sprawdzisz dane z konta ZUS i uzupełnisz profil na start.",
        "Zobaczysz plan rodziny.",
      ],
      twojeDane: "Twoje dane",
      notatki: [
        "Rozpoznajemy Cię po numerze PESEL potwierdzonym przy logowaniu. Niezależnie od sposobu logowania zobaczysz ten sam profil rodziny.",
        "Tylko za Twoją zgodą zapiszemy dane o ciąży, porodzie, poronieniu i stanie zdrowia matki i dziecka oraz pobierzemy z konta ZUS zaświadczenia lekarskie e-ZLA.",
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
      opis: "Zgoda dotyczy danych o ciąży, porodzie i stanie zdrowia dziecka, które podajesz w przewodniku. Wykorzystujemy je wyłącznie do ułożenia planu rodziny, policzenia terminów i przygotowania wniosków.",
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
        odmowa: "Odmowa",
        wycofana: "Wycofana",
      },
      wycofaj: "Wycofaj zgodę",
      udziel: "Udziel zgody",
      notatkaUdzielonej: "Po wycofaniu zgody od razu przestaniemy wykorzystywać te dane i usuniemy je w ciągu 30 dni.",
      notatkaBezZgody: "Gdy udzielisz zgody, wycofasz ją w każdej chwili w tym miejscu.",
      notatkaWycofanej: "Gdy udzielisz zgody ponownie, przewodnik znów uwzględni te dane w planie rodziny, terminach i wnioskach.",
      // koniec sekcjaZgody
    },
    sekcjaPrzypomnien: {
      tytul: "Przypomnienia o terminach",
      wstep: "Przypomnimy Ci o każdej sprawie do zrobienia przed jej terminem i w dniu terminu, zawsze o 9:00. Gdy oznaczysz sprawę jako złożoną albo załatwioną, przestaniemy o niej przypominać.",
      wlacz: "Wysyłaj mi przypomnienia o terminach",
      wylaczone: {
        przed: "Przypomnienia są wyłączone dla wszystkich spraw, także dla sprawy z najbliższym terminem. Terminy sprawdzisz na stronie",
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
      skrzynka: "Zobacz wysłane przypomnienia w skrzynce demonstracyjnej",
      // koniec sekcjaPrzypomnien
    },
    kartaPlikuKalendarza: {
      tytul: "Terminy w Twoim kalendarzu",
      wstep: "Pobierz terminy spraw do zrobienia jako plik kalendarza i otwórz go w kalendarzu na komputerze albo na telefonie.",
      przycisk: "Pobierz plik kalendarza",
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
      wstepBezKopii: "Zaczynamy od danych, które ZUS ma na Twoim koncie.",
      stanNa: ({ dataICzas }: { dataICzas: string }) => `Stan na ${dataICzas}`,
      tytulOdczytu: "Pobieramy dane z Twojego konta ZUS",
      opisOdczytu:
        "Pobieramy tytuły ubezpieczenia, podstawy składek, płatników, członków rodziny i zasiłki, żeby nie trzeba było ich wpisywać.",
      czasOdczytu: ({ liczbaSekund }: { liczbaSekund: number }) =>
        liczbaSekund === 1 ? "To potrwa około sekundy." : `To potrwa około ${liczbaSekund} sekund.`,
      czasOdczytuChwila: "To potrwa chwilę.",
      ogloszenieStartu: ({ czas }: { czas: string }) => `Pobieramy dane z Twojego konta ZUS. ${czas}`,
      ogloszenieKonca: "Pobraliśmy dane z Twojego konta ZUS.",
      tylkoOdczyt: "Twoje konto ZUS pozostaje bez zmian.",
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
        brakDanych: "Brak tytułu ubezpieczenia w danych konta ZUS",
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
        wyplacaStanNa: ({ wartosc, data }: { wartosc: string; data: string }) => `${wartosc}, stan na ${data}`,
        zasada:
          "Płatnik wypłaca zasiłki, gdy według stanu na 30 listopada poprzedniego roku zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób.",
        brakInformacji: ({ platnicy }: { platnicy: string }) =>
          `Dane z ZUS nie pokazują, czy zasiłki wypłaca ${platnicy}. Zapytamy Cię o to na następnym ekranie.`,
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
          `${imieINazwisko} to nowe dziecko, którego nie było w danych z ${dataOdczytu}. Uwzględnimy je w Twoim profilu rodziny.`,
        noweDzieciPoOdczycie: ({ imieINazwisko, dataOdczytu }: { imieINazwisko: string; dataOdczytu: string }) =>
          `${imieINazwisko} to nowe dzieci, których nie było w danych z ${dataOdczytu}. Uwzględnimy je w Twoim profilu rodziny.`,
        noweDzieckoPierwszyOdczyt: ({ imieINazwisko }: { imieINazwisko: string }) =>
          `${imieINazwisko} to nowe dziecko urodzone w ciągu ostatnich 30 dni. Uwzględnimy je w Twoim profilu rodziny.`,
        noweDzieciPierwszyOdczyt: ({ imieINazwisko }: { imieINazwisko: string }) =>
          `${imieINazwisko} to nowe dzieci urodzone w ciągu ostatnich 30 dni. Uwzględnimy je w Twoim profilu rodziny.`,
      },
      zasilki: {
        tytul: "Zasiłki z ostatnich 6 miesięcy",
        brak: "Brak zasiłków wypłaconych przez ZUS",
        podpis: "Zasiłki wypłacone przez ZUS w ostatnich 6 miesiącach",
        przewijanie: "Tabela zasiłków",
        kolumny: {
          rodzaj: "Rodzaj zasiłku",
          okres: "Okres zasiłku",
          data: "Data wypłaty",
          kwota: "Kwota brutto",
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
        "Twoje konto ZUS pozostaje bez zmian. Przy każdym otwarciu przewodnika widzisz aktualne dane z ZUS.",
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
    opisKarty: "Sprawdź te dane i potwierdź je albo zmień odpowiedź.",
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
    choroboweObowiazkowe: "Obowiązkowe, bo jesteś pracownikiem. Pytanie o dobrowolne ubezpieczenie chorobowe Cię nie dotyczy.",
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
      wyplaca: "Ten płatnik składek wypłaca zasiłki, bo zgłasza do ubezpieczenia chorobowego więcej niż 20 osób. To płatnik przy formie zatrudnienia, którą potwierdzasz.",
      brakPlatnikaPrzy: ({ forma }: { forma: string }) =>
        `Na Twoim koncie ZUS nie ma płatnika składek przy ${forma}. Zapytamy o niego na następnym ekranie.`,
      brakInformacji: ({ nazwa }: { nazwa: string }) =>
        `Na Twoim koncie ZUS nie ma informacji, czy płatnik składek ${nazwa} wypłaca zasiłki. Zapytamy o to na następnym ekranie.`,
      poUstaniu: ({ data }: { data: string }) =>
        `Twój tytuł ubezpieczenia ustał ${data}. Zasiłek po ustaniu ubezpieczenia wypłaca ZUS.`,
      kazdyTytulEtykieta: "Płatnik zasiłku przy każdym tytule",
      kazdyTytul: ({ tytul, platnik, nazwa }: { tytul: string; platnik: string; nazwa: string }) =>
        `${tytul} u płatnika składek ${nazwa}: ${platnik}`,
      glowny: "płatnik główny",
      dalszaWyplata:
        "Jeśli ZUS zaczął wypłacać Ci zasiłek przed 1 stycznia, wypłaca go dalej także wtedy, gdy od 1 stycznia zasiłki wypłaca płatnik składek.",
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
    notatkaKilkaTytulow: "Masz kilka tytułów ubezpieczenia. Proponujemy ten, który jest pierwszy w kolejności: umowa o pracę, jednoosobowa działalność gospodarcza, umowa zlecenia.",
    dzieci: {
      tytul: "Dzieci zgłoszone do ubezpieczenia zdrowotnego",
      brak: "Na Twoim koncie ZUS nie ma dzieci zgłoszonych do ubezpieczenia zdrowotnego.",
      bezDanych: "Pokażemy je, gdy pobierzemy dane z Twojego konta ZUS.",
      kolumny: {
        imieINazwisko: "Imię i nazwisko",
        dataUrodzenia: "Data urodzenia",
        zrodlo: "Źródło",
      },
      zrodloKonto: "Konto ZUS",
      przewijanie: "Tabela dzieci zgłoszonych do ubezpieczenia zdrowotnego",
    },
    pozostaleDane: "Wszystkie dane z Twojego konta ZUS",
    notatkaOdswiezania: "Przy każdym otwarciu przewodnika widzisz aktualne dane z konta ZUS.",
    dalej: "Potwierdź i przejdź dalej",
    tytulKartyZasilku: "Ubezpieczenie chorobowe i płatnik zasiłku",
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
    opisNieWiem: "Zapiszemy płatnika zasiłku jako nieustalonego.",
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
    notatkaZgodyPrzed: "Dane o ciąży i dziecku zapisujemy tylko za Twoją zgodą na dane dotyczące zdrowia. Zgodę zmienisz w ",
    notatkaZgodyLink: "ustawieniach przewodnika",
    notatkaZgodyPo: ".",
    // koniec ViewProfileSituation
  },
  ViewProfilePregnancy: {
    tytulStrony: "Profil na start: dane ciąży",
    naglowek: "Profil na start",
    wstep: "Odpowiedz na kilka pytań, a ułożymy z nich plan Twojej rodziny. Pytamy tylko o to, czego nie ma na Twoim koncie ZUS.",
    tytulKarty: "Dane ciąży",
    opisKarty: "Na podstawie tych dat policzymy Twoje terminy.",
    etykietaTerminu: "Przewidywany termin porodu",
    podpowiedzTerminu: "Wpisz datę w formacie DD.MM.RRRR.",
    etykietaLiczbyDzieci: "Liczba dzieci",
    liczbyDzieci: {
      1: "Jedno dziecko",
      2: "Bliźnięta",
      3: "Trojaczki",
      4: "Czworaczki",
      5: "Pięcioraczki",
    },
    przyLiczbieDzieci: {
      1: "jednym dziecku",
      2: "bliźniętach",
      3: "trojaczkach",
      4: "czworaczkach",
      5: "pięcioraczkach",
    },
    podpowiedzLiczbyDzieci: ({ przy, macierzynski, rodzicielski }: { przy: string; macierzynski: string; rodzicielski: string }) =>
      `Przy ${przy} urlop macierzyński trwa ${macierzynski}, a urlop rodzicielski ${rodzicielski}.`,
    tygodnie: ({ liczba }: { liczba: number }) => {
      const reszta10 = liczba % 10;
      const reszta100 = liczba % 100;
      if (liczba === 1) return "1 tydzień";
      if (reszta10 >= 2 && reszta10 <= 4 && (reszta100 < 12 || reszta100 > 14)) return `${liczba} tygodnie`;
      return `${liczba} tygodni`;
    },
    etykietaWizyty: "Data pierwszej wizyty u lekarza albo położnej",
    podpowiedzWizyty: "Wpisz datę pierwszej wizyty w tej ciąży w formacie DD.MM.RRRR.",
    brakWizyty: "Wizyta jeszcze się nie odbyła",
    notatkaZgody: {
      przed: "Dane o ciąży zapisujemy za Twoją zgodą na dane dotyczące zdrowia. Zgodę zmienisz w ",
      odnosnik: "ustawieniach przewodnika",
      po: ".",
    },
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
    wstep: "Podaj datę porodu i liczbę urodzonych dzieci. Data porodu zastąpi przewidywany termin porodu. Od niej policzymy na nowo plan rodziny i terminy.",
    przewidywanyTermin: "Przewidywany termin porodu w profilu:",
    wstepProfil: "Podaj datę porodu i liczbę urodzonych dzieci. Gdy zapiszesz profil, policzymy od daty porodu plan rodziny i terminy.",
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
    brakRodziny: "Nie masz jeszcze profilu rodziny. Zapisz profil na start, a potem zgłoś narodziny.",
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
    datyUrodzenia: {
      wstep: "Podaj datę urodzenia każdego dziecka. Przy pięciorgu i więcej dzieciach podaj daty pięciorga najmłodszych.",
      etykieta: ({ numer }: { numer: string }) => `Data urodzenia dziecka ${numer}`,
    },
    dataWystapieniaDoSadu: {
      etykieta: "Data wystąpienia do sądu opiekuńczego z wnioskiem o przysposobienie",
      podpowiedz: "DD.MM.RRRR. Termin wniosku o urlop i zasiłek policzymy od późniejszej z dwóch dat: daty wystąpienia do sądu albo daty przyjęcia dziecka.",
    },
    odroczenie: {
      legenda: "Czy dziecko ma odroczony obowiązek szkolny?",
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
      "W profilu masz jedną ścieżkę: ciążę i poród albo przyjęcie dziecka. Gdy przejdziesz dalej, dane przyjęcia zastąpią w profilu dane ciąży. Gdy wrócisz do poprzedniego kroku, dane ciąży zostaną bez zmian.",
    wstecz: "Wstecz",
    dalej: "Dalej",
    krokiProfilu: {
      tytul: "Kroki profilu",
      etykietaBocznej: "Postęp profilu",
      daneZKontaZus: "Dane konta ZUS",
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
    wstep: "Odpowiedz na kilka pytań, a ułożymy z nich plan Twojej rodziny. Pytamy tylko o to, czego nie ma na Twoim koncie ZUS.",
    tytulKarty: "Zmiana zatrudnienia w ciąży",
    opisOkresuTermin: ({ od, termin }: { od: string; termin: string }) =>
      `Pytamy o zmiany od ${od} do przewidywanego terminu porodu ${termin}. Od nich zależą świadczenia, które przysługują Ci w ciąży i po porodzie.`,
    opisOkresuPorod: ({ od, porod }: { od: string; porod: string }) =>
      `Pytamy o zmiany od ${od} do dnia porodu ${porod}. Od nich zależą świadczenia, które przysługują Ci po porodzie.`,
    brakDatyOdniesienia: "Najpierw podaj przewidywany termin porodu albo datę porodu. Na jej podstawie ustalimy okres ciąży, o który pytamy.",
    przejdzDoPoprzedniegoKroku: "Przejdź do poprzedniego kroku",
    legendaRodzaju: "Czy w czasie ciąży Twoje zatrudnienie się zmieniło?",
    rodzaje: {
      "bez-zmian": { etykieta: "Bez zmian", opis: "Praca albo działalność trwa bez przerwy." },
      rozpoczecie: { etykieta: "Rozpoczęcie", opis: "Praca albo działalność zaczęła się w czasie ciąży." },
      ustanie: { etykieta: "Ustanie", opis: "Praca albo działalność skończyła się albo skończy przed porodem." },
    },
    formyWZdaniu: {
      "umowa-o-prace": "umowa o pracę",
      "umowa-zlecenia": "umowa zlecenia",
      jdg: "działalność",
    },
    opisTytulu: {
      trwa: ({ forma, od }: { forma: string; od: string }) => `Na Twoim koncie ZUS ${forma} trwa od ${od} bez daty końca`,
      trwala: ({ forma, od, do: koniec }: { forma: string; od: string; do: string }) =>
        `Na Twoim koncie ZUS ${forma} trwała od ${od} do ${koniec}`,
      skonczylaSie: ({ forma, data }: { forma: string; data: string }) => `Na Twoim koncie ZUS ${forma} skończyła się ${data}`,
      zaczelaSie: ({ forma, data }: { forma: string; data: string }) => `Na Twoim koncie ZUS ${forma} zaczęła się ${data}`,
    },
    zaznaczylismy: ({ opis, odpowiedz }: { opis: string; odpowiedz: string }) => `${opis}, więc zaznaczyliśmy „${odpowiedz}”.`,
    zaznaczylismyBezZmian: ({ opis }: { opis: string }) =>
      `${opis}, więc zaznaczyliśmy „Bez zmian”. Zmień odpowiedź, jeśli jest inna.`,
    odpowiedzRozna: ({ opis }: { opis: string }) => `${opis}. Twoja odpowiedź różni się od tych danych.`,
    legendaFormy: "Której formy zatrudnienia dotyczy zmiana?",
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      jdg: "Jednoosobowa działalność gospodarcza",
    },
    etykietaDatyRozpoczecia: "Data rozpoczęcia",
    etykietaDatyUstania: "Data ustania",
    podpowiedzDaty: "Wpisz datę w formacie DD.MM.RRRR.",
    etykietaPrzyczyny: "Przyczyna ustania umowy o pracę",
    pustaPrzyczyna: "Wybierz przyczynę",
    przyczyny: {
      upadlosc: "Upadłość pracodawcy",
      likwidacja: "Likwidacja pracodawcy",
      "smierc-pracodawcy": "Śmierć pracodawcy",
      "naruszenie-z-wyrokiem": "Rozwiązanie umowy z naruszeniem przepisów potwierdzone prawomocnym wyrokiem sądu",
      "naruszenie-bez-wyroku": "Rozwiązanie umowy z naruszeniem przepisów bez prawomocnego wyroku",
      "koniec-umowy-terminowej": "Koniec umowy na czas określony albo na okres próbny",
      inna: "Inna przyczyna",
    },
    przyczynyWDopelniaczu: {
      upadlosc: "upadłości pracodawcy",
      likwidacja: "likwidacji pracodawcy",
      "smierc-pracodawcy": "śmierci pracodawcy",
    },
    legendaInnegoZatrudnienia: "Czy zapewniono Ci inne zatrudnienie?",
    podpowiedzInnegoZatrudnienia: ({ przyczyna }: { przyczyna: string }) => `Pytamy, bo umowa ustała z powodu ${przyczyna}.`,
    tak: "Tak",
    nie: "Nie",
    notatkaPrzyczynyPrzyUmowieOPrace: "O przyczynę zapytamy, gdy wybierzesz umowę o pracę.",
    rozpoczecieWZdaniu: {
      "umowa-o-prace": "rozpoczęcie pracy na umowie o pracę",
      "umowa-zlecenia": "rozpoczęcie umowy zlecenia",
      jdg: "rozpoczęcie działalności",
    },
    notatkaRozpoczecia: ({ coZmienia }: { coZmienia: string }) =>
      `O przyczynę pytamy tylko przy ustaniu umowy o pracę. W planie zobaczysz, co zmienia ${coZmienia} w ciąży.`,
    zrodla: {
      "konto-zus": "Źródło: konto ZUS",
      "pelnomocnictwo-pel": "Źródło: pełnomocnictwo PEL",
      "odpowiedz-rodzica": "Źródło: Twoja odpowiedź",
    },
    // koniec ViewProfileEmploymentChange
  },
  ViewProfileFamily: {
    tytulStrony: "Profil na start: dane rodziny",
    naglowek: "Profil na start",
    wstep: "Odpowiedz na kilka pytań, a ułożymy z nich plan Twojej rodziny. Pytamy tylko o to, czego nie ma na Twoim koncie ZUS.",
    tytulKarty: "Dane rodziny",
    opisKarty: "Od sytuacji Twojej rodziny zależą niektóre świadczenia. Odpowiedz na kilka pytań.",
    legendaStanuCywilnego: "Czy rodzice dziecka są małżeństwem?",
    stanyCywilne: {
      malzenstwo: "Rodzice są małżeństwem",
      "nie-malzenstwo": "Rodzice nie są małżeństwem",
    },
    legendaOjcostwa: "Czy ojcostwo dziecka jest uznane?",
    podpowiedzOjcostwa: "Pytamy, bo rodzice nie są małżeństwem.",
    uznaniaOjcostwa: {
      uznane: "Ojcostwo uznane",
      nieuznane: "Ojcostwo nieuznane",
    },
    etykietaGminy: "Gmina, w której mieszkasz",
    podpowiedzGminy: "Wpisz nazwę gminy i wybierz ją z listy podpowiedzi.",
    podpowiedzGminyNaLiscie: ({ nazwa, powiat, wojewodztwo }: { nazwa: string; powiat: string; wojewodztwo: string }) =>
      `${nazwa} (powiat ${powiat}, województwo ${wojewodztwo})`,
    wybranaGmina: ({ nazwa, powiat, wojewodztwo }: { nazwa: string; powiat: string; wojewodztwo: string }) =>
      `Wybrana gmina: ${nazwa}, powiat ${powiat}, województwo ${wojewodztwo}`,
    etykietaDochodu: "Miesięczny dochód netto na osobę w rodzinie",
    podpowiedzDochodu: "Podaj kwotę w złotych. Przyjmiemy ją tak, jak ją wpiszesz.",
    pominDochod: "Pomiń dochód",
    podpowiedzPominieciaDochodu: "Zapiszemy dochód jako nieznany. Podasz go później w profilu rodziny.",
    zgoda: {
      przed: "Zgodę możesz wyrazić w ",
      odnosnik: "ustawieniach przewodnika",
      po: ".",
    },
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
      tytul: "Dziecko",
      zmien: "Zmień dane dziecka",
      imieINazwisko: "Imię i nazwisko",
      pesel: "Numer PESEL",
      dataPorodu: "Data porodu",
      liczbaDzieci: "Liczba urodzonych dzieci",
      tydzien: "Ukończone tygodnie ciąży w dniu porodu",
      masa: "Masa urodzeniowa",
      masaWGramach: ({ masa }: { masa: string }) => `${masa} g`,
      pobytWSzpitalu: "Pobyt dziecka w szpitalu po porodzie",
      dni: "Kolejne dni pobytu w szpitalu od 5. dnia po porodzie",
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
      notka: "Jeśli dziecko trafi do szpitala, liczbę dni pobytu w szpitalu zmienisz do 28. dnia jego życia. Nową liczbę dni uwzględnią plan rodziny, kalkulator zasiłku i wniosek o zasiłek macierzyński.",
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
      zmienionoPoprzednio: ({ wartosc }: { wartosc: string }) => `Zmieniono, poprzednio: ${wartosc}`,
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
          "Przyjmujesz dziecko na wychowanie, więc w profilu widzisz dane przyjęcia dziecka w miejscu danych ciąży.",
        przeliczenie: ({ data }: { data: string }) =>
          `Po zapisaniu plan i terminy liczą się od daty przyjęcia ${data}. Sprawy złożone i załatwione zachowają status.`,
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
        opis: "Nie udzielasz zgody na przetwarzanie danych dotyczących zdrowia, a dane przyjęcia dziecka należą do danych o ciąży i dziecku.",
        ustawienia: "Zgody możesz udzielić w każdej chwili w ustawieniach przewodnika.",
        przejdz: "Przejdź do ustawień",
      },
      // koniec sekcjaPrzyjecia
    },
    sekcjaDrugiegoRodzica: {
      tytulDrugiegoRodzica: "Drugi rodzic: Twoje dane",
      wiersze: {
        imieINazwisko: "Imię i nazwisko",
        rola: "Rola w przewodniku",
        tytul: "Tytuł do ubezpieczenia",
        chorobowe: "Ubezpieczenie chorobowe",
        podstawa: "Podstawa składek",
        platnik: "Płatnik zasiłku",
        platnikWyplaca: "Płatnik składek wypłaca zasiłki",
        dostep: "Dostęp do planu",
      },
      formyWTekscie: {
        "umowa-o-prace": "umowa o pracę",
        "umowa-zlecenia": "umowa zlecenia",
        jdg: "jednoosobowa działalność gospodarcza",
        "brak-tytulu": "brak tytułu do ubezpieczenia",
      },
      zDobrowolnym: ({ forma }: { forma: string }) => `${forma} z dobrowolnym ubezpieczeniem chorobowym`,
      bezDobrowolnego: ({ forma }: { forma: string }) => `${forma} bez dobrowolnego ubezpieczenia chorobowego`,
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
      tytuly: {
        pracownik: ({ data }: { data: string }) => `Pracownik od ${data}`,
        zleceniobiorca: ({ data }: { data: string }) => `Zleceniobiorca od ${data}`,
        dzialalnosc: ({ data }: { data: string }) => `Działalność gospodarcza od ${data}`,
      },
      podstawaStala: ({ kwota }: { kwota: string }) => `${kwota} w każdym z ostatnich 12 miesięcy`,
      podstawaOstatnia: ({ kwota, miesiac }: { kwota: string; miesiac: string }) => `${kwota} za ${miesiac}`,
      brakPodstaw: "Brak podstaw składek",
      nieDolaczyl: "Nie dołączył",
      drugiRodzicOd: ({ data }: { data: string }) => `Drugi rodzic od ${data}`,
      odlaczony: ({ data }: { data: string }) => `Odłączony ${data}`,
      zrodloPelnomocnictwa: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Źródło: pełnomocnictwo PEL od ${imieINazwisko}. Dane z dnia:`,
      odlaczonyOpis: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `${imieINazwisko} nie ma już dostępu do planu rodziny. Przypomnienia o jego sprawach, np. o urlopie ojcowskim, wysyłamy teraz na Twoje konto.`,
      zaproszenie: {
        naglowek: "Zaproś drugiego rodzica do planu",
        naglowekPonownie: "Zaproś drugiego rodzica ponownie",
        opis: "Drugi rodzic zobaczy Wasz wspólny plan i swoje uprawnienia, a przypomnienia o jego terminach trafią na jego konto.",
        opisPonownie: "Po przyjęciu zaproszenia drugi rodzic znów zobaczy Wasz wspólny plan, a plan uwzględni dane z jego konta ZUS.",
        opisPrzyDanychZPelnomocnictwa: "Po dołączeniu drugi rodzic zobaczy Wasz wspólny plan, a plan uwzględni dane prosto z jego konta ZUS.",
        przycisk: "Zaproś drugiego rodzica",
      },
      pelnomocnictwo: {
        naglowek: "Pobierz dane z pełnomocnictwa PEL",
        naglowekPrzyDanych: "Pełnomocnictwo PEL",
        opis: "Drugi rodzic nie dołączy do planu? Jeśli udzielił Ci w eZUS pełnomocnictwa PEL do roli Ubezpieczony, Wasz plan uwzględni dane jego ubezpieczenia.",
        opisPoOdlaczeniu: "Jeśli drugi rodzic udzielił Ci w eZUS pełnomocnictwa PEL do roli Ubezpieczony, Wasz plan uwzględni dane jego ubezpieczenia.",
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
          `Dane konta ZUS ${imieINazwisko} zastąpiły Twoje odpowiedzi o drugim rodzicu. Plan rodziny uwzględnia już te dane.`,
        poOdlaczeniu: "Dane drugiego rodzica zostały w profilu jako Twoja odpowiedź. Sprawdź, czy są aktualne.",
        zPelnomocnictwa: ({ odpowiedzi }: { odpowiedzi: string }) =>
          `Twoje odpowiedzi o drugim rodzicu (${odpowiedzi}) zachowaliśmy. Przywrócimy je, gdy pełnomocnictwo wygaśnie albo zostanie odwołane.`,
        zPelnomocnictwaBezOdpowiedzi: "Twoje odpowiedzi o drugim rodzicu zachowaliśmy. Przywrócimy je, gdy pełnomocnictwo wygaśnie albo zostanie odwołane.",
        widokDrugiegoRodzica: ({ imieINazwisko, odpowiedz }: { imieINazwisko: string; odpowiedz: string }) =>
          `Dane z Twojego konta ZUS zastąpiły odpowiedź ${imieINazwisko} o drugim rodzicu (${odpowiedz}). Plan rodziny uwzględnia już te dane.`,
        widokDrugiegoRodzicaBezOdpowiedzi: "Dane z Twojego konta ZUS zastąpiły odpowiedź rodzica o drugim rodzicu. Plan rodziny uwzględnia już te dane.",
      },
      // koniec sekcjaDrugiegoRodzica
    },
    sekcjaSytuacji: {
      tytul: "Sytuacja szczególna",
      opis: "Jeśli wydarzyło się coś, co zmienia sytuację Twojej rodziny, zapisz to tutaj. Dopasujemy plan i wstrzymamy przypomnienia o sprawach, które przestaną Was dotyczyć.",
      zapisane: ({ liczba }: { liczba: number }) => `Zapisane sytuacje szczególne: ${liczba}.`,
      akcja: "Zgłoś sytuację szczególną",
      akcjaZapisane: "Zobacz zapisane sytuacje",
      // koniec sekcjaSytuacji
    },
    wstep: "Odpowiedz na kilka pytań, a ułożymy z nich plan Twojej rodziny. Pytamy tylko o to, czego nie ma na Twoim koncie ZUS.",
    notatkaStart: "Sprawdź odpowiedzi i zapisz profil. Dane oznaczone „Źródło: konto ZUS” pochodzą z Twojego konta ZUS, a pozostałe to Twoje odpowiedzi.",
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
      zmianaZatrudnienia: "Zmiana zatrudnienia w ciąży",
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
      platnikSkladek: "Twój płatnik składek wypłaca zasiłki, więc wypłaci też Twój zasiłek.",
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
    zmienione: ({ poprzednio }: { poprzednio: string }) => `Zmienione, poprzednio: ${poprzednio}`,
    rodzina: {
      tytul: "Profil rodziny",
      powrot: "Plan rodziny",
      notatka: "Z tych odpowiedzi ułożyliśmy plan Twojej rodziny. Zmień sekcję i zapisz profil, a plan uwzględni zmianę.",
      notatkaNiezapisanychZmian: "Masz niezapisane zmiany profilu. Zapisz profil, a plan rodziny je uwzględni.",
      notatkaNiezapisanegoTerminu: "Masz niezapisaną zmianę przewidywanego terminu porodu. Zapisz profil, a plan rodziny uwzględni nowy termin.",
      wrocDoPlanu: "Wróć do planu rodziny",
      anulujZmiany: "Anuluj zmiany",
      tytulKartyZmiany: "Zmiana profilu",
      notatkaPrzeliczenia: "Po zapisaniu plan rodziny uwzględni zmianę. Sprawy złożone i załatwione zachowają swój status.",
      notatkaDanychZus: "Dane z konta ZUS aktualizują się same przy każdym otwarciu przewodnika.",
      notatkaKalendarza: "Nowy termin porodu zmieni też terminy w kalendarzu.",
    },
    // Zakładki podsumowania profilu (podsumowanie/_czesci/zakladki-podsumowania.tsx)
    zakladki: {
      etykieta: "Sekcje profilu",
      zatrudnienie: "Zatrudnienie",
      daneCiazy: "Ciąża",
      zmianaZatrudnienia: "Zmiana zatrudnienia",
      daneRodziny: "Rodzina",
      drugiRodzic: "Drugi rodzic",
      dziecko: "Dziecko",
      przyjecie: "Przyjęcie",
      daneDrugiegoRodzica: "Twoje dane",
      sytuacja: "Sytuacja szczególna",
      pozostale: "Pozostałe dane",
      danePlanu: "Dane planu",
      // koniec zakladki
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
    kartaHospitalizacja: "Pobyt dziecka w szpitalu",
    kartaZdrowie: "Zdrowie dziecka",
    dziecko: "Dziecko",
    dataPorodu: "Data porodu",
    liczbaDzieci: "Liczba urodzonych dzieci",
    wstepPorod: "Od tych danych zależy, czy przysługuje Ci uzupełniający urlop macierzyński do 8 albo do 15 tygodni.",
    poleTygodnia: {
      etykieta: "Ukończone tygodnie ciąży w dniu porodu",
      podpowiedz: "Liczba od 22 do 44. Przy ciąży trwającej 27 tygodni i 3 dni wpisz 27.",
    },
    poleMasy: { etykieta: "Masa urodzeniowa w gramach", podpowiedz: "Liczba od 300 do 7000, np. 3350." },
    polePobytu: {
      legenda: "Czy dziecko przebywało w szpitalu po porodzie?",
      podpowiedz: "Pytamy, bo dziecko urodziło się przed ukończeniem 37. tygodnia ciąży albo z masą do 1000 g.",
      tak: "Tak",
      nie: "Nie",
    },
    poleDni: {
      etykieta: "Kolejne dni pobytu dziecka w szpitalu od 5. dnia po porodzie",
      podpowiedz: "Liczba od 0 do 52. Policz kolejne dni, z których pierwszy przypada od 5. do 28. dnia po porodzie, do upływu 8. tygodnia po porodzie. Jeśli dziecko jest jeszcze w szpitalu, liczbę dni zmienisz później w profilu rodziny.",
      podpowiedzZmiana: "Liczba od 0 do 52. Wpisz kolejne dni pobytu dziecka w szpitalu, z których pierwszy przypada od 5. do 28. dnia po porodzie.",
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
    opisWymiaru: "Po 9 tygodni z tego wymiaru przysługuje wyłącznie każdemu z rodziców. Po zapisaniu plan rodziny, kalkulator zasiłku i kreator wniosku o zasiłek macierzyński uwzględnią ten wymiar.",
    opisWymiaruPoOdznaczeniu: "Bez zaświadczenia „Za życiem” urlop rodzicielski ma zwykły wymiar. Po 9 tygodni z tego wymiaru przysługuje wyłącznie każdemu z rodziców. Po zapisaniu plan rodziny, kalkulator zasiłku i wniosek o zasiłek macierzyński uwzględnią ten wymiar.",
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
      `Na podstawie tego pełnomocnictwa pobierzemy dane ubezpieczenia ${imieINazwisko} z jego konta ZUS do profilu rodziny, a plan rodziny je uwzględni.`,
    opisBleduOdczytu: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Danych ${imieINazwisko} nie zapisaliśmy. Twoje odpowiedzi o drugim rodzicu i plan rodziny są bez zmian.`,
    opisPrzyszlej: ({ imieINazwisko, data }: { imieINazwisko: string; data: string }) =>
      `Do tego dnia plan rodziny opiera się na Twoich odpowiedziach o drugim rodzicu. Od ${data} plan sam uwzględni dane ${imieINazwisko}, gdy otworzysz przewodnik. Nie musisz nic robić.`,
    odczytajDane: "Pobierz dane",
    odczytajPonownie: "Pobierz dane ponownie",
    wrocDoProfilu: "Wróć do profilu rodziny",
    daneKtoreOdczytamy: "Dane, które pobierzemy",
    zakresDanych: [
      "Tytuły i okresy ubezpieczenia",
      "Ubezpieczenie chorobowe",
      "Podstawy składek",
      "Informację, czy płatnik składek wypłaca zasiłki",
    ],
    notatkaEzla: "Innych danych z konta drugiego rodzica, np. zaświadczeń lekarskich e-ZLA, nie pobieramy.",
    notatkaOdswiezania: "Dane drugiego rodzica zaktualizują się same przy każdym otwarciu przewodnika. Gdy pełnomocnictwo wygaśnie albo zostanie odwołane, usuniemy te dane i przywrócimy Twoje odpowiedzi o drugim rodzicu.",
    instrukcja: {
      tytul: "Jak udzielić pełnomocnictwa PEL w eZUS",
      wstepBrak: "Pokaż tę instrukcję drugiemu rodzicowi. Pełnomocnictwo składa on na swoim koncie w eZUS.",
      wstepOgraniczone: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Pełnomocnictwo ograniczone do korespondencji nie daje dostępu do danych ubezpieczenia. ${imieINazwisko} zmieni zakres, składając ponownie wniosek PEL. Pokaż mu tę instrukcję.`,
      wstepNowe: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `${imieINazwisko} udzieli nowego pełnomocnictwa, składając ponownie wniosek PEL. Pokaż mu tę instrukcję.`,
      krok1: { przed: "Zaloguj się do eZUS na swoje konto i wybierz wniosek ", wyroznienie: "PEL", po: ", czyli pełnomocnictwo." },
      krok2: {
        przed: "Jako pełnomocnika wpisz: imię ",
        nazwisko: ", nazwisko ",
        pesel: ", numer PESEL ",
        adres: " i adres ",
        adresBezDanych: " i adres pełnomocnika",
        po: ".",
      },
      krok3: { przed: "Zaznacz zakres ", wyroznienie: "załatwianie spraw za pośrednictwem portalu eZUS", po: "." },
      krok4: { przed: "Zaznacz rolę ", rola: "Ubezpieczony", zakres: " bez ograniczenia do korespondencji", po: "." },
      krok5: "Podpisz i wyślij wniosek.",
      poWyslaniuBrak: "Gdy drugi rodzic wyśle wniosek, sprawdź pełnomocnictwo ponownie.",
      poWyslaniu: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Gdy ${imieINazwisko} wyśle nowy wniosek, sprawdź pełnomocnictwo ponownie.`,
      sprawdzPonownie: "Sprawdź ponownie",
      przejdzDoEzus: "Przejdź do eZUS",
    },
    notatkaBrak: "Do czasu udzielenia pełnomocnictwa plan rodziny opiera się na Twoich odpowiedziach o drugim rodzicu.",
    notatkaOgraniczone: "Plan rodziny opiera się na Twoich odpowiedziach o drugim rodzicu.",
    notatkaWygaslo: "Dane z wygasłego pełnomocnictwa usunęliśmy. Plan rodziny opiera się na Twoich odpowiedziach o drugim rodzicu.",
    notatkaOdwolane: "Dane z odwołanego pełnomocnictwa usunęliśmy. Plan rodziny opiera się na Twoich odpowiedziach o drugim rodzicu.",
    sprawdzono: "Sprawdziliśmy pełnomocnictwo ponownie.",
    bezAkcji: {
      dolaczyl: "Drugi rodzic dołączył do Waszego planu, więc plan uwzględnia dane z jego konta ZUS.",
      brakDrugiegoRodzica: "W profilu rodziny nie ma drugiego rodzica.",
    },
    // koniec ViewSecondParentPowerOfAttorney
  },
  ViewBirthPackage: {
    tytulStrony: "Pakiet narodzin",
    naglowek: "Pakiet narodzin",
    // Sloty narodziny/pakiet/_sloty (u28)
    akcjaWnioskuOUrlop: {
      przygotuj: "Przygotuj wniosek o urlop",
      dokoncz: "Dokończ wniosek o urlop",
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
      przed: "Bez Twojej zgody na dane dotyczące zdrowia nie pytamy o tydzień ciąży, masę urodzeniową ani pobyt dziecka w szpitalu. Dlatego nie sprawdzimy, czy przysługuje Ci uzupełniający urlop macierzyński. Zgodę zmienisz w ",
      link: "ustawieniach",
      po: ".",
    },
    kartaSpraw: ({ liczba }: { liczba: string }) => `Sprawy na pierwsze 3 miesiące (${liczba})`,
    wstepSpraw: ({ data }: { data: string }) => `Zacznij od najbliższego terminu. Pokazujemy sprawy z terminem do ${data}.`,
    k05Zalatwiona: "Zgłoszenie dziecka do ubezpieczenia zdrowotnego jest załatwione, bo dziecko jest już w Twoich danych w ZUS.",
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
        "umowa-zlecenia": "Przekaż dane dziecka zleceniodawcy, a on zgłosi dziecko do ubezpieczenia zdrowotnego.",
        "umowa-o-prace": "Przekaż dane dziecka pracodawcy, a on zgłosi dziecko do ubezpieczenia zdrowotnego.",
      },
      K06: "Urodzenie dziecka zgłosisz w urzędzie stanu cywilnego albo w mObywatelu. Potem dziecko dostanie akt urodzenia i numer PESEL.",
      K07: "Pracujesz na umowie o pracę, więc wniosek o oba urlopy składasz u pracodawcy. Pokażemy Ci, co w nim wpisać.",
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
    brakDaty: "Potwierdź datę porodu, a zobaczysz pakiet narodzin.",
    zglosNarodziny: "Zgłoś narodziny",
    // koniec ViewBirthPackage
  },
  ViewSpecialSituation: {
    tytulStrony: "Zmiana w ciąży albo po porodzie",
    naglowek: "Zmiana w ciąży albo po porodzie",
    wstep: "Zapisz, co się wydarzyło, na przykład przedwczesny poród, ciężką chorobę dziecka, pobyt matki w szpitalu albo stratę dziecka. Dopasujemy plan rodziny i wstrzymamy przypomnienia o sprawach, które przestaną Was dotyczyć. W przewodniku nazywamy to sytuacją szczególną.",
    powrot: "Plan rodziny",
    kartaRodzaju: "Co się wydarzyło",
    legendaRodzaju: "Rodzaj sytuacji",
    dotyczyDziecka: "Dotyczy dziecka",
    dotyczyMatki: "Dotyczy matki",
    // Etykiety rodzajów sytuacji szczególnych (do przeniesienia do teksty.wspolne.etykiety)
    rodzaje: {
      "martwe-urodzenie": "Urodzenie martwego dziecka",
      "poronienie-bez-zaswiadczenia": "Poronienie",
      poronienie: "Poronienie potwierdzone zaświadczeniem o martwym urodzeniu",
      "zgon-dziecka": "Zgon dziecka",
      "przedwczesny-porod": "Przedwczesny poród",
      "choroba-dziecka": "Ciężka choroba dziecka",
      szpital: "Pobyt matki w szpitalu",
      orzeczenie: "Orzeczenie o niezdolności matki do samodzielnej egzystencji",
      porzucenie: "Porzucenie dziecka przez matkę",
      "smierc-matki": "Śmierć matki",
    },
    potwierdzDatePorodu: "Potwierdź datę porodu",
    kartaDaty: "Kiedy",
    etykietaDaty: "Data zdarzenia",
    podpowiedziDaty: {
      "martwe-urodzenie": "Dzień porodu, w formacie DD.MM.RRRR.",
      "poronienie-bez-zaswiadczenia": "Dzień poronienia, w formacie DD.MM.RRRR.",
      poronienie: "Dzień poronienia, w formacie DD.MM.RRRR.",
      "zgon-dziecka": "Dzień zgonu dziecka, w formacie DD.MM.RRRR.",
      "przedwczesny-porod": "Dzień porodu z profilu rodziny. Tę datę wpisujemy za Ciebie.",
      "choroba-dziecka": "Dzień rozpoznania choroby, w formacie DD.MM.RRRR.",
      szpital: "Dzień przyjęcia matki do szpitala, w formacie DD.MM.RRRR.",
      orzeczenie: "Dzień wydania orzeczenia, w formacie DD.MM.RRRR.",
      porzucenie: "Dzień porzucenia dziecka, w formacie DD.MM.RRRR.",
      "smierc-matki": "Dzień śmierci matki, w formacie DD.MM.RRRR.",
    },
    podpowiedzDatyBezRodzaju: "Dzień zdarzenia, w formacie DD.MM.RRRR.",
    dopisekDatyPorodu: "Tę datę zapiszemy w profilu rodziny jako datę porodu.",
    etykietaLiczby: "Liczba dzieci, których dotyczy sytuacja",
    podpowiedzLiczby: ({ liczba }: { liczba: number }) =>
      liczba === 2
        ? "W profilu rodziny są bliźnięta. Wybierz 1 albo 2."
        : `Liczba dzieci z ciąży w profilu rodziny: ${liczba}. Wybierz liczbę od 1 do ${liczba}.`,
    pustaOpcjaLiczby: "Wybierz",
    jednoDziecko: "Sytuacja dotyczy 1 dziecka, bo tyle dzieci jest w profilu rodziny.",
    kartaProfilu: "Dane z profilu rodziny",
    dataPorodu: "Data porodu",
    dataPotwierdzona: ({ data }: { data: string }) => `${data}, potwierdzona`,
    dataNiepotwierdzona: ({ termin }: { termin: string }) => `Niepotwierdzona, przewidywany termin ${termin}`,
    dataBrak: "Niepotwierdzona",
    liczbaDzieciZCiazy: "Liczba dzieci z ciąży",
    wartoscLiczbyDzieci: ({ liczba }: { liczba: number }) => (liczba === 2 ? "2, bliźnięta" : String(liczba)),
    drugiRodzic: "Drugi rodzic",
    brakDrugiegoRodzica: "Brak w profilu rodziny",
    kartaZmian: "Co się zmieni",
    zmiany: [
      "Plan pokaże sprawy, które teraz dotyczą Twojej rodziny.",
      "Nie będziemy przypominać o sprawach, które przestały Was dotyczyć.",
      "Zmiana obejmuje Ciebie i drugiego rodzica.",
      "Sprawy złożone i załatwione zostaną w planie.",
    ],
    kartaZapisanych: "Zapisane sytuacje",
    podpisTabeli: "Zapisane sytuacje szczególne",
    przewijanieTabeli: "Tabela zapisanych sytuacji szczególnych",
    kolumny: { rodzaj: "Rodzaj sytuacji", data: "Data zdarzenia", liczba: "Liczba dzieci", zrodlo: "Źródło", akcje: "Zaświadczenie" },
    dopiszZaswiadczenie: "Dopisz zaświadczenie o martwym urodzeniu",
    zapiszKolejna: "Zapisz kolejną sytuację",
    kartaTrybu: "Spokojny tryb",
    trybWlaczony: "Włączony dla całej rodziny",
    opisTrybuWlaczonego:
      "Nie przypominamy o sprawach, które przestały Was dotyczyć. Jeśli chcesz znowu dostawać przypomnienia o wszystkich sprawach z planu, wyłącz spokojny tryb. Zapisane sytuacje i plan zostaną bez zmian.",
    wylaczTryb: "Wyłącz spokojny tryb",
    trybWylaczony: "Wyłączony dla całej rodziny",
    opisTrybuWylaczonego:
      "Przypominamy o sprawach z planu, które mają status do zrobienia, zgodnie z ustawieniami przypomnień. Zapisane sytuacje i plan zostały bez zmian.",
    ustawieniaPrzypomnien: "Ustawienia przypomnień",
    wrocDoPlanu: "Wróć do planu rodziny",
    // koniec ViewSpecialSituation
  },
  ViewFamilyPlan: {
    tytulStrony: "Plan rodziny",
    naglowek: "Plan rodziny",
    // Slot plan-rodziny/_sloty/informacja-symulacji-profilu (u01)
    profilZSymulacji: ({ data }: { data: string }) =>
      `Stworzyliśmy profil rodziny z danymi przykładowymi. Przewidywany termin porodu: ${data}.`,
    // Sloty plan-rodziny/_sloty: akcje (u19, u25), nad planem (u19), przy sprawie (u13, u14, u22, u25)
    akcjaZglosNarodziny: {
      tytul: "Dziecko już się urodziło?",
      opis: "Podaj datę porodu i dane dziecka. Przeliczymy plan i terminy od daty porodu i pokażemy, co załatwić w pierwszych tygodniach.",
      zglos: "Zgłoś narodziny",
      // koniec akcjaZglosNarodziny
    },
    // Akcja w nagłówku pulpitu obok „Zgłoś narodziny” (plan-rodziny/_czesci/zaproszenie-drugiego-rodzica)
    dodajDrugiegoRodzica: "Dodaj drugiego rodzica",
    akcjaSytuacjaSzczegolna: {
      tytul: "Coś zmieniło się w ciąży albo po porodzie?",
      opis: "Zapisz to w przewodniku, na przykład gdy dziecko urodziło się przedwcześnie albo jest ciężko chore, matka dziecka jest w szpitalu albo rodzina straciła dziecko. Dopasujemy plan do Waszej sytuacji i wstrzymamy przypomnienia o sprawach, które przestaną Was dotyczyć.",
      dopowiedzenie: "W przewodniku nazywamy to sytuacją szczególną.",
      akcja: "Zapisz, co się wydarzyło",
      tytulTrybu: "Spokojny tryb",
      wlaczonyOd: ({ data, osoba }: { data: string; osoba: string }) => `Włączony od ${data} dla Ciebie i ${osoba}.`,
      wlaczonyOdDlaRodziny: ({ data }: { data: string }) => `Włączony od ${data} dla całej rodziny.`,
      opisBezPrzypomnien: "Nie przypominamy o sprawach oznaczonych „Bez przypomnień”. Wrócisz do nich, kiedy zechcesz.",
      opisZPrzypomnieniami: "Sprawy dziecka zostają w planie. Przypominamy o nich zgodnie z ustawieniami przypomnień.",
      akcjaTrybu: "Zobacz zapisane sytuacje",
      // koniec akcjaSytuacjaSzczegolna
    },
    oknoNowegoDziecka: {
      tytulKarty: "Dziecko już się urodziło?",
      zobaczDziecko: "Zobacz dziecko z danych ZUS",
      opis: ({ data }: { data: string }) =>
        `Podaj datę porodu. Przeliczymy plan i terminy od prawdziwej daty zamiast od przewidywanego terminu porodu ${data}.`,
      opisBezTerminu: "Podaj datę porodu. Przeliczymy plan i terminy od prawdziwej daty porodu.",
      opisPierwszeTygodnie: "Po porodzie najwięcej terminów mija w pierwszych tygodniach. Pokażemy Ci, od czego zacząć.",
      zglos: "Zgłoś narodziny",
      // koniec oknoNowegoDziecka
    },
    terminSprawy: {
      brakTerminu: "-",
      dniDoTerminu: ({ liczba }: { liczba: string }) => (liczba === "1" ? "1 dzień do terminu" : `${liczba} dni do terminu`),
      dzisTermin: "Termin mija dzisiaj",
      poTerminie: "Po terminie",
      minal: ({ liczba }: { liczba: string }) => {
        const n = Number(liczba);
        if (n === 1) return "Minął 1 dzień temu";
        const kilka = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
        return kilka ? `Minęły ${liczba} dni temu` : `Minęło ${liczba} dni temu`;
      },
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
      odmowa: "Odmowa",
      zrodloZus: "Dane z konta ZUS",
      zrodloRodzica: "Oznaczone przez Ciebie",
      wniosekZKanalem: ({ data, kanal, status }: { data: string; kanal: string; status: string }) =>
        `Wniosek z ${data} przez ${kanal}: ${status}`,
      planowyTermin: ({ data }: { data: string }) => `Planowy termin załatwienia: ${data}`,
      przyznane: ({ data }: { data: string }) => `Świadczenie przyznane na wniosek z ${data}`,
      najblizszaWyplata: ({ kwota, data }: { kwota: string; data: string }) => `Najbliższa wypłata: ${kwota}, ${data}`,
      ostatniaWyplata: ({ kwota, data }: { kwota: string; data: string }) => `Ostatnia wypłata: ${kwota}, ${data}`,
      odmowaOpis: ({ data }: { data: string }) => `ZUS odmówił przyznania świadczenia na wniosek z ${data}`,
      zobaczOdpowiedz: "Zobacz odpowiedź ZUS w eZUS",
      brakWniosku: "Na Twoim koncie ZUS nie ma jeszcze wniosku",
      nowaSprawa: "Nowa sprawa, bo 800+ jest już przyznane",
      // koniec statusWnioskuZus
    },
    ostrzezeniaSprawy: {
      zobaczSzczegoly: "Zobacz szczegóły ryzyka",
      // koniec ostrzezeniaSprawy
    },
    akcjaPrzejeciaUrlopu: {
      tytul: "Przejęcie urlopu macierzyńskiego",
      sytuacjaMatki: {
        szpital: ({ matka, data }: { matka: string; data: string }) => `${matka} jest w szpitalu od ${data}.`,
        orzeczenie: ({ matka, data }: { matka: string; data: string }) =>
          `${matka} ma od ${data} orzeczenie o niezdolności do samodzielnej egzystencji.`,
        porzucenie: ({ data }: { matka: string; data: string }) =>
          `Matka porzuciła dziecko ${data}.`,
        "smierc-matki": ({ data }: { matka: string; data: string }) =>
          `Matka dziecka zmarła ${data}.`,
      },
      sytuacjaWlasna: {
        szpital: ({ data }: { data: string }) => `Jesteś w szpitalu od ${data}.`,
        orzeczenie: ({ data }: { data: string }) => `Masz od ${data} orzeczenie o niezdolności do samodzielnej egzystencji.`,
      },
      matkaDomyslnie: "Matka dziecka",
      opisDlaDrugiegoRodzica:
        "Możesz przejąć część jej urlopu macierzyńskiego, żeby opiekować się dzieckiem. Sprawdzimy, od kiedy i na jakich zasadach.",
      opisDlaMatki:
        "Drugi rodzic może przejąć część Twojego urlopu macierzyńskiego, żeby opiekować się dzieckiem. Sprawdzimy, od kiedy i na jakich zasadach.",
      akcja: "Przejmij urlop macierzyński",
      bezPrzypomnien: "Bez przypomnień",
      okresK34: ({ od, doDnia }: { od: string; doDnia: string }) => `Okres zasiłku: ${od} – ${doDnia}.`,
      kanalPracodawca: "Załatwiasz u pracodawcy.",
      kanalZus: "Składasz do ZUS wniosek ZAM w eZUS.",
      zachowanaZlozona: "Wniosek jest złożony, więc sprawa zostaje w planie.",
      zachowanaZalatwiona: "Sprawa jest załatwiona, więc zostaje w planie.",
      organizacjeOpis: "Organizacje, które bezpłatnie wspierają rodziców.",
      organizacjeAkcja: "Zobacz organizacje",
      wymiarMacierzynskiego: ({ tygodnie }: { tygodnie: number }) => {
        const koncowka = tygodnie % 10 >= 2 && tygodnie % 10 <= 4 && (tygodnie % 100 < 12 || tygodnie % 100 > 14);
        return `Wymiar urlopu macierzyńskiego: ${tygodnie} ${tygodnie === 1 ? "tydzień" : koncowka ? "tygodnie" : "tygodni"}.`;
      },
      // koniec akcjaPrzejeciaUrlopu
    },
    // Widok planu (u12)
    otworzProfil: "Otwórz profil rodziny",
    brakPlanu: "Plan rodziny pojawi się po zapisaniu profilu na start.",
    zmienDecyzjeOZgodzie: "Zmień decyzję o zgodzie",
    sciezka: {
      tytul: "Twoja ścieżka",
      wstep: "W planie są tylko sprawy Twojej rodziny, podzielone na etapy. Przy każdej sprawie widać, kogo dotyczy. Wybierz etap, żeby zobaczyć jego sprawy.",
      wPlanie: "Sprawy w planie",
      doZrobienia: "Do zrobienia",
      zlozone: "Złożone",
      zalatwione: "Załatwione",
      etapyPlanu: "Etapy planu",
      licznikSpraw: ({ liczba }: { liczba: string }) => `Sprawy: ${liczba}`,
      licznikDoZrobienia: ({ liczba }: { liczba: string }) => `do zrobienia: ${liczba}`,
      licznikZlozonych: ({ liczba }: { liczba: string }) => `złożone: ${liczba}`,
      licznikZalatwionych: ({ liczba }: { liczba: string }) => `załatwione: ${liczba}`,
      ostrzezeniaStraznika: ({ liczba }: { liczba: string }) =>
        `Ostrzeżenia strażnika ubezpieczenia chorobowego: ${liczba}`,
    },
    biezacyEtap: "Bieżący etap",
    etapZakonczony: "Etap zakończony",
    etapZOtwartymiSprawami: "Zostały sprawy do zrobienia",
    etapy: {
      ciaza: "Ciąża",
      "pierwsze-tygodnie": "Pierwsze tygodnie po porodzie",
      "urlopy-i-zasilek": "Urlopy i zasiłek macierzyński",
      "pieniadze-na-dziecko": "Świadczenia na dziecko",
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
    dataPorodu: ({ data }: { data: string }) => `Data porodu: ${data}.`,
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
      K28: "Sprawdzimy, od kiedy podlegasz ubezpieczeniu chorobowemu.",
      K29: "Sprawdzimy, czy w dniu porodu będziesz mieć ubezpieczenie chorobowe.",
      K30: "Ochrona umowy o pracę w ciąży i w czasie urlopów.",
      K31: "Wniosek złożysz u swojego pracodawcy.",
      K32: "Wniosek złożysz w ZUS po przyjęciu dziecka na wychowanie.",
      K33: "Zasiłek macierzyński w rodzinie zastępczej zawodowej.",
      K34: "Zasiłek macierzyński po stracie dziecka.",
      K35: "Organizacje, które pomagają rodzicom w trudnej sytuacji.",
      K36: "Odpis skrócony dołączysz do wniosków składanych u pracodawcy albo płatnika składek, a do wniosku o zasiłek wypłacany przez ZUS akt urodzenia pobierze ZUS.",
      K37: "Rodzic na umowie o pracę może łączyć urlop rodzicielski z pracą.",
    } as Readonly<Record<string, string>>,
    wizytaOdbyta: ({ data, koniec }: { data: string; koniec: string }) =>
      `Wizyta odbyła się ${data}, przed końcem 10. tygodnia ciąży (${koniec}).`,
    informacjaK19:
      "Dobrowolne ubezpieczenie chorobowe ustaje od pierwszego dnia prawa do zasiłku macierzyńskiego. Nie musisz się z niego wyrejestrowywać. Składkę zdrowotną płacisz dalej, chyba że zasiłek nie przekracza kwoty świadczenia rodzicielskiego.",
    oplacenie: {
      tytul: ({ miesiac }: { miesiac: string }) => `Opłacenie składek za ${miesiac}`,
      termin: ({ termin }: { termin: string }) => `Składki opłać do ${termin}. Sprawa dotyczy matki.`,
      zrodloZus: ({ data }: { data: string }) => `Źródło: konto ZUS, stan rozliczeń składek z ${data} bez zadłużenia.`,
      zrodloRodzica: ({ data }: { data: string }) => `Źródło: Twoja odpowiedź z ${data}.`,
      nastepna: ({ miesiac, utworzenie, termin }: { miesiac: string; utworzenie: string; termin: string }) =>
        `Sprawę Opłacenie składek za ${miesiac} dodamy do planu ${utworzenie}, z terminem ${termin}.`,
    },
    straznik: {
      tytul: "Strażnik ubezpieczenia chorobowego",
      liczbaOstrzezen: ({ liczba }: { liczba: string }) => `Ostrzeżenia: ${liczba}`,
      wstepJdg: "Do porodu pilnujemy Twojego dobrowolnego ubezpieczenia chorobowego. Bez niego nie dostaniesz zasiłku macierzyńskiego.",
      wstepUz: "Do porodu pilnujemy Twojego dobrowolnego ubezpieczenia chorobowego z umowy zlecenia. Bez niego nie dostaniesz zasiłku macierzyńskiego.",
      wstepUop: "Do porodu sprawdzamy podstawę wymiaru Twoich składek z umowy o pracę, od której zależy wysokość zasiłku macierzyńskiego.",
      progDo: ({ kwota, data }: { kwota: string; data: string }) => `${kwota} do ${data}`,
      progOd: ({ kwota, data }: { kwota: string; data: string }) => `${kwota} od ${data}`,
      progiLacznik: " i ",
      wstepDrugiRodzic: ({ osoba }: { osoba: string }) =>
        `Do porodu pilnujemy dobrowolnego ubezpieczenia chorobowego ${osoba}. Bez niego nie dostanie zasiłku macierzyńskiego.`,
      matkiDomyslnie: "matki",
      stanNa: ({ data }: { data: string }) => `Stan na ${data} według danych z konta ZUS`,
      brakDanychZus: "Nie mamy jeszcze danych z konta ZUS. Sprawdzimy ubezpieczenie, gdy je otrzymamy.",
      duch: "Dobrowolne ubezpieczenie chorobowe",
      aktywne: "Aktywne",
      nieaktywne: "Brak",
      aktywneStanNa: ({ data }: { data: string }) => `Aktywne, stan na ${data}`,
      tytulUbezpieczenia: "Tytuł ubezpieczenia",
      tytulJdg: "Prowadzenie pozarolniczej działalności",
      tytulUz: "Umowa zlecenia",
      zadluzenie: "Zadłużenie z tytułu składek",
      prog: "Próg zadłużenia",
      brakWartosci: "-",
      opiekaSkladek: ({ prog }: { prog: string }) =>
        `Opłacaj składki do 20. dnia każdego miesiąca, a gdy ten dzień przypada w sobotę albo w dniu ustawowo wolnym od pracy, do najbliższego dnia roboczego. Jeśli w dniu powstania prawa do zasiłku zadłużenie z tytułu składek przekroczy próg obowiązujący w tym dniu, czyli ${prog}, tracisz prawo do zasiłku do czasu spłaty całego zadłużenia.`,
      brakDuchJdg: ({ data }: { data: string }) =>
        `Według danych z konta ZUS z ${data} nie masz już dobrowolnego ubezpieczenia chorobowego z działalności gospodarczej. Bez tego ubezpieczenia nie dostaniesz zasiłku macierzyńskiego.`,
      brakDuchUz: ({ data }: { data: string }) =>
        `Według danych z konta ZUS z ${data} nie masz już dobrowolnego ubezpieczenia chorobowego z umowy zlecenia. Bez tego ubezpieczenia nie dostaniesz zasiłku macierzyńskiego.`,
      daneZus: "Dane z konta ZUS",
      profil: "Twój profil rodziny",
      brakDuchZusJdg: "Brak dobrowolnego ubezpieczenia chorobowego",
      brakDuchZusUz: "Umowa zlecenia bez dobrowolnego ubezpieczenia chorobowego",
      profilDuchTak: "Dobrowolne ubezpieczenie chorobowe: tak",
      podwyzszenie: ({ procent }: { procent: string }) =>
        `ZUS może zakwestionować gwałtowne podwyższenie podstawy wymiaru składek tuż przed porodem. Twoja ostatnia podstawa jest o ${procent} wyższa niż średnia z poprzednich 11 miesięcy. Gdy ZUS po przeprowadzeniu postępowania uzna, że podwyższenie służyło wyłącznie uzyskaniu wyższych zasiłków, może wydać decyzję ustalającą niższą podstawę wymiaru, a od niej policzy zasiłki.`,
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
        `Stan rozliczeń składek z ${data} pokazuje zadłużenie ${kwota}. Jeśli w dniu powstania prawa do zasiłku zadłużenie przekroczy ${prog}, tracisz prawo do zasiłku do czasu spłaty całego zadłużenia.`,
      potwierdz: "Potwierdź opłacenie składek",
      sprawdzStan: "Sprawdź stan rozliczeń składek",
      zapytajAsystenta: "Zapytaj asystenta, co zrobić",
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
    sytuacjeSzczegolne: {
      tytul: "Sytuacje szczególne",
      opis: "Jeśli w ciąży albo po porodzie wydarzyło się coś trudnego, na przykład przedwczesny poród albo strata dziecka, dopasujemy plan i wstrzymamy zbędne przypomnienia.",
      przejdz: "Przejdź do sytuacji szczególnych",
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
      zZrodlem: ({ wartosc, zrodlo }: { wartosc: string; zrodlo: string }) => `${wartosc} (${zrodlo})`,
      zrodla: {
        "konto-zus": "dane z konta ZUS",
        "pelnomocnictwo-pel": "dane z pełnomocnictwa PEL",
        "odpowiedz-rodzica": "Twoja odpowiedź",
      },
      osobaZForma: ({ osoba, forma }: { osoba: string; forma: string }) => `${osoba}, ${forma}`,
      stanyCywilne: { malzenstwo: "Małżeństwo", "nie-malzenstwo": "Rodzice nie są małżeństwem" },
      przelicz: "Gdy zmienisz dane w profilu, przeliczymy plan. Sprawy złożone i załatwione zachowają status.",
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
      podpis: "Ostatnie zmiany w planie",
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
      statusZ: ({ poprzedni }: { poprzedni: string }) => `Zmieniony status, wcześniej: ${poprzedni}`,
      statusZNa: ({ poprzedni, obecny }: { poprzedni: string; obecny: string }) =>
        `Zmieniony status z „${poprzedni}” na „${obecny}”`,
      statusZachowany: "Sprawa zostaje w planie z dotychczasowym statusem, bo jest już złożona albo załatwiona",
      usunietaZeStatusem: ({ poprzedni }: { poprzedni: string }) => `Usunięta z planu, status przed usunięciem: ${poprzedni}`,
      kwotaZ: ({ poprzednia }: { poprzednia: string }) => `Zmieniona kwota, wcześniej: ${poprzednia}`,
      kwotaZNa: ({ poprzednia, obecna }: { poprzednia: string; obecna: string }) =>
        `Zmieniona kwota z ${poprzednia} na ${obecna}`,
      terminOdDatyPorodu: "Termin liczymy teraz od potwierdzonej daty porodu",
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
    brakDokumentowMatki: "Matka nie przygotowuje dokumentów, bo nie podlega ubezpieczeniu chorobowemu.",
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
      nieDlaPracownicy: "Nie przysługuje: zasiłek przysługuje wyłącznie pracownicy",
      macierzynskiPoUstaniu: "Nie przysługuje: po porodzie przysługuje zasiłek macierzyński",
      bezWyliczenia: "Reguła bez wyliczenia",
      nie: {
        "brak-ubezpieczenia": "Nie przysługuje: brak ubezpieczenia chorobowego",
        ustanie: "Nie przysługuje: ustanie ubezpieczenia",
        "okres-wyczekiwania": "Nie przysługuje: okres wyczekiwania",
        "wyczerpany-okres-zasilkowy": "Nie przysługuje: wyczerpany okres zasiłkowy",
        zadluzenie: "Nie przysługuje: zadłużenie z tytułu składek",
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
      podstawyZKodemB: ({ zKodemB, bezKoduB }: { zKodemB: string; bezKoduB: string }) =>
        `${zKodemB}% podstawy wymiaru z kodem B, ${bezKoduB}% bez kodu B`,
      wynagrodzeniaZKodemB: ({ zKodemB, bezKoduB }: { zKodemB: string; bezKoduB: string }) =>
        `${zKodemB}% wynagrodzenia, gdy zaświadczenie e-ZLA ma kod B oznaczający ciążę, i ${bezKoduB}% wynagrodzenia bez kodu B`,
    },
    opisWynagrodzenia: ({ limit, nastepny, wyplaca, stawka }: { limit: string; nastepny: string; wyplaca: string; stawka: string }) =>
      `Za pierwsze ${limit} dni niezdolności do pracy w roku kalendarzowym pracodawca wypłaca Ci wynagrodzenie chorobowe w wysokości ${stawka}. Od ${nastepny}. dnia zasiłek chorobowy wypłaca ${wyplaca}.`,
    odPierwszegoDnia: ({ wyplaca }: { wyplaca: string }) =>
      `Zasiłek chorobowy przysługuje Ci od pierwszego dnia niezdolności do pracy i wypłaca go ${wyplaca}. Wynagrodzenie chorobowe od pracodawcy przysługuje wyłącznie pracownicy na umowie o pracę.`,
    odPierwszegoDniaMatki: ({ wyplaca }: { wyplaca: string }) =>
      `Zasiłek chorobowy przysługuje matce od pierwszego dnia niezdolności do pracy i wypłaca go ${wyplaca}. Wynagrodzenie chorobowe od pracodawcy przysługuje wyłącznie pracownicy na umowie o pracę.`,
    stawkaZasilku:
      "Zasiłek chorobowy wynosi 100% podstawy wymiaru, gdy zaświadczenie lekarskie e-ZLA ma kod B oznaczający niezdolność do pracy w ciąży, a bez kodu B 80% podstawy wymiaru.",
    wyjatkiWyczekiwania: {
      naglowek: "Zasiłek wcześniej niż po okresie wyczekiwania",
      absolwent:
        "Zasiłek przysługuje od pierwszego dnia ubezpieczenia chorobowego, gdy objęto Cię ubezpieczeniem chorobowym albo przystąpiłaś do niego w ciągu 90 dni od ukończenia szkoły, uzyskania dyplomu ukończenia studiów albo zakończenia kształcenia w szkole doktorskiej.",
      przerwa:
        "Do okresu wyczekiwania wliczają się poprzednie okresy ubezpieczenia chorobowego, gdy przerwa między nimi trwała najwyżej 30 dni albo wynikała z urlopu wychowawczego, urlopu bezpłatnego albo czynnej służby wojskowej żołnierza niezawodowego.",
      zapytaj: "Gdy jeden z tych wyjątków Cię dotyczy, zapytaj ZUS o prawo do zasiłku.",
      zadajPytanie: "Zadaj pytanie do ZUS",
    },
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
    koniecUmowyZKonta: {
      naglowek: ({ data }: { data: string }) => `Według danych z konta ZUS umowa o pracę kończy się ${data}`,
      opis: "Umowa na czas określony albo na okres próbny dłuższy niż miesiąc, która skończyłaby się po upływie trzeciego miesiąca ciąży, trwa do dnia porodu, z wyjątkiem umowy na zastępstwo. Zgłoś koniec umowy w profilu rodziny i wybierz rodzaj umowy w sprawie szczególnej ochrony, a ustalimy, czy umowa trwa do porodu i jakie świadczenia Ci przysługują.",
      zglos: "Zgłoś koniec umowy",
    },
    koniecZasilku: {
      doKoncaNiezdolnosci: ({ data }: { data: string }) =>
        `Zasiłek chorobowy przysługuje do ${data}, ostatniego dnia niezdolności do pracy z zaświadczenia e-ZLA.`,
      porodWNiezdolnosci:
        "Gdy urodzisz dziecko w okresie niezdolności do pracy, zasiłek chorobowy przysługuje do dnia przed porodem. Od dnia porodu przysługuje Ci zasiłek macierzyński, także za dni objęte zaświadczeniem e-ZLA. Za jeden dzień dostaniesz tylko jeden z tych zasiłków.",
      macierzynskiOdPorodu: ({ od, koniec }: { od: string; koniec: string }) =>
        `Od dnia porodu ${od} do ${koniec}, ostatniego dnia niezdolności do pracy z zaświadczenia e-ZLA, przysługuje Ci zasiłek macierzyński zamiast zasiłku chorobowego.`,
      wyczekiwanie: ({ od, koniec }: { od: string; koniec: string }) =>
        `Za dni od ${od} do ${koniec} zasiłek chorobowy nie przysługuje, ponieważ trwał okres wyczekiwania.`,
    },
    stawkaRehabilitacyjnegoDo: ({ data }: { data: string }) =>
      `Stawka 100% podstawy wymiaru obowiązuje do ${data}, dnia poprzedzającego dzień porodu.`,
    okresZasilkowy: {
      poDzis: ({ liczba, data }: { liczba: string; data: string }) =>
        `Wykorzystana część obejmuje ${liczba} dni po ${data}, na które lekarz już wystawił zaświadczenie e-ZLA.`,
      opis: ({ limit }: { limit: string }) =>
        `Gdy niezdolność do pracy przypada w ciąży, zasiłek chorobowy przysługuje najdłużej przez ${limit} dni. Do okresu zasiłkowego wliczają się zaświadczenia lekarskie e-ZLA o Twojej niezdolności do pracy, a zaświadczenia na opiekę się nie wliczają.`,
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
      bezZmian: "Według profilu rodziny zatrudnienie nie zmieniło się w ciąży.",
      jesliUstanie: "Jeśli umowa ustanie z jednej z tych przyczyn, przygotujesz:",
      nieDotyczyDokumentow: "Dokumentów nie przygotowujesz, bo zasiłek przysługuje wyłącznie pracownicy.",
      naruszenie:
        "Umowa o pracę ustała z naruszeniem przepisów prawa stwierdzonym prawomocnym orzeczeniem sądu. Zasiłek w wysokości zasiłku macierzyńskiego przysługuje do dnia porodu wyłącznie przy upadłości, likwidacji albo śmierci pracodawcy. Po porodzie przysługuje zasiłek macierzyński po ustaniu ubezpieczenia, który wypłaca ZUS.",
      przedluzenie:
        "Umowa o pracę na czas określony albo na okres próbny dłuższy niż miesiąc trwa do dnia porodu, więc do porodu masz ubezpieczenie chorobowe i zasiłek chorobowy przy niezdolności do pracy. Po porodzie przysługuje zasiłek macierzyński, który wypłaca ZUS.",
    },
    akcje: {
      K03: "Zgłoś się do dobrowolnego ubezpieczenia chorobowego",
      K16: "Sprawdź świadczenie rodzicielskie",
      K25: "Sprawdź świadczenie rehabilitacyjne",
      K26: "Sprawdź zasiłek po utracie pracy w ciąży",
      K29: "Sprawdź ubezpieczenie chorobowe w dniu porodu",
      K08: "Sprawdź zasiłek macierzyński po porodzie",
      stanRozliczen: "Sprawdź stan rozliczeń składek",
    },
    platnicy: {
      zus: "ZUS",
      platnikSkladek: "Płatnik składek",
      pracodawca: "Pracodawca",
      pracodawcaZNazwa: ({ nazwa }: { nazwa: string }) => `Pracodawca: ${nazwa}`,
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
      przedluzenie: "Przedłużenie umowy o pracę",
      przedluzonaDo: ({ data }: { data: string }) => `Do dnia porodu ${data}`,
      przedluzonaDoPorodu: "Do dnia porodu",
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
      zasilekBezKoduB: "Zasiłek chorobowy z zaświadczeniem lekarskim bez kodu B",
      wynagrodzenieWCiazy: "Wynagrodzenie chorobowe w ciąży i poza ciążą",
    },
    jednostki: {
      dni: ({ liczba }: { liczba: string }) => `${liczba} dni`,
      lata: ({ liczba }: { liczba: string }) => `${liczba} lat`,
      miesiace: ({ liczba }: { liczba: string }) => `${liczba} miesięcy`,
      dniIDni: ({ a, b }: { a: string; b: string }) => `${a} dni, a od roku po ukończeniu 50 lat ${b} dni`,
      procentPodstawy: ({ procent }: { procent: string }) => `${procent}% podstawy`,
      trzyStawki: ({ a, b, c }: { a: string; b: string; c: string }) =>
        `${a}% przez pierwsze 3 miesiące, ${b}% za pozostały okres, ${c}% w ciąży`,
      stawkiWynagrodzenia: ({ zKodemB, bezKoduB }: { zKodemB: string; bezKoduB: string }) =>
        `${zKodemB}% wynagrodzenia z kodem B, ${bezKoduB}% wynagrodzenia bez kodu B`,
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
    ryzyka: {
      tytul: "Ryzyka dla zasiłków w ciąży",
      wstep: "Te sytuacje mogą obniżyć zasiłek chorobowy i zasiłek macierzyński albo odebrać prawo do nich. Sprawdź, czy któraś z nich dotyczy Twojej rodziny.",
      wykryto: "Dotyczy Twojej rodziny",
      zobaczSprawe: "Zobacz sprawę w planie",
      pozor: {
        tytul: "Umowa albo działalność zawarta dla pozoru",
        opis:
          "Umowa zawarta albo działalność gospodarcza podjęta w ciąży wyłącznie po to, by objąć się ubezpieczeniem chorobowym i uzyskać zasiłki, jest zawarta dla pozoru. ZUS po przeprowadzeniu postępowania może wtedy wydać decyzję o niepodleganiu ubezpieczeniom społecznym, a osobie, która nie podlega ubezpieczeniu chorobowemu, zasiłki nie przysługują.",
      },
      podwyzszenie: {
        tytul: "Podwyższenie podstawy wymiaru składek w ciąży",
        opis:
          "Podstawa wymiaru składek podwyższona w ciąży wyłącznie po to, by uzyskać wyższe zasiłki, może zostać zakwestionowana. ZUS po przeprowadzeniu postępowania może wtedy wydać decyzję ustalającą niższą podstawę wymiaru, a od niej policzy zasiłek chorobowy i zasiłek macierzyński.",
      },
      dzienPorodu: {
        tytul: "Ubezpieczenie chorobowe w dniu porodu",
        opis:
          "Zasiłek macierzyński przysługuje, gdy w dniu porodu matka podlega ubezpieczeniu chorobowemu. Przy umowie zlecenia i jednoosobowej działalności gospodarczej to ubezpieczenie jest dobrowolne, więc wymaga zgłoszenia i opłacania składek. Rozwiązanie umowy o pracę, zakończenie umowy zlecenia albo zakończenie działalności przed porodem kończy ubezpieczenie chorobowe.",
        wyjatki:
          "Zasiłek macierzyński po ustaniu ubezpieczenia przysługuje pracownicy, której umowa ustała w ciąży z powodu upadłości, likwidacji albo śmierci pracodawcy albo z naruszeniem przepisów prawa stwierdzonym prawomocnym orzeczeniem sądu, oraz pracownicy, której umowę na czas określony przedłużono do dnia porodu.",
      },
      ochrona: {
        tytul: "Szczególna ochrona zatrudnienia z Kodeksu pracy",
        umowaOPrace:
          "Pracownicę na umowie o pracę chroni Kodeks pracy. W ciąży pracodawca może wypowiedzieć albo rozwiązać umowę wyłącznie przy upadłości albo likwidacji pracodawcy albo bez wypowiedzenia z winy pracownicy za zgodą reprezentującej ją zakładowej organizacji związkowej. Umowa na czas określony albo na okres próbny dłuższy niż miesiąc, która skończyłaby się po upływie trzeciego miesiąca ciąży, trwa do dnia porodu, z wyjątkiem umowy na zastępstwo.",
        bezUmowyOPrace:
          "Szczególna ochrona z Kodeksu pracy, czyli zakaz wypowiedzenia i rozwiązania umowy w ciąży oraz przedłużenie umowy terminowej do dnia porodu, obejmuje wyłącznie pracownice na umowie o pracę. Przy umowie zlecenia i jednoosobowej działalności gospodarczej zachowaj dobrowolne ubezpieczenie chorobowe do dnia porodu, bo od niego zależy zasiłek macierzyński.",
        drugiRodzic:
          "Drugiego rodzica na umowie o pracę chroni zakaz wypowiedzenia i rozwiązania umowy od dnia złożenia wniosku o urlop ojcowski albo rodzicielski do dnia zakończenia tego urlopu. Przy wniosku złożonym wcześniej, niż wymaga Kodeks pracy, zakaz obowiązuje od 7 dni przed urlopem ojcowskim i od 21 dni przed urlopem rodzicielskim.",
        drugiRodzicBezUmowyOPrace:
          "Zakaz wypowiedzenia i rozwiązania umowy przy urlopie ojcowskim i rodzicielskim obejmuje wyłącznie rodzica na umowie o pracę. Drugi rodzic na umowie zlecenia albo w jednoosobowej działalności gospodarczej pobiera zasiłek macierzyński za okres odpowiadający tym urlopom, gdy podlega dobrowolnemu ubezpieczeniu chorobowemu.",
        zobaczOchrone: "Zobacz szczególną ochronę pracownika",
      },
    },
    // koniec ViewPregnancyBenefits
  },
  ViewCaseDetails: {
    tytulStrony: "Szczegóły sprawy",
    naglowek: "Szczegóły sprawy",
    // Sekcje sprawy/[idSprawy]/_sekcje (u13, u14, u16, u14, u14, u22, u22, u22, u25, u24, u30, u12)
    sekcjaTerminIKoszt: {
      termin: "Termin",
      terminy: ({ liczba }: { liczba: string }) => `Terminy (${liczba})`,
      dwaTerminyWstep: "Pilnuj obu terminów tej sprawy.",
      dniDoTerminu: ({ liczba }: { liczba: string }) => (liczba === "1" ? "1 dzień do terminu" : `${liczba} dni do terminu`),
      dzisTermin: "Termin mija dzisiaj",
      poTerminie: "Po terminie",
      minal: ({ liczba }: { liczba: string }) => {
        const n = Number(liczba);
        if (n === 1) return "Minął 1 dzień temu";
        const kilka = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
        return kilka ? `Minęły ${liczba} dni temu` : `Minęło ${liczba} dni temu`;
      },
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
      wracaDoZrobienia: ({ data }: { data: string }) => `Sprawa wróci do spraw do zrobienia ${data}.`,
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
        `ZUS nie zarejestrował jeszcze wniosku: ${tytul}. Gdy to zrobi, w miejscu Twojego oznaczenia zobaczysz status z ZUS.`,
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
      tytul: "Prawo do świadczenia w ciąży",
      opis: "Prawo do świadczenia sprawdzamy w danych z konta ZUS i profilu rodziny. Szczegóły, warunki i dokumenty znajdziesz w Świadczeniach w ciąży.",
      od: ({ data }: { data: string }) => `Od ${data}`,
      otworz: "Zobacz świadczenia w ciąży",
      ochronaTytul: "Szczególna ochrona zatrudnienia",
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
      zobaczSzczegoly: "Zobacz szczegóły ryzyka",
      podwyzszenie: ({ procent }: { procent: string }) =>
        `Ostatnia podstawa wymiaru składek jest o ${procent} wyższa niż średnia z poprzednich miesięcy. Gdy podstawę podwyższono w ciąży wyłącznie po to, by uzyskać wyższe zasiłki, ZUS po przeprowadzeniu postępowania może wydać decyzję ustalającą niższą podstawę wymiaru, a od niej policzy zasiłek macierzyński.`,
      podwyzszenieTytul: "Podwyższenie podstawy wymiaru składek",
      srednia: "Średnia podstawa z poprzednich miesięcy",
      ostatnia: "Ostatnia podstawa",
      wzrost: "Wzrost",
      zobaczRyzyka: "Zobacz ryzyka dla zasiłków w ciąży",
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
        notatka: "Rodzaj umowy zapiszemy w profilu rodziny jako Twoją odpowiedź i zaktualizujemy plan.",
        rodzajUmowy: "Rodzaj umowy",
        odpowiedz: ({ rodzaj }: { rodzaj: string }) => `${rodzaj}, Twoja odpowiedź`,
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
        uprawnieniaTytul: "Uprawnienia pracownicy w ciąży",
        uprawnienia: [
          "Pracodawca zwalnia pracownicę w ciąży od pracy na zalecone przez lekarza badania lekarskie związane z ciążą, gdy nie można ich przeprowadzić poza godzinami pracy. Za czas zwolnienia pracownica zachowuje prawo do wynagrodzenia.",
          "Pracodawca zatrudnia pracownicę w ciąży wyłącznie poza godzinami nadliczbowymi i poza porą nocną.",
          "Pracodawca deleguje pracownicę w ciąży poza stałe miejsce pracy i zatrudnia ją w systemie przerywanego czasu pracy wyłącznie za jej zgodą.",
          "Pracodawca przenosi pracownicę w ciąży zatrudnioną przy pracy wzbronionej kobietom w ciąży do innej pracy i wypłaca dodatek wyrównawczy, gdy przeniesienie obniża wynagrodzenie. Gdy przeniesienie jest niemożliwe, zwalnia ją z obowiązku świadczenia pracy z zachowaniem dotychczasowego wynagrodzenia.",
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
        pip: "Porady prawne Państwowej Inspekcji Pracy dla rodziców",
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
        "poronienie-bez-zaswiadczenia": "po poronieniu",
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
      kartaOkresu: "Okres zasiłku",
      wstepOsmiuTygodni: "Od dnia porodu do końca 8. tygodnia",
      wstepPoZgonie: "Od dnia porodu do 7. dnia po dniu zgonu dziecka",
      okres: ({ od, doDnia }: { od: string; doDnia: string }) => `${od} – ${doDnia}`,
      opisMartweUrodzenie:
        "Po urodzeniu martwego dziecka zasiłek przysługuje przez 8 tygodni od dnia porodu. W tym czasie masz urlop macierzyński.",
      opisPoronienie:
        "Po poronieniu potwierdzonym zaświadczeniem o martwym urodzeniu zasiłek przysługuje przez 8 tygodni od dnia poronienia. W tym czasie masz urlop macierzyński.",
      opisZgonPrzedOsmiomaTygodniami:
        "Po zgonie dziecka przed upływem 8 tygodni życia zasiłek przysługuje przez 8 tygodni od dnia porodu, nie krócej niż do 7. dnia po dniu zgonu dziecka. W tym czasie masz urlop macierzyński.",
      opisZgonPoOsmiuTygodniach:
        "Po zgonie dziecka po upływie 8 tygodni życia zasiłek przysługuje do 7. dnia po dniu zgonu dziecka. W tym czasie masz urlop macierzyński.",
      kartaJakZalatwic: "Jak załatwić",
      jakPracodawca: "Pracujesz na umowie o pracę, więc sprawę załatwiasz u pracodawcy.",
      wyplacaPracodawca: "Pracodawca wypłaca zasiłek za cały okres.",
      wyplacaZus: "Zasiłek za cały okres wypłaca ZUS.",
      jakZus:
        "Składasz do ZUS wniosek ZAM w eZUS z zaświadczeniem o martwym urodzeniu albo z odpisem skróconym aktu urodzenia z adnotacją o martwym urodzeniu. Zasiłek wypłaca ZUS.",
      zobaczInstrukcje: "Zobacz instrukcję",
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
        trescSkutku: "Tracisz możliwość wyboru równych wypłat w wysokości 81,5%.",
        notatka: "Jeśli zmienisz datę przyjęcia dziecka, oba terminy też się zmienią.",
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
      tytul: "Wniosek o zasiłek chorobowy (ZAS-53)",
      opis: "Zasiłek chorobowy wypłaca Ci ZUS, a płatnikiem składek jesteś Ty, więc wniosek składasz samodzielnie. Zajmie Ci to kilka minut.",
      kroki: [
        "Wybierz zaświadczenie lekarskie e-ZLA z konta ZUS albo wpisz zaświadczenie od lekarza spoza listy.",
        "Sprawdź swoje dane i dane płatnika składek, podaj rachunek do wypłaty.",
        "Sprawdź podsumowanie i wyślij wniosek do ZUS.",
      ],
      akcja: "Złóż wniosek o zasiłek chorobowy (ZAS-53)",
      instrukcja: "Zobacz instrukcję",
      szkicZapisany: ({ data }: { data: string }) => `Szkic zapisany ${data}`,
      zaswiadczenie: "Zaświadczenie",
      zaswiadczenieWartosc: ({ numer, od, do: koniec }: { numer: string; od: string; do: string }) => `${numer}, ${od} – ${koniec}`,
      ostatniKrok: "Ostatni krok",
      ostatniKrokWartosc: ({ krok, liczbaKrokow, nazwa }: { krok: number; liczbaKrokow: number; nazwa: string }) =>
        `${krok} z ${liczbaKrokow}: ${nazwa}`,
      rachunek: "Numer rachunku",
      wrocisz: "Wrócisz do ostatniego kroku z zachowanymi odpowiedziami.",
      dokoncz: "Dokończ wniosek",
      wyslany: ({ numer, data }: { numer: string; data: string }) => `Ostatni wniosek wysłany ${data}, numer potwierdzenia ${numer}.`,
      // koniec sekcjaWniosekZas53
    },
    sekcjaStraznikOplacenieSkladek: {
      tytul: "Opłacenie składek",
      miesiac: "Miesiąc składek",
      termin: "Termin opłacenia",
      opis: "Opłacaj składki do 20. dnia każdego miesiąca, a gdy ten dzień przypada w sobotę albo w dniu ustawowo wolnym od pracy, do najbliższego dnia roboczego. Jeśli w dniu powstania prawa do zasiłku zadłużenie z tytułu składek przekracza próg zadłużenia, nie masz prawa do zasiłku, dopóki nie spłacisz całego zadłużenia.",
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
      osoba: ({ rodzic, osoba }: { rodzic: string; osoba: string }) => `${rodzic}, ${osoba}`,
      kwotaNaDziecko: ({ kwota }: { kwota: string }) => `${kwota} na dziecko`,
      instytucjaOplacenia: "Zakład Ubezpieczeń Społecznych (ZUS)",
      kanalOplacenia: "Przelew na indywidualny rachunek składkowy",
    },
    rodzaje: {
      swiadczenie: "Wniosek o świadczenie pieniężne",
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
      notaPo: "i popraw je, a plan uwzględni zmiany.",
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
      opis: "Żeby sprawdzić ten warunek, potrzebujemy danych o ciąży i dziecku. Zapiszemy je, gdy udzielisz zgody na dane dotyczące zdrowia.",
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
      wrocDoWniosku: "Wróć do wniosku",
      szkic: ({ data }: { data: string }) =>
        `Masz szkic wniosku zapisany ${data}. Wrócisz do ostatniego kroku z zachowanymi odpowiedziami.`,
      wyslany: ({ data, numer }: { data: string; numer: string }) => `Wniosek wysłany ${data}, numer potwierdzenia ${numer}.`,
      zobaczPotwierdzenie: "Zobacz potwierdzenie",
      przekazDaneDziecka: "Przekaż dane dziecka",
      // koniec sekcjaAkcjaWnioskuZam
    },
    sekcjaAkcjaWnioskuOUrlop: {
      tytul: "Wniosek o urlop do pracodawcy",
      opis: "Przygotujemy wniosek z danymi z Twojego konta ZUS i profilu rodziny, a Ty wyślesz go pracodawcy e-mailem albo pobierzesz.",
      przygotuj: "Przygotuj wniosek o urlop",
      dokoncz: "Dokończ wniosek o urlop",
      szkic: ({ data }: { data: string }) => `Szkic wniosku z ${data}`,
      przygotowany: ({ data }: { data: string }) => `Wniosek przygotowany ${data}. Po przekazaniu go pracodawcy oznacz sprawę jako złożoną.`,
      wyslany: ({ data }: { data: string }) => `Wniosek wysłany do pracodawcy ${data}.`,
      // koniec sekcjaAkcjaWnioskuOUrlop
    },
    sekcjaAkcjaRezygnacjiIPrzejecia: {
      tytulRezygnacji: "Wcześniejszy powrót do pracy",
      opisRezygnacji: ({ data }: { data: string }) =>
        `Po wykorzystaniu co najmniej 14 tygodni urlopu macierzyńskiego możesz zrezygnować z dalszej części i wrócić do pracy. Pozostałą część urlopu przejmie ojciec dziecka. Najwcześniej wrócisz ${data}.`,
      opisRezygnacjiZasilku:
        "Po wykorzystaniu co najmniej 14 tygodni urlopu macierzyńskiego możesz zrezygnować z dalszej części zasiłku macierzyńskiego. Pozostałą część zasiłku przejmie ojciec dziecka.",
      akcjaRezygnacji: "Zrezygnuj z dalszej części urlopu macierzyńskiego",
      akcjaWznowieniaRezygnacji: "Wróć do szkicu rezygnacji",
      tytulPrzejecia: "Przejęcie urlopu macierzyńskiego",
      opisPrzejecia:
        "Pozostałą część urlopu macierzyńskiego przejmujesz od dnia powrotu matki do pracy do końca urlopu macierzyńskiego. Wniosek składasz pracodawcy co najmniej 14 dni przed rozpoczęciem urlopu.",
      opisPrzejeciaZam:
        "Pozostałą część zasiłku macierzyńskiego otrzymasz na wniosek ZAM o zasiłek za okres urlopu macierzyńskiego przejętego od matki.",
      akcjaPrzejecia: "Przejmij urlop macierzyński",
      akcjaWznowieniaPrzejecia: "Wróć do szkicu wniosku",
      kartaUrlopu: "Twój urlop",
      urlopMacierzynski: "Urlop macierzyński",
      drugiRodzic: "Drugi rodzic",
      okres: ({ od, do_ }: { od: string; do_: string }) => `${od} – ${do_}`,
      drugiRodzicZForma: ({ imieINazwisko, forma }: { imieINazwisko: string; forma: string }) =>
        `${imieINazwisko}, ${forma}`,
      informacjaPrzejecia: ({ temat, tresc }: { temat: string; tresc: string }) => `${temat}. ${tresc}`,
      // koniec sekcjaAkcjaRezygnacjiIPrzejecia
    },
    sekcjaAkcjaWariantu: {
      tytul: "Wariant zasiłku macierzyńskiego",
      opis1: "Zdecyduj, jak chcesz otrzymywać zasiłek: po równo, czyli 81,5% podstawy przez cały urlop, albo więcej na początku, czyli 100% podstawy w czasie urlopu macierzyńskiego i 70% w czasie urlopu rodzicielskiego.",
      opis2: "Porównanie pokaże w złotych, ile i kiedy otrzymasz w każdym wariancie i co się zmieni, gdy wrócisz do pracy wcześniej.",
      termin: ({ termin }: { termin: string }) => `Wybierz wariant do ${termin}`,
      terminDopisek: ", czyli 21. dnia po porodzie. Później zostanie tylko wariant 100% i 70%.",
      poTerminie: ({ termin }: { termin: string }) => `Termin na wariant 81,5% minął ${termin}. Zasiłek za urlop rodzicielski wyniesie 70%.`,
      wybrany: "Wybrany wariant: ",
      wybranyKwota: ({ kwota, tygodnie }: { kwota: string; tygodnie: string }) => `, ${kwota} miesięcznie przez ${tygodnie}.`,
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
        `Urlop rodzicielski ${dzieci} trwa ${wymiar}. Każde z Was ma w nim 9 tygodni, których nie można przekazać. Jeśli ${imie} ich nie wykorzysta, przepadną.`,
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
      // Akcja otwarcia zintegrowanego kalkulatora przy K07, K08, K31, K32 (wynik), K10 (podział) i K37 (łączenie z pracą)
      policzZasilek: "Policz zasiłek w kalkulatorze",
      ulozUrlopy: "Ułóż urlopy w kalkulatorze zasiłku",
      polaczZPraca: "Połącz urlop rodzicielski z pracą w kalkulatorze zasiłku",
      // koniec sekcjaAkcjaKalkulatora
    },
    sekcjaAkcjaZas53: {
      tytul: "Wniosek o zasiłek chorobowy (ZAS-53)",
      opis: "Wniosek złożysz w przewodniku: wybierzesz zaświadczenie lekarskie, sprawdzisz dane i wyślesz wniosek do ZUS.",
      akcja: "Złóż wniosek o zasiłek chorobowy (ZAS-53)",
      // koniec sekcjaAkcjaZas53
    },
    sekcjaAkcjaOdpisu: {
      zlozWniosek: "Złóż wniosek o odpis",
      zlozKolejny: "Złóż kolejny wniosek o odpis",
      podajDatePorodu: "Podaj datę porodu",
      tytul: "Wniosek o odpis aktu urodzenia",
      wPrzewodniku: "Wniosek wypełnisz w przewodniku, a my złożymy go w rejestrze stanu cywilnego na gov.pl.",
      twojWniosek: "Twój wniosek",
      rodzaj: "Rodzaj odpisu",
      dataZlozenia: "Data złożenia",
      dzienWydania: "Przewidywany dzień wydania odpisu",
      odbior: "Sposób odbioru",
      numer: "Numer potwierdzenia",
      zobaczWniosek: "Zobacz wniosek w Twoich wnioskach",
      // koniec sekcjaAkcjaOdpisu
    },
    sekcjaPytaniaDoZus: {
      tytul: "Pytania do ZUS",
      opis: "Masz wątpliwość w tej sprawie? Zadaj pytanie do ZUS, a dołączymy do niego opis Twojej sytuacji. Sprawdź też, jakie dane ZUS ma na Twoim koncie.",
      zadajPytanie: "Zadaj pytanie do ZUS",
      zobaczDane: "Zobacz dane konta ZUS",
      lista: "Pytania w tej sprawie",
      podpisListy: "Pytania do ZUS w tej sprawie",
      przewijanie: "Tabela pytań do ZUS w tej sprawie",
      kolumny: { pytanie: "Pytanie", wyslano: "Wysłano", status: "Status" },
      statusy: { wyslane: "Wysłane", odpowiedz: "Odpowiedź" },
      pustaLista: "Nie masz jeszcze pytań do ZUS w tej sprawie.",
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
    brakKrokow: "Kroki tej sprawy pokażemy tutaj, gdy będą gotowe.",
    wstepFormy: {
      "umowa-o-prace": "Pracujesz na umowie o pracę.",
      "umowa-zlecenia": "Wykonujesz umowę zlecenia.",
      jdg: "Prowadzisz jednoosobową działalność gospodarczą.",
      "brak-tytulu": "Nie masz tytułu do ubezpieczenia.",
    },
    // Rodzic sprawy, gdy sprawę ogląda drugi z rodziców; drugiego rodzica nazywamy imieniem z profilu, gdy je znamy.
    osobaSprawy: {
      matka: "Mama",
      drugiRodzic: "Drugi rodzic",
    },
    wstepFormyDrugiegoRodzica: {
      "umowa-o-prace": ({ osoba }: { osoba: string }) => `${osoba} pracuje na umowie o pracę.`,
      "umowa-zlecenia": ({ osoba }: { osoba: string }) => `${osoba} wykonuje umowę zlecenia.`,
      jdg: ({ osoba }: { osoba: string }) => `${osoba} prowadzi jednoosobową działalność gospodarczą.`,
      "brak-tytulu": ({ osoba }: { osoba: string }) => `${osoba} nie ma tytułu do ubezpieczenia.`,
      bezFormy: ({ osoba }: { osoba: string }) => `${osoba} prowadzi tę sprawę.`,
    },
    // Zdania akapitu Najważniejsze informacje o instytucji i kanale dla formy zatrudnienia rodzica sprawy.
    zdaniaKanalu: {
      instytucja: {
        zus: "Sprawę załatwiasz w ZUS.",
        platnikSkladek: "Wniosek trafi do płatnika składek, który wypłaca Ci zasiłek.",
        platnikSkladekNazwa: ({ nazwa }: { nazwa: string }) =>
          `Wniosek trafi do płatnika składek, który wypłaca Ci zasiłek (${nazwa}).`,
        platnikNieustalony: "Zasiłek wypłaci Ci ZUS albo płatnik składek.",
        platnikAlboZus: "Sprawę załatwiasz u płatnika składek albo w ZUS.",
        pracodawca: "Sprawę załatwiasz u pracodawcy.",
        zleceniodawca: "Sprawę załatwiasz u zleceniodawcy.",
        gmina: "Sprawę załatwiasz w gminie albo w MOPS w miejscu zamieszkania.",
        urzadStanuCywilnego: "Sprawę załatwiasz w urzędzie stanu cywilnego.",
      },
      kanal: {
        zam: "Wniosek o zasiłek macierzyński (ZAM) przygotujesz w kreatorze w przewodniku.",
        z15: "Wniosek o zasiłek opiekuńczy (Z-15) przygotujesz w kreatorze w przewodniku.",
        zas53: "Wniosek o zasiłek chorobowy (ZAS-53) przygotujesz w kreatorze w przewodniku.",
        ezus: "Wniosek złożysz przez internet w eZUS.",
        ezusZam: "Wniosek o zasiłek macierzyński (ZAM) złożysz przez internet w eZUS.",
        empatia: "Wniosek złożysz przez internet w Emp@tii albo osobiście w urzędzie.",
        mobywatel: "Załatwisz ją w mObywatelu, na gov.pl albo osobiście w urzędzie.",
        "gov-rejestr-stanu-cywilnego": "Wniosek złożysz na gov.pl albo osobiście w urzędzie.",
        pracodawca: "Wniosek złożysz w dziale kadr, osobiście albo w sposób przyjęty w firmie.",
        pracodawcaK23:
          "Wniosek o urlop wychowawczy albo o obniżenie wymiaru czasu pracy przygotujesz w kreatorze wniosków do pracodawcy.",
        zleceniodawca: "Zgłoś ją osobie, która prowadzi Twoją umowę.",
      },
      informacja: "Przeczytaj informację w przewodniku. Nie składasz wniosku.",
      // Opis z katalogu świadczeń, gdy sprawa nie ma akcji przejścia do kanału.
      zKatalogu: ({ wartosc }: { wartosc: string }) => {
        const tekst = /^\p{Lu}\p{Ll}/u.test(wartosc) ? `${wartosc.charAt(0).toLowerCase()}${wartosc.slice(1)}` : wartosc;
        return `Gdzie załatwisz sprawę: ${tekst}${tekst.endsWith(".") ? "" : "."}`;
      },
    },
    // Te same zdania w trzeciej osobie, gdy rodzic sprawy jest drugim z rodziców wobec rodzica konta.
    zdaniaKanaluDrugiegoRodzica: {
      instytucja: {
        zus: "Sprawę załatwia w ZUS.",
        platnikSkladek: "Wniosek trafi do płatnika składek, który wypłaca zasiłek.",
        platnikSkladekNazwa: ({ nazwa }: { nazwa: string }) =>
          `Wniosek trafi do płatnika składek, który wypłaca zasiłek (${nazwa}).`,
        platnikNieustalony: "Zasiłek wypłaci ZUS albo płatnik składek.",
        platnikAlboZus: "Sprawę załatwia u płatnika składek albo w ZUS.",
        pracodawca: "Sprawę załatwia u pracodawcy.",
        zleceniodawca: "Sprawę załatwia u zleceniodawcy.",
        gmina: "Sprawę załatwia w gminie albo w MOPS w miejscu zamieszkania.",
        urzadStanuCywilnego: "Sprawę załatwia w urzędzie stanu cywilnego.",
      },
      kanal: {
        zam: "Wniosek o zasiłek macierzyński (ZAM) przygotuje w kreatorze w przewodniku.",
        z15: "Wniosek o zasiłek opiekuńczy (Z-15) przygotuje w kreatorze w przewodniku.",
        zas53: "Wniosek o zasiłek chorobowy (ZAS-53) przygotuje w kreatorze w przewodniku.",
        ezus: "Wniosek złoży przez internet w eZUS.",
        ezusZam: "Wniosek o zasiłek macierzyński (ZAM) złoży przez internet w eZUS.",
        empatia: "Wniosek złoży przez internet w Emp@tii albo osobiście w urzędzie.",
        mobywatel: "Załatwi ją w mObywatelu, na gov.pl albo osobiście w urzędzie.",
        "gov-rejestr-stanu-cywilnego": "Wniosek złoży na gov.pl albo osobiście w urzędzie.",
        pracodawca: "Wniosek złoży w dziale kadr, osobiście albo w sposób przyjęty w firmie.",
        pracodawcaK23:
          "Wniosek o urlop wychowawczy albo o obniżenie wymiaru czasu pracy przygotuje w kreatorze wniosków do pracodawcy.",
        zleceniodawca: "Zgłosi ją osobie, która prowadzi umowę zlecenia.",
      },
      informacja: "Przeczytaj informację w przewodniku. Sprawa nie wymaga wniosku.",
      zKatalogu: ({ wartosc }: { wartosc: string }) => {
        const tekst = /^\p{Lu}\p{Ll}/u.test(wartosc) ? `${wartosc.charAt(0).toLowerCase()}${wartosc.slice(1)}` : wartosc;
        return `Gdzie załatwi sprawę: ${tekst}${tekst.endsWith(".") ? "" : "."}`;
      },
    },
    termin: "Termin",
    bezTerminu: "Bez terminu",
    sprawaBezTerminu: "Sprawa nie ma terminu w kalendarzu",
    terminSzacowany: ({ opis }: { opis: string }) => `Termin szacowany: ${opis}`,
    terminWyliczony: ({ opis }: { opis: string }) => `${opis.charAt(0).toUpperCase()}${opis.slice(1)}`,
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
      z15: {
        instytucjaPracodawca: "Pracodawca",
        instytucjaPracodawcaPodpis: "Wypłaca zasiłek albo przekazuje do ZUS zaświadczenie Z-3",
        instytucjaZleceniodawca: "Płatnik składek albo ZUS",
        instytucjaZleceniodawcaPodpis: "ZUS wypłaca zasiłek na podstawie zaświadczenia Z-3a",
        instytucjaZus: "ZUS",
        instytucjaZusPodpis: "Wypłaca Ci zasiłek",
        kanal: "Kreator wniosku w przewodniku",
        kanalPodpis: "Wniosek o zasiłek opiekuńczy (Z-15)",
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
      pracodawcaK23: {
        kanal: "Kreator wniosków do pracodawcy",
        kanalPodpis:
          "Wniosek o urlop wychowawczy co najmniej 21 dni przed rozpoczęciem urlopu albo wniosek o obniżenie wymiaru czasu pracy co najmniej 21 dni przed rozpoczęciem pracy w obniżonym wymiarze",
      },
      ezusZam: {
        kanalPodpis: "Wniosek o zasiłek macierzyński (ZAM) w eZUS",
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
      nieustalonyPodpis: "Zasiłek wypłaci Ci ZUS albo płatnik składek",
    },
    // Akcje przejścia do kanału
    akcjaKreatorZam: "Wypełnij wniosek",
    akcjaKreatorZas53: "Wypełnij wniosek ZAS-53",
    akcjaKreatorZ15: "Wypełnij wniosek Z-15",
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
    notatkaPracodawca: "Tę sprawę załatwiasz bezpośrednio u pracodawcy.",
    notatkaZleceniodawca: "Tę sprawę załatwiasz bezpośrednio u zleceniodawcy.",
    notatkaPracodawcaDrugiegoRodzica: "Tę sprawę załatwia bezpośrednio u swojego pracodawcy.",
    notatkaZleceniodawcaDrugiegoRodzica: "Tę sprawę załatwia bezpośrednio u swojego zleceniodawcy.",
    notatkaK05Pracownik:
      "Przekaż pracodawcy albo zleceniodawcy dane dziecka: imię, nazwisko, datę urodzenia i numer PESEL. Pracodawca albo zleceniodawca zgłosi dziecko do ubezpieczenia zdrowotnego w ZUS.",
    notatkaK36BezOplaty:
      "Odpis aktu urodzenia do sprawy w ZUS, świadczenia socjalnego, opieki albo adopcji lub zatrudnienia urząd wydaje bez opłaty skarbowej. Pierwszy odpis skrócony urząd wydaje bezpłatnie osobie, która zgłosiła urodzenie.",
    notatkaBezKanalu: "Tę sprawę załatwiasz osobiście.",
    notatkaInformacja: "Oznacz sprawę jako załatwioną, gdy przeczytasz informację. Zniknie z listy spraw do zrobienia.",
    notatkaPoOznaczeniu:
      "Termin tej sprawy zniknął z kalendarza. Sprawa oznaczona przez pomyłkę? Cofnij oznaczenie, a wróci do spraw do zrobienia.",
    // Co przygotować
    daneIDokumenty: "Dane i dokumenty",
    dokumentyIAdresat: "Dokumenty i adresat wniosku",
    dokumenty: "Dokumenty",
    adresatWniosku: "Adresat wniosku",
    adresatZus: "ZUS",
    adresatPlatnik: "Płatnik składek",
    platnikWProfilu: ({ platnik }: { platnik: string }) => `Płatnik zasiłku w Twoim profilu: ${platnik}.`,
    odpowiedzOPlatnika: "Odpowiedz na pytanie o płatnika",
    brakDokumentowWSlowniku: "Listę dokumentów pokażemy tutaj, gdy będzie gotowa.",
    wariantyPlatnikaWstep:
      "Dokumenty i adresat zależą od płatnika zasiłku rodzica, którego dotyczy sprawa. Płatnik składek, który według stanu na 30 listopada poprzedniego roku zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób, sam wypłaca zasiłek. W pozostałych przypadkach zasiłek wypłaca ZUS. Odpowiedź o płatniku zapisuje w profilu rodzic, którego dotyczy sprawa.",
    wariantPlatnika: {
      "platnik-skladek": "Gdy zasiłek wypłaca płatnik składek",
      zus: "Gdy zasiłek wypłaca ZUS",
    },
    adresatWariantu: ({ adresat }: { adresat: string }) => `Adresat wniosku: ${adresat}`,
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
      przycisk: "Pobierz plik kalendarza",
      // koniec akcjaPlikuKalendarza
    },
    wstep: "Sprawy z planu rodziny ułożyliśmy od najbliższego terminu. Przy każdym terminie sprawdzisz, ile stracisz albo co się stanie, jeśli się spóźnisz.",
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
      dniDoTerminu: ({ liczba }: { liczba: string }) => (liczba === "1" ? "1 dzień do terminu" : `${liczba} dni do terminu`),
      dzisTermin: "Termin mija dzisiaj",
      poTerminie: "Po terminie",
      minal: ({ liczba }: { liczba: string }) => {
        const n = Number(liczba);
        if (n === 1) return "Minął 1 dzień temu";
        const kilka = n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14);
        return kilka ? `Minęły ${liczba} dni temu` : `Minęło ${liczba} dni temu`;
      },
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
      nota: "Sprawy złożone, załatwione i sprawy bez terminu znajdziesz w planie rodziny. Sprawy powtarzalne wrócą tu same: wniosek o 800+ na kolejny okres świadczeniowy 1 lutego, a dwa dni opieki nad dzieckiem 1 stycznia.",
    },
    daneProfilu: {
      tytul: "Dane z profilu",
      wstep: "Od tych danych liczymy terminy i koszt spóźnienia. Po porodzie potwierdź datę porodu, a przeliczymy terminy szacowane od tej daty.",
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
      przeliczanie: "Terminy aktualizujemy codziennie i po każdej zmianie dat w profilu. Sprawy złożone, załatwione i sprawy bez terminu znajdziesz w",
      planieRodziny: "planie rodziny",
      przypomnienia: "Chcesz dostawać przypomnienia o terminach? Ustawisz je w",
      ustawieniach: "Ustawieniach",
      zKosztem: "Filtr „Z kosztem w złotych” pokazuje sprawy, przy których spóźnienie oznacza utratę pieniędzy. Sprawy ze skutkiem bez kwoty, na przykład zgłoszenie urodzenia dziecka, zobaczysz po wybraniu „Wszystkie”.",
    },
    // Etykiety rodzica sprawy w polu „Kogo dotyczy”.
    rodzic: {
      matka: ({ imieINazwisko }: { imieINazwisko: string }) => `Matka: ${imieINazwisko}`,
      drugiRodzic: ({ imieINazwisko }: { imieINazwisko: string }) => `Drugi rodzic: ${imieINazwisko}`,
      rodzicPrzyjmujacy: ({ imieINazwisko }: { imieINazwisko: string }) => `Rodzic, który przyjął dziecko: ${imieINazwisko}`,
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
      zaZyciem: "świadczenie „Za życiem”",
      lista: ({ czesci }: { czesci: string[] }) =>
        czesci.length > 1 ? `${czesci.slice(0, -1).join(", ")} i ${czesci[czesci.length - 1]}` : (czesci[0] ?? ""),
    },
    miesiaceDopelniacz: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"],
    // Opisy dat kotwiczących terminów (pole kotwica.opis w Terminach).
    kotwice: {
      koniec10Tygodnia: ({ data, ptp }: { data: string; ptp: string }) =>
        `ostatni dzień 10. tygodnia ciąży ${data}, czyli przewidywany termin porodu ${ptp} pomniejszony o 211 dni`,
      ptp: ({ data }: { data: string }) => `przewidywany termin porodu ${data}`,
      ptpMinus1: ({ data }: { data: string }) => `dzień poprzedzający przewidywany termin porodu ${data}`,
      // Parametr nazwa to nazwa daty kotwiczącej w dopełniaczu z grupy nazwy, na przykład „daty porodu”.
      plusDni: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) =>
        `${zLiczba(liczba, DNI)} od ${nazwa} (${data})`,
      plusMiesiace: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) =>
        `${zLiczba(liczba, MIESIACE)} od ${nazwa} (${data})`,
      plus12MinusDni: ({ nazwa, data }: { nazwa: string; data: string }) =>
        `14 dni przed upływem 12 miesięcy od ${nazwa} (${data})`,
      plus12MinusDniUmowa: ({ nazwa, data }: { nazwa: string; data: string }) =>
        `21 dni przed upływem 12 miesięcy od ${nazwa} (${data}), czyli ostatni dzień złożenia pracodawcy wniosku o urlop ojcowski`,
      plusTygodnie: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) =>
        `${zLiczba(liczba, TYGODNIE)} urlopu macierzyńskiego od ${nazwa} (${data})`,
      k11KoniecOkresu: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) =>
        `ostatni dzień okresu zasiłku za ${zLiczba(liczba, TYGODNIE)} urlopu macierzyńskiego od ${nazwa} (${data})`,
      k11Umowa: ({ nazwa, data, liczba }: { nazwa: string; data: string; liczba: string }) =>
        `21 dni przed końcem urlopu macierzyńskiego, który trwa ${zLiczba(liczba, TYGODNIE)} od ${nazwa} (${data}), czyli ostatni dzień złożenia pracodawcy wniosku o uzupełniający urlop macierzyński`,
      k10: ({ data, rok, dni }: { data: string; rok: string; dni: string }) =>
        `31 grudnia ${rok} roku, w którym dziecko urodzone ${data} kończy 6 lat, pomniejszony o ${dni} dni`,
      k10Przyjecie: ({ data, lata, dni }: { data: string; lata: string; dni: string }) =>
        `dzień poprzedzający ukończenie przez dziecko ${lata} lat, licząc od daty urodzenia ${data}, pomniejszony o ${dni} dni`,
      k23: ({ data, rok }: { data: string; rok: string }) =>
        `31 grudnia ${rok} roku, w którym dziecko urodzone ${data} kończy 6 lat, pomniejszony o 21 dni, czyli ostatni dzień złożenia pracodawcy wniosku o urlop wychowawczy`,
      k21Ostatni: ({ data }: { data: string }) => `dzień poprzedzający 14. urodziny dziecka urodzonego ${data}, ostatni termin tej sprawy`,
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
        `13 dni przed upływem 12 miesięcy od daty uprawomocnienia się orzeczenia (${data}), nie później niż ${limit}`,
      k09PrzysposobienieUmowa: ({ data, limit }: { data: string; limit: string }) =>
        `20 dni przed upływem 12 miesięcy od daty uprawomocnienia się orzeczenia (${data}), nie później niż ${limit}, czyli ostatni dzień złożenia pracodawcy wniosku o urlop ojcowski`,
      oplacenieSkladek: ({ miesiac }: { miesiac: string }) =>
        `20. dzień miesiąca następującego po miesiącu ${miesiac}, a gdy przypada w sobotę, niedzielę albo w dniu ustawowo wolnym od pracy, najbliższy następny dzień roboczy`,
      // Nazwy dat kotwiczących w dopełniaczu, do zdań typu „21 dni od daty porodu (22.03.2027)”.
      nazwy: {
        dataPorodu: "daty porodu",
        ptpZamiastPorodu: "przewidywanego terminu porodu",
        dataPrzyjecia: "daty przyjęcia dziecka",
        dataUprawomocnienia: "daty uprawomocnienia się orzeczenia",
        kotwica: "daty kotwiczącej",
      },
    },
    etykietyDrugiegoTerminu: {
      "wniosek-o-urlop": "Wniosek o urlop do pracodawcy",
      "wariant-81-5": "Wniosek o oba urlopy w wariancie 81,5%",
    },
    // Skutki spóźnienia z reguł terminów, gdy pozycja katalogu nie podaje tekstu skutku.
    skutki: {
      K01: "utrata prawa do świadczenia „Za życiem”, gdy u dziecka zostanie stwierdzone ciężkie i nieodwracalne upośledzenie albo nieuleczalna choroba zagrażająca życiu.",
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
    tytulKarty: "Wnioski złożone, przygotowane i wysłane w przewodniku",
    licznik: "Wnioski:",
    podpis: "Twoje wnioski od najnowszego",
    przewijanie: "Tabela wniosków",
    kolumny: { wniosek: "Wniosek", adresat: "Adresat", data: "Data", status: "Status" },
    rodzaje: {
      zam: "Wniosek o zasiłek macierzyński (ZAM)",
      "zas-53": "Wniosek o zasiłek chorobowy (ZAS-53)",
      "urlop-do-pracodawcy": "Wniosek o urlop do pracodawcy",
      "rezygnacja-z-czesci-zasilku": "Wniosek o rezygnację z części urlopu macierzyńskiego",
      "wniosek-ojca-o-urlop": "Wniosek ojca o urlop macierzyński",
      "odpis-aktu-urodzenia": "Wniosek o odpis aktu urodzenia",
      "z-15": "Wniosek o zasiłek opiekuńczy (Z-15)",
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
      wychowawczy: "Wniosek o urlop wychowawczy",
      "obnizenie-wymiaru": "Wniosek o obniżenie wymiaru czasu pracy",
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
      odmowa: "Odmowa",
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
    poDzis: ({ liczba, data }: { liczba: string; data: string }) =>
      `Wykorzystana część obejmuje ${liczba} dni po ${data}, na które lekarz już wystawił zaświadczenie e-ZLA.`,
    poczatekOkresu: "Początek okresu zasiłkowego",
    zaswiadczeniaWOkresie: "Zaświadczenia w okresie",
    przewidywanyTermin: "Przewidywany termin porodu",
    notatkaOkresu:
      "Liczymy dni z zaświadczeń wystawionych z powodu choroby. Okres zaczyna się w pierwszym dniu niezdolności do pracy z kodem B po co najmniej jednym dniu przerwy. Niezdolność bez kodu, po której bez przerwy następuje niezdolność z kodem B, wliczamy w całości. Dzień objęty kilkoma zaświadczeniami liczymy raz, a dni w okresie wyczekiwania pomijamy. Datę końca podajemy przy niezdolności do pracy trwającej bez przerwy.",
    terminPrzedKoncem: ({ data }: { data: string }) =>
      `Przewidywany termin porodu ${data} przypada przed końcem okresu zasiłkowego.`,
    koniecPrzedTerminem: ({ data }: { data: string }) =>
      `Okres zasiłkowy kończy się ${data}, przed terminem porodu, dlatego w planie rodziny jest sprawa Świadczenie rehabilitacyjne w ciąży.`,
    okresNieDotyczy: "Nie dotyczy. Na Twoich zaświadczeniach nie ma kodu B, który oznacza niezdolność do pracy w ciąży.",
    bezUbezpieczeniaOpis:
      "Prowadzisz działalność albo pracujesz na umowie zlecenia bez dobrowolnego ubezpieczenia chorobowego, dlatego okres zasiłkowy Cię nie dotyczy. Sprawy, które możesz załatwić, znajdziesz w",
    bezTytuluOpis:
      "Nie masz tytułu do ubezpieczenia. Twoja niezdolność do pracy nie powstała w czasie ubezpieczenia chorobowego ani w ciągu 14 dni od jego ustania z czasem trwania co najmniej 30 dni, dlatego okres zasiłkowy Cię nie dotyczy. Sprawy, które możesz załatwić, znajdziesz w",
    poUstaniuOpis:
      "Niezdolność do pracy powstała w czasie ubezpieczenia chorobowego i trwa po jego ustaniu albo powstała w ciągu 14 dni od jego ustania i trwa bez przerwy co najmniej 30 dni, dlatego wyliczamy okres zasiłkowy.",
    planRodzinyOdnosnik: "planie rodziny",
    rehabilitacyjneOdnosnik: "Zobacz w planie sprawę Świadczenie rehabilitacyjne w ciąży",
    wynagrodzenieTytul: ({ rok }: { rok: number }) => `Wynagrodzenie chorobowe w ${rok} roku`,
    zasilekOd: "Zasiłek chorobowy od",
    przelomRoku: ({ data, od }: { data: string; od: string }) =>
      `Zasiłek chorobowy od ${data} za nieprzerwaną niezdolność do pracy trwającą od ${od}. Dni wynagrodzenia chorobowego w tym roku liczymy od następnej niezdolności do pracy.`,
    notatkaWynagrodzenia: ({ limit }: { limit: number }) =>
      `Za pierwsze ${limit} dni niezdolności do pracy w roku kalendarzowym pracodawca wypłaca Ci wynagrodzenie chorobowe, a od kolejnego dnia przysługuje zasiłek chorobowy. W ciąży oba wynoszą 100% podstawy.`,
    wliczoneBezB: ({ rok, numery }: { rok: number; numery: string }) =>
      `Wliczamy wszystkie zaświadczenia z powodu choroby z ${rok} roku, także ${numery} bez kodu B.`,
    opiekaNieWliczana: ({ numery }: { numery: string }) =>
      `Zaświadczenie ${numery} dotyczy opieki nad dzieckiem lub członkiem rodziny, więc nie wliczamy go do dni wynagrodzenia chorobowego.`,
    zasilekOdPierwszegoTytul: "Zasiłek chorobowy od pierwszego dnia",
    formaZatrudnienia: "Forma zatrudnienia",
    zasilekChorobowy: "Zasiłek chorobowy",
    odPierwszegoDnia: "Od pierwszego dnia niezdolności do pracy po upływie okresu wyczekiwania 90 dni",
    formy: {
      "umowa-zlecenia": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      jdg: "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "umowa-o-prace": "Umowa o pracę",
    },
    notatkaOdPierwszego:
      "Wynagrodzenie chorobowe wypłaca pracodawca pracownikowi. Po upływie okresu wyczekiwania 90 dni dobrowolnego ubezpieczenia chorobowego przysługuje Ci zasiłek chorobowy od pierwszego dnia niezdolności do pracy, w ciąży w wysokości 100% podstawy.",
    wyliczeniaTytul: "Wyliczenia z zaświadczeń",
    wynagrodzenieKrotko: ({ rok }: { rok: number }) => `Wynagrodzenie chorobowe w ${rok}`,
    wrocDoPlanu: "Wróć do planu rodziny",
    brakZgodyOpis:
      "Zaświadczenia lekarskie i wyliczenie okresu zasiłkowego zobaczysz, gdy w ustawieniach przewodnika wyrazisz zgodę na dane dotyczące zdrowia.",
    przejdzDoUstawien: "Przejdź do ustawień",
    // koniec ViewSickLeaveList
  },
  ViewContributionBalance: {
    tytulStrony: "Stan rozliczeń składek",
    naglowek: "Stan rozliczeń składek",
    powrot: "Plan rodziny",
    stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
    wystawZaswiadczenie: "Złóż wniosek o zaświadczenie o niezaleganiu",
    kartaChorobowy: "Zasiłek chorobowy",
    kartaMacierzynski: "Zasiłek macierzyński",
    kartaNaDzis: "Stan rozliczeń na dziś",
    dzienPrawaEzla: ({ data, numer }: { data: string; numer: string }) =>
      `Dzień powstania prawa: ${data}, czyli pierwszy dzień ostatniej nieprzerwanej niezdolności do pracy, od zaświadczenia lekarskiego ${numer}.`,
    dzienPrawaPorod: ({ data }: { data: string }) => `Dzień powstania prawa: ${data}, czyli dzień porodu.`,
    dzienPrawaZam: ({ data }: { data: string }) =>
      `Dzień powstania prawa: ${data}, czyli pierwszy dzień zasiłku macierzyńskiego z wniosku ZAM złożonego przed porodem.`,
    dzienPrawaWyczekiwanie: ({ data, numer }: { data: string; numer: string }) =>
      `Dzień powstania prawa: ${data}, czyli dzień nabycia prawa do zasiłku chorobowego po okresie wyczekiwania, w trakcie niezdolności do pracy z zaświadczenia lekarskiego ${numer}.`,
    dzienPrawaTermin: ({ data }: { data: string }) =>
      `Dzień powstania prawa: ${data}, czyli przewidywany termin porodu. Do tego dnia pokazujemy stan rozliczeń na dziś.`,
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
      `${prog}, czyli 1% minimalnego wynagrodzenia ${minimalne}`,
    progZadluzeniaWRoku: ({ rok }: { rok: string }) => `Próg zadłużenia w ${rok} roku`,
    wplywPonadProgEtykieta: "Zadłużenie powyżej progu",
    wplywPonadProg:
      "Zasiłek nie przysługuje do spłaty całego zadłużenia. Spłata w ciągu 6 miesięcy od dnia powstania prawa daje zasiłek za cały okres.",
    wplywWyplataEtykieta: "Wypłata po spłacie",
    wplywWyplata: "ZUS wypłaca zasiłek najpóźniej w ciągu 60 dni od dnia spłaty.",
    notatkaOdczytu: "Stan rozliczeń pochodzi z Twojego konta w eZUS.",
    niedostepnyTytul: "Stan rozliczeń na dzień powstania prawa",
    niedostepnyOpis:
      "Otwórz przewodnik później, a pokażemy kwotę zadłużenia i jego skutek dla zasiłku.",
    potwierdzWPlanie: "Potwierdź opłacenie składek w planie",
    brakDzialalnosci:
      "Stan rozliczeń składek dotyczy osoby, która prowadzi działalność i sama rozlicza składki. Twoje składki rozlicza płatnik składek.",
    wrocDoPlanu: "Wróć do planu rodziny",
    // koniec ViewContributionBalance
  },
  ViewContributionCertificate: {
    tytulStrony: "Wniosek o zaświadczenie o niezaleganiu",
    naglowek: "Wniosek o zaświadczenie o niezaleganiu w opłacaniu składek",
    powrot: "Stan rozliczeń",
    wniosekTytul: "Wniosek o zaświadczenie o niezaleganiu",
    wniosekOpis:
      "Wyślij wniosek, a ZUS wyda zaświadczenie o niezaleganiu w opłacaniu składek albo, gdy masz zadłużenie, decyzję o odmowie wydania zaświadczenia. Dokument będzie oznaczony jako symulacja.",
    dzienStanuOpis: "ZUS wydaje dokument według stanu rozliczeń w dniu wysłania wniosku.",
    wyslij: "Wyślij wniosek o zaświadczenie",
    wrocDoStanu: "Wróć do stanu rozliczeń",
    coZawieraTytul: "Co znajdzie się w dokumencie",
    coZawiera: [
      "Imię, nazwisko i numer PESEL",
      "Dzień stanu rozliczeń i rodzaj dokumentu",
      "Informacja o układzie ratalnym albo odroczeniu",
      "Data i godzina wydania oraz oznaczenie symulacji na każdej stronie",
    ],
    wystawioneTytul: "Wydany dokument",
    rodzaj: "Rodzaj dokumentu",
    dzienStanu: "Dzień stanu rozliczeń",
    kwotaZadluzenia: "Kwota zadłużenia ze stanu rozliczeń",
    umowa: "Układ ratalny albo odroczenie",
    umowaPdf: "Układ ratalny albo odroczenie terminu płatności",
    umowaBrak: "Brak",
    umowaOpis: ({ rodzaj, kwota }: { rodzaj: string; kwota: string }) => `${rodzaj}, kwota objęta umową ${kwota}`,
    umowaRodzaje: { "uklad-ratalny": "Układ ratalny", odroczenie: "Odroczenie terminu płatności" },
    wystawiono: "Data i godzina wydania",
    rodzaje: {
      "o-niezaleganiu": "Zaświadczenie o niezaleganiu w opłacaniu składek",
      "o-wysokosci-zadluzenia": "Decyzja o odmowie wydania zaświadczenia o niezaleganiu w opłacaniu składek",
    },
    pobierz: {
      "o-niezaleganiu": "Pobierz zaświadczenie (PDF)",
      "o-wysokosci-zadluzenia": "Pobierz decyzję (PDF)",
    },
    notatkaPobrania:
      "Pobierz dokument, zanim się wylogujesz. To symulacja z wersji demonstracyjnej przewodnika. ZUS nie wydał tego dokumentu.",
    pdfSymulacjaGora: "SYMULACJA. Dokument przygotowany w wersji demonstracyjnej przewodnika",
    pdfSymulacjaDol: "SYMULACJA. Dokument przygotowany w wersji demonstracyjnej przewodnika, wydany poza ZUS",
    pdfLogo: "Przewodnik rodzica",
    pdfWystawiono: ({ data }: { data: string }) => `Wydano: ${data}`,
    pdfPodtytul: "Stan rozliczeń składek na ubezpieczenia społeczne osoby prowadzącej pozarolniczą działalność",
    pdfImieNazwisko: "Imię i nazwisko",
    pdfPesel: "Numer PESEL",
    pdfRodzaj: "Rodzaj dokumentu",
    pdfPodpisTabeli: "Dane wydanego dokumentu",
    pdfPrzewijanie: "Dane dokumentu, przewiń w poziomie",
    pdfKolumnaPole: "Pole",
    pdfKolumnaWartosc: "Wartość",
    pdfPodsumowanieNiezaleganie: ({ data }: { data: string }) =>
      `Na dzień ${data} osoba wskazana powyżej nie ma zadłużenia z tytułu składek na ubezpieczenia społeczne.`,
    pdfPodsumowanieUmowa: ({ data }: { data: string }) =>
      `Na dzień ${data} osoba wskazana powyżej spłaca składki zgodnie z umową o spłacie, która obejmuje całe zadłużenie.`,
    pdfPodsumowanieOdmowa: ({ data }: { data: string }) =>
      `Na dzień ${data} osoba wskazana powyżej ma zadłużenie z tytułu składek na ubezpieczenia społeczne, dlatego ZUS odmawia wydania zaświadczenia o niezaleganiu w opłacaniu składek.`,
    pdfStrona: "Strona 1 z 1",
    nazwaPliku: ({ data, rodzaj }: { data: string; rodzaj: "o-niezaleganiu" | "o-wysokosci-zadluzenia" }) =>
      rodzaj === "o-niezaleganiu" ? `zaswiadczenie-o-niezaleganiu-${data}.pdf` : `decyzja-o-odmowie-${data}.pdf`,
    // koniec ViewContributionCertificate
  },
  ViewZusAccountData: {
    tytulStrony: "Dane z Twojego konta ZUS",
    naglowek: "Dane z Twojego konta ZUS",
    powrotInstrukcja: "Instrukcja sprawy",
    powrotPlan: "Plan rodziny",
    odczytajPonownie: "Pobierz dane ponownie",
    przejdzDoEzus: "Przejdź do eZUS",
    stanNaCzas: ({ czas }: { czas: string }) => `Stan na ${czas}`,
    wstep: "Dane pochodzą z Twojego konta ubezpieczonego w eZUS. Zmiany zgłosisz w eZUS.",
    brakDaty: "-",
    okresOd: ({ od }: { od: string }) => `od ${od}`,
    okresOdDo: ({ od, doDnia }: { od: string; doDnia: string }) => `od ${od} do ${doDnia}`,
    tytuly: {
      tytul: "Tytuły ubezpieczenia",
      podpis: "Tytuły ubezpieczenia",
      przewijanie: "Tabela tytułów ubezpieczenia",
      kolumny: {
        rodzaj: "Tytuł ubezpieczenia",
        od: "Data początku",
        do: "Data końca",
        chorobowe: "Ubezpieczenie chorobowe",
        okres: "Okres ubezpieczenia chorobowego",
      },
      rodzaje: {
        pracownik: "Pracownik",
        zleceniobiorca: "Zleceniobiorca",
        dzialalnosc: "Osoba prowadząca pozarolniczą działalność",
      },
      ubezpieczenie: { obowiazkowe: "Obowiązkowe", dobrowolne: "Dobrowolne", brak: "Brak" },
      tytulUstal: ({ data, nastepnyDzien }: { data: string; nastepnyDzien: string }) =>
        `Tytuł ustał ${data}. Od ${nastepnyDzien} nie masz tytułu do ubezpieczenia.`,
    },
    podstawy: {
      tytul: "Podstawy składek z ostatnich 12 miesięcy",
      tytulDo: ({ rodzaj, data }: { rodzaj: string; data: string }) => `${rodzaj} do ${data}`,
    },
    czlonkowie: {
      tytul: "Członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego",
      podpis: "Członkowie rodziny",
      przewijanie: "Tabela członków rodziny",
      kolumny: { imieINazwisko: "Imię i nazwisko", dataUrodzenia: "Data urodzenia" },
    },
    zasilki: {
      tytul: "Zasiłki z ostatnich 6 miesięcy",
      podpis: "Zasiłki",
      przewijanie: "Tabela zasiłków",
      kolumny: {
        rodzaj: "Rodzaj",
        okres: "Okres zasiłku",
        data: "Data wypłaty",
        kwota: "Kwota brutto",
        sposob: "Sposób wypłaty",
      },
      sposoby: { przelew: "Przelew", "przekaz-pocztowy": "Przekaz pocztowy" },
      rodzaje: {
        "zasilek-chorobowy": "Zasiłek chorobowy",
        "zasilek-macierzynski": "Zasiłek macierzyński",
        "zasilek-opiekunczy": "Zasiłek opiekuńczy",
        "zasilek-wyrownawczy": "Zasiłek wyrównawczy",
        "swiadczenie-rehabilitacyjne": "Świadczenie rehabilitacyjne",
      } as Readonly<Record<string, string>>,
    },
    ezla: {
      tytul: "Zaświadczenia lekarskie e-ZLA z ostatnich 12 miesięcy",
      podpis: "Zaświadczenia lekarskie e-ZLA",
      przewijanie: "Tabela zaświadczeń lekarskich e-ZLA",
      kolumny: {
        seria: "Seria i numer",
        wystawiono: "Data wystawienia",
        okres: "Okres niezdolności",
        kod: "Kod literowy",
        platnik: "Płatnik",
        rodzaj: "Rodzaj",
      },
      rodzaje: { choroba: "Niezdolność do pracy z powodu choroby", opieka: "Opieka nad członkiem rodziny" },
      zobacz: "Zobacz zaświadczenia e-ZLA",
    },
    stanRozliczen: {
      tytul: "Stan rozliczeń składek",
      kwota: "Kwota zadłużenia",
      brakZaleglosci: "Nie masz zaległości w opłacaniu składek.",
      dzien: "Dzień, na który ZUS ustala stan",
      uklad: "Układ ratalny",
      odroczenie: "Odroczenie terminu płatności",
      brak: "Brak",
      obowiazuje: "Obowiązuje",
      szczegoly: "Szczegóły stanu rozliczeń",
    },
    notatka: "Widzisz tylko dane swojego konta ubezpieczonego, a drugi rodzic tylko swoje. Sekcje, w których Twoje konto nie ma danych, pomijamy.",
    pusta: {
      tytul: "Dane z konta ZUS",
      opis: "Tu zobaczysz dane z Twojego konta ZUS: tytuły ubezpieczenia, podstawy składek, członków rodziny zgłoszonych do ubezpieczenia zdrowotnego, zasiłki, zaświadczenia lekarskie e-ZLA i stan rozliczeń składek.",
      wlasneDane:
        "Gdy ZUS nie pokazuje danych Twojego konta, wpisz w profilu rodziny formę zatrudnienia, ubezpieczenie chorobowe, płatnika zasiłku, zmianę zatrudnienia w ciąży i termin porodu. Przewodnik ułoży plan na podstawie Twoich odpowiedzi.",
      wpiszDane: "Wpisz dane w profilu rodziny",
    },
    wrocDoInstrukcji: "Wróć do instrukcji sprawy",
    wrocDoPlanu: "Wróć do planu rodziny",
    // koniec ViewZusAccountData
  },
  ViewZusQuestion: {
    tytulStrony: "Pytanie do ZUS",
    naglowek: "Pytanie do ZUS",
    wstepSprawy: ({ tytul }: { tytul: string }) =>
      `Zapytaj ZUS o sprawę ${tytul}. Do pytania dołączymy opis Twojej sytuacji z planu i profilu rodziny, więc nie musisz go powtarzać.`,
    wstepOgolny: "Zapytaj ZUS o swoją sytuację. Do pytania dołączymy opis Twojej sytuacji z profilu rodziny, więc nie musisz go powtarzać.",
    powrotInstrukcja: "Instrukcja sprawy",
    powrotAsystent: "Asystent",
    powrotPlan: "Plan rodziny",
    kartaPytania: "Twoje pytanie",
    etykietaTresci: "Treść pytania",
    podpowiedzTresci: "Napisz, o co chcesz zapytać ZUS. Opisu sytuacji nie musisz powtarzać, bo dołączymy go do pytania.",
    licznik: ({ liczba, maks }: { liczba: string; maks: string }) => `Liczba znaków: ${liczba} z ${maks}`,
    notatkaWysylki: "Wyślemy pytanie przez eZUS z Twojego konta. Odpowiedź ZUS zobaczysz w przewodniku i w eZUS.",
    wyslij: "Wyślij pytanie",
    wrocDoInstrukcji: "Wróć do instrukcji",
    wrocDoAsystenta: "Wróć do asystenta",
    wrocDoPlanu: "Wróć do planu rodziny",
    kartaKontekstu: "Dołączymy do pytania",
    naglowekSprawy: "Sprawa",
    naglowekProfilu: "Twój profil",
    notatkaKontekstu: "Dane ciąży i dziecka dołączamy tylko wtedy, gdy są w Twoim profilu.",
    notatkaOgolna: "Pytanie nie dotyczy sprawy z planu, więc dołączymy tylko dane z Twojego profilu.",
    brakDanychProfilu: "Twój profil rodziny nie ma jeszcze danych, które dołączymy do pytania.",
    pola: {
      idSprawy: "Identyfikator sprawy",
      tytulSprawy: "Tytuł sprawy",
      etap: "Etap",
      status: "Status",
      termin: "Termin",
      formaZatrudnienia: "Forma zatrudnienia",
      ubezpieczenieChorobowe: "Ubezpieczenie chorobowe",
      platnikZasilku: "Płatnik zasiłku",
      przewidywanyTerminPorodu: "Przewidywany termin porodu",
      dataPorodu: "Data porodu",
      liczbaDzieci: "Liczba dzieci",
      formaPrzyjecia: "Forma przyjęcia dziecka",
      dataPrzyjecia: "Data przyjęcia dziecka",
    },
    terminSzacowany: ({ data }: { data: string }) => `${data} (szacowany)`,
    platnikZNazwa: ({ platnik, nazwa }: { platnik: string; nazwa: string }) => `${platnik} (${nazwa})`,
    etykiety: {
      etapy: {
        ciaza: "Ciąża",
        "pierwsze-tygodnie": "Pierwsze tygodnie po porodzie",
        "urlopy-i-zasilek": "Urlopy i zasiłek macierzyński",
        "pieniadze-na-dziecko": "Świadczenia pieniężne na dziecko",
        "powrot-do-pracy": "Powrót do pracy",
      },
      formyZatrudnienia: {
        "umowa-o-prace": "Umowa o pracę",
        "umowa-zlecenia": "Umowa zlecenia",
        jdg: "Jednoosobowa działalność gospodarcza",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      ubezpieczenieChorobowe: {
        obowiazkowe: "Obowiązkowe",
        dobrowolne: "Dobrowolne",
        brak: "Brak",
      },
      platnicyZasilku: {
        zus: "ZUS",
        "platnik-skladek": "Płatnik składek",
        nieustalony: "Nieustalony",
        "brak-platnika": "Brak płatnika zasiłku",
      },
      pracodawca: "Pracodawca",
      formyPrzyjecia: {
        przysposobienie: "Przysposobienie",
        "rodzina-zastepcza-niezawodowa": "Rodzina zastępcza niezawodowa",
        "rodzina-zastepcza-zawodowa": "Rodzina zastępcza zawodowa",
      },
    },
    // Zakładki grup danych w karcie kontekstu
    zakladkiKontekstu: {
      etykieta: "Dane dołączane do pytania",
      sprawa: "Sprawa",
      profil: "Profil",
    },
    // koniec ViewZusQuestion
  },
  ViewZusQuestionSent: {
    tytulStrony: "Pytanie do ZUS wysłane",
    naglowek: "Pytanie do ZUS",
    powrotInstrukcja: "Instrukcja sprawy",
    powrotPlan: "Plan rodziny",
    kartaPytania: "Twoje pytanie",
    wyslano: "Wysłano",
    przezEzus: "Przez eZUS z Twojego konta",
    status: "Status",
    statusy: { wyslane: "Wysłane", odpowiedz: "Odpowiedź" },
    czekamyNaOdpowiedz: "Czekamy na odpowiedź ZUS",
    zusOdpowiedzial: ({ data }: { data: string }) => `ZUS odpowiedział ${data}`,
    sprawa: "Sprawa",
    pytanieOgolne: "Pytanie ogólne",
    pytanieOgolneOpis: "Bez sprawy z planu",
    trescPytania: "Treść pytania",
    kartaOdpowiedzi: "Odpowiedź ZUS",
    pustaOdpowiedz: "Tu zobaczysz odpowiedź ZUS. Gdy przyjdzie, powiadomimy Cię kanałami wybranymi w ustawieniach przypomnień.",
    ustawieniaPrzypomnien: "Ustawienia przypomnień",
    odpowiedzZ: ({ data }: { data: string }) => `Odpowiedź z ${data}`,
    odpowiedzWEzus: "Tę odpowiedź znajdziesz też w korespondencji w eZUS.",
    kartaKontekstu: "Dane dołączone do pytania",
    stanWChwiliWyslania: ({ czas }: { czas: string }) => `Stan w chwili wysłania: ${czas}`,
    wrocDoInstrukcji: "Wróć do instrukcji sprawy",
    przejdzDoPlanu: "Przejdź do planu rodziny",
    zadajKolejne: "Zadaj kolejne pytanie",
    brakPytania: "Nie znaleźliśmy tego pytania wśród pytań wysłanych z Twojego konta.",
    // Zakładki grup danych wysłanego pytania
    zakladki: {
      etykieta: "Szczegóły pytania",
      odpowiedz: "Odpowiedź",
      pytanie: "Pytanie",
      sprawa: "Sprawa",
      profil: "Profil",
    },
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
      "poronienie-bez-zaswiadczenia": "Poronienie",
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
    charytatywne:
      "Na liście są organizacje ze statusem organizacji pożytku publicznego w Krajowym Rejestrze Sądowym, które pomagają rodzinom w sytuacjach szczególnych.",
    statusOpp: ({ krs }: { krs: string }) => `Organizacja pożytku publicznego, KRS ${krs}.`,
    statusOppZWeryfikacja: ({ krs, data }: { krs: string; data: string }) =>
      `Organizacja pożytku publicznego, KRS ${krs}. Status w Krajowym Rejestrze Sądowym sprawdzony ${data}.`,
    // koniec ViewSupportOrganizations
  },
  ViewCalcMaternityInput: {
    tytulStrony: "Kalkulator zasiłku macierzyńskiego",
    naglowek: "Kalkulator zasiłku macierzyńskiego",
    // Sloty kalkulator-zasilku/_sloty (u21)
    daneZPrzykladowejSprawy: {
      wstep: ({ id }: { id: string }) =>
        `Uzupełniliśmy dane z przykładowej sprawy ${id}. W tym wyliczeniu zastępują dane z Twojego profilu rodziny. Plan rodziny zostaje bez zmian.`,
      wstepBezId: "Uzupełniliśmy dane z przykładowej sprawy. W tym wyliczeniu zastępują dane z Twojego profilu rodziny. Plan rodziny zostaje bez zmian.",
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
      // Tryb gościa: bez profilu rodziny i planu rodziny.
      wstepGosc: ({ id }: { id: string }) =>
        `Uzupełniliśmy dane z przykładowej sprawy ${id}. Sprawdź je, zmień, jeśli trzeba, i oblicz zasiłek.`,
      wstepGoscBezId: "Uzupełniliśmy dane z przykładowej sprawy. Sprawdź je, zmień, jeśli trzeba, i oblicz zasiłek.",
      // koniec daneZPrzykladowejSprawy
    },
    wstepProfil:
      "Uzupełniliśmy dane z profilu rodziny. Sprawdź je, zmień, jeśli trzeba, i oblicz zasiłek. Zmiany w kalkulatorze nie zmieniają profilu rodziny.",
    wstepNowyMatka:
      "Podaj zdarzenie i formę zatrudnienia obojga rodziców. Formę zatrudnienia matki uzupełniliśmy z Twojego konta ZUS.",
    wstepNowyDrugiRodzic:
      "Podaj zdarzenie i formę zatrudnienia obojga rodziców. Formę zatrudnienia drugiego rodzica uzupełniliśmy z Twojego konta ZUS.",
    wstepBezDanych: "Podaj zdarzenie i formę zatrudnienia obojga rodziców.",
    etykietaFormularza: "Dane do wyliczenia zasiłku",
    zrodlo: ({ zrodlo }: { zrodlo: string }) => `Źródło: ${zrodlo}`,
    zrodla: {
      "profil-rodziny": "profil rodziny",
      "konto-zus": "konto ZUS",
      "przykladowa-sprawa": "przykładowa sprawa",
      "wartosc-w-kalkulatorze": "wartość wpisana w kalkulatorze",
      "wartosc-domyslna": "wartość domyślna",
    },
    kartaZdarzenia: "Zdarzenie",
    zdarzenieLegenda: "Co chcesz policzyć?",
    zdarzeniePodpowiedz: "Po wyborze zdarzenia pokażemy pola z datami.",
    zdarzenia: {
      porod: "Poród, który nastąpił",
      "przewidywany-porod": "Przewidywany poród",
      przyjecie: "Przyjęcie dziecka na wychowanie",
    },
    dataPorodu: "Data porodu",
    dataPoroduPodpowiedz: "W formacie DD.MM.RRRR, dzisiaj albo wcześniej.",
    przewidywanyTermin: "Przewidywany termin porodu",
    przewidywanyTerminPodpowiedz: "W formacie DD.MM.RRRR, dzisiaj albo później.",
    liczbaDzieci: "Liczba dzieci urodzonych przy jednym porodzie",
    liczbaDzieciPrzyjetych: "Liczba dzieci przyjętych jednocześnie",
    liczbyDzieci: { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5 i więcej" },
    zaZyciemLegenda: "Czy masz zaświadczenie „Za życiem”?",
    zaZyciemPodpowiedz: "Z zaświadczeniem urlop rodzicielski jest dłuższy i trwa 65 tygodni przy jednym dziecku.",
    tak: "Tak",
    nie: "Nie",
    formaPrzyjeciaLegenda: "Forma przyjęcia dziecka",
    formyPrzyjecia: {
      przysposobienie: "Przysposobienie z wnioskiem do sądu",
      "rodzina-zastepcza-niezawodowa": "Rodzina zastępcza niezawodowa",
      "rodzina-zastepcza-zawodowa": "Rodzina zastępcza zawodowa",
    },
    dataPrzyjecia: "Data przyjęcia dziecka",
    dataPrzyjeciaPodpowiedz: ({ data }: { data: string }) => `W formacie DD.MM.RRRR, najpóźniej ${data}.`,
    dataUrodzeniaDziecka: "Data urodzenia dziecka",
    dataUrodzeniaDzieckaPodpowiedz: "W formacie DD.MM.RRRR, najpóźniej w dniu przyjęcia.",
    dataUprawomocnienia: "Data uprawomocnienia postanowienia o przysposobieniu",
    dataUprawomocnieniaPodpowiedz:
      "Nieobowiązkowo, w formacie DD.MM.RRRR. Od tego dnia liczymy 12 miesięcy na urlop ojcowski, najpóźniej do ukończenia przez dziecko 14 lat. Bez daty liczymy 12 miesięcy od dnia przyjęcia.",
    dataUrodzeniaKolejnego: ({ numer }: { numer: string }) => `Data urodzenia ${numer}. przyjętego dziecka`,
    dataUrodzeniaKolejnegoPodpowiedz:
      "W formacie DD.MM.RRRR, najpóźniej w dniu przyjęcia. Wiek graniczny sprawdzamy dla każdego dziecka. Bez daty przyjmujemy datę urodzenia pierwszego dziecka.",
    odroczenieLegenda: "Czy dziecko ma odroczony obowiązek szkolny?",
    odroczeniePodpowiedz: "Przy odroczeniu urlop przysługuje do ukończenia przez dziecko 10 lat.",
    kartaWczesniactwa: "Wcześniactwo i pobyt dziecka w szpitalu",
    wczesniactwoOpis:
      "Zaznacz, jeśli dziecko urodziło się przedwcześnie albo przebywało w szpitalu po porodzie. Może Ci przysługiwać uzupełniający urlop macierzyński.",
    wczesniactwoOpisMnoga:
      "Zaznacz, jeśli dziecko urodziło się przedwcześnie albo przebywało w szpitalu po porodzie. Przy kilkorgu dzieciach podaj masę dziecka o najniższej masie i dni pobytu dziecka, które przebywało w szpitalu najdłużej.",
    wczesniactwoPole: "Dziecko urodziło się przedwcześnie albo przebywało w szpitalu",
    tydzienCiazy: "Tydzień ciąży w dniu porodu",
    tydzienCiazyPodpowiedz: "Od 22 do 44.",
    masa: "Masa urodzeniowa (g)",
    masaPodpowiedz: "Od 300 do 7000 gramów.",
    dniPobytu: "Liczba dni pobytu dziecka w szpitalu",
    dniPobytuPodpowiedz: {
      a: "Przy urodzeniu do 27. tygodnia ciąży albo z masą do 1000 g: od 0 do 105 dni w ciągu 15 tygodni po porodzie.",
      b: "Przy urodzeniu od 28. do 36. tygodnia ciąży: od 0 do 56 dni w ciągu 8 tygodni po porodzie.",
      c: "Przy urodzeniu od 37. tygodnia ciąży: od 0 do 52 dni od 5. dnia do końca 8. tygodnia po porodzie.",
      brak: "Podaj tydzień ciąży i masę urodzeniową, a pokażemy zakres dni.",
    },
    pierwszyDzienPobytu: "Dzień życia dziecka, w którym zaczął się pobyt w szpitalu",
    pierwszyDzienPobytuPodpowiedz:
      "Od 1 do 56, dzień porodu to 1. dzień życia. Uzupełniający urlop przysługuje przy pobycie co najmniej 2 kolejnych dni rozpoczętym między 5. a 28. dniem życia.",
    kartaStraty: "Strata dziecka",
    strataOpis: "Jeśli dziecko urodziło się martwe albo zmarło, zaznacz to pole. Policzymy okres zasiłku dla tej sytuacji.",
    strataPole: "Doszło do straty dziecka",
    rodzajStratyLegenda: "Rodzaj straty",
    rodzajeStraty: {
      "martwe-urodzenie": "Urodzenie martwego dziecka",
      poronienie: "Poronienie potwierdzone zaświadczeniem o martwym urodzeniu",
      "zgon-dziecka": "Zgon dziecka",
    },
    dataZgonu: "Data zgonu dziecka",
    dataZgonuPodpowiedz: "W formacie DD.MM.RRRR, od dnia porodu do dzisiaj.",
    liczbaDzieciStraty: "Liczba dzieci, których dotyczy strata",
    liczbaDzieciStratyPodpowiedz: ({ maks }: { maks: string }) => `Od 1 do ${maks}.`,
    kartaForm: "Forma zatrudnienia rodziców",
    formyOpisPorod:
      "Podaj formę zatrudnienia i ubezpieczenie chorobowe w dniu porodu. Zasiłek macierzyński przysługuje osobom objętym ubezpieczeniem chorobowym.",
    formyOpisPrzyjecie:
      "Podaj formę zatrudnienia i ubezpieczenie chorobowe w dniu przyjęcia dziecka. Zasiłek macierzyński przysługuje osobom objętym ubezpieczeniem chorobowym.",
    matka: "Matka",
    rodzicPrzyjmujacy: "Rodzic, który przyjął dziecko",
    drugiRodzic: "Drugi rodzic",
    zImieniem: ({ rola, imie }: { rola: string; imie: string }) => `${rola}: ${imie}`,
    wybierz: "Wybierz",
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia-z-dobrowolnym": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      "umowa-zlecenia-bez-dobrowolnego": "Umowa zlecenia bez dobrowolnego ubezpieczenia chorobowego",
      "jdg-z-dobrowolnym": "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
      "jdg-bez-dobrowolnego": "Jednoosobowa działalność gospodarcza bez dobrowolnego ubezpieczenia chorobowego",
      "umowa-o-prace-ustala-w-ciazy":
        "Umowa o pracę, która ustała w ciąży z powodu upadłości, likwidacji albo śmierci pracodawcy albo z naruszeniem przepisów potwierdzonym wyrokiem sądu",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "brak-drugiego-rodzica": "Rodzina bez drugiego rodzica",
    },
    oblicz: "Oblicz zasiłek",
    wrocDoPlanu: "Wróć do planu rodziny",
    asideZrodla: "Skąd są dane",
    asideZrodlaPozycje: [
      { tytul: "Profil rodziny", opis: "Dane zapisane w Twoim profilu rodziny." },
      { tytul: "Konto ZUS", opis: "Dane z Twojego konta ZUS i z konta drugiego rodzica, jeśli dołączył do planu rodziny." },
      { tytul: "Przykładowa sprawa", opis: "Dane z przykładowej sprawy ZUS, którą otwierasz z listy przykładowych spraw." },
      { tytul: "Wartość wpisana w kalkulatorze", opis: "Wartość, którą zmieniasz tutaj. Nie zmienia profilu rodziny." },
    ],
    asideZrodlaNotatka: "Podstawę wymiaru zasiłku każdego rodzica sprawdzisz i zmienisz przy wyniku.",
    asidePrzyjecie: "Przyjęcie dziecka na wychowanie",
    asidePrzyjeciePozycje: [
      { tytul: "Przysposobienie z wnioskiem do sądu", opis: "Urlop na warunkach urlopu macierzyńskiego do ukończenia przez dziecko 14 lat." },
      { tytul: "Rodzina zastępcza niezawodowa", opis: "Urlop do ukończenia przez dziecko 7 lat, a przy odroczonym obowiązku szkolnym 10 lat." },
      { tytul: "Rodzina zastępcza zawodowa", opis: "Bez urlopu na warunkach urlopu macierzyńskiego i bez zasiłku za ten okres." },
    ],
    asidePrzyjecieNotatka: "Początek urlopu wybierzesz przy wyniku, od dnia przyjęcia do 21. dnia po nim.",
    asideUzupelniajacy: "Uzupełniający urlop macierzyński",
    asideUzupelniajacyPozycje: [
      {
        tytul: "Do 27. tygodnia ciąży albo do 1000 g",
        opis: "Tydzień urlopu za każdy rozpoczęty tydzień pobytu w szpitalu w ciągu 15 tygodni po porodzie.",
      },
      {
        tytul: "Od 28. do 36. tygodnia ciąży, powyżej 1000 g",
        opis: "Tydzień urlopu za każdy rozpoczęty tydzień pobytu w ciągu 8 tygodni po porodzie.",
      },
      {
        tytul: "Od 37. tygodnia ciąży",
        opis: "Tydzień urlopu za każdy rozpoczęty tydzień pobytu od 5. dnia do końca 8. tygodnia po porodzie, gdy pobyt trwa co najmniej 2 dni.",
      },
    ],
    wiek: ({ lata }: { lata: string }) => `${lata} lat`,
    // Części formularza (?czesc=N): nazwy w „Krok X z N” i tytuły kart części.
    czescSprawy: "Dane z przykładowej sprawy",
    kartaDatPrzyjecia: "Daty przyjęcia i urodzenia dziecka",
    kartaDzieci: "Dzieci",
    // Tryb gościa: kalkulator bez konta ZUS i profilu rodziny.
    wstepGosc: "Podaj zdarzenie i formę zatrudnienia obojga rodziców. Liczymy na danych, które wpiszesz w kalkulatorze.",
    goscKomunikat: "Liczysz bez logowania. Kalkulator korzysta z danych wpisanych tutaj i z przykładowej sprawy.",
    goscZaloguj: "Zaloguj się, żeby uzupełnić dane z konta ZUS i profilu rodziny",
    asideZrodlaPozycjeGosc: [
      { tytul: "Wartość wpisana w kalkulatorze", opis: "Wartość, którą wpisujesz albo zmieniasz tutaj." },
      { tytul: "Przykładowa sprawa", opis: "Dane z przykładowej sprawy ZUS, którą otwierasz z listy przykładowych spraw." },
      { tytul: "Wartość domyślna", opis: "Wartość, od której kalkulator zaczyna, dopóki jej nie zmienisz." },
    ],
    asideZrodlaNotatkaGosc: "Podstawę wymiaru zasiłku każdego rodzica wpiszesz przy wyniku.",
    // koniec ViewCalcMaternityInput
  },
  ViewCalcMaternityResult: {
    tytulStrony: "Wynik kalkulatora zasiłku macierzyńskiego",
    naglowek: "Wynik kalkulatora zasiłku macierzyńskiego",
    // Sloty kalkulator-zasilku/wynik/_sloty (u20, u20, u21)
    akcjeUrlopow: {
      podzielUrlopy: "Podziel urlopy",
      polaczZPraca: "Połącz urlop rodzicielski z pracą",
      etykietaAkcji: "Podział urlopów i łączenie z pracą",
      powrotTytul: "Powrót do pracy",
      dataPowrotu: "Data powrotu do pracy",
      zmienDate: "Zmień datę powrotu",
      zmienDateRodzica: ({ imieINazwisko }: { imieINazwisko: string }) => `Zmień datę powrotu do pracy: ${imieINazwisko}`,
      brakDatyPowrotu: "Ten rodzic nie ma okresów zasiłku w wyliczeniu.",
      okresyPracyBrak: "Okresy pracy między urlopami: brak.",
      okresPracy: ({ okresy }: { okresy: string }) => `Okres pracy między urlopami: ${okresy}.`,
      okresyPracy: ({ okresy }: { okresy: string }) => `Okresy pracy między urlopami: ${okresy}.`,
      okres: ({ od, do_ }: { od: string; do_: string }) => `od ${od} do ${do_}`,
      laczenie: ({ od, do_, wymiar }: { od: string; do_: string; wymiar: string }) =>
        `Łączenie urlopu rodzicielskiego z pracą: od ${od} do ${do_}, ${wymiar} etatu.`,
      uprawnienia: "Uprawnienia po powrocie do pracy",
      bezUprawnien: "Uprawnienia po powrocie do pracy z tej listy przysługują rodzicowi na umowie o pracę albo z dobrowolnym ubezpieczeniem chorobowym.",
      tytulyUprawnien: {
        K20: "Przerwy na karmienie",
        K21: "Dwa dni opieki nad dzieckiem w roku",
        K22: "Zasiłek opiekuńczy na dziecko",
        K23: "Urlop wychowawczy",
      },
      warunkiUprawnien: {
        K20: "Matka pracuje na umowie o pracę.",
        K21: "Rodzic pracuje na umowie o pracę.",
        K22: "Rodzic pracuje na umowie o pracę albo ma dobrowolne ubezpieczenie chorobowe.",
        K23: "Rodzic pracuje na umowie o pracę.",
      },
      kanalyUprawnien: {
        K20: "Pracodawca.",
        K21: "Pracodawca.",
        K22: "Pracodawca albo ZUS, wniosek Z-15 w eZUS.",
        K23: "Pracodawca.",
      },
      matka: "Matka",
      drugiRodzic: "Drugi rodzic",
      // koniec akcjeUrlopow
    },
    zapisScenariusza: {
      tytul: "Co dalej",
      opis: "Zapisz scenariusz, żeby porównać go z innymi i zapisać w planie rodziny.",
      opisKonta: "Zapisany scenariusz zostaje w wynikach kalkulacji Twojego konta.",
      zapisz: "Zapisz scenariusz",
      porownaj: "Porównaj scenariusze",
      przeniesZam: ({ kto }: { kto: string }) => `Przenieś do wniosku ZAM: ${kto}`,
      przeniesUrlop: ({ kto }: { kto: string }) => `Przenieś do wniosku o urlop: ${kto}`,
      scenariusz: ({ numer }: { numer: string }) => `Scenariusz ${numer}`,
      zapisanyRodzina: ({ data, kto, wariant }: { data: string; kto: string; wariant: string }) =>
        `Zapisany ${data} z konta ${kto} w wynikach kalkulacji rodziny. Zawiera dane do wyliczenia ze źródłem każdej wartości, podstawy wymiaru, okresy urlopów obojga rodziców, wariant ${wariant}, daty powrotu do pracy i harmonogram wypłat.`,
      zapisanyKonto: ({ data, wariant }: { data: string; wariant: string }) =>
        `Zapisany ${data} w wynikach kalkulacji Twojego konta. Zawiera dane do wyliczenia ze źródłem każdej wartości, podstawy wymiaru, okresy urlopów obojga rodziców, wariant ${wariant}, daty powrotu do pracy i harmonogram wypłat.`,
      wybranyWariant: "Wybrany wariant spraw w planie rodziny",
      opisK07K08: ({ wariant, macierzynski, rodzicielski }: { wariant: string; macierzynski: string; rodzicielski: string }) =>
        `Wariant ${wariant}. Urlop macierzyński ${macierzynski}, urlop rodzicielski matki ${rodzicielski}.`,
      opisK31K32: ({ wariant, macierzynski, rodzicielski }: { wariant: string; macierzynski: string; rodzicielski: string }) =>
        `Wariant ${wariant}. Urlop na warunkach urlopu macierzyńskiego ${macierzynski}, urlop rodzicielski ${rodzicielski}.`,
      opisK09: ({ okresy, dni }: { okresy: string; dni: string }) => `${okresy}, ${dni} dni.`,
      opisK10: ({ tygodnie, od }: { tygodnie: string; od: string }) => `${tygodnie} od ${od}.`,
      opisK10BezCzesci: "Drugi rodzic nie ma w scenariuszu urlopu rodzicielskiego.",
      opisK11: ({ tygodnie }: { tygodnie: string }) => `Wymiar uzupełniającego urlopu macierzyńskiego: ${tygodnie}.`,
      opisK37: ({ okres, wymiar }: { okres: string; wymiar: string }) => `Łączenie z pracą ${okres}, ${wymiar} etatu.`,
      okres: ({ od, do_ }: { od: string; do_: string }) => `od ${od} do ${do_}`,
      okresWielka: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}`,
      brakOkresu: "bez okresu w scenariuszu",
      zobaczPlan: "Zobacz plan rodziny",
      matka: "matka",
      rodzicPrzyjmujacy: "rodzic, który przyjął dziecko",
      drugiRodzic: "drugi rodzic",
      warianty: (w: "81-5" | "100-70", st: { s815: string; s100: string; s70: string }) => (w === "81-5" ? st.s815 : `${st.s100} i ${st.s70}`),
      // Tryb gościa: scenariusze w tej karcie przeglądarki, plan rodziny i wnioski po zalogowaniu.
      opisGosc: "Zapisany scenariusz zostaje w tej karcie przeglądarki do jej zamknięcia. Porównasz go z innymi scenariuszami z tej karty.",
      zapisanyGosc: ({ data, wariant }: { data: string; wariant: string }) =>
        `Zapisany ${data} w tej karcie przeglądarki. Zawiera dane do wyliczenia ze źródłem każdej wartości, podstawy wymiaru, okresy urlopów obojga rodziców, wariant ${wariant}, daty powrotu do pracy i harmonogram wypłat.`,
      komunikatGosc:
        "Zapisaliśmy scenariusz w tej karcie przeglądarki. Po zalogowaniu w tej karcie przeniesiemy ostatni zapisany scenariusz do Twoich wyników kalkulacji.",
      komunikatGoscSprawy:
        "Zapisaliśmy scenariusz przykładowej sprawy w tej karcie przeglądarki. Po zalogowaniu w tej karcie przeniesiemy ostatni zapisany scenariusz do Twoich wyników kalkulacji.",
      zalogujPlan: "Zaloguj się, żeby zapisać scenariusz w planie rodziny",
      zalogujPlanIWniosek: "Zaloguj się, żeby zapisać scenariusz w planie rodziny i przenieść go do wniosku",
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
        `Daty początku i końca są zgodne, gdy są równe. Kwoty są zgodne, gdy różnią się najwyżej o ${tolerancja}.`,
      notaRoznicy: ({ tolerancja }: { tolerancja: string }) =>
        `Kwoty różnią się o więcej niż ${tolerancja}. Sprawdź dane sprawy i zastosowane reguły.`,
      okresyTytul: "Okres zasiłku i wypłaty według danych sprawy",
      podpisOkresow: "Okresy zasiłku, stawki i wypłaty wyliczone z danych sprawy",
      przewijanieOkresow: "Tabela okresów zasiłku, przewiń w poziomie",
      kolumnyOkresow: { urlop: "Urlop", od: "Od", do: "Do", dni: "Dni", stawka: "Stawka", miesiecznie: "Miesięcznie", suma: "Suma" },
      podstawa: ({ kwota }: { kwota: string }) => `Podstawa wymiaru ${kwota}, źródło: przykładowa sprawa.`,
      coDalej: "Co dalej",
      zapisano: "Zapisaliśmy wynik w wynikach kalkulacji. Podstawa wymiaru pochodzi z przykładowej sprawy. Twój plan rodziny, w tym wariant zasiłku wybrany przy sprawie Wniosek o zasiłek macierzyński, zostaje bez zmian.",
      poprawOpis: "Sprawdź dane sprawy, które wpływają na podstawę wymiaru i okres zasiłku, i popraw je na ekranie danych sprawy.",
      wrocDoWeryfikacji: "Wróć do weryfikacji sprawy",
      wybierzInna: "Wybierz inną sprawę",
      poprawDane: "Popraw dane sprawy",
      zapisanoGosc: "Zapisaliśmy wynik w tej karcie przeglądarki. Podstawa wymiaru pochodzi z przykładowej sprawy.",
      // koniec porownanieZRozstrzygnieciem
    },
    powrot: "Dane do wyliczenia",
    zastosowaneReguly: "Zastosowane reguły",
    kartaDanych: "Dane do wyliczenia",
    zmienDane: "Zmień dane",
    etykietyDanych: {
      zdarzenie: "Zdarzenie",
      dataPorodu: "Data porodu",
      przewidywanyTermin: "Przewidywany termin porodu",
      formaPrzyjecia: "Forma przyjęcia dziecka",
      dataPrzyjecia: "Data przyjęcia dziecka",
      dataUrodzeniaDziecka: "Data urodzenia dziecka",
      odroczenie: "Odroczony obowiązek szkolny",
      liczbaDzieci: "Liczba dzieci",
      zaZyciem: "Zaświadczenie „Za życiem”",
      wczesniactwo: "Wcześniactwo albo pobyt w szpitalu",
      strata: "Strata dziecka",
    },
    wczesniactwoOpis: ({ tydzien, masa, dni }: { tydzien: string; masa: string; dni: string }) =>
      `Tak: ${tydzien}. tydzień ciąży, ${masa} g, ${dni} dni w szpitalu`,
    strataOpis: ({ rodzaj, data }: { rodzaj: string; data: string }) => (data ? `${rodzaj}, ${data}` : rodzaj),
    kartaPodstawy: "Podstawa wymiaru zasiłku",
    opisPodstawyZus: "Średnia podstaw składek z 12 miesięcy przed miesiącem powstania prawa, pomniejszona o 13,71%.",
    opisPodstawyWpisanej: "Kwota wpisana w kalkulatorze.",
    opisPodstawySprawy: "Kwota z przykładowej sprawy ZUS.",
    brakPodstawy: "Wpisz podstawę wymiaru, żeby policzyć wypłaty.",
    zrodlaPodstawy: {
      "konto-zus": "konto ZUS",
      "wartosc-wpisana-przez-rodzica": "wartość wpisana przez rodzica",
      "przykladowa-sprawa": "przykładowa sprawa",
    },
    sprawdzPodstawe: "Sprawdź albo zmień podstawę",
    sprawdzPodstaweRodzica: ({ rodzic }: { rodzic: string }) => `Sprawdź albo zmień podstawę: ${rodzic}`,
    kartaWariantu: "Wariant zasiłku",
    wariantLegenda: "Wybierz wariant",
    warianty: {
      "100-70": {
        tytul: ({ s100, s70 }: { s815: string; s100: string; s70: string }) => `${s100} i ${s70}`,
        opis: ({ s100, s70 }: { s815: string; s100: string; s70: string }) => `${s100} za urlop macierzyński i urlop ojcowski, ${s70} za urlop rodzicielski`,
      },
      "81-5": {
        tytul: ({ s815 }: { s815: string; s100: string; s70: string }) => s815,
        opis: ({ s815, s70 }: { s815: string; s100: string; s70: string }) => `${s815} za urlop macierzyński i urlop rodzicielski matki, ${s70} za 9 tygodni drugiego rodzica`,
      },
    },
    opisyWariantowPrzyjecie: {
      "100-70": ({ s100, s70 }: { s815: string; s100: string; s70: string }) =>
        `${s100} za urlop na warunkach urlopu macierzyńskiego i urlop ojcowski, ${s70} za urlop rodzicielski`,
      "81-5": ({ s815, s70 }: { s815: string; s100: string; s70: string }) =>
        `${s815} za urlop na warunkach urlopu macierzyńskiego i urlop rodzicielski rodzica, który przyjął dziecko, ${s70} za 9 tygodni drugiego rodzica`,
    },
    razemWariant: ({ kwota }: { kwota: string }) => `Oboje rodzice razem: ${kwota}`,
    terminWariantuPorod: ({ data, s815 }: { data: string; s815: string }) => `Wariant ${s815} możesz wybrać do ${data}, czyli 21. dnia po dniu porodu.`,
    terminWariantuPrzewidywany: ({ data, s815 }: { data: string; s815: string }) =>
      `Wariant ${s815} wybierzesz we wniosku do 21. dnia po dniu porodu. Przy przewidywanym terminie to ${data}.`,
    terminWariantuPrzyjecie: ({ data, s815 }: { data: string; s815: string }) =>
      `Wariant ${s815} możesz wybrać do ${data}, czyli 21. dnia po dniu przyjęcia dziecka.`,
    kartaOkresow: "Okresy urlopów i wypłaty",
    tygodniePrzed: "Część urlopu macierzyńskiego przed porodem (tygodnie)",
    tygodniePrzedPodpowiedz: "Od 0 do 6 tygodni.",
    poczatekNaWarunkach: "Data początku urlopu na warunkach urlopu macierzyńskiego",
    poczatekNaWarunkachPodpowiedz: ({ od, do: doDnia }: { od: string; do: string }) =>
      `W formacie DD.MM.RRRR, od ${od} do ${doDnia}. Puste pole oznacza dzień przyjęcia.`,
    przelicz: "Przelicz",
    uzupelniajacyLegenda: "Kto korzysta z uzupełniającego urlopu macierzyńskiego?",
    uzupelniajacyPodpowiedz: "Korzysta jeden rodzic, jednorazowo i w całości.",
    kolumny: {
      rodzaj: "Rodzaj urlopu",
      od: "Od",
      do: "Do",
      dni: "Liczba dni",
      stawka: "Stawka",
      miesiecznie: "Miesięcznie",
      zaOkres: "Za okres",
    },
    rodzajeUrlopu: {
      macierzynski: "Urlop macierzyński",
      "czesc-przed-porodem": "Część urlopu macierzyńskiego przed porodem",
      rodzicielski: "Urlop rodzicielski",
      uzupelniajacy: "Uzupełniający urlop macierzyński",
      ojcowski: "Urlop ojcowski",
      "na-warunkach-macierzynskiego": "Urlop na warunkach urlopu macierzyńskiego",
      "przejety-macierzynski": "Przejęta część urlopu macierzyńskiego",
      "laczenie-z-praca": "Urlop rodzicielski łączony z pracą",
      "wydluzenie-rodzicielskiego": "Wydłużenie urlopu rodzicielskiego",
    },
    zTygodniami: ({ rodzaj, tygodnie }: { rodzaj: string; tygodnie: string }) => `${rodzaj}, ${tygodnie}`,
    tygodnie: ({ liczba }: { liczba: number }) =>
      `${liczba} ${liczba === 1 ? "tydzień" : liczba % 10 >= 2 && liczba % 10 <= 4 && (liczba % 100 < 12 || liczba % 100 > 14) ? "tygodnie" : "tygodni"}`,
    podwyzszenie: "Podwyższenie do kwoty świadczenia rodzicielskiego",
    wyrownanie: ({ s100 }: { s100: string }) => `Wyrównanie zasiłku za urlop macierzyński do ${s100}, jednorazowo, na wniosek`,
    sumaMatki: "Suma matki",
    sumaRodzicaPrzyjmujacego: "Suma rodzica, który przyjął dziecko",
    sumaDrugiego: "Suma drugiego rodzica",
    brakOkresow: "Brak okresów urlopów z zasiłkiem.",
    przewijanieOkresow: ({ rodzic }: { rodzic: string }) => `Okresy urlopów: ${rodzic}`,
    podsumowanieTygodni: ({
      razem,
      matka,
      drugi,
      przepadajace,
    }: {
      razem: string;
      matka: string;
      drugi: string;
      przepadajace: string;
    }) =>
      `Urlop rodzicielski obojga rodziców: ${razem}. Matka: ${matka}, drugi rodzic: ${drugi}. Tygodnie przepadające: ${przepadajace}.`,
    podsumowanieTygodniPrzyjecie: ({ razem, matka, drugi, przepadajace }: { razem: string; matka: string; drugi: string; przepadajace: string }) =>
      `Urlop rodzicielski obojga rodziców: ${razem}. Rodzic, który przyjął dziecko: ${matka}, drugi rodzic: ${drugi}. Tygodnie przepadające: ${przepadajace}.`,
    bezUzupelniajacego:
      "Uzupełniający urlop macierzyński nie przysługuje, bo w danych nie ma wcześniactwa ani pobytu dziecka w szpitalu.",
    zUzupelniajacym: ({ data }: { data: string }) =>
      `Uzupełniający urlop macierzyński zaczyna się dzień po końcu urlopu macierzyńskiego. Urlop rodzicielski matki zaczyna się po nim, ${data}.`,
    sumaObojga: "Suma obojga rodziców",
    kartaHarmonogramu: "Harmonogram wypłat",
    harmonogramOpis: "Kwoty za każdy miesiąc kalendarzowy, przed potrąceniem zaliczki na podatek dochodowy.",
    harmonogramOpisPodwyzszenie:
      "Kwoty za miesiące kalendarzowe, przed potrąceniem zaliczki na podatek dochodowy. Gdy zasiłek za urlop macierzyński i rodzicielski w miesiącu jest niższy niż kwota świadczenia rodzicielskiego, podwyższamy go do tej kwoty.",
    harmonogramPodpis: "Harmonogram miesięcznych wypłat obojga rodziców",
    harmonogramPrzewijanie: "Tabela harmonogramu wypłat",
    miesiac: "Miesiąc",
    razem: "Razem",
    suma: "Suma",
    wyrownanieWiersz: ({ s100 }: { s100: string }) => `Wyrównanie do ${s100}, na wniosek`,
    brak: "-",
    kartaZasilkuPoStracie: "Zasiłek macierzyński",
    okresPoStracie: ({ tygodnie, od, do: doDnia, s100 }: { tygodnie: string; od: string; do: string; s100: string }) =>
      `Przysługuje Ci urlop macierzyński przez ${tygodnie} od dnia porodu, od ${od} do ${doDnia}. Zasiłek wynosi ${s100} podstawy wymiaru.`,
    zasilekZaDni: ({ dni }: { dni: string }) => `Zasiłek za ${dni} dni`,
    miesiecznieZaliczka: ({ kwota }: { kwota: string }) => `Miesięcznie ${kwota}, przed potrąceniem zaliczki na podatek`,
    bezRodzicielskiegoPoStracie:
      "W tej sytuacji nie przysługuje urlop rodzicielski ani urlop ojcowski, dlatego wynik nie zawiera okresów drugiego rodzica.",
    kartaWsparcia: "Wsparcie",
    wsparcieOpis:
      "Organizacje, które pomagają rodzicom po stracie dziecka, oferują bezpłatne wsparcie psychologiczne, porady prawne i telefon wsparcia.",
    zobaczOrganizacje: "Zobacz organizacje wsparcia",
    // Tryb gościa: wynik bez konta ZUS i profilu rodziny.
    goscKomunikat: "Liczysz bez logowania. Wynik opiera się na danych podanych w kalkulatorze.",
    goscZaloguj: "Zaloguj się, żeby uzupełnić podstawę wymiaru z konta ZUS i zapisać wynik w planie rodziny",
    zalogujOrganizacje: "Zaloguj się, żeby zobaczyć organizacje wsparcia",
    // koniec ViewCalcMaternityResult
  },
  ViewCalcScenarioCompare: {
    tytulStrony: "Porównanie scenariuszy",
    naglowek: "Porównanie scenariuszy",
    powrot: "Wynik kalkulatora",
    wstepPorod: ({ data, dzieci }: { data: string; dzieci: string }) => `Poród ${data}, ${dzieci}.`,
    wstepPrzewidywany: ({ data, dzieci }: { data: string; dzieci: string }) => `Przewidywany termin porodu ${data}, ${dzieci}.`,
    wstepPrzyjecie: ({ data, dzieci }: { data: string; dzieci: string }) => `Przyjęcie dziecka na wychowanie ${data}, ${dzieci}.`,
    listaTytul: "Zapisane scenariusze",
    legenda: "Wybierz od 2 do 3 scenariuszy",
    opisRodziny: "Widzisz scenariusze zapisane przez oba konta rodziny.",
    opisKonta: "Widzisz scenariusze zapisane w wynikach kalkulacji Twojego konta.",
    opcja: ({ numer, wariant }: { numer: string; wariant: string }) => `Scenariusz ${numer}, wariant ${wariant}`,
    opcjaZPowrotem: ({ numer, wariant, data }: { numer: string; wariant: string; data: string }) =>
      `Scenariusz ${numer}, wariant ${wariant}, powrót matki do pracy ${data}`,
    opisOpcji: ({ data, konto }: { data: string; konto: string }) => `Zapisany ${data}, konto ${konto}.`,
    wybranyWPlanieOpis: "Wybrany w planie rodziny.",
    przykladowaSprawaOpis: "Scenariusz przykładowej sprawy.",
    porownaj: "Porównaj",
    porownanieTytul: "Porównanie",
    podpisTabeli: "Porównanie zapisanych scenariuszy",
    etykietaPrzewijania: "Tabela porównania scenariuszy, przewijana w poziomie",
    kolumnaPozycja: "Pozycja",
    kolumnaScenariusz: ({ numer }: { numer: string }) => `Scenariusz ${numer}`,
    wierszWariant: "Wariant zasiłku",
    wierszMacierzynski: ({ kto }: { kto: string }) => `Urlop macierzyński: ${kto}`,
    wierszPrzejety: ({ kto }: { kto: string }) => `Przejęta część urlopu macierzyńskiego: ${kto}`,
    wierszRodzicielski: ({ kto }: { kto: string }) => `Urlop rodzicielski: ${kto}`,
    wierszOjcowski: ({ kto }: { kto: string }) => `Urlop ojcowski: ${kto}`,
    wierszPowrot: ({ kto }: { kto: string }) => `Data powrotu do pracy: ${kto}`,
    wierszPrzepadajace: "Tygodnie przepadające",
    wierszNiewykorzystane: "Tygodnie niewykorzystane w scenariuszu",
    wierszSuma: ({ kto }: { kto: string }) => `Suma: ${kto}`,
    wierszSumaObojga: "Suma obojga rodziców",
    wierszPlan: "Plan rodziny",
    okres: ({ od, do_ }: { od: string; do_: string }) => `od ${od} do ${do_}`,
    brakWartosci: "-",
    zapiszWPlanie: "Zapisz w planie",
    zapiszWPlanieScenariusza: ({ numer }: { numer: string }) => `Zapisz scenariusz ${numer} w planie rodziny`,
    wybranyWPlanie: "Wybrany w planie rodziny",
    notatkaPlanu: "Scenariusz zapisany w planie zastępuje wariant wybrany wcześniej w sprawach planu rodziny, których dotyczy: wniosek o urlop macierzyński i rodzicielski u pracodawcy albo wniosek o zasiłek macierzyński, urlop ojcowski, urlop rodzicielski drugiego rodzica, uzupełniający urlop macierzyński, wniosek o urlop na warunkach urlopu macierzyńskiego u pracodawcy albo wniosek o zasiłek macierzyński po przyjęciu dziecka oraz łączenie urlopu rodzicielskiego z pracą.",
    pusta: "Nie masz jeszcze zapisanych scenariuszy. Zapisz scenariusz na wyniku kalkulatora, żeby go porównać.",
    przejdzDoKalkulatora: "Przejdź do kalkulatora zasiłku",
    matka: "matka",
    drugiRodzic: "drugi rodzic",
    warianty: (w: "81-5" | "100-70", st: { s815: string; s100: string; s70: string }) => (w === "81-5" ? st.s815 : `${st.s100} i ${st.s70}`),
    dzieci: { 1: "jedno dziecko", 2: "dwoje dzieci", 3: "troje dzieci", 4: "czworo dzieci", 5: "pięcioro albo więcej dzieci" },
    // Tryb gościa: scenariusze zapisane w tej karcie przeglądarki.
    opisGosc: "Widzisz scenariusze zapisane w tej karcie przeglądarki.",
    opisOpcjiGosc: ({ data }: { data: string }) => `Zapisany ${data}.`,
    zalogujPlan: "Zaloguj się, żeby zapisać wybrany scenariusz w planie rodziny",
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
    brakRodziny: "Uzupełnij profil rodziny, żeby porównać warianty.",
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
    podstawaWczesniej: "Wpisaliśmy podstawę wymiaru, którą podałaś wcześniej w kalkulatorze. Możesz ją zmienić i obliczyć warianty ponownie.",
    zmianaPodstawyTytul: "Minimalna podstawa wymiaru zasiłku zmienia się w trakcie zasiłku",
    podstawaPrzedZmiana: ({ kwota, data }: { kwota: string; data: string }) => `${kwota} za dni do ${data}`,
    podstawaOdZmiany: ({ kwota, data }: { kwota: string; data: string }) => `${kwota} za dni od ${data}`,
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
    pustePorownanie: "Wpisz podstawę wymiaru zasiłku, żeby zobaczyć zestawienie wariantów.",
    wynikPelny: ({ tygodnie, koniec }: { tygodnie: string; koniec: string }) => `Wynik dla ${tygodnie} urlopu rodzicielskiego. To pełny urlop, do ${koniec}.`,
    wynikCzesciowy: ({ tygodnie, koniec, powrot }: { tygodnie: string; koniec: string; powrot: string }) =>
      `Wynik dla ${tygodnie} urlopu rodzicielskiego. Urlop kończy się ${koniec}, a do pracy wracasz ${powrot}.`,
    wynikZero: ({ powrot }: { powrot: string }) => `Wynik dla 0 tygodni urlopu rodzicielskiego. Do pracy wracasz ${powrot}, dzień po końcu urlopu macierzyńskiego.`,
    zPodstawa: ({ kwota, zrodlo }: { kwota: string; zrodlo: string }) => ` Podstawa wymiaru: ${kwota}, źródło: ${zrodlo}.`,
    terminWyboru: ({ termin }: { termin: string }) => `Wybierz wariant do ${termin}`,
    terminWyboruDopisek: ({ dni }: { dni: string }) => `, czyli 21. dnia po porodzie. Zostało ${dni}.`,
    informacjaWyrownanie: ({ kwota, s815, s100 }: { kwota: string; s815: string; s100: string }) =>
      `Gdy nie wykorzystasz żadnego dnia urlopu rodzicielskiego, w wariancie ${s815} otrzymasz wyrównanie zasiłku za urlop macierzyński do ${s100} podstawy w kwocie ${kwota}. Dlatego obie sumy są równe.`,
    wariant81: ({ s815 }: { s815: string }) => `Wariant ${s815}`,
    wariant81Opis: "Równe wypłaty przez cały urlop.",
    wariant81OpisZero: "Równe wypłaty i wyrównanie po urlopie macierzyńskim.",
    wariant100: ({ s100, s70 }: { s100: string; s70: string }) => `Wariant ${s100} i ${s70}`,
    wariant100Opis: "Więcej w urlopie macierzyńskim, mniej w rodzicielskim.",
    miesiecznieprzez: ({ tygodnie }: { tygodnie: string }) => `Miesięcznie przez ${tygodnie}`,
    miesiecznieMacierzynski: ({ tygodnie }: { tygodnie: string }) => `Miesięcznie przez ${tygodnie} urlopu macierzyńskiego`,
    miesiecznieRodzicielski: ({ tygodnie }: { tygodnie: string }) => `Miesięcznie przez ${tygodnie} urlopu rodzicielskiego`,
    podwyzszenie: ({ procent, kwota }: { procent: string; kwota: string }) =>
      `${procent} podstawy to ${kwota}, więc podwyższamy wypłatę do kwoty świadczenia rodzicielskiego.`,
    sumaZa: ({ tygodnie }: { tygodnie: string }) => `Suma za ${tygodnie}`,
    wyrownanieTytul: ({ s100 }: { s100: string }) => `Wyrównanie do ${s100} za urlop macierzyński`,
    jednorazowo: "Jednorazowo, na wniosek",
    urlopRodzicielski: "Urlop rodzicielski",
    nieKorzystasz: "Nie korzystasz, 0 tygodni",
    wybierz81: ({ s815 }: { s815: string }) => `Wybierz wariant ${s815}`,
    wybierz100: ({ s100, s70 }: { s100: string; s70: string }) => `Wybierz wariant ${s100} i ${s70}`,
    zmienNa81: ({ s815 }: { s815: string }) => `Zmień na wariant ${s815}`,
    zmienNa100: ({ s100, s70 }: { s100: string; s70: string }) => `Zmień na wariant ${s100} i ${s70}`,
    twojWybor: "Twój wybór",
    wybranyWariant: "Wybrany wariant",
    roznicaPelny: ({ kwota, s100, s70 }: { kwota: string; s100: string; s70: string }) =>
      `Przy pełnym urlopie wariant ${s100} i ${s70} daje o ${kwota} więcej. Im wcześniej wrócisz do pracy w czasie urlopu rodzicielskiego, tym większa różnica. Zmień liczbę tygodni w danych do wyliczenia, żeby to sprawdzić.`,
    roznicaPelnyRodzic: ({ kwota, s100, s70 }: { kwota: string; s100: string; s70: string }) =>
      `Przy pełnym urlopie wariant ${s100} i ${s70} daje o ${kwota} więcej. Wyliczenie opiera się na podstawie, którą wpisujesz. ZUS ustali ją z Twoich dokumentów przy wniosku.`,
    okresyTytul: "Wypłaty w okresach urlopu",
    wykresPodpis: "Miesięczna wypłata w każdym okresie",
    wykresMacierzynski: ({ tygodnie }: { tygodnie: string }) => `Urlop macierzyński: ${tygodnie}`,
    wykresRodzicielski: ({ tygodnie }: { tygodnie: string }) => `Urlop rodzicielski: ${tygodnie}`,
    stawka81: ({ s815 }: { s815: string }) => `${s815}: `,
    stawka100: ({ s100 }: { s100: string }) => `${s100}: `,
    stawka70: ({ s70 }: { s70: string }) => `${s70}: `,
    zestawienie: "Zestawienie wypłat po okresach",
    zestawieniePowrot: ({ data }: { data: string }) => `Zestawienie wypłat po okresach przy powrocie do pracy ${data}`,
    zestawienieZero: ({ data }: { data: string }) => `Zestawienie wypłat przy powrocie do pracy ${data}`,
    kolumnaOkres: "Okres",
    kolumna81Miesiecznie: ({ s815 }: { s815: string }) => `Wariant ${s815} / miesięcznie`,
    kolumna81Suma: ({ s815 }: { s815: string }) => `Wariant ${s815} / suma`,
    kolumna100Miesiecznie: ({ s100, s70 }: { s100: string; s70: string }) => `Wariant ${s100} i ${s70} / miesięcznie`,
    kolumna100Suma: ({ s100, s70 }: { s100: string; s70: string }) => `Wariant ${s100} i ${s70} / suma`,
    kolumnaStawka: "Stawka",
    kolumnaMiesiecznie: "Miesięcznie",
    kolumnaSuma: "Suma",
    urlopMacierzynski: "Urlop macierzyński",
    razem: "Razem",
    okresDni: ({ okres, dni }: { okres: string; dni: string }) => `${okres}, ${dni}`,
    wyrownanieWiersz: ({ s100 }: { s100: string }) => `Wyrównanie do ${s100}`,
    wyrownanieWierszOpis: "Za urlop macierzyński, jednorazowo",
    brakWartosci: "-",
    notatkaSuma: ({ kwota }: { kwota: string }) =>
      `Sumę za okres liczymy tak: podstawa wymiaru podzielona przez 30, pomnożona przez stawkę i liczbę dni okresu. Wypłatę niższą niż kwota świadczenia rodzicielskiego, obecnie ${kwota}, podwyższamy do tej kwoty.`,
    notatkaPodwyzszenie: ({ kwota }: { kwota: string }) =>
      `Wypłatę niższą niż kwota świadczenia rodzicielskiego, obecnie ${kwota}, podwyższamy do tej kwoty, a za miesiąc, w którym zasiłek przysługuje tylko za część dni, do kwoty proporcjonalnej do liczby dni. Porównujemy wypłatę przed potrąceniem zaliczki na podatek, a podwyższenie jest wolne od podatku.`,
    notatkaHarmonogram: "Sumy liczymy z wypłat w każdym miesiącu kalendarzowym. Kwotę za każdy miesiąc zobaczysz w",
    notatkaKalkulator: "Liczymy według tych samych reguł co kalkulator zasiłku. Wypłaty w każdym miesiącu, urlopy drugiego rodzica i datę powrotu do pracy zobaczysz w",
    notatkaKalkulatorPowrot: "Liczymy według tych samych reguł co kalkulator zasiłku. Datę powrotu do pracy i niewykorzystane tygodnie urlopu zaplanujesz w",
    kropka: ".",
    zapisanoK08: ({ s815 }: { s815: string }) => `Zapisaliśmy wariant ${s815} w planie rodziny przy sprawie Wniosek o zasiłek macierzyński. W kreatorze wniosku ten wariant będzie już zaznaczony.`,
    zapisanoK08Wariant100: ({ s100, s70 }: { s100: string; s70: string }) => `Zapisaliśmy wariant ${s100} i ${s70} w planie rodziny przy sprawie Wniosek o zasiłek macierzyński. W kreatorze wniosku ten wariant będzie już zaznaczony.`,
    zapisanoK07: ({ s815 }: { s815: string }) => `Zapisaliśmy wariant ${s815} w planie rodziny przy sprawie Wniosek o urlop macierzyński i rodzicielski u pracodawcy. Pracujesz na umowie o pracę, więc wariant wskażesz we wniosku do pracodawcy.`,
    zapisanoK07Wariant100: ({ s100, s70 }: { s100: string; s70: string }) => `Zapisaliśmy wariant ${s100} i ${s70} w planie rodziny przy sprawie Wniosek o urlop macierzyński i rodzicielski u pracodawcy. Pracujesz na umowie o pracę, więc wariant wskażesz we wniosku do pracodawcy.`,
    wyborTytul: ({ wariant }: { wariant: string }) => `Twój wybór: wariant ${wariant}`,
    nazwaWariantu: (w: "81-5" | "100-70", st: { s815: string; s100: string; s70: string }) => (w === "81-5" ? st.s815 : `${st.s100} i ${st.s70}`),
    wyborOpis81: ({ kwota, tygodnie, od, do: koniec, suma }: { kwota: string; tygodnie: string; od: string; do: string; suma: string }) =>
      `Otrzymasz ${kwota} miesięcznie przez ${tygodnie}, od ${od} do ${koniec}, razem ${suma}.`,
    wyborOpis100: ({ kwotaM, kwotaR, suma }: { kwotaM: string; kwotaR: string; suma: string }) =>
      `Otrzymasz ${kwotaM} miesięcznie w czasie urlopu macierzyńskiego i ${kwotaR} miesięcznie w czasie urlopu rodzicielskiego, razem ${suma}.`,
    wyborTerminK08: ({ termin }: { termin: string }) => `Złóż wniosek do ${termin}`,
    wyborTerminK08Dopisek: ({ s815 }: { s815: string }) => `, żeby objąć nim cały urlop rodzicielski z zasiłkiem ${s815}. Do tego dnia możesz też zmienić wariant.`,
    wyborTerminK07: ({ termin }: { termin: string }) => `Złóż pracodawcy wniosek do ${termin}`,
    wyborTerminK07Dopisek: ({ s815 }: { s815: string }) => ` o urlop macierzyński i cały urlop rodzicielski bezpośrednio po nim. Tylko wtedy zasiłek wyniesie ${s815} za cały okres.`,
    wypelnijWniosek: "Wypełnij wniosek",
    zobaczInstrukcjePracodawcy: "Zobacz instrukcję wniosku u pracodawcy",
    zapisaneWWynikach: ({ data }: { data: string }) => `Zapisane w wynikach kalkulacji ${data}`,
    wariantZasilku: "Wariant zasiłku",
    podstawaWymiaru: "Podstawa wymiaru",
    podstawaZeZrodlem: ({ kwota, zrodlo }: { kwota: string; zrodlo: string }) => `${kwota}, źródło: ${zrodlo}`,
    urlopPrzedPowrotem: "Urlop rodzicielski przed powrotem do pracy",
    sprawaWPlanie: "Sprawa w planie rodziny",
    poTerminieTytul: "Twój wariant zasiłku",
    poTerminieOpis: ({ termin, s815 }: { termin: string; s815: string }) => `Termin na wariant ${s815} minął ${termin}, 21. dnia po porodzie. `,
    // koniec ViewCalcMaternityVariant
  },
  ViewCalcParentalSplit: {
    tytulStrony: "Podział urlopu rodzicielskiego",
    naglowek: "Podział urlopu rodzicielskiego",
    powrot: "Urlop rodzicielski drugiego rodzica",
    otworzKalkulator: "Otwórz kalkulator zasiłku",
    brakRodziny: "Uzupełnij profil rodziny, żeby zaplanować podział urlopu.",
    przejdzDoProfilu: "Przejdź do profilu rodziny",
    zapisano: ({ tygodnieMatki, tygodnieDrugiego }: { tygodnieMatki: string; tygodnieDrugiego: string }) =>
      `Zapisaliśmy plan podziału: ${tygodnieMatki} matki i ${tygodnieDrugiego} drugiego rodzica. Zobaczycie go oboje w planie rodziny i przy sprawie Urlop rodzicielski drugiego rodzica.`,
    rozdzielTytul: "Rozdziel tygodnie",
    opis: ({ dzieci, wymiar, maks }: { dzieci: string; wymiar: string; maks: string }) =>
      `W profilu rodziny jest ${dzieci}, więc urlop rodzicielski trwa ${wymiar}. Każde z Was może wykorzystać najwyżej ${maks}. Matka i drugi rodzic mają po 9 tygodni, których nie można przekazać, a niewykorzystane przepadają.`,
    opisBezPrawa: ({ dzieci, wymiar, maks }: { dzieci: string; wymiar: string; maks: string }) =>
      `W profilu rodziny jest ${dzieci}, więc urlop rodzicielski trwa ${wymiar}. Drugi rodzic nie ma prawa do zasiłku, dlatego możesz wykorzystać najwyżej ${maks}, a 9 tygodni drugiego rodzica przepada.`,
    jednoDziecko: "jedno dziecko",
    jednoDzieckoZaZyciem: "jedno dziecko z zaświadczeniem „Za życiem”",
    wiecejDzieci: ({ liczba }: { liczba: number }) => `${liczba} dzieci`,
    wiecejDzieciZaZyciem: ({ liczba }: { liczba: number }) => `${liczba} dzieci z zaświadczeniem „Za życiem”`,
    matkaNaglowek: ({ imie }: { imie: string }) => (imie ? `Matka: ${imie}` : "Matka"),
    drugiNaglowek: ({ imie }: { imie: string }) => (imie ? `Drugi rodzic: ${imie}` : "Drugi rodzic"),
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
    wariantZPlanu: ({ wariant }: { wariant: string }) => `${wariant}, z planu rodziny. `,
    wariantWybrany: ({ wariant, data, sprawa }: { wariant: string; data: string; sprawa: string }) => `${wariant}, wybrany ${data} przy sprawie ${sprawa}. `,
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
    pustyWynik: "Popraw dane i wylicz podział, żeby zobaczyć wynik podziału i wypłaty.",
    pustyWynikPodstawa: "Wpisz podstawę wymiaru drugiego rodzica i wylicz podział, żeby zobaczyć wynik podziału i wypłaty.",
    kafelMatka: "Matka",
    kafelDrugi: "Drugi rodzic",
    kafelPrzepada: "Przepada",
    kafelRazem: "Razem urlopu rodzicielskiego",
    pasekTytul: ({ wymiar }: { wymiar: string }) => `Podział ${wymiar} urlopu`,
    pasekOpis: ({ wymiar, pula, matka, drugi, przepada }: { wymiar: string; pula: string; matka: string; drugi: string; przepada: string }) =>
      `Podział ${wymiar} urlopu. Tylko dla matki 9 tygodni, do podziału ${pula}, tylko dla drugiego rodzica 9 tygodni. Matka ${matka}, drugi rodzic ${drugi}, przepada ${przepada}.`,
    tylkoMatki: "Tylko dla matki: 9",
    doPodzialu: ({ pula }: { pula: string }) => `Do podziału: ${pula}`,
    tylkoDrugiego: "Tylko dla drugiego rodzica: 9",
    legendaMatka: ({ tygodnie, stawka }: { tygodnie: string; stawka: string }) => `: ${tygodnie}${stawka}`,
    legendaDrugi: ({ tygodnie, stawka }: { tygodnie: string; stawka: string }) => `: ${tygodnie}${stawka}`,
    legendaPrzepada: ({ tygodnie }: { tygodnie: number }) => `: ${tygodnie}`,
    nieprzekazywalneTytul: "Tygodnie, których nie można przekazać",
    matkaWykorzystuje: ({ uzyte }: { uzyte: number }) => `Matka wykorzystuje ${uzyte} z 9 tygodni, które przysługują tylko jej.`,
    drugiWykorzystuje: ({ uzyte }: { uzyte: number }) => `Drugi rodzic wykorzystuje ${uzyte} z 9 tygodni, które przysługują tylko jemu.`,
    drugiWykorzystujePula: ({ pula }: { pula: string }) => `Drugi rodzic wykorzystuje 9 z 9 tygodni, które przysługują tylko jemu, i ${pula} z puli do podziału.`,
    drugiBezPrawa: "Drugi rodzic nie ma prawa do zasiłku, więc 9 tygodni, które przysługują tylko jemu, przepada.",
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
    notatkaStawki: ({ s815, s100, s70 }: { s815: string; s100: string; s70: string }) =>
      `Za 9 tygodni tylko dla drugiego rodzica zasiłek wynosi ${s70} jego podstawy. Za tygodnie ponad 9 stosujemy stawkę urlopu rodzicielskiego z wariantu matki: ${s70} w wariancie ${s100} i ${s70} albo ${s815} w wariancie ${s815}, gdy co najmniej jeden dzień tego urlopu przypada przed pierwszymi urodzinami dziecka.`,
    notatkaPoUrodzinach: ({ s70 }: { s70: string }) =>
      `Tygodnie drugiego rodzica ponad 9 przypadają po pierwszych urodzinach dziecka, dlatego liczymy je po ${s70} podstawy. Przyjmujemy, że drugi rodzic zaczyna urlop po urlopie macierzyńskim i tygodniach urlopu rodzicielskiego matki.`,
    podstawaOdZmiany: (p: { kwota: string; data: string }) => `od ${p.data}: ${p.kwota}`,
    podstawaPrzedZmiana: (p: { data: string }) => `do ${p.data}: `,
    notatkaCzesci: "Liczymy według tych samych reguł co kalkulator zasiłku. Urlop możecie wykorzystać jednocześnie, na zmianę albo po kolei, w najwyżej 5 częściach. Daty części ułożysz w",
    kalkulatorzeZasilku: "kalkulatorze zasiłku",
    kropka: ".",
    zapisz: "Zapisz plan podziału",
    zapiszOpis: "Plan zobaczycie oboje w planie rodziny i przy sprawie Urlop rodzicielski drugiego rodzica.",
    wrocDoPlanu: "Wróć do planu rodziny",
    nazwaWariantu: (w: "81-5" | "100-70", st: { s815: string; s100: string; s70: string }) => (w === "81-5" ? st.s815 : `${st.s100} i ${st.s70}`),
    sprawaK07: "Wniosek o urlop macierzyński i rodzicielski u pracodawcy",
    sprawaK08: "Wniosek o zasiłek macierzyński",
    // koniec ViewCalcParentalSplit
  },
  ViewSampleCaseList: {
    tytulStrony: "Przykładowe sprawy ZUS",
    naglowek: "Przykładowe sprawy ZUS",
    wstep: "Sprawdź, jak przewodnik ustala prawo do zasiłku i jego wysokość na dokumentach, z których korzysta ZUS. Wybierz sprawę przygotowaną przez zespół albo wgraj dokument sprawy, na przykład dokument przykładowy zespołu.",
    kartaWgrania: {
      tytul: "Wgraj dokument sprawy",
      opis: "Wniosek ZAM, zaświadczenie Z-3, Z-3a, Z-3b albo ZAS-12, poświadczenie ubezpieczenia chorobowego, zrzut z systemu ZUS albo zaświadczenie lekarskie. Plik PDF, JPG albo PNG, najwyżej 10 MB. Dane odczytamy z pomocą sztucznej inteligencji, a imię, nazwisko i numer PESEL zastąpimy danymi losowymi.",
      przycisk: "Wgraj dokument",
    },
    kartaListy: {
      tytul: "Sprawy przygotowane przez zespół",
      licznikZestawow: "Sprawy z zestawów ZUS:",
      licznikWzorcowych: "sprawy wzorcowe:",
      licznikWzorcowychSamych: "Sprawy wzorcowe:",
      notatka: "Sprawy z zestawów ZUS mają dane osobowe zastąpione danymi losowymi, a daty, okresy i kwoty takie jak w zestawie. Sprawy wzorcowe mają dane wymyślone przez zespół do testów reguł.",
    },
    tabela: {
      podpis: "Sprawy przygotowane przez zespół",
      etykietaPrzewijania: "Tabela spraw przygotowanych przez zespół, przewijana poziomo",
      sprawa: "Sprawa / źródło",
      sytuacja: "Sytuacja",
      forma: "Forma zatrudnienia",
      dokumenty: "Dokumenty",
      prawo: "Oczekiwane prawo do świadczenia",
      akcja: "Akcja",
      wybierz: "Wybierz",
      wybierzSprawe: ({ id }: { id: string }) => `Wybierz sprawę ${id}`,
    },
    zrodla: {
      "zestaw-zus": "Zestaw ZUS",
      "sprawa-wzorcowa": "Sprawa wzorcowa",
      "wgrane-dokumenty": "Wgrane dokumenty",
    },
    formy: {
      pracownik: "Umowa o pracę",
      zleceniobiorca: "Umowa zlecenia",
      dzialalnosc: "Jednoosobowa działalność gospodarcza",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
    },
    prawo: {
      przysluguje: "przysługuje",
      "nie-przysluguje": "nie przysługuje",
      doSplaty: "nie przysługuje do czasu spłaty zadłużenia",
    },
    notatkaJednaSprawa: "Prowadzisz jedną przykładową sprawę naraz. Wybór sprawy albo wgranie dokumentu zaczyna nową sprawę i usuwa dane poprzedniej. Sprawa nie zmienia Twojego profilu rodziny, planu rodziny ani terminów, a jej dane usuniemy po wylogowaniu, także automatycznym.",
    scenariusz: {
      nazwa: "Przykładowe sprawy: odczyt dokumentów demonstracyjnych",
      opis: "Konto nowego użytkownika z datą 21.11.2026. Po wgraniu pliku demonstracyjnego, na przykład z3-kowalczyk.pdf, zam-kowalczyk.pdf, szpital.pdf albo zrzut-pawlak.png, pokażemy dane przygotowane dla tego pliku.",
    },
    notatkaJednaSprawaGosc:
      "Prowadzisz jedną przykładową sprawę naraz. Wybór sprawy albo wgranie dokumentu zaczyna nową sprawę i usuwa dane poprzedniej. Dane sprawy zostają w tej karcie przeglądarki do jej zamknięcia. Gdy zalogujesz się w tej karcie, przeniesiemy sprawę do Twojego konta.",
    kartaDokumentow: {
      tytul: "Dokumenty przykładowe do testu odczytu",
      opis: "Pobierz zmyślone dokumenty siedmiu spraw: wnioski ZAM, zaświadczenia Z-3, Z-3a i ZAS-12, poświadczenie ubezpieczenia, wydruki e-ZLA i zrzuty z systemu ZUS. Wgraj je jak własne pliki albo wybierz je z listy na ekranie wgrywania.",
      pobierzWszystkie: "Pobierz dokumenty przykładowe",
      archiwum: "Archiwum ZIP z 19 plikami PDF i PNG",
      wybierzZListy: "Wgraj dokument przykładowy",
    },
    // koniec ViewSampleCaseList
  },
  ViewSampleCaseUpload: {
    tytulStrony: "Wgraj dokument sprawy",
    naglowek: "Wgraj dokument sprawy",
    wstep: "Wgrany dokument zaczyna nową przykładową sprawę. Wgraj własny plik albo dokument przykładowy z listy poniżej.",
    wstepDodaj: "Dokument dodamy do bieżącej przykładowej sprawy. Dokument tego samego rodzaju zastąpi poprzedni.",
    kartaPliku: {
      tytul: "Wybierz plik",
      etykieta: "Plik dokumentu",
      podpowiedz: "PDF, JPG albo PNG, najwyżej 10 MB. Gdy wybierzesz plik, od razu go wgramy i odczytamy z niego dane.",
      wybranyPlik: ({ nazwa }: { nazwa: string }) => `Wybrany plik: ${nazwa}`,
      trwaOdczyt: ({ nazwa }: { nazwa: string }) => `Odczytujemy dane z pliku ${nazwa}. Odczyt trwa najdłużej 30 sekund.`,
      nieOdczytany: ({ nazwa, rozmiar }: { nazwa: string; rozmiar: string }) =>
        `Nie udało się odczytać pliku ${nazwa} (${rozmiar}). Dane sprawy są bez zmian. Wybierz plik ponownie.`,
      notatka: "Prowadzisz już sprawę? Wgranie dokumentu zacznie nową sprawę, a dokumenty i dane poprzedniej usuniemy. Kolejne dokumenty tej samej sprawy dodasz na ekranie danych sprawy.",
    },
    wrocDoListy: "Wróć do listy spraw",
    wybierzZListy: "Wybierz sprawę z listy",
    etykietaBocznej: "Informacje o odczycie dokumentu",
    jak: {
      tytul: "Co zrobimy z dokumentem",
      kroki: [
        "Rozpoznamy rodzaj dokumentu.",
        "Odczytamy dane sprawy z pomocą sztucznej inteligencji, najdłużej 30 sekund. Plik przesyłamy do odczytu zaszyfrowany.",
        "Imię, nazwisko i numer PESEL zastąpimy danymi losowymi z tą samą datą urodzenia i płcią. Daty, okresy i kwoty zostaną takie jak w dokumencie.",
        "Pokażemy dane sprawy do sprawdzenia i poprawy. Plik usuniemy po 24 godzinach od wgrania i nikt poza Tobą go nie zobaczy.",
      ],
    },
    rodzaje: {
      tytul: "Dokumenty, które rozpoznajemy (12)",
      lista: [
        "Wniosek o zasiłek macierzyński (ZAM), także wniosek ZUR i ZAO",
        "Zaświadczenie płatnika składek (Z-3) dla pracownika",
        "Zaświadczenie płatnika składek (Z-3a) dla ubezpieczonego niebędącego pracownikiem",
        "Zaświadczenie płatnika składek (Z-3b) dla osoby prowadzącej pozarolniczą działalność, wystawiane do 23.10.2026",
        "Zaświadczenie płatnika składek (ZAS-12) o zasiłku chorobowym za dalszy okres niezdolności do pracy",
        "Poświadczenie ubezpieczenia chorobowego",
        "Zrzut z systemu wewnętrznego ZUS",
        "Wydruk zaświadczenia lekarskiego e-ZLA",
        "Zaświadczenie lekarskie o przewidywanej dacie porodu",
        "Zaświadczenie szpitala o urodzeniu dziecka i jego pobycie w szpitalu",
        "Zaświadczenie o urodzeniu martwego dziecka",
        "Zaświadczenie „Za życiem”",
      ],
    },
    dokumentyPrzykladowe: {
      tytul: "Dokumenty przykładowe",
      opis: "Zespół przygotował zmyślone dokumenty siedmiu spraw. Wybierz dokument, a wgramy go i odczytamy tak samo jak plik z Twojego komputera. Pierwszy dokument zaczyna nową sprawę, a kolejne dokumenty tej samej sprawy dodasz na ekranie danych sprawy przyciskiem Dodaj dokument przykładowy.",
      opisDodaj: "Wybierz kolejny dokument tej samej sprawy, a dodamy go do bieżącej sprawy i odczytamy tak samo jak plik z Twojego komputera.",
      pobierzWszystkie: "Pobierz dokumenty przykładowe",
      archiwum: "Archiwum ZIP z 19 plikami PDF i PNG",
      pobierz: "Pobierz",
      pobierzDokument: ({ nazwa }: { nazwa: string }) => `Pobierz plik ${nazwa}`,
      wgraj: "Wgraj",
      wgrajDokument: ({ nazwa }: { nazwa: string }) => `Wgraj plik ${nazwa}`,
      podpisListy: ({ zestaw }: { zestaw: string }) => `Dokumenty: ${zestaw}`,
      rodzaje: {
        zam: "Wniosek ZAM",
        z3: "Zaświadczenie Z-3",
        z3a: "Zaświadczenie Z-3a",
        poswiadczenie: "Poświadczenie ubezpieczenia chorobowego",
        zrzut: "Zrzut z systemu ZUS, obraz PNG",
        ezla: "Wydruk zaświadczenia lekarskiego e-ZLA",
        zas12: "Zaświadczenie ZAS-12",
        umowa: "Umowa najmu",
      },
      zestawy: {
        kowalczyk: {
          tytul: "Agnieszka Kowalczyk, pracownica",
          opis: "Zasiłek macierzyński za 20 tygodni od porodu i zrzut z systemu ZUS z przyznanym zasiłkiem.",
        },
        sadowska: {
          tytul: "Oliwia Sadowska, zleceniobiorczyni",
          opis: "Wniosek o zasiłek 81,5% podstawy za urlop macierzyński i rodzicielski.",
        },
        pawlak: {
          tytul: "Marta Pawlak, działalność gospodarcza",
          opis: "Dobrowolne ubezpieczenie chorobowe, podstawy wymiaru składek z poświadczenia i zrzut z przyznanym zasiłkiem.",
        },
        zajac: {
          tytul: "Monika Zając, pracownica po likwidacji pracodawcy",
          opis: "Zasiłek w wysokości zasiłku macierzyńskiego do porodu i zasiłek macierzyński od porodu.",
        },
        krawczyk: {
          tytul: "Julia Krawczyk, działalność gospodarcza",
          opis: "Działalność bez dobrowolnego ubezpieczenia chorobowego i zrzut z systemu ZUS z odmową zasiłku macierzyńskiego.",
        },
        mazur: {
          tytul: "Karolina Mazur, zleceniobiorczyni w ciąży",
          opis: "Zasiłek chorobowy 100% podstawy przy kodzie B z zaświadczenia lekarskiego i zrzut z przyznanym zasiłkiem.",
        },
        gorska: {
          tytul: "Zuzanna Górska, zleceniobiorczyni od 2 miesięcy",
          opis: "Niezdolność do pracy w ciąży w okresie wyczekiwania 90 dni i dalszy okres niezdolności z ZAS-12.",
        },
        inne: {
          tytul: "Dokument spoza zestawu sprawy",
          opis: "Umowa najmu do sprawdzenia rozpoznania rodzaju dokumentu.",
        },
      },
    },
    // koniec ViewSampleCaseUpload
  },
  ViewSampleCaseData: {
    tytulStrony: "Dane sprawy z wgranych dokumentów",
    naglowek: "Dane sprawy z wgranych dokumentów",
    naglowekSprawy: ({ id }: { id: string }) => `Dane sprawy ${id}`,
    wstepZespolu: ({ zrodlo, sytuacja, czas }: { zrodlo: string; sytuacja: string; czas: string }) => `${zrodlo}: ${sytuacja}. Wybrana ${czas}.`,
    wstepWgranej: ({ czas, stanNa }: { czas: string; stanNa: string }) => `Sprawa rozpoczęta ${czas}. Stan na ${stanNa}.`,
    notatkaStanu: ({ stanNa }: { stanNa: string }) =>
      `Stan na ${stanNa}. Sprawdź dane sprawy i popraw je, jeśli trzeba. Przy każdej wartości widzisz jej źródło. Po zatwierdzeniu sprawdzimy ubezpieczenie chorobowe i porównamy wynik z rozstrzygnięciem sprawy.`,
    usunSprawe: "Usuń sprawę",
    brakSprawy: "Nie prowadzisz teraz przykładowej sprawy. Wybierz sprawę z listy albo wgraj dokument z zestawu ZUS.",
    przejdzDoListy: "Przejdź do listy spraw",
    dokumenty: {
      tytul: ({ liczba }: { liczba: string }) => `Dokumenty sprawy (${liczba})`,
      plikZespolu: "Plik PDF przygotowany przez zespół",
      wgrany: ({ wgrano, usuniemy }: { wgrano: string; usuniemy: string }) => `Wgrany ${wgrano}. Plik usuniemy ${usuniemy}.`,
      usuniety: ({ wgrano, usunieto }: { wgrano: string; usunieto: string }) => `Wgrany ${wgrano}. Plik usunięty ${usunieto}.`,
      podglad: "Podgląd",
      podgladDokumentu: ({ nazwa }: { nazwa: string }) => `Podgląd: ${nazwa}`,
      dodaj: "Dodaj dokument",
      dodajPrzykladowy: "Dodaj dokument przykładowy",
      dodajPodpowiedz: "PDF, JPG albo PNG, najwyżej 10 MB. Dokument tego samego rodzaju zastąpi poprzedni.",
      trwaOdczyt: ({ nazwa }: { nazwa: string }) => `Odczytujemy dane z pliku ${nazwa}. Odczyt trwa najdłużej 30 sekund.`,
      nazwaCzesci: "Dokumenty sprawy",
    },
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
    nazwaDokumentu: ({ nazwa, numer }: { nazwa: string; numer: string }) => `${nazwa} nr ${numer}`,
    zrodla: {
      sprawaZespolu: "Źródło: sprawa zespołu",
      odczytaneAI: ({ dokument }: { dokument: string }) => `Odczytane z pomocą sztucznej inteligencji: ${dokument}`,
      zastapione: "Dane zastąpione losowymi",
      zastapionyPesel: "Dane zastąpione losowymi, data urodzenia i płeć jak w dokumencie",
      tylkoDoOdczytu: "Tylko do odczytu",
      korekta: "Poprawione przez Ciebie.",
      odczytano: ({ wartosc }: { wartosc: string }) => `Odczytano ${wartosc}`,
      podajeszTy: "Podajesz Ty",
      wartoscDomyslna: "Wartość domyślna",
      brak: "Brak w dokumentach sprawy",
      tytulTrwa: "Tytuł trwa",
      okresTrwa: "Okres trwa",
    },
    osoba: {
      daneKobieta: "Dane ubezpieczonej",
      daneMezczyzna: "Dane ubezpieczonego",
      imie: "Imię",
      nazwisko: "Nazwisko",
      pesel: "Numer PESEL",
      rola: "Rola w sprawie",
      tytul: "Tytuł ubezpieczenia",
      tytulUbezpieczenia: "Tytuł ubezpieczenia",
      tytulOd: "Data początku tytułu",
      tytulDo: "Data ustania tytułu",
      etat: "Wymiar czasu pracy",
      wymiarEtatu: "Wymiar etatu, na przykład 1/2",
      liczbaUb: "Liczba ubezpieczonych zgłoszonych przez płatnika do ubezpieczenia chorobowego",
      przyczyna: "Przyczyna ustania zatrudnienia",
      inneZatrudnienie: "Zapewnienie innego zatrudnienia",
      pracaPoUstaniu: "Praca zarobkowa, emerytura, renta albo zasiłek dla bezrobotnych po ustaniu ubezpieczenia",
    },
    chorobowe: {
      tytul: "Ubezpieczenie chorobowe",
      rodzaj: "Rodzaj ubezpieczenia chorobowego",
      okresy: "Okresy podlegania ubezpieczeniu chorobowemu",
      okresOd: ({ numer }: { numer: string }) => `Okres ${numer}, od`,
      okresDo: ({ numer }: { numer: string }) => `Okres ${numer}, do`,
      usunOkres: ({ numer }: { numer: string }) => `Usuń okres ${numer}`,
      dodajOkres: "Dodaj okres",
      dlug: "Kwota zadłużenia na dzień porodu (zł)",
      dlugBrak: "Brak w dokumentach sprawy. Kwotę zawiera poświadczenie ubezpieczenia chorobowego",
    },
    zdarzenie: {
      zdarzenie: "Zdarzenie",
      rodzaj: "Rodzaj zdarzenia",
      porod: "Data porodu",
      termin: "Przewidywany termin porodu",
      dzieci: "Liczba dzieci urodzonych przy jednym porodzie",
      martwe: "Liczba dzieci urodzonych martwo",
      niezdolnoscOd: "Niezdolność do pracy, od",
      niezdolnoscDo: "Niezdolność do pracy, do",
      niezdolnoscKod: "Kod literowy zaświadczenia lekarskiego",
      dalszeOkresy: "Dalsze okresy niezdolności do pracy",
      wniosek: "Wniosek",
      swiadczenie: "Świadczenie z wniosku",
      swiadczenieNr: ({ numer }: { numer: string }) => `Świadczenie z wniosku ${numer}`,
      zlozenie: "Data złożenia wniosku",
      oswiadczenie: "Oświadczenie o pełnym wymiarze urlopów",
      matkaOd: "Urlop macierzyński wykorzystany przez matkę, od",
      matkaDo: "Urlop macierzyński wykorzystany przez matkę, do",
      okresy: "Okresy zasiłku z wniosku",
      rodzajUrlopu: "Rodzaj urlopu",
      od: "Od",
      do: "Do",
      usunOkres: ({ numer }: { numer: string }) => `Usuń okres urlopu ${numer}`,
      dodajOkres: "Dodaj okres urlopu",
    },
    dziecko: {
      tytul: "Dane dziecka",
      opis: "Od tych danych zależy okres zasiłku, na przykład uzupełniający urlop macierzyński za pobyt dziecka w szpitalu.",
      tydzien: "Tydzień ciąży w dniu porodu",
      masa: "Masa urodzeniowa (g)",
      zaZyciem: "Zaświadczenie „Za życiem”, data wystawienia",
      pobytOd: "Pobyt dziecka w szpitalu, od",
      pobytDo: "Pobyt dziecka w szpitalu, do",
    },
    kwoty: {
      tytul: "Kwoty miesięczne",
      opisy: {
        wynagrodzenie: "Wynagrodzenie z zaświadczenia Z-3 w złotych, za 12 pełnych miesięcy przed miesiącem porodu.",
        przychod: "Przychód stanowiący podstawę wymiaru składek z zaświadczenia Z-3a w złotych.",
        "podstawa-skladek": "Podstawa wymiaru składek z poświadczenia ubezpieczenia chorobowego w złotych.",
      },
      pusto: "Tu zobaczysz kwoty miesięczne z zaświadczenia Z-3, Z-3a albo z poświadczenia ubezpieczenia chorobowego. Pozostałe dokumenty nie zawierają kwot.",
      usunMiesiac: ({ miesiac }: { miesiac: string }) => `Usuń miesiąc ${miesiac}`,
      dodajMiesiac: "Dodaj miesiąc",
      poprzedni: "Poprzedni zasiłek",
      poprzedniOpis: "Podaj, jeśli zasiłek macierzyński następuje bezpośrednio po innym zasiłku albo po przerwie krótszej niż miesiąc.",
      popPodstawa: "Podstawa wymiaru (zł)",
      popKoniec: "Data końca zasiłku",
    },
    przyznane: {
      tytul: "Świadczenia przyznane i odmówione przez ZUS",
      podpis: "Świadczenia przyznane i odmówione przez ZUS w zrzucie z systemu",
      etykietaPrzewijania: "Tabela świadczeń przyznanych i odmówionych przez ZUS, przewijana poziomo",
      swiadczenie: "Świadczenie",
      decyzja: "Decyzja ZUS",
      przyznano: "Przyznano",
      odmowa: "Odmowa",
      odmowaZPrzyczyna: ({ przyczyna }: { przyczyna: string }) => `Odmowa: ${przyczyna}`,
      okres: "Okres",
      odDnia: ({ od }: { od: string }) => `od ${od}`,
      kwota: "Miesięczna kwota",
      zrodlo: "Źródło",
    },
    rozstrzygniecie: {
      tytul: "Oczekiwane rozstrzygnięcie",
      opisZespolu: ({ id }: { id: string }) => `Rozstrzygnięcie sprawy ${id} przygotował zespół. Porównamy z nim wynik weryfikacji i wyliczenie zasiłku.`,
      opisWgranej: "Podaj rozstrzygnięcie sprawy. Porównamy z nim wynik weryfikacji i wyliczenie zasiłku.",
      opisZrzutu: "Puste pola uzupełniliśmy świadczeniem przyznanym w zrzucie z systemu ZUS. Pola wpisane wcześniej przez Ciebie zostają bez zmian.",
      swiadczenieNr: ({ numer }: { numer: string }) => `Świadczenie ${numer}`,
      swiadczenie: "Świadczenie",
      prawo: "Prawo do świadczenia",
      platnik: "Płatnik (nieobowiązkowe)",
      od: "Okres od (nieobowiązkowe)",
      do: "Okres do (nieobowiązkowe)",
      stawka: "Stawka (nieobowiązkowe)",
      kwota: "Miesięczna kwota w zł (nieobowiązkowe)",
      usun: ({ numer }: { numer: string }) => `Usuń świadczenie ${numer}`,
      wyborWpisu: "Świadczenia oczekiwanego rozstrzygnięcia",
      dodaj: "Dodaj świadczenie",
    },
    zatwierdzenie: {
      zatwierdz: "Zatwierdź dane",
      opis: "Po zatwierdzeniu sprawdzimy warunki prawa do zasiłku z ubezpieczenia chorobowego.",
    },
    opcje: {
      rola: { matka: "Matka", "ojciec-przejmujacy": "Ojciec, który przejmuje część urlopu macierzyńskiego" },
      tytul: {
        pracownik: "Pracownik",
        zleceniobiorca: "Zleceniobiorca",
        dzialalnosc: "Osoba prowadząca pozarolniczą działalność",
        "brak-tytulu": "Brak tytułu do ubezpieczenia",
      },
      etat: { "pelny-etat": "Pełny etat", "niepelny-etat": "Niepełny etat" },
      liczbaUb: { "do-20": "Do 20", "powyzej-20": "Powyżej 20" },
      chorobowe: { obowiazkowe: "Obowiązkowe", dobrowolne: "Dobrowolne", brak: "Brak" },
      przyczyna: {
        upadlosc: "Upadłość pracodawcy",
        likwidacja: "Likwidacja pracodawcy",
        "smierc-pracodawcy": "Śmierć pracodawcy",
        "naruszenie-z-wyrokiem": "Rozwiązanie umowy z naruszeniem przepisów stwierdzonym prawomocnym wyrokiem sądu",
        inna: "Inna przyczyna",
      },
      takNie: { tak: "Tak", nie: "Nie" },
      zdarzenie: { porod: "Poród", "martwe-urodzenie": "Urodzenie martwego dziecka", niezdolnosc: "Niezdolność do pracy" },
      dzieci: { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5 i więcej" },
      swiadczenie: {
        "zasilek-macierzynski": "Zasiłek macierzyński",
        zwzm: "Zasiłek w wysokości zasiłku macierzyńskiego",
        "zasilek-chorobowy": "Zasiłek chorobowy",
      },
      urlop: {
        macierzynski: "Urlop macierzyński",
        rodzicielski: "Urlop rodzicielski",
        ojcowski: "Urlop ojcowski",
        uzupelniajacy: "Uzupełniający urlop macierzyński",
        "na-warunkach-macierzynskiego": "Urlop na warunkach urlopu macierzyńskiego",
      },
      prawo: { przysluguje: "Przysługuje", "nie-przysluguje": "Nie przysługuje" },
      platnik: { zus: "ZUS", "platnik-skladek": "Płatnik składek" },
      stawka: { "100": "100%", "81.5": "81,5%", "70": "70%" },
    },
    formatDaty: "DD.MM.RRRR",
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
    nieprzyslugujeZPrzyczyna: ({ przyczyna }: { przyczyna: string }) => `Nie przysługuje: ${przyczyna}`,
    platnicy: { zus: "ZUS", "platnik-skladek": "Płatnik składek", nieustalony: "Płatnik nieustalony" },
    porownania: { zgodne: "Zgodne", rozne: "Różne", "bez-porownania": "Bez porównania" },
    brakRozstrzygniecia: "-",
    korektaUzytkownika: "Korekta użytkownika",
    swiadczenieRodzicielskie: ({ kwota }: { kwota: string }) =>
      `Rodzinie przysługuje świadczenie rodzicielskie ${kwota} miesięcznie`,
    swiadczenieRodzicielskieOpis:
      "Kwota obowiązująca w dniu porodu. Świadczenie przysługuje, gdy zasiłek macierzyński nie przysługuje z powodu tytułu, rodzaju ubezpieczenia albo podlegania ubezpieczeniu w dniu porodu.",
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
    notaReguly: "Reguły stosują wymiary, okresy, kwoty i progi obowiązujące w dniu zdarzenia. Wynik i uzasadnienie zapisujemy w przykładowej sprawie.",
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
        nieDotyczy: "Sprawa wskazuje brak ubezpieczenia chorobowego, więc warunek okresów podlegania jej nie dotyczy.",
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
          `Sprawa wskazuje brak ubezpieczenia chorobowego, więc w dniu zdarzenia ${data} osoba nie podlega temu ubezpieczeniu.`,
        spelniony: ({ zdarzenie, okres }: { zdarzenie: string; okres: string }) => `${zdarzenie} przypada w okresie podlegania ${okres}.`,
        poKoncu: ({ zdarzenie, koniec }: { zdarzenie: string; koniec: string }) =>
          `${zdarzenie} przypada po końcu ostatniego okresu podlegania ${koniec}.`,
        przedPoczatkiem: ({ zdarzenie }: { zdarzenie: string }) => `${zdarzenie} przypada przed początkiem okresu podlegania.`,
      },
      w6: {
        nieDotyczy: ({ zdarzenia }: { zdarzenia: string }) => `Ubezpieczenie chorobowe trwa w dniu ${zdarzenia}.`,
        nieDotyczyBrak: "Sprawa wskazuje brak ubezpieczenia chorobowego, więc warunek ustania ubezpieczenia jej nie dotyczy.",
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
          `Niezdolność do pracy powstała ${dniPo} dni po ustaniu ubezpieczenia i trwała ${trwa} dni. Zasiłek chorobowy po ustaniu ubezpieczenia wymaga niezdolności powstałej najpóźniej ${limit} dni od ustania i trwającej co najmniej ${min} dni oraz upływu okresu wyczekiwania. Po ustaniu ubezpieczenia osoba nie może mieć pracy zarobkowej, emerytury, renty ani zasiłku dla bezrobotnych.`,
      },
      w7: {
        nieDotyczy: ({ tytul }: { tytul: string }) =>
          `Warunek dotyczy osoby prowadzącej pozarolniczą działalność, a w sprawie jest ${tytul}.`,
        brakDanych: "Dokumenty sprawy pomijają kwotę zadłużenia z tytułu składek. Prawo do zasiłku zależy od stanu rozliczeń składek na dzień zdarzenia.",
        spelniony: ({ kwota, data, prog, dzienZdarzenia }: { kwota: string; data: string; prog: string; odSlownika: string; dzienZdarzenia: string; terminSplaty: string }) =>
          `Zadłużenie z tytułu składek ${kwota} na ${data} jest równe progowi zadłużenia ${prog} albo od niego niższe. Próg ze słownika kwot i progów obowiązuje w dniu zdarzenia ${dzienZdarzenia}.`,
        niespelniony: ({ kwota, data, prog, dzienZdarzenia, terminSplaty }: { kwota: string; data: string; prog: string; odSlownika: string; dzienZdarzenia: string; terminSplaty: string }) =>
          `Zadłużenie z tytułu składek ${kwota} na ${data} przekracza próg zadłużenia ${prog} ze słownika kwot i progów, obowiązujący w dniu zdarzenia ${dzienZdarzenia}. Zasiłek chorobowy i zasiłek macierzyński przysługują po spłacie całości zadłużenia. Spłata całości do ${terminSplaty} daje zasiłek za cały okres, a po spłacie późniejszej zasiłek przysługuje od dnia spłaty.`,
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
      macierzynskiOdPorodu: ({ od, tygodnie, dni }: { od: string; tygodnie: string; dni: string }) =>
        `Sprawa nie zawiera okresu urlopu z wniosku, więc okres podstawowy zasiłku liczymy od dnia porodu ${od} w wymiarze urlopu macierzyńskiego ${tygodnie} tygodni, czyli ${dni} dni.`,
      martweUrodzenie: ({ dni }: { dni: string }) => `Po urodzeniu martwego dziecka okres zasiłku za urlop macierzyński wynosi ${dni} dni od dnia porodu.`,
      ojciec: ({ dni }: { dni: string }) =>
        `Okres zasiłku ojca to wymiar urlopu macierzyńskiego pomniejszony o okres wykorzystany przez matkę, czyli ${dni} dni.`,
      uzupelniajacy: ({ dni, tygodnie }: { dni: string; tygodnie: string }) =>
        `Pobyt dziecka w szpitalu w okresie liczenia trwa ${dni} dni, więc uzupełniający urlop macierzyński wynosi ${tygodnie} tygodni.`,
      rodzicielski: ({ tygodnie }: { tygodnie: string }) => `Okres zasiłku za urlop rodzicielski matki wynosi ${tygodnie} tygodni.`,
      wariant815: ({ dni }: { dni: string }) =>
        `Wniosek z oświadczeniem o pełnym wymiarze urlopów złożony najpóźniej ${dni} dni po porodzie daje stawkę 81,5% za cały okres.`,
      podwyzszenie: ({ kwota, podwyzszenie }: { kwota: string; podwyzszenie: string }) =>
        `Zasiłek za miesiąc niższy niż kwota świadczenia rodzicielskiego ${kwota} podwyższamy do tej kwoty, więc suma wypłat zawiera podwyższenie ${podwyzszenie}.`,
      zwzm: ({ dni, procent }: { dni: string; procent: string }) =>
        `Zasiłek w wysokości zasiłku macierzyńskiego przysługuje od dnia po ustaniu zatrudnienia do dnia przed porodem, czyli ${dni} dni, i wynosi ${procent}% podstawy.`,
      chorobowyOkres: ({ od, do: koniec, dni }: { od: string; do: string; dni: string }) =>
        `Zasiłek chorobowy liczymy za każdy dzień niezdolności do pracy od ${od} do ${koniec}, czyli za ${dni} dni.`,
      chorobowyStawka100: ({ procent }: { procent: string }) =>
        `Kod B z zaświadczenia lekarskiego oznacza niezdolność do pracy w okresie ciąży, więc zasiłek chorobowy wynosi ${procent}% podstawy za cały okres niezdolności.`,
      chorobowyStawka80: ({ procent }: { procent: string }) => `Zasiłek chorobowy wynosi ${procent}% podstawy, także za okres pobytu w szpitalu.`,
      chorobowyWyczekiwanie: ({ prawoOd }: { prawoOd: string }) =>
        `Prawo do zasiłku chorobowego powstaje ${prawoOd}, po upływie okresu wyczekiwania, więc zasiłek liczymy od tego dnia.`,
      wynagrodzenieChorobowe: ({ limit, dni }: { limit: string; dni: string }) =>
        `Za pierwsze ${limit} dni niezdolności do pracy w roku kalendarzowym pracownik dostaje od pracodawcy wynagrodzenie za czas choroby, a zasiłek chorobowy od kolejnego dnia. Wyliczenie przyjmuje, że niezdolność ze sprawy jest pierwszą w tym roku kalendarzowym, więc wynagrodzenie obejmuje ${dni} dni.`,
      chorobowyLimit: ({ dni }: { dni: string }) => `Zasiłek chorobowy przysługuje najdłużej przez ${dni} dni niezdolności do pracy.`,
    },
    wyliczeniaSprawy: {
      tytulPorownania: ({ id }: { id: string }) => `Porównanie wyliczeń z rozstrzygnięciem sprawy ${id}`,
      tytulPorownaniaBezId: "Porównanie wyliczeń z rozstrzygnięciem sprawy",
      podpisPorownania: "Porównanie wyliczenia świadczeń z rozstrzygnięciem sprawy",
      przewijaniePorownania: "Tabela porównania z rozstrzygnięciem, przewiń w poziomie",
      kolumnyPorownania: { swiadczenie: "Świadczenie", pole: "Dana", wyliczenie: "Wyliczenie", rozstrzygniecie: "Rozstrzygnięcie sprawy", porownanie: "Porównanie" },
      pola: { prawo: "Prawo do świadczenia", poczatek: "Początek okresu", koniec: "Koniec okresu", kwota: "Miesięczna kwota" },
      prawo: { przysluguje: "Przysługuje", "nie-przysluguje": "Nie przysługuje" },
      zgodne: "Zgodne",
      rozne: "Różne",
      zgodneRoznica: ({ roznica }: { roznica: string }) => `Zgodne, różnica ${roznica}`,
      rozneRoznica: ({ roznica }: { roznica: string }) => `Różne, różnica ${roznica}`,
      brakWRozstrzygnieciu: "Brak w rozstrzygnięciu",
      brakWartosci: "-",
      notaTolerancji: ({ tolerancja }: { tolerancja: string }) =>
        `Daty początku i końca są zgodne, gdy są równe. Kwoty są zgodne, gdy różnią się najwyżej o ${tolerancja}.`,
      okresyTytul: "Okresy, stawki i wypłaty według danych sprawy",
      podpisOkresow: "Okresy świadczeń, stawki i wypłaty wyliczone z danych sprawy",
      przewijanieOkresow: "Tabela okresów świadczeń, przewiń w poziomie",
      kolumnyOkresow: { okres: "Świadczenie albo urlop", od: "Od", do: "Do", dni: "Dni", stawka: "Stawka", miesiecznie: "Miesięcznie", suma: "Za okres" },
      podstawa: ({ kwota, opis }: { kwota: string; opis: string }) => `Podstawa wymiaru ${kwota}. ${opis}`,
      sumaSwiadczenia: ({ swiadczenie, kwota }: { swiadczenie: string; kwota: string }) => `${swiadczenie}: razem ${kwota}.`,
      poza: "Kwota od pracodawcy poza zasiłkiem",
      rodzajeOkresow: {
        zwzm: "Zasiłek w wysokości zasiłku macierzyńskiego",
        "zasilek-chorobowy": "Zasiłek chorobowy",
        "wynagrodzenie-chorobowe": "Wynagrodzenie za czas choroby od pracodawcy",
      },
      brakOkresow: "Według weryfikacji żadne świadczenie z wniosku nie przysługuje, więc porównujemy wyłącznie prawo do świadczeń.",
      brakOkresuWDanych:
        "Dane sprawy nie zawierają okresu, za który liczymy świadczenie, na przykład okresu urlopu z wniosku. Uzupełnij go w danych sprawy, a pokażemy okresy, stawki i wypłaty.",
    },
    ubezpieczenie: {
      tytul: "Czy osoba ma ubezpieczenie chorobowe?",
      tak: ({ rodzaj, okres, zdarzenie }: { rodzaj: string; okres: string; zdarzenie: string }) =>
        `Tak. Osoba ma ${rodzaj} ubezpieczenie chorobowe ${okres} i podlega mu w dniu zdarzenia: ${zdarzenie}.`,
      poUstaniu: ({ rodzaj, okres, zdarzenie }: { rodzaj: string; okres: string; zdarzenie: string }) =>
        `Osoba miała ${rodzaj} ubezpieczenie chorobowe ${okres}. W dniu zdarzenia (${zdarzenie}) ubezpieczenie już ustało, więc prawo do zasiłku zależy od przepisów o świadczeniach po ustaniu ubezpieczenia.`,
      przedPoczatkiem: ({ rodzaj, okres, zdarzenie }: { rodzaj: string; okres: string; zdarzenie: string }) =>
        `Osoba ma ${rodzaj} ubezpieczenie chorobowe ${okres}, które zaczęło się po dniu zdarzenia (${zdarzenie}).`,
      brak: ({ zdarzenie }: { zdarzenie: string }) =>
        `Nie. Osoba nie podlega ubezpieczeniu chorobowemu w dniu zdarzenia (${zdarzenie}), więc zasiłki z ubezpieczenia chorobowego jej nie przysługują.`,
      rodzaje: { obowiazkowe: "obowiązkowe", dobrowolne: "dobrowolne" },
    },
    sprawdzWyliczeniaTutaj: "Wyliczenia pokazujemy poniżej, pod wynikiem weryfikacji.",
    notaNiezaleznoscGosc: "Weryfikacja korzysta wyłącznie z danych tej sprawy.",
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
      zakresKrokow: ({ od, do_, nazwa }: { od: number; do_: number; nazwa: string }) => `${od}–${do_}. ${nazwa}`,
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
      macierzynskiPrzedPorodem: "Urlop macierzyński przed porodem",
      macierzynskiPrzedPorodemZCalym: "Urlop macierzyński przed porodem z całym urlopem rodzicielskim",
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
    powrot: "Instrukcja sprawy",
    kroki: {
      zapisujemy: "Odpowiedzi zapisujemy po każdym kroku.",
      etykietaListy: "Kroki wniosku",
      pozycja: ({ numer, nazwa }: { numer: number; nazwa: string }) => `${numer}. ${nazwa}`,
      pozycjaZakres: ({ od, do_, nazwa }: { od: number; do_: number; nazwa: string }) => `${od}–${do_}. ${nazwa}`,
      zakonczony: "krok zakończony",
    },
    termin: {
      tytul: "Przewidywany termin porodu",
      stanNa: ({ data }: { data: string }) => `Stan na ${data}, z profilu rodziny`,
      etykietaTerminu: "Przewidywany termin porodu",
      etykietaLiczby: "Liczba dzieci",
      zmianaOpis: "Zaświadczenie lekarskie wskazuje inny termin? Zmień go w profilu rodziny. Wniosek zapiszemy, a zakres dat zmieni się zgodnie z nowym terminem.",
      zmianaAkcja: "Zmień przewidywany termin porodu",
    },
    poczatek: {
      tytul: "Dzień początku zasiłku",
      etykieta: "Od kiedy chcesz otrzymywać zasiłek?",
      podpowiedz: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}, w formacie DD.MM.RRRR`,
      notatka: ({ tygodnie }: { tygodnie: string }) =>
        `Część urlopu macierzyńskiego wykorzystana przed porodem zmniejsza część po porodzie. Łącznie urlop trwa ${tygodnie} tygodni.`,
    },
    zaswiadczenie: {
      tytul: "Zaświadczenie lekarskie o przewidywanej dacie porodu",
      opis: "Zasiłek wypłaca ZUS, więc dołącz zaświadczenie. Wyślemy je razem z wnioskiem. Po wysłaniu usuniemy plik z przewodnika i zachowamy tylko jego nazwę.",
      dolaczonyPlik: "Dołączony plik",
      opisPliku: ({ typ, rozmiar }: { typ: string; rozmiar: string }) => `${typ}, ${rozmiar}`,
      usunPlik: "Usuń plik",
      usunPlikEtykieta: ({ nazwa }: { nazwa: string }) => `Usuń plik ${nazwa}`,
      etykietaPola: "Plik zaświadczenia",
      podpowiedz: "Jeden plik PDF, JPG albo PNG, do 10 MB",
    },
    przyciski: {
      wstecz: "Wstecz",
      zapiszDoDokonczenia: "Zapisz do dokończenia",
      dalej: "Dalej",
    },
    boczna: {
      etykieta: "Informacje o wniosku",
      twojWniosek: "Twój wniosek",
      rodzajUrlopu: "Rodzaj urlopu",
      rodzajUrlopuWartosc: "Urlop macierzyński przed porodem",
      forma: "Forma zatrudnienia",
      formaZDobrowolnym: ({ forma }: { forma: string }) => `${forma}, dobrowolne ubezpieczenie chorobowe`,
      platnik: "Płatnik zasiłku",
      zmienRodzaj: "Zmień rodzaj urlopu",
      jesliWczesniejTytul: "Jeśli urodzisz wcześniej",
      jesliWczesniejTresc: "Gdy urodzisz przed wybranym dniem początku, zasiłek zacznie się w dniu porodu. Okres zasiłku zmieni się, gdy potwierdzisz datę porodu w profilu rodziny.",
    },
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      jdg: "Jednoosobowa działalność gospodarcza",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
    },
    platnicy: {
      zus: "ZUS",
      "platnik-skladek": "Płatnik składek",
      nieustalony: "Nieustalony",
      "brak-platnika": "Brak płatnika",
    },
    brakWniosku: "Nie znaleźliśmy wniosku przed porodem. Rozpocznij wniosek z instrukcji sprawy w planie rodziny.",
    brakTerminu: "Uzupełnij przewidywany termin porodu w profilu rodziny.",
    przejdzDoPlanu: "Przejdź do planu rodziny",
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
      wyliczymy: "Pojawi się po wypełnieniu pól",
      zasilek70: "70% podstawy",
    },
    ojcowski: {
      tytul: "Okres urlopu ojcowskiego",
      wstep: "Urlop ojcowski trwa łącznie 14 dni. Wykorzystasz go jednorazowo, od 7 do 14 dni, albo w 2 częściach po 7 dni, do dnia poprzedzającego ukończenie przez dziecko 12 miesięcy.",
      dataPoczatku: "Data początku urlopu",
      liczbaDni: "Liczba dni urlopu",
      podpowiedzDni: ({ od, do_ }: { od: number; do_: number }) => (od === do_ ? `${od} dni` : `Od ${od} do ${do_} dni`),
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
    przyjecie: {
      tytulWum: "Okres urlopu na warunkach urlopu macierzyńskiego",
      wstepWum: ({ data, do_ }: { data: string; do_: string }) =>
        `Urlop na warunkach urlopu macierzyńskiego zaczyna się w dniu przyjęcia dziecka na wychowanie, ${data}, albo we wskazanym dniu, najpóźniej ${do_}.`,
      poczatekWum: "Data początku urlopu na warunkach urlopu macierzyńskiego",
      podpowiedzPoczatkuWum: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}. Puste pole oznacza dzień przyjęcia dziecka.`,
      wymiarTygodni: ({ tygodnie }: { tygodnie: number }) => `${tygodnie} tygodni`,
      wymiarNajkrotszy: "9 tygodni (najkrótszy wymiar)",
      legendaWariantu: "Czy obejmujesz wnioskiem także urlop rodzicielski?",
      caly: "Tak, wniosek z całym urlopem rodzicielskim",
      opisCaly: ({ okresWum, okresRodzicielski, tygodnie, wymiar }: { okresWum: string; okresRodzicielski: string; tygodnie: number; wymiar: number }) =>
        `Urlop na warunkach urlopu macierzyńskiego ${okresWum} i urlop rodzicielski ${okresRodzicielski}, ${tygodnie} z ${wymiar} tygodni. Zasiłek 81,5% podstawy za cały okres.`,
      opisCalyWyrownanie: ({ okresWum, okresRodzicielski, tygodnie, wymiar }: { okresWum: string; okresRodzicielski: string; tygodnie: number; wymiar: number }) =>
        `Urlop na warunkach urlopu macierzyńskiego ${okresWum} z zasiłkiem 81,5% podstawy i urlop rodzicielski ${okresRodzicielski}, ${tygodnie} z ${wymiar} tygodni, z zasiłkiem 70% podstawy. Za urlop na warunkach urlopu macierzyńskiego otrzymasz na wniosek jednorazowe wyrównanie zasiłku do 100% podstawy.`,
      tylko: "Nie, wniosek tylko o urlop na warunkach urlopu macierzyńskiego",
      opisTylko: "Zasiłek 100% podstawy za urlop na warunkach urlopu macierzyńskiego. O urlop rodzicielski złożysz osobny wniosek, zasiłek za ten okres wyniesie 70% podstawy.",
      termin: ({ dni, data }: { dni: string; data: string }) =>
        `Do końca terminu 21 dni od przyjęcia dziecka zostało ${dni}. Wyślij wniosek do ${data}.`,
      bezposrednio: "Bezpośrednio po urlopie na warunkach urlopu macierzyńskiego",
      pozniejOpis: ({ data }: { data: string }) => `Podaj datę początku, najpóźniej ${data}.`,
      boczneTermin: ({ data }: { data: string }) =>
        `Wariant 81,5% wybierzesz do ${data}, czyli w ciągu 21 dni od przyjęcia dziecka. Termin sprawdzimy jeszcze raz w dniu wysłania wniosku.`,
      boczneTerminMinal: ({ data }: { data: string }) =>
        `Termin na wariant 81,5% minął ${data}. Wniosek obejmie urlop na warunkach urlopu macierzyńskiego z zasiłkiem 100% podstawy.`,
      boczneWymiar: ({ wymiar, maks }: { wymiar: number; maks: number }) =>
        `Urlop rodzicielski po przyjęciu dziecka trwa ${wymiar} tygodni. Wykorzystasz do ${maks} tygodni, a 9 tygodni przysługuje wyłącznie drugiemu rodzicowi.`,
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
    powrot: "Instrukcja sprawy",
    powrotZam: "Rodzaj urlopu",
    wstepZWnioskow: "Uzupełniliśmy dane z profilu rodziny i z wniosków. Sprawdź je i przejdź dalej.",
    wstepZProfilu: "Uzupełniliśmy dane z profilu rodziny. Sprawdź je i przejdź dalej.",
    wstep: "Wskaż przyczynę przejęcia i okres urlopu, a potem przejdź dalej.",
    kartaPrzyczyny: "Przyczyna przejęcia",
    legendaPrzyczyny: "Dlaczego przejmujesz urlop",
    przyczyny: {
      rezygnacja: "Rezygnacja matki po 14 tygodniach",
      szpital: "Pobyt matki w szpitalu",
      orzeczenie: "Orzeczenie o niezdolności matki do samodzielnej egzystencji",
      porzucenie: "Porzucenie dziecka przez matkę",
      "smierc-matki": "Śmierć matki",
    },
    kartaOkresu: "Okres urlopu",
    poleDatyPoczatku: "Data początku urlopu",
    podpowiedzPoczatkuZRezygnacji: ({ kogo, od, do_ }: { kogo: string; od: string; do_: string }) =>
      `Zaproponowaliśmy datę powrotu ${kogo} do pracy podaną w jej rezygnacji. Od ${od} do ${do_}, w formacie DD.MM.RRRR.`,
    podpowiedzPoczatku: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}, w formacie DD.MM.RRRR.`,
    poleDatyZdarzenia: "Data zdarzenia",
    opisyZdarzenia: {
      szpital: "Dzień przyjęcia matki do szpitala",
      orzeczenie: "Dzień powstania niezdolności ustalony w orzeczeniu",
      porzucenie: "Dzień porzucenia dziecka przez matkę",
      "smierc-matki": "Dzień śmierci matki",
    },
    podpowiedzZdarzenia: ({ opis, zakres }: { opis: string; zakres: string }) => `${opis}. ${zakres}`,
    podpowiedzZdarzeniaZProfilu: ({ opis, zakres }: { opis: string; zakres: string }) =>
      `${opis}, z profilu rodziny. ${zakres}`,
    zakresDo: ({ do_ }: { do_: string }) => `Do ${do_}, w formacie DD.MM.RRRR.`,
    poleDniPrzed: "Dni urlopu wykorzystane przed porodem",
    podpowiedzDniPrzed:
      "Liczba dni urlopu macierzyńskiego, które matka wykorzystała przed porodem. Od 0 do 42, puste pole oznacza 0 dni.",
    podpowiedzDniPrzedZWniosku: ({ liczba, kogo, data }: { liczba: string; kogo: string; data: string }) =>
      `Zaproponowaliśmy ${liczba} z wniosku ${kogo} o część urlopu przed porodem od ${data}. Od 0 do 42, puste pole oznacza 0 dni.`,
    przejmujesz: "Przejmujesz urlop macierzyński",
    okresZDniami: ({ od, do_, dni }: { od: string; do_: string; dni: string }) => `${od} – ${do_}, ${dni}`,
    okresDoWypisu: ({ od, do_ }: { od: string; do_: string }) =>
      `Od ${od} do dnia wypisu matki ze szpitala, najdłużej do ${do_}`,
    zasilek100: "Zasiłek 100% podstawy wymiaru",
    zobowiazaniePracodawca: "Zobowiązuję się poinformować pracodawcę o wypisie matki ze szpitala.",
    zobowiazaniePlatnik: "Zobowiązuję się poinformować płatnika zasiłku o wypisie matki ze szpitala.",
    kartaZalacznikow: "Załączniki",
    zalaczniki: {
      "odpis-skrocony-aktu-urodzenia": "Odpis skrócony aktu urodzenia dziecka",
      "oswiadczenie-matki-o-rezygnacji": "Oświadczenie matki o zamiarze rezygnacji z dalszej części urlopu macierzyńskiego",
      "oswiadczenie-matki": "Oświadczenie matki",
      "zaswiadczenie-szpitala": "Zaświadczenie szpitala o pobycie matki",
      "oswiadczenie-ojca-z-data-zdarzenia": "Oświadczenie ojca z datą zdarzenia",
      "kopia-orzeczenia": "Kopia prawomocnego orzeczenia o niezdolności matki do samodzielnej egzystencji",
      "zaswiadczenie-platnika-zasilku-matki":
        "Zaświadczenie płatnika zasiłku matki o okresie przysługującego i wypłaconego zasiłku macierzyńskiego i o jego stawce procentowej",
      "zaswiadczenie-placowki-o-przyjeciu": "Zaświadczenie placówki leczniczej o dacie przyjęcia matki",
      "zaswiadczenie-placowki-o-wypisie": "Zaświadczenie placówki leczniczej o dacie wypisu matki",
      "orzeczenie-o-niezdolnosci-matki": "Orzeczenie o niezdolności matki do samodzielnej egzystencji",
    },
    kartaDanych: "Dane z profilu rodziny",
    matkaDziecka: "Matka dziecka",
    rezygnacjaMatki: "Rezygnacja matki",
    rezygnacjaZWnioskow: ({ data }: { data: string }) => `Powrót do pracy ${data}, z wniosków`,
    sytuacjaSzczegolna: "Sytuacja szczególna",
    sytuacje: {
      szpital: ({ data }: { data: string }) => `Pobyt matki w szpitalu od ${data}`,
      orzeczenie: ({ data }: { data: string }) => `Orzeczenie o niezdolności matki do samodzielnej egzystencji, ${data}`,
      porzucenie: ({ data }: { data: string }) => `Porzucenie dziecka przez matkę, ${data}`,
      "smierc-matki": ({ data }: { data: string }) => `Śmierć matki, ${data}`,
    },
    twojaForma: "Twoja forma zatrudnienia",
    kartaTerminu: "Termin wniosku",
    terminZData: ({ data }: { data: string }) =>
      `Wniosek składasz pracodawcy co najmniej 14 dni przed rozpoczęciem urlopu, czyli do ${data}.`,
    termin: "Wniosek składasz pracodawcy co najmniej 14 dni przed rozpoczęciem urlopu.",
    kartaSzkicu: "Szkic wniosku",
    brakDatyPorodu: "Wniosek przygotujesz po potwierdzeniu daty porodu w profilu rodziny.",
    brakWniosku: "Nie znaleźliśmy szkicu wniosku o zasiłek macierzyński. Wybierz rodzaj urlopu w kreatorze wniosku.",
    przejdzDoRodzajuUrlopu: "Przejdź do wyboru rodzaju urlopu",
    opisRodzajuZam:
      "Pozostała część urlopu macierzyńskiego po rezygnacji matki albo w sytuacji szczególnej, z zasiłkiem 100% podstawy.",
    sytuacjaMatkiZam: {
      tytul: "Sytuacja matki dziecka",
      skrocenie: ({ data }: { data: string }) =>
        `Matka dziecka skróciła okres pobierania zasiłku macierzyńskiego. Ostatni dzień zasiłku matki: ${data}.`,
      matka: ({ imieINazwisko, pesel }: { imieINazwisko: string; pesel: string }) =>
        `Matka dziecka: ${imieINazwisko}, PESEL ${pesel}.`,
      zaswiadczenie: "Do wniosku dołącz zaświadczenie płatnika zasiłku matki.",
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
      adres: "Adres zamieszkania",
      chorobowe: "Ubezpieczenie chorobowe",
      chorobowePodlegam: "Podlegam dobrowolnemu ubezpieczeniu chorobowemu",
      telefon: "Numer telefonu (opcjonalnie)",
      telefonPodpowiedz: "9 cyfr, możesz poprzedzić je prefiksem +48",
    },
    platnikSkladek: {
      tytul: "Dane płatnika składek",
      wstep: "Dane pochodzą z Twojego konta ZUS, nie zmienisz ich we wniosku.",
      nazwa: "Nazwa albo imię i nazwisko",
      nip: "NIP",
      regon: "REGON",
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
      numer: "Numer rachunku (opcjonalnie)",
      podpowiedz: "26 cyfr, możesz wpisać je ze spacjami",
    },
    brakPesel: {
      tytul: "Nie masz jeszcze numeru PESEL dziecka?",
      tresc: "Zapisz wniosek i wróć do niego z instrukcji sprawy w planie rodziny. Odpowiedzi z poprzednich kroków zachowamy.",
    },
    przekazanie: {
      naglowek: "Dane dziecka do wniosku o zasiłek macierzyński",
      tytul: "Dane dziecka z profilu rodziny",
      wstep: "Sprawdź dane dziecka. Po potwierdzeniu przekażemy je ZUS do wniosku złożonego przed porodem.",
      liczbaDzieci: "Liczba urodzonych dzieci",
      brakDanych: "Uzupełnij imię, nazwisko i numer PESEL dziecka w profilu rodziny, a potem wróć do przekazania danych.",
      uzupelnijProfil: "Uzupełnij dane w profilu",
      potwierdz: "Potwierdź i przekaż dane",
      powrot: "Wróć do sprawy",
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
    przyjecie: {
      tytul: "Oświadczenie o dacie przyjęcia dziecka",
      tresc: ({ dziecko, data }: { dziecko: string; data: string }) =>
        `Oświadczam, że przyjęłam dziecko ${dziecko} na wychowanie ${data}.`,
      trescBezImienia: ({ data }: { data: string }) => `Oświadczam, że przyjęłam dziecko na wychowanie ${data}.`,
    },
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
    zakladkiEtykieta: "Sekcje wniosku",
    zakladki: {
      rodzaj: "Rodzaj urlopu",
      okres: "Okres zasiłku",
      dane: "Dane osób",
      rachunek: "Rachunek",
      oswiadczenia: "Oświadczenia",
      adresat: "Adresat",
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
    przekazPocztowy: "Przekaz pocztowy na adres zamieszkania z konta ZUS",
    rachunekNiepodany: "Bez numeru rachunku",
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
    powrot: "Plan rodziny",
    dokument: {
      tytul: "Dokument wniosku",
      opisPliku: ({ data }: { data: string }) => `PDF, przygotowany ${data}`,
      pobierz: "Pobierz wniosek (PDF)",
      drukuj: "Drukuj wniosek",
      notatkaDruku: "Wniosek wydrukujesz z podglądu wydruku w przeglądarce.",
    },
    coPrzekazac: {
      tytul: "Co przekazać płatnikowi",
      teraz: "Teraz",
      poPorodzie: "Po porodzie",
      wniosek: "Wniosek o zasiłek macierzyński (ZAM): plik PDF albo wydruk z tej strony.",
      odpis: "Skrócony odpis aktu urodzenia dziecka. Otrzymasz go w urzędzie stanu cywilnego.",
      odpisPoPorodzie: "Skrócony odpis aktu urodzenia dziecka. Otrzymasz go w urzędzie stanu cywilnego, a my przypomnimy Ci o nim przy sprawie w planie.",
      zaswiadczenie: "Zaświadczenie lekarskie o przewidywanej dacie porodu.",
      oznaczPoDokumentach: "Gdy przekażesz dokumenty, oznacz sprawę w planie jako złożoną.",
      oznaczPoWniosku: "Gdy przekażesz wniosek, oznacz sprawę w planie jako złożoną.",
    },
    dokumentyPrzyjecia: {
      "zaswiadczenie-sadu-przysposobienie":
        "zaświadczenie sądu opiekuńczego o dacie wystąpienia o przysposobienie z datą urodzenia dziecka albo kopię wniosku o przysposobienie z datą urodzenia dziecka i poświadczeniem sądu o dacie wystąpienia",
      "orzeczenie-albo-umowa-ze-starosta":
        "orzeczenie sądu o umieszczeniu dziecka w rodzinie zastępczej, prawomocne albo wydane w trybie zabezpieczenia, albo umowę ze starostą",
      "dokument-wieku-dziecka": "dokument potwierdzający wiek dziecka",
      "decyzja-odroczenia-obowiazku-szkolnego": "decyzję o odroczeniu obowiązku szkolnego",
    },
    dokumentPrzyjeciaKrok: ({ dokument }: { dokument: string }) => `${dokument.charAt(0).toUpperCase()}${dokument.slice(1)}.`,
    sprawa: {
      tytul: "Sprawa w Twoim planie",
      tytulSprawy: ({ id, tytul }: { id: string; tytul: string }) => (tytul && tytul !== id ? `${id} ${tytul}` : id),
      tytulDomyslny: "Wniosek o zasiłek macierzyński",
      status: "Status: do zrobienia, wniosek przygotowany.",
      poPorodzie: "Gdy potwierdzisz datę porodu, sprawa dostanie oznaczenie: odpis aktu urodzenia do przekazania płatnikowi.",
      przejdzDoPlanu: "Przejdź do planu rodziny",
    },
    szczegoly: {
      tytul: "Szczegóły wniosku",
      etykieta: "Szczegóły wniosku",
      rodzajUrlopu: "Rodzaj urlopu",
      dzienPoczatku: "Dzień początku zasiłku",
      terminPorodu: "Przewidywany termin porodu",
      okres: "Okres",
      zasilek: "Zasiłek",
      adresat: "Adresat",
      dziecko: "Dziecko",
      adresatPlatnik: "Płatnik składek",
      okresWartosc: ({ od, do_ }: { od: string; do_: string }) => `${od} – ${do_}`,
      stawka: ({ procent }: { procent: string }) => `${procent} podstawy`,
      stawkaCalyOkres: ({ procent }: { procent: string }) => `${procent} podstawy za cały okres`,
      przedPorodem: ({ rodzaj }: { rodzaj: string }) => `${rodzaj} przed porodem`,
      zCalymRodzicielskim: ({ rodzaj }: { rodzaj: string }) => `${rodzaj} z całym urlopem rodzicielskim`,
    },
    rodzajeUrlopu: {
      macierzynski: "Urlop macierzyński",
      "czesc-przed-porodem": "Urlop macierzyński",
      rodzicielski: "Urlop rodzicielski",
      uzupelniajacy: "Uzupełniający urlop macierzyński",
      ojcowski: "Urlop ojcowski",
      "na-warunkach-macierzynskiego": "Urlop na warunkach urlopu macierzyńskiego",
      "przejety-macierzynski": "Urlop macierzyński przejęty od matki",
      "laczenie-z-praca": "Urlop rodzicielski łączony z pracą",
    },
    formyPrzyjecia: {
      przysposobienie: "Przysposobienie",
      "rodzina-zastepcza-niezawodowa": "Rodzina zastępcza niezawodowa",
      "rodzina-zastepcza-zawodowa": "Rodzina zastępcza zawodowa",
    },
    pdf: {
      tytul: "Wniosek o zasiłek macierzyński (ZAM)",
      podtytulPrzedPorodem: "Wniosek złożony przed porodem",
      sekcjaWnioskodawca: "Wnioskodawca",
      sekcjaDziecko: "Dziecko",
      sekcjaPrzedPorodem: "Początek zasiłku przed porodem",
      sekcjaPrzyjecie: "Przyjęcie dziecka na wychowanie",
      sekcjaOkresy: "Okresy zasiłku",
      sekcjaWyplata: "Wypłata i adresat",
      imieINazwisko: "Imię i nazwisko",
      pesel: "PESEL",
      dataUrodzenia: "Data urodzenia",
      miejsceUrodzenia: "Miejsce urodzenia",
      formaPrzyjecia: "Forma przyjęcia",
      dataPrzyjecia: "Data przyjęcia",
      numerRachunku: "Numer rachunku",
      oswiadczenia: "Oświadczenia",
      oswiadczeniaPotwierdzone: "Wnioskodawca potwierdził oświadczenia wniosku.",
      oswiadczenieZaZyciem: "Dziecko ma zaświadczenie „Za życiem”.",
      dataPrzygotowania: "Data przygotowania",
      wiersz: ({ etykieta, wartosc }: { etykieta: string; wartosc: string }) => `${etykieta}: ${wartosc}`,
      okres: ({ rodzaj, od, do_, stawka }: { rodzaj: string; od: string; do_: string; stawka: string }) =>
        `${rodzaj}: ${od} – ${do_}, ${stawka} podstawy`,
      brakDanychDziecka: "Dane dziecka wnioskodawca przekaże płatnikowi po porodzie.",
      stopka: "Dokument przygotowany w przewodniku w trybie demonstracyjnym.",
    },
    podsumowanie: {
      tytulAdresata: "Adresat wniosku",
      adresat: ({ nazwa }: { nazwa: string }) => `Płatnik składek: ${nazwa}`,
      adresatBezNazwy: "Płatnik składek",
      informacjaOOdpisie: "Płatnikowi przekażesz wniosek razem ze skróconym odpisem aktu urodzenia dziecka.",
      informacjaPrzedPorodem: "Płatnikowi przekażesz wniosek razem z zaświadczeniem lekarskim o przewidywanej dacie porodu, a po porodzie skrócony odpis aktu urodzenia dziecka.",
      przygotuj: "Przygotuj wniosek",
    },
    brakWniosku: "Nie znaleźliśmy przygotowanego wniosku. Wróć do planu rodziny.",
    // koniec ViewZamForPayer
  },
  ViewZas53Start: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53)",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    powrot: "Zasiłek chorobowy w ciąży",
    kartaBlokady: "Ten wniosek Cię nie dotyczy",
    kartaUbezpieczenia: "Twoje ubezpieczenie",
    tytulUbezpieczenia: "Tytuł ubezpieczenia",
    ubezpieczenieChorobowe: "Ubezpieczenie chorobowe",
    platnikSkladek: "Płatnik składek",
    platnikZasilku: "Płatnik zasiłku",
    zus: "ZUS",
    brakTytulu: "Brak tytułu do ubezpieczenia",
    rodzajeTytulu: {
      pracownik: "Umowa o pracę",
      zleceniobiorca: "Umowa zlecenia",
      dzialalnosc: "Jednoosobowa działalność gospodarcza",
    },
    rodzajeChorobowego: {
      obowiazkowe: "Obowiązkowe",
      dobrowolne: "Dobrowolne",
      brak: "Brak",
    },
    chorobowe: ({ rodzaj, od }: { rodzaj: string; od: string }) => `${rodzaj}, od ${od}`,
    chorobowetrwa: ({ rodzaj }: { rodzaj: string }) => `${rodzaj}, trwa`,
    chorobowe0083: "Brak ubezpieczenia chorobowego",
    opis0233: "Instrukcja sprawy powie Ci, jakie dokumenty przekazuje płatnik składek (Z-3, ZAS-12 albo Z-3a) i co możesz zrobić samodzielnie.",
    opis0083: "Plan rodziny pokaże świadczenia, które przysługują Ci bez ubezpieczenia chorobowego.",
    opis0004: "Zaświadczenie z kodem B wskazuje ciążę, dlatego wniosek wymaga zgody na dane dotyczące zdrowia. Zgody udzielisz w ustawieniach przewodnika.",
    akcja0233: "Przejdź do instrukcji sprawy",
    akcja0083: "Przejdź do planu rodziny",
    akcja0004: "Przejdź do ustawień",
    otwieranie: "Otwieramy wniosek",
    kreator: {
      zapisujemy: "Odpowiedzi zapisujemy po każdym kroku.",
      krok: ({ krok, liczbaKrokow, nazwa }: { krok: number; liczbaKrokow: number; nazwa: string }) =>
        `Krok ${krok} z ${liczbaKrokow}: ${nazwa}`,
      postep: ({ krok, liczbaKrokow }: { krok: number; liczbaKrokow: number }) => `Krok ${krok} z ${liczbaKrokow}`,
      listaKrokow: "Kroki wniosku",
      kroki: {
        ViewZas53Certificate: "Zaświadczenie lekarskie",
        ViewZas53AfterInsurance: "Oświadczenie Z-10",
        ViewZas53Data: "Dane i wypłata",
        ViewZas53Summary: "Podsumowanie",
      },
      numerKroku: ({ numer, nazwa }: { numer: number; nazwa: string }) => `${numer}. ${nazwa}`,
      wstecz: "Wstecz",
      zapiszDoDokonczenia: "Zapisz do dokończenia",
      dalej: "Dalej",
      twojWniosek: "Twój wniosek",
      zaswiadczenie: "Zaświadczenie",
      zaswiadczenieKod: ({ numer, kody }: { numer: string; kody: string }) => `${numer}, kod ${kody}`,
      zaswiadczenieBezKodu: ({ numer }: { numer: string }) => `${numer}, bez kodu literowego`,
      zaswiadczenieAlternatywne: ({ numer }: { numer: string }) =>
        `${numer}, w trybie alternatywnym, plik dołączysz na podsumowaniu`,
      bezNumeru: "bez serii i numeru",
      okresNiezdolnosci: "Okres niezdolności",
      okresZDniami: ({ od, do: koniec, dni }: { od: string; do: string; dni: string }) => `${od} – ${koniec}, ${dni} dni`,
      okres: ({ od, do: koniec }: { od: string; do: string }) => `${od} – ${koniec}`,
      okresWyczekiwania: "Okres wyczekiwania",
      okresWyczekiwaniaWartosc: ({ od, do: koniec }: { od: string; do: string }) => `${od} – ${koniec}, bez zasiłku`,
      zasilekPrzysluguje: "Zasiłek przysługuje",
      stawka: "Stawka",
      stawkaWartosc: ({ procent }: { procent: string }) => `${procent} podstawy wymiaru`,
      ubezpieczenie: "Ubezpieczenie chorobowe",
      wUbezpieczeniu: "Niezdolność w okresie ubezpieczenia",
      poUstaniu: ({ data }: { data: string }) => `Ustało ${data}, niezdolność po ustaniu ubezpieczenia`,
      platnikZasilku: "Płatnik zasiłku",
      z10: "Oświadczenie Z-10",
      z10Dolaczone: "Dołączymy do wniosku",
      zmienZaswiadczenie: "Zmień zaświadczenie",
      brakWniosku: "Nie znaleźliśmy tego wniosku. Rozpocznij wniosek przy sprawie Zasiłek chorobowy w ciąży.",
      rozpocznij: "Rozpocznij wniosek",
      zakresKrokow: ({ od, do: koniec, nazwa }: { od: number; do: number; nazwa: string }) => `${od}–${koniec}. ${nazwa}`,
    },
    // koniec ViewZas53Start
  },
  ViewZas53Certificate: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): zaświadczenie lekarskie",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    karta: "Zaświadczenie lekarskie",
    wstep: "Wybierz zaświadczenie, za które składasz wniosek. Pokazujemy zaświadczenia e-ZLA z Twojego konta ZUS, od najnowszego.",
    stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
    legenda: ({ liczba }: { liczba: number }) => `Zaświadczenia e-ZLA (${liczba})`,
    brakZaswiadczen: "Nie masz na koncie ZUS zaświadczeń e-ZLA, do których możesz złożyć wniosek.",
    okresZDniami: ({ od, do: koniec, dni }: { od: string; do: string; dni: string }) => `${od} – ${koniec}, ${dni} dni`,
    kodLiterowy: ({ kody }: { kody: string }) => `Kod literowy: ${kody}`,
    bezKodu: "Bez kodu literowego",
    kody: { B: "B (ciąża)", E: "E (choroba zakaźna)" },
    platnik: ({ nazwa }: { nazwa: string }) => `Płatnik składek: ${nazwa}`,
    trybAlternatywny: "Zaświadczenie w trybie alternatywnym",
    spozaListyTytul: "Masz zaświadczenie spoza listy?",
    spozaListyOpis: "Jeśli lekarz wystawił zaświadczenie na wydrukowanym formularzu (w trybie alternatywnym), wpisz jego okres. Plik zaświadczenia dołączysz na podsumowaniu.",
    spozaListyAkcja: "Dodaj zaświadczenie spoza listy",
    notatkaWyslane: "Na liście są tylko zaświadczenia, za które nie wysłano jeszcze wniosku ZAS-53 z przewodnika.",
    coSprawdzimy: "Co sprawdzimy po wyborze",
    coSprawdzimyPozycje: [
      "od kiedy przysługuje Ci zasiłek,",
      "stawkę: 100% podstawy z kodem B, 80% bez niego,",
      "okres zasiłkowy w ciąży, który trwa 270 dni,",
      "stan rozliczeń składek w pierwszym dniu niezdolności.",
    ],
    poUstaniuTytul: "Zasiłek po ustaniu ubezpieczenia",
    poUstaniuPozycje: [
      "niezdolność do pracy powstała w czasie ubezpieczenia albo najpóźniej 14. dnia po jego ustaniu,",
      "przy chorobie zakaźnej z kodem E: w ciągu 3 miesięcy od ustania,",
      "niezdolność trwa bez przerwy co najmniej 30 dni,",
      "do wniosku dołączymy oświadczenie Z-10.",
    ],
    akcjaPlan: "Przejdź do planu rodziny",
    akcjaPytanie: "Zadaj pytanie ZUS",
    // koniec ViewZas53Certificate
  },
  ViewZas53AfterInsurance: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): oświadczenie Z-10",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    karta: "Okoliczności po ustaniu ubezpieczenia",
    wstep: "Odpowiedz na każde pytanie. Z odpowiedzi przygotujemy oświadczenie Z-10 i dołączymy je do wniosku.",
    pytania: {
      1: "1. Czy masz ustalone prawo do emerytury albo renty z tytułu niezdolności do pracy?",
      6: "2. Czy masz prawo do zagranicznej emerytury albo zagranicznej renty z tytułu niezdolności do pracy?",
      2: "3. Czy masz złożony wniosek o emeryturę, rentę z tytułu niezdolności do pracy, rodzicielskie świadczenie uzupełniające albo nauczycielskie świadczenie kompensacyjne?",
      3: "4. Czy masz prawo do zasiłku dla bezrobotnych, zasiłku przedemerytalnego albo świadczenia przedemerytalnego?",
      4: "5. Czy po ustaniu ubezpieczenia wykonujesz pracę albo inną działalność zarobkową?",
      5: "6. Czy pobierasz stypendium albo inne świadczenie z powiatowego urzędu pracy?",
      7: "7. Czy przed ustaniem ubezpieczenia byłaś na urlopie bezpłatnym u jednego pracodawcy w czasie zatrudnienia u innego?",
    },
    tak: "Tak",
    nie: "Nie",
    informacja: {
      1: "Kto ustalił prawo do świadczenia",
      6: "Kto ustalił prawo do świadczenia",
      2: "Gdzie złożono wniosek",
    },
    data: {
      1: "Od kiedy",
      2: "Data złożenia wniosku",
      3: "Od kiedy",
      4: "Od kiedy",
      5: "Od kiedy",
      6: "Od kiedy",
    },
    urlopOd: "Urlop bezpłatny od",
    urlopDo: "Urlop bezpłatny do",
    hektary: "Liczba hektarów przeliczeniowych",
    podpowiedzHektarow: "Na przykład 1,50",
    podpowiedzDaty: "W formacie DD.MM.RRRR",
    rodzaj: "Rodzaj działalności zarobkowej",
    rodzaje: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      "dzialalnosc-pozarolnicza": "Działalność pozarolnicza albo współpraca przy niej",
      "gospodarstwo-rolne": "Gospodarstwo rolne Twoje albo małżonka",
      "dzial-specjalny": "Dział specjalny produkcji rolnej Twój albo małżonka",
      krus: "Obowiązkowe ubezpieczenie społeczne rolników, także jako domownik rolnika",
      "krus-dobrowolne": "Dobrowolne ubezpieczenie społeczne rolników, także jako domownik rolnika",
      inna: "Inna działalność zarobkowa",
    },
    kiedyNie: "Kiedy zasiłek nie przysługuje",
    kiedyNiePozycje: [
      "masz ustalone prawo do emerytury albo renty z tytułu niezdolności do pracy,",
      "masz prawo do zasiłku dla bezrobotnych, zasiłku albo świadczenia przedemerytalnego,",
      "masz prawo do nauczycielskiego świadczenia kompensacyjnego albo rodzicielskiego świadczenia uzupełniającego,",
      "wykonujesz pracę, która daje tytuł do ubezpieczenia chorobowego,",
      "podlegasz obowiązkowo ubezpieczeniu społecznemu rolników.",
    ],
    akcjaPytanie: "Zadaj pytanie ZUS",
    // koniec ViewZas53AfterInsurance
  },
  ViewZas53Data: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): dane",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    kartaWnioskodawcy: "Dane wnioskodawcy",
    kartaPlatnika: "Płatnik składek",
    notatkaDanych: "Dane pochodzą z Twojego konta ZUS, więc nie zmienisz ich we wniosku. Zmianę adresu zgłosisz w eZUS.",
    stanNa: ({ data }: { data: string }) => `Stan na ${data}`,
    imieINazwisko: "Imię i nazwisko",
    pesel: "PESEL",
    adres: "Adres",
    brakDanej: "Brak w danych konta ZUS",
    platnikDzialalnosc: "Prowadzisz działalność, więc płatnikiem składek jesteś Ty. Zasiłek wypłaci Ci ZUS.",
    platnikPoUstaniu: "To płatnik składek, u którego ustał Twój tytuł ubezpieczenia chorobowego. Zasiłek po ustaniu ubezpieczenia wypłaci Ci ZUS.",
    nazwaPlatnika: "Nazwa albo imię i nazwisko",
    nip: "NIP",
    regon: "REGON",
    kartaWyplaty: "Kontakt i wypłata zasiłku",
    telefon: "Numer telefonu (opcjonalnie)",
    telefonZUstawien: "Uzupełniliśmy numer potwierdzony w ustawieniach przypomnień.",
    telefonPodpowiedz: "9 cyfr, możesz poprzedzić je prefiksem +48.",
    rachunek: "Numer rachunku (opcjonalnie)",
    rachunekPodpowiedz: "26 cyfr, możesz wpisać je ze spacjami. Jeśli nie podasz numeru, ZUS wypłaci zasiłek przekazem pocztowym.",
    kartaWypadku: "Wypadek albo choroba zawodowa",
    pytanieWypadku: "Czy niezdolność do pracy jest skutkiem wypadku przy pracy, wypadku w drodze do pracy lub z pracy albo choroby zawodowej?",
    tak: "Tak",
    nie: "Nie",
    notatkaWypadku: "Jeśli odpowiesz Tak, wskażesz przyczynę i dokument, który ją potwierdza: decyzję, protokół albo kartę wypadku.",
    przyczyna: "Przyczyna niezdolności do pracy",
    przyczyny: {
      "wypadek-przy-pracy": "Wypadek przy pracy",
      "wypadek-w-drodze": "Wypadek w drodze do pracy lub z pracy",
      "choroba-zawodowa": "Choroba zawodowa",
    },
    rodzajDokumentu: "Rodzaj dokumentu potwierdzającego",
    rodzajeDokumentu: {
      decyzja: "Decyzja",
      protokol: "Protokół",
      "karta-wypadku": "Karta wypadku",
    },
    numerDokumentu: "Numer dokumentu",
    dataDokumentu: "Data sporządzenia",
    podpowiedzDaty: "W formacie DD.MM.RRRR",
    notatkaDokumentu: "Dokument dodamy do listy załączników na podsumowaniu, gdzie możesz dołączyć jego plik. Przy wypadku albo chorobie zawodowej zasiłek przysługuje od pierwszego dnia ubezpieczenia.",
    zobaczPoprzedni: "Zobacz poprzedni wniosek",
    zobaczStanRozliczen: "Zobacz stan rozliczeń składek",
    kartaDokumentu: "Dokument potwierdzający",
    // koniec ViewZas53Data
  },
  ViewZas53Summary: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53): podsumowanie",
    naglowek: "Wniosek o zasiłek chorobowy (ZAS-53)",
    wstep: "Sprawdź wniosek przed wysłaniem. Każdą sekcję możesz zmienić.",
    zmien: "Zmień",
    zmienSekcje: ({ sekcja }: { sekcja: string }) => `Zmień: ${sekcja}`,
    kartaZaswiadczenia: "Zaświadczenie lekarskie",
    seriaINumer: "Seria i numer",
    zEzla: ({ numer }: { numer: string }) => `${numer}, e-ZLA z konta ZUS`,
    zTrybuAlternatywnego: ({ numer }: { numer: string }) => `${numer}, zaświadczenie w trybie alternatywnym`,
    okresNiezdolnosci: "Okres niezdolności do pracy",
    kodLiterowy: "Kod literowy",
    kody: { B: "B (ciąża)", E: "E (choroba zakaźna)" },
    bezKodu: "Brak",
    zasilekPrzysluguje: "Zasiłek przysługuje",
    stawkaZasilku: "Stawka zasiłku",
    ubezpieczenie: "Ubezpieczenie chorobowe",
    wUbezpieczeniu: "Niezdolność w okresie ubezpieczenia",
    wUbezpieczeniuOd: ({ rodzaj, od }: { rodzaj: string; od: string }) =>
      `Niezdolność w okresie ubezpieczenia (${rodzaj} od ${od})`,
    poUstaniu: ({ data }: { data: string }) => `Niezdolność po ustaniu tytułu ubezpieczenia chorobowego ${data}`,
    kartaZ10: "Oświadczenie Z-10",
    odpowiedzTak: "Tak",
    odpowiedzNie: "Nie",
    kartaWnioskodawcy: "Wnioskodawca i płatnik składek",
    wnioskodawca: "Wnioskodawca",
    wnioskodawcaWartosc: ({ imieINazwisko, pesel }: { imieINazwisko: string; pesel: string }) => `${imieINazwisko}, PESEL ${pesel}`,
    adres: "Adres",
    telefon: "Numer telefonu",
    brakTelefonu: "Nie podano",
    platnik: "Płatnik składek",
    platnikWartosc: ({ nazwa, nip, regon }: { nazwa: string; nip: string; regon: string }) => `${nazwa}, NIP ${nip}, REGON ${regon}`,
    kartaWyplaty: "Wypłata zasiłku",
    rachunek: "Numer rachunku",
    kartaWypadku: "Wypadek albo choroba zawodowa",
    wypadekNie: "Nie, niezdolność do pracy nie jest skutkiem wypadku ani choroby zawodowej.",
    odpowiedz: "Odpowiedź",
    wypadekTak: ({ przyczyna }: { przyczyna: string }) => `Tak, ${przyczyna}`,
    dokument: "Dokument potwierdzający",
    dokumentWartosc: ({ rodzaj, numer, data }: { rodzaj: string; numer: string; data: string }) => `${rodzaj} ${numer} z ${data}`,
    kartaAdresata: "Adresat i załączniki",
    adresat: "Wniosek trafi do",
    adresatWartosc: "ZUS, tak samo jak wnioski składane w eZUS",
    bezZalacznikow: ({ numer }: { numer: string }) => `Wniosek nie wymaga załączników, bo ZUS ma już zaświadczenie e-ZLA ${numer}.`,
    dokumentyBiernik: {
      zaswiadczenie: ({ numer }: { numer: string }) => `zaświadczenie lekarskie ${numer} otrzymane od lekarza`,
      decyzja: ({ numer }: { numer: string }) => `decyzję ${numer}`,
      protokol: ({ numer }: { numer: string }) => `protokół ${numer}`,
      "karta-wypadku": ({ numer }: { numer: string }) => `kartę wypadku ${numer}`,
      z10: "oświadczenie Z-10 z odpowiedziami z przewodnika",
    },
    plikZaswiadczenia: ({ numer }: { numer: string }) => `Zaświadczenie lekarskie ${numer} otrzymane od lekarza`,
    plikDokumentu: {
      decyzja: ({ numer }: { numer: string }) => `Decyzja ${numer} (opcjonalnie)`,
      protokol: ({ numer }: { numer: string }) => `Protokół ${numer} (opcjonalnie)`,
      "karta-wypadku": ({ numer }: { numer: string }) => `Karta wypadku ${numer} (opcjonalnie)`,
    },
    plikWymagany: "Wymagany. PDF, JPG albo PNG, najwyżej 10 MB.",
    plikOpcjonalny: "PDF, JPG albo PNG, najwyżej 10 MB.",
    plikDolaczony: ({ nazwa }: { nazwa: string }) => `Dołączony plik: ${nazwa}`,
    plikOdrzucony: ({ nazwa }: { nazwa: string }) => `Nie dołączono pliku ${nazwa}.`,
    z10Zalacznik: "Oświadczenie Z-10 z odpowiedziami z przewodnika",
    z10Generowane: "Przygotujemy je z Twoich odpowiedzi.",
    oswiadczenie: "Oświadczam, że dane we wniosku są zgodne z prawdą, a o ich zmianie poinformuję ZUS.",
    wyslij: "Wyślij wniosek",
    wyslijNieaktywne: ({ numer }: { numer: string }) => `Wyślesz wniosek, gdy dołączysz plik zaświadczenia ${numer}.`,
    poWyslaniu: "Po wysłaniu",
    poWyslaniuTresc: ({ numer }: { numer: string }) =>
      `Dostaniesz numer potwierdzenia, a sprawa Zasiłek chorobowy w ciąży w Twoim planie będzie miała status złożona. Zaświadczenie ${numer} zniknie z listy do kolejnych wniosków.`,
    sprawaPowiazana: "Sprawa powiązana",
    sprawaPowiazanaTresc: ({ od, do: koniec }: { od: string; do: string }) =>
      `Masz w planie zasiłek w wysokości zasiłku macierzyńskiego po utracie pracy w ciąży za okres ${od} – ${koniec}, który obejmuje okres tego wniosku.`,
    sprawaPowiazanaAkcja: "Zasiłek w wysokości zasiłku macierzyńskiego po utracie pracy w ciąży",
    odLekarza: "Zaświadczenie od lekarza",
    odLekarzaTresc: "Zrób zdjęcie albo skan formularza, który lekarz wydrukował i podpisał. ZUS nie ma tego zaświadczenia, dlatego musisz dołączyć plik.",
    zakladkiEtykieta: "Sekcje wniosku",
    zakladki: {
      zaswiadczenie: "Zaświadczenie",
      prawo: "Zasiłek",
      z10: "Z-10",
      wnioskodawca: "Wnioskodawca",
      wyplata: "Wypłata",
      wypadek: "Wypadek",
      zalaczniki: "Załączniki",
      pliki: "Pliki",
    },
    kartaPrawa: "Prawo do zasiłku",
    kartaPlikow: "Pliki załączników",
    // koniec ViewZas53Summary
  },
  ViewZas53Sent: {
    tytulStrony: "Wniosek o zasiłek chorobowy (ZAS-53) wysłany",
    naglowek: "Wniosek wysłany",
    powrot: "Plan rodziny",
    kartaPotwierdzenia: "Potwierdzenie wysłania",
    numer: "Numer potwierdzenia",
    dataWyslania: "Data wysłania",
    adresat: "Adresat",
    zus: "ZUS",
    wniosek: "Wniosek",
    wniosekWartosc: "Wniosek o zasiłek chorobowy (ZAS-53)",
    zaswiadczenie: "Zaświadczenie",
    zaswiadczenieWartosc: ({ numer, od, do: koniec }: { numer: string; od: string; do: string }) => `${numer}, ${od} – ${koniec}`,
    okres: "Okres",
    wUbezpieczeniu: "W ubezpieczeniu chorobowym",
    poUstaniu: ({ data }: { data: string }) => `Po ustaniu tytułu ubezpieczenia chorobowego ${data}`,
    zasilek: "Zasiłek",
    zasilekWartosc: ({ procent, od, do: koniec }: { procent: string; od: string; do: string }) =>
      `${procent} podstawy wymiaru za ${od} – ${koniec}`,
    zalaczniki: "Załączniki",
    brakZalacznikow: "-",
    kartaSprawy: "Sprawa w Twoim planie",
    sprawa: "Zasiłek chorobowy w ciąży",
    status: ({ status, data }: { status: string; data: string }) => `Status: ${status}, ${data}`,
    doPlanu: "Przejdź do planu rodziny",
    doWnioskow: "Zobacz w Twoich wnioskach",
    coDalej: "Co dalej",
    naRachunek: "ZUS wypłaci zasiłek na rachunek:",
    przekazem: ({ adres }: { adres: string }) => `ZUS wypłaci zasiłek przekazem pocztowym na adres ${adres}.`,
    kolejne: ({ numer }: { numer: string }) =>
      `Gdy lekarz przedłuży niezdolność do pracy, złożysz wniosek za kolejne zaświadczenie z tej samej sprawy. Zaświadczenie ${numer} zniknie z listy.`,
    ezla: "Zaświadczenia lekarskie e-ZLA",
    // koniec ViewZas53Sent
  },
  ViewLeaveRequestType: {
    tytulStrony: "Wniosek o urlop do pracodawcy: rodzaj wniosku",
    naglowek: "Wniosek o urlop do pracodawcy",
    powrot: "Instrukcja sprawy",
    etykietaKrokow: "Kroki wniosku",
    nazwyKrokow: ["Rodzaj wniosku", "Wniosek", "Podsumowanie i wysłanie"],
    numerKroku: ({ numer, nazwa }: { numer: number; nazwa: string }) => `${numer}. ${nazwa}`,
    zakresKrokow: ({ od, do: koniec, nazwa }: { od: number; do: number; nazwa: string }) => `${od}–${koniec}. ${nazwa}`,
    nazwaKroku: "Rodzaj wniosku",
    krok: ({ krok, liczbaKrokow, nazwa }: { krok: number; liczbaKrokow: number; nazwa: string }) =>
      `Krok ${krok} z ${liczbaKrokow}: ${nazwa}`,
    zapisujemy: "Odpowiedzi zapisujemy po każdym kroku.",
    tytulListy: "Rodzaj wniosku",
    legenda: "Którego urlopu dotyczy wniosek?",
    rodzaje: {
      "czesc-przed-porodem": {
        etykieta: "Część urlopu macierzyńskiego przed porodem",
        opis: "Najwyżej 6 tygodni przed przewidywanym terminem porodu. Do wniosku dołączasz zaświadczenie lekarskie o przewidywanej dacie porodu.",
      },
      "macierzynski-z-rodzicielskim": {
        etykieta: "Urlop macierzyński z urlopem rodzicielskim",
        opis: "Urlop macierzyński od dnia porodu i urlop rodzicielski bezpośrednio po nim. Wniosek złożony w ciągu 21 dni od porodu daje zasiłek 81,5% za cały okres.",
      },
      rodzicielski: {
        etykieta: "Urlop rodzicielski",
        opis: "Jedna z najwyżej 5 części urlopu rodzicielskiego. Wniosek składasz co najmniej 21 dni przed początkiem urlopu.",
      },
      ojcowski: {
        etykieta: "Urlop ojcowski",
        opis: "14 dni jednorazowo albo w 2 częściach po co najmniej 7 dni, do ukończenia przez dziecko 12 miesięcy. Wniosek składasz co najmniej 7 dni przed urlopem.",
      },
      uzupelniajacy: {
        etykieta: "Uzupełniający urlop macierzyński",
        opis: "Bezpośrednio po urlopie macierzyńskim, w wymiarze podanym przy sprawie w planie. Wniosek składasz co najmniej 21 dni przed końcem urlopu macierzyńskiego.",
      },
      "na-warunkach-macierzynskiego": {
        etykieta: "Urlop na warunkach urlopu macierzyńskiego",
        opis: "Po przyjęciu dziecka na wychowanie, od dnia przyjęcia. Wniosek składasz w ciągu 7 dni od przyjęcia dziecka.",
      },
      "laczenie-z-praca": {
        etykieta: "Łączenie urlopu rodzicielskiego z pracą",
        opis: "Praca u pracodawcy, który udzielił urlopu rodzicielskiego, w wymiarze do połowy etatu. Wniosek składasz co najmniej 21 dni przed podjęciem pracy.",
      },
      "rezygnacja-matki": { etykieta: "Rezygnacja z urlopu macierzyńskiego", opis: "" },
      "pozostala-czesc-macierzynskiego": { etykieta: "Pozostała część urlopu macierzyńskiego", opis: "" },
      wychowawczy: {
        etykieta: "Urlop wychowawczy",
        opis: "Do 36 miesięcy dla obojga rodziców, w najwyżej 5 częściach, do końca roku, w którym dziecko kończy 6 lat. Wniosek składasz co najmniej 21 dni przed urlopem.",
      },
      "obnizenie-wymiaru": {
        etykieta: "Obniżenie wymiaru czasu pracy",
        opis: "Praca w wymiarze co najmniej połowy etatu w okresie, w którym możesz korzystać z urlopu wychowawczego. Wniosek składasz co najmniej 21 dni przed obniżeniem.",
      },
    },
    notatkaPrzedPorodem: "Wniosek o urlop macierzyński z urlopem rodzicielskim przygotujesz po potwierdzeniu daty porodu w planie rodziny.",
    brakRodzajow: "Według profilu rodziny nie masz teraz wniosku o urlop do przygotowania.",
    wstecz: "Wstecz",
    zapiszDoDokonczenia: "Zapisz do dokończenia",
    dalej: "Dalej",
    etykietaBocznej: "Informacje o wniosku",
    daneZProfilu: "Dane z profilu rodziny",
    formaZatrudnienia: "Forma zatrudnienia",
    umowaOPrace: "Umowa o pracę",
    pracodawca: "Pracodawca",
    dataPorodu: "Data porodu",
    przewidywanyTermin: "Przewidywany termin porodu",
    niepotwierdzona: "niepotwierdzona",
    liczbaDzieci: "Liczba dzieci",
    uzupelniajacy: "Uzupełniający urlop macierzyński",
    doTygodni: ({ tygodnie }: { tygodnie: number }) => `do ${tygodnie} tygodni`,
    dataPrzyjecia: "Data przyjęcia dziecka",
    terminTytul: "Termin na zasiłek 81,5%",
    terminTresc: ({ data, dni }: { data: string; dni: string }) =>
      `Wniosek z całym urlopem rodzicielskim wyślij do ${data}. Zostało ${dni}.`,
    terminMinal: ({ data }: { data: string }) => `Termin na zasiłek 81,5% minął ${data}.`,
    bladZapisu: "Nie udało się zapisać wniosku.",
    // koniec ViewLeaveRequestType
  },
  ViewLeaveRequestForm: {
    tytulStrony: "Wniosek o urlop do pracodawcy: formularz",
    naglowek: "Wniosek o urlop do pracodawcy",
    nazwyWnioskow: {
      "czesc-przed-porodem": "Wniosek o część urlopu macierzyńskiego przed porodem",
      "macierzynski-z-rodzicielskim": "Wniosek o urlop macierzyński z urlopem rodzicielskim",
      rodzicielski: "Wniosek o urlop rodzicielski",
      ojcowski: "Wniosek o urlop ojcowski",
      uzupelniajacy: "Wniosek o uzupełniający urlop macierzyński",
      "na-warunkach-macierzynskiego": "Wniosek o urlop na warunkach urlopu macierzyńskiego",
      "laczenie-z-praca": "Wniosek o łączenie urlopu rodzicielskiego z pracą",
      "rezygnacja-matki": "Wniosek o rezygnację z urlopu macierzyńskiego",
      "pozostala-czesc-macierzynskiego": "Wniosek o pozostałą część urlopu macierzyńskiego",
      wychowawczy: "Wniosek o urlop wychowawczy",
      "obnizenie-wymiaru": "Wniosek o obniżenie wymiaru czasu pracy",
    },
    rodzajeUrlopu: {
      macierzynski: "Urlop macierzyński",
      "czesc-przed-porodem": "Część urlopu macierzyńskiego przed porodem",
      rodzicielski: "Urlop rodzicielski",
      uzupelniajacy: "Uzupełniający urlop macierzyński",
      ojcowski: "Urlop ojcowski",
      "na-warunkach-macierzynskiego": "Urlop na warunkach urlopu macierzyńskiego",
      "przejety-macierzynski": "Urlop macierzyński",
      "laczenie-z-praca": "Łączenie urlopu rodzicielskiego z pracą",
    },
    liczbaDni: ({ n }: { n: number }) => (n === 1 ? "1 dzień" : `${n} dni`),
    liczbaTygodni: ({ n }: { n: number }) => {
      const r10 = n % 10;
      const r100 = n % 100;
      if (n === 1) return "1 tydzień";
      if (r10 >= 2 && r10 <= 4 && (r100 < 12 || r100 > 14)) return `${n} tygodnie`;
      return `${n} tygodni`;
    },
    brakWniosku: "Nie znaleźliśmy tego wniosku. Rozpocznij wniosek z instrukcji sprawy w planie rodziny.",
    daneTytul: "Dane we wniosku",
    daneNotatka: "Dane pochodzą z Twojego konta ZUS i z profilu rodziny.",
    pracownik: "Pracownik",
    dziecko: "Dziecko",
    dzieckoUr: ({ imieINazwisko, data }: { imieINazwisko: string; data: string }) => `${imieINazwisko}, ur. ${data}`,
    dataPorodu: "Data porodu",
    przewidywanyTermin: "Przewidywany termin porodu",
    liczbaDzieci: "Liczba dzieci",
    przyjecie: "Przyjęcie dziecka",
    przyjecieOpis: ({ forma, data }: { forma: string; data: string }) => `${forma}, ${data}`,
    formyPrzyjecia: {
      przysposobienie: "Przysposobienie z wnioskiem do sądu",
      "rodzina-zastepcza-niezawodowa": "Rodzina zastępcza niezawodowa",
      "rodzina-zastepcza-zawodowa": "Rodzina zastępcza zawodowa",
    },
    dataUrodzeniaDziecka: "Data urodzenia dziecka",
    liczbaPrzyjetych: "Liczba przyjętych dzieci",
    okresTytul: "Okres urlopu",
    okresOpis: ({ od, do: doDnia, opis }: { od: string; do: string; opis: string }) => `${od} – ${doDnia}, ${opis}`,
    odDniaPorodu: ({ tygodnie }: { tygodnie: string }) => `${tygodnie} od dnia porodu`,
    dataPoczatku: "Data początku urlopu",
    dataPoczatkuLaczenia: "Data początku łączenia z pracą",
    dataKoncaLaczenia: "Data końca łączenia z pracą",
    zakresDat: ({ od, do: doDnia }: { od: string; do: string }) => `Wpisz datę od ${od} do ${doDnia} w formacie DD.MM.RRRR.`,
    zakresDatOjcowski: ({ od, do: doDnia, dni }: { od: string; do: string; dni: string }) =>
      `Przy urlopie na ${dni} wpisz datę od ${od} do ${doDnia} w formacie DD.MM.RRRR.`,
    doDniaPorodu: "Urlop trwa od wpisanej daty do dnia porodu, a po porodzie przechodzi w urlop macierzyński.",
    zakresWniosku: "Zakres wniosku",
    zakresCaly: "Z całym urlopem rodzicielskim bezpośrednio po urlopie macierzyńskim",
    zakresCalyNaWarunkach: "Z całym urlopem rodzicielskim bezpośrednio po urlopie na warunkach urlopu macierzyńskiego",
    zakresCalyOpis: "Zasiłek 81,5% podstawy za cały okres obu urlopów, gdy wyślesz wniosek w ciągu 21 dni.",
    zakresMacierzynski: "Wyłącznie urlop macierzyński",
    zakresNaWarunkach: "Wyłącznie urlop na warunkach urlopu macierzyńskiego",
    zakresWylacznieOpis: "Wniosek o urlop rodzicielski złożysz później. Zasiłek wyniesie 100% podstawy za ten urlop i 70% za urlop rodzicielski.",
    licznik: ({ dni, data }: { dni: string; data: string }) =>
      `Do końca terminu na zasiłek 81,5% zostało ${dni}. Wyślij wniosek do ${data}, bo liczy się dzień wysłania.`,
    tabelaPodpis: "Okresy urlopu i stawka zasiłku",
    tabelaPrzewijanie: "Tabela okresów urlopu",
    kolumnaUrlop: "Urlop",
    kolumnaOd: "Od",
    kolumnaDo: "Do",
    kolumnaZasilek: "Zasiłek",
    stawkaPodstawy: ({ stawka }: { stawka: string }) => `${stawka} podstawy`,
    stawka815: "Stawka zasiłku: 81,5% podstawy za cały okres",
    stawka10070: "Stawka zasiłku: 100% podstawy za urlop macierzyński i 70% za urlop rodzicielski",
    stawka100: "Stawka zasiłku: 100% podstawy",
    stawka70: "Stawka zasiłku: 70% podstawy",
    notatkaRodzicielski: ({ tygodnie }: { tygodnie: string }) =>
      `Z ${tygodnie} urlopu rodzicielskiego 9 tygodni przysługuje wyłącznie drugiemu rodzicowi.`,
    zamiarTytul: "Oświadczenie o zamiarze drugiego rodzica",
    zamiarLegenda: "Czy drugi rodzic zamierza korzystać z urlopu rodzicielskiego w okresie objętym wnioskiem?",
    zamiarOpis: "Odpowiadasz, gdy wniosek obejmuje urlop rodzicielski.",
    tak: "Tak",
    nie: "Nie",
    czesciTytul: "Wykorzystane części urlopu rodzicielskiego",
    czesciPodpis: "Wykorzystane części urlopu rodzicielskiego obojga rodziców",
    kolumnaCzesc: "Część",
    kolumnaRodzic: "Rodzic",
    kolumnaTygodnie: "Tygodnie",
    rodzicMatka: "Matka",
    rodzicDrugi: "Drugi rodzic",
    brakCzesci: "Żadne z rodziców nie wysłało jeszcze wniosku o urlop rodzicielski.",
    wykorzystano: ({ wykorzystane, limit }: { wykorzystane: number; limit: string }) => `Wykorzystano ${wykorzystane} z ${limit}`,
    pozostalo: ({ tygodnie }: { tygodnie: string }) => `Pozostało Tobie ${tygodnie}`,
    numerCzesci: ({ numer }: { numer: number }) => `Wniosek dotyczy ${numer}. części urlopu rodzicielskiego z najwyżej 5.`,
    tygodnie: "Liczba tygodni urlopu",
    zakresLiczby: ({ min, max }: { min: number; max: number }) => `Od ${min} do ${max}.`,
    ojcowskiTytul: "Oświadczenie o wcześniejszym korzystaniu z urlopu ojcowskiego",
    ojcowskiLegenda: "Czy korzystałeś już z urlopu ojcowskiego na to dziecko?",
    ojcowskiNie: "Nie korzystałem",
    ojcowskiTak: "Korzystałem przez 7 dni",
    ojcowskiPropozycja: "Odpowiedź zaznaczyliśmy na podstawie wysłanego wniosku o urlop ojcowski.",
    dni: "Liczba dni urlopu",
    zakresDni: ({ min, max }: { min: number; max: number }) => (min === max ? `${min} dni.` : `Od ${min} do ${max} dni.`),
    ostatniDzienMacierzynskiego: "Ostatni dzień urlopu macierzyńskiego",
    uzupelniajacyOswiadczenie: "Oświadczam, że drugi z rodziców nie korzysta z uzupełniającego urlopu macierzyńskiego.",
    uzupelniajacyOswiadczenieTytul: "Oświadczenie",
    wymiarK11: ({ tygodnie }: { tygodnie: string }) => `Wymiar urlopu według sprawy w planie: do ${tygodnie}.`,
    laczenieOkresRodzicielskiego: "Okres wysłanego wniosku o urlop rodzicielski",
    wymiarPracy: "Wymiar pracy w czasie urlopu rodzicielskiego",
    wymiarPracyPodpowiedz: "Liczba całkowita od 1 do 50% etatu.",
    procentEtatu: "% etatu",
    laczenieLegenda: "Czy chcesz pracować także w części urlopu z wydłużenia?",
    wymiarWydluzenia: "Wymiar pracy w części z wydłużenia",
    wydluzenieTytul: "Wydłużenie urlopu rodzicielskiego",
    dniLaczenia: "Dni łączenia z pracą",
    dniWydluzenia: "Wydłużenie urlopu",
    ostatniDzien: "Ostatni dzień urlopu rodzicielskiego",
    okresLaczenia: "Okres łączenia z pracą",
    opisObliczenia: "Urlop wydłuża się o liczbę dni łączenia pomnożoną przez wymiar pracy, zaokrągloną w dół do pełnych dni.",
    zalacznikiTytul: "Załączniki",
    zalacznikiOpis: "Pliki dołączysz w podsumowaniu. Listę załączników umieścimy też w treści wniosku.",
    bezZalacznikow: "Wniosek nie wymaga załączników. Wymiar, okres i oświadczenie są w treści wniosku.",
    wychowawczy: {
      dziecko: "Dziecko",
      okresTytul: "Okres i wymiar",
      rodzajUrlopu: "Rodzaj urlopu wychowawczego",
      rodzajDo6Lat: "Urlop do końca roku, w którym dziecko kończy 6 lat",
      rodzajNiepelnosprawnosc: "Urlop na dziecko z orzeczeniem o niepełnosprawności",
      dataPoczatku: "Data początku",
      dataKonca: "Data końca",
      dataPoczatkuPracy: "Data początku pracy w obniżonym wymiarze",
      dataKoncaPracy: "Data końca pracy w obniżonym wymiarze",
      wymiarPracy: "Wymiar czasu pracy po obniżeniu",
      wymiarPracyPodpowiedz: "Procent pełnego wymiaru czasu pracy, od 50 do 99.",
      procent: "%",
      okresCzesci: "Okres części urlopu",
      wykorzystany: "Wykorzystany urlop wychowawczy obojga rodziców",
      czesc: "Część urlopu objęta wnioskiem",
      pozostaly: "Pozostały wymiar urlopu",
      miesiaceIDni: ({ miesiace, dni }: { miesiace: number; dni: number }) => `${miesiace} mies. i ${dni} dni`,
      numerCzesci: ({ numer }: { numer: number }) => `część ${numer} z 5`,
      oswiadczenieTytul: "Oświadczenia",
      zamiar: "Czy drugi rodzic zamierza korzystać z urlopu wychowawczego?",
      zamiarNie: "Drugi rodzic nie zamierza korzystać z urlopu wychowawczego",
      zamiarTak: "Drugi rodzic zamierza korzystać z urlopu wychowawczego w okresie od i do",
      okresDrugiegoOd: "Okres korzystania drugiego rodzica: od",
      okresDrugiegoDo: "Okres korzystania drugiego rodzica: do",
      przyczyna36: "Przyczyna wymiaru 36 miesięcy",
      przyczyna36Opis: "Po tym wniosku wykorzystasz więcej niż 35 miesięcy urlopu. Ostatni miesiąc przysługuje drugiemu rodzicowi, chyba że zachodzi jedna z przyczyn.",
      przyczyny: {
        zgon: "Drugi rodzic nie żyje",
        "brak-wladzy": "Drugi rodzic nie ma władzy rodzicielskiej albo ma ją ograniczoną lub zawieszoną",
        "brak-ojca": "Ojciec dziecka jest nieznany",
      },
      dotychczasowa: "Czy pracowałeś w obniżonym wymiarze czasu pracy na to dziecko?",
      dotychczasowaNie: "Nie pracowałem w obniżonym wymiarze",
      dotychczasowaTak: "Pracowałem w obniżonym wymiarze w okresie od i do",
      dotychczasowaOd: "Okres pracy w obniżonym wymiarze: od",
      dotychczasowaDo: "Okres pracy w obniżonym wymiarze: do",
      zalaczniki: {
        "odpis-aktu-urodzenia": "odpis skrócony aktu urodzenia dziecka",
        "oswiadczenie-drugiego-rodzica": "oświadczenie o zamiarze drugiego rodzica",
        "orzeczenie-niepelnosprawnosci": "kopia prawomocnego orzeczenia o niepełnosprawności albo o stopniu niepełnosprawności dziecka",
        "akt-zgonu": "odpis skrócony aktu zgonu drugiego rodzica",
        "oswiadczenie-o-pracy": "oświadczenie o okresie dotychczasowej pracy w obniżonym wymiarze czasu pracy",
      },
    },
    zalaczniki: {
      "zaswiadczenie-o-terminie-porodu": "zaświadczenie lekarskie o przewidywanej dacie porodu",
      "odpis-skrocony-aktu-urodzenia": "odpis skrócony aktu urodzenia dziecka",
      "oswiadczenie-o-zamiarze-drugiego-rodzica": "oświadczenie o zamiarze drugiego rodzica",
      "kopia-zaswiadczenia-za-zyciem": "kopia zaświadczenia „Za życiem”",
      "oswiadczenie-o-wczesniejszym-ojcowskim": "oświadczenie o wcześniejszym korzystaniu z urlopu ojcowskiego",
      "kopia-postanowienia-o-przysposobieniu": "kopia postanowienia sądu o przysposobieniu",
      "zaswiadczenie-szpitala": "zaświadczenie szpitala o pobycie dziecka w szpitalu",
      "oswiadczenie-drugi-rodzic-bez-uzupelniajacego": "oświadczenie, że drugi z rodziców nie korzysta z uzupełniającego urlopu macierzyńskiego",
      "oswiadczenie-o-dacie-przyjecia": "oświadczenie o dacie przyjęcia dziecka",
      "zaswiadczenie-sadu-o-przysposobieniu": "zaświadczenie sądu o wszczęciu postępowania o przysposobienie albo kopia wniosku o przysposobienie z poświadczeniem sądu",
      "orzeczenie-o-rodzinie-zastepczej": "orzeczenie sądu o umieszczeniu dziecka w rodzinie zastępczej, prawomocne albo wydane w trybie zabezpieczenia, albo umowa ze starostą",
      "decyzja-o-odroczeniu": "decyzja o odroczeniu obowiązku szkolnego",
    } as Record<string, string>,
    ochronaTytul: "Szczególna ochrona",
    ochronaTresc: "Od dnia złożenia wniosku do końca urlopu pracodawca nie może wypowiedzieć ani rozwiązać z Tobą umowy o pracę. Datę złożenia zapiszemy przy wniosku.",
    skadTytul: "Skąd te dane",
    skadTresc: "Okresy i stawkę zasiłku proponujemy z profilu rodziny, wybranego wariantu sprawy w planie i wysłanych wniosków. Każdą wartość możesz zmienić.",
    laczenieTytul: "Praca w części urlopu z wydłużenia",
    // koniec ViewLeaveRequestForm
  },
  ViewLeaveRequestSummary: {
    tytulStrony: "Wniosek o urlop do pracodawcy: podsumowanie i wysłanie",
    naglowek: "Wniosek o urlop do pracodawcy",
    nazwaKroku: "Podsumowanie i wysłanie",
    rodzajTytul: "Rodzaj wniosku",
    okresTytul: "Okres urlopu",
    osobyTytul: "Pracownik i dziecko",
    oswiadczeniaTytul: "Oświadczenia",
    zmien: "Zmień",
    zmienEtykieta: ({ sekcja }: { sekcja: string }) => `Zmień: ${sekcja}`,
    brakOswiadczen: "Wniosek nie wymaga oświadczeń.",
    zamiar: "Zamiar drugiego rodzica co do urlopu rodzicielskiego",
    ojcowskiWczesniej: "Wcześniejsze korzystanie z urlopu ojcowskiego",
    uzupelniajacyDrugi: "Drugi z rodziców nie korzysta z uzupełniającego urlopu macierzyńskiego",
    laczenieWydluzenie: "Praca w części urlopu z wydłużenia",
    potwierdzone: "Potwierdzone",
    zalacznikiTytul: "Załączniki",
    zalacznikiOpcjonalne: "Pliki są opcjonalne. Możesz je dołączyć tutaj albo przekazać pracodawcy osobno.",
    dolaczPlikPodpowiedz: "PDF, JPG albo PNG, najwyżej 10 MB.",
    plikDolaczony: ({ nazwa, rozmiar }: { nazwa: string; rozmiar: string }) => `${nazwa}, ${rozmiar}`,
    usunPlik: "Usuń plik",
    usunPlikEtykieta: ({ nazwa }: { nazwa: string }) => `Usuń plik ${nazwa}`,
    adresatTytul: "Adresat",
    adresat: ({ nazwa }: { nazwa: string }) => `Pracodawca: ${nazwa}`,
    adresatBezNazwy: "Pracodawca",
    email: "Adres e-mail pracodawcy",
    emailPodpowiedz: "Adres zapiszemy w danych rodziny, żeby podpowiedzieć go przy kolejnym wniosku.",
    zobaczWiadomosc: "Zobacz wiadomość do pracodawcy",
    wstecz: "Wstecz",
    zapiszDoDokonczenia: "Zapisz do dokończenia",
    pobierz: "Pobierz wniosek",
    wyslij: "Wyślij wniosek",
    wyslijPonownie: "Wyślij ponownie",
    pobrano: ({ nazwa }: { nazwa: string }) => `Plik: ${nazwa}. Status wniosku: przygotowany.`,
    stawkaZmieniona: ({ data }: { data: string }) => `W szkicu z ${data} stawka wynosiła 81,5%. Wniosek wyślesz ze stawką 100% i 70%.`,
    etykietaBocznej: "Informacje o wysłaniu",
    ochronaTytul: "Szczególna ochrona",
    ochronaDzis: ({ data }: { data: string }) => `Gdy wyślesz wniosek dziś, szczególna ochrona przed wypowiedzeniem przysługuje Ci od ${data} do końca urlopu.`,
    poWyslaniuTytul: "Po wysłaniu",
    poWyslaniuTresc: "Wniosek zapiszemy w Twoich wnioskach, a sprawę w planie oznaczymy jako złożoną.",
    twojeWnioski: "Twoje wnioski",
    dokumentTytul: ({ nazwa }: { nazwa: string }) => nazwa,
    dokumentData: ({ data }: { data: string }) => `Data przygotowania: ${data}`,
    dokumentAdresat: "Adresat",
    dokumentZalaczniki: "Załączniki",
    zakladkiEtykieta: "Sekcje wniosku",
    zakladki: {
      rodzaj: "Rodzaj",
      okres: "Okres",
      osoby: "Pracownik i dziecko",
      oswiadczenia: "Oświadczenia",
      zalaczniki: "Załączniki",
      adresat: "Adresat",
    },
    zasilekTytul: "Zasiłek za okres urlopu",
    zasilek: {
      platnikSkladekZNazwa: ({ pracodawca }: { pracodawca: string }) =>
        `Zasiłek macierzyński za okres urlopu wypłaci Ci pracodawca ${pracodawca}, bo według stanu na 30 listopada poprzedniego roku zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób.`,
      platnikSkladek:
        "Zasiłek macierzyński za okres urlopu wypłaci Ci pracodawca, bo według stanu na 30 listopada poprzedniego roku zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób.",
      zus: "Zasiłek macierzyński za okres urlopu wypłaci Ci ZUS. Pracodawca przekaże do ZUS zaświadczenie płatnika składek Z-3.",
      nieustalony:
        "Zasiłek macierzyński za okres urlopu wypłaci Ci pracodawca, gdy według stanu na 30 listopada poprzedniego roku zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób. W pozostałych przypadkach zasiłek wypłaci ZUS, a pracodawca przekaże do ZUS zaświadczenie płatnika składek Z-3.",
      rezygnacja: "Pozostałą część zasiłku macierzyńskiego otrzyma ojciec dziecka na swój wniosek.",
    },
    // koniec ViewLeaveRequestSummary
  },
  ViewLeaveRequestSent: {
    tytulStrony: "Wniosek o urlop do pracodawcy wysłany",
    naglowek: "Wniosek wysłany",
    szczegolyTytul: "Szczegóły wniosku",
    rodzaj: "Rodzaj wniosku",
    okresy: "Okres urlopu",
    stawka: "Stawka zasiłku",
    pracownik: "Pracownik",
    dziecko: "Dziecko",
    adresat: "Adresat",
    adresatOpis: ({ nazwa, email }: { nazwa: string; email: string }) => `Pracodawca: ${nazwa}, ${email}`,
    dataZlozenia: "Data złożenia",
    poczatekOchrony: "Początek szczególnej ochrony",
    koniecOchrony: "Koniec szczególnej ochrony",
    potwierdzenie: "Numer potwierdzenia",
    wymiarPracy: "Wymiar pracy",
    okresLaczenia: "Okres łączenia z pracą",
    czescZWydluzenia: "Praca w części z wydłużenia",
    wydluzenie: "Wydłużenie urlopu",
    ostatniDzien: "Ostatni dzień urlopu rodzicielskiego",
    zapisano: "Wniosek zapisaliśmy w Twoich wnioskach ze statusem wysłany, a sprawę w planie rodziny oznaczyliśmy jako złożoną.",
    zapisanoPrzedPorodem: "Wniosek zapisaliśmy w Twoich wnioskach ze statusem wysłany. Sprawa urlopu macierzyńskiego w planie czeka na wniosek po porodzie.",
    twojeWnioski: "Twoje wnioski",
    planRodziny: "Przejdź do planu rodziny",
    coDalejTytul: "Co dalej",
    coDalej: "Pracodawca potwierdzi otrzymanie wniosku na Twój adres e-mail.",
    coDalejLaczenie: ({ data }: { data: string }) => `Pracodawca może odmówić łączenia urlopu z pracą do ${data}. Jeśli nie odmówi, łączysz urlop z pracą od wskazanej daty.`,
    dlaczegoPozniejTytul: "Dlaczego ochrona zaczyna się później",
    dlaczegoPozniej: "Szczególna ochrona zaczyna się na 14 dni przed urlopem macierzyńskim i urlopem na warunkach urlopu macierzyńskiego, na 21 dni przed urlopem rodzicielskim i uzupełniającym oraz na 7 dni przed urlopem ojcowskim. Gdy wysyłasz wniosek wcześniej, ochrona zaczyna się w tym dniu.",
    dlaczegoPozniejWychowawczy: "Szczególna ochrona zaczyna się na 21 dni przed urlopem wychowawczym i przed pracą w obniżonym wymiarze czasu pracy. Gdy wysyłasz wniosek w ciągu 21 dni przed początkiem okresu, ochrona zaczyna się w dniu wysłania.",
    brakWniosku: "Nie znaleźliśmy wysłanego wniosku.",
    // koniec ViewLeaveRequestSent
  },
  ViewMaternityResignation: {
    tytulStrony: "Rezygnacja z dalszej części urlopu macierzyńskiego",
    naglowek: "Rezygnacja z dalszej części urlopu macierzyńskiego",
    powrot: "Instrukcja sprawy",
    wstepPracownica: "Wrócisz do pracy wcześniej, a pozostałą część urlopu przejmie ojciec dziecka.",
    wstepZasilek: "Pozostałą część zasiłku macierzyńskiego przejmie ojciec dziecka.",
    kartaUrlopu: "Twój urlop macierzyński",
    dataPorodu: "Data porodu",
    liczbaDzieci: "Liczba dzieci",
    urlopMacierzynski: "Urlop macierzyński",
    najwczesniejszyPowrot: "Najwcześniejsza data powrotu do pracy",
    okres: ({ od, do_ }: { od: string; do_: string }) => `${od} – ${do_}`,
    okresZTygodniami: ({ od, do_, tygodnie }: { od: string; do_: string; tygodnie: string }) => `${od} – ${do_}, ${tygodnie}`,
    okresZDniamiPrzed: ({ od, do_, dni }: { od: string; do_: string; dni: string }) =>
      `${od} – ${do_}, w tym ${dni} przed porodem`,
    powrotPo14: ({ data }: { data: string }) => `${data}, po 14 tygodniach urlopu`,
    powrotPo8: ({ data }: { data: string }) => `${data}, po 8 tygodniach urlopu`,
    informacjaOrzeczenie:
      "W profilu rodziny jest zapisane orzeczenie o niezdolności do samodzielnej egzystencji, więc możesz wrócić do pracy po 8 tygodniach urlopu.",
    kartaPowrotu: "Powrót do pracy",
    poleDatyPowrotu: "Data powrotu do pracy",
    podpowiedzPowrotu: ({ od, do_ }: { od: string; do_: string }) =>
      `Od ${od} do ${do_}, w formacie DD.MM.RRRR. Rezygnację składasz pracodawcy co najmniej 7 dni przed powrotem.`,
    ojciecPrzejmie: ({ imieINazwisko }: { imieINazwisko: string }) => `Ojciec dziecka, ${imieINazwisko}, przejmie urlop`,
    ojciecDzieckaPrzejmie: "Ojciec dziecka przejmie urlop",
    przejdzDoPlanu: "Przejdź do planu rodziny",
    przejdzDoProfilu: "Przejdź do profilu rodziny",
    przejdzDoEzus: "Przejdź do eZUS",
    ojciecDziecka: "ojciec dziecka",
    kartaZalacznikow: "Załączniki",
    zalaczniki: {
      kopiaWnioskuOjca: ({ kogo }: { kogo: string }) => `Kopia wniosku ${kogo} o pozostałą część urlopu macierzyńskiego`,
      kopiaWnioskuOjcaKogo: "ojca",
      kopiaWnioskuOjcaZWnioskow: ({ data }: { data: string }) =>
        `Dołączymy kopię wniosku, który drugi rodzic wysłał ${data}.`,
      kopiaWnioskuOjcaDoDodania: "Dołącz kopię wniosku ojca dziecka o pozostałą część urlopu macierzyńskiego.",
      oswiadczenieOjca: "Kopia oświadczenia ojca o przerwaniu działalności zarobkowej",
      oswiadczenieOjcaOpis: ({ kogo }: { kogo: string }) =>
        `Oświadczenie ${kogo}, że przerwie działalność, żeby opiekować się dzieckiem do końca urlopu macierzyńskiego.`,
      oswiadczenieOjcaKogo: "ojca dziecka",
      kopiaOrzeczenia: "Kopia prawomocnego orzeczenia o niezdolności do samodzielnej egzystencji",
      kopiaOrzeczeniaOpis: "Dołącz kopię orzeczenia.",
    },
    dodajPlik: "Dodaj plik",
    dodajPlikDo: ({ zalacznik }: { zalacznik: string }) => `Dodaj plik: ${zalacznik}`,
    dodanyPlik: ({ nazwa }: { nazwa: string }) => `Dodany plik: ${nazwa}`,
    kartaDrugiegoRodzica: "Drugi rodzic",
    imieINazwisko: "Imię i nazwisko",
    formaZatrudnienia: "Forma zatrudnienia",
    brakDrugiegoRodzica: "W profilu rodziny nie ma drugiego rodzica.",
    formy: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia",
      "umowa-zlecenia-z-dobrowolnym": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      "umowa-zlecenia-bez-dobrowolnego": "Umowa zlecenia bez dobrowolnego ubezpieczenia chorobowego",
      jdg: "Jednoosobowa działalność gospodarcza",
      "jdg-z-dobrowolnym": "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
      "jdg-bez-dobrowolnego": "Jednoosobowa działalność gospodarcza bez dobrowolnego ubezpieczenia chorobowego",
      "brak-tytulu": "Brak tytułu do ubezpieczenia",
      "brak-drugiego-rodzica": "Brak drugiego rodzica w profilu",
    },
    kartaAdresata: "Adresat",
    adresat: ({ email }: { email: string }) => `Rezygnację wyślemy do pracodawcy na adres ${email}.`,
    adresatBezAdresu: "Rezygnację wyślemy do pracodawcy. Adres e-mail pracodawcy podasz w podsumowaniu.",
    notatkaSzkicu: "Zapisujemy odpowiedzi jako szkic. Wrócisz do nich z instrukcji sprawy.",
    kartaZam14: "Wniosek o zasiłek tylko za 14 tygodni",
    zam14Opis:
      "Nie masz jeszcze wniosku o zasiłek macierzyński. Złóż od razu wniosek tylko za 14 tygodni urlopu macierzyńskiego. Pozostałą część zasiłku drugi rodzic otrzyma na swój wniosek.",
    okresZasilkuWeWniosku: "Okres zasiłku we wniosku",
    okresZasilku100: ({ od, do_ }: { od: string; do_: string }) => `${od} – ${do_}, zasiłek 100% podstawy wymiaru`,
    zlozZam14: "Złóż wniosek o zasiłek za 14 tygodni",
    kartaRezygnacjiZasilku: "Rezygnacja z części zasiłku",
    kartaWnioskuZam: "Twój wniosek o zasiłek",
    wniosekZam: "Wniosek o zasiłek macierzyński (ZAM)",
    stanyZam: {
      wyslany: "Wysłany do ZUS",
      przygotowany: "Przygotowany dla płatnika składek",
    },
    okresZasilku: "Okres zasiłku",
    platnikZasilku: "Płatnik zasiłku",
    platnicy: {
      zus: "ZUS",
      "platnik-skladek": "Zleceniodawca",
      nieustalony: "Nieustalony",
      "brak-platnika": "Brak płatnika",
    },
    kartaDanychZus: "Dane z konta ZUS",
    wniosekOZasilek: "Wniosek o zasiłek macierzyński",
    brakWnioskuZam: "Brak wniosku w przewodniku i w ZUS",
    wniosekWZus: "Złożony w ZUS",
    brakDatyPorodu:
      "Rezygnację przygotujesz po potwierdzeniu daty porodu. Uzupełnij datę porodu w profilu rodziny.",
    brakRodziny: "Rezygnację przygotujesz po zapisaniu profilu rodziny.",
    odmianaTygodni: { jeden: "tydzień", kilka: "tygodnie", wiele: "tygodni" },
    odmianaDni: { jeden: "dzień", wiele: "dni" },
    liczbaZJednostka: ({ liczba, jednostka }: { liczba: string; jednostka: string }) => `${liczba} ${jednostka}`,
    wiadomoscDoPracodawcy: {
      temat: ({ imieINazwisko }: { imieINazwisko: string }) =>
        `Rezygnacja z dalszej części urlopu macierzyńskiego, ${imieINazwisko}`,
      tresc: ({
        dataZlozenia,
        dataPowrotu,
        listaZalacznikow,
        email,
        imieINazwisko,
      }: {
        dataZlozenia: string;
        dataPowrotu: string;
        listaZalacznikow: string;
        email: string;
        imieINazwisko: string;
      }) =>
        `Dzień dobry, przesyłam rezygnację z dalszej części urlopu macierzyńskiego złożoną ${dataZlozenia}. Wracam do pracy ${dataPowrotu}. W załącznikach do wiadomości przesyłam dokument rezygnacji oraz ${listaZalacznikow}. Proszę o potwierdzenie otrzymania rezygnacji na adres ${email}. Z poważaniem, ${imieINazwisko}. Wiadomość została przygotowana w przewodniku dla rodziców.`,
      zalaczniki: {
        "kopia-wniosku-ojca": "kopię wniosku ojca o pozostałą część urlopu macierzyńskiego",
        "oswiadczenie-ojca-o-przerwaniu-dzialalnosci":
          "kopię oświadczenia ojca o przerwaniu działalności zarobkowej w celu sprawowania opieki nad dzieckiem",
        "kopia-orzeczenia": "kopię prawomocnego orzeczenia o niezdolności do samodzielnej egzystencji",
      },
    },
    // koniec ViewMaternityResignation
  },
  ViewBirthCertificateRequest: {
    tytulStrony: "Wniosek o odpis aktu urodzenia",
    naglowek: "Wniosek o odpis aktu urodzenia",
    powrotInstrukcja: "Instrukcja sprawy",
    rodzaj: {
      tytul: "Rodzaj odpisu",
      legenda: "Jaki odpis chcesz zamówić?",
      opcje: {
        skrocony: { etykieta: "Odpis skrócony", opis: "Podstawowe dane z aktu. Wystarcza w większości spraw." },
        zupelny: { etykieta: "Odpis zupełny", opis: "Pełna treść aktu ze wszystkimi wzmiankami." },
        wielojezyczny: { etykieta: "Wielojęzyczny odpis skrócony", opis: "Do spraw za granicą. Tylko w formie papierowej." },
      },
    },
    wnioskodawca: {
      tytul: "Wnioskodawca",
      notatka: "Dane pochodzą z Twojego konta, więc we wniosku ich nie zmienisz.",
      imieINazwisko: "Imię i nazwisko",
      pesel: "PESEL",
      wnioskujeszJako: "Wnioskujesz jako",
      rodzicDziecka: "Rodzic dziecka",
    },
    dziecko: {
      tytul: "Dane dziecka",
      notatka: "Dane pochodzą z profilu rodziny, a data urodzenia z potwierdzonej daty porodu. Zmiana tych danych dotyczy tylko wniosku. Dane, które wpiszesz w puste pola, zapiszemy też w profilu rodziny.",
      imie: "Imię",
      nazwisko: "Nazwisko",
      dataUrodzenia: "Data urodzenia",
      podpowiedzDaty: "DD.MM.RRRR",
      miejsceUrodzenia: "Miejsce urodzenia",
      podpowiedzMiejsca: "Miejscowość, w której urodziło się dziecko",
      pesel: "Numer PESEL (nieobowiązkowe)",
      podpowiedzPesel: "11 cyfr. Numer PESEL dziecka podajesz, jeśli go znasz.",
      pusteWProfilu: "Tego pola nie ma w profilu rodziny. Po złożeniu wniosku zapiszemy je też w profilu.",
      zmienione: ({ wartosc }: { wartosc: string }) => `Zmienione we wniosku. W profilu rodziny zostaje ${wartosc}.`,
    },
    cel: {
      tytul: "Cel odpisu",
      legenda: "Na jaki cel potrzebujesz odpisu?",
      podpowiedz: "Od celu zależy opłata skarbowa.",
      opcje: {
        "sprawa-w-zus": "Sprawa w ZUS",
        "swiadczenie-socjalne": "Świadczenie socjalne albo pomoc społeczna",
        alimenty: "Alimenty",
        "opieka-albo-adopcja": "Opieka albo adopcja",
        zatrudnienie: "Zatrudnienie",
        "dowod-osobisty-albo-paszport": "Dowód osobisty albo paszport",
        inny: "Inny cel",
      },
      wZdaniu: {
        "sprawa-w-zus": "sprawa w ZUS",
        "swiadczenie-socjalne": "świadczenie socjalne albo pomoc społeczna",
        alimenty: "alimenty",
        "opieka-albo-adopcja": "opieka albo adopcja",
        zatrudnienie: "zatrudnienie",
        "dowod-osobisty-albo-paszport": "dowód osobisty albo paszport",
        inny: "inny cel",
      },
      bezOplaty: "Bez opłaty",
      zOplata: "Z opłatą skarbową",
      oplata: "Opłata skarbowa",
      opisBezOplaty: ({ cel }: { cel: string }) => `Odpis na cel ${cel} jest bezpłatny.`,
      opisOplaty: {
        skrocony: "Opłata za odpis skrócony na inny cel. Wniesiesz ją w usłudze rejestru stanu cywilnego na gov.pl.",
        zupelny: "Opłata za odpis zupełny na inny cel. Wniesiesz ją w usłudze rejestru stanu cywilnego na gov.pl.",
        wielojezyczny: "Opłata za odpis skrócony, także wielojęzyczny, na inny cel. Wniesiesz ją w usłudze rejestru stanu cywilnego na gov.pl.",
      },
      wybierzRodzaj: "Kwotę opłaty pokażemy po wyborze rodzaju odpisu.",
    },
    odbior: {
      tytul: "Sposób odbioru",
      legenda: "Jak chcesz otrzymać odpis?",
      opcje: {
        "e-doreczenia": { etykieta: "e-Doręczenia", opis: "Na Twoją skrzynkę do e-Doręczeń jako dokument elektroniczny XML albo PDF." },
        poczta: { etykieta: "Poczta", opis: "Na adres do doręczenia, który podasz." },
        osobiscie: { etykieta: "Odbiór osobisty w urzędzie stanu cywilnego", opis: "W urzędzie stanu cywilnego w gminie Twojego zamieszkania." },
      },
      opisOsobiscieWMiejscowniku: ({ miejscownik }: { miejscownik: string }) => `W Urzędzie Stanu Cywilnego ${miejscownik}.`,
      adres: "Adres do doręczenia",
      podpowiedzAdresu: "Ulica, numer domu i mieszkania, kod pocztowy w formacie 00-000 i miejscowość",
    },
    urzad: {
      tytul: "Urząd stanu cywilnego",
      pole: "Urząd stanu cywilnego",
      podpowiedz: "Wybierz urząd, do którego trafi wniosek. Przy odbiorze osobistym odbierzesz odpis w tym urzędzie.",
      propozycja: ({ gmina }: { gmina: string }) => `Proponujemy urząd w gminie zamieszkania z profilu rodziny: ${gmina}.`,
      eDoreczenia: "Załóż adres do e-Doręczeń na gov.pl",
      gminaZProfilu: ({ gmina }: { gmina: string }) => `Gmina zamieszkania z profilu rodziny: ${gmina}`,
      brakGminy: "Wpisz gminę zamieszkania w profilu rodziny. Wniosek trafi do urzędu stanu cywilnego w tej gminie.",
      opisZlozenia: ({ data }: { data: string }) =>
        `Złożymy wniosek w rejestrze stanu cywilnego na gov.pl. Jeśli akt urodzenia jest już w rejestrze, przewidywany dzień wydania odpisu przypada 7 dni po złożeniu wniosku. Przy złożeniu dziś to ${data}.`,
      zmianaGminyPrzed: "Gminę zamieszkania zmienisz w ",
      zmianaGminyLink: "profilu rodziny",
      zmianaGminyPo: ".",
    },
    urzadWMiejscowniku: ({ miejscownik }: { miejscownik: string }) => `Urząd Stanu Cywilnego ${miejscownik}`,
    urzadWGminie: ({ gmina }: { gmina: string }) => `Urząd stanu cywilnego w gminie ${gmina}`,
    sprawaK06: ({ tytul, status }: { tytul: string; status: string }) => `${tytul}, status ${status}`,
    sprawaWPlanie: "Sprawa w Twoim planie:",
    wrocDoInstrukcji: "Wróć do instrukcji sprawy",
    zloz: "Złóż wniosek",
    brakDatyPorodu: "Podaj datę porodu",
    brakRodziny: "Wniosek o odpis złożysz po zapisaniu profilu rodziny.",
    tytulUrodzenia: "Urodzenie dziecka",
    // Nazwy części formularza w „Krok X z N”
    czesci: {
      rodzaj: "Rodzaj odpisu",
      dziecko: "Dane dziecka",
      urodzenie: "Urodzenie dziecka",
      cel: "Cel odpisu",
      odbior: "Sposób odbioru",
      wnioskodawca: "Wnioskodawca i urząd",
    },
    // koniec ViewBirthCertificateRequest
  },
  ViewBirthCertificateRequestSent: {
    tytulStrony: "Wniosek o odpis aktu urodzenia złożony",
    naglowek: "Wniosek o odpis złożony",
    powrotPlan: "Plan rodziny",
    kartaPotwierdzenia: "Potwierdzenie złożenia",
    numer: "Numer potwierdzenia",
    dataZlozenia: "Data złożenia",
    dzienWydania: "Przewidywany dzień wydania odpisu",
    rodzaj: "Rodzaj odpisu",
    cel: "Cel odpisu",
    oplata: "Opłata skarbowa",
    odbior: "Sposób odbioru",
    adres: "Adres do doręczenia",
    urzad: "Urząd stanu cywilnego",
    adresat: "Adresat wniosku",
    adresatRejestr: "Rejestr stanu cywilnego na gov.pl",
    kartaDanych: "Dane we wniosku",
    dziecko: "Dziecko",
    wnioskodawca: "Wnioskodawca",
    imieINazwisko: "Imię i nazwisko",
    dataIMiejsce: "Data i miejsce urodzenia",
    pesel: "PESEL",
    wnioskujeszJako: "Wnioskujesz jako",
    rodzicDziecka: "Rodzic dziecka",
    kartaSprawy: "Sprawa w Twoim planie",
    tytulSprawy: "Odpis aktu urodzenia dziecka",
    statusSprawy: ({ data }: { data: string }) => `Status: złożona, ${data}`,
    przejdzDoPlanu: "Przejdź do planu rodziny",
    instrukcjaSprawy: "Instrukcja sprawy",
    coDalej: "Co dalej",
    doreczenie: {
      "e-doreczenia": "Urząd stanu cywilnego wyśle odpis na Twoją skrzynkę do e-Doręczeń jako dokument elektroniczny w formacie XML albo PDF.",
      poczta: ({ adres }: { adres: string }) => `Urząd stanu cywilnego wyśle odpis pocztą na adres: ${adres}.`,
      osobiscie: ({ urzad }: { urzad: string }) => `Odpis odbierzesz osobiście w urzędzie: ${urzad}.`,
    },
    przeznaczenie: {
      zus: "Do wniosku o zasiłek macierzyński odpisu nie dołączasz, bo ZUS pobierze akt urodzenia sam.",
      platnik: "Odpis skrócony dołączysz do wniosku o zasiłek macierzyński, który składasz u płatnika składek.",
      pracownik: "Odpis skrócony dołączysz do wniosków o urlop rodzicielski i urlop ojcowski, które składasz u pracodawcy.",
    },
    listaWnioskow: "Wniosek znajdziesz na liście Twoich wniosków.",
    twojeWnioski: "Twoje wnioski",
    brakWniosku: "Nie znaleźliśmy złożonego wniosku o odpis.",
    // Zakładki grup danych złożonego wniosku
    zakladki: {
      etykieta: "Szczegóły wniosku",
      potwierdzenie: "Potwierdzenie",
      dane: "Dane we wniosku",
      sprawa: "Sprawa",
    },
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
        `Formę zatrudnienia, dobrowolne ubezpieczenie chorobowe i płatnika zasiłku pobierzemy z Twojego konta ZUS w miejsce odpowiedzi, które podała o Tobie ${imie}. Plan rodziny uwzględni te dane. W profilu rodziny zmienisz tylko swoje dane.`,
      mezczyzna: ({ imie }: { imie: string }) =>
        `Formę zatrudnienia, dobrowolne ubezpieczenie chorobowe i płatnika zasiłku pobierzemy z Twojego konta ZUS w miejsce odpowiedzi, które podał o Tobie ${imie}. Plan rodziny uwzględni te dane. W profilu rodziny zmienisz tylko swoje dane.`,
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
          "Poproś rodzica, który Cię zaprosił, o nowy link. Otworzysz go tak samo, w przeglądarce, po zalogowaniu przez mObywatela, loginem i hasłem eZUS albo kodem z aplikacji mZUS.",
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
      reguly: ({ liczba }: { liczba: string }) => `Reguły świadczeń (${liczba})`,
      dokumenty: ({ liczba }: { liczba: string }) => `Dokumenty i adresaci wniosków (${liczba})`,
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
        "pieniadze-na-dziecko": "Świadczenia na dziecko",
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
    // Edycja pozycji, słownika dokumentów, nowe wpisy słowników i wspólny katalog (panel/katalog, u06)
    edycja: {
      kolumnaStanu: "Stan",
      aktywna: "W planach rodzin",
      wylaczona: "Wyłączona",
      zmienPozycje: ({ id }: { id: string }) => `Zmień pozycję ${id}`,
      dodajWpis: "Dodaj wartość",
      dodajDokument: "Dodaj wpis słownika",
      zmienDokument: ({ nazwa }: { nazwa: string }) => `Zmień wpis: ${nazwa}`,
      kolumnaAkcji: "Akcje",
      dodanaWPanelu: "Dodana w panelu",
    },
    wspolnyKatalog: {
      wspolny: "Zmiany katalogu zapisujemy we wspólnym katalogu. Wszyscy użytkownicy przewodnika widzą je przy najbliższym otwarciu.",
      wspolnyWPamieci: "Zmiany katalogu zapisujemy we wspólnym katalogu w pamięci serwera. Po ponownym uruchomieniu serwera wrócą wartości startowe.",
      lokalny: "Usługa wspólnego katalogu jest teraz niedostępna. Zmiany obowiązują w tej przeglądarce, a do wspólnego katalogu wyślemy je, gdy usługa wróci.",
      odrzucona: "Wspólny katalog odrzucił ostatnią zmianę. Zmiana obowiązuje w tej przeglądarce do najbliższego pobrania wspólnego katalogu.",
    },
    // koniec ViewCatalogList
  },
  ViewCatalogItemEdit: {
    tytulStrony: "Zmiana pozycji katalogu",
    naglowek: ({ id }: { id: string }) => `Zmiana pozycji ${id}`,
    wstep: "Zmiany obowiązują od zapisu. Plany rodzin i kalendarze terminów uwzględnią je przy najbliższym wyliczeniu.",
    powrot: "Katalog świadczeń",
    brakPozycji: "Katalog nie zawiera tej pozycji. Wróć do listy pozycji katalogu.",
    sprawa: {
      naglowek: "Sprawa i warunek",
      tytul: "Tytuł sprawy",
      podpowiedzTytulu: "Tytuł zrozumiały bez znajomości nazwy świadczenia, do 120 znaków, inny niż tytuły pozostałych pozycji.",
      warunek: "Opis warunku",
      podpowiedzWarunku: "Opis warunku, który rodzic widzi przy sprawie, do 500 znaków. Warunek wyliczenia planu pozostaje bez zmian.",
    },
    kanal: {
      naglowek: "Instytucja, kanał i dokumenty",
      instytucja: "Instytucja i kanał",
      podpowiedzInstytucji: "Gdzie i jak rodzic załatwia sprawę, do 500 znaków.",
      dokumenty: "Dane i dokumenty",
      podpowiedzDokumentow: "Jeden dokument w wierszu, najwyżej 20 wierszy po 500 znaków.",
      kroki: "Kroki instrukcji",
      podpowiedzKrokow: "Jeden krok w wierszu, najwyżej 20 wierszy po 500 znaków.",
    },
    termin: {
      naglowek: "Termin sprawy",
      obecny: ({ opis }: { opis: string }) => `Obowiązująca reguła terminu: ${opis}.`,
      regula: "Reguła terminu",
      podpowiedzReguly: "Zostaw obowiązującą regułę albo ustaw termin od daty kotwiczącej.",
      opcjaObecna: "Obowiązująca reguła terminu",
    },
    opisReguly: {
      brak: "bez terminu",
      kotwice: {
        "koniec-10-tygodnia": "ostatni dzień 10. tygodnia ciąży",
        "przewidywany-termin-porodu": "przewidywany termin porodu",
        "data-porodu": "data porodu",
        "data-przyjecia": "data przyjęcia dziecka na wychowanie",
        "data-uprawomocnienia": "data uprawomocnienia się orzeczenia",
        "data-urodzenia-dziecka": "data urodzenia dziecka",
      },
      przesuniecie: ({ kotwica, liczba, jednostka }: { kotwica: string; liczba: string; jednostka: string }) =>
        `${kotwica} ${liczba} ${jednostka}`,
      wDniu: ({ kotwica }: { kotwica: string }) => `w dniu: ${kotwica}`,
      jednostki: { dni: "dni", miesiace: "mies." },
      korekta: ({ liczba }: { liczba: string }) => `, korekta ${liczba} dni`,
      plusWymiar: ({ kotwica, wpis }: { kotwica: string; wpis: string }) => `${kotwica} i wymiar: ${wpis}`,
      dzienPrzedUrodzinami: ({ lata }: { lata: string }) => `dzień przed ${lata}. urodzinami dziecka`,
      koniecRokuUrodzin: ({ lata }: { lata: string }) => `31 grudnia roku, w którym dziecko kończy ${lata} lat`,
      koniecMiesiacaWieku: ({ miesiace }: { miesiace: string }) => `ostatni dzień miesiąca, w którym dziecko kończy ${miesiace} miesięcy`,
      coroczny: ({ dzien }: { dzien: string }) => `co roku do ${dzien}`,
      dwaTerminy: ({ pierwszy, drugi }: { pierwszy: string; drugi: string }) => `${pierwszy}, drugi termin ${drugi}`,
    },
    wylaczenie: {
      naglowek: "Pozycja w planach rodzin",
      aktywna: "Pozycja jest w planach rodzin. Po wyłączeniu sprawa znika z planów rodzin i kalendarzy terminów przy najbliższym wyliczeniu.",
      wylaczona: "Pozycja jest wyłączona. Po włączeniu sprawa wraca do planów rodzin, które spełniają jej warunek.",
      wylacz: "Wyłącz pozycję",
      wlacz: "Włącz pozycję",
    },
    zapisz: "Zapisz zmiany",
    anuluj: "Anuluj",
    czesci: {
      sprawa: "Sprawa i warunek",
      kanal: "Instytucja, kanał i dokumenty",
      termin: "Termin i stan pozycji",
    },
    // koniec ViewCatalogItemEdit
  },
  ViewCatalogDocumentEdit: {
    tytulStrony: "Wpis słownika dokumentów",
    naglowekZmiany: "Zmiana wpisu słownika dokumentów",
    naglowekNowego: "Nowy wpis słownika dokumentów",
    wstep: "Kreatory wniosków i instrukcje spraw pokazują dokumenty, adresata i termin z tego wpisu od zapisu zmiany.",
    powrot: "Katalog świadczeń",
    brakWpisu: "Słownik nie zawiera tego wpisu. Wróć do słownika dokumentów.",
    grupa: "Grupa słownika",
    wybierzGrupe: "Wybierz grupę",
    nazwa: "Świadczenie albo wniosek",
    podpowiedzNazwy: "Nazwa świadczenia albo wniosku, do 120 znaków.",
    formy: "Formy zatrudnienia",
    podpowiedzForm: "Zaznacz formy zatrudnienia, których dotyczy wpis. Wszystkie cztery formy oznaczają każdą formę zatrudnienia.",
    dokumenty: "Dokumenty i załączniki",
    podpowiedzDokumentow: "Jeden dokument w wierszu, najwyżej 20 wierszy po 500 znaków.",
    adresat: "Adresat",
    podpowiedzAdresata: "Instytucja albo osoba, do której rodzic składa wniosek, do 500 znaków.",
    termin: "Termin",
    podpowiedzTerminu: "Termin złożenia wniosku opisany słowami, do 500 znaków.",
    zapisz: "Zapisz wpis",
    anuluj: "Anuluj",
    // koniec ViewCatalogDocumentEdit
  },
  ViewCatalogEntryAdd: {
    tytulStrony: "Nowa wartość w katalogu świadczeń",
    naglowek: "Nowa wartość w katalogu świadczeń",
    wstep: "Nowa wartość trafia do słownika z pierwszą wersją od podanej daty. Kolejne wersje dopiszesz przyciskiem Zmień w tabeli słownika.",
    powrot: "Katalog świadczeń",
    slownik: "Słownik",
    nazwa: "Nazwa wartości",
    podpowiedzNazwy: "Nazwa, pod którą wartość stoi w słowniku, do 120 znaków, inna niż nazwy pozostałych wpisów.",
    etykieta: "Opis wartości (opcjonalnie)",
    podpowiedzEtykiety: "Krótki opis pola wartości, do 120 znaków. Puste pole oznacza nazwę wartości.",
    jednostka: "Jednostka",
    wybierzJednostke: "Wybierz jednostkę",
    jednostki: {
      zl: "Kwota w złotych",
      procent: "Stawka w procentach",
      tygodnie: "Tygodnie",
      dni: "Dni",
      miesiace: "Miesiące",
      lata: "Lata",
    },
    wartosc: "Wartość",
    od: "Obowiązuje od",
    podpowiedzOd: "Data w formacie DD.MM.RRRR.",
    zapisz: "Zapisz wartość",
    anuluj: "Anuluj",
    // koniec ViewCatalogEntryAdd
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
      podpowiedzUbezpieczenia: "Wybierz, czy sprawa wymaga ubezpieczenia chorobowego rodzica.",
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
    // Nazwy części formularza w „Krok X z N”
    czesci: {
      sprawa: "Sprawa",
      warunek: "Warunek",
      kanal: "Instytucja i kanał",
      termin: "Termin i koszt spóźnienia",
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
      krs: "Numer KRS",
      krsPodpowiedz: "10 cyfr, np. 0000191989.",
      charytatywny: "Potwierdzam, że organizacja działa wyłącznie charytatywnie.",
      charytatywnyOpis:
        "Zaznacz pole, gdy aktualny odpis z Krajowego Rejestru Sądowego potwierdza, że organizacja ma status organizacji pożytku publicznego. Zaznacz je także przy organizacji pożytku publicznego wpisanej do rejestru przedsiębiorców.",
      zapisz: "Zapisz organizację",
      anuluj: "Anuluj",
      powrot: "Podmioty wsparcia",
      nieZnaleziono: "Nie znaleźliśmy tej organizacji w słowniku podmiotów wsparcia.",
      wrocDoListy: "Wróć do listy organizacji",
    },
    // Nazwy części formularza organizacji w „Krok X z N”
    czesciFormularza: {
      organizacja: "Organizacja i zakres pomocy",
      sytuacje: "Sytuacje szczególne",
      kontakt: "Kontakt i potwierdzenie",
    },
    // Akcja otwarcia słownika na ekranie ViewCatalogList
    otworzSlownik: "Podmioty wsparcia",
    // koniec ViewCatalogSupportOrganizations
  },
  ViewEzusHome: {
    tytulStrony: "eZUS",
    naglowek: "eZUS",
    wstep: "Symulowany serwis eZUS w trybie demonstracyjnym przewodnika.",
    kartaWnioski: "Wnioski o świadczenia na dziecko",
    wniosek800: "Wniosek o świadczenie wychowawcze 800+",
    wniosekAktywnyRodzic: "Wniosek o świadczenie z programu Aktywny Rodzic",
    kartaZasilki: "Zasiłek macierzyński",
    wniosekZas23: "Wniosek ZAS-23 o skrócenie okresu wypłaty zasiłku macierzyńskiego",
    kartaKonta: "Konto ubezpieczonego",
    kontoWstep: "Sprawdź dane zgromadzone na Twoim koncie w ZUS i zadaj pytanie, gdy masz wątpliwości.",
    daneKonta: "Dane o ubezpieczeniu, podstawach składek, członkach rodziny i zasiłkach",
    zaswiadczeniaEzla: "Zaświadczenia lekarskie e-ZLA",
    stanRozliczen: "Stan rozliczeń składek",
    pytanieDoZus: "Zadaj pytanie do ZUS",
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
    rodzajWniosku: "Rodzaj wniosku",
    rodzaje: {
      "swiadczenie-800-plus": "Świadczenie wychowawcze 800+",
      "800-plus-kolejny-okres": "Świadczenie wychowawcze 800+ na kolejny okres świadczeniowy",
      "aktywny-rodzic": "Świadczenie z programu Aktywny Rodzic",
      "dobry-start": "Dobry Start 300+",
      "zasilek-macierzynski": "Zasiłek macierzyński",
      "zasilek-chorobowy": "Zasiłek chorobowy",
    },
    dataZlozenia: "Data złożenia",
    kanal: "Kanał złożenia",
    planowyTermin: "Planowy termin załatwienia sprawy",
    odpowiedzZus: "Odpowiedź ZUS",
    odpowiedzi: {
      zlozony: "ZUS zarejestrował wniosek. Odpowiedź zobaczysz tutaj, gdy ZUS go rozpatrzy.",
      "w-trakcie": "ZUS rozpatruje wniosek. Odpowiedź zobaczysz tutaj, gdy ZUS go rozpatrzy.",
      przyznanie: "ZUS przyznał świadczenie. Informację o przyznaniu znajdziesz w eZUS w zakładce Dokumenty i wiadomości.",
      odmowa:
        "ZUS odmówił przyznania świadczenia. Decyzję z uzasadnieniem i pouczeniem o prawie do odwołania znajdziesz w eZUS w zakładce Dokumenty i wiadomości. Jeśli nie zgadzasz się z decyzją, złóż odwołanie za pośrednictwem ZUS albo złóż nowy wniosek z uzupełnionymi danymi.",
    },
    // koniec ViewEzusApplicationDetails
  },
  ViewEzusZas23: {
    tytulStrony: "eZUS: wniosek ZAS-23 o skrócenie okresu wypłaty zasiłku macierzyńskiego",
    naglowek: "Wniosek ZAS-23",
    wstep:
      "Wniosek o skrócenie okresu wypłaty zasiłku macierzyńskiego. Złożysz go po wykorzystaniu co najmniej 14 tygodni zasiłku po porodzie, gdy pozostałą część zasiłku przejmie ojciec dziecka.",
    kartaWniosku: "Skrócenie okresu wypłaty zasiłku",
    kartaOswiadczenia: "Oświadczenie ojca dziecka",
    ubezpieczona: "Ubezpieczona",
    zasilekZaUrlop: "Zasiłek za okres urlopu macierzyńskiego",
    wniosekZam: "Wniosek o zasiłek macierzyński",
    wniosekZamNumer: ({ numer, data }: { numer: string; data: string }) => `${numer}, złożony ${data}`,
    wniosekZamWZus: "Złożony w ZUS",
    poleDaty: "Data, od której rezygnujesz z zasiłku macierzyńskiego",
    podpowiedzDaty: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}, w formacie DD.MM.RRRR.`,
    ojciecPobiera: "Ojciec dziecka pobiera zasiłek macierzyński",
    oswiadczenieWstep:
      "Do wniosku dołączasz oświadczenie, od kiedy ojciec dziecka będzie korzystał z zasiłku macierzyńskiego. Po wysłaniu wniosku wydrukujesz oświadczenie do podpisu ojca dziecka.",
    poleOjca: "Imię i nazwisko ojca dziecka",
    potwierdzenie: ({ data }: { data: string }) =>
      `Ojciec dziecka podpisze oświadczenie, że od ${data} będzie korzystał z zasiłku macierzyńskiego, a ja dostarczę je do placówki ZUS osobiście albo pocztą przed tym dniem.`,
    potwierdzenieBezDaty:
      "Ojciec dziecka podpisze oświadczenie, od kiedy będzie korzystał z zasiłku macierzyńskiego, a ja dostarczę je do placówki ZUS osobiście albo pocztą przed tym dniem.",
    potwierdzenieZleceniodawca: ({ data }: { data: string }) =>
      `Ojciec dziecka podpisze oświadczenie, że od ${data} będzie korzystał z zasiłku macierzyńskiego, a ja złożę je zleceniodawcy razem z wnioskiem przed tym dniem.`,
    potwierdzenieZleceniodawcaBezDaty:
      "Ojciec dziecka podpisze oświadczenie, od kiedy będzie korzystał z zasiłku macierzyńskiego, a ja złożę je zleceniodawcy razem z wnioskiem przed tym dniem.",
    wyslij: "Wyślij wniosek do ZUS",
    przygotuj: "Przygotuj dokumenty do wydruku",
    kartaPotwierdzenia: "Wniosek ZAS-23",
    numerPotwierdzenia: "Numer potwierdzenia",
    dataZlozenia: "Data złożenia",
    dataPrzygotowania: "Data przygotowania",
    rezygnacjaOd: "Rezygnacja z zasiłku od",
    ojciecDziecka: "Ojciec dziecka",
    okresOjca: "Okres zasiłku ojca dziecka",
    okres: ({ od, do_ }: { od: string; do_: string }) => `${od} – ${do_}`,
    dokumentOswiadczenia: "Oświadczenie ojca dziecka o przejęciu zasiłku macierzyńskiego",
    trescOswiadczenia: ({ ojciec, matka, data }: { ojciec: string; matka: string; data: string }) =>
      `Ja, ${ojciec}, oświadczam, że od ${data} będę korzystać z zasiłku macierzyńskiego za pozostały okres zasiłku, z którego rezygnuje matka dziecka, ${matka}, i w tym okresie przerwę działalność zarobkową, żeby osobiście opiekować się dzieckiem.`,
    dokumentWniosku: "Wniosek o rezygnację z dalszej części zasiłku macierzyńskiego",
    trescWniosku: ({ matka, data, platnik }: { matka: string; data: string; platnik: string }) =>
      `Ja, ${matka}, rezygnuję z pobierania zasiłku macierzyńskiego od ${data}, po wykorzystaniu zasiłku przez co najmniej 14 tygodni po porodzie. Pozostałą część zasiłku przejmie ojciec dziecka. Wniosek składam do płatnika zasiłku: ${platnik}.`,
    trescWnioskuZOrzeczeniem: ({ matka, data, platnik }: { matka: string; data: string; platnik: string }) =>
      `Ja, ${matka}, rezygnuję z pobierania zasiłku macierzyńskiego od ${data}, po wykorzystaniu zasiłku przez co najmniej 8 tygodni po porodzie, na podstawie orzeczenia o niezdolności do samodzielnej egzystencji. Pozostałą część zasiłku przejmie ojciec dziecka. Wniosek składam do płatnika zasiłku: ${platnik}.`,
    zleceniodawca: "zleceniodawca",
    miejscePodpisu: "Data i czytelny podpis",
    nazwaPlikuOswiadczenia: "oswiadczenie-ojca-dziecka.pdf",
    nazwaPlikuWniosku: "rezygnacja-z-zasilku-macierzynskiego.pdf",
    oswiadczenieOjcaZalacznik: ({ imieINazwisko }: { imieINazwisko: string }) =>
      `Oświadczenie ojca dziecka, ${imieINazwisko}, od kiedy będzie korzystał z zasiłku macierzyńskiego`,
    brakDatyPorodu: "Wniosek ZAS-23 złożysz po potwierdzeniu daty porodu w profilu rodziny.",
    brakRodziny: "Zaloguj się w przewodniku, żeby złożyć wniosek ZAS-23 z danymi rodziny.",
    przejdzDoRezygnacji: "Przejdź do rezygnacji w przewodniku",
    // koniec ViewEzusZas23
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
    przejdzDoTerminow: "Wszystkie terminy",
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
        opis: "Kalkulator policzy zasiłek z danych profilu rodziny. Niczego nie zmieni w planie.",
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
      infolinia: "Zadzwoń na infolinię 22 560 16 00",
    },
    adresMamaZus: "mama@zus.pl",
    numerInfoliniiZus: "+48225601600",
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
      brakSprawy: "W Twoim planie nie ma sprawy, o którą pytasz. Wszystkie sprawy zobaczysz w planie rodziny.",
      becikoweProg: ({ prog }: { prog: string }) => `Becikowe przysługuje, gdy dochód netto na osobę w rodzinie nie przekracza ${prog}.`,
      becikoweDochod: ({ dochod }: { dochod: string }) => `W Twoim profilu dochód na osobę wynosi ${dochod}, dlatego becikowego nie ma w Twoim planie.`,
      becikowePoprawDochod: "Jeśli dochód się zmienił, popraw go w profilu rodziny, a plan to uwzględni.",
      becikoweWPlanie: ({ data }: { data: string }) => `Becikowe jest w Twoim planie, wniosek złóż do ${data}.`,
      becikoweWPlanieBezTerminu: "Becikowe jest w Twoim planie.",
      prawoWPlanie: ({ tytul }: { tytul: string }) => `Sprawa ${tytul} jest w Twoim planie.`,
      prawoBrak: "Tego świadczenia nie ma w Twoim planie. Plan pokazuje świadczenia z katalogu świadczeń, które pasują do profilu rodziny.",
      tydzienSprawa: ({ tytul, data, liczbaDni }: { tytul: string; data: string; liczbaDni: string }) =>
        `W tym tygodniu załatw sprawę ${tytul}. Termin mija ${data}, za ${liczbaDni} dni.`,
      tydzienKolejne: ({ data, sprawy }: { data: string; sprawy: string }) => `Kolejne terminy masz ${data}: ${sprawy}.`,
      tydzienBrak: "W tym tygodniu nie masz spraw z terminem. Wszystkie terminy zobaczysz w Terminach.",
      tydzienBrakSpraw: "W tym tygodniu nie masz spraw z terminem.",
      tydzienWszystkie: "Wszystkie terminy zobaczysz w Terminach.",
      // Najbliższe terminy z planu rodziny, te same co na karcie Najbliższe terminy (domena/terminy/najblizsze.ts).
      najblizszyTermin: ({ data, opis }: { data: string; opis: string }) => `Najbliższy termin to ${data}: ${opis}.`,
      kolejnyTermin: ({ data, opis }: { data: string; opis: string }) => `Kolejny termin to ${data}: ${opis}.`,
      terminPoTygodniu: ({ data, opis }: { data: string; opis: string }) => `Najbliższy termin po tym tygodniu to ${data}: ${opis}.`,
      opisTerminuSprawy: ({ tytul, kto }: { tytul: string; kto: string }) => `${tytul}, dotyczy ${kto}`,
      opisKolejnegoOplacenia: ({ tytul, kto, dzien }: { tytul: string; kto: string; dzien: string }) =>
        `${tytul}, dotyczy ${kto}, a sprawę dodamy do planu ${dzien}`,
      opisTerminuPorodu: "przewidywany termin porodu",
      wyjasnienieTerminuPorodu: "Terminy spraw po porodzie liczymy teraz od przewidywanego terminu porodu, a po porodzie policzymy je od daty porodu.",
      najblizszeBrak: "Nie masz terminów w najbliższym czasie. Wszystkie terminy zobaczysz w Terminach.",
      kogoDotyczy: {
        matka: "matki",
        "drugi-rodzic": "drugiego rodzica",
        "oboje-rodzice": "obojga rodziców",
        "matka-albo-ojciec": "matki albo ojca",
        "rodzic-przyjmujacy": "rodzica, który przyjął dziecko",
      },
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
      oznaczZalatwiona: "Mogę oznaczyć ją jako załatwioną. Zrobię to po Twoim potwierdzeniu.",
      oznaczZlozona: "Mogę oznaczyć ją jako złożoną. Zrobię to po Twoim potwierdzeniu.",
      oznaczJuz: ({ tytul, status }: { tytul: string; status: string }) => `Sprawa ${tytul} ma już w planie status ${status}.`,
      oznaczNieTwoja: ({ tytul, osoba }: { tytul: string; osoba: string }) =>
        `Tej sprawy nie oznaczysz ze swojego konta. Sprawa ${tytul} jest przypisana matce, więc oznacza ją ${osoba}.`,
      oznaczNieTwojaStatus: "Aktualny status sprawy zobaczysz w planie rodziny.",
      zlaMatki: ({ osoba }: { osoba: string }) =>
        `Zaświadczenia lekarskie e-ZLA matki są na koncie matki. ${osoba} sprawdzi je po zalogowaniu na swoje konto.`,
      zlaKonta: ({ okres }: { okres: string }) => `W danych Twojego konta ZUS ostatnie zaświadczenie lekarskie e-ZLA obejmuje okres od ${okres}.`,
      zlaBrak: "W danych Twojego konta ZUS nie ma zaświadczeń lekarskich e-ZLA.",
      zlaBezZgody: "Zaświadczenia lekarskie e-ZLA pokażę po udzieleniu zgody na dane dotyczące zdrowia w ustawieniach profilu.",
      oznaczBrakSprawy: "Nie znalazłem w Twoim planie sprawy, którą chcesz oznaczyć. Sprawy oznaczysz w planie rodziny.",
      kalkulator: "Kalkulator zasiłku macierzyńskiego policzy zasiłek z danych profilu rodziny.",
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
        `Bez niego możesz dostać świadczenie rodzicielskie w wysokości ${kwota} miesięcznie.`,
      nuSwiadczenieRodzicielskieBrakTytulu: ({ kwota }: { kwota: string }) =>
        `Możesz dostać świadczenie rodzicielskie w wysokości ${kwota} miesięcznie.`,
      nuUzupelnij: "Uzupełnij profil na start, a pokażę sprawy i terminy Twojej rodziny.",
      nuBrakPlanu: "Nie znam jeszcze planu Twojej rodziny, więc nie wskażę spraw na ten tydzień. Uzupełnij profil na start. Na jego podstawie ułożymy plan i policzymy terminy.",
      nuBrakPlanuOgolnie: "Nie znam jeszcze planu Twojej rodziny. Uzupełnij profil na start. Na jego podstawie ułożymy plan i policzymy terminy.",
      nuBrakPlanuTerminy: "Nie znam jeszcze planu Twojej rodziny, więc nie wskażę Twoich terminów. Uzupełnij profil na start. Na jego podstawie ułożymy plan i policzymy terminy.",
      nuKalkulator: "Kwotę policzy kalkulator zasiłku macierzyńskiego. Formę zatrudnienia uzupełnimy w nim z Twojego konta ZUS, a pozostałe dane podasz sama.",
    },
    // koniec ViewAssistantChat
  },
  ViewFamilyPlanStage: {
    tytulStrony: "Etap planu rodziny",
    naglowek: ({ numer, nazwa }: { numer: string; nazwa: string }) => `Etap ${numer}: ${nazwa}`,
    powrot: "Plan rodziny",
    sprawyEtapu: "Sprawy w tym etapie",
    nawigacja: "Etapy planu rodziny",
    poprzedniEtap: ({ nazwa }: { nazwa: string }) => `Poprzedni etap: ${nazwa}`,
    nastepnyEtap: ({ nazwa }: { nazwa: string }) => `Następny etap: ${nazwa}`,
    wrocDoPlanu: "Wróć do planu rodziny",
    swiadczeniaWCiazy: {
      opis: "Sprawdź, czy w ciąży przysługuje zasiłek chorobowy, świadczenie rehabilitacyjne albo zasiłek w wysokości zasiłku macierzyńskiego.",
      kafelek: "Świadczenia z ubezpieczenia chorobowego w ciąży",
    },
    stanRozliczen: {
      opis: "Przy działalności gospodarczej sprawdź stan rozliczeń składek, bo zasiłek z ubezpieczenia chorobowego zależy od opłacania składek w terminie.",
      kafelek: "Stan rozliczeń składek",
    },
    nieznanyEtap: {
      naglowek: "Nie znaleźliśmy tego etapu",
      opis: "Plan rodziny ma 5 etapów. Wybierz etap w planie rodziny.",
      akcja: "Przejdź do planu rodziny",
    },
    // koniec ViewFamilyPlanStage
  },
  ViewZ15Start: {
    tytulStrony: "Wniosek o zasiłek opiekuńczy (Z-15)",
    naglowek: "Wniosek o zasiłek opiekuńczy (Z-15)",
    powrot: "Zasiłek opiekuńczy na dziecko",
    otwieranie: "Otwieramy wniosek.",
    kartaBlokady: "Ten wniosek Cię nie dotyczy",
    k0298: "Zasiłek opiekuńczy przysługuje osobie, która podlega ubezpieczeniu chorobowemu. Twoje konto ZUS nie pokazuje tego ubezpieczenia w ostatnich 6 miesiącach. Zobacz w swoim planie, z czego możesz skorzystać.",
    akcja0298: "Przejdź do planu rodziny",
    opis0004: "Zaświadczenie lekarskie na opiekę i choroba członka rodziny to dane dotyczące zdrowia, dlatego wniosek wymaga zgody. Zgodę udzielisz w ustawieniach przewodnika.",
    akcja0004: "Przejdź do ustawień przewodnika",
    kreator: {
      krok: ({ krok, liczbaKrokow, nazwa }: { krok: number; liczbaKrokow: number; nazwa: string }) => `Krok ${krok} z ${liczbaKrokow}: ${nazwa}`,
      postep: ({ krok, liczbaKrokow }: { krok: number; liczbaKrokow: number }) => `Postęp wniosku: krok ${krok} z ${liczbaKrokow}`,
      zapisujemy: "Zapisujemy odpowiedzi po każdym kroku.",
      listaKrokow: "Kroki wniosku",
      kroki: {
        ViewZ15Situation: "Sytuacja opieki",
        ViewZ15Statements: "Limit dni i oświadczenia",
        ViewZ15Data: "Dane i wypłata",
        ViewZ15Summary: "Podsumowanie",
      },
      wstecz: "Wróć",
      dalej: "Przejdź dalej",
      zapiszDoDokonczenia: "Zapisz do dokończenia",
      zapisano: "Zapisaliśmy wniosek. Dokończysz go ze sprawy Zasiłek opiekuńczy na dziecko w planie rodziny.",
      twojWniosek: "Twój wniosek",
      osoba: "Osoba pod opieką",
      sytuacja: "Sytuacja opieki",
      okresy: "Okresy opieki",
      okres: ({ od, do: doDnia, dni }: { od: string; do: string; dni: string }) => `${od} do ${doDnia} (${dni} dni)`,
      platnikZasilku: "Płatnik zasiłku",
      platnicy: { zus: "ZUS", "platnik-skladek": "Płatnik składek", nieustalony: "Nieustalony" },
      brakWniosku: "Nie znaleźliśmy tego wniosku. Rozpocznij go ze sprawy Zasiłek opiekuńczy na dziecko.",
      rozpocznij: "Rozpocznij wniosek",
      bladZapisu: "Nie udało się zapisać odpowiedzi. Spróbuj ponownie.",
    },
    sytuacje: {
      "chore-dziecko": "Chore dziecko",
      "zamkniecie-placowki": "Nieprzewidziane zamknięcie żłobka, klubu dziecięcego, przedszkola albo szkoły",
      "choroba-niani": "Choroba niani zatrudnionej na umowie uaktywniającej",
      "choroba-opiekuna-dziennego": "Choroba dziennego opiekuna",
      "porod-choroba-drugiego-rodzica": "Poród albo choroba drugiego rodzica, który stale opiekuje się dzieckiem",
      "szpital-drugiego-rodzica": "Pobyt drugiego rodzica w szpitalu",
      "izolacja-dziecka": "Izolacja dziecka",
      "chory-malzonek": "Chory małżonek albo drugi rodzic dziecka",
      "dodatkowy-nowo-narodzone": "Dodatkowy zasiłek na nowo narodzone dziecko",
    },
    pokrewienstwa: { dziecko: "dziecko", malzonek: "małżonek", "rodzic-dziecka": "rodzic dziecka" },
    sekcjaSprawy: {
      tytul: "Wniosek o zasiłek opiekuńczy w przewodniku",
      opis: "Złóż wniosek Z-15 za każdy okres opieki. Dane z zaświadczenia e-ZLA i konta ZUS uzupełnimy za Ciebie i policzymy, ile dni zostało Ci w limicie.",
      akcja: "Złóż wniosek o zasiłek opiekuńczy",
      dokoncz: "Dokończ wniosek",
      szkic: ({ data }: { data: string }) => `Masz wniosek do dokończenia, zapisany ${data}.`,
      wyslany: ({ numer, data }: { numer: string; data: string }) => `Ostatni wniosek wysłany ${data}, potwierdzenie ${numer}.`,
      przygotowany: ({ data }: { data: string }) => `Wniosek przygotowany dla płatnika składek ${data}.`,
      oznaczPrzekazany: "Oznacz wniosek jako przekazany płatnikowi",
      dodatkowy: "Złóż wniosek o dodatkowy zasiłek opiekuńczy",
      k0326: ({ data }: { data: string }) => `Zapisaliśmy przekazanie wniosku płatnikowi ${data}. Sprawa ma w planie status złożona.`,
    },
    // koniec ViewZ15Start
  },
  ViewZ15Situation: {
    tytulStrony: "Sytuacja opieki: wniosek Z-15",
    czesc1: "Osoba pod opieką i sytuacja",
    czesc2: "Okresy opieki",
    osoba: "Kim się opiekujesz?",
    opisOsoby: ({ pesel, data, pokrewienstwo }: { pesel: string; data: string; pokrewienstwo: string }) => `PESEL ${pesel}, urodzony ${data}, ${pokrewienstwo}`,
    brakPesel: "bez numeru PESEL",
    brakOsob: "Dodaj dziecko albo drugiego rodzica w profilu rodziny.",
    orzeczenie: "Czy dziecko ma orzeczenie o znacznym stopniu niepełnosprawności albo ze wskazaniem konieczności stałej lub długotrwałej opieki?",
    tak: "Tak",
    nie: "Nie",
    sytuacja: "Dlaczego opiekujesz się tą osobą?",
    placowka: "Do jakiej placówki uczęszcza dziecko?",
    placowki: { zlobek: "Żłobek", "klub-dzieciecy": "Klub dziecięcy", przedszkole: "Przedszkole", szkola: "Szkoła" },
    dataPowiadomienia: "Data powiadomienia o zamknięciu",
    sytuacjaMatki: "Sytuacja mamy",
    sytuacjeMatki: {
      szpital: "Pobyt mamy w szpitalu",
      niezdolnosc: "Orzeczenie o niezdolności mamy do samodzielnej egzystencji",
      niepelnosprawnosc: "Orzeczenie o niepełnosprawności mamy w stopniu znacznym",
      porzucenie: "Porzucenie dziecka przez mamę",
    },
    dataZdarzenia: "Data zdarzenia",
    dataWypisu: "Data wypisu mamy ze szpitala (jeśli mama opuściła szpital)",
    k0144: "Do wniosku dołączysz dokument potwierdzający sytuację mamy.",
    zaswiadczenia: "Zaświadczenia lekarskie na opiekę z konta ZUS",
    zaswiadczenie: ({ numer, od, do: doDnia, platnik }: { numer: string; od: string; do: string; platnik: string }) => `${numer}: ${od} do ${doDnia}, płatnik ${platnik}`,
    k0299: "Na Twoim koncie ZUS nie ma zaświadczenia lekarskiego na opiekę nad tą osobą. Jeśli lekarz wystawił zaświadczenie na wydrukowanym formularzu, dodaj okres opieki z serią i numerem tego zaświadczenia.",
    okresyOpieki: "Okresy opieki",
    zakresDodatkowego: ({ od, do: doDnia }: { od: string; do: string }) => `Dodatkowy zasiłek przysługuje za dni od ${od} do ${doDnia}.`,
    poczatek: "Początek opieki",
    koniec: "Koniec opieki",
    seriaINumer: "Seria i numer zaświadczenia z formularza",
    dodajOkres: "Dodaj okres",
    usunOkres: "Usuń okres",
    okresNr: ({ numer }: { numer: number }) => `Okres ${numer}`,
    bladOsoby: "Wybierz osobę pod opieką.",
    bladSytuacji: "Wybierz sytuację opieki.",
    bladPlacowki: "Wybierz rodzaj placówki.",
    bladDaty: "Podaj datę.",
    bladKolejnosci: "Podaj koniec opieki w dniu początku albo później.",
    bladSerii: "Podaj serię i numer zaświadczenia.",
    k0304: "Wybierz zaświadczenie lekarskie albo dodaj okres opieki.",
    k0302: "Zasiłek przysługuje, gdy o zamknięciu placówki dowiedziałeś się mniej niż 7 dni przed dniem zamknięcia. Sprawdź datę powiadomienia.",
    k0303: ({ wiek, data }: { wiek: string; data: string }) => `W tej sytuacji zasiłek przysługuje na dziecko do ukończenia ${wiek} lat. Dziecko kończy ${wiek} lat ${data}, więc okres opieki kończy się przed tym dniem.`,
    k0300: "Ten okres przedłuża opiekę, za którą wniosek jest już złożony. Jeśli okoliczności się nie zmieniły, wnioskiem za ten okres jest wcześniejszy wniosek. Gdy coś się zmieniło, złóż nowy wniosek.",
    k0301: ({ od, do: doDnia }: { od: string; do: string }) => `Od ${od} do ${doDnia} nie podlegasz ubezpieczeniu chorobowemu, więc za te dni zasiłek opiekuńczy nie przysługuje. Wyłączyliśmy je z okresu opieki.`,
    k0327: ({ data }: { data: string }) => `Dodatkowy zasiłek opiekuńczy przysługuje, gdy sytuacja mamy wystąpiła najpóźniej ${data}, w ostatnim dniu 8. tygodnia życia dziecka. Po tym dniu możesz przejąć część urlopu macierzyńskiego, a akcję przejęcia znajdziesz w planie rodziny.`,
    k0328: ({ data }: { data: string }) => `Data porzucenia dziecka przypada w dniu porodu ${data} albo później.`,
    k0329: ({ data }: { data: string }) => `Podaj datę wypisu mamy ze szpitala z zakresu od ${data} do dzisiaj.`,
    k0330: ({ od, do: doDnia }: { od: string; do: string }) => `Dodatkowy zasiłek opiekuńczy przysługuje za dni od ${od} do ${doDnia}. Popraw okres opieki.`,
    k0331: "Dodatkowy zasiłek opiekuńczy przysługuje, gdy mama podlega ubezpieczeniu chorobowemu i pobiera zasiłek macierzyński w pierwszych 8 tygodniach po porodzie. Sprawdź w planie rodziny przejęcie urlopu macierzyńskiego albo skontaktuj się z ZUS.",
    k0334: "Dodatkowy zasiłek opiekuńczy przysługuje za dni pobytu mamy w szpitalu. Gdy mama wróci ze szpitala, poinformuj płatnika zasiłku o dniu wypisu.",
    bladDatyPrzyszlej: "Podaj dzisiejszą albo wcześniejszą datę zdarzenia.",
    // koniec ViewZ15Situation
  },
  ViewZ15Statements: {
    tytulStrony: "Limit dni i oświadczenia: wniosek Z-15",
    czesc1: "Limit dni i domownik",
    czesc2: "Zasiłki w tym roku",
    limit: "Dni zasiłku opiekuńczego",
    rok: ({ rok }: { rok: string }) => `Rok ${rok}`,
    kategoria: ({ limit }: { limit: string }) => `Kategoria osoby pod opieką: limit ${limit} dni`,
    lacznyLimit: "Łączny limit",
    wykorzystane: "Dni wykorzystane",
    pozostale: "Dni pozostałe",
    dniWniosku: "Dni wniosku",
    dni: ({ liczba }: { liczba: string }) => `${liczba} dni`,
    domownik: "Czy jest domownik, który może zapewnić opiekę w okresie wniosku?",
    opisDomownika: "Domownikiem, który może zapewnić opiekę, nie jest osoba całkowicie niezdolna do pracy, chora, niesprawna ze względu na wiek, prowadząca gospodarstwo rolne, pracownik po nocnej zmianie, osoba prowadząca działalność ani osoba bez obowiązku opieki, która jej odmawia.",
    dniDomownika: "Zaznacz dni, w których domownik może sprawować opiekę",
    wspolneGospodarstwo: "Czy pozostajesz z osobą pod opieką we wspólnym gospodarstwie domowym?",
    zwolnienie: "Czy w okresie wniosku korzystasz ze zwolnienia od pracy z zachowaniem wynagrodzenia (2 dni na dziecko do 14 lat albo 2 dni z powodu siły wyższej)?",
    dniZwolnienia: "Zaznacz dni zwolnienia od pracy",
    poprzedniPlatnik: "Czy w tym roku otrzymałeś zasiłek opiekuńczy od poprzedniego płatnika składek?",
    nieZmienialem: "Nie zmieniałem płatnika",
    liczbaDniPoprzedni: "Liczba dni zasiłku od poprzedniego płatnika",
    drugiRodzic: "Drugi rodzic dziecka",
    drugiRodzicNieznany: "Drugi rodzic dziecka nieznany",
    imie: "Imię",
    nazwisko: "Nazwisko",
    pesel: "PESEL",
    bladPesel: "Podaj numer PESEL z 11 cyframi.",
    drugiRodzicZasilek: "Czy drugi rodzic otrzymał w tym roku zasiłek opiekuńczy?",
    liczbaDniDrugiego: "Liczba dni zasiłku drugiego rodzica",
    innyCzlonek: "Czy inny członek rodziny otrzymał w tym roku zasiłek opiekuńczy na tę osobę?",
    liczbaDniInnego: "Liczba dni zasiłku innego członka rodziny",
    zasilekMacierzynski: "Czy mama dziecka pobiera zasiłek macierzyński w okresie 8 tygodni po porodzie?",
    przerwaniePracy: "Czy przerywasz pracę albo działalność zarobkową, żeby osobiście opiekować się dzieckiem?",
    bladOdpowiedzi: "Wybierz odpowiedź.",
    bladLiczby: ({ maks }: { maks: string }) => `Podaj liczbę dni od 0 do ${maks}.`,
    k0308: ({ rok, pozostale, wniosku }: { rok: string; pozostale: string; wniosku: string }) => `W ${rok} zostało do wykorzystania ${pozostale} dni zasiłku opiekuńczego na tę opiekę, a okresy wniosku obejmują ${wniosku} dni. Skróć okresy opieki na poprzednim ekranie.`,
    k0313: "Po wyłączeniu dni, za które zasiłek opiekuńczy nie przysługuje, wniosek obejmuje 0 dni. Zmień okresy opieki albo odpowiedzi na oświadczenia.",
    k0314: "Zasiłek opiekuńczy na chore dziecko w wieku powyżej 14 lat bez orzeczenia i na chorego małżonka przysługuje, gdy w okresie opieki pozostajesz z nim we wspólnym gospodarstwie domowym.",
    k0310: ({ liczba }: { liczba: string }) => `Za ${liczba} dni zwolnienia od pracy zachowujesz wynagrodzenie, więc zasiłek opiekuńczy za te dni nie przysługuje. Wyłączyliśmy je z okresu wniosku, a limit dni zasiłku pozostaje bez zmian.`,
    k0307: ({ od, do: doDnia }: { od: string; do: string }) => `Za dni od ${od} do ${doDnia} wniosek o zasiłek opiekuńczy na tę samą osobę złożył drugi rodzic. Za ten sam dzień zasiłek otrzymuje jeden rodzic, dlatego wyłączyliśmy te dni z okresu wniosku.`,
    k0317: "Zwolnienie od pracy tego rodzaju przysługuje najwyżej przez 2 dni w roku kalendarzowym.",
    k0331: "Dodatkowy zasiłek opiekuńczy przysługuje, gdy mama podlega ubezpieczeniu chorobowemu i pobiera zasiłek macierzyński w pierwszych 8 tygodniach po porodzie. Sprawdź w planie rodziny przejęcie urlopu macierzyńskiego albo skontaktuj się z ZUS.",
    k0332: "Dodatkowy zasiłek opiekuńczy przysługuje, gdy przerwiesz pracę albo działalność zarobkową, żeby osobiście opiekować się dzieckiem.",
    k0333: ({ liczba }: { liczba: string }) => `Dni dodatkowego zasiłku opiekuńczego na nowo narodzone dziecko liczymy poza rocznym limitem zasiłku opiekuńczego, więc w tym roku nadal masz ${liczba} dni zasiłku opiekuńczego.`,
    // koniec ViewZ15Statements
  },
  ViewZ15Data: {
    tytulStrony: "Dane i wypłata: wniosek Z-15",
    daneZKonta: "Dane z konta ZUS",
    wnioskodawca: "Wnioskodawca",
    adres: "Adres",
    platnikSkladek: "Płatnik składek",
    nipRegon: ({ nip, regon }: { nip: string; regon: string }) => `NIP ${nip}, REGON ${regon}`,
    zmianaAdresu: "Adres zmienisz w eZUS.",
    telefon: "Numer telefonu (opcjonalnie)",
    rachunek: "Numer rachunku bankowego (opcjonalnie)",
    uwagi: "Uwagi (opcjonalnie, do 500 znaków)",
    bladUwag: "Uwagi mają najwyżej 500 znaków.",
    k0241: ({ adres }: { adres: string }) => `Bez numeru rachunku ZUS wypłaci zasiłek przekazem pocztowym na adres ${adres}.`,
    k0325: ({ platnik }: { platnik: string }) => `Zasiłek wypłaci płatnik składek ${platnik} w terminie wypłaty wynagrodzenia.`,
    k0324: ({ platnik }: { platnik: string }) => `Przygotujemy wniosek dla płatnika składek ${platnik}. Jeśli płatnik nie wypłaca zasiłków, przekaże wniosek do ZUS w ciągu 7 dni.`,
    // Domyślne uwagi wniosku przy dodatkowym zasiłku opiekuńczym, data sformatowana przed przekazaniem
    uwagiDodatkowego: ({ sytuacjaMatki, dataZdarzenia }: { sytuacjaMatki: string; dataZdarzenia: string }) =>
      `Dodatkowy zasiłek opiekuńczy na nowo narodzone dziecko: ${sytuacjaMatki} od ${dataZdarzenia}`,
    // koniec ViewZ15Data
  },
  ViewZ15Summary: {
    tytulStrony: "Podsumowanie: wniosek Z-15",
    zakladki: "Części podsumowania",
    zakladkaWniosek: "Wniosek",
    zakladkaKwota: "Kwota i terminy",
    zakladkaWysylka: "Załączniki i wysyłka",
    podstawa: "Podstawa wymiaru",
    stawka: "Stawka dzienna",
    dniZasilku: "Dni zasiłku",
    kwotaZl: ({ kwota }: { kwota: string }) => `${kwota} zł`,
    osoba: ({ imieINazwisko, pesel }: { imieINazwisko: string; pesel?: string }) =>
      pesel ? `${imieINazwisko}, PESEL ${pesel}` : imieINazwisko,
    okresZSeria: ({ okres, seriaINumer }: { okres: string; seriaINumer?: string }) =>
      seriaINumer ? `${okres}, ${seriaINumer}` : okres,
    adresatZus: "ZUS",
    zaswiadczenieZ3: "Z-3",
    zaswiadczenieZ3a: "Z-3a",
    k0318: ({ dni, kwota, stawka, platnik }: { dni: string; kwota: string; stawka: string; platnik: string }) => `Szacunkowy zasiłek opiekuńczy za ${dni} dni wynosi ${kwota} zł brutto przy stawce ${stawka} zł za dzień opieki. Kwotę zasiłku ustali ${platnik}.`,
    k0319: ({ platnik }: { platnik: string }) => `Za każdy dzień opieki otrzymasz 80% podstawy wymiaru zasiłku podzielonej przez 30. Podstawę wymiaru i kwotę zasiłku ustali ${platnik}.`,
    k0320: ({ od, do: doDnia, termin }: { od: string; do: string; termin: string }) => `Złóż wniosek o zasiłek za okres od ${od} do ${doDnia} najpóźniej ${termin}. Po tym dniu roszczenie o wypłatę zasiłku za ten okres przedawnia się.`,
    k0321: ({ od, do: doDnia, termin }: { od: string; do: string; termin: string }) => `Termin złożenia wniosku o zasiłek za okres od ${od} do ${doDnia} minął ${termin}. Jeśli nie mogłeś złożyć wniosku z przyczyn od Ciebie niezależnych, skontaktuj się z ZUS przed wysłaniem wniosku.`,
    k0322: ({ zaswiadczenie, platnik }: { zaswiadczenie: string; platnik: string }) => `Do wniosku o zasiłek opiekuńczy potrzebne jest zaświadczenie płatnika składek ${zaswiadczenie}. Wypełnia je ${platnik}, który może przekazać je do ZUS przez eZUS. Poproś płatnika o to zaświadczenie.`,
    k0149: "Dołącz do wniosku dokumenty z listy w formacie PDF, JPG albo PNG, każdy do 10 MB.",
    brakZalacznikow: "Nie musisz dołączać plików, bo oświadczenia są już we wniosku.",
    zalaczniki: {
      "zaswiadczenie-alternatywne": "Zaświadczenie lekarskie z wydrukowanego formularza",
      orzeczenie: "Orzeczenie o niepełnosprawności dziecka",
      "zaswiadczenie-drugiego-rodzica": "Zaświadczenie lekarskie o porodzie, chorobie albo pobycie w szpitalu drugiego rodzica",
      "decyzja-izolacji": "Decyzja o konieczności izolacji dziecka",
      "pobyt-matki": "Zaświadczenie placówki leczniczej o okresie pobytu mamy w szpitalu",
      "orzeczenie-matki": "Prawomocne orzeczenie mamy albo jego potwierdzona kopia",
    } as Record<string, string>,
    dolaczPlik: "Dołącz plik",
    plikDolaczony: ({ nazwa }: { nazwa: string }) => `Dołączony plik: ${nazwa}`,
    zasady: "Zasiłek opiekuńczy nie przysługuje za czas urlopu bezpłatnego, urlopu opiekuńczego, aresztu i odbywania kary pozbawienia wolności. Jeśli w okresie opieki pracujesz zarobkowo albo wykorzystujesz zwolnienie niezgodnie z jego celem, tracisz zasiłek za cały okres.",
    oswiadczenie: "Oświadczam, że dane we wniosku są zgodne z prawdą i znam zasady wypłaty zasiłku opiekuńczego.",
    bladOswiadczenia: "Potwierdź oświadczenie.",
    adresat: "Adresat wniosku",
    wyslij: "Wyślij wniosek do ZUS",
    przygotuj: "Przygotuj wniosek dla płatnika składek",
    bladWysylki: "Nie udało się wysłać wniosku. Szkic jest zapisany, spróbuj ponownie później.",
    // koniec ViewZ15Summary
  },
  ViewZ15Sent: {
    tytulStrony: "Wniosek Z-15 wysłany",
    naglowek: "Wysłaliśmy wniosek o zasiłek opiekuńczy",
    potwierdzenie: ({ numer, data }: { numer: string; data: string }) => `Numer potwierdzenia ${numer}, data wysłania ${data}.`,
    opis: "ZUS wypłaci zasiłek niezwłocznie, najpóźniej w ciągu 30 dni od złożenia wszystkich dokumentów. Sprawa Zasiłek opiekuńczy na dziecko ma w planie status złożona.",
    doPlanu: "Przejdź do planu rodziny",
    // koniec ViewZ15Sent
  },
  ViewZ15ForPayer: {
    tytulStrony: "Wniosek Z-15 dla płatnika składek",
    naglowek: "Wniosek o zasiłek opiekuńczy dla płatnika składek",
    k0323: ({ platnik }: { platnik: string }) => `Wniosek jest gotowy. Podpisz go i przekaż płatnikowi składek ${platnik} w postaci papierowej albo elektronicznej, na przykład e-mailem, razem z dokumentami z listy.`,
    doPrzekazania: "Do przekazania płatnikowi",
    podpisanyWniosek: "Podpisany wniosek o zasiłek opiekuńczy Z-15",
    drukuj: "Pobierz wniosek do podpisu",
    oznacz: "Oznacz wniosek jako przekazany płatnikowi",
    doPlanu: "Przejdź do planu rodziny",
    // koniec ViewZ15ForPayer
  },
  // Arkusze i okna modalne
  SheetHealthDataConsent: {
    tytul: "Zgoda na dane dotyczące zdrowia",
    wstep: "Żeby wyliczyć plan rodziny i terminy oraz przygotować wnioski, potrzebujemy danych o ciąży, porodzie, poronieniu i stanie zdrowia matki i dziecka oraz zaświadczeń lekarskich e-ZLA z konta ZUS. To dane dotyczące zdrowia, dlatego prosimy Cię o zgodę na ich przetwarzanie.",
    zakresTytul: "Zgoda obejmuje:",
    zakres: [
      "dane o ciąży, które podajesz w przewodniku, np. przewidywany termin porodu,",
      "dane o porodzie i poronieniu, np. datę porodu i tydzień ciąży w dniu porodu,",
      "dane o stanie zdrowia matki i dziecka, np. pobyt w szpitalu, orzeczenie o niezdolności do samodzielnej egzystencji i zaświadczenie „Za życiem”,",
      "zaświadczenia lekarskie e-ZLA z Twojego konta ZUS.",
    ],
    cel: "Wykorzystamy je wyłącznie do wyliczenia planu rodziny i terminów, przygotowania wniosków oraz do pokazania danych, które podajesz w przewodniku, rodzicom w planie Twojej rodziny. Zaświadczenia e-ZLA z Twojego konta ZUS zobaczysz tylko Ty.",
    bezZgody: "Bez zgody możesz dalej korzystać z przewodnika. Nie zapiszemy wtedy tych danych i nie pobierzemy zaświadczeń e-ZLA z konta ZUS, a plan pokaże sprawy, które od nich nie zależą.",
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
        tresc: "Administratorem Twoich danych w przewodniku rodzica jest Zakład Ubezpieczeń Społecznych, który prowadzi aplikację mZUS. Dane kontaktowe administratora i inspektora ochrony danych znajdziesz w klauzuli informacyjnej aplikacji mZUS.",
      },
      {
        tytul: "2. Jakie dane obejmuje zgoda",
        tresc: "Zgoda obejmuje dane dotyczące zdrowia, które podajesz w przewodniku rodzica: dane o ciąży, porodzie, poronieniu i stanie zdrowia matki i dziecka, na przykład przewidywany termin porodu, datę porodu, tydzień ciąży w dniu porodu, pobyt w szpitalu, orzeczenie o niezdolności do samodzielnej egzystencji i zaświadczenie „Za życiem”. Zgoda obejmuje też zaświadczenia lekarskie e-ZLA z Twojego konta ZUS.",
      },
      {
        tytul: "3. W jakim celu wykorzystujemy dane",
        tresc: "Dane wykorzystujemy wyłącznie do wyliczenia planu rodziny i terminów, przygotowania wniosków w przewodniku oraz do pokazania danych, które podajesz w przewodniku, Tobie i drugiemu rodzicowi w planie Twojej rodziny. Zaświadczenia lekarskie e-ZLA pokazujemy wyłącznie Tobie, bo pochodzą z Twojego konta ZUS.",
      },
      {
        tytul: "4. Co się stanie, jeśli nie udzielisz zgody",
        tresc: "Możesz dalej korzystać z przewodnika. Nie zapiszemy wtedy danych objętych zgodą i nie pobierzemy zaświadczeń lekarskich e-ZLA z Twojego konta ZUS, a plan rodziny pokaże sprawy, które od tych danych nie zależą.",
      },
      {
        tytul: "5. Jak zapisujemy Twoją decyzję",
        tresc: "Przy każdej decyzji zapisujemy jej rodzaj, czyli udzielenie, odmowę albo wycofanie zgody, wersję treści zgody oraz datę i godzinę.",
      },
      {
        tytul: "6. Jak wycofać zgodę",
        tresc: "Zgodę wycofasz w każdej chwili w ustawieniach przewodnika. Od razu przestaniemy wykorzystywać dane objęte zgodą, a usuniemy je w ciągu 30 dni.",
      },
      {
        tytul: "7. Usunięcie danych rodziny",
        tresc: "W ustawieniach przewodnika możesz też jednym działaniem usunąć wszystkie dane rodziny: profil rodziny, plan rodziny, terminy, przypomnienia i wnioski przygotowane w przewodniku, których nie wysłano. Usuniemy je w ciągu 30 dni. Drugi rodzic, który dołączył do planu rodziny, straci wtedy do niego dostęp. Wnioski wysłane do ZUS pozostają w ZUS.",
      },
      {
        tytul: "8. Twoje prawa",
        tresc: "Dane dotyczące zdrowia przetwarzamy na podstawie Twojej wyraźnej zgody (art. 9 ust. 2 lit. a RODO). Masz prawo dostępu do danych, ich sprostowania, usunięcia i ograniczenia przetwarzania, prawo do wycofania zgody w każdej chwili oraz prawo do wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.",
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
      return `plan rodziny (${liczba} ${odmiana}),`;
    },
    terminy: "terminy i przypomnienia,",
    wnioski: "wnioski przygotowane w przewodniku, których nie wysłano.",
    wnioskiZLista: ({ lista }: { lista: string }) => `wnioski, których nie wysłano: ${lista}.`,
    rodzajeWnioskow: {
      zam: "wniosek o zasiłek macierzyński (ZAM)",
      "zas-53": "wniosek o zasiłek chorobowy (ZAS-53)",
      "z-15": "wniosek o zasiłek opiekuńczy (Z-15)",
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
  // Strona /api-docs i opis OpenAPI 3.1 w GET /api/v1/openapi.json (REST API logiki biznesowej przewodnika).
  ViewApiDocs: {
    tytulStrony: "REST API przewodnika",
    opisStrony: "Punkty końcowe REST API przewodnika w wersji 1 z przykładami żądań i odpowiedzi.",
    naglowek: "REST API przewodnika, wersja 1",
    wstep:
      "Logika biznesowa przewodnika działa na serwerze jako REST API. Kalkulatory zasiłku, plan rodziny z terminami, świadczenia w ciąży, weryfikacja przykładowych spraw, walidacje pól i symulowany ZUS liczą wynik tymi samymi funkcjami domeny co aplikacja i korzystają z katalogu świadczeń zapisanego na serwerze.",
    zasadyNaglowek: "Zasady wywołań",
    zasady: [
      "Wysyłaj treść żądania POST w formacie JSON z nagłówkiem Content-Type: application/json.",
      "Podawaj daty w formacie RRRR-MM-DD, chwile w formacie RRRR-MM-DDTHH:MM:SS w strefie Europe/Warsaw, a kwoty w groszach.",
      "Pole dzis podstawia dzień wyliczenia, a pole dataDemo albo nagłówek X-Data-Demo działa jak data demonstracyjna z ustawień demo. Bez nich serwer liczy od bieżącej daty w strefie Europe/Warsaw. W żądaniach GET te pola są parametrami adresu.",
      "Błąd ma postać { kod, pola, parametry } z kodem z tablicy komunikatów i statusem HTTP z kolumny Kod HTTP tej tablicy. Komunikat informacyjny, który blokuje operację, dostaje status 422.",
      "Przełączniki symulacji z ustawień demo przekazuj w polu symulacje albo w nagłówku X-Symulacje: daneZusNiedostepne, stanRozliczenNiedostepny, wysylkaDoZusNiedostepna i pueEzusNiedostepne.",
    ],
    openApiNaglowek: "Opis OpenAPI",
    openApiOpis: "Pełny opis API w formacie OpenAPI 3.1 pobierzesz pod adresem",
    spisTresci: "Spis punktów końcowych",
    etykiety: {
      zadanie: "Przykładowe żądanie",
      odpowiedz: "Przykładowa odpowiedź w skrócie",
      bledy: "Kody błędów",
      status: ({ status }: { status: string }) => `Status ${status}`,
      bezTresci: "Żądanie bez treści, parametry w adresie.",
    },
    grupy: {
      kalkulatory: "Kalkulatory decyzji",
      plan: "Plan rodziny i świadczenia",
      sprawy: "Przykładowe sprawy",
      zus: "Symulowany ZUS",
      walidacje: "Walidacje pól",
      opis: "Opis API",
    },
    endpointy: {
      zasilekMacierzynski: {
        tytul: "Zintegrowany kalkulator zasiłku macierzyńskiego",
        opis: "Liczy okresy urlopów, stawki, kwoty miesięczne, harmonogram wypłat, sumy i daty powrotu do pracy z danych wejściowych kalkulatora, parametrów scenariusza i podstaw wymiaru rodziców. Podstawę podasz jako kwotę, podstawy składek z 12 miesięcy albo PESEL konta w symulowanym ZUS.",
      },
      wariant: {
        tytul: "Kalkulator wariantu zasiłku macierzyńskiego",
        opis: "Porównuje wypłaty w wariancie 81,5% i w wariancie 100% i 70% dla podstawy wymiaru, daty porodu, liczby dzieci i liczby tygodni urlopu rodzicielskiego przed powrotem do pracy.",
      },
      podzialUrlopu: {
        tytul: "Kalkulator podziału urlopu rodzicielskiego",
        opis: "Dzieli urlop rodzicielski między rodziców, liczy tygodnie przepadające, stawki i szacunkowe wypłaty miesięczne każdego rodzica.",
      },
      plan: {
        tytul: "Plan rodziny i kalendarz terminów",
        opis: "Wylicza sprawy planu rodziny z etapami, statusami i ostrzeżeniami oraz terminy spraw z kosztem spóźnienia z profilu rodziny, danych ciąży i dziecka, danych konta ZUS, wniosków i wyników kalkulacji.",
      },
      swiadczeniaWCiazy: {
        tytul: "Świadczenia w ciąży",
        opis: "Ustala prawo do zasiłku chorobowego, świadczenia rehabilitacyjnego, zasiłku wyrównawczego i zasiłku macierzyńskiego oraz okres zasiłkowy z profilu rodziny i danych konta ZUS.",
      },
      weryfikacjaSprawy: {
        tytul: "Weryfikacja przykładowej sprawy",
        opis: "Sprawdza osiem warunków prawa do świadczeń z ubezpieczenia chorobowego, porównuje wynik z rozstrzygnięciem, ustala podstawę wymiaru i wylicza zasiłek macierzyński dla sprawy wzorcowej przewodnika albo danych sprawy z dokumentów.",
      },
      kontoZus: {
        tytul: "Dane z konta ZUS",
        opis: "Zwraca symulowany odczyt danych konta ZUS: tytuły ubezpieczenia z podstawami składek, członków rodziny, zasiłki, świadczenia rodzinne, wnioski, zaświadczenia e-ZLA przy zgodzie na dane dotyczące zdrowia i pełnomocnictwa. PESEL konta przekaż w nagłówku X-Pesel. Parametr postac=zrodlowe zwraca dane źródłowe konta przed filtrami odczytu, a kanal=pue-ezus oznacza odczyt przez PUE/eZUS.",
      },
      stanRozliczen: {
        tytul: "Stan rozliczeń składek",
        opis: "Zwraca stan rozliczeń składek osoby prowadzącej działalność na wskazany dzień, rodzaj dokumentu, który ZUS wyda w tym dniu, i komunikaty o skutku zadłużenia dla prawa do świadczeń.",
      },
      zaswiadczenie: {
        tytul: "Zaświadczenie o niezaleganiu w opłacaniu składek",
        opis: "Wydaje symulowane zaświadczenie o niezaleganiu albo decyzję o odmowie jego wydania według stanu rozliczeń składek ze wskazanego dnia. Pole stanSymulowany przekazuje stan symulowanego ZUS z ustawień demo, na przykład oś zadłużenia ze scenariusza.",
      },
      ezla: {
        tytul: "Zaświadczenia lekarskie e-ZLA",
        opis: "Zwraca zaświadczenia lekarskie e-ZLA z ostatnich 12 miesięcy, od najnowszych. Potwierdź zgodę na dane dotyczące zdrowia parametrem zgodaNaDaneZdrowia=tak.",
      },
      wnioski: {
        tytul: "Wysłanie wniosku do ZUS",
        opis: "Przyjmuje wniosek ZAM, ZAS-53 albo Z-15 po kontroli oświadczeń i załączników i zwraca numer potwierdzenia symulowanego ZUS.",
      },
      pytania: {
        tytul: "Pytanie do ZUS",
        opis: "Wysyła pytanie do symulowanego ZUS przez PUE/eZUS i zwraca pytanie w stanie wysłanym z chwilą symulowanej odpowiedzi.",
      },
      walidacje: {
        tytul: "Walidacja pola albo danych",
        opis: "Sprawdza wartość pola albo dane formularza tymi samymi regułami co formularze przewodnika i zwraca wartość po normalizacji.",
      },
      openApi: {
        tytul: "Opis OpenAPI 3.1",
        opis: "Zwraca opis wszystkich punktów końcowych w formacie OpenAPI 3.1.",
      },
    },
    openApiInfo: {
      tytul: "REST API przewodnika przyszłej mamy",
      opis: "REST API logiki biznesowej modułu Przewodnik przyszłej mamy w aplikacji mZUS. Daty mają format RRRR-MM-DD, kwoty są w groszach, a błąd ma postać BladApi z kodem z tablicy komunikatów.",
      opisBledu: "Błąd z kodem z tablicy komunikatów, kodami pól i parametrami treści komunikatu.",
      opisDanych: "Obiekt zgodny z typem TypeScript z katalogu web/src/domena/typy.",
      opisDzis: "Dzień wyliczenia w formacie RRRR-MM-DD.",
      opisDatyDemo: "Data demonstracyjna w formacie RRRR-MM-DD.",
      opisTeraz: "Chwila wyliczenia w formacie RRRR-MM-DDTHH:MM:SS.",
      opisSymulacji: "Przełączniki symulacji z ustawień demo, nazwy oddzielone przecinkami.",
      opisPeselu: "Numer PESEL konta w symulowanym ZUS. Przekaż go w nagłówku żądania, dzięki czemu numer nie trafia do adresu, logów serwera ani historii przeglądarki.",
      opisRodzajuWalidacji: "Rodzaj walidacji.",
      opisDnia: "Dzień stanu rozliczeń w formacie RRRR-MM-DD.",
      opisZgody: "Zgoda na dane dotyczące zdrowia: tak albo nie.",
      opisPostaci: "Postać odpowiedzi: zrodlowe zwraca dane źródłowe konta przed filtrami odczytu.",
      opisKanalu: "Kanał odczytu: pue-ezus oznacza odczyt przez PUE/eZUS.",
      odpowiedzPoprawna: "Odpowiedź poprawna.",
    },
    // koniec ViewApiDocs
  },
  SheetEmploymentChoice: {
    tytul: "Wybierz formę zatrudnienia",
    opis: "Wybierz formę, którą ma uwzględnić Twój plan. Zaznaczyliśmy formę z Twojego konta ZUS.",
    opisBezDanych: "Wybierz formę, którą ma uwzględnić Twój plan.",
    legenda: "Forma zatrudnienia",
    znacznikZKonta: "Z konta ZUS",
    // koniec SheetEmploymentChoice
  },
  SheetContributionPaidConfirm: {
    tytul: "Potwierdź opłacenie składek",
    tytulMiesiaca: ({ miesiac }: { miesiac: string }) => `Potwierdź opłacenie składek za ${miesiac}`,
    opis: ({ miesiac }: { miesiac: string }) =>
      `Na Twoim koncie ZUS nie widzimy stanu rozliczeń składek. Sprawdź w swoim banku, czy składki za ${miesiac} są opłacone, i potwierdź opłacenie.`,
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
    tytulWielu: "Nowe dzieci w danych ZUS",
    imieINazwisko: "Imię i nazwisko dziecka",
    dataUrodzenia: "Data urodzenia",
    listaDzieci: "Dzieci z danych ZUS",
    opisJednego: ({ data }: { data: string }) =>
      `Po potwierdzeniu zapiszemy w profilu rodziny datę porodu ${data}, jedno urodzone dziecko oraz jego imię, nazwisko i numer PESEL.`,
    opisDwojga: ({ data }: { data: string }) =>
      `Po potwierdzeniu zapiszemy w profilu rodziny datę porodu ${data}, dwoje urodzonych dzieci oraz ich imiona, nazwiska i numery PESEL.`,
    opisWielu: ({ data, liczba }: { data: string; liczba: string }) =>
      `Po potwierdzeniu zapiszemy w profilu rodziny datę porodu ${data}, liczbę urodzonych dzieci (${liczba}) oraz imiona, nazwiska i numery PESEL wszystkich dzieci.`,
    opisSzczegolow: "Potem zapytamy Cię o kilka szczegółów porodu.",
    potwierdz: "Potwierdź datę porodu",
    zamknij: "Zamknij",
    // koniec ModalNewChildDetected
  },
  ModalBenefitRules: {
    tytul: "Zastosowane reguły",
    tytulSwiadczenia: ({ nazwa }: { nazwa: string }) => `Zastosowane reguły: ${nazwa}`,
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
    opis: "Plik zawiera terminy spraw do zrobienia, które masz w planie w chwili pobrania, bez spraw złożonych i załatwionych.",
    liczbaTerminow: ({ liczba }: { liczba: number }) => `Terminy w pliku: ${liczba}`,
    podpisTabeli: "Sprawy z terminem w pliku kalendarza",
    przewijanie: "Tabela spraw z terminem w pliku kalendarza",
    kolumny: { sprawa: "Sprawa", termin: "Termin" },
    szacowany: "termin szacowany",
    notatka: "Każdy termin trafi do kalendarza jako wydarzenie na cały dzień terminu, z nazwą sprawy w tytule oraz kosztem albo skutkiem spóźnienia w opisie. Otwórz plik .ics w kalendarzu na komputerze albo w telefonie. Gdy plan się zmieni, pobierz nowy plik.",
    pobierz: "Pobierz plik",
    anuluj: "Anuluj",
    // koniec SheetCalendarDownload
  },
  SheetCalcBaseSource: {
    tytul: "Podstawa wymiaru zasiłku",
    tytulRodzica: ({ rodzic }: { rodzic: string }) => `Podstawa wymiaru zasiłku: ${rodzic}`,
    zrodloLegenda: "Źródło podstawy",
    kontoZus: "Konto ZUS",
    kontoZusOpis: "Liczymy z podstaw składek na koncie ZUS.",
    kontoZusNiedostepneBrakSkladek: "Niedostępne, bo w danych ZUS nie ma podstaw składek z ubezpieczeniem chorobowym.",
    kontoZusNiedostepneDrugi: "Niedostępne, bo nie znamy danych drugiego rodzica z ZUS.",
    przykladowaSprawa: "Przykładowa sprawa",
    przykladowaSprawaOpis: "Kwota z przykładowej sprawy ZUS.",
    wpisana: "Wartość wpisana przez rodzica",
    wpisanaOpis:
      "Wybierz, gdy znasz inną kwotę, na przykład podstawę zasiłku chorobowego, po którym od razu zaczyna się zasiłek macierzyński.",
    kwota: "Podstawa wymiaru zasiłku (zł)",
    kwotaPodpowiedz: "Kwota większa od zera, najwyżej 99 999,99 zł, na przykład 5177,40.",
    pelnyEtatLegenda: "Czy pracujesz na pełny etat?",
    pelnyEtatLegendaDrugi: "Czy drugi rodzic pracuje na pełny etat?",
    pelnyEtatPodpowiedz: ({ kwota }: { kwota: string }) =>
      `Przy pełnym etacie podstawa wynosi co najmniej ${kwota}, czyli minimalną podstawę wymiaru zasiłku pracownika.`,
    tak: "Tak",
    nie: "Nie",
    tabelaPodpis: "Jak policzyliśmy podstawę z konta ZUS",
    tytulUbezpieczenia: "Tytuł ubezpieczenia",
    opisTytulu: ({ forma, od }: { forma: string; od: string }) => `${forma} od ${od}`,
    tabelaPrzewijanie: "Wyliczenie podstawy z konta ZUS",
    kolumnaPozycja: "Pozycja",
    kolumnaWartosc: "Wartość",
    podstawaZasilku: "Podstawa wymiaru zasiłku",
    miesiacPrawa: ({ miesiac }: { miesiac: string }) => `Miesiąc powstania prawa: ${miesiac}`,
    zapisz: "Zapisz podstawę",
    anuluj: "Anuluj",
    // Tryb gościa: podstawa wpisana albo z przykładowej sprawy.
    goscOpis: "Liczysz bez logowania, więc wpisz podstawę wymiaru zasiłku sam.",
    goscZaloguj: "Zaloguj się, żeby wyliczyć podstawę z konta ZUS",
    // koniec SheetCalcBaseSource
  },
  ModalCalcAppliedRules: {
    tytul: "Zastosowane reguły",
    opis: ({ zdarzenie, data }: { zdarzenie: string; data: string }) =>
      `Reguły ze słowników katalogu świadczeń, które wpłynęły na wynik. Stosujemy wartości obowiązujące w dniu ${zdarzenie}, ${data}.`,
    zdarzenia: {
      porod: "porodu",
      "przewidywany-porod": "przewidywanego terminu porodu",
      przyjecie: "przyjęcia dziecka",
    },
    podpis: "Reguły, które wpłynęły na wynik",
    przewijanie: "Tabela zastosowanych reguł",
    kolumny: { regula: "Reguła i słownik", wartosc: "Wartość", od: "Obowiązuje od" },
    slowniki: {
      "kwoty-i-progi": "Słownik kwot i progów",
      "wymiary-i-okresy": "Słownik wymiarów i okresów",
    },
    jednostki: {
      zl: "zł",
      procent: "%",
      tygodnie: "tyg.",
      dni: "dni",
      miesiace: "mies.",
      lata: "lat",
      osoby: "os.",
      czesci: "części",
      g: "g",
      "procent-etatu": "% etatu",
    },
    brakRegul: "Wynik nie zawiera jeszcze zastosowanych reguł.",
    zamknij: "Zamknij",
    // koniec ModalCalcAppliedRules
  },
  SheetCalcParentalParts: {
    tytul: "Podział urlopów",
    wstep: ({ data, dzieci, wymiar, koniec }: { data: string; dzieci: string; wymiar: string; koniec: string }) =>
      `Poród ${data}, ${dzieci}. Urlop rodzicielski to ${wymiar} tygodni dla obojga rodziców, z czego każde z Was ma 9 tygodni tylko dla siebie. Urlop macierzyński kończy się ${koniec}.`,
    wstepMatkaBezPrawa: ({ data, dzieci, kto, forma, zrodlo }: { data: string; dzieci: string; kto: string; forma: string; zrodlo: string }) =>
      `Poród ${data}, ${dzieci}. ${kto} w dniu porodu: ${forma}. ${zrodlo}`,
    czesciTytul: "Części urlopu rodzicielskiego",
    czesciOpis: ({ od, najpozniej, limit }: { od: string; najpozniej: string; limit: string }) =>
      `Każda część zaczyna się najwcześniej ${od} i kończy najpóźniej ${najpozniej}. Każde z rodziców wykorzystuje najwyżej ${limit} tygodnie. Łącznie zaplanujesz najwyżej 5 części.`,
    czesciOpisZUbezpieczeniem: ({ od, kogo, odDrugiego, najpozniej, limit }: { od: string; kogo: string; odDrugiego: string; najpozniej: string; limit: string }) =>
      `Każda część zaczyna się najwcześniej ${od}, a część ${kogo} najwcześniej ${odDrugiego}, i kończy najpóźniej ${najpozniej}. Każde z rodziców wykorzystuje najwyżej ${limit} tygodnie. Łącznie zaplanujesz najwyżej 5 części.`,
    czesciOpisMatkaBezPrawa: ({ najpozniej, kto, limit }: { najpozniej: string; kto: string; limit: string }) =>
      `Każda część zaczyna się najwcześniej w dniu porodu, poza przejętym urlopem macierzyńskim, i kończy najpóźniej ${najpozniej}. ${kto} wykorzystuje najwyżej ${limit} tygodnie, 9 tygodni matki przepada. Łącznie zaplanujesz najwyżej 5 części.`,
    czesc: ({ numer }: { numer: string }) => `Część ${numer}`,
    rodzic: "Rodzic",
    wybierz: "Wybierz",
    opcjaMatka: ({ kto }: { kto: string }) => `Matka: ${kto}`,
    opcjaDrugiRodzic: ({ kto }: { kto: string }) => `Drugi rodzic: ${kto}`,
    dataPoczatku: "Data początku",
    liczbaTygodni: "Liczba tygodni",
    okres: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}`,
    usunCzesc: ({ numer }: { numer: string }) => `Usuń część ${numer}`,
    dodajCzesc: "Dodaj część",
    ojcowskiTytul: ({ kto }: { kto: string }) => `Urlop ojcowski: ${kto}`,
    wDniuPorodu: ({ forma, zrodlo }: { forma: string; zrodlo: string }) => `W dniu porodu: ${forma}. ${zrodlo}`,
    ubezpieczenieOpis: ({ kto }: { kto: string }) =>
      `Jeśli ${kto} podjął po porodzie pracę albo ubezpieczenie chorobowe, ma prawo do zasiłku za urlop ojcowski od tego dnia, zanim dziecko skończy 12 miesięcy.`,
    ubezpieczeniePodpowiedz: ({ od, do_, kto }: { od: string; do_: string; kto: string }) =>
      `Pole nieobowiązkowe. Podaj datę od ${od} do ${do_}. Zostaw je puste, jeśli ${kto} nie podjął ubezpieczenia po porodzie.`,
    dataUbezpieczenia: "Data podjęcia ubezpieczenia chorobowego po porodzie",
    formaPoPorodzie: "Forma zatrudnienia po porodzie",
    formyPoPorodzie: {
      "umowa-o-prace": "Umowa o pracę",
      "umowa-zlecenia": "Umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      jdg: "Jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
    },
    bezDatyUbezpieczenia: ({ kogo }: { kogo: string }) =>
      `Części urlopu rodzicielskiego i urlop ojcowski ${kogo} zaplanujesz po podaniu daty podjęcia ubezpieczenia. Bez tej daty jego 9 tygodni urlopu rodzicielskiego przepada.`,
    bezDrugiegoRodzica: "Rodzina bez drugiego rodzica: 9 tygodni urlopu rodzicielskiego drugiego rodzica przepada.",
    wymiarOjcowskiego: "Wymiar urlopu ojcowskiego",
    wymiaryOjcowskiego: { "14-dni": "14 dni", "7-dni": "7 dni", brak: "Bez urlopu ojcowskiego" },
    liczbaCzesci: "Liczba części",
    ojcowskiZakresPorod: ({ od, najpozniej }: { od: string; najpozniej: string }) =>
      `Od ${od}, czyli od dnia porodu. Część kończy się najpóźniej ${najpozniej}.`,
    ojcowskiZakresUbezpieczenie: ({ od, najpozniej }: { od: string; najpozniej: string }) =>
      `Od ${od}, czyli od dnia podjęcia ubezpieczenia. Część kończy się najpóźniej ${najpozniej}.`,
    dataCzesciOjcowskiego: ({ numer }: { numer: string }) => `Data początku części ${numer}`,
    okresOjcowskiego: ({ od, do_, dni }: { od: string; do_: string; dni: string }) => `Od ${od} do ${do_}, ${dni} dni.`,
    przejecieTytul: "Przejęcie części urlopu macierzyńskiego",
    przejeciePytanie: ({ kto }: { kto: string }) => `Czy ${kto} przejmie część urlopu macierzyńskiego matki?`,
    nie: "Nie",
    tak: "Tak",
    sytuacja: "Sytuacja",
    sytuacje: {
      rezygnacja: "Rezygnacja matki z dalszej części urlopu",
      orzeczenie: "Orzeczenie o niezdolności matki do samodzielnej egzystencji",
      szpital: "Pobyt matki w szpitalu albo innym zakładzie leczniczym",
      porzucenie: "Porzucenie dziecka przez matkę",
      "zgon-matki": "Zgon matki",
      "zatrudnienie-matki": "Podjęcie przez matkę zatrudnienia w wymiarze co najmniej połowy etatu",
    },
    zakresRezygnacji: ({ od, do_ }: { od: string; do_: string }) => `Po rezygnacji matki od ${od}, po 14 tygodniach urlopu, do ${do_}.`,
    zakresPo8Tygodniach: ({ od, do_ }: { od: string; do_: string }) => `Od ${od}, po 8 tygodniach urlopu, do ${do_}.`,
    zakresOdDniaPo: ({ do_ }: { do_: string }) => `Od dnia po zdarzeniu do ${do_}.`,
    zakresZatrudnienia: ({ do_ }: { do_: string }) => `Od dnia, w którym matka podjęła zatrudnienie, do ${do_}, na okres zatrudnienia.`,
    dataPrzejecia: "Data przejęcia",
    koniecPobytu: "Data końca pobytu matki w szpitalu",
    tabelaPrzejecia: "Urlop macierzyński po przejęciu",
    etykietaTabeliPrzejecia: "Urlop macierzyński po przejęciu, przewijana tabela",
    kolumnaRodzic: "Rodzic",
    kolumnaOd: "Od",
    kolumnaDo: "Do",
    kolumnaDni: "Dni",
    matkaWraca: ({ kto, od, do_ }: { kto: string; od: string; do_: string }) => `${kto} wraca do urlopu macierzyńskiego od ${od} do ${do_}.`,
    matkaBezPrawaOkresy: ({ kto }: { kto: string }) => `${kto} nie ma prawa do zasiłku, więc kalkulator nie wylicza jej okresów.`,
    podsumowanie: "Tygodnie urlopu rodzicielskiego",
    matka: "Matka",
    drugiRodzic: "Drugi rodzic",
    przepadajace: "Tygodnie przepadające",
    razem: "Razem",
    zLimitu: ({ liczba, limit }: { liczba: string; limit: string }) => `${liczba} z ${limit}`,
    bezPrawa: "bez prawa do zasiłku",
    brakDanych: "Podział urlopów zaplanujesz po podaniu daty porodu albo przyjęcia dziecka w danych do wyliczenia.",
    anuluj: "Anuluj",
    zapisz: "Zapisz podział",
    formy: {
      "umowa-o-prace": "umowa o pracę",
      "umowa-zlecenia-z": "umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym",
      "umowa-zlecenia-bez": "umowa zlecenia bez dobrowolnego ubezpieczenia chorobowego",
      "jdg-z": "jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym",
      "jdg-bez": "jednoosobowa działalność gospodarcza bez dobrowolnego ubezpieczenia chorobowego",
      "brak-tytulu": "brak tytułu do ubezpieczenia",
      "brak-drugiego-rodzica": "rodzina bez drugiego rodzica",
    },
    zrodla: {
      "profil-rodziny": "Źródło: profil rodziny",
      "konto-zus": "Źródło: konto ZUS",
      "przykladowa-sprawa": "Źródło: przykładowa sprawa",
      "wartosc-w-kalkulatorze": "Źródło: wartość wpisana w kalkulatorze",
      "wartosc-domyslna": "Źródło: wartość domyślna",
    },
    dzieci: { 1: "jedno dziecko", 2: "dwoje dzieci", 3: "troje dzieci", 4: "czworo dzieci", 5: "pięcioro albo więcej dzieci" },
    // Liczba tygodni z odmianą: 1 tydzień, 2–4 tygodnie (bez 12–14), pozostałe tygodni
    tygodnie: ({ liczba }: { liczba: number }) => {
      const reszta10 = liczba % 10;
      const reszta100 = liczba % 100;
      if (liczba === 1) return "1 tydzień";
      if (reszta10 >= 2 && reszta10 <= 4 && (reszta100 < 12 || reszta100 > 14)) return `${liczba} tygodnie`;
      return `${liczba} tygodni`;
    },
    // koniec SheetCalcParentalParts
  },
  SheetCalcWorkCombination: {
    tytul: "Łączenie urlopu rodzicielskiego z pracą",
    wstep: ({ kto }: { kto: string }) =>
      `Forma zatrudnienia, ${kto}: umowa o pracę. Łączysz urlop rodzicielski z pracą u pracodawcy, który udziela Ci urlopu. Za okres łączenia zasiłek jest niższy o wymiar pracy, a urlop wydłuża się o czas pracy i za wydłużenie dostajesz zasiłek w pełnej stawce okresu.`,
    opisTygodni: "Liczba tygodni łączenia: od 1 do liczby tygodni wybranej części, licząc od tygodnia początku łączenia.",
    opisOboje: "Łączenie zapisujesz osobno dla każdej części. Oboje rodzice na umowie o pracę mogą łączyć swoje części z pracą.",
    tydzienPoczatku: "Tydzień części, od którego łączysz urlop z pracą",
    tydzienPoczatkuPodpowiedz: ({ maks }: { maks: string }) => `Od 1 do ${maks}. Wpisz 1, gdy łączysz od pierwszego dnia części.`,
    opisWymiaru: "Wymiar pracy: od 1% do 50% etatu, liczba całkowita.",
    czesc: "Część urlopu rodzicielskiego",
    wybierz: "Wybierz",
    opcjaCzesci: ({ kto, tygodnie, od, do_ }: { kto: string; tygodnie: string; od: string; do_: string }) =>
      `${kto}: ${tygodnie} od ${od} do ${do_}`,
    tygodnie: "Liczba tygodni łączenia",
    wymiarPracy: "Wymiar pracy (% etatu)",
    wynik: "Wynik łączenia",
    wydluzenie: ({ tygodnie, wymiar }: { tygodnie: string; wymiar: string }) => `Wydłużenie urlopu: ${tygodnie} × ${wymiar}`,
    dni: ({ liczba }: { liczba: string }) => `${liczba} dni`,
    okresWydluzenia: "Okres wydłużenia",
    okres: ({ od, do_ }: { od: string; do_: string }) => `od ${od} do ${do_}`,
    przesunietaMatki: "Część matki po przesunięciu",
    przesunietaDrugiego: "Część drugiego rodzica po przesunięciu",
    nowyKoniec: "Nowa data końca części",
    tabela: "Zasiłek w tej części urlopu rodzicielskiego",
    etykietaTabeli: "Zasiłek w części urlopu rodzicielskiego, przewijana tabela",
    kolumnaOkres: "Okres",
    kolumnaDni: "Dni",
    kolumnaStawka: "Stawka",
    kolumnaMiesiecznie: "Miesięcznie",
    kolumnaSuma: "Suma",
    wierszLaczenie: ({ wymiar, od, do_ }: { wymiar: string; od: string; do_: string }) => `Łączenie z pracą, ${wymiar} etatu od ${od} do ${do_}`,
    wierszBezLaczenia: ({ od, do_ }: { od: string; do_: string }) => `Urlop bez łączenia od ${od} do ${do_}`,
    wierszWydluzenie: ({ od, do_ }: { od: string; do_: string }) => `Wydłużenie urlopu od ${od} do ${do_}`,
    objasnienie: ({ stawka, wymiar, wynik }: { stawka: string; wymiar: string; wynik: string }) =>
      `Stawkę za okres łączenia pomniejszamy o wymiar pracy: ${stawka} × (100% − ${wymiar}) = ${wynik}. Za wydłużenie urlopu zasiłek ma pełną stawkę okresu, ${stawka}. Wydłużenie krótsze niż pełny tydzień liczymy w pełnych dniach i pomijamy niepełny dzień, na przykład 7 tygodni przy 25% etatu to 12 dni.`,
    poPoprawieniu: "Popraw pola, a pokażemy wydłużenie urlopu i zasiłek.",
    brakCzesci: "Łączenie z pracą zaplanujesz po dodaniu części urlopu rodzicielskiego pracownika w podziale urlopów.",
    usun: "Usuń łączenie tej części",
    anuluj: "Anuluj",
    zapisz: "Zapisz łączenie",
    // koniec SheetCalcWorkCombination
  },
  SheetCalcReturnToWork: {
    tytul: "Zmień datę powrotu do pracy",
    tytulRodzica: ({ kto }: { kto: string }) => `Zmień datę powrotu do pracy: ${kto}`,
    wstep: ({ data, kogo, kogoDrugiego }: { data: string; kogo: string; kogoDrugiego: string }) =>
      `Data wyliczona ze scenariusza: ${data}. Zmiana dotyczy urlopu rodzicielskiego ${kogo}, a części urlopu ${kogoDrugiego} zostają w swoich datach.`,
    wstepBezDrugiego: ({ data, kogo }: { data: string; kogo: string }) =>
      `Data wyliczona ze scenariusza: ${data}. Zmiana dotyczy urlopu rodzicielskiego ${kogo}.`,
    zakres: ({ od, do_ }: { od: string; do_: string }) => `Od ${od} do ${do_}. Urlop rodzicielski liczymy w pełnych tygodniach.`,
    pole: "Data powrotu do pracy",
    poZmianie: "Po zmianie",
    urlopRodzicielski: ({ kogo }: { kogo: string }) => `Urlop rodzicielski ${kogo}`,
    okresTygodnie: ({ od, do_, tygodnie }: { od: string; do_: string; tygodnie: string }) => `od ${od} do ${do_}, ${tygodnie}`,
    okres: ({ od, do_ }: { od: string; do_: string }) => `od ${od} do ${do_}`,
    bezUrlopu: "bez urlopu rodzicielskiego",
    niewykorzystane: "Tygodnie niewykorzystane w scenariuszu",
    urlopDrugiegoBezZmian: ({ kogo }: { kogo: string }) => `Urlop rodzicielski ${kogo} bez zmian`,
    dataPowrotuKogo: ({ kogo }: { kogo: string }) => `Data powrotu ${kogo}`,
    sumaWyplat: ({ kogo }: { kogo: string }) => `Suma wypłat ${kogo}`,
    wariant100: ({ s100, s70 }: { s100: string; s70: string }) => `Wariant ${s100} i ${s70}`,
    wariant100Wybrany: ({ s100, s70 }: { s100: string; s70: string }) => `Wariant ${s100} i ${s70} (wybrany)`,
    wariant81: ({ s815 }: { s815: string }) => `Wariant ${s815}`,
    wariant81Wybrany: ({ s815 }: { s815: string }) => `Wariant ${s815} (wybrany)`,
    zaplanuj: "Zaplanuj niewykorzystane tygodnie w podziale urlopów",
    brakZakresu: "Najpierw zaplanuj urlop tego rodzica w podziale urlopów, a potem zmienisz datę powrotu.",
    anuluj: "Anuluj",
    zapisz: "Zapisz zmianę",
    matki: "matki",
    rodzicaPrzyjmujacego: "rodzica, który przyjął dziecko",
    drugiegoRodzica: "drugiego rodzica",
    // koniec SheetCalcReturnToWork
  },
  ModalSampleCaseDocument: {
    tytul: "Podgląd dokumentu",
    rodzajDokumentu: "Rodzaj dokumentu:",
    wgrany: "Wgrany:",
    plikUsuniemy: "Plik usuniemy:",
    plikUsuniety: "Plik usunięty:",
    opisyRodzajow: {
      zam: "wniosek o zasiłek macierzyński ZAM",
      "z-3": "zaświadczenie płatnika składek Z-3",
      "z-3a": "zaświadczenie płatnika składek Z-3a",
      "z-3b": "zaświadczenie płatnika składek Z-3b",
      "zas-12": "zaświadczenie płatnika składek ZAS-12",
      poswiadczenie: "poświadczenie ubezpieczenia chorobowego",
      "zrzut-zus": "zrzut z systemu wewnętrznego ZUS",
      "e-zla": "wydruk zaświadczenia lekarskiego e-ZLA",
      "zaswiadczenie-o-terminie-porodu": "zaświadczenie lekarskie o przewidywanej dacie porodu",
      "zaswiadczenie-szpitala": "zaświadczenie szpitala o urodzeniu dziecka i jego pobycie w szpitalu",
      "zaswiadczenie-o-martwym-urodzeniu": "zaświadczenie o urodzeniu martwego dziecka",
      "zaswiadczenie-za-zyciem": "zaświadczenie „Za życiem”",
    },
    podgladPliku: "Podgląd pliku dokumentu",
    plikZespolu: "Plik PDF przygotowany przez zespół",
    podgladZespolu: "Podgląd pliku PDF sprawy wzorcowej. Dane dokumentu widzisz na ekranie danych sprawy.",
    ladowanie: "Wczytujemy podgląd pliku.",
    notatka: "Plik widzisz tylko Ty. Pobieramy z niego wyłącznie dane sprawy.",
    pustyPodglad: "Wgraj plik ponownie, żeby zobaczyć jego podgląd. Dane z dokumentu zostały w sprawie.",
    wgrajPonownie: "Wgraj dokument ponownie",
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
      notatka: "Zasiłek za ten okres wypłaca Ci ZUS na podstawie wniosku. Kreator otworzy się z wybranym zaświadczeniem.",
      akcja: "Złóż wniosek o zasiłek chorobowy (ZAS-53)",
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
    opis: "Wpisz dane z zaświadczenia, które lekarz wystawił w trybie alternatywnym na wydrukowanym formularzu. Plik zaświadczenia dołączysz na podsumowaniu wniosku.",
    poczatek: "Początek okresu niezdolności do pracy",
    koniec: "Koniec okresu niezdolności do pracy",
    podpowiedzDaty: "W formacie DD.MM.RRRR",
    numer: "Seria i numer zaświadczenia (opcjonalnie)",
    podpowiedzNumeru: "Do 20 znaków, z formularza od lekarza",
    notatka: "Prawo do zasiłku i stawkę ustalimy dla wpisanego okresu tak samo jak dla zaświadczenia e-ZLA.",
    anuluj: "Anuluj",
    zapisz: "Zapisz zaświadczenie",
    zamknij: "Zamknij",
    // koniec SheetZas53ManualCertificate
  },
  ModalEmployerMessagePreview: {
    tytul: "Wiadomość do pracodawcy",
    do: "Do",
    temat: "Temat",
    zalaczniki: "Załączniki",
    tresc: "Treść",
    tematWiadomosci: ({ rodzaj, pracownik }: { rodzaj: string; pracownik: string }) => `${rodzaj}, ${pracownik}`,
    trescWiadomosci: ({
      rodzaj,
      dataZlozenia,
      od,
      do: doDnia,
      zalaczniki,
      emailPracownika,
      pracownik,
    }: {
      rodzaj: string;
      dataZlozenia: string;
      od: string;
      do: string;
      zalaczniki: string;
      emailPracownika: string;
      pracownik: string;
    }) => [
      "Dzień dobry,",
      `przesyłam ${rodzaj} złożony ${dataZlozenia}, dotyczący okresu od ${od} do ${doDnia}. W załącznikach do wiadomości przesyłam dokument wniosku${zalaczniki ? ` oraz ${zalaczniki}` : ""}. Proszę o potwierdzenie otrzymania wniosku na adres ${emailPracownika}.`,
      "Z poważaniem,",
      pracownik,
      "Wiadomość została przygotowana w przewodniku dla rodziców.",
    ],
    brakAdresu: "adres e-mail pracodawcy",
    brakAdresuPracownika: "adres e-mail z konta eZUS",
    wroc: "Wróć do podsumowania",
    wyslij: "Wyślij wniosek",
    // koniec ModalEmployerMessagePreview
  },
  SheetRiskDetails: {
    tytul: "Szczegóły ryzyka",
    sprawa: ({ tytul }: { tytul: string }) => `Sprawa: ${tytul}`,
    coMozeSieStac: "Co może się stać",
    dataRyzyka: "Data, której dotyczy ryzyko",
    // Dopisek po dacie ryzyka, np. „, początek umowy zlecenia”
    opisPoDacie: ({ opis }: { opis: string }) => `, ${opis}`,
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
    pytanieOpis: "Jeśli masz wątpliwości, zapytaj ZUS. Do pytania dołączymy informacje o tej sprawie.",
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
    opis: "Skopiuj link i wyślij go drugiemu rodzicowi dowolnym komunikatorem albo e-mailem. Drugi rodzic otworzy link w przeglądarce i zaloguje się przez mObywatela, loginem i hasłem eZUS albo kodem z aplikacji mZUS.",
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
      dane: "Jego dane zostaną w profilu rodziny jako dane podane przez Ciebie. Możesz je potem zmienić.",
    },
    ponownie: "Drugiego rodzica możesz później zaprosić ponownie.",
    potwierdz: "Odłącz drugiego rodzica",
    anuluj: "Anuluj",
    // koniec SheetSecondParentRemoveConfirm
  },
  SheetSpecialSituationConfirm: {
    tytul: "Sprawdź i zapisz",
    rodzaj: "Rodzaj sytuacji",
    data: "Data zdarzenia",
    liczba: "Liczba dzieci",
    opis: "Po zapisaniu dopasujemy plan rodziny do tej sytuacji i włączymy spokojny tryb dla Ciebie i drugiego rodzica. Później możesz dodać kolejną sytuację.",
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
