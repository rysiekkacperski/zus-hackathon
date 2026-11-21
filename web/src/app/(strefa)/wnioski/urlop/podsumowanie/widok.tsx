'use client';

// ViewLeaveRequestSummary (u32): krok 3 kreatora, podsumowanie, załączniki, adres e-mail pracodawcy, pobranie i wysłanie.
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { formatujDate } from '@/domena/daty';
import { formatujProcent } from '@/domena/kwoty';
import type { KodKomunikatu } from '@/domena/typy';
import { poczatekOchrony } from '@/domena/wnioski/ochrona';
import { listaZalacznikow, nazwaPlikuWniosku } from '@/domena/wnioski/urlopy';
import { okresOchrony, walidujWysylke } from '@/domena/wnioski/wysylka-do-pracodawcy';
import { useParametry } from '@/dane/magazyn/hooki';
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
import { FlagaDemo } from '@/komponenty/flaga-demo';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Odnosnik } from '@/komponenty/odnosnik';
import { BladPola } from '@/komponenty/pole';
import { PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { teksty } from '@/teksty';
import { DaneNaTle, RamaKreatora, useKreatorUrlopu } from '../_czesci/kreator';
import { OknoPodgladuWiadomosci } from './_czesci/okno-podgladu-wiadomosci';

const t = teksty.ViewLeaveRequestSummary;
const tf = teksty.ViewLeaveRequestForm;

function rozmiar(bajty: number): string {
  if (bajty >= 1048576) return t.rozmiarMb({ mb: (bajty / 1048576).toFixed(1).replace('.', ',') });
  return t.rozmiarKb({ kb: String(Math.max(1, Math.round(bajty / 1024))) });
}

export function WidokPodsumowaniaWnioskuOUrlop() {
  const stan = useKreatorUrlopu();
  const parametry = useParametry();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [bladEmail, setBladEmail] = useState<KodKomunikatu | null>(null);
  const [bledyPlikow, setBledyPlikow] = useState<Record<string, KodKomunikatu>>({});
  const [komunikat, setKomunikat] = useState<{ kod: KodKomunikatu; ponow?: boolean } | null>(null);
  const [pobrano, setPobrano] = useState(false);
  const [okno, setOkno] = useState(false);
  const [zajety, setZajety] = useState(false);
  const idWyslanego = stan?.wniosek?.stan === 'wyslany' ? stan.wniosek.idWniosku : null;

  useEffect(() => {
    if (idWyslanego) router.replace(trasy.ViewLeaveRequestSent({ wniosek: idWyslanego }));
  }, [idWyslanego, router]);

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
  const adres = email ?? wniosek.emailPracodawcy ?? dane.emailPracodawcy ?? '';
  const idW = wniosek.idWniosku;
  const zalaczniki = listaZalacznikow(podrodzaj, dane).map((z) => wniosek.zalaczniki.find((s) => s.id === z.id) ?? z);
  const pierwszy = okresOchrony(wniosek);
  const ochronaDzis = pierwszy
    ? poczatekOchrony(kontekst.dzis, pierwszy.od, pierwszy.rodzajUrlopu === 'laczenie-z-praca' ? 'rodzicielski' : pierwszy.rodzajUrlopu)
    : null;
  const hrefFormularza = trasy.ViewLeaveRequestForm({ wniosek: idW });
  const nazwaPliku = nazwaPlikuWniosku(podrodzaj);

  function zapiszEmail(): boolean {
    const bledy = walidujWysylke({ email: adres });
    if (bledy.email) {
      setBladEmail(bledy.email);
      setTimeout(() => document.getElementById('urlop-email')?.focus(), 0);
      return false;
    }
    setBladEmail(null);
    const wynik = zapiszKrokWnioskuOUrlop(idW, { emailPracodawcy: adres.trim() }, 'ViewLeaveRequestSummary', pobierzKontekstOperacji());
    if (!wynik.ok) setKomunikat({ kod: wynik.kod });
    return wynik.ok;
  }

  async function wyslij() {
    setOkno(false);
    if (!zapiszEmail()) return;
    setZajety(true);
    const wynik = await wyslijWniosekDoPracodawcy(idW, pobierzKontekstOperacji());
    setZajety(false);
    if (wynik.ok) {
      router.push(trasy.ViewLeaveRequestSent({ wniosek: idW }));
      return;
    }
    if (wynik.kod === '0134' || wynik.kod === '0060') setBladEmail(wynik.kod);
    else setKomunikat({ kod: wynik.kod, ponow: wynik.kod === '0138' });
  }

  function pobierz() {
    const wynik = pobierzWniosekOUrlop(idW, pobierzKontekstOperacji());
    if (!wynik.ok) {
      setKomunikat({ kod: wynik.kod });
      return;
    }
    setKomunikat(null);
    setPobrano(true);
    drukujDokument(nazwaPliku);
  }

  function zapiszDoDokonczenia() {
    const wynik = zapiszKrokWnioskuOUrlop(idW, adres.trim() ? { emailPracodawcy: adres.trim() } : {}, 'ViewLeaveRequestSummary', pobierzKontekstOperacji());
    if (!wynik.ok) {
      setKomunikat({ kod: wynik.kod });
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseGuide' });
    router.push(trasy.ViewCaseGuide({ idSprawy: wynik.wartosc.idSprawy }));
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

  const sekcja = (tytul: string, href: string, tresc: ReactNode) => (
    <Karta
      tytul={tytul}
      bezLinii
      akcje={
        <Odnosnik href={href} aria-label={t.zmienEtykieta({ sekcja: tytul })}>
          {t.zmien}
        </Odnosnik>
      }
    >
      {tresc}
    </Karta>
  );

  const listaZalacznikowTekst = zalaczniki.map((z) => tf.zalaczniki[z.id] ?? z.rodzaj).join(', ');

  return (
    <RamaKreatora
      krok={3}
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
          komunikat.kod === '0038' || komunikat.kod === '0165' ? (
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
          )
        ) : null}
        {pobrano ? <Komunikat kod="0139" akcje={<span>{t.pobrano({ nazwa: nazwaPliku })}</span>} /> : null}
        {sekcja(t.rodzajTytul, trasy.ViewLeaveRequestType({ wniosek: idW }), <p className="m-0">{tf.nazwyWnioskow[podrodzaj]}</p>)}
        {sekcja(t.okresTytul, hrefFormularza, <DaneNaTle poziomo={false} pozycje={okresy} />)}
        {sekcja(t.osobyTytul, hrefFormularza, <DaneNaTle pozycje={osoby} />)}
        {sekcja(
          t.oswiadczeniaTytul,
          hrefFormularza,
          oswiadczenia.length === 0 ? <p className="m-0">{t.brakOswiadczen}</p> : <DaneNaTle poziomo={false} pozycje={oswiadczenia} />,
        )}
        <Karta tytul={t.zalacznikiTytul} bezLinii>
          {zalaczniki.length === 0 ? (
            <p className="m-0">{tf.bezZalacznikow}</p>
          ) : (
            <>
              <Komunikat kod="0149" parametry={{ listaDokumentow: listaZalacznikowTekst }} />
              <p className="m-0 mt-4">{t.zalacznikiOpcjonalne}</p>
              <ul className="m-0 mt-4 flex list-none flex-col gap-4 p-0">
                {zalaczniki.map((z) => {
                  const nazwa = tf.zalaczniki[z.id] ?? z.rodzaj;
                  const idPola = `urlop-plik-${z.id}`;
                  const blad = bledyPlikow[z.id];
                  return (
                    <li key={z.id} className="flex flex-col gap-2 rounded-sm border border-line px-4 py-3">
                      <span className="text-body-strong first-letter:uppercase">{nazwa}</span>
                      {z.plik ? (
                        <div className="flex flex-wrap items-center gap-4">
                          <span>{t.plikDolaczony({ nazwa: z.plik.nazwa, rozmiar: rozmiar(z.plik.rozmiar) })}</span>
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
                      ) : (
                        <div className="flex flex-col gap-1">
                          <label htmlFor={idPola} className="text-small-strong">
                            {t.dolaczPlik({ nazwa })}
                          </label>
                          <p id={`${idPola}-podpowiedz`} className="m-0 text-small text-ink-muted">
                            {t.dolaczPlikPodpowiedz}
                          </p>
                          <input
                            id={idPola}
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            aria-describedby={[`${idPola}-podpowiedz`, blad ? `${idPola}-blad` : ''].filter(Boolean).join(' ')}
                            aria-invalid={blad ? true : undefined}
                            className="text-small"
                            onChange={(e) => {
                              void dolacz(z.id, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                          />
                          {blad ? <BladPola id={`${idPola}-blad`} kod={blad} /> : null}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Karta>
        <Karta tytul={t.adresatTytul} bezLinii>
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
            blad={bladEmail}
            maksDlugosc={254}
          />
          <div className="mt-4">
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-brand underline hover:text-brand-deep" onClick={() => setOkno(true)}>
              {t.zobaczWiadomosc}
            </button>
          </div>
          {parametry.trybDemonstracyjny ? <FlagaDemo className="mt-4">{t.demo}</FlagaDemo> : null}
        </Karta>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Przycisk type="button" wariant="drugorzedny" onClick={() => router.push(hrefFormularza)}>
            {t.wstecz}
          </Przycisk>
          <div className="flex flex-wrap gap-4">
            <Przycisk type="button" wariant="tlo" ikona="zapisz" onClick={zapiszDoDokonczenia}>
              {t.zapiszDoDokonczenia}
            </Przycisk>
            <Przycisk type="button" wariant="drugorzedny" ikona="pobierz" onClick={pobierz}>
              {t.pobierz}
            </Przycisk>
            <Przycisk type="submit" wariant="glowny" ikona="wyslij" zajety={zajety}>
              {t.wyslij}
            </Przycisk>
          </div>
        </div>
      </form>
      <div className="hidden print:block">
        <DokumentDoDruku tytul={t.dokumentTytul({ nazwa: tf.nazwyWnioskow[podrodzaj] })} nazwaPliku={nazwaPliku} flagaDemo={parametry.trybDemonstracyjny}>
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
        trybDemonstracyjny={parametry.trybDemonstracyjny}
        onWyslij={() => void wyslij()}
      />
    </RamaKreatora>
  );
}
