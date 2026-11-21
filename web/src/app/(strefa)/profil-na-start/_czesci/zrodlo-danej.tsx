// Część Profilu na start: oznaczenie źródła danej „Źródło: konto ZUS” albo „Źródło: Twoja odpowiedź”
// (wzory cz1/P03-*: small-strong z ikoną bazy danych). Używają go ekrany kreatora profilu.
import { Ikona } from '@/komponenty/ikona';
import type { ZrodloDanej } from '@/domena/typy';
import { teksty } from '@/teksty';

export function ZrodloDanejPola({ zrodlo, className }: { zrodlo: ZrodloDanej; className?: string }) {
  return (
    <span className={['inline-flex items-center gap-1 text-small-strong text-ink', className].filter(Boolean).join(' ')}>
      <Ikona nazwa="baza-danych" rozmiar={16} className="text-brand" />
      {teksty.ViewProfileZusData.kreator.zrodla[zrodlo]}
    </span>
  );
}
