'use client';

// Pole „Formy zatrudnienia” z wyborem wielu odpowiedzi (wzory P04-12, P04-13): podpowiedź pod legendą
// i jeden komunikat błędu pod grupą, a przy błędzie każde pole zaznaczenia ma aria-invalid.
import { FORMY_ZATRUDNIENIA } from '@/domena/katalog/edycja';
import type { FormaZatrudnienia, KodKomunikatu } from '@/domena/typy';
import { BladPola, idBledu, opuszczonoKontener, polaczOpisy } from '@/komponenty/pole';
import { klasyEtykietyZaznaczenia, klasyKwadratuZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { teksty } from '@/teksty';

const ID_GRUPY = 'formy';
const ID_PODPOWIEDZI = 'formy-podpowiedz';

export interface WyborFormProps {
  wartosci: FormaZatrudnienia[];
  onZmiana: (wartosci: FormaZatrudnienia[]) => void;
  /** Wyjście fokusu poza grupę i zmiana zaznaczenia: walidacja po opuszczeniu (useWalidacjaNaBiezaco). */
  onOpuszczenie?: () => void;
  blad?: KodKomunikatu | null;
}

export function WyborForm({ wartosci, onZmiana, onOpuszczenie, blad }: WyborFormProps) {
  const t = teksty.ViewCatalogItemAdd.warunek;
  const etykiety = teksty.ViewCatalogList.etykiety.formyZatrudnienia;
  const opisy = polaczOpisy(ID_PODPOWIEDZI, blad ? idBledu(ID_GRUPY) : null);

  function przelacz(forma: FormaZatrudnienia, zaznaczone: boolean) {
    const zbior = new Set(wartosci);
    if (zaznaczone) zbior.add(forma);
    else zbior.delete(forma);
    onZmiana(FORMY_ZATRUDNIENIA.filter((f) => zbior.has(f)));
    onOpuszczenie?.();
  }

  return (
    <fieldset
      aria-describedby={opisy}
      onBlur={(e) => {
        if (onOpuszczenie && opuszczonoKontener(e)) onOpuszczenie();
      }}
      className="m-0 min-w-0 border-0 p-0"
    >
      <legend className="m-0 mb-1 p-0 text-body-strong">{t.formy}</legend>
      <p id={ID_PODPOWIEDZI} className="m-0 mb-3">
        {t.podpowiedzForm}
      </p>
      <div className="flex flex-col gap-3">
        {FORMY_ZATRUDNIENIA.map((forma) => {
          const id = `${ID_GRUPY}-${forma}`;
          return (
            <label key={forma} htmlFor={id} className={klasyEtykietyZaznaczenia.aktywna}>
              <input
                id={id}
                type="checkbox"
                name={ID_GRUPY}
                value={forma}
                checked={wartosci.includes(forma)}
                aria-invalid={blad ? true : undefined}
                onChange={(e) => przelacz(forma, e.target.checked)}
                className={klasyKwadratuZaznaczenia}
              />
              <span className="min-w-0">{etykiety[forma]}</span>
            </label>
          );
        })}
      </div>
      {blad ? <BladPola id={idBledu(ID_GRUPY)} kod={blad} /> : null}
    </fieldset>
  );
}
