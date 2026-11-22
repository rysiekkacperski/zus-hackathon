'use client';

// ViewBirthPackage (3.3.2.2.2): pakiet narodzin ze sprawami na pierwsze 3 miesiące zależnymi od formy zatrudnienia.
// Komunikat 0057 (w spokojnym trybie 0126) ustawia operacja potwierdzenia narodzin i pokazuje NaglowekStrony.
// Wzory: cz1/P10-12, P10-13, P10-14, P10-15; slot u28 przy K07 (cz2/P24-02).
import { useMemo } from 'react';
import { useDzis, useKatalog, useKontekstRodziny, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { formatujDate, roznicaDni } from '@/domena/daty';
import { tytulSprawy } from '@/domena/katalog/odczyt';
import { czyMaZgode } from '@/domena/konto';
import { formatujKwote } from '@/domena/kwoty';
import { czyUmowaOPraceTrwaPoPorodzie, dobierzPropozycjePakietu, koniecOknaPakietu } from '@/domena/rodzina/narodziny';
import type { DaneRodzica, FormaZatrudnienia, KosztSpoznienia, PozycjaPlanu, TerminSprawy } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';
import { slotyPakietu } from './_sloty';

const t = teksty.ViewBirthPackage;

/** Etykieta formy zatrudnienia matki z informacją o dobrowolnym ubezpieczeniu chorobowym. */
function etykietaFormy(matka: DaneRodzica): string {
  const forma = matka.formaZatrudnienia?.wartosc;
  const dobrowolne = matka.dobrowolneChorobowe?.wartosc === true;
  switch (forma) {
    case 'umowa-o-prace':
      return t.formy['umowa-o-prace'];
    case 'umowa-zlecenia':
      return dobrowolne ? t.formy['umowa-zlecenia-z'] : t.formy['umowa-zlecenia-bez'];
    case 'jdg':
      return dobrowolne ? t.formy['jdg-z'] : t.formy['jdg-bez'];
    case 'brak-tytulu':
      return t.formy['brak-tytulu'];
    default:
      return t.brakFormy;
  }
}

/** Opis sprawy zależny od formy zatrudnienia (wzory P10-12 … P10-15). */
function opisSprawy(idPozycji: string | null, forma: FormaZatrudnienia | null): string | null {
  switch (idPozycji) {
    case 'K05':
      return forma === 'jdg' || forma === 'umowa-zlecenia' || forma === 'umowa-o-prace' ? t.opisy.K05[forma] : null;
    case 'K06':
      return t.opisy.K06;
    case 'K07':
      return t.opisy.K07;
    case 'K08':
      return forma === 'jdg' || forma === 'umowa-zlecenia' ? t.opisy.K08[forma] : t.opisy.K08.inna;
    case 'K12':
      return t.opisy.K12;
    case 'K16':
      return t.opisy.K16;
    default:
      return null;
  }
}

function Koszt({ koszt }: { koszt: KosztSpoznienia }) {
  if (koszt.rodzaj === 'brak') return null;
  if (koszt.rodzaj === 'skutek') {
    return (
      <p className="m-0 text-body">
        <strong>{t.skutekSpoznienia}</strong> {koszt.tekst}
      </p>
    );
  }
  return (
    <p className="m-0 text-body">
      <strong>{t.kosztSpoznienia}</strong> {koszt.tekst ?? formatujKwote(koszt.kwota)}
    </p>
  );
}

function OdlegloscTerminu({ dni }: { dni: number }) {
  if (dni > 0) return <p className="m-0 text-body">{t.zaDni({ liczba: dni })}</p>;
  if (dni === 0) return <p className="m-0 text-body">{t.dzisiaj}</p>;
  return <p className="m-0 text-body">{t.poTerminie({ liczba: -dni })}</p>;
}

function AkcjaSprawy({ sprawa }: { sprawa: PozycjaPlanu }) {
  if (sprawa.idPozycji === 'K12') {
    return (
      <Stos odstep={2}>
        <PrzyciskLink wariant="drugorzedny" szerokosc="pelna" href={sciezkaWidoku('ViewEzus800Application')} nowaKarta>
          {t.akcje.ezus}
        </PrzyciskLink>
        <p className="m-0 text-body">{t.akcje.nowaKarta}</p>
      </Stos>
    );
  }
  if (sprawa.idPozycji === 'K08') {
    return (
      <PrzyciskLink
        wariant="drugorzedny"
        szerokosc="pelna"
        href={sciezkaWidoku('ViewZamLeaveType', { sprawa: sprawa.idSprawy })}
      >
        {t.akcje.kreator}
      </PrzyciskLink>
    );
  }
  return (
    <PrzyciskLink
      wariant="drugorzedny"
      szerokosc="pelna"
      href={sciezkaWidoku('ViewCaseGuide', { idSprawy: sprawa.idSprawy })}
    >
      {t.akcje.instrukcja}
    </PrzyciskLink>
  );
}

export function WidokPakietuNarodzin() {
  const rodzina = useRodzina();
  const kontekst = useKontekstRodziny();
  const stanKonta = useStanKonta();
  const katalog = useKatalog();
  const dzis = useDzis();
  const zgoda = stanKonta !== null && czyMaZgode(stanKonta.konto.decyzjeOZgodzie);

  const daneCiazy = rodzina?.daneCiazy ?? null;
  const dataPorodu = daneCiazy?.dataPoroduPotwierdzona ? daneCiazy.dataPorodu : undefined;
  const matka = rodzina?.daneRodziny.matka ?? null;
  const forma = matka?.formaZatrudnienia?.wartosc ?? null;
  const plan = rodzina?.plan ?? null;
  const kalendarz = rodzina?.kalendarz ?? null;

  const propozycje = useMemo(
    () =>
      plan !== null && dataPorodu !== undefined
        ? dobierzPropozycjePakietu(plan, kalendarz, forma, dataPorodu, czyUmowaOPraceTrwaPoPorodzie(matka, dataPorodu))
        : [],
    [plan, kalendarz, forma, dataPorodu, matka],
  );

  const powrot = { href: sciezkaWidoku('ViewFamilyPlan'), etykieta: t.powrotDoPlanu };

  if (rodzina === null || daneCiazy === null || dataPorodu === undefined || matka === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
        <StanPusty
          ikona="plan"
          akcja={
            <PrzyciskLink wariant="glowny" href={sciezkaWidoku('ViewBirthDate', { tryb: 'pakiet' })}>
              {t.zglosNarodziny}
            </PrzyciskLink>
          }
        >
          {t.brakDaty}
        </StanPusty>
      </>
    );
  }

  const wymiarUzupelniajacego = zgoda ? (daneCiazy.wymiarUzupelniajacegoUrlopu ?? 'nie-sprawdzono') : 'nie-sprawdzono';
  const k05Zalatwiona = plan?.pozycje.some((p) => p.idPozycji === 'K05' && p.status === 'zalatwiona') ?? false;
  const zK16 = propozycje.some((p) => p.idPozycji === 'K16');
  const terminSprawy = (id: string): TerminSprawy | undefined => kalendarz?.terminy.find((x) => x.idSprawy === id);
  const maUzupelniajacy = wymiarUzupelniajacego === 'do-8' || wymiarUzupelniajacego === 'do-15';

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
      <Stos odstep={6}>
        <Karta tytul={t.kartaPorod}>
          <Stos odstep={6}>
            <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
            <ListaDefinicji
              pozycje={[
                { etykieta: t.dataPorodu, wartosc: formatujDate(dataPorodu) },
                { etykieta: t.liczbaDzieci, wartosc: String(daneCiazy.liczbaUrodzonychDzieci ?? 1) },
                { etykieta: t.formaZatrudnienia, wartosc: etykietaFormy(matka) },
                { etykieta: t.uzupelniajacy, wartosc: t.wymiaryUzupelniajacego[wymiarUzupelniajacego] },
              ]}
            />
            {zgoda ? null : (
              <Notatka>
                <p>
                  {t.notkaBezZgody.przed}
                  <Odnosnik href={sciezkaWidoku('ViewGuideSettings')} wTekscie>
                    {t.notkaBezZgody.link}
                  </Odnosnik>
                  {t.notkaBezZgody.po}
                </p>
              </Notatka>
            )}
          </Stos>
        </Karta>

        <Karta tytul={t.kartaSpraw({ liczba: String(propozycje.length) })}>
          <Stos odstep={6}>
            <p className="m-0 text-body">{t.wstepSpraw({ data: formatujDate(koniecOknaPakietu(dataPorodu)) })}</p>
            {k05Zalatwiona ? (
              <Notatka>
                <p>{t.k05Zalatwiona}</p>
              </Notatka>
            ) : null}
            {zK16 ? (
              <Notatka>
                <p>{t.notkaSwiadczeniaRodzicielskiego}</p>
              </Notatka>
            ) : null}
            {propozycje.length === 0 ? (
              <StanPusty ikona="plan" przerywany>
                {t.brakSpraw}
              </StanPusty>
            ) : (
              <ol className="m-0 flex list-none flex-col gap-4 p-0">
                {propozycje.map((sprawa) => {
                  const termin = terminSprawy(sprawa.idSprawy);
                  const data = termin?.termin ?? null;
                  const opis = opisSprawy(sprawa.idPozycji, forma);
                  return (
                    <li
                      key={sprawa.idSprawy}
                      className="flex flex-col gap-4 rounded-sm border border-line p-5 md:flex-row md:flex-wrap md:items-start"
                    >
                      <div className="flex min-w-0 grow-999 basis-80 flex-col gap-2">
                        <h3 className="m-0 text-body-strong text-ink">{tytulSprawy(katalog, sprawa.idSprawy)}</h3>
                        {opis ? <p className="m-0 text-body">{opis}</p> : null}
                        {termin ? <Koszt koszt={termin.koszt} /> : null}
                      </div>
                      {data ? (
                        <div className="flex min-w-0 grow basis-30 flex-col gap-1">
                          <p className="m-0 text-small-strong">{t.termin}</p>
                          <p className="m-0 text-body-strong">{formatujDate(data)}</p>
                          <OdlegloscTerminu dni={termin?.dniDoTerminu ?? roznicaDni(dzis, data)} />
                        </div>
                      ) : null}
                      <div className="flex min-w-0 grow basis-60 flex-col gap-3">
                        <AkcjaSprawy sprawa={sprawa} />
                        {sprawa.idPozycji === 'K07' && kontekst
                          ? slotyPakietu.map(({ id, Komponent }) => <Komponent key={id} kontekst={kontekst} />)
                          : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            <Notatka>
              <p>{maUzupelniajacy && forma === 'umowa-o-prace' ? t.notkaPozostaleUzupelniajacy : t.notkaPozostale}</p>
            </Notatka>
          </Stos>
        </Karta>

        <Wiersz odstep={6} className="flex-wrap">
          <PrzyciskLink wariant="glowny" href={sciezkaWidoku('ViewFamilyPlan')}>
            {t.przejdzDoPlanu}
          </PrzyciskLink>
          <Odnosnik href={sciezkaWidoku('ViewDeadlines')}>{t.wszystkieTerminy}</Odnosnik>
        </Wiersz>
      </Stos>
    </>
  );
}
