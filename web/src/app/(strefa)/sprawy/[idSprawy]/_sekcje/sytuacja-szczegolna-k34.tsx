'use client';

// Sekcja ViewCaseDetails „sytuacja-szczegolna-k34” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u25.
// Sprawa K34 Zasiłek macierzyński po stracie dziecka (wzór P22-05): karta „Okres zasiłku” z zakresem dat
// i karta „Jak załatwić” z kanałem według formy zatrudnienia matki i przejściem do instrukcji sprawy.
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { dodajDni, formatujDate } from '@/domena/daty';
import { czyPoronienieBezZaswiadczenia, stratyDoOkresuK34 } from '@/domena/rodzina/sytuacje';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaSytuacjaSzczegolnaK34;

/** Ostatni dzień 8 tygodni po porodzie, z dniem porodu jako pierwszym dniem. */
function koniecOsmiuTygodni(dataPorodu: string): string {
  return dodajDni(dataPorodu, 55);
}

export function SekcjaSytuacjaSzczegolnaK34({ sprawa, kontekst, pochodzenie }: PropsSlotu<'sekcja'>) {
  // K07 i K08 po poronieniu bez zaświadczenia o martwym urodzeniu: prawo powstaje po przedstawieniu zaświadczenia.
  if (sprawa.idSprawy === 'K07' || sprawa.idSprawy === 'K08') {
    return czyPoronienieBezZaswiadczenia(kontekst.rodzina.daneCiazy) ? <Komunikat kod="0265" /> : null;
  }
  if (sprawa.idSprawy !== 'K34') return null;
  const okres = sprawa.dane?.okresK34;
  const daneCiazy = kontekst.rodzina.daneCiazy;
  if (!okres || daneCiazy === null) return null;

  const straty = stratyDoOkresuK34(daneCiazy);
  const dataPorodu = daneCiazy.dataPorodu ?? okres.od;
  const koniec8 = koniecOsmiuTygodni(dataPorodu);
  const opis =
    straty?.rodzaj === 'zgon-dziecka'
      ? straty.dataZgonu && straty.dataZgonu > koniec8
        ? t.opisZgonPoOsmiuTygodniach
        : t.opisZgonPrzedOsmiomaTygodniami
      : straty?.rodzaj === 'poronienie'
        ? t.opisPoronienie
        : t.opisMartweUrodzenie;
  const wstep = okres.do > koniec8 ? t.wstepPoZgonie : t.wstepOsmiuTygodni;

  const kanal = sprawa.dane?.kanalK34 ?? 'pracodawca';
  const platnikZus = kontekst.rodzina.daneRodziny.matka.platnikZasilku?.wartosc === 'zus';
  const jakZalatwic =
    kanal === 'zus' ? t.jakZus : `${t.jakPracodawca} ${platnikZus ? t.wyplacaZus : t.wyplacaPracodawca}`;

  return (
    <div className="flex min-w-0 flex-col gap-7.5">
      <Karta tytul={t.kartaOkresu} bezLinii>
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <p className="m-0">{wstep}</p>
            <p className="m-0 text-amount text-ink-strong">
              {t.okres({ od: formatujDate(okres.od), doDnia: formatujDate(okres.do) })}
            </p>
          </div>
          <p className="m-0">{opis}</p>
        </div>
      </Karta>
      <Karta tytul={t.kartaJakZalatwic} bezLinii>
        <div className="flex min-w-0 flex-col items-start gap-4">
          <p className="m-0">{jakZalatwic}</p>
          <PrzyciskLink href={trasy.ViewCaseGuide({ idSprawy: sprawa.idSprawy, z: pochodzenie })} wariant="glowny">
            {t.zobaczInstrukcje}
          </PrzyciskLink>
        </div>
      </Karta>
    </div>
  );
}
