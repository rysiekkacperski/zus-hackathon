# Aplikacja web modułu „Przewodnik przyszłej mamy”

@AGENTS.md

Ten plik określa stos, polecenia i zasady pisania kodu w folderze `web/`. Rolę, kontekst dziedziny, reguły dowodowe i zasady dokumentacji określa główny `CLAUDE.md` w katalogu repozytorium.

## Stos

- Next.js 16.4 z App Routerem i Turbopackiem. W `next.config.ts` są włączone opcje `cacheComponents` i `partialPrefetching`.
- React 19.3 i TypeScript 5.9 w trybie `strict`.
- Tailwind CSS 4.3 ładowany przez loader `@tailwindcss/turbopack`, skonfigurowany w `turbopack.rules` w `next.config.ts`.
- ESLint 9 z konfiguracją `eslint-config-next`, czyli regułami Core Web Vitals i TypeScriptu.
- pnpm 12 jako menedżer pakietów.

## Polecenia

Polecenia uruchamiaj w folderze `web/`:

- `pnpm dev` uruchamia serwer deweloperski pod adresem http://localhost:3000;
- `pnpm build` buduje wersję produkcyjną, a `pnpm start` ją uruchamia;
- `pnpm lint` sprawdza kod regułami ESLint;
- `pnpm typecheck` generuje typy tras poleceniem `next typegen` i sprawdza typy poleceniem `tsc --noEmit`;
- `pnpm add <pakiet>` dodaje zależność, a `pnpm add -D <pakiet>` zależność deweloperską.

Przed oddaniem zmiany uruchom `pnpm lint`, `pnpm typecheck` i `pnpm build`. Zmianę w interfejsie sprawdź w przeglądarce na serwerze deweloperskim i usuń błędy, które pokazuje nakładka deweloperska Next.js.

Przed dodaniem nowego pakietu zapytaj użytkownika. Dotyczy to także bibliotek z przykładów w skillach, na przykład `class-variance-authority`, `clsx`, `tailwind-merge` i pakietów `@radix-ui`.

## Struktura

- `src/app/` zawiera trasy. Plik `page.tsx` definiuje stronę trasy, a `layout.tsx` jej wspólny układ. `src/app/globals.css` importuje Tailwinda i definiuje motyw.
- `public/` zawiera pliki statyczne serwowane spod głównego adresu aplikacji.
- `src/teksty.ts` zawiera wszystkie teksty interfejsu zgodnie z sekcją Teksty interfejsu.
- Moduły z `src/` importuj przez alias `@/`, na przykład `@/app/globals.css`.
- Zanim dodasz nowy folder w `src/` obok `src/app/`, zapytaj użytkownika, bo strukturę ekranów i modułów ustala zespół.

## Teksty interfejsu

- Wszystkie teksty, które interfejs pokazuje albo odczytuje użytkownikowi, trzymaj w jednym pliku `src/teksty.ts`, w obiekcie `teksty` eksportowanym z `as const`. Dotyczy to nagłówków, akapitów, etykiet pól i przycisków, podpowiedzi w polach, komunikatów, tekstów alternatywnych obrazów, atrybutów `aria-label` oraz metadanych stron, czyli `title` i `description`.
- Komponenty i strony pobierają każdy tekst z obiektu `teksty` przez `import { teksty } from '@/teksty'`. Treść w interfejsie zmieniaj wyłącznie w pliku `src/teksty.ts`.
- Teksty grupuj według ekranów i nazywaj grupę nazwą widoku z historyjki, na przykład `teksty.ViewBirthDate.naglowek`. Teksty powtarzające się na kilku ekranach, na przykład etykiety przycisków Dalej i Wróć, trzymaj w grupie `teksty.wspolne`.
- Komunikaty z `docs/03-user-stories/tablica-komunikatow.md` trzymaj w grupie `teksty.komunikaty` pod kluczem równym czterocyfrowemu kodowi z tablicy, na przykład `teksty.komunikaty['0007']`, z treścią identyczną z kolumną Wiadomość. Nowy komunikat dodawaj najpierw do tablicy komunikatów, a zmianę treści komunikatu wprowadzaj jednocześnie w tablicy i w pliku.
- Tekst ze zmienną częścią, na przykład datą albo kwotą, zapisuj jako funkcję z nazwanymi parametrami, która zwraca gotowy ciąg, na przykład `` '0002': ({ dataOdczytu }: { dataOdczytu: string }) => `Pokazujemy dane z ZUS z dnia ${dataOdczytu}. Odświeżymy je przy następnym otwarciu przewodnika.` ``. Datę i kwotę formatuj przed przekazaniem do funkcji.

## Next.js

- Przed napisaniem kodu, który korzysta z API Next.js, przeczytaj właściwy przewodnik w `node_modules/next/dist/docs/01-app/`. Plik o znanej nazwie znajdziesz poleceniem `find node_modules/next/dist/docs -name '<nazwa>.md'`.
- Twórz komponenty serwerowe. Dyrektywę `'use client'` dodawaj na początku pliku komponentu, który używa stanu, efektów, zdarzeń albo API przeglądarki, i umieszczaj takie komponenty jak najniżej w drzewie.
- `params` i `searchParams` są obietnicami, więc odczytuj je przez `await`. Typy `PageProps<'/trasa'>` i `LayoutProps<'/trasa'>` są globalne i powstają przy `next dev`, `next build` i `next typegen`.
- Przy włączonych Cache Components każda trasa musi dać się wyrenderować z góry. Dane z żądania, czyli `cookies()`, `headers()`, `params` i `searchParams`, odczytuj w komponencie potomnym opakowanym w `<Suspense>`.
- Bieżącą datę w komponencie serwerowym odczytuj po `await io()` z `next/cache`, wewnątrz komponentu opakowanego w `<Suspense>`. W komponencie klienckim przed odczytem `new Date()` albo `Date.now()` wywołaj `use(io())`. Te same zasady stosuj do `Math.random()` i `crypto.randomUUID()`.
- Funkcje liczące terminy i świadczenia przyjmują dzisiejszą datę jako argument.
- Przy błędach blocking prerender i decyzjach o `"use cache"`, `<Suspense>` i `export const instant = false` korzystaj ze skilla `next-cache-components-adoption` i ze strony błędu, do której prowadzi link w komunikacie.

## React

- Pisz komponenty funkcyjne i hooki.
- W React 19 przekazuj `ref` jako zwykły prop i odczytuj kontekst przez `use(Kontekst)`.
- Zachowanie komponentu dopasowuj kompozycją, czyli przez `children`, komponenty złożone i osobne warianty komponentu, zgodnie ze skillem `vercel-composition-patterns`.
- Niezależne operacje asynchroniczne uruchamiaj równolegle przez `Promise.all()`, a dane wolne do pobrania strumieniuj przez `<Suspense>`.

## Tailwind CSS

- Style zapisuj klasami Tailwinda w `className`.
- Konfigurację Tailwinda trzymaj w `src/app/globals.css`: tokeny motywu, czyli kolory, fonty, odstępy i promienie, w bloku `@theme`, własne klasy narzędziowe w `@utility`, a własne warianty w `@custom-variant`.
- Tokeny w `@theme` deklaruj na najwyższym poziomie pliku, poza selektorami i zapytaniami `@media`.
- Nazwy klas zapisuj w kodzie w pełnym brzmieniu, bo Tailwind wyszukuje je w plikach jako tekst. Warianty komponentu mapuj na kompletne ciągi klas, na przykład `{ primary: 'bg-zinc-900 text-white', secondary: 'bg-white text-zinc-900' }`.
- Zmienną CSS w wartości dowolnej zapisuj w nawiasach okrągłych, na przykład `bg-(--kolor-marki)`, a modyfikator `!important` dopisuj na końcu klasy, na przykład `bg-red-500!`.

## Skille projektu

Skille leżą w `.claude/skills/` w katalogu repozytorium. Plik `skills-lock.json` przypina ich źródła i commity, `npx skills experimental_install` odtwarza je z tego pliku, a `npx skills update -p` aktualizuje je do najnowszych wersji.

| Skill | Źródło | Kiedy używać |
|---|---|---|
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | Przy pisaniu i przeglądzie komponentów, pobierania danych i optymalizacji wydajności |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` | Przy projektowaniu komponentów wielokrotnego użytku i ich API |
| `tailwind-design-system` | `wshobson/agents` | Przy definiowaniu tokenów w `@theme`, wariantów komponentów i wzorców responsywnych |
| `next-cache-components-adoption` | `vercel/next.js` | Przy błędach blocking prerender oraz wyborze między `"use cache"`, `<Suspense>` i `export const instant = false` |
| `langchain-build-agent` | `langchain-ai/langchain-skills` | Przy budowie i zmianie aplikacji z modelem językowym w LangChain, LangGraph i Deep Agents, w tym przy wyborze między agentem, grafem LangGraph a pojedynczym wywołaniem modelu |
