'use client';

// ViewLeaveRequestForm (u28 i u32): krok 2 kreatora wniosku o urlop do pracodawcy w 7 wariantach rodzaju wniosku.
import { useRouter } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { OkresWniosku } from '@/domena/typy';
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
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';
import { DaneNaTle, RamaKreatora, useKreatorUrlopu } from '../_czesci/kreator';

const t = teksty.ViewLeaveRequestForm;
const tt = teksty.ViewLeaveRequestType;

const KOLEJNOSC_POL: PoleFormularza[] = [
  'numerCzesci', 'zakres', 'dataPoczatku', 'dataKonca', 'tygodnie', 'ojcowskiWczesniej', 'dni', 'wymiarPracy',
  'oswiadczenieLaczenia', 'wymiarWydluzenia', 'zamiar', 'oswiadczenieUzupelniajacy',
];

const ID_POLA: Partial<Record<PoleFormularza, string>> = {
  dataPoczatku: 'urlop-data-poczatku',
  dataKonca: 'urlop-data-konca',
  tygodnie: 'urlop-tygodnie',
  dni: 'urlop-dni',
  wymiarPracy: 'urlop-wymiar-pracy',
  wymiarWydluzenia: 'urlop-wymiar-wydluzenia',
  oswiadczenieUzupelniajacy: 'urlop-oswiadczenie-uzupelniajacy',
  zakres: idOpcjiGrupy('zakres', 'z-calym-rodzicielskim'),
  zamiar: idOpcjiGrupy('zamiar', 'tak'),
  ojcowskiWczesniej: idOpcjiGrupy('ojcowski-wczesniej', 'nie'),
  oswiadczenieLaczenia: idOpcjiGrupy('laczenie-wydluzenie', 'tak'),
  numerCzesci: 'urlop-numer-czesci',
};

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
  const router = useRouter();
  const [odpowiedzi, setOdpowiedzi] = useState<OdpowiedziFormularza | null>(null);
  const [pokazBledy, setPokazBledy] = useState(false);
  const [bladZapisu, setBladZapisu] = useState<string | null>(null);

  const wniosek = stan?.wniosek ?? null;
  const podrodzaj = wniosek?.podrodzaj;
  const poczatkowe = useMemo(() => {
    if (stan === null || !wniosek || !podrodzaj) return null;
    if (wniosek.okresy.length > 0 || wniosek.zakres) return odpowiedziZeSzkicu(wniosek, formatujDate);
    return odpowiedziProponowane(podrodzaj, stan.dane, propozycjeFormularza(podrodzaj, stan.dane), formatujDate);
  }, [stan, wniosek, podrodzaj]);
  const odp = odpowiedzi ?? poczatkowe;
  const ocena = useMemo(
    () => (stan && podrodzaj && odp ? ocenFormularz(podrodzaj, odp, stan.dane, stan.kontekst.dzis) : null),
    [stan, podrodzaj, odp],
  );

  if (stan === null) return null;
  if (!wniosek || !podrodzaj || !odp || !ocena) {
    return (
      <RamaKreatora krok={2} nazwaKroku={tt.nazwaKroku} idSprawy={null}>
        <StanPusty ikona="wnioski">{t.brakWniosku}</StanPusty>
      </RamaKreatora>
    );
  }
  const { dane, kontekst } = stan;
  const bledy = pokazBledy ? ocena.bledy : {};
  const zmien = (z: Partial<OdpowiedziFormularza>) => setOdpowiedzi({ ...odp, ...z });

  function zapisz(cel: 'dalej' | 'wstecz' | 'dokonczenie') {
    if (!wniosek || !ocena) return;
    if (cel === 'dalej' && !czyPoprawny(ocena)) {
      setPokazBledy(true);
      const pierwsze = KOLEJNOSC_POL.find((p) => ocena.bledy[p]);
      const id = pierwsze ? ID_POLA[pierwsze] : undefined;
      if (id) setTimeout(() => document.getElementById(id)?.focus(), 0);
      return;
    }
    const zalaczniki = listaZalacznikow(podrodzaj!, dane).map((z) => wniosek.zalaczniki.find((s) => s.id === z.id) ?? z);
    const zmiana = { ...(ocena.zmiana ?? {}), zalaczniki };
    const ekran = cel === 'dalej' ? 'ViewLeaveRequestSummary' : cel === 'wstecz' ? 'ViewLeaveRequestType' : 'ViewLeaveRequestForm';
    const wynik = zapiszKrokWnioskuOUrlop(wniosek.idWniosku, zmiana, ekran, pobierzKontekstOperacji());
    if (!wynik.ok) {
      setBladZapisu(wynik.kod);
      return;
    }
    if (cel === 'dalej') router.push(trasy.ViewLeaveRequestSummary({ wniosek: wniosek.idWniosku }));
    else if (cel === 'wstecz') router.push(trasy.ViewLeaveRequestType({ wniosek: wniosek.idWniosku }));
    else {
      ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
      router.push(trasy.ViewCaseGuide({ idSprawy: wynik.wartosc.idSprawy }));
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
    <div className="flex flex-col gap-2">
      <PoleDaty
        id={ID_POLA[pole]!}
        etykieta={etykieta}
        podpowiedz={pole === 'dataPoczatku' ? podpowiedzDaty : zakres ? t.zakresDat({ od: formatujDate(zakres.od), do: formatujDate(zakres.do) }) : undefined}
        wartosc={odp[pole]}
        onZmiana={(w) => zmien({ [pole]: w })}
        blad={bledy[pole] ?? null}
        szerokosc="waska"
      />
      {ocena.ostrzezenia[pole] && !bledy[pole] ? <Komunikat kod={ocena.ostrzezenia[pole]!} /> : null}
    </div>
  );

  const zakresWniosku = (naWarunkach: boolean) => (
    <div className="flex flex-col gap-3">
      <GrupaOpcji
        nazwa="zakres"
        legenda={t.zakresWniosku}
        uklad="karty"
        wartosc={odp.zakres}
        onZmiana={(w) => zmien({ zakres: w })}
        blad={bledy.zakres ?? null}
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
        nazwa="zamiar"
        legenda={t.zamiarLegenda}
        uklad="poziomo"
        wartosc={odp.zamiarDrugiegoRodzica === null ? null : odp.zamiarDrugiegoRodzica ? 'tak' : 'nie'}
        onZmiana={(w) => zmien({ zamiarDrugiegoRodzica: w === 'tak' })}
        blad={bledy.zamiar ?? null}
        podpowiedz={t.zamiarOpis}
        opcje={[{ wartosc: 'tak', etykieta: t.tak }, { wartosc: 'nie', etykieta: t.nie }]}
      />
    </Karta>
  );

  let okres: ReactNode = null;
  let dodatkowe: ReactNode = null;
  switch (podrodzaj) {
    case 'czesc-przed-porodem':
      okres = (
        <>
          {poleDaty(t.dataPoczatku)}
          <p className="m-0 mt-4">{t.doDniaPorodu}</p>
        </>
      );
      break;
    case 'macierzynski-z-rodzicielskim': {
      const mac = ocena.okresMacierzynskiego;
      const { calkowity } = wymiarRodzicielskiego(dane.liczbaDzieci, dane.zaZyciem);
      okres = (
        <>
          {mac ? (
            <DaneNaTle
              pozycje={[{ etykieta: t.rodzajeUrlopu.macierzynski, wartosc: t.okresOpis({ od: formatujDate(mac.od), do: formatujDate(mac.do), opis: t.odDniaPorodu({ tygodnie: t.liczbaTygodni({ n: WYMIAR_MACIERZYNSKIEGO_TYGODNI[dane.liczbaDzieci] }) }) }) }]}
            />
          ) : null}
          <div className="mt-6">{zakresWniosku(false)}</div>
          <div className="mt-6">
            <TabelaOkresow okresy={ocena.okresy} />
          </div>
          {stawkaOpis ? <p className="m-0 mt-4 text-body-strong">{stawkaOpis}</p> : null}
          <Notatka className="mt-4">{t.notatkaRodzicielski({ tygodnie: t.liczbaTygodni({ n: calkowity }) })}</Notatka>
        </>
      );
      if (odp.zakres !== 'wylacznie-macierzynski') dodatkowe = kartaZamiaru;
      break;
    }
    case 'rodzicielski': {
      const r = ocena.rodzicielski!;
      okres = (
        <>
          <h3 className="m-0 mb-3 text-body-strong">{t.czesciTytul}</h3>
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
          <p id={ID_POLA.numerCzesci} tabIndex={-1} className="m-0 mt-4">{t.numerCzesci({ numer: r.numerCzesci })}</p>
          {bledy.numerCzesci ? <Komunikat kod={bledy.numerCzesci} className="mt-2" /> : null}
          <div className="mt-6 flex flex-col gap-6">
            {poleDaty(t.dataPoczatku)}
            <PoleLiczby
              id={ID_POLA.tygodnie!}
              etykieta={t.tygodnie}
              podpowiedz={ocena.zakresTygodni ? t.zakresLiczby(ocena.zakresTygodni) : undefined}
              wartosc={odp.tygodnie}
              onZmiana={(w) => zmien({ tygodnie: w })}
              blad={bledy.tygodnie ?? null}
              szerokosc="waska"
            />
          </div>
          <div className="mt-6">
            <TabelaOkresow okresy={ocena.okresy} />
          </div>
          {stawkaOpis ? <p className="m-0 mt-4 text-body-strong">{stawkaOpis}</p> : null}
        </>
      );
      dodatkowe = kartaZamiaru;
      break;
    }
    case 'ojcowski':
      dodatkowe = null;
      okres = (
        <div className="flex flex-col gap-6">
          <GrupaOpcji
            nazwa="ojcowski-wczesniej"
            legenda={t.ojcowskiLegenda}
            uklad="karty"
            wartosc={odp.wczesniejszyOjcowski}
            onZmiana={(w) => zmien({ wczesniejszyOjcowski: w, dni: w === '7-dni' ? '7' : odp.dni })}
            blad={bledy.ojcowskiWczesniej ?? null}
            opcje={[{ wartosc: 'nie', etykieta: t.ojcowskiNie }, { wartosc: '7-dni', etykieta: t.ojcowskiTak }]}
          />
          <PoleLiczby
            id={ID_POLA.dni!}
            etykieta={t.dni}
            podpowiedz={ocena.zakresDni ? t.zakresDni(ocena.zakresDni) : undefined}
            wartosc={odp.dni}
            onZmiana={(w) => zmien({ dni: w })}
            blad={bledy.dni ?? null}
            szerokosc="waska"
          />
          {poleDaty(t.dataPoczatku)}
          <TabelaOkresow okresy={ocena.okresy} />
          {stawkaOpis ? <p className="m-0 text-body-strong">{stawkaOpis}</p> : null}
        </div>
      );
      break;
    case 'uzupelniajacy':
      okres = (
        <div className="flex flex-col gap-6">
          {ocena.okresMacierzynskiego ? (
            <DaneNaTle pozycje={[{ etykieta: t.ostatniDzienMacierzynskiego, wartosc: formatujDate(ocena.okresMacierzynskiego.do) }]} />
          ) : null}
          {ocena.ostrzezenia.okres ? <Komunikat kod={ocena.ostrzezenia.okres} /> : null}
          <PoleLiczby
            id={ID_POLA.tygodnie!}
            etykieta={t.tygodnie}
            podpowiedz={
              <>
                {ocena.zakresTygodni ? t.zakresLiczby(ocena.zakresTygodni) : null}{' '}
                {dane.wymiarK11 ? t.wymiarK11({ tygodnie: t.liczbaTygodni({ n: dane.wymiarK11 }) }) : null}
              </>
            }
            wartosc={odp.tygodnie}
            onZmiana={(w) => zmien({ tygodnie: w })}
            blad={bledy.tygodnie ?? null}
            szerokosc="waska"
          />
          <TabelaOkresow okresy={ocena.okresy} />
          {stawkaOpis ? <p className="m-0 text-body-strong">{stawkaOpis}</p> : null}
        </div>
      );
      dodatkowe = (
        <Karta tytul={t.uzupelniajacyOswiadczenieTytul} bezLinii>
          <PoleZaznaczenia
            id={ID_POLA.oswiadczenieUzupelniajacy!}
            etykieta={t.uzupelniajacyOswiadczenie}
            zaznaczone={odp.drugiRodzicBezUzupelniajacego}
            onZmiana={(z) => zmien({ drugiRodzicBezUzupelniajacego: z })}
            blad={bledy.oswiadczenieUzupelniajacy ?? null}
          />
        </Karta>
      );
      break;
    case 'na-warunkach-macierzynskiego':
      okres = (
        <div className="flex flex-col gap-6">
          {poleDaty(t.dataPoczatku)}
          {zakresWniosku(true)}
          <TabelaOkresow okresy={ocena.okresy} />
          {stawkaOpis ? <p className="m-0 text-body-strong">{stawkaOpis}</p> : null}
        </div>
      );
      break;
    case 'laczenie-z-praca': {
      const w = ocena.wydluzenie;
      okres = (
        <div className="flex flex-col gap-6">
          {ocena.zakresDaty ? (
            <DaneNaTle pozycje={[{ etykieta: t.laczenieOkresRodzicielskiego, wartosc: `${formatujDate(ocena.zakresDaty.od)} – ${formatujDate(ocena.zakresDaty.do)}` }]} />
          ) : null}
          <PoleLiczby
            id={ID_POLA.wymiarPracy!}
            etykieta={t.wymiarPracy}
            podpowiedz={t.wymiarPracyPodpowiedz}
            jednostka={t.procentEtatu}
            wartosc={odp.wymiarPracy}
            onZmiana={(v) => zmien({ wymiarPracy: v })}
            blad={bledy.wymiarPracy ?? null}
            szerokosc="waska"
          />
          {poleDaty(t.dataPoczatkuLaczenia)}
          {poleDaty(t.dataKoncaLaczenia, 'dataKonca', ocena.zakresDatyKonca)}
          <GrupaOpcji
            nazwa="laczenie-wydluzenie"
            legenda={t.laczenieLegenda}
            uklad="poziomo"
            wartosc={odp.laczenieCzesciZWydluzenia === null ? null : odp.laczenieCzesciZWydluzenia ? 'tak' : 'nie'}
            onZmiana={(v) => zmien({ laczenieCzesciZWydluzenia: v === 'tak', wymiarWCzesciZWydluzenia: odp.wymiarWCzesciZWydluzenia || odp.wymiarPracy })}
            blad={bledy.oswiadczenieLaczenia ?? null}
            opcje={[{ wartosc: 'tak', etykieta: t.tak }, { wartosc: 'nie', etykieta: t.nie }]}
          />
          {odp.laczenieCzesciZWydluzenia ? (
            <PoleLiczby
              id={ID_POLA.wymiarWydluzenia!}
              etykieta={t.wymiarWydluzenia}
              podpowiedz={t.wymiarPracyPodpowiedz}
              jednostka={t.procentEtatu}
              wartosc={odp.wymiarWCzesciZWydluzenia}
              onZmiana={(v) => zmien({ wymiarWCzesciZWydluzenia: v })}
              blad={bledy.wymiarWydluzenia ?? null}
              szerokosc="waska"
            />
          ) : null}
        </div>
      );
      dodatkowe = w ? (
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
      ) : null;
      break;
    }
    default:
      break;
  }

  const zalaczniki = listaZalacznikow(podrodzaj, dane);

  return (
    <RamaKreatora
      krok={2}
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
          zapisz('dalej');
        }}
      >
        <Karta tytul={t.daneTytul} bezLinii>
          <Notatka className="mb-4">{t.daneNotatka}</Notatka>
          <p className="m-0 mb-2">{teksty.wspolne.stanNa({ data: formatujDate(kontekst.dzis) })}</p>
          <DaneNaTle pozycje={daneWniosku} />
        </Karta>
        <Karta tytul={t.okresTytul} bezLinii>
          {okres}
        </Karta>
        {dodatkowe}
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
        {bladZapisu ? <Komunikat kod={bladZapisu as '0003'} /> : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Przycisk type="button" wariant="drugorzedny" onClick={() => zapisz('wstecz')}>
            {tt.wstecz}
          </Przycisk>
          <div className="flex flex-wrap gap-4">
            <Przycisk type="button" wariant="tlo" ikona="zapisz" onClick={() => zapisz('dokonczenie')}>
              {tt.zapiszDoDokonczenia}
            </Przycisk>
            <Przycisk type="submit" wariant="glowny">
              {tt.dalej}
            </Przycisk>
          </div>
        </div>
      </form>
    </RamaKreatora>
  );
}
