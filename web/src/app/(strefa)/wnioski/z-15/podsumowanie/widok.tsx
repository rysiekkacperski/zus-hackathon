'use client';

// ViewZ15Summary: podsumowanie wniosku w zakładkach (wniosek, kwota i terminy, załączniki i wysyłka), szacunkowa kwota
// albo stawka 80% (0318, 0319), przedawnienie (0320, 0321), zaświadczenie Z-3 albo Z-3a (0322), załączniki (0149),
// oświadczenie końcowe, wysyłka do ZUS albo przygotowanie wniosku dla płatnika składek.
import { useState } from 'react';
import { formatujDate, liczbaDniWlacznie, porownajDaty } from '@/domena/daty';
import { formatujKwoteBezWaluty } from '@/domena/kwoty';
import type { KodKomunikatu } from '@/domena/typy';
import {
  dniWnioskuPoWylaczeniach,
  podstawaWymiaruZ15,
  stawkaDziennaZ15,
  terminPrzedawnieniaZ15,
  tytulZChorobowymZ15,
  zalacznikiZ15,
} from '@/domena/wnioski/z15';
import { useDzis } from '@/dane/magazyn/hooki';
import { dolaczPlikZ15, przygotujZ15DlaPlatnika, wyslijZ15, zapiszKrokZ15 } from '@/dane/magazyn/operacje/wnioski-z15';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { useNawigacjaZLadowaniem } from '@/komponenty/nawigacja-z-ladowaniem';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { Stos, UkladDwuKolumnowy } from '@/komponenty/uklad';
import { Zakladki, useZakladkaWAdresie } from '@/komponenty/zakladki';
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

const t = teksty.ViewZ15Summary;
const tS = teksty.ViewZ15Start;
const ZAKLADKI = ['wniosek', 'kwota', 'wysylka'] as const;
type Zakladka = (typeof ZAKLADKI)[number];

export function WidokPodsumowaniaZ15() {
  const k = useWniosekZ15();
  if (!k) return <BrakWnioskuZ15 />;
  return <Podsumowanie kontekst={k} />;
}

function Podsumowanie({ kontekst: { wniosek, rodzina, kopia } }: { kontekst: NonNullable<ReturnType<typeof useWniosekZ15>> }) {
  const dzis = useDzis();
  const { zajety, ustawZajety, przejdz } = useNawigacjaZLadowaniem();
  const [zakladka, ustawZakladke] = useZakladkaWAdresie<Zakladka>(ZAKLADKI);
  const [potwierdzone, setPotwierdzone] = useState(wniosek.oswiadczeniePotwierdzone);
  const [bladOswiadczenia, setBladOswiadczenia] = useState(false);
  const [blad, setBlad] = useState<{ kod?: KodKomunikatu; tresc?: string } | null>(null);

  const tytul = tytulZChorobowymZ15(kopia, dzis);
  const platnikZasilku = wniosek.platnikZasilku ?? 'zus';
  const doZus = platnikZasilku === 'zus';
  const nazwaPlatnika = tytul?.platnik.nazwa ?? '';
  const platnikTekst = doZus ? t.adresatZus : nazwaPlatnika;
  const { dni } = dniWnioskuPoWylaczeniach(wniosek, rodzina.wnioski);
  const pierwszy = [...wniosek.okresy].sort((a, b) => porownajDaty(a.od, b.od))[0];
  const podstawa = pierwszy ? podstawaWymiaruZ15(tytul, pierwszy.od) : null;
  const stawka = podstawa === null ? null : stawkaDziennaZ15(podstawa);
  const kwota = stawka === null ? null : stawka * dni.length;
  const zalaczniki = zalacznikiZ15(wniosek);
  const z3 = !doZus || tytul?.rodzaj === 'dzialalnosc' ? null : tytul?.rodzaj === 'zleceniobiorca' ? t.zaswiadczenieZ3a : t.zaswiadczenieZ3;

  const zakladki = [
    { wartosc: 'wniosek' as const, etykieta: t.zakladkaWniosek },
    { wartosc: 'kwota' as const, etykieta: t.zakladkaKwota },
    { wartosc: 'wysylka' as const, etykieta: t.zakladkaWysylka, blad: bladOswiadczenia },
  ];

  const zapiszPotwierdzenie = (wartosc: boolean) => {
    setPotwierdzone(wartosc);
    setBladOswiadczenia(false);
    zapiszKrokZ15(wniosek.idWniosku, { oswiadczeniePotwierdzone: wartosc, dniZasilku: dni.length, stawkaDzienna: stawka ?? undefined, szacunkowaKwota: kwota ?? undefined }, 'ViewZ15Summary', pobierzKontekstOperacji());
  };

  const wyslij = async () => {
    if (!potwierdzone) {
      setBladOswiadczenia(true);
      ustawZakladke('wysylka');
      return;
    }
    ustawZajety(true);
    const ctx = pobierzKontekstOperacji();
    if (doZus) {
      const wynik = await wyslijZ15(wniosek.idWniosku, zalaczniki.map((z) => z.id), ctx);
      if (!wynik.ok) {
        ustawZajety(false);
        setBlad(wynik.kod === '0149' ? { tresc: t.k0149 } : { kod: wynik.kod });
        ustawZakladke('wysylka');
        return;
      }
      przejdz(adresEkranuZ15('ViewZ15Sent', wniosek.idWniosku), { zastap: true });
      return;
    }
    const wynik = przygotujZ15DlaPlatnika(wniosek.idWniosku, ctx);
    if (!wynik.ok) {
      ustawZajety(false);
      setBlad({ kod: wynik.kod });
      return;
    }
    przejdz(adresEkranuZ15('ViewZ15ForPayer', wniosek.idWniosku), { zastap: true });
  };

  const dolacz = async (id: string, rodzaj: string, plik: File | undefined) => {
    if (!plik) return;
    const wynik = await dolaczPlikZ15(wniosek.idWniosku, id, rodzaj, plik, pobierzKontekstOperacji());
    setBlad(wynik.ok ? null : { kod: wynik.kod });
  };

  return (
    <>
      <NaglowekKreatoraZ15 />
      <UkladDwuKolumnowy
        etykietaBocznej={tS.kreator.twojWniosek}
        tresc={
          <Stos odstep={4}>
            <PostepZ15 ekran="ViewZ15Summary" />
            <Zakladki etykieta={t.zakladki} zakladki={zakladki} wybrana={zakladka} onWybor={ustawZakladke} tloPaneli="card">
              {zakladka === 'wniosek' ? (
                <ListaDefinicji
                  szerokoscEtykiety="waska"
                  pozycje={[
                    ...(wniosek.osoba ? [{ etykieta: tS.kreator.osoba, wartosc: t.osoba({ imieINazwisko: `${wniosek.osoba.imie} ${wniosek.osoba.nazwisko}`, pesel: wniosek.osoba.pesel }) }] : []),
                    ...(wniosek.sytuacja ? [{ etykieta: tS.kreator.sytuacja, wartosc: tS.sytuacje[wniosek.sytuacja] }] : []),
                    ...wniosek.okresy.map((o, i) => ({
                      etykieta: teksty.ViewZ15Situation.okresNr({ numer: i + 1 }),
                      wartosc: t.okresZSeria({ okres: tS.kreator.okres({ od: formatujDate(o.od), do: formatujDate(o.do), dni: String(liczbaDniWlacznie(o)) }), seriaINumer: o.seriaINumer }),
                    })),
                    { etykieta: t.adresat, wartosc: platnikTekst },
                  ]}
                />
              ) : null}
              {zakladka === 'kwota' ? (
                <Stos odstep={4}>
                  {podstawa !== null && stawka !== null && kwota !== null ? (
                    <>
                      <ListaDefinicji
                        szerokoscEtykiety="waska"
                        pozycje={[
                          { etykieta: t.podstawa, wartosc: t.kwotaZl({ kwota: formatujKwoteBezWaluty(podstawa) }) },
                          { etykieta: t.stawka, wartosc: t.kwotaZl({ kwota: formatujKwoteBezWaluty(stawka) }) },
                          { etykieta: t.dniZasilku, wartosc: String(dni.length) },
                        ]}
                      />
                      <Komunikat
                        tresc={t.k0318({ dni: String(dni.length), kwota: formatujKwoteBezWaluty(kwota), stawka: formatujKwoteBezWaluty(stawka), platnik: platnikTekst })}
                        typ="INFO"
                      />
                    </>
                  ) : (
                    <Komunikat tresc={t.k0319({ platnik: platnikTekst })} typ="INFO" />
                  )}
                  {wniosek.okresy.map((o) => {
                    const termin = terminPrzedawnieniaZ15(o);
                    const minal = porownajDaty(termin, dzis) < 0;
                    const p = { od: formatujDate(o.od), do: formatujDate(o.do), termin: formatujDate(termin) };
                    return <Komunikat key={`${o.od}-${o.do}`} tresc={minal ? t.k0321(p) : t.k0320(p)} typ={minal ? 'WARNING' : 'INFO'} />;
                  })}
                </Stos>
              ) : null}
              {zakladka === 'wysylka' ? (
                <Stos odstep={4}>
                  {z3 ? <Komunikat tresc={t.k0322({ zaswiadczenie: z3, platnik: nazwaPlatnika })} typ="INFO" /> : null}
                  {zalaczniki.length === 0 ? (
                    <p className="m-0">{t.brakZalacznikow}</p>
                  ) : (
                    <>
                      <Komunikat tresc={t.k0149} typ="INFO" />
                      <ul className="m-0 flex list-none flex-col gap-3 p-0">
                        {zalaczniki.map((z) => (
                          <li key={z.id} className="flex flex-wrap items-center gap-4">
                            <span className="text-body-strong">{t.zalaczniki[z.rodzaj] ?? z.rodzaj}</span>
                            {doZus ? (
                              z.plik ? (
                                <span>{t.plikDolaczony({ nazwa: z.plik.nazwa })}</span>
                              ) : (
                                <label className="cursor-pointer text-link underline">
                                  {t.dolaczPlik}
                                  <input
                                    type="file"
                                    accept="application/pdf,image/jpeg,image/png"
                                    className="sr-only"
                                    onChange={(e) => void dolacz(z.id, z.rodzaj, e.target.files?.[0])}
                                  />
                                </label>
                              )
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  <p className="m-0">{t.zasady}</p>
                  <PoleZaznaczenia
                    id="z15-oswiadczenie"
                    etykieta={t.oswiadczenie}
                    zaznaczone={potwierdzone}
                    onZmiana={zapiszPotwierdzenie}
                    blad={bladOswiadczenia ? t.bladOswiadczenia : null}
                  />
                  {blad ? <Komunikat kod={blad.kod} tresc={blad.tresc} typ="ERROR" /> : null}
                </Stos>
              ) : null}
            </Zakladki>
            <AkcjeKreatoraZ15
              onWstecz={() => przejdz(adresEkranuZ15('ViewZ15Data', wniosek.idWniosku))}
              onZapisz={() => zapiszPotwierdzenie(potwierdzone)}
              onDalej={() => void wyslij()}
              etykietaDalej={doZus ? t.wyslij : t.przygotuj}
              zajety={zajety}
            />
          </Stos>
        }
        boczna={<PanelWnioskuZ15 wniosek={wniosek} />}
      />
    </>
  );
}
