'use client';

// ViewZ15Data: dane wnioskodawcy i płatnika składek z konta ZUS (bez zmiany), numer telefonu, rachunek albo przekaz
// pocztowy i uwagi. Komunikaty 0241, 0325 i 0324 zależą od płatnika zasiłku.
import { useState } from 'react';
import { normalizujRachunek, normalizujTelefon, walidujRachunek, walidujTelefon } from '@/domena/walidacje';
import type { WniosekZ15 } from '@/domena/typy';
import { formatujDate } from '@/domena/daty';
import { tytulZChorobowymZ15 } from '@/domena/wnioski/z15';
import { useDzis, useStanKonta } from '@/dane/magazyn/hooki';
import { zapiszKrokZ15 } from '@/dane/magazyn/operacje/wnioski-z15';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { adresCzesci } from '@/komponenty/czesci-formularza';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleTekstowe, PoleTekstuDlugiego } from '@/komponenty/pole-tekstowe';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import {
  AkcjeKreatoraZ15,
  adresEkranuZ15,
  BrakWnioskuZ15,
  NaglowekKreatoraZ15,
  PanelWnioskuZ15,
  PostepZ15,
  useWniosekZ15,
} from '../_czesci/kreator';

const t = teksty.ViewZ15Data;
const tS = teksty.ViewZ15Start;
type Pole = 'telefon' | 'rachunek' | 'uwagi';
interface Formularz { telefon: string; rachunek: string; uwagi: string }

export function WidokDanychZ15() {
  const k = useWniosekZ15();
  if (!k) return <BrakWnioskuZ15 />;
  return <Formularz kontekst={k} />;
}

function Formularz({ kontekst: { wniosek, kopia } }: { kontekst: NonNullable<ReturnType<typeof useWniosekZ15>> }) {
  const dzis = useDzis();
  const stanKonta = useStanKonta();
  const { zajety, przejdz } = useNawigacjaZLadowaniem();
  const tytul = tytulZChorobowymZ15(kopia, dzis);
  const telefonPrzypomnien = (stanKonta?.ustawienia as { telefon?: { numer?: string } } | null | undefined)?.telefon?.numer ?? '';
  const uwagiDomyslne =
    wniosek.sytuacja === 'dodatkowy-nowo-narodzone' && wniosek.sytuacjaMatki
      ? teksty.ViewZ15Data.uwagiDodatkowego({
          sytuacjaMatki: teksty.ViewZ15Situation.sytuacjeMatki[wniosek.sytuacjaMatki.rodzaj].toLowerCase(),
          dataZdarzenia: formatujDate(wniosek.sytuacjaMatki.dataZdarzenia),
        })
      : '';
  const [f, setF] = useState<Formularz>({
    telefon: wniosek.numerTelefonu ?? telefonPrzypomnien,
    rachunek: wniosek.numerRachunku ?? '',
    uwagi: wniosek.uwagi ?? uwagiDomyslne,
  });
  const [blad, setBlad] = useState<string | null>(null);
  const walidacja = useWalidacjaNaBiezaco<Pole, Formularz, string>({
    wartosci: f,
    waliduj: (w) => ({
      telefon: w.telefon.trim() ? walidujTelefon(w.telefon) : null,
      rachunek: walidujRachunek(w.rachunek, false),
      uwagi: w.uwagi.length > 500 ? t.bladUwag : null,
    }),
    wymagane: [],
  });
  const platnikNazwa = tytul?.platnik.nazwa ?? '';
  const platnikZasilku = wniosek.platnikZasilku ?? 'zus';

  const zmiana = (): Partial<WniosekZ15> => ({
    wnioskodawca: kopia ? { imie: kopia.imie, nazwisko: kopia.nazwisko, pesel: kopia.pesel, adres: kopia.adres } : undefined,
    platnik: tytul ? { nazwa: tytul.platnik.nazwa, nip: tytul.platnik.nip, regon: tytul.platnik.regon } : undefined,
    numerTelefonu: f.telefon.trim() ? normalizujTelefon(f.telefon) : undefined,
    numerRachunku: f.rachunek.trim() ? normalizujRachunek(f.rachunek) : undefined,
    uwagi: f.uwagi.trim() || undefined,
  });

  const dalej = () => {
    if (!walidacja.sprobujWyslac()) return;
    const wynik = zapiszKrokZ15(wniosek.idWniosku, zmiana(), 'ViewZ15Summary', pobierzKontekstOperacji());
    if (!wynik.ok) return setBlad(tS.kreator.bladZapisu);
    przejdz(adresEkranuZ15('ViewZ15Summary', wniosek.idWniosku));
  };

  return (
    <>
      <NaglowekKreatoraZ15 />
      <UkladDwuKolumnowy
        etykietaBocznej={t.daneZKonta}
        tresc={
          <Stos odstep={4}>
            <PostepZ15 ekran="ViewZ15Data" />
            <Karta tytul={tS.kreator.kroki.ViewZ15Data} bezLinii as="section">
              <Stos odstep={4}>
                {platnikZasilku === 'nieustalony' ? <Komunikat tresc={t.k0324({ platnik: platnikNazwa })} typ="INFO" /> : null}
                <PoleTekstowe id="telefon" etykieta={t.telefon} typ="tel" inputMode="tel" szerokosc="srednia" wartosc={f.telefon} onZmiana={(v) => setF((p) => ({ ...p, telefon: v }))} {...walidacja.pole('telefon')} />
                <PoleTekstowe id="rachunek" etykieta={t.rachunek} inputMode="numeric" wartosc={f.rachunek} onZmiana={(v) => setF((p) => ({ ...p, rachunek: v }))} {...walidacja.pole('rachunek')} />
                {platnikZasilku === 'zus' && !f.rachunek.trim() ? <Komunikat tresc={t.k0241({ adres: kopia?.adres ?? '' })} typ="INFO" /> : null}
                {platnikZasilku === 'platnik-skladek' ? <Komunikat tresc={t.k0325({ platnik: platnikNazwa })} typ="INFO" /> : null}
                <PoleTekstuDlugiego id="uwagi" etykieta={t.uwagi} wartosc={f.uwagi} maksDlugosc={500} onZmiana={(v) => setF((p) => ({ ...p, uwagi: v }))} {...walidacja.pole('uwagi')} />
                {blad ? <Komunikat tresc={blad} typ="ERROR" /> : null}
              </Stos>
            </Karta>
            <AkcjeKreatoraZ15
              onWstecz={() => przejdz(adresCzesci(adresEkranuZ15('ViewZ15Statements', wniosek.idWniosku), 2))}
              onZapisz={() => setBlad(zapiszKrokZ15(wniosek.idWniosku, zmiana(), 'ViewZ15Data', pobierzKontekstOperacji()).ok ? null : tS.kreator.bladZapisu)}
              onDalej={dalej}
              zajety={zajety}
            />
          </Stos>
        }
        boczna={
          <Stos odstep={4}>
            <Karta tytul={t.daneZKonta} bezLinii as="section">
              <ListaDefinicji
                szerokoscEtykiety="waska"
                pozycje={[
                  { etykieta: t.wnioskodawca, wartosc: kopia ? `${kopia.imie} ${kopia.nazwisko}, PESEL ${kopia.pesel}` : '' },
                  { etykieta: t.adres, wartosc: kopia?.adres ?? '' },
                  ...(tytul ? [{ etykieta: t.platnikSkladek, wartosc: `${tytul.platnik.nazwa}, ${t.nipRegon({ nip: tytul.platnik.nip, regon: tytul.platnik.regon })}` }] : []),
                ]}
              />
              <p className="m-0 mt-3 text-small">{t.zmianaAdresu}</p>
            </Karta>
            <PanelWnioskuZ15 wniosek={wniosek} />
          </Stos>
        }
      />
    </>
  );
}
