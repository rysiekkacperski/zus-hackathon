'use client';

// Część ViewProfileSummary w trybie rodziny: zakładka „Dane planu” z kartą „Dane, z których powstał plan”
// (wzór Plan-rodziny). Teksty: teksty.ViewFamilyPlan.daneProfilu. Właściciel: u11.
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { formatujDate } from '@/domena/daty';
import { formatujKwote } from '@/domena/kwoty';
import type { DanaZeZrodla, ZrodloDanej } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { ListaDefinicji, type PozycjaListyDefinicji } from '@/komponenty/lista-definicji';
import { teksty } from '@/teksty';
import { nazwaFormy } from '@/app/(strefa)/plan-rodziny/_czesci/sprawy';

const d = teksty.ViewFamilyPlan.daneProfilu;

function zZrodlem(wartosc: string, dana: DanaZeZrodla<unknown> | null | undefined): string {
  if (!dana) return wartosc;
  const zrodlo = d.zrodla[dana.zrodlo as ZrodloDanej];
  return zrodlo ? d.zZrodlem({ wartosc, zrodlo }) : wartosc;
}

export function KartaDanychPlanu({ kontekst }: { kontekst: KontekstRodziny }) {
  const { rodzina, daneZusMatki } = kontekst;
  const dane = rodzina.daneRodziny;
  const ciaza = rodzina.daneCiazy;
  const pozycje: PozycjaListyDefinicji[] = [];
  if (daneZusMatki) pozycje.push({ etykieta: d.matka, wartosc: `${daneZusMatki.imie} ${daneZusMatki.nazwisko}` });
  const formaMatki = dane.matka.formaZatrudnienia;
  if (formaMatki) pozycje.push({ etykieta: d.formaMatki, wartosc: zZrodlem(nazwaFormy(formaMatki.wartosc), formaMatki) });
  const duch = dane.matka.dobrowolneChorobowe;
  if (duch && (formaMatki?.wartosc === 'jdg' || formaMatki?.wartosc === 'umowa-zlecenia')) {
    pozycje.push({ etykieta: d.duch, wartosc: zZrodlem(duch.wartosc ? d.tak : d.nie, duch) });
  }
  const formaDrugiego = dane.drugiRodzic.formaZatrudnienia;
  if (formaDrugiego) {
    const imie = [dane.drugiRodzic.imie, dane.drugiRodzic.nazwisko].filter(Boolean).join(' ');
    const forma = nazwaFormy(formaDrugiego.wartosc);
    pozycje.push({
      etykieta: d.drugiRodzic,
      wartosc:
        formaDrugiego.wartosc === 'brak-drugiego-rodzica' || !imie ? forma : d.osobaZForma({ osoba: imie, forma: forma.toLowerCase() }),
    });
  }
  if (dane.stanCywilny) pozycje.push({ etykieta: d.stanCywilny, wartosc: d.stanyCywilne[dane.stanCywilny.wartosc] });
  if (ciaza?.dataPoroduPotwierdzona && ciaza.dataPorodu) {
    pozycje.push({ etykieta: d.dataPorodu, wartosc: formatujDate(ciaza.dataPorodu) });
  } else if (ciaza?.przewidywanyTerminPorodu) {
    pozycje.push({ etykieta: d.ptp, wartosc: formatujDate(ciaza.przewidywanyTerminPorodu) });
  }
  if (ciaza?.dataPierwszejWizyty) {
    pozycje.push({
      etykieta: d.wizyta,
      wartosc: ciaza.dataPierwszejWizyty === 'brak-wizyty' ? d.brakWizyty : formatujDate(ciaza.dataPierwszejWizyty),
    });
  }
  if (dane.dochodNaOsobe) {
    const dochod = dane.dochodNaOsobe.wartosc;
    pozycje.push({ etykieta: d.dochod, wartosc: dochod === 'nieznany' ? d.dochodNieznany : formatujKwote(dochod) });
  }
  if (ciaza) pozycje.push({ etykieta: d.liczbaDzieci, wartosc: String(ciaza.liczbaUrodzonychDzieci ?? ciaza.liczbaDzieciZCiazy ?? 1) });

  return (
    <Karta tytul={d.tytul} bezLinii>
      <div className="flex flex-col gap-6">
        <ListaDefinicji pozycje={pozycje} />
        <p className="m-0 text-body">{d.przelicz}</p>
      </div>
    </Karta>
  );
}
