'use client';

// ViewApplicationList: Twoje wnioski (historyjka 3.6.1.4.1, wzory Twoje-wnioski, P06-17, P06-18). Właściciel: u12.
// Wnioski zalogowanego konta złożone, przygotowane albo wysłane w przewodniku, od najnowszego, z adresatem,
// datą i statusem; wybór wniosku otwiera ViewCaseDetails sprawy wniosku. Pusta lista: komunikat 0257.
import { useMemo } from 'react';
import { useKontekstRodziny } from '@/dane/magazyn/hooki';
import { dataZeZnacznika, formatujDate, formatujDateICzas, porownajDaty } from '@/domena/daty';
import type { AdresatWniosku, DaneZKontaZus, DataISO, Wniosek } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Tabela } from '@/komponenty/tabela';
import { teksty } from '@/teksty';
import { tytulSprawy } from '@/app/(strefa)/plan-rodziny/_czesci/sprawy';

const t = teksty.ViewApplicationList;
const STANY_NA_LISCIE: readonly Wniosek['stan'][] = ['przygotowany', 'wyslany', 'zlozony'];

function adresatWniosku(w: Wniosek): AdresatWniosku {
  if (w.adresat) return w.adresat;
  switch (w.rodzaj) {
    case 'zam':
      return w.stan === 'przygotowany' ? 'platnik-skladek' : 'zus';
    case 'zas-53':
      return 'zus';
    case 'odpis-aktu-urodzenia':
      return 'rejestr-stanu-cywilnego';
    default:
      return 'pracodawca';
  }
}

function dataWniosku(w: Wniosek): DataISO {
  if (w.dataZlozenia) return w.dataZlozenia;
  if ('dataPrzygotowania' in w && w.dataPrzygotowania) return w.dataPrzygotowania;
  return dataZeZnacznika(w.zaktualizowano);
}

function nazwaWniosku(w: Wniosek): string {
  if (w.rodzaj === 'odpis-aktu-urodzenia' && w.rodzajOdpisu) return t.rodzajeOdpisu[w.rodzajOdpisu];
  if ((w.rodzaj === 'urlop-do-pracodawcy' || w.rodzaj === 'wniosek-ojca-o-urlop') && w.podrodzaj) {
    return t.podrodzajeUrlopu[w.podrodzaj];
  }
  return t.rodzaje[w.rodzaj];
}

function statusWniosku(w: Wniosek, adresat: AdresatWniosku, kopia: DaneZKontaZus | null): { tekst: string; zZus: boolean } {
  if (adresat === 'zus') {
    const zZus = kopia?.wnioski.find((wz) => wz.idWnioskuPrzewodnika === w.idWniosku);
    if (zZus) {
      if (zZus.status === 'odmowa') return { tekst: t.statusy.odmowa, zZus: true };
      return { tekst: zZus.status === 'przyznanie' ? t.statusy.zalatwiona : t.statusy.wTrakcie, zZus: true };
    }
    return { tekst: t.statusy.wTrakcie, zZus: false };
  }
  if (adresat === 'platnik-skladek') return { tekst: t.statusy.przygotowany, zZus: false };
  if (adresat === 'pracodawca') return { tekst: t.statusy.wyslany, zZus: false };
  return { tekst: t.statusy.zlozony, zZus: false };
}

export function WidokListyWnioskow() {
  const kontekst = useKontekstRodziny();

  const wnioski = useMemo(() => {
    if (!kontekst) return [];
    return kontekst.rodzina.wnioski
      .filter((w) => w.konto === kontekst.konto.pesel && STANY_NA_LISCIE.includes(w.stan))
      .map((w) => ({ wniosek: w, data: dataWniosku(w) }))
      .sort((a, b) => porownajDaty(b.data, a.data) || b.wniosek.zaktualizowano.localeCompare(a.wniosek.zaktualizowano));
  }, [kontekst]);

  const naglowek = (
    <NaglowekStrony
      tytul={t.naglowek}
      powrot={false}
      wstep={kontekst ? teksty.wspolne.stanNa({ data: formatujDateICzas(kontekst.teraz) }) : undefined}
    />
  );

  const pusta = (
    <StanPusty
      ikona="wnioski"
      rolaStatus
      akcja={
        <PrzyciskLink wariant="drugorzedny" href={sciezkaWidoku('ViewFamilyPlan')}>
          {t.przejdzDoPlanu}
        </PrzyciskLink>
      }
    >
      {teksty.komunikaty['0257']}
    </StanPusty>
  );

  return (
    <>
      {naglowek}
      <Karta tytul={t.tytulKarty} bezLinii>
        <div className="flex flex-col gap-6">
          <p className="m-0 text-body">
            {t.licznik} <strong>{wnioski.length}</strong>
          </p>
          {!kontekst || wnioski.length === 0 ? (
            pusta
          ) : (
            <>
              <Tabela
                podpis={t.podpis}
                etykietaPrzewijania={t.przewijanie}
                kolumny={[
                  { klucz: 'wniosek', naglowek: t.kolumny.wniosek, tytulowa: true },
                  { klucz: 'adresat', naglowek: t.kolumny.adresat },
                  { klucz: 'data', naglowek: t.kolumny.data },
                  { klucz: 'status', naglowek: t.kolumny.status },
                ]}
                wiersze={wnioski.map(({ wniosek, data }) => {
                  const adresat = adresatWniosku(wniosek);
                  const status = statusWniosku(wniosek, adresat, kontekst.daneZusKonta);
                  const sprawa = kontekst.rodzina.plan?.pozycje.find((p) => p.idSprawy === wniosek.idSprawy);
                  const tytul = sprawa ? tytulSprawy(kontekst.katalog, sprawa) : null;
                  return {
                    id: wniosek.idWniosku,
                    wniosek: (
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="font-semibold">
                          <Odnosnik
                            href={sciezkaWidoku('ViewCaseDetails', { idSprawy: wniosek.idSprawy })}
                            pochodzenie="wnioski"
                          >
                            {nazwaWniosku(wniosek)}
                          </Odnosnik>
                        </span>
                        {tytul ? <span className="text-body">{t.sprawa({ tytul })}</span> : null}
                      </span>
                    ),
                    adresat: t.adresaci[adresat],
                    data: formatujDate(data),
                    status: (
                      <span className="flex flex-col gap-1">
                        <span className="font-semibold text-ink-strong">{status.tekst}</span>
                        {status.zZus ? <span className="text-small">{t.statusZDanychZus}</span> : null}
                      </span>
                    ),
                  };
                })}
              />
              <Notatka>
                <p className="m-0">{t.nota}</p>
              </Notatka>
            </>
          )}
        </div>
      </Karta>
    </>
  );
}
