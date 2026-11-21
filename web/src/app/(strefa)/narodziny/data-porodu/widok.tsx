'use client';

// ViewBirthDate (3.3.2.1.1, 3.3.2.2.1 KA-07): data porodu i liczba urodzonych dzieci.
// Tryb pakietu (/narodziny/data-porodu, Rodzic) zapisuje datę w profilu rodziny i przelicza plan;
// tryb profilu (/profil-na-start/data-porodu) zapisuje ją w szkicu Profilu na start.
// Wzory: cz1/P10-04, P10-05, P10-06, P10-07, P10-08.
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useDzis, useRodzina, useStanKonta } from '@/dane/magazyn/hooki';
import { potwierdzDatePorodu } from '@/dane/magazyn/operacje/narodziny';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { formatujDate } from '@/domena/daty';
import { czyMaZgode } from '@/domena/konto';
import { nastepnyEkran, poprzedniEkran } from '@/domena/profil/nawigacja';
import { porownajZDanymiZus, type PoleDatyPorodu } from '@/domena/rodzina/narodziny';
import type { CzlonekRodzinyZus, DaneCiazyIDziecka, KodKomunikatu, SzkicProfilu } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { ListaDefinicji } from '@/komponenty/lista-definicji';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { PoleDaty } from '@/komponenty/pole-tekstowe';
import { PoleWyboru } from '@/komponenty/pole-wyboru';
import { Przycisk, PrzyciskLink } from '@/komponenty/przycisk';
import type { TrybWidoku } from '@/komponenty/rama/mapa-tras';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { StanPusty } from '@/komponenty/stan-pusty';
import { Stos, Wiersz } from '@/komponenty/uklad';
import { teksty } from '@/teksty';

const t = teksty.ViewBirthDate;

const ID_POL: Record<PoleDatyPorodu, string> = { dataPorodu: 'data-porodu', liczbaDzieci: 'liczba-dzieci' };
const OPCJE_LICZBY = (['1', '2', '3', '4', '5'] as const).map((w) => ({ wartosc: w, etykieta: w }));

type Bledy = Partial<Record<PoleDatyPorodu, KodKomunikatu>>;

/** Rozbieżność daty porodu w profilu z dziećmi z danych ZUS (3.3.2.2.1 KA-07). */
function rozbieznoscZZus(dane: DaneCiazyIDziecka | null): { dataWProfilu: string; dzieci: CzlonekRodzinyZus[] } | null {
  const oczekujace = dane?.noweDzieckoOczekujace?.dzieci ?? [];
  if (!dane?.dataPoroduPotwierdzona || dane.dataPorodu === undefined || oczekujace.length === 0) return null;
  return porownajZDanymiZus(dane.dataPorodu, oczekujace) === '0063' ? { dataWProfilu: dane.dataPorodu, dzieci: oczekujace } : null;
}

export function WidokDatyPorodu({ tryb }: { tryb: TrybWidoku<'ViewBirthDate'> }) {
  const stanKonta = useStanKonta();
  const rodzina = useRodzina();
  const szkic = stanKonta?.szkicProfilu ?? null;
  if (tryb === 'pakiet' && rodzina === null) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={{ href: sciezkaWidoku('ViewFamilyPlan'), etykieta: t.powrotDoPlanu }} />
        <StanPusty ikona="plan">{t.brakRodziny}</StanPusty>
      </>
    );
  }
  return (
    <FormularzDatyPorodu
      tryb={tryb}
      daneCiazy={tryb === 'pakiet' ? (rodzina?.daneCiazy ?? null) : null}
      szkic={szkic}
      zgoda={stanKonta !== null && czyMaZgode(stanKonta.konto.decyzjeOZgodzie)}
    />
  );
}

interface PropsFormularza {
  tryb: TrybWidoku<'ViewBirthDate'>;
  daneCiazy: DaneCiazyIDziecka | null;
  szkic: SzkicProfilu | null;
  zgoda: boolean;
}

function FormularzDatyPorodu({ tryb, daneCiazy, szkic, zgoda }: PropsFormularza) {
  const router = useRouter();
  const dzis = useDzis();
  const profil = tryb === 'profil';
  const rozbieznosc = profil ? null : rozbieznoscZZus(daneCiazy);
  const zrodloDanych = profil ? szkic?.daneCiazy : daneCiazy;

  const [data, setData] = useState(() => {
    if (rozbieznosc) return formatujDate(rozbieznosc.dzieci[0].dataUrodzenia);
    return profil && szkic?.daneCiazy.dataPorodu ? formatujDate(szkic.daneCiazy.dataPorodu) : '';
  });
  const [liczba, setLiczba] = useState<string>(() => {
    if (rozbieznosc) return String(Math.min(rozbieznosc.dzieci.filter((d) => d.dataUrodzenia === rozbieznosc.dzieci[0].dataUrodzenia).length, 5));
    return String(zrodloDanych?.liczbaUrodzonychDzieci ?? zrodloDanych?.liczbaDzieciZCiazy ?? 1);
  });
  const [bledy, setBledy] = useState<Bledy>({});
  const [bladZapisu, setBladZapisu] = useState<KodKomunikatu | null>(null);
  const [zajety, setZajety] = useState(false);

  const przewidywany = zrodloDanych?.przewidywanyTerminPorodu;
  const powrot = profil
    ? { href: sciezkaWidoku(szkic ? poprzedniEkranProfilu(szkic, zgoda) : 'ViewProfileSituation'), etykieta: t.powrotDoSytuacji }
    : { href: sciezkaWidoku('ViewFamilyPlan'), etykieta: t.powrotDoPlanu };

  function wyslij(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setZajety(true);
    const wynik = potwierdzDatePorodu(
      { dataPorodu: data, liczbaDzieci: liczba, zrodlo: profil ? 'profil' : rozbieznosc ? 'rozna-data' : 'plan' },
      pobierzKontekstOperacji(),
    );
    setZajety(false);
    if (!wynik.ok) {
      if (wynik.bledyPol) {
        const nowe = wynik.bledyPol as Bledy;
        setBledy(nowe);
        setBladZapisu(null);
        const pierwsze = (Object.keys(ID_POL) as PoleDatyPorodu[]).find((p) => nowe[p] !== undefined);
        if (pierwsze) document.getElementById(ID_POL[pierwsze])?.focus();
      } else {
        setBledy({});
        setBladZapisu(wynik.kod);
      }
      return;
    }
    if (profil) {
      const poZapisie: SzkicProfilu | null = szkic
        ? { ...szkic, daneCiazy: { ...szkic.daneCiazy, dataPoroduPotwierdzona: true } }
        : null;
      router.push(sciezkaWidoku(poZapisie ? nastepnyEkranProfilu(poZapisie, zgoda) : 'ViewProfileEmploymentChange'));
      return;
    }
    router.push(zgoda ? sciezkaWidoku('ViewBirthDetails', { tryb: 'pakiet' }) : sciezkaWidoku('ViewBirthPackage'));
  }

  const pola = (
    <Stos odstep={6}>
      <PoleDaty
        id={ID_POL.dataPorodu}
        nazwa="dataPorodu"
        etykieta={t.poleDaty.etykieta}
        podpowiedz={t.poleDaty.podpowiedz}
        wartosc={data}
        onZmiana={setData}
        blad={bledy.dataPorodu ?? null}
        wymagane
      />
      <PoleWyboru
        id={ID_POL.liczbaDzieci}
        nazwa="liczbaDzieci"
        etykieta={t.poleLiczby.etykieta}
        podpowiedz={profil ? t.poleLiczby.podpowiedzProfil : t.poleLiczby.podpowiedz}
        opcje={OPCJE_LICZBY}
        pustaOpcja={t.poleLiczby.wybierz}
        wartosc={liczba as (typeof OPCJE_LICZBY)[number]['wartosc'] | ''}
        onZmiana={setLiczba}
        blad={bledy.liczbaDzieci ?? null}
        szerokosc="srednia"
        wymagane
      />
    </Stos>
  );

  const przyciski = (
    <Wiersz odstep={4} className="flex-wrap">
      <Przycisk wariant="glowny" type="submit" zajety={zajety}>
        {profil ? teksty.wspolne.przyciski.dalej : t.potwierdz}
      </Przycisk>
      <PrzyciskLink wariant="drugorzedny" href={powrot.href}>
        {profil ? teksty.wspolne.przyciski.wroc : t.anuluj}
      </PrzyciskLink>
    </Wiersz>
  );

  return (
    <>
      <NaglowekStrony tytul={t.naglowek} powrot={powrot} wstep={profil ? t.leadProfil : undefined} />
      <Stos odstep={6}>
        {rozbieznosc ? <Komunikat kod="0063" /> : null}
        {bladZapisu ? <Komunikat kod={bladZapisu} /> : null}
        <form noValidate onSubmit={wyslij}>
          <Karta as="div">
            <Stos odstep={6}>
              {rozbieznosc ? (
                <>
                  <p className="m-0 text-body">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
                  <ListaDefinicji
                    pozycje={[
                      { etykieta: t.rozbieznosc.dataWProfilu, wartosc: formatujDate(rozbieznosc.dataWProfilu) },
                      { etykieta: t.rozbieznosc.dataWZus, wartosc: formatujDate(rozbieznosc.dzieci[0].dataUrodzenia) },
                      {
                        etykieta: t.rozbieznosc.dzieckoWZus,
                        wartosc: rozbieznosc.dzieci.map((d) => `${d.imie} ${d.nazwisko}`).join(', '),
                      },
                    ]}
                  />
                  <p className="m-0 text-body">{t.wstepRozbieznosc}</p>
                </>
              ) : profil ? (
                <p className="m-0 text-body">{t.wstepProfil}</p>
              ) : (
                <Stos odstep={3}>
                  <p className="m-0 text-body">{t.wstep}</p>
                  {przewidywany ? (
                    <p className="m-0 text-body">
                      {t.przewidywanyTermin} <strong>{formatujDate(przewidywany)}</strong>
                    </p>
                  ) : null}
                </Stos>
              )}
              {pola}
              {profil ? (
                <Notatka>
                  <p>{t.notkaProfil}</p>
                </Notatka>
              ) : null}
              {przyciski}
            </Stos>
          </Karta>
        </form>
      </Stos>
    </>
  );
}

function nastepnyEkranProfilu(szkic: SzkicProfilu, zgoda: boolean) {
  const nastepny = nastepnyEkran(szkic, zgoda);
  return nastepny === 'ViewBirthDate' ? 'ViewProfileEmploymentChange' : nastepny;
}

function poprzedniEkranProfilu(szkic: SzkicProfilu, zgoda: boolean) {
  const poprzedni = poprzedniEkran(szkic, zgoda);
  return poprzedni === 'ViewBirthDate' ? 'ViewProfileSituation' : poprzedni;
}
