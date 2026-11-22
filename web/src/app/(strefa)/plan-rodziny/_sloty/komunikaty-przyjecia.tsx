'use client';

// Komunikaty 0091, 0092 i 0263 etapu Urlopy i zasiłek macierzyński po przyjęciu dziecka na wychowanie
// (historyjki 3.3.4.1.2 i 3.3.4.1.4, KA-05, KA-12, KA-13). Właściciel: u24.
import { komunikatyPlanuPoPrzyjeciu } from '@/domena/rodzina/przyjecie';
import type { Etap } from '@/domena/typy';
import { Komunikat } from '@/komponenty/komunikat';
import type { PropsSlotuPlanu } from './typy';

export function SlotKomunikatyPrzyjecia({ kontekst, etap }: PropsSlotuPlanu & { etap?: Etap }) {
  const komunikaty = komunikatyPlanuPoPrzyjeciu(kontekst.rodzina.daneCiazy, kontekst.katalog).filter(
    (k) => etap === undefined || k.etap === etap,
  );
  if (komunikaty.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      {komunikaty.map((k) =>
        k.kod === '0091' ? (
          <Komunikat key={k.kod} kod="0091" parametry={{ wiek: k.parametry?.wiek ?? '' }} />
        ) : k.kod === '0263' ? (
          <Komunikat
            key={k.kod}
            kod="0263"
            parametry={{ wiek: k.parametry?.wiek ?? '', liczbaDzieci: k.parametry?.liczbaDzieci ?? '' }}
          />
        ) : (
          <Komunikat key={k.kod} kod="0092" />
        ),
      )}
    </div>
  );
}
