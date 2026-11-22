'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { KartaKontekstu, grupyKontekstu } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { wyslijPytanieDoZus } from '@/dane/magazyn/operacje/kanaly-zus-usc';
import { zapiszStanSesji } from '@/dane/magazyn/operacje/sesja';
import { useDzis, useKatalog, useKonto, useRodzina, useStanSesji } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { MAKS_DLUGOSC_PYTANIA, dlugoscTresciPytania, walidujTrescPytania, zbudujKontekstPytania } from '@/domena/pytania-zus';
import type { KodKomunikatu } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Pole, klasyRamkiPolaWpisu } from '@/komponenty/pole';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos, UkladDwuKolumnowy, Wiersz } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useZakladkaWAdresie } from '@/komponenty/zakladki';
import { teksty } from '@/teksty';

const t = teksty.ViewZusQuestion;
const ID_POLA = 'tresc-pytania';
const ID_LICZNIKA = `${ID_POLA}-licznik`;

function walidujPytanie(w: { tresc: string }) {
  return { tresc: walidujTrescPytania(w.tresc) };
}

export function WidokPytaniaDoZus() {
  const parametry = useSearchParams();
  const konto = useKonto();
  const rodzina = useRodzina();
  const katalog = useKatalog();
  const stanSesji = useStanSesji();
  const dzis = useDzis();

  const zAsystenta = parametry.get('z') === 'asystent';
  const idSprawyZAdresu = parametry.get('sprawa') ?? undefined;

  const kontekst = useMemo(
    () =>
      zbudujKontekstPytania({
        ...(idSprawyZAdresu ? { idSprawy: idSprawyZAdresu } : {}),
        pesel: konto?.pesel ?? '',
        daneRodziny: rodzina?.daneRodziny ?? null,
        daneCiazy: rodzina?.daneCiazy ?? null,
        plan: rodzina?.plan ?? null,
        kalendarz: rodzina?.kalendarz ?? null,
        katalog,
      }),
    [idSprawyZAdresu, konto?.pesel, rodzina, katalog],
  );
  const sprawa = kontekst.sprawa;
  // Grupy danych kontekstu w zakładkach karty bocznej; wybrana zakładka w ?zakladka=.
  const [zakladka, wybierzZakladke] = useZakladkaWAdresie(grupyKontekstu(kontekst));

  const [tresc, setTresc] = useState('');
  // Komunikat błędu wysyłki jest chwilowy: po powrocie na trasę widok zaczyna bez niego.
  const [bladWysylki, setBladWysylki] = useStanChwilowy<KodKomunikatu | null>(null);
  const { zajety: wysylanie, ustawZajety: ustawWysylanie, przejdz } = useNawigacjaZLadowaniem();
  const wartosci = useMemo(() => ({ tresc }), [tresc]);
  const walidacja = useWalidacjaNaBiezaco({ wartosci, waliduj: walidujPytanie, pola: { tresc: ID_POLA } });
  const bladPola = walidacja.blad('tresc');

  const adresInstrukcji = sprawa ? trasy.ViewCaseGuide({ idSprawy: sprawa.idSprawy }) : null;
  const adresPowrotu = adresInstrukcji ?? trasy.ViewFamilyPlan();
  const etykietaPowrotu = adresInstrukcji ? t.powrotInstrukcja : zAsystenta ? t.powrotAsystent : t.powrotPlan;

  const otworzAsystenta = () => {
    if (!stanSesji) return;
    zapiszStanSesji({ panelAsystenta: { ...stanSesji.panelAsystenta, otwarty: true } }, pobierzKontekstOperacji());
  };

  const wyslij = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (wysylanie) return;
    if (!walidacja.sprobujWyslac()) {
      setBladWysylki(null);
      return;
    }
    ustawWysylanie(true);
    const wynik = await wyslijPytanieDoZus({ ...(sprawa ? { idSprawy: sprawa.idSprawy } : {}), tresc }, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawWysylanie(false);
      if (wynik.kod === '0129' || wynik.kod === '0130') {
        walidacja.pokazBledy({ tresc: wynik.kod });
      } else {
        setBladWysylki(wynik.kod);
      }
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0131', dlaWidoku: 'ViewZusQuestionSent' });
    przejdz(trasy.ViewZusQuestionSent({ idPytania: wynik.wartosc.idPytania }));
  };

  const formularz = (
    <Karta tytul={t.kartaPytania} bezLinii>
      <form noValidate onSubmit={(e) => void wyslij(e)}>
        <Stos odstep={6}>
          <Pole
            id={ID_POLA}
            etykieta={t.etykietaTresci}
            podpowiedz={t.podpowiedzTresci}
            blad={bladPola}
            dodatek={
              <p id={ID_LICZNIKA} aria-live="polite" className="m-0 text-body text-ink">
                {t.licznik({ liczba: String(dlugoscTresciPytania(tresc)), maks: String(MAKS_DLUGOSC_PYTANIA) })}
              </p>
            }
          >
            {(aria) => (
              <textarea
                {...aria}
                aria-describedby={[aria['aria-describedby'], ID_LICZNIKA].filter(Boolean).join(' ')}
                name={ID_POLA}
                rows={8}
                value={tresc}
                onChange={(e) => setTresc(e.target.value)}
                onBlur={() => walidacja.onOpuszczenie('tresc')}
                className={`${klasyRamkiPolaWpisu} min-h-control resize-y px-3 py-2.5 focus:px-[0.6875rem] focus:py-[0.5625rem]`}
              />
            )}
          </Pole>
          <Notatka>
            <p className="m-0">{t.notatkaWysylki}</p>
          </Notatka>
          <Wiersz>
            <Przycisk type="submit" wariant="glowny" zajety={wysylanie}>
              {t.wyslij}
            </Przycisk>
            {zAsystenta && !adresInstrukcji ? (
              <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny" onClick={otworzAsystenta}>
                {t.wrocDoAsystenta}
              </PrzyciskLink>
            ) : (
              <PrzyciskLink href={adresPowrotu} wariant="drugorzedny">
                {adresInstrukcji ? t.wrocDoInstrukcji : t.wrocDoPlanu}
              </PrzyciskLink>
            )}
          </Wiersz>
        </Stos>
      </form>
    </Karta>
  );

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        wstep={sprawa ? t.wstepSprawy({ tytul: sprawa.tytul }) : t.wstepOgolny}
        powrot={{ href: adresPowrotu, etykieta: etykietaPowrotu }}
      />
      <Stos odstep={7.5}>
        {bladWysylki ? <Komunikat kod={bladWysylki} /> : null}
        <UkladDwuKolumnowy
          tresc={formularz}
          boczna={
            <KartaKontekstu
              kontekst={kontekst}
              tytul={t.kartaKontekstu}
              stanNa={teksty.wspolne.stanNa({ data: formatujDate(dzis) })}
              notatka={sprawa ? t.notatkaKontekstu : t.notatkaOgolna}
              zakladki={{ wybrana: zakladka, onWybor: wybierzZakladke }}
            />
          }
        />
      </Stos>
    </>
  );
}
