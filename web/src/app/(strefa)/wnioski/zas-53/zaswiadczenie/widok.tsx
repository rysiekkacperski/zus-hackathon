'use client';

// ViewZas53Certificate: krok 1 kreatora ZAS-53. Lista e-ZLA od najpóźniejszego początku, zaświadczenie spoza listy,
// ustalenie prawa do zasiłku (0084, 0086, 0182, 0234, 0235, 0236, 0242) i zapis szkicu.
import { useMemo, useState } from 'react';
import { formatujDate, liczbaDniWlacznie } from '@/domena/daty';
import type { KodKomunikatu, ZaswiadczenieEzla } from '@/domena/typy';
import {
  kluczZaswiadczenia,
  listaZaswiadczenZas53,
  polaSzkicuZUstalenia,
  sprawdzDostepZas53,
  ustalPrawoZas53,
  zaswiadczenieZEzla,
  zbudujZalaczniki,
  type KomunikatZas53,
  type ZaswiadczenieWnioskuZas53,
} from '@/domena/wnioski/zas53';
import { stanZgody } from '@/domena/konto';
import { useDzis } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { zapiszKrokZas53 } from '@/dane/magazyn/operacje/wnioski-zas53';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { GrupaOpcji, type OpcjaGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { useNawigacjaZLadowaniem, useStanChwilowy } from '@/komponenty/nawigacja-z-ladowaniem';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import {
  adresEkranuZas53,
  AkcjeKreatoraZas53,
  BrakWnioskuZas53,
  DaneWKolumnieBocznej,
  NaglowekKreatoraZas53,
  PostepZas53,
  useWniosekZas53,
} from '../_czesci/kreator';
import { opisChorobowego } from '../widok';
import { ArkuszZaswiadczeniaSpozaListy } from './_czesci/arkusz-zaswiadczenia-spoza-listy';
import { teksty } from '@/teksty';

const t = teksty.ViewZas53Certificate;
const tS = teksty.ViewZas53Start;
const WARTOSC_ALTERNATYWNEGO = 'tryb-alternatywny';

function opisKodow(kody: ('B' | 'E')[]): string {
  return kody.length === 0 ? t.bezKodu : t.kodLiterowy({ kody: kody.map((k) => t.kody[k]).join(', ') });
}

export function WidokZaswiadczeniaZas53() {
  const k = useWniosekZas53();
  const dzis = useDzis();
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const [wybor, setWybor] = useState<string | null>(null);
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const [blokada, setBlokada] = useState<KomunikatZas53 | null>(null);
  const [arkusz, setArkusz] = useStanChwilowy(false);
  const [zapisany, setZapisany] = useState<KodKomunikatu | null>(null);

  const lista = useMemo<ZaswiadczenieEzla[]>(() => (k ? listaZaswiadczenZas53(k.kopia, k.rodzina.wnioski) : []), [k]);
  const dostep = useMemo(
    () => (k ? sprawdzDostepZas53({ stanZgody: stanZgody(k.konto.decyzjeOZgodzie), kopia: k.kopia, dzis }) : null),
    [k, dzis],
  );
  const alternatywne = k?.wniosek.zaswiadczenie?.zrodlo === 'tryb-alternatywny' ? k.wniosek.zaswiadczenie : undefined;
  const zapisane = k?.wniosek.zaswiadczenie;
  const wybrane =
    wybor ?? (zapisane ? (alternatywne ? WARTOSC_ALTERNATYWNEGO : kluczZaswiadczenia(zapisane.seriaINumer)) : null);
  const liczbaOpcji = lista.length + (alternatywne ? 1 : 0);
  // Błąd 0006 przy grupie: po opuszczeniu grupy bez wyboru; przy pustej liście komunikat pod notatką.
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { zaswiadczenie: wybrane },
    waliduj: (w: { zaswiadczenie: string | null }) => ({
      zaswiadczenie: liczbaOpcji > 0 && w.zaswiadczenie === null ? ('0006' as const) : null,
    }),
    pola: { zaswiadczenie: 'zaswiadczenie' },
  });
  if (!k) return <BrakWnioskuZas53 />;
  const { wniosek } = k;
  const poUstaniu = dostep?.dozwolony ? dostep.sciezka === 'po-ustaniu' : false;
  const tytul = dostep && 'tytul' in dostep ? dostep.tytul : undefined;

  const opcje: OpcjaGrupy[] = lista.map((z) => ({
    wartosc: kluczZaswiadczenia(z.seriaINumer),
    etykieta: z.seriaINumer,
    opis: (
      <span className="flex flex-wrap gap-x-6 gap-y-1 font-normal">
        <span>{t.okresZDniami({ od: formatujDate(z.od), do: formatujDate(z.do), dni: String(liczbaDniWlacznie(z)) })}</span>
        <span>{opisKodow(z.kodyLiterowe)}</span>
        <span>{t.platnik({ nazwa: z.platnik })}</span>
      </span>
    ),
  }));
  if (alternatywne) {
    opcje.unshift({
      wartosc: WARTOSC_ALTERNATYWNEGO,
      etykieta: alternatywne.seriaINumer || t.trybAlternatywny,
      opis: (
        <span className="flex flex-wrap gap-x-6 gap-y-1 font-normal">
          <span>
            {t.okresZDniami({ od: formatujDate(alternatywne.od), do: formatujDate(alternatywne.do), dni: String(liczbaDniWlacznie(alternatywne)) })}
          </span>
          <span>{t.trybAlternatywny}</span>
        </span>
      ),
    });
  }

  const zaswiadczenieWyboru = (w: string | null): ZaswiadczenieWnioskuZas53 | null => {
    if (w === WARTOSC_ALTERNATYWNEGO) return alternatywne ?? null;
    const z = lista.find((e) => kluczZaswiadczenia(e.seriaINumer) === w);
    return z ? zaswiadczenieZEzla(z) : null;
  };

  const ustalIPrzejdz = (z: ZaswiadczenieWnioskuZas53) => {
    ustawZajety(true);
    const ctx = pobierzKontekstOperacji();
    const prawo = ustalPrawoZas53({ zaswiadczenie: z, kopia: k.kopia, wnioski: k.rodzina.wnioski, wypadek: wniosek.wypadek?.tak ?? false });
    if (prawo.blokuje) {
      ustawZajety(false);
      setBlokada(prawo.komunikaty[0] ?? null);
      setArkusz(false);
      if (z.zrodlo === 'tryb-alternatywny') {
        zapiszKrokZas53(wniosek.idWniosku, { zaswiadczenie: z, okresPrawa: undefined }, 'ViewZas53Certificate', ctx);
      }
      return;
    }
    const ekran = prawo.poUstaniu ? 'ViewZas53AfterInsurance' : 'ViewZas53Data';
    const zmiana = { ...polaSzkicuZUstalenia(prawo), oswiadczenieZ10: prawo.poUstaniu ? wniosek.oswiadczenieZ10 : undefined };
    const zalaczniki = zbudujZalaczniki({ ...wniosek, ...zmiana });
    const wynik = zapiszKrokZas53(wniosek.idWniosku, { ...zmiana, zalaczniki }, ekran, ctx);
    if (!wynik.ok) {
      ustawZajety(false);
      setBlad(wynik.kod);
      return;
    }
    przejdz(adresEkranuZas53(ekran, wniosek.idWniosku));
  };

  const dalej = () => {
    setBlokada(null);
    if (!walidacja.sprobujWyslac()) return;
    const z = zaswiadczenieWyboru(wybrane);
    if (!z) {
      setBlad('0006');
      return;
    }
    setBlad(null);
    ustalIPrzejdz(z);
  };

  const zapiszDoDokonczenia = () => {
    const z = zaswiadczenieWyboru(wybrane);
    const wynik = zapiszKrokZas53(wniosek.idWniosku, z ? { zaswiadczenie: z } : {}, 'ViewZas53Certificate', pobierzKontekstOperacji());
    if (!wynik.ok) {
      setZapisany(wynik.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseDetails' });
    przejdz(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy }));
  };

  return (
    <>
      <NaglowekKreatoraZas53 />
      <div className="flex flex-col gap-7.5">
        <PostepZas53 ekran="ViewZas53Certificate" poUstaniu={poUstaniu} idWniosku={wniosek.idWniosku} wypadek={wniosek.wypadek?.tak ?? false} />
        {zapisany ? <Komunikat kod={zapisany} /> : null}
        <UkladDwuKolumnowy
          etykietaBocznej={tS.kartaUbezpieczenia}
          tresc={
            <div className="flex flex-col gap-7.5">
              <Karta tytul={t.karta} bezLinii as="section">
                <p className="m-0 mb-2">{t.wstep}</p>
                <p className="m-0 mb-6 text-body-strong">{t.stanNa({ data: k.kopia ? formatujDate(k.kopia.odczytano) : formatujDate(dzis) })}</p>
                {blokada ? (
                  <Komunikat
                    className="mb-6"
                    kod={blokada.kod}
                    parametry={blokada.parametry as never}
                    akcje={
                      blokada.kod === '0235' ? (
                        <div className="flex flex-wrap gap-4">
                          <PrzyciskLink href={trasy.ViewFamilyPlan()} wariant="drugorzedny">
                            {t.akcjaPlan}
                          </PrzyciskLink>
                          <PrzyciskLink href={trasy.ViewZusQuestion({ sprawa: wniosek.idSprawy })} wariant="tlo">
                            {t.akcjaPytanie}
                          </PrzyciskLink>
                        </div>
                      ) : undefined
                    }
                  />
                ) : null}
                {opcje.length > 0 ? (
                  <GrupaOpcji
                    nazwa="zaswiadczenie"
                    legenda={t.legenda({ liczba: opcje.length })}
                    opcje={opcje}
                    wartosc={wybrane}
                    onZmiana={(w) => {
                      setWybor(w);
                      setBlad(null);
                      setBlokada(null);
                    }}
                    {...walidacja.pole('zaswiadczenie')}
                    uklad="karty"
                  />
                ) : (
                  <>
                    <Notatka>{t.brakZaswiadczen}</Notatka>
                    {blad === '0006' ? <Komunikat className="mt-4" kod="0006" /> : null}
                  </>
                )}
                {blad && blad !== '0006' ? <Komunikat className="mt-4" kod={blad} /> : null}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-sm bg-surface-page px-5 py-4">
                  <div className="min-w-0 grow-999 basis-100">
                    <p className="m-0 mb-1 text-body-strong">{t.spozaListyTytul}</p>
                    <p className="m-0">{t.spozaListyOpis}</p>
                  </div>
                  <Przycisk type="button" wariant="drugorzedny" onClick={() => setArkusz(true)} className="grow">
                    {t.spozaListyAkcja}
                  </Przycisk>
                </div>
                <Notatka className="mt-6">{t.notatkaWyslane}</Notatka>
              </Karta>
              <AkcjeKreatoraZas53
                wstecz={trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy })}
                onZapisz={zapiszDoDokonczenia}
                onDalej={dalej}
                zajety={zajety}
              />
            </div>
          }
          boczna={
            <Karta tytul={tS.kartaUbezpieczenia} bezLinii as="section">
              <p className="m-0 mb-3 text-body-strong">{t.stanNa({ data: formatujDate(dzis) })}</p>
              <DaneWKolumnieBocznej
                pozycje={[
                  { etykieta: tS.tytulUbezpieczenia, wartosc: tytul ? tS.rodzajeTytulu[tytul.rodzaj] : tS.brakTytulu },
                  { etykieta: tS.ubezpieczenieChorobowe, wartosc: opisChorobowego(tytul, false) },
                  { etykieta: tS.platnikZasilku, wartosc: tS.zus },
                ]}
              />
              <h3 className="m-0 mt-6 mb-2 text-tile-title text-ink">{poUstaniu ? t.poUstaniuTytul : t.coSprawdzimy}</h3>
              <ul className="m-0 grid gap-1 pl-5">
                {(poUstaniu ? t.poUstaniuPozycje : t.coSprawdzimyPozycje).map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Karta>
          }
        />
      </div>
      <ArkuszZaswiadczeniaSpozaListy
        otwarte={arkusz}
        onZamknij={() => setArkusz(false)}
        poczatkowe={alternatywne}
        onZapisz={(z) => {
          setWybor(WARTOSC_ALTERNATYWNEGO);
          setBlad(null);
          setBlokada(null);
          ustalIPrzejdz(z);
        }}
      />
    </>
  );
}
