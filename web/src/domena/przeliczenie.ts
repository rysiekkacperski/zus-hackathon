// Przeliczenie stanu rodziny (kontrakt, sekcja 6.7 i 7.1).
// Kolejność: wyliczPlan (u08) → wyliczTerminy (u13) → zaplanujPrzypomnienia (u18).
// Operacja magazynu przeliczRodzine składa WejsciePlanu, woła przeliczStanRodziny i zapisuje wynik.
import { wyliczPlan } from '@/domena/plan/wylicz-plan';
import { zaplanujPrzypomnienia } from '@/domena/przypomnienia/planowanie';
import { wyliczTerminy } from '@/domena/terminy/wylicz-terminy';
import type {
  DaneCiazyIDziecka,
  DaneDrugiegoRodzicaZKonta,
  DaneRodziny,
  DaneZKontaZus,
  DataISO,
  KalendarzTerminow,
  Katalog,
  ParametrySystemu,
  Pesel,
  PlanRodziny,
  Powiadomienie,
  Ustawienia,
  Wniosek,
  WynikiKalkulacji,
  ZnacznikCzasu,
} from '@/domena/typy';

export interface WejsciePlanu {
  daneRodziny: DaneRodziny;
  daneCiazy: DaneCiazyIDziecka | null;
  zgoda: boolean;
  katalog: Katalog;
  daneZusMatki: DaneZKontaZus | null;
  daneZusDrugiegoRodzica: DaneZKontaZus | DaneDrugiegoRodzicaZKonta | null;
  wnioski: Wniosek[];
  wynikiKalkulacji: WynikiKalkulacji;
  poprzedniPlan: PlanRodziny | null;
  dzis: DataISO;
  teraz: ZnacznikCzasu;
  parametry: Pick<ParametrySystemu, 'progPodwyzszeniaPodstawyProcent' | 'progOstrzezeniaOkresuZasilkowegoDni'>;
}

export interface WynikPrzeliczenia {
  plan: PlanRodziny;
  kalendarz: KalendarzTerminow;
  przypomnienia: Record<Pesel, Powiadomienie[]>;
}

// Filtr zgody: Dane ciąży i dziecka biorą udział w wyliczeniach wyłącznie przy udzielonej zgodzie
// i do chwili wyłączenia ich z użycia po wycofaniu zgody.
export function daneCiazyDoUzycia(daneCiazy: DaneCiazyIDziecka | null, zgoda: boolean): DaneCiazyIDziecka | null {
  if (!zgoda || daneCiazy === null || daneCiazy.wylaczoneZUzycia !== undefined) return null;
  return daneCiazy;
}

export function przeliczStanRodziny(
  w: WejsciePlanu,
  ustawienia: Record<Pesel, Ustawienia | null>,
  poprzedniePowiadomienia: Record<Pesel, Powiadomienie[]>,
): WynikPrzeliczenia {
  const wejscie: WejsciePlanu = { ...w, daneCiazy: daneCiazyDoUzycia(w.daneCiazy, w.zgoda) };
  const plan = wyliczPlan(wejscie);
  const kalendarz = wyliczTerminy({
    plan,
    daneCiazy: wejscie.daneCiazy,
    daneRodziny: wejscie.daneRodziny,
    katalog: wejscie.katalog,
    dzis: wejscie.dzis,
    teraz: wejscie.teraz,
  });
  const przypomnienia = zaplanujPrzypomnienia({
    plan,
    kalendarz,
    daneRodziny: wejscie.daneRodziny,
    ustawienia,
    poprzednie: poprzedniePowiadomienia,
    teraz: wejscie.teraz,
  });
  return { plan, kalendarz, przypomnienia };
}
