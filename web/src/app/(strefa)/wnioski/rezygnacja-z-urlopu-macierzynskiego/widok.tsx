'use client';

// ViewMaternityResignation (u34, Story 3.9.2.1.1, wariant orzeczenia z 3.9.2.2.1). Wzory: cz2/P25-02 … P25-10.
// Formularz rezygnacji ma części: urlop macierzyński, data powrotu do pracy i załączniki (gdy są wymagane).
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { ODNOSNIKI } from '@/dane/katalog/pozycje';
import { Karta } from '@/komponenty/karta';
import { KartaWiecejInformacji } from '@/komponenty/karta-wiecej-informacji';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { formatujDate } from '@/komponenty/format';
import { trasy } from '@/komponenty/rama/trasy';
import type { BledyPol, KodKomunikatu, PlikZalacznika, WniosekOUrlop } from '@/domena/typy';
import {
  najwczesniejszyPowrot,
  okresZamZa14Tygodni,
  ostrzezenieTerminuRezygnacji,
  otworzRezygnacje,
  szkicWniosku,
  urlopMacierzynski,
  dniPrzedPorodemZWnioskow,
  walidujDatePowrotu,
  wyslanyWniosekOjca,
  zalacznikiRezygnacji,
  type ZalacznikRezygnacji,
} from '@/domena/wnioski/rezygnacja';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { rozpocznijRezygnacje, rozpocznijZamZa14Tygodni, zapiszKrok } from '@/dane/magazyn/operacje/rezygnacja';
import { teksty } from '@/teksty';
import { FormularzRezygnacjiZZasilku } from './_czesci/formularz-zasilku';
import {
  etykietaFormy,
  imieINazwiskoDrugiego,
  ListaDanych,
  ListaZalacznikow,
  OstrzezeniePola,
  plikiZeSzkicu,
  RamkaOkresu,
  tygodnie,
  zbudujZalaczniki,
  type PozycjaZalacznika,
} from './_czesci/wspolne';

const t = teksty.ViewMaternityResignation;
const ID_POLA = 'powrot';

function pozycjaZalacznika(z: ZalacznikRezygnacji, kogo: string | null): PozycjaZalacznika {
  switch (z.rodzaj) {
    case 'kopia-wniosku-ojca':
      return {
        rodzaj: z.rodzaj,
        tytul: t.zalaczniki.kopiaWnioskuOjca({ kogo: kogo ?? t.zalaczniki.kopiaWnioskuOjcaKogo }),
        opis: z.zWnioskow
          ? t.zalaczniki.kopiaWnioskuOjcaZWnioskow({ data: formatujDate(z.zWnioskow.dataZlozenia ?? '') })
          : t.zalaczniki.kopiaWnioskuOjcaDoDodania,
        automatyczny: Boolean(z.zWnioskow),
      };
    case 'oswiadczenie-ojca-o-przerwaniu-dzialalnosci':
      return {
        rodzaj: z.rodzaj,
        tytul: t.zalaczniki.oswiadczenieOjca,
        opis: t.zalaczniki.oswiadczenieOjcaOpis({ kogo: kogo ?? t.zalaczniki.oswiadczenieOjcaKogo }),
      };
    default:
      return { rodzaj: z.rodzaj, tytul: t.zalaczniki.kopiaOrzeczenia, opis: t.zalaczniki.kopiaOrzeczeniaOpis };
  }
}

export function WidokRezygnacjiZUrlopu() {
  const kontekst = useKontekstRodziny();
  const parametry = useSearchParams();
  const router = useRouter();

  const rodzina = kontekst?.rodzina ?? null;
  const pesel = kontekst?.konto.pesel ?? '';
  const idWnioskuZAdresu = parametry.get('wniosek');
  const szkic = useMemo<WniosekOUrlop | null>(() => {
    if (!rodzina) return null;
    const zAdresu = rodzina.wnioski.find(
      (w): w is WniosekOUrlop => w.idWniosku === idWnioskuZAdresu && w.rodzaj === 'rezygnacja-z-czesci-zasilku',
    );
    return zAdresu ?? szkicWniosku(rodzina.wnioski, 'rezygnacja-z-czesci-zasilku', pesel);
  }, [rodzina, idWnioskuZAdresu, pesel]);
  const idSprawy = parametry.get('sprawa') ?? szkic?.idSprawy ?? 'K07';

  const [tekstPowrotu, setTekstPowrotu] = useState(() =>
    szkic?.rezygnacja?.dataPowrotu ? formatujDate(szkic.rezygnacja.dataPowrotu) : '',
  );
  const [bladOperacji, setBladOperacji] = useState<KodKomunikatu | null>(null);
  const [pliki, setPliki] = useState<Record<string, PlikZalacznika>>(() => plikiZeSzkicu(szkic?.zalaczniki));
  const { zajety, ustawZajety: setZajety, przejdz } = useNawigacjaZLadowaniem();

  const dane = useMemo(() => {
    if (!kontekst) return null;
    const { daneRodziny, daneCiazy, wnioski } = kontekst.rodzina;
    const osoby = osobyRodziny(daneRodziny);
    const otwarcie = otworzRezygnacje({
      daneRodziny,
      daneCiazy,
      wnioski,
      daneZusMatki: kontekst.daneZusMatki ?? kontekst.daneZusKonta,
      peselMatki: osoby.peselMatki ?? kontekst.konto.pesel,
    });
    const dataPorodu = daneCiazy?.dataPorodu;
    if (!dataPorodu) return { otwarcie, urlop: null, zalaczniki: [] as PozycjaZalacznika[] };
    const urlop = urlopMacierzynski(
      kontekst.katalog,
      dataPorodu,
      daneCiazy?.liczbaUrodzonychDzieci ?? 1,
      dniPrzedPorodemZWnioskow(wnioski, dataPorodu),
    );
    const drugi = daneRodziny.drugiRodzic;
    const zalaczniki = zalacznikiRezygnacji(drugi.formaZatrudnienia?.wartosc, otwarcie.zOrzeczeniem, wyslanyWniosekOjca(wnioski)).map(
      (z) => pozycjaZalacznika(z, drugi.imieINazwiskoDopelniacz ?? null),
    );
    return { otwarcie, urlop, zalaczniki };
  }, [kontekst]);

  const urlopDoWalidacji = dane?.urlop ?? null;
  const zOrzeczeniemDoWalidacji = dane?.otwarcie.zOrzeczeniem ?? false;
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { powrot: tekstPowrotu },
    waliduj: (w: { powrot: string }): BledyPol<'powrot'> => {
      if (!urlopDoWalidacji) return {};
      const wynik = walidujDatePowrotu(w.powrot, urlopDoWalidacji, zOrzeczeniemDoWalidacji);
      return 'kod' in wynik ? { powrot: wynik.kod } : {};
    },
    pola: { powrot: ID_POLA },
  });
  // Części formularza: 1. urlop macierzyński, 2. data powrotu, 3. załączniki (gdy są wymagane).
  const zFormularzem = dane?.otwarcie.wariant === 'formularz' && dane.urlop !== null;
  const podzial: 'powrot'[][] = !zFormularzem ? [['powrot']] : dane.zalaczniki.length > 0 ? [[], ['powrot'], []] : [[], ['powrot']];
  const czesci = useCzesciFormularza({ liczba: podzial.length, podzial, walidacja });
  const czescWidoczna = (numer: number) => !zFormularzem || czesci.czesc === numer;

  if (!kontekst || !dane) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} />
        <Komunikat tresc={t.brakRodziny} />
      </>
    );
  }

  const { otwarcie, urlop, zalaczniki } = dane;
  const { daneRodziny } = kontekst.rodzina;
  const konto = kontekst.konto;
  const drugi = daneRodziny.drugiRodzic;
  const formaOjca = drugi.formaZatrudnienia?.wartosc;
  const imieOjca = imieINazwiskoDrugiego(drugi);
  const powrotHref = trasy.ViewCaseGuide({ idSprawy });
  const naglowek = (wstep: string) => (
    <NaglowekStrony tytul={t.naglowek} wstep={wstep} powrot={{ href: powrotHref, etykieta: t.powrot }} />
  );

  if (!urlop) {
    return (
      <>
        {naglowek(t.wstepPracownica)}
        <Komunikat
          tresc={t.brakDatyPorodu}
          akcje={
            <PrzyciskLink href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wariant="drugorzedny">
              {t.przejdzDoProfilu}
            </PrzyciskLink>
          }
        />
      </>
    );
  }

  const zasilek = ['zam-14-tygodni', 'rezygnacja-w-ezus', 'rezygnacja-u-zleceniodawcy'].includes(otwarcie.wariant);
  const najwczesniej = najwczesniejszyPowrot(urlop, otwarcie.zOrzeczeniem);
  const dzis = kontekst.dzis;

  const wynikPowrotu = walidujDatePowrotu(tekstPowrotu, urlop, otwarcie.zOrzeczeniem);
  const dataPowrotu = 'data' in wynikPowrotu ? wynikPowrotu.data : null;
  const ostrzezenie = dataPowrotu ? ostrzezenieTerminuRezygnacji(dataPowrotu, dzis) : null;
  const blad = walidacja.blad('powrot');

  /** Akcja ostatniej części: zapis szkicu rezygnacji i przejście do podsumowania wniosku. */
  function przejdzDalej() {
    if (!urlop) return;
    const wynik = walidujDatePowrotu(tekstPowrotu, urlop, otwarcie.zOrzeczeniem);
    if ('kod' in wynik) return;
    setZajety(true);
    const ctx = pobierzKontekstOperacji();
    const start = szkic ? { ok: true as const, wartosc: szkic } : rozpocznijRezygnacje(idSprawy, ctx);
    if (!start.ok) {
      setBladOperacji(start.kod);
      setZajety(false);
      return;
    }
    const zapis = zapiszKrok(
      start.wartosc.idWniosku,
      {
        okresy: [{ rodzajUrlopu: 'przejety-macierzynski', od: wynik.data, do: urlop.okres.do, rodzic: 'drugi-rodzic' }],
        rezygnacja: { dataPowrotu: wynik.data, zOrzeczeniem: otwarcie.zOrzeczeniem },
        daneRodzica: { imie: konto.imie, nazwisko: konto.nazwisko },
        zalaczniki: zbudujZalaczniki(zalaczniki, pliki),
        adresat: 'pracodawca',
        ...(daneRodziny.matka.emailPracodawcy ? { emailPracodawcy: daneRodziny.matka.emailPracodawcy.wartosc } : {}),
      },
      'ViewMaternityResignation',
      ctx,
    );
    if (!zapis.ok) {
      setBladOperacji(zapis.kod);
      setZajety(false);
      return;
    }
    przejdz(trasy.ViewLeaveRequestSummary({ wniosek: zapis.wartosc.idWniosku }));
  }

  function zlozZam14() {
    if (!urlop) return;
    setZajety(true);
    const wynik = rozpocznijZamZa14Tygodni(idSprawy, okresZamZa14Tygodni(urlop.dataPorodu), pobierzKontekstOperacji());
    if (!wynik.ok) {
      setBladOperacji(wynik.kod);
      setZajety(false);
      return;
    }
    przejdz(trasy.ViewZamPeriod({ wniosek: wynik.wartosc.idWniosku }));
  }

  const kartaUrlopu = (
    <Karta tytul={t.kartaUrlopu} bezLinii>
      <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
      <ListaDanych
        pozycje={[
          { etykieta: t.dataPorodu, wartosc: formatujDate(urlop.dataPorodu) },
          { etykieta: t.liczbaDzieci, wartosc: String(urlop.liczbaDzieci) },
          {
            etykieta: t.urlopMacierzynski,
            wartosc: t.okresZTygodniami({
              od: formatujDate(urlop.okres.od),
              do_: formatujDate(urlop.okres.do),
              tygodnie: tygodnie(urlop.tygodnie),
            }),
          },
          {
            etykieta: t.najwczesniejszyPowrot,
            wartosc: otwarcie.zOrzeczeniem
              ? t.powrotPo8({ data: formatujDate(najwczesniej) })
              : t.powrotPo14({ data: formatujDate(najwczesniej) }),
          },
        ]}
      />
      {otwarcie.zOrzeczeniem ? <p className="m-0 mt-4">{t.informacjaOrzeczenie}</p> : null}
    </Karta>
  );

  const kartaDrugiegoRodzica = (
    <Karta tytul={t.kartaDrugiegoRodzica} bezLinii>
      {!formaOjca || formaOjca === 'brak-drugiego-rodzica' ? (
        <p className="m-0">{t.brakDrugiegoRodzica}</p>
      ) : (
        <ListaDanych
          pozycje={[
            ...(imieOjca ? [{ etykieta: t.imieINazwisko, wartosc: imieOjca }] : []),
            { etykieta: t.formaZatrudnienia, wartosc: etykietaFormy(formaOjca, drugi.dobrowolneChorobowe?.wartosc) },
          ]}
        />
      )}
    </Karta>
  );

  const bladOperacjiKomunikat = bladOperacji ? <Komunikat kod={bladOperacji} /> : null;
  const wniosekZam = otwarcie.wniosekZam;
  const platnik = daneRodziny.matka.platnikZasilku?.wartosc;
  const rezygnacjeZZasilku = kontekst.rodzina.wnioski.filter(
    (w): w is WniosekOUrlop => w.rodzaj === 'rezygnacja-z-czesci-zasilku' && w.konto === pesel,
  );
  const wyslanyZas23 = rezygnacjeZZasilku.filter((w) => w.adresat === 'zus' && w.stan === 'wyslany').at(-1) ?? null;
  const przygotowanaDlaZleceniodawcy =
    rezygnacjeZZasilku.filter((w) => w.adresat === 'platnik-skladek' && w.stan === 'przygotowany').at(-1) ?? null;

  if (zasilek) {
    const bocznaZasilku = (
      <>
        {otwarcie.wariant === 'zam-14-tygodni' ? null : (
          <Karta tytul={t.kartaWnioskuZam} bezLinii>
            <ListaDanych
              pozycje={[
                {
                  etykieta: t.wniosekZam,
                  wartosc: otwarcie.wariant === 'rezygnacja-u-zleceniodawcy' ? t.stanyZam.przygotowany : wniosekZam ? t.stanyZam.wyslany : t.wniosekWZus,
                },
                ...(wniosekZam?.okresy[0]
                  ? [{ etykieta: t.okresZasilku, wartosc: t.okres({ od: formatujDate(wniosekZam.okresy[0].od), do_: formatujDate(wniosekZam.okresy[wniosekZam.okresy.length - 1].do) }) }]
                  : []),
                ...(platnik ? [{ etykieta: t.platnikZasilku, wartosc: t.platnicy[platnik] }] : []),
              ]}
            />
          </Karta>
        )}
        {kartaDrugiegoRodzica}
        {otwarcie.wariant === 'zam-14-tygodni' ? (
          <Karta tytul={t.kartaDanychZus} bezLinii>
            <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
            <ListaDanych
              pozycje={[
                ...(platnik ? [{ etykieta: t.platnikZasilku, wartosc: t.platnicy[platnik] }] : []),
                { etykieta: t.wniosekOZasilek, wartosc: t.brakWnioskuZam },
              ]}
            />
          </Karta>
        ) : null}
        <KartaWiecejInformacji odnosniki={[ODNOSNIKI.zus, ODNOSNIKI.mrpips]} />
      </>
    );
    const okres14 = okresZamZa14Tygodni(urlop.dataPorodu);
    return (
      <>
        {naglowek(t.wstepZasilek)}
        <UkladDwuKolumnowy
          etykietaBocznej={t.kartaDrugiegoRodzica}
          tresc={
            <>
              {kartaUrlopu}
              {bladOperacjiKomunikat}
              {otwarcie.wariant === 'zam-14-tygodni' ? (
                <Karta tytul={t.kartaZam14} bezLinii>
                  <p className="m-0">{t.zam14Opis}</p>
                  <RamkaOkresu
                    etykieta={t.okresZasilkuWeWniosku}
                    okres={t.okresZasilku100({ od: formatujDate(okres14.od), do_: formatujDate(okres14.do) })}
                  />
                  <div className="mt-6">
                    <Przycisk type="button" wariant="glowny" zajety={zajety} onClick={zlozZam14}>
                      {t.zlozZam14}
                    </Przycisk>
                  </div>
                </Karta>
              ) : otwarcie.wariant === 'rezygnacja-w-ezus' ? (
                <Karta tytul={t.kartaRezygnacjiZasilku} bezLinii>
                  {/* Wniosek ZAS-23 z oświadczeniem ojca dziecka składa się w symulowanym eZUS (ViewEzusZas23). */}
                  {wyslanyZas23 ? (
                    <Komunikat
                      kod="0337"
                      parametry={{
                        data: formatujDate(wyslanyZas23.dataZlozenia ?? dzis),
                        dataRezygnacji: formatujDate(wyslanyZas23.okresy[0]?.od ?? dzis),
                      }}
                      akcje={
                        <PrzyciskLink href={trasy.ViewEzusZas23()} wariant="drugorzedny" nowaKarta>
                          {t.przejdzDoEzus}
                        </PrzyciskLink>
                      }
                    />
                  ) : (
                    <Komunikat
                      kod="0207"
                      akcje={
                        <PrzyciskLink href={trasy.ViewEzusZas23()} wariant="drugorzedny" nowaKarta>
                          {t.przejdzDoEzus}
                        </PrzyciskLink>
                      }
                    />
                  )}
                </Karta>
              ) : (
                <>
                  <Komunikat kod="0261" />
                  {/* Zleceniodawca, który wypłaca zasiłek, przyjmuje pisemny wniosek o rezygnację z oświadczeniem ojca dziecka. */}
                  <FormularzRezygnacjiZZasilku
                    adresat="platnik-skladek"
                    idSprawy={wniosekZam?.idSprawy ?? idSprawy}
                    urlop={urlop}
                    zOrzeczeniem={otwarcie.zOrzeczeniem}
                    dzis={dzis}
                    matka={`${konto.imie} ${konto.nazwisko}`}
                    ojciec={imieOjca ?? ''}
                    nazwaPlatnika={daneRodziny.matka.platnikZasilku?.nazwaPlatnika}
                    zapisana={przygotowanaDlaZleceniodawcy}
                    onWroc={() => router.push(powrotHref)}
                  />
                </>
              )}
            </>
          }
          boczna={bocznaZasilku}
        />
      </>
    );
  }

  const formularz = otwarcie.wariant === 'formularz';
  const email = daneRodziny.matka.emailPracodawcy?.wartosc;

  return (
    <>
      {naglowek(t.wstepPracownica)}
      <UkladDwuKolumnowy
        etykietaBocznej={t.kartaDrugiegoRodzica}
        tresc={
          <>
            {czescWidoczna(1) ? kartaUrlopu : null}
            {bladOperacjiKomunikat}
            {czescWidoczna(2) ? (
              <Karta tytul={t.kartaPowrotu} bezLinii>
                {formularz ? (
                  <>
                    <PoleDaty
                      id={ID_POLA}
                      etykieta={t.poleDatyPowrotu}
                      podpowiedz={t.podpowiedzPowrotu({ od: formatujDate(najwczesniej), do_: formatujDate(urlop.okres.do) })}
                      wartosc={tekstPowrotu}
                      onZmiana={setTekstPowrotu}
                      {...walidacja.pole('powrot')}
                      dodatek={ostrzezenie && !blad ? <OstrzezeniePola id={`${ID_POLA}-uwaga`} kod={ostrzezenie} /> : undefined}
                      wymagane
                      className="max-w-120"
                    />
                    {dataPowrotu && !blad ? (
                      <RamkaOkresu
                        etykieta={imieOjca ? t.ojciecPrzejmie({ imieINazwisko: imieOjca }) : t.ojciecDzieckaPrzejmie}
                        okres={t.okres({ od: formatujDate(dataPowrotu), do_: formatujDate(urlop.okres.do) })}
                      />
                    ) : null}
                  </>
                ) : (
                  <Komunikat
                    kod={otwarcie.kod}
                    akcje={
                      otwarcie.wariant === 'brak-drugiego-rodzica' ? (
                        <PrzyciskLink href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wariant="drugorzedny">
                          {t.przejdzDoProfilu}
                        </PrzyciskLink>
                      ) : (
                        <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
                          {t.przejdzDoPlanu}
                        </PrzyciskLink>
                      )
                    }
                  />
                )}
              </Karta>
            ) : null}
            {formularz && zalaczniki.length > 0 && czescWidoczna(3) ? (
              <Karta tytul={t.kartaZalacznikow} bezLinii>
                <ListaZalacznikow pozycje={zalaczniki} pliki={pliki} onZmianaPlikow={setPliki} wlasciciel={pesel} />
              </Karta>
            ) : null}
            {formularz ? (
              <PrzyciskiCzesci
                czesci={czesci}
                onAkcjaKroku={przejdzDalej}
                onWrocKroku={() => router.push(powrotHref)}
                zajety={zajety}
              />
            ) : null}
          </>
        }
        boczna={
          <>
            {kartaDrugiegoRodzica}
            {formularz ? (
              <Karta tytul={t.kartaAdresata} bezLinii>
                <p className="m-0 mb-4">{email ? t.adresat({ email }) : t.adresatBezAdresu}</p>
                <Notatka ikona="info">{t.notatkaSzkicu}</Notatka>
              </Karta>
            ) : null}
            <KartaWiecejInformacji odnosniki={[ODNOSNIKI.zus, ODNOSNIKI.mrpips, ODNOSNIKI.pip]} />
          </>
        }
      />
    </>
  );
}
