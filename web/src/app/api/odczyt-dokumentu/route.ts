// POST /api/odczyt-dokumentu (kontrakt, sekcja 10.2): multipart/form-data (plik, powiazania, rodzajOczekiwany?, tryb?)
// → 200 WynikOdczytuDokumentu, 400 { kod: '0103' | '0104' }, 503 { status: 'niedostepny' }.
// Właściciel: u05. Pole `tryb` = 'fikstura' zwraca wynik dokumentu przykładowego z dane/przykladowe-sprawy/fikstury-odczytu.ts,
// rozpoznanego po identyfikatorze w treści pliku albo po nazwie pliku (serwer/odczyt-dokumentow/fikstury.ts).
// W trybie modelu plik czyta dostawca z MODEL_DOSTAWCA (DEEPSEEK_API_KEY albo ANTHROPIC_API_KEY). Bez klucza dostawcy,
// po błędzie modelu albo po 30 s dokument przykładowy dostaje wynik z fikstury, a każdy inny plik odpowiedź 503.
// Serwer zastępuje dane osobowe przed odpowiedzią i nie zapisuje pliku.
import { walidujPlik } from '@/domena/walidacje';
import type { BladOdczytuDokumentu, PowiazanieZastepcze, WynikOdczytuDokumentu } from '@/domena/typy';
import { czyModelDostepny } from '@/serwer/model';
import { fiksturaDokumentu } from '@/serwer/odczyt-dokumentow/fikstury';
import { odczytajDokumentModelem, type PlikDoOdczytu } from '@/serwer/odczyt-dokumentow/graf';
import { odczytajPowiazania, zastapDaneOsobowe } from '@/serwer/odczyt-dokumentow/zastapienie';

const LIMIT_CZASU_MS = 30_000;

function niedostepny(): Response {
  const blad: BladOdczytuDokumentu = { status: 'niedostepny' };
  return Response.json(blad, { status: 503 });
}

/** Odpowiedź z fikstury dokumentu przykładowego z danymi osobowymi zastąpionymi danymi losowymi; 503 bez fikstury. */
function odpowiedzZFikstury(nazwa: string, bajty: Uint8Array, znanePowiazania: PowiazanieZastepcze[]): Response {
  const fikstura = fiksturaDokumentu({ nazwa, bajty });
  if (fikstura === null) return niedostepny();
  if (fikstura.status !== 'odczytany') return Response.json(fikstura satisfies WynikOdczytuDokumentu);
  const { wartosci, nowePowiazania } = zastapDaneOsobowe(fikstura.wartosci, znanePowiazania);
  const wynik: WynikOdczytuDokumentu = { ...fikstura, wartosci, nowePowiazania };
  return Response.json(wynik);
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
  const bajty = new Uint8Array(await plik.arrayBuffer());

  if (formularz.get('tryb') === 'fikstura' || !czyModelDostepny()) return odpowiedzZFikstury(plik.name, bajty, znanePowiazania);

  // Limit 30 s obejmuje wgranie PDF do Files API DeepSeek, parsowanie dokumentu i oba wywołania modelu.
  const dane: PlikDoOdczytu = {
    dane: Buffer.from(bajty).toString('base64'),
    typ: plik.type as PlikDoOdczytu['typ'],
  };
  try {
    const wynik = await odczytajDokumentModelem(dane, znanePowiazania, AbortSignal.timeout(LIMIT_CZASU_MS));
    return Response.json(wynik);
  } catch {
    return odpowiedzZFikstury(plik.name, bajty, znanePowiazania);
  }
}
