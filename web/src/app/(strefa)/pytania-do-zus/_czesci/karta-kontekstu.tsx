import type { ReactNode } from 'react';
import '@/domena/pytania-zus/rozszerzenia-typow';
import { rodzajUbezpieczeniaZProfilu } from '@/domena/pytania-zus/kontekst';
import type { KontekstPytaniaDoZus } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { Stos } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewZusQuestion;

export interface WierszDanych {
  etykieta: string;
  wartosc: ReactNode;
  opis?: ReactNode;
}

/** Lista `dl` ze wzorów pytania do ZUS: etykieta zwykłym krojem, wartość pogrubiona, opcjonalny opis pod wartością. */
export function DanePytania({ wiersze }: { wiersze: WierszDanych[] }) {
  return (
    <dl className="m-0 grid min-w-0 gap-3">
      {wiersze.map((w) => (
        <div key={w.etykieta} className="flex min-w-0 flex-wrap gap-x-4 gap-y-1">
          <dt className="min-w-0 shrink-0 basis-60 text-body text-ink">{w.etykieta}</dt>
          <div className="grid min-w-0 grow basis-48 gap-1">
            <dd className="m-0 min-w-0 break-words text-body-strong text-ink-strong">{w.wartosc}</dd>
            {w.opis ? <dd className="m-0 min-w-0 text-small text-ink-muted">{w.opis}</dd> : null}
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Wiersze kontekstu sprawy (R1). */
export function wierszeSprawy(sprawa: NonNullable<KontekstPytaniaDoZus['sprawa']>): WierszDanych[] {
  const wiersze: WierszDanych[] = [
    { etykieta: t.pola.idSprawy, wartosc: sprawa.idSprawy },
    { etykieta: t.pola.tytulSprawy, wartosc: sprawa.tytul },
    { etykieta: t.pola.etap, wartosc: t.etykiety.etapy[sprawa.etap] },
    { etykieta: t.pola.status, wartosc: teksty.wspolne.etykiety.statusySpraw[sprawa.status] },
  ];
  if (sprawa.termin) {
    const data = formatujDate(sprawa.termin);
    wiersze.push({ etykieta: t.pola.termin, wartosc: sprawa.terminSzacowany ? t.terminSzacowany({ data }) : data });
  }
  return wiersze;
}

/** Wiersze kontekstu profilu wysyłającego rodzica (R1). */
export function wierszeProfilu(kontekst: KontekstPytaniaDoZus): WierszDanych[] {
  const p = kontekst.profil;
  const wiersze: WierszDanych[] = [];
  if (p.formaZatrudnienia) {
    wiersze.push({ etykieta: t.pola.formaZatrudnienia, wartosc: t.etykiety.formyZatrudnienia[p.formaZatrudnienia] });
  }
  const rodzaj =
    kontekst.rodzajUbezpieczeniaChorobowego ??
    (p.ubezpieczenieChorobowe === undefined
      ? undefined
      : rodzajUbezpieczeniaZProfilu(p.formaZatrudnienia, p.ubezpieczenieChorobowe));
  if (rodzaj) wiersze.push({ etykieta: t.pola.ubezpieczenieChorobowe, wartosc: t.etykiety.ubezpieczenieChorobowe[rodzaj] });
  if (p.platnikZasilku) {
    const etykieta =
      p.platnikZasilku === 'platnik-skladek' && p.formaZatrudnienia === 'umowa-o-prace'
        ? t.etykiety.pracodawca
        : t.etykiety.platnicyZasilku[p.platnikZasilku];
    const nazwa = kontekst.nazwaPlatnikaZasilku;
    wiersze.push({
      etykieta: t.pola.platnikZasilku,
      wartosc: nazwa && p.platnikZasilku === 'platnik-skladek' ? t.platnikZNazwa({ platnik: etykieta, nazwa }) : etykieta,
    });
  }
  if (p.dataPorodu) wiersze.push({ etykieta: t.pola.dataPorodu, wartosc: formatujDate(p.dataPorodu) });
  else if (p.przewidywanyTerminPorodu) {
    wiersze.push({ etykieta: t.pola.przewidywanyTerminPorodu, wartosc: formatujDate(p.przewidywanyTerminPorodu) });
  }
  if (p.liczbaDzieci !== undefined) wiersze.push({ etykieta: t.pola.liczbaDzieci, wartosc: String(p.liczbaDzieci) });
  if (p.przyjecie) {
    wiersze.push({ etykieta: t.pola.formaPrzyjecia, wartosc: t.etykiety.formyPrzyjecia[p.przyjecie.forma] });
    wiersze.push({ etykieta: t.pola.dataPrzyjecia, wartosc: formatujDate(p.przyjecie.dataPrzyjecia) });
  }
  return wiersze;
}

export interface KartaKontekstuProps {
  kontekst: KontekstPytaniaDoZus;
  tytul: string;
  stanNa: string;
  notatka: string;
}

/** Karta kontekstu sprawy i profilu: przed wysłaniem (ViewZusQuestion) i w chwili wysłania (ViewZusQuestionSent). */
export function KartaKontekstu({ kontekst, tytul, stanNa, notatka }: KartaKontekstuProps) {
  const profil = wierszeProfilu(kontekst);
  return (
    <Karta tytul={tytul} bezLinii>
      <Stos odstep={4}>
        <p className="m-0 text-body">{stanNa}</p>
        {kontekst.sprawa ? (
          <section className="grid gap-3">
            <h3 className="m-0 text-body-strong text-ink">{t.naglowekSprawy}</h3>
            <DanePytania wiersze={wierszeSprawy(kontekst.sprawa)} />
          </section>
        ) : null}
        <section className="grid gap-3">
          <h3 className="m-0 text-body-strong text-ink">{t.naglowekProfilu}</h3>
          {profil.length > 0 ? <DanePytania wiersze={profil} /> : <p className="m-0 text-body">{t.brakDanychProfilu}</p>}
        </section>
        <Notatka>
          <p className="m-0">{notatka}</p>
        </Notatka>
      </Stos>
    </Karta>
  );
}
