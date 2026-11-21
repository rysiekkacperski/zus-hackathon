// Słownik dokumentów i adresatów wniosków (kontrakt, sekcja 8; ANALIZY/05 sekcja 4.2).
// Właściciel: u16. Treść wpisów pochodzi z Wspólnych wymagań epiku 3.5.2. Pole `swiadczenieAlboWniosek`
// jest kluczem wyboru w `wybierzDokumenty` (domena/zasilki/dokumenty.ts), a `klucz.sytuacja` ma wartość
// SYTUACJA_ROWNIEZ_PO_USTANIU dla wpisu, który obejmuje formę zatrudnienia i każdą matkę po ustaniu ubezpieczenia.
import type { WpisSlownikaDokumentow } from '@/domena/typy';

export const SYTUACJA_ROWNIEZ_PO_USTANIU = 'rowniez-po-ustaniu';

/** Nazwy świadczeń i wniosków w słowniku, używane jako klucz wyboru dokumentów. */
export const SWIADCZENIA_SLOWNIKA = {
  zasilekChorobowy: 'Zasiłek chorobowy',
  swiadczenieRehabilitacyjne: 'Świadczenie rehabilitacyjne',
  zwzm: 'Zasiłek w wysokości zasiłku macierzyńskiego',
  zasilekMacierzynski: 'Zasiłek macierzyński',
  zalacznikPrzedPorodem: 'Załącznik do zasiłku macierzyńskiego przed porodem',
  zalacznikMartweUrodzenie: 'Załącznik przy urodzeniu martwego dziecka',
  zalacznikZaZyciem: 'Załącznik przy zaświadczeniu „Za życiem”',
  zalacznikUzupelniajacy: 'Załącznik przy uzupełniającym urlopie macierzyńskim',
  zalacznikPrzyjecie: 'Załącznik przy przyjęciu dziecka na wychowanie',
  wniosekCzescPrzedPorodem: 'Wniosek o część urlopu macierzyńskiego przed porodem',
  rezygnacjaMatki: 'Rezygnacja matki z części urlopu macierzyńskiego',
  rezygnacjaZOrzeczeniem: 'Rezygnacja matki z orzeczeniem o niezdolności do samodzielnej egzystencji',
  wniosekOjcaPozostalaCzesc: 'Wniosek ojca o pozostałą część urlopu macierzyńskiego',
  wniosekOjcaSzpital: 'Wniosek ojca przy pobycie matki w szpitalu',
  wniosekOjcaZgonPorzucenie: 'Wniosek ojca po zgonie matki albo porzuceniu dziecka',
  wniosekUzupelniajacy: 'Wniosek o uzupełniający urlop macierzyński',
  wniosekRodzicielski: 'Wniosek o urlop rodzicielski',
  wniosekLaczenie: 'Wniosek o łączenie urlopu rodzicielskiego z pracą',
  wniosekOjcowski: 'Wniosek o urlop ojcowski',
  wniosekNaWarunkach: 'Wniosek o urlop na warunkach urlopu macierzyńskiego',
} as const;

const S = SWIADCZENIA_SLOWNIKA;
const TERMIN_ZAM_UOP = 'Data porodu powiększona o 21 dni dla wniosku o urlop macierzyński i rodzicielski w wariancie 81,5%.';
const TERMIN_ZAM = 'Data porodu powiększona o 21 dni dla wniosku w wariancie 81,5%.';

export const wpisySlownikaDokumentow: readonly WpisSlownikaDokumentow[] = [
  {
    id: 'zc-uop-platnik', grupa: 'zasilek-chorobowy', swiadczenieAlboWniosek: S.zasilekChorobowy,
    klucz: { formy: ['umowa-o-prace'], platnik: 'platnik-uprawniony' },
    dokumenty: [
      'Zaświadczenie lekarskie e-ZLA, które trafia do ZUS i na profil pracodawcy w eZUS.',
      'Pracownica informuje pracodawcę o nieobecności w pracy.',
    ],
    adresat: 'Pracodawca, który wypłaca zasiłek na podstawie zaświadczenia e-ZLA.', termin: 'Brak terminu.', kolejnosc: 1,
  },
  {
    id: 'zc-uop-zus', grupa: 'zasilek-chorobowy', swiadczenieAlboWniosek: S.zasilekChorobowy,
    klucz: { formy: ['umowa-o-prace'], platnik: 'zus' },
    dokumenty: [
      'Zaświadczenie lekarskie e-ZLA, które trafia do ZUS i na profil pracodawcy w eZUS.',
      'Pracownica informuje pracodawcę o nieobecności w pracy.',
      'Pracodawca przekazuje do ZUS zaświadczenie płatnika składek Z-3, a za dalszy okres niezdolności zaświadczenie ZAS-12.',
    ],
    adresat: 'Pracodawca, który przekazuje dokumenty do ZUS, a zasiłek wypłaca ZUS.', termin: 'Brak terminu.', kolejnosc: 2,
  },
  {
    id: 'zc-uz-platnik', grupa: 'zasilek-chorobowy', swiadczenieAlboWniosek: S.zasilekChorobowy,
    klucz: { formy: ['umowa-zlecenia'], platnik: 'platnik-uprawniony' },
    dokumenty: ['Zaświadczenie lekarskie e-ZLA.', 'Zleceniobiorczyni powstrzymuje się od pracy.'],
    adresat: 'Płatnik składek, który wypłaca zasiłek na podstawie zaświadczenia e-ZLA.', termin: 'Brak terminu.', kolejnosc: 3,
  },
  {
    id: 'zc-uz-zus', grupa: 'zasilek-chorobowy', swiadczenieAlboWniosek: S.zasilekChorobowy,
    klucz: { formy: ['umowa-zlecenia'], platnik: 'zus' },
    dokumenty: [
      'Zaświadczenie lekarskie e-ZLA.',
      'Zleceniobiorczyni powstrzymuje się od pracy i składa dokumenty płatnikowi składek albo do ZUS.',
      'Płatnik składek przekazuje do ZUS zaświadczenie płatnika składek Z-3a.',
    ],
    adresat: 'ZUS.', termin: 'Brak terminu.', kolejnosc: 4,
  },
  {
    id: 'zc-jdg', grupa: 'zasilek-chorobowy', swiadczenieAlboWniosek: S.zasilekChorobowy,
    klucz: { formy: ['jdg'], platnik: 'zus' },
    dokumenty: [
      'Zaświadczenie lekarskie e-ZLA i wniosek o zasiłek chorobowy ZAS-53 składany w eZUS, bez zaświadczenia płatnika składek.',
      'Osoba prowadząca działalność powstrzymuje się od pracy.',
    ],
    adresat: 'ZUS.', termin: 'Brak terminu.', kolejnosc: 5,
  },
  {
    id: 'zc-po-ustaniu', grupa: 'zasilek-chorobowy', swiadczenieAlboWniosek: S.zasilekChorobowy,
    klucz: { formy: 'kazda', platnik: 'zus', poUstaniu: true },
    dokumenty: [
      'Zaświadczenie lekarskie e-ZLA.',
      'Wniosek ZAS-53 z oświadczeniem osoby niezdolnej do pracy po ustaniu tytułu ubezpieczenia.',
    ],
    adresat: 'ZUS.', termin: 'Brak terminu.', kolejnosc: 6,
  },
  {
    id: 'sr-uop-uz', grupa: 'swiadczenie-rehabilitacyjne', swiadczenieAlboWniosek: S.swiadczenieRehabilitacyjne,
    klucz: { formy: ['umowa-o-prace', 'umowa-zlecenia'] },
    dokumenty: [
      'Wniosek o świadczenie rehabilitacyjne ZNp-7.',
      'Zaświadczenie lekarza prowadzącego leczenie o stanie zdrowia OL-9 wystawione najwcześniej miesiąc przed złożeniem wniosku.',
      'Wywiad zawodowy z miejsca pracy OL-10.',
    ],
    adresat: 'ZUS, o świadczeniu orzeka lekarz orzecznik ZUS.', termin: 'Brak terminu.', kolejnosc: 7,
  },
  {
    id: 'sr-jdg-po-ustaniu', grupa: 'swiadczenie-rehabilitacyjne', swiadczenieAlboWniosek: S.swiadczenieRehabilitacyjne,
    klucz: { formy: ['jdg'], sytuacja: SYTUACJA_ROWNIEZ_PO_USTANIU },
    dokumenty: [
      'Wniosek ZNp-7.',
      'Zaświadczenie OL-9 wystawione najwcześniej miesiąc przed złożeniem wniosku, bez wywiadu zawodowego.',
      'Po ustaniu tytułu ubezpieczenia także oświadczenie osoby niezdolnej do pracy po ustaniu tytułu ubezpieczenia.',
    ],
    adresat: 'ZUS, o świadczeniu orzeka lekarz orzecznik ZUS.', termin: 'Brak terminu.', kolejnosc: 8,
  },
  {
    id: 'zwzm-uop', grupa: 'zwzm', swiadczenieAlboWniosek: S.zwzm,
    klucz: { formy: ['umowa-o-prace'], platnik: 'zus', poUstaniu: true },
    dokumenty: [
      'Wniosek ZAS-55.',
      'Zaświadczenie lekarskie potwierdzające ciążę w okresie zatrudnienia.',
      'Świadectwo pracy albo inny dokument potwierdzający rozwiązanie albo wygaśnięcie umowy z powodu upadłości, likwidacji albo śmierci pracodawcy.',
      'Oświadczenie o braku innego zatrudnienia.',
      'Zaświadczenie płatnika składek Z-3.',
    ],
    adresat: 'ZUS.', termin: 'Zasiłek przysługuje do dnia poprzedzającego dzień porodu.', kolejnosc: 9,
  },
  {
    id: 'zm-uop-platnik', grupa: 'zasilek-macierzynski', swiadczenieAlboWniosek: S.zasilekMacierzynski,
    klucz: { formy: ['umowa-o-prace'], platnik: 'platnik-uprawniony' },
    dokumenty: [
      'Wniosek o urlop do pracodawcy zgodnie z wpisami wniosków pracownika.',
      'Odpis skrócony aktu urodzenia dziecka.',
    ],
    adresat: 'Pracodawca, który wypłaca zasiłek.', termin: TERMIN_ZAM_UOP, kolejnosc: 10,
  },
  {
    id: 'zm-uop-zus', grupa: 'zasilek-macierzynski', swiadczenieAlboWniosek: S.zasilekMacierzynski,
    klucz: { formy: ['umowa-o-prace'], platnik: 'zus' },
    dokumenty: [
      'Wniosek o urlop do pracodawcy zgodnie z wpisami wniosków pracownika, bez odpisu aktu urodzenia dla ZUS.',
      'Pracodawca przekazuje do ZUS zaświadczenie płatnika składek Z-3.',
    ],
    adresat: 'Pracodawca, który przekazuje zaświadczenie do ZUS, a zasiłek wypłaca ZUS.', termin: TERMIN_ZAM_UOP, kolejnosc: 11,
  },
  {
    id: 'zm-uz-platnik', grupa: 'zasilek-macierzynski', swiadczenieAlboWniosek: S.zasilekMacierzynski,
    klucz: { formy: ['umowa-zlecenia'], platnik: 'platnik-uprawniony' },
    dokumenty: ['Wniosek ZAM.', 'Odpis skrócony aktu urodzenia dziecka.'],
    adresat: 'Płatnik składek, który wypłaca zasiłek.', termin: TERMIN_ZAM, kolejnosc: 12,
  },
  {
    id: 'zm-uz-zus', grupa: 'zasilek-macierzynski', swiadczenieAlboWniosek: S.zasilekMacierzynski,
    klucz: { formy: ['umowa-zlecenia'], platnik: 'zus' },
    dokumenty: ['Wniosek ZAM bez odpisu aktu urodzenia.', 'Płatnik składek przekazuje do ZUS zaświadczenie płatnika składek Z-3a.'],
    adresat: 'ZUS.', termin: TERMIN_ZAM, kolejnosc: 13,
  },
  {
    id: 'zm-jdg', grupa: 'zasilek-macierzynski', swiadczenieAlboWniosek: S.zasilekMacierzynski,
    klucz: { formy: ['jdg'], platnik: 'zus' },
    dokumenty: ['Wniosek ZAM składany w eZUS bez odpisu aktu urodzenia.'],
    adresat: 'ZUS.', termin: TERMIN_ZAM, kolejnosc: 14,
  },
  {
    id: 'zm-po-ustaniu', grupa: 'zasilek-macierzynski', swiadczenieAlboWniosek: S.zasilekMacierzynski,
    klucz: { formy: 'kazda', platnik: 'zus', poUstaniu: true },
    dokumenty: [
      'Wniosek ZAM z częścią o urodzeniu dziecka po ustaniu zatrudnienia, bez odpisu aktu urodzenia.',
      'Zaświadczenie lekarskie potwierdzające ciążę w okresie zatrudnienia.',
      'Zaświadczenie płatnika składek Z-3.',
      'Przy ustaniu umowy z powodu upadłości, likwidacji albo śmierci pracodawcy świadectwo pracy albo inny dokument potwierdzający tę przyczynę.',
      'Przy rozwiązaniu umowy z naruszeniem przepisów prawomocne orzeczenie sądu o rozwiązaniu umowy z naruszeniem przepisów.',
    ],
    adresat: 'ZUS.', termin: TERMIN_ZAM, kolejnosc: 15,
  },
  {
    id: 'zal-przed-porodem', grupa: 'zalaczniki', swiadczenieAlboWniosek: S.zalacznikPrzedPorodem,
    klucz: { formy: 'kazda', sytuacja: 'przed-porodem' },
    dokumenty: ['Zaświadczenie lekarskie o przewidywanej dacie porodu za okres przed dniem porodu.'],
    adresat: 'Adresat wniosku o zasiłek macierzyński.', termin: 'Razem z wnioskiem.', kolejnosc: 16,
  },
  {
    id: 'zal-martwe-urodzenie', grupa: 'zalaczniki', swiadczenieAlboWniosek: S.zalacznikMartweUrodzenie,
    klucz: { formy: 'kazda', sytuacja: 'martwe-urodzenie' },
    dokumenty: [
      'Odpis skrócony aktu urodzenia z adnotacją o martwym urodzeniu.',
      'Gdy aktu nie sporządzono, zaświadczenie o martwym urodzeniu wystawione przez lekarza położnika, lekarza w trakcie specjalizacji albo położną bez względu na czas trwania ciąży.',
    ],
    adresat: 'Adresat wniosku o zasiłek macierzyński.', termin: 'Razem z wnioskiem.', kolejnosc: 17,
  },
  {
    id: 'zal-za-zyciem', grupa: 'zalaczniki', swiadczenieAlboWniosek: S.zalacznikZaZyciem,
    klucz: { formy: 'kazda', sytuacja: 'za-zyciem' },
    dokumenty: [
      'We wniosku ZAM oświadczenie o posiadaniu zaświadczenia „Za życiem”.',
      'U pracodawcy kopia zaświadczenia „Za życiem”.',
    ],
    adresat: 'Adresat wniosku o zasiłek macierzyński albo o urlop rodzicielski.', termin: 'Razem z wnioskiem.', kolejnosc: 18,
  },
  {
    id: 'zal-uzupelniajacy', grupa: 'zalaczniki', swiadczenieAlboWniosek: S.zalacznikUzupelniajacy,
    klucz: { formy: 'kazda', sytuacja: 'uzupelniajacy' },
    dokumenty: [
      'Zaświadczenie szpitala o pobycie dziecka w szpitalu.',
      'Oświadczenie, że drugi rodzic nie korzysta w tym okresie z uzupełniającego urlopu macierzyńskiego.',
    ],
    adresat: 'Adresat wniosku o zasiłek macierzyński albo pracodawca.',
    termin: 'Osoba niebędąca pracownikiem składa wniosek przed końcem zasiłku za okres urlopu macierzyńskiego, a pracownik co najmniej 21 dni przed zakończeniem urlopu macierzyńskiego.',
    kolejnosc: 19,
  },
  {
    id: 'zal-przyjecie', grupa: 'zalaczniki', swiadczenieAlboWniosek: S.zalacznikPrzyjecie,
    klucz: { formy: 'kazda', sytuacja: 'przyjecie' },
    dokumenty: [
      'Oświadczenie o dacie przyjęcia dziecka.',
      'Zaświadczenie sądu w sprawie przysposobienia albo orzeczenie o umieszczeniu dziecka w rodzinie zastępczej albo umowa ze starostą.',
      'Dokument potwierdzający wiek dziecka.',
      'Decyzja o odroczeniu obowiązku szkolnego, gdy ją wydano.',
    ],
    adresat: 'Adresat wniosku o zasiłek macierzyński albo pracodawca.', termin: 'Razem z wnioskiem.', kolejnosc: 20,
  },
  {
    id: 'wp-czesc-przed-porodem', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekCzescPrzedPorodem,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem, nazwiskiem i datą początku urlopu.',
      'Zaświadczenie lekarskie o przewidywanej dacie porodu.',
      'Urlop zaczyna się najwcześniej 6 tygodni przed przewidywanym terminem porodu.',
    ],
    adresat: 'Pracodawca.', termin: 'Brak terminu, a po porodzie urlop zaczyna się w dniu porodu bez wniosku.', kolejnosc: 21,
  },
  {
    id: 'wp-rezygnacja', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.rezygnacjaMatki,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem, nazwiskiem i terminem powrotu do pracy po wykorzystaniu co najmniej 14 tygodni urlopu po porodzie.',
      'Kopia wniosku ojca o pozostałą część urlopu albo oświadczenie ojca o przerwaniu działalności zarobkowej.',
    ],
    adresat: 'Pracodawca, który uwzględnia wniosek.', termin: 'Co najmniej 7 dni przed powrotem do pracy.', kolejnosc: 22,
  },
  {
    id: 'wp-rezygnacja-orzeczenie', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.rezygnacjaZOrzeczeniem,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem, nazwiskiem i terminem powrotu do pracy po wykorzystaniu co najmniej 8 tygodni urlopu po porodzie.',
      'Kopia wniosku ojca o pozostałą część urlopu albo oświadczenie ojca o przerwaniu działalności zarobkowej.',
      'Kopia prawomocnego orzeczenia.',
    ],
    adresat: 'Pracodawca.', termin: 'Co najmniej 7 dni przed powrotem do pracy.', kolejnosc: 23,
  },
  {
    id: 'wp-ojciec-pozostala-czesc', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekOjcaPozostalaCzesc,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem i nazwiskiem, imieniem, nazwiskiem i datą urodzenia dziecka, oświadczeniem o okresie urlopu wykorzystanym przez matkę przed porodem i okresem urlopu.',
      'Odpis skrócony aktu urodzenia.',
      'Oświadczenie matki o zamiarze rezygnacji z części urlopu.',
    ],
    adresat: 'Pracodawca.', termin: 'Co najmniej 14 dni przed rozpoczęciem urlopu.', kolejnosc: 24,
  },
  {
    id: 'wp-ojciec-szpital', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekOjcaSzpital,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z datą przerwania urlopu przez matkę po wykorzystaniu co najmniej 8 tygodni urlopu i zobowiązaniem do poinformowania o wypisie matki.',
      'Oświadczenie matki.',
      'Zaświadczenie szpitala.',
      'Odpis skrócony aktu urodzenia.',
    ],
    adresat: 'Pracodawca.', termin: 'Brak terminu.', kolejnosc: 25,
  },
  {
    id: 'wp-ojciec-zgon-porzucenie', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekOjcaZgonPorzucenie,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z oświadczeniem o dacie zgonu matki albo porzucenia dziecka, a przy porzuceniu po wykorzystaniu przez matkę co najmniej 8 tygodni urlopu.',
      'Odpis skrócony aktu urodzenia.',
    ],
    adresat: 'Pracodawca.', termin: 'Brak terminu.', kolejnosc: 26,
  },
  {
    id: 'wp-uzupelniajacy', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekUzupelniajacy,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem, nazwiskiem, terminem zakończenia urlopu macierzyńskiego i okresem urlopu uzupełniającego.',
      'Zaświadczenie szpitala.',
      'Oświadczenie, że drugi rodzic nie korzysta z tego urlopu.',
      'Urlop przysługuje jednorazowo.',
    ],
    adresat: 'Pracodawca, który uwzględnia wniosek.', termin: 'Co najmniej 21 dni przed zakończeniem urlopu macierzyńskiego.', kolejnosc: 27,
  },
  {
    id: 'wp-rodzicielski', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekRodzicielski,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem, nazwiskiem, dotychczas wykorzystanym urlopem rodzicielskim z liczbą części i okresem urlopu.',
      'Odpis skrócony aktu urodzenia.',
      'Oświadczenie o zamiarach drugiego rodzica co do urlopu rodzicielskiego.',
      'Kopia zaświadczenia „Za życiem” przy wymiarze 65 albo 67 tygodni.',
      'Urlop przysługuje w najwyżej 5 częściach do końca roku, w którym dziecko kończy 6 lat.',
    ],
    adresat: 'Pracodawca.', termin: 'Co najmniej 21 dni przed rozpoczęciem urlopu.', kolejnosc: 28,
  },
  {
    id: 'wp-laczenie', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekLaczenie,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem, nazwiskiem, wymiarem czasu pracy wynoszącym najwyżej połowę etatu, okresem łączenia i oświadczeniem o łączeniu części urlopu z wydłużenia, bez załączników.',
      'Pracodawca może odmówić ze względu na organizację albo rodzaj pracy i informuje o przyczynie odmowy w ciągu 7 dni.',
    ],
    adresat: 'Pracodawca, który udzielił urlopu rodzicielskiego.', termin: 'Co najmniej 21 dni przed podjęciem pracy.', kolejnosc: 29,
  },
  {
    id: 'wp-ojcowski', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekOjcowski,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem, nazwiskiem i okresem urlopu.',
      'Odpis skrócony aktu urodzenia.',
      'Kopia postanowienia o przysposobieniu przy przysposobieniu dziecka.',
      'Oświadczenie, czy ojciec korzystał już z urlopu ojcowskiego.',
      'Urlop przysługuje w wymiarze do 2 tygodni w najwyżej 2 częściach po co najmniej tygodniu do ukończenia przez dziecko 12 miesięcy.',
    ],
    adresat: 'Pracodawca.', termin: 'Co najmniej 7 dni przed rozpoczęciem urlopu.', kolejnosc: 30,
  },
  {
    id: 'wp-na-warunkach', grupa: 'wnioski-pracownika', swiadczenieAlboWniosek: S.wniosekNaWarunkach,
    klucz: { formy: ['umowa-o-prace'] },
    dokumenty: [
      'Wniosek z imieniem i nazwiskiem, imieniem, nazwiskiem i datą urodzenia dziecka i okresem urlopu.',
      'Oświadczenie o dacie przyjęcia dziecka.',
      'Zaświadczenie sądu albo kopia wniosku o przysposobienie z poświadczeniem sądu, albo orzeczenie o umieszczeniu dziecka w rodzinie zastępczej albo umowa ze starostą.',
      'Decyzja o odroczeniu obowiązku szkolnego, gdy ją wydano.',
    ],
    adresat: 'Pracodawca.', termin: 'W ciągu 7 dni od przyjęcia dziecka, a urlop zaczyna się najpóźniej 21 dni od przyjęcia dziecka.', kolejnosc: 31,
  },
];
