'use client';

// Sekcja ViewCaseDetails „wniosek-z15” (kontrakt, sekcja 12.4). Właściciel: u30.
// Akcja złożenia wniosku o zasiłek opiekuńczy Z-15 przy sprawie K22 na koncie każdego rodzica, szkic do dokończenia,
// oznaczenie wniosku przygotowanego jako przekazanego płatnikowi i akcja dodatkowego zasiłku na koncie ojca.
import { useState } from 'react';
import { formatujDate } from '@/domena/daty';
import type { WniosekZ15 } from '@/domena/typy';
import { czyOjciecDziecka, ostatniDzienOsmegoTygodnia } from '@/domena/wnioski/z15';
import { oznaczZ15JakoPrzekazany } from '@/dane/magazyn/operacje/wnioski-z15';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewZ15Start.sekcjaSprawy;
const SYTUACJE_MATKI_DODATKOWEGO = ['szpital', 'orzeczenie', 'porzucenie'] as const;

export function SekcjaWniosekZ15({ sprawa, kontekst }: PropsSlotu<'sekcja'>) {
  const [przekazano, setPrzekazano] = useState<string | null>(null);
  if (sprawa.idPozycji !== 'K22') return null;
  if (kontekst.konto.rola !== 'rodzic' && kontekst.konto.rola !== 'drugi-rodzic') return null;

  const wnioski = kontekst.rodzina.wnioski.filter((w): w is WniosekZ15 => w.rodzaj === 'z-15' && w.konto === kontekst.konto.pesel);
  const szkic = wnioski.filter((w) => w.stan === 'szkic').sort((a, b) => b.zaktualizowano.localeCompare(a.zaktualizowano))[0];
  const przygotowany = wnioski.find((w) => w.stan === 'przygotowany');
  const wyslany = wnioski
    .filter((w) => w.stan === 'wyslany')
    .sort((a, b) => (b.dataZlozenia ?? '').localeCompare(a.dataZlozenia ?? ''))[0];
  const ciaza = kontekst.rodzina.daneCiazy;
  const dodatkowyDostepny =
    czyOjciecDziecka(kontekst.konto, kontekst.rodzina) &&
    ciaza?.dataPoroduPotwierdzona === true &&
    ciaza.dataPorodu !== undefined &&
    ciaza.sytuacjeSzczegolne.some(
      (s) => (SYTUACJE_MATKI_DODATKOWEGO as readonly string[]).includes(s.rodzaj) && s.dataZdarzenia <= ostatniDzienOsmegoTygodnia(ciaza.dataPorodu!),
    );

  const oznacz = (id: string) => {
    const wynik = oznaczZ15JakoPrzekazany(id, pobierzKontekstOperacji());
    if (wynik.ok && wynik.wartosc.dataPrzekazania) setPrzekazano(wynik.wartosc.dataPrzekazania);
  };

  return (
    <Karta tytul={t.tytul} bezLinii as="section">
      <p className="m-0 mb-4">{t.opis}</p>
      {szkic ? <p className="m-0 mb-4 text-body-strong">{t.szkic({ data: formatujDate(szkic.zaktualizowano) })}</p> : null}
      {wyslany?.potwierdzenie && wyslany.dataZlozenia ? (
        <p className="m-0 mb-4">{t.wyslany({ numer: wyslany.potwierdzenie, data: formatujDate(wyslany.dataZlozenia) })}</p>
      ) : null}
      {przygotowany?.dataPrzygotowania ? <p className="m-0 mb-4">{t.przygotowany({ data: formatujDate(przygotowany.dataPrzygotowania) })}</p> : null}
      {przekazano ? <Komunikat tresc={t.k0326({ data: formatujDate(przekazano) })} typ="SUCCESS" /> : null}
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <PrzyciskLink href={trasy.ViewZ15Start({ sprawa: sprawa.idSprawy })} wariant="glowny">
          {szkic ? t.dokoncz : t.akcja}
        </PrzyciskLink>
        {przygotowany ? (
          <Przycisk type="button" wariant="drugorzedny" onClick={() => oznacz(przygotowany.idWniosku)}>
            {t.oznaczPrzekazany}
          </Przycisk>
        ) : null}
        {dodatkowyDostepny ? (
          <PrzyciskLink href={trasy.ViewZ15Start({ sprawa: sprawa.idSprawy, sytuacja: 'dodatkowy-nowo-narodzone' })} wariant="drugorzedny">
            {t.dodatkowy}
          </PrzyciskLink>
        ) : null}
      </div>
    </Karta>
  );
}
