// Karta „Co zrobisz w przewodniku” strony startowej (wzór Main, ViewGuideStart). Właściciel: u01.
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { teksty } from '@/teksty';

const tekst = teksty.ViewGuideStart.coZrobisz;

const pozycje: { klucz: 'plan' | 'terminy' | 'wnioski' | 'kalkulator'; ikona: NazwaIkony }[] = [
  { klucz: 'plan', ikona: 'plan' },
  { klucz: 'terminy', ikona: 'kalendarz' },
  { klucz: 'wnioski', ikona: 'wnioski' },
  { klucz: 'kalkulator', ikona: 'kalkulator' },
];

export function KartaCoZrobisz({ className }: { className?: string }) {
  return (
    <Karta tytul={tekst.tytul} bezLinii className={className}>
      <ul className="m-0 grid list-none gap-3 p-0">
        {pozycje.map(({ klucz, ikona }) => (
          <li key={klucz} className="flex items-start gap-4 rounded-md bg-surface-page px-5 py-4">
            <Ikona nazwa={ikona} className="flex-none text-brand" />
            <div className="min-w-0">
              <h3 className="m-0 text-body-strong">{tekst[klucz].tytul}</h3>
              <p className="mt-1 mb-0">{tekst[klucz].opis}</p>
            </div>
          </li>
        ))}
      </ul>
      <h3 className="mt-6 mb-3 text-body-strong">{tekst.twojeDane}</h3>
      <div className="flex flex-col gap-3">
        <Notatka>
          <p>{tekst.zgoda}</p>
        </Notatka>
        <Notatka>
          <p>{tekst.ustawienia}</p>
        </Notatka>
      </div>
    </Karta>
  );
}
