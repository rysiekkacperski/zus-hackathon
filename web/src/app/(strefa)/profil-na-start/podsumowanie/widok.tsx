'use client';

// ViewProfileSummary (historyjka 3.3.1.3.1). Właściciel: u11.
// Tryb startu (/profil-na-start/podsumowanie, Nowy użytkownik): krok 7 z 7 z czterema sekcjami szkicu,
// akcją „Zmień” przy każdej sekcji i zapisem profilu (wzory cz1/P03-24 i cz1/P03-25).
// Tryb rodziny (/profil-rodziny, Rodzic i Drugi rodzic): zapisany profil, zmiana sekcji w szkicu zmiany
// profilu ze śladem „Zmienione, przed zmianą”, anulowanie i zapis zmian (wzory cz1/Profil-rodziny i cz1/P03-26).
// Sekcje profilu, w trybie rodziny zakładka „Dane planu” i sekcje ze slotów stoją w zakładkach (ZakladkiPodsumowania), a przyciski pod panelem zakładek,
// więc strona mieści się w oknie 1440×800 bez przewijania. Po nieudanym zapisie widok wybiera pierwszą zakładkę
// ze wskaźnikiem błędu i przenosi fokus na komunikat. Slot drugiego rodzica uzupełnia zakładkę „Drugi rodzic”
// o zaproszenie, dostęp do planu i pełnomocnictwo PEL, a propsy karty sekcji odczytuje z KartySekcjiProfilu.
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useDzis, useKontekstRodziny, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszProfil, zapiszZmianyProfilu } from '@/dane/magazyn/operacje/profil-zapis';
import { anulujZmianyProfilu, rozpocznijZmianeProfilu, zapiszSzkic } from '@/dane/magazyn/operacje/profil-szkic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dataZeZnacznika, formatujDate } from '@/domena/daty';
import { czyMaZgode } from '@/domena/konto';
import { profilJakoSzkic } from '@/domena/profil/zapis';
import type { IdWidoku, KodKomunikatu } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, UkladDwuKolumnowy, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { SzkieletKreatoraProfilu } from '../_czesci/szkielet-kreatora-profilu';
import { sciezkaPowrotuProfilu } from '../_czesci/trasy-profilu';
import { slotyPodsumowania } from './_sloty';
import { KartaDanychPlanu } from './_czesci/karta-danych-planu';
import { KartaSekcjiProfilu, KartySekcjiProfilu, type KartaSekcjiProfiluProps } from './_czesci/karta-sekcji-profilu';
import { sekcjeProfilu, wartosciWierszy, type ProfilDoPokazania, type SekcjaProfilu } from './_czesci/sekcje-profilu';
import { ZakladkiPodsumowania, zakladkaSlotu, type PanelZakladki } from './_czesci/zakladki-podsumowania';
import { BUDZET_PANELU, zakladkiSekcji, type ZakladkaSekcji } from './_czesci/zakladki-sekcji';

const t = teksty.ViewProfileSummary;
const EKRAN: IdWidoku = 'ViewProfileSummary';

/** Ekrany z parametrem ?powrot=podsumowanie w mapie tras (kontrakt, tabela 2.2). */
const EKRANY_Z_POWROTEM: readonly IdWidoku[] = ['ViewProfileZusData', 'ViewProfileChildAdoption'];

function adresSekcji(ekran: IdWidoku): string {
  if (ekran === 'ViewBirthDate') return sciezkaWidoku(ekran, { tryb: 'profil' });
  if (EKRANY_Z_POWROTEM.includes(ekran)) return sciezkaWidoku(ekran, { powrot: 'podsumowanie' });
  return sciezkaWidoku(ekran);
}

/** Sekcja z nagłówkiem treści „Stan na” nad wierszami (dane z konta ZUS w trybie startu). */
function czyZeStanemNa(tryb: TrybWidoku<'ViewProfileSummary'>, sekcja: SekcjaProfilu): boolean {
  return tryb === 'start' && sekcja.id === 'formaIPlatnik';
}

export function WidokPodsumowaniaProfilu({ tryb }: { tryb: TrybWidoku<'ViewProfileSummary'> }) {
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const kontekst = useKontekstRodziny();
  const dzis = useDzis();
  const [blad, setBlad] = useStanChwilowy<KodKomunikatu | null>(null);
  const [proba, ustawProbe] = useStanChwilowy(0);
  const [wyborPoProbie, ustawWyborPoProbie] = useStanChwilowy<{ id: string } | null>(null);
  const { zajety, ustawZajety: setZajety, przejdz } = useNawigacjaZLadowaniem();
  const zapisanoOstatniEkran = useRef(false);
  const komunikatRef = useRef<HTMLDivElement>(null);

  const konto = stanKonta?.konto ?? null;
  const szkic = stanKonta?.szkicProfilu ?? null;
  const zgoda = konto ? czyMaZgode(konto.decyzjeOZgodzie) : false;
  const kopia = stanKonta?.kopiaDanychZus ?? null;
  const stanNa = kopia ? dataZeZnacznika(kopia.odczytano) : dzis;
  const szkicZmiany = szkic?.kontekst === 'zmiana-profilu' ? szkic : null;

  // Wejście na podsumowanie kończy zmianę sekcji z podsumowania i zapamiętuje ostatni ekran szkicu.
  useEffect(() => {
    if (tryb !== 'start' || szkic === null || zapisanoOstatniEkran.current) return;
    if (szkic.ostatniEkran === EKRAN && !szkic.powrotNaPodsumowanie) return;
    zapisanoOstatniEkran.current = true;
    zapiszSzkic({ powrotNaPodsumowanie: false }, EKRAN, pobierzKontekstOperacji());
  }, [tryb, szkic]);

  // Trasa ukryta po „Zmień” wraca z Activity: powrót z ekranu kroku znów kończy zmianę sekcji.
  useLayoutEffect(
    () => () => {
      zapisanoOstatniEkran.current = false;
    },
    [],
  );

  // Po nieudanej próbie zapisu albo anulowania fokus trafia na komunikat nad zakładkami.
  useEffect(() => {
    if (proba > 0) komunikatRef.current?.focus();
  }, [proba]);

  const zapisany: ProfilDoPokazania | null = useMemo(() => {
    if (rodzina === null) return null;
    return { daneRodziny: profilJakoSzkic(rodzina.daneRodziny, rodzina.daneCiazy).daneRodziny, daneCiazy: rodzina.daneCiazy };
  }, [rodzina]);

  const pokazany: ProfilDoPokazania | null = useMemo(() => {
    if (tryb === 'start') return szkic ? { daneRodziny: szkic.daneRodziny, daneCiazy: szkic.daneCiazy } : null;
    if (szkicZmiany) return { daneRodziny: szkicZmiany.daneRodziny, daneCiazy: szkicZmiany.daneCiazy };
    return zapisany;
  }, [tryb, szkic, szkicZmiany, zapisany]);

  const sekcje: SekcjaProfilu[] = useMemo(() => (pokazany ? sekcjeProfilu(pokazany, zgoda) : []), [pokazany, zgoda]);

  const zakladki = useMemo(
    () => zakladkiSekcji(sekcje, BUDZET_PANELU[tryb], (s) => czyZeStanemNa(tryb, s)),
    [sekcje, tryb],
  );

  // Wartości zapisanego profilu przy wierszach, które szkic zmiany profilu zmienił.
  const przedZmiana = useMemo(() => {
    const mapa = new Map<string, string>();
    if (tryb !== 'rodzina' || szkicZmiany === null || zapisany === null) return mapa;
    const poprzednie = wartosciWierszy(sekcjeProfilu(zapisany, zgoda));
    for (const [klucz, wartosc] of wartosciWierszy(sekcje)) {
      const poprzednia = poprzednie.get(klucz);
      if (poprzednia !== undefined && poprzednia !== wartosc) mapa.set(klucz, poprzednia);
    }
    return mapa;
  }, [tryb, szkicZmiany, zapisany, sekcje, zgoda]);

  if (konto === null) return null;

  const rola = konto.rola;
  const kontoDrugiegoRodzica = rola === 'drugi-rodzic';

  function adresEkranu(ekran: IdWidoku): string | null {
    // Drugi rodzic zmienia w profilu wyłącznie sekcję drugiego rodzica.
    if (kontoDrugiegoRodzica && ekran !== 'ViewProfileSecondParent') return null;
    return adresSekcji(ekran);
  }

  function przygotujZmianeSekcji(ekran: IdWidoku) {
    const ctx = pobierzKontekstOperacji();
    if (tryb === 'rodzina' && szkicZmiany === null) rozpocznijZmianeProfilu(ctx);
    zapiszSzkic({ powrotNaPodsumowanie: true }, ekran, ctx);
  }

  function pokazBladProby(kod: KodKomunikatu) {
    setBlad(kod);
    const zBledem = zakladki.find((z) => z.blad);
    ustawWyborPoProbie(zBledem ? { id: zBledem.id } : null);
    ustawProbe((p) => p + 1);
  }

  function zapiszPoStarcie() {
    setZajety(true);
    setBlad(null);
    const wynik = zapiszProfil(pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(trasy.ViewFamilyPlan());
      return;
    }
    pokazBladProby(wynik.kod);
    setZajety(false);
  }

  function zapiszZmiany() {
    setZajety(true);
    setBlad(null);
    const wynik = zapiszZmianyProfilu(pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(trasy.ViewFamilyPlan());
      return;
    }
    pokazBladProby(wynik.kod);
    setZajety(false);
  }

  function anulujZmiany() {
    setBlad(null);
    const wynik = anulujZmianyProfilu(pobierzKontekstOperacji());
    if (!wynik.ok) pokazBladProby(wynik.kod);
  }

  // Propsy karty każdej zakładki sekcji; slot, który uzupełnia zakładkę sekcji, odczytuje je z KartySekcjiProfilu.
  const kartySekcji = zakladki.map((z): [ZakladkaSekcji, KartaSekcjiProfiluProps] => [
    z,
    {
      sekcja: z.sekcja,
      adresEkranu,
      onZmien: przygotujZmianeSekcji,
      przedZmiana,
      naglowekTresci: czyZeStanemNa(tryb, z.sekcja) ? (
        <p className="m-0 mb-2 text-body-strong">{teksty.wspolne.stanNa({ data: formatujDate(stanNa) })}</p>
      ) : undefined,
    },
  ]);

  const panelySekcji: PanelZakladki[] = kartySekcji.map(([z, karta]) => ({
    id: z.id,
    etykieta: z.etykieta,
    blad: z.blad,
    tresc: <KartaSekcjiProfilu {...karta} />,
  }));

  const panelySlotow: PanelZakladki[] = slotyPodsumowania.map(({ id, Komponent }) => ({
    ...zakladkaSlotu(id, rola),
    tresc: <Komponent tryb={tryb} konto={konto} szkic={szkic} kontekst={kontekst} />,
  }));

  // Tryb rodziny: zakładka „Dane planu” z danymi, z których powstał plan, za sekcjami profilu.
  const panelyZDanymiPlanu: PanelZakladki[] =
    tryb === 'rodzina' && kontekst !== null
      ? [...panelySekcji, { id: 'dane-planu', etykieta: t.zakladki.danePlanu, tresc: <KartaDanychPlanu kontekst={kontekst} /> }]
      : panelySekcji;

  const zakladkiProfilu = (
    <KartySekcjiProfilu value={Object.fromEntries(kartySekcji.map(([z, karta]) => [z.id, karta]))}>
      <ZakladkiPodsumowania sekcje={panelyZDanymiPlanu} sloty={panelySlotow} wyborPoProbie={wyborPoProbie} />
    </KartySekcjiProfilu>
  );

  const komunikatBledu = blad ? (
    <div ref={komunikatRef} tabIndex={-1} className="min-w-0">
      <Komunikat kod={blad} />
    </div>
  ) : null;

  if (tryb === 'start') {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} wstep={t.wstep} powrot={false} />
        {pokazany === null ? (
          <StanPusty
            ikona="profil"
            akcja={
              <PrzyciskLink href={trasy.ViewProfileZusData()} wariant="glowny">
                {t.przejdzDoProfiluNaStart}
              </PrzyciskLink>
            }
          >
            {t.brakSzkicu}
          </StanPusty>
        ) : (
          <SzkieletKreatoraProfilu
            biezacy={EKRAN}
            onWroc={() => przejdz(sciezkaPowrotuProfilu('ViewProfileSecondParent', szkic, kopia !== null))}
            onDalej={zapiszPoStarcie}
            etykietaDalej={t.zapiszProfil}
            zajety={zajety}
          >
            {komunikatBledu}
            <Notatka>
              <p>{blad ? t.notatkaPoBledzie : t.notatkaStart}</p>
            </Notatka>
            {zakladkiProfilu}
            <Notatka>
              <p>{t.notatkaPrzedZapisem}</p>
            </Notatka>
          </SzkieletKreatoraProfilu>
        )}
      </>
    );
  }

  const maZmiany = szkicZmiany !== null && (przedZmiana.size > 0 || szkicZmiany.zmienionePola.length > 0);
  const zmianaTerminu = przedZmiana.has('daneCiazy.termin');
  const notatkaProfilu = maZmiany
    ? zmianaTerminu && przedZmiana.size === 1
      ? t.rodzina.notatkaNiezapisanegoTerminu
      : t.rodzina.notatkaNiezapisanychZmian
    : t.rodzina.notatka;

  return (
    <>
      <NaglowekStrony
        tytul={t.rodzina.tytul}
        stanNa={stanNa}
        powrot={{ href: trasy.ViewFamilyPlan(), etykieta: t.rodzina.powrot }}
      />
      {pokazany === null ? (
        <StanPusty ikona="profil">{t.brakProfilu}</StanPusty>
      ) : (
        <UkladDwuKolumnowy
          etykietaBocznej={t.rodzina.tytulKartyZmiany}
          tresc={
            <Stos odstep={7.5}>
              {komunikatBledu}
              {zakladkiProfilu}
              <Wiersz odstep={4} className="justify-between">
                {maZmiany ? (
                  <>
                    <Przycisk wariant="drugorzedny" onClick={anulujZmiany} disabled={zajety}>
                      {t.rodzina.anulujZmiany}
                    </Przycisk>
                    <Przycisk wariant="glowny" onClick={zapiszZmiany} zajety={zajety}>
                      {t.zapiszProfil}
                    </Przycisk>
                  </>
                ) : (
                  <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
                    {t.rodzina.wrocDoPlanu}
                  </PrzyciskLink>
                )}
              </Wiersz>
            </Stos>
          }
          boczna={
            <Karta tytul={t.rodzina.tytulKartyZmiany} bezLinii>
              <Stos odstep={4}>
                <Notatka>
                  <p>{notatkaProfilu}</p>
                </Notatka>
                <Notatka>
                  <p>{t.rodzina.notatkaPrzeliczenia}</p>
                </Notatka>
                <Notatka>
                  <p>{zmianaTerminu ? t.rodzina.notatkaKalendarza : t.rodzina.notatkaDanychZus}</p>
                </Notatka>
              </Stos>
            </Karta>
          }
        />
      )}
    </>
  );
}
