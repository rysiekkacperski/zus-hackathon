'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { KartaKontekstu } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
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
import { Notatka } from '@/komponenty/notatka';
import { Pole, klasyRamkiPolaWpisu } from '@/komponenty/pole';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos, UkladDwuKolumnowy, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewZusQuestion;
const ID_POLA = 'tresc-pytania';
const ID_LICZNIKA = `${ID_POLA}-licznik`;

export function WidokPytaniaDoZus() {
  const router = useRouter();
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

  const [tresc, setTresc] = useState('');
  const [bladPola, setBladPola] = useState<KodKomunikatu | null>(null);
  const [bladWysylki, setBladWysylki] = useState<KodKomunikatu | null>(null);
  const [wysylanie, setWysylanie] = useState(false);
  const pole = useRef<HTMLTextAreaElement>(null);

  const adresInstrukcji = sprawa ? trasy.ViewCaseGuide({ idSprawy: sprawa.idSprawy }) : null;
  const adresPowrotu = adresInstrukcji ?? trasy.ViewFamilyPlan();
  const etykietaPowrotu = adresInstrukcji ? t.powrotInstrukcja : zAsystenta ? t.powrotAsystent : t.powrotPlan;

  const otworzAsystenta = () => {
    if (!stanSesji) return;
    zapiszStanSesji({ panelAsystenta: { ...stanSesji.panelAsystenta, otwarty: true } }, pobierzKontekstOperacji());
  };

  const wyslij = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (wysylanie) return;
    const kod = walidujTrescPytania(tresc);
    setBladPola(kod);
    if (kod) {
      setBladWysylki(null);
      pole.current?.focus();
      return;
    }
    setWysylanie(true);
    const wynik = wyslijPytanieDoZus({ ...(sprawa ? { idSprawy: sprawa.idSprawy } : {}), tresc }, pobierzKontekstOperacji());
    setWysylanie(false);
    if (!wynik.ok) {
      if (wynik.kod === '0129' || wynik.kod === '0130') {
        setBladPola(wynik.kod);
        pole.current?.focus();
      } else {
        setBladWysylki(wynik.kod);
      }
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0131', dlaWidoku: 'ViewZusQuestionSent' });
    router.push(trasy.ViewZusQuestionSent({ idPytania: wynik.wartosc.idPytania }));
  };

  const formularz = (
    <Karta tytul={t.kartaPytania} bezLinii>
      <form noValidate onSubmit={wyslij}>
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
                ref={pole}
                aria-describedby={[aria['aria-describedby'], ID_LICZNIKA].filter(Boolean).join(' ')}
                name={ID_POLA}
                rows={8}
                value={tresc}
                onChange={(e) => setTresc(e.target.value)}
                className={`${klasyRamkiPolaWpisu} min-h-control resize-y px-3 py-2.5 focus:px-[11px] focus:py-[9px]`}
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
            />
          }
        />
      </Stos>
    </>
  );
}
