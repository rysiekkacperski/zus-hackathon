'use client';

// SheetRiskDetails (kontrakt, tabela 2.3): arkusz na ViewCaseDetails (K28, K29, ?arkusz=ryzyko) i ViewFamilyPlan (slot ostrzeżeń). Właściciel: u22.
// Wzory: cz2/P18-03 (K28), cz2/P18-05 (K29 umowa zlecenia), cz2/P18-06 (K29 umowa o pracę bez rodzaju umowy).
import type { ReactNode } from 'react';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import {
  czyDzieckoUrodzone,
  ostrzezenieRyzyka,
  type OstrzezenieTytuluWCiazy,
  type OstrzezenieUstania,
} from '@/domena/przewodnik/ryzyka';
import type { FormaZatrudnienia, IdPozycji, Katalog, Pochodzenie, PozycjaPlanu, RodzajTytulu } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Komunikat } from '@/komponenty/komunikat';
import { Arkusz } from '@/komponenty/okno';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const tekst = teksty.SheetRiskDetails;

export type OstrzezenieRyzyka = OstrzezenieTytuluWCiazy | OstrzezenieUstania;

export interface ArkuszRyzykaProps {
  otwarte: boolean;
  onZamknij: () => void;
  sprawa?: PozycjaPlanu;
  ostrzezenie?: OstrzezenieRyzyka;
  kontekst?: KontekstRodziny;
  pochodzenie?: Pochodzenie;
}

/** Sprawa K28 albo K29 z ostrzeżeniem ciąży, które widok pokazuje; po potwierdzeniu daty porodu brak ostrzeżenia. */
export function ostrzezenieDoPokazania(sprawa: PozycjaPlanu, kontekst: KontekstRodziny): OstrzezenieRyzyka | undefined {
  if (sprawa.idPozycji !== 'K28' && sprawa.idPozycji !== 'K29') return undefined;
  if (czyDzieckoUrodzone(kontekst.rodzina.daneCiazy)) return undefined;
  return ostrzezenieRyzyka(sprawa.ostrzezenia);
}

/** Komunikat ostrzeżenia sprawy: 0119 przy tytule podjętym w ciąży, 0120 z datą ustania. */
export function KomunikatRyzyka({ ostrzezenie, akcje, className }: { ostrzezenie: OstrzezenieRyzyka; akcje: ReactNode; className?: string }) {
  return ostrzezenie.rodzaj === 'tytul-w-ciazy' ? (
    <Komunikat kod="0119" akcje={akcje} className={className} />
  ) : (
    <Komunikat kod="0120" parametry={{ data: formatujDate(ostrzezenie.data) }} akcje={akcje} className={className} />
  );
}

/** Identyfikator sprawy pozycji katalogu w planie rodziny (pierwsza sprawa matki albo obojga rodziców). */
export function idSprawyPozycji(kontekst: KontekstRodziny | undefined, idPozycji: IdPozycji): string {
  const pozycje = kontekst?.rodzina.plan?.pozycje.filter((p) => p.idPozycji === idPozycji) ?? [];
  const sprawa = pozycje.find((p) => p.rodzic === 'matka' || p.rodzic === 'oboje-rodzice') ?? pozycje[0];
  return sprawa?.idSprawy ?? idPozycji;
}

function tytulPozycji(katalog: Katalog | undefined, idPozycji: IdPozycji | null, zapasowy: string): string {
  return katalog?.pozycje.find((p) => p.id === idPozycji)?.tytul ?? zapasowy;
}

function skutekRyzyka(katalog: Katalog | undefined, idPozycji: 'K28' | 'K29'): string {
  const koszt = katalog?.pozycje.find((p) => p.id === idPozycji)?.kosztSpoznienia;
  if (koszt?.typ !== 'skutek' || koszt.tekst.trim() === '') return tekst.skutki[idPozycji];
  const bezPrefiksu = koszt.tekst.replace(tekst.prefiksSkutku, '').trim();
  return bezPrefiksu.charAt(0).toLocaleUpperCase('pl-PL') + bezPrefiksu.slice(1);
}

const FORMA_TYTULU: Record<RodzajTytulu, FormaZatrudnienia> = {
  pracownik: 'umowa-o-prace',
  zleceniobiorca: 'umowa-zlecenia',
  dzialalnosc: 'jdg',
};

function opisDatyRyzyka(ostrzezenie: OstrzezenieRyzyka, kontekst: KontekstRodziny | undefined): string {
  const zmiana = kontekst?.rodzina.daneRodziny.matka.zmianaZatrudnienia;
  if (ostrzezenie.rodzaj === 'ustanie-przed-porodem') {
    const terminowa =
      ostrzezenie.forma === 'umowa-o-prace' && zmiana?.przyczyna?.wartosc === 'koniec-umowy-terminowej';
    return terminowa ? tekst.koniecUbezpieczenia['umowa-o-prace-terminowa'] : tekst.koniecUbezpieczenia[ostrzezenie.forma];
  }
  if (zmiana?.rodzaj.wartosc === 'rozpoczecie' && zmiana.data?.wartosc === ostrzezenie.data && zmiana.forma) {
    return tekst.poczatekTytulu[zmiana.forma.wartosc];
  }
  const tytul = kontekst?.daneZusMatki?.tytuly.find((t) => t.od === ostrzezenie.data);
  return tytul ? tekst.poczatekTytulu[FORMA_TYTULU[tytul.rodzaj]] : tekst.poczatekTytulu['brak-tytulu'];
}

function Dzialanie({ opis, children }: { opis: string; children: ReactNode }) {
  return (
    <li className="rounded-md bg-surface-page px-5 py-4">
      <p className="m-0 text-body">{opis}</p>
      <div className="mt-3 flex flex-wrap gap-4">{children}</div>
    </li>
  );
}

export function ArkuszRyzyka({ otwarte, onZamknij, sprawa, ostrzezenie, kontekst, pochodzenie }: ArkuszRyzykaProps) {
  if (sprawa === undefined || ostrzezenie === undefined) return null;
  const katalog = kontekst?.katalog;
  const idPozycji = ostrzezenie.rodzaj === 'tytul-w-ciazy' ? 'K28' : 'K29';
  const tytul = tytulPozycji(katalog, sprawa.idPozycji, sprawa.idSprawy);
  const sciezkaInstrukcji = sciezkaWidoku('ViewCaseGuide', { idSprawy: sprawa.idSprawy, z: pochodzenie });
  const sciezkaK16 = sciezkaWidoku('ViewCaseDetails', { idSprawy: idSprawyPozycji(kontekst, 'K16'), z: pochodzenie });
  const sciezkaK30 = `${sciezkaWidoku('ViewCaseDetails', { idSprawy: idSprawyPozycji(kontekst, 'K30'), z: pochodzenie })}#przedluzenie`;

  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={tekst.tytul}
      opis={tekst.sprawa({ tytul })}
      stopka={
        <div className="ml-auto">
          <Przycisk type="button" wariant="drugorzedny" onClick={onZamknij}>
            {teksty.wspolne.przyciski.zamknij}
          </Przycisk>
        </div>
      }
    >
      <dl className="m-0">
        <div className="border-t border-line-row py-3">
          <dt className="text-body-strong">{tekst.coMozeSieStac}</dt>
          <dd className="m-0 mt-1 text-body">{skutekRyzyka(katalog, idPozycji)}</dd>
        </div>
        <div className="border-y border-line-row py-3">
          <dt className="text-body-strong">{tekst.dataRyzyka}</dt>
          <dd className="m-0 mt-1 text-body">
            <strong className="text-ink-strong">{formatujDate(ostrzezenie.data)}</strong>
            {tekst.opisPoDacie({ opis: opisDatyRyzyka(ostrzezenie, kontekst) })}
          </dd>
        </div>
      </dl>
      <h3 className="m-0 mt-2 text-body-strong">{tekst.coMoznaZrobic}</h3>
      {ostrzezenie.rodzaj === 'tytul-w-ciazy' ? (
        <ul className="m-0 grid list-none gap-3 p-0">
          <Dzialanie opis={tekst.pytanieOpis}>
            <PrzyciskLink href={sciezkaWidoku('ViewZusQuestion', { sprawa: sprawa.idSprawy })} wariant="glowny">
              {tekst.pytanieAkcja}
            </PrzyciskLink>
          </Dzialanie>
        </ul>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {ostrzezenie.sprawdzPrzedluzenie ? (
            <Dzialanie opis={tekst.przedluzenieOpis}>
              <PrzyciskLink href={sciezkaK30} wariant="glowny">
                {tekst.przedluzenieAkcja}
              </PrzyciskLink>
            </Dzialanie>
          ) : null}
          <Dzialanie opis={tekst.dzialania[ostrzezenie.forma]}>
            <PrzyciskLink href={sciezkaInstrukcji} wariant={ostrzezenie.sprawdzPrzedluzenie ? 'drugorzedny' : 'glowny'}>
              {tekst.zobaczInstrukcje}
            </PrzyciskLink>
          </Dzialanie>
          <Dzialanie opis={tekst.swiadczenieRodzicielskieOpis}>
            <PrzyciskLink href={sciezkaK16} wariant="drugorzedny">
              {tekst.swiadczenieRodzicielskieAkcja}
            </PrzyciskLink>
          </Dzialanie>
        </ul>
      )}
    </Arkusz>
  );
}
