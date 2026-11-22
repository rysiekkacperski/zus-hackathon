// Akcja po odczycie Danych z konta ZUS `obsluzNoweDzieci` (kontrakt, sekcja 6.5). Właściciel: u19 (Pakiet narodzin).
// Nowe dziecko w kopii Danych z konta ZUS matki:
// - bez potwierdzonej daty porodu: stan „nowe dziecko oczekuje” (okno ModalNewChildDetected na ViewFamilyPlan);
// - z potwierdzoną datą równą dacie urodzenia: imię, nazwisko i PESEL w profilu bez okna, K05 załatwiona
//   (krok planu pakietNarodzin po przeliczeniu);
// - z potwierdzoną datą różną od daty urodzenia: stan oczekujący, który prowadzi do ViewBirthDate z 0063.
import { dzieciZTaSamaData, porownajZDanymiZus } from '@/domena/rodzina/narodziny';
import type { CzlonekRodzinyZus, DaneCiazyIDziecka } from '@/domena/typy';
import { przeliczRodzine } from '@/dane/magazyn/operacje/przeliczenie';
import type { AkcjaPoOdczycieDanychZus } from '@/dane/magazyn/operacje/po-odczycie-zus/typ';
import { odczytajStanKonta, osobyRodziny, rodzinaKonta, wykonajOperacje, zapiszStanRodziny } from '@/dane/magazyn/stan';

function pusteDane(): DaneCiazyIDziecka {
  return { dataPoroduPotwierdzona: false, dzieci: [], sytuacjeSzczegolne: [], spokojnyTryb: { wlaczony: false } };
}

function tePeseleOczekuja(dane: DaneCiazyIDziecka, dzieci: readonly CzlonekRodzinyZus[]): boolean {
  const oczekujace = dane.noweDzieckoOczekujace?.dzieci ?? [];
  return oczekujace.length === dzieci.length && dzieci.every((d) => oczekujace.some((o) => o.pesel === d.pesel));
}

export const obsluzNoweDzieci: AkcjaPoOdczycieDanychZus = (pesel, ctx) => {
  const stanKonta = odczytajStanKonta(pesel);
  const nowe = (stanKonta?.kopiaDanychZus?.czlonkowieRodziny ?? []).filter((c) => c.noweDziecko);
  if (stanKonta === null || nowe.length === 0) return;
  const rodzina = rodzinaKonta(stanKonta.konto);
  if (rodzina === null || osobyRodziny(rodzina.daneRodziny).peselMatki !== pesel) return;

  const wynik = wykonajOperacje(() => {
    const dane = rodzina.daneCiazy ?? pusteDane();
    const dzieci = dzieciZTaSamaData(nowe);
    const dataPorodu = dane.dataPoroduPotwierdzona ? dane.dataPorodu : undefined;

    if (dataPorodu !== undefined && porownajZDanymiZus(dataPorodu, nowe) === null) {
      const zgodne = nowe.filter((d) => d.dataUrodzenia === dataPorodu);
      const pesele = new Set(zgodne.map((d) => d.pesel));
      const { noweDzieckoOczekujace, ...reszta } = dane;
      void noweDzieckoOczekujace;
      const zachowane = dane.dzieci.filter((d) => d.zrodlo === 'konto-zus' && d.pesel !== undefined && !pesele.has(d.pesel));
      zapiszStanRodziny({
        ...rodzina,
        daneCiazy: {
          ...reszta,
          dzieci: [
            ...zachowane,
            ...zgodne.map((d) => ({
              imie: d.imie, nazwisko: d.nazwisko, pesel: d.pesel, dataUrodzenia: d.dataUrodzenia, zrodlo: 'konto-zus' as const,
            })),
          ],
        },
      });
      const przeliczenie = przeliczRodzine(rodzina.idRodziny, ctx);
      if (!przeliczenie.ok) throw new Error('Przeliczenie po zapisie dziecka z danych ZUS nie powiodło się.');
      return;
    }

    if (tePeseleOczekuja(dane, dzieci)) return;
    zapiszStanRodziny({ ...rodzina, daneCiazy: { ...dane, noweDzieckoOczekujace: { dzieci, wykryto: ctx.teraz } } });
  });
  if (!wynik.ok) throw new Error('Zapis nowego dziecka z danych ZUS nie powiódł się.');
};
