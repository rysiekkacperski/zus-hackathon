'use client';

// ViewZas53Data: dane wnioskodawcy i płatnika z konta ZUS (tylko odczyt), telefon, rachunek, wypadek albo choroba
// zawodowa z dokumentem (0124, 0040, 0041, 0006, 0238, 0239, 0010, 0240) i ponowne ustalenie prawa po wypadku.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatujDate, parsujDate, porownajDaty } from '@/domena/daty';
import type { KodKomunikatu, WniosekZas53 } from '@/domena/typy';
import { formatujRachunek, normalizujRachunek, normalizujTelefon, walidujRachunek, walidujTelefon } from '@/domena/walidacje';
import { czyPoUstaniu, polaSzkicuZUstalenia, ustalPrawoZas53, zbudujZalaczniki } from '@/domena/wnioski/zas53';
import { useDzis } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokZas53 } from '@/dane/magazyn/operacje/wnioski-zas53';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PoleDaty, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { formatujKwote } from '@/komponenty/format';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import {
  adresEkranuZas53,
  AkcjeKreatoraZas53,
  BrakWnioskuZas53,
  NaglowekKreatoraZas53,
  PanelWnioskuZas53,
  PostepZas53,
  poprzedniEkranZas53,
  useWniosekZas53,
} from '../_czesci/kreator';
import { teksty } from '@/teksty';

const t = teksty.ViewZas53Data;
type Wypadek = NonNullable<WniosekZas53['wypadek']>;
type Przyczyna = NonNullable<Wypadek['przyczyna']>;
type RodzajDokumentu = NonNullable<Wypadek['dokument']>['rodzaj'];
type PoleDanych = 'telefon' | 'rachunek' | 'wypadek' | 'przyczyna' | 'rodzaj' | 'numer' | 'data';
const KOLEJNOSC_POL: PoleDanych[] = ['telefon', 'rachunek', 'wypadek', 'przyczyna', 'rodzaj', 'numer', 'data'];
const ID_POLA: Record<PoleDanych, string> = {
  telefon: 'zas53-telefon',
  rachunek: 'zas53-rachunek',
  wypadek: idOpcjiGrupy('zas53-wypadek', 'tak'),
  przyczyna: idOpcjiGrupy('zas53-przyczyna', 'wypadek-przy-pracy'),
  rodzaj: 'zas53-rodzaj',
  numer: 'zas53-numer',
  data: 'zas53-data',
};

/** 9 cyfr w grupach po 3 (`500 100 200`). */
function grupujTelefon(numer: string): string {
  return /^\d{9}$/.test(numer) ? `${numer.slice(0, 3)} ${numer.slice(3, 6)} ${numer.slice(6)}` : numer;
}

export function WidokDanychZas53() {
  const k = useWniosekZas53();
  if (!k) return <BrakWnioskuZas53 />;
  return <FormularzDanych key={k.wniosek.idWniosku} k={k} />;
}

function FormularzDanych({ k }: { k: NonNullable<ReturnType<typeof useWniosekZas53>> }) {
  const { wniosek, kopia, konto, ustawienia } = k;
  const dzis = useDzis();
  const router = useRouter();
  const numerZUstawien =
    ustawienia?.stanNumeru === 'potwierdzony' ? (ustawienia.numerPotwierdzony ?? ustawienia.numerTelefonu) : undefined;
  const [telefon, setTelefon] = useState(
    wniosek.numerTelefonu !== undefined ? grupujTelefon(wniosek.numerTelefonu) : numerZUstawien ? grupujTelefon(numerZUstawien) : '',
  );
  const [rachunek, setRachunek] = useState(wniosek.numerRachunku ? formatujRachunek(wniosek.numerRachunku) : '');
  const [wypadek, setWypadek] = useState<'tak' | 'nie' | null>(wniosek.wypadek ? (wniosek.wypadek.tak ? 'tak' : 'nie') : null);
  const [przyczyna, setPrzyczyna] = useState<Przyczyna | null>(wniosek.wypadek?.przyczyna ?? null);
  const [rodzaj, setRodzaj] = useState<RodzajDokumentu | ''>(wniosek.wypadek?.dokument?.rodzaj ?? '');
  const [numer, setNumer] = useState(wniosek.wypadek?.dokument?.numer ?? '');
  const [data, setData] = useState(wniosek.wypadek?.dokument ? formatujDate(wniosek.wypadek.dokument.data) : '');
  const [bledy, setBledy] = useState<Partial<Record<PoleDanych, KodKomunikatu>>>({});
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);

  const poUstaniu = czyPoUstaniu(wniosek);
  const poprzedni = poprzedniEkranZas53('ViewZas53Data', poUstaniu) ?? 'ViewZas53Certificate';

  const zbierz = (pelnaWalidacja: boolean): { zmiana: Partial<WniosekZas53>; bledy: Partial<Record<PoleDanych, KodKomunikatu>> } => {
    const b: Partial<Record<PoleDanych, KodKomunikatu>> = {};
    const zmiana: Partial<WniosekZas53> = {};
    if (telefon.trim() !== '') {
      const kod = walidujTelefon(telefon);
      if (kod) b.telefon = kod;
      else zmiana.numerTelefonu = normalizujTelefon(telefon);
    } else zmiana.numerTelefonu = undefined;
    const kodRachunku = walidujRachunek(rachunek, false);
    if (kodRachunku) b.rachunek = kodRachunku;
    else zmiana.numerRachunku = rachunek.trim() === '' ? undefined : normalizujRachunek(rachunek);
    if (wypadek === null) {
      if (pelnaWalidacja) b.wypadek = '0006';
    } else if (wypadek === 'nie') {
      zmiana.wypadek = { tak: false };
    } else {
      const w: Wypadek = { tak: true };
      if (przyczyna) w.przyczyna = przyczyna;
      else if (pelnaWalidacja) b.przyczyna = '0006';
      if (rodzaj === '' && pelnaWalidacja) b.rodzaj = '0006';
      if (numer.trim() === '' && pelnaWalidacja) b.numer = '0238';
      let dataDokumentu: string | null = null;
      if (data.trim() === '') {
        if (pelnaWalidacja) b.data = '0239';
      } else {
        dataDokumentu = parsujDate(data);
        if (dataDokumentu === null) b.data = '0010';
        else if (porownajDaty(dataDokumentu, dzis) > 0) b.data = '0240';
      }
      if (rodzaj !== '' && numer.trim() !== '' && dataDokumentu && !b.data) {
        w.dokument = { rodzaj, numer: numer.trim().slice(0, 30), data: dataDokumentu };
      }
      zmiana.wypadek = w;
    }
    return { zmiana, bledy: b };
  };

  const dalej = () => {
    const { zmiana, bledy: b } = zbierz(true);
    setBledy(b);
    const pierwsze = KOLEJNOSC_POL.find((p) => b[p]);
    if (pierwsze) {
      document.getElementById(ID_POLA[pierwsze])?.focus();
      return;
    }
    let pelna: Partial<WniosekZas53> = zmiana;
    if (wniosek.zaswiadczenie) {
      const prawo = ustalPrawoZas53({
        zaswiadczenie: wniosek.zaswiadczenie,
        kopia,
        wnioski: k.rodzina.wnioski.filter((w) => w.idWniosku !== wniosek.idWniosku),
        wypadek: zmiana.wypadek?.tak ?? false,
      });
      if (!prawo.blokuje) pelna = { ...polaSzkicuZUstalenia(prawo), ...zmiana };
    }
    const zalaczniki = zbudujZalaczniki({ ...wniosek, ...pelna });
    const wynik = zapiszKrokZas53(wniosek.idWniosku, { ...pelna, zalaczniki }, 'ViewZas53Summary', pobierzKontekstOperacji());
    if (!wynik.ok) {
      setBladZapisu(wynik.kod);
      return;
    }
    router.push(adresEkranuZas53('ViewZas53Summary', wniosek.idWniosku));
  };

  const zapiszDoDokonczenia = () => {
    const { zmiana, bledy: b } = zbierz(false);
    const bezBledow = Object.fromEntries(
      Object.entries(zmiana).filter(([pole]) => !(pole === 'numerTelefonu' && b.telefon) && !(pole === 'numerRachunku' && b.rachunek)),
    ) as Partial<WniosekZas53>;
    const wynik = zapiszKrokZas53(wniosek.idWniosku, bezBledow, 'ViewZas53Data', pobierzKontekstOperacji());
    if (!wynik.ok) {
      setBladZapisu(wynik.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseDetails' });
    router.push(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy }));
  };

  const platnik = wniosek.platnik;
  const imieINazwisko = kopia ? `${kopia.imie} ${kopia.nazwisko}` : `${konto.imie} ${konto.nazwisko}`;
  const komunikatyPrawa: React.ReactNode[] = [];
  if (wniosek.kolejneZaswiadczenie) {
    komunikatyPrawa.push(
      <Komunikat key="0242" kod="0242" akcje={<Odnosnik href={trasy.ViewApplicationList()}>{t.zobaczPoprzedni}</Odnosnik>} />,
    );
  }
  if (wniosek.zaswiadczenie && wniosek.okresPrawa && wniosek.dzienNabyciaPrawa && wniosek.okresPrawa.od !== wniosek.zaswiadczenie.od && wniosek.dniWyczekiwania && wniosek.dzienNabyciaPrawa === wniosek.okresPrawa.od) {
    komunikatyPrawa.push(
      <Komunikat
        key="0084"
        kod="0084"
        parametry={{ data: formatujDate(wniosek.dzienNabyciaPrawa), liczbaDni: String(wniosek.dniWyczekiwania) }}
      />,
    );
  }
  if (wniosek.stawka === 80) komunikatyPrawa.push(<Komunikat key="0234" kod="0234" />);
  if (wniosek.zadluzenie) {
    komunikatyPrawa.push(
      <Komunikat
        key="0182"
        kod="0182"
        parametry={{ prog: formatujKwote(wniosek.zadluzenie.prog), data: formatujDate(wniosek.zadluzenie.terminSplaty) }}
        akcje={<Odnosnik href={trasy.ViewContributionBalance()}>{t.zobaczStanRozliczen}</Odnosnik>}
      />,
    );
  }

  return (
    <>
      <NaglowekKreatoraZas53 />
      <div className="flex flex-col gap-7.5">
        <PostepZas53 ekran="ViewZas53Data" poUstaniu={poUstaniu} idWniosku={wniosek.idWniosku} />
        {komunikatyPrawa.length > 0 ? <div className="flex flex-col gap-4">{komunikatyPrawa}</div> : null}
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        <UkladDwuKolumnowy
          etykietaBocznej={teksty.ViewZas53Start.kreator.twojWniosek}
          tresc={
            <form
              noValidate
              className="flex flex-col gap-7.5"
              onSubmit={(e) => {
                e.preventDefault();
                dalej();
              }}
            >
              <Karta tytul={t.kartaWnioskodawcy} bezLinii as="section">
                <Notatka>{t.notatkaDanych}</Notatka>
                <p className="m-0 my-4 text-body-strong">{t.stanNa({ data: formatujDate(kopia?.odczytano ?? dzis) })}</p>
                <ListaDefinicji
                  pozycje={[
                    { etykieta: t.imieINazwisko, wartosc: imieINazwisko },
                    { etykieta: t.pesel, wartosc: kopia?.pesel ?? konto.pesel },
                    { etykieta: t.adres, wartosc: kopia?.adres ?? t.brakDanej },
                  ]}
                />
              </Karta>
              <Karta tytul={t.kartaPlatnika} bezLinii as="section">
                <p className="m-0 mb-4">{poUstaniu ? t.platnikPoUstaniu : t.platnikDzialalnosc}</p>
                <ListaDefinicji
                  pozycje={[
                    { etykieta: t.nazwaPlatnika, wartosc: platnik?.nazwa ?? t.brakDanej },
                    { etykieta: t.nip, wartosc: platnik?.nip ?? t.brakDanej },
                    { etykieta: t.regon, wartosc: platnik?.regon ?? t.brakDanej },
                  ]}
                />
              </Karta>
              <Karta tytul={t.kartaWyplaty} bezLinii as="section">
                <div className="flex flex-col gap-6">
                  <PoleTekstowe
                    id={ID_POLA.telefon}
                    etykieta={t.telefon}
                    podpowiedz={numerZUstawien ? t.telefonZUstawien : t.telefonPodpowiedz}
                    wartosc={telefon}
                    onZmiana={setTelefon}
                    typ="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    blad={bledy.telefon ?? null}
                    szerokosc="srednia"
                  />
                  <PoleTekstowe
                    id={ID_POLA.rachunek}
                    etykieta={t.rachunek}
                    podpowiedz={t.rachunekPodpowiedz}
                    wartosc={rachunek}
                    onZmiana={setRachunek}
                    inputMode="numeric"
                    autoComplete="off"
                    blad={bledy.rachunek ?? null}
                  />
                </div>
              </Karta>
              <Karta tytul={t.kartaWypadku} bezLinii as="section">
                <div className="flex flex-col gap-6">
                  <GrupaOpcji
                    nazwa="zas53-wypadek"
                    legenda={t.pytanieWypadku}
                    opcje={[
                      { wartosc: 'tak', etykieta: t.tak },
                      { wartosc: 'nie', etykieta: t.nie },
                    ]}
                    wartosc={wypadek}
                    onZmiana={(w) => setWypadek(w as 'tak' | 'nie')}
                    blad={bledy.wypadek ?? null}
                    uklad="poziomo"
                  />
                  {wypadek === 'tak' ? (
                    <>
                      <GrupaOpcji
                        nazwa="zas53-przyczyna"
                        legenda={t.przyczyna}
                        opcje={(Object.keys(t.przyczyny) as Przyczyna[]).map((p) => ({ wartosc: p, etykieta: t.przyczyny[p] }))}
                        wartosc={przyczyna}
                        onZmiana={(p) => setPrzyczyna(p as Przyczyna)}
                        blad={bledy.przyczyna ?? null}
                        uklad="proste"
                      />
                      <div className="flex flex-wrap gap-6">
                        <PoleWyboru
                          id={ID_POLA.rodzaj}
                          etykieta={t.rodzajDokumentu}
                          opcje={(Object.keys(t.rodzajeDokumentu) as RodzajDokumentu[]).map((r) => ({ wartosc: r, etykieta: t.rodzajeDokumentu[r] }))}
                          wartosc={rodzaj}
                          onZmiana={(r) => setRodzaj(r as RodzajDokumentu | '')}
                          pustaOpcja={teksty.wspolne.przyciski.wybierz}
                          blad={bledy.rodzaj ?? null}
                          szerokosc="srednia"
                        />
                        <PoleTekstowe
                          id={ID_POLA.numer}
                          etykieta={t.numerDokumentu}
                          wartosc={numer}
                          onZmiana={(w) => setNumer(w.slice(0, 30))}
                          maksDlugosc={30}
                          autoComplete="off"
                          blad={bledy.numer ?? null}
                          szerokosc="srednia"
                        />
                        <PoleDaty
                          id={ID_POLA.data}
                          etykieta={t.dataDokumentu}
                          podpowiedz={t.podpowiedzDaty}
                          wartosc={data}
                          onZmiana={setData}
                          blad={bledy.data ?? null}
                          szerokosc="srednia"
                        />
                      </div>
                      <Notatka>{t.notatkaDokumentu}</Notatka>
                    </>
                  ) : (
                    <Notatka>{t.notatkaWypadku}</Notatka>
                  )}
                </div>
              </Karta>
              <AkcjeKreatoraZas53
                wstecz={adresEkranuZas53(poprzedni, wniosek.idWniosku)}
                onZapisz={zapiszDoDokonczenia}
                onDalej={dalej}
              />
            </form>
          }
          boczna={<PanelWnioskuZas53 wniosek={wniosek} />}
        />
      </div>
    </>
  );
}
