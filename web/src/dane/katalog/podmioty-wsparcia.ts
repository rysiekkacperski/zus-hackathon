// Podmioty wsparcia w kolejności z ANALIZY/18 sekcja 4 (kontrakt, sekcja 8).
// Właściciel: u22. Słownik w Katalogu świadczeń; zmienia go konto z rolą Administrator.
import type { PodmiotWsparcia } from '@/domena/typy';

export const podmiotyWsparcia: readonly PodmiotWsparcia[] = [
  {
    id: 'fundacja-ernesta',
    nazwa: 'Fundacja Medycyny Prenatalnej im. Ernesta Wójcickiego (Fundacja Ernesta)',
    sytuacje: ['poronienie', 'martwe-urodzenie', 'przedwczesny-porod', 'choroba-dziecka'],
    zakresPomocy:
      'Bezpłatne wsparcie psychologiczne i prawne prowadzone zdalnie przez czat, telefon pod numerem wewnętrznym 1 i e-mail.',
    telefon: '22 350 00 50',
    email: 'pomoc.psychologiczna@fundacjaernesta.pl',
    adresStrony: 'https://fundacjaernesta.pl',
    charytatywny: true,
    kolejnosc: 1,
  },
  {
    id: 'fundacja-rodzic-po-ludzku',
    nazwa: 'Fundacja Rodzić po Ludzku',
    sytuacje: ['poronienie', 'martwe-urodzenie'],
    zakresPomocy: 'Bezpłatny informator i porady prawne udzielane e-mailem.',
    email: 'kontakt@rodzicpoludzku.pl',
    adresStrony: 'https://rodzicpoludzku.pl',
    charytatywny: true,
    kolejnosc: 2,
  },
  {
    id: 'fundacja-nagle-sami',
    nazwa: 'Fundacja „Nagle Sami”',
    sytuacje: ['zgon-dziecka', 'martwe-urodzenie', 'poronienie', 'smierc-matki'],
    zakresPomocy:
      'Bezpłatny, ogólnopolski i anonimowy Telefon Wsparcia dla osób w żałobie, czynny od poniedziałku do piątku w godzinach od 14:00 do 20:00.',
    telefon: '800 108 108',
    email: 'info@naglesami.org.pl',
    adresStrony: 'https://naglesami.org.pl',
    charytatywny: true,
    kolejnosc: 3,
  },
  {
    id: 'fundacja-wczesniak',
    nazwa: 'Fundacja „Wcześniak Rodzice-Rodzicom”',
    sytuacje: ['przedwczesny-porod'],
    zakresPomocy: 'Wypożyczalnia sprzętu, niezbędnik rodzica wcześniaka, program Mentor i grupy wsparcia.',
    telefon: '+48 22 121 80 55',
    email: 'wczesniak@wczesniak.pl',
    adresStrony: 'https://wczesniak.pl',
    charytatywny: true,
    kolejnosc: 4,
  },
  {
    id: 'fundacja-koalicja-dla-wczesniaka',
    nazwa: 'Fundacja Koalicja dla wcześniaka',
    sytuacje: ['przedwczesny-porod'],
    zakresPomocy: 'Bezpłatne poradniki i porady specjalistów w formie nagrań wideo, kontakt przez formularz na stronie.',
    adresStrony: 'https://koalicjadlawczesniaka.pl',
    charytatywny: true,
    kolejnosc: 5,
  },
  {
    id: 'fundacja-warszawskie-hospicjum-dla-dzieci',
    nazwa: 'Fundacja Warszawskie Hospicjum dla Dzieci',
    sytuacje: ['choroba-dziecka', 'zgon-dziecka'],
    zakresPomocy:
      'Opieka hospicjum perinatalnego w Warszawie, lista hospicjów perinatalnych w Polsce i grupy wsparcia w żałobie.',
    telefon: '+48 509 797 324',
    email: 'poczta@hospicjum.waw.pl',
    adresStrony: 'https://www.hospicjum.waw.pl/hospicjum-perinatalne/',
    charytatywny: true,
    kolejnosc: 6,
  },
  {
    id: 'fundacja-zdazyc-z-pomoca',
    nazwa: 'Fundacja Dzieciom „Zdążyć z Pomocą”',
    sytuacje: ['choroba-dziecka'],
    zakresPomocy: 'Bezpłatne subkonta dla chorych dzieci.',
    telefon: '22 486 96 99',
    adresStrony: 'https://www.dzieciom.pl',
    charytatywny: true,
    kolejnosc: 7,
  },
];
