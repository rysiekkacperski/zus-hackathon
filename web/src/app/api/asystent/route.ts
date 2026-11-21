// POST /api/asystent (kontrakt, sekcja 10.2): ZapytanieAsystenta → 200 OdpowiedzAsystenta,
// 503 { kod: '0071' } bez klucza, przy błędzie modelu albo po 20 s, 400 { kod: '0006' } przy złym żądaniu.
// Właściciel: u31 (Asystent AI).
// Zaślepka fundamentu: implementuje u31. Zaślepka odpowiada 501 z kształtem błędu asystenta (0071).
import type { BladAsystenta } from '@/domena/typy';

export async function POST(): Promise<Response> {
  const blad: BladAsystenta = { kod: '0071' };
  return Response.json(blad, { status: 501 });
}
