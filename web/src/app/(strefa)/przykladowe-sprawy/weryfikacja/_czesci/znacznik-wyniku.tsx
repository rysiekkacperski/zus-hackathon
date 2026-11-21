import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import type { WynikWeryfikacjiSprawy } from '@/domena/typy';
import { teksty } from '@/teksty';

type WynikWarunku = WynikWeryfikacjiSprawy['warunki'][number]['wynik'];
type WynikPorownania = WynikWeryfikacjiSprawy['porownanie'][number]['wynik'];

const T = teksty.ViewSampleCaseVerification;

export const IKONY_WYNIKU: Record<WynikWarunku, NazwaIkony> = {
  spelniony: 'sukces',
  niespelniony: 'odmowa',
  ostrzezenie: 'uwaga',
  'nie-dotyczy': 'nie-dotyczy',
  'brak-danych': 'pytanie',
};

const IKONY_POROWNANIA: Record<WynikPorownania, NazwaIkony> = {
  zgodne: 'sukces',
  rozne: 'odmowa',
  'bez-porownania': 'nie-dotyczy',
};

/** Wynik z ikoną w kolorze marki, jak w kolumnach wyników wzorów P13-13 do P13-16. */
export function ZIkona({ ikona, children, rozmiar = 24 }: { ikona: NazwaIkony; children: React.ReactNode; rozmiar?: 20 | 24 }) {
  return (
    <span className="flex items-center gap-2">
      <Ikona nazwa={ikona} rozmiar={rozmiar} className="shrink-0 text-brand" />
      <span className="min-w-0">{children}</span>
    </span>
  );
}

export function ZnacznikWarunku({ wynik }: { wynik: WynikWarunku }) {
  return <ZIkona ikona={IKONY_WYNIKU[wynik]}>{T.wynikiWarunku[wynik]}</ZIkona>;
}

export function ZnacznikPorownania({ wynik }: { wynik: WynikPorownania }) {
  return <ZIkona ikona={IKONY_POROWNANIA[wynik]}>{T.porownania[wynik]}</ZIkona>;
}

/** Legenda możliwych wyników warunku. */
export function LegendaWynikow() {
  const wyniki = Object.keys(IKONY_WYNIKU) as WynikWarunku[];
  return (
    <ul aria-label={T.legenda} className="m-0 mt-5 flex list-none flex-wrap gap-x-6 gap-y-3 p-0 text-small">
      {wyniki.map((w) => (
        <li key={w} className="flex items-center gap-1">
          <Ikona nazwa={IKONY_WYNIKU[w]} rozmiar={20} className="text-brand" />
          {T.wynikiWarunku[w]}
        </li>
      ))}
    </ul>
  );
}
