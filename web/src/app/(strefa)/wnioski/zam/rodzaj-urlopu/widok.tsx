'use client';

// ViewZamLeaveType (3.9.1.1.1): rozpoczęcie albo wznowienie wniosku ZAM i wybór rodzaju urlopu.
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useDzis, useKonto, useKontekstRodziny } from '@/dane/magazyn/hooki';
import { ustawKomunikatPoPrzejsciu } from '@/dane/magazyn/komunikaty-po-przejsciu';
import { rozpocznijLubWznowZam } from '@/dane/magazyn/operacje/wnioski-zam';
import { pobierzKontekstOperacji } from '@/dane/magazyn/zegar';
import { dodajDni, formatujDate } from '@/domena/daty';
import type { BledyPol, KodKomunikatu, RodzajUrlopu } from '@/domena/typy';
import { daneRodzicaWniosku, dostepneRodzajeUrlopu, sprawdzPrawoDoWnioskuZam } from '@/domena/wnioski/zam';
import { ekranPoZam, nastepnyEkranZam } from '@/domena/wnioski/zam-nawigacja';
import { parametryOkresuZam, TYGODNIE_URLOPU_MACIERZYNSKIEGO } from '@/domena/wnioski/zam-okresy';
import { GrupaOpcji, type OpcjaGrupy } from '@/komponenty/grupa-opcji';
import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Odnosnik } from '@/komponenty/odnosnik';
import { sciezkaWidoku, trasy } from '@/komponenty/rama/trasy';
import { SzkieletWidoku } from '@/komponenty/szkielet-widoku';
import { Ikona } from '@/komponenty/ikona';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { teksty } from '@/teksty';
import {
  BrakWnioskuZam,
  DaneBoczne,
  KomunikatBleduZapisu,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  useKrokiKreatoraZam,
  useWniosekZam,
  usePrzejscieDalej,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../_czesci/kreator';

const t = teksty.ViewZamLeaveType;
const tk = t.kreator;

interface FormularzRodzaju {
  rodzaj: RodzajUrlopu | null;
}

/** Rodzaj urlopu jest wymagany (0006). */
function walidujRodzaj(f: FormularzRodzaju): BledyPol<'rodzaj'> {
  return f.rodzaj === null ? { rodzaj: '0006' } : {};
}

/** Start kreatora z ?sprawa=: sprawdzenie prawa (R1), przekierowanie albo szkic i wznowienie od ostatniego ekranu. */
function StartWnioskuZam({ idSprawy }: { idSprawy: string }) {
  const router = useRouter();
  const konto = useKonto();
  const kontekst = useKontekstRodziny();
  const dzis = useDzis();
  const uruchomiono = useRef(false);
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);

  useEffect(() => {
    if (uruchomiono.current || konto === null) return;
    uruchomiono.current = true;
    const prawo = sprawdzPrawoDoWnioskuZam({ konto, rodzina: kontekst?.rodzina ?? null, idSprawy, dzis });
    if (prawo.cel !== 'ViewZamLeaveType') {
      if (prawo.kod) ustawKomunikatPoPrzejsciu({ kod: prawo.kod, dlaWidoku: prawo.cel });
      if (prawo.cel === 'ViewCaseGuide') router.replace(trasy.ViewCaseGuide({ idSprawy: prawo.idSprawy ?? idSprawy }));
      else if (prawo.cel === 'ViewProfilePayer') router.replace(trasy.ViewProfilePayer({ powrot: trasy.ViewZamLeaveType({ sprawa: idSprawy }) }));
      else router.replace(sciezkaWidoku(prawo.cel));
      return;
    }
    const wynik = rozpocznijLubWznowZam(idSprawy, pobierzKontekstOperacji());
    if (!wynik.ok) {
      queueMicrotask(() => ustawBlad(wynik.kod));
      return;
    }
    router.replace(sciezkaWidoku(nastepnyEkranZam(wynik.wartosc), { wniosek: wynik.wartosc.idWniosku }));
  }, [konto, kontekst, idSprawy, dzis, router]);

  if (blad) {
    return (
      <RamaKreatoraZam ekran="ViewZamLeaveType" wniosek={null} idSprawy={idSprawy} komunikaty={<Komunikat kod={blad} />}>
        <span />
      </RamaKreatoraZam>
    );
  }
  return <SzkieletWidoku />;
}

function opisRodzaju(rodzaj: RodzajUrlopu, dane: DaneWnioskuZam, dzis: string): string {
  const k = dane.okresy;
  const p = parametryOkresuZam(k, dzis);
  const przy = tk.przyLiczbieDzieci[k.liczbaDzieci];
  const tygodnie = TYGODNIE_URLOPU_MACIERZYNSKIEGO[k.liczbaDzieci];
  switch (rodzaj) {
    case 'macierzynski':
      return k.przedPorodem || !k.dataPorodu
        ? t.opisMacierzynskiPrzedPorodem({ tygodnie, przy })
        : t.opisMacierzynski({ dataPorodu: formatujDate(k.dataPorodu), tygodnie, przy });
    case 'rodzicielski':
      if (k.rodzic === 'drugi-rodzic') return t.opisRodzicielskiDrugiegoRodzica;
      return t.opisRodzicielski({ maks: p.rodzicielski.maksTygodni, data: p.rodzicielski.zakres ? formatujDate(p.rodzicielski.zakres.do) : '' });
    case 'uzupelniajacy':
      return t.opisUzupelniajacy({
        tygodnie: k.wymiarUzupelniajacegoTygodni ?? 8,
        od: p.okresMacierzynski ? formatujDate(dodajDni(p.okresMacierzynski.do, 1)) : '',
      });
    case 'ojcowski':
      return t.opisOjcowski({ data: p.ojcowski.zakres ? formatujDate(p.ojcowski.zakres.do) : '' });
    case 'na-warunkach-macierzynskiego':
      return t.opisNaWarunkach;
    default:
      return '';
  }
}

function FormularzRodzajuUrlopu({ dane }: { dane: DaneWnioskuZam }) {
  const dzis = useDzis();
  const { wniosek, kontekst, okresy } = dane;
  const { przejdzDalej, zajety } = usePrzejscieDalej();
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const [rodzaj, ustawRodzaj] = useState<RodzajUrlopu | null>(wniosek.rodzajUrlopu ?? null);
  // Liczba kroków zależy od wybranego rodzaju urlopu (części ekranu okresu), więc liczymy ją z bieżącego wyboru.
  const kroki = useKrokiKreatoraZam({ ...dane, wniosek: { ...wniosek, rodzajUrlopu: rodzaj ?? wniosek.rodzajUrlopu } });
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const walidacja = useWalidacjaNaBiezaco({ wartosci: { rodzaj }, waliduj: walidujRodzaj, pola: { rodzaj: 'zam-rodzaj' } });

  const tryb = okresy.przedPorodem ? 'przed-porodem' : kontekst.rodzina.daneCiazy?.przyjecie ? 'przyjecie' : 'po-porodzie';
  const rola = okresy.rodzic === 'drugi-rodzic' ? 'drugi-rodzic' : 'rodzic';
  const rodzaje = dostepneRodzajeUrlopu(rola, kontekst.rodzina.plan, tryb);
  const opcje: OpcjaGrupy<RodzajUrlopu>[] = rodzaje.map((r) => ({
    wartosc: r,
    etykieta: tk.rodzajeUrlopu[r],
    opis: opisRodzaju(r, dane, dzis),
  }));

  const zmiana = (r: RodzajUrlopu | null) =>
    r === null ? {} : r === wniosek.rodzajUrlopu ? { rodzajUrlopu: r } : { rodzajUrlopu: r, okresy: [], rodzicielski: undefined };

  const dalej = () => {
    if (!walidacja.sprobujWyslac() || rodzaj === null) return;
    const cel = ekranPoZam(wniosek, 'ViewZamLeaveType', okresy.przedPorodem);
    ustawBladZapisu(przejdzDalej(wniosek, zmiana(rodzaj), cel));
  };

  const d = daneRodzicaWniosku(kontekst.rodzina, okresy.rodzic);
  const forma = d.forma && d.forma !== 'brak-tytulu' ? tk.formyZatrudnienia[d.forma] : null;
  const p = parametryOkresuZam(okresy, dzis);
  const daneProfilu: { etykieta: string; wartosc: string }[] = [];
  if (okresy.rodzic === 'drugi-rodzic') daneProfilu.push({ etykieta: t.profil.twojaRola, wartosc: tk.role['drugi-rodzic'] });
  if (okresy.dataPorodu) daneProfilu.push({ etykieta: t.profil.dataPorodu, wartosc: t.profil.potwierdzona({ data: formatujDate(okresy.dataPorodu) }) });
  else if (kontekst.rodzina.daneCiazy?.przewidywanyTerminPorodu) {
    daneProfilu.push({ etykieta: t.profil.przewidywanyTermin, wartosc: formatujDate(kontekst.rodzina.daneCiazy.przewidywanyTerminPorodu) });
  }
  if (okresy.rodzic === 'matka') daneProfilu.push({ etykieta: t.profil.liczbaDzieci, wartosc: String(okresy.liczbaDzieci) });
  if (forma) {
    daneProfilu.push({
      etykieta: t.profil.formaZatrudnienia,
      wartosc: d.dobrowolneChorobowe?.wartosc ? tk.zDobrowolnym({ forma }) : forma,
    });
  }
  daneProfilu.push({ etykieta: t.profil.platnikZasilku, wartosc: tk.platnicy[wniosek.adresat === 'platnik-skladek' ? 'platnik-skladek' : 'zus'] });

  const pokazTermin = okresy.rodzic === 'matka' && !okresy.przedPorodem && p.wariantDostepny && p.terminWariantu && p.dniDoTerminu !== null;

  const boczna = (
    <>
      <Karta tytul={t.profil.tytul} bezLinii>
        <p className="m-0 mb-4">{teksty.wspolne.stanNa({ data: formatujDate(dzis) })}</p>
        <DaneBoczne pozycje={daneProfilu} />
        <div className="mt-6">
          <Odnosnik href={trasy.ViewProfileSummary()}>{t.profil.link}</Odnosnik>
        </div>
      </Karta>
      {pokazTermin ? (
        <Karta tytul={t.kartaTerminu.tytul} bezLinii>
          <div className="flex items-start gap-3">
            <Ikona nazwa="zegar" className="flex-none text-brand" />
            <p className="m-0">
              {t.kartaTerminu.tresc({ data: formatujDate(p.terminWariantu ?? dzis), dni: tk.dni({ liczba: p.dniDoTerminu ?? 0 }) })}
            </p>
          </div>
        </Karta>
      ) : null}
    </>
  );

  const komunikaty = (
    <>
      <KomunikatBleduZapisu kod={bladZapisu} />
      {okresy.przedPorodem && kontekst.rodzina.daneCiazy?.przewidywanyTerminPorodu ? (
        <Komunikat kod="0229" parametry={{ data: formatujDate(dodajDni(kontekst.rodzina.daneCiazy.przewidywanyTerminPorodu, -42)) }} />
      ) : null}
    </>
  );

  return (
    <RamaKreatoraZam ekran="ViewZamLeaveType" wniosek={wniosek} kroki={kroki} komunikaty={komunikaty} boczna={boczna}>
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          dalej();
        }}
      >
        <Karta tytul={t.tytulKarty} bezLinii>
          <p className="m-0 mb-6">{okresy.rodzic === 'drugi-rodzic' ? t.wstepDrugiegoRodzica : t.wstepMatki}</p>
          <GrupaOpcji
            nazwa="zam-rodzaj"
            legenda={t.legenda}
            opcje={opcje}
            wartosc={rodzaj}
            onZmiana={ustawRodzaj}
            {...walidacja.pole('rodzaj')}
            uklad="karty"
          />
          {okresy.rodzic === 'matka' && !okresy.przedPorodem ? (
            <Notatka className="mt-6">{t.notatka}</Notatka>
          ) : null}
        </Karta>
        <PrzyciskiKreatora
          onZapisz={() => ustawBladZapisu(zapiszDoDokonczenia(wniosek, zmiana(rodzaj), 'ViewZamLeaveType'))}
          onDalej={() => undefined}
          zajety={zajety}
        />
      </form>
    </RamaKreatoraZam>
  );
}

export function WidokRodzajuUrlopuZam() {
  const parametry = useSearchParams();
  const idSprawy = parametry.get('sprawa');
  const { idWniosku, dane } = useWniosekZam();
  if (idWniosku === null && idSprawy) return <StartWnioskuZam key={idSprawy} idSprawy={idSprawy} />;
  if (dane === null) return <BrakWnioskuZam ekran="ViewZamLeaveType" />;
  return <FormularzRodzajuUrlopu key={dane.wniosek.idWniosku} dane={dane} />;
}
