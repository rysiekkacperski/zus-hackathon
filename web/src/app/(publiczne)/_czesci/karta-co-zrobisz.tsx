// Karta „Co zrobisz w przewodniku” strony startowej (wzór Main, ViewGuideStart) w wersji zwartej obok karty
// logowania. Właściciel: u01.
import { Ikona, type NazwaIkony } from '@/komponenty/ikona';
import { Karta } from '@/komponenty/karta';
import { Notatka } from '@/komponenty/notatka';
import { teksty } from '@/teksty';

const tekst = teksty.ViewGuideStart.coZrobisz;

const pozycje: { klucz: 'plan' | 'terminy' | 'wnioski'; ikona: NazwaIkony }[] = [
  { klucz: 'plan', ikona: 'plan' },
  { klucz: 'terminy', ikona: 'kalendarz' },
  { klucz: 'wnioski', ikona: 'wnioski' },
];

export function KartaCoZrobisz({ className }: { className?: string }) {
  return (
    <Karta tytul={tekst.tytul} bezLinii className={className}>
      <ul className="m-0 grid list-none gap-3 p-0">
        {pozycje.map(({ klucz, ikona }) => (
          <li key={klucz} className="flex items-start gap-4">
            <Ikona nazwa={ikona} className="flex-none text-brand" />
            <div className="min-w-0">
              <h3 className="m-0 text-body-strong">{tekst[klucz].tytul}</h3>
              <p className="mt-1 mb-0">{tekst[klucz].opis}</p>
            </div>
          </li>
        ))}
      </ul>
      <Notatka className="mt-5">
        <p>{tekst.zgoda}</p>
      </Notatka>
    </Karta>
  );
}
