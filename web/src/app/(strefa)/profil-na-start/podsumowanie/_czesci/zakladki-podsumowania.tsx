'use client';

// Część ViewProfileSummary: sekcje profilu i sekcje ze slotów w zakładkach (ez-tabs), po jednej zakładce na grupę
// danych w kolejności sekcji. Właściciel: u11.
// Wybrana zakładka żyje w parametrze adresu ?zakladka=<id> (useZakladkaWAdresie). Po powrocie z ekranu kroku
// przez „Zmień” trasa wraca z Activity z tą samą zakładką, a hook dopisuje parametr do adresu. Odnośnik z kotwicą
// zakładki, np. /profil-rodziny#dane-ciazy, wybiera tę zakładkę.
// Panele wszystkich grup zostają w drzewie, nieaktywne z atrybutem hidden, więc slot zachowuje swój stan przy
// zmianie zakładki. Slot, który niczego nie renderuje, zostawia pusty kontener i nie dostaje zakładki.
// Slot z identyfikatorem zakładki sekcji uzupełnia tę zakładkę: gdy renderuje treść, pokazuje kartę sekcji
// z własnymi danymi (KartySekcjiProfilu) w miejsce treści sekcji, a zakładka zostaje jedna, np. „Drugi rodzic”.
// Dawny identyfikator zakładki w adresie, np. ?zakladka=dostep, wybiera zakładkę, która przejęła jej treść.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Rola } from '@/domena/typy';
import { useZakladkaWAdresie, Zakladki } from '@/komponenty/zakladki';
import { teksty } from '@/teksty';
import type { IdZakladkiSekcji } from './zakladki-sekcji';

const t = teksty.ViewProfileSummary.zakladki;

export interface PanelZakladki {
  id: string;
  etykieta: string;
  /** Wskaźnik błędu na zakładce: brak odpowiedzi albo błąd walidacji w grupie. */
  blad?: boolean;
  tresc: ReactNode;
}

type IdZakladkiSlotu = 'dziecko' | 'przyjecie' | 'sytuacja-szczegolna';

/** Zakładka trybu rodziny z danymi, z których powstał plan. */
type IdZakladkiDanychPlanu = 'dane-planu';

/** Identyfikatory wszystkich zakładek podsumowania, także tych, których bieżący profil nie ma. */
const ZNANE_ZAKLADKI: readonly string[] = [
  'zatrudnienie',
  'dane-ciazy',
  'zmiana-zatrudnienia',
  'dane-rodziny',
  'drugi-rodzic',
  'dane-planu',
  'dziecko',
  'przyjecie',
  'sytuacja-szczegolna',
] satisfies (IdZakladkiSekcji | IdZakladkiDanychPlanu | IdZakladkiSlotu)[];

/** Dawne identyfikatory zakładek i zakładki, które przejęły ich treść. */
const DAWNE_ZAKLADKI: ReadonlyMap<string, IdZakladkiSekcji> = new Map([['dostep', 'drugi-rodzic']]);

/** Zakładka z adresu do wybrania po wejściu: dawny identyfikator w ?zakladka= albo kotwica bez tego parametru. */
function zakladkaZAdresu(adres: URL): string | null {
  const zParametru = adres.searchParams.get('zakladka');
  if (zParametru !== null) return DAWNE_ZAKLADKI.get(zParametru) ?? null;
  const kotwica = decodeURIComponent(adres.hash.slice(1));
  return DAWNE_ZAKLADKI.get(kotwica) ?? (ZNANE_ZAKLADKI.includes(kotwica) ? kotwica : null);
}

/** Zakładka slotu z rejestru slotyPodsumowania: identyfikator w adresie i etykieta. */
export function zakladkaSlotu(idSlotu: string, rola: Rola): { id: string; etykieta: string } {
  switch (idSlotu) {
    case 'sekcja-danych-dziecka':
      return { id: 'dziecko', etykieta: t.dziecko };
    case 'sekcja-przyjecia':
      return { id: 'przyjecie', etykieta: t.przyjecie };
    case 'sekcja-drugiego-rodzica':
      // Uzupełnia zakładkę sekcji „Drugi rodzic”, a konto Drugi rodzic widzi ją jako „Twoje dane”.
      return { id: 'drugi-rodzic', etykieta: rola === 'drugi-rodzic' ? t.daneDrugiegoRodzica : t.drugiRodzic };
    case 'sekcja-sytuacji':
      return { id: 'sytuacja-szczegolna', etykieta: t.sytuacja };
    default:
      return { id: idSlotu, etykieta: t.pozostale };
  }
}

/** Identyfikatory slotów, których kontener ma treść; obserwuje kontenery, bo slot zmienia treść sam. */
function useNiepusteSloty(ids: readonly string[]) {
  const kontenery = useRef(new Map<string, HTMLDivElement>());
  const [niepuste, ustawNiepuste] = useState('');
  const klucz = ids.join(' ');

  useLayoutEffect(() => {
    const lista = klucz === '' ? [] : klucz.split(' ');
    const sprawdz = () =>
      ustawNiepuste(lista.filter((id) => kontenery.current.get(id)?.hasChildNodes() ?? false).join(' '));
    sprawdz();
    const obserwator = new MutationObserver(sprawdz);
    for (const id of lista) {
      const kontener = kontenery.current.get(id);
      if (kontener) obserwator.observe(kontener, { childList: true });
    }
    return () => obserwator.disconnect();
  }, [klucz]);

  const kontener = (id: string) => (el: HTMLDivElement | null) => {
    if (el) kontenery.current.set(id, el);
    else kontenery.current.delete(id);
  };

  return { niepuste: niepuste === '' ? [] : niepuste.split(' '), kontener };
}

export interface ZakladkiPodsumowaniaProps {
  /** Zakładki sekcji profilu, zawsze widoczne. */
  sekcje: PanelZakladki[];
  /**
   * Zakładki slotów; zakładka slotu pojawia się, gdy slot renderuje treść. Slot z identyfikatorem zakładki sekcji
   * zastępuje treść tej zakładki swoją treścią i etykietą, gdy ją renderuje.
   */
  sloty: PanelZakladki[];
  /** Zakładka do wybrania po nieudanej próbie zapisu; nowy obiekt przy każdej próbie. */
  wyborPoProbie?: { id: string } | null;
}

export function ZakladkiPodsumowania({ sekcje, sloty, wyborPoProbie }: ZakladkiPodsumowaniaProps) {
  const { niepuste, kontener } = useNiepusteSloty(sloty.map((s) => s.id));
  const idySekcji = sekcje.map((z) => z.id);
  // Niepusty slot zakładki sekcji nadaje jej etykietę, np. „Twoje dane” dla konta Drugi rodzic.
  const slotSekcji = (id: string) => (niepuste.includes(id) ? sloty.find((s) => s.id === id) : undefined);
  const widoczne = [
    ...sekcje.map((z) => ({ ...z, etykieta: slotSekcji(z.id)?.etykieta ?? z.etykieta })),
    ...sloty.filter((s) => !idySekcji.includes(s.id) && niepuste.includes(s.id)),
  ];
  const [wybrana, wybierz] = useZakladkaWAdresie(widoczne.map((z) => z.id));

  // Kotwica zakładki w adresie bez parametru ?zakladka, np. #dane-ciazy z wniosku ZAM, albo dawny identyfikator
  // zakładki, np. ?zakladka=dostep. Efekt układu wybiera zakładkę przed pierwszym malowaniem panelu.
  useLayoutEffect(() => {
    const zakladka = zakladkaZAdresu(new URL(window.location.href));
    if (zakladka !== null) wybierz(zakladka);
  }, [wybierz]);

  useEffect(() => {
    if (wyborPoProbie) wybierz(wyborPoProbie.id);
  }, [wyborPoProbie, wybierz]);

  return (
    <Zakladki<string>
      etykieta={t.etykieta}
      zakladki={widoczne.map((z) => ({ wartosc: z.id, etykieta: z.etykieta, blad: z.blad }))}
      wybrana={wybrana}
      onWybor={wybierz}
    >
      {sekcje.map((z) => (
        <div key={`sekcja-${z.id}`} hidden={z.id !== wybrana || niepuste.includes(z.id)} className="min-w-0">
          {z.tresc}
        </div>
      ))}
      {sloty.map((z) => (
        <div key={`slot-${z.id}`} ref={kontener(z.id)} hidden={z.id !== wybrana} className="min-w-0">
          {z.tresc}
        </div>
      ))}
    </Zakladki>
  );
}
