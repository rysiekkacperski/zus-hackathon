# Wzór dokumentacji projektu Przewodnik przyszłej mamy

## Opis ogólny wzoru

Wzór opisuje standardową strukturę dokumentacji produktowej oraz format, w jakim prowadzimy każdą z jej sekcji.

Wzór każdej sekcji w niniejszym dokumencie zaczyna się od opisu ogólnego sekcji, który wyjaśnia, czemu ta sekcja służy, kto z niej korzysta i jaki jest oczekiwany poziom szczegółowości. Po opisie ogólnym następuje opis formatu, czyli sposób podziału sekcji na strony, zasada numeracji, stałe podsekcje strony oraz forma prezentacji.

Elementy systemu opisane w Modelu systemu są trwałymi obszarami produktu, realizowanymi przez jeden lub więcej Epików, a User Stories są rozwinięciem funkcjonalności należących do konkretnego Epika.

Sekcja pierwsza, Opis produktu, wyznacza problem, użytkownika i granice projektu. Sekcja druga, Model systemu, jest mapą produktu i słownikiem nazw elementów systemu, Epików, grup danych i ról, obowiązującym w całej dokumentacji.

Sekcja trzecia, User Stories, zawiera historyjki gotowe do realizacji przez zespół i agenta AI. Story są pogrupowane w foldery według Epika i funkcji, którą rozwijają, a każde Story zawiera tytuł i treść historyjki, tytuł i opis epiku ze wspólnymi wymaganiami, zadania, walidację, drafty wiadomości i kryteria akceptacji, dzięki czemu Story razem ze wzorami widoków jest kompletne bez pozostałej dokumentacji. Logikę biznesową i prawną, czyli warunki przyznania świadczeń i uprawnień, kwoty, progi i terminy, Story zapisuje wprost we wspólnych wymaganiach Epiku, w zadaniach, walidacji i kryteriach akceptacji.

## Docelowe sekcje

1. Opis produktu
2. Model systemu
3. User Stories

## Zasady wspólne dla całej dokumentacji

Każda strona zaczyna się od podsekcji Metadata, opisanej niżej, a dopiero po niej od zdania wprowadzającego wyróżnionego pogrubieniem, na przykład „Cel strony” albo „Dokument opisuje”, które określa zakres tej strony. Na stronie Story w sekcji User Stories zakres strony określa podsekcja Treść historyjki, a po Metadata stoi od razu podsekcja Tytuł historyjki.

**Metadata.** Podsekcja jest stała dla każdej strony i zawiera wykonawcę, właściciela merytorycznego, status, wersję oraz datę ostatniej aktualizacji. Pole daty jest uzupełniane przez zespół w chwili faktycznej edycji strony, nie jest wypełniane automatycznie ani z góry.

| Pole | Wartość |
| --- | --- |
| Wykonawca |  |
| Właściciel merytoryczny |  |
| Status | robocze / do przeglądu / zatwierdzone |
| Wersja |  |
| Data ostatniej aktualizacji |  |

Zasada obowiązuje jednakowo dla każdej strony opisanej w tym wzorze, dlatego niżej nie powtarzamy tej podsekcji przy każdym szablonie; na rzeczywistej stronie dokumentacji Metadata mimo to znajduje się na jej początku, zgodnie z powyższym opisem.

Jeżeli podsekcja albo pole szablonu nie dotyczy konkretnej strony, wpisujemy wprost „nie dotyczy” wraz z jednozdaniowym uzasadnieniem, dlaczego nie ma zastosowania, zamiast zostawiać puste miejsce albo pomijać podsekcję.

Nazwy własne używane w dokumentacji pochodzą z podsekcji 2.1, 2.3 i 2.4 Modelu systemu. Ten sam element systemu, ten sam Epik, ta sama Grupa danych i ta sama rola nazywają się tak samo we wszystkich sekcjach, także w etykietach diagramów.

Diagramy są prowadzone w Mermaid, a kod źródłowy diagramu jest umieszczany na stronie.

---

# 1. Opis produktu

## Opis ogólny

Opis produktu jest punktem wyjścia dla całej dokumentacji. Odpowiada na pytanie, jaki problem rozwiązujemy oraz wyznacza granice projektu. Korzystają z niego wszyscy członkowie zespołu, którzy potrzebują szybko zrozumieć sens produktu. Ta sekcja opisuje produkt na poziomie biznesowym i nie wchodzi w szczegóły techniczne.

## Format

Opis produktu jest jedną stroną dla całego projektu. Prowadzimy go w pełnych zdaniach, w formie ciągłego tekstu podzielonego na jedenaście numerowanych podsekcji. Listy stosujemy wyłącznie tam, gdzie treść jest wyliczeniem obszarów, jak w zakresie i w MVP.

Każdy akapit zaczyna się od pogrubionej tezy, po której następuje jej rozwinięcie. Teza ma być zdaniem, które można przeczytać samodzielnie i zrozumieć wniosek, a nie nagłówkiem.

## 1.1 Problem

Jaki problem rozwiązujemy, jak wygląda obecna sytuacja i dlaczego warto ten problem rozwiązywać.

## 1.2 Użytkownik

Dla kogo budujemy produkt, jakie są główne potrzeby użytkowników i w jakim kontekście korzystają z rozwiązania.

## 1.3 Wartość produktu

Co produkt daje użytkownikowi i dlaczego miałby z niego korzystać.

## 1.4 Cel biznesowy

Co inicjator projektu, Zakład Ubezpieczeń Społecznych, chce osiągnąć dzięki produktowi.

## 1.5 Zakres

Co wchodzi do projektu i jakie obszary obejmujemy.

## 1.6 Poza zakresem

Czego świadomie na tym etapie nie robimy.

## 1.7 Główne założenia

Najważniejsze założenia produktowe, biznesowe, technologiczne, prawne i dotyczące użytkowników. Każda grupa założeń jest osobnym, opisanym akapitem.

## 1.8 Ryzyka

Najważniejsze ryzyka produktowe, biznesowe, technologiczne, prawne, związane z danymi, integracjami lub AI. Każde ryzyko jest osobnym, opisanym akapitem.

## 1.9 KPI i mierniki sukcesu

Po czym poznamy, że produkt osiąga zakładane cele. Każdy miernik jest zdefiniowany przez to, co mierzy, a nie przez docelową wartość liczbową.

## 1.10 MVP

Minimalny zakres pozwalający użytkownikowi przejść główny proces od początku do końca w demonstracji na hackatonie, z podziałem na priorytet zerowy, priorytet pierwszy i zakres poza MVP.

## 1.11 Wymagania niefunkcjonalne

Mierzalne wymagania dotyczące wydajności, bezpieczeństwa, ochrony danych osobowych oraz dostępności interfejsu, które obowiązują cały produkt niezależnie od konkretnej funkcji. Każde wymaganie jest osobnym, opisanym akapitem i, tam gdzie to możliwe, podaje konkretną wartość liczbową albo próg.

---

# 2. Model systemu

## Opis ogólny

Model systemu pokazuje, z jakich elementów składa się produkt i jak te elementy są ze sobą powiązane. Element systemu jest trwałym obszarem produktu, natomiast Epik jest zamykanym zakresem prac nad tym obszarem, więc jeden element systemu może być w czasie realizowany przez kilka kolejnych Epików. Model systemu jest mapą, do której odwołują się pozostałe sekcje dokumentacji, i służy do planowania kolejności prac oraz do oceny wpływu zmian.

## Format

Model systemu jest jedną stroną dla całego projektu i stanowi słownik nazw obowiązujący w pozostałych sekcjach.

Elementy systemu prowadzimy w tabeli o kolumnach Nr, Grupa, Element systemu, Opis i Epiki. Nr jest kolejnym numerem elementu systemu w tabeli, nadawanym w porządku grup, i wyznacza drugą liczbę w numerach Epików i Stories w sekcji trzeciej. Grupa łączy elementy systemu o wspólnym charakterze, na przykład Rodzina i dane ZUS, Świadczenia i terminy albo Wnioski. Opis jest jednym lub dwoma zdaniami mówiącymi, czym element systemu operuje, a nie jak działa. Kolumna Epiki zawiera numer w postaci 3.x.y i nazwę każdego Epika, obecnie zamkniętego albo aktualnie otwartego, który realizuje dany element systemu, gdzie x jest numerem elementu systemu, a y kolejnym numerem Epika w obrębie elementu. Numer i nazwa Epika z tej kolumny są numerem i nazwą folderu Epika w sekcji trzeciej. Ta tabela jest tylko słownikiem; pełny opis Epika, jego Stories i wspólnych wymagań znajduje się w podsekcji Opis epiku każdego Story Epika.

Relacje, własność grup danych i zależności prowadzimy jako akapity otwierane pogrubionym zdaniem twierdzącym, po którym następuje rozwinięcie. Nazwy elementów systemu w treści wyróżniamy kursywą.

Grupy danych prowadzimy w tabeli o kolumnach Nr, Grupa danych i Zawartość. Nr jest kolejnym numerem grupy danych w tabeli. Nazwy z tej tabeli są nazwami kanonicznymi, używanymi w User Stories oraz w etykietach wszystkich diagramów.

Role prowadzimy w tabeli o kolumnach Rola, Opis i Nadanie roli. Opis mówi, kim jest użytkownik w tej roli i do jakich elementów systemu ma dostęp, a Nadanie roli wskazuje zdarzenie, po którym konto otrzymuje tę rolę. Nazwy ról z tej tabeli są nazwami kanonicznymi, używanymi we wspólnym wymaganiu „Role” każdego Epiku.

Diagram jest jeden dla całego modelu, w Mermaid, w układzie poziomym, z podziałem na podgrafy odpowiadające grupom z podsekcji 2.1 i z klasami kolorystycznymi rozróżniającymi rodzaj elementu. Na stronie umieszczamy kod Mermaid.

## 2.1 Elementy systemu

Lista głównych, trwałych obszarów funkcjonalnych produktu. Element systemu może być realizowany przez jeden lub więcej Epików.

| Nr | Grupa | Element systemu | Opis | Epiki |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## 2.2 Relacje

Jak poszczególne elementy systemu są ze sobą powiązane, z podaniem kierunku zasilania danymi i warunku, który musi być spełniony.

## 2.3 Grupy danych

Jakie najważniejsze informacje są przechowywane i wykorzystywane.

| Nr | Grupa danych | Zawartość |
| --- | --- | --- |
|  |  |  |

## 2.4 Role

Jakie role mają konta w aplikacji i po jakim zdarzeniu konto otrzymuje każdą z nich.

| Rola | Opis | Nadanie roli |
| --- | --- | --- |
|  |  |  |

## 2.5 Diagram

Kod Mermaid diagramu.

---

# 3. User Stories

## Opis ogólny

User Story jest rozwinięciem funkcji należącej do konkretnego Epika, czyli opisuje kompletny fragment zachowania systemu, który można zaprojektować, zbudować i przetestować niezależnie. Story ma wyłącznie wymiar biznesowy: opisuje, co ma powstać, co użytkownik widzi i robi oraz jak system odpowiada. Rozwiązanie techniczne powstaje przy realizacji Story przez zespół i agenta AI. Story nie zawiera nazw technologii, bibliotek, klas, tabel, pól bazy danych, zmiennych środowiskowych ani punktów końcowych API, ponieważ takie szczegóły zawężają rozwiązanie, zanim zespół i agent AI zobaczą całą funkcję.

Każde Story ma następujące cechy:

- **Samowystarczalność.** Story razem ze wzorami widoków zawiera wszystko, czego potrzeba do jego realizacji: opis epiku ze wspólnymi wymaganiami, listę zadań, walidację pól, drafty wiadomości i kryteria akceptacji.
- **Brak odwołań do innych Stories.** Zadania, walidacja i kryteria akceptacji nie wskazują innych Stories ani ich kryteriów. Inne Stories i numery funkcji występują wyłącznie w tabeli historyjek w podsekcji Opis epiku.
- **Brak odwołań do dokumentacji.** Story nie zawiera linków ani odwołań do innych stron dokumentacji ani do materiałów źródłowych, w tym do Opisu produktu, Modelu systemu i researchu.
- **Brak źródeł.** Story nie podaje źródeł, podstaw prawnych ani uzasadnień wymagań. Każda wartość, na przykład kwota świadczenia, próg dochodu na osobę albo liczba dni na złożenie wniosku od daty porodu, stoi wprost w wymaganiu, którego dotyczy.
- **Parametry systemu.** Wartość, którą zespół ustala w trakcie realizacji Story, na przykład po testach, opisujemy jako parametr systemu. Wymaganie, którego dotyczy parametr, podaje jego nazwę, na przykład „wyprzedzenie przypomnienia o terminie”, opisuje, czego parametr dotyczy i jak system postępuje po jego przekroczeniu, oraz wskazuje, że wartość ustala zespół. Zadania i kryteria akceptacji odwołują się do parametru jego nazwą.
- **Wartości zmienne w czasie.** Wartość, która wynika z przepisów albo z decyzji biznesowej i zmienia się w czasie, na przykład kwota świadczenia albo próg dochodu na osobę zmieniany przy weryfikacji kryteriów dochodowych, system przechowuje w nazwanym słowniku. Wymaganie, którego dotyczy taka wartość, podaje nazwę słownika, zakres jego wpisów, rolę, która uzupełnia słownik, oraz wartości obowiązujące w chwili pisania Story, a zadanie poleca utworzyć słownik z tymi wartościami.
- **Zakres jednego Story.** Story opisuje wyłącznie zachowanie, które dostarcza, i kończy przebieg na granicy swojego zakresu stanem, w którym system pozostawia użytkownika, na przykład „system pokazuje ekran ViewDeadlineCalendar i czeka na wybór terminu”. Podział zakresu między Stories pokazuje tabela historyjek.
- **Zadania jako polecenia.** Każde zadanie jest poleceniem dla wykonawcy, które określa, co ma powstać.
- **Widoki z identyfikatorem i wzorem.** Ekran, okno dialogowe i arkusz od dołu wskazujemy identyfikatorem złożonym z prefiksu rodzaju widoku i nazwy własnej. Ekran ma prefiks View, okno dialogowe prefiks Modal, a arkusz od dołu prefiks Sheet, na przykład „ekran ViewParentProfile”, „okno ModalBenefitDetails” albo „arkusz SheetDeadlineReminder”. Nazwę własną zapisujemy po angielsku, łącznie z prefiksem, i każde jej słowo zaczynamy wielką literą. Nazwa opisuje zawartość widoku, a identyfikator brzmi tak samo we wszystkich Stories. Wspólne wymaganie „Widoki” wymienia identyfikatory wszystkich widoków Epiku. Wygląd i treści widoku określa wzór widoku dołączony do Story.
- **Ekran zastępczy.** Przejście do procesu, który realizuje inny Epik, prowadzi do ekranu z identyfikatorem View, który Story tworzy jako ekran zastępczy, na przykład „ekran zastępczy ViewBenefitApplication”. Treść ekranu zastępczego określa wzór widoku dołączony do Story, a Epik realizujący ten proces rozwija ekran pod tym samym identyfikatorem. Wspólne wymaganie „Widoki” wymienia także ekrany zastępcze.
- **Brak treści widoków.** Story nie zawiera tekstów widocznych na ekranach, w oknach i w arkuszach, w tym nagłówków, opisów, etykiet pól, przycisków i odnośników oraz podpowiedzi w polach, ponieważ Story jest udostępniane razem z wzorami widoków, które te treści zawierają. Story wskazuje widok identyfikatorem, a jego składniki nazywa funkcją, na przykład „pole przewidywanego terminu porodu” albo „akcja zapisania profilu”.
- **Działania użytkownika opisane celem.** Działanie użytkownika opisujemy celem, który osiąga, na przykład „użytkownik przechodzi do listy terminów” albo „użytkownik prosi o przypomnienie”.
- **Role z Modelu systemu.** Nazwy ról pochodzą z podsekcji 2.4 Role Modelu systemu. Stan konta, od którego zależą dostępne ekrany i działania, opisujemy rolą konta, na przykład „konto z rolą [nazwa roli]”. Każde przejście między rolami Story zapisuje wprost we wspólnym wymaganiu „Role”, w zadaniach i w kryteriach akceptacji, na przykład „system zmienia rolę konta z [rola wyjściowa] na [rola docelowa]”.
- **Komunikaty z tablicy.** Treści komunikatów dla użytkownika znajdują się w tablicy `tablica-komunikatow.md` w folderze `03-user-stories`, w której każdy komunikat ma ID, nazwę, typ, kod HTTP i treść wiadomości. Story wskazuje komunikat nazwą sytuacji, której dotyczy, i kodem z tablicy komunikatów, na przykład „komunikat zgodny z tablicą komunikatów dla terminu porodu w przeszłości, kod 0016”. Ta sama nazwa sytuacji oznacza w całym Epiku ten sam komunikat. Story, które wprowadza nową sytuację, dodaje do tablicy wiersz z kolejnym wolnym kodem.
- **Biznesowa reguła walidacji każdego pola.** Story określa w podsekcji Walidacja biznesową regułę poprawności wartości każdego swojego pola, na przykład format, zakres wartości albo cyfrę kontrolną, oraz wartości poprawne i błędne, na których wykonawca sprawdza walidację. Chwilę i sposób sprawdzania pola w interfejsie oraz sposób pokazania komunikatu przy polu ustala zespół przy realizacji Story na podstawie wzorów widoków.
- **Wynik bez stanu oczekiwania.** Story opisuje wynik działania systemu, w tym komunikat przy niedostępności systemu zewnętrznego albo przy błędzie zapisu. Stan widoku w czasie oczekiwania na odpowiedź systemu zewnętrznego albo na zakończenie zapisu, w tym wskaźnik postępu, nieaktywne pola i akcje oraz limit czasu oczekiwania, ustala zespół przy realizacji Story.
- **Integracje według najnowszej dokumentacji.** Story, które korzysta z integracji z systemem zewnętrznym, na przykład z PUE/eZUS, mObywatel albo gov.pl, w zadaniu dotyczącym tej integracji poleca obsłużyć ją według najnowszej wersji dokumentacji technicznej, którą dostawca tego systemu udostępnia w chwili realizacji Story.
- **Formy zatrudnienia rodziców.** Wspólne wymaganie „Zakres rodziców” wskazuje formy zatrudnienia rodziców, których dotyczy Epik, oraz każde zachowanie, które zależy od formy zatrudnienia albo od opłacania dobrowolnego ubezpieczenia chorobowego.

Stories jednej funkcji prowadzą od ogółu do szczegółu. Pierwsze Story funkcji ustanawia jej podstawowy przebieg, a kolejne rozszerzają go o ścieżki alternatywne, zabezpieczenia i przypadki szczególne. Każde Story opisuje cały zakres Epika, wskazuje w tabeli historyjek część, na której się skupia, oraz wymienia wymagania wspólne wszystkim historyjkom Epika. Dzięki temu osoba albo agent AI realizujący Story projektuje rozwiązanie wspólne dla całej funkcji, na przykład jeden mechanizm terminów dla zgłoszenia urodzenia, wniosku o zasiłek macierzyński i wniosku o świadczenie 800+, zamiast osobnego rozwiązania dla każdego Story.

Obowiązują dwie zasady dotyczące wielkości User Story. Story musi dać się zrealizować w całości, łącznie z projektem, implementacją i testami, jako jedna zmiana scalana do gałęzi `main`. Przekroczenie dwudziestu kryteriów akceptacji jest sygnałem, że Story warto przejrzeć pod kątem podziału, a nie sztywnym limitem. Jeżeli którykolwiek z tych warunków nie jest spełniony, Story należy podzielić na mniejsze, na przykład według ścieżki głównej i ścieżek alternatywnych, według typów danych wejściowych albo według form zatrudnienia rodziców, najpierw wersja podstawowa, potem rozszerzenia.

## Format

Folder najwyższego poziomu odpowiada Epikowi i ma numer w postaci 3.x.y, złożony z numeru sekcji 3, numeru elementu systemu z podsekcji 2.1 Modelu systemu i numeru Epika, oraz nazwę Epika, takie same jak w kolumnie Epiki Modelu systemu, na przykład `3.7.1-kalendarz-terminow` dla Epika 3.7.1 Kalendarz terminów. W folderze Epika leżą foldery jego funkcji. Funkcja jest częścią Epika, którą rozwija jedna grupa Stories, a jej numer i nazwę ustala kolumna Funkcja w tabeli historyjek. Folder funkcji ma numer w postaci 3.x.y.z, gdzie z jest kolejnym numerem funkcji w obrębie Epika, oraz nazwę funkcji, na przykład `3.7.1.1-terminy-po-porodzie`. Wewnątrz folderu funkcji każde Story jest osobną stroną, zbudowaną z pól opisanych w szablonie niżej i nazwaną czynnością widzianą z perspektywy użytkownika. Nazwa strony Story i jej tytuł zaczynają się od numeru Story w postaci 3.x.y.z.n, gdzie x jest numerem elementu systemu, y numerem Epika, z numerem funkcji, a n numerem Story w obrębie funkcji, na przykład `3.7.1.1.1-wyliczenie-terminow-od-daty-porodu.md`. Numer wyznacza kolejność realizacji: Stories kolejnych funkcji Epiku realizujemy w kolejności numerów funkcji, a w obrębie funkcji w kolejności numerów Stories. Numer Story nie jest cytowany przez pozostałe sekcje dokumentacji.

Podsekcja Tytuł historyjki powtarza numer i nazwę Story z nagłówka strony. Podsekcja Treść historyjki zawiera jedno zdanie w formacie roli, funkcjonalności i korzyści. Podsekcja Tytuł epiku podaje numer Epika w postaci 3.x.y. oraz jego nazwę.

Podsekcja Opis epiku zaczyna się od akapitu, który wyjaśnia, kto i czego potrzebuje, jak przebiega proces widziany oczami użytkownika i co następuje po jego zakończeniu. Po akapicie stoi tabela wszystkich Stories Epiku z kolumnami Historyjka, Funkcja i Zakres, w której bieżące Story jest pogrubione i oznaczone dopiskiem „(niniejsza historyjka)”, a po niej podsekcja „Wspólne wymagania wszystkich historyjek w epiku”. Kolumna Funkcja podaje numer w postaci 3.x.y.z i nazwę funkcji, którą rozwija Story. Tabela i wspólne wymagania są identyczne we wszystkich Stories Epiku, więc zmianę w jednym Story wprowadzamy we wszystkich pozostałych.

Wspólne wymagania to lista ekranów, komunikatów i zachowań, które powtarzają się w kilku Stories i działają w nich jednakowo, a każde wymaganie zaczyna się pogrubioną nazwą zakończoną kropką. Wymagania opisujemy językiem biznesu i podajemy w nich konkretne wartości, na przykład liczbę dni na złożenie wniosku od daty porodu, kwotę świadczenia albo próg dochodu na osobę, a wartość ustalaną przez zespół opisujemy jako parametr systemu. Każdą regułę, na przykład algorytm cyfry kontrolnej numeru PESEL albo sposób wyliczenia terminu od daty porodu, zapisujemy w jednym wymaganiu, a zadania, walidacja i kryteria akceptacji odwołują się do niej nazwą wymagania, na przykład „zgodnie z wymaganiem Terminy od daty porodu”. Do pozostałych podsekcji Story odwołujemy się ich nazwą, na przykład „zgodnie z podsekcją Walidacja”.

Lista zawiera następujące wymagania stałe:

- „Zakres rodziców”, które wskazuje formy zatrudnienia rodziców, czyli umowę o pracę, umowę zlecenia, jednoosobową działalność gospodarczą albo brak tytułu do ubezpieczenia, których dotyczy Epik, i opisuje każde zachowanie zależne od formy zatrudnienia albo od opłacania dobrowolnego ubezpieczenia chorobowego;
- „Role”, które wymienia role z podsekcji 2.4 Role Modelu systemu występujące w Epiku oraz każde przejście między rolami wraz ze zdarzeniem, które je wywołuje;
- „Widoki”, które wymienia identyfikatory wszystkich widoków Epiku, w tym ekranów zastępczych.

Pole Zadania w ramach niniejszej historyjki stoi po Opisie epiku i jest listą numerowaną poleceń dla wykonawcy. Każde zadanie zaczyna się czasownikiem w trybie rozkazującym, na przykład „Stwórz ekran ViewParentProfile” albo „Stwórz mechanizm wyliczenia terminów”, i dotyczy ekranu, okna, arkusza, wiadomości albo zachowania, które dostarcza Story. Zadanie dotyczące widoku wymienia jego składniki nazwane funkcją, na przykład pole przewidywanego terminu porodu albo akcję zapisania profilu, i wskazuje wzór widoku oraz pozostały materiał dołączony do Story. Zadanie dotyczące ekranu zastępczego nazywa go ekranem zastępczym i wskazuje jego wzór. Zadanie dotyczące wiadomości wskazuje draft z podsekcji Draft wiadomości. Zadanie dotyczące integracji z systemem zewnętrznym nazywa ten system i poleca obsłużyć integrację według najnowszej wersji dokumentacji technicznej, którą dostawca tego systemu udostępnia w chwili realizacji Story, na przykład „Stwórz mechanizm [działanie] w [nazwa systemu] według najnowszej wersji dokumentacji technicznej [nazwa systemu]”.

Podsekcja Walidacja zaczyna się od zdania, które dla pustego pola obowiązkowego i dla każdego naruszenia reguły pola wskazuje komunikat zgodny z tablicą komunikatów, z nazwą sytuacji i kodem. Po zdaniu stoi tabela wszystkich pól Story z kolumnami Pole, Warunek, Wartości poprawne i Wartości błędne. Kolumna Warunek zawiera biznesową regułę poprawności wartości, na przykład format, długość, zakres wartości albo cyfrę kontrolną, a gdy regułę zapisuje wspólne wymaganie, odwołuje się do niego nazwą, na przykład „zgodnie z wymaganiem Numer PESEL”. Kolumna Wartości poprawne zawiera co najmniej jedną wartość spełniającą regułę, a kolumna Wartości błędne po jednej wartości dla każdego sposobu naruszenia reguły, na przykład dla złej liczby cyfr i dla błędnej cyfry kontrolnej. Na tych wartościach wykonawca sprawdza walidację. Story bez pól do wypełnienia ma w tej podsekcji wpis „nie dotyczy” z uzasadnieniem.

Podsekcja Draft wiadomości zawiera każdą wiadomość wysyłaną przez Story, czyli wiadomość e-mail albo powiadomienie, pod nagłówkiem z nazwą wiadomości, jako kanał, temat i treść zapisane kursywą, z pogrubionymi etykietami. Wartości zmienne zapisujemy w nawiasach kwadratowych, na przykład „[Termin złożenia wniosku]”. Story, które nie wysyła wiadomości, ma w tej podsekcji wpis „nie dotyczy” z uzasadnieniem.

Kryteria akceptacji numerujemy identyfikatorem w postaci KA-01, KA-02 i dalej. Kryteria dotyczą jednego Story, więc każde Story numeruje je od KA-01. Każde kryterium jest scenariuszem GIVEN, WHEN i THEN zapisanym pod nagłówkiem z identyfikatorem KA jako lista, w której każdy element stoi w osobnej linii: GIVEN opisuje stan początkowy, WHEN jedno zdarzenie, a THEN obserwowalne zachowanie systemu. Każde kryterium ma dokładnie jedną linię GIVEN, jedną linię WHEN i jedną linię THEN i sprawdza jeden stan początkowy oraz jeden oczekiwany skutek. Kilka warunków stanu początkowego zapisujemy jednym zdaniem w linii GIVEN, a stan, w którym system pozostawia użytkownika, na przykład ekran z komunikatem i zawartością pola, jednym zdaniem w linii THEN. Niezależne skutki jednego zdarzenia, na przykład zapisanie profilu rodzica, zmianę roli konta i pokazanie kalendarza terminów, sprawdzają osobne kryteria z tym samym GIVEN i WHEN. Zdarzeniem w linii WHEN jest działanie użytkownika, upływ czasu, na przykład „mija 14. dzień od daty porodu”, albo zakończenie przetwarzania przez system. Odpowiedź systemu zewnętrznego oraz działania użytkownika, które poprzedzają zdarzenie, zapisujemy w linii GIVEN. Kryteria piszemy w czasie teraźniejszym: linia GIVEN opisuje stan albo działanie użytkownika, które trwa przed zdarzeniem, na przykład „użytkownik wpisuje datę porodu 03.12.2026 na ekranie ViewBirthDate”, linia WHEN zdarzenie, na przykład „użytkownik prosi o wyliczenie terminów”, a linia THEN zachowanie systemu, na przykład „system pokazuje ekran ViewDeadlineCalendar”. Słowa kluczowe zapisujemy pogrubionymi wielkimi literami po angielsku, a treść po polsku. Kryterium zawiera wyłącznie linie GIVEN, WHEN i THEN z konkretnymi danymi biznesowymi. Każda wartość błędna z podsekcji Walidacja ma osobne kryterium: linia GIVEN podaje tę wartość, na przykład „użytkownik wpisuje PESEL dziecka „2632150123” z 10 cyframi”, a linia THEN komunikat wskazany nazwą sytuacji i kodem z tablicy komunikatów oraz pole, przy którym system go pokazuje, na przykład „system pozostaje na ekranie ViewChildData z komunikatem zgodnym z tablicą komunikatów dla nieprawidłowej liczby cyfr PESEL, kod 0012, przy polu PESEL”. Scenariusze, które różnią się wartością danych wejściowych albo stanem początkowym, na przykład najwcześniejsza i najpóźniejsza dopuszczalna data albo rodzic na umowie o pracę i rodzic na jednoosobowej działalności gospodarczej, zapisujemy jako osobne kryteria, każde z jedną konkretną wartością. Kryterium, w którym zmienia się rola konta, zapisuje tę zmianę w linii THEN. Kryterium dotyczące wyglądu widoku wskazuje wzór, na przykład „system pokazuje ekran ViewParentProfile zgodny ze wzorem”. Działanie użytkownika opisujemy celem, który osiąga, na przykład „użytkownik przechodzi do listy terminów”, a przyciski i odnośniki nazywamy ich funkcją, na przykład „akcja zapisania profilu”.

Kryteria akceptacji obejmują ścieżkę główną, sytuacje błędne i nietypowe, ale poprawne sytuacje wymagające dodatkowej logiki, które należą do zakresu Story w tabeli historyjek. Scenariusz sytuacji błędnej opisuje w linii THEN stan, w którym system pozostawia użytkownika, z komunikatem wskazanym nazwą sytuacji i kodem z tablicy komunikatów. Story nie ma osobnych podsekcji scenariuszy negatywnych ani przypadków brzegowych, dzięki czemu wszystkie sprawdzalne zachowania mają jedną numerację KA i stają się testami akceptacyjnymi.

Story składa się wyłącznie z pól szablonu. Zachowanie wynikające z przepisów i decyzji biznesowych zapisujemy wprost we wspólnych wymaganiach, zadaniach, walidacji i kryteriach akceptacji. Warunki gotowości i zakończenia pracy określają kryteria wspólne Definition of Ready i Definition of Done.

## Szablon strony Story

Każde Story wewnątrz folderu funkcji jest osobną stroną zbudowaną z następujących pól, w tej kolejności. Na stronie Story każdy nagłówek stoi o jeden poziom wyżej niż w szablonie poniżej: numer i nazwa Story mają nagłówek pierwszego poziomu, Metadata i pola szablonu nagłówki drugiego poziomu, a podsekcje pól, nazwy wiadomości i identyfikatory KA nagłówki trzeciego poziomu.

### Tytuł historyjki

3.x.y.z.n [krótka i jednoznaczna nazwa będąca czynnością użytkownika]

### Treść historyjki

Jako [rola] chcę [funkcjonalność], żeby [korzyść].

### Tytuł epiku

3.x.y. [nazwa Epika]

### Opis epiku

Akapit o tym, kto i czego potrzebuje, jak przebiega proces i co następuje po jego zakończeniu, oraz tabela wszystkich Stories Epiku z wyróżnionym bieżącym Story:

| Historyjka | Funkcja | Zakres |
| --- | --- | --- |
| **3.x.y.z.n [nazwa]** (niniejsza historyjka) | 3.x.y.z [nazwa funkcji] |  |

#### Wspólne wymagania wszystkich historyjek w epiku

- **Zakres rodziców.** Formy zatrudnienia rodziców, których dotyczy Epik, oraz zachowania zależne od formy zatrudnienia albo od opłacania dobrowolnego ubezpieczenia chorobowego.
- **Role.** Role z podsekcji 2.4 Role Modelu systemu występujące w Epiku oraz przejścia między rolami wraz ze zdarzeniami, które je wywołują.
- **Widoki.** Identyfikatory wszystkich widoków Epiku, w tym ekranów zastępczych.
- **[Nazwa wymagania].** Opis ekranu, komunikatu albo zachowania wspólnego dla kilku Stories Epiku, z konkretnymi wartościami albo z nazwanym parametrem systemu.

### Zadania w ramach niniejszej historyjki

1. Stwórz [ekran View…, okno Modal…, arkusz Sheet…, wiadomość albo mechanizm] z jego składnikami nazwanymi funkcją, zgodnie ze wzorem widoku albo z draftem wiadomości.
2. Stwórz [mechanizm] korzystający z integracji z [nazwa systemu zewnętrznego] według najnowszej wersji dokumentacji technicznej, którą dostawca tego systemu udostępnia w chwili realizacji Story.
3. Stwórz ekran zastępczy [View…] zgodny ze wzorem widoku.

### Walidacja

Zdanie o komunikatach zgodnych z tablicą komunikatów dla pustego pola obowiązkowego i dla naruszenia reguły pola, z nazwą sytuacji i kodem, oraz tabela wszystkich pól Story z biznesową regułą poprawności wartości każdego pola i wartościami, na których wykonawca sprawdza walidację:

| Pole | Warunek | Wartości poprawne | Wartości błędne |
| --- | --- | --- | --- |
| [nazwa pola] | [biznesowa reguła poprawności wartości albo odwołanie do wspólnego wymagania jego nazwą] | [co najmniej jedna wartość] | [po jednej wartości dla każdego sposobu naruszenia reguły] |

### Draft wiadomości

#### [Nazwa wiadomości]

**_Kanał:_** _[e-mail albo powiadomienie]_

**_Temat:_** _…_

**_Treść:_** _…_

### Kryteria akceptacji

Scenariusze GIVEN, WHEN i THEN, które muszą zostać spełnione, żeby Story można było uznać za zrealizowane, obejmujące ścieżkę główną, sytuacje błędne i przypadki brzegowe z zakresu Story. Numerujemy je od KA-01 w obrębie Story.

#### KA-01

- **GIVEN** …
- **WHEN** …
- **THEN** …

## Kryteria wspólne Definition of Ready

Definition of Ready określa standard wymagany, zanim zespół albo agent AI rozpocznie realizację Story. Kryteria obowiązują każde Story, a zespół sprawdza je przed rozpoczęciem pracy na podstawie treści Story. Definition of Ready chroni zespół przed rozpoczęciem pracy nad Story, które jest niegotowe do realizacji.

### Kryteria

- User Story ma tytuł i treść historyjki, tytuł i opis epiku z tabelą Stories Epiku i wspólnymi wymaganiami oraz listę zadań,
- Story zawiera wyłącznie treści biznesowe, jest zrozumiałe bez pozostałej dokumentacji i nie zawiera treści widoków ani odwołań do innych Stories, stron dokumentacji ani źródeł poza tabelą Stories Epiku,
- tytuł epiku wskazuje Epik z kolumny Epiki w podsekcji 2.1 Modelu systemu, a tabela Stories Epiku funkcję, której Story dotyczy,
- role występujące w Story są opisane w podsekcji 2.4 Role Modelu systemu,
- wzory ekranów, okien i arkuszy oraz pozostałe materiały wskazane w zadaniach są dołączone do Story,
- kryteria akceptacji są spisane w czasie teraźniejszym jako scenariusze z jedną linią GIVEN, jedną linią WHEN i jedną linią THEN, jednoznaczne i możliwe do przetestowania, a każda wartość błędna z podsekcji Walidacja ma osobne kryterium z komunikatem i kodem,
- Story daje się zrealizować jako jedna zmiana scalana do gałęzi `main`, a przekroczenie dwudziestu kryteriów akceptacji zostało świadomie przejrzane pod kątem podziału,
- zależności od innych Stories i systemów zewnętrznych są zidentyfikowane, a Stories, od których Story zależy, są zakończone,
- decyzje biznesowe, od których zależy Story, są podjęte,
- wzory widoków, tablica komunikatów i drafty wiadomości są zatwierdzone,
- każde odwołanie do komunikatu wskazuje nazwę sytuacji i kod z tablicy komunikatów,
- każde pole Story ma w podsekcji Walidacja biznesową regułę poprawności wartości oraz wartości poprawne i błędne,
- wartości czasów, terminów, kwot i limitów stoją wprost w wymaganiach i są ustalone decyzją biznesową, a każdy parametr systemu ma nazwę i wskazanie, że jego wartość ustala zespół,
- każda wartość zmienna w czasie ma wskazany słownik, w którym system ją przechowuje, i rolę, która uzupełnia słownik,
- zadanie dotyczące każdej integracji z systemem zewnętrznym poleca obsłużyć ją według najnowszej wersji dokumentacji technicznej dostawcy tego systemu.

## Kryteria wspólne Definition of Done

Definition of Done określa standard wymagany przed zamknięciem pracy nad Story. Kryteria obowiązują każde Story, a zespół sprawdza je przed scaleniem zmiany do gałęzi `main`. Lista jest krótka i uzupełnia kryteria akceptacji. Zmiana Definition of Done jest decyzją zespołu, a nie decyzją pojedynczego Story.

### Kryteria

- kryteria akceptacji są spełnione, a każdy scenariusz GIVEN, WHEN i THEN ma test akceptacyjny,
- kod przeszedł przegląd, a zmiany wprowadzone przez agenta AI przeszły przegląd człowieka przed scaleniem,
- wymagane testy przechodzą,
- nie ma błędów krytycznych,
- implementacja jest zgodna ze wzorami widoków,
- zależności zostały poprawnie obsłużone,
- dokumentacja została zaktualizowana,
- rozwiązanie działa na środowisku demonstracyjnym.
