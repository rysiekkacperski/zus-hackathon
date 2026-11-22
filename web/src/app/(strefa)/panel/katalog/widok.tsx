'use client';

// ViewCatalogList: panel Administratora z zakładkami słownika kwot i progów, słownika wymiarów i okresów,
// pozycji katalogu oraz zakładkami slotów (historyjki 3.5.1.2.1, 3.5.1.2.2, 3.5.1.2.3; wzory Katalog, P04-05, P04-08,
// P04-11, P04-14). Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (BrakUprawnien z komunikatem 0047).
import { useSearchParams } from 'next/navigation';
import { use, useMemo } from 'react';
import { slotyKatalogu } from '@/app/(strefa)/panel/katalog/_sloty';
import type { ZakladkaKatalogu } from '@/app/(strefa)/panel/katalog/_sloty/typy';
import { KomunikatyKatalogu } from '@/app/(strefa)/panel/katalog/_czesci/komunikaty-katalogu';
import { StanWspolnegoKatalogu } from '@/app/(strefa)/panel/katalog/_czesci/stan-wspolnego-katalogu';
import { TabelaPozycji } from '@/app/(strefa)/panel/katalog/_czesci/tabela-pozycji';
import { TabelaSlownika } from '@/app/(strefa)/panel/katalog/_czesci/tabela-slownika';
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import type { WpisSlownika } from '@/domena/typy';
import { KontekstKomunikatowPoPrzejsciu, NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Zakladki } from '@/komponenty/zakladki';
import { teksty } from '@/teksty';

const ZAKLADKI_WLASNE = ['kwoty', 'wymiary', 'pozycje'] as const satisfies readonly ZakladkaKatalogu[];
const ZAKLADKA_DOMYSLNA: ZakladkaKatalogu = 'kwoty';

// Zakładki własne widoku, a po nich zakładki slotów w kolejności rejestru slotyKatalogu.
const ZAKLADKI: readonly ZakladkaKatalogu[] = [
  ...ZAKLADKI_WLASNE,
  ...new Set(
    slotyKatalogu.map((s) => s.zakladka).filter((z) => !(ZAKLADKI_WLASNE as readonly string[]).includes(z)),
  ),
];

function odczytajZakladke(wartosc: string | null): ZakladkaKatalogu {
  return ZAKLADKI.find((z) => z === wartosc) ?? ZAKLADKA_DOMYSLNA;
}

function wedlugKolejnosci(a: WpisSlownika, b: WpisSlownika): number {
  return a.kolejnosc - b.kolejnosc;
}

export function WidokKatalogu() {
  const t = teksty.ViewCatalogList;
  const katalog = useKatalog();
  const dzis = useDzis();
  const parametry = useSearchParams();
  const komunikaty = use(KontekstKomunikatowPoPrzejsciu);

  const zakladka = odczytajZakladke(parametry.get('zakladka'));

  const kwoty = useMemo(
    () => katalog.slowniki.filter((w) => w.slownik === 'kwoty-i-progi').sort(wedlugKolejnosci),
    [katalog],
  );
  const wymiary = useMemo(
    () => katalog.slowniki.filter((w) => w.slownik === 'wymiary-i-okresy').sort(wedlugKolejnosci),
    [katalog],
  );

  const etykietyZakladek: Record<ZakladkaKatalogu, string> = {
    kwoty: t.zakladki.kwoty({ liczba: String(kwoty.length) }),
    wymiary: t.zakladki.wymiary({ liczba: String(wymiary.length) }),
    pozycje: t.zakladki.pozycje({ liczba: String(katalog.pozycje.length) }),
    reguly: t.zakladki.reguly({ liczba: String(katalog.reguly.length) }),
    dokumenty: t.zakladki.dokumenty({ liczba: String(katalog.dokumenty.length) }),
  };

  function wybierzZakladke(nowa: ZakladkaKatalogu) {
    const adres = new URL(window.location.href);
    adres.searchParams.set('zakladka', nowa);
    adres.hash = '';
    window.history.replaceState(null, '', `${adres.pathname}${adres.search}`);
  }

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        stanNa={dzis}
        powrot={false}
        bezKomunikatowPoPrzejsciu
        akcje={
          <>
            <PrzyciskLink href={trasy.ViewCatalogSupportOrganizations()} wariant="drugorzedny" ikona="serce">
              {teksty.ViewCatalogSupportOrganizations.otworzSlownik}
            </PrzyciskLink>
            <PrzyciskLink href={trasy.ViewCatalogItemAdd()} wariant="glowny" ikona="plus">
              {t.dodajPozycje}
            </PrzyciskLink>
          </>
        }
      />
      <div className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        <KomunikatyKatalogu komunikaty={komunikaty} katalog={katalog} />
        <StanWspolnegoKatalogu />
        <Zakladki<ZakladkaKatalogu>
          etykieta={t.zakladkiEtykieta}
          zakladki={ZAKLADKI.map((z) => ({ wartosc: z, etykieta: etykietyZakladek[z] }))}
          wybrana={zakladka}
          onWybor={wybierzZakladke}
        >
          <div className="pt-7.5">
            {zakladka === 'kwoty' ? <TabelaSlownika rodzaj="kwoty" wpisy={kwoty} katalog={katalog} dzis={dzis} /> : null}
            {zakladka === 'wymiary' ? (
              <TabelaSlownika rodzaj="wymiary" wpisy={wymiary} katalog={katalog} dzis={dzis} />
            ) : null}
            {zakladka === 'pozycje' ? <TabelaPozycji pozycje={katalog.pozycje} /> : null}
            {slotyKatalogu
              .filter((slot) => slot.zakladka === zakladka)
              .map(({ id, Komponent }) => (
                <Komponent key={id} katalog={katalog} dzis={dzis} />
              ))}
          </div>
        </Zakladki>
      </div>
    </>
  );
}
