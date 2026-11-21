'use client';

// Wiadomość e-mail albo SMS w skrzynce demonstracyjnej (ViewDemoInbox, u18), według wzorów cz1/P09-01 i P09-02.
import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatujDateICzas } from '@/komponenty/format';
import { Ikona } from '@/komponenty/ikona';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Przycisk } from '@/komponenty/przycisk';
import { Znaczek } from '@/komponenty/znaczek';
import '@/domena/przypomnienia/rozszerzenia-typow';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { adresKrotkiSms, trescPrzypomnienia } from '@/domena/przypomnienia/tresc';
import type { Katalog, Powiadomienie } from '@/domena/typy';
import { teksty } from '@/teksty';

const t = teksty.ViewDemoInbox;

/** Temat i treść do podglądu: przypomnienie zaplanowane składa się z bieżącym tytułem sprawy z katalogu. */
export function podgladWiadomosci(p: Powiadomienie, katalog: Katalog): { temat?: string; tresc: string } {
  const przypomnienie = p.rodzaj === 'przypomnienie-przed-terminem' || p.rodzaj === 'przypomnienie-w-dniu-terminu';
  if (!przypomnienie || p.statusDoreczenia === 'wyslane' || p.idSprawy === undefined || p.termin === undefined) {
    return { temat: p.temat, tresc: p.tresc };
  }
  return trescPrzypomnienia({
    rodzaj: p.rodzaj as 'przypomnienie-przed-terminem' | 'przypomnienie-w-dniu-terminu',
    kanal: p.kanal,
    idSprawy: p.idSprawy,
    tytul: tytulSprawy(katalog, p.idSprawy),
    termin: p.termin,
    liczbaDni: p.liczbaDni ?? 0,
    koszt: p.kosztSpoznienia,
  });
}

/** Treść z adresem instrukcji sprawy zamienionym na odnośnik do ViewCaseGuide. */
function TrescZOdnosnikiem({ p, tresc }: { p: Powiadomienie; tresc: string }): ReactNode {
  const adresy = [p.adresInstrukcji, p.idSprawy ? adresKrotkiSms(p.idSprawy) : undefined].filter(
    (a): a is string => Boolean(a),
  );
  const adres = adresy.find((a) => tresc.includes(a));
  if (adres === undefined || p.adresInstrukcji === undefined) return tresc;
  const indeks = tresc.indexOf(adres);
  return (
    <>
      {tresc.slice(0, indeks)}
      <Link href={p.adresInstrukcji} className="break-all text-brand underline hover:text-brand-deep">
        {adres}
      </Link>
      {tresc.slice(indeks + adres.length)}
    </>
  );
}

export function Wiadomosc({ p, onOdczytana }: { p: Powiadomienie; onOdczytana: (id: string) => void }) {
  const idTytulu = `wiadomosc-${p.id}`;
  const data = formatujDateICzas(p.wyslano ?? p.planowanaWysylka);
  const rodzaj = t.rodzaje[p.rodzaj];
  const nieodczytana = p.statusOdczytu === 'nieodczytane';
  const email = p.kanal === 'email';

  return (
    <article aria-labelledby={idTytulu} className="box-border flex min-w-0 flex-col gap-4 rounded-sm border border-line bg-surface-card p-5">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <Ikona nazwa={email ? 'email' : 'telefon'} className="text-brand-decor" />
        <p className="m-0 min-w-0 flex-1 text-small-strong text-ink">
          {t.kanaly[p.kanal]}: {rodzaj}
        </p>
        {nieodczytana ? <Znaczek>{t.nieodczytana}</Znaczek> : null}
      </div>
      <ListaDefinicji
        szerokoscEtykiety="waska"
        pozycje={[
          ...(email ? [{ etykieta: t.od, wartosc: teksty.PowiadomieniaPrzypomnienia.nadawca }] : []),
          { etykieta: t.do, wartosc: p.adresat },
          { etykieta: t.data, wartosc: data },
        ]}
      />
      <h3 id={idTytulu} className={email ? 'm-0 text-section-title text-ink' : 'sr-only'}>
        {email ? (p.temat ?? rodzaj) : `${rodzaj}, ${data}`}
      </h3>
      <p className={email ? 'm-0 text-body' : 'm-0 rounded-sm bg-surface-sunken p-4 text-body'}>
        <TrescZOdnosnikiem p={p} tresc={p.tresc} />
      </p>
      {email ? null : <p className="m-0 text-small text-ink-muted">{t.liczbaZnakow({ liczba: p.tresc.length })}</p>}
      {nieodczytana ? (
        <div>
          <Przycisk wariant="tlo" type="button" onClick={() => onOdczytana(p.id)}>
            {t.oznaczOdczytana}
          </Przycisk>
        </div>
      ) : null}
    </article>
  );
}
