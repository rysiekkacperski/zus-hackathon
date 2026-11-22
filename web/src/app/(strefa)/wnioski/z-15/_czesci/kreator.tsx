'use client';

// Wspólne części kreatora Z-15: odczyt szkicu z adresu, adresy ekranów, postęp kroków, panel „Twój wniosek”, akcje kroku.
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { formatujDate, liczbaDniWlacznie } from '@/domena/daty';
import type { DaneZKontaZus, IdWidoku, KontoPrzewodnika, StanRodziny, WniosekZ15 } from '@/domena/typy';
import { EKRANY_Z15 } from '@/domena/wnioski/z15';
import { useKonto, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { Karta } from '@/komponenty/karta';
import { liczbaKrokow, numerKroku, type KrokZCzesciami } from '@/komponenty/kroki';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Postep } from '@/komponenty/postep';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { teksty } from '@/teksty';

const t = teksty.ViewZ15Start.kreator;

export interface KontekstKreatoraZ15 {
  wniosek: WniosekZ15;
  rodzina: StanRodziny;
  konto: KontoPrzewodnika;
  kopia: DaneZKontaZus | null;
}

/** Szkic wniosku z parametru `?wniosek=` w rodzinie zalogowanego konta. */
export function useWniosekZ15(): KontekstKreatoraZ15 | null {
  const parametry = useSearchParams();
  const id = parametry.get('wniosek');
  const rodzina = useRodzina();
  const konto = useKonto();
  const stanKonta = useStanKonta();
  return useMemo(() => {
    if (!rodzina || !konto || !id) return null;
    const wniosek = rodzina.wnioski.find((w): w is WniosekZ15 => w.idWniosku === id && w.rodzaj === 'z-15');
    if (!wniosek || wniosek.konto !== konto.pesel) return null;
    return { wniosek, rodzina, konto, kopia: stanKonta?.kopiaDanychZus ?? null };
  }, [rodzina, konto, id, stanKonta]);
}

export function adresEkranuZ15(ekran: IdWidoku, wniosek: string): string {
  switch (ekran) {
    case 'ViewZ15Statements':
      return trasy.ViewZ15Statements({ wniosek });
    case 'ViewZ15Data':
      return trasy.ViewZ15Data({ wniosek });
    case 'ViewZ15Summary':
      return trasy.ViewZ15Summary({ wniosek });
    case 'ViewZ15Sent':
      return trasy.ViewZ15Sent({ wniosek });
    case 'ViewZ15ForPayer':
      return trasy.ViewZ15ForPayer({ wniosek });
    default:
      return trasy.ViewZ15Situation({ wniosek });
  }
}

/** Liczba części ekranu: sytuacja i oświadczenia mają po 2 części, aby krok mieścił się w 1440×800. */
export function liczbaCzesciZ15(ekran: IdWidoku): number {
  return ekran === 'ViewZ15Situation' || ekran === 'ViewZ15Statements' ? 2 : 1;
}

const KROKI: KrokZCzesciami<IdWidoku>[] = EKRANY_Z15.map((id) => ({ id, czesci: liczbaCzesciZ15(id) }));

export function NaglowekKreatoraZ15() {
  return (
    <NaglowekStrony
      tytul={teksty.ViewZ15Start.naglowek}
      powrot={{ href: trasy.ViewCaseDetails({ idSprawy: 'K22' }), etykieta: teksty.ViewZ15Start.powrot }}
    />
  );
}

export function PostepZ15({ ekran, czesc = 1 }: { ekran: IdWidoku; czesc?: number }) {
  const liczba = liczbaKrokow(KROKI);
  const numer = numerKroku(KROKI, ekran, czesc);
  const nazwa = t.kroki[ekran as keyof typeof t.kroki] ?? '';
  const idTytulu = 'postep-z15-tytul';
  return (
    <section aria-labelledby={idTytulu} className="rounded-md border border-line bg-surface-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={idTytulu} className="m-0 text-body-strong text-ink-strong">
          {t.krok({ krok: numer, liczbaKrokow: liczba, nazwa })}
        </h2>
        <p className="m-0 text-small">{t.zapisujemy}</p>
      </div>
      <Postep className="mt-3" wartosc={numer} min={0} maks={liczba} etykieta={t.postep({ krok: numer, liczbaKrokow: liczba })} idEtykiety={idTytulu} />
    </section>
  );
}

export function AkcjeKreatoraZ15({
  onWstecz,
  onZapisz,
  onDalej,
  etykietaDalej = t.dalej,
  zajety,
}: {
  onWstecz?: () => void;
  onZapisz: () => void;
  onDalej: () => void;
  etykietaDalej?: string;
  zajety?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {onWstecz ? (
        <Przycisk type="button" wariant="drugorzedny" onClick={onWstecz} disabled={zajety}>
          {t.wstecz}
        </Przycisk>
      ) : (
        <span />
      )}
      <div className="flex flex-wrap gap-4">
        <Przycisk type="button" wariant="tlo" onClick={onZapisz} disabled={zajety}>
          {t.zapiszDoDokonczenia}
        </Przycisk>
        <Przycisk type="button" wariant="glowny" onClick={onDalej} zajety={zajety}>
          {etykietaDalej}
        </Przycisk>
      </div>
    </div>
  );
}

export function PanelWnioskuZ15({ wniosek }: { wniosek: WniosekZ15 }) {
  const pozycje = [];
  if (wniosek.osoba) pozycje.push({ etykieta: t.osoba, wartosc: `${wniosek.osoba.imie} ${wniosek.osoba.nazwisko}` });
  if (wniosek.sytuacja) pozycje.push({ etykieta: t.sytuacja, wartosc: teksty.ViewZ15Start.sytuacje[wniosek.sytuacja] });
  if (wniosek.okresy.length > 0) {
    pozycje.push({
      etykieta: t.okresy,
      wartosc: wniosek.okresy
        .map((o) => t.okres({ od: formatujDate(o.od), do: formatujDate(o.do), dni: String(liczbaDniWlacznie(o)) }))
        .join(', '),
    });
  }
  if (wniosek.platnikZasilku) pozycje.push({ etykieta: t.platnikZasilku, wartosc: t.platnicy[wniosek.platnikZasilku] });
  return (
    <Karta tytul={t.twojWniosek} bezLinii as="section">
      <ListaDefinicji szerokoscEtykiety="waska" pozycje={pozycje} />
    </Karta>
  );
}

export function BrakWnioskuZ15() {
  return (
    <>
      <NaglowekKreatoraZ15 />
      <StanPusty
        ikona="wnioski"
        akcja={
          <PrzyciskLink href={trasy.ViewZ15Start({ sprawa: 'K22' })} wariant="glowny">
            {t.rozpocznij}
          </PrzyciskLink>
        }
      >
        {t.brakWniosku}
      </StanPusty>
    </>
  );
}
