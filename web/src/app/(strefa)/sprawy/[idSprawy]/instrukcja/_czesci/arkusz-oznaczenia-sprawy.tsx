'use client';

// SheetCaseDoneConfirm (kontrakt, tabela 2.3): arkusz na ViewCaseGuide, otwierany automatycznie po powrocie z kanału. Właściciel: u17.
// Wzory: cz1/P08-03 (świadczenie, złożona) i cz1/P08-11 (obowiązek, załatwiona).
import { Arkusz } from '@/komponenty/okno';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import type { KanalProdukcyjny } from '@/dane/parametry-produkcyjne';
import type { RodzajPozycji } from '@/domena/typy';
import { teksty } from '@/teksty';

export interface ArkuszOznaczeniaSprawyProps {
  otwarte: boolean;
  onZamknij: () => void;
  // Rodzaj sprawy decyduje o oznaczeniu: świadczenie jako złożone, pozostałe jako załatwione.
  rodzaj?: RodzajPozycji;
  // Kanał, z którego wraca rodzic, i termin sprawy w formacie DD.MM.RRRR.
  kanal?: KanalProdukcyjny;
  termin?: string | null;
  onPotwierdz?: () => void;
  zajety?: boolean;
}

export function ArkuszOznaczeniaSprawy({
  otwarte,
  onZamknij,
  rodzaj = 'obowiazek',
  kanal = 'ezus',
  termin = null,
  onPotwierdz,
  zajety = false,
}: ArkuszOznaczeniaSprawyProps) {
  const t = teksty.SheetCaseDoneConfirm;
  const swiadczenie = rodzaj === 'swiadczenie';
  const zKanalu = t.zKanalu[kanal];
  const opis = swiadczenie
    ? termin
      ? t.opisSwiadczenie({ zKanalu, termin })
      : t.opisSwiadczenieBezTerminu({ zKanalu })
    : t.opisPozostale({ zKanalu });

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={swiadczenie ? t.tytulSwiadczenie : t.tytul}
      opis={opis}
      stopka={
        <>
          <Przycisk wariant="glowny" onClick={onPotwierdz} zajety={zajety}>
            {swiadczenie ? t.potwierdzZlozona : t.potwierdzZalatwiona}
          </Przycisk>
          <Przycisk wariant="drugorzedny" onClick={onZamknij} disabled={zajety}>
            {t.zostaw}
          </Przycisk>
        </>
      }
    >
      <Notatka>{t.notatka}</Notatka>
    </Arkusz>
  );
}
