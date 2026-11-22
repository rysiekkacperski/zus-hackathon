import type { CSSProperties } from 'react';

export interface PostepProps {
  wartosc: number;
  maks: number;
  etykieta: string;
  tekstWartosci?: string;
  // Identyfikator widocznej etykiety; z nim pasek ma aria-labelledby zamiast aria-label.
  idEtykiety?: string;
  min?: number;
  id?: string;
  className?: string;
}

export function procentPostepu(wartosc: number, maks: number, min = 0): number {
  if (maks <= min) return 0;
  const p = ((wartosc - min) / (maks - min)) * 100;
  return Math.min(100, Math.max(0, Math.round(p)));
}

export function Postep({ wartosc, maks, etykieta, tekstWartosci, idEtykiety, min = 0, id, className }: PostepProps) {
  const szerokosc = { '--szerokosc-postepu': `${procentPostepu(wartosc, maks, min)}%` } as CSSProperties;
  return (
    <div
      id={id}
      role="progressbar"
      aria-label={idEtykiety ? undefined : etykieta}
      aria-labelledby={idEtykiety}
      aria-valuemin={min}
      aria-valuemax={maks}
      aria-valuenow={wartosc}
      aria-valuetext={tekstWartosci}
      className={[
        'box-content h-progress w-full overflow-hidden rounded-full border border-ink-muted bg-surface-card',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="h-full w-(--szerokosc-postepu) rounded-full bg-brand" style={szerokosc} />
    </div>
  );
}
