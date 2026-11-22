// POST /api/asystent (kontrakt, sekcja 10.2): ZapytanieAsystenta → 200 OdpowiedzAsystenta,
// 503 { kod: '0071' } przy błędzie modelu albo po 20 s, 400 { kod: '0006' } przy złym żądaniu.
// Bez klucza wybranego dostawcy modelu (DEEPSEEK_API_KEY albo ANTHROPIC_API_KEY według MODEL_DOSTAWCA) trasa zwraca 503 { kod: '0071' }.
// Właściciel: u31 (Asystent AI). Serwer niczego nie zapisuje.
import { walidujWiadomosc } from '@/domena/asystent/intencje';
import type { BladAsystenta, ZapytanieAsystenta } from '@/domena/typy';
import { LIMIT_CZASU_ASYSTENTA_MS, odpowiedzAsystenta } from '@/serwer/asystent/graf';
import { czyModelDostepny } from '@/serwer/model';

function blad(kod: BladAsystenta['kod'], status: number): Response {
  const tresc: BladAsystenta = { kod };
  return Response.json(tresc, { status });
}

function czyTablica(w: unknown): w is unknown[] {
  return Array.isArray(w);
}

function czyZapytanie(w: unknown): w is ZapytanieAsystenta {
  if (typeof w !== 'object' || w === null) return false;
  const { idRozmowy, wiadomosc, historia, kontekst } = w as Record<string, unknown>;
  if (typeof idRozmowy !== 'string' || typeof wiadomosc !== 'string' || !walidujWiadomosc(wiadomosc)) return false;
  if (!czyTablica(historia)) return false;
  if (typeof kontekst !== 'object' || kontekst === null) return false;
  const k = kontekst as Record<string, unknown>;
  return (
    typeof k.rola === 'string' &&
    typeof k.dzis === 'string' &&
    czyTablica(k.sprawy) &&
    czyTablica(k.wnioski) &&
    czyTablica(k.wyniki) &&
    typeof k.katalog === 'object' &&
    k.katalog !== null
  );
}

export async function POST(zadanie: Request): Promise<Response> {
  let tresc: unknown;
  try {
    tresc = await zadanie.json();
  } catch {
    return blad('0006', 400);
  }
  if (!czyZapytanie(tresc)) return blad('0006', 400);
  // Historyjka 3.11.1.1.3: bez klucza wybranego dostawcy asystent jest niedostępny (komunikat 0071).
  if (!czyModelDostepny()) return blad('0071', 503);
  try {
    const odpowiedz = await odpowiedzAsystenta(tresc, AbortSignal.timeout(LIMIT_CZASU_ASYSTENTA_MS));
    return Response.json(odpowiedz, { status: 200 });
  } catch {
    return blad('0071', 503);
  }
}
