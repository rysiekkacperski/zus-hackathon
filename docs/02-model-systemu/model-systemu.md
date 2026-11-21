# 2. Model systemu

## Metadata

| Pole | Wartość |
| --- | --- |
| Wykonawca | Ryszard Kacperski |
| Właściciel merytoryczny | Ryszard Kacperski |
| Status | do przeglądu |
| Wersja | 0.4.0 |
| Data ostatniej aktualizacji |  |

**Dokument opisuje responsywną aplikację webową Zasiłkowy Przewodnik Przyszłego Rodzica na poziomie modelu systemowego: z jakich elementów się składa, jak te elementy są ze sobą powiązane oraz z systemami ZUS, serwisem eZUS i usługami zewnętrznymi, jakie grupy danych przepływają między nimi, kto za nie odpowiada, jakie role mają konta i jakie zależności trzeba uwzględnić w kolejności budowy poszczególnych obszarów.**

## 2.1 Elementy systemu

| Nr | Grupa | Element systemu | Opis | Epiki |
| --- | --- | --- | --- | --- |
| 1 | Zarządzanie użytkownikiem | Konto i uwierzytelnianie | Logowanie użytkownika przez mObywatela, w prototypie symulowane z wyborem przykładowego konta rodzica albo konta administratora, tożsamość użytkownika potrzebna do odczytu danych z konta ZUS oraz zgody na przetwarzanie danych dotyczących zdrowia. | 3.1.1 Logowanie i zgody |
| 2 | Zarządzanie użytkownikiem | Ustawienia i powiadomienia | Preferencje kanałów przypomnień, czyli e-maila i SMS-a, i wyprzedzenia przypomnień, dane kontaktowe użytkownika, doręczanie przypomnień i komunikatów tworzonych przez pozostałe elementy systemu oraz pobranie terminów jako pliku kalendarza. | 3.2.1 Przypomnienia o terminach |
| 3 | Rodzina i dane ZUS | Profil rodziny | Operuje danymi matki i drugiego rodzica, w tym zmianą i ustaniem zatrudnienia w ciąży, danymi ciąży, porodu i dziecka, danymi przyjęcia dziecka na wychowanie, sytuacją szczególną rodziny oraz dostępem kont do rodziny, w tym pełnomocnictwem PEL drugiego rodzica, uzupełnianymi danymi z konta ZUS i odpowiedziami rodzica. | 3.3.1 Profil na start, 3.3.2 Pakiet narodzin, 3.3.3 Dołączenie drugiego rodzica, 3.3.4 Przyjęcie dziecka na wychowanie, 3.3.5 Sytuacje szczególne |
| 4 | Rodzina i dane ZUS | Odczyt danych ZUS | Odczyt danych, które ZUS zgromadził na koncie zalogowanego ubezpieczonego, a na podstawie pełnomocnictwa PEL także na koncie drugiego rodzica: statusu ubezpieczenia z okresami ubezpieczenia, podstaw składek, informacji, czy płatnik składek wypłaca zasiłki, członków rodziny zgłoszonych do ubezpieczenia zdrowotnego, zasiłków z ostatnich 6 miesięcy, zaświadczeń lekarskich e-ZLA, stanu rozliczeń składek, korespondencji w PUE/eZUS i statusu wniosków złożonych w ZUS, oraz dane przykładowych spraw ZUS odczytane z dokumentów, z weryfikacją ubezpieczenia chorobowego. | 3.4.1 Dane z konta ZUS w profilu rodziny, 3.4.2 Status wniosków ZUS w planie rodziny, 3.4.3 Przykładowe sprawy ZUS, 3.4.4 Zaświadczenia lekarskie e-ZLA, 3.4.5 Rozliczenie składek i zaświadczenie |
| 5 | Świadczenia i terminy | Katalog świadczeń | Świadczenia, uprawnienia, obowiązki i informacje dla rodzica wraz z warunkami, kwotami, stawkami, wymiarami urlopów, progami dochodowymi, regułami świadczeń z ubezpieczenia chorobowego, dokumentami i miejscem złożenia wniosku, instytucjami, kanałami, regułami terminów, instrukcjami, podmiotami wsparcia i odnośnikami do serwisów informacyjnych, prowadzone przez administratora. | 3.5.1 Prowadzenie katalogu świadczeń, 3.5.2 Świadczenia w ciąży i dokumenty wniosków, 3.5.3 Ryzyka, ochrona pracownicza i podmioty wsparcia |
| 6 | Świadczenia i terminy | Plan rodzica | Osobista lista świadczeń, uprawnień, obowiązków i informacji rodziny, ułożona według etapów, ze statusem i wybranym wariantem każdej sprawy oraz z wynikiem ustalenia prawa do świadczeń w ciąży. | 3.6.1 Plan świadczeń rodziny |
| 7 | Świadczenia i terminy | Kalendarz terminów | Terminy spraw z planu rodziny liczone od 10. tygodnia ciąży, od daty porodu, od daty przyjęcia dziecka na wychowanie i od wieku dziecka, terminy powtarzalne oraz koszt spóźnienia. | 3.7.1 Kalendarz terminów |
| 8 | Świadczenia i terminy | Przewodnik po formalnościach | Instrukcja załatwienia sprawy z planu rodziny z dokumentami i odnośnikami do serwisów informacyjnych, przejście do właściwego kanału: kreatora aplikacji, PUE/eZUS, Emp@tii, mObywatela albo rejestru stanu cywilnego na gov.pl, oraz pytanie do ZUS i podgląd danych konta w PUE/eZUS. | 3.8.1 Instrukcje i przejścia do kanałów, 3.8.2 Pytanie do ZUS przez PUE/eZUS |
| 9 | Wnioski | Kreatory wniosków | Kreatory wniosków ZUS o zasiłki i zgłoszeń do ubezpieczeń związanych z rodzicielstwem, wniosków o urlopy do pracodawcy i wniosku o odpis aktu urodzenia, uzupełniane danymi z konta ZUS, z profilu rodziny i ze scenariusza kalkulatora, wraz z wysyłką wniosku do ZUS, przygotowaniem go dla płatnika składek, wysłaniem do pracodawcy albo złożeniem w rejestrze stanu cywilnego. | 3.9.1 Wniosek o zasiłek macierzyński ZAM, 3.9.2 Rezygnacja matki i wniosek ojca o zasiłek, 3.9.3 Wniosek o zasiłek opiekuńczy Z-15, 3.9.4 Zgłoszenie dziecka do ubezpieczenia zdrowotnego, 3.9.5 Zgłoszenie do dobrowolnego ubezpieczenia chorobowego, 3.9.6 Wnioski o urlopy do pracodawcy, 3.9.7 Wniosek o odpis aktu urodzenia, 3.9.8 Wniosek o zasiłek przy przyjęciu dziecka na wychowanie |
| 10 | Decyzje | Kalkulatory decyzji | Zintegrowany kalkulator okresu i wysokości zasiłku macierzyńskiego dla obojga rodziców, porównanie wariantów zasiłku macierzyńskiego, podział urlopu rodzicielskiego między rodziców i wybór wariantu programu Aktywny Rodzic, liczone z podstawy wymiaru z konta ZUS, wpisanej przez rodzica albo z przykładowej sprawy, z zapisem scenariusza i decyzji w planie rodziny. | 3.10.1 Wariant zasiłku macierzyńskiego, 3.10.2 Podział urlopu rodzicielskiego, 3.10.3 Wariant programu Aktywny Rodzic, 3.10.4 Zintegrowany kalkulator zasiłku macierzyńskiego |
| 11 | AI | Asystent AI | Warstwa konwersacyjna odpowiadająca na pytania rodzica na podstawie tych samych danych i reguł co pozostałe elementy systemu. | 3.11.1 Asystent w czacie |

## 2.2 Relacje

**Element *Konto i uwierzytelnianie* jest punktem wejścia do aplikacji.** Element loguje użytkownika przez mObywatela, a w prototypie symuluje to logowanie z wyborem przykładowego konta rodzica albo konta administratora, które otwiera panel administracyjny *Katalogu świadczeń*. Element udostępnia pozostałym elementom tożsamość zalogowanego ubezpieczonego, na podstawie której *Odczyt danych ZUS* odczytuje dane jego konta, i zapisuje zgodę na przetwarzanie danych dotyczących zdrowia, która warunkuje zapisanie danych ciąży, dziecka i sytuacji szczególnej w *Profilu rodziny*.

**Element *Odczyt danych ZUS* odczytuje dane, które ZUS zgromadził na koncie zalogowanego ubezpieczonego, i udostępnia je *Profilowi rodziny*, *Planowi rodzica*, *Kreatorom wniosków* i *Kalkulatorom decyzji*.** Status ubezpieczenia wskazuje tytuły ubezpieczenia z datą początku i końca okresów ubezpieczenia, z których *Profil rodziny* proponuje formę zatrudnienia i opłacanie dobrowolnego ubezpieczenia chorobowego. Podstawy składek są podstawą wyliczeń w *Kalkulatorach decyzji*, a członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego wskazują dzieci. Dla każdego płatnika składek, który zgłasza rodzica do ubezpieczenia chorobowego, *Odczyt danych ZUS* odczytuje informację, czy płatnik wypłaca zasiłki, ponieważ zgłaszał do ubezpieczenia chorobowego więcej niż 20 osób według stanu na 30 listopada poprzedniego roku, a płatnik, który na ten dzień nikogo nie zgłaszał do ubezpieczenia chorobowego, według stanu na pierwszy miesiąc, w którym dokonał takiego zgłoszenia. Z tej informacji *Profil rodziny* ustala płatnika zasiłku, a dla rodzica prowadzącego jednoosobową działalność gospodarczą wskazuje ZUS. Gdy Dane z konta ZUS nie zawierają tej informacji, *Profil rodziny* pyta rodzica, czy płatnik zgłasza do ubezpieczenia chorobowego więcej niż 20 osób. Wynik *Profil rodziny* zapisuje w Danych rodziny jako płatnika zasiłku ze źródłem danej. Status wniosków złożonych w ZUS przez eZUS, mZUS, bankowość elektroniczną albo Emp@tię, z planowym terminem załatwienia sprawy, aktualizuje status spraw w *Planie rodzica*. Zasiłki z ostatnich 6 miesięcy oraz świadczenia rodzinne z kwotą i planowanym terminem wypłaty *Odczyt danych ZUS* przekazuje do *Planu rodzica*, który pokazuje przy sprawach ZUS ostatnią i planowaną wypłatę. Dane drugiego rodzica *Odczyt danych ZUS* odczytuje z jego konta ZUS, gdy drugi rodzic dołączy do rodziny albo udzieli rodzicowi pełnomocnictwa PEL do roli Ubezpieczony w eZUS. Na podstawie pełnomocnictwa *Odczyt danych ZUS* odczytuje tytuły i okresy ubezpieczenia, ubezpieczenie chorobowe, podstawy składek, informację o płatniku zasiłku i wypłacone zasiłki drugiego rodzica, wyłącznie w okresie obowiązywania pełnomocnictwa.

**Zaświadczenia lekarskie e-ZLA i stan rozliczeń składek *Odczyt danych ZUS* przekazuje do *Planu rodzica*, a pozostałe elementy korzystają z nich wtedy, gdy Dane z konta ZUS je zawierają.** Zaświadczenie e-ZLA z kodem literowym „B” wskazuje niezdolność do pracy w ciąży, a okresy zaświadczeń pozwalają policzyć wykorzystaną część okresu zasiłkowego i dni wynagrodzenia chorobowego w roku kalendarzowym. Stan rozliczeń składek osoby prowadzącej pozarolniczą działalność na dzień powstania prawa do świadczenia zasila strażnika ubezpieczenia chorobowego w *Planie rodzica*, a gdy Dane z konta ZUS go nie zawierają, rodzic potwierdza opłacanie składek sam, a *Profil rodziny* zapisuje to potwierdzenie w Danych rodziny ze źródłem danej. W prototypie e-ZLA, stan rozliczeń i zaświadczenie o stanie rozliczeń są symulowane na przykładowych kontach.

**Przykładowe sprawy ZUS w *Odczycie danych ZUS* zastępują dane konta ZUS danymi odczytanymi z dokumentów sprawy i zasilają *Kalkulatory decyzji*.** Użytkownik wgrywa wniosek ZAM, zaświadczenie Z-3, zaświadczenie Z-3a albo poświadczenie ubezpieczenia chorobowego albo wybiera sprawę przygotowaną przez zespół. Odczyt danych z wgranego dokumentu korzysta z mechanizmu opartego na sztucznej inteligencji, a użytkownik sprawdza i poprawia każdą odczytaną wartość. Weryfikacja ubezpieczenia chorobowego stosuje do danych sprawy reguły świadczeń z ubezpieczenia chorobowego z *Katalogu świadczeń* i zapisuje wynik z uzasadnieniem w Dokumentach przykładowej sprawy. Podstawę wymiaru i okresy ze sprawy *Odczyt danych ZUS* przekazuje do zintegrowanego kalkulatora w *Kalkulatorach decyzji*, który porównuje wyliczenie z oczekiwanym rozstrzygnięciem sprawy. Przykładowe sprawy działają niezależnie od Profilu rodziny i Planu rodzica konta, które je otwiera.

**Od *Profilu rodziny* zależą wszystkie elementy grup Świadczenia i terminy, Wnioski i Decyzje oraz *Asystent AI*.** Profil powstaje w profilu na start, w którym rodzic potwierdza dane z konta ZUS, wybiera swoją sytuację, czyli oczekiwanie na dziecko, narodziny dziecka, przyjęcie dziecka na wychowanie albo planowanie rodzicielstwa, i podaje zmianę albo ustanie zatrudnienia w ciąży, stan cywilny, gminę, dochód na osobę w rodzinie, przewidywany termin porodu i ciążę mnogą. Formę zatrudnienia i ubezpieczenie chorobowe drugiego rodzica podaje rodzic albo odczytuje *Odczyt danych ZUS* na podstawie pełnomocnictwa PEL. Osoba planująca rodzicielstwo przechodzi z wyboru sytuacji do zintegrowanego kalkulatora w *Kalkulatorach decyzji*. Rodzic, który przyjął dziecko na wychowanie, podaje w profilu formę i datę przyjęcia, datę urodzenia dziecka i odroczenie obowiązku szkolnego. *Plan rodzica* odczytuje z profilu dane, od których zależą warunki świadczeń, *Kalendarz terminów* daty kotwiczące, *Kreatory wniosków* dane rodzica i dziecka do wniosku, *Kalkulatory decyzji* formę zatrudnienia, liczbę dzieci, zaświadczenie „Za życiem”, dane przyjęcia dziecka i daty urlopów, a *Asystent AI* cały profil jako kontekst odpowiedzi.

**Pakiet narodzin w *Profilu rodziny* uruchamia się po zapisaniu daty porodu przez rodzica albo wtedy, gdy *Odczyt danych ZUS* wskaże nowe dziecko wśród członków rodziny zgłoszonych do ubezpieczenia zdrowotnego.** *Profil rodziny* proponuje rodzicowi potwierdzenie daty porodu i danych dziecka, a po potwierdzeniu *Plan rodzica* i *Kalendarz terminów* przeliczają sprawy i terminy. Propozycja zależy od formy zatrudnienia rodzica. *Przewodnik po formalnościach* podsuwa każdemu rodzicowi przejście do wniosku o 800+ w PUE/eZUS, rodzicowi, który składa wniosek ZAM, kreator wniosku ZAM w *Kreatorach wniosków*, a pracownikowi wniosek o urlop do pracodawcy z terminem 21 dni. Dla rodzica, który sam zgłasza dziecko do ubezpieczenia zdrowotnego, w szczególności prowadzącego jednoosobową działalność gospodarczą, pakiet uruchamia się po zapisaniu daty porodu przez rodzica, a pojawienie się dziecka w Danych z konta ZUS potwierdza dane dziecka. Rodzic podaje datę porodu sam także wtedy, gdy chce zobaczyć terminy, zanim dziecko pojawi się w danych ZUS.

**Sytuacja szczególna zapisana w *Profilu rodziny* przełącza aplikację w spokojny tryb.** Urodzenie martwego dziecka, zgon dziecka, poronienie, ciężka choroba dziecka, hospitalizacja albo śmierć matki uruchamiają ponowne wyliczenie *Planu rodzica* i *Kalendarza terminów*, a *Ustawienia i powiadomienia* wstrzymują przypomnienia o sprawach, które przestały dotyczyć rodziny, i treści gratulacyjne. *Przewodnik po formalnościach* pokazuje w tej sytuacji podmioty wsparcia z *Katalogu świadczeń*.

**Każda zmiana w *Profilu rodziny* wyzwala ponowne wyliczenie *Planu rodzica* i *Kalendarza terminów*.** Zmianą jest w szczególności potwierdzenie daty porodu, zapisanie daty przyjęcia dziecka na wychowanie, zmiana albo ustanie zatrudnienia, zgłoszenie do dobrowolnego ubezpieczenia chorobowego, uznanie ojcostwa i zapisanie sytuacji szczególnej. Sprawy oznaczone jako złożone albo załatwione zachowują swój status po przeliczeniu.

**Element *Katalog świadczeń* jest jedynym źródłem warunków, kwot, stawek, wymiarów urlopów, progów, reguł świadczeń, reguł terminów, dokumentów i instrukcji.** *Plan rodzica* odczytuje z niego warunki przysługiwania spraw i reguły ustalenia prawa do świadczeń z ubezpieczenia chorobowego w ciąży, *Kalendarz terminów* reguły terminów i kwoty potrzebne do wyliczenia kosztu spóźnienia, *Przewodnik po formalnościach* instytucje, kanały, dokumenty i miejsce złożenia wniosku zależne od płatnika, instrukcje, odnośniki do serwisów informacyjnych i podmioty wsparcia, *Kreatory wniosków* rodzaje urlopów, ich wymiar i załączniki, *Kalkulatory decyzji* stawki zasiłku i wymiary urlopów, weryfikacja ubezpieczenia w *Odczycie danych ZUS* okres wyczekiwania i warunki podlegania ubezpieczeniu, a *Asystent AI* całą zawartość katalogu. Kwoty, stawki, wymiary i progi mają okres obowiązywania, a pozostałe elementy stosują wartość obowiązującą w dniu, którego dotyczy termin albo świadczenie.

**Element *Plan rodzica* wylicza listę spraw rodziny z *Profilu rodziny*, *Katalogu świadczeń* i Danych z konta ZUS.** Każda sprawa w planie wskazuje pozycję katalogu, etap ścieżki, rodzica, którego dotyczy, status i wybrany wariant, a sprawa świadczenia w ciąży także wynik ustalenia prawa, czyli datę, od której świadczenie przysługuje, albo przyczynę braku prawa. Plan jest wejściem dla *Kalendarza terminów*, *Przewodnika po formalnościach*, *Kreatorów wniosków* i *Kalkulatorów decyzji*. W etapie ciąży *Plan rodzica* prowadzi dla rodzica na umowie zlecenia i prowadzącego jednoosobową działalność gospodarczą sprawy i ostrzeżenia strażnika ubezpieczenia chorobowego: aktywność dobrowolnego ubezpieczenia chorobowego, opłacanie składek w terminie, podwyższenie podstawy wymiaru składek tuż przed porodem, ustanie tytułu ubezpieczenia przed porodem i tytuł ubezpieczenia podjęty w ciąży.

**Element *Kalendarz terminów* wylicza termin każdej sprawy z *Planu rodzica* z reguły terminu zapisanej w *Katalogu świadczeń* i z daty kotwiczącej zapisanej w *Profilu rodziny*.** Datami kotwiczącymi są 10. tydzień ciąży wyliczany z przewidywanego terminu porodu, data porodu, którą do czasu porodu zastępuje przewidywany termin porodu, data przyjęcia dziecka na wychowanie, data uprawomocnienia się orzeczenia o przysposobieniu oraz wiek dziecka. Kalendarz prowadzi także terminy powtarzalne, takie jak coroczny wniosek o 800+ na kolejny okres świadczeniowy. Dla każdego terminu kalendarz wylicza koszt spóźnienia z kwot katalogu i przekazuje przypomnienia do *Ustawień i powiadomień*, z wyłączeniem spraw oznaczonych jako złożone albo załatwione.

**Element *Przewodnik po formalnościach* prowadzi rodzica od sprawy z *Planu rodzica* do właściwego kanału.** Sprawę, dla której aplikacja ma kreator, prowadzi do *Kreatorów wniosków*, w tym wnioski o urlopy do kreatora wniosków do pracodawcy, a odpis aktu urodzenia do kreatora wniosku o odpis. Wnioski o 800+, o świadczenia z programu Aktywny Rodzic i o Dobry Start 300+ oraz pozostałe sprawy ZUS bez kreatora w aplikacji prowadzi do PUE/eZUS, sprawy gminy i MOPS do Emp@tii, a zgłoszenie urodzenia do mObywatela. Dla spraw u pracodawcy albo zleceniodawcy pokazuje instrukcję z terminem z *Kalendarza terminów*. Przy każdej sprawie pokazuje dokumenty i miejsce złożenia wniosku zależne od płatnika oraz odnośniki do serwisów zus.pl, gov.pl i pip.gov.pl. Z każdej sprawy rodzic wysyła przez PUE/eZUS pytanie do ZUS z kontekstem sprawy i otwiera podgląd danych swojego konta, a odpowiedź ZUS odczytuje *Odczyt danych ZUS*. Po powrocie z kanału poza ZUS rodzic oznacza sprawę jako załatwioną, a *Przewodnik po formalnościach* zapisuje ten status przez operacje *Planu rodzica*.

**Element *Kreatory wniosków* prowadzi rodzica przez wnioski ZUS o zasiłki i zgłoszenia do ubezpieczeń związane z rodzicielstwem, przez wnioski o urlopy do pracodawcy i przez wniosek o odpis aktu urodzenia, i uzupełnia je danymi z *Odczytu danych ZUS*, z *Profilu rodziny* i z Wyników kalkulacji.** Kreator wniosku o zasiłek macierzyński prowadzi przez wybór rodzaju urlopu, czyli urlopu macierzyńskiego, urlopu na warunkach urlopu macierzyńskiego, urlopu rodzicielskiego, uzupełniającego urlopu macierzyńskiego albo urlopu ojcowskiego, i przez część formularza ZAM dotyczącą tego urlopu. Wniosek ZAM składa osoba ubezpieczona z innego tytułu niż umowa o pracę, dlatego kreator obsługuje matkę prowadzącą jednoosobową działalność gospodarczą, matkę wykonującą umowę zlecenia, ojca prowadzącego jednoosobową działalność gospodarczą albo wykonującego umowę zlecenia, który składa wniosek o zasiłek za okres urlopu ojcowskiego i za swoją część urlopu rodzicielskiego, ojca, który przejmuje zasiłek po rezygnacji matki, oraz osobę, która przyjęła dziecko na wychowanie. Kreator odczytuje płatnika zasiłku z Danych rodziny. Gdy zasiłek wypłaca ZUS, kreator wysyła wniosek do ZUS bez skróconego odpisu aktu urodzenia, z danymi dziecka i rodzica, na podstawie których ZUS pobiera akt sam. Gdy zasiłek wypłaca płatnik składek, na przykład zleceniodawca zgłaszający do ubezpieczenia chorobowego więcej niż 20 osób, kreator przygotowuje wniosek do przekazania płatnikowi i informuje, że wymaga on skróconego odpisu aktu urodzenia. Pracownik przygotowuje w kreatorze wniosków do pracodawcy wniosek o urlop, który aplikacja wysyła pracodawcy, a pracodawca przekazuje do ZUS zaświadczenie Z-3. Wniosek o odpis aktu urodzenia kreator składa w rejestrze stanu cywilnego na gov.pl. Zgłoszenie dziecka do ubezpieczenia zdrowotnego i zgłoszenie do dobrowolnego ubezpieczenia chorobowego kreatory obsługują dla rodzica prowadzącego jednoosobową działalność gospodarczą, który zgłasza je jako płatnik składek za siebie. Złożony wniosek kreator zapisuje w grupie danych Wnioski i oznacza sprawę w *Planie rodzica* jako złożoną przez jego operacje, a dalszy status sprawy *Odczyt danych ZUS* odczytuje z Danych z konta ZUS.

**Element *Kalkulatory decyzji* liczy skutki wyboru na podstawie *Profilu rodziny*, *Katalogu świadczeń* i podstawy wymiaru z *Odczytu danych ZUS*.** Zintegrowany kalkulator zasiłku macierzyńskiego liczy dla obojga rodziców okres i wysokość zasiłku po porodzie, po przyjęciu dziecka na wychowanie i po urodzeniu martwego dziecka albo zgonie dziecka, z uwzględnieniem liczby dzieci, wieku przyjętego dziecka, zaświadczenia „Za życiem”, uzupełniającego urlopu macierzyńskiego, podziału urlopu rodzicielskiego, urlopu ojcowskiego, przejęcia części urlopu macierzyńskiego przez ojca i łączenia urlopu rodzicielskiego z pracą. Podstawę wymiaru kalkulator przyjmuje z Danych z konta ZUS, z wartości wpisanej przez rodzica albo z Dokumentów przykładowej sprawy, zawsze ze wskazaniem źródła, a zasiłek macierzyński wylicza w kwocie nie niższej niż kwota świadczenia rodzicielskiego z *Katalogu świadczeń*, obecnie 1000 zł miesięcznie. Kalkulator wariantu zasiłku i kalkulator podziału urlopu rodzicielskiego stosują te same reguły wyliczeń co zintegrowany kalkulator. Zapisany scenariusz i wybrany wariant kalkulator zapisuje przez operacje *Planu rodzica*, *Kalendarz terminów* dostosowuje do niego terminy, a *Kreatory wniosków* wypełniają nim wniosek ZAM i wnioski o urlopy, na przykład wniosek o zasiłek za okres urlopu rodzicielskiego w wariancie 81,5% złożony w ciągu 21 dni od porodu. Zintegrowany kalkulator jest dostępny także dla konta z rolą Nowy użytkownik, które liczy zasiłek z danych wpisanych w kalkulatorze.

**Element *Ustawienia i powiadomienia* doręcza użytkownikowi przypomnienia i komunikaty, które tworzą pozostałe elementy systemu.** Zasilają go w szczególności *Kalendarz terminów* przypomnieniami o terminach, *Profil rodziny* propozycją pakietu narodzin, zaproszeniem drugiego rodzica i zmianą trybu po zapisaniu sytuacji szczególnej, a *Odczyt danych ZUS* zmianą statusu wniosku i odpowiedzią ZUS na pytanie wysłane przez PUE/eZUS. *Ustawienia i powiadomienia* doręcza je e-mailem albo SMS-em, zgodnie z kanałami i wyprzedzeniem zapisanymi w preferencjach, a przypomnienie o sprawie drugiego rodzica kieruje do jego konta.

**Element *Asystent AI* jest warstwą nałożoną na pozostałe elementy i korzysta wyłącznie z ich danych i reguł.** Odczytuje *Profil rodziny*, *Plan rodzica*, *Kalendarz terminów*, *Katalog świadczeń*, Wnioski i Wyniki kalkulacji, a zmianę, na przykład oznaczenie sprawy jako załatwionej, rozpoczęcie wniosku w kreatorze albo otwarcie kalkulatora z danymi rodziny, po zatwierdzeniu przez rodzica deleguje do operacji właściwego elementu. Pytanie spoza katalogu świadczeń i sprawy wymagające indywidualnej oceny asystent kieruje do pytania do ZUS przez PUE/eZUS, do e-wizyty albo do skrzynki mama@zus.pl. Błąd albo luka w katalogu świadczeń przenosi się natychmiast na jakość odpowiedzi asystenta.

**Dane konta użytkownika należą do modułu *Konto i uwierzytelnianie*, a Ustawienia i Powiadomienia do modułu *Ustawienia i powiadomienia*.** Zgoda na przetwarzanie danych dotyczących zdrowia jest częścią Danych konta użytkownika. Pozostałe elementy systemu tworzą przypomnienia i komunikaty przez operacje *Ustawień i powiadomień*, a moduł prowadzi ich doręczenie oraz status odczytu.

**Dane z konta ZUS należą do systemów ZUS, a moduł *Odczyt danych ZUS* jest właścicielem wyłącznie ich odczytu.** Element przechowuje odczytane dane jako kopię z datą odczytu i odświeża ją przy każdym otwarciu aplikacji, a pozostałe elementy korzystają z nich przez *Odczyt danych ZUS*.

**Dokumenty przykładowej sprawy należą do modułu *Odczyt danych ZUS*.** Moduł przechowuje wgrany dokument najwyżej 24 godziny od wgrania i udostępnia go wyłącznie kontu, które go wgrało, a dane odczytane z dokumentu, korekty użytkownika i wynik weryfikacji ubezpieczenia przechowuje do zakończenia sesji użytkownika albo do usunięcia sprawy.

**Dane rodziny oraz Dane ciąży i dziecka należą do modułu *Profil rodziny*, który jako jedyny je zmienia.** Dostęp kont do rodziny i rola konta w rodzinie są częścią Danych rodziny. Dla każdej danej profil zapisuje jej źródło, czyli konto ZUS, pełnomocnictwo PEL drugiego rodzica albo odpowiedź rodzica. Dane ciąży i dziecka, w tym sytuacja szczególna, są danymi dotyczącymi zdrowia, dlatego *Profil rodziny* zapisuje je wyłącznie dla konta ze zgodą zapisaną w Danych konta użytkownika.

**Katalog świadczeń należy do modułu *Katalog świadczeń*, który zmienia go wyłącznie na polecenie konta z rolą Administrator.** Pozostałe moduły wyłącznie odczytują katalog.

**Pozycje planu należą do modułu *Plan rodzica*.** *Odczyt danych ZUS*, *Przewodnik po formalnościach*, *Kreatory wniosków*, *Kalkulatory decyzji* i *Asystent AI* zmieniają status i wybrany wariant sprawy wyłącznie przez operacje *Planu rodzica*.

**Terminy należą do modułu *Kalendarz terminów*.** Moduł przelicza je po każdej zmianie Danych rodziny, Danych ciąży i dziecka, Pozycji planu albo Katalogu świadczeń.

**Wnioski należą do modułu *Kreatory wniosków*.** Moduł przechowuje treść złożonego, przygotowanego albo wysłanego wniosku, jego adresata, czyli ZUS, płatnika składek, pracodawcę albo rejestr stanu cywilnego, i potwierdzenie złożenia, a status rozpatrzenia wniosku ZUS pochodzi z Danych z konta ZUS.

**Wyniki kalkulacji należą do modułu *Kalkulatory decyzji*.** Decyzja rodzica przechodzi do Pozycji planu, a dane wejściowe, scenariusze i wynik kalkulacji pozostają w module jako podstawa decyzji.

**Interakcje asystenta AI są własnością modułu *Asystent AI* wyłącznie jako log rozmowy i ślad audytowy.** Dane, które powstają w wyniku działania asystenta, zapisuje właściwy moduł docelowy po zatwierdzeniu przez rodzica.

**Katalog świadczeń musi zawierać świadczenia, uprawnienia, obowiązki i informacje z warunkami, kwotami, stawkami, wymiarami urlopów i regułami terminów, zanim *Plan rodzica* zostanie wyliczony po raz pierwszy, a *Kalkulatory decyzji* i weryfikacja ubezpieczenia policzą pierwszy wynik.** Na potrzeby demo katalog wypełniamy stanem prawnym z listopada 2026 roku.

**Logowanie i odczyt danych z konta ZUS muszą zakończyć się przed profilem na start.** Dopiero wtedy *Profil rodziny* proponuje rodzicowi dane z konta ZUS do potwierdzenia. Na potrzeby demo dane z konta ZUS pochodzą z przykładowych kont przygotowanych przez zespół, a dane przykładowych spraw z dokumentów wgranych przez użytkownika albo ze spraw przygotowanych przez zespół na wzór zestawów ZUS.

**Profil na start musi zakończyć się jako pierwszy proces rodzica w aplikacji, z wyjątkiem zintegrowanego kalkulatora i przykładowych spraw.** Dopiero wtedy *Profil rodziny* zawiera dane wymagane przez *Plan rodzica*, *Kalendarz terminów*, *Przewodnik po formalnościach*, *Kreatory wniosków*, kalkulatory oparte na danych rodziny i *Asystenta AI*.

**Zgoda na przetwarzanie danych dotyczących zdrowia musi zostać zapisana, zanim *Profil rodziny* zapisze Dane ciąży i dziecka.** Bez tej zgody aplikacja wylicza plan wyłącznie z Danych rodziny i oznacza sprawy zależne od danych ciąży jako wymagające uzupełnienia profilu.

**Plan rodzica musi zostać wyliczony, zanim *Kalendarz terminów* wyliczy terminy, a *Przewodnik po formalnościach*, *Kreatory wniosków* i *Kalkulatory decyzji* pokażą sprawy rodziny.** Przypomnienia o terminach wymagają ponadto preferencji zapisanych w *Ustawieniach i powiadomieniach*, a do ich zapisania aplikacja stosuje preferencje domyślne.

**Kreator wniosku ZAM wymaga potwierdzonej daty porodu i danych dziecka albo daty przyjęcia dziecka na wychowanie w *Profilu rodziny*.** Dane dziecka są potrzebne ZUS do pobrania aktu urodzenia. O zasiłek macierzyński można wystąpić także przed porodem, a przed przewidywaną datą porodu może przypadać nie więcej niż 6 tygodni zasiłku. Okres zasiłku przed porodem liczy zintegrowany kalkulator, pracownik wnioskuje o tę część urlopu we wniosku do pracodawcy, a wniosek ZAM przed porodem pozostaje poza MVP.

## 2.3 Grupy danych

| Nr | Grupa danych | Zawartość |
| --- | --- | --- |
| 1 | Dane konta użytkownika | Identyfikator użytkownika z logowania przez mObywatela, sposób zalogowania, historia sesji w aplikacji, zgody na przetwarzanie danych wraz z wersją treści zgody oraz datą i godziną jej udzielenia. |
| 2 | Ustawienia | Kanały przypomnień, czyli e-mail i SMS, wyprzedzenie przypomnienia o terminie, dane kontaktowe używane do komunikacji z użytkownikiem, czyli adres e-mail odczytany z konta eZUS albo podany przez użytkownika i numer telefonu komórkowego podany przez użytkownika. |
| 3 | Powiadomienia | Przypomnienia i komunikaty kierowane do użytkownika, wraz z elementem systemu, który je utworzył, terminem, kanałem doręczenia oraz statusem doręczenia i odczytu. |
| 4 | Dane z konta ZUS | Status ubezpieczenia z tytułami ubezpieczenia i okresami ubezpieczenia chorobowego z datą początku i końca, podstawy składek, członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego, zasiłki z ostatnich 6 miesięcy z datą i kwotą wypłaty, świadczenia rodzinne z kwotą i planowanym terminem wypłaty, zaświadczenia lekarskie e-ZLA z ostatnich 12 miesięcy z okresem niezdolności, kodem literowym i płatnikiem, stan rozliczeń składek z kwotą zadłużenia na wskazany dzień, układem ratalnym albo odroczeniem i datą spłaty zadłużenia oraz zaświadczenie o stanie rozliczeń, korespondencja w PUE/eZUS z pytaniem i odpowiedzią ZUS, wnioski złożone w ZUS ze statusem i planowym terminem załatwienia sprawy, informacja o opłacaniu składek na dobrowolne ubezpieczenie chorobowe, informacja, czy płatnik składek wypłaca zasiłki według stanu na 30 listopada poprzedniego roku, adres e-mail konta eZUS, pełnomocnictwa PEL udzielone zalogowanemu ubezpieczonemu przez drugiego rodzica z rolą, zakresem i okresem obowiązywania, dane konta drugiego rodzica odczytane na podstawie pełnomocnictwa, data odczytu. |
| 5 | Dane rodziny | Sytuacja rodzica wybrana na starcie profilu, czyli oczekiwanie na dziecko, narodziny dziecka, przyjęcie dziecka na wychowanie albo planowanie rodzicielstwa, przy czym oczekiwanie na dziecko i narodziny dziecka zapisywane wyłącznie dla konta ze zgodą na przetwarzanie danych dotyczących zdrowia. Dane matki i drugiego rodzica: forma zatrudnienia, rodzaj umowy o pracę, czyli na czas nieokreślony, na czas określony, na okres próbny albo na zastępstwo, data początku zatrudnienia, data i przyczyna ustania zatrudnienia w ciąży, opłacanie dobrowolnego ubezpieczenia chorobowego, potwierdzenie opłacania składek na to ubezpieczenie w terminie, płatnik zasiłku, wymiar pracy w trakcie urlopu rodzicielskiego, dane pracodawcy do wniosków o urlopy, stan cywilny, uznanie ojcostwa, gmina zamieszkania, dochód na osobę w rodzinie, wraz ze źródłem każdej danej, czyli kontem ZUS, pełnomocnictwem PEL drugiego rodzica albo odpowiedzią rodzica. Dostęp kont do rodziny i rola konta w rodzinie. |
| 6 | Dane ciąży i dziecka | Przewidywany termin porodu, data objęcia opieką lekarza albo położnej, ciąża mnoga, data porodu, imię, nazwisko, numer PESEL i miejsce urodzenia dziecka, liczba urodzonych dzieci, tydzień ciąży w dniu porodu, masa urodzeniowa, hospitalizacja dziecka po porodzie, ciężkie i nieodwracalne upośledzenie albo nieuleczalna choroba dziecka, zaświadczenie „Za życiem”, przyjęcie dziecka na wychowanie z formą przyjęcia, datą przyjęcia, datą urodzenia dziecka, odroczeniem obowiązku szkolnego i datą uprawomocnienia się orzeczenia o przysposobieniu, sytuacja szczególna z rodzajem i datą, w tym urodzenie martwego dziecka, zgon dziecka, poronienie, hospitalizacja albo śmierć matki. |
| 7 | Katalog świadczeń | Świadczenia, uprawnienia, obowiązki i informacje dla rodzica wraz z etapem ścieżki, warunkami przysługiwania, instytucją, kanałem złożenia wniosku, regułą terminu, kwotą, stawką, wymiarem urlopu i progiem dochodowym z okresem obowiązywania, regułami świadczeń z ubezpieczenia chorobowego, dokumentami i adresatem wniosku zależnymi od formy zatrudnienia i płatnika, instrukcją załatwienia sprawy, odnośnikami do serwisów informacyjnych oraz podmiotami wsparcia w sytuacjach szczególnych. |
| 8 | Pozycje planu | Sprawy przypisane rodzinie, z pozycją katalogu, etapem, rodzicem, którego dotyczą, statusem, czyli do zrobienia, złożona, załatwiona albo wymagająca uzupełnienia profilu, źródłem statusu, wynikiem ustalenia prawa do świadczenia w ciąży oraz wybranym wariantem. |
| 9 | Terminy | Termin każdej sprawy z planu, data kotwicząca, od której go wyliczono, terminy powtarzalne, koszt spóźnienia oraz data ostatniego wyliczenia. |
| 10 | Wnioski | Wnioski złożone, przygotowane albo wysłane w kreatorach: rodzaj wniosku, w tym wniosek ZAM, rezygnacja z części zasiłku, wniosek o urlop do pracodawcy i wniosek o odpis aktu urodzenia, rodzaj urlopu i wypełniona część formularza, okresy urlopu, wymiar pracy przy łączeniu urlopu z pracą, dane rodzica i dziecka, adresat, czyli ZUS, płatnik składek, pracodawca albo rejestr stanu cywilnego, data i potwierdzenie złożenia. |
| 11 | Wyniki kalkulacji | Dane wejściowe, w tym podstawa wymiaru zasiłku ze źródłem, czyli konto ZUS, wartość wpisana przez rodzica albo przykładowa sprawa, scenariusze zintegrowanego kalkulatora z okresami urlopów obojga rodziców, łączeniem urlopu z pracą i harmonogramem wypłat, wynik porównania wariantu zasiłku macierzyńskiego, podziału urlopu rodzicielskiego i wariantu programu Aktywny Rodzic, wraz z decyzją rodzica. |
| 12 | Interakcje asystenta AI | Treść rozmów, wynik klasyfikacji intencji, ślad audytowy zatwierdzeń użytkownika. |
| 13 | Dokumenty przykładowej sprawy | Dokument wgrany przez użytkownika albo sprawa wybrana z listy spraw przygotowanych przez zespół, rodzaj dokumentu, czyli ZAM, Z-3, Z-3a albo poświadczenie ubezpieczenia chorobowego, dane odczytane z dokumentu z oznaczeniem wartości odczytanych przez mechanizm oparty na sztucznej inteligencji, korekty użytkownika, oczekiwane rozstrzygnięcie sprawy, wynik weryfikacji ubezpieczenia chorobowego z uzasadnieniem oraz data wgrania i usunięcia dokumentu. |

## 2.4 Role

| Rola | Opis | Nadanie roli |
| --- | --- | --- |
| Nowy użytkownik | Konto bez Profilu rodziny. Ma dostęp do profilu na start, do Odczytu danych ZUS w zakresie własnego konta i przykładowych spraw ZUS, do zintegrowanego kalkulatora w Kalkulatorach decyzji oraz do Ustawień i powiadomień. | Pierwsze logowanie użytkownika przez mObywatela, a w prototypie wybór przykładowego konta rodzica w symulacji logowania. |
| Rodzic | Konto, które utworzyło Profil rodziny. Ma dostęp do wszystkich elementów systemu w zakresie swojej rodziny, zmienia dane rodziny oraz dane ciąży i dziecka, składa wnioski w kreatorach, wysyła pytania do ZUS, zaprasza drugiego rodzica i odczytuje dane drugiego rodzica na podstawie pełnomocnictwa PEL. | Zapisanie profilu na start przez konto z rolą Nowy użytkownik. |
| Drugi rodzic | Konto dołączone do Profilu rodziny zaproszeniem. Ma dostęp do Planu rodzica, Kalendarza terminów, Przewodnika po formalnościach, Kreatorów wniosków w zakresie własnych wniosków, Kalkulatorów decyzji i Asystenta AI w zakresie rodziny oraz zmienia własne dane w Profilu rodziny. | Przyjęcie zaproszenia od konta z rolą Rodzic. |
| Administrator | Konto pracownika ZUS, które prowadzi Katalog świadczeń, w tym kwoty, stawki, wymiary urlopów, progi dochodowe, reguły terminów, instrukcje, podmioty wsparcia i nowe pozycje katalogu. Ma dostęp wyłącznie do Katalogu świadczeń. | Nadanie roli przez konto z rolą Administrator albo przez zespół przy uruchomieniu aplikacji, a w prototypie wybór konta administratora w symulacji logowania. |

## 2.5 Diagram

```mermaid
%%{init: {"flowchart": {"defaultRenderer": "elk", "nodeSpacing": 28, "rankSpacing": 70, "htmlLabels": true}} }%%
flowchart LR
    classDef user fill:#FFEBE6,stroke:#DE350B,color:#172B4D,stroke-width:1.5px
    classDef source fill:#E8F1FF,stroke:#0052CC,color:#172B4D,stroke-width:1.5px
    classDef core fill:#E3FCEF,stroke:#00875A,color:#172B4D,stroke-width:1.5px
    classDef output fill:#FFF0B3,stroke:#FF8B00,color:#172B4D,stroke-width:1.5px
    classDef support fill:#EAE6FF,stroke:#6554C0,color:#172B4D,stroke-width:1.5px
    classDef external fill:#F4F5F7,stroke:#42526E,color:#172B4D,stroke-width:1.5px,stroke-dasharray:4 3

    subgraph ZU[Zarządzanie użytkownikiem]
        direction TB
        KONTO[Konto<br/>i uwierzytelnianie]
        UST[Ustawienia<br/>i powiadomienia]
    end

    subgraph ROD[Rodzina i dane ZUS]
        direction TB
        ODCZ[Odczyt danych ZUS]
        PR[Profil rodziny]
        ODCZ -->|Dane z konta ZUS| PR
    end

    subgraph SIT[Świadczenia i terminy]
        direction TB
        KAT[Katalog świadczeń]
        PLAN[Plan rodzica]
        KAL[Kalendarz terminów]
        PRZ[Przewodnik<br/>po formalnościach]
        KAT -->|Katalog świadczeń| PLAN
        KAT -->|Katalog świadczeń| KAL
        KAT -->|Katalog świadczeń| PRZ
        PLAN -->|Pozycje planu| KAL
        PLAN -->|Pozycje planu| PRZ
        PRZ -->|Pozycje planu| PLAN
    end

    subgraph WN[Wnioski]
        KRE[Kreatory wniosków]
    end

    subgraph DEC[Decyzje]
        KALK[Kalkulatory decyzji]
    end

    subgraph AIG[AI]
        AI[Asystent AI]
    end

    subgraph ZEW[Systemy i kanały zewnętrzne]
        direction TB
        MOB[mObywatel<br/>logowanie i zgłoszenie urodzenia]
        SZUS[Systemy ZUS<br/>dane konta i wnioski]
        PUE[PUE/eZUS<br/>wnioski, pytania, pełnomocnictwa PEL]
        EMP[Emp@tia]
        RSC[Rejestr stanu cywilnego<br/>na gov.pl]
        PRAC[Pracodawca<br/>albo zleceniodawca]
        INFO[Serwisy informacyjne<br/>zus.pl, gov.pl, pip.gov.pl]
        ORG[Organizacje wsparcia]
        POCZ[E-mail i SMS<br/>użytkownika]
    end

    MOB -->|logowanie| KONTO
    KONTO -->|Dane konta użytkownika| ODCZ
    KONTO -->|Dane konta użytkownika| PR
    SZUS -->|Dane z konta ZUS| ODCZ
    PUE -->|Dane z konta ZUS| ODCZ
    KAT -->|Katalog świadczeń| ODCZ
    ODCZ -->|Dane z konta ZUS| PLAN
    ODCZ -->|Dane z konta ZUS,<br/>Dokumenty przykładowej sprawy| KALK
    PR -->|Dane rodziny,<br/>Dane ciąży i dziecka| PLAN
    PR -->|Dane ciąży i dziecka| KAL
    PR -->|Dane rodziny,<br/>Dane ciąży i dziecka| KRE
    PR -->|Dane rodziny,<br/>Dane ciąży i dziecka| KALK
    KAT -->|Katalog świadczeń| KALK
    KAT -->|Katalog świadczeń| KRE
    KALK -->|Wyniki kalkulacji| PLAN
    KALK -->|Wyniki kalkulacji| KRE
    PRZ -->|wniosek w aplikacji| KRE
    KRE -->|Pozycje planu| PLAN
    KRE -->|Wnioski| SZUS
    KRE -->|Wnioski| PRAC
    KRE -->|Wnioski| RSC
    PRZ -->|przejście, pytanie do ZUS| PUE
    PRZ -->|przejście| EMP
    PRZ -->|przejście| MOB
    PRZ -->|instrukcja| PRAC
    PRZ -->|odnośniki| INFO
    PRZ -->|kontakt| ORG
    KAL -->|Powiadomienia| UST
    PR -->|Powiadomienia| UST
    ODCZ -->|Powiadomienia| UST
    UST -->|Powiadomienia| POCZ

    AI -. odczyt .-> ROD
    AI -. odczyt i zapis przez<br/>te same operacje .-> SIT
    AI -. rozpoczęcie wniosku .-> KRE
    AI -. otwarcie kalkulatora .-> KALK

    class KONTO,UST user
    class ODCZ,PR source
    class KAT,PLAN,KAL,PRZ core
    class KRE,KALK output
    class AI support
    class MOB,SZUS,PUE,EMP,RSC,PRAC,INFO,ORG,POCZ external
```
