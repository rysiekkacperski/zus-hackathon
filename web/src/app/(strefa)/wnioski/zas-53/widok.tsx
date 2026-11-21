'use client';

// ViewZas53Start (P): wejście do kreatora ZAS-53. Sprawdza zgodę i zakres wnioskodawcy (0004, 0233, 0083),
// a przy dostępie zakłada albo wznawia szkic i przechodzi na ostatni wyświetlony ekran.
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatujDate } from '@/domena/daty';
import type { KodKomunikatu, TytulUbezpieczenia } from '@/domena/typy';
import { sprawdzDostepZas53 } from '@/domena/wnioski/zas53';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { rozpocznijLubWznowZas53 } from '@/dane/magazyn/operacje/wnioski-zas53';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { adresEkranuZas53, NaglowekKreatoraZas53 } from './_czesci/kreator';
import { teksty } from '@/teksty';

const t = teksty.ViewZas53Start;

export function opisChorobowego(tytul: TytulUbezpieczenia | undefined, dzisTrwa: boolean): string {
  if (!tytul || tytul.ubezpieczenieChorobowe.rodzaj === 'brak') return t.chorobowe0083;
  const rodzaj = t.rodzajeChorobowego[tytul.ubezpieczenieChorobowe.rodzaj];
  const od = tytul.ubezpieczenieChorobowe.od ?? tytul.od;
  return dzisTrwa ? t.chorobowetrwa({ rodzaj }) : t.chorobowe({ rodzaj, od: formatujDate(od) });
}

export function WidokStartuZas53() {
  const kontekst = useKontekstRodziny();
  const parametry = useSearchParams();
  const router = useRouter();
  const [bladStartu, setBladStartu] = useState<KodKomunikatu | null>(null);
  const uruchomiono = useRef(false);

  const dostep = useMemo(
    () => (kontekst ? sprawdzDostepZas53({ stanZgody: kontekst.stanZgody, kopia: kontekst.daneZusKonta, dzis: kontekst.dzis }) : null),
    [kontekst],
  );
  const seriaINumer = parametry.get('zaswiadczenie') ?? undefined;
  const idSprawy = parametry.get('sprawa') ?? 'K24';

  useEffect(() => {
    if (!dostep?.dozwolony || uruchomiono.current) return;
    uruchomiono.current = true;
    const wynik = rozpocznijLubWznowZas53({ idSprawy, seriaINumer }, pobierzKontekstOperacji());
    if (!wynik.ok) {
      queueMicrotask(() => setBladStartu(wynik.kod));
      return;
    }
    const ekran = seriaINumer ? 'ViewZas53Certificate' : (wynik.wartosc.ostatniEkran ?? 'ViewZas53Certificate');
    router.replace(adresEkranuZas53(ekran, wynik.wartosc.idWniosku));
  }, [dostep, idSprawy, seriaINumer, router]);

  if (!kontekst || !dostep) return <SzkieletWidoku />;

  if (dostep.dozwolony) {
    return (
      <>
        <NaglowekKreatoraZas53 />
        {bladStartu ? <Komunikat kod={bladStartu} /> : <p role="status">{t.otwieranie}</p>}
      </>
    );
  }

  const akcja =
    dostep.kod === '0233' ? (
      <PrzyciskLink href={trasy.ViewCaseGuide({ idSprawy })} wariant="glowny">
        {t.akcja0233}
      </PrzyciskLink>
    ) : dostep.kod === '0083' ? (
      <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
        {t.akcja0083}
      </PrzyciskLink>
    ) : (
      <PrzyciskLink href={trasy.ViewGuideSettings()} wariant="glowny">
        {t.akcja0004}
      </PrzyciskLink>
    );
  const opis = dostep.kod === '0233' ? t.opis0233 : dostep.kod === '0083' ? t.opis0083 : t.opis0004;
  const tytul = dostep.tytul;

  return (
    <>
      <NaglowekKreatoraZas53 />
      <UkladDwuKolumnowy
        tresc={
          <Karta tytul={t.kartaBlokady} bezLinii as="section">
            <div className="flex flex-col gap-4">
              <Komunikat kod={dostep.kod} typ={dostep.kod === '0004' ? 'WARNING' : undefined} />
              <p className="m-0">{opis}</p>
              <div>{akcja}</div>
            </div>
          </Karta>
        }
        boczna={
          dostep.kod === '0004' ? undefined : (
            <Karta tytul={t.kartaUbezpieczenia} bezLinii as="section">
              <p className="m-0 mb-4 text-body-strong">{teksty.ViewZas53Certificate.stanNa({ data: formatujDate(kontekst.dzis) })}</p>
              <ListaDefinicji
                szerokoscEtykiety="waska"
                pozycje={[
                  { etykieta: t.tytulUbezpieczenia, wartosc: tytul ? t.rodzajeTytulu[tytul.rodzaj] : t.brakTytulu },
                  { etykieta: t.ubezpieczenieChorobowe, wartosc: opisChorobowego(tytul, dostep.kod === '0233') },
                  ...(tytul ? [{ etykieta: t.platnikSkladek, wartosc: tytul.platnik.nazwa }] : []),
                ]}
              />
            </Karta>
          )
        }
        etykietaBocznej={t.kartaUbezpieczenia}
      />
    </>
  );
}
