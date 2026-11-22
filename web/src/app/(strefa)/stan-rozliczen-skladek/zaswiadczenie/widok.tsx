'use client';

// ViewNoArrearsCertificateRequest, wniosek o zaświadczenie o niezaleganiu w opłacaniu składek (3.4.5.1.4;
// trasa i grupa tekstów ViewContributionCertificate). Dzień stanu rozliczeń to dzień wysłania wniosku.
// Właściciel: u14.
import { useState } from 'react';
import { useDzis, useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { useStanZajetosci } from '@/komponenty/nawigacja-z-ladowaniem';
import { wyslijWniosekOZaswiadczenieONiezaleganiu } from '@/dane/magazyn/operacje/rozliczenia';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { IdPliku, KodKomunikatu, ZaswiadczenieOStanieRozliczen } from '@/domena/typy';
import { dzienPrawaMacierzynskiego } from '@/domena/zasilki/stan-rozliczen';
import { drukujDokument } from '@/komponenty/dokument-do-druku';
import { formatujDate, formatujDateICzas, formatujKwote } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { useStanRozliczenKonta } from '../_czesci/wyliczenia';

const t = teksty.ViewContributionCertificate;

function umowaTekst(z: ZaswiadczenieOStanieRozliczen): string {
  return z.umowa ? t.umowaOpis({ rodzaj: t.umowaRodzaje[z.umowa.rodzaj], kwota: formatujKwote(z.umowa.kwotaObjeta) }) : t.umowaBrak;
}

export function WidokZaswiadczeniaORozliczeniach() {
  const wynik = useStanRozliczenKonta();
  const dzis = useDzis();
  const pesel = wynik?.dane.konto.pesel;
  const stanZus = useStanSymulowanegoZus(pesel);
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const [idPliku, setIdPliku] = useState<IdPliku | null>(null);
  const [zajety, setZajety] = useStanZajetosci();
  const wydany = idPliku ? stanZus?.zaswiadczeniaORozliczeniach.find((z) => z.idPliku === idPliku) ?? null : null;

  if (!wynik) return null;

  // Komunikat 0291, gdy dzień powstania prawa do zasiłku macierzyńskiego przypada przed dniem dzisiejszym.
  const dzienPrawa = dzienPrawaMacierzynskiego(wynik.dane.rodzina?.daneCiazy ?? null, {
    wnioski: wynik.dane.rodzina?.wnioski ?? [],
    pesel: wynik.dane.konto.pesel,
  });
  const pokaz0291 = dzienPrawa !== null && dzienPrawa.dzien < dzis;

  async function wyslij() {
    setBladOgolny(null);
    setZajety(true);
    const rezultat = await wyslijWniosekOZaswiadczenieONiezaleganiu(pobierzKontekstOperacji());
    setZajety(false);
    if (!rezultat.ok) {
      setBladOgolny(rezultat.kod);
      return;
    }
    setIdPliku(rezultat.wartosc.idPliku);
  }

  const nazwaPliku = wydany
    ? t.nazwaPliku({ data: formatujDate(wydany.dzienStanu).replaceAll('.', '-'), rodzaj: wydany.rodzaj })
    : '';

  return (
    <>
      <div className="print:hidden">
        <NaglowekStrony tytul={t.naglowek} powrot={{ etykieta: t.powrot }} />
        <div className="flex max-w-tresc flex-col gap-7.5">
          {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
          {wydany ? (
            <>
              {wydany.rodzaj === 'o-niezaleganiu' ? (
                <Komunikat kod="0118" typ="SUCCESS" />
              ) : (
                <Komunikat
                  kod="0262"
                  parametry={{ data: formatujDate(wydany.dzienStanu), kwota: formatujKwote(wydany.kwotaZadluzenia) }}
                />
              )}
              <Karta tytul={t.wystawioneTytul}>
                <div className="flex flex-col gap-4">
                  <ListaDefinicji
                    pozycje={[
                      { etykieta: t.rodzaj, wartosc: t.rodzaje[wydany.rodzaj] },
                      { etykieta: t.dzienStanu, wartosc: formatujDate(wydany.dzienStanu) },
                      { etykieta: t.kwotaZadluzenia, wartosc: formatujKwote(wydany.kwotaZadluzenia) },
                      { etykieta: t.umowa, wartosc: umowaTekst(wydany) },
                      { etykieta: t.wystawiono, wartosc: formatujDateICzas(wydany.wystawiono) },
                    ]}
                  />
                  <div className="flex flex-wrap gap-4">
                    <Przycisk wariant="glowny" ikona="pobierz" onClick={() => drukujDokument(nazwaPliku)}>
                      {t.pobierz[wydany.rodzaj]}
                    </Przycisk>
                    <PrzyciskLink href={trasy.ViewContributionBalance()} wariant="drugorzedny">
                      {t.wrocDoStanu}
                    </PrzyciskLink>
                  </div>
                  <Notatka>{t.notatkaPobrania}</Notatka>
                </div>
              </Karta>
            </>
          ) : (
            <div className="flex flex-wrap gap-7.5">
              <Karta tytul={t.wniosekTytul} className="grow-999 basis-140 min-w-0">
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    void wyslij();
                  }}
                  className="flex flex-col gap-4"
                >
                  <p className="m-0">{t.wniosekOpis}</p>
                  <ListaDefinicji pozycje={[{ etykieta: t.dzienStanu, wartosc: formatujDate(dzis) }]} />
                  {pokaz0291 && dzienPrawa ? (
                    <Komunikat
                      kod="0291"
                      parametry={{ data: formatujDate(dzis), dataPowstaniaPrawa: formatujDate(dzienPrawa.dzien) }}
                    />
                  ) : (
                    <Notatka>{t.dzienStanuOpis}</Notatka>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <Przycisk type="submit" wariant="glowny" zajety={zajety}>
                      {t.wyslij}
                    </Przycisk>
                    <PrzyciskLink href={trasy.ViewContributionBalance()} wariant="drugorzedny">
                      {t.wrocDoStanu}
                    </PrzyciskLink>
                  </div>
                </form>
              </Karta>
              <Karta tytul={t.coZawieraTytul} className="grow basis-84 max-w-84 min-w-0">
                <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
                  {t.coZawiera.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Karta>
            </div>
          )}
        </div>
      </div>
      {wydany ? <DokumentZaswiadczenia z={wydany} /> : null}
    </>
  );
}

/** Treść pliku PDF zaświadczenia albo decyzji o odmowie z oznaczeniem symulacji na każdej stronie wydruku. */
function DokumentZaswiadczenia({ z }: { z: ZaswiadczenieOStanieRozliczen }) {
  const data = formatujDate(z.dzienStanu);
  const podsumowanie =
    z.rodzaj === 'o-wysokosci-zadluzenia'
      ? t.pdfPodsumowanieOdmowa({ data })
      : z.kwotaZadluzenia === 0
        ? t.pdfPodsumowanieNiezaleganie({ data })
        : t.pdfPodsumowanieUmowa({ data });
  const wiersze = [
    [t.pdfImieNazwisko, `${z.imie} ${z.nazwisko}`],
    [t.pdfPesel, z.pesel],
    [t.dzienStanu, data],
    [t.pdfRodzaj, t.rodzaje[z.rodzaj]],
    [t.umowaPdf, umowaTekst(z)],
    [t.wystawiono, formatujDateICzas(z.wystawiono)],
  ];
  return (
    <article className="hidden text-ink-max print:block">
      <p className="m-0 border-b border-line-strong pb-2 text-small-strong print:fixed print:inset-x-0 print:top-0 print:bg-surface-card">
        {t.pdfSymulacjaGora}
      </p>
      <div className="flex flex-col gap-4 py-10">
        <p className="m-0 text-logo">{t.pdfLogo}</p>
        <p className="m-0 text-small">{t.pdfWystawiono({ data: formatujDateICzas(z.wystawiono) })}</p>
        <h1 className="m-0 text-page-title">{t.rodzaje[z.rodzaj]}</h1>
        <p className="m-0">{t.pdfPodtytul}</p>
        <table className="w-full border-collapse text-body">
          <caption className="sr-only">{t.pdfPodpisTabeli}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{t.pdfKolumnaPole}</th>
              <th scope="col">{t.pdfKolumnaWartosc}</th>
            </tr>
          </thead>
          <tbody>
            {wiersze.map(([etykieta, wartosc]) => (
              <tr key={etykieta}>
                <th scope="row" className="border-b border-line-row py-2 pr-4 text-left font-semibold">
                  {etykieta}
                </th>
                <td className="border-b border-line-row py-2">{wartosc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="m-0">{podsumowanie}</p>
        <p className="m-0 text-small">{t.pdfStrona}</p>
      </div>
      <p className="m-0 border-t border-line-strong pt-2 text-small-strong print:fixed print:inset-x-0 print:bottom-0 print:bg-surface-card">
        {t.pdfSymulacjaDol}
      </p>
    </article>
  );
}
