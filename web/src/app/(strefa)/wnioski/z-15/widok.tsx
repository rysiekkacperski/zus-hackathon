'use client';

// ViewZ15Start (P): wejście do kreatora Z-15. Sprawdza zgodę na dane dotyczące zdrowia (0004) i ubezpieczenie
// chorobowe (0298), a przy dostępie zakłada albo wznawia szkic i przechodzi na ostatni wyświetlony ekran.
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KodKomunikatu, SytuacjaOpiekiZ15 } from '@/domena/typy';
import { sprawdzDostepZ15 } from '@/domena/wnioski/z15';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { rozpocznijLubWznowZ15 } from '@/dane/magazyn/operacje/wnioski-z15';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { teksty } from '@/teksty';
import { adresEkranuZ15, NaglowekKreatoraZ15 } from './_czesci/kreator';

const t = teksty.ViewZ15Start;

export function WidokStartuZ15() {
  const kontekst = useKontekstRodziny();
  const parametry = useSearchParams();
  const { przejdz } = useNawigacjaZLadowaniem();
  const [bladStartu, setBladStartu] = useState<KodKomunikatu | null>(null);
  const uruchomiono = useRef(false);
  const dostep = useMemo(
    () => (kontekst ? sprawdzDostepZ15({ stanZgody: kontekst.stanZgody, kopia: kontekst.daneZusKonta, dzis: kontekst.dzis }) : null),
    [kontekst],
  );
  const idSprawy = parametry.get('sprawa') ?? 'K22';
  const sytuacja = (parametry.get('sytuacja') ?? undefined) as SytuacjaOpiekiZ15 | undefined;

  useEffect(() => {
    if (!dostep?.dozwolony || uruchomiono.current) return;
    uruchomiono.current = true;
    const wynik = rozpocznijLubWznowZ15({ idSprawy, sytuacja }, pobierzKontekstOperacji());
    if (!wynik.ok) {
      queueMicrotask(() => setBladStartu(wynik.kod));
      return;
    }
    przejdz(adresEkranuZ15(sytuacja ? 'ViewZ15Situation' : (wynik.wartosc.ostatniEkran ?? 'ViewZ15Situation'), wynik.wartosc.idWniosku), { zastap: true });
  }, [dostep, idSprawy, sytuacja, przejdz]);

  if (!kontekst || !dostep) return <SzkieletWidoku />;

  if (dostep.dozwolony) {
    return (
      <>
        <NaglowekKreatoraZ15 />
        {bladStartu ? <Komunikat kod={bladStartu} /> : <p role="status">{t.otwieranie}</p>}
      </>
    );
  }

  return (
    <>
      <NaglowekKreatoraZ15 />
      <Karta tytul={t.kartaBlokady} bezLinii as="section">
        <div className="flex max-w-3xl flex-col gap-4">
          {dostep.kod === '0004' ? (
            <>
              <Komunikat kod="0004" typ="WARNING" />
              <p className="m-0">{t.opis0004}</p>
              <div>
                <PrzyciskLink href={trasy.ViewGuideSettings()} wariant="glowny">
                  {t.akcja0004}
                </PrzyciskLink>
              </div>
            </>
          ) : (
            <>
              <Komunikat kod="0298" typ="INFO" />
              <div>
                <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
                  {t.akcja0298}
                </PrzyciskLink>
              </div>
            </>
          )}
        </div>
      </Karta>
    </>
  );
}
