'use client';

// ViewLeaveRequestForm (u28 i u32): krok 2 kreatora wniosku o urlop do pracodawcy w 7 wariantach rodzaju wniosku.
// Krok ma części (?czesc=N) według rodzaju wniosku (czesciFormularzaUrlopu); każda część mieści się w oknie.
import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { OkresWniosku, PodrodzajWnioskuOUrlop, WniosekOUrlop } from '@/domena/typy';
import {
  WYMIAR_MACIERZYNSKIEGO_TYGODNI,
  listaZalacznikow,
  propozycjeFormularza,
  wymiarRodzicielskiego,
} from '@/domena/wnioski/urlopy';
import { Ikona } from '@/komponenty/ikona';
import {
  czyPoprawny,
  ocenFormularz,
  odpowiedziProponowane,
  odpowiedziZeSzkicu,
  type OdpowiedziFormularza,
  type PoleFormularza,
} from '@/domena/wnioski/urlopy-warianty';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokWnioskuOUrlop } from '@/dane/magazyn/operacje/wnioski-urlop';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import {
  czesciFormularzaUrlopu,
  DaneNaTle,
  RamaKreatora,
  useKreatorUrlopu,
  type SekcjaFormularzaUrlopu,
  type StanKreatora,
} from '../_czesci/kreator';

const t = teksty.ViewLeaveRequestForm;
const tt = teksty.ViewLeaveRequestType;

/** Cel fokusu pól w kolejności na ekranie; dla grup radio nazwa grupy. */
const CELE_FOKUSU: Record<Exclude<PoleFormularza, 'okres'>, string> = {
  numerCzesci: 'urlop-numer-czesci',
  zakres: 'zakres',
  ojcowskiWczesniej: 'ojcowski-wczesniej',
  dataPoczatku: 'urlop-data-poczatku',
  dni: 'urlop-dni',
  dataKonca: 'urlop-data-konca',
  tygodnie: 'urlop-tygodnie',
  wymiarPracy: 'urlop-wymiar-pracy',
  oswiadczenieLaczenia: 'laczenie-wydluzenie',
  wymiarWydluzenia: 'urlop-wymiar-wydluzenia',
  zamiar: 'zamiar',
  oswiadczenieUzupelniajacy: 'urlop-oswiadczenie-uzupelniajacy',
};

/** Pola sekcji kroku do walidacji części. */
function polaSekcji(podrodzaj: PodrodzajWnioskuOUrlop, sekcja: SekcjaFormularzaUrlopu): PoleFormularza[] {
  switch (sekcja) {
    case 'okres':
      switch (podrodzaj) {
        case 'czesc-przed-porodem':
          return ['dataPoczatku'];
        case 'macierzynski-z-rodzicielskim':
          return ['zakres'];
        case 'rodzicielski':
          return ['dataPoczatku', 'tygodnie'];
        case 'ojcowski':
          return ['dni', 'dataPoczatku'];
        case 'uzupelniajacy':
          return ['tygodnie'];
        case 'na-warunkach-macierzynskiego':
          return ['dataPoczatku', 'zakres'];
        case 'laczenie-z-praca':
          return ['wymiarPracy', 'dataPoczatku', 'dataKonca'];
        default:
          return [];
      }
    case 'czesci':
      return ['numerCzesci'];
    case 'oswiadczenie':
      if (podrodzaj === 'ojcowski') return ['ojcowskiWczesniej'];
      if (podrodzaj === 'uzupelniajacy') return ['oswiadczenieUzupelniajacy'];
      return ['zamiar'];
    case 'laczenie':
      return ['oswiadczenieLaczenia', 'wymiarWydluzenia'];
    default:
      return [];
  }
}

function TabelaOkresow({ okresy }: { okresy: OkresWniosku[] }) {
  if (okresy.length === 0) return null;
  return (
    <Tabela
      podpis={t.tabelaPodpis}
      etykietaPrzewijania={t.tabelaPrzewijanie}
      kolumny={[
        { klucz: 'urlop', naglowek: t.kolumnaUrlop },
        { klucz: 'od', naglowek: t.kolumnaOd },
        { klucz: 'do', naglowek: t.kolumnaDo },
        { klucz: 'zasilek', naglowek: t.kolumnaZasilek },
      ]}
      wiersze={okresy.map((o, i) => ({
        id: `${o.rodzajUrlopu}-${i}`,
        urlop: t.rodzajeUrlopu[o.rodzajUrlopu],
        od: formatujDate(o.od),
        do: formatujDate(o.do),
        zasilek: o.stawka === undefined ? '' : t.stawkaPodstawy({ stawka: formatujProcent(o.stawka) }),
      }))}
    />
  );
}

function Licznik({ dni, termin }: { dni: number; termin: string }) {
  if (dni < 0) return null;
  return (
    <div className="mt-4 flex items-start gap-3">
      <Ikona nazwa="zegar" className="flex-none text-brand" />
      <p className="m-0">{t.licznik({ dni: t.liczbaDni({ n: dni }), data: formatujDate(termin) })}</p>
    </div>
  );
}

export function WidokFormularzaWnioskuOUrlop() {
  const stan = useKreatorUrlopu();
  const wniosek = stan?.wniosek ?? null;
  const podrodzaj = wniosek?.podrodzaj;
  const poczatkowe = useMemo(() => {
    if (stan === null || !wniosek || !podrodzaj) return null;
    if (wniosek.okresy.length > 0 || wniosek.zakres) return odpowiedziZeSzkicu(wniosek, formatujDate);
    return odpowiedziProponowane(podrodzaj, stan.dane, propozycjeFormularza(podrodzaj, stan.dane), formatujDate);
  }, [stan, wniosek, podrodzaj]);

  if (stan === null) return null;
  if (!wniosek || !podrodzaj || !poczatkowe) {
    return (
      <RamaKreatora krok={2} nazwaKroku={tt.nazwaKroku} idSprawy={null}>
        <StanPusty ikona="wnioski">{t.brakWniosku}</StanPusty>
      </RamaKreatora>
    );
  }
  return <FormularzWniosku key={wniosek.idWniosku} stan={stan} wniosek={wniosek} podrodzaj={podrodzaj} poczatkowe={poczatkowe} />;
}

function FormularzWniosku({
  stan,
  wniosek,
  podrodzaj,
  poczatkowe,
}: {
  stan: StanKreatora;
  wniosek: WniosekOUrlop;
  podrodzaj: PodrodzajWnioskuOUrlop;
  poczatkowe: OdpowiedziFormularza;
}) {
  const { dane, kontekst } = stan;
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const [odpowiedzi, setOdpowiedzi] = useState<OdpowiedziFormularza | null>(null);
  const [bladZapisu, setBladZapisu] = useState<string | null>(null);
  const odp = odpowiedzi ?? poczatkowe;
  const ocena = useMemo(() => ocenFormularz(podrodzaj, odp, dane, kontekst.dzis), [podrodzaj, odp, dane, kontekst.dzis]);

  const sekcjeCzesci = czesciFormularzaUrlopu(podrodzaj);
  const podzial = sekcjeCzesci.map((sekcje) => sekcje.flatMap((s) => polaSekcji(podrodzaj, s)));
  const walidacja = useWalidacjaNaBiezaco({ wartosci: odp, waliduj: () => ocena.bledy, pola: CELE_FOKUSU });
  const czesci = useCzesciFormularza({ liczba: sekcjeCzesci.length, podzial, walidacja });

  const zmien = (z: Partial<OdpowiedziFormularza>) => setOdpowiedzi({ ...odp, ...z });

  function zapisz(cel: 'dalej' | 'wstecz' | 'dokonczenie') {
    if (cel === 'dalej' && !czyPoprawny(ocena)) {
      walidacja.sprobujWyslac();
      return;
    }
    ustawZajety(true);
    const zalaczniki = listaZalacznikow(podrodzaj, dane).map((z) => wniosek.zalaczniki.find((s) => s.id === z.id) ?? z);
    const zmiana = { ...(ocena.zmiana ?? {}), zalaczniki };
    const ekran = cel === 'dalej' ? 'ViewLeaveRequestSummary' : cel === 'wstecz' ? 'ViewLeaveRequestType' : 'ViewLeaveRequestForm';
    const wynik = zapiszKrokWnioskuOUrlop(wniosek.idWniosku, zmiana, ekran, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawZajety(false);
      setBladZapisu(wynik.kod);
      return;
    }
    if (cel === 'dalej') przejdz(trasy.ViewLeaveRequestSummary({ wniosek: wniosek.idWniosku }));
    else if (cel === 'wstecz') przejdz(trasy.ViewLeaveRequestType({ wniosek: wniosek.idWniosku }));
    else {
      ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
      przejdz(trasy.ViewCaseGuide({ idSprawy: wynik.wartosc.idSprawy }));
    }
  }

  const nazwa = t.nazwyWnioskow[podrodzaj];
  const daneWniosku: { etykieta: string; wartosc: ReactNode }[] = [{ etykieta: t.pracownik, wartosc: dane.imieINazwisko }];
  if (dane.przyjecie) {
    daneWniosku.push({ etykieta: t.przyjecie, wartosc: t.przyjecieOpis({ forma: t.formyPrzyjecia[dane.przyjecie.forma], data: formatujDate(dane.przyjecie.dataPrzyjecia) }) });
    daneWniosku.push({ etykieta: t.dataUrodzeniaDziecka, wartosc: formatujDate(dane.przyjecie.dataUrodzeniaDziecka) });
    daneWniosku.push({ etykieta: t.liczbaPrzyjetych, wartosc: String(dane.przyjecie.liczbaPrzyjetychDzieci) });
  } else if (podrodzaj === 'czesc-przed-porodem') {
    if (dane.przewidywanyTerminPorodu) daneWniosku.push({ etykieta: t.przewidywanyTermin, wartosc: formatujDate(dane.przewidywanyTerminPorodu) });
    daneWniosku.push({ etykieta: t.liczbaDzieci, wartosc: String(dane.liczbaDzieci) });
  } else {
    if (dane.dziecko && dane.dziecko.dataUrodzenia) {
      const imie = [dane.dziecko.imie, dane.dziecko.nazwisko].filter(Boolean).join(' ');
      daneWniosku.push({ etykieta: t.dziecko, wartosc: imie ? t.dzieckoUr({ imieINazwisko: imie, data: formatujDate(dane.dziecko.dataUrodzenia) }) : formatujDate(dane.dziecko.dataUrodzenia) });
    }
    if (dane.dataPorodu) daneWniosku.push({ etykieta: t.dataPorodu, wartosc: formatujDate(dane.dataPorodu) });
    daneWniosku.push({ etykieta: t.liczbaDzieci, wartosc: String(dane.liczbaDzieci) });
  }

  const podpowiedzDaty = ocena.zakresDaty
    ? podrodzaj === 'ojcowski'
      ? t.zakresDatOjcowski({ od: formatujDate(ocena.zakresDaty.od), do: formatujDate(ocena.zakresDaty.do), dni: t.liczbaDni({ n: Number(odp.dni) || 14 }) })
      : t.zakresDat({ od: formatujDate(ocena.zakresDaty.od), do: formatujDate(ocena.zakresDaty.do) })
    : undefined;

  const poleDaty = (etykieta: string, pole: 'dataPoczatku' | 'dataKonca' = 'dataPoczatku', zakres = ocena.zakresDaty) => (
    <PoleDaty
      id={CELE_FOKUSU[pole]}
      etykieta={etykieta}
      podpowiedz={pole === 'dataPoczatku' ? podpowiedzDaty : zakres ? t.zakresDat({ od: formatujDate(zakres.od), do: formatujDate(zakres.do) }) : undefined}
      wartosc={odp[pole]}
      onZmiana={(w) => zmien({ [pole]: w })}
      {...walidacja.pole(pole)}
      szerokosc="waska"
    />
  );

  /** Ostrzeżenie o terminie pola daty, gdy pole nie pokazuje błędu. */
  const ostrzezenie = (pole: 'dataPoczatku' | 'dataKonca') =>
    ocena.ostrzezenia[pole] && !walidacja.blad(pole) ? <Komunikat kod={ocena.ostrzezenia[pole]!} /> : null;

  const zakresWniosku = (naWarunkach: boolean) => (
    <div className="flex flex-col gap-3">
      <GrupaOpcji
        nazwa={CELE_FOKUSU.zakres}
        legenda={t.zakresWniosku}
        uklad="karty"
        wartosc={odp.zakres}
        onZmiana={(w) => zmien({ zakres: w })}
        {...walidacja.pole('zakres')}
        opcje={[
          { wartosc: 'z-calym-rodzicielskim', etykieta: naWarunkach ? t.zakresCalyNaWarunkach : t.zakresCaly, opis: t.zakresCalyOpis },
          { wartosc: naWarunkach ? 'wylacznie-na-warunkach' : 'wylacznie-macierzynski', etykieta: naWarunkach ? t.zakresNaWarunkach : t.zakresMacierzynski, opis: t.zakresWylacznieOpis },
        ]}
      />
      {ocena.informacjaZakresu ? <Komunikat kod={ocena.informacjaZakresu} /> : null}
      {ocena.termin815 && !ocena.informacjaZakresu ? <Licznik dni={ocena.termin815.zostaloDni} termin={ocena.termin815.termin} /> : null}
    </div>
  );

  const stawkaOpis = ocena.okresy.length > 0
    ? ocena.wariant === '81-5' ? t.stawka815 : podrodzaj === 'rodzicielski' ? t.stawka70 : ocena.okresy.some((o) => o.rodzajUrlopu === 'rodzicielski') || podrodzaj === 'macierzynski-z-rodzicielskim' || podrodzaj === 'na-warunkach-macierzynskiego' ? t.stawka10070 : t.stawka100
    : null;

  const kartaZamiaru = (
    <Karta tytul={t.zamiarTytul} bezLinii>
      <GrupaOpcji
        nazwa={CELE_FOKUSU.zamiar}
        legenda={t.zamiarLegenda}
        uklad="poziomo"
        wartosc={odp.zamiarDrugiegoRodzica === null ? null : odp.zamiarDrugiegoRodzica ? 'tak' : 'nie'}
        onZmiana={(w) => zmien({ zamiarDrugiegoRodzica: w === 'tak' })}
        {...walidacja.pole('zamiar')}
        podpowiedz={t.zamiarOpis}
        opcje={[{ wartosc: 'tak', etykieta: t.tak }, { wartosc: 'nie', etykieta: t.nie }]}
      />
    </Karta>
  );

  const kartaWynikow = (dodatek?: ReactNode) => (
    <Karta tytul={t.tabelaPodpis} bezLinii>
      <div className="flex flex-col gap-4">
        <TabelaOkresow okresy={ocena.okresy} />
        {stawkaOpis ? <p className="m-0 text-body-strong">{stawkaOpis}</p> : null}
        {dodatek}
      </div>
    </Karta>
  );

  const zalaczniki = listaZalacznikow(podrodzaj, dane);

  function sekcja(nazwaSekcji: SekcjaFormularzaUrlopu): ReactNode {
    if (nazwaSekcji === 'dane') {
      return (
        <Karta tytul={t.daneTytul} bezLinii>
          <Notatka className="mb-4">{t.daneNotatka}</Notatka>
          <p className="m-0 mb-2">{teksty.wspolne.stanNa({ data: formatujDate(kontekst.dzis) })}</p>
          <DaneNaTle pozycje={daneWniosku} />
        </Karta>
      );
    }
    if (nazwaSekcji === 'zalaczniki') {
      return (
        <Karta tytul={t.zalacznikiTytul} bezLinii>
          {zalaczniki.length === 0 ? (
            <p className="m-0">{t.bezZalacznikow}</p>
          ) : (
            <>
              <ul className="m-0 grid gap-2 pl-5">
                {zalaczniki.map((z) => (
                  <li key={z.id} className="first-letter:uppercase">
                    {t.zalaczniki[z.id]}
                  </li>
                ))}
              </ul>
              <p className="m-0 mt-4">{t.zalacznikiOpis}</p>
            </>
          )}
        </Karta>
      );
    }
    switch (podrodzaj) {
      case 'czesc-przed-porodem':
        if (nazwaSekcji !== 'okres') return null;
        return (
          <Karta tytul={t.okresTytul} bezLinii>
            <div className="flex flex-col gap-4">
              {poleDaty(t.dataPoczatku)}
              {ostrzezenie('dataPoczatku')}
              <p className="m-0">{t.doDniaPorodu}</p>
            </div>
          </Karta>
        );
      case 'macierzynski-z-rodzicielskim': {
        const mac = ocena.okresMacierzynskiego;
        if (nazwaSekcji === 'okres') {
          return (
            <Karta tytul={t.okresTytul} bezLinii>
              {mac ? (
                <DaneNaTle
                  pozycje={[{ etykieta: t.rodzajeUrlopu.macierzynski, wartosc: t.okresOpis({ od: formatujDate(mac.od), do: formatujDate(mac.do), opis: t.odDniaPorodu({ tygodnie: t.liczbaTygodni({ n: WYMIAR_MACIERZYNSKIEGO_TYGODNI[dane.liczbaDzieci] }) }) }) }]}
                />
              ) : null}
              <div className={mac ? 'mt-6' : undefined}>{zakresWniosku(false)}</div>
            </Karta>
          );
        }
        if (nazwaSekcji === 'wyniki') {
          const { calkowity } = wymiarRodzicielskiego(dane.liczbaDzieci, dane.zaZyciem);
          return kartaWynikow(<Notatka>{t.notatkaRodzicielski({ tygodnie: t.liczbaTygodni({ n: calkowity }) })}</Notatka>);
        }
        if (nazwaSekcji === 'oswiadczenie') return odp.zakres !== 'wylacznie-macierzynski' ? kartaZamiaru : null;
        return null;
      }
      case 'rodzicielski': {
        const r = ocena.rodzicielski!;
        if (nazwaSekcji === 'czesci') {
          return (
            <Karta tytul={t.czesciTytul} bezLinii>
              {r.czesci.length === 0 ? (
                <p className="m-0">{t.brakCzesci}</p>
              ) : (
                <Tabela
                  podpis={t.czesciPodpis}
                  etykietaPrzewijania={t.czesciPodpis}
                  kolumny={[
                    { klucz: 'czesc', naglowek: t.kolumnaCzesc },
                    { klucz: 'rodzic', naglowek: t.kolumnaRodzic },
                    { klucz: 'od', naglowek: t.kolumnaOd },
                    { klucz: 'do', naglowek: t.kolumnaDo },
                    { klucz: 'tygodnie', naglowek: t.kolumnaTygodnie, liczbowa: true },
                  ]}
                  wiersze={r.czesci.map((c, i) => ({
                    id: `${c.od}-${i}`,
                    czesc: `${i + 1}.`,
                    rodzic: c.rodzic === 'matka' ? t.rodzicMatka : t.rodzicDrugi,
                    od: formatujDate(c.od),
                    do: formatujDate(c.do),
                    tygodnie: String(c.tygodnie),
                  }))}
                />
              )}
              <p className="m-0 mt-4">{t.wykorzystano({ wykorzystane: r.wlasne, limit: t.liczbaTygodni({ n: r.limitRodzica }) })}</p>
              <p className="m-0 text-body-strong">{t.pozostalo({ tygodnie: t.liczbaTygodni({ n: r.pozostalo }) })}</p>
              <p id={CELE_FOKUSU.numerCzesci} tabIndex={-1} className="m-0 mt-4">{t.numerCzesci({ numer: r.numerCzesci })}</p>
              {walidacja.blad('numerCzesci') ? <Komunikat kod={walidacja.blad('numerCzesci')!} className="mt-2" /> : null}
            </Karta>
          );
        }
        if (nazwaSekcji === 'okres') {
          return (
            <Karta tytul={t.okresTytul} bezLinii>
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-start gap-6">
                  {poleDaty(t.dataPoczatku)}
                  <PoleLiczby
                    id={CELE_FOKUSU.tygodnie}
                    etykieta={t.tygodnie}
                    podpowiedz={ocena.zakresTygodni ? t.zakresLiczby(ocena.zakresTygodni) : undefined}
                    wartosc={odp.tygodnie}
                    onZmiana={(w) => zmien({ tygodnie: w })}
                    {...walidacja.pole('tygodnie')}
                    szerokosc="waska"
                  />
                </div>
                {ostrzezenie('dataPoczatku')}
                <TabelaOkresow okresy={ocena.okresy} />
                {stawkaOpis ? <p className="m-0 text-body-strong">{stawkaOpis}</p> : null}
              </div>
            </Karta>
          );
        }
        if (nazwaSekcji === 'oswiadczenie') return kartaZamiaru;
        return null;
      }
      case 'ojcowski':
        if (nazwaSekcji === 'oswiadczenie') {
          return (
            <Karta tytul={t.ojcowskiTytul} bezLinii>
              <GrupaOpcji
                nazwa={CELE_FOKUSU.ojcowskiWczesniej}
                legenda={t.ojcowskiLegenda}
                uklad="karty"
                wartosc={odp.wczesniejszyOjcowski}
                onZmiana={(w) => zmien({ wczesniejszyOjcowski: w, dni: w === '7-dni' ? '7' : odp.dni })}
                {...walidacja.pole('ojcowskiWczesniej')}
                opcje={[{ wartosc: 'nie', etykieta: t.ojcowskiNie }, { wartosc: '7-dni', etykieta: t.ojcowskiTak }]}
              />
            </Karta>
          );
        }
        if (nazwaSekcji === 'okres') {
          return (
            <Karta tytul={t.okresTytul} bezLinii>
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-start gap-6">
                  <PoleLiczby
                    id={CELE_FOKUSU.dni}
                    etykieta={t.dni}
                    podpowiedz={ocena.zakresDni ? t.zakresDni(ocena.zakresDni) : undefined}
                    wartosc={odp.dni}
                    onZmiana={(w) => zmien({ dni: w })}
                    {...walidacja.pole('dni')}
                    szerokosc="waska"
                  />
                  {poleDaty(t.dataPoczatku)}
                </div>
                {ostrzezenie('dataPoczatku')}
                <TabelaOkresow okresy={ocena.okresy} />
                {stawkaOpis ? <p className="m-0 text-body-strong">{stawkaOpis}</p> : null}
              </div>
            </Karta>
          );
        }
        return null;
      case 'uzupelniajacy':
        if (nazwaSekcji === 'okres') {
          return (
            <Karta tytul={t.okresTytul} bezLinii>
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-start gap-6">
                  {ocena.okresMacierzynskiego ? (
                    <DaneNaTle pozycje={[{ etykieta: t.ostatniDzienMacierzynskiego, wartosc: formatujDate(ocena.okresMacierzynskiego.do) }]} />
                  ) : null}
                  <PoleLiczby
                    id={CELE_FOKUSU.tygodnie}
                    etykieta={t.tygodnie}
                    podpowiedz={
                      <>
                        {ocena.zakresTygodni ? t.zakresLiczby(ocena.zakresTygodni) : null}{' '}
                        {dane.wymiarK11 ? t.wymiarK11({ tygodnie: t.liczbaTygodni({ n: dane.wymiarK11 }) }) : null}
                      </>
                    }
                    wartosc={odp.tygodnie}
                    onZmiana={(w) => zmien({ tygodnie: w })}
                    {...walidacja.pole('tygodnie')}
                    szerokosc="waska"
                  />
                </div>
                {ocena.ostrzezenia.okres ? <Komunikat kod={ocena.ostrzezenia.okres} /> : null}
                <TabelaOkresow okresy={ocena.okresy} />
                {stawkaOpis ? <p className="m-0 text-body-strong">{stawkaOpis}</p> : null}
              </div>
            </Karta>
          );
        }
        if (nazwaSekcji === 'oswiadczenie') {
          return (
            <Karta tytul={t.uzupelniajacyOswiadczenieTytul} bezLinii>
              <PoleZaznaczenia
                id={CELE_FOKUSU.oswiadczenieUzupelniajacy}
                etykieta={t.uzupelniajacyOswiadczenie}
                zaznaczone={odp.drugiRodzicBezUzupelniajacego}
                onZmiana={(z) => zmien({ drugiRodzicBezUzupelniajacego: z })}
                {...walidacja.pole('oswiadczenieUzupelniajacy')}
              />
            </Karta>
          );
        }
        return null;
      case 'na-warunkach-macierzynskiego':
        if (nazwaSekcji === 'okres') {
          return (
            <Karta tytul={t.okresTytul} bezLinii>
              <div className="flex flex-col gap-6">
                {poleDaty(t.dataPoczatku)}
                {ostrzezenie('dataPoczatku')}
                {zakresWniosku(true)}
              </div>
            </Karta>
          );
        }
        if (nazwaSekcji === 'wyniki') return kartaWynikow();
        return null;
      case 'laczenie-z-praca': {
        if (nazwaSekcji === 'okres') {
          return (
            <Karta tytul={t.okresTytul} bezLinii>
              <div className="flex flex-col gap-6">
                {ocena.zakresDaty ? (
                  <DaneNaTle pozycje={[{ etykieta: t.laczenieOkresRodzicielskiego, wartosc: `${formatujDate(ocena.zakresDaty.od)} – ${formatujDate(ocena.zakresDaty.do)}` }]} />
                ) : null}
                <div className="flex flex-wrap items-start gap-6">
                  <PoleLiczby
                    id={CELE_FOKUSU.wymiarPracy}
                    etykieta={t.wymiarPracy}
                    podpowiedz={t.wymiarPracyPodpowiedz}
                    jednostka={t.procentEtatu}
                    wartosc={odp.wymiarPracy}
                    onZmiana={(v) => zmien({ wymiarPracy: v })}
                    {...walidacja.pole('wymiarPracy')}
                    szerokosc="waska"
                  />
                  {poleDaty(t.dataPoczatkuLaczenia)}
                </div>
                {poleDaty(t.dataKoncaLaczenia, 'dataKonca', ocena.zakresDatyKonca)}
                {ostrzezenie('dataPoczatku')}
                {ostrzezenie('dataKonca')}
              </div>
            </Karta>
          );
        }
        if (nazwaSekcji === 'laczenie') {
          return (
            <Karta tytul={t.laczenieTytul} bezLinii>
              <div className="flex flex-col gap-6">
                <GrupaOpcji
                  nazwa={CELE_FOKUSU.oswiadczenieLaczenia}
                  legenda={t.laczenieLegenda}
                  uklad="poziomo"
                  wartosc={odp.laczenieCzesciZWydluzenia === null ? null : odp.laczenieCzesciZWydluzenia ? 'tak' : 'nie'}
                  onZmiana={(v) => zmien({ laczenieCzesciZWydluzenia: v === 'tak', wymiarWCzesciZWydluzenia: odp.wymiarWCzesciZWydluzenia || odp.wymiarPracy })}
                  {...walidacja.pole('oswiadczenieLaczenia')}
                  opcje={[{ wartosc: 'tak', etykieta: t.tak }, { wartosc: 'nie', etykieta: t.nie }]}
                />
                {odp.laczenieCzesciZWydluzenia ? (
                  <PoleLiczby
                    id={CELE_FOKUSU.wymiarWydluzenia}
                    etykieta={t.wymiarWydluzenia}
                    podpowiedz={t.wymiarPracyPodpowiedz}
                    jednostka={t.procentEtatu}
                    wartosc={odp.wymiarWCzesciZWydluzenia}
                    onZmiana={(v) => zmien({ wymiarWCzesciZWydluzenia: v })}
                    {...walidacja.pole('wymiarWydluzenia')}
                    szerokosc="waska"
                  />
                ) : null}
              </div>
            </Karta>
          );
        }
        if (nazwaSekcji === 'wydluzenie') {
          const w = ocena.wydluzenie;
          if (!w) return null;
          return (
            <Karta tytul={t.wydluzenieTytul} bezLinii>
              <DaneNaTle
                pozycje={[
                  { etykieta: t.dniLaczenia, wartosc: t.liczbaDni({ n: w.dniLaczenia }) },
                  { etykieta: t.dniWydluzenia, wartosc: t.liczbaDni({ n: w.dniWydluzenia }) },
                  { etykieta: t.ostatniDzien, wartosc: formatujDate(w.ostatniDzienUrlopu) },
                  { etykieta: t.okresLaczenia, wartosc: `${formatujDate(w.okres.od)} – ${formatujDate(w.okres.do)}` },
                ]}
              />
              <p className="m-0 mt-4">{t.opisObliczenia}</p>
            </Karta>
          );
        }
        return null;
      }
      default:
        return nazwaSekcji === 'okres' ? <Karta tytul={t.okresTytul} bezLinii>{null}</Karta> : null;
    }
  }

  return (
    <RamaKreatora
      krok={2}
      czesc={czesci.czesc}
      podrodzaj={podrodzaj}
      nazwaKroku={nazwa}
      idSprawy={wniosek.idSprawy}
      idWniosku={wniosek.idWniosku}
      boczna={
        <>
          <Karta tytul={t.ochronaTytul} bezLinii>
            <p className="m-0">{t.ochronaTresc}</p>
          </Karta>
          <Karta tytul={t.skadTytul} bezLinii>
            <p className="m-0">{t.skadTresc}</p>
          </Karta>
        </>
      }
    >
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          czesci.dalej(() => zapisz('dalej'));
        }}
      >
        {sekcjeCzesci[czesci.czesc - 1].map((s) => (
          <Fragment key={s}>{sekcja(s)}</Fragment>
        ))}
        {bladZapisu ? <Komunikat kod={bladZapisu as '0003'} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Przycisk type="button" wariant="drugorzedny" disabled={zajety} onClick={() => czesci.wroc(() => zapisz('wstecz'))}>
            {tt.wstecz}
          </Przycisk>
          <div className="flex flex-wrap gap-4">
            <Przycisk type="button" wariant="tlo" ikona="zapisz" disabled={zajety} onClick={() => zapisz('dokonczenie')}>
              {tt.zapiszDoDokonczenia}
            </Przycisk>
            <Przycisk type="submit" wariant="glowny" zajety={zajety}>
              {tt.dalej}
            </Przycisk>
          </div>
        </div>
      </form>
    </RamaKreatora>
  );
}
