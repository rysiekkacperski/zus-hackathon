'use client';

// ViewProfileSecondParent (historyjka 3.3.1.2.3, wzory cz1/P03-22 i cz1/P03-23). Właściciel: u11.
// Krok 6 z 7 profilu na start: forma zatrudnienia drugiego rodzica i jego dobrowolne ubezpieczenie
// chorobowe przy umowie zlecenia i jednoosobowej działalności. Przejście dalej zapisuje dane drugiego
// rodzica w szkicu ze źródłem odpowiedź rodzica i prowadzi do ViewProfileSummary (KA-03 do KA-08).
// Przy umowie zlecenia i działalności ekran ma dwie części (?czesc=N): forma zatrudnienia, potem dobrowolne
// ubezpieczenie chorobowe.
import { useEffect, useRef, useState } from 'react';
import { useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { rozpocznijZmianeProfilu, zapiszSzkic } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { czesciDrugiegoRodzica } from '@/domena/profil/nawigacja';
import {
  FORMY_DRUGIEGO_RODZICA,
  czyPytacODobrowolne,
  drugiRodzicZFormularza,
  formularzDrugiegoRodzica,
  walidujDrugiegoRodzica,
  type FormularzDrugiegoRodzica,
  type PoleDrugiegoRodzica,
} from '@/domena/profil/zapis';
import type { FormaZatrudnieniaDrugiegoRodzica, IdWidoku, KodKomunikatu, SzkicProfilu } from '@/domena/typy';
import { CzescFormularza, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import { SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { sciezkaPowrotuProfilu } from '../_czesci/trasy-profilu';

const t = teksty.ViewProfileSecondParent;
const EKRAN: IdWidoku = 'ViewProfileSecondParent';
const NAZWA_FORMY = 'forma-drugiego-rodzica';
const NAZWA_DOBROWOLNEGO = 'dobrowolne-drugiego-rodzica';

const opcjeFormy = FORMY_DRUGIEGO_RODZICA.map((wartosc) => ({ wartosc, etykieta: t.formy[wartosc] }));
const opcjeDobrowolnego = [
  { wartosc: 'tak' as const, etykieta: t.odpowiedziDobrowolnego.tak },
  { wartosc: 'nie' as const, etykieta: t.odpowiedziDobrowolnego.nie },
];
const PODZIAL: readonly (readonly PoleDrugiegoRodzica[])[] = [['forma'], ['dobrowolne']];

function podpowiedzDobrowolnego(forma: FormaZatrudnieniaDrugiegoRodzica | null): string | undefined {
  if (forma === 'umowa-zlecenia' || forma === 'jdg') return t.podpowiedziDobrowolnego[forma];
  return undefined;
}

export function WidokDrugiegoRodzica() {
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const szkic = stanKonta?.szkicProfilu ?? null;
  const rola = stanKonta?.konto.rola ?? null;
  const zmianaProfilu = rola !== null && rola !== 'nowy-uzytkownik';

  // Formularz startuje z odpowiedzi w szkicu, a w trybie zmiany profilu bez szkicu z zapisanego profilu.
  const [formularz, setFormularz] = useState<FormularzDrugiegoRodzica>(() =>
    formularzDrugiegoRodzica(szkic?.daneRodziny.drugiRodzic ?? rodzina?.daneRodziny.drugiRodzic),
  );
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety: setZajety, przejdz } = useNawigacjaZLadowaniem();
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: formularz,
    waliduj: walidujDrugiegoRodzica,
    pola: { forma: NAZWA_FORMY, dobrowolne: NAZWA_DOBROWOLNEGO },
  });
  const czesci = useCzesciFormularza({ liczba: czesciDrugiegoRodzica(formularz.forma), podzial: PODZIAL, walidacja });
  const zDanymiZus = (stanKonta?.kopiaDanychZus ?? null) !== null;
  const zapisanoOstatniEkran = useRef(false);

  // Szkic zapamiętuje ostatni wyświetlony ekran, żeby po ponownym otwarciu przewodnika wrócić na ten krok.
  useEffect(() => {
    if (zapisanoOstatniEkran.current || szkic === null || szkic.ostatniEkran === EKRAN) return;
    zapisanoOstatniEkran.current = true;
    zapiszSzkic({}, EKRAN, pobierzKontekstOperacji());
  }, [szkic]);

  const powrotNaPodsumowanie = zmianaProfilu || (szkic?.powrotNaPodsumowanie ?? false);
  const adresPodsumowania = trasy.ViewProfileSummary({ tryb: zmianaProfilu ? 'rodzina' : 'start' });

  function zapiszFormularz(nowy: FormularzDrugiegoRodzica, biezacySzkic: SzkicProfilu | null, ekran = EKRAN) {
    if (biezacySzkic === null) return null;
    return zapiszSzkic(
      {
        daneRodziny: {
          ...biezacySzkic.daneRodziny,
          drugiRodzic: drugiRodzicZFormularza(nowy, biezacySzkic.daneRodziny.drugiRodzic),
        },
      },
      ekran,
      pobierzKontekstOperacji(),
    );
  }

  function zmien(nowy: FormularzDrugiegoRodzica) {
    setFormularz(nowy);
    // Autozapis zachowuje odpowiedź bieżącego ekranu, gdy rodzic zamknie przewodnik przed przejściem dalej.
    zapiszFormularz(nowy, szkic);
  }

  function zmienForme(forma: FormaZatrudnieniaDrugiegoRodzica) {
    const dobrowolne = czyPytacODobrowolne(forma) ? formularz.dobrowolne : null;
    zmien({ forma, dobrowolne });
  }

  function zmienDobrowolne(odpowiedz: 'tak' | 'nie') {
    zmien({ ...formularz, dobrowolne: odpowiedz === 'tak' });
  }

  function przejdzDalej() {
    setBladZapisu(null);
    setZajety(true);
    const ctx = pobierzKontekstOperacji();
    let biezacySzkic = szkic;
    // Rodzic, który zmienia zapisany profil, pracuje na szkicu zmiany profilu.
    if (zmianaProfilu && (biezacySzkic === null || biezacySzkic.kontekst !== 'zmiana-profilu')) {
      const start = rozpocznijZmianeProfilu(ctx);
      biezacySzkic = start.ok ? start.wartosc : null;
    }
    const wynik = zapiszFormularz(formularz, biezacySzkic, 'ViewProfileSummary');
    if (wynik === null || !wynik.ok) {
      setZajety(false);
      setBladZapisu(wynik === null ? '0003' : wynik.kod);
      return;
    }
    przejdz(adresPodsumowania);
  }

  function wroc() {
    if (powrotNaPodsumowanie) {
      przejdz(adresPodsumowania);
      return;
    }
    przejdz(sciezkaPowrotuProfilu('ViewProfileFamily', szkic, zDanymiZus));
  }

  const pytajODobrowolne = czyPytacODobrowolne(formularz.forma);
  const wartoscDobrowolnego = formularz.dobrowolne === null ? null : formularz.dobrowolne ? 'tak' : 'nie';

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={false} />
      <SzkieletKreatoraProfilu
        biezacy={EKRAN}
        czesc={czesci.czesc}
        liczbaCzesci={czesci.liczba}
        onDalej={() => czesci.dalej(przejdzDalej)}
        onWroc={() => czesci.wroc(wroc)}
        zajety={zajety}
      >
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        <Karta tytul={t.tytulKarty} bezLinii>
          <p className="m-0 mb-6">{t.opisKarty}</p>
          <Stos odstep={6}>
            <CzescFormularza czesci={czesci} numer={1}>
              <GrupaOpcji
                nazwa={NAZWA_FORMY}
                legenda={t.legendaFormy}
                opcje={opcjeFormy}
                wartosc={formularz.forma}
                onZmiana={zmienForme}
                {...walidacja.pole('forma')}
                className="max-w-135"
              />
              {formularz.forma === 'umowa-o-prace' ? (
                <Notatka>
                  <p>{t.notatkaUmowyOPrace}</p>
                </Notatka>
              ) : null}
            </CzescFormularza>
            <CzescFormularza czesci={czesci} numer={2}>
              {pytajODobrowolne ? (
                <GrupaOpcji
                  nazwa={NAZWA_DOBROWOLNEGO}
                  legenda={t.legendaDobrowolnego}
                  podpowiedz={podpowiedzDobrowolnego(formularz.forma)}
                  opcje={opcjeDobrowolnego}
                  wartosc={wartoscDobrowolnego}
                  onZmiana={zmienDobrowolne}
                  {...walidacja.pole('dobrowolne')}
                  uklad="poziomo"
                  className="max-w-135"
                />
              ) : null}
            </CzescFormularza>
          </Stos>
        </Karta>
      </SzkieletKreatoraProfilu>
    </>
  );
}
