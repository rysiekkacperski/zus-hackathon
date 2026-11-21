'use client';

// Slot ViewProfileSummary „sekcja-sytuacji” w liście slotyPodsumowania (kontrakt, sekcja 12.4). Właściciel: u25.
// W trybie rodziny (Rodzic, Drugi rodzic) karta „Sytuacja szczególna” z akcją przejścia do ViewSpecialSituation
// i liczbą zapisanych sytuacji. W trybie startu profil rodziny jeszcze nie istnieje, więc slot zwraca null.
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewProfileSummary.sekcjaSytuacji;

export function SlotSekcjaSytuacji({ tryb, konto, kontekst }: PropsSlotu<'sekcja'>) {
  if (tryb !== 'rodzina' || kontekst === null) return null;
  if (konto.rola !== 'rodzic' && konto.rola !== 'drugi-rodzic') return null;
  const daneCiazy = kontekst.rodzina.daneCiazy;
  const liczba = daneCiazy && !daneCiazy.wylaczoneZUzycia ? (daneCiazy.sytuacjeSzczegolne ?? []).length : 0;
  return (
    <Karta tytul={t.tytul} bezLinii>
      <div className="flex min-w-0 flex-col items-start gap-4">
        <p className="m-0">{liczba > 0 ? t.zapisane({ liczba }) : t.opis}</p>
        <PrzyciskLink href={trasy.ViewSpecialSituation()} wariant="drugorzedny">
          {liczba > 0 ? t.akcjaZapisane : t.akcja}
        </PrzyciskLink>
      </div>
    </Karta>
  );
}
