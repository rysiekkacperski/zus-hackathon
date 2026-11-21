'use client';

// Karta logowania strony startowej (ViewGuideStart; wzór LoginForm z systemu eZUS: ez-login, ez-login__form,
// ez-login__methods). Login i hasło eZUS w formularzu, pod nim linia „albo” i przyciski logowania przez
// mObywatela i kodem z aplikacji mZUS. Każdy niepusty login i niepuste hasło (1 do 64 znaków) prowadzą do
// wyboru konta, a hasło znika ze stanu i z pola przed przejściem dalej (Story 3.1.1.1.2, R13). Błąd pola
// pokazuje się po opuszczeniu pola i po próbie logowania (kody 0248 i 0249). Każda akcja zapisuje logowanie
// w toku ({ sposob, powrot }); przy wyłączonym trybie demonstracyjnym akcja prowadzi pod adres produkcyjny
// sposobu logowania, jeśli zespół go ustalił (R15). Właściciel: u01.
import { useRef, useState, type FormEvent } from 'react';
import { adresProdukcyjnyLogowania } from '@/dane/parametry-produkcyjne';
import { rozpocznijLogowanie } from '@/dane/magazyn/operacje/konto';
import type { IdWidoku, KodKomunikatu, SposobZalogowania } from '@/domena/typy';
import type { NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleHasla, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';

const tekst = teksty.ViewGuideStart.logowanie;
const MAKS_DLUGOSC = 64;
const ID_LOGINU = 'start-login';
const ID_HASLA = 'start-haslo';

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

/** Login i hasło: pole wymagane, od 1 do 64 znaków (Walidacja Story 3.1.1.1.2). */
function walidujLogowanie({ login, haslo }: DaneLogowania): BledyLogowania {
  const bledy: BledyLogowania = {};
  if (login.trim() === '') bledy.login = '0248';
  if (haslo === '') bledy.haslo = '0249';
  return bledy;
}

const inneSposoby: { sposob: Exclude<SposobZalogowania, 'ezus'>; ikona: NazwaIkony; makieta: IdWidoku }[] = [
  { sposob: 'mobywatel', ikona: 'mobywatel', makieta: 'ViewMobywatelLogin' },
  { sposob: 'mzus', ikona: 'mzus', makieta: 'ViewMzusCodeLogin' },
];

export interface KartaLogowaniaProps {
  // Cel powrotu po zalogowaniu z parametru ?powrot= (już sprawdzony przez bezpiecznyPowrot)
  powrot?: string;
  // Kod mObywatel z poprzedniego otwarcia makiety w tej karcie przeglądarki (R12)
  poprzedniKodMobywatel?: string;
  trybDemonstracyjny: boolean;
  poWygasnieciu: boolean;
  className?: string;
}

export function KartaLogowania({
  powrot,
  poprzedniKodMobywatel,
  trybDemonstracyjny,
  poWygasnieciu,
  className,
}: KartaLogowaniaProps) {
  const { zajety, przejdz } = useNawigacjaZLadowaniem();
  const [login, ustawLogin] = useState('');
  const [haslo, ustawHaslo] = useState('');
  const walidacja = useWalidacjaNaBiezaco({ wartosci: { login, haslo }, waliduj: walidujLogowanie, pola: idPol });
  const formularz = useRef<HTMLFormElement>(null);

  const adresProdukcyjny = (sposob: SposobZalogowania) =>
    trybDemonstracyjny ? null : adresProdukcyjnyLogowania(sposob);

  const zaloguj = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (zajety || !walidacja.sprobujWyslac()) return;
    // Hasło służy wyłącznie symulacji: usuwamy je ze stanu i z pola przed przejściem dalej. Walidacja wraca
    // do stanu początkowego, więc puste pole hasła nie pokazuje błędu po powrocie na ekran.
    ustawHaslo('');
    walidacja.resetuj();
    const pole = formularz.current?.querySelector<HTMLInputElement>(`#${ID_HASLA}`);
    if (pole) pole.value = '';
    rozpocznijLogowanie({ sposob: 'ezus', powrot, poprzedniKodMobywatel });
    const produkcyjny = adresProdukcyjny('ezus');
    if (produkcyjny) {
      window.location.assign(produkcyjny);
      return;
    }
    przejdz(sciezkaWidoku('ViewDemoAccountPicker'));
  };

  return (
    <Karta tytul={tekst.tytul} bezLinii className={className}>
      <p className="mt-0 mb-4">{poWygasnieciu ? tekst.opisPoWygasnieciu : tekst.opis}</p>
      {trybDemonstracyjny ? (
        <Notatka ikona="demo" className="mb-6">
          <p>{tekst.notatkaDemo}</p>
        </Notatka>
      ) : null}
      <form ref={formularz} noValidate onSubmit={zaloguj} className="grid gap-6">
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
        <Przycisk type="submit" wariant="glowny" szerokosc="pelna" zajety={zajety}>
          {tekst.zaloguj}
        </Przycisk>
      </form>
      <div className="my-4 flex items-center gap-4 text-ink-muted">
        <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-line" />
        <span>{tekst.albo}</span>
        <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-line" />
      </div>
      <div className="flex flex-col gap-3">
        {inneSposoby.map(({ sposob, ikona, makieta }) => (
          <PrzyciskLink
            key={sposob}
            href={adresProdukcyjny(sposob) ?? sciezkaWidoku(makieta)}
            wariant="drugorzedny"
            szerokosc="pelna"
            ikona={ikona}
            onClick={() => rozpocznijLogowanie({ sposob, powrot, poprzedniKodMobywatel })}
          >
            {tekst[sposob]}
          </PrzyciskLink>
        ))}
      </div>
      {trybDemonstracyjny ? (
        <p className="mt-6 mb-0">
          <Odnosnik href={sciezkaWidoku('ViewDemoSettings')} ikonaPo="w-prawo">
            {tekst.ustawieniaDemo}
          </Odnosnik>
        </p>
      ) : null}
    </Karta>
  );
}
