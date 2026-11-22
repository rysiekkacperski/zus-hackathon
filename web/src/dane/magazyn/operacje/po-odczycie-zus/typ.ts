// Podpis akcji po odczycie Danych z konta ZUS (kontrakt, sekcja 6.5): OdczytPrzyOtwarciu wywołuje ją
// po udanym odczycie kopii konta o numerze `pesel`, z kontekstem operacji z obsługi zdarzenia.
import type { KontekstOperacji, Pesel } from '@/domena/typy';

export type AkcjaPoOdczycieDanychZus = (pesel: Pesel, ctx: KontekstOperacji) => void;
