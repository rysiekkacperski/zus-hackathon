'use client';

// ViewZas53Certificate: krok 1 kreatora ZAS-53. Lista e-ZLA od najpóźniejszego początku, zaświadczenie spoza listy,
// ustalenie prawa do zasiłku (0084, 0086, 0182, 0234, 0235, 0236, 0242) i zapis szkicu.
import { useRouter } from 'next/navigation';
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
import { GrupaOpcji, idOpcjiGrupy, type OpcjaGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { UkladDwuKolumnowy } from '@/komponenty/uklad';
import {
  adresEkranuZas53,
  AkcjeKreatoraZas53,
  BrakWnioskuZas53,
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
  const router = useRouter();
  const [wybor, setWybor] = useState<string | null>(null);
  const [blad, setBlad] = useState<KodKomunikatu | null>(null);
  const [blokada, setBlokada] = useState<KomunikatZas53 | null>(null);
  const [arkusz, setArkusz] = useState(false);
  const [zapisany, setZapisany] = useState<KodKomunikatu | null>(null);

  const lista = useMemo<ZaswiadczenieEzla[]>(() => (k ? listaZaswiadczenZas53(k.kopia, k.rodzina.wnioski) : []), [k]);
  const dostep = useMemo(
    () => (k ? sprawdzDostepZas53({ stanZgody: stanZgody(k.konto.decyzjeOZgodzie), kopia: k.kopia, dzis }) : null),
    [k, dzis],
  );
  if (!k) return <BrakWnioskuZas53 />;
  const { wniosek } = k;
  const alternatywne = wniosek.zaswiadczenie?.zrodlo === 'tryb-alternatywny' ? wniosek.zaswiadczenie : undefined;
  const wybrane =
    wybor ??
    (wniosek.zaswiadczenie
      ? alternatywne
        ? WARTOSC_ALTERNATYWNEGO
        : kluczZaswiadczenia(wniosek.zaswiadczenie.seriaINumer)
      : null);
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

  const przejdz = (z: ZaswiadczenieWnioskuZas53) => {
    const ctx = pobierzKontekstOperacji();
    const prawo = ustalPrawoZas53({ zaswiadczenie: z, kopia: k.kopia, wnioski: k.rodzina.wnioski, wypadek: wniosek.wypadek?.tak ?? false });
    if (prawo.blokuje) {
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
      setBlad(wynik.kod);
      return;
    }
    router.push(adresEkranuZas53(ekran, wniosek.idWniosku));
  };

  const dalej = () => {
    setBlokada(null);
    const z = zaswiadczenieWyboru(wybrane);
    if (!z) {
      setBlad('0006');
      const pierwsza = opcje[0]?.wartosc;
      if (pierwsza) document.getElementById(idOpcjiGrupy('zaswiadczenie', pierwsza))?.focus();
      return;
    }
    setBlad(null);
    przejdz(z);
  };

  const zapiszDoDokonczenia = () => {
    const z = zaswiadczenieWyboru(wybrane);
    const wynik = zapiszKrokZas53(wniosek.idWniosku, z ? { zaswiadczenie: z } : {}, 'ViewZas53Certificate', pobierzKontekstOperacji());
    if (!wynik.ok) {
      setZapisany(wynik.kod);
      return;
    }
    ustawKomunikatPoPrzejsciu({ kod: '0058', dlaWidoku: 'ViewCaseDetails' });
    router.push(trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy }));
  };

  return (
    <>
      <NaglowekKreatoraZas53 />
      <div className="flex flex-col gap-7.5">
        <PostepZas53 ekran="ViewZas53Certificate" poUstaniu={poUstaniu} idWniosku={wniosek.idWniosku} />
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
                    blad={blad === '0006' ? blad : null}
                    uklad="karty"
                  />
                ) : (
                  <>
                    <Notatka>{t.brakZaswiadczen}</Notatka>
                    {blad === '0006' ? <Komunikat className="mt-4" kod="0006" /> : null}
                  </>
                )}
                {blad && blad !== '0006' ? <Komunikat className="mt-4" kod={blad} /> : null}
                <div className="mt-6 rounded-sm bg-surface-page px-5 py-4">
                  <p className="m-0 mb-1 text-body-strong">{t.spozaListyTytul}</p>
                  <p className="m-0 mb-4">{t.spozaListyOpis}</p>
                  <Przycisk type="button" wariant="drugorzedny" onClick={() => setArkusz(true)}>
                    {t.spozaListyAkcja}
                  </Przycisk>
                </div>
                <Notatka className="mt-6">{t.notatkaWyslane}</Notatka>
              </Karta>
              <AkcjeKreatoraZas53
                wstecz={trasy.ViewCaseDetails({ idSprawy: wniosek.idSprawy })}
                onZapisz={zapiszDoDokonczenia}
                onDalej={dalej}
              />
            </div>
          }
          boczna={
            <div className="flex flex-col gap-7.5">
              <Karta tytul={tS.kartaUbezpieczenia} bezLinii as="section">
                <p className="m-0 mb-4 text-body-strong">{t.stanNa({ data: formatujDate(dzis) })}</p>
                <ListaDefinicji
                  szerokoscEtykiety="waska"
                  pozycje={[
                    { etykieta: tS.tytulUbezpieczenia, wartosc: tytul ? tS.rodzajeTytulu[tytul.rodzaj] : tS.brakTytulu },
                    { etykieta: tS.ubezpieczenieChorobowe, wartosc: opisChorobowego(tytul, false) },
                    { etykieta: tS.platnikZasilku, wartosc: tS.zus },
                  ]}
                />
              </Karta>
              <Karta tytul={poUstaniu ? t.poUstaniuTytul : t.coSprawdzimy} bezLinii as="section">
                <ul className="m-0 grid gap-2 pl-5">
                  {(poUstaniu ? t.poUstaniuPozycje : t.coSprawdzimyPozycje).map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Karta>
            </div>
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
          przejdz(z);
        }}
      />
    </>
  );
}
