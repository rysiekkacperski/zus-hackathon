// Prosty dokument PDF wniosku ZAM bez zewnętrznej biblioteki: strony A4, krój Helvetica z kodowaniem
// rozszerzonym o polskie litery (tablica Differences), tekst w wierszach z łamaniem po szerokości.

export interface WierszPdf {
  tekst: string;
  rodzaj?: 'tytul' | 'naglowek' | 'tekst';
}

// Znaki spoza ASCII mapowane na kody 128+ w kodowaniu dokumentu.
const ZNAKI: [string, string][] = [
  ['ą', 'aogonek'], ['ć', 'cacute'], ['ę', 'eogonek'], ['ł', 'lslash'], ['ń', 'nacute'], ['ó', 'oacute'],
  ['ś', 'sacute'], ['ź', 'zacute'], ['ż', 'zdotaccent'], ['Ą', 'Aogonek'], ['Ć', 'Cacute'], ['Ę', 'Eogonek'],
  ['Ł', 'Lslash'], ['Ń', 'Nacute'], ['Ó', 'Oacute'], ['Ś', 'Sacute'], ['Ź', 'Zacute'], ['Ż', 'Zdotaccent'],
  ['–', 'endash'], ['„', 'quotedblbase'], ['”', 'quotedblright'], ['“', 'quotedblleft'],
];
const KOD_ZNAKU = new Map(ZNAKI.map(([znak], i) => [znak, 128 + i]));
const ROZNICE = `[128 ${ZNAKI.map(([, nazwa]) => `/${nazwa}`).join(' ')}]`;

function tekstPdf(tekst: string): string {
  let wynik = '';
  for (const znak of tekst.replace(/ /g, ' ')) {
    const kod = KOD_ZNAKU.get(znak);
    if (kod !== undefined) wynik += `\\${kod.toString(8)}`;
    else if (znak === '(' || znak === ')' || znak === '\\') wynik += `\\${znak}`;
    else if (znak.charCodeAt(0) >= 32 && znak.charCodeAt(0) < 127) wynik += znak;
    else wynik += '?';
  }
  return wynik;
}

function zlam(tekst: string, maksZnakow: number): string[] {
  const slowa = tekst.split(' ');
  const wiersze: string[] = [];
  let biezacy = '';
  for (const slowo of slowa) {
    if (biezacy && `${biezacy} ${slowo}`.length > maksZnakow) {
      wiersze.push(biezacy);
      biezacy = slowo;
    } else biezacy = biezacy ? `${biezacy} ${slowo}` : slowo;
  }
  if (biezacy) wiersze.push(biezacy);
  return wiersze;
}

const STYL = {
  tytul: { font: 'F2', rozmiar: 16, interlinia: 24, znakow: 60 },
  naglowek: { font: 'F2', rozmiar: 12, interlinia: 20, znakow: 80 },
  tekst: { font: 'F1', rozmiar: 11, interlinia: 16, znakow: 90 },
} as const;

/** Treść pliku PDF (bajty) z wierszy dokumentu. */
export function zbudujPdf(wiersze: WierszPdf[]): Uint8Array<ArrayBuffer> {
  const strony: string[] = [];
  let strumien = '';
  let y = 790;
  for (const wiersz of wiersze) {
    const styl = STYL[wiersz.rodzaj ?? 'tekst'];
    if (wiersz.rodzaj === 'naglowek') y -= 8;
    for (const linia of zlam(wiersz.tekst, styl.znakow)) {
      if (y < 60) {
        strony.push(strumien);
        strumien = '';
        y = 790;
      }
      strumien += `BT /${styl.font} ${styl.rozmiar} Tf 56 ${y} Td (${tekstPdf(linia)}) Tj ET\n`;
      y -= styl.interlinia;
    }
  }
  strony.push(strumien);

  const obiekty: string[] = [];
  const idStron = strony.map((_, i) => 5 + i * 2);
  obiekty[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  obiekty[2] = `<< /Type /Pages /Kids [${idStron.map((id) => `${id} 0 R`).join(' ')}] /Count ${strony.length} >>`;
  obiekty[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences ${ROZNICE} >> >>`;
  obiekty[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding << /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences ${ROZNICE} >> >>`;
  strony.forEach((tresc, i) => {
    const idStrony = idStron[i];
    obiekty[idStrony] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${idStrony + 1} 0 R >>`;
    obiekty[idStrony + 1] = `<< /Length ${tresc.length} >>\nstream\n${tresc}endstream`;
  });

  let pdf = '%PDF-1.4\n';
  const przesuniecia: number[] = [];
  for (let i = 1; i < obiekty.length; i += 1) {
    przesuniecia[i] = pdf.length;
    pdf += `${i} 0 obj\n${obiekty[i]}\nendobj\n`;
  }
  const startXref = pdf.length;
  pdf += `xref\n0 ${obiekty.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < obiekty.length; i += 1) pdf += `${String(przesuniecia[i]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${obiekty.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  const bajty = new Uint8Array(new ArrayBuffer(pdf.length));
  for (let i = 0; i < pdf.length; i += 1) bajty[i] = pdf.charCodeAt(i) & 0xff;
  return bajty;
}
