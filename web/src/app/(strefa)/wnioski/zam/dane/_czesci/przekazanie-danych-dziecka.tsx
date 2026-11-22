'use client';

// ViewZamData w trybie ?tryb=przekazanie-danych-dziecka (KA-21 3.9.1.3.1): potwierdzenie danych dziecka z profilu
// rodziny i przekazanie ich ZUS do wniosku złożonego przed porodem, potem ViewZamSent z komunikatem 0232.
import { useState } from 'react';
import { przekazDaneDzieckaZus } from '@/dane/magazyn/operacje/wnioski-zam';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import type { KodKomunikatu } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { DaneBoczne, KomunikatBleduZapisu, type DaneWnioskuZam } from '../../_czesci/kreator';

const t = teksty.ViewZamData;

function formatujDateLubPusto(data: string | null | undefined): string {
  return data ? formatujDate(data) : '';
}

export function PrzekazanieDanychDziecka({ dane }: { dane: DaneWnioskuZam }) {
  const { wniosek, kontekst } = dane;
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const ciaza = kontekst.rodzina.daneCiazy;
  const dzieci = ciaza?.dzieci ?? [];
  const kompletne = dzieci.length > 0 && dzieci.every((d) => d.imie && d.nazwisko && d.pesel);
  const dataPorodu = ciaza?.dataPorodu;

  const potwierdz = () => {
    ustawZajety(true);
    const wynik = przekazDaneDzieckaZus(wniosek.idWniosku, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      ustawBlad(wynik.kod);
      return;
    }
    przejdz(trasy.ViewZamSent({ wniosek: wniosek.idWniosku }));
  };

  return (
    <>
      <NaglowekStrony
        tytul={t.przekazanie.naglowek}
        powrot={{ href: trasy.ViewCaseGuide({ idSprawy: wniosek.idSprawy }), etykieta: t.przekazanie.powrot }}
      />
      <div className="flex max-w-240 flex-col gap-7.5">
        <KomunikatBleduZapisu kod={blad} />
        <Karta tytul={t.przekazanie.tytul} bezLinii>
          <p className="m-0 mb-6">{t.przekazanie.wstep}</p>
          {dzieci.map((d, i) => (
            <div key={d.pesel ?? i} className="mb-6">
              <p className="m-0 mb-3 text-body-strong">
                {dzieci.length > 1 ? t.dziecko.tytulNumer({ numer: i + 1 }) : t.dziecko.tytul}
              </p>
              <DaneBoczne
                pozycje={[
                  { etykieta: t.wnioskodawca.imieINazwisko, wartosc: `${d.imie ?? ''} ${d.nazwisko ?? ''}`.trim() },
                  { etykieta: t.dziecko.pesel, wartosc: d.pesel ?? '' },
                  { etykieta: t.dziecko.dataUrodzenia, wartosc: formatujDateLubPusto(d.dataUrodzenia ?? dataPorodu) },
                  { etykieta: t.dziecko.miejsceUrodzenia, wartosc: d.miejsceUrodzenia ?? '' },
                ]}
              />
            </div>
          ))}
          <DaneBoczne
            pozycje={[{ etykieta: t.przekazanie.liczbaDzieci, wartosc: String(ciaza?.liczbaUrodzonychDzieci ?? dzieci.length) }]}
          />
        </Karta>
        {kompletne ? (
          <div>
            <Przycisk type="button" wariant="glowny" onClick={potwierdz} zajety={zajety}>
              {t.przekazanie.potwierdz}
            </Przycisk>
          </div>
        ) : (
          <Komunikat
            kod="0231"
            tresc={t.przekazanie.brakDanych}
            akcje={
              <PrzyciskLink href={`${trasy.ViewProfileSummary({ tryb: 'rodzina' })}#dane-ciazy`} wariant="glowny">
                {t.przekazanie.uzupelnijProfil}
              </PrzyciskLink>
            }
          />
        )}
      </div>
    </>
  );
}
