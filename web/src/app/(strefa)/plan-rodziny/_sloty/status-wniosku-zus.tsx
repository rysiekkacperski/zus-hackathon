'use client';

// Slot ViewFamilyPlan „status-wniosku-zus” w liście slotyPrzySprawie (kontrakt, sekcja 12.4; wzory P15-01…P15-03).
// Właściciel: u14. Teksty: teksty.ViewFamilyPlan.statusWnioskuZus. Kolumna „Wniosek w ZUS i wypłata”.
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { OdnosnikZewnetrzny } from '@/komponenty/odnosnik';
import { trasy } from '@/komponenty/rama/trasy';
import { Znaczek } from '@/komponenty/znaczek';
import { teksty } from '@/teksty';
import { useSprawaZus } from '../../sprawy/[idSprawy]/_sekcje/status-wniosku-zus';
import type { PropsSlotu } from './typy';

const t = teksty.ViewFamilyPlan.statusWnioskuZus;
const tk = teksty.ViewCaseDetails.sekcjaStatusWnioskuZus;

export function SlotStatusWnioskuZus({ sprawa, kontekst }: PropsSlotu<'przySprawie'>) {
  const zus = useSprawaZus(sprawa, kontekst);
  if (!zus) return null;
  const { wniosek, wyplaty, odmowa } = zus;

  if (sprawa.oznaczenia.includes('nowa-w-planie') && !wniosek) {
    return <p className="m-0 text-small">{t.nowaSprawa}</p>;
  }
  if (!wniosek || sprawa.zrodloStatusu !== 'dane-zus') {
    return sprawa.status === 'zlozona' ? <p className="m-0 text-small">{t.brakWniosku}</p> : null;
  }
  const data = formatujDate(wniosek.dataZlozenia);

  if (odmowa) {
    return (
      <div className="flex flex-col items-start gap-2 text-small">
        <Znaczek>{t.odmowa}</Znaczek>
        <p className="m-0">{t.odmowaOpis({ data })}</p>
        <OdnosnikZewnetrzny href={trasy.ViewEzusApplicationDetails({ idWniosku: wniosek.idWniosku })}>
          {t.zobaczOdpowiedz}
        </OdnosnikZewnetrzny>
      </div>
    );
  }
  if (sprawa.status === 'zalatwiona') {
    const najblizsza = wyplaty.planowane[0];
    return (
      <div className="flex flex-col gap-1 text-small">
        <p className="m-0">{t.przyznane({ data })}</p>
        {najblizsza ? (
          <p className="m-0">
            {t.najblizszaWyplata({ kwota: formatujKwote(najblizsza.kwota), data: formatujDate(najblizsza.planowanyTerminWyplaty) })}
          </p>
        ) : null}
      </div>
    );
  }
  const ostatnia = wyplaty.wyplacone[0];
  return (
    <div className="flex flex-col gap-1 text-small">
      {ostatnia ? (
        <p className="m-0">{t.ostatniaWyplata({ kwota: formatujKwote(ostatnia.kwota), data: formatujDate(ostatnia.dataWyplaty) })}</p>
      ) : (
        <p className="m-0">
          {t.wniosekZKanalem({ data, kanal: tk.kanaly[wniosek.kanal], status: tk.statusy[wniosek.status].toLowerCase() })}
        </p>
      )}
      {wniosek.planowyTerminZalatwienia && !ostatnia ? (
        <p className="m-0">{t.planowyTermin({ data: formatujDate(wniosek.planowyTerminZalatwienia) })}</p>
      ) : null}
    </div>
  );
}
