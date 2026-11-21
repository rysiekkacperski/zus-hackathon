// Narodziny dziecka: data porodu, okno nowego dziecka, dane dziecka (kontrakt, sekcja 6.5). Właściciel: u19 (Pakiet narodzin).
// Zaślepka fundamentu: implementuje u19. Właściciel zastępuje treść z zachowaniem nazw eksportów i podpisów. Zaślepka zwraca 0003.
// obsluzNoweDzieci leży w rejestrze po-odczycie-zus (plik u19) i jest tu reeksportowana.
/* eslint-disable @typescript-eslint/no-unused-vars -- parametry zaślepki; właściciel usuwa ten wiersz */
import type { FormularzDanychDziecka, FormularzDatyPorodu } from '@/domena/rodzina/narodziny';
import type { KontekstOperacji, WynikOperacji } from '@/domena/typy';

export { obsluzNoweDzieci } from '@/dane/magazyn/operacje/po-odczycie-zus/obsluz-nowe-dzieci';

/** Potwierdzenie daty porodu (0057 albo 0126 po przejściu). */
export function potwierdzDatePorodu(dane: FormularzDatyPorodu, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Potwierdzenie nowego dziecka z okna ModalNewChildDetected. */
export function potwierdzZOkna(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

/** Zamknięcie okna ModalNewChildDetected bez potwierdzenia. */
export function zamknijOkno(ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}

export function zapiszDaneDziecka(dane: FormularzDanychDziecka, ctx: KontekstOperacji): WynikOperacji {
  return { ok: false, kod: '0003' };
}
