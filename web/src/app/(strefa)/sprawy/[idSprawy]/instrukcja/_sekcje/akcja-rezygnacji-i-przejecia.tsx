'use client';

// Sekcja ViewCaseGuide „akcja-rezygnacji-i-przejecia” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u34.
// K07 i K08: akcja rezygnacji matki z dalszej części urlopu macierzyńskiego (wzór cz2/P25-01).
// K09 i K10: informacja o możliwości przejęcia i akcja przejęcia urlopu przez drugiego rodzica (wzór cz2/P25-13).
import { useMemo } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { formatujDate } from '@/komponenty/format';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { czyObjetyChorobowym, szkicWniosku, terminWnioskuOjca, urlopMacierzynski, dniPrzedPorodemZWnioskow, wyslanaRezygnacja } from '@/domena/wnioski/rezygnacja';
import type { WniosekOUrlop } from '@/domena/typy';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaRezygnacjiIPrzejecia;
const SPRAWY_MATKI = ['K07', 'K08'];
const SPRAWY_DRUGIEGO_RODZICA = ['K09', 'K10'];

/** Adres wznowienia szkicu na ostatnim wyświetlonym ekranie albo adres startowy. */
function adresSzkicu(szkic: WniosekOUrlop | null, startowy: string): string {
  if (!szkic) return startowy;
  if (szkic.ostatniEkran && szkic.ostatniEkran !== 'ViewMaternityResignation' && szkic.ostatniEkran !== 'ViewFatherTakeover') {
    return sciezkaWidoku(szkic.ostatniEkran, { wniosek: szkic.idWniosku });
  }
  return `${startowy}${startowy.includes('?') ? '&' : '?'}wniosek=${encodeURIComponent(szkic.idWniosku)}`;
}

export function SekcjaAkcjaRezygnacjiIPrzejecia({ sprawa, kontekst }: PropsSlotu<'akcja'>) {
  const id = sprawa.idPozycji ?? '';
  const { rodzina, konto, katalog } = kontekst;
  const dane = useMemo(() => {
    const dataPorodu = rodzina.daneCiazy?.dataPorodu;
    if (!dataPorodu) return null;
    const urlop = urlopMacierzynski(
      katalog,
      dataPorodu,
      rodzina.daneCiazy?.liczbaUrodzonychDzieci ?? 1,
      dniPrzedPorodemZWnioskow(rodzina.wnioski, dataPorodu),
    );
    return { urlop, osoby: osobyRodziny(rodzina.daneRodziny), rezygnacja: wyslanaRezygnacja(rodzina.wnioski) };
  }, [rodzina, katalog]);
  if (!dane) return null;

  const { urlop, osoby, rezygnacja } = dane;
  const czyMatka = SPRAWY_MATKI.includes(id) && (osoby.peselMatki ?? osoby.peselRodzica) === konto.pesel;
  const czyDrugiRodzic = SPRAWY_DRUGIEGO_RODZICA.includes(id) && osoby.peselDrugiegoRodzica === konto.pesel;

  if (czyMatka) {
    if (rezygnacja) return null;
    const forma = rodzina.daneRodziny.matka.formaZatrudnienia?.wartosc;
    const zasilek = forma === 'umowa-zlecenia' || forma === 'jdg';
    const szkic = szkicWniosku(rodzina.wnioski, 'rezygnacja-z-czesci-zasilku', konto.pesel);
    const href = adresSzkicu(szkic, trasy.ViewMaternityResignation({ sprawa: sprawa.idSprawy }));
    return (
      <Karta tytul={t.tytulRezygnacji} bezLinii>
        <p className="m-0 mb-6">
          {zasilek ? t.opisRezygnacjiZasilku : t.opisRezygnacji({ data: formatujDate(urlop.po14Tygodniach) })}
        </p>
        <PrzyciskLink href={href} wariant="drugorzedny">
          {szkic ? t.akcjaWznowieniaRezygnacji : t.akcjaRezygnacji}
        </PrzyciskLink>
      </Karta>
    );
  }

  if (!czyDrugiRodzic) return null;
  const drugi = rodzina.daneRodziny.drugiRodzic;
  const forma = drugi.formaZatrudnienia?.wartosc;
  const pracownik = forma === 'umowa-o-prace';
  const szkic = szkicWniosku(rodzina.wnioski, 'wniosek-ojca-o-urlop', konto.pesel);
  const href = adresSzkicu(szkic, trasy.ViewFatherTakeover({ sprawa: sprawa.idSprawy }));
  const powrot = rezygnacja?.rezygnacja?.dataPowrotu;
  const koniec = rezygnacja?.okresy[0]?.do ?? urlop.okres.do;
  const imieMatki = rezygnacja?.daneRodzica?.imie ?? kontekst.daneZusMatki?.imie ?? '';
  const p = teksty.PowiadomieniaPrzejecieUrlopu;

  return (
    <>
      {powrot ? (
        <Komunikat
          typ="INFO"
          tresc={t.informacjaPrzejecia({
            temat: p.temat,
            tresc: p.tresc({
              imieMatki,
              dataPowrotu: formatujDate(powrot),
              dataPoczatku: formatujDate(powrot),
              dataKonca: formatujDate(koniec),
              terminZlozeniaWniosku: formatujDate(terminWnioskuOjca(powrot)),
            }),
          })}
        />
      ) : null}
      <Karta tytul={t.tytulPrzejecia} bezLinii>
        <p className="m-0 mb-6">
          {pracownik || !czyObjetyChorobowym(forma, drugi.dobrowolneChorobowe?.wartosc) ? t.opisPrzejecia : t.opisPrzejeciaZam}
        </p>
        <PrzyciskLink href={href} wariant="drugorzedny">
          {szkic ? t.akcjaWznowieniaPrzejecia : t.akcjaPrzejecia}
        </PrzyciskLink>
      </Karta>
    </>
  );
}
