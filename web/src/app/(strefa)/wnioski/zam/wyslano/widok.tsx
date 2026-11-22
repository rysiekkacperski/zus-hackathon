'use client';

// ViewZamSent (3.9.1.1.4): potwierdzenie wysłania wniosku ZAM do ZUS (0045) i sprawa w planie ze statusem złożona.
import { formatujDate, formatujDateICzas } from '@/domena/daty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { formatujRachunek } from '@/domena/walidacje';
import { ODNOSNIKI } from '@/dane/katalog/pozycje';
import { Karta } from '@/komponenty/karta';
import { KartaWiecejInformacji } from '@/komponenty/karta-wiecej-informacji';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { BrakWnioskuZam, DaneBoczne, nazwaRodzajuWniosku, opisZasilkuWniosku, useWniosekZam, type DaneWnioskuZam } from '../_czesci/kreator';
import { KomunikatRezygnacjiPoWyslaniuZam } from '../przejecie-urlopu/_czesci/komunikat-rezygnacji-po-zam';

const t = teksty.ViewZamSent;
const tk = teksty.ViewZamLeaveType.kreator;

function Potwierdzenie({ dane }: { dane: DaneWnioskuZam }) {
  const { wniosek, kontekst } = dane;
  const przekazanie = wniosek.przekazanieDanychDziecka;
  const zasilek = opisZasilkuWniosku(wniosek.okresy);
  const sprawa = kontekst.rodzina.plan?.pozycje.find((p) => p.idSprawy === wniosek.idSprawy);
  const idPozycji = sprawa?.idPozycji ?? wniosek.idSprawy;
  const tytulZKatalogu = tytulSprawy(kontekst.katalog, wniosek.idSprawy);
  const tytul = tytulZKatalogu && tytulZKatalogu !== wniosek.idSprawy ? tytulZKatalogu : t.sprawa.tytulDomyslny;

  const pozycje: { etykieta: string; wartosc: string }[] = [
    { etykieta: t.potwierdzenie.numer, wartosc: wniosek.potwierdzenie ?? '' },
    { etykieta: t.potwierdzenie.dataWyslania, wartosc: wniosek.dataZlozenia ? formatujDate(wniosek.dataZlozenia) : '' },
    { etykieta: t.potwierdzenie.adresat, wartosc: t.potwierdzenie.adresatZus },
    { etykieta: t.potwierdzenie.rodzajUrlopu, wartosc: nazwaRodzajuWniosku(wniosek) },
  ];
  if (zasilek) {
    pozycje.push({ etykieta: t.potwierdzenie.okres, wartosc: zasilek.okres }, { etykieta: t.potwierdzenie.zasilek, wartosc: zasilek.zasilek });
  }

  const tresc = (
    <div className="flex min-w-0 flex-col gap-7.5">
      {przekazanie ? (
        <Karta tytul={t.przekazanie.tytul} bezLinii>
          <DaneBoczne
            pozycje={[
              { etykieta: t.przekazanie.data, wartosc: formatujDateICzas(przekazanie.czas) },
              ...przekazanie.dane.map((d, i) => ({
                etykieta: `${t.przekazanie.dziecko} ${przekazanie.dane.length > 1 ? i + 1 : ''}`.trim(),
                wartosc: [`${d.imie} ${d.nazwisko}`, d.pesel, d.dataUrodzenia ? formatujDate(d.dataUrodzenia) : null, d.miejsceUrodzenia]
                  .filter(Boolean)
                  .join(', '),
              })),
              { etykieta: t.przekazanie.liczbaDzieci, wartosc: String(przekazanie.liczbaUrodzonychDzieci) },
            ]}
          />
        </Karta>
      ) : null}
      <Karta tytul={t.potwierdzenie.tytul} bezLinii>
        <DaneBoczne pozycje={pozycje} />
      </Karta>
      <Karta tytul={t.sprawa.tytul} bezLinii>
        <p className="m-0 text-body-strong">{t.sprawa.nazwa({ id: idPozycji, tytul })}</p>
        <p className="m-0 mt-2">{t.sprawa.status}</p>
        <div className="mt-6">
          <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
            {t.sprawa.przejdzDoPlanu}
          </PrzyciskLink>
        </div>
      </Karta>
    </div>
  );

  const boczna = (
    <>
      <Karta tytul={t.coDalej.tytul} bezLinii>
        {wniosek.numerRachunku ? (
          <>
            <p className="m-0">{t.coDalej.wyplata}</p>
            <p className="m-0 mb-4 text-body-strong">{formatujRachunek(wniosek.numerRachunku)}</p>
          </>
        ) : null}
        <p className="m-0">{t.coDalej.numer}</p>
      </Karta>
      <KartaWiecejInformacji odnosniki={[ODNOSNIKI.zus, ODNOSNIKI.mrpips]} />
    </>
  );

  return (
    <>
      <NaglowekStrony
        tytul={przekazanie ? t.przekazanie.naglowek : t.naglowek}
        powrot={{ href: trasy.ViewFamilyPlan(), etykieta: t.powrot }}
      />
      <div className="flex flex-col gap-7.5">
        <Komunikat kod={przekazanie ? '0232' : '0045'} />
        <KomunikatRezygnacjiPoWyslaniuZam wniosek={wniosek} rodzina={kontekst.rodzina} />
        <UkladDwuKolumnowy tresc={tresc} boczna={boczna} etykietaBocznej={tk.etykietaBocznej} />
      </div>
    </>
  );
}

export function WidokWyslanegoZam() {
  const { dane } = useWniosekZam();
  if (dane === null) return <BrakWnioskuZam ekran="ViewZamSent" />;
  if (dane.wniosek.stan === 'szkic') return <SzkieletWidoku />;
  return <Potwierdzenie key={dane.wniosek.idWniosku} dane={dane} />;
}
