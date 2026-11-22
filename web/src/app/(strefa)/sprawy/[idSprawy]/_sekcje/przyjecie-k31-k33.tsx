'use client';

// Sekcja ViewCaseDetails „przyjecie-k31-k33” w liście sekcjeSprawy (kontrakt, sekcja 12.4). Właściciel: u24.
// Wzór P21-11: terminy K31 liczone od daty przyjęcia (gdy kalendarz nie podał drugiego terminu),
// termin K32, komunikat 0092 przy K33, komunikaty 0192 i 0259 bez daty uprawomocnienia
// oraz karta danych przyjęcia dziecka z odnośnikiem do zmiany.
import type { ReactNode } from 'react';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos } from '@/komponenty/uklad';
import { formatujDate, roznicaDni } from '@/domena/daty';
import { terminPoPrzyjeciu } from '@/domena/rodzina/przyjecie';
import type { DataISO, IdPozycji } from '@/domena/typy';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseDetails.sekcjaPrzyjecieK31K33;

const SPRAWY_SEKCJI: readonly IdPozycji[] = ['K05', 'K09', 'K10', 'K31', 'K32', 'K33'];

function TerminZOpisem({ etykieta, data, dzis, opis }: { etykieta: string; data: DataISO; dzis: DataISO; opis: string }) {
  const dni = roznicaDni(dzis, data);
  const ileDni = dni < 0 ? t.terminy.poTerminie : dni === 0 ? t.terminy.dzisiaj : t.terminy.zaDni({ liczba: dni });
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="m-0 text-body-strong">{etykieta}</p>
      <p className="m-0 text-amount text-ink-strong">{formatujDate(data)}</p>
      <p className="m-0">{ileDni}</p>
      <p className="m-0">{opis}</p>
    </div>
  );
}

export function SekcjaPrzyjecieK31K33({ sprawa, termin, kontekst }: PropsSlotu<'sekcja'>) {
  const p = kontekst.rodzina.daneCiazy?.przyjecie;
  const id = sprawa.idPozycji;
  if (p === undefined || id === null || !SPRAWY_SEKCJI.includes(id)) return null;

  const dzis = kontekst.dzis;
  const wyliczony = terminPoPrzyjeciu(id, p, kontekst.katalog);
  const adresZmiany = trasy.ViewProfileChildAdoption({ powrot: 'podsumowanie' });
  const zmiana = (
    <Odnosnik href={adresZmiany} wTekscie>
      {t.terminy.zmien}
    </Odnosnik>
  );

  let karta: ReactNode = null;
  if (id === 'K31' && termin?.drugiTermin === undefined && wyliczony?.termin && wyliczony.drugiTermin) {
    karta = (
      <Karta tytul={t.terminy.tytul} bezLinii>
        <Stos odstep={6}>
          <p className="m-0">{t.terminy.opisK31({ data: formatujDate(p.dataPrzyjecia) })}</p>
          <TerminZOpisem etykieta={t.terminy.wniosekOUrlop} data={wyliczony.termin} dzis={dzis} opis={t.terminy.opisWnioskuOUrlop} />
          <TerminZOpisem etykieta={t.terminy.wariant815} data={wyliczony.drugiTermin} dzis={dzis} opis={t.terminy.opisWariantu815} />
          <ListaDefinicji pozycje={[{ etykieta: t.terminy.skutek, wartosc: t.terminy.trescSkutku }]} />
          <Notatka>
            <p>
              {t.terminy.notatka} {zmiana}
            </p>
          </Notatka>
        </Stos>
      </Karta>
    );
  } else if (id === 'K32' && !termin?.termin && wyliczony?.termin) {
    karta = (
      <Karta tytul={t.terminy.tytul} bezLinii>
        <Stos odstep={6}>
          <p className="m-0">{t.terminy.opisK32({ data: formatujDate(p.dataPrzyjecia) })}</p>
          <TerminZOpisem etykieta={t.terminy.wniosekOZasilek} data={wyliczony.termin} dzis={dzis} opis={t.terminy.opisWnioskuOZasilek} />
          <ListaDefinicji pozycje={[{ etykieta: t.terminy.skutek, wartosc: t.terminy.trescSkutku }]} />
        </Stos>
      </Karta>
    );
  }

  const kodBraku = wyliczony?.kodBrakuTerminu;
  const komunikat =
    id === 'K33' ? (
      <Komunikat kod="0092" />
    ) : kodBraku && termin?.kodBrakuTerminu !== kodBraku ? (
      <Komunikat kod={kodBraku} akcje={zmiana} />
    ) : null;

  return (
    <Stos odstep={7.5}>
      {komunikat}
      {karta}
      <Karta
        tytul={t.dane.tytul}
        bezLinii
        akcje={
          <Odnosnik href={adresZmiany} aria-label={t.dane.zmien}>
            {t.dane.zmien}
          </Odnosnik>
        }
      >
        <ListaDefinicji
          szerokoscEtykiety="waska"
          pozycje={[
            { etykieta: t.dane.formaPrzyjecia, wartosc: t.formy[p.forma] },
            { etykieta: t.dane.dataPrzyjecia, wartosc: formatujDate(p.dataPrzyjecia) },
            { etykieta: t.dane.dataUrodzenia, wartosc: formatujDate(p.dataUrodzeniaDziecka) },
            { etykieta: t.dane.liczbaDzieci, wartosc: String(p.liczbaPrzyjetychDzieci) },
            ...(p.dataUprawomocnienia
              ? [{ etykieta: t.dane.dataUprawomocnienia, wartosc: formatujDate(p.dataUprawomocnienia) }]
              : []),
          ]}
        />
      </Karta>
    </Stos>
  );
}
