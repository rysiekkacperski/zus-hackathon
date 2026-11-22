import { Karta } from '@/komponenty/karta';
import { Komunikat } from '@/komponenty/komunikat';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { sciezkaWidoku } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

export interface BrakUprawnienProps {
  // obszar panelu z wzorów P04-15 (katalog) i P18-22 (podmioty wsparcia)
  obszar?: 'katalog' | 'podmioty-wsparcia';
  // cel przycisku, domyślnie ViewFamilyPlan
  href?: string;
}

// Treść w miejscu panelu Administratora dla konta bez roli Administrator, z komunikatem 0047 i bez danych panelu.
export function BrakUprawnien({ obszar = 'katalog', href }: BrakUprawnienProps) {
  const tekst = teksty.wspolne.brakUprawnien;
  const tresc = obszar === 'katalog' ? tekst.katalog : tekst.podmiotyWsparcia;
  return (
    <>
      <NaglowekStrony tytul={tekst.tytul} powrot={false} bezKomunikatowPoPrzejsciu />
      <div className="flex max-w-tresc flex-col gap-7.5">
        <Komunikat kod="0047" />
        <Karta tytul={tresc.naglowek} bezLinii>
          <div className="flex flex-col gap-6">
            <p className="m-0 max-w-190">{tresc.opis}</p>
            <div className="flex flex-wrap gap-4">
              <PrzyciskLink href={href ?? sciezkaWidoku('ViewFamilyPlan')} wariant="glowny">
                {tresc.akcja}
              </PrzyciskLink>
            </div>
          </div>
        </Karta>
      </div>
    </>
  );
}
