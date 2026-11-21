'use client';

// Części wspólne ekranów kreatora wniosku ZAM (u27): odczyt wniosku z adresu, nagłówek z linkiem powrotu do
// instrukcji sprawy, karta postępu „Krok N z M”, układ dwukolumnowy, przyciski kreatora i karty boczne.
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { useKontekstRodziny, type KontekstRodziny } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokZam, znajdzWniosekZam } from '@/dane/magazyn/operacje/wnioski-zam';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { IdWidoku, KodKomunikatu, OkresWniosku, WniosekZam } from '@/domena/typy';
import { rodzicKontaWRodzinie } from '@/domena/wnioski/zam';
import { ekranyWnioskuZam } from '@/domena/wnioski/zam-nawigacja';
import { kontekstOkresowZam, type KontekstOkresowZam } from '@/domena/wnioski/zam-okresy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Postep } from '@/komponenty/postep';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tk = teksty.ViewZamLeaveType.kreator;

export type EkranKreatoraZam = keyof typeof tk.nazwyKrokow;

export interface DaneWnioskuZam {
  wniosek: WniosekZam;
  kontekst: KontekstRodziny;
  okresy: KontekstOkresowZam;
}

/** Wniosek ZAM z parametru ?wniosek= dla zalogowanego konta i jego rodziny. */
export function useWniosekZam(): { idWniosku: string | null; dane: DaneWnioskuZam | null; kontekst: KontekstRodziny | null } {
  const parametry = useSearchParams();
  const idWniosku = parametry.get('wniosek');
  const kontekst = useKontekstRodziny();
  const dane = useMemo(() => {
    if (kontekst === null) return null;
    const wniosek = znajdzWniosekZam(kontekst.rodzina, idWniosku, kontekst.konto.pesel);
    if (wniosek === null) return null;
    const rodzic = rodzicKontaWRodzinie(kontekst.konto, kontekst.rodzina);
    const okresy = kontekstOkresowZam({ wniosek, daneCiazy: kontekst.rodzina.daneCiazy, plan: kontekst.rodzina.plan, rodzic });
    return { wniosek, kontekst, okresy };
  }, [kontekst, idWniosku]);
  return { idWniosku, dane, kontekst };
}

/** Adres ekranu kreatora dla wniosku. */
export function adresEkranuZam(ekran: IdWidoku, idWniosku: string): string {
  return sciezkaWidoku(ekran, { wniosek: idWniosku });
}

/** Zapis odpowiedzi i przejście do instrukcji sprawy z komunikatem 0058 (R19). */
export function useZapisDoDokonczenia() {
  const router = useRouter();
  return (wniosek: WniosekZam, zmiana: Partial<WniosekZam>, ekran: IdWidoku): KodKomunikatu | null => {
    const wynik = zapiszKrokZam(wniosek.idWniosku, zmiana, ekran, pobierzKontekstOperacji());
    if (!wynik.ok) return wynik.kod;
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
    router.push(trasy.ViewCaseGuide({ idSprawy: wniosek.idSprawy }));
    return null;
  };
}

/** Zapis odpowiedzi kroku i przejście do następnego ekranu (ostatni wyświetlony ekran = ekran docelowy). */
export function usePrzejscieDalej() {
  const router = useRouter();
  return (wniosek: WniosekZam, zmiana: Partial<WniosekZam>, ekranDocelowy: IdWidoku): KodKomunikatu | null => {
    const wynik = zapiszKrokZam(wniosek.idWniosku, zmiana, ekranDocelowy, pobierzKontekstOperacji());
    if (!wynik.ok) return wynik.kod;
    router.push(adresEkranuZam(ekranDocelowy, wniosek.idWniosku));
    return null;
  };
}

/** Karta postępu kreatora: „Krok N z M: nazwa”, pasek i lista kroków z odnośnikami do kroków wcześniejszych. */
function KartaPostepu({ ekran, wniosek, przedPorodem }: { ekran: EkranKreatoraZam; wniosek: WniosekZam | null; przedPorodem: boolean }) {
  const ekrany = ekranyWnioskuZam(wniosek, przedPorodem) as EkranKreatoraZam[];
  const indeks = Math.max(0, ekrany.indexOf(ekran));
  const idTytulu = 'zam-postep-tytul';
  return (
    <Karta as="section">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={idTytulu} className="m-0 text-body-strong text-ink-strong">
          {tk.krok({ krok: indeks + 1, liczbaKrokow: ekrany.length, nazwa: tk.nazwyKrokow[ekran] })}
        </h2>
        <p className="m-0 text-small">{tk.zapisujemy}</p>
      </div>
      <Postep
        className="mt-3"
        wartosc={indeks + 1}
        maks={ekrany.length}
        min={1}
        etykieta={tk.krok({ krok: indeks + 1, liczbaKrokow: ekrany.length, nazwa: tk.nazwyKrokow[ekran] })}
        idEtykiety={idTytulu}
      />
      <ol aria-label={tk.krokiWniosku} className="m-0 mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small">
        {ekrany.map((e, i) => {
          const etykieta = tk.numerKroku({ numer: i + 1, nazwa: tk.nazwyKrokow[e] });
          if (i === indeks) {
            return (
              <li key={e} aria-current="step" className="font-semibold text-ink-strong">
                {etykieta}
              </li>
            );
          }
          return (
            <li key={e}>
              {i < indeks && wniosek ? <Odnosnik href={adresEkranuZam(e, wniosek.idWniosku)}>{etykieta}</Odnosnik> : etykieta}
            </li>
          );
        })}
      </ol>
    </Karta>
  );
}

export interface RamaKreatoraZamProps {
  ekran: EkranKreatoraZam;
  wniosek: WniosekZam | null;
  idSprawy?: string;
  przedPorodem?: boolean;
  komunikaty?: ReactNode;
  boczna?: ReactNode;
  children: ReactNode;
}

/** Układ ekranu kreatora: nagłówek, karta postępu, treść z przyciskami i kolumna boczna. */
export function RamaKreatoraZam({ ekran, wniosek, idSprawy, przedPorodem = false, komunikaty, boczna, children }: RamaKreatoraZamProps) {
  const sprawa = wniosek?.idSprawy ?? idSprawy;
  const przed = przedPorodem || wniosek?.przedPorodem !== undefined;
  const naglowek = przed ? teksty.ViewZamPrebirth.naglowek : teksty[ekran].naglowek;
  return (
    <>
      <NaglowekStrony
        tytul={naglowek}
        powrot={sprawa ? { href: trasy.ViewCaseGuide({ idSprawy: sprawa }), etykieta: tk.powrot } : undefined}
      />
      <div className="flex flex-col gap-7.5">
        <KartaPostepu ekran={ekran} wniosek={wniosek} przedPorodem={przed} />
        {komunikaty}
        <UkladDwuKolumnowy tresc={<div className="flex min-w-0 flex-col gap-7.5">{children}</div>} boczna={boczna} etykietaBocznej={tk.etykietaBocznej} />
      </div>
    </>
  );
}

export interface PrzyciskiKreatoraProps {
  onWstecz?: () => void;
  onZapisz?: () => void;
  onDalej: () => void;
  etykietaDalej?: string;
  zajety?: boolean;
}

/** Wiersz przycisków kreatora: Wstecz, Zapisz do dokończenia, Dalej. */
export function PrzyciskiKreatora({ onWstecz, onZapisz, onDalej, etykietaDalej = tk.przyciski.dalej, zajety }: PrzyciskiKreatoraProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
      {onWstecz ? (
        <Przycisk type="button" wariant="drugorzedny" onClick={onWstecz} className="mr-auto">
          {tk.przyciski.wstecz}
        </Przycisk>
      ) : null}
      {onZapisz ? (
        <Przycisk type="button" wariant="tlo" ikona="zapisz" onClick={onZapisz}>
          {tk.przyciski.zapiszDoDokonczenia}
        </Przycisk>
      ) : null}
      <Przycisk type="submit" wariant="glowny" onClick={onDalej} zajety={zajety}>
        {etykietaDalej}
      </Przycisk>
    </div>
  );
}

/** Ekran bez wniosku: wniosek nie istnieje albo należy do innego konta. */
export function BrakWnioskuZam({ ekran }: { ekran: EkranKreatoraZam | 'ViewZamSent' }) {
  return (
    <>
      <NaglowekStrony tytul={teksty[ekran].naglowek} />
      <StanPusty ikona="wnioski" akcja={<PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">{tk.przejdzDoPlanu}</PrzyciskLink>}>
        {tk.brakWniosku}
      </StanPusty>
    </>
  );
}

/** Lista definicji kart bocznych (dt pogrubiony nad dd). */
export function DaneBoczne({ pozycje }: { pozycje: { etykieta: string; wartosc: ReactNode }[] }) {
  return (
    <dl className="m-0 grid gap-4">
      {pozycje.map((p) => (
        <div key={p.etykieta}>
          <dt className="text-body-strong">{p.etykieta}</dt>
          <dd className="m-0">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Komunikat błędu zapisu (0003) pod kartą postępu. */
export function KomunikatBleduZapisu({ kod }: { kod: KodKomunikatu | null }) {
  return kod ? <Komunikat kod={kod} /> : null;
}

// --- Formatowanie --------------------------------------------------------------------------------

export function tekstOkresu(o: { od: string; do: string }): string {
  return tk.okres({ od: formatujDate(o.od), do_: formatujDate(o.do) });
}

export function tekstStawki(stawka: number | undefined): string {
  return tk.stawka({ stawka: formatujProcent(stawka ?? 100) });
}

/** Nazwa rodzaju urlopu wniosku, z wariantem „z całym urlopem rodzicielskim”. */
export function nazwaRodzajuWniosku(wniosek: WniosekZam): string {
  if (!wniosek.rodzajUrlopu) return '';
  if (wniosek.rodzajUrlopu === 'macierzynski' && wniosek.wariant === 'caly-rodzicielski' && wniosek.okresy.length > 1) {
    return tk.macierzynskiZCalym;
  }
  return tk.rodzajeUrlopu[wniosek.rodzajUrlopu];
}

/** Okres całego wniosku i opis zasiłku do kart bocznych i potwierdzenia. */
export function opisZasilkuWniosku(okresy: OkresWniosku[]): { okres: string; zasilek: string } | null {
  if (okresy.length === 0) return null;
  const od = okresy[0].od;
  const doD = okresy[okresy.length - 1].do;
  const stawki = new Set(okresy.map((o) => o.stawka ?? 100));
  const okres = tekstOkresu({ od, do: doD });
  if (okresy.length > 1 && stawki.size === 1) {
    return { okres, zasilek: tk.stawkaZaCalyOkres({ stawka: formatujProcent([...stawki][0]) }) };
  }
  return { okres, zasilek: okresy.map((o) => tekstStawki(o.stawka)).join(', ') };
}

/** Karta „Twój wniosek” w kolumnie bocznej. */
export function KartaTwojWniosek({
  dane,
  pokazOkres,
  pokazDziecko,
  zmien,
}: {
  dane: DaneWnioskuZam;
  pokazOkres?: boolean;
  pokazDziecko?: boolean;
  zmien?: { ekran: IdWidoku; etykieta: string };
}) {
  const { wniosek, kontekst, okresy } = dane;
  const t = tk.twojWniosek;
  const platnik = tk.platnicy[wniosek.adresat === 'platnik-skladek' ? 'platnik-skladek' : 'zus'];
  const pozycje: { etykieta: string; wartosc: ReactNode }[] = [{ etykieta: t.rodzajUrlopu, wartosc: nazwaRodzajuWniosku(wniosek) }];
  const zasilek = opisZasilkuWniosku(wniosek.okresy);
  if (pokazOkres && zasilek) {
    pozycje.push({ etykieta: t.okres, wartosc: zasilek.okres }, { etykieta: t.zasilek, wartosc: zasilek.zasilek });
  } else if (okresy.dataPorodu) {
    pozycje.push({ etykieta: t.dataPorodu, wartosc: formatujDate(okresy.dataPorodu) }, { etykieta: t.liczbaDzieci, wartosc: String(okresy.liczbaDzieci) });
  }
  const dziecko = wniosek.daneDzieci[0] ?? kontekst.rodzina.daneCiazy?.dzieci[0];
  if (pokazDziecko && dziecko?.imie) {
    pozycje.push({ etykieta: t.dziecko, wartosc: `${dziecko.imie} ${dziecko.nazwisko ?? ''}`.trim() });
  } else {
    pozycje.push({ etykieta: t.platnikZasilku, wartosc: platnik });
  }
  return (
    <Karta tytul={t.tytul} bezLinii>
      <DaneBoczne pozycje={pozycje} />
      {zmien ? (
        <div className="mt-6">
          <Odnosnik href={adresEkranuZam(zmien.ekran, wniosek.idWniosku)}>{zmien.etykieta}</Odnosnik>
        </div>
      ) : null}
    </Karta>
  );
}
