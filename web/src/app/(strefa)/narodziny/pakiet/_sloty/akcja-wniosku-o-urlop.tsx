'use client';

// Slot ViewBirthPackage „akcja-wniosku-o-urlop” w liście slotyPakietu (kontrakt, sekcja 12.4). Właściciel: u28.
// Akcja „Przygotuj wniosek o urlop” przy instrukcji K07 dla matki na umowie o pracę po porodzie.
// Teksty: teksty.ViewBirthPackage.akcjaWnioskuOUrlop.
import { czyWniosekOUrlop, idSprawyWniosku, otworzKreatorWnioskow, rodzicKontaWRodzinie } from '@/domena/wnioski/urlopy';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewBirthPackage.akcjaWnioskuOUrlop;

export function SlotAkcjaWnioskuOUrlop(props: PropsSlotu<'akcja'>) {
  const { kontekst } = props;
  const rodzic = rodzicKontaWRodzinie(kontekst.konto.pesel, kontekst.rola, kontekst.rodzina.daneRodziny);
  if (rodzic !== 'matka') return null;
  if (otworzKreatorWnioskow(kontekst.konto, kontekst.rodzina, 'K07').cel !== 'ViewLeaveRequestType') return null;
  const idSprawy = idSprawyWniosku(kontekst.rodzina.plan, 'K07', rodzic);
  const szkic = kontekst.rodzina.wnioski.find(
    (w) => czyWniosekOUrlop(w) && w.konto === kontekst.konto.pesel && w.idSprawy === idSprawy && w.stan !== 'wyslany',
  );
  if (szkic) {
    return (
      <PrzyciskLink href={sciezkaWidoku(szkic.ostatniEkran ?? 'ViewLeaveRequestType', { wniosek: szkic.idWniosku })} wariant="drugorzedny" szerokosc="pelna">
        {t.dokoncz}
      </PrzyciskLink>
    );
  }
  return (
    <PrzyciskLink href={trasy.ViewLeaveRequestType({ sprawa: idSprawy })} wariant="drugorzedny" szerokosc="pelna">
      {t.przygotuj}
    </PrzyciskLink>
  );
}
