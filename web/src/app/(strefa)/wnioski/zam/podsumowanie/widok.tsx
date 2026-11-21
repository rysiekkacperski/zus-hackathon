'use client';

// ViewZamSummary (3.9.1.1.4): podsumowanie wniosku ZAM w zakładkach, po jednej na sekcję, z akcjami Zmień,
// załącznikami (0149, 0260) i wysłaniem do ZUS. Wybrana zakładka żyje w parametrze ?zakladka=. Panele wszystkich
// zakładek zajmują jedno pole siatki, więc wysokość panelu i miejsce przycisków nie zmieniają się przy przełączaniu.
import { useRouter } from 'next/navigation';
import { useId, useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useDzis } from '@/dane/magazyn/hooki';
import { przygotujZamDlaPlatnika } from '@/dane/magazyn/operacje/wnioski-zam-rozszerzenia';
import { wyslijZam } from '@/dane/magazyn/operacje/wnioski-zam';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika, formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { DaneOsobyWniosku, KodKomunikatu } from '@/domena/typy';
import { formatujRachunek } from '@/domena/walidacje';
import { czyPotrzebneZ3a, daneRodzicaWniosku, zalacznikiZam } from '@/domena/wnioski/zam';
import { parametryOkresuZam } from '@/domena/wnioski/zam-okresy';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Odnosnik } from '@/komponenty/odnosnik';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { Tabela } from '@/komponenty/tabela';
import { useZakladkaWAdresie, Zakladki } from '@/komponenty/zakladki';
import { teksty } from '@/teksty';
import {
  adresEkranuZam,
  adresPoprzedniegoKrokuZam,
  BrakWnioskuZam,
  DaneBoczne,
  nazwaRodzajuWniosku,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  tekstStawki,
  useKrokiKreatoraZam,
  useWniosekZam,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../_czesci/kreator';
import {
  brakiPodsumowaniaZam,
  EKRAN_ZMIANY_ZAKLADKI,
  pierwszaZakladkaZBrakiem,
  ZAKLADKI_PODSUMOWANIA_ZAM,
  type ZakladkaPodsumowaniaZam,
} from './_czesci/zakladki-podsumowania';

const t = teksty.ViewZamSummary;
const tk = teksty.ViewZamLeaveType.kreator;

const SEKCJA_ZAKLADKI: Record<ZakladkaPodsumowaniaZam, string> = {
  rodzaj: t.sekcje.rodzajUrlopu,
  okres: t.sekcje.okresZasilku,
  dane: t.sekcje.wnioskodawcaIDziecko,
  rachunek: t.sekcje.rachunek,
  oswiadczenia: t.sekcje.oswiadczenia,
  adresat: t.sekcje.adresat,
};

/** Dane osoby w siatce: na szerokiej kolumnie cztery pozycje w wierszu, na telefonie jedna pod drugą. */
function SiatkaDanych({ pozycje }: { pozycje: { etykieta: string; wartosc: ReactNode }[] }) {
  return (
    <dl className="m-0 grid grid-cols-[repeat(auto-fill,minmax(min(12rem,100%),1fr))] gap-x-6 gap-y-4">
      {pozycje.map((p) => (
        <div key={p.etykieta} className="min-w-0">
          <dt className="text-body-strong">{p.etykieta}</dt>
          <dd className="m-0 break-words">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Panel jednej zakładki: karta z treścią sekcji, komunikatem braku danych i akcją Zmień po prawej. Panel
 * niewybranej zakładki zostaje w siatce niewidoczny, więc nie trafia do czytnika ani do kolejności fokusu.
 */
function PanelZakladki({
  zakladka,
  widoczny,
  idWniosku,
  brak,
  idBraku,
  children,
}: {
  zakladka: ZakladkaPodsumowaniaZam;
  widoczny: boolean;
  idWniosku: string;
  brak?: KodKomunikatu;
  idBraku: string;
  children: ReactNode;
}) {
  const ekran = EKRAN_ZMIANY_ZAKLADKI[zakladka];
  return (
    <div aria-hidden={widoczny ? undefined : true} className={widoczny ? 'col-start-1 row-start-1 min-w-0' : 'invisible col-start-1 row-start-1 min-w-0'}>
      <Karta as="div" className="h-full pt-0">
        <div className={ekran ? 'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6' : 'grid grid-cols-[minmax(0,1fr)]'}>
          <div className="flex min-w-0 flex-col gap-4">
            {brak ? (
              <div id={idBraku} tabIndex={-1} className="outline-none">
                <Komunikat kod={brak} />
              </div>
            ) : null}
            {children}
          </div>
          {ekran ? (
            <Odnosnik href={adresEkranuZam(ekran, idWniosku)} aria-label={t.zmienSekcje({ sekcja: SEKCJA_ZAKLADKI[zakladka] })}>
              {t.zmien}
            </Odnosnik>
          ) : null}
        </div>
      </Karta>
    </div>
  );
}

function Podsumowanie({ dane }: { dane: DaneWnioskuZam }) {
  const router = useRouter();
  const dzis = useDzis();
  const baza = useId();
  const { wniosek, kontekst, okresy } = dane;
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const kroki = useKrokiKreatoraZam(dane);
  const [zakladka, wybierzZakladke] = useZakladkaWAdresie(ZAKLADKI_PODSUMOWANIA_ZAM);
  const [wynik, ustawWynik] = useStanChwilowy<{ kod: KodKomunikatu; dataSzkicu?: string } | null>(null);
  const refWyniku = useRef<HTMLDivElement>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const p = parametryOkresuZam(okresy, dzis);
  const adresat = wniosek.adresat ?? 'zus';
  const rodzicDane = daneRodzicaWniosku(kontekst.rodzina, okresy.rodzic);
  const zalaczniki = zalacznikiZam({ wniosek, adresat });
  const braki = brakiPodsumowaniaZam(wniosek);
  const idBraku = (z: ZakladkaPodsumowaniaZam) => `${baza}-brak-${z}`;

  /** Komunikat wyniku nad zakładkami z fokusem; 0038 zmienia okres, więc pokazuje zakładkę okresu. */
  function pokazWynik(nowy: { kod: KodKomunikatu; dataSzkicu?: string }) {
    flushSync(() => {
      ustawZajety(false);
      ustawWynik(nowy);
      if (nowy.kod === '0038') wybierzZakladke('okres');
    });
    refWyniku.current?.focus();
  }

  const wyslij = async () => {
    if (zajety) return;
    const zBrakiem = pierwszaZakladkaZBrakiem(braki);
    if (zBrakiem) {
      flushSync(() => wybierzZakladke(zBrakiem));
      document.getElementById(idBraku(zBrakiem))?.focus();
      return;
    }
    ustawZajety(true);
    const ctx = pobierzKontekstOperacji();
    if (adresat === 'platnik-skladek') {
      const przygotowanie = przygotujZamDlaPlatnika(wniosek.idWniosku, ctx);
      if (!przygotowanie.ok) {
        pokazWynik({ kod: przygotowanie.kod });
        return;
      }
      przejdz(adresEkranuZam('ViewZamForPayer', wniosek.idWniosku));
      return;
    }
    const dataSzkicu = formatujDate(dataZeZnacznika(wniosek.zaktualizowano));
    const odpowiedz = await wyslijZam(wniosek.idWniosku, ctx);
    if (!odpowiedz.ok) {
      pokazWynik({ kod: odpowiedz.kod, dataSzkicu });
      return;
    }
    przejdz(adresEkranuZam('ViewZamSent', wniosek.idWniosku));
  };

  const komunikaty: ReactNode[] = [];
  if (wynik) {
    komunikaty.push(
      <div key="wynik" ref={refWyniku} tabIndex={-1} className="flex flex-col gap-3 outline-none">
        <Komunikat kod={wynik.kod} />
        {wynik.kod === '0038' && p.terminWariantu ? (
          <p className="m-0">
            {t.poTerminie({ dataSzkicu: wynik.dataSzkicu ?? formatujDate(dzis), termin: formatujDate(p.terminWariantu) })}
          </p>
        ) : null}
      </div>,
    );
  }
  if (zalaczniki.length > 0) {
    komunikaty.push(<Komunikat key="0149" kod="0149" parametry={{ listaDokumentow: zalaczniki.map((z) => t.dokumenty[z]).join(', ') }} />);
  }
  if (czyPotrzebneZ3a(rodzicDane.forma, adresat)) komunikaty.push(<Komunikat key="0260" kod="0260" />);

  const jednaStawka = new Set(wniosek.okresy.map((o) => o.stawka ?? 100));
  const stawka =
    wniosek.okresy.length > 1 && jednaStawka.size === 1
      ? tk.stawkaZaCalyOkres({ stawka: formatujProcent([...jednaStawka][0]) })
      : wniosek.okresy.map((o) => tekstStawki(o.stawka)).join(', ');

  const konto = kontekst.konto;
  const rodzic: DaneOsobyWniosku = wniosek.daneRodzica ?? { imie: konto.imie, nazwisko: konto.nazwisko, pesel: konto.pesel };
  const nazwaPlatnika = rodzicDane.platnikZasilku?.nazwaPlatnika;
  const poBledzie = wynik?.kod === '0044';
  const terminMinal = !okresy.przedPorodem && wniosek.rodzajUrlopu === 'macierzynski' && !p.wariantDostepny;

  const boczna = (
    <>
      {wniosek.rodzajUrlopu === 'macierzynski' && !okresy.przedPorodem && p.terminWariantu ? (
        <Karta tytul={t.boczna.terminTytul} bezLinii>
          <div className="flex items-start gap-3">
            <Ikona nazwa="zegar" className="flex-none text-brand" />
            <p className="m-0">
              {terminMinal
                ? t.boczna.terminMinal({ data: formatujDate(p.terminWariantu) })
                : (poBledzie ? t.boczna.terminPoBledzie : t.boczna.terminTresc)({
                    data: formatujDate(p.terminWariantu),
                    dni: tk.dni({ liczba: Math.max(0, p.dniDoTerminu ?? 0) }),
                  })}
            </p>
          </div>
        </Karta>
      ) : null}
      {adresat === 'zus' ? (
        <Karta tytul={t.boczna.poWyslaniuTytul} bezLinii>
          <p className="m-0">{t.boczna.poWyslaniuTresc}</p>
        </Karta>
      ) : null}
    </>
  );

  const tresci: Record<ZakladkaPodsumowaniaZam, ReactNode> = {
    rodzaj: <DaneBoczne pozycje={[{ etykieta: t.sekcje.rodzajUrlopu, wartosc: nazwaRodzajuWniosku(wniosek) }]} />,
    okres: (
      <>
        <Tabela
          podpis={t.tabela.podpis}
          etykietaPrzewijania={t.tabela.przewijanie}
          kolumny={[
            { klucz: 'urlop', naglowek: t.tabela.urlop, tytulowa: true },
            { klucz: 'od', naglowek: t.tabela.od },
            { klucz: 'do', naglowek: t.tabela.do },
            { klucz: 'zasilek', naglowek: t.tabela.zasilek },
          ]}
          wiersze={wniosek.okresy.map((o) => ({
            id: `${o.rodzajUrlopu}-${o.od}`,
            urlop: tk.rodzajeUrlopu[o.rodzajUrlopu],
            od: formatujDate(o.od),
            do: formatujDate(o.do),
            zasilek: tekstStawki(o.stawka),
          }))}
        />
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="m-0 text-body-strong">{t.stawkaZasilku({ stawka })}</p>
          {terminMinal ? <p className="m-0">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p> : null}
        </div>
      </>
    ),
    dane: (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="m-0 mb-3 text-body-strong">{t.wnioskodawca}</h3>
          <SiatkaDanych
            pozycje={[
              { etykieta: t.imieINazwisko, wartosc: `${rodzic.imie} ${rodzic.nazwisko}`.trim() },
              { etykieta: t.pesel, wartosc: rodzic.pesel ?? '' },
            ]}
          />
        </div>
        {wniosek.daneDzieci.map((d, i) => (
          <div key={i}>
            <h3 className="m-0 mb-3 text-body-strong">{t.dziecko}</h3>
            <SiatkaDanych
              pozycje={[
                { etykieta: t.imieINazwisko, wartosc: `${d.imie} ${d.nazwisko}`.trim() },
                { etykieta: t.pesel, wartosc: d.pesel ?? '' },
                { etykieta: t.dataUrodzenia, wartosc: d.dataUrodzenia ? formatujDate(d.dataUrodzenia) : '' },
                { etykieta: t.miejsceUrodzenia, wartosc: d.miejsceUrodzenia ?? '' },
              ]}
            />
          </div>
        ))}
        {wniosek.przedPorodem ? (
          <SiatkaDanych
            pozycje={[{ etykieta: t.przewidywanyTermin, wartosc: formatujDate(wniosek.przedPorodem.przewidywanyTerminPorodu) }]}
          />
        ) : null}
      </div>
    ),
    rachunek: (
      <DaneBoczne
        pozycje={[{ etykieta: t.sekcje.rachunek, wartosc: wniosek.numerRachunku ? formatujRachunek(wniosek.numerRachunku) : '' }]}
      />
    ),
    oswiadczenia: (
      <DaneBoczne
        pozycje={[{ etykieta: t.sekcje.oswiadczenia, wartosc: wniosek.oswiadczeniaPotwierdzone ? t.potwierdzone : t.niepotwierdzone }]}
      />
    ),
    adresat: (
      <>
        <DaneBoczne
          pozycje={[
            {
              etykieta: t.trafiDo,
              wartosc:
                adresat === 'platnik-skladek'
                  ? nazwaPlatnika
                    ? t.adresatPlatnik({ nazwa: nazwaPlatnika })
                    : t.adresatPlatnikBezNazwy
                  : t.adresatZus,
            },
          ]}
        />
        {adresat === 'zus' && !wniosek.przedPorodem ? <p className="m-0">{t.bezOdpisu}</p> : null}
      </>
    ),
  };

  return (
    <RamaKreatoraZam ekran="ViewZamSummary" wniosek={wniosek} kroki={kroki} komunikaty={komunikaty.length > 0 ? komunikaty : null} boczna={boczna}>
      <p className="m-0">{t.wstep}</p>
      <Zakladki<ZakladkaPodsumowaniaZam>
        etykieta={t.zakladkiEtykieta}
        zakladki={ZAKLADKI_PODSUMOWANIA_ZAM.map((z) => ({ wartosc: z, etykieta: t.zakladki[z], blad: braki[z] !== undefined }))}
        wybrana={zakladka}
        onWybor={wybierzZakladke}
        tloPaneli="card"
      >
        <div className="grid grid-cols-[minmax(0,1fr)]">
          {ZAKLADKI_PODSUMOWANIA_ZAM.map((z) => (
            <PanelZakladki
              key={z}
              zakladka={z}
              widoczny={z === zakladka}
              idWniosku={wniosek.idWniosku}
              brak={braki[z]}
              idBraku={idBraku(z)}
            >
              {tresci[z]}
            </PanelZakladki>
          ))}
        </div>
      </Zakladki>
      <PrzyciskiKreatora
        onWstecz={() => router.push(adresPoprzedniegoKrokuZam(kroki, 'ViewZamSummary', wniosek.idWniosku, 'ViewZamStatements'))}
        onZapisz={() => {
          const kod = zapiszDoDokonczenia(wniosek, {}, 'ViewZamSummary');
          if (kod) pokazWynik({ kod });
        }}
        onDalej={() => void wyslij()}
        etykietaDalej={adresat === 'platnik-skladek' ? t.przygotuj : poBledzie ? t.wyslijPonownie : t.wyslij}
        zajety={zajety}
      />
    </RamaKreatoraZam>
  );
}

export function WidokPodsumowaniaZam() {
  const { dane } = useWniosekZam();
  if (dane === null) return <BrakWnioskuZam ekran="ViewZamSummary" />;
  if (dane.wniosek.stan !== 'szkic') return <SzkieletWidoku />;
  return <Podsumowanie key={dane.wniosek.idWniosku} dane={dane} />;
}
