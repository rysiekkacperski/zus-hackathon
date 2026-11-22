'use client';

// ViewLeaveRequestType (u28): krok 1 kreatora wniosku o urlop do pracodawcy, wybór rodzaju wniosku (R-1, R-2).
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatujDate, porownajDaty } from '@/domena/daty';
import { czyWychowawczy, dataSzesciuMiesiecyZatrudnienia } from '@/domena/wnioski/urlopy-wychowawczy';
import type { KodKomunikatu, PodrodzajWnioskuOUrlop } from '@/domena/typy';
import {
  idSprawyWniosku,
  pozycjaSprawyWniosku,
  rodzajeWniosku,
  stawkaZasilku,
  wymiaryDanych,
} from '@/domena/wnioski/urlopy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import {
  rozpocznijLubWznowWniosekOUrlop,
  szkicDlaSprawy,
  zapiszKrokWnioskuOUrlop,
} from '@/dane/magazyn/operacje/wnioski-urlop';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { ODNOSNIKI } from '@/dane/katalog/pozycje';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { KartaWiecejInformacji } from '@/komponenty/karta-wiecej-informacji';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import { KartaDanychZProfilu, RamaKreatora, useKreatorUrlopu } from '../_czesci/kreator';
import { przekierowanieZKreatoraUrlopu } from '../_czesci/przekierowanie-do-zam';

const t = teksty.ViewLeaveRequestType;
const tf = teksty.ViewLeaveRequestForm;

export function WidokRodzajuWnioskuOUrlop() {
  const stan = useKreatorUrlopu();
  const router = useRouter();
  const parametry = useSearchParams();
  const sprawaWejscia = parametry.get('sprawa');
  const scenariusz = parametry.get('scenariusz');

  const przekierowanie = useMemo(
    () => (stan === null ? null : przekierowanieZKreatoraUrlopu(stan.kontekst.konto, stan.kontekst.rodzina, sprawaWejscia)),
    [stan, sprawaWejscia],
  );

  const wniosekWejscia = useMemo(() => {
    if (stan === null) return null;
    if (stan.wniosek) return stan.wniosek;
    return sprawaWejscia ? szkicDlaSprawy(stan.kontekst.rodzina, stan.kontekst.konto.pesel, sprawaWejscia) : null;
  }, [stan, sprawaWejscia]);

  const [wybor, setWybor] = useState<PodrodzajWnioskuOUrlop | null>(null);
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const przekierowano = useRef(false);

  useEffect(() => {
    if (przekierowanie === null || przekierowano.current) return;
    przekierowano.current = true;
    if (przekierowanie.kod) ustawKomunikatPoPrzejsciu({ kod: przekierowanie.kod, dlaWidoku: przekierowanie.cel });
    router.replace(przekierowanie.sciezka);
  }, [przekierowanie, router]);

  const rodzaje = useMemo(() => {
    if (stan === null) return [];
    const { kontekst } = stan;
    const wszystkie = rodzajeWniosku(kontekst.rola, kontekst.rodzina, kontekst.rodzina.plan, kontekst.rodzina.wnioski, kontekst.dzis, wymiaryDanych(stan.dane));
    // Sprawa K23 Urlop wychowawczy prowadzi do wniosków o urlop wychowawczy i o obniżenie wymiaru czasu pracy (3.9.6.1.5).
    const sprawa = sprawaWejscia ?? wniosekWejscia?.idSprawy ?? '';
    const zK23 = sprawa.startsWith('K23');
    return wszystkie.filter((r) => (r === 'wychowawczy' || r === 'obnizenie-wymiaru') === zK23);
  }, [stan, sprawaWejscia, wniosekWejscia]);

  const wybrany = wybor ?? (wniosekWejscia?.podrodzaj && rodzaje.includes(wniosekWejscia.podrodzaj) ? wniosekWejscia.podrodzaj : null);
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { rodzaj: wybrany },
    waliduj: (w: { rodzaj: PodrodzajWnioskuOUrlop | null }): { rodzaj: KodKomunikatu | null } => ({
      rodzaj: rodzaje.length > 0 && w.rodzaj === null ? '0006' : null,
    }),
    pola: { rodzaj: 'rodzaj-wniosku' },
  });

  if (stan === null || przekierowanie !== null) return <SzkieletWidoku />;
  const { kontekst, dane } = stan;
  const idSprawyPowrotu = wniosekWejscia?.idSprawy ?? sprawaWejscia;
  // Urlop wychowawczy i obniżenie wymiaru czasu pracy po 6 miesiącach zatrudnienia (3.9.6.1.5, KA-02 i KA-03).
  const dataStazu = rodzaje.some((r) => czyWychowawczy(r)) ? dataSzesciuMiesiecyZatrudnienia(dane.okresyZatrudnienia) : null;
  const przedStazem = dataStazu !== null && porownajDaty(dataStazu, kontekst.dzis) > 0;
  const termin = stawkaZasilku({ zakres: 'z-calym-rodzicielskim', dzis: kontekst.dzis, dataPorodu: dane.dataPoroduPotwierdzona ? dane.dataPorodu : undefined, przyjecie: dane.przyjecie, wymiary: dane.wymiary });

  function zapisz(cel: 'dalej' | 'dokonczenie') {
    if (stan === null) return;
    if (cel === 'dalej' && !walidacja.sprobujWyslac()) return;
    if (cel === 'dalej' && przedStazem && czyWychowawczy(wybrany ?? undefined)) return;
    setBlad(null);
    ustawZajety(true);
    const ctx = pobierzKontekstOperacji();
    const idSprawy = wybrany
      ? idSprawyWniosku(kontekst.rodzina.plan, pozycjaSprawyWniosku(wybrany, dane.rodzic, dane.przyjecie !== undefined), dane.rodzic)
      : (idSprawyPowrotu ?? 'K07');
    const start = wniosekWejscia
      ? { ok: true as const, wartosc: wniosekWejscia }
      : rozpocznijLubWznowWniosekOUrlop(idSprawy, scenariusz ? Number(scenariusz) : undefined, ctx);
    if (!start.ok) {
      ustawZajety(false);
      setBlad(start.kod);
      return;
    }
    const zmianaRodzaju = wybrany !== null && start.wartosc.podrodzaj !== wybrany;
    const zmiana = wybrany === null
      ? {}
      : zmianaRodzaju
        ? { podrodzaj: wybrany, idSprawy, okresy: [], zakres: undefined, wariant: undefined, stawkaWSzkicu: undefined, oswiadczenia: {}, laczenie: undefined, numerCzesci: undefined, zalaczniki: [] }
        : { podrodzaj: wybrany, idSprawy };
    const ekran = cel === 'dalej' ? 'ViewLeaveRequestForm' : 'ViewLeaveRequestType';
    const wynik = zapiszKrokWnioskuOUrlop(start.wartosc.idWniosku, zmiana, ekran, ctx);
    if (!wynik.ok) {
      ustawZajety(false);
      setBlad(wynik.kod);
      return;
    }
    if (cel === 'dalej') {
      przejdz(trasy.ViewLeaveRequestForm({ wniosek: wynik.wartosc.idWniosku }));
    } else {
      ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
      przejdz(trasy.ViewCaseGuide({ idSprawy: wynik.wartosc.idSprawy }));
    }
  }

  const boczna = (
    <>
      <KartaDanychZProfilu dane={dane} />
      {termin.termin && termin.zostaloDni !== undefined && (rodzaje.includes('macierzynski-z-rodzicielskim') || rodzaje.includes('na-warunkach-macierzynskiego')) ? (
        <Karta tytul={t.terminTytul} bezLinii>
          <p className="m-0">
            {termin.zostaloDni >= 0
              ? t.terminTresc({ data: formatujDate(termin.termin), dni: tf.liczbaDni({ n: termin.zostaloDni }) })
              : t.terminMinal({ data: formatujDate(termin.termin) })}
          </p>
        </Karta>
      ) : null}
      <KartaWiecejInformacji odnosniki={[ODNOSNIKI.mrpips, ODNOSNIKI.pip, ODNOSNIKI.zus]} />
    </>
  );

  return (
    <RamaKreatora
      krok={1}
      podrodzaj={wybrany}
      nazwaKroku={t.nazwaKroku}
      idSprawy={idSprawyPowrotu}
      idWniosku={wniosekWejscia?.idWniosku}
      boczna={boczna}
    >
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          zapisz('dalej');
        }}
      >
        <Karta tytul={t.tytulListy} bezLinii>
          {rodzaje.length === 0 ? (
            <p className="m-0">{t.brakRodzajow}</p>
          ) : (
            <GrupaOpcji
              nazwa="rodzaj-wniosku"
              legenda={t.legenda}
              uklad="karty"
              wartosc={wybrany}
              onZmiana={(w) => {
                setWybor(w);
                setBlad(null);
              }}
              {...walidacja.pole('rodzaj')}
              opcje={rodzaje.map((r) => ({
                wartosc: r,
                etykieta: t.rodzaje[r].etykieta,
                opis: t.rodzaje[r].opis,
                wylaczona: przedStazem && czyWychowawczy(r),
              }))}
            />
          )}
          {przedStazem && dataStazu ? (
            <div className="mt-4">
              <Komunikat kod="0287" parametry={{ data: formatujDate(dataStazu) }} />
            </div>
          ) : null}
          {rodzaje.length === 1 && rodzaje[0] === 'czesc-przed-porodem' ? (
            <Notatka className="mt-4">{t.notatkaPrzedPorodem}</Notatka>
          ) : null}
        </Karta>
        {blad ? <Komunikat kod={blad} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {idSprawyPowrotu ? (
            <Przycisk
              type="button"
              wariant="drugorzedny"
              disabled={zajety}
              onClick={() => przejdz(trasy.ViewCaseGuide({ idSprawy: idSprawyPowrotu }))}
            >
              {t.wstecz}
            </Przycisk>
          ) : (
            <span />
          )}
          <div className="flex flex-wrap gap-4">
            <Przycisk type="button" wariant="tlo" ikona="zapisz" disabled={zajety} onClick={() => zapisz('dokonczenie')}>
              {t.zapiszDoDokonczenia}
            </Przycisk>
            <Przycisk type="submit" wariant="glowny" zajety={zajety} disabled={rodzaje.length === 0}>
              {t.dalej}
            </Przycisk>
          </div>
        </div>
      </form>
    </RamaKreatora>
  );
}
