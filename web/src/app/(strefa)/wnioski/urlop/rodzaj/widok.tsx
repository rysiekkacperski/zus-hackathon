'use client';

// ViewLeaveRequestType (u28): krok 1 kreatora wniosku o urlop do pracodawcy, wybór rodzaju wniosku (R-1, R-2).
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatujDate } from '@/domena/daty';
import type { KodKomunikatu, PodrodzajWnioskuOUrlop } from '@/domena/typy';
import {
  idSprawyWniosku,
  otworzKreatorWnioskow,
  pozycjaSprawyWniosku,
  rodzajeWniosku,
  stawkaZasilku,
} from '@/domena/wnioski/urlopy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import {
  rozpocznijLubWznowWniosekOUrlop,
  szkicDlaSprawy,
  zapiszKrokWnioskuOUrlop,
} from '@/dane/magazyn/operacje/wnioski-urlop';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import { KartaDanychZProfilu, RamaKreatora, useKreatorUrlopu } from '../_czesci/kreator';

const t = teksty.ViewLeaveRequestType;
const tf = teksty.ViewLeaveRequestForm;

export function WidokRodzajuWnioskuOUrlop() {
  const stan = useKreatorUrlopu();
  const router = useRouter();
  const parametry = useSearchParams();
  const sprawaWejscia = parametry.get('sprawa');
  const scenariusz = parametry.get('scenariusz');

  const przekierowanie = useMemo(() => {
    if (stan === null) return null;
    const wynik = otworzKreatorWnioskow(stan.kontekst.konto, stan.kontekst.rodzina, sprawaWejscia ?? undefined);
    return wynik.cel === 'ViewLeaveRequestType' ? null : wynik;
  }, [stan, sprawaWejscia]);

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
    router.replace(sciezkaWidoku(przekierowanie.cel, przekierowanie.cel === 'ViewZamLeaveType' ? { sprawa: sprawaWejscia } : {}));
  }, [przekierowanie, router, sprawaWejscia]);

  const rodzaje = useMemo(() => {
    if (stan === null) return [];
    const { kontekst } = stan;
    return rodzajeWniosku(kontekst.rola, kontekst.rodzina, kontekst.rodzina.plan, kontekst.rodzina.wnioski, kontekst.dzis);
  }, [stan]);

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
  const termin = stawkaZasilku({ zakres: 'z-calym-rodzicielskim', dzis: kontekst.dzis, dataPorodu: dane.dataPoroduPotwierdzona ? dane.dataPorodu : undefined, przyjecie: dane.przyjecie });

  function zapisz(cel: 'dalej' | 'dokonczenie') {
    if (stan === null) return;
    if (cel === 'dalej' && !walidacja.sprobujWyslac()) return;
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
              opcje={rodzaje.map((r) => ({ wartosc: r, etykieta: t.rodzaje[r].etykieta, opis: t.rodzaje[r].opis }))}
            />
          )}
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
