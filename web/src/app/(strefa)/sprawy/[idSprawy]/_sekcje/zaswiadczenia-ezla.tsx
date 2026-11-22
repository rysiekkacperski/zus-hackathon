'use client';

// Sekcja ViewCaseDetails „zaswiadczenia-ezla” w liście sekcjeSprawy (kontrakt, sekcja 12.4; wzory P16-11, P06-14).
// Właściciel: u14. Teksty: teksty.ViewCaseDetails.sekcjaZaswiadczeniaEzla. Sprawy K24 Zasiłek chorobowy w ciąży
// i K25 Świadczenie rehabilitacyjne w ciąży dostają podsumowanie zaświadczeń z akcją otwarcia listy.
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { okresNiezdolnosci } from '@/domena/zasilki/okres-zasilkowy';
import { teksty } from '@/teksty';
import { useWyliczeniaEzlaKonta } from '../../../zaswiadczenia-e-zla/_czesci/wyliczenia';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaZaswiadczeniaEzla;
const SPRAWY_EZLA = new Set(['K24', 'K25']);

export function SekcjaZaswiadczeniaEzla({ sprawa }: PropsSlotu<'sekcja'>) {
  const dane = useWyliczeniaEzlaKonta();
  if (!SPRAWY_EZLA.has(sprawa.idPozycji ?? sprawa.idSprawy) || !dane?.kopia || !dane.wyliczenia) return null;
  const { wyliczenia, kopia } = dane;
  const { okres, wynagrodzenie, wariant, zaswiadczenia } = wyliczenia;

  const pozycje: { etykieta: string; wartosc: string }[] = [];
  if (zaswiadczenia.length > 0) {
    pozycje.push({ etykieta: t.liczba, wartosc: t.liczbaWartosc({ liczba: zaswiadczenia.length, zKodemB: wyliczenia.liczbaZKodemB }) });
    if (okres && okres.zaswiadczenia.length > 0) {
      pozycje.push({
        etykieta: t.okres,
        wartosc: t.okresWartosc({
          wykorzystane: okres.wykorzystane,
          limit: okres.limit ?? 270,
          koniec: okres.dataWyczerpania ? formatujDate(okres.dataWyczerpania) : '-',
        }),
      });
    }
    if (wariant === 'wynagrodzenie' && wynagrodzenie) {
      pozycje.push({
        etykieta: t.zasilek,
        wartosc: wynagrodzenie.zasilekOd
          ? t.zasilekOd({ data: formatujDate(wynagrodzenie.zasilekOd), limit: wynagrodzenie.limit })
          : t.zasilekPracodawca({ wykorzystane: wynagrodzenie.wykorzystane, limit: wynagrodzenie.limit }),
      });
    } else if (wariant === 'zasilek-od-pierwszego-dnia') {
      pozycje.push({ etykieta: t.zasilek, wartosc: t.zasilekOdPierwszego });
    }
    pozycje.push({
      etykieta: t.ostatnie,
      wartosc: t.ostatnieWartosc({ numer: zaswiadczenia[0].seriaINumer, okres: okresNiezdolnosci(zaswiadczenia[0]) }),
    });
  }

  return (
    <Karta tytul={t.tytul}>
      <div className="flex flex-col gap-4">
        <p className="m-0 text-small text-ink-muted">{t.stanNa({ data: formatujDate(kopia.odczytano) })}</p>
        {pozycje.length > 0 ? <ListaDefinicji pozycje={pozycje} /> : <p className="m-0">{t.brak}</p>}
        <PrzyciskLink href={trasy.ViewSickLeaveList()} wariant="drugorzedny" szerokosc="pelna">
          {t.zobacz}
        </PrzyciskLink>
      </div>
    </Karta>
  );
}
