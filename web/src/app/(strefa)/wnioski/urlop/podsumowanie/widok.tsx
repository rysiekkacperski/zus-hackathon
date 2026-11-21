'use client';

// ViewLeaveRequestSummary (u32): krok 3 kreatora, podsumowanie w zakładkach (po jednej na grupę danych), załączniki,
// adres e-mail pracodawcy, pobranie i wysłanie. Wybrana zakładka żyje w parametrze ?zakladka=.
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { KodKomunikatu } from '@/domena/typy';
import { poczatekOchrony } from '@/domena/wnioski/ochrona';
import { listaZalacznikow, nazwaPlikuWniosku } from '@/domena/wnioski/urlopy';
import { okresOchrony, walidujWysylke } from '@/domena/wnioski/wysylka-do-pracodawcy';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokWnioskuOUrlop } from '@/dane/magazyn/operacje/wnioski-urlop';
import {
  dolaczPlikDoWniosku,
  pobierzWniosekOUrlop,
  usunPlikZWniosku,
  wyslijWniosekDoPracodawcy,
} from '@/dane/magazyn/operacje/wnioski-urlop-wysylka';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { DokumentDoDruku, drukujDokument } from '@/komponenty/dokument-do-druku';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Odnosnik } from '@/komponenty/odnosnik';
import { BladPola } from '@/komponenty/pole';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { useZakladkaWAdresie, Zakladki } from '@/komponenty/zakladki';
import { teksty } from '@/teksty';
import {
  adresCzesciFormularzaUrlopu,
  czescSekcjiUrlopu,
  czesciFormularzaUrlopu,
  DaneNaTle,
  RamaKreatora,
  useKreatorUrlopu,
} from '../_czesci/kreator';
import { OknoPodgladuWiadomosci } from './_czesci/okno-podgladu-wiadomosci';

const t = teksty.ViewLeaveRequestSummary;
const tf = teksty.ViewLeaveRequestForm;

type ZakladkaUrlopu = keyof typeof t.zakladki;

/** Zakładki w kolejności sekcji podsumowania. */
const ZAKLADKI: readonly ZakladkaUrlopu[] = ['rodzaj', 'okres', 'osoby', 'oswiadczenia', 'zalaczniki', 'adresat'];

const ID_PODPOWIEDZI_PLIKOW = 'urlop-pliki-podpowiedz';

function rozmiar(bajty: number): string {
  if (bajty >= 1048576) return t.rozmiarMb({ mb: (bajty / 1048576).toFixed(1).replace('.', ',') });
  return t.rozmiarKb({ kb: String(Math.max(1, Math.round(bajty / 1024))) });
}

export function WidokPodsumowaniaWnioskuOUrlop() {
  const stan = useKreatorUrlopu();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  // Komunikaty, błędy plików i okno podglądu są chwilowe: po powrocie na podsumowanie widok zaczyna bez nich.
  const [bledyPlikow, setBledyPlikow] = useStanChwilowy<Record<string, KodKomunikatu>>({});
  const [komunikat, setKomunikat] = useStanChwilowy<{ kod: KodKomunikatu; ponow?: boolean } | null>(null);
  const [fokusKomunikatu, setFokusKomunikatu] = useStanChwilowy(0);
  const [pobrano, setPobrano] = useStanChwilowy(false);
  const [okno, setOkno] = useStanChwilowy(false);
  const komunikatRef = useRef<HTMLDivElement>(null);
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const [zakladka, wybierzZakladke] = useZakladkaWAdresie<ZakladkaUrlopu>(ZAKLADKI);
  const idWyslanego = stan?.wniosek?.stan === 'wyslany' ? stan.wniosek.idWniosku : null;
  const adres = email ?? stan?.wniosek?.emailPracodawcy ?? stan?.dane.emailPracodawcy ?? '';
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { email: adres },
    waliduj: (w: { email: string }): { email: KodKomunikatu | null } => ({ email: walidujWysylke({ email: w.email }).email ?? null }),
    pola: { email: 'urlop-email' },
  });

  useEffect(() => {
    if (idWyslanego) router.replace(trasy.ViewLeaveRequestSent({ wniosek: idWyslanego }));
  }, [idWyslanego, router]);

  // Po nieudanej próbie fokus trafia na komunikat nad zakładkami.
  useEffect(() => {
    if (fokusKomunikatu > 0) komunikatRef.current?.focus();
  }, [fokusKomunikatu]);

  if (stan === null || idWyslanego) return null;
  const { wniosek, dane, kontekst } = stan;
  if (!wniosek || !wniosek.podrodzaj) {
    return (
      <RamaKreatora krok={3} nazwaKroku={t.nazwaKroku} idSprawy={null}>
        <StanPusty ikona="wnioski">{tf.brakWniosku}</StanPusty>
      </RamaKreatora>
    );
  }
  const podrodzaj = wniosek.podrodzaj;
  const idW = wniosek.idWniosku;
  const zalaczniki = listaZalacznikow(podrodzaj, dane).map((z) => wniosek.zalaczniki.find((s) => s.id === z.id) ?? z);
  const pierwszy = okresOchrony(wniosek);
  const ochronaDzis = pierwszy
    ? poczatekOchrony(kontekst.dzis, pierwszy.od, pierwszy.rodzajUrlopu === 'laczenie-z-praca' ? 'rodzicielski' : pierwszy.rodzajUrlopu)
    : null;
  const hrefFormularza = adresCzesciFormularzaUrlopu(idW, czescSekcjiUrlopu(podrodzaj, 'okres'));
  const hrefOsob = adresCzesciFormularzaUrlopu(idW, czescSekcjiUrlopu(podrodzaj, 'dane'));
  const hrefOswiadczen = adresCzesciFormularzaUrlopu(
    idW,
    czescSekcjiUrlopu(podrodzaj, podrodzaj === 'laczenie-z-praca' ? 'laczenie' : 'oswiadczenie'),
  );
  const hrefWstecz = adresCzesciFormularzaUrlopu(idW, czesciFormularzaUrlopu(podrodzaj).length);
  const nazwaPliku = nazwaPlikuWniosku(podrodzaj);

  function pokazKomunikat(nowy: { kod: KodKomunikatu; ponow?: boolean }) {
    setKomunikat(nowy);
    setFokusKomunikatu((n) => n + 1);
  }

  function zapiszEmail(): boolean {
    // Błąd adresu: zakładka Adresat, a fokus trafia na pole po jego wyrenderowaniu.
    if (walidacja.pierwszePoleZBledem() === 'email') wybierzZakladke('adresat');
    if (!walidacja.sprobujWyslac()) return false;
    const wynik = zapiszKrokWnioskuOUrlop(idW, { emailPracodawcy: adres.trim() }, 'ViewLeaveRequestSummary', pobierzKontekstOperacji());
    if (!wynik.ok) pokazKomunikat({ kod: wynik.kod });
    return wynik.ok;
  }

  async function wyslij() {
    setOkno(false);
    if (!zapiszEmail()) return;
    ustawZajety(true);
    const wynik = await wyslijWniosekDoPracodawcy(idW, pobierzKontekstOperacji());
    if (wynik.ok) {
      przejdz(trasy.ViewLeaveRequestSent({ wniosek: idW }));
      return;
    }
    ustawZajety(false);
    if (wynik.kod === '0134' || wynik.kod === '0060') {
      wybierzZakladke('adresat');
      walidacja.pokazBledy({ email: wynik.kod });
    } else pokazKomunikat({ kod: wynik.kod, ponow: wynik.kod === '0138' });
  }

  function pobierz() {
    const wynik = pobierzWniosekOUrlop(idW, pobierzKontekstOperacji());
    if (!wynik.ok) {
      pokazKomunikat({ kod: wynik.kod });
      return;
    }
    setKomunikat(null);
    setPobrano(true);
    drukujDokument(nazwaPliku);
  }

  function zapiszDoDokonczenia() {
    const wynik = zapiszKrokWnioskuOUrlop(idW, adres.trim() ? { emailPracodawcy: adres.trim() } : {}, 'ViewLeaveRequestSummary', pobierzKontekstOperacji());
    if (!wynik.ok) {
      pokazKomunikat({ kod: wynik.kod });
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
    przejdz(trasy.ViewCaseGuide({ idSprawy: wynik.wartosc.idSprawy }));
  }

  async function dolacz(idZalacznika: string, plik: File | undefined) {
    if (!plik) return;
    const wynik = await dolaczPlikDoWniosku(idW, idZalacznika, plik, pobierzKontekstOperacji());
    setBledyPlikow((b) => {
      const nowe = { ...b };
      if (wynik.ok) delete nowe[idZalacznika];
      else nowe[idZalacznika] = wynik.kod;
      return nowe;
    });
  }

  const okresy: { etykieta: string; wartosc: string }[] = wniosek.okresy.map((o) => ({
    etykieta: tf.rodzajeUrlopu[o.rodzajUrlopu],
    wartosc: `${formatujDate(o.od)} – ${formatujDate(o.do)}${o.stawka !== undefined ? `, ${tf.stawkaPodstawy({ stawka: formatujProcent(o.stawka) })}` : ''}`,
  }));
  if (wniosek.laczenie) {
    okresy.push({ etykieta: tf.wymiarPracy, wartosc: `${wniosek.laczenie.wymiarPracy} ${tf.procentEtatu}` });
    okresy.push({ etykieta: tf.ostatniDzien, wartosc: formatujDate(wniosek.laczenie.ostatniDzienUrlopu) });
  }
  const osoby: { etykieta: string; wartosc: ReactNode }[] = [{ etykieta: tf.pracownik, wartosc: dane.imieINazwisko }];
  if (dane.dziecko?.dataUrodzenia) {
    const imie = [dane.dziecko.imie, dane.dziecko.nazwisko].filter(Boolean).join(' ');
    osoby.push({ etykieta: tf.dziecko, wartosc: imie ? tf.dzieckoUr({ imieINazwisko: imie, data: formatujDate(dane.dziecko.dataUrodzenia) }) : formatujDate(dane.dziecko.dataUrodzenia) });
  } else if (dane.przewidywanyTerminPorodu && podrodzaj === 'czesc-przed-porodem') {
    osoby.push({ etykieta: tf.przewidywanyTermin, wartosc: formatujDate(dane.przewidywanyTerminPorodu) });
  }
  const os = wniosek.oswiadczenia;
  const oswiadczenia: { etykieta: string; wartosc: string }[] = [];
  if (os.zamiarDrugiegoRodzica !== undefined) oswiadczenia.push({ etykieta: t.zamiar, wartosc: os.zamiarDrugiegoRodzica ? tf.tak : tf.nie });
  if (os.wczesniejszyOjcowski) oswiadczenia.push({ etykieta: t.ojcowskiWczesniej, wartosc: os.wczesniejszyOjcowski === '7-dni' ? tf.ojcowskiTak : tf.ojcowskiNie });
  if (os.drugiRodzicBezUzupelniajacego) oswiadczenia.push({ etykieta: t.uzupelniajacyDrugi, wartosc: t.potwierdzone });
  if (os.laczenieCzesciZWydluzenia !== undefined) oswiadczenia.push({ etykieta: t.laczenieWydluzenie, wartosc: os.laczenieCzesciZWydluzenia ? tf.tak : tf.nie });

  // Panel zakładki: karta bez górnego odstępu, bo panel zakładek ma własny odstęp od paska.
  const sekcja = (tytul: string, tresc: ReactNode, href?: string) => (
    <Karta
      tytul={tytul}
      bezLinii
      className="pt-0"
      akcje={
        href ? (
          <Odnosnik href={href} aria-label={t.zmienEtykieta({ sekcja: tytul })}>
            {t.zmien}
          </Odnosnik>
        ) : undefined
      }
    >
      {tresc}
    </Karta>
  );

  const listaZalacznikowTekst = zalaczniki.map((z) => tf.zalaczniki[z.id] ?? z.rodzaj).join(', ');
  const bladWPlikach = zalaczniki.some((z) => bledyPlikow[z.id]);
  // Brak albo błędny adres e-mail blokuje wysłanie, więc zakładka Adresat pokazuje wskaźnik od razu.
  const bladAdresu = Boolean(walidacja.bledyAktualne.email ?? walidacja.blad('email'));

  function trescZakladki(): ReactNode {
    switch (zakladka) {
      case 'rodzaj':
        return sekcja(t.rodzajTytul, <p className="m-0">{tf.nazwyWnioskow[podrodzaj]}</p>, trasy.ViewLeaveRequestType({ wniosek: idW }));
      case 'okres':
        return sekcja(t.okresTytul, <DaneNaTle poziomo={false} pozycje={okresy} />, hrefFormularza);
      case 'osoby':
        return sekcja(t.osobyTytul, <DaneNaTle pozycje={osoby} />, hrefOsob);
      case 'oswiadczenia':
        return sekcja(
          t.oswiadczeniaTytul,
          oswiadczenia.length === 0 ? <p className="m-0">{t.brakOswiadczen}</p> : <DaneNaTle poziomo={false} pozycje={oswiadczenia} />,
          hrefOswiadczen,
        );
      case 'zalaczniki':
        return sekcja(
          t.zalacznikiTytul,
          zalaczniki.length === 0 ? (
            <p className="m-0">{tf.bezZalacznikow}</p>
          ) : (
            <>
              <Komunikat kod="0149" parametry={{ listaDokumentow: listaZalacznikowTekst }} />
              <p id={ID_PODPOWIEDZI_PLIKOW} className="m-0 mt-4">
                {t.zalacznikiOpcjonalne} {t.dolaczPlikPodpowiedz}
              </p>
              <ul className="m-0 mt-2 flex list-none flex-col p-0">
                {zalaczniki.map((z) => {
                  const nazwa = tf.zalaczniki[z.id] ?? z.rodzaj;
                  const idPola = `urlop-plik-${z.id}`;
                  const blad = bledyPlikow[z.id];
                  return (
                    <li key={z.id} className="flex flex-col gap-1 border-b border-line-row py-2 last:border-b-0 last:pb-0">
                      <div className="flex min-h-control flex-wrap items-center justify-between gap-x-6 gap-y-2">
                        {z.plik ? (
                          <>
                            <span className="min-w-0 text-body-strong first-letter:uppercase">{nazwa}</span>
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="min-w-0 break-words">{t.plikDolaczony({ nazwa: z.plik.nazwa, rozmiar: rozmiar(z.plik.rozmiar) })}</span>
                              <Przycisk
                                type="button"
                                wariant="tlo"
                                ikona="usun"
                                aria-label={t.usunPlikEtykieta({ nazwa: z.plik.nazwa })}
                                onClick={() => void usunPlikZWniosku(idW, z.id, pobierzKontekstOperacji())}
                              >
                                {t.usunPlik}
                              </Przycisk>
                            </div>
                          </>
                        ) : (
                          <>
                            <label htmlFor={idPola} className="min-w-0 text-body-strong first-letter:uppercase">
                              {nazwa}
                            </label>
                            <input
                              id={idPola}
                              type="file"
                              accept="application/pdf,image/jpeg,image/png"
                              aria-describedby={[ID_PODPOWIEDZI_PLIKOW, blad ? `${idPola}-blad` : ''].filter(Boolean).join(' ')}
                              aria-invalid={blad ? true : undefined}
                              className="max-w-full text-small"
                              onChange={(e) => {
                                void dolacz(z.id, e.target.files?.[0]);
                                e.target.value = '';
                              }}
                            />
                          </>
                        )}
                      </div>
                      {blad ? <BladPola id={`${idPola}-blad`} kod={blad} /> : null}
                    </li>
                  );
                })}
              </ul>
            </>
          ),
        );
      case 'adresat':
        return sekcja(
          t.adresatTytul,
          <>
            <p className="m-0 mb-4">{dane.pracodawca ? t.adresat({ nazwa: dane.pracodawca }) : t.adresatBezNazwy}</p>
            <PoleTekstowe
              id="urlop-email"
              typ="email"
              inputMode="email"
              autoComplete="email"
              etykieta={t.email}
              podpowiedz={t.emailPodpowiedz}
              wartosc={adres}
              onZmiana={(w) => setEmail(w)}
              {...walidacja.pole('email')}
              maksDlugosc={254}
            />
            <div className="mt-4">
              <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-brand underline hover:text-brand-deep" onClick={() => setOkno(true)}>
                {t.zobaczWiadomosc}
              </button>
            </div>
          </>,
        );
      default:
        return null;
    }
  }

  return (
    <RamaKreatora
      krok={3}
      podrodzaj={podrodzaj}
      nazwaKroku={t.nazwaKroku}
      idSprawy={wniosek.idSprawy}
      idWniosku={idW}
      boczna={
        <>
          {ochronaDzis ? (
            <Karta tytul={t.ochronaTytul} bezLinii>
              <p className="m-0">{t.ochronaDzis({ data: formatujDate(ochronaDzis) })}</p>
            </Karta>
          ) : null}
          <Karta tytul={t.poWyslaniuTytul} bezLinii>
            <p className="m-0">{t.poWyslaniuTresc}</p>
            <div className="mt-4">
              <Odnosnik href={trasy.ViewApplicationList()}>{t.twojeWnioski}</Odnosnik>
            </div>
          </Karta>
        </>
      }
    >
      <form
        noValidate
        className="flex flex-col gap-7.5 print:hidden"
        onSubmit={(e) => {
          e.preventDefault();
          void wyslij();
        }}
      >
        {komunikat ? (
          <div ref={komunikatRef} tabIndex={-1} className="outline-none">
            {komunikat.kod === '0038' || komunikat.kod === '0165' ? (
              <Komunikat
                kod={komunikat.kod}
                akcje={<span>{t.stawkaZmieniona({ data: formatujDate(wniosek.zaktualizowano) })}</span>}
              />
            ) : (
              <Komunikat
                kod={komunikat.kod}
                akcje={
                  komunikat.ponow ? (
                    <Przycisk type="button" wariant="drugorzedny" onClick={() => void wyslij()}>
                      {t.wyslijPonownie}
                    </Przycisk>
                  ) : undefined
                }
              />
            )}
          </div>
        ) : null}
        {pobrano ? <Komunikat kod="0139" akcje={<span>{t.pobrano({ nazwa: nazwaPliku })}</span>} /> : null}
        <Zakladki<ZakladkaUrlopu>
          id="urlop-zakladki"
          etykieta={t.zakladkiEtykieta}
          zakladki={ZAKLADKI.map((w) => ({
            wartosc: w,
            etykieta: t.zakladki[w],
            blad: (w === 'zalaczniki' && bladWPlikach) || (w === 'adresat' && bladAdresu),
          }))}
          wybrana={zakladka}
          onWybor={wybierzZakladke}
          tloPaneli="card"
        >
          {trescZakladki()}
        </Zakladki>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Przycisk type="button" wariant="drugorzedny" disabled={zajety} onClick={() => przejdz(hrefWstecz)}>
            {t.wstecz}
          </Przycisk>
          <div className="flex flex-wrap gap-4">
            <Przycisk type="button" wariant="tlo" ikona="zapisz" disabled={zajety} onClick={zapiszDoDokonczenia}>
              {t.zapiszDoDokonczenia}
            </Przycisk>
            <Przycisk type="button" wariant="drugorzedny" ikona="pobierz" disabled={zajety} onClick={pobierz}>
              {t.pobierz}
            </Przycisk>
            <Przycisk type="submit" wariant="glowny" ikona="wyslij" zajety={zajety}>
              {t.wyslij}
            </Przycisk>
          </div>
        </div>
      </form>
      <div className="hidden print:block">
        <DokumentDoDruku tytul={t.dokumentTytul({ nazwa: tf.nazwyWnioskow[podrodzaj] })} nazwaPliku={nazwaPliku}>
          <p className="m-0">{t.dokumentData({ data: formatujDate(kontekst.dzis) })}</p>
          <DaneNaTle pozycje={[...osoby, { etykieta: t.dokumentAdresat, wartosc: dane.pracodawca ?? t.adresatBezNazwy }]} />
          <DaneNaTle poziomo={false} pozycje={[...okresy, ...oswiadczenia]} />
          {zalaczniki.length > 0 ? <p className="m-0">{`${t.dokumentZalaczniki}: ${listaZalacznikowTekst}`}</p> : null}
        </DokumentDoDruku>
      </div>
      <OknoPodgladuWiadomosci
        otwarte={okno}
        onZamknij={() => setOkno(false)}
        wniosek={wniosek}
        dane={dane}
        email={adres}
        dzis={kontekst.dzis}
        onWyslij={() => void wyslij()}
      />
    </RamaKreatora>
  );
}
