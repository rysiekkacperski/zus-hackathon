// Generator dokumentów przykładowych do strony „Przykładowe sprawy” (web/public/przyklady/).
// Uruchom w folderze web/: node skrypty/generuj-dokumenty-przykladowe.mjs
//
// Dokumenty są zmyślone przez zespół: osoby, numery PESEL, płatnicy i kwoty nie pochodzą z zestawów spraw ZUS.
// Każdy dokument to PDF z warstwą tekstową (czcionki standardowe Helvetica z kodowaniem polskich znaków i mapą
// ToUnicode), więc odczytuje go model językowy i parser Files API. Dokumenty oznaczone jako obraz skrypt zamienia
// na PNG poleceniem systemu macOS `sips`. Każdy plik niesie identyfikator „PPM-<nazwa pliku>” w treści strony,
// w metadanych PDF i w bloku tEXt pliku PNG, po którym tryb demonstracyjny odczytu rozpoznaje dokument
// niezależnie od nazwy pliku (src/serwer/odczyt-dokumentow/fikstury.ts). Wartości dokumentów odpowiadają
// fiksturom odczytu z src/dane/przykladowe-sprawy/fikstury-odczytu.ts.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32 } from 'node:zlib';

const KATALOG = join(import.meta.dirname, '..', 'public', 'przyklady');

// --- Kodowanie polskich znaków w czcionkach standardowych ------------------------------------------

const ZNAKI = [
  ['ą', 'aogonek', 0x0105], ['ć', 'cacute', 0x0107], ['ę', 'eogonek', 0x0119], ['ł', 'lslash', 0x0142],
  ['ń', 'nacute', 0x0144], ['ó', 'oacute', 0x00f3], ['ś', 'sacute', 0x015b], ['ź', 'zacute', 0x017a],
  ['ż', 'zdotaccent', 0x017c], ['Ą', 'Aogonek', 0x0104], ['Ć', 'Cacute', 0x0106], ['Ę', 'Eogonek', 0x0118],
  ['Ł', 'Lslash', 0x0141], ['Ń', 'Nacute', 0x0143], ['Ó', 'Oacute', 0x00d3], ['Ś', 'Sacute', 0x015a],
  ['Ź', 'Zacute', 0x0179], ['Ż', 'Zdotaccent', 0x017b], ['„', 'quotedblbase', 0x201e], ['”', 'quotedblright', 0x201d],
];
const PIERWSZY_KOD = 128;
const KODY = new Map(ZNAKI.map(([znak], i) => [znak, PIERWSZY_KOD + i]));

function tekstPdf(tekst) {
  let wynik = '';
  for (const znak of tekst) {
    const kod = KODY.get(znak);
    if (kod !== undefined) wynik += `\\${kod.toString(8)}`;
    else if (znak === '(' || znak === ')' || znak === '\\') wynik += `\\${znak}`;
    else if (znak.charCodeAt(0) < 32 || znak.charCodeAt(0) > 126) throw new Error(`Znak spoza kodowania: ${znak}`);
    else wynik += znak;
  }
  return `(${wynik})`;
}

function hex(n, dlugosc) {
  return n.toString(16).toUpperCase().padStart(dlugosc, '0');
}

const TO_UNICODE = [
  '/CIDInit /ProcSet findresource begin',
  '12 dict begin',
  'begincmap',
  '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
  '/CMapName /PPM-Polski def',
  '/CMapType 2 def',
  '1 begincodespacerange <00> <FF> endcodespacerange',
  '1 beginbfrange <20> <7E> <0020> endbfrange',
  `${ZNAKI.length} beginbfchar`,
  ...ZNAKI.map(([, , unicode], i) => `<${hex(PIERWSZY_KOD + i, 2)}> <${hex(unicode, 4)}>`),
  'endbfchar',
  'endcmap',
  'CMapName currentdict /CMap defineresource pop',
  'end',
  'end',
].join('\n');

// --- Układ strony -------------------------------------------------------------------------------

const SZEROKOSC = 595;
const WYSOKOSC = 842;
const MARGINES = 50;
const KOLUMNA_WARTOSCI = 270;

function zawin(tekst, znaki) {
  const slowa = tekst.split(' ');
  const linie = [];
  let linia = '';
  for (const slowo of slowa) {
    if (linia !== '' && `${linia} ${slowo}`.length > znaki) {
      linie.push(linia);
      linia = slowo;
    } else {
      linia = linia === '' ? slowo : `${linia} ${slowo}`;
    }
  }
  if (linia !== '') linie.push(linia);
  return linie;
}

function stopka(id) {
  return [
    'Dokument przykładowy aplikacji „Przewodnik przyszłej mamy”. Osoby, numery PESEL, płatnicy i kwoty są zmyślone.',
    `Identyfikator dokumentu przykładowego: PPM-${id}`,
  ];
}

/** Strony PDF jako ciągi poleceń strumienia treści. */
function strony(dokument) {
  const wynik = [];
  let polecenia = [];
  let y = WYSOKOSC - MARGINES;
  const tekst = (x, wiersz, rozmiar, gruby, wartosc) =>
    polecenia.push(`BT /${gruby ? 'F2' : 'F1'} ${rozmiar} Tf ${x} ${wiersz} Td ${tekstPdf(wartosc)} Tj ET`);
  const zamknijStrone = () => {
    stopka(dokument.id).forEach((linia, i) => tekst(MARGINES, 40 - i * 11, 7.5, false, linia));
    wynik.push(polecenia.join('\n'));
    polecenia = [];
    y = WYSOKOSC - MARGINES;
  };
  const miejsce = (potrzebne) => {
    if (y - potrzebne < 70) zamknijStrone();
  };

  if (dokument.zrzut) {
    polecenia.push(`0.16 0.29 0.52 rg 0 ${WYSOKOSC - 70} ${SZEROKOSC} 70 re f 0 0 0 rg`);
    polecenia.push(`BT /F2 13 Tf 1 1 1 rg ${MARGINES} ${WYSOKOSC - 40} Td ${tekstPdf(dokument.zrzut)} Tj ET 0 0 0 rg`);
    y = WYSOKOSC - 100;
  }
  tekst(MARGINES, y, 15, true, dokument.tytul);
  y -= 20;
  for (const linia of zawin(dokument.podtytul, 95)) {
    tekst(MARGINES, y, 9.5, false, linia);
    y -= 13;
  }
  y -= 8;
  for (const sekcja of dokument.sekcje) {
    miejsce(40);
    tekst(MARGINES, y, 11, true, sekcja.tytul);
    y -= 5;
    polecenia.push(`0.6 0.6 0.6 RG 0.5 w ${MARGINES} ${y} m ${SZEROKOSC - MARGINES} ${y} l S`);
    y -= 14;
    for (const [etykieta, wartosc] of sekcja.wiersze) {
      const linieEtykiety = zawin(etykieta, 42);
      const linieWartosci = zawin(wartosc, 52);
      const wiersze = Math.max(linieEtykiety.length, linieWartosci.length);
      miejsce(wiersze * 12 + 4);
      linieEtykiety.forEach((l, i) => tekst(MARGINES, y - i * 12, 9.5, false, l));
      linieWartosci.forEach((l, i) => tekst(KOLUMNA_WARTOSCI, y - i * 12, 9.5, true, l));
      y -= wiersze * 12 + 4;
    }
    y -= 10;
  }
  if (dokument.podpis) {
    miejsce(40);
    y -= 10;
    tekst(MARGINES, y, 9.5, false, dokument.podpis);
  }
  zamknijStrone();
  return wynik;
}

function pdf(dokument) {
  const obiekty = [];
  const dodaj = (tresc) => {
    obiekty.push(tresc);
    return obiekty.length;
  };
  const katalog = dodaj('');
  const drzewo = dodaj('');
  const roznice = ZNAKI.map(([, nazwa]) => `/${nazwa}`).join(' ');
  const kodowanie = dodaj(`<< /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [${PIERWSZY_KOD} ${roznice}] >>`);
  const mapa = dodaj(`<< /Length ${TO_UNICODE.length} >>\nstream\n${TO_UNICODE}\nendstream`);
  const czcionka = (nazwa) => dodaj(`<< /Type /Font /Subtype /Type1 /BaseFont /${nazwa} /Encoding ${kodowanie} 0 R /ToUnicode ${mapa} 0 R >>`);
  const f1 = czcionka('Helvetica');
  const f2 = czcionka('Helvetica-Bold');
  const idStron = [];
  for (const tresc of strony(dokument)) {
    const strumien = dodaj(`<< /Length ${tresc.length} >>\nstream\n${tresc}\nendstream`);
    idStron.push(
      dodaj(
        `<< /Type /Page /Parent ${drzewo} 0 R /MediaBox [0 0 ${SZEROKOSC} ${WYSOKOSC}] ` +
          `/Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${strumien} 0 R >>`,
      ),
    );
  }
  obiekty[katalog - 1] = `<< /Type /Catalog /Pages ${drzewo} 0 R >>`;
  obiekty[drzewo - 1] = `<< /Type /Pages /Kids [${idStron.map((n) => `${n} 0 R`).join(' ')}] /Count ${idStron.length} >>`;
  const info = dodaj(
    `<< /Title ${tekstPdf(dokument.tytul)} /Subject (PPM-${dokument.id}) /Keywords (PPM-${dokument.id}) ` +
      `/Producer (Przewodnik przyszlej mamy, generator dokumentow przykladowych) >>`,
  );
  let wynik = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const przesuniecia = [];
  obiekty.forEach((tresc, i) => {
    przesuniecia.push(Buffer.byteLength(wynik, 'latin1'));
    wynik += `${i + 1} 0 obj\n${tresc}\nendobj\n`;
  });
  const xref = Buffer.byteLength(wynik, 'latin1');
  wynik += `xref\n0 ${obiekty.length + 1}\n0000000000 65535 f \n`;
  wynik += przesuniecia.map((p) => `${String(p).padStart(10, '0')} 00000 n \n`).join('');
  wynik += `trailer\n<< /Size ${obiekty.length + 1} /Root ${katalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(wynik, 'latin1');
}

/** PNG z blokiem tEXt „Comment” z identyfikatorem dokumentu przed blokiem IEND. */
function zIdentyfikatorem(png, id) {
  const tresc = Buffer.from(`Comment\0PPM-${id}`, 'latin1');
  const typ = Buffer.from('tEXt', 'latin1');
  const dlugosc = Buffer.alloc(4);
  dlugosc.writeUInt32BE(tresc.length);
  const suma = Buffer.alloc(4);
  suma.writeUInt32BE(crc32(Buffer.concat([typ, tresc])) >>> 0);
  const iend = png.length - 12;
  return Buffer.concat([png.subarray(0, iend), dlugosc, typ, tresc, suma, png.subarray(iend)]);
}

function obraz(dokument, plikPdf) {
  const tymczasowy = mkdtempSync(join(tmpdir(), 'ppm-'));
  try {
    const wyjscie = join(tymczasowy, 'strona.png');
    execFileSync('sips', ['-s', 'format', 'png', '-s', 'dpiWidth', '144', '-s', 'dpiHeight', '144', plikPdf, '--out', wyjscie], {
      stdio: 'ignore',
    });
    execFileSync('sips', ['-Z', '1400', wyjscie], { stdio: 'ignore' });
    return zIdentyfikatorem(readFileSync(wyjscie), dokument.id);
  } finally {
    rmSync(tymczasowy, { recursive: true, force: true });
  }
}

// --- Dokumenty ----------------------------------------------------------------------------------

const POD_ZAM = 'Wniosek o zasiłek macierzyński, w tym o zasiłek za okres urlopu rodzicielskiego i ojcowskiego. Dokument przykładowy przygotowany do testów odczytu.';
const POD_Z3 = 'Zaświadczenie płatnika składek do ustalenia prawa do zasiłku i jego wysokości. Dokument przykładowy przygotowany do testów odczytu.';

function miesiace(odRok, odMiesiac, liczba, kwota) {
  return Array.from({ length: liczba }, (_, i) => {
    const indeks = odRok * 12 + (odMiesiac - 1) + i;
    return [`${String((indeks % 12) + 1).padStart(2, '0')}.${Math.floor(indeks / 12)}`, kwota];
  });
}

const osoba = (imie, nazwisko, pesel) => ({ tytul: 'Dane ubezpieczonej osoby', wiersze: [['Imię', imie], ['Nazwisko', nazwisko], ['Numer PESEL', pesel]] });

const DOKUMENTY = [
  {
    id: 'zam-kowalczyk.pdf', tytul: 'Wniosek o zasiłek macierzyński ZAM', podtytul: POD_ZAM,
    sekcje: [
      osoba('Agnieszka', 'Kowalczyk', '94051243149'),
      { tytul: 'Wniosek', wiersze: [['Wnioskuję o', 'zasiłek macierzyński'], ['Składam wniosek jako', 'matka dziecka'], ['Data porodu', '02.09.2026'], ['Liczba dzieci urodzonych przy jednym porodzie', '1']] },
      { tytul: 'Okresy zasiłku', wiersze: [['Urlop macierzyński', 'od 02.09.2026 do 19.01.2027']] },
    ],
    podpis: 'Data i podpis: 03.09.2026, Agnieszka Kowalczyk',
  },
  {
    id: 'z3-kowalczyk.pdf', tytul: 'Zaświadczenie płatnika składek Z-3', podtytul: POD_Z3,
    sekcje: [
      { tytul: 'Płatnik składek', wiersze: [['Nazwa płatnika', 'Pracownia Ceramiki Glina sp. z o.o. (przykład)'], ['Liczba osób zgłoszonych do ubezpieczenia chorobowego', 'do 20 osób']] },
      osoba('Agnieszka', 'Kowalczyk', '94051243149'),
      { tytul: 'Zatrudnienie i ubezpieczenie', wiersze: [['Tytuł ubezpieczenia', 'umowa o pracę (pracownik)'], ['Zatrudniona od', '01.04.2019'], ['Wymiar czasu pracy', 'pełny etat'], ['Ubezpieczenie chorobowe', 'obowiązkowe od 01.04.2019']] },
      { tytul: 'Wynagrodzenie stanowiące podstawę wymiaru zasiłku (brutto)', wiersze: miesiace(2025, 9, 12, '7000,00 zł') },
    ],
  },
  {
    id: 'zrzut-kowalczyk.png', zrzut: 'Podgląd konta ubezpieczonego', tytul: 'Zrzut ekranu z systemu ZUS', podtytul: 'Zrzut przykładowy z okresami ubezpieczenia i świadczeniami. Dane są zmyślone.',
    sekcje: [
      osoba('Agnieszka', 'Kowalczyk', '94051243149'),
      { tytul: 'Okresy ubezpieczenia', wiersze: [['Tytuł ubezpieczenia', 'pracownik, od 01.04.2019'], ['Ubezpieczenie chorobowe', 'obowiązkowe, od 01.04.2019']] },
      { tytul: 'Świadczenia przyznane', wiersze: [['Zasiłek macierzyński', 'od 02.09.2026 do 19.01.2027, miesięcznie 6040,30 zł']] },
    ],
  },
  {
    id: 'z3a-sadowska.pdf', tytul: 'Zaświadczenie płatnika składek Z-3a', podtytul: POD_Z3,
    sekcje: [
      { tytul: 'Płatnik składek', wiersze: [['Nazwa płatnika', 'Studio Grafiki Kreska (przykład)'], ['Liczba osób zgłoszonych do ubezpieczenia chorobowego', 'do 20 osób']] },
      osoba('Oliwia', 'Sadowska', '95012760842'),
      { tytul: 'Tytuł i ubezpieczenie', wiersze: [['Tytuł ubezpieczenia', 'umowa zlecenia (zleceniobiorca)'], ['Umowa od', '01.03.2025'], ['Ubezpieczenie chorobowe', 'dobrowolne od 01.03.2025']] },
      { tytul: 'Przychód stanowiący podstawę wymiaru składek', wiersze: miesiace(2025, 8, 12, '5200,00 zł') },
    ],
  },
  {
    id: 'zam-sadowska.pdf', tytul: 'Wniosek o zasiłek macierzyński ZAM', podtytul: POD_ZAM,
    sekcje: [
      osoba('Oliwia', 'Sadowska', '95012760842'),
      { tytul: 'Wniosek', wiersze: [['Wnioskuję o', 'zasiłek macierzyński'], ['Składam wniosek jako', 'matka dziecka'], ['Data porodu', '20.08.2026'], ['Liczba dzieci urodzonych przy jednym porodzie', '1'], ['Data złożenia wniosku', '25.08.2026']] },
      { tytul: 'Okresy zasiłku', wiersze: [['Urlop macierzyński', 'od 20.08.2026 do 06.01.2027'], ['Urlop rodzicielski', 'od 07.01.2027 do 18.08.2027']] },
      { tytul: 'Oświadczenie', wiersze: [['Wnioskuję o zasiłek za okres urlopu rodzicielskiego w pełnym wymiarze', 'TAK, zasiłek 81,5% podstawy za cały okres']] },
    ],
    podpis: 'Data i podpis: 25.08.2026, Oliwia Sadowska',
  },
  {
    id: 'z3a-gorska.pdf', tytul: 'Zaświadczenie płatnika składek Z-3a', podtytul: POD_Z3,
    sekcje: [
      { tytul: 'Płatnik składek', wiersze: [['Nazwa płatnika', 'Księgarnia Zakładka s.c. (przykład)'], ['Liczba osób zgłoszonych do ubezpieczenia chorobowego', 'do 20 osób']] },
      osoba('Zuzanna', 'Górska', '99070745243'),
      { tytul: 'Tytuł i ubezpieczenie', wiersze: [['Tytuł ubezpieczenia', 'umowa zlecenia (zleceniobiorca)'], ['Umowa od', '01.09.2026'], ['Ubezpieczenie chorobowe', 'dobrowolne od 01.09.2026']] },
      { tytul: 'Niezdolność do pracy', wiersze: [['Okres niezdolności', 'od 15.10.2026 do 14.11.2026'], ['Kod literowy', 'B (niezdolność w okresie ciąży)']] },
      { tytul: 'Przychód stanowiący podstawę wymiaru składek', wiersze: miesiace(2026, 9, 1, '4806,00 zł') },
    ],
  },
  {
    id: 'ezla-gorska.pdf', tytul: 'Wydruk zaświadczenia lekarskiego e-ZLA', podtytul: 'Wydruk przykładowy zaświadczenia lekarskiego o czasowej niezdolności do pracy. Dane są zmyślone.',
    sekcje: [
      osoba('Zuzanna', 'Górska', '99070745243'),
      { tytul: 'Niezdolność do pracy', wiersze: [['Niezdolność do pracy od', '15.10.2026'], ['Niezdolność do pracy do', '14.11.2026'], ['Kod literowy', 'B (niezdolność w okresie ciąży)'], ['Wskazania lekarskie', 'chory może chodzić']] },
    ],
  },
  {
    id: 'zas12-gorska.pdf', tytul: 'Zaświadczenie płatnika składek ZAS-12', podtytul: 'Zaświadczenie płatnika składek o zasiłku chorobowym za dalszy okres niezdolności do pracy. Dokument przykładowy przygotowany do testów odczytu.',
    sekcje: [
      osoba('Zuzanna', 'Górska', '99070745243'),
      { tytul: 'Dalszy okres niezdolności do pracy', wiersze: [['Okres niezdolności', 'od 15.11.2026 do 05.12.2026'], ['Wnioskowane świadczenie', 'zasiłek chorobowy']] },
    ],
  },
  {
    id: 'zam-pawlak.pdf', tytul: 'Wniosek o zasiłek macierzyński ZAM', podtytul: POD_ZAM,
    sekcje: [
      osoba('Marta', 'Pawlak', '91110912444'),
      { tytul: 'Wniosek', wiersze: [['Wnioskuję o', 'zasiłek macierzyński'], ['Składam wniosek jako', 'matka dziecka'], ['Data porodu', '03.11.2026'], ['Liczba dzieci urodzonych przy jednym porodzie', '1'], ['Data złożenia wniosku', '05.11.2026']] },
      { tytul: 'Okresy zasiłku', wiersze: [['Urlop macierzyński', 'od 03.11.2026 do 22.03.2027']] },
      { tytul: 'Oświadczenie', wiersze: [['Wnioskuję o zasiłek za okres urlopu rodzicielskiego w pełnym wymiarze', 'NIE']] },
    ],
    podpis: 'Data i podpis: 05.11.2026, Marta Pawlak',
  },
  {
    id: 'poswiadczenie-pawlak.pdf', tytul: 'Poświadczenie ubezpieczenia chorobowego', podtytul: 'Poświadczenie ZUS o okresach podlegania ubezpieczeniu chorobowemu i podstawach wymiaru składek osoby prowadzącej działalność, wydane na wniosek ubezpieczonej. Dokument przykładowy, dane są zmyślone.',
    sekcje: [
      osoba('Marta', 'Pawlak', '91110912444'),
      { tytul: 'Tytuł i ubezpieczenie', wiersze: [['Tytuł ubezpieczenia', 'pozarolnicza działalność gospodarcza'], ['Działalność od', '01.09.2024'], ['Ubezpieczenie chorobowe', 'dobrowolne od 01.09.2024'], ['Zadłużenie z tytułu składek na dzień 03.11.2026', '0,00 zł']] },
      { tytul: 'Podstawa wymiaru składek na ubezpieczenie chorobowe', wiersze: miesiace(2025, 11, 12, '6500,00 zł') },
    ],
  },
  {
    id: 'zrzut-pawlak.png', zrzut: 'Podgląd konta ubezpieczonego', tytul: 'Zrzut ekranu z systemu ZUS', podtytul: 'Zrzut przykładowy z okresami ubezpieczenia i świadczeniami. Dane są zmyślone.',
    sekcje: [
      osoba('Marta', 'Pawlak', '91110912444'),
      { tytul: 'Okresy ubezpieczenia', wiersze: [['Tytuł ubezpieczenia', 'pozarolnicza działalność, od 01.09.2024'], ['Ubezpieczenie chorobowe', 'dobrowolne, od 01.09.2024']] },
      { tytul: 'Świadczenia przyznane', wiersze: [['Zasiłek macierzyński', 'od 03.11.2026 do 22.03.2027, miesięcznie 5608,85 zł']] },
    ],
  },
  {
    id: 'z3-zajac.pdf', tytul: 'Zaświadczenie płatnika składek Z-3', podtytul: POD_Z3,
    sekcje: [
      { tytul: 'Płatnik składek', wiersze: [['Nazwa płatnika', 'Drukarnia Akapit sp. z o.o. w likwidacji (przykład)'], ['Liczba osób zgłoszonych do ubezpieczenia chorobowego', 'do 20 osób']] },
      osoba('Monika', 'Zając', '90092186241'),
      { tytul: 'Zatrudnienie i ubezpieczenie', wiersze: [['Tytuł ubezpieczenia', 'umowa o pracę (pracownik)'], ['Zatrudniona od', '01.03.2020'], ['Data ustania zatrudnienia', '30.09.2026'], ['Wymiar czasu pracy', 'pełny etat'], ['Ubezpieczenie chorobowe', 'obowiązkowe od 01.03.2020 do 30.09.2026']] },
      { tytul: 'Wynagrodzenie stanowiące podstawę wymiaru zasiłku (brutto)', wiersze: miesiace(2025, 10, 12, '6200,00 zł') },
    ],
  },
  {
    id: 'zam-zajac.pdf', tytul: 'Wniosek o zasiłek macierzyński ZAM', podtytul: POD_ZAM,
    sekcje: [
      osoba('Monika', 'Zając', '90092186241'),
      { tytul: 'Wniosek', wiersze: [['Wnioskuję o', 'zasiłek w wysokości zasiłku macierzyńskiego oraz zasiłek macierzyński'], ['Składam wniosek jako', 'matka dziecka'], ['Przyczyna ustania zatrudnienia w ciąży', 'likwidacja pracodawcy'], ['Data porodu', '10.11.2026'], ['Liczba dzieci urodzonych przy jednym porodzie', '1'], ['Data złożenia wniosku', '12.11.2026']] },
      { tytul: 'Okresy zasiłku', wiersze: [['Urlop macierzyński', 'od 10.11.2026 do 29.03.2027']] },
    ],
    podpis: 'Data i podpis: 12.11.2026, Monika Zając',
  },
  {
    id: 'zam-krawczyk.pdf', tytul: 'Wniosek o zasiłek macierzyński ZAM', podtytul: POD_ZAM,
    sekcje: [
      osoba('Julia', 'Krawczyk', '93061837542'),
      { tytul: 'Wniosek', wiersze: [['Wnioskuję o', 'zasiłek macierzyński'], ['Składam wniosek jako', 'matka dziecka'], ['Data porodu', '12.08.2026'], ['Liczba dzieci urodzonych przy jednym porodzie', '1'], ['Data złożenia wniosku', '20.08.2026']] },
      { tytul: 'Okresy zasiłku', wiersze: [['Urlop macierzyński', 'od 12.08.2026 do 29.12.2026']] },
    ],
    podpis: 'Data i podpis: 20.08.2026, Julia Krawczyk',
  },
  {
    id: 'zrzut-krawczyk.png', zrzut: 'Podgląd konta ubezpieczonego', tytul: 'Zrzut ekranu z systemu ZUS', podtytul: 'Zrzut przykładowy z okresami ubezpieczenia i świadczeniami. Dane są zmyślone.',
    sekcje: [
      osoba('Julia', 'Krawczyk', '93061837542'),
      { tytul: 'Okresy ubezpieczenia', wiersze: [['Tytuł ubezpieczenia', 'pozarolnicza działalność, od 01.06.2022'], ['Ubezpieczenie chorobowe', 'brak, osoba nie przystąpiła do dobrowolnego ubezpieczenia chorobowego']] },
      { tytul: 'Świadczenia odmówione', wiersze: [['Zasiłek macierzyński', 'odmowa prawa od 12.08.2026, przyczyna: brak ubezpieczenia chorobowego w dniu porodu']] },
    ],
  },
  {
    id: 'z3a-mazur.pdf', tytul: 'Zaświadczenie płatnika składek Z-3a', podtytul: POD_Z3,
    sekcje: [
      { tytul: 'Płatnik składek', wiersze: [['Nazwa płatnika', 'Biuro Tłumaczeń Słowo (przykład)'], ['Liczba osób zgłoszonych do ubezpieczenia chorobowego', 'do 20 osób']] },
      osoba('Karolina', 'Mazur', '96031512340'),
      { tytul: 'Tytuł i ubezpieczenie', wiersze: [['Tytuł ubezpieczenia', 'umowa zlecenia (zleceniobiorca)'], ['Umowa od', '01.02.2024'], ['Ubezpieczenie chorobowe', 'dobrowolne od 01.02.2024']] },
      { tytul: 'Niezdolność do pracy', wiersze: [['Okres niezdolności', 'od 14.09.2026 do 13.10.2026'], ['Kod literowy', 'B (niezdolność w okresie ciąży)'], ['Wnioskowane świadczenie', 'zasiłek chorobowy']] },
      { tytul: 'Przychód stanowiący podstawę wymiaru składek', wiersze: miesiace(2025, 9, 12, '5800,00 zł') },
    ],
  },
  {
    id: 'ezla-mazur.pdf', tytul: 'Wydruk zaświadczenia lekarskiego e-ZLA', podtytul: 'Wydruk przykładowy zaświadczenia lekarskiego o czasowej niezdolności do pracy. Dane są zmyślone.',
    sekcje: [
      osoba('Karolina', 'Mazur', '96031512340'),
      { tytul: 'Niezdolność do pracy', wiersze: [['Niezdolność do pracy od', '14.09.2026'], ['Niezdolność do pracy do', '13.10.2026'], ['Kod literowy', 'B (niezdolność w okresie ciąży)'], ['Wskazania lekarskie', 'chory powinien leżeć']] },
    ],
  },
  {
    id: 'zrzut-mazur.png', zrzut: 'Podgląd konta ubezpieczonego', tytul: 'Zrzut ekranu z systemu ZUS', podtytul: 'Zrzut przykładowy z okresami ubezpieczenia i świadczeniami. Dane są zmyślone.',
    sekcje: [
      osoba('Karolina', 'Mazur', '96031512340'),
      { tytul: 'Okresy ubezpieczenia', wiersze: [['Tytuł ubezpieczenia', 'umowa zlecenia, od 01.02.2024'], ['Ubezpieczenie chorobowe', 'dobrowolne, od 01.02.2024']] },
      { tytul: 'Świadczenia przyznane', wiersze: [['Zasiłek chorobowy', 'od 14.09.2026 do 13.10.2026, 100% podstawy, miesięcznie 5004,82 zł']] },
    ],
  },
  {
    id: 'umowa-najmu.pdf', tytul: 'Umowa najmu lokalu mieszkalnego', podtytul: 'Dokument przykładowy spoza zestawu dokumentów sprawy, do sprawdzenia rozpoznania rodzaju dokumentu.',
    sekcje: [
      { tytul: 'Strony umowy', wiersze: [['Wynajmujący', 'Jan Przykładowy'], ['Najemca', 'Anna Testowa']] },
      { tytul: 'Warunki', wiersze: [['Czynsz miesięczny', '2400,00 zł'], ['Okres najmu', 'od 01.10.2026 do 30.09.2027']] },
    ],
  },
];

mkdirSync(KATALOG, { recursive: true });
const tymczasowy = mkdtempSync(join(tmpdir(), 'ppm-pdf-'));
try {
  for (const dokument of DOKUMENTY) {
    const tresc = pdf(dokument);
    if (dokument.id.endsWith('.pdf')) {
      writeFileSync(join(KATALOG, dokument.id), tresc);
    } else {
      const plikPdf = join(tymczasowy, `${dokument.id}.pdf`);
      writeFileSync(plikPdf, tresc);
      writeFileSync(join(KATALOG, dokument.id), obraz(dokument, plikPdf));
    }
  }
} finally {
  rmSync(tymczasowy, { recursive: true, force: true });
}
const archiwum = join(KATALOG, 'dokumenty-przykladowe.zip');
rmSync(archiwum, { force: true });
execFileSync('zip', ['-q', '-X', '-j', archiwum, ...DOKUMENTY.map((d) => join(KATALOG, d.id))]);
console.log(`Zapisano ${DOKUMENTY.length} dokumentów i archiwum w ${KATALOG}`);
