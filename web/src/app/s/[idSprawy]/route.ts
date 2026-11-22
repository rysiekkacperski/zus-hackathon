// Krótki adres instrukcji sprawy z przypomnienia SMS (historyjka 3.2.1.1.1, KA-14 i KA-15). Właściciel: u18.
// Przekierowuje na pełny adres ViewCaseGuide; strażnik strefy prowadzi gościa bez sesji przez ViewGuideStart.
import { redirect } from 'next/navigation';
import { adresInstrukcji } from '@/domena/przypomnienia/tresc';
import type { IdSprawy } from '@/domena/typy';

export async function GET(
  _zadanie: Request,
  { params }: { params: Promise<{ idSprawy: string }> },
): Promise<Response> {
  const { idSprawy } = await params;
  redirect(adresInstrukcji(decodeURIComponent(idSprawy) as IdSprawy));
}
