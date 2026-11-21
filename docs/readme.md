# Dokumentacja projektu Zasiłkowy Przewodnik Przyszłego Rodzica

Folder zawiera dokumentację projektu Zasiłkowy Przewodnik Przyszłego Rodzica z kampanii „Przewodnik przyszłej mamy”, prowadzoną według wzoru opisanego w [docs_blueprint.md](docs_blueprint.md). Ten plik opisuje wyłącznie sposób organizacji folderu, nie zasady tworzenia treści poszczególnych stron.

## Struktura folderów

Folder ma trzy foldery sekcji, ponumerowane tak samo jak sekcje we wzorze, oraz folder materiałów źródłowych.

- `01-opis-produktu`
- `02-model-systemu`
- `03-user-stories`
- `materialy-zrodlowe`

Sekcje, które we wzorze są jedną stroną dla całego projektu, Opis produktu oraz Model systemu, mają jeden plik bezpośrednio w swoim folderze: `01-opis-produktu/opis-produktu.md` i `02-model-systemu/model-systemu.md`.

W sekcji trzeciej folder najwyższego poziomu odpowiada Epikowi i nosi dwucyfrowy numer porządkowy, który wyznacza kolejność realizacji Epików, a po nim numer i nazwę Epika z kolumny Epiki w podsekcji 2.1 Modelu systemu. Folder drugiego poziomu odpowiada funkcji, a strony Story leżą w folderze funkcji, na przykład:

- `03-user-stories/07-3.7.1-kalendarz-terminow/3.7.1.1-wyliczanie-terminow/3.7.1.1.1-wyliczenie-terminow-od-dat-z-profilu.md`

Folder `03-user-stories` zawiera bezpośrednio także tablicę `tablica-komunikatow.md` z ID, nazwą sytuacji, typem, kodem HTTP i treścią każdego komunikatu, do którego odwołują się historyjki.

Folder `materialy-zrodlowe` zawiera treść zadania hackatonowego, research prawny w wersji PDF i w wersji tekstowej `prawa-i-obowiazki-rodzica.md` oraz research funkcji aplikacji mZUS `mzus-co-jest-i-czego-brakuje.md`. Pełną specyfikację wyzwania ZUS „Zasiłkowy Przewodnik Przyszłego Rodzica”, plik `wymagania-zus-zasilkowy-przewodnik.pdf`, zespół przechowuje w tym folderze lokalnie i dodaje do repozytorium po zgodzie właściciela merytorycznego. Specyfikacja jest źródłem nadrzędnym dla zakresu produktu i reguł świadczeń. Dokumenty z przykładowych spraw ZUS zespół przechowuje wyłącznie lokalnie, poza repozytorium.

## Gałęzie

Gałąź `main` zawiera aktualną, kompletną wersję dokumentacji.

Nową gałąź tworzymy pod konkretną zmianę, na przykład nowy Epik, nowe Story albo edycję istniejącej strony, i scalamy ją do `main` po przeglądzie. Gałęzie nie żyją dłużej niż trwa praca nad daną zmianą.
