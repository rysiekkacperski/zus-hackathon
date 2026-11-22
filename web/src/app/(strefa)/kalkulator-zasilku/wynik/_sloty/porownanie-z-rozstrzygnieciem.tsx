'use client';

// Slot ViewCalcMaternityResult „porownanie-z-rozstrzygnieciem” w liście slotyWyniku (kontrakt, sekcja 12.4). Właściciel: u21.
// W trybie ?zrodlo=przykladowa-sprawa pokazuje okresy, stawki i wypłaty wszystkich przysługujących świadczeń sprawy
// (zasiłek macierzyński z oświadczeniem 81,5% i rolą ojca, ZWZM, zasiłek chorobowy) i ich porównanie z oczekiwanym
// rozstrzygnięciem (0111, 0112, 0180), które liczy serwer (POST /api/v1/przykladowe-sprawy/weryfikacja), i zapisuje
// wynik zasiłku macierzyńskiego w Wynikach kalkulacji konta
// (wzory P13-18, P13-19). Gospodarz w tym trybie pokazuje wyłącznie ten slot jako wynik, bez kart ogólnego kalkulatora.
// Teksty: teksty.ViewCalcMaternityResult.porownanieZRozstrzygnieciem.
import { useEffect, useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { BladWyliczenia, SzkieletWyliczenia } from '@/komponenty/stan-wyliczenia';
import { Stos } from '@/komponenty/uklad';
import { trasy } from '@/komponenty/rama/trasy';
import type { KodKomunikatu } from '@/domena/typy';
import { useCzyGosc, useDzis, useParametry, useStanSesji } from '@/dane/magazyn/hooki';
import { zapiszWynikKalkulacjiSprawy } from '@/dane/magazyn/operacje/weryfikacja-sprawy';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';
import { useWyliczeniaSprawyApi } from '@/app/(strefa)/przykladowe-sprawy/_czesci/wyliczenia-api';
import { WyliczeniaSprawy } from '@/app/(strefa)/przykladowe-sprawy/_czesci/wyliczenia-sprawy';
import type { PropsSlotu } from './typy';

const T = teksty.ViewCalcMaternityResult.porownanieZRozstrzygnieciem;
const ZRODLO = 'przykladowa-sprawa';

export function SlotPorownanieZRozstrzygnieciem({ zrodlo }: PropsSlotu<'wynik'>) {
  const stanSesji = useStanSesji();
  const dzis = useDzis();
  const parametry = useParametry();
  const gosc = useCzyGosc();
  const sprawa = stanSesji?.przykladowaSprawa;
  const weryfikacja = sprawa?.weryfikacja;
  const aktywny = zrodlo === ZRODLO && weryfikacja !== undefined;

  // To samo żądanie wysyła ekran weryfikacji sprawy, więc obie strony pokazują te same kwoty.
  const wyliczenieApi = useWyliczeniaSprawyApi(aktywny && sprawa !== undefined ? sprawa : null, parametry.tolerancjaPorownaniaKwotyGrosze, dzis);
  const odpowiedz = wyliczenieApi.wartosc;
  const wyliczenie =
    odpowiedz === null
      ? null
      : odpowiedz.komunikatWyliczen
        ? { kod: odpowiedz.komunikatWyliczen.kod }
        : odpowiedz.wyliczeniaSwiadczen && odpowiedz.porownanieSwiadczen
          ? { wynik: odpowiedz.wyliczeniaSwiadczen, porownanie: odpowiedz.porownanieSwiadczen }
          : null;

  // Zapis w Wynikach kalkulacji przy pokazaniu wyniku; operacja pomija zapis, gdy wynik się nie zmienił.
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const wynikDoZapisu = wyliczenie === null || 'kod' in wyliczenie ? null : wyliczenie.wynik.wynikMacierzynskiego;
  useEffect(() => {
    if (wynikDoZapisu === null) return;
    const zapis = zapiszWynikKalkulacjiSprawy(wynikDoZapisu, pobierzKontekstOperacji());
    // Wynik zapisu pochodzi z magazynu poza Reactem, więc stan błędu ustawiamy po operacji.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizacja z wynikiem operacji magazynu
    setBladZapisu(zapis.ok ? null : zapis.kod);
  }, [wynikDoZapisu]);

  if (zrodlo !== ZRODLO) return null;
  if (sprawa === undefined || !aktywny) return <Komunikat typ="INFO" tresc={T.brakSprawy} />;
  if (wyliczenie === null) {
    return wyliczenieApi.blad ? (
      <BladWyliczenia kod={wyliczenieApi.blad.kod} parametry={wyliczenieApi.blad.parametry as never} onPonow={wyliczenieApi.ponow} />
    ) : (
      <SzkieletWyliczenia />
    );
  }
  if ('kod' in wyliczenie) return <Komunikat kod={wyliczenie.kod} />;

  const { porownanie, wynik } = wyliczenie;

  return (
    <Stos odstep={6}>
      {bladZapisu === null ? null : <Komunikat kod={bladZapisu} />}
      <WyliczeniaSprawy sprawa={sprawa} wyliczenie={wynik} porownanie={porownanie} tolerancja={parametry.tolerancjaPorownaniaKwotyGrosze} />
      <Karta tytul={T.coDalej} poziomTytulu={2} bezLinii>
        <Stos odstep={4}>
          <p className="m-0 text-body">{porownanie.wynik === 'rozne' ? T.poprawOpis : gosc ? T.zapisanoGosc : T.zapisano}</p>
          <div className="flex flex-wrap gap-4">
            {porownanie.wynik === 'rozne' ? (
              <PrzyciskLink href={trasy.ViewSampleCaseData()} wariant="glowny">
                {T.poprawDane}
              </PrzyciskLink>
            ) : null}
            <PrzyciskLink href={trasy.ViewSampleCaseVerification()} wariant={porownanie.wynik === 'rozne' ? 'drugorzedny' : 'glowny'}>
              {T.wrocDoWeryfikacji}
            </PrzyciskLink>
            {porownanie.wynik === 'rozne' ? null : (
              <PrzyciskLink href={trasy.ViewSampleCaseList()} wariant="drugorzedny">
                {T.wybierzInna}
              </PrzyciskLink>
            )}
          </div>
        </Stos>
      </Karta>
    </Stos>
  );
}
