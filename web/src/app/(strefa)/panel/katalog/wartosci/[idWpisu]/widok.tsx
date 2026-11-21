'use client';

// ViewCatalogValueEdit: historia wartości wpisu słownika i dopisanie nowej wartości z datą początku obowiązywania
// (historyjki 3.5.1.2.1 i 3.5.1.2.2). Dostęp konta bez roli Administrator rozstrzyga StrazDostepu (0047).
import { use } from 'react';
import { FormularzWersji } from '@/app/(strefa)/panel/katalog/wartosci/[idWpisu]/_czesci/formularz-wersji';
import { HistoriaWartosci } from '@/app/(strefa)/panel/katalog/wartosci/[idWpisu]/_czesci/historia-wartosci';
import { kotwicaWpisu } from '@/dane/magazyn/operacje/katalog';
import { useDzis, useKatalog } from '@/dane/magazyn/hooki';
import { czyWpisEdytowalny } from '@/domena/katalog/edycja';
import type { WpisSlownika } from '@/domena/typy';
import { Karta } from '@/komponenty/karta';
import { NaglowekStrony } from '@/komponenty/naglowek-strony';
import { Notatka } from '@/komponenty/notatka';
import { PrzyciskLink } from '@/komponenty/przycisk';
import { trasy } from '@/komponenty/rama/trasy';
import { teksty } from '@/teksty';

function adresListy(wpis: WpisSlownika | undefined): string {
  if (wpis === undefined) return trasy.ViewCatalogList();
  return trasy.ViewCatalogList({ zakladka: wpis.slownik === 'kwoty-i-progi' ? 'kwoty' : 'wymiary' });
}

export function WidokZmianyWartosciKatalogu({ params }: { params: PageProps<'/panel/katalog/wartosci/[idWpisu]'>['params'] }) {
  const t = teksty.ViewCatalogValueEdit;
  const { idWpisu } = use(params);
  const katalog = useKatalog();
  const dzis = useDzis();
  const wpis = katalog.slowniki.find((w) => w.id === idWpisu);
  const lista = adresListy(wpis);

  if (wpis === undefined) {
    return (
      <>
        <NaglowekStrony tytul={t.naglowek} powrot={{ href: lista, etykieta: t.powrot }} />
        <Karta className="max-w-tresc">
          <div className="flex flex-col gap-6">
            <p className="m-0">{t.nieZnaleziono}</p>
            <div>
              <PrzyciskLink href={lista} wariant="drugorzedny">
                {t.powrot}
              </PrzyciskLink>
            </div>
          </div>
        </Karta>
      </>
    );
  }

  return (
    <>
      <NaglowekStrony
        tytul={wpis.nazwa}
        wstep={t.slowniki[wpis.slownik]}
        powrot={{ href: `${lista}#${kotwicaWpisu(wpis.id)}`, etykieta: t.powrot }}
      />
      <div className="flex max-w-tresc min-w-0 flex-col gap-7.5">
        <HistoriaWartosci wpis={wpis} katalog={katalog} dzis={dzis} />
        {czyWpisEdytowalny(wpis) ? (
          <FormularzWersji key={wpis.id} wpis={wpis} katalog={katalog} dzis={dzis} adresListy={lista} />
        ) : (
          <Karta>
            <Notatka>
              <p>{t.wartoscWyprowadzona}</p>
            </Notatka>
          </Karta>
        )}
      </div>
    </>
  );
}
