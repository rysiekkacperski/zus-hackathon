'use client';

// ViewZ15ForPayer: wniosek Z-15 przygotowany dla płatnika składek (0323), lista rzeczy do przekazania, wydruk wniosku
// do podpisu i oznaczenie wniosku jako przekazanego płatnikowi (0326).
import { useState } from 'react';
import { formatujDate } from '@/domena/daty';
import { zalacznikiZ15 } from '@/domena/wnioski/z15';
import { oznaczZ15JakoPrzekazany } from '@/dane/magazyn/operacje/wnioski-z15';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { BrakWnioskuZ15, NaglowekKreatoraZ15, useWniosekZ15 } from '../_czesci/kreator';

const t = teksty.ViewZ15ForPayer;

export function WidokDlaPlatnikaZ15() {
  const k = useWniosekZ15();
  const [przekazano, setPrzekazano] = useState<string | null>(null);
  if (!k || k.wniosek.stan === 'szkic') return <BrakWnioskuZ15 />;
  const { wniosek } = k;
  const platnik = wniosek.platnik?.nazwa ?? '';
  const dokumenty = zalacznikiZ15(wniosek);
  const data = przekazano ?? wniosek.dataPrzekazania ?? null;
  const oznacz = () => {
    const wynik = oznaczZ15JakoPrzekazany(wniosek.idWniosku, pobierzKontekstOperacji());
    if (wynik.ok && wynik.wartosc.dataPrzekazania) setPrzekazano(wynik.wartosc.dataPrzekazania);
  };
  return (
    <>
      <NaglowekKreatoraZ15 />
      <Karta tytul={t.naglowek} bezLinii as="section">
        <Stos odstep={4} className="max-w-3xl">
          <Komunikat tresc={t.k0323({ platnik })} typ="INFO" />
          <h2 className="m-0 text-body-strong">{t.doPrzekazania}</h2>
          <ul className="m-0 flex flex-col gap-2 pl-6">
            <li>{t.podpisanyWniosek}</li>
            {dokumenty.map((d) => (
              <li key={d.id}>{teksty.ViewZ15Summary.zalaczniki[d.rodzaj] ?? d.rodzaj}</li>
            ))}
          </ul>
          {data ? <Komunikat tresc={teksty.ViewZ15Start.sekcjaSprawy.k0326({ data: formatujDate(data) })} typ="SUCCESS" /> : null}
          <div className="flex flex-wrap gap-4">
            <Przycisk type="button" wariant="drugorzedny" onClick={() => window.print()}>
              {t.drukuj}
            </Przycisk>
            {data ? null : (
              <Przycisk type="button" wariant="glowny" onClick={oznacz}>
                {t.oznacz}
              </Przycisk>
            )}
            <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
              {t.doPlanu}
            </PrzyciskLink>
          </div>
        </Stos>
      </Karta>
    </>
  );
}
