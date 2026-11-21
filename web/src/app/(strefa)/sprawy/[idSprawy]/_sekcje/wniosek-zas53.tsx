'use client';

// Sekcja ViewCaseDetails „wniosek-zas53” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u30.
// Akcja złożenia wniosku o zasiłek chorobowy przy sprawie K24 na koncie matki i karta zapisanego szkicu.
// Teksty: teksty.ViewCaseDetails.sekcjaWniosekZas53.
import { formatujDate } from '@/domena/daty';
import type { WniosekZas53 } from '@/domena/typy';
import { czyKontoMatki, czyPoUstaniu, ekranyZas53 } from '@/domena/wnioski/zas53';
import { Karta } from '@/komponenty/karta';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { ListaKrokow } from '@/komponenty/kroki';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujRachunek } from '@/domena/walidacje';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaWniosekZas53;
const tK = teksty.ViewZas53Start.kreator;

export function SekcjaWniosekZas53({ sprawa, kontekst, pochodzenie }: PropsSlotu<'sekcja'>) {
  if (sprawa.idPozycji !== 'K24') return null;
  if (!czyKontoMatki(kontekst.konto, kontekst.rodzina.daneRodziny)) return null;

  const wnioski = kontekst.rodzina.wnioski.filter(
    (w): w is WniosekZas53 => w.rodzaj === 'zas-53' && w.konto === kontekst.konto.pesel && w.idSprawy === sprawa.idSprawy,
  );
  const szkic = wnioski.filter((w) => w.stan === 'szkic').sort((a, b) => b.zaktualizowano.localeCompare(a.zaktualizowano))[0];
  const wyslany = wnioski
    .filter((w) => w.stan !== 'szkic')
    .sort((a, b) => (b.dataZlozenia ?? '').localeCompare(a.dataZlozenia ?? ''))[0];
  const start = trasy.ViewZas53Start({ sprawa: sprawa.idSprawy });
  const instrukcja = (
    <Odnosnik href={trasy.ViewCaseGuide({ idSprawy: sprawa.idSprawy })} pochodzenie={pochodzenie}>
      {t.instrukcja}
    </Odnosnik>
  );

  if (szkic) {
    const ekrany = ekranyZas53(czyPoUstaniu(szkic));
    const ekran = szkic.ostatniEkran ?? 'ViewZas53Certificate';
    const krok = Math.max(0, ekrany.indexOf(ekran));
    const z = szkic.zaswiadczenie;
    return (
      <Karta tytul={t.tytul} bezLinii as="section">
        <p className="m-0 mb-4 text-body-strong">{t.szkicZapisany({ data: formatujDate(szkic.zaktualizowano) })}</p>
        <ListaDefinicji
          szerokoscEtykiety="waska"
          pozycje={[
            ...(z
              ? [
                  {
                    etykieta: t.zaswiadczenie,
                    wartosc: t.zaswiadczenieWartosc({ numer: z.seriaINumer || tK.bezNumeru, od: formatujDate(z.od), do: formatujDate(z.do) }),
                  },
                ]
              : []),
            {
              etykieta: t.ostatniKrok,
              wartosc: t.ostatniKrokWartosc({
                krok: krok + 1,
                liczbaKrokow: ekrany.length,
                nazwa: tK.kroki[ekrany[krok] as keyof typeof tK.kroki],
              }),
            },
            ...(szkic.numerRachunku ? [{ etykieta: t.rachunek, wartosc: formatujRachunek(szkic.numerRachunku) }] : []),
          ]}
        />
        <p className="m-0 my-4">{t.wrocisz}</p>
        <div className="flex flex-wrap items-center gap-6">
          <PrzyciskLink href={start} wariant="glowny">
            {t.dokoncz}
          </PrzyciskLink>
          {instrukcja}
        </div>
      </Karta>
    );
  }

  return (
    <Karta tytul={t.tytul} bezLinii as="section">
      <p className="m-0 mb-4">{t.opis}</p>
      <ListaKrokow kroki={t.kroki.map((k) => <span key={k}>{k}</span>)} />
      {wyslany?.potwierdzenie && wyslany.dataZlozenia ? (
        <p className="m-0 mt-4">{t.wyslany({ numer: wyslany.potwierdzenie, data: formatujDate(wyslany.dataZlozenia) })}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <PrzyciskLink href={start} wariant="glowny">
          {t.akcja}
        </PrzyciskLink>
        {instrukcja}
      </div>
    </Karta>
  );
}
