# Aplikacja web ZUS Mama

Aplikacja Next.js 16 (App Router, Cache Components) z Reactem 19, Tailwind CSS 4 i TypeScriptem. Opis produktu, instrukcję dla jury i architekturę znajdziesz w [README repozytorium](../README.md), a zasady pisania kodu w [`CLAUDE.md`](CLAUDE.md).

## Uruchomienie

Potrzebujesz Node.js 20.9 albo nowszego i pnpm 12.21.0, którego wersję przypina pole `packageManager` w `package.json`. Włącz go poleceniem `corepack enable`, a gdy Node.js nie ma Corepacka, zainstaluj go poleceniem `npm install -g pnpm@12.21.0`.

```bash
pnpm install
cp .env.example .env.local
pnpm dev          # http://localhost:3000
pnpm test         # testy node:test z folderu testy/, bez serwera
pnpm lint
pnpm typecheck    # next typegen i tsc --noEmit
pnpm build        # wersja produkcyjna, uruchamiana przez pnpm start
```

Jeśli serwer deweloperski po `pnpm build` zwraca 404 na trasach poza stroną startową, zrestartuj go.

## Zmienne środowiskowe

Każdą zmienną opisuje [`.env.example`](.env.example). Zmienne bez przedrostka `NEXT_PUBLIC_` czyta wyłącznie kod serwera z `src/serwer/` i `src/app/api/`.

| Zmienna | Znaczenie |
| --- | --- |
| `MODEL_DOSTAWCA` | `deepseek` (domyślnie) albo `anthropic` |
| `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL` | Klucz i model DeepSeek, domyślnie `deepseek-flash` |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Klucz i model Claude przy `MODEL_DOSTAWCA=anthropic` |
| `KATALOG_DANE_KATALOG` | Folder pliku `katalog.json` ze zmianami Administratora, domyślnie `.dane/` |
| `PANEL_TOKEN` | Token zapisu katalogu w nagłówku `Authorization: Bearer <token>` |
| `KATALOG_TRYB_DEMO` | `nie` wyłącza potwierdzanie roli Administratora polem `sesjaDemo`. Panel i ustawienia demo przestają wtedy zapisywać katalog, a zapis przyjmuje tylko `PANEL_TOKEN` |
| `PRZYKLADOWE_SPRAWY_ZUS_KATALOG` | Lokalny folder z zestawami spraw ZUS dla `GET /api/przykladowe-sprawy/zestawy`. Zestawy zostają poza repozytorium |
| `NEXT_PUBLIC_ADRES_*` | Produkcyjne adresy logowania i kanałów zewnętrznych. Czyta je `src/dane/parametry-produkcyjne.ts`, a Next.js wpisuje je w kod przeglądarki przy `pnpm build` |

Bez klucza modelu asystent pokazuje komunikat 0071, a odczyt dokumentu komunikat 0108. Dokumenty przykładowe odczytasz wtedy z zapisanych wyników po wybraniu w `/demo/ustawienia` opcji „Wynik odczytu zapisany w prototypie”.

## Struktura

| Ścieżka | Zawartość |
| --- | --- |
| `src/app/(publiczne)/` | Strona startowa, makiety logowania i ekrany `/demo/*` |
| `src/app/(strefa)/` | Ekrany po zalogowaniu i w trybie gościa: profil, plan, sprawy, terminy, wnioski, kalkulatory, przykładowe sprawy i panel Administratora `/panel/*` |
| `src/app/(symulacje)/` | Symulowany eZUS i kanały zewnętrzne |
| `src/app/api/v1/` | REST API, opis na stronie `/api-docs` |
| `src/app/api/` | Asystent AI, odczyt dokumentów, katalog świadczeń i zestawy spraw ZUS |
| `src/domena/` | Czyste funkcje: kalkulatory, plan, terminy, zasiłki, wnioski, przykładowe sprawy. Dzisiejszą datę dostają w argumencie |
| `src/dane/katalog/` | Wartości startowe katalogu: kwoty, wymiary, pozycje planu, dokumenty, podmioty wsparcia |
| `src/dane/magazyn/` | Magazyn w localStorage, operacje zapisu, hooki i synchronizacja katalogu z serwerem |
| `src/dane/api/` | Klient REST API i hook wyliczeń |
| `src/serwer/` | Kod tylko serwerowy: REST API, asystent, odczyt dokumentów, magazyn katalogu, fabryka modelu |
| `src/komponenty/` | Komponenty interfejsu i rama aplikacji |
| `src/teksty.ts` | Wszystkie teksty interfejsu i komunikaty z tablicy komunikatów |
| `public/przyklady/` | Dokumenty przykładowe i ich archiwum ZIP |
| `testy/` | Testy `*.test.ts` dla `node:test` |

## REST API

Trasa w `src/app/api/v1/` odczytuje żądanie modułem z `src/serwer/api/`, liczy wynik funkcjami domeny na wartościach z katalogu serwera i zwraca dane albo błąd `{ kod, pola?, parametry? }`. Z rejestru `src/serwer/api/endpointy.ts` powstaje opis OpenAPI (`GET /api/v1/openapi.json`) i strona `/api-docs`.

Odczyty konta ZUS (`/api/v1/zus/konto`, `/api/v1/zus/konto/stan-rozliczen` i `/api/v1/zus/konto/e-zla`) przyjmują numer PESEL w polu `pesel` treści żądania POST, a odczyt e-ZLA wymaga też pola `zgodaNaDaneZdrowia: true`. Zapis katalogu (`POST` i `PUT /api/katalog`) odczytuje sesję Administratora z pola `sesjaDemo` treści.

Kalkulatory, świadczenia w ciąży i przykładowe sprawy liczą wyniki przez hook `useWyliczenieApi` z `src/dane/api/wyliczenie.ts`. Hook przerywa poprzednie żądanie i w trakcie przeliczania zostawia stary wynik, a po błędzie zwraca kod komunikatu i funkcję `ponow`, z których komponent `BladWyliczenia` buduje przycisk „Spróbuj ponownie”. Odczyt konta ZUS, wysyłka wniosków i pytań do ZUS oraz zaświadczenia wywołują funkcje z `src/dane/api/klient.ts` w operacjach z `src/dane/magazyn/operacje/`.

## Wdrożenie

Aplikacja potrzebuje serwera Next.js, bo REST API, asystent i odczyt dokumentów działają w funkcjach serwerowych. Na produkcji ustaw `PANEL_TOKEN` i `KATALOG_TRYB_DEMO=nie`, a adresy `NEXT_PUBLIC_ADRES_*` przed buildem.

- Serwer Node.js: `pnpm build && pnpm start`. Port ustawisz zmienną środowiskową procesu, na przykład `PORT=8080 pnpm start`. `KATALOG_DANE_KATALOG` wskaż na trwały dysk.
- Vercel: wdrażaj ten folder poleceniem `npx vercel@66.6.0 deploy --prod`. `vercel.json` ustawia framework Next.js, a `.vercelignore` pomija pliki `.env` i lokalne dane. W zmiennych projektu ustaw klucz modelu i `ENABLE_EXPERIMENTAL_COREPACK=1`, żeby Vercel zbudował aplikację pnpm 12. Zmiany katalogu zostają tam w pamięci procesu do restartu.

## Dokumenty przykładowe

`node skrypty/generuj-dokumenty-przykladowe.mjs` generuje od nowa dokumenty w `public/przyklady/`: pliki PDF z warstwą tekstową, dokumenty oznaczone jako obraz w PNG i archiwum ZIP. Skrypt wymaga macOS z poleceniem `sips`, polecenia `zip` i Node.js 20.15 albo nowszego. Identyfikator „PPM-<nazwa pliku>” w treści pliku pozwala dopasować zapisany wynik odczytu bez klucza modelu.
