'use client';

// ViewZamSummary (3.9.1.1.4): podsumowanie wniosku ZAM z akcjami Zmień, załącznikami (0149, 0260) i wysłaniem do ZUS.
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useDzis } from '@/dane/magazyn/hooki';
import { przygotujZamDlaPlatnika } from '@/dane/magazyn/operacje/wnioski-zam-rozszerzenia';
import { wyslijZam } from '@/dane/magazyn/operacje/wnioski-zam';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika, formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { IdWidoku, KodKomunikatu } from '@/domena/typy';
import { formatujRachunek } from '@/domena/walidacje';
import { czyPotrzebneZ3a, daneRodzicaWniosku, zalacznikiZam } from '@/domena/wnioski/zam';
import { parametryOkresuZam } from '@/domena/wnioski/zam-okresy';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Odnosnik } from '@/komponenty/odnosnik';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { Tabela } from '@/komponenty/tabela';
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

const t = teksty.ViewZamSummary;
const tk = teksty.ViewZamLeaveType.kreator;

function Sekcja({ tytul, ekran, idWniosku, children }: { tytul: string; ekran?: IdWidoku; idWniosku: string; children: ReactNode }) {
  return (
    <Karta
      tytul={tytul}
      bezLinii
      akcje={
        ekran ? (
          <Odnosnik href={adresEkranuZam(ekran, idWniosku)} aria-label={t.zmienSekcje({ sekcja: tytul })}>
            {t.zmien}
          </Odnosnik>
        ) : undefined
      }
    >
      {children}
    </Karta>
  );
}

function Podsumowanie({ dane }: { dane: DaneWnioskuZam }) {
  const router = useRouter();
  const dzis = useDzis();
  const { wniosek, kontekst, okresy } = dane;
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const kroki = useKrokiKreatoraZam(dane);
  const [wynik, ustawWynik] = useState<{ kod: KodKomunikatu; dataSzkicu?: string } | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const p = parametryOkresuZam(okresy, dzis);
  const adresat = wniosek.adresat ?? 'zus';
  const rodzicDane = daneRodzicaWniosku(kontekst.rodzina, okresy.rodzic);
  const zalaczniki = zalacznikiZam({ wniosek, adresat });

  const wyslij = async () => {
    if (zajety) return;
    ustawZajety(true);
    const ctx = pobierzKontekstOperacji();
    if (adresat === 'platnik-skladek') {
      const przygotowanie = przygotujZamDlaPlatnika(wniosek.idWniosku, ctx);
      if (!przygotowanie.ok) {
        ustawZajety(false);
        ustawWynik({ kod: przygotowanie.kod });
        return;
      }
      przejdz(adresEkranuZam('ViewZamForPayer', wniosek.idWniosku));
      return;
    }
    const dataSzkicu = formatujDate(dataZeZnacznika(wniosek.zaktualizowano));
    const odpowiedz = await wyslijZam(wniosek.idWniosku, ctx);
    if (!odpowiedz.ok) {
      ustawZajety(false);
      ustawWynik({ kod: odpowiedz.kod, dataSzkicu });
      return;
    }
    przejdz(adresEkranuZam('ViewZamSent', wniosek.idWniosku));
  };

  const komunikaty: ReactNode[] = [];
  if (wynik) komunikaty.push(<Komunikat key="wynik" kod={wynik.kod} />);
  if (wynik?.kod === '0038' && p.terminWariantu) {
    komunikaty.push(
      <p key="po-terminie" className="m-0">
        {t.poTerminie({ dataSzkicu: wynik.dataSzkicu ?? formatujDate(dzis), termin: formatujDate(p.terminWariantu) })}
      </p>,
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

  const rodzic = wniosek.daneRodzica;
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

  const ekranOkresu: IdWidoku = 'ViewZamPeriod';
  return (
    <RamaKreatoraZam ekran="ViewZamSummary" wniosek={wniosek} kroki={kroki} komunikaty={komunikaty.length > 0 ? komunikaty : null} boczna={boczna}>
      <p className="m-0">{t.wstep}</p>
      <Sekcja tytul={t.sekcje.rodzajUrlopu} ekran="ViewZamLeaveType" idWniosku={wniosek.idWniosku}>
        <p className="m-0">{nazwaRodzajuWniosku(wniosek)}</p>
      </Sekcja>
      <Sekcja tytul={t.sekcje.okresZasilku} ekran={ekranOkresu} idWniosku={wniosek.idWniosku}>
        {terminMinal ? <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p> : null}
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
        <p className="m-0 mt-4 text-body-strong">{t.stawkaZasilku({ stawka })}</p>
      </Sekcja>
      <Sekcja tytul={t.sekcje.wnioskodawcaIDziecko} ekran="ViewZamData" idWniosku={wniosek.idWniosku}>
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="m-0 mb-3 text-body-strong">{t.wnioskodawca}</h3>
            <DaneBoczne
              pozycje={[
                { etykieta: t.imieINazwisko, wartosc: rodzic ? `${rodzic.imie} ${rodzic.nazwisko}` : '' },
                { etykieta: t.pesel, wartosc: rodzic?.pesel ?? '' },
              ]}
            />
          </div>
          {wniosek.daneDzieci.map((d, i) => (
            <div key={i}>
              <h3 className="m-0 mb-3 text-body-strong">{t.dziecko}</h3>
              <DaneBoczne
                pozycje={[
                  { etykieta: t.imieINazwisko, wartosc: `${d.imie} ${d.nazwisko}` },
                  { etykieta: t.pesel, wartosc: d.pesel ?? '' },
                  { etykieta: t.dataUrodzenia, wartosc: d.dataUrodzenia ? formatujDate(d.dataUrodzenia) : '' },
                  { etykieta: t.miejsceUrodzenia, wartosc: d.miejsceUrodzenia ?? '' },
                ]}
              />
            </div>
          ))}
          {wniosek.przedPorodem ? (
            <DaneBoczne
              pozycje={[{ etykieta: t.przewidywanyTermin, wartosc: formatujDate(wniosek.przedPorodem.przewidywanyTerminPorodu) }]}
            />
          ) : null}
        </div>
      </Sekcja>
      <Sekcja tytul={t.sekcje.rachunek} ekran="ViewZamData" idWniosku={wniosek.idWniosku}>
        <p className="m-0">{wniosek.numerRachunku ? formatujRachunek(wniosek.numerRachunku) : ''}</p>
      </Sekcja>
      <Sekcja tytul={t.sekcje.oswiadczenia} ekran="ViewZamStatements" idWniosku={wniosek.idWniosku}>
        <p className="m-0">{wniosek.oswiadczeniaPotwierdzone ? t.potwierdzone : t.niepotwierdzone}</p>
      </Sekcja>
      <Sekcja tytul={t.sekcje.adresat} idWniosku={wniosek.idWniosku}>
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
        {adresat === 'zus' && !wniosek.przedPorodem ? <p className="m-0 mt-4">{t.bezOdpisu}</p> : null}
      </Sekcja>
      <PrzyciskiKreatora
        onWstecz={() => router.push(adresPoprzedniegoKrokuZam(kroki, 'ViewZamSummary', wniosek.idWniosku, 'ViewZamStatements'))}
        onZapisz={() => {
          const kod = zapiszDoDokonczenia(wniosek, {}, 'ViewZamSummary');
          if (kod) ustawWynik({ kod });
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
