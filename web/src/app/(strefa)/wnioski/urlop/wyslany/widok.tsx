'use client';

// ViewLeaveRequestSent (u32): potwierdzenie wysłania wniosku o urlop do pracodawcy (0135, 0199, 0200).
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { ReactNode } from 'react';
import { komunikatWyslania, terminOdmowyLaczenia } from '@/domena/wnioski/wysylka-do-pracodawcy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { teksty } from '@/teksty';
import { DaneNaTle, useKreatorUrlopu } from '../_czesci/kreator';

const t = teksty.ViewLeaveRequestSent;
const tf = teksty.ViewLeaveRequestForm;

export function WidokWyslanegoWnioskuOUrlop() {
  const stan = useKreatorUrlopu();
  if (stan === null) return null;
  const { wniosek, dane } = stan;
  if (!wniosek || wniosek.stan !== 'wyslany' || !wniosek.dataZlozenia) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} />
        <StanPusty ikona="wnioski" className="mt-7.5">{t.brakWniosku}</StanPusty>
      </>
    );
  }
  const kod = komunikatWyslania(wniosek);
  const data = formatujDate(wniosek.dataZlozenia);
  const ochrona = wniosek.dataPoczatkuOchrony ? formatujDate(wniosek.dataPoczatkuOchrony) : data;
  const komunikat =
    kod === '0199' ? (
      <Komunikat kod="0199" parametry={{ data, dataPoczatkuOchrony: ochrona }} />
    ) : kod === '0200' ? (
      <Komunikat kod="0200" parametry={{ data }} />
    ) : (
      <Komunikat kod="0135" parametry={{ data }} />
    );

  const pozycje: { etykieta: string; wartosc: ReactNode }[] = [
    { etykieta: t.rodzaj, wartosc: tf.nazwyWnioskow[wniosek.podrodzaj ?? 'macierzynski-z-rodzicielskim'] },
  ];
  if (wniosek.laczenie) {
    const l = wniosek.laczenie;
    pozycje.push({ etykieta: t.wymiarPracy, wartosc: `${l.wymiarPracy} ${tf.procentEtatu}` });
    pozycje.push({ etykieta: t.okresLaczenia, wartosc: `${formatujDate(l.okres.od)} – ${formatujDate(l.okres.do)}` });
    pozycje.push({ etykieta: t.czescZWydluzenia, wartosc: wniosek.oswiadczenia.laczenieCzesciZWydluzenia ? tf.tak : tf.nie });
    pozycje.push({ etykieta: t.wydluzenie, wartosc: tf.liczbaDni({ n: l.dniWydluzenia }) });
    pozycje.push({ etykieta: t.ostatniDzien, wartosc: formatujDate(l.ostatniDzienUrlopu) });
  } else {
    pozycje.push({
      etykieta: t.okresy,
      wartosc: (
        <ul className="m-0 list-none p-0">
          {wniosek.okresy.map((o, i) => (
            <li key={i}>
              {`${tf.rodzajeUrlopu[o.rodzajUrlopu]}: ${formatujDate(o.od)} – ${formatujDate(o.do)}${o.stawka !== undefined ? `, ${tf.stawkaPodstawy({ stawka: formatujProcent(o.stawka) })}` : ''}`}
            </li>
          ))}
        </ul>
      ),
    });
  }
  pozycje.push({ etykieta: t.pracownik, wartosc: dane.imieINazwisko });
  if (dane.dziecko?.dataUrodzenia) {
    const imie = [dane.dziecko.imie, dane.dziecko.nazwisko].filter(Boolean).join(' ');
    pozycje.push({ etykieta: t.dziecko, wartosc: imie ? tf.dzieckoUr({ imieINazwisko: imie, data: formatujDate(dane.dziecko.dataUrodzenia) }) : formatujDate(dane.dziecko.dataUrodzenia) });
  }
  pozycje.push({ etykieta: t.adresat, wartosc: t.adresatOpis({ nazwa: dane.pracodawca ?? '', email: wniosek.emailPracodawcy ?? '' }) });
  pozycje.push({ etykieta: t.dataZlozenia, wartosc: data });
  pozycje.push({ etykieta: t.poczatekOchrony, wartosc: ochrona });
  if (wniosek.potwierdzenie) pozycje.push({ etykieta: t.potwierdzenie, wartosc: wniosek.potwierdzenie });

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} powrot={false} />
      <div className="mt-7.5 flex flex-col gap-7.5">
        {komunikat}
        <div className="flex flex-wrap items-start gap-7.5">
          <div className="flex min-w-0 grow-999 basis-140 flex-col gap-7.5">
            <Karta tytul={t.szczegolyTytul} bezLinii>
              <DaneNaTle poziomo={false} pozycje={pozycje} />
              <p className="m-0 mt-4">{wniosek.podrodzaj === 'czesc-przed-porodem' ? t.zapisanoPrzedPorodem : t.zapisano}</p>
            </Karta>
            <div className="flex flex-wrap gap-4">
              <PrzyciskLink href={trasy.ViewApplicationList()} wariant="drugorzedny">
                {t.twojeWnioski}
              </PrzyciskLink>
              <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
                {t.planRodziny}
              </PrzyciskLink>
            </div>
          </div>
          <aside aria-label={t.coDalejTytul} className="flex min-w-0 max-w-84 grow basis-84 flex-col gap-7.5">
            <Karta tytul={t.coDalejTytul} bezLinii>
              <p className="m-0">
                {wniosek.podrodzaj === 'laczenie-z-praca'
                  ? t.coDalejLaczenie({ data: formatujDate(terminOdmowyLaczenia(wniosek.dataZlozenia)) })
                  : t.coDalej}
              </p>
            </Karta>
            {kod === '0199' ? (
              <Karta tytul={t.dlaczegoPozniejTytul} bezLinii>
                <p className="m-0">{t.dlaczegoPozniej}</p>
              </Karta>
            ) : null}
          </aside>
        </div>
      </div>
    </>
  );
}
