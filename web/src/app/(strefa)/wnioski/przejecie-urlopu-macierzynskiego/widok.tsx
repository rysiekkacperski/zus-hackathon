'use client';

// ViewFatherTakeover (u34, Stories 3.9.2.1.2 i 3.9.2.2.1) w dwóch trybach: wniosek ojca pracownika do pracodawcy
// i krok kreatora ZAM „urlop macierzyński przejęty od matki”. Wzory: cz2/P25-14 … P25-16, P25-21 … P25-23.
// Formularz ma części: przyczyna przejęcia, okres urlopu i załączniki (gdy przyczyna ich wymaga).
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PrzyciskiCzesci, useCzesciFormularza } from '@/komponenty/czesci-formularza';
import { GrupaOpcji } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty, PoleLiczby } from '@/komponenty/pole-tekstowe';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { formatujDate } from '@/komponenty/format';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { trasy } from '@/komponenty/rama/trasy';
import { dodajDni, parsujDate } from '@/domena/daty';
import type { BledyPol, KodKomunikatu, PlikZalacznika, StanKonta, WniosekOUrlop, WniosekZam } from '@/domena/typy';
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
import { useKontekstRodziny, useStanKontaOsoby, type KontekstRodziny } from '@/dane/magazyn/hooki';
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

type PolePrzejecia = 'przyczyna' | 'data' | 'dni';

interface FormularzPrzejecia {
  przyczyna: PrzyczynaPrzejecia | null;
  data: string;
  dni: string;
}

/** Dane wejściowe formularza z profilu rodziny, wniosków i parametrów adresu. */
function wejsciePrzejecia(kontekst: KontekstRodziny, sytuacjaZAdresu: string | null, dataZAdresu: string | null) {
  const { daneRodziny, daneCiazy, wnioski } = kontekst.rodzina;
  const rezygnacja = wyslanaRezygnacja(wnioski);
  const propozycja = proponujPrzejecie(daneCiazy, rezygnacja);
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
}

type WejsciePrzejecia = ReturnType<typeof wejsciePrzejecia>;

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

  const sytuacjaZAdresu = parametry.get('sytuacja');
  const dataZAdresu = parametry.get('data');
  const wejscie = useMemo(
    () => (kontekst ? wejsciePrzejecia(kontekst, sytuacjaZAdresu, dataZAdresu) : null),
    [kontekst, sytuacjaZAdresu, dataZAdresu],
  );

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

  return (
    <FormularzPrzejeciaUrlopu
      kontekst={kontekst}
      wejscie={wejscie}
      dataPorodu={wejscie.dataPorodu}
      zam={zam}
      wniosekPracownika={wniosekPracownika}
      wniosekZam={wniosekZam}
      idSprawy={idSprawy}
      naglowek={naglowek}
      powrot={powrot}
      stanMatki={stanMatki}
    />
  );
}

interface FormularzPrzejeciaUrlopuProps {
  kontekst: KontekstRodziny;
  wejscie: WejsciePrzejecia;
  dataPorodu: string;
  zam: boolean;
  wniosekPracownika: WniosekOUrlop | null;
  wniosekZam: WniosekZam | null;
  idSprawy: string;
  naglowek: string;
  powrot: { href: string; etykieta: string };
  stanMatki: StanKonta | null;
}

function FormularzPrzejeciaUrlopu({
  kontekst,
  wejscie,
  dataPorodu,
  zam,
  wniosekPracownika,
  wniosekZam,
  idSprawy,
  naglowek,
  powrot,
  stanMatki,
}: FormularzPrzejeciaUrlopuProps) {
  const router = useRouter();
  const pesel = kontekst.konto.pesel;
  const zapisaneOjca = wniosekPracownika?.wniosekOjca;
  const zapisaneZam = wniosekZam?.przejecie;
  const zapisanyOkres = (wniosekPracownika?.okresy ?? wniosekZam?.okresy ?? [])[0];
  const przyczynaPoczatkowa: PrzyczynaPrzejecia | null = (() => {
    const zapisana = zapisaneOjca?.przyczyna ?? zapisaneZam?.przyczyna;
    if (czyPrzyczynaPrzejecia(zapisana)) return zapisana;
    return wejscie.propozycja.przyczyna ?? null;
  })();

  const [przyczyna, setPrzyczyna] = useState<PrzyczynaPrzejecia | null>(przyczynaPoczatkowa);
  const [tekstDaty, setTekstDaty] = useState(() => {
    const zapisanaData = zapisaneOjca?.dataZdarzenia ?? zapisaneZam?.dataZdarzenia;
    if (przyczynaPoczatkowa === 'rezygnacja') {
      const d = zapisanyOkres?.od ?? wejscie.propozycja.dataPoczatku;
      return d ? formatujDate(d) : '';
    }
    const d = zapisanaData ?? wejscie.propozycja.dataZdarzenia;
    return d ? formatujDate(d) : '';
  });
  const [tekstDni, setTekstDni] = useState(() => String(zapisaneOjca?.dniPrzedPorodem ?? wejscie.dniPrzedZWniosku ?? 0));
  const [zobowiazanie, setZobowiazanie] = useState(zapisaneOjca?.zobowiazanieOWypisie ?? true);
  const [pliki, setPliki] = useState<Record<string, PlikZalacznika>>(() =>
    plikiZeSzkicu(wniosekPracownika?.zalaczniki ?? wniosekZam?.zalaczniki),
  );
  const [bladOperacji, setBladOperacji] = useState<KodKomunikatu | null>(null);
  const { zajety, ustawZajety: setZajety, przejdz } = useNawigacjaZLadowaniem();

  const { daneRodziny, daneCiazy } = kontekst.rodzina;
  const dzis = kontekst.dzis;
  const liczbaDzieci = daneCiazy?.liczbaUrodzonychDzieci ?? 1;
  const formaOjca = daneRodziny.drugiRodzic.formaZatrudnienia?.wartosc;
  const pracownik = !zam && formaOjca === 'umowa-o-prace';
  const matkaUbezpieczona = wejscie.matkaUbezpieczona;

  const wynikDni = walidujDniPrzedPorodem(tekstDni);
  const dniPrzed = 'dni' in wynikDni ? wynikDni.dni : wejscie.dniPrzedZWniosku;
  const urlop = urlopMacierzynski(kontekst.katalog, dataPorodu, liczbaDzieci, dniPrzed);
  const sytuacja = przyczyna !== null && przyczyna !== 'rezygnacja' ? przyczyna : null;
  const zakresZdarzenia = sytuacja ? zakresDatyZdarzenia(sytuacja, dataPorodu, dzis, matkaUbezpieczona) : null;

  function sprawdzDate(
    przyczynaFormularza: PrzyczynaPrzejecia | null,
    tekst: string,
  ): { okres: ReturnType<typeof wyliczOkresPrzejecia> | null; kod?: KodKomunikatu; data?: string } {
    if (przyczynaFormularza === null) return { okres: null };
    if (przyczynaFormularza === 'rezygnacja') {
      if (tekst.trim() === '') return { okres: null, kod: '0201' };
      const data = parsujDate(tekst);
      if (data === null) return { okres: null, kod: '0010' };
      const okres = wyliczOkresPrzejecia({ przyczyna: przyczynaFormularza, data, urlop, matkaUbezpieczona });
      return 'kod' in okres ? { okres: null, kod: okres.kod } : { okres, data };
    }
    const zakres = zakresDatyZdarzenia(przyczynaFormularza, dataPorodu, dzis, matkaUbezpieczona);
    const wynik = walidujDateZdarzenia(tekst, zakres ?? { do: dzis });
    if ('kod' in wynik) return { okres: null, kod: wynik.kod };
    const okres = wyliczOkresPrzejecia({
      przyczyna: przyczynaFormularza,
      data: wynik.data,
      urlop,
      matkaUbezpieczona,
      dataPowrotuMatki: wejscie.rezygnacja?.rezygnacja?.dataPowrotu,
    });
    return 'kod' in okres ? { okres: null, kod: okres.kod } : { okres, data: wynik.data };
  }

  /** Błędy pól: przyczyna (0006), data (0201, 0010 i kody zakresu), dni przed porodem (0202). */
  function walidujPrzejecie(f: FormularzPrzejecia): BledyPol<PolePrzejecia> {
    const bledy: BledyPol<PolePrzejecia> = {};
    if (f.przyczyna === null) bledy.przyczyna = '0006';
    const wynikDaty = sprawdzDate(f.przyczyna, f.data);
    if (f.przyczyna !== null && wynikDaty.kod) bledy.data = wynikDaty.kod;
    const dniWynik = walidujDniPrzedPorodem(f.dni);
    if ('kod' in dniWynik) bledy.dni = dniWynik.kod;
    return bledy;
  }

  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { przyczyna, data: tekstDaty, dni: tekstDni },
    waliduj: walidujPrzejecie,
    pola: { przyczyna: NAZWA_PRZYCZYNY, data: ID_DATY, dni: ID_DNI },
  });
  const bledy = walidacja.bledy;

  const biezacy = sprawdzDate(przyczyna, tekstDaty);
  const okres = biezacy.okres && !('kod' in biezacy.okres) ? biezacy.okres : null;
  const ostrzezenie0208 =
    przyczyna === 'rezygnacja' && okres && pracownik ? ostrzezenieTerminuWnioskuOjca(okres.od, dzis, formaOjca) : null;

  const rodzajeZalacznikow = przyczyna
    ? zam
      ? zalacznikiZamOjca(przyczyna, matkaUbezpieczona, daneRodziny.drugiRodzic.platnikZasilku?.wartosc !== 'platnik-skladek')
      : zalacznikiWnioskuOjca(przyczyna)
    : [];
  const zalaczniki: PozycjaZalacznika[] = rodzajeZalacznikow.map((r) => ({ rodzaj: r, tytul: t.zalaczniki[r] }));

  // Części: 1. przyczyna przejęcia, 2. okres urlopu, 3. załączniki (gdy przyczyna ich wymaga).
  const podzial: PolePrzejecia[][] = zalaczniki.length > 0 ? [['przyczyna'], ['data', 'dni'], []] : [['przyczyna'], ['data', 'dni']];
  const czesci = useCzesciFormularza({ liczba: podzial.length, podzial, walidacja });

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

  /** Akcja ostatniej części: zapis szkicu wniosku i przejście do następnego kroku. */
  function przejdzDalej() {
    const wynikDaty = sprawdzDate(przyczyna, tekstDaty);
    const dniWynik = walidujDniPrzedPorodem(tekstDni);
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
      przejdz(trasy.ViewZamData({ wniosek: wniosekZam.idWniosku }));
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
    przejdz(trasy.ViewLeaveRequestSummary({ wniosek: zapis.wartosc.idWniosku }));
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
            {czesci.czesc === 1 ? (
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
                  }}
                  {...walidacja.pole('przyczyna')}
                />
                {sytuacja ? <OstrzezeniePola id="przyczyna-uwaga" kod="0144" /> : null}
              </Karta>
            ) : null}
            {czesci.czesc === 2 ? (
              <Karta tytul={t.kartaOkresu} bezLinii>
                <div className="grid gap-6">
                  <PoleDaty
                    id={ID_DATY}
                    etykieta={sytuacja ? t.poleDatyZdarzenia : t.poleDatyPoczatku}
                    podpowiedz={podpowiedzDaty}
                    wartosc={tekstDaty}
                    onZmiana={setTekstDaty}
                    {...walidacja.pole('data')}
                    dodatek={dodatekDaty}
                    wymagane
                    className="max-w-120"
                  />
                  <PoleLiczby
                    id={ID_DNI}
                    etykieta={t.poleDniPrzed}
                    podpowiedz={podpowiedzDni}
                    wartosc={tekstDni}
                    onZmiana={setTekstDni}
                    {...walidacja.pole('dni')}
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
            ) : null}
            {czesci.czesc === 3 && zalaczniki.length > 0 ? (
              <Karta tytul={t.kartaZalacznikow} bezLinii>
                <ListaZalacznikow pozycje={zalaczniki} pliki={pliki} onZmianaPlikow={setPliki} wlasciciel={pesel} />
              </Karta>
            ) : null}
            <PrzyciskiCzesci
              czesci={czesci}
              onAkcjaKroku={przejdzDalej}
              onWrocKroku={() => router.push(powrot.href)}
              zajety={zajety}
            />
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
