'use client';

// Sekcja ViewCaseGuide „akcja-odpisu” w liście sekcjeInstrukcji (kontrakt, sekcja 12.4). Właściciel: u29.
// Sprawa K36 Odpis aktu urodzenia dziecka: akcja wniosku o odpis, 0037 bez potwierdzonej daty porodu,
// „Twój wniosek” i „Złóż kolejny wniosek o odpis” po złożeniu (3.9.7.1.1, wzory P27-01, P27-02, P27-14).
import { useId, useMemo, useState } from 'react';
import { sprawdzWejscieDoOdpisu } from '@/domena/wnioski/odpis';
import type { WniosekOOdpis } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { DanePytania } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
import { teksty } from '@/teksty';
import type { PropsSlotu } from './typy';

const t = teksty.ViewCaseGuide.sekcjaAkcjaOdpisu;
const tw = teksty.ViewBirthCertificateRequest;

export function SekcjaAkcjaOdpisu({ sprawa, kontekst, pochodzenie }: PropsSlotu<'akcja'>) {
  const idKomunikatu = useId();
  const [pokazBrakDaty, setPokazBrakDaty] = useState(false);
  const { rodzina, konto } = kontekst;
  const ostatni = useMemo(
    () =>
      rodzina.wnioski
        .filter((w): w is WniosekOOdpis => w.rodzaj === 'odpis-aktu-urodzenia' && w.stan === 'zlozony' && w.konto === konto.pesel)
        .sort((a, b) => (a.zaktualizowano < b.zaktualizowano ? 1 : -1))[0],
    [rodzina.wnioski, konto.pesel],
  );

  if (sprawa.idPozycji !== 'K36') return null;

  const brakDaty = sprawdzWejscieDoOdpisu(rodzina.daneCiazy) === '0037';
  // Niezłożony szkic wniosku tego konta otwiera się do wznowienia z ?wniosek=.
  const szkic = rodzina.wnioski.find(
    (w): w is WniosekOOdpis => w.rodzaj === 'odpis-aktu-urodzenia' && w.stan === 'szkic' && w.konto === konto.pesel,
  );
  const adresWniosku = trasy.ViewBirthCertificateRequest(szkic ? { wniosek: szkic.idWniosku } : undefined);

  return (
    <Karta tytul={t.tytul} bezLinii>
      <Stos odstep={4}>
        {ostatni ? (
          <section className="grid gap-3">
            <h3 className="m-0 text-body-strong text-ink">{t.twojWniosek}</h3>
            <DanePytania
              wiersze={[
                ...(ostatni.rodzajOdpisu ? [{ etykieta: t.rodzaj, wartosc: tw.rodzaj.opcje[ostatni.rodzajOdpisu].etykieta }] : []),
                ...(ostatni.dataZlozenia ? [{ etykieta: t.dataZlozenia, wartosc: formatujDate(ostatni.dataZlozenia) }] : []),
                ...(ostatni.przewidywanyDzienWydania
                  ? [{ etykieta: t.dzienWydania, wartosc: formatujDate(ostatni.przewidywanyDzienWydania) }]
                  : []),
                ...(ostatni.sposobOdbioru ? [{ etykieta: t.odbior, wartosc: tw.odbior.opcje[ostatni.sposobOdbioru].etykieta }] : []),
                ...(ostatni.potwierdzenie ? [{ etykieta: t.numer, wartosc: ostatni.potwierdzenie }] : []),
              ]}
            />
          </section>
        ) : null}
        <Wiersz>
          {brakDaty ? (
            <Przycisk
              wariant={ostatni ? 'drugorzedny' : 'glowny'}
              aria-describedby={pokazBrakDaty ? idKomunikatu : undefined}
              onClick={() => setPokazBrakDaty(true)}
            >
              {ostatni ? t.zlozKolejny : t.zlozWniosek}
            </Przycisk>
          ) : (
            <PrzyciskLink href={adresWniosku} wariant={ostatni ? 'drugorzedny' : 'glowny'}>
              {ostatni ? t.zlozKolejny : t.zlozWniosek}
            </PrzyciskLink>
          )}
          {ostatni ? (
            <Odnosnik href={trasy.ViewApplicationList()} pochodzenie={pochodzenie}>
              {t.zobaczWniosek}
            </Odnosnik>
          ) : null}
        </Wiersz>
        {brakDaty && pokazBrakDaty ? (
          <Komunikat
            id={idKomunikatu}
            kod="0037"
            akcje={
              <PrzyciskLink href={trasy.ViewBirthDate()} wariant="drugorzedny">
                {t.podajDatePorodu}
              </PrzyciskLink>
            }
          />
        ) : null}
        {ostatni ? null : <p className="m-0 text-body text-ink-muted">{t.wPrzewodniku}</p>}
      </Stos>
    </Karta>
  );
}
