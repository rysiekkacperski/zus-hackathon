'use client';

// SheetAssistantActionConfirm (kontrakt, tabela 2.3): arkusz na ViewAssistantChat. Właściciel: u31.
// Wzór P28-05: tytuł, opis skutku, lista Działanie, Sprawa, Kogo dotyczy, Termin, Status teraz i po potwierdzeniu,
// notatka o zapisie decyzji, Potwierdź i Odrzuć. Zamknięcie arkusza odrzuca działanie (wzór P28-07).
import { Komunikat } from '@/komponenty/komunikat';
import { Notatka } from '@/komponenty/notatka';
import { Przycisk } from '@/komponenty/przycisk';
import { Arkusz } from '@/komponenty/okno';
import type { KodKomunikatu, RodzicSprawy, StatusSprawy } from '@/domena/typy';
import { formatujDate } from '@/domena/daty';
import { teksty } from '@/teksty';

const T = teksty.SheetAssistantActionConfirm;

export interface SprawaDoPotwierdzenia {
  tytul: string;
  rodzic: RodzicSprawy;
  termin?: string;
  status: StatusSprawy;
}

export interface ArkuszPotwierdzeniaDzialaniaProps {
  otwarte: boolean;
  onZamknij: () => void;
  status?: 'zlozona' | 'zalatwiona';
  sprawa?: SprawaDoPotwierdzenia;
  onPotwierdz?: () => void;
  onOdrzuc?: () => void;
  zajety?: boolean;
  blad?: KodKomunikatu | null;
}

function Wiersz({ etykieta, children, wyrozniony = false }: { etykieta: string; children: React.ReactNode; wyrozniony?: boolean }) {
  return (
    <>
      <dt className="font-semibold text-ink">{etykieta}</dt>
      <dd className={['m-0 min-w-0 break-words', wyrozniony ? 'text-ink-strong' : 'text-ink'].join(' ')}>{children}</dd>
    </>
  );
}

export function ArkuszPotwierdzeniaDzialania({
  otwarte,
  onZamknij,
  status = 'zalatwiona',
  sprawa,
  onPotwierdz,
  onOdrzuc,
  zajety = false,
  blad,
}: ArkuszPotwierdzeniaDzialaniaProps) {
  const statusy = teksty.wspolne.etykiety.statusySpraw;
  return (
    <Arkusz
      otwarte={otwarte}
      onZamknij={onZamknij}
      tytul={T.tytul}
      etykietaZamkniecia={T.zamknij}
      opis={<p className="m-0">{status === 'zalatwiona' ? T.opisZalatwiona : T.opisZlozona}</p>}
      komunikat={blad ? <Komunikat kod={blad} /> : undefined}
      stopka={
        <>
          <Przycisk wariant="glowny" onClick={onPotwierdz} zajety={zajety}>
            {T.potwierdz}
          </Przycisk>
          <Przycisk wariant="drugorzedny" onClick={onOdrzuc} disabled={zajety}>
            {T.odrzuc}
          </Przycisk>
        </>
      }
    >
      {sprawa ? (
        <div className="rounded-sm bg-surface-page px-5 py-4">
          <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2">
            <Wiersz etykieta={T.etykiety.dzialanie}>{status === 'zalatwiona' ? T.dzialanieZalatwiona : T.dzialanieZlozona}</Wiersz>
            <Wiersz etykieta={T.etykiety.sprawa}>{sprawa.tytul}</Wiersz>
            <Wiersz etykieta={T.etykiety.kogoDotyczy}>
              {T.kogoDotyczy[sprawa.rodzic as keyof typeof T.kogoDotyczy] ?? T.kogoDotyczy.matka}
            </Wiersz>
            <Wiersz etykieta={T.etykiety.termin} wyrozniony>
              {sprawa.termin ? formatujDate(sprawa.termin) : T.brakTerminu}
            </Wiersz>
            <Wiersz etykieta={T.etykiety.statusTeraz}>{statusy[sprawa.status]}</Wiersz>
            <Wiersz etykieta={T.etykiety.statusPo}>{statusy[status]}</Wiersz>
          </dl>
        </div>
      ) : null}
      <Notatka>
        <p>{T.notatka}</p>
      </Notatka>
    </Arkusz>
  );
}
