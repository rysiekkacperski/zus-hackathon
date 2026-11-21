// POST /api/odczyt-dokumentu (kontrakt, sekcja 10.2): multipart/form-data (plik, powiazania, rodzajOczekiwany?)
// → 200 WynikOdczytuDokumentu, 400 { kod: '0103' | '0104' }, 503 { status: 'niedostepny' } bez klucza albo po 30 s.
// Właściciel: u05 (Przykładowe sprawy: lista, dokumenty i odczyt AI).
// Zaślepka fundamentu: implementuje u05. Zaślepka odpowiada 501 z kształtem niedostępności odczytu (0108).
import type { BladOdczytuDokumentu } from '@/domena/typy';

export async function POST(): Promise<Response> {
  const blad: BladOdczytuDokumentu = { status: 'niedostepny' };
  return Response.json(blad, { status: 501 });
}
