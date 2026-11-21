'use client';

// Sekcja ViewCaseGuide „akcja-wniosku-o-urlop” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u28.
// Akcja „Przygotuj wniosek o urlop” albo „Dokończ wniosek o urlop” przy sprawach K07, K09, K10, K11, K31 i K37
// rodzica na umowie o pracę. Teksty: teksty.ViewCaseGuide.sekcjaAkcjaWnioskuOUrlop.
import { formatujDate } from '@/domena/daty';
import { czyWniosekOUrlop, otworzKreatorWnioskow } from '@/domena/wnioski/urlopy';
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaWnioskuOUrlop;
const SPRAWY = ['K07', 'K09', 'K10', 'K11', 'K31', 'K37'];

export function SekcjaAkcjaWnioskuOUrlop(props: PropsSlotu<'akcja'>) {
  const { sprawa, kontekst } = props;
  const idPozycji = sprawa.idPozycji ?? sprawa.idSprawy.slice(0, 3);
  if (!SPRAWY.includes(idPozycji)) return null;
  if (otworzKreatorWnioskow(kontekst.konto, kontekst.rodzina, sprawa.idSprawy).cel !== 'ViewLeaveRequestType') return null;
  const wnioski = kontekst.rodzina.wnioski
    .filter(czyWniosekOUrlop)
    .filter((w) => w.konto === kontekst.konto.pesel && w.idSprawy === sprawa.idSprawy);
  const otwarty = wnioski.find((w) => w.stan === 'szkic' || w.stan === 'przygotowany');
  const wyslany = wnioski.find((w) => w.stan === 'wyslany');
  return (
    <Karta tytul={t.tytul} bezLinii as="section">
      {otwarty ? (
        <>
          <p className="m-0 mb-4">
            {otwarty.stan === 'przygotowany'
              ? t.przygotowany({ data: formatujDate(otwarty.dataPrzygotowania ?? otwarty.zaktualizowano) })
              : t.szkic({ data: formatujDate(otwarty.zaktualizowano) })}
          </p>
          <PrzyciskLink
            href={sciezkaWidoku(otwarty.ostatniEkran ?? 'ViewLeaveRequestType', { wniosek: otwarty.idWniosku })}
            wariant="glowny"
          >
            {t.dokoncz}
          </PrzyciskLink>
        </>
      ) : (
        <>
          <p className="m-0 mb-4">
            {wyslany?.dataZlozenia ? `${t.wyslany({ data: formatujDate(wyslany.dataZlozenia) })} ` : ''}
            {t.opis}
          </p>
          <PrzyciskLink href={trasy.ViewLeaveRequestType({ sprawa: sprawa.idSprawy })} wariant="glowny">
            {t.przygotuj}
          </PrzyciskLink>
        </>
      )}
    </Karta>
  );
}
