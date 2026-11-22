'use client';

// Części wspólne ekranów kreatora wniosku ZAM (u27): odczyt wniosku z adresu, nagłówek z linkiem powrotu do
// instrukcji sprawy, karta postępu „Krok N z M”, układ dwukolumnowy, przyciski kreatora i karty boczne.
// Ekrany dzielą się na części (?czesc=N), a karta postępu liczy każdą część jako krok.
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';
import { useDzis, useKontekstRodziny, type KontekstRodziny } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokZam, znajdzWniosekZam } from '@/dane/magazyn/operacje/wnioski-zam';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { DataISO, IdWidoku, KodKomunikatu, OkresWniosku, RodzajUrlopu, WniosekZam } from '@/domena/typy';
import { rodzicKontaWRodzinie } from '@/domena/wnioski/zam';
import { krokiWnioskuZam, type WarunkiCzesciZam } from '@/domena/wnioski/zam-nawigacja';
import {
  kontekstOkresowZam,
  okresyMacierzynskiego,
  parametryOkresuZam,
  type KontekstOkresowZam,
  type ParametryOkresuZam,
} from '@/domena/wnioski/zam-okresy';
import { adresCzesci } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { liczbaKrokow, numerKroku, type KrokZCzesciami } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Postep } from '@/komponenty/postep';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const tk = teksty.ViewZamLeaveType.kreator;

export type EkranKreatoraZam = keyof typeof tk.nazwyKrokow;

/** Krok kreatora z liczbą części ekranu. */
export type KrokKreatoraZam = KrokZCzesciami<EkranKreatoraZam>;

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
    const okresy = kontekstOkresowZam({ wniosek, daneCiazy: kontekst.rodzina.daneCiazy, plan: kontekst.rodzina.plan, rodzic, wnioski: kontekst.rodzina.wnioski });
    return { wniosek, kontekst, okresy };
  }, [kontekst, idWniosku]);
  return { idWniosku, dane, kontekst };
}

/** Adres ekranu kreatora dla wniosku. */
export function adresEkranuZam(ekran: IdWidoku, idWniosku: string): string {
  // Urlop przejęty od matki (u34): ekran przejęcia w trybie kreatora ZAM.
  if (ekran === 'ViewFatherTakeover') return trasy.ViewFatherTakeover({ tryb: 'zam', wniosek: idWniosku });
  return sciezkaWidoku(ekran, { wniosek: idWniosku });
}

// --- Podział ekranów na części ---------------------------------------------------------------------

/**
 * Ekran okresu ma dwie części dla urlopu macierzyńskiego z dostępnym wariantem 81,5% (okres z tabelą stawek,
 * potem wybór wariantu) i dla urlopu rodzicielskiego (tryb z datą początku, potem liczba tygodni).
 */
export function okresWDwochCzesciachZam(rodzaj: RodzajUrlopu, p: ParametryOkresuZam): boolean {
  if (rodzaj === 'rodzicielski') return true;
  if (rodzaj !== 'macierzynski' || !p.okresMacierzynski || !p.wariantDostepny) return false;
  const [mac, rodz] = okresyMacierzynskiego(p, 'caly-rodzicielski');
  return Boolean(mac && rodz);
}

/** Liczba dzieci, których dane wnioskodawca wpisuje na ekranie danych; przed porodem 0. */
export function liczbaDzieciZDanymiZam(okresy: KontekstOkresowZam): number {
  return !okresy.przedPorodem && okresy.dataPorodu !== null ? Math.max(1, okresy.liczbaDzieci) : 0;
}

/** Zaświadczenie lekarskie na ekranie początku zasiłku: zasiłek matki wypłaca ZUS. */
export function wymagaZaswiadczeniaZam(kontekst: KontekstRodziny): boolean {
  return kontekst.rodzina.daneRodziny.matka.platnikZasilku?.wartosc === 'zus';
}

function warunkiCzesciZam(dane: DaneWnioskuZam, dzis: DataISO): WarunkiCzesciZam {
  const { wniosek, kontekst, okresy } = dane;
  return {
    liczbaDzieciZDanymi: liczbaDzieciZDanymiZam(okresy),
    okresWDwochCzesciach: okresWDwochCzesciachZam(wniosek.rodzajUrlopu ?? 'macierzynski', parametryOkresuZam(okresy, dzis)),
    zZaswiadczeniem: wymagaZaswiadczeniaZam(kontekst),
  };
}

/** Kroki kreatora z liczbą części każdego ekranu dla wniosku; bez wniosku ekrany mają podział domyślny. */
export function useKrokiKreatoraZam(dane: DaneWnioskuZam | null, przedPorodem = false): KrokKreatoraZam[] {
  const dzis = useDzis();
  const wniosek = dane?.wniosek ?? null;
  const przed = przedPorodem || wniosek?.przedPorodem !== undefined;
  return krokiWnioskuZam(wniosek, przed, dane ? warunkiCzesciZam(dane, dzis) : undefined) as KrokKreatoraZam[];
}

/** Liczba części ekranu w krokach kreatora. */
export function liczbaCzesciZam(kroki: readonly KrokKreatoraZam[], ekran: EkranKreatoraZam): number {
  return kroki.find((k) => k.id === ekran)?.czesci ?? 1;
}

/** Adres ostatniej części ekranu przed bieżącym, do przycisku Wstecz w pierwszej części ekranu. */
export function adresPoprzedniegoKrokuZam(
  kroki: readonly KrokKreatoraZam[],
  ekran: EkranKreatoraZam,
  idWniosku: string,
  domyslny: EkranKreatoraZam,
): string {
  const i = kroki.findIndex((k) => k.id === ekran);
  const poprzedni = i > 0 ? kroki[i - 1].id : domyslny;
  return adresCzesci(adresEkranuZam(poprzedni, idWniosku), liczbaCzesciZam(kroki, poprzedni));
}

// --- Zapis i przejścia -----------------------------------------------------------------------------

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

/**
 * Zapis odpowiedzi kroku i przejście do następnego ekranu (ostatni wyświetlony ekran = ekran docelowy).
 * `zajety` trwa od zapisu do pokazania następnego ekranu i nie wraca po powrocie na ekran.
 */
export function usePrzejscieDalej() {
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const przejdzDalej = (wniosek: WniosekZam, zmiana: Partial<WniosekZam>, ekranDocelowy: IdWidoku): KodKomunikatu | null => {
    ustawZajety(true);
    const wynik = zapiszKrokZam(wniosek.idWniosku, zmiana, ekranDocelowy, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      return wynik.kod;
    }
    przejdz(adresEkranuZam(ekranDocelowy, wniosek.idWniosku));
    return null;
  };
  return { przejdzDalej, zajety };
}

// --- Układ -----------------------------------------------------------------------------------------

/** Etykieta kroku na liście: „3. Dane” albo dla ekranu z częściami „3–5. Dane”. */
function etykietaKrokuZam(kroki: readonly KrokKreatoraZam[], krok: KrokKreatoraZam): string {
  const od = numerKroku(kroki, krok.id, 1);
  const czesci = krok.czesci ?? 1;
  const nazwa = tk.nazwyKrokow[krok.id];
  return czesci > 1 ? tk.zakresKrokow({ od, do_: od + czesci - 1, nazwa }) : tk.numerKroku({ numer: od, nazwa });
}

/** Karta postępu kreatora: „Krok N z M: nazwa”, pasek i lista kroków z odnośnikami do kroków wcześniejszych. */
function KartaPostepu({
  ekran,
  wniosek,
  kroki,
  czesc,
}: {
  ekran: EkranKreatoraZam;
  wniosek: WniosekZam | null;
  kroki: readonly KrokKreatoraZam[];
  czesc: number;
}) {
  const indeks = Math.max(0, kroki.findIndex((k) => k.id === ekran));
  const krok = numerKroku(kroki, ekran, czesc);
  const liczba = liczbaKrokow(kroki);
  const tytul = tk.krok({ krok, liczbaKrokow: liczba, nazwa: tk.nazwyKrokow[ekran] });
  const idTytulu = 'zam-postep-tytul';
  return (
    <Karta as="section">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={idTytulu} className="m-0 text-body-strong text-ink-strong">
          {tytul}
        </h2>
        <p className="m-0 text-small">{tk.zapisujemy}</p>
      </div>
      <Postep className="mt-3" wartosc={krok} maks={liczba} min={1} etykieta={tytul} idEtykiety={idTytulu} />
      <ol aria-label={tk.krokiWniosku} className="m-0 mt-4 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 text-small">
        {kroki.map((k, i) => {
          const etykieta = etykietaKrokuZam(kroki, k);
          if (i === indeks) {
            return (
              <li key={k.id} aria-current="step" className="font-semibold text-ink-strong">
                {etykieta}
              </li>
            );
          }
          return (
            <li key={k.id}>
              {i < indeks && wniosek ? <Odnosnik href={adresEkranuZam(k.id, wniosek.idWniosku)}>{etykieta}</Odnosnik> : etykieta}
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
  /** Kroki z liczbą części (useKrokiKreatoraZam); domyślnie podział bez danych wniosku. */
  kroki?: readonly KrokKreatoraZam[];
  /** Bieżąca część ekranu, od 1. */
  czesc?: number;
  komunikaty?: ReactNode;
  boczna?: ReactNode;
  children: ReactNode;
}

/** Układ ekranu kreatora: nagłówek, karta postępu, treść z przyciskami i kolumna boczna. */
export function RamaKreatoraZam({
  ekran,
  wniosek,
  idSprawy,
  przedPorodem = false,
  kroki,
  czesc = 1,
  komunikaty,
  boczna,
  children,
}: RamaKreatoraZamProps) {
  const sprawa = wniosek?.idSprawy ?? idSprawy;
  const przed = przedPorodem || wniosek?.przedPorodem !== undefined;
  const naglowek = przed ? teksty.ViewZamPrebirth.naglowek : teksty[ekran].naglowek;
  const krokiPostepu = kroki ?? (krokiWnioskuZam(wniosek, przed) as KrokKreatoraZam[]);
  return (
    <>
      <NaglowekStrony
        tytul={naglowek}
        powrot={sprawa ? { href: trasy.ViewCaseGuide({ idSprawy: sprawa }), etykieta: tk.powrot } : undefined}
      />
      <div className="flex flex-col gap-7.5">
        <KartaPostepu ekran={ekran} wniosek={wniosek} kroki={krokiPostepu} czesc={czesc} />
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

/** Wiersz przycisków kreatora: Wstecz, Zapisz do dokończenia, Dalej. W trakcie przejścia Wstecz i Zapisz są wyłączone. */
export function PrzyciskiKreatora({ onWstecz, onZapisz, onDalej, etykietaDalej = tk.przyciski.dalej, zajety }: PrzyciskiKreatoraProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-4">
      {onWstecz ? (
        <Przycisk type="button" wariant="drugorzedny" onClick={onWstecz} disabled={zajety} className="mr-auto">
          {tk.przyciski.wstecz}
        </Przycisk>
      ) : null}
      {onZapisz ? (
        <Przycisk type="button" wariant="tlo" ikona="zapisz" onClick={onZapisz} disabled={zajety}>
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
