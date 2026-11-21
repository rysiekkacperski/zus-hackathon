'use client';

// Karty ViewFamilyPlan (wzór Plan-rodziny): Twoja ścieżka z przejściem do stron etapów, Najbliższe terminy,
// Na skróty, Dane, z których powstał plan, Co się zmieniło w planie. Właściciel: u12.
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
import type { DanaZeZrodla, Etap, PozycjaPlanu, StatusSprawy, ZmianaPlanu, ZrodloDanej } from '@/domena/typy';
import { formatujMiesiac } from '@/komponenty/format';
import { Kafelki, Statystyki } from '@/komponenty/kafelki';
import { Karta } from '@/komponenty/karta';
import { ListaDefinicji, type PozycjaListyDefinicji } from '@/komponenty/lista-definicji';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { Znaczek } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import { sciezkaEtapu } from './sciezka-etapu';
import { ETAPY, czyOtwarta, nazwaEtapu, nazwaFormy, numerEtapu, tytulSprawy } from './sprawy';

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
        <Statystyki
          pozycje={[
            { etykieta: t.sciezka.wPlanie, wartosc: pozycje.length },
            { etykieta: t.sciezka.doZrobienia, wartosc: doZrobienia },
            { etykieta: t.sciezka.zlozone, wartosc: zlozone },
            { etykieta: t.sciezka.zalatwione, wartosc: zalatwione },
          ]}
        />
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
                {biezacy ? <Znaczek>{t.biezacyEtap}</Znaczek> : null}
                {indeks < indeksBiezacego ? <span className="text-small-strong text-ink">{t.etapZakonczony}</span> : null}
              </li>
            );
          })}
        </ol>
      </div>
    </Karta>
  );
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
  if (ocena?.oplacenie && !wpisy.some((w) => w.id === ocena.oplacenie?.idSprawy)) {
    const sprawa = pozycje.find((p) => p.idSprawy === ocena.oplacenie?.idSprawy);
    if (!sprawa || czyOtwarta(sprawa.status)) {
      wpisy.push({
        id: ocena.oplacenie.idSprawy,
        data: ocena.oplacenie.termin,
        tytul: t.oplacenie.tytul({ miesiac: formatujMiesiac(ocena.oplacenie.miesiac) }),
      });
    }
  }
  wpisy.sort((a, b) => porownajDaty(a.data, b.data));
  const najblizsze = wpisy.slice(0, 3);
  if (ocena?.oplacenie) {
    const nastepny = dodajMiesiaceDoMiesiaca(ocena.oplacenie.miesiac, 1);
    najblizsze.push({
      id: `nastepna-${nastepny}`,
      data: terminOplaceniaSkladek(nastepny),
      tytul: t.oplacenie.tytul({ miesiac: formatujMiesiac(nastepny) }),
      opis: t.najblizszeTerminy.dodamy({ data: formatujDate(dzienUtworzeniaSprawyOplacenia(nastepny)) }),
    });
  }
  const daneCiazy = rodzina.daneCiazy;
  if (daneCiazy?.przewidywanyTerminPorodu && !daneCiazy.dataPoroduPotwierdzona) {
    najblizsze.push({
      id: 'ptp',
      data: daneCiazy.przewidywanyTerminPorodu,
      tytul: t.najblizszeTerminy.ptp,
      opis: t.najblizszeTerminy.ptpOpis,
    });
  }
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

export function KartaNaSkroty() {
  return (
    <Karta tytul={t.naSkroty.tytul} bezLinii>
      <Kafelki
        kolumny={2}
        kafelki={[
          { href: sciezkaWidoku('ViewZusAccountData'), etykieta: t.naSkroty.daneKontaZus },
          { href: sciezkaWidoku('ViewZusQuestion'), etykieta: t.naSkroty.pytanieDoZus },
        ]}
      />
    </Karta>
  );
}

function zZrodlem(wartosc: string, dana: DanaZeZrodla<unknown> | null | undefined): string {
  if (!dana) return wartosc;
  const zrodlo = t.daneProfilu.zrodla[dana.zrodlo as ZrodloDanej];
  return zrodlo ? t.daneProfilu.zZrodlem({ wartosc, zrodlo }) : wartosc;
}

export function KartaDanychPlanu({ kontekst }: { kontekst: KontekstRodziny }) {
  const { rodzina, daneZusMatki, dzis } = kontekst;
  const dane = rodzina.daneRodziny;
  const ciaza = rodzina.daneCiazy;
  const d = t.daneProfilu;
  const pozycje: PozycjaListyDefinicji[] = [];
  if (daneZusMatki) pozycje.push({ etykieta: d.matka, wartosc: `${daneZusMatki.imie} ${daneZusMatki.nazwisko}` });
  const formaMatki = dane.matka.formaZatrudnienia;
  if (formaMatki) pozycje.push({ etykieta: d.formaMatki, wartosc: zZrodlem(nazwaFormy(formaMatki.wartosc), formaMatki) });
  const duch = dane.matka.dobrowolneChorobowe;
  if (duch && (formaMatki?.wartosc === 'jdg' || formaMatki?.wartosc === 'umowa-zlecenia')) {
    pozycje.push({ etykieta: d.duch, wartosc: zZrodlem(duch.wartosc ? d.tak : d.nie, duch) });
  }
  const formaDrugiego = dane.drugiRodzic.formaZatrudnienia;
  if (formaDrugiego) {
    const imie = [dane.drugiRodzic.imie, dane.drugiRodzic.nazwisko].filter(Boolean).join(' ');
    const forma = nazwaFormy(formaDrugiego.wartosc);
    pozycje.push({
      etykieta: d.drugiRodzic,
      wartosc:
        formaDrugiego.wartosc === 'brak-drugiego-rodzica' || !imie ? forma : d.osobaZForma({ osoba: imie, forma: forma.toLowerCase() }),
    });
  }
  if (dane.stanCywilny) pozycje.push({ etykieta: d.stanCywilny, wartosc: d.stanyCywilne[dane.stanCywilny.wartosc] });
  if (ciaza?.dataPoroduPotwierdzona && ciaza.dataPorodu) {
    pozycje.push({ etykieta: d.dataPorodu, wartosc: formatujDate(ciaza.dataPorodu) });
  } else if (ciaza?.przewidywanyTerminPorodu) {
    pozycje.push({ etykieta: d.ptp, wartosc: formatujDate(ciaza.przewidywanyTerminPorodu) });
  }
  if (ciaza?.dataPierwszejWizyty) {
    pozycje.push({
      etykieta: d.wizyta,
      wartosc: ciaza.dataPierwszejWizyty === 'brak-wizyty' ? d.brakWizyty : formatujDate(ciaza.dataPierwszejWizyty),
    });
  }
  if (dane.dochodNaOsobe) {
    const dochod = dane.dochodNaOsobe.wartosc;
    pozycje.push({ etykieta: d.dochod, wartosc: dochod === 'nieznany' ? d.dochodNieznany : formatujKwote(dochod) });
  }
  if (ciaza) pozycje.push({ etykieta: d.liczbaDzieci, wartosc: String(ciaza.liczbaUrodzonychDzieci ?? ciaza.liczbaDzieciZCiazy ?? 1) });

  return (
    <Karta tytul={d.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        <p className="m-0 text-body-strong">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
        <ListaDefinicji pozycje={pozycje} />
        <div className="flex flex-wrap items-center gap-4">
          <PrzyciskLink wariant="drugorzedny" href={sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })}>
            {t.otworzProfil}
          </PrzyciskLink>
          <p className="m-0 min-w-0 flex-1 basis-60 text-body">{d.przelicz}</p>
        </div>
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
