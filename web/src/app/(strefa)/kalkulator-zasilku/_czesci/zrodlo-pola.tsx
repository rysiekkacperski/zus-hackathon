import type { ZrodloWartosciKalkulatora } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewCalcMaternityInput;

// Wiersz „Źródło: …” pod polem kalkulatora (wzór Kalkulator).
export function ZrodloPola({ id, zrodlo }: { id?: string; zrodlo: ZrodloWartosciKalkulatora }) {
  return (
    <p id={id} className="m-0 text-small">
      {t.zrodlo({ zrodlo: t.zrodla[zrodlo] })}
    </p>
  );
}
