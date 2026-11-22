# Aplikacja web przewodnika

Folder `web/` zawiera aplikację „Zasiłkowy Przewodnik Przyszłego Rodzica” w Next.js 16 z App Routerem i Cache Components, React 19, Tailwind CSS 4 i TypeScriptem. Opis produktu, wejście do demo, listę punktów końcowych REST API i ograniczenia trybu demonstracyjnego zawiera [README repozytorium](../README.md), a zasady pisania kodu [`CLAUDE.md`](CLAUDE.md).

## Uruchomienie

Aplikacja wymaga Node.js w wersji 20.9 albo nowszej i pnpm 12.21.0 z pola `packageManager` w `package.json`. Uruchom ją w tym folderze:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Serwer deweloperski działa pod adresem http://localhost:3000. Polecenia:

- `pnpm dev` uruchamia serwer deweloperski;
- `pnpm build` buduje wersję produkcyjną, a `pnpm start` ją uruchamia;
- `pnpm lint` sprawdza kod regułami ESLint;
- `pnpm typecheck` generuje typy tras poleceniem `next typegen` i sprawdza typy poleceniem `tsc --noEmit`;
- `pnpm test` uruchamia testy automatyczne z folderu `testy/` modułem `node:test`, bez serwera Next.js.

## Zmienne środowiskowe

Plik `.env.example` opisuje każdą zmienną, a kopia `.env.local` zostaje poza repozytorium. Zmienne czyta wyłącznie kod serwera z `src/serwer/` i `src/app/api/`.

| Zmienna | Znaczenie |
| --- | --- |
| `MODEL_DOSTAWCA` | `deepseek` albo `anthropic`; puste pole oznacza `deepseek`. |
| `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL` | Klucz i model DeepSeek, domyślnie `deepseek-flash`. |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Klucz i model Claude przy `MODEL_DOSTAWCA=anthropic`. |
| `KATALOG_DANE_KATALOG` | Folder pliku `katalog.json` z edycjami Administratora, domyślnie `.dane/` w tym folderze. |
| `PANEL_TOKEN` | Token zapisu katalogu w nagłówku `Authorization: Bearer <token>`. |
| `KATALOG_TRYB_DEMO` | Wartość `nie` wyłącza zapis katalogu nagłówkiem sesji konta Administrator ZUS. |
| `PRZYKLADOWE_SPRAWY_ZUS_KATALOG` | Lokalny folder z plikami JSON zestawów spraw ZUS dla `GET /api/przykladowe-sprawy/zestawy`. |

Bez klucza modelu asystent AI pokazuje komunikat 0071, a odczyt dokumentu przykładowego z `public/przyklady/` zwraca wynik z fikstur odczytu.

## Struktura kodu

| Ścieżka | Zawartość |
| --- | --- |
| `src/app/(publiczne)/` | Ekran startowy, makiety logowania i ekrany trybu demonstracyjnego `/demo/*`. |
| `src/app/(strefa)/` | Ekrany po zalogowaniu i w trybie gościa: profil, plan rodziny, sprawy, terminy, wnioski, kalkulatory, przykładowe sprawy i panel katalogu. |
| `src/app/(symulacje)/` | Symulowany eZUS i ekrany kanałów zewnętrznych. |
| `src/app/api/v1/` | REST API w wersji 1. |
| `src/app/api/` | Usługi asystenta AI, odczytu dokumentów, wspólnego katalogu świadczeń i zestawów spraw ZUS. |
| `src/app/api-docs/` | Strona z dokumentacją REST API. |
| `src/domena/` | Czyste funkcje domeny: kalkulatory, plan, terminy, zasiłki, wnioski, przykładowe sprawy i typy. Każda funkcja dostaje dzisiejszą datę w argumencie. |
| `src/dane/katalog/` | Wartości startowe katalogu świadczeń: kwoty, wymiary, pozycje planu, słownik dokumentów i podmioty wsparcia. |
| `src/dane/magazyn/` | Magazyn przeglądarki w localStorage z operacjami zapisu, hookami i synchronizacją katalogu z serwerem. |
| `src/dane/api/` | Klient REST API `klient.ts` i hook wyliczeń `wyliczenie.ts`. |
| `src/dane/konta-zus/`, `src/dane/konta-demo.ts`, `src/dane/scenariusze/` | Dane symulowanego ZUS, konta przykładowe i scenariusze trybu demonstracyjnego. |
| `src/serwer/` | Kod wyłącznie serwerowy: moduł REST API, asystent AI, odczyt dokumentów, magazyn katalogu i fabryka modelu. |
| `src/komponenty/` | Komponenty interfejsu i rama aplikacji z mapą tras. |
| `src/teksty.ts` | Wszystkie teksty interfejsu, w tym komunikaty z tablicy komunikatów. |
| `public/przyklady/` | Dokumenty przykładowe do przykładowych spraw i ich archiwum ZIP. |
| `skrypty/` | Skrypt `generuj-dokumenty-przykladowe.mjs`, który generuje dokumenty przykładowe. |
| `testy/` | Testy automatyczne `*.test.ts` dla `node:test` z loaderem `loader.mjs`, który rozwiązuje alias `@/` i transpiluje TypeScript kompilatorem z zależności deweloperskich. |

## REST API w aplikacji

Trasy `src/app/api/v1/**/route.ts` czytają żądanie modułami `src/serwer/api/`, wołają funkcje domeny z katalogiem świadczeń serwera i zwracają odpowiedź albo błąd `{ kod, pola, parametry }`. Rejestr `src/serwer/api/endpointy.ts` opisuje każdy punkt końcowy, a z niego powstaje opis OpenAPI w `GET /api/v1/openapi.json` i strona `/api-docs`. Status HTTP błędu pochodzi z kolumny Kod HTTP tablicy komunikatów i leży w `src/serwer/api/statusy-http.ts`.

Numer PESEL nie trafia do adresu żądania, bo adresy zapisują logi serwera i historia przeglądarki. Żądania GET konta ZUS, czyli `GET /api/v1/zus/konto`, `GET /api/v1/zus/konto/stan-rozliczen` i `GET /api/v1/zus/konto/e-zla`, przekazują PESEL w nagłówku `X-Pesel`, który czyta funkcja `peselZNaglowka` z `src/serwer/api/konta-zus.ts`. Brak nagłówka daje błąd 400 z kodem 0024, a błędny PESEL błąd 400 z kodem 0025 albo 0026. Żądania POST przekazują PESEL w treści.

Przeglądarka pobiera wspólny katalog świadczeń z `GET /api/katalog` raz przy otwarciu aplikacji, potem najwyżej co 60 s, gdy karta jest widoczna, po powrocie do karty i po odzyskaniu sieci. Odpowiedź na zapis zmiany w panelu niesie aktualne edycje katalogu, a zmiany zapisane bez sieci czekają w kolejce `zmianyKataloguDoWyslania`. Zasady pobierania opisuje funkcja `czyPobracKatalog` z `src/dane/magazyn/katalog-serwer.ts`.

Widok woła REST API funkcją z `src/dane/api/klient.ts` przez hook `useWyliczenieApi` z `src/dane/api/wyliczenie.ts`:

```ts
const wyliczenie = useWyliczenieApi(zadanie, porownajWariantyZasilku);
// wyliczenie.wartosc: odpowiedź albo poprzednia odpowiedź w trakcie przeliczania
// wyliczenie.laduje, wyliczenie.blad, wyliczenie.ponow()
```

Hook wysyła żądanie po każdej zmianie jego treści i przerywa poprzednie żądanie. Komponenty `SzkieletWyliczenia`, `StatusPrzeliczania` i `BladWyliczenia` z `src/komponenty/stan-wyliczenia.tsx` pokazują szkielet pierwszego wyliczenia, komunikat o przeliczaniu dla czytników ekranu i błąd z przyciskiem „Spróbuj ponownie”. Kalkulator zasiłku macierzyńskiego buduje żądanie w `src/app/(strefa)/kalkulator-zasilku/_czesci/wyliczenie-api.ts`, a kalkulatory wariantu i podziału urlopu w `src/app/(strefa)/kalkulatory/_czesci/dane-kalkulatorow.ts`. Podstawę z konta ZUS żądanie przekazuje jako podstawy składek, więc serwer liczy podstawę tą samą funkcją `wyliczPodstawe` co przeglądarka.

Plan rodziny i kalendarz terminów przelicza w przeglądarce operacja `przeliczRodzine` z `src/dane/magazyn/operacje/przeliczenie.ts`, w tej samej transakcji magazynu co zapis zmiany. Korzysta z funkcji `wyliczPlan` i `wyliczTerminy`, tych samych co `POST /api/v1/plan`.

## Wdrożenie

Wdrażaj aplikację jako serwer Node.js poleceniami `pnpm build && pnpm start` albo na Vercel z folderem `web` jako katalogiem głównym projektu. Ustaw zmienne środowiskowe na serwerze albo w ustawieniach projektu. Folder `KATALOG_DANE_KATALOG` wskaż na trwałym dysku, bo w nim serwer zapisuje edycje katalogu świadczeń.

## Dokumenty przykładowe

Uruchom w tym folderze `node skrypty/generuj-dokumenty-przykladowe.mjs`, żeby wygenerować ponownie dokumenty przykładowe w `public/przyklady/`. Skrypt tworzy pliki PDF z warstwą tekstową, zamienia część z nich na PNG poleceniem `sips` systemu macOS i pakuje je poleceniem `zip`. Dokumenty zawierają dane zmyślone przez zespół, a identyfikator „PPM-<nazwa pliku>” w treści pliku pozwala dopasować fiksturę odczytu bez klucza modelu.
