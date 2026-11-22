'use client';

import { use, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { DanePytania, KartaKontekstu, grupyKontekstu } from '@/app/(strefa)/pytania-do-zus/_czesci/karta-kontekstu';
import { odczytajKorespondencje } from '@/dane/magazyn/operacje/po-odczycie-zus/sprawdz-odpowiedzi-zus';
import { useKonto, useStanKonta, useStanSymulowanegoZus } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { scalPytania } from '@/domena/pytania-zus/odpowiedzi';
import { formatujDate, formatujDateICzas } from '@/komponenty/format';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { Zakladki, useZakladkaWAdresie } from '@/komponenty/zakladki';
import { teksty } from '@/teksty';

const t = teksty.ViewZusQuestionSent;

type ZakladkaPytania = 'odpowiedz' | 'pytanie' | 'sprawa' | 'profil';

export function WidokWyslanegoPytania({ params }: { params: PageProps<'/pytania-do-zus/[idPytania]'>['params'] }) {
  const { idPytania } = use(params);
  const konto = useKonto();
  const stanKonta = useStanKonta();
  const stanZus = useStanSymulowanegoZus(konto?.pesel);

  // Odczyt korespondencji przy każdym otwarciu pytania, także po powrocie na trasę zachowaną przez Cache
  // Components: nowa odpowiedź ZUS trafia do kopii i do wiadomości (R5). Odstęp 1 s chroni przed podwójnym
  // odczytem przy ponownym montowaniu w trybie deweloperskim.
  const pesel = konto?.pesel ?? null;
  const ostatniOdczyt = useRef(0);
  useEffect(() => {
    const teraz = Date.now();
    if (pesel === null || teraz - ostatniOdczyt.current < 1000) return;
    ostatniOdczyt.current = teraz;
    odczytajKorespondencje(pesel, pobierzKontekstOperacji());
  }, [pesel]);

  const pytanie = useMemo(
    () =>
      scalPytania(stanKonta?.kopiaDanychZus?.korespondencja, stanZus?.korespondencja).find(
        (p) => p.idPytania === idPytania && p.peselNadawcy === konto?.pesel,
      ) ?? null,
    [stanKonta, stanZus, idPytania, konto?.pesel],
  );

  // Grupy danych w zakładkach w kolejności kart: odpowiedź przed pytaniem, gdy ZUS już odpowiedział, potem sprawa
  // i profil z kontekstu dołączonego do pytania. Wybrana zakładka w ?zakladka=.
  const odpowiedz = pytanie?.odpowiedz;
  const zakladki: ZakladkaPytania[] = [
    ...(odpowiedz ? (['odpowiedz', 'pytanie'] as const) : (['pytanie', 'odpowiedz'] as const)),
    ...(pytanie ? grupyKontekstu(pytanie.kontekst) : []),
  ];
  const [zakladka, wybierzZakladke] = useZakladkaWAdresie(zakladki);

  const adresInstrukcji = pytanie?.idSprawy ? trasy.ViewCaseGuide({ idSprawy: pytanie.idSprawy }) : null;
  const powrot = adresInstrukcji
    ? { href: adresInstrukcji, etykieta: t.powrotInstrukcja }
    : { href: trasy.ViewFamilyPlan(), etykieta: t.powrotPlan };

  if (pytanie === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
        <Karta>
          <p className="m-0 text-body">{t.brakPytania}</p>
        </Karta>
      </>
    );
  }

  const kartaPytania = (
    <Karta tytul={t.kartaPytania} bezLinii>
      <Stos odstep={4}>
        <DanePytania
          wiersze={[
            { etykieta: t.wyslano, wartosc: formatujDateICzas(pytanie.wyslano), opis: t.przezEzus },
            {
              etykieta: t.status,
              wartosc: t.statusy[pytanie.status],
              opis: odpowiedz ? t.zusOdpowiedzial({ data: formatujDate(odpowiedz.czas) }) : t.czekamyNaOdpowiedz,
            },
            pytanie.kontekst.sprawa
              ? { etykieta: t.sprawa, wartosc: pytanie.kontekst.sprawa.tytul, opis: pytanie.kontekst.sprawa.idSprawy }
              : { etykieta: t.sprawa, wartosc: t.pytanieOgolne, opis: t.pytanieOgolneOpis },
          ]}
        />
        <section className="grid gap-2">
          <h3 className="m-0 text-body-strong text-ink">{t.trescPytania}</h3>
          <p className="m-0 whitespace-pre-wrap break-words text-body">{pytanie.tresc}</p>
        </section>
      </Stos>
    </Karta>
  );

  const kartaOdpowiedzi = (
    <Karta tytul={t.kartaOdpowiedzi} bezLinii>
      {odpowiedz ? (
        <Stos odstep={4}>
          <Wiersz>
            <p className="m-0 text-body-strong">{t.odpowiedzZ({ data: formatujDate(odpowiedz.czas) })}</p>
          </Wiersz>
          <p className="m-0 whitespace-pre-wrap break-words text-body">{odpowiedz.tresc}</p>
          <Notatka>
            <p className="m-0">{t.odpowiedzWEzus}</p>
          </Notatka>
        </Stos>
      ) : (
        <StanPusty ikona="zegar" przerywany akcja={<Odnosnik href={trasy.ViewGuideSettings()}>{t.ustawieniaPrzypomnien}</Odnosnik>}>
          <p className="m-0">{t.pustaOdpowiedz}</p>
        </StanPusty>
      )}
    </Karta>
  );

  const kartaKontekstu = (grupa: 'sprawa' | 'profil') => (
    <KartaKontekstu
      kontekst={pytanie.kontekst}
      tytul={t.kartaKontekstu}
      stanNa={t.stanWChwiliWyslania({ czas: formatujDateICzas(pytanie.wyslano) })}
      notatka={pytanie.kontekst.sprawa ? teksty.ViewZusQuestion.notatkaKontekstu : teksty.ViewZusQuestion.notatkaOgolna}
      grupa={grupa}
    />
  );
  const panele: Record<ZakladkaPytania, ReactNode> = {
    odpowiedz: kartaOdpowiedzi,
    pytanie: kartaPytania,
    sprawa: kartaKontekstu('sprawa'),
    profil: kartaKontekstu('profil'),
  };

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} powrot={powrot} />
      <Stos odstep={7.5} className="max-w-tresc">
        {odpowiedz ? <Komunikat kod="0132" /> : null}
        <Zakladki<ZakladkaPytania>
          etykieta={t.zakladki.etykieta}
          zakladki={zakladki.map((z) => ({ wartosc: z, etykieta: t.zakladki[z] }))}
          wybrana={zakladka}
          onWybor={wybierzZakladke}
        >
          {panele[zakladka]}
        </Zakladki>
        <Wiersz>
          {adresInstrukcji ? (
            <PrzyciskLink href={adresInstrukcji} wariant="glowny">
              {t.wrocDoInstrukcji}
            </PrzyciskLink>
          ) : (
            <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="glowny">
              {t.przejdzDoPlanu}
            </PrzyciskLink>
          )}
          {odpowiedz ? (
            <PrzyciskLink
              href={trasy.ViewZusQuestion(pytanie.idSprawy ? { sprawa: pytanie.idSprawy } : {})}
              wariant="drugorzedny"
            >
              {t.zadajKolejne}
            </PrzyciskLink>
          ) : null}
        </Wiersz>
      </Stos>
    </>
  );
}
