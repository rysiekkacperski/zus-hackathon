'use client';

// Blok strażnika ubezpieczenia chorobowego w etapie Ciąża na ViewFamilyPlan (historyjka 3.6.1.3.1,
// wzory Plan-rodziny, P06-04, P06-05, P06-06, P06-08). Właściciel: u12.
import { dodajMiesiaceDoMiesiaca, formatujDate, formatujDateICzas } from '@/domena/daty';
import { formatujKwote, formatujProcent } from '@/domena/kwoty';
import { dzienUtworzeniaSprawyOplacenia, terminOplaceniaSkladek, type OcenaStraznika } from '@/domena/plan/straznik';
import type { PozycjaPlanu, Rola } from '@/domena/typy';
import { formatujMiesiac } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji, type PozycjaListyDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { StatusSprawy } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';

const t = teksty.ViewFamilyPlan.straznik;
const to = teksty.ViewFamilyPlan.oplacenie;

export interface StraznikPlanuProps {
  ocena: OcenaStraznika;
  sprawaOplacenia: PozycjaPlanu | undefined;
  rola: Rola;
  /** Imię i nazwisko matki w dopełniaczu dla konta Drugi rodzic. */
  matkaDopelniacz?: string;
  onPotwierdz: () => void;
}

function ZrodloOplacenia({ sprawa }: { sprawa: PozycjaPlanu }) {
  if (sprawa.status !== 'zalatwiona' || !sprawa.dataOznaczenia) return null;
  const data = formatujDate(sprawa.dataOznaczenia);
  if (sprawa.zrodloStatusu === 'dane-zus') return <p className="m-0 text-body">{to.zrodloZus({ data })}</p>;
  if (sprawa.zrodloStatusu === 'odpowiedz-rodzica') return <p className="m-0 text-body">{to.zrodloRodzica({ data })}</p>;
  return null;
}

export function StraznikPlanu({ ocena, sprawaOplacenia, rola, matkaDopelniacz, onPotwierdz }: StraznikPlanuProps) {
  const jdg = ocena.forma === 'jdg';
  const prog = formatujKwote(ocena.prog);
  const dataOdczytu = ocena.odczytano ? formatujDate(ocena.odczytano) : '';
  const oplacenie = ocena.oplacenie;
  const sprawa = sprawaOplacenia;
  const ostrzezeniaSprawy = sprawa?.ostrzezenia ?? oplacenie?.ostrzezenia ?? [];
  const zadluzenie = ostrzezeniaSprawy.find((o) => o.rodzaj === 'zadluzenie-ponad-prog');
  const niedostepny = ostrzezeniaSprawy.some((o) => o.rodzaj === 'stan-rozliczen-niedostepny');
  const status = sprawa?.status ?? oplacenie?.status;
  const mozePotwierdzic =
    rola === 'rodzic' && oplacenie !== null && oplacenie.potwierdzenieRodzica && status === 'do-zrobienia';
  const naglowek = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="m-0 text-body-strong text-ink">{t.tytul}</h3>
      {ocena.liczbaOstrzezen > 0 && rola !== 'drugi-rodzic' ? (
        <span className="text-body">{t.liczbaOstrzezen({ liczba: String(ocena.liczbaOstrzezen) })}</span>
      ) : null}
    </div>
  );

  if (rola === 'drugi-rodzic') {
    const osoba = matkaDopelniacz ?? t.matkiDomyslnie;
    const pozycje: PozycjaListyDefinicji[] = [
      {
        etykieta: t.duch,
        wartosc:
          ocena.duchAktywne === null
            ? t.brakWartosci
            : ocena.duchAktywne
              ? t.aktywneStanNa({ data: dataOdczytu })
              : t.nieaktywne,
      },
    ];
    if (oplacenie && status) {
      pozycje.push({
        etykieta: to.tytul({ miesiac: formatujMiesiac(oplacenie.miesiac) }),
        wartosc: <StatusSprawy status={status} />,
      });
    }
    return (
      <div className="flex flex-col gap-4 rounded-md border border-line bg-surface-sunken p-5">
        {naglowek}
        <p className="m-0 text-body">{t.wstepDrugiRodzic({ osoba })}</p>
        <ListaDefinicji pozycje={pozycje} />
        <Notatka>
          <p className="m-0">{t.tylkoNaKoncieMatki({ osoba })}</p>
        </Notatka>
      </div>
    );
  }

  const nastepnyMiesiac = oplacenie ? dodajMiesiaceDoMiesiaca(oplacenie.miesiac, 1) : null;

  return (
    <div className="flex flex-col gap-4 rounded-md border border-line bg-surface-sunken p-5">
      {naglowek}
      <p className="m-0 text-body">{jdg ? t.wstepJdg : t.wstepUz}</p>
      {ocena.daneZus && ocena.odczytano ? (
        <p className="m-0 text-body-strong">{t.stanNa({ data: formatujDateICzas(ocena.odczytano) })}</p>
      ) : (
        <p className="m-0 text-body">{t.brakDanychZus}</p>
      )}

      {ocena.duchAktywne === false ? (
        <div className="flex flex-col gap-3">
          <Komunikat typ="WARNING" tresc={jdg ? t.brakDuchJdg({ data: dataOdczytu }) : t.brakDuchUz({ data: dataOdczytu })} />
          <ListaDefinicji
            pozycje={[
              { etykieta: t.daneZus, wartosc: jdg ? t.brakDuchZusJdg : t.brakDuchZusUz },
              { etykieta: t.profil, wartosc: t.profilDuchTak },
            ]}
          />
          <div>
            <Odnosnik href={sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })}>
              {teksty.ViewFamilyPlan.otworzProfil}
            </Odnosnik>
          </div>
        </div>
      ) : ocena.daneZus ? (
        <ListaDefinicji
          pozycje={[
            { etykieta: t.duch, wartosc: t.aktywne },
            { etykieta: t.tytulUbezpieczenia, wartosc: jdg ? t.tytulJdg : t.tytulUz },
            ...(jdg
              ? [
                  {
                    etykieta: t.zadluzenie,
                    wartosc: ocena.zadluzenie === null ? t.brakWartosci : formatujKwote(ocena.zadluzenie),
                  },
                  { etykieta: t.prog, wartosc: prog },
                ]
              : []),
          ]}
        />
      ) : null}

      {ocena.podwyzszenie ? (
        <div className="flex flex-col gap-3">
          <Komunikat typ="WARNING" tresc={t.podwyzszenie({ procent: formatujProcent(ocena.podwyzszenie.wzrostProcent) })} />
          <Tabela
            podpis={t.podstawy.podpis}
            etykietaPrzewijania={t.podstawy.przewijanie}
            kolumny={[
              { klucz: 'podstawa', naglowek: t.podstawy.kolPodstawa },
              { klucz: 'kwota', naglowek: t.podstawy.kolKwota, liczbowa: true },
            ]}
            wiersze={[
              {
                id: 'srednia',
                podstawa: t.podstawy.srednia({
                  od: formatujMiesiac(ocena.podwyzszenie.miesiacOd),
                  doMiesiaca: formatujMiesiac(ocena.podwyzszenie.miesiacDo),
                }),
                kwota: formatujKwote(ocena.podwyzszenie.srednia),
              },
              {
                id: 'ostatnia',
                podstawa: formatujMiesiac(ocena.podwyzszenie.miesiacOstatni),
                kwota: formatujKwote(ocena.podwyzszenie.ostatnia),
              },
              {
                id: 'wzrost',
                podstawa: t.podstawy.wzrost,
                kwota: t.podstawy.wzrostWartosc({
                  kwota: formatujKwote(ocena.podwyzszenie.wzrost),
                  procent: formatujProcent(ocena.podwyzszenie.wzrostProcent),
                }),
              },
            ]}
          />
        </div>
      ) : null}

      {jdg ? <Komunikat typ="WARNING" tresc={t.opiekaSkladek({ prog })} /> : null}

      {oplacenie && status ? (
        <div className="flex flex-col gap-3 rounded-sm bg-surface-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <p className="m-0">
                <Odnosnik href={sciezkaWidoku('ViewCaseDetails', { idSprawy: oplacenie.idSprawy })} pochodzenie="plan">
                  {to.tytul({ miesiac: formatujMiesiac(oplacenie.miesiac) })}
                </Odnosnik>
              </p>
              <p className="m-0 text-body">{to.termin({ termin: formatujDate(terminOplaceniaSkladek(oplacenie.miesiac)) })}</p>
              {sprawa ? <ZrodloOplacenia sprawa={sprawa} /> : null}
            </div>
            <StatusSprawy status={status} />
          </div>
          {zadluzenie && zadluzenie.rodzaj === 'zadluzenie-ponad-prog' ? (
            <Komunikat
              typ="WARNING"
              tresc={t.zadluzeniePonadProg({
                data: formatujDate(zadluzenie.dzien),
                kwota: formatujKwote(zadluzenie.kwota),
                prog,
              })}
            />
          ) : null}
          {niedostepny ? <Komunikat kod="0150" /> : null}
          <div className="flex flex-wrap items-center gap-4">
            {mozePotwierdzic ? (
              <Przycisk wariant="glowny" onClick={onPotwierdz}>
                {t.potwierdz}
              </Przycisk>
            ) : null}
            <PrzyciskLink wariant="drugorzedny" href={sciezkaWidoku('ViewContributionBalance')}>
              {t.sprawdzStan}
            </PrzyciskLink>
          </div>
        </div>
      ) : null}

      {oplacenie && nastepnyMiesiac ? (
        <p className="m-0 text-body">
          {to.nastepna({
            miesiac: formatujMiesiac(nastepnyMiesiac),
            utworzenie: formatujDate(dzienUtworzeniaSprawyOplacenia(nastepnyMiesiac)),
            termin: formatujDate(terminOplaceniaSkladek(nastepnyMiesiac)),
          })}
        </p>
      ) : null}
    </div>
  );
}
