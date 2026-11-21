'use client';

// ViewZamStatements (3.9.1.1.4): oświadczenia wniosku ZAM, pełna treść w ModalStatementsText i potwierdzenie.
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatujProcent } from '@/domena/kwoty';
import type { KodKomunikatu } from '@/domena/typy';
import { ekranPoZam, ekranPrzedZam } from '@/domena/wnioski/zam-nawigacja';
import { Karta } from '@/komponenty/karta';
import { PoleZaznaczenia } from '@/komponenty/pole-zaznaczenia';
import { teksty } from '@/teksty';
import {
  adresEkranuZam,
  BrakWnioskuZam,
  KartaTwojWniosek,
  KomunikatBleduZapisu,
  PrzyciskiKreatora,
  RamaKreatoraZam,
  useWniosekZam,
  usePrzejscieDalej,
  useZapisDoDokonczenia,
  type DaneWnioskuZam,
} from '../_czesci/kreator';
import { OknoTresciOswiadczen } from './_czesci/okno-tresci-oswiadczen';

const t = teksty.ViewZamStatements;
const tk = teksty.ViewZamLeaveType.kreator;

function FormularzOswiadczen({ dane }: { dane: DaneWnioskuZam }) {
  const router = useRouter();
  const { wniosek, okresy } = dane;
  const przejdzDalej = usePrzejscieDalej();
  const zapiszDoDokonczenia = useZapisDoDokonczenia();
  const [potwierdzone, ustawPotwierdzone] = useState(wniosek.oswiadczeniaPotwierdzone);
  const [blad, ustawBlad] = useState<KodKomunikatu | null>(null);
  const [bladZapisu, ustawBladZapisu] = useState<KodKomunikatu | null>(null);
  const [oknoOtwarte, ustawOknoOtwarte] = useState(false);
  const zaZyciem = okresy.zaZyciem;

  const punktyOkresow =
    wniosek.wariant === 'caly-rodzicielski' && wniosek.okresy.length > 1
      ? [t.punkty.okresCaly]
      : wniosek.okresy.map((o) =>
          t.punkty.okres({ rodzaj: tk.rodzajeUrlopuDopelniacz[o.rodzajUrlopu], stawka: formatujProcent(o.stawka ?? 100) }),
        );

  const dalej = () => {
    if (!potwierdzone) {
      ustawBlad('0043');
      document.getElementById('zam-oswiadczenia')?.focus();
      return;
    }
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
          <PoleZaznaczenia
            id="zam-oswiadczenia"
            etykieta={t.potwierdzam}
            zaznaczone={potwierdzone}
            onZmiana={(z) => {
              ustawPotwierdzone(z);
              ustawBlad(null);
            }}
            blad={blad}
          />
        </Karta>
        <PrzyciskiKreatora
          onWstecz={() => router.push(adresEkranuZam(ekranPrzedZam(wniosek, 'ViewZamStatements') ?? 'ViewZamData', wniosek.idWniosku))}
          onZapisz={() => ustawBladZapisu(zapiszDoDokonczenia(wniosek, { oswiadczeniaPotwierdzone: potwierdzone }, 'ViewZamStatements'))}
          onDalej={() => undefined}
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
