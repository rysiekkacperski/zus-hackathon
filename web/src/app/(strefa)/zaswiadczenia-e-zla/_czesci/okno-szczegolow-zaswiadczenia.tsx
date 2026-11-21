'use client';

// ModalSickLeaveDetails (kontrakt, tabela 2.3; wzór P16-01): okno modalne na ViewSickLeaveList;
// gospodarz rejestru zaswiadczenia-e-zla/_sloty/index.ts. Właściciel: u14. Teksty: teksty.ModalSickLeaveDetails.
import { formatujDate } from '@/komponenty/format';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { Znaczek } from '@/komponenty/znaczek';
import type { KontoPrzewodnika, ZaswiadczenieEzla } from '@/domena/typy';
import { czyKodCiazy, liczbaDniZaswiadczenia, okresNiezdolnosci } from '@/domena/zasilki/okres-zasilkowy';
import { teksty } from '@/teksty';
import { slotyOknaZaswiadczenia } from '../_sloty';

export interface OknoSzczegolowZaswiadczeniaProps {
  otwarte: boolean;
  onZamknij: () => void;
  zaswiadczenie?: ZaswiadczenieEzla | null;
  konto?: KontoPrzewodnika | null;
}

const t = teksty.ModalSickLeaveDetails;

export function OknoSzczegolowZaswiadczenia({ otwarte, onZamknij, zaswiadczenie, konto }: OknoSzczegolowZaswiadczeniaProps) {
  if (!zaswiadczenie) return null;
  const ciaza = czyKodCiazy(zaswiadczenie);
  return (
    <OknoModalne
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={t.tytulZNumerem({ numer: zaswiadczenie.seriaINumer })}
      etykietaZamkniecia={t.zamknij}
      stopka={
        <div className="flex flex-wrap items-center gap-4">
          {konto
            ? slotyOknaZaswiadczenia.map(({ id, Komponent }) => (
                <Komponent key={id} zaswiadczenie={zaswiadczenie} konto={konto} />
              ))
            : null}
          <Przycisk wariant="drugorzedny" onClick={onZamknij}>
            {t.zamknij}
          </Przycisk>
        </div>
      }
    >
      <ListaDefinicji
        pozycje={[
          { etykieta: t.seriaINumer, wartosc: zaswiadczenie.seriaINumer },
          { etykieta: t.dataWystawienia, wartosc: formatujDate(zaswiadczenie.dataWystawienia) },
          { etykieta: t.okres, wartosc: okresNiezdolnosci(zaswiadczenie) },
          { etykieta: t.liczbaDni, wartosc: String(liczbaDniZaswiadczenia(zaswiadczenie)) },
          {
            etykieta: t.kod,
            wartosc: ciaza ? (
              <span className="inline-flex flex-wrap items-center gap-2">
                <span>B</span>
                <Znaczek>{teksty.ViewSickLeaveList.znaczekCiazy}</Znaczek>
                <span>{t.kodCiazy}</span>
              </span>
            ) : (
              teksty.ViewSickLeaveList.brakKodu
            ),
          },
          { etykieta: t.platnik, wartosc: zaswiadczenie.platnik },
          { etykieta: t.rodzaj, wartosc: teksty.ViewSickLeaveList.rodzaje[zaswiadczenie.rodzaj] },
        ]}
      />
    </OknoModalne>
  );
}
