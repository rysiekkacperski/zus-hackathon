'use client';

// Sekcja ViewCaseDetails „ostrzezenia-ryzyk” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u22.
// Ostrzeżenie sprawy K28 (0119) albo K29 (0120) z akcją otwarcia arkusza SheetRiskDetails (wzory cz2/P18-02, P18-06).
// Parametr ?arkusz=ryzyko otwiera arkusz przy wejściu na ekran. Na sprawie K08, a przy umowie o pracę matki bez K08
// w planie na sprawie K07, sekcja pokazuje ostrzeżenie strażnika
// o podwyższeniu podstawy wymiaru składek ze skutkiem: ZUS po postępowaniu może wydać decyzję ustalającą niższą
// podstawę wymiaru, od której policzy zasiłek macierzyński.
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArkuszRyzyka, KomunikatRyzyka, ostrzezenieDoPokazania } from '@/app/(strefa)/sprawy/[idSprawy]/_czesci/arkusz-ryzyka';
import { formatujKwote, formatujProcent } from '@/domena/kwoty';
import type { OstrzezenieSprawy } from '@/domena/typy';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const tekst = teksty.ViewCaseDetails.sekcjaOstrzezeniaRyzyk;

type OstrzezeniePodwyzszenia = Extract<OstrzezenieSprawy, { rodzaj: 'podwyzszenie-podstawy' }>;

function OstrzezeniePodwyzszeniaPodstawy({ ostrzezenie }: { ostrzezenie: OstrzezeniePodwyzszenia }) {
  return (
    <div className="flex max-w-tresc flex-col gap-4">
      <Komunikat
        typ="WARNING"
        tresc={tekst.podwyzszenie({ procent: formatujProcent(ostrzezenie.wzrostProcent) })}
        akcje={<Odnosnik href={trasy.ViewPregnancyBenefits()}>{tekst.zobaczRyzyka}</Odnosnik>}
      />
      <ListaDefinicji
        pozycje={[
          { etykieta: tekst.srednia, wartosc: formatujKwote(ostrzezenie.srednia), zrodlo: 'konto-zus' },
          { etykieta: tekst.ostatnia, wartosc: formatujKwote(ostrzezenie.ostatnia), zrodlo: 'konto-zus' },
          { etykieta: tekst.wzrost, wartosc: `${formatujKwote(ostrzezenie.wzrost)} (${formatujProcent(ostrzezenie.wzrostProcent)})` },
        ]}
      />
    </div>
  );
}

export function SekcjaOstrzezeniaRyzyk({ sprawa, kontekst, pochodzenie }: PropsSlotu<'sekcja'>) {
  const parametry = useSearchParams();
  const [otwarte, setOtwarte] = useState(() => parametry.get('arkusz') === 'ryzyko');
  const ostrzezenie = ostrzezenieDoPokazania(sprawa, kontekst);
  if (ostrzezenie === undefined) {
    const podwyzszenie = sprawa.idPozycji === 'K08' || sprawa.idPozycji === 'K07'
      ? sprawa.ostrzezenia.find((o): o is OstrzezeniePodwyzszenia => o.rodzaj === 'podwyzszenie-podstawy')
      : undefined;
    return podwyzszenie ? <OstrzezeniePodwyzszeniaPodstawy ostrzezenie={podwyzszenie} /> : null;
  }

  function zamknij() {
    setOtwarte(false);
    const adres = new URL(window.location.href);
    if (adres.searchParams.has('arkusz')) {
      adres.searchParams.delete('arkusz');
      window.history.replaceState(null, '', `${adres.pathname}${adres.search}${adres.hash}`);
    }
  }

  return (
    <>
      <KomunikatRyzyka
        ostrzezenie={ostrzezenie}
        className="max-w-tresc"
        akcje={
          <Przycisk type="button" wariant="drugorzedny" aria-haspopup="dialog" onClick={() => setOtwarte(true)}>
            {tekst.zobaczSzczegoly}
          </Przycisk>
        }
      />
      <ArkuszRyzyka
        otwarte={otwarte}
        onZamknij={zamknij}
        sprawa={sprawa}
        ostrzezenie={ostrzezenie}
        kontekst={kontekst}
        pochodzenie={pochodzenie}
      />
    </>
  );
}
