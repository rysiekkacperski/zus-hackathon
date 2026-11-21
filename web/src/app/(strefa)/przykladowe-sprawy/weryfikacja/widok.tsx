'use client';

// ViewSampleCaseVerification: wynik weryfikacji ubezpieczenia chorobowego przykładowej sprawy (wzory P13-13 do P13-16).
// Właściciel: u21. Wynik zapisuje operacja zatwierdzDaneSprawy wywoływana z ekranu ViewSampleCaseData.
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { trasy } from '@/komponenty/rama/trasy';
import { formatujDate, formatujDateICzas } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { czyZasilekMacierzynskiPrzysluguje } from '@/domena/przykladowe-sprawy/weryfikacja';
import type { KodKomunikatu, SprawaPrzykladowa, WynikWeryfikacjiSprawy } from '@/domena/typy';
import { useStanSesji } from '@/dane/magazyn/hooki';
import { teksty } from '@/teksty';
import { adresCzesciDanychSprawy } from '../_czesci/czesci-danych-sprawy';
import { LegendaWynikow, ZnacznikPorownania, ZnacznikWarunku, ZIkona } from './_czesci/znacznik-wyniku';

const T = teksty.ViewSampleCaseVerification;

type WynikSwiadczenia = WynikWeryfikacjiSprawy['wyniki'][number];

function malaLitera(tekst: string): string {
  return tekst.length === 0 ? tekst : tekst[0].toLowerCase() + tekst.slice(1);
}

function polaczListe(elementy: string[]): string {
  if (elementy.length <= 1) return elementy.join('');
  return `${elementy.slice(0, -1).join(', ')}${T.spojnikI}${elementy[elementy.length - 1]}`;
}

function wstepSprawy(sprawa: SprawaPrzykladowa, czas: string): string {
  const stan = czas === '' ? '' : ` ${T.stanNa({ czas: formatujDateICzas(czas) })}`;
  const id = sprawa.idSprawy ?? '';
  const sytuacja = malaLitera((sprawa.sytuacja ?? '').replace(/\.$/, ''));
  if (sprawa.zrodlo === 'sprawa-wzorcowa') return `${T.wstepWzorcowa({ id, sytuacja })}${stan}`;
  if (sprawa.zrodlo === 'zestaw-zus') return `${T.wstepZestaw({ id, sytuacja })}${stan}`;
  const dokumenty = sprawa.dokumenty.map((d) => T.dokumentZNumerem({ nazwa: T.nazwyDokumentow[d.rodzaj], numer: String(d.numer) }));
  return `${T.wstepWgrane({ dokumenty: polaczListe(dokumenty) })}${stan}`;
}

function tekstWyniku(w: WynikSwiadczenia, wynik: WynikWeryfikacjiSprawy): string {
  const szczegol = wynik.rozszerzenie?.szczegoly.find((s) => s.swiadczenie === w.swiadczenie);
  if (w.prawo === 'przysluguje') {
    if (w.od !== undefined && szczegol?.do !== undefined) return T.przyslugujeOdDo({ od: formatujDate(w.od), do: formatujDate(szczegol.do) });
    if (w.od !== undefined) return T.przyslugujeOd({ od: formatujDate(w.od) });
    return T.przysluguje;
  }
  return w.przyczyna === undefined ? T.nieprzysluguje : T.nieprzyslugujeZPrzyczyna({ przyczyna: w.przyczyna });
}

function TekstRozstrzygniecia({ sprawa, swiadczenie }: { sprawa: SprawaPrzykladowa; swiadczenie: WynikSwiadczenia['swiadczenie'] }) {
  const r = sprawa.rozstrzygniecie.find((x) => x.swiadczenie === swiadczenie);
  if (r === undefined) return <>{T.brakRozstrzygniecia}</>;
  const tekst =
    r.prawo === 'nie-przysluguje'
      ? T.nieprzysluguje
      : r.okres === undefined
        ? T.przysluguje
        : T.przyslugujeOdDo({ od: formatujDate(r.okres.od), do: formatujDate(r.okres.do) });
  return (
    <span className="flex flex-col">
      <span>{tekst}</span>
      {r.zrodlo.rodzaj === 'korekta-uzytkownika' || r.zrodlo.rodzaj === 'podaje-uzytkownik' ? (
        <span className="text-small text-ink-muted">{T.korektaUzytkownika}</span>
      ) : null}
    </span>
  );
}

function KomunikatyWeryfikacji({ sprawa, wynik }: { sprawa: SprawaPrzykladowa; wynik: WynikWeryfikacjiSprawy }) {
  const parametry = wynik.rozszerzenie?.parametryKomunikatow ?? {};
  return (
    <>
      {wynik.komunikaty.map((kod: KodKomunikatu) => {
        if (kod === '0226') {
          const p = parametry['0226'];
          if (p === undefined) return null;
          return (
            <Komunikat
              key={kod}
              kod="0226"
              parametry={{ dataPoczatkuZWniosku: p.dataPoczatkuZWniosku ?? '', terminPorodu: p.terminPorodu ?? '', dataPoczatkuDoWyliczenia: p.dataPoczatkuDoWyliczenia ?? '' }}
            />
          );
        }
        if (kod === '0180') {
          return <Komunikat key={kod} kod="0180" akcje={<Odnosnik href={adresCzesciDanychSprawy(sprawa, 'rozstrzygniecie')}>{T.podajRozstrzygniecie}</Odnosnik>} />;
        }
        if (kod === '0177' || kod === '0178' || kod === '0227') return <Komunikat key={kod} kod={kod} />;
        return null;
      })}
    </>
  );
}

function KartaWyniku({ sprawa, wynik }: { sprawa: SprawaPrzykladowa; wynik: WynikWeryfikacjiSprawy }) {
  const rozszerzenie = wynik.rozszerzenie;
  const zdarzenie =
    rozszerzenie?.rodzajZdarzenia === 'przewidywany-termin'
      ? T.dataZdarzeniaTermin({ data: formatujDate(wynik.dataZdarzenia.data) })
      : T.dataZdarzenia({
          rodzaj: T.rodzajeZdarzenia[rozszerzenie?.rodzajZdarzenia ?? 'porod'],
          data: formatujDate(wynik.dataZdarzenia.data),
        });
  const opisZdarzenia = [
    zdarzenie,
    wynik.okresCiazy === undefined ? '' : T.okresCiazy({ od: formatujDate(wynik.okresCiazy.od), do: formatujDate(wynik.okresCiazy.do) }),
    wynik.dataUstania === undefined ? '' : T.ustanieUbezpieczenia({ data: formatujDate(wynik.dataUstania) }),
  ]
    .filter((t) => t !== '')
    .join(' ');
  const zm = czyZasilekMacierzynskiPrzysluguje(wynik);
  const zwzm = wynik.wyniki.some((w) => w.swiadczenie === 'zwzm' && w.prawo === 'przysluguje');
  const rodzicielskie = rozszerzenie?.szczegoly.find((s) => s.swiadczenieRodzicielskie !== undefined)?.swiadczenieRodzicielskie;
  const okres = rozszerzenie?.okresDoWyliczenia;
  const pokazOkres = zm && okres !== undefined && (okres.skorygowany || wynik.komunikaty.includes('0227'));

  return (
    <Karta
      tytul={wynik.wyniki.length > 1 ? T.wynikTytulWiele({ liczba: String(wynik.wyniki.length) }) : T.wynikTytul}
      bezLinii
    >
      <Stos odstep={6}>
        <p className="m-0 text-body">{opisZdarzenia}</p>
        <Tabela
          podpis={T.podpisWynikow}
          etykietaPrzewijania={T.przewijanieWynikow}
          kolumny={[
            { klucz: 'swiadczenie', naglowek: T.kolumnyWynikow.swiadczenie, tytulowa: true },
            { klucz: 'wynik', naglowek: T.kolumnyWynikow.wynik },
            { klucz: 'platnik', naglowek: T.kolumnyWynikow.platnik },
            { klucz: 'oczekiwane', naglowek: T.kolumnyWynikow.oczekiwane },
            { klucz: 'porownanie', naglowek: T.kolumnyWynikow.porownanie },
          ]}
          wiersze={wynik.wyniki.map((w) => {
            const porownanie = wynik.porownanie.find((p) => p.swiadczenie === w.swiadczenie)?.wynik ?? 'bez-porownania';
            return {
              id: w.swiadczenie,
              swiadczenie: <span className="text-body-strong">{T.swiadczenia[w.swiadczenie]}</span>,
              wynik: <ZIkona ikona={w.prawo === 'przysluguje' ? 'sukces' : 'odmowa'}>{tekstWyniku(w, wynik)}</ZIkona>,
              platnik: T.platnicy[w.platnik ?? 'nieustalony'],
              oczekiwane: <TekstRozstrzygniecia sprawa={sprawa} swiadczenie={w.swiadczenie} />,
              porownanie: <ZnacznikPorownania wynik={porownanie} />,
            };
          })}
        />
        {rodzicielskie !== undefined ? (
          <div className="rounded-sm border border-line bg-brand-wash px-5 py-4">
            <p className="m-0 text-body-strong">{T.swiadczenieRodzicielskie({ kwota: formatujKwote(rodzicielskie) })}</p>
            <p className="m-0 mt-1 text-small text-ink-muted">{T.swiadczenieRodzicielskieOpis}</p>
          </div>
        ) : null}
        {rozszerzenie?.uzasadnieniePlatnika ? <p className="m-0 text-body">{rozszerzenie.uzasadnieniePlatnika}</p> : null}
        {pokazOkres && okres !== undefined ? (
          <div className="flex flex-col gap-2">
            <p className="m-0 text-body-strong">{T.okresDoWyliczenia({ od: formatujDate(okres.od) })}</p>
            <p className="m-0 text-body">
              {okres.skorygowany ? `${T.okresDoWyliczeniaOpis({ odZWniosku: formatujDate(okres.odZWniosku), od: formatujDate(okres.od) })} ` : ''}
              {okres.zaswiadczenieOTerminie ? T.zaswiadczenieOTerminieJest : T.zaswiadczenieOTerminieBrak}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-4">
          {zm ? (
            <PrzyciskLink href={trasy.ViewCalcMaternityInput({ zrodlo: 'przykladowa-sprawa' })} wariant="glowny" ikona="kalkulator">
              {T.sprawdzWyliczenia}
            </PrzyciskLink>
          ) : null}
          <PrzyciskLink href={trasy.ViewSampleCaseData()} wariant="drugorzedny">
            {T.wrocDoDanychSprawyPrzycisk}
          </PrzyciskLink>
          <p className="m-0 min-w-0 flex-[1_1_17.5rem] text-body">
            {zm ? (zwzm ? T.opisSprawdzeniaZwzm : T.opisSprawdzenia) : T.opisBezSprawdzenia}
          </p>
        </div>
      </Stos>
    </Karta>
  );
}

function KartaWarunkow({ wynik }: { wynik: WynikWeryfikacjiSprawy }) {
  const zwzm = wynik.wyniki.some((w) => w.swiadczenie === 'zwzm');
  return (
    <Karta tytul={T.warunkiTytul({ liczba: String(wynik.warunki.length) })} bezLinii>
      <Tabela
        podpis={T.podpisWarunkow}
        etykietaPrzewijania={T.przewijanieWarunkow}
        kolumny={[
          { klucz: 'warunek', naglowek: T.kolumnyWarunkow.warunek, tytulowa: true },
          { klucz: 'wynik', naglowek: T.kolumnyWarunkow.wynik },
          { klucz: 'uzasadnienie', naglowek: T.kolumnyWarunkow.uzasadnienie },
        ]}
        wiersze={wynik.warunki.map((w) => ({
          id: String(w.numer),
          warunek: <span className="text-body-strong">{T.warunekZNumerem({ numer: String(w.numer), nazwa: w.nazwa })}</span>,
          wynik: <ZnacznikWarunku wynik={w.wynik} />,
          uzasadnienie: w.uzasadnienie,
        }))}
      />
      <LegendaWynikow />
      {zwzm ? <p className="m-0 mt-5 text-body">{T.regulaZwzm}</p> : null}
      <div className="mt-5">
        <Notatka>{T.notaReguly}</Notatka>
      </div>
    </Karta>
  );
}

export function WidokWeryfikacjiSprawy() {
  const stanSesji = useStanSesji();
  const sprawa = stanSesji?.przykladowaSprawa;
  const wynik = sprawa?.weryfikacja;

  if (sprawa === undefined || wynik === undefined) {
    return (
      <>
        <NaglowekStrony tytul={T.naglowek} powrot={{ href: sprawa === undefined ? trasy.ViewSampleCaseList() : trasy.ViewSampleCaseData() }} />
        <StanPusty
          ikona="folder"
          akcja={
            sprawa === undefined ? (
              <PrzyciskLink href={trasy.ViewSampleCaseList()} wariant="glowny">
                {T.przejdzDoListy}
              </PrzyciskLink>
            ) : (
              <PrzyciskLink href={trasy.ViewSampleCaseData()} wariant="glowny">
                {T.wrocDoDanychSprawyPrzycisk}
              </PrzyciskLink>
            )
          }
        >
          {sprawa === undefined ? T.brakSprawy : T.brakWeryfikacji}
        </StanPusty>
      </>
    );
  }

  return (
    <>
      <NaglowekStrony
        tytul={T.naglowek}
        wstep={wstepSprawy(sprawa, wynik.czas)}
        powrot={{
          href: trasy.ViewSampleCaseData(),
          etykieta: sprawa.idSprawy === undefined ? T.wrocDoDanych : T.wrocDoDanychSprawy({ id: sprawa.idSprawy }),
        }}
      />
      <Stos odstep={7.5} className="max-w-tresc">
        <KomunikatyWeryfikacji sprawa={sprawa} wynik={wynik} />
        <KartaWyniku sprawa={sprawa} wynik={wynik} />
        <KartaWarunkow wynik={wynik} />
        <Notatka>{T.notaNiezaleznosc}</Notatka>
      </Stos>
    </>
  );
}
