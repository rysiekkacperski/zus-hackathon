'use client';

// ViewCalcMaternityInput: dane wejściowe kalkulatora zasiłku macierzyńskiego w częściach (?czesc=N). Każda część
// mieści się w oknie bez przewijania, a pola walidują się po opuszczeniu. „Oblicz zasiłek” na ostatniej części
// sprawdza cały formularz i przy błędzie przenosi do części z pierwszym błędnym polem.
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { dodajMiesiace, formatujDate } from '@/domena/daty';
import type {
  DaneWejscioweKalkulatora,
  FormaPrzyjecia,
  LiczbaDzieci,
  PodstawaWymiaru,
  RodzicWRodzinie,
} from '@/domena/typy';
import { useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PostepKreatora } from '@/komponenty/kroki';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
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
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useDzis } from '@/dane/magazyn/hooki';
import { teksty } from '@/teksty';
import { slotyDanychWejsciowych, type PropsSlotu } from './_sloty';
import { POLA_CZESCI, czesciKalkulatora, type CzescKalkulatora } from './_czesci/czesci-kalkulatora';
import {
  KOLEJNOSC_POL,
  MAKS_DNI_POBYTU,
  OPCJE_FORMY_DRUGIEGO,
  OPCJE_FORMY_MATKI,
  bledyFormularza,
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
  type Zdarzenie,
} from './_czesci/formularz';
import { useKontekstKalkulatora, type KontekstKalkulatora } from './_czesci/kontekst-kalkulatora';
import { ustawStanRoboczy, useStanRoboczy } from './_czesci/stan-roboczy';
import { ZrodloPola } from './_czesci/zrodlo-pola';

const t = teksty.ViewCalcMaternityInput;
const LICZBY_DZIECI: LiczbaDzieci[] = [1, 2, 3, 4, 5];
const PREFIKS = 'kalk';
const ZRODLO_PRZYKLADOWEJ_SPRAWY = 'przykladowa-sprawa';

// Nazwy grup radio: hook walidacji ustawia fokus na zaznaczonej albo pierwszej opcji grupy.
const GRUPY: Partial<Record<PoleFormularza, string>> = {
  zdarzenie: `${PREFIKS}-zdarzenie`,
  formaPrzyjecia: `${PREFIKS}-forma-przyjecia`,
  rodzajStraty: `${PREFIKS}-rodzaj-straty`,
};

// Identyfikator pola tekstowego, listy wyboru albo zaznaczenia.
function idPola(p: PoleFormularza): string {
  return `${PREFIKS}-${p}`;
}

// Kolejność pól na ekranie i cel fokusu każdego pola po nieudanym przejściu dalej.
const CELE_FOKUSU = Object.fromEntries(KOLEJNOSC_POL.map((p) => [p, GRUPY[p] ?? idPola(p)])) as Record<
  PoleFormularza,
  string
>;

const NAZWY_CZESCI: Record<CzescKalkulatora, string> = {
  sprawa: t.czescSprawy,
  zdarzenie: t.kartaZdarzenia,
  przyjecie: t.formaPrzyjeciaLegenda,
  datyPrzyjecia: t.kartaDatPrzyjecia,
  dziecko: t.kartaDzieci,
  wczesniactwo: t.kartaWczesniactwa,
  strata: t.kartaStraty,
  formy: t.kartaForm,
};

export function WidokKalkulatoraZasilku() {
  const kontekst = useKontekstKalkulatora();
  if (kontekst === null) return <SzkieletWidoku />;
  return <FormularzKalkulatoraWidok key={kontekst.konto.pesel} kontekst={kontekst} />;
}

function ListaObjasnien({ pozycje }: { pozycje: readonly { tytul: string; opis: string }[] }) {
  return (
    <dl className="m-0 flex flex-col gap-4">
      {pozycje.map((p) => (
        <div key={p.tytul}>
          <dt className="text-body-strong">{p.tytul}</dt>
          <dd className="m-0">{p.opis}</dd>
        </div>
      ))}
    </dl>
  );
}

function FormularzKalkulatoraWidok({ kontekst }: { kontekst: KontekstKalkulatora }) {
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
  const { zajety, przejdz } = useNawigacjaZLadowaniem();

  const f = formularz;
  const zdarzenie = f.zdarzenie.wartosc;
  const listaCzesci = czesciKalkulatora(zdarzenie, zrodlo === ZRODLO_PRZYKLADOWEJ_SPRAWY);
  // Parametry błędów i komunikaty INFO bieżących wartości.
  const ocena = walidujFormularz(f, dzis, kontekst.katalog);

  const walidacja = useWalidacjaNaBiezaco<PoleFormularza, FormularzKalkulatora>({
    wartosci: formularz,
    waliduj: (w) => bledyFormularza(w, dzis, kontekst.katalog),
    pola: CELE_FOKUSU,
    wartoscPola: (w, p) => w[p].wartosc,
  });
  const czesci = useCzesciFormularza<PoleFormularza>({
    liczba: listaCzesci.length,
    podzial: listaCzesci.map((c) => POLA_CZESCI[c]),
    walidacja,
  });
  const czesc: CzescKalkulatora = listaCzesci[czesci.czesc - 1] ?? 'zdarzenie';

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

  // Akcja ostatniej części: formularz jest już sprawdzony w całości.
  function oblicz() {
    const dane = zbudujDaneWejsciowe(formularz);
    if (dane === null) return;
    ustawStanRoboczy({
      konto: kontekst.konto.pesel,
      dane,
      podstawy: { ...(stanRoboczy?.podstawy ?? {}), ...podstawyZeSlotu },
      pelnyEtat: stanRoboczy?.pelnyEtat ?? {},
      parametry: null,
    });
    przejdz(
      trasy.ViewCalcMaternityResult({
        ...(idSprawy ? { sprawa: idSprawy } : {}),
        ...(zrodlo ? { zrodlo } : {}),
      }),
    );
  }

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (zajety) return;
    czesci.dalej(oblicz);
  }

  // Kod INFO (0091, 0092) pokazuje się komunikatem pod polem, a pozostałe kody jako błąd pola.
  const czyInformacja = (p: PoleFormularza, kod: string | null) => kod !== null && ocena.informacje[p]?.kod === kod;
  const pole = (p: PoleFormularza) => {
    const kod = walidacja.blad(p);
    return { blad: czyInformacja(p, kod) ? null : kod, onOpuszczenie: () => walidacja.onOpuszczenie(p) };
  };
  const informacja = (p: PoleFormularza) => {
    const i = ocena.informacje[p];
    return i && czyInformacja(p, walidacja.blad(p)) ? (
      <Komunikat kod={i.kod} tresc={trescKomunikatu(i.kod, i.parametry as never)} className="mt-2" />
    ) : null;
  };

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

  const opcjeZdarzen = (['porod', 'przewidywany-porod', 'przyjecie'] as const).map((w) => ({
    wartosc: w,
    etykieta: t.zdarzenia[w],
  }));
  const opcjeLiczby = LICZBY_DZIECI.map((n) => ({ wartosc: String(n), etykieta: t.liczbyDzieci[String(n) as '1'] }));
  const opcjeTakNie = [
    { wartosc: 'nie' as const, etykieta: t.nie },
    { wartosc: 'tak' as const, etykieta: t.tak },
  ];

  // Kolumna boczna: jedna karta objaśnień dopasowana do części.
  const boczna =
    czesc === 'przyjecie' || czesc === 'datyPrzyjecia' ? (
      <Karta tytul={t.asidePrzyjecie} bezLinii as="div">
        <ListaObjasnien pozycje={t.asidePrzyjeciePozycje} />
        <Notatka className="mt-6">{t.asidePrzyjecieNotatka}</Notatka>
      </Karta>
    ) : czesc === 'wczesniactwo' && f.wczesniactwo.wartosc ? (
      <Karta tytul={t.asideUzupelniajacy} bezLinii as="div">
        <ListaObjasnien pozycje={t.asideUzupelniajacyPozycje} />
      </Karta>
    ) : (
      <Karta tytul={t.asideZrodla} bezLinii as="div">
        <ListaObjasnien pozycje={t.asideZrodlaPozycje} />
        <Notatka className="mt-6">{t.asideZrodlaNotatka}</Notatka>
      </Karta>
    );

  function kartaCzesci(): ReactNode {
    switch (czesc) {
      case 'sprawa':
        return null;
      case 'zdarzenie':
        return (
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
                  {...pole('zdarzenie')}
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
                    {...pole('dataPorodu')}
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
                    {...pole('przewidywanyTermin')}
                    szerokosc="waska"
                  />
                  <ZrodloPola zrodlo={f.przewidywanyTermin.zrodlo} />
                </div>
              ) : null}
            </Stos>
          </Karta>
        );
      case 'przyjecie':
        return (
          <Karta tytul={t.formaPrzyjeciaLegenda} bezLinii>
            <Stos odstep={6}>
              <div>
                <GrupaOpcji<FormaPrzyjecia>
                  nazwa={`${PREFIKS}-forma-przyjecia`}
                  legenda={t.formaPrzyjeciaLegenda}
                  legendaUkryta
                  opcje={(['przysposobienie', 'rodzina-zastepcza-niezawodowa', 'rodzina-zastepcza-zawodowa'] as const).map(
                    (w) => ({ wartosc: w, etykieta: t.formyPrzyjecia[w] }),
                  )}
                  wartosc={f.formaPrzyjecia.wartosc}
                  onZmiana={(w) => zmien('formaPrzyjecia', w)}
                  {...pole('formaPrzyjecia')}
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
                    opcje={opcjeTakNie}
                    wartosc={f.odroczenie.wartosc ? 'tak' : 'nie'}
                    onZmiana={(w) => zmien('odroczenie', w === 'tak')}
                  />
                  <ZrodloPola zrodlo={f.odroczenie.zrodlo} />
                </div>
              ) : null}
            </Stos>
          </Karta>
        );
      case 'datyPrzyjecia':
        return (
          <Karta tytul={t.kartaDatPrzyjecia} bezLinii>
            <Stos odstep={6}>
              <div className="grid gap-1">
                <PoleDaty
                  id={idPola('dataPrzyjecia')}
                  etykieta={t.dataPrzyjecia}
                  podpowiedz={t.dataPrzyjeciaPodpowiedz({ data: formatujDate(dodajMiesiace(dzis, 12)) })}
                  wartosc={f.dataPrzyjecia.wartosc}
                  onZmiana={(w) => zmien('dataPrzyjecia', w)}
                  {...pole('dataPrzyjecia')}
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
                  {...pole('dataUrodzeniaDziecka')}
                  szerokosc="waska"
                />
                <ZrodloPola zrodlo={f.dataUrodzeniaDziecka.zrodlo} />
                {informacja('dataUrodzeniaDziecka')}
              </div>
            </Stos>
          </Karta>
        );
      case 'dziecko':
        return (
          <Karta tytul={t.kartaDzieci} bezLinii>
            <Stos odstep={6}>
              <div className="grid max-w-90 gap-1">
                <PoleWyboru
                  id={idPola('liczbaDzieci')}
                  etykieta={zdarzenie === 'przyjecie' ? t.liczbaDzieciPrzyjetych : t.liczbaDzieci}
                  opcje={opcjeLiczby}
                  wartosc={String(f.liczbaDzieci.wartosc)}
                  onZmiana={(w) => w && zmien('liczbaDzieci', Number(w) as LiczbaDzieci)}
                  {...pole('liczbaDzieci')}
                />
                <ZrodloPola zrodlo={f.liczbaDzieci.zrodlo} />
              </div>
              <div>
                <GrupaOpcji<'tak' | 'nie'>
                  nazwa={`${PREFIKS}-za-zyciem`}
                  legenda={t.zaZyciemLegenda}
                  podpowiedz={t.zaZyciemPodpowiedz}
                  uklad="poziomo"
                  opcje={opcjeTakNie}
                  wartosc={f.zaZyciem.wartosc ? 'tak' : 'nie'}
                  onZmiana={(w) => zmien('zaZyciem', w === 'tak')}
                />
                <ZrodloPola zrodlo={f.zaZyciem.zrodlo} />
              </div>
            </Stos>
          </Karta>
        );
      case 'wczesniactwo':
        return (
          <Karta tytul={t.kartaWczesniactwa} bezLinii>
            <p className="m-0 mb-4 text-body">{f.liczbaDzieci.wartosc > 1 ? t.wczesniactwoOpisMnoga : t.wczesniactwoOpis}</p>
            <PoleZaznaczenia
              id={idPola('wczesniactwo')}
              etykieta={t.wczesniactwoPole}
              zaznaczone={f.wczesniactwo.wartosc}
              onZmiana={(z) => zmien('wczesniactwo', z)}
            />
            <ZrodloPola zrodlo={f.wczesniactwo.zrodlo} />
            {f.wczesniactwo.wartosc ? (
              <Stos odstep={6} className="mt-6">
                <div className="flex flex-wrap items-start gap-6">
                  <PoleLiczby
                    id={idPola('tydzienCiazy')}
                    etykieta={t.tydzienCiazy}
                    podpowiedz={t.tydzienCiazyPodpowiedz}
                    wartosc={f.tydzienCiazy.wartosc}
                    onZmiana={(w) => zmien('tydzienCiazy', w)}
                    {...pole('tydzienCiazy')}
                    szerokosc="waska"
                    className="grow basis-60"
                  />
                  <PoleLiczby
                    id={idPola('masaG')}
                    etykieta={t.masa}
                    podpowiedz={t.masaPodpowiedz}
                    wartosc={f.masaG.wartosc}
                    onZmiana={(w) => zmien('masaG', w)}
                    {...pole('masaG')}
                    szerokosc="waska"
                    className="grow basis-60"
                  />
                </div>
                <PoleLiczby
                  id={idPola('dniPobytu')}
                  etykieta={t.dniPobytu}
                  podpowiedz={kat ? t.dniPobytuPodpowiedz[kat] : t.dniPobytuPodpowiedz.brak}
                  wartosc={f.dniPobytu.wartosc}
                  onZmiana={(w) => zmien('dniPobytu', w)}
                  {...pole('dniPobytu')}
                  parametryBledu={ocena.parametry.dniPobytu ?? { liczbaDni: String(MAKS_DNI_POBYTU[kat ?? 'a']) }}
                  szerokosc="waska"
                />
              </Stos>
            ) : null}
          </Karta>
        );
      case 'strata':
        return (
          <Karta tytul={t.kartaStraty} bezLinii>
            <p className="m-0 mb-4 text-body">{t.strataOpis}</p>
            <PoleZaznaczenia
              id={idPola('strata')}
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
                  {...pole('rodzajStraty')}
                />
                {f.rodzajStraty.wartosc === 'zgon-dziecka' || f.liczbaDzieci.wartosc > 1 ? (
                  <div className="flex flex-wrap items-start gap-6">
                    {f.rodzajStraty.wartosc === 'zgon-dziecka' ? (
                      <PoleDaty
                        id={idPola('dataZgonu')}
                        etykieta={t.dataZgonu}
                        podpowiedz={t.dataZgonuPodpowiedz}
                        wartosc={f.dataZgonu.wartosc}
                        onZmiana={(w) => zmien('dataZgonu', w)}
                        {...pole('dataZgonu')}
                        szerokosc="waska"
                        className="grow basis-60"
                      />
                    ) : null}
                    {f.liczbaDzieci.wartosc > 1 ? (
                      <PoleLiczby
                        id={idPola('liczbaDzieciStraty')}
                        etykieta={t.liczbaDzieciStraty}
                        podpowiedz={t.liczbaDzieciStratyPodpowiedz({ maks: String(f.liczbaDzieci.wartosc) })}
                        wartosc={f.liczbaDzieciStraty.wartosc}
                        onZmiana={(w) => zmien('liczbaDzieciStraty', w)}
                        {...pole('liczbaDzieciStraty')}
                        parametryBledu={ocena.parametry.liczbaDzieciStraty}
                        szerokosc="waska"
                        className="grow basis-60"
                      />
                    ) : null}
                  </div>
                ) : null}
              </Stos>
            ) : null}
          </Karta>
        );
      case 'formy':
        return (
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
                  {...pole('formaMatki')}
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
                  {...pole('formaDrugiego')}
                />
                {f.formaDrugiego.wartosc !== '' ? <ZrodloPola zrodlo={f.formaDrugiego.zrodlo} /> : null}
              </div>
            </div>
          </Karta>
        );
    }
  }

  // Wiersz przycisków części: „Wróć” od części 2, „Przejdź dalej”, a na ostatniej części „Oblicz zasiłek”.
  const przyciski = (
    <div className="flex min-w-0 flex-wrap items-center justify-end gap-4">
      {czesci.czyPierwsza ? (
        kontekst.nowyUzytkownik ? null : (
          <Odnosnik href={trasy.ViewFamilyPlan()} className="mr-auto">
            {t.wrocDoPlanu}
          </Odnosnik>
        )
      ) : (
        <Przycisk wariant="drugorzedny" onClick={() => czesci.wroc()} disabled={zajety} className="mr-auto">
          {teksty.wspolne.przyciski.wroc}
        </Przycisk>
      )}
      <Przycisk type="submit" wariant="glowny" zajety={czesci.czyOstatnia && zajety}>
        {czesci.czyOstatnia ? t.oblicz : teksty.wspolne.przyciski.dalej}
      </Przycisk>
    </div>
  );

  const daneDlaSlotu = zbudujDaneWejsciowe(formularz);

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} stanNa={dzis} wstep={czesci.czyPierwsza ? wstep : undefined} powrot={false} />
      {kontekst.nowyUzytkownik && czesci.czyPierwsza ? (
        <Komunikat kod="0101" tresc={trescKomunikatu('0101')} className="mb-7.5" />
      ) : null}
      <form noValidate aria-label={t.etykietaFormularza} onSubmit={wyslij}>
        <Stos odstep={7.5}>
          <PostepKreatora
            id="postep-kalkulatora"
            krok={czesci.czesc}
            liczbaKrokow={czesci.liczba}
            nazwaKroku={NAZWY_CZESCI[czesc]}
          />
          {/* Sloty zostają zamontowane we wszystkich częściach, bo przekazują dane sprawy raz na wersję danych. */}
          <div hidden={czesc !== 'sprawa'}>
            {slotyDanychWejsciowych.map(({ id, Komponent }) => (
              <Komponent key={id} zrodlo={zrodlo} idSprawy={idSprawy} dane={daneDlaSlotu} onUzupelnij={uzupelnijZeSlotu} />
            ))}
          </div>
          {czesc === 'sprawa' ? (
            przyciski
          ) : (
            <UkladDwuKolumnowy
              tresc={
                <Stos odstep={7.5}>
                  {kartaCzesci()}
                  {przyciski}
                </Stos>
              }
              boczna={boczna}
            />
          )}
        </Stos>
      </form>
    </>
  );
}
