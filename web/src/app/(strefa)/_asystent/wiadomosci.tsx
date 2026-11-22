'use client';

// Wiadomości panelu ViewAssistantChat według wzorów P28-02 … P28-12: dymek użytkownika, odpowiedź asystenta
// z kartą sprawy, propozycją działania i stopką 0148, komunikaty 0070, 0071, 0256, 0275, 0276 i 0033.
import type { SzczegolyKontekstuAsystenta } from '@/domena/asystent/rozszerzenia-typow';
import { formatujDate, formatujDateICzas } from '@/domena/daty';
import type { IdSprawy, KontekstAsystenta, PropozycjaDzialania, Rola, WiadomoscAsystenta, ZnacznikCzasu } from '@/domena/typy';
import { Ikona } from '@/komponenty/ikona';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { Przycisk, PrzyciskLink, klasyPrzycisku } from '@/komponenty/przycisk';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const T = teksty.ViewAssistantChat;

type SprawaKontekstu = KontekstAsystenta['sprawy'][number];

export interface KontekstWiadomosci {
  rola: Rola;
  sprawy: readonly SprawaKontekstu[];
  szczegoly?: SzczegolyKontekstuAsystenta;
  czasDecyzji: (idWiadomosci: string) => ZnacznikCzasu | undefined;
  /** Przejście z panelu: poniżej 768 px panel zwija się do przycisku (R-AS-PRZEJ). */
  poPrzejsciu: () => void;
  onSprawdz: (idWiadomosci: string) => void;
  onPonow: (idWiadomosci: string) => void;
  zajety: boolean;
}

function Naglowek({ autor, czas }: { autor: string; czas: ZnacznikCzasu }) {
  return (
    <p className="m-0 mb-1 text-small-strong">
      {autor} <span className="font-normal">{formatujDateICzas(czas)}</span>
    </p>
  );
}

export function DymekUzytkownika({ wiadomosc, wyslano }: { wiadomosc: WiadomoscAsystenta; wyslano: boolean }) {
  return (
    <div className="flex flex-col items-end">
      <Naglowek autor={T.ty} czas={wiadomosc.czas} />
      <div className="box-border max-w-[85%] rounded-md bg-brand-tint px-4 py-3">
        <p className="m-0 break-words whitespace-pre-wrap">{wiadomosc.tresc}</p>
      </div>
      {wyslano ? <p className="m-0 mt-1 text-small text-ink-muted">{T.wyslano}</p> : null}
    </div>
  );
}

function StopkaAI() {
  return (
    <p className="m-0 mt-4 flex items-start gap-2 border-t border-line-row pt-3 text-small">
      <Ikona nazwa="iskry-ai" rozmiar={20} className="flex-none text-brand" />
      <span>{teksty.komunikaty['0148']}</span>
    </p>
  );
}

function linkSprawy(idSprawy: IdSprawy) {
  return trasy.ViewCaseDetails({ idSprawy });
}

function tekstStatusu(s: SprawaKontekstu) {
  return teksty.wspolne.etykiety.statusySpraw[s.status];
}

function KartaSprawy({ sprawa, k, instrukcja }: { sprawa: SprawaKontekstu; k: KontekstWiadomosci; instrukcja: boolean }) {
  const naglowek = k.rola === 'drugi-rodzic' ? T.sprawaZWaszegoPlanu : T.sprawaZTwojegoPlanu;
  const sprawaMatki = k.rola === 'drugi-rodzic' && sprawa.rodzic === 'matka';
  const matka = k.szczegoly?.imionaRodzicow.matka;
  return (
    <>
      <p className="m-0 mt-4 mb-2 text-small-strong">{naglowek}</p>
      <div className="rounded-sm bg-surface-card px-4 py-3">
        <p className="m-0 text-body-strong">{sprawa.tytul}</p>
        {sprawaMatki ? (
          <p className="m-0">
            {T.kogoDotyczy({
              kto: matka ? `${teksty.SheetAssistantActionConfirm.kogoDotyczy.matka}, ${matka}` : teksty.SheetAssistantActionConfirm.kogoDotyczy.matka,
            })}
          </p>
        ) : sprawa.termin ? (
          <p className="m-0">
            {sprawa.koszt || sprawa.dniDoTerminu === undefined || sprawa.dniDoTerminu === null
              ? T.termin({ data: formatujDate(sprawa.termin) })
              : T.terminZDniami({ data: formatujDate(sprawa.termin), liczbaDni: String(sprawa.dniDoTerminu) })}
          </p>
        ) : null}
        {sprawa.koszt && !sprawaMatki ? <p className="m-0">{T.kosztSpoznienia({ kwota: sprawa.koszt })}</p> : null}
        {!sprawa.koszt || sprawaMatki ? <p className="m-0">{T.status({ status: tekstStatusu(sprawa).toLowerCase() })}</p> : null}
        <p className="m-0 mt-2 flex flex-wrap gap-x-6 gap-y-2">
          <Odnosnik href={linkSprawy(sprawa.idSprawy)} onClick={k.poPrzejsciu} aria-label={T.szczegolySprawyEtykieta({ tytul: sprawa.tytul })}>
            {T.szczegolySprawy}
          </Odnosnik>
          {instrukcja ? (
            <Odnosnik href={trasy.ViewCaseGuide({ idSprawy: sprawa.idSprawy })} onClick={k.poPrzejsciu}>
              {T.jakZalatwicSprawe}
            </Odnosnik>
          ) : null}
        </p>
      </div>
    </>
  );
}

function ListaSprawy({ pozycje }: { pozycje: { etykieta: string; wartosc: string }[] }) {
  return (
    <dl className="m-0 mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1">
      {pozycje.map((p) => (
        <div key={p.etykieta} className="contents">
          <dt className="text-body-strong">{p.etykieta}</dt>
          <dd className="m-0 min-w-0 break-words">{p.wartosc}</dd>
        </div>
      ))}
    </dl>
  );
}

function KartaPropozycji({ children, idTytulu }: { children: React.ReactNode; idTytulu: string }) {
  return (
    <div role="group" aria-labelledby={idTytulu} className="mt-4 rounded-sm border border-line bg-surface-card px-4 py-3">
      {children}
    </div>
  );
}

function PropozycjaOznaczenia({
  wiadomosc,
  propozycja,
  sprawa,
  k,
}: {
  wiadomosc: WiadomoscAsystenta;
  propozycja: Extract<PropozycjaDzialania, { rodzaj: 'oznacz-sprawe' }>;
  sprawa: SprawaKontekstu | undefined;
  k: KontekstWiadomosci;
}) {
  const idTytulu = `propozycja-${wiadomosc.id}`;
  const tytulSprawy = sprawa?.tytul ?? propozycja.idSprawy;
  const stan = wiadomosc.stanPropozycji ?? 'oczekuje';
  const czas = k.czasDecyzji(wiadomosc.id);
  const zalatwiona = propozycja.status === 'zalatwiona';
  const status = sprawa ? tekstStatusu(sprawa) : '';
  const etykiety = T.etykietySpraw;
  const pozycje = [
    { etykieta: etykiety.sprawa, wartosc: tytulSprawy },
    ...(stan !== 'wykonana' && sprawa?.termin ? [{ etykieta: etykiety.termin, wartosc: formatujDate(sprawa.termin) }] : []),
    ...(sprawa ? [{ etykieta: etykiety.status, wartosc: status }] : []),
  ];
  const szczegoly = (
    <Odnosnik href={linkSprawy(propozycja.idSprawy)} onClick={k.poPrzejsciu} aria-label={T.szczegolySprawyEtykieta({ tytul: tytulSprawy })}>
      {T.szczegolySprawy}
    </Odnosnik>
  );

  if (stan === 'oczekuje') {
    return (
      <KartaPropozycji idTytulu={idTytulu}>
        <p className="m-0 text-small-strong text-brand">{T.proponowaneDzialanie}</p>
        <p id={idTytulu} className="m-0 mt-1 text-body-strong">
          {zalatwiona ? T.oznaczJakoZalatwiona : T.oznaczJakoZlozona}
        </p>
        <ListaSprawy pozycje={pozycje} />
        <p className="m-0 mt-2 flex items-center gap-2">
          <Ikona nazwa="zegar" rozmiar={20} className="text-brand" />
          {T.czekaNaPotwierdzenie}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Przycisk wariant="glowny" onClick={() => k.onSprawdz(wiadomosc.id)}>
            {T.sprawdzIPotwierdz}
          </Przycisk>
          {szczegoly}
        </div>
      </KartaPropozycji>
    );
  }
  const wykonana = stan === 'wykonana';
  return (
    <KartaPropozycji idTytulu={idTytulu}>
      <p className="m-0 text-small-strong text-brand">{wykonana ? T.dzialanieWykonane : T.dzialanieOdrzucone}</p>
      <p id={idTytulu} className="m-0 mt-1 text-body-strong">
        {wykonana ? (zalatwiona ? T.oznaczonoJakoZalatwiona : T.oznaczonoJakoZlozona) : T.nadalDoZrobienia}
      </p>
      <ListaSprawy pozycje={pozycje} />
      {czas ? (
        <p className="m-0 mt-2 flex items-center gap-2">
          <Ikona nazwa={wykonana ? 'sukces' : 'odmowa'} rozmiar={20} className="text-brand" />
          {wykonana ? T.potwierdzono({ czas: formatujDateICzas(czas) }) : T.odrzucono({ czas: formatujDateICzas(czas) })}
        </p>
      ) : null}
      <div className="mt-3">{szczegoly}</div>
    </KartaPropozycji>
  );
}

type KluczPrzejscia = keyof typeof T.przejscia;

function kluczPrzejscia(idWidoku: string, rola: Rola): KluczPrzejscia | null {
  if (idWidoku === 'ViewCalcMaternityInput' && rola === 'nowy-uzytkownik') return 'ViewCalcMaternityInputNowyUzytkownik';
  return idWidoku in T.przejscia ? (idWidoku as KluczPrzejscia) : null;
}

function PropozycjaPrzejscia({
  wiadomosc,
  propozycja,
  sprawa,
  k,
}: {
  wiadomosc: WiadomoscAsystenta;
  propozycja: Extract<PropozycjaDzialania, { rodzaj: 'przejdz' }>;
  sprawa: SprawaKontekstu | undefined;
  k: KontekstWiadomosci;
}) {
  const klucz = kluczPrzejscia(propozycja.idWidoku, k.rola);
  if (klucz === null) return null;
  const opis = T.przejscia[klucz];
  const idTytulu = `propozycja-${wiadomosc.id}`;
  const href = sciezkaWidoku(propozycja.idWidoku, propozycja.parametry);
  const pozycje = sprawa
    ? [
        { etykieta: T.etykietySpraw.sprawa, wartosc: sprawa.tytul },
        ...(sprawa.termin && propozycja.idWidoku === 'ViewZamLeaveType' ? [{ etykieta: T.etykietySpraw.termin, wartosc: formatujDate(sprawa.termin) }] : []),
      ]
    : [];
  return (
    <KartaPropozycji idTytulu={idTytulu}>
      <p className="m-0 text-small-strong text-brand">{T.proponowaneDzialanie}</p>
      <p id={idTytulu} className="m-0 mt-1 text-body-strong">
        {opis.tytul}
      </p>
      {pozycje.length > 0 ? <ListaSprawy pozycje={pozycje} /> : null}
      <p className="m-0 mt-1">{opis.opis}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
        <PrzyciskLink href={href} wariant={sprawa ? 'glowny' : 'drugorzedny'} onClick={k.poPrzejsciu}>
          {opis.akcja}
        </PrzyciskLink>
        {sprawa ? (
          <Odnosnik href={linkSprawy(sprawa.idSprawy)} onClick={k.poPrzejsciu} aria-label={T.szczegolySprawyEtykieta({ tytul: sprawa.tytul })}>
            {T.szczegolySprawy}
          </Odnosnik>
        ) : null}
      </div>
    </KartaPropozycji>
  );
}

function OdpowiedzMerytoryczna({ wiadomosc, k }: { wiadomosc: WiadomoscAsystenta; k: KontekstWiadomosci }) {
  const propozycja = wiadomosc.propozycja;
  const sprawy = (wiadomosc.sprawy ?? [])
    .map((id) => k.sprawy.find((s) => s.idSprawy === id))
    .filter((s): s is SprawaKontekstu => s !== undefined);
  const sprawaPropozycji =
    propozycja?.rodzaj === 'oznacz-sprawe'
      ? k.sprawy.find((s) => s.idSprawy === propozycja.idSprawy)
      : propozycja?.rodzaj === 'przejdz' && propozycja.parametry?.sprawa
        ? k.sprawy.find((s) => s.idSprawy === propozycja.parametry?.sprawa)
        : undefined;
  const instrukcja = propozycja?.rodzaj === 'przejdz' && propozycja.idWidoku === 'ViewCaseGuide';
  const kartySpraw = sprawy.filter((s) => s !== sprawaPropozycji);
  const odrzucona = propozycja?.rodzaj === 'oznacz-sprawe' && wiadomosc.stanPropozycji === 'odrzucona';

  return (
    <div>
      <Naglowek autor={T.asystent} czas={wiadomosc.czas} />
      <div className="rounded-md bg-surface-page p-4">
        <p className="m-0 break-words">{wiadomosc.tresc}</p>
        {propozycja?.rodzaj === 'przejdz' && propozycja.idWidoku === 'ViewProfileSummary' ? (
          <p className="m-0 mt-3">
            <Odnosnik href={sciezkaWidoku('ViewProfileSummary', propozycja.parametry)} onClick={k.poPrzejsciu}>
              {T.otworzProfilRodziny}
            </Odnosnik>
          </p>
        ) : null}
        {kartySpraw.map((s) => (
          <KartaSprawy key={s.idSprawy} sprawa={s} k={k} instrukcja={instrukcja && propozycja.parametry?.idSprawy === s.idSprawy} />
        ))}
        {propozycja?.rodzaj === 'oznacz-sprawe' ? (
          <PropozycjaOznaczenia wiadomosc={wiadomosc} propozycja={propozycja} sprawa={sprawaPropozycji} k={k} />
        ) : null}
        {propozycja?.rodzaj === 'przejdz' ? (
          <PropozycjaPrzejscia wiadomosc={wiadomosc} propozycja={propozycja} sprawa={sprawaPropozycji} k={k} />
        ) : null}
        <StopkaAI />
      </div>
      {odrzucona ? (
        <Notatka className="mt-3">
          <p>{T.niczegoNieZmienilismy}</p>
        </Notatka>
      ) : null}
    </div>
  );
}

function PozaZakresem({ wiadomosc }: { wiadomosc: WiadomoscAsystenta }) {
  const klasy = klasyPrzycisku('drugorzedny', 'pelna');
  return (
    <div>
      <Naglowek autor={T.asystent} czas={wiadomosc.czas} />
      <Komunikat
        kod="0070"
        akcje={
          <div className="flex w-full flex-col gap-3">
            <PrzyciskLink href={trasy.ViewZusQuestion({ z: 'asystent' })} wariant="drugorzedny" szerokosc="pelna">
              {T.kanaly['pytanie-do-zus']}
            </PrzyciskLink>
            <PrzyciskLink href={trasy.ViewZusEVisit()} wariant="drugorzedny" szerokosc="pelna" nowaKarta>
              {T.kanaly['e-wizyta']}
            </PrzyciskLink>
            <a href={`mailto:${T.adresMamaZus}`} className={klasy}>
              {T.kanaly['mama-zus']}
            </a>
            <a href={`tel:${T.numerInfoliniiZus}`} className={klasy}>
              {T.kanaly.infolinia}
            </a>
          </div>
        }
      />
    </div>
  );
}

export function WiadomoscAsystentaWidok({
  wiadomosc,
  poprzednia,
  k,
}: {
  wiadomosc: WiadomoscAsystenta;
  poprzednia?: WiadomoscAsystenta;
  k: KontekstWiadomosci;
}) {
  switch (wiadomosc.kodKomunikatu) {
    case '0071':
      return (
        <Komunikat
          kod="0071"
          akcje={
            <>
              {poprzednia?.autor === 'uzytkownik' ? (
                <Przycisk wariant="drugorzedny" ikona="odswiez" zajety={k.zajety} onClick={() => k.onPonow(poprzednia.id)}>
                  {T.sprobujPonownie}
                </Przycisk>
              ) : null}
              {k.rola === 'nowy-uzytkownik' ? (
                <Odnosnik href={trasy.ViewProfileZusData()} onClick={k.poPrzejsciu}>
                  {T.przejdzDoProfiluNaStart}
                </Odnosnik>
              ) : (
                <Odnosnik href={trasy.ViewFamilyPlan()} onClick={k.poPrzejsciu}>
                  {T.przejdzDoPlanu}
                </Odnosnik>
              )}
            </>
          }
        />
      );
    case '0070':
      return <PozaZakresem wiadomosc={wiadomosc} />;
    case '0275':
    case '0276':
      return (
        <div>
          <Naglowek autor={T.asystent} czas={wiadomosc.czas} />
          <Komunikat kod={wiadomosc.kodKomunikatu} />
        </div>
      );
    case '0256':
      return <PowitanieNowegoUzytkownika czas={wiadomosc.czas} k={k} />;
    case '0033':
      return (
        <div>
          <Naglowek autor={T.asystent} czas={wiadomosc.czas} />
          <Komunikat kod="0033" />
        </div>
      );
    default:
      return <OdpowiedzMerytoryczna wiadomosc={wiadomosc} k={k} />;
  }
}

/** Pierwsza wiadomość panelu Nowego użytkownika: 0256 z akcją Uzupełnij profil na start (KA-14 3.11.1.2.1). */
export function PowitanieNowegoUzytkownika({ czas, k }: { czas: ZnacznikCzasu; k: Pick<KontekstWiadomosci, 'poPrzejsciu'> }) {
  return (
    <div>
      <Naglowek autor={T.asystent} czas={czas} />
      <Komunikat
        kod="0256"
        akcje={
          <PrzyciskLink href={trasy.ViewProfileZusData()} wariant="drugorzedny" onClick={k.poPrzejsciu}>
            {T.uzupelnijProfil}
          </PrzyciskLink>
        }
      />
    </div>
  );
}
