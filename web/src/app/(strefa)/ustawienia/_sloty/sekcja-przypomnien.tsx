'use client';

// Slot ViewGuideSettings „sekcja-przypomnien” w liście slotyUstawien (kontrakt, sekcja 12.4). Właściciel: u18.
// Historyjka 3.2.1.1.2 Ustawienia przypomnień, wzory cz1/P09-03 … P09-11.
// Teksty: teksty.ViewGuideSettings.sekcjaPrzypomnien.
// Błąd pola pokazuje się po opuszczeniu pola (useWalidacjaNaBiezaco), a po próbie zapisu przy każdej zmianie.
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import {
  BladPola,
  Pole,
  idBledu,
  klasyOdstepuPolaWpisu,
  klasyPolaWpisu,
  polaczOpisy,
} from '@/komponenty/pole';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przelacznik } from '@/komponenty/przelacznik';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useStanKonta, useTeraz } from '@/dane/magazyn/hooki';
import {
  wyslijKodSms,
  zapiszUstawieniaPrzypomnien,
} from '@/dane/magazyn/operacje/przypomnienia';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czyBrakAdresuDoPrzypomnien, ustawieniaSkuteczne } from '@/domena/przypomnienia/planowanie';
import {
  stanNumeruWFormularzu,
  walidujUstawieniaPrzypomnien,
  type PolaPrzypomnien,
  type PolePrzypomnien,
} from '@/domena/przypomnienia/ustawienia';
import type { BledyPol, KodKomunikatu, StanKonta } from '@/domena/typy';
import { normalizujTelefon } from '@/domena/walidacje';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewGuideSettings.sekcjaPrzypomnien;

const ID = {
  wlaczone: 'przyp-wlaczone',
  opcje: 'przyp-opcje',
  wyprzedzenie: 'przyp-wyprzedzenie',
  kanaly: 'przyp-kanaly',
  kanalEmail: 'przyp-kanal-email',
  ramkaEmail: 'przyp-ramka-email',
  email: 'przyp-email',
  kanalSms: 'przyp-kanal-sms',
  ramkaSms: 'przyp-ramka-sms',
  telefon: 'przyp-telefon',
  stanTelefonu: 'przyp-telefon-stan',
  kod: 'przyp-kod',
} as const;

// Kolejność pól na ekranie i cel fokusu pola z błędem.
const POLE_FOKUSU: Record<PolePrzypomnien, string> = {
  wyprzedzenieDni: ID.wyprzedzenie,
  kanaly: ID.kanalEmail,
  adresEmail: ID.email,
  numerTelefonu: ID.telefon,
  kodWeryfikacyjny: ID.kod,
};

function ustawFokus(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

export function SlotSekcjaPrzypomnien({ konto }: PropsSlotu<'sekcja'>) {
  const stanKonta = useStanKonta();
  // Epik obsługuje konta rodziny: Rodzica i Drugiego rodzica, do którego trafiają przypomnienia jego spraw.
  if (konto.rola !== 'rodzic' && konto.rola !== 'drugi-rodzic') return null;
  if (stanKonta === null) return null;
  // Adres e-mail z kopii Danych z konta ZUS może dotrzeć po otwarciu ekranu, więc formularz startuje od nowa.
  const emailZus = stanKonta.kopiaDanychZus?.emailEzus ?? '';
  return <SekcjaPrzypomnien key={`${stanKonta.konto.pesel}:${emailZus}`} stanKonta={stanKonta} />;
}

function SekcjaPrzypomnien({ stanKonta }: { stanKonta: StanKonta }) {
  const emailZus = stanKonta.kopiaDanychZus?.emailEzus?.trim() || undefined;
  const zapisane = stanKonta.ustawienia;
  const [poczatkowe] = useState(() => ustawieniaSkuteczne(zapisane, emailZus));

  const [wlaczone, ustawWlaczone] = useState(poczatkowe.przypomnieniaWlaczone);
  const [wyprzedzenie, ustawWyprzedzenie] = useState(String(poczatkowe.wyprzedzenieDni));
  const [kanalEmail, ustawKanalEmail] = useState(poczatkowe.kanalEmail);
  const [adresEmail, ustawAdresEmail] = useState(poczatkowe.adresEmail);
  const [kanalSms, ustawKanalSms] = useState(poczatkowe.kanalSms);
  const [numer, ustawNumer] = useState(poczatkowe.numerTelefonu);
  const [kod, ustawKod] = useState('');
  const [komunikat, ustawKomunikat] = useState<KodKomunikatu | null>(null);
  const [kodWyslanyNa, ustawKodWyslanyNa] = useState<string | null>(null);
  const teraz = useTeraz();

  const formularz: PolaPrzypomnien = {
    przypomnieniaWlaczone: wlaczone,
    wyprzedzenieDni: wyprzedzenie,
    kanalEmail,
    adresEmail,
    kanalSms,
    numerTelefonu: numer,
    kodWeryfikacyjny: kod,
  };
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: (f: PolaPrzypomnien) => walidujUstawieniaPrzypomnien(f, zapisane, teraz),
    pola: POLE_FOKUSU,
  });
  const bladKanalow = walidacja.blad('kanaly');

  const skuteczne = ustawieniaSkuteczne(zapisane, emailZus);
  const brakAdresu = czyBrakAdresuDoPrzypomnien(skuteczne);
  const stanNumeru = stanNumeruWFormularzu(zapisane, numer);
  const numerZnormalizowany = normalizujTelefon(numer);
  const numerZapisany = zapisane?.kanalSms === true && zapisane.numerTelefonu === numerZnormalizowany && numerZnormalizowany !== '';
  const czekaNaNowy = numerZapisany && zapisane?.stanNumeru === 'wymaga-potwierdzenia-nowego';
  const czekaNaPierwszy = numerZapisany && zapisane?.stanNumeru === 'niepotwierdzony';

  function wyslijKod() {
    ustawKomunikat(null);
    const wynik = wyslijKodSms(numer, pobierzKontekstOperacji());
    if (!wynik.ok) {
      const blad = wynik.bledyPol?.numerTelefonu;
      if (blad) walidacja.pokazBledy({ numerTelefonu: blad });
      else ustawKomunikat(wynik.kod);
      return;
    }
    ustawKod('');
    ustawKodWyslanyNa(wynik.wartosc.numer);
    ustawFokus(ID.kod);
  }

  function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!walidacja.sprobujWyslac()) {
      ustawKomunikat(null);
      return;
    }
    const wynik = zapiszUstawieniaPrzypomnien(formularz, pobierzKontekstOperacji());
    if (!wynik.ok) {
      if (wynik.bledyPol) {
        walidacja.pokazBledy(wynik.bledyPol as BledyPol<PolePrzypomnien>);
        ustawKomunikat(null);
      } else {
        ustawKomunikat(wynik.kod);
      }
      return;
    }
    walidacja.resetuj();
    ustawKod('');
    ustawKodWyslanyNa(null);
    if (wlaczone) ustawWyprzedzenie(String(Number(wyprzedzenie.replace(/\s/g, ''))));
    ustawKomunikat('0056');
  }

  function zmienKanalEmail(wl: boolean) {
    ustawKanalEmail(wl);
    if (wl && adresEmail.trim() === '' && emailZus) ustawAdresEmail(emailZus);
  }

  const podpowiedzEmail = !emailZus
    ? t.adresEmailBrakWKoncie
    : adresEmail.trim() === emailZus
      ? t.adresEmailZKonta
      : t.adresEmailWlasny;

  const etykietaWyslania =
    stanNumeru === 'kod-wyslany'
      ? t.wyslijNowyKod
      : czekaNaNowy
        ? t.wyslijKodNaNumer({ numer: numerZnormalizowany })
        : t.wyslijKod;

  return (
    <Karta tytul={t.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        {komunikat ? <Komunikat kod={komunikat} /> : null}
        {brakAdresu ? <Komunikat kod="0218" /> : null}
        <p className="m-0 text-body">{t.wstep}</p>
        <form className="flex flex-col gap-6" noValidate onSubmit={zapisz} aria-label={t.tytul}>
          <Przelacznik
            id={ID.wlaczone}
            nazwa="przypomnienia"
            etykieta={t.wlacz}
            wlaczony={wlaczone}
            onZmiana={ustawWlaczone}
            steruje={wlaczone ? ID.opcje : undefined}
            opis={
              wlaczone ? undefined : (
                <p className="m-0 text-body">
                  {t.wylaczone.przed}{' '}
                  <Link href={trasy.ViewDeadlines()} className="text-brand underline hover:text-brand-deep">
                    {t.wylaczone.link}
                  </Link>
                  {t.wylaczone.po}
                </p>
              )
            }
          />

          {wlaczone ? (
            <div id={ID.opcje} className="flex flex-col gap-6">
              <PoleTekstowe
                id={ID.wyprzedzenie}
                nazwa="wyprzedzenie"
                etykieta={t.wyprzedzenie}
                podpowiedz={<p className="m-0 text-body">{t.wyprzedzeniePodpowiedz}</p>}
                wartosc={wyprzedzenie}
                onZmiana={ustawWyprzedzenie}
                inputMode="numeric"
                szerokosc="waska"
                {...walidacja.pole('wyprzedzenieDni')}
              />

              <fieldset
                className="m-0 min-w-0 border-0 p-0"
                aria-describedby={polaczOpisy(`${ID.kanaly}-podpowiedz`, bladKanalow ? idBledu(ID.kanaly) : null)}
              >
                <legend className="m-0 p-0 text-body-strong text-ink">{t.kanaly}</legend>
                <p id={`${ID.kanaly}-podpowiedz`} className="mt-1 mb-4 text-body">
                  {t.kanalyPodpowiedz}
                </p>
                <div className="flex flex-col gap-5">
                  <div className="min-w-0">
                    <Przelacznik
                      id={ID.kanalEmail}
                      nazwa="kanal-email"
                      etykieta={t.email}
                      wlaczony={kanalEmail}
                      onZmiana={zmienKanalEmail}
                      onOpuszczenie={() => walidacja.onOpuszczenie('kanaly')}
                      steruje={kanalEmail ? ID.ramkaEmail : undefined}
                      opis={kanalEmail ? undefined : <p className="m-0 text-body">{t.emailWylaczonyPodpowiedz}</p>}
                    />
                    {kanalEmail ? (
                      <div id={ID.ramkaEmail} className="mt-3 ml-8 min-w-0">
                        <PoleTekstowe
                          id={ID.email}
                          nazwa="email"
                          typ="email"
                          autoComplete="email"
                          etykieta={t.adresEmail}
                          podpowiedz={<p className="m-0 text-body">{podpowiedzEmail}</p>}
                          wartosc={adresEmail}
                          onZmiana={ustawAdresEmail}
                          {...walidacja.pole('adresEmail')}
                          className="max-w-105"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <Przelacznik
                      id={ID.kanalSms}
                      nazwa="kanal-sms"
                      etykieta={t.sms}
                      wlaczony={kanalSms}
                      onZmiana={ustawKanalSms}
                      onOpuszczenie={() => walidacja.onOpuszczenie('kanaly')}
                      steruje={kanalSms ? ID.ramkaSms : undefined}
                      opis={kanalSms ? undefined : <p className="m-0 text-body">{t.smsWylaczonyPodpowiedz}</p>}
                    />
                    {kanalSms ? (
                      <div id={ID.ramkaSms} className="mt-3 ml-8 flex min-w-0 flex-col gap-4">
                        <Pole
                          id={ID.telefon}
                          etykieta={t.numerTelefonu}
                          podpowiedz={
                            <p className="m-0 text-body">
                              {stanNumeru === 'potwierdzony' ? t.numerPotwierdzonyPodpowiedz : t.numerPodpowiedz}
                            </p>
                          }
                          blad={walidacja.blad('numerTelefonu')}
                        >
                          {(aria) => (
                            <>
                              <div className="flex min-w-0 flex-wrap items-start gap-3">
                                <input
                                  {...aria}
                                  aria-describedby={polaczOpisy(
                                    aria['aria-describedby'],
                                    stanNumeru === 'potwierdzony' || czekaNaNowy || czekaNaPierwszy ? ID.stanTelefonu : null,
                                  )}
                                  name="telefon"
                                  type="tel"
                                  autoComplete="tel"
                                  value={numer}
                                  onChange={(e) => ustawNumer(e.target.value)}
                                  onBlur={() => walidacja.onOpuszczenie('numerTelefonu')}
                                  className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu} max-w-60 flex-1`}
                                />
                                {stanNumeru === 'potwierdzony' ? null : (
                                  <Przycisk wariant="drugorzedny" type="button" onClick={wyslijKod}>
                                    {etykietaWyslania}
                                  </Przycisk>
                                )}
                              </div>
                              {stanNumeru === 'potwierdzony' ? (
                                <p id={ID.stanTelefonu} className="m-0 flex items-start gap-2 font-semibold text-ink-strong">
                                  <Ikona nazwa="sukces" rozmiar={20} className="mt-0.5 text-success" />
                                  <span className="min-w-0">{t.numerPotwierdzony}</span>
                                </p>
                              ) : czekaNaNowy || czekaNaPierwszy ? (
                                <p id={ID.stanTelefonu} className="m-0 flex items-start gap-2 font-semibold text-ink-strong">
                                  <Ikona nazwa="uwaga" rozmiar={20} className="mt-0.5 text-brand" />
                                  <span className="min-w-0">{czekaNaNowy ? t.nowyNumerCzeka : t.numerCzeka}</span>
                                </p>
                              ) : null}
                            </>
                          )}
                        </Pole>

                        {stanNumeru === 'kod-wyslany' && kodWyslanyNa !== null ? (
                          <Komunikat kod="0215" parametry={{ numerTelefonu: kodWyslanyNa }} />
                        ) : null}

                        {stanNumeru === 'kod-wyslany' ? (
                          <PoleTekstowe
                            id={ID.kod}
                            nazwa="kod"
                            etykieta={t.kod}
                            podpowiedz={<p className="m-0 text-body">{t.kodPodpowiedz}</p>}
                            wartosc={kod}
                            onZmiana={ustawKod}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            szerokosc="waska"
                            {...walidacja.pole('kodWeryfikacyjny')}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
                {bladKanalow ? <BladPola id={idBledu(ID.kanaly)} kod={bladKanalow} className="mt-4" /> : null}
              </fieldset>
            </div>
          ) : null}

          <div>
            <Przycisk wariant="glowny" type="submit">
              {t.zapisz}
            </Przycisk>
          </div>
        </form>
      </div>
    </Karta>
  );
}
