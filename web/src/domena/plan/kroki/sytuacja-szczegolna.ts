// Krok planu `sytuacjaSzczegolna` (kontrakt, sekcja 7.2). Właściciel: u25 (Sytuacje szczególne i spokojny tryb).
// Po stracie dziecka usuwa sprawy opieki nad dzieckiem (poza złożonymi i załatwionymi), dodaje K34 z okresem
// i kanałem, zostawia sprawy bez przypomnień w spokojnym trybie, przelicza kwoty i wymiar urlopu dla liczby
// dzieci, dodaje K35 po sytuacjach z katalogu. Funkcja czysta: nie zmienia przekazanych obiektów.
import { okresZasilkuPoStracie } from '@/domena/kalkulatory/okresy';
import type { KrokPlanu } from '@/domena/plan/kroki/typ';
import type { WejsciePlanu } from '@/domena/przeliczenie';
import {
  RODZAJE_STRATY,
  RODZAJE_Z_K35,
  czySpokojnyTryb,
  kanalK34,
  liczbyDzieci,
  stratyDoOkresuK34,
  terminK06PoStracie,
  type LiczbyDzieciRodziny,
} from '@/domena/rodzina/sytuacje';
import type { DataISO, IdPozycji, Katalog, PozycjaKatalogu, PozycjaPlanu } from '@/domena/typy';

/** Sprawy usuwane, gdy po stracie nie zostało przy życiu żadne dziecko z ciąży (poza etapem Ciąża). */
const USUWANE_PO_STRACIE: readonly IdPozycji[] = ['K05', 'K07', 'K08', 'K09', 'K10', 'K11', 'K13', 'K18', 'K20', 'K21', 'K22', 'K23', 'K37'];
/** Świadczenia na dziecko urodzone żywo: usuwane po urodzeniu martwego dziecka i poronieniu. */
const NA_DZIECKO_URODZONE_ZYWO: readonly IdPozycji[] = ['K12', 'K14', 'K15', 'K16', 'K17'];
/** Sprawy zostawiane bez przypomnień w spokojnym trybie po zgonie dziecka. */
const BEZ_PRZYPOMNIEN_PO_ZGONIE: readonly IdPozycji[] = ['K06', 'K12', 'K14', 'K15', 'K16', 'K17'];

/** Wymiar urlopu macierzyńskiego w tygodniach według liczby dzieci (słownik wymiarów i okresów). */
const WYMIAR_MACIERZYNSKIEGO_DOMYSLNY: readonly number[] = [20, 31, 33, 35, 37];

function idPozycjiSprawy(p: PozycjaPlanu): IdPozycji | null {
  return p.idPozycji ?? null;
}

function czyZlozonaAlboZalatwiona(p: PozycjaPlanu, poprzednia: PozycjaPlanu | undefined): boolean {
  const statusy = [p.status, poprzednia?.status];
  return statusy.includes('zlozona') || statusy.includes('zalatwiona');
}

function wymiarMacierzynskiego(katalog: Katalog, liczba: number): number {
  const wpis = katalog.slowniki.find((s) => s.slownik === 'wymiary-i-okresy' && s.nazwa === 'Urlop macierzyński');
  const indeks = Math.min(5, Math.max(1, liczba)) - 1;
  const wariant = wpis?.warianty[indeks];
  const wersja = wpis?.wersje[wpis.wersje.length - 1];
  const wartosc = wariant && wersja ? wersja.wartosci[wariant.klucz] : undefined;
  return typeof wartosc === 'number' ? wartosc : WYMIAR_MACIERZYNSKIEGO_DOMYSLNY[indeks];
}

/** Kwota sprawy przeliczona na nową liczbę dzieci (kwota na jedno dziecko × liczba). */
function zLiczbaDzieci(p: PozycjaPlanu, liczba: number): PozycjaPlanu {
  if (p.liczbaDzieci === liczba) return p;
  const kwota =
    p.kwota && p.liczbaDzieci > 0
      ? { ...p.kwota, kwota: Math.round((p.kwota.kwota / p.liczbaDzieci) * liczba) }
      : p.kwota;
  return { ...p, liczbaDzieci: liczba, ...(kwota ? { kwota } : {}) };
}

function liczbaDlaKwoty(id: IdPozycji, l: LiczbyDzieciRodziny): number | null {
  if (id === 'K14' || id === 'K15') return l.urodzoneZywo;
  if (id === 'K17') return l.urodzoneZywoZaZyciem;
  if (id === 'K12' || id === 'K13' || id === 'K18') return l.przyZyciu;
  return null;
}

function nowaPozycja(
  idPozycji: 'K34' | 'K35',
  katalog: Katalog,
  poprzednia: PozycjaPlanu | undefined,
  liczbaDzieci: number,
): PozycjaPlanu {
  const zKatalogu: PozycjaKatalogu | undefined = katalog.pozycje.find((p) => p.id === idPozycji);
  const domyslne =
    idPozycji === 'K34'
      ? ({ rodzaj: 'swiadczenie', etap: 'urlopy-i-zasilek', rodzic: 'matka' } as const)
      : ({ rodzaj: 'informacja', etap: 'pierwsze-tygodnie', rodzic: 'oboje-rodzice' } as const);
  return {
    idSprawy: idPozycji,
    idPozycji,
    rodzaj: zKatalogu?.rodzaj ?? domyslne.rodzaj,
    etap: zKatalogu?.etap ?? domyslne.etap,
    rodzic: domyslne.rodzic,
    status: poprzednia?.status ?? 'do-zrobienia',
    zrodloStatusu: poprzednia?.zrodloStatusu ?? 'wyliczenie-planu',
    ...(poprzednia?.dataOznaczenia ? { dataOznaczenia: poprzednia.dataOznaczenia } : {}),
    liczbaDzieci,
    ostrzezenia: [],
    oznaczenia: poprzednia?.oznaczenia ?? [],
  };
}

function zapewnijPozycje(
  pozycje: PozycjaPlanu[],
  idPozycji: 'K34' | 'K35',
  w: WejsciePlanu,
  liczbaDzieci: number,
  zmiana: (p: PozycjaPlanu) => PozycjaPlanu = (p) => p,
): PozycjaPlanu[] {
  const poprzednia = w.poprzedniPlan?.pozycje.find((p) => p.idSprawy === idPozycji);
  const istniejaca = pozycje.find((p) => p.idSprawy === idPozycji);
  if (istniejaca) return pozycje.map((p) => (p === istniejaca ? zmiana(p) : p));
  return [...pozycje, zmiana(nowaPozycja(idPozycji, w.katalog, poprzednia, liczbaDzieci))];
}

function usunJesliMozna(pozycje: PozycjaPlanu[], czyUsunac: (p: PozycjaPlanu) => boolean, w: WejsciePlanu): PozycjaPlanu[] {
  const wynik: PozycjaPlanu[] = [];
  for (const p of pozycje) {
    if (!czyUsunac(p)) {
      wynik.push(p);
      continue;
    }
    const poprzednia = w.poprzedniPlan?.pozycje.find((q) => q.idSprawy === p.idSprawy);
    if (czyZlozonaAlboZalatwiona(p, poprzednia)) {
      wynik.push({ ...p, sytuacjaSzczegolna: { ...p.sytuacjaSzczegolna, zachowanaPoStracie: true } });
    }
  }
  return wynik;
}

function okresK34(w: WejsciePlanu, dataPorodu: DataISO) {
  const daneCiazy = w.daneCiazy;
  const straty = daneCiazy ? stratyDoOkresuK34(daneCiazy) : null;
  if (straty === null) return null;
  return okresZasilkuPoStracie(dataPorodu, straty.rodzaj, straty.dataZgonu, w.katalog);
}

export const sytuacjaSzczegolna: KrokPlanu = (pozycje, w) => {
  const daneCiazy = w.daneCiazy;
  if (daneCiazy === null || daneCiazy.wylaczoneZUzycia) return pozycje;
  const sytuacje = daneCiazy.sytuacjeSzczegolne ?? [];
  if (sytuacje.length === 0) return pozycje;

  const liczby = liczbyDzieci(daneCiazy);
  const spokojny = czySpokojnyTryb(daneCiazy);
  const maStrate = sytuacje.some((s) => RODZAJE_STRATY.includes(s.rodzaj));
  const dataPorodu = daneCiazy.dataPorodu ?? sytuacje.find((s) => RODZAJE_STRATY.includes(s.rodzaj))?.dataZdarzenia;
  let wynik = pozycje;

  // Sprawy po stracie dziecka, gdy przy życiu nie zostało żadne dziecko z ciąży.
  const bezDzieciPrzyZyciu = maStrate && liczby.przyZyciu === 0;
  if (bezDzieciPrzyZyciu) {
    const bezUrodzonychZywo = liczby.urodzoneZywo === 0;
    wynik = usunJesliMozna(
      wynik,
      (p) => {
        const id = idPozycjiSprawy(p);
        if (p.etap === 'ciaza' && id !== null) return true;
        if (id === null) return false;
        return USUWANE_PO_STRACIE.includes(id) || (bezUrodzonychZywo && NA_DZIECKO_URODZONE_ZYWO.includes(id));
      },
      w,
    );
    const terminK06 = terminK06PoStracie(daneCiazy);
    const bezPrzypomnien: readonly IdPozycji[] = bezUrodzonychZywo ? ['K06'] : BEZ_PRZYPOMNIEN_PO_ZGONIE;
    wynik = wynik.map((p) => {
      const id = idPozycjiSprawy(p);
      if (id === null) return p;
      let nowa = p;
      if (id === 'K06' && terminK06) {
        nowa = { ...nowa, sytuacjaSzczegolna: { ...nowa.sytuacjaSzczegolna, terminPoStracie: terminK06 } };
      }
      if (spokojny && bezPrzypomnien.includes(id) && nowa.status === 'do-zrobienia') nowa = { ...nowa, bezPrzypomnien: true };
      return nowa;
    });
  }

  // Zasiłek macierzyński po stracie dziecka dla matki, która w dniu porodu podlegała ubezpieczeniu chorobowemu.
  const kanal = kanalK34(w.daneRodziny);
  const okres = bezDzieciPrzyZyciu && dataPorodu ? okresK34(w, dataPorodu) : null;
  if (bezDzieciPrzyZyciu && kanal !== null && okres !== null) {
    wynik = zapewnijPozycje(wynik, 'K34', w, liczby.zCiazy, (p) => ({
      ...p,
      dane: { ...p.dane, okresK34: okres, kanalK34: kanal },
    }));
  } else {
    wynik = usunJesliMozna(wynik, (p) => p.idSprawy === 'K34', w);
  }

  // Wymiar urlopu macierzyńskiego i kwoty świadczeń dla liczby dzieci po stracie.
  if (maStrate) {
    wynik = wynik.map((p) => {
      const id = idPozycjiSprawy(p);
      if (id === null) return p;
      let nowa = p;
      if ((id === 'K07' || id === 'K08') && liczby.przyZyciu >= 1 && liczby.przyZyciu < liczby.zCiazy) {
        nowa = {
          ...nowa,
          sytuacjaSzczegolna: {
            ...nowa.sytuacjaSzczegolna,
            wymiarMacierzynskiegoTygodni: wymiarMacierzynskiego(w.katalog, liczby.przyZyciu),
          },
        };
      }
      const liczba = liczbaDlaKwoty(id, liczby);
      if (liczba !== null && liczba > 0) nowa = zLiczbaDzieci(nowa, liczba);
      return nowa;
    });
  }

  // Wsparcie organizacji w sytuacji szczególnej.
  if (sytuacje.some((s) => RODZAJE_Z_K35.includes(s.rodzaj))) {
    wynik = zapewnijPozycje(wynik, 'K35', w, liczby.zCiazy);
  } else {
    wynik = usunJesliMozna(wynik, (p) => p.idSprawy === 'K35', w);
  }

  return wynik;
};
