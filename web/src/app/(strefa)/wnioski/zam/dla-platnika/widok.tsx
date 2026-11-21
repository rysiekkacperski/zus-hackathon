'use client';

import { useSearchParams } from 'next/navigation';
import { DokumentDoDruku, drukujDokument } from '@/komponenty/dokument-do-druku';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { pobierzPlik } from '@/komponenty/pobieranie';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { dataZeZnacznika, formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { DaneOsobyWniosku, Wniosek, WniosekZam } from '@/domena/typy';
import { komunikatDlaPlatnika, nazwaPlikuDlaPlatnika } from '@/domena/wnioski/zam-przed-porodem';
import { listaDokumentowPrzyjecia } from '@/domena/wnioski/zam-przyjecie';
import { useKatalog, useKonto, useRodzina } from '@/dane/magazyn/hooki';
import { teksty } from '@/teksty';
import { zbudujPdf } from './_czesci/pdf-wniosku';
import { wierszeDokumentuZam } from './_czesci/tresc-dokumentu';

const t = teksty.ViewZamForPayer;

function czyZam(w: Wniosek): w is WniosekZam {
  return w.rodzaj === 'zam';
}

/** Lista numerowana ez-steps z numeracją od `start` (wzór P11-21: „Po porodzie” zaczyna się od 3). */
function KrokiPrzekazania({ pozycje, start = 1 }: { pozycje: string[]; start?: number }) {
  return (
    <ol role="list" className="m-0 grid list-none gap-6 p-0">
      {pozycje.map((tekst, i) => (
        <li key={tekst} className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-4">
          <span aria-hidden="true" className="box-border grid size-day place-items-center rounded-full border border-ink-muted text-ink">
            {start + i}
          </span>
          <span className="pt-1.5">{tekst}</span>
        </li>
      ))}
    </ol>
  );
}

function SzczegolWniosku({ etykieta, wartosc }: { etykieta: string; wartosc: string }) {
  return (
    <div>
      <dt className="text-body-strong">{etykieta}</dt>
      <dd className="m-0">{wartosc}</dd>
    </div>
  );
}

export function WidokZamDlaPlatnika() {
  const parametry = useSearchParams();
  const idWniosku = parametry.get('wniosek');
  const rodzina = useRodzina();
  const konto = useKonto();
  const katalog = useKatalog();
  const wniosek = rodzina?.wnioski.find((w): w is WniosekZam => czyZam(w) && w.idWniosku === idWniosku) ?? null;

  if (wniosek === null || konto === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={{ href: trasy.ViewFamilyPlan(), etykieta: t.powrot }} />
        <StanPusty
          ikona="plik"
          rolaStatus
          akcja={
            <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
              {t.sprawa.przejdzDoPlanu}
            </PrzyciskLink>
          }
        >
          {t.brakWniosku}
        </StanPusty>
      </>
    );
  }

  const wnioskodawca: DaneOsobyWniosku = wniosek.daneRodzica ?? { imie: konto.imie, nazwisko: konto.nazwisko, pesel: konto.pesel };
  const nazwaPliku = wniosek.nazwaPlikuDlaPlatnika ?? nazwaPlikuDlaPlatnika(wniosek, wnioskodawca.imie, wnioskodawca.nazwisko);
  const dataPrzygotowania = dataZeZnacznika(wniosek.zaktualizowano);
  const rodzic = rodzina?.daneRodziny.rodzicKonta === 'drugi-rodzic' ? rodzina.daneRodziny.drugiRodzic : rodzina?.daneRodziny.matka;
  const nazwaPlatnika = rodzic?.platnikZasilku?.nazwaPlatnika;
  const przedPorodem = Boolean(wniosek.przedPorodem);
  const kod = komunikatDlaPlatnika(wniosek);

  const dzieci = wniosek.daneDzieci.length > 0 ? wniosek.daneDzieci : [];
  const wiersze = wierszeDokumentuZam({ wniosek, wnioskodawca, dzieci, dataPrzygotowania, ...(nazwaPlatnika ? { nazwaPlatnika } : {}) });

  const pozycja = rodzina?.plan?.pozycje.find((p) => p.idSprawy === wniosek.idSprawy);
  const tytulPozycji = katalog.pozycje.find((p) => p.id === (pozycja?.idPozycji ?? wniosek.idSprawy))?.tytul ?? t.sprawa.tytulDomyslny;

  const okresy = wniosek.okresy;
  const pierwszy = okresy[0];
  const ostatni = okresy[okresy.length - 1];
  const wariant81 = okresy.some((o) => o.stawka === 81.5);
  const rodzajGlowny = pierwszy ? t.rodzajeUrlopu[pierwszy.rodzajUrlopu] : t.rodzajeUrlopu.macierzynski;
  const rodzajBazowy = przedPorodem ? t.szczegoly.przedPorodem({ rodzaj: rodzajGlowny }) : rodzajGlowny;
  const rodzajOpis = wariant81 && okresy.length > 1 ? t.szczegoly.zCalymRodzicielskim({ rodzaj: rodzajBazowy }) : rodzajBazowy;
  const stawka = pierwszy?.stawka ?? 100;
  const opisZasilku = wariant81
    ? t.szczegoly.stawkaCalyOkres({ procent: formatujProcent(81.5) })
    : t.szczegoly.stawka({ procent: formatujProcent(stawka) });
  const dziecko = dzieci[0];

  const pozycjeTeraz: string[] = [t.coPrzekazac.wniosek];
  if (przedPorodem) pozycjeTeraz.push(t.coPrzekazac.zaswiadczenie);
  else if (wniosek.przyjecie) {
    const przyjecie = rodzina?.daneCiazy?.przyjecie;
    for (const dokument of listaDokumentowPrzyjecia({
      forma: wniosek.przyjecie.forma,
      odroczenieObowiazkuSzkolnego: przyjecie?.odroczenieObowiazkuSzkolnego,
    })) {
      pozycjeTeraz.push(t.dokumentPrzyjeciaKrok({ dokument: t.dokumentyPrzyjecia[dokument] }));
    }
  } else pozycjeTeraz.push(t.coPrzekazac.odpis);

  function pobierz() {
    pobierzPlik(nazwaPliku, 'application/pdf', zbudujPdf(wiersze));
  }

  const tresc = (
    <div className="flex min-w-0 flex-col gap-7.5">
      <Komunikat kod={kod} />
      <Karta tytul={t.dokument.tytul} bezLinii>
        <div className="flex items-center gap-3 rounded-sm bg-surface-page px-5 py-4">
          <Ikona nazwa="plik" className="flex-none text-brand" />
          <div className="min-w-0">
            <p className="m-0 text-body-strong break-words">{nazwaPliku}</p>
            <p className="m-0">{t.dokument.opisPliku({ data: formatujDate(dataPrzygotowania) })}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <Przycisk type="button" wariant="glowny" ikona="pobierz" onClick={pobierz}>
            {t.dokument.pobierz}
          </Przycisk>
          <Przycisk type="button" wariant="drugorzedny" ikona="drukuj" onClick={() => drukujDokument(nazwaPliku)}>
            {t.dokument.drukuj}
          </Przycisk>
        </div>
        {przedPorodem ? null : <Notatka className="mt-4">{t.dokument.notatkaDruku}</Notatka>}
      </Karta>

      <Karta tytul={t.coPrzekazac.tytul} bezLinii>
        {przedPorodem ? (
          <>
            <p className="m-0 mb-4 text-body-strong">{t.coPrzekazac.teraz}</p>
            <KrokiPrzekazania pozycje={pozycjeTeraz} />
            <p className="m-0 mt-6 mb-4 text-body-strong">{t.coPrzekazac.poPorodzie}</p>
            <KrokiPrzekazania pozycje={[t.coPrzekazac.odpisPoPorodzie]} start={pozycjeTeraz.length + 1} />
            <p className="m-0 mt-6">{t.coPrzekazac.oznaczPoWniosku}</p>
          </>
        ) : (
          <>
            <KrokiPrzekazania pozycje={pozycjeTeraz} />
            <p className="m-0 mt-6">{t.coPrzekazac.oznaczPoDokumentach}</p>
          </>
        )}
      </Karta>

      <Karta tytul={t.sprawa.tytul} bezLinii>
        <div className="flex items-start gap-3 rounded-sm bg-surface-page px-5 py-4">
          <Ikona nazwa="plik" className="flex-none text-brand" />
          <div className="min-w-0">
            <p className="m-0 text-body-strong">{t.sprawa.tytulSprawy({ id: wniosek.idSprawy, tytul: tytulPozycji })}</p>
            <p className="m-0">{t.sprawa.status}</p>
            {przedPorodem ? <p className="m-0">{t.sprawa.poPorodzie}</p> : null}
          </div>
        </div>
        <div className="mt-6">
          <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
            {t.sprawa.przejdzDoPlanu}
          </PrzyciskLink>
        </div>
      </Karta>
    </div>
  );

  const boczna = (
    <Karta tytul={t.szczegoly.tytul} bezLinii>
      <dl className="m-0 grid gap-4">
        <SzczegolWniosku etykieta={t.szczegoly.rodzajUrlopu} wartosc={rodzajOpis} />
        {wniosek.przedPorodem ? (
          <>
            <SzczegolWniosku etykieta={t.szczegoly.dzienPoczatku} wartosc={formatujDate(wniosek.przedPorodem.dzienPoczatkuZasilku)} />
            <SzczegolWniosku etykieta={t.szczegoly.terminPorodu} wartosc={formatujDate(wniosek.przedPorodem.przewidywanyTerminPorodu)} />
          </>
        ) : null}
        {pierwszy && ostatni ? (
          <SzczegolWniosku
            etykieta={t.szczegoly.okres}
            wartosc={t.szczegoly.okresWartosc({ od: formatujDate(pierwszy.od), do_: formatujDate(ostatni.do) })}
          />
        ) : null}
        <SzczegolWniosku etykieta={t.szczegoly.zasilek} wartosc={opisZasilku} />
        <SzczegolWniosku etykieta={t.szczegoly.adresat} wartosc={t.szczegoly.adresatPlatnik} />
        {dziecko && !przedPorodem ? (
          <SzczegolWniosku etykieta={t.szczegoly.dziecko} wartosc={`${dziecko.imie} ${dziecko.nazwisko}`.trim()} />
        ) : null}
      </dl>
    </Karta>
  );

  return (
    <>
      <div className="print:hidden">
        <NaglowekStrony tytul={t.naglowek} powrot={{ href: trasy.ViewFamilyPlan(), etykieta: t.powrot }} />
        <UkladDwuKolumnowy tresc={tresc} boczna={boczna} etykietaBocznej={t.szczegoly.etykieta} />
      </div>
      <div className="hidden print:block">
        <DokumentDoDruku tytul={wiersze[0]?.tekst ?? t.pdf.tytul} nazwaPliku={nazwaPliku} flagaDemo>
          {wiersze.slice(1).map((w, i) =>
            w.rodzaj === 'naglowek' ? (
              <h3 key={i} className="m-0 mt-2 text-body-strong text-ink-strong">
                {w.tekst}
              </h3>
            ) : (
              <p key={i} className="m-0">
                {w.tekst}
              </p>
            ),
          )}
        </DokumentDoDruku>
      </div>
    </>
  );
}
