'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { formatujDate, parsujDate, porownajDaty } from '@/domena/daty';
import type { BledyPol, KodKomunikatu, LiczbaDzieci, Wniosek, WniosekZam } from '@/domena/typy';
import {
  walidujPlikZaswiadczenia,
  walidujPoczatekZasilku,
  wymiarMacierzynskiegoTygodni,
  zakresDniaPoczatku,
  type PolePoczatkuZasilku,
} from '@/domena/wnioski/zam-przed-porodem';
import { useDzis, useKatalog, useRodzina } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszPoczatekZasilkuZam } from '@/dane/magazyn/operacje/wnioski-zam-rozszerzenia';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';
import { KartaKrokowZam } from './_czesci/karta-krokow';
import { PoleZaswiadczenia } from './_czesci/pole-zaswiadczenia';

const t = teksty.ViewZamPrebirth;
const ID_DNIA = 'zam-dzien-poczatku';
const ID_PLIKU = 'zam-zaswiadczenie';

function czyZam(w: Wniosek): w is WniosekZam {
  return w.rodzaj === 'zam';
}

export function WidokPoczatkuZasilkuZam() {
  const parametry = useSearchParams();
  const idWniosku = parametry.get('wniosek');
  const rodzina = useRodzina();
  const wniosek = rodzina?.wnioski.find((w): w is WniosekZam => czyZam(w) && w.idWniosku === idWniosku) ?? null;
  const ptp = rodzina?.daneCiazy?.przewidywanyTerminPorodu ?? wniosek?.przedPorodem?.przewidywanyTerminPorodu;

  if (rodzina === null || wniosek === null || !ptp) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={{ href: trasy.ViewFamilyPlan(), etykieta: teksty.ViewZamForPayer.powrot }} />
        <StanPusty
          ikona="plik"
          rolaStatus
          akcja={
            <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
              {t.przejdzDoPlanu}
            </PrzyciskLink>
          }
        >
          {wniosek === null ? t.brakWniosku : t.brakTerminu}
        </StanPusty>
      </>
    );
  }

  return <FormularzPoczatkuZasilku key={wniosek.idWniosku} wniosek={wniosek} ptp={ptp} />;
}

function FormularzPoczatkuZasilku({ wniosek, ptp }: { wniosek: WniosekZam; ptp: string }) {
  const router = useRouter();
  const rodzina = useRodzina();
  const katalog = useKatalog();
  const dzis = useDzis();

  const daneCiazy = rodzina?.daneCiazy ?? null;
  const liczbaDzieci: LiczbaDzieci = daneCiazy?.liczbaDzieciZCiazy ?? wniosek.przedPorodem?.liczbaDzieci ?? 1;
  const matka = rodzina?.daneRodziny.matka;
  const forma = matka?.formaZatrudnienia?.wartosc;
  const platnik = matka?.platnikZasilku?.wartosc;
  const wymagaZaswiadczenia = platnik === 'zus';
  const zakres = zakresDniaPoczatku(ptp, dzis);
  const zapisanyDzien = wniosek.przedPorodem?.dzienPoczatkuZasilku;
  const tygodnie = wymiarMacierzynskiegoTygodni(liczbaDzieci, katalog, zapisanyDzien ?? zakres.od);

  const [dzienTekst, ustawDzienTekst] = useState(zapisanyDzien ? formatujDate(zapisanyDzien) : '');
  const [nowyPlik, ustawNowyPlik] = useState<File | null>(null);
  const [usunietoZapisany, ustawUsunietoZapisany] = useState(false);
  const [bledy, ustawBledy] = useState<BledyPol<PolePoczatkuZasilku>>({});
  const [bladOgolny, ustawBladOgolny] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  const zapisanyPlik = usunietoZapisany ? undefined : wniosek.przedPorodem?.zaswiadczenie?.plik;
  const plikDoPokazania = nowyPlik
    ? { nazwa: nowyPlik.name, typ: nowyPlik.type, rozmiar: nowyPlik.size }
    : zapisanyPlik
      ? { nazwa: zapisanyPlik.nazwa, typ: zapisanyPlik.typ, rozmiar: zapisanyPlik.rozmiar }
      : null;

  const hrefRodzaju = trasy.ViewZamLeaveType({ wniosek: wniosek.idWniosku });
  const kroki = t.kroki.nazwy.map((nazwa, i) => ({ nazwa, ...(i === 0 ? { href: hrefRodzaju } : {}) }));

  function wybierzPlik(plik: File) {
    const blad = walidujPlikZaswiadczenia({ nazwa: plik.name, typ: plik.type, rozmiar: plik.size });
    if (blad) {
      ustawBledy((b) => ({ ...b, zaswiadczenie: blad }));
      return;
    }
    ustawNowyPlik(plik);
    ustawBledy((b) => ({ ...b, zaswiadczenie: undefined }));
  }

  function usunPlik() {
    if (nowyPlik) ustawNowyPlik(null);
    else ustawUsunietoZapisany(true);
    window.setTimeout(() => document.getElementById(ID_PLIKU)?.focus(), 0);
  }

  async function zapisz(dzien: string | null) {
    const ctx = pobierzKontekstOperacji();
    return zapiszPoczatekZasilkuZam(
      wniosek.idWniosku,
      {
        dzienPoczatkuZasilku: dzien,
        przewidywanyTerminPorodu: ptp,
        liczbaDzieci,
        ...(wymagaZaswiadczenia && nowyPlik ? { plik: nowyPlik } : {}),
        ...(usunietoZapisany && !nowyPlik ? { usunZaswiadczenie: true } : {}),
      },
      'ViewZamPrebirth',
      ctx,
    );
  }

  /** Dzień z pola, gdy to poprawna data z zakresu; inaczej null (zapis bez zmiany dnia). */
  function dzienDoZapisu(): string | null {
    const data = parsujDate(dzienTekst);
    if (data === null) return null;
    return porownajDaty(data, zakres.od) >= 0 && porownajDaty(data, zakres.do) <= 0 ? data : null;
  }

  async function dalej(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (zajety) return;
    const wynik = walidujPoczatekZasilku(
      { dzienPoczatku: dzienTekst, wymagaZaswiadczenia, maZaswiadczenie: plikDoPokazania !== null },
      ptp,
      dzis,
    );
    ustawBledy(wynik.bledy);
    ustawBladOgolny(null);
    if (wynik.bledy.dzienPoczatku || wynik.bledy.zaswiadczenie || !wynik.dzien) {
      const pierwsze = wynik.bledy.dzienPoczatku ? ID_DNIA : ID_PLIKU;
      window.setTimeout(() => document.getElementById(pierwsze)?.focus(), 0);
      return;
    }
    ustawZajety(true);
    const zapis = await zapisz(wynik.dzien);
    ustawZajety(false);
    if (!zapis.ok) {
      ustawBladOgolny(zapis.kod);
      return;
    }
    router.push(trasy.ViewZamPeriod({ wniosek: wniosek.idWniosku }));
  }

  async function zapiszIDokonczPozniej() {
    if (zajety) return;
    ustawZajety(true);
    const zapis = await zapisz(dzienDoZapisu());
    ustawZajety(false);
    if (!zapis.ok) {
      ustawBladOgolny(zapis.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
    router.push(trasy.ViewCaseGuide({ idSprawy: wniosek.idSprawy }));
  }

  async function zmienTermin() {
    if (zajety) return;
    ustawZajety(true);
    const zapis = await zapisz(dzienDoZapisu());
    ustawZajety(false);
    if (!zapis.ok) {
      ustawBladOgolny(zapis.kod);
      return;
    }
    router.push(`${trasy.ViewProfileSummary({ tryb: 'rodzina' })}#dane-ciazy`);
  }

  const tresc = (
    <form noValidate onSubmit={dalej} className="flex min-w-0 flex-col gap-7.5">
      {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
      <Karta tytul={t.termin.tytul} bezLinii>
        <p className="m-0 mb-3">{t.termin.stanNa({ data: formatujDate(dzis) })}</p>
        <dl className="m-0 flex flex-wrap gap-x-7.5 gap-y-4 rounded-sm bg-surface-page px-5 py-4">
          <div>
            <dt className="text-body-strong">{t.termin.etykietaTerminu}</dt>
            <dd className="m-0 text-ink-strong">{formatujDate(ptp)}</dd>
          </div>
          <div>
            <dt className="text-body-strong">{t.termin.etykietaLiczby}</dt>
            <dd className="m-0 text-ink-strong">{liczbaDzieci}</dd>
          </div>
        </dl>
        <p className="m-0 mt-4 mb-3">{t.termin.zmianaOpis}</p>
        <button
          type="button"
          onClick={zmienTermin}
          className="cursor-pointer border-0 bg-transparent p-0 text-left text-body text-brand underline hover:text-brand-deep"
        >
          {t.termin.zmianaAkcja}
        </button>
      </Karta>

      <Karta tytul={t.poczatek.tytul} bezLinii>
        <PoleDaty
          id={ID_DNIA}
          etykieta={t.poczatek.etykieta}
          podpowiedz={t.poczatek.podpowiedz({ od: formatujDate(zakres.od), do_: formatujDate(zakres.do) })}
          wartosc={dzienTekst}
          onZmiana={ustawDzienTekst}
          blad={bledy.dzienPoczatku ?? null}
          szerokosc="waska"
          autoComplete="off"
        />
        <Notatka className="mt-4">{t.poczatek.notatka({ tygodnie: String(tygodnie) })}</Notatka>
      </Karta>

      {wymagaZaswiadczenia ? (
        <Karta tytul={t.zaswiadczenie.tytul} bezLinii>
          <p className="m-0 mb-4">{t.zaswiadczenie.opis}</p>
          <PoleZaswiadczenia
            id={ID_PLIKU}
            plik={plikDoPokazania}
            blad={bledy.zaswiadczenie ?? null}
            onWybor={wybierzPlik}
            onUsun={usunPlik}
          />
        </Karta>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PrzyciskLink href={hrefRodzaju} wariant="drugorzedny">
          {t.przyciski.wstecz}
        </PrzyciskLink>
        <div className="flex flex-wrap gap-4">
          <Przycisk type="button" wariant="tlo" ikona="zapisz" onClick={zapiszIDokonczPozniej} zajety={zajety}>
            {t.przyciski.zapiszDoDokonczenia}
          </Przycisk>
          <Przycisk type="submit" wariant="glowny" zajety={zajety}>
            {t.przyciski.dalej}
          </Przycisk>
        </div>
      </div>
    </form>
  );

  const boczna = (
    <>
      <Karta tytul={t.boczna.twojWniosek} bezLinii>
        <dl className="m-0 grid gap-4">
          <div>
            <dt className="text-body-strong">{t.boczna.rodzajUrlopu}</dt>
            <dd className="m-0">{t.boczna.rodzajUrlopuWartosc}</dd>
          </div>
          {forma ? (
            <div>
              <dt className="text-body-strong">{t.boczna.forma}</dt>
              <dd className="m-0">
                {matka?.dobrowolneChorobowe?.wartosc && forma !== 'umowa-o-prace'
                  ? t.boczna.formaZDobrowolnym({ forma: t.formy[forma] })
                  : t.formy[forma]}
              </dd>
            </div>
          ) : null}
          {platnik ? (
            <div>
              <dt className="text-body-strong">{t.boczna.platnik}</dt>
              <dd className="m-0">{t.platnicy[platnik]}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6">
          <Odnosnik href={hrefRodzaju}>{t.boczna.zmienRodzaj}</Odnosnik>
        </div>
      </Karta>
      <Karta tytul={t.boczna.jesliWczesniejTytul} bezLinii>
        <p className="m-0">{t.boczna.jesliWczesniejTresc}</p>
      </Karta>
    </>
  );

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        powrot={{ href: trasy.ViewCaseGuide({ idSprawy: wniosek.idSprawy }), etykieta: t.powrot }}
      />
      <div className="flex flex-col gap-7.5">
        <KartaKrokowZam kroki={kroki} biezacy={2} id="zam-kroki" />
        <UkladDwuKolumnowy tresc={tresc} boczna={boczna} etykietaBocznej={t.boczna.etykieta} />
      </div>
    </>
  );
}
