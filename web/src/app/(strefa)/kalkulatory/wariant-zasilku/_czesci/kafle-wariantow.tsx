'use client';

import { Ikona } from '@/komponenty/ikona';
import { Przycisk } from '@/komponenty/przycisk';
import { formatujDate } from '@/domena/daty';
import { formatujKwote, formatujProcent } from '@/domena/kwoty';
import type { SzczegolyPorownania, WariantPorownania } from '@/domena/kalkulatory/wariant';
import { teksty } from '@/teksty';

const t = teksty.ViewCalcMaternityVariant;

type Wariant = '81-5' | '100-70';

function Kafel({ id, tytul, opis, children, akcja }: { id: string; tytul: string; opis: string; children: React.ReactNode; akcja: React.ReactNode }) {
  return (
    <article aria-labelledby={id} className="box-border flex min-w-0 grow basis-95 flex-col gap-4 rounded-md bg-surface-page p-6">
      <div>
        <h3 id={id} className="m-0 text-tile-title text-ink">{tytul}</h3>
        <p className="m-0 mt-1 text-body">{opis}</p>
      </div>
      {children}
      {akcja}
    </article>
  );
}

function Kwota({ etykieta, kwota, dopisek }: { etykieta: string; kwota: number; dopisek?: string }) {
  return (
    <div>
      <p className="m-0 text-body-strong">{etykieta}</p>
      <p className="m-0 mt-1 text-amount text-ink-strong">{formatujKwote(kwota)}</p>
      {dopisek ? <p className="m-0 text-body">{dopisek}</p> : null}
    </div>
  );
}

function Suma({ etykieta, kwota }: { etykieta: string; kwota: number }) {
  return (
    <div className="mt-auto border-t border-line-row pt-4">
      <p className="m-0 text-body-strong">{etykieta}</p>
      <p className="m-0 mt-1 text-amount text-ink-strong">{formatujKwote(kwota)}</p>
    </div>
  );
}

function okresTekst(o: { od: string; do: string } | null): string | undefined {
  return o === null ? undefined : t.okres({ od: formatujDate(o.od), do: formatujDate(o.do) });
}

function Podwyzszenie({ w }: { w: WariantPorownania['okresy'][number] }) {
  if (!w.podwyzszona) return null;
  return <p className="m-0 text-body">{t.podwyzszenie({ procent: formatujProcent(w.stawka), kwota: formatujKwote(w.miesiecznieZeStawki) })}</p>;
}

export interface KafleWariantowProps {
  s: SzczegolyPorownania;
  wybrany: Wariant | null;
  zapisywanie: boolean;
  onWybor: (w: Wariant) => void;
}

/** Dwa kafle wariantów (wzory Wariant-zasilku, P14-03, P14-07, P14-10) albo sam kafel 100% i 70% po terminie (P14-12). */
export function KafleWariantow({ s, wybrany, zapisywanie, onWybor }: KafleWariantowProps) {
  const tygRazem = s.tygodnieMacierzynskiego + s.tygodnieRodzicielskiego;
  const [m81, r81] = s.wariant81.okresy;
  const [m100, r70] = s.wariant100i70.okresy;
  // Stawki z odpowiedzi silnika, czyli z katalogu w dniu zdarzenia.
  const st = { s815: formatujProcent(m81.stawka), s100: formatujProcent(m100.stawka), s70: formatujProcent(r70.stawka) };
  const zero = s.tygodnieRodzicielskiego === 0;

  const akcja = (w: Wariant) => {
    if (!s.wariant81Dostepny) return null;
    if (wybrany === w) {
      return (
        <p className="m-0 flex items-center gap-2 text-body-strong text-success-text">
          <Ikona nazwa="sukces" rozmiar={20} />
          {wybrany === '81-5' ? t.twojWybor : t.wybranyWariant}
        </p>
      );
    }
    const etykieta = wybrany === null ? (w === '81-5' ? t.wybierz81(st) : t.wybierz100(st)) : w === '81-5' ? t.zmienNa81(st) : t.zmienNa100(st);
    return (
      <Przycisk wariant="drugorzedny" szerokosc="pelna" zajety={zapisywanie} onClick={() => onWybor(w)}>
        {etykieta}
      </Przycisk>
    );
  };

  const kafel100 = (
    <Kafel id="w10070-tytul" tytul={t.wariant100(st)} opis={t.wariant100Opis} akcja={akcja('100-70')}>
      <Kwota etykieta={t.miesiecznieMacierzynski({ tygodnie: t.tygodnie(s.tygodnieMacierzynskiego) })} kwota={m100.miesiecznie} dopisek={okresTekst(m100.okres)} />
      <Podwyzszenie w={m100} />
      {zero ? (
        <div>
          <p className="m-0 text-body-strong">{t.urlopRodzicielski}</p>
          <p className="m-0 text-body">{t.nieKorzystasz}</p>
        </div>
      ) : (
        <>
          <Kwota etykieta={t.miesiecznieRodzicielski({ tygodnie: t.tygodnie(s.tygodnieRodzicielskiego) })} kwota={r70.miesiecznie} dopisek={okresTekst(r70.okres)} />
          <Podwyzszenie w={r70} />
        </>
      )}
      <Suma etykieta={t.sumaZa({ tygodnie: t.tygodnie(tygRazem) })} kwota={s.wariant100i70.suma} />
    </Kafel>
  );

  if (!s.wariant81Dostepny) return kafel100;

  return (
    <div className="flex flex-wrap items-stretch gap-6">
      <Kafel id="w815-tytul" tytul={t.wariant81(st)} opis={zero ? t.wariant81OpisZero : t.wariant81Opis} akcja={akcja('81-5')}>
        {zero ? (
          <>
            <Kwota etykieta={t.miesiecznieMacierzynski({ tygodnie: t.tygodnie(s.tygodnieMacierzynskiego) })} kwota={m81.miesiecznie} dopisek={okresTekst(m81.okres)} />
            <Kwota etykieta={t.wyrownanieTytul(st)} kwota={s.wariant81.wyrownanie} dopisek={t.jednorazowo} />
          </>
        ) : (
          <>
            <Kwota etykieta={t.miesiecznieprzez({ tygodnie: t.tygodnie(tygRazem) })} kwota={m81.miesiecznie} dopisek={okresTekst(s.okresCaly)} />
            <Podwyzszenie w={r81.podwyzszona ? r81 : m81} />
          </>
        )}
        <Suma etykieta={t.sumaZa({ tygodnie: t.tygodnie(tygRazem) })} kwota={s.wariant81.suma} />
      </Kafel>
      {kafel100}
    </div>
  );
}
