# 2. Model systemu

## Metadata

| Pole | Wartość |
| --- | --- |
| Wykonawca | Ryszard Kacperski |
| Właściciel merytoryczny | Ryszard Kacperski |
| Status | do przeglądu |
| Wersja | 0.3.0 |
| Data ostatniej aktualizacji |  |

**Dokument opisuje moduł Przewodnik przyszłej mamy w aplikacji mZUS na poziomie modelu systemowego: z jakich elementów się składa, jak te elementy są ze sobą powiązane i z istniejącymi mechanizmami mZUS, jakie grupy danych przepływają między nimi, kto za nie odpowiada, jakie role mają konta i jakie zależności trzeba uwzględnić w kolejności budowy poszczególnych obszarów.**

## 2.1 Elementy systemu

| Nr | Grupa | Element systemu | Opis | Epiki |
| --- | --- | --- | --- | --- |
| 1 | Zarządzanie użytkownikiem | Konto i uwierzytelnianie | Logowanie użytkownika mechanizmem aplikacji mZUS, tożsamość użytkownika potrzebna do odczytu danych z konta ZUS oraz zgody na przetwarzanie danych dotyczących zdrowia. | 3.1.1 Logowanie i zgody |
| 2 | Zarządzanie użytkownikiem | Ustawienia i powiadomienia | Preferencje kanałów i wyprzedzenia przypomnień, dane kontaktowe użytkownika, doręczanie przypomnień i komunikatów tworzonych przez pozostałe elementy systemu oraz eksport terminów do kalendarza urządzenia. | 3.2.1 Przypomnienia o terminach |
| 3 | Rodzina i dane ZUS | Profil rodziny | Operuje danymi matki i drugiego rodzica, danymi ciąży i dziecka oraz dostępem kont do rodziny, uzupełnianymi danymi z konta ZUS i odpowiedziami rodzica. | 3.3.1 Profil na start, 3.3.2 Pakiet narodzin, 3.3.3 Dołączenie drugiego rodzica |
| 4 | Rodzina i dane ZUS | Odczyt danych ZUS | Odczyt danych, które mZUS pokazuje zalogowanemu ubezpieczonemu: statusu ubezpieczenia, podstaw składek, członków rodziny zgłoszonych do ubezpieczenia zdrowotnego, zasiłków z ostatnich 6 miesięcy i statusu wniosków złożonych w ZUS. | 3.4.1 Dane z konta ZUS w profilu rodziny, 3.4.2 Status wniosków ZUS w planie rodziny |
| 5 | Świadczenia i terminy | Katalog świadczeń | Świadczenia, uprawnienia i obowiązki rodzica wraz z warunkami, kwotami, progami dochodowymi, instytucjami, kanałami, regułami terminów i instrukcjami, prowadzone przez administratora. | 3.5.1 Prowadzenie katalogu świadczeń |
| 6 | Świadczenia i terminy | Plan rodzica | Osobista lista świadczeń, uprawnień i obowiązków rodziny, ułożona według etapów, ze statusem i wybranym wariantem każdej sprawy. | 3.6.1 Plan świadczeń rodziny |
| 7 | Świadczenia i terminy | Kalendarz terminów | Terminy spraw z planu rodziny liczone od 10. tygodnia ciąży, od daty porodu i od wieku dziecka, terminy powtarzalne oraz koszt spóźnienia. | 3.7.1 Kalendarz terminów |
| 8 | Świadczenia i terminy | Przewodnik po formalnościach | Instrukcja załatwienia sprawy z planu rodziny i przejście do właściwego kanału: kreatora modułu, istniejącego kreatora mZUS, eZUS, Emp@tii albo mObywatela, a dla spraw u pracodawcy instrukcja wniosku. | 3.8.1 Instrukcje i przejścia do kanałów |
| 9 | Wnioski | Kreatory wniosków | Mobilne kreatory wniosków ZUS, których brakuje w mZUS, dla rodzica ubezpieczonego z innego tytułu niż umowa o pracę, uzupełniane danymi z konta ZUS i z profilu rodziny, wraz z wysyłką wniosku do ZUS albo przygotowaniem go dla płatnika składek. | 3.9.1 Wniosek o zasiłek macierzyński ZAM, 3.9.2 Rezygnacja matki i wniosek ojca o zasiłek, 3.9.3 Wniosek o zasiłek opiekuńczy Z-15, 3.9.4 Zgłoszenie dziecka do ubezpieczenia zdrowotnego, 3.9.5 Zgłoszenie do dobrowolnego ubezpieczenia chorobowego |
| 10 | Decyzje | Kalkulatory decyzji | Porównanie wariantów zasiłku macierzyńskiego, podział urlopu rodzicielskiego między rodziców i wybór wariantu programu Aktywny Rodzic, liczone z podstaw składek z konta ZUS, z zapisem decyzji w planie rodziny. | 3.10.1 Wariant zasiłku macierzyńskiego, 3.10.2 Podział urlopu rodzicielskiego, 3.10.3 Wariant programu Aktywny Rodzic |
| 11 | AI | Asystent AI | Warstwa konwersacyjna odpowiadająca na pytania rodzica na podstawie tych samych danych i reguł co pozostałe elementy systemu. | 3.11.1 Asystent w czacie |

## 2.2 Relacje

**Element *Konto i uwierzytelnianie* jest punktem wejścia do modułu i korzysta z logowania aplikacji mZUS.** Udostępnia pozostałym elementom tożsamość zalogowanego ubezpieczonego, na podstawie której *Odczyt danych ZUS* odczytuje dane jego konta, i zapisuje zgodę na przetwarzanie danych dotyczących zdrowia, która warunkuje zapisanie danych ciąży i dziecka w *Profilu rodziny*.

**Element *Odczyt danych ZUS* odczytuje dane, które mZUS pokazuje zalogowanemu ubezpieczonemu, i udostępnia je *Profilowi rodziny*, *Planowi rodzica*, *Kreatorom wniosków* i *Kalkulatorom decyzji*.** Status ubezpieczenia wskazuje tytuły ubezpieczenia, z których *Profil rodziny* proponuje formę zatrudnienia i opłacanie dobrowolnego ubezpieczenia chorobowego. Podstawy składek są podstawą wyliczeń w *Kalkulatorach decyzji*, a członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego wskazują dzieci. Płatnika zasiłku ustala *Profil rodziny*. Dla rodzica prowadzącego jednoosobową działalność gospodarczą zasiłek wypłaca ZUS. Dla pracownika i zleceniobiorcy *Profil rodziny* proponuje płatnika na podstawie zasiłków z ostatnich 6 miesięcy, jeżeli są w Danych z konta ZUS, a w przeciwnym razie pyta rodzica, czy płatnik zgłasza do ubezpieczenia chorobowego więcej niż 20 osób. Wynik *Profil rodziny* zapisuje w Danych rodziny jako płatnika zasiłku ze źródłem danej. Status wniosków złożonych w ZUS przez mZUS, eZUS, bankowość elektroniczną albo Emp@tię, z planowym terminem załatwienia sprawy, aktualizuje status spraw w *Planie rodzica*. Zasiłki z ostatnich 6 miesięcy oraz świadczenia rodzinne z kwotą i planowanym terminem wypłaty *Odczyt danych ZUS* przekazuje do *Planu rodzica*, który pokazuje przy sprawach ZUS ostatnią i planowaną wypłatę. Informacja o opłacaniu składek na dobrowolne ubezpieczenie chorobowe zasila strażnika ubezpieczenia chorobowego w *Planie rodzica*. Dane drugiego rodzica moduł odczytuje wyłącznie z jego konta, po dołączeniu do rodziny.

**Od *Profilu rodziny* zależą wszystkie elementy grup Świadczenia i terminy, Wnioski i Decyzje oraz *Asystent AI*.** Profil powstaje w profilu na start, w którym rodzic potwierdza dane z konta ZUS i podaje stan cywilny, gminę, dochód na osobę w rodzinie, przewidywany termin porodu, ciążę mnogą oraz formę zatrudnienia i ubezpieczenie chorobowe drugiego rodzica. *Plan rodzica* odczytuje z profilu dane, od których zależą warunki świadczeń, *Kalendarz terminów* daty kotwiczące, *Kreatory wniosków* dane rodzica i dziecka do wniosku, *Kalkulatory decyzji* formę zatrudnienia i daty urlopów, a *Asystent AI* cały profil jako kontekst odpowiedzi.

**Pakiet narodzin w *Profilu rodziny* uruchamia się po zapisaniu daty porodu przez rodzica albo wtedy, gdy *Odczyt danych ZUS* wskaże nowe dziecko wśród członków rodziny zgłoszonych do ubezpieczenia zdrowotnego.** *Profil rodziny* proponuje rodzicowi potwierdzenie daty porodu i danych dziecka, a po potwierdzeniu *Plan rodzica* i *Kalendarz terminów* przeliczają sprawy i terminy. Propozycja zależy od formy zatrudnienia rodzica. *Przewodnik po formalnościach* podsuwa każdemu rodzicowi wniosek o 800+ w istniejącym kreatorze mZUS, rodzicowi, który składa wniosek ZAM, kreator wniosku ZAM w *Kreatorach wniosków*, a pracownikowi instrukcję wniosku o urlop do pracodawcy z terminem 21 dni. Dla rodzica, który sam zgłasza dziecko do ubezpieczenia zdrowotnego, w szczególności prowadzącego jednoosobową działalność gospodarczą, pakiet uruchamia się po zapisaniu daty porodu przez rodzica, a pojawienie się dziecka w Danych z konta ZUS potwierdza dane dziecka. Rodzic podaje datę porodu sam także wtedy, gdy chce zobaczyć terminy, zanim dziecko pojawi się w danych ZUS.

**Każda zmiana w *Profilu rodziny* wyzwala ponowne wyliczenie *Planu rodzica* i *Kalendarza terminów*.** Zmianą jest w szczególności potwierdzenie daty porodu, zmiana formy zatrudnienia rodzica, zgłoszenie do dobrowolnego ubezpieczenia chorobowego i uznanie ojcostwa. Sprawy oznaczone jako złożone albo załatwione zachowują swój status po przeliczeniu.

**Element *Katalog świadczeń* jest jedynym źródłem warunków, kwot, progów, reguł terminów i instrukcji.** *Plan rodzica* odczytuje z niego warunki przysługiwania spraw, *Kalendarz terminów* reguły terminów i kwoty potrzebne do wyliczenia kosztu spóźnienia, *Przewodnik po formalnościach* instytucje, kanały i instrukcje, *Kreatory wniosków* rodzaje urlopów i ich wymiar, *Kalkulatory decyzji* stawki zasiłku i warianty świadczeń, a *Asystent AI* całą zawartość katalogu. Kwoty i progi mają okres obowiązywania, a pozostałe elementy stosują wartość obowiązującą w dniu, którego dotyczy termin albo świadczenie.

**Element *Plan rodzica* wylicza listę spraw rodziny z *Profilu rodziny* i *Katalogu świadczeń*.** Każda sprawa w planie wskazuje pozycję katalogu, etap ścieżki, rodzica, którego dotyczy, status i wybrany wariant. Plan jest wejściem dla *Kalendarza terminów*, *Przewodnika po formalnościach*, *Kreatorów wniosków* i *Kalkulatorów decyzji*. W etapie ciąży *Plan rodzica* prowadzi dla rodzica prowadzącego jednoosobową działalność gospodarczą sprawy i ostrzeżenia strażnika ubezpieczenia chorobowego na podstawie Danych z konta ZUS: aktywność dobrowolnego ubezpieczenia chorobowego, opłacanie składek na to ubezpieczenie w terminie i podwyższenie podstawy wymiaru składek tuż przed porodem. Saldo płatnika jest dziś widoczne w aplikacji mZUS dla Płatnika, dlatego do czasu integracji rodzic potwierdza opłacanie składek sam, a *Profil rodziny* zapisuje to potwierdzenie w Danych rodziny ze źródłem danej.

**Element *Kalendarz terminów* wylicza termin każdej sprawy z *Planu rodzica* z reguły terminu zapisanej w *Katalogu świadczeń* i z daty kotwiczącej zapisanej w *Profilu rodziny*.** Datami kotwiczącymi są 10. tydzień ciąży wyliczany z przewidywanego terminu porodu, data porodu, którą do czasu porodu zastępuje przewidywany termin porodu, oraz wiek dziecka. Kalendarz prowadzi także terminy powtarzalne, takie jak coroczny wniosek o 800+ na kolejny okres świadczeniowy. Dla każdego terminu kalendarz wylicza koszt spóźnienia z kwot katalogu i przekazuje przypomnienia do *Ustawień i powiadomień*, z wyłączeniem spraw oznaczonych jako złożone albo załatwione.

**Element *Przewodnik po formalnościach* prowadzi rodzica od sprawy z *Planu rodzica* do właściwego kanału.** Sprawę, dla której moduł ma kreator, prowadzi do *Kreatorów wniosków*. Wnioski o 800+, o świadczenia z programu Aktywny Rodzic i o Dobry Start 300+ prowadzi do istniejących kreatorów mZUS, sprawy ZUS bez kreatora w module do eZUS, sprawy gminy i MOPS do Emp@tii, a zgłoszenie urodzenia do mObywatela. Dla spraw u pracodawcy albo zleceniodawcy, takich jak wniosek o urlop, pokazuje instrukcję z terminem z *Kalendarza terminów*. Po powrocie z kanału poza ZUS rodzic oznacza sprawę jako załatwioną, a *Przewodnik po formalnościach* zapisuje ten status przez operacje *Planu rodzica*.

**Element *Kreatory wniosków* prowadzi rodzica przez wnioski ZUS, których brakuje w mZUS, i uzupełnia je danymi z *Odczytu danych ZUS* i z *Profilu rodziny*.** Kreator wniosku o zasiłek macierzyński prowadzi przez wybór rodzaju urlopu, czyli urlopu macierzyńskiego, urlopu na warunkach urlopu macierzyńskiego, urlopu rodzicielskiego, uzupełniającego urlopu macierzyńskiego albo urlopu ojcowskiego, i przez część formularza ZAM dotyczącą tego urlopu. Wniosek ZAM składa osoba ubezpieczona z innego tytułu niż umowa o pracę, dlatego kreator obsługuje matkę prowadzącą jednoosobową działalność gospodarczą, matkę wykonującą umowę zlecenia, ojca prowadzącego jednoosobową działalność gospodarczą albo wykonującego umowę zlecenia, który składa wniosek o zasiłek za okres urlopu ojcowskiego i za swoją część urlopu rodzicielskiego, oraz ojca, który przejmuje zasiłek po rezygnacji matki po co najmniej 14 tygodniach od porodu. W kolejnym etapie kreator obsługuje także kobietę, której ubezpieczenie ustało w czasie ciąży z powodu likwidacji albo upadłości pracodawcy. Kreator odczytuje płatnika zasiłku z Danych rodziny. Gdy zasiłek wypłaca ZUS, kreator wysyła wniosek do ZUS bez skróconego odpisu aktu urodzenia, z danymi dziecka i rodzica, na podstawie których ZUS pobiera akt sam. Gdy zasiłek wypłaca płatnik składek, na przykład zleceniodawca zgłaszający do ubezpieczenia chorobowego więcej niż 20 osób, kreator przygotowuje wniosek do przekazania płatnikowi i informuje, że wymaga on skróconego odpisu aktu urodzenia. Pracownik wnioskuje o urlop u pracodawcy, dlatego jego sprawę obsługuje *Przewodnik po formalnościach*. Zgłoszenie dziecka do ubezpieczenia zdrowotnego i zgłoszenie do dobrowolnego ubezpieczenia chorobowego kreatory obsługują dla rodzica prowadzącego jednoosobową działalność gospodarczą, który zgłasza je jako płatnik składek za siebie. Złożony wniosek kreator zapisuje w grupie danych Wnioski i oznacza sprawę w *Planie rodzica* jako złożoną przez jego operacje, a dalszy status sprawy *Odczyt danych ZUS* odczytuje z mZUS.

**Element *Kalkulatory decyzji* liczy skutki wyboru na podstawie *Profilu rodziny*, *Katalogu świadczeń* i podstaw składek z *Odczytu danych ZUS*.** Gdy konto ZUS nie zawiera podstaw składek potrzebnych do wyliczenia, rodzic podaje podstawę wymiaru zasiłku sam. Podstawę wymiaru zasiłku kalkulator wylicza z podstaw składek pomniejszonych o 13,71%, a zasiłek macierzyński wylicza w kwocie nie niższej niż kwota świadczenia rodzicielskiego z *Katalogu świadczeń*, obecnie 1000 zł miesięcznie. Kalkulator wariantu zasiłku pokazuje rozkład wypłat w obu wariantach oraz skutek wcześniejszego powrotu do pracy przy wariancie 81,5%, czyli utratę różnicy między 100% a 81,5% zasiłku za okres urlopu macierzyńskiego. Wybrany wariant kalkulator zapisuje przez operacje *Planu rodzica*, *Kalendarz terminów* dostosowuje do niego terminy, a *Kreatory wniosków* wypełniają nim wniosek ZAM, na przykład wniosek o zasiłek za okres urlopu rodzicielskiego w wariancie 81,5% złożony w ciągu 21 dni od porodu.

**Element *Ustawienia i powiadomienia* doręcza użytkownikowi przypomnienia i komunikaty, które tworzą pozostałe elementy systemu.** Zasilają go w szczególności *Kalendarz terminów* przypomnieniami o terminach, *Profil rodziny* propozycją pakietu narodzin i zaproszeniem drugiego rodzica, a *Odczyt danych ZUS* zmianą statusu wniosku. *Ustawienia i powiadomienia* doręcza je kanałami i z wyprzedzeniem zapisanymi w preferencjach, a przypomnienie o sprawie drugiego rodzica kieruje do jego konta.

**Element *Asystent AI* jest warstwą nałożoną na pozostałe elementy i korzysta wyłącznie z ich danych i reguł.** Odczytuje *Profil rodziny*, *Plan rodzica*, *Kalendarz terminów*, *Katalog świadczeń* i Wnioski, a zmianę, na przykład oznaczenie sprawy jako załatwionej albo rozpoczęcie wniosku w kreatorze, po zatwierdzeniu przez rodzica deleguje do operacji właściwego elementu. Pytanie spoza katalogu świadczeń i sprawy wymagające indywidualnej oceny asystent kieruje do wiadomości do Centrum Kontaktu Klientów ZUS, do e-wizyty albo do skrzynki mama@zus.pl. Błąd albo luka w katalogu świadczeń przenosi się natychmiast na jakość odpowiedzi asystenta.

**Dane konta użytkownika należą do modułu *Konto i uwierzytelnianie*, a Ustawienia i Powiadomienia do modułu *Ustawienia i powiadomienia*.** Zgoda na przetwarzanie danych dotyczących zdrowia jest częścią Danych konta użytkownika. Pozostałe elementy systemu tworzą przypomnienia i komunikaty przez operacje *Ustawień i powiadomień*, a moduł prowadzi ich doręczenie oraz status odczytu.

**Dane z konta ZUS należą do systemów ZUS, a moduł *Odczyt danych ZUS* jest właścicielem wyłącznie ich odczytu.** Moduł przechowuje odczytane dane z datą odczytu i odświeża je przy każdym otwarciu modułu, a pozostałe elementy korzystają z nich przez *Odczyt danych ZUS*.

**Dane rodziny oraz Dane ciąży i dziecka należą do modułu *Profil rodziny*, który jako jedyny je zmienia.** Dostęp kont do rodziny i rola konta w rodzinie są częścią Danych rodziny. Dla każdej danej profil zapisuje jej źródło, czyli konto ZUS albo odpowiedź rodzica. Dane ciąży i dziecka są danymi dotyczącymi zdrowia, dlatego *Profil rodziny* zapisuje je wyłącznie dla konta ze zgodą zapisaną w Danych konta użytkownika.

**Katalog świadczeń należy do modułu *Katalog świadczeń*, który zmienia go wyłącznie na polecenie konta z rolą Administrator.** Pozostałe moduły wyłącznie odczytują katalog.

**Pozycje planu należą do modułu *Plan rodzica*.** *Odczyt danych ZUS*, *Przewodnik po formalnościach*, *Kreatory wniosków*, *Kalkulatory decyzji* i *Asystent AI* zmieniają status i wybrany wariant sprawy wyłącznie przez operacje *Planu rodzica*.

**Terminy należą do modułu *Kalendarz terminów*.** Moduł przelicza je po każdej zmianie Danych rodziny, Danych ciąży i dziecka, Pozycji planu albo Katalogu świadczeń.

**Wnioski należą do modułu *Kreatory wniosków*.** Moduł przechowuje treść złożonego albo przygotowanego wniosku, jego adresata i potwierdzenie złożenia, a status rozpatrzenia wniosku pochodzi z Danych z konta ZUS.

**Wyniki kalkulacji należą do modułu *Kalkulatory decyzji*.** Decyzja rodzica przechodzi do Pozycji planu, a dane wejściowe i wynik kalkulacji pozostają w module jako podstawa decyzji.

**Interakcje asystenta AI są własnością modułu *Asystent AI* wyłącznie jako log rozmowy i ślad audytowy.** Dane, które powstają w wyniku działania asystenta, zapisuje właściwy moduł docelowy po zatwierdzeniu przez rodzica.

**Katalog świadczeń musi zawierać świadczenia, uprawnienia i obowiązki z warunkami, kwotami i regułami terminów, zanim *Plan rodzica* zostanie wyliczony po raz pierwszy.** Na potrzeby demo katalog wypełniamy stanem prawnym z listopada 2026 roku.

**Logowanie mZUS i odczyt danych z konta ZUS muszą zakończyć się przed profilem na start.** Dopiero wtedy *Profil rodziny* proponuje rodzicowi dane z konta ZUS do potwierdzenia. Na potrzeby demo dane z konta ZUS pochodzą z przykładowych rodzin przygotowanych przez zespół.

**Profil na start musi zakończyć się jako pierwszy proces rodzica w module.** Dopiero wtedy *Profil rodziny* zawiera dane wymagane przez *Plan rodzica*, *Kalendarz terminów*, *Przewodnik po formalnościach*, *Kreatory wniosków*, *Kalkulatory decyzji* i *Asystenta AI*.

**Zgoda na przetwarzanie danych dotyczących zdrowia musi zostać zapisana, zanim *Profil rodziny* zapisze Dane ciąży i dziecka.** Bez tej zgody moduł wylicza plan wyłącznie z Danych rodziny i oznacza sprawy zależne od danych ciąży jako wymagające uzupełnienia profilu.

**Plan rodzica musi zostać wyliczony, zanim *Kalendarz terminów* wyliczy terminy, a *Przewodnik po formalnościach*, *Kreatory wniosków* i *Kalkulatory decyzji* pokażą sprawy rodziny.** Przypomnienia o terminach wymagają ponadto preferencji zapisanych w *Ustawieniach i powiadomieniach*, a do ich zapisania moduł stosuje preferencje domyślne.

**W MVP kreator wniosku ZAM obsługuje wniosek po porodzie i wymaga potwierdzonej daty porodu i danych dziecka w *Profilu rodziny*.** O zasiłek macierzyński można wystąpić także przed porodem, a przed przewidywaną datą porodu może przypadać nie więcej niż 6 tygodni zasiłku. Wniosek przed porodem pozostaje poza MVP. Dane dziecka są potrzebne ZUS do pobrania aktu urodzenia.

## 2.3 Grupy danych

| Nr | Grupa danych | Zawartość |
| --- | --- | --- |
| 1 | Dane konta użytkownika | Identyfikator użytkownika mZUS, historia sesji w module, zgody na przetwarzanie danych wraz z wersją treści zgody oraz datą i godziną jej udzielenia. |
| 2 | Ustawienia | Kanały przypomnień, wyprzedzenie przypomnienia o terminie, dane kontaktowe używane do komunikacji z użytkownikiem. |
| 3 | Powiadomienia | Przypomnienia i komunikaty kierowane do użytkownika, wraz z elementem systemu, który je utworzył, terminem, kanałem doręczenia oraz statusem doręczenia i odczytu. |
| 4 | Dane z konta ZUS | Status ubezpieczenia z tytułami ubezpieczenia, podstawy składek, członkowie rodziny zgłoszeni do ubezpieczenia zdrowotnego, zasiłki z ostatnich 6 miesięcy z datą i kwotą wypłaty, świadczenia rodzinne z kwotą i planowanym terminem wypłaty, wnioski złożone w ZUS ze statusem i planowym terminem załatwienia sprawy, informacja o opłacaniu składek na dobrowolne ubezpieczenie chorobowe, data odczytu. |
| 5 | Dane rodziny | Dane matki i drugiego rodzica: forma zatrudnienia, opłacanie dobrowolnego ubezpieczenia chorobowego, potwierdzenie opłacania składek na to ubezpieczenie w terminie, płatnik zasiłku, stan cywilny, uznanie ojcostwa, gmina zamieszkania, dochód na osobę w rodzinie, wraz ze źródłem każdej danej. Dostęp kont do rodziny i rola konta w rodzinie. |
| 6 | Dane ciąży i dziecka | Przewidywany termin porodu, data objęcia opieką lekarza albo położnej, ciąża mnoga, data porodu, imię, nazwisko, numer PESEL i miejsce urodzenia dziecka, liczba urodzonych dzieci, tydzień ciąży w dniu porodu, masa urodzeniowa, hospitalizacja dziecka po porodzie, ciężkie i nieodwracalne upośledzenie albo nieuleczalna choroba dziecka. |
| 7 | Katalog świadczeń | Świadczenia, uprawnienia i obowiązki rodzica wraz z etapem ścieżki, warunkami przysługiwania, instytucją, kanałem złożenia wniosku, regułą terminu, kwotą i progiem dochodowym z okresem obowiązywania oraz instrukcją załatwienia sprawy. |
| 8 | Pozycje planu | Sprawy przypisane rodzinie, z pozycją katalogu, etapem, rodzicem, którego dotyczą, statusem, czyli do zrobienia, złożona, załatwiona albo wymagająca uzupełnienia profilu, źródłem statusu oraz wybranym wariantem. |
| 9 | Terminy | Termin każdej sprawy z planu, data kotwicząca, od której go wyliczono, terminy powtarzalne, koszt spóźnienia oraz data ostatniego wyliczenia. |
| 10 | Wnioski | Wnioski złożone albo przygotowane w kreatorach: rodzaj wniosku, rodzaj urlopu i wypełniona część formularza, dane rodzica i dziecka, adresat, czyli ZUS albo płatnik składek, data i potwierdzenie złożenia. |
| 11 | Wyniki kalkulacji | Dane wejściowe, w tym podstawa wymiaru zasiłku z konta ZUS albo podana przez rodzica, oraz wynik porównania wariantu zasiłku macierzyńskiego, podziału urlopu rodzicielskiego i wariantu programu Aktywny Rodzic, wraz z decyzją rodzica. |
| 12 | Interakcje asystenta AI | Treść rozmów, wynik klasyfikacji intencji, ślad audytowy zatwierdzeń użytkownika. |

## 2.4 Role

| Rola | Opis | Nadanie roli |
| --- | --- | --- |
| Nowy użytkownik | Konto mZUS bez Profilu rodziny. Ma dostęp do profilu na start, do Odczytu danych ZUS w zakresie własnego konta oraz do Ustawień i powiadomień. | Pierwsze otwarcie modułu przez użytkownika zalogowanego w mZUS. |
| Rodzic | Konto mZUS, które utworzyło Profil rodziny. Ma dostęp do wszystkich elementów systemu w zakresie swojej rodziny, zmienia dane rodziny oraz dane ciąży i dziecka, składa wnioski w kreatorach i zaprasza drugiego rodzica. | Zapisanie profilu na start przez konto z rolą Nowy użytkownik. |
| Drugi rodzic | Konto mZUS dołączone do Profilu rodziny zaproszeniem. Ma dostęp do Planu rodzica, Kalendarza terminów, Przewodnika po formalnościach, Kreatorów wniosków w zakresie własnych wniosków, Kalkulatorów decyzji i Asystenta AI w zakresie rodziny oraz zmienia własne dane w Profilu rodziny. | Przyjęcie zaproszenia od konta z rolą Rodzic. |
| Administrator | Konto pracownika ZUS, które prowadzi Katalog świadczeń, w tym kwoty, progi dochodowe, reguły terminów i instrukcje. Ma dostęp wyłącznie do Katalogu świadczeń. | Nadanie roli przez konto z rolą Administrator albo przez zespół przy uruchomieniu modułu. |

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
        SZUS[Systemy ZUS<br/>dane konta i wnioski]
        MZUS[Istniejące kreatory mZUS<br/>800+, Aktywny Rodzic, 300+]
        EZUS[eZUS]
        EMP[Emp@tia]
        MOB[mObywatel]
        PRAC[Pracodawca<br/>albo zleceniodawca]
    end

    KONTO -->|Dane konta użytkownika| ODCZ
    KONTO -->|Dane konta użytkownika| PR
    SZUS -->|Dane z konta ZUS| ODCZ
    ODCZ -->|Dane z konta ZUS| PLAN
    ODCZ -->|Dane z konta ZUS| KALK
    PR -->|Dane rodziny,<br/>Dane ciąży i dziecka| PLAN
    PR -->|Dane ciąży i dziecka| KAL
    PR -->|Dane rodziny,<br/>Dane ciąży i dziecka| KRE
    PR -->|Dane rodziny| KALK
    KAT -->|Katalog świadczeń| KALK
    KALK -->|Wyniki kalkulacji| PLAN
    KALK -->|Wyniki kalkulacji| KRE
    PRZ -->|wniosek w module| KRE
    KRE -->|Pozycje planu| PLAN
    KRE -->|Wnioski| SZUS
    KRE -->|Wnioski| PRAC
    PRZ -->|przejście| MZUS
    PRZ -->|przejście| EZUS
    PRZ -->|przejście| EMP
    PRZ -->|przejście| MOB
    PRZ -->|instrukcja| PRAC
    KAL -->|Powiadomienia| UST
    PR -->|Powiadomienia| UST

    AI -. odczyt .-> ROD
    AI -. odczyt i zapis przez<br/>te same operacje .-> SIT
    AI -. rozpoczęcie wniosku .-> KRE

    class KONTO,UST user
    class ODCZ,PR source
    class KAT,PLAN,KAL,PRZ core
    class KRE,KALK output
    class AI support
    class SZUS,MZUS,EZUS,EMP,MOB,PRAC external
```
