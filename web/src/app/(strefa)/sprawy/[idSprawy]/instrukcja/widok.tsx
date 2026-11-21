'use client';

// ViewCaseGuide: instrukcja sprawy z kanałem dopasowanym do formy zatrudnienia, przejściem do kanału,
// oznaczeniem i cofnięciem oznaczenia (historyjki 3.8.1.1.1 i 3.8.1.2.1; wzory cz1/Instrukcja-sprawy, cz1/P08-01…P08-17).
import { useSearchParams } from 'next/navigation';
import { use, useEffect, useMemo, useRef, useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik, OdnosnikZewnetrzny } from '@/komponenty/odnosnik';
import { ListaKrokow } from '@/komponenty/kroki';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { formatujDate, etykieta } from '@/komponenty/format';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { useKontekstRodziny, useParametry, useStanSesji } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { KanalProdukcyjny } from '@/dane/parametry-produkcyjne';
import {
  cofnijOznaczenie,
  oznaczSpraweJakoZalatwiona,
  porzucPowrotZKanalu,
  przejdzDoKanalu,
} from '@/dane/magazyn/operacje/kanaly';
import { szkicZamSprawy } from '@/dane/magazyn/operacje/wnioski-zam';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import {
  daneRodzicaSprawy,
  idPozycjiSprawy,
  pozycjaSprawy,
  rodzajOznaczenia,
  wybierzDokumentyIAdresata,
  wybierzKanal,
} from '@/domena/przewodnik/kanaly';
import type { KodKomunikatu, Pochodzenie, StatusSprawy } from '@/domena/typy';
import { teksty } from '@/teksty';
import { sekcjeInstrukcji } from './_sekcje';
import { ArkuszOznaczeniaSprawy } from './_czesci/arkusz-oznaczenia-sprawy';
import { KafelkiInformacji, type KafelekInformacji } from './_czesci/kafelki-informacji';
import { etykietaAkcjiZewnetrznej, kafelkiKanalu, notatkaKanalu } from './_czesci/opis-kanalu';

const t = teksty.ViewCaseGuide;
const POCHODZENIA: readonly Pochodzenie[] = ['plan', 'terminy', 'wnioski', 'asystent'];
const ID_NOTATKI_KANALU = 'instrukcja-notatka-kanalu';

const ikonyStatusu: Record<StatusSprawy, NazwaIkony> = {
  'do-zrobienia': 'zegar',
  zlozona: 'plik-zlozony',
  zalatwiona: 'sukces',
  'wymaga-uzupelnienia-profilu': 'uwaga',
};

function adresBezProtokolu(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function WidokInstrukcjiSprawy({ params }: { params: PageProps<'/sprawy/[idSprawy]/instrukcja'>['params'] }) {
  const { idSprawy } = use(params);
  const kontekst = useKontekstRodziny();
  const parametry = useParametry();
  const stanSesji = useStanSesji();
  const zapytanie = useSearchParams();
  const surowePochodzenie = zapytanie.get('z');
  const pochodzenie = POCHODZENIA.find((p) => p === surowePochodzenie);

  const [komunikat, setKomunikat] = useState<KodKomunikatu | null>(null);
  const [powrotWykryty, setPowrotWykryty] = useState(true);
  const [zajety, setZajety] = useState(false);
  const opuszczono = useRef(false);
  const refKomunikatu = useRef<HTMLDivElement>(null);

  const powrot =
    pochodzenie === 'terminy'
      ? { href: trasy.ViewDeadlines(), etykieta: t.powrotDoTerminow }
      : { href: trasy.ViewCaseDetails({ idSprawy, z: pochodzenie }), etykieta: t.powrotDoSprawy };

  const sprawa = kontekst?.rodzina.plan?.pozycje.find((p) => p.idSprawy === idSprawy) ?? null;

  const dane = useMemo(() => {
    if (kontekst === null || sprawa === null) return null;
    const { rodzina, katalog } = kontekst;
    const pozycja = pozycjaSprawy(sprawa, katalog);
    const rodzicSprawy = daneRodzicaSprawy(sprawa, pozycja, rodzina.daneRodziny);
    return {
      pozycja,
      idPozycji: idPozycjiSprawy(sprawa),
      tytul: pozycja?.tytul ?? tytulSprawy(katalog, sprawa.idSprawy),
      termin: rodzina.kalendarz?.terminy.find((x) => x.idSprawy === sprawa.idSprawy),
      forma: rodzicSprawy.forma,
      nazwaPracodawcy: rodzicSprawy.dane.platnikZasilku?.nazwaPlatnika,
      wybor: wybierzKanal(sprawa, rodzina.daneRodziny, katalog, {
        demonstracyjny: parametry.trybDemonstracyjny,
        mobywatelZainstalowany: parametry.trybDemonstracyjny && parametry.symulacje.mobywatelZainstalowany,
      }),
      dokumenty: wybierzDokumentyIAdresata(sprawa, rodzina.daneRodziny, katalog),
      sprawaK16: rodzina.plan?.pozycje.find((p) => idPozycjiSprawy(p) === 'K16') ?? null,
    };
  }, [kontekst, sprawa, parametry]);

  const oznaczona = sprawa?.status === 'zlozona' || sprawa?.status === 'zalatwiona';
  const oczekujacy = stanSesji?.oczekujacyPowrotZKanalu;
  const arkuszOtwarty =
    powrotWykryty && !oznaczona && sprawa !== null && oczekujacy !== undefined && oczekujacy.idSprawy === idSprawy;

  // Powrót z kanału w nowej karcie: karta przewodnika traci widoczność albo fokus, a potem je odzyskuje.
  useEffect(() => {
    function opuszczenie() {
      if (document.visibilityState === 'hidden') opuszczono.current = true;
    }
    function rozmycie() {
      opuszczono.current = true;
    }
    function powrotDoKarty() {
      if (document.visibilityState === 'visible' && opuszczono.current) {
        opuszczono.current = false;
        setPowrotWykryty(true);
      }
    }
    document.addEventListener('visibilitychange', opuszczenie);
    document.addEventListener('visibilitychange', powrotDoKarty);
    window.addEventListener('blur', rozmycie);
    window.addEventListener('focus', powrotDoKarty);
    return () => {
      document.removeEventListener('visibilitychange', opuszczenie);
      document.removeEventListener('visibilitychange', powrotDoKarty);
      window.removeEventListener('blur', rozmycie);
      window.removeEventListener('focus', powrotDoKarty);
    };
  }, []);

  useEffect(() => {
    if (komunikat !== null) refKomunikatu.current?.focus();
  }, [komunikat]);

  if (kontekst === null || sprawa === null || dane === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
        <Karta>
          <Stos>
            <p className="m-0 text-body">{t.brakSprawy}</p>
            <div>
              <Odnosnik href={trasy.ViewFamilyPlan()}>{t.przejdzDoPlanu}</Odnosnik>
            </div>
          </Stos>
        </Karta>
      </>
    );
  }

  const { pozycja, idPozycji, tytul, termin, forma, wybor, dokumenty, sprawaK16, nazwaPracodawcy } = dane;
  const sciezkaInstrukcji = trasy.ViewCaseGuide({ idSprawy, z: pochodzenie });
  const informacja = sprawa.rodzaj === 'informacja';
  const swiadczenie = rodzajOznaczenia(sprawa.rodzaj) === 'zlozona';
  const terminTekst = termin?.termin ? formatujDate(termin.termin) : null;
  // Szkic wniosku ZAM konta: powrót do szkicu pokazuje sekcja akcja-wniosku-zam (u27), więc start wniosku znika z akcji.
  const maSzkicZam =
    wybor.typ === 'kreator' &&
    wybor.idWidoku === 'ViewZamLeaveType' &&
    szkicZamSprawy(kontekst.rodzina, idSprawy, kontekst.konto.pesel) !== null;

  function przejdz() {
    if (wybor.typ !== 'zewnetrzny') return;
    const ctx = pobierzKontekstOperacji();
    const wynik = przejdzDoKanalu(idSprawy, wybor.kanal, ctx);
    if (!wynik.ok) {
      setKomunikat(wynik.kod);
      return;
    }
    setPowrotWykryty(false);
    opuszczono.current = false;
    const okno = window.open(wynik.wartosc.adres, '_blank');
    if (okno === null) {
      porzucPowrotZKanalu(ctx);
      setKomunikat('0035');
      return;
    }
    okno.opener = null;
    setKomunikat(null);
  }

  function oznacz() {
    setZajety(true);
    const ctx = pobierzKontekstOperacji();
    const wynik = oznaczSpraweJakoZalatwiona(idSprawy, ctx);
    setZajety(false);
    if (!wynik.ok) porzucPowrotZKanalu(ctx);
    setPowrotWykryty(false);
    setKomunikat(wynik.ok ? '0033' : wynik.kod);
  }

  function zostawDoZrobienia() {
    porzucPowrotZKanalu(pobierzKontekstOperacji());
    setPowrotWykryty(false);
  }

  function cofnij() {
    const wynik = cofnijOznaczenie(idSprawy, pobierzKontekstOperacji());
    setKomunikat(wynik.ok ? '0034' : wynik.kod);
  }

  const kafelekTerminu: KafelekInformacji = {
    etykieta: t.termin,
    wartosc: terminTekst ?? t.bezTerminu,
    podpis: oznaczona
      ? swiadczenie
        ? t.nieprzypominamyZlozona
        : t.nieprzypominamyZalatwiona
      : terminTekst === null
        ? t.sprawaBezTerminu
        : termin?.kotwica
          ? termin.szacowany
            ? t.terminSzacowany({ opis: termin.kotwica.opis })
            : termin.kotwica.opis
          : undefined,
  };
  const kafelekStatusu: KafelekInformacji = {
    etykieta: t.status,
    wartosc: (
      <span className="inline-flex items-center gap-2">
        <Ikona nazwa={ikonyStatusu[sprawa.status]} rozmiar={20} className="flex-none text-brand" />
        {etykieta(teksty.wspolne.etykiety.statusySpraw, sprawa.status)}
      </span>
    ),
    podpis:
      oznaczona && sprawa.dataOznaczenia
        ? t.oznaczono({ data: formatujDate(sprawa.dataOznaczenia) })
        : t.rodzajSprawy({ rodzaj: t.rodzajePozycji[sprawa.rodzaj] }),
  };
  const kafelki: KafelekInformacji[] = [
    kafelekTerminu,
    ...kafelkiKanalu({ wybor, forma, dokumenty, pozycja, nazwaPracodawcy }),
    kafelekStatusu,
  ];

  const kroki = pozycja?.instrukcja.kroki ?? [];
  const daneIDokumenty = pozycja?.instrukcja.daneIDokumenty ?? [];
  const odnosniki = pozycja?.instrukcja.odnosniki ?? [];
  const pokazCoPrzygotowac = daneIDokumenty.length > 0 || dokumenty.typ !== 'nie-dotyczy';
  const wstepFormy = forma === null ? null : t.wstepFormy[forma];
  const etykietaOznaczenia = swiadczenie ? t.oznaczJakoZlozona : t.oznaczJakoZalatwiona;

  const coPrzygotowac = pokazCoPrzygotowac ? (
    <Karta tytul={t.kartaCoPrzygotowac} bezLinii>
      <Stos odstep={2}>
        {daneIDokumenty.length > 0 ? (
          <>
            <h3 className="m-0 text-body-strong">{t.daneIDokumenty}</h3>
            <ul className="m-0 flex flex-col gap-2 pl-5">
              {daneIDokumenty.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </>
        ) : null}
        {dokumenty.typ === 'platnik-nieustalony' ? (
          <>
            <h3 className="m-0 mt-2 text-body-strong">{t.dokumentyIAdresat}</h3>
            <Komunikat
              kod={dokumenty.kod}
              akcje={
                <PrzyciskLink
                  href={trasy.ViewProfilePayer({ powrot: sciezkaInstrukcji })}
                  wariant="drugorzedny"
                >
                  {t.odpowiedzOPlatnika}
                </PrzyciskLink>
              }
            />
          </>
        ) : null}
        {dokumenty.typ === 'lista' ? (
          <>
            <h3 className="m-0 mt-2 text-body-strong">{t.dokumenty}</h3>
            {dokumenty.dokumenty.length > 0 ? (
              <ul className="m-0 flex flex-col gap-2 pl-5">
                {dokumenty.dokumenty.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-body">{t.brakDokumentowWSlowniku}</p>
            )}
            <h3 className="m-0 mt-2 text-body-strong">{t.adresatWniosku}</h3>
            <div className="rounded-sm bg-surface-page px-5 py-4">
              <p className="m-0 text-body-strong text-ink-strong">
                {dokumenty.adresat ??
                  (dokumenty.platnik === 'zus' ? t.adresatZus : (dokumenty.nazwaPlatnika ?? t.adresatPlatnik))}
              </p>
              <p className="m-0 mt-1 text-body">
                {t.platnikWProfilu({
                  platnik:
                    dokumenty.platnik === 'zus'
                      ? t.adresatZus
                      : (dokumenty.nazwaPlatnika ?? t.adresatPlatnik.toLowerCase()),
                })}
              </p>
            </div>
          </>
        ) : null}
      </Stos>
    </Karta>
  ) : null;

  return (
    <>
      <NaglowekStrony tytul={tytul} powrot={powrot} />
      <Stos odstep={7.5} className="max-w-tresc">
        {komunikat !== null ? (
          <div ref={refKomunikatu} tabIndex={-1} className="outline-none">
            <Komunikat kod={komunikat} />
          </div>
        ) : null}

        <Karta tytul={t.kartaNajwazniejsze} bezLinii>
          <Stos>
            {wstepFormy || pozycja ? (
              <p className="m-0 text-body">
                {[wstepFormy, pozycja?.instytucjaIKanal].filter(Boolean).join(' ')}
              </p>
            ) : null}
            <p className="m-0 my-1 text-body">{teksty.wspolne.stanNa({ data: formatujDate(kontekst.dzis) })}</p>
            <KafelkiInformacji kafelki={kafelki} />
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {oznaczona ? (
                <>
                  <Przycisk wariant="drugorzedny" ikona="cofnij" onClick={cofnij}>
                    {t.cofnijOznaczenie}
                  </Przycisk>
                  {wybor.typ === 'zewnetrzny' ? (
                    <OdnosnikZewnetrzny href={wybor.adres}>{t.sprawdzWKanale[wybor.kanal]}</OdnosnikZewnetrzny>
                  ) : null}
                </>
              ) : (
                <>
                  {wybor.typ === 'kreator' && !maSzkicZam ? (
                    <PrzyciskLink href={sciezkaWidoku(wybor.idWidoku, { sprawa: idSprawy })} wariant="glowny">
                      {wybor.idWidoku === 'ViewZamLeaveType' ? t.akcjaKreatorZam : t.akcjaKreatorZas53}
                    </PrzyciskLink>
                  ) : null}
                  {wybor.typ === 'zewnetrzny' ? (
                    <Przycisk
                      wariant="glowny"
                      ikonaPo="zewnetrzny"
                      onClick={przejdz}
                      aria-describedby={ID_NOTATKI_KANALU}
                    >
                      {etykietaAkcjiZewnetrznej(wybor.kanal, idPozycji)}
                      <span className="sr-only"> {teksty.wspolne.otwieraSieWNowejKarcie}</span>
                    </Przycisk>
                  ) : null}
                  {idPozycji === 'K27' && sprawaK16 !== null ? (
                    <PrzyciskLink
                      href={trasy.ViewCaseDetails({ idSprawy: sprawaK16.idSprawy, z: pochodzenie })}
                      wariant="drugorzedny"
                    >
                      {t.przejdzDoSwiadczeniaRodzicielskiego}
                    </PrzyciskLink>
                  ) : null}
                  <Przycisk wariant="drugorzedny" onClick={oznacz} zajety={zajety}>
                    {etykietaOznaczenia}
                  </Przycisk>
                </>
              )}
            </div>
            <Notatka id={ID_NOTATKI_KANALU}>{notatkaKanalu({ wybor, forma, oznaczona, informacja })}</Notatka>
          </Stos>
        </Karta>

        <div className="contents">
          {sekcjeInstrukcji.map(({ id, Komponent }) => (
            <Komponent key={id} sprawa={sprawa} termin={termin} kontekst={kontekst} pochodzenie={pochodzenie} />
          ))}
        </div>

        <UkladDwuKolumnowy
          tresc={
            <Karta tytul={t.kartaKroki} bezLinii>
              <Stos odstep={6}>
                {kroki.length > 0 ? (
                  <ListaKrokow kroki={kroki} />
                ) : (
                  <p className="m-0 text-body">{t.brakKrokow}</p>
                )}
                {idPozycji === 'K05' && wybor.typ === 'u-pracodawcy' ? (
                  <Notatka>{t.notatkaK05Pracownik}</Notatka>
                ) : null}
              </Stos>
            </Karta>
          }
          boczna={coPrzygotowac}
          etykietaBocznej={t.etykietaKolumnyBocznej}
        />

        {odnosniki.length > 0 ? (
          <Karta tytul={t.kartaWiecejInformacji} bezLinii>
            <Stos>
              <ul className="m-0 flex list-none flex-col gap-4 p-0">
                {odnosniki.map((o) => (
                  <li key={o.url} className="flex min-w-0 flex-col gap-1">
                    <OdnosnikZewnetrzny href={o.url}>{o.etykieta}</OdnosnikZewnetrzny>
                    <span className="text-small break-all text-ink-muted">{adresBezProtokolu(o.url)}</span>
                  </li>
                ))}
              </ul>
              <p className="m-0 text-small">{t.serwisyWNowejKarcie}</p>
            </Stos>
          </Karta>
        ) : null}
      </Stos>

      <ArkuszOznaczeniaSprawy
        otwarte={arkuszOtwarty}
        onZamknij={zostawDoZrobienia}
        onPotwierdz={oznacz}
        zajety={zajety}
        rodzaj={sprawa.rodzaj}
        kanal={
          wybor.typ === 'zewnetrzny'
            ? wybor.kanal
            : oczekujacy !== undefined && oczekujacy.kanal in teksty.SheetCaseDoneConfirm.zKanalu
              ? (oczekujacy.kanal as KanalProdukcyjny)
              : undefined
        }
        termin={terminTekst}
      />
    </>
  );
}
