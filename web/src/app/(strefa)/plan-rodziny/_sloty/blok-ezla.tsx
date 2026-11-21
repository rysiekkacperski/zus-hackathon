'use client';

// Slot ViewFamilyPlan „blok-ezla” w liście slotyNadPlanem (kontrakt, sekcja 12.4; wzory P16-10, P17-01).
// Właściciel: u14. Teksty: teksty.ViewFamilyPlan.blokEzla. Blok pokazuje się w etapie Ciąża: podsumowanie
// zaświadczeń e-ZLA z akcją otwarcia listy, a kontu z tytułem osoby prowadzącej pozarolniczą działalność
// także stan rozliczeń składek z akcją otwarcia stanu rozliczeń.
import { formatujDate, formatujKwote } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { kwotaDlaStraznika } from '@/domena/zasilki/stan-rozliczen';
import { teksty } from '@/teksty';
import { useStanRozliczenKonta } from '../../stan-rozliczen-skladek/_czesci/wyliczenia';
import { useWyliczeniaEzlaKonta } from '../../zaswiadczenia-e-zla/_czesci/wyliczenia';
import type { PropsSlotu } from './typy';

const t = teksty.ViewFamilyPlan.blokEzla;

export function SlotBlokEzla({ kontekst }: PropsSlotu<'nadPlanem'>) {
  const ezla = useWyliczeniaEzlaKonta();
  const rozliczenia = useStanRozliczenKonta();
  const etap = kontekst.rodzina.plan?.biezacyEtap;
  const wCiazy = etap ? etap === 'ciaza' : !kontekst.rodzina.daneCiazy?.dataPorodu;
  if (!wCiazy || !ezla?.kopia || !ezla.wyliczenia) return null;

  const { wyliczenia } = ezla;
  const okres = wyliczenia.okres;
  const stan = rozliczenia?.stanNaDzienOdczytu ?? null;

  return (
    <div className="flex flex-col gap-7.5">
      {rozliczenia?.dzialalnosc ? (
        <Karta tytul={t.tytulRozliczen}>
          <div className="flex flex-col gap-4">
            {stan ? (
              <p className="m-0">
                {t.rozliczeniaNa({ data: formatujDate(stan.dzien), kwota: formatujKwote(kwotaDlaStraznika(stan)) })}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-4">
              <PrzyciskLink href={trasy.ViewContributionBalance()} wariant="drugorzedny">
                {t.zobaczRozliczenia}
              </PrzyciskLink>
            </div>
          </div>
        </Karta>
      ) : null}
      <Karta tytul={t.tytulEzla}>
        <div className="flex flex-col gap-4">
          <p className="m-0">
            {okres && okres.zaswiadczenia.length > 0
              ? t.podsumowanie({
                  liczba: wyliczenia.zaswiadczenia.length,
                  wykorzystane: okres.wykorzystane,
                  limit: okres.limit ?? 270,
                })
              : t.podsumowanieBezOkresu({ liczba: wyliczenia.zaswiadczenia.length })}
          </p>
          <div className="flex flex-wrap gap-4">
            <PrzyciskLink href={trasy.ViewSickLeaveList()} wariant="drugorzedny">
              {t.zobaczEzla}
            </PrzyciskLink>
          </div>
        </div>
      </Karta>
    </div>
  );
}
