// Usługa REST Katalogu świadczeń (kontrakt, sekcja 10; panel Administratora 3.5.1.2). Właściciel: u06.
//
// GET  /api/katalog            200 { edycje, trwaly } z edycjami Administratora wspólnymi dla wszystkich użytkowników.
// GET  /api/katalog?zlozony=1  200 { edycje, trwaly, katalog } z katalogiem złożonym z wartości startowych i edycji,
//                              czyli pozycjami, słownikami kwot, wymiarów i dokumentów oraz regułami świadczeń.
// POST /api/katalog            treść { zmiana: ZmianaKatalogu, sesjaDemo? }: dopisuje jedną zmianę Administratora i zwraca
//                              200 { edycje, trwaly }; zmiana { rodzaj: 'przywrocenie' } przywraca katalog startowy.
// PUT  /api/katalog            treść { edycje, bazowaWersja?, sesjaDemo? }: zastępuje wszystkie edycje i zwraca
//                              200 { edycje, trwaly }; przy bazowaWersja różnej od bieżącej wersji 409 { edycje }.
// Zapis (POST, PUT) wymaga roli Administrator potwierdzonej tokenem panelu albo polem `sesjaDemo` treści: 401 bez
// potwierdzenia roli, 403 przy odrzuconym potwierdzeniu (serwer/katalog/autoryzacja.ts). Błędny JSON albo układ danych
// daje 400, a treść ponad 1 MB daje 413.
import { connection } from 'next/server';
import { autoryzujAdministratora } from '@/serwer/katalog/autoryzacja';
import { odczytajEdycje, odczytajKatalogZlozony, zapiszZmiane, zastapEdycje } from '@/serwer/katalog/magazyn';
import { czyWpisEdytowalny, wariantyEdytowalne } from '@/domena/katalog/edycja';
import { czyEdycjeKatalogu, czyZmianaKatalogu } from '@/domena/katalog/zmiany';
import type { OdpowiedzKatalogu } from '@/domena/typy';

const MAKS_ROZMIAR_TRESCI = 1_000_000;

const BEZ_PAMIECI_PODRECZNEJ = { 'Cache-Control': 'no-store' } as const;

function blad(status: number, kod: string): Response {
  return Response.json({ blad: kod }, { status, headers: BEZ_PAMIECI_PODRECZNEJ });
}

async function trescJson(zadanie: Request): Promise<{ ok: true; tresc: unknown } | { ok: false; odpowiedz: Response }> {
  const tekst = await zadanie.text();
  if (tekst.length > MAKS_ROZMIAR_TRESCI) return { ok: false, odpowiedz: blad(413, 'tresc-za-duza') };
  try {
    return { ok: true, tresc: JSON.parse(tekst) as unknown };
  } catch {
    return { ok: false, odpowiedz: blad(400, 'bledny-json') };
  }
}

export async function GET(zadanie: Request): Promise<Response> {
  await connection();
  const zlozony = new URL(zadanie.url).searchParams.get('zlozony') === '1';
  const { edycje, trwaly } = await odczytajEdycje();
  const odpowiedz: OdpowiedzKatalogu = zlozony ? { edycje, trwaly, katalog: await odczytajKatalogZlozony() } : { edycje, trwaly };
  return Response.json(odpowiedz, { headers: BEZ_PAMIECI_PODRECZNEJ });
}

export async function POST(zadanie: Request): Promise<Response> {
  await connection();
  const wczytana = await trescJson(zadanie);
  if (!wczytana.ok) return wczytana.odpowiedz;
  const autoryzacja = autoryzujAdministratora(zadanie, wczytana.tresc);
  if (!autoryzacja.ok) return blad(autoryzacja.status, 'brak-uprawnien');
  const zmiana = (wczytana.tresc as { zmiana?: unknown } | null)?.zmiana;
  if (!czyZmianaKatalogu(zmiana)) return blad(400, 'bledna-zmiana');
  // Nowa wersja wartości dotyczy edytowalnego wpisu i podaje dodatnią liczbę dla każdego wariantu, który Administrator wpisuje.
  if (zmiana.rodzaj === 'nowa-wersja') {
    const wpis = (await odczytajKatalogZlozony()).slowniki.find((w) => w.id === zmiana.idWpisu);
    const wartosci = zmiana.wersja.wartosci;
    if (wpis === undefined || !czyWpisEdytowalny(wpis)) return blad(400, 'bledny-wpis');
    if (wariantyEdytowalne(wpis).some((w) => !(wartosci[w.klucz] > 0))) return blad(400, 'bledne-wartosci');
  }
  const odpowiedz: OdpowiedzKatalogu = await zapiszZmiane(zmiana, new Date().toISOString());
  return Response.json(odpowiedz, { headers: BEZ_PAMIECI_PODRECZNEJ });
}

export async function PUT(zadanie: Request): Promise<Response> {
  await connection();
  const wczytana = await trescJson(zadanie);
  if (!wczytana.ok) return wczytana.odpowiedz;
  const autoryzacja = autoryzujAdministratora(zadanie, wczytana.tresc);
  if (!autoryzacja.ok) return blad(autoryzacja.status, 'brak-uprawnien');
  const tresc = wczytana.tresc as { edycje?: unknown; bazowaWersja?: unknown } | null;
  if (!czyEdycjeKatalogu(tresc?.edycje)) return blad(400, 'bledne-edycje');
  const bazowa = tresc.bazowaWersja;
  if (bazowa !== undefined && (typeof bazowa !== 'number' || !Number.isInteger(bazowa))) return blad(400, 'bledna-wersja');
  const wynik = await zastapEdycje(tresc.edycje, bazowa, new Date().toISOString());
  if (!wynik.ok) return Response.json({ edycje: wynik.edycje }, { status: 409, headers: BEZ_PAMIECI_PODRECZNEJ });
  const odpowiedz: OdpowiedzKatalogu = { edycje: wynik.edycje, trwaly: wynik.trwaly };
  return Response.json(odpowiedz, { headers: BEZ_PAMIECI_PODRECZNEJ });
}
