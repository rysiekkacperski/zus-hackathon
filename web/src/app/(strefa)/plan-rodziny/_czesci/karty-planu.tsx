'use client';

// Karty ViewFamilyPlan (wzór Plan-rodziny): Twoja ścieżka z przejściem do stron etapów, Najbliższe terminy,
// Sytuacje szczególne, Co się zmieniło w planie. Właściciel: u12.
import { dodajMiesiaceDoMiesiaca, formatujDate, porownajDaty } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import {
  dzienUtworzeniaSprawyOplacenia,
  miesiacZIdSprawyOplacenia,
  terminOplaceniaSkladek,
  type OcenaStraznika,
} from '@/domena/plan/straznik';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { OPIS_ZMIANY } from '@/domena/plan/zmiany';
import type { Etap, PozycjaPlanu, StatusSprawy, ZmianaPlanu } from '@/domena/typy';
import { czySpokojnyTryb } from '@/domena/rodzina/sytuacje';
import { formatujMiesiac } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { Znaczek } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import { sciezkaEtapu } from './sciezka-etapu';
import { ETAPY, czyOtwarta, nazwaEtapu, numerEtapu, tytulSprawy } from './sprawy';
import { SlotAkcjaSytuacjaSzczegolna } from '@/app/(strefa)/plan-rodziny/_sloty/akcja-sytuacja-szczegolna';

const t = teksty.ViewFamilyPlan;

export interface KartaSciezkiProps {
  pozycje: PozycjaPlanu[];
  biezacyEtap: Etap;
  /** Liczba ostrzeżeń strażnika ubezpieczenia chorobowego pokazywana przy etapie Ciąża. */
  ostrzezeniaStraznika?: number;
}

export function KartaSciezki({ pozycje, biezacyEtap, ostrzezeniaStraznika = 0 }: KartaSciezkiProps) {
  const doZrobienia = pozycje.filter((p) => czyOtwarta(p.status)).length;
  const zlozone = pozycje.filter((p) => p.status === 'zlozona').length;
  const zalatwione = pozycje.filter((p) => p.status === 'zalatwiona').length;
  const indeksBiezacego = ETAPY.indexOf(biezacyEtap);
  return (
    <Karta tytul={t.sciezka.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        <p className="m-0 text-body">{t.sciezka.wstep}</p>
        <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { etykieta: t.sciezka.wPlanie, wartosc: pozycje.length },
            { etykieta: t.sciezka.doZrobienia, wartosc: doZrobienia },
            { etykieta: t.sciezka.zlozone, wartosc: zlozone },
            { etykieta: t.sciezka.zalatwione, wartosc: zalatwione },
          ].map((p) => (
            <div key={p.etykieta} className="min-w-0 rounded-md bg-surface-page p-4">
              <dt className="text-body text-ink">{p.etykieta}</dt>
              <dd className="m-0 mt-1 text-amount text-ink-strong">{p.wartosc}</dd>
            </div>
          ))}
        </dl>
        <h3 className="m-0 text-body-strong text-ink">{t.sciezka.etapyPlanu}</h3>
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {ETAPY.map((etap, indeks) => {
            const sprawy = pozycje.filter((p) => p.etap === etap);
            const numer = numerEtapu(etap);
            const biezacy = etap === biezacyEtap;
            return (
              <li
                key={etap}
                aria-current={biezacy ? 'step' : undefined}
                className={
                  biezacy
                    ? 'flex flex-wrap items-center gap-3 rounded-md border border-brand bg-brand-wash p-3'
                    : 'flex flex-wrap items-center gap-3 rounded-md border border-transparent p-3'
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    biezacy
                      ? 'flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-small-strong text-on-brand'
                      : 'flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-small-strong text-brand'
                  }
                >
                  {numer}
                </span>
                <span className="flex min-w-0 flex-1 basis-48 flex-col">
                  <Odnosnik href={sciezkaEtapu(etap)}>{nazwaEtapu(etap)}</Odnosnik>
                  <span className="text-body">{licznikSprawEtapu(sprawy)}</span>
                  {etap === 'ciaza' && ostrzezeniaStraznika > 0 ? (
                    <span className="text-small-strong text-ink-strong">
                      {t.sciezka.ostrzezeniaStraznika({ liczba: String(ostrzezeniaStraznika) })}
                    </span>
                  ) : null}
                </span>
                <OznaczenieEtapu stan={stanEtapu(indeks, indeksBiezacego, sprawy)} />
              </li>
            );
          })}
        </ol>
      </div>
    </Karta>
  );
}

export type StanEtapu = 'biezacy' | 'zakonczony' | 'otwarte-sprawy' | 'przyszly';

/**
 * Stan etapu względem bieżącego etapu: etap przed bieżącym jest zakończony, gdy nie ma w nim spraw do zrobienia,
 * a z otwartą sprawą pokazuje, że zostały w nim sprawy do zrobienia.
 */
export function stanEtapu(indeks: number, indeksBiezacego: number, sprawy: PozycjaPlanu[]): StanEtapu {
  if (indeks === indeksBiezacego) return 'biezacy';
  if (indeks > indeksBiezacego) return 'przyszly';
  return sprawy.some((p) => czyOtwarta(p.status)) ? 'otwarte-sprawy' : 'zakonczony';
}

export function OznaczenieEtapu({ stan }: { stan: StanEtapu }) {
  if (stan === 'biezacy') return <Znaczek>{t.biezacyEtap}</Znaczek>;
  if (stan === 'zakonczony') return <span className="text-small-strong text-ink">{t.etapZakonczony}</span>;
  if (stan === 'otwarte-sprawy') return <span className="text-small-strong text-ink">{t.etapZOtwartymiSprawami}</span>;
  return null;
}

/** Liczniki spraw etapu: „Sprawy: 5, do zrobienia: 3, złożone: 1”. */
export function licznikSprawEtapu(sprawy: PozycjaPlanu[]): string {
  const czesci = [t.sciezka.licznikSpraw({ liczba: String(sprawy.length) })];
  const otwarte = sprawy.filter((p) => czyOtwarta(p.status)).length;
  const zl = sprawy.filter((p) => p.status === 'zlozona').length;
  const za = sprawy.filter((p) => p.status === 'zalatwiona').length;
  if (otwarte > 0) czesci.push(t.sciezka.licznikDoZrobienia({ liczba: String(otwarte) }));
  if (zl > 0) czesci.push(t.sciezka.licznikZlozonych({ liczba: String(zl) }));
  if (za > 0) czesci.push(t.sciezka.licznikZalatwionych({ liczba: String(za) }));
  return czesci.join(', ');
}

/** Liczba terminów na karcie Najbliższe terminy. */
const LIMIT_NAJBLIZSZYCH = 3;

interface WpisTerminu {
  id: string;
  data: string;
  tytul: string;
  opis?: string;
}

export function KartaTerminow({ kontekst, ocena }: { kontekst: KontekstRodziny; ocena: OcenaStraznika | null }) {
  const { rodzina, katalog, dzis } = kontekst;
  const pozycje = rodzina.plan?.pozycje ?? [];
  const wpisy: WpisTerminu[] = [];
  for (const termin of rodzina.kalendarz?.terminy ?? []) {
    const sprawa = pozycje.find((p) => p.idSprawy === termin.idSprawy);
    if (!sprawa || !czyOtwarta(sprawa.status) || termin.termin === null) continue;
    if (porownajDaty(termin.termin, dzis) < 0) continue;
    wpisy.push({ id: termin.idSprawy, data: termin.termin, tytul: tytulSprawy(katalog, sprawa) });
  }
  const oplacenie = ocena?.oplacenie ?? null;
  if (oplacenie && porownajDaty(oplacenie.termin, dzis) >= 0 && !wpisy.some((w) => w.id === oplacenie.idSprawy)) {
    const sprawa = pozycje.find((p) => p.idSprawy === oplacenie.idSprawy);
    if (!sprawa || czyOtwarta(sprawa.status)) {
      wpisy.push({
        id: oplacenie.idSprawy,
        data: oplacenie.termin,
        tytul: t.oplacenie.tytul({ miesiac: formatujMiesiac(oplacenie.miesiac) }),
      });
    }
  }
  if (oplacenie) {
    const nastepny = dodajMiesiaceDoMiesiaca(oplacenie.miesiac, 1);
    wpisy.push({
      id: `nastepna-${nastepny}`,
      data: terminOplaceniaSkladek(nastepny),
      tytul: t.oplacenie.tytul({ miesiac: formatujMiesiac(nastepny) }),
      opis: t.najblizszeTerminy.dodamy({ data: formatujDate(dzienUtworzeniaSprawyOplacenia(nastepny)) }),
    });
  }
  const daneCiazy = rodzina.daneCiazy;
  if (
    daneCiazy?.przewidywanyTerminPorodu &&
    !daneCiazy.dataPoroduPotwierdzona &&
    porownajDaty(daneCiazy.przewidywanyTerminPorodu, dzis) >= 0
  ) {
    wpisy.push({
      id: 'ptp',
      data: daneCiazy.przewidywanyTerminPorodu,
      tytul: t.najblizszeTerminy.ptp,
      opis: t.najblizszeTerminy.ptpOpis,
    });
  }
  // Pełna lista terminów w kolejności dat, z której karta pokazuje trzy najbliższe.
  wpisy.sort((a, b) => porownajDaty(a.data, b.data) || a.id.localeCompare(b.id));
  const najblizsze = wpisy.slice(0, LIMIT_NAJBLIZSZYCH);
  return (
    <Karta tytul={t.najblizszeTerminy.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        {najblizsze.length === 0 ? (
          <p className="m-0 text-body">{t.najblizszeTerminy.brak}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {najblizsze.map((w) => (
              <li key={w.id} className="flex flex-col gap-1 border-b border-line-soft pb-4 last:border-b-0 last:pb-0">
                <p className="m-0 text-body-strong">{formatujDate(w.data)}</p>
                <p className="m-0 text-body">{w.tytul}</p>
                {w.opis ? <p className="m-0 text-small text-ink-muted">{w.opis}</p> : null}
              </li>
            ))}
          </ul>
        )}
        <PrzyciskLink wariant="drugorzedny" szerokosc="pelna" href={sciezkaWidoku('ViewDeadlines')}>
          {t.najblizszeTerminy.wszystkie}
        </PrzyciskLink>
      </div>
    </Karta>
  );
}

/** Karta Sytuacje szczególne pod najbliższymi terminami; w spokojnym trybie karta trybu z datą włączenia. */
export function KartaSytuacjiSzczegolnych({ kontekst }: { kontekst: KontekstRodziny }) {
  if (kontekst.rola !== 'rodzic' && kontekst.rola !== 'drugi-rodzic') return null;
  if (czySpokojnyTryb(kontekst.rodzina.daneCiazy)) return <SlotAkcjaSytuacjaSzczegolna kontekst={kontekst} />;
  return (
    <Karta tytul={t.sytuacjeSzczegolne.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        <p className="m-0 text-body">{t.sytuacjeSzczegolne.opis}</p>
        <PrzyciskLink wariant="drugorzedny" szerokosc="pelna" href={sciezkaWidoku('ViewSpecialSituation')}>
          {t.sytuacjeSzczegolne.przejdz}
        </PrzyciskLink>
      </div>
    </Karta>
  );
}

const STATUSY_SPRAW = teksty.wspolne.etykiety.statusySpraw;

function etykietaStatusu(klucz: string | undefined): string | null {
  return klucz && klucz in STATUSY_SPRAW ? STATUSY_SPRAW[klucz as StatusSprawy] : null;
}

/** Opis zmiany z teksty.ts: pole `opis` niesie klucz maszynowy (status, kwota w groszach, klucz OPIS_ZMIANY). */
function opisZmiany(zmiana: ZmianaPlanu, sprawa: PozycjaPlanu | undefined): string {
  const z = t.zmiany;
  switch (zmiana.rodzaj) {
    case 'zmieniony-status': {
      if (zmiana.opis === OPIS_ZMIANY.statusZachowany) return z.statusZachowany;
      const poprzedni = etykietaStatusu(zmiana.opis);
      if (!poprzedni) return z.rodzaje[zmiana.rodzaj];
      return sprawa ? z.statusZNa({ poprzedni, obecny: STATUSY_SPRAW[sprawa.status] }) : z.statusZ({ poprzedni });
    }
    case 'usunieta': {
      const poprzedni = etykietaStatusu(zmiana.opis);
      return poprzedni ? z.usunietaZeStatusem({ poprzedni }) : z.rodzaje[zmiana.rodzaj];
    }
    case 'zmieniona-kwota': {
      const grosze = Number(zmiana.opis);
      if (!zmiana.opis || !Number.isFinite(grosze)) return z.rodzaje[zmiana.rodzaj];
      const poprzednia = formatujKwote(grosze);
      return sprawa?.kwota
        ? z.kwotaZNa({ poprzednia, obecna: formatujKwote(sprawa.kwota.kwota) })
        : z.kwotaZ({ poprzednia });
    }
    case 'zmieniony-termin':
      return zmiana.opis === OPIS_ZMIANY.bezOznaczeniaPoPorodzie ? z.terminOdDatyPorodu : z.rodzaje[zmiana.rodzaj];
    default:
      return z.rodzaje[zmiana.rodzaj];
  }
}

export function KartaZmian({ kontekst }: { kontekst: KontekstRodziny }) {
  const zmiany = kontekst.rodzina.plan?.ostatnieZmiany ?? [];
  if (zmiany.length === 0) return null;
  const pozycje = kontekst.rodzina.plan?.pozycje ?? [];
  return (
    <Karta tytul={t.zmiany.tytul} bezLinii>
      <Tabela
        podpis={t.zmiany.podpis}
        etykietaPrzewijania={t.zmiany.przewijanie}
        kolumny={[
          { klucz: 'sprawa', naglowek: t.zmiany.kolSprawa, tytulowa: true },
          { klucz: 'zmiana', naglowek: t.zmiany.kolZmiana },
        ]}
        wiersze={zmiany.map((z, i) => {
          const sprawa = pozycje.find((p) => p.idSprawy === z.idSprawy);
          const miesiacOplacenia = miesiacZIdSprawyOplacenia(z.idSprawy);
          const tytul = sprawa
            ? tytulSprawy(kontekst.katalog, sprawa)
            : miesiacOplacenia
              ? t.oplacenie.tytul({ miesiac: formatujMiesiac(miesiacOplacenia) })
              : (kontekst.katalog.pozycje.find((p) => z.idSprawy.startsWith(p.id))?.tytul ?? z.idSprawy);
          return { id: `${z.idSprawy}-${z.rodzaj}-${i}`, sprawa: tytul, zmiana: opisZmiany(z, sprawa) };
        })}
      />
    </Karta>
  );
}
