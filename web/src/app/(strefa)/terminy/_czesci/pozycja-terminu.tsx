'use client';

// Pozycja listy terminów ViewDeadlines (wzory cz1/Terminy, P07-02..P07-05). Właściciel: u13.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { czyKosztMinimalny } from '@/domena/terminy/koszt';
import type { TerminNaLiscie } from '@/domena/terminy/lista';
import { REGULY_POZYCJI } from '@/domena/terminy/reguly';
import type { PozycjaPlanu } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Odnosnik } from '@/komponenty/odnosnik';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';
import { etykietaRodzica, tekstDni, wyjasnienieKosztu } from './prezentacja';

const t = teksty.ViewDeadlines;

export function tytulZKatalogu(k: KontekstRodziny, sprawa: PozycjaPlanu): string {
  const zKatalogu = sprawa.idPozycji ? k.katalog.pozycje.find((p) => p.id === sprawa.idPozycji)?.tytul : undefined;
  return zKatalogu ?? tytulSprawy(k.katalog, sprawa.idSprawy);
}

export function KosztPrzyTerminie({ termin, sprawa }: { termin: TerminNaLiscie; sprawa: PozycjaPlanu }) {
  const koszt = termin.koszt;
  if (koszt.rodzaj === 'brak') return null;
  if (koszt.rodzaj === 'skutek') {
    return (
      <p className="m-0 mt-2 text-body">
        <span className="font-semibold">{t.pozycja.skutekSpoznienia}</span> {koszt.tekst}
      </p>
    );
  }
  const wyjasnienie = wyjasnienieKosztu(koszt, sprawa.idPozycji);
  return (
    <p className="m-0 mt-2 text-body">
      <span className="font-semibold">{t.pozycja.kosztSpoznienia}</span>{' '}
      {czyKosztMinimalny(sprawa.idPozycji) ? `${t.pozycja.coNajmniej} ` : null}
      <span className="font-semibold text-ink-strong">{formatujKwote(koszt.kwota)}</span>{' '}
      {koszt.moment === 'na-dzis' ? t.pozycja.naDzis : t.pozycja.wDniuPoTerminie}
      {wyjasnienie ? ` – ${wyjasnienie}` : null}
    </p>
  );
}

export function PozycjaTerminu({ termin, sprawa, kontekst, ostatnia }: { termin: TerminNaLiscie; sprawa: PozycjaPlanu; kontekst: KontekstRodziny; ostatnia: boolean }) {
  const tytul = tytulZKatalogu(kontekst, sprawa);
  const dni = tekstDni(termin.dniDoTerminu ?? 0);
  const powtarzalna = !!sprawa.idPozycji && REGULY_POZYCJI[sprawa.idPozycji]?.typ === 'coroczny';
  const etykietaDrugiego = termin.drugi
    ? (t.etykietyDrugiegoTerminu as Record<string, string>)[termin.drugi.kluczEtykiety] ?? termin.drugi.kluczEtykiety
    : null;
  const etykietaPierwszego = !termin.drugi && termin.drugiTermin ? t.etykietyDrugiegoTerminu['wniosek-o-urlop'] : null;
  return (
    <li className={['flex flex-wrap gap-x-6 gap-y-2 py-4', ostatnia ? '' : 'border-b border-line-row'].join(' ')}>
      <div className="w-40 shrink-0">
        <p className="m-0 text-body font-semibold text-ink-strong">{formatujDate(termin.termin)}</p>
        {dni.poTerminie ? (
          <>
            <p className="m-0 text-body font-semibold text-ink-strong">{dni.glowny}</p>
            <p className="m-0 text-body">{dni.minal}</p>
          </>
        ) : (
          <p className="m-0 text-body">{dni.glowny}</p>
        )}
        {termin.szacowany ? (
          <p className="m-0 mt-1 flex items-center gap-2 text-body font-semibold text-ink-strong">
            <Ikona nazwa="kalendarz-szacowany" />
            {t.pozycja.szacowany}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 flex-[1_1_380px]">
        <h4 className="m-0 text-body font-semibold">
          <Odnosnik href={sciezkaWidoku('ViewCaseDetails', { idSprawy: sprawa.idSprawy })} pochodzenie="terminy">
            {tytul}
          </Odnosnik>
        </h4>
        {etykietaDrugiego || etykietaPierwszego ? (
          <p className="m-0 mt-1 text-body">{t.pozycja.drugiTermin({ etykieta: etykietaDrugiego ?? etykietaPierwszego ?? '' })}</p>
        ) : null}
        <p className="m-0 mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-body">
          <span className="inline-flex items-center gap-2">
            <Ikona nazwa="profil" />
            <span>
              <span className="sr-only">{t.pozycja.kogoDotyczy}</span>
              {etykietaRodzica(sprawa, kontekst)}
            </span>
          </span>
          {sprawa.liczbaDzieci > 1 ? <span>{t.pozycja.dzieci({ liczba: String(sprawa.liczbaDzieci) })}</span> : null}
          {sprawa.zalezyOdDochodu ? <span>{t.pozycja.zalezyOdDochodu}</span> : null}
          {powtarzalna ? (
            <span className="inline-flex items-center gap-2">
              <Ikona nazwa="powtarzanie" />
              {t.pozycja.powtarzaSie}
            </span>
          ) : null}
        </p>
        <KosztPrzyTerminie termin={termin} sprawa={sprawa} />
        {sprawa.idPozycji === 'K01' && dni.poTerminie ? (
          <p className="m-0 mt-2 text-body">
            {t.pozycja.wizytaOdbylaSie}{' '}
            <Odnosnik wTekscie href={sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })}>
              {t.pozycja.profiluRodziny}
            </Odnosnik>
            .
          </p>
        ) : null}
        <p className="m-0 mt-2 text-body">
          <Odnosnik
            href={sciezkaWidoku('ViewCaseGuide', { idSprawy: sprawa.idSprawy })}
            pochodzenie="terminy"
            aria-label={t.pozycja.jakZalatwicSprawe({ tytul })}
          >
            {t.pozycja.jakZalatwic}
          </Odnosnik>
        </p>
      </div>
    </li>
  );
}
