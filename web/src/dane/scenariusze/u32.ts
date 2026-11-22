// Scenariusze demonstracyjne jednostki u32 (kontrakt, sekcja 6.6). Właściciel: u32.
// Scenariusz odtwarza stan z kryteriów akceptacji historyjek jednostki.
// Łączenie urlopu rodzicielskiego z pracą po wysłanym wniosku o urlop macierzyński z rodzicielskim (3.9.6.1.3).
import { PESEL_MAGDALENY, ciazaPoPorodzie, stanMagdaleny } from '@/dane/scenariusze/u28';
import type { ScenariuszDemo, WniosekOUrlop, ZnacznikCzasu } from '@/domena/typy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewDemoSettings.scenariusze.pozycje;

function wyslanyMacierzynskiZRodzicielskim(teraz: ZnacznikCzasu): WniosekOUrlop {
  return {
    idWniosku: 'W-DEMO-U32-MACIERZYNSKI',
    rodzaj: 'urlop-do-pracodawcy',
    podrodzaj: 'macierzynski-z-rodzicielskim',
    idSprawy: 'K07',
    konto: PESEL_MAGDALENY,
    rola: 'rodzic',
    stan: 'wyslany',
    adresat: 'pracodawca',
    dataZlozenia: '2026-11-25',
    dataPoczatkuOchrony: '2026-11-25',
    potwierdzenie: 'URLOP-DEMO-2026-0001',
    emailPracodawcy: 'kadry@przyklad.pl',
    utworzono: teraz,
    zaktualizowano: teraz,
    zakres: 'z-calym-rodzicielskim',
    wariant: '81-5',
    okresy: [
      { rodzajUrlopu: 'macierzynski', od: '2026-11-19', do: '2027-04-07', tygodnie: 20, stawka: 81.5, rodzic: 'matka' },
      { rodzajUrlopu: 'rodzicielski', od: '2027-04-08', do: '2027-11-17', tygodnie: 32, stawka: 81.5, rodzic: 'matka' },
    ],
    oswiadczenia: { zamiarDrugiegoRodzica: false },
    zalaczniki: [],
    ostatniEkran: 'ViewLeaveRequestSent',
  };
}

export const scenariuszeU32: readonly ScenariuszDemo[] = [
  {
    id: 'u32-laczenie-z-praca',
    nazwa: tekst['u32-laczenie-z-praca'].nazwa,
    opis: tekst['u32-laczenie-z-praca'].opis,
    pesel: PESEL_MAGDALENY,
    zastosuj: (ctx) => ({
      ...stanMagdaleny(ciazaPoPorodzie(), [wyslanyMacierzynskiZRodzicielskim(ctx.teraz)], ctx),
      parametry: { dataDemo: '2027-06-01' },
    }),
  },
];
