// Pozycje katalogu świadczeń K01–K37 z tabeli 3.5.1.1.1 (kontrakt, sekcja 8; ANALIZY/04).
// Właściciel: u04. Każda pozycja ma tytuł, rodzaj, etap, rodzica, warunek, instytucję i kanał,
// strukturalną regułę terminu, koszt spóźnienia, kanały według formy zatrudnienia i instrukcję.
//
// Tytuł, warunek i instytucję z kanałem przejmujemy dosłownie z tabeli Pozycje katalogu. Kanały według formy
// zatrudnienia rodzica sprawy wskazują przejście: kreator w przewodniku, serwis zewnętrzny w nowej karcie,
// sprawę u pracodawcy albo zleceniodawcy albo informację bez kanału. Instrukcja ma najwyżej 5 kroków.
import { ID_KWOT } from '@/dane/katalog/slownik-kwot';
import { ID_WYMIAROW } from '@/dane/katalog/slownik-wymiarow';
import type { InstrukcjaPozycji, KanalPozycji, PozycjaKatalogu, RegulaTerminu } from '@/domena/typy';

/** Adresy kanałów instytucji zapisane w instrukcjach pozycji. */
export const ADRESY_KANALOW = {
  ezus: 'https://www.zus.pl/portal/logowanie.npi',
  empatia: 'https://empatia.mrips.gov.pl',
  zgloszenieUrodzenia: 'https://www.gov.pl/web/gov/zglos-urodzenie-dziecka',
  rejestrStanuCywilnego: 'https://www.gov.pl/web/gov/uzyskaj-odpis-aktu-urodzenia',
} as const;

/** Odnośniki do serwisów informacyjnych w instrukcjach pozycji. */
export const ODNOSNIKI = {
  zus: { etykieta: 'Zasiłki – serwis informacyjny ZUS', url: 'https://www.zus.pl/swiadczenia/zasilki' },
  mrpips: {
    etykieta: 'Urlop rodzicielski – Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    url: 'https://www.gov.pl/web/rodzina/urlop-rodzicielski',
  },
  pip: {
    etykieta: 'Rodzicielstwo – porady prawne Państwowej Inspekcji Pracy',
    url: 'https://www.pip.gov.pl/dla-pracodawcow/porady-prawne/rodzicielstwo',
  },
} as const;

const ZASILKI = [ODNOSNIKI.zus];
const URLOPY = [ODNOSNIKI.zus, ODNOSNIKI.mrpips];
const URLOPY_PRACOWNIKA = [ODNOSNIKI.zus, ODNOSNIKI.mrpips, ODNOSNIKI.pip];
const PRACOWNIK = [ODNOSNIKI.pip];

const INFORMACJA: KanalPozycji = { typ: 'informacja' };
const U_PRACODAWCY: KanalPozycji = { typ: 'u-pracodawcy' };
const KREATOR_ZAM: KanalPozycji = { typ: 'kreator', idWidoku: 'ViewZamLeaveType' };
const KREATOR_ZAS53: KanalPozycji = { typ: 'kreator', idWidoku: 'ViewZas53Start' };
const EMPATIA: KanalPozycji = {
  typ: 'zewnetrzny',
  kanal: 'empatia',
  adres: ADRESY_KANALOW.empatia,
  adresSymulowany: '/kanal/empatia',
};

function ezus(adresSymulowany: string): KanalPozycji {
  return { typ: 'zewnetrzny', kanal: 'ezus', adres: ADRESY_KANALOW.ezus, adresSymulowany };
}

type KotwicaTerminu = Extract<RegulaTerminu, { typ: 'przesuniecie' }>['kotwica'];

function dni(kotwica: KotwicaTerminu, przesuniecie: number): RegulaTerminu {
  return { typ: 'przesuniecie', kotwica, przesuniecie, jednostka: 'dni' };
}

function miesiace(kotwica: KotwicaTerminu, przesuniecie: number): RegulaTerminu {
  return { typ: 'przesuniecie', kotwica, przesuniecie, jednostka: 'miesiace' };
}

const BRAK_TERMINU: RegulaTerminu = { typ: 'brak' };

function instrukcja(
  kroki: string[],
  daneIDokumenty: string[],
  odnosniki: InstrukcjaPozycji['odnosniki'] = [],
  adresKanalu?: string,
): InstrukcjaPozycji {
  return { kroki, daneIDokumenty, odnosniki: [...odnosniki], ...(adresKanalu !== undefined ? { adresKanalu } : {}) };
}

export const pozycjeKatalogu: readonly PozycjaKatalogu[] = [
  {
    id: 'K01',
    tytul: 'Pierwsza wizyta u lekarza albo położnej do końca 10. tygodnia ciąży',
    rodzaj: 'obowiazek',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis: 'Profil wskazuje, że wizyta u lekarza albo położnej jeszcze się nie odbyła, a dziecko się nie urodziło.',
    instytucjaIKanal: 'Lekarz albo położna, wizyta osobista.',
    kanaly: { kazda: INFORMACJA },
    regulaTerminu: { typ: 'przesuniecie', kotwica: 'koniec-10-tygodnia', przesuniecie: 0, jednostka: 'dni' },
    kosztSpoznienia: {
      typ: 'specjalny',
      kod: 'K01',
      tekst:
        'Becikowe 1000 zł, gdy dochód na osobę nie przekracza progu becikowego albo jest nieznany, powiększone o dodatek z tytułu urodzenia dziecka 1000 zł, gdy dochód na osobę nie przekracza progu zasiłku rodzinnego albo jest nieznany.',
    },
    instrukcja: instrukcja(
      [
        'Umów wizytę u lekarza ginekologa albo położnej tak, żeby odbyła się najpóźniej w ostatnim dniu 10. tygodnia ciąży.',
        'Weź na wizytę dowód osobisty i wyniki badań, jeśli już je masz.',
        'Poproś lekarza albo położną o wpisanie wizyty do dokumentacji opieki nad ciążą.',
        'Pod opieką lekarza albo położnej pozostań do porodu, bo zaświadczenie o opiece od 10. tygodnia ciąży jest potrzebne do becikowego i dodatku z tytułu urodzenia dziecka.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Dowód osobisty', 'Wyniki badań, jeśli je masz'],
    ),
  },
  {
    id: 'K02',
    tytul: 'Uznanie ojcostwa przed porodem',
    rodzaj: 'obowiazek',
    etap: 'ciaza',
    rodzic: 'oboje-rodzice',
    warunekOpis: 'Rodzice nie są małżeństwem, ojcostwo jest nieuznane, a dziecko się nie urodziło.',
    instytucjaIKanal: 'Urząd stanu cywilnego, wizyta obojga rodziców.',
    kanaly: { kazda: INFORMACJA },
    regulaTerminu: dni('przewidywany-termin-porodu', 0),
    kosztSpoznienia: {
      typ: 'skutek',
      tekst: 'Ojciec nie zgłosi urodzenia dziecka, a jego dane nie trafią do aktu urodzenia bez późniejszego uznania ojcostwa.',
    },
    instrukcja: instrukcja(
      [
        'Umówcie wspólną wizytę w dowolnym urzędzie stanu cywilnego przed przewidywanym terminem porodu.',
        'Przyjdźcie do urzędu razem, każde z dowodem osobistym albo paszportem.',
        'Przynieście zaświadczenie lekarza albo położnej o ciąży.',
        'Złóżcie oświadczenia o uznaniu ojcostwa przed kierownikiem urzędu stanu cywilnego.',
        'Oznaczcie sprawę w przewodniku jako załatwioną.',
      ],
      ['Dowody osobiste albo paszporty obojga rodziców', 'Zaświadczenie lekarza albo położnej o ciąży'],
    ),
  },
  {
    id: 'K03',
    tytul: 'Zgłoszenie do dobrowolnego ubezpieczenia chorobowego',
    rodzaj: 'obowiazek',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis:
      'Matka wykonuje umowę zlecenia albo prowadzi jednoosobową działalność gospodarczą bez dobrowolnego ubezpieczenia chorobowego, a dziecko się nie urodziło.',
    instytucjaIKanal: 'Przy jednoosobowej działalności gospodarczej eZUS, przy umowie zlecenia zleceniodawca.',
    kanaly: { jdg: ezus('/ezus'), 'umowa-zlecenia': U_PRACODAWCY },
    regulaTerminu: dni('przewidywany-termin-porodu', -1),
    kosztSpoznienia: {
      typ: 'skutek',
      tekst: 'Brak prawa do zasiłku macierzyńskiego, a rodzinie przysługuje wtedy świadczenie rodzicielskie.',
    },
    instrukcja: instrukcja(
      [
        'Przy jednoosobowej działalności gospodarczej wybierz przycisk Przejdź do eZUS i zaloguj się.',
        'Złóż zgłoszenie zmiany danych do ubezpieczeń (ZUS ZZA albo ZUS ZUA) z dobrowolnym ubezpieczeniem chorobowym.',
        'Przy umowie zlecenia złóż zleceniodawcy pisemny wniosek o objęcie dobrowolnym ubezpieczeniem chorobowym, a zleceniodawca zgłosi Cię w ZUS.',
        'Opłacaj składkę na ubezpieczenie chorobowe w terminie każdego miesiąca.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Numer PESEL', 'Data, od której chcesz podlegać ubezpieczeniu chorobowemu', 'Wniosek do zleceniodawcy przy umowie zlecenia'],
      ZASILKI,
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K04',
    tytul: 'Prawa pracownicy w ciąży',
    rodzaj: 'uprawnienie',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis: 'Matka pracuje na umowie o pracę, a dziecko się nie urodziło.',
    instytucjaIKanal: 'Pracodawca.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Przekaż pracodawcy zaświadczenie lekarskie o ciąży.',
        'Ustal z pracodawcą zwolnienia od pracy na badania lekarskie zalecone w ciąży.',
        'Zapytaj pracodawcę o pracę bez nadgodzin, bez pracy w nocy i bez prac wzbronionych kobietom w ciąży.',
        'W sprawach spornych skontaktuj się z Państwową Inspekcją Pracy.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Zaświadczenie lekarskie o ciąży'],
      PRACOWNIK,
    ),
  },
  {
    id: 'K05',
    tytul: 'Zgłoszenie dziecka do ubezpieczenia zdrowotnego',
    rodzaj: 'obowiazek',
    etap: 'pierwsze-tygodnie',
    rodzic: 'matka-a-bez-tytulu-drugi-rodzic',
    warunekOpis: 'Co najmniej jeden rodzic ma tytuł do ubezpieczenia.',
    instytucjaIKanal:
      'Przy jednoosobowej działalności gospodarczej rodzic zgłasza dziecko sam w eZUS, przy umowie o pracę i umowie zlecenia przekazuje dane dziecka pracodawcy albo zleceniodawcy.',
    kanaly: { jdg: ezus('/ezus'), 'umowa-o-prace': U_PRACODAWCY, 'umowa-zlecenia': U_PRACODAWCY },
    regulaTerminu: dni('data-porodu', 7),
    kosztSpoznienia: {
      typ: 'skutek',
      tekst: 'Dziecko nie pojawi się w danych ZUS wśród członków rodziny zgłoszonych do ubezpieczenia zdrowotnego.',
    },
    instrukcja: instrukcja(
      [
        'Sprawdź, czy dziecko ma już numer PESEL – nadaje go urząd stanu cywilnego po zgłoszeniu urodzenia.',
        'Przy jednoosobowej działalności gospodarczej wybierz przycisk Przejdź do eZUS i zaloguj się.',
        'W eZUS wypełnij zgłoszenie członka rodziny do ubezpieczenia zdrowotnego (ZUS ZCNA) i wyślij je.',
        'Przy umowie o pracę albo umowie zlecenia przekaż dane dziecka pracodawcy albo zleceniodawcy, który zgłosi dziecko w ZUS na formularzu ZUS ZCNA.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      [
        'Numer PESEL dziecka',
        'Imię, nazwisko i data urodzenia dziecka',
        'Stopień pokrewieństwa – dziecko własne',
        'Adres zamieszkania dziecka, jeśli jest inny niż Twój',
      ],
      [],
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K06',
    tytul: 'Zgłoszenie urodzenia dziecka',
    rodzaj: 'obowiazek',
    etap: 'pierwsze-tygodnie',
    rodzic: 'matka-albo-ojciec',
    warunekOpis: 'Dziecko się urodziło.',
    instytucjaIKanal: 'Urząd stanu cywilnego albo mObywatel.',
    kanaly: {
      kazda: {
        typ: 'zewnetrzny',
        kanal: 'mobywatel',
        adres: ADRESY_KANALOW.zgloszenieUrodzenia,
        adresSymulowany: '/kanal/mobywatel',
      },
    },
    regulaTerminu: dni('data-porodu', 21),
    kosztSpoznienia: { typ: 'skutek', tekst: 'Kierownik urzędu stanu cywilnego sam wybierze dziecku imię.' },
    instrukcja: instrukcja(
      [
        'Upewnij się, że szpital przekazał kartę urodzenia do urzędu stanu cywilnego – bez niej urząd nie przyjmie zgłoszenia.',
        'Wybierz przycisk Przejdź do zgłoszenia urodzenia i zaloguj się przez login.gov.pl.',
        'Wypełnij formularz i wpisz imię albo dwa imiona dziecka.',
        'Podpisz zgłoszenie profilem zaufanym, e-dowodem albo podpisem kwalifikowanym i odbierz potwierdzenie w skrzynce e-Doręczeń.',
        'Wróć do przewodnika i oznacz sprawę jako załatwioną.',
      ],
      [
        'Imię albo dwa imiona dziecka',
        'Twoje dane i dane drugiego rodzica',
        'Adres zameldowania dziecka',
        'Adres do e-Doręczeń',
        'Twój adres e-mail i numer telefonu',
        'Przez internet – bez dokumentów',
        'Osobiście – dowód osobisty albo paszport',
      ],
      [],
      ADRESY_KANALOW.zgloszenieUrodzenia,
    ),
  },
  {
    id: 'K07',
    tytul: 'Wniosek o urlop macierzyński i rodzicielski u pracodawcy',
    rodzaj: 'obowiazek',
    etap: 'urlopy-i-zasilek',
    rodzic: 'matka',
    warunekOpis: 'Matka pracuje na umowie o pracę.',
    instytucjaIKanal: 'Pracodawca.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: dni('data-porodu', 21),
    kosztSpoznienia: { typ: 'skutek', tekst: 'Utrata możliwości wyboru równych wypłat w wysokości 81,5% przez cały rok.' },
    instrukcja: instrukcja(
      [
        'Przygotuj skrócony odpis aktu urodzenia dziecka – dostaniesz go po zgłoszeniu urodzenia.',
        'Napisz wniosek o urlop macierzyński od dnia porodu i o urlop rodzicielski, który zacznie się zaraz po nim. Wzór wniosku zwykle ma dział kadr.',
        'Złóż wniosek razem z odpisem aktu urodzenia w dziale kadr najpóźniej w terminie podanym w planie.',
        'Poproś o potwierdzenie przyjęcia wniosku i zachowaj jego kopię.',
        'Wróć do przewodnika i oznacz sprawę jako załatwioną.',
      ],
      [
        'Data porodu',
        'Imię i nazwisko dziecka',
        'Okres urlopu rodzicielskiego, z którego chcesz skorzystać',
        'Informacja, czy drugi rodzic też weźmie część urlopu rodzicielskiego',
        'Skrócony odpis aktu urodzenia dziecka',
        'Wniosek o urlop macierzyński i rodzicielski',
      ],
      URLOPY_PRACOWNIKA,
    ),
  },
  {
    id: 'K08',
    tytul: 'Wniosek o zasiłek macierzyński',
    rodzaj: 'swiadczenie',
    etap: 'urlopy-i-zasilek',
    rodzic: 'matka',
    warunekOpis:
      'Matka wykonuje umowę zlecenia albo prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym albo jej umowa o pracę ustała w ciąży z powodu upadłości, likwidacji albo śmierci pracodawcy albo z naruszeniem przepisów potwierdzonym prawomocnym wyrokiem sądu.',
    instytucjaIKanal:
      'Kreator wniosku o zasiłek macierzyński w przewodniku, a po ustaniu umowy o pracę w ciąży ZUS, wniosek ZAM w eZUS z częścią o urodzeniu dziecka po ustaniu zatrudnienia.',
    kanaly: { 'umowa-zlecenia': KREATOR_ZAM, jdg: KREATOR_ZAM, 'umowa-o-prace': ezus('/ezus') },
    regulaTerminu: dni('data-porodu', 21),
    kosztSpoznienia: { typ: 'skutek', tekst: 'Utrata możliwości wyboru równych wypłat w wysokości 81,5% przez cały rok.' },
    instrukcja: instrukcja(
      [
        'Po porodzie podaj w przewodniku datę porodu – przeliczymy termin wniosku.',
        'Wybierz przycisk Wypełnij wniosek. Kreator otworzy się w przewodniku.',
        'Wybierz rodzaj urlopu, za który chcesz otrzymać zasiłek, i wariant wysokości zasiłku.',
        'Sprawdź swoje dane, dane dziecka i numer rachunku do wypłaty zasiłku.',
        'Potwierdź oświadczenia i wyślij wniosek do ZUS.',
      ],
      [
        'Data porodu i dane dziecka – po porodzie',
        'Okres urlopu, za który chcesz otrzymać zasiłek',
        'Numer rachunku do wypłaty zasiłku',
        'Wniosek o zasiłek macierzyński (ZAM) – przygotujesz go w kreatorze',
      ],
      URLOPY,
    ),
  },
  {
    id: 'K09',
    tytul: 'Urlop ojcowski',
    rodzaj: 'uprawnienie',
    etap: 'urlopy-i-zasilek',
    rodzic: 'drugi-rodzic',
    warunekOpis:
      'Drugi rodzic pracuje na umowie o pracę albo wykonuje umowę zlecenia lub prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym, także gdy przysposobił dziecko.',
    instytucjaIKanal:
      'Przy umowie o pracę pracodawca, wniosek najpóźniej 7 dni przed urlopem. W pozostałych przypadkach kreator wniosku o zasiłek macierzyński w przewodniku.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY, 'umowa-zlecenia': KREATOR_ZAM, jdg: KREATOR_ZAM },
    regulaTerminu: {
      typ: 'przesuniecie',
      kotwica: 'data-porodu',
      przesuniecie: 12,
      jednostka: 'miesiace',
      korekta: { przesuniecie: -14, jednostka: 'dni' },
    },
    kosztSpoznienia: { typ: 'skutek', tekst: 'Utrata 14 dni urlopu ojcowskiego płatnego w wysokości 100%.' },
    instrukcja: instrukcja(
      [
        'Wybierz termin urlopu: 14 dni jednorazowo albo w 2 częściach po co najmniej 7 dni, przed ukończeniem przez dziecko 12 miesięcy.',
        'Przy umowie o pracę złóż pracodawcy pisemny wniosek o urlop ojcowski najpóźniej 7 dni przed jego początkiem.',
        'Przy umowie zlecenia albo jednoosobowej działalności gospodarczej wybierz przycisk Wypełnij wniosek i złóż wniosek o zasiłek macierzyński za okres urlopu ojcowskiego.',
        'Dołącz skrócony odpis aktu urodzenia dziecka, gdy wniosek o tym informuje.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Okres urlopu ojcowskiego', 'Dane dziecka', 'Numer rachunku do wypłaty zasiłku', 'Skrócony odpis aktu urodzenia dziecka'],
      URLOPY_PRACOWNIKA,
    ),
  },
  {
    id: 'K10',
    tytul: 'Urlop rodzicielski drugiego rodzica',
    rodzaj: 'uprawnienie',
    etap: 'urlopy-i-zasilek',
    rodzic: 'drugi-rodzic',
    warunekOpis:
      'Drugi rodzic pracuje na umowie o pracę albo wykonuje umowę zlecenia lub prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym.',
    instytucjaIKanal:
      'Przy umowie o pracę pracodawca, wniosek najpóźniej 21 dni przed urlopem. W pozostałych przypadkach kreator wniosku o zasiłek macierzyński w przewodniku.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY, 'umowa-zlecenia': KREATOR_ZAM, jdg: KREATOR_ZAM },
    regulaTerminu: { typ: 'koniec-roku-urodzin', lata: 6 },
    kosztSpoznienia: {
      typ: 'skutek',
      tekst: 'Utrata 9 tygodni urlopu rodzicielskiego zarezerwowanych dla drugiego rodzica.',
    },
    instrukcja: instrukcja(
      [
        'Ustal z drugim rodzicem podział urlopu rodzicielskiego, w tym 9 tygodni zarezerwowanych dla Ciebie.',
        'Przy umowie o pracę złóż pracodawcy pisemny wniosek o urlop rodzicielski najpóźniej 21 dni przed jego początkiem.',
        'Przy umowie zlecenia albo jednoosobowej działalności gospodarczej wybierz przycisk Wypełnij wniosek i złóż wniosek o zasiłek macierzyński za okres urlopu rodzicielskiego.',
        'Wykorzystaj urlop do 31 grudnia roku, w którym dziecko kończy 6 lat.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Okres urlopu rodzicielskiego', 'Dane dziecka', 'Numer rachunku do wypłaty zasiłku', 'Skrócony odpis aktu urodzenia dziecka'],
      URLOPY_PRACOWNIKA,
    ),
  },
  {
    id: 'K11',
    tytul: 'Uzupełniający urlop macierzyński',
    rodzaj: 'uprawnienie',
    etap: 'urlopy-i-zasilek',
    rodzic: 'matka',
    warunekOpis:
      'Matka pracuje na umowie o pracę albo ma dobrowolne ubezpieczenie chorobowe, a dziecko urodziło się przed 37. tygodniem ciąży albo było hospitalizowane co najmniej 2 kolejne dni między 5. a 28. dniem życia.',
    instytucjaIKanal:
      'Przy umowie o pracę pracodawca, w pozostałych przypadkach kreator wniosku o zasiłek macierzyński w przewodniku.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY, 'umowa-zlecenia': KREATOR_ZAM, jdg: KREATOR_ZAM },
    regulaTerminu: { typ: 'plus-wymiar', kotwica: 'data-porodu', idWpisu: ID_WYMIAROW.urlopMacierzynski },
    kosztSpoznienia: { typ: 'skutek', tekst: 'Utrata do 15 albo do 8 tygodni urlopu płatnego w wysokości 100%.' },
    instrukcja: instrukcja(
      [
        'Poproś szpital o zaświadczenie o pobycie dziecka w szpitalu albo o dokument z tygodniem ciąży, w którym dziecko się urodziło.',
        'Przy umowie o pracę złóż pracodawcy wniosek o uzupełniający urlop macierzyński przed końcem urlopu macierzyńskiego.',
        'Przy dobrowolnym ubezpieczeniu chorobowym wybierz przycisk Wypełnij wniosek i złóż wniosek o zasiłek macierzyński za okres uzupełniającego urlopu macierzyńskiego.',
        'Dołącz zaświadczenie ze szpitala.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Tydzień ciąży w dniu porodu', 'Okres pobytu dziecka w szpitalu', 'Zaświadczenie ze szpitala'],
      URLOPY_PRACOWNIKA,
    ),
  },
  {
    id: 'K12',
    tytul: 'Świadczenie wychowawcze 800+',
    rodzaj: 'swiadczenie',
    etap: 'pieniadze-na-dziecko',
    rodzic: 'matka-albo-ojciec',
    warunekOpis: 'Dziecko się urodziło.',
    instytucjaIKanal: 'ZUS, wniosek o 800+ w eZUS.',
    kanaly: { kazda: ezus('/ezus/wniosek-800-plus') },
    regulaTerminu: miesiace('data-porodu', 3),
    kosztSpoznienia: {
      typ: 'kwota',
      idWpisuKwoty: ID_KWOT.swiadczenieWychowawcze,
      sposob: 'za-miesiace',
      minimum: 240000,
      naDziecko: true,
      tekst:
        '800 zł za każdy miesiąc od miesiąca urodzenia dziecka do miesiąca poprzedzającego miesiąc złożenia wniosku, czyli co najmniej 2400 zł w dniu następującym po terminie.',
    },
    instrukcja: instrukcja(
      [
        'Sprawdź, czy dziecko ma już numer PESEL – bez niego nie złożysz wniosku.',
        'Wybierz przycisk Złóż wniosek o 800+ w eZUS i zaloguj się.',
        'Wpisz dane dziecka, sprawdź swoje dane i podaj numer rachunku do wypłaty świadczenia.',
        'Wyślij wniosek. Informację o przyznaniu świadczenia ZUS przekaże na Twoje konto w eZUS.',
        'Wróć do przewodnika i oznacz sprawę jako złożoną.',
      ],
      [
        'Numer PESEL dziecka',
        'Dane drugiego rodzica',
        'Adres zamieszkania',
        'Numer rachunku do wypłaty świadczenia',
        'Wniosek w eZUS wskaże, czy musisz coś dołączyć',
      ],
      [],
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K13',
    tytul: 'Wniosek o 800+ na kolejny okres świadczeniowy',
    rodzaj: 'swiadczenie',
    etap: 'pieniadze-na-dziecko',
    rodzic: 'matka-albo-ojciec',
    warunekOpis: 'Sprawa Świadczenie wychowawcze 800+ jest załatwiona, a dziecko nie ukończyło 18 lat.',
    instytucjaIKanal: 'ZUS, wniosek o 800+ na kolejny okres świadczeniowy w eZUS.',
    kanaly: { kazda: ezus('/ezus/wniosek-800-plus') },
    regulaTerminu: { typ: 'coroczny', dzien: '06-30', poczatekSkladania: '02-01', zalecany: '04-30' },
    kosztSpoznienia: {
      typ: 'kwota',
      idWpisuKwoty: ID_KWOT.swiadczenieWychowawcze,
      sposob: 'za-miesiace',
      naDziecko: true,
      tekst: '800 zł za każdy miesiąc od czerwca do miesiąca poprzedzającego miesiąc złożenia wniosku.',
    },
    instrukcja: instrukcja(
      [
        'Od 1 lutego wybierz przycisk Złóż wniosek o 800+ w eZUS i zaloguj się.',
        'Wybierz wniosek o świadczenie wychowawcze na kolejny okres świadczeniowy.',
        'Sprawdź dane dziecka, swoje dane i numer rachunku do wypłaty świadczenia.',
        'Wyślij wniosek najpóźniej 30 kwietnia, żeby wypłata od 1 czerwca była bez przerwy.',
        'Wróć do przewodnika i oznacz sprawę jako złożoną.',
      ],
      ['Numer PESEL dziecka', 'Dane drugiego rodzica', 'Numer rachunku do wypłaty świadczenia'],
      [],
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K14',
    tytul: 'Becikowe',
    rodzaj: 'swiadczenie',
    etap: 'pieniadze-na-dziecko',
    rodzic: 'matka-albo-ojciec',
    warunekOpis:
      'Dziecko się urodziło, dochód na osobę nie przekracza progu becikowego albo jest nieznany, a pierwsza wizyta u lekarza albo położnej odbyła się najpóźniej w ostatnim dniu 10. tygodnia ciąży.',
    instytucjaIKanal:
      'Gmina albo MOPS, wniosek osobiście albo przez Emp@tię, z zaświadczeniem lekarza albo położnej o opiece medycznej od 10. tygodnia ciąży do porodu.',
    kanaly: { kazda: EMPATIA },
    regulaTerminu: miesiace('data-porodu', 12),
    kosztSpoznienia: {
      typ: 'kwota',
      idWpisuKwoty: ID_KWOT.becikowe,
      sposob: 'jednorazowo',
      naDziecko: true,
      tekst: '1000 zł za każde dziecko.',
    },
    instrukcja: instrukcja(
      [
        'Poproś lekarza albo położną o zaświadczenie o opiece medycznej od 10. tygodnia ciąży do porodu.',
        'Wybierz przycisk Przejdź do Emp@tii i zaloguj się profilem zaufanym albo podpisem kwalifikowanym.',
        'Wybierz wniosek o ustalenie prawa do jednorazowej zapomogi z tytułu urodzenia się dziecka i wskaż urząd swojej gminy albo MOPS.',
        'Wypełnij wniosek i dołącz skan albo zdjęcie zaświadczenia od lekarza albo położnej.',
        'Podpisz i wyślij wniosek, zapisz potwierdzenie wysłania, a potem wróć do przewodnika i oznacz sprawę jako złożoną.',
      ],
      [
        'Twoje dane i adres zamieszkania',
        'Imię, nazwisko, data urodzenia i numer PESEL dziecka',
        'Dane członków rodziny',
        'Numer rachunku do wypłaty',
        'Zaświadczenie lekarza albo położnej o opiece medycznej od 10. tygodnia ciąży do porodu',
        'Dokumenty o dochodach – tylko jeśli dochód rodziny się zmienił',
      ],
      [],
      ADRESY_KANALOW.empatia,
    ),
  },
  {
    id: 'K15',
    tytul: 'Dodatek z tytułu urodzenia dziecka',
    rodzaj: 'swiadczenie',
    etap: 'pieniadze-na-dziecko',
    rodzic: 'matka-albo-ojciec',
    warunekOpis:
      'Dziecko się urodziło, dochód na osobę nie przekracza progu zasiłku rodzinnego albo jest nieznany, a pierwsza wizyta u lekarza albo położnej odbyła się najpóźniej w ostatnim dniu 10. tygodnia ciąży.',
    instytucjaIKanal: 'Gmina albo MOPS, wniosek razem z wnioskiem o zasiłek rodzinny, osobiście albo przez Emp@tię.',
    kanaly: { kazda: EMPATIA },
    regulaTerminu: { typ: 'dzien-przed-urodzinami', lata: 1 },
    kosztSpoznienia: {
      typ: 'kwota',
      idWpisuKwoty: ID_KWOT.dodatekZTytuluUrodzenia,
      sposob: 'jednorazowo',
      naDziecko: true,
      tekst: '1000 zł za każde dziecko.',
    },
    instrukcja: instrukcja(
      [
        'Poproś lekarza albo położną o zaświadczenie o opiece medycznej od 10. tygodnia ciąży do porodu.',
        'Wybierz przycisk Przejdź do Emp@tii i zaloguj się profilem zaufanym albo podpisem kwalifikowanym.',
        'Wybierz wniosek o zasiłek rodzinny z dodatkiem z tytułu urodzenia dziecka i wskaż urząd swojej gminy albo MOPS.',
        'Wypełnij wniosek, dołącz zaświadczenie od lekarza albo położnej i dokumenty o dochodach rodziny.',
        'Podpisz i wyślij wniosek, a potem wróć do przewodnika i oznacz sprawę jako złożoną.',
      ],
      [
        'Twoje dane i adres zamieszkania',
        'Imię, nazwisko, data urodzenia i numer PESEL dziecka',
        'Dane członków rodziny i ich dochody',
        'Numer rachunku do wypłaty',
        'Zaświadczenie lekarza albo położnej o opiece medycznej od 10. tygodnia ciąży do porodu',
      ],
      [],
      ADRESY_KANALOW.empatia,
    ),
  },
  {
    id: 'K16',
    tytul: 'Świadczenie rodzicielskie',
    rodzaj: 'swiadczenie',
    etap: 'pieniadze-na-dziecko',
    rodzic: 'matka-albo-ojciec',
    warunekOpis:
      'Dziecko się urodziło, matka nie ma tytułu do ubezpieczenia albo wykonuje umowę zlecenia lub prowadzi jednoosobową działalność gospodarczą bez dobrowolnego ubezpieczenia chorobowego, a po ustaniu zatrudnienia w ciąży nie przysługuje jej zasiłek macierzyński.',
    instytucjaIKanal: 'Gmina albo MOPS, wniosek osobiście albo przez Emp@tię.',
    kanaly: { kazda: EMPATIA },
    regulaTerminu: miesiace('data-porodu', 3),
    kosztSpoznienia: {
      typ: 'kwota',
      idWpisuKwoty: ID_KWOT.swiadczenieRodzicielskie,
      sposob: 'za-miesiace',
      minimum: 300000,
      naDziecko: false,
      tekst:
        '1000 zł za każdy miesiąc od miesiąca urodzenia dziecka do miesiąca poprzedzającego miesiąc złożenia wniosku, czyli co najmniej 3000 zł w dniu następującym po terminie.',
    },
    instrukcja: instrukcja(
      [
        'Wybierz przycisk Przejdź do Emp@tii i zaloguj się profilem zaufanym albo podpisem kwalifikowanym.',
        'Wybierz wniosek o świadczenie rodzicielskie i wskaż urząd swojej gminy albo MOPS.',
        'Wpisz dane dziecka, swoje dane i numer rachunku do wypłaty świadczenia.',
        'Podpisz i wyślij wniosek najpóźniej w terminie podanym w planie, żeby świadczenie przysługiwało od miesiąca urodzenia dziecka.',
        'Wróć do przewodnika i oznacz sprawę jako złożoną.',
      ],
      ['Imię, nazwisko, data urodzenia i numer PESEL dziecka', 'Twoje dane i adres zamieszkania', 'Numer rachunku do wypłaty'],
      [],
      ADRESY_KANALOW.empatia,
    ),
  },
  {
    id: 'K17',
    tytul: 'Świadczenie „Za życiem”',
    rodzaj: 'swiadczenie',
    etap: 'pieniadze-na-dziecko',
    rodzic: 'matka-albo-ojciec',
    warunekOpis:
      'Profil wskazuje, że u dziecka stwierdzono ciężkie i nieodwracalne upośledzenie albo nieuleczalną chorobę zagrażającą życiu, a pierwsza wizyta u lekarza albo położnej odbyła się najpóźniej w ostatnim dniu 10. tygodnia ciąży.',
    instytucjaIKanal: 'Gmina albo MOPS, wniosek osobiście albo przez Emp@tię, z zaświadczeniem lekarza.',
    kanaly: { kazda: EMPATIA },
    regulaTerminu: miesiace('data-porodu', 12),
    kosztSpoznienia: {
      typ: 'kwota',
      idWpisuKwoty: ID_KWOT.swiadczenieZaZyciem,
      sposob: 'jednorazowo',
      naDziecko: false,
      tekst: '4000 zł.',
    },
    instrukcja: instrukcja(
      [
        'Poproś lekarza o zaświadczenie o ciężkim i nieodwracalnym upośledzeniu albo nieuleczalnej chorobie zagrażającej życiu dziecka.',
        'Poproś lekarza albo położną o zaświadczenie o opiece medycznej od 10. tygodnia ciąży do porodu.',
        'Wybierz przycisk Przejdź do Emp@tii i zaloguj się profilem zaufanym albo podpisem kwalifikowanym.',
        'Wybierz wniosek o jednorazowe świadczenie „Za życiem”, dołącz oba zaświadczenia i wyślij wniosek do gminy albo MOPS.',
        'Wróć do przewodnika i oznacz sprawę jako złożoną.',
      ],
      [
        'Imię, nazwisko, data urodzenia i numer PESEL dziecka',
        'Numer rachunku do wypłaty',
        'Zaświadczenie lekarza o stanie zdrowia dziecka',
        'Zaświadczenie lekarza albo położnej o opiece medycznej od 10. tygodnia ciąży do porodu',
      ],
      [],
      ADRESY_KANALOW.empatia,
    ),
  },
  {
    id: 'K18',
    tytul: 'Świadczenie z programu Aktywny Rodzic',
    rodzaj: 'swiadczenie',
    etap: 'pieniadze-na-dziecko',
    rodzic: 'matka-albo-ojciec',
    warunekOpis: 'Dziecko się urodziło.',
    instytucjaIKanal: 'ZUS, wniosek o świadczenie z programu Aktywny Rodzic w eZUS.',
    kanaly: { kazda: ezus('/ezus/wniosek-aktywny-rodzic') },
    regulaTerminu: { typ: 'koniec-miesiaca-wieku', miesiace: 12 },
    kosztSpoznienia: {
      typ: 'kwota',
      idWpisuKwoty: ID_KWOT.aktywnyRodzicWDomu,
      sposob: 'za-miesiace',
      naDziecko: false,
      tekst:
        'Co najmniej 500 zł, czyli kwota świadczenia aktywnie w domu, za każdy miesiąc od miesiąca, w którym dziecko kończy 12 miesięcy, do miesiąca poprzedzającego miesiąc złożenia wniosku.',
    },
    instrukcja: instrukcja(
      [
        'Wybierz jedno ze świadczeń: aktywni rodzice w pracy, aktywnie w żłobku albo aktywnie w domu.',
        'Od pierwszego dnia miesiąca, w którym dziecko kończy 12 miesięcy, wybierz przycisk Złóż wniosek w eZUS i zaloguj się.',
        'Wpisz dane dziecka, swoje dane i numer rachunku do wypłaty świadczenia.',
        'Wyślij wniosek najpóźniej w ostatnim dniu miesiąca, w którym dziecko kończy 12 miesięcy.',
        'Wróć do przewodnika i oznacz sprawę jako złożoną.',
      ],
      [
        'Numer PESEL dziecka',
        'Dane drugiego rodzica',
        'Numer rachunku do wypłaty świadczenia',
        'Dane żłobka, klubu dziecięcego albo dziennego opiekuna przy świadczeniu aktywnie w żłobku',
      ],
      [],
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K19',
    tytul: 'Składka zdrowotna w czasie zasiłku macierzyńskiego',
    rodzaj: 'obowiazek',
    etap: 'urlopy-i-zasilek',
    rodzic: 'matka',
    warunekOpis: 'Matka prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym.',
    instytucjaIKanal: 'ZUS, eZUS.',
    kanaly: { jdg: ezus('/ezus') },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Wybierz przycisk Przejdź do eZUS i zaloguj się.',
        'Sprawdź, od kiedy ZUS wypłaca Ci zasiłek macierzyński.',
        'Za miesiące pobierania zasiłku macierzyńskiego rozliczaj w eZUS składkę na ubezpieczenie zdrowotne zgodnie z formą opodatkowania działalności.',
        'Opłacaj składkę zdrowotną w terminie każdego miesiąca.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Okres pobierania zasiłku macierzyńskiego', 'Forma opodatkowania działalności'],
      ZASILKI,
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K20',
    tytul: 'Przerwy na karmienie',
    rodzaj: 'uprawnienie',
    etap: 'powrot-do-pracy',
    rodzic: 'matka',
    warunekOpis: 'Matka pracuje na umowie o pracę.',
    instytucjaIKanal: 'Pracodawca.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Przed powrotem do pracy poinformuj pracodawcę, że karmisz dziecko piersią.',
        'Złóż pracodawcy pisemny wniosek o przerwy na karmienie.',
        'Ustal z pracodawcą godziny przerw w dniu pracy.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Wniosek o przerwy na karmienie'],
      PRACOWNIK,
    ),
  },
  {
    id: 'K21',
    tytul: 'Dwa dni opieki nad dzieckiem w roku',
    rodzaj: 'uprawnienie',
    etap: 'powrot-do-pracy',
    rodzic: 'kazdy-rodzic-na-umowie-o-prace',
    warunekOpis: 'Rodzic pracuje na umowie o pracę.',
    instytucjaIKanal: 'Pracodawca.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: { typ: 'coroczny', dzien: '12-31', doRokuUrodzin: 14 },
    kosztSpoznienia: {
      typ: 'skutek',
      tekst: 'Niewykorzystane 2 dni albo 16 godzin płatnego zwolnienia przepadają.',
    },
    instrukcja: instrukcja(
      [
        'Złóż pracodawcy w pierwszym wniosku w roku oświadczenie, czy wykorzystasz zwolnienie w dniach, czy w godzinach.',
        'Złóż pracodawcy wniosek o zwolnienie na dzień albo godziny opieki nad dzieckiem.',
        'Wykorzystaj 2 dni albo 16 godzin zwolnienia do 31 grudnia.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Wniosek o zwolnienie od pracy na opiekę nad dzieckiem', 'Oświadczenie o sposobie wykorzystania zwolnienia'],
      PRACOWNIK,
    ),
  },
  {
    id: 'K22',
    tytul: 'Zasiłek opiekuńczy na dziecko',
    rodzaj: 'swiadczenie',
    etap: 'powrot-do-pracy',
    rodzic: 'matka-albo-ojciec',
    warunekOpis: 'Rodzic pracuje na umowie o pracę albo ma dobrowolne ubezpieczenie chorobowe.',
    instytucjaIKanal: 'Pracodawca albo ZUS, wniosek Z-15 w eZUS.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY, 'umowa-zlecenia': ezus('/ezus'), jdg: ezus('/ezus') },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Gdy dziecko zachoruje, poproś lekarza o zaświadczenie lekarskie e-ZLA na opiekę nad dzieckiem.',
        'Zaświadczenie e-ZLA trafi do ZUS i do płatnika składek bez Twojego udziału.',
        'Wybierz przycisk Przejdź do eZUS, zaloguj się i wypełnij wniosek o zasiłek opiekuńczy (Z-15).',
        'Przy umowie o pracę przekaż wniosek Z-15 pracodawcy, a w pozostałych przypadkach wyślij go do ZUS.',
        'Oznacz sprawę w przewodniku jako złożoną.',
      ],
      ['Zaświadczenie lekarskie e-ZLA na opiekę nad dzieckiem', 'Wniosek o zasiłek opiekuńczy (Z-15)', 'Numer rachunku do wypłaty zasiłku'],
      ZASILKI,
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K23',
    tytul: 'Urlop wychowawczy',
    rodzaj: 'uprawnienie',
    etap: 'powrot-do-pracy',
    rodzic: 'kazdy-rodzic-na-umowie-o-prace',
    warunekOpis: 'Rodzic pracuje na umowie o pracę.',
    instytucjaIKanal: 'Pracodawca.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Ustal z drugim rodzicem, kto i w jakim okresie skorzysta z urlopu wychowawczego.',
        'Złóż pracodawcy pisemny wniosek o urlop wychowawczy najpóźniej 21 dni przed jego początkiem.',
        'Podaj we wniosku okres urlopu i dołącz oświadczenie drugiego rodzica o korzystaniu z urlopu wychowawczego.',
        'Poproś o potwierdzenie przyjęcia wniosku i zachowaj jego kopię.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Okres urlopu wychowawczego', 'Wniosek o urlop wychowawczy', 'Oświadczenie drugiego rodzica'],
      URLOPY_PRACOWNIKA,
    ),
  },
  {
    id: 'K24',
    tytul: 'Zasiłek chorobowy w ciąży',
    rodzaj: 'swiadczenie',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis:
      'Matka podlega ubezpieczeniu chorobowemu, czyli pracuje na umowie o pracę albo wykonuje umowę zlecenia lub prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym, albo ubezpieczenie chorobowe matki ustało w ciąży, a dziecko się nie urodziło.',
    instytucjaIKanal:
      'Zaświadczenie lekarskie e-ZLA trafia do ZUS i do płatnika bez udziału matki. Przy umowie o pracę pracodawca, który wypłaca zasiłek albo przekazuje do ZUS zaświadczenie Z-3, a na dalszy okres ZAS-12. Przy umowie zlecenia płatnik składek albo ZUS z zaświadczeniem Z-3a. Przy jednoosobowej działalności gospodarczej ZUS, wniosek ZAS-53 w kreatorze przewodnika, a po ustaniu ubezpieczenia ZUS, wniosek ZAS-53 z oświadczeniem Z-10 w kreatorze przewodnika.',
    kanaly: {
      'umowa-o-prace': U_PRACODAWCY,
      'umowa-zlecenia': U_PRACODAWCY,
      jdg: KREATOR_ZAS53,
      'brak-tytulu': KREATOR_ZAS53,
    },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Gdy lekarz wystawi zaświadczenie lekarskie e-ZLA, sprawdź je w przewodniku na liście zaświadczeń.',
        'Przy umowie o pracę albo umowie zlecenia poproś płatnika składek o przekazanie do ZUS zaświadczenia płatnika (Z-3 albo Z-3a), gdy zasiłek wypłaca ZUS.',
        'Przy jednoosobowej działalności gospodarczej albo po ustaniu ubezpieczenia wybierz przycisk Wypełnij wniosek ZAS-53 i wskaż zaświadczenie, którego dotyczy wniosek.',
        'Sprawdź swoje dane, dane płatnika składek i numer rachunku do wypłaty zasiłku.',
        'Oznacz sprawę w przewodniku jako złożoną.',
      ],
      [
        'Okres niezdolności do pracy z zaświadczenia e-ZLA',
        'Numer rachunku do wypłaty zasiłku',
        'Zaświadczenie lekarskie e-ZLA – lekarz wysyła je sam',
        'Zaświadczenie płatnika składek (Z-3 albo Z-3a) – wystawia pracodawca albo zleceniodawca',
        'Wniosek o zasiłek chorobowy (ZAS-53) – przygotujesz go w kreatorze',
      ],
      ZASILKI,
    ),
  },
  {
    id: 'K25',
    tytul: 'Świadczenie rehabilitacyjne w ciąży',
    rodzaj: 'swiadczenie',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis:
      'Matka podlega ubezpieczeniu chorobowemu, okres zasiłkowy zasiłku chorobowego w ciąży wyliczony z zaświadczeń lekarskich e-ZLA kończy się przed przewidywanym terminem porodu, a dziecko się nie urodziło.',
    instytucjaIKanal:
      'ZUS, wniosek ZNp-7 z zaświadczeniem lekarza prowadzącego o stanie zdrowia OL-9, a przy umowie o pracę i umowie zlecenia także z wywiadem zawodowym OL-10. O świadczeniu orzeka lekarz orzecznik ZUS, a świadczenie wypłaca płatnik składek uprawniony do wypłaty zasiłków albo ZUS.',
    kanaly: { kazda: ezus('/ezus') },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Poproś lekarza prowadzącego o zaświadczenie o stanie zdrowia (OL-9).',
        'Przy umowie o pracę albo umowie zlecenia poproś płatnika składek o wywiad zawodowy (OL-10).',
        'Wybierz przycisk Przejdź do eZUS, zaloguj się i wypełnij wniosek o świadczenie rehabilitacyjne (ZNp-7).',
        'Dołącz zaświadczenie OL-9 i wywiad zawodowy OL-10, jeśli go potrzebujesz, i wyślij wniosek do ZUS przed końcem okresu zasiłkowego.',
        'Oznacz sprawę w przewodniku jako złożoną.',
      ],
      [
        'Wniosek o świadczenie rehabilitacyjne (ZNp-7)',
        'Zaświadczenie lekarza prowadzącego o stanie zdrowia (OL-9)',
        'Wywiad zawodowy (OL-10) przy umowie o pracę i umowie zlecenia',
        'Numer rachunku do wypłaty świadczenia',
      ],
      ZASILKI,
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K26',
    tytul: 'Zasiłek w wysokości zasiłku macierzyńskiego po utracie pracy w ciąży',
    rodzaj: 'swiadczenie',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis:
      'Umowa o pracę matki została rozwiązana w ciąży z powodu upadłości albo likwidacji pracodawcy albo wygasła z powodu śmierci pracodawcy, matce nie zapewniono innego zatrudnienia, a dziecko się nie urodziło. Rozwiązanie umowy w ciąży z naruszeniem przepisów potwierdzone prawomocnym wyrokiem sądu daje matce zasiłek macierzyński od dnia porodu na wniosek ZAM z tym wyrokiem.',
    instytucjaIKanal:
      'ZUS, wniosek ZAS-55 z zaświadczeniem lekarskim o ciąży w okresie zatrudnienia, świadectwem pracy, oświadczeniem o braku innego zatrudnienia i zaświadczeniem płatnika Z-3.',
    kanaly: { 'umowa-o-prace': ezus('/ezus') },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Poproś lekarza o zaświadczenie, że ciąża trwała w okresie zatrudnienia.',
        'Przygotuj świadectwo pracy i zaświadczenie płatnika składek (Z-3).',
        'Wybierz przycisk Przejdź do eZUS, zaloguj się i wypełnij wniosek ZAS-55.',
        'Dołącz dokumenty i oświadczenie o braku innego zatrudnienia, a potem wyślij wniosek do ZUS.',
        'Oznacz sprawę w przewodniku jako złożoną.',
      ],
      [
        'Wniosek ZAS-55',
        'Zaświadczenie lekarskie o ciąży w okresie zatrudnienia',
        'Świadectwo pracy',
        'Oświadczenie o braku innego zatrudnienia',
        'Zaświadczenie płatnika składek (Z-3)',
        'Numer rachunku do wypłaty zasiłku',
      ],
      ZASILKI,
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K27',
    tytul: 'Brak prawa do zasiłków z ubezpieczenia chorobowego',
    rodzaj: 'informacja',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis:
      'Matka nie podlega ubezpieczeniu chorobowemu, czyli nie ma tytułu do ubezpieczenia albo wykonuje umowę zlecenia lub prowadzi jednoosobową działalność gospodarczą bez dobrowolnego ubezpieczenia chorobowego, nie przysługuje jej zasiłek w wysokości zasiłku macierzyńskiego, a dziecko się nie urodziło.',
    instytucjaIKanal: 'Informacja w przewodniku z przejściem do sprawy Świadczenie rodzicielskie.',
    kanaly: { kazda: INFORMACJA },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: {
      typ: 'skutek',
      tekst: 'Brak zasiłku chorobowego w ciąży i zasiłku macierzyńskiego po porodzie, a rodzinie przysługuje świadczenie rodzicielskie.',
    },
    instrukcja: instrukcja(
      [
        'Zasiłek chorobowy w ciąży i zasiłek macierzyński z ZUS przysługują osobie objętej ubezpieczeniem chorobowym.',
        'Po porodzie rodzinie przysługuje świadczenie rodzicielskie, które przyznaje gmina albo MOPS. Sprawę znajdziesz w planie w etapie Pieniądze na dziecko.',
        'Przy umowie zlecenia albo jednoosobowej działalności gospodarczej zobacz w planie sprawę Zgłoszenie do dobrowolnego ubezpieczenia chorobowego.',
        'Oznacz sprawę jako załatwioną, gdy przeczytasz informację.',
      ],
      [],
      ZASILKI,
    ),
  },
  {
    id: 'K28',
    tytul: 'Umowa albo działalność podjęta w ciąży',
    rodzaj: 'informacja',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis: 'Profil wskazuje rozpoczęcie zatrudnienia albo działalności w ciąży, a dziecko się nie urodziło.',
    instytucjaIKanal: 'Informacja w przewodniku.',
    kanaly: { kazda: INFORMACJA },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: {
      typ: 'skutek',
      tekst:
        'ZUS może uznać umowę zawartą albo działalność podjętą wyłącznie w celu uzyskania zasiłku za pozorną i wydać decyzję o niepodleganiu ubezpieczeniom, a wtedy zasiłki nie przysługują.',
    },
    instrukcja: instrukcja(
      [
        'Zachowaj dokumenty, które potwierdzają faktyczne wykonywanie pracy albo prowadzenie działalności, na przykład umowy, faktury i korespondencję.',
        'Ustal wynagrodzenie albo podstawę składek w wysokości odpowiadającej wykonywanej pracy.',
        'Na wezwanie ZUS przekaż dokumenty, o które ZUS prosi.',
        'Oznacz sprawę jako załatwioną, gdy przeczytasz informację.',
      ],
      ['Umowa o pracę, umowa zlecenia albo wpis działalności do CEIDG', 'Dokumenty potwierdzające wykonywanie pracy albo działalności'],
      ZASILKI,
    ),
  },
  {
    id: 'K29',
    tytul: 'Ubezpieczenie chorobowe w dniu porodu',
    rodzaj: 'informacja',
    etap: 'ciaza',
    rodzic: 'matka',
    warunekOpis:
      'Profil wskazuje ustanie zatrudnienia albo działalności przed przewidywanym terminem porodu, ustanie nie wynika z upadłości, likwidacji ani śmierci pracodawcy ani z rozwiązania umowy z naruszeniem przepisów potwierdzonego prawomocnym wyrokiem sądu, umowa nie przedłuża się do dnia porodu, matka nie ma w dniu przewidywanego terminu porodu innego tytułu z ubezpieczeniem chorobowym, a dziecko się nie urodziło.',
    instytucjaIKanal:
      'Przy umowie zlecenia nowa umowa z dobrowolnym ubezpieczeniem chorobowym u zleceniodawcy, przy jednoosobowej działalności gospodarczej zgłoszenie do dobrowolnego ubezpieczenia chorobowego w eZUS, przy umowie o pracę nowy tytuł do ubezpieczenia.',
    kanaly: { jdg: ezus('/ezus'), 'umowa-zlecenia': U_PRACODAWCY, 'umowa-o-prace': INFORMACJA },
    regulaTerminu: dni('przewidywany-termin-porodu', -1),
    kosztSpoznienia: {
      typ: 'skutek',
      tekst: 'Brak zasiłku macierzyńskiego, a rodzinie przysługuje wtedy świadczenie rodzicielskie.',
    },
    instrukcja: instrukcja(
      [
        'Sprawdź w przewodniku datę ustania zatrudnienia albo działalności i przewidywany termin porodu.',
        'Przy umowie zlecenia zawrzyj nową umowę i złóż zleceniodawcy wniosek o objęcie dobrowolnym ubezpieczeniem chorobowym.',
        'Przy jednoosobowej działalności gospodarczej wybierz przycisk Przejdź do eZUS i zgłoś się do dobrowolnego ubezpieczenia chorobowego.',
        'Przy umowie o pracę uzyskaj nowy tytuł do ubezpieczenia przed dniem poprzedzającym przewidywany termin porodu.',
        'Oznacz sprawę jako załatwioną, gdy w dniu porodu będziesz mieć ubezpieczenie chorobowe.',
      ],
      ['Data ustania zatrudnienia albo działalności', 'Nowa umowa albo zgłoszenie do ubezpieczenia chorobowego'],
      ZASILKI,
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K30',
    tytul: 'Szczególna ochrona pracownika w ciąży i w czasie urlopów',
    rodzaj: 'uprawnienie',
    etap: 'ciaza',
    rodzic: 'kazdy-rodzic-na-umowie-o-prace',
    warunekOpis: 'Rodzic pracuje na umowie o pracę.',
    instytucjaIKanal: 'Pracodawca, a w sprawach spornych Państwowa Inspekcja Pracy i sąd pracy.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Przekaż pracodawcy zaświadczenie lekarskie o ciąży albo wniosek o urlop związany z rodzicielstwem.',
        'Zachowaj kopię zaświadczenia i wniosku z datą przyjęcia przez pracodawcę.',
        'Gdy pracodawca wypowie albo rozwiąże umowę w okresie ochrony, skontaktuj się z Państwową Inspekcją Pracy.',
        'Złóż odwołanie do sądu pracy w terminie podanym w pouczeniu pisma pracodawcy.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Zaświadczenie lekarskie o ciąży', 'Kopia wniosku o urlop z datą przyjęcia'],
      PRACOWNIK,
    ),
  },
  {
    id: 'K31',
    tytul: 'Wniosek o urlop na warunkach urlopu macierzyńskiego u pracodawcy',
    rodzaj: 'obowiazek',
    etap: 'urlopy-i-zasilek',
    rodzic: 'rodzic-przyjmujacy',
    warunekOpis:
      'Rodzic przyjął dziecko na wychowanie i wystąpił do sądu o przysposobienie albo przyjął je jako rodzina zastępcza niezawodowa, dziecko nie ukończyło wieku uprawniającego do urlopu zgodnie ze słownikiem wymiarów i okresów, a rodzic pracuje na umowie o pracę.',
    instytucjaIKanal:
      'Pracodawca, wniosek w ciągu 7 dni od przyjęcia dziecka z oświadczeniem o dacie przyjęcia i dokumentem sądu albo umową ze starostą.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: {
      typ: 'dwa-terminy',
      pierwszy: dni('data-przyjecia', 7),
      drugi: dni('data-przyjecia', 21),
      kluczEtykietyDrugiego: 'terminWariantu815',
    },
    kosztSpoznienia: { typ: 'skutek', tekst: 'Utrata możliwości wyboru równych wypłat w wysokości 81,5%.' },
    instrukcja: instrukcja(
      [
        'Przygotuj dokument sądu o wszczęciu postępowania o przysposobienie albo umowę ze starostą o pełnieniu funkcji rodziny zastępczej.',
        'Napisz wniosek o urlop na warunkach urlopu macierzyńskiego z oświadczeniem o dacie przyjęcia dziecka.',
        'Złóż wniosek pracodawcy w ciągu 7 dni od przyjęcia dziecka.',
        'Złóż wniosek o urlop rodzicielski w ciągu 21 dni od przyjęcia dziecka, żeby wybrać zasiłek w wysokości 81,5% za cały okres.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      [
        'Data przyjęcia dziecka na wychowanie',
        'Oświadczenie o dacie przyjęcia dziecka',
        'Dokument sądu o przysposobieniu albo umowa ze starostą',
        'Wniosek o urlop na warunkach urlopu macierzyńskiego',
      ],
      URLOPY_PRACOWNIKA,
    ),
  },
  {
    id: 'K32',
    tytul: 'Wniosek o zasiłek macierzyński po przyjęciu dziecka',
    rodzaj: 'swiadczenie',
    etap: 'urlopy-i-zasilek',
    rodzic: 'rodzic-przyjmujacy',
    warunekOpis:
      'Rodzic przyjął dziecko na wychowanie i wystąpił do sądu o przysposobienie albo przyjął je jako rodzina zastępcza niezawodowa, dziecko nie ukończyło wieku uprawniającego do urlopu zgodnie ze słownikiem wymiarów i okresów, a rodzic wykonuje umowę zlecenia albo prowadzi jednoosobową działalność gospodarczą z dobrowolnym ubezpieczeniem chorobowym.',
    instytucjaIKanal: 'Kreator wniosku o zasiłek macierzyński w przewodniku.',
    kanaly: { 'umowa-zlecenia': KREATOR_ZAM, jdg: KREATOR_ZAM },
    regulaTerminu: dni('data-przyjecia', 21),
    kosztSpoznienia: { typ: 'skutek', tekst: 'Utrata możliwości wyboru równych wypłat w wysokości 81,5%.' },
    instrukcja: instrukcja(
      [
        'Przygotuj dokument sądu o wszczęciu postępowania o przysposobienie albo umowę ze starostą o pełnieniu funkcji rodziny zastępczej.',
        'Wybierz przycisk Wypełnij wniosek. Kreator otworzy się w przewodniku.',
        'Wybierz rodzaj urlopu, za który chcesz otrzymać zasiłek, i wariant wysokości zasiłku.',
        'Sprawdź swoje dane, dane dziecka, datę przyjęcia i numer rachunku do wypłaty zasiłku.',
        'Dołącz dokumenty przyjęcia, potwierdź oświadczenia i wyślij wniosek do ZUS w ciągu 21 dni od przyjęcia dziecka.',
      ],
      [
        'Data przyjęcia dziecka na wychowanie',
        'Dane dziecka',
        'Numer rachunku do wypłaty zasiłku',
        'Dokument sądu o przysposobieniu albo umowa ze starostą',
        'Wniosek o zasiłek macierzyński (ZAM) – przygotujesz go w kreatorze',
      ],
      URLOPY,
    ),
  },
  {
    id: 'K33',
    tytul: 'Rodzina zastępcza zawodowa a zasiłek macierzyński',
    rodzaj: 'informacja',
    etap: 'urlopy-i-zasilek',
    rodzic: 'rodzic-przyjmujacy',
    warunekOpis: 'Rodzic przyjął dziecko jako rodzina zastępcza zawodowa.',
    instytucjaIKanal: 'Informacja w przewodniku.',
    kanaly: { kazda: INFORMACJA },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: {
      typ: 'skutek',
      tekst:
        'Rodzinie zastępczej zawodowej nie przysługuje urlop na warunkach urlopu macierzyńskiego ani zasiłek macierzyński za ten okres.',
    },
    instrukcja: instrukcja(
      [
        'Rodzina zastępcza zawodowa pełni swoją funkcję na podstawie umowy ze starostą.',
        'Za okres opieki nad przyjętym dzieckiem rodzinie zastępczej zawodowej przysługuje wynagrodzenie z umowy ze starostą.',
        'O świadczenia na dziecko w pieczy zastępczej zapytaj powiatowe centrum pomocy rodzinie.',
        'Oznacz sprawę jako załatwioną, gdy przeczytasz informację.',
      ],
      ['Umowa ze starostą o pełnieniu funkcji rodziny zastępczej zawodowej'],
      URLOPY,
    ),
  },
  {
    id: 'K34',
    tytul: 'Zasiłek macierzyński po stracie dziecka',
    rodzaj: 'swiadczenie',
    etap: 'urlopy-i-zasilek',
    rodzic: 'matka',
    warunekOpis:
      'Profil wskazuje urodzenie martwego dziecka, poronienie potwierdzone zaświadczeniem o martwym urodzeniu albo zgon dziecka, a matka podlegała ubezpieczeniu chorobowemu w dniu porodu.',
    instytucjaIKanal:
      'Przy umowie o pracę pracodawca, w pozostałych przypadkach ZUS, wniosek ZAM w eZUS z odpisem skróconym aktu urodzenia z adnotacją o martwym urodzeniu albo z zaświadczeniem o martwym urodzeniu.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY, 'umowa-zlecenia': ezus('/ezus'), jdg: ezus('/ezus') },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Poproś szpital o zaświadczenie o martwym urodzeniu albo urząd stanu cywilnego o odpis skrócony aktu urodzenia z adnotacją o martwym urodzeniu.',
        'Przy umowie o pracę przekaż dokument pracodawcy razem z wnioskiem o urlop macierzyński.',
        'W pozostałych przypadkach wybierz przycisk Przejdź do eZUS, zaloguj się i wypełnij wniosek o zasiłek macierzyński (ZAM).',
        'Dołącz dokument i wyślij wniosek do ZUS.',
        'Oznacz sprawę w przewodniku jako złożoną.',
      ],
      [
        'Zaświadczenie o martwym urodzeniu albo odpis skrócony aktu urodzenia z adnotacją o martwym urodzeniu',
        'Wniosek o zasiłek macierzyński (ZAM)',
        'Numer rachunku do wypłaty zasiłku',
      ],
      URLOPY_PRACOWNIKA,
      ADRESY_KANALOW.ezus,
    ),
  },
  {
    id: 'K35',
    tytul: 'Wsparcie organizacji w sytuacji szczególnej',
    rodzaj: 'informacja',
    etap: 'pierwsze-tygodnie',
    rodzic: 'oboje-rodzice',
    warunekOpis:
      'Profil wskazuje sytuację szczególną: urodzenie martwego dziecka, poronienie, zgon dziecka, przedwczesny poród, ciężką chorobę dziecka, hospitalizację albo śmierć matki.',
    instytucjaIKanal:
      'Organizacje charytatywne ze słownika podmiotów wsparcia, kontakt telefoniczny, e-mail albo strona organizacji.',
    kanaly: { kazda: INFORMACJA },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Przejrzyj listę organizacji, które pomagają rodzinom w Twojej sytuacji.',
        'Wybierz organizację i skontaktuj się z nią telefonicznie, przez e-mail albo przez jej stronę.',
        'Opisz organizacji swoją sytuację i zapytaj o dostępną pomoc.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      [],
    ),
  },
  {
    id: 'K36',
    tytul: 'Odpis aktu urodzenia dziecka',
    rodzaj: 'uprawnienie',
    etap: 'pierwsze-tygodnie',
    rodzic: 'matka-albo-ojciec',
    warunekOpis: 'Dziecko się urodziło.',
    instytucjaIKanal:
      'Urząd stanu cywilnego, wniosek przez rejestr stanu cywilnego na gov.pl. Pierwszy odpis skrócony urząd wydaje bezpłatnie osobie, która zgłosiła urodzenie.',
    kanaly: {
      kazda: {
        typ: 'zewnetrzny',
        kanal: 'gov-rejestr-stanu-cywilnego',
        adres: ADRESY_KANALOW.rejestrStanuCywilnego,
        adresSymulowany: '/kanal/gov-rejestr-stanu-cywilnego',
      },
    },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Wybierz przycisk Przejdź do rejestru stanu cywilnego i zaloguj się przez login.gov.pl.',
        'Wybierz odpis skrócony albo zupełny aktu urodzenia dziecka i cel, w jakim go potrzebujesz.',
        'Wybierz sposób odbioru odpisu i wpisz dane dziecka.',
        'Opłać opłatę skarbową, gdy odpis jest płatny, podpisz i wyślij wniosek.',
        'Oznacz sprawę w przewodniku jako złożoną.',
      ],
      [
        'Imię, nazwisko, data i miejsce urodzenia dziecka',
        'Twoje dane',
        'Sposób odbioru odpisu',
        'Potwierdzenie opłaty skarbowej, gdy odpis jest płatny',
      ],
      [],
      ADRESY_KANALOW.rejestrStanuCywilnego,
    ),
  },
  {
    id: 'K37',
    tytul: 'Łączenie urlopu rodzicielskiego z pracą',
    rodzaj: 'uprawnienie',
    etap: 'urlopy-i-zasilek',
    rodzic: 'kazdy-rodzic-na-umowie-o-prace',
    warunekOpis: 'Rodzic pracuje na umowie o pracę.',
    instytucjaIKanal:
      'Pracodawca, który udzielił urlopu rodzicielskiego, wniosek co najmniej 21 dni przed podjęciem pracy.',
    kanaly: { 'umowa-o-prace': U_PRACODAWCY },
    regulaTerminu: BRAK_TERMINU,
    kosztSpoznienia: { typ: 'brak' },
    instrukcja: instrukcja(
      [
        'Ustal z pracodawcą wymiar pracy w czasie urlopu rodzicielskiego, najwyżej połowę etatu.',
        'Złóż pracodawcy pisemny wniosek o podjęcie pracy w czasie urlopu rodzicielskiego co najmniej 21 dni przed jej podjęciem.',
        'Podaj we wniosku wymiar czasu pracy i okres, w którym zamierzasz łączyć urlop z pracą.',
        'Poproś o potwierdzenie przyjęcia wniosku i zachowaj jego kopię.',
        'Oznacz sprawę w przewodniku jako załatwioną.',
      ],
      ['Wymiar czasu pracy', 'Okres łączenia urlopu rodzicielskiego z pracą', 'Wniosek o podjęcie pracy w czasie urlopu rodzicielskiego'],
      URLOPY_PRACOWNIKA,
    ),
  },
];
