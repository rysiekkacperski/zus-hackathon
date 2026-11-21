// Szkic Profilu na start i zmiana profilu (kontrakt, sekcja 6.5). Właściciel: u07 (Profil na start: dane ZUS, płatnik, sytuacja).
// Zaślepka fundamentu: implementuje u07. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { OdpowiedzOPlatniku } from '@/domena/profil/platnik';
import type { IdWidoku, KontekstOperacji, RodzicWRodzinie, SzkicProfilu, WynikOperacji } from '@/domena/typy';

/** Zmiana pól szkicu z ekranu kreatora; kształt scalania ustala właściciel (u07). */
export interface ZmianaSzkicu {
  daneRodziny?: SzkicProfilu['daneRodziny'];
  daneCiazy?: SzkicProfilu['daneCiazy'];
  powrotNaPodsumowanie?: boolean;
}

/** Zapis zmiany szkicu i ostatniego ekranu kreatora. */
export function zapiszSzkic(zmiana: ZmianaSzkicu, ekran: IdWidoku, ctx: KontekstOperacji): WynikOperacji<SzkicProfilu> {
  return { ok: false, kod: '0003' };
}

/** Szkic w trybie zmiany profilu z zapisanych Danych rodziny i Danych ciąży i dziecka. */
export function rozpocznijZmianeProfilu(ctx: KontekstOperacji): WynikOperacji<SzkicProfilu> {
  return { ok: false, kod: '0003' };
}

/** Porzucenie szkicu w trybie zmiany profilu. */
export function anulujZmianyProfilu(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Płatnik zasiłku z odpowiedzi rodzica na ViewProfilePayer. */
export function zapiszOdpowiedzPlatnika(
  rodzic: RodzicWRodzinie,
  odpowiedz: OdpowiedzOPlatniku,
  ctx: KontekstOperacji,
): WynikOperacji {
  return { ok: false, kod: '0003' };
}
