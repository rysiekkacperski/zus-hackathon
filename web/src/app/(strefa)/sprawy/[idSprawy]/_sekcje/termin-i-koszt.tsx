'use client';

// Sekcja ViewCaseDetails „termin-i-koszt” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u13.
// Termin z opisem daty kotwiczącej, dwa terminy, terminy powtarzalne i koszt spóźnienia z wyliczeniem
// (wzory P07-09..P07-15). Teksty: teksty.ViewCaseDetails.sekcjaTerminIKoszt.
import { miesiacNaglowka, wyjasnienieKosztu } from '@/app/(strefa)/terminy/_czesci/prezentacja';
import { dodajDni, formatujDate, roznicaDni } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { czyKosztMinimalny, rodzajKosztu } from '@/domena/terminy/koszt';
import { REGULY_POZYCJI } from '@/domena/terminy/reguly';
import { statusDlaKalendarza } from '@/domena/terminy/wylicz-terminy';
import type { DataISO, TerminSprawy } from '@/domena/typy';
import { Akordeon } from '@/komponenty/akordeon';
import { formatujLiczbe } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaTerminIKoszt;
const tl = teksty.ViewDeadlines;

function DniDoTerminu({ data, dzis }: { data: DataISO; dzis: DataISO }) {
  const dni = roznicaDni(dzis, data);
  if (dni < 0) {
    return (
      <>
        <p className="m-0 text-body font-semibold text-ink-strong">{t.poTerminie}</p>
        <p className="m-0 text-body">{t.minal({ liczba: formatujLiczbe(-dni) })}</p>
      </>
    );
  }
  return <p className="m-0 text-body">{dni === 0 ? t.dzisTermin : t.dniDoTerminu({ liczba: formatujLiczbe(dni) })}</p>;
}

function Przypomnienia() {
  return (
    <Notatka>
      <p className="m-0">
        {t.przypomnienia}{' '}
        <Odnosnik wTekscie href={sciezkaWidoku('ViewGuideSettings')}>
          {t.ustawieniach}
        </Odnosnik>
        .
      </p>
    </Notatka>
  );
}

function KartaKosztu({ termin, idPozycji, dzis }: { termin: TerminSprawy; idPozycji: string | null; dzis: DataISO }) {
  const koszt = termin.koszt;
  if (koszt.rodzaj !== 'kwota' || termin.termin === null) return null;
  const miesieczny = rodzajKosztu(idPozycji) === 'miesieczny' && koszt.rozbicie.length > 0;
  const naglowek =
    koszt.moment === 'na-dzis' ? t.naDzis({ data: formatujDate(dzis) }) : t.wDniuPoTerminie({ data: formatujDate(dodajDni(termin.termin, 1)) });
  const wyjasnienie = wyjasnienieKosztu(koszt, idPozycji);
  const ostatniMiesiac = koszt.rozbicie[koszt.rozbicie.length - 1];
  return (
    <Karta tytul={t.kosztSpoznienia} bezLinii>
      <p className="m-0 text-body font-semibold">{naglowek}</p>
      <p className="m-0 text-amount text-ink-strong">
        {czyKosztMinimalny(idPozycji) ? <span className="text-body font-semibold">{`${t.coNajmniej} `}</span> : null}
        {formatujKwote(koszt.kwota)}
      </p>
      {wyjasnienie && !miesieczny ? <p className="m-0 mt-2 text-body">{wyjasnienie}</p> : null}
      <p className="m-0 mt-2 text-body">{miesieczny ? t.opisKosztuMiesiecznego : t.opisKosztuJednorazowego}</p>
      {miesieczny ? (
        <Akordeon id="koszt-wyliczenie" naglowek={t.jakPoliczylismyKoszt} domyslnieOtwarty>
          <Tabela<'miesiac' | 'kwota' | 'razem'>
            podpis={t.podpisTabeli}
            etykietaPrzewijania={t.przewijanieTabeli}
            kwoty
            kolumny={[
              { klucz: 'miesiac', naglowek: t.kolumnaMiesiac },
              { klucz: 'kwota', naglowek: t.kolumnaKwota, liczbowa: true },
              { klucz: 'razem', naglowek: t.kolumnaRazem, liczbowa: true },
            ]}
            wiersze={koszt.rozbicie.map((r) => ({
              id: r.miesiac,
              miesiac: miesiacNaglowka(r.miesiac),
              kwota: formatujKwote(r.kwotaNaDziecko),
              razem: formatujKwote(r.kwotaNaDziecko * koszt.liczbaDzieci),
            }))}
            suma={{ miesiac: t.razem, razem: formatujKwote(koszt.kwota) }}
          />
          <p className="m-0 mt-4 text-body">
            {t.wyjasnienie({ liczba: String(koszt.liczbaDzieci) })}{' '}
            {koszt.moment === 'dzien-po-terminie' && ostatniMiesiac
              ? t.wzrost({ kwota: formatujKwote(ostatniMiesiac.kwotaNaDziecko * koszt.liczbaDzieci) })
              : null}
          </p>
        </Akordeon>
      ) : null}
    </Karta>
  );
}

export function SekcjaTerminIKoszt({ sprawa, termin, kontekst }: PropsSlotu<'sekcja'>) {
  if (!termin) return null;
  const dzis = kontekst.dzis;
  const status = statusDlaKalendarza(sprawa, dzis);
  const powtarzalna = !!sprawa.idPozycji && REGULY_POZYCJI[sprawa.idPozycji]?.typ === 'coroczny';

  // Sprawa powtarzalna załatwiona w bieżącym roku: następny termin i powrót do statusu do zrobienia (wzór P07-13).
  if (status === 'zalatwiona' && powtarzalna && termin.powtarzalny?.nastepnyTermin) {
    const rok = sprawa.dataOznaczenia?.slice(0, 4) ?? dzis.slice(0, 4);
    return (
      <Stos odstep={7.5}>
        <Karta tytul={t.termin} bezLinii>
          <p className="m-0 text-body font-semibold">{t.zalatwionaWRoku({ rok })}</p>
          <dl className="m-0 mt-4">
            <dt className="text-body font-semibold">{t.nastepnyTermin}</dt>
            <dd className="m-0 text-amount text-ink-strong">{formatujDate(termin.powtarzalny.nastepnyTermin)}</dd>
          </dl>
          {termin.powtarzalny.powrotDoZrobienia ? (
            <p className="m-0 mt-2 text-body">{t.wracaDoZrobienia({ data: formatujDate(termin.powtarzalny.powrotDoZrobienia) })}</p>
          ) : null}
          <p className="m-0 mt-2 flex items-center gap-2 text-body">{t.powtarzaSie}</p>
        </Karta>
      </Stos>
    );
  }

  if (status !== 'do-zrobienia' && status !== 'wymaga-uzupelnienia-profilu') return null;
  if (termin.termin === null && termin.koszt.rodzaj === 'brak') return null;

  const koszt = termin.koszt;
  const skutek = koszt.rodzaj === 'skutek' ? koszt.tekst : null;
  const opisKotwicy = termin.kotwica?.opis;

  const kartaTerminu =
    termin.termin === null ? null : termin.drugiTermin ? (
      <Karta tytul={t.terminy({ liczba: '2' })} bezLinii>
        <p className="m-0 text-body">{t.dwaTerminyWstep}</p>
        <ol className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
          {[
            { data: termin.termin, klucz: 'wniosek-o-urlop', opis: opisKotwicy },
            {
              data: termin.drugiTermin.data,
              klucz: termin.drugiTermin.kluczEtykiety,
              opis: opisKotwicy && termin.kotwica ? opisKotwicy.replace(/o \d+ dni$/, `o ${roznicaDni(termin.kotwica.data, termin.drugiTermin.data)} dni`) : undefined,
            },
          ]
            .sort((a, b) => (a.data < b.data ? -1 : 1))
            .map((p, i) => (
              <li key={p.klucz} className={['flex flex-wrap gap-x-6 gap-y-2', i === 0 ? 'border-b border-line-row pb-4' : ''].join(' ')}>
                <div className="w-40 shrink-0">
                  <p className="m-0 text-body font-semibold text-ink-strong">{formatujDate(p.data)}</p>
                  <DniDoTerminu data={p.data} dzis={dzis} />
                </div>
                <div className="min-w-0 flex-[1_1_320px]">
                  <h3 className="m-0 text-body font-semibold">
                    {(tl.etykietyDrugiegoTerminu as Record<string, string>)[p.klucz] ?? p.klucz}
                  </h3>
                  <p className="m-0 mt-1 text-body">{(t.opisDrugiegoTerminu as Record<string, string>)[p.klucz] ?? null}</p>
                  {p.opis ? <p className="m-0 mt-1 text-body">{t.jakPoliczylismyZDwukropkiem({ opis: p.opis })}</p> : null}
                </div>
              </li>
            ))}
        </ol>
        {skutek ? (
          <dl className="m-0 mt-4">
            <dt className="text-body font-semibold">{t.skutekSpoznienia}</dt>
            <dd className="m-0 text-body">{`${skutek.charAt(0).toUpperCase()}${skutek.slice(1)}`}</dd>
          </dl>
        ) : null}
        <div className="mt-4">
          <Przypomnienia />
        </div>
      </Karta>
    ) : (
      <Karta tytul={t.termin} bezLinii>
        <p className="m-0 text-amount text-ink-strong">{formatujDate(termin.termin)}</p>
        <DniDoTerminu data={termin.termin} dzis={dzis} />
        {termin.szacowany ? <p className="m-0 mt-1 text-body font-semibold text-ink-strong">{t.szacowany}</p> : null}
        {powtarzalna ? <p className="m-0 mt-1 text-body">{t.powtarzaSie}</p> : null}
        {powtarzalna && termin.powtarzalny?.poczatekSkladania ? (
          <div className="mt-4">
            <h3 className="m-0 text-body font-semibold">{t.wazneDaty({ rok: termin.termin.slice(0, 4) })}</h3>
            <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
              <li>
                <span className="font-semibold">{formatujDate(termin.powtarzalny.poczatekSkladania)}</span> {t.poczatekSkladania}
                {dzis >= termin.powtarzalny.poczatekSkladania ? `: ${t.trwa}` : null}
              </li>
              {termin.powtarzalny.zalecanyTermin ? (
                <li>
                  <span className="font-semibold">{formatujDate(termin.powtarzalny.zalecanyTermin)}</span> {t.zalecanyTermin}
                  {roznicaDni(dzis, termin.powtarzalny.zalecanyTermin) >= 0
                    ? `: ${t.dniDoTerminu({ liczba: formatujLiczbe(roznicaDni(dzis, termin.powtarzalny.zalecanyTermin)) })}`
                    : null}
                </li>
              ) : null}
              <li>
                <span className="font-semibold">{formatujDate(termin.termin)}</span> {t.terminWniosku}
              </li>
            </ul>
          </div>
        ) : null}
        {opisKotwicy ? (
          <dl className="m-0 mt-4">
            <dt className="text-body font-semibold">{t.jakPoliczylismy}</dt>
            <dd className="m-0 text-body">{t.opisTerminu({ opis: opisKotwicy })}</dd>
          </dl>
        ) : null}
        {skutek ? (
          <dl className="m-0 mt-4">
            <dt className="text-body font-semibold">{t.skutekSpoznienia}</dt>
            <dd className="m-0 text-body">{`${skutek.charAt(0).toUpperCase()}${skutek.slice(1)}`}</dd>
          </dl>
        ) : null}
      </Karta>
    );

  const daneCiazy = kontekst.rodzina.daneCiazy;
  const daneProfilu: { e: string; w: string }[] = daneCiazy?.przyjecie
    ? [
        { e: tl.daneProfilu.dataPrzyjecia, w: formatujDate(daneCiazy.przyjecie.dataPrzyjecia) },
        { e: tl.daneProfilu.dataUrodzeniaDziecka, w: formatujDate(daneCiazy.przyjecie.dataUrodzeniaDziecka) },
        {
          e: tl.daneProfilu.dataUprawomocnienia,
          w: daneCiazy.przyjecie.dataUprawomocnienia ? formatujDate(daneCiazy.przyjecie.dataUprawomocnienia) : tl.daneProfilu.brak,
        },
      ]
    : [
        daneCiazy?.dataPoroduPotwierdzona && daneCiazy.dataPorodu
          ? { e: tl.daneProfilu.dataPorodu, w: t.potwierdzona({ data: formatujDate(daneCiazy.dataPorodu) }) }
          : { e: tl.daneProfilu.ptp, w: daneCiazy?.przewidywanyTerminPorodu ? formatujDate(daneCiazy.przewidywanyTerminPorodu) : tl.daneProfilu.brak },
        { e: tl.daneProfilu.liczbaDzieci, w: String(sprawa.liczbaDzieci) },
      ];

  return (
    <Stos odstep={7.5}>
      {kartaTerminu}
      {termin.termin === null && skutek ? (
        <Karta tytul={t.skutekSpoznienia} bezLinii>
          <p className="m-0 text-body">{`${skutek.charAt(0).toUpperCase()}${skutek.slice(1)}`}</p>
        </Karta>
      ) : null}
      <KartaKosztu termin={termin} idPozycji={sprawa.idPozycji} dzis={dzis} />
      {termin.termin !== null && !termin.drugiTermin ? <Przypomnienia /> : null}
      {termin.termin !== null ? (
        <Karta tytul={t.daneProfilu} bezLinii>
          <p className="m-0 text-body">{t.daneProfiluWstep}</p>
          <dl className="m-0 mt-4 flex flex-col gap-3">
            {daneProfilu.map((p) => (
              <div key={p.e}>
                <dt className="text-body font-semibold">{p.e}</dt>
                <dd className="m-0 text-body">{p.w}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <PrzyciskLink href={sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })} wariant="drugorzedny" szerokosc="pelna">
              {t.zmienDane}
            </PrzyciskLink>
          </div>
        </Karta>
      ) : null}
    </Stos>
  );
}
