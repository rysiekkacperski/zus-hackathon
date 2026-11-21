'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import type { KodKomunikatu, StanRodziny, WniosekZam } from '@/domena/typy';
import { nazwaPlikuDlaPlatnika } from '@/domena/wnioski/zam-przed-porodem';
import { useKonto } from '@/dane/magazyn/hooki';
import { przygotujZamDlaPlatnika } from '@/dane/magazyn/operacje/wnioski-zam-rozszerzenia';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';

const t = teksty.ViewZamForPayer.podsumowanie;

/** Wniosek trafia do płatnika składek, gdy profil rodziny wskazuje płatnika składek jako płatnika zasiłku. */
export function czyZamDlaPlatnika(rodzina: StanRodziny | null, wniosek: WniosekZam): boolean {
  if (rodzina === null) return false;
  const rodzic = wniosek.rola === 'drugi-rodzic' ? rodzina.daneRodziny.drugiRodzic : rodzina.daneRodziny.matka;
  return rodzic.platnikZasilku?.wartosc === 'platnik-skladek';
}

/**
 * Sekcja adresata ViewZamSummary dla płatnika składek (wzór P11-19): adresat, informacja o skróconym
 * odpisie aktu urodzenia albo, przed porodem, o zaświadczeniu lekarskim.
 */
export function SekcjaAdresataPlatnika({ rodzina, wniosek }: { rodzina: StanRodziny | null; wniosek: WniosekZam }) {
  const rodzic = wniosek.rola === 'drugi-rodzic' ? rodzina?.daneRodziny.drugiRodzic : rodzina?.daneRodziny.matka;
  const nazwa = rodzic?.platnikZasilku?.nazwaPlatnika;
  return (
    <Karta tytul={t.tytulAdresata} bezLinii>
      <p className="m-0 text-body-strong">{nazwa ? t.adresat({ nazwa }) : t.adresatBezNazwy}</p>
      <p className="m-0 mt-2">{wniosek.przedPorodem ? t.informacjaPrzedPorodem : t.informacjaOOdpisie}</p>
    </Karta>
  );
}

/**
 * Akcja „Przygotuj wniosek” na ViewZamSummary dla płatnika składek: przygotowuje wniosek bez wysyłki
 * do ZUS, nadaje sprawie oznaczenie „wniosek przygotowany” i prowadzi do ViewZamForPayer.
 */
export function AkcjaPrzygotowaniaDlaPlatnika({ wniosek }: { wniosek: WniosekZam }) {
  const router = useRouter();
  const konto = useKonto();
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  function przygotuj() {
    if (zajety) return;
    ustawZajety(true);
    const imie = wniosek.daneRodzica?.imie ?? konto?.imie ?? '';
    const nazwisko = wniosek.daneRodzica?.nazwisko ?? konto?.nazwisko ?? '';
    const wynik = przygotujZamDlaPlatnika(wniosek.idWniosku, pobierzKontekstOperacji(), nazwaPlikuDlaPlatnika(wniosek, imie, nazwisko));
    ustawZajety(false);
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return;
    }
    router.push(trasy.ViewZamForPayer({ wniosek: wniosek.idWniosku }));
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {blad ? <Komunikat kod={blad} /> : null}
      <div>
        <Przycisk type="button" wariant="glowny" onClick={przygotuj} zajety={zajety}>
          {t.przygotuj}
        </Przycisk>
      </div>
    </div>
  );
}
