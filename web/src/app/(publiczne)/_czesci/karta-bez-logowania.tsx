// Karta „Bez logowania” strony startowej (ViewGuideStart): przejścia do kalkulatora zasiłku macierzyńskiego
// i do przykładowych spraw ZUS, które działają bez zalogowania. Właściciel: u01.
import { Karta } from '@/komponenty/karta';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

const tekst = teksty.ViewGuideStart.bezLogowania;

export function KartaBezLogowania({ className }: { className?: string }) {
  return (
    <Karta tytul={tekst.tytul} bezLinii className={className}>
      <p className="mt-0 mb-4">{tekst.opis}</p>
      <div className="flex flex-col gap-3">
        <PrzyciskLink
          href={sciezkaWidoku('ViewCalcMaternityInput')}
          wariant="drugorzedny"
          szerokosc="pelna"
          ikona="kalkulator"
        >
          {tekst.kalkulator}
        </PrzyciskLink>
        <PrzyciskLink href={sciezkaWidoku('ViewSampleCaseList')} wariant="drugorzedny" szerokosc="pelna" ikona="folder">
          {tekst.przykladoweSprawy}
        </PrzyciskLink>
      </div>
    </Karta>
  );
}
