'use client';

// Wspólne części kreatora ZAS-53: odczyt szkicu z adresu, postęp kroków, panel „Twój wniosek”, akcje kroku.
import { useSearchParams } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { dodajDni, formatujDate, liczbaDniWlacznie } from '@/domena/daty';
import type { DaneZKontaZus, IdWidoku, KontoPrzewodnika, StanRodziny, Ustawienia, WniosekZas53 } from '@/domena/typy';
import { PYTANIA_Z10 } from '@/domena/wnioski/z10';
import { czyPoUstaniu, czyStawkaPelna, ekranyZas53 } from '@/domena/wnioski/zas53';
import { useKatalog, useKonto, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { adresCzesci } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { liczbaKrokow, numerKroku, type KrokZCzesciami } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Postep } from '@/komponenty/postep';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { teksty } from '@/teksty';

const t = teksty.ViewZas53Start.kreator;

export interface KontekstKreatoraZas53 {
  wniosek: WniosekZas53;
  rodzina: StanRodziny;
  konto: KontoPrzewodnika;
  kopia: DaneZKontaZus | null;
  ustawienia: Ustawienia | null;
}

/** Szkic wniosku z parametru `?wniosek=` w rodzinie zalogowanego konta. */
export function useWniosekZas53(): KontekstKreatoraZas53 | null {
  const parametry = useSearchParams();
  const id = parametry.get('wniosek');
  const rodzina = useRodzina();
  const konto = useKonto();
  const stanKonta = useStanKonta();
  useKatalog();
  return useMemo(() => {
    if (!rodzina || !konto || !id) return null;
    const wniosek = rodzina.wnioski.find((w): w is WniosekZas53 => w.idWniosku === id && w.rodzaj === 'zas-53');
    if (!wniosek || wniosek.konto !== konto.pesel) return null;
    return { wniosek, rodzina, konto, kopia: stanKonta?.kopiaDanychZus ?? null, ustawienia: stanKonta?.ustawienia ?? null };
  }, [rodzina, konto, id, stanKonta]);
}

/** Adres ekranu kreatora dla szkicu. */
export function adresEkranuZas53(ekran: IdWidoku, idWniosku: string): string {
  switch (ekran) {
    case 'ViewZas53AfterInsurance':
      return trasy.ViewZas53AfterInsurance({ wniosek: idWniosku });
    case 'ViewZas53Data':
      return trasy.ViewZas53Data({ wniosek: idWniosku });
    case 'ViewZas53Summary':
      return trasy.ViewZas53Summary({ wniosek: idWniosku });
    case 'ViewZas53Sent':
      return trasy.ViewZas53Sent({ wniosek: idWniosku });
    default:
      return trasy.ViewZas53Certificate({ wniosek: idWniosku });
  }
}

/** Liczba części ekranu kreatora: Z-10 ma jedno pytanie na część, dane mają część dokumentu tylko przy wypadku. */
export function liczbaCzesciEkranuZas53(ekran: IdWidoku, wypadek: boolean): number {
  if (ekran === 'ViewZas53AfterInsurance') return PYTANIA_Z10.length;
  if (ekran === 'ViewZas53Data') return wypadek ? 4 : 3;
  return 1;
}

/** Kroki kreatora z liczbą części do „Krok X z N”. */
export function krokiZas53(poUstaniu: boolean, wypadek: boolean): KrokZCzesciami<IdWidoku>[] {
  return ekranyZas53(poUstaniu).map((id) => ({ id, czesci: liczbaCzesciEkranuZas53(id, wypadek) }));
}

/** Adres ostatniej części ekranu, np. powrót Wstecz z następnego ekranu. */
export function adresOstatniejCzesciZas53(ekran: IdWidoku, idWniosku: string, wypadek: boolean): string {
  return adresCzesci(adresEkranuZas53(ekran, idWniosku), liczbaCzesciEkranuZas53(ekran, wypadek));
}

/** Ekran przed bieżącym w kolejności kreatora (Wstecz); pierwszy ekran wraca do sprawy K24. */
export function poprzedniEkranZas53(ekran: IdWidoku, poUstaniu: boolean): IdWidoku | null {
  const ekrany = ekranyZas53(poUstaniu);
  const i = ekrany.indexOf(ekran);
  return i > 0 ? ekrany[i - 1] : null;
}

export function nastepnyEkranZas53(ekran: IdWidoku, poUstaniu: boolean): IdWidoku {
  const ekrany = ekranyZas53(poUstaniu);
  const i = ekrany.indexOf(ekran);
  return ekrany[i + 1] ?? 'ViewZas53Sent';
}

export function NaglowekKreatoraZas53() {
  return (
    <NaglowekStrony
      tytul={teksty.ViewZas53Start.naglowek}
      powrot={{ href: trasy.ViewCaseDetails({ idSprawy: 'K24' }), etykieta: teksty.ViewZas53Start.powrot }}
    />
  );
}

/** Karta postępu: „Krok X z N”, pasek i lista kroków z odnośnikami do kroków zakończonych; części liczą się jako kroki. */
export function PostepZas53({
  ekran,
  poUstaniu,
  idWniosku,
  czesc = 1,
  wypadek = false,
}: {
  ekran: IdWidoku;
  poUstaniu: boolean;
  idWniosku?: string;
  czesc?: number;
  wypadek?: boolean;
}) {
  const kroki = krokiZas53(poUstaniu, wypadek);
  const ekrany = kroki.map((k) => k.id);
  const indeks = Math.max(0, ekrany.indexOf(ekran));
  const liczba = liczbaKrokow(kroki);
  const numer = numerKroku(kroki, ekrany[indeks], czesc);
  const nazwa = (e: IdWidoku) => t.kroki[e as keyof typeof t.kroki];
  const idTytulu = 'postep-zas53-tytul';
  return (
    <section aria-labelledby={idTytulu} className="rounded-md border border-line bg-surface-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={idTytulu} className="m-0 text-body-strong text-ink-strong">
          {t.krok({ krok: numer, liczbaKrokow: liczba, nazwa: nazwa(ekran) })}
        </h2>
        <p className="m-0 text-small">{t.zapisujemy}</p>
      </div>
      <Postep
        className="mt-3"
        wartosc={numer}
        min={0}
        maks={liczba}
        etykieta={t.postep({ krok: numer, liczbaKrokow: liczba })}
        idEtykiety={idTytulu}
      />
      <ol aria-label={t.listaKrokow} className="m-0 mt-3 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small">
        {kroki.map((k, i) => {
          const od = numerKroku(kroki, k.id, 1);
          const etykieta =
            (k.czesci ?? 1) > 1
              ? t.zakresKrokow({ od, do: od + (k.czesci ?? 1) - 1, nazwa: nazwa(k.id) })
              : t.numerKroku({ numer: od, nazwa: nazwa(k.id) });
          if (i === indeks) {
            return (
              <li key={k.id} aria-current="step" className="font-semibold text-ink-strong">
                {etykieta}
              </li>
            );
          }
          return (
            <li key={k.id}>
              {i < indeks && idWniosku ? <Odnosnik href={adresEkranuZas53(k.id, idWniosku)}>{etykieta}</Odnosnik> : etykieta}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Akcje kroku: Wstecz po lewej, Zapisz do dokończenia i Dalej (albo akcja główna) po prawej. */
export function AkcjeKreatoraZas53({
  wstecz,
  onWstecz,
  onZapisz,
  onDalej,
  etykietaDalej = t.dalej,
  dalejWylaczone,
  zajety,
  opisDalej,
}: {
  /** Adres Wstecz albo obsługa Wstecz (powrót do poprzedniej części kroku). */
  wstecz?: string;
  onWstecz?: () => void;
  onZapisz: () => void;
  onDalej: () => void;
  etykietaDalej?: string;
  dalejWylaczone?: boolean;
  zajety?: boolean;
  opisDalej?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {onWstecz ? (
        <Przycisk type="button" wariant="drugorzedny" onClick={onWstecz} disabled={zajety}>
          {t.wstecz}
        </Przycisk>
      ) : wstecz ? (
        <PrzyciskLink href={wstecz} wariant="drugorzedny">
          {t.wstecz}
        </PrzyciskLink>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap gap-4">
        <Przycisk type="button" wariant="tlo" onClick={onZapisz} disabled={zajety}>
          {t.zapiszDoDokonczenia}
        </Przycisk>
        <Przycisk
          type="button"
          wariant="glowny"
          onClick={onDalej}
          disabled={dalejWylaczone}
          zajety={zajety}
          aria-describedby={opisDalej}
        >
          {etykietaDalej}
        </Przycisk>
      </div>
    </div>
  );
}

/** Zwarta lista etykiet i wartości do wąskiej kolumny bocznej: etykieta nad wartością. */
export function DaneWKolumnieBocznej({ pozycje, className }: { pozycje: { etykieta: string; wartosc: ReactNode }[]; className?: string }) {
  return (
    <dl className={['m-0 flex flex-col gap-3', className].filter(Boolean).join(' ')}>
      {pozycje.map((p) => (
        <div key={p.etykieta} className="min-w-0">
          <dt className="text-body-strong">{p.etykieta}</dt>
          <dd className="m-0 break-words text-ink-strong">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Opis zaświadczenia w panelu „Twój wniosek”. */
export function opisZaswiadczenia(w: WniosekZas53): string {
  const z = w.zaswiadczenie;
  if (!z) return '';
  const numer = z.seriaINumer || t.bezNumeru;
  if (z.zrodlo === 'tryb-alternatywny') return t.zaswiadczenieAlternatywne({ numer });
  return z.kodyLiterowe.length > 0 ? t.zaswiadczenieKod({ numer, kody: z.kodyLiterowe.join(' i ') }) : t.zaswiadczenieBezKodu({ numer });
}

/** Panel boczny „Twój wniosek” z danymi zaświadczenia i prawa do zasiłku. */
export function PanelWnioskuZas53({ wniosek, dodatek }: { wniosek: WniosekZas53; dodatek?: ReactNode }) {
  const z = wniosek.zaswiadczenie;
  const pozycje = [];
  if (z) {
    pozycje.push({ etykieta: t.zaswiadczenie, wartosc: opisZaswiadczenia(wniosek) });
    pozycje.push({
      etykieta: t.okresNiezdolnosci,
      wartosc: t.okresZDniami({ od: formatujDate(z.od), do: formatujDate(z.do), dni: String(liczbaDniWlacznie(z)) }),
    });
  }
  if (z && wniosek.okresPrawa && wniosek.okresPrawa.od !== z.od && wniosek.dzienNabyciaPrawa === wniosek.okresPrawa.od) {
    const dzienPrzed = wniosek.okresPrawa.od;
    pozycje.push({
      etykieta: t.okresWyczekiwania,
      wartosc: t.okresWyczekiwaniaWartosc({ od: formatujDate(z.od), do: formatujDate(dodajDni(dzienPrzed, -1)) }),
    });
  }
  if (wniosek.okresPrawa) {
    pozycje.push({
      etykieta: t.zasilekPrzysluguje,
      wartosc: t.okres({ od: formatujDate(wniosek.okresPrawa.od), do: formatujDate(wniosek.okresPrawa.do) }),
    });
  }
  if (z) {
    pozycje.push({
      etykieta: t.stawka,
      wartosc: t.stawkaWartosc({ procent: `${wniosek.stawka ?? (czyStawkaPelna(z) ? 100 : 80)}%` }),
    });
  }
  if (wniosek.okresUbezpieczenia) {
    pozycje.push({
      etykieta: t.ubezpieczenie,
      wartosc:
        wniosek.okresUbezpieczenia.rodzaj === 'po-ustaniu'
          ? t.poUstaniu({ data: formatujDate(wniosek.okresUbezpieczenia.dataUstania) })
          : t.wUbezpieczeniu,
    });
  }
  pozycje.push({ etykieta: t.platnikZasilku, wartosc: teksty.ViewZas53Start.zus });
  if (czyPoUstaniu(wniosek) && wniosek.oswiadczenieZ10) pozycje.push({ etykieta: t.z10, wartosc: t.z10Dolaczone });
  return (
    <Karta tytul={t.twojWniosek} bezLinii as="section">
      <DaneWKolumnieBocznej pozycje={pozycje} />
      {dodatek}
      <p className="m-0 mt-4">
        <Odnosnik href={trasy.ViewZas53Certificate({ wniosek: wniosek.idWniosku })}>{t.zmienZaswiadczenie}</Odnosnik>
      </p>
    </Karta>
  );
}

/** Szkic nie istnieje albo należy do innego konta. */
export function BrakWnioskuZas53() {
  return (
    <>
      <NaglowekKreatoraZas53 />
      <StanPusty ikona="wnioski" akcja={<PrzyciskLink href={trasy.ViewZas53Start({ sprawa: 'K24' })} wariant="glowny">{t.rozpocznij}</PrzyciskLink>}>
        {t.brakWniosku}
      </StanPusty>
    </>
  );
}
