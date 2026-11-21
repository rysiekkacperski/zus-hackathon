'use client';

// Sekcja ViewCaseGuide „akcja-wniosku-zam” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u27.
// Start wniosku ZAM („Wypełnij wniosek”), powrót do szkicu i potwierdzenie wysłanego wniosku dla spraw K08
// (matka) oraz K09 i K10 (drugi rodzic z JDG albo umową zlecenia z dobrowolnym ubezpieczeniem chorobowym).
// Teksty: teksty.ViewCaseGuide.sekcjaAkcjaWnioskuZam.
import { dataZeZnacznika, formatujDate } from '@/domena/daty';
import type { WniosekZam } from '@/domena/typy';
import { daneRodzicaWniosku, rodzicKontaWRodzinie } from '@/domena/wnioski/zam';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaWnioskuZam;

export function SekcjaAkcjaWnioskuZam({ sprawa, kontekst }: PropsSlotu<'akcja'>) {
  const { konto, rodzina } = kontekst;
  const rodzic = rodzicKontaWRodzinie(konto, rodzina);
  const idPozycji = sprawa.idPozycji;
  if (idPozycji === 'K08') {
    if (rodzic !== 'matka') return null;
  } else if (idPozycji === 'K09' || idPozycji === 'K10') {
    if (rodzic !== 'drugi-rodzic') return null;
    const d = daneRodzicaWniosku(rodzina, 'drugi-rodzic');
    if ((d.forma !== 'jdg' && d.forma !== 'umowa-zlecenia') || d.dobrowolneChorobowe?.wartosc !== true) return null;
  } else {
    return null;
  }

  const wnioski = rodzina.wnioski.filter(
    (w): w is WniosekZam => w.rodzaj === 'zam' && w.idSprawy === sprawa.idSprawy && w.konto === konto.pesel,
  );
  const szkic = wnioski.find((w) => w.stan === 'szkic');
  const wyslany = wnioski.find((w) => w.stan === 'wyslany' || w.stan === 'zlozony');

  if (wyslany && !szkic) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0">
          {t.wyslany({ data: wyslany.dataZlozenia ? formatujDate(wyslany.dataZlozenia) : '', numer: wyslany.potwierdzenie ?? '' })}
        </p>
        <div>
          <Odnosnik href={trasy.ViewZamSent({ wniosek: wyslany.idWniosku })}>{t.zobaczPotwierdzenie}</Odnosnik>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <PrzyciskLink href={trasy.ViewZamLeaveType({ sprawa: sprawa.idSprawy })} wariant="glowny">
          {szkic ? t.wrocDoWniosku : t.wypelnij}
        </PrzyciskLink>
      </div>
      <p className="m-0 text-small">
        {szkic ? t.szkic({ data: formatujDate(dataZeZnacznika(szkic.zaktualizowano)) }) : t.opis}
      </p>
    </div>
  );
}
