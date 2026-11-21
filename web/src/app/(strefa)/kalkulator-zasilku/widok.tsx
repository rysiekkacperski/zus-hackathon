'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { walidujDaneWejsciowe } from '@/domena/kalkulatory';
import { dodajMiesiace, formatujDate } from '@/domena/daty';
import type {
  DaneWejscioweKalkulatora,
  FormaPrzyjecia,
  LiczbaDzieci,
  PodstawaWymiaru,
  RodzicWRodzinie,
} from '@/domena/typy';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { trescKomunikatu } from '@/komponenty/typy-komunikatow';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useDzis } from '@/dane/magazyn/hooki';
import { teksty } from '@/teksty';
import { slotyDanychWejsciowych, type PropsSlotu } from './_sloty';
import {
  KOLEJNOSC_POL,
  MAKS_DNI_POBYTU,
  OPCJE_FORMY_DRUGIEGO,
  OPCJE_FORMY_MATKI,
  czyPoprawny,
  formularzZDanych,
  kategoriaWczesniactwa,
  uzupelnijFormularz,
  walidujFormularz,
  zbudujDaneWejsciowe,
  zmienPole,
  type FormularzKalkulatora,
  type OpcjaFormyDrugiego,
  type OpcjaFormyMatki,
  type PoleFormularza,
  type RodzajStraty,
  type WynikWalidacji,
  type Zdarzenie,
} from './_czesci/formularz';
import { useKontekstKalkulatora, type KontekstKalkulatora } from './_czesci/kontekst-kalkulatora';
import { ustawStanRoboczy, useStanRoboczy } from './_czesci/stan-roboczy';
import { ZrodloPola } from './_czesci/zrodlo-pola';

const t = teksty.ViewCalcMaternityInput;
const LICZBY_DZIECI: LiczbaDzieci[] = [1, 2, 3, 4, 5];
const PREFIKS = 'kalk';

// Identyfikator elementu, który dostaje fokus przy błędzie pola.
function idPola(p: PoleFormularza): string {
  if (p === 'zdarzenie') return idOpcjiGrupy(`${PREFIKS}-zdarzenie`, 'porod');
  if (p === 'formaPrzyjecia') return idOpcjiGrupy(`${PREFIKS}-forma-przyjecia`, 'przysposobienie');
  if (p === 'rodzajStraty') return idOpcjiGrupy(`${PREFIKS}-rodzaj-straty`, 'martwe-urodzenie');
  return `${PREFIKS}-${p}`;
}

export function WidokKalkulatoraZasilku() {
  const kontekst = useKontekstKalkulatora();
  if (kontekst === null) return <SzkieletWidoku />;
  return <FormularzKalkulatoraWidok key={kontekst.konto.pesel} kontekst={kontekst} />;
}

function FormularzKalkulatoraWidok({ kontekst }: { kontekst: KontekstKalkulatora }) {
  const router = useRouter();
  const parametryAdresu = useSearchParams();
  const idSprawy = parametryAdresu.get('sprawa');
  const zrodlo = parametryAdresu.get('zrodlo');
  const dzis = useDzis();
  const stanRoboczy = useStanRoboczy(kontekst.konto.pesel);
  const [formularz, ustawFormularz] = useState<FormularzKalkulatora>(() =>
    stanRoboczy
      ? formularzZDanych(stanRoboczy.dane)
      : uzupelnijFormularz({
          konto: kontekst.konto,
          rodzina: kontekst.rodzina,
          kopiaKonta: kontekst.kopiaKonta,
          dzis: kontekst.dzis,
        }),
  );
  const [podstawyZeSlotu, ustawPodstawyZeSlotu] = useState<Partial<Record<RodzicWRodzinie, PodstawaWymiaru>>>({});
  const [walidacja, ustawWalidacje] = useState<WynikWalidacji | null>(null);

  const f = formularz;
  const zdarzenie = f.zdarzenie.wartosc;
  const blad = (p: PoleFormularza) => walidacja?.bledy[p] ?? null;
  const parametryBledu = (p: PoleFormularza) => walidacja?.parametry[p];

  function zmien<P extends PoleFormularza>(nazwa: P, wartosc: FormularzKalkulatora[P]['wartosc']) {
    ustawFormularz((poprzedni) => zmienPole(poprzedni, nazwa, wartosc));
  }

  function uzupelnijZeSlotu(zmiana: Parameters<PropsSlotu<'daneWejsciowe'>['onUzupelnij']>[0]) {
    if (zmiana.dane) {
      const biezace = zbudujDaneWejsciowe(formularz);
      const baza: DaneWejscioweKalkulatora = biezace ?? {
        zdarzenie: { wartosc: formularz.zdarzenie.wartosc ?? 'porod', zrodlo: formularz.zdarzenie.zrodlo },
        liczbaDzieci: formularz.liczbaDzieci,
        zaZyciem: formularz.zaZyciem,
        formaMatki: { wartosc: { forma: 'brak-tytulu', dobrowolne: false }, zrodlo: 'wartosc-domyslna' },
        formaDrugiegoRodzica: { wartosc: { forma: 'brak-tytulu', dobrowolne: false }, zrodlo: 'wartosc-domyslna' },
      };
      ustawFormularz(formularzZDanych({ ...baza, ...zmiana.dane }));
    }
    if (zmiana.podstawy) ustawPodstawyZeSlotu((p) => ({ ...p, ...zmiana.podstawy }));
  }

  function oblicz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const wynik = walidujFormularz(formularz, dzis, kontekst.katalog);
    const dane = czyPoprawny(wynik) ? zbudujDaneWejsciowe(formularz) : null;
    if (dane) {
      const bledySilnika = walidujDaneWejsciowe(dane, dzis);
      for (const [klucz, kod] of Object.entries(bledySilnika)) {
        if (kod && (KOLEJNOSC_POL as readonly string[]).includes(klucz)) wynik.bledy[klucz as PoleFormularza] = kod;
      }
    }
    ustawWalidacje(wynik);
    if (dane === null || !czyPoprawny(wynik)) {
      const pierwszy = KOLEJNOSC_POL.find((p) => wynik.bledy[p] || wynik.informacje[p]);
      if (pierwszy) requestAnimationFrame(() => document.getElementById(idPola(pierwszy))?.focus());
      return;
    }
    ustawStanRoboczy({
      konto: kontekst.konto.pesel,
      dane,
      podstawy: { ...(stanRoboczy?.podstawy ?? {}), ...podstawyZeSlotu },
      pelnyEtat: stanRoboczy?.pelnyEtat ?? {},
      parametry: null,
    });
    router.push(
      trasy.ViewCalcMaternityResult({
        ...(idSprawy ? { sprawa: idSprawy } : {}),
        ...(zrodlo ? { zrodlo } : {}),
      }),
    );
  }

  const imieMatki = kontekst.imiona.matka;
  const imieDrugiego = kontekst.imiona['drugi-rodzic'];
  const rolaMatki = zdarzenie === 'przyjecie' ? t.rodzicPrzyjmujacy : t.matka;
  const etykietaMatki = imieMatki ? t.zImieniem({ rola: rolaMatki, imie: imieMatki }) : rolaMatki;
  const etykietaDrugiego = imieDrugiego ? t.zImieniem({ rola: t.drugiRodzic, imie: imieDrugiego }) : t.drugiRodzic;

  const wstep = kontekst.nowyUzytkownik
    ? f.formaMatki.zrodlo === 'konto-zus'
      ? t.wstepNowyMatka
      : f.formaDrugiego.zrodlo === 'konto-zus'
        ? t.wstepNowyDrugiRodzic
        : t.wstepBezDanych
    : t.wstepProfil;

  const kat = kategoriaWczesniactwa(
    /^\d+$/.test(f.tydzienCiazy.wartosc.trim()) ? Number(f.tydzienCiazy.wartosc.trim()) : null,
    /^\d+$/.test(f.masaG.wartosc.trim()) ? Number(f.masaG.wartosc.trim()) : null,
  );
  const informacja = (p: PoleFormularza) => {
    const i = walidacja?.informacje[p];
    return i ? (
      <Komunikat kod={i.kod} tresc={trescKomunikatu(i.kod, i.parametry as never)} className="mt-2" />
    ) : null;
  };

  const opcjeZdarzen = (['porod', 'przewidywany-porod', 'przyjecie'] as const).map((w) => ({
    wartosc: w,
    etykieta: t.zdarzenia[w],
  }));
  const opcjeLiczby = LICZBY_DZIECI.map((n) => ({ wartosc: String(n), etykieta: t.liczbyDzieci[String(n) as '1'] }));

  const boczna = (
    <Stos odstep={7.5}>
      {zdarzenie === 'przyjecie' ? (
        <Karta tytul={t.asidePrzyjecie} bezLinii as="div">
          <dl className="m-0 flex flex-col gap-4">
            {t.asidePrzyjeciePozycje.map((p) => (
              <div key={p.tytul}>
                <dt className="text-body-strong">{p.tytul}</dt>
                <dd className="m-0">{p.opis}</dd>
              </div>
            ))}
          </dl>
          <Notatka className="mt-6">{t.asidePrzyjecieNotatka}</Notatka>
        </Karta>
      ) : null}
      {zdarzenie === 'porod' && f.wczesniactwo.wartosc ? (
        <Karta tytul={t.asideUzupelniajacy} bezLinii as="div">
          <dl className="m-0 flex flex-col gap-4">
            {t.asideUzupelniajacyPozycje.map((p) => (
              <div key={p.tytul}>
                <dt className="text-body-strong">{p.tytul}</dt>
                <dd className="m-0">{p.opis}</dd>
              </div>
            ))}
          </dl>
        </Karta>
      ) : null}
      <Karta tytul={t.asideZrodla} bezLinii as="div">
        <dl className="m-0 flex flex-col gap-4">
          {t.asideZrodlaPozycje.map((p) => (
            <div key={p.tytul}>
              <dt className="text-body-strong">{p.tytul}</dt>
              <dd className="m-0">{p.opis}</dd>
            </div>
          ))}
        </dl>
        <Notatka className="mt-6">{t.asideZrodlaNotatka}</Notatka>
      </Karta>
    </Stos>
  );

  const tresc = (
    <Stos odstep={7.5}>
      <Karta tytul={t.kartaZdarzenia} bezLinii>
        <Stos odstep={6}>
          <div>
            <GrupaOpcji<Zdarzenie>
              nazwa={`${PREFIKS}-zdarzenie`}
              legenda={t.zdarzenieLegenda}
              opcje={opcjeZdarzen}
              wartosc={zdarzenie}
              onZmiana={(w) => zmien('zdarzenie', w)}
              podpowiedz={zdarzenie === null ? t.zdarzeniePodpowiedz : undefined}
              blad={blad('zdarzenie')}
            />
            {zdarzenie !== null ? <ZrodloPola zrodlo={f.zdarzenie.zrodlo} /> : null}
          </div>

          {zdarzenie === 'porod' ? (
            <div className="grid gap-1">
              <PoleDaty
                id={idPola('dataPorodu')}
                etykieta={t.dataPorodu}
                podpowiedz={t.dataPoroduPodpowiedz}
                wartosc={f.dataPorodu.wartosc}
                onZmiana={(w) => zmien('dataPorodu', w)}
                blad={blad('dataPorodu')}
                szerokosc="waska"
              />
              <ZrodloPola zrodlo={f.dataPorodu.zrodlo} />
            </div>
          ) : null}

          {zdarzenie === 'przewidywany-porod' ? (
            <div className="grid gap-1">
              <PoleDaty
                id={idPola('przewidywanyTermin')}
                etykieta={t.przewidywanyTermin}
                podpowiedz={t.przewidywanyTerminPodpowiedz}
                wartosc={f.przewidywanyTermin.wartosc}
                onZmiana={(w) => zmien('przewidywanyTermin', w)}
                blad={blad('przewidywanyTermin')}
                szerokosc="waska"
              />
              <ZrodloPola zrodlo={f.przewidywanyTermin.zrodlo} />
            </div>
          ) : null}

          {zdarzenie === 'przyjecie' ? (
            <>
              <div>
                <GrupaOpcji<FormaPrzyjecia>
                  nazwa={`${PREFIKS}-forma-przyjecia`}
                  legenda={t.formaPrzyjeciaLegenda}
                  opcje={(['przysposobienie', 'rodzina-zastepcza-niezawodowa', 'rodzina-zastepcza-zawodowa'] as const).map(
                    (w) => ({ wartosc: w, etykieta: t.formyPrzyjecia[w] }),
                  )}
                  wartosc={f.formaPrzyjecia.wartosc}
                  onZmiana={(w) => zmien('formaPrzyjecia', w)}
                  blad={blad('formaPrzyjecia')}
                />
                <ZrodloPola zrodlo={f.formaPrzyjecia.zrodlo} />
                {informacja('formaPrzyjecia')}
              </div>
              {f.formaPrzyjecia.wartosc === 'rodzina-zastepcza-niezawodowa' ? (
                <div>
                  <GrupaOpcji<'tak' | 'nie'>
                    nazwa={`${PREFIKS}-odroczenie`}
                    legenda={t.odroczenieLegenda}
                    podpowiedz={t.odroczeniePodpowiedz}
                    uklad="poziomo"
                    opcje={[
                      { wartosc: 'nie', etykieta: t.nie },
                      { wartosc: 'tak', etykieta: t.tak },
                    ]}
                    wartosc={f.odroczenie.wartosc ? 'tak' : 'nie'}
                    onZmiana={(w) => zmien('odroczenie', w === 'tak')}
                  />
                  <ZrodloPola zrodlo={f.odroczenie.zrodlo} />
                </div>
              ) : null}
              <div className="grid gap-1">
                <PoleDaty
                  id={idPola('dataPrzyjecia')}
                  etykieta={t.dataPrzyjecia}
                  podpowiedz={t.dataPrzyjeciaPodpowiedz({ data: formatujDate(dodajMiesiace(dzis, 12)) })}
                  wartosc={f.dataPrzyjecia.wartosc}
                  onZmiana={(w) => zmien('dataPrzyjecia', w)}
                  blad={blad('dataPrzyjecia')}
                  szerokosc="waska"
                />
                <ZrodloPola zrodlo={f.dataPrzyjecia.zrodlo} />
              </div>
              <div className="grid gap-1">
                <PoleDaty
                  id={idPola('dataUrodzeniaDziecka')}
                  etykieta={t.dataUrodzeniaDziecka}
                  podpowiedz={t.dataUrodzeniaDzieckaPodpowiedz}
                  wartosc={f.dataUrodzeniaDziecka.wartosc}
                  onZmiana={(w) => zmien('dataUrodzeniaDziecka', w)}
                  blad={blad('dataUrodzeniaDziecka')}
                  szerokosc="waska"
                />
                <ZrodloPola zrodlo={f.dataUrodzeniaDziecka.zrodlo} />
                {informacja('dataUrodzeniaDziecka')}
              </div>
            </>
          ) : null}

          {zdarzenie !== null ? (
            <>
              <div className="grid max-w-90 gap-1">
                <PoleWyboru
                  id={idPola('liczbaDzieci')}
                  etykieta={zdarzenie === 'przyjecie' ? t.liczbaDzieciPrzyjetych : t.liczbaDzieci}
                  opcje={opcjeLiczby}
                  wartosc={String(f.liczbaDzieci.wartosc)}
                  onZmiana={(w) => w && zmien('liczbaDzieci', Number(w) as LiczbaDzieci)}
                />
                <ZrodloPola zrodlo={f.liczbaDzieci.zrodlo} />
              </div>
              <div>
                <GrupaOpcji<'tak' | 'nie'>
                  nazwa={`${PREFIKS}-za-zyciem`}
                  legenda={t.zaZyciemLegenda}
                  podpowiedz={t.zaZyciemPodpowiedz}
                  uklad="poziomo"
                  opcje={[
                    { wartosc: 'nie', etykieta: t.nie },
                    { wartosc: 'tak', etykieta: t.tak },
                  ]}
                  wartosc={f.zaZyciem.wartosc ? 'tak' : 'nie'}
                  onZmiana={(w) => zmien('zaZyciem', w === 'tak')}
                />
                <ZrodloPola zrodlo={f.zaZyciem.zrodlo} />
              </div>
            </>
          ) : null}
        </Stos>
      </Karta>

      {zdarzenie === 'porod' ? (
        <Karta tytul={t.kartaWczesniactwa} bezLinii>
          <p className="m-0 mb-4 text-body">{f.liczbaDzieci.wartosc > 1 ? t.wczesniactwoOpisMnoga : t.wczesniactwoOpis}</p>
          <PoleZaznaczenia
            id={`${PREFIKS}-wczesniactwo`}
            etykieta={t.wczesniactwoPole}
            zaznaczone={f.wczesniactwo.wartosc}
            onZmiana={(z) => zmien('wczesniactwo', z)}
          />
          <ZrodloPola zrodlo={f.wczesniactwo.zrodlo} />
          {f.wczesniactwo.wartosc ? (
            <Stos odstep={6} className="mt-6">
              <PoleLiczby
                id={idPola('tydzienCiazy')}
                etykieta={t.tydzienCiazy}
                podpowiedz={t.tydzienCiazyPodpowiedz}
                wartosc={f.tydzienCiazy.wartosc}
                onZmiana={(w) => zmien('tydzienCiazy', w)}
                blad={blad('tydzienCiazy')}
                szerokosc="waska"
              />
              <PoleLiczby
                id={idPola('masaG')}
                etykieta={t.masa}
                podpowiedz={t.masaPodpowiedz}
                wartosc={f.masaG.wartosc}
                onZmiana={(w) => zmien('masaG', w)}
                blad={blad('masaG')}
                szerokosc="waska"
              />
              <PoleLiczby
                id={idPola('dniPobytu')}
                etykieta={t.dniPobytu}
                podpowiedz={kat ? t.dniPobytuPodpowiedz[kat] : t.dniPobytuPodpowiedz.brak}
                wartosc={f.dniPobytu.wartosc}
                onZmiana={(w) => zmien('dniPobytu', w)}
                blad={blad('dniPobytu')}
                parametryBledu={parametryBledu('dniPobytu') ?? { liczbaDni: String(MAKS_DNI_POBYTU[kat ?? 'a']) }}
                szerokosc="waska"
              />
            </Stos>
          ) : null}
        </Karta>
      ) : null}

      {zdarzenie === 'porod' ? (
        <Karta tytul={t.kartaStraty} bezLinii>
          <p className="m-0 mb-4 text-body">{t.strataOpis}</p>
          <PoleZaznaczenia
            id={`${PREFIKS}-strata`}
            etykieta={t.strataPole}
            zaznaczone={f.strata.wartosc}
            onZmiana={(z) => zmien('strata', z)}
          />
          <ZrodloPola zrodlo={f.strata.zrodlo} />
          {f.strata.wartosc ? (
            <Stos odstep={6} className="mt-6">
              <GrupaOpcji<RodzajStraty>
                nazwa={`${PREFIKS}-rodzaj-straty`}
                legenda={t.rodzajStratyLegenda}
                opcje={(['martwe-urodzenie', 'poronienie', 'zgon-dziecka'] as const).map((w) => ({
                  wartosc: w,
                  etykieta: t.rodzajeStraty[w],
                }))}
                wartosc={f.rodzajStraty.wartosc}
                onZmiana={(w) => zmien('rodzajStraty', w)}
                blad={blad('rodzajStraty')}
              />
              {f.rodzajStraty.wartosc === 'zgon-dziecka' ? (
                <PoleDaty
                  id={idPola('dataZgonu')}
                  etykieta={t.dataZgonu}
                  podpowiedz={t.dataZgonuPodpowiedz}
                  wartosc={f.dataZgonu.wartosc}
                  onZmiana={(w) => zmien('dataZgonu', w)}
                  blad={blad('dataZgonu')}
                  szerokosc="waska"
                />
              ) : null}
              {f.liczbaDzieci.wartosc > 1 ? (
                <PoleLiczby
                  id={idPola('liczbaDzieciStraty')}
                  etykieta={t.liczbaDzieciStraty}
                  podpowiedz={t.liczbaDzieciStratyPodpowiedz({ maks: String(f.liczbaDzieci.wartosc) })}
                  wartosc={f.liczbaDzieciStraty.wartosc}
                  onZmiana={(w) => zmien('liczbaDzieciStraty', w)}
                  blad={blad('liczbaDzieciStraty')}
                  parametryBledu={parametryBledu('liczbaDzieciStraty')}
                  szerokosc="waska"
                />
              ) : null}
            </Stos>
          ) : null}
        </Karta>
      ) : null}

      <Karta tytul={t.kartaForm} bezLinii>
        <p className="m-0 mb-6 text-body">{zdarzenie === 'przyjecie' ? t.formyOpisPrzyjecie : t.formyOpisPorod}</p>
        <div className="flex flex-wrap gap-6">
          <div className="grid min-w-0 grow basis-65 content-start gap-1">
            <PoleWyboru<OpcjaFormyMatki>
              id={idPola('formaMatki')}
              etykieta={etykietaMatki}
              opcje={OPCJE_FORMY_MATKI.map((w) => ({ wartosc: w, etykieta: t.formy[w] }))}
              wartosc={f.formaMatki.wartosc}
              onZmiana={(w) => zmien('formaMatki', w)}
              pustaOpcja={t.wybierz}
              blad={blad('formaMatki')}
            />
            {f.formaMatki.wartosc !== '' ? <ZrodloPola zrodlo={f.formaMatki.zrodlo} /> : null}
          </div>
          <div className="grid min-w-0 grow basis-65 content-start gap-1">
            <PoleWyboru<OpcjaFormyDrugiego>
              id={idPola('formaDrugiego')}
              etykieta={etykietaDrugiego}
              opcje={OPCJE_FORMY_DRUGIEGO.map((w) => ({ wartosc: w, etykieta: t.formy[w] }))}
              wartosc={f.formaDrugiego.wartosc}
              onZmiana={(w) => zmien('formaDrugiego', w)}
              pustaOpcja={t.wybierz}
              blad={blad('formaDrugiego')}
            />
            {f.formaDrugiego.wartosc !== '' ? <ZrodloPola zrodlo={f.formaDrugiego.zrodlo} /> : null}
          </div>
        </div>
      </Karta>

      <div className="flex flex-wrap items-center gap-4">
        <Przycisk type="submit" wariant="glowny">
          {t.oblicz}
        </Przycisk>
        {kontekst.nowyUzytkownik ? null : <Odnosnik href={trasy.ViewFamilyPlan()}>{t.wrocDoPlanu}</Odnosnik>}
      </div>
    </Stos>
  );

  const daneDlaSlotu = zbudujDaneWejsciowe(formularz);

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} stanNa={dzis} wstep={wstep} powrot={false} />
      {kontekst.nowyUzytkownik ? <Komunikat kod="0101" tresc={trescKomunikatu('0101')} className="mb-7.5" /> : null}
      {slotyDanychWejsciowych.map(({ id, Komponent }) => (
        <Komponent key={id} zrodlo={zrodlo} idSprawy={idSprawy} dane={daneDlaSlotu} onUzupelnij={uzupelnijZeSlotu} />
      ))}
      <form noValidate aria-label={t.etykietaFormularza} onSubmit={oblicz}>
        <UkladDwuKolumnowy tresc={tresc} boczna={boczna} />
      </form>
    </>
  );
}
