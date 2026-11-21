'use client';

// ViewEzusLogin: makieta logowania loginem i hasłem eZUS (Story 3.1.1.1.2, KA-05, KA-07–KA-10;
// wzory P01-05 i P01-06). Każdy niepusty login i niepuste hasło prowadzą do wyboru konta (R13),
// a hasło znika ze stanu formularza przed przejściem dalej. Błąd pola pokazuje się po opuszczeniu pola
// i po próbie logowania. Właściciel: u01.
import { useRef, useState, type FormEvent } from 'react';
import { NaglowekDemo } from '@/app/(publiczne)/_czesci/naglowek-demo';
import type { KodKomunikatu } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { PoleHasla, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import { useAkcjeMakiety } from '../_czesci/makieta-logowania';

const tekst = teksty.ViewEzusLogin;
const MAKS_DLUGOSC = 64;
const ID_LOGINU = 'ezus-login';
const ID_HASLA = 'ezus-haslo';

interface DaneLogowania {
  login: string;
  haslo: string;
}

interface BledyLogowania {
  login?: KodKomunikatu;
  haslo?: KodKomunikatu;
}

// Kolejność pól na ekranie i cel fokusu pierwszego pola z błędem.
const idPol = { login: ID_LOGINU, haslo: ID_HASLA } as const;

/** Login i hasło makiety: pole wymagane, od 1 do 64 znaków (Walidacja Story 3.1.1.1.2). */
function walidujLogowanie({ login, haslo }: DaneLogowania): BledyLogowania {
  const bledy: BledyLogowania = {};
  if (login.trim() === '') bledy.login = '0248';
  if (haslo === '') bledy.haslo = '0249';
  return bledy;
}

export function WidokLogowaniaEzus() {
  const { potwierdz, przerwij, zajety } = useAkcjeMakiety('ezus');
  const [login, ustawLogin] = useState('');
  const [haslo, ustawHaslo] = useState('');
  const walidacja = useWalidacjaNaBiezaco({ wartosci: { login, haslo }, waliduj: walidujLogowanie, pola: idPol });
  const formularz = useRef<HTMLFormElement>(null);

  const zaloguj = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (zajety || !walidacja.sprobujWyslac()) return;
    // Hasło służy wyłącznie symulacji: usuwamy je ze stanu i z pola przed przejściem dalej. Walidacja wraca
    // do stanu początkowego, więc puste pole hasła nie pokazuje błędu po powrocie na ekran.
    ustawHaslo('');
    walidacja.resetuj();
    const pole = formularz.current?.querySelector<HTMLInputElement>(`#${ID_HASLA}`);
    if (pole) pole.value = '';
    potwierdz();
  };

  return (
    <>
      <NaglowekDemo flaga={tekst.flaga} tytul={tekst.naglowek} wstep={tekst.wstep} />
      <Karta tytul={tekst.karta} bezLinii className="max-w-190">
        <form ref={formularz} noValidate onSubmit={zaloguj}>
          <div className="flex max-w-login-column flex-col gap-6">
            <PoleTekstowe
              id={ID_LOGINU}
              nazwa="login"
              etykieta={tekst.login}
              wartosc={login}
              onZmiana={ustawLogin}
              {...walidacja.pole('login')}
              maksDlugosc={MAKS_DLUGOSC}
              autoComplete="off"
              zwykla
            />
            <PoleHasla
              id={ID_HASLA}
              nazwa="haslo"
              etykieta={tekst.haslo}
              wartosc={haslo}
              onZmiana={ustawHaslo}
              {...walidacja.pole('haslo')}
              maksDlugosc={MAKS_DLUGOSC}
              autoComplete="off"
              zwykla
            />
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <Notatka>
              <p>{tekst.notatkaDalej}</p>
            </Notatka>
            <Notatka>
              <p>{tekst.notatkaHaslo}</p>
            </Notatka>
          </div>
          <div className="mt-7.5 flex flex-wrap gap-4">
            <Przycisk type="submit" wariant="glowny" szerokosc="szeroka" zajety={zajety}>
              {tekst.zaloguj}
            </Przycisk>
            <Przycisk
              wariant="drugorzedny"
              disabled={zajety}
              onClick={() => {
                // Opuszczenie pola przy kliknięciu nie zostawia błędu na ekranie, do którego można wrócić.
                walidacja.resetuj();
                przerwij();
              }}
            >
              {tekst.przerwij}
            </Przycisk>
          </div>
        </form>
      </Karta>
    </>
  );
}
