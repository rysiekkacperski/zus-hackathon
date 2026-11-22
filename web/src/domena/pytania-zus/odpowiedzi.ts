// Symulowana odpowiedź ZUS na pytanie (kontrakt, sekcja 7.2). Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
import type { OdpowiedziZus } from '@/dane/konta-zus/odpowiedzi-zus';
import { dodajMinuty, porownajZnaczniki } from '@/domena/daty';
import type { IdSprawy, PytanieDoZus, ZnacznikCzasu } from '@/domena/typy';

const MINUT_W_DOBIE = 24 * 60;

/** Identyfikator pozycji katalogu ze sprawy na rodzica ('K21-matka' → 'K21'). */
function idPozycjiSprawy(idSprawy: IdSprawy): string {
  const dopasowanie = /^K\d+/.exec(idSprawy);
  return dopasowanie ? dopasowanie[0] : idSprawy;
}

/** Treść symulowanej odpowiedzi według sprawy pytania; pytanie bez sprawy dostaje odpowiedź ogólną. */
export function trescSymulowanejOdpowiedzi(pytanie: Pick<PytanieDoZus, 'idSprawy'>, odpowiedzi: OdpowiedziZus): string {
  if (pytanie.idSprawy === undefined) return odpowiedzi.ogolna;
  return (
    odpowiedzi.wedlugSprawy[pytanie.idSprawy] ??
    odpowiedzi.wedlugSprawy[idPozycjiSprawy(pytanie.idSprawy)] ??
    odpowiedzi.ogolna
  );
}

/** Chwila, w której symulowany ZUS odpowiada na pytanie: wysłanie + `opoznienieDni` dni. */
export function chwilaSymulowanejOdpowiedzi(pytanie: Pick<PytanieDoZus, 'wyslano'>, opoznienieDni: number): ZnacznikCzasu {
  return dodajMinuty(pytanie.wyslano, Math.max(0, opoznienieDni) * MINUT_W_DOBIE);
}

/** Odpowiedź po `opoznienieDni` dniach od wysłania; null, gdy jeszcze nie nadeszła albo pytanie ma już odpowiedź. */
export function symulowanaOdpowiedz(
  pytanie: PytanieDoZus,
  odpowiedzi: OdpowiedziZus,
  teraz: ZnacznikCzasu,
  opoznienieDni: number,
): NonNullable<PytanieDoZus['odpowiedz']> | null {
  if (pytanie.odpowiedz !== undefined) return null;
  const czas = chwilaSymulowanejOdpowiedzi(pytanie, opoznienieDni);
  if (porownajZnaczniki(czas, teraz) > 0) return null;
  return { tresc: trescSymulowanejOdpowiedzi(pytanie, odpowiedzi), czas, symulowana: true };
}

/** Pytania konta od najnowszego; pytanie z odpowiedzią zastępuje to samo pytanie bez odpowiedzi. */
export function scalPytania(...listy: readonly (readonly PytanieDoZus[] | undefined)[]): PytanieDoZus[] {
  const wedlugId = new Map<string, PytanieDoZus>();
  for (const lista of listy) {
    for (const pytanie of lista ?? []) {
      const poprzednie = wedlugId.get(pytanie.idPytania);
      if (poprzednie === undefined) {
        wedlugId.set(pytanie.idPytania, pytanie);
        continue;
      }
      const odpowiedz = poprzednie.odpowiedz ?? pytanie.odpowiedz;
      wedlugId.set(pytanie.idPytania, {
        ...poprzednie,
        ...pytanie,
        ...(odpowiedz ? { odpowiedz, status: 'odpowiedz' as const } : {}),
        ...(poprzednie.powiadomionoOOdpowiedzi || pytanie.powiadomionoOOdpowiedzi ? { powiadomionoOOdpowiedzi: true } : {}),
      });
    }
  }
  return [...wedlugId.values()].sort((a, b) => porownajZnaczniki(b.wyslano, a.wyslano));
}

/** Pytania wysłane w sprawie, od najnowszego (R4). */
export function pytaniaWSprawie(pytania: readonly PytanieDoZus[], idSprawy: IdSprawy): PytanieDoZus[] {
  return pytania.filter((p) => p.idSprawy === idSprawy).sort((a, b) => porownajZnaczniki(b.wyslano, a.wyslano));
}
