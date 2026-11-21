import { teksty } from '@/teksty';

export { SzkieletRamy } from '@/komponenty/rama/szkielet-ramy';

export interface SzkieletWidokuProps {
  id?: string;
  className?: string;
}

const klasyBloku = 'rounded-sm motion-safe:animate-pulse';

// Statyczny szkielet treści widoku na czas prerenderu i odczytu magazynu.
export function SzkieletWidoku({ id, className }: SzkieletWidokuProps) {
  return (
    <div id={id} aria-busy="true" className={['flex max-w-tresc flex-col gap-7.5 pt-4 md:pt-10', className].filter(Boolean).join(' ')}>
      <p role="status" className="sr-only">
        {teksty.wspolne.ladowanie}
      </p>
      <div aria-hidden="true" className="flex flex-col gap-2">
        <div className={`${klasyBloku} h-8 w-full max-w-90 bg-line-soft`} />
        <div className={`${klasyBloku} h-6 w-full max-w-140 bg-line-soft`} />
      </div>
      <div aria-hidden="true" className="flex flex-wrap items-start gap-7.5">
        <div className={`${klasyBloku} h-64 min-w-0 grow-999 basis-140 bg-surface-card`} />
        <div className={`${klasyBloku} h-40 min-w-0 max-w-84 grow basis-84 bg-surface-card`} />
      </div>
    </div>
  );
}
