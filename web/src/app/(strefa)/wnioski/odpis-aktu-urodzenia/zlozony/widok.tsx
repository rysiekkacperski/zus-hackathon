'use client';

import { useSearchParams } from 'next/navigation';
import { DanePytania } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
import { useKonto, useParametry, useRodzina } from '@/dane/magazyn/hooki';
import { rodzicKontaWRodzinie } from '@/domena/pytania-zus/kontekst';
import type { WniosekOOdpis } from '@/domena/typy';
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos, UkladDwuKolumnowy, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewBirthCertificateRequestSent;
const tw = teksty.ViewBirthCertificateRequest;

export function WidokZlozonegoWnioskuOOdpis() {
  const parametry = useSearchParams();
  const konto = useKonto();
  const rodzina = useRodzina();
  const parametrySystemu = useParametry();
  const idWniosku = parametry.get('wniosek');

  const wnioski = (rodzina?.wnioski ?? []).filter(
    (w): w is WniosekOOdpis => w.rodzaj === 'odpis-aktu-urodzenia' && w.stan === 'zlozony',
  );
  const wniosek = wnioski.find((w) => w.idWniosku === idWniosku) ?? (idWniosku ? undefined : wnioski.at(-1));
  const powrot = { href: trasy.ViewFamilyPlan(), etykieta: t.powrotPlan };

  if (wniosek === undefined || rodzina === null || konto === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
        <Karta>
          <p className="m-0 text-body">{t.brakWniosku}</p>
        </Karta>
      </>
    );
  }

  const dziecko = wniosek.daneDziecka;
  const wnioskodawca = wniosek.daneWnioskodawcy;
  const kto = rodzicKontaWRodzinie(rodzina.daneRodziny, konto.pesel);
  const daneRodzica = kto === 'matka' ? rodzina.daneRodziny.matka : rodzina.daneRodziny.drugiRodzic;
  const platnik = daneRodzica.platnikZasilku?.wartosc;
  const forma = daneRodzica.formaZatrudnienia?.wartosc;
  const przeznaczenie: string[] = [];
  if (forma === 'umowa-o-prace') przeznaczenie.push(t.przeznaczenie.pracownik);
  if (platnik === 'zus') przeznaczenie.push(t.przeznaczenie.zus);
  else if (platnik === 'platnik-skladek') przeznaczenie.push(t.przeznaczenie.platnik);
  const doreczenie =
    wniosek.sposobOdbioru === 'poczta'
      ? t.doreczenie.poczta({ adres: wniosek.adresDoDoreczenia ?? '' })
      : wniosek.sposobOdbioru === 'osobiscie'
        ? t.doreczenie.osobiscie({ urzad: wniosek.urzadStanuCywilnego ?? '' })
        : t.doreczenie['e-doreczenia'];
  const adresInstrukcji = trasy.ViewCaseGuide({ idSprawy: wniosek.idSprawy });

  const tresc = (
    <>
      <Karta tytul={t.kartaPotwierdzenia} bezLinii>
        <Stos odstep={4}>
          <DanePytania
            wiersze={[
              ...(wniosek.potwierdzenie ? [{ etykieta: t.numer, wartosc: wniosek.potwierdzenie }] : []),
              ...(wniosek.dataZlozenia ? [{ etykieta: t.dataZlozenia, wartosc: formatujDate(wniosek.dataZlozenia) }] : []),
              ...(wniosek.przewidywanyDzienWydania
                ? [{ etykieta: t.dzienWydania, wartosc: formatujDate(wniosek.przewidywanyDzienWydania) }]
                : []),
              ...(wniosek.rodzajOdpisu ? [{ etykieta: t.rodzaj, wartosc: tw.rodzaj.opcje[wniosek.rodzajOdpisu].etykieta }] : []),
              ...(wniosek.cel ? [{ etykieta: t.cel, wartosc: tw.cel.opcje[wniosek.cel] }] : []),
              {
                etykieta: t.oplata,
                wartosc: wniosek.oplataSkarbowa ? formatujKwote(wniosek.oplataSkarbowa) : tw.cel.bezOplaty,
              },
              ...(wniosek.sposobOdbioru ? [{ etykieta: t.odbior, wartosc: tw.odbior.opcje[wniosek.sposobOdbioru].etykieta }] : []),
              ...(wniosek.adresDoDoreczenia ? [{ etykieta: t.adres, wartosc: wniosek.adresDoDoreczenia }] : []),
              ...(wniosek.urzadStanuCywilnego ? [{ etykieta: t.urzad, wartosc: wniosek.urzadStanuCywilnego }] : []),
              { etykieta: t.adresat, wartosc: t.adresatRejestr },
            ]}
          />
          {parametrySystemu.trybDemonstracyjny ? <FlagaDemo>{t.flaga}</FlagaDemo> : null}
        </Stos>
      </Karta>
      <Karta tytul={t.kartaDanych} bezLinii>
        <Stos odstep={6}>
          {dziecko ? (
            <section className="grid gap-3">
              <h3 className="m-0 text-body-strong text-ink">{t.dziecko}</h3>
              <DanePytania
                wiersze={[
                  { etykieta: t.imieINazwisko, wartosc: `${dziecko.imie} ${dziecko.nazwisko}` },
                  {
                    etykieta: t.dataIMiejsce,
                    wartosc: [dziecko.dataUrodzenia ? formatujDate(dziecko.dataUrodzenia) : null, dziecko.miejsceUrodzenia]
                      .filter(Boolean)
                      .join(', '),
                  },
                  ...(dziecko.pesel ? [{ etykieta: t.pesel, wartosc: dziecko.pesel }] : []),
                ]}
              />
            </section>
          ) : null}
          {wnioskodawca ? (
            <section className="grid gap-3">
              <h3 className="m-0 text-body-strong text-ink">{t.wnioskodawca}</h3>
              <DanePytania
                wiersze={[
                  { etykieta: t.imieINazwisko, wartosc: `${wnioskodawca.imie} ${wnioskodawca.nazwisko}` },
                  ...(wnioskodawca.pesel ? [{ etykieta: t.pesel, wartosc: wnioskodawca.pesel }] : []),
                  { etykieta: t.wnioskujeszJako, wartosc: t.rodzicDziecka },
                ]}
              />
            </section>
          ) : null}
        </Stos>
      </Karta>
      <Karta tytul={t.kartaSprawy} bezLinii>
        <Stos odstep={4}>
          <div className="grid gap-1">
            <p className="m-0 text-body-strong">{t.tytulSprawy}</p>
            {wniosek.dataZlozenia ? <p className="m-0 text-body">{t.statusSprawy({ data: formatujDate(wniosek.dataZlozenia) })}</p> : null}
          </div>
          <Wiersz>
            <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
              {t.przejdzDoPlanu}
            </PrzyciskLink>
            <PrzyciskLink href={adresInstrukcji} wariant="drugorzedny">
              {t.instrukcjaSprawy}
            </PrzyciskLink>
          </Wiersz>
        </Stos>
      </Karta>
    </>
  );

  const boczna = (
    <Karta tytul={t.coDalej} bezLinii>
      <Stos odstep={4}>
        <p className="m-0 text-body">{doreczenie}</p>
        {przeznaczenie.map((p) => (
          <p key={p} className="m-0 text-body">
            {p}
          </p>
        ))}
        <p className="m-0 text-body">{t.listaWnioskow}</p>
        <Odnosnik href={trasy.ViewApplicationList()}>{t.twojeWnioski}</Odnosnik>
      </Stos>
    </Karta>
  );

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
      <UkladDwuKolumnowy tresc={tresc} boczna={boczna} etykietaBocznej={t.coDalej} />
    </>
  );
}
