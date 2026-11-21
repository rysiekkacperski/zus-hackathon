// Pytanie do ZUS, dane konta ubezpieczonego i wniosek o odpis aktu urodzenia (kontrakt, sekcja 6.5).
// Właściciel: u29 (Pytanie do ZUS, dane konta i odpis aktu urodzenia).
// Zaślepka fundamentu: implementuje u29. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
// sprawdzOdpowiedziZus leży w rejestrze po-odczycie-zus (plik u29) i jest tu reeksportowana.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdSprawy, IdWniosku, KontekstOperacji, PytanieDoZus, WynikOperacji } from '@/domena/typy';

export { sprawdzOdpowiedziZus } from '@/dane/magazyn/operacje/po-odczycie-zus/sprawdz-odpowiedzi-zus';

/** Treść pytania i sprawa, której dotyczy; kształt ustala właściciel (u29). */
export interface DanePytaniaDoZus {
  idSprawy?: IdSprawy;
  tresc: string;
}

/** Wysłanie pytania przez PUE/eZUS (0133 przy pueEzusNiedostepne). */
export function wyslijPytanieDoZus(dane: DanePytaniaDoZus, ctx: KontekstOperacji): WynikOperacji<PytanieDoZus> {
  return { ok: false, kod: '0003' };
}

/** Odczyt danych konta ubezpieczonego na ViewZusAccountData (0002 przy daneZusNiedostepne). */
export async function odczytajDaneKontaUbezpieczonego(ctx: KontekstOperacji): Promise<WynikOperacji> {
  return { ok: false, kod: '0003' };
}

/** Złożenie wniosku o odpis w rejestrze stanu cywilnego (0147 przy rejestrStanuCywilnegoNiedostepny). */
export async function zlozWniosekOOdpis(id: IdWniosku, ctx: KontekstOperacji): Promise<WynikOperacji<{ potwierdzenie: string }>> {
  return { ok: false, kod: '0003' };
}
