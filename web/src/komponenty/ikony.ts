// Ścieżki ikon ze wzorów eZUS (CZ1 i CZ2). Każda ikona ma viewBox 0 0 24 24, obrys 2 px, zaokrąglone końce i łączenia.
// Komentarz nad ikoną opisuje kształt i miejsca użycia we wzorach.

const sciezkiWozka = [
  'M8 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  'M18 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  'M2 5h2.5l1.632 4.897a6 6 0 0 0 5.693 4.103h2.675a5.5 5.5 0 0 0 0 -11h-.5v6',
  'M6 9h14',
  'M9 17l1 -3',
  'M16 14l1 3',
] as const;

export const sciezkiIkon = {
  // Wózek dziecięcy: logo przewodnika w nagłówku
  logo: sciezkiWozka,
  // Sylwetka osoby: konto w nagłówku
  konto: [
    'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0',
    'M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
  ],
  // Trzy linie: przycisk menu poniżej lg
  menu: [
    'M4 6l16 0',
    'M4 12l16 0',
    'M4 18l16 0',
  ],
  // Krzyżyk: zamknięcie okna, panelu i usunięcie pozycji
  zamknij: [
    'M18 6l-12 12',
    'M6 6l12 12',
  ],
  // Szewron w prawo: kafelki, wiersze listy, następna strona
  'w-prawo': [
    'M9 6l6 6l-6 6',
  ],
  // Szewron w lewo: link powrotu, poprzednia strona
  'w-lewo': [
    'M15 6l-6 6l6 6',
  ],
  // Szewron w dół: akordeon, pole wyboru, rozwinięcie
  'w-dol': [
    'M6 9l6 6l6 -6',
  ],
  // Szewron w górę: zwinięcie akordeonu
  'w-gore': [
    'M6 15l6 -6l6 6',
  ],
  // Strzałka w lewo: powrót w nagłówku strony
  'strzalka-w-lewo': [
    'M5 12l14 0',
    'M5 12l6 6',
    'M5 12l6 -6',
  ],
  // Informacja w kole: notatki i komunikaty INFO
  info: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
    'M12 9h.01',
    'M11 12h1v4h1',
  ],
  // Trójkąt ostrzegawczy: komunikaty WARNING
  uwaga: [
    'M12 9v4',
    'M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z',
    'M12 16h.01',
  ],
  // Wykrzyknik w kole: błąd pola i komunikaty ERROR
  blad: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
    'M12 8v4',
    'M12 16h.01',
  ],
  // Znacznik w kole: komunikaty SUCCESS, krok gotowy, sprawa załatwiona
  sukces: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
    'M9 12l2 2l4 -4',
  ],
  // Znacznik: ukończony krok kreatora
  zaznaczenie: [
    'M5 12l5 5l10 -10',
  ],
  // Puste koło: krok oczekujący
  kolo: [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
  ],
  // Zegar: termin, oczekiwanie
  zegar: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
    'M12 7v5l3 3',
  ],
  // Schowek z listą: Plan rodziny
  plan: [
    'M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2',
    'M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z',
    'M9 12l.01 0',
    'M13 12l2 0',
    'M9 16l.01 0',
    'M13 16l2 0',
  ],
  // Kalendarz z dniem: Terminy
  kalendarz: [
    'M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
    'M16 3l0 4',
    'M8 3l0 4',
    'M4 11l16 0',
    'M8 15h2v2h-2z',
  ],
  // Dokument z tekstem: Twoje wnioski
  wnioski: [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M9 9l1 0',
    'M9 13l6 0',
    'M9 17l6 0',
  ],
  // Kalkulator: Kalkulator zasiłku
  kalkulator: [
    'M4 3m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
    'M8 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z',
    'M8 14l0 .01',
    'M12 14l0 .01',
    'M16 14l0 .01',
    'M8 17l0 .01',
    'M12 17l0 .01',
    'M16 17l0 .01',
  ],
  // Foldery: Przykładowe sprawy ZUS
  folder: [
    'M9 4h3l2 2h5a2 2 0 0 1 2 2v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2',
    'M17 17v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2h2',
  ],
  // Osoba w ramce: Profil na start
  profil: [
    'M9 10a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
    'M6 21v-1a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v1',
    'M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z',
  ],
  // Lista ze szczegółami: Katalog świadczeń
  katalog: [
    'M13 5h8',
    'M13 9h5',
    'M13 15h8',
    'M13 19h5',
    'M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
  ],
  // Serce z dłońmi: Podmioty wsparcia
  serce: [
    'M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572',
    'M12 6l-3.293 3.293a1 1 0 0 0 0 1.414l.543 .543c.69 .69 1.81 .69 2.5 0l1 -1a3.182 3.182 0 0 1 4.5 0l2.25 2.25',
    'M12.5 15.5l2 2',
    'M15 13l2 2',
  ],
  // Koło zębate: Ustawienia w menu konta
  ustawienia: [
    'M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z',
    'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0',
  ],
  // Wyjście: Wyloguj w menu konta
  wyloguj: [
    'M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2',
    'M9 12h12l-3 -3',
    'M18 15l3 -3',
  ],
  // Dymek z twarzą: asystent
  asystent: [
    'M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z',
    'M9.5 9h.01',
    'M14.5 9h.01',
    'M9.5 13a3.5 3.5 0 0 0 5 0',
  ],
  // Iskry: treść przygotowana z pomocą AI
  'iskry-ai': [
    'M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z',
  ],
  // Strzałka z ramki: link otwierany w nowej karcie
  zewnetrzny: [
    'M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6',
    'M11 13l9 -9',
    'M15 4h5v5',
  ],
  // Strzałka w dół do tacki: pobranie pliku
  pobierz: [
    'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2',
    'M7 11l5 5l5 -5',
    'M12 4l0 12',
  ],
  // Drukarka: drukowanie wniosku
  drukuj: [
    'M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2',
    'M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4',
    'M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z',
  ],
  // Samolot papierowy: wysłanie wniosku i wiadomości
  wyslij: [
    'M10 14l11 -11',
    'M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5',
  ],
  // Lupa: pole wyszukiwania
  szukaj: [
    'M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0',
    'M21 21l-6 -6',
  ],
  // Plus: dodanie pozycji
  plus: [
    'M12 5l0 14',
    'M5 12l14 0',
  ],
  // Ołówek: zmiana danych
  edytuj: [
    'M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4',
    'M13.5 6.5l4 4',
  ],
  // Kosz: usunięcie sprawy i danych
  usun: [
    'M4 7l16 0',
    'M10 11l0 6',
    'M14 11l0 6',
    'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
    'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
  ],
  // Dwie kartki: kopiowanie linku
  kopiuj: [
    'M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z',
    'M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1',
  ],
  // Węzły: udostępnienie linku
  udostepnij: [
    'M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M8.7 10.7l6.6 -3.4',
    'M8.7 13.3l6.6 3.4',
  ],
  // Pusta kartka: zapisany plik
  plik: [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
  ],
  // Dyskietka: zapis do dokończenia
  zapisz: [
    'M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2',
    'M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M14 4l0 4l-6 0l0 -4',
  ],
  // Baza danych: źródło danych z konta ZUS
  'baza-danych': [
    'M12 6m-8 0a8 3 0 1 0 16 0a8 3 0 1 0 -16 0',
    'M4 6v6a8 3 0 0 0 16 0v-6',
    'M4 12v6a8 3 0 0 0 16 0v-6',
  ],
  // Dowód osobisty: logowanie przez mObywatela, dane konta ZUS
  mobywatel: [
    'M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z',
    'M9 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M15 8l2 0',
    'M15 12l2 0',
    'M7 16l10 0',
  ],
  // Wejście: logowanie loginem i hasłem eZUS
  ezus: [
    'M9 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2',
    'M3 12h13l-3 -3',
    'M13 15l3 -3',
  ],
  // Telefon komórkowy: logowanie kodem z mZUS, SMS
  mzus: [
    'M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14z',
    'M11 4h2',
    'M12 17v.01',
  ],
  // Kod QR: zastępczy kod QR makiety
  qr: [
    'M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M7 17l0 .01',
    'M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M7 7l0 .01',
    'M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z',
    'M17 7l0 .01',
    'M14 14l3 0',
    'M20 14l0 .01',
    'M14 14l0 3',
    'M14 20l3 0',
    'M17 17l3 0',
    'M20 17l0 3',
  ],
  // Słuchawka: odnośnik telefonu
  telefon: [
    'M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2',
  ],
  // Koperta: odnośnik e-mail
  email: [
    'M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z',
    'M3 7l9 6l9 -6',
  ],
  // Dom: ikona spoza wzorów, kształt home z zestawu Tabler w stylu wzorów
  dom: [
    'M5 12l-2 0l9 -9l9 9l-2 0',
    'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7',
    'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6',
  ],
  // Wózek dziecięcy: dziecko, ten sam kształt co logo
  dziecko: sciezkiWozka,
  // Monety: kwota i termin wypłaty, rozliczenie składek
  pieniadze: [
    'M9 14c0 1.657 2.686 3 6 3s6 -1.343 6 -3s-2.686 -3 -6 -3s-6 1.343 -6 3z',
    'M9 14v4c0 1.656 2.686 3 6 3s6 -1.344 6 -3v-4',
    'M3 6c0 1.072 1.144 2.062 3 2.598s4.144 .536 6 0c1.856 -.536 3 -1.526 3 -2.598c0 -1.072 -1.144 -2.062 -3 -2.598s-4.144 -.536 -6 0c-1.856 .536 -3 1.526 -3 2.598z',
    'M3 6v10c0 .888 .772 1.45 2 2',
    'M3 11c0 .888 .772 1.45 2 2',
  ],
  // Strzałka w prawo: kolejny krok w instrukcji
  'strzalka-w-prawo': [
    'M5 12l14 0',
    'M13 18l6 -6',
    'M13 6l6 6',
  ],
  // Koło z kropką: bieżący krok profilu
  'krok-biezacy': [
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
  ],
  // Tarcza strzelnicza: bieżący etap ścieżki
  'biezacy-etap': [
    'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
    'M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0',
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
  ],
  // Dwie strzałki w kole: ponowny odczyt danych
  odswiez: [
    'M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4',
    'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4',
  ],
  // Strzałka zawracająca: przywrócenie stanu, cofnięcie oznaczenia
  cofnij: [
    'M9 14l-4 -4l4 -4',
    'M5 10h11a4 4 0 1 1 0 8h-1',
  ],
  // Lista z odhaczeniami: zastosowane reguły
  reguly: [
    'M3.5 5.5l1.5 1.5l2.5 -2.5',
    'M3.5 11.5l1.5 1.5l2.5 -2.5',
    'M3.5 17.5l1.5 1.5l2.5 -2.5',
    'M11 6l9 0',
    'M11 12l9 0',
    'M11 18l9 0',
  ],
  // Znak zapytania w kole: pytanie do ZUS, brak danych
  pytanie: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
    'M12 16v.01',
    'M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483',
  ],
  // Minus w kole: warunek nie dotyczy, krok pominięty, zgoda wycofana
  'nie-dotyczy': [
    'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M9 12l6 0',
  ],
  // Krzyżyk w kole: odmowa, warunek niespełniony, działanie odrzucone
  odmowa: [
    'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M10 10l4 4m0 -4l-4 4',
  ],
  // Spinacz: dodanie pliku
  zalacznik: [
    'M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5',
  ],
  // Strzałka w górę z tacki: wgranie dokumentu
  wgraj: [
    'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2',
    'M7 9l5 -5l5 5',
    'M12 4l0 12',
  ],
  // Oko: podgląd dokumentu
  podglad: [
    'M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6',
  ],
  // Dokument z wierszami: wniosek do przygotowania
  dokument: [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M9 17h6',
    'M9 13h6',
  ],
  // Dokument ze znacznikiem: wniosek złożony
  'plik-zlozony': [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M9 15l2 2l4 -4',
  ],
  // Dokument z krzyżykiem: brak dokumentów
  'plik-brak': [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z',
    'M10 12l4 4m0 -4l-4 4',
  ],
  // Dokument z pieczęcią: pełnomocnictwo
  pelnomocnictwo: [
    'M14 3v4a1 1 0 0 0 1 1h4',
    'M5 8v-3a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-5',
    'M6 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0',
    'M4.5 17l-1.5 5l3 -1.5l3 1.5l-1.5 -5',
  ],
  // Dwie osoby: członkowie rodziny
  rodzina: [
    'M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
    'M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
    'M16 3.13a4 4 0 0 1 0 7.75',
    'M21 21v-2a4 4 0 0 0 -3 -3.85',
  ],
  // Osoba z plusem: zaproszenie drugiego rodzica, wybór konta
  'dodaj-osobe': [
    'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0',
    'M16 19h6',
    'M19 16v6',
    'M6 21v-2a4 4 0 0 1 4 -4h4',
  ],
  // Osoba z minusem: odłączenie drugiego rodzica
  'odlacz-osobe': [
    'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0',
    'M6 21v-2a4 4 0 0 1 4 -4h4c.348 0 .686 .045 1.009 .128',
    'M16 19h6',
  ],
  // Kalendarz: okresy zasiłku
  'kalendarz-pusty': [
    'M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z',
    'M16 3l0 4',
    'M8 3l0 4',
    'M4 11l16 0',
  ],
  // Kalendarz ze znakiem zapytania: termin szacowany
  'kalendarz-szacowany': [
    'M15 21h-9a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v5',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
    'M19 22v.01',
    'M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483',
  ],
  // Kalendarz ze strzałką w dół: plik kalendarza
  'kalendarz-pobierz': [
    'M12.5 21h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v5',
    'M19 16v6',
    'M22 19l-3 3l-3 -3',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
  ],
  // Kalendarz ze znacznikiem: brak terminów do zrobienia
  'kalendarz-gotowe': [
    'M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
    'M15 19l2 2l4 -4',
  ],
  // Kalendarz z krzyżykiem: terminy niepoliczone
  'kalendarz-brak': [
    'M13 21h-7a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6.5',
    'M16 3v4',
    'M8 3v4',
    'M4 11h16',
    'M22 22l-5 -5',
    'M17 22l5 -5',
  ],
  // Strzałki w pętli: termin powtarzany co roku
  powtarzanie: [
    'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3',
    'M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3',
  ],
  // Waluta w kole: koszt spóźnienia, kwota zależna od dochodu
  koszt: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
    'M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1',
    'M12 7v10',
  ],
  // Tarcza ze znacznikiem: strażnik ubezpieczenia chorobowego
  straznik: [
    'M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3',
    'M9 12l2 2l4 -4',
  ],
  // Tarcza: strażnik ubezpieczenia chorobowego z ostrzeżeniami
  tarcza: [
    'M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3',
  ],
  // Kłódka: wartość zablokowana
  klodka: [
    'M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z',
    'M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0',
    'M8 11v-4a4 4 0 1 1 8 0v4',
  ],
  // Kolba: tryb demonstracyjny
  demo: [
    'M9 3l6 0',
    'M10 9l4 0',
    'M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6',
  ],
  // Skrzyżowane strzałki: dane zastąpione losowymi
  'dane-losowe': [
    'M18 4l3 3l-3 3',
    'M18 20l3 -3l-3 -3',
    'M3 7h3a5 5 0 0 1 5 5a5 5 0 0 0 5 5h5',
    'M21 7h-5a4.978 4.978 0 0 0 -3 1m-4 8a4.984 4.984 0 0 1 -3 1h-3',
  ],
  // Glob: strona internetowa organizacji
  'strona-www': [
    'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0',
    'M3.6 9h16.8',
    'M3.6 15h16.8',
    'M11.5 3a17 17 0 0 0 0 18',
    'M12.5 3a17 17 0 0 1 0 18',
  ],
  // Dymek z tekstem: wiadomość do ZUS, przypomnienie
  wiadomosc: [
    'M8 9h8',
    'M8 13h6',
    'M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z',
  ],
  // Otwarta koperta: odpowiedź ZUS
  odpowiedz: [
    'M3 9l9 6l9 -6l-9 -6l-9 6',
    'M21 9v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10',
    'M3 19l6 -6',
    'M15 13l6 6',
  ],
  // Przekreślony dzwonek: tryb bez przypomnień
  'bez-przypomnien': [
    'M9.346 5.353c.21 -.129 .428 -.246 .654 -.353a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3m-1 3h-13a4 4 0 0 0 2 -3v-3a6.996 6.996 0 0 1 1.273 -3.707',
    'M9 17v1a3 3 0 0 0 6 0v-1',
    'M3 3l18 18',
  ],
  // Stetoskop: zaświadczenia lekarskie e-ZLA
  lekarz: [
    'M6 4h-1a2 2 0 0 0 -2 2v3.5a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1',
    'M8 15a6 6 0 1 0 12 0v-3',
    'M11 3v2',
    'M6 3v2',
    'M20 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  ],
  // Kamera: e-wizyta
  wideo: [
    'M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z',
    'M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z',
  ],
  // Przerywane koło: odczyt danych w kolejce
  'w-kolejce': [
    'M8.56 3.69a9 9 0 0 0 -2.92 1.95',
    'M3.69 8.56a9 9 0 0 0 -.69 3.44',
    'M3.69 15.44a9 9 0 0 0 1.95 2.92',
    'M8.56 20.31a9 9 0 0 0 3.44 .69',
    'M15.44 20.31a9 9 0 0 0 2.92 -1.95',
    'M20.31 15.44a9 9 0 0 0 .69 -3.44',
    'M20.31 8.56a9 9 0 0 0 -1.95 -2.92',
    'M15.44 3.69a9 9 0 0 0 -3.44 -.69',
  ],
  // Łuk: odczyt danych w toku
  ladowanie: [
    'M12 3a9 9 0 1 0 9 9',
  ],
  // Przekreślona chmura: brak połączenia
  'brak-polaczenia': [
    'M9.58 5.548c.24 -.11 .492 -.207 .752 -.286c1.88 -.572 3.956 -.193 5.444 1c1.488 1.19 2.162 3.007 1.77 4.769h.99c1.913 0 3.464 1.56 3.464 3.486c0 .957 -.383 1.824 -1.003 2.454m-2.997 1.033h-11.343c-2.572 -.004 -4.657 -2.011 -4.657 -4.487c0 -2.475 2.085 -4.482 4.657 -4.482c.13 -.582 .37 -1.128 .7 -1.62',
    'M3 3l18 18',
  ],
} as const satisfies Record<string, readonly string[]>;

export type NazwaIkony = keyof typeof sciezkiIkon;
