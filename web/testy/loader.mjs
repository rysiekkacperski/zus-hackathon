// Loader testów automatycznych w Node.js bez dodatkowych pakietów. Rozwiązuje alias `@/` na `src/` i importy bez
// rozszerzenia, transpiluje pliki TypeScript kompilatorem `typescript` z zależności deweloperskich i podstawia
// zaślepki modułów, które poza serwerem Next.js nie działają (`server-only`, `connection` i `io`). Funkcje są
// synchroniczne, więc działają jako hooki `module.registerHooks` i jako hooki `module.register`.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WEB = fileURLToPath(new URL('..', import.meta.url));
const SRC = path.join(WEB, 'src');
const ts = createRequire(path.join(WEB, 'package.json'))('typescript');

const ZASLEPKI = {
  'server-only': new URL('./zaslepki/pusty.mjs', import.meta.url).href,
  'next/server': new URL('./zaslepki/next-server.mjs', import.meta.url).href,
  'next/cache': new URL('./zaslepki/next-cache.mjs', import.meta.url).href,
};

function plik(sciezka) {
  for (const koncowka of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const p = sciezka + koncowka;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

export function resolve(specyfikator, kontekst, nastepny) {
  if (specyfikator in ZASLEPKI) return { url: ZASLEPKI[specyfikator], shortCircuit: true };
  if (specyfikator.startsWith('@/')) {
    const p = plik(path.join(SRC, specyfikator.slice(2)));
    if (p) return { url: pathToFileURL(p).href, shortCircuit: true };
  }
  if ((specyfikator.startsWith('./') || specyfikator.startsWith('../')) && kontekst.parentURL?.startsWith('file:')) {
    const p = plik(path.resolve(path.dirname(fileURLToPath(kontekst.parentURL)), specyfikator));
    if (p) return { url: pathToFileURL(p).href, shortCircuit: true };
  }
  return nastepny(specyfikator, kontekst);
}

export function load(url, kontekst, nastepny) {
  if (url.startsWith('file:') && /\.(ts|tsx|mts)$/.test(url)) {
    const nazwa = fileURLToPath(url);
    const wynik = ts.transpileModule(readFileSync(nazwa, 'utf8'), {
      fileName: nazwa,
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    });
    return { format: 'module', source: wynik.outputText, shortCircuit: true };
  }
  return nastepny(url, kontekst);
}
