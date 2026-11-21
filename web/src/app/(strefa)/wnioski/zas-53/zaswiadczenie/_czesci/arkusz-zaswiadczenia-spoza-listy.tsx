'use client';

// SheetZas53ManualCertificate (kontrakt, tabela 2.3): arkusz na ViewZas53Certificate. Właściciel: u30.
// Okres zaświadczenia w trybie alternatywnym (0239, 0010, 0110) i opcjonalna seria i numer do 20 znaków.
import { useState } from 'react';
import { parsujDate, porownajDaty } from '@/domena/daty';
import type { KodKomunikatu } from '@/domena/typy';
import type { ZaswiadczenieWnioskuZas53 } from '@/domena/wnioski/zas53';
import { formatujDate } from '@/domena/daty';
import { Notatka } from '@/komponenty/notatka';
import { Arkusz } from '@/komponenty/okno';
import { PoleDaty, PoleTekstowe } from '@/komponenty/pole-tekstowe';
import { Przycisk } from '@/komponenty/przycisk';
import { teksty } from '@/teksty';

const t = teksty.SheetZas53ManualCertificate;
const MAKS_NUMERU = 20;

export interface ArkuszZaswiadczeniaSpozaListyProps {
  otwarte: boolean;
  onZamknij: () => void;
  /** Zapis poprawnego zaświadczenia w trybie alternatywnym. */
  onZapisz?: (zaswiadczenie: ZaswiadczenieWnioskuZas53) => void;
  poczatkowe?: ZaswiadczenieWnioskuZas53;
}

type PoleArkusza = 'poczatek' | 'koniec';

export function walidujOkresAlternatywny(
  poczatek: string,
  koniec: string,
): { ok: true; od: string; do: string } | { ok: false; bledy: Partial<Record<PoleArkusza, KodKomunikatu>> } {
  const bledy: Partial<Record<PoleArkusza, KodKomunikatu>> = {};
  const od = poczatek.trim() === '' ? null : parsujDate(poczatek);
  const do_ = koniec.trim() === '' ? null : parsujDate(koniec);
  if (poczatek.trim() === '') bledy.poczatek = '0239';
  else if (od === null) bledy.poczatek = '0010';
  if (koniec.trim() === '') bledy.koniec = '0239';
  else if (do_ === null) bledy.koniec = '0010';
  else if (od !== null && porownajDaty(do_, od) < 0) bledy.koniec = '0110';
  if (Object.keys(bledy).length > 0 || od === null || do_ === null) return { ok: false, bledy };
  return { ok: true, od, do: do_ };
}

export function ArkuszZaswiadczeniaSpozaListy({ otwarte, onZamknij, onZapisz, poczatkowe }: ArkuszZaswiadczeniaSpozaListyProps) {
  return (
    <Arkusz otwarte={otwarte} onZamknij={onZamknij} tytul={teksty.SheetZas53ManualCertificate.tytul} opis={t.opis} etykietaZamkniecia={t.zamknij}>
      {otwarte ? <FormularzArkusza onZamknij={onZamknij} onZapisz={onZapisz} poczatkowe={poczatkowe} /> : null}
    </Arkusz>
  );
}

function FormularzArkusza({
  onZamknij,
  onZapisz,
  poczatkowe,
}: Pick<ArkuszZaswiadczeniaSpozaListyProps, 'onZamknij' | 'onZapisz' | 'poczatkowe'>) {
  const [poczatek, setPoczatek] = useState(poczatkowe ? formatujDate(poczatkowe.od) : '');
  const [koniec, setKoniec] = useState(poczatkowe ? formatujDate(poczatkowe.do) : '');
  const [numer, setNumer] = useState(poczatkowe?.seriaINumer ?? '');
  const [bledy, setBledy] = useState<Partial<Record<PoleArkusza, KodKomunikatu>>>({});

  const zapisz = () => {
    const wynik = walidujOkresAlternatywny(poczatek, koniec);
    if (!wynik.ok) {
      setBledy(wynik.bledy);
      const pierwsze = wynik.bledy.poczatek ? 'zas53-poczatek' : 'zas53-koniec';
      document.getElementById(pierwsze)?.focus();
      return;
    }
    setBledy({});
    const seria = numer.trim().slice(0, MAKS_NUMERU);
    onZapisz?.({ zrodlo: 'tryb-alternatywny', ...(seria ? { seriaINumer: seria } : {}), od: wynik.od, do: wynik.do, kodyLiterowe: [] });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        zapisz();
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap gap-6">
        <PoleDaty
          id="zas53-poczatek"
          etykieta={t.poczatek}
          podpowiedz={t.podpowiedzDaty}
          wartosc={poczatek}
          onZmiana={setPoczatek}
          blad={bledy.poczatek ?? null}
          szerokosc="srednia"
        />
        <PoleDaty
          id="zas53-koniec"
          etykieta={t.koniec}
          podpowiedz={t.podpowiedzDaty}
          wartosc={koniec}
          onZmiana={setKoniec}
          blad={bledy.koniec ?? null}
          szerokosc="srednia"
        />
      </div>
      <PoleTekstowe
        id="zas53-numer"
        etykieta={t.numer}
        podpowiedz={t.podpowiedzNumeru}
        wartosc={numer}
        onZmiana={(w) => setNumer(w.slice(0, MAKS_NUMERU))}
        maksDlugosc={MAKS_NUMERU}
        autoComplete="off"
        szerokosc="srednia"
      />
      <Notatka>{t.notatka}</Notatka>
      <div className="flex flex-wrap justify-end gap-4">
        <Przycisk type="button" wariant="drugorzedny" onClick={onZamknij}>
          {t.anuluj}
        </Przycisk>
        <Przycisk type="submit" wariant="glowny">
          {t.zapisz}
        </Przycisk>
      </div>
    </form>
  );
}
