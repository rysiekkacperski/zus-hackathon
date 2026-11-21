'use client';

// ViewProfileSummary (historyjka 3.3.1.3.1). Właściciel: u11.
// Tryb startu (/profil-na-start/podsumowanie, Nowy użytkownik): krok 7 z 7 z czterema sekcjami szkicu,
// akcją „Zmień” przy każdej sekcji i zapisem profilu (wzory cz1/P03-24 i cz1/P03-25).
// Tryb rodziny (/profil-rodziny, Rodzic i Drugi rodzic): zapisany profil, zmiana sekcji w szkicu zmiany
// profilu ze śladem „Zmienione, przed zmianą”, anulowanie i zapis zmian (wzory cz1/Profil-rodziny i cz1/P03-26).
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
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
import { KartaSekcjiProfilu } from './_czesci/karta-sekcji-profilu';
import { sekcjeProfilu, wartosciWierszy, type ProfilDoPokazania, type SekcjaProfilu } from './_czesci/sekcje-profilu';

const t = teksty.ViewProfileSummary;
const EKRAN: IdWidoku = 'ViewProfileSummary';

/** Ekrany z parametrem ?powrot=podsumowanie w mapie tras (kontrakt, tabela 2.2). */
const EKRANY_Z_POWROTEM: readonly IdWidoku[] = ['ViewProfileZusData', 'ViewProfileChildAdoption'];

function adresSekcji(ekran: IdWidoku): string {
  if (ekran === 'ViewBirthDate') return sciezkaWidoku(ekran, { tryb: 'profil' });
  if (EKRANY_Z_POWROTEM.includes(ekran)) return sciezkaWidoku(ekran, { powrot: 'podsumowanie' });
  return sciezkaWidoku(ekran);
}

export function WidokPodsumowaniaProfilu({ tryb }: { tryb: TrybWidoku<'ViewProfileSummary'> }) {
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const kontekst = useKontekstRodziny();
  const dzis = useDzis();
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety: setZajety, przejdz } = useNawigacjaZLadowaniem();
  const zapisanoOstatniEkran = useRef(false);

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

  function zapiszPoStarcie() {
    setZajety(true);
    setBlad(null);
    const wynik = zapiszProfil(pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(trasy.ViewFamilyPlan());
      return;
    }
    setBlad(wynik.kod);
    setZajety(false);
    window.scrollTo({ top: 0 });
  }

  function zapiszZmiany() {
    setZajety(true);
    setBlad(null);
    const wynik = zapiszZmianyProfilu(pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(trasy.ViewFamilyPlan());
      return;
    }
    setBlad(wynik.kod);
    setZajety(false);
    window.scrollTo({ top: 0 });
  }

  function anulujZmiany() {
    setBlad(null);
    const wynik = anulujZmianyProfilu(pobierzKontekstOperacji());
    if (!wynik.ok) setBlad(wynik.kod);
  }

  const karty = sekcje.map((sekcja) => (
    <KartaSekcjiProfilu
      key={sekcja.id}
      sekcja={sekcja}
      adresEkranu={adresEkranu}
      onZmien={przygotujZmianeSekcji}
      przedZmiana={przedZmiana}
      naglowekTresci={
        tryb === 'start' && sekcja.id === 'formaIPlatnik' ? (
          <p className="m-0 mb-2 text-body-strong">{teksty.wspolne.stanNa({ data: formatujDate(stanNa) })}</p>
        ) : undefined
      }
    />
  ));

  const sloty = slotyPodsumowania.map(({ id, Komponent }) => (
    <Komponent key={id} tryb={tryb} konto={konto} szkic={szkic} kontekst={kontekst} />
  ));

  const komunikatBledu = blad ? <Komunikat kod={blad} /> : null;

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
            {karty}
            {sloty}
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
              <Notatka>
                <p>
                  {maZmiany
                    ? zmianaTerminu && przedZmiana.size === 1
                      ? t.rodzina.notatkaNiezapisanegoTerminu
                      : t.rodzina.notatkaNiezapisanychZmian
                    : t.rodzina.notatka}
                </p>
              </Notatka>
              {karty}
              {sloty}
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
