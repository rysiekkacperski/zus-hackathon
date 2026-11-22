'use client';

// Sekcja ViewCaseGuide „akcja-wariantu” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u26.
// Karta „Wariant zasiłku macierzyńskiego” z akcją porównania wariantów przy sprawach K07 i K08 (3.10.1, R9).
// Teksty: teksty.ViewCaseGuide.sekcjaAkcjaWariantu.
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { dodajDni, formatujDate, roznicaDni } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { daneDzieckaDoKalkulatora, matkaMaPrawoDoZasilku, terminWariantu, tygodnieUrlopuMacierzynskiego } from '@/domena/kalkulatory/wariant';
import { ostatniePorownanie } from '@/app/(strefa)/kalkulatory/_czesci/dane-kalkulatorow';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaWariantu;

function Wiersz({ etykieta, wartosc }: { etykieta: string; wartosc: string }) {
  return (
    <div>
      <p className="m-0 text-body">{etykieta}</p>
      <p className="m-0 text-body-strong">{wartosc}</p>
    </div>
  );
}

export function SekcjaAkcjaWariantu({ sprawa, kontekst }: PropsSlotu<'akcja'>) {
  const id = sprawa.idPozycji;
  if (id !== 'K07' && id !== 'K08') return null;
  const { rodzina, katalog, dzis } = kontekst;
  if (!matkaMaPrawoDoZasilku(rodzina.daneRodziny)) return null;

  const dziecko = daneDzieckaDoKalkulatora(rodzina.daneCiazy);
  const wybrany = sprawa.wybranyWariant && 'wariant' in sprawa.wybranyWariant ? sprawa.wybranyWariant : undefined;
  const termin = dziecko.dataPorodu ? terminWariantu(dziecko.dataPorodu, katalog) : null;
  const poTerminie = termin !== null && dzis > termin;
  const zostalo = termin === null ? null : Math.max(0, roznicaDni(dzis, termin));
  const zapis = ostatniePorownanie(rodzina.wynikiKalkulacji, id);
  const tygM = dziecko.dataPorodu ? tygodnieUrlopuMacierzynskiego(dziecko.liczbaDzieci, katalog, dziecko.dataPorodu) : 20;

  let opisWyboru: React.ReactNode = null;
  if (wybrany && zapis) {
    const miesiecznie = wybrany.wariant === '81-5' ? zapis.wynik.wariant81.miesiecznie[0] : zapis.wynik.wariant100i70.miesiecznie[0];
    const tygodnie = wybrany.wariant === '81-5' ? tygM + zapis.tygodniePrzedPowrotem : tygM;
    opisWyboru = (
      <>
        <p className="m-0 flex items-start gap-2 text-body">
          <Ikona nazwa="sukces" rozmiar={20} className="mt-0.5 shrink-0 text-success-text" />
          <span>
            {t.wybrany}
            <strong>{t.nazwaWariantu[wybrany.wariant]}</strong>
            {miesiecznie !== undefined ? t.wybranyKwota({ kwota: formatujKwote(miesiecznie), tygodnie: t.tygodnie(tygodnie) }) : null}
          </span>
        </p>
        {id === 'K07' && termin && dziecko.dataPorodu ? (
          <p className="m-0 text-body">
            {t.wybranyK07({
              odM: formatujDate(dziecko.dataPorodu),
              doM: formatujDate(dodajDni(dziecko.dataPorodu, tygM * 7 - 1)),
              odR: formatujDate(dodajDni(dziecko.dataPorodu, tygM * 7)),
              doR: formatujDate(dodajDni(zapis.wynik.dataPowrotu, -1)),
              termin: formatujDate(termin),
            })}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <Karta tytul={t.tytul} bezLinii>
      <div className="flex flex-wrap items-start gap-7.5">
        <div className="flex min-w-0 grow basis-105 flex-col gap-4">
          {opisWyboru ?? (
            <>
              <p className="m-0 text-body">{t.opis1}</p>
              <p className="m-0 text-body">{t.opis2}</p>
            </>
          )}
          {termin && !wybrany ? (
            <p className="m-0 flex items-start gap-2 text-body">
              <Ikona nazwa="kalendarz" rozmiar={20} className="mt-0.5 shrink-0 text-brand" />
              {poTerminie ? (
                <span>{t.poTerminie({ termin: formatujDate(termin) })}</span>
              ) : (
                <span>
                  <strong>{t.termin({ termin: formatujDate(termin) })}</strong>
                  {t.terminDopisek}
                </span>
              )}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            <PrzyciskLink href={trasy.ViewCalcMaternityVariant({ sprawa: id })} wariant="drugorzedny">
              {t.porownaj}
            </PrzyciskLink>
          </div>
        </div>
        <div className="flex min-w-0 grow basis-84 flex-col gap-4 rounded-md bg-surface-page p-5">
          <p className="m-0 text-body-strong">{t.stanNa({ data: formatujDate(dzis) })}</p>
          <Wiersz
            etykieta={dziecko.przewidywany ? t.przewidywanyTermin : t.dataPorodu}
            wartosc={dziecko.dataPorodu ? formatujDate(dziecko.dataPorodu) : t.brakDaty}
          />
          <Wiersz
            etykieta={t.wybranyWariant}
            wartosc={wybrany ? t.wariantZapisany({ wariant: t.nazwaWariantu[wybrany.wariant], data: formatujDate(wybrany.zapisano) }) : t.nieWybrano}
          />
          {zostalo !== null && !poTerminie ? <Wiersz etykieta={t.zostalo} wartosc={t.dni(zostalo)} /> : null}
        </div>
      </div>
    </Karta>
  );
}
