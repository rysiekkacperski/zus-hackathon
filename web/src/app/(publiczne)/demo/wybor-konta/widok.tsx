'use client';

// ViewDemoAccountPicker: wybór konta po makiecie logowania (Story 3.1.1.1.3, KA-01–KA-07, KA-11, KA-12;
// Story 3.4.1.2.1, KA-03–KA-05; wzory P02-01, P02-02 i Wybor-konta, układ p02 według kontraktu 13.2
// pkt 10). Lista: 7 kont rodziców i Administrator ZUS w kolejności rejestru, potem nowe konta w kolejności
// założenia i akcja „Załóż nowe konto”. Właściciel: u01.
import { useMemo, useState } from 'react';
import { NaglowekDemo } from '@/app/(publiczne)/_czesci/naglowek-demo';
import { useDzis, useKontaDemo, useParametry } from '@/dane/magazyn/hooki';
import { ustawParametry } from '@/dane/magazyn/operacje/parametry';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KodKomunikatu } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useKomunikatChwilowy } from '@/komponenty/komunikat-chwilowy';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { PozycjaKonta } from './_czesci/pozycja-konta';

const tekst = teksty.ViewDemoAccountPicker;

export function WidokWyboruKonta() {
  const konta = useKontaDemo();
  const parametry = useParametry();
  const dzis = useDzis();
  const { pokaz } = useKomunikatChwilowy();
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const tryb = parametry.trybDemonstracyjny;

  const przykladowe = useMemo(() => konta.filter((k) => k.rodzaj !== 'nowe-konto'), [konta]);
  const nowe = useMemo(() => konta.filter((k) => k.rodzaj === 'nowe-konto'), [konta]);
  // Symulacja narodzin daje dziecko urodzone w dniu demonstracyjnym „dzisiaj”.
  const dataDzieckaZSymulacji = formatujDate(dzis);

  const wlaczTryb = () => {
    const wynik = ustawParametry({ trybDemonstracyjny: true }, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return;
    }
    ustawBlad(null);
    pokaz(tekst.trybWlaczony);
  };

  return (
    <>
      <NaglowekDemo tytul={tekst.naglowek} wstep={tekst.wstep} />
      <div className="flex max-w-tresc flex-col gap-7.5">
        {blad ? <Komunikat kod={blad} /> : null}
        {tryb ? null : (
          <Komunikat
            typ="INFO"
            tresc={tekst.trybWylaczony}
            akcje={
              <Przycisk wariant="drugorzedny" onClick={wlaczTryb}>
                {tekst.wlaczTryb}
              </Przycisk>
            }
          />
        )}

        <div className="flex flex-wrap items-start gap-7.5">
          <Karta
            tytul={tekst.kontaPrzykladowe({ liczba: przykladowe.length })}
            bezLinii
            className="min-w-0 grow-2 basis-160"
          >
            <div className="flex flex-col gap-3">
              <Notatka>
                <p>{tekst.notatkaDane}</p>
              </Notatka>
              {tryb ? (
                <Notatka>
                  <p>{tekst.notatkaSymulacji({ data: dataDzieckaZSymulacji })}</p>
                </Notatka>
              ) : null}
            </div>
            <ul className="mt-6 mb-0 list-none border-t border-line-row p-0">
              {przykladowe.map((konto) => (
                <PozycjaKonta key={konto.pesel} konto={konto} onBlad={ustawBlad} />
              ))}
            </ul>
          </Karta>

          <Karta
            tytul={tekst.noweKonta({ liczba: nowe.length })}
            bezLinii
            className="min-w-0 grow basis-88 lg:max-w-112"
          >
            <p className="m-0">{tekst.noweKontaOpis}</p>
            {nowe.length > 0 ? (
              <ul className="mt-6 mb-0 list-none border-t border-line-row p-0">
                {nowe.map((konto) => (
                  <PozycjaKonta key={konto.pesel} konto={konto} onBlad={ustawBlad} />
                ))}
              </ul>
            ) : null}
            <PrzyciskLink href={sciezkaWidoku('ViewDemoNewAccount')} wariant="drugorzedny" ikona="plus" className="mt-6">
              {tekst.zalozNoweKonto}
            </PrzyciskLink>
          </Karta>
        </div>

        {tryb ? (
          <p className="m-0">
            <Odnosnik href={sciezkaWidoku('ViewDemoSettings')} ikonaPo="w-prawo">
              {tekst.ustawieniaDemo}
            </Odnosnik>
          </p>
        ) : null}
      </div>
    </>
  );
}
