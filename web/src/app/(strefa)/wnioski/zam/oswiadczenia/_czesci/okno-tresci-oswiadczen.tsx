'use client';

// ModalStatementsText (kontrakt, tabela 2.3): okno modalne na ViewZamStatements. Właściciel: u27.
// Treść zależy od okresów, wariantu, oświadczenia „Za życiem” i adresata wniosku (R11).
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { WniosekZam } from '@/domena/typy';
import { OknoModalne } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const t = teksty.ModalStatementsText;
const tk = teksty.ViewZamLeaveType.kreator;

export interface OknoTresciOswiadczenProps {
  otwarte: boolean;
  onZamknij: () => void;
  wniosek?: WniosekZam;
  zaZyciem?: boolean;
}

export function OknoTresciOswiadczen({ otwarte, onZamknij, wniosek, zaZyciem = false }: OknoTresciOswiadczenProps) {
  const rodzic = wniosek?.daneRodzica;
  const dzieci = wniosek?.daneDzieci ?? [];
  return (
    <OknoModalne
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={t.tytul}
      etykietaZamkniecia={t.zamknij}
      stopka={
        <div className="flex justify-end">
          <Przycisk type="button" wariant="glowny" onClick={onZamknij}>
            {t.zamknij}
          </Przycisk>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {rodzic ? (
          <p className="m-0">
            {t.wnioskodawca({ imieINazwisko: `${rodzic.imie} ${rodzic.nazwisko}`, pesel: rodzic.pesel ?? '' })}{' '}
            {dzieci
              .filter((d) => d.imie)
              .map((d) => t.dziecko({ imieINazwisko: `${d.imie} ${d.nazwisko}`, pesel: d.pesel ?? '' }))
              .join(' ')}
          </p>
        ) : null}
        <p className="m-0">{t.prawda}</p>
        {(wniosek?.okresy ?? []).map((o) => (
          <p key={`${o.rodzajUrlopu}-${o.od}`} className="m-0">
            {t.okres({
              rodzaj: tk.rodzajeUrlopuDopelniacz[o.rodzajUrlopu],
              od: formatujDate(o.od),
              do_: formatujDate(o.do),
              stawka: formatujProcent(o.stawka ?? 100),
            })}
          </p>
        ))}
        {zaZyciem ? <p className="m-0">{t.zaZyciem}</p> : null}
        <p className="m-0">{t.zmiany}</p>
        <p className="m-0">{t.odpowiedzialnosc}</p>
        {wniosek && !wniosek.przedPorodem ? (
          <p className="m-0">{wniosek.adresat === 'platnik-skladek' ? t.odpisPlatnik : t.odpisZus}</p>
        ) : null}
      </div>
    </OknoModalne>
  );
}
