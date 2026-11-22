'use client';

// 3.9.2.1.3: komunikaty o rezygnacji z dalszej części zasiłku po wniosku ZAM matki wyłącznie o 14 tygodni,
// na ekranie ViewZamSent (0292, przejście do eZUS) i ViewZamForPayer (0261, przejście do planu rodziny).
import { formatujDate } from '@/domena/daty';
import type { StanRodziny, WniosekZam } from '@/domena/typy';
import { rezygnacjaPoZamZa14Tygodni } from '@/domena/wnioski/rezygnacja';
import { Komunikat } from '@/komponenty/komunikat';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const t = teksty.ViewMaternityResignation;

interface Props {
  wniosek: WniosekZam;
  rodzina: StanRodziny | null | undefined;
}

function rezygnacjaMatki({ wniosek, rodzina }: Props) {
  if (!rodzina || rodzina.daneRodziny.rodzicKonta !== 'matka') return null;
  if (wniosek.konto === rodzina.daneRodziny.drugiRodzic.pesel) return null;
  return rezygnacjaPoZamZa14Tygodni(wniosek, rodzina.daneCiazy?.dataPorodu);
}

/** ViewZamSent: komunikat 0292 z datą rezygnacji, ojcem z profilu rodziny, terminem i przejściem do eZUS. */
export function KomunikatRezygnacjiPoWyslaniuZam(props: Props) {
  const rezygnacja = rezygnacjaMatki(props);
  if (rezygnacja === null || !props.rodzina) return null;
  const ojciec = props.rodzina.daneRodziny.drugiRodzic;
  const imieINazwiskoOjca = [ojciec.imie, ojciec.nazwisko].filter(Boolean).join(' ') || t.ojciecDziecka;
  return (
    <Komunikat
      kod="0292"
      parametry={{
        imieINazwiskoOjca,
        dataRezygnacji: formatujDate(rezygnacja.dataRezygnacji),
        termin: formatujDate(rezygnacja.termin),
      }}
      akcje={
        <PrzyciskLink href={trasy.ViewEzusZas23()} wariant="drugorzedny" nowaKarta>
          {t.przejdzDoEzus}
        </PrzyciskLink>
      }
    />
  );
}

/** ViewZamForPayer: komunikat 0261 o rezygnacji u zleceniodawcy z przejściem do planu rodziny. */
export function KomunikatRezygnacjiDlaPlatnika(props: Props) {
  if (rezygnacjaMatki(props) === null) return null;
  return (
    <Komunikat
      kod="0261"
      akcje={
        <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
          {t.przejdzDoPlanu}
        </PrzyciskLink>
      }
    />
  );
}
