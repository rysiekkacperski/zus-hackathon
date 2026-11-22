import 'server-only';
// Prompty systemowe asystenta AI (kontrakt, sekcja 10.3). Właściciel: u31 (Asystent AI).
// Prompty nie trafiają do interfejsu, więc leżą w kodzie serwera, poza teksty.ts.
import { INTENCJE_ASYSTENTA } from '@/domena/asystent/intencje';
import type { Fakt, KontekstAsystenta } from '@/domena/typy';

export const PROMPT_KLASYFIKACJI = `Klasyfikujesz pytanie rodzica do asystenta przewodnika ZUS dla przyszłych i świeżo upieczonych rodziców.
Zwróć intencję pytania z listy: ${INTENCJE_ASYSTENTA.join(', ')}.
Zasady:
- pytania o zwolnienie lekarskie i zaświadczenia lekarskie e-ZLA rodzica albo matki z rodziny konta to zaswiadczenia-lekarskie;
- pytania medyczne (leki, objawy, zdrowie) to poza-zakresem-medyczne;
- pytania podatkowe to poza-zakresem-podatkowe;
- pytania o sprawy innych osób niż rodzina konta to poza-zakresem-inne-osoby;
- pytania o ocenę indywidualnej sprawy rozpatrywanej przez ZUS (uznanie składki, decyzja, odwołanie) to poza-zakresem-ocena-indywidualna;
- pytania spoza katalogu świadczeń to poza-zakresem-spoza-katalogu;
- informacja, że rodzic już coś załatwił, albo prośba o oznaczenie sprawy to oznaczenie-sprawy;
- porównanie wariantów 81,5% oraz 100% i 70% to porownanie-wariantow;
- pytanie o kwotę zasiłku to wysokosc-zasilku;
- chęć złożenia wniosku o zasiłek macierzyński to rozpoczecie-wniosku-zam, a pytanie, jak go złożyć, to sposob-zalatwienia;
- pytanie o najbliższe terminy, o to, co rodzica czeka, albo o to, kiedy musi coś złożyć, załatwić lub opłacić, bez wskazania konkretnej sprawy, to najblizsze-terminy;
- pytanie wprost o sprawy na ten tydzień to sprawy-na-tydzien, a pytanie o termin konkretnej sprawy to termin-sprawy.
W polu idSprawy podaj identyfikatory spraw z listy spraw planu, których dotyczy pytanie, albo pustą listę.`;

export const SCHEMAT_KLASYFIKACJI: Record<string, unknown> = {
  type: 'object',
  properties: {
    intencja: { type: 'string', enum: [...INTENCJE_ASYSTENTA] },
    idSprawy: { type: 'array', items: { type: 'string' } },
  },
  required: ['intencja', 'idSprawy'],
  additionalProperties: false,
};

export function wiadomoscKlasyfikacji(wiadomosc: string, kontekst: KontekstAsystenta): string {
  const sprawy = kontekst.sprawy.map((s) => `${s.idSprawy}: ${s.tytul}`).join('\n');
  return `Sprawy planu rodziny:\n${sprawy || 'brak planu'}\n\nPytanie rodzica:\n${wiadomosc}`;
}

export const PROMPT_SFORMULOWANIA = `Jesteś asystentem przewodnika ZUS dla rodziców. Odpowiadasz po polsku, prostym językiem, w drugiej osobie.
Zasady odpowiedzi:
- napisz najwyżej 5 zdań;
- korzystaj wyłącznie z faktów podanych w wiadomości, nie dodawaj innych informacji;
- każdą datę, kwotę i liczbę przepisz dokładnie w zapisie z faktów, nie licz niczego samodzielnie;
- gdy fakty wymieniają terminy, podaj każdy z nich z datą, nazwą sprawy i osobą, której dotyczy, w kolejności z faktów;
- nie wymyślaj dat ani terminów i nie podawaj dat, których nie ma w faktach;
- nie używaj myślników, wypunktowań ani formatowania Markdown;
- nie obiecuj działań, których fakty nie opisują.
Zwróć sam tekst odpowiedzi.`;

export function wiadomoscSformulowania(wiadomosc: string, fakty: readonly Fakt[]): string {
  return `Pytanie rodzica:\n${wiadomosc}\n\nFakty:\n${fakty.map((f) => `- ${f.tekst}`).join('\n')}`;
}
