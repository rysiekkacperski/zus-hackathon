'use client';

// Slot ViewGuideSettings „sekcja-zgody” w liście slotyUstawien (kontrakt, sekcja 12.4). Właściciel: u02.
// Teksty: teksty.ViewGuideSettings.sekcjaZgody. Wzory: cz1/Ustawienia.dc.html (udzielona), cz1/P01-18 (odmowa),
// cz1/P01-21 (wycofana, 0005), cz1/P01-22 (błąd zapisu wycofania, 0003).
// Historyjka 3.1.1.2.1 (zadania 1 do 4; KA-01 do KA-08, KA-13).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { formatujDate } from '@/komponenty/format';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { ostatniaDecyzja, stanZgody } from '@/domena/konto';
import type { DataISO, KodKomunikatu, StanZgody } from '@/domena/typy';
import { useDzis, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { ArkuszZgody } from '@/app/(strefa)/powitanie/_czesci/arkusz-zgody';
import { ArkuszWycofaniaZgody } from '../_czesci/arkusz-wycofania-zgody';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewGuideSettings.sekcjaZgody;

const IKONY_STANU: Record<StanZgody, NazwaIkony> = {
  'brak-decyzji': 'kolo',
  udzielona: 'sukces',
  odmowa: 'odmowa',
  wycofana: 'nie-dotyczy',
};

type Komunikaty = Extract<KodKomunikatu, '0003' | '0005'>;

export function SlotSekcjaZgody({ konto }: PropsSlotu<'sekcja'>) {
  const rodzina = useRodzina();
  const stanKonta = useStanKonta();
  const dzis = useDzis();
  const [arkusz, ustawArkusz] = useState<'zgoda' | 'wycofanie' | null>(null);
  const [komunikat, ustawKomunikat] = useState<Komunikaty | null>(null);
  const miejsceKomunikatu = useRef<HTMLDivElement>(null);

  const stan = stanZgody(konto.decyzjeOZgodzie);
  const decyzja = ostatniaDecyzja(konto.decyzjeOZgodzie);

  // Przewidywany termin porodu z profilu rodziny, a bez profilu ze szkicu profilu na start.
  const terminPorodu: DataISO | undefined = useMemo(
    () => rodzina?.daneCiazy?.przewidywanyTerminPorodu ?? stanKonta?.szkicProfilu?.daneCiazy.przewidywanyTerminPorodu,
    [rodzina, stanKonta],
  );

  const terminUsuniecia = konto.terminUsunieciaDanychZdrowotnych;
  const daneCzekajaNaUsuniecie = stan === 'wycofana' && terminUsuniecia !== undefined && dzis < terminUsuniecia;

  useEffect(() => {
    if (komunikat !== null) miejsceKomunikatu.current?.focus();
  }, [komunikat]);

  function poUdzieleniu() {
    ustawArkusz(null);
    ustawKomunikat(null);
  }

  function poWycofaniu(ok: boolean) {
    ustawArkusz(null);
    ustawKomunikat(ok ? '0005' : '0003');
  }

  const udzielona = stan === 'udzielona';

  return (
    <>
      {komunikat !== null ? (
        <div ref={miejsceKomunikatu} tabIndex={-1} className="outline-none">
          <Komunikat kod={komunikat} />
        </div>
      ) : null}
      <Karta tytul={t.tytul} bezLinii>
        <div className="flex flex-wrap items-start gap-7.5">
          <div className="flex min-w-0 grow-999 basis-130 flex-col gap-5">
            <p className="m-0 text-body">{t.opis}</p>
            {stan === 'odmowa' || stan === 'brak-decyzji' || (stan === 'wycofana' && !daneCzekajaNaUsuniecie) ? (
              <p className="m-0 text-body">{t.opisBezZgody}</p>
            ) : null}
            {daneCzekajaNaUsuniecie && terminUsuniecia !== undefined ? (
              <p className="m-0 text-body">
                {terminPorodu
                  ? t.opisWycofanejZTerminemPorodu({
                      terminPorodu: formatujDate(terminPorodu),
                      terminUsuniecia: formatujDate(terminUsuniecia),
                    })
                  : t.opisWycofanej({ terminUsuniecia: formatujDate(terminUsuniecia) })}
              </p>
            ) : null}
            <dl className="m-0 flex flex-wrap gap-x-16 gap-y-5 rounded-sm bg-surface-page px-5 py-4">
              <div>
                <dt className="text-body-strong text-ink">{t.stanZgody}</dt>
                <dd className="m-0 mt-1 flex items-center gap-2 text-body">
                  <Ikona nazwa={IKONY_STANU[stan]} rozmiar={20} className="text-brand" />
                  {t.stany[stan]}
                </dd>
              </div>
              {decyzja !== null ? (
                <>
                  <div>
                    <dt className="text-body-strong text-ink">{t.dataOstatniejDecyzji}</dt>
                    <dd className="m-0 mt-1 text-body text-ink-strong">{formatujDate(decyzja.czas)}</dd>
                  </div>
                  <div>
                    <dt className="text-body-strong text-ink">{t.wersjaTresci}</dt>
                    <dd className="m-0 mt-1 text-body text-ink-strong">{decyzja.wersjaTresci}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
          <div className="flex min-w-0 max-w-84 grow basis-70 flex-col gap-4">
            {udzielona ? (
              <Przycisk wariant="drugorzedny" szerokosc="pelna" onClick={() => ustawArkusz('wycofanie')}>
                {t.wycofaj}
              </Przycisk>
            ) : (
              <Przycisk wariant="glowny" szerokosc="pelna" onClick={() => ustawArkusz('zgoda')}>
                {t.udziel}
              </Przycisk>
            )}
            <Notatka>
              <p>{udzielona ? t.notatkaUdzielonej : stan === 'wycofana' ? t.notatkaWycofanej : t.notatkaBezZgody}</p>
            </Notatka>
          </div>
        </div>
      </Karta>
      <ArkuszZgody
        otwarte={arkusz === 'zgoda'}
        onZamknij={() => ustawArkusz(null)}
        kontekst="ustawienia"
        onZapisano={poUdzieleniu}
      />
      <ArkuszWycofaniaZgody
        otwarte={arkusz === 'wycofanie'}
        onZamknij={() => ustawArkusz(null)}
        terminPorodu={terminPorodu}
        onPotwierdzono={poWycofaniu}
      />
    </>
  );
}
