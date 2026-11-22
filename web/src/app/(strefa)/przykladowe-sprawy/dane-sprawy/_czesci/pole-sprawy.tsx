'use client';

// Pole danych przykładowej sprawy ze źródłem wartości pod polem (wzory P13-02, P13-06, P13-09).
// Wariant lokalny złożony z klas bazowych `komponenty/pole.tsx`: komponent Pole pokazuje podpowiedź nad polem,
// a wzór pokazuje źródło wartości pod polem.
import type { ReactNode } from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { BladPola, idBledu, klasyOdstepuPolaWpisu, klasyPolaWpisu, polaczOpisy } from '@/komponenty/pole';
import type { KodKomunikatu } from '@/domena/typy';
import { teksty } from '@/teksty';

export interface OpisZrodla { tekst: ReactNode; ikona?: NazwaIkony }

interface WspolnePolaSprawy {
  id: string;
  etykieta: string;
  zrodlo?: OpisZrodla | null;
  blad?: KodKomunikatu | null;
  className?: string;
  dodatek?: ReactNode;
  /** Opuszczenie pola (blur), a w polu wyboru także wybór opcji: walidacja na bieżąco. */
  onOpuszczenie?: () => void;
}

function Zrodlo({ id, zrodlo }: { id: string; zrodlo: OpisZrodla }) {
  return (
    <p id={id} className="m-0 flex items-start gap-1.5 text-small text-ink-muted">
      {zrodlo.ikona ? <Ikona nazwa={zrodlo.ikona} rozmiar={16} className="mt-0.5 shrink-0 text-brand" /> : null}
      <span className="min-w-0">{zrodlo.tekst}</span>
    </p>
  );
}

function Oprawa({ id, etykieta, zrodlo, blad, className, children }: WspolnePolaSprawy & { children: ReactNode }) {
  return (
    <div className={['grid min-w-0 content-start gap-1', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="min-w-0 font-semibold text-ink">
        {etykieta}
      </label>
      {children}
      {blad ? <BladPola id={idBledu(id)} kod={blad} /> : zrodlo ? <Zrodlo id={`${id}-zrodlo`} zrodlo={zrodlo} /> : null}
    </div>
  );
}

function opisy(id: string, zrodlo: OpisZrodla | null | undefined, blad: KodKomunikatu | null | undefined) {
  return polaczOpisy(blad ? idBledu(id) : zrodlo ? `${id}-zrodlo` : null);
}

export interface PoleWpisuSprawyProps extends WspolnePolaSprawy {
  wartosc: string;
  onZmiana?: (w: string) => void;
  tylkoDoOdczytu?: boolean;
  inputMode?: 'text' | 'numeric' | 'decimal';
  data?: boolean;
}

export function PoleWpisuSprawy({ wartosc, onZmiana, tylkoDoOdczytu, inputMode = 'text', data, dodatek, ...reszta }: PoleWpisuSprawyProps) {
  const { id, zrodlo, blad, onOpuszczenie } = reszta;
  return (
    <Oprawa {...reszta}>
      <div className="flex min-w-0 items-center gap-2">
        <input
          id={id}
          type="text"
          value={wartosc}
          onChange={(e) => onZmiana?.(e.target.value)}
          onBlur={onOpuszczenie}
          readOnly={tylkoDoOdczytu}
          aria-readonly={tylkoDoOdczytu || undefined}
          inputMode={data ? 'numeric' : inputMode}
          placeholder={data ? teksty.ViewSampleCaseData.formatDaty : undefined}
          autoComplete="off"
          aria-describedby={opisy(id, zrodlo, blad)}
          aria-invalid={blad ? true : undefined}
          className={`${klasyPolaWpisu} ${klasyOdstepuPolaWpisu}`}
        />
        {dodatek}
      </div>
    </Oprawa>
  );
}

export interface PoleWyboruSprawyProps extends WspolnePolaSprawy {
  wartosc: string;
  opcje: Readonly<Record<string, string>>;
  onZmiana: (w: string) => void;
  pustaOpcja?: boolean;
}

export function PoleWyboruSprawy({ wartosc, opcje, onZmiana, pustaOpcja, ...reszta }: PoleWyboruSprawyProps) {
  const { id, zrodlo, blad, onOpuszczenie } = reszta;
  return (
    <Oprawa {...reszta}>
      <span className="relative block w-full">
        <select
          id={id}
          value={wartosc}
          onChange={(e) => {
            onZmiana(e.target.value);
            onOpuszczenie?.();
          }}
          onBlur={onOpuszczenie}
          aria-describedby={opisy(id, zrodlo, blad)}
          aria-invalid={blad ? true : undefined}
          className={`${klasyPolaWpisu} cursor-pointer appearance-none pr-12 pl-3 focus:pr-[2.9375rem] focus:pl-[0.6875rem]`}
        >
          {pustaOpcja || wartosc === '' ? <option value="">{teksty.wspolne.pola.wybierzZListy}</option> : null}
          {Object.entries(opcje).map(([w, e]) => (
            <option key={w} value={w}>
              {e}
            </option>
          ))}
        </select>
        <Ikona nazwa="w-dol" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-brand" />
      </span>
    </Oprawa>
  );
}

const klasySiatki = {
  3: 'grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
} as const;

/**
 * Siatka pól karty danych sprawy: jedna kolumna na telefonie, trzy od 1024 px. Wariant 4 (wpis rozstrzygnięcia)
 * i wariant 6 (kwoty miesięczne) od 1280 px mieszczą wpis w dwóch wierszach, a 12 miesięcy w dwóch wierszach.
 */
export function SiatkaPol({ children, kolumny = 3 }: { children: ReactNode; kolumny?: keyof typeof klasySiatki }) {
  return <div className={klasySiatki[kolumny]}>{children}</div>;
}

export function PodtytulKarty({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="mt-6 mb-4 text-body-strong text-ink first:mt-0">
      {children}
    </h3>
  );
}
