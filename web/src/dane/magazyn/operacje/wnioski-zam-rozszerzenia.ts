// Wniosek ZAM dla płatnika składek i przeliczenie po porodzie (kontrakt, sekcja 6.5).
// Właściciel: u33 (ZAM: wniosek dla płatnika, przed porodem i przy przyjęciu dziecka).
// Zaślepka fundamentu: implementuje u33. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { IdWniosku, KontekstOperacji, WynikOperacji } from '@/domena/typy';

/** Wniosek przygotowany dla płatnika składek (stan przygotowany, oznaczenie „wniosek przygotowany”). */
export function przygotujZamDlaPlatnika(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Przeliczenie wniosku złożonego przed porodem po potwierdzeniu daty porodu (0231). */
export function przeliczZamPoPorodzie(id: IdWniosku, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
