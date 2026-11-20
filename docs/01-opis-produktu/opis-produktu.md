# 1. Opis produktu

## Metadata

| Pole | Wartość |
| --- | --- |
| Wykonawca | Ryszard Kacperski |
| Właściciel merytoryczny | Ryszard Kacperski |
| Status | do przeglądu |
| Wersja | 0.2.0 |
| Data ostatniej aktualizacji |  |

**Dokument opisuje Przewodnik przyszłej mamy, moduł aplikacji mZUS dla przyszłych i świeżo upieczonych rodziców, na poziomie biznesowym, jako punkt wyjścia dla Modelu systemu i User Stories. Produkt powstaje na hackaton wdrożeniowy HackNation 2026 jako odpowiedź na wyzwanie Zakładu Ubezpieczeń Społecznych i jako propozycja modułu do nowej wersji aplikacji mZUS dla klientów indywidualnych.**

## 1.1 Problem

**Prawa i obowiązki rodzica są rozproszone między pięć instytucji: ZUS, gminę albo MOPS, urząd stanu cywilnego, pracodawcę i NFZ.** Każda z nich prowadzi własne wnioski, własne kanały i własne terminy, więc przyszły rodzic sam składa z nich obraz tego, co mu przysługuje i co musi zrobić.

**Niemal każde świadczenie zależy od formy zatrudnienia rodzica.** Osoba na umowie o pracę ma prawo do urlopu macierzyńskiego i rodzicielskiego. Osoba na umowie zlecenia albo prowadząca jednoosobową działalność gospodarczą otrzymuje zasiłek macierzyński tylko wtedy, gdy przed dniem porodu opłaca dobrowolne ubezpieczenie chorobowe. Rodzic, który nie otrzymuje zasiłku macierzyńskiego, ma prawo do świadczenia rodzicielskiego wypłacanego przez gminę. Ta sama sytuacja życiowa ma więc inną odpowiedź dla każdej formy zatrudnienia, a w rodzinie działają jednocześnie dwie formy, matki i drugiego rodzica.

**Najwięcej kosztują przegapione terminy.** Po porodzie biegnie pięć twardych terminów: 7 dni na zgłoszenie dziecka do ubezpieczenia zdrowotnego, 21 dni na zgłoszenie urodzenia i na wniosek o zasiłek macierzyński w wariancie 81,5%, 3 miesiące na wniosek o 800+ z wyrównaniem od urodzenia i na wniosek o świadczenie rodzicielskie oraz 12 miesięcy na wniosek o becikowe i o świadczenie „Za życiem”. Spóźnienie oznacza utratę wyrównania, wyższego wariantu zasiłku albo całego świadczenia.

**Część warunków trzeba spełnić jeszcze w ciąży, a ich brak wychodzi na jaw dopiero po porodzie.** Zaświadczenie o opiece lekarza albo położnej najpóźniej od 10. tygodnia ciąży warunkuje becikowe i świadczenie „Za życiem”. Uznanie ojcostwa przed porodem pozwala ojcu, który nie jest mężem matki, zgłosić urodzenie dziecka. Zgłoszenie do dobrowolnego ubezpieczenia chorobowego przed dniem porodu warunkuje zasiłek macierzyński na umowie zlecenia i w jednoosobowej działalności gospodarczej.

**Rodzic podejmuje decyzje, które zmieniają wysokość wypłat, i musi sam policzyć ich skutki.** Wybór między zasiłkiem w wysokości 81,5% podstawy za cały okres a zasiłkiem w wysokości 100% za urlop macierzyński i 70% za urlop rodzicielski zapada w ciągu 21 dni od porodu. Do tego dochodzi podział urlopu rodzicielskiego między rodziców, w którym każdy rodzic ma 9 nieprzenoszalnych tygodni, oraz wybór wariantu programu Aktywny Rodzic.

**Aplikacja mZUS obsługuje część spraw rodzica, a pozostałe rodzic załatwia w innych kanałach.** W mZUS rodzic składa wnioski o 800+, o świadczenia z programu Aktywny Rodzic i o Dobry Start 300+, sprawdza status wniosku z planowym terminem załatwienia sprawy oraz widzi status ubezpieczenia, podstawy składek, członków rodziny zgłoszonych do ubezpieczenia zdrowotnego i zasiłki z ostatnich 6 miesięcy. Wniosek o zasiłek macierzyński, rezygnację matki z części zasiłku na rzecz ojca, wniosek o zasiłek opiekuńczy, zgłoszenie dziecka do ubezpieczenia zdrowotnego i zgłoszenie do dobrowolnego ubezpieczenia chorobowego rodzic składa w eZUS albo u pracodawcy lub zleceniodawcy. Świadczenia gminne rodzic składa w gminie albo MOPS lub przez Emp@tię, zgłoszenie urodzenia w urzędzie stanu cywilnego albo w mObywatelu, a wnioski o urlopy u pracodawcy. Każdy z tych kanałów obsługuje wyłącznie własne sprawy.

**ZUS odpowiada na potrzebę wiedzy poradnikiem i skrzynką pocztową, które wymagają od rodzica samodzielnego przełożenia przepisów na własną sytuację.** W marcu 2026 roku ZUS uruchomił skrzynkę mama@zus.pl na pytania w indywidualnych sprawach, a 29 kwietnia 2026 roku udostępnił „Poradnik dla rodziców i opiekunów dzieci”, obejmujący umowę o pracę, umowę zlecenia, własną firmę i sytuacje nietypowe. Poradnik opisuje zasady dla wszystkich grup ubezpieczonych, a odpowiedź na pytanie o własną sprawę wymaga napisania do ZUS. Wśród pytań często wraca sytuacja kobiet, którym umowa skończyła się w czasie ciąży.

**Problem dotyczy każdej rodziny, w której rodzi się dziecko, i kosztuje ją realne pieniądze.** W 2025 roku w Polsce urodziło się około 238 tysięcy dzieci, a każda z tych rodzin przechodzi przez te same terminy i decyzje. Najwięcej pieniędzy rodzice tracą na wyrównaniu 800+, na wariancie zasiłku 81,5% i na braku zaświadczenia z 10. tygodnia ciąży, a każdej z tych strat rodzic unika, gdy odpowiednio wcześnie wie o terminie i o kwocie, którą traci po jego upływie.

## 1.2 Użytkownik

**Produkt budujemy dla przyszłych i świeżo upieczonych rodziców korzystających z aplikacji mZUS, od początku ciąży do powrotu do pracy po urlopach.** Główną użytkowniczką jest przyszła matka, ponieważ to ona jest uprawniona do większości świadczeń. Według ZUS kobiety stanowiły 87% spośród 188 tysięcy osób pobierających zasiłek macierzyński za okres urlopu rodzicielskiego od stycznia do kwietnia 2026 roku. Drugi rodzic korzysta z modułu na własnym koncie mZUS, ponieważ ma własne uprawnienia, w tym urlop ojcowski i 9 nieprzenoszalnych tygodni urlopu rodzicielskiego, oraz własne obowiązki, takie jak uznanie ojcostwa przed porodem.

**Głównymi parametrami ścieżki są forma zatrudnienia każdego z rodziców i opłacanie dobrowolnego ubezpieczenia chorobowego.** Rodzic pracuje na umowie o pracę, na umowie zlecenia, prowadzi jednoosobową działalność gospodarczą albo nie ma tytułu do ubezpieczenia. Na ścieżkę wpływają ponadto to, kto wypłaca zasiłek, ZUS albo płatnik składek, stan cywilny rodziców, dochód na osobę w rodzinie, gmina zamieszkania, przewidywany termin porodu, ciąża mnoga, wcześniactwo i hospitalizacja dziecka po porodzie.

**Szczególną personą jest przyszła matka prowadząca jednoosobową działalność gospodarczą.** Ta grupa gubi się najbardziej, ponieważ sama decyduje o dobrowolnym ubezpieczeniu chorobowym, sama zgłasza dziecko do ubezpieczenia zdrowotnego, sama składa w eZUS wniosek o zasiłek macierzyński i co miesiąc opłaca składkę zdrowotną także w czasie pobierania zasiłku.

**Użytkownik korzysta z produktu na pięciu etapach.** Pierwszym jest ciąża, w której rodzic przygotowuje warunki późniejszych świadczeń. Drugim są pierwsze tygodnie po porodzie z pięcioma twardymi terminami. Trzecim są urlopy i zasiłek macierzyński, czwartym świadczenia pieniężne na dziecko, a piątym powrót do pracy z przerwami na karmienie, płatnymi dniami opieki nad dzieckiem i zasiłkiem opiekuńczym.

**Główną potrzebą użytkownika jest wiedza, co dokładnie przysługuje jego rodzinie, do kiedy i gdzie trzeba to załatwić, oraz możliwość załatwienia spraw ZUS w jednym miejscu.** W praktyce oznacza to jedną listę spraw dopasowaną do jego sytuacji, przypomnienie przed każdym terminem razem z kwotą, którą traci po jego upływie, wniosek ZUS złożony w telefonie z danymi uzupełnionymi przez aplikację, prostą instrukcję dla spraw w innych instytucjach oraz pomoc w decyzjach, które zmieniają wysokość wypłat. Użytkownik korzysta z aplikacji w przerwach między obowiązkami przy dziecku, dlatego oczekuje krótkich odpowiedzi w prostym języku.

## 1.3 Wartość produktu

**Przewodnik przyszłej mamy działa jako moduł aplikacji mZUS, którą rodzic zna i w której jest zalogowany.** Moduł rozszerza istniejące ekrany mZUS i korzysta z danych, które aplikacja już pokazuje ubezpieczonemu, dlatego rodzic zaczyna od planu uzupełnionego danymi z konta ZUS.

**Profil na start zaczyna się od danych z konta ZUS.** Status ubezpieczenia wskazuje formę zatrudnienia i opłacanie dobrowolnego ubezpieczenia chorobowego, podstawy składek pozwalają policzyć wysokość zasiłku, a członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego wskazują dzieci. Rodzic potwierdza te dane i odpowiada na pytania, na które ZUS nie zna odpowiedzi: o stan cywilny, gminę, dochód na osobę w rodzinie, przewidywany termin porodu, ciążę mnogą i formę zatrudnienia drugiego rodzica. Moduł pokazuje świadczenia, uprawnienia i obowiązki rodziny ułożone według etapów od ciąży do powrotu do pracy. Każde pytanie profilu zmienia plan, więc moduł pyta wyłącznie o dane potrzebne do jego wyliczenia.

**Kalendarz terminów liczy terminy od dwóch dat, od 10. tygodnia ciąży i od daty porodu, oraz pilnuje terminów powtarzalnych.** Moduł przypomina o każdym terminie z wyprzedzeniem, w tym o corocznym wniosku o 800+ na kolejny okres świadczeniowy, składanym od 1 lutego, i o programie Aktywny Rodzic, gdy dziecko kończy rok.

**Przy każdym terminie moduł pokazuje koszt spóźnienia w złotych.** Rodzic widzi, ile traci, jeżeli nie złoży wniosku o 800+ w ciągu 3 miesięcy od urodzenia, nie wybierze wariantu 81,5% w ciągu 21 dni od porodu albo nie dostarczy zaświadczenia o opiece medycznej od 10. tygodnia ciąży.

**Kreator wniosku o zasiłek macierzyński jest główną funkcją modułu.** Od 24 października 2026 roku jeden formularz ZAM obejmuje urlop macierzyński, urlop na warunkach urlopu macierzyńskiego, urlop rodzicielski, uzupełniający urlop macierzyński i urlop ojcowski, a wnioskodawca wypełnia tylko część dotyczącą swojego urlopu. Kreator prowadzi rodzica przez wybór rodzaju urlopu i tę część formularza, uzupełnia dane rodzica i dziecka z konta ZUS i z profilu rodziny i wysyła wniosek do ZUS. Gdy zasiłek wypłaca ZUS, wniosek nie wymaga skróconego odpisu aktu urodzenia, ponieważ ZUS pobiera akt sam na podstawie danych dziecka. Kreator obsługuje rodzica, któremu zasiłek wypłaca ZUS i który składa wniosek ZAM, w szczególności matkę prowadzącą jednoosobową działalność gospodarczą albo wykonującą umowę zlecenia, oraz ojca, który przejmuje zasiłek po rezygnacji matki po co najmniej 14 tygodniach od porodu.

**Pakiet narodzin uruchamia się, gdy dziecko pojawia się w danych ZUS.** Po zgłoszeniu dziecka do ubezpieczenia zdrowotnego moduł proponuje rodzicowi potwierdzenie daty porodu, przelicza plan i terminy oraz podsuwa wniosek ZAM w kreatorze modułu i wniosek o 800+ w istniejącym kreatorze mZUS, który wybiera dziecko bez ponownego wpisywania jego danych. Rodzic podaje datę porodu sam, jeżeli chce zobaczyć terminy, zanim dziecko pojawi się w danych ZUS.

**Status spraw ZUS moduł odczytuje z mZUS.** Wnioski złożone w ZUS przez mZUS, eZUS, bankowość elektroniczną albo Emp@tię mają w mZUS status z planowym terminem załatwienia sprawy, więc plan rodziny pokazuje go bez udziału rodzica. Sprawy załatwiane poza ZUS rodzic oznacza w planie sam.

**Przewodnik po formalnościach prowadzi rodzica do właściwego kanału dla każdej sprawy z planu.** Sprawy ZUS prowadzi do kreatora modułu albo do istniejącego kreatora mZUS, sprawy gminy i MOPS do Emp@tii, zgłoszenie urodzenia do mObywatela, a wniosek o urlop u pracodawcy opisuje instrukcją z terminem, w tym terminem 21 dni na wniosek o urlop rodzicielski w wariancie 81,5%.

**Kalkulatory decyzji pokazują skutki wyboru w złotych, zanim rodzic go dokona.** Kalkulatory liczą kwoty z podstaw składek widocznych w mZUS. Rodzic porównuje wariant zasiłku 81,5% z wariantem 100% i 70%, planuje podział urlopu rodzicielskiego między rodziców i wybiera wariant programu Aktywny Rodzic, a moduł zapisuje decyzję w planie rodziny, dostosowuje do niej terminy i przenosi ją do kreatora wniosku ZAM.

**Asystent AI odpowiada na pytania rodzica na podstawie jego planu.** Asystent korzysta z tego samego profilu rodziny, planu i katalogu świadczeń co pozostałe części modułu, dzięki czemu odpowiedź dotyczy konkretnej rodziny. W sprawach wymagających indywidualnej oceny asystent kieruje rodzica do wiadomości do Centrum Kontaktu Klientów ZUS albo do e-wizyty, dostępnych w mZUS, lub do skrzynki mama@zus.pl.

**Dla rodzica oznacza to mniej czasu spędzonego na szukaniu przepisów, sprawy ZUS załatwione w jednej aplikacji i mniejsze ryzyko przeoczenia terminu albo świadczenia.** Wspólny plan dla obojga rodziców pozwala też podzielić sprawy i urlopy między nich.

## 1.4 Cel biznesowy

**Celem inicjatora projektu jest, żeby rodzice otrzymywali należne świadczenia w pełnej wysokości i w terminie.** ZUS prowadzi działania wspierające przyszłe matki i rodziców, w ramach których wydał poradnik i uruchomił skrzynkę mama@zus.pl. Moduł przenosi tę wiedzę na poziom konkretnej rodziny i konkretnych dat.

**Moduł jest propozycją rozszerzenia nowej wersji aplikacji mZUS dla klientów indywidualnych, której udostępnienie ZUS planuje w drugiej połowie 2027 roku.** Moduł rozszerza istniejące ekrany i korzysta z danych oraz kreatorów, które mZUS już ma, dlatego jego wdrożenie opiera się na danych dostępnych dziś w aplikacji.

**Moduł przenosi wniosek o zasiłek macierzyński do kanału mobilnego i kieruje rodziców do elektronicznych kanałów ZUS.** Wniosek ZAM jest dziś dostępny w eZUS, a wnioski o 800+ i o świadczenia z programu Aktywny Rodzic rodzic składa w ZUS wyłącznie elektronicznie. Kreator wniosku ZAM w mZUS i przejścia do istniejących kreatorów mZUS skracają rodzicowi drogę do wniosku w chwili, w której wniosek jest potrzebny.

**Produkt odciąża kanały kontaktu ZUS w sprawach powtarzalnych.** Pytania o warunki świadczeń, terminy i potrzebne dane moduł rozstrzyga na podstawie profilu rodziny, dzięki czemu placówki, infolinia i skrzynka mama@zus.pl obsługują sprawy wymagające indywidualnej oceny.

**Produkt wspiera udział drugiego rodzica w opiece nad dzieckiem.** Liczba ojców pobierających zasiłek za urlop ojcowski spadła z ponad 162 tysięcy w 2024 roku do około 137 tysięcy w 2025 roku, a ZUS wspiera kampanię na rzecz równego udziału rodziców w opiece. Wspólny plan rodziny pokazuje drugiemu rodzicowi jego własne uprawnienia i terminy, a kreator prowadzi ojca przez przejęcie zasiłku po rezygnacji matki.

**Celem zespołu jest wygranie wyzwania ZUS na HackNation 2026 rozwiązaniem gotowym do dalszego rozwoju po wydarzeniu.** HackNation jest hackatonem wdrożeniowym, a organizator przewiduje przeniesienie autorskich praw majątkowych do zwycięskich projektów na instytucje zgłaszające wyzwania. Jurorzy mają kilka minut na ocenę rozwiązania, dlatego produkt pokazuje swoją wartość w demo trwającym do 2 minut, a pozycjonowanie jako moduł istniejącej aplikacji ułatwia obronę wykonalności wdrożenia.

## 1.5 Zakres

**Zakres projektu obejmuje ścieżkę rodzica od ciąży do powrotu do pracy, złożoną z następujących obszarów funkcjonalnych:**

- **Konto i uwierzytelnianie**, obejmujące logowanie mechanizmem aplikacji mZUS oraz zgody na przetwarzanie danych dotyczących zdrowia.
- **Ustawienia i powiadomienia**, obejmujące przypomnienia o terminach w kanałach i z wyprzedzeniem wybranymi przez użytkownika.
- **Profil rodziny**, obejmujący profil na start uzupełniony danymi z konta ZUS, pakiet narodzin po pojawieniu się dziecka w danych ZUS oraz dołączenie drugiego rodzica.
- **Odczyt danych ZUS**, obejmujący odczyt statusu ubezpieczenia, podstaw składek, członków rodziny zgłoszonych do ubezpieczenia zdrowotnego, zasiłków z ostatnich 6 miesięcy oraz statusu wniosków złożonych w ZUS.
- **Katalog świadczeń**, obejmujący świadczenia, uprawnienia i obowiązki rodzica wraz z warunkami, kwotami, progami dochodowymi, instytucjami, kanałami i regułami terminów, prowadzony przez administratora.
- **Plan rodzica**, obejmujący osobistą listę świadczeń, uprawnień i obowiązków rodziny, ułożoną według etapów, ze statusem każdej sprawy.
- **Kalendarz terminów**, obejmujący terminy liczone od 10. tygodnia ciąży i od daty porodu, terminy powtarzalne oraz koszt spóźnienia przy każdym terminie.
- **Przewodnik po formalnościach**, obejmujący instrukcję załatwienia każdej sprawy z planu oraz przejście do kreatora modułu, istniejącego kreatora mZUS, Emp@tii, mObywatela albo instrukcję dla pracodawcy.
- **Kreatory wniosków**, obejmujące wniosek o zasiłek macierzyński ZAM, rezygnację matki z części zasiłku i wniosek ojca o zasiłek, wniosek o zasiłek opiekuńczy Z-15, zgłoszenie dziecka do ubezpieczenia zdrowotnego oraz zgłoszenie do dobrowolnego ubezpieczenia chorobowego.
- **Kalkulatory decyzji**, obejmujące porównanie wariantów zasiłku macierzyńskiego, podział urlopu rodzicielskiego między rodziców i wybór wariantu programu Aktywny Rodzic.
- **Asystent AI**, obejmujący odpowiedzi na pytania w języku naturalnym na podstawie profilu, planu i katalogu świadczeń rodziny.

## 1.6 Poza zakresem

**Na tym etapie poza zakresem pozostaje składanie w module wniosków do gminy, MOPS i urzędu stanu cywilnego oraz odczyt ich statusu.** Te sprawy prowadzą inne instytucje, dlatego moduł prowadzi rodzica do Emp@tii i mObywatela, a status sprawy rodzic oznacza w planie sam.

**Poza zakresem pozostaje budowa nowych kreatorów wniosków o 800+, o świadczenia z programu Aktywny Rodzic i o Dobry Start 300+.** mZUS ma te kreatory, dlatego moduł prowadzi do nich rodzica w chwili, w której wniosek jest potrzebny.

**Poza zakresem pozostaje gromadzenie skanów i dokumentów.** Kierunek zmian w administracji to wymiana danych między urzędami, czego przykładem jest wniosek ZAM bez odpisu aktu urodzenia, dlatego moduł przechowuje wyłącznie dane potrzebne do wyliczenia planu, terminów i wniosków.

**Poza zakresem pozostają rodzice ubezpieczeni w KRUS, funkcjonariusze służb mundurowych, rodzice pracujący za granicą oraz rodzice adopcyjni i rodziny zastępcze.** Ich świadczenia podlegają odrębnym zasadom albo innym instytucjom i zostaną opisane odrębnie.

**Poza zakresem pozostają świadczenia i dopłaty ustanawiane przez poszczególne gminy, w tym gminne becikowe.** Katalog świadczeń obejmuje świadczenia i uprawnienia wynikające z przepisów obowiązujących w całym kraju.

**Poza zakresem pozostają porady medyczne i prowadzenie ciąży.** Moduł korzysta z daty objęcia opieką medyczną wyłącznie jako warunku świadczeń.

## 1.7 Główne założenia

**Zgodnie z założeniami produktowymi moduł opiera się na jednej ścieżce rodzica, parametryzowanej profilem rodziny i wspólnej dla wszystkich form zatrudnienia.** Plan, terminy, kalkulatory i kreatory wniosków korzystają z tych samych danych profilu i z tego samego katalogu świadczeń. Terminy liczymy od dwóch dat kotwiczących, od 10. tygodnia ciąży i od daty porodu, a do czasu porodu w miejscu daty porodu stoi przewidywany termin porodu. Plan obejmuje oboje rodziców i dla każdej sprawy wskazuje rodzica, którego dotyczy.

**Zgodnie z założeniami biznesowymi produkt jest bezpłatnym modułem aplikacji mZUS dla klientów indywidualnych, który uzupełnia poradnik ZUS.** Moduł rozszerza istniejące ekrany i kreatory mZUS i kieruje sprawy wymagające indywidualnej oceny do kanałów kontaktu ZUS.

**Zgodnie z założeniami technologicznymi moduł korzysta z logowania aplikacji mZUS, z danych konta ZUS, które mZUS pokazuje ubezpieczonemu, i z istniejących kreatorów mZUS.** Katalog świadczeń jest jedynym źródłem warunków, kwot, progów i reguł terminów dla planu, kalendarza, kalkulatorów, kreatorów i asystenta AI, więc aktualizacja kwoty albo terminu w katalogu zmienia jednocześnie wszystkie części modułu. Emp@tia, mObywatel i eZUS są zewnętrznymi kanałami, do których moduł przenosi rodzica. Na potrzeby demo moduł działa jako prototyp, w którym logowanie, dane konta ZUS i wysyłka wniosku do ZUS są symulowane na przykładowych rodzinach. Moduł działa w aplikacji mobilnej, dlatego każdy proces projektujemy na ekran telefonu.

**Zgodnie z założeniami prawnymi moduł opisuje świadczenia według stanu prawnego z listopada 2026 roku i przechowuje kwoty oraz progi z okresem ich obowiązywania.** Kreatory wniosków odzwierciedlają formularze ZAM i Z-15 obowiązujące od 24 października 2026 roku. Zmiany przepisów i formularzy są zewnętrznym warunkiem, do którego katalog świadczeń i kreatory są na bieżąco dostosowywane. Dane o ciąży, porodzie i stanie zdrowia dziecka są danymi dotyczącymi zdrowia w rozumieniu art. 9 RODO, dlatego moduł przetwarza je na podstawie wyraźnej zgody użytkownika. Jako moduł aplikacji podmiotu publicznego produkt spełnia wymagania ustawy o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych.

**Zgodnie z założeniami dotyczącymi użytkowników rodzic opisuje w module swoją sytuację życiową, a nazwy świadczeń i formularzy poznaje dopiero w planie rodziny.** Moduł pyta o fakty z życia rodziny, a decyzję, na przykład wybór wariantu zasiłku, zawsze podejmuje rodzic na podstawie pokazanych mu skutków.

## 1.8 Ryzyka

**Ryzyko prawne wynika ze zmienności przepisów, formularzy, kwot i progów dochodowych.** Kwota becikowego, progi dochodowe, limity programu Aktywny Rodzic i zasady przyznawania 800+ zmieniają się, a formularz ZAM zmienił się 24 października 2026 roku. Nieaktualna kwota, termin albo pole formularza prowadzi rodzica do błędnej decyzji, utraty pieniędzy albo wniosku do poprawy. Katalog świadczeń i kreatory wymagają przypisania każdej kwoty i każdego formularza do okresu obowiązywania oraz weryfikacji z serwisami zus.pl i gov.pl przed każdym wydaniem.

**Ryzyko związane z danymi wynika z przetwarzania danych dotyczących zdrowia.** Ciąża, wcześniactwo, hospitalizacja i ciężka choroba dziecka to dane szczególnej kategorii, a ich wyciek albo przetwarzanie bez ważnej podstawy narusza zaufanie do ZUS. Moduł zbiera wyłącznie dane, które zmieniają plan albo wniosek, i przetwarza je na podstawie wyraźnej zgody.

**Ryzyko integracyjne wynika z zależności modułu od danych i mechanizmów mZUS.** Wdrożenie wymaga dostępu modułu do danych konta ZUS, wysyłki wniosku ZAM tym samym kanałem co wnioski z eZUS oraz decyzji ZUS o włączeniu modułu do nowej wersji aplikacji, której termin jest planem. Gdy zasiłek wypłaca płatnik składek, wniosek trafia do płatnika razem z odpisem aktu urodzenia, a moduł przygotowuje go wyłącznie do przekazania. Status spraw poza ZUS zależy od oznaczenia przez rodzica, więc rodzic, który nie oznaczy sprawy jako załatwionej, dostaje kolejne przypomnienia.

**Ryzyko produktowe polega na rezygnacji użytkownika w trakcie profilu na start.** Zbyt wiele pytań przed pokazaniem planu zniechęca rodzica, zanim zobaczy wartość produktu. Profil na start zaczyna się więc od danych z konta ZUS do potwierdzenia, zawiera wyłącznie pytania, od których zależy plan, a o dane potrzebne później moduł pyta w chwili, gdy są potrzebne.

**Ryzyko związane z AI polega na tym, że asystent udzieli błędnej odpowiedzi w sprawie, od której zależą pieniądze rodziny.** Ryzyko wystąpi, jeśli asystent odpowiada spoza katalogu świadczeń i profilu rodziny albo nie ma wyznaczonych granic, po których przekazuje sprawę do ZUS. Asystent opiera każdą odpowiedź na katalogu i profilu, a w sprawach wymagających indywidualnej oceny kieruje rodzica do kanałów kontaktu ZUS.

**Ryzyko realizacyjne wynika z czasu hackatonu.** Zespół ma 24 godziny na zbudowanie rozwiązania, a jury kilka minut na jego ocenę, dlatego MVP obejmuje jedną kompletną ścieżkę rodzica, od profilu na start do wniosku ZAM, którą da się pokazać w demo trwającym do 2 minut.

## 1.9 KPI i mierniki sukcesu

**Odsetek spraw z planu załatwionych przed terminem jest głównym miernikiem produktu.** Bezpośrednio odzwierciedla wartość opisaną w podsekcji 1.3, czyli to, że rodzic nie przegapia terminów.

**Suma kwot, których rodzice nie stracili dzięki terminowemu złożeniu wniosku, mierzy wartość produktu w złotych.** Liczymy ją z kosztu spóźnienia przypisanego do terminów spraw załatwionych przed terminem.

**Odsetek wniosków o zasiłek macierzyński złożonych w kreatorze modułu w ciągu 21 dni od porodu mierzy skuteczność głównej funkcji.** Pokazuje, w jakim stopniu moduł przenosi wniosek ZAM do kanału mobilnego i chroni rodziców przed utratą wariantu 81,5%.

**Odsetek profili na start zatwierdzonych bez korekty danych z konta ZUS oraz czas wypełnienia profilu mierzą skuteczność personalizacji.** Sprawdzają, czy dane z mZUS skracają drogę rodzica do planu i czy rodzic dochodzi do planu, zanim zrezygnuje.

**Odsetek wniosków ZUS złożonych po przejściu z planu do kreatora modułu albo do istniejącego kreatora mZUS mierzy realizację celu biznesowego ZUS.** Pokazuje, w jakim stopniu moduł kieruje rodziców do składania wniosków elektronicznie.

**Odsetek decyzji o wariancie zasiłku macierzyńskiego podjętych w kalkulatorze w ciągu 21 dni od porodu mierzy skuteczność pomocy w decyzjach.** Sprawdza, czy rodzic podejmuje decyzję świadomie i przed upływem terminu.

**Odsetek planów rodziny z dołączonym drugim rodzicem mierzy udział drugiego rodzica w opiece.** Wspiera cel biznesowy dotyczący równego udziału rodziców.

**Retencja użytkowników w kolejnych etapach, od ciąży, przez pierwsze 3 miesiące po porodzie, po pierwsze urodziny dziecka, potwierdza, że plan towarzyszy rodzinie przez całą ścieżkę.** Pozwala odróżnić rodziców, którzy wracają do modułu przy kolejnych terminach, od osób, które jednorazowo sprawdziły swoje świadczenia.

**Odsetek pytań do asystenta AI rozwiązanych bez przekierowania do kanałów kontaktu ZUS mierzy dojrzałość warstwy konwersacyjnej i odciążenie ZUS.** Odsetek pytań przekierowanych pokazuje z kolei, które sprawy wymagają indywidualnej oceny.

## 1.10 MVP

**Minimalny zakres MVP pozwala przyszłej matce prowadzącej jednoosobową działalność gospodarczą przejść w mZUS ścieżkę od profilu na start uzupełnionego danymi z konta ZUS, przez plan i kalendarz terminów z kosztem spóźnienia, po pakiet narodzin i wniosek ZAM złożony w kreatorze modułu.**

**Priorytet zerowy, stanowiący rdzeń demo, obejmuje:**

- logowanie mechanizmem mZUS i zgodę na przetwarzanie danych dotyczących zdrowia,
- odczyt statusu ubezpieczenia, podstaw składek i członków rodziny zgłoszonych do ubezpieczenia zdrowotnego z konta ZUS,
- profil na start z danymi z konta ZUS do potwierdzenia oraz ze stanem cywilnym, gminą, dochodem na osobę, przewidywanym terminem porodu, ciążą mnogą i formą zatrudnienia drugiego rodzica,
- katalog świadczeń, uprawnień i obowiązków z etapów od ciąży do powrotu do pracy, z kwotami i regułami terminów,
- plan rodzica ułożony według etapów, ze statusem każdej sprawy,
- kalendarz terminów liczonych od 10. tygodnia ciąży i od daty porodu, z terminami powtarzalnymi i kosztem spóźnienia,
- pakiet narodzin, w którym dziecko zgłoszone do ubezpieczenia zdrowotnego uruchamia przeliczenie planu i propozycję wniosku ZAM oraz wniosku o 800+,
- kreator wniosku o zasiłek macierzyński ZAM dla rodzica, któremu zasiłek wypłaca ZUS,
- przewodnik po formalnościach z przejściem do istniejącego kreatora mZUS, Emp@tii i mObywatela oraz z instrukcją dla spraw u pracodawcy,
- przypomnienia o terminach.

**Priorytet pierwszy, budujący przewagę rozwiązania w ocenie jury, obejmuje:**

- odczyt statusu wniosków złożonych w ZUS i aktualizację statusu spraw w planie,
- kalkulator wariantu zasiłku macierzyńskiego, 81,5% albo 100% i 70%, liczony z podstaw składek z konta ZUS,
- kreator rezygnacji matki z części zasiłku i wniosku ojca o zasiłek,
- kalkulator podziału urlopu rodzicielskiego między rodziców,
- kalkulator wariantu programu Aktywny Rodzic,
- dołączenie drugiego rodzica do planu rodziny,
- asystenta AI odpowiadającego na pytania na podstawie planu rodziny.

**Poza MVP, jako kolejne etapy rozwoju po wdrożeniu przez ZUS, pozostają kreator wniosku o zasiłek opiekuńczy Z-15, kreator zgłoszenia dziecka do ubezpieczenia zdrowotnego i kreator zgłoszenia do dobrowolnego ubezpieczenia chorobowego dla rodzica prowadzącego jednoosobową działalność gospodarczą, świadczenia gminne, a także ścieżki dla rodziców ubezpieczonych w KRUS, służb mundurowych, rodziców pracujących za granicą, rodziców adopcyjnych i rodzin zastępczych.**

## 1.11 Wymagania niefunkcjonalne

**Interfejs spełnia wymagania ustawy o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych na poziomie WCAG 2.1 AA.** Moduł jest przeznaczony do wdrożenia w aplikacji mZUS, za której dostępność odpowiada ZUS jako podmiot publiczny.

**Treści modułu są napisane prostym językiem.** Każda sprawa w planie ma tytuł zrozumiały bez znajomości nazwy świadczenia ani formularza, a każda instrukcja w przewodniku po formalnościach zawiera najwyżej 5 kroków.

**Profil na start zajmuje użytkownikowi nie więcej niż 3 minuty, a wniosek ZAM w kreatorze nie więcej niż 5 minut.** Plan rodziny i kalendarz terminów są widoczne w czasie do 2 sekund od zapisania profilu albo od potwierdzenia daty porodu.

**Dane dotyczące zdrowia moduł przetwarza wyłącznie po wyraźnej zgodzie użytkownika, przesyła w postaci zaszyfrowanej i przechowuje w infrastrukturze ZUS.** Użytkownik usuwa dane rodziny jednym działaniem w module, a moduł usuwa je w ciągu 30 dni od żądania. Dane konta ZUS moduł wyłącznie odczytuje, a ich źródłem pozostają systemy ZUS.

**Przypomnienie o terminie dociera do użytkownika z wyprzedzeniem wybranym w ustawieniach, a pierwsze przypomnienie o każdym terminie nie później niż 7 dni przed jego upływem.** Wyjątkiem są terminy krótsze niż 7 dni od zdarzenia, takie jak zgłoszenie dziecka do ubezpieczenia zdrowotnego, o których moduł przypomina w dniu potwierdzenia daty porodu.
