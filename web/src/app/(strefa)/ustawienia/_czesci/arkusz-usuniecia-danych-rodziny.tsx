'use client';

// SheetFamilyDataDeleteConfirm (kontrakt, tabela 2.3): arkusz na ViewGuideSettings. Właściciel: u02.
// Wzór: cz1/P01-23 (plan 12 spraw, nieukończony wniosek ZAM). Historyjka 3.1.1.2.1 (zadania 5 i 6; KA-09 do KA-12).
import { useMemo, useState } from 'react';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import type { StanRodziny, Wniosek } from '@/domena/typy';
import { useRodzina } from '@/dane/magazyn/hooki';
import { czyWniosekNiewyslany, usunDaneRodziny } from '@/dane/magazyn/operacje/dane-rodziny-usuniecie';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { teksty } from '@/teksty';

const t = teksty.SheetFamilyDataDeleteConfirm;

export interface ArkuszUsunieciaDanychRodzinyProps {
  otwarte: boolean;
  onZamknij: () => void;
}

interface ZakresUsuniecia {
  liczbaSpraw: number | null;
  niewyslane: string[];
}

function opisWniosku(wniosek: Wniosek): string {
  const stan = wniosek.stan === 'szkic' || wniosek.stan === 'przygotowany' ? t.stanyWnioskow[wniosek.stan] : null;
  const nazwa = t.rodzajeWnioskow[wniosek.rodzaj];
  return stan === null ? nazwa : t.wniosekZeStanem({ wniosek: nazwa, stan });
}

function zakresUsuniecia(rodzina: StanRodziny | null): ZakresUsuniecia {
  const pozycje = rodzina?.plan?.pozycje.length ?? 0;
  return {
    liczbaSpraw: pozycje > 0 ? pozycje : null,
    niewyslane: (rodzina?.wnioski ?? []).filter(czyWniosekNiewyslany).map(opisWniosku),
  };
}

export function ArkuszUsunieciaDanychRodziny({ otwarte, onZamknij }: ArkuszUsunieciaDanychRodzinyProps) {
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const rodzina = useRodzina();
  const biezacy = useMemo(() => zakresUsuniecia(rodzina), [rodzina]);
  // Zakres pokazany w chwili potwierdzenia zostaje w arkuszu do przejścia na ekran powitalny.
  const [zamrozony, ustawZamrozony] = useStanChwilowy<ZakresUsuniecia | null>(null);
  const [bladZapisu, ustawBladZapisu] = useState(false);
  const zakres = zamrozony ?? biezacy;

  function zamknij() {
    ustawBladZapisu(false);
    onZamknij();
  }

  function potwierdz() {
    ustawZajety(true);
    ustawZamrozony(biezacy);
    const wynik = usunDaneRodziny(pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      ustawZamrozony(null);
      ustawBladZapisu(true);
      return;
    }
    przejdz(trasy.ViewGuideWelcome());
  }

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={zamknij}
      tytul={t.tytul}
      opis={t.wstep}
      komunikat={bladZapisu ? <Komunikat kod="0003" /> : undefined}
      zamykanieZablokowane={zajety}
      stopka={
        <>
          <Przycisk wariant="glowny" onClick={potwierdz} zajety={zajety}>
            {t.potwierdz}
          </Przycisk>
          <Przycisk wariant="drugorzedny" onClick={zamknij} disabled={zajety}>
            {t.anuluj}
          </Przycisk>
        </>
      }
    >
      <div className="rounded-sm bg-surface-page px-5 py-4">
        <ul className="m-0 pl-6 text-body">
          <li>{t.profil}</li>
          <li>{zakres.liczbaSpraw !== null ? t.planZLiczbaSpraw({ liczba: zakres.liczbaSpraw }) : t.plan}</li>
          <li>{t.terminy}</li>
          <li>{zakres.niewyslane.length > 0 ? t.wnioskiZLista({ lista: zakres.niewyslane.join('; ') }) : t.wnioski}</li>
        </ul>
      </div>
      <p className="m-0 text-body">{t.widocznosc}</p>
      <p className="m-0 text-body">{t.odPoczatku}</p>
    </Arkusz>
  );
}
