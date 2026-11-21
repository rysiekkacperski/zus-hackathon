'use client';

// ViewInviteAccept (3.3.3.1.1): zaproszenie do planu rodziny na koncie, które otworzyło link.
// Wzory: cz2/P19-03-Przyjecie-zaproszenia, P19-04-Zaproszenie-wygaslo, P19-05-Zaproszenie-wlasne,
// P19-06-Konto-w-innej-rodzinie. Bez aktywnej sesji strażnik ramy prowadzi na ViewGuideStart z powrotem do linku.
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { useDzis, useKonto } from '@/dane/magazyn/hooki';
import { odrzucZaproszenie, przyjmijZaproszenie, usePodgladZaproszenia } from '@/dane/magazyn/operacje/drugi-rodzic';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { stanZgody } from '@/domena/konto/zgoda';
import { ocenLinkZaproszenia } from '@/domena/rodzina/zaproszenia';
import type { KodKomunikatu } from '@/domena/typy';
import { formatujDate } from '@/komponenty/format';
import { Ikona } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { useEkranStartowy } from '@/komponenty/rama/straz-dostepu';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewInviteAccept;

type BladLinku = '0066' | '0067' | '0068';

function KartaBledu({ kod }: { kod: BladLinku }) {
  const ekranStartowy = useEkranStartowy();
  const opis = t.bledy[kod];
  const cel =
    kod === '0066'
      ? ekranStartowy
      : kod === '0067'
        ? sciezkaWidoku('ViewProfileSummary', { tryb: 'rodzina' })
        : sciezkaWidoku('ViewFamilyPlan');
  return (
    <Karta tytul={opis.tytul} bezLinii className="max-w-tresc">
      <div className="flex flex-col gap-6">
        <Komunikat kod={kod} />
        <div className="flex flex-col gap-3">
          {opis.akapity.map((akapit) => (
            <p key={akapit} className="m-0 text-body">
              {akapit}
            </p>
          ))}
        </div>
        <div>
          <PrzyciskLink href={cel} wariant="glowny">
            {opis.akcja}
          </PrzyciskLink>
        </div>
      </div>
    </Karta>
  );
}

export function WidokPrzyjeciaZaproszenia({ params }: { params: PageProps<'/zaproszenie/[token]'>['params'] }) {
  const { token } = use(params);
  const router = useRouter();
  const konto = useKonto();
  const dzis = useDzis();
  const { rodzina, zapraszajacy } = usePodgladZaproszenia(token);
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const [zajety, ustawZajety] = useState(false);

  // Bez konta (sesja w trakcie rozstrzygania) strażnik ramy kieruje na stronę startową z powrotem do linku.
  if (konto === null) return <SzkieletWidoku />;

  const kodLinku = ocenLinkZaproszenia(token, konto, rodzina, dzis);
  const zaproszenie = rodzina?.daneRodziny.zaproszenie;

  function przyjmij() {
    ustawZajety(true);
    const wynik = przyjmijZaproszenie(token, pobierzKontekstOperacji());
    ustawZajety(false);
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return;
    }
    router.push(sciezkaWidoku('ViewFamilyPlan'));
  }

  function odrzuc() {
    if (konto === null) return;
    const wynik = odrzucZaproszenie(token, pobierzKontekstOperacji());
    if (!wynik.ok) {
      ustawBlad(wynik.kod);
      return;
    }
    // R-ODRZUCENIE: rola bez zmian; bez decyzji o zgodzie powitanie, z zapisaną decyzją profil na start.
    const cel = stanZgody(konto.decyzjeOZgodzie) === 'brak-decyzji' ? 'ViewGuideWelcome' : 'ViewProfileZusData';
    router.push(sciezkaWidoku(cel));
  }

  const imie = zapraszajacy?.imie ?? '';
  const imieINazwisko = zapraszajacy ? `${zapraszajacy.imie} ${zapraszajacy.nazwisko}` : '';
  const opisDanychZus = zapraszajacy?.plec === 'mezczyzna' ? t.daneZusOpis.mezczyzna : t.daneZusOpis.kobieta;

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} powrot={false} />
      {kodLinku !== null ? (
        <KartaBledu kod={kodLinku} />
      ) : (
        <div className="flex flex-col gap-7.5">
          {blad ? <Komunikat kod={blad} className="max-w-tresc" /> : null}
          <UkladDwuKolumnowy
            tresc={
              <Karta tytul={t.tytulKarty({ imie })} bezLinii>
                <div className="flex flex-col gap-6">
                  <p className="m-0 text-body">{t.wstep({ imieINazwisko })}</p>
                  <div className="flex flex-col gap-3">
                    <h3 className="m-0 text-body-strong text-ink">{t.poPrzyjeciu}</h3>
                    <ul className="m-0 flex list-none flex-col gap-3 p-0">
                      {t.korzysci.map((korzysc) => (
                        <li key={korzysc} className="flex items-start gap-3">
                          <Ikona nazwa="zaznaczenie" className="mt-0.5 shrink-0 text-brand" />
                          <span className="min-w-0">{korzysc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="m-0 text-body-strong text-ink">{t.daneZus}</h3>
                    <p className="m-0 text-body">{opisDanychZus({ imie })}</p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Przycisk wariant="glowny" zajety={zajety} onClick={przyjmij}>
                      {t.przyjmij}
                    </Przycisk>
                    <Przycisk wariant="drugorzedny" onClick={odrzuc}>
                      {t.odrzuc}
                    </Przycisk>
                  </div>
                  <Notatka>
                    <p>{t.notatkaOdrzucenia}</p>
                  </Notatka>
                </div>
              </Karta>
            }
            boczna={
              <Karta tytul={t.szczegoly} bezLinii>
                <dl className="m-0 flex flex-col gap-4">
                  <div>
                    <dt className="text-body-strong text-ink">{t.zaprasza}</dt>
                    <dd className="m-0 text-body">{imieINazwisko}</dd>
                  </div>
                  <div>
                    <dt className="text-body-strong text-ink">{t.rolaPoPrzyjeciu}</dt>
                    <dd className="m-0 text-body">{t.rolaDrugiRodzic}</dd>
                  </div>
                  {zaproszenie ? (
                    <div>
                      <dt className="text-body-strong text-ink">{t.wazneDo}</dt>
                      <dd className="m-0 text-body text-ink-strong">{formatujDate(zaproszenie.wazneDo)}</dd>
                    </div>
                  ) : null}
                </dl>
                <Notatka className="mt-6">
                  <p>{t.notatkaOdlaczenia({ imie })}</p>
                </Notatka>
              </Karta>
            }
            etykietaBocznej={t.szczegoly}
          />
        </div>
      )}
    </>
  );
}
