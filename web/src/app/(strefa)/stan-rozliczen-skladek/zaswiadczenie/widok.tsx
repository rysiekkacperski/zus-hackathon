'use client';

// ViewContributionCertificate (3.4.5.1.2; wzory cz2/P17-09…P17-14, dokument P17-12). Właściciel: u14.
import { useState } from 'react';
import { useDzis, useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { wystawZaswiadczenieORozliczeniach } from '@/dane/magazyn/operacje/rozliczenia';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import type { IdPliku, KodKomunikatu, ZaswiadczenieOStanieRozliczen } from '@/domena/typy';
import { domyslnyDzienZaswiadczenia, walidujDzienStanu } from '@/domena/zasilki/stan-rozliczen';
import { drukujDokument } from '@/komponenty/dokument-do-druku';
import { formatujDate, formatujDateICzas, formatujKwote } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import { teksty } from '@/teksty';
import { useStanRozliczenKonta } from '../_czesci/wyliczenia';

const t = teksty.ViewContributionCertificate;
const ID_POLA = 'dzien-stanu-rozliczen';
const ID_POLA_INNEGO = 'dzien-stanu-rozliczen-inny';

function umowaTekst(z: ZaswiadczenieOStanieRozliczen): string {
  return z.umowa ? t.umowaOpis({ rodzaj: t.umowaRodzaje[z.umowa.rodzaj], kwota: formatujKwote(z.umowa.kwotaObjeta) }) : t.umowaBrak;
}

export function WidokZaswiadczeniaORozliczeniach() {
  const wynik = useStanRozliczenKonta();
  const dzis = useDzis();
  const pesel = wynik?.dane.konto.pesel;
  const stanZus = useStanSymulowanegoZus(pesel);
  const [tekst, setTekst] = useState(() =>
    formatujDate(domyslnyDzienZaswiadczenia(wynik?.dane.rodzina?.daneCiazy ?? null, dzis)),
  );
  const [blad, setBlad] = useState<{ kod: KodKomunikatu; parametry?: Record<string, string> } | null>(null);
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const [idPliku, setIdPliku] = useState<IdPliku | null>(null);
  const [zajety, setZajety] = useState(false);

  if (!wynik) return null;
  const poczatek = wynik.dzialalnosc?.od ?? null;
  const wystawione = idPliku ? stanZus?.zaswiadczeniaORozliczeniach.find((z) => z.idPliku === idPliku) ?? null : null;

  async function wystaw(idPola: string) {
    setBladOgolny(null);
    const wynikWalidacji = walidujDzienStanu(tekst, dzis, poczatek);
    if ('kod' in wynikWalidacji) {
      setBlad(wynikWalidacji);
      document.getElementById(idPola)?.focus();
      return;
    }
    setBlad(null);
    setZajety(true);
    const rezultat = await wystawZaswiadczenieORozliczeniach(wynikWalidacji.dzien, pobierzKontekstOperacji());
    setZajety(false);
    if (!rezultat.ok) {
      setBladOgolny(rezultat.kod);
      return;
    }
    setIdPliku(rezultat.wartosc.idPliku);
  }

  const tekstBledu = blad ? trescKomunikatu(blad.kod, blad.parametry) : null;
  const podpowiedz = poczatek ? t.podpowiedzDnia({ data: formatujDate(poczatek) }) : t.podpowiedzDniaBezDzialalnosci;
  const nazwaPliku = wystawione ? t.nazwaPliku({ data: formatujDate(wystawione.dzienStanu).replaceAll('.', '-') }) : '';

  const formularz = (idPola: string, glowny: boolean) => (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void wystaw(idPola);
      }}
      className="flex flex-col gap-4"
    >
      <PoleDaty
        id={idPola}
        etykieta={t.poleDnia}
        wartosc={tekst}
        onZmiana={setTekst}
        blad={tekstBledu}
        podpowiedz={glowny ? podpowiedz : poczatek ? t.podpowiedzInnegoDnia({ data: formatujDate(poczatek) }) : podpowiedz}
      />
      {glowny ? <Notatka>{t.podpowiedzDomyslna}</Notatka> : null}
      <div className="flex flex-wrap gap-4">
        <Przycisk type="submit" wariant={glowny ? 'glowny' : 'drugorzedny'} zajety={zajety}>
          {t.wystaw}
        </Przycisk>
        {glowny ? (
          <PrzyciskLink href={trasy.ViewContributionBalance()} wariant="drugorzedny">
            {t.wrocDoStanu}
          </PrzyciskLink>
        ) : null}
      </div>
    </form>
  );

  return (
    <>
      <div className="print:hidden">
        <NaglowekStrony tytul={t.naglowek} powrot={{ etykieta: t.powrot }} />
        <div className="flex max-w-tresc flex-col gap-7.5">
          {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
          {wystawione ? (
            <>
              <Komunikat kod="0118" typ="SUCCESS" />
              <Karta tytul={t.wystawioneTytul}>
                <div className="flex flex-col gap-4">
                  <ListaDefinicji
                    pozycje={[
                      { etykieta: t.rodzaj, wartosc: t.rodzaje[wystawione.rodzaj] },
                      { etykieta: t.dzienStanu, wartosc: formatujDate(wystawione.dzienStanu) },
                      { etykieta: t.kwotaZadluzenia, wartosc: formatujKwote(wystawione.kwotaZadluzenia) },
                      { etykieta: t.umowa, wartosc: umowaTekst(wystawione) },
                      { etykieta: t.wystawiono, wartosc: formatujDateICzas(wystawione.wystawiono) },
                    ]}
                  />
                  <div className="flex flex-wrap gap-4">
                    <Przycisk wariant="glowny" ikona="pobierz" onClick={() => drukujDokument(nazwaPliku)}>
                      {t.pobierz}
                    </Przycisk>
                  </div>
                  <Notatka>{t.notatkaPobrania}</Notatka>
                </div>
              </Karta>
              <Karta tytul={t.innyDzienTytul}>{formularz(ID_POLA_INNEGO, false)}</Karta>
              <div className="flex flex-wrap gap-4">
                <PrzyciskLink href={trasy.ViewContributionBalance()} wariant="drugorzedny">
                  {t.wrocDoStanu}
                </PrzyciskLink>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-7.5">
              <Karta tytul={t.wyborTytul} className="grow-999 basis-140 min-w-0">
                <div className="flex flex-col gap-4">
                  <p className="m-0">{t.wyborOpis}</p>
                  {formularz(ID_POLA, true)}
                </div>
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
      {wystawione ? <DokumentZaswiadczenia z={wystawione} /> : null}
    </>
  );
}

/** Treść pliku PDF zaświadczenia z oznaczeniem symulacji na każdej stronie wydruku (wzór P17-12). */
function DokumentZaswiadczenia({ z }: { z: ZaswiadczenieOStanieRozliczen }) {
  const data = formatujDate(z.dzienStanu);
  const podsumowanie =
    z.kwotaZadluzenia === 0
      ? t.pdfPodsumowanieNiezaleganie({ data })
      : z.rodzaj === 'o-niezaleganiu'
        ? t.pdfPodsumowanieUmowa({ data })
        : t.pdfPodsumowanieZadluzenie({ data, kwota: formatujKwote(z.kwotaZadluzenia) });
  const wiersze = [
    [t.pdfImieNazwisko, `${z.imie} ${z.nazwisko}`],
    [t.pdfPesel, z.pesel],
    [t.dzienStanu, data],
    [t.pdfRodzaj, t.rodzaje[z.rodzaj]],
    [t.kwotaZadluzenia, formatujKwote(z.kwotaZadluzenia)],
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
