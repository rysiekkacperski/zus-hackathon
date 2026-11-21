'use client';

// ViewCatalogItemAdd: formularz nowej pozycji katalogu (historyjka 3.5.1.2.3; wzory P04-12, P04-13).
// Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047), a operacja dodajPozycje sprawdza rolę przy zapisie.
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { PolePrzesuniecia } from '@/app/(strefa)/panel/katalog/pozycje/nowa/_czesci/pole-przesuniecia';
import { WyborForm } from '@/app/(strefa)/panel/katalog/pozycje/nowa/_czesci/wybor-form';
import { dodajPozycje } from '@/dane/magazyn/operacje/katalog';
import { useKatalog } from '@/dane/magazyn/hooki';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import {
  ETAPY,
  KOTWICE_NOWEJ_POZYCJI,
  MAKS_DLUGOSC_OPISU,
  MAKS_DLUGOSC_TYTULU,
  RODZAJE_POZYCJI,
  RODZICE_NOWEJ_POZYCJI,
  UBEZPIECZENIA_CHOROBOWE,
  formularzNowejPozycjiPoczatkowy,
  nastepnyIdentyfikator,
  type FormularzNowejPozycji,
  type PoleNowejPozycji,
} from '@/domena/katalog/edycja';
import type { BledyPol, KodKomunikatu } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { PoleTekstowe, PoleTekstuDlugiego } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const ID_POL: Record<PoleNowejPozycji, string> = {
  tytul: 'tytul',
  rodzaj: 'rodzaj',
  etap: 'etap',
  rodzic: 'rodzic',
  formyZatrudnienia: 'formy-umowa-o-prace',
  instytucjaIKanal: 'instytucja',
  przesuniecie: 'przesuniecie',
};
const KOLEJNOSC_POL = Object.keys(ID_POL) as PoleNowejPozycji[];

export function WidokDodaniaPozycjiKatalogu() {
  const t = teksty.ViewCatalogItemAdd;
  const etykiety = teksty.ViewCatalogList.etykiety;
  const router = useRouter();
  const katalog = useKatalog();
  const [formularz, setFormularz] = useState<FormularzNowejPozycji>(formularzNowejPozycjiPoczatkowy);
  const [bledy, setBledy] = useState<BledyPol<PoleNowejPozycji>>({});
  const [bladOgolny, setBladOgolny] = useState<KodKomunikatu | null>(null);
  const [zapisywanie, setZapisywanie] = useState(false);

  const lista = trasy.ViewCatalogList({ zakladka: 'pozycje' });
  const nastepnyId = nastepnyIdentyfikator(katalog);

  function zmien<P extends keyof FormularzNowejPozycji>(pole: P, wartosc: FormularzNowejPozycji[P]) {
    setFormularz((poprzedni) => ({ ...poprzedni, [pole]: wartosc }));
  }

  function zapisz(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (zapisywanie) return;
    setZapisywanie(true);
    const wynik = dodajPozycje(formularz, pobierzKontekstOperacji());
    if (wynik.ok) {
      router.push(lista);
      return;
    }
    setZapisywanie(false);
    const bledyPol = (wynik.bledyPol ?? {}) as BledyPol<PoleNowejPozycji>;
    setBledy(bledyPol);
    setBladOgolny(wynik.bledyPol ? null : wynik.kod);
    const pierwszy = KOLEJNOSC_POL.find((pole) => bledyPol[pole] !== undefined);
    if (pierwszy !== undefined) document.getElementById(ID_POL[pierwszy])?.focus();
  }

  return (
    <>
      <NaglowekStrony
        tytul={t.naglowek}
        wstep={t.wstep({ id: nastepnyId })}
        powrot={{ href: lista, etykieta: t.powrot }}
      />
      <form noValidate onSubmit={zapisz} className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        {bladOgolny ? <Komunikat kod={bladOgolny} /> : null}
        <Karta tytul={t.sprawa.naglowek} bezLinii>
          <div className="flex max-w-160 flex-col gap-6">
            <PoleTekstowe
              id={ID_POL.tytul}
              etykieta={t.sprawa.tytul}
              podpowiedz={t.sprawa.podpowiedzTytulu}
              wartosc={formularz.tytul}
              onZmiana={(w) => zmien('tytul', w)}
              maksDlugosc={MAKS_DLUGOSC_TYTULU}
              autoComplete="off"
              blad={bledy.tytul ?? null}
              wymagane
            />
            <PoleWyboru
              id={ID_POL.rodzaj}
              etykieta={t.sprawa.rodzaj}
              opcje={RODZAJE_POZYCJI.map((r) => ({ wartosc: r, etykieta: etykiety.rodzaje[r] }))}
              wartosc={formularz.rodzaj}
              onZmiana={(w) => zmien('rodzaj', w)}
              pustaOpcja={t.sprawa.wybierzRodzaj}
              blad={bledy.rodzaj ?? null}
              wymagane
            />
            <PoleWyboru
              id={ID_POL.etap}
              etykieta={t.sprawa.etap}
              podpowiedz={t.sprawa.podpowiedzEtapu}
              opcje={ETAPY.map((e) => ({ wartosc: e, etykieta: etykiety.etapy[e] }))}
              wartosc={formularz.etap}
              onZmiana={(w) => zmien('etap', w)}
              pustaOpcja={t.sprawa.wybierzEtap}
              blad={bledy.etap ?? null}
              wymagane
            />
            <PoleWyboru
              id={ID_POL.rodzic}
              etykieta={t.sprawa.rodzic}
              opcje={RODZICE_NOWEJ_POZYCJI.map((r) => ({ wartosc: r, etykieta: etykiety.rodzice[r] }))}
              wartosc={formularz.rodzic}
              onZmiana={(w) => zmien('rodzic', w)}
              pustaOpcja={t.sprawa.wybierzRodzica}
              blad={bledy.rodzic ?? null}
              wymagane
            />
          </div>
        </Karta>

        <Karta tytul={t.warunek.naglowek} bezLinii>
          <div className="flex max-w-160 flex-col gap-6">
            <WyborForm
              wartosci={formularz.formyZatrudnienia}
              onZmiana={(w) => zmien('formyZatrudnienia', w)}
              blad={bledy.formyZatrudnienia}
            />
            <PoleWyboru
              id="chorobowe"
              etykieta={t.warunek.ubezpieczenie}
              podpowiedz={t.warunek.podpowiedzUbezpieczenia}
              opcje={UBEZPIECZENIA_CHOROBOWE.map((u) => ({ wartosc: u, etykieta: t.warunek.ubezpieczenia[u] }))}
              wartosc={formularz.ubezpieczenieChorobowe}
              onZmiana={(w) => {
                if (w !== '') zmien('ubezpieczenieChorobowe', w);
              }}
            />
          </div>
        </Karta>

        <Karta tytul={t.kanal.naglowek} bezLinii>
          <div className="flex max-w-160 flex-col gap-6">
            <PoleTekstuDlugiego
              id={ID_POL.instytucjaIKanal}
              etykieta={t.kanal.instytucja}
              podpowiedz={t.kanal.podpowiedzInstytucji}
              wartosc={formularz.instytucjaIKanal}
              onZmiana={(w) => zmien('instytucjaIKanal', w)}
              maksDlugosc={MAKS_DLUGOSC_OPISU}
              wiersze={3}
              blad={bledy.instytucjaIKanal ?? null}
              wymagane
            />
            <PoleWyboru
              id="kotwica"
              etykieta={t.kanal.kotwica}
              podpowiedz={t.kanal.podpowiedzKotwicy}
              opcje={KOTWICE_NOWEJ_POZYCJI.map((k) => ({ wartosc: k, etykieta: t.kanal.kotwice[k] }))}
              wartosc={formularz.kotwica}
              onZmiana={(w) => {
                if (w !== '') zmien('kotwica', w);
              }}
            />
            {formularz.kotwica === 'brak' ? (
              <Notatka>
                <p>{t.kanal.notatkaKotwicy}</p>
              </Notatka>
            ) : (
              <PolePrzesuniecia
                id={ID_POL.przesuniecie}
                wartosc={formularz.przesuniecie}
                jednostka={formularz.jednostkaPrzesuniecia}
                onZmianaWartosci={(w) => zmien('przesuniecie', w)}
                onZmianaJednostki={(j) => zmien('jednostkaPrzesuniecia', j)}
                blad={bledy.przesuniecie}
              />
            )}
            <PoleTekstuDlugiego
              id="koszt"
              etykieta={t.kanal.koszt}
              podpowiedz={t.kanal.podpowiedzKosztu}
              wartosc={formularz.kosztSpoznienia}
              onZmiana={(w) => zmien('kosztSpoznienia', w)}
              maksDlugosc={MAKS_DLUGOSC_OPISU}
              wiersze={3}
            />
            <div className="flex flex-wrap gap-4 pt-2">
              <Przycisk type="submit" wariant="glowny" zajety={zapisywanie}>
                {t.zapisz}
              </Przycisk>
              <PrzyciskLink href={lista} wariant="drugorzedny">
                {t.anuluj}
              </PrzyciskLink>
            </div>
          </div>
        </Karta>
      </form>
    </>
  );
}
