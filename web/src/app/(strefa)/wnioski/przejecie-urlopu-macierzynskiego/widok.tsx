'use client';

// ViewFatherTakeover (u34, Stories 3.9.2.1.2 i 3.9.2.2.1) w dwóch trybach: wniosek ojca pracownika do pracodawcy
// i krok kreatora ZAM „urlop macierzyński przejęty od matki”. Wzory: cz2/P25-14 … P25-16, P25-21 … P25-23.
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { GrupaOpcji, idOpcjiGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { formatujDate } from '@/komponenty/format';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { trasy } from '@/komponenty/rama/trasy';
import { dodajDni, parsujDate } from '@/domena/daty';
import type { KodKomunikatu, PlikZalacznika, WniosekOUrlop, WniosekZam } from '@/domena/typy';
import {
  czyObjetyChorobowym,
  dniPrzedPorodemZWnioskow,
  szkicWniosku,
  terminWnioskuOjca,
  urlopMacierzynski,
  wyslanaRezygnacja,
} from '@/domena/wnioski/rezygnacja';
import {
  czyPrzyczynaPrzejecia,
  dzienZakonczeniaUrlopuMatki,
  ostrzezenieTerminuWnioskuOjca,
  otworzPrzejecie,
  proponujPrzejecie,
  PRZYCZYNY_PRZEJECIA,
  walidujDateZdarzenia,
  walidujDniPrzedPorodem,
  wyliczOkresPrzejecia,
  zakresDatyZdarzenia,
  zalacznikiWnioskuOjca,
  zalacznikiZamOjca,
  type PrzyczynaPrzejecia,
} from '@/domena/wnioski/przejecie';
import { useKontekstRodziny, useStanKontaOsoby } from '@/dane/magazyn/hooki';
import { osobyRodziny } from '@/dane/magazyn/stan';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { rozpocznijPrzejecie, zapiszKrok } from '@/dane/magazyn/operacje/rezygnacja';
import { teksty } from '@/teksty';
import {
  dni,
  etykietaFormy,
  InformacjaPola,
  ListaDanych,
  ListaZalacznikow,
  OstrzezeniePola,
  plikiZeSzkicu,
  RamkaOkresu,
  zbudujZalaczniki,
  type PozycjaZalacznika,
} from '@/app/(strefa)/wnioski/rezygnacja-z-urlopu-macierzynskiego/_czesci/wspolne';

const t = teksty.ViewFatherTakeover;
const tr = teksty.ViewMaternityResignation;
const ID_DATY = 'data-przejecia';
const ID_DNI = 'dni-przed-porodem';
const NAZWA_PRZYCZYNY = 'przyczyna';

type Bledy = Partial<Record<'przyczyna' | 'data' | 'dni', KodKomunikatu>>;

export function WidokPrzejeciaUrlopu({ tryb }: { tryb: TrybWidoku<'ViewFatherTakeover'> }) {
  const kontekst = useKontekstRodziny();
  const parametry = useSearchParams();
  const router = useRouter();
  const zam = tryb === 'zam';
  const pesel = kontekst?.konto.pesel ?? '';
  const rodzina = kontekst?.rodzina ?? null;
  const idWnioskuZAdresu = parametry.get('wniosek');
  const peselMatki = rodzina ? osobyRodziny(rodzina.daneRodziny).peselMatki : undefined;
  const stanMatki = useStanKontaOsoby(peselMatki);

  const wniosekPracownika = useMemo<WniosekOUrlop | null>(() => {
    if (!rodzina || zam) return null;
    const zAdresu = rodzina.wnioski.find(
      (w): w is WniosekOUrlop => w.idWniosku === idWnioskuZAdresu && w.rodzaj === 'wniosek-ojca-o-urlop',
    );
    return zAdresu ?? szkicWniosku(rodzina.wnioski, 'wniosek-ojca-o-urlop', pesel);
  }, [rodzina, zam, idWnioskuZAdresu, pesel]);
  const wniosekZam = useMemo<WniosekZam | null>(() => {
    if (!rodzina || !zam) return null;
    return rodzina.wnioski.find((w): w is WniosekZam => w.idWniosku === idWnioskuZAdresu && w.rodzaj === 'zam') ?? null;
  }, [rodzina, zam, idWnioskuZAdresu]);
  const idSprawy = parametry.get('sprawa') ?? wniosekPracownika?.idSprawy ?? wniosekZam?.idSprawy ?? 'K10';

  const wejscie = useMemo(() => {
    if (!kontekst) return null;
    const { daneRodziny, daneCiazy, wnioski } = kontekst.rodzina;
    const rezygnacja = wyslanaRezygnacja(wnioski);
    const propozycja = proponujPrzejecie(daneCiazy, rezygnacja);
    const sytuacjaZAdresu = parametry.get('sytuacja');
    const dataZAdresu = parametry.get('data');
    if (czyPrzyczynaPrzejecia(sytuacjaZAdresu)) {
      propozycja.przyczyna = sytuacjaZAdresu;
      propozycja.zrodloPrzyczyny = 'profil-rodziny';
      const data = dataZAdresu ? (parsujDate(dataZAdresu) ?? (/^\d{4}-\d{2}-\d{2}$/.test(dataZAdresu) ? dataZAdresu : null)) : null;
      if (data) propozycja.dataZdarzenia = data;
    }
    const dataPorodu = daneCiazy?.dataPorodu ?? null;
    const dniPrzedZWniosku = dataPorodu ? dniPrzedPorodemZWnioskow(wnioski, dataPorodu) : 0;
    const wniosekPrzedPorodem = dataPorodu && dniPrzedZWniosku > 0 ? dodajDni(dataPorodu, -dniPrzedZWniosku) : null;
    return {
      otwarcie: otworzPrzejecie(daneRodziny, daneCiazy),
      rezygnacja,
      propozycja,
      dataPorodu,
      dniPrzedZWniosku,
      wniosekPrzedPorodem,
      matkaUbezpieczona: czyObjetyChorobowym(daneRodziny.matka.formaZatrudnienia?.wartosc, daneRodziny.matka.dobrowolneChorobowe?.wartosc),
    };
  }, [kontekst, parametry]);

  const zapisaneOjca = wniosekPracownika?.wniosekOjca;
  const zapisaneZam = wniosekZam?.przejecie;
  const zapisanyOkres = (wniosekPracownika?.okresy ?? wniosekZam?.okresy ?? [])[0];
  const przyczynaPoczatkowa: PrzyczynaPrzejecia | null = (() => {
    const zapisana = zapisaneOjca?.przyczyna ?? zapisaneZam?.przyczyna;
    if (czyPrzyczynaPrzejecia(zapisana)) return zapisana;
    return wejscie?.propozycja.przyczyna ?? null;
  })();

  const [przyczyna, setPrzyczyna] = useState<PrzyczynaPrzejecia | null>(przyczynaPoczatkowa);
  const [tekstDaty, setTekstDaty] = useState(() => {
    const zapisanaData = zapisaneOjca?.dataZdarzenia ?? zapisaneZam?.dataZdarzenia;
    if (przyczynaPoczatkowa === 'rezygnacja') {
      const d = zapisanyOkres?.od ?? wejscie?.propozycja.dataPoczatku;
      return d ? formatujDate(d) : '';
    }
    const d = zapisanaData ?? wejscie?.propozycja.dataZdarzenia;
    return d ? formatujDate(d) : '';
  });
  const [tekstDni, setTekstDni] = useState(() =>
    String(zapisaneOjca?.dniPrzedPorodem ?? wejscie?.dniPrzedZWniosku ?? 0),
  );
  const [zobowiazanie, setZobowiazanie] = useState(zapisaneOjca?.zobowiazanieOWypisie ?? true);
  const [pliki, setPliki] = useState<Record<string, PlikZalacznika>>(() =>
    plikiZeSzkicu(wniosekPracownika?.zalaczniki ?? wniosekZam?.zalaczniki),
  );
  const [bledy, setBledy] = useState<Bledy>({});
  const [bladOperacji, setBladOperacji] = useState<KodKomunikatu | null>(null);
  const [zajety, setZajety] = useState(false);

  const przekierowanie = wejscie?.otwarcie.cel;
  useEffect(() => {
    if (przekierowanie === 'ViewFamilyPlan') {
      ustawKomunikatPoPrzejsciu({ kod: '0064', dlaWidoku: 'ViewFamilyPlan' });
      router.replace(trasy.ViewFamilyPlan());
    } else if (przekierowanie === 'ViewZamLeaveType' && !zam) {
      router.replace(trasy.ViewZamLeaveType({ sprawa: idSprawy }));
    }
  }, [przekierowanie, zam, router, idSprawy]);

  if (!kontekst || !wejscie) {
    return <NaglowekStrony tytul={t.naglowek} />;
  }
  const naglowek = zam ? t.tytulyTrybow.zam : t.naglowek;
  const powrotHref = zam
    ? trasy.ViewZamLeaveType(wniosekZam ? { wniosek: wniosekZam.idWniosku } : { sprawa: idSprawy })
    : trasy.ViewCaseGuide({ idSprawy });
  const powrot = { href: powrotHref, etykieta: zam ? t.powrotZam : t.powrot };

  if (przekierowanie === 'ViewFamilyPlan' || (przekierowanie === 'ViewZamLeaveType' && !zam)) {
    return <NaglowekStrony tytul={naglowek} powrot={powrot} />;
  }
  if (zam && !wniosekZam) {
    return (
      <>
        <NaglowekStrony tytul={naglowek} powrot={powrot} />
        <Komunikat
          tresc={t.brakWniosku}
          akcje={
            <PrzyciskLink href={trasy.ViewZamLeaveType({ sprawa: idSprawy })} wariant="drugorzedny">
              {t.przejdzDoRodzajuUrlopu}
            </PrzyciskLink>
          }
        />
      </>
    );
  }
  if (!wejscie.dataPorodu) {
    return (
      <>
        <NaglowekStrony tytul={naglowek} powrot={powrot} />
        <Komunikat
          tresc={t.brakDatyPorodu}
          akcje={
            <PrzyciskLink href={trasy.ViewProfileSummary({ tryb: 'rodzina' })} wariant="drugorzedny">
              {tr.przejdzDoProfilu}
            </PrzyciskLink>
          }
        />
      </>
    );
  }

  const { daneRodziny, daneCiazy } = kontekst.rodzina;
  const dzis = kontekst.dzis;
  const dataPorodu = wejscie.dataPorodu;
  const liczbaDzieci = daneCiazy?.liczbaUrodzonychDzieci ?? 1;
  const formaOjca = daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc;
  const pracownik = !zam && formaOjca === 'umowa-o-prace';
  const matkaUbezpieczona = wejscie.matkaUbezpieczona;

  const wynikDni = walidujDniPrzedPorodem(tekstDni);
  const dniPrzed = 'dni' in wynikDni ? wynikDni.dni : wejscie.dniPrzedZWniosku;
  const urlop = urlopMacierzynski(kontekst.katalog, dataPorodu, liczbaDzieci, dniPrzed);
  const sytuacja = przyczyna !== null && przyczyna !== 'rezygnacja' ? przyczyna : null;
  const zakresZdarzenia = sytuacja ? zakresDatyZdarzenia(sytuacja, dataPorodu, dzis, matkaUbezpieczona) : null;

  function sprawdzDate(): { okres: ReturnType<typeof wyliczOkresPrzejecia> | null; kod?: KodKomunikatu; data?: string } {
    if (przyczyna === null) return { okres: null };
    if (przyczyna === 'rezygnacja') {
      if (tekstDaty.trim() === '') return { okres: null, kod: '0201' };
      const data = parsujDate(tekstDaty);
      if (data === null) return { okres: null, kod: '0010' };
      const okres = wyliczOkresPrzejecia({ przyczyna, data, urlop, matkaUbezpieczona });
      return 'kod' in okres ? { okres: null, kod: okres.kod } : { okres, data };
    }
    const wynik = walidujDateZdarzenia(tekstDaty, zakresZdarzenia ?? { do: dzis });
    if ('kod' in wynik) return { okres: null, kod: wynik.kod };
    const okres = wyliczOkresPrzejecia({
      przyczyna,
      data: wynik.data,
      urlop,
      matkaUbezpieczona,
      dataPowrotuMatki: wejscie?.rezygnacja?.rezygnacja?.dataPowrotu,
    });
    return 'kod' in okres ? { okres: null, kod: okres.kod } : { okres, data: wynik.data };
  }

  const biezacy = sprawdzDate();
  const okres = biezacy.okres && !('kod' in biezacy.okres) ? biezacy.okres : null;
  const ostrzezenie0208 =
    przyczyna === 'rezygnacja' && okres && pracownik ? ostrzezenieTerminuWnioskuOjca(okres.od, dzis, formaOjca) : null;

  const rodzajeZalacznikow = przyczyna
    ? zam
      ? zalacznikiZamOjca(przyczyna, matkaUbezpieczona, daneRodziny.drugiRodzic.platnikZasilku?.wartosc !== 'platnik-skladek')
      : zalacznikiWnioskuOjca(przyczyna)
    : [];
  const zalaczniki: PozycjaZalacznika[] = rodzajeZalacznikow.map((r) => ({ rodzaj: r, tytul: t.zalaczniki[r] }));

  const kontoMatki = stanMatki?.konto ?? null;
  const zusMatki = kontekst.daneZusMatki;
  const matka = kontoMatki
    ? { imie: kontoMatki.imie, nazwisko: kontoMatki.nazwisko, pesel: kontoMatki.pesel }
    : zusMatki
      ? { imie: zusMatki.imie, nazwisko: zusMatki.nazwisko, pesel: zusMatki.pesel }
      : null;
  const imieMatki = matka ? `${matka.imie} ${matka.nazwisko}` : null;
  const matkaDopelniacz = kontoMatki?.imieINazwiskoDopelniacz ?? imieMatki;
  const konto = kontekst.konto;

  function przejdzDalej() {
    const nowe: Bledy = {};
    if (przyczyna === null) nowe.przyczyna = '0006';
    const wynikDaty = sprawdzDate();
    if (przyczyna !== null && wynikDaty.kod) nowe.data = wynikDaty.kod;
    const dniWynik = walidujDniPrzedPorodem(tekstDni);
    if ('kod' in dniWynik) nowe.dni = dniWynik.kod;
    setBledy(nowe);
    if (nowe.przyczyna) {
      document.getElementById(idOpcjiGrupy(NAZWA_PRZYCZYNY, PRZYCZYNY_PRZEJECIA[0]))?.focus();
      return;
    }
    if (nowe.data) {
      document.getElementById(ID_DATY)?.focus();
      return;
    }
    if (nowe.dni) {
      document.getElementById(ID_DNI)?.focus();
      return;
    }
    const okresWniosku = wynikDaty.okres;
    if (!przyczyna || !okresWniosku || 'kod' in okresWniosku || !('dni' in dniWynik)) return;

    setZajety(true);
    const ctx = pobierzKontekstOperacji();
    const dataZdarzenia = przyczyna === 'rezygnacja' ? undefined : wynikDaty.data;
    const listaZalacznikow = zbudujZalaczniki(zalaczniki, pliki);

    if (zam && wniosekZam) {
      const zapis = zapiszKrok(
        wniosekZam.idWniosku,
        {
          rodzajUrlopu: 'przejety-macierzynski',
          okresy: [{ rodzajUrlopu: 'przejety-macierzynski', od: okresWniosku.od, do: okresWniosku.do, dni: okresWniosku.dni, stawka: 100 }],
          przejecie: {
            przyczyna,
            ...(dataZdarzenia ? { dataZdarzenia } : {}),
            ...(przyczyna === 'rezygnacja' ? { dzienZakonczeniaUrlopuMatki: dzienZakonczeniaUrlopuMatki(okresWniosku.od) } : {}),
            matka: { imie: matka?.imie ?? '', nazwisko: matka?.nazwisko ?? '', ...(matka?.pesel ? { pesel: matka.pesel } : {}) },
            zaswiadczeniePlatnikaMatki: matkaUbezpieczona,
          },
          zalaczniki: listaZalacznikow,
        },
        'ViewFatherTakeover',
        ctx,
      );
      if (!zapis.ok) {
        setBladOperacji(zapis.kod);
        setZajety(false);
        return;
      }
      router.push(trasy.ViewZamData({ wniosek: wniosekZam.idWniosku }));
      return;
    }

    const start = wniosekPracownika
      ? { ok: true as const, wartosc: wniosekPracownika }
      : rozpocznijPrzejecie(idSprawy, { przyczyna, ...(dataZdarzenia ? { dataZdarzenia } : {}) }, ctx);
    if (!start.ok) {
      setBladOperacji(start.kod);
      setZajety(false);
      return;
    }
    const dziecko = daneCiazy?.dzieci[0];
    const zapis = zapiszKrok(
      start.wartosc.idWniosku,
      {
        podrodzaj: 'pozostala-czesc-macierzynskiego',
        okresy: [{ rodzajUrlopu: 'przejety-macierzynski', od: okresWniosku.od, do: okresWniosku.do, dni: okresWniosku.dni, rodzic: 'drugi-rodzic' }],
        wniosekOjca: {
          przyczyna,
          dniPrzedPorodem: dniWynik.dni,
          ...(dataZdarzenia ? { dataZdarzenia } : {}),
          ...(przyczyna === 'szpital' ? { zobowiazanieOWypisie: zobowiazanie } : {}),
        },
        zalaczniki: listaZalacznikow,
        adresat: 'pracodawca',
        daneRodzica: { imie: konto.imie, nazwisko: konto.nazwisko },
        ...(dziecko?.imie
          ? { daneDziecka: { imie: dziecko.imie, nazwisko: dziecko.nazwisko ?? '', ...(dziecko.dataUrodzenia ? { dataUrodzenia: dziecko.dataUrodzenia } : {}) } }
          : {}),
        ...(daneRodziny.drugiRodzic.emailPracodawcy ? { emailPracodawcy: daneRodziny.drugiRodzic.emailPracodawcy.wartosc } : {}),
      },
      'ViewFatherTakeover',
      ctx,
    );
    if (!zapis.ok) {
      setBladOperacji(zapis.kod);
      setZajety(false);
      return;
    }
    router.push(trasy.ViewLeaveRequestSummary({ wniosek: zapis.wartosc.idWniosku }));
  }

  const wstep =
    wejscie.propozycja.zrodloPrzyczyny === 'wnioski'
      ? t.wstepZWnioskow
      : wejscie.propozycja.zrodloPrzyczyny === 'profil-rodziny'
        ? t.wstepZProfilu
        : t.wstep;

  const podpowiedzDaty = (() => {
    if (przyczyna === 'rezygnacja' || przyczyna === null) {
      const zakres = { od: formatujDate(urlop.po14Tygodniach), do_: formatujDate(urlop.okres.do) };
      return wejscie.rezygnacja && matkaDopelniacz
        ? t.podpowiedzPoczatkuZRezygnacji({ kogo: matkaDopelniacz ?? imieMatki, ...zakres })
        : t.podpowiedzPoczatku(zakres);
    }
    const zakres = zakresZdarzenia?.od
      ? t.podpowiedzPoczatku({ od: formatujDate(zakresZdarzenia.od), do_: formatujDate(zakresZdarzenia.do) })
      : t.zakresDo({ do_: formatujDate(zakresZdarzenia?.do ?? dzis) });
    const opis = t.opisyZdarzenia[przyczyna];
    return wejscie.propozycja.przyczyna === przyczyna && wejscie.propozycja.zrodloPrzyczyny === 'profil-rodziny'
      ? t.podpowiedzZdarzeniaZProfilu({ opis, zakres })
      : t.podpowiedzZdarzenia({ opis, zakres });
  })();

  const podpowiedzDni =
    wejscie.dniPrzedZWniosku > 0 && wejscie.wniosekPrzedPorodem && matkaDopelniacz
      ? t.podpowiedzDniPrzedZWniosku({ liczba: dni(wejscie.dniPrzedZWniosku), kogo: matkaDopelniacz ?? imieMatki, data: formatujDate(wejscie.wniosekPrzedPorodem) })
      : t.podpowiedzDniPrzed;

  const sytuacjaProfilu = (daneCiazy?.sytuacjeSzczegolne ?? []).filter(
    (s) => s.rodzaj === 'szpital' || s.rodzaj === 'orzeczenie' || s.rodzaj === 'porzucenie' || s.rodzaj === 'smierc-matki',
  );
  const ostatniaSytuacja = sytuacjaProfilu[sytuacjaProfilu.length - 1];

  const pozycjeDanych = [
    { etykieta: tr.dataPorodu, wartosc: formatujDate(dataPorodu) },
    { etykieta: tr.liczbaDzieci, wartosc: String(liczbaDzieci) },
    {
      etykieta: tr.urlopMacierzynski,
      wartosc:
        urlop.dniPrzed > 0
          ? tr.okresZDniamiPrzed({ od: formatujDate(urlop.okres.od), do_: formatujDate(urlop.okres.do), dni: dni(urlop.dniPrzed) })
          : tr.okres({ od: formatujDate(urlop.okres.od), do_: formatujDate(urlop.okres.do) }),
    },
    ...(imieMatki ? [{ etykieta: t.matkaDziecka, wartosc: imieMatki }] : []),
    ...(ostatniaSytuacja && (ostatniaSytuacja.rodzaj === 'szpital' || ostatniaSytuacja.rodzaj === 'orzeczenie' || ostatniaSytuacja.rodzaj === 'porzucenie' || ostatniaSytuacja.rodzaj === 'smierc-matki')
      ? [{ etykieta: t.sytuacjaSzczegolna, wartosc: t.sytuacje[ostatniaSytuacja.rodzaj]({ data: formatujDate(ostatniaSytuacja.dataZdarzenia) }) }]
      : wejscie.rezygnacja?.rezygnacja
        ? [{ etykieta: t.rezygnacjaMatki, wartosc: t.rezygnacjaZWnioskow({ data: formatujDate(wejscie.rezygnacja.rezygnacja.dataPowrotu) }) }]
        : []),
    { etykieta: t.twojaForma, wartosc: etykietaFormy(formaOjca, daneRodziny.drugiRodzic.dobrowolneChorobowe?.wartosc) },
  ];

  const dodatekDaty = bledy.data
    ? undefined
    : ostrzezenie0208
      ? <OstrzezeniePola id={`${ID_DATY}-uwaga`} kod={ostrzezenie0208} />
      : okres?.informacja
        ? <InformacjaPola id={`${ID_DATY}-informacja`} tresc={teksty.komunikaty['0210']({ data: formatujDate(okres.informacja.data) })} />
        : undefined;

  return (
    <>
      <NaglowekStrony tytul={naglowek} wstep={wstep} powrot={powrot} />
      <UkladDwuKolumnowy
        etykietaBocznej={t.kartaDanych}
        tresc={
          <>
            {bladOperacji ? <Komunikat kod={bladOperacji} /> : null}
            <Karta tytul={t.kartaPrzyczyny} bezLinii>
              <GrupaOpcji<PrzyczynaPrzejecia>
                nazwa={NAZWA_PRZYCZYNY}
                legenda={t.legendaPrzyczyny}
                uklad="proste"
                opcje={PRZYCZYNY_PRZEJECIA.map((p) => ({ wartosc: p, etykieta: t.przyczyny[p] }))}
                wartosc={przyczyna}
                onZmiana={(p) => {
                  if (p !== przyczyna) {
                    const proponowana =
                      p === 'rezygnacja'
                        ? wejscie.propozycja.dataPoczatku
                        : wejscie.propozycja.przyczyna === p
                          ? wejscie.propozycja.dataZdarzenia
                          : undefined;
                    setTekstDaty(proponowana ? formatujDate(proponowana) : '');
                  }
                  setPrzyczyna(p);
                  setBledy((b) => ({ ...b, przyczyna: undefined, data: undefined }));
                }}
                blad={bledy.przyczyna}
              />
              {sytuacja ? <OstrzezeniePola id="przyczyna-uwaga" kod="0144" /> : null}
            </Karta>
            <Karta tytul={t.kartaOkresu} bezLinii>
              <div className="grid gap-6">
                <PoleDaty
                  id={ID_DATY}
                  etykieta={sytuacja ? t.poleDatyZdarzenia : t.poleDatyPoczatku}
                  podpowiedz={podpowiedzDaty}
                  wartosc={tekstDaty}
                  onZmiana={(w) => {
                    setTekstDaty(w);
                    if (bledy.data) setBledy((b) => ({ ...b, data: undefined }));
                  }}
                  blad={bledy.data}
                  dodatek={dodatekDaty}
                  wymagane
                  className="max-w-120"
                />
                <PoleLiczby
                  id={ID_DNI}
                  etykieta={t.poleDniPrzed}
                  podpowiedz={podpowiedzDni}
                  wartosc={tekstDni}
                  onZmiana={(w) => {
                    setTekstDni(w);
                    if (bledy.dni) setBledy((b) => ({ ...b, dni: undefined }));
                  }}
                  blad={bledy.dni}
                  szerokosc="waska"
                  className="max-w-120"
                />
              </div>
              {okres && !bledy.data ? (
                <RamkaOkresu
                  etykieta={t.przejmujesz}
                  okres={
                    okres.doWypisu
                      ? t.okresDoWypisu({ od: formatujDate(okres.od), do_: formatujDate(okres.do) })
                      : t.okresZDniami({ od: formatujDate(okres.od), do_: formatujDate(okres.do), dni: dni(okres.dni) })
                  }
                />
              ) : null}
              {zam && okres ? <p className="m-0 mt-4">{t.zasilek100}</p> : null}
              {przyczyna === 'szpital' ? (
                <PoleZaznaczenia
                  id="zobowiazanie"
                  className="mt-6"
                  etykieta={zam ? t.zobowiazaniePlatnik : t.zobowiazaniePracodawca}
                  zaznaczone={zobowiazanie}
                  onZmiana={setZobowiazanie}
                />
              ) : null}
            </Karta>
            {zalaczniki.length > 0 ? (
              <Karta tytul={t.kartaZalacznikow} bezLinii>
                <ListaZalacznikow pozycje={zalaczniki} pliki={pliki} onZmianaPlikow={setPliki} wlasciciel={pesel} />
              </Karta>
            ) : null}
            <div className="flex flex-wrap justify-between gap-4">
              <PrzyciskLink href={powrotHref} wariant="drugorzedny">
                {teksty.wspolne.przyciski.wroc}
              </PrzyciskLink>
              <Przycisk type="button" wariant="glowny" zajety={zajety} onClick={przejdzDalej}>
                {teksty.wspolne.przyciski.dalej}
              </Przycisk>
            </div>
          </>
        }
        boczna={
          <>
            <Karta tytul={t.kartaDanych} bezLinii>
              <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
              <ListaDanych pozycje={pozycjeDanych} />
            </Karta>
            {pracownik && przyczyna === 'rezygnacja' ? (
              <Karta tytul={t.kartaTerminu} bezLinii>
                <p className="m-0 mb-4">
                  {okres && !ostrzezenie0208 ? t.terminZData({ data: formatujDate(terminWnioskuOjca(okres.od)) }) : t.termin}
                </p>
                <Notatka ikona="info">{tr.notatkaSzkicu}</Notatka>
              </Karta>
            ) : (
              <Karta tytul={t.kartaSzkicu} bezLinii>
                <Notatka ikona="info">{tr.notatkaSzkicu}</Notatka>
              </Karta>
            )}
          </>
        }
      />
    </>
  );
}
