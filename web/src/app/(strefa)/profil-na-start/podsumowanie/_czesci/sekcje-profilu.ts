// Część ViewProfileSummary: sekcje podsumowania profilu z wierszami do pokazania (wzory cz1/P03-24,
// cz1/Profil-rodziny i cz1/P03-26). Właściciel: u11. Funkcja jest czysta: zamienia odpowiedzi profilu
// albo szkicu na teksty wierszy, a widok porównuje je z zapisanym profilem.
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import type {
  DaneCiazyIDziecka,
  DaneRodzica,
  DrugiRodzic,
  IdWidoku,
  SzkicProfilu,
  ZrodloDanej,
} from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewProfileSummary;

export type IdSekcjiProfilu = 'formaIPlatnik' | 'daneCiazy' | 'daneRodziny' | 'drugiRodzic';

export interface AkcjaWiersza {
  etykieta: string;
  ekran: IdWidoku;
}

export interface WierszProfilu {
  klucz: string;
  etykieta: string;
  wartosc: string;
  /** Źródło pokazywane przy danej z konta ZUS albo z pełnomocnictwa PEL. */
  zrodlo?: ZrodloDanej;
  opis?: string;
  akcja?: AkcjaWiersza;
  /** Wiersz bez odpowiedzi rodzica (wartość „Nie podano”); zakładka sekcji pokazuje wskaźnik błędu. */
  brak?: boolean;
  /** Wiersz zmiany zatrudnienia w ciąży, który zakładki podsumowania mogą przenieść do osobnej zakładki. */
  czesc?: 'zmianaZatrudnienia';
}

export interface SekcjaProfilu {
  id: IdSekcjiProfilu;
  tytul: string;
  etykietaZmiany: string;
  /** Ekran sekcji otwierany akcją „Zmień”. */
  ekran: IdWidoku;
  wiersze: WierszProfilu[];
  /** Notatka w sekcji, np. brak zgody na dane dotyczące zdrowia. */
  notatka?: string;
}

export interface ProfilDoPokazania {
  daneRodziny: SzkicProfilu['daneRodziny'];
  daneCiazy: Partial<DaneCiazyIDziecka> | null;
}

function zrodloDoPokazania(zrodlo: ZrodloDanej | undefined): ZrodloDanej | undefined {
  return zrodlo === 'konto-zus' || zrodlo === 'pelnomocnictwo-pel' ? zrodlo : undefined;
}

function tekstPlatnika(matka: Partial<DaneRodzica>): { wartosc: string; opis?: string } {
  const forma = matka.formaZatrudnienia?.wartosc;
  const platnik = matka.platnikZasilku;
  if (forma === 'jdg') return { wartosc: t.platnicy.zus, opis: t.opisyPlatnika.jdg };
  if (forma === 'brak-tytulu') return { wartosc: t.platnicy['brak-platnika'], opis: t.opisyPlatnika.brakPlatnika };
  if (!platnik) return { wartosc: t.platnicy.nieustalony };
  switch (platnik.wartosc) {
    case 'zus':
      return {
        wartosc: t.platnicy.zus,
        opis: platnik.nazwaPlatnika ? t.opisyPlatnika.zusZNazwa({ nazwa: platnik.nazwaPlatnika }) : undefined,
      };
    case 'platnik-skladek':
      return { wartosc: platnik.nazwaPlatnika ?? t.opisyPlatnika.platnikSkladek, opis: platnik.nazwaPlatnika ? t.opisyPlatnika.platnikSkladek : undefined };
    case 'nieustalony':
      return { wartosc: t.platnicy.nieustalony, opis: t.opisyPlatnika.nieustalony };
    case 'brak-platnika':
      return { wartosc: t.platnicy['brak-platnika'], opis: t.opisyPlatnika.brakPlatnika };
  }
}

function sekcjaFormyIPlatnika(matka: Partial<DaneRodzica>): SekcjaProfilu {
  const forma = matka.formaZatrudnienia;
  const wiersze: WierszProfilu[] = [
    {
      klucz: 'forma',
      etykieta: t.pola.formaZatrudnienia,
      wartosc: forma ? t.formy[forma.wartosc] : t.nieUstalono,
      zrodlo: zrodloDoPokazania(forma?.zrodlo),
    },
  ];
  if (forma?.wartosc === 'umowa-zlecenia' || forma?.wartosc === 'jdg') {
    const dobrowolne = matka.dobrowolneChorobowe;
    wiersze.push({
      klucz: 'dobrowolne',
      etykieta: t.pola.dobrowolne,
      wartosc: dobrowolne ? (dobrowolne.wartosc ? t.dobrowolneMatki.tak : t.dobrowolneMatki.nie) : t.nieUstalono,
      zrodlo: zrodloDoPokazania(dobrowolne?.zrodlo),
    });
  } else if (forma?.wartosc === 'umowa-o-prace') {
    wiersze.push({ klucz: 'chorobowe', etykieta: t.pola.ubezpieczenieChorobowe, wartosc: t.chorobowePracownika });
  }
  const platnik = tekstPlatnika(matka);
  wiersze.push({ klucz: 'platnik', etykieta: t.pola.platnik, ...platnik });
  return {
    id: 'formaIPlatnik',
    tytul: t.sekcje.formaIPlatnik,
    etykietaZmiany: t.zmienSekcje.formaIPlatnik,
    ekran: 'ViewProfileZusData',
    wiersze,
  };
}

function tekstZmianyZatrudnienia(matka: Partial<DaneRodzica>): WierszProfilu[] {
  const zmiana = matka.zmianaZatrudnienia;
  const akcja: AkcjaWiersza = { etykieta: t.zmienZmianeZatrudnienia, ekran: 'ViewProfileEmploymentChange' };
  if (!zmiana) return [];
  const rodzaj = zmiana.rodzaj.wartosc;
  let wartosc: string = t.zmianyZatrudnienia['bez-zmian'];
  if (rodzaj !== 'bez-zmian' && zmiana.forma && zmiana.data) {
    const parametry = { forma: t.formyWDopelniaczu[zmiana.forma.wartosc], data: formatujDate(zmiana.data.wartosc) };
    wartosc = rodzaj === 'rozpoczecie' ? t.zmianyZatrudnienia.rozpoczecie(parametry) : t.zmianyZatrudnienia.ustanie(parametry);
  }
  const wiersze: WierszProfilu[] = [
    {
      klucz: 'zmiana',
      etykieta: t.pola.zmianaZatrudnienia,
      wartosc,
      zrodlo: zrodloDoPokazania(zmiana.data?.zrodlo ?? zmiana.rodzaj.zrodlo),
      akcja,
    },
  ];
  if (rodzaj === 'ustanie' && zmiana.przyczyna) {
    wiersze.push({
      klucz: 'przyczyna',
      etykieta: t.pola.przyczynaUstania,
      wartosc: t.przyczynyUstania[zmiana.przyczyna.wartosc],
    });
  }
  if (rodzaj === 'ustanie' && zmiana.inneZatrudnienie) {
    wiersze.push({
      klucz: 'inne-zatrudnienie',
      etykieta: t.pola.inneZatrudnienie,
      wartosc: zmiana.inneZatrudnienie.wartosc ? t.takNie.tak : t.takNie.nie,
    });
  }
  return wiersze;
}

/** Ekran sekcji danych ciąży właściwy dla sytuacji rodzica. */
export function ekranDanychCiazy(sytuacja: string | undefined): IdWidoku {
  if (sytuacja === 'narodziny') return 'ViewBirthDate';
  if (sytuacja === 'przyjecie') return 'ViewProfileChildAdoption';
  if (sytuacja === 'oczekiwanie') return 'ViewProfilePregnancy';
  return 'ViewProfileSituation';
}

function sekcjaDanychCiazy(p: ProfilDoPokazania, zgoda: boolean): SekcjaProfilu {
  const sytuacja = p.daneRodziny.sytuacja?.wartosc;
  const ciaza = p.daneCiazy ?? {};
  const wiersze: WierszProfilu[] = [
    {
      klucz: 'sytuacja',
      etykieta: t.pola.sytuacja,
      wartosc: sytuacja ? t.sytuacje[sytuacja] : t.nieUstalono,
      akcja: { etykieta: t.zmienSytuacje, ekran: 'ViewProfileSituation' },
    },
  ];
  if (zgoda && sytuacja === 'oczekiwanie') {
    wiersze.push(
      {
        klucz: 'termin',
        etykieta: t.pola.termin,
        wartosc: ciaza.przewidywanyTerminPorodu ? formatujDate(ciaza.przewidywanyTerminPorodu) : t.nieUstalono,
      },
      {
        klucz: 'liczba-dzieci',
        etykieta: t.pola.liczbaDzieci,
        wartosc: t.liczbyDzieci[String(ciaza.liczbaDzieciZCiazy ?? 1) as keyof typeof t.liczbyDzieci],
      },
      {
        klucz: 'wizyta',
        etykieta: t.pola.wizyta,
        wartosc:
          ciaza.dataPierwszejWizyty === 'brak-wizyty'
            ? t.wizytaNieOdbylaSie
            : ciaza.dataPierwszejWizyty
              ? formatujDate(ciaza.dataPierwszejWizyty)
              : t.nieUstalono,
      },
    );
  }
  if (zgoda && sytuacja === 'narodziny') {
    wiersze.push(
      {
        klucz: 'data-porodu',
        etykieta: t.pola.dataPorodu,
        wartosc: ciaza.dataPorodu ? formatujDate(ciaza.dataPorodu) : t.nieUstalono,
      },
      {
        klucz: 'liczba-urodzonych',
        etykieta: t.pola.liczbaUrodzonychDzieci,
        wartosc: t.liczbyDzieci[String(ciaza.liczbaUrodzonychDzieci ?? 1) as keyof typeof t.liczbyDzieci],
      },
    );
  }
  if (zgoda && (sytuacja === 'oczekiwanie' || sytuacja === 'narodziny')) {
    wiersze.push(
      ...tekstZmianyZatrudnienia(p.daneRodziny.matka ?? {}).map((w): WierszProfilu => ({ ...w, czesc: 'zmianaZatrudnienia' })),
    );
  }
  return {
    id: 'daneCiazy',
    tytul: t.sekcje.daneCiazy,
    etykietaZmiany: t.zmienSekcje.daneCiazy,
    // Dane przyjęcia dziecka rodzic podaje także bez zgody na dane dotyczące zdrowia (KA-01 3.3.1.4.2).
    ekran: zgoda || sytuacja === 'przyjecie' ? ekranDanychCiazy(sytuacja) : 'ViewProfileSituation',
    wiersze,
    notatka: zgoda || sytuacja === 'przyjecie' ? undefined : teksty.komunikaty['0004'],
  };
}

function sekcjaDanychRodziny(d: SzkicProfilu['daneRodziny']): SekcjaProfilu {
  const wiersze: WierszProfilu[] = [
    {
      klucz: 'stan-cywilny',
      etykieta: t.pola.stanCywilny,
      wartosc: d.stanCywilny ? t.stanyCywilne[d.stanCywilny.wartosc] : t.nieUstalono,
    },
  ];
  if (d.stanCywilny?.wartosc === 'nie-malzenstwo') {
    wiersze.push({
      klucz: 'ojcostwo',
      etykieta: t.pola.uznanieOjcostwa,
      wartosc: d.uznanieOjcostwa ? t.uznaniaOjcostwa[d.uznanieOjcostwa.wartosc] : t.nieUstalono,
    });
  }
  const gmina = d.gmina?.wartosc;
  wiersze.push(
    {
      klucz: 'gmina',
      etykieta: t.pola.gmina,
      wartosc: gmina ? t.gmina({ nazwa: gmina.nazwa, powiat: gmina.powiat, wojewodztwo: gmina.wojewodztwo }) : t.nieUstalono,
    },
    {
      klucz: 'dochod',
      etykieta: t.pola.dochod,
      wartosc: !d.dochodNaOsobe
        ? t.nieUstalono
        : d.dochodNaOsobe.wartosc === 'nieznany'
          ? t.dochodNieznany
          : formatujKwote(d.dochodNaOsobe.wartosc),
    },
  );
  return {
    id: 'daneRodziny',
    tytul: t.sekcje.daneRodziny,
    etykietaZmiany: t.zmienSekcje.daneRodziny,
    ekran: 'ViewProfileFamily',
    wiersze,
  };
}

function sekcjaDrugiegoRodzica(dr: Partial<DrugiRodzic> | undefined): SekcjaProfilu {
  const forma = dr?.formaZatrudnienia;
  const wiersze: WierszProfilu[] = [
    {
      klucz: 'forma-drugiego',
      etykieta: t.pola.formaZatrudnienia,
      wartosc: forma ? t.formy[forma.wartosc] : t.nieUstalono,
      zrodlo: zrodloDoPokazania(forma?.zrodlo),
    },
  ];
  if (forma?.wartosc === 'umowa-zlecenia' || forma?.wartosc === 'jdg') {
    const dobrowolne = dr?.dobrowolneChorobowe;
    wiersze.push({
      klucz: 'dobrowolne-drugiego',
      etykieta: t.pola.dobrowolne,
      wartosc: dobrowolne
        ? dobrowolne.wartosc
          ? t.dobrowolneDrugiegoRodzica.tak
          : t.dobrowolneDrugiegoRodzica.nie
        : t.nieUstalono,
      zrodlo: zrodloDoPokazania(dobrowolne?.zrodlo),
    });
  }
  return {
    id: 'drugiRodzic',
    tytul: t.sekcje.drugiRodzic,
    etykietaZmiany: t.zmienSekcje.drugiRodzic,
    ekran: 'ViewProfileSecondParent',
    wiersze,
  };
}

/** Cztery sekcje podsumowania profilu w kolejności ze wzoru; wiersz z wartością „Nie podano” ma znacznik braku. */
export function sekcjeProfilu(p: ProfilDoPokazania, zgoda: boolean): SekcjaProfilu[] {
  return [
    sekcjaFormyIPlatnika(p.daneRodziny.matka ?? {}),
    sekcjaDanychCiazy(p, zgoda),
    sekcjaDanychRodziny(p.daneRodziny),
    sekcjaDrugiegoRodzica(p.daneRodziny.drugiRodzic),
  ].map((s) => ({ ...s, wiersze: s.wiersze.map((w) => (w.wartosc === t.nieUstalono ? { ...w, brak: true } : w)) }));
}

/** Wartości wierszy zapisanego profilu według sekcji i klucza wiersza, do oznaczenia zmian. */
export function wartosciWierszy(sekcje: SekcjaProfilu[]): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const s of sekcje) for (const w of s.wiersze) mapa.set(`${s.id}.${w.klucz}`, w.wartosc);
  return mapa;
}
