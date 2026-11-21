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
- pozwala jurorowi wgrać dokument z przykładowej sprawy ZUS albo wybrać sprawę wzorcową, sprawdzić weryfikację ubezpieczenia chorobowego i porównać wyliczenie kalkulatora z rozstrzygnięciem sprawy;
- odpowiada na pytania rodzica w asystencie AI na podstawie planu rodziny.

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
| [`web/`](web/) | Aplikacja webowa w Next.js 16 z App Routerem, React 19, Tailwind CSS 4 i TypeScriptem. Plik `web/src/teksty.ts` zawiera wszystkie teksty interfejsu, w tym komunikaty z tablicy komunikatów. |
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

Aplikację uruchamiasz w folderze `web/` przez pnpm:

```bash
cd web
pnpm install
pnpm dev
```

Serwer deweloperski działa pod adresem http://localhost:3000. Pozostałe polecenia:

- `pnpm build` buduje wersję produkcyjną, a `pnpm start` ją uruchamia;
- `pnpm lint` sprawdza kod;
- `pnpm typecheck` sprawdza typy.

## Praca z dokumentacją

Każdą stronę dokumentacji zespół tworzy według wzoru z [`docs/docs_blueprint.md`](docs/docs_blueprint.md), a nazwy elementów systemu, Epików, grup danych i ról przejmuje dosłownie z Modelu systemu. Gałąź `main` zawiera aktualną dokumentację. Każdą zmianę, na przykład nowy Epik, nowe Story albo edycję strony, zespół prowadzi na osobnej gałęzi i scala do `main` po przeglądzie.

## Materiały ZUS i dane osobowe

Dokumenty z przykładowych spraw ZUS są przeznaczone wyłącznie na użytek HackNation i zespół przechowuje je lokalnie, poza repozytorium. Specyfikację wyzwania ZUS zespół również przechowuje lokalnie. Sprawy wzorcowe, przykładowe konta i przykłady w User Stories zawierają dane wymyślone przez zespół, a dane osobowe odczytane z dokumentów wgranych przez jurora aplikacja zastępuje danymi losowymi.

## Zastosowanie AI

Zespół tworzy dokumentację i kod aplikacji razem z agentem AI Claude Code, który pracuje według zasad z plików `CLAUDE.md`. W samej aplikacji sztuczna inteligencja działa w asystencie AI, który odpowiada na pytania rodzica na podstawie planu rodziny, oraz w odczycie danych z dokumentów wgranych do przykładowych spraw ZUS.
