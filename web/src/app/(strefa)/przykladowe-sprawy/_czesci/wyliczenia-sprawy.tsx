// Wyliczenia świadczeń przykładowej sprawy i ich porównanie z rozstrzygnięciem. Właściciel: u21.
// Komponent pokazuje ViewSampleCaseVerification po akcji Sprawdź wyliczenia przy zasiłku chorobowym i ZWZM oraz slot
// porownanie-z-rozstrzygnieciem w kalkulatorze zasiłku macierzyńskiego, więc obie strony pokazują te same kwoty.
// Logika: domena/przykladowe-sprawy/wyliczenie.ts.
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Tabela } from '@/komponenty/tabela';
import { Stos } from '@/komponenty/uklad';
import { formatujDate } from '@/domena/daty';
import { formatujKwote, formatujProcent } from '@/domena/kwoty';
import type {
  OkresWyliczeniaSprawy,
  PorownanieWyliczeniaSprawy,
  PozycjaWyliczeniaSprawy,
  WyliczenieSprawy,
} from '@/domena/przykladowe-sprawy/wyliczenie';
import type { Grosze, SprawaPrzykladowa } from '@/domena/typy';
import { teksty } from '@/teksty';

const T = teksty.ViewSampleCaseVerification.wyliczeniaSprawy;
const SWIADCZENIA = teksty.ViewSampleCaseVerification.swiadczenia;
const URLOPY = teksty.ViewCalcMaternityInput.daneZPrzykladowejSprawy.rodzajeUrlopu;

function nazwaOkresu(o: OkresWyliczeniaSprawy): string {
  if (o.rodzaj === 'zwzm' || o.rodzaj === 'zasilek-chorobowy' || o.rodzaj === 'wynagrodzenie-chorobowe') return T.rodzajeOkresow[o.rodzaj];
  return URLOPY[o.rodzaj];
}

function tekstPorownania(p: PozycjaWyliczeniaSprawy): string {
  if (p.zgodne === null) return T.brakWRozstrzygnieciu;
  if (p.pole === 'kwota' && p.roznica !== undefined) {
    const roznica = formatujKwote(p.roznica);
    return p.zgodne ? T.zgodneRoznica({ roznica }) : T.rozneRoznica({ roznica });
  }
  return p.zgodne ? T.zgodne : T.rozne;
}

export interface WyliczeniaSprawyProps {
  sprawa: SprawaPrzykladowa;
  wyliczenie: WyliczenieSprawy;
  porownanie: PorownanieWyliczeniaSprawy;
  tolerancja: Grosze;
}

export function WyliczeniaSprawy({ sprawa, wyliczenie, porownanie, tolerancja }: WyliczeniaSprawyProps) {
  const okresy = wyliczenie.swiadczenia.flatMap((s) => s.okresy);
  const tytul = sprawa.idSprawy === undefined ? T.tytulPorownaniaBezId : T.tytulPorownania({ id: sprawa.idSprawy });
  return (
    <Stos odstep={6}>
      <Komunikat kod={porownanie.kod} />
      <Karta tytul={tytul} poziomTytulu={2} bezLinii>
        <Stos odstep={4}>
          <Tabela
            podpis={T.podpisPorownania}
            etykietaPrzewijania={T.przewijaniePorownania}
            kolumny={[
              { klucz: 'swiadczenie', naglowek: T.kolumnyPorownania.swiadczenie, tytulowa: true },
              { klucz: 'pole', naglowek: T.kolumnyPorownania.pole },
              { klucz: 'wyliczenie', naglowek: T.kolumnyPorownania.wyliczenie },
              { klucz: 'rozstrzygniecie', naglowek: T.kolumnyPorownania.rozstrzygniecie },
              { klucz: 'porownanie', naglowek: T.kolumnyPorownania.porownanie },
            ]}
            wiersze={porownanie.swiadczenia.flatMap((s) =>
              s.pozycje.map((p, i) => ({
                id: `${s.swiadczenie}-${p.pole}`,
                swiadczenie: i === 0 ? <span className="text-body-strong">{SWIADCZENIA[s.swiadczenie]}</span> : null,
                pole: T.pola[p.pole],
                wyliczenie: p.wyliczenie ?? T.brakWartosci,
                rozstrzygniecie: p.rozstrzygniecie ?? T.brakWartosci,
                porownanie: tekstPorownania(p),
              })),
            )}
          />
          <p className="m-0 text-small text-ink-muted">{T.notaTolerancji({ tolerancja: formatujKwote(tolerancja) })}</p>
        </Stos>
      </Karta>
      <Karta tytul={T.okresyTytul} poziomTytulu={2} bezLinii>
        {wyliczenie.podstawa === null || okresy.length === 0 ? (
          // Z podstawą i bez okresów weryfikacja potwierdza prawo, ale dane sprawy nie mają okresu do wyliczenia.
          <p className="m-0 text-body">{wyliczenie.podstawa === null ? T.brakOkresow : T.brakOkresuWDanych}</p>
        ) : (
          <Stos odstep={4}>
            <p className="m-0 text-body">
              {T.podstawa({ kwota: formatujKwote(wyliczenie.podstawa.kwota), opis: wyliczenie.podstawa.skladniki?.[0]?.opis ?? '' })}
            </p>
            <Tabela
              podpis={T.podpisOkresow}
              etykietaPrzewijania={T.przewijanieOkresow}
              kwoty
              kolumny={[
                { klucz: 'okres', naglowek: T.kolumnyOkresow.okres, tytulowa: true },
                { klucz: 'od', naglowek: T.kolumnyOkresow.od },
                { klucz: 'do', naglowek: T.kolumnyOkresow.do },
                { klucz: 'dni', naglowek: T.kolumnyOkresow.dni, liczbowa: true },
                { klucz: 'stawka', naglowek: T.kolumnyOkresow.stawka, liczbowa: true },
                { klucz: 'miesiecznie', naglowek: T.kolumnyOkresow.miesiecznie, liczbowa: true },
                { klucz: 'suma', naglowek: T.kolumnyOkresow.suma, liczbowa: true },
              ]}
              wiersze={okresy.map((o, i) => ({
                id: `${o.swiadczenie}-${o.rodzaj}-${i}`,
                okres: o.doSumy ? (
                  nazwaOkresu(o)
                ) : (
                  <span className="flex flex-col">
                    <span>{nazwaOkresu(o)}</span>
                    <span className="text-small text-ink-muted">{T.poza}</span>
                  </span>
                ),
                od: formatujDate(o.od),
                do: formatujDate(o.do),
                dni: String(o.dni),
                stawka: formatujProcent(o.stawka),
                miesiecznie: formatujKwote(o.miesiecznie),
                suma: formatujKwote(o.zaOkres),
              }))}
            />
            {wyliczenie.swiadczenia.map((s) => (
              <div key={s.swiadczenie} className="flex flex-col gap-1">
                <p className="m-0 text-body-strong">
                  {T.sumaSwiadczenia({ swiadczenie: SWIADCZENIA[s.swiadczenie], kwota: formatujKwote(s.suma) })}
                </p>
                {s.reguly.map((r, i) => (
                  <p key={`${i}-${r}`} className="m-0 text-small text-ink-muted">
                    {r}
                  </p>
                ))}
              </div>
            ))}
          </Stos>
        )}
      </Karta>
    </Stos>
  );
}
