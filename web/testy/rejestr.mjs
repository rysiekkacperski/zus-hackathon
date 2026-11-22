// Rejestracja loadera testów: `node --import ./testy/rejestr.mjs --test testy/*.test.ts` (skrypt `pnpm test`).
// Node.js od wersji 22.15 ma synchroniczne `module.registerHooks`, a starsze wersje rejestrują loader przez `module.register`.
import * as modul from 'node:module';
import { load, resolve } from './loader.mjs';

if (typeof modul.registerHooks === 'function') modul.registerHooks({ resolve, load });
else modul.register('./loader.mjs', import.meta.url);
