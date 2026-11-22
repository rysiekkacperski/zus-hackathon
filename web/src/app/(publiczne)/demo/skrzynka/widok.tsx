'use client';

// ViewDemoInbox (P, kontrakt 2.2 i 13.2 pkt 3): skrzynka demonstracyjna e-maili i SMS-ów konta w trybie
// demonstracyjnym, z doręczeniem wiadomości zaplanowanych do bieżącej chwili. Właściciel: u18.
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { formatujDateICzas } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import {
  useKatalog,
  useKontaDemo,
  useParametry,
  useSesja,
  useStanKontaWTrybieDemo,
  useTeraz,
} from '@/dane/magazyn/hooki';
import { oznaczOdczytane } from '@/dane/magazyn/operacje/powiadomienia';
import { doreczZaplanowane } from '@/dane/magazyn/operacje/przypomnienia';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { Powiadomienie } from '@/domena/typy';
import { teksty } from '@/teksty';
import { Wiadomosc, podgladWiadomosci } from './_czesci/wiadomosc';

const t = teksty.ViewDemoInbox;

function porownajChwile(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function powodPominiecia(p: Powiadomienie): string {
  const powody: Record<string, string> = t.pominiete.powody;
  return powody[p.powodPominiecia ?? 'inny'] ?? t.pominiete.powody.inny;
}

export function WidokSkrzynkiDemo() {
  const parametry = useParametry();
  const konta = useKontaDemo();
  const sesja = useSesja();
  const katalog = useKatalog();
  const teraz = useTeraz();
  const zapytanie = useSearchParams();
  const kontoZAdresu = zapytanie.get('konto') ?? undefined;
  const pesel = kontoZAdresu ?? sesja?.pesel ?? konta[0]?.pesel;
  const stanKonta = useStanKontaWTrybieDemo(pesel);
  const [wynikDoreczenia, ustawWynikDoreczenia] = useState<number | null>(null);

  // Wiadomości zaplanowane do bieżącej chwili wychodzą, gdy skrzynka jest otwarta i gdy mija kolejna minuta.
  useEffect(() => {
    if (!parametry.trybDemonstracyjny) return;
    doreczZaplanowane(pobierzKontekstOperacji());
  }, [parametry.trybDemonstracyjny, parametry.dataDemo, teraz]);

  const powiadomienia = useMemo(() => stanKonta?.powiadomienia ?? [], [stanKonta]);
  const wyslane = useMemo(
    () =>
      powiadomienia
        .filter((p) => p.statusDoreczenia === 'wyslane')
        .sort((a, b) => porownajChwile(b.wyslano ?? b.planowanaWysylka, a.wyslano ?? a.planowanaWysylka)),
    [powiadomienia],
  );
  const zaplanowane = useMemo(
    () =>
      powiadomienia
        .filter((p) => p.statusDoreczenia === 'zaplanowane')
        .sort((a, b) => porownajChwile(a.planowanaWysylka, b.planowanaWysylka)),
    [powiadomienia],
  );
  const pominiete = useMemo(
    () => powiadomienia.filter((p) => p.statusDoreczenia === 'pominiete' || p.statusDoreczenia === 'nieudane'),
    [powiadomienia],
  );

  if (!parametry.trybDemonstracyjny) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} />
        <StanPusty ikona="demo">
          <p>{t.tylkoDemo}</p>
        </StanPusty>
      </>
    );
  }

  function wybierzKonto(wybrane: string) {
    if (wybrane === '') return;
    window.history.replaceState(null, '', `?konto=${encodeURIComponent(wybrane)}`);
    ustawWynikDoreczenia(null);
  }

  function dorecz() {
    const wynik = doreczZaplanowane(pobierzKontekstOperacji());
    ustawWynikDoreczenia(wynik.ok ? wynik.wartosc.doreczono : 0);
  }

  function oznacz(id: string) {
    oznaczOdczytane(id, pobierzKontekstOperacji());
  }

  return (
    <div className="flex min-w-0 flex-col gap-7.5">
      <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} />

      <Karta tytul={t.doreczanie.tytul} bezLinii>
        <div className="flex flex-col gap-6">
          <PoleWyboru
            id="skrzynka-konto"
            etykieta={t.konto}
            podpowiedz={<p className="m-0 text-body">{t.kontoPodpowiedz}</p>}
            opcje={konta.map((k) => ({ wartosc: k.pesel, etykieta: `${k.imie} ${k.nazwisko}` }))}
            wartosc={pesel ?? ''}
            onZmiana={wybierzKonto}
            szerokosc="srednia"
          />
          <p className="m-0 text-body">{t.doreczanie.opis({ teraz: formatujDateICzas(teraz) })}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Przycisk wariant="drugorzedny" ikona="wyslij" type="button" onClick={dorecz}>
              {t.doreczanie.przycisk}
            </Przycisk>
            <Odnosnik href={trasy.ViewDemoSettings()}>{t.doreczanie.zmienDate}</Odnosnik>
          </div>
          <p role="status" className="m-0 text-body-strong empty:hidden">
            {wynikDoreczenia === null ? '' : t.doreczanie.wynik({ liczba: wynikDoreczenia })}
          </p>
        </div>
      </Karta>

      {stanKonta === null ? (
        <StanPusty ikona="email">
          <p>{t.brakKonta}</p>
        </StanPusty>
      ) : (
        <>
          <Karta tytul={t.wyslane.tytul({ liczba: wyslane.length })} bezLinii>
            {wyslane.length === 0 ? (
              <StanPusty ikona="email" przerywany>
                <p>{t.wyslane.pusto}</p>
              </StanPusty>
            ) : (
              <div className="flex flex-col gap-5">
                {wyslane.map((p) => (
                  <Wiadomosc key={p.id} p={p} onOdczytana={oznacz} />
                ))}
              </div>
            )}
          </Karta>

          <Karta tytul={t.zaplanowane.tytul({ liczba: zaplanowane.length })} bezLinii>
            {zaplanowane.length === 0 ? (
              <StanPusty ikona="zegar" przerywany>
                <p>{t.zaplanowane.pusto}</p>
              </StanPusty>
            ) : (
              <Tabela
                podpis={t.zaplanowane.podpis}
                etykietaPrzewijania={t.zaplanowane.przewijanie}
                kolumny={[
                  { klucz: 'data', naglowek: t.zaplanowane.kolumny.data },
                  { klucz: 'kanal', naglowek: t.zaplanowane.kolumny.kanal },
                  { klucz: 'adresat', naglowek: t.zaplanowane.kolumny.adresat },
                  { klucz: 'tresc', naglowek: t.zaplanowane.kolumny.tresc },
                ]}
                wiersze={zaplanowane.map((p) => {
                  const podglad = podgladWiadomosci(p, katalog);
                  return {
                    id: p.id,
                    data: <span className="whitespace-nowrap">{formatujDateICzas(p.planowanaWysylka)}</span>,
                    kanal: t.kanaly[p.kanal],
                    adresat: p.adresat.trim() === '' ? t.adresZKontaZus : p.adresat,
                    tresc: podglad.temat ?? podglad.tresc,
                  };
                })}
              />
            )}
          </Karta>

          {pominiete.length > 0 ? (
            <Karta tytul={t.pominiete.tytul({ liczba: pominiete.length })} bezLinii>
              <Tabela
                podpis={t.pominiete.podpis}
                etykietaPrzewijania={t.pominiete.przewijanie}
                kolumny={[
                  { klucz: 'data', naglowek: t.pominiete.kolumny.data },
                  { klucz: 'kanal', naglowek: t.pominiete.kolumny.kanal },
                  { klucz: 'tresc', naglowek: t.pominiete.kolumny.tresc },
                  { klucz: 'powod', naglowek: t.pominiete.kolumny.powod },
                ]}
                wiersze={pominiete.map((p) => {
                  const podglad = podgladWiadomosci(p, katalog);
                  return {
                    id: p.id,
                    data: <span className="whitespace-nowrap">{formatujDateICzas(p.planowanaWysylka)}</span>,
                    kanal: t.kanaly[p.kanal],
                    tresc: podglad.temat ?? podglad.tresc,
                    powod: powodPominiecia(p),
                  };
                })}
              />
            </Karta>
          ) : null}
        </>
      )}
    </div>
  );
}
