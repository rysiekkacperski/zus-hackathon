'use client';

// Sekcja ViewCaseGuide „akcja-kalkulatora” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u20.
// Wejście do zintegrowanego kalkulatora z instrukcji sprawy (ANALIZY/12 R18): K07, K08 (poród) oraz K31, K32 (przyjęcie)
// otwierają wynik z danymi profilu, gdy profil ma datę porodu albo dane przyjęcia, a w przeciwnym razie dane wejściowe;
// K10 otwiera wynik z arkuszem podziału urlopów, K37 wynik z arkuszem łączenia z pracą.
import { PrzyciskLink } from '@/komponenty/przycisk';
import type { IdPozycji } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaKalkulatora;
const SPRAWY_WYNIKU: readonly IdPozycji[] = ['K07', 'K08', 'K31', 'K32'];

export function SekcjaAkcjaKalkulatora({ sprawa, kontekst }: PropsSlotu<'akcja'>) {
  const id = sprawa.idPozycji;
  if (id === null) return null;
  const parametr = `sprawa=${encodeURIComponent(sprawa.idSprawy)}`;

  if (id === 'K10') {
    return (
      <PrzyciskLink wariant="drugorzedny" href={`/kalkulator-zasilku/wynik?${parametr}&arkusz=podzial-urlopow`}>
        {t.ulozUrlopy}
      </PrzyciskLink>
    );
  }
  if (id === 'K37') {
    return (
      <PrzyciskLink wariant="drugorzedny" href={`/kalkulator-zasilku/wynik?${parametr}&arkusz=laczenie-z-praca`}>
        {t.polaczZPraca}
      </PrzyciskLink>
    );
  }
  if (!SPRAWY_WYNIKU.includes(id)) return null;

  const daneCiazy = kontekst.rodzina.daneCiazy;
  const przyjecie = id === 'K31' || id === 'K32';
  const profilKompletny = przyjecie
    ? daneCiazy?.przyjecie !== undefined
    : daneCiazy?.dataPorodu !== undefined || daneCiazy?.przewidywanyTerminPorodu !== undefined;
  const cel = profilKompletny ? '/kalkulator-zasilku/wynik' : '/kalkulator-zasilku';
  return (
    <PrzyciskLink wariant="drugorzedny" href={`${cel}?${parametr}`}>
      {t.policzZasilek}
    </PrzyciskLink>
  );
}
