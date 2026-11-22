// POST /api/odczyt-dokumentu (kontrakt, sekcja 10.2): multipart/form-data (plik, powiazania, rodzajOczekiwany?, tryb?)
// → 200 WynikOdczytuDokumentu, 400 { kod: '0103' | '0104' }, 503 { status: 'niedostepny' } bez klucza dostawcy
// z MODEL_DOSTAWCA (DEEPSEEK_API_KEY albo ANTHROPIC_API_KEY), po błędzie modelu albo po 30 s.
// Właściciel: u05. Pole `tryb` = 'fikstura' zwraca wynik pliku demonstracyjnego z dane/przykladowe-sprawy/fikstury-odczytu.ts.
// Serwer zastępuje dane osobowe przed odpowiedzią i nie zapisuje pliku.
import { fiksturaOdczytu } from '@/dane/przykladowe-sprawy/fikstury-odczytu';
import { walidujPlik } from '@/domena/walidacje';
import type { BladOdczytuDokumentu, WynikOdczytuDokumentu } from '@/domena/typy';
import { czyModelDostepny } from '@/serwer/model';
import { odczytajDokumentModelem, type PlikDoOdczytu } from '@/serwer/odczyt-dokumentow/graf';
import { odczytajPowiazania, zastapDaneOsobowe } from '@/serwer/odczyt-dokumentow/zastapienie';

const LIMIT_CZASU_MS = 30_000;

function niedostepny(): Response {
  const blad: BladOdczytuDokumentu = { status: 'niedostepny' };
  return Response.json(blad, { status: 503 });
}

export async function POST(zadanie: Request): Promise<Response> {
  let formularz: FormData;
  try {
    formularz = await zadanie.formData();
  } catch {
    const blad: BladOdczytuDokumentu = { kod: '0103' };
    return Response.json(blad, { status: 400 });
  }
  const plik = formularz.get('plik');
  if (!(plik instanceof File)) {
    const blad: BladOdczytuDokumentu = { kod: '0103' };
    return Response.json(blad, { status: 400 });
  }
  const kod = walidujPlik({ typ: plik.type, rozmiar: plik.size });
  if (kod !== null) {
    const blad: BladOdczytuDokumentu = { kod };
    return Response.json(blad, { status: 400 });
  }
  let powiazania: unknown = [];
  try {
    powiazania = JSON.parse(String(formularz.get('powiazania') ?? '[]'));
  } catch {
    powiazania = [];
  }
  const znanePowiazania = odczytajPowiazania(powiazania);

  if (formularz.get('tryb') === 'fikstura') {
    const fikstura = fiksturaOdczytu(plik.name);
    if (fikstura === null) return niedostepny();
    if (fikstura.status !== 'odczytany') return Response.json(fikstura satisfies WynikOdczytuDokumentu);
    const { wartosci, nowePowiazania } = zastapDaneOsobowe(fikstura.wartosci, znanePowiazania);
    const wynik: WynikOdczytuDokumentu = { ...fikstura, wartosci, nowePowiazania };
    return Response.json(wynik);
  }

  // Plik PDF albo obraz czyta dostawca z MODEL_DOSTAWCA; bez jego klucza odczyt jest niedostępny.
  // Limit 30 s obejmuje wgranie PDF do Files API DeepSeek, parsowanie dokumentu i oba wywołania modelu.
  if (!czyModelDostepny()) return niedostepny();
  const dane: PlikDoOdczytu = {
    dane: Buffer.from(await plik.arrayBuffer()).toString('base64'),
    typ: plik.type as PlikDoOdczytu['typ'],
  };
  try {
    const wynik = await odczytajDokumentModelem(dane, znanePowiazania, AbortSignal.timeout(LIMIT_CZASU_MS));
    return Response.json(wynik);
  } catch {
    return niedostepny();
  }
}
