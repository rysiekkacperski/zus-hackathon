'use client';

// ViewZamStatements (3.9.1.1.4): oświadczenia wniosku ZAM, pełna treść w ModalStatementsText i potwierdzenie.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatujProcent } from '@/domena/kwoty';
import type { BledyPol, KodKomunikatu } from '@/domena/typy';
import { ekranPoZam } from '@/domena/wnioski/zam-nawigacja';
import { Karta } from '@/komponenty/karta';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { useWalidacjaNaBiezaco } from '@/komponenty/walidacja-na-biezaco';
import { formatujDate } from '@/domena/daty';
import { teksty } from '@/teksty';
import {
  adresPoprzedniegoKrokuZam,
  BrakWnioskuZam,
  KartaTwojWniosek,
  KomunikatBleduZapisu,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  useKrokiKreatoraZam,
  useWniosekZam,
  usePrzejscieDalej,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../_czesci/kreator';
import { OknoTresciOswiadczen } from './_czesci/okno-tresci-oswiadczen';

const t = teksty.ViewZamStatements;
const tk = teksty.ViewZamLeaveType.kreator;

/** Potwierdzenie oświadczeń jest wymagane (0043). */
function walidujOswiadczenia(f: { potwierdzone: boolean }): BledyPol<'potwierdzone'> {
  return f.potwierdzone ? {} : { potwierdzone: '0043' };
}

/** Sytuacja matki dziecka we wniosku ZAM ojca o urlop macierzyński przejęty od matki (u34, 3.9.2.1.2 i 3.9.2.2.1). */
function SytuacjaMatki({ przejecie }: { przejecie: NonNullable<DaneWnioskuZam['wniosek']['przejecie']> }) {
  const tp = teksty.ViewFatherTakeover;
  const imieINazwisko = `${przejecie.matka.imie} ${przejecie.matka.nazwisko}`.trim();
  const sytuacje = tp.sytuacje as Partial<Record<string, (p: { data: string }) => string>>;
  const przyczyny = tp.przyczyny as Partial<Record<string, string>>;
  const sytuacja = przejecie.dataZdarzenia ? sytuacje[przejecie.przyczyna] : undefined;
  return (
    <div className="mb-6">
      <h3 className="m-0 mb-2 text-body-strong">{tp.sytuacjaMatkiZam.tytul}</h3>
      <ul className="m-0 flex list-disc flex-col gap-2 pl-6">
        <li>
          {przejecie.przyczyna === 'rezygnacja'
            ? przejecie.dzienZakonczeniaUrlopuMatki
              ? tp.sytuacjaMatkiZam.skrocenie({ data: formatujDate(przejecie.dzienZakonczeniaUrlopuMatki) })
              : tp.przyczyny.rezygnacja
            : sytuacja && przejecie.dataZdarzenia
              ? sytuacja({ data: formatujDate(przejecie.dataZdarzenia) })
              : (przyczyny[przejecie.przyczyna] ?? tp.sytuacjaMatkiZam.tytul)}
        </li>
        {imieINazwisko ? <li>{tp.sytuacjaMatkiZam.matka({ imieINazwisko, pesel: przejecie.matka.pesel ?? '' })}</li> : null}
        {przejecie.zaswiadczeniePlatnikaMatki ? <li>{tp.sytuacjaMatkiZam.zaswiadczenie}</li> : null}
      </ul>
    </div>
  );
}

function FormularzOswiadczen({ dane }: { dane: DaneWnioskuZam }) {
  const router = useRouter();
  const { wniosek, okresy } = dane;
  const { przejdzDalej, zajety } = usePrzejscieDalej();
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const kroki = useKrokiKreatoraZam(dane);
  const [potwierdzone, ustawPotwierdzone] = useState(wniosek.oswiadczeniaPotwierdzone);
  const walidacja = useWalidacjaNaBiezaco({
    wartosci: { potwierdzone },
    waliduj: walidujOswiadczenia,
    pola: { potwierdzone: 'zam-oswiadczenia' },
  });
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const [oknoOtwarte, ustawOknoOtwarte] = useState(false);
  const zaZyciem = okresy.zaZyciem;
  const przyjecie = dane.kontekst.rodzina.daneCiazy?.przyjecie;
  const dzieckoWniosku = wniosek.daneDzieci[0];
  const dziecko = dzieckoWniosku ? `${dzieckoWniosku.imie} ${dzieckoWniosku.nazwisko}`.trim() : '';

  const punktyOkresow =
    wniosek.wariant === 'caly-rodzicielski' && wniosek.okresy.length > 1
      ? [t.punkty.okresCaly]
      : wniosek.okresy.map((o) =>
          t.punkty.okres({ rodzaj: tk.rodzajeUrlopuDopelniacz[o.rodzajUrlopu], stawka: formatujProcent(o.stawka ?? 100) }),
        );

  const dalej = () => {
    if (!walidacja.sprobujWyslac()) return;
    ustawBladZapisu(
      przejdzDalej(
        wniosek,
        { oswiadczeniaPotwierdzone: true, oswiadczenieZaZyciem: zaZyciem ? true : undefined },
        ekranPoZam(wniosek, 'ViewZamStatements', okresy.przedPorodem),
      ),
    );
  };

  return (
    <RamaKreatoraZam
      ekran="ViewZamStatements"
      wniosek={wniosek}
      kroki={kroki}
      komunikaty={<KomunikatBleduZapisu kod={bladZapisu} />}
      boczna={<KartaTwojWniosek dane={dane} pokazOkres pokazDziecko />}
    >
      <form
        noValidate
        className="flex flex-col gap-7.5"
        onSubmit={(e) => {
          e.preventDefault();
          dalej();
        }}
      >
        <Karta tytul={t.tytulKarty} bezLinii>
          <p className="m-0 mb-3">{t.wstep}</p>
          <ul className="m-0 mb-6 flex list-disc flex-col gap-2 pl-6">
            <li>{t.punkty.prawda}</li>
            {punktyOkresow.map((p) => (
              <li key={p}>{p}</li>
            ))}
            {zaZyciem ? <li>{t.punkty.zaZyciem}</li> : null}
            <li>{t.punkty.zmiany}</li>
            <li>{t.punkty.odpowiedzialnosc}</li>
          </ul>
          <p className="m-0 mb-6">
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-left font-semibold text-brand underline hover:text-brand-deep"
              onClick={() => ustawOknoOtwarte(true)}
            >
              {t.pelnaTresc}
            </button>
          </p>
          {przyjecie ? (
            <div className="mb-6">
              <h3 className="m-0 mb-2 text-body-strong">{t.przyjecie.tytul}</h3>
              <p className="m-0">
                {dziecko
                  ? t.przyjecie.tresc({ dziecko, data: formatujDate(przyjecie.dataPrzyjecia) })
                  : t.przyjecie.trescBezImienia({ data: formatujDate(przyjecie.dataPrzyjecia) })}
              </p>
            </div>
          ) : null}
          {wniosek.przejecie ? <SytuacjaMatki przejecie={wniosek.przejecie} /> : null}
          <PoleZaznaczenia
            id="zam-oswiadczenia"
            etykieta={t.potwierdzam}
            zaznaczone={potwierdzone}
            onZmiana={ustawPotwierdzone}
            {...walidacja.pole('potwierdzone')}
          />
        </Karta>
        <PrzyciskiKreatora
          onWstecz={() => router.push(adresPoprzedniegoKrokuZam(kroki, 'ViewZamStatements', wniosek.idWniosku, 'ViewZamData'))}
          onZapisz={() => ustawBladZapisu(zapiszDoDokonczenia(wniosek, { oswiadczeniaPotwierdzone: potwierdzone }, 'ViewZamStatements'))}
          onDalej={() => undefined}
          zajety={zajety}
        />
      </form>
      <OknoTresciOswiadczen otwarte={oknoOtwarte} onZamknij={() => ustawOknoOtwarte(false)} wniosek={wniosek} zaZyciem={zaZyciem} />
    </RamaKreatoraZam>
  );
}

export function WidokOswiadczenZam() {
  const { dane } = useWniosekZam();
  if (dane === null) return <BrakWnioskuZam ekran="ViewZamStatements" />;
  return <FormularzOswiadczen key={dane.wniosek.idWniosku} dane={dane} />;
}
