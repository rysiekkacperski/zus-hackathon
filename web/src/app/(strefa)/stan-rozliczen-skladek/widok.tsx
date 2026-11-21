'use client';

// ViewContributionBalance (3.4.5.1.1; wzory cz2/Stan-rozliczen i P17-02…P17-08). Właściciel: u14.
import { formatujDate, formatujDateICzas, formatujKwote } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { czyUmowaBezZadluzenia, zadluzenieNieobjeteUmowa } from '@/domena/zasilki/stan-rozliczen';
import { teksty } from '@/teksty';
import { KafleWartosci, type KafelWartosci } from '../zaswiadczenia-e-zla/_czesci/kafle-wartosci';
import { useStanRozliczenKonta, type KartaStanu } from './_czesci/wyliczenia';

const t = teksty.ViewContributionBalance;

export function WidokStanuRozliczen() {
  const wynik = useStanRozliczenKonta();
  if (!wynik) return null;
  const { dane, dzialalnosc, niedostepny, karty, prog, minimalne, maChorobowe } = wynik;
  const kopia = dane.kopia;

  const stopka = (
    <div className="flex flex-wrap gap-4">
      <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
        {t.wrocDoPlanu}
      </PrzyciskLink>
    </div>
  );

  const naglowek = (
    <NaglowekStrony
      tytul={t.naglowek}
      powrot={{ etykieta: t.powrot }}
      wstep={kopia ? t.stanNa({ data: formatujDateICzas(kopia.odczytano) }) : undefined}
      akcje={
        !niedostepny && dzialalnosc ? (
          <PrzyciskLink href={trasy.ViewContributionCertificate()} wariant="glowny">
            {t.wystawZaswiadczenie}
          </PrzyciskLink>
        ) : undefined
      }
    />
  );

  if (!kopia || !dzialalnosc) {
    return (
      <>
        {naglowek}
        <div className="flex max-w-tresc flex-col gap-7.5">
          {!kopia ? <Komunikat kod="0001" /> : <Notatka>{t.brakDzialalnosci}</Notatka>}
          {stopka}
        </div>
      </>
    );
  }

  if (niedostepny) {
    return (
      <>
        {naglowek}
        <div className="flex max-w-tresc flex-col gap-7.5">
          <Komunikat kod="0150" />
          <Karta tytul={t.niedostepnyTytul}>
            <StanPusty
              ikona="pieniadze"
              akcja={
                <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
                  {t.potwierdzWPlanie}
                </PrzyciskLink>
              }
            >
              <p className="m-0">{t.niedostepnyOpis}</p>
            </StanPusty>
          </Karta>
          {stopka}
        </div>
      </>
    );
  }

  const tresc = (
    <div className="flex flex-col gap-7.5">
      {karty.map((k) => (
        <KartaDnia key={k.klucz} karta={k} pokazZadluzenieOd={!maChorobowe} />
      ))}
    </div>
  );

  const boczna = maChorobowe ? (
    <Karta tytul={t.wplywTytul}>
      <div className="flex flex-col gap-4">
        <ListaDefinicji
          szerokoscEtykiety="waska"
          pozycje={[
            { etykieta: t.progZadluzenia, wartosc: t.wplywProg({ prog: formatujKwote(prog), minimalne: formatujKwote(minimalne) }) },
            { etykieta: t.wplywPonadProgEtykieta, wartosc: t.wplywPonadProg },
            { etykieta: t.wplywWyplataEtykieta, wartosc: t.wplywWyplata },
          ]}
        />
        <Notatka>{t.notatkaOdczytu}</Notatka>
      </div>
    </Karta>
  ) : undefined;

  return (
    <>
      {naglowek}
      <div className="flex max-w-tresc flex-col gap-7.5">
        <UkladDwuKolumnowy tresc={tresc} boczna={boczna} etykietaBocznej={t.wplywTytul} />
        {stopka}
      </div>
    </>
  );
}

function KartaDnia({ karta, pokazZadluzenieOd }: { karta: KartaStanu; pokazZadluzenieOd: boolean }) {
  const { dzienPrawa, stan, prog, komunikaty } = karta;
  const tytul =
    dzienPrawa === null ? t.kartaNaDzis : dzienPrawa.swiadczenie === 'zasilek-chorobowy' ? t.kartaChorobowy : t.kartaMacierzynski;
  const opisDnia =
    dzienPrawa === null
      ? null
      : dzienPrawa.podstawa === 'e-zla'
        ? t.dzienPrawaEzla({ data: formatujDate(dzienPrawa.dzien), numer: dzienPrawa.seriaINumer ?? '' })
        : dzienPrawa.podstawa === 'porod'
          ? t.dzienPrawaPorod({ data: formatujDate(dzienPrawa.dzien) })
          : t.dzienPrawaTermin({ data: formatujDate(dzienPrawa.dzien) });

  const data = formatujDate(stan.dzien);
  const umowaBezZadluzenia = czyUmowaBezZadluzenia(stan);
  const kafle: KafelWartosci[] = [];
  if (umowaBezZadluzenia && stan.umowa) {
    kafle.push({
      etykieta: t.objetaUmowaNa({ data, rodzaj: t.objetaUmowaRodzaje[stan.umowa.rodzaj] }),
      wartosc: formatujKwote(stan.umowa.kwotaObjeta),
    });
  } else {
    kafle.push({
      etykieta: t.zadluzenieNa({ data }),
      wartosc: formatujKwote(stan.kwotaZadluzenia),
      dopisek:
        stan.opisZadluzenia ??
        (pokazZadluzenieOd && stan.zadluzenieOd && stan.kwotaZadluzenia > 0
          ? t.zadluzenieOd({ data: formatujDate(stan.zadluzenieOd) })
          : undefined),
    });
    if (stan.kwotaZadluzenia > prog) kafle.push({ etykieta: t.progZadluzenia, wartosc: formatujKwote(prog) });
    if (stan.dataSplaty) kafle.push({ etykieta: t.dataSplaty, wartosc: formatujDate(stan.dataSplaty) });
  }
  const umowa = stan.umowa
    ? `${t.umowaOpis[stan.umowa.rodzaj]} – ${stan.umowa.splacanaZgodnieZUmowa ? t.umowaZgodnie : t.umowaNiezgodnie}`
    : t.umowaBrak;

  return (
    <Karta tytul={tytul}>
      <div className="flex flex-col gap-4">
        {opisDnia ? <p className="m-0">{opisDnia}</p> : null}
        <KafleWartosci kafle={kafle} />
        <ListaDefinicji
          pozycje={[
            { etykieta: t.umowa, wartosc: umowa },
            ...(stan.umowa ? [{ etykieta: t.nieobjeteUmowa, wartosc: formatujKwote(zadluzenieNieobjeteUmowa(stan)) }] : []),
          ]}
        />
        {komunikaty.map((k) => (
          <Komunikat
            key={k.kod}
            kod={k.kod}
            tresc={trescKomunikatu(k.kod, k.parametry)}
            akcje={
              k.kod === '0083' ? (
                <Odnosnik href={trasy.ViewFamilyPlan()} wTekscie>
                  {t.sprawyWPlanie}
                </Odnosnik>
              ) : undefined
            }
          />
        ))}
      </div>
    </Karta>
  );
}
