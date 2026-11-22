# Zasiłkowy Przewodnik Przyszłego Rodzica

Repozytorium zawiera projekt zespołu na hackaton HackNation 2026, przygotowany w odpowiedzi na wyzwanie Zakładu Ubezpieczeń Społecznych „Zasiłkowy Przewodnik Przyszłego Rodzica” z kampanii „Przewodnik przyszłej mamy”. Projekt składa się z dokumentacji produktu, czyli Opisu produktu, Modelu systemu i User Stories, oraz z aplikacji webowej, którą zespół buduje na podstawie tej dokumentacji razem z agentem AI.

## Produkt

Zasiłkowy Przewodnik Przyszłego Rodzica to responsywna aplikacja webowa ZUS dla osób planujących rodzicielstwo, kobiet w ciąży, rodziców małych dzieci, rodziców adopcyjnych i rodzin zastępczych niezawodowych. Rodzic loguje się przez mObywatela, loginem i hasłem eZUS albo kodem z aplikacji mZUS, a aplikacja odczytuje dane z jego konta ubezpieczonego w ZUS i pyta wyłącznie o dane, których konto nie zawiera.

Na podstawie formy zatrudnienia każdego z rodziców, ubezpieczenia chorobowego i sytuacji rodziny aplikacja:

- układa plan spraw rodziny według etapów ścieżki: ciąża, pierwsze tygodnie po porodzie, urlopy i zasiłek macierzyński, świadczenia pieniężne na dziecko oraz powrót do pracy;
- pokazuje świadczenia z ubezpieczenia chorobowego w ciąży, a przy braku prawa podaje jego przyczynę;
- prowadzi kalendarz terminów liczonych od 10. tygodnia ciąży i od daty porodu, z kwotą, którą rodzic traci po terminie, oraz przypomina o terminach e-mailem i SMS-em;
- prowadzi rodzica przez kreator wniosku o zasiłek macierzyński ZAM przed porodem i po porodzie oraz przez kreatory pozostałych wniosków;
- liczy okres i wysokość zasiłku macierzyńskiego dla obojga rodziców w zintegrowanym kalkulatorze, porównuje warianty 81,5% oraz 100% i 70% i pomaga podzielić urlop rodzicielski;
- przeprowadza rodzica przez sprawy gminy, MOPS, urzędu stanu cywilnego, pracodawcy i NFZ instrukcją i przejściem do eZUS, Emp@tii i mObywatela;
- pozwala jurorowi wybrać sprawę wzorcową albo wgrać dokumenty przykładowe, sprawdzić weryfikację ubezpieczenia chorobowego i porównać wyliczenie świadczeń z rozstrzygnięciem sprawy;
- odpowiada na pytania rodzica w asystencie AI na podstawie planu rodziny;
- daje Administratorowi panel katalogu świadczeń z kwotami, progami, wymiarami urlopów, pozycjami planu i słownikiem dokumentów.

Pełny zakres, wartość, ryzyka, KPI i zakres MVP opisuje [Opis produktu](docs/01-opis-produktu/opis-produktu.md).

## Zawartość repozytorium

| Ścieżka | Zawartość |
| --- | --- |
| [`docs/01-opis-produktu/opis-produktu.md`](docs/01-opis-produktu/opis-produktu.md) | Opis produktu: problem, użytkownik, wartość, cel biznesowy, zakres, założenia, ryzyka, KPI, MVP i wymagania niefunkcjonalne. |
| [`docs/02-model-systemu/model-systemu.md`](docs/02-model-systemu/model-systemu.md) | Model systemu: grupy i elementy systemu z Epikami, relacje, grupy danych, role i diagram w Mermaid. |
| [`docs/03-user-stories/`](docs/03-user-stories/) | 102 User Stories w 29 Epikach, ułożone w foldery Epików i funkcji według kolejności realizacji. |
| [`docs/03-user-stories/tablica-komunikatow.md`](docs/03-user-stories/tablica-komunikatow.md) | Tablica kodów komunikatów do użytkownika, do których odwołują się historyjki. |
| [`docs/docs_blueprint.md`](docs/docs_blueprint.md) | Wzór struktury i formatu każdej strony dokumentacji. |
| [`docs/readme.md`](docs/readme.md) | Organizacja folderów dokumentacji i zasady prowadzenia gałęzi. |
| [`docs/materialy-zrodlowe/`](docs/materialy-zrodlowe/) | Treść zadania hackatonowego, research praw i obowiązków rodzica w PDF i w wersji tekstowej oraz research funkcji aplikacji mZUS. |
| [`web/`](web/) | Aplikacja webowa w Next.js 16 z App Routerem, React 19, Tailwind CSS 4 i TypeScriptem. Budowę kodu, zmienne środowiskowe i strukturę folderów opisuje [`web/README.md`](web/README.md). |
| [`CLAUDE.md`](CLAUDE.md), [`web/CLAUDE.md`](web/CLAUDE.md) | Rola, tryb pracy, reguły dowodowe i styl dla agenta AI, który tworzy dokumentację i kod aplikacji. |
| [`.claude/skills/`](.claude/skills/), [`skills-lock.json`](skills-lock.json) | Skille agenta AI dla Next.js, Reacta, Tailwinda, LangChain i LangGraph z przypiętymi źródłami i commitami. |

## Model systemu

Model systemu dzieli aplikację na 11 elementów systemu w sześciu grupach. Każdy element realizuje jeden albo kilka Epików.

| Grupa | Element systemu | Przykładowe Epiki |
| --- | --- | --- |
| Zarządzanie użytkownikiem | Konto i uwierzytelnianie | 3.1.1 Logowanie i zgody |
| Zarządzanie użytkownikiem | Ustawienia i powiadomienia | 3.2.1 Przypomnienia o terminach |
| Rodzina i dane ZUS | Profil rodziny | 3.3.1 Profil na start, 3.3.2 Pakiet narodzin, 3.3.3 Dołączenie drugiego rodzica |
| Rodzina i dane ZUS | Odczyt danych ZUS | 3.4.1 Dane z konta ZUS w profilu rodziny, 3.4.3 Przykładowe sprawy ZUS |
| Świadczenia i terminy | Katalog świadczeń | 3.5.1 Prowadzenie katalogu świadczeń, 3.5.2 Świadczenia w ciąży i dokumenty wniosków |
| Świadczenia i terminy | Plan rodzica | 3.6.1 Plan świadczeń rodziny |
| Świadczenia i terminy | Kalendarz terminów | 3.7.1 Kalendarz terminów |
| Świadczenia i terminy | Przewodnik po formalnościach | 3.8.1 Instrukcje i przejścia do kanałów, 3.8.2 Pytanie do ZUS przez PUE/eZUS |
| Wnioski | Kreatory wniosków | 3.9.1 Wniosek o zasiłek macierzyński ZAM, 3.9.6 Wnioski o urlopy do pracodawcy, 3.9.9 Wniosek o zasiłek chorobowy ZAS-53 |
| Decyzje | Kalkulatory decyzji | 3.10.1 Wariant zasiłku macierzyńskiego, 3.10.4 Zintegrowany kalkulator zasiłku macierzyńskiego |
| AI | Asystent AI | 3.11.1 Asystent w czacie |

Aplikacja rozróżnia role Nowy użytkownik, Rodzic, Drugi rodzic i Administrator. Pełną listę Epików, relacje między elementami i diagram zawiera [Model systemu](docs/02-model-systemu/model-systemu.md).

## Uruchomienie aplikacji

Aplikacja wymaga Node.js w wersji 20.9 albo nowszej i pnpm 12. Plik `web/package.json` przypina pnpm 12.21.0 w polu `packageManager`, więc Corepack uruchamia właściwą wersję. Uruchom aplikację w folderze `web/`:

```bash
cd web
pnpm install
cp .env.example .env.local
pnpm dev
```

Serwer deweloperski działa pod adresem http://localhost:3000. Plik `web/.env.local` zostaje poza repozytorium. Uzupełnij w nim zmienne według potrzeb:

| Zmienna | Znaczenie |
| --- | --- |
| `MODEL_DOSTAWCA` | Dostawca modelu językowego asystenta AI i odczytu dokumentów: `deepseek` albo `anthropic`. Puste pole oznacza `deepseek`. |
| `DEEPSEEK_API_KEY` | Klucz API DeepSeek. Bez klucza asystent pokazuje komunikat 0071, a odczyt dokumentów przykładowych korzysta z fikstur odczytu. |
| `DEEPSEEK_MODEL` | Model DeepSeek, domyślnie `deepseek-flash`. Obrazy i pliki PDF czyta zawsze `deepseek-flash`. |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Klucz i model Claude, opcjonalne. Serwer używa ich wyłącznie przy `MODEL_DOSTAWCA=anthropic`. |
| `KATALOG_DANE_KATALOG` | Folder, w którym usługa `/api/katalog` zapisuje plik `katalog.json` z edycjami Administratora. Puste pole oznacza `web/.dane/`. |
| `PANEL_TOKEN` | Token zapisu katalogu dla systemów i skryptów w nagłówku `Authorization: Bearer <token>`. Puste pole wyłącza zapis tokenem. |
| `KATALOG_TRYB_DEMO` | Wartość `nie` wyłącza zapis katalogu z przeglądarki kontem Administrator ZUS w trybie demonstracyjnym. |
| `PRZYKLADOWE_SPRAWY_ZUS_KATALOG` | Lokalny folder z plikami JSON zestawów spraw ZUS. Puste pole daje pustą listę zestawów. |
| `NEXT_PUBLIC_ADRES_LOGOWANIA_*`, `NEXT_PUBLIC_ADRES_KANALU_*` | Adresy produkcyjne logowania przez mObywatela, eZUS i mZUS oraz kanałów zewnętrznych. Next.js wpisuje je w kod przeglądarki przy `pnpm build`. Puste pole prowadzi do makiety logowania albo do symulowanego serwisu. |

Pozostałe polecenia w folderze `web/`:

- `pnpm build` buduje wersję produkcyjną, a `pnpm start` ją uruchamia;
- `pnpm lint` sprawdza kod regułami ESLint;
- `pnpm typecheck` generuje typy tras i sprawdza typy;
- `pnpm test` uruchamia testy automatyczne z folderu `web/testy/` wbudowanym modułem `node:test`: wyliczenia kalkulatora zasiłku na przykładach z kwotami, wpływ zmian Katalogu świadczeń na wyliczenia, sprawy wzorcowe S01 do S11 i usługi REST.

Workflow `.github/workflows/ci.yml` uruchamia `pnpm lint`, `pnpm typecheck`, `pnpm test` i `pnpm build` przy każdym wypchnięciu na gałęzie `main` i `aplikacja-web` oraz przy każdym pull requeście.

## Wejście do demo

Aplikacja działa w trybie demonstracyjnym z makietami logowania i symulowanym ZUS. Wejdź do demo tak:

1. Otwórz http://localhost:3000. Ekran startowy pokazuje logowanie loginem i hasłem eZUS oraz przyciski logowania przez mObywatela i kodem z aplikacji mZUS. Każdy sposób to makieta: wpisz dowolny login i hasło albo potwierdź logowanie przyciskiem symulacji. Nie wpisuj prawdziwych danych logowania.
2. Wybierz konto na ekranie `/demo/wybor-konta`. Lista zawiera dziewięć kont przykładowych rodziców ze zmyślonymi danymi z ZUS i konto Administrator ZUS. Każde konto rodzica pokazuje inną sytuację:
   - Anna Nowak: jednoosobowa działalność gospodarcza z dobrowolnym ubezpieczeniem chorobowym;
   - Magdalena Wójcik i Tomasz Nowak: umowa o pracę;
   - Karolina Lis: umowa zlecenia z dobrowolnym ubezpieczeniem chorobowym;
   - Joanna Mazur: jednoosobowa działalność gospodarcza bez dobrowolnego ubezpieczenia chorobowego;
   - Ewa Kamińska: umowa o pracę, która ustała w ciąży;
   - Paulina Wrona: jednoosobowa działalność gospodarcza rozpoczęta w ciąży;
   - Piotr Wójcik i Marcin Lis: drugi rodzic, który dołącza do planu rodziny Magdaleny Wójcik albo Karoliny Lis.
3. Przyciskiem „Symuluj stworzenie profilu” przy koncie utwórz profil rodziny z przykładowymi danymi i od razu otwórz plan rodziny na etapie Ciąża. Przycisk „Zaloguj się” otwiera konto w jego bieżącym stanie, a konto bez profilu rodziny zaczyna od profilu na start. Przycisk „Przywróć stan początkowy” usuwa dane konta. Przyciskiem „Załóż nowe konto” utworzysz konto bez danych w ZUS.
4. Zaloguj się kontem Administrator ZUS, żeby otworzyć panel katalogu świadczeń `/panel/katalog`. Administrator zmienia kwoty, progi, wymiary urlopów, pozycje planu, reguły terminów, słownik dokumentów i podmioty wsparcia. Zmiany trafiają do usługi `/api/katalog`, więc widzą je wszyscy użytkownicy aplikacji.
5. Otwórz `/demo/ustawienia`, żeby ustawić datę demonstracyjną, parametry systemu i symulacje błędów, na przykład niedostępność danych z konta ZUS, stanu rozliczeń, PUE/eZUS albo wysyłki wniosku. Sekcja „Scenariusze demonstracyjne” wczytuje stan konta z kryteriów akceptacji historyjek, na przykład plan przed porodem, zadłużenie składkowe, wyczerpany okres zasiłkowy, ustanie umowy o pracę w ciąży albo bliźnięta w danych ZUS. Skrzynka `/demo/skrzynka` pokazuje wiadomości e-mail i SMS wysłane w trybie demonstracyjnym.
6. Bez logowania otwórz z ekranu startowego kalkulator zasiłku macierzyńskiego albo przykładowe sprawy ZUS. Tryb gościa zapisuje wynik w danych gościa w tej przeglądarce.

### Przykładowe sprawy i dokumenty przykładowe

Ekran „Przykładowe sprawy” `/przykladowe-sprawy` pokazuje sprawy wzorcowe zespołu S01 do S11 i dokumenty przykładowe. Wybierz sprawę wzorcową albo pobierz archiwum „Pobierz dokumenty przykładowe” z folderu `web/public/przyklady/` i wgraj z niego pliki: wnioski ZAM i ZAS-12, zaświadczenia Z-3 i Z-3a, zaświadczenia e-ZLA, poświadczenie i zrzuty rozstrzygnięć. Aplikacja odczytuje dokument, zastępuje dane osobowe danymi losowymi, weryfikuje ubezpieczenie chorobowe, liczy zasiłek macierzyński, zasiłek w wysokości zasiłku macierzyńskiego i zasiłek chorobowy oraz porównuje wynik z rozstrzygnięciem sprawy. Dokumenty przykładowe i sprawy wzorcowe zawierają dane zmyślone przez zespół, a skrypt `web/skrypty/generuj-dokumenty-przykladowe.mjs` generuje je ponownie.

## REST API

Logika biznesowa przewodnika działa na serwerze jako REST API w wersji 1 pod adresem `/api/v1`. Trasy w `web/src/app/api/v1/` wywołują te same czyste funkcje domeny z `web/src/domena/` co aplikacja i czytają katalog świadczeń z magazynu serwera, więc systemy ZUS i inne aplikacje dostają te same wyniki co rodzic w przewodniku.

| Metoda i ścieżka | Zakres |
| --- | --- |
| `POST /api/v1/kalkulator/zasilek-macierzynski` | Zintegrowany kalkulator zasiłku macierzyńskiego: okresy, stawki, harmonogram wypłat i sumy dla obojga rodziców. |
| `POST /api/v1/kalkulator/wariant` | Porównanie wariantu 81,5% z wariantem 100% i 70%. |
| `POST /api/v1/kalkulator/podzial-urlopu` | Podział urlopu rodzicielskiego między rodziców. |
| `POST /api/v1/plan` | Plan świadczeń rodziny z kalendarzem terminów. |
| `POST /api/v1/swiadczenia-w-ciazy` | Prawo do zasiłku chorobowego, świadczenia rehabilitacyjnego, zasiłku w wysokości zasiłku macierzyńskiego i zasiłku macierzyńskiego w ciąży. |
| `POST /api/v1/przykladowe-sprawy/weryfikacja` | Weryfikacja ubezpieczenia chorobowego przykładowej sprawy, wyliczenia świadczeń i porównanie z rozstrzygnięciem. |
| `GET /api/v1/zus/konto` | Dane z konta ZUS symulowanego konta o PESEL z nagłówka `X-Pesel`. |
| `GET /api/v1/zus/konto/stan-rozliczen` | Stan rozliczeń składek na wskazany dzień. |
| `GET /api/v1/zus/konto/e-zla` | Zaświadczenia e-ZLA, wyłącznie ze zgodą na dane dotyczące zdrowia. |
| `POST /api/v1/zus/zaswiadczenia-o-niezaleganiu` | Zaświadczenie o niezaleganiu albo o wysokości zadłużenia. |
| `POST /api/v1/zus/wnioski` | Wysyłka wniosków ZAM, ZAS-53 i Z-15 z numerem potwierdzenia. |
| `POST /api/v1/zus/pytania` | Pytanie do ZUS przez PUE/eZUS. |
| `POST /api/v1/walidacje/{rodzaj}` | Walidacje pól formularzy i danych wejściowych. |
| `GET /api/v1/openapi.json` | Opis API w formacie OpenAPI 3.1. |

Listę punktów końcowych z przykładami żądań i odpowiedzi pokazuje strona http://localhost:3000/api-docs, a pełny opis w formacie OpenAPI 3.1 zwraca `GET /api/v1/openapi.json`. Daty mają format `RRRR-MM-DD`, kwoty są w groszach, a błąd ma postać `{ kod, pola, parametry }` z kodem z [tablicy komunikatów](docs/03-user-stories/tablica-komunikatow.md) i statusem HTTP z tej tablicy. Czas wyliczenia ustawiają pola `dzis`, `dataDemo` albo `teraz`, a bez nich serwer liczy od bieżącej daty w strefie Europe/Warsaw. Klient API dla przeglądarki leży w `web/src/dane/api/klient.ts`.

Aplikacja ma też usługi poza wersją 1: `POST /api/asystent` dla asystenta AI, `POST /api/odczyt-dokumentu` dla odczytu dokumentów przykładowych spraw, `GET`, `POST` i `PUT /api/katalog` dla wspólnego katalogu świadczeń oraz `GET /api/przykladowe-sprawy/zestawy` dla lokalnych zestawów spraw ZUS.

### Przeglądarka i REST API

Ekrany z wyliczeniami wysyłają żądania do REST API i pokazują odpowiedź serwera:

- wynik zintegrowanego kalkulatora zasiłku macierzyńskiego oraz podglądy w arkuszach podziału urlopów, łączenia urlopu z pracą i zmiany daty powrotu liczy `POST /api/v1/kalkulator/zasilek-macierzynski`;
- kalkulator wariantu zasiłku liczy `POST /api/v1/kalkulator/wariant`, a kalkulator podziału urlopu rodzicielskiego `POST /api/v1/kalkulator/podzial-urlopu`;
- ekran świadczeń w ciąży i sekcja prawa do świadczeń na stronie sprawy korzystają z `POST /api/v1/swiadczenia-w-ciazy`;
- zatwierdzenie danych przykładowej sprawy, wyliczenia na ekranie weryfikacji i porównanie z rozstrzygnięciem w kalkulatorze korzystają z `POST /api/v1/przykladowe-sprawy/weryfikacja`.

Podstawę wymiaru z konta ZUS przeglądarka przekazuje jako podstawy składek tytułu ubezpieczenia, a serwer liczy z nich podstawę tą samą funkcją domeny. Hook `web/src/dane/api/wyliczenie.ts` wysyła żądanie po każdej zmianie danych, przerywa poprzednie żądanie i na czas przeliczania zostawia na ekranie poprzedni wynik. Błąd sieci, przekroczenie 15 sekund i awaria wyliczenia dają komunikat 0335 z przyciskiem „Spróbuj ponownie”, a błąd danych pokazuje komunikat z kodem z tablicy komunikatów.

Plan rodziny i kalendarz terminów przeglądarka przelicza na miejscu funkcją `przeliczRodzine` tymi samymi funkcjami domeny `wyliczPlan` i `wyliczTerminy`, z których korzysta `POST /api/v1/plan`. Przeliczenie wykonuje się w tej samej operacji zapisu co zmiana profilu, wniosku albo danych ZUS, bo kolejne kroki operacji, przypomnienia i ekran po zapisie korzystają od razu z nowego planu. Punkt końcowy `POST /api/v1/plan` udostępnia to samo wyliczenie systemom ZUS i innym aplikacjom.

Serwer pełni w demo rolę systemu ZUS. Przeglądarka pobiera dane źródłowe konta przez `GET /api/v1/zus/konto?postac=zrodlowe` z numerem PESEL w nagłówku `X-Pesel`, więc numer nie trafia do adresu, logów serwera ani historii przeglądarki, a zaświadczenie o niezaleganiu, wnioski ZAM, ZAS-53 i Z-15 oraz pytania do ZUS wysyła żądaniami POST. Serwer nie zapisuje stanu symulacji, więc przeglądarka trzyma w localStorage to, co API zwróciło, razem z nadpisaniami scenariuszy demo, i nakłada te dane na dane konta przy każdym odczycie. Przełączniki symulacji z ustawień demo przeglądarka przekazuje w nagłówku `X-Symulacje`.

## Funkcje oparte na AI

Aplikacja korzysta z modelu językowego przez LangChain i LangGraph. Dostawcę wybiera zmienna `MODEL_DOSTAWCA`: domyślnie DeepSeek, a opcjonalnie Claude od Anthropic. Klucze czyta wyłącznie kod serwera.

- Asystent AI odpowiada na pytania rodzica na podstawie planu rodziny. Graf LangGraph w `web/src/serwer/asystent/` klasyfikuje pytanie, zbiera fakty z planu deterministycznie, formułuje odpowiedź modelem i sprawdza ją przed wysłaniem. Pytanie spoza zakresu przewodnika dostaje komunikat 0070 z przejściem do właściwego kanału, a niedostępny model komunikat 0071.
- Odczyt dokumentów przykładowych spraw w `web/src/serwer/odczyt-dokumentow/` rozpoznaje rodzaj dokumentu, odczytuje pola i zastępuje dane osobowe danymi losowymi. Przeglądarka dostaje wyłącznie dane zastępcze i klucz powiązania, czyli skrót SHA-256 odczytanego numeru PESEL albo imienia i nazwiska, a serwer nie zapisuje pliku. Odczyt trwa najwyżej 30 sekund. Dokument przykładowy z `web/public/przyklady/` bez klucza modelu, po błędzie modelu albo po przekroczeniu czasu dostaje wynik z fikstur odczytu.

Zespół tworzy dokumentację i kod aplikacji razem z agentem AI Claude Code, który pracuje według zasad z plików `CLAUDE.md`.

## Wdrożenie

Wdrażaj aplikację jako aplikację Next.js z serwerem, bo strony, REST API, asystent AI i odczyt dokumentów działają w funkcjach serwerowych Next.js.

- Na serwerze Node.js zainstaluj zależności w folderze `web/`, ustaw zmienne środowiskowe i uruchom `pnpm build && pnpm start`. Serwer nasłuchuje na porcie 3000, a zmienna `PORT` zmienia port.
- Na Vercel ustaw folder `web` jako katalog główny projektu (Root Directory), a zmienne środowiskowe dodaj w ustawieniach projektu. Vercel rozpoznaje Next.js i pnpm i buduje aplikację poleceniem `pnpm build`.

Ustaw w środowisku produkcyjnym klucz wybranego dostawcy modelu, `MODEL_DOSTAWCA`, `PANEL_TOKEN` dla systemów zapisujących katalog i `KATALOG_TRYB_DEMO=nie`, gdy zapis katalogu ma działać wyłącznie tokenem. Adresy produkcyjne logowania i kanałów zewnętrznych ustaw w zmiennych `NEXT_PUBLIC_ADRES_*` przed `pnpm build`. Edycje katalogu serwer zapisuje w pliku `katalog.json` w folderze `KATALOG_DANE_KATALOG`; wskaż w nim trwały dysk serwera. Na platformie z dyskiem tylko do odczytu, na przykład w funkcjach Vercel, edycje katalogu zostają w pamięci instancji do jej restartu.

## Ograniczenia trybu demonstracyjnego

- Logowanie przez mObywatela, eZUS i mZUS to makiety. Aplikacja przyjmuje dowolny login i hasło i loguje wybranym kontem przykładowym.
- Dane z konta ZUS, stan rozliczeń składek, zaświadczenia e-ZLA, wysyłka wniosków i odpowiedzi ZUS pochodzą z symulowanego ZUS z danymi zmyślonymi przez zespół. Numery potwierdzeń wniosków mają przedrostek demonstracyjny, na przykład `ZAM-DEMO`, a wnioski trafiają wyłącznie do symulacji.
- Profil rodziny, plan, wnioski, wyniki kalkulacji i ustawienia demo przeglądarka zapisuje w localStorage. Dane zostają w tej przeglądarce i znikają po wyczyszczeniu danych witryny. Na serwerze zostają wyłącznie edycje katalogu świadczeń.
- Zapis katalogu w trybie demonstracyjnym potwierdza rolę Administrator nagłówkiem sesji konta demonstracyjnego, a REST API w wersji 1 działa bez uwierzytelniania. W środowisku produkcyjnym zastąp oba sposoby autoryzacją mZUS.
- Przejścia do Emp@tii, mObywatela, eZUS i serwisów instytucji prowadzą do ekranów symulacji kanałów albo do publicznych stron instytucji.
- Asystent AI i odczyt dowolnego dokumentu wymagają klucza modelu. Odczyt pliku PDF przez DeepSeek korzysta z odpłatnego Files API.
- Data demonstracyjna z `/demo/ustawienia` zmienia dzień, od którego aplikacja liczy terminy, plan i wyliczenia, także w żądaniach do REST API.

## Praca z dokumentacją

Każdą stronę dokumentacji zespół tworzy według wzoru z [`docs/docs_blueprint.md`](docs/docs_blueprint.md), a nazwy elementów systemu, Epików, grup danych i ról przejmuje dosłownie z Modelu systemu. Gałąź `main` zawiera aktualną dokumentację. Każdą zmianę, na przykład nowy Epik, nowe Story albo edycję strony, zespół prowadzi na osobnej gałęzi i scala do `main` po przeglądzie.

## Materiały ZUS i dane osobowe

Dokumenty z przykładowych spraw ZUS są przeznaczone wyłącznie na użytek HackNation i zespół przechowuje je lokalnie, poza repozytorium. Zmienna `PRZYKLADOWE_SPRAWY_ZUS_KATALOG` wskazuje lokalny folder z tymi sprawami, a repozytorium zawiera wyłącznie sprawy wzorcowe i dokumenty przykładowe zespołu. Specyfikację wyzwania ZUS zespół również przechowuje lokalnie. Sprawy wzorcowe, dokumenty przykładowe, przykładowe konta i przykłady w User Stories zawierają dane wymyślone przez zespół, a dane osobowe odczytane z dokumentów wgranych przez jurora aplikacja zastępuje danymi losowymi.
