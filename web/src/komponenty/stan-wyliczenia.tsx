// Stany wyliczenia przez REST API w widokach (hook useWyliczenieApi z @/dane/api/wyliczenie): szkielet wyniku na czas
// pierwszego wyliczenia, komunikat dla czytników ekranu przy przeliczaniu i błąd z przyciskiem ponowienia.
import type { ReactNode } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { Przycisk } from '@/komponenty/przycisk';
import type { ParametryKomunikatu } from '@/komponenty/typy-komunikatow';
import type { KodKomunikatu } from '@/domena/typy/komunikaty';
import { teksty } from '@/teksty';

const t = teksty.wspolne.wyliczenie;

/** Szkielet karty wyniku na czas pierwszego wyliczenia. */
export function SzkieletWyliczenia({ wysokosc = 'wysoki', className }: { wysokosc?: 'niski' | 'wysoki'; className?: string }) {
  return (
    <div aria-busy="true" className={['flex flex-col gap-4', className].filter(Boolean).join(' ')}>
      <p role="status" className="sr-only">
        {t.trwa}
      </p>
      <div
        aria-hidden="true"
        className={[
          'w-full rounded-sm bg-surface-card motion-safe:animate-pulse',
          wysokosc === 'niski' ? 'h-24' : 'h-64',
        ].join(' ')}
      />
    </div>
  );
}

/** Komunikat dla czytników ekranu, gdy wynik przelicza się po zmianie danych, a widok pokazuje poprzedni wynik. */
export function StatusPrzeliczania({ laduje }: { laduje: boolean }) {
  return (
    <p role="status" className="sr-only">
      {laduje ? t.przeliczanie : ''}
    </p>
  );
}

/** Błąd wyliczenia z kodem z tablicy komunikatów, przyciskiem „Spróbuj ponownie” i akcjami widoku. */
export function BladWyliczenia<K extends KodKomunikatu>({
  kod,
  parametry,
  onPonow,
  akcje,
  className,
}: {
  kod: K;
  parametry?: ParametryKomunikatu<K>;
  onPonow?: () => void;
  akcje?: ReactNode;
  className?: string;
}) {
  return (
    <Komunikat
      kod={kod}
      parametry={parametry}
      className={className}
      akcje={
        onPonow || akcje ? (
          <>
            {onPonow ? (
              <Przycisk type="button" wariant="drugorzedny" onClick={onPonow}>
                {teksty.wspolne.przyciski.sprobujPonownie}
              </Przycisk>
            ) : null}
            {akcje}
          </>
        ) : undefined
      }
    />
  );
}
