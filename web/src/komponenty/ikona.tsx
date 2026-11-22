import { sciezkiIkon, type NazwaIkony } from '@/komponenty/ikony';

export { sciezkiIkon };
export type { NazwaIkony };

export type RozmiarIkony = 16 | 20 | 24;

export interface IkonaProps {
  nazwa: NazwaIkony;
  rozmiar?: RozmiarIkony;
  className?: string;
  // Bez etykiety ikona jest ozdobna i ma aria-hidden. Z etykietą ma role="img", aria-label i <title>.
  etykieta?: string;
}

const klasyRozmiaru: Record<RozmiarIkony, string> = {
  24: 'size-icon',
  20: 'size-5',
  16: 'size-4',
};

// Klasa size-* w className zastępuje rozmiar domyślny, na przykład size-method-icon dla ikony metody logowania.
const wlasnyRozmiar = /(^|\s)size-/;

export function Ikona({ nazwa, rozmiar = 24, className, etykieta }: IkonaProps) {
  const klasy = [
    className && wlasnyRozmiar.test(className) ? null : klasyRozmiaru[rozmiar],
    'shrink-0 fill-none stroke-current stroke-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dostepnosc = etykieta
    ? ({ role: 'img', 'aria-label': etykieta } as const)
    : ({ 'aria-hidden': true } as const);

  return (
    <svg
      className={klasy}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...dostepnosc}
    >
      {etykieta ? <title>{etykieta}</title> : null}
      {sciezkiIkon[nazwa].map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
