// Rozmowa z asystentem AI i zatwierdzanie proponowanych działań (kontrakt, sekcja 6.5). Właściciel: u31 (Asystent AI).
// Log rozmowy (Interakcje asystenta AI) żyje w stanie konta, a bieżąca rozmowa i szkic pola w stanie sesji,
// więc po ponownym zalogowaniu panel zaczyna nową rozmowę, a wcześniejsze zostają w logu (R-AS-CIAG, R-AS-LOG).
// Zmianę statusu sprawy asystent wykonuje wyłącznie operacją Planu rodzica `ustawStatusSprawy` (R-AS-DZIAL).
import { odczytajKatalog, odczytajStanKonta, odczytajStanSesji, odczytajZalogowanego, osobyRodziny, rodzinaKonta, daneZusDrugiegoRodzica, czySymulacja, wykonajOperacje, wykonajOperacjeZWynikiem, zmienStanKonta, zmienStanSesji } from '@/dane/magazyn/stan';
import type { KontekstRodziny } from '@/dane/magazyn/hooki';
import { losowyUuid } from '@/dane/magazyn/losowanie';
import { ustawStatusSprawy } from '@/dane/magazyn/operacje/plan';
import { interakcjeAsystentaPuste } from '@/dane/magazyn/stan-poczatkowy';
import { przytnijWiadomosc, walidujWiadomosc } from '@/domena/asystent/intencje';
import { zbudujKontekstAsystenta } from '@/domena/asystent/kontekst';
import { dozwoloneDzialanie } from '@/domena/asystent/uprawnienia';
import { roznicaDni } from '@/domena/daty';
import { stanZgody } from '@/domena/konto';
import type {
  BladAsystenta,
  DataISO,
  InterakcjeAsystenta,
  KontekstAsystenta,
  KontekstOperacji,
  OdpowiedzAsystenta,
  Pesel,
  RozmowaAsystenta,
  StanKonta,
  WiadomoscAsystenta,
  WynikOperacji,
  ZapytanieAsystenta,
  ZnacznikCzasu,
} from '@/domena/typy';
import { teksty } from '@/teksty';

/** Limit czasu żądania do API asystenta po stronie przeglądarki (serwer kończy po 20 s). */
const LIMIT_CZASU_ZADANIA_MS = 25_000;
/** Liczba ostatnich wiadomości rozmowy wysyłanych jako historia. */
const DLUGOSC_HISTORII = 10;

function interakcje(stan: StanKonta): InterakcjeAsystenta {
  return stan.interakcjeAsystenta ?? interakcjeAsystentaPuste();
}

function zmienRozmowe(pesel: Pesel, idRozmowy: string, fn: (r: RozmowaAsystenta) => RozmowaAsystenta): void {
  zmienStanKonta(pesel, (stan) => {
    const i = interakcje(stan);
    return { ...stan, interakcjeAsystenta: { ...i, rozmowy: i.rozmowy.map((r) => (r.idRozmowy === idRozmowy ? fn(r) : r)) } };
  });
}

function dopiszWiadomosc(pesel: Pesel, idRozmowy: string, w: WiadomoscAsystenta): void {
  zmienRozmowe(pesel, idRozmowy, (r) => ({ ...r, wiadomosci: [...r.wiadomosci, w] }));
}

/** Bieżąca rozmowa sesji zalogowanego konta albo null. */
export function biezacaRozmowa(): { pesel: Pesel; idSesji: string; rozmowa: RozmowaAsystenta | null } | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const idRozmowy = odczytajStanSesji(zalogowany.sesja.idSesji)?.panelAsystenta.idRozmowy;
  const rozmowa = idRozmowy ? interakcje(zalogowany.stanKonta).rozmowy.find((r) => r.idRozmowy === idRozmowy) ?? null : null;
  return { pesel: zalogowany.sesja.pesel, idSesji: zalogowany.sesja.idSesji, rozmowa };
}

/** Szkic pola wiadomości w stanie sesji; trwa przy zwinięciu panelu i nawigacji (KA-10 3.11.1.2.1). */
export function zapiszSzkicWiadomosci(szkic: string, ctx: KontekstOperacji): WynikOperacji {
  void ctx;
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0003' };
  return wykonajOperacje(() => {
    zmienStanSesji(zalogowany.sesja.idSesji, (s) => ({ ...s, panelAsystenta: { ...s.panelAsystenta, szkic: przytnijWiadomosc(szkic) } }));
  });
}

/**
 * Parametr systemu „okres przechowywania logu rozmowy” w dniach (R-AS-LOG). Wartość ustala zespół, a demo przyjmuje 365 dni.
 */
export const OKRES_PRZECHOWYWANIA_LOGU_ROZMOWY_DNI = 365;

/**
 * Porządek logu rozmowy (R-AS-LOG, KA-06 i KA-07 3.11.1.1.3): usuwa wpisy starsze niż okres przechowywania logu rozmowy,
 * a dla konta bez zgody na dane dotyczące zdrowia zostawia z wcześniejszych rozmów wynik klasyfikacji intencji,
 * datę i godzinę oraz decyzje o działaniach, bez treści wiadomości.
 */
export function uporzadkujLogRozmowy(i: InterakcjeAsystenta, zgoda: boolean, dzis: DataISO): InterakcjeAsystenta {
  const aktualny = (czas: ZnacznikCzasu) => roznicaDni(czas.slice(0, 10), dzis) <= OKRES_PRZECHOWYWANIA_LOGU_ROZMOWY_DNI;
  const rozmowy = i.rozmowy
    .map((r) => ({
      ...r,
      wiadomosci: r.wiadomosci.filter((w) => aktualny(w.czas)).map((w) => (zgoda ? w : { ...w, tresc: '' })),
    }))
    .filter((r) => r.wiadomosci.length > 0);
  return { rozmowy, audyt: i.audyt.filter((a) => aktualny(a.czas)) };
}

/** Nowa rozmowa w logu konta i w stanie sesji; Nowy użytkownik dostaje pierwszą wiadomość 0256. */
export function nowaRozmowa(ctx: KontekstOperacji): WynikOperacji<{ idRozmowy: string }> {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return { ok: false, kod: '0003' };
  const { sesja, stanKonta } = zalogowany;
  const rola = stanKonta.konto.rola;
  const idRozmowy = losowyUuid();
  const wiadomosci: WiadomoscAsystenta[] =
    rola === 'nowy-uzytkownik'
      ? [
          {
            id: losowyUuid(),
            autor: 'asystent',
            tresc: teksty.komunikaty['0256'],
            czas: ctx.teraz,
            rola,
            kodKomunikatu: '0256',
            propozycja: { rodzaj: 'przejdz', idWidoku: 'ViewProfileZusData' },
          },
        ]
      : [];
  return wykonajOperacje(() => {
    zmienStanKonta(sesja.pesel, (stan) => {
      const i = uporzadkujLogRozmowy(interakcje(stan), stanZgody(stan.konto.decyzjeOZgodzie) === 'udzielona', ctx.dzis);
      return { ...stan, interakcjeAsystenta: { ...i, rozmowy: [...i.rozmowy, { idRozmowy, konto: sesja.pesel, rozpoczeto: ctx.teraz, wiadomosci }] } };
    });
    zmienStanSesji(sesja.idSesji, (s) => ({ ...s, panelAsystenta: { ...s.panelAsystenta, idRozmowy } }));
    return { idRozmowy };
  });
}

/** Kontekst asystenta zalogowanego konta w chwili pytania (R-AS-ZRODLA, R-AS-NU). */
function kontekstZalogowanego(ctx: KontekstOperacji): KontekstAsystenta | null {
  const zalogowany = odczytajZalogowanego();
  if (zalogowany === null) return null;
  const stanKonta = zalogowany.stanKonta;
  const konto = stanKonta.konto;
  const katalog = odczytajKatalog();
  const rodzina = konto.rola === 'nowy-uzytkownik' ? null : rodzinaKonta(konto);
  if (rodzina === null) {
    return zbudujKontekstAsystenta({ konto, katalog, kopia: stanKonta.kopiaDanychZus, wyniki: stanKonta.wynikiKalkulacji }, ctx.dzis);
  }
  const osoby = osobyRodziny(rodzina.daneRodziny);
  const stanMatki = osoby.peselMatki ? odczytajStanKonta(osoby.peselMatki) : null;
  const stanDrugiego = osoby.peselDrugiegoRodzica ? odczytajStanKonta(osoby.peselDrugiegoRodzica) : null;
  const kontekstRodziny: KontekstRodziny = {
    konto,
    rola: konto.rola,
    stanZgody: stanZgody(konto.decyzjeOZgodzie),
    rodzina,
    katalog,
    daneZusKonta: stanKonta.kopiaDanychZus,
    daneZusMatki: stanMatki?.kopiaDanychZus ?? null,
    daneZusDrugiegoRodzica: daneZusDrugiegoRodzica(rodzina, stanDrugiego, stanMatki),
    dzis: ctx.dzis,
    teraz: ctx.teraz,
  };
  return zbudujKontekstAsystenta(kontekstRodziny, ctx.dzis);
}

function czyOdpowiedz(w: unknown): w is OdpowiedzAsystenta {
  if (typeof w !== 'object' || w === null) return false;
  const o = w as Record<string, unknown>;
  return typeof o.tekst === 'string' && typeof o.intencja === 'string' && Array.isArray(o.sprawy) && o.oznaczenieAI === true;
}

async function zapytajApi(zapytanie: ZapytanieAsystenta): Promise<OdpowiedzAsystenta | null> {
  try {
    const odpowiedz = await fetch('/api/asystent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zapytanie),
      signal: AbortSignal.timeout(LIMIT_CZASU_ZADANIA_MS),
    });
    if (!odpowiedz.ok) {
      const blad = (await odpowiedz.json().catch(() => null)) as BladAsystenta | null;
      void blad;
      return null;
    }
    const tresc: unknown = await odpowiedz.json();
    return czyOdpowiedz(tresc) ? tresc : null;
  } catch {
    return null;
  }
}

/** Odpowiedź na wiadomość użytkownika: API asystenta albo 0071 (R-AS-NIED). */
async function odpowiedzNa(pesel: Pesel, idRozmowy: string, idWiadomosci: string, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const stan = odczytajStanKonta(pesel);
  const rozmowa = stan ? interakcje(stan).rozmowy.find((r) => r.idRozmowy === idRozmowy) : undefined;
  const pytanie = rozmowa?.wiadomosci.find((w) => w.id === idWiadomosci);
  if (stan === null || rozmowa === undefined || pytanie === undefined) return { ok: false, kod: '0003' };
  const rola = stan.konto.rola;

  const niedostepny = (): WynikOperacji => {
    const zapis = wykonajOperacje(() =>
      dopiszWiadomosc(pesel, idRozmowy, {
        id: losowyUuid(),
        autor: 'asystent',
        tresc: teksty.komunikaty['0071'],
        czas: ctx.teraz,
        rola,
        kodKomunikatu: '0071',
      }),
    );
    return zapis.ok ? { ok: false, kod: '0071' } : zapis;
  };

  if (czySymulacja('asystentNiedostepny')) return niedostepny();
  const kontekst = kontekstZalogowanego(ctx);
  if (kontekst === null) return { ok: false, kod: '0003' };
  const historia = rozmowa.wiadomosci
    .filter((w) => w.id !== idWiadomosci && w.kodKomunikatu !== '0071')
    .slice(-DLUGOSC_HISTORII)
    .map((w) => ({ autor: w.autor, tresc: w.tresc }));
  const odpowiedz = await zapytajApi({ idRozmowy, wiadomosc: pytanie.tresc, historia, kontekst });

  // Po wylogowaniu w trakcie oczekiwania odpowiedź nie trafia do logu innego konta.
  if (odczytajZalogowanego()?.sesja.pesel !== pesel) return { ok: false, kod: '0003' };
  if (odpowiedz === null) return niedostepny();
  return wykonajOperacje(() => {
    zmienRozmowe(pesel, idRozmowy, (r) => ({
      ...r,
      wiadomosci: [
        ...r.wiadomosci.map((w) => (w.id === idWiadomosci ? { ...w, intencja: odpowiedz.intencja, sprawy: odpowiedz.sprawy } : w)),
        {
          id: losowyUuid(),
          autor: 'asystent',
          tresc: odpowiedz.tekst,
          czas: ctx.teraz,
          rola,
          intencja: odpowiedz.intencja,
          sprawy: odpowiedz.sprawy,
          ...(odpowiedz.propozycja ? { propozycja: odpowiedz.propozycja } : {}),
          ...(odpowiedz.propozycja?.rodzaj === 'oznacz-sprawe' ? { stanPropozycji: 'oczekuje' as const } : {}),
          ...(odpowiedz.akcjeKanalow ? { akcjeKanalow: odpowiedz.akcjeKanalow } : {}),
          ...(odpowiedz.kodKomunikatu ? { kodKomunikatu: odpowiedz.kodKomunikatu } : {}),
        },
      ],
    }));
  });
}

/** Wiadomość do API asystenta (0071 przy asystentNiedostepny, bez wywołania API). */
export async function wyslijWiadomosc(tresc: string, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const tekst = przytnijWiadomosc(tresc);
  if (!walidujWiadomosc(tekst)) return { ok: false, kod: '0006' };
  const biezaca = biezacaRozmowa();
  if (biezaca === null) return { ok: false, kod: '0003' };
  let idRozmowy = biezaca.rozmowa?.idRozmowy;
  if (idRozmowy === undefined) {
    const nowa = nowaRozmowa(ctx);
    if (!nowa.ok) return nowa;
    idRozmowy = nowa.wartosc.idRozmowy;
  }
  const stan = odczytajStanKonta(biezaca.pesel);
  if (stan === null) return { ok: false, kod: '0003' };
  const idWiadomosci = losowyUuid();
  const rozmowaId = idRozmowy;
  const zapis = wykonajOperacje(() => {
    dopiszWiadomosc(biezaca.pesel, rozmowaId, {
      id: idWiadomosci,
      autor: 'uzytkownik',
      tresc: tekst,
      czas: ctx.teraz,
      rola: stan.konto.rola,
    });
    zmienStanSesji(biezaca.idSesji, (s) => ({ ...s, panelAsystenta: { ...s.panelAsystenta, szkic: '' } }));
  });
  if (!zapis.ok) return zapis;
  return odpowiedzNa(biezaca.pesel, rozmowaId, idWiadomosci, ctx);
}

/** Ponowne wysłanie pytania po 0071: usuwa komunikat niedostępności i pyta asystenta jeszcze raz. */
export async function ponowWiadomosc(idWiadomosci: string, ctx: KontekstOperacji): Promise<WynikOperacji> {
  const biezaca = biezacaRozmowa();
  const rozmowa = biezaca?.rozmowa;
  if (biezaca === null || rozmowa === null || rozmowa === undefined) return { ok: false, kod: '0003' };
  const indeks = rozmowa.wiadomosci.findIndex((w) => w.id === idWiadomosci);
  if (indeks < 0) return { ok: false, kod: '0003' };
  const usun = rozmowa.wiadomosci.slice(indeks + 1).filter((w) => w.kodKomunikatu === '0071').map((w) => w.id);
  const zapis = wykonajOperacje(() =>
    zmienRozmowe(biezaca.pesel, rozmowa.idRozmowy, (r) => ({ ...r, wiadomosci: r.wiadomosci.filter((w) => !usun.includes(w.id)) })),
  );
  if (!zapis.ok) return zapis;
  return odpowiedzNa(biezaca.pesel, rozmowa.idRozmowy, idWiadomosci, ctx);
}

function wiadomoscZPropozycja(idWiadomosci: string) {
  const biezaca = biezacaRozmowa();
  const rozmowa = biezaca?.rozmowa;
  if (biezaca === null || !rozmowa) return null;
  const wiadomosc = rozmowa.wiadomosci.find((w) => w.id === idWiadomosci);
  if (wiadomosc?.propozycja?.rodzaj !== 'oznacz-sprawe' || wiadomosc.stanPropozycji !== 'oczekuje') return null;
  return { ...biezaca, rozmowa, wiadomosc, propozycja: wiadomosc.propozycja };
}

/** Identyfikator wpisu śladu audytowego decyzji o propozycji z wiadomości. */
export function idZapisuAudytowego(idWiadomosci: string): string {
  return `decyzja-${idWiadomosci}`;
}

/** Zatwierdzenie oznaczenia sprawy: ustawStatusSprawy, ślad audytowy i komunikat 0033 (KA-02, KA-04 3.11.1.1.2). */
export function zatwierdzDzialanie(idWiadomosci: string, ctx: KontekstOperacji): WynikOperacji {
  const dane = wiadomoscZPropozycja(idWiadomosci);
  if (dane === null) return { ok: false, kod: '0003' };
  const { pesel, rozmowa, propozycja } = dane;
  const stan = odczytajStanKonta(pesel);
  if (stan === null) return { ok: false, kod: '0003' };
  const rola = stan.konto.rola;
  const plan = rodzinaKonta(stan.konto)?.plan ?? null;
  if (!dozwoloneDzialanie(rola, propozycja, plan)) return { ok: false, kod: '0003' };
  const statusPrzed = plan?.pozycje.find((p) => p.idSprawy === propozycja.idSprawy)?.status;

  return wykonajOperacjeZWynikiem(() => {
    const zmiana = ustawStatusSprawy(propozycja.idSprawy, propozycja.status, 'asystent', ctx);
    if (!zmiana.ok) return zmiana;
    zmienStanKonta(pesel, (s) => {
      const i = interakcje(s);
      return {
        ...s,
        interakcjeAsystenta: {
          rozmowy: i.rozmowy.map((r) =>
            r.idRozmowy !== rozmowa.idRozmowy
              ? r
              : {
                  ...r,
                  wiadomosci: [
                    ...r.wiadomosci.map((w) => (w.id === idWiadomosci ? { ...w, stanPropozycji: 'wykonana' as const } : w)),
                    ...(propozycja.status === 'zalatwiona'
                      ? [{ id: losowyUuid(), autor: 'asystent' as const, tresc: teksty.komunikaty['0033'], czas: ctx.teraz, rola, kodKomunikatu: '0033' as const }]
                      : []),
                  ],
                },
          ),
          audyt: [
            ...i.audyt,
            {
              id: idZapisuAudytowego(idWiadomosci),
              czas: ctx.teraz,
              konto: pesel,
              rola,
              idRozmowy: rozmowa.idRozmowy,
              decyzja: 'zatwierdzenie',
              dzialanie: propozycja,
              ...(statusPrzed ? { statusPrzed } : {}),
              statusPo: propozycja.status,
            },
          ],
        },
      };
    });
    return { ok: true, wartosc: undefined };
  });
}

/** Odrzucenie propozycji: plan bez zmian, ślad audytowy odrzucenia (KA-03 3.11.1.1.2). */
export function odrzucDzialanie(idWiadomosci: string, ctx: KontekstOperacji): WynikOperacji {
  const dane = wiadomoscZPropozycja(idWiadomosci);
  if (dane === null) return { ok: false, kod: '0003' };
  const { pesel, rozmowa, propozycja } = dane;
  const stan = odczytajStanKonta(pesel);
  if (stan === null) return { ok: false, kod: '0003' };
  const rola = stan.konto.rola;
  const statusPrzed = rodzinaKonta(stan.konto)?.plan?.pozycje.find((p) => p.idSprawy === propozycja.idSprawy)?.status;
  return wykonajOperacje(() => {
    zmienStanKonta(pesel, (s) => {
      const i = interakcje(s);
      return {
        ...s,
        interakcjeAsystenta: {
          rozmowy: i.rozmowy.map((r) =>
            r.idRozmowy !== rozmowa.idRozmowy
              ? r
              : { ...r, wiadomosci: r.wiadomosci.map((w) => (w.id === idWiadomosci ? { ...w, stanPropozycji: 'odrzucona' as const } : w)) },
          ),
          audyt: [
            ...i.audyt,
            {
              id: idZapisuAudytowego(idWiadomosci),
              czas: ctx.teraz,
              konto: pesel,
              rola,
              idRozmowy: rozmowa.idRozmowy,
              decyzja: 'odrzucenie',
              dzialanie: propozycja,
              ...(statusPrzed ? { statusPrzed, statusPo: statusPrzed } : {}),
            },
          ],
        },
      };
    });
  });
}
